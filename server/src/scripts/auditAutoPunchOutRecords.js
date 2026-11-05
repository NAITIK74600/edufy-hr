import mongoose from 'mongoose'
import { AttendanceRecord } from '../models/AttendanceRecord.js'

export async function runAutoPunchOutAudit(options = {}) {
  const isDirect = options.direct ?? false
  let ownConnection = false

  if (mongoose.connection.readyState !== 1) {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edufyi_hr'
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 })
      ownConnection = true
    } catch (err) {
      console.warn('[Audit] MongoDB connection not available for standalone script:', err.message)
      return {
        timestamp: new Date().toISOString(),
        totalAudited: 0,
        falsePositivesCount: 0,
        validClosuresCount: 0,
        records: [],
        summary: 'Database connection not available; dry-run audit skipped.',
      }
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
        recommendedCorrection = 'Device suspended background heartbeat. Recommend restore active session or set standard shift end (19:00).'
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
      console.log(`\n=== AUTO PUNCH-OUT AUDIT REPORT ===`)
      console.log(`Total Records Audited: ${records.length}`)
      console.log(`False Positives (Offline/Jitter): ${falsePositives}`)
      console.log(`Valid Cut-offs: ${validClosures}`)
      console.log(`===================================\n`)
      console.table(report.slice(0, 15).map(r => ({
        Employee: `${r.employeeName} (${r.employeeId})`,
        Date: r.date,
        In: r.checkIn,
        Out: r.checkOut,
        Class: r.classification,
        Reason: r.punchOutReason.slice(0, 30),
      })))
    }

    return auditSummary
  } finally {
    if (ownConnection) {
      await mongoose.disconnect()
    }
  }
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('auditAutoPunchOutRecords.js')) {
  runAutoPunchOutAudit({ direct: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Audit execution error:', err)
      process.exit(1)
    })
}
