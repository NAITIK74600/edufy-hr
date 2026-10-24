export const adminRoutes = [
  { path: '/admin', label: 'Admin Overview', group: 'Administration', description: 'System health, telemetry and global pulse', permission: 'admin.access' },
  { path: '/admin/users', label: 'User Management', group: 'Administration', description: 'Manage accounts, credentials, and roles', permission: 'admin.access' },
  { path: '/admin/people', label: 'People', group: 'Workforce', description: 'Shared employee records', permission: 'admin.access' },
  { path: '/admin/attendance', label: 'Attendance', group: 'Workforce', description: 'Shared attendance roster', permission: 'admin.access' },
  { path: '/admin/leave', label: 'Leave', group: 'Workforce', description: 'Leave policies, balances and approvals', permission: 'admin.access' },
  { path: '/admin/payroll', label: 'Payroll', group: 'Workforce', description: 'Review and finalize employee payslips', permission: 'admin.access' },
  { path: '/admin/recruitment', label: 'Recruitment', group: 'Workspace', description: 'Persisted job requisitions', permission: 'admin.access', workspace: true },
  { path: '/admin/performance', label: 'Performance & Recognition', group: 'Workspace', description: 'Saved goals, reviews and peer recognition', permission: 'admin.access', workspace: true },
  { path: '/admin/tasks', label: 'Task Management', group: 'Workspace', description: 'Assign and track saved tasks', permission: 'admin.access', workspace: true },
  { path: '/admin/learning', label: 'Training & Learning', group: 'Workspace', description: 'Published courses and training enrollments', permission: 'admin.access', workspace: true },
  { path: '/admin/helpdesk', label: 'Help Desk', group: 'Workspace', description: 'Review and resolve support tickets', permission: 'admin.access', workspace: true },
  { path: '/admin/announcements', label: 'Announcements', group: 'Workspace', description: 'Publish company announcements', permission: 'admin.access', workspace: true },
  { path: '/admin/holidays', label: 'Holiday Calendar', group: 'Workspace', description: 'Published company holidays', permission: 'admin.access', workspace: true },
  { path: '/admin/documents', label: 'Company Documents', group: 'Workspace', description: 'Publish actual document links', permission: 'admin.access', workspace: true },
  { path: '/admin/policies', label: 'Company Policy', group: 'Workspace', description: 'Official company policies, PDF preview & employee digital consent compliance', permission: 'admin.access', workspace: true },
  { path: '/admin/expenses', label: 'Expense Review', group: 'Workspace', description: 'Review submitted expense claims', permission: 'admin.access', workspace: true },
  { path: '/admin/notifications', label: 'Notifications', group: 'Workspace', description: 'Your saved alerts and updates', permission: 'admin.access', workspace: true },
  { path: '/admin/roles', label: 'Role & Access', group: 'Administration', description: 'Role permissions, access control, and security audit log', permission: 'admin.access' },
  { path: '/admin/departments', label: 'Departments', group: 'Administration', description: 'Create and manage organizational departments and teams', permission: 'admin.access' },
  { path: '/admin/settings', label: 'System Configuration', group: 'Administration', description: 'Office locations, Wi-Fi networks, and holiday schedules', permission: 'admin.access' },
  { path: '/admin/reports', label: 'Daily Reports & Expenses', group: 'Administration', description: 'Actual submitted daily reports and expense review', permission: 'admin.access', workspace: true },
  { path: '/admin/system', label: 'System Maintenance', group: 'Administration', description: 'Authorized snapshot export and API diagnostics; browser restore/reset disabled', permission: 'admin.access' },
  { path: '/admin/hierarchy', label: 'Org Hierarchy', group: 'Administration', description: 'Interactive visual organization tree, department teams & reporting structures', permission: 'admin.access' },
]

