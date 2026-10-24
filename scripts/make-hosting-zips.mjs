import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const rootDir = 'e:/hr dashbord'
const tempDir = path.join(rootDir, '_temp_hosting')
const frontendTemp = path.join(tempDir, 'frontend')
const backendTemp = path.join(tempDir, 'backend')

console.log('📦 Assembling clean hosting-only packages for Frontend and Backend...')

// Clean previous temporary directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
fs.mkdirSync(frontendTemp, { recursive: true })
fs.mkdirSync(backendTemp, { recursive: true })

// Helper function to recursively copy files
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// ==========================================================
// 1. FRONTEND HOSTING FILES ONLY
// ==========================================================
console.log('-> Packing Frontend hosting files...')

// 1. src/
copyDir(path.join(rootDir, 'src'), path.join(frontendTemp, 'src'))

// 2. public/
copyDir(path.join(rootDir, 'public'), path.join(frontendTemp, 'public'))

// 3. index.html
fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(frontendTemp, 'index.html'))

// 4. vite.config.js
fs.copyFileSync(path.join(rootDir, 'vite.config.js'), path.join(frontendTemp, 'vite.config.js'))

// 5. package.json (frontend-specific dependencies for hosting & build)
const frontendPkg = {
  name: 'orbit-hr-frontend',
  private: true,
  version: '0.1.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview'
  },
  dependencies: {
    '@vitejs/plugin-react': 'latest',
    'html2canvas': '^1.4.1',
    'jspdf': '^4.2.1',
    'lucide-react': 'latest',
    'motion': '^13.4.4',
    'react': 'latest',
    'react-dom': 'latest',
    'vite': 'latest'
  }
}
fs.writeFileSync(path.join(frontendTemp, 'package.json'), JSON.stringify(frontendPkg, null, 2) + '\n', 'utf8')

// 6. .env
const frontendEnv = `VITE_API_BASE_URL=/api/v1\n`
fs.writeFileSync(path.join(frontendTemp, '.env'), frontendEnv, 'utf8')

// ==========================================================
// 2. BACKEND HOSTING FILES ONLY
// ==========================================================
console.log('-> Packing Backend hosting files...')

// 1. src/ (from server/src)
copyDir(path.join(rootDir, 'server', 'src'), path.join(backendTemp, 'src'))

// 2. package.json (backend-specific dependencies for hosting & start)
const backendPkg = {
  name: 'orbit-hr-backend',
  private: true,
  version: '0.1.0',
  type: 'module',
  main: 'src/server.js',
  engines: {
    node: '>=20.12.0'
  },
  scripts: {
    start: 'node src/server.js',
    dev: 'node --watch src/server.js'
  },
  dependencies: {
    express: '^5.1.0',
    jsonwebtoken: '^9.0.3',
    mongoose: '^9.10.2'
  }
}
fs.writeFileSync(path.join(backendTemp, 'package.json'), JSON.stringify(backendPkg, null, 2) + '\n', 'utf8')

// 3. .env
if (fs.existsSync(path.join(rootDir, '.env'))) {
  fs.copyFileSync(path.join(rootDir, '.env'), path.join(backendTemp, '.env'))
}

// ==========================================================
// 3. GENERATE ZIP FILES
// ==========================================================
console.log('-> Creating zip archives...')

const frontendZip = path.join(rootDir, 'frontend.zip')
const backendZip = path.join(rootDir, 'backend.zip')
const hrFrontendZip = path.join(rootDir, 'hr-dashboard-frontend.zip')
const hrBackendZip = path.join(rootDir, 'hr-dashboard-backend.zip')

// Remove old files
for (const p of [frontendZip, backendZip, hrFrontendZip, hrBackendZip]) {
  if (fs.existsSync(p)) fs.unlinkSync(p)
}

// Create frontend zip
execSync(`tar -a -c -f "${frontendZip}" * .env`, { cwd: frontendTemp, stdio: 'inherit' })
fs.copyFileSync(frontendZip, hrFrontendZip)

// Create backend zip
execSync(`tar -a -c -f "${backendZip}" * .env`, { cwd: backendTemp, stdio: 'inherit' })
fs.copyFileSync(backendZip, hrBackendZip)

// Cleanup staging folder
fs.rmSync(tempDir, { recursive: true, force: true })

// Log sizes
const fStat = fs.statSync(frontendZip)
const bStat = fs.statSync(backendZip)

console.log('\n✅ Clean hosting zip archives created successfully!')
console.log(`📦 Frontend Zip: frontend.zip (${(fStat.size / (1024 * 1024)).toFixed(2)} MB)`)
console.log(`📦 Backend Zip : backend.zip  (${(bStat.size / 1024).toFixed(1)} KB)`)
