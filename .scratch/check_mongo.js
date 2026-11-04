import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

async function checkMongo() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('No MONGODB_URI in .env')
    return
  }
  console.log('Connecting to Mongo (masked):', uri.replace(/:([^@]+)@/, ':****@'))
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    console.log('Connected successfully to database:', mongoose.connection.name)

    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Collections in database:')
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments()
      console.log(`  - ${c.name}: ${count} documents`)
    }

    const employeesCol = mongoose.connection.db.collection('employees')
    const employees = await employeesCol.find({}).toArray()
    console.log(`\nFound ${employees.length} employees in MongoDB`)

    // Check duplicates in MongoDB
    const emailCounts = {}
    const empIdCounts = {}
    const roleCounts = {}
    const desigCounts = {}
    const deptCounts = {}
    const managers = {}

    employees.forEach(e => {
      const email = (e.email || '').toLowerCase().trim()
      const empId = (e.employeeId || '').toUpperCase().trim()
      emailCounts[email] = (emailCounts[email] || 0) + 1
      empIdCounts[empId] = (empIdCounts[empId] || 0) + 1
      roleCounts[e.role] = (roleCounts[e.role] || 0) + 1
      desigCounts[e.designation] = (desigCounts[e.designation] || 0) + 1
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1
    })

    const dupEmails = Object.entries(emailCounts).filter(([k, v]) => v > 1)
    const dupEmpIds = Object.entries(empIdCounts).filter(([k, v]) => v > 1)

    console.log('\n--- MONGODB DUPLICATES ---')
    console.log('Duplicate emails in Mongo:', dupEmails)
    console.log('Duplicate employee IDs in Mongo:', dupEmpIds)

    console.log('\n--- MONGODB ROLES ---')
    console.log(roleCounts)

    console.log('\n--- MONGODB DESIGNATIONS ---')
    console.log(desigCounts)

    console.log('\n--- MONGODB DEPARTMENTS ---')
    console.log(deptCounts)

    // Check users collection if separate
    if (collections.some(c => c.name === 'users')) {
      const usersCol = mongoose.connection.db.collection('users')
      const users = await usersCol.find({}).toArray()
      console.log(`\nFound ${users.length} users in 'users' collection`)
      users.forEach(u => {
        console.log(`  User: ${u.username || u.email} (role: ${u.role}, email: ${u.email})`)
      })
    }

    // Check hierarchy issues in Mongo
    console.log('\n--- MONGODB HIERARCHY CHECK ---')
    const idSet = new Set(employees.map(e => String(e._id)))
    const empIdSet = new Set(employees.map(e => (e.employeeId || '').toUpperCase()))
    let brokenMgr = []
    let selfMgr = []
    let noMgr = []

    employees.forEach(e => {
      const mId = e.managerId ? String(e.managerId) : null
      const selfId = String(e._id)
      const selfCode = (e.employeeId || '').toUpperCase()
      if (!mId || mId === 'null' || mId === 'undefined') {
        noMgr.push({ id: selfId, code: selfCode, name: e.name, desig: e.designation, role: e.role })
      } else if (mId === selfId || mId === selfCode) {
        selfMgr.push({ id: selfId, code: selfCode, name: e.name, managerId: mId })
      } else if (!idSet.has(mId) && !empIdSet.has(mId.toUpperCase())) {
        brokenMgr.push({ id: selfId, code: selfCode, name: e.name, desig: e.designation, managerId: mId })
      }
    })

    console.log('Employees with NO manager:', noMgr)
    console.log('Employees with SELF manager:', selfMgr)
    console.log('Employees with BROKEN/MISSING managerId:', brokenMgr)

  } catch (err) {
    console.error('Mongo error:', err.message)
  } finally {
    await mongoose.disconnect()
  }
}

checkMongo()

