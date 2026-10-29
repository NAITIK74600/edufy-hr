import { Shift } from '../../models/Shift.js'
import { ShiftAssignment } from '../../models/ShiftAssignment.js'
import { AttendanceSettings } from '../../models/AttendanceSettings.js'

/**
 * Standard Default Shift Specification
 * Standard punch-in: 11:00 AM
 * Grace period: up to 11:15 AM (inclusive)
 * Late login: after 11:15 AM
 * Half-day cutoff: after 12:00 PM
 * Early logout window: 06:30 PM - 07:40 PM
 * Verified campus presence: 4 hours (240 mins) minimum for half day
 */
export const STANDARD_SHIFT_DEF = Object.freeze({
  shiftId: 'STANDARD',
  name: 'Standard Shift (11:00 AM – 08:00 PM)',
  startTime: '11:00 AM',
  endTime: '08:00 PM',
  startMinutes: 660,    // 11 * 60
  endMinutes: 1200,     // 20 * 60
  isOvernight: false,
  gracePeriodMinutes: 15,
  graceCutoffMinutes: 675, // 11:15 AM
  halfDayCutoffMinutes: 720, // 12:00 PM
  earlyLogoutWindow: Object.freeze({
    startMinutes: 1110, // 18:30 (06:30 PM)
    endMinutes: 1180,   // 19:40 (07:40 PM)
    startTime: '06:30 PM',
    endTime: '07:40 PM',
  }),
  requiredCampusHours: 4,
  requiredCampusMinutes: 240,
  timezone: 'Asia/Kolkata',
})

/**
 * Parses any standard 12h or 24h time string into minutes since midnight (0..1439).
 * Explicitly resolves AM/PM and 24-hour formats.
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null
  const clean = timeStr.trim().replace(/[\u202F\u00A0]/g, ' ')
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridiem = match[3]?.toUpperCase()

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) return null

  if (meridiem === 'PM' && hours < 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0

  if (hours < 0 || hours > 23) return null
  return hours * 60 + minutes
}

/**
 * Formats minutes since midnight into a clean 12-hour AM/PM string.
 */
export function formatMinutesToTime(mins) {
  if (mins === null || mins === undefined || !Number.isFinite(mins)) return '—'
  const normalized = ((mins % 1440) + 1440) % 1440
  let hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
}

/**
 * Normalizes a Shift document or definition into consistent minutes and boundaries.
 */
export function normalizeShiftConfig(raw) {
  if (!raw) return { ...STANDARD_SHIFT_DEF }
  const startMins = raw.startMinutes ?? parseTimeToMinutes(raw.startTime) ?? STANDARD_SHIFT_DEF.startMinutes
  const endMins = raw.endMinutes ?? parseTimeToMinutes(raw.endTime) ?? STANDARD_SHIFT_DEF.endMinutes
  const isOvernight = Boolean(raw.isOvernight ?? (endMins < startMins))
  const graceMins = raw.gracePeriodMinutes ?? 15
  const graceCutoff = startMins + graceMins

  // Half day cutoff: explicitly configured, or 60 minutes after start time
  const halfDayCutoff = raw.halfDayCutoffMinutes ?? (startMins + 60)

  // Early logout window:
  let earlyStart = raw.earlyLogoutWindow?.startMinutes
  let earlyEnd = raw.earlyLogoutWindow?.endMinutes
  if (earlyStart === undefined || earlyEnd === undefined) {
    if (raw.earlyLogoutWindow?.startTime && raw.earlyLogoutWindow?.endTime) {
      earlyStart = parseTimeToMinutes(raw.earlyLogoutWindow.startTime)
      earlyEnd = parseTimeToMinutes(raw.earlyLogoutWindow.endTime)
    } else {
      // Default: window ending 20 mins before shift end, spanning 70 mins
      earlyStart = Math.max(0, endMins - 90)
      earlyEnd = Math.max(0, endMins - 20)
    }
  }

  return {
    shiftId: raw.shiftId || 'CUSTOM',
    name: raw.name || `Shift (${formatMinutesToTime(startMins)} – ${formatMinutesToTime(endMins)})`,
    startTime: raw.startTime || formatMinutesToTime(startMins),
    endTime: raw.endTime || formatMinutesToTime(endMins),
    startMinutes: startMins,
    endMinutes: endMins,
    isOvernight,
    gracePeriodMinutes: graceMins,
    graceCutoffMinutes: graceCutoff,
    halfDayCutoffMinutes: halfDayCutoff,
    earlyLogoutWindow: {
      startMinutes: earlyStart,
      endMinutes: earlyEnd,
      startTime: formatMinutesToTime(earlyStart),
      endTime: formatMinutesToTime(earlyEnd),
    },
    requiredCampusHours: raw.requiredCampusHours ?? 4,
    requiredCampusMinutes: (raw.requiredCampusHours ?? 4) * 60,
    timezone: raw.timezone || 'Asia/Kolkata',
  }
}

