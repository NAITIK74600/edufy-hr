import mongoose from 'mongoose'
import fs from 'fs'

async function dryRunRepair() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db
  const emps = await db.collection('employees').find({}).toArray()
  console.log(`Initial DB count: ${emps.length} employees`)

  const jagadish = emps.find(e => /jagadish\s*babu/i.test(e.name))
  const admin = emps.find(e => e.employeeId === 'EDU-ADM-001')
  const hr = emps.find(e => e.employeeId === 'EDU-HR-001')
  const ravi = emps.find(e => e.employeeId === 'EDU-MGR-003' || /ravi/i.test(e.name))
  const basir = emps.find(e => e.employeeId === 'ETS21169' || /basir/i.test(e.name))
  const venky = emps.find(e => e.employeeId === 'ETS21168' || /venkatesh/i.test(e.name))
  const mayank = emps.find(e => e.employeeId === 'ETS112315' || /mayank/i.test(e.name))

  console.log('Key Leaders Found:')
  console.log('  Jagadish:', jagadish ? `${jagadish.name} (${jagadish.employeeId})` : 'MISSING!')
  console.log('  Admin:', admin ? `${admin.name} (${admin.employeeId})` : 'MISSING!')
  console.log('  HR:', hr ? `${hr.name} (${hr.employeeId})` : 'MISSING!')
  console.log('  Ravi:', ravi ? `${ravi.name} (${ravi.employeeId})` : 'MISSING!')
  console.log('  Basir:', basir ? `${basir.name} (${basir.employeeId})` : 'MISSING!')
  console.log('  Venky:', venky ? `${venky.name} (${venky.employeeId})` : 'MISSING!')
  console.log('  Mayank:', mayank ? `${mayank.name} (${mayank.employeeId})` : 'MISSING!')

  await mongoose.disconnect()
}

dryRunRepair()

