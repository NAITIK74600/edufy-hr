import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/auth/passwords.js'
import { PERMISSIONS } from '../src/auth/permissions.js'
import { createUserStore } from '../src/auth/userStore.js'

const secret = 'test-only-leave-secret'
let server
let baseUrl
let employees
let requests
let balances
let policies
let notifications

function createMemoryEmployeeRepository() {
  return { findById: async (id) => employees.find((employee) => employee.id === id) ?? null, list: async () => ({ records: employees, meta: { page: 1, limit: 20, total: employees.length } }) }
}

function createMemoryLeaveRepository() {
  return {
    async listRequests(filters = {}) { return requests.filter((request) => (!filters.employeeId || request.employeeId === filters.employeeId) && (!filters.managerId || request.managerId === filters.managerId) && (!filters.status || request.status === filters.status) && (!filters.leaveType || request.leaveType === filters.leaveType)) },
    async findRequest(id) { return requests.find((request) => request.id === id) ?? null },
    async createRequest(data) { const request = { id: `leave-${requests.length + 1}`, ...data, comments: data.comments ?? [], approvalHistory: data.approvalHistory ?? [] }; requests.push(request); return request },
    async transitionRequest(id, expectedStatuses, update) { const request = requests.find((entry) => entry.id === id && expectedStatuses.includes(entry.status)); if (!request) return null; Object.assign(request, update.set ?? {}); if (update.push) request.approvalHistory.push(update.push); return request },
    async appendComment(id, comment) { const request = requests.find((entry) => entry.id === id); request.comments.push(comment); request.approvalHistory.push({ action: 'commented', actorId: comment.actorId, actorRole: comment.actorRole, comment: comment.body, createdAt: new Date() }); return request },
    async findOverlap({ employeeId, startDate, endDate, excludeId }) { return requests.find((request) => request.employeeId === employeeId && request.id !== excludeId && ['pending_manager', 'pending_hr', 'pending_admin', 'approved'].includes(request.status) && new Date(request.startDate) <= endDate && new Date(request.endDate) >= startDate) ?? null },
    async getPolicy(leaveType) { return policies.find((policy) => policy.leaveType === leaveType) ?? null },
    async listPolicies() { return policies },
    async savePolicy(leaveType, values) { const policy = { leaveType, ...values }; policies = policies.filter((entry) => entry.leaveType !== leaveType).concat(policy); return policy },
    async getBalance(employeeId, leaveType) { return balances.find((balance) => balance.employeeId === employeeId && balance.leaveType === leaveType) ?? null },
    async listBalances(filters = {}) { return balances.filter((balance) => (!filters.employeeId || balance.employeeId === filters.employeeId) && (!filters.leaveType || balance.leaveType === filters.leaveType)) },
    async reserveBalance(employeeId, leaveType, units) { const balance = balances.find((entry) => entry.employeeId === employeeId && entry.leaveType === leaveType); if (!balance || balance.allowance - balance.used - balance.reserved < units) return null; balance.reserved += units; return balance },
    async releaseReservation(employeeId, leaveType, units) { const balance = balances.find((entry) => entry.employeeId === employeeId && entry.leaveType === leaveType); if (balance) balance.reserved -= units; return balance },
    async commitReservation(employeeId, leaveType, units) { const balance = balances.find((entry) => entry.employeeId === employeeId && entry.leaveType === leaveType); if (balance) { balance.reserved -= units; balance.used += units }; return balance },
    async notify(data) { notifications.push(data); return data },
  }
}

