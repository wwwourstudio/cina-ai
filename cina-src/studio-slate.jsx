// studio-slate.jsx — The slate: every project, grouped by stage, actions always visible.
// Replaces the old SlateList / SlateRow / SlateCard (list + grid) in dashboard.jsx.

const SS_STAGES = [
  { id: "in production", label: "In production", color: "var(--c-amber)" },
  { id: "storyboard",    label: "Storyboard",    color: tkc("cat-2") },
  { id: "development",   label: "In development", color: "var(--c-ink-3)" },
  { id: "released",      label: "Released",      color: "var(--c-good)" },
];
const ssStageOf = f => SS_STAGES.find(s => s.id === f.status) || SS_STAGES[2];
const ssFmtN = n => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n || 0);
const ssMoneyS = n => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);
const SS_THUMB = { p1: "darkroom-est", p2: "darkroom-wide", p3: "phone", p5: "the-photo" };
const SS_ACTIONS = [["Director", "chat"], ["01 DNA", "bible"], ["Board", "board"]];

const SS_CSS = `
.ss-head{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;margin-bottom:14px;width:100%}
.ss-sum{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.16em;color:var(--c-ink-3);text-transform:uppercase;display:flex;flex-wrap:wrap;gap:4px 14px;font-variant-numeric:tabular-nums}
.ss-sum b{color:var(--c-ink);font-weight:600}
.ss-sum>*{white-space:nowrap}.ss-sum b.a{color:var(--c-amber)}
.ss-tabs{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;max-width:100%;-webkit-overflow-scrolling:touch}
.ss-tabs::-webkit-scrollbar{display:none}
.ss-tab{flex-shrink:0;height:30px;padding:0 12px;border-radius:0;border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-3);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:color .14s,border-color .14s,background .14s}
.ss-tab:hover{color:var(--c-ink);border-color:var(--c-line-3)}
.ss-tab[aria-pressed="true"]{border-color:var(--c-amber);color:var(--c-amber);background:rgba(var(--accent-rgb),.08)}
.ss-tab span{opacity:.55;font-size:var(--fs-label);font-variant-numeric:tabular-nums}
.ss-list{width:100%;border:1px solid var(--c-line);border-radius:0;overflow:hidden;background:var(--c-panel)}
.ss-group{display:flex;align-items:center;gap:10px;padding:10px 18px;background:var(--c-bg);border-top:1px solid var(--c-line);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.2em;text-transform:uppercase;color:var(--c-ink-3);font-variant-numeric:tabular-nums}
.ss-group:first-child{border-top:none}
.ss-group i{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ss-row{display:grid;grid-template-columns:11% minmax(22%,1fr) 17% 10% auto;grid-template-areas:"thumb title prog earn act";gap:18px;align-items:center;padding:14px 18px;border-top:1px solid var(--c-line);cursor:pointer;transition:background .15s;position:relative}
.ss-group + .ss-row{border-top:1px solid var(--c-line)}
.ss-row:hover{background:var(--c-panel-2)}
.ss-row--active{background:rgba(var(--accent-rgb),.045);box-shadow:inset 2px 0 0 var(--c-amber)}
.ss-row:hover .ss-title,.ss-row--active .ss-title{color:var(--c-amber)}
.ss-thumb{grid-area:thumb;position:relative;aspect-ratio:16/10;border-radius:0;overflow:hidden;min-width:84px}
.ss-titlecell{grid-area:title;min-width:0;display:flex;flex-direction:column;gap:5px}
.ss-title{font-family:var(--f-display);font-style:italic;font-size:var(--fs-title);letter-spacing:-.015em;line-height:1.1;color:var(--c-ink);transition:color .15s;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-width:0}
.ss-meta{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--c-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.ss-prog{grid-area:prog;display:flex;flex-direction:column;gap:6px;min-width:0}
.ss-prog__top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.1em;color:var(--c-ink-3);font-variant-numeric:tabular-nums}
.ss-bar{height:3px;border-radius:0;background:var(--c-line);overflow:hidden}
.ss-bar>span{display:block;height:100%}
.ss-earn{grid-area:earn;min-width:0;text-align:right;font-variant-numeric:tabular-nums}
.ss-earn__v{font-family:var(--f-mono);font-size:var(--fs-body);font-weight:600;color:var(--c-amber);font-variant-numeric:tabular-nums}
.ss-earn__v small{font-size:var(--fs-label);color:var(--c-ink-4);font-weight:400;margin-left:2px}
.ss-earn__k{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.14em;color:var(--c-ink-4);margin-top:3px}
.ss-act{grid-area:act;display:flex;gap:6px;justify-content:flex-end}
.ss-btn{height:32px;padding:0 10px;border-radius:0;border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-2);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.12em;text-transform:uppercase;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:6px;transition:color .14s,border-color .14s,background .14s}
.ss-btn:hover{color:var(--c-amber);border-color:var(--c-amber)}
.ss-btn--open{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-weight:700}
.ss-btn--open:hover{color:var(--c-on-amber);filter:brightness(1.08)}
.ss-new{display:flex;align-items:center;gap:14px;width:100%;padding:16px 18px;border:none;border-top:1px dashed var(--c-line-2);background:transparent;color:var(--c-ink-2);cursor:pointer;text-align:left;font:inherit}
.ss-new:hover{background:var(--c-panel-2)}
.ss-new__plus{width:36px;height:36px;border-radius:0;border:1px dashed var(--c-line-2);display:flex;align-items:center;justify-content:center;color:var(--c-ink-3);flex-shrink:0}
.ss-empty{padding:48px 20px;text-align:center;color:var(--c-ink-3);font-family:var(--f-display);font-style:italic;font-size:var(--fs-lead)}
@media (max-width:1240px){.ss-row{grid-template-columns:12% minmax(200px,1fr) 18% auto;grid-template-areas:"thumb title prog act"}.ss-earn{display:none}}
@media (max-width:900px){
.ss-row{grid-template-columns:88px minmax(0,1fr) auto;grid-template-areas:"thumb title title" "prog prog earn" "act act act";gap:12px 14px;padding:14px}
.ss-earn{display:block}
.ss-title{white-space:normal}
.ss-act{justify-content:stretch}
.ss-btn{flex:1;height:40px;padding:0 8px}
.ss-group{padding:10px 14px}
}
@media (max-width:420px){.ss-btn--open .ss-btn__lbl{display:none}.ss-title{font-size:var(--fs-lead)}}
`;

