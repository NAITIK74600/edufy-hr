import express from 'express'
import { createTransporter, sendTestEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../../services/mail.service.js'

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

  // 3. Send Welcome / Account Creation Credentials Email (Admin & HR only)
  router.post('/welcome', auth.authenticate, async (req, res, next) => {
    try {
      const user = req.auth.user
      if (!['admin', 'hr'].includes(user.role)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin and HR can send credentials emails.' } })
      }

      const { employee, temporaryPassword, loginUrl } = req.body || {}
      if (!employee || !employee.email) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Employee with valid email is required.' } })
      }

      const result = await sendWelcomeEmail({
        employee,
        temporaryPassword,
        loginUrl: loginUrl || process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com',
      })

      res.json({
        success: true,
        data: {
          recipient: employee.email,
          messageId: result.messageId,
          simulated: Boolean(result.simulated),
          message: result.simulated
            ? `Welcome email simulated (check server logs).`
            : `Welcome credentials email successfully delivered to ${employee.email}.`,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  // 4. Send Password Reset / Update Email (Admin & HR only)
  router.post('/reset-password', auth.authenticate, async (req, res, next) => {
    try {
      const user = req.auth.user
      if (!['admin', 'hr'].includes(user.role)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin and HR can send password reset emails.' } })
      }

      const { employee, temporaryPassword, loginUrl } = req.body || {}
      const target = employee || req.body?.user
      if (!target || !target.email) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Recipient with valid email is required.' } })
      }

      const result = await sendPasswordResetEmail({
        employee: target,
        temporaryPassword,
        loginUrl: loginUrl || process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com',
      })

      res.json({
        success: true,
        data: {
          recipient: target.email,
          messageId: result.messageId,
          simulated: Boolean(result.simulated),
          message: result.simulated
            ? `Password update email simulated.`
            : `Password update email successfully delivered to ${target.email}.`,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}

export default createMailRouter