const users = [
  { id: 'manager-1', email: 'manager@example.test', displayName: 'Manager', role: 'manager', status: 'active', permissions: [PERMISSIONS.LEAVE_TEAM_READ, PERMISSIONS.LEAVE_TEAM_APPROVE], passwordHash: hashPassword('manager-password') },
  { id: 'employee-1', email: 'employee@example.test', displayName: 'Employee', role: 'employee', status: 'active', permissions: [], passwordHash: hashPassword('employee-password') },
  { id: 'other-manager', email: 'other-manager@example.test', displayName: 'Other manager', role: 'manager', status: 'active', permissions: [PERMISSIONS.LEAVE_TEAM_READ, PERMISSIONS.LEAVE_TEAM_APPROVE], passwordHash: hashPassword('manager-password') },
  { id: 'hr-1', email: 'hr@example.test', displayName: 'HR', role: 'hr', status: 'active', permissions: [PERMISSIONS.LEAVE_HR_READ, PERMISSIONS.LEAVE_HR_REVIEW, PERMISSIONS.LEAVE_POLICY_ADMIN], passwordHash: hashPassword('hr-password') },
  { id: 'admin-1', email: 'admin@example.test', displayName: 'Admin', role: 'admin', status: 'active', permissions: [PERMISSIONS.ADMIN_ACCESS, PERMISSIONS.LEAVE_HR_READ, PERMISSIONS.LEAVE_HR_REVIEW], passwordHash: hashPassword('admin-password') },
]

beforeEach(async () => {
  employees = [{ id: 'employee-1', name: 'Employee', managerId: 'manager-1', status: 'active' }, { id: 'manager-1', name: 'Manager', managerId: null, status: 'active' }, { id: 'other-manager', name: 'Other manager', managerId: null, status: 'active' }, { id: 'hr-1', name: 'HR', managerId: null, status: 'active' }, { id: 'admin-1', name: 'Admin', managerId: null, status: 'active' }]
  requests = []
  balances = [{ employeeId: 'employee-1', leaveType: 'annual', allowance: 10, used: 0, reserved: 0 }]
  policies = [{ leaveType: 'annual', label: 'Annual leave', configured: true, approvalStage: 'manager_hr', countWeekends: false, countHolidays: false, requiresReason: true, allowCancellationAfterApproval: false, allowAmendment: false }]
  notifications = []
  server = createApp({ userStore: createUserStore(users), employeeRepository: createMemoryEmployeeRepository(), leaveRepository: createMemoryLeaveRepository(), jwtSecret: secret }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
})

afterEach(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type': 'application/json', ...options.headers } })
  return { response, body: response.status === 204 ? null : await response.json() }
}

async function login(email, password) {
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  return result.body.data.token
}

const leavePayload = { leaveType: 'annual', startDate: '2026-10-12', endDate: '2026-10-13', reason: 'Personal appointment' }

test('employee can submit a policy-controlled request and manager scope excludes other employees', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  const submitted = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify(leavePayload) })
  assert.equal(submitted.response.status, 201)
  assert.equal(submitted.body.data.status, 'pending_manager')
  assert.equal(balances[0].reserved, 2)
  assert.equal(notifications[0].event, 'leave.submitted')
  const managerToken = await login('manager@example.test', 'manager-password')
  const team = await request('/leave/team', { headers: { authorization: `Bearer ${managerToken}` } })
  assert.equal(team.response.status, 200)
  assert.equal(team.body.data.length, 1)
  const otherManagerToken = await login('other-manager@example.test', 'manager-password')
  const forbidden = await request(`/leave/requests/${submitted.body.data.id}?scope=team`, { headers: { authorization: `Bearer ${otherManagerToken}` } })
  assert.equal(forbidden.response.status, 403)
})

test('overlap and missing rejection reason are rejected', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  const first = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify(leavePayload) })
  const overlap = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify({ ...leavePayload, startDate: '2026-10-13', endDate: '2026-10-14' }) })
  assert.equal(first.response.status, 201)
  assert.equal(overlap.response.status, 409)
  assert.equal(overlap.body.error.fields.canCancelExisting, true)
  assert.equal(overlap.body.error.fields.overlappingRequestId, first.body.data.id)

  const replaced = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify({ ...leavePayload, startDate: '2026-10-13', endDate: '2026-10-14', replaceOverlap: true }) })
  assert.equal(replaced.response.status, 201)
  assert.equal(replaced.body.data.status, 'pending_manager')

  const managerToken = await login('manager@example.test', 'manager-password')
  const reject = await request(`/leave/team/${replaced.body.data.id}/reject`, { method: 'POST', headers: { authorization: `Bearer ${managerToken}` }, body: JSON.stringify({}) })
  assert.equal(reject.response.status, 400)
  assert.equal(reject.body.error.code, 'REJECTION_REASON_REQUIRED')
})