/**
 * Resolves the authoritative shift for an employee on a specific date.
 * Queries ShiftAssignment; falls back to active default Shift; if none, returns null safely.
 */
export async function resolveEmployeeShift(employeeId, dateStr) {
  const cleanEmpId = String(employeeId || '').trim().toUpperCase()
  const targetDate = String(dateStr || '').trim()

  if (cleanEmpId && targetDate) {
    try {
      // 1. Check for specific assignment on this date
      const assignment = await ShiftAssignment.findOne({
        employeeId: cleanEmpId,
        effectiveFrom: { $lte: targetDate },
        $or: [{ effectiveTo: null }, { effectiveTo: { $gte: targetDate } }],
      }).sort({ effectiveFrom: -1, assignedAt: -1 }).lean()

      if (assignment?.shiftId) {
        const configuredShift = await Shift.findOne({ shiftId: assignment.shiftId.toUpperCase(), isActive: true }).lean()
        if (configuredShift) {
          return {
            shift: normalizeShiftConfig(configuredShift),
            source: 'assignment',
            assignmentId: assignment._id,
          }
        }
      }
    } catch {
      // Fall through to default if database is unavailable or model not ready
    }
  }

  // 2. Query authoritative attendance settings configured by admin
  try {
    const settings = (await AttendanceSettings.findOne({ key: 'office' }).lean()) ||
      (await AttendanceSettings.findOne({}).sort({ updatedAt: -1 }).lean())
    const rules = settings?.attendanceRules
    if (rules?.workStartTime && rules?.workEndTime) {
      const startMins = parseTimeToMinutes(rules.workStartTime)
      const endMins = parseTimeToMinutes(rules.workEndTime)
      const graceMins = Number(rules.gracePeriodMinutes) ?? 15
      if (startMins !== null && endMins !== null) {
        const customShift = {
          shiftId: 'GENERAL',
          name: `General (${formatMinutesToTime(startMins)} – ${formatMinutesToTime(endMins)})`,
          startTime: formatMinutesToTime(startMins),
          endTime: formatMinutesToTime(endMins),
          startMinutes: startMins,
          endMinutes: endMins,
          isOvernight: endMins < startMins,
          gracePeriodMinutes: graceMins,
          graceCutoffMinutes: startMins + graceMins,
          halfDayCutoffMinutes: startMins + 60,
          earlyLogoutWindow: {
            startMinutes: Math.max(0, endMins - 90),
            endMinutes: Math.max(0, endMins - 20),
            startTime: formatMinutesToTime(Math.max(0, endMins - 90)),
            endTime: formatMinutesToTime(Math.max(0, endMins - 20)),
          },
          requiredCampusHours: 4,
          requiredCampusMinutes: 240,
          timezone: 'Asia/Kolkata',
        }
        return {
          shift: normalizeShiftConfig(customShift),
          source: 'attendance_settings',
        }
      }
    }
  } catch {}

  // 3. Query system default shift from Shift collection
  try {
    const defaultShift = await Shift.findOne({ isDefault: true, isActive: true }).lean()
    if (defaultShift) {
      return {
        shift: normalizeShiftConfig(defaultShift),
        source: 'system_default',
      }
    }
  } catch {}

  // 4. Fallback to standard in-memory policy definition
  return {
    shift: { ...STANDARD_SHIFT_DEF },
    source: 'standard_policy',
  }
}

/**
 * Evaluates punch-in timestamp against the resolved shift policy.
 * Standard Punch-In Rules:
 * - On or before 11:15 AM (gracePeriod inclusive): On-Time (present)
 * - After 11:15 AM and up to 12:00 PM: Late Login (present, late occurrence)
 * - After 12:00 PM (half-day cutoff): Half Day (half-day status)
 */
export function evaluatePunchIn({ checkInTime, shift = STANDARD_SHIFT_DEF }) {
  const normShift = normalizeShiftConfig(shift)
  const inMins = parseTimeToMinutes(checkInTime)
  if (inMins === null) {
    return {
      status: 'present',
      isLate: false,
      isHalfDay: false,
      lateMinutes: 0,
      occurrence: 'invalid_time',
      notes: 'Timestamp requires verification',
    }
  }

  const { startMinutes, graceCutoffMinutes, halfDayCutoffMinutes, isOvernight } = normShift

  // Calculate relative arrival relative to shift start
  let relativeMins = inMins - startMinutes
  if (isOvernight && relativeMins < -720) {
    relativeMins += 1440
  }

  // Check boundary rules
  if (inMins <= graceCutoffMinutes) {
    // Within grace period (e.g. 11:00 AM or 11:15 AM)
    return {
      status: 'present',
      isLate: false,
      isHalfDay: false,
      lateMinutes: 0,
      occurrence: 'on_time',
      notes: `On-time punch (${checkInTime} within grace limit of ${formatMinutesToTime(graceCutoffMinutes)})`,
    }
  }

  if (inMins <= halfDayCutoffMinutes) {
    // After grace period but before / at half-day cutoff (e.g. 11:16 AM to 12:00 PM)
    const lateMins = inMins - startMinutes
    return {
      status: 'present',
      isLate: true,
      isHalfDay: false,
      lateMinutes: Math.max(1, lateMins),
      occurrence: 'late_login',
      notes: `Late Login (${lateMins}m past ${normShift.startTime} start)`,
    }
  }

  // After half-day cutoff (e.g. > 12:00 PM)
  const lateMins = inMins - startMinutes
  return {
    status: 'half-day',
    isLate: true,
    isHalfDay: true,
    lateMinutes: Math.max(1, lateMins),
    occurrence: 'half_day_late',
    notes: `Half Day applied: Login at ${checkInTime} exceeds ${formatMinutesToTime(halfDayCutoffMinutes)} cutoff`,
  }
}

