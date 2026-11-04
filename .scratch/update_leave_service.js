import fs from 'node:fs'

let content = fs.readFileSync('server/src/modules/leave/leave.service.js', 'utf8')
let contentNorm = content.replace(/\r\n/g, '\n')

// 1. Update actorCanAccess
const targetActorAccess = `function actorCanAccess(request, actor, permission, employeeId) {
  if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) || hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW)) return true
  if (permission === PERMISSIONS.LEAVE_TEAM_READ || permission === PERMISSIONS.LEAVE_TEAM_APPROVE) return idOf(request.managerId) === idOf(actor.id)
  return idOf(request.employeeId) === idOf(employeeId ?? actor.id)
}`

const replActorAccess = `function actorCanAccess(request, actor, permission, employeeId) {
  const isLeadership = ['admin', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role)
  if (isLeadership) return true
  if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) || hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW)) return true
  if (permission === PERMISSIONS.LEAVE_TEAM_READ || permission === PERMISSIONS.LEAVE_TEAM_APPROVE) {
    if (idOf(request.managerId) === idOf(actor.id)) return true
    if (actor.employeeId && idOf(request.managerId) === idOf(actor.employeeId)) return true
    return false
  }
  return idOf(request.employeeId) === idOf(employeeId ?? actor.id)
}`

// 2. Update notifyHr to include director and managing_director
const targetNotifyHr = `  async function notifyHr(event, request, message) {
    if (!notifier?.notify || !employeeRepository.list) return
    const result = await employeeRepository.list({ limit: 100, status: 'active' })
    const recipients = (result.records ?? result ?? []).filter((employee) => ['admin', 'hr'].includes(employee.role))
    await Promise.all(recipients.map((employee) => notifyRecipient(idOf(employee), event, request, message)))
  }`

const replNotifyHr = `  async function notifyHr(event, request, message) {
    if (!notifier?.notify || !employeeRepository.list) return
    const result = await employeeRepository.list({ limit: 100, status: 'active' })
    const recipients = (result.records ?? result ?? []).filter((employee) =>
      ['admin', 'hr', 'director', 'managing_director', 'co_founder'].includes(employee.role)
    )
    await Promise.all(recipients.map((employee) => notifyRecipient(idOf(employee), event, request, message)))
  }`

// 3. Update directManager lookup and status routing in submit()
const targetMgrLookup = `      // Resolve the appropriate approver and direct reporting manager
      let directManager = null
      if (employee.managerId) {
        try { directManager = await employeeRepository.findById(employee.managerId) } catch {}
      }
      if (!directManager && employee.reportingManager) {
        try {
          if (mongoose?.connection?.readyState === 1) {
            const { Employee } = await import('../../models/Employee.js')
            directManager = await Employee.findOne({
              $or: [
                { name: employee.reportingManager },
                { displayName: employee.reportingManager },
                { employeeId: employee.reportingManager },
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
            role: { $in: ['manager', 'director', 'team_lead', 'team_leader'] },
            status: 'active',
          }).lean()
        } catch {}
      }
      let directManagerId = directManager ? idOf(directManager) : (employee.managerId ? idOf(employee.managerId) : null)
      let managerId = directManagerId

      // If no direct manager assigned or policy specifically mandates HR review, resolve HR fallback recipient
      let fallbackHrUser = null
      if (!managerId || policy.approvalStage === 'hr') {
        const hrResult = await employeeRepository.list({ limit: 100, status: 'active' })
        const hrUsers = (hrResult.records ?? hrResult ?? []).filter((e) => ['admin', 'hr'].includes(e.role))
        if (hrUsers.length > 0) {
          fallbackHrUser = hrUsers[0]
          if (!managerId) managerId = idOf(fallbackHrUser)
        }
      }

      if (!managerId && policy.approvalStage === 'manager') throw error('A manager must be assigned before this leave type can be submitted.', 409, 'MANAGER_REQUIRED')
      
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
            throw error(\`Insufficient leave balance. You have less than \${paidUnits} paid leave unit(s) remaining for this month. Note that leave on or after the 25th is considered Double LOP.\`, 409, 'INSUFFICIENT_LEAVE_BALANCE')
          }
        }
      }
      const isHrApplicant = employee.role === 'hr'
      const isManagerApplicant = employee.role === 'manager' || isHrApplicant
      const isTlApplicant = employee.role === 'team_lead'
      let manager = managerId ? await employeeRepository.findById(managerId) : null
      const isReportingToTl = manager?.role === 'team_lead'
      const isLopMonthLeave = is25thMonthLop(startDate, endDate, leaveType, isDoubleLop, doubleLopDays)
      const status = isLopMonthLeave
        ? 'pending_hr'
        : isManagerApplicant
        ? 'pending_director'
        : isTlApplicant
        ? 'pending_manager'
        : isReportingToTl
        ? 'pending_tl'
        : managerId
        ? (policy.approvalStage === 'tl' ? 'pending_tl' : 'pending_manager')
        : 'pending_hr'`

