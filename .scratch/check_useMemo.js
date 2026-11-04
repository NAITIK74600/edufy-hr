import fs from 'node:fs'
import path from 'node:path'

function checkDir(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) {
      checkDir(full)
    } else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8')
      if (/\buseMemo\b/.test(content)) {
        const importLines = content.split('\n').filter(l => l.startsWith('import ') && (l.includes("'react'") || l.includes('"react"')))
        const hasUseMemoImport = importLines.some(l => l.includes('useMemo'))
        const hasReactDotUseMemoOnly = !content.match(/[^.]useMemo\b/)
        if (!hasUseMemoImport && !hasReactDotUseMemoOnly) {
          console.log('MISSING useMemo import in:', full)
        }
      }
    }
  }
}
checkDir('src')

