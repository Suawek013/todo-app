const p = [
  { id: 'A', priority: 'do' },
  { id: 'B', priority: 'do' },
  { id: 'C', priority: 'do' }
];
const id = 'A';
const beforeId = 'A';
const field = 'priority';
const val = 'do';

const task = p.find(t => t.id === id);
const updated = { ...task, [field]: val };
const rest = p.filter(t => t.id !== id);
const idx = (beforeId && beforeId !== id) ? rest.findIndex(t => t.id === beforeId) : -1;
if (idx === -1) rest.push(updated); else rest.splice(idx, 0, updated);

console.log("Result when dropping A on A:", rest.map(t => t.id));
