import { TYPE_BADGE, timeAgo } from '../components.jsx';

import React from 'react';
/* ============================================================
   VIEW: INBOX — capture + triage
   ============================================================ */
function InboxView({ inbox, boards, api, drag }) {
  const [text, setText] = React.useState('');
  const [pickerFor, setPickerFor] = React.useState(null); // item awaiting board pick
  const inputRef = React.useRef(null);

  const capture = () => {
    const v = text.trim();
    if (!v) return;
    api.addInbox({ type: 'task', title: v });
    setText('');
  };

  return (
    <div className="view-scroll">
      <div className="pad" style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* capture */}
        <div className="card" style={{ padding: 14, marginBottom: 22,
          boxShadow: '0 0 0 1px var(--accent-line), 0 8px 30px rgba(63,185,138,0.06)',
          borderColor: 'var(--accent-line)' }}>
          <div className="row" style={{ gap: 11 }}>
            <span style={{ color: 'var(--accent)' }}><Icon name="plus" size={20} /></span>
            <input ref={inputRef} className="input" value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') capture(); }}
              placeholder="What's on your mind?"
              style={{ border: 'none', background: 'transparent', fontSize: 16, padding: '6px 0' }} autoFocus />
            <span className="kbd">↵</span>
            <button className="btn primary" onClick={capture} disabled={!text.trim()}>Capture</button>
          </div>
        </div>

        <div className="row" style={{ marginBottom: 14, paddingLeft: 2 }}>
          <span className="label">Inbox</span>
          <span className="meta tnum" style={{ marginLeft: 4 }}>{inbox.length} unprocessed</span>
          <div className="spacer" />
          <span className="meta" style={{ fontSize: 11 }}>
            <span className="kbd" style={{ marginRight: 5 }}>⌘K</span> capture from anywhere
          </span>
        </div>

        {inbox.length === 0 ? (
          <div className="empty" style={{ paddingTop: 70 }}>
            <div style={{ fontSize: 40 }}>📥</div>
            <div className="big">Inbox zero.</div>
            <div>Capture something to get started.</div>
            <button className="btn primary" style={{ marginTop: 6 }}
              onClick={() => inputRef.current && inputRef.current.focus()}>
              <Icon name="plus" size={15} /> Capture
            </button>
          </div>
        ) : (
          <div className="col" style={{ gap: 9 }}>
            {inbox.map((it, i) => (
              <InboxItem key={it.id} item={it} index={i} boards={boards} api={api}
                onPick={() => setPickerFor(it)} drag={drag} />
            ))}
          </div>
        )}
      </div>

      {pickerFor && (
        <Modal onClose={() => setPickerFor(null)} width={420}>
          <div className="modal-head"><h3>Move to board</h3>
            <div className="spacer" />
            <button className="iconbtn" onClick={() => setPickerFor(null)}><Icon name="close" size={16} /></button>
          </div>
          <div className="modal-body" style={{ display: 'grid', gap: 8 }}>
            <div className="meta" style={{ marginBottom: 4 }}>“{pickerFor.title}”</div>
            {boards.map(b => (
              <button key={b.id} className="btn" style={{ justifyContent: 'flex-start', padding: '11px 13px' }}
                onClick={() => { api.inboxToBoard(pickerFor, b.id); setPickerFor(null); }}>
                <span style={{ fontSize: 16 }}>{b.icon}</span>
                <span className="board-swatch" style={{ background: b.color }} />
                {b.name}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function InboxItem({ item, index, boards, api, onPick, drag }) {
  const badge = TYPE_BADGE[item.type];
  return (
    <div className="card rise"
      style={{ padding: '13px 14px 13px 12px', display: 'flex', gap: 11, alignItems: 'flex-start',
        animationDelay: `${index * 35}ms`, cursor: 'default' }}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; api.setDrag({ kind: 'inbox', payload: item }); }}
      onDragEnd={() => api.setDrag(null)}>
      <span style={{ color: 'var(--faint)', cursor: 'grab', marginTop: 2, flexShrink: 0 }}
        title="Drag to a board or the matrix"><Icon name="drag" size={16} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 9, alignItems: 'baseline' }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{item.title}</span>
        </div>
        {item.desc && <div className="tdesc" style={{ marginTop: 4, fontSize: 12.5 }}>{item.desc}</div>}
        <div className="row" style={{ gap: 10, marginTop: 9 }}>
          <span className="badge">{badge.emoji} {badge.label}</span>
          <span className="meta">{timeAgo(item.created)}</span>
        </div>
      </div>
      <div className="row triage" style={{ gap: 2, flexShrink: 0, alignSelf: 'center' }}>
        <button className="iconbtn" title="Move to board" onClick={onPick}><Icon name="board" size={15} /></button>
        <button className="iconbtn" title="Prioritize in Matrix" onClick={() => api.inboxToMatrix(item)}><Icon name="star" size={15} /></button>
        <button className="iconbtn" title="Convert to note" onClick={() => api.inboxToNote(item)}><Icon name="notes" size={15} /></button>
        <button className="iconbtn" title="Delete" onClick={() => api.deleteInbox(item.id)}><Icon name="trash" size={15} /></button>
      </div>
    </div>
  );
}

export { InboxView };
