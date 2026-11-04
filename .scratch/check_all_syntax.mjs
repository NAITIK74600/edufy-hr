import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let errors = 0;
function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (f.endsWith('.js') || f.endsWith('.mjs')) {
      try {
        execSync(`node --check "${full}"`, { stdio: 'pipe' });
      } catch (err) {
        console.error('SYNTAX ERROR in:', full);
        console.error(err.stderr.toString());
        errors++;
      }
    }
  }
}

checkDir('_webuzo_build/server/src');
console.log(`Finished checking all files! Total syntax errors: ${errors}`);

