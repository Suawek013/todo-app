import { Icon, ICONS, PriorityPill, StatusPill, TagChip, TimerRing, TaskCard, Modal, Segmented, STATUS_META, PRIORITY_META, TYPE_BADGE, NOTE_TYPE, timeAgo, fmtMin, fmtClock } from '../components.jsx';
import { SEED } from '../data.jsx';

import React from 'react';
/* ============================================================
   MODALS — Task detail + Global quick capture
   ============================================================ */
function TaskModal({ task, boards, api, onClose }) {
  const board = boards.find(b => b.id === task.board);
  const col = board?.columns.find(c => c.id === task.col);
  const subDone = task.subtasks.filter(s => s.done).length;
  const [newSub, setNewSub] = React.useState('');
  const [allTags] = React.useState(Object.values(SEED.TAGS));

  return (
    <Modal onClose={onClose} width={620}>
      <div className="modal-head" style={{ paddingBottom: 14 }}>
        {task.priority && <PriorityPill p={task.priority} />}
        <div className="spacer" />
        <button className="btn sm" onClick={() => { api.startFocusWith(task); onClose(); }}>
          <Icon name="play" size={13} /> Focus</button>
        <button className="iconbtn" onClick={onClose}><Icon name="close" size={16} /></button>
      </div>
      <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        <textarea value={task.title} onChange={(e) => api.updateTask(task.id, { title: e.target.value })}
          rows={1} className="disp"
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 21,
            fontWeight: 600, outline: 'none', resize: 'none', lineHeight: 1.3, marginBottom: 14, fontFamily: 'var(--font-disp)' }} />

        {/* meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', alignItems: 'center', marginBottom: 18 }}>
          <span className="label">Board</span>
          <span className="row" style={{ gap: 7 }}><span style={{ fontSize: 14 }}>{board?.icon}</span>{board?.name}
            <span className="meta">›</span><StatusPill status={col?.status} /></span>
          <span className="label">Estimate</span>
          <span className="row disp tnum" style={{ gap: 7, fontSize: 13 }}>
            🍅 {task.pomoEst} estimated
            <span className="meta">·</span>
            <span style={{ color: task.pomoActual > task.pomoEst ? 'var(--accent)' : 'var(--text)' }}>
              {task.pomoActual} actual</span>
            {task.focusMin ? <span className="meta">({window.fmtMin(task.focusMin)} tracked)</span> : null}</span>
          {task.due && <><span className="label">Due</span><span className="row" style={{ gap: 6 }}><Icon name="cal" size={14} style={{ color: 'var(--muted)' }} />{task.due}</span></>}
        </div>

        {/* description */}
        <div className="field">
          <label className="label">Description</label>
          <textarea className="textarea" value={task.desc} placeholder="Add a description…"
            onChange={(e) => api.updateTask(task.id, { desc: e.target.value })} style={{ minHeight: 60 }} />
        </div>

        {/* tags */}
        <div className="field">
          <label className="label">Tags</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allTags.map(t => {
              const on = task.tags.includes(t.id);
              return (
                <button key={t.id} onClick={() => api.toggleTag(task.id, t.id)}
                  className="tag" style={{ cursor: 'pointer',
                    background: on ? `${t.color}22` : 'var(--surface-2)',
                    borderColor: on ? t.color : 'var(--border)',
                    color: on ? t.color : 'var(--muted)', opacity: on ? 1 : 0.65 }}>
                  <span className="tdot" style={{ background: t.color }} />{t.label}</button>
              );
            })}
          </div>
        </div>

        {/* subtasks */}
        <div className="field">
          <label className="label">Subtasks {task.subtasks.length ? `· ${subDone}/${task.subtasks.length}` : ''}</label>
          {task.subtasks.length > 0 && (
            <div className="prog-bar" style={{ width: '100%', height: 5, marginBottom: 10 }}>
              <i style={{ width: `${(subDone/task.subtasks.length)*100}%` }} /></div>
          )}
          <div className="col" style={{ gap: 2 }}>
            {task.subtasks.map((s, i) => (
              <label key={i} className="row md-row" style={{ gap: 10, padding: '5px 4px', cursor: 'pointer', borderRadius: 5 }}>
                <span onClick={() => api.toggleSub(task.id, i)}
                  style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                    border: `1.5px solid ${s.done ? 'var(--done)' : 'var(--border-2)'}`,
                    background: s.done ? 'var(--done)' : 'transparent', display: 'grid', placeItems: 'center' }}>
                  {s.done && <Icon name="check" size={11} style={{ color: '#fff' }} />}</span>
                <span style={{ flex: 1, fontSize: 13.5, color: s.done ? 'var(--muted)' : 'var(--text)',
                  textDecoration: s.done ? 'line-through' : 'none' }}>{s.t}</span>
                <button className="iconbtn convert-btn" style={{ width: 22, height: 22, opacity: 0 }}
                  onClick={(e) => { e.preventDefault(); api.removeSub(task.id, i); }}><Icon name="close" size={12} /></button>
              </label>
            ))}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <input className="input" value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="Add subtask…"
              style={{ fontSize: 13, padding: '7px 10px' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && newSub.trim()) { api.addSub(task.id, newSub.trim()); setNewSub(''); } }} />
          </div>
        </div>

        {/* activity */}
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label">Activity</label>
          <div className="col" style={{ gap: 8 }}>
            {[
              { ic: 'play', t: `Focused for ${window.fmtMin(task.focusMin || 0)}`, when: '2h ago', show: !!task.focusMin },
              { ic: 'arrow', t: `Moved to ${col?.name}`, when: 'yesterday', show: true },
              { ic: 'plus', t: 'Created', when: '3 days ago', show: true },
            ].filter(a => a.show).map((a, i) => (
              <div key={i} className="row" style={{ gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-2)',
                  display: 'grid', placeItems: 'center', color: 'var(--muted)', flexShrink: 0 }}><Icon name={a.ic} size={12} /></span>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{a.t}</span>
                <span className="meta" style={{ fontSize: 11 }}>{a.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost danger" onClick={() => { api.deleteTask(task.id); onClose(); }}>
            <Icon name="trash" size={14} /> Delete</button>
          <button className="btn ghost" onClick={() => { api.archiveTask(task.id); onClose(); }}>
            <Icon name="archive" size={14} /> Archive</button>
        </div>
        <button className="btn primary" onClick={() => { api.startFocusWith(task); onClose(); }}>
          <Icon name="play" size={14} /> Start focus session</button>
      </div>
    </Modal>
  );
}

// ---------- Quick capture (Cmd/K) ----------
function QuickCapture({ boards, api, onClose }) {
  const [type, setType] = React.useState('task');
  const [text, setText] = React.useState('');
  const [boardId, setBoardId] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  const save = () => {
    if (!text.trim()) return;
    api.quickCapture({ type, title: text.trim(), boardId: type === 'task' ? boardId : '' });
    onClose();
  };

  return (
    <Modal onClose={onClose} width={560} top>
      <div style={{ padding: '6px 6px 0' }}>
        <div className="row" style={{ padding: '14px 16px 12px', gap: 12, borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--accent)' }}><Icon name="command" size={18} /></span>
          <input ref={ref} value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            placeholder={type === 'note' ? 'Write a note…' : type === 'idea' ? "Capture an idea…" : "What needs doing?"}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 18, outline: 'none' }} />
          <span className="kbd">esc</span>
        </div>
      </div>
      <div className="row" style={{ padding: '13px 16px', gap: 12, flexWrap: 'wrap' }}>
        <span className="label">Type</span>
        <Segmented size="sm" value={type} onChange={setType}
          options={[{value:'task',label:'📝 Task'},{value:'note',label:'📄 Note'},{value:'idea',label:'💭 Idea'}]} />
        {type === 'task' && (
          <>
            <span className="label" style={{ marginLeft: 6 }}>Board</span>
            <select className="input" value={boardId} onChange={(e) => setBoardId(e.target.value)}
              style={{ width: 'auto', fontSize: 12.5, padding: '5px 9px', cursor: 'pointer' }}>
              <option value="">Inbox (triage later)</option>
              {boards.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
            </select>
          </>
        )}
        <div className="spacer" />
        <button className="btn primary sm" onClick={save} disabled={!text.trim()}>
          Save <span className="kbd" style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'transparent', color: '#fff' }}>↵</span></button>
      </div>
    </Modal>
  );
}

export { TaskModal, QuickCapture };
