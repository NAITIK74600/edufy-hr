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
  'Edufyi-Office-5G',
  'Edufyi-Corp-Secure',
  'Edufyi-Guest-HighSpeed',
  'Airtel_Naitik5G',
]

// Registered access points. A network is trusted only when BOTH the SSID (name) and the
// BSSID (access-point hardware MAC) match — a spoofed hotspot reusing the name has a
// different BSSID. allowedIPs is the office public IP / gateway subnet the backend checks
// independently so a device off the office network can never be marked present by name alone.
const DEFAULT_WIFI_NETWORKS = [
  { ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', securityType: 'WPA2-Enterprise', branchName: 'HQ - San Francisco', allowedIPs: ['127.0.0.1', '::1', '10.0.0.0/8', '192.168.1.0/24'] },
  { ssid: 'Edufyi-Corp-Secure', bssid: '9C:3D:CF:22:B4:02', securityType: 'WPA3-Enterprise', branchName: 'Tech Hub - Austin', allowedIPs: ['127.0.0.1', '::1', '172.16.0.0/16'] },
  { ssid: 'Edufyi-Guest-HighSpeed', bssid: '9C:3D:CF:33:C6:03', securityType: 'WPA2-Personal', branchName: 'Global Center - London', allowedIPs: ['127.0.0.1', '::1', '192.168.10.0/24'] },
  { ssid: 'Airtel_Naitik5G', bssid: 'A4:2B:8C:44:D8:05', securityType: 'WPA2-Personal', branchName: 'HQ - San Francisco', allowedIPs: ['127.0.0.1', '::1'] },
]

// Policy-free baseline: Default attendance rules retain security parameters (geofence & network)
// Obsolete work start/end times and grace periods are removed pending new policy.
const DEFAULT_ATTENDANCE_RULES = {
  maxGeofenceRadiusMeters: 30,
  strictGeofenceRequired: false,
  requireOfficeNetworkAndGps: true,
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
  if (!timeStr && timeStr !== 0) return isEndTime ? '18:30' : '09:30'
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

export async function evaluateShiftLateness(checkInTime, employeeId = null, workDate = null) {
  // Resolve the employee's shift, falling back to admin-configured shift timings if present.
  let resolvedShift = null;
  if (employeeId && workDate) {
    try {
      const { shift } = await resolveEmployeeShift(employeeId, workDate);
      resolvedShift = shift;
    } catch {
      // fallback to standard definition on error
    }
  }
  // If admin has overridden shift timing via attendanceRules, apply those overrides.
  if (!resolvedShift && service && service.getConfig) {
    const rules = service.getConfig().attendanceRules || {};
    if (rules.workStartTime && rules.workEndTime) {
      const startMins = parseTimeToMinutes(rules.workStartTime);
      const endMins = parseTimeToMinutes(rules.workEndTime);
      const graceMins = Number(rules.gracePeriodMinutes) || 0;
      resolvedShift = {
        shiftId: 'CUSTOM',
        name: `Custom Shift (${rules.workStartTime} – ${rules.workEndTime})`,
        startTime: rules.workStartTime,
        endTime: rules.workEndTime,
        startMinutes: startMins,
        endMinutes: endMins,
        isOvernight: endMins !== null && startMins !== null && endMins < startMins,
        gracePeriodMinutes: graceMins,
        graceCutoffMinutes: (startMins ?? 0) + graceMins,
        halfDayCutoffMinutes: null,
        earlyLogoutWindow: { startMinutes: null, endMinutes: null, startTime: null, endTime: null },
        requiredCampusHours: 0,
        requiredCampusMinutes: 0,
        timezone: 'Asia/Kolkata',
      };
    }
  }
  const evalResult = evaluatePunchIn({
    checkInTime,
    shift: resolvedShift || STANDARD_SHIFT_DEF,
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
  // Resolve the employee's shift if not explicitly provided.
  let resolvedShift = null;
  if (employeeId && workDate) {
    try {
      const { shift } = await resolveEmployeeShift(employeeId, workDate);
      resolvedShift = shift;
    } catch {
      // fallback to standard definition on error
    }
  }
  const evalResult = evaluatePunchIn({
    checkInTime,
    shift: resolvedShift || STANDARD_SHIFT_DEF,
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

function getTodayString() {
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

export function createAttendanceService({ repository, companySettings = {} }) {
  let locations = companySettings.locations || []
  let allowedWifiSSIDs = companySettings.allowedWifiSSIDs || []
  let wifiNetworks = companySettings.wifiNetworks || []
  let officeNetworkIPs = companySettings.officeNetworkIPs || []
  let attendanceRules = { ...DEFAULT_ATTENDANCE_RULES, ...(companySettings.attendanceRules || {}) }
  let holidayCalendarImages = companySettings.holidayCalendarImages || []
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

    const maxAllowedRadius = Number(attendanceRules.maxGeofenceRadiusMeters) || Number(nearestLocation?.radiusMeters) || 50
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
      nearestLocation: nearestLocation ? nearestLocation.name : (locations[0]?.name || 'No configured office'),
      matchedNetworkLabel: officeNetworkIPs.find((entry) => isIpMatching(clientIp, [entry.ip]))?.label || null,
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
        holidayCalendarImages,
      }
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
      if (newConfig.holidayCalendarImages !== undefined) holidayCalendarImages = newConfig.holidayCalendarImages
      return this.getConfig()
    },

    async getTodayRecord(employeeId, date = getTodayString()) {
      if (date === getTodayString()) {
        await this.autoPunchOutDisconnectedRecords().catch(() => { })
      }
      return repository.findByEmployeeAndDate(employeeId, date)
    },

    async listSelf(user, filters = {}) {
      await this.autoPunchOutDisconnectedRecords().catch(() => { })
      const employeeId = user.employeeId || user.id
      return repository.list({ ...filters, employeeId })
    },

    async listAll(filters = {}) {
      await this.autoPunchOutDisconnectedRecords().catch(() => { })
      return repository.list(filters)
    },

    async getSummary(date = getTodayString()) {
      if (date === getTodayString()) {
        await this.autoPunchOutDisconnectedRecords().catch(() => { })
      }
      return repository.getSummary(date)
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

      // Authoritative policy punch-in: resolves employee shift & evaluates late login / half-day
      let resolvedShiftConfig = null
      if (shift && typeof shift === 'object' && shift.startMinutes) {
        resolvedShiftConfig = normalizeShiftConfig(shift)
      } else if (shift && typeof shift === 'string') {
        const extracted = extractShiftTimes(shift)
        resolvedShiftConfig = normalizeShiftConfig({ shiftId: shiftCode, name: shift, ...extracted })
      } else {
        const resShift = await resolveEmployeeShift(employeeId, workDate)
        resolvedShiftConfig = resShift.shift
      }

      const punchEval = evaluatePunchIn({ checkInTime, shift: resolvedShiftConfig })

      // Calculate occurrence index for the month
      let currentLateCount = 0
      try {
        const monthKey = workDate.slice(0, 7)
        const priorMonthRecords = await repository.list({ employeeId: employeeId.toUpperCase(), month: monthKey })
        const priorLates = (priorMonthRecords || []).filter(r => r.date !== workDate && (r.isLate || r.status === 'late')).length
        currentLateCount = priorLates + (punchEval.isLate ? 1 : 0)
      } catch {
        currentLateCount = punchEval.isLate ? 1 : 0
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
        lateCount: currentLateCount,
        shift: resolvedShiftConfig.name,
        shiftCode: resolvedShiftConfig.shiftId.toLowerCase(),
        policyEvaluation: punchEval,
        isOnBreak: false,
        currentBreak: null,
        breaks: [],
        totalBreakMinutes: 0,
        wifiSSID: wifiSSID || '',
        bssid: verification.bssid || '',
        wifiVerified: verification.isWifiVerified,
        clientIp: clientIp || '',
        ipVerified: verification.isIpVerified,
        latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
        longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
        accuracy: accuracy !== undefined && accuracy !== null ? Math.round(Number(accuracy)) : null,
        distanceMeters: verification.distanceMeters,
        gpsVerified: verification.isGpsVerified,
        locationName: verification.nearestLocation,
        verificationMethod: verification.method,
        totalHours: 'Active (Live)',
        notes: shift ? `Verified Attendance (${shift})` : 'Verified Attendance',
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

    async checkOut({ employeeId, employeeName, date, autoPunchOut = false, punchOutReason = null, offCampusDurationMinutes = 0 }) {
      const workDate = date || getTodayString()
      if (workDate !== getTodayString()) throw Object.assign(new Error('Self-service attendance can only be recorded for today. Ask HR to correct historical attendance.'), { statusCode: 400, code: 'INVALID_ATTENDANCE_DATE' })
      let existing = await repository.findByEmployeeAndDate(employeeId, workDate)

      if (!existing || !existing.checkIn) {
        const error = new Error('No check-in record found for today. Please punch in first.')
        error.statusCode = 400
        error.code = 'NO_CHECKIN_FOUND'
        throw error
      }

      if (existing.checkOut) return existing
      const now = new Date()

      // Automatically end active break if employee punches out while on break
      let totalBreakMinutes = Number(existing.totalBreakMinutes || 0)
      let breaksList = Array.isArray(existing.breaks) ? [...existing.breaks] : []
      if (existing.isOnBreak && existing.currentBreak?.startAt) {
        const breakStart = new Date(existing.currentBreak.startAt)
        const autoDuration = Math.max(1, Math.round((now - breakStart) / 60000))
        breaksList.push({
          type: existing.currentBreak.type || 'lunch',
          startTime: existing.currentBreak.startTime || formatCurrentTime(),
          startAt: breakStart,
          endTime: formatCurrentTime(),
          endAt: now,
          durationMinutes: autoDuration,
        })
        totalBreakMinutes += autoDuration
      }

      const checkOutTime = formatCurrentTime()
      const inMins = parseTimeToMinutes(existing.checkIn)
      const outMins = parseTimeToMinutes(checkOutTime)

      let totalHoursStr = 'Duration unavailable (HR correction required)'
      let newStatus = existing.status

      const offCampusMinutes = Math.max(0, Math.round(Number(offCampusDurationMinutes) || 0))
      const elapsed = existing.checkInAt ? Math.floor((now - new Date(existing.checkInAt)) / 60000) : (inMins !== null && outMins !== null ? outMins - inMins : null)
      if (elapsed !== null && Number.isFinite(elapsed) && elapsed >= 0) {
        const netWorkMinutes = Math.max(0, elapsed - totalBreakMinutes - offCampusMinutes)
        const hours = Math.floor(netWorkMinutes / 60)
        const mins = netWorkMinutes % 60
        const breakPart = totalBreakMinutes > 0 ? ` · ${totalBreakMinutes}m Break` : ''
        const offCampusPart = offCampusMinutes > 0 ? ` · ${offCampusMinutes}m Off-Campus` : ''
        const tag = autoPunchOut ? 'Auto Punch Out' : 'Completed'
        totalHoursStr = `${hours}h ${mins}m (${tag})${breakPart}${offCampusPart}`
        newStatus = existing.status || 'present'
      }

      // Authoritative policy check-out: resolves early logout window & verified campus presence
      let resolvedOutShift = null
      if (existing.shift) {
        const extracted = extractShiftTimes(existing.shift)
        resolvedOutShift = normalizeShiftConfig({ shiftId: existing.shiftCode, name: existing.shift, ...extracted })
      } else {
        const resShift = await resolveEmployeeShift(employeeId, workDate)
        resolvedOutShift = resShift.shift
      }

      const isVerified = Boolean(existing.wifiVerified || existing.gpsVerified || existing.ipVerified)
      const verifiedDurationMinutes = isVerified
        ? Math.max(0, elapsed - totalBreakMinutes - offCampusMinutes)
        : 0

      const checkoutEval = evaluateCheckOut({
        checkOutTime,
        checkInTime: existing.checkIn,
        shift: resolvedOutShift,
        elapsedMinutes: elapsed,
        verifiedCampusMinutes: verifiedDurationMinutes,
      })

      // Count prior early logouts in the month
      let currentEarlyCount = existing.earlyLogoutCount || 0
      if (checkoutEval.isEarlyLogout) {
        try {
          const monthKey = workDate.slice(0, 7)
          const priorMonthRecords = await repository.list({ employeeId: employeeId.toUpperCase(), month: monthKey })
          const priorEarly = (priorMonthRecords || []).filter(r => r.date !== workDate && (r.isEarlyLogout || r.status === 'early-logout')).length
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
      let finalHalfDay = Boolean(existing.isHalfDay)
      if (checkoutEval.isCampusShortfall && verifiedDurationMinutes < (resolvedOutShift.requiredCampusMinutes || 240)) {
        finalHalfDay = true
        if (finalStatus === 'present') finalStatus = 'half-day'
      }

      const defaultReason = autoPunchOut ? 'Auto Punch Out (GPS & WiFi disconnected for 2 hrs)' : ''
      const reasonToSet = punchOutReason || defaultReason

      const notesArr = [existing.notes, reasonToSet, checkoutEval.notes].filter(Boolean)
      const combinedNotes = [...new Set(notesArr)].join(' | ')

      const updated = {
        ...existing,
        checkOut: checkOutTime,
        checkOutAt: now,
        totalHours: totalHoursStr,
        status: finalStatus,
        isEarlyLogout: checkoutEval.isEarlyLogout,
        earlyLogoutCount: currentEarlyCount,
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

    async updatePresence({ employeeId, latitude, longitude, wifiSSID, clientIp, bssid, accuracy }) {
      const verification = verifyLocation(latitude, longitude, wifiSSID, clientIp, bssid, accuracy)
      const isConnected = Boolean(verification.isGpsVerified || verification.isWifiVerified || verification.isIpVerified)
      const workDate = getTodayString()
      if (repository.updatePresence) {
        await repository.updatePresence(employeeId, workDate, isConnected)
      }
      let autoPunchedOut = false
      if (!isConnected) {
        const existing = await repository.findByEmployeeAndDate(employeeId, workDate)
        if (existing && existing.checkIn && !existing.checkOut) {
          const disconnectedSince = existing.disconnectedSince ? new Date(existing.disconnectedSince).getTime() : Date.now()
          const diffMs = Date.now() - disconnectedSince
          const TWO_HOURS_MS = 2 * 60 * 60 * 1000
          if (diffMs >= TWO_HOURS_MS) {
            await this.checkOut({
              employeeId,
              employeeName: existing.employeeName,
              date: workDate,
              autoPunchOut: true,
              punchOutReason: 'Auto Punch Out (GPS & WiFi disconnected for 2 hrs)',
            })
            autoPunchedOut = true
          }
        }
      }
      return {
        ...verification,
        isConnected,
        autoPunchedOut,
      }
    },

    async autoPunchOutDisconnectedRecords() {
      if (!repository.findActiveTodayRecords) return []
      const workDate = getTodayString()
      const activeRecords = await repository.findActiveTodayRecords(workDate)
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000
      const punchedOut = []
      const now = Date.now()

      for (const record of activeRecords) {
        if (!record.checkIn || record.checkOut) continue
        let shouldAutoPunch = false
        const reason = 'Auto Punch Out (GPS & WiFi disconnected for 2 hrs)'

        if (record.disconnectedSince) {
          const diff = now - new Date(record.disconnectedSince).getTime()
          if (diff >= TWO_HOURS_MS) {
            shouldAutoPunch = true
          }
        } else {
          const lastKnown = record.lastConnectedAt || record.checkInAt
          if (lastKnown) {
            const diff = now - new Date(lastKnown).getTime()
            if (diff >= TWO_HOURS_MS) {
              shouldAutoPunch = true
            }
          }
        }

        if (shouldAutoPunch) {
          try {
            const res = await this.checkOut({
              employeeId: record.employeeId,
              employeeName: record.employeeName,
              date: record.date,
              autoPunchOut: true,
              punchOutReason: reason,
            })
            punchedOut.push(res)
          } catch (err) {
            // continue
          }
        }
      }
      return punchedOut
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

      const record = {
        ...recordData,
        employeeId: recordData.employeeId.toUpperCase(),
        date: workDate,
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

    async recalculateAttendance(date = getTodayString()) {
      const records = await repository.list({ date })
      let updatedCount = 0
      for (const rec of (records || [])) {
        if (!rec.checkIn) continue
        const resShift = await resolveEmployeeShift(rec.employeeId, rec.date || date)
        const shiftConfig = resShift.shift
        const punchEval = evaluatePunchIn({ checkInTime: rec.checkIn, shift: shiftConfig })

        let checkoutEval = null
        if (rec.checkOut) {
          checkoutEval = evaluateCheckOut({
            checkOutTime: rec.checkOut,
            checkInTime: rec.checkIn,
            shift: shiftConfig,
            verifiedCampusMinutes: rec.verifiedCampusMinutes,
          })
        }

        const doubleLopEval = evaluatePost25thDoubleLop({
          dateStr: rec.date || date,
          isLop: rec.isLop || rec.status === 'lop',
          isAbsent: rec.status === 'absent',
        })

        const updated = {
          ...rec,
          shift: shiftConfig.name,
          shiftCode: shiftConfig.shiftId.toLowerCase(),
          isLate: punchEval.isLate,
          isHalfDay: punchEval.isHalfDay || (checkoutEval ? checkoutEval.isCampusShortfall : false),
          status: punchEval.status === 'half-day' ? 'half-day' : (checkoutEval?.isCampusShortfall ? 'half-day' : (rec.status || punchEval.status)),
          isEarlyLogout: checkoutEval ? checkoutEval.isEarlyLogout : false,
          doubleLopStatus: doubleLopEval.applies ? (rec.doubleLopStatus === 'approved' ? 'approved' : 'pending_approval') : 'none',
          isDoubleLop: rec.doubleLopStatus === 'approved',
          policyEvaluation: { punch: punchEval, checkout: checkoutEval },
        }
        await repository.save(updated)
        updatedCount++
      }

      return {
        updatedCount,
        date,
        records: await repository.list({ date }),
        message: `Attendance recalculated for ${updatedCount} record(s) on ${date} under authoritative policy.`,
      }
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
