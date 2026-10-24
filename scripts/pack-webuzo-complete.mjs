import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('[1/4] Ensuring frontend build is up to date...')
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' })

console.log('\n[2/4] Ensuring pure production node_modules exist...')
const prodTestDir = path.join(rootDir, 'scratch', 'prod_test')
const prodNmDir = path.join(prodTestDir, 'node_modules')

if (!fs.existsSync(prodNmDir)) {
  fs.mkdirSync(prodTestDir, { recursive: true })
  execSync('npm init -y', { cwd: prodTestDir, stdio: 'ignore' })
  execSync('npm install --omit=dev express@5.1.0 jsonwebtoken@9.0.3 mongoose@9.10.2', { cwd: prodTestDir, stdio: 'inherit' })
}

console.log('\n[3/4] Staging clean, professional, all-in-one package for Webuzo...')
const stagingDir = path.join(rootDir, 'scratch', 'staging_webuzo_clean')
if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true })
fs.mkdirSync(stagingDir, { recursive: true })

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item))
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}

// 1. Frontend compiled assets
console.log('  -> Copying dist/ (Compiled React frontend)...')
copyRecursive(path.join(rootDir, 'dist'), path.join(stagingDir, 'dist'))

// 2. Backend source
console.log('  -> Copying server/src/ (Backend API, models, services)...')
copyRecursive(path.join(rootDir, 'server', 'src'), path.join(stagingDir, 'server', 'src'))

// 3. Static assets
console.log('  -> Copying public/ (Documents, forms, policies)...')
copyRecursive(path.join(rootDir, 'public'), path.join(stagingDir, 'public'))

// 4. Pre-installed node_modules
console.log('  -> Copying pre-installed production node_modules/...')
copyRecursive(prodNmDir, path.join(stagingDir, 'node_modules'))

// 5. Dual root entrypoints (app.js AND server.js for 100% hosting compatibility)
console.log('  -> Creating root app.js & server.js entrypoints...')
fs.copyFileSync(path.join(rootDir, 'server.js'), path.join(stagingDir, 'server.js'))
fs.copyFileSync(path.join(rootDir, 'app.js'), path.join(stagingDir, 'app.js'))

// 6. Pre-configured environment (.env and .env.example)
const envContent = `# Edufyi HR Management System - Production Environment Configuration
PORT=30006
NODE_ENV=development
JWT_SECRET=edufyi-production-secret-98f2b3c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
MONGODB_URI=mongodb+srv://naitikraj74600_db_user:uRVGHVhBdwtmctuY@cluster0.r5jflcg.mongodb.net/hr_dashboard?retryWrites=true&w=majority
AUTH_USERS_JSON=[]
VITE_API_BASE_URL=/api/v1

ADMIN_EMAIL=admin@edufyi.in
ADMIN_PASSWORD=Password@123
HR_EMAIL=hr@edufyi.in
HR_PASSWORD=Password@123
`
fs.writeFileSync(path.join(stagingDir, '.env'), envContent, 'utf8')
fs.writeFileSync(path.join(stagingDir, '.env.example'), envContent, 'utf8')

// 7. Apache configuration for Webuzo (.htaccess)
const htaccessContent = `# Apache configuration for Edufyi HR Webuzo
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
`
fs.writeFileSync(path.join(stagingDir, '.htaccess'), htaccessContent, 'utf8')

// 8. Package.json
const pkgJson = {
  name: 'edufyi-hr-portal',
  version: '1.0.0',
  private: true,
  type: 'module',
  main: 'server.js',
  engines: { node: '>=20.12.0' },
  scripts: {
    start: 'node server.js'
  },
  dependencies: {
    express: '^5.1.0',
    jsonwebtoken: '^9.0.3',
    mongoose: '^9.10.2'
  }
}
fs.writeFileSync(path.join(stagingDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n', 'utf8')

// 9. Deployment Guide
const readmeContent = `# Edufyi HR Management System - Clean Production Package

## Folder Structure:
- \`dist/\`             - Compiled React Frontend (Single Page App)
- \`public/\`           - Verification forms, policies, logos
- \`server/src/\`       - Backend Express REST API, MongoDB models, auth, services
- \`node_modules/\`     - Pre-installed production dependencies (No npm install needed!)
- \`app.js\`            - Hosting entry point (alias for server.js)
- \`server.js\`         - Hosting entry point
- \`.env\`              - Pre-configured with MongoDB connection & credentials
- \`.htaccess\`         - Apache rewrite rules for SPA routing

## Webuzo Settings:
- **Application Path**: \`employee\` (or your folder name)
- **Application Startup File**: \`server.js\` (or \`app.js\`)
- **Start Command**: \`node server.js\`
- **Deployment Environment**: \`Development\`
`
fs.writeFileSync(path.join(stagingDir, 'README_DEPLOY_WEBUZO.md'), readmeContent, 'utf8')

console.log('\n[4/4] Creating edufyi-hr-webuzo.zip...')
const targetZip = path.join(rootDir, 'edufyi-hr-webuzo.zip')
if (fs.existsSync(targetZip)) fs.unlinkSync(targetZip)

execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${targetZip}' -Force"`,
  { cwd: rootDir, stdio: 'inherit' }
)

const sizeMB = (fs.statSync(targetZip).size / (1024 * 1024)).toFixed(2)
console.log(`\n=================================================================`)
console.log(` SUCCESS! Created clean, professional archive:`)
console.log(` File : edufyi-hr-webuzo.zip (${sizeMB} MB)`)
console.log(` Path : ${targetZip}`)
console.log(`=================================================================\n`)

// Clean staging folder
fs.rmSync(stagingDir, { recursive: true, force: true })
