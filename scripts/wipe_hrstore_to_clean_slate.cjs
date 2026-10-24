const fs = require('fs');

const hrStorePath = 'src/services/hrStore.js';
let content = fs.readFileSync(hrStorePath, 'utf8');

// 1. Update STORAGE_KEY to v2
content = content.replace(
  /const STORAGE_KEY = 'edufyi_hr_store_v1'/,
  "const STORAGE_KEY = 'edufyi_hr_store_v2'"
);

// 2. Empty INITIAL_DEPARTMENTS
const deptStart = content.indexOf('export const INITIAL_DEPARTMENTS = [');
const deptEnd = content.indexOf('export const STANDARD_ROLE_CONFIG = {');
if (deptStart !== -1 && deptEnd !== -1) {
  content = content.slice(0, deptStart) + 'export const INITIAL_DEPARTMENTS = [];\n\n' + content.slice(deptEnd);
  console.log('Cleared INITIAL_DEPARTMENTS');
}

// 3. Empty INITIAL_TEAMS
const teamStart = content.indexOf('export const INITIAL_TEAMS = [');
const teamEnd = content.indexOf('const INITIAL_USERS = [');
if (teamStart !== -1 && teamEnd !== -1) {
  content = content.slice(0, teamStart) + 'export const INITIAL_TEAMS = [];\n\n' + content.slice(teamEnd);
  console.log('Cleared INITIAL_TEAMS');
}

// 4. Clean INITIAL_USERS (Only Admin)
const cleanAdminUser = [
  {
    id: 'user-admin-1',
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    displayName: 'Administrator',
    email: 'admin@edufyi.in',
    role: 'admin',
    department: '',
    team: null,
    teamId: null,
    designation: 'System Administrator',
    status: 'active',
    avatarTone: 'teal',
    managerId: null,
    teamLeadId: null,
    permissions: ['*'],
  },
];
const usersCode = 'const INITIAL_USERS = ' + JSON.stringify(cleanAdminUser, null, 2) + ';\n\n';
const userBlockStart = content.indexOf('const INITIAL_USERS = [');
const userBlockEnd = content.indexOf('const INITIAL_EMPLOYEES = [');
if (userBlockStart !== -1 && userBlockEnd !== -1) {
  content = content.slice(0, userBlockStart) + usersCode + content.slice(userBlockEnd);
  console.log('Cleared INITIAL_USERS to single Admin');
}

// 5. Clean INITIAL_EMPLOYEES (Only Admin)
const cleanAdminEmployee = [
  {
    id: 'emp-3',
    _id: 'emp-3',
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    displayName: 'Administrator',
    email: 'admin@edufyi.in',
    phone: '',
    department: '',
    team: null,
    teamId: null,
    designation: 'System Administrator',
    role: 'admin',
    status: 'active',
    joiningDate: '2023-01-01',
    salary: 0,
    managerId: null,
    managerName: null,
    location: '',
    employmentType: 'Full-time',
    bankDetails: { bankName: '', accountNumber: '', ifscCode: '', panTaxId: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    documents: [],
    onboardingChecklist: [],
    exitDetails: null,
  },
];

const empBlockStart = content.indexOf('const INITIAL_EMPLOYEES = [');
const empBlockEnd = content.indexOf('export function calculateDistanceMeters');
if (empBlockStart !== -1 && empBlockEnd !== -1) {
  const employeesCode = 'const INITIAL_EMPLOYEES = ' + JSON.stringify(cleanAdminEmployee, null, 2) + ';\n\n';
  content = content.slice(0, empBlockStart) + employeesCode + content.slice(empBlockEnd);
  console.log('Cleared INITIAL_EMPLOYEES to single Admin');
}

// 6. Update loadStore logic so it doesn't resurrect demo employees or teams
const loadStoreStart = content.indexOf('function loadStore() {');
const loadStoreEnd = content.indexOf('function saveStore(state) {');
if (loadStoreStart !== -1 && loadStoreEnd !== -1) {
  const newLoadStore = `function loadStore() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Clear legacy storage keys
      window.localStorage.removeItem('edufyi_hr_store_v1');
      window.localStorage.removeItem('orbit_hr_store_v1');

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed.employees) || parsed.employees.length === 0) {
          parsed.employees = [...INITIAL_EMPLOYEES];
        }
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = [...INITIAL_USERS];
        }
        if (!Array.isArray(parsed.departments)) {
          parsed.departments = [];
        }
        if (!Array.isArray(parsed.teams)) {
          parsed.teams = [];
        }
        if (!Array.isArray(parsed.roles)) {
          parsed.roles = INITIAL_ROLES.filter((r) => r.isSystem);
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse local storage store:', err);
    }
  }

  return {
    users: [...INITIAL_USERS],
    employees: [...INITIAL_EMPLOYEES],
    departments: [],
    teams: [],
    roles: INITIAL_ROLES.filter((r) => r.isSystem),
    customRolePermissions: {},
    attendance: [],
    leaves: [],
    payroll: [],
    tasks: [],
    expenses: [],
    dailyReports: [],
    helpDesk: [],
    documents: [],
    companySettings: {
      companyName: 'Edufyi Technologies',
      brandColor: '#006e6f',
      locations: [],
      workingHours: { start: '09:30', end: '18:30' },
      maskBankAccount: false,
    },
    holidays: [],
    announcements: [],
    requisitions: [],
    auditLogs: [],
  };
}\n\n`;

  content = content.slice(0, loadStoreStart) + newLoadStore + content.slice(loadStoreEnd);
  console.log('Updated loadStore to pure clean slate');
}

fs.writeFileSync(hrStorePath, content, 'utf8');
console.log('Successfully written clean slate to hrStore.js!');
