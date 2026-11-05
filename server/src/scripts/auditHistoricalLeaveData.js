import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import { LeaveRequest } from '../models/LeaveRequest.js'
import { LeaveBalance } from '../models/LeaveBalance.js'
import { Employee } from '../models/Employee.js'
import { AttendanceSettings } from '../models/AttendanceSettings.js'
import { evaluateLeaveRequest, isInternEmployee, getMonthlyDefaultAllowance } from '../modules/leave/leavePolicyEngine.js'

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env') } catch {}
}

const isDryRun = !process.argv.includes('--apply')

export async function runHistoricalAudit() {
  console.log('='.repeat(80))
  console.log(`[HISTORICAL LEAVE AUDIT] Mode: ${isDryRun ? 'DRY-RUN (Safe inspection, no writes)' : 'APPLY (Live corrections)'}`)
  console.log('='.repeat(80))

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/edufy-hr'
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(mongoUri)
      console.log(`Connected to MongoDB at ${mongoUri}`)
    } catch (err) {
      console.warn(`Could not connect to MongoDB: ${err.message}. Skipping live DB scan.`)
      return { success: false, error: err.message }
    }
  }

  try {
    const settings = (await AttendanceSettings.findOne().lean()) || {}
    const requests = await LeaveRequest.find().lean()
    const balances = await LeaveBalance.find().lean()
    const employees = await Employee.find().lean()

    console.log(`\nFound: ${requests.length} leave requests, ${balances.length} balance records, ${employees.length} employees.\n`)

    let falseDoubleLopCount = 0
    let legacyMissingBreakdownCount = 0
    let validCount = 0

    const discrepancies = []

    for (const req of requests) {
      const isPaid = (req.paidUnits > 0) || ['casual', 'sick', 'earned'].includes(req.leaveType)
      const hadDoubleLopFlag = Boolean(req.isDoubleLop || (req.doubleLopDays > 0))

      // Check if it was a paid leave incorrectly marked as Double LOP
      if (isPaid && hadDoubleLopFlag && (!req.dayBreakdown || req.dayBreakdown.every((d) => d.isPaid))) {
        falseDoubleLopCount++
        discrepancies.push({
          id: req._id,
          employeeId: req.employeeId,
          leaveType: req.leaveType,
          startDate: req.startDate,
          endDate: req.endDate,
          units: req.units,
          paidUnits: req.paidUnits,
          issue: 'PAID_LEAVE_FLAGGED_AS_DOUBLE_LOP',
          action: isDryRun ? 'PROPOSED_CLEAR_DOUBLE_LOP' : 'CLEARED_DOUBLE_LOP',
        })

        if (!isDryRun) {
          await LeaveRequest.updateOne(
            { _id: req._id },
            {
              $set: {
                isDoubleLop: false,
                doubleLopDays: 0,
                doubleLopUnits: 0,
                policySnapshot: {
                  ...req.policySnapshot,
                  historicalAuditCorrectionAt: new Date().toISOString(),
                  auditReason: 'Cleared false Double LOP flag on 100% paid leave',
                },
              },
            }
          )
        }
      } else if (!req.dayBreakdown || req.dayBreakdown.length === 0) {
        legacyMissingBreakdownCount++
      } else {
        validCount++
      }
    }

    console.log('--- AUDIT SUMMARY ---')
    console.log(`Total Requests Scanned:              ${requests.length}`)
    console.log(`Accurate / Valid Requests:           ${validCount}`)
    console.log(`Legacy Requests (without breakdown): ${legacyMissingBreakdownCount}`)
    console.log(`False Double LOP on Paid Leaves:     ${falseDoubleLopCount}`)

    if (discrepancies.length > 0) {
      console.log('\nSample Discrepancies Found (up to 5):')
      console.table(discrepancies.slice(0, 5))
    }

    if (isDryRun && falseDoubleLopCount > 0) {
      console.log('\n[RECOMMENDATION] Run `node server/src/scripts/auditHistoricalLeaveData.js --apply` to execute safe auditable corrections.')
    } else if (!isDryRun) {
      console.log(`\n[SUCCESS] Successfully corrected ${falseDoubleLopCount} false Double LOP records in MongoDB!`)
    } else {
      console.log('\n[SUCCESS] No false Double LOP classifications found. Database records are clean.')
    }

    return {
      success: true,
      totalScanned: requests.length,
      falseDoubleLopCount,
      legacyMissingBreakdownCount,
      validCount,
      discrepancies,
    }
  } catch (err) {
    console.error('Audit failed with error:', err)
    return { success: false, error: err.message }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runHistoricalAudit().catch(console.error)
}
