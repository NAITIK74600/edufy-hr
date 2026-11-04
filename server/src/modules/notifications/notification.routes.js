import express from 'express'
import mongoose from 'mongoose'
import { Notification } from '../../models/Notification.js'
import { PushSubscription } from '../../models/PushSubscription.js'
import { workspaceModels } from '../../models/Workspace.js'
import {
  createUnifiedNotification,
  broadcastUnifiedNotification,
  getVapidPublicKey,
  notificationBus,
} from '../../services/unifiedNotification.service.js'

export function createNotificationRouter({ auth }) {
  const router = express.Router()

  // 1. Get VAPID Public Key for PWA Push Registration
  router.get('/vapid-public-key', (req, res) => {
    const publicKey = getVapidPublicKey() || process.env.VAPID_PUBLIC_KEY || ''
    return res.json({
      success: true,
      publicKey,
      data: {
        publicKey,
        enabled: Boolean(publicKey),
      },
    })
  })

  // All endpoints below require authentication
  router.use(auth.authenticate)

  // Real-time SSE event stream for instantaneous updates across portals
  router.get('/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()

    const user = req.auth.user
    const candidateIds = new Set([
      user.employeeId,
      user.id,
      user._id ? String(user._id) : null,
      user.email,
    ].filter(Boolean).map((s) => String(s).toLowerCase()))

    const userRole = String(user.role || 'employee').toLowerCase()
    const isLeadership = ['admin', 'hr', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole)
    const isManager = isLeadership || ['manager', 'revenue_growth_manager', 'senior_manager', 'team_lead'].includes(userRole)

    // Send connected handshake
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)

    const onNotification = (notif) => {
      try {
        if (!notif) return
        const targetRec = String(notif.recipientId || notif.employeeId || notif.ownerId || '').toLowerCase()
        const recRole = String(notif.recipientRole || '').toLowerCase()

        let matches = false
        if (targetRec && candidateIds.has(targetRec)) {
          matches = true
        } else if (recRole === 'all') {
          matches = true
        } else if (recRole === 'management' && (isLeadership || isManager)) {
          matches = true
        } else if (recRole === 'director' && ['director', 'managing_director', 'co_founder'].includes(userRole)) {
          matches = true
        } else if (recRole === 'hr' && (userRole === 'hr' || userRole === 'admin')) {
          matches = true
        } else if (recRole === 'admin' && userRole === 'admin') {
          matches = true
        } else if (recRole === userRole) {
          matches = true
        }

        if (matches) {
          res.write(`data: ${JSON.stringify({ type: 'notification', data: notif })}\n\n`)
        }
      } catch (err) {
        // Stream writing failed, client probably disconnected
      }
    }

    notificationBus.on('new_notification', onNotification)

    // Keep-alive heartbeat every 25 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`)
      } catch {
        clearInterval(heartbeat)
      }
    }, 25000)

    req.on('close', () => {
      clearInterval(heartbeat)
      notificationBus.off('new_notification', onNotification)
    })
  })

  // 2. Register or update device push subscription
  router.post('/push-subscription', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)
      const sub = req.body?.subscription || req.body || {}
      const endpoint = req.body?.endpoint || sub?.endpoint
      const keys = req.body?.keys || sub?.keys
      const platform = req.body?.platform || sub?.platform || 'web'
      const deviceType = req.body?.deviceType || sub?.deviceType || 'web'
      const userAgent = req.body?.userAgent || sub?.userAgent || req.headers['user-agent'] || null
      const preferences = req.body?.preferences || sub?.preferences

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required push subscription endpoint or cryptographic keys.' },
        })
      }

      const subscription = await PushSubscription.findOneAndUpdate(
        { endpoint },
        {
          $set: {
            employeeId,
            keys,
            userAgent: userAgent || req.headers['user-agent'] || null,
            platform: platform || 'web',
            deviceType: deviceType || 'web',
            active: true,
            lastUsedAt: new Date(),
            ...(preferences ? { preferences } : {}),
          },
        },
        { upsert: true, new: true }
      )

      return res.status(200).json({
        success: true,
        data: {
          id: subscription._id,
          employeeId: subscription.employeeId,
          active: subscription.active,
          preferences: subscription.preferences,
          message: 'Device push subscription registered successfully.',
        },
      })
    } catch (err) {
      return next(err)
    }
  })

  // 3. Unsubscribe device
  router.delete('/push-subscription', async (req, res, next) => {
    try {
      const { endpoint } = req.body || {}
      if (endpoint) {
        await PushSubscription.updateOne({ endpoint }, { $set: { active: false } })
      }
      return res.json({ success: true, message: 'Push subscription deactivated.' })
    } catch (err) {
      return next(err)
    }
  })

  // 4. Get & update notification preferences
  router.get('/preferences', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)
      const sub = await PushSubscription.findOne({ employeeId, active: true }).sort({ updatedAt: -1 }).lean()
      return res.json({
        success: true,
        data: sub?.preferences || {
          gps: true,
          network: true,
          attendance: true,
          announcements: true,
          leave: true,
          tasks: true,
          payroll: true,
          hr: true,
        },
      })
    } catch (err) {
      return next(err)
    }
  })

  router.patch('/preferences', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)
      const preferences = req.body || {}
      await PushSubscription.updateMany(
        { employeeId },
        { $set: { preferences } }
      )
      return res.json({ success: true, data: preferences, message: 'Notification preferences updated.' })
    } catch (err) {
      return next(err)
    }
  })

  // 5. Query user notifications with category filter & pagination
  router.get('/', async (req, res, next) => {
    try {
      const user = req.auth.user
      const candidateIds = Array.from(new Set([
        user.employeeId,
        user.id,
        user._id ? String(user._id) : null,
        user.email,
      ].filter(Boolean)))

      const { category, unreadOnly, limit = 50, page = 1 } = req.query

      const userMatches = candidateIds.flatMap((cid) => [
        { recipientId: cid },
        { employeeId: cid },
        { ownerId: cid },
      ])

      const userRole = String(user.role || 'employee').toLowerCase()
      const isLeadership = ['admin', 'hr', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole)
      const isManager = isLeadership || ['manager', 'revenue_growth_manager', 'senior_manager', 'team_lead'].includes(userRole)

      if (isLeadership) {
        userMatches.push(
          { recipientRole: 'management' },
          { recipientRole: 'leadership' },
          { recipientRole: 'all' },
          { recipientRole: user.role },
          ...(userRole === 'managing_director' || userRole === 'director' ? [{ recipientRole: 'director' }, { recipientRole: 'managing_director' }] : []),
          ...(userRole === 'admin' ? [{ recipientRole: 'hr' }, { recipientRole: 'director' }] : [])
        )
      } else if (isManager) {
        userMatches.push(
          { recipientRole: 'management' },
          { recipientRole: 'all' },
          { recipientRole: user.role }
        )
      } else {
        userMatches.push(
          { recipientRole: 'all' },
          { recipientRole: 'employee' }
        )
      }

      const query = { $or: userMatches }

      if (category && category !== 'all') {
        query.category = category
      }

      if (unreadOnly === 'true' || unreadOnly === '1') {
        query.read = false
      }

      const skip = (Math.max(1, Number(page)) - 1) * Number(limit)
      const [items, total, unreadCount] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, read: false }),
      ])

      return res.json({
        success: true,
        data: items.map((item) => ({
          id: item.notificationId || String(item._id),
          _id: String(item._id),
          title: item.title || item.event || 'Notification',
          message: item.message || '',
          category: item.category || 'system',
          type: item.category || item.eventType || 'notification',
          eventType: item.eventType,
          priority: item.priority || 'normal',
          read: Boolean(item.read || item.readAt),
          time: item.createdAt,
          createdAt: item.createdAt,
          targetUrl: item.targetUrl,
          pushDeliveryStatus: item.pushDeliveryStatus,
        })),
        meta: {
          total,
          unreadCount,
          page: Number(page),
          limit: Number(limit),
        },
      })
    } catch (err) {
      return next(err)
    }
  })

  // 6. Mark single notification read
  router.patch('/:id/read', async (req, res, next) => {
    try {
      const { id } = req.params
      const user = req.auth.user
      const candidateIds = Array.from(new Set([
        user.employeeId,
        user.id,
        user._id ? String(user._id) : null,
        user.email,
      ].filter(Boolean)))

      const userMatches = candidateIds.flatMap((cid) => [
        { recipientId: cid },
        { employeeId: cid },
        { ownerId: cid },
      ])

      const idConditions = [{ notificationId: id }]
      if (mongoose.isValidObjectId(id)) {
        idConditions.push({ _id: id })
      }

      await Notification.updateOne(
        {
          $and: [
            { $or: idConditions },
            { $or: userMatches },
          ],
        },
        {
          $set: { read: true, readAt: new Date() },
        }
      )

      if (workspaceModels?.notifications) {
        await workspaceModels.notifications.updateOne(
          {
            $and: [
              { $or: idConditions },
              { $or: userMatches },
            ],
          },
          { $set: { read: true } }
        ).catch(() => {})
      }

      return res.json({ success: true, message: 'Notification marked as read.' })
    } catch (err) {
      return next(err)
    }
  })

  // 7. Delete single notification
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params
      const user = req.auth.user
      const candidateIds = Array.from(new Set([
        user.employeeId,
        user.id,
        user._id ? String(user._id) : null,
        user.email,
      ].filter(Boolean)))

      const userMatches = candidateIds.flatMap((cid) => [
        { recipientId: cid },
        { employeeId: cid },
        { ownerId: cid },
      ])

      const idConditions = [{ notificationId: id }]
      if (mongoose.isValidObjectId(id)) {
        idConditions.push({ _id: id })
      }

      await Notification.deleteOne({
        $and: [
          { $or: idConditions },
          { $or: userMatches },
        ],
      })

      if (workspaceModels?.notifications) {
        await workspaceModels.notifications.deleteOne({
          $and: [
            { $or: idConditions },
            { $or: userMatches },
          ],
        }).catch(() => {})
      }

      return res.json({ success: true, message: 'Notification removed.' })
    } catch (err) {
      return next(err)
    }
  })

  // 8. Mark all notifications read
  router.patch('/read-all', async (req, res, next) => {
    try {
      const user = req.auth.user
      const candidateIds = Array.from(new Set([
        user.employeeId,
        user.id,
        user._id ? String(user._id) : null,
        user.email,
      ].filter(Boolean)))

      const userMatches = candidateIds.flatMap((cid) => [
        { recipientId: cid },
        { employeeId: cid },
        { ownerId: cid },
      ])

      await Notification.updateMany(
        {
          $or: userMatches,
          read: false,
        },
        {
          $set: { read: true, readAt: new Date() },
        }
      )

      if (workspaceModels?.notifications) {
        await workspaceModels.notifications.updateMany(
          {
            $or: userMatches,
            read: false,
          },
          {
            $set: { read: true },
          }
        ).catch(() => {})
      }

      return res.json({ success: true, message: 'All notifications marked as read.' })
    } catch (err) {
      return next(err)
    }
  })

  // 9. Clear all notifications
  router.delete('/clear-all', async (req, res, next) => {
    try {
      const user = req.auth.user
      const candidateIds = Array.from(new Set([
        user.employeeId,
        user.id,
        user._id ? String(user._id) : null,
        user.email,
      ].filter(Boolean)))

      const userMatches = candidateIds.flatMap((cid) => [
        { recipientId: cid },
        { employeeId: cid },
        { ownerId: cid },
      ])

      await Notification.deleteMany({
        $or: userMatches,
      })

      if (workspaceModels?.notifications) {
        await workspaceModels.notifications.deleteMany({
          $or: userMatches,
        }).catch(() => {})
      }

      return res.json({ success: true, message: 'Notifications cleared.' })
    } catch (err) {
      return next(err)
    }
  })

  // 10. Admin Broadcast Notification
  router.post('/broadcast', async (req, res, next) => {
    try {
      const user = req.auth.user
      if (!['admin', 'hr', 'director', 'managing_director'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Only administrators and HR managers can broadcast notifications.' },
        })
      }

      const { title, message, category, targetType, targetValue, employeeIds, targetUrl } = req.body || {}
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          error: { message: 'Broadcast requires both title and message.' },
        })
      }

      const result = await broadcastUnifiedNotification({
        title,
        message,
        category: category || 'announcement',
        eventType: 'ADMIN_BROADCAST',
        targetType: targetType || 'all',
        targetValue,
        employeeIds,
        targetUrl: targetUrl || '#/employee/announcements',
        idempotencyKey: `broadcast_${Date.now()}`,
      })

      return res.json({
        success: true,
        data: result,
        message: `Broadcast successfully sent to ${result.totalSent} employee(s).`,
      })
    } catch (err) {
      return next(err)
    }
  })

  // 11. Test Push to My Device
  router.post('/test-push', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)
      const uniqueTestKey = `test_push_${employeeId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      const result = await createUnifiedNotification({
        employeeId,
        title: 'Edufyi HR Push Test',
        message: `Hello ${user.displayName || user.name || 'there'}! Real-time device push notifications are working perfectly on this device.`,
        category: 'system',
        eventType: 'TEST_PUSH',
        targetUrl: '#/employee',
        priority: 'high',
        idempotencyKey: uniqueTestKey,
      })

      return res.json({
        success: true,
        data: result,
        message: 'Test notification triggered.',
      })
    } catch (err) {
      return next(err)
    }
  })

  return router
}
