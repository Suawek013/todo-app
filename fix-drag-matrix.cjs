const fs = require('fs');

let content = fs.readFileSync('src/views/matrix.jsx', 'utf8');

// 1. Remove overCard and dropOnCard
content = content.replace(/const overCard = [\s\S]*?};\n/g, '');
content = content.replace(/const dropOnCard = [\s\S]*?};\n/g, '');

// 2. Add getBeforeId
const getBeforeIdStr = `  const getBeforeId = (e) => {
    const cards = Array.from(e.currentTarget.querySelectorAll('div[data-id]'));
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) return card.getAttribute('data-id');
    }
    return null;
  };

`;
content = content.replace('const overZone =', getBeforeIdStr + '  const overZone =');

// 3. Update overZone and dropOnZone
content = content.replace(/const overZone = \(e, zone\) => \{[\s\S]*?\};/g, `const overZone = (e, zone) => {
    e.preventDefault();
    if (!draggingId) return;
    const beforeId = getBeforeId(e);
    setDrop(prev => (prev && prev.zone === zone && prev.beforeId === beforeId ? prev : { zone, beforeId }));
  };`);
content = content.replace(/const dropOnZone = \(e, zone\) => \{ e\.preventDefault\(\); commit\(zone, null\); \};/g, `const dropOnZone = (e, zone) => { e.preventDefault(); commit(zone, getBeforeId(e)); };`);

// 4. Update renderCardList
content = content.replace(/<div onDragOver=\{\(e\) => overCard.*?\} onDrop=\{\(e\) => dropOnCard.*?\}>/g, '<div data-id={t.id}>');

fs.writeFileSync('src/views/matrix.jsx', content);
console.log("matrix.jsx fixed");
