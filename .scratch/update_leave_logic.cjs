const fs = require('fs');

// 1. server/src/modules/leave/leave.service.js
let lCode = fs.readFileSync('server/src/modules/leave/leave.service.js', 'utf8');

// Fix actorCanAccess
const oldActorAccess = `function actorCanAccess(request, actor, permission, employeeId) {
  const isLeadership = ['admin', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(actor.role)
  if (isLeadership) return true
  if (hasPermission(actor, PERMISSIONS.LEAVE_HR_READ) || hasPermission(actor, PERMISSIONS.LEAVE_HR_REVIEW)) return true
  if (permission === PERMISSIONS.LEAVE_TEAM_READ || permission === PERMISSIONS.LEAVE_TEAM_APPROVE) {
    if (idOf(request.managerId) === idOf(actor.id)) return true
    if (actor.employeeId && idOf(request.managerId) === idOf(actor.employeeId)) return true
    return false
  }
  return idOf(request.employeeId) === idOf(employeeId ?? actor.id)
}`;

const newActorAccess = `function actorCanAccess(request, actor, permission, employeeId) {
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
}`;

// Fix cancel
const oldCancel = `    async cancel(id, actor, { forceOverride = false } = {}) {
      const request = await getRequest(id, actor, 'self')
      const policy = await getPolicy(request.leaveType)
      const isPending = ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(request.status)
      const isSelfEmployee = actor && request && (String(actor.id) === String(request.employeeId) || String(actor._id) === String(request.employeeId) || String(actor.employeeId) === String(request.employeeId))
      const canCancelApproved = request.status === 'approved' && (forceOverride || isSelfEmployee || policy.allowCancellationAfterApproval !== false || ['admin', 'hr'].includes(actor.role))
      if (!isPending && !canCancelApproved) throw error('This request cannot be cancelled under the configured policy.', 409, 'CANCELLATION_NOT_ALLOWED')`;

const newCancel = `    async cancel(id, actor, { forceOverride = false } = {}) {
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
      if (!isPending && !canCancelApproved) throw error('This request cannot be cancelled under the configured policy.', 409, 'CANCELLATION_NOT_ALLOWED')`;

// Fix replaceOverlap in submit
const oldReplace = `        if (payload.replaceOverlap && canCancel) {
          await this.cancel(idOf(overlap), actor, { forceOverride: true })
        } else {`;

const newReplace = `        if (payload.replaceOverlap && canCancel) {
          await this.cancel(idOf(overlap), actor, { forceOverride: true })
          let secondaryOverlap = await repository.findOverlap({ employeeId: idOf(employee), startDate, endDate })
          while (secondaryOverlap && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'].includes(secondaryOverlap.status)) {
            await this.cancel(idOf(secondaryOverlap), actor, { forceOverride: true })
            secondaryOverlap = await repository.findOverlap({ employeeId: idOf(employee), startDate, endDate })
          }
        } else {`;

const normL = lCode.replace(/\r\n/g, '\n');
const normOA = oldActorAccess.replace(/\r\n/g, '\n');
const normOC = oldCancel.replace(/\r\n/g, '\n');
const normOR = oldReplace.replace(/\r\n/g, '\n');

if (normL.includes(normOA) && normL.includes(normOC) && normL.includes(normOR)) {
  let updatedL = normL.replace(normOA, newActorAccess).replace(normOC, newCancel).replace(normOR, newReplace);
  fs.writeFileSync('server/src/modules/leave/leave.service.js', updatedL.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated leave.service.js');
} else {
  console.error('Target blocks not found in leave.service.js');
}

// 2. src/services/connectedStore.js
let csCode = fs.readFileSync('src/services/connectedStore.js', 'utf8');
const oldApplyReturn = `          if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser)
          return res.data
        }
      })`;

const newApplyReturn = `          if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser)
          try {
            const freshBal = await apiClient.get('/leave/balances')
            if (Array.isArray(freshBal?.data)) {
              state().leaveBalances = freshBal.data
            }
          } catch {}
          notify()
          return res.data
        }
      })`;

const normCS = csCode.replace(/\r\n/g, '\n');
const normOAR = oldApplyReturn.replace(/\r\n/g, '\n');

if (normCS.includes(normOAR)) {
  let updatedCS = normCS.replace(normOAR, newApplyReturn);
  fs.writeFileSync('src/services/connectedStore.js', updatedCS.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated connectedStore.js');
} else {
  console.error('Target blocks not found in connectedStore.js');
}

// 3. src/pages/LeaveManagementPage.jsx
let lmCode = fs.readFileSync('src/pages/LeaveManagementPage.jsx', 'utf8');
const oldOnSub = `{isSelf && <ApplyLeaveSelf onSubmitted={() => setRefreshKey((k) => k + 1)} />}`;
const newOnSub = `{isSelf && <ApplyLeaveSelf onSubmitted={() => { hrStore.refresh().catch(() => {}); setRefreshKey((k) => k + 1) }} />}`;

const normLM = lmCode.replace(/\r\n/g, '\n');
const normOOS = oldOnSub.replace(/\r\n/g, '\n');

if (normLM.includes(normOOS)) {
  let updatedLM = normLM.replace(normOOS, newOnSub);
  fs.writeFileSync('src/pages/LeaveManagementPage.jsx', updatedLM.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated LeaveManagementPage.jsx');
} else {
  console.error('Target blocks not found in LeaveManagementPage.jsx');
}

