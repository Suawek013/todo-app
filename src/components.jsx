import { SEED } from './data.jsx';

import React from 'react';
/* ============================================================
   COMPONENTS — icons + shared primitives (exported to window)
   ============================================================ */

// ---------- Icon set (simple, Feather-style line icons) ----------
const ICONS = {
  inbox:  'M3 12h4l2 3h6l2-3h4 M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  board:  'M4 4h5v16H4z M10 4h5v10h-5z M16 4h4v13h-4z',
  matrix: 'M4 4h16v16H4z M12 4v16 M4 12h16',
  focus:  'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  stats:  'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  notes:  'M6 3h9l5 5v13a0 0 0 0 1 0 0H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M14 3v5h5 M9 13h6 M9 17h4',
  search: 'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0 M21 21l-4.3-4.3',
  plus:   'M12 5v14 M5 12h14',
  close:  'M6 6l12 12 M18 6L6 18',
  check:  'M5 13l4 4L19 7',
  trash:  'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
  star:   'M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.8 1.2-6L3.3 9.4l6.1-.8z',
  arrow:  'M5 12h14 M13 6l6 6-6 6',
  edit:   'M4 20h4l10-10-4-4L4 16z M14 6l4 4',
  play:   'M7 5v14l11-7z',
  pause:  'M8 5h3v14H8z M14 5h3v14h-3z',
  skip:   'M6 5l9 7-9 7z M17 5v14',
  chevL:  'M15 6l-6 6 6 6',
  chevR:  'M9 6l6 6-6 6',
  chevD:  'M6 9l6 6 6-6',
  drag:   'M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01',
  cal:    'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M4 9h16 M8 3v4 M16 3v4',
  clock:  'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M12 7v5l3 2',
  more:   'M5 12h.01 M12 12h.01 M19 12h.01',
  filter: 'M3 5h18 M6 12h12 M10 19h4',
  flag:   'M5 3v18 M5 4h11l-2 4 2 4H5',
  archive:'M3 5h18v4H3z M5 9v11h14V9 M10 13h4',
  layers: 'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5',
  flame:  'M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1 0 1-2 1-3 0-2-1-3-1-5z',
  reset:  'M4 4v6h6 M20 20v-6h-6 M5 10a8 8 0 0 1 14-2 M19 14a8 8 0 0 1-14 2',
  bell:   'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6 M10 20a2 2 0 0 0 4 0',
  settings:'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2 2 M16.4 16.4l2 2 M18.4 5.6l-2 2 M7.6 16.4l-2 2',
  command:'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
  link:   'M10 14a4 4 0 0 0 6 0l2-2a4 4 0 0 0-6-6l-1 1 M14 10a4 4 0 0 0-6 0l-2 2a4 4 0 0 0 6 6l1-1',
  collapse:'M9 4v16 M14 9l-3 3 3 3',
};

function Icon({ name, size = 18, stroke = 2, fill = false, style }) {
  const d = ICONS[name];
  if (!d) return null;
  const filled = name === 'star' || name === 'play' || name === 'flame';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}

// ---------- small primitives ----------
const STATUS_META = {
  todo:     { label: 'Todo',        color: 'var(--todo)' },
  progress: { label: 'In Progress', color: 'var(--progress)' },
  done:     { label: 'Done',        color: 'var(--done)' },
  blocked:  { label: 'Blocked',     color: 'var(--blocked)' },
};

const PRIORITY_META = {
  do:       { label: 'DO',       color: 'var(--q-do)',       hex: '#f08a3c' },
  schedule: { label: 'SCHEDULE', color: 'var(--q-schedule)', hex: '#a87ff0' },
  delegate: { label: 'DELEGATE', color: 'var(--q-delegate)', hex: '#e6a23c' },
  delete:   { label: 'DELETE',   color: 'var(--q-delete)',   hex: '#6b6b80' },
};

