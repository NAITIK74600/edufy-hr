import mongoose from 'mongoose'
import { hashPassword } from '../../auth/passwords.js'
import { Employee } from '../../models/Employee.js'
import { workspaceModels } from '../../models/Workspace.js'

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
  // 3. Managing Director - Jagadish Babu
  {
    employeeId: 'EDU-DIR-001',
    name: 'Jagadish Babu',
    displayName: 'Jagadish Babu (Managing Director)',
    username: 'jagadishbabu',
    email: 'jagadishbabu@edufyitech.in',
    role: 'managing_director',
    department: 'Executive Leadership',
    designation: 'Managing Director',
    status: 'active',
    salary: 4500000,
    permissions: ['*'],
  },
]

export async function seedAllEmployees() {
  if (mongoose.connection.readyState !== 1) return

  for (const emp of DEFAULT_SEED_DATA) {
    const cleanEmail = emp.email.toLowerCase().trim()
    const cleanEmpId = emp.employeeId.toUpperCase().trim()

    // Resilient lookup: match by email, employee ID, legacy EDU-DIR-001 ID, username, or name
    const lookupQueries = [{ email: cleanEmail }, { employeeId: cleanEmpId }]
    if (emp.role === 'managing_director') {
      lookupQueries.push(
        { employeeId: 'EDU-DIR-001' },
        { username: 'jagadishbabu' },
        { name: /jagadish\s*babu/i }
      )
    }

    const existing = await Employee.findOne({
      $or: lookupQueries,
    }).select('+passwordHash')

    const updateDoc = {
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

    // Never overwrite existing employeeId if already present in database (user will manage or update in existing data)
    if (existing?.employeeId) {
      updateDoc.employeeId = existing.employeeId
    } else {
      updateDoc.employeeId = cleanEmpId
    }

    const envPass = emp.role === 'admin'
      ? (process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || 'Password@123')
      : emp.role === 'hr'
      ? (process.env.HR_PASSWORD || process.env.SEED_HR_PASSWORD || 'Password@123')
      : (process.env.DIRECTOR_PASSWORD || process.env.SEED_DIRECTOR_PASSWORD || 'Password@123')

    if (existing?.passwordHash) {
      updateDoc.passwordHash = existing.passwordHash
    } else {
      updateDoc.passwordHash = hashPassword(envPass)
    }
    updateDoc.authVersion = (existing?.authVersion ?? 0) + 1

    if (emp.dob && !existing?.dob) {
      updateDoc.dob = new Date(emp.dob)
      updateDoc['identity.dob'] = new Date(emp.dob)
    }

    if (existing) {
      if (existing.avatarUrl) {
        updateDoc.avatarUrl = existing.avatarUrl
      }
      await Employee.updateOne({ _id: existing._id }, { $set: updateDoc })
      console.log(`[seedAllEmployees] Synchronized ${emp.name} as ${emp.role} (${emp.designation})`)
    } else {
      updateDoc.joiningDate = new Date('2023-01-01')
      updateDoc.onboardingStatus = 'verified'
      await Employee.create(updateDoc)
      console.log(`[seedAllEmployees] Provisioned ${emp.name} as ${emp.role} (${emp.designation})`)
    }
  }

  // Double-check & Database Self-Healing: Deduplicate and normalize roles, squads, and reporting hierarchy
  try {
    const db = mongoose.connection.db
    const employeesCol = db.collection('employees')
    const leaveBalancesCol = db.collection('leavebalances')

    // 1. Prune legacy duplicate accounts and orphaned balances
    const legacyDupeIds = [
      '6ae3c20194e63ef36c01731f', // EDU-ADM-002
      '6ae3c20194e63ef36c017320', // EDU-HR-002
      '6ae3c18411ea05abfa92b1e8', // duplicate Anjali Annie
      '6ae3c18411ea05abfa92b213', // duplicate Boopathi Raja S
      '6ae3c18411ea05abfa92b173', // duplicate Nathiya S
      '6ae21ff04d78abebef6b279d', // duplicate Naitik Raj
    ]
    for (const idStr of legacyDupeIds) {
      if (mongoose.isValidObjectId(idStr)) {
        const oid = new mongoose.Types.ObjectId(idStr)
        await employeesCol.deleteOne({ $or: [{ _id: oid }, { _id: idStr }] })
        await leaveBalancesCol.deleteMany({ $or: [{ employeeId: oid }, { employeeId: idStr }] })
      }
    }
    await Employee.deleteMany({
      $or: [
        { employeeId: { $in: ['EDU-ADM-002', 'EDU-HR-002'] } },
        { email: { $in: ['admin@edufyi.in', 'hr@edufyi.in'] } },
      ],
    })

    // 1b. Purge legacy dummy/fake birthdays (1995-09-20, 1999-02-24) from seeded or test accounts
    const dummyDobs = [
      new Date('1995-09-20T00:00:00.000Z'),
      new Date('1995-09-19T18:30:00.000Z'),
      '1995-09-20',
      '1999-02-24',
      new Date('1999-02-24T00:00:00.000Z'),
    ]
    await Employee.updateMany(
      {
        $or: [
          { dob: { $in: dummyDobs } },
          { 'identity.dob': { $in: dummyDobs } },
        ],
        employeeId: { $in: ['EDU-ADM-001', 'EDU-DIR-001'] }
      },
      {
        $unset: { dob: 1, 'identity.dob': 1 }
      }
    )

    const calendarEventsCol = db.collection('calendarevents')
    await calendarEventsCol.deleteMany({
      sourceType: 'employee_birthday',
      $or: [
        { sourceId: { $regex: /bday_(EDU-ADM-001|EDU-DIR-001)/ } },
        { 'sourceData.employeeId': { $in: ['EDU-ADM-001', 'EDU-DIR-001'] } }
      ]
    }).catch(() => {})

    // 2. Fetch current employees to map hierarchy
    const allEmps = await Employee.find({}).lean()
    const byCode = new Map()
    const byEmail = new Map()
    for (const e of allEmps) {
      if (e.employeeId) byCode.set(String(e.employeeId).toUpperCase(), e)
      if (e.email) byEmail.set(String(e.email).toLowerCase(), e)
    }

    const jagadish = allEmps.find(e => /jagadish\s*babu/i.test(e.name)) || byEmail.get('jagadishbabu@edufyitech.in')
    const adminRec = allEmps.find(e => e.employeeId === 'EDU-ADM-001') || byEmail.get('admin@edufyitech.in')
    const hrRec = allEmps.find(e => e.employeeId === 'EDU-HR-001') || byEmail.get('hr@edufyitech.in')
    const ravi = allEmps.find(e => e.employeeId === 'EDU-MGR-003' || /ravi/i.test(e.name))
    const basir = allEmps.find(e => e.employeeId === 'ETS21169' || /basir/i.test(e.name))
    const venky = allEmps.find(e => e.employeeId === 'ETS21168' || /venkatesh/i.test(e.name))

    const jagadishId = jagadish?._id
    const raviId = ravi?._id
    const basirId = basir?._id
    const venkyId = venky?._id

    if (jagadishId) {
      // Jagadish Babu -> Company Root
      await Employee.updateOne(
        { _id: jagadishId },
        {
          $set: {
            managerId: null,
            managerName: null,
            role: 'managing_director',
            designation: 'Managing Director',
            department: 'Executive Leadership',
            permissions: ['*'],
          },
        }
      )
      // HR reports to Jagadish
      if (hrRec?._id) {
        await Employee.updateOne(
          { _id: hrRec._id },
          { $set: { managerId: jagadishId, managerName: jagadish.name, department: 'Human Resources' } }
        )
      }
      // Department Heads report to Jagadish
      if (raviId) {
        await Employee.updateOne(
          { _id: raviId },
          { $set: { managerId: jagadishId, managerName: jagadish.name, role: 'manager', designation: 'Revenue Growth Manager', department: 'Revenue Growth' } }
        )
      }
      if (basirId) {
        await Employee.updateOne(
          { _id: basirId },
          { $set: { managerId: jagadishId, managerName: jagadish.name, role: 'manager', designation: 'Vertical Head', department: 'Operations' } }
        )
      }
      if (venkyId) {
        await Employee.updateOne(
          { _id: venkyId },
          { $set: { managerId: jagadishId, managerName: jagadish.name, role: 'manager', designation: 'Senior Manager', department: 'Technology' } }
        )
      }
    }

    if (adminRec?._id) {
      await Employee.updateOne(
        { _id: adminRec._id },
        {
          $set: {
            managerId: null,
            managerName: null,
            role: 'admin',
            designation: 'System Administrator',
            department: 'Executive Leadership',
            permissions: ['*'],
          },
        }
      )
    }

    // 3. Teams & Squads: Completely manual creation & management by Admin
    // Remove previously seeded legacy standard squads so user can create squads manually
    await workspaceModels.teams.deleteMany({
      $or: [
        { teamId: { $in: ['team-alpha', 'team-3bops', 'team-marketing', 'team-hustlers', 'team-tuk', 'team-thanos', 'team-elites', 'team-falcons'] } },
        { name: { $in: ['Alpha', '3 Bops', 'Marketing', 'Hustlers', 'TUK', 'Thanos', 'Elites', 'Falcons'] } },
      ],
    }).catch(() => {})

    await Employee.updateMany(
      {
        $or: [
          { squadId: { $in: ['team-alpha', 'team-3bops', 'team-marketing', 'team-hustlers', 'team-tuk', 'team-thanos', 'team-elites', 'team-falcons'] } },
          { teamId: { $in: ['team-alpha', 'team-3bops', 'team-marketing', 'team-hustlers', 'team-tuk', 'team-thanos', 'team-elites', 'team-falcons'] } },
          { squad: { $in: ['Alpha', '3 Bops', 'Marketing', 'Hustlers', 'TUK', 'Thanos', 'Elites', 'Falcons'] } },
          { team: { $in: ['Alpha', '3 Bops', 'Marketing', 'Hustlers', 'TUK', 'Thanos', 'Elites', 'Falcons'] } },
        ],
      },
      { $set: { team: '', teamId: '', squad: '', squadId: '' } }
    ).catch(() => {})

    for (const cr of canonicalRoles) {
      await workspaceModels.roles.findOneAndUpdate(
        { roleId: cr.roleId },
        { $set: cr },
        { upsert: true, returnDocument: 'after' }
      )
    }

    console.log('[seedAllEmployees] Database self-healing complete: pruned duplicates, synchronized hierarchy, 8 squads, and canonical roles.')
  } catch (healErr) {
    console.warn('[seedAllEmployees] Self-healing notice:', healErr?.message || healErr)
  }
}
