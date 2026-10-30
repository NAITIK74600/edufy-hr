import { Notification } from '../models/Notification.js'
import { PushSubscription } from '../models/PushSubscription.js'
import { workspaceModels } from '../models/Workspace.js'

let webpushInstance = null
let isVapidInitialized = false

export async function getWebPush() {
  if (webpushInstance) return webpushInstance
  try {
    const mod = await import('web-push')
    webpushInstance = mod.default || mod
    initWebPush()
    return webpushInstance
  } catch (err) {
    console.warn('⚠️ [Web Push Module Notice]: web-push not yet installed in node_modules. Push notifications deferred. Bell notifications active.')
    return null
  }
}

export function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@edufyitech.in'

  if (webpushInstance && publicKey && privateKey) {
    try {
      webpushInstance.setVapidDetails(subject, publicKey, privateKey)
      isVapidInitialized = true
      console.log('✅ Web Push VAPID initialized successfully.')
    } catch (err) {
      console.warn('⚠️ Web Push VAPID initialization warning:', err.message)
    }
  }
}

// Attempt lazy initialization
getWebPush().catch(() => {})

/**
 * Creates and delivers a unified notification:
 * 1. Saves to MongoDB for Website Notification Bell
 * 2. Delivers Device Push Notification via Web Push API
 * 3. Enforces idempotency to avoid duplicate notifications
 */
export async function createUnifiedNotification({
  employeeId,
  recipientId,
  title,
  message,
  category = 'system',
  eventType,
  relatedEntityId = null,
  targetUrl = null,
  priority = 'normal',
  idempotencyKey = null,
  metadata = {},
  recipientRole = null,
}) {
  const targetRecipientId = String(employeeId || recipientId || '')
  if (!targetRecipientId && !recipientRole) {
    throw new Error('Notification requires an employeeId or recipientRole.')
  }

  // 1. Idempotency check: prevent duplicate notifications
  if (idempotencyKey) {
    const existing = await Notification.findOne({ idempotencyKey }).lean()
    if (existing) {
      return existing
    }
  }

  const notificationId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  // 2. Persist notification in MongoDB
  const notificationDoc = await Notification.create({
    notificationId,
    recipientId: targetRecipientId,
    ownerId: targetRecipientId,
    employeeId: targetRecipientId,
    title,
    message,
    category,
    eventType,
    relatedEntityId: relatedEntityId ? String(relatedEntityId) : null,
    targetUrl,
    priority,
    read: false,
    readAt: null,
    pushDeliveryStatus: 'pending',
    idempotencyKey,
    metadata,
  })

  // Also sync to WorkspaceNotification model for backward compatibility
  try {
    if (workspaceModels?.notifications) {
      await workspaceModels.notifications.create({
        ownerId: targetRecipientId,
        recipientId: targetRecipientId,
        title,
        message,
        type: category,
        read: false,
        event: eventType,
        entityId: relatedEntityId ? String(relatedEntityId) : null,
        dedupeKey: idempotencyKey || notificationId,
        recipientRole: recipientRole || null,
      })
    }
  } catch (err) {
    console.warn('[Notification Mirror Notice]:', err.message)
  }

  // 3. Send Web Push to registered devices
  let pushStatus = 'skipped'
  if (targetRecipientId) {
    try {
      pushStatus = await deliverDevicePush(targetRecipientId, {
        notificationId,
        title,
        message,
        category,
        eventType,
        targetUrl,
        idempotencyKey,
      })
    } catch (pushErr) {
      console.warn('[Web Push Delivery Error]:', pushErr.message)
      pushStatus = 'failed'
    }
  }

  // Update delivery status on record
  if (pushStatus !== 'pending') {
    await Notification.updateOne({ _id: notificationDoc._id }, { $set: { pushDeliveryStatus: pushStatus } })
  }

  return {
    ...notificationDoc.toObject(),
    pushDeliveryStatus: pushStatus,
  }
}

/**
 * Delivers Web Push notification to all active devices registered for an employee
 */