export const hrRoutes = [
  { path: '/hr', label: 'Overview', group: 'HR Ops', description: 'HR workforce overview and pulse', permission: 'hr.dashboard.read' },
  { path: '/hr/people', label: 'People', group: 'HR Ops', description: 'Employee management and onboarding', permission: 'employees.read' },
  { path: '/hr/users', label: 'User Accounts', group: 'HR Ops', description: 'Provision employee login credentials', permission: 'employees.write' },
  { path: '/hr/attendance', label: 'Attendance', group: 'HR Ops', description: 'Attendance and Wi-Fi verification', permission: 'attendance.read' },
  { path: '/hr/leave', label: 'Leave', group: 'HR Ops', description: 'Company-wide leave approvals', permission: 'leave.hr.read' },
  { path: '/hr/payroll', label: 'Payroll & Salary', group: 'HR Ops', description: 'Salary breakup, PF/ESI, and payslips', permission: 'payroll.read' },
  { path: '/hr/recruitment', label: 'Recruitment', group: 'Manage', description: 'Requisitions, candidate pipeline, and referrals', permission: 'recruitment.read' },
  { path: '/hr/performance', label: 'Performance', group: 'Manage', description: 'KPIs, OKRs, and appraisal reviews', permission: 'performance.read' },
  { path: '/hr/tasks', label: 'Task Management', group: 'Manage', description: 'Task delegation and team workload', permission: 'tasks.read' },
  { path: '/hr/learning', label: 'Training & Learning', group: 'Manage', description: 'Course assignments and certifications', permission: 'training.read' },
  { path: '/hr/helpdesk', label: 'Help Desk', group: 'Manage', description: 'Employee support ticketing', permission: 'helpdesk.read' },
  { path: '/hr/announcements', label: 'Announcements', group: 'Manage', description: 'Company announcements and broadcasts', permission: 'announcements.read', workspace: true },
  { path: '/hr/holidays', label: 'Holiday Calendar', group: 'Manage', description: 'Official holiday schedule', permission: 'holidays.read' },
  { path: '/hr/documents', label: 'Company Documents', group: 'Manage', description: 'Handbooks, policies, and NDA repository', permission: 'documents.read' },
  { path: '/hr/policies', label: 'Company Policy', group: 'Manage', description: 'Official company policies, PDF preview & employee digital consent compliance', permission: 'documents.read' },
  { path: '/hr/reports', label: 'Daily Reports & Expenses', group: 'Manage', description: 'Actual submitted daily reports and expense review', permission: 'reports.read' },
  { path: '/hr/notifications', label: 'Notifications', group: 'Manage', description: 'Your saved alerts and updates', permission: 'dashboard.read', workspace: true },
  { path: '/hr/settings', label: 'HR Settings', group: 'Manage', description: 'HR parameters and leave rules', permission: 'settings.hr.read' },
  { path: '/hr/hierarchy', label: 'Org Hierarchy', group: 'Manage', description: 'Enterprise organization chart, reporting chains & department teams', permission: 'employees.read' },
]

