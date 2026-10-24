import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('[1/4] Building production frontend with Vite...')
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' })

const distDir = path.join(rootDir, 'dist')
if (!fs.existsSync(distDir)) {
  console.error('[ERROR] dist directory does not exist after build!')
  process.exit(1)
}

// -------------------------------------------------------------
// 1. STAGE FRONTEND
// -------------------------------------------------------------
console.log('\n[2/4] Staging Frontend standalone package...')
const stagingFrontend = path.join(rootDir, 'staging_frontend')
if (fs.existsSync(stagingFrontend)) fs.rmSync(stagingFrontend, { recursive: true, force: true })
fs.mkdirSync(stagingFrontend, { recursive: true })

// Copy all dist contents to stagingFrontend
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

copyRecursive(distDir, stagingFrontend)

// Add .htaccess for Frontend SPA routing
const htaccessFrontend = `# ==============================================================
# Edufyi HR Frontend - Apache .htaccess configuration
# Supports SPA client-side routing & caching
# ==============================================================

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. (Optional) Reverse proxy /api requests to local Node backend
  # Uncomment if backend is running on the same server on port 4001:
  # <IfModule mod_proxy.c>
  #   RewriteRule ^api/(.*)$ http://127.0.0.1:4001/api/$1 [P,L]
  # </IfModule>

  # 2. Existing file or directory - serve directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 3. All other routes go to index.html for React Router / SPA navigation
  RewriteRule ^ index.html [L]
</IfModule>

# Caching headers for static production assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
`
fs.writeFileSync(path.join(stagingFrontend, '.htaccess'), htaccessFrontend, 'utf8')

// Add README_FRONTEND.md
const readmeFrontend = `# Edufyi HR - Frontend Standalone Deployment Guide

This package contains the pre-built, production-ready static assets for the Edufyi HR Management System & Employee Self-Service (ESS) Portal.

---

## What is Inside
- \`index.html\` - The main single-page application entry file
- \`assets/\` - Minified and bundled JS and CSS chunks
- \`company-documents/\`, \`company-policies/\`, \`verification-forms/\`, etc. - Static document resources
- \`.htaccess\` - Pre-configured Apache SPA routing file (redirects all client-side routes to \`index.html\`)

---

## Deployment Steps

### Option A: Webuzo / cPanel (Shared Hosting / Apache)
1. Log into your **Webuzo** or **cPanel** File Manager.
2. Navigate to your website's web root (usually \`public_html\` or your subdomain folder e.g. \`hr.yourdomain.com\`).
3. Upload and extract all files from **\`edufyi-hr-frontend.zip\`** directly into that directory.
4. Verify that \`.htaccess\` is uploaded (ensure hidden dot-files are visible in File Manager).
5. Open your domain in the browser (e.g. \`https://hr.yourdomain.com\`).

### Option B: Nginx Static Hosting
Add the following location block to your Nginx server block:
\`\`\`nginx
server {
    listen 80;
    server_name hr.yourdomain.com;
    root /var/www/edufyi-hr-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional proxy to backend if on same server
    location /api/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

---

## Connecting to Backend API

- If frontend and backend are on the **same domain** (with backend proxying \`/api\` or served together), no additional configuration is required! All requests use \`/api/v1\`.
- If the backend is hosted on a **separate domain** (e.g. \`https://api.yourdomain.com\`), configure reverse proxy in Apache/Nginx or rebuild with \`VITE_API_BASE_URL=https://api.yourdomain.com/api/v1\`.
`
fs.writeFileSync(path.join(stagingFrontend, 'README_FRONTEND.md'), readmeFrontend, 'utf8')

// -------------------------------------------------------------
// 2. STAGE BACKEND
// -------------------------------------------------------------
console.log('\n[3/4] Staging Backend standalone package...')
const stagingBackend = path.join(rootDir, 'staging_backend')
if (fs.existsSync(stagingBackend)) fs.rmSync(stagingBackend, { recursive: true, force: true })
fs.mkdirSync(stagingBackend, { recursive: true })

// Copy server/src
copyRecursive(path.join(rootDir, 'server', 'src'), path.join(stagingBackend, 'server', 'src'))

// Copy root server.js
fs.copyFileSync(path.join(rootDir, 'server.js'), path.join(stagingBackend, 'server.js'))

// Copy public directory (verification-forms, company-policies)
const publicDir = path.join(rootDir, 'public')
if (fs.existsSync(publicDir)) {
  copyRecursive(publicDir, path.join(stagingBackend, 'public'))
}

// Copy .env.example
if (fs.existsSync(path.join(rootDir, '.env.example'))) {
  fs.copyFileSync(path.join(rootDir, '.env.example'), path.join(stagingBackend, '.env.example'))
}

