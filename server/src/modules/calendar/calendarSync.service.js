import { CalendarEvent } from '../../models/CalendarEvent.js'
import { Employee } from '../../models/Employee.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { workspaceModels } from '../../models/Workspace.js'
import { extractEmployeeDob } from './dobHelper.js'
import { normalizeDateString, parseYearMonthSafe } from '../../utils/dateHelper.js'

/**
 * Intelligent HR Automation & Calendar Sync Engine
 * Safely synchronizes employee lifecycle events, approved leaves, and company holidays.
 * Ensures zero duplicate generation via unique `sourceType` and `sourceId` indexing.
 * STRICT: Never alters employee records, attendance records, or payroll calculations.
 */

export const calendarSyncService = {
  /**
   * Run a full idempotent sync of HR lifecycle events into CalendarEvent collection
   */
  async syncAllHREvents(targetYear = new Date().getFullYear()) {
    const summary = {
      birthdays: 0,
      anniversaries: 0,
      joinings: 0,
      probations: 0,
      contracts: 0,
      approvedLeaves: 0,
      holidays: 0,
      totalSynced: 0,
    }

    try {
      // 1. Sync Employee Lifecycle: Birthdays, Anniversaries, Joinings, Probations
      const employees = await Employee.find({
        status: { $nin: ['inactive', 'resigned', 'terminated', 'deleted'] },
      }).lean().catch(() => [])

      for (const emp of employees) {
        const empId = String(emp.employeeId || emp._id)
        const empName = emp.displayName || emp.name || 'Employee'
        const dept = emp.department || 'General'

        // A. Birthday (Dynamic calculation from MongoDB employee records)
        const dobInfo = extractEmployeeDob(emp)
        if (dobInfo) {
          const bMonth = String(dobInfo.month).padStart(2, '0')
          const bDay = dobInfo.day
          const bdayDate = `${targetYear}-${bMonth}-${bDay}`
          const sourceId = `bday_${empId}_${targetYear}`

          await CalendarEvent.findOneAndUpdate(
            { sourceType: 'employee_birthday', sourceId },
            {
              title: `${empName}'s Birthday`,
              description: `Wish ${empName} a very Happy Birthday! Department: ${dept}.`,
              category: 'Employee Birthday',
              date: bdayDate,
              startDate: bdayDate,
              endDate: bdayDate,
              allDay: true,
              department: dept,
              applicableDepartments: ['All'],
              organizer: { employeeId: 'SYSTEM', name: 'HR Automations' },
              priority: 'normal',
              visibility: 'public',
              status: 'confirmed',
              sourceType: 'employee_birthday',
              sourceId,
              sourceData: { employeeId: empId, name: empName, department: dept },
            },
            { upsert: true }
          )
          summary.birthdays++
        }

        // B. Work Anniversary & Joining
        if (emp.joiningDate) {
          const jDate = new Date(emp.joiningDate)
          if (!isNaN(jDate.getTime())) {
            const jYear = jDate.getUTCFullYear()
            const jMonth = String(jDate.getUTCMonth() + 1).padStart(2, '0')
            const jDay = String(jDate.getUTCDate()).padStart(2, '0')
            const completedYears = targetYear - jYear

            // New joining event if joined this target year
            if (jYear === targetYear) {
              const joinDateStr = `${jYear}-${jMonth}-${jDay}`
              const sourceId = `join_${empId}`
              await CalendarEvent.findOneAndUpdate(
                { sourceType: 'employee_joining', sourceId },
                {
                  title: `Welcome ${empName} to ${dept}!`,
                  description: `${empName} joins Edufyi Tech as ${emp.designation || 'Team Member'}.`,
                  category: 'Employee Onboarding',
                  date: joinDateStr,
                  startDate: joinDateStr,
                  endDate: joinDateStr,
                  allDay: true,
                  department: dept,
                  organizer: { employeeId: 'SYSTEM', name: 'HR Automations' },
                  priority: 'high',
                  visibility: 'public',
                  status: 'confirmed',
                  sourceType: 'employee_joining',
                  sourceId,
                  sourceData: { employeeId: empId, name: empName, designation: emp.designation },
                },
                { upsert: true }
              )
              summary.joinings++
            }

            // Work Anniversary
            if (completedYears > 0) {
              const annivDate = `${targetYear}-${jMonth}-${jDay}`
              const sourceId = `anniv_${empId}_${targetYear}`
              await CalendarEvent.findOneAndUpdate(
                { sourceType: 'employee_anniversary', sourceId },
                {
                  title: `${empName} · ${completedYears} Year${completedYears > 1 ? 's' : ''} Work Anniversary`,
                  description: `Celebrating ${completedYears} year(s) of dedication with ${empName}!`,
                  category: 'Work Anniversary',
                  date: annivDate,
                  startDate: annivDate,
                  endDate: annivDate,
                  allDay: true,
                  department: dept,
                  applicableDepartments: ['All'],
                  organizer: { employeeId: 'SYSTEM', name: 'HR Automations' },
                  priority: 'normal',
                  visibility: 'public',
                  status: 'confirmed',
                  sourceType: 'employee_anniversary',
                  sourceId,
                  sourceData: { employeeId: empId, name: empName, completedYears },
                },
                { upsert: true }
              )
              summary.anniversaries++
            }

            // C. Probation Completion (Default 90 days / 3 months from joining)
            const probationMonths = Number(emp.probationPeriodMonths) || 3
            const probDate = new Date(jDate.getTime())
            probDate.setMonth(probDate.getMonth() + probationMonths)
            if (probDate.getUTCFullYear() === targetYear) {
              const probMonth = String(probDate.getUTCMonth() + 1).padStart(2, '0')
              const probDay = String(probDate.getUTCDate()).padStart(2, '0')
              const probDateStr = `${targetYear}-${probMonth}-${probDay}`
              const sourceId = `probation_${empId}`

              await CalendarEvent.findOneAndUpdate(
                { sourceType: 'employee_probation', sourceId },
                {
                  title: `Probation Review: ${empName}`,
                  description: `${empName} completes ${probationMonths}-month probation period. Performance evaluation due.`,
                  category: 'Probation Completion',
                  date: probDateStr,
                  startDate: probDateStr,
                  endDate: probDateStr,
                  allDay: true,
                  department: dept,
                  organizer: { employeeId: 'SYSTEM', name: 'HR Operations' },
                  priority: 'high',
                  visibility: 'department',
                  status: 'scheduled',
                  sourceType: 'employee_probation',
                  sourceId,
                  sourceData: { employeeId: empId, name: empName, managerId: emp.managerId },
                },
                { upsert: true }
              )
              summary.probations++
            }
          }
        }

        // D. Contract Expiry
        if (emp.contractEndDate) {
          const cDate = new Date(emp.contractEndDate)
          if (!isNaN(cDate.getTime()) && cDate.getUTCFullYear() === targetYear) {
            const cMonth = String(cDate.getUTCMonth() + 1).padStart(2, '0')
            const cDay = String(cDate.getUTCDate()).padStart(2, '0')
            const cDateStr = `${targetYear}-${cMonth}-${cDay}`
            const sourceId = `contract_${empId}`

            await CalendarEvent.findOneAndUpdate(
              { sourceType: 'employee_contract', sourceId },
              {
                title: `Contract Expiration: ${empName}`,
                description: `Employment contract for ${empName} (${emp.designation || 'Staff'}) reaches end date.`,
                category: 'Contract Expiry',
                date: cDateStr,
                startDate: cDateStr,
                endDate: cDateStr,
                allDay: true,
                department: dept,
                organizer: { employeeId: 'SYSTEM', name: 'HR Operations' },
                priority: 'urgent',
                visibility: 'department',
                status: 'scheduled',
                sourceType: 'employee_contract',
                sourceId,
                sourceData: { employeeId: empId, name: empName },
              },
              { upsert: true }
            )
            summary.contracts++
          }
        }
      }

      // 2. Sync Approved Leaves (STRICT: ONLY status === 'approved')
      const approvedLeaves = await LeaveRequest.find({
        status: 'approved',
      }).lean().catch(() => [])

      for (const leave of approvedLeaves) {
        const startStr = normalizeDateString(leave.startDate)
        const endStr = normalizeDateString(leave.endDate) || startStr
        if (!startStr) continue
        const { year: lYear } = parseYearMonthSafe(startStr, targetYear)
        const { year: lEndYear } = parseYearMonthSafe(endStr, targetYear)
        if (lYear !== targetYear && lEndYear !== targetYear) {
          continue
        }

        const sourceId = `leave_${leave._id}`
        const empName = leave.employeeName || 'Staff Member'
        const leaveType = leave.leaveType || 'Leave'

        await CalendarEvent.findOneAndUpdate(
          { sourceType: 'leave_approved', sourceId },
          {
            title: `${empName} · On Leave (${leaveType})`,
            description: `Approved ${leaveType} leave for ${empName}. Duration: ${leave.daysCount || 1} day(s).`,
            category: 'Leave-related Entry',
            date: startStr,
            startDate: startStr,
            endDate: endStr,
            allDay: true,
            department: leave.department || 'General',
            organizer: { employeeId: leave.employeeId, name: empName },
            priority: 'normal',
            visibility: 'public',
            status: 'confirmed',
            sourceType: 'leave_approved',
            sourceId,
            sourceData: {
              leaveRequestId: String(leave._id),
              employeeId: leave.employeeId,
              leaveType,
              approvedBy: leave.approvedBy,
            },
          },
          { upsert: true, returnDocument: 'after' }
        )
        summary.approvedLeaves++
      }

      // 3. Sync Company Holidays
      const holidays = await workspaceModels.holidays.find({
        status: { $ne: 'inactive' },
      }).lean().catch(() => [])

      for (const h of holidays) {
        const hDateStr = normalizeDateString(h.date)
        const hEndDateStr = normalizeDateString(h.endDate) || hDateStr
        if (!hDateStr) continue
        const { year: hYear } = parseYearMonthSafe(hDateStr, targetYear)
        if (!h.isRecurring && hYear !== targetYear) continue

        const effectiveDate = h.isRecurring ? `${targetYear}-${hDateStr.slice(5)}` : hDateStr
        const effectiveEndDate = h.endDate ? (h.isRecurring ? `${targetYear}-${hEndDateStr.slice(5)}` : hEndDateStr) : effectiveDate
        const sourceId = `holiday_${h._id}_${targetYear}`

        await CalendarEvent.findOneAndUpdate(
          { sourceType: 'holiday', sourceId },
          {
            title: h.name || h.title || 'Official Holiday',
            description: h.description || 'Company Holiday',
            category: 'Company Holiday',
            date: effectiveDate,
            startDate: effectiveDate,
            endDate: effectiveEndDate,
            allDay: true,
            location: { name: h.location || 'All Offices' },
            department: 'All',
            applicableDepartments: h.applicableDepartments || ['All'],
            organizer: { employeeId: 'SYSTEM', name: 'HR Management' },
            priority: 'normal',
            visibility: 'public',
            status: 'confirmed',
            sourceType: 'holiday',
            sourceId,
            sourceData: { holidayId: String(h._id), isPaid: h.isPaid !== false },
          },
          { upsert: true, returnDocument: 'after' }
        )
        summary.holidays++
      }

      summary.totalSynced =
        summary.birthdays +
        summary.anniversaries +
        summary.joinings +
        summary.probations +
        summary.contracts +
        summary.approvedLeaves +
        summary.holidays
    } catch (err) {
      console.error('[CalendarSync Error]:', err.message)
    }

    return summary
  },

  /**
   * Cleanly remove synced events when an underlying record is revoked (e.g. cancelled leave)
   */
  async removeLeaveCalendarEvent(leaveRequestId) {
    if (!leaveRequestId) return
    return CalendarEvent.deleteMany({
      sourceType: 'leave_approved',
      sourceId: `leave_${leaveRequestId}`,
    })
  },
}

