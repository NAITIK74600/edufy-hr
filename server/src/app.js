import fs from 'node:fs'
import express from 'express'
import path from 'node:path'

let compressionMiddleware = null
try {
  const comp = await import('compression')
  compressionMiddleware = comp.default || comp
} catch {
  // compression optional if node_modules not yet updated
}
let helmetMiddleware = null
try {
  const h = await import('helmet')
  helmetMiddleware = h.default || h
} catch {
  // helmet optional if node_modules not yet updated
}
import { createPayrollRouter } from './modules/payroll/payroll.routes.js'
import { createWorkspaceRouter } from './modules/workspace/workspace.routes.js'
import crypto from 'node:crypto'
import healthRouter from './routes/health.js'
import { createDataEvents } from './routes/events.js'
import { createAccessRouter } from './routes/access.js'
import { createAuthMiddleware } from './middleware/auth.js'
import { createUserStore } from './auth/userStore.js'
import { createMongoUserStore } from './auth/mongoUserStore.js'
import { createSeedUsers } from './auth/seedUsers.js'
import { createAuthService } from './modules/auth/auth.service.js'
import { createAuthRouter } from './modules/auth/auth.routes.js'
import { createMongoEmployeeRepository } from './modules/employees/employee.repository.js'
import { createMemoryEmployeeRepository } from './modules/employees/memoryEmployeeRepository.js'
import { createEmployeeService } from './modules/employees/employee.service.js'
import { createEmployeeRouter } from './modules/employees/employee.routes.js'
import { createMongoLeaveRepository } from './modules/leave/leave.repository.js'
import { createMemoryLeaveRepository } from './modules/leave/memoryLeaveRepository.js'
import { createLeaveService } from './modules/leave/leave.service.js'
import { createLeaveRouter } from './modules/leave/leave.routes.js'
import { seedLeavePolicies } from './modules/leave/leave.seed.js'
import { createHierarchyRouter } from './modules/hierarchy/hierarchy.routes.js'
import { createMailRouter } from './modules/mail/mail.routes.js'
import { createNotificationRouter } from './modules/notifications/notification.routes.js'
import { createCalendarRouter } from './modules/calendar/calendar.routes.js'
import { googleCalendarService } from './modules/calendar/googleCalendar.service.js'
import { createMongoAttendanceRepository } from './modules/attendance/attendance.repository.js'
import { createMemoryAttendanceRepository } from './modules/attendance/memoryAttendanceRepository.js'
import { createAttendanceService } from './modules/attendance/attendance.service.js'
import { createAttendanceRouter } from './modules/attendance/attendance.routes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { seedAllEmployees } from './modules/employees/seedAllEmployees.js'
import { sanitizeMiddleware } from './middleware/sanitize.js'
import { createRateLimiter } from './middleware/rateLimit.js'
import { PERMISSIONS } from './auth/permissions.js'

