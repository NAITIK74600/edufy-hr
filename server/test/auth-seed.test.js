import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { createSeedUsers } from '../src/auth/seedUsers.js'

const secret = 'test-only-jwt-secret'
let server
let baseUrl

beforeEach(async () => {
  // No userStore / AUTH_USERS_JSON provided => app falls back to dev seed users (non-production).
  delete process.env.MONGODB_URI
  process.env.NODE_ENV = 'development'
  // Only env-configured admin & HR accounts are seeded. Everyone else must be created through admin.
  process.env.ADMIN_EMAIL = 'admin@edufyi.local'
  process.env.HR_EMAIL = 'hr@edufyi.local'
  process.env.ADMIN_PASSWORD = 'Password@123'
  process.env.HR_PASSWORD = 'Password@123'
  delete process.env.SEED_MANAGER_PASSWORD
  delete process.env.SEED_EMPLOYEE_PASSWORD
  server = createApp({ jwtSecret: secret }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
})

afterEach(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
})

async function post(path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = response.status === 204 ? null : await response.json()
  return { response, body: payload }
}

test('Only env-configured admin & HR seed accounts authenticate; demo manager/employee do NOT exist', async () => {
  const accounts = [
    { email: 'admin@edufyi.local', role: 'admin' },
    { email: 'hr@edufyi.local', role: 'hr' },
  ]
  for (const acc of accounts) {
    const result = await post('/auth/login', { email: acc.email, password: 'Password@123' })
    assert.equal(result.response.status, 200, `${acc.email} should log in`)
    assert.equal(result.body.data.user.role, acc.role)
    assert.ok(result.body.data.token)
    assert.equal('passwordHash' in result.body.data.user, false)
  }

  // Previously seeded demo accounts must no longer exist.
  for (const email of ['sarah.chen@edufyi.local', 'chandanasomaih@edufyitech.in']) {
    const result = await post('/auth/login', { email, password: 'Password@123' })
    assert.equal(result.response.status, 401, `${email} must NOT be able to log in`)
    assert.equal(result.body.error.code, 'INVALID_CREDENTIALS')
  }
})

test('Without MongoDB, provisioning fails explicitly instead of creating a temporary account', async () => {
  const adminLogin = await post('/auth/login', { email: 'admin@edufyi.local', password: 'Password@123' })
  const token = adminLogin.body.data.token

  const created = await post('/auth/users', {
    email: 'new.hire@edufyi.local',
    password: 'Welcome@456',
    name: 'New Hire',
    role: 'employee',
  }, { authorization: `Bearer ${token}` })
  assert.equal(created.response.status, 503)
  assert.equal(created.body.error.code, 'DATABASE_UNAVAILABLE')

  const login = await post('/auth/login', { email: 'new.hire@edufyi.local', password: 'Welcome@456' })
  assert.equal(login.response.status, 401)

  const rejected = await post('/auth/login', { email: 'ghost@edufyi.local', password: 'Welcome@456' })
  assert.equal(rejected.response.status, 401)
  const profile = await post('/employees', {
    name: 'Cannot Persist', email: 'unsaved@example.test', employeeId: 'UNSAVED-001', joiningDate: '2026-10-01',
  }, { authorization: `Bearer ${token}` })
  assert.equal(profile.response.status, 503, 'People cannot report success from a temporary repository')
})

test('Production management credentials require explicit env email and password', () => {
  const configured = createSeedUsers({
    NODE_ENV: 'production',
    ADMIN_EMAIL: 'configured@example.test',
    ADMIN_PASSWORD: 'configured-password',
    HR_EMAIL: 'people@example.test',
    HR_PASSWORD: 'people-password',
  })
  assert.deepEqual(configured.map((u) => u.email), ['configured@example.test', 'people@example.test'])
  assert.deepEqual(createSeedUsers({ NODE_ENV: 'production', ADMIN_PASSWORD: 'no-email' }), [])
})

test('Invented email aliases do not authenticate', async () => {
  const result = await post('/auth/login', { email: 'admin@edufyi.in', password: 'Password@123' })
  assert.equal(result.response.status, 401)
})

test('Former universal backdoor passwords are REJECTED', async () => {
  for (const password of ['admin123', 'hr123', 'manager123', 'employee123']) {
    const result = await post('/auth/login', { email: 'admin@edufyi.local', password })
    assert.equal(result.response.status, 401, `backdoor '${password}' must be rejected`)
    assert.equal(result.body.error.code, 'INVALID_CREDENTIALS')
  }
})

test('Unknown emails and wrong passwords get a generic 401 (no account enumeration)', async () => {
  const unknown = await post('/auth/login', { email: 'nobody@edufyi.local', password: 'Password@123' })
  const wrong = await post('/auth/login', { email: 'admin@edufyi.local', password: 'totally-wrong' })
  assert.equal(unknown.response.status, 401)
  assert.equal(wrong.response.status, 401)
  assert.equal(unknown.body.error.message, wrong.body.error.message)
})
