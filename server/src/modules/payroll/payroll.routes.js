import express from 'express'
import mongoose from 'mongoose'
import { Employee } from '../../models/Employee.js'
import { PayrollRecord } from '../../models/PayrollRecord.js'
import { AttendanceRecord } from '../../models/AttendanceRecord.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { CompanySettings } from '../../models/CompanySettings.js'
import { ensureConnected } from '../leave/leave.repository.js'
import { hasPermission } from '../../auth/permissions.js'
import { numberToWordsINR } from '../../utils/numberToWords.js'
import {
  getCompanySettings,
  normalizePayrollData,
  generatePayslipHtml,
  DEFAULT_COMPANY_SETTINGS,
} from '../../services/payslip.service.js'
import { generatePayslipPdf } from '../../services/pdf.service.js'
import { sendPayslipEmail } from '../../services/mail.service.js'

function invalid(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode, code: 'PAYROLL_VALIDATION_ERROR' })
}

export function payrollPeriod(month) {
  const clean = String(month ?? '').trim().replace(/\s+/g, ' ')
  
  // Format 1: YYYY-MM
  const yyyymm = /^(\d{4})-(\d{1,2})$/.exec(clean)
  if (yyyymm) {
    const year = Number(yyyymm[1])
    const monthNum = Number(yyyymm[2]) - 1
    const start = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0))
    const end = new Date(Date.UTC(year, monthNum + 1, 0, 23, 59, 59, 999))
    const monthName = start.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
    return {
      start,
      end,
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
      monthName: `${monthName} ${year}`,
    }
  }

  // Format 2: Full Month Name YYYY (e.g. November 2026) or Short Month (e.g. Nov 2026)
  const monthRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})$/i
  const match = monthRegex.exec(clean)
  if (match) {
    const rawMonth = match[1].toLowerCase()
    const year = match[2]
    const dateParsed = new Date(`${rawMonth} 1, ${year} 00:00:00 UTC`)
    if (!isNaN(dateParsed.getTime())) {
      const monthName = dateParsed.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
      const start = new Date(Date.UTC(dateParsed.getUTCFullYear(), dateParsed.getUTCMonth(), 1, 0, 0, 0))
      const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59, 999))
      return {
        start,
        end,
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10),
        monthName: `${monthName} ${year}`,
      }
    }
  }

  // Fallback: Default to current UTC month rather than failing with 400
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  const monthName = start.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
  return {
    start,
    end,
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
    monthName: `${monthName} ${now.getUTCFullYear()}`,
  }
}

