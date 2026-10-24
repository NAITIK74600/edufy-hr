import { hasPermission, PERMISSIONS } from '../../auth/permissions.js'

const ACTIVE_STATUSES = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'approved']
const TRANSITIONS = Object.freeze({
  pending_tl: ['approved', 'rejected', 'cancelled'],
  pending_manager: ['approved', 'pending_hr', 'rejected', 'cancelled'],
  pending_director: ['approved', 'rejected', 'cancelled'],
  pending_hr: ['approved', 'rejected', 'cancelled'],
  approved: ['cancelled'],
  rejected: [],
  cancelled: [],
})

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
  if (!policy?.configured) throw error(`The ${policy?.label ?? 'leave'} policy is not configured. HR must confirm its rules before leave can be calculated.`, 409, 'LEAVE_POLICY_NOT_CONFIGURED')
  const holidayKeys = new Set((policy.holidayDates ?? []).map((date) => dateKey(new Date(date))))
  let units = 0
  for (const cursor = new Date(startDate); cursor <= endDate; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay()
    const weekend = day === 0 || day === 6
    const holiday = holidayKeys.has(dateKey(cursor))
    if ((!weekend || policy.countWeekends) && (!holiday || policy.countHolidays)) units += 1
  }
  if (units <= 0) throw error('The selected range contains no payable leave units under the configured policy.', 400, 'INVALID_LEAVE_RANGE')
  return units
}

function assertTransition(from, to) {
  if (!TRANSITIONS[from]?.includes(to)) throw error(`Cannot move a ${from} request to ${to}.`, 409, 'INVALID_STATUS_TRANSITION')
}

