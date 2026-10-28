import { connectDatabase } from '../server/src/db/connect.js'
import { createAttendanceService, formatCurrentTime, parseTimeToMinutes } from '../server/src/modules/attendance/attendance.service.js'
import { createMongoAttendanceRepository } from '../server/src/modules/attendance/attendance.repository.js'
import { AttendanceRecord } from '../server/src/models/AttendanceRecord.js'
import { AttendanceSettings } from '../server/src/models/AttendanceSettings.js'
import { Employee } from '../server/src/models/Employee.js'

async function main() {
  await connectDatabase('mongodb://127.0.0.1:27017/edufyi_hr')
  const repo = createMongoAttendanceRepository()

  // Ensure employee ETS113828 exists
  await Employee.findOneAndUpdate(
    { employeeId: 'ETS113828' },
    {
      $set: {
        employeeId: 'ETS113828',
        name: 'Naitik Raj',
        displayName: 'Naitik Raj',
        status: 'active',
        email: 'naitik.raj@example.com',
      },
    },
    { upsert: true, returnDocument: 'after' }
  )

  // 1. Get current time in Asia/Kolkata
  const now = new Date()
  const currentFormatted = formatCurrentTime(now) // e.g. '09:44 PM'
  const currentMins = parseTimeToMinutes(currentFormatted)
  const currentHH = String(Math.floor(currentMins / 60)).padStart(2, '0')
  const currentMM = String(currentMins % 60).padStart(2, '0')
  const current24 = `${currentHH}:${currentMM}` // e.g. '21:44'

  console.log(`Current local time: ${currentFormatted} (${current24})`)

  // 2. Set this current time as office punch-in time in settings
  await AttendanceSettings.findOneAndUpdate(
    { key: 'office' },
    {
      $set: {
        'attendanceRules.workStartTime': current24,
        'attendanceRules.workEndTime': '23:59',
        'attendanceRules.gracePeriodMinutes': 15,
        'attendanceRules.requireOfficeNetworkAndGps': false,
      },
    },
    { returnDocument: 'after', upsert: true }
  )

  const updatedSettings = await AttendanceSettings.findOne({ key: 'office' }).lean()

  console.log(`Office punch-in time configured to: ${updatedSettings.attendanceRules.workStartTime}`)

  const service = createAttendanceService({
    repository: repo,
    companySettings: updatedSettings,
  })

  // 3. Clean up any previous test record for today
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
  const today = formatter.format(now)
  await AttendanceRecord.deleteMany({ employeeId: 'ETS113828', date: today })

  // 4. Mark attendance for Naitik Raj at current time
  const record = await service.checkIn({
    employeeId: 'ETS113828',
    employeeName: 'Naitik Raj',
    date: today,
    clientIp: '127.0.0.1',
    wifiSSID: 'Edufyi-Office-5G',
    shift: `General (${currentFormatted} – 11:59 PM)`,
    shiftCode: 'general',
  })

  console.log('=== CREATED ATTENDANCE RECORD ===')
  console.log({
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    checkIn: record.checkIn,
    status: record.status,
    isLate: record.isLate,
    lateCount: record.lateCount,
    totalHours: record.totalHours,
    shift: record.shift,
    notes: record.notes,
  })

  // 5. Verify assertions
  if (record.status !== 'present') throw new Error(`Expected status present, got ${record.status}`)
  if (record.isLate !== false) throw new Error(`Expected isLate false, got ${record.isLate}`)
  if (record.totalHours !== 'Active (Live)') throw new Error(`Expected Active (Live), got ${record.totalHours}`)
  if (!record.notes.includes('On-time verification')) throw new Error(`Expected On-time verification note, got ${record.notes}`)

  console.log('\n>>> SUCCESS! Attendance correctly marked as ON-TIME (Present, Active Live). <<<')

  // 6. Test recalculate roster
  console.log('\nTesting recalculateAttendance:')
  const recalcResult = await service.recalculateAttendance(today, updatedSettings.attendanceRules)
  console.log('Recalculate result:', recalcResult)

  const reloaded = await repo.findByEmployeeAndDate('ETS113828', today)
  console.log('After recalculate:')
  console.log({
    status: reloaded.status,
    isLate: reloaded.isLate,
    totalHours: reloaded.totalHours,
    notes: reloaded.notes,
  })

  if (reloaded.status !== 'present') throw new Error(`Recalculate broke status: ${reloaded.status}`)
  if (reloaded.isLate !== false) throw new Error('Recalculate marked as late')
  if (reloaded.totalHours !== 'Active (Live)') throw new Error(`Recalculate broke totalHours: ${reloaded.totalHours}`)

  console.log('\n>>> SUCCESS! Recalculate also preserves on-time status! <<<')
  process.exit(0)
}

main().catch((err) => {
  console.error('ERROR in test:', err)
  process.exit(1)
})
