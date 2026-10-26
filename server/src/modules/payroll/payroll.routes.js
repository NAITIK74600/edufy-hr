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
  const match = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})$/i.exec(clean)
  if (!match) throw invalid('Select a payroll month such as October 2026.')
  const monthName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
  const year = match[2]
  const start = new Date(`${monthName} 1, ${year} 00:00:00 UTC`)
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  return { start, end, from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}

export function validatePayroll(body) {
  payrollPeriod(body.month)
  const workingDays = Math.max(0, Math.min(31, Number(body.workingDays ?? body.standardDays ?? 30)))
  const lopDays = body.lopDays !== undefined
    ? Number(body.lopDays)
    : (body.paidDays !== undefined || body.payableDays !== undefined
      ? Math.max(0, workingDays - Number(body.paidDays ?? body.payableDays))
      : 0)
  const paidDays = body.paidDays !== undefined || body.payableDays !== undefined
    ? Number(body.paidDays ?? body.payableDays)
    : Math.max(0, workingDays - lopDays)

  if (!Number.isFinite(paidDays) || paidDays < 0 || paidDays > 31) throw invalid('Invalid paidDays amount.')
  if (!Number.isFinite(lopDays) || lopDays < 0 || lopDays > 31) throw invalid('Invalid lopDays amount.')
  if (paidDays + lopDays !== workingDays) throw invalid('paidDays and lopDays must equal workingDays.')

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
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0)

  if (totalDeductions > grossEarnings) throw invalid('Deductions cannot exceed gross earnings.')

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

