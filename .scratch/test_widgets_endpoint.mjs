import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin'

async function run() {
  await mongoose.connect(uri)
  const CalendarEvent = mongoose.connection.collection('calendarevents')
  const todayStr = new Date().toISOString().split('T')[0]

  // Insert a test leave event to verify it does NOT show up in meetings
  await CalendarEvent.insertOne({
    title: 'Staff Member · On Leave (sick)',
    type: 'leave',
    category: 'Employee Leave',
    sourceType: 'leave_request',
    date: todayStr,
    status: 'confirmed',
  })

  // Insert a test meeting event with Google Meet to verify it DOES show up in meetings
  await CalendarEvent.insertOne({
    title: 'Weekly Tech Standup & Sync',
    type: 'meeting',
    category: 'Team Meeting',
    date: todayStr,
    startTime: '14:00',
    status: 'confirmed',
    meetingLink: {
      type: 'meet',
      url: 'https://meet.google.com/abc-defg-hij',
    },
  })

  // Test the meetingQuery logic
  const meetingQuery = {
    status: { $ne: 'cancelled' },
    date: { $gte: todayStr },
    type: { $nin: ['leave', 'employee_leave', 'holiday', 'birthday', 'anniversary'] },
    sourceType: { $nin: ['leave_request', 'employee_birthday', 'company_holiday'] },
    category: {
      $nin: [
        'Company Holiday',
        'Birthday',
        'Employee Birthday',
        'Work Anniversary',
        'Employee Leave',
        'Leave',
        'Sick Leave',
        'Casual Leave',
        'Paid Leave',
        'Unpaid Leave',
      ],
      $not: /leave|holiday|birthday|anniversary/i,
    },
    title: { $not: /leave|holiday|birthday|anniversary/i },
    $or: [
      { type: 'meeting' },
      { category: { $regex: /meeting|sync|call|review|standup|session|interview|demo|1:1|townhall/i } },
      { 'meetingLink.url': { $exists: true, $ne: '' } },
    ],
  }

  const meetings = await CalendarEvent.find(meetingQuery).toArray()
  console.log('Meetings found:', meetings.length)
  for (const m of meetings) {
    console.log(' - Meeting:', m.title, '| type:', m.type, '| cat:', m.category)
  }

  // Clean up the test events
  await CalendarEvent.deleteMany({
    title: { $in: ['Staff Member · On Leave (sick)', 'Weekly Tech Standup & Sync'] },
  })

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

