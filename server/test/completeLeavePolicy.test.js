import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach, test } from 'node:test'
import { evaluateLeaveRequest, isInternEmployee, getMonthlyDefaultAllowance } from '../src/modules/leave/leavePolicyEngine.js'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/auth/passwords.js'
import { PERMISSIONS } from '../src/auth/permissions.js'
import { createUserStore } from '../src/auth/userStore.js'
import { calculateAttendanceLopContext } from '../src/modules/payroll/payroll.routes.js'

describe('Complete Leave Policy & Double LOP Test Suite (20 Mandatory Cases)', () => {
  // -------------------------------------------------------------
  // Test 1: Employee has sufficient CL: no LOP
  // -------------------------------------------------------------
  test('Case 1: Employee has sufficient CL -> 0 LOP, 0 Double LOP', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-10',
      endDate: '2026-11-11',
      requestedLeaveType: 'casual',
      availableBalances: { casual: 2, sick: 1 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 2)
    assert.equal(res.casualUnits, 2)
    assert.equal(res.sickUnits, 0)
    assert.equal(res.normalLopUnits, 0)
    assert.equal(res.doubleLopUnits, 0)
    assert.equal(res.paidUnits, 2)
    assert.equal(res.unpaidUnits, 0)
    assert.equal(res.isDoubleLop, false)
    assert.equal(res.requiresAdminSignoff, false)
  })

  // -------------------------------------------------------------
  // Test 2: Employee has sufficient SL: no LOP
  // -------------------------------------------------------------
  test('Case 2: Employee has sufficient SL -> 0 LOP, 0 Double LOP', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-10',
      endDate: '2026-11-11',
      requestedLeaveType: 'sick',
      availableBalances: { casual: 0, sick: 2 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 2)
    assert.equal(res.casualUnits, 0)
    assert.equal(res.sickUnits, 2)
    assert.equal(res.normalLopUnits, 0)
    assert.equal(res.doubleLopUnits, 0)
    assert.equal(res.paidUnits, 2)
    assert.equal(res.unpaidUnits, 0)
    assert.equal(res.isDoubleLop, false)
    assert.equal(res.requiresAdminSignoff, false)
  })

  // -------------------------------------------------------------
  // Test 3: Employee has both CL and SL: configured priority followed
  // -------------------------------------------------------------
  test('Case 3: Employee has both CL and SL -> configured priority followed', () => {
    // When requesting casual, CL consumed before SL
    const resCL = evaluateLeaveRequest({
      startDate: '2026-11-10',
      endDate: '2026-11-12', // 3 working days (Tue, Wed, Thu)
      requestedLeaveType: 'casual',
      availableBalances: { casual: 2, sick: 2 },
      holidayDates: [],
    })
    assert.equal(resCL.totalUnits, 3)
    assert.equal(resCL.casualUnits, 2)
    assert.equal(resCL.sickUnits, 1)
    assert.equal(resCL.normalLopUnits, 0)
    assert.equal(resCL.doubleLopUnits, 0)

    // When requesting sick, SL consumed before CL
    const resSL = evaluateLeaveRequest({
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      requestedLeaveType: 'sick',
      availableBalances: { casual: 2, sick: 2 },
      holidayDates: [],
    })
    assert.equal(resSL.totalUnits, 3)
    assert.equal(resSL.sickUnits, 2)
    assert.equal(resSL.casualUnits, 1)
    assert.equal(resSL.normalLopUnits, 0)
    assert.equal(resSL.doubleLopUnits, 0)
  })

  // -------------------------------------------------------------
  // Test 4: Employee has no CL or SL: unpaid leave generated
  // -------------------------------------------------------------
  test('Case 4: Employee has no CL or SL -> 100% unpaid LOP generated', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-10',
      endDate: '2026-11-11',
      requestedLeaveType: 'casual',
      availableBalances: { casual: 0, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 2)
    assert.equal(res.paidUnits, 0)
    assert.equal(res.unpaidUnits, 2)
    assert.equal(res.normalLopUnits, 2)
    assert.equal(res.doubleLopUnits, 0)
    assert.equal(res.isDoubleLop, false)
  })

  // -------------------------------------------------------------
  // Test 5: Employee has partial paid leave: remaining dates classified correctly
  // -------------------------------------------------------------
  test('Case 5: Partial paid leave -> remaining dates become unpaid LOP', () => {
    // 3 days requested (Nov 10-12), only 1 CL available
    const res = evaluateLeaveRequest({
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      requestedLeaveType: 'casual',
      availableBalances: { casual: 1, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 3)
    assert.equal(res.casualUnits, 1)
    assert.equal(res.sickUnits, 0)
    assert.equal(res.paidUnits, 1)
    assert.equal(res.normalLopUnits, 2)
    assert.equal(res.doubleLopUnits, 0)
    assert.equal(res.unpaidUnits, 2)
  })

  // -------------------------------------------------------------
  // Test 6: November 5–6: strictly before 25th -> no Double LOP
  // -------------------------------------------------------------
  test('Case 6: November 5-6 (strictly <25th) -> no Double LOP even when unpaid', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-05',
      endDate: '2026-11-06',
      requestedLeaveType: 'lop',
      availableBalances: { casual: 0, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 2)
    assert.equal(res.normalLopUnits, 2)
    assert.equal(res.doubleLopUnits, 0)
    assert.equal(res.isDoubleLop, false)
    assert.equal(res.requiresAdminSignoff, false)
  })

  // -------------------------------------------------------------
  // Test 7: November 25–26: qualifying unpaid dates become Double LOP
  // -------------------------------------------------------------
  test('Case 7: November 25-26 -> qualifying unpaid dates become Double LOP (25th+)', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-25',
      endDate: '2026-11-26',
      requestedLeaveType: 'lop',
      availableBalances: { casual: 0, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 2)
    assert.equal(res.normalLopUnits, 0)
    assert.equal(res.doubleLopUnits, 2)
    assert.equal(res.isDoubleLop, true)
    assert.equal(res.requiresAdminSignoff, true)
    assert.equal(res.dayBreakdown[0].deductionMultiplier, 2.0)
    assert.equal(res.dayBreakdown[1].deductionMultiplier, 2.0)
  })

  // -------------------------------------------------------------
  // Test 8: November 24–26: date-wise classification
  // -------------------------------------------------------------
  test('Case 8: November 24-26 -> Nov 24 is Normal LOP, Nov 25-26 are Double LOP', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-24',
      endDate: '2026-11-26',
      requestedLeaveType: 'lop',
      availableBalances: { casual: 0, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 3)
    assert.equal(res.normalLopUnits, 1) // Nov 24
    assert.equal(res.doubleLopUnits, 2) // Nov 25, 26
    assert.equal(res.isDoubleLop, true)
    assert.equal(res.requiresAdminSignoff, true)

    assert.equal(res.dayBreakdown[0].date, '2026-11-24')
    assert.equal(res.dayBreakdown[0].leaveCategory, 'normal_lop')
    assert.equal(res.dayBreakdown[0].deductionMultiplier, 1.0)

    assert.equal(res.dayBreakdown[1].date, '2026-11-25')
    assert.equal(res.dayBreakdown[1].leaveCategory, 'double_lop')
    assert.equal(res.dayBreakdown[1].deductionMultiplier, 2.0)

    assert.equal(res.dayBreakdown[2].date, '2026-11-26')
    assert.equal(res.dayBreakdown[2].leaveCategory, 'double_lop')
    assert.equal(res.dayBreakdown[2].deductionMultiplier, 2.0)
  })

  // -------------------------------------------------------------
  // Test 9: November 29–December 2: cross-month classification
  // -------------------------------------------------------------
  test('Case 9: November 29 - December 2 (cross-month) -> Nov 29-30 Double LOP, Dec 1-2 Normal LOP', () => {
    // Nov 29 is Sunday, Nov 30 is Mon, Dec 1 is Tue, Dec 2 is Wed
    const res = evaluateLeaveRequest({
      startDate: '2026-11-30',
      endDate: '2026-12-02',
      requestedLeaveType: 'lop',
      availableBalances: { casual: 0, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 3)
    assert.equal(res.doubleLopUnits, 1) // Nov 30 (>= 25)
    assert.equal(res.normalLopUnits, 2) // Dec 1, Dec 2 (< 25)
    assert.equal(res.isDoubleLop, true)

    assert.equal(res.dayBreakdown[0].date, '2026-11-30')
    assert.equal(res.dayBreakdown[0].isDoubleLop, true)

    assert.equal(res.dayBreakdown[1].date, '2026-12-01')
    assert.equal(res.dayBreakdown[1].isDoubleLop, false)
    assert.equal(res.dayBreakdown[1].leaveCategory, 'normal_lop')

    assert.equal(res.dayBreakdown[2].date, '2026-12-02')
    assert.equal(res.dayBreakdown[2].isDoubleLop, false)
    assert.equal(res.dayBreakdown[2].leaveCategory, 'normal_lop')
  })

  // -------------------------------------------------------------
  // Test 10: Paid leave on November 26: no Double LOP for paid dates
  // -------------------------------------------------------------
  test('Case 10: Paid leave on November 26 -> 0 Double LOP, 0 payroll deduction multiplier', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-26',
      endDate: '2026-11-26',
      requestedLeaveType: 'casual',
      availableBalances: { casual: 1, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 1)
    assert.equal(res.casualUnits, 1)
    assert.equal(res.paidUnits, 1)
    assert.equal(res.doubleLopUnits, 0)
    assert.equal(res.isDoubleLop, false)
    assert.equal(res.requiresAdminSignoff, false)
    assert.equal(res.dayBreakdown[0].isPaid, true)
    assert.equal(res.dayBreakdown[0].deductionMultiplier, 0)
  })

  // -------------------------------------------------------------
  // Test 11: No paid balance on November 26: Double LOP
  // -------------------------------------------------------------
  test('Case 11: No paid balance on November 26 -> classified as Double LOP (25th+)', () => {
    const res = evaluateLeaveRequest({
      startDate: '2026-11-26',
      endDate: '2026-11-26',
      requestedLeaveType: 'casual',
      availableBalances: { casual: 0, sick: 0 },
      holidayDates: [],
    })
    assert.equal(res.totalUnits, 1)
    assert.equal(res.paidUnits, 0)
    assert.equal(res.doubleLopUnits, 1)
    assert.equal(res.isDoubleLop, true)
    assert.equal(res.requiresAdminSignoff, true)
    assert.equal(res.dayBreakdown[0].deductionMultiplier, 2.0)
  })

  // -------------------------------------------------------------
  // Test 12 to 20: Full API & Database Integration Lifecycle
  // -------------------------------------------------------------
  let server, baseUrl, employees, requests, balances, policies, notifications

  const secret = 'test-complete-leave-policy-secret'
  const users = [
    { id: 'emp-10', email: 'emp10@example.test', displayName: 'Anusha J', role: 'employee', status: 'active', permissions: [PERMISSIONS.LEAVE_SELF_READ, PERMISSIONS.LEAVE_SELF_WRITE], passwordHash: hashPassword('pw') },
    { id: 'mgr-10', email: 'mgr10@example.test', displayName: 'Manager M', role: 'manager', status: 'active', permissions: [PERMISSIONS.LEAVE_TEAM_READ, PERMISSIONS.LEAVE_TEAM_APPROVE], passwordHash: hashPassword('pw') },
    { id: 'hr-10', email: 'hr10@example.test', displayName: 'HR Operations', role: 'hr', status: 'active', permissions: [PERMISSIONS.LEAVE_HR_READ, PERMISSIONS.LEAVE_HR_REVIEW], passwordHash: hashPassword('pw') },
    { id: 'admin-10', email: 'admin10@example.test', displayName: 'Admin User', role: 'admin', status: 'active', permissions: [PERMISSIONS.ADMIN_ACCESS, PERMISSIONS.LEAVE_HR_READ, PERMISSIONS.LEAVE_HR_REVIEW], passwordHash: hashPassword('pw') },
  ]

  function createTestMemoryLeaveRepo() {
    return {
      async listRequests(filters = {}) {
        return requests.filter((r) =>
          (!filters.employeeId || r.employeeId === filters.employeeId) &&
          (!filters.managerId || r.managerId === filters.managerId) &&
          (!filters.status || r.status === filters.status)
        )
      },
      async findRequest(id) { return requests.find((r) => r.id === id) ?? null },
      async createRequest(data) {
        const req = { id: `req-${requests.length + 1}`, ...data, comments: [], approvalHistory: data.approvalHistory || [] }
        requests.push(req)
        return req
      },
      async transitionRequest(id, expectedStatuses, update) {
        const req = requests.find((r) => r.id === id && expectedStatuses.includes(r.status))
        if (!req) return null
        Object.assign(req, update.set || {})
        if (update.push) req.approvalHistory.push(update.push)
        return req
      },
      async appendComment(id, comment) {
        const req = requests.find((r) => r.id === id)
        if (req) {
          req.comments.push(comment)
          req.approvalHistory.push({ action: 'commented', ...comment })
        }
        return req
      },
      async findOverlap({ employeeId, startDate, endDate, excludeId }) {
        return requests.find((r) =>
          r.employeeId === employeeId &&
          r.id !== excludeId &&
          ['pending_manager', 'pending_hr', 'pending_admin', 'approved'].includes(r.status) &&
          new Date(r.startDate) <= endDate &&
          new Date(r.endDate) >= startDate
        ) ?? null
      },
      async getPolicy(leaveType) { return policies.find((p) => p.leaveType === leaveType) ?? null },
      async listPolicies() { return policies },
      async savePolicy(leaveType, val) { const p = { leaveType, ...val }; policies.push(p); return p },
      async listBalances(filters = {}) { return balances.filter((b) => !filters.employeeId || b.employeeId === filters.employeeId) },
      async getBalance(employeeId, leaveType) { return balances.find((b) => b.employeeId === employeeId && b.leaveType === leaveType) ?? null },
      async ensureBalance(employeeId, leaveType, allowance) {
        let b = balances.find((x) => x.employeeId === employeeId && x.leaveType === leaveType)
        if (!b) {
          b = { employeeId, leaveType, allowance: Number(allowance) || 1, allocated: Number(allowance) || 1, used: 0, reserved: 0, remaining: Number(allowance) || 1 }
          balances.push(b)
        }
        return b
      },
      async reserveBalance(employeeId, leaveType, units) {
        const b = balances.find((x) => x.employeeId === employeeId && x.leaveType === leaveType)
        const quota = b ? (b.allowance ?? b.allocated ?? 0) : 0
        if (!b || quota - (b.used || 0) - (b.reserved || 0) < units) return null
        b.reserved = (b.reserved || 0) + units
        b.remaining = Math.max(0, quota - (b.used || 0) - b.reserved)
        return b
      },
      async releaseReservation(employeeId, leaveType, units) {
        const b = balances.find((x) => x.employeeId === employeeId && x.leaveType === leaveType)
        if (b) {
          b.reserved = Math.max(0, (b.reserved || 0) - units)
          const quota = b.allowance ?? b.allocated ?? 0
          b.remaining = Math.max(0, quota - (b.used || 0) - b.reserved)
        }
        return b
      },
      async commitReservation(employeeId, leaveType, units) {
        const b = balances.find((x) => x.employeeId === employeeId && x.leaveType === leaveType)
        if (b) {
          b.reserved = Math.max(0, (b.reserved || 0) - units)
          b.used = (b.used || 0) + units
          const quota = b.allowance ?? b.allocated ?? 0
          b.remaining = Math.max(0, quota - b.used - (b.reserved || 0))
        }
        return b
      },
      async restoreCommittedBalance(employeeId, leaveType, units) {
        const b = balances.find((x) => x.employeeId === employeeId && x.leaveType === leaveType)
        if (b) {
          b.used = Math.max(0, (b.used || 0) - units)
          const quota = b.allowance ?? b.allocated ?? 0
          b.remaining = Math.max(0, quota - b.used - (b.reserved || 0))
        }
        return b
      },
      async notify(d) { notifications.push(d); return d },
    }
  }

  beforeEach(async () => {
    employees = [
      { id: 'emp-10', name: 'Anusha J', managerId: 'mgr-10', status: 'active', employmentType: 'full_time' },
      { id: 'mgr-10', name: 'Manager M', managerId: null, status: 'active', role: 'manager' },
      { id: 'hr-10', name: 'HR Operations', managerId: null, status: 'active', role: 'hr' },
      { id: 'admin-10', name: 'Admin User', managerId: null, status: 'active', role: 'admin' },
    ]
    requests = []
    balances = [
      { employeeId: 'emp-10', leaveType: 'casual', allowance: 1, allocated: 1, used: 0, reserved: 0, remaining: 1 },
      { employeeId: 'emp-10', leaveType: 'sick', allowance: 1, allocated: 1, used: 0, reserved: 0, remaining: 1 },
    ]
    policies = [
      { leaveType: 'casual', label: 'Casual Leave', configured: true, approvalStage: 'manager_hr', countWeekends: false, countHolidays: false, requiresReason: true, allowCancellationAfterApproval: true, allowAmendment: true },
      { leaveType: 'sick', label: 'Sick Leave', configured: true, approvalStage: 'manager_hr', countWeekends: false, countHolidays: false, requiresReason: true, allowCancellationAfterApproval: true, allowAmendment: true },
      { leaveType: 'lop', label: 'Loss of Pay', configured: true, approvalStage: 'manager_hr', countWeekends: false, countHolidays: false, requiresReason: true, allowCancellationAfterApproval: true, allowAmendment: true },
    ]
    notifications = []
    server = createApp({
      userStore: createUserStore(users),
      employeeRepository: { findById: async (id) => employees.find((e) => e.id === id) ?? null, list: async () => ({ records: employees }) },
      leaveRepository: createTestMemoryLeaveRepo(),
      jwtSecret: secret,
    }).listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
  })

  afterEach(async () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))))

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', ...options.headers } })
    return { status: res.status, body: res.status === 204 ? null : await res.json() }
  }

  async function authHeader(email) {
    const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: 'pw' }) })
    return { authorization: `Bearer ${res.body.data.token}` }
  }

  // -------------------------------------------------------------
  // Test 12: Employee edits leave dates: classification recalculated
  // -------------------------------------------------------------
  test('Case 12: Employee edits leave dates -> classification recalculated and balances adjusted', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    // Submit 1 day on Nov 10 (covered by CL)
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-10', endDate: '2026-11-10', reason: 'Personal work' }),
    })
    assert.equal(sub.status, 201)
    assert.equal(sub.body.data.casualLeaveUnits, 1)
    assert.equal(balances[0].reserved, 1)

    // Amend to Nov 10 - Nov 11 (2 working days: consumes 1 CL + 1 SL)
    const amend = await api(`/leave/requests/${sub.body.data.id}/amend`, {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ startDate: '2026-11-10', endDate: '2026-11-11', reason: 'Extended wedding' }),
    })
    assert.equal(amend.status, 200)
    assert.equal(amend.body.data.units, 2)
    assert.equal(amend.body.data.casualLeaveUnits, 1)
    assert.equal(amend.body.data.sickLeaveUnits, 1)
    assert.equal(balances[0].reserved, 1) // CL reserved = 1
    assert.equal(balances[1].reserved, 1) // SL reserved = 1
  })

  // -------------------------------------------------------------
  // Test 13: Employee cancels request: balances restored
  // -------------------------------------------------------------
  test('Case 13: Employee cancels request -> reserved balances safely restored', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-10', endDate: '2026-11-10', reason: 'To be cancelled' }),
    })
    assert.equal(sub.status, 201)
    assert.equal(balances[0].reserved, 1)

    const cancel = await api(`/leave/requests/${sub.body.data.id}/cancel`, { method: 'POST', headers: empHeaders })
    assert.equal(cancel.status, 200)
    assert.equal(cancel.body.data.status, 'cancelled')
    assert.equal(balances[0].reserved, 0)
    assert.equal(balances[0].remaining, 1)
  })

  // -------------------------------------------------------------
  // Test 14: Manager rejects request: balances restored
  // -------------------------------------------------------------
  test('Case 14: Manager rejects request -> reserved balances safely restored', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    const mgrHeaders = await authHeader('mgr10@example.test')
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-10', endDate: '2026-11-10', reason: 'Doctor checkup' }),
    })
    assert.equal(balances[0].reserved, 1)

    const rej = await api(`/leave/team/${sub.body.data.id}/reject`, {
      method: 'POST',
      headers: mgrHeaders,
      body: JSON.stringify({ reason: 'Critical sprint release today.' }),
    })
    assert.equal(rej.status, 200)
    assert.equal(rej.body.data.status, 'rejected')
    assert.equal(balances[0].reserved, 0)
    assert.equal(balances[0].remaining, 1)
  })

  // -------------------------------------------------------------
  // Test 15: Admin rejects Double LOP: no unauthorized payroll deduction
  // -------------------------------------------------------------
  test('Case 15: Admin rejects Double LOP -> no unauthorized payroll deduction', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    const hrHeaders = await authHeader('hr10@example.test')
    const adminHeaders = await authHeader('admin10@example.test')

    // Submit unpaid leave Nov 25-26 (Double LOP)
    balances[0].used = 1 // Exhaust CL
    balances[1].used = 1 // Exhaust SL
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'lop', startDate: '2026-11-25', endDate: '2026-11-26', reason: 'Month end LOP' }),
    })
    assert.equal(sub.status, 201)
    assert.equal(sub.body.data.status, 'pending_hr')
    assert.equal(sub.body.data.isDoubleLop, true)

    // HR approves -> advances to pending_admin
    const hrApp = await api(`/leave/hr/${sub.body.data.id}/approve`, {
      method: 'POST',
      headers: hrHeaders,
      body: JSON.stringify({ comment: 'HR verified month-end LOP.' }),
    })
    assert.equal(hrApp.body.data.status, 'pending_admin')

    // Admin rejects
    const adminRej = await api(`/leave/admin/${sub.body.data.id}/reject`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ reason: 'Month end attendance threshold unmet.' }),
    })
    assert.equal(adminRej.status, 200)
    assert.equal(adminRej.body.data.status, 'rejected')

    // Verify payroll context calculation: rejected leaves yield 0 LOP deductions!
    const payrollCtx = calculateAttendanceLopContext({
      attendance: [],
      leave: requests,
      period: { from: '2026-11-01', to: '2026-11-30', start: new Date('2026-11-01'), end: new Date('2026-11-30'), totalDays: 30 },
    })
    assert.equal(payrollCtx.totalLopDays, 0)
  })

  // -------------------------------------------------------------
  // Test 16: Admin approves Double LOP: payroll follows approved policy (2x deduction)
  // -------------------------------------------------------------
  test('Case 16: Admin approves Double LOP -> payroll applies 2x deduction for Double LOP', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    const hrHeaders = await authHeader('hr10@example.test')
    const adminHeaders = await authHeader('admin10@example.test')

    balances[0].used = 1
    balances[1].used = 1
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'lop', startDate: '2026-11-25', endDate: '2026-11-26', reason: 'Approved Double LOP' }),
    })
    await api(`/leave/hr/${sub.body.data.id}/approve`, { method: 'POST', headers: hrHeaders, body: JSON.stringify({ comment: 'Verified' }) })
    const app = await api(`/leave/admin/${sub.body.data.id}/approve`, { method: 'POST', headers: adminHeaders, body: JSON.stringify({ comment: 'Sign-off granted' }) })
    assert.equal(app.body.data.status, 'approved')

    // Payroll calculation: 2 Double LOP days * 2.0 = 4 LOP deduction days!
    const payrollCtx = calculateAttendanceLopContext({
      attendance: [],
      leave: requests,
      period: { from: '2026-11-01', to: '2026-11-30', start: new Date('2026-11-01'), end: new Date('2026-11-30'), totalDays: 30 },
    })
    assert.equal(payrollCtx.totalLopDays, 4)
  })

  // -------------------------------------------------------------
  // Test 17: Duplicate approval attempts: prevented
  // -------------------------------------------------------------
  test('Case 17: Duplicate approval attempts are prevented atomically', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    const mgrHeaders = await authHeader('mgr10@example.test')
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-10', endDate: '2026-11-10', reason: 'Single day' }),
    })
    const first = await api(`/leave/team/${sub.body.data.id}/approve`, { method: 'POST', headers: mgrHeaders, body: JSON.stringify({ comment: 'First approval' }) })
    assert.equal(first.status, 200)

    const second = await api(`/leave/team/${sub.body.data.id}/approve`, { method: 'POST', headers: mgrHeaders, body: JSON.stringify({ comment: 'Second attempt' }) })
    assert.equal(second.status, 403) // Request is now pending_hr; manager cannot decide it again
  })

  // -------------------------------------------------------------
  // Test 18: Concurrent leave requests: no balance overspending
  // -------------------------------------------------------------
  test('Case 18: Concurrent requests cannot overspend available paid balance', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    // Employee only has 1 CL and 1 SL
    // First request takes 1 CL (Nov 10)
    const req1 = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-10', endDate: '2026-11-10', reason: 'Req 1' }),
    })
    assert.equal(req1.status, 201)
    assert.equal(req1.body.data.casualLeaveUnits, 1)

    // Second request takes 1 SL (Nov 11)
    const req2 = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-11', endDate: '2026-11-11', reason: 'Req 2' }),
    })
    assert.equal(req2.status, 201)
    assert.equal(req2.body.data.sickLeaveUnits, 1)

    // Third request (Nov 12): Both CL and SL are exhausted -> automatically classified as unpaid LOP!
    const req3 = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-12', endDate: '2026-11-12', reason: 'Req 3' }),
    })
    assert.equal(req3.status, 201)
    assert.equal(req3.body.data.paidUnits, 0)
    assert.equal(req3.body.data.normalLopUnits, 1)
    assert.equal(req3.body.data.casualLeaveUnits, 0)
    assert.equal(req3.body.data.sickLeaveUnits, 0)

    // Balances are strictly preserved: CL reserved=1, SL reserved=1, no negative balance!
    assert.equal(balances[0].reserved, 1)
    assert.equal(balances[1].reserved, 1)
  })

  // -------------------------------------------------------------
  // Test 19: Historical approved records: preserved
  // -------------------------------------------------------------
  test('Case 19: Historical approved records maintain immutable audit trail', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    const mgrHeaders = await authHeader('mgr10@example.test')
    const hrHeaders = await authHeader('hr10@example.test')

    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-10', endDate: '2026-11-10', reason: 'Historical record' }),
    })
    await api(`/leave/team/${sub.body.data.id}/approve`, { method: 'POST', headers: mgrHeaders, body: JSON.stringify({ comment: 'Mgr sign-off' }) })
    await api(`/leave/hr/${sub.body.data.id}/approve`, { method: 'POST', headers: hrHeaders, body: JSON.stringify({ comment: 'HR sign-off' }) })

    const rec = requests.find((r) => r.id === sub.body.data.id)
    assert.equal(rec.status, 'approved')
    assert.equal(rec.approvalHistory.length, 3) // submitted, manager approved, hr approved
    assert.equal(rec.approvalHistory[0].action, 'submitted')
    assert.equal(rec.approvalHistory[1].toStatus, 'pending_hr')
    assert.equal(rec.approvalHistory[2].toStatus, 'approved')
  })

  // -------------------------------------------------------------
  // Test 20: Dashboard, live evaluation & employee history alignment
  // -------------------------------------------------------------
  test('Case 20: POST /evaluate endpoint returns live breakdown matching submission exactly', async () => {
    const empHeaders = await authHeader('emp10@example.test')
    // Evaluate Nov 24 to Nov 27 (4 working days: Tue, Wed, Thu, Fri; employee has 1 CL and 1 SL)
    const evalRes = await api('/leave/evaluate', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-24', endDate: '2026-11-27' }),
    })
    assert.equal(evalRes.status, 200)
    const d = evalRes.body.data
    assert.equal(d.totalUnits, 4)
    assert.equal(d.casualUnits, 1)
    assert.equal(d.sickUnits, 1)
    assert.equal(d.normalLopUnits, 0)
    assert.equal(d.doubleLopUnits, 2) // Nov 26, 27 (Nov 24 is CL, Nov 25 is SL)
    assert.equal(d.isDoubleLop, true)
    assert.equal(d.requiresAdminSignoff, true)

    // Now submit and verify database record has identical units!
    const sub = await api('/leave/requests', {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({ leaveType: 'casual', startDate: '2026-11-24', endDate: '2026-11-27', reason: 'Wedding trip' }),
    })
    assert.equal(sub.status, 201)
    assert.equal(sub.body.data.units, d.totalUnits)
    assert.equal(sub.body.data.casualLeaveUnits, d.casualUnits)
    assert.equal(sub.body.data.sickLeaveUnits, d.sickUnits)
    assert.equal(sub.body.data.normalLopUnits, d.normalLopUnits)
    assert.equal(sub.body.data.doubleLopUnits, d.doubleLopUnits)
    assert.equal(sub.body.data.isDoubleLop, d.isDoubleLop)
  })
})
