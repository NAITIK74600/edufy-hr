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

console.log('=== SEARCH: role === director or includes(director) ===');
const hits = searchDir('.', /role.*director|director.*role/i);
hits.forEach(h => console.log(`${h.file}:${h.lineNum} -> ${h.text}`));

