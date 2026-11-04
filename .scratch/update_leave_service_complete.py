import re

with open('server/src/modules/leave/leave.service.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update actorCanAccess
old_can_access = """function actorCanAccess(request, actor, permission, employeeId) {
  const isLeadership = ['admin', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role) || actor?.email === 'jagadishbabu@edufyitech.in'
  if (isLeadership) return true
  if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) || hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW)) return true
  if (permission === PERMISSIONS.LEAVE_TEAM_READ || permission === PERMISSIONS.LEAVE_TEAM_APPROVE) {
    if (idOf(request.managerId) === idOf(actor.id)) return true
    if (actor.employeeId && idOf(request.managerId) === idOf(actor.employeeId)) return true
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
}"""

new_can_access = """function actorCanAccess(request, actor, permission, employeeId) {
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
}"""

# Normalise newlines for replacement
content = content.replace('\r\n', '\n')
old_can_access = old_can_access.replace('\r\n', '\n')
new_can_access = new_can_access.replace('\r\n', '\n')

assert old_can_access in content, "old_can_access not found in content"
content = content.replace(old_can_access, new_can_access, 1)

# 2. Update submit manager resolution and status computation
old_submit_logic = """      // Resolve the appropriate approver and direct reporting manager
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
            throw error(`Insufficient leave balance. You have less than ${paidUnits} paid leave unit(s) remaining for this month. Note that leave on or after the 25th is considered Double LOP.`, 409, 'INSUFFICIENT_LEAVE_BALANCE')
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
        : 'pending_hr'"""

new_submit_logic = """      // Resolve the direct reporting manager for this employee from database
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
      } else if (isManagerApplicant && (isDirectManagerDirector || !directManager)) {
        // Department Manager reporting to Managing Director / Executive Leadership
        status = 'pending_director'
      } else if (directManager) {
        // Standard Employee with an assigned manager:
        // Always goes to their assigned reporting manager for review!
        status = (directManager.role === 'team_lead' || directManager.role === 'team_leader') ? 'pending_tl' : 'pending_manager'
      } else {
        // Fallback when no manager is configured for this employee in the system:
        // Routes to HR Operations
        status = 'pending_hr'
        const hrResult = await employeeRepository.list({ limit: 50, status: 'active' })
        const hrUsers = (hrResult.records ?? hrResult ?? []).filter((e) => ['hr', 'admin'].includes(e.role))
        if (hrUsers.length > 0) managerId = idOf(hrUsers[0])
      }"""

old_submit_logic = old_submit_logic.replace('\r\n', '\n')
new_submit_logic = new_submit_logic.replace('\r\n', '\n')
assert old_submit_logic in content, "old_submit_logic not found in content"
content = content.replace(old_submit_logic, new_submit_logic, 1)

# 3. Update decide authorization for assigned managers
old_decide_auth = """      const isManager = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || isLeadership || ['manager', 'admin', 'hr'].includes(actor.role)) && (request.status === 'pending_manager' || request.status === 'pending_tl' || isLeadership)
      const isTl = (hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['team_lead', 'manager', 'admin', 'hr'].includes(actor.role)) && request.status === 'pending_tl'"""

new_decide_auth = """      // Check if actor is the designated assigned manager of this request
      const reqMgrId = idOf(request.managerId)
      const empMgrId = idOf(targetEmp?.managerId)
      const candidateActorIds = [idOf(actor?.id), idOf(actor?._id), actor?.employeeId].filter(Boolean).map(String)
      const isAssignedManager = candidateActorIds.includes(String(reqMgrId)) || candidateActorIds.includes(String(empMgrId))

      const isManager = (isAssignedManager || hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || isLeadership || ['manager', 'revenue_growth_manager', 'senior_manager', 'vertical_head', 'admin', 'hr'].includes(actor.role)) && (request.status === 'pending_manager' || request.status === 'pending_tl' || isLeadership)
      const isTl = (isAssignedManager || hasPermission(actor, PERMISSIONS.LEAVE_TEAM_APPROVE) || ['team_lead', 'team_leader', 'manager', 'admin', 'hr'].includes(actor.role)) && request.status === 'pending_tl'"""

old_decide_auth = old_decide_auth.replace('\r\n', '\n')
new_decide_auth = new_decide_auth.replace('\r\n', '\n')
assert old_decide_auth in content, "old_decide_auth not found in content"
content = content.replace(old_decide_auth, new_decide_auth, 1)

# 4. Update listTeam to return requests for assigned managers
old_list_team = """      return repository.listRequests({ ...filters, managerId: actor.id, managerIds: candidateIds, status: filters.status ?? 'pending_manager' })"""
new_list_team = """      return repository.listRequests({ ...filters, managerId: actor.id, managerIds: candidateIds, status: filters.status })"""

old_list_team = old_list_team.replace('\r\n', '\n')
new_list_team = new_list_team.replace('\r\n', '\n')
assert old_list_team in content, "old_list_team not found in content"
content = content.replace(old_list_team, new_list_team, 1)

with open('server/src/modules/leave/leave.service.js', 'w', encoding='utf-8') as f:
    f.write(content.replace('\n', '\r\n'))

print("[SUCCESS] server/src/modules/leave/leave.service.js updated successfully!")

