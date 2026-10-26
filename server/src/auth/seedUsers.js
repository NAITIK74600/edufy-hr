import { hashPassword } from './passwords.js'

// Management credentials are supplied explicitly by the server environment.
const HR_PERMISSIONS = [
  'dashboard.read',
  'hr.dashboard.read',
  'employees.read',
  'employees.write',
  'employees.manager.assign',
  'attendance.read',
  'attendance.write',
  'leave.self.read',
  'leave.self.write',
  'leave.team.read',
  'leave.hr.read',
  'leave.hr.review',
  'leave.policy.admin',
  'reports.read',
  'recruitment.read',
  'performance.read',
  'payroll.read',
  'payroll.write',
  'tasks.read',
  'training.read',
  'helpdesk.read',
  'announcements.read',
  'holidays.read',
  'documents.read',
  'settings.hr.read',
]


const SEED_DEFINITIONS = [
  { id: 'dev-admin-1', employeeId: 'EDU-ADM-001', username: 'admin', name: 'Admin', displayName: 'Admin', email: 'admin@edufyitech.in', role: 'admin', department: 'Executive Leadership', designation: 'System Administrator', permissions: ['*'], envEmailKey: 'ADMIN_EMAIL', envPasswordKeys: ['ADMIN_PASSWORD', 'SEED_ADMIN_PASSWORD'] },
  { id: 'dev-hr-1', employeeId: 'EDU-HR-001', username: 'hr', name: 'HR', displayName: 'HR', email: 'hr@edufyitech.in', role: 'hr', department: 'Human Resources', designation: 'HR Operations', permissions: HR_PERMISSIONS, envEmailKey: 'HR_EMAIL', envPasswordKeys: ['HR_PASSWORD', 'SEED_HR_PASSWORD'] },
]

export function createSeedUsers(env = process.env) {
  const isProduction = env.NODE_ENV === 'production'
  return SEED_DEFINITIONS.reduce((users, { envEmailKey, envPasswordKeys, ...user }) => {
    let password = null
    for (const key of envPasswordKeys) {
      if (env[key]) {
        password = env[key]
        break
      }
    }
    const customEmail = envEmailKey && env[envEmailKey] ? env[envEmailKey].trim().toLowerCase() : null
    if (isProduction && (!customEmail || !password)) {
      return users
    }
    const finalEmail = customEmail || user.email
    const finalPassword = password || 'Password@123'

    users.push({
      ...user,
      email: finalEmail,
      status: 'active',
      passwordHash: hashPassword(finalPassword),
    })
    return users
  }, [])
}
