import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { AttendanceRecord } from '../models/AttendanceRecord.js'

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

export async function runAutoPunchOutAudit(options = {}) {
  const isDirect = options.direct ?? false
  let ownConnection = false

  if (mongoose.connection.readyState !== 1) {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!mongoUri) {
      console.error('[Audit Error] MONGODB_URI not found in environment or .env file.')
      console.log('Please ensure MONGODB_URI is set in your .env file.')
      return {
        timestamp: new Date().toISOString(),
        totalAudited: 0,
        falsePositivesCount: 0,
        validClosuresCount: 0,
        records: [],
        summary: 'MONGODB_URI not found in .env',
      }
    }

    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
      ownConnection = true
    } catch (err) {
      console.error('[Audit Error] Failed to connect to MongoDB with configured URI:', err.message)
      throw err
    }
  }

  try {
    const records = await AttendanceRecord.find({
      $or: [
        { autoPunchOut: true },
        { punchOutType: 'auto' },
        { punchOutReason: { $regex: /auto|disconnect|inactive|geofence|cut-off/i } },
        { totalHours: { $regex: /Auto Punch Out/i } },
      ],
    }).sort({ date: -1, employeeId: 1 }).lean()

    const report = []
    let falsePositives = 0
    let validClosures = 0

    for (const r of records) {
      const reason = r.punchOutReason || ''
      const reasonCode = r.autoPunchOutReasonCode || ''
      const policy = r.autoPunchOutPolicy || ''

      let classification = 'UNKNOWN'
      let suspectedPolicy = policy || 'UNKNOWN'
      let recommendedCorrection = 'Review with employee'

      if (/disconnect|offline|inactive/i.test(reason) || reasonCode === 'OFFLINE_TIMEOUT' || policy === 'ENGINE_A_OFFLINE') {
        classification = 'FALSE_POSITIVE_OFFLINE'
        suspectedPolicy = 'ENGINE_A_OFFLINE'
        recommendedCorrection = 'Device suspended background heartbeat while employee worked. Recommend HR adjust check-out to shift end (19:00).'
        falsePositives++
      } else if (reasonCode === 'GEOFENCE_EXIT_TIMEOUT' || policy === 'ENGINE_A_GEOFENCE' || /geofence/i.test(reason)) {
        if (r.gpsVerified || r.wifiVerified || (r.distanceMeters !== null && r.distanceMeters <= 50)) {
          classification = 'FALSE_POSITIVE_GEOFENCE'
          recommendedCorrection = 'Employee was physically present in office. False exit triggered by indoor GPS jitter. Recommend restore to actual checkout or 19:00.'
          falsePositives++
        } else {
          classification = 'POTENTIAL_GEOFENCE_EXIT'
          recommendedCorrection = 'Confirmed geofence exit. Verify with employee whether they left premises.'
        }
        suspectedPolicy = 'ENGINE_A_GEOFENCE'
      } else if (reasonCode === 'SYSTEM_DAILY_CUTOFF' || policy === 'ENGINE_B_DAILY_CUTOFF' || /cut-off/i.test(reason)) {
        if (r.shiftCode && /night|overnight|evening/i.test(r.shiftCode)) {
          classification = 'FALSE_POSITIVE_CUTOFF_NIGHT_SHIFT'
          recommendedCorrection = 'Employee assigned to night/evening shift. Cut-off prematurely executed at 21:30. Recommend restore full shift duration.'
          falsePositives++
        } else {
          classification = 'VALID_DAILY_CUTOFF'
          recommendedCorrection = 'Employee forgot to punch out at end of standard shift. Daily 21:30 cut-off was legitimately applied.'
          validClosures++
        }
        suspectedPolicy = 'ENGINE_B_DAILY_CUTOFF'
      } else {
        classification = 'REVIEW_REQUIRED'
        recommendedCorrection = 'Manual review required by HR Admin.'
      }

      report.push({
        recordId: r._id,
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        date: r.date,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        totalHours: r.totalHours,
        status: r.status,
        punchOutReason: reason,
        reasonCode,
        suspectedPolicy,
        classification,
        recommendedCorrection,
        reviewStatus: r.reviewStatus || 'pending',
      })
    }

    const auditSummary = {
      timestamp: new Date().toISOString(),
      totalAudited: records.length,
      falsePositivesCount: falsePositives,
      validClosuresCount: validClosures,
      records: report,
      summary: `Found ${records.length} auto-punchout records. ${falsePositives} identified as false positives (offline / jitter), ${validClosures} valid daily cut-offs.`,
    }

    if (isDirect) {
      console.log(`\n========================================================================`)
      console.log(`               EDUFYI HR AUTO PUNCH-OUT AUDIT REPORT                   `)
      console.log(`========================================================================`)
      console.log(`Total Records Audited: ${records.length}`)
      console.log(`False Positives (Offline / Jitter): ${falsePositives}`)
      console.log(`Valid Daily Cut-offs (Forgot Checkout): ${validClosures}`)
      console.log(`========================================================================\n`)
      if (records.length === 0) {
        console.log(`No automated punch-out records found in database. Attendance data is clean.`)
      } else {
        console.table(report.slice(0, 25).map(r => ({
          Employee: `${r.employeeName || 'Unknown'} (${r.employeeId})`,
          Date: r.date,
          In: r.checkIn || '—',
          Out: r.checkOut || '—',
          Class: r.classification,
          Reason: (r.punchOutReason || '').slice(0, 35),
        })))
      }
    }

    return auditSummary
  } finally {
    if (ownConnection) {
      await mongoose.disconnect()
    }
  }
}

// Allow direct CLI execution: node server/src/scripts/auditAutoPunchOutRecords.js
if (process.argv[1]?.replace(/\\/g, '/').endsWith('auditAutoPunchOutRecords.js')) {
  runAutoPunchOutAudit({ direct: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Audit execution error:', err.message)
      process.exit(1)
    })
}
