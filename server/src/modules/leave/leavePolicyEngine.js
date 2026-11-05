/**
 * Centralized Leave Policy Evaluation Service
 * Evaluates requested leave dates against working day calendars, paid leave balances (CL/SL),
 * and the 25th+ Month-End Double LOP policy.
 *
 * Rules:
 * 1. FIRST PRIORITY: Use available eligible paid leave balances (CL, SL).
 * 2. SECOND PRIORITY: If eligible paid leave balances are exhausted, remaining days become unpaid LOP.
 * 3. THIRD PRIORITY: If unpaid leave dates fall on or after the 25th of the month, classify those unpaid dates as DOUBLE LOP (25th+).
 * 4. FOURTH PRIORITY: Qualifying Double LOP requests require mandatory Admin final sign-off.
 * 5. Paid leave dates NEVER qualify as Double LOP.
 * 6. Normal LOP before the 25th follows standard Manager/HR approval (does NOT enter Admin queue).
 */

export function dateKey(date) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function isInternEmployee(employee) {
  if (!employee) return false
  const type = String(employee?.employmentType || '').toLowerCase().replace(/[-\s]/g, '_')
  const desig = String(employee?.designation || '').toLowerCase()
  const role = String(employee?.role || '').toLowerCase()
  return type === 'intern' || desig.includes('intern') || role.includes('intern')
}

export function getMonthlyDefaultAllowance(employee, leaveType) {
  const intern = isInternEmployee(employee)
  const type = String(leaveType || '').toLowerCase()
  if (intern) {
    // Intern: 1 sick leave per month, 0 casual
    return type === 'sick' ? 1 : 0
  }
  // Full-timer: 1 casual, 1 sick per month
  return (type === 'casual' || type === 'sick') ? 1 : 0
}

