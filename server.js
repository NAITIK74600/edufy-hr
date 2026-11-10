// Root entry point for Webuzo / cPanel / Node.js hosting platforms
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Set production environment by default
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

// Ensure process working directory is ALWAYS this folder
try { process.chdir(__dirname) } catch {}

const logFile = path.resolve(__dirname, 'webuzo_startup.log')
function log(msg) {
  const line = `[${new Date().toISOString()}] [root server.js] ${msg}\n`
  console.log(msg)
  try { fs.appendFileSync(logFile, line, 'utf8') } catch {}
}

// Pre-load .env into process.env before any ES Module imports
const candidateEnvPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
  '/home/admin_edufytech/EDUFYIONE/.env',
  '/home/admin_edufytech/edufyione/.env',
]

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath)
      }
    } catch {}
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n')
      for (const l of lines) {
        const line = l.trim()
        if (line && !line.startsWith('#') && line.includes('=')) {
          const idx = line.indexOf('=')
          const key = line.slice(0, idx).trim()
          const val = line.slice(idx + 1).trim()
          if (key && (!process.env[key] || process.env[key].trim() === '')) {
            process.env[key] = val
          }
        }
      }
      log(`Loaded environment from: ${envPath}`)
      break
    } catch (err) {
      log(`Failed reading .env (${envPath}): ${err.message}`)
    }
  }
}

log(`server.js entrypoint triggered. Current directory: ${process.cwd()}`)

try {
  await import('./server/src/server.js')
} catch (error) {
  log(`[FATAL BOOTSTRAP ERROR]: ${error?.stack || error?.message || error}`)
  process.exit(1)
}
