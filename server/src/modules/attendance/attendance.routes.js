import express from 'express'
import mongoose from 'mongoose'
import { PERMISSIONS, hasPermission } from '../../auth/permissions.js'
import { Employee } from '../../models/Employee.js'
import { AttendanceSettings } from '../../models/AttendanceSettings.js'
import { Shift } from '../../models/Shift.js'
import { ShiftAssignment } from '../../models/ShiftAssignment.js'
import { AuditLog } from '../../models/AuditLog.js'
import { STANDARD_SHIFT_DEF, normalizeShiftConfig, parseTimeToMinutes, formatMinutesToTime } from './policyEngine.js'
import { getTodayString } from './attendance.service.js'
import { LeavePolicy } from '../../models/LeavePolicy.js'
import { ensureConnected } from '../leave/leave.repository.js'
import { isIP } from 'node:net'

function getClientIp(req) {
  let ip = (req.ip || req.socket?.remoteAddress || '').trim()
  if (ip.startsWith('::ffff:')) ip = ip.slice(7)
  if (ip === '::1') ip = '127.0.0.1'
  return ip
}

export function createAttendanceRouter({ auth, service, useDatabase = false, persistenceAvailable = true }) {
  const router = express.Router()
  if (!persistenceAvailable) router.use(auth.authenticate, (request, response) => {
    response.status(503).json({ success: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Attendance requires MongoDB. No temporary attendance records will be saved.' } })
  })
  if (useDatabase) router.use(auth.authenticate, async (request, response, next) => {
    try {
      ensureConnected()
      const saved = (await AttendanceSettings.findOne({ key: 'office' }).sort({ updatedAt: -1 }).lean()) ||
        (await AttendanceSettings.findOne({ $or: [{ key: null }, { key: { $exists: false } }] }).sort({ updatedAt: -1 }).lean())
      const sanitizeSsid = (s) => (/airtel|dji|3052/i.test(s || '') ? 'Edufyi' : s)
      const cleanAllowedSSIDs = [
        ...new Set((saved?.allowedWifiSSIDs ?? []).map(sanitizeSsid).filter(Boolean)),
      ]
      if (!cleanAllowedSSIDs.some((s) => /edufyi/i.test(s))) {
        cleanAllowedSSIDs.unshift('edufyi')
      }
      const cleanOfficeIPs = (saved?.officeNetworkIPs ?? []).map((entry) => ({
        ...entry,
        label: /airtel|dji|3052/i.test(entry.label || '') ? 'Edufyi (IGNITE CAMPUS)' : (entry.label || 'Office Network'),
      }))
      const cleanWifiNetworks = (saved?.wifiNetworks ?? []).map((n) => ({
        ...n,
        ssid: /airtel|dji|3052/i.test(n.ssid || '') ? 'Edufyi' : (n.ssid || 'Edufyi'),
      }))
      service.updateConfig({
        locations: saved?.locations && saved.locations.length > 0 ? saved.locations : undefined,
        officeNetworkIPs: cleanOfficeIPs,
        allowedWifiSSIDs: cleanAllowedSSIDs,
        wifiNetworks: cleanWifiNetworks,
        attendanceRules: saved?.attendanceRules ?? {},
        leavePolicies: saved?.leavePolicies ?? {},
        helpDeskSettings: saved?.helpDeskSettings ?? {},
        holidayCalendarImages: saved?.holidayCalendarImages ?? [],
      })
      next()
    } catch (error) { next(error) }
  })
  router.patch('/config', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const allowed = ['officeNetworkIPs', 'locations', 'allowedWifiSSIDs', 'wifiNetworks', 'attendanceRules', 'leavePolicies', 'helpDeskSettings', 'holidayCalendarImages']
      const values = Object.fromEntries(allowed.filter((key) => request.body?.[key] !== undefined).map((key) => [key, request.body[key]]))
      if (values.officeNetworkIPs) {
        if (!Array.isArray(values.officeNetworkIPs)) throw Object.assign(new Error('Enter valid office IP addresses.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
        values.officeNetworkIPs = values.officeNetworkIPs.map((entry) => {
          let ip = (entry.ip || '').trim()
          if (/\.\*$/.test(ip) || /\.x$/i.test(ip)) {
            ip = ip.replace(/(\.[\*x])$/i, '.0/24')
          }
          return { ...entry, ip }
        })
        if (values.officeNetworkIPs.some((entry) => {
          const ip = entry.ip
          if (isIP(ip)) return false
          if (ip.includes('/')) {
            const [addr, prefix] = ip.split('/')
            const fam = isIP(addr)
            const bits = Number(prefix)
            if (fam && /^\d+$/.test(prefix) && bits > 0 && bits <= (fam === 4 ? 32 : 128)) return false
          }
          return true
        })) {
          throw Object.assign(new Error('Enter valid office IP addresses or CIDR/wildcard subnets (e.g. 192.168.1.0/24 or 192.168.1.*).'), { statusCode: 400, code: 'VALIDATION_ERROR' })
        }
      }
      if (values.locations) {
        if (!Array.isArray(values.locations)) throw Object.assign(new Error('Locations must be an array.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
        for (const loc of values.locations) {
          if (!loc.name) throw Object.assign(new Error('Each location requires a name.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
          if (loc.lat !== undefined && loc.lat !== null && loc.lat !== '') {
            loc.lat = Number(loc.lat)
            if (!Number.isFinite(loc.lat) || loc.lat < -90 || loc.lat > 90) {
              throw Object.assign(new Error(`Invalid latitude for location "${loc.name}". Must be between -90 and 90.`), { statusCode: 400, code: 'VALIDATION_ERROR' })
            }
          }
          if (loc.lng !== undefined && loc.lng !== null && loc.lng !== '') {
            loc.lng = Number(loc.lng)
            if (!Number.isFinite(loc.lng) || loc.lng < -180 || loc.lng > 180) {
              throw Object.assign(new Error(`Invalid longitude for location "${loc.name}". Must be between -180 and 180.`), { statusCode: 400, code: 'VALIDATION_ERROR' })
            }
          }
          if (loc.radiusMeters !== undefined && loc.radiusMeters !== null && loc.radiusMeters !== '') {
            loc.radiusMeters = Number(loc.radiusMeters)
            if (!Number.isFinite(loc.radiusMeters) || loc.radiusMeters < 1 || loc.radiusMeters > 1000) {
              throw Object.assign(new Error(`Invalid radius for location "${loc.name}". Must be between 1 and 1000 meters.`), { statusCode: 400, code: 'VALIDATION_ERROR' })
            }
          }
        }
      }
      if (values.attendanceRules?.maxGeofenceRadiusMeters !== undefined) {
        const r = Number(values.attendanceRules.maxGeofenceRadiusMeters)
        if (!Number.isFinite(r) || r < 1 || r > 1000) {
          throw Object.assign(new Error('Max geofence radius must be between 1 and 1000 meters.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
        }
      }
      if (useDatabase) {
        ensureConnected()
        const existingDoc = (await AttendanceSettings.findOne({ key: 'office' }).sort({ updatedAt: -1 }).lean()) ||
          (await AttendanceSettings.findOne({ $or: [{ key: null }, { key: { $exists: false } }] }).sort({ updatedAt: -1 }).lean())
        if (values.attendanceRules) {
          values.attendanceRules = {
            ...(existingDoc?.attendanceRules || {}),
            ...values.attendanceRules,
          }
        }
        if (values.helpDeskSettings) {
          values.helpDeskSettings = {
            ...(existingDoc?.helpDeskSettings || {}),
            ...values.helpDeskSettings,
          }
        }
        const saved = await AttendanceSettings.findOneAndUpdate(
          { key: 'office' },
          { $set: { ...values, key: 'office' } },
          { upsert: true, new: true, returnDocument: 'after' }
        ).lean()
        await AttendanceSettings.deleteMany({ key: { $ne: 'office' } }).catch(() => {})
        service.updateConfig(saved || values)

        // Synchronize default Shift collection with admin configured work shift timings
        if (values.attendanceRules?.workStartTime && values.attendanceRules?.workEndTime) {
          const sMins = parseTimeToMinutes(values.attendanceRules.workStartTime)
          const eMins = parseTimeToMinutes(values.attendanceRules.workEndTime)
          const gMins = Number(values.attendanceRules.gracePeriodMinutes) > 0 ? Number(values.attendanceRules.gracePeriodMinutes) : 30
          if (sMins !== null && eMins !== null) {
            const shiftName = `General (${formatMinutesToTime(sMins)} – ${formatMinutesToTime(eMins)})`
            await Shift.updateMany({}, { $set: { isDefault: false } }).catch(() => {})
            await Shift.findOneAndUpdate(
              { shiftId: 'GENERAL' },
              {
                $set: {
                  shiftId: 'GENERAL',
                  name: shiftName,
                  startTime: formatMinutesToTime(sMins),
                  endTime: formatMinutesToTime(eMins),
                  startMinutes: sMins,
                  endMinutes: eMins,
                  isOvernight: eMins < sMins,
                  gracePeriodMinutes: gMins,
                  graceCutoffMinutes: sMins + gMins,
                  isDefault: true,
                  isActive: true,
                },
              },
              { upsert: true }
            ).catch(() => {})
            // Automatically recalculate today's attendance so changes take effect immediately
            await service.recalculateAttendance(getTodayString()).catch(() => {})
          }
        }
        if (values.leavePolicies) {
          const lp = values.leavePolicies
          const defaultApproval = lp.approvalWorkflow || (lp.requireManagerApproval && lp.requireHrApproval ? 'manager_hr' : lp.requireManagerApproval ? 'manager' : 'hr')
          if (lp.casualQuota !== undefined) {
            await LeavePolicy.findOneAndUpdate(
              { leaveType: 'casual' },
              { $set: { leaveType: 'casual', label: 'Casual Leave', configured: true, annualAllowance: Number(lp.casualQuota), approvalStage: defaultApproval } },
              { upsert: true, returnDocument: 'after' }
            )
          }
          if (lp.sickQuota !== undefined) {
            await LeavePolicy.findOneAndUpdate(
              { leaveType: 'sick' },
              { $set: { leaveType: 'sick', label: 'Sick Leave', configured: true, annualAllowance: Number(lp.sickQuota), approvalStage: defaultApproval } },
              { upsert: true, returnDocument: 'after' }
            )
          }
          if (lp.earnedQuota !== undefined) {
            await LeavePolicy.findOneAndUpdate(
              { leaveType: 'earned' },
              { $set: { leaveType: 'earned', label: 'Earned / Privilege Leave', configured: true, annualAllowance: Number(lp.earnedQuota), approvalStage: defaultApproval, carryForward: true } },
              { upsert: true, returnDocument: 'after' }
            )
          }
        }
      } else {
        service.updateConfig(values)
      }
      response.json({ success: true, data: service.getConfig() })
    } catch (error) { next(error) }
  })

  // 1. Attendance Configuration & Policy
  router.post(['/recalculate', '/recalculateToday', '/attendance/recalculate'], auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const date = request.body?.date
      const result = await service.recalculateAttendance(date)
      response.json({ success: true, data: result })
    } catch (error) { next(error) }
  })

  router.get('/config', auth.authenticate, (request, response) => {
    const rawConfig = service.getConfig()
    const isPrivileged = hasPermission(request.auth?.user, PERMISSIONS.ATTENDANCE_WRITE)
    const clientIp = getClientIp(request)
    if (isPrivileged) {
      return response.json({ success: true, data: { ...rawConfig, clientIp } })
    }
    const sanitizedConfig = {
      ...rawConfig,
      officeNetworkIPs: (rawConfig.officeNetworkIPs || []).map((entry) => ({ label: entry.label || 'Office Network' })),
      wifiNetworks: (rawConfig.wifiNetworks || []).map((n) => ({ ssid: n.ssid, branchName: n.branchName })),
      clientIp,
    }
    return response.json({ success: true, data: sanitizedConfig })
  })

  // 2. Real-time Location / Geofence / Network Verification dry-run
  router.post('/verify', auth.authenticate, (request, response) => {
    const { latitude, longitude, wifiSSID, bssid, accuracy, gpsData } = request.body || {}
    const lat = latitude !== undefined ? latitude : gpsData?.latitude
    const lng = longitude !== undefined ? longitude : gpsData?.longitude
    const acc = accuracy !== undefined ? accuracy : gpsData?.accuracy
    const clientIp = getClientIp(request)
    const verification = service.verifyLocation(lat, lng, wifiSSID, clientIp, bssid, acc)
    return response.json({ success: true, data: { ...verification, clientIp } })
  })

  // 3. Employee Self-Service Punch In
  router.post('/check-in', auth.authenticate, async (request, response, next) => {
    try {
      const user = request.auth.user
      const isPrivileged = hasPermission(user, PERMISSIONS.ATTENDANCE_WRITE)
      const requestedEmployeeId = request.body?.employeeId
      if (requestedEmployeeId && requestedEmployeeId !== (user.employeeId || user.id) && !isPrivileged) {
        const error = new Error('You are not authorized to record attendance for another employee.')
        error.statusCode = 403
        error.code = 'FORBIDDEN'
        throw error
      }
      const employeeId = (!isPrivileged || !requestedEmployeeId) ? (user.employeeId || user.id) : requestedEmployeeId
      const employeeName = (!isPrivileged || !request.body?.employeeName) ? (user.displayName || user.name || 'Employee') : request.body.employeeName
      const { latitude, longitude, accuracy, wifiSSID, bssid, date, shift, shiftCode, gpsData } = request.body || {}
      const lat = latitude !== undefined ? latitude : gpsData?.latitude
      const lng = longitude !== undefined ? longitude : gpsData?.longitude
      const acc = accuracy !== undefined ? accuracy : gpsData?.accuracy
      const clientIp = getClientIp(request)

      const record = await service.checkIn({
        employeeId,
        employeeName,
        latitude: lat,
        longitude: lng,
        accuracy: acc,
        wifiSSID,
        bssid,
        date,
        clientIp,
        shift,
        shiftCode,
      })
      return response.status(200).json({ success: true, data: record })
    } catch (error) {
      return next(error)
    }
  })

  // 3b. Employee Self-Service Break Start (Lunch, Tea, etc.)
  router.post('/break/start', auth.authenticate, async (request, response, next) => {
    try {
      const user = request.auth.user
      const isPrivileged = hasPermission(user, PERMISSIONS.ATTENDANCE_WRITE)
      const requestedEmployeeId = request.body?.employeeId
      if (requestedEmployeeId && requestedEmployeeId !== (user.employeeId || user.id) && !isPrivileged) {
        const error = new Error('You are not authorized to start breaks for another employee.')
        error.statusCode = 403
        error.code = 'FORBIDDEN'
        throw error
      }
      const employeeId = (!isPrivileged || !requestedEmployeeId) ? (user.employeeId || user.id) : requestedEmployeeId
      const { type, date } = request.body || {}
      const record = await service.startBreak({ employeeId, breakType: type || 'lunch', date })
      return response.status(200).json({ success: true, data: record })
    } catch (error) {
      return next(error)
    }
  })

  // 3c. Employee Self-Service Break End / Resume Work
  router.post('/break/end', auth.authenticate, async (request, response, next) => {
    try {
      const user = request.auth.user
      const isPrivileged = hasPermission(user, PERMISSIONS.ATTENDANCE_WRITE)
      const requestedEmployeeId = request.body?.employeeId
      if (requestedEmployeeId && requestedEmployeeId !== (user.employeeId || user.id) && !isPrivileged) {
        const error = new Error('You are not authorized to end breaks for another employee.')
        error.statusCode = 403
        error.code = 'FORBIDDEN'
        throw error
      }
      const employeeId = (!isPrivileged || !requestedEmployeeId) ? (user.employeeId || user.id) : requestedEmployeeId
      const { date } = request.body || {}
      const record = await service.endBreak({ employeeId, date })
      return response.status(200).json({ success: true, data: record })
    } catch (error) {
      return next(error)
    }
  })

  // 3d. Periodic Presence Verification & Auto Punch-Out Heartbeat (with location-update and location-heartbeat aliases)
  router.post(['/presence', '/location-update', '/location-heartbeat'], auth.authenticate, async (request, response, next) => {
    try {
      const user = request.auth.user
      const employeeId = user.employeeId || user.id
      const { latitude, longitude, wifiSSID, bssid, accuracy, gpsData, locationPermission, networkType, deviceCapturedAt } = request.body || {}
      const lat = latitude !== undefined ? latitude : gpsData?.latitude
      const lng = longitude !== undefined ? longitude : gpsData?.longitude
      const acc = accuracy !== undefined ? accuracy : gpsData?.accuracy
      const clientIp = getClientIp(request)

      const result = await service.updatePresence({
        employeeId,
        latitude: lat,
        longitude: lng,
        wifiSSID,
        clientIp,
        bssid,
        accuracy: acc,
        locationPermission,
        networkType,
        deviceCapturedAt,
      })
      return response.json({ success: true, data: { ...result, clientIp } })
    } catch (error) {
      return next(error)
    }
  })

  // 4. Employee Self-Service Punch Out
  router.post('/check-out', auth.authenticate, async (request, response, next) => {
    try {
      const user = request.auth.user
      const isPrivileged = hasPermission(user, PERMISSIONS.ATTENDANCE_WRITE)
      const requestedEmployeeId = request.body?.employeeId
      if (requestedEmployeeId && requestedEmployeeId !== (user.employeeId || user.id) && !isPrivileged) {
        const error = new Error('You are not authorized to punch out for another employee.')
        error.statusCode = 403
        error.code = 'FORBIDDEN'
        throw error
      }
      const employeeId = (!isPrivileged || !requestedEmployeeId) ? (user.employeeId || user.id) : requestedEmployeeId
      const employeeName = (!isPrivileged || !request.body?.employeeName) ? (user.displayName || user.name || 'Employee') : request.body.employeeName
      const { date, autoPunchOut, punchOutReason, offCampusDurationMinutes, completionTime, disconnectionTime } = request.body || {}

      const record = await service.checkOut({
        employeeId,
        employeeName,
        date,
        autoPunchOut: Boolean(autoPunchOut),
        punchOutReason: punchOutReason || null,
        offCampusDurationMinutes: Number(offCampusDurationMinutes) || 0,
        completionTime: completionTime || null,
        disconnectionTime: disconnectionTime || null,
      })
      return response.status(200).json({ success: true, data: record })
    } catch (error) {
      return next(error)
    }
  })

  // 5. Employee Self Attendance History
  router.get('/self', auth.authenticate, async (request, response, next) => {
    try {
      const records = await service.listSelf(request.auth.user, {
        date: request.query.date,
        status: request.query.status,
      })
      return response.json({ success: true, data: records })
    } catch (error) {
      return next(error)
    }
  })

  // 6. Employee Today Attendance
  router.get('/today', auth.authenticate, async (request, response, next) => {
    try {
      const user = request.auth.user
      const employeeId = user.employeeId || user.id
      const date = request.query.date
      const record = await service.getTodayRecord(employeeId, date)
      return response.json({ success: true, data: record })
    } catch (error) {
      return next(error)
    }
  })

  // 7. HR / Admin Daily & Monthly Summary
  router.get(
    '/summary',
    auth.authenticate,
    auth.requireAnyPermission([PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.HR_DASHBOARD_READ]),
    async (request, response, next) => {
      try {
        const summary = await service.getSummary(request.query.date)
        return response.json({ success: true, data: summary })
      } catch (error) {
        return next(error)
      }
    }
  )

  // 8. HR / Admin Attendance Roster (or Team-scoped roster for managers)
  router.get(
    '/',
    auth.authenticate,
    auth.requireAnyPermission([PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_TEAM_READ]),
    async (request, response, next) => {
      try {
        const hasOrgRead = hasPermission(request.auth.user, PERMISSIONS.ATTENDANCE_READ)
        const filters = {
          date: typeof request.query.date === 'string' ? request.query.date.trim() : undefined,
          status: typeof request.query.status === 'string' ? request.query.status.trim() : undefined,
          search: typeof request.query.search === 'string' ? request.query.search.trim() : undefined,
          employeeId: typeof request.query.employeeId === 'string' ? request.query.employeeId.trim() : undefined,
        }
        if (!hasOrgRead && useDatabase) {
          const userObjId = request.auth.user.id || request.auth.user._id
          const userEmpCode = request.auth.user.employeeId
          const teamEmployees = await Employee.find({
            $or: [
              ...(userObjId && mongoose.isValidObjectId(userObjId) ? [{ managerId: userObjId }] : []),
              ...(userEmpCode ? [{ managerId: userEmpCode }] : []),
              ...(userObjId && mongoose.isValidObjectId(userObjId) ? [{ _id: userObjId }] : []),
              ...(userEmpCode ? [{ employeeId: userEmpCode }] : []),
            ],
          }).select('employeeId').lean()
          const allowed = teamEmployees.map((e) => e.employeeId).filter(Boolean)
          filters.allowedEmployeeIds = allowed.length > 0 ? allowed : [userEmpCode || '__NONE__']
        }
        const records = await service.listAll(filters)
        return response.json({ success: true, data: records })
      } catch (error) {
        return next(error)
      }
    }
  )

  // 9. HR Manual Attendance Creation / Edit
  router.post(
    '/records',
    auth.authenticate,
    auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
    async (request, response, next) => {
      try {
        const record = await service.saveRecord(request.body || {})
        return response.status(201).json({ success: true, data: record })
      } catch (error) {
        return next(error)
      }
    }
  )

  // 10. HR Manual Attendance Update
  router.patch(
    '/records/:id',
    auth.authenticate,
    auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
    async (request, response, next) => {
      try {
        const record = await service.saveRecord({ ...request.body, id: request.params.id })
        return response.json({ success: true, data: record })
      } catch (error) {
        return next(error)
      }
    }
  )

  // 11. HR Delete Record
  router.delete(
    '/records/:id',
    auth.authenticate,
    auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE),
    async (request, response, next) => {
      try {
        const success = await service.deleteRecord(request.params.id, {
          employeeId: request.query?.employeeId,
          date: request.query?.date,
        })
        return response.json({ success })
      } catch (error) {
        return next(error)
      }
    }
  )


  // 12. List configured shifts
  router.get('/shifts', auth.authenticate, async (request, response, next) => {
    try {
      let shifts = []
      if (useDatabase) {
        shifts = await Shift.find({ isActive: true }).lean().catch(() => [])
      }
      if (!shifts || shifts.length === 0) {
        shifts = [STANDARD_SHIFT_DEF]
      }
      return response.json({ success: true, data: shifts })
    } catch (error) { next(error) }
  })

  // 13. Create or update shift definition
  router.post('/shifts', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const { shiftId, name, startTime, endTime, isDefault } = request.body || {}
      if (!shiftId || !name || !startTime || !endTime) {
        throw Object.assign(new Error('shiftId, name, startTime, and endTime are required.'), { statusCode: 400 })
      }
      const normalized = normalizeShiftConfig(request.body)
      let doc = null
      if (useDatabase) {
        if (isDefault) {
          await Shift.updateMany({ isDefault: true }, { $set: { isDefault: false } })
        }
        doc = await Shift.findOneAndUpdate(
          { shiftId: shiftId.toUpperCase() },
          { $set: { ...normalized, shiftId: shiftId.toUpperCase(), isDefault: Boolean(isDefault) } },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).lean()
      } else {
        doc = normalized
      }
      return response.status(201).json({ success: true, data: doc })
    } catch (error) { next(error) }
  })

  // 14. Assign shift to employee with effective dates & audit trail
  router.post('/shifts/assign', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const { employeeId, shiftId, effectiveFrom, effectiveTo, reason } = request.body || {}
      if (!employeeId || !shiftId || !effectiveFrom) {
        throw Object.assign(new Error('employeeId, shiftId, and effectiveFrom (YYYY-MM-DD) are required.'), { statusCode: 400 })
      }
      const cleanEmpId = String(employeeId).trim().toUpperCase()
      const cleanShiftId = String(shiftId).trim().toUpperCase()
      const cleanFrom = String(effectiveFrom).trim()
      const cleanTo = effectiveTo ? String(effectiveTo).trim() : null

      let assignment = null
      if (useDatabase) {
        assignment = await ShiftAssignment.findOneAndUpdate(
          { employeeId: cleanEmpId, effectiveFrom: cleanFrom },
          {
            $set: {
              shiftId: cleanShiftId,
              effectiveTo: cleanTo,
              assignedBy: request.auth.user.id || 'ADMIN',
              assignedAt: new Date(),
              reason: reason || 'Assigned via shift management',
            },
            $push: {
              history: {
                shiftId: cleanShiftId,
                effectiveFrom: cleanFrom,
                effectiveTo: cleanTo,
                assignedBy: request.auth.user.id || 'ADMIN',
                assignedAt: new Date(),
                reason: reason || 'Assigned via shift management',
              },
            },
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        ).lean()

        try {
          if (assignment?._id) {
            await AuditLog.create({
              actorId: request.auth.user.id || 'ADMIN',
              actorRole: request.auth.user.role || 'admin',
              action: 'SHIFT_ASSIGNMENT_CHANGED',
              entityType: 'ShiftAssignment',
              entityId: assignment._id,
              changedFields: ['shiftId', 'effectiveFrom', 'effectiveTo'],
              reason: reason || 'Shift assignment updated',
            })
          }
        } catch {}
      } else {
        assignment = { employeeId: cleanEmpId, shiftId: cleanShiftId, effectiveFrom: cleanFrom, effectiveTo: cleanTo }
      }
      return response.status(200).json({ success: true, data: assignment })
    } catch (error) { next(error) }
  })

  // 15. HR / Admin Decision on post-25th Double LOP
  router.post('/double-lop/:id/decision', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const { approved, reason } = request.body || {}
      if (approved === undefined) throw Object.assign(new Error('approved boolean is required.'), { statusCode: 400 })
      const result = await service.approveDoubleLop({
        recordId: request.params.id,
        approved: Boolean(approved),
        actor: request.auth.user,
        reason,
      })
      return response.json({ success: true, data: result })
    } catch (error) { next(error) }
  })

  // 15b. Historical Auto Punch-Out Dry-Run Audit Report
  router.get('/auto-punchout-audit', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_READ), async (request, response, next) => {
    try {
      const { runAutoPunchOutAudit } = await import('../../scripts/auditAutoPunchOutRecords.js')
      const audit = await runAutoPunchOutAudit({ direct: false })
      return response.json({ success: true, data: audit })
    } catch (error) { next(error) }
  })

  // 16. List Auto Punch-Out Records for HR/Admin Review
  router.get('/auto-punch-outs', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_READ), async (request, response, next) => {
    try {
      const { date, reviewStatus, limit, skip } = request.query || {}
      const result = await service.listAutoPunchOuts({ date, reviewStatus, limit, skip })
      return response.json({ success: true, data: result.records, total: result.total })
    } catch (error) { next(error) }
  })

  // 17. HR / Admin Review & Correction Action on Auto Punch-Out
  router.post('/auto-punch-outs/:id/review', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_WRITE), async (request, response, next) => {
    try {
      const { action, reviewRemarks, correction } = request.body || {}
      if (!action || !['confirm', 'correct'].includes(action)) {
        throw Object.assign(new Error('action must be either "confirm" or "correct".'), { statusCode: 400 })
      }
      const user = request.auth.user
      const reviewedBy = user.displayName || user.name || user.username || user.employeeId || 'HR Admin'
      const reviewStatus = action === 'correct' ? 'corrected' : 'confirmed'

      const result = await service.reviewAutoPunchOut(request.params.id, {
        reviewStatus,
        reviewedBy,
        reviewRemarks,
        correction: action === 'correct' ? correction : null,
      })
      if (!result) {
        throw Object.assign(new Error('Attendance record not found.'), { statusCode: 404 })
      }
      return response.json({ success: true, data: result })
    } catch (error) { next(error) }
  })

  // 18. Get Audit Events & Geofence History for an Attendance Record
  router.get('/records/:id/audit', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_READ), async (request, response, next) => {
    try {
      const record = await service.getRecordById ? await service.getRecordById(request.params.id) : null
      return response.json({ success: true, data: record?.auditEvents || [] })
    } catch (error) { next(error) }
  })

  // 19. Get Live Locations for Active Attendance Sessions Today
  router.get('/live-locations', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_READ), async (request, response, next) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10)
      const records = await service.listAttendance({ date: todayStr })
      const activeSessions = (records || [])
        .filter((r) => r.checkIn && !r.checkOut)
        .map((r) => ({
          recordId: r.id || r._id,
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          checkIn: r.checkIn,
          status: r.status,
          punchInLocation: r.punchInLocation || null,
          liveLocation: r.liveLocation || null,
          geofenceStatus: r.liveLocation?.geofenceStatus || r.geofenceStatus || 'unknown',
          locationFreshness: r.liveLocation?.locationFreshness || 'unavailable',
          networkType: r.liveLocation?.networkType || (r.wifiVerified ? 'wifi' : 'unknown'),
          distanceMeters: r.liveLocation?.distanceMeters ?? r.distanceMeters ?? null,
          locationName: r.liveLocation?.locationName || r.locationName || 'Ignite Campus',
          lastConnectedAt: r.lastConnectedAt,
        }))
      return response.json({ success: true, data: activeSessions })
    } catch (error) { next(error) }
  })

  // 20. Get Separated Punch-In vs Live Location History for a Record
  router.get('/records/:id/location-history', auth.authenticate, auth.requirePermission(PERMISSIONS.ATTENDANCE_READ), async (request, response, next) => {
    try {
      const record = await service.getRecordById ? await service.getRecordById(request.params.id) : null
      if (!record) {
        throw Object.assign(new Error('Attendance record not found.'), { statusCode: 404 })
      }
      return response.json({
        success: true,
        data: {
          recordId: record.id || record._id,
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          date: record.date,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          punchInLocation: record.punchInLocation || {
            latitude: record.latitude,
            longitude: record.longitude,
            accuracy: record.accuracy,
            distanceMeters: record.distanceMeters,
            wifiVerified: record.wifiVerified,
            ipVerified: record.ipVerified,
            gpsVerified: record.gpsVerified,
            locationName: record.locationName,
            timestamp: record.checkInAt || record.createdAt,
          },
          liveLocation: record.liveLocation || {
            latitude: record.lastVerifiedLatitude ?? record.latitude,
            longitude: record.lastVerifiedLongitude ?? record.longitude,
            accuracy: record.lastVerifiedAccuracy ?? record.accuracy,
            distanceMeters: record.distanceMeters,
            geofenceStatus: record.geofenceStatus,
            locationFreshness: record.checkOut ? 'offline' : 'live',
            locationName: record.lastVerifiedLocationName || record.locationName,
            lastSyncAt: record.lastConnectedAt,
          },
          auditEvents: (record.auditEvents || []).filter((e) =>
            ['CHECK_IN', 'GEOFENCE_EXIT_DETECTED', 'GEOFENCE_RETURN_VERIFIED', 'AUTO_PUNCH_OUT_GEOFENCE', 'AUTO_PUNCH_OUT_OFFLINE'].includes(e.eventType)
          ),
        },
      })
    } catch (error) { next(error) }
  })

  return router
}
