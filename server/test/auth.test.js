import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/auth/passwords.js'
import { PERMISSIONS } from '../src/auth/permissions.js'
import { createUserStore } from '../src/auth/userStore.js'

const secret = 'test-only-jwt-secret'
let server
let baseUrl

const users = [
  { id: 'admin-1', email: 'admin@example.test', displayName: 'Admin', role: 'admin', status: 'active', permissions: [], passwordHash: hashPassword('admin-password') },
  { id: 'hr-1', email: 'hr@example.test', displayName: 'HR', role: 'hr', status: 'active', permissions: [PERMISSIONS.EMPLOYEES_READ], passwordHash: hashPassword('hr-password') },
  { id: 'manager-1', email: 'manager@example.test', displayName: 'Manager', role: 'manager', status: 'active', permissions: [PERMISSIONS.LEAVE_TEAM_READ], passwordHash: hashPassword('manager-password') },
  { id: 'employee-1', email: 'employee@example.test', displayName: 'Employee', role: 'employee', status: 'active', managerId: 'manager-1', permissions: [], passwordHash: hashPassword('employee-password') },
  { id: 'employee-2', email: 'other@example.test', displayName: 'Other employee', role: 'employee', status: 'active', managerId: 'other-manager', permissions: [], passwordHash: hashPassword('employee-password') },
  { id: 'inactive-1', email: 'inactive@example.test', displayName: 'Inactive', role: 'employee', status: 'inactive', permissions: [], passwordHash: hashPassword('inactive-password') },
]

const employeeRepository = {
  list: async () => ({ records: [], meta: { page: 1, limit: 20, total: 0 } }),
  findById: async () => null,
  findForUpdate: async () => null,
  findManager: async () => null,
  create: async () => null,
  save: async () => null,
  listAudit: async () => [],
  addAudit: async () => null,
}

beforeEach(async () => {
  server = createApp({ userStore: createUserStore(users), employeeRepository, jwtSecret: secret }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
})

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

async function request(path, options = {}) {
  const { headers, ...rest } = options
  const response = await fetch(`${baseUrl}${path}`, { headers: { 'content-type': 'application/json', ...headers }, ...rest })
  const body = response.status === 204 ? null : await response.json()
  return { response, body }
}

async function login(email, password) {
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  assert.equal(result.response.status, 200)
  return result.body.data.token
}

test('login returns a short-lived token and safe user data', async () => {
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'employee@example.test', password: 'employee-password', role: 'admin', permissions: ['*'] }) })
  assert.equal(result.response.status, 200)
  assert.equal(result.body.data.user.role, 'employee')
  assert.ok(result.body.data.token)
  assert.equal('passwordHash' in result.body.data.user, false)
  assert.deepEqual(result.body.data.user.permissions, [PERMISSIONS.DASHBOARD_READ, PERMISSIONS.LEAVE_SELF_READ, PERMISSIONS.LEAVE_SELF_WRITE, PERMISSIONS.ATTENDANCE_SELF_READ, PERMISSIONS.PAYROLL_SELF_READ, PERMISSIONS.TASKS_READ, PERMISSIONS.TRAINING_READ, PERMISSIONS.HELPDESK_READ, PERMISSIONS.ANNOUNCEMENTS_READ, PERMISSIONS.HOLIDAYS_READ, PERMISSIONS.DOCUMENTS_READ])
})

test('login allows authenticating via username, email, or employee ID', async () => {
  // Login with username / prefix
  const usernameLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier: 'admin', password: 'admin-password' }) })
  assert.equal(usernameLogin.response.status, 200)
  assert.equal(usernameLogin.body.data.user.role, 'admin')

  // Login with HR username
  const hrLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ username: 'hr', password: 'hr-password' }) })
  assert.equal(hrLogin.response.status, 200)
  assert.equal(hrLogin.body.data.user.role, 'hr')

  // Login with email
  const emailLogin = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'manager@example.test', password: 'manager-password' }) })
  assert.equal(emailLogin.response.status, 200)
  assert.equal(emailLogin.body.data.user.role, 'manager')
})

test('login uses a generic error for unknown and inactive accounts', async () => {
  const unknown = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'missing@example.test', password: 'wrong' }) })
  const inactive = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'inactive@example.test', password: 'inactive-password' }) })
  assert.equal(unknown.response.status, 401)
  assert.equal(inactive.response.status, 401)
  assert.equal(unknown.body.error.message, inactive.body.error.message)
})

test('protected APIs return safe 401 and permission-aware 403 responses', async () => {
  const unauthenticated = await request('/employees')
  assert.equal(unauthenticated.response.status, 401)
  const employeeToken = await login('employee@example.test', 'employee-password')
  const forbidden = await request('/employees', { headers: { authorization: `Bearer ${employeeToken}` } })
  assert.equal(forbidden.response.status, 403)
  assert.equal(forbidden.body.error.code, 'FORBIDDEN')
})

