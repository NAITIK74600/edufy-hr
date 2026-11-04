import fs from 'fs'

const emps = JSON.parse(fs.readFileSync('all_79_employees.json', 'utf8'))
console.log('Total records:', emps.length)

const idMap = new Map()
const emailMap = new Map()
const empIdMap = new Map()

const dupEmails = []
const dupEmpIds = []
const roles = new Map()
const designations = new Map()
const departments = new Map()

emps.forEach((e, idx) => {
  const rawId = String(e._id?.$oid || e._id)
  idMap.set(rawId, e)
  
  if (e.email) {
    const em = e.email.toLowerCase().trim()
    if (emailMap.has(em)) {
      dupEmails.push({ email: em, first: emailMap.get(em), duplicate: { idx, id: rawId, empId: e.employeeId, name: e.name } })
    } else {
      emailMap.set(em, { idx, id: rawId, empId: e.employeeId, name: e.name })
    }
  }
  
  if (e.employeeId) {
    const eid = e.employeeId.toUpperCase().trim()
    if (empIdMap.has(eid)) {
      dupEmpIds.push({ employeeId: eid, first: empIdMap.get(eid), duplicate: { idx, id: rawId, email: e.email, name: e.name } })
    } else {
      empIdMap.set(eid, { idx, id: rawId, email: e.email, name: e.name })
    }
  }

  roles.set(e.role, (roles.get(e.role) || 0) + 1)
  designations.set(e.designation, (designations.get(e.designation) || 0) + 1)
  departments.set(e.department, (departments.get(e.department) || 0) + 1)
})

console.log('\n--- DUPLICATES ---')
console.log('Duplicate emails:', JSON.stringify(dupEmails, null, 2))
console.log('Duplicate employee IDs:', JSON.stringify(dupEmpIds, null, 2))

console.log('\n--- ROLES ---')
console.log(Object.fromEntries(roles))

console.log('\n--- DEPARTMENTS ---')
console.log(Object.fromEntries(departments))

console.log('\n--- DESIGNATIONS ---')
console.log(Object.fromEntries(designations))

console.log('\n--- HIERARCHY / MANAGERS ---')
let missingManagers = 0
let selfManagers = 0
let validManagers = 0
let noManager = 0

const allIds = new Set(Array.from(idMap.keys()))
const allEmpCodes = new Set(emps.map(e => (e.employeeId || '').toUpperCase().trim()))

emps.forEach((e) => {
  const mgrId = e.managerId ? String(e.managerId?.$oid || e.managerId) : null
  const rawId = String(e._id?.$oid || e._id)
  if (!mgrId || mgrId === 'null' || mgrId === 'undefined') {
    noManager++
  } else if (mgrId === rawId || mgrId === e.employeeId) {
    selfManagers++
    console.log(`Self-manager: ${e.name} (${e.employeeId}) has managerId = ${mgrId}`)
  } else if (allIds.has(mgrId) || allEmpCodes.has(mgrId.toUpperCase())) {
    validManagers++
  } else {
    missingManagers++
    console.log(`Missing manager: ${e.name} (${e.employeeId}, ${e.designation}) has managerId = ${mgrId} which is not found!`)
  }
})

console.log(`Managers summary: Valid=${validManagers}, Missing/Broken=${missingManagers}, Self=${selfManagers}, None=${noManager}`)

