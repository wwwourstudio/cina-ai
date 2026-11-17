// cina-trend.jsx — Performer trend + auto-retirement system, shared by every
// surface (Watch Cast, Pitch Casting, profiles). Gives each performer:
//   • a live TREND SCORE (0–100) with hot / warm / cooling / cold momentum
//   • a holographic sparkline chart icon (TrendHologram) that reads the level
//   • AUTO-RETIREMENT: anyone who cools below the floor is retired automatically.
//     Retired performers keep collecting past royalties but can never earn new
//     ones (no new castings) — clearing the stage so new performers can rise.
//
// Persists alongside the manual Hall-of-Fame retirements (cina:retired:v1) and
// adds an auto layer (cina:autoretire:v1). All read-only helpers on window.*.

const { useState: usTR, useEffect: ueTR, useMemo: umTR } = React;

// ── tuning ──────────────────────────────────────────────────────────────
const TREND_FLOOR = 16;            // score below this → auto-retire
const TREND_KEYS = { auto: "cina:autoretire:v1", manual: "cina:retired:v1" };

function trSeed(id) { return String(id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0); }

// Deterministic but lively momentum for a performer this "week".
function trMomentum(actor) {
  const seed = trSeed(actor.id || actor.name);
  // week bucket so it drifts over real time without being random per-render
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const wave = Math.sin((seed % 360) * Math.PI / 180 + week * 0.6);
  return Math.round(wave * 34);     // −34…+34 %
}

// 0–100 trend level: blends reach, recent work and momentum.
function cinaTrendScore(actor) {
  if (!actor) return 0;
  const followers = actor.followers || 0;
  const films = (actor.roles || []).length || actor.appearances || actor.films || 0;
  const reach = Math.min(60, Math.log10(followers + 10) * 14);   // up to ~60
  const work = Math.min(24, films * 4);                          // up to 24
  const mo = trMomentum(actor);                                  // −34…+34
  return Math.max(0, Math.min(100, Math.round(reach + work + mo * 0.5)));
}

function cinaTrendDelta(actor) { return trMomentum(actor); }

// hot (rising + high) · warm · cooling · cold (retire candidate)
function cinaTrendState(actor) {
  const score = cinaTrendScore(actor);
  const d = cinaTrendDelta(actor);
  if (cinaIsRetired(actor.id)) return "retired";
  if (score >= 62 && d >= 6) return "hot";
  if (score < TREND_FLOOR) return "cold";
  if (d <= -10) return "cooling";
  return "warm";
}

const TREND_TINT = {
  hot: "var(--c-amber)", warm: tkc("good"), cooling: tkc("amber-d"), cold: tkc("bad"), retired: tkc("ink-3"),
};
const TREND_LABEL = {
  hot: "HOT", warm: "STEADY", cooling: "COOLING", cold: "AT RISK", retired: "RETIRED",
};

// ── retirement state ──────────────────────────────────────────────────────
function trRead(key) { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) { return {}; } }
function trWrite(key, m) { try { localStorage.setItem(key, JSON.stringify(m)); } catch (e) {} }

function cinaIsRetired(id) {
  return !!(trRead(TREND_KEYS.manual)[id] || trRead(TREND_KEYS.auto)[id]);
}
function cinaRetireReason(id) {
  if (trRead(TREND_KEYS.manual)[id]) return "hall-of-fame";
  if (trRead(TREND_KEYS.auto)[id]) return "auto";
  return null;
}

// Sweep the roster; retire anyone under the floor. Returns ids newly retired.
// Past royalties are untouched — we only flip an "active" flag.
function cinaRunAutoRetire() {
  const roster = window.CAST || [];
  const auto = trRead(TREND_KEYS.auto);
  const manual = trRead(TREND_KEYS.manual);
  const newly = [];
  roster.forEach((a) => {
    if (manual[a.id] || auto[a.id]) return;
    if (cinaTrendScore(a) < TREND_FLOOR) {
      auto[a.id] = { date: new Date().toISOString().slice(0, 10), lastScore: cinaTrendScore(a) };
      newly.push(a.id);
    }
  });
  if (newly.length) trWrite(TREND_KEYS.auto, auto);
  return newly;
}

// Past royalties a retired performer still collects (deterministic demo figure).
function cinaPastRoyalties(actor) {
  const seed = trSeed(actor.id || actor.name);
  const films = (actor.roles || []).length || actor.appearances || 1;
  return films * 1200 + (seed % 900) * 11;   // lifetime, keeps paying out
}

