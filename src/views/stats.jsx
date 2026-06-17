import React from 'react';
/* ============================================================
   VIEW: STATS — focus analytics
   ============================================================ */
function StatsView({ stats, heat, api }) {
  const [range, setRange] = React.useState('week');
  const s = stats.week;

  return (
    <div className="view-scroll">
      <div className="pad" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <h2 className="disp" style={{ fontSize: 22, fontWeight: 600 }}>Focus Analytics</h2>
          <div className="spacer" />
          <Segmented value={range} onChange={setRange}
            options={[{value:'day',label:'Day'},{value:'week',label:'Week'},{value:'month',label:'Month'},{value:'year',label:'Year'}]} />
        </div>
        <div className="row" style={{ gap: 8, marginBottom: 22 }}>
          <button className="iconbtn"><Icon name="chevL" size={16} /></button>
          <span className="disp" style={{ fontWeight: 600, fontSize: 14 }}>Jun 1 – Jun 7, 2026</span>
          <button className="iconbtn"><Icon name="chevR" size={16} /></button>
          <span className="meta">· this week</span>
        </div>

        {/* key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          <Metric icon="flame" label="Total focus time" value={window.fmtMin(s.focusMin)} accent="var(--accent)" delta="+8% vs last week" />
          <Metric icon="focus" label="Pomodoros" value={`${s.pomos} 🍅`} delta="+4" />
          <Metric icon="check" label="Tasks completed" value={s.tasksDone} delta="+2" />
          <Metric icon="clock" label="Avg session" value={`${s.avgSession} min`} delta="−3 min" />
        </div>

        {/* heatmap */}
        <Panel title="Focus activity" sub="Last 18 weeks">
          <Heatmap heat={heat} />
        </Panel>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
          <Panel title="Most productive hours" sub="Focus minutes by hour of day">
            <HourChart data={stats.byHour} />
          </Panel>
          <Panel title="Best days" sub="Avg focus per weekday">
            <DayChart data={stats.byDay} />
          </Panel>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 16 }}>
          <Panel title="Top tasks" sub="Where your focus went">
            <div className="col" style={{ gap: 2 }}>
              {stats.topTasks.map((t, i) => {
                const max = stats.topTasks[0].min;
                return (
                  <div key={i} className="row" style={{ gap: 12, padding: '9px 4px',
                    borderBottom: i < stats.topTasks.length-1 ? '1px solid var(--border)' : 'none' }}>
                    <span className="disp tnum" style={{ width: 16, color: 'var(--faint)', fontSize: 13 }}>{i+1}</span>
                    <span className="board-swatch" style={{ background: t.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                      <div className="meta" style={{ fontSize: 11 }}>{t.board}</div>
                    </div>
                    <div style={{ width: 90 }}>
                      <div className="prog-bar" style={{ width: '100%', height: 5 }}>
                        <i style={{ width: `${(t.min/max)*100}%`, background: t.color }} /></div>
                    </div>
                    <span className="disp tnum" style={{ fontSize: 12.5, width: 58, textAlign: 'right' }}>{window.fmtMin(t.min)}</span>
                    <span className="meta disp tnum" style={{ width: 28, textAlign: 'right' }}>{t.pomos}🍅</span>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel title="Boards breakdown" sub="Focus time by board">
            <Donut data={stats.boards} />
          </Panel>
        </div>

        <div style={{ marginTop: 16 }}>
          <Panel title="Estimation accuracy" sub={`On average, you take ${stats.estAccuracy}× longer than estimated`}>
            <EstChart />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, accent, delta }) {
  const up = delta && !delta.includes('−');
  return (
    <div className="card" style={{ padding: '15px 16px' }}>
      <div className="row" style={{ marginBottom: 10 }}>
        <span style={{ color: accent || 'var(--muted)' }}><Icon name={icon} size={17} /></span>
        <div className="spacer" />
        {delta && <span className="meta" style={{ fontSize: 10.5, color: up ? 'var(--done)' : 'var(--muted)' }}>{delta}</span>}
      </div>
      <div className="disp tnum" style={{ fontSize: 27, fontWeight: 600, lineHeight: 1, color: accent || 'var(--text)' }}>{value}</div>
      <div className="meta" style={{ fontSize: 11.5, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Panel({ title, sub, children }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="disp" style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        {sub && <div className="meta" style={{ fontSize: 11.5, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function heatColor(v) {
  if (v === 0) return 'var(--surface-2)';
  if (v < 60) return 'rgba(63,185,138,0.22)';
  if (v < 120) return 'rgba(63,185,138,0.42)';
  if (v < 180) return 'rgba(63,185,138,0.66)';
  return 'rgba(63,185,138,0.95)';
}
function Heatmap({ heat }) {
  const days = ['Mon','','Wed','','Fri','','Sun'];
  const [hover, setHover] = React.useState(null);
  return (
    <div>
      <div style={{ display: 'flex', gap: 9 }}>
        <div className="col" style={{ gap: 3, justifyContent: 'space-around', paddingTop: 2 }}>
          {days.map((d, i) => <div key={i} className="meta" style={{ fontSize: 9.5, height: 13, lineHeight: '13px' }}>{d}</div>)}
        </div>
        <div style={{ display: 'flex', gap: 3, flex: 1, position: 'relative' }}>
          {heat.map((week, wi) => (
            <div key={wi} className="col" style={{ gap: 3, flex: 1 }}>
              {week.map((v, di) => (
                <div key={di}
                  onMouseEnter={() => setHover({ wi, di, v })}
                  onMouseLeave={() => setHover(null)}
                  style={{ width: '100%', aspectRatio: '1', maxHeight: 13, borderRadius: 3, background: heatColor(v),
                    border: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }} />
              ))}
            </div>
          ))}
          {hover && (
            <div className="card tnum" style={{ position: 'absolute', top: -34, left: `${(hover.wi/18)*100}%`,
              padding: '4px 9px', fontSize: 11, whiteSpace: 'nowrap', background: 'var(--surface-3)', zIndex: 5 }}>
              {hover.v === 0 ? 'No focus' : window.fmtMin(hover.v)}
            </div>
          )}
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 5, marginTop: 11 }}>
        <span className="meta" style={{ fontSize: 10.5 }}>Less</span>
        {[0,50,110,160,200].map(v => <div key={v} style={{ width: 11, height: 11, borderRadius: 3, background: heatColor(v) }} />)}
        <span className="meta" style={{ fontSize: 10.5 }}>More</span>
      </div>
    </div>
  );
}

function HourChart({ data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 130 }}>
      {data.map((v, h) => (
        <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div title={`${h}:00 — ${window.fmtMin(v)}`}
              style={{ width: '100%', height: `${(v/max)*100}%`, minHeight: v ? 2 : 0, borderRadius: '3px 3px 0 0',
                background: v === max ? 'var(--accent)' : 'rgba(63,185,138,0.4)' }} />
          </div>
          {h % 3 === 0 && <span className="meta tnum" style={{ fontSize: 9 }}>{h}</span>}
        </div>
      ))}
    </div>
  );
}

function DayChart({ data }) {
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const max = Math.max(...data);
  return (
    <div className="col" style={{ gap: 7 }}>
      {data.map((v, i) => (
        <div key={i} className="row" style={{ gap: 10 }}>
          <span className="meta disp" style={{ width: 30, fontSize: 11 }}>{labels[i]}</span>
          <div className="prog-bar" style={{ flex: 1, height: 9, borderRadius: 4 }}>
            <i style={{ width: `${(v/max)*100}%`, background: v === max ? 'var(--accent)' : 'var(--progress)', borderRadius: 4 }} /></div>
          <span className="meta disp tnum" style={{ width: 42, textAlign: 'right', fontSize: 11 }}>{window.fmtMin(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.min, 0);
  const r = 52, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="row" style={{ gap: 20 }}>
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ flexShrink: 0 }}>
        <g transform="rotate(-90 65 65)">
          {data.map((d, i) => {
            const frac = d.min / total;
            const seg = <circle key={i} cx={65} cy={65} r={r} fill="none" stroke={d.color} strokeWidth={16}
              strokeDasharray={`${c*frac} ${c*(1-frac)}`} strokeDashoffset={-c*acc} />;
            acc += frac; return seg;
          })}
        </g>
        <text x={65} y={61} textAnchor="middle" className="disp tnum" fill="var(--text)" fontSize={20} fontWeight={600}>{Math.round(total/60)}h</text>
        <text x={65} y={77} textAnchor="middle" fill="var(--muted)" fontSize={9}>total</text>
      </svg>
      <div className="col" style={{ gap: 9, flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} className="row" style={{ gap: 9 }}>
            <span className="dot" style={{ background: d.color }} />
            <span style={{ fontSize: 12.5, flex: 1 }}>{d.name}</span>
            <span className="meta disp tnum" style={{ fontSize: 11.5 }}>{Math.round(d.min/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstChart() {
  const rows = [
    { t: 'Ship analytics dashboard', est: 5, act: 6 },
    { t: 'Q2 roadmap deck', est: 4, act: 3 },
    { t: 'Edit Notion video', est: 6, act: 4 },
    { t: 'Finalize pricing tiers', est: 2, act: 3 },
    { t: 'Launch blog post', est: 3, act: 2 },
  ];
  const max = 7;
  return (
    <div>
      <div className="col" style={{ gap: 11 }}>
        {rows.map((r, i) => (
          <div key={i} className="row" style={{ gap: 12 }}>
            <span style={{ width: 150, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.t}</span>
            <div style={{ flex: 1, position: 'relative', height: 18 }}>
              <div style={{ position: 'absolute', top: 2, left: 0, width: `${(r.est/max)*100}%`, height: 6,
                borderRadius: 4, background: 'var(--border-2)' }} />
              <div style={{ position: 'absolute', bottom: 2, left: 0, width: `${(r.act/max)*100}%`, height: 6,
                borderRadius: 4, background: r.act > r.est ? 'var(--accent)' : 'var(--done)' }} />
            </div>
            <span className="meta disp tnum" style={{ fontSize: 11, width: 70, textAlign: 'right' }}>{r.est}→{r.act} 🍅</span>
          </div>
        ))}
      </div>
      <div className="row" style={{ gap: 16, marginTop: 14, justifyContent: 'center' }}>
        <span className="meta" style={{ fontSize: 11 }}><span style={{ display: 'inline-block', width: 14, height: 6, borderRadius: 3, background: 'var(--border-2)', marginRight: 6, verticalAlign: 'middle' }} />Estimated</span>
        <span className="meta" style={{ fontSize: 11 }}><span style={{ display: 'inline-block', width: 14, height: 6, borderRadius: 3, background: 'var(--accent)', marginRight: 6, verticalAlign: 'middle' }} />Actual</span>
      </div>
    </div>
  );
}

export { StatsView };
