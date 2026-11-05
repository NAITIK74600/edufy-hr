import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { AttendanceRecord } from '../models/AttendanceRecord.js'
import { AttendanceSettings } from '../models/AttendanceSettings.js'

// Auto-load .env from multiple candidate paths
try { process.loadEnvFile?.() } catch {}
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envCandidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
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

export async function runFalseAutoPunchOutRestoration(options = {}) {
  let ownConnection = false

  if (mongoose.connection.readyState !== 1) {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!mongoUri) {
      console.error('\n❌ [ERROR] MONGODB_URI not found in environment or .env file.')
      console.error('Please verify that .env exists and contains MONGODB_URI=<connection_string>.\n')
      return { success: false, restoredCount: 0, message: 'MONGODB_URI missing' }
    }

    try {
      console.log('🔄 Connecting to MongoDB database...')
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 })
      ownConnection = true
      console.log('✅ Connected to MongoDB successfully.')
    } catch (err) {
      console.error('\n❌ [ERROR] Failed to connect to MongoDB:', err.message)
      throw err
    }
  }

  try {
    // 1. Permanently disable offline & geofence auto-punchout in AttendanceSettings
    console.log('\n🔒 Step 1: Disabling offline & geofence auto punch-out rules in database settings...')
    const settingsUpdateResult = await AttendanceSettings.updateMany(
      {},
      {
        $set: {
          'attendanceRules.offlineAutoPunchOutEnabled': false,
          'attendanceRules.geofenceAutoPunchOutEnabled': false,
          offlineAutoPunchOutEnabled: false,
          geofenceAutoPunchOutEnabled: false,
        },
      }
    )
    console.log(`✅ Settings secured: ${settingsUpdateResult.matchedCount} setting document(s) updated to offlineAutoPunchOutEnabled = false.`)

    // 2. Identify target dates
    const specificDateArg = process.argv.find((arg) => arg.startsWith('--date='))?.split('=')[1]
    const allDates = process.argv.includes('--all-dates') || Boolean(options.allDates)

    const todayIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const todayUTC = new Date().toISOString().slice(0, 10)
    const targetDates = Array.from(new Set([todayIST, todayUTC, '2026-11-05']))

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

    console.log(`\n🔍 Step 2: Scanning for false positive punch-out records...`)
    if (allDates) {
      console.log(`   Scope: All historical dates`)
    } else {
      console.log(`   Scope: Target dates: ${JSON.stringify(query.date)}`)
    }

    const records = await AttendanceRecord.find(query).sort({ date: -1, employeeId: 1 }).lean()

    if (!records || records.length === 0) {
      console.log('\n✨ No falsely auto-punched out records found. All employee sessions are clean and active!\n')
      return { success: true, restoredCount: 0, records: [] }
    }

    console.log(`\n⚠️  Found ${records.length} falsely auto-punched out record(s) to restore!\n`)

    const tableData = []
    let restoredCount = 0

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

      restoredCount++
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
    console.log(`🎉 [RESTORATION COMPLETE] Successfully restored ${restoredCount} employee(s) back to Active (Live)!`)
    console.log('✅ Check-out has been cleared (checkOut: null).')
    console.log('✅ totalHours has been restored to "Active (Live)".')
    console.log('✅ status has been set back to active (present/late).')
    console.log('✅ offlineAutoPunchOutEnabled is locked to FALSE in AttendanceSettings.')
    console.log('='.repeat(80) + '\n')

    return {
      success: true,
      restoredCount,
      records: tableData,
    }
  } catch (err) {
    console.error('\n❌ [ERROR] Restoration process failed:', err.message)
    throw err
  } finally {
    if (ownConnection) {
      await mongoose.disconnect()
      console.log('🔌 Disconnected from MongoDB.\n')
    }
  }
}

// Auto-run if executed directly
const isDirectCli = process.argv[1] && (
  process.argv[1].endsWith('restoreFalseAutoPunchOuts.js') ||
  process.argv[1].includes('restoreFalseAutoPunchOuts')
)

if (isDirectCli) {
  runFalseAutoPunchOutRestoration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

