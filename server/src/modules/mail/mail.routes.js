import express from 'express'
import { createTransporter, sendTestEmail } from '../../services/mail.service.js'

export function createMailRouter({ auth }) {
  const router = express.Router()

  // 1. Get SMTP Configuration Status (Admin & HR only)
  router.get('/status', auth.authenticate, async (req, res, next) => {
    try {
      const user = req.auth.user
      if (!['admin', 'hr'].includes(user.role)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Mail configuration status is restricted to Admin and HR.' } })
      }

      const hrTransporter = createTransporter('hr')
      const adminTransporter = createTransporter('admin')

      const host = process.env.SMTP_HOST || 'smtp.gmail.com'
      const port = process.env.SMTP_PORT || '587'

      res.json({
        success: true,
        data: {
          host,
          port,
          hrSender: {
            email: hrTransporter.user,
            configured: hrTransporter.configured,
          },
          adminSender: {
            email: adminTransporter.user,
            configured: adminTransporter.configured,
          },
          ready: hrTransporter.configured || adminTransporter.configured,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  // 2. Send Test Email (Admin & HR only)
  router.post('/test', auth.authenticate, async (req, res, next) => {
    try {
      const user = req.auth.user
      if (!['admin', 'hr'].includes(user.role)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin and HR can send test emails.' } })
      }

      const to = req.body?.to || user.email
      const senderType = req.body?.senderType === 'admin' ? 'admin' : 'hr'

      const result = await sendTestEmail({ to, senderType })

      res.json({
        success: true,
        data: {
          recipient: to,
          senderType,
          messageId: result.messageId,
          simulated: Boolean(result.simulated),
          message: result.simulated
            ? `Test email simulated (SMTP credentials pending real app password in .env). Check server logs.`
            : `Test email successfully dispatched to ${to} via ${senderType.toUpperCase()} channel.`,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}

export default createMailRouter
