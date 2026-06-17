import { NOTE_TYPE, timeAgo } from '../components.jsx';

import React from 'react';
/* ============================================================
   VIEW: NOTES — list + markdown editor, convert to task
   ============================================================ */
function NotesView({ notes, boards, api }) {
  const [activeId, setActiveId] = React.useState(notes[0]?.id || null);
  const [mode, setMode] = React.useState('preview');
  const [filter, setFilter] = React.useState('all');
  const note = notes.find(n => n.id === activeId);

  const list = filter === 'all' ? notes : notes.filter(n => n.type === filter);

  React.useEffect(() => { if (!notes.find(n => n.id === activeId)) setActiveId(notes[0]?.id || null); }, [notes]);

  return (
    <div className="view-scroll" style={{ display: 'flex', overflow: 'hidden' }}>
      {/* list pane */}
      <div style={{ width: 290, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', background: 'var(--bg-2)' }}>
        <div className="row" style={{ padding: '13px 14px 10px' }}>
          <span className="label" style={{ color: 'var(--text-2)' }}>Notes</span>
          <span className="meta tnum">{notes.length}</span>
          <div className="spacer" />
          <button className="iconbtn" title="New note" onClick={() => { const id = api.addNote(); setActiveId(id); setMode('edit'); }}>
            <Icon name="plus" size={16} /></button>
        </div>
        <div className="row" style={{ gap: 5, padding: '0 12px 10px', flexWrap: 'wrap' }}>
          {['all','idea','meeting','plan','reference'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="tag"
              style={{ cursor: 'pointer', textTransform: 'capitalize',
                background: filter === f ? 'var(--accent-soft)' : 'var(--surface-2)',
                color: filter === f ? 'var(--accent)' : 'var(--text-2)',
                borderColor: filter === f ? 'var(--accent-line)' : 'var(--border)' }}>
              {f === 'all' ? 'All' : NOTE_TYPE[f].emoji + ' ' + NOTE_TYPE[f].label}</button>
          ))}
        </div>
        <div className="col" style={{ overflowY: 'auto', flex: 1, padding: '2px 8px 8px' }}>
          {list.map(n => {
            const nt = NOTE_TYPE[n.type];
            const snippet = n.body.replace(/[#>*`\-\[\]]/g, '').replace(/\n+/g, ' ').trim().slice(0, 60);
            return (
              <button key={n.id} onClick={() => { setActiveId(n.id); setMode('preview'); }}
                style={{ textAlign: 'left', border: 'none', cursor: 'pointer', padding: '10px 10px', borderRadius: 'var(--r-sm)',
                  background: n.id === activeId ? 'var(--surface-2)' : 'transparent', marginBottom: 2,
                  boxShadow: n.id === activeId ? 'inset 0 0 0 1px var(--border-2)' : 'none' }}>
                <div className="row" style={{ gap: 7, marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{nt.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                </div>
                <div className="meta" style={{ fontSize: 11.5, lineHeight: 1.4, display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{snippet}</div>
                <div className="meta" style={{ fontSize: 10.5, marginTop: 5 }}>{timeAgo(n.edited)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* editor pane */}
      {note ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="row" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{NOTE_TYPE[note.type].emoji}</span>
            <input value={note.title} onChange={(e) => api.updateNote(note.id, { title: e.target.value })}
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 17,
                fontWeight: 600, fontFamily: 'var(--font-disp)', outline: 'none' }} />
            <Segmented size="sm" value={mode} onChange={setMode}
              options={[{value:'preview',label:'Preview'},{value:'edit',label:'Edit'}]} />
            <button className="btn sm primary" onClick={() => api.noteToTask(note)}>
              <Icon name="arrow" size={13} /> Convert to task</button>
            <button className="iconbtn" onClick={() => api.deleteNote(note.id)}><Icon name="trash" size={15} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 720, padding: '26px 32px' }}>
              {mode === 'edit' ? (
                <textarea className="textarea" value={note.body}
                  onChange={(e) => api.updateNote(note.id, { body: e.target.value })}
                  style={{ minHeight: 'calc(100vh - 200px)', fontFamily: 'var(--font-disp)', fontSize: 14, lineHeight: 1.7,
                    border: 'none', background: 'transparent', padding: 0 }} />
              ) : (
                <Markdown text={note.body} api={api} />
              )}
            </div>
          </div>
          {mode === 'preview' && (
            <div className="meta" style={{ padding: '8px 32px', borderTop: '1px solid var(--border)', fontSize: 11.5 }}>
              💡 Tip — switch to <b>Edit</b> for markdown. Select a line and use “Convert to task” to send it to your inbox.
            </div>
          )}
        </div>
      ) : (
        <div className="empty" style={{ flex: 1 }}><div className="big">No note selected</div></div>
      )}
    </div>
  );
}

// ---------- minimal markdown renderer ----------
function inline(text) {
  // bold, italic, code — returns array of react nodes
  const parts = [];
  let rest = text, key = 0;
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/;
  let m;
  while ((m = re.exec(rest))) {
    if (m.index > 0) parts.push(rest.slice(0, m.index));
    if (m[2]) parts.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={key++}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={key++} style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-disp)', fontSize: '0.9em', color: 'var(--accent)' }}>{m[4]}</code>);
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) parts.push(rest);
  return parts;
}

function Markdown({ text, api }) {
  const lines = text.split('\n');
  const els = [];
  let listBuf = [], i = 0;
  const flush = () => { if (listBuf.length) { els.push(<ul key={'ul'+i} style={{ margin: '8px 0 14px', paddingLeft: 4, listStyle: 'none' }}>{listBuf}</ul>); listBuf = []; } };
  lines.forEach((ln, idx) => {
    i = idx;
    const Convert = ({ children }) => (
      <span style={{ position: 'relative' }} className="md-line">{children}</span>
    );
    if (/^#\s/.test(ln)) { flush(); els.push(<h1 key={idx} className="disp" style={{ fontSize: 24, fontWeight: 600, margin: '4px 0 12px' }}>{inline(ln.slice(2))}</h1>); }
    else if (/^##\s/.test(ln)) { flush(); els.push(<h2 key={idx} className="disp" style={{ fontSize: 18, fontWeight: 600, margin: '20px 0 8px' }}>{inline(ln.slice(3))}</h2>); }
    else if (/^>\s/.test(ln)) { flush(); els.push(<blockquote key={idx} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 14, margin: '12px 0', color: 'var(--text-2)', fontStyle: 'italic' }}>{inline(ln.slice(2))}</blockquote>); }
    else if (/^- \[([ x])\]\s/.test(ln)) {
      const done = ln[3] === 'x'; const txt = ln.slice(6);
      listBuf.push(<li key={idx} className="row md-row" style={{ gap: 9, padding: '3px 0', alignItems: 'flex-start' }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${done ? 'var(--done)' : 'var(--border-2)'}`,
          background: done ? 'var(--done)' : 'transparent', display: 'grid', placeItems: 'center', marginTop: 2, flexShrink: 0 }}>
          {done && <Icon name="check" size={11} style={{ color: '#fff' }} />}</span>
        <span style={{ color: done ? 'var(--muted)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>{inline(txt)}</span>
        <button className="iconbtn convert-btn" title="Convert to task" onClick={() => api.textToTask(txt)}
          style={{ width: 24, height: 24, opacity: 0 }}><Icon name="arrow" size={13} /></button>
      </li>);
    }
    else if (/^[-*]\s/.test(ln)) {
      listBuf.push(<li key={idx} className="row md-row" style={{ gap: 10, padding: '3px 0', alignItems: 'flex-start' }}>
        <span className="dot" style={{ background: 'var(--muted)', marginTop: 8, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{inline(ln.slice(2))}</span>
        <button className="iconbtn convert-btn" title="Convert to task" onClick={() => api.textToTask(ln.slice(2))}
          style={{ width: 24, height: 24, opacity: 0 }}><Icon name="arrow" size={13} /></button>
      </li>);
    }
    else if (/^\d+\.\s/.test(ln)) {
      listBuf.push(<li key={idx} className="row md-row" style={{ gap: 10, padding: '3px 0', alignItems: 'flex-start' }}>
        <span className="disp tnum" style={{ color: 'var(--accent)', flexShrink: 0 }}>{ln.match(/^(\d+)\./)[1]}.</span>
        <span style={{ flex: 1 }}>{inline(ln.replace(/^\d+\.\s/, ''))}</span>
        <button className="iconbtn convert-btn" title="Convert to task" onClick={() => api.textToTask(ln.replace(/^\d+\.\s/, ''))}
          style={{ width: 24, height: 24, opacity: 0 }}><Icon name="arrow" size={13} /></button>
      </li>);
    }
    else if (ln.trim() === '') { flush(); }
    else { flush(); els.push(<p key={idx} style={{ margin: '0 0 12px', lineHeight: 1.65, color: 'var(--text-2)' }}>{inline(ln)}</p>); }
  });
  flush();
  return <div className="markdown" style={{ fontSize: 14.5 }}>{els}</div>;
}

export { NotesView };
