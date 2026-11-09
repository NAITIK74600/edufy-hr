import mongoose from 'mongoose'

async function check() {
  await mongoose.connect(process.env.MONGODB_URI)
  const countWithDob = await mongoose.connection.collection('employees').countDocuments({ dob: { $exists: true, $ne: null } })
  console.log('Employees with dob:', countWithDob)
  
  const allEmps = await mongoose.connection.collection('employees').find({}).toArray()
  console.log('Total employees in DB:', allEmps.length)
  let foundAnyDate = 0
  for (const emp of allEmps) {
    const keys = Object.keys(emp).filter(k => k.toLowerCase().includes('birth') || k.toLowerCase().includes('dob'))
    if (keys.length > 0) {
      console.log('Found keys in', emp.name, keys, keys.map(k => emp[k]))
      foundAnyDate++
    }
  }
  console.log('Total emps with any birth/dob key:', foundAnyDate, 'out of', allEmps.length)

  // Also check onboardingDocsCache or onboarding docs if dob was submitted during onboarding
  const onboardingDocs = await mongoose.connection.collection('onboardingdocscaches').find({}).limit(5).toArray()
  console.log('Onboarding docs sample count:', onboardingDocs.length)
  if (onboardingDocs.length > 0) {
    console.log('Sample onboarding keys:', Object.keys(onboardingDocs[0]))
  }

  await mongoose.disconnect()
}

check().catch(console.error)

