import { InboxView } from './views/inbox.jsx';
import { StatsView } from './views/stats.jsx';
import { NotesView } from './views/notes.jsx';
import { ComponentSheet } from './views/components-sheet.jsx';
import { SEED } from './data.jsx';
import { NOTE_TYPE, Icon, Modal } from './components.jsx';
import { BoardsView, NewBoardModal } from './views/boards.jsx';
import { MatrixView } from './views/matrix.jsx';
import { FocusView, MiniPlayer } from './views/focus.jsx';
import { TaskModal, QuickCapture } from './views/modals.jsx';


import './styles.css';

import React from 'react';
/* ============================================================
   APP — state, routing, sidebar, drag plumbing, timer engine
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

const LONG_BREAK_MIN = 15;

function startBreak(n) {
  n.breaksTaken++;
  const isLong = n.completedPomos % n.longEvery === 0;
  n.breakLen = (isLong ? LONG_BREAK_MIN : n.shortB) * 60;
  n.secondsLeft = n.breakLen;
  n.phase = 'break';
}
function tick(f) {
  const n = { ...f };
  if (n.phase === 'focus') {
    if (n.secondsLeft > 1) { n.secondsLeft--; n.elapsedFocusSec++; }
    else {
      n.secondsLeft = 0; n.elapsedFocusSec++; n.completedPomos++;
      const isLast = n.completedPomos >= n.pomos;
      if (n.autoB) { if (isLast) { n.phase = 'complete'; n.running = false; } else startBreak(n); }
      else { n.phase = 'overtime'; n.overtimeSec = 0; }
    }
  } else if (n.phase === 'overtime') {
    n.overtimeSec++; n.elapsedFocusSec++; n.totalOvertimeSec++;
  } else if (n.phase === 'break') {
    if (n.secondsLeft > 1) n.secondsLeft--;
    else if (n.completedPomos >= n.pomos) { n.phase = 'complete'; n.running = false; }
    else { n.currentPomo++; n.phase = 'focus'; n.secondsLeft = n.pomoLen * 60; }
  }
  return n;
}

function App() {
  const seed = SEED;
  const [view, setView] = useState('inbox');
  const [boards, setBoards] = useState(seed.BOARDS);
  const [tasks, setTasks] = useState(seed.TASKS);
  const [inbox, setInbox] = useState(seed.INBOX);
  const [notes, setNotes] = useState(seed.NOTES);
  const [activeBoard, setActiveBoard] = useState('b_work');
  const [matrixMode, setMatrixMode] = useState('eisen');
  const [focus, setFocus] = useState(null);
  const [drag, setDrag] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropBoard, setDropBoard] = useState(null);
  const [toast, setToast] = useState(null);

  const toastRef = useRef();
  const flash = useCallback((msg) => {
    setToast(msg); clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // ---- timer engine ----
  const active = focus && focus.running && ['focus','break','overtime'].includes(focus.phase);
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setFocus(f => (f ? tick(f) : f)), 1000);
    return () => clearInterval(iv);
  }, [active]);

  // ---- global shortcuts ----
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setQuickOpen(true); setSearchOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); setSearchOpen(true); setQuickOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const mkTask = (o) => ({ id: seed.uid('t'), desc: '', priority: null, ie: null, pomoEst: 1, pomoActual: 0,
    due: null, tags: [], subtasks: [], focusMin: 0, ...o });
  const firstCol = (b, status) => (b.columns.find(c => c.status === status) || b.columns[0]).id;

  const api = {
    setView, goFocus: () => setView('focus'),
    setDrag, setActiveBoard: (id) => { setActiveBoard(id); setView('boards'); }, setMatrixMode,

    // inbox
    addInbox: (o) => setInbox(p => [{ id: seed.uid('i'), created: Date.now(), desc: '', ...o }, ...p]),
    deleteInbox: (id) => setInbox(p => p.filter(i => i.id !== id)),
    inboxToBoard: (item, boardId, colId) => {
      const b = boards.find(x => x.id === boardId);
      setTasks(p => [mkTask({ title: item.title, desc: item.desc || '', board: boardId, col: colId || firstCol(b, 'todo') }), ...p]);
      setInbox(p => p.filter(i => i.id !== item.id));
      flash(`Moved to ${b.icon} ${b.name}`);
    },
    inboxToMatrix: (item) => {
      const b = boards[0];
      setTasks(p => [mkTask({ title: item.title, desc: item.desc || '', board: b.id, col: firstCol(b, 'todo') }), ...p]);
      setInbox(p => p.filter(i => i.id !== item.id));
      setView('matrix'); flash('Sent to Matrix — drag into a quadrant');
    },
    inboxToNote: (item) => {
      setNotes(p => [{ id: seed.uid('n'), type: 'idea', title: item.title, body: item.desc || item.title, edited: Date.now() }, ...p]);
      setInbox(p => p.filter(i => i.id !== item.id));
      setView('notes'); flash('Converted to note');
    },

    // boards / tasks
    openNewBoard: () => setNewBoardOpen(true),
    createBoard: ({ name, icon, color, cols, temp }) => {
      const id = seed.uid('b');
      const statusFor = (n, i, len) => { const l = n.toLowerCase();
        if (l.includes('done') || l.includes('publish')) return 'done';
        if (l.includes('progress') || l.includes('doing')) return 'progress';
        if (l.includes('review') || l.includes('block')) return 'blocked';
        return 'todo'; };
      const columns = cols.map((c, i) => ({ id: seed.uid('c'), name: c, status: statusFor(c, i, cols.length) }));
      setBoards(p => [...p, { id, name, icon, color, temporary: temp, columns }]);
      setActiveBoard(id); setView('boards'); setNewBoardOpen(false); flash(`Created ${icon} ${name}`);
    },
    moveTask: (id, boardId, colId) => setTasks(p => p.map(t => t.id === id ? { ...t, board: boardId, col: colId } : t)),
    addTaskToCol: (boardId, colId, title) => {
      const t = mkTask({ title: title || 'New task', board: boardId, col: colId });
      setTasks(p => [...p, t]);
      if (!title) setOpenTaskId(t.id);
    },
    deleteTask: (id) => { setTasks(p => p.filter(t => t.id !== id)); flash('Task deleted'); },
    archiveTask: (id) => { setTasks(p => p.filter(t => t.id !== id)); flash('Task archived'); },
    openTask: (t) => setOpenTaskId(t.id),
    updateTask: (id, patch) => setTasks(p => p.map(t => t.id === id ? { ...t, ...patch } : t)),
    toggleTag: (id, tag) => setTasks(p => p.map(t => t.id === id ? { ...t, tags: t.tags.includes(tag) ? t.tags.filter(x => x !== tag) : [...t.tags, tag] } : t)),
    toggleSub: (id, i) => setTasks(p => p.map(t => t.id === id ? { ...t, subtasks: t.subtasks.map((s, j) => j === i ? { ...s, done: !s.done } : s) } : t)),
    addSub: (id, txt) => setTasks(p => p.map(t => t.id === id ? { ...t, subtasks: [...t.subtasks, { t: txt, done: false }] } : t)),
    removeSub: (id, i) => setTasks(p => p.map(t => t.id === id ? { ...t, subtasks: t.subtasks.filter((_, j) => j !== i) } : t)),
    setPriority: (id, field, val) => { setTasks(p => p.map(t => t.id === id ? { ...t, [field]: val } : t)); },
    // matrix: set quadrant (val may be null = unprioritized) AND reposition relative to beforeId for drag-sort
    reorderMatrix: (id, field, val, beforeId) => setTasks(p => {
      const task = p.find(t => t.id === id);
      if (!task) return p;
      const updated = { ...task, [field]: val };
      const rest = p.filter(t => t.id !== id);
      const idx = (beforeId && beforeId !== id) ? rest.findIndex(t => t.id === beforeId) : -1;
      if (idx === -1) rest.push(updated); else rest.splice(idx, 0, updated);
      return rest;
    }),

    // focus
    startSession: ({ taskId, pomos, pomoLen, shortB, longEvery, autoB }) => setFocus({
      taskId, pomos, pomoLen, shortB, longEvery, autoB,
      phase: 'focus', currentPomo: 1, secondsLeft: pomoLen * 60, overtimeSec: 0,
      elapsedFocusSec: 0, totalOvertimeSec: 0, breaksTaken: 0, completedPomos: 0,
      distractions: 0, notes: '', running: true, breakLen: shortB * 60,
    }),
    startFocusWith: (t) => { setFocus({ phase: 'setup', taskId: t.id }); setView('focus'); setOpenTaskId(null); },
    togglePause: () => setFocus(f => ({ ...f, running: !f.running })),
    addDistraction: () => setFocus(f => ({ ...f, distractions: f.distractions + 1 })),
    setFocusNotes: (v) => setFocus(f => ({ ...f, notes: v })),
    takeBreak: () => setFocus(f => { const n = { ...f }; if (n.completedPomos >= n.pomos) { n.phase = 'complete'; n.running = false; } else startBreak(n); return n; }),
    skipPhase: () => setFocus(f => { const n = { ...f };
      if (n.phase === 'focus') { n.completedPomos++; if (n.completedPomos >= n.pomos) { n.phase = 'complete'; n.running = false; } else startBreak(n); }
      else if (n.phase === 'overtime') { if (n.completedPomos >= n.pomos) { n.phase = 'complete'; n.running = false; } else startBreak(n); }
      else if (n.phase === 'break') { if (n.completedPomos >= n.pomos) { n.phase = 'complete'; n.running = false; } else { n.currentPomo++; n.phase = 'focus'; n.secondsLeft = n.pomoLen * 60; } }
      return n; }),
    endSession: () => setFocus(f => ({ ...f, phase: f.completedPomos > 0 || f.elapsedFocusSec > 0 ? 'complete' : 'setup', running: false })),
    completeAnd: (action) => {
      setFocus(f => {
        const mins = Math.round(f.elapsedFocusSec / 60);
        setTasks(p => p.map(t => {
          if (t.id !== f.taskId) return t;
          const upd = { ...t, focusMin: (t.focusMin || 0) + mins, pomoActual: (t.pomoActual || 0) + f.completedPomos };
          if (action === 'done') { const b = boards.find(x => x.id === t.board); upd.col = firstCol(b, 'done'); }
          return upd;
        }));
        if (action === 'done') flash('Task marked done · time tracked');
        if (action === 'again') return { taskId: f.taskId, pomos: f.pomos, pomoLen: f.pomoLen, shortB: f.shortB,
          longEvery: f.longEvery, autoB: f.autoB, phase: 'focus', currentPomo: 1, secondsLeft: f.pomoLen * 60,
          overtimeSec: 0, elapsedFocusSec: 0, totalOvertimeSec: 0, breaksTaken: 0, completedPomos: 0, distractions: 0, notes: '', running: true, breakLen: f.shortB * 60 };
        return { phase: 'setup', taskId: action === 'new' ? null : f.taskId };
      });
    },

    // notes
    addNote: () => { const id = seed.uid('n'); setNotes(p => [{ id, type: 'idea', title: 'Untitled note', body: '# Untitled note\n\n', edited: Date.now() }, ...p]); return id; },
    updateNote: (id, patch) => setNotes(p => p.map(n => n.id === id ? { ...n, ...patch, edited: Date.now() } : n)),
    deleteNote: (id) => setNotes(p => p.filter(n => n.id !== id)),
    noteToTask: (note) => { setInbox(p => [{ id: seed.uid('i'), type: 'task', title: note.title, created: Date.now(), desc: '' }, ...p]); flash('Note sent to Inbox as a task'); },
    textToTask: (txt) => { setInbox(p => [{ id: seed.uid('i'), type: 'task', title: txt, created: Date.now(), desc: '' }, ...p]); flash('Line sent to Inbox as a task'); },

    // quick capture
    quickCapture: ({ type, title, boardId }) => {
      if (type === 'note') { setNotes(p => [{ id: seed.uid('n'), type: 'idea', title, body: '# ' + title + '\n\n', edited: Date.now() }, ...p]); flash('Note captured'); return; }
      if (boardId) { const b = boards.find(x => x.id === boardId); setTasks(p => [mkTask({ title, board: boardId, col: firstCol(b, 'todo') }), ...p]); flash(`Added to ${b.icon} ${b.name}`); return; }
      setInbox(p => [{ id: seed.uid('i'), type, title, created: Date.now(), desc: '' }, ...p]); flash('Captured to Inbox');
    },
    openSearch: () => setSearchOpen(true),
  };

  const openTask = tasks.find(t => t.id === openTaskId);
  const dragging = !!drag;

  // sidebar board drop
  const onBoardDrop = (b) => {
    if (!drag) return;
    if (drag.kind === 'inbox') api.inboxToBoard(drag.payload, b.id);
    else if (drag.kind === 'task') api.moveTask(drag.payload.id, b.id, firstCol(b, 'todo'));
    setDrag(null); setDropBoard(null);
  };

  const VIEW_META = {
    inbox: { t: 'Inbox', s: 'Capture & triage' },
    boards: { t: 'Boards', s: 'Your Kanban workflows' },
    matrix: { t: 'Matrix', s: 'Prioritize what matters' },
    focus: { t: 'Focus', s: 'Deep work, tracked honestly' },
    stats: { t: 'Stats', s: 'Insight, not judgment' },
    notes: { t: 'Notes', s: 'Where ideas live' },
    components: { t: 'Components', s: 'Design system' },
  };

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} boards={boards} activeBoard={activeBoard}
        inboxCount={inbox.length} notesCount={notes.length} api={api}
        dragging={dragging} dropBoard={dropBoard} setDropBoard={setDropBoard} onBoardDrop={onBoardDrop} />

      <div className="main">
        <div className="topbar">
          <div>
            <h1>{VIEW_META[view].t}</h1>
          </div>
          <span className="sub">{VIEW_META[view].s}</span>
          <div className="spacer" />
          <button className="btn ghost" onClick={() => setSearchOpen(true)}>
            <Icon name="search" size={15} /> Search <span className="kbd" style={{ marginLeft: 2 }}>⌘F</span></button>
          <button className="btn primary" onClick={() => setQuickOpen(true)}>
            <Icon name="plus" size={15} /> Capture <span className="kbd" style={{ marginLeft: 2, background: 'rgba(255,255,255,0.18)', borderColor: 'transparent', color: '#fff' }}>⌘K</span></button>
        </div>

        {view === 'inbox' && <InboxView inbox={inbox} boards={boards} api={api} drag={drag} />}
        {view === 'boards' && <BoardsView boards={boards} tasks={tasks} activeBoard={activeBoard} api={api} drag={drag} />}
        {view === 'matrix' && <MatrixView tasks={tasks} boards={boards} mode={matrixMode} api={api} drag={drag} />}
        {view === 'focus' && <FocusView focus={focus} tasks={tasks} boards={boards} api={api} />}
        {view === 'stats' && <StatsView stats={seed.STATS} heat={seed.HEAT} api={api} />}
        {view === 'notes' && <NotesView notes={notes} boards={boards} api={api} />}
        {view === 'components' && <ComponentSheet api={api} />}
      </div>

      <MiniPlayer focus={view !== 'focus' ? focus : null} tasks={tasks} api={api} />

      {openTask && <TaskModal task={openTask} boards={boards} api={api} onClose={() => setOpenTaskId(null)} />}
      {newBoardOpen && <NewBoardModal onClose={() => setNewBoardOpen(false)} onCreate={api.createBoard} />}
      {quickOpen && <QuickCapture boards={boards} api={api} onClose={() => setQuickOpen(false)} />}
      {searchOpen && <SearchModal tasks={tasks} notes={notes} boards={boards} api={api} onClose={() => setSearchOpen(false)} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ view, setView, boards, activeBoard, inboxCount, notesCount, api, dragging, dropBoard, setDropBoard, onBoardDrop }) {
  const Item = ({ id, icon, label, count, onClick, activeWhen }) => (
    <div className={'nav-item' + ((activeWhen ?? view === id) ? ' active' : '')} onClick={onClick || (() => setView(id))}>
      <span className="ico"><Icon name={icon} size={17} /></span>{label}
      {count != null && <span className="count tnum">{count}</span>}
    </div>
  );
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark"><span className="dot" /></div>
        <div className="brand-name">FO<span>·</span>CUS</div>
      </div>

      <div className="nav-group">
        <Item id="inbox" icon="inbox" label="Inbox" count={inboxCount} />
        <Item id="matrix" icon="matrix" label="Matrix" />
        <Item id="focus" icon="focus" label="Focus" />
        <Item id="stats" icon="stats" label="Stats" />
      </div>

      <div className="nav-group">
        <div className="nav-heading row">
          <span className="label">Boards</span>
          <div className="spacer" />
          <button className="iconbtn" style={{ width: 22, height: 22 }} onClick={() => api.openNewBoard()}>
            <Icon name="plus" size={14} /></button>
        </div>
        {boards.map(b => (
          <div key={b.id}
            className={'nav-item' + (view === 'boards' && activeBoard === b.id ? ' active' : '') + (dropBoard === b.id ? ' drop-target' : '')}
            onClick={() => api.setActiveBoard(b.id)}
            onDragOver={(e) => { if (dragging) { e.preventDefault(); setDropBoard(b.id); } }}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setDropBoard(null); }}
            onDrop={() => onBoardDrop(b)}>
            <span className="board-swatch" style={{ background: b.color }} />
            <span style={{ fontSize: 14 }}>{b.icon}</span>{b.name}
            {b.temporary && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--faint)' }}>TEMP</span>}
          </div>
        ))}
      </div>

      <div className="nav-group">
        <div className="nav-heading"><span className="label">Library</span></div>
        <Item id="notes" icon="notes" label="Notes" count={notesCount} />
        <Item id="components" icon="layers" label="Component sheet" />
      </div>

      <div className="sidebar-foot">
        <div className="user-chip">
          <div className="avatar">AK</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Alex Kowalski</div>
            <div className="meta" style={{ fontSize: 11 }}>Personal workspace</div>
          </div>
          <Icon name="settings" size={15} style={{ color: 'var(--muted)' }} />
        </div>
      </div>
    </div>
  );
}

// ---------- Global search ----------
function SearchModal({ tasks, notes, boards, api, onClose }) {
  const [q, setQ] = useState('');
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  const ql = q.toLowerCase();
  const tRes = q ? tasks.filter(t => t.title.toLowerCase().includes(ql)).slice(0, 6) : [];
  const nRes = q ? notes.filter(n => n.title.toLowerCase().includes(ql) || n.body.toLowerCase().includes(ql)).slice(0, 4) : [];
  const bRes = q ? boards.filter(b => b.name.toLowerCase().includes(ql)) : [];
  const empty = q && !tRes.length && !nRes.length && !bRes.length;

  return (
    <Modal onClose={onClose} width={600} top>
      <div className="row" style={{ padding: '14px 16px', gap: 12, borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--muted)' }}><Icon name="search" size={18} /></span>
        <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, notes, boards…"
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 17, outline: 'none' }} />
        <span className="kbd">esc</span>
      </div>
      <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: q ? '10px 10px 12px' : 0 }}>
        {!q && <div className="empty" style={{ padding: '34px 20px' }}><Icon name="search" size={24} /><div>Search across everything.</div></div>}
        {empty && <div className="empty" style={{ padding: '34px 20px' }}>No results for “{q}”.</div>}
        {bRes.length > 0 && <SearchGroup label="Boards">{bRes.map(b => (
          <div key={b.id} className="search-row" onClick={() => { api.setActiveBoard(b.id); onClose(); }}>
            <span style={{ fontSize: 15 }}>{b.icon}</span><span style={{ flex: 1 }}>{b.name}</span>
            <span className="meta">Board</span></div>))}</SearchGroup>}
        {tRes.length > 0 && <SearchGroup label="Tasks">{tRes.map(t => {
          const b = boards.find(x => x.id === t.board);
          return <div key={t.id} className="search-row" onClick={() => { api.openTask(t); onClose(); }}>
            <span className="board-swatch" style={{ background: b?.color }} /><span style={{ flex: 1 }}>{t.title}</span>
            <span className="meta">{b?.name}</span></div>;
        })}</SearchGroup>}
        {nRes.length > 0 && <SearchGroup label="Notes">{nRes.map(n => (
          <div key={n.id} className="search-row" onClick={() => { api.setView('notes'); onClose(); }}>
            <span style={{ fontSize: 13 }}>{NOTE_TYPE[n.type].emoji}</span><span style={{ flex: 1 }}>{n.title}</span>
            <span className="meta">Note</span></div>))}</SearchGroup>}
      </div>
    </Modal>
  );
}
function SearchGroup({ label, children }) {
  return (<div style={{ marginBottom: 6 }}>
    <div className="label" style={{ padding: '6px 10px 4px' }}>{label}</div>{children}</div>);
}

import ReactDOM from 'react-dom/client';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