const replMgrLookup = `      // Resolve the appropriate approver and direct reporting manager
      let directManager = null
      if (employee.managerId) {
        try { directManager = await employeeRepository.findById(employee.managerId) } catch {}
      }
      if (!directManager && employee.reportingManager) {
        try {
          if (mongoose?.connection?.readyState === 1) {
            const { Employee } = await import('../../models/Employee.js')
            directManager = await Employee.findOne({
              $or: [
                { name: employee.reportingManager },
                { displayName: employee.reportingManager },
                { employeeId: employee.reportingManager },
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
          }).lean()
        } catch {}
      }
      // If still no direct manager found, resolve active Managing Director / Director as executive oversight
      if (!directManager && mongoose?.connection?.readyState === 1) {
        try {
          const { Employee } = await import('../../models/Employee.js')
          directManager = await Employee.findOne({
            role: { $in: ['managing_director', 'director'] },
            status: 'active',
            _id: { $ne: employee._id },
          }).lean()
        } catch {}
      }
      let directManagerId = directManager ? idOf(directManager) : (employee.managerId ? idOf(employee.managerId) : null)
      let managerId = directManagerId

      // If no direct manager assigned or policy specifically mandates HR review, resolve HR fallback recipient
      let fallbackHrUser = null
      if (!managerId || policy.approvalStage === 'hr') {
        const hrResult = await employeeRepository.list({ limit: 100, status: 'active' })
        const hrUsers = (hrResult.records ?? hrResult ?? []).filter((e) => ['admin', 'hr', 'director', 'managing_director'].includes(e.role))
        if (hrUsers.length > 0) {
          fallbackHrUser = hrUsers[0]
          if (!managerId) managerId = idOf(fallbackHrUser)
        }
      }

      if (!managerId && policy.approvalStage === 'manager') throw error('A manager must be assigned before this leave type can be submitted.', 409, 'MANAGER_REQUIRED')
      
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
            throw error(\`Insufficient leave balance. You have less than \${paidUnits} paid leave unit(s) remaining for this month. Note that leave on or after the 25th is considered Double LOP.\`, 409, 'INSUFFICIENT_LEAVE_BALANCE')
          }
        }
      }
      const isHrApplicant = employee.role === 'hr'
      const isManagerApplicant = ['manager', 'revenue_growth_manager', 'senior_manager', 'vertical_head'].includes(employee.role) || isHrApplicant
      const isTlApplicant = ['team_lead', 'team_leader'].includes(employee.role)
      let manager = managerId ? await employeeRepository.findById(managerId) : null
      const isReportingToDirector = ['director', 'managing_director', 'co_founder'].includes(manager?.role)
      const isReportingToTl = ['team_lead', 'team_leader'].includes(manager?.role)
      const isLopMonthLeave = is25thMonthLop(startDate, endDate, leaveType, isDoubleLop, doubleLopDays)
      const status = isLopMonthLeave
        ? 'pending_hr'
        : (isManagerApplicant || isReportingToDirector)
        ? 'pending_director'
        : isTlApplicant
        ? 'pending_manager'
        : isReportingToTl
        ? 'pending_tl'
        : managerId
        ? (policy.approvalStage === 'tl' ? 'pending_tl' : 'pending_manager')
        : 'pending_hr'`

