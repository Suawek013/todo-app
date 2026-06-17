import fs from 'fs';
import path from 'path';

const dirs = ['./src/views', './src'];
for (const dir of dirs) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => path.join(dir, f));
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/window\.fmtMin/g, 'fmtMin');
    content = content.replace(/window\.fmtClock/g, 'fmtClock');
    content = content.replace(/window\.STATUS_META/g, 'STATUS_META');
    content = content.replace(/window\.PRIORITY_META/g, 'PRIORITY_META');
    content = content.replace(/window\.ICONS/g, 'ICONS');
    content = content.replace(/window\.timeAgo/g, 'timeAgo');
    content = content.replace(/window\.NOTE_TYPE/g, 'NOTE_TYPE');
    content = content.replace(/window\.TYPE_BADGE/g, 'TYPE_BADGE');
    fs.writeFileSync(file, content);
  }
}
console.log("Fixed window globals");
