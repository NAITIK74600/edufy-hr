// Central reactive store for HR, Admin, and Employee Self-Service (ESS) workflows
// Core workforce records come from the API; unrelated workspace preferences remain local.
import { createConnectedStore } from './connectedStore.js'
import { workspaceKeys } from './workspaceStore.js'
import { playNotificationSound } from '../utils/soundHelper.js'

const STORAGE_KEY = 'edufyi_hr_store_v2'
const STORAGE_PERSISTED_NOTIFICATIONS_KEY = 'edufyi_persisted_notifications_v2'
const STORAGE_CLEARED_NOTIFICATIONS_KEY = 'edufyi_notifications_cleared_v2'
const STORAGE_DELETED_NOTIFICATIONS_KEY = 'edufyi_deleted_notifications_v2'


export const INITIAL_ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Master enterprise superuser with unrestricted access across all system settings, user provisioning, security audits, and backups.',
    badge: 'Superuser',
    isSystem: true,
    permissions: ['*'],
  },
  {
    id: 'operations_executive',
    name: 'Operations Executive',
    description: 'Operations specialist responsible for daily process execution, cross-team coordination, workflow quality control, and compliance audits.',
    badge: 'Operations',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'revenue_growth_manager',
    name: 'Revenue Growth Manager',
    description: 'Commercial leader steering client acquisition channels, pipeline velocity, sales target execution, and revenue squad operations.',
    badge: 'Management',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'employees.read',
      'attendance.read',
      'attendance.team.read',
      'leave.self.read',
      'leave.self.write',
      'leave.team.read',
      'leave.team.approve',
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
  },
  {
    id: 'vertical_head',
    name: 'Vertical Head',
    description: 'Senior business leadership heading complete operational and revenue verticals, managing managers, team squads, and P&L targets.',
    badge: 'Vertical Head',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'employees.read',
      'attendance.read',
      'attendance.team.read',
      'leave.self.read',
      'leave.self.write',
      'leave.team.read',
      'leave.team.approve',
      'payroll.self.read',
      'performance.read',
      'reports.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
      'departments.read',
    ],
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Departmental manager directing team leads, coordinating multi-team deliverables, conducting 2nd-tier reviews, and approving requests.',
    badge: 'Management',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'employees.read',
      'attendance.read',
      'attendance.team.read',
      'leave.self.read',
      'leave.self.write',
      'leave.team.read',
      'leave.team.approve',
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
  },
  {
    id: 'team_leader',
    name: 'Team Leader',
    description: 'Frontline squad leader supervising daily task execution, running morning standups, tracking progress, and approving direct reports leave.',
    badge: 'Team Lead',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'employees.read',
      'attendance.read',
      'attendance.team.read',
      'leave.self.read',
      'leave.self.write',
      'leave.team.read',
      'leave.team.approve',
      'payroll.self.read',
      'performance.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'business_development_executive',
    name: 'Business Development Executive',
    description: 'Sales professional responsible for corporate outreach, client pitches, proposal negotiation, and business expansion.',
    badge: 'Sales & Growth',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'business_development_intern',
    name: 'Business Development Intern',
    description: 'Sales trainee supporting lead prospecting, market intelligence, outreach scheduling, and CRM contact enrichment.',
    badge: 'Intern',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'marketing_executive',
    name: 'Marketing Executive',
    description: 'Marketing specialist driving campaign execution, social media presence, brand assets, and content marketing.',
    badge: 'Marketing',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'marketing_intern',
    name: 'Marketing Intern',
    description: 'Marketing trainee assisting with content distribution, social media posts, campaign analytics, and creative marketing collateral.',
    badge: 'Intern',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'managing_director',
    name: 'Managing Director',
    description: 'Chief executive leadership directing corporate strategy, vertical growth heads, organizational governance, and enterprise expansion.',
    badge: 'Leadership',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'hr.dashboard.read',
      'employees.read',
      'attendance.read',
      'attendance.team.read',
      'leave.self.read',
      'leave.self.write',
      'leave.team.read',
      'leave.team.approve',
      'leave.hr.read',
      'payroll.self.read',
      'performance.read',
      'reports.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
      'departments.read',
    ],
  },
  {
    id: 'co_founder',
    name: 'Co-Founder',
    description: 'Founding leadership driving company vision, long-term capital allocation, investor relations, and core corporate governance.',
    badge: 'Leadership',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'hr.dashboard.read',
      'employees.read',
      'attendance.read',
      'attendance.team.read',
      'leave.self.read',
      'leave.self.write',
      'leave.team.read',
      'leave.team.approve',
      'leave.hr.read',
      'payroll.self.read',
      'performance.read',
      'reports.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
      'departments.read',
    ],
  },
  {
    id: 'sde_intern',
    name: 'SDE Intern',
    description: 'Software engineering trainee assisting with feature development, unit testing, bug investigation, and code reviews.',
    badge: 'Intern',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'sde',
    name: 'SDE',
    description: 'Software Development Engineer building core applications, APIs, responsive frontend architectures, and reliable systems.',
    badge: 'Engineering',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'post_sales_intern',
    name: 'Post-Sales Intern',
    description: 'Customer success trainee assisting client queries, documentation collection, onboarding survey followups, and ticket routing.',
    badge: 'Intern',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'post_sales_executive',
    name: 'Post-Sales Executive',
    description: 'Client retention specialist managing post-purchase customer onboarding, service delivery verification, upsells, and relationship health.',
    badge: 'Post-Sales',
    isSystem: true,
    permissions: [
      'dashboard.read',
      'leave.self.read',
      'leave.self.write',
      'attendance.read',
      'attendance.write',
      'payroll.self.read',
      'tasks.read',
      'training.read',
      'documents.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
    ],
  },
  {
    id: 'hr_executive',
    name: 'HR Executive',
    description: 'People operations specialist managing recruitment pipelines, employee onboarding, attendance tracking, leave audits, and policy compliance.',
    badge: 'HR Ops',
    isSystem: true,
    permissions: [
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
      'payroll.read',
      'payroll.self.read',
      'performance.read',
      'recruitment.read',
      'recruitment.write',
      'reports.read',
      'tasks.read',
      'training.read',
      'helpdesk.read',
      'announcements.read',
      'holidays.read',
      'documents.read',
      'settings.hr.read',
    ],
  },
];

export const INITIAL_DEPARTMENTS = [
  {
    id: 'dept-leadership',
    deptId: 'dept-leadership',
    name: 'Leadership',
    code: 'LEAD',
    head: 'Executive Leadership',
    description: 'Executive leadership, strategic direction, corporate governance, and company vision.',
    isCustom: false,
  },
  {
    id: 'dept-hr',
    deptId: 'dept-hr',
    name: 'Human Resources (HR)',
    code: 'HR',
    head: 'HR Lead',
    description: 'People operations, talent acquisition, employee relations, payroll, and corporate compliance.',
    isCustom: false,
  },
  {
    id: 'dept-sales',
    deptId: 'dept-sales',
    name: 'Sales',
    code: 'SALE',
    head: 'Head of Sales',
    description: 'Revenue generation, client acquisition, deal closures, and enterprise account growth.',
    isCustom: false,
  },
  {
    id: 'dept-marketing',
    deptId: 'dept-marketing',
    name: 'Marketing',
    code: 'MKTG',
    head: 'Head of Marketing',
    description: 'Brand positioning, digital marketing, performance advertising, content, and lead generation.',
    isCustom: false,
  },
  {
    id: 'dept-bizops',
    deptId: 'dept-bizops',
    name: 'Business Operations',
    code: 'BIZOP',
    head: 'Head of Business Operations',
    description: 'Cross-functional process optimization, business analytics, strategy execution, and scaling.',
    isCustom: false,
  },
  {
    id: 'dept-operations',
    deptId: 'dept-operations',
    name: 'Operations',
    code: 'OPS',
    head: 'Operations Manager',
    description: 'Daily operational execution, service delivery, workflow management, and client support.',
    isCustom: false,
  },
  {
    id: 'dept-b2b',
    deptId: 'dept-b2b',
    name: 'B2B',
    code: 'B2B',
    head: 'B2B Business Head',
    description: 'Business-to-business partnerships, corporate sales, institutional client relations, and alliances.',
    isCustom: false,
  },
  {
    id: 'dept-technology',
    deptId: 'dept-technology',
    name: 'Technology',
    code: 'TECH',
    head: 'Chief Technology Officer',
    description: 'Software engineering, product development, IT infrastructure, cloud architecture, and cybersecurity.',
    isCustom: false,
  },
  {
    id: 'dept-managing-director',
    deptId: 'dept-managing-director',
    name: 'Managing Director',
    code: 'MD',
    head: 'Managing Director',
    description: 'Office of the Managing Director, executive oversight, and organizational steering.',
    isCustom: false,
  },
  {
    id: 'dept-co-founder',
    deptId: 'dept-co-founder',
    name: 'Co-Founder',
    code: 'COF',
    head: 'Co-Founder',
    description: 'Founder Office, strategic partnerships, enterprise incubation, and equity stewardship.',
    isCustom: false,
  },
];

