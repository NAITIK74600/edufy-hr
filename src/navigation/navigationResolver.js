/**
 * Centralized Role-Based Navigation & Deep Link Resolver
 *
 * Provides authoritative URL parsing, query parameter normalization,
 * role-aware portal resolution, and contextual notification deep-linking.
 */

export function parseLocationHash(hashString) {
  const raw = (hashString || (typeof window !== 'undefined' ? window.location.hash : '') || '').replace(/^#/, '')
  const queryIndex = raw.indexOf('?')
  let cleanPath = queryIndex === -1 ? raw : raw.slice(0, queryIndex)
  const queryString = queryIndex === -1 ? '' : raw.slice(queryIndex + 1)
  
  if (!cleanPath.startsWith('/') && cleanPath) {
    cleanPath = `/${cleanPath}`
  }

  const query = {}
  if (queryString) {
    try {
      const searchParams = new URLSearchParams(queryString)
      for (const [key, value] of searchParams.entries()) {
        query[key] = value
      }
    } catch {
      // Graceful fallback for non-standard query strings
    }
  }

  return {
    raw,
    path: cleanPath || '/',
    query,
    queryString,
  }
}

export function buildLocationHash(path, query = {}) {
  const cleanPath = (path || '').startsWith('/') ? path : `/${path || ''}`
  const entries = Object.entries(query).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return `#${cleanPath}`
  
  const searchParams = new URLSearchParams()
  for (const [k, v] of entries) {
    searchParams.set(k, String(v))
  }
  return `#${cleanPath}?${searchParams.toString()}`
}

export function isAdminUser(user) {
  if (!user) return false
  if (user.role === 'admin') return true
  const perms = user.permissions || []
  return perms.includes('*') || perms.includes('admin.access')
}

export function isExecutiveUser(user) {
  if (!user) return false
  const execRoles = ['director', 'managing_director', 'co_founder', 'vertical_head', 'general_manager']
  return execRoles.includes(user.role) || user.email === 'jagadishbabu@edufyitech.in'
}

export function isHrUser(user) {
  if (!user) return false
  if (isAdminUser(user) || isExecutiveUser(user)) return false
  const hrRoles = ['hr', 'hr_executive', 'hr_manager', 'people_operations']
  if (hrRoles.includes(user.role)) return true
  const perms = user.permissions || []
  return perms.includes('leave.hr.review') || perms.includes('leave.hr.read') || perms.includes('employees.write')
}

export function isManagerUser(user) {
  if (!user) return false
  if (isAdminUser(user) || isExecutiveUser(user) || isHrUser(user)) return false
  const mgrRoles = [
    'manager',
    'senior_manager',
    'revenue_growth_manager',
    'head_of_sales',
    'head_of_marketing',
    'team_leader',
    'team_lead',
  ]
  if (mgrRoles.includes(user.role)) return true
  const perms = user.permissions || []
  return perms.includes('leave.team.approve') || perms.includes('leave.team.read')
}

export function getCanonicalPortal(user) {
  if (isAdminUser(user)) return 'admin'
  if (isExecutiveUser(user)) return 'admin'
  if (isHrUser(user)) return 'hr'
  return 'employee'
}

/**
 * Returns the role-appropriate destination for the Leave module
 */
export function resolveLeaveRoute(user, options = {}) {
  const { tab, filter, id, leaveId } = options
  const targetId = id || leaveId
  const query = {}
  if (tab) query.tab = tab
  if (filter) query.filter = filter
  if (targetId) query.id = targetId

  if (isAdminUser(user) || isExecutiveUser(user)) {
    return buildLocationHash('/admin/leave', query)
  }
  if (isHrUser(user)) {
    return buildLocationHash('/hr/leave', query)
  }
  if (isManagerUser(user)) {
    // If manager is checking approvals, route to team-leave
    if (tab === 'approvals' || filter || targetId) {
      return buildLocationHash('/employee/team-leave', targetId ? { id: targetId } : {})
    }
    return buildLocationHash('/employee/team-leave')
  }
  // Standard employee / intern
  return buildLocationHash('/employee/leave', targetId ? { id: targetId } : {})
}

/**
 * Contextual Deep-Link Notification Resolver
 *
 * Resolves notification payloads into precise, permission-checked target URLs.
 */
export function resolveNotificationRoute(notification, user) {
  if (!notification) {
    const portal = getCanonicalPortal(user)
    return `#/${portal}`
  }

  const direct = notification.targetUrl || notification.link || notification.path || notification.route || notification.url
  const meta = notification.metadata || {}
  const eventType = String(notification.eventType || notification.type || '').toUpperCase()
  const category = String(notification.category || notification.type || '').toLowerCase()
  const title = String(notification.title || '').toLowerCase()
  const message = String(notification.message || '').toLowerCase()
  const fullText = `${category} ${eventType} ${title} ${message}`
  const entityId = notification.relatedEntityId || notification.entityId || notification.leaveId || meta.leaveId || meta.id || null

  const isLop = Boolean(
    meta.is25thMonthLop ||
    meta.pendingAdminApproval ||
    eventType.includes('LEAVE_PENDING_ADMIN') ||
    fullText.includes('25th') ||
    fullText.includes('month-end lop') ||
    fullText.includes('admin action required') ||
    fullText.includes('admin sign-off')
  )

  // 1. Month-End 25th+ LOP Approval Notifications
  if (isLop) {
    if (isAdminUser(user) || isExecutiveUser(user)) {
      return buildLocationHash('/admin/leave', {
        tab: 'approvals',
        filter: 'pending_admin',
        ...(entityId ? { id: entityId } : {}),
      })
    }
    if (isHrUser(user)) {
      return buildLocationHash('/hr/leave', {
        tab: 'approvals',
        filter: 'pending_admin',
        ...(entityId ? { id: entityId } : {}),
      })
    }
    // Submitting employee viewing their own LOP status
    return buildLocationHash('/employee/leave', entityId ? { id: entityId } : {})
  }

  // 2. Leave Approval / Team Leave Notifications
  if (category === 'leave' || eventType.startsWith('LEAVE_') || fullText.includes('leave')) {
    // If request submitted for Manager review
    if (eventType === 'LEAVE_SUBMITTED' || fullText.includes('new team leave') || fullText.includes('applied for') || fullText.includes('pending manager')) {
      if (isManagerUser(user)) {
        return buildLocationHash('/employee/team-leave', entityId ? { id: entityId } : {})
      }
      if (isAdminUser(user) || isExecutiveUser(user)) {
        return buildLocationHash('/admin/leave', {
          tab: 'approvals',
          ...(entityId ? { id: entityId } : {}),
        })
      }
      if (isHrUser(user)) {
        return buildLocationHash('/hr/leave', {
          tab: 'approvals',
          ...(entityId ? { id: entityId } : {}),
        })
      }
      return buildLocationHash('/employee/leave', entityId ? { id: entityId } : {})
    }

    // HR Review needed
    if (eventType === 'LEAVE_PENDING_HR' || fullText.includes('awaiting hr review') || fullText.includes('endorsed by manager')) {
      if (isHrUser(user) || isAdminUser(user) || isExecutiveUser(user)) {
        const portal = (isAdminUser(user) || isExecutiveUser(user)) ? 'admin' : 'hr'
        return buildLocationHash(`/${portal}/leave`, {
          tab: 'approvals',
          filter: 'pending_hr',
          ...(entityId ? { id: entityId } : {}),
        })
      }
      return buildLocationHash('/employee/leave', entityId ? { id: entityId } : {})
    }

    // Decision notification (Approved / Rejected) -> Employee self-service
    if (eventType === 'LEAVE_APPROVED' || eventType === 'LEAVE_REJECTED' || fullText.includes('approved') || fullText.includes('declined')) {
      if (!isHrUser(user) && !isAdminUser(user) && !isManagerUser(user)) {
        return buildLocationHash('/employee/leave', entityId ? { id: entityId } : {})
      }
      if (isManagerUser(user)) {
        return buildLocationHash('/employee/team-leave', entityId ? { id: entityId } : {})
      }
      const portal = (isAdminUser(user) || isExecutiveUser(user)) ? 'admin' : 'hr'
      return buildLocationHash(`/${portal}/leave`, {
        tab: 'approvals',
        ...(entityId ? { id: entityId } : {}),
      })
    }

    return resolveLeaveRoute(user, {
      id: entityId,
      tab: meta.tab,
      filter: meta.filter,
    })
  }

  // 3. Attendance & Auto Punch-Out
  if (category === 'attendance' || category === 'gps' || category === 'network' || fullText.includes('attendance') || fullText.includes('punch-out')) {
    if (isAdminUser(user) || isExecutiveUser(user)) {
      if (eventType.includes('AUTO_PUNCH_OUT_HR_ALERT') || fullText.includes('auto punch-out executed')) {
        return buildLocationHash('/admin/attendance', { tab: 'review', ...(entityId ? { id: entityId } : {}) })
      }
      return '#/admin/attendance'
    }
    if (isHrUser(user)) {
      return '#/hr/attendance'
    }
    return '#/employee/attendance'
  }

  // 4. Payroll & Salary
  if (category === 'payroll' || category === 'salary' || fullText.includes('payroll') || fullText.includes('payslip') || fullText.includes('salary')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/payroll'
    if (isHrUser(user)) return '#/hr/payroll'
    return '#/employee/salary'
  }

  // 5. Tasks & Work Reports
  if (category === 'task' || category === 'tasks' || fullText.includes('task')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/tasks'
    if (isHrUser(user)) return '#/hr/tasks'
    return '#/employee/tasks'
  }

  if (category === 'report' || fullText.includes('daily report') || fullText.includes('standup')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/reports'
    if (isHrUser(user)) return '#/hr/reports'
    return '#/employee/daily-report'
  }

  // 6. Support Help Desk
  if (category === 'ticket' || category === 'helpdesk' || fullText.includes('ticket') || fullText.includes('helpdesk')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/helpdesk'
    if (isHrUser(user)) return '#/hr/helpdesk'
    return '#/employee/helpdesk'
  }

  // 7. Documents & Policies
  if (category === 'document' || category === 'policy' || fullText.includes('document') || fullText.includes('policy')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/documents'
    if (isHrUser(user)) return '#/hr/documents'
    return '#/employee/documents'
  }

  // 8. Expense Claims
  if (category === 'expense' || fullText.includes('expense')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/reports'
    if (isHrUser(user)) return '#/hr/reports'
    return '#/employee/expenses'
  }

  // 9. Announcements
  if (category === 'announcement' || fullText.includes('announcement')) {
    if (isAdminUser(user) || isExecutiveUser(user)) return '#/admin/announcements'
    if (isHrUser(user)) return '#/hr/announcements'
    return '#/employee/announcements'
  }

  // 10. Fallback on explicit direct link if safe and permissible
  if (direct && typeof direct === 'string') {
    let clean = direct.trim()
    if (!clean.startsWith('#')) {
      clean = clean.startsWith('/') ? `#${clean}` : `#/${clean}`
    }
    // Check if employee/manager is accidentally routed to /admin or /hr
    if (!isAdminUser(user) && !isExecutiveUser(user)) {
      if (clean.startsWith('#/admin')) {
        clean = isHrUser(user) ? clean.replace('#/admin', '#/hr') : clean.replace('#/admin', '#/employee')
      }
    }
    if (!isAdminUser(user) && !isExecutiveUser(user) && !isHrUser(user)) {
      if (clean.startsWith('#/hr')) {
        clean = clean.replace('#/hr', '#/employee')
      }
    }
    return clean
  }

  const portal = getCanonicalPortal(user)
  return `#/${portal}/notifications`
}

