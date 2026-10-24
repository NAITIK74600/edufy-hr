// One-off generator: builds the real employee roster into
//  1) src/services/hrStore.js  (INITIAL_EMPLOYEES array — app/UI source)
//  2) server/src/modules/employees/seedEmployees.js  (backend/Mongo seed)
// Run: node scripts/gen-employees.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Raw roster as provided: [fullName, employeeId]. Blank id => not provided yet.
const RAW = [
  ['Chandana Somaih', 'ETS21206'],
  ['Venkatesh', 'ETS21168'],
  ['Yashraj Misal', 'ETS21224'],
  ['Rohan', 'ETS21188'],
  ['Anjali Annie', ''],
  ['Basir Bashir', 'ETS21169'],
  ['Nikitha P', 'ETS111781'],
  ['Nandish K', 'ETS21176'],
  ['Ankit Rautkar', 'ETS21196'],
  ['Sachin', 'ETS21185'],
  ['P Prudvi Teja', 'ETS21162'],
  ['Reon gomes', ''],
  ['Aakash', 'ETS21219'],
  ['Mayank Aryan', 'ETS112315'],
  ['Shreya Srivastava', 'ETS112936'],
  ['Abhishek Dabral', 'ETS112929'],
  ['Kavya', 'ETS21215'],
  ['Keerthi Shree R', 'ETS112700'],
  ['Vrushali', 'ETS21224'],
  ['Anwar Basha', 'ETS21186'],
  ['Boopathi Raja S', 'ETS21213'],
  ['Jyothika Bhumireddy', 'ETS112942'],
  ['Chayan Agarwal', 'ETS112932'],
  ['Megha prajapati', 'ETS21224'],
  ['Nayana C', 'ETS112644'],
  ['Sawanth Rathod', 'ETS113246'],
  ['Poornima Shivanand Marikatti', 'ETS21228'],
  ['Sanjay S M', 'EST113482'],
  ['Diya Verma', 'ETS112722'],
  ['Anoop Gutti', 'EST113386'],
  ['Supreet Dani', 'ETS112935'],
  ['Prajapati Dharshan', 'ETS113221'],
  ['Rupali Kushwaha', 'ETS21142'],
  ['Sandhiya P', 'ETS112991'],
  ['Anoop Megri', 'ETS113365'],
  ['Yashoda Thapa', 'ETS21229'],
  ['Veeralakshmi R', 'ETS112255'],
  ['JENY JOMON', 'ETS113323'],
  ['Kezhalezo Belho', 'EST113635'],
  ['Poonam Hessa', 'ETS112703'],
  ['Sumanth R', 'ETS113224'],
  ['Abhigna Nerusu', 'ETS112522'],
  ['Aniket giri', 'ETS113372'],
  ['Yedulla Navya', 'ETS21190'],
  ['Saniya Taj F', 'ETS112679'],
  ['Ayushi Dixit', 'ETS113378'],
  ['Ankit Kumar', 'EST113657'],
  ['Varsha Chaudhary', 'ETS113245'],
  ['Rebati Hansdah', 'ETS113243'],
  ['Anshul Khokhar', ''],
  ['Nathiya S', 'ETS21173'],
  ['Avijit Mandal', 'EST113484'],
  ['rishiraj Singh', 'EST113788'],
  ['Saniya D', 'ETS113236'],
  ['Kumud Naryal', 'EST113659'],
  ['Bhukya Madhu', 'EST113634'],
  ['Vishwaa U', 'EST113664'],
  ['Sudipta Das', 'EST113488'],
  ['Chamundi P', 'ETS113367'],
  ['Anusha J', 'EST113665'],
  ['Rakshitha Patil', 'ETS113546'],
  ['MamathaD S', 'ETS113355'],
  ['Krithika J', 'EST113666'],
  ['Bhumika Uttam Sankapal', 'EST113681'],
  ['Pratiksha Biradar', 'EST113533'],
  ['Bharaniraj K', 'ETS21216'],
  ['Nivetha P', 'ETS112249'],
  ['Meenakshi K', 'ETS112246'],
]

function emailOf(name, used) {
  let base = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!base) base = 'employee'
  let email = `${base}@edufyitech.in`
  let n = 2
  while (used.has(email)) {
    email = `${base}${n}@edufyitech.in`
    n += 1
  }
  used.add(email)
  return email
}

const usedEmails = new Set(['admin@edufyi.local', 'hr@edufyi.local'])
const records = RAW.map(([name, employeeId], i) => ({
  id: `emp-r${i + 1}`,
  employeeId: employeeId || '',
  name: name.trim(),
  email: emailOf(name, usedEmails),
  phone: '',
  department: 'Unassigned',
  designation: '',
  role: 'employee',
  status: 'active',
  joiningDate: '',
  salary: 0,
  managerId: 'emp-3',
  managerName: 'Admin',
  location: '',
  employmentType: 'Full-time',
}))

// ---- Build hrStore INITIAL_EMPLOYEES literal (keeps Admin + HR system accounts) ----
function hrStoreRecord(r) {
  return `  {
    id: ${JSON.stringify(r.id)},
    _id: ${JSON.stringify(r.id)},
    employeeId: ${JSON.stringify(r.employeeId)},
    name: ${JSON.stringify(r.name)},
    email: ${JSON.stringify(r.email)},
    phone: ${JSON.stringify(r.phone)},
    department: ${JSON.stringify(r.department)},
    designation: ${JSON.stringify(r.designation)},
    role: ${JSON.stringify(r.role)},
    status: ${JSON.stringify(r.status)},
    joiningDate: ${JSON.stringify(r.joiningDate)},
    salary: ${r.salary},
    managerId: ${JSON.stringify(r.managerId)},
    managerName: ${JSON.stringify(r.managerName)},
    location: ${JSON.stringify(r.location)},
    employmentType: ${JSON.stringify(r.employmentType)},
    bankDetails: { bankName: '', accountNumber: '', routingNumber: '', panTaxId: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    documents: [],
    onboardingChecklist: [],
    exitDetails: null,
  },`
}

