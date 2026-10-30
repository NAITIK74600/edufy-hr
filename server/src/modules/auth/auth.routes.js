import express from 'express'
import { randomUUID, randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { attachOnboardingDocs } from '../../models/onboardingDocsCache.js'
import { hashPassword, verifyPassword } from '../../auth/passwords.js'
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../services/mail.service.js'
import { Employee } from '../../models/Employee.js'

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
      if (existing && existing.passwordHash) {
        return response.status(409).json({ success: false, error: { code: 'DUPLICATE_USER', message: 'An account with this email already exists.' } })
      }

      let assignedEmpId = employeeId ? String(employeeId).trim().toUpperCase() : ''
      if (assignedEmpId) {
        const existingEmp = await userStore.findByEmail(assignedEmpId)
        if (existingEmp && String(existingEmp.email).trim().toLowerCase() !== cleanEmail) {
          if (/^ETS\d+$/i.test(assignedEmpId)) {
            assignedEmpId = ''
          } else {
            return response.status(409).json({ success: false, error: { code: 'DUPLICATE_USER', message: 'An account with this employee ID already exists.' } })
          }
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
        mustChangePassword: true,
      }
      const savedUser = await userStore.addUser(newUser)
      if (!savedUser) throw new Error('Account could not be saved.')

      if (cleanEmail) {
        const rolePath = (role === 'admin') ? 'admin/login' : (role === 'hr' ? 'hr/login' : 'employee/login')
        const publicBase = (process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in').replace(/\/+$/, '')
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

  router.post('/change-password', auth.authenticate, async (request, response, next) => {
    try {
      const { currentPassword, newPassword } = request.body ?? {}
      if (typeof newPassword !== 'string' || newPassword.trim().length < 8) {
        return response.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'New password must be at least 8 characters long.' },
        })
      }

      const userId = request.auth.user.id || request.auth.user._id
      const user = await userStore.findById(userId)
      if (!user) {
        return response.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
        })
      }

      // If user does NOT have mustChangePassword or if currentPassword was provided:
      const needsCurrentCheck = !user.mustChangePassword || Boolean(currentPassword)
      if (needsCurrentCheck) {
        if (!currentPassword || typeof currentPassword !== 'string') {
          return response.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Current password is required.' },
          })
        }
        const { verifyPassword } = await import('../../auth/passwords.js')
        const isValid = user.passwordHash && (
          verifyPassword(currentPassword, user.passwordHash) ||
          verifyPassword(currentPassword.trim(), user.passwordHash)
        )
        if (!isValid) {
          return response.status(400).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect.' },
          })
        }
      }

      const newHash = hashPassword(newPassword.trim())
      let updatedUser = null
      if (userStore.changePassword) {
        updatedUser = await userStore.changePassword(userId, newHash)
      } else if (userStore.resetPassword) {
        updatedUser = await userStore.resetPassword(userId, newHash)
      }

      if (mongoose.connection.readyState === 1) {
        const { Employee } = await import('../../models/Employee.js')
        await Employee.updateOne(
          {
            $or: [
              ...(mongoose.isValidObjectId(userId) ? [{ _id: userId }] : []),
              ...(user.employeeId ? [{ employeeId: user.employeeId }] : []),
              ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
            ],
          },
          { $set: { passwordHash: newHash, mustChangePassword: false }, $inc: { authVersion: 1 } },
        )
      }

      const publicUser = authService.toPublicUser(updatedUser || { ...user, mustChangePassword: false })
      return response.json({
        success: true,
        message: 'Password has been updated successfully.',
        data: { user: publicUser },
      })
    } catch (error) {
      return next(error)
    }
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
          loginUrl: process.env.APP_PUBLIC_URL || 'https://edufyione.edufyitech.in',
        }).catch((err) => console.warn('[MailService] Password reset email notice:', err?.message || err))
      }

      response.json({ success: true, data: { id: target.id } })
    } catch (error) { next(error) }
  })

  // 5. List Registered Passkeys for Current User
  router.get('/passkey/list', auth.authenticate, async (request, response, next) => {
    try {
      const user = await userStore.findById(request.auth.user.id)
      let passkeys = Array.isArray(user?.passkeys) ? user.passkeys : []
      if (passkeys.length === 0 && Employee) {
        try {
          const emp = await Employee.findById(request.auth.user.id).lean()
          if (Array.isArray(emp?.passkeys)) passkeys = emp.passkeys
        } catch {}
      }
      return response.json({
        success: true,
        data: passkeys.map((k) => ({
          credentialId: k.credentialId,
          deviceName: k.deviceName || 'Biometric / Passkey Device',
          createdAt: k.createdAt || new Date(),
        })),
      })
    } catch (error) { next(error) }
  })

  // 6. Delete a Registered Passkey
  router.delete('/passkey/:credentialId', auth.authenticate, async (request, response, next) => {
    try {
      const { credentialId } = request.params
      const user = await userStore.findById(request.auth.user.id)
      if (user) {
        const updated = (user.passkeys || []).filter((k) => k.credentialId !== credentialId)
        await userStore.updateUser(user.id, { passkeys: updated })
      }
      if (Employee) {
        try {
          await Employee.updateOne(
            { _id: request.auth.user.id },
            { $pull: { passkeys: { credentialId } } }
          )
        } catch {}
      }
      return response.json({
        success: true,
        message: 'Passkey removed successfully.',
      })
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

  // ─── PASSKEY / WEBAUTHN AUTHENTICATION ──────────────────
  const passkeyChallenges = new Map()

  function getRpId(request) {
    const rawHost = request.hostname || request.get('host')?.split(':')[0] || 'localhost'
    return rawHost === '127.0.0.1' ? 'localhost' : rawHost
  }

  // 1. Passkey Login Options (Get Challenge)
  router.post('/passkey/login-options', async (request, response, next) => {
    try {
      const { email, identifier, portal } = request.body ?? {}
      const loginIdentifier = (typeof identifier === 'string' && identifier.trim())
        || (typeof email === 'string' && email.trim())
        || ''

      let allowCredentials = []
      let user = null
      if (loginIdentifier) {
        user = await userStore.findByEmail(loginIdentifier)
        if (user && Array.isArray(user.passkeys) && user.passkeys.length > 0) {
          allowCredentials = user.passkeys.map((k) => ({
            id: k.credentialId,
            type: 'public-key',
          }))
        }
      }

      const challengeId = randomUUID()
      const challenge = randomBytes(32).toString('base64url')
      passkeyChallenges.set(challengeId, {
        challenge,
        email: loginIdentifier || user?.email || '',
        portal,
        createdAt: Date.now(),
      })

      // Clean old challenges (> 5 mins)
      for (const [key, val] of passkeyChallenges) {
        if (Date.now() - val.createdAt > 300000) passkeyChallenges.delete(key)
      }

      return response.json({
        success: true,
        data: {
          challengeId,
          challenge,
          rpId: getRpId(request),
          allowCredentials,
          hasRegisteredPasskey: allowCredentials.length > 0,
          timeout: 60000,
          userVerification: 'preferred',
        },
      })
    } catch (error) { next(error) }
  })

  // 2. Passkey Verify Login
  router.post('/passkey/verify-login', async (request, response, next) => {
    try {
      const { challengeId, credential, email, portal } = request.body ?? {}
      if (!challengeId || !credential || !credential.response) {
        return response.status(400).json({ success: false, error: { code: 'INVALID_PASSKEY_PAYLOAD', message: 'Passkey assertion payload is incomplete.' } })
      }

      const session = passkeyChallenges.get(challengeId)
      if (!session) {
        return response.status(400).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Passkey verification session expired. Please try again.' } })
      }
      passkeyChallenges.delete(challengeId)

      // Decode and verify clientDataJSON
      let clientData
      try {
        const clientDataStr = Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf8')
        clientData = JSON.parse(clientDataStr)
      } catch {
        return response.status(400).json({ success: false, error: { code: 'INVALID_CLIENT_DATA', message: 'Malformed clientDataJSON.' } })
      }

      if (clientData.type !== 'webauthn.get' && clientData.type !== 'webauthn.create') {
        return response.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Invalid WebAuthn operation.' } })
      }

      if (clientData.challenge !== session.challenge) {
        return response.status(400).json({ success: false, error: { code: 'CHALLENGE_MISMATCH', message: 'Security challenge mismatch. Authentication rejected.' } })
      }

      // Locate user by email, or search users with this credentialId
      const targetEmail = (email && typeof email === 'string' && email.trim()) || session.email
      let user = null
      if (targetEmail) {
        user = await userStore.findByEmail(targetEmail)
      }
      if (!user && credential.id) {
        const found = await Employee.findOne({ 'passkeys.credentialId': credential.id }).lean()
        if (found) user = await userStore.findById(found._id)
      }

      if (!user) {
        return response.status(401).json({
          success: false,
          error: {
            code: 'PASSKEY_NOT_FOUND',
            message: 'No registered passkey found for this account. Please sign in with your email and password first to enroll this device.',
          },
        })
      }

      if (user.status === 'inactive') {
        return response.status(403).json({ success: false, error: { code: 'ACCOUNT_INACTIVE', message: 'This employee account is inactive.' } })
      }

      // Check strict portal access
      const userRole = user.role
      const targetPortal = portal || session.portal
      if (targetPortal === 'admin' && userRole !== 'admin') {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into Admin portal.' } })
      }
      if (targetPortal === 'hr' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into HR portal.' } })
      }
      if (targetPortal === 'management' && !['hr', 'admin'].includes(userRole)) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Access denied: Employee credentials cannot be used to log into Management Console.' } })
      }
      if (targetPortal === 'employee' && ['admin', 'hr'].includes(userRole)) {
        return response.status(403).json({ success: false, error: { code: 'PORTAL_ACCESS_DENIED', message: 'Administrative accounts must sign into the Management Console.' } })
      }

      const result = authService.issueToken(user)
      return response.json({ success: true, data: result })
    } catch (error) { next(error) }
  })

  // 3. Passkey Register Options (Generate challenge to enroll device)
  router.post('/passkey/register-options', async (request, response, next) => {
    try {
      const { email, password } = request.body ?? {}
      let user = null

      if (request.headers.authorization?.startsWith('Bearer ')) {
        try {
          await new Promise((resolve, reject) => auth.authenticate(request, response, (err) => err ? reject(err) : resolve()))
          user = request.auth.user
        } catch {}
      }

      if (!user) {
        if (!email || !password) {
          return response.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Enter your email and password to link a new passkey device.' } })
        }
        const candidate = await userStore.findByEmail(email)
        const passwordValid = candidate && candidate.passwordHash && verifyPassword(password, candidate.passwordHash)
        if (!candidate || !passwordValid) {
          return response.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } })
        }
        user = candidate
      }

      const challengeId = randomUUID()
      const challenge = randomBytes(32).toString('base64url')
      passkeyChallenges.set(challengeId, {
        challenge,
        userId: String(user.id || user._id),
        email: user.email,
        isRegister: true,
        createdAt: Date.now(),
      })

      const userIdBase64 = Buffer.from(String(user.id || user._id)).toString('base64url')
      const rpId = getRpId(request)

      return response.json({
        success: true,
        data: {
          challengeId,
          challenge,
          rp: { name: 'Edufyi Tech Solutions', id: rpId },
          user: {
            id: userIdBase64,
            name: user.email,
            displayName: user.displayName || user.name || user.email,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            userVerification: 'preferred',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      })
    } catch (error) { next(error) }
  })

  // 4. Passkey Verify Registration & Save Credential
  router.post('/passkey/register-verify', async (request, response, next) => {
    try {
      const { challengeId, credential, deviceName } = request.body ?? {}
      if (!challengeId || !credential || !credential.response) {
        return response.status(400).json({ success: false, error: { code: 'INVALID_PASSKEY_PAYLOAD', message: 'Passkey registration payload is incomplete.' } })
      }

      const session = passkeyChallenges.get(challengeId)
      if (!session || !session.isRegister) {
        return response.status(400).json({ success: false, error: { code: 'CHALLENGE_EXPIRED', message: 'Passkey registration session expired. Please try again.' } })
      }
      passkeyChallenges.delete(challengeId)

      let clientData
      try {
        const clientDataStr = Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf8')
        clientData = JSON.parse(clientDataStr)
      } catch {
        return response.status(400).json({ success: false, error: { code: 'INVALID_CLIENT_DATA', message: 'Malformed clientDataJSON.' } })
      }

      if (clientData.type !== 'webauthn.create') {
        return response.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Expected webauthn.create registration.' } })
      }

      if (clientData.challenge !== session.challenge) {
        return response.status(400).json({ success: false, error: { code: 'CHALLENGE_MISMATCH', message: 'Security challenge mismatch.' } })
      }

      const user = await userStore.findById(session.userId)
      if (!user) {
        return response.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found.' } })
      }

      const newPasskey = {
        credentialId: credential.id,
        publicKey: credential.response.attestationObject ? credential.response.attestationObject.slice(0, 500) : '',
        counter: 0,
        deviceName: (typeof deviceName === 'string' && deviceName.trim()) ? deviceName.trim() : 'Biometric / Passkey Device',
        createdAt: new Date(),
      }

      try {
        await Employee.updateOne(
          { _id: user.id || user._id },
          { $push: { passkeys: newPasskey } }
        )
      } catch {}

      const existingPasskeys = Array.isArray(user.passkeys) ? user.passkeys : []
      await userStore.updateUser(user.id, {
        passkeys: [...existingPasskeys.filter((k) => k.credentialId !== credential.id), newPasskey],
      })

      const refreshedUser = await userStore.findById(user.id)
      const result = authService.issueToken(refreshedUser || user)

      return response.json({
        success: true,
        data: {
          ...result,
          message: 'Passkey registered successfully! You can now sign in with your fingerprint, Face ID, or security key.',
        },
      })
    } catch (error) { next(error) }
  })

  return router
}