test('HR permissions are explicit and admin has broad access', async () => {
  const hrToken = await login('hr@example.test', 'hr-password')
  const people = await request('/employees', { headers: { authorization: `Bearer ${hrToken}` } })
  const payroll = await request('/payroll', { headers: { authorization: `Bearer ${hrToken}` } })
  assert.equal(people.response.status, 200)
  assert.equal(payroll.response.status, 403)
  const adminToken = await login('admin@example.test', 'admin-password')
  const adminPayroll = await request('/hr/dashboard', { headers: { authorization: `Bearer ${adminToken}` } })
  assert.equal(adminPayroll.response.status, 200)
})

test('dashboard summary is protected and does not fabricate metrics without a data source', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  const forbidden = await request('/hr/dashboard/summary', { headers: { authorization: `Bearer ${employeeToken}` } })
  assert.equal(forbidden.response.status, 403)
  const adminToken = await login('admin@example.test', 'admin-password')
  const summary = await request('/hr/dashboard/summary', { headers: { authorization: `Bearer ${adminToken}` } })
  assert.equal(summary.response.status, 200)
  assert.equal(summary.body.data.source, 'unavailable')
  assert.equal(summary.body.data.metrics.every((metric) => metric.value === null), true)
  assert.equal(summary.body.data.recentActivity.length, 0)
})

test('manager access is limited to trusted direct reports', async () => {
  const token = await login('manager@example.test', 'manager-password')
  const directReport = await request('/team-leave/employee-1', { headers: { authorization: `Bearer ${token}` } })
  const otherEmployee = await request('/team-leave/employee-2', { headers: { authorization: `Bearer ${token}` } })
  assert.equal(directReport.response.status, 200)
  assert.equal(otherEmployee.response.status, 403)
})

test('logout revokes the access token', async () => {
  const token = await login('employee@example.test', 'employee-password')
  const logout = await request('/auth/logout', { method: 'POST', headers: { authorization: `Bearer ${token}` } })
  const afterLogout = await request('/auth/me', { headers: { authorization: `Bearer ${token}` } })
  assert.equal(logout.response.status, 204)
  assert.equal(afterLogout.response.status, 401)
})

test('strict portal separation rejects employee login to admin/hr and admin to employee', async () => {
  // Employee trying to log into admin portal
  const empToAdmin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'employee@example.test', password: 'employee-password', portal: 'admin' }),
  })
  assert.equal(empToAdmin.response.status, 403)
  assert.equal(empToAdmin.body.error.code, 'PORTAL_ACCESS_DENIED')

  // Employee trying to log into hr portal
  const empToHr = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'employee@example.test', password: 'employee-password', portal: 'hr' }),
  })
  assert.equal(empToHr.response.status, 403)
  assert.equal(empToHr.body.error.code, 'PORTAL_ACCESS_DENIED')

  // HR trying to log into admin portal
  const hrToAdmin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'hr@example.test', password: 'hr-password', portal: 'admin' }),
  })
  assert.equal(hrToAdmin.response.status, 403)
  assert.equal(hrToAdmin.body.error.code, 'PORTAL_ACCESS_DENIED')

  // Admin trying to log into employee portal
  const adminToEmp = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.test', password: 'admin-password', portal: 'employee' }),
  })
  assert.equal(adminToEmp.response.status, 403)
  assert.equal(adminToEmp.body.error.code, 'PORTAL_ACCESS_DENIED')

  // Successful valid portal logins
  const validAdmin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.test', password: 'admin-password', portal: 'admin' }),
  })
  assert.equal(validAdmin.response.status, 200)

  const validHr = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'hr@example.test', password: 'hr-password', portal: 'hr' }),
  })
  assert.equal(validHr.response.status, 200)

  const validEmp = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'employee@example.test', password: 'employee-password', portal: 'employee' }),
  })
  assert.equal(validEmp.response.status, 200)
})

test('authenticated user can change password and log in with new password', async () => {
  const token = await login('employee@example.test', 'employee-password')

  // Validation: short password rejected
  const shortResult = await request('/auth/change-password', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: 'employee-password', newPassword: 'short' }),
  })
  assert.equal(shortResult.response.status, 400)

  // Validation: wrong current password rejected
  const wrongCurrent = await request('/auth/change-password', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: 'wrong-password', newPassword: 'BrandNewPassword@2026' }),
  })
  assert.equal(wrongCurrent.response.status, 400)

  // Successful change
  const successResult = await request('/auth/change-password', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: 'employee-password', newPassword: 'BrandNewPassword@2026' }),
  })
  assert.equal(successResult.response.status, 200)
  assert.equal(successResult.body.success, true)

  // Old password now rejected
  const oldLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'employee@example.test', password: 'employee-password' }),
  })
  assert.equal(oldLogin.response.status, 401)

  // New password accepted
  const newLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'employee@example.test', password: 'BrandNewPassword@2026' }),
  })
  assert.equal(newLogin.response.status, 200)
  assert.ok(newLogin.body.data.token)
})