function PriorityPill({ p, mini }) {
  if (!p) return null;
  const m = PRIORITY_META[p];
  if (mini) return <span className="dot" style={{ background: m.color }} title={m.label} />;
  return (
    <span className="pill" style={{ background: `${m.hex}22`, color: m.hex }}>
      <span className="dot" style={{ background: m.color }} />{m.label}
    </span>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.todo;
  return (
    <span className="pill" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
      <span className="dot" style={{ background: m.color }} />{m.label}
    </span>
  );
}

function TagChip({ id }) {
  const t = SEED.TAGS[id];
  if (!t) return null;
  return <span className="tag"><span className="tdot" style={{ background: t.color }} />{t.label}</span>;
}

const TYPE_BADGE = {
  task: { emoji: '📝', label: 'Task' },
  idea: { emoji: '💭', label: 'Idea' },
  note: { emoji: '📄', label: 'Note' },
};
const NOTE_TYPE = {
  idea:      { emoji: '💡', label: 'Idea' },
  meeting:   { emoji: '📝', label: 'Meeting' },
  plan:      { emoji: '🎯', label: 'Plan' },
  reference: { emoji: '📖', label: 'Reference' },
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
}

const fmtMin = (m) => {
  const h = Math.floor(m / 60), mm = m % 60;
  return h ? `${h}h ${mm}min` : `${mm}min`;
};
const fmtClock = (sec) => {
  const m = Math.floor(Math.abs(sec) / 60), s = Math.abs(sec) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ---------- Timer ring ----------
function TimerRing({ size = 280, stroke = 14, progress = 0, color = 'var(--accent)', children, track = 'var(--border)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ---------- Task card ----------
function TaskCard({ task, board, onOpen, onFocus, onDelete, draggable = true, onDragStart, onDragEnd, dragging, compact }) {
  const subDone = task.subtasks.filter(s => s.done).length;
  const due = task.due;
  return (
    <div
      className={'task' + (dragging ? ' dragging' : '')}
      draggable={draggable}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); onDragStart && onDragStart(e, task); }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen && onOpen(task)}
    >
      <div className="quickact">
        {onFocus && <button className="iconbtn" title="Start focus session"
          onClick={(e) => { e.stopPropagation(); onFocus(task); }}><Icon name="play" size={13} /></button>}
        <button className="iconbtn" title="Edit"
          onClick={(e) => { e.stopPropagation(); onOpen && onOpen(task); }}><Icon name="edit" size={13} /></button>
        {onDelete && <button className="iconbtn" title="Delete"
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}><Icon name="trash" size={13} /></button>}
      </div>
      <div className="ttitle" style={{ paddingRight: 30 }}>{task.title}</div>
      {!compact && task.desc ? <div className="tdesc">{task.desc}</div> : null}
      <div className="tfoot">
        {task.priority && <PriorityPill p={task.priority} mini />}
        {task.pomoEst ? <span className="meta disp tnum">🍅 {task.pomoEst}</span> : null}
        {due ? <span className="meta"><Icon name="cal" size={12} /> {due}</span> : null}
        {task.subtasks.length ? (
          <span className="prog-mini disp tnum">
            <span className="prog-bar"><i style={{ width: `${(subDone/task.subtasks.length)*100}%` }} /></span>
            {subDone}/{task.subtasks.length}
          </span>
        ) : null}
      </div>
      {task.tags.length ? (
        <div className="tags">{task.tags.map(t => <TagChip key={t} id={t} />)}</div>
      ) : null}
    </div>
  );
}

// ---------- Modal shell ----------
function Modal({ children, onClose, width = 540, top = false }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className={'overlay' + (top ? ' top' : '')} onMouseDown={onClose}>
      <div className="modal" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ---------- Segmented control ----------
function Segmented({ options, value, onChange, size }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)', padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{
            border: 'none', cursor: 'pointer', borderRadius: 5,
            padding: size === 'sm' ? '4px 10px' : '6px 14px',
            fontSize: size === 'sm' ? 12 : 13, fontWeight: 600, fontFamily: 'var(--font-disp)',
            letterSpacing: '0.02em',
            background: value === o.value ? 'var(--surface-3)' : 'transparent',
            color: value === o.value ? 'var(--text)' : 'var(--muted)',
            transition: 'background 0.14s, color 0.14s',
          }}>{o.label}</button>
      ))}
    </div>
  );
}

export {
  Icon, ICONS, PriorityPill, StatusPill, TagChip, TimerRing, TaskCard, Modal, Segmented,
  STATUS_META, PRIORITY_META, TYPE_BADGE, NOTE_TYPE, timeAgo, fmtMin, fmtClock,
};
