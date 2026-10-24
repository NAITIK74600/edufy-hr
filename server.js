// Root entry point for Webuzo / cPanel / Node.js hosting platforms
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure process working directory is ALWAYS this folder
try { process.chdir(__dirname) } catch {}

const logFile = path.resolve(__dirname, 'webuzo_startup.log')
function log(msg) {
  const line = `[${new Date().toISOString()}] [root server.js] ${msg}\n`
  console.log(msg)
  try { fs.appendFileSync(logFile, line, 'utf8') } catch {}
}

log(`server.js entrypoint triggered. Current directory: ${process.cwd()}`)

try {
  await import('./server/src/server.js')
} catch (error) {
  log(`[FATAL BOOTSTRAP ERROR]: ${error?.stack || error?.message || error}`)
  process.exit(1)
}
