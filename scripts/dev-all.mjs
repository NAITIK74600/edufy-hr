import { spawn, execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

function freePort(port) {
  if (process.platform !== 'win32') return
  const killedPids = new Set()

  const shouldIgnore = (pid) => {
    if (!pid || pid === '0') return true
    const num = Number(pid)
    if (num === process.pid) return true
    if (serverProcess?.pid && num === serverProcess.pid) return true
    if (viteProcess?.pid && num === viteProcess.pid) return true
    return false
  }

  // Fast path: netstat takes <15ms
  try {
    const output = execSync(`netstat -ano -p tcp | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 3000 })
    for (const line of output.trim().split('\n')) {
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && /^\d+$/.test(pid) && !shouldIgnore(pid) && !killedPids.has(pid)) {
        try {
          execSync(`taskkill /T /F /PID ${pid} >nul 2>&1`, { stdio: 'ignore' })
          killedPids.add(pid)
          console.log(`[INFO] Cleared previous process tree on port ${port} (PID ${pid})`)
        } catch {}
      }
    }
  } catch {}

  // Fallback: PowerShell Get-NetTCPConnection if still bound
  if (killedPids.size === 0) {
    try {
      const psOutput = execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
        { encoding: 'utf8', timeout: 3000 }
      )
      for (const raw of psOutput.trim().split('\n')) {
        const pid = raw.trim()
        if (pid && /^\d+$/.test(pid) && !shouldIgnore(pid) && !killedPids.has(pid)) {
          try {
            execSync(`taskkill /T /F /PID ${pid} >nul 2>&1`, { stdio: 'ignore' })
            killedPids.add(pid)
            console.log(`[INFO] Cleared previous process tree on port ${port} (PID ${pid})`)
          } catch {}
        }
      }
    } catch {}
  }
}

// Free ports from previous crashed or orphaned sessions
freePort(4001)
freePort(5173)
freePort(5174)

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces()
  const ips = []
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address })
      }
    }
  }
  ips.sort((a, b) => {
    const aPref = /wi-?fi|ethernet|wlan|lan/i.test(a.name) ? -1 : 1
    const bPref = /wi-?fi|ethernet|wlan|lan/i.test(b.name) ? -1 : 1
    return aPref - bPref
  })
  return ips
}

const networkIps = getLocalIpAddresses()

console.log('===================================================================')
console.log('             EDUFYA HR MANAGEMENT SYSTEM & ESS PORTAL')
console.log('                 (Local & Network Wi-Fi Access)')
console.log('===================================================================')
console.log('  Backend REST API : http://localhost:4001/api/v1')
console.log('  Frontend URL     : (shown below by Vite once it starts)')
if (networkIps.length > 0) {
  console.log(`  Your LAN IP      : ${networkIps[0].address}  (${networkIps[0].name})`)
  console.log('  > Vite will also show a Network URL you can open on phones/tablets!')
}
console.log('  Press Ctrl+C at any time to stop both servers.')
console.log('===================================================================\n')

let serverProcess = null
let isShuttingDown = false
let backendRestartCount = 0
const MAX_BACKEND_RESTARTS = 10

function startBackend() {
  if (isShuttingDown) return

  // Free the port before every start attempt (handles lingering processes from a crash)
  freePort(4001)

  serverProcess = spawn(
    'node',
    ['--env-file-if-exists=.env', '--watch-path=server/src', 'server/src/server.js'],
    { cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'], shell: false }
  )

  serverProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n')
    for (const raw of lines) {
      const line = raw.trim()
      if (line) {
        console.log('\x1b[36m[BACKEND]\x1b[0m ' + line)
        // Reset restart counter on successful listen
        if (line.includes('listening on')) backendRestartCount = 0
      }
    }
  })

  serverProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n')
    for (const raw of lines) {
      const line = raw.trim()
      if (line) console.error('\x1b[31m[BACKEND ERR]\x1b[0m ' + line)
    }
  })

  serverProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      backendRestartCount++
      if (backendRestartCount > MAX_BACKEND_RESTARTS) {
        console.error('\x1b[31m[BACKEND]\x1b[0m Too many restart attempts — giving up. Fix the issue and re-run.')
        return
      }
      const delay = Math.min(1500 * backendRestartCount, 10000)
      console.warn(`\x1b[33m[BACKEND]\x1b[0m Backend stopped (code: ${code}, signal: ${signal}). Re-initializing in ${(delay / 1000).toFixed(1)}s... (attempt ${backendRestartCount}/${MAX_BACKEND_RESTARTS})`)
      setTimeout(startBackend, delay)
    }
  })

  serverProcess.on('error', (err) => {
    console.error('\x1b[31m[BACKEND ERR]\x1b[0m Failed to spawn backend:', err?.message || err)
  })
}

// 1. Start Backend API Server
startBackend()

// 2. Start Frontend Vite Dev Server with --host 0.0.0.0
const viteProcess = spawn(
  'node',
  ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0'],
  { cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'], shell: false }
)

viteProcess.stdout.on('data', (data) => {
  const line = data.toString().trim()
  if (line) console.log('\x1b[32m[FRONTEND]\x1b[0m ' + line)
})

viteProcess.stderr.on('data', (data) => {
  const line = data.toString().trim()
  if (line) console.error('\x1b[33m[FRONTEND ERR]\x1b[0m ' + line)
})

let cleanedUp = false
function cleanup() {
  if (cleanedUp) return
  cleanedUp = true
  isShuttingDown = true
  console.log('\n[INFO] Stopping dev servers...')

  const killTree = (proc) => {
    if (!proc?.pid) return
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /T /F /PID ${proc.pid} >nul 2>&1`)
      } else {
        proc.kill('SIGTERM')
      }
    } catch {}
  }

  killTree(serverProcess)
  killTree(viteProcess)
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGHUP', cleanup)
