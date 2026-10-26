import express from 'express'
import { randomUUID } from 'node:crypto'
import mongoose from 'mongoose'
import { attachOnboardingDocs } from '../../models/onboardingDocsCache.js'
import { hashPassword } from '../../auth/passwords.js'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../services/mail.service.js'

export function createAuthRouter({ authService, auth, userStore }) {
  const router = express.Router()

  router.get('/users', auth.authenticate, async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin or HR can view user accounts.' } })
      }
      return response.json({ success: true, data: (await userStore.listUsers()).map(authService.toPublicUser) })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/login', async (request, response, next) => {
    try {
      const { email, username, identifier, password, portal } = request.body ?? {}
      const loginIdentifier = (typeof identifier === 'string' && identifier.trim())
        || (typeof email === 'string' && email.trim())
        || (typeof username === 'string' && username.trim())
        || ''

      if (!loginIdentifier || typeof password !== 'string' || !password) {
        return response.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } })
      }
      const result = await authService.login(loginIdentifier, password)

      // Strict portal separation
      const userRole = result?.user?.role
      if (portal === 'admin' && userRole !== 'admin') {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the Admin portal. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'hr' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the HR portal. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'management' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Employee credentials cannot be used to log into the Management Console. Please use Employee Self-Service.',
          },
        })
      }

      if (portal === 'employee' && ['admin', 'hr'].includes(userRole)) {
        return response.status(403).json({
          success: false,
          error: {
            code: 'PORTAL_ACCESS_DENIED',
            message: 'Access denied: Administrative (Admin/HR) accounts must sign into the Management Console. Please switch to the Management portal.',
          },
        })
      }

      return response.json({ success: true, data: result })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/users', auth.authenticate, async (request, response, next) => {
    try {
      if (request.auth.user.role !== 'admin' && request.auth.user.role !== 'hr') {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin or HR can create user login credentials.' } })
      }

      const { email, password, name, displayName, role = 'employee', employeeId, department, designation, username } = request.body ?? {}
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== 'string' || password.length < 8) {
        return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } })
      }
      if (role === 'admin') {
        return response.status(400).json({ success: false, error: { code: 'INVALID_ROLE', message: 'Admin accounts cannot be provisioned via this endpoint.' } })
      }

      const cleanEmail = String(email).trim().toLowerCase()
      const existing = await userStore.findByEmail(cleanEmail)
      if (existing) {
        return response.status(409).json({ success: false, error: { code: 'DUPLICATE_USER', message: 'An account with this email already exists.' } })
      }

      let assignedEmpId = employeeId ? String(employeeId).trim().toUpperCase() : ''
      if (assignedEmpId) {
        const existingEmp = await userStore.findByEmail(assignedEmpId)
        if (existingEmp) {
          return response.status(409).json({ success: false, error: { code: 'DUPLICATE_USER', message: 'An account with this employee ID already exists.' } })
        }
      }
      if (!assignedEmpId) {
        let maxCode = 21200
        const allList = (await userStore.listUsers?.()) || []
        for (const u of allList) {
          const m = String(u.employeeId || '').match(/^ETS(\d+)$/i)
          if (m) {
            const n = parseInt(m[1], 10)
            if (n >= maxCode) maxCode = n
          }
        }
        assignedEmpId = `ETS${maxCode + 1}`
      }

      const newUser = {
        id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        employeeId: assignedEmpId,
        name: String(name || displayName || cleanEmail.split('@')[0]).trim(),
        displayName: String(displayName || name || cleanEmail.split('@')[0]).trim(),
        username: username ? String(username).trim().toLowerCase() : cleanEmail.split('@')[0],
        email: cleanEmail,
        role: role || 'employee',
        department: department || 'General',
        designation: designation || 'Staff Member',
        status: 'active',
        passwordHash: hashPassword(password),
      }
      const savedUser = await userStore.addUser(newUser)
      if (!savedUser) throw new Error('Account could not be saved.')

      if (cleanEmail) {
        const rolePath = (role === 'admin') ? 'admin/login' : (role === 'hr' ? 'hr/login' : 'employee/login')
        const publicBase = (process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com').replace(/\/+$/, '')
        const portalUrl = `${publicBase}/#/${rolePath}`

        sendWelcomeEmail({
          employee: {
            name: newUser.name,
            displayName: newUser.displayName,
            email: cleanEmail,
            employeeId: assignedEmpId,
            designation: newUser.designation,
            department: newUser.department,
            role: newUser.role,
          },
          temporaryPassword: password,
          loginUrl: portalUrl,
        })
          .then(() => console.log(`[MailService:SUCCESS] Account creation welcome email dispatched directly to ${cleanEmail}`))
          .catch((err) => console.error(`[MailService:ERROR] Failed sending account creation email to ${cleanEmail}:`, err?.message || err))
      }

      return response.status(201).json({ success: true, data: authService.toPublicUser(savedUser) })
    } catch (error) {
      return next(error)
    }
  })

  router.get('/me', auth.authenticate, async (request, response, next) => {
    try {
      const user = { ...request.auth.user }
      if (mongoose.connection.readyState === 1) await attachOnboardingDocs(user)
      return response.json({ success: true, data: { user: authService.toPublicUser ? authService.toPublicUser(user) : user } })
    } catch (error) { return next(error) }
  })

  router.post('/users/:id/password', auth.authenticate, async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin or HR can reset employee passwords.' } })
      }
      const password = request.body?.password
      if (typeof password !== 'string' || password.length < 8) {
        return response.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Enter a password of at least eight characters.' } })
      }
      const target = await userStore.findById(request.params.id)
      if (!target) {
        return response.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Target account not found.' } })
      }
      // Non-admin HR can reset employee, manager, lead, director passwords but cannot reset admin accounts
      if (request.auth.user.role === 'hr' && target.role === 'admin') {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'HR cannot reset Administrator account passwords.' } })
      }
      if (!userStore.resetPassword) throw Object.assign(new Error('Password persistence is unavailable.'), { statusCode: 503, code: 'DATABASE_UNAVAILABLE' })
      const updated = await userStore.resetPassword(target.id, hashPassword(password))
      if (!updated) throw Object.assign(new Error('Account could not be updated. Refresh and try again.'), { statusCode: 409, code: 'ACCOUNT_CHANGED' })

      if (target.email) {
        sendPasswordResetEmail({
          employee: target,
          newPassword: password,
          loginUrl: process.env.APP_PUBLIC_URL || 'https://empoyee.edufyitechsolutions.com',
        }).catch((err) => console.warn('[MailService] Password reset email notice:', err?.message || err))
      }

      response.json({ success: true, data: { id: target.id } })
    } catch (error) { next(error) }
  })

  router.delete('/users/:id', auth.authenticate, async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin or HR can delete user accounts.' } })
      }
      const target = await userStore.findById(request.params.id)
      if (!target) {
        return response.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Target account not found.' } })
      }
      if (['admin', 'hr'].includes(target.role) && request.auth.user.role !== 'admin') {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only an Administrator can delete administrative accounts.' } })
      }
      if (String(target.id) === String(request.auth.user.id)) {
        return response.status(400).json({ success: false, error: { code: 'FORBIDDEN_SELF_DELETION', message: 'You cannot delete your own account.' } })
      }
      await userStore.deleteUser(request.params.id)
      return response.json({ success: true, data: { id: request.params.id } })
    } catch (error) { next(error) }
  })

  router.post('/logout', auth.authenticate, (request, response) => {
    authService.logout(request.auth.claims.jti)
    return response.status(204).send()
  })

  return router
}
