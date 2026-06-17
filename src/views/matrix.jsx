import { Icon, ICONS, PriorityPill, StatusPill, TagChip, TimerRing, TaskCard, Modal, Segmented, STATUS_META, PRIORITY_META, TYPE_BADGE, NOTE_TYPE, timeAgo, fmtMin, fmtClock } from '../components.jsx';
import { SEED } from '../data.jsx';
import React from 'react';
/* ============================================================
   VIEW: MATRIX — Eisenhower + Impact/Effort prioritization
   Cards are tinted by quadrant. Drag between any quadrant or
   back to the source panel; drag-sort within a quadrant.
   ============================================================ */
const MATRIX_MODES = {
  eisen: {
    axisX: { left: 'Not Urgent', right: 'Urgent' },
    axisY: { top: 'Important', bottom: 'Not Important' },
    quads: {
      tl: { key: 'schedule', title: 'SCHEDULE', sub: 'Important · Not Urgent', color: '#a87ff0' },
      tr: { key: 'do',       title: 'DO',       sub: 'Urgent · Important',     color: '#f08a3c' },
      bl: { key: 'delete',   title: 'ELIMINATE',sub: 'Neither',               color: '#6b6b80' },
      br: { key: 'delegate', title: 'DELEGATE', sub: 'Urgent · Not Important', color: '#e6a23c' },
    },
  },
  ie: {
    axisX: { left: 'Low Effort', right: 'High Effort' },
    axisY: { top: 'High Impact', bottom: 'Low Impact' },
    quads: {
      tl: { key: 'do',       title: 'QUICK WINS',     sub: 'High Impact · Low Effort',  color: '#f08a3c' },
      tr: { key: 'schedule', title: 'MAJOR PROJECTS', sub: 'High Impact · High Effort', color: '#a87ff0' },
      bl: { key: 'delegate', title: 'FILL-INS',       sub: 'Low Impact · Low Effort',   color: '#e6a23c' },
      br: { key: 'delete',   title: 'AVOID',          sub: 'Low Impact · High Effort',  color: '#6b6b80' },
    },
  },
};

// alpha helpers for hex accents
const tintBg   = (hex) => `${hex}1f`;  // ~12% fill
const tintBgHi = (hex) => `${hex}33`;  // hover / drag
const tintLine = (hex) => `${hex}66`;

