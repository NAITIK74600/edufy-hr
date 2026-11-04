const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/AdminDashboardPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add getRoleBadgeLabel import
if (!content.includes('getRoleBadgeLabel')) {
  content = content.replace(
    "import { formatINR } from '../utils/currency'",
    "import { formatINR } from '../utils/currency'\nimport { getRoleBadgeLabel } from '../utils/greeting'"
  );
}

// 2. Line 447
content = content.replace(
  "designation: emp.designation || 'Staff',",
  "designation: emp.designation || 'Pending Designation',"
);

// 3. Line 504
content = content.replace(
  "designation: isDir ? (u.designation && u.designation.toLowerCase().includes('director') ? u.designation : 'Managing Director') : (u.designation || rec.designation),",
  "designation: isDir ? (u.designation && u.designation.toLowerCase().includes('director') ? u.designation : 'Managing Director') : (u.designation || 'Pending Designation'),"
);

// 4. Lines 4261-4263
content = content.replace(
  `<span>{emp.designation || emp.role || 'Staff'}</span>
                              <span>•</span>
                              <span style={{ textTransform: 'capitalize' }}>{emp.role?.replace(/_/g, ' ') || 'employee'}</span>`,
  `<span>{emp.designation || 'Pending Designation'}</span>
                              <span>•</span>
                              <span style={{ textTransform: 'capitalize' }}>{getRoleBadgeLabel(emp.role)}</span>`
);

// 5. Lines 5928 & 5978
content = content.replace(
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || emp.department || 'General'}",
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || 'Pending Designation'}"
);
content = content.replace(
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || emp.department || 'General'}",
  "{emp.name} ({emp.employeeId || 'STAFF'}) — {emp.designation || 'Pending Designation'}"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated AdminDashboardPage.jsx');