// Create dedicated backend package.json
const backendPackageJson = {
  name: 'edufyi-hr-backend-api',
  version: '1.0.0',
  private: true,
  type: 'module',
  main: 'server.js',
  engines: {
    node: '>=20.12.0'
  },
  scripts: {
    start: 'node --env-file-if-exists=.env server/src/server.js'
  },
  dependencies: {
    express: '^5.1.0',
    jsonwebtoken: '^9.0.3',
    mongoose: '^9.10.2'
  }
}
fs.writeFileSync(
  path.join(stagingBackend, 'package.json'),
  JSON.stringify(backendPackageJson, null, 2) + '\n',
  'utf8'
)

// Add README_BACKEND.md
const readmeBackend = `# Edufyi HR - Backend API Standalone Deployment Guide

This package contains the standalone Node.js REST API server for the Edufyi HR Management System & Employee Self-Service (ESS) Portal.

---

## Requirements
- **Node.js**: v20.12.0 or higher
- **Database**: MongoDB (Atlas or local instance)
- **Memory**: ~150MB RAM

---

## Deployment Steps

### 1. Upload Files
Upload and extract the contents of **\`edufyi-hr-backend.zip\`** to your server (e.g. \`/home/username/nodeapp\` or your Webuzo Node.js app directory).

### 2. Install Dependencies
Run in the application directory:
\`\`\`bash
npm install --omit=dev
\`\`\`
*(Only 3 production dependencies: \`express\`, \`jsonwebtoken\`, \`mongoose\`)*

### 3. Configure Environment Variables (\`.env\`)
Create a \`.env\` file in the application directory based on \`.env.example\`:

\`\`\`ini
# Server Port (default 4001, or port provided by hosting)
PORT=4001
NODE_ENV=production

# Database (Required for persistent records, employees, attendance, leaves)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/edufyi_hr?retryWrites=true&w=majority

# Strong Random JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_SECRET=your_generated_random_jwt_secret_key_here

# Initial Management Credentials
ADMIN_EMAIL=hr@edufyi.com
ADMIN_PASSWORD=YourSecureAdminPassword123!
\`\`\`

### 4. Running with PM2 (Recommended)
\`\`\`bash
# Start backend
pm2 start server.js --name "edufyi-hr-api"

# Save PM2 process list to restart automatically on reboot
pm2 save
pm2 startup
\`\`\`

### 5. Running with Webuzo Node.js Manager
1. In Webuzo, go to **Node.js Apps**.
2. Click **Create Application**:
   - **Node.js Version**: 20.x or higher
   - **Application Mode**: Production
   - **Application Root**: Path where files were uploaded (e.g. \`nodeapp\`)
   - **Application URL**: e.g. \`api.yourdomain.com\` or your domain
   - **Application Startup File**: \`server.js\`
3. Click **Create**.
4. In Environment variables section, add your \`MONGODB_URI\` and \`JWT_SECRET\`.
5. Run NPM Install using the button or terminal.
6. Click **Restart Application**.

---

## Health Check
Visit or curl your API endpoint:
\`\`\`bash
curl http://localhost:4001/api/v1/health
\`\`\`
Response:
\`\`\`json
{
  "status": "healthy",
  "database": "connected"
}
\`\`\`
`
fs.writeFileSync(path.join(stagingBackend, 'README_BACKEND.md'), readmeBackend, 'utf8')

// -------------------------------------------------------------
// 3. CREATE ZIP ARCHIVES
// -------------------------------------------------------------
console.log('\n[4/4] Creating zip archives...')

const frontendZipPath = path.join(rootDir, 'edufyi-hr-frontend.zip')
const backendZipPath = path.join(rootDir, 'edufyi-hr-backend.zip')

if (fs.existsSync(frontendZipPath)) fs.unlinkSync(frontendZipPath)
if (fs.existsSync(backendZipPath)) fs.unlinkSync(backendZipPath)

// Zip frontend using PowerShell
console.log('  -> Compressing edufyi-hr-frontend.zip...')
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${stagingFrontend}\\*' -DestinationPath '${frontendZipPath}' -Force"`,
  { cwd: rootDir, stdio: 'inherit' }
)

// Zip backend using PowerShell
console.log('  -> Compressing edufyi-hr-backend.zip...')
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${stagingBackend}\\*' -DestinationPath '${backendZipPath}' -Force"`,
  { cwd: rootDir, stdio: 'inherit' }
)

// Clean up staging folders
console.log('  -> Cleaning temporary staging folders...')
fs.rmSync(stagingFrontend, { recursive: true, force: true })
fs.rmSync(stagingBackend, { recursive: true, force: true })

const frontendSizeMB = (fs.statSync(frontendZipPath).size / (1024 * 1024)).toFixed(2)
const backendSizeMB = (fs.statSync(backendZipPath).size / (1024 * 1024)).toFixed(2)

console.log('\n======================================================')
console.log(' SUCCESS! Separate zip packages created:')
console.log(` 1. Frontend: edufyi-hr-frontend.zip (${frontendSizeMB} MB)`)
console.log(` 2. Backend : edufyi-hr-backend.zip  (${backendSizeMB} MB)`)
console.log('======================================================\n')
