import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const rootDir = 'e:/hr dashbord'
const tempDir = path.join(rootDir, '_temp_packages')
const frontendTemp = path.join(tempDir, 'frontend')
const backendTemp = path.join(tempDir, 'backend')

const frontendZip = path.join(rootDir, 'hr-dashboard-frontend.zip')
const backendZip = path.join(rootDir, 'hr-dashboard-backend.zip')

console.log('📦 Starting separate packaging for Frontend and Backend...')

// 1. Clean previous temp directories and existing zip files
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true })
}
if (fs.existsSync(frontendZip)) fs.unlinkSync(frontendZip)
if (fs.existsSync(backendZip)) fs.unlinkSync(backendZip)

fs.mkdirSync(frontendTemp, { recursive: true })
fs.mkdirSync(backendTemp, { recursive: true })

// Helper function to copy directory recursively
function copyDir(src, dest, filterFn = null) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    if (filterFn && !filterFn(entry.name, entry.isDirectory())) continue
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, filterFn)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// ==========================================
// 2. PREPARE FRONTEND PACKAGE
// ==========================================
console.log('  -> Assembling Frontend package...')

// Copy src, public, index.html, vite.config.js
copyDir(path.join(rootDir, 'src'), path.join(frontendTemp, 'src'))
copyDir(path.join(rootDir, 'public'), path.join(frontendTemp, 'public'))
fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(frontendTemp, 'index.html'))
fs.copyFileSync(path.join(rootDir, 'vite.config.js'), path.join(frontendTemp, 'vite.config.js'))

