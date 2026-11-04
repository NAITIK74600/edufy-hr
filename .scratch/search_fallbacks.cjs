const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'coverage', '.scratch', '.system_generated'].includes(entry.name)) continue;
      searchDir(fullPath, pattern, results);
    } else if (/\.(js|jsx|ts|tsx|cjs|mjs)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          results.push({ file: fullPath, lineNum: idx + 1, text: line.trim() });
        }
      });
    }
  }
  return results;
}

console.log('=== SEARCH 1: || \'Employee\' or || "Employee" ===');
const hits1 = searchDir('.', /\|\|\s*['"]Employee['"]/i);
hits1.forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.text}`));

console.log('\n=== SEARCH 2: designation.*Employee or Employee.*designation ===');
const hits2 = searchDir('.', /designation.*['"]Employee['"]|['"]Employee['"].*designation/i);
hits2.forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.text}`));

console.log('\n=== SEARCH 3: hierarchyLevel or orgLevel or level ===');
const hits3 = searchDir('.', /hierarchyLevel|orgLevel/i);
hits3.forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.text}`));

console.log('\n=== SEARCH 4: Fallback for designation (e.g. || \'Staff Member\' or || \'Staff\') ===');
const hits4 = searchDir('.', /designation.*\|\||\|\|\s*['"][^'"]*['"]/i);
const desigHits = hits4.filter(h => /designation/i.test(h.text));
desigHits.forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.text}`));

