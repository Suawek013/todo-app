const fs = require('fs');

let content = fs.readFileSync('src/app.jsx', 'utf8');

const newMoveTask = `    moveTask: (id, boardId, colId, beforeId) => setTasks(p => {
      const task = p.find(t => t.id === id);
      if (!task) return p;
      const updated = { ...task, board: boardId, col: colId };
      const rest = p.filter(t => t.id !== id);
      const idx = (beforeId && beforeId !== id) ? rest.findIndex(t => t.id === beforeId) : -1;
      if (idx === -1) rest.push(updated); else rest.splice(idx, 0, updated);
      return rest;
    }),`;

content = content.replace(/moveTask: \(id, boardId, colId\) => setTasks\(p => p\.map\(t => t\.id === id \? \{ \.\.\.t, board: boardId, col: colId \} : t\)\),/g, newMoveTask);

const newInboxToBoard = `    inboxToBoard: (item, boardId, colId, beforeId) => {
      const t = mkTask({ title: item.title, board: boardId, col: colId });
      setTasks(p => {
        const rest = [...p];
        const idx = (beforeId) ? rest.findIndex(x => x.id === beforeId) : -1;
        if (idx === -1) rest.push(t); else rest.splice(idx, 0, t);
        return rest;
      });
      setInbox(p => p.filter(x => x.id !== item.id));
    },`;

content = content.replace(/inboxToBoard: \(item, boardId, colId\) => \{[\s\S]*?\},/g, newInboxToBoard);

fs.writeFileSync('src/app.jsx', content);
console.log("app.jsx fixed");
