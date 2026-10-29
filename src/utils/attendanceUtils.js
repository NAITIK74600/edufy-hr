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
 * Returns clean daily status:
 * - On-Time (punch in within on-time or grace period)
 * - Half Day (worked minimum 4 hrs)
 * - Absent (worked less than 4 hrs)
 * - Early Logout (worked 6 hr 30 min / early window)
 * - On Leave (approved leave)
 * - Loss of Pay (explicit LOP)
 */
export function getDailyAttendanceStatus(r) {
  if (!r) return { label: 'Absent', tone: 'danger' }

  if (r.status === 'on-leave') {
    return { label: 'On Leave', tone: 'neutral' }
  }

  // Calculate worked hours if check-in and check-out exist
  let workedHours = null
  if (r.checkIn && r.checkOut && r.checkOut !== '—' && r.checkOut !== '-') {
    const inM = parseTimeToMinutes(r.checkIn)
    const outM = parseTimeToMinutes(r.checkOut)
    if (inM !== null && outM !== null) {
      let diff = outM - inM
      if (diff < 0) diff += 1440 // overnight shift
      const netMinutes = Math.max(0, diff - (Number(r.totalBreakMinutes) || 0))
      workedHours = netMinutes / 60
    }
  }

  // 1. Absent: worked less than 4 hours (< 4 hrs) or status is absent
  if (r.status === 'absent' || (workedHours !== null && workedHours < 4)) {
    return { label: 'Absent', tone: 'danger' }
  }

  // 2. Half Day: minimum 4 hrs worked (4 <= workedHours < 6.5) or status is half-day
  if (r.status === 'half-day' || r.isHalfDay || (workedHours !== null && workedHours >= 4 && workedHours < 6.5)) {
    return { label: 'Half Day', tone: 'warning' }
  }

  // 3. Early Logout: 6 hr 30 min (6.5 <= workedHours < 8) or status is early-logout
  if (r.status === 'early-logout' || r.isEarlyLogout || (workedHours !== null && workedHours >= 6.5 && workedHours < 8)) {
    return { label: 'Early Logout', tone: 'warning' }
  }

  // Explicit LOP
  if (r.status === 'lop' || r.isLop) {
    return { label: 'Loss of Pay', tone: 'danger' }
  }

  // 4. Punch in on time (grace period is counted in on-time)
  if (!r.isLate && r.status !== 'late') {
    return { label: 'On-Time', tone: 'info' }
  }

  // 5. Punch in was late
  return { label: 'Late', tone: 'warning' }
}

/**
 * Returns late occurrence count for the month and corresponding LOP day deduction:
 * - 3 late logins = 0.5 LOP day
 * - 6 late logins = 1.0 LOP day
 */
export function getLateCountInfo(r, allAttendance = [], targetDate = '') {
  if (!r) return { count: 0, lopDays: 0 }
  const empCode = String(r.employeeId || '').toUpperCase()
  const dateStr = r.date || targetDate || ''
  const monthPrefix = dateStr.slice(0, 7)

  // Find all attendance records of this employee in the month up to this date
  const monthLates = (allAttendance || []).filter(
    (a) => String(a.employeeId || '').toUpperCase() === empCode &&
           a.date && a.date.startsWith(monthPrefix) &&
           a.date <= dateStr &&
           (a.isLate || a.status === 'late')
  ).length

  const count = r.lateCount > 0 ? r.lateCount : (r.isLate ? Math.max(1, monthLates) : monthLates)
  // On every 3 late logins = 0.5 LOP, for 6 = 1.0 LOP
  const lopDays = count > 0 ? Math.floor(count / 3) * 0.5 : 0

  return { count, lopDays }
}
