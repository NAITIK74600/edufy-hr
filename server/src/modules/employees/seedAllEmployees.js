import mongoose from 'mongoose'
import { hashPassword } from '../../auth/passwords.js'
import { Employee } from '../../models/Employee.js'

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

const DEFAULT_SEED_DATA = [
  // 1. Primary Administrator
  {
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    displayName: 'Administrator',
    username: 'admin',
    email: 'admin@edufyitech.in',
    role: 'admin',
    department: 'Executive Leadership',
    designation: 'System Administrator',
    status: 'active',
    salary: 0,
    permissions: ['*'],
  },
  // 2. Default HR Operations
  {
    employeeId: 'EDU-HR-001',
    name: 'HR',
    displayName: 'HR Operations',
    username: 'hr',
    email: 'hr@edufyitech.in',
    role: 'hr',
    department: 'Human Resources',
    designation: 'HR Operations',
    status: 'active',
    salary: 1500000,
    permissions: HR_PERMISSIONS,
  },
]

export async function seedAllEmployees() {
  if (mongoose.connection.readyState !== 1) return

  const defaultHash = hashPassword('Password@123')

  for (const emp of DEFAULT_SEED_DATA) {
    const cleanEmail = emp.email.toLowerCase().trim()
    const cleanEmpId = emp.employeeId.toUpperCase().trim()

    const existing = await Employee.findOne({
      $or: [{ email: cleanEmail }, { employeeId: cleanEmpId }],
    }).select('+passwordHash')

    const updateDoc = {
      employeeId: cleanEmpId,
      name: emp.name,
      displayName: emp.displayName,
      username: emp.username,
      email: cleanEmail,
      role: emp.role,
      department: emp.department,
      designation: emp.designation,
      status: emp.status || 'active',
      salary: emp.salary || 0,
      location: 'Bengaluru',
      employmentType: 'full_time',
      permissions: emp.permissions || [],
    }

    const envPass = emp.role === 'admin'
      ? (process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || 'Password@123')
      : (process.env.HR_PASSWORD || process.env.SEED_HR_PASSWORD || 'Password@123')

    updateDoc.passwordHash = hashPassword(envPass)
    updateDoc.authVersion = (existing?.authVersion ?? 0) + 1

    if (existing) {
      if (existing.avatarUrl) {
        updateDoc.avatarUrl = existing.avatarUrl
      }
      await Employee.updateOne({ _id: existing._id }, { $set: updateDoc })
    } else {
      updateDoc.joiningDate = new Date('2023-01-01')
      updateDoc.onboardingStatus = 'verified'
      await Employee.create(updateDoc)
    }
  }
}
