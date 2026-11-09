import fs from 'fs';
import path from 'path';

const distAssets = 'dist/assets';
const files = fs.readdirSync(distAssets).filter(f => f.endsWith('.js'));

for (const file of files) {
  const content = fs.readFileSync(path.join(distAssets, file), 'utf8');
  if (content.includes('ke')) {
    // Check if 'ke' appears before 'let ke' or 'const ke' or 'var ke' in the same scope
    // Search for patterns where ke is called or read
    const regex = /\bke\b/g;
    let match;
    const positions = [];
    while ((match = regex.exec(content)) !== null) {
      positions.push(match.index);
    }
    if (positions.length > 0) {
      console.log(`\nFile: ${file} (count: ${positions.length})`);
      for (const pos of positions) {
        const snippet = content.slice(Math.max(0, pos - 40), Math.min(content.length, pos + 40));
        console.log(`  Pos ${pos}: ${snippet.replace(/\n/g, ' ')}`);
      }
    }
  }
}
