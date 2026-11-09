import mongoose from 'mongoose'

async function populateDob() {
  await mongoose.connect(process.env.MONGODB_URI)
  const collection = mongoose.connection.collection('employees')
  const employees = await collection.find({}).toArray()

  console.log(`Found ${employees.length} employees. Updating missing dob...`)

  let updatedCount = 0
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    if (!emp.dob) {
      // Generate a deterministic birth date spread across all 12 months
      const str = `${emp.name}_${emp.employeeId || emp._id}`
      const hash = str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      
      const month = (hash % 12) // 0-11
      const day = ((hash * 7) % 28) + 1 // 1-28 safe for all months
      const year = 1993 + (hash % 9) // 1993 to 2001 (ages 25-33)
      
      const dobDate = new Date(Date.UTC(year, month, day, 0, 0, 0))

      await collection.updateOne(
        { _id: emp._id },
        { $set: { dob: dobDate } }
      )
      updatedCount++
      console.log(`[${updatedCount}] Set DOB for ${emp.name} (${emp.employeeId}): ${dobDate.toISOString().split('T')[0]}`)
    }
  }

  console.log(`\nSuccessfully updated DOB for ${updatedCount} employees!`)
  await mongoose.disconnect()
}

populateDob().catch(console.error)

