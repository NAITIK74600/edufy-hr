import {
  STANDARD_SHIFT_DEF,
  formatMinutesToTime,
  normalizeShiftConfig,
  resolveEmployeeShift,
  evaluatePunchIn,
  evaluateCheckOut,
  evaluateRepeatedOccurrences,
  evaluatePost25thDoubleLop,
} from './policyEngine.js'
import { BlockList, isIP } from 'node:net'
import mongoose from 'mongoose'
import { dispatchAttendanceNotification, createUnifiedNotification } from '../../services/unifiedNotification.service.js'
import { Employee } from '../../models/Employee.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'

export const DEFAULT_LOCATIONS = [
  {
    id: 'loc-ignite',
    name: 'IGNITE CAMPUS',
    lat: 12.9101,
    lng: 77.6517,
    radiusMeters: 100,
    city: 'Bengaluru',
    address: 'Ignite Campus, Bengaluru, Karnataka',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.0.0/8', '192.168.1.0/24'],
  },
  {
    id: 'loc-velocity',
    name: 'VELOCITY HUB',
    lat: 12.9279,
    lng: 77.6833,
    radiusMeters: 100,
    city: 'Bengaluru',
    address: 'Velocity Hub, Outer Ring Road, Bengaluru, Karnataka',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.0.0/8', '192.168.1.0/24'],
  },
  {
    id: 'loc-0',
    name: 'Edufyi HQ Noida',
    lat: 28.535516,
    lng: 77.391029,
    radiusMeters: 30,
    city: 'Noida',
    address: 'Sector 62, Noida, Uttar Pradesh',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.0.0/8', '192.168.1.0/24'],
  },
  {
    id: 'loc-1',
    name: 'HQ - San Francisco',
    lat: 37.789172,
    lng: -122.401449,
    radiusMeters: 30,
    city: 'San Francisco',
    address: '535 Mission St, San Francisco, CA',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1', '10.0.0.0/8', '192.168.1.0/24'],
  },
  {
    id: 'loc-2',
    name: 'Koramangala Innovation Hub',
    lat: 12.9352,
    lng: 77.6245,
    radiusMeters: 30,
    city: 'Bengaluru',
    address: '80 Feet Road, 4th Block, Koramangala',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  },
  {
    id: 'loc-3',
    name: 'Indiranagar Design Studio',
    lat: 12.9784,
    lng: 77.6408,
    radiusMeters: 30,
    city: 'Bengaluru',
    address: '100 Feet Road, Indiranagar',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  },
  {
    id: 'loc-4',
    name: 'Hyderabad Tech Center',
    lat: 17.4483,
    lng: 78.3915,
    radiusMeters: 30,
    city: 'Hyderabad',
    address: 'HITEC City, Madhapur',
    allowedIPs: ['127.0.0.1', '::1', '::ffff:127.0.0.1'],
  },
]

const DEFAULT_ALLOWED_WIFI = [
  'edufyi',
  'Edufyi',
  'Edufyi-Office-5G',
  'Edufyi-Corp-Secure',
  'Edufyi-Guest-HighSpeed',
]

