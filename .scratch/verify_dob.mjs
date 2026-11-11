import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin'

async function run() {
  await mongoose.connect(uri)
  const count = await mongoose.connection.collection('employees').countDocuments({
    $or: [{ dobVerified: true }, { isRealDob: true }]
  })
  console.log('Employees with verified real DOB:', count)
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

