import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { hashPassword } from '../src/auth/passwords.js'
import { createUserStore } from '../src/auth/userStore.js'

const secret = 'test-only-employee-secret'
let server
let baseUrl
let records
let audit

function createMemoryRepository() {
  return {
    async list({ page = 1, limit = 20, search } = {}) {
      const filtered = search ? records.filter((employee) => `${employee.name} ${employee.email} ${employee.employeeId}`.toLowerCase().includes(search.toLowerCase())) : records
      return { records: filtered.slice(0, limit), meta: { page: Number(page), limit: Number(limit), total: filtered.length } }
    },
    async findById(id) { return records.find((employee) => employee.id === id || employee.employeeId === id) ?? null },
    async findForUpdate(id) { return records.find((employee) => employee.id === id || employee.employeeId === id) ?? null },
    async findManager(id) { return records.find((employee) => employee.id === id && ['admin', 'hr', 'manager'].includes(employee.role) && employee.status === 'active') ?? null },
    async create(data) {
      if (records.some((employee) => employee.employeeId === data.employeeId || employee.email === data.email)) { const error = new Error('duplicate'); error.code = 11000; throw error }
      const employee = { id: `employee-${records.length + 1}`, ...data, documents: [], employmentHistory: [], onboardingChecklist: [], offboardingChecklist: [] }
      records.push(employee)
      return employee
    },
    async save(employee) { return employee },
    async listAudit(id) { return audit.filter((entry) => entry.entityId === id) },
    async addAudit(entry) { audit.push({ id: `audit-${audit.length + 1}`, ...entry }); return entry },
  }
}

const users = [
  { id: 'admin-1', email: 'admin@example.test', displayName: 'Admin', role: 'admin', status: 'active', permissions: [], passwordHash: hashPassword('admin-password') },
  { id: 'hr-1', email: 'hr@example.test', displayName: 'HR', role: 'hr', status: 'active', permissions: ['employees.read', 'employees.write'], passwordHash: hashPassword('hr-password') },
  { id: 'employee-1', email: 'employee@example.test', displayName: 'Employee', role: 'employee', status: 'active', permissions: [], passwordHash: hashPassword('employee-password') },
]

beforeEach(async () => {
  records = []
  audit = []
  server = createApp({ userStore: createUserStore(users), employeeRepository: createMemoryRepository(), jwtSecret: secret }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
})

afterEach(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))

async function request(path, options = {}) {
  const { headers, ...requestOptions } = options
  const response = await fetch(`${baseUrl}${path}`, { ...requestOptions, headers: { 'content-type': 'application/json', ...headers } })
  const body = response.status === 204 ? null : await response.json()
  return { response, body }
}

async function login(email, password) {
  const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  return result.body.data.token
}

const employeePayload = { employeeId: 'EF-001', name: 'Asha Rao', email: 'asha@example.test', designation: 'Designer', department: 'Product', joiningDate: '2026-01-15', employmentType: 'full_time' }

test('People manager assignment rejects cycles before saving the shared record', async () => {
  records.push(
    { id: 'manager-a', role: 'manager', status: 'active', name: 'A', managerId: null },
    { id: 'manager-b', role: 'manager', status: 'active', name: 'B', managerId: 'manager-a' },
  )
  const token = await login('hr@example.test', 'hr-password')
  const result = await request('/employees/manager-a', {
    method: 'PATCH', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ managerId: 'manager-b' }),
  })
  assert.equal(result.response.status, 400)
  assert.match(result.body.error.message, /Circular/)
  assert.equal(records[0].managerId, null)
})

test('employee list rejects unauthenticated access and returns paginated records for HR', async () => {
  const denied = await request('/employees')
  assert.equal(denied.response.status, 401)
  const token = await login('hr@example.test', 'hr-password')
  const created = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(employeePayload) })
  assert.equal(created.response.status, 201)
  const list = await request('/employees?page=1&limit=10&search=Asha', { headers: { authorization: `Bearer ${token}` } })
  assert.equal(list.response.status, 200)
  assert.equal(list.body.data[0].email, 'asha@example.test')
  assert.equal(list.body.meta.total, 1)
})

test('employee creation validates required fields and rejects protected mass assignment', async () => {
  const token = await login('hr@example.test', 'hr-password')
  const invalid = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Incomplete' }) })
  const escalated = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify({ ...employeePayload, role: 'admin', permissions: ['*'], salary: 999999 }) })
  assert.equal(invalid.response.status, 400)
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR')
  assert.equal(escalated.response.status, 400)
  assert.match(escalated.body.error.message, /cannot be changed/)
})

