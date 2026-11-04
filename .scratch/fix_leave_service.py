import re

with open('server/src/modules/leave/leave.service.js', 'rb') as f:
    raw = f.read()

# Normalize line endings
text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

# 1. In decide, resolve targetEmp before using targetEmp?.managerId
old_decide_start = """    async decide(id, decision, payload, actor, scope = 'team') {
      const request = await getRequest(id, actor, scope)
      const isSelf = idOf(request.employeeId) === idOf(actor.id) ||
        (actor.employeeId && idOf(request.employeeId) === idOf(actor.employeeId))
      if (isSelf) {
        throw error('Self-approval of leave requests is strictly prohibited. You cannot decide your own leave request.', 403, 'FORBIDDEN_SELF_APPROVAL')
      }
      const isAdmin = actor.role === 'admin' || (actor.permissions || []).includes('admin.access')
      const isLeadership = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role)
      const isHr = (hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW) || ['admin', 'hr', 'director', 'managing_director'].includes(actor.role))
      const isAdminApprover = (isAdmin || actor.role === 'admin' || actor.role === 'managing_director') && request.status === 'pending_admin'
      const isDirector = (isLeadership || ['admin', 'hr'].includes(actor.role)) && (request.status === 'pending_director' || isLeadership)
      // Check if actor is the designated assigned manager of this request
      const reqMgrId = idOf(request.managerId)
      const empMgrId = idOf(targetEmp?.managerId)"""

new_decide_start = """    async decide(id, decision, payload, actor, scope = 'team') {
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
      const isAssignedManager = candidateActorIds.includes(String(reqMgrId)) || candidateActorIds.includes(String(empMgrId))"""

assert old_decide_start in text, "old_decide_start not found in leave.service.js"
text = text.replace(old_decide_start, new_decide_start, 1)

# 2. In submit, ensure directManager role check properly assigns status
old_submit_status = """      } else if (directManager) {
        // Standard Employee with an assigned manager:
        // Always goes to their assigned reporting manager for review!
        status = (directManager.role === 'team_lead' || directManager.role === 'team_leader') ? 'pending_tl' : 'pending_manager'
      } else {"""

new_submit_status = """      } else if (directManager) {
        // Standard Employee with an assigned reporting manager:
        // Always routes to their assigned reporting manager for review!
        if (directManager.role === 'team_lead' || directManager.role === 'team_leader') {
          status = 'pending_tl'
        } else if (['director', 'managing_director', 'co_founder'].includes(directManager.role)) {
          status = 'pending_director'
        } else if (directManager.role === 'hr') {
          status = 'pending_hr'
        } else {
          status = 'pending_manager'
        }
      } else {"""

assert old_submit_status in text, "old_submit_status not found in leave.service.js"
text = text.replace(old_submit_status, new_submit_status, 1)

# Write back with clean Windows CRLF line endings
output = text.replace('\n', '\r\n')
with open('server/src/modules/leave/leave.service.js', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated server/src/modules/leave/leave.service.js")