// Run the sweep once on load.
let _trSwept = false;
function useAutoRetire() {
  const [, force] = usTR(0);
  ueTR(() => {
    if (_trSwept) return;
    _trSwept = true;
    const newly = cinaRunAutoRetire();
    if (newly.length) {
      force((n) => n + 1);
      if (window.toast) window.toast({
        title: "ROSTER UPDATED",
        text: `${newly.length} performer${newly.length === 1 ? "" : "s"} auto-retired — making room for new faces`,
        kind: "default",
      });
    }
  }, []);
}

// ════════════════════════════════════════════════════════════════════════
function TrendHologram({ actor, size = 30, showLabel = false, withScore = false }) {
  const score = cinaTrendScore(actor);
  const delta = cinaTrendDelta(actor);
  const state = cinaTrendState(actor);
  const tint = TREND_TINT[state];
  const seed = trSeed(actor.id || actor.name);
  const uid = "trh" + seed;

  // build a 7-point sparkline trending in the delta direction
  const pts = umTR(() => {
    const n = 7, arr = [];
    for (let i = 0; i < n; i++) {
      const base = 50 + (delta / 100) * (i / (n - 1)) * 80 - delta * 0.4;
      const jitter = Math.sin(seed + i * 1.7) * 14;
      arr.push(Math.max(8, Math.min(92, base + jitter)));
    }
    // force the last point to reflect direction
    arr[n - 1] = delta >= 0 ? Math.max(arr[n - 1], 70) : Math.min(arr[n - 1], 30);
    return arr;
  }, [seed, delta]);

  const W = 60, H = 36, pad = 4;
  const stepX = (W - pad * 2) / (pts.length - 1);
  const yOf = (v) => H - pad - (v / 100) * (H - pad * 2);
  const line = pts.map((v, i) => `${pad + i * stepX},${yOf(v)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  const up = delta >= 0;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: showLabel || withScore ? 7 : 0 }} title={`Trend ${score}/100 · ${TREND_LABEL[state]} ${up ? "▲" : "▼"}${Math.abs(delta)}%`}>
      <span style={{
        position: "relative", display: "inline-block",
        width: size * (W / H), height: size, borderRadius: "var(--r-2)", overflow: "hidden",
        background: "linear-gradient(160deg, rgba(10,14,20,.9), rgba(8,10,14,.7))",
        border: `1px solid ${tint}55`, boxShadow: `0 0 10px -2px ${tint}66, inset 0 0 14px -6px ${tint}`,
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
          <defs>
            <linearGradient id={uid + "f"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={tint} stopOpacity="0.5" />
              <stop offset="100%" stopColor={tint} stopOpacity="0" />
            </linearGradient>
            <filter id={uid + "g"} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.8" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* holographic gridlines */}
          {[0.33, 0.66].map((g, i) => <line key={i} x1="0" x2={W} y1={H * g} y2={H * g} stroke={tint} strokeOpacity="0.13" strokeWidth="0.4" />)}
          <polygon points={area} fill={`url(#${uid}f)`} />
          <polyline points={line} fill="none" stroke={tint} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" filter={`url(#${uid}g)`} />
          {/* leading node */}
          <circle cx={pad + (pts.length - 1) * stepX} cy={yOf(pts[pts.length - 1])} r="1.9" fill={tkc("white")} stroke={tint} strokeWidth="0.8" />
        </svg>
      </span>
      {withScore && (
        <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
          <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: tint, fontWeight: 700 }}>{score}</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: tint, letterSpacing: ".16em", marginTop: 2 }}>{up ? "▲" : "▼"}{Math.abs(delta)}%</span>
        </span>
      )}
      {showLabel && !withScore && (
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tint, fontWeight: 700 }}>
          {TREND_LABEL[state]} {up ? "▲" : "▼"}{Math.abs(delta)}%
        </span>
      )}
    </span>
  );
}

// A small status chip — used on cards / profiles.
function TrendChip({ actor }) {
  const state = cinaTrendState(actor);
  const tint = TREND_TINT[state];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px", borderRadius: 999,
      background: `${tint}1c`, border: `1px solid ${tint}55`,
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: tint,
    }}>
      {state === "retired"
        ? <>{typeof LaurelGlyph === "function" ? <LaurelGlyph size={11} color={tint} /> : "◆"} RETIRED</>
        : <><TrendHologram actor={actor} size={16} /> {TREND_LABEL[state]}</>}
    </span>
  );
}

Object.assign(window, { cinaIsRetired, cinaRetireReason, cinaPastRoyalties, useAutoRetire, TrendHologram, TrendChip, TREND_FLOOR });
