import { Icon, ICONS, PriorityPill, StatusPill, TagChip, TimerRing, TaskCard, Modal, Segmented, STATUS_META, PRIORITY_META, TYPE_BADGE, NOTE_TYPE, timeAgo, fmtMin, fmtClock } from '../components.jsx';
import { SEED } from '../data.jsx';
import { Toggle } from './boards.jsx';
import React from 'react';
/* ============================================================
   VIEW: FOCUS — Pomodoro session (setup / active / overtime / done)
   ============================================================ */
function FocusView({ focus, tasks, boards, api }) {
  if (!focus || focus.phase === 'setup') return <FocusSetup focus={focus} tasks={tasks} boards={boards} api={api} />;
  if (focus.phase === 'complete') return <FocusComplete focus={focus} tasks={tasks} api={api} />;
  return <FocusActive focus={focus} tasks={tasks} api={api} />;
}

// ---------- Setup ----------
function FocusSetup({ focus, tasks, boards, api }) {
  const init = focus && focus.taskId ? focus.taskId : null;
  const [taskId, setTaskId] = React.useState(init);
  const [q, setQ] = React.useState('');
  const [pomos, setPomos] = React.useState(() => {
    const t = tasks.find(x => x.id === init); return t && t.pomoEst ? t.pomoEst : 3;
  });
  const [pomoLen, setPomoLen] = React.useState(25);
  const [shortB, setShortB] = React.useState(5);
  const [longEvery, setLongEvery] = React.useState(4);
  const [autoB, setAutoB] = React.useState(false);

  const open = tasks.filter(t => boards.find(b => b.id === t.board)?.columns.find(c => c.id === t.col)?.status !== 'done');
  const results = q ? open.filter(t => t.title.toLowerCase().includes(q.toLowerCase())) : open.slice(0, 6);
  const sel = tasks.find(t => t.id === taskId);

  return (
    <div className="view-scroll">
      <div className="pad" style={{ maxWidth: 580, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <span className="label">Focus session</span>
          <h2 className="disp" style={{ fontSize: 26, fontWeight: 600, marginTop: 6 }}>What will you focus on?</h2>
        </div>

        {/* task selector */}
        <div className="field">
          <label className="label">Task</label>
          {sel ? (
            <div className="card row" style={{ padding: '12px 14px', gap: 11 }}>
              <span className="board-swatch" style={{ background: boards.find(b => b.id === sel.board)?.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{sel.title}</div>
                <div className="meta" style={{ fontSize: 11.5, marginTop: 2 }}>
                  {boards.find(b => b.id === sel.board)?.icon} {boards.find(b => b.id === sel.board)?.name}
                  {sel.pomoEst ? ` · estimated 🍅 ${sel.pomoEst}` : ''}
                </div>
              </div>
              <button className="iconbtn" onClick={() => setTaskId(null)}><Icon name="close" size={15} /></button>
            </div>
          ) : (
            <>
              <div className="row" style={{ marginBottom: 9 }}>
                <span style={{ position: 'absolute', marginLeft: 11, color: 'var(--muted)' }}><Icon name="search" size={15} /></span>
                <input className="input" value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tasks…" style={{ paddingLeft: 34 }} />
              </div>
              <div className="col" style={{ gap: 6, maxHeight: 230, overflowY: 'auto', overflowX: 'hidden' }}>
                {results.map(t => (
                  <button key={t.id} className="card" onClick={() => setTaskId(t.id)}
                    style={{ padding: '9px 12px', textAlign: 'left', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span className="board-swatch" style={{ background: boards.find(b => b.id === t.board)?.color }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, color: 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                    {t.priority && <PriorityPill p={t.priority} mini />}
                    {t.pomoEst ? <span className="meta disp tnum" style={{ fontSize: 11 }}>🍅 {t.pomoEst}</span> : null}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* pomo count */}
        <div className="field">
          <label className="label">How many pomodoros?</label>
          <div className="row" style={{ gap: 14 }}>
            <Stepper value={pomos} min={1} max={12} onChange={setPomos} />
            <div className="meta tnum">{pomos} × {pomoLen}min = <b className="disp" style={{ color: 'var(--text)' }}>{pomos * pomoLen} minutes</b> of focus</div>
          </div>
        </div>

        {/* config */}
        <div className="card" style={{ padding: 16, marginBottom: 22 }}>
          <span className="label">Session config</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 12 }}>
            <ConfigNum label="Pomodoro" value={pomoLen} suffix="min" onChange={setPomoLen} step={5} min={5} />
            <ConfigNum label="Short break" value={shortB} suffix="min" onChange={setShortB} step={1} min={1} />
            <ConfigNum label="Long break after" value={longEvery} suffix="🍅" onChange={setLongEvery} step={1} min={2} />
          </div>
          <div className="divider" style={{ margin: '14px 0' }} />
          <label className="row" style={{ gap: 11, cursor: 'pointer' }}>
            <Toggle on={autoB} onChange={setAutoB} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Auto-start breaks</div>
              <div className="meta" style={{ fontSize: 11.5 }}>
                {autoB ? 'Breaks begin automatically when a pomodoro ends.'
                       : 'Off — timer keeps running into overtime until you choose to break.'}
              </div>
            </div>
          </label>
        </div>

        <button className="btn primary lg" style={{ width: '100%', justifyContent: 'center' }}
          disabled={!sel}
          onClick={() => api.startSession({ taskId, pomos, pomoLen, shortB, longEvery, autoB })}>
          <Icon name="play" size={17} /> Start Focus
        </button>
      </div>
    </div>
  );
}

function Stepper({ value, min, max, onChange }) {
  return (
    <div className="row" style={{ gap: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
      <button className="iconbtn" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 36, height: 36 }}>–</button>
      <div className="disp tnum" style={{ width: 40, textAlign: 'center', fontSize: 18, fontWeight: 600 }}>{value}</div>
      <button className="iconbtn" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 36, height: 36 }}>+</button>
    </div>
  );
}
function ConfigNum({ label, value, suffix, onChange, step, min }) {
  return (
    <div>
      <div className="meta" style={{ fontSize: 11.5, marginBottom: 6 }}>{label}</div>
      <div className="row" style={{ gap: 8 }}>
        <button className="iconbtn" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          onClick={() => onChange(Math.max(min, value - step))}>–</button>
        <div className="disp tnum" style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 600 }}>
          {value}<span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 3 }}>{suffix}</span></div>
        <button className="iconbtn" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          onClick={() => onChange(value + step)}>+</button>
      </div>
    </div>
  );
}

// ---------- Active ----------
function FocusActive({ focus, tasks, api }) {
  const task = tasks.find(t => t.id === focus.taskId);
  const [notesOpen, setNotesOpen] = React.useState(false);
  const isBreak = focus.phase === 'break';
  const isOver = focus.phase === 'overtime';
  const total = isBreak ? focus.breakLen : focus.pomoLen * 60;
  const progress = isOver ? 1 : (total ? (total - focus.secondsLeft) / total : 0);
  const ringColor = isBreak ? '#5b8def' : isOver ? '#e6a23c' : 'var(--accent)';
  const statusText = isBreak ? '☕ Break' : isOver ? '⚡ Overtime — keep going' : '🍅 Focus';

  return (
    <div className="view-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 40, minHeight: '100%' }}>
      <div style={{ textAlign: 'center', maxWidth: 620, width: '100%' }}>
        <div className="row" style={{ justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <span className="pill" style={{ background: `${isBreak ? '#5b8def' : isOver ? '#e6a23c' : '#3fb98a'}22`,
            color: ringColor, fontSize: 12.5 }}>{statusText}</span>
          {!isBreak && <span className="meta disp" style={{ fontSize: 12.5 }}>
            Pomodoro {focus.currentPomo} of {focus.pomos}</span>}
        </div>

        <h1 className="disp" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.2, margin: '14px auto 28px',
          maxWidth: 520, color: isBreak ? 'var(--text-2)' : 'var(--text)' }}>
          {isBreak ? 'Take a breather' : task?.title}</h1>

        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 26 }}>
          <TimerRing size={300} stroke={15} progress={progress} color={ringColor}>
            <div>
              <div className="disp tnum" style={{ fontSize: 58, fontWeight: 600, lineHeight: 1,
                color: isOver ? '#87b3f2' : 'var(--text)' }}>
                {isOver ? '+' : ''}{fmtClock(isOver ? focus.overtimeSec : focus.secondsLeft)}</div>
              <div className="meta tnum" style={{ marginTop: 10, fontSize: 12 }}>
                {fmtMin(Math.floor(focus.elapsedFocusSec / 60))} focused total</div>
              {isOver && <button className="btn sm" style={{ marginTop: 12 }} onClick={api.takeBreak}>
                Take break now</button>}
            </div>
          </TimerRing>
        </div>

        {/* controls */}
        <div className="row" style={{ justifyContent: 'center', gap: 9, marginBottom: 22 }}>
          {!isOver && <button className="btn" onClick={api.togglePause}>
            <Icon name={focus.running ? 'pause' : 'play'} size={15} /> {focus.running ? 'Pause' : 'Resume'}</button>}
          <button className="btn" onClick={api.skipPhase}><Icon name="skip" size={15} /> Skip</button>
          <button className="btn danger" onClick={api.endSession}>End session</button>
          <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />
          <button className="btn" onClick={api.addDistraction} title="Track a distraction">
            <Icon name="flag" size={14} /> Distraction <span className="disp tnum" style={{ color: 'var(--accent)' }}>{focus.distractions}</span>
          </button>
        </div>

        {/* quick notes */}
        <div className="card" style={{ maxWidth: 440, margin: '0 auto', textAlign: 'left', overflow: 'hidden' }}>
          <button className="row" onClick={() => setNotesOpen(!notesOpen)}
            style={{ width: '100%', padding: '10px 13px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'var(--text-2)' }}>
            <Icon name="notes" size={15} /><span style={{ fontSize: 13, fontWeight: 500 }}>Quick notes</span>
            <div className="spacer" />
            <span style={{ transform: notesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
              <Icon name="chevD" size={15} /></span>
          </button>
          {notesOpen && (
            <div style={{ padding: '0 13px 13px' }}>
              <textarea className="textarea" placeholder="Capture a thought without breaking flow…"
                value={focus.notes} onChange={(e) => api.setFocusNotes(e.target.value)}
                style={{ minHeight: 60, fontSize: 13 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Complete ----------
function FocusComplete({ focus, tasks, api }) {
  const task = tasks.find(t => t.id === focus.taskId);
  const [reflection, setReflection] = React.useState('');
  const actualPomos = focus.completedPomos;
  const overMin = Math.round(focus.totalOvertimeSec / 60);
  const focusMin = Math.round(focus.elapsedFocusSec / 60);

  const Stat = ({ k, v, accent }) => (
    <div className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
      <div className="disp tnum" style={{ fontSize: 26, fontWeight: 600, color: accent || 'var(--text)' }}>{v}</div>
      <div className="meta" style={{ fontSize: 11.5, marginTop: 3 }}>{k}</div>
    </div>
  );

  return (
    <div className="view-scroll">
      <div className="pad" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 38, marginBottom: 6 }}>🎉</div>
        <span className="label">Session complete</span>
        <h2 className="disp" style={{ fontSize: 24, fontWeight: 600, margin: '6px 0 4px' }}>{task?.title}</h2>
        <div className="meta" style={{ marginBottom: 24 }}>Nice work. Here's how it went.</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
          <Stat k="Focus time" v={fmtMin(focusMin)} accent="var(--accent)" />
          <Stat k="Pomodoros" v={`${actualPomos} 🍅`} />
          <Stat k="Breaks" v={focus.breaksTaken} />
          <Stat k="Distractions" v={focus.distractions} />
        </div>

        <div className="card" style={{ padding: '14px 16px', marginBottom: 18, textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14 }}>
          <Icon name="clock" size={20} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>
              Estimated <span className="disp">{focus.pomos} 🍅</span> · Actual <span className="disp" style={{ color: 'var(--accent)' }}>{actualPomos} 🍅{overMin ? ` + ${overMin}min overtime` : ''}</span>
            </div>
            <div className="meta" style={{ fontSize: 12, marginTop: 2 }}>
              {actualPomos > focus.pomos ? 'Took a bit longer than planned — adjust next estimate up.'
                : actualPomos < focus.pomos ? 'Finished ahead of estimate.' : 'Right on estimate.'}
            </div>
          </div>
        </div>

        <div className="field" style={{ textAlign: 'left', marginBottom: 22 }}>
          <label className="label">How did it go? <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--faint)' }}>(optional)</span></label>
          <textarea className="textarea" value={reflection} onChange={(e) => setReflection(e.target.value)}
            placeholder="A quick reflection…" style={{ minHeight: 64 }} />
        </div>

        <div className="row" style={{ gap: 9, justifyContent: 'center' }}>
          <button className="btn primary" onClick={() => api.completeAnd('done')}>
            <Icon name="check" size={15} /> Mark task done</button>
          <button className="btn" onClick={() => api.completeAnd('again')}>Continue same task</button>
          <button className="btn ghost" onClick={() => api.completeAnd('new')}>Pick new task</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Mini player (persistent during session) ----------
function MiniPlayer({ focus, tasks, api }) {
  if (!focus || focus.phase === 'setup' || focus.phase === 'complete') return null;
  const task = tasks.find(t => t.id === focus.taskId);
  const isBreak = focus.phase === 'break';
  const isOver = focus.phase === 'overtime';
  const total = isBreak ? focus.breakLen : focus.pomoLen * 60;
  const progress = isOver ? 1 : (total ? (total - focus.secondsLeft) / total : 0);
  const color = isBreak ? '#5b8def' : isOver ? '#e6a23c' : 'var(--accent)';
  return (
    <div className="card rise" style={{ position: 'fixed', left: 250, bottom: 18, zIndex: 60,
      width: 270, padding: 12, display: 'flex', alignItems: 'center', gap: 11, boxShadow: 'var(--shadow-md)',
      background: 'var(--surface-2)', cursor: 'pointer' }}
      onClick={() => api.goFocus()}>
      <TimerRing size={42} stroke={4} progress={progress} color={color}>
        <span style={{ fontSize: 12 }}>{isBreak ? '☕' : isOver ? '⚡' : '🍅'}</span>
      </TimerRing>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isBreak ? 'Break' : task?.title}</div>
        <div className="disp tnum" style={{ fontSize: 12, color: 'var(--muted)' }}>
          {isOver ? '+' : ''}{fmtClock(isOver ? focus.overtimeSec : focus.secondsLeft)} {isOver ? 'overtime' : 'left'}</div>
      </div>
      <div className="row" style={{ gap: 2 }} onClick={(e) => e.stopPropagation()}>
        {!isOver && <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={api.togglePause}>
          <Icon name={focus.running ? 'pause' : 'play'} size={14} /></button>}
        <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={api.endSession}>
          <Icon name="close" size={14} /></button>
      </div>
    </div>
  );
}

export { FocusView, MiniPlayer };