const adminHr = `const INITIAL_EMPLOYEES = [
  // 1. COMPANY ROOT / ADMIN (system login account)
  {
    id: 'emp-3',
    _id: 'emp-3',
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    email: 'admin@edufyi.local',
    phone: '',
    department: 'Executive',
    designation: 'System Administrator',
    role: 'admin',
    status: 'active',
    joiningDate: '',
    salary: 0,
    managerId: null,
    managerName: 'Board of Directors',
    location: '',
    employmentType: 'Full-time',
    bankDetails: { bankName: '', accountNumber: '', routingNumber: '', panTaxId: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    documents: [],
    onboardingChecklist: [],
    exitDetails: null,
  },

  // 2. HR DEPARTMENT (system login account)
  {
    id: 'emp-4',
    _id: 'emp-4',
    employeeId: 'EDU-HR-001',
    name: 'HR',
    email: 'hr@edufyi.local',
    phone: '',
    department: 'Human Resources',
    designation: 'HR Operations',
    role: 'hr',
    status: 'active',
    joiningDate: '',
    salary: 0,
    managerId: 'emp-3',
    managerName: 'Admin',
    location: '',
    employmentType: 'Full-time',
    bankDetails: { bankName: '', accountNumber: '', routingNumber: '', panTaxId: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    documents: [],
    onboardingChecklist: [],
    exitDetails: null,
  },

  // 3. WORKFORCE (real roster — department Unassigned until updated)
${records.map(hrStoreRecord).join('\n')}
]`

// Patch hrStore.js
const hrStorePath = resolve(root, 'src/services/hrStore.js')
let hrStoreSrc = readFileSync(hrStorePath, 'utf8')
const startMarker = 'const INITIAL_EMPLOYEES = ['
const endMarker = '\n]\n\nexport function calculateDistanceMeters'
const startIdx = hrStoreSrc.indexOf(startMarker)
const endIdx = hrStoreSrc.indexOf(endMarker)
if (startIdx === -1 || endIdx === -1) {
  throw new Error('Could not locate INITIAL_EMPLOYEES block in hrStore.js')
}
hrStoreSrc = hrStoreSrc.slice(0, startIdx) + adminHr + '\n\nexport function calculateDistanceMeters' + hrStoreSrc.slice(endIdx + endMarker.length)
writeFileSync(hrStorePath, hrStoreSrc)

// ---- Build backend seed file ----
const backend = `// Real employee roster seed (generated by scripts/gen-employees.mjs).
// Imported by the employee repository when seeding an empty store.
export const SEED_EMPLOYEES = ${JSON.stringify(records, null, 2)}
`
writeFileSync(resolve(root, 'server/src/modules/employees/seedEmployees.js'), backend)

// ---- Patch backend memory repository DEFAULT_EMPLOYEES ----
function backendRecord(r) {
  return `  {
    id: ${JSON.stringify(r.id)},
    _id: ${JSON.stringify(r.id)},
    employeeId: ${JSON.stringify(r.employeeId)},
    name: ${JSON.stringify(r.name)},
    displayName: ${JSON.stringify(r.name)},
    email: ${JSON.stringify(r.email)},
    role: ${JSON.stringify(r.role)},
    department: ${JSON.stringify(r.department)},
    designation: ${JSON.stringify(r.designation)},
    status: ${JSON.stringify(r.status)},
    managerId: ${JSON.stringify(r.managerId)},
    location: ${JSON.stringify(r.location)},
    joiningDate: null,
  },`
}

const backendDefault = `const DEFAULT_EMPLOYEES = [
  // System login accounts (org-chart root)
  {
    id: 'emp-3',
    _id: 'emp-3',
    employeeId: 'EDU-ADM-001',
    name: 'Admin',
    displayName: 'Admin',
    email: 'admin@edufyi.local',
    role: 'admin',
    department: 'Executive',
    designation: 'System Administrator',
    status: 'active',
    managerId: null,
    location: '',
    joiningDate: new Date('2021-03-01'),
  },
  {
    id: 'emp-4',
    _id: 'emp-4',
    employeeId: 'EDU-HR-001',
    name: 'HR',
    displayName: 'HR',
    email: 'hr@edufyi.local',
    role: 'hr',
    department: 'Human Resources',
    designation: 'HR Operations',
    status: 'active',
    managerId: 'emp-3',
    location: '',
    joiningDate: new Date('2022-06-15'),
  },

  // Real workforce roster (department Unassigned until updated)
${records.map(backendRecord).join('\n')}
]`

const repoPath = resolve(root, 'server/src/modules/employees/memoryEmployeeRepository.js')
let repoSrc = readFileSync(repoPath, 'utf8')
const repoStart = repoSrc.indexOf('const DEFAULT_EMPLOYEES = [')
const repoEndMarker = '\n]\n\nlet records ='
const repoEnd = repoSrc.indexOf(repoEndMarker)
if (repoStart === -1 || repoEnd === -1) {
  throw new Error('Could not locate DEFAULT_EMPLOYEES block in memoryEmployeeRepository.js')
}
repoSrc = repoSrc.slice(0, repoStart) + backendDefault + '\n\nlet records =' + repoSrc.slice(repoEnd + repoEndMarker.length)
writeFileSync(repoPath, repoSrc)

console.log(`Done. Wrote ${records.length} real employees + Admin + HR to hrStore.js, seedEmployees.js and memoryEmployeeRepository.js`)

