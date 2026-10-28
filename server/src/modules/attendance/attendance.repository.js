import { AttendanceRecord } from '../../models/AttendanceRecord.js'
import { Employee } from '../../models/Employee.js'

async function punchIdentity(record) {
  const { id, _id, ...data } = record
  const empCode = String(data.employeeId || '').trim()
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(empCode)
  const employee = await Employee.findOne({
    $or: [
      { employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') } },
      ...(isObjectId ? [{ _id: empCode }] : []),
    ],
    status: 'active',
  }).select('_id employeeId name displayName').lean()
  if (!employee) throw Object.assign(new Error(`Attendance requires an active employee record (ID: ${empCode || 'unknown'}).`), { statusCode: 403, code: 'EMPLOYEE_NOT_ACTIVE' })
  return { ...data, employeeId: (employee.employeeId || empCode).toUpperCase(), userId: employee._id, employeeName: employee.displayName || employee.name }
}

export function createMongoAttendanceRepository() {
  return {
    async punchIn(record) {
      const data = await punchIdentity(record)
      const filter = { employeeId: data.employeeId, date: data.date }
      const now = new Date()
      const dataWithPresence = {
        ...data,
        lastConnectedAt: data.lastConnectedAt || data.checkInAt || now,
        disconnectedSince: null,
        autoPunchOut: false,
        punchOutType: 'manual',
      }
      let doc = await AttendanceRecord.findOneAndUpdate(
        { ...filter, checkIn: { $in: [null, ''] } },
        { $set: dataWithPresence }, { returnDocument: 'after', runValidators: true },
      ).lean()
      if (!doc) {
        try {
          doc = await AttendanceRecord.findOneAndUpdate(filter, { $setOnInsert: dataWithPresence }, { upsert: true, returnDocument: 'after', runValidators: true }).lean()
        } catch (error) {
          if (error.code !== 11000) throw error
          doc = await AttendanceRecord.findOne(filter).lean()
          if (!doc) throw error
        }
      }
      return { ...doc, id: String(doc._id) }
    },
    async punchOut(record) {
      const empCode = String(record.employeeId || '').trim()
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(empCode)
      const doc = await AttendanceRecord.findOneAndUpdate(
        {
          $or: [
            { employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') } },
            ...(isObjectId ? [{ userId: empCode }] : []),
          ],
          date: record.date,
          checkOut: { $in: [null, ''] },
        },
        {
          $set: {
            checkOut: record.checkOut,
            checkOutAt: record.checkOutAt,
            totalHours: record.totalHours,
            status: record.status,
            isEarlyLogout: record.isEarlyLogout ?? false,
            isLop: record.isLop ?? false,
            isLate: record.isLate ?? false,
            isHalfDay: record.isHalfDay ?? (record.status === 'half-day'),
            lateCount: record.lateCount ?? 0,
            earlyLogoutCount: record.earlyLogoutCount ?? 0,
            isOnBreak: record.isOnBreak ?? false,
            currentBreak: record.currentBreak ?? null,
            breaks: record.breaks ?? [],
            totalBreakMinutes: record.totalBreakMinutes ?? 0,
            offCampusDurationMinutes: record.offCampusDurationMinutes ?? 0,
            autoPunchOut: record.autoPunchOut ?? false,
            punchOutReason: record.punchOutReason ?? '',
            punchOutType: record.punchOutType ?? 'manual',
            notes: record.notes || '',
          },
        },
        { returnDocument: 'after', runValidators: true },
      ).lean()
      return doc ? { ...doc, id: String(doc._id) } : this.findByEmployeeAndDate(record.employeeId, record.date)
    },
    async updatePresence(employeeId, date, isConnected) {
      const empCode = String(employeeId || '').trim()
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(empCode)
      const filter = {
        $or: [
          { employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') } },
          ...(isObjectId ? [{ userId: empCode }] : []),
        ],
        date,
        checkOut: { $in: [null, ''] },
      }
      const now = new Date()
      if (isConnected) {
        await AttendanceRecord.updateOne(filter, {
          $set: { lastConnectedAt: now, disconnectedSince: null },
        })
      } else {
        await AttendanceRecord.updateOne(
          { ...filter, disconnectedSince: null },
          { $set: { disconnectedSince: now } },
        )
      }
    },
    async findActiveTodayRecords(date) {
      return AttendanceRecord.find({
        date,
        checkIn: { $nin: [null, ''] },
        checkOut: { $in: [null, ''] },
      }).lean()
    },
    async findByEmployeeAndDate(employeeId, date) {
      const empCode = String(employeeId || '').trim()
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(empCode)
      const doc = await AttendanceRecord.findOne({
        $or: [
          { employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') } },
          ...(isObjectId ? [{ userId: empCode }] : []),
        ],
        date,
      }).lean()
      if (!doc) return null
      return { id: String(doc._id), ...doc }
    },
    async findById(id) {
      const doc = await AttendanceRecord.findById(id).lean()
      if (!doc) return null
      return { id: String(doc._id), ...doc }
    },
    async list(filters = {}) {
      const query = {}
      if (typeof filters.date === 'string' && filters.date.trim()) query.date = filters.date.trim()
      if (typeof filters.employeeId === 'string' && filters.employeeId.trim()) query.employeeId = filters.employeeId.trim().toUpperCase()
      if (Array.isArray(filters.allowedEmployeeIds) && filters.allowedEmployeeIds.length > 0) {
        const allowed = filters.allowedEmployeeIds.map((id) => String(id).trim().toUpperCase()).filter(Boolean)
        if (query.employeeId) {
          if (!allowed.includes(query.employeeId)) query.employeeId = '__NONE__'
        } else {
          query.employeeId = { $in: allowed }
        }
      }
      if (typeof filters.status === 'string' && filters.status.trim() && filters.status.trim() !== 'all') {
        query.status = filters.status.trim()
      }
      if (typeof filters.search === 'string' && filters.search.trim()) {
        const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const search = new RegExp(escaped, 'i')
        const employees = await Employee.find({ $or: [{ name: search }, { displayName: search }] }).select('_id').lean()
        query.$or = [
          { employeeName: search },
          { employeeId: search },
          { userId: { $in: employees.map((employee) => employee._id) } },
        ]
      }
      const docs = await AttendanceRecord.find(query).populate('userId', 'name displayName employeeId department').sort({ createdAt: -1 }).lean()
      return docs.map((record) => ({
        ...record, id: String(record._id),
        userId: record.userId ? String(record.userId._id ?? record.userId) : null,
        employeeName: record.userId?.displayName || record.userId?.name || record.employeeName,
        department: record.userId?.department,
      }))
    },
    async save(record) {
      const { id, _id, department, createdAt, updatedAt, __v, ...data } = record
      const empCode = String(data.employeeId || '').trim()
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(empCode)
      const employee = await Employee.findOne({
        $or: [
          { employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') } },
          ...(isObjectId ? [{ _id: empCode }] : []),
        ],
      }).select('_id employeeId name displayName').lean()
      if (employee) {
        data.userId = employee._id
        data.employeeName = employee.displayName || employee.name
      }
      const resolvedCode = (employee?.employeeId || empCode).toUpperCase()
      const targetId = id || _id
      const isValidObjectId = targetId && /^[0-9a-fA-F]{24}$/.test(String(targetId))
      const filter = isValidObjectId ? { _id: targetId } : { employeeId: resolvedCode, date: data.date }

      if (data.status === 'present') {
        data.isLate = false
        data.isHalfDay = false
        data.lateCount = 0
        data.isEarlyLogout = false
        data.isLop = false
        if (typeof data.totalHours === 'string' && data.totalHours.includes('Late')) {
          data.totalHours = data.checkOut ? '8.0 hrs' : 'Active (Live)'
        }
        if (typeof data.notes === 'string' && data.notes.includes('Late')) {
          data.notes = 'On-time verification (General Shift)'
        }
      }

      const doc = await AttendanceRecord.findOneAndUpdate(
        filter,
        { $set: { ...data, employeeId: resolvedCode } },
        { upsert: true, new: true, returnDocument: 'after', setDefaultsOnInsert: true }
      ).lean()
      return { id: String(doc._id), ...doc }
    },
    async updateFields(id, fields) {
      const cleanId = String(id || '').trim()
      const { id: _i, _id: _mi, department, createdAt, updatedAt, __v, ...safeFields } = fields
      if (safeFields.status === 'present') {
        safeFields.isLate = false
        safeFields.isHalfDay = false
        safeFields.lateCount = 0
        safeFields.isEarlyLogout = false
        safeFields.isLop = false
        if (typeof safeFields.totalHours === 'string' && safeFields.totalHours.includes('Late')) {
          safeFields.totalHours = safeFields.checkOut ? '8.0 hrs' : 'Active (Live)'
        }
        if (typeof safeFields.notes === 'string' && safeFields.notes.includes('Late')) {
          safeFields.notes = 'On-time verification (General Shift)'
        }
      }
      const query = /^[0-9a-fA-F]{24}$/.test(cleanId) ? { _id: cleanId } : { id: cleanId }
      const doc = await AttendanceRecord.findOneAndUpdate(
        query,
        { $set: safeFields },
        { new: true, returnDocument: 'after' }
      ).lean()
      return doc ? { id: String(doc._id), ...doc } : null
    },
    async delete(id, options = {}) {
      const cleanId = String(id || '').trim()
      let doc = null
      if (cleanId && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
        doc = await AttendanceRecord.findByIdAndDelete(cleanId)
      }
      if (!doc && options?.employeeId && options?.date) {
        doc = await AttendanceRecord.findOneAndDelete({
          employeeId: String(options.employeeId).toUpperCase().trim(),
          date: String(options.date).trim(),
        })
      }
      if (!doc && cleanId) {
        doc = await AttendanceRecord.findOneAndDelete({
          $or: [
            { id: cleanId },
            { employeeId: cleanId.toUpperCase() },
          ],
        })
      }
      return Boolean(doc)
    },
    async getSummary(date) {
      const docs = await AttendanceRecord.find({ date }).lean()
      const present = docs.filter((r) => r.status === 'present').length
      const late = docs.filter((r) => r.status === 'late').length
      const halfDay = docs.filter((r) => r.status === 'half-day').length
      const earlyLogout = docs.filter((r) => r.status === 'early-logout' || r.isEarlyLogout).length
      const lop = docs.filter((r) => r.status === 'lop' || r.isLop).length
      const onLeave = docs.filter((r) => r.status === 'on-leave').length
      const absent = docs.filter((r) => r.status === 'absent').length
      return { total: docs.length, present, late, halfDay, earlyLogout, lop, onLeave, absent }
    },
  }
}
