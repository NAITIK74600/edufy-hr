import assert from 'node:assert/strict'
import { test } from 'node:test'
import express from 'express'
import { createDataEvents } from '../src/routes/events.js'

test('Live invalidations require authentication and follow only successful persisted mutations', async (t) => {
  const auth = {
    authenticate(request, response, next) {
      if (request.get('authorization') !== 'Bearer test') return response.sendStatus(401)
      request.auth = { user: { id: 'test' }, claims: { exp: Math.floor(Date.now() / 1000) + 60 } }
      next()
    },
  }
  const app = express()
  const events = createDataEvents(auth)
  app.use(events.changed, events.router)
  app.post('/save', auth.authenticate, (request, response) => response.status(201).json({ saved: true }))
  app.post('/failed', auth.authenticate, (request, response) => response.sendStatus(400))
  app.post('/attendance/verify', auth.authenticate, (request, response) => response.json({ verified: false }))
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const controller = new AbortController()
  t.after(async () => {
    controller.abort()
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  })
  const url = `http://127.0.0.1:${server.address().port}`
  assert.equal((await fetch(`${url}/events`)).status, 401)
  const response = await fetch(`${url}/events`, { headers: { authorization: 'Bearer test' }, signal: controller.signal })
  assert.match(response.headers.get('content-type'), /text\/event-stream/)
  const reader = response.body.getReader()
  assert.match(new TextDecoder().decode((await reader.read()).value), /data: connected/)
  await fetch(`${url}/failed`, { method: 'POST', headers: { authorization: 'Bearer test' } })
  await fetch(`${url}/attendance/verify`, { method: 'POST', headers: { authorization: 'Bearer test' } })
  const started = performance.now()
  await fetch(`${url}/save`, { method: 'POST', headers: { authorization: 'Bearer test' } })
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const message = new TextDecoder().decode((await reader.read()).value)
    assert.equal(message, 'data: changed\n\n', 'Failed saves must not emit invalidations')
    assert.ok(performance.now() - started < 3000, 'Saved updates must arrive without polling')
  } finally { clearTimeout(timeout) }
})
