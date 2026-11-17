// studio-analytics.jsx — The complete Studio analytics surface.
//
// One page that answers "how is everything I've shipped doing, and what
// should I do about it." Four movements:
//   01 · Overview — the numbers that matter, with animated trend.
//   02 · Trending — your published films ranked by momentum, each with
//        Promote + Buy-boost actions wired through the pay drawer + promo.
//   03 · Audience & retention — who's watching, where, and where they drop.
//   04 · Revenue — what being watched actually pays.
// A persistent AI analyst rail reads the live numbers and suggests the next
// move (real window.claude when present, graceful canned insight otherwise).
//
// Mounted by shell.jsx at route "analytics". Reads window.PROJECTS.

const { useState: usAN, useEffect: ueAN, useMemo: umAN, useRef: urAN } = React;

// ─── number helpers ──────────────────────────────────────────────────────
function anFmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}
function anMoney(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
// Believable revenue model off views: blended $/1k watched.
function filmRevenue(f) {
  const base = (f.views || 0) * 0.0094;          // ad + tips blended
  const sub = (f.views || 0) * (f.completionRate || 0.5) * 0.006; // sub share
  return Math.round(base + sub);
}
function filmMomentum(f) {
  // % change of last-3-day avg vs the 3 days before it.
  const d = f.dailyViews || [];
  if (d.length < 6) return 0;
  const recent = d.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const prior = d.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
  if (!prior) return 0;
  return (recent - prior) / prior;
}

// ─── tiny count-up for the big numbers (animated on mount) ────────────────
function useCountUp(target, dur = 900, run = true) {
  const [v, setV] = usAN(0);
  ueAN(() => {
    if (!run) { setV(target); return; }
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

const AN_CSS = `
:root { --an-gut: clamp(20px, 5vw, 88px); }
.an-wrap { width: 100%; max-width: 1680px; margin: 0 auto; padding: 0 var(--an-gut) 90px; }
.an-grid { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: clamp(22px,2.6vw,44px); align-items: start; }
@media (max-width: 1100px) { .an-grid { grid-template-columns: 1fr; } .an-ai { position: static !important; } }

.an-zone { display: flex; align-items: center; gap: 13px; margin: clamp(30px,3.4vw,48px) 0 20px; }
.an-zone__bar { width: 3px; height: 26px; border-radius: 2px; background: var(--c-amber); flex-shrink: 0; }
.an-zone__n { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-amber); letter-spacing: .24em; font-weight: 600; }
.an-zone__t { font-family: var(--f-display); font-style: italic; font-weight: 400; font-size: clamp(22px,2.5vw,30px); letter-spacing: -0.018em; color: var(--c-ink); line-height: 1; white-space: nowrap; }
.an-zone__s { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-ink-4); letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.an-zone__sp { flex: 1; min-width: 8px; }

/* KPI ribbon */
.an-kpis { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid var(--c-line); border-radius: 14px; overflow: hidden; background: var(--c-panel); }
.an-kpi { padding: 18px clamp(14px,2vw,24px) 16px; border-left: 1px solid var(--c-line); display: flex; flex-direction: column; gap: 7px; position: relative; }
.an-kpi:first-child { border-left: none; }
.an-kpi__k { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--c-ink-4); text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.an-kpi__v { font-family: var(--f-display); font-style: italic; font-size: clamp(22px,2.4vw,34px); line-height: 1; letter-spacing: -0.025em; color: var(--c-ink); font-variant-numeric: tabular-nums; }
.an-kpi__d { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .04em; display: flex; align-items: center; gap: 5px; }
@media (max-width: 1180px) { .an-kpis { grid-template-columns: repeat(4,1fr); } .an-kpi:nth-child(4n+1) { border-left: none; } .an-kpi:nth-child(n+5) { border-top: 1px solid var(--c-line); } }
@media (max-width: 920px) { .an-kpis { grid-template-columns: repeat(2,1fr); } .an-kpi { border-left: 1px solid var(--c-line); } .an-kpi:nth-child(odd) { border-left: none; } .an-kpi:nth-child(n+3) { border-top: 1px solid var(--c-line); } }

.an-panel { border: 1px solid var(--c-line); border-radius: 14px; background: var(--c-panel); padding: 22px 24px; }
.an-chip { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--c-line-2); background: transparent; color: var(--c-ink-3); cursor: pointer; transition: all .14s; white-space: nowrap; }
.an-chip:hover { color: var(--c-ink); border-color: var(--c-line-3); }
.an-chip--on { color: var(--c-on-amber); background: var(--c-amber); border-color: var(--c-amber); }

/* Trending rows */
.an-trend { display: grid; grid-template-columns: 30px 64px minmax(0,1.5fr) 1fr 130px auto; gap: 16px; align-items: center; padding: 16px 0; border-top: 1px solid var(--c-line); }
.an-trend:first-of-type { border-top: none; }
@media (max-width: 860px) {
  .an-trend { grid-template-columns: 30px clamp(20px, 4vw, 56px) minmax(0,1fr) auto; }
  .an-trend .an-trend__spark, .an-trend .an-trend__rev { display: none; }
}

/* AI rail */
.an-ai { position: sticky; top: 88px; border: 1px solid rgba(var(--accent-rgb),.28); border-radius: 14px; background: linear-gradient(180deg, rgba(var(--accent-rgb),.05), var(--c-panel) 60%); overflow: hidden; }

/* Entrance is a non-blocking enhancement — base state is always visible.
   (Opacity-gated entrances were leaving content stuck hidden here.) */
/* Geo / map */
.an-map { display: grid; grid-template-columns: 1.55fr 1fr; gap: 0; }
@media (max-width: 900px) { .an-map { grid-template-columns: 1fr; } .an-map__rail { border-left: none !important; border-top: 1px solid var(--c-line); } }
.an-map__rail { border-left: 1px solid var(--c-line); padding: 20px 22px; display: flex; flex-direction: column; gap: 12px; }
`;

// ═══════════════════════════════════════════════════════════════════════
//  ANIMATED CHARTS
// ═══════════════════════════════════════════════════════════════════════

// Area+line views chart. The line/area draw in via a CSS clip-path animation
// whose RESTING state is fully revealed — so the chart is always visible even
// if the animation never runs (rAF-based reveals were leaving it clipped).
function AnViewsChart({ data, h = 200, accent = "var(--c-amber)" }) {
  const max = Math.max(...data, 1);
  const N = Math.max(data.length, 2);
  const w = 1000;
  const padT = 22, padB = 26;
  const xFor = (i) => (i / (N - 1)) * w;
  const yFor = (v) => (h - padB) - (v / max) * (h - padB - padT);

  const pts = data.map((v, i) => [xFor(i), yFor(v)]);
  const line = pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${w} ${h - padB} L 0 ${h - padB} Z`;
  const peakIdx = data.indexOf(max);
  const avg = data.reduce((a, b) => a + b, 0) / (data.length || 1);

  // Re-trigger the CSS draw-in when the data changes by keying the <g>.
  const animKey = data.join(",").length + "-" + N;
  const today = new Date();
  const DOW = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h, display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="an-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity=".28"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* avg line */}
      <line x1="0" x2={w} y1={yFor(avg)} y2={yFor(avg)} stroke="var(--c-ink-4)" strokeWidth="1" strokeDasharray="3 5" vectorEffect="non-scaling-stroke"/>
      <g key={animKey} className="an-chart-reveal">
        <path d={area} fill="url(#an-area)"/>
        <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
      </g>
      {/* peak marker */}
      <g>
        <circle cx={xFor(peakIdx)} cy={yFor(max)} r="5" fill={accent} stroke="var(--c-bg)" strokeWidth="2"/>
        <text x={xFor(peakIdx)} y={yFor(max) - 12} textAnchor="middle" fill={accent} fontSize="13" fontFamily="JetBrains Mono" fontWeight="600">{anFmt(max)}</text>
      </g>
      {/* weekday ticks */}
      {data.map((_, i) => {
        if (N > 16 && i % 2) return null;
        const d = new Date(today); d.setDate(d.getDate() - (N - 1 - i));
        return <text key={i} x={xFor(i)} y={h - 6} textAnchor="middle" fill="var(--c-ink-4)" fontSize="10" fontFamily="JetBrains Mono">{DOW[d.getDay()]}</text>;
      })}
    </svg>
  );
}

// Donut that animates its sweep — used for finish-rate + share splits.
function AnDonut({ value, label, sub, color = tkc("amber"), size = 132 }) {
  const v = useCountUp(value, 1000);
  const r = size / 2 - 11;
  const c = 2 * Math.PI * r;
  const off = c * (1 - v / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} style={{ display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-line)" strokeWidth="9"/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${size / 2} ${size / 2})`}/>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="var(--c-ink)" fontFamily="var(--f-display)" fontStyle="italic" fontSize="30">{Math.round(v)}%</text>
        <text x="50%" y="64%" textAnchor="middle" fill="var(--c-ink-4)" fontFamily="JetBrains Mono" fontSize="9" letterSpacing=".12em">{sub}</text>
      </svg>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

// Mini sparkline for trend rows.
function AnSpark({ data, w = 110, h = 34, up = true }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / range) * (h - 4) - 2}`).join(" ");
  const color = up ? "var(--c-good)" : "var(--c-blood-x)";
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2} r="2.5" fill={color}/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════
//  GEO — views by country + a dotted world map
// ═════════════════════════════════════════════════════════════════
const AN_GEO = [
  { c: "United States",  code: "US", lon: -98,  lat: 39,  share: 0.34 },
  { c: "Japan",          code: "JP", lon: 138,  lat: 36,  share: 0.14 },
  { c: "Germany",        code: "DE", lon: 10,   lat: 51,  share: 0.08 },
  { c: "United Kingdom", code: "GB", lon: -1.5, lat: 52,  share: 0.07 },
  { c: "Brazil",         code: "BR", lon: -51,  lat: -10, share: 0.06 },
  { c: "South Korea",    code: "KR", lon: 127,  lat: 37,  share: 0.05 },
  { c: "Canada",         code: "CA", lon: -106, lat: 56,  share: 0.05 },
  { c: "India",          code: "IN", lon: 78,   lat: 22,  share: 0.05 },
  { c: "France",         code: "FR", lon: 2,    lat: 46,  share: 0.04 },
  { c: "Australia",      code: "AU", lon: 133,  lat: -25, share: 0.035 },
  { c: "Mexico",         code: "MX", lon: -102, lat: 23,  share: 0.03 },
  { c: "Nigeria",        code: "NG", lon: 8,    lat: 9,   share: 0.025 },
];
// Dotted world silhouette — land cells on a 10° grid (col 0 = lon -180 .. col 35 = lon +170;
// rows are latitude bands). Each entry: [lat, [colStart,colEnd], ...]. Recognizable continents.
const AN_LAND_ROWS = [
  { lat: 75,  cols: [[6,11],[13,16],[25,35]] },
  { lat: 65,  cols: [[2,12],[14,15],[19,35]] },
  { lat: 55,  cols: [[2,12],[17,35]] },
  { lat: 45,  cols: [[4,11],[17,33]] },
  { lat: 35,  cols: [[5,10],[17,33]] },
  { lat: 25,  cols: [[6,10],[16,30],[33,33]] },
  { lat: 15,  cols: [[8,10],[16,22],[25,30]] },
  { lat: 5,   cols: [[9,13],[17,22],[27,32]] },
  { lat: -5,  cols: [[10,14],[18,22],[28,33]] },
  { lat: -15, cols: [[10,14],[19,22],[30,33]] },
  { lat: -25, cols: [[10,13],[19,21],[29,33]] },
  { lat: -35, cols: [[10,12],[19,21],[30,33]] },
  { lat: -45, cols: [[10,11],[34,35]] },
  { lat: -55, cols: [[10,10]] },
];
const anProjX = (lon, w) => (lon + 180) / 360 * w;
const anProjY = (lat, h) => (90 - lat) / 180 * h;

function AnWorldMap({ active, onHover }) {
  const W = 1000, H = 480;
  const [shown, setShown] = usAN(false);
  ueAN(() => { const t = setTimeout(() => setShown(true), 60); return () => clearTimeout(t); }, []);
  const dots = umAN(() => {
    const out = [];
    AN_LAND_ROWS.forEach(row => {
      row.cols.forEach(([a, b]) => {
        for (let col = a; col <= b; col++) {
          const lon = -180 + col * 10 + 5;
          out.push([anProjX(lon, W), anProjY(row.lat, H)]);
        }
      });
    });
    return out;
  }, []);
  const maxShare = Math.max(...AN_GEO.map(g => g.share));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {[-120, -60, 0, 60, 120].map(lon => (
        <line key={"v" + lon} x1={anProjX(lon, W)} y1="0" x2={anProjX(lon, W)} y2={H} stroke="var(--c-line)" strokeWidth="1" opacity=".5"/>
      ))}
      {[60, 30, 0, -30].map(lat => (
        <line key={"h" + lat} x1="0" y1={anProjY(lat, H)} x2={W} y2={anProjY(lat, H)} stroke="var(--c-line)" strokeWidth="1" opacity={lat === 0 ? ".8" : ".4"} strokeDasharray={lat === 0 ? "none" : "2 6"}/>
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d[0]} cy={d[1]} r="3.4" fill="var(--c-ink-3)" opacity={shown ? ".62" : "0"} style={{ transition: `opacity .5s ${(i % 30) * 10}ms` }}/>
      ))}
      {AN_GEO.map((g, i) => {
        const x = anProjX(g.lon, W), y = anProjY(g.lat, H);
        const r = 6 + Math.sqrt(g.share / maxShare) * 24;
        const isActive = active === g.code;
        const top = i === 0;
        return (
          <g key={g.code} style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover && onHover(g.code)} onMouseLeave={() => onHover && onHover(null)}>
            {top && <circle cx={x} cy={y} r={r} fill="none" stroke= "var(--c-amber)" strokeWidth="1.5" opacity=".5">
              <animate attributeName="r" values={`${r};${r + 16};${r}`} dur="2.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values=".5;0;.5" dur="2.4s" repeatCount="indefinite"/>
            </circle>}
            <circle cx={x} cy={y} r={shown ? r : 0} fill= "var(--c-amber)" opacity={isActive ? ".85" : ".42"}
              stroke= "var(--c-amber)" strokeWidth={isActive ? 2 : 0}
              style={{ transition: `r .6s cubic-bezier(.2,.8,.2,1) ${i * 40}ms, opacity .2s` }}/>
            <circle cx={x} cy={y} r="2" fill={tkc("on-amber")}/>
          </g>
        );
      })}
    </svg>
  );
}

function AnGrowthChart({ data, color = tkc("amber"), h = 60 }) {
  const W = 300;
  const max = Math.max(...data, 1), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, h - ((v - min) / rng) * (h - 8) - 4]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${W} ${h} L 0 ${h} Z`;
  const gid = "ang" + (Math.round(Math.abs((data[0] || 1) * 1000)) % 99999);
  return (
    <svg viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h, display: "block" }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={area} fill={`url(#${gid})`} className="an-chart-reveal"/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" className="an-chart-reveal"/>
    </svg>
  );
}

// Horizontal bar (geography / demo).
function AnBar({ label, pct, sub, color = tkc("amber"), dot, active }) {
  const w = useCountUp(pct, 900);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "118px 1fr 46px", gap: 12, alignItems: "center", opacity: active === false ? .4 : 1, transition: "opacity .15s" }}>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 7 }}>
        {dot && <span style={{ width: 7, height: 7, borderRadius: "var(--r-1)", background: color, flexShrink: 0 }}/>}{label}
      </span>
      <span style={{ height: 8, background: "var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${w}%`, background: color, borderRadius: "var(--r-2)" }}/>
      </span>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", textAlign: "right" }}>{sub || `${Math.round(w)}%`}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════════════════════════
function StudioAnalyticsPage({ onOpenPromo, onOpenFilm }) {
  const films = (window.PROJECTS || []).filter(f => f.published);
  const [range, setRange] = usAN("14d");
  const [focusId, setFocusId] = usAN(films[0] ? films[0].id : null);
  const [boosted, setBoosted] = usAN(() => {
    try { return JSON.parse(localStorage.getItem("cina:boosted") || "[]"); } catch { return []; }
  });

  const focus = films.find(f => f.id === focusId) || films[0];
  const [geoHover, setGeoHover] = usAN(null);

  // Aggregate numbers across published films.
  const totals = umAN(() => {
    const views = films.reduce((a, f) => a + (f.views || 0), 0);
    const filmRev = films.reduce((a, f) => a + filmRevenue(f), 0);
    const watchHours = Math.round(films.reduce((a, f) => {
      const rt = parseFloat(f.runtime) || 1.5;
      return a + (f.views || 0) * (f.avgWatch || 0.5) * rt;
    }, 0) / 60);
    const finish = films.length ? films.reduce((a, f) => a + (f.completionRate || 0), 0) / films.length : 0;
    const subs = Math.round(views * 0.011);
    const followers = Math.round(views * 0.028);
    const storeSales = Math.round(views * 0.0021); // site store revenue ($)
    const revenue = filmRev + storeSales;
    return { views, revenue, filmRev, storeSales, watchHours, finish, subs, followers };
  }, [films.length]);

  // Site store — merch break-out + a 14-pt sales trend.
  const store = umAN(() => {
    const total = totals.storeSales;
    const items = [
      { k: "Posters & prints", pct: 0.38, c: "var(--c-amber)", units: 412 },
      { k: "Vinyl & scores",   pct: 0.27, c: tkc("cat-2"), units: 188 },
      { k: "Apparel",          pct: 0.22, c: tkc("cat-1"), units: 264 },
      { k: "Collector bundles", pct: 0.13, c: tkc("cat-4"), units: 96 },
    ].map(it => ({ ...it, value: Math.round(total * it.pct) }));
    const trend = Array.from({ length: 14 }, (_, i) => {
      const x = Math.sin(i * 1.3 + 2) * 0.5 + 0.5;
      return Math.round(total / 14 * (0.6 + x * 0.9));
    });
    return { total, items, trend };
  }, [totals.storeSales]);

  // Subscriber + follower growth series.
  const subSeries = umAN(() => Array.from({ length: 14 }, (_, i) => Math.round(totals.subs * (0.78 + 0.22 * i / 13))), [totals.subs]);
  const folSeries = umAN(() => Array.from({ length: 14 }, (_, i) => Math.round(totals.followers * (0.7 + 0.3 * i / 13) * (0.97 + (i % 3) * 0.012))), [totals.followers]);

  // The chart shows the focused film's daily series (scaled by range).
  const series = umAN(() => {
    const d = focus && focus.dailyViews ? focus.dailyViews : [];
    if (range === "7d") return d.slice(-7);
    if (range === "30d") {
      // synthesize a 30-pt series by prepending a believable ramp
      const head = [];
      const first = d[0] || 1000;
      for (let i = 16; i > 0; i--) head.push(Math.round(first * (0.5 + 0.5 * (16 - i) / 16) * (0.85 + (i % 3) * 0.06)));
      return [...head, ...d];
    }
    return d;
  }, [focus, range]);

  const trending = umAN(() =>
    [...films].sort((a, b) => filmMomentum(b) - filmMomentum(a)), [films.length]);

  const markBoost = (id) => {
    setBoosted(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try { localStorage.setItem("cina:boosted", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const buyBoost = (f) => {
    const pkgViews = 25_000;
    const price = 149;
    if (window.openPay) {
      window.openPay({
        kind: "buy",
        title: `Boost · ${f.title}`,
        subtitle: `Guaranteed +${anFmt(pkgViews)} qualified views`,
        accent: tkc("amber"),
        priceUSD: price,
        perks: [
          `Featured on Watch home + genre row for 7 days`,
          `Pushed to ${anFmt(pkgViews)} viewers who finish films like this`,
          `Cross-promoted in 2 creator newsletters`,
          `Real-time boost analytics on this page`,
        ],
        onConfirm: () => {
          markBoost(f.id);
          window.toast && window.toast({ title: "BOOST LIVE", text: `${f.title} is now promoted across Watch.`, kind: "good" });
        },
      });
    } else {
      markBoost(f.id);
      window.toast && window.toast({ title: "BOOST LIVE", text: `${f.title} · +${anFmt(pkgViews)} views`, kind: "good" });
    }
  };

  const promote = (f) => {
    if (onOpenPromo) { onOpenPromo(); return; }
    window.toast && window.toast({ title: "PROMOTION", text: `Opening promotion for ${f.title}…`, kind: "info" });
  };

  const Zone = ({ n, t, s, action }) => (
    <div className="an-zone">
      <span className="an-zone__bar"/><span className="an-zone__n">{n}</span>
      <span className="an-zone__t">{t}</span>{s && <span className="an-zone__s">· {s}</span>}
      <span className="an-zone__sp"/>{action}
    </div>
  );

  const RANGES = [["7d", "7 days"], ["14d", "14 days"], ["30d", "30 days"]];

  return (
    <div data-screen-label="Studio · Analytics" style={{ position: "absolute", inset: 0, paddingTop: 104, overflowY: "auto" }}>
      <style>{AN_CSS}</style>
      <div className="an-wrap">

        {/* Masthead */}
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "8px 0 22px", borderBottom: "1px solid var(--c-line)", marginBottom: 8 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)" }}/>
              ANALYTICS · ALL SURFACES
            </div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(38px,5.5vw,68px)", letterSpacing: "-0.02em", margin: 0, lineHeight: .92, color: "var(--c-ink)" }}>
              How it's playing.
            </h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {RANGES.map(([id, lab]) => (
              <button key={id} className={`an-chip ${range === id ? "an-chip--on" : ""}`} onClick={() => setRange(id)}>{lab}</button>
            ))}
          </div>
        </header>

        {/* 01 · Overview — full-width KPI ribbon */}
        <Zone n="01" t="Overview" s={`${films.length} films live · all-time`}/>
        <div className="an-kpis an-rise">
          <Kpi k="Total views" v={anFmt(totals.views)} d="+12.4%" up/>
          <Kpi k="Watch hours" v={anFmt(totals.watchHours)} d="+8.1%" up/>
          <Kpi k="Subscribers" v={anFmt(totals.subs)} d="+318" up tint={tkc("cat-1")}/>
          <Kpi k="Followers" v={anFmt(totals.followers)} d="+1.2K" up tint={tkc("cat-2")}/>
          <Kpi k="Store sales" v={anMoney(totals.storeSales)} d="+22%" up tint={tkc("cat-4")}/>
          <Kpi k="Avg finish" v={`${Math.round(totals.finish * 100)}%`} d="+2.3pt" up tint="var(--c-good)"/>
          <Kpi k="Revenue" v={anMoney(totals.revenue)} d="+14.0%" up tint= "var(--c-amber)"/>
        </div>

        <div className="an-grid" style={{ marginTop: 18 }}>
          {/* ─── MAIN COLUMN ─── */}
          <div style={{ minWidth: 0 }}>

            {/* Big chart */}
            <div className="an-panel an-rise" style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
                <div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Daily views · {focus ? focus.title : ""}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", letterSpacing: "-0.02em", marginTop: 4 }}>
                    {anFmt(series.reduce((a, b) => a + b, 0))} <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)" }}>views · {range === "7d" ? "7d" : range === "30d" ? "30d" : "14d"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {films.map(f => (
                    <button key={f.id} className={`an-chip ${focusId === f.id ? "an-chip--on" : ""}`} onClick={() => setFocusId(f.id)}>{f.title}</button>
                  ))}
                </div>
              </div>
              <AnViewsChart data={series} h={220}/>
            </div>

            {/* 02 · Where they're watching — world map */}
            <Zone n="02" t="Where they're watching" s="views by country · last 14 days"/>
            <div className="an-panel an-rise" style={{ padding: 0, overflow: "hidden" }}>
              <div className="an-map">
                <div style={{ padding: "18px 20px 10px", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Global audience</div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{focus ? focus.countries : 94} countries</div>
                  </div>
                  <AnWorldMap active={geoHover} onHover={setGeoHover}/>
                </div>
                <div className="an-map__rail">
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 2 }}>Top countries</div>
                  {AN_GEO.slice(0, 7).map((g, i) => (
                    <div key={g.code} onMouseEnter={() => setGeoHover(g.code)} onMouseLeave={() => setGeoHover(null)}>
                      <AnBar label={g.c} pct={Math.round(g.share / AN_GEO[0].share * 100)} sub={`${Math.round(g.share * 100)}%`}
                        color={i === 0 ? "var(--c-amber)" : "var(--c-amber-d)"} active={geoHover ? geoHover === g.code : undefined}/>
                    </div>
                  ))}
                  <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--c-line)", display: "flex", gap: 22 }}>
                    <Mini k="New viewers" v="59%"/>
                    <Mini k="Avg. session" v="38m"/>
                  </div>
                </div>
              </div>
              {/* traffic + devices strip */}
              <div style={{ borderTop: "1px solid var(--c-line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                <div style={{ padding: "16px 20px", borderRight: "1px solid var(--c-line)" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>How they find you</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <AnBar label="Cina home & rows" pct={44} sub="44%" dot color= "var(--c-amber)"/>
                    <AnBar label="Search" pct={21} sub="21%" dot color={tkc("cat-1")}/>
                    <AnBar label="Social / shares" pct={19} sub="19%" dot color={tkc("cat-2")}/>
                    <AnBar label="External & direct" pct={16} sub="16%" dot color={tkc("cat-4")}/>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>Devices</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <AnBar label="Mobile" pct={52} sub="52%" dot color= "var(--c-amber)"/>
                    <AnBar label="TV / living room" pct={28} sub="28%" dot color={tkc("cat-2")}/>
                    <AnBar label="Desktop" pct={16} sub="16%" dot color={tkc("cat-1")}/>
                    <AnBar label="Tablet" pct={4} sub="4%" dot color={tkc("cat-4")}/>
                  </div>
                </div>
              </div>
            </div>

            {/* 03 · Trending + boost */}
            <Zone n="03" t="Trending now" s="ranked by 3-day momentum" action={
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>PROMOTE · BOOST</span>
            }/>
            <div className="an-panel an-rise" style={{ padding: "8px 24px" }}>
              {trending.map((f, i) => {
                const mom = filmMomentum(f);
                const up = mom >= 0;
                const isBoosted = boosted.includes(f.id);
                const thumbKind = f.thumb || ({ p1: "darkroom-est", p5: "the-photo" }[f.id]);
                return (
                  <div key={f.id} className="an-trend">
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: i === 0 ? "var(--c-amber)" : "var(--c-ink-4)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <button onClick={() => onOpenFilm && onOpenFilm(f)} style={{ width: 64, height: 42, borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line-2)", padding: 0, cursor: "pointer", background: f.cover, position: "relative" }}>
                      {window.FrameThumb && thumbKind ? <FrameThumb kind={thumbKind} usePhoto/> : null}
                    </button>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.title}</span>
                        {isBoosted && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap" }}>● BOOSTED</span>}
                      </div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>{anFmt(f.views)} VIEWS · ★ {f.rating}</div>
                    </div>
                    <div className="an-trend__spark" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <AnSpark data={(f.dailyViews || []).slice(-7)} up={up}/>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: up ? "var(--c-good)" : "var(--c-blood-x)", whiteSpace: "nowrap" }}>{up ? "▲" : "▼"} {Math.abs(Math.round(mom * 100))}%</span>
                    </div>
                    <div className="an-trend__rev" style={{ textAlign: "right" }}>
                      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{anMoney(filmRevenue(f))}</div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>EARNED</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => promote(f)} className="btn" style={{ height: 32, padding: "0 12px", fontSize: "var(--fs-body)" }}>Promote</button>
                      <button onClick={() => buyBoost(f)} className="btn btn-primary" style={{ height: 32, padding: "0 13px", fontSize: "var(--fs-body)", gap: 6 }}>
                        <Icon name="sparkles" size={11}/>{isBoosted ? "Boost more" : "Buy boost"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 04 · Audience & retention */}
            <Zone n="04" t="Audience & retention" s={focus ? `${focus.title} · where they watch + drop` : ""}/>
            <div className="an-rise" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, alignItems: "stretch" }}>
              <div className="an-panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Top geographies</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <AnBar label="United States" pct={34} sub="34%"/>
                  <AnBar label="Japan" pct={21} sub="21%" color={tkc("cat-1")}/>
                  <AnBar label="Germany" pct={12} sub="12%" color={tkc("cat-4")}/>
                  <AnBar label="Brazil" pct={9} sub="9%" color={tkc("cat-2")}/>
                  <AnBar label="Rest of world" pct={24} sub="24%" color="var(--c-ink-3)"/>
                </div>
                <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 16, display: "flex", gap: 28 }}>
                  <Mini k="Countries" v={String(focus ? focus.countries : "—")}/>
                  <Mini k="Avg. watched" v={focus ? `${Math.round(focus.avgWatch * 100)}%` : "—"}/>
                  <Mini k="Returning" v="41%"/>
                </div>
              </div>
              <div className="an-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
                <AnDonut value={Math.round((focus ? focus.completionRate : 0.6) * 100)} label="Finish rate" sub="COMPLETE" color="var(--c-good)"/>
                <div style={{ textAlign: "center", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, maxWidth: 220 }}>
                  Biggest drop at <b style={{ color: "var(--c-blood-x)" }}>74% of runtime</b> — the act-III handoff. Tightening it could lift finish 4–6pt.
                </div>
              </div>
            </div>

            {/* 05 · Store & subscriptions */}
            <Zone n="05" t="Store & subscriptions" s="site store · subscribers · followers"/>
            <div className="an-rise" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, alignItems: "stretch" }}>
              <div className="an-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Site store</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.02em" }}>{anMoney(store.total)} <span style={{ fontSize: "var(--fs-body)", color: "var(--c-good)" }}>+22%</span></div>
                </div>
                <AnGrowthChart data={store.trend} color={tkc("cat-4")} h={56}/>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--c-line)", paddingTop: 14 }}>
                  {store.items.map(it => (
                    <div key={it.k} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "var(--r-1)", background: it.c }}/>{it.k}
                      </span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{it.units} sold</span>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", minWidth: 64, textAlign: "right" }}>{anMoney(it.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="an-panel" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Subscribers</span>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-agent-visual)" }}>{anFmt(totals.subs)}</span>
                  </div>
                  <AnGrowthChart data={subSeries} color={tkc("cat-1")} h={48}/>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", marginTop: 6 }}>▲ +318 this period · ${ (totals.subs * 8.99 / 1000).toFixed(1) }K MRR</div>
                </div>
                <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Followers</span>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-agent-audio)" }}>{anFmt(totals.followers)}</span>
                  </div>
                  <AnGrowthChart data={folSeries} color={tkc("cat-2")} h={48}/>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", marginTop: 6 }}>▲ +1.2K · across all films + creator page</div>
                </div>
              </div>
            </div>

            {/* 06 · Revenue */}
            <Zone n="06" t="Revenue" s="every way the work pays"/>
            <div className="an-panel an-rise" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 0 }}>
              {[
                ["Ad revenue", Math.round(totals.filmRev * 0.42), "var(--c-amber)"],
                ["Subscriptions", Math.round(totals.filmRev * 0.29), tkc("cat-1")],
                ["Tips & rentals", Math.round(totals.filmRev * 0.14), tkc("cat-4")],
                ["Site store", totals.storeSales, tkc("cat-2")],
                ["Producer share", Math.round(totals.filmRev * 0.08), tkc("cat-2")],
              ].map(([k, v, c], i) => (
                <div key={k} style={{ padding: "6px 20px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "var(--r-1)", background: c }}/>{k}
                  </div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.02em" }}>{anMoney(v)}</div>
                </div>
              ))}
            </div>

          </div>

          {/* ─── AI ANALYST RAIL ─── */}
          <AnAiRail films={films} totals={totals} trending={trending} onBuyBoost={buyBoost}/>
        </div>
      </div>
    </div>
  );
}

