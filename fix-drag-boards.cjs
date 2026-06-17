const fs = require('fs');
let content = fs.readFileSync('src/views/boards.jsx', 'utf8');

// The logic in boards.jsx is:
// <div className="col" onDragOver={(e) => { e.preventDefault(); setDropCol(col.id); }} onDrop={(e) => onDropTo(e, col.id)}>
// Let's create a getBeforeId function and use it inside boards.jsx.

const getBeforeIdStr = `
  const getBeforeId = (e) => {
    const cards = Array.from(e.currentTarget.querySelectorAll('div[data-id]'));
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) return card.getAttribute('data-id');
    }
    return null;
  };
`;

content = content.replace('const onDropTo =', getBeforeIdStr + '  const onDropTo =');

// 1. Column drag over
content = content.replace(/onDragOver=\{\(e\) => \{ e\.preventDefault\(\); setDropCol\(col\.id\); \}\}/g, 
  "onDragOver={(e) => { e.preventDefault(); setDropCol({ colId: col.id, beforeId: getBeforeId(e) }); }}");

// 2. Column drop
content = content.replace(/const onDropTo = \(e, colId\) => \{/g, `const onDropTo = (e, colId) => {
    const beforeId = getBeforeId(e);`);
content = content.replace(/api\.moveTask\(drag\.payload\.id, board\.id, colId\);/g, 
  "api.moveTask(drag.payload.id, board.id, colId, beforeId);");
content = content.replace(/api\.inboxToBoard\(drag\.payload, board\.id, colId\);/g, 
  "api.inboxToBoard(drag.payload, board.id, colId, beforeId);");

// 3. Remove inner card handlers and add data-id
content = content.replace(/<div key=\{t\.id\}\s*onDragOver=\{[\s\S]*?\}\s*onDrop=\{[\s\S]*?\}>/g, '<div key={t.id} data-id={t.id}>');

fs.writeFileSync('src/views/boards.jsx', content);
console.log("boards.jsx fixed");
