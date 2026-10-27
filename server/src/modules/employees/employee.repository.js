import mongoose from 'mongoose'
import { Employee } from '../../models/Employee.js'
import { attachOnboardingDocs } from '../../models/onboardingDocsCache.js'
import { AuditLog } from '../../models/AuditLog.js'
import { AttendanceRecord } from '../../models/AttendanceRecord.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { LeaveBalance } from '../../models/LeaveBalance.js'
import { PayrollRecord } from '../../models/PayrollRecord.js'
import { Notification } from '../../models/Notification.js'
import { workspaceModels } from '../../models/Workspace.js'

function toPublicEmployee(employee) {
  if (!employee) return null
  const source = employee.toObject ? employee.toObject() : { ...employee }
  source.id = String(source._id ?? source.id)
  source.hasLogin = Boolean(source.passwordHash)
  delete source.passwordHash
  delete source.authVersion
  if (source.documents) source.documents = source.documents.map(({ fileKey, ...document }) => document)
  return source
}

function buildFilter(filters = {}) {
  const query = {}
  if (typeof filters.search === 'string' && filters.search.trim()) {
    const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const search = new RegExp(escaped, 'i')
    query.$or = [{ name: search }, { email: search }, { employeeId: search }]
  }
  for (const field of ['department', 'designation', 'status', 'managerId', 'campus', 'role', 'employmentType']) {
    if (typeof filters[field] === 'string' && filters[field].trim()) {
      if (field === 'managerId') {
        const trimmed = filters[field].trim()
        if (mongoose.isValidObjectId(trimmed)) {
          query[field] = trimmed
        }
      } else if (field === 'employmentType') {
        const type = filters[field].trim().toLowerCase()
        if (type === 'intern') {
          query.$or = [
            { employmentType: 'intern' },
            { role: 'intern' },
            { role: { $regex: /intern/i } },
            { designation: { $regex: /intern/i } },
          ]
        } else if (type === 'full_time') {
          query.employmentType = { $ne: 'intern' }
          query.role = { $not: /intern/i }
          query.designation = { $not: /intern/i }
        } else {
          query[field] = filters[field].trim()
        }
      } else {
        query[field] = filters[field].trim()
      }
    }
  }
  return query
}

function ensureConnected() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('MongoDB is not connected.')
    error.statusCode = 503
    error.code = 'DATA_SOURCE_UNAVAILABLE'
    throw error
  }
}