async function deliverDevicePush(employeeId, { notificationId, title, message, category, eventType, targetUrl, idempotencyKey }) {
  const subscriptions = await PushSubscription.find({
    employeeId,
    active: true,
  })

  if (!subscriptions || subscriptions.length === 0) {
    return 'skipped'
  }

  const wp = await getWebPush()
  if (!wp || !isVapidInitialized) {
    return 'skipped'
  }

  const payload = JSON.stringify({
    notificationId,
    title,
    body: message,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: idempotencyKey || notificationId,
    data: {
      notificationId,
      targetUrl: targetUrl || '#/employee',
      category,
      eventType,
    },
  })

  let deliveredCount = 0
  let failedCount = 0

  for (const sub of subscriptions) {
    if (sub.preferences && sub.preferences[category] === false) {
      continue
    }

    try {
      await wp.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload,
        {
          TTL: 86400,
          urgency: 'high',
        }
      )
      deliveredCount++
      await PushSubscription.updateOne({ _id: sub._id }, { $set: { lastUsedAt: new Date() } })
    } catch (err) {
      failedCount++
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.log(`[Web Push] Pruning expired subscription endpoint: ${sub.endpoint.slice(0, 30)}...`)
        await PushSubscription.updateOne({ _id: sub._id }, { $set: { active: false } })
      } else {
        console.warn(`[Web Push Send Warning]: ${err.message}`)
      }
    }
  }

  if (deliveredCount > 0) return 'delivered'
  if (failedCount > 0) return 'failed'
  return 'skipped'
}

/**
 * Broadcasts a notification to multiple employees, departments, or roles
 */
export async function broadcastUnifiedNotification({
  targetType = 'all',
  targetValue = null,
  employeeIds = [],
  title,
  message,
  category = 'announcement',
  eventType = 'ADMIN_BROADCAST',
  targetUrl = null,
  priority = 'normal',
  idempotencyKey = null,
}) {
  let recipients = []

  const { Employee } = await import('../models/Employee.js')

  if (targetType === 'all') {
    recipients = await Employee.find({ status: 'active' }).select('_id employeeId').lean()
  } else if (targetType === 'department' && targetValue) {
    recipients = await Employee.find({ department: targetValue, status: 'active' }).select('_id employeeId').lean()
  } else if (targetType === 'role' && targetValue) {
    recipients = await Employee.find({ role: targetValue, status: 'active' }).select('_id employeeId').lean()
  } else if (Array.isArray(employeeIds) && employeeIds.length > 0) {
    recipients = employeeIds.map((id) => ({ employeeId: id, _id: id }))
  }

  const results = []
  for (const emp of recipients) {
    const empId = emp.employeeId || String(emp._id)
    const empDedupe = idempotencyKey ? `${idempotencyKey}_${empId}` : null
    try {
      const notif = await createUnifiedNotification({
        employeeId: empId,
        title,
        message,
        category,
        eventType,
        targetUrl,
        priority,
        idempotencyKey: empDedupe,
      })
      results.push(notif)
    } catch (err) {
      console.warn(`[Broadcast to ${empId} error]:`, err.message)
    }
  }

  return {
    totalSent: results.length,
    recipientCount: recipients.length,
  }
}

// ==============================================================
// DOMAIN-SPECIFIC DISPATCHERS
// ==============================================================

/**
 * 1. GPS & Location Events
 */
export async function dispatchGpsNotification({ employeeId, eventType, distance = null, campus = 'Office', details = '' }) {
  const titles = {
    GPS_DISCONNECTED: 'GPS Signal Lost',
    GPS_PERMISSION_DENIED: 'Location Permission Denied',
    GPS_VERIFICATION_FAILED: 'Location Verification Failed',
    OUTSIDE_GEOFENCE: 'Outside Office Geofence',
    GPS_RESTORED: 'GPS Signal Restored',
    OFFICE_LOCATION_VERIFIED: 'Office Location Verified',
  }

  const messages = {
    GPS_DISCONNECTED: 'Device GPS signal was interrupted while on duty. Please ensure Location Services are active.',
    GPS_PERMISSION_DENIED: 'Browser location permission was denied. Please enable location to maintain attendance compliance.',
    GPS_VERIFICATION_FAILED: 'Real-time GPS coordinates could not be verified against the office geofence.',
    OUTSIDE_GEOFENCE: distance ? `You are ${distance}m away (outside office geofence). Attendance timer is paused.` : 'You are currently outside the registered office boundary.',
    GPS_RESTORED: 'Real-time GPS signal re-acquired. Attendance location tracking resumed.',
    OFFICE_LOCATION_VERIFIED: `Physical presence successfully verified at ${campus}.`,
  }

  const today = new Date().toISOString().slice(0, 10)
  const dedupeKey = `${today}_gps_${eventType}_${employeeId}`

  return createUnifiedNotification({
    employeeId,
    title: titles[eventType] || 'GPS Notice',
    message: details || messages[eventType] || 'GPS update recorded.',
    category: 'gps',
    eventType,
    targetUrl: '#/employee/attendance',
    priority: eventType.includes('FAILED') || eventType.includes('OUTSIDE') ? 'high' : 'normal',
    idempotencyKey: dedupeKey,
  })
}

/**
 * 2. Office Network Events
 */
