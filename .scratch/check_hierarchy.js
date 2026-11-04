import fs from 'fs'

const emps = JSON.parse(fs.readFileSync('.scratch/mongo_dump.json', 'utf8'))
console.log('Total employees:', emps.length)

// Build a map of all employees by _id and employeeId
const byId = new Map()
const byCode = new Map()

emps.forEach(e => {
  byId.set(String(e._id), e)
  if (e.employeeId) byCode.set(e.employeeId.toUpperCase(), e)
})

function getMgr(e) {
  if (!e.managerId) return null
  const mId = String(e.managerId)
  return byId.get(mId) || byCode.get(mId.toUpperCase()) || null
}

// Find reporting lines
emps.forEach(e => {
  const mgr = getMgr(e)
  e._mgr = mgr
})

// Build tree from root(s)
const roots = emps.filter(e => !e._mgr)
console.log('\n--- ROOTS (no manager) ---')
roots.forEach(r => {
  console.log(`Root: ${r.name} (${r.employeeId}, ${r.role}, ${r.designation}, ${r.department})`)
})

// Check who reports to whom
const reportsMap = new Map()
emps.forEach(e => {
  if (e._mgr) {
    const mgrId = String(e._mgr._id)
    if (!reportsMap.has(mgrId)) reportsMap.set(mgrId, [])
    reportsMap.get(mgrId).push(e)
  }
})

console.log('\n--- MANAGERS & THEIR REPORT COUNT ---')
for (const [mgrId, reports] of reportsMap.entries()) {
  const m = byId.get(mgrId)
  console.log(`${m.name} (${m.employeeId}, ${m.designation}, ${m.role}) has ${reports.length} direct reports:`)
  // group by designation and role
  const breakdown = {}
  reports.forEach(r => {
    const key = `${r.role} | ${r.designation}`
    breakdown[key] = (breakdown[key] || 0) + 1
  })
  console.log('   Breakdown:', breakdown)
}

// Check who has NO reports
console.log('\n--- PEOPLE WITH MANAGERIAL ROLES BUT NO REPORTS ---')
emps.filter(e => ['manager', 'director', 'managing_director', 'team_lead', 'team_leader'].includes(e.role) || (e.designation && (e.designation.includes('Manager') || e.designation.includes('Leader') || e.designation.includes('Head')))).forEach(e => {
  const rList = reportsMap.get(String(e._id)) || []
  if (rList.length === 0) {
    console.log(`  - ${e.name} (${e.employeeId}, Role: ${e.role}, Desig: ${e.designation}, Dept: ${e.department}) -> 0 reports!`)
  }
})

// Check cycles or depth
function getDepth(e, visited = new Set()) {
  if (visited.has(String(e._id))) return -1 // cycle
  visited.add(String(e._id))
  if (!e._mgr) return 0
  const d = getDepth(e._mgr, visited)
  return d === -1 ? -1 : d + 1
}

const depths = emps.map(e => ({ name: e.name, id: e.employeeId, depth: getDepth(e) }))
const cycles = depths.filter(d => d.depth === -1)
console.log('\nCycles found:', cycles)
console.log('Max depth:', Math.max(...depths.map(d => d.depth)))


