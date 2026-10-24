import fs from 'node:fs'
import { createApp } from './app.js'
import { connectDatabase } from './db/connect.js'
import { warmOnboardingDocsCache } from './models/onboardingDocsCache.js'
import { fileURLToPath } from 'node:url'

import path from 'node:path'
import crypto from 'node:crypto'

// Auto-load .env if available
try { process.loadEnvFile?.() } catch {}
if (!process.env.MONGODB_URI && fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  try {
    const envLines = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8').split('\n')
    for (const line of envLines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=')
        if (k && !process.env[k.trim()]) process.env[k.trim()] = v.join('=').trim()
      }
    }
  } catch {}
}

const port = Number(process.env.PORT ?? 4001)

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'edufyi-secure-jwt-key-' + crypto.randomBytes(32).toString('hex')
  console.warn('[WARN] JWT_SECRET was not set in environment; auto-generated random key.')
}

// A configured database must connect; never silently lose accounts in a temporary store.
let useDatabase = false
try {
  useDatabase = await connectDatabase()
  if (!useDatabase) console.warn('MongoDB is not configured (MONGODB_URI is empty).')
} catch (error) {
  console.error('\n[WARN] Could not connect to MongoDB:', error.message)
  try {
    fs.writeFileSync(path.resolve(process.cwd(), 'startup_error.log'), `[MONGODB ERROR] ${new Date().toISOString()}: ${error.stack || error.message}\n`, { flag: 'a' })
  } catch {}
  // Don't crash immediately; continue with fallback userStore
}

const candidateDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  fileURLToPath(new URL('../../dist/', import.meta.url)),
  fileURLToPath(new URL('../dist/', import.meta.url)),
  path.resolve(process.cwd(), '..', 'public_html', 'empoyee'),
  path.resolve(process.cwd(), '..', 'public_html'),
]

let staticDirectory = null
for (const cand of candidateDistPaths) {
  try {
    if (cand && fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
      staticDirectory = cand
      break
    }
  } catch {}
}

console.log('[INFO] Static directory resolved to:', staticDirectory)

const app = createApp({ useDatabase, staticDirectory })
if (useDatabase) {
  try {
    await app.locals.initializeDatabase()
  } catch (error) {
    console.error('\n[WARN] Database initialization notice:', error.message)
  }
}
process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]:', err?.message || err)
})

process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]:', reason?.message || reason)
})

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Edufyi HR API listening on http://0.0.0.0:${port} (database: ${useDatabase ? 'MongoDB' : 'In-Memory Store'})`)
  if (useDatabase) warmOnboardingDocsCache().catch((error) => console.warn('Onboarding docs cache warm-up failed:', error.message))
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[FATAL] Port ${port} is already in use by another process. Please close conflicting process and restart.\n`)
    process.exit(1)
  } else {
    console.error('[API Server Error]:', err?.message || err)
  }
})

