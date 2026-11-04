import fs from 'fs';
const empDash = fs.readFileSync('src/pages/EmployeeDashboardPage.jsx', 'utf8');

const lines = empDash.split('\n');
lines.forEach((l, i) => {
  if (l.includes('greeting') || l.includes('Welcome') || l.includes('welcome') || l.includes('PageHeader')) {
    console.log((i+1) + ': ' + l.trim());
  }
});