async function context(employee, month) {
  try {
    const period = payrollPeriod(month)
    const empId = employee?.employeeId ? String(employee.employeeId).toUpperCase() : null
    const empObjectId = employee?._id && mongoose.isValidObjectId(employee._id) ? employee._id : null
    const [attendance, leave] = await Promise.all([
      empId ? AttendanceRecord.find({ employeeId: empId, date: { $gte: period.from, $lte: period.to } }).lean() : [],
      empObjectId ? LeaveRequest.find({ employeeId: empObjectId, status: 'approved', startDate: { $lte: period.end }, endDate: { $gte: period.start } }).lean() : [],
    ])

    const countedDates = new Set()
    let totalLopDays = 0

    // 1. Process attendance records
    for (const record of attendance) {
      const dateStr = record.date
      const dayOfMonth = Number(String(dateStr || '').split('-')[2]) || 1
      const isLopRecord = record.status === 'lop' || record.isLop
      const isLeaveRecord = record.status === 'on-leave'
      const isMonthEndDoubleLop = dayOfMonth >= 25 || record.isDoubleLop

      if (isLopRecord) {
        totalLopDays += isMonthEndDoubleLop ? 2 : 1
        countedDates.add(dateStr)
      } else if (isLeaveRecord && isMonthEndDoubleLop) {
        totalLopDays += 2
        countedDates.add(dateStr)
      }
    }

    // 2. Process approved leave requests (month-end from 25th is considered Double LOP)
    for (const req of leave) {
      const start = new Date(Math.max(new Date(req.startDate).getTime(), period.start.getTime()))
      const end = new Date(Math.min(new Date(req.endDate).getTime(), period.end.getTime()))
      for (const cur = new Date(start); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
        const curDateStr = cur.toISOString().slice(0, 10)
        if (countedDates.has(curDateStr)) continue

        const dayOfMonth = cur.getUTCDate()
        if (dayOfMonth >= 25 || req.isDoubleLop) {
          totalLopDays += 2
          countedDates.add(curDateStr)
        }
      }
    }

    return {
      attendanceDays: attendance.length,
      absentDays: attendance.filter((record) => record.status === 'absent').length,
      halfDays: attendance.filter((record) => record.status === 'half-day').length,
      lopDays: totalLopDays,
      earlyLogoutDays: attendance.filter((record) => record.status === 'early-logout' || record.isEarlyLogout).length,
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
  const isManagementRole = (user) => ['admin', 'hr', 'hr_executive', 'director', 'managing_director', 'co_founder'].includes(user?.role)
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
      const employee = await Employee.findOne({ employeeId: String(req.query.employeeId ?? '').toUpperCase() }).lean()
      if (!employee) throw invalid('Employee not found.', 404)
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
        if (userEmp?.name) orClauses.push({ employeeName: userEmp.name })
        if (req.auth.user.name) orClauses.push({ employeeName: req.auth.user.name })

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
    const isManagement = ['admin', 'hr'].includes(authUser.role)
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

  // Bulk dispatch payslip emails for a period
  router.post('/send-bulk-email', management, async (req, res, next) => {
    try {
      ensureConnected()
      const { month } = req.body ?? {}
      payrollPeriod(month)

      const records = await PayrollRecord.find({ month, status: 'processed' })
        .populate('employeeRef', 'name employeeId email department designation location bankDetails')
      if (records.length === 0) {
        throw invalid(`No finalized payslips found for period ${month}.`, 404)
      }

      const settings = await getCompanySettings()
      let sentCount = 0
      let failedCount = 0

      for (const record of records) {
        const emp = record.employeeRef
        if (!emp?.email) {
          failedCount++
          continue
        }
        try {
          const formatted = normalizePayrollData(record, emp, settings)
          const pdfAttachment = await generatePayslipPdf(formatted).catch(() => null)
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
          console.warn(`[MailService] Failed to send payslip to ${emp?.email}:`, err?.message || err)
          failedCount++
        }
      }

      res.json({
        success: true,
        data: {
          total: records.length,
          sentCount,
          failedCount,
          message: `Dispatched payslips to ${sentCount} employee(s). ${failedCount > 0 ? `${failedCount} skipped or failed.` : ''}`,
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

      const query = { status: 'active' }
      if (Array.isArray(employeeIds) && employeeIds.length > 0) {
        query.employeeId = { $in: employeeIds.map((id) => String(id).toUpperCase()) }
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
      let skippedCount = 0

      for (const emp of employees) {
        const filter = { employeeRef: emp._id, month }
        const existing = await PayrollRecord.findOne(filter).lean()
        if (existing) {
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
          empContext = await context(emp, month)
        } catch {}
        const calculatedLopDays = empContext.lopDays || 0
        const payableDays = Math.max(0, daysInMonth - calculatedLopDays)
        const lopDeduction = calculatedLopDays > 0 ? Math.round((monthlyGross / daysInMonth) * calculatedLopDays) : 0

        const draftData = validatePayroll({
          month,
          workingDays: daysInMonth,
          paidDays: payableDays,
          lopDays: calculatedLopDays,
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
            ? `Auto-generated bulk payroll draft (${calculatedLopDays} LOP day(s) deducted, including month-end Double LOP)`
            : 'Auto-generated bulk payroll draft',
        })

        await PayrollRecord.create({
          employeeRef: emp._id,
          employeeId: emp.employeeId,
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
        })
        createdCount++
      }

      res.json({
        success: true,
        data: {
          createdCount,
          skippedCount,
          message: `Generated ${createdCount} payroll draft(s). ${skippedCount > 0 ? `${skippedCount} already existed and were skipped.` : ''}`,
        },
      })
    } catch (error) { next(error) }
  })

  // Finalize reviewed drafts
  router.post('/finalize', management, async (req, res, next) => {
    try {
      ensureConnected()
      payrollPeriod(req.body?.month)
      const result = await PayrollRecord.updateMany(
        { month: req.body.month, status: 'draft' },
        { $set: { status: 'processed', reviewed: true, finalizedAt: new Date() } },
      )
      res.json({
        success: true,
        data: {
          finalizedCount: result.modifiedCount,
          message: result.modifiedCount > 0
            ? `Successfully finalized and disbursed payslips for ${result.modifiedCount} employee(s).`
            : 'All payslips for this period are already finalized and visible to employees.',
        },
      })
    } catch (error) { next(error) }
  })

  return router
}
