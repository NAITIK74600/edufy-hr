import mongoose from 'mongoose'
import fs from 'node:fs'

let envUri = ''
try {
  const envText = fs.readFileSync('.env', 'utf8')
  const m = envText.match(/MONGODB_URI=(.+)/)
  if (m) envUri = m[1].trim()
} catch {}

const uri = envUri || process.env.MONGODB_URI

try {
  await mongoose.connect(uri)
  const { Employee } = await import('../server/src/models/Employee.js')
  const naitik = await Employee.findOne({ name: { $regex: /naitik/i } }).populate('managerId', 'name email role designation employeeId').lean()
  if (naitik) {
    console.log('Naitik record:')
    console.log(`  Name: ${naitik.name}`)
    console.log(`  ID: ${naitik.employeeId}`)
    console.log(`  Email: ${naitik.email}`)
    console.log(`  Role: ${naitik.role}`)
    console.log(`  Designation: ${naitik.designation}`)
    console.log(`  Department: ${naitik.department}`)
    console.log(`  Manager:`, naitik.managerId)
  } else {
    console.log('Naitik not found')
  }
  await mongoose.disconnect()
} catch (err) {
  console.log('Error:', err.message)
}
