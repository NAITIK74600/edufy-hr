import { hasPermission, PERMISSIONS } from '../../auth/permissions.js'
import mongoose from 'mongoose'
import { mailService, sendLeaveSubmissionEmail, sendLeaveStatusEmail } from '../../services/mail.service.js'
import { createUnifiedNotification } from '../../services/unifiedNotification.service.js'

const ACTIVE_STATUSES = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved']
const TRANSITIONS = Object.freeze({
  pending_tl: ['approved', 'rejected', 'cancelled'],
  pending_manager: ['approved', 'pending_hr', 'rejected', 'cancelled'],
  pending_director: ['approved', 'rejected', 'cancelled'],
  pending_hr: ['approved', 'pending_admin', 'rejected', 'cancelled'],
  pending_admin: ['approved', 'rejected', 'cancelled'],
  approved: ['cancelled'],
  rejected: [],
  cancelled: [],
})

export function is25thMonthLop(startDate, endDate, leaveType, isDoubleLop, doubleLopDays) {
  if (isDoubleLop || (Number(doubleLopDays) > 0)) return true
  const s = new Date(startDate)
  const e = new Date(endDate || startDate)
  if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
    for (const cur = new Date(s); cur <= e; cur.setUTCDate(cur.getUTCDate() + 1)) {
      if (cur.getUTCDate() >= 25) return true
    }
  }
  if (String(leaveType).toLowerCase() === 'lop') {
    if (s.getUTCDate() >= 25 || e.getUTCDate() >= 25) return true
  }
  return false
}

function error(message, statusCode = 400, code = 'LEAVE_VALIDATION_ERROR', fields = {}) {
  const result = new Error(message)
  result.statusCode = statusCode
  result.code = code
  result.fields = fields
  return result
}

function idOf(value) {
  if (!value) return null
  return String(value._id ?? value.id ?? value)
}

function parseDate(value, field) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) throw error(`Invalid ${field}.`, 400, 'VALIDATION_ERROR', { [field]: 'Use an ISO date.' })
  date.setUTCHours(0, 0, 0, 0)
  return date
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

function calculateUnits(startDate, endDate, policy) {
  return calculateUnitsBreakdown(startDate, endDate, policy).totalUnits
}

function calculateUnitsBreakdown(startDate, endDate, policy) {
  if (!policy?.configured) throw error(`The ${policy?.label ?? 'leave'} policy is not configured. HR must confirm its rules before leave can be calculated.`, 409, 'LEAVE_POLICY_NOT_CONFIGURED')
  const holidayKeys = new Set((policy.holidayDates ?? []).map((date) => dateKey(new Date(date))))
  const isLopType = String(policy?.leaveType || '').toLowerCase() === 'lop'
  let totalUnits = 0
  let paidUnits = 0
  let doubleLopDays = 0

  for (const cursor = new Date(startDate); cursor <= endDate; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay()
    const weekend = day === 0 || day === 6
    const holiday = holidayKeys.has(dateKey(cursor))
    if ((!weekend || policy.countWeekends) && (!holiday || policy.countHolidays)) {
      totalUnits += 1
      const dayOfMonth = cursor.getUTCDate()
      if (isLopType) {
        // Loss of Pay is completely unpaid
        doubleLopDays += 1
      } else if (dayOfMonth >= 25) {
        // Month end: 25th onwards is considered Double LOP
        doubleLopDays += 1
      } else {
        paidUnits += 1
      }
    }
  }

  if (totalUnits <= 0) throw error('The selected range contains no payable leave units under the configured policy.', 400, 'INVALID_LEAVE_RANGE')

  return {
    totalUnits,
    paidUnits,
    doubleLopDays,
    isDoubleLop: doubleLopDays > 0,
  }
}

function isInternEmployee(employee) {
  const type = String(employee?.employmentType || '').toLowerCase().replace(/[-\s]/g, '_')
  const desig = String(employee?.designation || '').toLowerCase()
  const role = String(employee?.role || '').toLowerCase()
  return type === 'intern' || desig.includes('intern') || role.includes('intern')
}

function getMonthlyDefaultAllowance(employee, leaveType) {
  const intern = isInternEmployee(employee)
  const type = String(leaveType).toLowerCase()
  if (intern) {
    // Intern: 1 paid leave in month and 1 sick leave (i.e. only 1 sick leave, 0 casual)
    return type === 'sick' ? 1 : 0
  }
  // Full-timer: 2 paid leaves in month (1 sick leave, 1 casual leave)
  return (type === 'casual' || type === 'sick') ? 1 : 0
}

function assertTransition(from, to) {
  if (!TRANSITIONS[from]?.includes(to)) throw error(`Cannot move a ${from} request to ${to}.`, 409, 'INVALID_STATUS_TRANSITION')
}

