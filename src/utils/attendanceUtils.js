/**
 * Utilities for formatting attendance statuses and grace occurrence options
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

export function getLateOccurrence(record) {
  if (!record) return 1
  if (record.lateCount === 1) return 1
  if (record.lateCount === 2) return 2
  const notes = record.notes || ''
  if (typeof notes === 'string') {
    if (/#2\b|2 of 2|2\/2/i.test(notes)) return 2
    if (/#1\b|1 of 2|1\/2/i.test(notes)) return 1
  }
  return 1
}

export function formatAttendanceNotes(notes) {
  if (!notes) return null
  const shiftMatch = /\(([^)]+Shift)\)/i.exec(notes)
  const shiftName = shiftMatch ? `(${shiftMatch[1]})` : null

  // If the note is purely an auto-generated grace message, condense to just the shift name
  if (/^Late Login #\d+( of 2 accepted grace arrivals|\s*\(Grace period:[^)]+\)|\/2)(\s*\([^)]+\))?$/i.test(notes.trim())) {
    return shiftName
  }

  // If there are other notes attached, clean out the redundant grace arrival sentence
  const cleaned = notes
    .replace(/Late Login #\d+ of 2 accepted grace arrivals( \([^)]+\))?/gi, '')
    .replace(/Late Login #\d+ \(Grace period: \d+\/2 accepted\)/gi, '')
    .replace(/Late Login #\d+\/2( \([^)]+\))?/gi, '')
    .replace(/^[\s|·-]+|[\s|·-]+$/g, '')
    .trim()

  if (!cleaned && shiftName) return shiftName
  if (cleaned && shiftName && !cleaned.includes(shiftName)) return `${shiftName} · ${cleaned}`
  return cleaned || null
}

/**
 * Returns clean daily status dynamically evaluated against active shift rules:
 * - On-Time (punch in within on-time or grace period)
 * - Half Day (worked minimum 4 hrs)
 * - Absent (worked less than 4 hrs)
 * - Early Logout (worked 6 hr 30 min / early window)
 * - Late (punch-in after grace period)
 * - On Leave (approved leave)
 * - Loss of Pay (explicit LOP)
 */
export function getDailyAttendanceStatus(r, attendanceRules = null) {
  if (!r) return { label: 'Absent', tone: 'danger' }

  if (r.status === 'on-leave') {
    return { label: 'On Leave', tone: 'neutral' }
  }

  // Explicit LOP
  if (r.status === 'lop' || r.isLop) {
    return { label: 'Loss of Pay', tone: 'danger' }
  }

  // DYNAMIC CHECK: Evaluate punch-in against active shift rules
  let isPunchLate = Boolean(r.isLate || r.status === 'late')
  let isPunchHalfDay = Boolean(r.isHalfDay || r.status === 'half-day')
  if (r.checkIn) {
    const checkInM = parseTimeToMinutes(r.checkIn)
    const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660 // default 11:00 AM
    const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0
      ? Number(attendanceRules.gracePeriodMinutes)
      : 30
    if (checkInM !== null && startM !== null) {
      isPunchLate = checkInM > (startM + grace)
      // When punch-in is 1 hour (60 mins) or more late -> marked as Half Day!
      if (checkInM >= (startM + 60)) {
        isPunchHalfDay = true
      }
    }
  }

  // Calculate worked hours if check-in and check-out exist
  let workedHours = null
  const hasCheckedOut = Boolean(r.checkOut && r.checkOut !== '—' && r.checkOut !== '-' && !String(r.checkOut).includes('Active'))
  if (r.checkIn && hasCheckedOut) {
    const inM = parseTimeToMinutes(r.checkIn)
    const outM = parseTimeToMinutes(r.checkOut)
    if (inM !== null && outM !== null) {
      let diff = outM - inM
      if (diff < 0) diff += 1440 // overnight shift
      const netMinutes = Math.max(0, diff - (Number(r.totalBreakMinutes) || 0))
      workedHours = netMinutes / 60
    }
  }

  // If employee has checked out, status is determined by worked duration or 1-hour late punch
  if (hasCheckedOut && workedHours !== null) {
    // 1. Absent: worked less than 4 hours (< 4 hrs)
    if (workedHours < 4) {
      return { label: 'Absent', tone: 'danger' }
    }
    // 2. Half Day: 1hr late punch OR minimum 4 hrs worked (4 <= workedHours < 6.5)
    if (isPunchHalfDay || workedHours < 6.5) {
      return { label: 'Half Day', tone: 'warning' }
    }
    // 3. Early Logout: 6 hr 30 min (6.5 <= workedHours < 8)
    if (workedHours < 8) {
      return { label: 'Early Logout', tone: 'warning' }
    }
    // Full day worked (>= 8 hrs)
    return isPunchLate ? { label: 'Late', tone: 'warning' } : { label: 'On-Time', tone: 'info' }
  }

  // If employee is actively working (no checkout yet) or check-in only
  if (r.checkIn) {
    if (isPunchHalfDay) {
      return { label: 'Half Day', tone: 'warning' }
    }
    return isPunchLate ? { label: 'Late', tone: 'warning' } : { label: 'On-Time', tone: 'info' }
  }

  if (r.status === 'absent') {
    return { label: 'Absent', tone: 'danger' }
  }

  return { label: 'Absent', tone: 'danger' }
}

