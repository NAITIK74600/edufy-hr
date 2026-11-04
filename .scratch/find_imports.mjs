import fs from 'fs';
import path from 'path';

function getImports(dir) {
  const files = fs.readdirSync(dir);
  const imports = new Set();
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      for (const imp of getImports(full)) imports.add(imp);
    } else if (f.endsWith('.js') || f.endsWith('.mjs')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.matchAll(/from\s+['"]([^'"]+)['"]/g);
      for (const m of matches) {
        const pkg = m[1];
        if (!pkg.startsWith('.') && !pkg.startsWith('node:')) {
          imports.add(pkg);
        }
      }
      const dynMatches = content.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
      for (const m of dynMatches) {
        const pkg = m[1];
        if (!pkg.startsWith('.') && !pkg.startsWith('node:')) {
          imports.add(pkg);
        }
      }
    }
  }
  return imports;
}

console.log('Third-party packages used in server/src:');
console.log(Array.from(getImports('server/src')));