function SlateRowV2({ film, active, onOpenFilm }) {
  const stage = ssStageOf(film);
  const pct = Math.round((film.progress || 0) * 100);
  const thumb = SS_THUMB[film.id];
  const sig = window.ssSignals ? window.ssSignals(film) : {};
  const earn = window.ssEarnings ? window.ssEarnings(film, sig) : { total: 0 };
  const go = (view) => (e) => { e.stopPropagation(); onOpenFilm(film, view); };
  const sub = [film.code, film.genre, film.runtime && film.runtime !== "—" ? film.runtime : null].filter(Boolean).join(" · ");
  const detail = film.published
    ? `${ssFmtN(film.views)} views · ★ ${film.rating}`
    : `${film.completed || 0}/${film.shots || "—"} shots${film.updated ? " · " + film.updated : ""}`;

  return (
    <div className={"ss-row" + (active ? " ss-row--active" : "")} role="button" tabIndex={0} onClick={() => onOpenFilm(film)}
      onKeyDown={e => { if (e.key === "Enter") onOpenFilm(film); }} aria-label={"Open " + film.title}>
      <div className="ss-thumb" style={{ background: film.cover }}>
        {thumb && window.FrameThumb && <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={thumb} usePhoto/></div>}
      </div>
      <div className="ss-titlecell">
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span className="ss-title">{film.title}.</span>
          {active && (
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.45)", padding: "1px 6px", flexShrink: 0 }}>ACTIVE</span>
          )}
          {window.FormatTag && <span style={{ flexShrink: 0 }}><FormatTag kind={film.kind || "movie"}/></span>}
        </div>
        <span className="ss-meta">{sub}</span>
        {window.SlateSignalChips && <window.SlateSignalChips film={film} compact/>}
      </div>
      <div className="ss-prog">
        <div className="ss-prog__top">
          <span style={{ color: stage.color, letterSpacing: ".16em", textTransform: "uppercase", fontSize: "var(--fs-label)" }}>{stage.label}</span>
          <span>{pct}%</span>
        </div>
        <div className="ss-bar"><span style={{ width: pct + "%", background: stage.color }}></span></div>
        <span className="ss-meta" style={{ letterSpacing: ".08em", textTransform: "none", fontSize: "var(--fs-label)" }}>{detail}</span>
      </div>
      <div className="ss-earn">
        {earn.total >= 1
          ? <><div className="ss-earn__v">{ssMoneyS(earn.total)}<small>/MO</small></div><div className="ss-earn__k">EARNING</div></>
          : <div className="ss-earn__k">NOT EARNING</div>}
      </div>
      <div className="ss-act">
        {SS_ACTIONS.map(([label, view]) => <button key={view} className="ss-btn" onClick={go(view)}>{label}</button>)}
        <button className="ss-btn ss-btn--open" onClick={go(undefined)} aria-label={"Open " + film.title}>
          <span className="ss-btn__lbl">Open</span><span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function StudioSlate({ films, query, activeFilmId, onOpenFilm, onNewFilm }) {
  const [tab, setTab] = React.useState("all");
  const sig = f => (window.ssSignals ? window.ssSignals(f) : {});
  const isBranched = f => f.kind === "branched" || !!sig(f).branch;
  const tests = {
    all: () => true,
    movie: f => f.kind === "movie",
    series: f => f.kind === "series",
    branched: isBranched,
    festival: f => { const s = sig(f); return !!(s.trophy || s.screening); },
    pools: f => !!sig(f).pool,
  };
  const tabs = [["all", "All"], ["movie", "Films"], ["series", "Series"], ["branched", "Branches"], ["festival", "Festival"], ["pools", "Pools"]]
    .map(([id, label]) => ({ id, label, count: films.filter(tests[id]).length }))
    .filter(t => t.id === "all" || t.count > 0);

  const q = (query || "").trim().toLowerCase();
  const shown = films.filter(tests[tab] || tests.all).filter(f => !q
    || [f.title, f.code, f.genre].some(v => String(v || "").toLowerCase().includes(q)));

  const totals = films.reduce((t, f) => {
    const s = sig(f); const e = window.ssEarnings ? window.ssEarnings(f, s) : { total: 0 };
    t.earn += e.total; if (s.live) t.live++; if (s.pool) t.pools++; return t;
  }, { earn: 0, live: 0, pools: 0 });

  const groups = SS_STAGES.map(st => ({ ...st, films: shown.filter(f => ssStageOf(f).id === st.id) })).filter(g => g.films.length);

  return (
    <section style={{ marginBottom: 8, width: "100%" }}>
      <style>{SS_CSS}</style>
      <div className="ss-head">
        <div className="ss-sum">
          <span><b>{shown.length}</b> {shown.length === 1 ? "title" : "titles"}{q ? ` · "${query}"` : ""}</span>
          {totals.earn >= 1 && <span><b className="a">{ssMoneyS(totals.earn)}</b>/mo</span>}
          {totals.live > 0 && <span><b>{totals.live}</b> live {totals.live === 1 ? "room" : "rooms"}</span>}
          {totals.pools > 0 && <span><b>{totals.pools}</b> {totals.pools === 1 ? "pool" : "pools"} open</span>}
        </div>
        {tabs.length > 1 && (
          <div className="ss-tabs" role="toolbar" aria-label="Filter the slate">
            {tabs.map(t => (
              <button key={t.id} className="ss-tab" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}<span>{t.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ss-list">
        {groups.length === 0
          ? <div className="ss-empty">Nothing matches{q ? ` "${query}"` : " this filter"}.</div>
          : groups.map(g => (
            <React.Fragment key={g.id}>
              <div className="ss-group"><i style={{ background: g.color }}></i>{g.label}<span style={{ color: "var(--c-ink-4)" }}>{g.films.length}</span></div>
              {g.films.map(f => <SlateRowV2 key={f.id} film={f} active={activeFilmId === f.id} onOpenFilm={onOpenFilm}/>)}
            </React.Fragment>
          ))}
        <button className="ss-new" onClick={onNewFilm}>
          <span className="ss-new__plus">{window.Icon ? <Icon name="plus" size={16}/> : "+"}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)" }}>Begin a new film.</span>
            <span className="ss-meta" style={{ display: "block", marginTop: 3, color: "var(--c-ink-4)" }}>Pitch · Bible · Board</span>
          </span>
          <span className="ss-meta" style={{ color: "var(--c-amber)", flexShrink: 0 }}>Start →</span>
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { StudioSlate });
