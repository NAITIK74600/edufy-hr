import fs from 'fs';
import path from 'path';

function findFiles(dir, exts) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(f)) res.push(...findFiles(full, exts));
    } else if (exts.some(e => f.endsWith(e))) res.push(full);
  }
  return res;
}

const files = findFiles('src', ['.jsx', '.js']);
const imports = new Map();

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*,\s]+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  const deps = [];
  while ((m = importRegex.exec(code)) !== null) {
    const impPath = m[1];
    if (impPath.startsWith('.')) {
      const resolvedBase = path.resolve(path.dirname(file), impPath);
      let resolved = '';
      for (const ext of ['', '.js', '.jsx', '/index.js', '/index.jsx']) {
        if (fs.existsSync(resolvedBase + ext) && !fs.statSync(resolvedBase + ext).isDirectory()) {
          resolved = resolvedBase + ext;
          break;
        }
      }
      if (resolved) deps.push(resolved);
    }
  }
  imports.set(path.resolve(file), deps);
}

const cycles = [];
function dfs(node, visited = new Set(), stack = []) {
  visited.add(node);
  stack.push(node);
  for (const dep of (imports.get(node) || [])) {
    const idx = stack.indexOf(dep);
    if (idx !== -1) {
      cycles.push([...stack.slice(idx), dep]);
    } else if (!visited.has(dep)) {
      dfs(dep, visited, stack);
    }
  }
  stack.pop();
}

for (const file of imports.keys()) {
  dfs(file);
}

console.log('Total cycles found:', cycles.length);
cycles.slice(0, 10).forEach(c => console.log('Cycle:', c.map(p => path.relative('.', p)).join(' -> ')));