test('manager approval advances to HR and duplicate decisions are blocked', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  const submitted = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify(leavePayload) })
  const managerToken = await login('manager@example.test', 'manager-password')
  const approved = await request(`/leave/team/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${managerToken}` }, body: JSON.stringify({ comment: 'Coverage confirmed' }) })
  const duplicate = await request(`/leave/team/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${managerToken}` }, body: JSON.stringify({}) })
  assert.equal(approved.response.status, 200)
  assert.equal(approved.body.data.status, 'pending_hr')
  assert.equal(duplicate.response.status, 403)
  const hrToken = await login('hr@example.test', 'hr-password')
  const final = await request(`/leave/hr/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${hrToken}` }, body: JSON.stringify({}) })
  assert.equal(final.response.status, 200)
  assert.equal(final.body.data.status, 'approved')
  assert.equal(balances[0].used, 2)
})

test('25th month LOP leave requires HR review then admin approval before becoming approved', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  // Request leave on the 25th of the month
  const lopPayload = { leaveType: 'annual', startDate: '2026-10-25', endDate: '2026-10-26', reason: 'Month-end urgent leave' }
  const submitted = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify(lopPayload) })
  assert.equal(submitted.response.status, 201)
  assert.equal(submitted.body.data.status, 'pending_hr')

  // HR reviews and approves -> status moves to pending_admin (escalated to Admin panel)
  const hrToken = await login('hr@example.test', 'hr-password')
  const hrApproved = await request(`/leave/hr/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${hrToken}` }, body: JSON.stringify({ comment: 'HR verified 25th month LOP' }) })
  assert.equal(hrApproved.response.status, 200)
  assert.equal(hrApproved.body.data.status, 'pending_admin')

  // Admin approves from admin panel -> status moves to approved
  const adminToken = await login('admin@example.test', 'admin-password')
  const adminApproved = await request(`/leave/admin/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ comment: 'Admin approved 25th month LOP' }) })
  assert.equal(adminApproved.response.status, 200)
  assert.equal(adminApproved.body.data.status, 'approved')
  assert.equal(adminApproved.body.data.adminApprovedBy, 'Admin')
})

test('regular leave before 25th does not go to pending_admin', async () => {
  const employeeToken = await login('employee@example.test', 'employee-password')
  // Request leave on Oct 5 to 6 (strictly before 25th)
  const regularPayload = { leaveType: 'annual', startDate: '2026-10-05', endDate: '2026-10-06', reason: 'Routine casual day' }
  const submitted = await request('/leave/requests', { method: 'POST', headers: { authorization: `Bearer ${employeeToken}` }, body: JSON.stringify(regularPayload) })
  assert.equal(submitted.response.status, 201)
  assert.equal(submitted.body.data.status, 'pending_manager')

  const managerToken = await login('manager@example.test', 'manager-password')
  const managerApproved = await request(`/leave/team/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${managerToken}` }, body: JSON.stringify({ comment: 'Approved' }) })
  assert.equal(managerApproved.response.status, 200)
  assert.equal(managerApproved.body.data.status, 'pending_hr')

  // When HR approves regular leave, it transitions directly to approved (never pending_admin)
  const hrToken = await login('hr@example.test', 'hr-password')
  const hrApproved = await request(`/leave/hr/${submitted.body.data.id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${hrToken}` }, body: JSON.stringify({ comment: 'Final HR approval' }) })
  assert.equal(hrApproved.response.status, 200)
  assert.equal(hrApproved.body.data.status, 'approved')
})