test('employee detail, audit, duplicate prevention, and deactivation are persisted through the repository', async () => {
  const token = await login('hr@example.test', 'hr-password')
  const created = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(employeePayload) })
  const id = created.body.data.id
  const duplicate = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(employeePayload) })
  const detail = await request(`/employees/${id}`, { headers: { authorization: `Bearer ${token}` } })
  const deactivated = await request(`/employees/${id}/deactivate`, { method: 'POST', headers: { authorization: `Bearer ${token}` } })
  const history = await request(`/employees/${id}/audit`, { headers: { authorization: `Bearer ${token}` } })
  assert.equal(duplicate.response.status, 409)
  assert.equal(detail.response.status, 200)
  assert.equal(deactivated.body.data.status, 'inactive')
  assert.equal(history.body.data.length, 2)
})

test('employees cannot access or edit HR employee records directly', async () => {
  const token = await login('employee@example.test', 'employee-password')
  const list = await request('/employees', { headers: { authorization: `Bearer ${token}` } })
  const create = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(employeePayload) })
  assert.equal(list.response.status, 403)
  assert.equal(create.response.status, 403)
})

test('Employee profile saves role, status, salary and bank details together with payroll authorization', async () => {
  const admin = await login('admin@example.test', 'admin-password')
  const payload = { ...employeePayload, role: 'manager', status: 'active', salary: 1200000, bankDetails: { bankName: 'Test Bank', accountNumber: '001234' } }
  const created = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${admin}` }, body: JSON.stringify(payload) })
  assert.equal(created.response.status, 201)
  assert.equal(created.body.data.role, 'manager')
  assert.equal(created.body.data.status, 'active')
  assert.equal(created.body.data.salary, 1200000)
  assert.equal(created.body.data.bankDetails.accountNumber, '001234')
  const hr = await login('hr@example.test', 'hr-password')
  const denied = await request(`/employees/${created.body.data.id}`, {
    method: 'PATCH', headers: { authorization: `Bearer ${hr}` }, body: JSON.stringify({ name: 'Must Not Save', salary: 999 }),
  })
  assert.equal(denied.response.status, 403)
  assert.equal(records[0].name, employeePayload.name, 'A denied salary update cannot partly change the profile')
  const invalid = await request('/employees', { method: 'POST', headers: { authorization: `Bearer ${admin}` }, body: JSON.stringify({ ...payload, employeeId: 'OTHER', salary: -1 }) })
  assert.equal(invalid.response.status, 400)
  assert.equal(records.length, 1)
  const updated = await request(`/employees/${created.body.data.id}`, {
    method: 'PATCH', headers: { authorization: `Bearer ${admin}` }, body: JSON.stringify({ role: 'employee', status: 'inactive', salary: 0 }),
  })
  assert.equal(updated.response.status, 200)
  assert.equal(updated.body.data.role, 'employee')
  assert.equal(updated.body.data.status, 'inactive')
  assert.equal(updated.body.data.salary, 0)
})

test('HR document approval and rejection workflow with mandatory reason and status transition', async () => {
  const hr = await login('hr@example.test', 'hr-password')
  const emp = await login('employee@example.test', 'employee-password')
  
  // Create an employee
  const created = await request('/employees', {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
    body: JSON.stringify({
      employeeId: 'DOC-EMP-01',
      name: 'Rohan Sharma',
      email: 'rohan@example.test',
      designation: 'Engineer',
      department: 'Technology',
      joiningDate: '2026-02-01',
      employmentType: 'full_time',
      onboardingDocs: {
        panCard: {
          status: 'submitted',
          fileName: 'pan_card.pdf',
          url: 'data:application/pdf;base64,JVBERi0xLjQKJcFsj60KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCg==',
          submittedAt: new Date().toISOString(),
        },
      },
    }),
  })
  assert.equal(created.response.status, 201)
  const id = created.body.data.id

  // Unauthorized user (regular employee) cannot approve or reject
  const deniedApprove = await request(`/employees/${id}/documents/panCard/approve`, {
    method: 'POST',
    headers: { authorization: `Bearer ${emp}` },
  })
  assert.equal(deniedApprove.response.status, 403)

  // Rejection without reason is rejected with 400
  const noReasonReject = await request(`/employees/${id}/documents/panCard/reject`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
    body: JSON.stringify({ reason: '' }),
  })
  assert.equal(noReasonReject.response.status, 400)
  assert.match(noReasonReject.body.error.message, /Rejection reason is required/)

  // Rejection with reason succeeds, updates document and onboardingStatus
  const rejected = await request(`/employees/${id}/documents/panCard/reject`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
    body: JSON.stringify({ reason: 'PAN image is blurry and name is truncated.' }),
  })
  assert.equal(rejected.response.status, 200)
  assert.equal(rejected.body.data.onboardingDocs.panCard.status, 'rejected')
  assert.equal(rejected.body.data.onboardingDocs.panCard.rejectionReason, 'PAN image is blurry and name is truncated.')
  assert.equal(rejected.body.data.onboardingStatus, 'action_required')
  assert.equal(rejected.body.data.onboardingRejectionReason, 'PAN image is blurry and name is truncated.')

  // HR approves document
  const approved = await request(`/employees/${id}/documents/panCard/approve`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
    body: JSON.stringify({ comments: 'Verified successfully.' }),
  })
  assert.equal(approved.response.status, 200)
  assert.equal(approved.body.data.onboardingDocs.panCard.status, 'verified')
  assert.equal(approved.body.data.onboardingDocs.panCard.rejectionReason, null)
  assert.equal(approved.body.data.onboardingStatus, 'verified')

  // Overall onboarding rejection with reason
  const onboardingReject = await request(`/employees/${id}/onboarding/reject`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
    body: JSON.stringify({ reason: 'Bank passbook details missing.' }),
  })
  assert.equal(onboardingReject.response.status, 200)
  assert.equal(onboardingReject.body.data.onboardingStatus, 'action_required')
  assert.equal(onboardingReject.body.data.onboardingRejectionReason, 'Bank passbook details missing.')

  // Overall onboarding approval
  const onboardingApprove = await request(`/employees/${id}/onboarding/approve`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
  })
  assert.equal(onboardingApprove.response.status, 200)
  assert.equal(onboardingApprove.body.data.onboardingStatus, 'verified')
  assert.equal(onboardingApprove.body.data.onboardingRejectionReason, null)

  // Strict Security: HR user cannot self-verify or self-approve their own onboarding dossier
  const hrRecord = await request('/employees', {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
    body: JSON.stringify({
      employeeId: 'HR-SELF-001',
      name: 'HR User',
      email: 'hr@example.test',
      joiningDate: '2026-01-01',
      role: 'hr',
      status: 'active',
      onboardingDocs: { panCard: { status: 'submitted', fileName: 'pan.pdf', url: 'data:application/pdf;base64,abc' } },
    }),
  })
  assert.equal(hrRecord.response.status, 201)
  const hrEmpId = hrRecord.body.data.id

  const selfApprove = await request(`/employees/${hrEmpId}/onboarding/approve`, {
    method: 'POST',
    headers: { authorization: `Bearer ${hr}` },
  })
  assert.equal(selfApprove.response.status, 403)
  assert.equal(selfApprove.body.error.code, 'FORBIDDEN_SELF_VERIFICATION')
})
test('updating employee code, phone, salary, and bank details succeeds and returns non-null data', async () => {
  const adminToken = await login('admin@example.test', 'admin-password')

  // Create an employee with initial values
  const created = await request('/employees', {
    method: 'POST',
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      employeeId: 'EMP-NUM-01',
      name: 'Roster Member',
      email: 'roster.member@example.test',
      phone: '9876543210',
      joiningDate: '2026-01-01',
      role: 'employee',
      status: 'active',
      salary: 180000,
      salaryStructure: { basic: 15000, hra: 0, conveyance: 0, specialAllowance: 0, otherAllowance: 0 },
      bankDetails: { bankName: 'HDFC Bank', accountNumber: '123456789012', ifscCode: 'HDFC0001234', panTaxId: 'ABCDE1234F', uanNumber: '100123456789' },
    }),
  })
  assert.equal(created.response.status, 201)
  assert.ok(created.body.data)
  const id = created.body.data.id

  // 1. Update salary, bank account number, and phone number by ID
  const updated1 = await request(`/employees/${id}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      phone: '9876543211',
      salary: 240000,
      bankDetails: { bankName: 'SBI', accountNumber: '998877665544', ifscCode: 'SBIN0005678', panTaxId: 'XYZPD9876K', uanNumber: '100998877665' },
    }),
  })
  assert.equal(updated1.response.status, 200)
  assert.ok(updated1.body.data, 'Updated response must contain non-null data')
  assert.equal(updated1.body.data.phone, '9876543211')
  assert.equal(updated1.body.data.salary, 240000)
  assert.equal(updated1.body.data.bankDetails?.accountNumber, '998877665544')

  // 2. Update employeeId code from EMP-NUM-01 to EMP-NUM-02 by employeeId string
  const updated2 = await request('/employees/EMP-NUM-01', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      employeeId: 'EMP-NUM-02',
    }),
  })
  assert.equal(updated2.response.status, 200)
  assert.ok(updated2.body.data, 'Updated response must contain non-null data even when employeeId changed')
  assert.equal(updated2.body.data.employeeId, 'EMP-NUM-02')
})
