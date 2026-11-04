import fs from 'fs';
const s = fs.readFileSync('server/src/modules/auth/auth.routes.js', 'utf8');

const lines = s.split('\n');
for (let i = 10; i < 30; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

