import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const rootDir = 'e:/hr dashbord'
const zipFile = path.join(rootDir, 'hr-dashboard-updated.zip')

console.log('📦 Creating update zip file for HR Dashboard...')

if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile)
}

// Ensure .env is included alongside standard files
const excludeList = [
  '--exclude="node_modules"',
  '--exclude="node_modules/*"',
  '--exclude="dist"',
  '--exclude="dist/*"',
  '--exclude=".21st"',
  '--exclude=".vscode"',
  '--exclude="cloudflared.exe"',
  '--exclude="*.zip"',
  '--exclude=".git"',
]

const cmd = `tar ${excludeList.join(' ')} -a -c -f hr-dashboard-updated.zip * .env .env.example`
console.log(`Running: ${cmd}`)

execSync(cmd, { cwd: rootDir, stdio: 'inherit' })

if (fs.existsSync(zipFile)) {
  const stat = fs.statSync(zipFile)
  console.log(`✅ Update zip created successfully: hr-dashboard-updated.zip (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`)
} else {
  console.error('❌ Failed to create zip file.')
  process.exit(1)
}
