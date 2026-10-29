/**
 * build-webuzo-deploy.mjs
 * 
 * Creates a clean deployment zip for Webuzo Node.js hosting.
 * 
 * Output structure (inside the zip):
 *   server.js          ← main entry point (Webuzo runs: node server.js)
 *   app.js             ← Express app factory
 *   package.json       ← with "type": "module" and production deps only
 *   .env               ← production environment variables
 *   .htaccess           ← Apache proxy config
 *   dist/              ← built React frontend (SPA)
 *   server/src/        ← backend source code
 *   public/            ← verification forms, company policies
 *   node_modules/      ← pre-installed production dependencies
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const BUILD_DIR = path.join(ROOT, '_webuzo_build')
const ZIP_NAME = 'edufyi-hr-webuzo-deploy.zip'
const ZIP_PATH = path.join(ROOT, ZIP_NAME)

// ─── Helpers ──────────────────────────────────────────────
function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  [SKIP] Source not found: ${src}`)
    return
  }
  mkdirp(dest)
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

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  [SKIP] File not found: ${src}`)
    return false
  }
  mkdirp(path.dirname(dest))
  fs.copyFileSync(src, dest)
  return true
}

// ─── Step 0: Clean previous build ────────────────────────
console.log('\n🧹 Cleaning previous build...')
rmrf(BUILD_DIR)
if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH)

// ─── Step 1: Create build directory ──────────────────────
console.log('📁 Creating build directory...')
mkdirp(BUILD_DIR)

// ─── Step 2: Create the ROOT server.js ───────────────────
// This is the ENTRY POINT that Webuzo calls with `node server.js`
// It must be a FLAT file, NOT an import redirect
console.log('📝 Creating server.js entry point...')

const serverJsContent = `// Webuzo Entry Point - Edufyi HR Dashboard
// This file is the main entry point that Webuzo runs with: node server.js
import './server/src/server.js'
`
fs.writeFileSync(path.join(BUILD_DIR, 'server.js'), serverJsContent)

// Also create app.js alias for compatibility
const appJsContent = `// Alternative entry point for platforms expecting app.js
import './server.js'
`
fs.writeFileSync(path.join(BUILD_DIR, 'app.js'), appJsContent)

// ─── Step 3: Copy server source code ─────────────────────
console.log('📦 Copying server source code...')
copyDir(
  path.join(ROOT, 'server', 'src'),
  path.join(BUILD_DIR, 'server', 'src')
)

// ─── Step 4: Copy dist (built frontend) ──────────────────
console.log('🎨 Building and packaging latest frontend dist...')
try {
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' })
} catch (e) {
  console.error('  ❌ Frontend build failed! Make sure vite is installed.')
  process.exit(1)
}
copyDir(path.join(ROOT, 'dist'), path.join(BUILD_DIR, 'dist'))

// ─── Step 5: Copy public directory ───────────────────────
console.log('📂 Copying public assets...')
copyDir(path.join(ROOT, 'public'), path.join(BUILD_DIR, 'public'))

// ─── Step 6: Create production package.json ──────────────
console.log('📋 Creating production package.json...')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const prodPkg = {
  name: pkg.name || 'edufyi-hr-dashboard',
  version: pkg.version || '1.0.0',
  private: true,
  type: 'module',   // CRITICAL: ESM support
  main: 'server.js',
  engines: { node: '>=20.0.0' },
  scripts: {
    start: 'node server.js',
  },
  dependencies: {
    express: pkg.dependencies.express,
    jsonwebtoken: pkg.dependencies.jsonwebtoken,
    mongoose: pkg.dependencies.mongoose,
  },
}
fs.writeFileSync(
  path.join(BUILD_DIR, 'package.json'),
  JSON.stringify(prodPkg, null, 2) + '\n'
)

// ─── Step 7: Create production .env ──────────────────────
console.log('🔐 Creating production .env...')
const envContent = `NODE_ENV=production
PORT=30005
JWT_SECRET=edufyi-production-jwt-key-change-this-in-production

MONGODB_URI=mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin
MONGO_POOL_SIZE=200
AUTH_USERS_JSON=[]
VITE_API_BASE_URL=/api/v1

# Admin & HR credentials (customizable email / gmail & password)
ADMIN_EMAIL=admin@edufyitech.in
ADMIN_PASSWORD=Password@123
HR_EMAIL=hr@edufyitech.in
HR_PASSWORD=Password@123

# SMTP Workspace Mail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Workspace / Gmail App Password
ADMIN_EMAIL_PASS=ywly kgmv bbsm juca
HR_EMAIL_PASS=tzen ptmu smjq oyoi

# IT Support Workspace Email & App Password (Dedicated IT channel)
IT_EMAIL=itsupport@edufyitech.in
IT_EMAIL_PASS=3CD<u&3S>rUQ6uD*

# General Help Support Workspace Email & App Password (HR, Payroll, Facilities)
HELPDESK_EMAIL=helpsupport@edufyitechsolution.in
HELPDESK_EMAIL_PASS=

# Public application base URL for links embedded in emails
APP_PUBLIC_URL=https://test.edufyitechsolutions.com
TRUST_PROXY=true
`
fs.writeFileSync(path.join(BUILD_DIR, '.env'), envContent)

// ─── Step 8: Create .htaccess ────────────────────────────
console.log('🌐 Creating .htaccess...')
copyFile(path.join(ROOT, '.htaccess'), path.join(BUILD_DIR, '.htaccess'))

// ─── Step 9: Install production node_modules ─────────────
console.log('📥 Installing production dependencies...')
try {
  execSync('npm install --omit=dev --no-audit --no-fund', {
    cwd: BUILD_DIR,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  })
} catch (e) {
  console.error('  ❌ npm install failed!')
  process.exit(1)
}

// ─── Step 10: Create the zip ─────────────────────────────
console.log('📦 Creating deployment zip...')
try {
  // Try PowerShell Compress-Archive first (Windows)
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${BUILD_DIR}\\*' -DestinationPath '${ZIP_PATH}' -Force"`,
    { stdio: 'inherit' }
  )
} catch {
  try {
    // Fallback to tar
    execSync(`tar -czf "${ZIP_PATH}" -C "${BUILD_DIR}" .`, { stdio: 'inherit' })
  } catch (e2) {
    console.error('  ❌ Could not create zip. Please manually zip the _webuzo_build folder.')
  }
}

// ─── Step 11: Verify ─────────────────────────────────────
console.log('\n✅ Build complete!')
console.log(`   📦 Zip: ${ZIP_PATH}`)
console.log(`   📁 Build dir: ${BUILD_DIR}`)

// List root files in build
const buildFiles = fs.readdirSync(BUILD_DIR)
console.log('\n📋 Files in deployment:')
for (const f of buildFiles) {
  const stat = fs.statSync(path.join(BUILD_DIR, f))
  if (stat.isDirectory()) {
    console.log(`   📁 ${f}/`)
  } else {
    console.log(`   📄 ${f} (${(stat.size / 1024).toFixed(1)} KB)`)
  }
}

console.log(`
╔══════════════════════════════════════════════════════════╗
║              WEBUZO DEPLOYMENT INSTRUCTIONS              ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  1. Upload ${ZIP_NAME} to your server           ║
║  2. Extract to: /home/admin_edufytech/hr/                ║
║     Command:                                             ║
║     cd /home/admin_edufytech/hr                          ║
║     rm -rf *                                             ║
║     unzip ${ZIP_NAME}                           ║
║                                                          ║
║  3. Webuzo App Settings:                                 ║
║     • Port: 30005                                        ║
║     • Start Command: node server.js                      ║
║     • Startup File: server.js                            ║
║     • Application Path: /home/admin_edufytech/hr         ║
║     • Environment: Production                            ║
║                                                          ║
║  4. Stop & Start the app from Webuzo panel               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`)
