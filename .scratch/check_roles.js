import fs from 'fs'

const s = fs.readFileSync('src/services/hrStore.js', 'utf8')
const match = s.match(/export const STANDARD_ROLE_CONFIG = \{([\s\S]*?)\n\};/)
if (match) {
  const keys = []
  const lines = match[1].split('\n')
  lines.forEach(l => {
    const km = l.match(/^  ['"]?([a-zA-Z0-9_-]+)['"]?:\s*\{/)
    if (km) keys.push(km[1])
  })
  console.log('STANDARD_ROLE_CONFIG keys (' + keys.length + '):', keys)
  const dups = keys.filter((item, index) => keys.indexOf(item) !== index)
  console.log('Duplicates in STANDARD_ROLE_CONFIG:', dups)
}

// Check DEPARTMENT_DESIGNATIONS
const dMatch = s.match(/export const DEPARTMENT_DESIGNATIONS = \{([\s\S]*?)\n\};/)
if (dMatch) {
  const dKeys = []
  const lines = dMatch[1].split('\n')
  lines.forEach(l => {
    const km = l.match(/^  ['"]?([^'"]+)['"]?:\s*\[/)
    if (km) dKeys.push(km[1])
  })
  console.log('\nDEPARTMENT_DESIGNATIONS keys (' + dKeys.length + '):', dKeys)
}

