import fs from 'node:fs'
import { createApp } from './app.js'
import { connectDatabase } from './db/connect.js'
import { warmOnboardingDocsCache } from './models/onboardingDocsCache.js'
import { fileURLToPath } from 'node:url'

import path from 'node:path'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..', '..')

// Always ensure current working directory is project root
try { process.chdir(rootDir) } catch {}

const logPath = path.resolve(rootDir, 'webuzo_startup.log')
const isDev = (process.env.NODE_ENV || '').startsWith('dev')
function logStartup(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`
  console.log(msg)
  // Skip file write in dev mode to avoid triggering --watch restarts
  if (!isDev) { try { fs.appendFileSync(logPath, line, 'utf8') } catch {} }
}

logStartup(`Starting Edufyi HR Server... (rootDir=${rootDir}, cwd=${process.cwd()}, Node=${process.version})`)

// Auto-load .env if available
try { process.loadEnvFile?.() } catch {}
const envCandidatePaths = [
  path.resolve(rootDir, '.env'),
  path.resolve(process.cwd(), '.env'),
]
for (const envPath of envCandidatePaths) {
  if (fs.existsSync(envPath)) {
    try {
      const envLines = fs.readFileSync(envPath, 'utf8').split('\n')
      for (const line of envLines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...v] = trimmed.split('=')
          const key = k.trim()
          if (key && !process.env[key]) {
            process.env[key] = v.join('=').trim()
          }
        }
      }
      logStartup(`Loaded environment from: ${envPath}`)
      break
    } catch (e) {
      logStartup(`Failed reading ${envPath}: ${e.message}`)
    }
  }
}

const rawPort = process.env.PORT || 3000
const isUnixSocket = typeof rawPort === 'string' && (rawPort.startsWith('/') || rawPort.includes('.sock') || rawPort.startsWith('\\\\.\\pipe'))
const port = isUnixSocket ? rawPort : Number(rawPort || 3000)
logStartup(`Configured Listen Target: ${port} (Type: ${isUnixSocket ? 'Unix Socket' : 'TCP Port'})`)

if (!process.env.JWT_SECRET) {
  const secretPath = path.resolve(rootDir, '.jwt_secret')
  try {
    if (fs.existsSync(secretPath)) process.env.JWT_SECRET = fs.readFileSync(secretPath, 'utf8').trim()
  } catch {}
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'edufyi-secure-jwt-key-' + crypto.randomBytes(32).toString('hex')
    try { fs.writeFileSync(secretPath, process.env.JWT_SECRET, { mode: 0o600 }) } catch {}
    logStartup('[WARN] JWT_SECRET was not set; generated one and saved it to .jwt_secret so logins survive restarts. Set JWT_SECRET in .env to override.')
  }
}

// A configured database must connect; never silently lose accounts in a temporary store.
let useDatabase = false
try {
  useDatabase = await connectDatabase()
  if (!useDatabase) logStartup('MongoDB is not configured (MONGODB_URI is empty).')
  else logStartup('MongoDB connected successfully.')
} catch (error) {
  logStartup(`[WARN] Could not connect to MongoDB: ${error.message}`)
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
  logStartup(`[SERVER UNCAUGHT EXCEPTION]: ${err?.stack || err?.message || err}`)
})

process.on('unhandledRejection', (reason) => {
  logStartup(`[SERVER UNHANDLED REJECTION]: ${reason?.stack || reason?.message || reason}`)
})

// If listening on a Unix Domain Socket (e.g. OpenLiteSpeed App Server), clean dead socket before listening
if (isUnixSocket) {
  try {
    if (fs.existsSync(port)) fs.unlinkSync(port)
  } catch {}
}

const listenArgs = isUnixSocket ? [port] : [port, '0.0.0.0']

const server = app.listen(...listenArgs, () => {
  if (isUnixSocket) {
    try { fs.chmodSync(port, 0o777) } catch {}
    logStartup(`🚀 Edufyi HR API successfully listening on Unix Domain Socket: ${port} (database: ${useDatabase ? 'MongoDB' : 'In-Memory Store'})`)
  } else {
    logStartup(`🚀 Edufyi HR API successfully listening on http://0.0.0.0:${port} (database: ${useDatabase ? 'MongoDB' : 'In-Memory Store'})`)
  }
  if (useDatabase) warmOnboardingDocsCache().catch((error) => logStartup(`Onboarding docs cache warm-up failed: ${error.message}`))
})

// Enable persistent HTTP Keep-Alive to eliminate TCP+TLS handshake latency on every request
server.keepAliveTimeout = 65000
server.headersTimeout = 66000
server.requestTimeout = 30000

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logStartup(`[FATAL] Port/Socket ${port} is already in use by another process. Please close conflicting process and restart.`)
    process.exit(1)
  } else {
    logStartup(`[API Server Error]: ${err?.stack || err?.message || err}`)
  }
})

