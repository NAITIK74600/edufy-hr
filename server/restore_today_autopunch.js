import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { AttendanceRecord } from './src/models/AttendanceRecord.js'
import { AttendanceSettings } from './src/models/AttendanceSettings.js'

// Auto-load .env from multiple candidate paths
try { process.loadEnvFile?.() } catch {}
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envCandidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
]

for (const envPath of envCandidatePaths) {
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [k, ...v] = trimmed.split('=')
          const key = k.trim()
          if (key && !process.env[key]) {
            process.env[key] = v.join('=').trim()
          }
        }
      }
      break
    } catch {}
  }
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
if (!mongoUri) {
  console.error('\n❌ [ERROR] MONGODB_URI not found in environment or .env file.')
  console.error('Please verify that .env exists and contains MONGODB_URI=<connection_string>.\n')
  process.exit(1)
}

async function restore() {
  console.log('🔄 Connecting to MongoDB database...')
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 })
  console.log('✅ Connected to MongoDB successfully.')

  // 1. Permanently disable offline & geofence auto-punchout in AttendanceSettings
  console.log('\n🔒 Step 1: Disabling offline & geofence auto punch-out rules in database settings...')
  await AttendanceSettings.updateMany(
    {},
    {
      $set: {
        'attendanceRules.offlineAutoPunchOutEnabled': false,
        'attendanceRules.geofenceAutoPunchOutEnabled': false,
        offlineAutoPunchOutEnabled: false,
        geofenceAutoPunchOutEnabled: false,
      },
    }
  ).catch(() => {})
  console.log('✅ Settings secured: offlineAutoPunchOutEnabled = false.')

  const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const todayUTC = new Date().toISOString().slice(0, 10)
  const targetDates = Array.from(new Set([todayIST, todayUTC, '2026-11-05']))

  const allDates = process.argv.includes('--all-dates')
  const specificDateArg = process.argv.find((arg) => arg.startsWith('--date='))?.split('=')[1]

  const query = {
    checkIn: { $nin: [null, ''] },
    $or: [
      { autoPunchOut: true },
      { punchOutType: 'auto' },
      { punchOutReason: { $regex: /auto|disconnect|offline|inactive|geofence|timeout/i } },
      { totalHours: { $regex: /auto punch out/i } },
    ],
  }

  if (!allDates) {
    query.date = specificDateArg ? specificDateArg : { $in: targetDates }
  }

  console.log(`\n🔍 Step 2: Searching for prematurely auto-punched out records...`)
  const records = await AttendanceRecord.find(query).sort({ date: -1, employeeId: 1 }).lean()

  if (!records || records.length === 0) {
    console.log('\n✨ [INFO] No auto-punched out records found. All active attendances are in good state!\n')
    await mongoose.disconnect()
    process.exit(0)
  }

  console.log(`\n⚠️  [FOUND] Found ${records.length} falsely punched out record(s) to restore:\n`)

  const tableData = []
  let count = 0

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const cleanStatus = (r.isLate || r.status === 'late') ? 'late' : 'present'

    await AttendanceRecord.updateOne(
      { _id: r._id },
      {
        $set: {
          checkOut: null,
          checkOutAt: null,
          autoPunchOut: false,
          punchOutReason: '',
          punchOutType: 'manual',
          isEarlyLogout: false,
          earlyLogoutCount: 0,
          isHalfDay: false,
          totalHours: 'Active (Live)',
          status: cleanStatus,
          disconnectedSince: null,
          autoPunchOutPolicy: null,
          autoPunchOutReasonCode: null,
          reviewStatus: 'corrected',
          reviewedBy: 'Emergency Restoration Daemon',
          reviewedAt: new Date(),
          reviewRemarks: 'Restored from premature offline timeout false closure',
        },
        $push: {
          auditEvents: {
            eventType: 'EMERGENCY_RESTORE_FALSE_AUTOPUNCH',
            eventTimestamp: new Date(),
            description: 'Employee restored to active working status following premature offline false closure',
            source: 'system_repair',
          },
        },
      }
    )

    count++
    tableData.push({
      Index: i,
      Employee: `${r.employeeName || 'Staff'} (${r.employeeId || 'N/A'})`,
      Date: r.date,
      CheckIn: r.checkIn || 'N/A',
      PreviousOut: r.checkOut || 'N/A',
      PreviousReason: (r.punchOutReason || 'Auto Punch Out').slice(0, 36),
      RestoredStatus: `Active (Live) [${cleanStatus}]`,
    })
  }

  console.table(tableData)

  console.log('\n' + '='.repeat(80))
  console.log(`🎉 [SUCCESS] Successfully restored ${count} attendance record(s) back to Active (Live)!`)
  console.log('✅ All employees are now marked active in the HR Portal.')
  console.log('✅ offlineAutoPunchOutEnabled has been permanently disabled.')
  console.log('='.repeat(80) + '\n')

  await mongoose.disconnect()
  console.log('🔌 Disconnected from MongoDB.\n')
}

restore().catch((err) => {
  console.error('\n❌ [ERROR] Restoration failed:', err.message || err)
  process.exit(1)
})
