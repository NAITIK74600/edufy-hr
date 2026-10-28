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
  { id: 'admin-1', email: 'admin@example.test', displayName: 'Admin', role: 'admin', status: 'active', permissions: ['*'], passwordHash: hashPassword('admin-password') },
  { id: 'hr-1', email: 'hr@example.test', displayName: 'HR', role: 'hr', status: 'active', permissions: [PERMISSIONS.EMPLOYEES_READ, PERMISSIONS.EMPLOYEES_WRITE], passwordHash: hashPassword('hr-password') },
  { id: 'employee-1', email: 'employee@example.test', displayName: 'Employee', role: 'employee', status: 'active', permissions: [], passwordHash: hashPassword('employee-password') },
  { id: 'lead-1', email: 'lead@example.test', displayName: 'Vikram Malhotra', role: 'manager', status: 'active', permissions: [], passwordHash: hashPassword('lead-password') },
  { id: 'dev-1', email: 'dev1@example.test', displayName: 'Chandana Somaih', role: 'employee', status: 'active', permissions: [], passwordHash: hashPassword('dev-password') },
]

let employees = []

function createTestRepo() {
  return {
    async list() { return { records: [...employees], meta: { total: employees.length } } },
    async findById(id) { return employees.find(e => e.id === id || e._id === id) || null },
    async findForUpdate(id) {
      const found = employees.find(e => e.id === id || e._id === id)
      if (!found) return null
      return { ...found }
    },
    async save(emp) {
      const idx = employees.findIndex(e => e.id === emp.id || e._id === emp.id)
      if (idx !== -1) employees[idx] = { ...emp }
      return emp
    },
    async addAudit() {},
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  const text = await response.text()
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  }
}

async function login(email, password) {
  const result = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return result.body.data.token
}

beforeEach(async () => {
  employees = [
    { id: 'ceo-1', employeeId: 'EMP-001', name: 'Eleanor Vance', department: 'Executive', designation: 'CEO', status: 'active', managerId: null },
    { id: 'dir-1', employeeId: 'EMP-002', name: 'Sarah Chen', department: 'Technology', designation: 'Engineering Director', status: 'active', managerId: 'ceo-1' },
    { id: 'lead-1', employeeId: 'EMP-003', name: 'Vikram Malhotra', department: 'Technology', designation: 'Team Lead', status: 'active', managerId: 'dir-1' },
    { id: 'dev-1', employeeId: 'EMP-004', name: 'Chandana Somaih', department: 'Technology', designation: 'Senior Developer', status: 'active', managerId: 'lead-1' },
    { id: 'dev-2', employeeId: 'EMP-005', name: 'Arjun Mehta', department: 'Technology', designation: 'Junior Developer', status: 'active', managerId: 'lead-1' },
    { id: 'hr-mgr-1', employeeId: 'EMP-006', name: 'Maya Lin', department: 'Human Resources', designation: 'HR Manager', status: 'active', managerId: 'ceo-1' },
  ]

  const app = createApp({
    userStore: createUserStore(users),
    jwtSecret: secret,
    employeeRepository: createTestRepo(),
  })

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server.address()
      baseUrl = `http://127.0.0.1:${address.port}`
      resolve()
    })
  })
})

afterEach(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
})

