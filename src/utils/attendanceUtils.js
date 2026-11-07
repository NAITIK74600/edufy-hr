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
export function getDailyAttendanceStatus(r, attendanceRules = null, allLeaves = []) {
  if (!r || (!r.checkIn && r.status !== 'on-leave' && r.status !== 'holiday')) {
    if (r?.status === 'on-leave') return { label: 'On Leave', tone: 'neutral' }
    if (r?.status === 'holiday') return { label: 'Holiday', tone: 'info' }
    return { label: 'Absent', tone: 'danger' }
  }

  if (r.status === 'on-leave') {
    return { label: 'On Leave', tone: 'neutral' }
  }

  // Resolve approved leave from record or allLeaves fallback first
  let approvedLeave = r?.approvedLeave
  if (!approvedLeave && Array.isArray(allLeaves) && allLeaves.length > 0 && r?.employeeId) {
    const empCode = String(r.employeeId).toUpperCase()
    const targetDate = r.date || ''
    const matched = allLeaves.find((l) => {
      if (l.status !== 'approved') return false
      const lEmpCode = String(l.employeeCode || l.employeeId?.employeeId || l.employeeId?._id || l.employeeId || '').toUpperCase()
      const lEmpName = String(l.employeeName || l.employeeId?.name || '').toUpperCase()
      const rEmpName = String(r.employeeName || '').toUpperCase()
      const isEmpMatch = (lEmpCode && lEmpCode === empCode) || (lEmpName && rEmpName && (lEmpName === rEmpName || lEmpName.includes(rEmpName) || rEmpName.includes(lEmpName)))
      if (!isEmpMatch) return false
      const s = typeof l.startDate === 'string' ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10)
      const e = typeof l.endDate === 'string' ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10)
      const inRange = targetDate >= s && targetDate <= e
      const inBreakdown = Array.isArray(l.dayBreakdown) && l.dayBreakdown.some((d) => d.date === targetDate)
      return inRange || inBreakdown
    })
    if (matched) {
      approvedLeave = {
        id: matched.id || matched._id,
        leaveType: matched.leaveType,
        isHalfDay: Boolean(matched.isHalfDay || matched.units === 0.5 || matched.days === 0.5),
        halfDayPeriod: matched.halfDayPeriod || (matched.isHalfDay ? 'first_half' : null),
        isPaid: matched.paidUnits > 0 || (matched.leaveType !== 'lop' && matched.leaveType !== 'double_lop'),
      }
    }
  }

  const isApprovedPaidHalfDay = Boolean(
    approvedLeave && approvedLeave.isHalfDay && approvedLeave.isPaid
  )

  // Explicit LOP (ignore stale LOP flag if employee has approved paid half-day leave)
  if (!isApprovedPaidHalfDay && (r.status === 'lop' || r.isLop)) {
    return { label: 'Loss of Pay', tone: 'danger' }
  }

  // Check if this record is associated with an approved first-half or second-half leave
  const occ = r.policyEvaluation?.occurrence || r.policyEvaluation?.punch?.occurrence || r.occurrence
  const isFirstHalfLeave = r.halfDayPeriod === 'first_half' || approvedLeave?.halfDayPeriod === 'first_half' || occ === 'half_day_leave_on_time'
  const isSecondHalfLeave = r.halfDayPeriod === 'second_half' || approvedLeave?.halfDayPeriod === 'second_half' || occ === 'half_day_leave_checkout'
  const isApprovedHalfDay = isFirstHalfLeave || isSecondHalfLeave || Boolean(approvedLeave?.isHalfDay)

  let isFirstHalfOnTimeArrival = false
  if (isFirstHalfLeave && r.checkIn) {
    const inM = parseTimeToMinutes(r.checkIn)
    const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660 // default 11:00 AM
    const endM = attendanceRules?.workEndTime ? parseTimeToMinutes(attendanceRules.workEndTime) : 1200 // default 08:00 PM
    const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0
      ? Number(attendanceRules.gracePeriodMinutes)
      : 30
    const midShiftM = startM + Math.round((endM - startM) / 2) // 03:30 PM (930)
    if (inM !== null && inM <= (midShiftM + grace)) {
      isFirstHalfOnTimeArrival = true
    }
  }

  const isHalfDayOnTime = occ === 'half_day_leave_on_time' || isFirstHalfOnTimeArrival || (isFirstHalfLeave && (r.isLate === false || r.status === 'half-day' || !r.isLate))
  const isHalfDayCheckout = occ === 'half_day_leave_checkout' || (isSecondHalfLeave && !r.isEarlyLogout)

  // DYNAMIC CHECK: Evaluate punch-in against active shift rules
  let isPunchLate = isHalfDayOnTime ? false : Boolean(r.isLate || r.status === 'late')
  let isPunchHalfDay = Boolean(r.isHalfDay || r.status === 'half-day' || isApprovedHalfDay)
  if (r.checkIn && !isFirstHalfLeave) {
    const checkInM = parseTimeToMinutes(r.checkIn)
    const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660 // default 11:00 AM
    const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0
      ? Number(attendanceRules.gracePeriodMinutes)
      : 30
    if (checkInM !== null && startM !== null) {
      isPunchLate = checkInM > (startM + grace)
      // When punch-in is 1 hour (60 mins) or more late -> marked as Half Day upon checkout!
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

  // If employee has checked out, status is determined by worked duration or approved leave
  if (hasCheckedOut && workedHours !== null) {
    // If on approved half-day leave and completed required half-shift (worked >= 3.5 hrs or on-time half-day checkout):
    if (isApprovedHalfDay || isHalfDayCheckout) {
      if (workedHours >= 3.5 || isHalfDayCheckout) {
        return { label: '1/2 Day (Approved)', tone: 'info' }
      }
      return { label: 'Absent', tone: 'danger' }
    }

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

  // If employee is actively working (punch-in recorded, no checkout yet)
  if (r.checkIn) {
    // If on approved half-day leave:
    if (isApprovedHalfDay) {
      if (isPunchLate && !isHalfDayOnTime) {
        return { label: 'Late (2nd Half)', tone: 'warning' }
      }
      return { label: 'Present (1/2 Day Leave)', tone: 'info' }
    }

    // Active regular punch-in (before checkout):
    // An actively working employee is PRESENT! If they arrived late (even >60m), label them 'Late' (not 'Half Day' while actively working!)
    if (isPunchLate) {
      return { label: 'Late', tone: 'warning' }
    }
    return { label: 'On-Time', tone: 'info' }
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
export function getLateCountInfo(r, allAttendance = [], targetDate = '', attendanceRules = null, allLeaves = []) {
  if (!r) return { count: 0, lopDays: 0, lateCount: 0, earlyLogoutCount: 0, isLate: false, isEarlyLogout: false }
  const empCode = String(r.employeeId || '').toUpperCase()
  const dateStr = r.date || targetDate || ''
  const monthPrefix = dateStr.slice(0, 7)

  const resolveLeaveForRec = (record) => {
    if (record?.approvedLeave) return record.approvedLeave
    if (!Array.isArray(allLeaves) || allLeaves.length === 0 || !record?.employeeId) return null
    const code = String(record.employeeId).toUpperCase()
    const recDate = record.date || targetDate || ''
    const matched = allLeaves.find((l) => {
      if (l.status !== 'approved') return false
      const lEmpCode = String(l.employeeCode || l.employeeId?.employeeId || l.employeeId?._id || l.employeeId || '').toUpperCase()
      const lEmpName = String(l.employeeName || l.employeeId?.name || '').toUpperCase()
      const rEmpName = String(record.employeeName || '').toUpperCase()
      const isEmpMatch = (lEmpCode && lEmpCode === code) || (lEmpName && rEmpName && (lEmpName === rEmpName || lEmpName.includes(rEmpName) || rEmpName.includes(lEmpName)))
      if (!isEmpMatch) return false
      const s = typeof l.startDate === 'string' ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10)
      const e = typeof l.endDate === 'string' ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10)
      const inRange = recDate >= s && recDate <= e
      const inBreakdown = Array.isArray(l.dayBreakdown) && l.dayBreakdown.some((d) => d.date === recDate)
      return inRange || inBreakdown
    })
    if (matched) {
      return {
        id: matched.id || matched._id,
        leaveType: matched.leaveType,
        isHalfDay: Boolean(matched.isHalfDay || matched.units === 0.5 || matched.days === 0.5),
        halfDayPeriod: matched.halfDayPeriod || (matched.isHalfDay ? 'first_half' : null),
        isPaid: matched.paidUnits > 0 || (matched.leaveType !== 'lop' && matched.leaveType !== 'double_lop'),
      }
    }
    return null
  }

  // Dynamically test if a record is late under active shift rules
  const isRecordLate = (record) => {
    const recLeave = resolveLeaveForRec(record)
    const occ = record.policyEvaluation?.occurrence || record.policyEvaluation?.punch?.occurrence || record.occurrence
    const isFirstHalf = record.halfDayPeriod === 'first_half' || recLeave?.halfDayPeriod === 'first_half'
    const isHalfDayOnTime = occ === 'half_day_leave_on_time' || (isFirstHalf && !record.isLate)
    if (isHalfDayOnTime) return false

    if (isFirstHalf) {
      // Arriving for 2nd half on 1st-half leave: check arrival against mid-shift
      if (record.checkIn) {
        const inM = parseTimeToMinutes(record.checkIn)
        const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660 // default 11:00 AM
        const endM = attendanceRules?.workEndTime ? parseTimeToMinutes(attendanceRules.workEndTime) : 1200 // default 08:00 PM
        const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0
          ? Number(attendanceRules.gracePeriodMinutes)
          : 30
        const midShiftM = startM + Math.round((endM - startM) / 2) // e.g. 11:00 AM to 08:00 PM -> 03:30 PM (930)
        if (inM !== null && inM <= (midShiftM + grace)) {
          return false // On time for 2nd half!
        }
      }
      return Boolean(record.isLate)
    }

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
    const recLeave = resolveLeaveForRec(record)
    const occ = record.policyEvaluation?.occurrence || record.policyEvaluation?.checkout?.occurrence || record.occurrence
    const isSecondHalf = record.halfDayPeriod === 'second_half' || recLeave?.halfDayPeriod === 'second_half'
    const isHalfDayCheckout = occ === 'half_day_leave_checkout' || (isSecondHalf && !record.isEarlyLogout)
    if (isHalfDayCheckout) return false

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