function actorCanAccess(request, actor, permission, employeeId) {
  if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) || hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW)) return true
  if (permission === PERMISSIONS.LEAVE_TEAM_READ || permission === PERMISSIONS.LEAVE_TEAM_APPROVE) return idOf(request.managerId) === idOf(actor.id)
  return idOf(request.employeeId) === idOf(employeeId ?? actor.id)
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
    if (ACTIVE_STATUSES.includes(request.status)) await repository.releaseReservation(request.employeeId, request.leaveType, request.units)
  }

  async function notifyRecipient(recipientId, event, request, message) {
    if (!recipientId || !notifier?.notify) return
    await notifier.notify({ recipientId, event, entityId: idOf(request), message })
  }

  async function notifyHr(event, request, message) {
    if (!notifier?.notify || !employeeRepository.list) return
    const result = await employeeRepository.list({ limit: 100, status: 'active' })
    const recipients = (result.records ?? result ?? []).filter((employee) => ['admin', 'hr'].includes(employee.role))
    await Promise.all(recipients.map((employee) => notifyRecipient(idOf(employee), event, request, message)))
  }

  return {
    async submit(payload, actor, targetEmployeeId) {
      if (targetEmployeeId ? (!hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) && !['admin', 'hr'].includes(actor.role)) : !hasPermission(actor, PERMISSIONS.LEAVE_SELF_WRITE)) throw error('You cannot submit leave requests.', 403, 'FORBIDDEN')
      const employee = targetEmployeeId ? await employeeRepository.findById(targetEmployeeId) : await getEmployee(actor)
      if (!employee || !['active', 'notice'].includes(employee.status)) throw error('Select an active employee.', 400, 'EMPLOYEE_RECORD_NOT_FOUND')
      const leaveType = String(payload.leaveType ?? '').trim().toLowerCase()
      const policy = await getPolicy(leaveType)
      const startDate = parseDate(payload.startDate, 'startDate')
      const endDate = parseDate(payload.endDate, 'endDate')
      if (endDate < startDate) throw error('End date must be on or after start date.', 400, 'INVALID_LEAVE_RANGE', { endDate: 'Must be on or after start date.' })
      if (policy.requiresReason && !String(payload.reason ?? '').trim()) throw error('A reason is required for this leave type.', 400, 'VALIDATION_ERROR', { reason: 'Required.' })
      const units = calculateUnits(startDate, endDate, policy)
      const overlap = await repository.findOverlap({ employeeId: idOf(employee), startDate, endDate })
      if (overlap) {
        const canCancel = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'approved'].includes(overlap.status)
        if (payload.replaceOverlap && canCancel) {
          await this.cancel(idOf(overlap), actor)
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
      const managerId = targetEmployeeId || policy.approvalStage === 'hr' ? null : idOf(employee.managerId)
      if (!managerId && policy.approvalStage === 'manager') throw error('A manager must be assigned before this leave type can be submitted.', 409, 'MANAGER_REQUIRED')
      if (policy.annualAllowance != null) await repository.ensureBalance?.(idOf(employee), leaveType, policy.annualAllowance)
      let reserved = await repository.reserveBalance(idOf(employee), leaveType, units)
      if (!reserved) {
        const defaultAllowance = policy.annualAllowance ?? 15
        await repository.ensureBalance?.(idOf(employee), leaveType, defaultAllowance)
        reserved = await repository.reserveBalance(idOf(employee), leaveType, units)
      }
      const isManagerApplicant = employee.role === 'manager'
      const isTlApplicant = employee.role === 'team_lead'
      let manager = managerId ? await employeeRepository.findById(managerId) : null
      const isReportingToTl = manager?.role === 'team_lead'
      const status = isManagerApplicant
        ? 'pending_director'
        : isTlApplicant
        ? 'pending_manager'
        : isReportingToTl
        ? 'pending_tl'
        : managerId
        ? (policy.approvalStage === 'tl' ? 'pending_tl' : 'pending_manager')
        : 'pending_hr'
      let request
      try {
        request = await repository.createRequest({ employeeId: idOf(employee), managerId, leaveType, startDate, endDate, units, reason: String(payload.reason).trim(), status, approvalHistory: [{ action: 'submitted', toStatus: status, actorId: actor.id, actorRole: actor.role }] })
      } catch (saveError) {
        await repository.releaseReservation(idOf(employee), leaveType, units)
        throw saveError
      }
      await notifyRecipient(managerId, 'leave.submitted', request, `${employee.name} submitted a leave request for ${units} unit(s).`)
      if (!managerId) await notifyHr('leave.hr_review_required', request, `${employee.name} submitted a leave request requiring HR review.`)
      return publicRequest(request)
    },
    async grant(payload, actor) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) && !['admin', 'hr'].includes(actor.role)) throw error('HR leave review is required.', 403, 'FORBIDDEN')
      const request = await this.submit(payload, actor, payload.employeeId)
      return payload.status === 'approved' ? this.decide(request.id, 'approve', { comment: payload.hrComment || 'Granted directly by HR Operations' }, actor, 'hr') : request
    },

    async listSelf(actor, filters = {}) { const employee = await getEmployee(actor); return repository.listRequests({ ...filters, employeeId: idOf(employee) }) },
    async listTeam(actor, filters = {}) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_TEAM_READ)) throw error('Team leave access is not permitted.', 403, 'FORBIDDEN')
      return repository.listRequests({ ...filters, managerId: actor.id, status: filters.status ?? 'pending_manager' })
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
      const isHr = (hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) || ['admin', 'hr'].includes(actor.role))
      const isDirector = (actor.role === 'director' || ['admin', 'hr'].includes(actor.role)) && request.status === 'pending_director'
      const isManager = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['manager', 'admin', 'hr'].includes(actor.role)) && (request.status === 'pending_manager' || request.status === 'pending_tl')
      const isTl = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['team_lead', 'manager', 'admin', 'hr'].includes(actor.role)) && request.status === 'pending_tl'

      if (!isHr && !isDirector && !isManager && !isTl) throw error('You are not authorized to decide this request at its current stage.', 403, 'FORBIDDEN')
      if (decision === 'reject' && !String(payload.reason ?? payload.comment ?? '').trim()) throw error('A rejection reason is required.', 400, 'REJECTION_REASON_REQUIRED', { reason: 'Required.' })
      const policy = await getPolicy(request.leaveType)
      const nextStatus = decision === 'reject' ? 'rejected' : isManager && !isHr && policy.approvalStage === 'manager_hr' && request.status === 'pending_manager' ? 'pending_hr' : 'approved'
      assertTransition(request.status, nextStatus)
      const timestamp = new Date()
      const updated = await repository.transitionRequest(id, [request.status], { set: { status: nextStatus, decisionReason: payload.reason ? String(payload.reason).trim() : undefined, ...(isManager ? { managerDecisionAt: timestamp } : isDirector ? { directorDecisionAt: timestamp } : { hrDecisionAt: timestamp }) }, push: { action: decision === 'reject' ? 'rejected' : 'approved', fromStatus: request.status, toStatus: nextStatus, actorId: actor.id, actorRole: actor.role, comment: payload.comment ?? payload.reason, createdAt: timestamp } })
      if (!updated) throw error('This leave request has already been decided by another action.', 409, 'DUPLICATE_DECISION')
      if (nextStatus === 'rejected') await releaseReservation(request)
      if (nextStatus === 'approved') await repository.commitReservation(request.employeeId, request.leaveType, request.units)
      if (nextStatus === 'pending_hr' || isDirector) await notifyHr('leave.hr_review_required', updated, isDirector ? 'Managing Director approved manager leave; synchronized to HR panel.' : 'A manager approved a leave request and HR review is required.')
      await notifyRecipient(request.employeeId, `leave.${nextStatus}`, updated, `Your leave request is ${nextStatus}.`)
      return publicRequest(updated)
    },
    async cancel(id, actor) {
      const request = await getRequest(id, actor, 'self')
      const policy = await getPolicy(request.leaveType)
      const isPending = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr'].includes(request.status)
      const canCancelApproved = request.status === 'approved' && (policy.allowCancellationAfterApproval !== false || ['admin', 'hr'].includes(actor.role))
      if (!isPending && !canCancelApproved) throw error('This request cannot be cancelled under the configured policy.', 409, 'CANCELLATION_NOT_ALLOWED')
      const updated = await repository.transitionRequest(id, [request.status], { set: { status: 'cancelled' }, push: { action: 'cancelled', fromStatus: request.status, toStatus: 'cancelled', actorId: actor.id, actorRole: actor.role, createdAt: new Date() } })
      if (!updated) throw error('This request has already changed.', 409, 'DUPLICATE_DECISION')
      if (request.status === 'approved') await repository.restoreCommittedBalance(request.employeeId, request.leaveType, request.units)
      else await releaseReservation(request)
      return publicRequest(updated)
    },
    async delete(id, actor) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) && !['admin', 'hr'].includes(actor.role)) {
        throw error('Only HR operations or an administrator can delete leave records.', 403, 'FORBIDDEN')
      }
      const request = await repository.findRequest(id)
      if (!request) throw error('Leave request not found.', 404, 'NOT_FOUND')
      if (['pending_tl', 'pending_manager', 'pending_director', 'pending_hr'].includes(request.status)) {
        await releaseReservation(request).catch(() => null)
      } else if (request.status === 'approved') {
        await repository.restoreCommittedBalance(request.employeeId, request.leaveType, request.units).catch(() => null)
      }
      await repository.deleteRequest(id)
      return { success: true, id: String(id) }
    },
    async amend(id, payload, actor) {
      const request = await getRequest(id, actor, 'self')
      const policy = await getPolicy(request.leaveType)
      if (!policy.allowAmendment || !['pending_tl', 'pending_manager', 'pending_director', 'pending_hr'].includes(request.status)) throw error('This request cannot be amended under the configured policy.', 409, 'AMENDMENT_NOT_ALLOWED')
      const startDate = parseDate(payload.startDate, 'startDate')
      const endDate = parseDate(payload.endDate, 'endDate')
      if (endDate < startDate) throw error('End date must be on or after start date.', 400, 'INVALID_LEAVE_RANGE')
      const units = calculateUnits(startDate, endDate, policy)
      const overlap = await repository.findOverlap({ employeeId: request.employeeId, startDate, endDate, excludeId: id })
      if (overlap) throw error('This leave range overlaps an existing active request.', 409, 'LEAVE_OVERLAP')
      if (units !== request.units) {
        await repository.releaseReservation(request.employeeId, request.leaveType, request.units)
        const reserved = await repository.reserveBalance(request.employeeId, request.leaveType, units)
        if (!reserved) { await repository.reserveBalance(request.employeeId, request.leaveType, request.units); throw error('The amended range exceeds the available balance.', 409, 'INSUFFICIENT_LEAVE_BALANCE') }
      }
      const updated = await repository.transitionRequest(id, [request.status], { set: { startDate, endDate, units, reason: payload.reason ? String(payload.reason).trim() : request.reason }, push: { action: 'amended', fromStatus: request.status, toStatus: request.status, actorId: actor.id, actorRole: actor.role, createdAt: new Date() } })
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