export const employeeRoutes = [
  { path: '/employee', label: 'ESS Dashboard', group: 'Self-Service', description: 'Personal employee hub and quick actions', permission: 'dashboard.read' },
  { path: '/employee/attendance', label: 'My Attendance', group: 'Self-Service', description: 'Daily attendance punch-in & history', permission: 'attendance.self.read' },
  { path: '/employee/leave', label: 'My Leave', group: 'Self-Service', description: 'Leave balances and requests', permission: 'leave.self.read' },
  { path: '/employee/salary', label: 'My Salary & Payslip', group: 'Self-Service', description: 'Salary breakdown and monthly payslips', permission: 'dashboard.read' },
  { path: '/employee/tasks', label: 'My Tasks', group: 'Work & Growth', description: 'Assigned tasks and delivery status', permission: 'tasks.read' },
  { path: '/employee/daily-report', label: 'Daily Work Report', group: 'Work & Growth', description: 'Daily standup report, hours logged & accomplishments', permission: 'tasks.read' },
  { path: '/employee/training', label: 'Training Portal', group: 'Work & Growth', description: 'Assigned learning courses and completion status', permission: 'training.read' },
  { path: '/employee/helpdesk', label: 'Support Help Desk', group: 'Work & Growth', description: 'Raise and track internal IT / HR support tickets', permission: 'helpdesk.read' },
  { path: '/employee/expenses', label: 'Expense Claims', group: 'Work & Growth', description: 'Submit and track expense reimbursement claims', permission: 'dashboard.read' },
  { path: '/employee/performance', label: 'My Performance', group: 'Work & Growth', description: 'Appraisal scores, goals, and reviews', permission: 'dashboard.read' },
  { path: '/employee/holidays', label: 'Holiday Calendar', group: 'Organization', description: 'Official organization paid holiday list', permission: 'holidays.read' },
  { path: '/employee/rewards', label: 'Rewards & Recognition', group: 'Organization', description: 'Company accolades, spotlight badges, and points', permission: 'dashboard.read' },
  { path: '/employee/documents', label: 'Company Documents', group: 'Organization', description: 'Official policies, handbooks, and documents', permission: 'documents.read' },
  { path: '/employee/policies', label: 'Company Policy', group: 'Organization', description: 'Official policies, read PDFs & make mandatory digital consent with date & time', permission: 'documents.read' },
  { path: '/employee/announcements', label: 'Announcements', group: 'Organization', description: 'Company broadcasts and notifications', permission: 'announcements.read', workspace: true },
  { path: '/employee/notifications', label: 'Notifications', group: 'Organization', description: 'System alerts, leave updates, and task reminders', permission: 'dashboard.read', workspace: true },
  { path: '/employee/profile', label: 'My Profile', group: 'Organization', description: 'Personal, employment, and emergency info', permission: 'dashboard.read' },
  { path: '/employee/team-leave', label: 'Team Approvals', group: 'Manager Controls', description: 'Review and approve direct reports leave', permission: 'leave.team.read' },
  { path: '/employee/my-team', label: 'My Team', group: 'Manager Controls', description: 'Direct reports roster and contact details', permission: 'leave.team.read' },
]

export const authRoutes = [
  { path: '/login', label: 'HR Login', group: 'Auth', description: 'Edufyi Workforce Portal Sign In' },
  { path: '/admin/login', label: 'Admin Login', group: 'Auth', description: 'Edufyi Administrator Console Authentication' },
  { path: '/hr/login', label: 'HR Login', group: 'Auth', description: 'Edufyi People Operations Authentication' },
  { path: '/employee/login', label: 'Employee Login', group: 'Auth', description: 'Edufyi Employee Self-Service Authentication' },
]

export const allRoutes = [...adminRoutes, ...hrRoutes, ...employeeRoutes, ...authRoutes]

export function findRoute(path) {
  if (path === '/admin/login') {
    return { path, label: 'Admin Login', group: 'Auth', description: 'Edufyi Administrator Console Authentication' }
  }
  if (path === '/hr/login') {
    return { path, label: 'HR Login', group: 'Auth', description: 'Edufyi People Operations Authentication' }
  }
  if (path === '/employee/login') {
    return { path, label: 'Employee Login', group: 'Auth', description: 'Edufyi Employee Self-Service Authentication' }
  }
  const exact = allRoutes.find((route) => route.path === path)
  if (exact) return exact
  if (path.startsWith('/admin')) {
    return { path, label: 'Administration', group: 'Administration', description: 'System Administration module', permission: 'admin.access' }
  }
  if (path === '/hr/people/new') return { path, label: 'New employee', group: 'HR Ops', description: 'Create an employee profile', permission: 'employees.write' }
  if (/^\/hr\/people\/[^/]+(\/edit)?$/.test(path)) {
    const editing = path.endsWith('/edit')
    return { path, label: editing ? 'Edit employee' : 'Employee profile', group: 'HR Ops', description: 'Employee profile and employment history', permission: editing ? 'employees.write' : 'employees.read' }
  }
  return undefined
}

export function readPath() {
  const path = window.location.hash.replace(/^#/, '') || ''
  if (!path) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem('edufyi.authUser')
        if (stored) {
          const u = JSON.parse(stored)
          if (u.role === 'admin') return '/admin'
          if (u.role === 'employee' || u.role === 'manager') return '/employee'
          return '/hr'
        }
      } catch {}
    }
    return '/login'
  }
  if (path === '/admin/login' || path === '/hr/login' || path === '/employee/login' || path.startsWith('/login')) {
    return path
  }
  if (path.startsWith('/admin')) return path
  if (path.startsWith('/hr')) return path
  if (path.startsWith('/employee')) return path
  return '/hr'
}
