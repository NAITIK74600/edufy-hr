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
    status: { $in: ['active', 'notice', 'onboarding'] },
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
      return {
        id: String(doc._id),
        ...doc,
        wifiSSID: /airtel|dji|3052/i.test(doc.wifiSSID || '') ? 'Edufyi' : (doc.wifiSSID || 'Edufyi'),
      }
    },
    async findById(id) {
      const doc = await AttendanceRecord.findById(id).lean()
      if (!doc) return null
      return {
        id: String(doc._id),
        ...doc,
        wifiSSID: /airtel|dji|3052/i.test(doc.wifiSSID || '') ? 'Edufyi' : (doc.wifiSSID || 'Edufyi'),
      }
    },
    async list(filters = {}) {
      const query = {}
      if (typeof filters.date === 'string' && filters.date.trim()) {
        query.date = filters.date.trim()
      } else if (typeof filters.month === 'string' && filters.month.trim()) {
        query.date = { $regex: new RegExp(`^${filters.month.trim()}`) }
      }
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
        wifiSSID: /airtel|dji|3052/i.test(record.wifiSSID || '') ? 'Edufyi' : (record.wifiSSID || 'Edufyi'),
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
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId)
      let doc = null
      if (isObjectId) {
        doc = await AttendanceRecord.findByIdAndUpdate(
          cleanId,
          { $set: safeFields },
          { new: true, returnDocument: 'after' }
        ).lean()
      }
      if (!doc && fields.employeeId && fields.date) {
        doc = await AttendanceRecord.findOneAndUpdate(
          { employeeId: String(fields.employeeId).toUpperCase().trim(), date: String(fields.date).trim() },
          { $set: safeFields },
          { new: true, returnDocument: 'after' }
        ).lean()
      }
      if (!doc && cleanId) {
        doc = await AttendanceRecord.findOneAndUpdate(
          { id: cleanId },
          { $set: safeFields },
          { new: true, returnDocument: 'after' }
        ).lean()
      }
      return doc ? { id: String(doc._id), ...doc } : null
    },
    async delete(id, options = {}) {
      const cleanId = String(id || '').trim()
      let deleted = false

      // 1. If employeeId and date are provided in options, delete ALL records for that day completely
      if (options?.employeeId && options?.date) {
        const empCode = String(options.employeeId).trim()
        const targetDate = String(options.date).trim()
        const res = await AttendanceRecord.deleteMany({
          employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') },
          date: targetDate,
        })
        if (res.deletedCount > 0) deleted = true
      }

      // 2. If valid MongoDB ObjectId, locate the record and delete all records for that employee on that day
      if (cleanId && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
        const target = await AttendanceRecord.findById(cleanId).lean()
        if (target) {
          const res = await AttendanceRecord.deleteMany({
            $or: [
              { _id: target._id },
              ...(target.employeeId && target.date
                ? [{ employeeId: { $regex: new RegExp(`^${target.employeeId}$`, 'i') }, date: target.date }]
                : []),
            ],
          })
          if (res.deletedCount > 0) deleted = true
        } else {
          const res = await AttendanceRecord.deleteOne({ _id: cleanId })
          if (res.deletedCount > 0) deleted = true
        }
      }

      // 3. Fallback: match by custom id or employeeId
      if (!deleted && cleanId) {
        const res = await AttendanceRecord.deleteMany({
          $or: [
            { id: cleanId },
            { employeeId: cleanId.toUpperCase() },
          ],
        })
        if (res.deletedCount > 0) deleted = true
      }

      return deleted
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