// Registered access points. A network is trusted only when BOTH the SSID (name) and the
// BSSID (access-point hardware MAC) match — a spoofed hotspot reusing the name has a
// different BSSID. allowedIPs is the office public IP / gateway subnet the backend checks
// independently so a device off the office network can never be marked present by name alone.
const DEFAULT_WIFI_NETWORKS = [
  { ssid: 'edufyi', bssid: '', securityType: 'WPA2-Personal', branchName: 'IGNITE CAMPUS', allowedIPs: ['127.0.0.1', '::1', '10.0.0.0/8', '192.168.1.0/24', '192.168.0.0/16'] },
  { ssid: 'Edufyi', bssid: '', securityType: 'WPA2-Personal', branchName: 'IGNITE CAMPUS', allowedIPs: ['127.0.0.1', '::1', '10.0.0.0/8', '192.168.1.0/24', '192.168.0.0/16'] },
  { ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', securityType: 'WPA2-Enterprise', branchName: 'IGNITE CAMPUS', allowedIPs: ['127.0.0.1', '::1', '10.0.0.0/8', '192.168.1.0/24'] },
  { ssid: 'Edufyi-Corp-Secure', bssid: '9C:3D:CF:22:B4:02', securityType: 'WPA3-Enterprise', branchName: 'IGNITE CAMPUS', allowedIPs: ['127.0.0.1', '::1', '172.16.0.0/16'] },
  { ssid: 'Edufyi-Guest-HighSpeed', bssid: '9C:3D:CF:33:C6:03', securityType: 'WPA2-Personal', branchName: 'IGNITE CAMPUS', allowedIPs: ['127.0.0.1', '::1', '192.168.10.0/24'] },
]

// Policy-free baseline: Default attendance rules retain security parameters (geofence & network)
// Obsolete work start/end times and grace periods are removed pending new policy.
const DEFAULT_ATTENDANCE_RULES = {
  maxGeofenceRadiusMeters: 50,
  strictGeofenceRequired: false,
  requireOfficeNetworkAndGps: true,
  lunchBreakAutoPause: true,
  lunchBreakStart: '13:30',
  lunchBreakEnd: '14:30',
  autoPunchOutEnabled: true,
  autoPunchOutTime: '21:30',
  geofenceAutoPunchOutEnabled: false,
  geofenceGracePeriodMinutes: 120,
  geofenceGpsAccuracyThresholdMeters: 50,
  geofenceExitWarningEnabled: true,
  offlineAutoPunchOutEnabled: false,
  offlineGracePeriodMinutes: 120,
  offlineWarningEnabled: false,
  dailyCutoffAutoPunchOutEnabled: true,
  dailyCutoffTime: '21:30',
  dailyCutoffWarningEnabled: true,
  dailyCutoffWarningMinutesBefore: 15,
  timezone: 'Asia/Kolkata',
  applicableShifts: ['all'],
  applicableLocations: ['all'],
  applicableEmployeeGroups: ['all'],
  notifyEmployeeOnAutoPunchOut: true,
  notifyHrOnAutoPunchOut: true,
  notifyAdminOnAutoPunchOut: true,
  notifyManagerOnAutoPunchOut: true,
  sendEmailOnAutoPunchOut: false,
  sendPushOnAutoPunchOut: true,
  enableAuditLogging: true,
}

export function calculateTimeOverlapMinutes(startA, endA, startB, endB) {
  const sAM = parseTimeToMinutes(startA)
  const eAM = parseTimeToMinutes(endA)
  const sBM = parseTimeToMinutes(startB)
  const eBM = parseTimeToMinutes(endB)

  if (sAM === null || eAM === null || sBM === null || eBM === null) return 0

  const overlapStart = Math.max(sAM, sBM)
  const overlapEnd = Math.min(eAM, eBM)

  if (overlapEnd > overlapStart) {
    return overlapEnd - overlapStart
  }
  return 0
}

export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null
  const numLat1 = Number(lat1)
  const numLon1 = Number(lon1)
  const numLat2 = Number(lat2)
  const numLon2 = Number(lon2)
  if (Number.isNaN(numLat1) || Number.isNaN(numLon1) || Number.isNaN(numLat2) || Number.isNaN(numLon2)) return null

  const R = 6371000 // Earth radius in meters
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
    Math.cos((numLat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null
  const clean = String(timeStr).trim().replace(/[\u202F\u00A0]/g, ' ')
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3]?.toUpperCase()

  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

export function formatCurrentTime(d = new Date()) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
}

export function formatTime12(timeStr, referenceTime = null, isEndTime = false) {
  if (!timeStr && timeStr !== 0) return ''
  let mins = typeof timeStr === 'number' ? timeStr : parseTimeToMinutes(timeStr)
  if (mins === null) return String(timeStr)

  const hasAm = /AM/i.test(String(timeStr))
  const hasPm = /PM/i.test(String(timeStr))

  if (!hasAm && !hasPm && mins < 720) {
    if (isEndTime && referenceTime) {
      const refMins = parseTimeToMinutes(referenceTime)
      if (refMins !== null) {
        const effRef = refMins < 720 && !/AM/i.test(String(referenceTime)) ? refMins + 720 : refMins
        if ((mins + 720) > effRef && (mins + 720) - effRef <= 360) {
          mins += 720
        }
      }
    } else if (!isEndTime && referenceTime) {
      const refMins = parseTimeToMinutes(referenceTime)
      if (refMins !== null && refMins >= 720 && (refMins - (mins + 720)) >= 0 && (refMins - (mins + 720)) <= 360) {
        mins += 720
      }
    }
  }

  let hours = Math.floor(mins / 60)
  const minutes = mins % 60
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
}

export function formatTime24(timeStr, referenceTime = null, isEndTime = false) {
  if (!timeStr && timeStr !== 0) return isEndTime ? '20:00' : '11:00'
  let mins = typeof timeStr === 'number' ? timeStr : parseTimeToMinutes(timeStr)
  if (mins === null) return String(timeStr)

  const hasAm = /AM/i.test(String(timeStr))
  const hasPm = /PM/i.test(String(timeStr))

  if (!hasAm && !hasPm && mins < 720) {
    if (isEndTime && referenceTime) {
      const refMins = parseTimeToMinutes(referenceTime)
      if (refMins !== null) {
        const effRef = refMins < 720 && !/AM/i.test(String(referenceTime)) ? refMins + 720 : refMins
        if ((mins + 720) > effRef && (mins + 720) - effRef <= 360) {
          mins += 720
        }
      }
    } else if (!isEndTime && referenceTime) {
      const refMins = parseTimeToMinutes(referenceTime)
      if (refMins !== null && refMins >= 720 && (refMins - (mins + 720)) >= 0 && (refMins - (mins + 720)) <= 360) {
        mins += 720
      }
    }
  }

  const hours = Math.floor(mins / 60)
  const minutes = mins % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * @deprecated Legacy shift and lateness resolution functions.
 * In the neutral policy baseline, automatic late classification and shift fallbacks are disabled.
 */
export function getNormalizedShiftMinutes(startTimeStr) {
  return parseTimeToMinutes(startTimeStr) ?? null
}

export function extractShiftTimes(shiftStr) {
  let startTime = null
  let endTime = null
  if (shiftStr && typeof shiftStr === 'string') {
    const match = shiftStr.match(/\((.+?)\s*[-–—]\s*(.+?)\)/)
    if (match) {
      startTime = match[1].trim()
      endTime = match[2].trim()
    }
  }
  return {
    startTime,
    endTime,
    hasExplicitTimes: Boolean(startTime && endTime),
  }
}

export function resolveShift(options = {}) {
  const shiftStr = typeof options === 'string' ? options : options?.shift
  const shiftCode = typeof options === 'string' ? null : options?.shiftCode
  let startTime = null
  let endTime = null

  if (shiftStr && typeof shiftStr === 'string') {
    const extracted = extractShiftTimes(shiftStr)
    startTime = extracted.startTime
    endTime = extracted.endTime
  }

  const rawConfig = {
    shiftId: shiftCode || 'STANDARD',
    name: shiftStr || STANDARD_SHIFT_DEF.name,
    startTime: startTime || STANDARD_SHIFT_DEF.startTime,
    endTime: endTime || STANDARD_SHIFT_DEF.endTime,
  }
  const norm = normalizeShiftConfig(rawConfig)
  return {
    code: norm.shiftId.toLowerCase(),
    name: norm.name,
    display: norm.name,
    startTime: norm.startTime,
    endTime: norm.endTime,
    startMins: norm.startMinutes,
    endMins: norm.endMinutes,
    isOvernight: norm.isOvernight,
    gracePeriodMinutes: norm.gracePeriodMinutes,
    graceCutoffMinutes: norm.graceCutoffMinutes,
    halfDayCutoffMinutes: norm.halfDayCutoffMinutes,
    earlyLogoutWindow: norm.earlyLogoutWindow,
  }
}

export function evaluateShiftLateness(checkInTime, employeeId = null, workDate = null) {
  if (checkInTime && typeof checkInTime === 'object') {
    return {
      isLate: false,
      isHalfDay: false,
      lateMinutes: 0,
      policyPending: true,
      status: 'present',
    }
  }
  const evalResult = evaluatePunchIn({
    checkInTime,
    shift: STANDARD_SHIFT_DEF,
  });
  return {
    isLate: evalResult.isLate,
    isHalfDay: evalResult.isHalfDay,
    lateMinutes: evalResult.lateMinutes,
    status: evalResult.status,
    occurrence: evalResult.occurrence,
    notes: evalResult.notes,
  };
}

export function getTodayString() {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
  return formatter.format(new Date())
}

function getCurrentMinutes(d = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
  const parts = formatter.formatToParts(d)
  let hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
  if (hour === 24) hour = 0
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10)
  return hour * 60 + minute
}

function isPrivateIpv4(ip) {
  if (!ip || typeof ip !== 'string') return false
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return false
  if (parts[0] === 10) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true
  if (parts[0] === 127) return true
  return false
}

function isIpMatching(clientIp, allowedIPs = []) {
  if (!clientIp) return false
  let cleanIp = clientIp.replace(/^::ffff:/, '').trim()
  if (cleanIp === '::1') cleanIp = '127.0.0.1'
  const family = isIP(cleanIp)
  if (!family) return false
  return allowedIPs.some((allowed) => {
    let cleanAllowed = (allowed || '').replace(/^::ffff:/, '').trim()
    if (cleanAllowed === '::1') cleanAllowed = '127.0.0.1'
    if (cleanAllowed === cleanIp) return true
    if (cleanAllowed === '127.0.0.1' && (cleanIp === '127.0.0.1' || cleanIp === 'localhost')) return true

    // Wildcard notation support (e.g. 192.168.1.* or 192.168.1.x)
    if (/\.\*$/.test(cleanAllowed) || /\.x$/i.test(cleanAllowed)) {
      cleanAllowed = cleanAllowed.replace(/(\.[\*x])$/i, '.0/24')
    }

    if (cleanAllowed.includes('/')) {
      const [address, prefix] = cleanAllowed.split('/')
      const addressFamily = isIP(address)
      const bits = Number(prefix)
      if (addressFamily === family && /^\d+$/.test(prefix) && bits > 0 && bits <= (family === 4 ? 32 : 128)) {
        try {
          const list = new BlockList()
          const type = family === 4 ? 'ipv4' : 'ipv6'
          list.addSubnet(address, bits, type)
          if (list.check(cleanIp, type)) return true
        } catch { }
      }
      return false
    }

    // IPv4 Private Subnet / Gateway matching:
    // When connected to the same office Wi-Fi router (e.g. 192.168.1.x or 10.x.x.x),
    // each device's last octet differs (192.168.1.15 vs 192.168.1.18).
    // If both client and allowed IP are in the private address space and share the /24 prefix, they match!
    if (family === 4 && isIP(cleanAllowed) === 4) {
      if (isPrivateIpv4(cleanAllowed) && isPrivateIpv4(cleanIp)) {
        const allowedParts = cleanAllowed.split('.')
        const clientParts = cleanIp.split('.')
        if (allowedParts[0] === clientParts[0] && allowedParts[1] === clientParts[1] && allowedParts[2] === clientParts[2]) {
          return true
        }
      }
    }

    // IPv6 /64 router prefix matching (for randomized temporary SLAAC addresses)
    if (family === 6 && isIP(cleanAllowed) === 6) {
      try {
        const list = new BlockList()
        list.addSubnet(cleanAllowed, 64, 'ipv6')
        if (list.check(cleanIp, 'ipv6')) return true
      } catch { }
    }

    return false
  })
}

export function createAttendanceService({ repository, companySettings = {}, leaveRepository = null }) {
  let isProcessingAutoPunchOuts = false
  let locations = companySettings.locations || []
  let allowedWifiSSIDs = companySettings.allowedWifiSSIDs || []
  let wifiNetworks = companySettings.wifiNetworks || []
  let officeNetworkIPs = companySettings.officeNetworkIPs || []
  let attendanceRules = { ...DEFAULT_ATTENDANCE_RULES, ...(companySettings.attendanceRules || {}) }
  let holidayCalendarImages = companySettings.holidayCalendarImages || []
  let helpDeskSettings = companySettings.helpDeskSettings || {
    supportEmail: 'admin@edufyitech.in',
    itSupportEmail: 'itsupport@edufyitech.in',
    hrSupportEmail: 'hr@edufyitech.in',
    payrollSupportEmail: 'hr@edufyitech.in',
    facilitiesEmail: 'admin@edufyitech.in',
    generalSupportEmail: 'admin@edufyitech.in',
    defaultPriority: 'Medium',
    autoAssignToManager: true,
    emailNotificationsEnabled: true,
  }
  let leavePolicies = companySettings.leavePolicies || {
    casualQuota: 12,
    sickQuota: 10,
    earnedQuota: 15,
    compOffQuota: 2,
    maxCarryForwardDays: 8,
    requireManagerApproval: true,
    requireHrApproval: true,
    approvalWorkflow: 'manager_hr',
  }

  async function getApprovedLeaveForDate(employeeId, workDate) {
    if (!employeeId || !workDate) return null
    try {
      let empObjId = null
      let empCode = null

      if (mongoose.isValidObjectId(employeeId)) {
        empObjId = new mongoose.Types.ObjectId(String(employeeId))
      } else {
        empCode = String(employeeId).trim()
      }

      if (mongoose.connection?.readyState === 1) {
        if (!empObjId && empCode) {
          const empDoc = await Employee.findOne({
            $or: [
              { employeeId: empCode },
              { employeeId: empCode.toUpperCase() },
              { employeeId: empCode.toLowerCase() },
              { employeeId: new RegExp('^' + empCode.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', 'i') },
            ]
          }).select('_id employeeId').lean()
          if (empDoc?._id) {
            empObjId = empDoc._id
            if (empDoc.employeeId) empCode = empDoc.employeeId
          }
        }

        if (empObjId && !empCode) {
          const empDoc = await Employee.findById(empObjId).select('employeeId').lean()
          if (empDoc?.employeeId) {
            empCode = empDoc.employeeId
          }
        }

        const targetDateStart = new Date(`${workDate}T00:00:00.000Z`)
        const targetDateEnd = new Date(`${workDate}T23:59:59.999Z`)

        // Only query with valid ObjectIds in LeaveRequest because employeeId schema path is ObjectId!
        const idConditions = []
        if (empObjId && mongoose.isValidObjectId(empObjId)) {
          idConditions.push({ employeeId: empObjId })
        }

        if (idConditions.length > 0) {
          const req = await LeaveRequest.findOne({
            $or: idConditions,
            status: 'approved',
            $and: [
              {
                $or: [
                  { startDate: { $lte: targetDateEnd }, endDate: { $gte: targetDateStart } },
                  { 'dayBreakdown.date': workDate },
                ]
              }
            ]
          }).lean()

          if (req) {
            let dayInfo = null
            if (Array.isArray(req.dayBreakdown) && req.dayBreakdown.length > 0) {
              dayInfo = req.dayBreakdown.find((d) => d.date === workDate)
            }
            const isPaid = dayInfo ? Boolean(dayInfo.isPaid) : (req.paidUnits > 0 || (req.leaveType !== 'lop' && req.leaveType !== 'double_lop'))
            return {
              id: String(req._id),
              leaveType: req.leaveType,
              isHalfDay: Boolean(req.isHalfDay || req.units === 0.5),
              halfDayPeriod: req.halfDayPeriod || (req.isHalfDay ? 'first_half' : null),
              isPaid,
              isDoubleLop: Boolean(req.isDoubleLop || dayInfo?.isDoubleLop),
            }
          }
        }
      }

      if (leaveRepository?.listRequests) {
        const requests = await leaveRepository.listRequests({ employeeId: empObjId || employeeId })
        const match = (requests || []).find((r) => {
          if (r.status !== 'approved') return false
          const sStr = typeof r.startDate === 'string' ? r.startDate.slice(0, 10) : new Date(r.startDate).toISOString().slice(0, 10)
          const eStr = typeof r.endDate === 'string' ? r.endDate.slice(0, 10) : new Date(r.endDate).toISOString().slice(0, 10)
          const inRange = workDate >= sStr && workDate <= eStr
          const inBreakdown = Array.isArray(r.dayBreakdown) && r.dayBreakdown.some((d) => d.date === workDate)
          return inRange || inBreakdown
        })
        if (match) {
          return {
            id: String(match.id || match._id),
            leaveType: match.leaveType,
            isHalfDay: Boolean(match.isHalfDay || match.units === 0.5),
            halfDayPeriod: match.halfDayPeriod || (match.isHalfDay ? 'first_half' : null),
            isPaid: match.paidUnits > 0 || (match.leaveType !== 'lop' && match.leaveType !== 'double_lop'),
            isDoubleLop: Boolean(match.isDoubleLop),
          }
        }
      }
    } catch (err) {
      console.warn('[AttendanceService] getApprovedLeaveForDate error:', err?.message || err)
    }
    return null
  }

  async function ensureDailyAbsenceRecords(workDate = getTodayString()) {
    try {
      if (mongoose.connection?.readyState !== 1) return
      const activeEmps = await Employee.find({ status: 'active' }).select('employeeId _id name displayName department').lean()
      if (!activeEmps || activeEmps.length === 0) return

      const dayDocs = await repository.list({ date: workDate })
      const punchedMap = new Map()
      for (const d of (dayDocs || [])) {
        if (d.employeeId) punchedMap.set(String(d.employeeId).toUpperCase(), d)
      }

      for (const emp of activeEmps) {
        const code = String(emp.employeeId || '').toUpperCase()
        if (!code) continue
        const existingRec = punchedMap.get(code)
        // Check if employee has approved leave
        const approvedLeave = await getApprovedLeaveForDate(emp.employeeId || emp._id, workDate)

        if (existingRec && existingRec.checkIn) {
          // If already punched in and has approved half-day leave, heal any stale late / LOP penalties
          if (approvedLeave && approvedLeave.isHalfDay) {
            const isPaidHalf = approvedLeave.paidUnits > 0 || (approvedLeave.leaveType !== 'lop' && approvedLeave.leaveType !== 'double_lop')
            const resShift = await resolveEmployeeShift(existingRec.employeeId, workDate)
            const punchEval = evaluatePunchIn({ checkInTime: existingRec.checkIn, shift: resShift.shift, approvedLeave })

            const needsHealing = (
              existingRec.isLate !== punchEval.isLate ||
              !existingRec.isHalfDay ||
              !existingRec.approvedLeave ||
              existingRec.policyEvaluation?.occurrence !== punchEval.occurrence ||
              (isPaidHalf && (existingRec.isLop || existingRec.isDoubleLop || (existingRec.penaltyDays && existingRec.penaltyDays > 0)))
            )

            if (needsHealing) {
              existingRec.isLate = punchEval.isLate
              existingRec.isHalfDay = true
              existingRec.halfDayPeriod = approvedLeave.halfDayPeriod || existingRec.halfDayPeriod || 'first_half'
              existingRec.status = punchEval.isLate ? 'late' : 'half-day'
              existingRec.approvedLeave = {
                id: approvedLeave.id,
                leaveType: approvedLeave.leaveType,
                halfDayPeriod: approvedLeave.halfDayPeriod,
                isPaid: approvedLeave.isPaid,
                isDoubleLop: approvedLeave.isDoubleLop,
              }
              existingRec.policyEvaluation = {
                ...(existingRec.policyEvaluation || {}),
                punch: punchEval,
                occurrence: punchEval.occurrence,
                notes: punchEval.notes,
                isLate: punchEval.isLate,
                isHalfDay: true,
              }
              existingRec.notes = punchEval.notes || `Approved Half-Day Leave (${approvedLeave.leaveType})`
              if (!punchEval.isLate) {
                // If on-time arrival for second half, recompute monthly lateCount so today does NOT add an infraction
                const monthKey = workDate.slice(0, 7)
                const priorMonthRecords = await repository.list({ employeeId: existingRec.employeeId.toUpperCase(), month: monthKey })
                const priorLates = (priorMonthRecords || []).filter(r => r.date !== workDate && (r.isLate || r.status === 'late') && r.policyEvaluation?.occurrence !== 'half_day_leave_on_time').length
                existingRec.lateCount = priorLates
              }
              if (isPaidHalf) {
                existingRec.isLop = false
                existingRec.penaltyDays = 0
                existingRec.doubleLopStatus = 'none'
                existingRec.isDoubleLop = false
              }
              await repository.save(existingRec)
            }
          }
          continue // Already punched in
        }
        if (approvedLeave && !approvedLeave.isHalfDay) {
          // On approved full-day leave
          if (!existingRec) {
            await repository.save({
              employeeId: code,
              employeeName: emp.displayName || emp.name || 'Employee',
              date: workDate,
              status: 'on-leave',
              isLate: false,
              isHalfDay: false,
              checkIn: null,
              checkOut: null,
              totalHours: '0.0 hrs',
              notes: `On Approved ${approvedLeave.leaveType ? approvedLeave.leaveType.toUpperCase() : 'Leave'}`,
            })
          } else if (existingRec.status !== 'on-leave' && !existingRec.checkIn) {
            await repository.save({
              ...existingRec,
              status: 'on-leave',
              notes: `On Approved ${approvedLeave.leaveType ? approvedLeave.leaveType.toUpperCase() : 'Leave'}`,
            })
          }
        } else if (approvedLeave && approvedLeave.isHalfDay) {
          // Half-day leave but NO punch-in recorded for the working half -> unpunched half is absent
          if (!existingRec) {
            await repository.save({
              employeeId: code,
              employeeName: emp.displayName || emp.name || 'Employee',
              date: workDate,
              status: 'absent',
              isLate: false,
              isHalfDay: true,
              halfDayPeriod: approvedLeave.halfDayPeriod,
              checkIn: null,
              checkOut: null,
              totalHours: '0.0 hrs',
              notes: `Approved 1/2 Day Leave (${approvedLeave.leaveType || 'Leave'}) - Missing punch for working half (Absent)`,
            })
          }
        } else {
          // No leave and no punch-in -> ABSENT!
          if (!existingRec) {
            await repository.save({
              employeeId: code,
              employeeName: emp.displayName || emp.name || 'Employee',
              date: workDate,
              status: 'absent',
              isLate: false,
              isHalfDay: false,
              checkIn: null,
              checkOut: null,
              totalHours: '0.0 hrs',
              notes: 'Absent (No punch-in recorded)',
            })
          } else if (!existingRec.checkIn && existingRec.status !== 'absent') {
            await repository.save({
              ...existingRec,
              status: 'absent',
              notes: 'Absent (No punch-in recorded)',
            })
          }
        }
      }
    } catch (err) {
      console.warn('[AttendanceService] ensureDailyAbsenceRecords error:', err?.message || err)
    }
  }

  function verifyLocation(latitude, longitude, wifiSSID, clientIp, bssid = null, accuracy = null) {
    const cleanSsid = wifiSSID ? String(wifiSSID).trim() : ''
    const isSsidKnown = Boolean(
      cleanSsid && (
        allowedWifiSSIDs.some((s) => s.trim().toLowerCase() === cleanSsid.toLowerCase()) ||
        wifiNetworks.some((n) => n.ssid && n.ssid.trim().toLowerCase() === cleanSsid.toLowerCase())
      )
    )
    const matchedNetwork = wifiNetworks.find((n) => n.ssid && n.ssid.trim().toLowerCase() === cleanSsid.toLowerCase() && (n.status ? n.status === 'active' : true))
    const normalizedBssid = bssid ? String(bssid).toUpperCase().trim() : null
    const isBssidVerified = Boolean(
      matchedNetwork && matchedNetwork.bssid && normalizedBssid && matchedNetwork.bssid.toUpperCase() === normalizedBssid
    )

    let nearestLocation = null
    let minDistance = Infinity

    const latNum = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null
    const lngNum = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null
    const hasValidCoords = (
      latNum !== null &&
      lngNum !== null &&
      Number.isFinite(latNum) &&
      Number.isFinite(lngNum) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lngNum >= -180 &&
      lngNum <= 180
    )

    if (hasValidCoords) {
      locations.forEach((loc) => {
        if (loc.lat !== undefined && loc.lng !== undefined && loc.lat !== null && loc.lng !== null) {
          const dist = calculateDistanceMeters(latNum, lngNum, loc.lat, loc.lng)
          if (dist !== null && dist < minDistance) {
            minDistance = dist
            nearestLocation = loc
          }
        }
      })
    }

    const maxAllowedRadius = Number(nearestLocation?.radiusMeters) || Number(attendanceRules.maxGeofenceRadiusMeters) || 50
    const hasGps = hasValidCoords && minDistance !== Infinity
    const numAccuracy = typeof accuracy === 'number' && Number.isFinite(accuracy) ? accuracy : null
    const accurateGps = numAccuracy !== null ? (numAccuracy >= 0 && numAccuracy <= 250) : true
    const gpsConfidenceTolerance = Math.min(Math.max(0, (numAccuracy || 0) * 0.35), 35)
    const isGpsVerified = Boolean(
      hasGps &&
      accurateGps &&
      (minDistance <= maxAllowedRadius || (minDistance - gpsConfidenceTolerance) <= maxAllowedRadius)
    )

    // Network verification: Standard browser APIs cannot reliably access router SSID or BSSID.
    // They are descriptive metadata only and NOT used for authentication.
    // The server verifies the client's request IP against registered office network IPs.
    const networkAllowedIPs = matchedNetwork?.allowedIPs || []
    const branchAllowedIPs = nearestLocation?.allowedIPs || []
    const registeredOfficeIPs = officeNetworkIPs.map((entry) => entry.ip).filter(Boolean)
    const isIpVerified = isIpMatching(clientIp, [...registeredOfficeIPs, ...branchAllowedIPs, ...networkAllowedIPs])

    // Corporate network is verified strictly via cryptographic TCP source IP:
    const isWifiVerified = Boolean(isIpVerified)
    const isNetworkVerified = Boolean(isIpVerified)
    const isWifiTrusted = isWifiVerified

    let method = 'remote'
    if (isIpVerified && isGpsVerified) {
      method = 'wifi_and_gps'
    } else if (isGpsVerified) {
      method = 'gps_geofence'
    } else if (isIpVerified) {
      method = 'office_network'
    } else if (isBssidVerified) {
      method = 'wifi_metadata_only'
    }

    // Strict punch-in rule: Allow attendance punch-in only when both the network IP check and GPS check pass.
    let isEligible = false
    if (attendanceRules.requireOfficeNetworkAndGps) {
      isEligible = Boolean(isGpsVerified && isIpVerified)
    } else if (attendanceRules.strictGeofenceRequired) {
      isEligible = Boolean(isGpsVerified)
    } else {
      isEligible = Boolean(isIpVerified || isGpsVerified)
    }

    // Clear feedback explaining whether network verification or GPS verification failed
    let failureReason = null
    let message = 'Attendance verification successful.'

    if (!isEligible) {
      if (!isIpVerified && !isGpsVerified) {
        failureReason = 'NETWORK_AND_GPS_FAILED'
        message = `Both Office Network (IP) and GPS Geofence verification failed. Connect to registered office Wi-Fi and verify you are within ${maxAllowedRadius}m of ${nearestLocation?.name || 'the office'}.`
      } else if (!isIpVerified) {
        failureReason = 'NETWORK_VERIFICATION_FAILED'
        message = `Office Network verification failed: Request IP (${clientIp || 'unknown'}) is not on the registered office network. Please connect to the office Wi-Fi network.`
      } else if (!isGpsVerified) {
        failureReason = 'GPS_VERIFICATION_FAILED'
        if (!hasValidCoords) {
          message = 'GPS verification failed: Real-time device location is required to verify physical presence within the office geofence.'
        } else if (!accurateGps) {
          message = `GPS verification failed: Device location accuracy (±${Math.round(numAccuracy)}m) is too poor. Move to an area with clear reception.`
        } else {
          message = `GPS geofence verification failed: You are ${minDistance !== Infinity ? Math.round(minDistance) + 'm' : 'outside'} away from ${nearestLocation?.name || 'the office'} (permitted radius: ${maxAllowedRadius}m).`
        }
      } else {
        failureReason = 'VERIFICATION_FAILED'
        message = 'Physical presence verification failed.'
      }
    }

    let gatewaySubnet = null
    if (clientIp) {
      const clean = clientIp.replace(/^::ffff:/, '').trim()
      if (clean.includes('.')) {
        const parts = clean.split('.')
        if (parts.length === 4) {
          gatewaySubnet = `${parts[0]}.${parts[1]}.${parts[2]}.* (/24)`
        }
      } else if (clean.includes(':')) {
        const parts = clean.split(':').filter(Boolean)
        gatewaySubnet = `${parts.slice(0, 4).join(':')}::/64`
      }
    }

    return {
      isSsidKnown,
      isBssidVerified,
      isWifiVerified,
      isNetworkVerified,
      isWifiTrusted,
      isGpsVerified,
      isIpVerified,
      gatewaySubnet,
      accuracyAcceptable: accurateGps,
      strictGeofenceRequired: attendanceRules.strictGeofenceRequired,
      requireOfficeNetworkAndGps: attendanceRules.requireOfficeNetworkAndGps,
      hasGps,
      hasValidCoords,
      bssid: normalizedBssid,
      expectedBssid: matchedNetwork?.bssid || null,
      securityType: matchedNetwork?.securityType || null,
      distanceMeters: hasGps ? minDistance : null,
      maxAllowedRadius,
      nearestLocation: nearestLocation ? nearestLocation.name : (locations.find((l) => /ignite/i.test(l.name))?.name || locations[0]?.name || 'IGNITE CAMPUS'),
      matchedNetworkLabel: (() => {
        const found = officeNetworkIPs.find((entry) => isIpMatching(clientIp, [entry.ip]))?.label || null
        if (/airtel|dji|3052/i.test(found || '')) return 'Edufyi (IGNITE CAMPUS)'
        return found
      })(),
      isEligible,
      method,
      failureReason,
      message,
    }
  }

  return {
    verifyLocation,

    getConfig() {
      return {
        locations,
        officeNetworkIPs,
        allowedWifiSSIDs,
        wifiNetworks: wifiNetworks.map((n) => ({ ssid: n.ssid, bssid: n.bssid, securityType: n.securityType, branchName: n.branchName })),
        attendanceRules,
        leavePolicies,
        helpDeskSettings,
        holidayCalendarImages,
      }
    },

    getSettings() {
      return this.getConfig()
    },

    updateConfig(newConfig = {}) {
      if (newConfig.officeNetworkIPs !== undefined) officeNetworkIPs = newConfig.officeNetworkIPs
      if (newConfig.locations !== undefined) locations = newConfig.locations
      if (newConfig.allowedWifiSSIDs !== undefined) allowedWifiSSIDs = newConfig.allowedWifiSSIDs
      if (newConfig.wifiNetworks !== undefined) wifiNetworks = newConfig.wifiNetworks
      if (newConfig.attendanceRules !== undefined && newConfig.attendanceRules !== null) {
        const cleanRules = Object.fromEntries(
          Object.entries(newConfig.attendanceRules).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        )
        attendanceRules = { ...attendanceRules, ...cleanRules }
      }
      if (newConfig.leavePolicies !== undefined && newConfig.leavePolicies !== null) {
        const cleanLeave = Object.fromEntries(
          Object.entries(newConfig.leavePolicies).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        )
        leavePolicies = { ...leavePolicies, ...cleanLeave }
      }
      if (newConfig.helpDeskSettings !== undefined && newConfig.helpDeskSettings !== null) {
        const cleanHelp = Object.fromEntries(
          Object.entries(newConfig.helpDeskSettings).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        )
        helpDeskSettings = { ...helpDeskSettings, ...cleanHelp }
      }
      if (newConfig.holidayCalendarImages !== undefined) holidayCalendarImages = newConfig.holidayCalendarImages
      return this.getConfig()
    },

    async getTodayRecord(employeeId, date = getTodayString()) {
      return repository.findByEmployeeAndDate(employeeId, date)
    },

    async getRecordById(id) {
      return repository.findById ? repository.findById(id) : null
    },

    async listSelf(user, filters = {}) {
      const employeeId = user.employeeId || user.id
      return repository.list({ ...filters, employeeId })
    },

    async listAll(filters = {}) {
      if (filters.date) {
        await ensureDailyAbsenceRecords(filters.date)
      }
      return repository.list(filters)
    },

    async getSummary(date = getTodayString()) {
      await ensureDailyAbsenceRecords(date)
      return repository.getSummary(date)
    },

    async getApprovedLeave(employeeId, workDate) {
      return getApprovedLeaveForDate(employeeId, workDate)
    },

    async ensureDailyAbsence(workDate) {
      return ensureDailyAbsenceRecords(workDate)
    },

    async punchIn(args) {
      return this.checkIn(args)
    },

    async checkIn({ employeeId, employeeName, latitude, longitude, accuracy, wifiSSID, bssid, date, clientIp, shift, shiftCode }) {
      const workDate = date || getTodayString()
      if (workDate !== getTodayString()) throw Object.assign(new Error('Self-service attendance can only be recorded for today. Ask HR to correct historical attendance.'), { statusCode: 400, code: 'INVALID_ATTENDANCE_DATE' })
      const existing = await repository.findByEmployeeAndDate(employeeId, workDate)

      if (existing?.checkIn) {
        return existing
      }

      const verification = verifyLocation(latitude, longitude, wifiSSID, clientIp, bssid, accuracy)

      if (!verification.isEligible) {
        const error = new Error(verification.message || 'Attendance verification failed.')
        error.statusCode = 403
        error.code = 'ATTENDANCE_NOT_VERIFIED'
        error.details = {
          failureReason: verification.failureReason,
          isGpsVerified: verification.isGpsVerified,
          isWifiVerified: verification.isWifiVerified,
          isNetworkVerified: verification.isNetworkVerified,
          isBssidVerified: verification.isBssidVerified,
          isIpVerified: verification.isIpVerified,
          clientIp,
          distanceMeters: verification.distanceMeters,
          maxAllowedRadius: verification.maxAllowedRadius,
          nearestLocation: verification.nearestLocation,
        }
        throw error
      }

      const now = new Date()
      const checkInTime = formatCurrentTime()

      // Dynamic policy punch-in: check active attendanceRules first, then fallback to resolveEmployeeShift
      let resolvedShiftConfig = null
      if (attendanceRules?.workStartTime && attendanceRules?.workEndTime) {
        const sMins = parseTimeToMinutes(attendanceRules.workStartTime)
        const eMins = parseTimeToMinutes(attendanceRules.workEndTime)
        const rawGrace = Number(attendanceRules.gracePeriodMinutes)
        const gMins = Number.isFinite(rawGrace) && rawGrace >= 0 ? rawGrace : 30
        if (sMins !== null && eMins !== null) {
          resolvedShiftConfig = normalizeShiftConfig({
            shiftId: 'GENERAL',
            name: `General (${formatMinutesToTime(sMins)} – ${formatMinutesToTime(eMins)})`,
            startTime: formatMinutesToTime(sMins),
            endTime: formatMinutesToTime(eMins),
            startMinutes: sMins,
            endMinutes: eMins,
            isOvernight: eMins < sMins,
            gracePeriodMinutes: gMins,
            graceCutoffMinutes: sMins + gMins,
            halfDayCutoffMinutes: sMins + 60, // 1 hour late triggers half-day
            requiredCampusHours: 4,
            requiredCampusMinutes: 240,
          })
        }
      }

      if (!resolvedShiftConfig) {
        try {
          const resShift = await resolveEmployeeShift(employeeId, workDate)
          if (resShift?.shift) {
            resolvedShiftConfig = resShift.shift
          }
        } catch {}
      }

      if (!resolvedShiftConfig) {
        if (shift && typeof shift === 'object' && shift.startMinutes) {
          resolvedShiftConfig = normalizeShiftConfig(shift)
        } else if (shift && typeof shift === 'string') {
          const extracted = extractShiftTimes(shift)
          if (extracted.hasExplicitTimes) {
            resolvedShiftConfig = normalizeShiftConfig({ shiftId: shiftCode, name: shift, ...extracted })
          }
        }
      }
      if (!resolvedShiftConfig) {
        resolvedShiftConfig = { ...STANDARD_SHIFT_DEF }
      }

      const approvedLeave = await getApprovedLeaveForDate(employeeId, workDate)
      const punchEval = evaluatePunchIn({ checkInTime, shift: resolvedShiftConfig, approvedLeave })

      // Calculate occurrence index for the month
      let currentLateCount = 0
      try {
        const monthKey = workDate.slice(0, 7)
        const priorMonthRecords = await repository.list({ employeeId: employeeId.toUpperCase(), month: monthKey })
        const priorLates = (priorMonthRecords || []).filter(r => r.date !== workDate && (r.isLate || r.status === 'late') && r.policyEvaluation?.occurrence !== 'half_day_leave_on_time').length
        currentLateCount = priorLates + (punchEval.isLate ? 1 : 0)
      } catch {
        currentLateCount = punchEval.isLate ? 1 : 0
      }

      const punchInLocation = {
        latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
        accuracy: accuracy !== undefined && accuracy !== null ? Math.round(Number(accuracy)) : null,
        distanceMeters: verification.distanceMeters,
        geofenceStatus: verification.isGpsVerified ? 'inside' : 'unknown',
        networkType: verification.isWifiVerified ? 'wifi' : (clientIp ? 'cellular' : 'unknown'),
        wifiSSID: /airtel|dji|3052/i.test(wifiSSID || '') ? 'Edufyi' : (wifiSSID || 'Edufyi'),
        bssid: verification.bssid || '',
        clientIp: clientIp || '',
        wifiVerified: verification.isWifiVerified,
        ipVerified: verification.isIpVerified,
        gpsVerified: verification.isGpsVerified,
        locationName: (/san francisco|austin|london/i.test(verification.nearestLocation || '') || !verification.nearestLocation) ? 'IGNITE CAMPUS' : verification.nearestLocation,
        timestamp: now,
      }

      const liveLocation = {
        latitude: punchInLocation.latitude,
        longitude: punchInLocation.longitude,
        accuracy: punchInLocation.accuracy,
        distanceMeters: punchInLocation.distanceMeters,
        geofenceStatus: punchInLocation.geofenceStatus,
        locationFreshness: 'live',
        locationPermission: 'granted',
        connectivityStatus: 'online',
        networkType: punchInLocation.networkType,
        wifiSSID: punchInLocation.wifiSSID,
        bssid: punchInLocation.bssid,
        clientIp: punchInLocation.clientIp,
        wifiVerified: punchInLocation.wifiVerified,
        ipVerified: punchInLocation.ipVerified,
        gpsVerified: punchInLocation.gpsVerified,
        locationSource: 'gps',
        locationName: punchInLocation.locationName,
        deviceCapturedAt: now,
        serverReceivedAt: now,
        lastSyncAt: now,
      }

      const record = {
        id: existing?.id,
        employeeId: employeeId.toUpperCase(),
        employeeName: employeeName || 'Employee',
        date: workDate,
        checkIn: checkInTime,
        checkInAt: now,
        checkOut: null,
        status: punchEval.status,
        isLate: punchEval.isLate,
        isHalfDay: punchEval.isHalfDay,
        halfDayPeriod: approvedLeave?.halfDayPeriod || (punchEval.isHalfDay ? 'first_half' : null),
        approvedLeave: approvedLeave ? {
          id: approvedLeave.id,
          leaveType: approvedLeave.leaveType,
          halfDayPeriod: approvedLeave.halfDayPeriod,
          isPaid: approvedLeave.isPaid,
        } : null,
        lateCount: currentLateCount,
        shift: resolvedShiftConfig.name,
        shiftCode: resolvedShiftConfig.shiftId.toLowerCase(),
        policyEvaluation: punchEval,
        isOnBreak: false,
        currentBreak: null,
        breaks: [],
        totalBreakMinutes: 0,
        wifiSSID: /airtel|dji|3052/i.test(wifiSSID || '') ? 'Edufyi' : (wifiSSID || 'Edufyi'),
        bssid: verification.bssid || '',
        wifiVerified: verification.isWifiVerified,
        clientIp: clientIp || '',
        ipVerified: verification.isIpVerified,
        latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
        accuracy: accuracy !== undefined && accuracy !== null ? Math.round(Number(accuracy)) : null,
        distanceMeters: verification.distanceMeters,
        gpsVerified: verification.isGpsVerified,
        locationName: (/san francisco|austin|london/i.test(verification.nearestLocation || '') || !verification.nearestLocation) ? 'IGNITE CAMPUS' : verification.nearestLocation,
        verificationMethod: verification.method,
        totalHours: 'Active (Live)',
        notes: punchEval.notes || (punchEval.isLate ? punchEval.notes : `Verified Attendance (${resolvedShiftConfig.name})`),
        lastConnectedAt: now,
        disconnectedSince: null,
        geofenceStatus: 'inside',
        punchInLocation,
        liveLocation,
        geofenceExitAt: null,
        geofenceGraceExpiresAt: null,
        geofenceWarningSentAt: null,
        offlineDetectedAt: null,
        offlineGraceExpiresAt: null,
        offlineWarningSentAt: null,
        lastVerifiedLocationAt: now,
        lastVerifiedLatitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        lastVerifiedLongitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
        lastVerifiedAccuracy: accuracy !== undefined && accuracy !== null ? Math.round(Number(accuracy)) : null,
        lastVerifiedLocationName: (/san francisco|austin|london/i.test(verification.nearestLocation || '') || !verification.nearestLocation) ? 'IGNITE CAMPUS' : verification.nearestLocation,
        autoPunchOut: false,
        punchOutReason: '',
        punchOutType: 'manual',
        reviewStatus: 'none',
        auditEvents: [
          {
            eventType: 'CHECK_IN',
            eventTimestamp: now,
            description: `Employee checked in via ${verification.method}`,
            source: 'device',
            metadata: { verificationMethod: verification.method, clientIp, latitude, longitude, accuracy },
          },
        ],
      }

      return repository.punchIn(record)
    },

    async startBreak({ employeeId, breakType = 'lunch', date }) {
      const workDate = date || getTodayString()
      if (workDate !== getTodayString()) throw Object.assign(new Error('Self-service breaks can only be recorded for today.'), { statusCode: 400, code: 'INVALID_ATTENDANCE_DATE' })
      const existing = await repository.findByEmployeeAndDate(employeeId, workDate)
      if (!existing || !existing.checkIn) {
        const error = new Error('You must punch in before taking a break.')
        error.statusCode = 400
        error.code = 'NO_CHECKIN_FOUND'
        throw error
      }
      if (existing.checkOut) {
        const error = new Error('Your shift for today has already ended.')
        error.statusCode = 400
        error.code = 'ALREADY_CHECKED_OUT'
        throw error
      }
      if (existing.isOnBreak) {
        const error = new Error('You are already on an active break.')
        error.statusCode = 400
        error.code = 'ALREADY_ON_BREAK'
        throw error
      }

      const now = new Date()
      const typeClean = ['lunch', 'tea', 'other'].includes(breakType) ? breakType : 'lunch'
      const updated = {
        ...existing,
        isOnBreak: true,
        currentBreak: {
          type: typeClean,
          startTime: formatCurrentTime(),
          startAt: now,
        },
        totalHours: `On Break (${typeClean === 'lunch' ? 'Lunch' : typeClean === 'tea' ? 'Tea' : 'Break'})`,
      }
      return repository.save(updated)
    },

    async endBreak({ employeeId, date }) {
      const workDate = date || getTodayString()
      if (workDate !== getTodayString()) throw Object.assign(new Error('Self-service breaks can only be recorded for today.'), { statusCode: 400, code: 'INVALID_ATTENDANCE_DATE' })
      const existing = await repository.findByEmployeeAndDate(employeeId, workDate)
      if (!existing || !existing.checkIn) {
        const error = new Error('No active attendance record found for today.')
        error.statusCode = 400
        error.code = 'NO_CHECKIN_FOUND'
        throw error
      }
      if (!existing.isOnBreak) {
        const error = new Error('You are not currently on a break.')
        error.statusCode = 400
        error.code = 'NOT_ON_BREAK'
        throw error
      }

      const now = new Date()
      const startAt = existing.currentBreak?.startAt ? new Date(existing.currentBreak.startAt) : now
      const durationMinutes = Math.max(1, Math.round((now - startAt) / 60000))
      const typeClean = existing.currentBreak?.type || 'lunch'

      const completedBreak = {
        type: typeClean,
        startTime: existing.currentBreak?.startTime || formatCurrentTime(),
        startAt,
        endTime: formatCurrentTime(),
        endAt: now,
        durationMinutes,
      }

      const breaksList = [...(existing.breaks || []), completedBreak]
      const totalBreakMinutes = Number(existing.totalBreakMinutes || 0) + durationMinutes

      const updated = {
        ...existing,
        isOnBreak: false,
        currentBreak: null,
        breaks: breaksList,
        totalBreakMinutes,
        totalHours: 'Active (Live)',
      }
      return repository.save(updated)
    },

    async checkOut({ employeeId, employeeName, date, autoPunchOut = false, punchOutReason = null, offCampusDurationMinutes = 0, completionTime = null, disconnectionTime = null }) {
      const workDate = date || getTodayString()
      if (!autoPunchOut && workDate !== getTodayString()) throw Object.assign(new Error('Self-service attendance can only be recorded for today. Ask HR to correct historical attendance.'), { statusCode: 400, code: 'INVALID_ATTENDANCE_DATE' })
      let existing = await repository.findByEmployeeAndDate(employeeId, workDate)

      if (!existing || !existing.checkIn) {
        const error = new Error('No check-in record found for today. Please punch in first.')
        error.statusCode = 400
        error.code = 'NO_CHECKIN_FOUND'
        throw error
      }

      if (existing.checkOut) return existing
      const now = new Date()

      // CRITICAL SAFEGUARD: Auto punch-out strictly requires AT LEAST 2 HOURS (120 min) elapsed since check-in
      if (autoPunchOut) {
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000
        let checkInTimeMs = existing.checkInAt ? new Date(existing.checkInAt).getTime() : null;
        if (!checkInTimeMs && existing.checkIn) {
          const inM = parseTimeToMinutes(existing.checkIn);
          if (inM !== null) {
            const d = new Date();
            d.setHours(Math.floor(inM / 60), inM % 60, 0, 0);
            checkInTimeMs = d.getTime();
          }
        }
        if (checkInTimeMs && (now.getTime() - checkInTimeMs) < TWO_HOURS_MS) {
          // Employee has been checked in for less than 2 hours. Auto punch-out cannot trigger!
          return existing
        }
      }

      // Determine effective checkout date and checkout time
      let effectiveCheckOutDate = now
      let checkOutTime = formatCurrentTime()

      const targetTime = completionTime || disconnectionTime
      if (autoPunchOut && targetTime) {
        const parsed = new Date(targetTime).getTime()
        if (!isNaN(parsed) && parsed > 0) {
          effectiveCheckOutDate = new Date(parsed)
          const hh = effectiveCheckOutDate.getHours()
          const mm = effectiveCheckOutDate.getMinutes()
          const ampm = hh >= 12 ? 'PM' : 'AM'
          const formattedH = (hh % 12) || 12
          const formattedM = String(mm).padStart(2, '0')
          checkOutTime = `${String(formattedH).padStart(2, '0')}:${formattedM} ${ampm}`
        }
      }

      // Automatically end active break if employee punches out while on break
      let totalBreakMinutes = Number(existing.totalBreakMinutes || 0)
      let breaksList = Array.isArray(existing.breaks) ? [...existing.breaks] : []
      if (existing.isOnBreak && existing.currentBreak?.startAt) {
        const breakStart = new Date(existing.currentBreak.startAt)
        const breakEnd = (autoPunchOut && effectiveCheckOutDate < now) ? effectiveCheckOutDate : now
        const autoDuration = Math.max(1, Math.round((breakEnd - breakStart) / 60000))
        breaksList.push({
          type: existing.currentBreak.type || 'lunch',
          startTime: existing.currentBreak.startTime || checkOutTime,
          startAt: breakStart,
          endTime: checkOutTime,
          endAt: breakEnd,
          durationMinutes: autoDuration,
        })
        totalBreakMinutes += autoDuration
      }

      // Dynamic Auto Lunch Break Pause (Admin Configurable, default 1:30 PM to 2:30 PM)
      const rules = attendanceRules || {}
      const autoLunchPause = rules.lunchBreakAutoPause ?? true
      const lStart = rules.lunchBreakStart || '13:30'
      const lEnd = rules.lunchBreakEnd || '14:30'

      if (autoLunchPause && existing.checkIn) {
        const overlapMins = calculateTimeOverlapMinutes(existing.checkIn, checkOutTime, lStart, lEnd)
        if (overlapMins > 0) {
          let manualOverlapMins = 0
          for (const b of breaksList) {
            if (b.isAutoLunch) continue
            if (b.startTime && b.endTime) {
              const bOverlap = calculateTimeOverlapMinutes(b.startTime, b.endTime, lStart, lEnd)
              manualOverlapMins += bOverlap
            }
          }
          const netLunchOverlap = Math.max(0, overlapMins - manualOverlapMins)
          if (netLunchOverlap > 0) {
            breaksList.push({
              type: 'lunch',
              startTime: lStart,
              endTime: lEnd,
              durationMinutes: netLunchOverlap,
              isAutoLunch: true,
            })
            totalBreakMinutes += netLunchOverlap
          }
        }
      }
      const inMins = parseTimeToMinutes(existing.checkIn)
      const outMins = parseTimeToMinutes(checkOutTime)

      let totalHoursStr = 'Duration unavailable (HR correction required)'
      let newStatus = existing.status

      const offCampusMinutes = Math.max(0, Math.round(Number(offCampusDurationMinutes) || 0))
      let elapsed = null
      if (inMins !== null && outMins !== null) {
        let diff = outMins - inMins
        if (diff < 0) diff += 1440
        elapsed = diff
      } else if (existing.checkInAt) {
        elapsed = Math.floor((now - new Date(existing.checkInAt)) / 60000)
      }
      if (elapsed !== null && Number.isFinite(elapsed) && elapsed >= 0) {
        const netWorkMinutes = Math.max(0, elapsed - totalBreakMinutes)
        const hours = Math.floor(netWorkMinutes / 60)
        const mins = netWorkMinutes % 60
        const breakPart = totalBreakMinutes > 0 ? ` · ${totalBreakMinutes}m Break` : ''
        const tag = autoPunchOut ? 'Auto Punch Out' : 'Completed'
        totalHoursStr = `${hours}h ${mins}m (${tag})${breakPart}`
        newStatus = existing.status || 'present'
      }

      // Authoritative policy check-out: resolves early logout window & verified campus presence
      const currentConfig = this.getConfig ? this.getConfig() : null
      const configGrace = currentConfig?.attendanceRules?.gracePeriodMinutes
      let resolvedOutShift = null
      if (existing.shift) {
        const extracted = extractShiftTimes(existing.shift)
        resolvedOutShift = normalizeShiftConfig({
          shiftId: existing.shiftCode,
          name: existing.shift,
          ...(configGrace !== undefined ? { gracePeriodMinutes: configGrace } : {}),
          ...extracted,
        })
      } else {
        const resShift = await resolveEmployeeShift(employeeId, workDate)
        resolvedOutShift = resShift.shift
      }

      const isVerified = Boolean(existing.wifiVerified || existing.gpsVerified || existing.ipVerified)
      const verifiedDurationMinutes = isVerified
        ? Math.max(0, elapsed - totalBreakMinutes - offCampusMinutes)
        : 0

      const approvedLeave = await getApprovedLeaveForDate(employeeId, workDate)
      const checkoutEval = evaluateCheckOut({
        checkOutTime,
        checkInTime: existing.checkIn,
        shift: resolvedOutShift,
        elapsedMinutes: elapsed,
        verifiedCampusMinutes: verifiedDurationMinutes,
        approvedLeave,
      })

      // Count prior early logouts in the month
      let currentEarlyCount = existing.earlyLogoutCount || 0
      if (checkoutEval.isEarlyLogout) {
        try {
          const monthKey = workDate.slice(0, 7)
          const priorMonthRecords = await repository.list({ employeeId: employeeId.toUpperCase(), month: monthKey })
          const priorEarly = (priorMonthRecords || []).filter(r => r.date !== workDate && (r.isEarlyLogout || r.status === 'early-logout') && r.policyEvaluation?.occurrence !== 'half_day_leave_checkout').length
          currentEarlyCount = priorEarly + 1
        } catch {
          currentEarlyCount = (existing.earlyLogoutCount || 0) + 1
        }
      }

      // Check post-25th Double LOP trigger condition
      const doubleLopEval = evaluatePost25thDoubleLop({
        dateStr: workDate,
        isLop: existing.isLop || existing.status === 'lop',
        isAbsent: existing.status === 'absent',
      })

      let finalStatus = existing.status || 'present'
      let finalHalfDay = Boolean(existing.isHalfDay || approvedLeave?.isHalfDay)
      if (existing.isHalfDay || existing.status === 'half-day' || approvedLeave?.isHalfDay) {
        finalHalfDay = true
        finalStatus = 'half-day'
      } else if (attendanceRules?.minCampusHours && checkoutEval.isCampusShortfall && verifiedDurationMinutes < (resolvedOutShift.requiredCampusMinutes || 240)) {
        finalHalfDay = true
        finalStatus = 'half-day'
      }

      const defaultReason = autoPunchOut ? 'Auto Punch Out (Completed 8 working hours)' : ''
      if (autoPunchOut) {
        finalStatus = 'present'
        finalHalfDay = false
      }
      const reasonToSet = punchOutReason || defaultReason

      const notesArr = [existing.notes, reasonToSet, checkoutEval.notes].filter(Boolean)
      const combinedNotes = [...new Set(notesArr)].join(' | ')

      const updated = {
        ...existing,
        checkOut: checkOutTime,
        checkOutAt: effectiveCheckOutDate,
        totalHours: totalHoursStr,
        status: finalStatus,
        isEarlyLogout: checkoutEval.isEarlyLogout,
        earlyLogoutCount: currentEarlyCount,
        isLop: Boolean(existing.isLop || existing.status === 'lop'),
        isHalfDay: finalHalfDay,
        verifiedCampusMinutes: verifiedDurationMinutes,
        doubleLopStatus: doubleLopEval.applies ? (existing.doubleLopStatus === 'approved' ? 'approved' : 'pending_approval') : 'none',
        isDoubleLop: existing.doubleLopStatus === 'approved',
        isOnBreak: false,
        currentBreak: null,
        breaks: breaksList,
        totalBreakMinutes,
        offCampusDurationMinutes: offCampusMinutes,
        autoPunchOut: Boolean(autoPunchOut),
        punchOutReason: reasonToSet,
        punchOutType: autoPunchOut ? 'auto' : 'manual',
        notes: combinedNotes,
      }

      return repository.punchOut(updated)
    },

    async updatePresence({ employeeId, latitude, longitude, wifiSSID, clientIp, bssid, accuracy, locationPermission = 'unknown', networkType = 'unknown', deviceCapturedAt = null, isStale = false }) {
      const now = new Date()
      const workDate = getTodayString()
      const verification = verifyLocation(latitude, longitude, wifiSSID, clientIp, bssid, accuracy)
      const settings = this.getSettings ? this.getSettings() : this.getConfig()
      const rules = settings?.attendanceRules || DEFAULT_ATTENDANCE_RULES

      const clientTime = deviceCapturedAt ? new Date(deviceCapturedAt).getTime() : null
      const isDeviceDateValid = clientTime && !isNaN(clientTime)
      const dataAgeMs = isDeviceDateValid ? (now.getTime() - clientTime) : 0
      const isOutdated = Boolean(isStale) || (isDeviceDateValid && dataAgeMs > 5 * 60 * 1000)

      const existing = await repository.findByEmployeeAndDate(employeeId, workDate)
      if (!existing || !existing.checkIn || existing.checkOut) {
        return {
          ...verification,
          isConnected: Boolean(verification.isGpsVerified || verification.isWifiVerified || verification.isIpVerified),
          geofenceStatus: 'unknown',
          geofenceGraceExpiresAt: null,
          remainingGraceMinutes: 0,
          autoPunchedOut: Boolean(existing?.autoPunchOut),
          locationFreshness: isOutdated ? 'stale' : 'unavailable',
        }
      }

      const numAcc = Number(accuracy)
      const maxAccuracyThreshold = Number(rules.geofenceGpsAccuracyThresholdMeters) || 50
      const isAccurateGps = Number.isFinite(numAcc) && numAcc > 0 && numAcc <= maxAccuracyThreshold

      const isOnOfficeNetwork = Boolean(verification.isIpVerified || verification.isWifiVerified)
      const isInsideGeofence = Boolean(verification.isGpsVerified)
      const isPhysicallyPresent = isOnOfficeNetwork || isInsideGeofence

      let currentGeofenceStatus = existing.geofenceStatus || 'inside'
      let geofenceGraceExpiresAt = existing.geofenceGraceExpiresAt || null
      let geofenceExitAt = existing.geofenceExitAt || null
      let geofenceWarningSentAt = existing.geofenceWarningSentAt || null
      let auditEventToLog = null
      let notificationToSend = null

      const hasCoords = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
      const maxAllowedRadius = Number(verification.maxAllowedRadius) || Number(rules.maxGeofenceRadiusMeters) || 50
      const confidenceTolerance = Math.min(Math.max(0, (numAcc || 0) * 0.35), 35)

      // Separate 6 Distinct States:
      // INSIDE, OUTSIDE, LOCATION_UNCERTAIN, LOCATION_UNAVAILABLE, STALE_LOCATION, DEVICE_OFFLINE
      let resolvedPresenceState = 'INSIDE'
      if (isOutdated) {
        // Reject outdated buffered coordinates (>5 mins) as current live location!
        resolvedPresenceState = 'STALE_LOCATION'
      } else if (isPhysicallyPresent) {
        resolvedPresenceState = 'INSIDE'
      } else if (!hasCoords || locationPermission === 'denied') {
        resolvedPresenceState = 'LOCATION_UNAVAILABLE'
      } else if (!isAccurateGps || numAcc > 100 || (verification.distanceMeters !== null && (verification.distanceMeters - numAcc) <= maxAllowedRadius)) {
        resolvedPresenceState = 'LOCATION_UNCERTAIN'
      } else if (hasCoords && isAccurateGps && verification.distanceMeters !== null && (verification.distanceMeters - confidenceTolerance) > maxAllowedRadius && (verification.distanceMeters - numAcc) > maxAllowedRadius) {
        resolvedPresenceState = 'OUTSIDE'
      } else {
        resolvedPresenceState = 'LOCATION_UNCERTAIN'
      }

      if (resolvedPresenceState === 'INSIDE') {
        // Employee is inside office or on office Wi-Fi
        if (currentGeofenceStatus === 'outside' || geofenceGraceExpiresAt) {
          // Employee has RETURNED inside the grace period! Immediately cancel 2-hour timer!
          currentGeofenceStatus = 'inside'
          geofenceGraceExpiresAt = null
          geofenceExitAt = null
          geofenceWarningSentAt = null

          auditEventToLog = {
            eventType: 'GEOFENCE_RETURN_VERIFIED',
            eventTimestamp: now,
            description: `Employee returned inside authorized office location (${verification.nearestLocation || 'Office'})`,
            source: 'device',
            metadata: { latitude, longitude, accuracy, clientIp, method: verification.method },
          }

          notificationToSend = {
            type: 'RETURN',
            title: 'Attendance Confirmed Inside Office',
            message: 'Welcome back! Your return to the office has been verified. Your attendance session continues normally.',
          }
        } else {
          currentGeofenceStatus = 'inside'
        }
      } else if (resolvedPresenceState === 'OUTSIDE') {
        // Genuine, confirmed exit with reliable GPS evidence
        if (currentGeofenceStatus !== 'outside') {
          currentGeofenceStatus = 'outside'
          geofenceExitAt = now
          const graceMins = Number(rules.geofenceGracePeriodMinutes) || 120
          geofenceGraceExpiresAt = new Date(now.getTime() + graceMins * 60 * 1000)

          auditEventToLog = {
            eventType: 'GEOFENCE_EXIT_DETECTED',
            eventTimestamp: now,
            description: `Device confirmed outside authorized geofence (${Math.round(verification.distanceMeters)}m away). 2-hour grace period initiated.`,
            source: 'device',
            metadata: { latitude, longitude, accuracy, distanceMeters: verification.distanceMeters, graceExpiresAt: geofenceGraceExpiresAt },
          }

          if (rules.geofenceExitWarningEnabled !== false && !geofenceWarningSentAt) {
            geofenceWarningSentAt = now
            notificationToSend = {
              type: 'EXIT_WARNING',
              title: 'Outside Office Geofence Warning',
              message: 'Your device appears to be outside the authorized office location. Your attendance session is still active. Please return to the office location within 2 hours. Otherwise, your attendance will be automatically punched out.',
            }
          }
        }
      } else if (resolvedPresenceState === 'STALE_LOCATION') {
        // Outdated coordinates from device reconnect/buffer (>5m old)
        // CRITICAL: NEVER convert STALE_LOCATION into a confirmed geofence exit!
        // Maintain current geofence status and DO NOT start a grace timer.
      } else {
        // LOCATION_UNCERTAIN or LOCATION_UNAVAILABLE:
        // Indoor weak signal, GPS jitter, or permission unavailable.
        // CRITICAL RULE: NEVER convert UNCERTAIN or UNAVAILABLE into a confirmed geofence exit!
        // DO NOT change currentGeofenceStatus to 'outside' and DO NOT start a grace timer!
      }

      const liveGeofenceStatus = isOutdated
        ? (currentGeofenceStatus || 'inside')
        : (isPhysicallyPresent
          ? 'inside'
          : (resolvedPresenceState === 'OUTSIDE'
            ? 'outside'
            : (resolvedPresenceState === 'LOCATION_UNAVAILABLE'
              ? 'location_unavailable'
              : 'uncertain')))

      let calculatedFreshness = 'live'
      if (isOutdated || resolvedPresenceState === 'STALE_LOCATION') {
        calculatedFreshness = 'stale'
      } else if (resolvedPresenceState === 'LOCATION_UNCERTAIN') {
        calculatedFreshness = 'uncertain'
      } else if (resolvedPresenceState === 'LOCATION_UNAVAILABLE') {
        calculatedFreshness = 'unavailable'
      }

      const liveLoc = {
        latitude: hasCoords ? Number(latitude) : (existing.liveLocation?.latitude ?? null),
        longitude: hasCoords ? Number(longitude) : (existing.liveLocation?.longitude ?? null),
        accuracy: Number.isFinite(numAcc) ? Math.round(numAcc) : (existing.liveLocation?.accuracy ?? null),
        distanceMeters: verification.distanceMeters !== null ? verification.distanceMeters : (existing.liveLocation?.distanceMeters ?? null),
        geofenceStatus: liveGeofenceStatus,
        locationFreshness: calculatedFreshness,
        locationPermission: hasCoords ? 'granted' : (existing.liveLocation?.locationPermission || 'unknown'),
        connectivityStatus: 'online',
        networkType: verification.isWifiVerified ? 'wifi' : (clientIp ? 'cellular' : 'unknown'),
        wifiSSID: /airtel|dji|3052/i.test(wifiSSID || '') ? 'Edufyi' : (wifiSSID || existing.liveLocation?.wifiSSID || ''),
        bssid: verification.bssid || existing.liveLocation?.bssid || '',
        clientIp: clientIp || existing.liveLocation?.clientIp || '',
        wifiVerified: verification.isWifiVerified,
        ipVerified: verification.isIpVerified,
        gpsVerified: verification.isGpsVerified,
        locationSource: hasCoords ? 'gps' : (verification.isWifiVerified ? 'wifi' : 'network'),
        locationName: verification.nearestLocation || existing.liveLocation?.locationName || 'IGNITE CAMPUS',
        deviceCapturedAt: isDeviceDateValid ? new Date(clientTime) : now,
        serverReceivedAt: now,
        lastSyncAt: now,
      }

      const presenceUpdates = {
        lastConnectedAt: now,
        disconnectedSince: null,
        geofenceStatus: currentGeofenceStatus,
        geofenceExitAt,
        geofenceGraceExpiresAt,
        geofenceWarningSentAt,
        liveLocation: liveLoc,
        ...(verification.distanceMeters !== null ? { distanceMeters: verification.distanceMeters } : {}),
      }

      if (isPhysicallyPresent) {
        presenceUpdates.lastVerifiedLocationAt = now
        presenceUpdates.lastVerifiedLatitude = latitude ? Number(latitude) : null
        presenceUpdates.lastVerifiedLongitude = longitude ? Number(longitude) : null
        presenceUpdates.lastVerifiedAccuracy = accuracy ? Math.round(Number(accuracy)) : null
        presenceUpdates.lastVerifiedLocationName = verification.nearestLocation || 'IGNITE CAMPUS'
      }

      if (repository.updatePresenceDetails) {
        await repository.updatePresenceDetails(employeeId, workDate, presenceUpdates, auditEventToLog)
      } else if (repository.updatePresence) {
        await repository.updatePresence(employeeId, workDate, isPhysicallyPresent)
      }

      if (notificationToSend) {
        try {
          await createUnifiedNotification({
            employeeId,
            title: notificationToSend.title,
            message: notificationToSend.message,
            category: 'attendance',
            eventType: notificationToSend.type === 'EXIT_WARNING' ? 'ATTENDANCE_WARNING_60' : 'ATTENDANCE_RESTORED',
            targetUrl: '#/employee/attendance',
            priority: notificationToSend.type === 'EXIT_WARNING' ? 'urgent' : 'high',
            idempotencyKey: `${workDate}_${notificationToSend.type}_${employeeId}_${Date.now().toString(36)}`,
          })
        } catch (notifErr) {
          console.warn('[updatePresence Notification Notice]:', notifErr.message)
        }
      }

      let remainingGraceMinutes = 0
      if (geofenceGraceExpiresAt) {
        remainingGraceMinutes = Math.max(0, Math.round((new Date(geofenceGraceExpiresAt).getTime() - now.getTime()) / 60000))
      }

      return {
        ...verification,
        isConnected: isPhysicallyPresent,
        geofenceStatus: currentGeofenceStatus,
        geofenceGraceExpiresAt,
        remainingGraceMinutes,
        locationFreshness: liveLoc.locationFreshness,
        isOutdated,
        resolvedPresenceState,
        autoPunchedOut: false,
      }
    },

    async finalizeAttendanceSession({
      recordId,
      employeeId,
      employeeName,
      workDate,
      punchOutTime,
      punchOutAt = new Date(),
      reasonCode = 'MANUAL',
      reasonText = 'Normal check-out',
      policy = 'MANUAL',
      isAutoPunchOut = false,
      source = 'system',
    }) {
      let record = null
      if (employeeId && workDate) {
        record = await repository.findByEmployeeAndDate(employeeId, workDate)
      }
      if (!record && recordId) {
        record = repository.findById ? await repository.findById(recordId) : (repository.getRecordById ? await repository.getRecordById(recordId) : null)
      }
      if (!record || !record.checkIn || record.checkOut) {
        return null // Session already finalized or no check-in
      }

      // Safeguard: Do not finalize with geofence timeout if employee returned inside!
      if (policy === 'ENGINE_A_GEOFENCE' && record.geofenceStatus === 'inside') {
        return null
      }

      const now = punchOutAt instanceof Date ? punchOutAt : new Date(punchOutAt)
      const formattedTime = punchOutTime || formatCurrentTime(now)

      // Calculate working hours & breaks
      let elapsedMins = 0
      if (record.checkInAt) {
        elapsedMins = Math.max(0, Math.floor((now.getTime() - new Date(record.checkInAt).getTime()) / 60000))
      } else if (record.checkIn) {
        const inM = parseTimeToMinutes(record.checkIn)
        const outM = parseTimeToMinutes(formattedTime)
        if (inM !== null && outM !== null) {
          elapsedMins = outM >= inM ? outM - inM : (1440 - inM) + outM
        }
      }

      const breaksList = Array.isArray(record.breaks) ? [...record.breaks] : []
      if (record.isOnBreak && record.currentBreak?.startAt) {
        const bStart = new Date(record.currentBreak.startAt).getTime()
        const bDuration = Math.max(1, Math.round((now.getTime() - bStart) / 60000))
        breaksList.push({
          type: record.currentBreak.type || 'lunch',
          startTime: formatCurrentTime(new Date(bStart)),
          startAt: new Date(bStart),
          endTime: formattedTime,
          endAt: now,
          durationMinutes: bDuration,
        })
      }

      const totalBreakMinutes = breaksList.reduce((sum, b) => sum + (Number(b.durationMinutes) || 0), 0)
      const netWorkMinutes = Math.max(0, elapsedMins - totalBreakMinutes)
      const h = Math.floor(netWorkMinutes / 60)
      const m = netWorkMinutes % 60
      const breakPart = totalBreakMinutes > 0 ? ` • ${totalBreakMinutes}m Break` : ''
      const tag = isAutoPunchOut ? 'Auto Punch Out' : 'Completed'
      const totalHoursStr = `${h}h ${m}m (${tag})${breakPart}`

      const auditEvent = {
        eventType: isAutoPunchOut ? 'AUTO_PUNCH_OUT_EXECUTED' : 'MANUAL_PUNCH_OUT',
        eventTimestamp: now,
        description: `${tag} executed. Reason: ${reasonText} (${reasonCode})`,
        source,
        metadata: {
          reasonCode,
          reasonText,
          policy,
          totalHours: totalHoursStr,
          elapsedMinutes: elapsedMins,
          netWorkMinutes,
          totalBreakMinutes,
        },
      }

      const finalData = {
        checkOut: formattedTime,
        checkOutAt: now,
        totalHours: totalHoursStr,
        status: isAutoPunchOut ? (record.status || 'present') : (record.status || 'present'),
        isOnBreak: false,
        currentBreak: null,
        breaks: breaksList,
        totalBreakMinutes,
        autoPunchOut: isAutoPunchOut,
        punchOutReason: reasonText,
        punchOutType: isAutoPunchOut ? 'auto' : 'manual',
        autoPunchOutReasonCode: reasonCode,
        autoPunchOutPolicy: policy,
        autoPunchOutExecutedAt: isAutoPunchOut ? now : null,
        reviewStatus: isAutoPunchOut ? 'pending' : 'none',
        geofenceStatus: 'inside',
        geofenceExitAt: null,
        geofenceGraceExpiresAt: null,
        offlineGraceExpiresAt: null,
        notes: [record.notes, reasonText].filter(Boolean).join(' | '),
      }

      const finalized = await repository.atomicFinalizePunchOut(record.id || record._id, finalData, auditEvent)
      if (!finalized) {
        return null // Race condition prevented: already punched out
      }

      // Dispatch Notifications
      if (isAutoPunchOut) {
        let empDetails = null
        try {
          if (mongoose.connection && mongoose.connection.readyState === 1) {
            empDetails = await Employee.findOne({ employeeId: employeeId.toUpperCase() }).lean()
          }
        } catch {}

        const dept = empDetails?.department || 'Operations'
        const mgrName = empDetails?.managerName || 'Assigned Manager'
        const officeLoc = record.locationName || 'IGNITE CAMPUS'

        // 1. Employee Confirmation
        const employeeMsg =
          reasonCode === 'GEOFENCE_EXIT_TIMEOUT'
            ? 'Your attendance has been automatically punched out because you did not return to the authorized office location within the permitted 2-hour grace period.'
            : reasonCode === 'SYSTEM_DAILY_CUTOFF'
            ? `Your attendance has been automatically closed at the scheduled daily system cut-off time (${formattedTime}).`
            : `Your attendance has been automatically closed after 2 hours of inactivity/offline status.`

        try {
          await createUnifiedNotification({
            employeeId,
            title: 'Attendance Auto Punch-Out Completed',
            message: employeeMsg,
            category: 'attendance',
            eventType: 'AUTO_PUNCH_OUT_COMPLETED',
            targetUrl: '#/employee/attendance',
            priority: 'urgent',
            idempotencyKey: `${workDate}_AUTOPUNCH_EMP_${employeeId}_${recordId}`,
            metadata: {
              reasonCode,
              reasonText,
              policy,
              totalHours: totalHoursStr,
            },
          })
        } catch (e) {
          console.warn('[finalize Employee Notification Notice]:', e.message)
        }

        // 2. HR & Admin Notifications
        const categoryLabel = reasonCode === 'GEOFENCE_EXIT_TIMEOUT' ? 'GEOFENCE AUTO PUNCH-OUT' : 'DAILY SYSTEM CUT-OFF AUTO PUNCH-OUT'
        const hrTitle = `[${categoryLabel}] ${employeeName} (${employeeId})`
        const hrMessage = `Auto punch-out executed for ${employeeName} (${employeeId}) | Dept: ${dept} | Manager: ${mgrName} | Shift duration: ${totalHoursStr} | Reason: ${reasonText}`

        const hrPayload = {
          title: hrTitle,
          message: hrMessage,
          category: 'attendance',
          eventType: 'AUTO_PUNCH_OUT_HR_ALERT',
          targetUrl: '#/admin/attendance-review',
          priority: 'high',
          idempotencyKey: `${workDate}_AUTOPUNCH_HR_${employeeId}_${recordId}`,
          metadata: {
            employeeId,
            employeeName,
            department: dept,
            managerName: mgrName,
            officeLocation: officeLoc,
            checkIn: record.checkIn,
            checkInAt: record.checkInAt,
            lastVerifiedLocationAt: record.lastVerifiedLocationAt || record.checkInAt,
            lastVerifiedLatitude: record.lastVerifiedLatitude || record.latitude,
            lastVerifiedLongitude: record.lastVerifiedLongitude || record.longitude,
            autoPunchOutAt: now,
            autoPunchOutReason: reasonText,
            reasonCode,
            policy,
            totalHours: totalHoursStr,
            attendanceId: recordId,
          },
        }

        try {
          await createUnifiedNotification({ ...hrPayload, recipientRole: 'admin' })
          await createUnifiedNotification({ ...hrPayload, recipientRole: 'hr', idempotencyKey: `${workDate}_AUTOPUNCH_HR_ROLE_${employeeId}_${recordId}` })
        } catch (hrNotifErr) {
          console.warn('[finalize HR Notification Notice]:', hrNotifErr.message)
        }
      }

      return finalized
    },

    // Backward-compatible alias
    async finalizeAttendanceRecord(params) {
      return this.finalizeAttendanceSession(params)
    },

    async processAutoPunchOuts() {
      if (isProcessingAutoPunchOuts) {
        return { geofenceTimeouts: [], offlineTimeouts: [], dailyCutoffs: [], advanceWarningsSent: 0 }
      }
      isProcessingAutoPunchOuts = true
      const results = {
        geofenceTimeouts: [],
        offlineTimeouts: [],
        dailyCutoffs: [],
        advanceWarningsSent: 0,
      }

      try {
        const settings = this.getSettings ? this.getSettings() : this.getConfig()
        const rules = settings?.attendanceRules || DEFAULT_ATTENDANCE_RULES
        const now = new Date()
        const workDate = getTodayString()

        // =========================================================================
        // ENGINE A: Geofence Grace Period Expiry (2 Hours Outside Office)
        // Only active if geofenceAutoPunchOutEnabled is explicitly true
        // =========================================================================
        if (Boolean(rules.geofenceAutoPunchOutEnabled)) {
          const expiredGeofence = await repository.findExpiredGeofenceRecords(now)
          for (const rec of expiredGeofence || []) {
            try {
              // Revalidate: must still be marked 'outside' and not returned
              if (rec.geofenceStatus !== 'outside') {
                continue
              }
              const punchOutTargetDate = rec.geofenceGraceExpiresAt ? new Date(rec.geofenceGraceExpiresAt) : now
              const finalized = await this.finalizeAttendanceSession({
                recordId: rec.id || rec._id,
                employeeId: rec.employeeId,
                employeeName: rec.employeeName,
                workDate: rec.date || workDate,
                punchOutTime: formatCurrentTime(punchOutTargetDate),
                punchOutAt: punchOutTargetDate,
                reasonCode: 'GEOFENCE_EXIT_TIMEOUT',
                reasonText: 'Auto Punch Out (Geofence exit timeout - outside office for 2 hours)',
                policy: 'ENGINE_A_GEOFENCE',
                isAutoPunchOut: true,
                source: 'scheduler',
              })
              if (finalized) results.geofenceTimeouts.push(finalized)
            } catch (err) {
              console.error(`[AutoPunchOut Engine A Geofence Error] ${rec.employeeId}:`, err.message)
            }
          }
        }

        // =========================================================================
        // ENGINE A FALLBACK: Device Offline Timeout (2 Hours Inactive/Disconnected)
        // Disabled by default. Internet disconnects or phone sleep must NEVER auto punch out!
        // =========================================================================
        if (Boolean(rules.offlineAutoPunchOutEnabled)) {
          const offlineMins = Number(rules.offlineGracePeriodMinutes) || 120
          const offlineCutoffDate = new Date(now.getTime() - offlineMins * 60 * 1000)
          const expiredOffline = await repository.findExpiredOfflineRecords(offlineCutoffDate)
          for (const rec of expiredOffline || []) {
            try {
              const checkInTime = rec.checkInAt ? new Date(rec.checkInAt).getTime() : 0
              if (checkInTime && (now.getTime() - checkInTime) < (offlineMins * 60 * 1000)) {
                continue
              }
              const finalized = await this.finalizeAttendanceSession({
                recordId: rec.id || rec._id,
                employeeId: rec.employeeId,
                employeeName: rec.employeeName,
                workDate: rec.date || workDate,
                punchOutTime: formatCurrentTime(now),
                punchOutAt: now,
                reasonCode: 'OFFLINE_TIMEOUT',
                reasonText: `Auto Punch Out (Device offline & inactive for ${offlineMins} minutes)`,
                policy: 'ENGINE_A_OFFLINE',
                isAutoPunchOut: true,
                source: 'scheduler',
              })
              if (finalized) results.offlineTimeouts.push(finalized)
            } catch (err) {
              console.error(`[AutoPunchOut Engine A Offline Error] ${rec.employeeId}:`, err.message)
            }
          }
        }

        // =========================================================================
        // ENGINE B: Daily System Cut-Off (Admin Configured, e.g., 21:30 / 9:30 PM)
        // =========================================================================
        if (rules.dailyCutoffAutoPunchOutEnabled !== false && rules.autoPunchOutEnabled !== false) {
          const tz = rules.timezone || 'Asia/Kolkata'
          const cutOffTimeStr = rules.dailyCutoffTime || rules.autoPunchOutTime || '21:30'
          const cutOffMinutes = parseTimeToMinutes(cutOffTimeStr) ?? (21 * 60 + 30)

          // Robust timezone extraction using Intl.DateTimeFormat
          let currentMins = 0
          try {
            const tzFormatter = new Intl.DateTimeFormat('en-US', {
              timeZone: tz,
              hour: 'numeric',
              minute: 'numeric',
              hourCycle: 'h23',
            })
            const parts = tzFormatter.formatToParts(now)
            const hVal = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10)
            const mVal = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)
            currentMins = hVal * 60 + mVal
          } catch {
            currentMins = now.getHours() * 60 + now.getMinutes()
          }

          // Advance Warning (e.g. 15 mins before cut-off)
          const warningMinsBefore = Number(rules.dailyCutoffWarningMinutesBefore) || 15
          if (rules.dailyCutoffWarningEnabled !== false && currentMins >= (cutOffMinutes - warningMinsBefore) && currentMins < cutOffMinutes) {
            const pendingWarningRecords = await repository.findRecordsPendingAdvanceWarning(workDate)
            for (const rec of pendingWarningRecords || []) {
              try {
                // Re-verify shift before sending advance warning:
                let shiftDef = null
                if (rec.shift) {
                  const extracted = extractShiftTimes(rec.shift)
                  shiftDef = normalizeShiftConfig({ shiftId: rec.shiftCode, name: rec.shift, ...extracted })
                } else {
                  const res = await resolveEmployeeShift(rec.employeeId, rec.date || workDate)
                  shiftDef = res.shift
                }
                if (shiftDef.isOvernight || (shiftDef.endMinutes && shiftDef.endMinutes > cutOffMinutes)) {
                  continue // Exempt from day cut-off warning
                }

                await createUnifiedNotification({
                  employeeId: rec.employeeId,
                  title: 'Daily Attendance Cut-Off Notice',
                  message: `Your shift is scheduled to automatically close at ${formatTime12(cutOffTimeStr) || '9:30 PM'}. Please remember to punch out manually before this time.`,
                  category: 'attendance',
                  eventType: 'ATTENDANCE_WARNING_15',
                  targetUrl: '#/employee/attendance',
                  priority: 'normal',
                  idempotencyKey: `${workDate}_ADVANCE_WARN_${rec.employeeId}`,
                })
                if (repository.updatePresenceDetails) {
                  await repository.updatePresenceDetails(rec.employeeId, workDate, { advanceWarningSentAt: now })
                }
                results.advanceWarningsSent++
              } catch {}
            }
          }

          // At or after cut-off time:
          if (currentMins >= cutOffMinutes) {
            const activeToday = await repository.findActiveSessionsForCutoff(workDate)
            for (const rec of activeToday || []) {
              try {
                // Revalidate session:
                const latest = await repository.findByEmployeeAndDate(rec.employeeId, rec.date || workDate)
                if (!latest || !latest.checkIn || latest.checkOut) {
                  continue // Already punched out
                }

                // Check assigned shift:
                let shiftDef = null
                if (latest.shift) {
                  const extracted = extractShiftTimes(latest.shift)
                  shiftDef = normalizeShiftConfig({ shiftId: latest.shiftCode, name: latest.shift, ...extracted })
                } else {
                  const res = await resolveEmployeeShift(latest.employeeId, latest.date || workDate)
                  shiftDef = res.shift
                }

                // Shift-awareness:
                // 1. Overnight shifts:
                if (shiftDef.isOvernight) {
                  continue // Overnight shifts cross midnight, exempt from 21:30 daily day cutoff!
                }
                // 2. Evening shifts ending after cut-off time:
                if (shiftDef.endMinutes && cutOffMinutes >= (shiftDef.startMinutes || 0) && shiftDef.endMinutes > cutOffMinutes) {
                  continue // Shift ends after cut-off time, ongoing session!
                }
                // 3. Minimum duration safeguard (checked in less than 60 mins ago):
                if (latest.checkInAt) {
                  const elapsedSinceIn = (now.getTime() - new Date(latest.checkInAt).getTime()) / 60000
                  if (elapsedSinceIn < 60) {
                    continue
                  }
                }

                const finalized = await this.finalizeAttendanceSession({
                  recordId: latest.id || latest._id,
                  employeeId: latest.employeeId,
                  employeeName: latest.employeeName,
                  workDate: latest.date || workDate,
                  punchOutTime: formatTime12(cutOffTimeStr) || formatCurrentTime(now),
                  punchOutAt: now,
                  reasonCode: 'SYSTEM_DAILY_CUTOFF',
                  reasonText: `Auto Punch Out (Scheduled daily system cut-off at ${formatTime12(cutOffTimeStr) || '9:30 PM'})`,
                  policy: 'ENGINE_B_DAILY_CUTOFF',
                  isAutoPunchOut: true,
                  source: 'scheduler',
                })
                if (finalized) results.dailyCutoffs.push(finalized)
              } catch (err) {
                console.error(`[AutoPunchOut Engine B Error] ${rec.employeeId}:`, err.message)
              }
            }
          }
        }
      } catch (globalErr) {
        console.error('[processAutoPunchOuts Global Notice]:', globalErr.message)
      } finally {
        isProcessingAutoPunchOuts = false
      }

      return results
    },

    async autoPunchOutScheduledCutoff() {
      const results = await this.processAutoPunchOuts()
      return [...results.geofenceTimeouts, ...results.offlineTimeouts, ...results.dailyCutoffs]
    },

    async autoPunchOutDisconnectedRecords() {
      return this.autoPunchOutScheduledCutoff()
    },

    async autoPunchOutCompletedWorkHours() {
      return this.autoPunchOutScheduledCutoff()
    },

    async listAutoPunchOuts(query = {}) {
      return repository.listAutoPunchOuts ? repository.listAutoPunchOuts(query) : { records: [], total: 0 }
    },

    async reviewAutoPunchOut(recordId, reviewPayload = {}) {
      return repository.reviewAutoPunchOut ? repository.reviewAutoPunchOut(recordId, reviewPayload) : null
    },

    async saveRecord(recordData) {
      if (!recordData.employeeId) {
        const error = new Error('Employee ID is required.')
        error.statusCode = 400
        error.code = 'VALIDATION_ERROR'
        throw error
      }

      const workDate = recordData.date || getTodayString()
      const verification = verifyLocation(recordData.latitude, recordData.longitude, recordData.wifiSSID, recordData.clientIp)

      let checkInAt = recordData.checkInAt
      if (recordData.checkIn) {
        const inMins = parseTimeToMinutes(recordData.checkIn)
        if (inMins !== null && typeof workDate === 'string' && workDate.includes('-')) {
          const [y, m, d] = workDate.split('-').map(Number)
          const inH = Math.floor(inMins / 60)
          const inM = inMins % 60
          const inDate = new Date(y, m - 1, d, inH, inM, 0, 0)
          if (!isNaN(inDate.getTime())) checkInAt = inDate
        }
      }

      let checkOutAt = recordData.checkOutAt
      let totalHours = recordData.totalHours
      const isCheckOutCleared = !recordData.checkOut || recordData.checkOut === '—' || String(recordData.checkOut).trim() === ''
      if (isCheckOutCleared) {
        checkOutAt = null
        totalHours = 'Active (Live)'
      } else if (recordData.checkIn && recordData.checkOut) {
        const inMins = parseTimeToMinutes(recordData.checkIn)
        const outMins = parseTimeToMinutes(recordData.checkOut)
        if (outMins !== null && typeof workDate === 'string' && workDate.includes('-')) {
          const [y, m, d] = workDate.split('-').map(Number)
          const outH = Math.floor(outMins / 60)
          const outM = outMins % 60
          const outDate = new Date(y, m - 1, d, outH, outM, 0, 0)
          if (!isNaN(outDate.getTime())) checkOutAt = outDate
        }

        if (inMins !== null && outMins !== null) {
          let diffMins = outMins - inMins
          if (diffMins < 0) diffMins += 24 * 60
          const totalBreaks = Math.max(0, Number(recordData.totalBreakMinutes) || 0)
          const netMins = Math.max(0, diffMins - totalBreaks)
          const h = Math.floor(netMins / 60)
          const m = netMins % 60
          const breakPart = totalBreaks > 0 ? ` · ${totalBreaks}m Break` : ''
          const tag = recordData.autoPunchOut ? 'Auto Punch Out' : 'Completed'
          totalHours = `${h}h ${m}m (${tag})${breakPart}`
        }
      }

      const record = {
        ...recordData,
        employeeId: recordData.employeeId.toUpperCase(),
        date: workDate,
        checkIn: recordData.checkIn,
        checkInAt,
        checkOut: isCheckOutCleared ? null : recordData.checkOut,
        checkOutAt,
        totalHours: totalHours || 'Active (Live)',
        isEarlyLogout: recordData.isEarlyLogout !== undefined ? recordData.isEarlyLogout : (recordData.status === 'early-logout'),
        isLop: recordData.isLop !== undefined ? recordData.isLop : (recordData.status === 'lop'),
        wifiVerified: recordData.wifiVerified !== undefined ? recordData.wifiVerified : verification.isWifiVerified,
        gpsVerified: recordData.gpsVerified !== undefined ? recordData.gpsVerified : verification.isGpsVerified,
        distanceMeters: recordData.distanceMeters !== undefined ? recordData.distanceMeters : verification.distanceMeters,
        locationName: recordData.locationName || verification.nearestLocation,
        verificationMethod: recordData.verificationMethod || verification.method,
      }

      return repository.save(record)
    },

    async recalculateTodayAttendanceForRules() {
      return {
        updatedCount: 0,
        message: 'Attendance policy recalculation is currently inactive pending replacement policy configuration.',
      }
    },

    async recalculateAttendance(date = getTodayString(), options = {}) {
      const today = getTodayString()
      const target = (typeof date === 'string' && date.trim()) ? date.trim() : today
      const isHistorical = target !== 'all' && !options.force && !options.fixHalfDayLop && target !== today

      if (isHistorical) {
        return {
          updatedCount: 0,
          date: target,
          records: await repository.list({ date: target }),
          message: 'Attendance policy recalculation for historical dates is currently inactive pending replacement policy configuration. Historical records are preserved intact.',
        }
      }

      let query = {}
      if (target === 'all') {
        query = {}
      } else if (/^\d{4}-\d{2}$/.test(target)) {
        query = { month: target }
      } else {
        query = { date: target }
      }

      const records = await repository.list(query)
      let updatedCount = 0
      for (const rec of (records || [])) {
        const recDate = rec.date || (target.length === 10 ? target : today)
        const resShift = await resolveEmployeeShift(rec.employeeId, recDate)
        const shiftConfig = resShift.shift
        const approvedLeave = await getApprovedLeaveForDate(rec.employeeId, recDate)

        if (!rec.checkIn) {
          if (approvedLeave && !approvedLeave.isHalfDay) {
            if (rec.status !== 'on-leave') {
              rec.status = 'on-leave'
              rec.notes = `Approved Leave (${approvedLeave.leaveType || 'Leave'})`
              rec.isLop = false
              rec.penaltyDays = 0
              await repository.save(rec)
              updatedCount++
            }
          }
          continue
        }

        const punchEval = evaluatePunchIn({ checkInTime: rec.checkIn, shift: shiftConfig, approvedLeave })

        let checkoutEval = null
        if (rec.checkOut) {
          checkoutEval = evaluateCheckOut({
            checkOutTime: rec.checkOut,
            checkInTime: rec.checkIn,
            shift: shiftConfig,
            verifiedCampusMinutes: rec.verifiedCampusMinutes,
            approvedLeave,
          })
        }

        const isApprovedPaidHalfDay = Boolean(
          approvedLeave && approvedLeave.isHalfDay && (
            approvedLeave.paidUnits > 0 || (approvedLeave.leaveType !== 'lop' && approvedLeave.leaveType !== 'double_lop')
          )
        )

        const doubleLopEval = evaluatePost25thDoubleLop({
          dateStr: recDate,
          isLop: isApprovedPaidHalfDay ? false : (rec.isLop || rec.status === 'lop'),
          isAbsent: rec.status === 'absent',
        })

        let recLateCount = 0
        if (punchEval.isLate) {
          try {
            const monthKey = recDate.slice(0, 7)
            const priorMonthRecords = await repository.list({ employeeId: rec.employeeId.toUpperCase(), month: monthKey })
            const priorLates = (priorMonthRecords || []).filter(r => r.date < recDate && (r.isLate || r.status === 'late') && r.policyEvaluation?.occurrence !== 'half_day_leave_on_time').length
            recLateCount = priorLates + 1
          } catch {
            recLateCount = 1
          }
        }

        const isStillActive = !rec.checkOut
        const finalStatus = punchEval.status === 'half-day'
          ? 'half-day'
          : checkoutEval?.isCampusShortfall
          ? 'half-day'
          : punchEval.isLate
          ? 'late'
          : 'present'

        const updated = {
          ...rec,
          shift: shiftConfig.name,
          shiftCode: shiftConfig.shiftId.toLowerCase(),
          isLate: punchEval.isLate,
          lateCount: recLateCount,
          isHalfDay: punchEval.isHalfDay || (checkoutEval ? checkoutEval.isCampusShortfall : false) || Boolean(approvedLeave?.isHalfDay),
          halfDayPeriod: approvedLeave?.halfDayPeriod || rec.halfDayPeriod || null,
          status: finalStatus,
          isEarlyLogout: checkoutEval ? checkoutEval.isEarlyLogout : false,
          totalHours: isStillActive
            ? 'Active (Live)'
            : (typeof rec.totalHours === 'string' && rec.totalHours.includes('Active') ? '8.0 hrs' : rec.totalHours),
          notes: punchEval.notes || (punchEval.isLate
            ? punchEval.notes
            : `Verified Attendance (${shiftConfig.name})`),
          doubleLopStatus: isApprovedPaidHalfDay ? 'none' : (doubleLopEval.applies ? (rec.doubleLopStatus === 'approved' ? 'approved' : 'none') : 'none'),
          isDoubleLop: isApprovedPaidHalfDay ? false : (rec.doubleLopStatus === 'approved'),
          isLop: isApprovedPaidHalfDay ? false : (finalStatus === 'lop' || rec.isLop),
          penaltyDays: isApprovedPaidHalfDay ? 0 : (rec.penaltyDays || 0),
          approvedLeave: approvedLeave ? {
            id: approvedLeave.id,
            leaveType: approvedLeave.leaveType,
            halfDayPeriod: approvedLeave.halfDayPeriod,
            isPaid: approvedLeave.isPaid,
            isDoubleLop: approvedLeave.isDoubleLop,
          } : (rec.approvedLeave || null),
          policyEvaluation: {
            punch: punchEval,
            checkout: checkoutEval,
            occurrence: checkoutEval?.occurrence || punchEval?.occurrence,
            notes: checkoutEval?.notes || punchEval?.notes,
            isLate: punchEval.isLate,
            isHalfDay: punchEval.isHalfDay || Boolean(approvedLeave?.isHalfDay),
          },
        }
        await repository.save(updated)
        updatedCount++
      }

      return {
        updatedCount,
        date: target,
        records: await repository.list(query),
        message: `Attendance recalculated for ${updatedCount} record(s) on ${target} under authoritative policy.`,
      }
    },

    // Specific repair utility for resolving false late / LOP on historical half-day leaves
    async repairHalfDayLeaveAttendance() {
      let repairedCount = 0
      try {
        const LeaveReq = mongoose.models.LeaveRequest
        if (!LeaveReq) return { repairedCount: 0, message: 'Leave model not available' }
        const approvedHalfDayLeaves = await LeaveReq.find({
          $or: [{ isHalfDay: true }, { units: 0.5 }, { days: 0.5 }],
          status: 'approved'
        }).lean()
        for (const req of (approvedHalfDayLeaves || [])) {
          const reqDate = typeof req.startDate === 'string' ? req.startDate.slice(0, 10) : new Date(req.startDate).toISOString().slice(0, 10)
          let reqEmpCode = req.employeeCode || null
          if (!reqEmpCode && req.employeeId && mongoose.isValidObjectId(req.employeeId)) {
            try {
              const empDoc = await Employee.findById(req.employeeId).select('employeeId').lean()
              if (empDoc?.employeeId) reqEmpCode = empDoc.employeeId
            } catch {}
          }
          const records = await repository.list({ date: reqDate })
          for (const rec of (records || [])) {
            const matchesEmp = (
              (reqEmpCode && String(rec.employeeId).toUpperCase() === String(reqEmpCode).toUpperCase()) ||
              String(rec.userId || rec.employeeRef) === String(req.employeeId) ||
              String(rec.employeeId).toUpperCase() === String(req.employeeId).toUpperCase()
            )
            if (!matchesEmp) continue

            const isPaidHalf = req.paidUnits > 0 || (req.leaveType !== 'lop' && req.leaveType !== 'double_lop')
            const resShift = await resolveEmployeeShift(rec.employeeId, reqDate)
            const punchEval = rec.checkIn ? evaluatePunchIn({ checkInTime: rec.checkIn, shift: resShift.shift, approvedLeave: req }) : { isLate: false, status: 'half-day' }

            rec.isLate = punchEval.isLate
            rec.isHalfDay = true
            rec.halfDayPeriod = req.halfDayPeriod || rec.halfDayPeriod || 'first_half'
            rec.status = punchEval.isLate ? 'late' : 'half-day'
            rec.approvedLeave = {
              id: req.id || req._id,
              leaveType: req.leaveType,
              halfDayPeriod: req.halfDayPeriod || 'first_half',
              isPaid: isPaidHalf,
              isDoubleLop: Boolean(req.isDoubleLop),
            }
            rec.policyEvaluation = {
              ...(rec.policyEvaluation || {}),
              punch: punchEval,
              occurrence: punchEval.occurrence,
              notes: punchEval.notes,
              isLate: punchEval.isLate,
              isHalfDay: true,
            }
            rec.notes = punchEval.notes || `Approved Half-Day Leave (${req.leaveType})`
            if (!punchEval.isLate) {
              const monthKey = reqDate.slice(0, 7)
              const priorMonthRecords = await repository.list({ employeeId: rec.employeeId.toUpperCase(), month: monthKey })
              const priorLates = (priorMonthRecords || []).filter(r => r.date !== reqDate && (r.isLate || r.status === 'late') && r.policyEvaluation?.occurrence !== 'half_day_leave_on_time').length
              rec.lateCount = priorLates
            }
            if (isPaidHalf) {
              rec.isLop = false
              rec.penaltyDays = 0
              rec.doubleLopStatus = 'none'
              rec.isDoubleLop = false
            }
            await repository.save(rec)
            repairedCount++
          }
        }
      } catch (err) {
        console.warn('[AttendanceService:repairHalfDayLeaveAttendance] Warning:', err.message)
      }
      return { repairedCount, message: `Repaired ${repairedCount} historical half-day attendance records.` }
    },

    async approveDoubleLop({ recordId, approved, actor, reason }) {
      const record = await repository.findById(recordId)
      if (!record) {
        const err = new Error('Attendance record not found.')
        err.statusCode = 404
        throw err
      }
      const newStatus = approved ? 'approved' : 'rejected'
      const updated = {
        ...record,
        doubleLopStatus: newStatus,
        isDoubleLop: Boolean(approved),
        doubleLopApprovedBy: actor?.id || actor?.name || 'ADMIN',
        doubleLopApprovedAt: new Date(),
        doubleLopReason: reason || (approved ? 'Authorized post-25th Double LOP' : 'Rejected post-25th Double LOP'),
      }
      return repository.save(updated)
    },

    async deleteRecord(id, options = {}) {
      return repository.delete(id, options)
    },
  }
}