function actorCanAccess(request, actor, permission, employeeId) {
  const isLeadership = ['admin', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role) || actor?.email === 'jagadishbabu@edufyitech.in'
  if (isLeadership) return true
  if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) || hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW)) return true

  const reqMgrId = idOf(request.managerId)
  const empMgrId = idOf(request.employeeId?.managerId)
  const candidateActorIds = [idOf(actor?.id), idOf(actor?._id), actor?.employeeId].filter(Boolean).map(String)

  // Default access: Assigned manager always has access to review their reportees' requests
  if (candidateActorIds.includes(String(reqMgrId)) || candidateActorIds.includes(String(empMgrId))) {
    return true
  }

  if (permission === PERMISSIONS.LEAVE_TEAM_READ || permission === PERMISSIONS.LEAVE_TEAM_APPROVE) {
    if (candidateActorIds.includes(String(reqMgrId)) || candidateActorIds.includes(String(empMgrId))) return true
    return false
  }
  const reqEmpId = idOf(request.employeeId)
  const reqEmpCode = request.employeeId?.employeeId || (typeof request.employeeId === 'string' ? request.employeeId : null)
  const candidateIds = [
    idOf(employeeId),
    idOf(actor?.id),
    idOf(actor?._id),
    actor?.employeeId,
    actor?.empId,
    actor?.email
  ].filter(Boolean).map(String)

  return candidateIds.includes(String(reqEmpId)) || (reqEmpCode && candidateIds.includes(String(reqEmpCode)))
}

function publicRequest(request) {
  if (!request) return null
  return { ...request, id: idOf(request), employeeId: request.employeeId, managerId: request.managerId, approvalHistory: request.approvalHistory ?? [], comments: request.comments ?? [] }
}