function Kpi({ k, v, d, up, tint }) {
  return <CinaStat label={k} value={v} delta={d} up={up} tone={tint ? "accent" : undefined}/>;
}
function Mini({ k, v }) {
  return (
    <div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>{k}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>{v}</div>
    </div>
  );
}

// ─── AI analyst rail — reads the live numbers, suggests the next move ─────
function AnAiRail({ films, totals, trending, onBuyBoost }) {
  const [msgs, setMsgs] = usAN([]);
  const [input, setInput] = usAN("");
  const [busy, setBusy] = usAN(false);
  const scroller = urAN(null);

  const top = trending[0];
  const dataBlurb = umAN(() => {
    return `Studio analytics snapshot. Films live: ${films.map(f => `${f.title} (${anFmt(f.views)} views, ${Math.round((f.completionRate||0)*100)}% finish, ${Math.round(filmMomentum(f)*100)}% 3-day momentum, ${anMoney(filmRevenue(f))} earned)`).join("; ")}. Totals: ${anFmt(totals.views)} views, ${anMoney(totals.revenue)} revenue, ${Math.round(totals.finish*100)}% avg finish, ${anFmt(totals.subs)} subscribers.`;
  }, [films.length]);

  const seed = umAN(() => ([
    { who: "ai", text: top
      ? `${top.title} is your mover — up ${Math.round(filmMomentum(top) * 100)}% over three days. It's the one to put money behind: a boost now rides momentum instead of fighting decay.`
      : `Publish a film and I'll start reading the room for you.` },
  ]), [films.length]);

  const history = msgs.length ? msgs : seed;

  ueAN(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);

  const PRESETS = [
    "What should I promote?",
    "Why are people dropping off?",
    "Where should I spend my next $200?",
  ];

  const ask = async (q) => {
    const question = (q || input).trim();
    if (!question || busy) return;
    setInput("");
    setMsgs(prev => [...(prev.length ? prev : seed), { who: "me", text: question }]);
    setBusy(true);
    let answer = "";
    try {
      if (window.claude && window.claude.complete) {
        const r = await Promise.race([
          window.claude.complete(`You are Cina's studio analyst — sharp, concrete, a little blunt. ${dataBlurb}\n\nThe creator asks: "${question}"\n\nAnswer in 2-3 short sentences. Reference the actual numbers. Recommend ONE concrete action (promote/boost a specific film, tighten a specific moment, etc). No preamble.`),
          new Promise((_, rej) => setTimeout(() => rej(0), 12000)),
        ]);
        answer = (typeof r === "string" ? r : (r && r.text) || "").trim();
      }
    } catch (e) {}
    if (!answer) answer = anLocalInsight(question, films, totals, trending);
    setMsgs(prev => [...prev, { who: "ai", text: answer }]);
    setBusy(false);
  };

  return (
    <aside className="an-ai">
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: "var(--r-2)", background: "rgba(var(--accent-rgb),.16)", color: "var(--c-amber)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="sparkles" size={15}/>
        </span>
        <div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1 }}>Studio analyst</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>READS YOUR LIVE NUMBERS</div>
        </div>
      </div>

      <div ref={scroller} style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 360, overflowY: "auto" }}>
        {history.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.who === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "88%", padding: "10px 13px", borderRadius: "var(--r-3)", fontSize: "var(--fs-body)", lineHeight: 1.5,
              background: m.who === "me" ? "var(--c-amber)" : "var(--c-panel-2)",
              color: m.who === "me" ? tkc("on-amber") : "var(--c-ink-2)",
              border: m.who === "me" ? "none" : "1px solid var(--c-line)",
              borderBottomRightRadius: m.who === "me" ? 3 : 11,
              borderBottomLeftRadius: m.who === "me" ? 11 : 3,
            }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", gap: 5, padding: "6px 4px" }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-ink-4)", animation: `anBlink 1s ${i * 0.15}s infinite` }}/>)}
            <style>{"@keyframes anBlink{0%,100%{opacity:.25}50%{opacity:1}}"}</style>
          </div>
        )}
      </div>

      <div style={{ padding: "0 18px 12px", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PRESETS.map(p => (
          <button key={p} onClick={() => ask(p)} disabled={busy} style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)",
            background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: 999, padding: "5px 10px", cursor: busy ? "default" : "pointer",
          }}>{p}</button>
        ))}
      </div>

      <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") ask(); }}
          placeholder="Ask about your numbers…"
          style={{ flex: 1, minWidth: 0, height: 38, padding: "0 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", outline: "none" }}/>
        <button onClick={() => ask()} disabled={busy || !input.trim()} className="btn btn-primary" style={{ height: 38, padding: "0 14px", opacity: busy || !input.trim() ? .5 : 1 }}>
          <Icon name="chev-r" size={14}/>
        </button>
      </div>
    </aside>
  );
}

