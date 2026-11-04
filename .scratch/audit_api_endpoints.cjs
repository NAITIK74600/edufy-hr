const fs = require('fs');
const path = require('path');

function extractRoutesFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const routes = [];
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
      file: path.basename(filePath)
    });
  }
  return routes;
}

function scanModules(dir) {
  const results = [];
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    if (f.endsWith('.routes.js') || f.endsWith('Routes.js')) {
      const fullPath = path.join(dir, f);
      const routes = extractRoutesFromFile(fullPath);
      results.push({ module: f, routes });
    }
  }
  return results;
}

const modules = scanModules('server/src/modules');
console.log('=== API ENDPOINTS IN SERVER MODULES ===');
let totalRoutes = 0;
for (const m of modules) {
  console.log(`\nModule: ${m.module} (${m.routes.length} endpoints):`);
  m.routes.forEach(r => console.log(`  ${r.method.padEnd(7)} ${r.path}`));
  totalRoutes += m.routes.length;
}
console.log(`\nTotal Endpoints Found: ${totalRoutes}`);

