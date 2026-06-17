const fs = require('fs');
const path = require('path');

const srcDir = './src';
function getFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res.push(...getFiles(full));
    else if (full.endsWith('.jsx')) res.push(full);
  }
  return res;
}
const files = getFiles(srcDir);

// 1. Identify exports
const exportsMap = {}; // name -> file
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // replace window.X = X with export { X };
  content = content.replace(/window\.([A-Za-z0-9_]+)\s*=\s*\1;?/g, (match, name) => {
    exportsMap[name] = file;
    return `export { ${name} };`;
  });
  
  // Also data.jsx window.SEED = ...
  if (file.endsWith('data.jsx')) {
    content = content.replace(/window\.SEED\s*=\s*\{/g, 'export const SEED = {');
    exportsMap['SEED'] = file;
  }
  // Remove import './...' from app.jsx as we will auto-inject
  if (file.endsWith('app.jsx')) {
    content = content.replace(/import '\.\/.*?\.jsx';\n/g, '');
  }
  fs.writeFileSync(file, content);
}

// 2. Inject imports
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const importsNeeded = new Set();
  
  // Find all <X and X( and X.
  const regex = /<([A-Z][A-Za-z0-9_]*)|([A-Z][A-Za-z0-9_]*)\(|([A-Z][A-Za-z0-9_]*)\./g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1] || match[2] || match[3];
    if (exportsMap[name] && exportsMap[name] !== file) {
      importsNeeded.add(name);
    }
  }
  // also SEED
  if (content.includes('SEED') && exportsMap['SEED'] !== file) {
    importsNeeded.add('SEED');
  }
  // also TYPE_BADGE from data.jsx maybe? It was window.TYPE_BADGE? 
  // Let's replace window.SEED with SEED
  content = content.replace(/window\.SEED/g, 'SEED');
  content = content.replace(/window\.TYPE_BADGE/g, 'TYPE_BADGE');
  content = content.replace(/window\.NOTE_TYPE/g, 'NOTE_TYPE');
  content = content.replace(/window\.timeAgo/g, 'timeAgo');

  if (content.includes('TYPE_BADGE')) importsNeeded.add('TYPE_BADGE');
  if (content.includes('NOTE_TYPE')) importsNeeded.add('NOTE_TYPE');
  if (content.includes('timeAgo')) importsNeeded.add('timeAgo');

  // Group imports by file
  const byFile = {};
  for (const name of importsNeeded) {
    const src = exportsMap[name];
    if (src) {
      if (!byFile[src]) byFile[src] = [];
      byFile[src].push(name);
    }
  }

  let importLines = '';
  for (const [src, names] of Object.entries(byFile)) {
    let rel = path.relative(path.dirname(file), src);
    if (!rel.startsWith('.')) rel = './' + rel;
    importLines += `import { ${names.join(', ')} } from '${rel}';\n`;
  }

  if (importLines) {
    content = importLines + '\n' + content;
  }
  fs.writeFileSync(file, content);
}

console.log('Imports fixed.');