// Canned analyst fallback — picks a real film + action from live data.
function anLocalInsight(q, films, totals, trending) {
  const top = trending[0];
  const weakest = [...films].sort((a, b) => (a.completionRate || 1) - (b.completionRate || 1))[0];
  const lc = q.toLowerCase();
  if (/promot|boost|spend|money|\$|invest/.test(lc) && top) {
    return `Put it behind ${top.title} — it's up ${Math.round(filmMomentum(top) * 100)}% over three days and already earning ${anMoney(filmRevenue(top))}. A $149 boost there should return faster than spreading spend thin. Buy the boost from its row above.`;
  }
  if (/drop|retention|finish|leav|quit/.test(lc) && weakest) {
    return `${weakest.title} loses the most people — only ${Math.round((weakest.completionRate || 0) * 100)}% finish, with the cliff around 74% of runtime. That's an act-III pacing problem; trim the handoff scene and re-publish before you spend on promotion.`;
  }
  if (/who|audience|where|countr|geo/.test(lc)) {
    return `Your audience is concentrated in the US (34%) and Japan (21%), and 41% are returning viewers — a real base. Lean Japan: subtitle the next drop day-one and you'll likely see that 21% climb.`;
  }
  return `You're at ${anFmt(totals.views)} views and ${anMoney(totals.revenue)} earned with ${Math.round(totals.finish * 100)}% average finish. The single highest-leverage move right now is boosting ${top ? top.title : "your top film"} while it has momentum — everything else can wait a week.`;
}

Object.assign(window, { StudioAnalyticsPage });