export function validatePayroll(body) {
  payrollPeriod(body.month)
  const workingDays = Math.max(0, Math.min(31, Number(body.workingDays ?? body.standardDays ?? 30)))
  let lopDays = body.lopDays !== undefined
    ? Number(body.lopDays)
    : (body.paidDays !== undefined || body.payableDays !== undefined
      ? Math.max(0, workingDays - Number(body.paidDays ?? body.payableDays))
      : 0)
  let paidDays = body.paidDays !== undefined || body.payableDays !== undefined
    ? Number(body.paidDays ?? body.payableDays)
    : Math.max(0, workingDays - lopDays)

  if (!Number.isFinite(paidDays) || paidDays < 0 || paidDays > 31) throw invalid('Invalid paidDays amount.')
  if (!Number.isFinite(lopDays) || lopDays < 0 || lopDays > 31) throw invalid('Invalid lopDays amount.')
  // Ensure paidDays and lopDays sum up cleanly to workingDays without throwing
  if (paidDays + lopDays !== workingDays) {
    paidDays = Math.max(0, workingDays - lopDays)
  }

  const earningsKeys = ['basic', 'hra', 'specialAllowance', 'conveyance', 'medicalAllowance', 'performanceBonus', 'overtime', 'otherAllowance', 'otherAllowances']
  const deductionKeys = ['pf', 'esi', 'professionalTax', 'tdsTax', 'loanAdvance', 'lossOfPay', 'performanceDeduction', 'otherDeductions']

  function amounts(values, keys) {
    const result = {}
    keys.forEach((k) => { result[k] = 0 })
    if (!values || typeof values !== 'object' || Array.isArray(values)) return result
    for (const [key, rawAmount] of Object.entries(values)) {
      const amount = Number(rawAmount)
      if (!keys.includes(key) || !Number.isFinite(amount) || amount < 0 || amount > 100000000 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.01) {
        throw invalid(`Invalid monetary amount for ${key}.`)
      }
      result[key] = Math.round(amount * 100) / 100
    }
    // Prevent double-counting of otherAllowance / otherAllowances alias
    if (result.otherAllowances !== undefined && result.otherAllowance === undefined) {
      result.otherAllowance = result.otherAllowances
      delete result.otherAllowances
    } else if (result.otherAllowances !== undefined && result.otherAllowance !== undefined) {
      delete result.otherAllowances
    }
    return result
  }

  let earnings = {}
  let deductions = {}

  // Support dynamic earningsList / deductionsList if passed
  let earningsList = []
  let deductionsList = []

  if (Array.isArray(body.earningsList) && body.earningsList.length > 0) {
    earningsList = body.earningsList.map((item) => ({
      name: String(item.name || '').trim(),
      monthlyRate: Math.max(0, Number(item.monthlyRate) || 0),
      currentMonth: Math.max(0, Number(item.currentMonth) || 0),
      arrear: Number(item.arrear) || 0,
      total: Math.max(0, Number(item.total) || ((Number(item.currentMonth) || 0) + (Number(item.arrear) || 0))),
    })).filter((item) => item.name)

    // Sync to legacy earnings object for backward compatibility
    earningsKeys.forEach((key) => { earnings[key] = 0 })
    earningsList.forEach((item) => {
      const lower = item.name.toLowerCase()
      if (lower.includes('basic')) earnings.basic = (earnings.basic || 0) + item.total
      else if (lower.includes('hra') || lower.includes('house rent')) earnings.hra = (earnings.hra || 0) + item.total
      else if (lower.includes('conveyance')) earnings.conveyance = (earnings.conveyance || 0) + item.total
      else if (lower.includes('special')) earnings.specialAllowance = (earnings.specialAllowance || 0) + item.total
      else if (lower.includes('medical')) earnings.medicalAllowance = (earnings.medicalAllowance || 0) + item.total
      else if (lower.includes('bonus')) earnings.performanceBonus = (earnings.performanceBonus || 0) + item.total
      else if (lower.includes('overtime')) earnings.overtime = (earnings.overtime || 0) + item.total
      else if (lower.includes('other')) {
        earnings.otherAllowance = (earnings.otherAllowance || 0) + item.total
        earnings.otherAllowances = (earnings.otherAllowances || 0) + item.total
      }
      else earnings.specialAllowance = (earnings.specialAllowance || 0) + item.total
    })
  } else {
    earnings = amounts(body.earnings, earningsKeys)
    const map = [
      { key: 'basic', label: 'BASIC' },
      { key: 'hra', label: 'HOUSE RENT ALLOWANCE (HRA)' },
      { key: 'conveyance', label: 'CONVEYANCE ALLOWANCE' },
      { key: 'otherAllowance', label: 'OTHER ALLOWANCE' },
      { key: 'specialAllowance', label: 'SPECIAL ALLOWANCE' },
      { key: 'medicalAllowance', label: 'MEDICAL ALLOWANCE' },
      { key: 'performanceBonus', label: 'BONUS' },
      { key: 'overtime', label: 'OVERTIME' },
    ]
    earningsList = map
      .filter((m) => (earnings[m.key] || 0) > 0 || ['basic', 'hra'].includes(m.key))
      .map((m) => ({
        name: m.label,
        monthlyRate: earnings[m.key] || 0,
        currentMonth: earnings[m.key] || 0,
        arrear: 0,
        total: earnings[m.key] || 0,
      }))
  }

  if (Array.isArray(body.deductionsList) && body.deductionsList.length > 0) {
    deductionsList = body.deductionsList.map((item) => ({
      name: String(item.name || '').trim(),
      amount: Math.max(0, Number(item.amount) || 0),
    })).filter((item) => item.name)

    // Sync to legacy deductions object
    deductionKeys.forEach((key) => { deductions[key] = 0 })
    deductionsList.forEach((item) => {
      const lower = item.name.toLowerCase()
      if (lower.includes('pf') || lower.includes('provident')) deductions.pf = (deductions.pf || 0) + item.amount
      else if (lower.includes('prof') || lower.includes('pt')) deductions.professionalTax = (deductions.professionalTax || 0) + item.amount
      else if (lower.includes('esi')) deductions.esi = (deductions.esi || 0) + item.amount
      else if (lower.includes('tds') || lower.includes('tax')) deductions.tdsTax = (deductions.tdsTax || 0) + item.amount
      else if (lower.includes('loan') || lower.includes('advance')) deductions.loanAdvance = (deductions.loanAdvance || 0) + item.amount
      else if (lower.includes('lop') || lower.includes('loss of pay')) deductions.lossOfPay = (deductions.lossOfPay || 0) + item.amount
      else deductions.otherDeductions = (deductions.otherDeductions || 0) + item.amount
    })
  } else {
    deductions = amounts(body.deductions, deductionKeys)
    const dMap = [
      { key: 'pf', label: 'P.F.' },
      { key: 'professionalTax', label: 'PROFESSIONAL TAX' },
      { key: 'esi', label: 'ESI' },
      { key: 'tdsTax', label: 'TDS' },
      { key: 'loanAdvance', label: 'LOAN DEDUCTION' },
      { key: 'lossOfPay', label: 'LOSS OF PAY' },
      { key: 'performanceDeduction', label: 'PERFORMANCE DEDUCTION' },
      { key: 'otherDeductions', label: 'OTHER DEDUCTION' },
    ]
    deductionsList = dMap
      .filter((m) => (deductions[m.key] || 0) > 0)
      .map((m) => ({ name: m.label, amount: deductions[m.key] || 0 }))
  }

  const grossEarnings = Object.values(earnings).reduce((a, b) => a + b, 0)
  let totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)

  if (totalDeductions > grossEarnings) {
    if (deductions.lossOfPay && deductions.lossOfPay > 0) {
      const otherDeds = totalDeductions - deductions.lossOfPay
      deductions.lossOfPay = Math.max(0, grossEarnings - otherDeds)
      totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)
    } else {
      throw invalid('Deductions cannot exceed gross earnings.')
    }
  }

  const netPay = Math.max(0, grossEarnings - totalDeductions)
  const netPayInWords = numberToWordsINR(netPay)

  return {
    month: body.month,
    workingDays,
    paidDays,
    lopDays,
    standardDays: body.standardDays ?? workingDays,
    payableDays: body.payableDays ?? paidDays,
    lopReversalDays: body.lopReversalDays ?? 0,
    arrearDays: body.arrearDays ?? 0,
    earnings,
    deductions,
    earningsList,
    deductionsList,
    grossEarnings,
    totalDeductions,
    netPay,
    netPayInWords,
    notes: body.notes,
  }
}