// Frontend package.json
const frontendPkg = {
  name: 'edufyi-hr-frontend',
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

// Frontend .env & .env.example
const frontendEnv = `VITE_API_BASE_URL=http://localhost:4001/api/v1\nVITE_DEV_API_URL=http://localhost:4001\n`
fs.writeFileSync(path.join(frontendTemp, '.env'), frontendEnv, 'utf8')
fs.writeFileSync(path.join(frontendTemp, '.env.example'), frontendEnv, 'utf8')

// Frontend .gitignore
fs.writeFileSync(path.join(frontendTemp, '.gitignore'), 'node_modules/\ndist/\n.env.local\n', 'utf8')

// Frontend start.bat
const frontendBat = `@echo off
title Edufyi HR Frontend Portal
cd /d "%~dp0"
echo ==========================================================
echo        EDUFYA HR MANAGEMENT SYSTEM - FRONTEND
echo ==========================================================
echo.
if not exist "node_modules" (
  echo [INFO] Installing frontend dependencies...
  call npm install
  if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)
echo [INFO] Starting Vite dev server on http://localhost:5173 ...
call npm run dev
pause
`
fs.writeFileSync(path.join(frontendTemp, 'start.bat'), frontendBat, 'utf8')

// Frontend README.md
const frontendReadme = `# Edufyi HR Management - Frontend

Standalone React + Vite Frontend application for Edufyi HR & ESS Portal.

## 🚀 Setup & Run Instructions

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure API URL**:
   The default backend API is configured in \`.env\`:
   \`\`\`env
   VITE_API_BASE_URL=http://localhost:4001/api/v1
   VITE_DEV_API_URL=http://localhost:4001
   \`\`\`

3. **Start Development Server**:
   Double click \`start.bat\` or run:
   \`\`\`bash
   npm run dev
   \`\`\`
   Access the web app at: **http://localhost:5173**

4. **Build for Production**:
   \`\`\`bash
   npm run build
   \`\`\`
   Output is generated in \`dist/\`.
`
fs.writeFileSync(path.join(frontendTemp, 'README.md'), frontendReadme, 'utf8')

// ==========================================
// 3. PREPARE BACKEND PACKAGE
// ==========================================
console.log('  -> Assembling Backend package...')

// Copy server/src to backend/src
copyDir(path.join(rootDir, 'server', 'src'), path.join(backendTemp, 'src'))

// Copy server/test to backend/test
copyDir(path.join(rootDir, 'server', 'test'), path.join(backendTemp, 'test'))

// Copy scripts to backend/scripts
if (fs.existsSync(path.join(rootDir, 'scripts'))) {
  copyDir(path.join(rootDir, 'scripts'), path.join(backendTemp, 'scripts'), (name) => !name.startsWith('make-') && !name.startsWith('_temp'))
}

// Backend package.json
const backendPkg = {
  name: 'edufyi-hr-backend',
  private: true,
  version: '0.1.0',
  type: 'module',
  main: 'src/server.js',
  engines: {
    node: '>=20.12.0'
  },
  scripts: {
    start: 'node --env-file-if-exists=.env src/server.js',
    dev: 'node --env-file=.env --watch src/server.js',
    test: 'node --test test/*.test.js'
  },
  dependencies: {
    express: '^5.1.0',
    jsonwebtoken: '^9.0.3',
    mongoose: '^9.10.2'
  }
}
fs.writeFileSync(path.join(backendTemp, 'package.json'), JSON.stringify(backendPkg, null, 2) + '\n', 'utf8')

// Copy root .env & .env.example
if (fs.existsSync(path.join(rootDir, '.env'))) {
  fs.copyFileSync(path.join(rootDir, '.env'), path.join(backendTemp, '.env'))
}
if (fs.existsSync(path.join(rootDir, '.env.example'))) {
  fs.copyFileSync(path.join(rootDir, '.env.example'), path.join(backendTemp, '.env.example'))
}

// Backend .gitignore
fs.writeFileSync(path.join(backendTemp, '.gitignore'), 'node_modules/\n.env.local\n', 'utf8')

// Backend start.bat
const backendBat = `@echo off
title Edufyi HR Backend API
cd /d "%~dp0"
echo ==========================================================
echo        EDUFYA HR MANAGEMENT SYSTEM - BACKEND API
echo ==========================================================
echo.
if not exist "node_modules" (
  echo [INFO] Installing backend dependencies...
  call npm install
  if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)
echo [INFO] Starting Backend API on http://localhost:4001 ...
call npm run dev
pause
`
fs.writeFileSync(path.join(backendTemp, 'start.bat'), backendBat, 'utf8')

// Backend README.md
const backendReadme = `# Edufyi HR Management - Backend API

Standalone Express + MongoDB Backend REST API with JWT Auth, Attendance Geofencing, Shifts, Breaks, Leave Approvals, and Payroll.

## 🚀 Setup & Run Instructions

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment (\`.env\`)**:
   Verify settings in \`.env\`:
   \`\`\`env
   PORT=4001
   MONGODB_URI=mongodb://127.0.0.1:27017/edufyi_hr
   JWT_SECRET=edufyi-local-development-secret-change-me
   ADMIN_EMAIL=admin@edufyi.in
   ADMIN_PASSWORD=Password@123
   HR_EMAIL=hr@edufyi.in
   HR_PASSWORD=Password@123
   \`\`\`

3. **Start Development Server**:
   Double click \`start.bat\` or run:
   \`\`\`bash
   npm run dev
   \`\`\`
   Backend API runs on: **http://localhost:4001**
   Health Check: **http://localhost:4001/api/v1/health**

4. **Run Backend Test Suites**:
   \`\`\`bash
   npm test
   \`\`\`
`
fs.writeFileSync(path.join(backendTemp, 'README.md'), backendReadme, 'utf8')

// ==========================================
// 4. CREATE ZIP FILES USING TAR
// ==========================================
console.log('  -> Compressing Frontend into hr-dashboard-frontend.zip...')
execSync(`tar -a -c -f "${frontendZip}" *`, { cwd: frontendTemp, stdio: 'inherit' })

console.log('  -> Compressing Backend into hr-dashboard-backend.zip...')
execSync(`tar -a -c -f "${backendZip}" *`, { cwd: backendTemp, stdio: 'inherit' })

// Verify sizes
const fStat = fs.statSync(frontendZip)
const bStat = fs.statSync(backendZip)

console.log(`\n🎉 SEPARATE ZIP CREATION COMPLETED!`)
console.log(`✅ Frontend Zip : hr-dashboard-frontend.zip (${(fStat.size / (1024 * 1024)).toFixed(2)} MB)`)
console.log(`✅ Backend Zip  : hr-dashboard-backend.zip  (${(bStat.size / (1024 * 1024)).toFixed(2)} MB)`)

// Clean up temp directory
fs.rmSync(tempDir, { recursive: true, force: true })
console.log('🧹 Cleaned up temporary export folders.')
