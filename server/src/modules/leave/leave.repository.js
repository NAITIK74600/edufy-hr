import mongoose from 'mongoose'
import { LeaveBalance } from '../../models/LeaveBalance.js'
import { LeavePolicy } from '../../models/LeavePolicy.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { Notification } from '../../models/Notification.js'

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
      const query = { employeeId: objectId(employeeId), status: { $in: ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'approved'] }, startDate: { $lte: endDate }, endDate: { $gte: startDate } }
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
      try {
        return await LeaveBalance.findOneAndUpdate({ employeeId: id, leaveType: String(leaveType).toLowerCase() }, { $setOnInsert: { allowance: Number(allowance), used: 0, reserved: 0, updatedAt: new Date() } }, { upsert: true, returnDocument: 'after' }).lean()
      } catch (error) {
        if (error?.code === 11000) return null // created concurrently by another request
        throw error
      }
    },
    async getBalance(employeeId, leaveType) { ensureConnected(); return LeaveBalance.findOne({ employeeId: objectId(employeeId), leaveType: String(leaveType).toLowerCase() }).lean() },
    async listBalances(filters = {}) { ensureConnected(); const query = {}; if (filters.employeeId) query.employeeId = objectId(filters.employeeId); if (filters.leaveType) query.leaveType = String(filters.leaveType).toLowerCase(); return LeaveBalance.find(query).populate('employeeId', 'employeeId name department').sort({ leaveType: 1 }).lean() },
    async reserveBalance(employeeId, leaveType, units) { ensureConnected(); return LeaveBalance.findOneAndUpdate({ employeeId: objectId(employeeId), leaveType: String(leaveType).toLowerCase(), $expr: { $gte: [{ $subtract: ['$allowance', { $add: ['$used', '$reserved'] }] }, units] } }, { $inc: { reserved: units }, $set: { updatedAt: new Date() } }, { returnDocument: 'after' }).lean() },
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
