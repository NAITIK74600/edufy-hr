import mongoose from 'mongoose'
import { hashPassword } from '../server/src/auth/passwords.js'

const uri = process.env.MONGODB_URI || 'mongodb+srv://naitikraj74600_db_user:uRVGHVhBdwtmctuY@cluster0.r5jflcg.mongodb.net/hr_dashboard?retryWrites=true&w=majority'
const adminPass = process.env.ADMIN_PASSWORD || 'Password@123'
const hrPass = process.env.HR_PASSWORD || 'Password@123'

async function syncPasswords() {
  await mongoose.connect(uri)
  console.log('Connected to MongoDB. Syncing management accounts...')

  // 1. Admin
  const adminHash = hashPassword(adminPass)
  const adminRes = await mongoose.connection.db.collection('employees').updateOne(
    { $or: [{ email: 'admin@edufyi.in' }, { role: 'admin' }, { employeeId: 'EDU-ADM-001' }] },
    {
      $set: {
        email: 'admin@edufyi.in',
        username: 'admin',
        role: 'admin',
        status: 'active',
        passwordHash: adminHash,
        updatedAt: new Date(),
      },
      $inc: { authVersion: 1 }
    },
    { upsert: false }
  )
  console.log(`Admin update result: matched=${adminRes.matchedCount}, modified=${adminRes.modifiedCount}`)

  // 2. HR
  const hrHash = hashPassword(hrPass)
  const hrRes = await mongoose.connection.db.collection('employees').updateOne(
    { $or: [{ email: 'hr@edufyi.in' }, { role: 'hr' }, { employeeId: 'EDU-HR-001' }] },
    {
      $set: {
        email: 'hr@edufyi.in',
        username: 'hr',
        role: 'hr',
        status: 'active',
        passwordHash: hrHash,
        updatedAt: new Date(),
      },
      $inc: { authVersion: 1 }
    },
    { upsert: false }
  )
  console.log(`HR update result: matched=${hrRes.matchedCount}, modified=${hrRes.modifiedCount}`)

  console.log('Successfully synchronized Admin and HR credentials in MongoDB Atlas:')
  console.log(`- Admin: admin@edufyi.in | Password: ${adminPass}`)
  console.log(`- HR:    hr@edufyi.in    | Password: ${hrPass}`)

  process.exit(0)
}

syncPasswords().catch(err => {
  console.error('Error syncing passwords:', err)
  process.exit(1)
})