export function createLeaveService({ repository, employeeRepository, notificationService } = {}) {
  const notifier = notificationService ?? { notify: async (payload) => repository.notify?.(payload) }

  async function getEmployee(actor) {
    const employee = await employeeRepository.findById(actor.id)
    if (!employee) throw error('Your employee record could not be resolved.', 403, 'EMPLOYEE_RECORD_NOT_FOUND')
    return employee
  }

  async function getPolicy(leaveType) {
    const policy = await repository.getPolicy(String(leaveType).toLowerCase())
    if (!policy) throw error(`No leave policy exists for ${leaveType}.`, 400, 'LEAVE_POLICY_NOT_FOUND')
    return policy
  }

  async function getRequest(id, actor, scope = 'self') {
    const request = await repository.findRequest(id)
    if (!request) throw error('Leave request not found.', 404, 'LEAVE_REQUEST_NOT_FOUND')
    const permission = scope === 'team' ? PERMISSIONS.LEAVE_TEAM_READ : scope === 'hr' ? PERMISSIONS.LEAVE_HR_READ : PERMISSIONS.LEAVE_SELF_READ
    const canUseReviewPermission = (scope === 'team' && hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE)) || (scope === 'hr' && hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW))
    if ((!hasPermission(actor, permission) && !canUseReviewPermission) || !actorCanAccess(request, actor, permission)) throw error('You do not have access to this leave request.', 403, 'FORBIDDEN')
    return request
  }

  async function releaseReservation(request) {
    const unitsToRelease = request.paidUnits !== undefined ? request.paidUnits : request.units
    if (unitsToRelease > 0 && ACTIVE_STATUSES.includes(request.status)) {
      await repository.releaseReservation(request.employeeId, request.leaveType, unitsToRelease)
    }
  }

  async function notifyRecipient(recipientId, event, request, message, title = 'Leave Notice', targetUrl = '#/employee/leave', priority = 'normal') {
    if (!recipientId) return
    const recIdStr = String(recipientId)
    const normalizedEvent = String(event || 'leave.notice').toLowerCase().replace(/_/g, '.')
    const eventType = String(event || 'LEAVE_NOTICE').toUpperCase().replace(/\./g, '_')
    if (notifier?.notify) {
      try {
        await notifier.notify({ recipientId: recIdStr, event: normalizedEvent, entityId: idOf(request), message, title })
      } catch {}
    }
    if (mongoose?.connection?.readyState === 1) {
      try {
        await createUnifiedNotification({
          employeeId: recIdStr,
          recipientId: recIdStr,
          title: title || 'Leave Notice',
          message: message || '',
          category: 'leave',
          eventType,
          relatedEntityId: idOf(request),
          targetUrl: targetUrl || '#/employee/leave',
          priority: priority || 'normal',
        })
      } catch (err) {
        console.warn('[leave.service] Notification warning:', err?.message || err)
      }
    }
  }

  async function notifyHr(event, request, message) {
    if (!notifier?.notify || !employeeRepository.list) return
    const result = await employeeRepository.list({ limit: 100, status: 'active' })
    const recipients = (result.records ?? result ?? []).filter((employee) =>
      ['admin', 'hr', 'director', 'managing_director', 'co_founder'].includes(employee.role)
    )
    await Promise.all(recipients.map((employee) => notifyRecipient(idOf(employee), event, request, message)))
  }

  async function notifyAdmin(event, request, message) {
    if (!notifier?.notify || !employeeRepository.list) return
    const result = await employeeRepository.list({ limit: 100, status: 'active' })
    const recipients = (result.records ?? result ?? []).filter((employee) => employee.role === 'admin')
    await Promise.all(recipients.map((employee) => notifyRecipient(idOf(employee), event, request, message)))
  }

  return {
    async submit(payload, actor, targetEmployeeId) {
      if (targetEmployeeId ? (!hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) && !['admin', 'hr'].includes(actor.role)) : !hasPermission(actor, PERMISSIONS.LEAVE_SELF_WRITE)) throw error('You cannot submit leave requests.', 403, 'FORBIDDEN')
      const employee = targetEmployeeId ? await employeeRepository.findById(targetEmployeeId) : await getEmployee(actor)
      if (!employee || !['active', 'notice'].includes(employee.status)) throw error('Select an active employee.', 400, 'EMPLOYEE_RECORD_NOT_FOUND')
      const leaveType = String(payload.leaveType ?? '').trim().toLowerCase()
      const policy = await getPolicy(leaveType)
      const isHalfDay = Boolean(payload.isHalfDay || payload.days === 0.5)
      const halfDayPeriod = isHalfDay ? (payload.halfDayPeriod || 'first_half') : null
      const startDate = parseDate(payload.startDate, 'startDate')
      const endDate = isHalfDay ? startDate : parseDate(payload.endDate, 'endDate')
      if (endDate < startDate) throw error('End date must be on or after start date.', 400, 'INVALID_LEAVE_RANGE', { endDate: 'Must be on or after start date.' })
      if (policy.requiresReason && !String(payload.reason ?? '').trim()) throw error('A reason is required for this leave type.', 400, 'VALIDATION_ERROR', { reason: 'Required.' })
      let { totalUnits, paidUnits, doubleLopDays, isDoubleLop } = calculateUnitsBreakdown(startDate, endDate, policy)
      if (isHalfDay) {
        totalUnits = 0.5
        paidUnits = paidUnits > 0 ? 0.5 : 0
        doubleLopDays = doubleLopDays > 0 ? 0.5 : 0
        isDoubleLop = doubleLopDays > 0
      }
      const units = totalUnits
      const overlap = await repository.findOverlap({ employeeId: idOf(employee), startDate, endDate, isHalfDay, halfDayPeriod })
      if (overlap) {
        const canCancel = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'].includes(overlap.status)
        if (payload.replaceOverlap && canCancel) {
          await this.cancel(idOf(overlap), actor, { forceOverride: true })
          let secondaryOverlap = await repository.findOverlap({ employeeId: idOf(employee), startDate, endDate, isHalfDay, halfDayPeriod })
          while (secondaryOverlap && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'].includes(secondaryOverlap.status)) {
            await this.cancel(idOf(secondaryOverlap), actor, { forceOverride: true })
            secondaryOverlap = await repository.findOverlap({ employeeId: idOf(employee), startDate, endDate, isHalfDay, halfDayPeriod })
          }
        } else {
          const overlapStart = overlap.startDate ? new Date(overlap.startDate).toISOString().slice(0, 10) : ''
          const overlapEnd = overlap.endDate ? new Date(overlap.endDate).toISOString().slice(0, 10) : ''
          throw error(
            `This leave range overlaps an existing active request (${overlapStart} to ${overlapEnd}).`,
            409,
            'LEAVE_OVERLAP',
            {
              overlappingRequestId: idOf(overlap),
              overlappingStatus: overlap.status,
              overlappingStartDate: overlapStart,
              overlappingEndDate: overlapEnd,
              overlappingReason: overlap.reason,
              canCancelExisting: canCancel,
            }
          )
        }
      }
      // Resolve the direct reporting manager for this employee from database
      let directManager = null
      const rawMgrId = employee.managerId?._id || employee.managerId?.id || employee.managerId
      if (rawMgrId) {
        try {
          if (mongoose?.connection?.readyState === 1) {
            const { Employee } = await import('../../models/Employee.js')
            directManager = await Employee.findById(rawMgrId).lean()
          }
          if (!directManager) {
            directManager = await employeeRepository.findById(rawMgrId)
          }
        } catch {}
      }
      if (!directManager && employee.reportingManager) {
        try {
          if (mongoose?.connection?.readyState === 1) {
            const { Employee } = await import('../../models/Employee.js')
            directManager = await Employee.findOne({
              $or: [
                { employeeId: String(employee.reportingManager).trim().toUpperCase() },
                { email: String(employee.reportingManager).trim().toLowerCase() },
                { name: String(employee.reportingManager).trim() },
                { displayName: String(employee.reportingManager).trim() },
              ],
            }).lean()
          }
        } catch {}
      }
      if (!directManager && employee.department && mongoose?.connection?.readyState === 1) {
        try {
          const { Employee } = await import('../../models/Employee.js')
          directManager = await Employee.findOne({
            department: employee.department,
            role: { $in: ['manager', 'director', 'managing_director', 'vertical_head', 'team_lead', 'team_leader'] },
            status: 'active',
            _id: { $ne: employee._id },
          }).lean()
        } catch {}
      }

      const directManagerId = directManager ? idOf(directManager) : (rawMgrId ? String(rawMgrId) : null)
      let managerId = directManagerId

      const defaultAllowance = getMonthlyDefaultAllowance(employee, leaveType)
      const targetAllowance = policy.annualAllowance != null ? policy.annualAllowance : defaultAllowance
      if (repository.ensureBalance) await repository.ensureBalance(idOf(employee), leaveType, targetAllowance)

      let reserved = true
      if (paidUnits > 0) {
        reserved = await repository.reserveBalance(idOf(employee), leaveType, paidUnits)
        if (!reserved) {
          await repository.ensureBalance?.(idOf(employee), leaveType, targetAllowance)
          reserved = await repository.reserveBalance(idOf(employee), leaveType, paidUnits)
          if (!reserved) {
            throw error(`Insufficient leave balance. You have less than ${paidUnits} paid leave unit(s) remaining for this month. Note that leave on or after the 25th is considered Double LOP.`, 409, 'INSUFFICIENT_LEAVE_BALANCE')
          }
        }
      }

      // Determine initial approval status based on configured leave policy and reporting hierarchy
      const configuredStage = String(policy?.approvalStage || 'manager').toLowerCase().trim()
      const isDirectorApplicant = ['director', 'managing_director', 'co_founder'].includes(employee.role)
      const isManagerApplicant = ['manager', 'revenue_growth_manager', 'senior_manager', 'vertical_head'].includes(employee.role)
      const isDirectManagerDirector = directManager && ['director', 'managing_director', 'co_founder'].includes(directManager.role)
      const isLopMonthLeave = is25thMonthLop(startDate, endDate, leaveType, isDoubleLop, doubleLopDays)

      let status = 'pending_manager'

      if (isLopMonthLeave) {
        // Month-end (>=25th) LOP leave mandates HR verification first
        status = 'pending_hr'
      } else if (configuredStage === 'hr') {
        // Policy explicitly mandates direct HR Operations review
        status = 'pending_hr'
      } else if (configuredStage === 'director') {
        // Policy explicitly mandates Director sign-off
        status = 'pending_director'
      } else if (configuredStage === 'tl') {
        // Policy explicitly mandates Team Lead review
        status = 'pending_tl'
      } else if (isDirectorApplicant) {
        // Director self-leave
        status = 'approved'
      } else if (isManagerApplicant) {
        // Department Manager reporting to Managing Director / Executive Leadership
        status = 'pending_director'
      } else if (directManager) {
        // Standard Employee with an assigned reporting manager:
        // Always routes to their assigned reporting manager for review!
        if (directManager.role === 'team_lead' || directManager.role === 'team_leader') {
          status = 'pending_tl'
        } else {
          status = 'pending_manager'
        }
      } else {
        // Fallback when no manager is configured for this employee in the system:
        // Routes to HR Operations
        status = 'pending_hr'
        const hrResult = await employeeRepository.list({ limit: 50, status: 'active' })
        const hrUsers = (hrResult.records ?? hrResult ?? []).filter((e) => ['hr', 'admin'].includes(e.role))
        if (hrUsers.length > 0) managerId = idOf(hrUsers[0])
      }
      let request
      try {
        request = await repository.createRequest({
          employeeId: idOf(employee),
          managerId,
          leaveType,
          startDate,
          endDate,
          units,
          paidUnits,
          isHalfDay,
          halfDayPeriod,
          isDoubleLop,
          doubleLopDays,
          reason: String(payload.reason).trim(),
          status,
          approvalHistory: [{ action: 'submitted', toStatus: status, actorId: actor.id, actorRole: actor.role }],
        })
      } catch (saveError) {
        if (paidUnits > 0) await repository.releaseReservation(idOf(employee), leaveType, paidUnits)
        throw saveError
      }
      const empName = employee.name || 'Employee'
      const leaveTypeUpper = leaveType.toUpperCase()

      // 1. Notify HR Operations
      if (isLopMonthLeave) {
        await notifyHr('LEAVE_HR_REVIEW_REQUIRED', request, `${empName} submitted a 25th Month LOP leave request requiring HR review before Admin approval.`, `⚠️ 25th Month LOP Leave: ${empName}`)
      } else {
        await notifyHr('LEAVE_SUBMITTED', request, `${empName} applied for ${units} day(s) of ${leaveTypeUpper} (${startDate} to ${endDate}).`, `Leave Submitted: ${empName}`)
      }

      // 2. Notify Direct Reporting Manager / Director (In-app + Device Web Push + Email)
      let recipientManagerId = directManagerId || managerId
      if (!recipientManagerId && mongoose?.connection?.readyState === 1) {
        try {
          const { Employee } = await import('../../models/Employee.js')
          const executive = await Employee.findOne({
            role: { $in: ['director', 'managing_director', 'admin', 'hr'] },
            status: { $ne: 'inactive' },
            _id: { $ne: employee._id },
          }).lean()
          if (executive) {
            recipientManagerId = idOf(executive)
            directManager = executive
          }
        } catch {}
      }

      if (recipientManagerId && String(recipientManagerId) !== String(idOf(employee))) {
        await notifyRecipient(
          recipientManagerId,
          'LEAVE_SUBMITTED',
          request,
          `${empName} (${employee.department || 'Team'}) applied for ${units} day(s) of ${leaveTypeUpper} (${startDate} to ${endDate}). Reason: "${payload.reason}"`,
          `📅 New Team Leave: ${empName} (${leaveTypeUpper})`,
          '#/hr/leave',
          'high'
        )
      }

      // 3. If routed to Director (e.g. for Manager or HR applicant), notify all active Directors
      if (status === 'pending_director' && mongoose?.connection?.readyState === 1) {
        try {
          const { Employee } = await import('../../models/Employee.js')
          const directors = await Employee.find({ role: { $in: ['director', 'managing_director'] }, status: { $ne: 'inactive' } }).lean()
          for (const dir of directors) {
            if (String(idOf(dir)) !== String(recipientManagerId) && String(idOf(dir)) !== String(idOf(employee))) {
              await notifyRecipient(
                idOf(dir),
                'LEAVE_SUBMITTED',
                request,
                `${empName} (${(employee.role || 'Team').toUpperCase()}) submitted a leave request (${startDate} to ${endDate}) requiring executive approval. Reason: "${payload.reason}"`,
                `👔 Executive Leave Request: ${empName} (${leaveTypeUpper})`,
                '#/hr/leave',
                'high'
              )
              if (dir.email) {
                await sendLeaveSubmissionEmail({
                  employee,
                  manager: dir,
                  leaveRequest: request,
                }).catch(() => {})
              }
            }
          }
        } catch (dirNoticeErr) {
          console.warn('[leave.service] Director notify notice:', dirNoticeErr?.message || dirNoticeErr)
        }
      }

      // 4. Notify the Submitting Employee
      await notifyRecipient(idOf(employee), 'LEAVE_SUBMITTED', request, `Your leave request for ${startDate} to ${endDate} (${units} days) has been submitted for approval.`, `Leave Request Submitted (${leaveTypeUpper})`, '#/employee/leave')

      // 5. Send Email to Direct Manager and Employee
      try {
        const mgrForEmail = directManager || (recipientManagerId ? await employeeRepository.findById(recipientManagerId) : null)
        await sendLeaveSubmissionEmail({
          employee,
          manager: mgrForEmail,
          leaveRequest: request,
        })
      } catch (mailErr) {
        console.warn('[leave.service] Leave submission email notice:', mailErr?.message || mailErr)
      }
      return publicRequest(request)
    },
    async grant(payload, actor) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) && !['admin', 'hr'].includes(actor.role)) throw error('HR leave review is required.', 403, 'FORBIDDEN')
      const request = await this.submit(payload, actor, payload.employeeId)
      return payload.status === 'approved' ? this.decide(request.id, 'approve', { comment: payload.hrComment || 'Granted directly by HR Operations' }, actor, 'hr') : request
    },

    async listSelf(actor, filters = {}) { const employee = await getEmployee(actor); return repository.listRequests({ ...filters, employeeId: idOf(employee) }) },
    async listTeam(actor, filters = {}) {
      const emp = await getEmployee(actor).catch(() => null)
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head', 'admin', 'hr'].includes(actor.role)
      const candidateIds = [actor.id, actor._id, emp?._id, emp?.id, emp?.employeeId].filter(Boolean).map(String)

      // Find all reportees assigned to this actor in MongoDB
      let reporteeIds = []
      if (mongoose?.connection?.readyState === 1) {
        try {
          const { Employee } = await import('../../models/Employee.js')
          const candidateObjIds = candidateIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id))
          const repDocs = await Employee.find({
            $or: [
              { managerId: { $in: candidateObjIds.length ? candidateObjIds : candidateIds } },
              { teamLeadId: { $in: candidateObjIds.length ? candidateObjIds : candidateIds } },
              { reportingManager: { $in: [actor.name, actor.displayName, actor.email, actor.employeeId].filter(Boolean) } },
            ],
            status: { $ne: 'terminated' },
          }).select('_id employeeId').lean()
          reporteeIds = repDocs.map((d) => String(d._id))
        } catch {}
      }

      const hasDirectReports = reporteeIds.length > 0
      if (!hasPermission(actor, PERMISSIONS.LEAVE_TEAM_READ) && !hasDirectReports && !isLeadership) {
        throw error('Team leave access is not permitted.', 403, 'FORBIDDEN')
      }

      if (isLeadership) {
        return repository.listRequests({
          ...filters,
          status: filters.status,
        })
      }
      return repository.listRequests({
        ...filters,
        managerId: actor.id,
        managerIds: candidateIds,
        reporteeEmployeeIds: reporteeIds,
        status: filters.status,
      })
    },
    async listHr(actor, filters = {}) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_HR_READ)) throw error('Company-wide leave access is not permitted.', 403, 'FORBIDDEN')
      return repository.listRequests(filters)
    },
    async detail(id, actor, scope = 'self') { return publicRequest(await getRequest(id, actor, scope)) },
    async balances(actor, filters = {}) {
      if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ)) return repository.listBalances(filters)
      const employee = await getEmployee(actor)
      if (repository.ensureBalance && repository.listPolicies) {
        const policies = await repository.listPolicies()
        await Promise.all(policies.filter((policy) => policy.configured && policy.annualAllowance != null).map((policy) => repository.ensureBalance(idOf(employee), policy.leaveType, policy.annualAllowance)))
      }
      return repository.listBalances({ ...filters, employeeId: idOf(employee) })
    },
    async calendar(actor, filters = {}) {
      const scope = filters.scope === 'hr' && hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) ? 'hr' : filters.scope === 'team' && hasPermission(actor, PERMISSIONS.LEAVE_TEAM_READ) ? 'team' : 'self'
      const requests = scope === 'hr' ? await this.listHr(actor, filters) : scope === 'team' ? await this.listTeam(actor, { ...filters, status: undefined }) : await this.listSelf(actor, filters)
      return requests.filter((request) => ACTIVE_STATUSES.includes(request.status))
    },
    async comment(id, payload, actor, scope = 'self') {
      const request = await getRequest(id, actor, scope)
      if (!String(payload.body ?? '').trim()) throw error('Comment cannot be empty.', 400, 'VALIDATION_ERROR', { body: 'Required.' })
      return publicRequest(await repository.appendComment(id, { actorId: actor.id, actorRole: actor.role, body: String(payload.body).trim(), createdAt: new Date() }))
    },
    async decide(id, decision, payload, actor, scope = 'team') {
      const request = await getRequest(id, actor, scope)
      const isSelf = idOf(request.employeeId) === idOf(actor.id) ||
        (actor.employeeId && idOf(request.employeeId) === idOf(actor.employeeId))
      if (isSelf) {
        throw error('Self-approval of leave requests is strictly prohibited. You cannot decide your own leave request.', 403, 'FORBIDDEN_SELF_APPROVAL')
      }

      // Resolve applicant employee record for reporting chain and assigned manager verification
      const targetEmp = (request.employeeId && typeof request.employeeId === 'object' && request.employeeId.email)
        ? request.employeeId
        : await employeeRepository.findById(request.employeeId)

      const isAdmin = actor.role === 'admin' || (actor.permissions || []).includes('admin.access')
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role)
      const isHr = (hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) || ['admin', 'hr', 'director', 'managing_director'].includes(actor.role))
      const isAdminApprover = (isAdmin || actor.role === 'admin' || actor.role === 'managing_director') && request.status === 'pending_admin'
      const isDirector = (isLeadership || ['admin', 'hr'].includes(actor.role)) && (request.status === 'pending_director' || isLeadership)

      // Check if actor is the designated assigned reporting manager of this applicant or request
      const reqMgrId = idOf(request.managerId)
      const empMgrId = idOf(targetEmp?.managerId)
      const candidateActorIds = [idOf(actor?.id), idOf(actor?._id), actor?.employeeId].filter(Boolean).map(String)
      const isAssignedManager = candidateActorIds.includes(String(reqMgrId)) || candidateActorIds.includes(String(empMgrId))

      const isManager = (isAssignedManager || hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || isLeadership || ['manager', 'revenue_growth_manager', 'senior_manager', 'vertical_head', 'admin', 'hr'].includes(actor.role)) && (request.status === 'pending_manager' || request.status === 'pending_tl' || isLeadership)
      const isTl = (isAssignedManager || hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['team_lead', 'team_leader', 'manager', 'admin', 'hr'].includes(actor.role)) && request.status === 'pending_tl'

      if (!isAdminApprover && !isHr && !isDirector && !isManager && !isTl && !isLeadership) throw error('You are not authorized to decide this request at its current stage.', 403, 'FORBIDDEN')
      if (decision === 'reject' && !String(payload.reason ?? payload.comment ?? '').trim()) throw error('A rejection reason is required.', 400, 'REJECTION_REASON_REQUIRED', { reason: 'Required.' })
      const policy = await getPolicy(request.leaveType)
      const isLopMonth = is25thMonthLop(request.startDate, request.endDate, request.leaveType, request.isDoubleLop, request.doubleLopDays)
      
      let nextStatus
      if (decision === 'reject') {
        nextStatus = 'rejected'
      } else if (request.status === 'pending_admin') {
        nextStatus = 'approved'
      } else if (request.status === 'pending_hr') {
        // ONLY for 25th month LOP does HR approval advance to pending_admin! Regular leaves become approved directly.
        nextStatus = isLopMonth ? 'pending_admin' : 'approved'
      } else if (isManager && !isHr && policy.approvalStage === 'manager_hr' && request.status === 'pending_manager') {
        nextStatus = 'pending_hr'
      } else if (isManager && isLopMonth && request.status === 'pending_manager') {
        nextStatus = 'pending_hr'
      } else {
        nextStatus = 'approved'
      }
      assertTransition(request.status, nextStatus)
      const timestamp = new Date()
      const updateSet = {
        status: nextStatus,
        decisionReason: payload.reason ? String(payload.reason).trim() : undefined,
        ...(isAdminApprover ? { adminDecisionAt: timestamp, adminApprovedBy: actor.displayName || actor.name || 'Administrator' }
          : isHr && request.status === 'pending_hr' ? { hrDecisionAt: timestamp, hrApprovedBy: actor.displayName || actor.name || 'HR Operations' }
          : isDirector ? { directorDecisionAt: timestamp }
          : { managerDecisionAt: timestamp })
      }
      const updated = await repository.transitionRequest(id, [request.status], {
        set: updateSet,
        push: {
          action: decision === 'reject' ? 'rejected' : 'approved',
          fromStatus: request.status,
          toStatus: nextStatus,
          actorId: actor.id,
          actorRole: actor.role,
          comment: payload.comment ?? payload.reason,
          createdAt: timestamp
        }
      })
      if (!updated) throw error('This leave request has already been decided by another action.', 409, 'DUPLICATE_DECISION')
      const paidUnits = request.paidUnits !== undefined ? request.paidUnits : request.units
      if (nextStatus === 'rejected') await releaseReservation(request)
      if (nextStatus === 'approved' && paidUnits > 0) await repository.commitReservation(request.employeeId, request.leaveType, paidUnits)
      const empIdToFind = idOf(request.employeeId) || (typeof request.employeeId === 'object' ? String(request.employeeId._id || request.employeeId.id) : String(request.employeeId))
      const empRecord = targetEmp || await employeeRepository.findById(empIdToFind)

      const mgrIdToFind = idOf(request.managerId) || (typeof request.managerId === 'object' ? String(request.managerId._id || request.managerId.id) : (request.managerId ? String(request.managerId) : null))
      let targetMgr = (request.managerId && typeof request.managerId === 'object' && request.managerId.email)
        ? request.managerId
        : (mgrIdToFind ? await employeeRepository.findById(mgrIdToFind) : null)

      if (!targetMgr && targetEmp?.managerId) {
        try { targetMgr = await employeeRepository.findById(targetEmp.managerId) } catch {}
      }
      if (!targetMgr && mongoose?.connection?.readyState === 1) {
        try {
          const { Employee } = await import('../../models/Employee.js')
          targetMgr = await Employee.findOne({ role: { $in: ['director', 'managing_director', 'admin', 'hr'] }, status: { $ne: 'inactive' } }).lean()
        } catch {}
      }

      const empDisplayName = targetEmp?.name || updated.employeeName || 'Employee'
      const leaveTypeTitle = (updated.leaveType || 'Leave').toUpperCase()

      if (nextStatus === 'pending_admin') {
        await notifyAdmin('LEAVE_PENDING_ADMIN', updated, `HR verified 25th Month LOP leave for ${empDisplayName}. Admin final approval required.`, `⚠️ 25th Month LOP: ${empDisplayName}`)
        await notifyRecipient(empIdToFind, 'LEAVE_PENDING_ADMIN', updated, 'Your 25th Month LOP leave was verified by HR and submitted to Administrator for final approval.', 'Leave Submitted to Admin')
      } else if (nextStatus === 'pending_hr' || isDirector) {
        await notifyHr('LEAVE_PENDING_HR', updated, isDirector ? `Managing Director approved manager leave for ${empDisplayName}; synchronized to HR panel.` : `Manager approved leave for ${empDisplayName}; HR review is required.`, `📋 Leave Awaiting HR Review: ${empDisplayName}`)
        await notifyRecipient(empIdToFind, 'LEAVE_FORWARDED', updated, 'Your leave request was endorsed by your manager and forwarded to HR for final review.', 'Leave Endorsed by Manager')
      }

      if (nextStatus === 'approved') {
        await notifyRecipient(empIdToFind, 'LEAVE_APPROVED', updated, `Your ${leaveTypeTitle} request (${updated.startDate ? new Date(updated.startDate).toLocaleDateString('en-GB') : ''} to ${updated.endDate ? new Date(updated.endDate).toLocaleDateString('en-GB') : ''}) was approved by ${actor.displayName || actor.name || 'Management'}.`, '✅ Leave Request Approved', '#/employee/leave', 'high')
        if (mgrIdToFind && idOf(mgrIdToFind) !== idOf(actor.id)) {
          await notifyRecipient(mgrIdToFind, 'LEAVE_APPROVED', updated, `${empDisplayName}'s ${leaveTypeTitle} request was approved.`, `Leave Approved: ${empDisplayName}`, '#/hr/leave')
        }
      } else if (nextStatus === 'rejected') {
        await notifyRecipient(empIdToFind, 'LEAVE_REJECTED', updated, `Your ${leaveTypeTitle} request was declined. Reason: "${payload.reason || payload.comment || 'Declined'}"`, '❌ Leave Request Declined', '#/employee/leave', 'high')
      }

      if (['approved', 'rejected'].includes(nextStatus)) {
        try {
          const recipientEmail = targetEmp?.email || (typeof request.employeeId === 'object' ? request.employeeId.email : null)
          if (recipientEmail) {
            await sendLeaveStatusEmail({
              employee: { ...targetEmp, email: recipientEmail, name: empDisplayName },
              manager: targetMgr,
              leaveRequest: updated,
              action: nextStatus,
              approver: actor,
              reason: payload.reason || payload.comment,
            })
          }
        } catch (mailErr) {
          console.error('[leave.service] Failed to send leave status email:', mailErr?.message || mailErr)
        }
      }
      return publicRequest(updated)
    },
    async cancel(id, actor, { forceOverride = false } = {}) {
      const request = await getRequest(id, actor, 'self')
      const policy = await getPolicy(request.leaveType)
      const isPending = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(request.status)
      const reqEmpId = idOf(request.employeeId)
      const reqEmpCode = request.employeeId?.employeeId || (typeof request.employeeId === 'string' ? request.employeeId : null)
      const candidateIds = [
        idOf(actor?.id),
        idOf(actor?._id),
        actor?.employeeId,
        actor?.email
      ].filter(Boolean).map(String)
      const isSelfEmployee = candidateIds.includes(String(reqEmpId)) || (reqEmpCode && candidateIds.includes(String(reqEmpCode)))
      const canCancelApproved = request.status === 'approved' && (forceOverride || isSelfEmployee || policy.allowCancellationAfterApproval !== false || ['admin', 'hr', 'director', 'managing_director'].includes(actor.role))
      if (!isPending && !canCancelApproved) throw error('This request cannot be cancelled under the configured policy.', 409, 'CANCELLATION_NOT_ALLOWED')
      const updated = await repository.transitionRequest(id, [request.status], { set: { status: 'cancelled' }, push: { action: 'cancelled', fromStatus: request.status, toStatus: 'cancelled', actorId: actor.id, actorRole: actor.role, createdAt: new Date() } })
      if (!updated) throw error('This request has already changed.', 409, 'DUPLICATE_DECISION')
      const paidUnits = request.paidUnits !== undefined ? request.paidUnits : request.units
      if (request.status === 'approved' && paidUnits > 0) await repository.restoreCommittedBalance(request.employeeId, request.leaveType, paidUnits)
      else if (paidUnits > 0) await releaseReservation(request)
      try {
        const emp = await employeeRepository.findById(request.employeeId)
        if (emp && emp.email) {
          const mgr = request.managerId ? await employeeRepository.findById(request.managerId) : (emp.managerId ? await employeeRepository.findById(emp.managerId) : null)
          await sendLeaveStatusEmail({
            employee: emp,
            manager: mgr,
            leaveRequest: updated,
            action: 'cancelled',
            approver: actor,
            reason: 'Leave request was cancelled.',
          })
        }
      } catch (mailErr) {
        console.error('[leave.service] Failed to send leave cancel email:', mailErr?.message || mailErr)
      }
      return publicRequest(updated)
    },
    async delete(id, actor) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) && !['admin', 'hr'].includes(actor.role)) {
        throw error('Only HR operations or an administrator can delete leave records.', 403, 'FORBIDDEN')
      }
      const request = await repository.findRequest(id)
      if (!request) throw error('Leave request not found.', 404, 'NOT_FOUND')
      const paidUnits = request.paidUnits !== undefined ? request.paidUnits : request.units
      if (['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(request.status)) {
        if (paidUnits > 0) await releaseReservation(request).catch(() => null)
      } else if (request.status === 'approved') {
        if (paidUnits > 0) await repository.restoreCommittedBalance(request.employeeId, request.leaveType, paidUnits).catch(() => null)
      }
      await repository.deleteRequest(id)
      return { success: true, id: String(id) }
    },
    async amend(id, payload, actor) {
      const request = await getRequest(id, actor, 'self')
      const policy = await getPolicy(request.leaveType)
      if (!policy.allowAmendment || !['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(request.status)) throw error('This request cannot be amended under the configured policy.', 409, 'AMENDMENT_NOT_ALLOWED')
      const startDate = parseDate(payload.startDate, 'startDate')
      const endDate = parseDate(payload.endDate, 'endDate')
      if (endDate < startDate) throw error('End date must be on or after start date.', 400, 'INVALID_LEAVE_RANGE')
      const { totalUnits: newUnits, paidUnits: newPaidUnits, doubleLopDays: newDoubleLopDays, isDoubleLop: newIsDoubleLop } = calculateUnitsBreakdown(startDate, endDate, policy)
      const overlap = await repository.findOverlap({ employeeId: request.employeeId, startDate, endDate, excludeId: id })
      if (overlap) throw error('This leave range overlaps an existing active request.', 409, 'LEAVE_OVERLAP')
      const oldPaidUnits = request.paidUnits !== undefined ? request.paidUnits : request.units
      if (newPaidUnits !== oldPaidUnits) {
        if (oldPaidUnits > 0) await repository.releaseReservation(request.employeeId, request.leaveType, oldPaidUnits)
        if (newPaidUnits > 0) {
          const reserved = await repository.reserveBalance(request.employeeId, request.leaveType, newPaidUnits)
          if (!reserved) {
            if (oldPaidUnits > 0) await repository.reserveBalance(request.employeeId, request.leaveType, oldPaidUnits)
            throw error('The amended range exceeds the available balance.', 409, 'INSUFFICIENT_LEAVE_BALANCE')
          }
        }
      }
      const updated = await repository.transitionRequest(id, [request.status], {
        set: {
          startDate,
          endDate,
          units: newUnits,
          paidUnits: newPaidUnits,
          doubleLopDays: newDoubleLopDays,
          isDoubleLop: newIsDoubleLop,
          reason: payload.reason ? String(payload.reason).trim() : request.reason,
        },
        push: { action: 'amended', fromStatus: request.status, toStatus: request.status, actorId: actor.id, actorRole: actor.role, createdAt: new Date() },
      })
      if (!updated) throw error('This request has already changed.', 409, 'DUPLICATE_DECISION')
      return publicRequest(updated)
    },
    async policies(actor) { if (!hasPermission(actor, PERMISSIONS.LEAVE_POLICY_ADMIN)) throw error('Leave policy administration is not permitted.', 403, 'FORBIDDEN'); return repository.listPolicies() },
    async savePolicy(leaveType, payload, actor) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_POLICY_ADMIN)) throw error('Leave policy administration is not permitted.', 403, 'FORBIDDEN')
      if (!payload.label || !['hr', 'manager', 'manager_hr'].includes(payload.approvalStage)) throw error('Policy label and approval stage are required.', 400, 'VALIDATION_ERROR')
      return repository.savePolicy(leaveType, { ...payload, updatedBy: actor.id })
    },
    transitions: TRANSITIONS,
  }
}

export { calculateUnits, TRANSITIONS }