/**
 * Returns late & early logout occurrence count for the month and corresponding LOP day deduction:
 * - Policy: Late Login and Early Logout are combined together
 * - Every 3 occurrences (e.g. 2 early logout + 1 late login = 3) = 0.5 LOP day
 * - 6 occurrences = 1.0 LOP day
 */
export function getLateCountInfo(r, allAttendance = [], targetDate = '', attendanceRules = null) {
  if (!r) return { count: 0, lopDays: 0, lateCount: 0, earlyLogoutCount: 0, isLate: false, isEarlyLogout: false }
  const empCode = String(r.employeeId || '').toUpperCase()
  const dateStr = r.date || targetDate || ''
  const monthPrefix = dateStr.slice(0, 7)

  // Dynamically test if a record is late under active shift rules
  const isRecordLate = (record) => {
    if (record.isLate || record.status === 'late') return true
    if (record.checkIn) {
      const inM = parseTimeToMinutes(record.checkIn)
      const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660
      const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0
        ? Number(attendanceRules.gracePeriodMinutes)
        : 30
      if (inM !== null && startM !== null) {
        return inM > (startM + grace)
      }
    }
    return false
  }

  // Dynamically test if a record is early logout under active shift rules
  const isRecordEarlyLogout = (record) => {
    if (record.isEarlyLogout || record.status === 'early-logout') return true
    if (record.checkIn && record.checkOut && record.checkOut !== '—' && record.checkOut !== '-' && !String(record.checkOut).includes('Active')) {
      const inM = parseTimeToMinutes(record.checkIn)
      const outM = parseTimeToMinutes(record.checkOut)
      if (inM !== null && outM !== null) {
        let diff = outM - inM
        if (diff < 0) diff += 1440
        const netMinutes = Math.max(0, diff - (Number(record.totalBreakMinutes) || 0))
        const workedHours = netMinutes / 60
        // 6.5 <= workedHours < 8 -> Early Logout
        if (workedHours >= 6.5 && workedHours < 8) return true
      }
      if (outM !== null && attendanceRules?.workEndTime) {
        const endM = parseTimeToMinutes(attendanceRules.workEndTime)
        if (endM !== null && outM < endM && outM >= (endM - 90)) {
          return true
        }
      }
    }
    return false
  }

  const isCurrentLate = isRecordLate(r)
  const isCurrentEarly = isRecordEarlyLogout(r)

  // If current record is neither late nor early logout, it has no active infraction
  if (!isCurrentLate && !isCurrentEarly) {
    return { count: 0, lopDays: 0, lateCount: 0, earlyLogoutCount: 0, isLate: false, isEarlyLogout: false }
  }

  // Find all attendance records of this employee in the month up to this date
  const empMonthRecords = (allAttendance || []).filter(
    (a) => String(a.employeeId || '').toUpperCase() === empCode &&
           a.date && a.date.startsWith(monthPrefix) &&
           a.date <= dateStr
  )

  let lateCount = 0
  let earlyLogoutCount = 0
  for (const a of empMonthRecords) {
    if (isRecordLate(a)) lateCount++
    if (isRecordEarlyLogout(a)) earlyLogoutCount++
  }

  const totalInfractions = lateCount + earlyLogoutCount
  // Rule: Any 3 combined (late logins + early logouts) = 0.5 LOP day
  const lopDays = totalInfractions > 0 ? Math.floor(totalInfractions / 3) * 0.5 : 0

  return {
    count: Math.max(1, totalInfractions),
    totalInfractions,
    lateCount,
    earlyLogoutCount,
    lopDays,
    isLate: isCurrentLate,
    isEarlyLogout: isCurrentEarly,
  }
}

/**
 * Returns month total infractions (late logins + early logouts) and resulting LOP days for an employee
 */
export function getMonthInfractionsSummary(employeeId, allAttendance = [], monthStr = '', attendanceRules = null) {
  const empCode = String(employeeId || '').toUpperCase()
  const mPrefix = (monthStr || '').slice(0, 7)
  const records = (allAttendance || []).filter(
    (a) => String(a.employeeId || '').toUpperCase() === empCode &&
           a.date && a.date.startsWith(mPrefix)
  )

  let lateCount = 0
  let earlyLogoutCount = 0
  for (const a of records) {
    let isLate = a.isLate || a.status === 'late'
    if (!isLate && a.checkIn) {
      const inM = parseTimeToMinutes(a.checkIn)
      const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660
      const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) ? Number(attendanceRules.gracePeriodMinutes) : 30
      if (inM !== null && startM !== null) isLate = inM > (startM + grace)
    }
    if (isLate) lateCount++

    let isEarly = a.isEarlyLogout || a.status === 'early-logout'
    if (!isEarly && a.checkIn && a.checkOut && a.checkOut !== '—' && a.checkOut !== '-' && !String(a.checkOut).includes('Active')) {
      const inM = parseTimeToMinutes(a.checkIn)
      const outM = parseTimeToMinutes(a.checkOut)
      if (inM !== null && outM !== null) {
        let diff = outM - inM
        if (diff < 0) diff += 1440
        const workedHours = Math.max(0, diff - (Number(a.totalBreakMinutes) || 0)) / 60
        if (workedHours >= 6.5 && workedHours < 8) isEarly = true
      }
    }
    if (isEarly) earlyLogoutCount++
  }

  const combinedCount = lateCount + earlyLogoutCount
  const lopDays = Math.floor(combinedCount / 3) * 0.5

  return {
    lateCount,
    earlyLogoutCount,
    combinedCount,
    lopDays,
  }
}
