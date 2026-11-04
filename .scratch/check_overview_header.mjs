import fs from 'fs';
const overview = fs.readFileSync('src/pages/OverviewPage.jsx', 'utf8');

const lines = overview.split('\n');
for (let i = 640; i < 665; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

