const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/OrgChart/OrgHierarchyPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace ROLE_BADGES and getRoleBadge
const oldRoleBadges = `const ROLE_BADGES = {
  director: { label: 'Director', bg: '#fef3c7', text: '#b45309', border: '#f59e0b', ring: '#fbbf24' },
  manager: { label: 'Manager', bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6', ring: '#60a5fa' },
  team_lead: { label: 'Team Lead', bg: '#ccfbf1', text: '#0f766e', border: '#14b8a6', ring: '#2dd4bf' },
  employee: { label: 'Employee', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', ring: '#94a3b8' },
  admin: { label: 'Admin', bg: '#fee2e2', text: '#b91c1c', border: '#ef4444', ring: '#f87171' },
  hr: { label: 'HR', bg: '#d1fae5', text: '#047857', border: '#10b981', ring: '#34d399' },
}

function getRoleBadge(role) {
  return ROLE_BADGES[role] || ROLE_BADGES.employee
}`;

const newRoleBadges = `const ROLE_BADGES = {
  managing_director: { label: 'Managing Director', bg: '#fef3c7', text: '#b45309', border: '#f59e0b', ring: '#fbbf24' },
  director: { label: 'Managing Director', bg: '#fef3c7', text: '#b45309', border: '#f59e0b', ring: '#fbbf24' },
  co_founder: { label: 'Co-Founder', bg: '#fef3c7', text: '#b45309', border: '#f59e0b', ring: '#fbbf24' },
  vertical_head: { label: 'Vertical Head', bg: '#f3e8ff', text: '#7e22ce', border: '#a855f7', ring: '#c084fc' },
  revenue_growth_manager: { label: 'Revenue Growth Manager', bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6', ring: '#60a5fa' },
  manager: { label: 'Manager', bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6', ring: '#60a5fa' },
  team_lead: { label: 'Team Lead', bg: '#ccfbf1', text: '#0f766e', border: '#14b8a6', ring: '#2dd4bf' },
  team_leader: { label: 'Team Leader', bg: '#ccfbf1', text: '#0f766e', border: '#14b8a6', ring: '#2dd4bf' },
  employee: { label: 'Associate', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', ring: '#94a3b8' },
  admin: { label: 'Admin', bg: '#fee2e2', text: '#b91c1c', border: '#ef4444', ring: '#f87171' },
  hr: { label: 'HR', bg: '#d1fae5', text: '#047857', border: '#10b981', ring: '#34d399' },
  hr_executive: { label: 'HR Executive', bg: '#d1fae5', text: '#047857', border: '#10b981', ring: '#34d399' },
}

function getRoleBadge(role) {
  if (role && ROLE_BADGES[role]) return ROLE_BADGES[role]
  const clean = String(role || '').toLowerCase().replace(/[^a-z0-9]/g, '_')
  if (ROLE_BADGES[clean]) return ROLE_BADGES[clean]
  if (clean.includes('director') || clean.includes('founder')) return ROLE_BADGES.managing_director
  if (clean.includes('head')) return ROLE_BADGES.vertical_head
  if (clean.includes('manager')) return ROLE_BADGES.manager
  if (clean.includes('lead')) return ROLE_BADGES.team_lead
  if (clean.includes('hr')) return ROLE_BADGES.hr
  if (clean.includes('admin')) return ROLE_BADGES.admin
  return { label: role ? role.replace(/_/g, ' ') : 'Unassigned', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', ring: '#94a3b8' }
}`;

content = content.replace(oldRoleBadges, newRoleBadges);

// 2. ChangeManagerModal rolePriority and availableManagers
const oldMgrFilter1 = `const rolePriority = { director: 1, manager: 2, team_lead: 3, admin: 4, hr: 5 }
  const availableManagers = allEmployees
    .filter((m) => {
      if (m.id === employee.id || m._id === employee.id) return false
      return m.status === 'active' && ['director', 'manager', 'team_lead', 'admin', 'hr'].includes(m.role)
    })`;

const newMgrFilter1 = `const rolePriority = { managing_director: 1, director: 1, co_founder: 1, vertical_head: 2, revenue_growth_manager: 3, manager: 3, team_lead: 4, team_leader: 4, admin: 5, hr: 6 }
  const availableManagers = allEmployees
    .filter((m) => {
      if (m.id === employee.id || m._id === employee.id) return false
      return m.status === 'active' && ['managing_director', 'director', 'co_founder', 'vertical_head', 'revenue_growth_manager', 'manager', 'team_lead', 'team_leader', 'admin', 'hr'].includes(m.role)
    })`;

content = content.replace(oldMgrFilter1, newMgrFilter1);

// 3. TransferDepartmentModal available managers
const oldMgrFilter2 = `allEmployees
                .filter((m) => m.id !== employee.id && m._id !== employee.id && m.status === 'active' && ['director', 'manager', 'team_lead', 'admin', 'hr'].includes(m.role))
                .sort((a, b) => {
                  const rolePriority = { director: 1, manager: 2, team_lead: 3, admin: 4, hr: 5 }`;

const newMgrFilter2 = `allEmployees
                .filter((m) => m.id !== employee.id && m._id !== employee.id && m.status === 'active' && ['managing_director', 'director', 'co_founder', 'vertical_head', 'revenue_growth_manager', 'manager', 'team_lead', 'team_leader', 'admin', 'hr'].includes(m.role))
                .sort((a, b) => {
                  const rolePriority = { managing_director: 1, director: 1, co_founder: 1, vertical_head: 2, revenue_growth_manager: 3, manager: 3, team_lead: 4, team_leader: 4, admin: 5, hr: 6 }`;

content = content.replace(oldMgrFilter2, newMgrFilter2);

// 4. Node designation fallback
content = content.replace(
  "{node.designation || 'Team Member'}",
  "{node.designation || 'Pending Designation'}"
);

// 5. Viewing as header fallback
content = content.replace(
  "— Viewing as: {targetEmployee.name} ({targetEmployee.designation || targetEmployee.role})",
  "— Viewing as: {targetEmployee.name} ({targetEmployee.designation || 'Pending Designation'})"
);

// 6. Simulation dropdown
const oldSimGroup = `<optgroup label="Simulate as Director">
                  {allEmployees.filter((e) => e.role === 'director').map((e) => (
                    <option key={e.id} value={e.id}>{e.displayName || e.name} (Overall Director)</option>
                  ))}
                </optgroup>`;

const newSimGroup = `<optgroup label="Simulate as Managing Director / Executive">
                  {allEmployees.filter((e) => ['managing_director', 'director', 'co_founder'].includes(e.role)).map((e) => (
                    <option key={e.id} value={e.id}>{e.displayName || e.name} (Managing Director)</option>
                  ))}
                </optgroup>`;

content = content.replace(oldSimGroup, newSimGroup);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated OrgHierarchyPage.jsx');

