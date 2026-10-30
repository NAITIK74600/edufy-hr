import mongoose from 'mongoose'
import { LeaveBalance } from '../../models/LeaveBalance.js'
import { LeavePolicy } from '../../models/LeavePolicy.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { Notification } from '../../models/Notification.js'
import { Employee } from '../../models/Employee.js'

function ensureConnected() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('MongoDB is not connected.')
    error.statusCode = 503
    error.code = 'DATA_SOURCE_UNAVAILABLE'
    throw error
  }
}

function objectId(id) {
  const value = id?._id ?? id?.id ?? id
  return mongoose.isValidObjectId(value) ? value : null
}

function cleanRequest(request) {
  if (!request) return null
  const source = request.toObject ? request.toObject() : request
  source.id = String(source.id ?? source._id)
  return source
}

export function createMongoLeaveRepository() {
  return {
    async listRequests(filters = {}) {
      ensureConnected()
      const query = {}
      if (filters.employeeId) query.employeeId = objectId(filters.employeeId)
      if (filters.managerId) query.managerId = objectId(filters.managerId)
      if (typeof filters.status === 'string' && filters.status.trim()) query.status = filters.status.trim()
      if (typeof filters.leaveType === 'string' && filters.leaveType.trim()) query.leaveType = filters.leaveType.trim().toLowerCase()
      if (filters.from || filters.to) {
        query.startDate = {}
        if (typeof filters.to === 'string' && /^\d{4}-\d{2}-\d{2}/.test(filters.to)) query.startDate.$lte = new Date(filters.to)
        if (typeof filters.from === 'string' && /^\d{4}-\d{2}-\d{2}/.test(filters.from)) query.endDate = { $gte: new Date(filters.from) }
        if (Object.keys(query.startDate).length === 0) delete query.startDate
      }
      return LeaveRequest.find(query).sort({ createdAt: -1 }).populate('employeeId', 'employeeId name email department designation managerId').populate('managerId', 'employeeId name email').lean().then((records) => records.map(cleanRequest))
    },
    async findRequest(id) {
      ensureConnected()
      if (!objectId(id)) return null
      return LeaveRequest.findById(id).populate('employeeId', 'employeeId name email department designation managerId').populate('managerId', 'employeeId name email').lean().then(cleanRequest)
    },
    async createRequest(data) {
      ensureConnected()
      return cleanRequest(await LeaveRequest.create(data))
    },
    async transitionRequest(id, expectedStatuses, update) {
      ensureConnected()
      if (!objectId(id)) return null
      const changes = { $set: update.set ?? {} }
      if (update.push) changes.$push = { approvalHistory: update.push }
      return LeaveRequest.findOneAndUpdate({ _id: id, status: { $in: expectedStatuses } }, changes, { returnDocument: 'after' }).lean().then(cleanRequest)
    },
    async appendComment(id, comment) {
      ensureConnected()
      if (!objectId(id)) return null
      return LeaveRequest.findByIdAndUpdate(id, { $push: { comments: comment, approvalHistory: { action: 'commented', actorId: comment.actorId, actorRole: comment.actorRole, comment: comment.body } } }, { returnDocument: 'after' }).lean().then(cleanRequest)
    },
    async findOverlap({ employeeId, startDate, endDate, excludeId }) {
      ensureConnected()
      const query = { employeeId: objectId(employeeId), status: { $in: ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'] }, startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      if (excludeId && objectId(excludeId)) query._id = { $ne: excludeId }
      return LeaveRequest.findOne(query).lean()
    },
    async getPolicy(leaveType) { ensureConnected(); return LeavePolicy.findOne({ leaveType: String(leaveType).toLowerCase() }).lean() },
    async listPolicies() { ensureConnected(); return LeavePolicy.find().sort({ label: 1 }).lean() },
    async savePolicy(leaveType, values) { ensureConnected(); return LeavePolicy.findOneAndUpdate({ leaveType: String(leaveType).toLowerCase() }, { $set: { ...values, leaveType: String(leaveType).toLowerCase() } }, { upsert: true, returnDocument: 'after', runValidators: true }).lean() },
    async ensureBalance(employeeId, leaveType, allowance) {
      ensureConnected()
      const id = objectId(employeeId)
      if (!id || !(Number(allowance) >= 0)) return null
      const currentMonthKey = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
      try {
        const found = await LeaveBalance.findOne({ employeeId: id, leaveType: String(leaveType).toLowerCase() })
        if (found) {
          if (!found.month || found.month !== currentMonthKey) {
            found.used = 0
            found.reserved = 0
            found.allowance = Number(allowance)
            found.month = currentMonthKey
            found.updatedAt = new Date()
            await found.save()
            return found.toObject()
          }
          return found.toObject()
        }
        return (await LeaveBalance.create({ employeeId: id, leaveType: String(leaveType).toLowerCase(), allowance: Number(allowance), used: 0, reserved: 0, month: currentMonthKey, updatedAt: new Date() })).toObject()
      } catch (error) {
        if (error?.code === 11000) return null
        throw error
      }
    },
    async getBalance(employeeId, leaveType) { ensureConnected(); return LeaveBalance.findOne({ employeeId: objectId(employeeId), leaveType: String(leaveType).toLowerCase() }).lean() },
    async listBalances(filters = {}) {
      ensureConnected()

      // Automatically prune orphaned balance documents with null or deleted employee refs
      try {
        await LeaveBalance.deleteMany({
          $or: [{ employeeId: null }, { employeeId: { $exists: false } }]
        })
      } catch (pruneErr) {
        console.warn('[leave.repository] Cleanup orphaned balances warning:', pruneErr?.message || pruneErr)
      }

      const query = {}
      if (filters.employeeId) query.employeeId = objectId(filters.employeeId)
      if (filters.leaveType) query.leaveType = String(filters.leaveType).toLowerCase()
      const rawRecords = await LeaveBalance.find(query).populate('employeeId', 'employeeId name department employmentType designation role').sort({ leaveType: 1 }).lean()

      // Exclude any balances where employeeId failed to populate (unresolved employee)
      const records = rawRecords.filter((b) => b && b.employeeId && typeof b.employeeId === 'object' && b.employeeId._id)

      const currentMonthKey = new Date().toISOString().slice(0, 7)
      for (const b of records) {
        if (!b.month || b.month !== currentMonthKey) {
          const emp = b.employeeId
          if (!emp) continue
          const empType = String(emp?.employmentType || '').toLowerCase().replace(/[-\s]/g, '_')
          const isIntern = empType === 'intern' || String(emp?.designation || '').toLowerCase().includes('intern') || String(emp?.role || '').toLowerCase().includes('intern')
          let defaultAllowance = 0
          if (isIntern) {
            defaultAllowance = b.leaveType === 'sick' ? 1 : 0
          } else {
            defaultAllowance = (b.leaveType === 'casual' || b.leaveType === 'sick') ? 1 : 0
          }
          const updatedAllowance = (b.allowance > 2 || !b.month) ? defaultAllowance : b.allowance
          await LeaveBalance.updateOne(
            { _id: b._id },
            { $set: { used: 0, reserved: 0, allowance: updatedAllowance, month: currentMonthKey, updatedAt: new Date() } }
          )
          b.used = 0
          b.reserved = 0
          b.allowance = updatedAllowance
          b.month = currentMonthKey
        }
      }

      // Auto-ensure default policy balances for any employees who don't have records yet
      try {
        const empQuery = { status: { $ne: 'terminated' } }
        if (filters.employeeId) empQuery._id = objectId(filters.employeeId)
        const allEmps = await Employee.find(empQuery).select('_id employeeId name department employmentType designation role').lean()
        const foundEmpIds = new Set(records.map((r) => String(r.employeeId?._id || r.employeeId || '')))

        for (const emp of allEmps) {
          const empIdStr = String(emp._id)
          if (!foundEmpIds.has(empIdStr)) {
            const empType = String(emp.employmentType || '').toLowerCase().replace(/[-\s]/g, '_')
            const isIntern = empType === 'intern' || String(emp.designation || '').toLowerCase().includes('intern') || String(emp.role || '').toLowerCase().includes('intern')
            const casualQuota = isIntern ? 0 : 1
            const sickQuota = 1

            const cl = await LeaveBalance.findOneAndUpdate(
              { employeeId: emp._id, leaveType: 'casual' },
              { $setOnInsert: { allowance: casualQuota, used: 0, reserved: 0, month: currentMonthKey, updatedAt: new Date() } },
              { upsert: true, new: true }
            ).populate('employeeId', 'employeeId name department employmentType designation role').lean()
            if (cl) records.push(cl)

            const sl = await LeaveBalance.findOneAndUpdate(
              { employeeId: emp._id, leaveType: 'sick' },
              { $setOnInsert: { allowance: sickQuota, used: 0, reserved: 0, month: currentMonthKey, updatedAt: new Date() } },
              { upsert: true, new: true }
            ).populate('employeeId', 'employeeId name department employmentType designation role').lean()
            if (sl) records.push(sl)

            foundEmpIds.add(empIdStr)
          }
        }
      } catch {}

      return records
    },
    async reserveBalance(employeeId, leaveType, units) {
      ensureConnected()
      const currentMonthKey = new Date().toISOString().slice(0, 7)
      return LeaveBalance.findOneAndUpdate(
        {
          employeeId: objectId(employeeId),
          leaveType: String(leaveType).toLowerCase(),
          $expr: { $gte: [{ $subtract: ['$allowance', { $add: ['$used', '$reserved'] }] }, units] },
        },
        { $inc: { reserved: units }, $set: { month: currentMonthKey, updatedAt: new Date() } },
        { returnDocument: 'after' }
      ).lean()
    },
    async releaseReservation(employeeId, leaveType, units) { ensureConnected(); return LeaveBalance.findOneAndUpdate({ employeeId: objectId(employeeId), leaveType: String(leaveType).toLowerCase(), reserved: { $gte: units } }, { $inc: { reserved: -units }, $set: { updatedAt: new Date() } }, { returnDocument: 'after' }).lean() },
    async commitReservation(employeeId, leaveType, units) { ensureConnected(); return LeaveBalance.findOneAndUpdate({ employeeId: objectId(employeeId), leaveType: String(leaveType).toLowerCase(), reserved: { $gte: units } }, { $inc: { reserved: -units, used: units }, $set: { updatedAt: new Date() } }, { returnDocument: 'after' }).lean() },
    async restoreCommittedBalance(employeeId, leaveType, units) { ensureConnected(); return LeaveBalance.findOneAndUpdate({ employeeId: objectId(employeeId), leaveType: String(leaveType).toLowerCase(), used: { $gte: units } }, { $inc: { used: -units }, $set: { updatedAt: new Date() } }, { returnDocument: 'after' }).lean() },
    async deleteRequest(id) {
      ensureConnected()
      if (!objectId(id)) return null
      return LeaveRequest.findByIdAndDelete(id).lean()
    },
    async notify(data) { ensureConnected(); return Notification.create(data) },
  }
}

export { ensureConnected }