function MatrixView({ tasks, boards, mode, api, drag }) {
  const cfg = MATRIX_MODES[mode];
  const field = mode === 'eisen' ? 'priority' : 'ie';
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [filterBoard, setFilterBoard] = React.useState('all');
  // { zone: quadKey | 'pool', beforeId: id|null }
  const [drop, setDrop] = React.useState(null);

  const draggingId = drag && drag.kind === 'task' ? drag.payload.id : null;
  const placed = (qkey) => tasks.filter(t => t[field] === qkey);
  const unprior = tasks.filter(t => !t[field] && (filterBoard === 'all' || t.board === filterBoard));
  const boardName = (id) => boards.find(b => b.id === id);

  const clearDrop = () => setDrop(null);
  const finish = () => { api.setDrag(null); setDrop(null); };
  const valFor = (zone) => (zone === 'pool' ? null : zone);

  // commit: position is computed from the actual event coords (robust, no dragover dependency)
  const commit = (zone, beforeId) => {
    if (!draggingId) { finish(); return; }
    if (beforeId !== draggingId) api.reorderMatrix(draggingId, field, valFor(zone), beforeId);
    finish();
  };
  // drop on a card → insert before/after based on cursor half
  const dropOnCard = (e, zone, list, idx) => {
    e.preventDefault(); e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const after = (e.clientY - r.top) > r.height / 2;
    commit(zone, after ? (list[idx + 1] ? list[idx + 1].id : null) : list[idx].id);
  };
  // drop on empty zone space → append to end
  const dropOnZone = (e, zone) => { e.preventDefault(); commit(zone, null); };

  // dragover handlers: required to allow drop + drive the visual insertion line
  const overCard = (e, zone, list, idx) => {
    e.preventDefault(); e.stopPropagation();
    if (!draggingId) return;
    const r = e.currentTarget.getBoundingClientRect();
    const after = (e.clientY - r.top) > r.height / 2;
    const beforeId = after ? (list[idx + 1] ? list[idx + 1].id : null) : list[idx].id;
    setDrop(prev => (prev && prev.zone === zone && prev.beforeId === beforeId ? prev : { zone, beforeId }));
  };
  const overZone = (e, zone) => {
    e.preventDefault();
    if (!draggingId) return;
    setDrop(prev => (prev && prev.zone === zone ? prev : { zone, beforeId: null }));
  };

  const DropLine = ({ accent }) => (
    <div style={{ height: 2, borderRadius: 2, background: accent || 'var(--accent)',
      boxShadow: `0 0 6px ${accent || 'var(--accent)'}`, margin: '1px 0', flexShrink: 0 }} />
  );

  const CardList = ({ zone, list, accent, source }) => {
    const active = !!draggingId;
    const isHere = drop && drop.zone === zone;
    return (
      <div className="col" style={{ gap: 6, overflowY: 'auto', flex: 1, paddingRight: 2, minHeight: 0 }}
        onDragOver={(e) => overZone(e, zone)}
        onDrop={(e) => dropOnZone(e, zone)}>
        {list.map((t, i) => (
          <React.Fragment key={t.id}>
            {isHere && drop.beforeId === t.id && draggingId !== t.id && <DropLine accent={accent} />}
            <div onDragOver={(e) => overCard(e, zone, list, i)} onDrop={(e) => dropOnCard(e, zone, list, i)}>
              <MiniTask task={t} board={boardName(t.board)} api={api}
                accent={accent} source={source} dim={draggingId === t.id} />
            </div>
          </React.Fragment>
        ))}
        {isHere && drop.beforeId === null && list.length > 0 && <DropLine accent={accent} />}
        {list.length === 0 && (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: source ? 0 : 64,
            border: `1px dashed ${isHere ? (accent || 'var(--accent)') : 'var(--border)'}`,
            borderRadius: 'var(--r-sm)', color: isHere ? (accent || 'var(--text-2)') : 'var(--faint)',
            fontSize: 12, transition: 'border-color .12s, color .12s', padding: '14px 8px',
            background: isHere ? tintBg(accent || '#3fb98a') : 'transparent' }}>
            {source ? <div className="empty" style={{ padding: 0, fontSize: 12.5 }}>
              <Icon name="check" size={22} /><div>All prioritized.</div></div>
              : (active ? 'Release to place here' : 'Drop tasks here')}
          </div>
        )}
      </div>
    );
  };

  const Quad = ({ pos }) => {
    const q = cfg.quads[pos];
    const list = placed(q.key);
    const totalP = list.reduce((s, t) => s + (t.pomoEst || 0), 0);
    const isHere = drop && drop.zone === q.key && draggingId;
    return (
      <div style={{
        background: isHere ? tintBg(q.color) : 'var(--surface)',
        border: `1px solid ${isHere ? tintLine(q.color) : 'var(--border)'}`,
        borderTop: `2px solid ${q.color}`,
        borderRadius: 'var(--r-md)', padding: 13, display: 'flex', flexDirection: 'column',
        minHeight: 0, transition: 'background .12s, border-color .12s', overflow: 'hidden',
      }}>
        <div className="row" style={{ marginBottom: 10, gap: 8, flexWrap: 'nowrap' }}>
          <span className="disp" style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '0.08em', color: q.color, flexShrink: 0 }}>{q.title}</span>
          <span className="meta" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.sub}</span>
          <div className="spacer" />
          <span className="tnum" style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{list.length}</span>
          <span className="tnum" style={{ fontSize: 11, color: q.color, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>🍅 {totalP}</span>
        </div>
        <CardList zone={q.key} list={list} accent={q.color} />
      </div>
    );
  };

  return (
    <div className="view-scroll" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onDragEnd={() => { api.setDrag(null); clearDrop(); }}>
      <div className="pad" style={{ paddingBottom: 14, flexShrink: 0 }}>
        <div className="row">
          <div>
            <h2 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>Prioritization Matrix</h2>
            <div className="meta" style={{ marginTop: 3 }}>
              Drag tasks between quadrants to set priority · drag to re-sort within one.
            </div>
          </div>
          <div className="spacer" />
          <Segmented value={mode} onChange={api.setMatrixMode}
            options={[{ value: 'eisen', label: 'Eisenhower' }, { value: 'ie', label: 'Impact / Effort' }]} />
          {!panelOpen && (
            <button className="btn ghost" onClick={() => setPanelOpen(true)} style={{ marginLeft: 8 }}>
              <Icon name="layers" size={15} /> Unprioritized ({unprior.length})
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 16, padding: '0 26px 26px', minHeight: 0 }}>
        {/* grid + axes */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '26px 1fr', gridTemplateRows: '1fr 26px', gap: 8, minHeight: 0 }}>
          {/* Y axis label */}
          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label" style={{ fontSize: 10 }}>{cfg.axisY.bottom}</span>
            <span className="label" style={{ fontSize: 11, color: 'var(--text-2)' }}>{cfg.axisY.top}</span>
          </div>
          {/* quadrants */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 10, minHeight: 0 }}>
            <Quad pos="tl" /><Quad pos="tr" /><Quad pos="bl" /><Quad pos="br" />
          </div>
          <div />
          {/* X axis label */}
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="label" style={{ fontSize: 10 }}>{cfg.axisX.left}</span>
            <span className="label" style={{ fontSize: 11, color: 'var(--text-2)' }}>{cfg.axisX.right}</span>
          </div>
        </div>

        {/* source panel */}
        {panelOpen && (
          <div className="card" style={{ width: 282, flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: 'var(--bg-2)', overflow: 'hidden',
            outline: drop && drop.zone === 'pool' && draggingId ? '1px solid var(--accent-line)' : 'none' }}>
            <div className="row" style={{ padding: '13px 14px 11px', borderBottom: '1px solid var(--border)' }}>
              <span className="label" style={{ color: 'var(--text-2)' }}>Unprioritized</span>
              <span className="meta tnum">{unprior.length}</span>
              <div className="spacer" />
              <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => setPanelOpen(false)}>
                <Icon name="collapse" size={15} /></button>
            </div>
            <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)' }}>
              <select className="input" value={filterBoard} onChange={(e) => setFilterBoard(e.target.value)}
                style={{ fontSize: 12.5, padding: '6px 9px', appearance: 'none', cursor: 'pointer' }}>
                <option value="all">All boards</option>
                {boards.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </select>
            </div>
            <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <CardList zone="pool" list={unprior} accent={null} source />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniTask({ task, board, api, accent, source, dim }) {
  const colored = !!accent;
  return (
    <div
      style={{
        padding: '9px 10px 9px 11px', cursor: 'grab', borderRadius: 'var(--r-sm)',
        position: 'relative', userSelect: 'none', opacity: dim ? 0.35 : 1,
        background: colored ? tintBg(accent) : 'var(--surface)',
        border: `1px solid ${colored ? tintLine(accent) : 'var(--border)'}`,
        borderLeft: `3px solid ${colored ? accent : (board ? board.color : 'var(--border-2)')}`,
        transition: 'background .12s, border-color .12s, transform .12s',
      }}
      draggable
      onMouseEnter={(e) => { if (!dim) { e.currentTarget.style.background = colored ? tintBgHi(accent) : 'var(--surface-2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = colored ? tintBg(accent) : 'var(--surface)'; e.currentTarget.style.transform = 'none'; }}
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); api.setDrag({ kind: 'task', payload: task }); }}
      onDragEnd={() => api.setDrag(null)}
      onClick={() => api.openTask(task)}>
      <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.32, color: 'var(--text)', textWrap: 'pretty' }}>{task.title}</div>
      <div className="row" style={{ gap: 9, marginTop: 6 }}>
        {board && <span className="meta" style={{ fontSize: 10.5 }}>
          <span className="board-swatch" style={{ background: board.color }} /> {board.name}</span>}
        <div className="spacer" />
        {task.due && <span className="meta tnum" style={{ fontSize: 10.5, color: colored ? accent : 'var(--muted)' }}>📅 {task.due}</span>}
        {task.pomoEst ? <span className="meta disp tnum" style={{ fontSize: 10.5 }}>🍅 {task.pomoEst}</span> : null}
      </div>
    </div>
  );
}

export { MatrixView, MATRIX_MODES };
