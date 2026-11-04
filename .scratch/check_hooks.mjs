import fs from 'fs'
import path from 'path'

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const hooks = ['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useContext']
  
  // match: import ... from 'react'
  const importLines = content.split('\n').filter(l => l.includes("from 'react'") || l.includes('from "react"'))
  const imported = new Set()
  let hasReactStar = false
  let hasDefaultReact = false

  for (const line of importLines) {
    if (line.includes('* as React')) hasReactStar = true
    if (/import\s+React\b/.test(line)) hasDefaultReact = true
    const namedMatch = line.match(/\{([^}]+)\}/)
    if (namedMatch) {
      namedMatch[1].split(',').forEach(s => imported.add(s.trim()))
    }
  }

  for (const h of hooks) {
    // look for standalone hook call: e.g. useMemo(...)
    // negative lookbehind or check not preceded by a dot
    const matches = [...content.matchAll(new RegExp('([^.\\w]|^)' + h + '\\s*\\(', 'g'))]
    if (matches.length > 0 && !imported.has(h)) {
      console.log('REAL MISSING HOOK:', filePath, '->', h, `(${matches.length} occurrences)`)
    }
  }
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '_webuzo_build') continue
    if (fs.statSync(full).isDirectory()) walk(full)
    else if (full.endsWith('.jsx') || full.endsWith('.js')) {
      checkFile(full)
    }
  }
}

walk('src')
console.log('Done deep hook scan!')
