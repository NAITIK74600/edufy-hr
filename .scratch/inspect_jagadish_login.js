import fs from 'node:fs'
import mongoose from 'mongoose'

const envText = fs.readFileSync('.env', 'utf8')
const m = envText.match(/MONGODB_URI=(.+)/)
const uri = m[1].trim()

await mongoose.connect(uri)

const users = await mongoose.connection.collection('users').find({
  $or: [{ email: /jagadish/i }, { username: /jagadish/i }]
}).toArray()
console.log('USERS count:', users.length)
if (users.length) console.log('USER:', users[0])

const emps = await mongoose.connection.collection('employees').find({
  $or: [{ email: /jagadish/i }, { employeeId: 'ETS21218' }, { name: /jagadish/i }]
}).toArray()
console.log('EMPLOYEES count:', emps.length)
if (emps.length) {
  const e = emps[0]
  console.log('EMP:', {
    _id: e._id,
    name: e.name,
    email: e.email,
    employeeId: e.employeeId,
    role: e.role,
    designation: e.designation,
    hasPasswordHash: Boolean(e.passwordHash),
    passwordHash: e.passwordHash,
  })
}

await mongoose.disconnect()

