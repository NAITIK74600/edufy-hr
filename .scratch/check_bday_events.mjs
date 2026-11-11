import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin'

async function run() {
  await mongoose.connect(uri)
  const bdayEvents = await mongoose.connection.collection('calendarevents').find({
    $or: [{ sourceType: 'employee_birthday' }, { category: /birthday/i }]
  }).toArray()
  console.log('CalendarEvent birthday count:', bdayEvents.length)
  for (const b of bdayEvents.slice(0, 5)) {
    console.log(b.title, b.date, b.category, b.sourceType)
  }
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
