import { SEED } from '../data.jsx';

import React from 'react';
/* ============================================================
   VIEW: COMPONENT SHEET — design system reference
   ============================================================ */
function ComponentSheet({ api }) {
  const Sec = ({ title, children, sub }) => (
    <section style={{ marginBottom: 38 }}>
      <div style={{ marginBottom: 16 }}>
        <span className="label">{title}</span>
        {sub && <div className="meta" style={{ fontSize: 12, marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </section>
  );
  const Swatch = ({ name, v }) => (
    <div className="col" style={{ gap: 7 }}>
      <div style={{ height: 56, borderRadius: 'var(--r-md)', background: v, border: '1px solid var(--border)' }} />
      <div><div style={{ fontSize: 12, fontWeight: 500 }}>{name}</div><div className="meta tnum" style={{ fontSize: 11 }}>{v}</div></div>
    </div>
  );

  const sampleTask = { id: 'demo', title: 'Finalize Q2 roadmap deck', desc: 'Pull metrics, align with eng estimates',
    priority: 'do', pomoEst: 4, pomoActual: 3, due: 'Jun 6', tags: ['work','deep'],
    subtasks: [{t:'a',done:true},{t:'b',done:true},{t:'c',done:false},{t:'d',done:false}], board: 'b_work', col: 'c_prog', focusMin: 88 };

  return (
    <div className="view-scroll">
      <div className="pad" style={{ maxWidth: 940, margin: '0 auto' }}>
        <h2 className="disp" style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Component Sheet</h2>
        <div className="meta" style={{ marginBottom: 30 }}>The building blocks of FOCUS — part of the Life Planner family.</div>

        <Sec title="Color — Surfaces & Text">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
            <Swatch name="Background" v="#0f0f13" /><Swatch name="Surface" v="#17171f" />
            <Swatch name="Border" v="#2a2a36" /><Swatch name="Text" v="#e8e8f0" />
            <Swatch name="Muted" v="#6b6b80" /><Swatch name="Accent" v="#3fb98a" />
          </div>
        </Sec>

        <Sec title="Color — Status & Priority">
          <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
            <div className="col" style={{ gap: 10 }}>
              <span className="meta" style={{ fontSize: 11 }}>Board status</span>
              <div className="row" style={{ gap: 8 }}>
                <StatusPill status="todo" /><StatusPill status="progress" /><StatusPill status="done" /><StatusPill status="blocked" />
              </div>
            </div>
            <div className="col" style={{ gap: 10 }}>
              <span className="meta" style={{ fontSize: 11 }}>Priority (Eisenhower)</span>
              <div className="row" style={{ gap: 8 }}>
                <PriorityPill p="do" /><PriorityPill p="schedule" /><PriorityPill p="delegate" /><PriorityPill p="delete" />
              </div>
            </div>
          </div>
        </Sec>

        <Sec title="Typography">
          <div className="card" style={{ padding: 22 }}>
            <div className="disp" style={{ fontSize: 30, fontWeight: 600, marginBottom: 4 }}>Space Grotesk — Display</div>
            <div className="disp tnum" style={{ fontSize: 40, fontWeight: 600, color: 'var(--accent)', marginBottom: 14 }}>25:00 · 47min · 31🍅</div>
            <div style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 560, lineHeight: 1.6, marginBottom: 12 }}>
              DM Sans handles body text — clear, neutral, easy to scan at small sizes in dense lists.</div>
            <span className="label">Section label · uppercase · tracked</span>
          </div>
        </Sec>

        <Sec title="Task card — states" sub="Hover to reveal quick actions · whole card is draggable">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <div><div className="meta" style={{ fontSize: 11, marginBottom: 8 }}>Full</div>
              <TaskCard task={sampleTask} onOpen={() => {}} onFocus={() => {}} onDelete={() => {}} draggable={false} /></div>
            <div><div className="meta" style={{ fontSize: 11, marginBottom: 8 }}>Compact</div>
              <TaskCard task={{...sampleTask, subtasks: [], desc: ''}} onOpen={() => {}} draggable={false} compact /></div>
            <div><div className="meta" style={{ fontSize: 11, marginBottom: 8 }}>Minimal</div>
              <TaskCard task={{...sampleTask, priority: null, tags: [], subtasks: [], desc: '', due: null, pomoEst: 1}} onOpen={() => {}} draggable={false} /></div>
          </div>
        </Sec>

        <Sec title="Board column header">
          <div className="card" style={{ padding: 14, maxWidth: 300 }}>
            <div className="row">
              <span className="dot" style={{ background: 'var(--progress)' }} />
              <span className="label" style={{ color: 'var(--text-2)' }}>In Progress</span>
              <span className="meta tnum">4</span>
              <div className="spacer" />
              <button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="plus" size={14} /></button>
            </div>
          </div>
        </Sec>

        <Sec title="Timer ring — states">
          <div className="row" style={{ gap: 30, flexWrap: 'wrap' }}>
            {[
              { p: 0.34, c: 'var(--accent)', l: '🍅 Focus', t: '16:30' },
              { p: 0.7, c: 'var(--done)', l: '☕ Break', t: '01:30' },
              { p: 1, c: '#5b8def', l: '⚡ Overtime', t: '+04:12' },
            ].map((r, i) => (
              <div key={i} className="col" style={{ alignItems: 'center', gap: 10 }}>
                <TimerRing size={120} stroke={9} progress={r.p} color={r.c}>
                  <div className="disp tnum" style={{ fontSize: 20, fontWeight: 600 }}>{r.t}</div>
                </TimerRing>
                <span className="pill" style={{ background: 'var(--surface-2)', color: r.c }}>{r.l}</span>
              </div>
            ))}
          </div>
        </Sec>

        <Sec title="Buttons & controls">
          <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <button className="btn primary">Primary</button>
            <button className="btn">Secondary</button>
            <button className="btn ghost">Ghost</button>
            <button className="btn danger">Danger</button>
            <button className="btn sm">Small</button>
            <button className="iconbtn"><Icon name="plus" size={16} /></button>
          </div>
          <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
            <Segmented value="a" onChange={() => {}} options={[{value:'a',label:'Eisenhower'},{value:'b',label:'Impact/Effort'}]} />
            <Toggle on={true} onChange={() => {}} />
            <Toggle on={false} onChange={() => {}} />
          </div>
        </Sec>

        <Sec title="Tags & badges">
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {Object.values(SEED.TAGS).map(t => <TagChip key={t.id} id={t.id} />)}
            <span className="badge">📝 Task</span><span className="badge">💭 Idea</span><span className="badge">📄 Note</span>
            <span className="kbd">⌘K</span>
          </div>
        </Sec>

        <Sec title="Navigation icons">
          <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
            {['inbox','board','matrix','focus','stats','notes','search','command'].map(n => (
              <div key={n} className="col" style={{ alignItems: 'center', gap: 7, color: 'var(--text-2)' }}>
                <Icon name={n} size={22} /><span className="meta" style={{ fontSize: 10.5 }}>{n}</span>
              </div>
            ))}
          </div>
        </Sec>
      </div>
    </div>
  );
}

export { ComponentSheet };