test('hierarchy API returns complete organization tree and stats', async () => {
  const token = await login('admin@example.test', 'admin-password')
  const res = await request('/api/v1/hierarchy', {
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.roots.length, 1) // CEO is root
  const root = res.body.data.roots[0]
  assert.equal(root.name, 'Eleanor Vance')
  assert.equal(root.directReportCount, 2) // Sarah Chen & Maya Lin
  assert.equal(root.totalTeamCount, 5) // Sarah, Vikram, Alex, Arjun, Maya
})

test('Employee directory shares reporting links without private compensation or credentials', async () => {
  employees[0].salary = 500000
  employees[0].bankDetails = { accountNumber: 'private' }
  employees[0].passwordHash = 'private'
  employees[1].managerId = { _id: 'ceo-1', name: 'Eleanor Vance' }
  const token = await login('employee@example.test', 'employee-password')
  const result = await request('/api/v1/hierarchy/directory', { headers: { authorization: `Bearer ${token}` } })
  assert.equal(result.status, 200)
  assert.equal(result.body.data.length, employees.length)
  assert.equal(result.body.data[1].managerId, 'ceo-1')
  assert.equal('salary' in result.body.data[0], false)
  assert.equal('bankDetails' in result.body.data[0], false)
  assert.equal('passwordHash' in result.body.data[0], false)
})

test('hierarchy department API returns department subtree', async () => {
  const token = await login('admin@example.test', 'admin-password')
  const res = await request('/api/v1/hierarchy/department/Technology', {
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.department, 'Technology')
  assert.equal(res.body.data.root.name, 'Sarah Chen')
  assert.equal(res.body.data.root.directReportCount, 1) // Vikram
  assert.equal(res.body.data.root.totalTeamCount, 3) // Vikram, Alex, Arjun
})

test('hierarchy chain API returns breadcrumb from root to employee', async () => {
  const token = await login('admin@example.test', 'admin-password')
  const res = await request('/api/v1/hierarchy/chain/dev-1', {
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  const chain = res.body.data.chain
  assert.equal(chain.length, 4)
  assert.equal(chain[0].name, 'Eleanor Vance')
  assert.equal(chain[1].name, 'Sarah Chen')
  assert.equal(chain[2].name, 'Vikram Malhotra')
  assert.equal(chain[3].name, 'Chandana Somaih')
})

test('hierarchy rejects circular reporting assignment with 400', async () => {
  const token = await login('admin@example.test', 'admin-password')

  // Attempting to make Sarah Chen report to Chandana Somaih (who is her indirect report!)
  const res = await request('/api/v1/hierarchy/manager', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ employeeId: 'dir-1', newManagerId: 'dev-1' }),
  })

  assert.equal(res.status, 400)
  assert.equal(res.body.success, false)
  assert.equal(res.body.error.code, 'CIRCULAR_DEPENDENCY')
})

test('hierarchy updates manager successfully for valid reporting changes', async () => {
  const token = await login('admin@example.test', 'admin-password')

  // Move Arjun Mehta (dev-2) to report directly to Sarah Chen (dir-1)
  const res = await request('/api/v1/hierarchy/manager', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ employeeId: 'dev-2', newManagerId: 'dir-1' }),
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(employees.find(e => e.id === 'dev-2').managerId, 'dir-1')
})

test('hierarchy rejects unauthorized manager update', async () => {
  const token = await login('employee@example.test', 'employee-password')

  const res = await request('/api/v1/hierarchy/manager', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ employeeId: 'dev-2', newManagerId: 'dir-1' }),
  })

  assert.equal(res.status, 403)
})

test('manager sees strictly upward reporting line and downward reports without peer branches', async () => {
  const token = await login('lead@example.test', 'lead-password')
  const res = await request('/api/v1/hierarchy', {
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.scoped, true)

  // Upward chain: Eleanor Vance (CEO) -> Sarah Chen (Dir) -> Vikram Malhotra (Lead)
  const chain = res.body.data.chain
  assert.equal(chain.length, 3)
  assert.equal(chain[0].name, 'Eleanor Vance')
  assert.equal(chain[1].name, 'Sarah Chen')
  assert.equal(chain[2].name, 'Vikram Malhotra')

  // Top root of tree is Eleanor Vance
  const roots = res.body.data.roots
  assert.equal(roots.length, 1)
  const ceo = roots[0]
  assert.equal(ceo.name, 'Eleanor Vance')
  // Sibling HR branch (Maya Lin) is completely excluded!
  assert.equal(ceo.children.length, 1)
  const dir = ceo.children[0]
  assert.equal(dir.name, 'Sarah Chen')
  // Sarah has only Vikram visible (no peer leads)
  assert.equal(dir.children.length, 1)
  const lead = dir.children[0]
  assert.equal(lead.name, 'Vikram Malhotra')
  // Under Vikram are his direct reports: Chandana and Arjun
  assert.equal(lead.children.length, 2)
  const reportNames = lead.children.map(c => c.name)
  assert.ok(reportNames.includes('Chandana Somaih'))
  assert.ok(reportNames.includes('Arjun Mehta'))

  // Scoped stats count only the 5 visible members
  assert.equal(res.body.data.stats.totalEmployees, 5)
})

test('employee sees only upward reporting line and themselves without peers', async () => {
  const token = await login('dev1@example.test', 'dev-password')
  const res = await request('/api/v1/hierarchy', {
    headers: { authorization: `Bearer ${token}` },
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.scoped, true)

  const roots = res.body.data.roots
  assert.equal(roots.length, 1)
  const ceo = roots[0]
  assert.equal(ceo.children.length, 1)
  const dir = ceo.children[0]
  assert.equal(dir.children.length, 1)
  const lead = dir.children[0]
  // Under lead, only dev-1 is visible, peer dev-2 (Arjun Mehta) is excluded!
  assert.equal(lead.children.length, 1)
  assert.equal(lead.children[0].name, 'Chandana Somaih')
  assert.equal(lead.children[0].children.length, 0)
})

