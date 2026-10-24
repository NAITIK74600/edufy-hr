export const PERMISSIONS = Object.freeze({
  DASHBOARD_READ: 'dashboard.read',
  HR_DASHBOARD_READ: 'hr.dashboard.read',
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_WRITE: 'employees.write',
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_WRITE: 'attendance.write',
  LEAVE_SELF_READ: 'leave.self.read',
  LEAVE_TEAM_READ: 'leave.team.read',
  LEAVE_HR_READ: 'leave.hr.read',
  LEAVE_HR_REVIEW: 'leave.hr.review',
  LEAVE_POLICY_ADMIN: 'leave.policy.admin',
  PAYROLL_READ: 'payroll.read',
  PAYROLL_WRITE: 'payroll.write',
  PERFORMANCE_READ: 'performance.read',
  RECRUITMENT_READ: 'recruitment.read',
  TASKS_READ: 'tasks.read',
  TRAINING_READ: 'training.read',
  REPORTS_READ: 'reports.read',
  HELPDESK_READ: 'helpdesk.read',
  ANNOUNCEMENTS_READ: 'announcements.read',
  HOLIDAYS_READ: 'holidays.read',
  DOCUMENTS_READ: 'documents.read',
  HR_SETTINGS_READ: 'settings.hr.read',
  ADMIN_ACCESS: 'admin.access',
  ADMIN_SETTINGS: 'settings.admin',
})

export const MODULE_PERMISSIONS = Object.freeze({
  people: PERMISSIONS.EMPLOYEES_READ,
  attendance: PERMISSIONS.ATTENDANCE_READ,
  leave: PERMISSIONS.LEAVE_HR_READ,
  payroll: PERMISSIONS.PAYROLL_READ,
  performance: PERMISSIONS.PERFORMANCE_READ,
  recruitment: PERMISSIONS.RECRUITMENT_READ,
  tasks: PERMISSIONS.TASKS_READ,
  learning: PERMISSIONS.TRAINING_READ,
  reports: PERMISSIONS.REPORTS_READ,
  helpdesk: PERMISSIONS.HELPDESK_READ,
  announcements: PERMISSIONS.ANNOUNCEMENTS_READ,
  holidays: PERMISSIONS.HOLIDAYS_READ,
  documents: PERMISSIONS.DOCUMENTS_READ,
  settings: PERMISSIONS.HR_SETTINGS_READ,
  admin: PERMISSIONS.ADMIN_ACCESS,
})

export const ROLE_DEFAULT_PERMISSIONS = Object.freeze({
  admin: ['*'],
  hr: [
    'dashboard.read',
    'hr.dashboard.read',
    'employees.read',
    'employees.write',
    'employees.manager.assign',
    'attendance.read',
    'attendance.write',
    'leave.self.read',
    'leave.team.read',
    'leave.hr.read',
    'leave.hr.review',
    'leave.policy.admin',
    'payroll.read',
    'payroll.write',
    'performance.read',
    'recruitment.read',
    'tasks.read',
    'training.read',
    'reports.read',
    'helpdesk.read',
    'announcements.read',
    'holidays.read',
    'documents.read',
    'settings.hr.read',
  ],
  director: [
    'dashboard.read',
    'hr.dashboard.read',
    'employees.read',
    'employees.write',
    'attendance.read',
    'attendance.team.read',
    'leave.self.read',
    'leave.self.write',
    'leave.team.read',
    'leave.team.approve',
    'leave.hr.read',
    'payroll.read',
    'payroll.write',
    'payroll.self.read',
    'performance.read',
    'reports.read',
    'tasks.read',
    'training.read',
    'documents.read',
    'helpdesk.read',
    'announcements.read',
    'holidays.read',
  ],
  manager: [
    'dashboard.read',
    'employees.read',
    'leave.self.read',
    'leave.team.read',
    'leave.team.approve',
    'attendance.read',
    'attendance.team.read',
    'payroll.self.read',
    'tasks.read',
    'training.read',
    'documents.read',
    'helpdesk.read',
    'announcements.read',
    'holidays.read',
  ],
  team_lead: [
    'dashboard.read',
    'employees.read',
    'leave.self.read',
    'leave.team.read',
    'leave.team.approve',
    'attendance.read',
    'attendance.team.read',
    'payroll.self.read',
    'tasks.read',
    'training.read',
    'documents.read',
    'helpdesk.read',
    'announcements.read',
    'holidays.read',
  ],
  employee: [
    'dashboard.read',
    'leave.self.read',
    'attendance.read',
    'payroll.self.read',
    'tasks.read',
    'training.read',
    'documents.read',
    'helpdesk.read',
    'announcements.read',
    'holidays.read',
  ],
})

export function hasPermission(user, permission) {
  if (!permission) return true
  let rolePerms = ROLE_DEFAULT_PERMISSIONS[user?.role] ?? []
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem('edufyi.hrstore.v1')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.customRolePermissions && parsed.customRolePermissions[user?.role]) {
          rolePerms = parsed.customRolePermissions[user?.role]
        } else if (parsed.roles) {
          const matched = parsed.roles.find((r) => r.id === user?.role)
          if (matched && matched.permissions) {
            rolePerms = matched.permissions
          }
        }
      }
    } catch {}
  }
  const permissions = [...new Set([...rolePerms, ...(user?.permissions ?? [])])]
  return permissions.includes('*') || permissions.includes(permission)
}
