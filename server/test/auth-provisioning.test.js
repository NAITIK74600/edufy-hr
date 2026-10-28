import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApp } from '../src/app.js'
import { createUserStore } from '../src/auth/userStore.js'
import { hashPassword } from '../src/auth/passwords.js'

test('Provisioning awaits persistence, returns saved ID, and surfaces save failures', async (t) => {
  const store = createUserStore([{
    id: 'admin-test', email: 'admin@example.test', role: 'admin',
    status: 'active', passwordHash: hashPassword('admin-password'),
  }])
  const addUser = store.addUser
  let failSave = false
  store.addUser = async (user) => {
    await new Promise((resolve) => setTimeout(resolve, 30))
    if (failSave) throw new Error('Persistence failed')
    return addUser({ ...user, id: 'saved-database-id' })
  }
  const server = createApp({ userStore: store, useDatabase: false, jwtSecret: 'test-secret' }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/api/v1/auth`
  async function post(path, body, token) {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    return { status: response.status, body: await response.json() }
  }
  const admin = await post('/login', { email: 'admin@example.test', password: 'admin-password' })
  const token = admin.body.data.token
  const payload = { email: 'employee@example.test', password: 'employee-password', name: 'Employee', role: 'employee' }
  const saved = await post('/users', payload, token)
  assert.equal(saved.status, 201)
  assert.equal(saved.body.data.id, 'saved-database-id')
  assert.equal('passwordHash' in saved.body.data, false)
  const directory = await fetch(`${base}/users`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(directory.status, 200)
  const accounts = (await directory.json()).data
  assert.equal(accounts.find((user) => user.email === payload.email).id, 'saved-database-id')
  assert.equal(accounts.some((user) => 'passwordHash' in user), false)
  const login = await post('/login', payload)
  assert.equal(login.status, 200)
  const forbidden = await fetch(`${base}/users`, { headers: { Authorization: `Bearer ${login.body.data.token}` } })
  assert.equal(forbidden.status, 403)
  const me = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${login.body.data.token}` } })
  assert.equal(me.status, 200)
  assert.equal((await post('/users', payload, token)).status, 409)
  assert.equal((await post('/users', { ...payload, email: 'another@example.test', role: 'admin' }, token)).status, 400)
  failSave = true
  assert.equal((await post('/users', { ...payload, email: 'failed@example.test' }, token)).status, 500)
  assert.equal((await post('/login', { ...payload, email: 'failed@example.test' })).status, 401)
})