export async function dispatchNetworkNotification({ employeeId, eventType, networkName = 'Office Wi-Fi', subnet = '', details = '' }) {
  const titles = {
    OFFICE_WIFI_FAILED: 'Office Wi-Fi Required',
    OFFICE_NETWORK_DISCONNECTED: 'Office Wi-Fi Disconnected',
    IP_SUBNET_MISMATCH: 'Network Subnet Mismatch',
    NETWORK_RESTORED: 'Office Network Restored',
    OFFICE_NETWORK_AUTH: 'Office Network Verified',
  }

  const messages = {
    OFFICE_WIFI_FAILED: `Attendance requires connection to authorized office Wi-Fi (${networkName}).`,
    OFFICE_NETWORK_DISCONNECTED: 'Your device disconnected from office Wi-Fi. Attendance timer may pause.',
    IP_SUBNET_MISMATCH: `Device IP is outside verified office gateway subnet ${subnet ? `(${subnet})` : ''}.`,
    NETWORK_RESTORED: `Successfully reconnected to authorized office Wi-Fi (${networkName}).`,
    OFFICE_NETWORK_AUTH: `Authenticated on office network: ${networkName}.`,
  }

  const today = new Date().toISOString().slice(0, 10)
  const dedupeKey = `${today}_net_${eventType}_${employeeId}`

  return createUnifiedNotification({
    employeeId,
    title: titles[eventType] || 'Network Notice',
    message: details || messages[eventType] || 'Network status update.',
    category: 'network',
    eventType,
    targetUrl: '#/employee/attendance',
    priority: eventType.includes('DISCONNECTED') || eventType.includes('FAILED') ? 'high' : 'normal',
    idempotencyKey: dedupeKey,
  })
}

/**
 * 3. Attendance & Auto-Punch-Out Warnings
 */
export async function dispatchAttendanceNotification({ employeeId, eventType, minutesDisconnected = 0, record = {} }) {
  const titles = {
    ATTENDANCE_INTERRUPTED: 'Attendance Connection Interrupted',
    ATTENDANCE_WARNING_15: 'Attendance Reminder: Disconnected (15m)',
    ATTENDANCE_WARNING_60: 'Attendance Warning: Disconnected (1 hr)',
    ATTENDANCE_WARNING_110: 'CRITICAL ALERT: Auto Punch Out in 10 Mins',
    AUTO_PUNCH_OUT_COMPLETED: 'Auto Punch Out Completed',
    ATTENDANCE_RESTORED: 'Attendance Connection Restored',
  }

  const messages = {
    ATTENDANCE_INTERRUPTED: 'Office GPS & Wi-Fi connection lost while checked in. Please reconnect to resume work timer.',
    ATTENDANCE_WARNING_15: 'You have been disconnected from office network for 15 minutes. Timer is paused.',
    ATTENDANCE_WARNING_60: 'Disconnected for 1 hour. If disconnected for 2 hours, your shift will automatically close.',
    ATTENDANCE_WARNING_110: 'WARNING: You have been disconnected for 110 minutes. The system will automatically punch you out in 10 minutes.',
    AUTO_PUNCH_OUT_COMPLETED: 'Your attendance was automatically closed after 2 hours disconnected from office GPS & Wi-Fi.',
    ATTENDANCE_RESTORED: 'Reconnected to office network. Active work counter has resumed.',
  }

  const today = record.date || new Date().toISOString().slice(0, 10)
  const dedupeKey = `${today}_att_${eventType}_${employeeId}`

  return createUnifiedNotification({
    employeeId,
    title: titles[eventType] || 'Attendance Notice',
    message: messages[eventType] || 'Attendance status updated.',
    category: 'attendance',
    eventType,
    targetUrl: '#/employee/attendance',
    priority: eventType === 'ATTENDANCE_WARNING_110' || eventType === 'AUTO_PUNCH_OUT_COMPLETED' ? 'urgent' : 'high',
    idempotencyKey: dedupeKey,
    metadata: {
      minutesDisconnected,
      date: today,
    },
  })
}

/**
 * 4. HR & Employee Events (Leaves, Tasks, Payroll, Announcements)
 */
export async function dispatchHrNotification({
  employeeId,
  eventType,
  title,
  message,
  category = 'hr',
  targetUrl = null,
  relatedEntityId = null,
}) {
  return createUnifiedNotification({
    employeeId,
    title,
    message,
    category,
    eventType,
    relatedEntityId,
    targetUrl,
    priority: 'normal',
    idempotencyKey: `${eventType}_${relatedEntityId || ''}_${employeeId}_${Date.now().toString(36)}`,
  })
}
