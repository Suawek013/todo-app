import { Icon, ICONS, PriorityPill, StatusPill, TagChip, TimerRing, TaskCard, Modal, Segmented, STATUS_META, PRIORITY_META, TYPE_BADGE, NOTE_TYPE, timeAgo, fmtMin, fmtClock } from '../components.jsx';
import { SEED } from '../data.jsx';
import React from 'react';
/* ============================================================
   VIEW: BOARDS — independent Kanban boards w/ drag & drop
   ============================================================ */
function BoardsView({ boards, tasks, activeBoard, api, drag }) {
  const board = boards.find(b => b.id === activeBoard) || boards[0];
  const boardTasks = tasks.filter(t => t.board === board.id);
  const done = boardTasks.filter(t => board.columns.find(c => c.id === t.col)?.status === 'done').length;
  const pct = boardTasks.length ? Math.round((done / boardTasks.length) * 100) : 0;
  const [dropCol, setDropCol] = React.useState(null);

  
  const getBeforeId = (e) => {
    const cards = Array.from(e.currentTarget.querySelectorAll('div[data-id]'));
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) return card.getAttribute('data-id');
    }
    return null;
  };
  const onDropTo = (e, colId) => {
    const beforeId = getBeforeId(e);
    e.preventDefault();
    setDropCol(null);
    if (drag && (drag.kind === 'task' || drag.kind === 'inbox')) {
      if (drag.kind === 'task') api.moveTask(drag.payload.id, board.id, colId, beforeId);
      else api.inboxToBoard(drag.payload, board.id, colId, beforeId);
      api.setDrag(null);
    }
  };

  return (
    <div className="view-scroll">
      <div className="pad" style={{ paddingBottom: 0 }}>
        {/* board selector */}
        <div className="row" style={{ gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {boards.map(b => (
            <button key={b.id}
              onClick={() => api.setActiveBoard(b.id)}
              className="btn"
              style={{
                background: b.id === board.id ? 'var(--surface-3)' : 'transparent',
                borderColor: b.id === board.id ? 'var(--border-2)' : 'transparent',
                color: b.id === board.id ? 'var(--text)' : 'var(--text-2)',
              }}>
              <span style={{ fontSize: 14 }}>{b.icon}</span>{b.name}
              {b.temporary && <span className="badge" style={{ padding: '0 5px', fontSize: 9.5,
                background: 'var(--surface-3)', color: 'var(--muted)' }}>TEMP</span>}
            </button>
          ))}
          <button className="btn ghost" onClick={() => api.openNewBoard()}>
            <Icon name="plus" size={15} /> New board
          </button>
        </div>

        {/* board header */}
        <div className="row" style={{ marginBottom: 20, gap: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${board.color}22`,
            border: `1px solid ${board.color}55`, display: 'grid', placeItems: 'center', fontSize: 20 }}>
            {board.icon}
          </div>
          <div>
            <h2 className="disp" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{board.name}</h2>
            <div className="row" style={{ gap: 12, marginTop: 3 }}>
              <span className="meta tnum">{boardTasks.length} tasks</span>
              <span className="meta tnum" style={{ color: 'var(--done)' }}>{pct}% complete</span>
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 220 }}>
            <div className="prog-bar" style={{ width: '100%', height: 6 }}>
              <i style={{ width: `${pct}%`, background: 'var(--done)' }} />
            </div>
          </div>
          <div className="spacer" />
          {board.temporary && (
            <button className="btn ghost danger"><Icon name="archive" size={15} /> Archive</button>
          )}
        </div>
      </div>

      {/* columns */}
      <div style={{ display: 'flex', gap: 14, padding: '0 26px 26px', alignItems: 'flex-start',
        overflowX: 'auto', minHeight: 'calc(100% - 170px)' }}>
        {board.columns.map(col => {
          const colTasks = boardTasks.filter(t => t.col === col.id);
          const m = STATUS_META[col.status];
          return (
            <div key={col.id}
              className="col"
              style={{ width: 300, flexShrink: 0, gap: 9 }}
              onDragOver={(e) => { e.preventDefault(); setDropCol({ colId: col.id, beforeId: getBeforeId(e) }); }}
              onDragLeave={(e) => { if (e.currentTarget === e.target) setDropCol(null); }}
              onDrop={(e) => onDropTo(e, col.id)}>
              <div className="row" style={{ padding: '2px 4px 0' }}>
                <span className="dot" style={{ background: m.color }} />
                <span className="label" style={{ color: 'var(--text-2)' }}>{col.name}</span>
                <span className="meta tnum">{colTasks.length}</span>
                <div className="spacer" />
                <button className="iconbtn" style={{ width: 24, height: 24 }}
                  onClick={() => api.addTaskToCol(board.id, col.id)}><Icon name="plus" size={14} /></button>
              </div>
              <div className="col" style={{ gap: 8, minHeight: 60,
                background: dropCol === col.id ? 'var(--accent-soft)' : 'transparent',
                borderRadius: 'var(--r-md)', padding: dropCol === col.id ? 4 : 0,
                outline: dropCol === col.id ? '1px dashed var(--accent-line)' : 'none',
                transition: 'background 0.12s' }}>
                {colTasks.map(t => (
                  <TaskCard key={t.id} task={t} board={board}
                    onOpen={api.openTask} onFocus={api.startFocusWith} onDelete={(tk) => api.deleteTask(tk.id)}
                    dragging={drag && drag.kind === 'task' && drag.payload.id === t.id}
                    onDragStart={() => api.setDrag({ kind: 'task', payload: t })}
                    onDragEnd={() => api.setDrag(null)} />
                ))}
                <AddTaskInline onAdd={(title) => api.addTaskToCol(board.id, col.id, title)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddTaskInline({ onAdd }) {
  const [open, setOpen] = React.useState(false);
  const [v, setV] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV(''); } };
  if (!open) return (
    <button className="btn ghost" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--muted)' }}
      onClick={() => setOpen(true)}><Icon name="plus" size={14} /> Add task</button>
  );
  return (
    <div className="task" style={{ cursor: 'default', padding: 10 }}>
      <textarea ref={ref} className="textarea" value={v} rows={2}
        style={{ minHeight: 0, border: 'none', background: 'transparent', padding: 0, fontSize: 13.5 }}
        placeholder="Task title…"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') setOpen(false); }} />
      <div className="row" style={{ marginTop: 6, gap: 7 }}>
        <button className="btn primary sm" onClick={submit}>Add</button>
        <button className="btn ghost sm" onClick={() => { setOpen(false); setV(''); }}>Cancel</button>
        <span className="spacer" /><span className="meta" style={{ fontSize: 11 }}>↵ to add</span>
      </div>
    </div>
  );
}

// ---------- New board modal ----------
function NewBoardModal({ onClose, onCreate }) {
  const EMOJIS = ['📋','💼','🎬','🚀','🏡','📚','💡','🎯','🔬','🎨','💪','✈️','🛒','🎸'];
  const COLORS = ['#5b8def','#f08a3c','#a87ff0','#3fb98a','#e6a23c','#f0586a','#6b6b80'];
  const TEMPLATES = [
    { id: '3', label: '3-column', cols: ['Todo','In Progress','Done'] },
    { id: '4', label: '4-column', cols: ['Todo','In Progress','Review','Done'] },
    { id: 'blank', label: 'Blank', cols: ['Todo'] },
  ];
  const [name, setName] = React.useState('');
  const [icon, setIcon] = React.useState('📋');
  const [color, setColor] = React.useState('#5b8def');
  const [tpl, setTpl] = React.useState('3');
  const [temp, setTemp] = React.useState(false);

  return (
    <Modal onClose={onClose} width={500}>
      <div className="modal-head">
        <h3>New board</h3><div className="spacer" />
        <button className="iconbtn" onClick={onClose}><Icon name="close" size={16} /></button>
      </div>
      <div className="modal-body">
        <div className="field">
          <label className="label">Board name</label>
          <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wedding planning" />
        </div>
        <div className="row" style={{ gap: 22, alignItems: 'flex-start' }}>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setIcon(e)}
                  style={{ width: 34, height: 34, borderRadius: 8, fontSize: 17, cursor: 'pointer',
                    border: `1px solid ${icon === e ? 'var(--accent-line)' : 'var(--border)'}`,
                    background: icon === e ? 'var(--accent-soft)' : 'var(--bg)' }}>{e}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Accent color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width: 28, height: 28, borderRadius: 8, cursor: 'pointer', background: c,
                  border: color === c ? '2px solid var(--text)' : '2px solid transparent',
                  outline: color === c ? `1px solid ${c}` : 'none' }} />
            ))}
          </div>
        </div>
        <div className="field">
          <label className="label">Template</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTpl(t.id)} className="card"
                style={{ flex: 1, padding: '11px 12px', cursor: 'pointer', textAlign: 'left',
                  borderColor: tpl === t.id ? 'var(--accent-line)' : 'var(--border)',
                  background: tpl === t.id ? 'var(--accent-soft)' : 'var(--surface)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.label}</div>
                <div className="meta" style={{ fontSize: 11, marginTop: 3 }}>{t.cols.join(' · ')}</div>
              </button>
            ))}
          </div>
        </div>
        <label className="row" style={{ gap: 10, cursor: 'pointer', userSelect: 'none' }}>
          <Toggle on={temp} onChange={setTemp} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Temporary board</div>
            <div className="meta" style={{ fontSize: 11.5 }}>Mark as ad-hoc — easy to archive later</div>
          </div>
        </label>
      </div>
      <div className="modal-foot">
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!name.trim()}
          onClick={() => onCreate({ name: name.trim(), icon, color,
            cols: TEMPLATES.find(t => t.id === tpl).cols, temp })}>Create board</button>
      </div>
    </Modal>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} type="button"
      style={{ width: 40, height: 23, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
        background: on ? 'var(--accent)' : 'var(--border-2)', position: 'relative', transition: 'background 0.16s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 17, height: 17, borderRadius: '50%',
        background: '#fff', transition: 'left 0.16s var(--ease)' }} />
    </button>
  );
}

export { BoardsView, NewBoardModal, Toggle };