export function calculateAttendanceLopContext({ attendance = [], leave = [], period = {} }) {
  const countedDates = new Set()
  let totalLopDays = 0

  // 1. Process attendance records (Only genuine unpaid LOP / Double LOP records generate deductions)
  for (const record of attendance) {
    const dateStr = record.date
    const dayOfMonth = Number(String(dateStr || '').split('-')[2]) || 1
    const isLopRecord = record.status === 'lop' || record.isLop || record.status === 'absent'
    const isHalfDayRecord = record.status === 'half-day' || record.isHalfDay
    const isExplicitDoubleLop = Boolean(record.isDoubleLop || record.doubleLopStatus === 'approved')
    const isMonthEndDoubleLop = isExplicitDoubleLop || (dayOfMonth >= 25 && isLopRecord)

    if (isLopRecord) {
      totalLopDays += isMonthEndDoubleLop ? 2 : 1
      countedDates.add(dateStr)
    } else if (isHalfDayRecord) {
      // Check if this half-day is covered by an approved PAID leave (e.g. casual or sick leave)
      const isPaidHalfDayLeave = leave.some((req) => {
        if (req.status !== 'approved' || !req.isHalfDay) return false
        if (Array.isArray(req.dayBreakdown) && req.dayBreakdown.length > 0) {
          return req.dayBreakdown.some((d) => d.date === dateStr && d.isPaid)
        }
        return req.paidUnits > 0 || (req.leaveType !== 'lop' && req.leaveType !== 'double_lop')
      })

      if (!isPaidHalfDayLeave) {
        totalLopDays += 0.5
      }
      countedDates.add(dateStr)
    } else if (record.status === 'on-leave' && isExplicitDoubleLop) {
      totalLopDays += 2
      countedDates.add(dateStr)
    }
  }

  // 2. Process approved leave requests:
  // Only approved unpaid LOP / Double LOP days generate deductions. Paid leaves (CL/SL) have ZERO deduction!
  for (const req of leave) {
    if (req.status !== 'approved') continue

    if (Array.isArray(req.dayBreakdown) && req.dayBreakdown.length > 0) {
      for (const day of req.dayBreakdown) {
        if (!day.isWorkingDay || day.isPaid) continue // Paid CL/SL has 0 deduction!
        const curDateStr = day.date
        if (period.from && period.to && (curDateStr < period.from || curDateStr > period.to)) continue
        if (countedDates.has(curDateStr)) continue

        const multiplier = day.isDoubleLop || day.leaveCategory === 'double_lop' ? 2 : 1
        totalLopDays += (day.units || 1) * multiplier
        countedDates.add(curDateStr)
      }
    } else {
      const isLopType = String(req.leaveType).toLowerCase() === 'lop' || String(req.leaveType).toLowerCase() === 'double_lop'
      // If it was a paid leave (casual or sick) and NOT flagged as Double LOP, ZERO deduction!
      if (!isLopType && !req.isDoubleLop && (!req.doubleLopDays || req.doubleLopDays === 0)) {
        continue
      }

      const pStart = period.start ? period.start.getTime() : new Date(req.startDate).getTime()
      const pEnd = period.end ? period.end.getTime() : new Date(req.endDate).getTime()
      const start = new Date(Math.max(new Date(req.startDate).getTime(), pStart))
      const end = new Date(Math.min(new Date(req.endDate).getTime(), pEnd))
      for (const cur = new Date(start); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
        const curDateStr = cur.toISOString().slice(0, 10)
        if (countedDates.has(curDateStr)) continue

        const dayOfMonth = cur.getUTCDate()
        if (dayOfMonth >= 25 || req.isDoubleLop) {
          totalLopDays += 2
          countedDates.add(curDateStr)
        } else if (isLopType) {
          totalLopDays += 1
          countedDates.add(curDateStr)
        }
      }
    }
  }

  return { totalLopDays, countedDates }
}

async function context(employee, month) {
  try {
    const period = payrollPeriod(month)
    const empId = employee?.employeeId ? String(employee.employeeId).toUpperCase() : null
    const empObjectId = employee?._id && mongoose.isValidObjectId(employee._id) ? employee._id : null
    const empCode = employee?.code ? String(employee.code).toUpperCase() : null
    const empAltId = employee?.id ? String(employee.id) : null

    const attendanceMatches = []
    if (empId) attendanceMatches.push({ employeeId: empId }, { employeeId: employee.employeeId })
    if (empCode && empCode !== empId) attendanceMatches.push({ employeeId: empCode })
    if (empObjectId) attendanceMatches.push({ employeeRef: empObjectId }, { employeeId: String(empObjectId) })
    if (empAltId && empAltId !== String(empObjectId)) attendanceMatches.push({ employeeId: empAltId })

    const leaveMatches = []
    if (empObjectId) leaveMatches.push({ employeeId: empObjectId }, { employeeRef: empObjectId })
    if (empId) leaveMatches.push({ employeeId: empId })
    if (empAltId && empAltId !== String(empObjectId)) leaveMatches.push({ employeeId: empAltId })

    const [attendance, leave] = await Promise.all([
      attendanceMatches.length ? AttendanceRecord.find({ $or: attendanceMatches, date: { $gte: period.from, $lte: period.to } }).lean() : [],
      leaveMatches.length ? LeaveRequest.find({ $or: leaveMatches, status: 'approved', startDate: { $lte: period.end }, endDate: { $gte: period.start } }).lean() : [],
    ])

    const { totalLopDays: leaveAndAttendanceLop, countedDates } = calculateAttendanceLopContext({ attendance, leave, period })
    let totalLopDays = leaveAndAttendanceLop

    // 3. Process combined late logins & early logouts LOP:
    // Rule: Every 3 infractions (late login or early logout, combined) = 0.5 LOP day
    // Half-day leave arrivals and checkouts are NOT infractions!
    const lateLoginsCount = attendance.filter((r) => {
      const isHalfDayOnTime = r.policyEvaluation?.occurrence === 'half_day_leave_on_time' || (r.approvedLeave?.halfDayPeriod === 'first_half' && !r.isLate)
      return !isHalfDayOnTime && (r.isLate || r.status === 'late')
    }).length
    const earlyLogoutDays = attendance.filter((r) => {
      const isHalfDayCheckout = r.policyEvaluation?.occurrence === 'half_day_leave_checkout' || (r.approvedLeave?.halfDayPeriod === 'second_half' && !r.isEarlyLogout)
      return !isHalfDayCheckout && (r.isEarlyLogout || r.status === 'early-logout')
    }).length
    const combinedInfractions = lateLoginsCount + earlyLogoutDays
    const lateEarlyLopDays = Math.floor(combinedInfractions / 3) * 0.5
    totalLopDays += lateEarlyLopDays

    // 4. Missing working days: if an employee has NO punch-in and NO approved leave on a working day
    // (excluding future dates and weekends), that day is ABSENT!
    const todayStr = new Date().toISOString().slice(0, 10)
    const effectiveTo = period.to < todayStr ? period.to : todayStr
    let missingAbsentDays = 0

    const curDate = new Date(`${period.from}T00:00:00.000Z`)
    const maxDate = new Date(`${effectiveTo}T00:00:00.000Z`)
    while (curDate <= maxDate) {
      const dStr = curDate.toISOString().slice(0, 10)
      const dayOfWeek = curDate.getUTCDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !countedDates.has(dStr)) {
        const hasLeave = leave.some((req) => {
          if (req.status !== 'approved') return false
          const s = typeof req.startDate === 'string' ? req.startDate.slice(0, 10) : new Date(req.startDate).toISOString().slice(0, 10)
          const e = typeof req.endDate === 'string' ? req.endDate.slice(0, 10) : new Date(req.endDate).toISOString().slice(0, 10)
          return dStr >= s && dStr <= e
        })
        if (!hasLeave) {
          const dayOfMonth = curDate.getUTCDate()
          const isMonthEndDoubleLop = dayOfMonth >= 25
          totalLopDays += isMonthEndDoubleLop ? 2 : 1
          missingAbsentDays++
          countedDates.add(dStr)
        }
      }
      curDate.setUTCDate(curDate.getUTCDate() + 1)
    }

    return {
      attendanceDays: attendance.length,
      absentDays: attendance.filter((record) => record.status === 'absent').length + missingAbsentDays,
      halfDays: attendance.filter((record) => record.status === 'half-day').length,
      lateCount: lateLoginsCount,
      earlyLogoutDays,
      combinedInfractions,
      lateLopDays: lateEarlyLopDays,
      lateEarlyLopDays,
      lopDays: totalLopDays,
      approvedLeave: leave.map(({ leaveType, startDate, endDate, units, isDoubleLop, doubleLopDays }) => ({
        leaveType,
        startDate,
        endDate,
        units,
        isDoubleLop,
        doubleLopDays,
      })),
    }
  } catch {
    return {
      attendanceDays: 0,
      absentDays: 0,
      halfDays: 0,
      lopDays: 0,
      earlyLogoutDays: 0,
      approvedLeave: [],
    }
  }
}