export function createApp(options = {}) {
  const app = express()
  app.set('trust proxy', options.trustProxy ?? (process.env.TRUST_PROXY === 'false' ? false : true))
  const useDatabase = options.useDatabase ?? Boolean(process.env.MONGODB_URI)
  const managementUsers = createSeedUsers(process.env)
  const managementStore = createUserStore(managementUsers)
  const databaseStore = useDatabase ? createMongoUserStore({ managementUsers }) : null
  const allowedAccount = (user) => (user && user.role) ? user : null
  app.locals.initializeDatabase = async () => {
    await databaseStore?.initialize()
    if (databaseStore) {
      await seedLeavePolicies()
      await seedAllEmployees()
      try {
        const { Notification } = await import('./models/Notification.js')
        const { workspaceModels } = await import('./models/Workspace.js')
        try {
          const indexes = await Notification.collection.indexes()
          const badIdx = indexes.find((i) => i.name === 'idempotencyKey_1' && !i.sparse)
          if (badIdx) {
            console.log('[server] Dropping non-sparse idempotencyKey_1 index on Notification...')
            await Notification.collection.dropIndex('idempotencyKey_1')
          }
        } catch {}
        await Notification.collection.createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true }).catch(() => {})
        await Notification.updateMany({ idempotencyKey: null }, { $unset: { idempotencyKey: '' } })
        if (workspaceModels?.notifications) {
          try {
            const wIndexes = await workspaceModels.notifications.collection.indexes()
            const badWIdx = wIndexes.find((i) => i.name === 'dedupeKey_1' && !i.sparse)
            if (badWIdx) {
              console.log('[server] Dropping non-sparse dedupeKey_1 index on WorkspaceNotification...')
              await workspaceModels.notifications.collection.dropIndex('dedupeKey_1')
            }
          } catch {}
          await workspaceModels.notifications.collection.createIndex({ dedupeKey: 1 }, { unique: true, sparse: true }).catch(() => {})
          await workspaceModels.notifications.updateMany({ dedupeKey: null }, { $unset: { dedupeKey: '' } })
        }
      } catch (notifCleanErr) {
        console.warn('[server] Clean null idempotency keys notice:', notifCleanErr.message)
      }
      try {
        const { AttendanceRecord } = await import('./models/AttendanceRecord.js')
        const { AttendanceSettings } = await import('./models/AttendanceSettings.js')
        // Clean up any historical airtel/dji wifiSSID in attendancerecords
        await AttendanceRecord.updateMany(
          { $or: [{ wifiSSID: { $regex: /airtel|dji|3052/i } }, { wifiSSID: /^edufyi$/i }] },
          { $set: { wifiSSID: 'Edufyi' } }
        )
        // Clean up any historical bloated repeating notes in attendancerecords
        try {
          const bloatedNotesRecords = await AttendanceRecord.find({ notes: { $regex: /Auto Punch Out.*Auto Punch Out/i } }).select('_id notes').lean()
          if (bloatedNotesRecords.length > 0) {
            console.log(`[server] Cleaning up ${bloatedNotesRecords.length} bloated attendance notes...`)
            for (const rec of bloatedNotesRecords) {
              const parts = [...new Set(rec.notes.split(/\s*\|\s*/).map((p) => p.trim()).filter(Boolean))]
              const clean = parts.slice(0, 4).join(' | ').slice(0, 500)
              await AttendanceRecord.updateOne({ _id: rec._id }, { $set: { notes: clean } })
            }
          }
        } catch {}
        // Clean up AttendanceSettings
        const settings = await AttendanceSettings.findOne({ key: 'office' }) || await AttendanceSettings.findOne().sort({ updatedAt: -1 })
        if (settings) {
          let dirty = false
          if (settings.attendanceRules?.offlineAutoPunchOutEnabled || settings.attendanceRules?.geofenceAutoPunchOutEnabled) {
            settings.attendanceRules.offlineAutoPunchOutEnabled = false
            settings.attendanceRules.geofenceAutoPunchOutEnabled = false
            dirty = true
          }
          if (settings.offlineAutoPunchOutEnabled || settings.geofenceAutoPunchOutEnabled) {
            settings.offlineAutoPunchOutEnabled = false
            settings.geofenceAutoPunchOutEnabled = false
            dirty = true
          }
          if (app.locals.attendanceService?.updateConfig) {
            app.locals.attendanceService.updateConfig(settings.toObject ? settings.toObject() : settings)
          }
          if (Array.isArray(settings.allowedWifiSSIDs)) {
            const cleaned = [...new Set(settings.allowedWifiSSIDs.map((s) => /airtel|dji|3052/i.test(s) ? 'Edufyi' : s).filter(Boolean))]
            if (!cleaned.includes('edufyi')) cleaned.unshift('edufyi')
            settings.allowedWifiSSIDs = cleaned
            dirty = true
          }
          if (Array.isArray(settings.officeNetworkIPs)) {
            settings.officeNetworkIPs.forEach((entry) => {
              if (/airtel|dji/i.test(entry.label || '')) {
                entry.label = 'Edufyi (IGNITE CAMPUS)'
                dirty = true
              }
            })
          }
          if (Array.isArray(settings.wifiNetworks)) {
            settings.wifiNetworks.forEach((n) => {
              if (/airtel|dji/i.test(n.ssid || '')) {
                n.ssid = 'Edufyi'
                dirty = true
              }
            })
          }
          if (settings.helpDeskSettings) {
            const hd = settings.helpDeskSettings
            hd.itSupportEmail = 'itsupport@edufyitech.in'
            hd.hrSupportEmail = 'hr@edufyitech.in'
            hd.payrollSupportEmail = 'hr@edufyitech.in'
            hd.facilitiesEmail = 'admin@edufyitech.in'
            if (!hd.generalSupportEmail || /edufy.*solution/i.test(hd.generalSupportEmail)) {
              hd.generalSupportEmail = 'admin@edufyitech.in'
            }
            if (!hd.supportEmail || /edufy.*solution/i.test(hd.supportEmail)) {
              hd.supportEmail = 'admin@edufyitech.in'
            }
            dirty = true
          }
          if (dirty) await settings.save()
        }
        // Also update any existing tickets with typo domains
        try {
          const { Ticket } = await import('./models/Ticket.js')
          await Ticket.updateMany(
            { assignedToEmail: /edufy.*solution/i },
            [{ $set: { assignedToEmail: { $cond: [{ $regexMatch: { input: '$category', regex: /it/i } }, 'itsupport@edufyitech.in', { $cond: [{ $regexMatch: { input: '$category', regex: /hr|payroll|leave/i } }, 'hr@edufyitech.in', 'admin@edufyitech.in'] }] } } }]
          )
        } catch {}
      } catch (err) {
        console.warn('Attendance Wi-Fi cleanup notice:', err.message)
      }
      try {
        const { AttendanceRecord } = await import('./models/AttendanceRecord.js')
        const todayUTC = new Date().toISOString().slice(0, 10)
        const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
        const targetDates = Array.from(new Set([todayUTC, todayIST, '2026-11-05']))

        const recordsToRestore = await AttendanceRecord.find({
          date: { $in: targetDates },
          checkIn: { $nin: [null, ''] },
          $or: [
            { autoPunchOut: true },
            { punchOutType: 'auto' },
            { punchOutReason: { $regex: /auto|disconnect|offline|inactive|geofence|timeout/i } },
            { totalHours: { $regex: /auto punch out/i } },
          ],
        }).lean()

        let restoredCount = 0
        for (const rec of recordsToRestore) {
          const cleanStatus = (rec.isLate || rec.status === 'late') ? 'late' : 'present'
          await AttendanceRecord.updateOne(
            { _id: rec._id },
            {
              $set: {
                checkOut: null,
                checkOutAt: null,
                autoPunchOut: false,
                punchOutReason: '',
                punchOutType: 'manual',
                isEarlyLogout: false,
                earlyLogoutCount: 0,
                isHalfDay: false,
                totalHours: 'Active (Live)',
                status: cleanStatus,
                disconnectedSince: null,
                autoPunchOutPolicy: null,
                autoPunchOutReasonCode: null,
                reviewStatus: 'corrected',
                reviewedBy: 'Emergency Restoration Daemon',
                reviewedAt: new Date(),
                reviewRemarks: 'Restored from premature offline timeout false closure',
              },
              $push: {
                auditEvents: {
                  eventType: 'EMERGENCY_RESTORE_FALSE_AUTOPUNCH',
                  eventTimestamp: new Date(),
                  description: 'Employee restored to active working status following premature offline false closure',
                  source: 'system_repair',
                },
              },
            }
          )
          restoredCount++
        }

        if (restoredCount > 0) {
          console.log(`[AttendanceRestore] Successfully restored ${restoredCount} employees who were prematurely auto-punched out today.`)
        }
      } catch (err) {
        console.warn('Attendance restore notice:', err.message)
      }
    }
  }
  const userStore = options.userStore ?? {
    async listUsers() {
      return databaseStore ? databaseStore.listUsers() : managementStore.listUsers()
    },
    async findByEmail(identifier) {
      return databaseStore ? allowedAccount(await databaseStore.findByEmail(identifier)) : managementStore.findByEmail(identifier)
    },
    async findById(id) {
      return databaseStore ? allowedAccount(await databaseStore.findById(id)) : managementStore.findById(id)
    },
    async addUser(user) {
      if (databaseStore) return databaseStore.addUser(user)
      const error = new Error('MongoDB is not configured. Employee accounts cannot be saved.')
      error.statusCode = 503
      error.code = 'DATABASE_UNAVAILABLE'
      throw error
    },
    async resetPassword(id, passwordHash) {
      if (databaseStore) return databaseStore.resetPassword(id, passwordHash)
      if (managementStore.resetPassword) return managementStore.resetPassword(id, passwordHash)
      throw Object.assign(new Error('Password store is unavailable.'), { statusCode: 503, code: 'DATABASE_UNAVAILABLE' })
    },
    async updateUser(id, updates) {
      if (databaseStore) return databaseStore.updateUser(id, updates)
      return managementStore.updateUser ? managementStore.updateUser(id, updates) : null
    },
    async deleteUser(id) {
      if (databaseStore) return databaseStore.deleteUser(id)
      return managementStore.deleteUser ? managementStore.deleteUser(id) : true
    },
    async isManagerOf(managerId, employeeId) {
      return databaseStore ? databaseStore.isManagerOf(managerId, employeeId) : false
    },
  }
  const employeeRepository = options.employeeRepository ?? createMongoEmployeeRepository()
  const employeeService = options.employeeService ?? createEmployeeService({ repository: employeeRepository })
  const leaveRepository = options.leaveRepository ?? (useDatabase ? createMongoLeaveRepository() : createMemoryLeaveRepository())
  const leaveService = options.leaveService ?? createLeaveService({ repository: leaveRepository, employeeRepository, notificationService: options.notificationService })
  const attendanceRepository = options.attendanceRepository ?? (useDatabase ? createMongoAttendanceRepository() : createMemoryAttendanceRepository())
  const attendanceService = options.attendanceService ?? createAttendanceService({ repository: attendanceRepository, companySettings: options.companySettings, leaveRepository })
  app.locals.attendanceService = attendanceService
  const jwtSecret = options.jwtSecret ?? process.env.JWT_SECRET ?? (process.env.NODE_ENV === 'production' ? null : crypto.randomBytes(32).toString('hex'))
  if (!jwtSecret) throw new Error('JWT_SECRET is required in production')
  const auth = createAuthMiddleware({ userStore, jwtSecret, revokedTokens: options.revokedTokens ?? new Set() })
  const authService = createAuthService({ userStore, jwtSecret, accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '30d', revokedTokens: auth.revokedTokens })
  const authRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 15,
    message: 'Too many authentication attempts. Please try again after 1 minute.',
  })
  const passwordResetLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many password reset requests. Please try again after 15 minutes.',
  })
  const mailRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many email requests dispatched. Please wait a moment.',
  })

  app.disable('x-powered-by')
  if (helmetMiddleware) {
    app.use(helmetMiddleware({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: { action: 'sameorigin' },
    }))
  }
  if (compressionMiddleware) {
    const compHandler = compressionMiddleware({
      threshold: 1024,
      filter: (request, response) => {
        if (request.headers['x-no-compression']) return false
        const contentType = String(response.getHeader('Content-Type') || '')
        if (contentType.includes('text/event-stream')) return false
        return compressionMiddleware.filter ? compressionMiddleware.filter(request, response) : true
      },
    })
    app.use((request, response, next) => {
      if (request.path === '/events' || request.originalUrl?.includes('/events')) {
        return next()
      }
      return compHandler(request, response, next)
    })
  }
  app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'SAMEORIGIN')
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.setHeader('X-XSS-Protection', '1; mode=block')
    response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
    if (process.env.NODE_ENV === 'production' || request.secure || request.headers['x-forwarded-proto'] === 'https') {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }
    response.setHeader('Connection', 'keep-alive')
    response.setHeader('Keep-Alive', 'timeout=65, max=1000')
    const origin = request.headers.origin
    if (origin) {
      let isAllowed = false
      try {
        const parsed = new URL(origin)
        const host = parsed.hostname.toLowerCase()
        const isEdufyiDomain = host === 'edufyitechsolutions.com' || host.endsWith('.edufyitechsolutions.com') ||
          host === 'edufyi.in' || host.endsWith('.edufyi.in') ||
          host === 'edufyitech.in' || host.endsWith('.edufyitech.in') ||
          host === 'edufyi.local' || host.endsWith('.edufyi.local')
        const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')
        const isConfigured = process.env.APP_PUBLIC_URL && origin.startsWith(process.env.APP_PUBLIC_URL.replace(/\/+$/, ''))
        isAllowed = isEdufyiDomain || isLocal || Boolean(isConfigured) || (process.env.NODE_ENV !== 'production')
      } catch {
        isAllowed = false
      }

      if (isAllowed) {
        response.setHeader('Access-Control-Allow-Origin', origin)
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        response.setHeader('Access-Control-Allow-Credentials', 'true')
      }
    }
    if (request.method === 'OPTIONS') {
      return response.sendStatus(204)
    }
    next()
  })
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true, limit: '50mb' }))
  app.use(sanitizeMiddleware)
  const events = createDataEvents(auth)
  app.use('/api/v1', events.changed, events.router)
  app.use('/api/v1', healthRouter)
  app.use('/api/v1/auth/login', authRateLimiter)
  app.use('/api/v1/auth/request-password-reset', passwordResetLimiter)
  app.use('/api/v1/auth/reset-password', passwordResetLimiter)
  app.use('/api/v1/mail', mailRateLimiter)
  app.use('/api/v1/auth', createAuthRouter({ authService, auth, userStore }))
  app.use('/api/v1/employees', createEmployeeRouter({ auth, service: employeeService, userStore, employeeRepository }))
  app.use('/api/v1/leave', createLeaveRouter({ auth, service: leaveService }))
  app.post(['/api/v1/attendance/recalculate', '/api/v1/attendance/recalculateToday'], auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const date = request.body?.date
      const result = await attendanceService.recalculateAttendance(date)
      response.json({ success: true, data: result })
    } catch (error) { next(error) }
  })
  app.use('/api/v1/attendance', createAttendanceRouter({
    auth, service: attendanceService, useDatabase,
    persistenceAvailable: useDatabase || Boolean(options.attendanceRepository || options.attendanceService),
  }))
  app.use('/api/v1/payroll', createPayrollRouter({ auth }))
  app.use('/api/v1/workspace', createWorkspaceRouter({ auth, useDatabase }))
  app.use('/api/v1/hierarchy', createHierarchyRouter({ auth, repository: employeeRepository }))
  app.use('/api/v1/mail', createMailRouter({ auth }))
  app.use('/api/v1/notifications', createNotificationRouter({ auth }))
  const calendarRouter = createCalendarRouter({ auth, useDatabase })
  app.use('/api/v1/calendar', calendarRouter)
  app.use('/api/calendar', calendarRouter)
  app.use('/api/v1', createAccessRouter(auth))
  const isCacheableStatic = (filePath) => {
    return /\.(woff2|woff|ttf|eot|png|jpe?g|gif|webp|svg|ico)$/i.test(filePath)
  }

  const verificationFormsDir = path.resolve(process.cwd(), 'public', 'verification-forms')
  if (fs.existsSync(verificationFormsDir)) {
    app.use('/verification-forms', express.static(verificationFormsDir, {
      maxAge: '7d',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=604800')
      },
    }))
  }
  const companyPoliciesDir = path.resolve(process.cwd(), 'public', 'company-policies')
  if (fs.existsSync(companyPoliciesDir)) {
    app.use('/company-policies', express.static(companyPoliciesDir, {
      maxAge: '7d',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=604800')
      },
    }))
  }
  // Explicit non-cached routes for PWA Service Worker & Manifest
  app.get(['/sw.js', '/manifest.json'], (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    const fileName = req.path.replace(/^\//, '')
    const publicPath = path.resolve(process.cwd(), 'public', fileName)
    const distPath = options.staticDirectory ? path.resolve(options.staticDirectory, fileName) : null
    const targetPath = fs.existsSync(publicPath) ? publicPath : (distPath && fs.existsSync(distPath) ? distPath : null)
    if (targetPath) {
      if (fileName.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript')
      if (fileName.endsWith('.json')) res.setHeader('Content-Type', 'application/manifest+json')
      return res.sendFile(targetPath)
    }
    next()
  })

  const publicDir = path.resolve(process.cwd(), 'public')
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.setHeader('Expires', '0')
        } else if (isCacheableStatic(filePath) || filePath.includes(`${path.sep}fonts${path.sep}`) || filePath.includes('/fonts/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      },
    }))
  }
  if (options.staticDirectory && fs.existsSync(options.staticDirectory)) {
    app.use(express.static(options.staticDirectory, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.json')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
          res.setHeader('Expires', '0')
        } else if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes('/assets/') || isCacheableStatic(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      },
    }))
    app.use(async (request, response, next) => {
      if (request.method !== 'GET') return next()
      if (request.query?.code && (request.query.scope?.includes('calendar') || request.query.scope?.includes('google') || request.query.state?.includes('actor_') || request.query.state === 'edufyi_google_oauth')) {
        try {
          await googleCalendarService.exchangeCodeForTokens(request.query.code)
          return response.send(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #006E6F;">✅ Google Calendar Successfully Connected!</h2>
                <p>You can close this window and return to Edufyi HR.</p>
                <script>
                  if (window.opener) {
                    window.opener.postMessage('google_calendar_connected', '*');
                    window.close();
                  } else {
                    window.location.href = '/#/admin/holidays';
                  }
                </script>
              </body>
            </html>
          `)
        } catch (err) {
          return response.status(500).send(`Google Connection Error: ${err.message}`)
        }
      }
      if (request.path.startsWith('/api') || request.path.startsWith('/verification-forms') || request.path.startsWith('/company-policies')) {
        return next()
      }
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.setHeader('Pragma', 'no-cache')
      response.setHeader('Expires', '0')
      return response.sendFile(path.join(options.staticDirectory, 'index.html'))
    })
  } else {
    app.get('/', (request, response) => {
      response.json({
        status: 'online',
        name: 'Edufyi HR Management System API',
        version: '1.0.0',
        health: '/api/v1/health',
      })
    })
  }
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
