import mongoose from 'mongoose'

async function test() {
  await mongoose.connect(process.env.MONGODB_URI)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const emps = await mongoose.connection.collection('employees').find({ status: { $in: ['active', 'onboarding'] } }).toArray()
  const birthdaysThisMonth = []
  for (const emp of emps) {
    if (!emp.dob) continue
    const d = new Date(emp.dob)
    if ((d.getUTCMonth() + 1) === currentMonth) {
      birthdaysThisMonth.push({ name: emp.name, day: d.getUTCDate(), dob: emp.dob })
    }
  }
  console.log(`Birthdays in month ${currentMonth}: ${birthdaysThisMonth.length}`)
  birthdaysThisMonth.forEach(b => console.log(`🎂 ${b.name} on Day ${b.day}`))
  await mongoose.disconnect()
}

test().catch(console.error)