export function createPayrollRouter({ auth }) {
  const router = express.Router()
  router.use(auth.authenticate)
  const isManagementRole = (user) => ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role)
  const management = (req, res, next) =>
    (isManagementRole(req.auth.user) || ['admin', 'hr'].includes(req.auth.user.role)) && hasPermission(req.auth.user, 'payroll.write')
      ? next()
      : next(invalid('Payroll management permission is required.', 403))

  // Settings: GET & PATCH
  router.get('/settings', async (req, res, next) => {
    try {
      ensureConnected()
      const settings = await getCompanySettings()
      res.json({ success: true, data: settings })
    } catch (error) { next(error) }
  })

  router.patch('/settings', management, async (req, res, next) => {
    try {
      ensureConnected()
      const allowed = [
        'companyName', 'companyLegalName', 'address', 'city', 'state', 'country', 'pincode',
        'phone', 'email', 'website', 'taxId', 'currency', 'currencySymbol', 'logoUrl',
        'primaryColor', 'secondaryColor', 'footerText', 'maskBankAccount', 'visibleFields',
        'defaultBranch', 'branchAddress', 'branchCity', 'branches', 'locations',
      ]
      const updates = {}
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key]
      }
      const updated = await CompanySettings.findOneAndUpdate(
        { key: 'primary' },
        { $set: updates },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
      ).lean()
      res.json({ success: true, data: updated })
    } catch (error) { next(error) }
  })

  router.get('/context', management, async (req, res, next) => {
    try {
      ensureConnected()
      const queryId = String(req.query.employeeId ?? req.query.id ?? '').trim()
      const emptyContext = {
        attendanceDays: 0,
        absentDays: 0,
        halfDays: 0,
        lateCount: 0,
        earlyLogoutDays: 0,
        combinedInfractions: 0,
        lateLopDays: 0,
        lateEarlyLopDays: 0,
        lopDays: 0,
        approvedLeave: [],
      }

      if (!queryId) {
        return res.json({ success: true, data: emptyContext })
      }

      const lookup = [
        { employeeId: queryId.toUpperCase() },
        { employeeId: queryId },
        { employeeCode: queryId },
        { code: queryId },
      ]
      if (mongoose.isValidObjectId(queryId)) {
        lookup.push({ _id: new mongoose.Types.ObjectId(queryId) })
      }

      const employee = await Employee.findOne({ $or: lookup }).lean()
      if (!employee) {
        return res.json({ success: true, data: emptyContext })
      }

      res.json({ success: true, data: await context(employee, req.query.month) })
    } catch (error) { next(error) }
  })

  // List all / filtered payslips
  router.get('/', async (req, res, next) => {
    try {
      const isManagement = isManagementRole(req.auth.user)
      if (!hasPermission(req.auth.user, isManagement ? 'payroll.read' : 'payroll.self.read')) {
        throw Object.assign(new Error('Payroll access is not permitted.'), { statusCode: 403, code: 'FORBIDDEN' })
      }
      ensureConnected()
      const settings = await getCompanySettings()
      let filter = {}
      if (!isManagement) {
        const lookup = []
        if (req.auth.user.employeeId) lookup.push({ employeeId: String(req.auth.user.employeeId).toUpperCase() })
        if (req.auth.user.email) lookup.push({ email: String(req.auth.user.email).toLowerCase() })
        if (mongoose.isValidObjectId(req.auth.user.id)) lookup.push({ _id: req.auth.user.id })
        if (mongoose.isValidObjectId(req.auth.user._id)) lookup.push({ _id: req.auth.user._id })

        let userEmp = null
        if (lookup.length > 0) {
          try {
            userEmp = await Employee.findOne({ $or: lookup }).lean()
          } catch (e) {
            console.error('Failed to lookup employee for payroll query:', e)
          }
        }

        const validObjectIds = [
          ...(mongoose.isValidObjectId(req.auth.user.id) ? [req.auth.user.id] : []),
          ...(mongoose.isValidObjectId(req.auth.user._id) ? [req.auth.user._id] : []),
          ...(userEmp?._id && mongoose.isValidObjectId(userEmp._id) ? [userEmp._id] : []),
        ]

        const codeIds = [
          ...(req.auth.user.employeeId ? [String(req.auth.user.employeeId).toUpperCase()] : []),
          ...(userEmp?.employeeId ? [String(userEmp.employeeId).toUpperCase()] : []),
          ...(req.auth.user.id ? [String(req.auth.user.id)] : []),
        ]

        const orClauses = []
        if (validObjectIds.length > 0) {
          orClauses.push({ employeeRef: { $in: validObjectIds } })
        }
        if (codeIds.length > 0) {
          orClauses.push({ employeeId: { $in: codeIds } })
        }
        if (orClauses.length === 0) {
          if (userEmp?.name) orClauses.push({ employeeName: userEmp.name })
          else if (req.auth.user.name) orClauses.push({ employeeName: req.auth.user.name })
        }

        filter = orClauses.length > 0 ? { $or: orClauses } : { employeeId: '__none__' }
      }
      if (req.query.month) {
        try {
          payrollPeriod(req.query.month)
          filter.month = req.query.month
        } catch {
          filter.month = req.query.month
        }
      }
      const records = await PayrollRecord.find(filter)
        .populate('employeeRef', 'name employeeId department designation location bankDetails identity joiningDate email')
        .sort({ createdAt: -1 })
        .lean()

      const data = await Promise.all(records.map(async (record) => {
        const emp = (record.employeeRef && typeof record.employeeRef === 'object') ? record.employeeRef : null
        let formatted = null
        try {
          formatted = normalizePayrollData(record, emp, settings)
        } catch (normErr) {
          console.error('Failed to normalize payroll record:', normErr)
        }

        let reviewContext = null
        if (isManagement && emp) {
          try {
            reviewContext = await context(emp, record.month)
          } catch {}
        }

        return {
          ...record,
          id: String(record._id),
          employeeName: emp?.name || record.employeeName || 'Employee',
          department: emp?.department || record.department,
          designation: emp?.designation || record.designation,
          location: emp?.location || record.location,
          ...(emp?.bankDetails || {}),
          formattedPayslip: formatted,
          ...(reviewContext ? { reviewContext } : {}),
        }
      }))
      res.json({ success: true, data })
    } catch (error) { next(error) }
  })

  // Helper to verify payslip ownership
  async function verifyPayslipAccess(record, authUser) {
    const isManagement = isManagementRole(authUser) && hasPermission(authUser, 'payroll.read')
    if (isManagement) return true

    let userEmp = null
    try {
      userEmp = await Employee.findOne({
        $or: [
          ...(authUser.employeeId ? [{ employeeId: String(authUser.employeeId).toUpperCase() }] : []),
          ...(authUser.email ? [{ email: authUser.email.toLowerCase() }] : []),
          ...(mongoose.isValidObjectId(authUser.id) ? [{ _id: authUser.id }] : [])
        ]
      }).lean()
    } catch {}

    const recEmpRefId = String(record.employeeRef?._id || record.employeeRef || '')
    const recEmpCode = String(record.employeeRef?.employeeId || record.employeeId || '').toUpperCase()
    const recEmail = String(record.employeeRef?.email || '').toLowerCase()
    const userEmail = String(authUser.email || '').toLowerCase()
    const userCode = String(authUser.employeeId || userEmp?.employeeId || '').toUpperCase()
    const userId = String(authUser.id || '')
    const userEmpObjId = userEmp?._id ? String(userEmp._id) : ''

    const isOwner =
      (recEmpRefId && (recEmpRefId === userId || recEmpRefId === userEmpObjId)) ||
      (recEmpCode && userCode && recEmpCode === userCode) ||
      (recEmail && userEmail && recEmail === userEmail) ||
      (userEmp?.email && recEmail && recEmail === userEmp.email.toLowerCase())

    if (!isOwner) {
      throw Object.assign(new Error('Access to this payslip is restricted.'), { statusCode: 403, code: 'FORBIDDEN' })
    }
    return true
  }

  // Single payslip details
  router.get('/:id', async (req, res, next) => {
    try {
      ensureConnected()
      const rawId = String(req.params.id || '').trim()
      const query = mongoose.isValidObjectId(rawId)
        ? PayrollRecord.findById(rawId)
        : PayrollRecord.findOne({ $or: [{ id: rawId }, { employeeId: rawId.toUpperCase() }] })
      const record = await query
        .populate('employeeRef', 'name employeeId department designation location bankDetails identity joiningDate email')
        .lean()
      if (!record) throw invalid('Payslip not found.', 404)

      await verifyPayslipAccess(record, req.auth.user)

      const settings = await getCompanySettings()
      const formatted = normalizePayrollData(record, record.employeeRef, settings)
      res.json({ success: true, data: { ...record, id: String(record._id), formattedPayslip: formatted } })
    } catch (error) { next(error) }
  })

  // Standalone HTML view for print / PDF preview
  router.get('/:id/html', async (req, res, next) => {
    try {
      ensureConnected()
      const rawId = String(req.params.id || '').trim()
      const query = mongoose.isValidObjectId(rawId)
        ? PayrollRecord.findById(rawId)
        : PayrollRecord.findOne({ $or: [{ id: rawId }, { employeeId: rawId.toUpperCase() }] })
      const record = await query
        .populate('employeeRef', 'name employeeId department designation location bankDetails identity joiningDate email')
        .lean()
      if (!record) throw invalid('Payslip not found.', 404)

      await verifyPayslipAccess(record, req.auth.user)

      const settings = await getCompanySettings()
      const formatted = normalizePayrollData(record, record.employeeRef, settings)
      const html = generatePayslipHtml(formatted)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send(html)
    } catch (error) { next(error) }
  })

  // PDF Download endpoint
  router.get('/:id/pdf', async (req, res, next) => {
    try {
      ensureConnected()
      const rawId = String(req.params.id || '').trim()
      const query = mongoose.isValidObjectId(rawId)
        ? PayrollRecord.findById(rawId)
        : PayrollRecord.findOne({ $or: [{ id: rawId }, { employeeId: rawId.toUpperCase() }] })
      const record = await query
        .populate('employeeRef', 'name employeeId department designation location bankDetails identity joiningDate email')
        .lean()
      if (!record) throw invalid('Payslip not found.', 404)

      await verifyPayslipAccess(record, req.auth.user)

      const settings = await getCompanySettings()
      const formatted = normalizePayrollData(record, record.employeeRef, settings)
      const result = await generatePayslipPdf(formatted)

      res.setHeader('Content-Type', result.contentType)
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
      res.send(result.buffer)
    } catch (error) { next(error) }
  })

  // Send / Dispatch Payslip via SMTP Email
  router.post('/:id/email', management, async (req, res, next) => {
    try {
      ensureConnected()
      const rawId = String(req.params.id || '').trim()
      const query = mongoose.isValidObjectId(rawId)
        ? PayrollRecord.findById(rawId)
        : PayrollRecord.findOne({ $or: [{ id: rawId }, { employeeId: rawId.toUpperCase() }] })
      const record = await query.populate('employeeRef', 'name employeeId email department designation location bankDetails identity joiningDate')
      if (!record) throw invalid('Payslip not found.', 404)

      const targetEmail = record.employeeRef?.email
      if (!targetEmail) {
        throw invalid('Employee record does not have a registered email address.', 400)
      }

      const settings = await getCompanySettings()
      const formatted = normalizePayrollData(record, record.employeeRef, settings)
      const pdfAttachment = await generatePayslipPdf(formatted).catch(() => null)

      const mailResult = await sendPayslipEmail({
        employee: record.employeeRef,
        record,
        month: record.month,
        settings,
        pdfAttachment,
      })

      record.emailSentAt = new Date()
      await record.save()

      res.json({
        success: true,
        data: {
          recipient: targetEmail,
          month: record.month,
          emailSentAt: record.emailSentAt,
          messageId: mailResult?.messageId,
          simulated: Boolean(mailResult?.simulated),
          message: mailResult?.simulated
            ? `Payslip email simulated for ${targetEmail} (SMTP credentials pending real app password in .env).`
            : `Official payslip document for ${record.month} emailed successfully to ${targetEmail}.`,
        },
      })
    } catch (error) { next(error) }
  })

  // Helper to email payslips to employees with generated PDF attachments
  async function dispatchPayslipEmails({ month, forceAll = false }) {
    const targetRecords = await PayrollRecord.find({ month, status: 'processed' })
      .populate('employeeRef', 'name employeeId email department designation location bankDetails identity joiningDate')

    if (targetRecords.length === 0) {
      return { total: 0, sentCount: 0, failedCount: 0, skippedCount: 0 }
    }

    const settings = await getCompanySettings()
    let sentCount = 0
    let failedCount = 0
    let skippedCount = 0

    const recordsToEmail = targetRecords.filter((record) => {
      if (!record.emailSentAt || forceAll) return true
      skippedCount++
      return false
    })

    const BATCH_SIZE = 5
    for (let i = 0; i < recordsToEmail.length; i += BATCH_SIZE) {
      const batch = recordsToEmail.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(async (record) => {
        let emp = record.employeeRef
        if (!emp || !emp.email) {
          emp = await Employee.findOne({
            $or: [
              { employeeId: record.employeeId },
              ...(mongoose.isValidObjectId(record.employeeRef) ? [{ _id: record.employeeRef }] : []),
            ],
          }).lean()
        }

        if (!emp?.email) {
          failedCount++
          return
        }

        try {
          const formatted = normalizePayrollData(record, emp, settings)
          const pdfAttachment = await generatePayslipPdf(formatted).catch((err) => {
            console.warn(`[PDF] Error rendering PDF for ${emp.email}:`, err?.message || err)
            return null
          })

          await sendPayslipEmail({
            employee: emp,
            record,
            month: record.month,
            settings,
            pdfAttachment,
          })

          record.emailSentAt = new Date()
          await record.save()
          sentCount++
        } catch (err) {
          console.warn(`[MailService] Failed to send payslip email to ${emp?.email}:`, err?.message || err)
          failedCount++
        }
      }))
    }

    return {
      total: targetRecords.length,
      sentCount,
      failedCount,
      skippedCount,
    }
  }

  // Bulk dispatch payslip emails for a period
  router.post('/send-bulk-email', management, async (req, res, next) => {
    try {
      ensureConnected()
      const { month } = req.body ?? {}
      const cleanMonth = String(month ?? '').trim().replace(/\s+/g, ' ')
      payrollPeriod(cleanMonth)
      const forceAll = req.body?.forceAll !== false

      const stats = await dispatchPayslipEmails({ month: cleanMonth, forceAll })
      if (stats.total === 0) {
        throw invalid(`No finalized payslips found for period ${cleanMonth}.`, 404)
      }

      res.json({
        success: true,
        data: {
          total: stats.total,
          sentCount: stats.sentCount,
          failedCount: stats.failedCount,
          skippedCount: stats.skippedCount,
          message: `Dispatched payslips to ${stats.sentCount} employee(s). ${stats.failedCount > 0 ? `${stats.failedCount} skipped or failed.` : ''} ${stats.skippedCount > 0 ? `(${stats.skippedCount} previously sent)` : ''}`.trim(),
        },
      })
    } catch (error) { next(error) }
  })

  // Update employee salary CTC profile
  router.patch('/profiles/:id', management, async (req, res, next) => {
    try {
      ensureConnected()
      if (!mongoose.isValidObjectId(req.params.id) || !Number.isFinite(req.body?.salary) || req.body.salary < 0) {
        throw invalid('Enter a valid employee and annual salary.')
      }
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        { $set: { salary: req.body.salary } },
        { returnDocument: 'after', runValidators: true },
      ).lean()
      if (!employee) throw invalid('Employee not found.', 404)
      res.json({ success: true, data: { salary: employee.salary } })
    } catch (error) { next(error) }
  })

  // Create / Update Payslip
  router.post('/', management, async (req, res, next) => {
    try {
      ensureConnected()
      const values = validatePayroll(req.body ?? {})
      const empIdRaw = String(req.body.employeeId ?? req.body.employeeRef ?? '').trim()
      const empQuery = []
      if (empIdRaw) {
        empQuery.push({ employeeId: empIdRaw.toUpperCase() })
        empQuery.push({ employeeId: empIdRaw })
        if (mongoose.isValidObjectId(empIdRaw)) {
          empQuery.push({ _id: empIdRaw })
        }
      }
      if (req.body.employeeRef && mongoose.isValidObjectId(req.body.employeeRef)) {
        empQuery.push({ _id: req.body.employeeRef })
      }
      if (req.body.employeeEmail) {
        empQuery.push({ email: String(req.body.employeeEmail).trim().toLowerCase() })
      }
      const employee = empQuery.length > 0 ? await Employee.findOne({ $or: empQuery }).lean() : null
      if (!employee) throw invalid('Choose an existing employee.', 404)

      const finalStatus = String(req.body.status || '').toLowerCase() === 'processed' ? 'processed' : 'draft'

      const record = await PayrollRecord.findOneAndUpdate(
        { employeeRef: employee._id, month: values.month },
        {
          $set: {
            ...values,
            employeeRef: employee._id,
            employeeId: employee.employeeId,
            branch: req.body.branch || req.body.location || employee.location || '',
            location: req.body.location || req.body.branch || employee.location || '',
            bankName: req.body.bankName || employee.bankDetails?.bankName,
            accountNumber: req.body.accountNumber || employee.bankDetails?.accountNumber,
            ifscCode: req.body.ifscCode || employee.bankDetails?.ifscCode,
            panTaxId: req.body.panTaxId || employee.identity?.panNumber || employee.bankDetails?.panTaxId,
            uanNumber: req.body.uanNumber || employee.identity?.uanNumber || employee.bankDetails?.uanNumber,
            status: finalStatus,
            reviewed: true,
            reviewedBy: req.auth.user.id,
            ...(finalStatus === 'processed' ? { finalizedAt: new Date() } : {}),
          },
        },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
      ).lean()

      const settings = await getCompanySettings()
      const formatted = normalizePayrollData(record, employee, settings)

      if (finalStatus === 'processed' && req.body.sendEmail === true && employee.email) {
        try {
          const pdfAttachment = await generatePayslipPdf(formatted).catch(() => null)
          await sendPayslipEmail({
            employee,
            record,
            month: record.month,
            settings,
            pdfAttachment,
          })
          await PayrollRecord.findByIdAndUpdate(record._id, { $set: { emailSentAt: new Date() } })
          record.emailSentAt = new Date()
        } catch (mailErr) {
          console.warn(`[MailService] Failed to email single payslip to ${employee.email}:`, mailErr?.message || mailErr)
        }
      }

      res.json({
        success: true,
        data: {
          ...record,
          id: String(record._id),
          employeeName: employee.name,
          formattedPayslip: formatted,
        },
      })
    } catch (error) {
      if (error.code === 11000) {
        error.statusCode = 409
        error.message = 'Payroll for this employee and period already exists. Refresh and try again.'
      }
      next(error)
    }
  })

  // Delete Payslip
  router.delete('/:id', management, async (req, res, next) => {
    try {
      ensureConnected()
      const rawId = String(req.params.id || '').trim()
      const query = mongoose.isValidObjectId(rawId)
        ? { _id: rawId }
        : { $or: [{ id: rawId }, { employeeId: rawId.toUpperCase() }] }
      const deleted = await PayrollRecord.findOneAndDelete(query).lean()
      if (!deleted) throw invalid('Payslip not found or already deleted.', 404)
      res.json({
        success: true,
        data: {
          id: String(deleted._id),
          message: 'Payslip record deleted successfully.',
        },
      })
    } catch (error) { next(error) }
  })

  // Bulk generate
  router.post('/bulk-generate', management, async (req, res, next) => {
    try {
      ensureConnected()
      const { month, employeeIds, department, branch } = req.body ?? {}
      const period = payrollPeriod(month)
      const daysInMonth = period.end.getUTCDate()
      const targetMonth = period.monthName || month

      const query = { status: { $ne: 'inactive' } }
      if (Array.isArray(employeeIds) && employeeIds.length > 0) {
        const idStrings = employeeIds.map((id) => String(id).trim()).filter(Boolean)
        const objectIds = idStrings.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id))
        const codeStrings = idStrings.map((id) => id.toUpperCase())
        query.$or = [
          { employeeId: { $in: codeStrings } },
          { _id: { $in: objectIds } },
        ]
      }
      if (department && department !== 'all') {
        query.department = department
      }
      if (branch && branch !== 'all') {
        query.$or = [{ location: branch }, { branch: branch }]
      }

      const employees = await Employee.find(query).lean()
      if (employees.length === 0) throw invalid('No active employees match the selected criteria.', 404)

      let createdCount = 0
      let updatedCount = 0
      let skippedCount = 0

      for (const emp of employees) {
        try {
          const filter = { employeeRef: emp._id, month: targetMonth }
          const existing = await PayrollRecord.findOne(filter).lean()
          if (existing && existing.status !== 'draft') {
            skippedCount++
            continue
          }

          // Take directly from employee salary structure (Basic, HRA, CA, SA, OA) or auto calculate
          const annualSalary = Number(emp.salary) || 400000
          const monthlyGross = Math.round(annualSalary / 12)
          const struct = emp.salaryStructure || {}
          const hasStruct = Boolean(
            struct && (
              struct.basic !== undefined ||
              struct.hra !== undefined ||
              struct.ca !== undefined ||
              struct.conveyance !== undefined ||
              struct.sa !== undefined ||
              struct.specialAllowance !== undefined ||
              struct.oa !== undefined ||
              struct.otherAllowance !== undefined
            )
          )

          const basic = hasStruct && struct.basic !== undefined
            ? Math.max(0, Number(struct.basic) || 0)
            : Math.round(monthlyGross * 0.5)

          const hra = hasStruct && struct.hra !== undefined
            ? Math.max(0, Number(struct.hra) || 0)
            : Math.round(basic * 0.4)

          const conveyance = hasStruct && (struct.conveyance !== undefined || struct.ca !== undefined)
            ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0)
            : (monthlyGross > 8000 ? 1600 : Math.round(monthlyGross * 0.1))

          const specialAllowance = hasStruct && (struct.specialAllowance !== undefined || struct.sa !== undefined)
            ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0)
            : Math.round(monthlyGross * 0.15)

          const otherAllowance = hasStruct && (struct.otherAllowance !== undefined || struct.oa !== undefined)
            ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0)
            : Math.max(0, monthlyGross - basic - hra - conveyance - specialAllowance)

          const pf = Math.min(1800, Math.round(basic * 0.12))
          const professionalTax = 200

          let empContext = { lopDays: 0 }
          try {
            empContext = await context(emp, targetMonth)
          } catch {}

          const rawLopDays = Number(empContext.lopDays) || 0
          const calculatedLopDays = Math.max(0, rawLopDays)
          const cappedLopDays = Math.min(daysInMonth, calculatedLopDays)
          const payableDays = Math.max(0, daysInMonth - cappedLopDays)
          
          let lopDeduction = calculatedLopDays > 0 ? Math.round((monthlyGross / daysInMonth) * calculatedLopDays) : 0
          const statutoryDeds = pf + professionalTax
          if (lopDeduction + statutoryDeds > monthlyGross) {
            lopDeduction = Math.max(0, monthlyGross - statutoryDeds)
          }

          const draftData = validatePayroll({
            month: targetMonth,
            workingDays: daysInMonth,
            standardDays: daysInMonth,
            paidDays: payableDays,
            payableDays,
            lopDays: cappedLopDays,
            earnings: {
              basic,
              hra,
              conveyance,
              specialAllowance,
              medicalAllowance: 0,
              performanceBonus: 0,
              overtime: 0,
              otherAllowance,
            },
            deductions: {
              pf,
              professionalTax,
              esi: 0,
              tdsTax: 0,
              loanAdvance: 0,
              lossOfPay: lopDeduction,
              performanceDeduction: 0,
              otherDeductions: 0,
            },
            notes: calculatedLopDays > 0
              ? `Auto-generated bulk payroll draft (${calculatedLopDays} LOP day(s) calculated from attendance & leaves)`
              : 'Auto-generated bulk payroll draft',
          })

          const recordPayload = {
            employeeRef: emp._id,
            employeeId: emp.employeeId || String(emp._id),
            branch: emp.location || 'Bengaluru HQ',
            location: emp.location || 'Bengaluru HQ',
            bankName: emp.bankDetails?.bankName,
            accountNumber: emp.bankDetails?.accountNumber,
            ifscCode: emp.bankDetails?.ifscCode,
            panTaxId: emp.identity?.panNumber || emp.bankDetails?.panTaxId,
            uanNumber: emp.identity?.uanNumber || emp.bankDetails?.uanNumber,
            ...draftData,
            status: 'draft',
            reviewed: true,
            reviewedBy: req.auth.user.id,
          }

          if (existing) {
            await PayrollRecord.findByIdAndUpdate(existing._id, { $set: recordPayload })
            updatedCount++
          } else {
            await PayrollRecord.create(recordPayload)
            createdCount++
          }
        } catch (itemErr) {
          console.warn(`[bulk-generate] Error generating for employee ${emp.employeeId || emp._id}:`, itemErr?.message || itemErr)
        }
      }

      res.json({
        success: true,
        data: {
          createdCount,
          updatedCount,
          skippedCount,
          message: `Generated ${createdCount} payroll draft(s)${updatedCount > 0 ? `, updated ${updatedCount} draft(s)` : ''}. ${skippedCount > 0 ? `${skippedCount} finalized records were preserved.` : ''}`,
        },
      })
    } catch (error) { next(error) }
  })

  // Finalize reviewed drafts and automatically disburse payslips via email to all employees
  router.post('/finalize', management, async (req, res, next) => {
    try {
      ensureConnected()
      const cleanMonth = String(req.body?.month ?? '').trim().replace(/\s+/g, ' ')
      payrollPeriod(cleanMonth)
      const shouldEmail = req.body?.sendEmail !== false
      const forceAll = Boolean(req.body?.resendAll || req.body?.forceAll)

      const result = await PayrollRecord.updateMany(
        { month: cleanMonth, status: 'draft' },
        { $set: { status: 'processed', reviewed: true, finalizedAt: new Date() } },
      )

      let emailStats = { sentCount: 0, failedCount: 0, skippedCount: 0, total: 0 }
      if (shouldEmail) {
        emailStats = await dispatchPayslipEmails({ month: cleanMonth, forceAll })
      }

      const msgParts = []
      if (result.modifiedCount > 0) {
        msgParts.push(`Finalized ${result.modifiedCount} draft payslip(s)`)
      } else if (emailStats.total > 0) {
        msgParts.push(`All ${emailStats.total} payslip(s) are finalized`)
      } else {
        msgParts.push('All payslips for this period are already finalized and visible to employees')
      }

      if (emailStats.sentCount > 0) {
        msgParts.push(`emailed payslip PDFs directly to ${emailStats.sentCount} employee(s)`)
      }
      if (emailStats.failedCount > 0) {
        msgParts.push(`${emailStats.failedCount} skipped (no email configured)`)
      }
      if (emailStats.skippedCount > 0 && emailStats.sentCount === 0) {
        msgParts.push(`${emailStats.skippedCount} employee(s) were already emailed previously`)
      }

      res.json({
        success: true,
        data: {
          finalizedCount: result.modifiedCount,
          totalRecords: emailStats.total,
          sentCount: emailStats.sentCount,
          failedCount: emailStats.failedCount,
          skippedCount: emailStats.skippedCount,
          message: msgParts.join(', ') + '.',
        },
      })
    } catch (error) { next(error) }
  })

  return router
}
