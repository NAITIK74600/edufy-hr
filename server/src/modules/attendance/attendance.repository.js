import { AttendanceRecord } from '../../models/AttendanceRecord.js'
import { Employee } from '../../models/Employee.js'

function calculateRecordWorkDuration(record) {
  if (!record.checkOut || record.checkOut === '—' || !record.checkIn) {
    return record.totalHours || 'Active (Live)'
  }
  const clean = String(record.totalHours || '').trim()
  if (clean && !clean.startsWith('0h 0m') && clean !== '8.0 hrs' && clean !== 'Active (Live)' && clean !== '0.0 hrs' && clean !== '—') {
    return record.totalHours
  }

  const parseTime = (str) => {
    if (!str) return null
    const c = String(str).trim().replace(/[\u202F\u00A0]/g, ' ')
    const m = c.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
    if (!m) return null
    let h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    const meridiem = m[3]?.toUpperCase()
    if (meridiem === 'PM' && h < 12) h += 12
    if (meridiem === 'AM' && h === 12) h = 0
    return h * 60 + min
  }

  const inM = parseTime(record.checkIn)
  const outM = parseTime(record.checkOut)
  if (inM === null || outM === null) return record.totalHours || 'Active (Live)'

  let diff = outM - inM
  if (diff < 0) diff += 1440
  const breaks = Math.max(0, Number(record.totalBreakMinutes) || 0)
  const net = Math.max(0, diff - breaks)
  const h = Math.floor(net / 60)
  const m = net % 60
  const breakPart = breaks > 0 ? ` · ${breaks}m Break` : ''
  const tag = record.autoPunchOut ? 'Auto Punch Out' : 'Completed'
  return `${h}h ${m}m (${tag})${breakPart}`
}

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
        ...(date ? { date } : {}),
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
    async updatePresenceDetails(employeeId, date, updates = {}, auditEvent = null) {
      const empCode = String(employeeId || '').trim()
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(empCode)
      const filter = {
        $or: [
          { employeeId: { $regex: new RegExp(`^${empCode}$`, 'i') } },
          ...(isObjectId ? [{ userId: empCode }] : []),
        ],
        ...(date ? { date } : {}),
        checkOut: { $in: [null, ''] },
      }
      const updateDoc = { $set: updates }
      if (auditEvent) {
        updateDoc.$push = { auditEvents: auditEvent }
      }
      return AttendanceRecord.findOneAndUpdate(filter, updateDoc, { new: true }).lean()
    },
    async findExpiredGeofenceRecords(now = new Date()) {
      const query = {
        checkIn: { $nin: [null, ''] },
        checkOut: { $in: [null, ''] },
        geofenceGraceExpiresAt: { $ne: null, $lte: now },
      }
      return AttendanceRecord.find(query).lean()
    },
    async findExpiredOfflineRecords(cutoffDate) {
      const query = {
        checkIn: { $nin: [null, ''] },
        checkOut: { $in: [null, ''] },
        lastConnectedAt: { $ne: null, $lte: cutoffDate },
        geofenceStatus: { $ne: 'outside' }, // Geofence exit timeout takes priority if outside
      }
      return AttendanceRecord.find(query).lean()
    },
    async findActiveSessionsForCutoff(date) {
      const query = {
        checkIn: { $nin: [null, '', '—', '-'] },
        $or: [
          { checkOut: null },
          { checkOut: '' },
          { checkOut: '—' },
          { checkOut: '-' },
          { totalHours: 'Active (Live)' },
          { totalHours: /Active/i },
        ],
      }
      if (date) query.date = date
      return AttendanceRecord.find(query).lean()
    },
    async findUnclosedPastSessions(todayDate) {
      const query = {
        checkIn: { $nin: [null, '', '—', '-'] },
        $or: [
          { checkOut: null },
          { checkOut: '' },
          { checkOut: '—' },
          { checkOut: '-' },
          { totalHours: 'Active (Live)' },
          { totalHours: /Active/i },
        ],
        date: { $lt: todayDate },
      }
      return AttendanceRecord.find(query).lean()
    },
    async findRecordsPendingAdvanceWarning(date) {
      const query = {
        checkIn: { $nin: [null, '', '—', '-'] },
        $or: [
          { checkOut: null },
          { checkOut: '' },
          { checkOut: '—' },
          { checkOut: '-' },
          { totalHours: 'Active (Live)' },
          { totalHours: /Active/i },
        ],
        advanceWarningSentAt: null,
      }
      if (date) query.date = date
      return AttendanceRecord.find(query).lean()
    },
    async atomicFinalizePunchOut(recordId, finalData = {}, auditEvent = null) {
      const updateDoc = { $set: finalData }
      if (auditEvent) {
        updateDoc.$push = { auditEvents: auditEvent }
      }
      // Strict atomic condition: only finalize if session is still unclosed
      return AttendanceRecord.findOneAndUpdate(
        {
          _id: recordId,
          checkIn: { $nin: [null, '', '—', '-'] },
          $or: [
            { checkOut: null },
            { checkOut: '' },
            { checkOut: '—' },
            { checkOut: '-' },
            { totalHours: 'Active (Live)' },
            { totalHours: /Active/i },
          ],
        },
        updateDoc,
        { new: true }
      ).lean()
    },
    async recordAuditEvent(recordId, auditEvent) {
      return AttendanceRecord.findByIdAndUpdate(
        recordId,
        { $push: { auditEvents: auditEvent } },
        { new: true }
      ).lean()
    },
    async listAutoPunchOuts({ date, reviewStatus, limit = 50, skip = 0 } = {}) {
      const query = { autoPunchOut: true }
      if (date) query.date = date
      if (reviewStatus && reviewStatus !== 'all') query.reviewStatus = reviewStatus
      const [records, total] = await Promise.all([
        AttendanceRecord.find(query)
          .sort({ updatedAt: -1 })
          .skip(Number(skip) || 0)
          .limit(Number(limit) || 50)
          .lean(),
        AttendanceRecord.countDocuments(query),
      ])
      return { records: records.map((r) => ({ ...r, id: String(r._id) })), total }
    },
    async reviewAutoPunchOut(recordId, { reviewStatus, reviewedBy, reviewRemarks, correction = null } = {}) {
      const updateDoc = {
        $set: {
          reviewStatus: reviewStatus || 'confirmed',
          reviewedBy: reviewedBy || 'HR Admin',
          reviewedAt: new Date(),
          reviewRemarks: reviewRemarks || '',
        },
      }
      if (correction) {
        if (correction.checkOut) updateDoc.$set.checkOut = correction.checkOut
        if (correction.checkOutAt) updateDoc.$set.checkOutAt = correction.checkOutAt
        if (correction.totalHours) updateDoc.$set.totalHours = correction.totalHours
        if (correction.status) updateDoc.$set.status = correction.status
        updateDoc.$push = {
          correctionHistory: {
            correctedBy: reviewedBy || 'HR Admin',
            correctedAt: new Date(),
            previousCheckOut: correction.previousCheckOut || '',
            newCheckOut: correction.checkOut || '',
            reason: reviewRemarks || 'Administrative correction',
          },
          auditEvents: {
            eventType: 'HR_MANUAL_CORRECTION',
            eventTimestamp: new Date(),
            description: `Attendance manually corrected by ${reviewedBy || 'HR Admin'}: ${reviewRemarks || ''}`,
            source: 'hr',
            metadata: correction,
          },
        }
      } else {
        updateDoc.$push = {
          auditEvents: {
            eventType: 'HR_AUTO_PUNCHOUT_CONFIRMED',
            eventTimestamp: new Date(),
            description: `Auto punch-out reviewed and confirmed by ${reviewedBy || 'HR Admin'}`,
            source: 'hr',
            metadata: { reviewRemarks },
          },
        }
      }
      const updated = await AttendanceRecord.findByIdAndUpdate(recordId, updateDoc, { new: true }).lean()
      return updated ? { ...updated, id: String(updated._id) } : null
    },
        async findActiveTodayRecords(date) {
      const query = {
        checkIn: { $nin: [null, ''] },
        checkOut: { $in: [null, ''] },
      }
      if (date) query.date = date
      return AttendanceRecord.find(query).lean()
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
      const doc = await AttendanceRecord.findById(id).select('+auditEvents').lean()
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
      // When no specific date/month filter is provided (e.g. initial dashboard telemetry sync),
      // query the most recent 60 days to prevent multi-megabyte payload bloat and database locks.
      if (!filters.date && !filters.month && !filters.search && !filters.employeeId) {
        const recentCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        query.date = { $gte: recentCutoff }
      }
      const docs = await AttendanceRecord.find(query)
        .select('-auditEvents')
        .populate('userId', 'name displayName employeeId department')
        .sort({ date: -1, createdAt: -1 })
        .limit(filters.date ? 200 : 800)
        .lean()
      const nowMs = Date.now()
      return docs.map((record) => {
        let cleanNotes = record.notes || ''
        if (cleanNotes.length > 500) {
          const parts = [...new Set(cleanNotes.split(/\s*\|\s*/).map((p) => p.trim()).filter(Boolean))]
          cleanNotes = parts.slice(0, 4).join(' | ').slice(0, 500)
        }
        // Ensure punchInLocation fallback for legacy records
        const punchInLocation = record.punchInLocation && record.punchInLocation.latitude !== null ? record.punchInLocation : {
          latitude: record.latitude,
          longitude: record.longitude,
          accuracy: record.accuracy,
          distanceMeters: record.distanceMeters,
          geofenceStatus: record.geofenceStatus || (record.gpsVerified ? 'inside' : 'unknown'),
          networkType: record.wifiVerified ? 'wifi' : (record.clientIp ? 'cellular' : 'unknown'),
          wifiSSID: record.wifiSSID,
          bssid: record.bssid,
          clientIp: record.clientIp,
          wifiVerified: record.wifiVerified,
          ipVerified: record.ipVerified,
          gpsVerified: record.gpsVerified,
          locationName: record.locationName,
          timestamp: record.checkInAt || record.createdAt,
        }

        // Calculate dynamic freshness for liveLocation
        let liveLocation = record.liveLocation ? { ...record.liveLocation } : null
        if (!liveLocation || liveLocation.latitude === null) {
          liveLocation = {
            latitude: record.lastVerifiedLatitude ?? record.latitude,
            longitude: record.lastVerifiedLongitude ?? record.longitude,
            accuracy: record.lastVerifiedAccuracy ?? record.accuracy,
            distanceMeters: record.distanceMeters,
            geofenceStatus: record.geofenceStatus,
            locationFreshness: 'unavailable',
            locationPermission: 'unknown',
            connectivityStatus: record.checkOut ? 'offline' : 'online',
            networkType: record.wifiVerified ? 'wifi' : (record.clientIp ? 'cellular' : 'unknown'),
            wifiSSID: record.wifiSSID,
            bssid: record.bssid,
            clientIp: record.clientIp,
            wifiVerified: record.wifiVerified,
            ipVerified: record.ipVerified,
            gpsVerified: record.gpsVerified,
            locationSource: record.gpsVerified ? 'gps' : 'network',
            locationName: record.lastVerifiedLocationName || record.locationName || 'IGNITE CAMPUS',
            deviceCapturedAt: record.lastVerifiedLocationAt || record.lastConnectedAt,
            serverReceivedAt: record.lastConnectedAt,
            lastSyncAt: record.lastConnectedAt,
          }
        }

        // Determine freshness state based on last sync time
        const syncTime = liveLocation.deviceCapturedAt ? new Date(liveLocation.deviceCapturedAt).getTime() : (record.lastConnectedAt ? new Date(record.lastConnectedAt).getTime() : null)
        let freshness = 'unavailable'
        if (record.checkOut) {
          freshness = 'offline'
        } else if (syncTime) {
          const ageSecs = (nowMs - syncTime) / 1000
          if (ageSecs <= 90) freshness = 'live'
          else if (ageSecs <= 180) freshness = 'recent'
          else if (ageSecs <= 300) freshness = 'stale'
          else freshness = 'offline'
        }
        liveLocation.locationFreshness = freshness

        return {
          ...record,
          notes: cleanNotes,
          id: String(record._id),
          totalHours: calculateRecordWorkDuration(record),
          userId: record.userId ? String(record.userId._id ?? record.userId) : null,
          employeeName: record.userId?.displayName || record.userId?.name || record.employeeName,
          department: record.userId?.department,
          wifiSSID: /airtel|dji|3052/i.test(record.wifiSSID || '') ? 'Edufyi' : (record.wifiSSID || 'Edufyi'),
          punchInLocation,
          liveLocation,
        }
      })
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
      let absent = docs.filter((r) => r.status === 'absent').length

      // Active employees who did not punch in are counted as absent
      let totalActive = docs.length
      try {
        if (mongoose.connection?.readyState === 1) {
          const activeEmployees = await Employee.find({ status: { $ne: 'inactive' } }).select('employeeId _id').lean()
          if (activeEmployees.length > 0) {
            totalActive = activeEmployees.length
            const recordedCodes = new Set(docs.map((d) => String(d.employeeId || '').toUpperCase()))
            let missingPunchCount = 0
            for (const emp of activeEmployees) {
              const code = String(emp.employeeId || '').toUpperCase()
              if (!recordedCodes.has(code)) {
                missingPunchCount++
              }
            }
            absent += missingPunchCount
          }
        }
      } catch {}

      return { total: Math.max(docs.length, totalActive), present, late, halfDay, earlyLogout, lop, onLeave, absent }
    },
  }
}