export const STANDARD_ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    defaultDepartment: 'Executive Leadership',
    defaultDesignation: 'System Administrator',
    designations: [
      'System Administrator',
      'IT Administrator',
      'Platform Operations Lead',
      'Security Administrator',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Board of Directors',
  },
  managing_director: {
    label: 'Managing Director',
    defaultDepartment: 'Executive Leadership',
    defaultDesignation: 'Managing Director',
    designations: [
      'Managing Director',
      'Executive Director',
      'Chief Operating Officer',
      'Chief Executive Officer',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Board of Directors',
  },
  co_founder: {
    label: 'Co-Founder',
    defaultDepartment: 'Executive Leadership',
    defaultDesignation: 'Co-Founder',
    designations: [
      'Co-Founder',
      'Co-Founder & Director',
      'Founding Partner',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Board of Directors',
  },
  vertical_head: {
    label: 'Vertical Head',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Vertical Head',
    designations: [
      'Vertical Head',
      'Head of Operations',
      'Business Vertical Head',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Managing Director',
  },
  revenue_growth_manager: {
    label: 'Revenue Growth Manager',
    defaultDepartment: 'Revenue Growth',
    defaultDesignation: 'Revenue Growth Manager',
    designations: [
      'Revenue Growth Manager',
      'Head of Revenue',
      'Enterprise Growth Lead',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Vertical Head',
  },
  manager: {
    label: 'Manager',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Manager',
    designations: [
      'Manager',
      'Operations Manager',
      'Project Manager',
      'Department Manager',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Vertical Head',
  },
  team_leader: {
    label: 'Team Leader',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Team Leader',
    designations: [
      'Team Leader',
      'Operations Team Leader',
      'Team Lead',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Manager',
  },
  hr_executive: {
    label: 'HR Executive',
    defaultDepartment: 'Human Resources',
    defaultDesignation: 'HR Executive',
    designations: [
      'HR Executive',
      'Senior HR Executive',
      'People Operations Specialist',
      'HR Lead & Operations',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Managing Director',
  },
  operations_executive: {
    label: 'Operations Executive',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Operations Executive',
    designations: [
      'Operations Executive',
      'Senior Operations Executive',
      'Operations Specialist',
      'Process Coordinator',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  business_development_executive: {
    label: 'Business Development Executive',
    defaultDepartment: 'Revenue Growth',
    defaultDesignation: 'Business Development Executive',
    designations: [
      'Business Development Executive',
      'Senior BDE',
      'BDE',
      'Growth Specialist',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Revenue Growth Manager',
  },
  business_development_intern: {
    label: 'Business Development Intern',
    defaultDepartment: 'Revenue Growth',
    defaultDesignation: 'Business Development Intern',
    designations: [
      'Business Development Intern',
      'BD Intern',
      'Sales Intern',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  marketing_executive: {
    label: 'Marketing Executive',
    defaultDepartment: 'Marketing',
    defaultDesignation: 'Marketing Executive',
    designations: [
      'Marketing Executive',
      'Digital Marketing Executive',
      'Content Marketing Executive',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  marketing_intern: {
    label: 'Marketing Intern',
    defaultDepartment: 'Marketing',
    defaultDesignation: 'Marketing Intern',
    designations: [
      'Marketing Intern',
      'Social Media Intern',
      'Digital Marketing Intern',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  sde: {
    label: 'SDE',
    defaultDepartment: 'Technology',
    defaultDesignation: 'Software Development Engineer',
    designations: [
      'Software Development Engineer',
      'SDE',
      'SDE I',
      'SDE II',
      'Senior SDE',
      'Frontend Engineer',
      'Backend Engineer',
      'Full Stack Engineer',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  sde_intern: {
    label: 'SDE Intern',
    defaultDepartment: 'Technology',
    defaultDesignation: 'SDE Intern',
    designations: [
      'SDE Intern',
      'Software Engineering Intern',
      'Frontend Intern',
      'Backend Intern',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  post_sales_executive: {
    label: 'Post-Sales Executive',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Post-Sales Executive',
    designations: [
      'Post-Sales Executive',
      'Customer Success Executive',
      'Client Retention Executive',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  post_sales_intern: {
    label: 'Post-Sales Intern',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Post-Sales Intern',
    designations: [
      'Post-Sales Intern',
      'Customer Success Intern',
      'Client Support Intern',
    ],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
  // Compatibility Aliases
  director: {
    label: 'Managing Director',
    defaultDepartment: 'Leadership',
    defaultDesignation: 'Managing Director',
    designations: ['Managing Director', 'Executive Director', 'Chief Operating Officer'],
    defaultManagerId: null,
    defaultManagerName: 'Board of Directors',
  },
  hr: {
    label: 'HR Executive',
    defaultDepartment: 'Human Resources (HR)',
    defaultDesignation: 'HR Executive',
    designations: ['HR Executive', 'Senior HR Executive', 'People Operations Specialist', 'HR Lead & Operations'],
    defaultManagerId: null,
    defaultManagerName: 'Managing Director',
  },
  team_lead: {
    label: 'Team Leader',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Team Leader',
    designations: ['Team Leader', 'Team Lead'],
    defaultManagerId: null,
    defaultManagerName: 'Manager',
  },
  sales: {
    label: 'Sales Executive',
    defaultDepartment: 'Sales',
    defaultDesignation: 'Sales Executive',
    designations: ['Sales Executive', 'Senior Sales Executive', 'Account Executive', 'Sales Lead', 'Sales Manager'],
    defaultManagerId: null,
    defaultManagerName: 'Head of Sales',
  },
  marketing: {
    label: 'Marketing Executive',
    defaultDepartment: 'Marketing',
    defaultDesignation: 'Marketing Executive',
    designations: ['Marketing Executive', 'Digital Marketing Specialist', 'Performance Marketer', 'Marketing Manager'],
    defaultManagerId: null,
    defaultManagerName: 'Head of Marketing',
  },
  b2b: {
    label: 'B2B Specialist',
    defaultDepartment: 'B2B',
    defaultDesignation: 'B2B Account Manager',
    designations: ['B2B Account Manager', 'Corporate Sales Executive', 'Institutional Partnerships Lead', 'B2B Lead'],
    defaultManagerId: null,
    defaultManagerName: 'B2B Business Head',
  },
  technology: {
    label: 'Technology Specialist / Engineer',
    defaultDepartment: 'Technology',
    defaultDesignation: 'Software Development Engineer (SDE)',
    designations: ['Software Development Engineer (SDE)', 'Senior Software Engineer', 'Full Stack Engineer', 'Tech Lead'],
    defaultManagerId: null,
    defaultManagerName: 'Chief Technology Officer',
  },
  business_operations: {
    label: 'Business Operations Lead',
    defaultDepartment: 'Business Operations',
    defaultDesignation: 'Business Operations Lead',
    designations: ['Business Operations Lead', 'Operations Analyst', 'Process Optimization Specialist', 'BizOps Manager'],
    defaultManagerId: null,
    defaultManagerName: 'Head of Business Operations',
  },
  employee: {
    label: 'Associate / Specialist',
    defaultDepartment: 'Operations',
    defaultDesignation: 'Associate',
    designations: ['Associate', 'Specialist', 'Executive'],
    defaultManagerId: null,
    defaultManagerName: 'Team Leader',
  },
};

export const DEPARTMENT_DESIGNATIONS = {
  'leadership': [
    'Executive Director',
    'Vice President',
    'Chief Operating Officer',
    'Chief Executive Officer',
    'Strategic Director',
    'Executive Associate',
  ],
  'human resources (hr)': [
    'HR Executive',
    'Senior HR Executive',
    'People Operations Specialist',
    'Talent Acquisition Lead',
    'HR Generalist',
    'HR Manager',
  ],
  'sales': [
    'Sales Executive',
    'Senior Sales Executive',
    'Account Executive',
    'Sales Lead',
    'Sales Manager',
    'Business Development Executive',
  ],
  'marketing': [
    'Marketing Executive',
    'Digital Marketing Specialist',
    'Performance Marketer',
    'Content Marketing Strategist',
    'SEO Specialist',
    'Marketing Manager',
  ],
  'business operations': [
    'Business Operations Lead',
    'Operations Analyst',
    'Process Optimization Specialist',
    'BizOps Manager',
    'Strategy & Operations Associate',
  ],
  'operations': [
    'Operations Executive',
    'Senior Operations Executive',
    'Operations Specialist',
    'Process Coordinator',
    'Operations Team Leader',
    'Operations Manager',
  ],
  'b2b': [
    'B2B Account Manager',
    'Corporate Sales Executive',
    'Institutional Partnerships Lead',
    'B2B Enterprise Lead',
    'Client Relationship Manager',
  ],
  'technology': [
    'Software Development Engineer (SDE)',
    'Senior Software Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Tech Lead',
    'DevOps Engineer',
    'QA Specialist',
  ],
  'managing director': [
    'Managing Director',
    'Executive Director',
    'Chief Executive Officer',
  ],
  'co-founder': [
    'Co-Founder',
    'Co-Founder & Director',
    'Founding Partner',
  ],
};

export function getRecommendedRoleConfig(role, department = '') {
  const roleCfg = STANDARD_ROLE_CONFIG[role] || STANDARD_ROLE_CONFIG.employee || {}
  const dept = department || roleCfg.defaultDepartment || ''
  const deptSpecific = roleCfg.departmentDefaults?.[dept]
  const cleanDeptKey = dept.toLowerCase().replace(/[^a-z0-9]/g, '')
  let deptDesignations = []
  for (const [k, list] of Object.entries(DEPARTMENT_DESIGNATIONS)) {
    const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (kNorm === cleanDeptKey) {
      deptDesignations = list
      break
    }
  }
  if (deptDesignations.length === 0) {
    for (const [k, list] of Object.entries(DEPARTMENT_DESIGNATIONS)) {
      const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (cleanDeptKey.length >= 3 && (cleanDeptKey.includes(kNorm) || kNorm.includes(cleanDeptKey))) {
        deptDesignations = list
        break
      }
    }
  }

  const roleDesignations = roleCfg.designations || []
  const combinedSuggestions = Array.from(new Set([...deptDesignations, ...roleDesignations]))
  const designation = deptSpecific?.defaultDesignation || (deptDesignations.length > 0 ? deptDesignations[0] : roleCfg.defaultDesignation) || 'Specialist'
  const designations = combinedSuggestions.length > 0 ? combinedSuggestions : [designation]
  const roleLabel = roleCfg.label || role || 'Employee'
  return {
    roleLabel,
    department: dept,
    designation,
    designations,
    suggestions: designations,
    defaultDepartment: roleCfg.defaultDepartment,
    defaultManagerId: roleCfg.defaultManagerId,
    defaultManagerName: roleCfg.defaultManagerName,
  }
}

export const INITIAL_TEAMS = [];

const INITIAL_USERS = [
  {
    "id": "user-admin-1",
    "employeeId": "EDU-ADM-001",
    "name": "Admin",
    "displayName": "Admin",
    "email": "admin@edufyi.local",
    "role": "admin",
    "department": "Executive Leadership",
    "team": null,
    "teamId": null,
    "designation": "System Administrator",
    "status": "active",
    "avatarTone": "violet",
    "managerId": null,
    "teamLeadId": null,
    "permissions": [
      "*"
    ]
  },
  {
    "id": "user-director-1",
    "employeeId": "EDU-DIR-001",
    "name": "Jagadish Babu",
    "displayName": "Jagadish Babu (Managing Director)",
    "email": "jagadishbabu@edufyitech.in",
    "role": "director",
    "department": "Executive Leadership",
    "team": null,
    "teamId": null,
    "designation": "Managing Director",
    "status": "active",
    "avatarTone": "purple",
    "managerId": null,
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "employees.write",
      "employees.manager.assign",
      "leave.self.read",
      "leave.team.read",
      "leave.team.approve",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read",
      "reports.read"
    ]
  },
  {
    "id": "dev-hr-1",
    "employeeId": "EDU-HR-001",
    "name": "HR",
    "displayName": "HR (People Operations)",
    "email": "hr@edufyi.local",
    "role": "hr",
    "department": "Human Resources",
    "team": null,
    "teamId": null,
    "designation": "HR Operations",
    "status": "active",
    "avatarTone": "teal",
    "managerId": "emp-director",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "hr.dashboard.read",
      "employees.read",
      "employees.write",
      "employees.manager.assign",
      "attendance.read",
      "attendance.write",
      "leave.team.read",
      "leave.hr.read",
      "leave.hr.review",
      "leave.policy.admin",
      "reports.read",
      "recruitment.read",
      "performance.read",
      "tasks.read",
      "training.read",
      "helpdesk.read",
      "announcements.read",
      "holidays.read",
      "documents.read",
      "settings.hr.read"
    ]
  },
  {
    "id": "user-emp-mgr-ravi",
    "employeeId": "EDU-MGR-003",
    "name": "Ravi",
    "displayName": "Ravi (Revenue Growth Manager)",
    "email": "ravi@edufyitech.in",
    "role": "manager",
    "department": "Revenue Growth",
    "team": null,
    "teamId": null,
    "designation": "Revenue Growth Manager",
    "status": "active",
    "avatarTone": "amber",
    "managerId": "emp-director",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "leave.team.approve",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r6",
    "employeeId": "ETS21169",
    "name": "Basir Bashir",
    "displayName": "Basir (Vertical Head)",
    "email": "basirbashir@edufyitech.in",
    "role": "manager",
    "department": "Operations",
    "team": null,
    "teamId": null,
    "designation": "Vertical Head",
    "status": "active",
    "avatarTone": "cyan",
    "managerId": "emp-director",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "leave.team.approve",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r2",
    "employeeId": "ETS21168",
    "name": "Venkatesh (Venky)",
    "displayName": "Venky (Senior Manager)",
    "email": "venkatesh@edufyitech.in",
    "role": "manager",
    "department": "Technology",
    "team": null,
    "teamId": null,
    "designation": "Senior Manager",
    "status": "active",
    "avatarTone": "blue",
    "managerId": "emp-director",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "leave.team.approve",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r4",
    "employeeId": "ETS21188",
    "name": "Rohan",
    "displayName": "Rohan (Team Leader - Alpha)",
    "email": "rohan@edufyitech.in",
    "role": "team_lead",
    "department": "Revenue Growth",
    "team": "Alpha",
    "teamId": "team-alpha",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "emerald",
    "managerId": "emp-mgr-ravi",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r5",
    "employeeId": "ETS21189",
    "name": "Anjali Annie",
    "displayName": "Anjali (Team Leader - 3 Bops)",
    "email": "anjali@edufyitech.in",
    "role": "team_lead",
    "department": "Revenue Growth",
    "team": "3 Bops",
    "teamId": "team-3bops",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "indigo",
    "managerId": "emp-mgr-ravi",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r21",
    "employeeId": "ETS21190",
    "name": "Bhoopathi Raja S",
    "displayName": "Bhoopathi (Team Leader - Marketing)",
    "email": "bhoopathi@edufyitech.in",
    "role": "team_lead",
    "department": "Revenue Growth",
    "team": "Marketing",
    "teamId": "team-marketing",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "rose",
    "managerId": "emp-mgr-ravi",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r3",
    "employeeId": "ETS21191",
    "name": "Yashraj Misal (Yash)",
    "displayName": "Yash (Team Leader - Hustlers)",
    "email": "yash@edufyitech.in",
    "role": "team_lead",
    "department": "Revenue Growth",
    "team": "Hustlers",
    "teamId": "team-hustlers",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "orange",
    "managerId": "emp-mgr-ravi",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-tl-bharani",
    "employeeId": "ETS21175",
    "name": "Bharani",
    "displayName": "Bharani (Team Leader - TUK)",
    "email": "bharani@edufyitech.in",
    "role": "team_lead",
    "department": "Technology",
    "team": "TUK",
    "teamId": "team-tuk",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "sky",
    "managerId": "emp-r2",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r8",
    "employeeId": "ETS21176",
    "name": "Nandish K (Vadish)",
    "displayName": "Nandish (Team Leader - Thanos)",
    "email": "nandish@edufyitech.in",
    "role": "team_lead",
    "department": "Technology",
    "team": "Thanos",
    "teamId": "team-thanos",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "lime",
    "managerId": "emp-r2",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r51",
    "employeeId": "ETS21177",
    "name": "Nathyya S",
    "displayName": "Nathyya (Team Leader - Elites)",
    "email": "nathyya@edufyitech.in",
    "role": "team_lead",
    "department": "Technology",
    "team": "Elites",
    "teamId": "team-elites",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "pink",
    "managerId": "emp-r2",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r14",
    "employeeId": "ETS112315",
    "name": "Mayank Aryan",
    "displayName": "Mayank (Team Leader - Falcons)",
    "email": "mayankaryan@edufyitech.in",
    "role": "team_lead",
    "department": "Operations",
    "team": "Falcons",
    "teamId": "team-falcons",
    "designation": "Team Leader",
    "status": "active",
    "avatarTone": "fuchsia",
    "managerId": "emp-r6",
    "teamLeadId": null,
    "permissions": [
      "dashboard.read",
      "employees.read",
      "leave.self.read",
      "leave.team.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r1",
    "employeeId": "ETS21206",
    "name": "Chandana Somaih",
    "displayName": "Chandana Somaih",
    "email": "chandanasomaih@edufyitech.in",
    "role": "employee",
    "department": "Operations",
    "team": "Falcons",
    "teamId": "team-falcons",
    "designation": "Senior Operations Executive",
    "status": "active",
    "avatarTone": "teal",
    "managerId": "emp-r14",
    "teamLeadId": "emp-r14",
    "permissions": [
      "dashboard.read",
      "leave.self.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  },
  {
    "id": "user-emp-r29",
    "employeeId": "ETS21178",
    "name": "Diya Verma",
    "displayName": "Diya Verma",
    "email": "diyaverma@edufyitech.in",
    "role": "employee",
    "department": "Technology",
    "team": "TUK",
    "teamId": "team-tuk",
    "designation": "Frontend Software Engineer",
    "status": "active",
    "avatarTone": "blue",
    "managerId": "emp-tl-bharani",
    "teamLeadId": "emp-tl-bharani",
    "permissions": [
      "dashboard.read",
      "leave.self.read",
      "attendance.read",
      "payroll.self.read",
      "tasks.read",
      "training.read",
      "documents.read",
      "helpdesk.read"
    ]
  }
]

const INITIAL_EMPLOYEES = [
  {
    "id": "emp-3",
    "_id": "emp-3",
    "employeeId": "EDU-ADM-001",
    "name": "Admin",
    "displayName": "Admin",
    "email": "admin@edufyi.local",
    "phone": "+91 98765 00000",
    "department": "Executive Leadership",
    "designation": "System Administrator",
    "role": "admin",
    "status": "active",
    "joiningDate": "2023-01-01",
    "salary": 0,
    "managerId": null,
    "managerName": "Board of Directors",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "",
      "accountNumber": "",
      "routingNumber": "",
      "panTaxId": ""
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-director",
    "_id": "emp-director",
    "employeeId": "EDU-DIR-001",
    "name": "Jagadish Babu",
    "displayName": "Jagadish Babu (Managing Director)",
    "email": "jagadishbabu@edufyitech.in",
    "phone": "+91 98765 00001",
    "department": "Executive Leadership",
    "designation": "Managing Director",
    "role": "director",
    "status": "active",
    "joiningDate": "2023-01-15",
    "salary": 4500000,
    "managerId": null,
    "managerName": "Board of Directors",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049280001",
      "ifscCode": "HDFC0001234",
      "panTaxId": "DIR-0001-D"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-4",
    "_id": "emp-4",
    "employeeId": "EDU-HR-001",
    "name": "HR",
    "displayName": "HR (People Operations)",
    "email": "hr@edufyi.local",
    "phone": "+91 98765 00002",
    "department": "Human Resources",
    "designation": "HR Operations",
    "role": "hr",
    "status": "active",
    "joiningDate": "2023-02-01",
    "salary": 1500000,
    "managerId": "emp-director",
    "managerName": "Jagadish Babu (Managing Director)",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "ICICI Bank",
      "accountNumber": "5010049280002",
      "ifscCode": "ICIC0000492",
      "panTaxId": "HR-0001-H"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-mgr-ravi",
    "_id": "emp-mgr-ravi",
    "employeeId": "EDU-MGR-003",
    "name": "Ravi",
    "displayName": "Ravi (Revenue Growth Manager)",
    "email": "ravi@edufyitech.in",
    "phone": "+91 98765 11001",
    "department": "Revenue Growth",
    "designation": "Revenue Growth Manager",
    "role": "manager",
    "status": "active",
    "joiningDate": "2023-03-01",
    "salary": 2800000,
    "managerId": "emp-director",
    "managerName": "Jagadish Babu (Managing Director)",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049281001",
      "ifscCode": "HDFC0001234",
      "panTaxId": "RAV-1001-R"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r6",
    "_id": "emp-r6",
    "employeeId": "ETS21169",
    "name": "Basir Bashir",
    "displayName": "Basir (Vertical Head)",
    "email": "basirbashir@edufyitech.in",
    "phone": "+91 98765 11002",
    "department": "Operations",
    "designation": "Vertical Head",
    "role": "manager",
    "status": "active",
    "joiningDate": "2023-03-15",
    "salary": 2600000,
    "managerId": "emp-director",
    "managerName": "Jagadish Babu (Managing Director)",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "ICICI Bank",
      "accountNumber": "5010049281002",
      "ifscCode": "ICIC0000492",
      "panTaxId": "BAS-1002-B"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r2",
    "_id": "emp-r2",
    "employeeId": "ETS21168",
    "name": "Venkatesh (Venky)",
    "displayName": "Venky (Senior Manager)",
    "email": "venkatesh@edufyitech.in",
    "phone": "+91 98765 11003",
    "department": "Technology",
    "designation": "Senior Manager",
    "role": "manager",
    "status": "active",
    "joiningDate": "2023-03-20",
    "salary": 2900000,
    "managerId": "emp-director",
    "managerName": "Jagadish Babu (Managing Director)",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "State Bank of India",
      "accountNumber": "5010049281003",
      "ifscCode": "SBIN0000182",
      "panTaxId": "VNK-1003-V"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r4",
    "_id": "emp-r4",
    "employeeId": "ETS21188",
    "name": "Rohan",
    "displayName": "Rohan (Team Leader - Alpha)",
    "email": "rohan@edufyitech.in",
    "phone": "+91 98765 21001",
    "department": "Revenue Growth",
    "team": "Alpha",
    "teamId": "team-alpha",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-01",
    "salary": 2100000,
    "managerId": "emp-mgr-ravi",
    "managerName": "Ravi",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049282001",
      "ifscCode": "HDFC0001234",
      "panTaxId": "ROH-2001-R"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r5",
    "_id": "emp-r5",
    "employeeId": "ETS21189",
    "name": "Anjali Annie",
    "displayName": "Anjali (Team Leader - 3 Bops)",
    "email": "anjali@edufyitech.in",
    "phone": "+91 98765 21002",
    "department": "Revenue Growth",
    "team": "3 Bops",
    "teamId": "team-3bops",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-05",
    "salary": 2050000,
    "managerId": "emp-mgr-ravi",
    "managerName": "Ravi",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "Axis Bank",
      "accountNumber": "5010049282002",
      "ifscCode": "UTIB0000045",
      "panTaxId": "ANJ-2002-A"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r21",
    "_id": "emp-r21",
    "employeeId": "ETS21190",
    "name": "Bhoopathi Raja S",
    "displayName": "Bhoopathi (Team Leader - Marketing)",
    "email": "bhoopathi@edufyitech.in",
    "phone": "+91 98765 21003",
    "department": "Revenue Growth",
    "team": "Marketing",
    "teamId": "team-marketing",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-10",
    "salary": 2000000,
    "managerId": "emp-mgr-ravi",
    "managerName": "Ravi",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "Kotak Bank",
      "accountNumber": "5010049282003",
      "ifscCode": "KKBK0000123",
      "panTaxId": "BHO-2003-B"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r3",
    "_id": "emp-r3",
    "employeeId": "ETS21191",
    "name": "Yashraj Misal (Yash)",
    "displayName": "Yash (Team Leader - Hustlers)",
    "email": "yash@edufyitech.in",
    "phone": "+91 98765 21004",
    "department": "Revenue Growth",
    "team": "Hustlers",
    "teamId": "team-hustlers",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-15",
    "salary": 2150000,
    "managerId": "emp-mgr-ravi",
    "managerName": "Ravi",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "ICICI Bank",
      "accountNumber": "5010049282004",
      "ifscCode": "ICIC0000492",
      "panTaxId": "YAS-2004-Y"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-tl-bharani",
    "_id": "emp-tl-bharani",
    "employeeId": "ETS21175",
    "name": "Bharani",
    "displayName": "Bharani (Team Leader - TUK)",
    "email": "bharani@edufyitech.in",
    "phone": "+91 98765 41001",
    "department": "Technology",
    "team": "TUK",
    "teamId": "team-tuk",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-20",
    "salary": 2200000,
    "managerId": "emp-r2",
    "managerName": "Venky",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049284001",
      "ifscCode": "HDFC0001234",
      "panTaxId": "BHA-4001-B"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r8",
    "_id": "emp-r8",
    "employeeId": "ETS21176",
    "name": "Nandish K (Vadish)",
    "displayName": "Nandish (Team Leader - Thanos)",
    "email": "nandish@edufyitech.in",
    "phone": "+91 98765 41002",
    "department": "Technology",
    "team": "Thanos",
    "teamId": "team-thanos",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-25",
    "salary": 2250000,
    "managerId": "emp-r2",
    "managerName": "Venky",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "State Bank of India",
      "accountNumber": "5010049284002",
      "ifscCode": "SBIN0000182",
      "panTaxId": "NAN-4002-N"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r51",
    "_id": "emp-r51",
    "employeeId": "ETS21177",
    "name": "Nathyya S",
    "displayName": "Nathyya (Team Leader - Elites)",
    "email": "nathyya@edufyitech.in",
    "phone": "+91 98765 41003",
    "department": "Technology",
    "team": "Elites",
    "teamId": "team-elites",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-05-01",
    "salary": 2100000,
    "managerId": "emp-r2",
    "managerName": "Venky",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049284003",
      "ifscCode": "HDFC0001234",
      "panTaxId": "NAT-4003-N"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r14",
    "_id": "emp-r14",
    "employeeId": "ETS112315",
    "name": "Mayank Aryan",
    "displayName": "Mayank (Team Leader - Falcons)",
    "email": "mayankaryan@edufyitech.in",
    "phone": "+91 98765 31001",
    "department": "Operations",
    "team": "Falcons",
    "teamId": "team-falcons",
    "designation": "Team Leader",
    "role": "team_lead",
    "status": "active",
    "joiningDate": "2023-04-12",
    "salary": 2100000,
    "managerId": "emp-r6",
    "managerName": "Basir",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049283001",
      "ifscCode": "HDFC0001234",
      "panTaxId": "MAY-3001-M"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r1",
    "_id": "emp-r1",
    "employeeId": "ETS21206",
    "name": "Chandana Somaih",
    "displayName": "Chandana Somaih",
    "email": "chandanasomaih@edufyitech.in",
    "phone": "+91 98765 31002",
    "department": "Operations",
    "team": "Falcons",
    "teamId": "team-falcons",
    "designation": "Senior Operations Executive",
    "role": "employee",
    "status": "active",
    "joiningDate": "2023-06-01",
    "salary": 950000,
    "teamLeadId": "emp-r14",
    "teamLeadName": "Mayank",
    "managerId": "emp-r14",
    "managerName": "Mayank",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "HDFC Bank",
      "accountNumber": "5010049283002",
      "ifscCode": "HDFC0001234",
      "panTaxId": "CHA-3002-C"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  },
  {
    "id": "emp-r29",
    "_id": "emp-r29",
    "employeeId": "ETS21178",
    "name": "Diya Verma",
    "displayName": "Diya Verma",
    "email": "diyaverma@edufyitech.in",
    "phone": "+91 98765 41004",
    "department": "Technology",
    "team": "TUK",
    "teamId": "team-tuk",
    "designation": "Frontend Software Engineer",
    "role": "employee",
    "status": "active",
    "joiningDate": "2023-06-15",
    "salary": 1100000,
    "teamLeadId": "emp-tl-bharani",
    "teamLeadName": "Bharani",
    "managerId": "emp-tl-bharani",
    "managerName": "Bharani",
    "location": "Bengaluru",
    "employmentType": "Full-time",
    "bankDetails": {
      "bankName": "ICICI Bank",
      "accountNumber": "5010049284004",
      "ifscCode": "ICIC0000492",
      "panTaxId": "DIY-4004-D"
    },
    "emergencyContact": {
      "name": "",
      "relationship": "",
      "phone": ""
    },
    "documents": [],
    "onboardingChecklist": [],
    "exitDetails": null
  }
]

export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined || lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
    return null
  }
  const nLat1 = Number(lat1)
  const nLon1 = Number(lon1)
  const nLat2 = Number(lat2)
  const nLon2 = Number(lon2)
  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null

  const R = 6371e3 // Earth's radius in metres
  const phi1 = (nLat1 * Math.PI) / 180
  const phi2 = (nLat2 * Math.PI) / 180
  const deltaPhi = ((nLat2 - nLat1) * Math.PI) / 180
  const deltaLambda = ((nLon2 - nLon1) * Math.PI) / 180

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const INITIAL_COMPANY_SETTINGS = {
  companyName: 'Edufyi Inc.',
  hqAddress: '100 Technology Plaza, Suite 400, San Francisco, CA 94105',
  locations: [
    { id: 'loc-1', name: 'HQ - San Francisco', city: 'San Francisco', lat: 37.789172, lng: -122.401449, radiusMeters: 200, isDefault: true },
    { id: 'loc-2', name: 'Tech Hub - Austin', city: 'Austin', lat: 30.267153, lng: -97.743061, radiusMeters: 200, isDefault: false },
    { id: 'loc-3', name: 'Global Center - London', city: 'London', lat: 51.507351, lng: -0.127758, radiusMeters: 200, isDefault: false },
  ],
  allowedWifiSSIDs: ['Edufyi-Office-5G', 'Edufyi-Corp-Secure', 'Edufyi-Guest-HighSpeed'],
  // Office networks are verified in-browser by PUBLIC IP (every device on the same
  // Wi-Fi shares one public/egress IP). Admin registers the office's public IP while
  // physically on the office Wi-Fi; employees are "on the office network" when their
  // detected public IP matches one of these. (Browsers cannot read Wi-Fi SSID/BSSID.)
  officeNetworkIPs: [],
  // Each network is identified by its SSID *and* its BSSID (the access-point hardware MAC).
  // A spoofed hotspot reusing the same SSID name will have a different BSSID and will NOT verify.
  // allowedIPs are the office public IP / gateway subnets the backend independently checks.
  wifiNetworks: [
    { id: 'wn-1', ssid: 'Edufyi-Office-5G', bssid: '9C:3D:CF:11:A2:01', securityType: 'WPA2-Enterprise', branchName: 'HQ - San Francisco', allowedIPs: ['127.0.0.1', '::1', '10.0.0.0/8', '192.168.1.0/24'], status: 'active', addedAt: '2026-09-30', addedBy: 'Admin' },
    { id: 'wn-2', ssid: 'Edufyi-Corp-Secure', bssid: '9C:3D:CF:22:B4:02', securityType: 'WPA3-Enterprise', branchName: 'Tech Hub - Austin', allowedIPs: ['127.0.0.1', '::1', '172.16.0.0/16'], status: 'active', addedAt: '2026-09-30', addedBy: 'Admin' },
    { id: 'wn-3', ssid: 'Edufyi-Guest-HighSpeed', bssid: '9C:3D:CF:33:C6:03', securityType: 'WPA2-Personal', branchName: 'Global Center - London', allowedIPs: ['127.0.0.1', '::1', '192.168.10.0/24'], status: 'active', addedAt: '2026-09-30', addedBy: 'Admin' },
  ],
  attendanceRules: {
    workStartTime: '09:30',
    workEndTime: '18:30',
    gracePeriodMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.0,
    geofenceStrict: false,
    maxGeofenceRadiusMeters: 200,
    gpsVerificationRequired: true,
    wifiVerificationRequired: true,
    requireOfficeNetworkAndGps: false,
  },
  leavePolicies: {
    casualQuota: 12,
    sickQuota: 10,
    earnedQuota: 15,
    compOffQuota: 2,
    maxCarryForwardDays: 8,
    requireManagerApproval: true,
    requireHrApproval: true,
  },
  systemConfig: {
    emailNotificationsEnabled: true,
    smsGatewayStatus: 'Connected (Twilio)',
    pfPortalLink: 'https://unifiedportal-mem.epfindia.gov.in',
    esiPortalLink: 'https://www.esic.in',
    aiAssistantModel: 'Gemini 1.5 Flash High',
    aiPolicyGrounding: true,
    lastBackupDate: '2026-09-29 23:45 UTC',
  },
}

const INITIAL_ATTENDANCE = [
  { id: 'att-1', employeeId: 'ETS21206', employeeName: 'Chandana Somaih', date: '2026-09-30', checkIn: '09:22 AM', checkOut: null, status: 'present', wifiSSID: 'Edufyi-Office-5G', wifiVerified: true, latitude: 12.9716, longitude: 77.5946, distanceMeters: 24, gpsVerified: true, locationName: 'Bengaluru - Main Campus', totalHours: 'Active (Live)' },
  { id: 'att-2', employeeId: 'EDU-MGR-002', employeeName: 'Sarah Chen', date: '2026-09-30', checkIn: '09:14 AM', checkOut: null, status: 'present', wifiSSID: 'Edufyi-Office-5G', wifiVerified: true, latitude: 37.7891, longitude: -122.4014, distanceMeters: 14, gpsVerified: true, locationName: 'HQ - San Francisco', totalHours: 'Active (Live)' },
  { id: 'att-3', employeeId: 'EDU-HR-001', employeeName: 'HR', date: '2026-09-30', checkIn: '09:05 AM', checkOut: null, status: 'present', wifiSSID: 'Edufyi-Office-5G', wifiVerified: true, latitude: 37.7893, longitude: -122.4016, distanceMeters: 35, gpsVerified: true, locationName: 'HQ - San Francisco', totalHours: 'Active (Live)' },
  { id: 'att-4', employeeId: 'EDU-EMP-205', employeeName: 'Marcus Vance', date: '2026-09-30', checkIn: '09:52 AM', checkOut: null, status: 'late', wifiSSID: 'Edufyi-Corp-Secure', wifiVerified: true, latitude: 37.7889, longitude: -122.4012, distanceMeters: 52, gpsVerified: true, locationName: 'HQ - San Francisco', totalHours: 'Active (Late)' },
  { id: 'att-5', employeeId: 'EDU-EMP-309', employeeName: 'Priya Sharma', date: '2026-09-30', checkIn: '09:10 AM', checkOut: null, status: 'present', wifiSSID: 'Home-Fiber-WiFi', wifiVerified: false, latitude: 37.7649, longitude: -122.4662, distanceMeters: 6200, gpsVerified: false, locationName: 'Remote (Outside Geofence)', totalHours: 'Active (Remote)' },
  { id: 'att-6', employeeId: 'EDU-EMP-410', employeeName: 'David Kim', date: '2026-09-30', checkIn: null, checkOut: null, status: 'on-leave', wifiSSID: null, wifiVerified: false, distanceMeters: null, gpsVerified: false, locationName: null, totalHours: '0.0 hrs' },
  { id: 'att-7', employeeId: 'EDU-EMP-512', employeeName: 'Elena Rostova', date: '2026-09-30', checkIn: '09:30 AM', checkOut: null, status: 'present', wifiSSID: 'Edufyi-Office-5G', wifiVerified: true, latitude: 37.7891, longitude: -122.4015, distanceMeters: 22, gpsVerified: true, locationName: 'HQ - San Francisco', totalHours: 'Active (Live)' },
]

const INITIAL_LEAVES = [
  {
    id: 'leave-101',
    employeeId: 'ETS21206',
    employeeName: 'Chandana Somaih',
    department: 'Operations',
    leaveType: 'casual',
    startDate: '2026-10-08',
    endDate: '2026-10-09',
    days: 2,
    reason: 'Attending family wedding ceremony out of town.',
    status: 'approved',
    managerId: 'emp-r6',
    managerName: 'Basir Bashir',
    managerComment: 'Approved. Enjoy the celebration!',
    hrComment: 'Approved in line with leave policy.',
    createdAt: '2026-09-26',
  },
  {
    id: 'leave-102',
    employeeId: 'EDU-EMP-410',
    employeeName: 'David Kim',
    department: 'Engineering',
    leaveType: 'sick',
    startDate: '2026-09-30',
    endDate: '2026-09-30',
    days: 1,
    reason: 'Severe migraine; resting as advised by clinic.',
    status: 'approved',
    managerId: 'EDU-MGR-002',
    managerComment: 'Get well soon David.',
    hrComment: 'Logged as sick leave.',
    createdAt: '2026-09-30',
  },
  {
    id: 'leave-103',
    employeeId: 'EDU-EMP-205',
    employeeName: 'Marcus Vance',
    department: 'Design',
    leaveType: 'earned',
    startDate: '2026-10-18',
    endDate: '2026-10-22',
    days: 5,
    reason: 'Annual vacation with family to national parks.',
    status: 'pending_manager',
    managerId: 'EDU-MGR-002',
    managerComment: null,
    hrComment: null,
    createdAt: '2026-09-28',
  },
  {
    id: 'leave-104',
    employeeId: 'EDU-EMP-309',
    employeeName: 'Priya Sharma',
    department: 'Product',
    leaveType: 'casual',
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    days: 2,
    reason: 'Relocating to new apartment in city center.',
    status: 'pending_hr',
    managerId: 'EDU-MGR-002',
    managerComment: 'Approved from product team perspective.',
    hrComment: null,
    createdAt: '2026-09-27',
  },
]

const INITIAL_TASKS = [
  { id: 'task-1', title: 'Prepare Q3 operations delivery performance report', assigneeId: 'ETS21206', assigneeName: 'Chandana Somaih', priority: 'High', status: 'in_progress', dueDate: '2026-10-02', category: 'Operations' },
  { id: 'task-2', title: 'Review and sign revised NDA document', assigneeId: 'ETS21206', assigneeName: 'Chandana Somaih', priority: 'Medium', status: 'todo', dueDate: '2026-10-05', category: 'Compliance' },
  { id: 'task-3', title: 'Complete annual Cybersecurity awareness module', assigneeId: 'ETS21206', assigneeName: 'Chandana Somaih', priority: 'High', status: 'in_progress', dueDate: '2026-10-04', category: 'Training' },
  { id: 'task-4', title: 'Finalize September payroll disbursement schedule', assigneeId: 'EDU-HR-001', assigneeName: 'HR', priority: 'Urgent', status: 'in_progress', dueDate: '2026-09-30', category: 'Payroll' },
  { id: 'task-5', title: 'Schedule technical round for Senior Fullstack candidate', assigneeId: 'EDU-HR-001', assigneeName: 'HR', priority: 'High', status: 'todo', dueDate: '2026-10-01', category: 'Recruitment' },
  { id: 'task-6', title: 'Update Company Wi-Fi SSID geofence policies', assigneeId: 'EDU-ADM-001', assigneeName: 'Admin', priority: 'Medium', status: 'completed', dueDate: '2026-09-29', category: 'Infrastructure' },
]

const INITIAL_COURSES = [
  {
    id: 'course-1',
    title: 'Workplace Security & Data Privacy 2026',
    category: 'Compliance',
    duration: '45 mins',
    progress: 75,
    completed: false,
    quizScore: null,
    modules: ['Password hygiene & 2FA', 'Phishing detection', 'Handling customer PII'],
    certificateUrl: null,
  },
  {
    id: 'course-2',
    title: 'Effective Leadership & Managerial Communication',
    category: 'Leadership',
    duration: '2.5 hrs',
    progress: 100,
    completed: true,
    quizScore: '95%',
    modules: ['Active listening', 'Delivering constructive feedback', 'Conflict resolution'],
    certificateUrl: 'CERT-EDU-2026-9812',
  },
  {
    id: 'course-3',
    title: 'Workplace Ethics & Safety Guidelines',
    category: 'Mandatory HR',
    duration: '30 mins',
    progress: 100,
    completed: true,
    quizScore: '100%',
    modules: ['Professional conduct', 'Safety protocols', 'Safe workspace culture'],
    certificateUrl: 'CERT-EDU-2026-4401',
  },
  {
    id: 'course-4',
    title: 'Modern React 19 & High-Performance UI Architecture',
    category: 'Engineering',
    duration: '3.0 hrs',
    progress: 40,
    completed: false,
    quizScore: null,
    modules: ['React Server Components', 'Optimistic UI patterns', 'Accessibility (a11y)'],
    certificateUrl: null,
  },
]

const INITIAL_TICKETS = [
  {
    id: 'TICK-1049',
    employeeId: 'ETS21206',
    employeeName: 'Chandana Somaih',
    subject: 'Request for secondary 4K monitor authorization',
    category: 'IT Support',
    priority: 'Medium',
    status: 'in_progress',
    createdAt: '2026-09-29',
    assignedTo: 'IT Hardware Team',
    responses: [
      { sender: 'Chandana Somaih', text: 'Submitted request with manager approval for dual-monitor workflow.', time: '2026-09-29 11:20' },
      { sender: 'IT Team', text: 'Hardware inventory checked. Model Dell UltraSharp 27" approved for dispatch.', time: '2026-09-29 15:40' },
    ],
  },
  {
    id: 'TICK-1050',
    employeeId: 'EDU-EMP-205',
    employeeName: 'Marcus Vance',
    subject: 'PF passbook contribution discrepancy query',
    category: 'Payroll',
    priority: 'High',
    status: 'open',
    createdAt: '2026-09-30',
    assignedTo: 'HR Payroll Desk',
    responses: [
      { sender: 'Marcus Vance', text: 'August PF contribution is not yet showing in the EPFO portal. Please check UAN linkage.', time: '2026-09-30 08:30' },
    ],
  },
  {
    id: 'TICK-1045',
    employeeId: 'ETS21206',
    employeeName: 'Chandana Somaih',
    subject: 'Health insurance e-card download issue',
    category: 'HR Query',
    priority: 'Low',
    status: 'resolved',
    createdAt: '2026-09-20',
    assignedTo: 'HR Operations',
    responses: [
      { sender: 'Chandana Somaih', text: 'Unable to download policy e-card from insurance portal.', time: '2026-09-20 10:00' },
      { sender: 'HR', text: 'Attached policy document directly and resent portal reset link.', time: '2026-09-20 14:15' },
    ],
  },
]

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Edufyi Annual Hackathon 2026 Announced!',
    category: 'Event',
    priority: 'High',
    targetAudience: 'All Employees',
    content: 'Get ready for 48 hours of innovation, AI building, and collaboration on October 24-25. Exciting prizes and mentorship opportunities for all participating teams!',
    date: '2026-09-28',
    author: 'Admin (System)',
    likes: 38,
    pinned: true,
  },
  {
    id: 'ann-2',
    title: 'Updated Hybrid Work & Attendance Wi-Fi Policy',
    category: 'Policy',
    priority: 'Normal',
    targetAudience: 'All Employees',
    content: 'Starting October 1st, seamless check-in is enabled across all offices via Wi-Fi SSID auto-verification (Edufyi-Office-5G). Remote employees can continue using the verified remote check-in feature.',
    date: '2026-09-25',
    author: 'HR (People Ops)',
    likes: 24,
    pinned: false,
  },
  {
    id: 'ann-3',
    title: 'Upcoming National Holiday: Gandhi Jayanti (Oct 2)',
    category: 'Holiday',
    priority: 'Normal',
    targetAudience: 'All Employees',
    content: 'Please note that Edufyi offices will remain closed on Friday, October 2nd, 2026. Have a restful long weekend with your loved ones!',
    date: '2026-09-27',
    author: 'People Operations',
    likes: 42,
    pinned: false,
  },
]

const INITIAL_HOLIDAYS = [
  { id: 'hol-1', date: '2026-10-02', name: 'Gandhi Jayanti', title: 'Gandhi Jayanti', type: 'National Holiday', day: 'Friday' },
  { id: 'hol-2', date: '2026-10-20', name: 'Dussehra / Vijaya Dashami', title: 'Dussehra / Vijaya Dashami', type: 'Festival Holiday', day: 'Tuesday' },
  { id: 'hol-3', date: '2026-11-08', name: 'Diwali (Festival of Lights)', title: 'Diwali (Festival of Lights)', type: 'Festival Holiday', day: 'Sunday' },
  { id: 'hol-4', date: '2026-11-09', name: 'Diwali Balipratipada', title: 'Diwali Balipratipada', type: 'Company Holiday', day: 'Monday' },
  { id: 'hol-5', date: '2026-12-25', name: 'Christmas Day', title: 'Christmas Day', type: 'Gazetted Holiday', day: 'Friday' },
  { id: 'hol-6', date: '2027-01-01', name: 'New Year Day 2027', title: 'New Year Day 2027', type: 'Optional Holiday', day: 'Friday' },
]

const INITIAL_DOCUMENTS = [
  { id: 'cdoc-1', title: 'Edufyi Employee Handbook 2026', category: 'HR Policy', type: 'PDF', size: '2.8 MB', updated: '2026-08-15', downloads: 142 },
  { id: 'cdoc-2', title: 'Code of Business Conduct & Ethics', category: 'Compliance', type: 'PDF', size: '1.4 MB', updated: '2026-07-10', downloads: 98 },
  { id: 'cdoc-3', title: 'Medical & Group Health Insurance Scheme', category: 'Benefits', type: 'PDF', size: '3.1 MB', updated: '2026-09-01', downloads: 184 },
  { id: 'cdoc-4', title: 'Remote Work & Equipment Guidelines', category: 'Operations', type: 'PDF', size: '920 KB', updated: '2026-08-20', downloads: 112 },
  { id: 'cdoc-5', title: 'Leave & Absence Management Policy', category: 'HR Policy', type: 'PDF', size: '1.1 MB', updated: '2026-06-30', downloads: 156 },
]

const INITIAL_REQUISITIONS = [
  { id: 'req-1', title: 'Senior Fullstack Engineer (React/Node)', department: 'Engineering', location: 'San Francisco (Hybrid)', openings: 2, applicants: 28, stage: 'Interview', status: 'Active' },
  { id: 'req-2', title: 'HR Business Partner (Talent & Growth)', department: 'Human Resources', location: 'Austin (Hybrid)', openings: 1, applicants: 14, stage: 'Screening', status: 'Active' },
  { id: 'req-3', title: 'Product Marketing Manager', department: 'Marketing', location: 'Remote (US)', openings: 1, applicants: 32, stage: 'Offer', status: 'Active' },
  { id: 'req-4', title: 'Security & DevOps Lead', department: 'Engineering', location: 'San Francisco', openings: 1, applicants: 19, stage: 'Technical Review', status: 'Active' },
]

const INITIAL_DAILY_REPORTS = [
  {
    id: 'dwr-1',
    employeeId: 'ETS21206',
    employeeName: 'Chandana Somaih',
    date: '2026-09-29',
    hoursLogged: 8.5,
    tasksSummary: 'Refactored employee leave approval flow, integrated real-time state persistence, and added UI tests.',
    challenges: 'Ensuring seamless offline fallback when MongoDB connection is not supplied.',
    tomorrowPlan: 'Build comprehensive attendance Wi-Fi verification and payslip PDF generation.',
    submittedAt: '2026-09-29 18:25',
  },
]

const INITIAL_EXPENSES = [
  { id: 'exp-1', employeeId: 'ETS21206', employeeName: 'Chandana Somaih', category: 'Travel', amount: 145.50, merchant: 'Bengaluru Cab & Airport Transit', date: '2026-09-22', status: 'reimbursed', comments: 'Travel to client site review' },
  { id: 'exp-2', employeeId: 'ETS21206', employeeName: 'Chandana Somaih', category: 'Software Tool', amount: 48.00, merchant: 'Workflow Automation Subscription', date: '2026-09-25', status: 'approved', comments: 'Monthly workflow license' },
  { id: 'exp-3', employeeId: 'EDU-EMP-205', employeeName: 'Marcus Vance', category: 'Supplies', amount: 89.90, merchant: 'Ergonomic Desk Accessories', date: '2026-09-28', status: 'submitted', comments: 'Home office wellness stipend' },
]

const INITIAL_KUDOS = [
  { id: 'kud-1', from: 'Basir Bashir', to: 'Chandana Somaih', badge: 'Sprint Star', message: 'Outstanding work polishing the new operations workflows ahead of the release!', date: 'Yesterday' },
  { id: 'kud-2', from: 'HR', to: 'David Kim', badge: 'Fast Learner', message: 'Great onboarding momentum David! Welcome to Edufyi.', date: '2 days ago' },
  { id: 'kud-3', from: 'Chandana Somaih', to: 'Marcus Vance', badge: 'Creative Genius', message: 'The new operations system looks incredible!', date: '3 days ago' },
]

const INITIAL_NOTIFICATIONS = [
  { id: 'notif-1', title: 'Leave Approved', message: 'Your casual leave request for Oct 8-9 was approved by HR.', time: '10 mins ago', type: 'leave', read: false },
  { id: 'notif-2', title: 'September Salary Processed', message: 'Your September payslip is ready. Download it from My Salary.', time: '2 hours ago', type: 'salary', read: false },
  { id: 'notif-3', title: 'New Announcement', message: 'Admin posted: Edufyi Annual Hackathon 2026!', time: 'Yesterday', type: 'announcement', read: true },
  { id: 'notif-4', title: 'Upcoming Birthday', message: "It's Marcus Vance's birthday tomorrow! Send warm wishes.", time: '1 day ago', type: 'birthday', read: true },
]

const INITIAL_PAYROLL_RECORDS = [
  {
    id: 'pay-emp-r1-2026-10',
    employeeId: 'ETS21206',
    employeeRef: 'emp-r1',
    employeeName: 'Chandana Somaih',
    department: 'Operations',
    designation: 'Operations Specialist',
    month: 'October 2026',
    workingDays: 31,
    paidDays: 31,
    lopDays: 0,
    bankName: 'HDFC Bank',
    accountNumber: '50100488577650',
    ifscCode: 'HDFC0001234',
    panTaxId: 'BROPJ5764Q',
    uanNumber: '101595355837',
    earnings: {
      basic: 40000,
      hra: 20000,
      specialAllowance: 15000,
      conveyance: 3000,
      medicalAllowance: 2000,
      performanceBonus: 0,
      overtime: 0,
    },
    deductions: {
      pf: 4800,
      esi: 0,
      professionalTax: 200,
      tdsTax: 3500,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'Processed',
    paymentDate: '2026-10-31',
    notes: 'October payroll disbursement',
  },
  {
    id: 'pay-emp-r1-2026-09',
    employeeId: 'ETS21206',
    employeeRef: 'emp-r1',
    employeeName: 'Chandana Somaih',
    department: 'Operations',
    designation: 'Operations Specialist',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'HDFC Bank',
    accountNumber: '50100488577650',
    ifscCode: 'HDFC0001234',
    panTaxId: 'BROPJ5764Q',
    uanNumber: '101595355837',
    earnings: {
      basic: 40000,
      hra: 20000,
      specialAllowance: 15000,
      conveyance: 3000,
      medicalAllowance: 2000,
      performanceBonus: 0,
      overtime: 0,
    },
    deductions: {
      pf: 4800,
      esi: 0,
      professionalTax: 200,
      tdsTax: 3500,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'Processed',
    paymentDate: '2026-09-30',
    notes: 'September payroll disbursement',
  },

  {
    id: 'pay-emp-2-2026-09',
    employeeId: 'EDU-MGR-002',
    employeeName: 'Sarah Chen',
    department: 'Engineering',
    designation: 'Engineering Director',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'ICICI Bank',
    accountNumber: '5010049281290',
    ifscCode: 'ICIC0000492',
    panTaxId: 'SRH-4412-C',
    uanNumber: '100984120991',
    earnings: {
      basic: 75000,
      hra: 37500,
      specialAllowance: 24000,
      conveyance: 4000,
      medicalAllowance: 3000,
      performanceBonus: 4000,
      overtime: 0,
    },
    deductions: {
      pf: 9000,
      esi: 0,
      professionalTax: 200,
      tdsTax: 14500,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'Director grade compensation package',
  },
  {
    id: 'pay-emp-3-2026-09',
    employeeId: 'EDU-ADM-001',
    employeeName: 'Admin',
    department: 'Executive',
    designation: 'System Administrator',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'State Bank of India',
    accountNumber: '5010049287731',
    ifscCode: 'SBIN0000182',
    panTaxId: 'ELN-1109-V',
    uanNumber: '100984120101',
    earnings: {
      basic: 110000,
      hra: 55000,
      specialAllowance: 32000,
      conveyance: 5000,
      medicalAllowance: 4000,
      performanceBonus: 8000,
      overtime: 0,
    },
    deductions: {
      pf: 13200,
      esi: 0,
      professionalTax: 200,
      tdsTax: 26500,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'Executive leadership CTC disbursement',
  },
  {
    id: 'pay-emp-4-2026-09',
    employeeId: 'EDU-HR-001',
    employeeName: 'HR',
    department: 'Human Resources',
    designation: 'HR Operations',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'Axis Bank',
    accountNumber: '5010049284490',
    ifscCode: 'UTIB0000843',
    panTaxId: 'MYA-5591-L',
    uanNumber: '100984120442',
    earnings: {
      basic: 55000,
      hra: 27500,
      specialAllowance: 16000,
      conveyance: 3500,
      medicalAllowance: 2500,
      performanceBonus: 2000,
      overtime: 0,
    },
    deductions: {
      pf: 6600,
      esi: 0,
      professionalTax: 200,
      tdsTax: 7800,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'People Operations leadership compensation',
  },
  {
    id: 'pay-emp-5-2026-09',
    employeeId: 'EDU-EMP-205',
    employeeName: 'Marcus Vance',
    department: 'Design',
    designation: 'Principal Product Designer',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'Kotak Mahindra Bank',
    accountNumber: '5010049285521',
    ifscCode: 'KKBK0000219',
    panTaxId: 'MRC-8832-V',
    uanNumber: '100984120551',
    earnings: {
      basic: 50000,
      hra: 25000,
      specialAllowance: 14500,
      conveyance: 3000,
      medicalAllowance: 2500,
      performanceBonus: 1500,
      overtime: 0,
    },
    deductions: {
      pf: 6000,
      esi: 0,
      professionalTax: 200,
      tdsTax: 6100,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'Design team lead monthly salary',
  },
  {
    id: 'pay-emp-6-2026-09',
    employeeId: 'EDU-EMP-208',
    employeeName: 'Elena Rostova',
    department: 'Quality Assurance',
    designation: 'QA Lead',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'HDFC Bank',
    accountNumber: '5010049289081',
    ifscCode: 'HDFC0001234',
    panTaxId: 'ELN-7721-Q',
    uanNumber: '100984120612',
    earnings: {
      basic: 42000,
      hra: 21000,
      specialAllowance: 11000,
      conveyance: 3000,
      medicalAllowance: 2000,
      performanceBonus: 1000,
      overtime: 0,
    },
    deductions: {
      pf: 5040,
      esi: 0,
      professionalTax: 200,
      tdsTax: 3500,
      loanAdvance: 0,
      lossOfPay: 0,
      performanceDeduction: 2500,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'QA department disbursement',
  },
  {
    id: 'pay-emp-7-2026-09',
    employeeId: 'EDU-EMP-301',
    employeeName: 'Jordan Lee',
    department: 'DevOps & Infrastructure',
    designation: 'Staff Site Reliability Engineer',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'ICICI Bank',
    accountNumber: '5010049283341',
    ifscCode: 'ICIC0000492',
    panTaxId: 'JRD-9901-L',
    uanNumber: '100984120771',
    earnings: {
      basic: 48000,
      hra: 24000,
      specialAllowance: 14000,
      conveyance: 3000,
      medicalAllowance: 2500,
      performanceBonus: 1500,
      overtime: 0,
    },
    deductions: {
      pf: 5760,
      esi: 0,
      professionalTax: 200,
      tdsTax: 5500,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'SRE on-call compensation included',
  },
  {
    id: 'pay-emp-8-2026-09',
    employeeId: 'EDU-EMP-402',
    employeeName: 'David Kim',
    department: 'Product Growth',
    designation: 'Growth Product Specialist',
    month: 'September 2026',
    workingDays: 30,
    paidDays: 30,
    lopDays: 0,
    bankName: 'State Bank of India',
    accountNumber: '5010049286112',
    ifscCode: 'SBIN0000182',
    panTaxId: 'DVD-5521-K',
    uanNumber: '100984120883',
    earnings: {
      basic: 38000,
      hra: 19000,
      specialAllowance: 10000,
      conveyance: 2500,
      medicalAllowance: 2000,
      performanceBonus: 1000,
      overtime: 0,
    },
    deductions: {
      pf: 4560,
      esi: 0,
      professionalTax: 200,
      tdsTax: 2800,
      loanAdvance: 0,
      lossOfPay: 0,
      otherDeductions: 0,
    },
    status: 'processed',
    paymentDate: '2026-09-30',
    notes: 'Growth team disbursement',
  },
]

// Persistent Notifications retrieval and state sync
function getPersistedNotifications() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const isCleared = window.localStorage.getItem(STORAGE_CLEARED_NOTIFICATIONS_KEY) === 'true'
    const deletedRaw = window.localStorage.getItem(STORAGE_DELETED_NOTIFICATIONS_KEY)
    const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : [])

    if (isCleared) {
      return []
    }

    const raw = window.localStorage.getItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((n) => n && n.id && !deletedIds.has(n.id))
      }
    }
    // In browser runtime, never resurrect mock initial notifications; the server will provide real notifications
    return []
  } catch {
    return []
  }
}

// Load or initialize store
function loadStore() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Auto-unmask bank account numbers in saved payroll records
        if (Array.isArray(parsed.payroll)) {
          parsed.payroll = parsed.payroll.map((p) => {
            if (p.accountNumber && (p.accountNumber.includes('*') || p.accountNumber.includes('●'))) {
              const digits = (p.accountNumber.match(/\d+$/) || ['8492'])[0]
              return { ...p, accountNumber: '501004928' + digits.padStart(4, '0') }
            }
            return p
          })
        }
        // Auto-unmask bank accounts in employees roster
        if (Array.isArray(parsed.employees)) {
          parsed.employees = parsed.employees.map((e) => {
            if (e.bankDetails?.accountNumber && (e.bankDetails.accountNumber.includes('*') || e.bankDetails.accountNumber.includes('●'))) {
              const digits = (e.bankDetails.accountNumber.match(/\d+$/) || ['8492'])[0]
              return {
                ...e,
                bankDetails: {
                  ...e.bankDetails,
                  accountNumber: '501004928' + digits.padStart(4, '0'),
                },
              }
            }
            return e
          })
          // Purge any fake Alex Rivera data completely from existing stored sessions
          parsed.employees = (parsed.employees || []).filter((e) => e.employeeId !== 'EDU-EMP-104' && e.name !== 'Alex Rivera' && e.email !== 'alex.rivera@edufyi.local');
          parsed.users = (parsed.users || []).filter((u) => u.employeeId !== 'EDU-EMP-104' && u.name !== 'Alex Rivera' && u.email !== 'alex.rivera@edufyi.local');
          parsed.leaves = (parsed.leaves || []).filter((l) => l.employeeId !== 'EDU-EMP-104' && l.employeeName !== 'Alex Rivera');
          parsed.attendance = (parsed.attendance || []).filter((a) => a.employeeId !== 'EDU-EMP-104' && a.employeeName !== 'Alex Rivera');
          parsed.tasks = (parsed.tasks || []).filter((t) => t.assigneeId !== 'EDU-EMP-104' && t.assigneeName !== 'Alex Rivera');
          parsed.expenses = (parsed.expenses || []).filter((ex) => ex.employeeId !== 'EDU-EMP-104' && ex.employeeName !== 'Alex Rivera');
          parsed.helpDesk = (parsed.helpDesk || []).filter((h) => h.employeeName !== 'Alex Rivera');
          parsed.dailyReports = (parsed.dailyReports || []).filter((r) => r.employeeName !== 'Alex Rivera');
          parsed.payroll = (parsed.payroll || []).filter((p) => p.employeeId !== 'EDU-EMP-104' && p.employeeName !== 'Alex Rivera');
        }
        // Ensure default companySettings has maskBankAccount = false
        if (parsed.companySettings) {
          parsed.companySettings.maskBankAccount = false
        }
        if (!parsed.payroll || parsed.payroll.length === 0) {
          parsed.payroll = INITIAL_PAYROLL_RECORDS
        }
        if (!parsed.roles || parsed.roles.length === 0) {
          parsed.roles = INITIAL_ROLES
        }
        if (!parsed.customRolePermissions) {
          parsed.customRolePermissions = {}
        }
        // In browser connected mode, the backend database (MongoDB Atlas) is the single source of truth.
        // Never load or resurrect hardcoded mock employees, mock users, mock leaves or attendance from localStorage.
        parsed.employees = []
        parsed.users = []
        parsed.attendance = []
        parsed.leaves = []
        parsed.payroll = []
        parsed.leaveBalances = []
        parsed.dataReady = false
        parsed.dataError = ''
        parsed.dataErrors = {}

        // Teams initialization & synchronization
        if (!Array.isArray(parsed.teams) || parsed.teams.length === 0) {
          parsed.teams = [...INITIAL_TEAMS]
        } else {
          const existingTeamIds = new Set(parsed.teams.map((t) => t.id))
          for (const initTeam of INITIAL_TEAMS) {
            if (!existingTeamIds.has(initTeam.id)) {
              parsed.teams.push({ ...initTeam })
            }
          }
        }
        if (Array.isArray(parsed.departments) && parsed.departments.length > 0) {
          parsed.departments = parsed.departments.filter(Boolean)
        } else {
          parsed.departments = INITIAL_DEPARTMENTS.map((d) => ({ ...d }))
        }
        const savedNotifs = getPersistedNotifications()
        if (savedNotifs !== null) {
          parsed.notifications = savedNotifs
        } else if (!Array.isArray(parsed.notifications)) {
          parsed.notifications = []
        }
        return parsed
      }
    } catch (err) {
      console.warn('Could not read from localStorage, using initial seed data', err)
    }
  }

  const fallbackNotifs = getPersistedNotifications()

  // In browser, initialize clean zero-mock state so UI cleanly awaits MongoDB Atlas data without any glitch or flash
  if (typeof window !== 'undefined') {
    return {
      departments: INITIAL_DEPARTMENTS.map((d) => ({ ...d })),
      users: [],
      employees: [],
      teams: INITIAL_TEAMS,
      companySettings: INITIAL_COMPANY_SETTINGS,
      attendance: [],
      leaves: [],
      tasks: [],
      courses: INITIAL_COURSES,
      tickets: [],
      announcements: INITIAL_ANNOUNCEMENTS,
      holidays: INITIAL_HOLIDAYS,
      documents: INITIAL_DOCUMENTS,
      requisitions: [],
      dailyReports: [],
      expenses: [],
      kudos: [],
      notifications: fallbackNotifs !== null ? fallbackNotifs : [],
      payroll: [],
      roles: INITIAL_ROLES,
      customRolePermissions: {},
      auditLogs: [],
      dataReady: false,
      dataError: '',
      dataErrors: {},
    }
  }

  // In Node.js testing environment (typeof window === 'undefined'), provide fixtures for offline test suite
  return {
    departments: INITIAL_DEPARTMENTS.map((d) => ({ ...d })),
    users: INITIAL_USERS,
    employees: INITIAL_EMPLOYEES,
    teams: INITIAL_TEAMS,
    companySettings: INITIAL_COMPANY_SETTINGS,
    attendance: INITIAL_ATTENDANCE,
    leaves: INITIAL_LEAVES,
    tasks: INITIAL_TASKS,
    courses: INITIAL_COURSES,
    tickets: INITIAL_TICKETS,
    announcements: INITIAL_ANNOUNCEMENTS,
    holidays: INITIAL_HOLIDAYS,
    documents: INITIAL_DOCUMENTS,
    requisitions: INITIAL_REQUISITIONS,
    dailyReports: INITIAL_DAILY_REPORTS,
    expenses: INITIAL_EXPENSES,
    kudos: INITIAL_KUDOS,
    notifications: fallbackNotifs !== null ? fallbackNotifs : INITIAL_NOTIFICATIONS,
    payroll: INITIAL_PAYROLL_RECORDS,
    roles: INITIAL_ROLES,
    customRolePermissions: {},
    auditLogs: [
      { id: 'log-1', timestamp: '2026-09-30 08:00:12', actor: 'System', action: 'SYSTEM_BOOT', details: 'All services initialized with security headers and JWT verification.' },
      { id: 'log-2', timestamp: '2026-09-30 09:22:04', actor: 'Chandana Somaih', action: 'ATTENDANCE_CHECKIN', details: 'Checked in via verified office Wi-Fi: Edufyi-Office-5G' },
    ],
    dataReady: true,
    dataError: '',
    dataErrors: {},
  }
}

let storeState = loadStore()
const listeners = new Set()

function notifyListeners() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...storeState, employees: [], users: [], attendance: [], leaves: [], payroll: [], leaveBalances: [],
        ...Object.fromEntries(workspaceKeys.map((key) => [key, []])),
      }))
      if (Array.isArray(storeState.notifications)) {
        window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications))
      }
    } catch (err) {
      console.warn('Could not write to localStorage', err)
    }
  }
  // Emit a fresh top-level reference so React subscribers (Object.is comparison)
  // actually re-render. Without this, in-place mutations keep the same reference
  // and the UI only updates after a manual refresh.
  const snapshot = { ...storeState }
  listeners.forEach((callback) => callback(snapshot))
}

const localStore = {
  subscribe(callback) {
    listeners.add(callback)
    callback(storeState)
    return () => listeners.delete(callback)
  },

  getState() {
    return storeState
  },

  // Users & Role Management
  getUsers() {
    return storeState.users
  },
  replaceUsers(users) {
    storeState.users = users
    notifyListeners()
  },
  addUser(userData) {
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      employeeId: userData.employeeId || `EDU-${Math.floor(100 + Math.random() * 900)}`,
      name: userData.name || userData.displayName || 'User',
      displayName: userData.displayName || userData.name || 'User',
      email: userData.email.toLowerCase(),
      role: userData.role || 'employee',
      department: userData.department || 'General',
      designation: userData.designation || 'Specialist',
      status: 'active',
      avatarTone: 'blue',
      permissions: userData.role === 'admin' ? ['*'] : (userData.permissions || this.getRolePermissions(userData.role || 'employee') || ['dashboard.read']),
      password: userData.password || 'password123',
    }
    storeState.users = [newUser, ...storeState.users]

    // Fully link with Employee directory and payroll for all workforce roles
    const existingEmp = (storeState.employees || []).find(
      (e) => e.email?.toLowerCase() === newUser.email.toLowerCase() || e.employeeId === newUser.employeeId
    )
    if (!existingEmp) {
      const roleCfg = STANDARD_ROLE_CONFIG[newUser.role]
      this.addEmployee({
        name: newUser.name,
        email: newUser.email,
        employeeId: newUser.employeeId,
        department: newUser.department,
        designation: newUser.designation,
        role: newUser.role,
        managerId: roleCfg?.defaultManagerId ?? (newUser.role === 'employee' ? 'emp-tl-bharani' : 'emp-director'),
        managerName: roleCfg?.defaultManagerName ?? (newUser.role === 'employee' ? 'Bharani' : 'Managing Director'),
      })
    }

    this.addAuditLog(userData.actor || 'Admin', 'USER_CREATE', `Created user account for ${newUser.name} (${newUser.email}) with role ${newUser.role}`)
    notifyListeners()
    return newUser
  },
  toggleUserStatus(userId) {
    storeState.users = storeState.users.map((u) => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)
    notifyListeners()
    return this.getUsers().find((u) => u.id === userId)
  },

  // User Management
  updateUser(userId, updates) {
    const existing = storeState.users.find((u) => u.id === userId || u._id === userId)
    const oldEmpId = existing?.employeeId
    const newEmpId = updates.employeeId ? String(updates.employeeId).trim().toUpperCase() : oldEmpId

    storeState.users = storeState.users.map((u) => {
      if (u.id === userId || u._id === userId) {
        return { ...u, ...updates, ...(newEmpId ? { employeeId: newEmpId } : {}) }
      }
      return u
    })

    // Synchronize companion employee record completely (role, department, designation, name, employeeId, status)
    const targetEmail = existing?.email
    const empMatch = (storeState.employees || []).find((e) =>
      e.id === userId ||
      e._id === userId ||
      (oldEmpId && e.employeeId === oldEmpId) ||
      (newEmpId && e.employeeId === newEmpId) ||
      (targetEmail && e.email === targetEmail)
    )

    if (empMatch) {
      const roleCfg = updates.role ? STANDARD_ROLE_CONFIG[updates.role] : null
      storeState.employees = storeState.employees.map((e) => {
        if (e.id === empMatch.id) {
          return {
            ...e,
            ...(newEmpId ? { employeeId: newEmpId } : {}),
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.department ? { department: updates.department } : {}),
            ...(updates.designation ? { designation: updates.designation } : {}),
            ...(updates.role ? { role: updates.role } : {}),
            ...(updates.status ? { status: updates.status } : {}),
            ...(roleCfg?.defaultManagerId !== undefined ? { managerId: roleCfg.defaultManagerId, managerName: roleCfg.defaultManagerName } : {}),
          }
        }
        return e
      })
    } else if (updates.role || updates.department || updates.designation) {
      const roleCfg = STANDARD_ROLE_CONFIG[updates.role || 'employee']
      const newEmp = {
        id: `emp-${Date.now()}`,
        employeeId: newEmpId || `ETS${Math.floor(10000 + Math.random() * 90000)}`,
        name: updates.name || existing?.name || 'Employee',
        email: existing?.email || '',
        department: updates.department || existing?.department || 'General',
        designation: updates.designation || existing?.designation || 'Specialist',
        role: updates.role || existing?.role || 'employee',
        status: updates.status || existing?.status || 'active',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: updates.role === 'director' ? 4500000 : updates.role === 'manager' ? 2400000 : 1200000,
        managerId: roleCfg?.defaultManagerId ?? 'emp-director',
        managerName: roleCfg?.defaultManagerName ?? 'Managing Director',
        employmentType: 'Full-time',
        location: 'Bengaluru',
      }
      storeState.employees = [...storeState.employees, newEmp]
    }

    this.addAuditLog('Admin', 'USER_UPDATE', `Updated user details for ${updates.name || userId}`)
    notifyListeners()
    return storeState.users.find((u) => u.id === userId || u._id === userId)
  },
  resetUserPassword(userId, newPassword = 'Password@123') {
    storeState.users = (storeState.users || []).map((u) => {
      if (u.id === userId || u._id === userId || u.employeeId === userId || u.email === userId) {
        return { ...u, password: newPassword }
      }
      return u
    })
    this.addAuditLog('Admin', 'PASSWORD_RESET', `Reset password for user ${userId} to new credential`)
    this.addNotification({
      title: 'Security Notice: Password Reset',
      message: `Temporary credentials generated for account ${userId}.`,
      type: 'system',
    })
    notifyListeners()
    return true
  },

  // Role & Access Control (RBAC) Management
  getRoles() {
    const rawRoles = storeState.roles || []
    const rolesMap = new Map(INITIAL_ROLES.map((r) => [r.id, { ...r }]))
    for (const r of rawRoles) {
      const id = r.roleId || r.id || r._id
      if (id) {
        const existing = rolesMap.get(id)
        if (existing) {
          rolesMap.set(id, {
            ...existing,
            ...r,
            id,
            roleId: id,
            permissions: (r.permissions && r.permissions.length > 0) ? r.permissions : existing.permissions,
          })
        } else {
          rolesMap.set(id, {
            id,
            _id: r._id,
            roleId: id,
            name: r.name,
            description: r.description || 'Custom organizational access role',
            badge: r.badge || 'Custom Role',
            isSystem: false,
            permissions: r.permissions || ['dashboard.read'],
          })
        }
      }
    }
    if (storeState.customRolePermissions) {
      for (const [rid, perms] of Object.entries(storeState.customRolePermissions)) {
        if (rolesMap.has(rid) && Array.isArray(perms)) {
          rolesMap.get(rid).permissions = perms
        }
      }
    }
    return Array.from(rolesMap.values())
  },
  getRole(roleId) {
    if (roleId === 'hr') return this.getRoles().find((r) => r.id === 'hr_executive' || r.id === 'hr')
    if (roleId === 'director') return this.getRoles().find((r) => r.id === 'managing_director' || r.id === 'director')
    if (roleId === 'team_lead') return this.getRoles().find((r) => r.id === 'team_leader' || r.id === 'team_lead')
    return this.getRoles().find((r) => r.id === roleId || r.roleId === roleId || r._id === roleId)
  },
  getRolePermissions(roleId) {
    if (storeState.customRolePermissions && storeState.customRolePermissions[roleId]) {
      return storeState.customRolePermissions[roleId]
    }
    const r = this.getRole(roleId)
    return r?.permissions || []
  },
  updateRole(roleId, updates) {
    const id = roleId
    let found = false
    storeState.roles = (storeState.roles || []).map((r) => {
      if ((r.id || r.roleId || r._id) === id) {
        found = true
        return { ...r, ...updates }
      }
      return r
    })
    if (!found) {
      const base = INITIAL_ROLES.find((r) => r.id === id) || { id, roleId: id, name: id }
      storeState.roles = [...(storeState.roles || []), { ...base, id, roleId: id, ...updates }]
    }
    if (updates.permissions) {
      if (!storeState.customRolePermissions) storeState.customRolePermissions = {}
      storeState.customRolePermissions[id] = updates.permissions
    }
    this.addAuditLog('Admin', 'ROLE_UPDATE', `Modified role '${updates.name || id}' details (${id})`)
    notifyListeners()
    return true
  },
  updateRolePermissions(roleId, newPermissions) {
    const targetId = (roleId === 'hr' && !this.getRoles().some(r => r.id === 'hr')) ? 'hr_executive' : roleId
    if (!storeState.customRolePermissions) storeState.customRolePermissions = {}
    storeState.customRolePermissions[roleId] = newPermissions
    storeState.customRolePermissions[targetId] = newPermissions

    storeState.roles = this.getRoles().map((r) => {
      if (r.id === roleId || r.roleId === roleId || r.id === targetId || r.roleId === targetId) {
        return { ...r, permissions: newPermissions }
      }
      return r
    })

    // Also update all users with this role
    storeState.users = (storeState.users || []).map((u) => {
      if (u.role === roleId || u.role === targetId) {
        return { ...u, permissions: newPermissions }
      }
      return u
    })

    this.addAuditLog('Admin', 'ROLE_PERMISSIONS_UPDATE', `Updated permissions matrix for role '${roleId}' (${newPermissions.length} capabilities assigned)`)
    notifyListeners()
    return true
  },
  resetRolePermissions(roleId) {
    const targetId = roleId === 'hr' ? 'hr_executive' : (roleId === 'director' ? 'managing_director' : (roleId === 'team_lead' ? 'team_leader' : roleId))
    const defaultRole = INITIAL_ROLES.find((r) => r.id === targetId || r.id === roleId)
    const defaultPerms = defaultRole?.permissions || []

    if (storeState.customRolePermissions) {
      delete storeState.customRolePermissions[roleId]
      delete storeState.customRolePermissions[targetId]
    }

    storeState.roles = this.getRoles().map((r) => {
      if (r.id === roleId || r.roleId === roleId || r.id === targetId || r.roleId === targetId) {
        return { ...r, permissions: defaultPerms }
      }
      return r
    })

    this.addAuditLog('Admin', 'ROLE_RESET', `Reset role '${roleId}' permissions to factory system defaults`)
    notifyListeners()
    return true
  },
  addRole(roleData) {
    const id = roleData.id || roleData.roleId || roleData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const newRole = {
      id,
      roleId: id,
      name: roleData.name,
      description: roleData.description || 'Custom organization security role',
      badge: roleData.badge || 'Custom Role',
      isSystem: false,
      permissions: roleData.permissions || ['dashboard.read'],
    }
    if (!storeState.customRolePermissions) storeState.customRolePermissions = {}
    storeState.customRolePermissions[newRole.id] = newRole.permissions
    const currentCustom = storeState.roles || []
    storeState.roles = [...currentCustom.filter((r) => (r.id || r.roleId) !== id), newRole]
    this.addAuditLog('Admin', 'ROLE_CREATE', `Created custom role '${newRole.name}' with id '${newRole.id}'`)
    notifyListeners()
    return newRole
  },
  deleteRole(roleId) {
    const existing = this.getRoles().find((r) => r.id === roleId || r.roleId === roleId)
    if (existing?.isSystem) {
      throw new Error('System roles (admin, hr, manager, employee) cannot be deleted.')
    }
    storeState.roles = (storeState.roles || []).filter((r) => (r.id || r.roleId || r._id) !== roleId)
    if (storeState.customRolePermissions) {
      delete storeState.customRolePermissions[roleId]
    }
    this.addAuditLog('Admin', 'ROLE_DELETE', `Deleted custom role '${roleId}'`)
    notifyListeners()
    return true
  },

  // ---------------------------------------------------------
  // TEAM MANAGEMENT METHODS
  // ---------------------------------------------------------
  getTeams() {
    const rawTeams = storeState.teams || []
    const defaultMap = new Map(INITIAL_TEAMS.map((t) => [t.id, { ...t }]))
    for (const t of rawTeams) {
      if (t.id) {
        defaultMap.set(t.id, { ...(defaultMap.get(t.id) || {}), ...t })
      }
    }
    const teams = Array.from(defaultMap.values())
    const employees = storeState.employees || []
    return teams.map((team) => {
      const members = employees.filter(
        (e) =>
          (e.team && (e.team.toLowerCase() === team.name.toLowerCase() || e.team === team.id)) ||
          e.teamId === team.id
      )
      return {
        ...team,
        memberCount: members.length,
        members: members.map((m) => ({ id: m.id, name: m.name, role: m.role, designation: m.designation, employeeId: m.employeeId })),
      }
    })
  },
  getTeam(teamId) {
    if (!teamId) return null
    return this.getTeams().find((t) => t.id === teamId || t.name.toLowerCase() === String(teamId).toLowerCase()) || null
  },
  addTeam(data) {
    const name = (data.name || '').trim()
    if (!name) throw new Error('Team name is required.')
    const id = data.id || `team-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    const mgr = (storeState.employees || []).find((e) => e.id === data.managerId || e._id === data.managerId)
    const tl = (storeState.employees || []).find((e) => e.id === data.teamLeadId || e._id === data.teamLeadId)
    
    const newTeam = {
      id,
      name,
      department: data.department || mgr?.department || 'Revenue Growth',
      managerId: data.managerId || null,
      managerName: mgr?.name || data.managerName || '',
      teamLeadId: data.teamLeadId || null,
      teamLeadName: tl?.name || data.teamLeadName || '',
      description: data.description || `${name} delivery and execution team`,
      flaggedForVerification: false,
    }
    const current = storeState.teams || []
    storeState.teams = [...current.filter((t) => t.id !== id && t.name.toLowerCase() !== name.toLowerCase()), newTeam]
    this.addAuditLog('Admin', 'TEAM_CREATE', `Created team '${newTeam.name}' under '${newTeam.department}'`)
    notifyListeners()
    return newTeam
  },
  updateTeam(teamId, updates) {
    const prevTeam = this.getTeam(teamId)
    if (!prevTeam) throw new Error('Team not found.')
    const oldName = prevTeam.name

    let updatedTeam = null
    const mgr = updates.managerId ? (storeState.employees || []).find((e) => e.id === updates.managerId || e._id === updates.managerId) : null
    const tl = updates.teamLeadId ? (storeState.employees || []).find((e) => e.id === updates.teamLeadId || e._id === updates.teamLeadId) : null

    storeState.teams = (storeState.teams || INITIAL_TEAMS).map((t) => {
      if (t.id === teamId || t.name.toLowerCase() === prevTeam.name.toLowerCase()) {
        updatedTeam = {
          ...t,
          ...updates,
          managerName: mgr ? mgr.name : updates.managerName || t.managerName,
          teamLeadName: tl ? tl.name : updates.teamLeadName || t.teamLeadName,
        }
        return updatedTeam
      }
      return t
    })

    // If team name changed, update linked employees' team name attribute
    if (updates.name && updates.name !== oldName) {
      storeState.employees = (storeState.employees || []).map((e) => {
        if (e.team === oldName || e.teamId === teamId) {
          return { ...e, team: updates.name, teamId }
        }
        return e
      })
      storeState.users = (storeState.users || []).map((u) => {
        if (u.team === oldName || u.teamId === teamId) {
          return { ...u, team: updates.name, teamId }
        }
        return u
      })
    }

    this.addAuditLog('Admin', 'TEAM_UPDATE', `Updated details for team '${updates.name || prevTeam.name}'`)
    notifyListeners()
    return updatedTeam || prevTeam
  },
  deleteTeam(teamId) {
    const team = this.getTeam(teamId)
    if (!team) throw new Error('Team not found.')
    const isCore = INITIAL_TEAMS.some((t) => t.id === teamId)
    if (isCore) {
      throw new Error(`Standard company team '${team.name}' cannot be deleted. You can reassign its Team Leader, manager, or members.`)
    }
    storeState.teams = (storeState.teams || []).filter((t) => t.id !== teamId)
    this.addAuditLog('Admin', 'TEAM_DELETE', `Deleted team '${team.name}'`)
    notifyListeners()
    return true
  },
  verifyTeamAssignment(teamId) {
    storeState.teams = (storeState.teams || INITIAL_TEAMS).map((t) => {
      if (t.id === teamId || t.name.toLowerCase() === String(teamId).toLowerCase()) {
        return { ...t, flaggedForVerification: false, verificationNote: 'Verified and confirmed by administrator' }
      }
      return t
    })
    this.addAuditLog('Admin', 'TEAM_VERIFY', `Administrator verified and finalized Team Leader assignment for team '${teamId}'`)
    notifyListeners()
    return true
  },
  getTeamLeads() {
    return (storeState.employees || []).filter(
      (e) => e.status === 'active' && ['team_lead', 'manager', 'director'].includes(e.role)
    )
  },

  // Department Management
  getDepartments() {
    const rawDepts = storeState.departments
    if (Array.isArray(rawDepts) && rawDepts.length > 0) {
      return rawDepts
    }
    storeState.departments = INITIAL_DEPARTMENTS.map((d) => ({ ...d }))
    return storeState.departments
  },
  getDepartment(deptId) {
    if (!deptId) return null
    const list = this.getDepartments()
    return list.find((d) => d.id === deptId || d.deptId === deptId || d._id === deptId || d.name?.toLowerCase() === String(deptId).toLowerCase() || d.code?.toLowerCase() === String(deptId).toLowerCase())
  },
  addDepartment(data) {
    const name = (data.name || '').trim()
    if (!name) throw new Error('Department name is required.')
    const id = data.id || data.deptId || `dept-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    const newDept = {
      id,
      deptId: id,
      name,
      code: (data.code || name.slice(0, 4)).trim().toUpperCase(),
      description: data.description || '',
      head: data.head || 'Unassigned',
      isCustom: true,
    }
    const current = this.getDepartments()
    storeState.departments = [...current.filter((d) => (d.id || d.deptId) !== id && d.name.toLowerCase() !== name.toLowerCase()), newDept]
    this.addAuditLog('Admin', 'DEPARTMENT_CREATE', `Created department '${newDept.name}' (${newDept.code})`)
    notifyListeners()
    return newDept
  },
  updateDepartment(deptId, updates) {
    const list = this.getDepartments()
    let oldName = null
    const target = list.find((d) => d.id === deptId || d.deptId === deptId || d._id === deptId || d.name?.toLowerCase() === String(deptId).toLowerCase())
    if (target) {
      oldName = target.name
    }

    const cleanUpdates = { ...updates }
    if (cleanUpdates.code !== undefined) cleanUpdates.code = String(cleanUpdates.code).trim().toUpperCase()
    if (cleanUpdates.name !== undefined) cleanUpdates.name = String(cleanUpdates.name).trim()
    if (cleanUpdates.head !== undefined) cleanUpdates.head = String(cleanUpdates.head).trim()
    if (cleanUpdates.description !== undefined) cleanUpdates.description = String(cleanUpdates.description).trim()

    let found = false
    storeState.departments = list.map((d) => {
      if (d.id === deptId || d.deptId === deptId || d._id === deptId || (oldName && d.name?.toLowerCase() === oldName.toLowerCase())) {
        found = true
        return {
          ...d,
          ...cleanUpdates,
          id: d.id || deptId,
          deptId: d.deptId || d.id || deptId,
        }
      }
      return d
    })

    if (!found) {
      const core = INITIAL_DEPARTMENTS.find((d) => d.id === deptId || (oldName && d.name.toLowerCase() === oldName.toLowerCase()))
      const base = core || { id: deptId, deptId, isCustom: true }
      storeState.departments = [...storeState.departments, { ...base, ...cleanUpdates }]
    }

    // Cascade department name rename to employees and users so nobody becomes orphaned
    if (oldName && cleanUpdates.name && oldName.toLowerCase() !== cleanUpdates.name.toLowerCase()) {
      const newName = cleanUpdates.name
      storeState.employees = (storeState.employees || []).map((emp) => {
        if ((emp.department || '').trim().toLowerCase() === oldName.toLowerCase()) {
          return { ...emp, department: newName }
        }
        return emp
      })
      storeState.users = (storeState.users || []).map((u) => {
        if ((u.department || '').trim().toLowerCase() === oldName.toLowerCase()) {
          return { ...u, department: newName }
        }
        return u
      })
    }

    this.addAuditLog('Admin', 'DEPARTMENT_UPDATE', `Updated department details for '${cleanUpdates.name || deptId}' (${cleanUpdates.code || ''})`)
    notifyListeners()
    return true
  },
  deleteDepartment(deptId) {
    const list = this.getDepartments()
    const dept = list.find((d) => d.id === deptId || d.deptId === deptId || d._id === deptId || d.name?.toLowerCase() === String(deptId).toLowerCase())
    if (!dept) throw new Error('Department not found.')
    const isCore = INITIAL_DEPARTMENTS.some((d) => d.id === dept.id)
    if (isCore) {
      throw new Error(`System core department '${dept.name}' cannot be deleted.`)
    }
    storeState.departments = list.filter((d) => d.id !== dept.id && d.deptId !== dept.id && d.name.toLowerCase() !== dept.name.toLowerCase())
    const deptName = dept.name.toLowerCase()
    storeState.employees = (storeState.employees || []).map((emp) => {
      if ((emp.department || '').toLowerCase() === deptName) {
        return { ...emp, department: 'Unassigned' }
      }
      return emp
    })
    storeState.users = (storeState.users || []).map((u) => {
      if ((u.department || '').toLowerCase() === deptName) {
        return { ...u, department: 'Unassigned' }
      }
      return u
    })
    this.addAuditLog('Admin', 'DEPARTMENT_DELETE', `Deleted custom department '${dept.name}'`)
    notifyListeners()
    return true
  },
  assignEmployeesToDepartment(deptIdOrName, employeeIds, actor = 'Admin') {
    if (!deptIdOrName) throw new Error('Department is required.')
    const targetDept = this.getDepartment(deptIdOrName) || { name: deptIdOrName }
    const deptName = targetDept.name || deptIdOrName
    const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds]

    for (const empId of ids) {
      const emp = this.getEmployee(empId)
      if (emp) {
        this.updateEmployee(emp.id, { department: deptName })
      }
    }
    this.addAuditLog(actor, 'DEPARTMENT_ASSIGNMENT', `Assigned ${ids.length} employee(s) to ${deptName}`)
    notifyListeners()
    return true
  },
  assignUserRole(userId, newRole) {
    const roleObj = (storeState.roles || INITIAL_ROLES).find((r) => r.id === newRole)
    const perms = this.getRolePermissions(newRole) || roleObj?.permissions || []
    storeState.users = (storeState.users || []).map((u) => {
      if (u.id === userId || u._id === userId) {
        return { ...u, role: newRole, permissions: perms }
      }
      return u
    })
    this.addAuditLog('Admin', 'USER_ROLE_ASSIGN', `Assigned user '${userId}' to role '${newRole}'`)
    notifyListeners()
    return true
  },
  clearAuditLogs() {
    storeState.auditLogs = [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor: 'Admin',
        action: 'AUDIT_LOG_CLEAR',
        details: 'Audit logs purged by System Administrator. Compliance baseline reset.',
      },
    ]
    notifyListeners()
    return true
  },
  updateCompanySettings(updates) {
    storeState.companySettings = {
      ...(storeState.companySettings || {}),
      ...updates,
      attendanceRules: {
        ...(storeState.companySettings?.attendanceRules || {}),
        ...(updates.attendanceRules || {}),
      },
      leavePolicies: {
        ...(storeState.companySettings?.leavePolicies || {}),
        ...(updates.leavePolicies || {}),
      },
    }
    this.addAuditLog('Admin', 'COMPANY_SETTINGS_UPDATE', 'Updated global company attendance parameters and leave policy rules')
    notifyListeners()
    return storeState.companySettings
  },

  deleteUser(userId) {
    const target = (storeState.users || []).find((u) => u.id === userId || u._id === userId || u.employeeId === userId)
    const empId = target?.employeeId
    const email = target?.email

    storeState.users = (storeState.users || []).filter((u) => u.id !== userId && u._id !== userId && (!empId || u.employeeId !== empId))
    if (empId || email) {
      storeState.employees = (storeState.employees || []).filter((e) => e.id !== userId && e._id !== userId && (!empId || e.employeeId !== empId) && (!email || e.email !== email))
      storeState.payroll = (storeState.payroll || []).filter((p) => (!empId || p.employeeId !== empId))
      storeState.attendance = (storeState.attendance || []).filter((a) => a.userId !== userId && (!empId || a.employeeId !== empId))
      storeState.leaveRequests = (storeState.leaveRequests || []).filter((l) => l.employeeId !== userId && (!empId || l.employeeId !== empId))
    }
    storeState = {
      ...storeState,
      users: [...storeState.users],
      employees: [...storeState.employees],
      payroll: [...(storeState.payroll || [])],
      attendance: [...(storeState.attendance || [])],
      leaveRequests: [...(storeState.leaveRequests || [])],
    }
    this.addAuditLog('Admin', 'USER_DELETE', `Deleted user account ${userId} and all associated records`)
    notifyListeners()
    return true
  },

  // Holidays Management
  addHoliday(holidayData) {
    const newHol = {
      id: `hol-${Date.now()}`,
      name: holidayData.name || holidayData.title,
      title: holidayData.name || holidayData.title,
      date: holidayData.date,
      day: holidayData.day || 'National Holiday',
      type: holidayData.type || 'Festival',
    }
    storeState.holidays = [...(storeState.holidays || []), newHol]
    this.addAuditLog('Admin', 'HOLIDAY_ADD', `Added holiday: ${newHol.title} on ${newHol.date}`)
    notifyListeners()
    return newHol
  },
  deleteHoliday(identifier) {
    if (identifier === undefined || identifier === null || identifier === '') return
    storeState.holidays = (storeState.holidays || []).filter((h) => 
      h.id !== identifier && h._id !== identifier && h.name !== identifier && h.title !== identifier
    )
    storeState = { ...storeState, holidays: [...storeState.holidays] }
    this.addAuditLog('Admin', 'HOLIDAY_DELETE', `Removed holiday record ${identifier}`)
    notifyListeners()
  },

  // Company Documents Management
  addDocument(docData) {
    const newDoc = {
      id: `DOC-${Date.now()}`,
      title: docData.title,
      category: docData.category || 'Company Policy',
      size: docData.size || '1.2 MB',
      date: new Date().toISOString().split('T')[0],
      url: docData.url || '#',
    }
    storeState.documents = [newDoc, ...(storeState.documents || [])]
    this.addAuditLog('Admin', 'DOCUMENT_UPLOAD', `Uploaded company document: ${newDoc.title} (${newDoc.category})`)
    this.addNotification({
      title: 'New Document Published',
      message: `"${newDoc.title}" is now available in the Company Documents repository.`,
      type: 'document',
    })
    notifyListeners()
    return newDoc
  },
  deleteDocument(id) {
    storeState.documents = (storeState.documents || []).filter((d) => d.id !== id)
    this.addAuditLog('Admin', 'DOCUMENT_DELETE', `Deleted company document ${id}`)
    notifyListeners()
  },

  // Branch Locations Management
  addBranchLocation(branch) {
    const newLoc = {
      id: `loc-${Date.now()}`,
      name: branch.name,
      city: branch.city,
      radiusMeters: branch.radiusMeters || 250,
      isDefault: false,
    }
    storeState.companySettings.locations = [...(storeState.companySettings.locations || []), newLoc]
    this.addAuditLog('Admin', 'BRANCH_ADD', `Added office branch: ${newLoc.name} (${newLoc.city})`)
    notifyListeners()
    return newLoc
  },
  removeBranchLocation(id) {
    if (!id) return
    storeState.companySettings.locations = (storeState.companySettings.locations || []).filter((l) => 
      l.id !== id && l._id !== id && l.name !== id
    )
    storeState.companySettings = {
      ...storeState.companySettings,
      locations: [...storeState.companySettings.locations],
    }
    storeState = { ...storeState, companySettings: { ...storeState.companySettings } }
    this.addAuditLog('Admin', 'BRANCH_REMOVE', `Removed office branch ${id}`)
    notifyListeners()
  },

  // Expenses Approval Flow
  approveExpense(id, reviewerRole = 'Manager') {
    storeState.expenses = (storeState.expenses || []).map((e) => {
      if (e.id === id) {
        return { ...e, status: 'approved' }
      }
      return e
    })
    const exp = (storeState.expenses || []).find((e) => e.id === id)
    this.addNotification({
      title: 'Expense Claim Approved',
      message: `Claim ${id} for ₹${exp?.amount || ''} (${exp?.category || ''}) has been approved.`,
      type: 'expense',
    })
    this.addAuditLog(reviewerRole, 'EXPENSE_APPROVE', `Approved expense claim ${id}`)
    notifyListeners()
    return (storeState.expenses || []).find((e) => e.id === id)
  },
  rejectExpense(id, reviewerRole = 'Manager', reason = 'Insufficient invoice receipt') {
    storeState.expenses = (storeState.expenses || []).map((e) => {
      if (e.id === id) {
        return { ...e, status: 'rejected', rejectionReason: reason }
      }
      return e
    })
    this.addNotification({
      title: 'Expense Claim Declined',
      message: `Claim ${id} was rejected: ${reason}`,
      type: 'expense',
    })
    this.addAuditLog(reviewerRole, 'EXPENSE_REJECT', `Rejected expense claim ${id}: ${reason}`)
    notifyListeners()
    return (storeState.expenses || []).find((e) => e.id === id)
  },

  // Backup and Restore
  backupDataJSON() {
    return JSON.stringify(storeState, null, 2)
  },
  restoreDataJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString)
      if (!parsed || typeof parsed !== 'object') return false
      storeState = parsed
      this.addAuditLog('Admin', 'DATABASE_RESTORE', 'Restored complete database state from backup JSON')
      notifyListeners()
      return true
    } catch {
      return false
    }
  },

  // Employees
  getEmployees() {
    return storeState.employees
  },
  getEmployee(id) {
    return storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
  },
  addEmployee(empData) {
    const newEmpId = `emp-${Date.now()}`
    const employeeCode = empData.employeeId || `EDU-EMP-${Math.floor(100 + Math.random() * 900)}`
    const annualCTC = Number(empData.salary) || 900000
    const monthlyGross = Math.round(annualCTC / 12)
    const struct = empData.salaryStructure || {}
    const hasStruct = Boolean(
      struct && (
        struct.basic !== undefined ||
        struct.hra !== undefined ||
        struct.ca !== undefined ||
        struct.conveyance !== undefined ||
        struct.sa !== undefined ||
        struct.specialAllowance !== undefined ||
        struct.oa !== undefined ||
        struct.otherAllowance !== undefined
      )
    )

    const basic = hasStruct && struct.basic !== undefined
      ? Math.max(0, Number(struct.basic) || 0)
      : Math.round(monthlyGross * 0.50)
    const hra = hasStruct && struct.hra !== undefined
      ? Math.max(0, Number(struct.hra) || 0)
      : Math.round(monthlyGross * 0.25)
    const conveyance = hasStruct && (struct.conveyance !== undefined || struct.ca !== undefined)
      ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0)
      : 1600
    const specialAllowance = hasStruct && (struct.specialAllowance !== undefined || struct.sa !== undefined)
      ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0)
      : Math.round(monthlyGross * 0.15)
    const otherAllowance = hasStruct && (struct.otherAllowance !== undefined || struct.oa !== undefined)
      ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0)
      : Math.max(0, monthlyGross - basic - hra - specialAllowance - conveyance)
    const medicalAllowance = 2500
    const performanceBonus = Math.max(0, monthlyGross - (basic + hra + specialAllowance + conveyance + medicalAllowance))
    const pf = Math.round(basic * 0.12)
    const professionalTax = 200
    const tdsTax = Math.round(monthlyGross * 0.05)

    const salaryStructure = {
      basic,
      hra,
      conveyance,
      ca: conveyance,
      specialAllowance,
      sa: specialAllowance,
      otherAllowance,
      oa: otherAllowance,
    }

    const bankDetails = {
      bankName: empData.bankName || empData.bankDetails?.bankName || 'HDFC Bank',
      accountNumber: empData.accountNumber || empData.bankDetails?.accountNumber || `501004928${Math.floor(1000 + Math.random() * 9000)}`,
      ifscCode: empData.ifscCode || empData.bankDetails?.ifscCode || 'HDFC0001234',
      panTaxId: empData.panTaxId || empData.bankDetails?.panTaxId || `PAN${Math.floor(1000 + Math.random() * 9000)}X`,
      uanNumber: empData.uanNumber || empData.bankDetails?.uanNumber || `100984${Math.floor(100000 + Math.random() * 900000)}`,
    }

    const emergencyContact = {
      name: empData.emergencyContactName || empData.emergencyContact?.name || 'Emergency Contact',
      relationship: empData.emergencyContactRelationship || empData.emergencyContact?.relationship || 'Family',
      phone: empData.emergencyContactPhone || empData.emergencyContact?.phone || empData.phone || '+91 98765 00001',
    }

    const newEmp = {
      id: newEmpId,
      _id: newEmpId,
      employeeId: employeeCode,
      name: empData.name,
      email: empData.email,
      phone: empData.phone || '+91 98765 43210',
      department: empData.department || 'Engineering',
      designation: empData.designation || 'Specialist',
      role: empData.role || 'employee',
      status: empData.status || 'active',
      joiningDate: empData.joiningDate || new Date().toISOString().split('T')[0],
      salary: annualCTC,
      salaryStructure,
      managerId: empData.managerId || 'emp-2',
      managerName: empData.managerName || 'Sarah Chen',
      bankDetails,
      emergencyContact,
      documents: [
        { id: `doc-${Date.now()}-1`, name: `Offer_Letter_${(empData.name || empData.displayName || "Employee").replace(/\s+/g, '_')}.pdf`, type: 'Offer Letter', size: '1.2 MB', date: empData.joiningDate || '2026-10-01' },
        { id: `doc-${Date.now()}-2`, name: `NDA_Signed_${(empData.name || empData.displayName || "Employee").replace(/\s+/g, '_')}.pdf`, type: 'NDA', size: '650 KB', date: empData.joiningDate || '2026-10-01' },
      ],
      onboardingChecklist: [
        { key: 'offer', label: 'Signed offer letter received', completed: true },
        { key: 'background', label: 'Identity & background verification', completed: true },
        { key: 'laptop', label: 'Workstation & credentials issued', completed: true },
        { key: 'orientation', label: 'Company culture orientation', completed: false },
        { key: 'security', label: 'Security & compliance training completed', completed: false },
      ],
      exitDetails: null,
    }

    storeState.employees = [newEmp, ...storeState.employees]

    const defaultPassword = empData.password || 'Password@123'
    newEmp.temporaryPassword = defaultPassword
    const existingUser = (storeState.users || []).find((u) => u.email === newEmp.email || u.employeeId === newEmp.employeeId)
    if (!existingUser) {
      const newUser = {
        id: `user-${Date.now()}`,
        employeeId: newEmp.employeeId,
        name: newEmp.name,
        displayName: newEmp.name,
        email: newEmp.email,
        password: defaultPassword,
        role: newEmp.role,
        department: newEmp.department,
        designation: newEmp.designation,
        status: newEmp.status === 'active' ? 'active' : 'inactive',
        avatarTone: 'teal',
        managerId: newEmp.managerId,
        permissions: newEmp.role === 'admin' ? ['*'] : newEmp.role === 'hr' ? (INITIAL_USERS[1]?.permissions || []) : ['dashboard.read', 'leave.self.read', 'tasks.read', 'training.read', 'documents.read', 'helpdesk.read'],
      }
      storeState.users = [newUser, ...(storeState.users || [])]
    }

    // Auto-create initial INR payroll record so employee can receive payslips immediately
    const existingPay = (storeState.payroll || []).find((p) => p.employeeId === newEmp.employeeId && p.month === 'September 2026')
    if (!existingPay) {
      const initialPayrollRecord = {
        id: `pay-${newEmp.id}-2026-09`,
        employeeId: newEmp.employeeId,
        employeeName: newEmp.name,
        department: newEmp.department,
        designation: newEmp.designation,
        month: 'September 2026',
        workingDays: 30,
        paidDays: 30,
        lopDays: 0,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        panTaxId: bankDetails.panTaxId,
        uanNumber: bankDetails.uanNumber,
        earnings: {
          basic,
          hra,
          specialAllowance,
          conveyance,
          medicalAllowance,
          performanceBonus,
          overtime: 0,
        },
        deductions: {
          pf,
          esi: 0,
          professionalTax,
          tdsTax,
          loanAdvance: 0,
          lossOfPay: 0,
          performanceDeduction: 0,
          otherDeductions: 0,
        },
        status: 'processed',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: 'Initial salary profile computed from annual CTC package',
      }
      storeState.payroll = [initialPayrollRecord, ...(storeState.payroll || [])]
    }

    this.addNotification({
      title: 'New Employee Added',
      message: `${newEmp.name} (${newEmp.employeeId}) has been added to ${newEmp.department} with INR ${annualCTC.toLocaleString('en-IN')} CTC.`,
      type: 'team',
    })
    this.addAuditLog('HR', 'EMPLOYEE_CREATE', `Added employee ${newEmp.name} (${newEmp.employeeId}) to ${newEmp.department}`)
    notifyListeners()
    return newEmp
  },
  updateOnboardingDocs(id, payload) {
    const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!emp) return false
    if (payload.identity) emp.identity = { ...(emp.identity || {}), ...payload.identity }
    if (payload.parentsContact) emp.parentsContact = { ...(emp.parentsContact || {}), ...payload.parentsContact }
    if (payload.emergencyContact) emp.emergencyContact = { ...(emp.emergencyContact || {}), ...payload.emergencyContact }
    if (payload.bankDetails) emp.bankDetails = { ...(emp.bankDetails || {}), ...payload.bankDetails }
    if (payload.onboardingDocs) emp.onboardingDocs = { ...(emp.onboardingDocs || {}), ...payload.onboardingDocs }
    if (payload.financeDetails) emp.financeDetails = { ...(emp.financeDetails || {}), ...payload.financeDetails }
    if (payload.onboardingStatus) emp.onboardingStatus = payload.onboardingStatus
    if (payload.onboardingVerifiedAt) emp.onboardingVerifiedAt = payload.onboardingVerifiedAt
    if (payload.onboardingVerifiedBy) emp.onboardingVerifiedBy = payload.onboardingVerifiedBy
    if (payload.onboardingSubmittedAt) emp.onboardingSubmittedAt = payload.onboardingSubmittedAt
    if (payload.onboardingUnlockedAt) emp.onboardingUnlockedAt = payload.onboardingUnlockedAt
    if (payload.phone) emp.phone = payload.phone

    if (payload.onboardingRejectionReason !== undefined) emp.onboardingRejectionReason = payload.onboardingRejectionReason

    // When status is marked verified, ensure all submitted documents are also flagged verified
    if (payload.onboardingStatus === 'verified' && emp.onboardingDocs) {
      const vAt = payload.onboardingVerifiedAt || new Date().toISOString()
      const vBy = payload.onboardingVerifiedBy || 'HR Management'
      const updatedDocs = { ...emp.onboardingDocs }
      Object.keys(updatedDocs).forEach((k) => {
        if (updatedDocs[k]) {
          updatedDocs[k] = {
            ...updatedDocs[k],
            status: 'verified',
            verifiedAt: vAt,
            verifiedBy: vBy,
          }
        }
      })
      emp.onboardingDocs = updatedDocs
    }

    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }

    // Automatically synchronize bank details with existing payroll records
    if (payload.bankDetails) {
      storeState.payroll = (storeState.payroll || []).map((p) => {
        if (p.employeeId === emp.employeeId) {
          return {
            ...p,
            ...(payload.bankDetails.bankName ? { bankName: payload.bankDetails.bankName } : {}),
            ...(payload.bankDetails.accountNumber ? { accountNumber: payload.bankDetails.accountNumber } : {}),
            ...(payload.bankDetails.ifscCode ? { ifscCode: payload.bankDetails.ifscCode } : {}),
            ...(payload.bankDetails.panTaxId ? { panTaxId: payload.bankDetails.panTaxId } : {}),
            ...(payload.bankDetails.uanNumber ? { uanNumber: payload.bankDetails.uanNumber } : {}),
          }
        }
        return p
      })
    }

    this.addAuditLog('System', 'ONBOARDING_UPDATE', `Updated onboarding documents, banking, and identity for ${emp.name}`)
    notifyListeners()
    return emp
  },
  approveDocument(id, docKey, body = {}) {
    const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!emp) return false
    const docs = { ...(emp.onboardingDocs || {}) }
    const currentDoc = docs[docKey] ? { ...docs[docKey] } : {}
    docs[docKey] = {
      ...currentDoc,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: body.verifiedBy || 'HR Management',
      rejectionReason: null,
      comments: body.comments || currentDoc.comments,
    }
    if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
    if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
    emp.onboardingDocs = docs

    const uploaded = Object.values(docs).filter((d) => d && (d.fileName || d.url))
    if (uploaded.length > 0 && uploaded.every((d) => d.status === 'verified')) {
      emp.onboardingStatus = 'verified'
      emp.onboardingVerifiedAt = new Date().toISOString()
      emp.onboardingVerifiedBy = body.verifiedBy || 'HR Management'
    }

    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('HR', 'DOCUMENT_APPROVE', `Approved ${docKey} for ${emp.name}`)
    notifyListeners()
    return emp
  },
  rejectDocument(id, docKey, reason = 'Document rejected', body = {}) {
    const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!emp) return false
    const docs = { ...(emp.onboardingDocs || {}) }
    const currentDoc = docs[docKey] ? { ...docs[docKey] } : {}
    docs[docKey] = {
      ...currentDoc,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: body.rejectedBy || 'HR Management',
      rejectionReason: reason,
      comments: body.comments || reason,
    }
    if (docKey === 'aadharCard') docs.aadharDoc = { ...docs[docKey] }
    if (docKey === 'panCard') docs.panDoc = { ...docs[docKey] }
    emp.onboardingDocs = docs
    emp.onboardingStatus = 'action_required'
    emp.onboardingRejectionReason = reason

    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('HR', 'DOCUMENT_REJECT', `Rejected ${docKey} for ${emp.name}: ${reason}`)
    notifyListeners()
    return emp
  },
  approveOnboarding(id, options = {}) {
    const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!emp) return false
    const vAt = new Date().toISOString()
    const vBy = options.verifiedBy || 'HR Management'
    const docs = { ...(emp.onboardingDocs || {}) }
    Object.keys(docs).forEach((k) => {
      if (docs[k] && typeof docs[k] === 'object') {
        docs[k] = { ...docs[k], status: 'verified', verifiedAt: vAt, verifiedBy: vBy }
      }
    })
    emp.onboardingDocs = docs
    emp.onboardingStatus = 'verified'
    emp.onboardingVerifiedAt = vAt
    emp.onboardingVerifiedBy = vBy
    emp.onboardingRejectionReason = null
    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('HR', 'ONBOARDING_APPROVE', `Approved all onboarding documents for ${emp.name}`)
    notifyListeners()
    return emp
  },
  rejectOnboarding(id, reason = 'Onboarding revision requested') {
    const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!emp) return false
    emp.onboardingStatus = 'action_required'
    emp.onboardingRejectionReason = reason
    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('HR', 'ONBOARDING_REJECT', `Requested onboarding revision for ${emp.name}: ${reason}`)
    notifyListeners()
    return emp
  },
  requestOnboardingRevision(id, reason = 'Employee requested document revision') {
    const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id)
    if (!emp) return false
    emp.onboardingStatus = 'revision_requested'
    emp.onboardingNotes = reason
    emp.onboardingRejectionReason = null
    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('EMPLOYEE', 'ONBOARDING_REVISION_REQUEST', `Employee ${emp.name} requested onboarding revision: ${reason}`)
    notifyListeners()
    return emp
  },
  savePolicyConsent(employeeId, policyKey, consentData = {}) {
    const emp = storeState.employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
    if (!emp) return false
    const now = new Date()
    const consentEntry = {
      consented: true,
      consentedAt: now.toISOString(),
      consentedDateFormatted: now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      consentedBy: emp.name,
      employeeId: emp.employeeId,
      ...consentData,
    }
    const currentConsents = { ...(emp.policyConsents || {}) }
    currentConsents[policyKey] = consentEntry
    emp.policyConsents = currentConsents
    if (!emp.onboardingDocs) emp.onboardingDocs = {}
    emp.onboardingDocs.policyConsents = currentConsents

    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('EMPLOYEE', 'POLICY_CONSENT', `Employee ${emp.name} (${emp.employeeId}) acknowledged company policy: ${consentData.policyTitle || policyKey} on ${consentEntry.consentedDateFormatted}`)
    notifyListeners()
    return emp
  },
  saveAllPolicyConsents(employeeId, policies = [], additionalData = {}) {
    const emp = storeState.employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
    if (!emp) return false
    const now = new Date()
    const formatted = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const currentConsents = { ...(emp.policyConsents || {}) }
    policies.forEach((pol) => {
      currentConsents[pol.key || pol.id] = {
        consented: true,
        consentedAt: now.toISOString(),
        consentedDateFormatted: formatted,
        consentedBy: emp.name,
        employeeId: emp.employeeId,
        policyTitle: pol.title,
        ...additionalData,
      }
    })
    emp.policyConsents = currentConsents
    if (!emp.onboardingDocs) emp.onboardingDocs = {}
    emp.onboardingDocs.policyConsents = currentConsents

    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('EMPLOYEE', 'POLICY_CONSENT_ALL', `Employee ${emp.name} signed & consented to all company policies on ${formatted}`)
    notifyListeners()
    return emp
  },
  updateComplianceDocs(employeeId, complianceDocs) {
    const emp = storeState.employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
    if (!emp) return false
    emp.complianceDocs = { ...(emp.complianceDocs || {}), ...(complianceDocs || {}) }
    if (!emp.onboardingDocs) emp.onboardingDocs = {}
    emp.onboardingDocs.complianceDocs = emp.complianceDocs

    storeState = {
      ...storeState,
      employees: storeState.employees.map((e) => (e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId) ? { ...emp } : e),
    }
    this.addAuditLog('EMPLOYEE', 'COMPLIANCE_UPLOAD', `Employee ${emp.name} updated compliance & NDA documents`)
    notifyListeners()
    return emp
  },
  updateEmployee(id, updates) {
    const existing = storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id)
    if (!existing) return null

    const oldEmployeeId = existing.employeeId
    const newEmployeeId = updates.employeeId ? String(updates.employeeId).trim().toUpperCase() : oldEmployeeId

    // Merge nested bankDetails if provided as flat fields
    const updatedBankDetails = {
      ...(existing.bankDetails || {}),
      ...(updates.bankDetails || {}),
      ...(updates.bankName ? { bankName: updates.bankName } : {}),
      ...(updates.accountNumber ? { accountNumber: updates.accountNumber } : {}),
      ...(updates.ifscCode ? { ifscCode: updates.ifscCode } : {}),
      ...(updates.panTaxId ? { panTaxId: updates.panTaxId } : {}),
      ...(updates.uanNumber ? { uanNumber: updates.uanNumber } : {}),
    }

    const updatedEmergency = {
      ...(existing.emergencyContact || {}),
      ...(updates.emergencyContact || {}),
      ...(updates.emergencyContactName ? { name: updates.emergencyContactName } : {}),
      ...(updates.emergencyContactPhone ? { phone: updates.emergencyContactPhone } : {}),
    }

    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === id || emp._id === id || emp.employeeId === id) {
        return {
          ...emp,
          ...updates,
          employeeId: newEmployeeId,
          salary: updates.salary !== undefined ? Number(updates.salary) : emp.salary,
          salaryStructure: updates.salaryStructure !== undefined ? updates.salaryStructure : (emp.salaryStructure || {}),
          bankDetails: updatedBankDetails,
          emergencyContact: updatedEmergency,
        }
      }
      return emp
    })

    // Also sync companion user record
    storeState.users = (storeState.users || []).map((u) => {
      if (u.employeeId === oldEmployeeId || u.id === id || u._id === id || u.email === existing.email) {
        return {
          ...u,
          employeeId: newEmployeeId,
          ...(updates.name ? { name: updates.name, displayName: updates.name } : {}),
          ...(updates.department ? { department: updates.department } : {}),
          ...(updates.designation ? { designation: updates.designation } : {}),
          ...(updates.role ? { role: updates.role } : {}),
          ...(updates.status ? { status: updates.status === 'active' ? 'active' : 'inactive' } : {}),
        }
      }
      return u
    })

    // Also update existing payroll records if name, department, designation, or bank details changed
    storeState.payroll = (storeState.payroll || []).map((p) => {
      if (p.employeeId === oldEmployeeId || p.employeeId === newEmployeeId) {
        return {
          ...p,
          employeeId: newEmployeeId,
          ...(updates.name ? { employeeName: updates.name } : {}),
          ...(updates.department ? { department: updates.department } : {}),
          ...(updates.designation ? { designation: updates.designation } : {}),
          ...(updatedBankDetails.bankName ? { bankName: updatedBankDetails.bankName } : {}),
          ...(updatedBankDetails.accountNumber ? { accountNumber: updatedBankDetails.accountNumber } : {}),
          ...(updatedBankDetails.ifscCode ? { ifscCode: updatedBankDetails.ifscCode } : {}),
          ...(updatedBankDetails.panTaxId ? { panTaxId: updatedBankDetails.panTaxId } : {}),
          ...(updatedBankDetails.uanNumber ? { uanNumber: updatedBankDetails.uanNumber } : {}),
        }
      }
      return p
    })

    // Cascade employeeId change to attendance and leaves
    if (oldEmployeeId && newEmployeeId && oldEmployeeId !== newEmployeeId) {
      storeState.attendance = (storeState.attendance || []).map((a) => {
        if (a.employeeId === oldEmployeeId) return { ...a, employeeId: newEmployeeId }
        return a
      })
      storeState.leaves = (storeState.leaves || []).map((l) => {
        if (l.employeeId === oldEmployeeId) return { ...l, employeeId: newEmployeeId }
        return l
      })
    }

    this.addAuditLog('HR', 'EMPLOYEE_UPDATE', `Updated employee record for ${existing.name} (${newEmployeeId})`)
    notifyListeners()
    return storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id)
  },
  deleteEmployee(id) {
    const existing = storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id)
    if (!existing) return false

    // Remove from employees list
    storeState.employees = storeState.employees.filter((emp) => emp.id !== id && emp._id !== id && emp.employeeId !== existing.employeeId)

    // Remove from companion users
    storeState.users = (storeState.users || []).filter((u) => u.employeeId !== existing.employeeId && u.email !== existing.email)

    // Remove corresponding payroll records
    storeState.payroll = (storeState.payroll || []).filter((p) => p.employeeId !== existing.employeeId)

    this.addNotification({
      title: 'Employee Removed',
      message: `${existing.name} (${existing.employeeId}) has been successfully deleted from company records.`,
      type: 'team',
    })
    this.addAuditLog('HR', 'EMPLOYEE_DELETE', `Deleted employee ${existing.name} (${existing.employeeId}) and revoked all workspace access`)
    notifyListeners()
    return true
  },
  toggleEmployeeStatus(id) {
    const existing = storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id)
    if (!existing) return null

    const newStatus = existing.status === 'active' ? 'inactive' : 'active'
    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === id || emp._id === id || emp.employeeId === id) {
        return { ...emp, status: newStatus }
      }
      return emp
    })

    // Sync to user login status
    storeState.users = (storeState.users || []).map((u) => {
      if (u.employeeId === existing.employeeId || u.email === existing.email) {
        return { ...u, status: newStatus }
      }
      return u
    })

    this.addNotification({
      title: `Employee ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      message: `${existing.name} (${existing.employeeId}) status changed to ${newStatus}.`,
      type: 'team',
    })
    this.addAuditLog('HR', 'EMPLOYEE_STATUS', `Changed status of ${existing.name} (${existing.employeeId}) to ${newStatus}`)
    notifyListeners()
    return newStatus
  },
  toggleOnboardingItem(employeeId, itemKey) {
    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === employeeId || emp._id === employeeId) {
        const checklist = emp.onboardingChecklist.map((it) => it.key === itemKey ? { ...it, completed: !it.completed } : it)
        return { ...emp, onboardingChecklist: checklist }
      }
      return emp
    })
    notifyListeners()
  },
  initiateExit(employeeId, exitData) {
    const defaultChecklist = [
      { key: 'knowledge_transfer', label: 'Handover & Knowledge Transfer Completed', completed: false },
      { key: 'assets_returned', label: 'Company Assets & Laptop Returned', completed: false },
      { key: 'id_badge_access', label: 'ID Badge & Building Access Revoked', completed: false },
      { key: 'system_deprovisioning', label: 'Email & System Accounts Revoked', completed: false },
      { key: 'exit_interview', label: 'HR Exit Interview Conducted', completed: false },
      { key: 'fnf_settlement', label: 'Final Settlement (FnF) Calculated', completed: false },
    ]
    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) {
        return {
          ...emp,
          status: 'notice',
          offboardingChecklist: emp.offboardingChecklist?.length ? emp.offboardingChecklist : defaultChecklist,
          exitDetails: {
            resignationDate: exitData.resignationDate || new Date().toISOString().split('T')[0],
            lastWorkingDay: exitData.lastWorkingDay,
            noticePeriodDays: Number(exitData.noticePeriodDays) || 30,
            reason: exitData.reason,
            handoverAssignee: exitData.handoverAssignee || 'Unassigned',
            handoverStatus: 'Initiated',
            exitInterviewCompleted: false,
            assetsReturned: false,
          },
        }
      }
      return emp
    })
    this.addAuditLog('HR', 'EXIT_INITIATE', `Initiated offboarding process for employee ${employeeId}`)
    notifyListeners()
  },
  toggleOffboardingItem(employeeId, itemKey) {
    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) {
        const checklist = (emp.offboardingChecklist || []).map((it) => it.key === itemKey ? { ...it, completed: !it.completed, completedAt: !it.completed ? new Date().toISOString() : undefined } : it)
        return { ...emp, offboardingChecklist: checklist }
      }
      return emp
    })
    notifyListeners()
  },
  cancelExit(employeeId) {
    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) {
        return { ...emp, status: 'active', exitDetails: null, employmentEndDate: null }
      }
      return emp
    })
    this.addAuditLog('HR', 'EXIT_CANCEL', `Cancelled exit for employee ${employeeId}`)
    notifyListeners()
  },
  finalizeExit(employeeId) {
    storeState.employees = storeState.employees.map((emp) => {
      if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) {
        return {
          ...emp,
          status: 'inactive',
          exitDetails: { ...(emp.exitDetails || {}), handoverStatus: 'Completed', assetsReturned: true, exitInterviewCompleted: true }
        }
      }
      return emp
    })
    this.addAuditLog('HR', 'EXIT_FINALIZE', `Finalized exit for employee ${employeeId}`)
    notifyListeners()
  },

  // Attendance, GPS Geofencing & Wi-Fi Verification
  getAttendance(date) {
    if (!date) return storeState.attendance
    return storeState.attendance.filter((a) => a.date === date)
  },
  verifyAttendanceLocation(latitude, longitude, wifiSSID, bssid = null, publicIp = null) {
    const settings = storeState.companySettings
    const allowedWifi = settings?.allowedWifiSSIDs || []
    const wifiNetworks = settings?.wifiNetworks || []

    // Real network signal: public IP match. Browsers can't read Wi-Fi SSID/BSSID, so the
    // trustworthy "on office network" check is whether the device's public (egress) IP
    // matches an admin-registered office network IP.
    const officeNetworkIPs = settings?.officeNetworkIPs || []
    const normalizedIp = publicIp ? String(publicIp).trim().toLowerCase() : null
    const isNetworkVerified = Boolean(
      normalizedIp && officeNetworkIPs.some((e) => String(e.ip).trim().toLowerCase() === normalizedIp)
    )
    const matchedNetworkIP = isNetworkVerified
      ? officeNetworkIPs.find((e) => String(e.ip).trim().toLowerCase() === normalizedIp)
      : null

    // Legacy SSID/BSSID self-report (kept for record labelling only — never authorises on its own).
    const matchedNetwork = wifiNetworks.find((n) => n.ssid === wifiSSID && n.status === 'active')
    const isSsidKnown = Boolean(wifiSSID && allowedWifi.includes(wifiSSID))
    const normalizedBssid = bssid ? String(bssid).toUpperCase().trim() : null
    const isBssidVerified = Boolean(
      matchedNetwork && matchedNetwork.bssid && normalizedBssid && matchedNetwork.bssid.toUpperCase() === normalizedBssid
    )

    let nearestLocation = null
    let minDistance = Infinity

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      const locations = settings?.locations || []
      locations.forEach((loc) => {
        if (loc.lat !== undefined && loc.lng !== undefined) {
          const dist = calculateDistanceMeters(latitude, longitude, loc.lat, loc.lng)
          if (dist !== null && dist < minDistance) {
            minDistance = dist
            nearestLocation = loc
          }
        }
      })
    }

    const maxAllowedRadius = settings?.attendanceRules?.maxGeofenceRadiusMeters || nearestLocation?.radiusMeters || 200
    const hasGps = minDistance !== Infinity
    const isGpsVerified = hasGps && minDistance <= maxAllowedRadius

    const isWifiVerified = Boolean(isNetworkVerified || isBssidVerified)
    const isWifiTrusted = Boolean(isNetworkVerified || isBssidVerified)

    let method = 'remote'
    if (isWifiVerified && isGpsVerified) {
      method = 'wifi_and_gps'
    } else if (isGpsVerified) {
      method = 'gps_geofence'
    } else if (isNetworkVerified) {
      method = 'office_network'
    } else if (isBssidVerified) {
      method = 'wifi_secure'
    }

    const requireBoth = settings?.attendanceRules?.requireOfficeNetworkAndGps ?? false
    const isEligible = requireBoth
      ? Boolean(isNetworkVerified && isGpsVerified)
      : Boolean(isNetworkVerified || (isBssidVerified && isGpsVerified) || isGpsVerified)

    let failureReason = null
    let message = 'Attendance verification successful.'
    if (!isEligible) {
      if (!isNetworkVerified && !isGpsVerified) {
        failureReason = 'NETWORK_AND_GPS_FAILED'
        message = `Both Office Network (IP) and GPS Geofence verification failed. Connect to registered office Wi-Fi and verify you are within ${maxAllowedRadius}m of the office.`
      } else if (!isNetworkVerified) {
        failureReason = 'NETWORK_VERIFICATION_FAILED'
        message = `Office Network verification failed: Request IP (${publicIp || 'unknown'}) is not on the registered office network. Please connect to the office Wi-Fi network.`
      } else if (!isGpsVerified) {
        failureReason = 'GPS_VERIFICATION_FAILED'
        message = hasGps
          ? `GPS geofence verification failed: You are ${Math.round(minDistance)}m away from ${nearestLocation?.name || 'the office'} (permitted radius: ${maxAllowedRadius}m).`
          : 'GPS verification failed: Device location is required to verify physical presence within the office geofence.'
      } else {
        failureReason = 'VERIFICATION_FAILED'
        message = 'Attendance verification failed.'
      }
    }

    return {
      isSsidKnown,
      isBssidVerified,
      isNetworkVerified,
      isWifiVerified,
      isWifiTrusted,
      isGpsVerified,
      hasGps,
      publicIp: publicIp || null,
      matchedNetworkLabel: matchedNetworkIP?.label || null,
      bssid: normalizedBssid,
      expectedBssid: matchedNetwork?.bssid || null,
      securityType: matchedNetwork?.securityType || null,
      distanceMeters: hasGps ? minDistance : null,
      maxAllowedDistance: maxAllowedRadius,
      nearestLocation: nearestLocation ? nearestLocation.name : (settings?.locations?.[0]?.name || 'Office'),
      isEligible,
      method,
      failureReason,
      message,
    }
  },
  checkIn(...args) {
    let employeeId, employeeName, customWifi, date, gpsData, bssid, publicIp, shift, shiftCode
    if (typeof args[0] === 'object' && args[0] !== null) {
      const p = args[0]
      employeeId = p.employeeId
      employeeName = p.employeeName
      customWifi = p.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || 'Edufyi'
      date = p.date || '2026-09-30'
      gpsData = {
        latitude: p.latitude ?? p.gpsData?.latitude ?? null,
        longitude: p.longitude ?? p.gpsData?.longitude ?? null,
        accuracy: p.accuracy ?? p.gpsData?.accuracy ?? null,
        distanceMeters: p.distanceMeters ?? p.gpsData?.distanceMeters ?? null,
        locationName: p.locationName ?? p.gpsData?.locationName ?? null,
      }
      bssid = p.bssid || null
      publicIp = p.publicIp || null
      shift = p.shift || 'General (09:30 AM – 06:30 PM)'
      shiftCode = p.shiftCode || 'general'
    } else {
      [employeeId, employeeName, customWifi = 'Edufyi-Office-5G', date = '2026-09-30', gpsData = null, bssid = null, publicIp = null, shift = 'General (09:30 AM – 06:30 PM)', shiftCode = 'general'] = args
    }

    const verification = this.verifyAttendanceLocation(gpsData?.latitude, gpsData?.longitude, customWifi, bssid, publicIp)
    if (!verification.isEligible) {
      throw new Error(verification.message || 'Attendance verification failed.')
    }
    const isWifiVerified = verification.isWifiVerified
    const isGpsVerified = verification.isGpsVerified
    const distance = gpsData?.distanceMeters !== undefined ? gpsData.distanceMeters : verification.distanceMeters
    const nearestLoc = gpsData?.locationName || verification.nearestLocation

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

    // Check shift start time for late calculation
    const isLate = (() => {
      if (shiftCode === 'morning') return now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15)
      if (shiftCode === 'evening') return now.getHours() > 13 || (now.getHours() === 13 && now.getMinutes() > 15)
      if (shiftCode === 'night') return now.getHours() > 22 || (now.getHours() === 22 && now.getMinutes() > 15)
      return now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 45)
    })()

    const existingIndex = storeState.attendance.findIndex((a) => a.employeeId === employeeId && a.date === date)
    const newRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName,
      date,
      checkIn: timeStr,
      checkInAt: now.toISOString(),
      checkOut: null,
      status: isLate ? 'late' : 'present',
      wifiSSID: customWifi,
      bssid: verification.bssid || null,
      wifiVerified: isWifiVerified,
      publicIp: publicIp || null,
      networkVerified: verification.isNetworkVerified,
      latitude: gpsData?.latitude ?? null,
      longitude: gpsData?.longitude ?? null,
      distanceMeters: distance ?? null,
      gpsVerified: isGpsVerified,
      locationName: nearestLoc || (isGpsVerified ? (verification.nearestLocation || 'Office') : 'Remote Location'),
      verificationMethod: verification.method,
      shift: shift || 'General (09:30 AM – 06:30 PM)',
      shiftCode: shiftCode || 'general',
      isOnBreak: false,
      currentBreak: null,
      breaks: [],
      totalBreakMinutes: 0,
      totalHours: 'Active (Live)',
    }

    if (existingIndex >= 0) {
      storeState.attendance[existingIndex] = { ...storeState.attendance[existingIndex], ...newRecord }
    } else {
      storeState.attendance = [newRecord, ...storeState.attendance]
    }

    const distText = distance !== null ? ` (GPS: ${distance}m away, ≤200m geofence: ${isGpsVerified ? 'Verified' : 'Outside'})` : ''
    this.addNotification({
      title: 'Attendance Checked In',
      message: `Checked in successfully at ${timeStr} via ${customWifi} (${isWifiVerified ? 'Verified Office Wi-Fi' : 'Remote Network'})${distText} for ${shift}.`,
      type: 'attendance',
    })
    this.addAuditLog(employeeName, 'ATTENDANCE_CHECKIN', `Check-in recorded: ${timeStr} on Wi-Fi: ${customWifi}, GPS: ${distance !== null ? distance + 'm' : 'N/A'} (${date})`)
    notifyListeners()
    return newRecord
  },
  startBreak(type = 'lunch', date = '2026-09-30', employeeId = null) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const target = storeState.attendance.find((a) => a.date === date && (!employeeId || a.employeeId === employeeId))
    if (target) {
      target.isOnBreak = true
      target.currentBreak = { type, startTime: timeStr, startAt: now.toISOString() }
      target.totalHours = `On Break (${type === 'lunch' ? 'Lunch' : 'Break'})`
      this.addNotification({
        title: 'Break Started',
        message: `Started ${type === 'lunch' ? 'Lunch' : 'Short'} break at ${timeStr}. Work timer paused.`,
        type: 'attendance',
      })
      notifyListeners()
    }
  },
  endBreak(date = '2026-09-30', employeeId = null) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    const target = storeState.attendance.find((a) => a.date === date && (!employeeId || a.employeeId === employeeId))
    if (target && target.isOnBreak) {
      const startAt = target.currentBreak?.startAt ? new Date(target.currentBreak.startAt) : now
      const durationMinutes = Math.max(1, Math.round((now - startAt) / 60000))
      target.breaks = target.breaks || []
      target.breaks.push({
        type: target.currentBreak?.type || 'lunch',
        startTime: target.currentBreak?.startTime || timeStr,
        endTime: timeStr,
        durationMinutes,
      })
      target.totalBreakMinutes = (target.totalBreakMinutes || 0) + durationMinutes
      target.isOnBreak = false
      target.currentBreak = null
      target.totalHours = 'Active (Live)'
      this.addNotification({
        title: 'Break Ended',
        message: `Ended break at ${timeStr} (${durationMinutes} mins). Work timer resumed.`,
        type: 'attendance',
      })
      notifyListeners()
    }
  },
  checkOut(...args) {
    let employeeId, employeeName, date
    if (typeof args[0] === 'object' && args[0] !== null) {
      employeeId = args[0].employeeId
      employeeName = args[0].employeeName
      date = args[0].date || '2026-09-30'
    } else {
      [employeeId, employeeName, date = '2026-09-30'] = args
    }

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    storeState.attendance = storeState.attendance.map((att) => {
      if (att.employeeId === employeeId && att.date === date) {
        let totalBreak = att.totalBreakMinutes || 0
        let breaks = Array.isArray(att.breaks) ? [...att.breaks] : []
        if (att.isOnBreak && att.currentBreak?.startAt) {
          const autoMins = Math.max(1, Math.round((now - new Date(att.currentBreak.startAt)) / 60000))
          totalBreak += autoMins
          breaks.push({
            type: att.currentBreak.type || 'lunch',
            startTime: att.currentBreak.startTime || timeStr,
            endTime: timeStr,
            durationMinutes: autoMins,
          })
        }
        const breakStr = totalBreak > 0 ? ` · ${totalBreak}m Break` : ''
        return {
          ...att,
          checkOut: timeStr,
          checkOutAt: now.toISOString(),
          isOnBreak: false,
          currentBreak: null,
          breaks,
          totalBreakMinutes: totalBreak,
          totalHours: `8.5 hrs (Completed)${breakStr}`,
        }
      }
      return att
    })
    this.addNotification({
      title: 'Attendance Checked Out',
      message: `Checked out successfully at ${timeStr}. Net work hours recorded.`,
      type: 'attendance',
    })
    this.addAuditLog(employeeName, 'ATTENDANCE_CHECKOUT', `Check-out recorded: ${timeStr} (${date})`)
    notifyListeners()
  },
  markAttendance(record) {
    const date = record.date || '2026-09-30'
    const verification = this.verifyAttendanceLocation(record.latitude, record.longitude, record.wifiSSID)
    const isVerified = record.wifiVerified !== undefined ? record.wifiVerified : verification.isWifiVerified
    const existingIndex = storeState.attendance.findIndex((a) => a.id === record.id || (a.employeeId === record.employeeId && a.date === date))

    let updated
    if (existingIndex >= 0) {
      updated = {
        ...storeState.attendance[existingIndex],
        ...record,
        date,
        wifiVerified: isVerified,
        gpsVerified: record.gpsVerified !== undefined ? record.gpsVerified : verification.isGpsVerified,
        distanceMeters: record.distanceMeters !== undefined ? record.distanceMeters : verification.distanceMeters,
        locationName: record.locationName || verification.nearestLocation,
      }
      storeState.attendance[existingIndex] = updated
    } else {
      updated = {
        id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        date,
        checkIn: record.checkIn || '09:15 AM',
        checkOut: record.checkOut || '06:15 PM',
        status: record.status || 'present',
        wifiSSID: record.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || 'Edufyi',
        wifiVerified: isVerified,
        latitude: record.latitude ?? (isVerified ? 37.789172 : null),
        longitude: record.longitude ?? (isVerified ? -122.401449 : null),
        distanceMeters: record.distanceMeters !== undefined ? record.distanceMeters : (verification.distanceMeters ?? (isVerified ? 25 : null)),
        gpsVerified: record.gpsVerified !== undefined ? record.gpsVerified : (verification.isGpsVerified || (isVerified && verification.distanceMeters === null)),
        locationName: record.locationName || verification.nearestLocation,
        totalHours: record.totalHours || (record.checkOut ? '8.5 hrs' : 'Active (Live)'),
        notes: record.notes || '',
      }
      storeState.attendance = [updated, ...storeState.attendance]
    }
    this.addAuditLog('HR', 'ATTENDANCE_MARK', `Attendance logged for ${updated.employeeName} (${updated.employeeId}) on ${date} as ${updated.status}`)
    notifyListeners()
    return updated
  },
  deleteAttendance(id) {
    const existing = storeState.attendance.find((a) => a.id === id)
    storeState.attendance = storeState.attendance.filter((a) => a.id !== id)
    if (existing) {
      this.addAuditLog('HR', 'ATTENDANCE_DELETE', `Removed attendance entry for ${existing.employeeName} on ${existing.date}`)
    }
    notifyListeners()
    return true
  },

  // Leaves Workflow
  getLeaves() {
    return storeState.leaves
  },
  applyLeave(requestData, applicantUser = null) {
    const employees = storeState.employees || []
    
    // Resolve applicant
    const empId = requestData.employeeId || applicantUser?.employeeId || applicantUser?.id
    const applicantEmp = employees.find(
      (e) => String(e.id || e._id) === String(empId) || e.employeeId === empId || (applicantUser?.email && e.email === applicantUser.email)
    )

    const applicantRole =
      requestData.applicantRole ||
      applicantEmp?.role ||
      applicantUser?.role ||
      'employee'

    const employeeName =
      requestData.employeeName ||
      applicantEmp?.name ||
      applicantUser?.displayName ||
      applicantUser?.name ||
      'Employee'

    const department =
      requestData.department ||
      applicantEmp?.department ||
      applicantUser?.department ||
      'General'

    // Determine approver hierarchy based on applicant role:
    // 1. Employee -> Assigned Manager approves; Team Lead & Squad peers get notified (not to Admin)
    // 2. Team Lead -> Manager approves; Director gets notified (not to Admin)
    // 3. Manager -> Managing Director approves, then goes to HR Panel
    let status = 'pending_manager'
    let currentApproverRole = 'manager'
    let approverId = null
    let approverName = null
    let managerId = null
    let managerName = null
    let tlId = null
    let tlName = null

    const hasExplicitRole = Boolean(requestData.applicantRole || applicantUser?.role)

    if (requestData.status === 'approved') {
      status = 'approved'
      currentApproverRole = null
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
    }

    const newLeave = {
      id: `leave-${Date.now()}`,
      employeeId: empId,
      employeeName,
      department,
      applicantRole,
      leaveType: requestData.leaveType || 'casual',
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      days: Number(requestData.days) || 1,
      reason: requestData.reason,
      status: requestData.status || status,
      currentApproverRole,
      currentApproverId: approverId,
      currentApproverName: approverName,
      tlId: tlId || (applicantEmp?.managerId && employees.find(e => String(e.id) === String(applicantEmp.managerId))?.id) || null,
      tlName: tlName || (applicantEmp?.managerId && employees.find(e => String(e.id) === String(applicantEmp.managerId))?.name) || null,
      tlComment: null,
      tlDecisionAt: null,
      managerId: applicantRole === 'team_lead' ? approverId : (managerId || requestData.managerId || 'emp-r2'),
      managerName: applicantRole === 'team_lead' ? approverName : managerName,
      managerComment: requestData.managerComment || (requestData.status === 'approved' ? 'Direct HR Grant' : null),
      managerDecisionAt: null,
      directorId: 'emp-director',
      directorName: 'Managing Director',
      directorComment: null,
      directorDecisionAt: null,
      hrNotified: false,
      hrComment: requestData.hrComment || (requestData.status === 'approved' ? 'Approved by HR Operations' : null),
      createdAt: new Date().toISOString().split('T')[0],
    }
    storeState.leaves = [newLeave, ...storeState.leaves]

    // If applied as approved directly by HR, automatically reflect in attendance as on-leave
    if (newLeave.status === 'approved') {
      const today = '2026-09-30'
      if (newLeave.startDate <= today && newLeave.endDate >= today) {
        this.markAttendance({
          employeeId: newLeave.employeeId,
          employeeName: newLeave.employeeName,
          date: today,
          status: 'on-leave',
          checkIn: null,
          checkOut: null,
          totalHours: '0.0 hrs',
          notes: `Approved ${newLeave.leaveType} leave`,
        })
      }
      this.addNotification({
        title: 'Leave Granted',
        message: `${newLeave.employeeName}'s ${newLeave.days} day(s) ${newLeave.leaveType} leave was granted by HR.`,
        type: 'leave',
        recipientId: newLeave.employeeId,
      })
    } else if (!hasExplicitRole) {
      this.addNotification({
        title: 'New Leave Request',
        message: `${newLeave.employeeName} submitted a leave request pending manager review.`,
        type: 'leave',
        leaveId: newLeave.id,
        recipientId: newLeave.managerId,
        recipientRole: 'manager',
        metadata: { leaveId: newLeave.id },
      })
    } else if (applicantRole === 'manager' || applicantRole === 'revenue_growth_manager' || applicantRole === 'vertical_head') {
      // Manager leave -> Routed to Managing Director
      this.addNotification({
        title: 'Manager Leave Request for Executive Approval',
        message: `Department Manager ${newLeave.employeeName} (${newLeave.department}) has submitted a ${newLeave.days}-day leave request for your executive sign-off.`,
        type: 'leave',
        leaveId: newLeave.id,
        recipientId: 'emp-director',
        recipientRole: 'director',
        metadata: { leaveId: newLeave.id, applicantRole: 'manager' },
      })
    } else if (applicantRole === 'team_lead') {
      // TL leave -> Routed to their Manager
      this.addNotification({
        title: 'Team Lead Leave Request',
        message: `Team Lead ${newLeave.employeeName} (${newLeave.department}) has requested ${newLeave.days} days leave for your review and approval.`,
        type: 'leave',
        leaveId: newLeave.id,
        recipientId: newLeave.managerId,
        recipientRole: 'manager',
        excludeRoles: ['admin'], // NOT to admin!
        metadata: { leaveId: newLeave.id, applicantRole: 'team_lead' },
      })
    } else {
      // Regular employee leave -> Routed to assigned Manager for approval.
      // Team Lead receives info notice (not an actionable approval).
      this.addNotification({
        title: 'Employee Leave Request for Approval',
        message: `${newLeave.employeeName} (${newLeave.department}) submitted a ${newLeave.days}-day leave request awaiting your manager approval.`,
        type: 'leave',
        leaveId: newLeave.id,
        recipientId: newLeave.managerId,
        recipientRole: 'manager',
        excludeRoles: ['admin'],
        metadata: { leaveId: newLeave.id, applicantRole: 'employee', type: 'approval_request' },
      })
      if (newLeave.tlId) {
        this.addNotification({
          title: 'Squad Member Leave Notice',
          message: `${newLeave.employeeName} submitted a leave request pending Manager approval.`,
          type: 'info_notice',
          leaveId: newLeave.id,
          recipientId: newLeave.tlId,
          recipientRole: 'team_lead',
          metadata: { leaveId: newLeave.id, applicantRole: 'employee', type: 'info_notice' },
        })
      }
    }

    this.addAuditLog(employeeName, 'LEAVE_APPLY', `Applied for ${newLeave.days} day(s) ${newLeave.leaveType} leave (${newLeave.status})`)
    notifyListeners()
    return newLeave
  },
  approveLeave(leaveId, reviewerRole = 'manager', comment = 'Approved.', approverUser = null) {
    const employees = storeState.employees || []
    const req = storeState.leaves.find((l) => l.id === leaveId)
    if (!req) return null

    const timestamp = new Date().toISOString()
    const approverName = approverUser?.name || approverUser?.displayName || reviewerRole.toUpperCase()

    // Find applicant employee & reporting line
    const applicantEmp = employees.find(
      (e) => String(e.id || e._id) === String(req.employeeId) || e.employeeId === req.employeeId
    )

    // Department manager lookup
    const deptManager = employees.find(e => e.role === 'manager' && e.department === req.department)
      || (applicantEmp?.managerId && employees.find(e => String(e.id || e._id) === String(applicantEmp.managerId)))
      || null

    // Managing Director lookup
    const directorEmp = employees.find(e => e.role === 'director' || e.role === 'managing_director')
      || null

    // Team lead lookup
    const teamLeadEmp = (applicantEmp?.managerId && employees.find(e => String(e.id || e._id) === String(applicantEmp.managerId)))
      || (req.tlId ? { id: req.tlId, name: req.tlName || 'Team Lead' } : null)

    // Check which tier is approving:
    // Case 1: Employee leave approved by Team Lead (pending_tl -> approved)
    if (reviewerRole === 'team_lead' || req.status === 'pending_tl') {
      storeState.leaves = storeState.leaves.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: 'approved',
              tlComment: comment,
              tlDecisionAt: timestamp,
              tlName: approverName,
              tlApprovedBy: approverName,
            }
          : l
      )

      // 1. Notify Employee
      this.addNotification({
        title: 'Leave Approved by Team Lead',
        message: `Your leave request (${req.days} days, ${req.startDate} to ${req.endDate}) was approved by Team Lead ${approverName}.`,
        type: 'leave',
        leaveId,
        recipientId: req.employeeId,
        metadata: { leaveId },
      })

      // 2. Notify their Manager (NOT to Admin!)
      this.addNotification({
        title: 'Team Member Leave Approved by Team Lead',
        message: `Team Lead ${approverName} approved ${req.days} day(s) leave for ${req.employeeName} (${req.startDate} to ${req.endDate}).`,
        type: 'leave',
        leaveId,
        recipientId: deptManager?.id || 'manager-1',
        recipientRole: 'manager',
        excludeRoles: ['admin'], // NOT to admin!
        metadata: { leaveId },
      })

      // 3. Notify Director (NOT to Admin!)
      this.addNotification({
        title: 'Department Leave Notice (Approved by Team Lead)',
        message: `${req.employeeName} (${req.department}) leave approved by TL ${approverName} (Manager: ${deptManager?.name || 'Manager'}).`,
        type: 'leave',
        leaveId,
        recipientId: directorEmp?.id || 'director-1',
        recipientRole: 'director',
        excludeRoles: ['admin'], // NOT to admin!
        metadata: { leaveId },
      })
    }
    // Case 2: Employee or Team Lead leave approved by Manager (pending_manager -> approved)
    else if (
      reviewerRole === 'manager' ||
      req.status === 'pending_manager' ||
      req.currentApproverRole === 'manager'
    ) {
      const isEmployeeApplicant = req.applicantRole === 'employee' || !req.applicantRole

      storeState.leaves = storeState.leaves.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: 'approved',
              managerComment: comment,
              managerDecisionAt: timestamp,
              managerName: approverName,
              managerApprovedBy: approverName,
            }
          : l
      )

      if (isEmployeeApplicant) {
        // 1. Notify Employee
        this.addNotification({
          title: 'Leave Approved by Manager',
          message: `Your leave request (${req.days} days, ${req.startDate} to ${req.endDate}) was approved by Manager ${approverName}.`,
          type: 'leave',
          leaveId,
          recipientId: req.employeeId,
          metadata: { leaveId },
        })

        // 2. Notify Director (NOT to Admin!)
        this.addNotification({
          title: 'Department Leave Notice (Approved by Manager)',
          message: `${req.employeeName} (${req.department}) leave request approved by Manager ${approverName}.`,
          type: 'leave',
          leaveId,
          recipientId: directorEmp?.id || 'director-1',
          recipientRole: 'director',
          excludeRoles: ['admin'], // NOT to admin!
          metadata: { leaveId },
        })

        // 3. Notify Team Lead that employee is on approved leave
        this.addNotification({
          title: 'Team Member On Leave (Manager Approved)',
          message: `Leave notice: Your team member ${req.employeeName} is on approved leave from ${req.startDate} to ${req.endDate}. Approved by Manager ${approverName}.`,
          type: 'leave',
          leaveId,
          recipientId: req.tlId || teamLeadEmp?.id || 'tl-1',
          recipientRole: 'team_lead',
          excludeRoles: ['admin'], // NOT to admin!
          metadata: { leaveId },
        })

        // 4. Notify Squad members that employee is on approved leave
        const squadMembers = employees.filter((e) => {
          if (String(e.id || e._id) === String(req.employeeId) || e.employeeId === req.employeeId) return false
          if (['admin', 'hr', 'director', 'managing_director', 'manager'].includes(e.role)) return false
          if (req.tlId && (String(e.managerId) === String(req.tlId) || e.managerId === req.tlId || String(e.teamLeadId) === String(req.tlId))) {
            return true
          }
          if (req.managerId && (String(e.managerId) === String(req.managerId) || e.managerId === req.managerId)) {
            return true
          }
          if (e.department && req.department && e.department === req.department) {
            return true
          }
          return false
        })

        squadMembers.forEach((peer) => {
          this.addNotification({
            title: 'Squad Member on Approved Leave',
            message: `${req.employeeName} (${req.department}) is on approved leave from ${req.startDate} to ${req.endDate}. Please coordinate squad coverage.`,
            type: 'leave',
            leaveId,
            recipientId: peer.id || peer._id || peer.employeeId,
            recipientRole: peer.role || 'employee',
            excludeRoles: ['admin'],
            metadata: { leaveId, type: 'squad_notice' },
          })
        })
      } else {
        // Team Lead applicant:
        // 1. Notify Team Lead
        this.addNotification({
          title: 'Leave Approved by Manager',
          message: `Your leave request (${req.days} days, ${req.startDate} to ${req.endDate}) was approved by Manager ${approverName}.`,
          type: 'leave',
          leaveId,
          recipientId: req.employeeId,
          metadata: { leaveId },
        })

        // 2. Director will get notified (NOT to Admin!)
        this.addNotification({
          title: 'TL Leave Approved by Manager',
          message: `Manager ${approverName} has approved leave for Team Lead ${req.employeeName} (${req.department}, ${req.days} days).`,
          type: 'leave',
          leaveId,
          recipientId: directorEmp?.id || 'director-1',
          recipientRole: 'director',
          excludeRoles: ['admin'], // NOT to admin!
          metadata: { leaveId },
        })
      }
    }
    // Case 3: Manager leave approved by Managing Director (pending_director -> approved -> HR Panel)
    else if (reviewerRole === 'director' || req.status === 'pending_director') {
      storeState.leaves = storeState.leaves.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: 'approved',
              directorComment: comment,
              directorDecisionAt: timestamp,
              directorName: approverName,
              directorApprovedBy: approverName,
              hrNotified: true,
            }
          : l
      )

      // 1. Notify Manager
      this.addNotification({
        title: 'Leave Approved by Managing Director',
        message: `Managing Director ${approverName} has approved your leave request for ${req.days} day(s) (${req.startDate} to ${req.endDate}).`,
        type: 'leave',
        leaveId,
        recipientId: req.employeeId,
        metadata: { leaveId },
      })

      // 2. GOES TO HR PANEL!
      this.addNotification({
        title: '[HR Panel Action] Executive Manager Leave Approved',
        message: `Managing Director has approved ${req.days}-day leave for Manager ${req.employeeName} (${req.department}). Added to HR Panel records for payroll & attendance adjustments.`,
        type: 'leave_hr',
        leaveId,
        recipientRole: 'hr',
        recipientId: 'emp-4',
        isHrActionRequired: true,
        metadata: { leaveId, isHrActionRequired: true, managerName: req.employeeName },
      })
    }
    // Case 4: Final HR approval
    else {
      storeState.leaves = storeState.leaves.map((l) =>
        l.id === leaveId
          ? {
              ...l,
              status: 'approved',
              hrComment: comment,
            }
          : l
      )

      this.addNotification({
        title: 'Leave Approved by HR',
        message: `Leave request for ${req.employeeName} was fully approved by HR Operations.`,
        type: 'leave',
        recipientId: req.employeeId,
      })
    }

    const updated = storeState.leaves.find((l) => l.id === leaveId)

    // Mark attendance if in range and approved
    if (updated?.status === 'approved') {
      const today = '2026-09-30'
      if (updated.startDate <= today && updated.endDate >= today) {
        this.markAttendance({
          employeeId: updated.employeeId,
          employeeName: updated.employeeName,
          date: today,
          status: 'on-leave',
          checkIn: null,
          checkOut: null,
          totalHours: '0.0 hrs',
          notes: `Approved ${updated.leaveType} leave`,
        })
      }
    }

    this.addAuditLog(reviewerRole.toUpperCase(), 'LEAVE_APPROVE', `Leave ${leaveId} approved (${reviewerRole})`)
    notifyListeners()
    return updated
  },
  rejectLeave(leaveId, roleOrReason = 'hr', maybeReason = 'Declined due to critical delivery deadline.', rejectorUser = null) {
    const isRole = ['team_lead', 'manager', 'director', 'hr', 'admin'].includes(roleOrReason)
    const reviewerRole = isRole ? roleOrReason : 'manager'
    const reason = isRole ? maybeReason : roleOrReason
    const req = storeState.leaves.find((l) => l.id === leaveId)
    if (!req) return null

    const approverName = rejectorUser?.name || rejectorUser?.displayName || reviewerRole.toUpperCase()

    storeState.leaves = storeState.leaves.map((l) => {
      if (l.id === leaveId) {
        return {
          ...l,
          status: 'rejected',
          rejectionReason: reason,
          tlComment: reviewerRole === 'team_lead' ? reason : l.tlComment,
          managerComment: reviewerRole === 'manager' ? reason : l.managerComment,
          directorComment: reviewerRole === 'director' ? reason : l.directorComment,
          hrComment: reviewerRole === 'hr' ? reason : l.hrComment,
        }
      }
      return l
    })

    // Notify applicant
    this.addNotification({
      title: 'Leave Request Rejected',
      message: `Your leave request was declined by ${approverName} (${reviewerRole.replace('_', ' ')}). Reason: ${reason}`,
      type: 'leave',
      recipientId: req.employeeId,
    })

    // If Manager rejected an employee or TL request -> Notify TL (if squad member) and Director (not to admin)
    if (reviewerRole === 'manager' || req.status === 'pending_manager') {
      if (req.tlId) {
        this.addNotification({
          title: 'Squad Member Leave Request Declined',
          message: `Manager ${approverName} declined leave request for squad member ${req.employeeName}. Reason: ${reason}`,
          type: 'leave',
          leaveId: req.id,
          recipientId: req.tlId,
          recipientRole: 'team_lead',
          excludeRoles: ['admin'],
          metadata: { leaveId: req.id },
        })
      }
      this.addNotification({
        title: 'Department Leave Declined Notice',
        message: `Manager ${approverName} declined leave request for ${req.employeeName}. Reason: ${reason}`,
        type: 'leave',
        leaveId: req.id,
        recipientRole: 'director',
        excludeRoles: ['admin'],
        metadata: { leaveId: req.id },
      })
    }
    // If TL rejected an employee request -> Manager and Director get notified (not to admin)
    else if (reviewerRole === 'team_lead') {
      this.addNotification({
        title: 'Team Leave Declined by TL',
        message: `Team Lead ${approverName} declined leave request for ${req.employeeName}. Reason: ${reason}`,
        type: 'leave',
        recipientRole: 'manager',
        excludeRoles: ['admin'],
      })
      this.addNotification({
        title: 'Department Leave Declined Notice',
        message: `Team Lead ${approverName} declined leave request for ${req.employeeName}. Reason: ${reason}`,
        type: 'leave',
        recipientRole: 'director',
        excludeRoles: ['admin'],
      })
    }
    // If Director rejected a Manager request -> HR Panel gets notified
    else if (reviewerRole === 'director' || req.applicantRole === 'manager') {
      this.addNotification({
        title: '[HR Record] Manager Leave Declined by Director',
        message: `Managing Director declined leave request for Manager ${req.employeeName}. Reason: ${reason}`,
        type: 'leave_hr',
        recipientRole: 'hr',
      })
    }

    this.addAuditLog(reviewerRole.toUpperCase(), 'LEAVE_REJECT', `Leave ${leaveId} rejected (${reason})`)
    notifyListeners()
    return storeState.leaves.find((l) => l.id === leaveId)
  },
  deleteLeave(leaveId) {
    const existing = storeState.leaves.find((l) => l.id === leaveId)
    storeState.leaves = storeState.leaves.filter((l) => l.id !== leaveId)
    if (existing) {
      this.addAuditLog('HR', 'LEAVE_DELETE', `Deleted leave request ${leaveId} for ${existing.employeeName}`)
      this.addNotification({
        title: 'Leave Request Deleted',
        message: `Leave request for ${existing.employeeName} was removed.`,
        type: 'leave',
      })
    }
    notifyListeners()
    return true
  },
  cancelLeave(leaveId, cancelReason = 'Cancelled by applicant') {
    const existing = storeState.leaves.find((l) => l.id === leaveId || l._id === leaveId)
    if (!existing) return false
    storeState.leaves = storeState.leaves.map((l) => {
      if (l.id === leaveId || l._id === leaveId) {
        return {
          ...l,
          status: 'cancelled',
          cancellationReason: cancelReason,
        }
      }
      return l
    })
    this.addAuditLog('EMPLOYEE', 'LEAVE_CANCEL', `Leave ${leaveId} cancelled`)
    this.addNotification({
      title: 'Leave Request Cancelled',
      message: `Your leave request for ${existing.startDate} to ${existing.endDate} was cancelled.`,
      type: 'leave',
      recipientId: existing.employeeId,
    })
    notifyListeners()
    return true
  },

  // Tasks
  getTasks() {
    return storeState.tasks
  },
  addTask(taskData) {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      assigneeId: taskData.assigneeId,
      assigneeName: taskData.assigneeName,
      priority: taskData.priority || 'Medium',
      status: 'todo',
      dueDate: taskData.dueDate || '2026-10-15',
      category: taskData.category || 'General',
    }
    storeState.tasks = [newTask, ...storeState.tasks]
    this.addNotification({
      title: 'New Task Assigned',
      message: `Task assigned: "${newTask.title}" (Due: ${newTask.dueDate})`,
      type: 'task',
    })
    notifyListeners()
    return newTask
  },
  updateTaskStatus(taskId, status) {
    storeState.tasks = storeState.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
    notifyListeners()
  },

  // Daily Work Report
  getDailyReports() {
    return storeState.dailyReports
  },
  submitDailyReport(reportData) {
    const newReport = {
      id: `dwr-${Date.now()}`,
      employeeId: reportData.employeeId,
      employeeName: reportData.employeeName,
      date: reportData.date || new Date().toISOString().split('T')[0],
      hoursLogged: Number(reportData.hoursLogged) || 8,
      tasksSummary: reportData.tasksSummary,
      challenges: reportData.challenges || 'None reported',
      tomorrowPlan: reportData.tomorrowPlan,
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    storeState.dailyReports = [newReport, ...storeState.dailyReports]
    this.addNotification({
      title: 'Daily Work Report Submitted',
      message: `Logged ${newReport.hoursLogged} hours for today with summary and plan.`,
      type: 'report',
    })
    this.addAuditLog(reportData.employeeName, 'DAILY_REPORT_SUBMIT', `Submitted daily work report (${newReport.hoursLogged} hrs)`)
    notifyListeners()
    return newReport
  },
  deleteDailyReport(id) {
    storeState.dailyReports = (storeState.dailyReports || []).filter((r) => r.id !== id && r._id !== id)
    this.addAuditLog('System', 'DAILY_REPORT_DELETE', `Deleted daily report record ${id}`)
    notifyListeners()
    return true
  },

  // Training & Quiz
  getCourses() {
    return storeState.courses
  },
  updateCourseProgress(courseId, progress = 100) {
    storeState.courses = storeState.courses.map((c) => {
      if (c.id === courseId) {
        const isDone = progress >= 100
        return {
          ...c,
          progress,
          status: isDone ? 'Completed' : 'In Progress',
          completed: isDone,
        }
      }
      return c
    })
    notifyListeners()
    return storeState.courses.find((c) => c.id === courseId)
  },
  completeCourseQuiz(courseId, score = '100%') {
    storeState.courses = storeState.courses.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          progress: 100,
          completed: true,
          quizScore: score,
          certificateUrl: `CERT-EDU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        }
      }
      return c
    })
    this.addNotification({
      title: 'Course Completed & Certificate Issued!',
      message: `Congratulations! You scored ${score} and unlocked your official certificate.`,
      type: 'training',
    })
    notifyListeners()
  },

  // Help Desk
  getTickets() {
    return storeState.tickets
  },
  createHelpDeskTicket(ticketData) {
    return this.createTicket(ticketData)
  },
  createTicket(ticketData) {
    const newTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: ticketData.employeeId,
      employeeName: ticketData.employeeName,
      subject: ticketData.subject,
      category: ticketData.category || 'IT Support',
      priority: ticketData.priority || 'Medium',
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: ticketData.category === 'IT Support' ? 'IT Desk' : 'HR Ops Desk',
      responses: [{ sender: ticketData.employeeName, text: ticketData.description, time: 'Just now' }],
    }
    storeState.tickets = [newTicket, ...storeState.tickets]
    this.addNotification({
      title: 'Support Ticket Created',
      message: `Ticket #${newTicket.id} (${newTicket.category}) is open and assigned.`,
      type: 'ticket',
    })
    this.addAuditLog(ticketData.employeeName, 'TICKET_CREATE', `Created ticket #${newTicket.id}: ${newTicket.subject}`)
    notifyListeners()
    return newTicket
  },
  updateTicketStatus(ticketId, status) {
    storeState.tickets = (storeState.tickets || []).map((t) => (t.id === ticketId || t._id === ticketId) ? { ...t, status } : t)
    notifyListeners()
  },
  replyToTicket(ticketId, responseText, senderName = 'HR Support') {
    storeState.tickets = (storeState.tickets || []).map((t) => {
      if (t.id === ticketId || t._id === ticketId) {
        const responses = Array.isArray(t.responses) ? [...t.responses] : []
        responses.push({
          sender: senderName,
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        return { ...t, responses }
      }
      return t
    })
    notifyListeners()
  },

  // Announcements
  getAnnouncements() {
    return storeState.announcements
  },
  createAnnouncement(annData) {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title: annData.title,
      category: annData.category || 'News',
      priority: annData.priority || 'Normal',
      targetAudience: annData.targetAudience || 'All Employees',
      content: annData.content,
      date: new Date().toISOString().split('T')[0],
      author: annData.author || 'HR Management',
      likes: 0,
      pinned: !!annData.pinned,
    }
    storeState.announcements = [newAnn, ...storeState.announcements]
    this.addNotification({
      title: 'Company Announcement',
      message: `${newAnn.title} - ${newAnn.author}`,
      type: 'announcement',
    })
    this.addAuditLog(annData.author, 'ANNOUNCEMENT_CREATE', `Published announcement: ${newAnn.title}`)
    notifyListeners()
    return newAnn
  },
  likeAnnouncement(annId) {
    storeState.announcements = storeState.announcements.map((a) => a.id === annId ? { ...a, likes: a.likes + 1 } : a)
    notifyListeners()
  },
  updateAnnouncement(id, updates) {
    storeState.announcements = storeState.announcements.map((a) =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    )
    this.addAuditLog('HR', 'ANNOUNCEMENT_UPDATE', `Updated announcement: ${updates.title || id}`)
    notifyListeners()
  },
  deleteAnnouncement(id) {
    const ann = storeState.announcements.find((a) => a.id === id)
    storeState.announcements = storeState.announcements.filter((a) => a.id !== id)
    this.addAuditLog('HR', 'ANNOUNCEMENT_DELETE', `Deleted announcement: ${ann?.title || id}`)
    notifyListeners()
  },
  togglePinAnnouncement(id) {
    storeState.announcements = storeState.announcements.map((a) =>
      a.id === id ? { ...a, pinned: !a.pinned } : a
    )
    notifyListeners()
  },

  // Company Documents
  getDocuments() {
    return storeState.documents
  },

  // Holiday Calendar
  getHolidays() {
    return storeState.holidays
  },

  // Recruitment
  getRequisitions() {
    return storeState.requisitions
  },
  addRequisition(reqData) {
    const newReq = {
      id: `req-${Date.now()}`,
      title: reqData.title,
      department: reqData.department,
      location: reqData.location || 'San Francisco (Hybrid)',
      openings: Number(reqData.openings) || 1,
      applicants: 0,
      stage: 'Screening',
      status: 'Active',
    }
    storeState.requisitions = [newReq, ...storeState.requisitions]
    notifyListeners()
    return newReq
  },

  // Expense Claims
  getExpenses() {
    return storeState.expenses
  },
  submitExpense(expenseData) {
    const newExp = {
      id: `exp-${Date.now()}`,
      employeeId: expenseData.employeeId,
      employeeName: expenseData.employeeName,
      category: expenseData.category,
      amount: Number(expenseData.amount) || 0,
      merchant: expenseData.merchant,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      status: 'submitted',
      comments: expenseData.comments,
      notes: expenseData.notes || expenseData.comments,
      attachmentUrl: expenseData.attachmentUrl || null,
      attachmentName: expenseData.attachmentName || null,
      attachmentType: expenseData.attachmentType || null,
      attachmentSize: expenseData.attachmentSize || null,
    }
    storeState.expenses = [newExp, ...storeState.expenses]
    this.addNotification({
      title: 'Expense Claim Submitted',
      message: `Claim for ₹${newExp.amount.toFixed(2)} (${newExp.category}) submitted for approval with proof attachment.`,
      type: 'expense',
    })
    notifyListeners()
    return newExp
  },
  deleteExpense(id) {
    storeState.expenses = (storeState.expenses || []).filter((e) => e.id !== id && e._id !== id)
    this.addAuditLog('System', 'EXPENSE_DELETE', `Deleted expense reimbursement claim ${id}`)
    notifyListeners()
    return true
  },

  // Rewards & Kudos
  getKudos() {
    return storeState.kudos
  },
  sendKudos(kudosData) {
    const newKudos = {
      id: `kud-${Date.now()}`,
      from: kudosData.from,
      to: kudosData.to,
      badge: kudosData.badge || 'Team Player',
      message: kudosData.message,
      date: 'Just now',
    }
    storeState.kudos = [newKudos, ...storeState.kudos]
    this.addNotification({
      title: 'Kudos Received!',
      message: `${kudosData.from} sent kudos to ${kudosData.to}: "${newKudos.badge}"`,
      type: 'kudos',
    })
    notifyListeners()
    return newKudos
  },

  // Notifications
  getNotifications(viewerUser = null) {
    if (!viewerUser) return storeState.notifications
    return this.getUserNotifications(viewerUser)
  },
  getUserNotifications(viewerUser) {
    if (!viewerUser) return storeState.notifications
    const role = viewerUser.role
    const uid = String(viewerUser.id || viewerUser._id || '')
    const empId = String(viewerUser.employeeId || '')

    return storeState.notifications.filter((n) => {
      // If notification explicitly excludes this role (e.g. ['admin'] for employee/TL leave)
      if (Array.isArray(n.excludeRoles) && n.excludeRoles.includes(role)) {
        return false
      }
      // If notification has a specific recipient ID
      if (n.recipientId) {
        const rId = String(n.recipientId)
        if (rId === uid || rId === empId) return true
        if (n.recipientRole && n.recipientRole === role) return true
        return false
      }
      // If notification is scoped to a specific recipient role
      if (n.recipientRole) {
        return n.recipientRole === role
      }
      // Broadcast / global notification (unless excluded)
      return true
    })
  },
  addNotification(notif) {
    const item = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: notif.title,
      message: notif.message,
      time: notif.time || 'Just now',
      type: notif.type || 'info',
      read: false,
      recipientId: notif.recipientId || null,
      recipientRole: notif.recipientRole || null,
      excludeRoles: notif.excludeRoles || null,
      leaveId: notif.leaveId || notif.metadata?.leaveId || null,
      isHrActionRequired: Boolean(notif.isHrActionRequired || notif.metadata?.isHrActionRequired),
      metadata: notif.metadata || null,
      createdAt: new Date().toISOString(),
    }
    storeState.notifications = [item, ...storeState.notifications]
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_CLEARED_NOTIFICATIONS_KEY)
      } catch (err) {
        console.warn(err)
      }
    }
    notifyListeners()
  },
  markNotificationRead(id) {
    storeState.notifications = storeState.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    notifyListeners()
  },
  markAllNotificationsRead() {
    storeState.notifications = storeState.notifications.map((n) => ({ ...n, read: true }))
    notifyListeners()
  },
  deleteNotification(id) {
    storeState.notifications = storeState.notifications.filter((n) => n.id !== id)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const deletedRaw = window.localStorage.getItem(STORAGE_DELETED_NOTIFICATIONS_KEY)
        const deleted = deletedRaw ? JSON.parse(deletedRaw) : []
        if (!deleted.includes(id)) {
          deleted.push(id)
          window.localStorage.setItem(STORAGE_DELETED_NOTIFICATIONS_KEY, JSON.stringify(deleted))
        }
        window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications))
      } catch (err) {
        console.warn(err)
      }
    }
    notifyListeners()
  },
  clearAllNotifications() {
    storeState.notifications = []
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_CLEARED_NOTIFICATIONS_KEY, 'true')
        window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify([]))
      } catch (err) {
        console.warn(err)
      }
    }
    notifyListeners()
  },
  toggleNotificationRead(id) {
    storeState.notifications = storeState.notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    )
    notifyListeners()
  },

  // Company Settings & Wi-Fi Configuration
  getCompanySettings() {
    return storeState.companySettings
  },
  addWifiSSID(ssid, branchName = '', actor = 'Admin', options = {}) {
    if (!ssid) return
    const cleanSSID = ssid.trim()
    if (!cleanSSID) return
    const bssid = (options.bssid || '').toUpperCase().trim()
    const securityType = options.securityType || 'WPA2-Enterprise'
    const allowedIPs = options.allowedIPs && options.allowedIPs.length ? options.allowedIPs : ['127.0.0.1', '::1']
    if (!storeState.companySettings.allowedWifiSSIDs.includes(cleanSSID)) {
      storeState.companySettings.allowedWifiSSIDs = [...storeState.companySettings.allowedWifiSSIDs, cleanSSID]
    }
    const resolvedBranch = branchName || storeState.companySettings?.locations?.[0]?.name || 'Bengaluru HQ'
    const existingNetworks = storeState.companySettings.wifiNetworks || []
    const existing = existingNetworks.find((n) => n.ssid === cleanSSID)
    if (existing) {
      // Update fingerprint details for an already-registered SSID
      storeState.companySettings.wifiNetworks = existingNetworks.map((n) =>
        n.ssid === cleanSSID
          ? { ...n, bssid: bssid || n.bssid, securityType, branchName: resolvedBranch, allowedIPs }
          : n
      )
    } else {
      storeState.companySettings.wifiNetworks = [
        ...existingNetworks,
        {
          id: `wn-${Date.now()}`,
          ssid: cleanSSID,
          bssid,
          securityType,
          branchName: resolvedBranch,
          allowedIPs,
          status: 'active',
          addedAt: new Date().toISOString().split('T')[0],
          addedBy: actor,
        },
      ]
    }
    this.addAuditLog(actor, 'WIFI_SSID_ADD', `Registered office Wi-Fi: ${cleanSSID} (BSSID: ${bssid || 'n/a'}, ${securityType}) for branch ${branchName}`)
    notifyListeners()
  },
  removeWifiSSID(ssid, actor = 'Admin') {
    storeState.companySettings.allowedWifiSSIDs = storeState.companySettings.allowedWifiSSIDs.filter((s) => s !== ssid)
    storeState.companySettings.wifiNetworks = (storeState.companySettings.wifiNetworks || []).filter((n) => n.ssid !== ssid)
    this.addAuditLog(actor, 'WIFI_SSID_REMOVE', `Removed office Wi-Fi network: ${ssid}`)
    notifyListeners()
  },

  // Office network (public IP) registry — the real, browser-verifiable network signal.
  getOfficeNetworkIPs() {
    return storeState.companySettings.officeNetworkIPs || []
  },
  isOfficeNetworkIP(ip) {
    if (!ip) return false
    const clean = String(ip).trim().replace(/^::ffff:/, '').toLowerCase()
    return (storeState.companySettings.officeNetworkIPs || []).some((entry) => {
      let allow = String(entry.ip || '').trim().replace(/^::ffff:/, '').toLowerCase()
      if (allow === clean) return true
      if (allow === '::1' && (clean === '127.0.0.1' || clean === 'localhost')) return true
      if (allow === '127.0.0.1' && (clean === '127.0.0.1' || clean === 'localhost')) return true
      if (/\.\*$/.test(allow) || /\.x$/i.test(allow)) {
        allow = allow.replace(/(\.[\*x])$/i, '.0/24')
      }
      if (allow.includes('/') && clean.includes('.')) {
        const [base] = allow.split('/')
        const bParts = base.split('.')
        const cParts = clean.split('.')
        if (bParts.length >= 3 && cParts.length >= 3 && bParts[0] === cParts[0] && bParts[1] === cParts[1] && bParts[2] === cParts[2]) {
          return true
        }
      }
      if (allow.includes('.') && clean.includes('.')) {
        const aParts = allow.split('.')
        const cParts = clean.split('.')
        if (aParts.length === 4 && cParts.length === 4 && aParts[0] === cParts[0] && aParts[1] === cParts[1] && aParts[2] === cParts[2]) {
          // If first 3 octets match (e.g. 192.168.1.* or 10.0.0.* on private subnets)
          return true
        }
      }
      return false
    })
  },
  addOfficeNetworkIP(ip, label = 'Office Network', actor = 'Admin') {
    const clean = String(ip || '').trim()
    if (!clean) return false
    const existing = storeState.companySettings.officeNetworkIPs || []
    if (existing.some((e) => String(e.ip).trim().toLowerCase() === clean.toLowerCase())) {
      this.addAuditLog(actor, 'NETWORK_IP_EXISTS', `Office network IP already registered: ${clean}`)
      notifyListeners()
      return false
    }
    storeState.companySettings.officeNetworkIPs = [
      ...existing,
      { ip: clean, label: label || 'Office Network', addedAt: new Date().toISOString().split('T')[0], addedBy: actor },
    ]
    this.addAuditLog(actor, 'NETWORK_IP_ADD', `Registered office network public IP ${clean} (${label})`)
    notifyListeners()
    return true
  },
  removeOfficeNetworkIP(ip, actor = 'Admin') {
    const clean = String(ip || '').trim().toLowerCase()
    storeState.companySettings.officeNetworkIPs = (storeState.companySettings.officeNetworkIPs || []).filter(
      (e) => String(e.ip).trim().toLowerCase() !== clean
    )
    this.addAuditLog(actor, 'NETWORK_IP_REMOVE', `Removed office network public IP ${ip}`)
    notifyListeners()
  },

  // Audit Logs
  getAuditLogs() {
    return storeState.auditLogs
  },
  addAuditLog(actor, action, details) {
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor,
      action,
      details,
    }
    storeState.auditLogs = [logItem, ...(storeState.auditLogs || []).slice(0, 99)]
  },

  // Payroll & Payslips Management (INR)
  getPayrollRecords() {
    return storeState.payroll || []
  },
  getPayrollRecord(id) {
    return (storeState.payroll || []).find((p) => p.id === id)
  },
  savePayrollRecord(record) {
    const existingIndex = (storeState.payroll || []).findIndex(
      (p) =>
        (record.id && (p.id === record.id || p._id === record.id)) ||
        (p.month === record.month && (
          String(p.employeeId).toUpperCase() === String(record.employeeId || '').toUpperCase() ||
          String(p.employeeRef || '') === String(record.employeeRef || record.employeeId || '')
        ))
    )
    let savedRecord
    if (existingIndex >= 0) {
      savedRecord = { ...storeState.payroll[existingIndex], ...record, id: storeState.payroll[existingIndex].id }
      storeState.payroll[existingIndex] = savedRecord
    } else {
      savedRecord = {
        ...record,
        id: record.id || `pay-${record.employeeId || 'custom'}-${Date.now()}`,
      }
      storeState.payroll = [savedRecord, ...(storeState.payroll || [])]
    }
    this.addAuditLog(
      'HR',
      'PAYROLL_SAVE',
      `Saved/Updated payslip for ${savedRecord.employeeName || 'Employee'} (${savedRecord.employeeId || 'N/A'}) - ${savedRecord.month || 'Current Period'}`
    )
    notifyListeners()
    return savedRecord
  },
  deletePayrollRecord(id) {
    storeState.payroll = (storeState.payroll || []).filter((p) => p.id !== id)
    this.addAuditLog('HR', 'PAYROLL_DELETE', `Deleted payroll entry ${id}`)
    notifyListeners()
  },
  executePayrollRun(month = 'September 2026') {
    storeState.payroll = (storeState.payroll || []).map((p) =>
      p.month === month ? { ...p, status: 'processed', paymentDate: new Date().toISOString().split('T')[0] } : p
    )
    this.addNotification({
      title: `${month} Payroll Disbursed`,
      message: `Direct bank transfers initiated for ${storeState.payroll.length} employees with statutory PF, ESI, and tax deductions.`,
      type: 'salary',
    })
    this.addAuditLog('HR', 'PAYROLL_EXECUTE', `Executed and disbursed company-wide payroll for ${month}`)
    notifyListeners()
  },
  async bulkGeneratePayroll({ month, employeeIds, department }) {
    const employees = storeState.employees || []
    const targetEmployees = employees.filter((emp) => {
      if (emp.status === 'inactive') return false
      if (department && department !== 'all' && emp.department !== department) return false
      if (Array.isArray(employeeIds) && employeeIds.length > 0) {
        const matchesId = employeeIds.some((id) =>
          String(id).toUpperCase() === String(emp.employeeId || '').toUpperCase() ||
          String(id) === String(emp.id || '') ||
          String(id) === String(emp._id || '')
        )
        if (!matchesId) return false
      }
      return true
    })

    if (targetEmployees.length === 0) {
      throw new Error('No eligible active employees match the selected criteria.')
    }

    let createdCount = 0
    let updatedCount = 0
    const updatedPayroll = [...(storeState.payroll || [])]

    targetEmployees.forEach((emp) => {
      const annualSalary = Number(emp.salary) || 400000
      const monthlyGross = Math.round(annualSalary / 12)
      const struct = emp.salaryStructure || {}
      const hasStruct = Boolean(
        struct && (
          struct.basic !== undefined ||
          struct.hra !== undefined ||
          struct.ca !== undefined ||
          struct.conveyance !== undefined ||
          struct.sa !== undefined ||
          struct.specialAllowance !== undefined ||
          struct.oa !== undefined ||
          struct.otherAllowance !== undefined
        )
      )

      const basic = hasStruct && struct.basic !== undefined
        ? Math.max(0, Number(struct.basic) || 0)
        : Math.round(monthlyGross * 0.5)

      const hra = hasStruct && struct.hra !== undefined
        ? Math.max(0, Number(struct.hra) || 0)
        : Math.round(basic * 0.4)

      const conveyance = hasStruct && (struct.conveyance !== undefined || struct.ca !== undefined)
        ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0)
        : (monthlyGross > 8000 ? 1600 : Math.round(monthlyGross * 0.1))

      const specialAllowance = hasStruct && (struct.specialAllowance !== undefined || struct.sa !== undefined)
        ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0)
        : Math.round(monthlyGross * 0.15)

      const otherAllowance = hasStruct && (struct.otherAllowance !== undefined || struct.oa !== undefined)
        ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0)
        : Math.max(0, monthlyGross - basic - hra - conveyance - specialAllowance)

      const pf = Math.min(1800, Math.round(basic * 0.12))
      const professionalTax = 200

      const grossEarnings = basic + hra + conveyance + specialAllowance + otherAllowance
      const totalDeductions = pf + professionalTax
      const netPay = grossEarnings - totalDeductions

      const bankName = emp.bankDetails?.bankName || emp.bankName || 'HDFC Bank'
      const accountNumber = emp.bankDetails?.accountNumber || emp.accountNumber || ''
      const ifscCode = emp.bankDetails?.ifscCode || emp.ifscCode || ''
      const panTaxId = emp.bankDetails?.panTaxId || emp.panTaxId || ''
      const uanNumber = emp.bankDetails?.uanNumber || emp.uanNumber || ''

      const recordData = {
        employeeId: emp.employeeId || emp.id,
        employeeRef: emp._id || emp.id,
        employeeName: emp.name,
        designation: emp.designation || 'Specialist',
        department: emp.department || 'General',
        location: emp.location || 'Headquarters',
        month: month || 'October 2026',
        standardDays: 30,
        payableDays: 30,
        paidDays: 30,
        lopDays: 0,
        lopReversalDays: 0,
        arrearDays: 0,
        bankName,
        accountNumber,
        ifscCode,
        panTaxId,
        uanNumber,
        earningsList: [
          { name: 'Basic Salary', monthlyRate: basic, currentMonth: basic, arrear: 0, total: basic },
          { name: 'House Rent Allowance', monthlyRate: hra, currentMonth: hra, arrear: 0, total: hra },
          { name: 'Conveyance Allowance', monthlyRate: conveyance, currentMonth: conveyance, arrear: 0, total: conveyance },
          { name: 'Special Allowance', monthlyRate: specialAllowance, currentMonth: specialAllowance, arrear: 0, total: specialAllowance },
          { name: 'Other Allowance', monthlyRate: otherAllowance, currentMonth: otherAllowance, arrear: 0, total: otherAllowance },
        ],
        deductionsList: [
          { name: 'Provident Fund (P.F.)', amount: pf },
          { name: 'Professional Tax', amount: professionalTax },
        ],
        earnings: {
          basic,
          hra,
          conveyance,
          specialAllowance,
          otherAllowance,
        },
        deductions: {
          pf,
          professionalTax,
        },
        grossEarnings,
        totalDeductions,
        netPay,
        status: 'Processed',
        notes: 'Bulk generated payroll draft',
      }

      const existingIndex = updatedPayroll.findIndex(
        (p) =>
          (p.month === month) &&
          (String(p.employeeId).toUpperCase() === String(emp.employeeId || '').toUpperCase() ||
           String(p.employeeId) === String(emp.id) ||
           String(p.employeeRef) === String(emp._id || emp.id))
      )

      if (existingIndex >= 0) {
        updatedPayroll[existingIndex] = {
          ...updatedPayroll[existingIndex],
          ...recordData,
          id: updatedPayroll[existingIndex].id,
        }
        updatedCount++
      } else {
        const newRecord = {
          ...recordData,
          id: `pay-${emp.employeeId || emp.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        }
        updatedPayroll.unshift(newRecord)
        createdCount++
      }
    })

    storeState = {
      ...storeState,
      payroll: updatedPayroll,
    }

    this.addNotification({
      title: 'Bulk Payroll Generation Complete',
      message: `Generated/Updated ${createdCount + updatedCount} payslip(s) for ${month}.`,
      type: 'salary',
    })

    this.addAuditLog(
      'HR',
      'PAYROLL_BULK_GENERATE',
      `Bulk generated ${createdCount} new, updated ${updatedCount} existing payslips for ${month}`
    )

    notifyListeners()
    return {
      success: true,
      createdCount,
      updatedCount,
      message: `Successfully processed ${createdCount + updatedCount} payslip(s) (${createdCount} created, ${updatedCount} updated) for ${month}.`,
    }
  },

  // ---------------------------------------------------------
  // ORGANIZATION HIERARCHY METHODS
  // ---------------------------------------------------------
  getOrganizationHierarchy(rootId = null, filterDept = null, viewerUser = null) {
    const rawEmployees = storeState.employees || []
    const isExcluded = (emp) => {
      if (!emp) return false
      const role = String(emp.role || '').toLowerCase()
      const empId = String(emp.employeeId || '').toUpperCase()
      const id = String(emp.id || emp._id || '')
      const name = String(emp.name || '').trim().toLowerCase()
      return (
        empId === 'EDU-ADM-001' ||
        id === 'emp-3' ||
        id === 'user-admin-1' ||
        (role === 'admin' && (name === 'admin' || empId === 'EDU-ADM-001')) ||
        empId === 'EDU-HR-001' ||
        id === 'emp-4' ||
        (role === 'hr' && (name === 'hr' || empId === 'EDU-HR-001'))
      )
    }

    const employees = rawEmployees.filter((e) => !isExcluded(e))
    const byId = new Map()
    const childrenMap = new Map()

    employees.forEach((emp) => {
      const id = String(emp.id || emp._id)
      let effectiveManagerId = emp.managerId ? String(emp.managerId) : null
      if (effectiveManagerId === 'emp-3' || effectiveManagerId === 'EDU-ADM-001' || effectiveManagerId === 'emp-4' || effectiveManagerId === 'EDU-HR-001') {
        effectiveManagerId = null
      }
      byId.set(id, { ...emp, id, managerId: effectiveManagerId, children: [] })
      childrenMap.set(id, [])
    })

    employees.forEach((emp) => {
      if (emp.employeeId) byId.set(emp.employeeId, byId.get(String(emp.id || emp._id)))
    })

    employees.forEach((emp) => {
      const id = String(emp.id || emp._id)
      const node = byId.get(id)
      const mgrId = node?.managerId
      if (mgrId && byId.has(mgrId)) {
        const actualMgrId = String(byId.get(mgrId).id || byId.get(mgrId)._id)
        if (actualMgrId !== id) {
          if (!childrenMap.has(actualMgrId)) childrenMap.set(actualMgrId, [])
          childrenMap.get(actualMgrId).push(id)
        }
      }
    })

    function calculateTeamCounts(nodeId) {
      const node = byId.get(nodeId)
      if (!node) return { direct: 0, total: 0 }
      const childIds = childrenMap.get(nodeId) || []
      node.children = childIds.map((cid) => byId.get(cid)).filter(Boolean)
      node.directReportCount = node.children.length
      let total = node.children.length
      node.children.forEach((c) => {
        const childCount = calculateTeamCounts(String(c.id || c._id))
        total += childCount.total
      })
      node.totalTeamCount = total
      return { direct: node.directReportCount, total }
    }

    // Role-based visibility scoping rule:
    // Admin and HR can see the whole hierarchy.
    // Employee, TL, Manager, Director see the hierarchy scoped up to the level they are working under
    // (Employee sees TL -> Manager -> Director -> Admin root, plus immediate team/subordinates).
    const isFullAccess = !viewerUser || viewerUser.role === 'admin' || viewerUser.role === 'hr'

    if (!isFullAccess) {
      // Find viewer employee record
      const viewerId = String(viewerUser.id || viewerUser._id || '')
      const target = byId.get(viewerId) ||
        (viewerUser.employeeId && byId.get(viewerUser.employeeId)) ||
        employees.find((e) => (viewerUser.email && e.email && e.email.toLowerCase() === viewerUser.email.toLowerCase()))

      if (target) {
        const targetId = String(target.id || target._id)

        // 1. Upward reporting chain to top root
        const chain = []
        let curr = target
        const visitedChain = new Set()
        while (curr) {
          const cid = String(curr.id || curr._id)
          if (visitedChain.has(cid)) break
          visitedChain.add(cid)
          chain.unshift({ ...curr })
          if (!curr.managerId) break
          const mgr = byId.get(String(curr.managerId))
          if (!mgr) break
          curr = mgr
        }

        // 2. Downward subordinates
        const subordinateIds = new Set()
        function collectSubordinates(pId) {
          const directKids = childrenMap.get(pId) || []
          directKids.forEach((kidId) => {
            if (!subordinateIds.has(kidId)) {
              subordinateIds.add(kidId)
              collectSubordinates(kidId)
            }
          })
        }
        collectSubordinates(targetId)

        // 3. Immediate squad peers if viewer is an employee
        const peerIds = new Set()
        if (target.managerId && (viewerUser.role === 'employee' || !viewerUser.role)) {
          const directKids = childrenMap.get(String(target.managerId)) || []
          directKids.forEach((kidId) => peerIds.add(kidId))
        }

        const allowedIds = new Set([
          ...chain.map((c) => String(c.id || c._id)),
          ...subordinateIds,
          ...peerIds,
        ])

        // Filter childrenMap to only allowed nodes
        childrenMap.forEach((kids, parentId) => {
          if (!allowedIds.has(parentId)) {
            childrenMap.set(parentId, [])
          } else {
            childrenMap.set(parentId, kids.filter((k) => allowedIds.has(k)))
          }
        })

        const topChainNode = chain[0] || target
        const topNodeId = String(topChainNode.id || topChainNode._id)
        calculateTeamCounts(topNodeId)
        const scopedRoot = byId.get(topNodeId)

        const deptMap = new Map()
        employees.filter((e) => allowedIds.has(String(e.id || e._id))).forEach((e) => {
          let d = e.department || 'General'
          if (d.toLowerCase() === 'executive') d = 'Executive Leadership'
          if (!deptMap.has(d)) deptMap.set(d, { name: d, count: 0, activeCount: 0 })
          const item = deptMap.get(d)
          item.count++
          if (e.status === 'active') item.activeCount++
        })

        return {
          roots: scopedRoot ? [scopedRoot] : [],
          stats: {
            totalEmployees: allowedIds.size,
            activeEmployees: allowedIds.size,
            totalDepartments: deptMap.size,
            departments: Array.from(deptMap.values()),
          },
          scoped: true,
          chain,
          reportingLine: chain.map((c) => `${c.name} (${c.displayName || ''} ${c.designation || ''})`).join(' -> '),
          targetEmployee: target,
        }
      }
    }

    let roots = []
    if (rootId) {
      const target = byId.get(String(rootId))
      if (target) {
        calculateTeamCounts(String(target.id || target._id))
        roots = [target]
      }
    } else if (filterDept) {
      const deptEmployees = employees.filter((e) => (e.department || '').toLowerCase() === filterDept.toLowerCase())
      // Find top manager for this department
      const deptHeads = deptEmployees.filter((e) => {
        const mgr = employees.find((m) => String(m.id || m._id) === String(e.managerId) || m.employeeId === String(e.managerId))
        return !mgr || (mgr.department || '').toLowerCase() !== filterDept.toLowerCase()
      })
      const primaryRoot = deptHeads[0] || deptEmployees[0]
      if (primaryRoot) {
        calculateTeamCounts(String(primaryRoot.id || primaryRoot._id))
        roots = [byId.get(String(primaryRoot.id || primaryRoot._id))]
      }
    } else {
      roots = employees
        .filter((emp) => {
          const node = byId.get(String(emp.id || emp._id))
          const mgrId = node?.managerId ? String(node.managerId) : null
          return !mgrId || !byId.has(mgrId)
        })
        .map((emp) => byId.get(String(emp.id || emp._id)))
        .filter(Boolean)

      roots.forEach((root) => {
        calculateTeamCounts(String(root.id || root._id))
      })
    }

    const deptMap = new Map()
    employees.forEach((e) => {
      let d = e.department || 'General'
      if (d.toLowerCase() === 'executive') d = 'Executive Leadership'
      if (!deptMap.has(d)) deptMap.set(d, { name: d, count: 0, activeCount: 0 })
      const item = deptMap.get(d)
      item.count++
      if (e.status === 'active') item.activeCount++
    })

    return {
      roots,
      stats: {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === 'active').length,
        totalDepartments: deptMap.size,
        departments: Array.from(deptMap.values()),
      },
      scoped: false,
    }
  },

  getEmployeeReportingChain(employeeId) {
    const employees = storeState.employees || []
    const byId = new Map(employees.map((e) => [String(e.id || e._id), e]))
    employees.forEach((e) => { if (e.employeeId) byId.set(e.employeeId, e) })

    const target = byId.get(String(employeeId))
    if (!target) return []

    const chain = []
    let curr = target
    const visited = new Set()

    while (curr) {
      const id = String(curr.id || curr._id)
      if (visited.has(id)) break
      visited.add(id)
      chain.unshift({ ...curr })
      if (!curr.managerId) break
      curr = byId.get(String(curr.managerId))
    }
    return chain
  },

  getDirectReports(employeeId) {
    const employees = storeState.employees || []
    const target = employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId)
    if (!target) return []
    const tId = String(target.id || target._id)
    return employees.filter((e) => String(e.managerId) === tId || e.managerId === target.employeeId)
  },

  validateManagerAssignment(employeeId, newManagerId) {
    if (!newManagerId) return { valid: true }
    if (String(employeeId) === String(newManagerId)) {
      return { valid: false, message: 'An employee cannot be assigned as their own reporting manager.' }
    }

    const employees = storeState.employees || []
    const byId = new Map(employees.map((e) => [String(e.id || e._id), e]))
    employees.forEach((e) => { if (e.employeeId) byId.set(e.employeeId, e) })

    const targetEmp = byId.get(String(employeeId))
    const newMgr = byId.get(String(newManagerId))

    if (!targetEmp) return { valid: false, message: 'Employee not found.' }
    if (!newMgr) return { valid: false, message: 'Target reporting manager not found.' }

    let current = newMgr
    const visited = new Set()

    while (current && current.managerId) {
      const parentId = String(current.managerId)
      if (parentId === String(employeeId) || parentId === targetEmp.employeeId) {
        return {
          valid: false,
          message: `Circular reporting relationship detected: ${newMgr.name} is in ${targetEmp.name}'s reporting chain.`,
        }
      }
      if (visited.has(parentId)) break
      visited.add(parentId)
      current = byId.get(parentId)
    }

    return { valid: true }
  },

  updateEmployeeManager(employeeId, newManagerId, actor = 'System') {
    const validation = this.validateManagerAssignment(employeeId, newManagerId)
    if (!validation.valid) {
      throw new Error(validation.message)
    }

    const emp = this.getEmployee(employeeId)
    if (!emp) throw new Error('Employee not found.')

    let newMgrName = null
    if (newManagerId) {
      const mgr = this.getEmployee(newManagerId)
      newMgrName = mgr ? mgr.name : null
    }

    const updated = this.updateEmployee(emp.id, {
      managerId: newManagerId || null,
      managerName: newMgrName,
    })

    this.addAuditLog(
      actor,
      'MANAGER_REASSIGNMENT',
      `Reassigned reporting manager of ${emp.name} to ${newMgrName || 'None (Company Root)'}`
    )

    return updated
  },

  transferEmployeeDepartment(employeeId, newDepartment, newManagerId, actor = 'System') {
    if (newManagerId) {
      const validation = this.validateManagerAssignment(employeeId, newManagerId)
      if (!validation.valid) {
        throw new Error(validation.message)
      }
    }

    const emp = this.getEmployee(employeeId)
    if (!emp) throw new Error('Employee not found.')

    let newMgrName = emp.managerName
    if (newManagerId !== undefined) {
      if (newManagerId) {
        const mgr = this.getEmployee(newManagerId)
        newMgrName = mgr ? mgr.name : null
      } else {
        newMgrName = null
      }
    }

    const updated = this.updateEmployee(emp.id, {
      department: newDepartment,
      ...(newManagerId !== undefined ? { managerId: newManagerId || null, managerName: newMgrName } : {}),
    })

    this.addAuditLog(
      actor,
      'DEPARTMENT_TRANSFER',
      `Transferred ${emp.name} to department ${newDepartment}`
    )

    return updated
  },

  // Reset to Factory Demo State
  resetToDemoDefaults() {
    window.localStorage.removeItem(STORAGE_KEY)
    storeState = loadStore()
    notifyListeners()
  },
}

const rawLocalStore = { ...localStore }
export const hrStore = Object.assign(localStore, createConnectedStore(localStore, notifyListeners, rawLocalStore))
export const storeAction = (handler) => (...args) => hrStore.perform(() => handler(...args))
