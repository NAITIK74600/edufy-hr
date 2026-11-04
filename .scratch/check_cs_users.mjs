import fs from 'fs';
const cs = fs.readFileSync('src/services/connectedStore.js', 'utf8');

const lines = cs.split('\n');
for (let i = 110; i < 125; i++) {
  console.log((i+1) + ': ' + lines[i]);
}

