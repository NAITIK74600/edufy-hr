import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin'

async function run() {
  await mongoose.connect(uri)
  const emps = await mongoose.connection.collection('employees').find({ dob: { $ne: null } }).toArray()
  console.log('Total with dob:', emps.length)
  for (const e of emps) {
    console.log(`${e.name} (${e.employeeId}) -> dob: ${e.dob} | department: ${e.department}`)
  }
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
