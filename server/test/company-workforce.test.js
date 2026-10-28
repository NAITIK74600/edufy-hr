import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { Employee } from '../src/models/Employee.js'
import { AttendanceRecord } from '../src/models/AttendanceRecord.js'

test('One-company People and User Accounts remain linked across creation, updates, reset and restart', { skip: !process.env.MONGODB_TEST_URI }, async (t) => {
  const dbName = `edufyi_company_test_${randomUUID().replaceAll('-', '')}`
  const environment = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'HR_EMAIL', 'HR_PASSWORD']
  const previous = Object.fromEntries(environment.map((key) => [key, process.env[key]]))
  const adminPassword = randomUUID()
  const hrPassword = randomUUID()
  Object.assign(process.env, {
    ADMIN_EMAIL: 'company-admin@example.test', ADMIN_PASSWORD: adminPassword,
    HR_EMAIL: 'company-hr@example.test', HR_PASSWORD: hrPassword,
  })
  let server
  let base
  async function start() {
    await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName, serverSelectionTimeoutMS: 5000 })
    const app = createApp({ useDatabase: true, jwtSecret: 'isolated-company-test-secret' })
    await app.locals.initializeDatabase()
    server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}/api/v1`
  }
  async function stop() {
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    await mongoose.disconnect()
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
    return result.data
  }
  t.after(async () => {
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGODB_TEST_URI, { dbName })
    assert.equal(mongoose.connection.name, dbName)
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
    for (const key of environment) {
      if (previous[key] === undefined) delete process.env[key]
      else process.env[key] = previous[key]
    }
  })
  await start()
  const hr = await login(process.env.HR_EMAIL, hrPassword)
  const admin = await login(process.env.ADMIN_EMAIL, adminPassword)
  assert.ok(mongoose.isValidObjectId(hr.user.id))
  assert.ok(mongoose.isValidObjectId(admin.user.id))
  const directory = await request('/employees', hr.token)
  assert.equal(directory.data.length, 2, 'Admin and HR are actual company employee records')
  for (const employee of directory.data) {
    assert.equal(employee.hasLogin, true)
    assert.equal('passwordHash' in employee, false)
    assert.equal('authVersion' in employee, false)
  }
  assert.equal((await request(`/employees/${hr.user.id}/deactivate`, hr.token, {})).status, 400)
  const manager = await request('/employees', hr.token, {
    employeeId: 'COMPANY-MGR-001', name: 'Team Manager', email: 'company-manager@example.test',
    role: 'manager', status: 'active', joiningDate: '2026-10-01', managerId: hr.user.id,
    department: 'Engineering', designation: 'Team Lead', salary: 1800000,
  })
  assert.equal(manager.status, 201, JSON.stringify(manager.error))
  assert.equal(manager.data.role, 'manager')
  assert.equal(manager.data.salary, 1800000)
  assert.equal(manager.data.hasLogin, false)
  const managerPassword = randomUUID()
  const conflict = await request('/auth/users', hr.token, {
    email: manager.data.email, employeeId: manager.data.employeeId, role: 'employee', password: managerPassword,
  })
  assert.equal(conflict.status, 409, 'Login cannot silently downgrade a manager')
  assert.equal((await Employee.findById(manager.data.id).select('+passwordHash')).passwordHash, undefined)
  const managerAccount = await request('/auth/users', hr.token, { email: manager.data.email, password: managerPassword })
  assert.equal(managerAccount.status, 201, JSON.stringify(managerAccount.error))
  assert.equal(managerAccount.data.id, manager.data.id)
  assert.equal(managerAccount.data.role, 'manager')
  assert.equal(managerAccount.data.department, 'Engineering', 'Credential provisioning preserves profile details')
  const profile = await request('/employees', hr.token, {
    employeeId: 'COMPANY-EMP-001', name: 'New Employee', email: 'company-employee@example.test',
    joiningDate: '2026-10-01', role: 'employee', status: 'active', managerId: manager.data.id,
    department: 'Engineering', designation: 'Engineer', salary: 0,
    bankDetails: { bankName: 'Employee Bank', accountNumber: '000123456', ifscCode: 'TEST0000001' },
  })
  assert.equal(profile.status, 201, JSON.stringify(profile.error))
  const password = randomUUID()
  const account = await request('/auth/users', hr.token, { email: profile.data.email, password })
  assert.equal(account.status, 201, JSON.stringify(account.error))
  assert.equal(account.data.id, profile.data.id)
  assert.equal(await Employee.countDocuments({ email: profile.data.email }), 1)
  assert.equal((await request('/employees', hr.token)).data.find((record) => record.id === profile.data.id).hasLogin, true)
  let employee = await login(profile.data.email, password)
  const task = await request('/workspace/tasks', hr.token, {
    title: 'Linked task', assigneeId: profile.data.id, category: 'General', priority: 'Medium', dueDate: '2026-10-10',
  })
  assert.equal(task.status, 201, JSON.stringify(task.error))
  assert.equal(task.data.assigneeRef, profile.data.id)
  const goal = await request('/workspace/performanceGoals', hr.token, {
    employeeId: profile.data.id, title: 'Linked goal', target: 'Ship release', dueDate: '2026-10-10', progress: 0,
  })
  assert.equal(goal.status, 201, JSON.stringify(goal.error))
  await AttendanceRecord.create({ userId: profile.data.id, employeeId: profile.data.employeeId, employeeName: profile.data.name, date: '2026-10-03', status: 'present' })
  const updated = await request(`/employees/${profile.data.id}`, hr.token, {
    name: 'Updated Employee', department: 'Product', salary: 1234567, managerId: hr.user.id,
    bankDetails: { bankName: 'Updated Bank', accountNumber: '000987654', ifscCode: 'TEST0000002' },
  }, 'PATCH')
  assert.equal(updated.status, 200, JSON.stringify(updated.error))
  assert.equal(updated.data.salary, 1234567)
  assert.equal(updated.data.managerId.id ?? updated.data.managerId._id, hr.user.id)
  assert.equal(updated.data.hasLogin, true)
  const me = (await request('/auth/me', employee.token)).data.user
  assert.equal(me.name, 'Updated Employee')
  assert.equal(me.department, 'Product')
  assert.equal(me.bankDetails.accountNumber, '000987654')
  const snapshot = (await request('/workspace/snapshot', employee.token)).data
  assert.equal(snapshot.tasks[0].assigneeName, 'Updated Employee')
  assert.equal(snapshot.performanceGoals[0].employeeName, 'Updated Employee')
  assert.equal(snapshot.performanceGoals[0].employeeId, profile.data.employeeId)
  const attendance = await request('/attendance/self', employee.token)
  assert.equal(attendance.data[0].employeeName, 'Updated Employee')
  assert.equal(attendance.data[0].userId, profile.data.id)
  const hierarchy = await request('/hierarchy', hr.token)
  assert.equal(hierarchy.status, 200)
  assert.ok(JSON.stringify(hierarchy.data.roots).includes('Updated Employee'))
  const changedRole = await request(`/employees/${profile.data.id}`, hr.token, { role: 'manager' }, 'PATCH')
  assert.equal(changedRole.status, 200)
  assert.equal((await request('/auth/me', employee.token)).status, 401, 'Role changes invalidate old sessions')
  employee = await login(profile.data.email, password)
  assert.equal(employee.user.role, 'manager')
  const replacementPassword = randomUUID()
  assert.equal((await request(`/auth/users/${profile.data.id}/password`, employee.token, { password: replacementPassword })).status, 403)
  assert.equal((await request(`/auth/users/${hr.user.id}/password`, admin.token, { password: replacementPassword })).status, 400)
  assert.equal((await request(`/auth/users/${profile.data.id}/password`, hr.token, { password: replacementPassword })).status, 200)
  assert.equal((await request('/auth/me', employee.token)).status, 401)
  assert.equal((await request('/auth/login', null, { email: profile.data.email, password })).status, 401)
  employee = await login(profile.data.email, replacementPassword)
  assert.equal((await request(`/employees/${profile.data.id}/deactivate`, hr.token, {})).status, 200)
  assert.equal((await request('/auth/me', employee.token)).status, 401)
  assert.equal((await request(`/employees/${profile.data.id}/activate`, hr.token, {})).status, 200)
  assert.equal((await request('/auth/me', employee.token)).status, 401, 'Reactivation does not revive old sessions')
  await stop()
  await start()
  const reconnectedHr = await login(process.env.HR_EMAIL, hrPassword)
  assert.equal(reconnectedHr.user.id, hr.user.id)
  assert.equal(await Employee.countDocuments({ role: 'hr' }), 1)
  employee = await login(profile.data.email, replacementPassword)
  assert.equal(employee.user.salary, 1234567)
  assert.equal((await request('/workspace/snapshot', employee.token)).data.tasks[0].id, task.data.id)
  const allAccounts = await request('/auth/users', reconnectedHr.token)
  assert.equal(allAccounts.data.find((record) => record.id === profile.data.id).name, 'Updated Employee')
  assert.equal(allAccounts.data.some((record) => 'passwordHash' in record || 'authVersion' in record), false)
})
