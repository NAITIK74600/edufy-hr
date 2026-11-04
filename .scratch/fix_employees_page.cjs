const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/EmployeesPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Creation validation & designation requirement
const oldCreate = `const rec = getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department)
    const designation = (newEmpForm.designation || '').trim() || rec.designation || 'Employee'
    const missing = []
    if (!newEmpForm.name?.trim()) missing.push('Full Name')
    if (!newEmpForm.email?.trim()) missing.push('Work Email')
    if (!newEmpForm.phone?.trim()) missing.push('Phone Number')
    if (!newEmpForm.joiningDate) missing.push('Joining Date')`;

const newCreate = `const rec = getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department)
    const designation = (newEmpForm.designation || '').trim() || rec.designation || 'Pending Designation'
    const missing = []
    if (!newEmpForm.name?.trim()) missing.push('Full Name')
    if (!newEmpForm.email?.trim()) missing.push('Work Email')
    if (!newEmpForm.phone?.trim()) missing.push('Phone Number')
    if (!newEmpForm.joiningDate) missing.push('Joining Date')
    if (!newEmpForm.designation?.trim()) missing.push('Official Designation')`;

content = content.replace(oldCreate, newCreate);

// 2. setCreatedCredentials
const oldCreds = `setCreatedCredentials({
        name: created?.name || empData.name,
        email: created?.email || empData.email,
        employeeId: created?.employeeId || finalEmpCode,
        role: created?.role || empData.role || 'employee',
        password: created?.temporaryPassword || finalPassword,
      })`;

const newCreds = `setCreatedCredentials({
        name: created?.name || empData.name,
        email: created?.email || empData.email,
        employeeId: created?.employeeId || finalEmpCode,
        role: created?.role || empData.role || 'employee',
        designation: created?.designation || empData.designation || 'Pending Designation',
        password: created?.temporaryPassword || finalPassword,
      })`;

content = content.replace(oldCreds, newCreds);

// 3. startEditEmployee
const oldEditStart = `designation: isDir ? (emp.designation && emp.designation.toLowerCase().includes('director') ? emp.designation : 'Managing Director') : (emp.designation || rec.designation),`;
const newEditStart = `designation: isDir ? (emp.designation && emp.designation.toLowerCase().includes('director') ? emp.designation : 'Managing Director') : (emp.designation || 'Pending Designation'),`;
content = content.replace(oldEditStart, newEditStart);

// 4. Role vs Designation label in roster card
const oldRoleLabel = `<div><span style={{ color: 'var(--muted)' }}>Role: </span><strong>{emp.designation}</strong></div>`;
const newRoleLabel = `<div><span style={{ color: 'var(--muted)' }}>Designation: </span><strong>{emp.designation || 'Pending Designation'}</strong></div>
                <div><span style={{ color: 'var(--muted)' }}>Role: </span><strong style={{ textTransform: 'capitalize' }}>{getRoleBadgeLabel(emp.role)}</strong></div>`;
content = content.replace(oldRoleLabel, newRoleLabel);

// 5. Line 1199 & Line 2868: Specialist fallback
content = content.replace(
  "{emp.designation || 'Specialist'} · {emp.department} · {emp.email}",
  "{emp.designation || 'Pending Designation'} · {emp.department} · {emp.email}"
);
content = content.replace(
  "description={`${employee.designation || 'Specialist'} · ${employee.department} · ${employee.employeeId}`}",
  "description={`${employee.designation || 'Pending Designation'} · ${employee.department} · ${employee.employeeId}`}"
);

// 6. Welcome email payload in credentials modal
const oldWelcomeMail = `designation: createdCredentials.role ? createdCredentials.role.toUpperCase() : 'Staff Member',`;
const newWelcomeMail = `designation: createdCredentials.designation || 'Pending Designation',`;
content = content.replace(oldWelcomeMail, newWelcomeMail);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated EmployeesPage.jsx');

