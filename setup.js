import fs from 'fs';
import path from 'path';

const srcDir = './src';
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir);
}

const filesToMove = ['app.jsx', 'components.jsx', 'data.jsx', 'styles.css', 'views'];

filesToMove.forEach(file => {
  if (fs.existsSync(file)) {
    fs.renameSync(file, path.join(srcDir, file));
  }
});

// Now prepend imports and fix ReactDOM.render
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (filePath.endsWith('.jsx')) {
    if (!content.includes("import React")) {
      content = `import React from 'react';\n${content}`;
    }
  }

  // If it's app.jsx, fix ReactDOM.createRoot
  if (filePath.endsWith('app.jsx')) {
    content = content.replace(
      "ReactDOM.createRoot(document.getElementById('root')).render(<App />);",
      "import ReactDOM from 'react-dom/client';\nReactDOM.createRoot(document.getElementById('root')).render(<App />);"
    );
    // Also we need to import all views, data, components, styles
    const imports = `
import './styles.css';
import './data.jsx';
import './components.jsx';
import './views/inbox.jsx';
import './views/boards.jsx';
import './views/matrix.jsx';
import './views/focus.jsx';
import './views/stats.jsx';
import './views/notes.jsx';
import './views/modals.jsx';
import './views/components-sheet.jsx';
`;
    content = imports + "\n" + content;
  }

  fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(srcDir);

console.log("Migration complete.");