export function evaluateLeaveRequest({
  startDate,
  endDate,
  requestedLeaveType = 'casual',
  isHalfDay = false,
  halfDayPeriod = null,
  policy = null,
  availableBalances = {},
  holidayDates = [],
  companySettings = {},
  employee = {},
} = {}) {
  const s = new Date(startDate)
  s.setUTCHours(0, 0, 0, 0)
  const e = new Date(endDate || startDate)
  e.setUTCHours(0, 0, 0, 0)

  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    throw Object.assign(new Error('Invalid start or end date for leave evaluation.'), {
      statusCode: 400,
      code: 'INVALID_LEAVE_DATES',
    })
  }

  if (e < s) {
    throw Object.assign(new Error('End date must be on or after start date.'), {
      statusCode: 400,
      code: 'INVALID_LEAVE_RANGE',
    })
  }

  const holidayKeys = new Set((holidayDates || []).map((h) => (typeof h === 'string' ? h.slice(0, 10) : dateKey(h))))
  const countWeekends = Boolean(policy?.countWeekends)
  const countHolidays = Boolean(policy?.countHolidays)

  const leaveRules = companySettings?.leavePolicies || {}
  const cutoffDay = Number(leaveRules.monthEndCutoffDay) || 25
  const doubleLopMultiplier = Number(leaveRules.doubleLopMultiplier) || 2.0
  const autoConsumePaid = leaveRules.autoConsumePaidLeaveFirst !== false

  // Working day generation
  const workingDays = []
  for (const cur = new Date(s); cur <= e; cur.setUTCDate(cur.getUTCDate() + 1)) {
    const curCopy = new Date(cur)
    const dayOfWeek = curCopy.getUTCDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const curKey = dateKey(curCopy)
    const isHoliday = holidayKeys.has(curKey)

    const isWorkingDay = (!isWeekend || countWeekends) && (!isHoliday || countHolidays)
    if (isWorkingDay) {
      workingDays.push({
        date: curKey,
        dateObj: curCopy,
        dayOfWeek,
        dayOfMonth: curCopy.getUTCDate(),
        isWorkingDay: true,
        unit: isHalfDay ? 0.5 : 1.0,
      })
    }
  }

  if (workingDays.length === 0) {
    throw Object.assign(new Error('The selected range contains no payable or working leave units under company policy.'), {
      statusCode: 400,
      code: 'INVALID_LEAVE_RANGE',
    })
  }

  // Determine available paid balances (authoritative)
  let remCasual = Math.max(0, Number(availableBalances.casual || 0))
  let remSick = Math.max(0, Number(availableBalances.sick || 0))
  const requestedType = String(requestedLeaveType || 'casual').toLowerCase().trim()
  const isGenericPaid = !['casual', 'sick', 'lop', 'double_lop', 'unpaid'].includes(requestedType)
  let remGeneric = isGenericPaid ? Math.max(0, Number(availableBalances[requestedType] || 0)) : 0

  // Determine consumption priority
  let consumptionOrder = ['casual', 'sick']
  if (requestedType === 'sick') {
    consumptionOrder = ['sick', 'casual']
  } else if (Array.isArray(leaveRules.paidLeaveConsumptionPriority) && leaveRules.paidLeaveConsumptionPriority.length > 0) {
    consumptionOrder = leaveRules.paidLeaveConsumptionPriority.map((p) => String(p).toLowerCase().trim())
  }

  // If user requested a specific type and did not allow cross-type, or if autoConsumePaid is true
  const dayBreakdown = []
  let casualUnits = 0
  let sickUnits = 0
  let genericPaidUnits = 0
  let normalLopUnits = 0
  let doubleLopUnits = 0

  for (const day of workingDays) {
    const unit = day.unit
    let allocatedCategory = null
    let isPaid = false
    let isDoubleLop = false
    let deductionMultiplier = 0

    // Priority 1: Check if paid leave is eligible and available
    if (remGeneric >= unit) {
      remGeneric -= unit
      allocatedCategory = requestedType
      isPaid = true
      genericPaidUnits += unit
    } else if (autoConsumePaid || requestedType === 'casual' || requestedType === 'sick') {
      for (const pType of consumptionOrder) {
        if (pType === 'casual' && remCasual >= unit) {
          remCasual -= unit
          allocatedCategory = 'casual'
          isPaid = true
          casualUnits += unit
          break
        } else if (pType === 'sick' && remSick >= unit) {
          remSick -= unit
          allocatedCategory = 'sick'
          isPaid = true
          sickUnits += unit
          break
        }
      }
    }

    // Priority 2 & 3: If not covered by paid leave, classify as unpaid LOP
    if (!allocatedCategory) {
      isPaid = false
      if (day.dayOfMonth >= cutoffDay) {
        // Priority 3: On or after cutoff (25th+) -> DOUBLE LOP
        allocatedCategory = 'double_lop'
        isDoubleLop = true
        doubleLopUnits += unit
        deductionMultiplier = doubleLopMultiplier
      } else {
        // Normal LOP (< 25th)
        allocatedCategory = 'normal_lop'
        isDoubleLop = false
        normalLopUnits += unit
        deductionMultiplier = 1.0
      }
    }

    dayBreakdown.push({
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      dayOfMonth: day.dayOfMonth,
      isWorkingDay: true,
      leaveCategory: allocatedCategory,
      isPaid,
      isDoubleLop,
      units: unit,
      deductionMultiplier,
    })
  }

  const totalUnits = isHalfDay ? 0.5 : workingDays.length
  const paidUnits = casualUnits + sickUnits + genericPaidUnits
  const unpaidUnits = normalLopUnits + doubleLopUnits
  const hasDoubleLop = doubleLopUnits > 0
  const requiresAdminSignoff = hasDoubleLop

  // Determine required workflow stages
  let requiredWorkflow = 'manager_hr'
  if (requiresAdminSignoff) {
    requiredWorkflow = 'manager_hr_admin'
  } else if (isInternEmployee(employee) && paidUnits === 0 && normalLopUnits === 0) {
    requiredWorkflow = 'manager_hr'
  }

  // Primary effective category for display
  let primaryLeaveType = requestedType
  if (paidUnits === totalUnits) {
    if (genericPaidUnits > 0) primaryLeaveType = requestedType
    else primaryLeaveType = casualUnits >= sickUnits ? 'casual' : 'sick'
  } else if (paidUnits > 0 && unpaidUnits > 0) {
    primaryLeaveType = hasDoubleLop ? 'mixed_double_lop' : 'mixed_lop'
  } else if (unpaidUnits === totalUnits) {
    primaryLeaveType = hasDoubleLop && normalLopUnits === 0 ? 'double_lop' : (hasDoubleLop ? 'mixed_lop' : 'lop')
  }

  return {
    startDate: s,
    endDate: e,
    workingDaysCount: workingDays.length,
    totalUnits,
    paidUnits,
    casualUnits,
    sickUnits,
    genericPaidUnits,
    unpaidUnits,
    normalLopUnits,
    doubleLopUnits,
    isDoubleLop: hasDoubleLop,
    doubleLopDays: doubleLopUnits,
    requiresAdminSignoff,
    requiredWorkflow,
    primaryLeaveType,
    dayBreakdown,
    policySnapshot: {
      cutoffDay,
      doubleLopMultiplier,
      autoConsumePaid,
      evaluatedAt: new Date().toISOString(),
      availableBalancesAtEvaluation: { casual: availableBalances.casual || 0, sick: availableBalances.sick || 0 },
    },
    summaryText: `Requested ${totalUnits} working day(s): ${casualUnits > 0 ? `${casualUnits}d CL, ` : ''}${sickUnits > 0 ? `${sickUnits}d SL, ` : ''}${normalLopUnits > 0 ? `${normalLopUnits}d Normal LOP, ` : ''}${doubleLopUnits > 0 ? `${doubleLopUnits}d Double LOP (25th+)` : ''}`.replace(/,\s*$/, ''),
  }
}
