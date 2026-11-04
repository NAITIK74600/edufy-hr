import fs from 'fs';
const empDash = fs.readFileSync('src/pages/EmployeeDashboardPage.jsx', 'utf8');

const lines = empDash.split('\n');
for (let i = 1435; i < 1465; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

