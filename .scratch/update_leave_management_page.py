with open('src/pages/LeaveManagementPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

# 1. Update canManagerDecide and canDirectorDecide in LeaveManagementPage.jsx
old_decide = """  // Can Manager decide? (Employee leave or TL leave pending Manager approval)
  const canManagerDecide = (isManager || isDirector || isHrOrAdmin) && (currentStatus === 'pending_manager' || request.currentApproverRole === 'manager')

  // Can Director decide? (Manager leave pending Director approval)
  const canDirectorDecide = (isDirector || isHrOrAdmin) && (currentStatus === 'pending_director' || request.currentApproverRole === 'director')"""

new_decide = """  // Check if logged-in user is the assigned manager of this specific request
  const isAssignedManagerOfThisRequest = request.managerId && (
    String(request.managerId) === String(user?.id) ||
    String(request.managerId) === String(user?._id) ||
    (user?.employeeId && String(request.managerId) === String(user.employeeId))
  )

  // Can Manager decide? (Employee leave or TL leave pending Manager approval)
  const canManagerDecide = (isManager || isDirector || isHrOrAdmin || isAssignedManagerOfThisRequest) && (currentStatus === 'pending_manager' || currentStatus === 'pending_tl' || request.currentApproverRole === 'manager' || request.currentApproverRole === 'team_lead')

  // Can Director decide? (Manager leave pending Director approval or executive review)
  const canDirectorDecide = (isDirector || isHrOrAdmin) && (currentStatus === 'pending_director' || request.currentApproverRole === 'director')"""

assert old_decide in content, "old_decide not found in LeaveManagementPage.jsx"
content = content.replace(old_decide, new_decide, 1)

# 2. Update mode === 'team' filtering
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

    filteredRequests = filteredRequests.filter((l) => {
      // Direct reportee check: Always show requests from direct reports to their assigned manager
      const isMyReportee = (userEmpId && (String(l.managerId) === userEmpId || String(l.tlId) === userEmpId)) ||
        (userId && (String(l.managerId) === userId || String(l.tlId) === userId)) ||
        (l.employeeId && employees.some(e => (String(e.id || e._id) === String(l.employeeId) || e.employeeId === l.employeeId) && (String(e.managerId) === userId || String(e.managerId) === userEmpId)))

      if (isMyReportee) return true

      // Managing Director: reviews all pending requests with executive oversight
      if (['director', 'managing_director', 'co_founder', 'vertical_head'].includes(userRole) || user?.email === 'jagadishbabu@edufyitech.in') {
        return true
      }
      // Department Manager / Team Lead
      if (['manager', 'revenue_growth_manager', 'senior_manager', 'team_lead', 'team_leader'].includes(userRole)) {
        return (
          l.status === 'pending_manager' ||
          l.status === 'pending_tl' ||
          (user?.department && l.department === user.department)
        )
      }
      return false
    })
  }"""

assert old_team_filter in content, "old_team_filter not found in LeaveManagementPage.jsx"
content = content.replace(old_team_filter, new_team_filter, 1)

with open('src/pages/LeaveManagementPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content.replace('\n', '\r\n'))

print("[SUCCESS] src/pages/LeaveManagementPage.jsx updated!")

