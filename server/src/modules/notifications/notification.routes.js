import express from 'express'
import { Notification } from '../../models/Notification.js'
import { PushSubscription } from '../../models/PushSubscription.js'
import {
  createUnifiedNotification,
  broadcastUnifiedNotification,
} from '../../services/unifiedNotification.service.js'

export function createNotificationRouter({ auth }) {
  const router = express.Router()

  // 1. Get VAPID Public Key for PWA Push Registration
  router.get('/vapid-public-key', (req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY || ''
    return res.json({
      success: true,
      data: {
        publicKey,
        enabled: Boolean(publicKey),
      },
    })
  })

  // All endpoints below require authentication
  router.use(auth.authenticate)

  // 2. Register or update device push subscription
  router.post('/push-subscription', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)
      const { endpoint, keys, userAgent, platform, deviceType, preferences } = req.body || {}

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
      const employeeId = user.employeeId || user.id || String(user._id)
      const { category, unreadOnly, limit = 40, page = 1 } = req.query

      const query = {
        $or: [
          { recipientId: employeeId },
          { employeeId: employeeId },
          { ownerId: employeeId },
        ],
      }

      if (['admin', 'hr', 'director', 'manager'].includes(user.role)) {
        query.$or.push(
          { recipientRole: 'management' },
          { recipientRole: 'all' },
          { recipientRole: user.role }
        )
      } else {
        query.$or.push({ recipientRole: 'all' })
      }

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
          title: item.title,
          message: item.message,
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
      const employeeId = user.employeeId || user.id || String(user._id)

      await Notification.updateOne(
        {
          $or: [{ _id: id }, { notificationId: id }],
          $or: [{ recipientId: employeeId }, { employeeId }, { ownerId: employeeId }],
        },
        {
          $set: { read: true, readAt: new Date() },
        }
      )

      return res.json({ success: true, message: 'Notification marked as read.' })
    } catch (err) {
      return next(err)
    }
  })

  // 7. Mark all notifications read
  router.patch('/read-all', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)

      await Notification.updateMany(
        {
          $or: [{ recipientId: employeeId }, { employeeId }, { ownerId: employeeId }],
          read: false,
        },
        {
          $set: { read: true, readAt: new Date() },
        }
      )

      return res.json({ success: true, message: 'All notifications marked as read.' })
    } catch (err) {
      return next(err)
    }
  })

  // 8. Clear all notifications
  router.delete('/clear-all', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)

      await Notification.deleteMany({
        $or: [{ recipientId: employeeId }, { employeeId }, { ownerId: employeeId }],
      })

      return res.json({ success: true, message: 'Notifications cleared.' })
    } catch (err) {
      return next(err)
    }
  })

  // 9. Admin Broadcast Notification
  router.post('/broadcast', async (req, res, next) => {
    try {
      const user = req.auth.user
      if (!['admin', 'hr', 'director'].includes(user.role)) {
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

  // 10. Test Push to My Device
  router.post('/test-push', async (req, res, next) => {
    try {
      const user = req.auth.user
      const employeeId = user.employeeId || user.id || String(user._id)

      const result = await createUnifiedNotification({
        employeeId,
        title: 'Edufyi HR Push Test',
        message: `Hello ${user.displayName || user.name || 'there'}! Real-time device push notifications are working perfectly on this device.`,
        category: 'system',
        eventType: 'TEST_PUSH',
        targetUrl: '#/employee',
        priority: 'high',
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
