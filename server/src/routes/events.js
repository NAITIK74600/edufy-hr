import express from 'express'

export function createDataEvents(auth) {
  const router = express.Router()
  const clients = new Set()
  // ponytail: one API process; polling reconciles other instances until a shared event bus is needed.
  function changed(request, response, next) {
    const path = request.originalUrl.split('?')[0].replace(/^\/api\/v1/, '')
    const readOnly = ['/attendance/verify', '/auth/login', '/auth/logout'].includes(path)
    if (!readOnly && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
      response.once('finish', () => {
        if (response.statusCode < 200 || response.statusCode >= 300 || !request.auth) return
        for (const client of clients) {
          try {
            if (!client.writableEnded && !client.destroyed) {
              if (!client.write('data: changed\n\n')) client.end()
            } else {
              clients.delete(client)
            }
          } catch {
            clients.delete(client)
          }
        }
      })
    }
    next()
  }
  router.get('/events', auth.authenticate, (request, response) => {
    response.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    })
    response.flushHeaders()

    let heartbeat = null
    let expiry = null

    const cleanup = () => {
      clients.delete(response)
      if (heartbeat) clearInterval(heartbeat)
      if (expiry) clearTimeout(expiry)
    }

    response.on('error', cleanup)
    response.once('close', cleanup)
    response.once('finish', cleanup)

    try {
      response.write('data: connected\n\n')
      clients.add(response)
    } catch {
      cleanup()
      return
    }

    heartbeat = setInterval(() => {
      try {
        if (!response.writableEnded && !response.destroyed) {
          response.write(': heartbeat\n\n')
        } else {
          cleanup()
        }
      } catch {
        cleanup()
      }
    }, 15000)

    const remaining = request.auth.claims.exp * 1000 - Date.now()
    expiry = setTimeout(() => {
      try {
        if (!response.writableEnded && !response.destroyed) response.end()
      } catch {}
      cleanup()
    }, Math.max(0, Math.min(60000, remaining)))
  })
  return { router, changed }
}
