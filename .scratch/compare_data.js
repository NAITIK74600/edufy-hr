import fs from 'fs'

const mongoDump = JSON.parse(fs.readFileSync('.scratch/mongo_dump.json', 'utf8'))
const all79 = JSON.parse(fs.readFileSync('all_79_employees.json', 'utf8'))

console.log('Mongo count:', mongoDump.length)
console.log('all_79 count:', all79.length)

// Check if all_79 is identical to mongoDump or what's different
let diffCount = 0
all79.forEach(a => {
  const m = mongoDump.find(m => String(m._id) === String(a._id?.$oid || a._id) || m.employeeId === a.employeeId)
  if (!m) {
    console.log(`In all_79 but not in Mongo: ${a.name} (${a.employeeId})`)
    diffCount++
  }
})

console.log('Differences count:', diffCount)

// Check each person in mongoDump: name, designation, department, role, managerId, squad
console.log('\n--- ALL EMPLOYEES IN MONGO ---')
mongoDump.forEach(e => {
  console.log(`${e.employeeId} | ${e.name} | Role: ${e.role} | Desig: ${e.designation} | Dept: ${e.department} | Squad: ${e.squad || e.team || 'None'} | MgrId: ${e.managerId}`)
})