/**
 * Evaluates punch-out against shift end time, early logout window, and verified campus presence.
 * - Early logout window: 06:30 PM - 07:40 PM
 * - Campus presence: 4 hours required for half-day
 */
export function evaluateCheckOut({
  checkOutTime,
  checkInTime,
  shift = STANDARD_SHIFT_DEF,
  elapsedMinutes = null,
  verifiedCampusMinutes = null,
}) {
  const normShift = normalizeShiftConfig(shift)
  const outMins = parseTimeToMinutes(checkOutTime)
  const inMins = parseTimeToMinutes(checkInTime)

  if (outMins === null) {
    return {
      isEarlyLogout: false,
      isCampusShortfall: false,
      occurrence: 'invalid_time',
      notes: 'Check-out timestamp requires verification',
    }
  }

  const { earlyLogoutWindow, requiredCampusMinutes } = normShift
  const isWithinEarlyWindow = (
    outMins >= earlyLogoutWindow.startMinutes &&
    outMins <= earlyLogoutWindow.endMinutes
  )

  const effectiveDuration = verifiedCampusMinutes !== null
    ? verifiedCampusMinutes
    : (elapsedMinutes !== null ? elapsedMinutes : (inMins !== null ? Math.max(0, outMins - inMins) : 0))

  const isCampusShortfall = effectiveDuration < requiredCampusMinutes

  if (isWithinEarlyWindow) {
    return {
      isEarlyLogout: true,
      isCampusShortfall,
      occurrence: 'early_logout',
      notes: `Early Logout recorded (${checkOutTime} in window ${earlyLogoutWindow.startTime}–${earlyLogoutWindow.endTime})`,
    }
  }

  return {
    isEarlyLogout: false,
    isCampusShortfall,
    occurrence: isCampusShortfall ? 'short_hours' : 'normal_logout',
    notes: isCampusShortfall
      ? `Insufficient campus presence (${Math.floor(effectiveDuration / 60)}h ${effectiveDuration % 60}m < ${normShift.requiredCampusHours}h)`
      : `Completed shift (${checkOutTime})`,
  }
}

/**
 * Evaluates repeated occurrences across a date range.
 * Rule: 3 late logins OR 3 early logouts trigger the configured Half LOP rule (0.5 LOP day).
 */
export function evaluateRepeatedOccurrences(records = []) {
  let lateCount = 0
  let earlyLogoutCount = 0

  for (const r of records) {
    if (r.isLate || r.status === 'late' || r.policyEvaluation?.occurrence === 'late_login') {
      lateCount++
    }
    if (r.isEarlyLogout || r.status === 'early-logout' || r.policyEvaluation?.occurrence === 'early_logout') {
      earlyLogoutCount++
    }
  }

  const lateHalfLopDays = Math.floor(lateCount / 3) * 0.5
  const earlyHalfLopDays = Math.floor(earlyLogoutCount / 3) * 0.5
  const totalHalfLopDays = lateHalfLopDays + earlyHalfLopDays

  return {
    lateCount,
    earlyLogoutCount,
    lateHalfLopDays,
    earlyHalfLopDays,
    totalHalfLopDays,
    qualifiesForHalfLop: totalHalfLopDays > 0,
  }
}

/**
 * Evaluates post-25th Double LOP trigger condition.
 * Requirement: Create pending approval; DO NOT apply Double LOP without authorized HR/Admin approval.
 */
export function evaluatePost25thDoubleLop({ dateStr, isLop = false, isAbsent = false, existingStatus = null }) {
  if (!dateStr) return { applies: false, pendingApproval: false }
  const parts = String(dateStr).split('-')
  const day = parts.length === 3 ? parseInt(parts[2], 10) : 1

  const qualifies = (day >= 25) && (isLop || isAbsent || existingStatus === 'lop' || existingStatus === 'absent')
  if (!qualifies) {
    return { applies: false, pendingApproval: false }
  }

  return {
    applies: true,
    pendingApproval: true,
    doubleLopStatus: 'pending_approval',
    notes: `Post-25th unexcused absence on ${dateStr} requires HR/Admin approval before Double LOP can be applied`,
  }
}