// 4. Update listTeam
const targetListTeam = `    async listTeam(actor, filters = {}) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_TEAM_READ)) throw error('Team leave access is not permitted.', 403, 'FORBIDDEN')
      const emp = await getEmployee(actor)
      const candidateIds = [actor.id, actor._id, emp?._id, emp?.id, emp?.employeeId].filter(Boolean).map(String)
      return repository.listRequests({ ...filters, managerId: actor.id, managerIds: candidateIds, status: filters.status ?? 'pending_manager' })
    },`

const replListTeam = `    async listTeam(actor, filters = {}) {
      if (!hasPermission(actor, PERMISSIONS.LEAVE_TEAM_READ)) throw error('Team leave access is not permitted.', 403, 'FORBIDDEN')
      const emp = await getEmployee(actor)
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head', 'admin'].includes(actor.role)
      const candidateIds = [actor.id, actor._id, emp?._id, emp?.id, emp?.employeeId].filter(Boolean).map(String)
      if (isLeadership) {
        return repository.listRequests({
          ...filters,
          status: filters.status, // return all statuses when not explicitly filtering
        })
      }
      return repository.listRequests({ ...filters, managerId: actor.id, managerIds: candidateIds, status: filters.status ?? 'pending_manager' })
    },`

// 5. Update decide()
const targetDecideAuth = `      const isAdmin = actor.role === 'admin' || (actor.permissions || []).includes('admin.access')
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role)
      const isHr = (hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) || ['admin', 'hr'].includes(actor.role))
      const isAdminApprover = (isAdmin || actor.role === 'admin') && request.status === 'pending_admin'
      const isDirector = (isLeadership || ['admin', 'hr'].includes(actor.role)) && request.status === 'pending_director'
      const isManager = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['manager', 'admin', 'hr'].includes(actor.role)) && (request.status === 'pending_manager' || request.status === 'pending_tl')
      const isTl = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['team_lead', 'manager', 'admin', 'hr'].includes(actor.role)) && request.status === 'pending_tl'

      if (!isAdminApprover && !isHr && !isDirector && !isManager && !isTl) throw error('You are not authorized to decide this request at its current stage.', 403, 'FORBIDDEN')`

const replDecideAuth = `      const isAdmin = actor.role === 'admin' || (actor.permissions || []).includes('admin.access')
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role)
      const isHr = (hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) || ['admin', 'hr', 'director', 'managing_director'].includes(actor.role))
      const isAdminApprover = (isAdmin || actor.role === 'admin' || actor.role === 'managing_director') && request.status === 'pending_admin'
      const isDirector = (isLeadership || ['admin', 'hr'].includes(actor.role)) && (request.status === 'pending_director' || isLeadership)
      const isManager = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || isLeadership || ['manager', 'admin', 'hr'].includes(actor.role)) && (request.status === 'pending_manager' || request.status === 'pending_tl' || isLeadership)
      const isTl = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['team_lead', 'manager', 'admin', 'hr'].includes(actor.role)) && request.status === 'pending_tl'

      if (!isAdminApprover && !isHr && !isDirector && !isManager && !isTl && !isLeadership) throw error('You are not authorized to decide this request at its current stage.', 403, 'FORBIDDEN')`

contentNorm = contentNorm.replace(targetActorAccess, replActorAccess)
contentNorm = contentNorm.replace(targetNotifyHr, replNotifyHr)
contentNorm = contentNorm.replace(targetMgrLookup, replMgrLookup)
contentNorm = contentNorm.replace(targetListTeam, replListTeam)
contentNorm = contentNorm.replace(targetDecideAuth, replDecideAuth)

if (content.includes('\r\n')) {
  contentNorm = contentNorm.replace(/\n/g, '\r\n')
}
fs.writeFileSync('server/src/modules/leave/leave.service.js', contentNorm, 'utf8')
console.log('Successfully updated leave.service.js')

