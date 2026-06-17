import fs from 'fs';
import path from 'path';

const viewsDir = './src/views';
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.jsx')).map(f => path.join(viewsDir, f));

const imports = `import { Icon, ICONS, PriorityPill, StatusPill, TagChip, TimerRing, TaskCard, Modal, Segmented, STATUS_META, PRIORITY_META, TYPE_BADGE, NOTE_TYPE, timeAgo, fmtMin, fmtClock } from '../components.jsx';
import { SEED } from '../data.jsx';
`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove existing imports from components or data
  const lines = content.split('\n');
  const newLines = lines.filter(line => !line.includes("from '../components.jsx'") && !line.includes("from '../data.jsx'"));
  
  // Also if any file has duplicate React import, not a big deal but we can remove it if we want
  // Let's just prepend our imports
  content = imports + newLines.join('\n');
  
  fs.writeFileSync(file, content);
}
console.log("Fixed views.");
