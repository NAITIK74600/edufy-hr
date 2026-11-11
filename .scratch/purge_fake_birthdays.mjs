import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin'

async function purge() {
  await mongoose.connect(uri)
  const res = await mongoose.connection.collection('employees').updateMany(
    {
      dobVerified: { $ne: true },
      isRealDob: { $ne: true },
    },
    {
      $unset: { dob: 1, 'identity.dob': 1, dateOfBirth: 1, birthDate: 1 }
    }
  )
  console.log('Employees cleaned:', res.modifiedCount)

  const remainingWithDob = await mongoose.connection.collection('employees').countDocuments({
    $or: [{ dob: { $exists: true, $ne: null } }, { 'identity.dob': { $exists: true, $ne: null } }]
  })
  console.log('Remaining employees with DOB in DB:', remainingWithDob)

  const delRes = await mongoose.connection.collection('calendarevents').deleteMany({
    $or: [
      { sourceType: 'employee_birthday' },
      { category: 'Employee Birthday' },
      { category: 'Birthday' },
    ],
    'sourceData.isRealDob': { $ne: true },
  })
  console.log('Deleted fake birthday calendar events:', delRes.deletedCount)

  process.exit(0)
}

purge().catch((e) => {
  console.error(e)
  process.exit(1)
})

