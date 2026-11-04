with open('src/pages/LeaveManagementPage.jsx', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

# 1. Update canManagerDecide and canCancel in RequestDetail
old_decide_block = """  // Team Lead does not approve leaves; TL is only notified of squad member leaves. Manager approves!
  const canTlDecide = false

  // Can Manager decide? (Employee leave or TL leave pending Manager approval)
  const canManagerDecide = (isManager || isDirector || isHrOrAdmin) && (currentStatus === 'pending_manager' || request.currentApproverRole === 'manager')

  // Can Director decide? (Manager leave pending Director approval)
  const canDirectorDecide = (isDirector || isHrOrAdmin) && (currentStatus === 'pending_director' || request.currentApproverRole === 'director')

  // Can Admin decide? (25th Month LOP leave pending final Admin sign-off)
  const canAdminDecide = isAdmin && (currentStatus === 'pending_admin' || request.currentApproverRole === 'admin')

  // Can HR decide? (HR reviews pending_hr or advances 25th month LOP to admin)
  const canHrDecide = isHrOrAdmin && ['pending_hr', 'pending_manager', 'pending_director'].includes(currentStatus)
  const canDecide = canAdminDecide || canManagerDecide || canDirectorDecide || canHrDecide
  const canCancel = (mode === 'self' || isHrOrAdmin) && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'].includes(currentStatus)"""

new_decide_block = """  // Resolve candidate IDs of current viewer
  const userCandIds = [user?.id, user?._id, user?.employeeId].filter(Boolean).map(String)
  const reqMgrId = request?.managerId?._id || request?.managerId?.id || request?.managerId
  const isAssignedManagerOfThisRequest = Boolean(reqMgrId && userCandIds.includes(String(reqMgrId)))

  const reqEmpId = request?.employeeId?._id || request?.employeeId?.id || request?.employeeId
  const reqEmpCode = request?.employeeId?.employeeId || (typeof request?.employeeId === 'string' ? request?.employeeId : null)
  const isOwnRequest = Boolean(userCandIds.includes(String(reqEmpId)) || (reqEmpCode && userCandIds.includes(String(reqEmpCode))))

  // Team Lead does not approve leaves; TL is only notified of squad member leaves. Manager approves!
  const canTlDecide = false

  // Can Manager decide? (Assigned manager, Department Manager, Director, or HR)
  const canManagerDecide = (isManager || isDirector || isHrOrAdmin || isAssignedManagerOfThisRequest) && (currentStatus === 'pending_manager' || currentStatus === 'pending_tl' || request.currentApproverRole === 'manager' || request.currentApproverRole === 'team_lead')

  // Can Director decide? (Manager leave pending Director approval or executive review)
  const canDirectorDecide = (isDirector || isHrOrAdmin) && (currentStatus === 'pending_director' || request.currentApproverRole === 'director')

  // Can Admin decide? (25th Month LOP leave pending final Admin sign-off)
  const canAdminDecide = isAdmin && (currentStatus === 'pending_admin' || request.currentApproverRole === 'admin')

  // Can HR decide? (HR reviews pending_hr or advances 25th month LOP to admin)
  const canHrDecide = isHrOrAdmin && ['pending_hr', 'pending_manager', 'pending_director'].includes(currentStatus)
  const canDecide = canAdminDecide || canManagerDecide || canDirectorDecide || canHrDecide

  // Cancel is strictly for the applicant on their own request in self-service mode
  const canCancel = (isOwnRequest || mode === 'self') && ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin'].includes(currentStatus)"""

assert old_decide_block in text, "old_decide_block not found in LeaveManagementPage.jsx"
text = text.replace(old_decide_block, new_decide_block, 1)

# 2. Update role determination in handleApprove / handleReject
old_approve_role = """      let role = 'hr'
      if (canAdminDecide || (isAdmin && currentStatus === 'pending_admin')) {
        role = 'admin'
      } else if (canTlDecide && !isHrOrAdmin) {
        role = 'team_lead'
      } else if (canManagerDecide && !isHrOrAdmin) {
        role = 'manager'
      } else if (canDirectorDecide && !isHrOrAdmin) {
        role = 'director'"""

new_approve_role = """      let role = 'hr'
      if (canAdminDecide || (isAdmin && currentStatus === 'pending_admin')) {
        role = 'admin'
      } else if (isAssignedManagerOfThisRequest && !isHrOrAdmin) {
        role = isTeamLead ? 'team_lead' : 'manager'
      } else if (canTlDecide && !isHrOrAdmin) {
        role = 'team_lead'
      } else if (canManagerDecide && !isHrOrAdmin) {
        role = 'manager'
      } else if (canDirectorDecide && !isHrOrAdmin) {
        role = 'director'"""

assert old_approve_role in text, "old_approve_role not found in LeaveManagementPage.jsx"
# Replace in both handleApprove and handleReject
text = text.replace(old_approve_role, new_approve_role)

# 3. Update mode === 'team' filtering
old_team_filter = """  } else if (mode === 'team') {
    const userEmpId = String(user?.employeeId || '')
    const userId = String(user?.id || user?._id || '')
    const userRole = user?.role

    filteredRequests = filteredRequests.filter((l) => {
      // Team Lead: views squad leaves (only notified/info, not an approval gate)
      if (userRole === 'team_lead') {
        return (
          (userEmpId && (l.tlId === userEmpId || l.managerId === userEmpId)) ||
          (userId && (l.tlId === userId || l.managerId === userId)) ||
          (user?.department && l.department === user.department)
        )
      }
      // Department Manager: reviews pending_manager from employees and TLs
      if (userRole === 'manager') {
        return (
          l.status === 'pending_manager' ||
          (userEmpId && l.managerId === userEmpId) ||
          (userId && l.managerId === userId) ||
          (user?.department && l.department === user.department)
        )
      }
      // Managing Director: reviews pending_director from Managers and high-level leaves
      if (['director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole) || user?.email === 'jagadishbabu@edufyitech.in') {
        return (
          l.status === 'pending_director' ||
          l.applicantRole === 'manager' ||
          l.status === 'pending_manager'
        )
      }
      // Fallback team view
      return (
        l.status === 'pending_manager' ||
        l.status === 'pending_director' ||
        (userEmpId && (l.managerId === userEmpId || l.tlId === userEmpId)) ||
        (userId && (l.managerId === userId || l.tlId === userId))
      )
    })
  }"""

new_team_filter = """  } else if (mode === 'team') {
    const userEmpId = String(user?.employeeId || '')
    const userId = String(user?.id || user?._id || '')
    const userRole = user?.role
    const candidateIds = [userId, userEmpId].filter(Boolean)

    // Direct reportees in workforce registry
    const directReportIds = new Set(
      allEmployees
        .filter((e) => {
          const mgrId = String(e.managerId?._id || e.managerId?.id || e.managerId || '')
          return candidateIds.includes(mgrId)
        })
        .map((e) => String(e.id || e._id || e.employeeId || ''))
        .filter(Boolean)
    )

    filteredRequests = filteredRequests.filter((l) => {
      const lMgrId = String(l.managerId?._id || l.managerId?.id || l.managerId || '')
      const lEmpId = String(l.employeeId?._id || l.employeeId?.id || l.employeeId || l.employeeRef || '')
      const isDirectReport = candidateIds.includes(lMgrId) || directReportIds.has(lEmpId)

      // Managing Director / Executive: views all leadership, manager, and team requests
      if (['director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole) || user?.email === 'jagadishbabu@edufyitech.in') {
        return (
          isDirectReport ||
          l.status === 'pending_director' ||
          l.status === 'pending_manager' ||
          l.applicantRole === 'manager'
        )
      }

      // Department Manager / Assigned Manager
      if (['manager', 'revenue_growth_manager', 'senior_manager'].includes(userRole) || isDirectReport) {
        return (
          isDirectReport ||
          l.status === 'pending_manager' ||
          (user?.department && l.department === user.department)
        )
      }

      // Team Lead
      if (userRole === 'team_lead' || userRole === 'team_leader') {
        return (
          isDirectReport ||
          (userEmpId && (l.tlId === userEmpId || l.managerId === userEmpId)) ||
          (userId && (l.tlId === userId || l.managerId === userId)) ||
          (user?.department && l.department === user.department)
        )
      }

      // Fallback
      return isDirectReport || candidateIds.includes(lMgrId)
    })
  }"""

assert old_team_filter in text, "old_team_filter not found in LeaveManagementPage.jsx"
text = text.replace(old_team_filter, new_team_filter, 1)

output = text.replace('\n', '\r\n')
with open('src/pages/LeaveManagementPage.jsx', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/pages/LeaveManagementPage.jsx")