export function createMongoEmployeeRepository() {
  const listCache = new Map()
  const LIST_TTL_MS = 10000 // 10-second shared employee-list cache

  function clearCache() {
    listCache.clear()
  }

  return {
    clearCache,
    async list({ page = 1, limit = 20, sort = 'name', direction = 'asc', ...filters }) {
      ensureConnected()
      const safePage = Math.max(1, Number(page) || 1)
      const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20))
      const sortField = ['name', 'employeeId', 'department', 'designation', 'status', 'joiningDate'].includes(sort) ? sort : 'name'
      const sortOrder = direction === 'desc' ? -1 : 1
      const query = buildFilter(filters)

      const cacheKey = JSON.stringify({ safePage, safeLimit, sortField, sortOrder, query })
      const cached = listCache.get(cacheKey)
      if (cached && cached.expires > Date.now()) {
        return cached.promise
      }

      const queryPromise = (async () => {
        const [records, total] = await Promise.all([
          Employee.find(query)
            .select('+passwordHash -documents.fileKey')
            .populate('managerId', 'employeeId name email')
            .sort({ [sortField]: sortOrder })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
          Employee.countDocuments(query),
        ])
        await attachOnboardingDocs(records)
        return { records: records.map(toPublicEmployee), meta: { page: safePage, limit: safeLimit, total } }
      })()

      listCache.set(cacheKey, { promise: queryPromise, expires: Date.now() + LIST_TTL_MS })
      queryPromise.catch(() => listCache.delete(cacheKey))
      if (listCache.size > 500) {
        for (const [k, v] of listCache) if (v.expires < Date.now()) listCache.delete(k)
      }
      return queryPromise
    },
    async findById(id) {
      ensureConnected()
      let employee = null
      if (mongoose.isValidObjectId(id)) {
        employee = await Employee.findById(id).select('+passwordHash -documents.fileKey').populate('managerId', 'employeeId name email').lean()
      }
      if (!employee && typeof id === 'string') {
        employee = await Employee.findOne({
          $or: [
            { employeeId: id.trim().toUpperCase() },
            { email: id.trim().toLowerCase() },
          ],
        }).select('+passwordHash -documents.fileKey').populate('managerId', 'employeeId name email').lean()
      }
      if (employee) await attachOnboardingDocs(employee)
      return toPublicEmployee(employee)
    },
    async findForUpdate(id) {
      ensureConnected()
      if (!mongoose.isValidObjectId(id)) return null
      return Employee.findById(id).select('+authVersion +onboardingDocs')
    },
    async findManager(id) {
      ensureConnected()
      if (!id) return null
      const managerRoles = [
        'admin', 'hr', 'manager', 'director', 'team_lead', 'team_leader',
        'vertical_head', 'managing_director', 'co_founder', 'revenue_growth_manager',
        'senior_manager', 'general_manager', 'assistant_general_manager', 'head_of_sales', 'head_of_marketing',
      ]
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ employeeId: String(id).toUpperCase() }, { id: String(id) }, { email: String(id).toLowerCase() }] }
      return Employee.findOne({ ...query, role: { $in: managerRoles }, status: { $ne: 'inactive' } }).select('_id employeeId name email role status').lean()
    },
    async getNextEmployeeCode() {
      ensureConnected()
      const records = await Employee.find({ employeeId: { $exists: true } }).select('employeeId').lean()
      let maxNum = 21200
      for (const rec of records) {
        const str = String(rec.employeeId || '').trim()
        const m = str.match(/^ETS(\d+)$/i)
        if (m) {
          const n = parseInt(m[1], 10)
          if (n > maxNum) maxNum = n
        } else {
          const digits = str.match(/\d{4,}/g)
          if (digits) {
            for (const d of digits) {
              const n = parseInt(d, 10)
              if (n > maxNum) maxNum = n
            }
          }
        }
      }
      return `ETS${maxNum + 1}`
    },
    async create(data) {
      ensureConnected()
      clearCache()
      const employee = await Employee.create(data)
      return toPublicEmployee(employee)
    },
    async save(employee) {
      ensureConnected()
      clearCache()
      await employee.save()
      return toPublicEmployee(employee)
    },
    async listAudit(id) {
      ensureConnected()
      if (!mongoose.isValidObjectId(id)) return []
      return AuditLog.find({ entityType: 'employee', entityId: id }).sort({ createdAt: -1 }).limit(100).lean()
    },
    async addAudit(event) {
      ensureConnected()
      return AuditLog.create(event)
    },
    async updateEmployeeCode(oldCode, newCode, employeeMongoId) {
      ensureConnected()
      clearCache()
      if (!oldCode || !newCode || oldCode === newCode) return
      await Promise.all([
        AttendanceRecord.updateMany({ employeeId: oldCode }, { $set: { employeeId: newCode } }),
        LeaveRequest.updateMany({ employeeId: oldCode }, { $set: { employeeId: newCode } }),
        LeaveBalance.updateMany({ employeeId: oldCode }, { $set: { employeeId: newCode } }),
        PayrollRecord.updateMany({ $or: [{ employeeId: oldCode }, { employeeRef: employeeMongoId }] }, { $set: { employeeId: newCode } }),
      ]).catch(() => {})
    },
    async remove(employee) {
      ensureConnected()
      clearCache()
      const id = employee._id ?? employee.id
      const employeeCode = employee.employeeId
      const workspaceOwned = Object.values(workspaceModels).map((model) => model.deleteMany({ ownerId: String(id) }))
      await Promise.all([
        Employee.deleteOne({ _id: id }),
        Employee.updateMany({ managerId: id }, { $set: { managerId: null } }),
        AttendanceRecord.deleteMany({ $or: [{ userId: id }, ...(employeeCode ? [{ employeeId: employeeCode }] : [])] }),
        LeaveRequest.deleteMany({ $or: [{ employeeId: id }, { managerId: id }] }),
        LeaveBalance.deleteMany({ employeeId: id }),
        PayrollRecord.deleteMany({ employeeRef: id }),
        Notification.deleteMany({ recipientId: id }),
        workspaceModels.tasks.deleteMany({ assigneeRef: String(id) }),
        workspaceModels.kudos.deleteMany({ recipientId: String(id) }),
        workspaceModels.performanceGoals.deleteMany({ employeeRef: String(id) }),
        workspaceModels.performanceReviews.deleteMany({ employeeRef: String(id) }),
        AuditLog.deleteMany({ entityType: 'employee', entityId: id }),
        ...workspaceOwned,
      ])
      return true
    },
  }
}

export { toPublicEmployee, buildFilter }
