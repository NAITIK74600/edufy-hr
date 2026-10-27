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
import { createMongoAttendanceRepository } from './modules/attendance/attendance.repository.js'
import { createMemoryAttendanceRepository } from './modules/attendance/memoryAttendanceRepository.js'
import { createAttendanceService } from './modules/attendance/attendance.service.js'
import { createAttendanceRouter } from './modules/attendance/attendance.routes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { seedAllEmployees } from './modules/employees/seedAllEmployees.js'
import { sanitizeMiddleware } from './middleware/sanitize.js'

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
  const attendanceService = options.attendanceService ?? createAttendanceService({ repository: attendanceRepository, companySettings: options.companySettings })

  // Automated punch-out background daemon: checks active records every 60s for 2-hour disconnection
  if (typeof setInterval !== 'undefined') {
    const autoPunchInterval = setInterval(() => {
      attendanceService.autoPunchOutDisconnectedRecords?.().catch(() => {})
    }, 60000)
    if (autoPunchInterval?.unref) autoPunchInterval.unref()
  }
  const jwtSecret = options.jwtSecret ?? process.env.JWT_SECRET ?? (process.env.NODE_ENV === 'production' ? null : crypto.randomBytes(32).toString('hex'))
  if (!jwtSecret) throw new Error('JWT_SECRET is required in production')
  const auth = createAuthMiddleware({ userStore, jwtSecret, revokedTokens: options.revokedTokens ?? new Set() })
  const authService = createAuthService({ userStore, jwtSecret, accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '30d', revokedTokens: auth.revokedTokens })
  app.disable('x-powered-by')
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
    response.setHeader('Connection', 'keep-alive')
    response.setHeader('Keep-Alive', 'timeout=65, max=1000')
    const origin = request.headers.origin
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.setHeader('Access-Control-Allow-Credentials', 'true')
    }
    if (request.method === 'OPTIONS') {
      return response.sendStatus(204)
    }
    next()
  })
  app.use(express.json({ limit: '25mb' }))
  app.use(sanitizeMiddleware)
  const events = createDataEvents(auth)
  app.use('/api/v1', events.changed, events.router)
  app.use('/api/v1', healthRouter)
  app.use('/api/v1/auth', createAuthRouter({ authService, auth, userStore }))
  app.use('/api/v1/employees', createEmployeeRouter({ auth, service: employeeService }))
  app.use('/api/v1/leave', createLeaveRouter({ auth, service: leaveService }))
  app.use('/api/v1/attendance', createAttendanceRouter({
    auth, service: attendanceService, useDatabase,
    persistenceAvailable: useDatabase || Boolean(options.attendanceRepository || options.attendanceService),
  }))
  app.use('/api/v1/payroll', createPayrollRouter({ auth }))
  app.use('/api/v1/workspace', createWorkspaceRouter({ auth, useDatabase }))
  app.use('/api/v1/hierarchy', createHierarchyRouter({ auth, repository: employeeRepository }))
  app.use('/api/v1/mail', createMailRouter({ auth }))
  app.use('/api/v1', createAccessRouter(auth))
  const verificationFormsDir = path.resolve(process.cwd(), 'public', 'verification-forms')
  if (fs.existsSync(verificationFormsDir)) {
    app.use('/verification-forms', express.static(verificationFormsDir))
  }
  const companyPoliciesDir = path.resolve(process.cwd(), 'public', 'company-policies')
  if (fs.existsSync(companyPoliciesDir)) {
    app.use('/company-policies', express.static(companyPoliciesDir))
  }
  const publicDir = path.resolve(process.cwd(), 'public')
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir))
  }
  if (options.staticDirectory && fs.existsSync(options.staticDirectory)) {
    app.use(express.static(options.staticDirectory, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        } else if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      },
    }))
    app.use((request, response, next) => {
      if (request.method !== 'GET') return next()
      if (request.path.startsWith('/api') || request.path.startsWith('/verification-forms') || request.path.startsWith('/company-policies')) {
        return next()
      }
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
