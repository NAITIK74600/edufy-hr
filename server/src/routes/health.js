import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

router.get('/health', async (request, response) => {
  let dbStatus = 'disconnected'
  let dbPingMs = 0
  if (mongoose.connection.readyState === 1) {
    try {
      const start = performance.now()
      await mongoose.connection.db?.admin()?.ping()
      dbPingMs = Math.round(performance.now() - start)
      dbStatus = 'connected'
    } catch {
      dbStatus = 'degraded'
    }
  }

  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.json({
    success: true,
    data: {
      service: 'edufyi-hr-api',
      status: 'ok',
      database: dbStatus,
      dbPingMs,
      uptimeSec: Math.round(process.uptime()),
    },
  })
})

export default router
