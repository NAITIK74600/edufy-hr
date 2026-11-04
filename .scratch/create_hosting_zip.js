import fs from 'node:fs'
import path from 'node:path'
import archiver from 'archiver'

const zipPath = path.resolve('edufyi-hr-hosting.zip')
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
}

const output = fs.createWriteStream(zipPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
  console.log(`[ZIP SUCCESS] edufyi-hr-hosting.zip created successfully: ${sizeMB} MB (${archive.pointer()} bytes)`)
})

archive.on('error', (err) => {
  throw err
})

archive.pipe(output)

// 1. Production frontend build
if (fs.existsSync('dist')) {
  archive.directory('dist/', 'dist')
}

// 2. Production server source files
if (fs.existsSync('server/src')) {
  archive.directory('server/src/', 'server/src')
}

// 3. Public assets
if (fs.existsSync('public')) {
  archive.directory('public/', 'public')
}

// 4. Hosting runtime entrypoints and configuration files
const rootFiles = [
  'server.js',
  'ecosystem.config.cjs',
  'package.json',
  'package-lock.json',
  '.env.example',
]

for (const file of rootFiles) {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file })
  }
}

archive.finalize()

