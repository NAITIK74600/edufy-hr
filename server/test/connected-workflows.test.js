import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { Employee } from '../src/models/Employee.js'
import { AttendanceRecord } from '../src/models/AttendanceRecord.js'
import { PayrollRecord } from '../src/models/PayrollRecord.js'

test('People, login, attendance, leave and reviewed payroll share one persisted employee', { skip: !process.env.MONGODB_TEST_URI }, async (t) => {
  const dbName = `edufyi_connected_test_${randomUUID().replaceAll('-', '')}`
  let server
  let base
  async function start() {
    await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName, serverSelectionTimeoutMS: 5000 })
    await Promise.all([Employee.init(), AttendanceRecord.init(), PayrollRecord.init()])
    server = createApp({ useDatabase: true, jwtSecret: 'isolated-workflow-test-secret' }).listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}/api/v1`
  }
  async function request(path, token, body, method = body === undefined ? 'GET' : 'POST') {
    const response = await fetch(`${base}${path}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    return { status: response.status, ...(await response.json()) }
  }
  async function login(email, password) {
    const result = await request('/auth/login', null, { email, password })
    assert.equal(result.status, 200, JSON.stringify(result.error))
    return result.data.token
  }
  t.after(async () => {
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName })
    assert.equal(mongoose.connection.name, dbName)
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })
  await start()
  const hr = await login(process.env.HR_EMAIL, process.env.HR_PASSWORD)
  const network = await request('/attendance/config', hr, { officeNetworkIPs: [{ ip: '127.0.0.1', label: 'Isolated test network' }], attendanceRules: { requireOfficeNetworkAndGps: false } }, 'PATCH')
  assert.equal(network.status, 200)
  const email = 'connected-employee@example.test'
  const password = randomUUID()
  const profile = await request('/employees', hr, { employeeId: 'CONNECTED-001', name: 'Connected Employee', email, joiningDate: '2026-10-01', department: 'Engineering' })
  assert.equal(profile.status, 201, JSON.stringify(profile.error))
  const id = profile.data.id
  const created = await request('/auth/users', hr, { email, password, name: 'Connected Employee' })
  assert.equal(created.status, 201, JSON.stringify(created.error))
  assert.equal(created.data.id, id)
  assert.equal(created.data.employeeId, 'CONNECTED-001')
  assert.equal(await Employee.countDocuments({ email }), 1)
  const employee = await login(email, password)
  const liveController = new AbortController()
  t.after(() => liveController.abort())
  const live = await fetch(`${base}/events`, { headers: { Authorization: `Bearer ${employee}` }, signal: liveController.signal })
  assert.equal(live.status, 200)
  const reader = live.body.getReader()
  assert.match(new TextDecoder().decode((await reader.read()).value), /connected/)
  const savedAt = performance.now()
  const changed = await request(`/employees/${id}`, hr, { department: 'Product' }, 'PATCH')
  assert.equal(changed.status, 200)
  const timeout = setTimeout(() => liveController.abort(), 3000)
  try {
    assert.match(new TextDecoder().decode((await reader.read()).value), /data: changed/)
    assert.ok(performance.now() - savedAt < 3000, 'Employee receives HR changes before polling')
    assert.equal((await request('/auth/me', employee)).data.user.department, 'Product')
  } finally {
    clearTimeout(timeout)
    liveController.abort()
  }
  const other = await request('/auth/users', hr, { email: 'other@example.test', password: randomUUID(), name: 'Other Employee', employeeId: 'OTHER-002' })
  assert.equal(other.status, 201)
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const parallelPunches = await Promise.all(Array.from({ length: 4 }, () => request('/attendance/check-in', employee, { employeeId: 'OTHER-002' })))
  const punch = parallelPunches[0]
  assert.equal(punch.status, 200, JSON.stringify(punch.error))
  assert.equal(parallelPunches.every((result) => result.status === 200 && result.data.id === punch.data.id), true)
  assert.equal(punch.data.employeeId, 'CONNECTED-001')
  assert.equal(String(punch.data.userId), id)
  const repeated = await Promise.all(Array.from({ length: 3 }, () => request('/attendance/check-in', employee, {})))
  assert.equal(repeated.every((result) => result.data.id === punch.data.id), true)
  assert.equal(await AttendanceRecord.countDocuments({ employeeId: 'CONNECTED-001', date }), 1)
  assert.equal((await request('/attendance', employee)).status, 403)
  const roster = await request('/attendance', hr)
  assert.equal(roster.data[0].id, punch.data.id)
  assert.equal((await request('/attendance/check-out', employee, {})).status, 200)
  const completed = (await request('/attendance/self', employee)).data[0]
  assert.ok(completed.checkOutAt)
  assert.equal((await request('/attendance/check-in', employee, {})).data.checkOutAt, completed.checkOutAt)
  const policy = await request('/leave/policies/lop', hr, { label: 'Unpaid Leave', approvalStage: 'hr', configured: true, countWeekends: true, countHolidays: true, requiresReason: true }, 'PUT')
  assert.equal(policy.status, 200, JSON.stringify(policy.error))
  const allowance = await request(`/leave/hr/balances/${id}/lop`, hr, { allowance: 10 }, 'PUT')
  assert.equal(allowance.status, 200, JSON.stringify(allowance.error))
  const leave = await request('/leave/requests', employee, { leaveType: 'lop', startDate: date, endDate: date, reason: 'Personal request' })
  assert.equal(leave.status, 201, JSON.stringify(leave.error))
  assert.equal(leave.data.status, 'pending_hr')
  const approved = await request(`/leave/hr/${leave.data.id}/approve`, hr, { comment: 'Reviewed by HR' })
  assert.equal(approved.status, 200, JSON.stringify(approved.error))
  const balances = await request('/leave/balances', employee)
  assert.equal(balances.data[0].used, 1)
  assert.equal(balances.data[0].reserved, 0)
  const month = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const context = await request(`/payroll/context?employeeId=CONNECTED-001&month=${encodeURIComponent(month)}`, hr)
  assert.equal(context.status, 200)
  assert.equal(context.data.attendanceDays, 1)
  assert.equal(context.data.approvedLeave.length, 1)
  const payroll = { employeeId: 'CONNECTED-001', month, workingDays: 30, paidDays: 29, lopDays: 1, earnings: { basic: 30000 }, deductions: { lossOfPay: 1000 }, notes: 'Attendance and unpaid leave reviewed by HR.' }
  assert.equal((await request('/payroll', employee, payroll)).status, 403)
  const saved = await request('/payroll', hr, payroll)
  assert.equal(saved.status, 200, JSON.stringify(saved.error))
  assert.equal((await request('/payroll', employee)).data.length, 0)
  assert.equal((await request('/payroll/finalize', hr, { month })).status, 200)
  const payslips = await request('/payroll', employee)
  assert.equal(payslips.data.length, 1)
  assert.equal(payslips.data[0].id, saved.data.id)
  assert.equal(payslips.data[0].status, 'processed')
  assert.equal(payslips.data[0].earnings.basic - payslips.data[0].deductions.lossOfPay, 29000)
  assert.equal('paymentDate' in payslips.data[0], false)
  assert.equal((await request('/payroll', hr, payroll)).status, 409)
  assert.equal((await request('/payroll/finalize', hr, { month })).status, 409)
  const updated = await request(`/employees/${id}`, hr, { name: 'Updated Employee' }, 'PATCH')
  assert.equal(updated.status, 200)
  assert.equal((await request('/auth/me', employee)).data.user.displayName, 'Updated Employee')
  await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
  await start()
  const persisted = await login(email, password)
  assert.equal((await request('/attendance/self', persisted)).data.length, 1)
  assert.equal((await request('/leave/self', persisted)).data[0].status, 'approved')
  assert.equal((await request('/payroll', persisted)).data[0].id, saved.data.id)
  const freshHr = await login(process.env.HR_EMAIL, process.env.HR_PASSWORD)
  assert.equal((await request(`/employees/${id}/deactivate`, freshHr, {})).status, 200)
  assert.equal((await request('/auth/me', persisted)).status, 401)
  assert.equal((await request('/auth/login', null, { email, password })).status, 401)
})
