with open('src/services/hrStore.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

old_logic = """    if (requestData.status === 'approved') {
      status = 'approved'
      currentApproverRole = null
    } else if (isLopMonthLeave) {
      // 25th Month LOP Leave:
      // Policy requires 25th month LOP leave to go to HR Panel, and upon HR approval, to Admin Panel for LOP approval
      status = 'pending_hr'
      currentApproverRole = 'hr'
      approverId = 'emp-4'
      approverName = 'HR Operations'
      const mgr = (applicantEmp?.managerId && employees.find(e => String(e.id || e._id) === String(applicantEmp.managerId) || e.employeeId === applicantEmp.managerId))
        || employees.find(e => (e.role === 'manager' || e.role?.includes('manager')) && e.department === department)
        || null
      managerId = mgr?.id || 'emp-r2'
      managerName = mgr?.name || 'Department Manager'
    } else if (!hasExplicitRole) {
      // Legacy uncontextualized direct call (e.g., system-flowchart test fixture)
      status = 'pending_manager'
      currentApproverRole = 'manager'
      managerId = requestData.managerId || 'EDU-MGR-002'
      managerName = requestData.managerName || 'Sarah Chen'
      approverId = managerId
      approverName = managerName
    } else if (applicantRole === 'manager' || applicantRole === 'revenue_growth_manager' || applicantRole === 'vertical_head') {
      status = 'pending_director'
      currentApproverRole = 'director'
      approverId = 'emp-director'
      approverName = 'Managing Director'
    } else if (applicantRole === 'team_lead') {
      status = 'pending_manager'
      currentApproverRole = 'manager'
      // Find TL's manager
      const mgr = (applicantEmp?.managerId && employees.find(e => String(e.id || e._id) === String(applicantEmp.managerId) || e.employeeId === applicantEmp.managerId))
        || employees.find(e => (e.role === 'manager' || e.role?.includes('manager')) && e.department === department)
        || employees.find(e => e.role === 'manager' || e.role?.includes('manager'))
      approverId = mgr?.id || 'emp-r2'
      approverName = mgr?.name || 'Department Manager'
      managerId = approverId
      managerName = approverName
    } else {
      // Regular employee -> Approval goes to their assigned Manager! Team Lead and squad get notified.
      status = 'pending_manager'
      currentApproverRole = 'manager'

      // Check who the employee directly reports to:
      const directReportsTo = (applicantEmp?.managerId && employees.find(e => String(e.id || e._id) === String(applicantEmp.managerId) || e.employeeId === applicantEmp.managerId))
        || (applicantEmp?.reportingManager && employees.find(e => e.name?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase() || e.displayName?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase()))
        || null

      let assignedTL = null
      let assignedMgr = null

      if (directReportsTo) {
        if (directReportsTo.role === 'team_lead') {
          // Employee reports to a TL -> That TL is assignedTL, and assignedMgr is TL's manager
          assignedTL = directReportsTo
          assignedMgr = (assignedTL.managerId && employees.find(e => String(e.id || e._id) === String(assignedTL.managerId) || e.employeeId === assignedTL.managerId))
            || employees.find(e => (e.role === 'manager' || e.role?.includes('manager')) && e.department === department)
            || employees.find(e => e.role === 'manager' || e.role?.includes('manager'))
            || null
        } else if (['manager', 'revenue_growth_manager', 'vertical_head'].includes(directReportsTo.role) || directReportsTo.role?.includes('manager')) {
          // Employee reports directly to a Manager
          assignedMgr = directReportsTo
          assignedTL = (applicantEmp?.teamLeadId && employees.find(e => String(e.id || e._id) === String(applicantEmp.teamLeadId)))
            || employees.find(e => e.role === 'team_lead' && e.department === department)
            || null
        } else if (directReportsTo.role === 'director' || directReportsTo.role === 'managing_director') {
          assignedMgr = directReportsTo
        }
      }

      if (!assignedMgr) {
        assignedMgr = employees.find(e => (e.role === 'manager' || e.role?.includes('manager')) && e.department === department)
          || employees.find(e => e.role === 'manager' || e.role?.includes('manager'))
          || null
      }
      if (!assignedTL) {
        assignedTL = employees.find(e => e.role === 'team_lead' && e.department === department) || null
      }

      managerId = assignedMgr?.id || 'emp-r2'
      managerName = assignedMgr?.name || 'Department Manager'
      approverId = managerId
      approverName = managerName
      tlId = assignedTL?.id || null
      tlName = assignedTL?.name || null
    }"""

new_logic = """    const leavePolicies = storeState.leavePolicies || []
    const matchedPolicy = leavePolicies.find(p => p.leaveType === (requestData.leaveType || 'casual')) || {}
    const configuredStage = String(matchedPolicy.approvalStage || 'manager').toLowerCase().trim()

    // Resolve assigned reporting manager
    const directReportsTo = (applicantEmp?.managerId && employees.find(e => String(e.id || e._id) === String(applicantEmp.managerId) || e.employeeId === applicantEmp.managerId))
      || (applicantEmp?.reportingManager && employees.find(e => e.name?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase() || e.displayName?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase()))
      || employees.find(e => (e.role === 'manager' || e.role === 'team_lead') && e.department === department)
      || null

    if (requestData.status === 'approved') {
      status = 'approved'
      currentApproverRole = null
    } else if (isLopMonthLeave) {
      status = 'pending_hr'
      currentApproverRole = 'hr'
      approverId = 'emp-4'
      approverName = 'HR Operations'
      managerId = directReportsTo?.id || 'emp-r2'
      managerName = directReportsTo?.name || 'Department Manager'
    } else if (configuredStage === 'hr') {
      status = 'pending_hr'
      currentApproverRole = 'hr'
      approverId = 'emp-4'
      approverName = 'HR Operations'
      managerId = directReportsTo?.id || 'emp-4'
      managerName = directReportsTo?.name || 'HR Operations'
    } else if (configuredStage === 'director') {
      status = 'pending_director'
      currentApproverRole = 'director'
      approverId = 'emp-director'
      approverName = 'Managing Director'
      managerId = approverId
      managerName = approverName
    } else if (configuredStage === 'tl') {
      status = 'pending_tl'
      currentApproverRole = 'team_lead'
      approverId = directReportsTo?.id || 'emp-tl'
      approverName = directReportsTo?.name || 'Team Lead'
      managerId = approverId
      managerName = approverName
    } else if (applicantRole === 'director' || applicantRole === 'managing_director') {
      status = 'approved'
      currentApproverRole = null
    } else if ((applicantRole === 'manager' || applicantRole === 'revenue_growth_manager' || applicantRole === 'vertical_head') && (!directReportsTo || ['director', 'managing_director'].includes(directReportsTo.role))) {
      status = 'pending_director'
      currentApproverRole = 'director'
      approverId = 'emp-director'
      approverName = 'Managing Director'
      managerId = approverId
      managerName = approverName
    } else if (directReportsTo) {
      // Default: Employee has an assigned reporting manager -> Routes directly to assigned manager!
      const isTL = directReportsTo.role === 'team_lead' || directReportsTo.role === 'team_leader'
      status = isTL ? 'pending_tl' : 'pending_manager'
      currentApproverRole = isTL ? 'team_lead' : 'manager'
      approverId = directReportsTo.id || directReportsTo._id || directReportsTo.employeeId
      approverName = directReportsTo.name || directReportsTo.displayName || 'Reporting Manager'
      managerId = approverId
      managerName = approverName
    } else {
      // Fallback when no manager is configured
      status = 'pending_hr'
      currentApproverRole = 'hr'
      approverId = 'emp-4'
      approverName = 'HR Operations'
      managerId = approverId
      managerName = approverName
    }"""

assert old_logic in content, "old_logic not found in hrStore.js"
content = content.replace(old_logic, new_logic, 1)

with open('src/services/hrStore.js', 'w', encoding='utf-8') as f:
    f.write(content.replace('\n', '\r\n'))

print("[SUCCESS] src/services/hrStore.js applyLeave updated!")

