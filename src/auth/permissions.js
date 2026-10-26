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

const SELF_WORKSPACE_READ = [
  'tasks.read',
  'training.read',
  'helpdesk.read',
  'announcements.read',
  'holidays.read',
  'documents.read',
]

const HR_DEFAULT_PERMISSIONS = [
  'dashboard.read',
  'hr.dashboard.read',
  'employees.read',
  'employees.write',
  'employees.manager.assign',
  'attendance.read',
  'attendance.write',
  'attendance.self.read',
  'attendance.self.write',
  'attendance.team.read',
  'leave.self.read',
  'leave.self.write',
  'leave.team.read',
  'leave.hr.read',
  'leave.hr.review',
  'leave.policy.admin',
  'payroll.read',
  'payroll.write',
  'payroll.self.read',
  'performance.read',
  'recruitment.read',
  'reports.read',
  ...SELF_WORKSPACE_READ,
  'settings.hr.read',
]

const LEADERSHIP_PERMISSIONS = [
  'dashboard.read',
  'hr.dashboard.read',
  'employees.read',
  'employees.write',
  'employees.manager.assign',
  'attendance.read',
  'attendance.write',
  'attendance.self.read',
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
  ...SELF_WORKSPACE_READ,
]

const MANAGER_PERMISSIONS = [
  'dashboard.read',
  'employees.read',
  'leave.self.read',
  'leave.self.write',
  'leave.team.read',
  'leave.team.approve',
  'attendance.read',
  'attendance.self.read',
  'attendance.team.read',
  'payroll.self.read',
  'performance.read',
  'reports.read',
  ...SELF_WORKSPACE_READ,
]

const TEAM_LEAD_PERMISSIONS = [
  'dashboard.read',
  'employees.read',
  'leave.self.read',
  'leave.self.write',
  'leave.team.read',
  'leave.team.approve',
  'attendance.read',
  'attendance.self.read',
  'attendance.team.read',
  'payroll.self.read',
  'performance.read',
  ...SELF_WORKSPACE_READ,
]

const ESS_PERMISSIONS = [
  'dashboard.read',
  'leave.self.read',
  'leave.self.write',
  'attendance.read',
  'attendance.self.read',
  'attendance.self.write',
  'payroll.self.read',
  ...SELF_WORKSPACE_READ,
]

export const ROLE_DEFAULT_PERMISSIONS = Object.freeze({
  admin: ['*'],
  managing_director: LEADERSHIP_PERMISSIONS,
  director: LEADERSHIP_PERMISSIONS,
  co_founder: LEADERSHIP_PERMISSIONS,
  vertical_head: LEADERSHIP_PERMISSIONS,
  revenue_growth_manager: MANAGER_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  team_leader: TEAM_LEAD_PERMISSIONS,
  team_lead: TEAM_LEAD_PERMISSIONS,
  hr_executive: HR_DEFAULT_PERMISSIONS,
  hr: HR_DEFAULT_PERMISSIONS,
  operations_executive: ESS_PERMISSIONS,
  business_development_executive: ESS_PERMISSIONS,
  business_development_intern: ESS_PERMISSIONS,
  marketing_executive: ESS_PERMISSIONS,
  marketing_intern: ESS_PERMISSIONS,
  sde: ESS_PERMISSIONS,
  sde_intern: ESS_PERMISSIONS,
  seo_executive: ESS_PERMISSIONS,
  seo_intern: ESS_PERMISSIONS,
  post_sales_executive: ESS_PERMISSIONS,
  post_sales_intern: ESS_PERMISSIONS,
  employee: ESS_PERMISSIONS,
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
