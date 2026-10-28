import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { Employee } from '../src/models/Employee.js'
import { hashPassword } from '../src/auth/passwords.js'

test('MongoDB accounts created by env Admin/HR survive an API and database reconnect', {
  skip: !process.env.MONGODB_TEST_URI,
}, async (t) => {
  const dbName = `edufyi_auth_test_${randomUUID().replaceAll('-', '')}`
  let server
  let base
  const uri = process.env.MONGODB_TEST_URI
  async function start() {
    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 5000 })
    await Employee.init()
    server = createApp({ useDatabase: true, jwtSecret: 'isolated-mongo-test-secret' }).listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}/api/v1/auth`
  }
  async function stop() {
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    await mongoose.disconnect()
  }
  async function post(path, body, token) {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    return { status: response.status, body: await response.json() }
  }
  t.after(async () => {
    if (server?.listening) await new Promise((resolve) => server.close(resolve))
    if (mongoose.connection.readyState !== 1) await mongoose.connect(uri, { dbName })
    assert.equal(mongoose.connection.name, dbName)
    await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  })
  await start()
  for (const role of ['admin', 'hr']) {
    const databaseOnly = {
      email: `db-only-${role}@example.test`, employeeId: `DB-${role}`,
      name: 'Database-only management', role, joiningDate: new Date(), status: 'active',
      passwordHash: hashPassword('database-management-password'),
    }
    await Employee.create(databaseOnly)
    assert.equal((await post('/login', { email: databaseOnly.email, password: 'database-management-password' })).status, 401)
  }
  const employees = []
  for (const role of ['ADMIN', 'HR']) {
    assert.ok(process.env[`${role}_EMAIL`] && process.env[`${role}_PASSWORD`], `Configure env ${role} credentials for this test`)
    const management = await post('/login', {
      email: process.env[`${role}_EMAIL`], password: process.env[`${role}_PASSWORD`],
    })
    assert.equal(management.status, 200)
    const token = management.body.data.token
    const employee = {
      email: `${role.toLowerCase()}-created@example.test`,
      employeeId: `TEST-${role}`, name: `${role} Created Employee`,
      role: 'employee', password: randomUUID(),
    }
    const created = await post('/users', employee, token)
    assert.equal(created.status, 201)
    assert.ok(mongoose.isValidObjectId(created.body.data.id))
    assert.equal('passwordHash' in created.body.data, false)
    const record = await Employee.findById(created.body.data.id).select('+passwordHash').lean()
    assert.ok(record.passwordHash)
    assert.notEqual(record.passwordHash, employee.password)
    assert.equal('password' in record, false)
    assert.equal((await post('/users', employee, token)).status, 409)
    assert.equal((await post('/users', { ...employee, email: `duplicate-${employee.email}` }, token)).status, 409)
    const directory = await fetch(`${base}/users`, { headers: { Authorization: `Bearer ${token}` } })
    assert.equal(directory.status, 200)
    assert.ok((await directory.json()).data.some((user) => user.id === created.body.data.id))
    employees.push(employee)
  }
  await stop()
  await start()
  for (const employee of employees) {
    const login = await post('/login', employee)
    assert.equal(login.status, 200)
    const me = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${login.body.data.token}` } })
    assert.equal(me.status, 200)
    assert.equal((await post('/login', { ...employee, password: 'incorrect-password' })).status, 401)
  }
  assert.equal((await post('/login', { email: 'chandanasomaih@edufyitech.in', password: 'Password@123' })).status, 401)
})
