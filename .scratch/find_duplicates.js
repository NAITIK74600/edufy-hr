import fs from 'fs'

const emps = JSON.parse(fs.readFileSync('.scratch/mongo_dump.json', 'utf8'))

function normalizeName(n) {
  return (n || '').toLowerCase().replace(/[^a-z]/g, '')
}

console.log('--- POTENTIAL DUPLICATE EMPLOYEES ---')
const seen = []
emps.forEach((e1, i) => {
  const n1 = normalizeName(e1.name)
  emps.forEach((e2, j) => {
    if (i >= j) return
    const n2 = normalizeName(e2.name)
    const sameEmail = e1.email && e2.email && e1.email.toLowerCase() === e2.email.toLowerCase()
    const sameName = n1.length > 3 && (n1 === n2 || (n1.includes(n2) && n2.length > 5) || (n2.includes(n1) && n1.length > 5))
    if (sameEmail || sameName) {
      console.log(`\nDuplicate match:`)
      console.log(`  1: [${e1.employeeId}] ${e1.name} | Role: ${e1.role} | Desig: ${e1.designation} | Dept: ${e1.department} | Email: ${e1.email} | Squad: ${e1.squad || e1.team || 'None'} | ID: ${e1._id}`)
      console.log(`  2: [${e2.employeeId}] ${e2.name} | Role: ${e2.role} | Desig: ${e2.designation} | Dept: ${e2.department} | Email: ${e2.email} | Squad: ${e2.squad || e2.team || 'None'} | ID: ${e2._id}`)
    }
  })
})

