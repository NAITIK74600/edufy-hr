import fs from 'fs';
const overview = fs.readFileSync('src/pages/OverviewPage.jsx', 'utf8');

const lines = overview.split('\n');
lines.forEach((l, i) => {
  if (l.includes("'HR'") || l.includes('"HR"') || l.includes('Welcome back, HR') || l.includes('Welcome, HR')) {
    console.log((i+1) + ': ' + l.trim());
  }
});

