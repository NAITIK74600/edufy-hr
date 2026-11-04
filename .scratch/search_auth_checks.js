const fs = require('fs');
const s = fs.readFileSync('server/src/modules/auth/auth.routes.js', 'utf8');

const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes("['admin', 'hr']") || l.includes("'admin'") && l.includes("'hr'")) {
    console.log((i+1) + ': ' + l.trim());
  }
});

