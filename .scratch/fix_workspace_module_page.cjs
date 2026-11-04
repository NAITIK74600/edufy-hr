const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/WorkspaceModulePage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Line 723
content = content.replace(
  "<span>Role: {emp.designation || emp.role || 'Staff'}</span>",
  "<span>Designation: {emp.designation || 'Pending Designation'}</span>"
);

// 2. Line 1781
content = content.replace(
  "designation: defaultEmp.designation || 'Specialist',",
  "designation: defaultEmp.designation || 'Pending Designation',"
);

// 3. Lines 3933 & 3983
content = content.replace(
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || emp.department || 'IT Specialist'}",
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || 'Pending Designation'}"
);
content = content.replace(
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || emp.department || 'General'}",
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || 'Pending Designation'}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated WorkspaceModulePage.jsx');

