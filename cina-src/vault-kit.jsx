// vault-kit.jsx — ONE shared visual system for every performer surface on Cina.
//
// The actor pages (Watch · The Vault, the profile, the AI Studio, Pitch casting,
// the Studio production Vault) each grew their own look. This kit gives them a
// single language: same tokens, same card, same hero, same workflow spine — so a
// performer feels like the same object everywhere, and the birth→promote pipeline
// reads identically on every screen.
//
// Exports: VaultHero, VaultStatRibbon, VaultActorCard, VaultStageSpine,
//          VaultPanel, VaultChip, VaultAvatar, VAULT_STAGES_META

const { useState: usVK, useEffect: ueVK, useMemo: umVK, useRef: urVK } = React;

// ─── Shared CSS — injected once ────────────────────────────────────────────
(function injectVaultKitCSS() {
  if (document.getElementById("vault-kit-css")) return;
  const el = document.createElement("style");
  el.id = "vault-kit-css";
  el.textContent = `
  :root {
    --vk-gut: clamp(20px, 5vw, 80px);
    --vk-amber: var(--c-amber);
    --vk-radius: 12px;
  }

  /* ══ Section gutter wrapper — full-bleed, generous ══ */
  .vk-wrap { width: 100%; max-width: none; margin: 0; padding: 0 var(--vk-gut); }

  /* ══ HERO — cinematic, living face-wall backdrop ══ */
  .vk-hero { position: relative; z-index: 0; isolation: isolate; overflow: hidden; border-bottom: 1px solid var(--c-line); background: var(--c-void);
    min-height: clamp(420px, 58vh, 600px); display: flex; flex-direction: column; justify-content: flex-end; }
  .vk-hero__bg { position: absolute; inset: 0; display: grid; gap: 2px; }
  .vk-hero__face { position: relative; overflow: hidden; }
  /* oversize the portrait so the slow drift never reveals a top/edge gap */
  .vk-hero__faceInner { position: absolute; inset: -10% -6%; transform-origin: 50% 42%; }
  .vk-hero__faceInner > svg, .vk-hero__faceInner > * { width: 100% !important; height: 100% !important; object-fit: cover; }
  /* per-column soft edge so the seam between faces and the top reads as cinema, not a cut */
  .vk-hero__face::after { content: ""; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(180deg, rgba(7,7,10,.55) 0%, rgba(7,7,10,0) 22%, rgba(7,7,10,0) 78%, rgba(7,7,10,.45) 100%); }
  @media (prefers-reduced-motion: no-preference) {
    .vk-hero__faceInner { animation: vk-drift 17s cubic-bezier(.4,0,.5,1) infinite alternate; will-change: transform; }
    .vk-hero__face:nth-child(2n) .vk-hero__faceInner { animation-duration: 21s; animation-direction: alternate-reverse; }
    .vk-hero__face:nth-child(3n) .vk-hero__faceInner { animation-duration: 25s; }
  }
  @keyframes vk-drift {
    0%   { transform: scale(1.06) translate(0%, 0%); }
    100% { transform: scale(1.16) translate(-1.5%, -3.5%); }
  }
  .vk-hero__scrim { position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(120% 90% at 18% 38%, rgba(7,7,10,.92) 0%, rgba(7,7,10,.5) 40%, transparent 72%),
      linear-gradient(to top, var(--c-void) 2%, rgba(7,7,10,.4) 40%, rgba(7,7,10,.08) 66%, rgba(7,7,10,.42) 100%),
      linear-gradient(to right, rgba(7,7,10,.9) 0%, rgba(7,7,10,.34) 50%, rgba(7,7,10,.5) 100%); }
  .vk-hero__grain { position: absolute; inset: 0; pointer-events: none; opacity: .4; mix-blend-mode: overlay;
    background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px); }
  .vk-hero__inner { position: relative; padding: clamp(40px,5vw,68px) var(--vk-gut) 0; }
  .vk-kicker { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .26em; color: var(--vk-amber);
    font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; gap: 9px; }
  .vk-kicker__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--vk-amber); box-shadow: 0 0 7px var(--vk-amber); }
  .vk-title { font-family: var(--f-display); font-style: italic; font-weight: 400;
    font-size: clamp(58px, 8.2vw, 124px); line-height: .86; letter-spacing: -0.04em; margin: 16px 0 0;
    color: var(--c-ink); text-wrap: balance; text-shadow: 0 2px 30px rgba(0,0,0,.5); }
  .vk-title em { font-style: italic; color: var(--vk-amber); }
  .vk-lede { font-size:var(--fs-lead); color: var(--c-ink-2); max-width: 58ch; line-height: 1.62; margin: 18px 0 0; text-wrap: pretty; }

  /* ══ STAT RIBBON — the instrument strip under a hero ══ */
  .vk-ribbon { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
    border-top: 1px solid rgba(255,255,255,.12); margin-top: clamp(24px,3.4vw,38px);
    background: rgba(7,7,10,.55); backdrop-filter: blur(8px); }
  .vk-ribbon__cell { padding: 15px clamp(14px,2.2vw,26px) 17px; border-left: 1px solid rgba(255,255,255,.08);
    display: flex; flex-direction: column; gap: 6px; }
  .vk-ribbon__cell:first-child { border-left: none; }
  .vk-ribbon__k { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--c-ink-4);
    text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
  .vk-ribbon__v { font-family: var(--f-display); font-style: italic; font-size: clamp(24px,3vw,38px); line-height: 1;
    letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: var(--c-ink); }
  .vk-ribbon__s { font-size:var(--fs-label); color: var(--c-ink-3); }
  @media (max-width: 720px) { .vk-ribbon { grid-auto-flow: row; grid-auto-columns: auto; grid-template-columns: 1fr 1fr; }
    .vk-ribbon__cell:nth-child(odd) { border-left: none; } }

  /* ══ ACTOR CARD — the one performer object, used everywhere ══ */
  .vk-card { position: relative; border-radius: var(--vk-radius); overflow: hidden; border: 1px solid var(--c-line);
    background: var(--c-panel); display: flex; flex-direction: column; cursor: pointer; text-align: left;
    color: inherit; padding: 0; appearance: none; font: inherit;
    transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease; }
  .vk-card:hover { transform: translateY(-3px); box-shadow: 0 22px 50px -30px rgba(0,0,0,.85); }
  .vk-card__cover { position: relative; width: 100%; aspect-ratio: 4 / 5; overflow: hidden; flex-shrink: 0; background: var(--c-bg); }
  .vk-card__cover > svg, .vk-card__cover > :first-child { width: 100% !important; height: 100% !important; object-fit: cover;
    transition: transform .5s cubic-bezier(.2,.7,.2,1); }
  .vk-card:hover .vk-card__cover > svg, .vk-card:hover .vk-card__cover > :first-child { transform: scale(1.05); }
  .vk-card__shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(7,7,10,.97) 4%, rgba(7,7,10,.28) 50%, transparent 80%); }
  .vk-card__top { position: absolute; top: 11px; left: 11px; right: 11px; display: flex; align-items: flex-start; gap: 6px; }
  .vk-card__arch { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .18em; text-transform: uppercase;
    color: rgba(255,255,255,.92); background: rgba(0,0,0,.5); backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,.14); border-radius: 999px; padding: 3px 9px; }
  .vk-card__body { position: absolute; left: 16px; right: 16px; bottom: 14px; }
  .vk-card__name { font-family: var(--f-display); font-style: italic; font-weight: 500; font-size: clamp(23px, 2vw, 30px); line-height: 1.02;
    color: var(--c-white); letter-spacing: -.02em; text-shadow: 0 2px 14px rgba(0,0,0,.55); }
  .vk-card__role { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .22em; text-transform: uppercase; margin-top: 6px; font-weight: 600; }
  .vk-card__meta { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .12em; text-transform: uppercase;
    color: rgba(255,255,255,.62); margin-top: 7px; display: flex; align-items: center; gap: 7px; }
  .vk-card__quote { font-family: var(--f-display); font-style: italic; font-size:var(--fs-body); color: rgba(255,255,255,.86);
    line-height: 1.4; margin-top: 8px; max-height: 0; opacity: 0; overflow: hidden;
    transition: max-height .26s ease, opacity .2s ease, margin-top .2s ease; }
  .vk-card:hover .vk-card__quote { max-height: 60px; opacity: 1; }

  /* mini stage pips on a card */
  .vk-pips { display: flex; align-items: center; gap: 3px; }
  .vk-pip { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.22); }
  .vk-pip[data-on="1"] { background: var(--vk-amber); box-shadow: 0 0 5px rgba(var(--accent-rgb),.6); }

  /* ══ WORKFLOW SPINE — the birth→promote pipeline, identical everywhere ══ */
  .vk-spine { display: flex; align-items: stretch; gap: 0; width: 100%; }
  .vk-spine__node { flex: 1; position: relative; display: flex; flex-direction: column; gap: 9px;
    padding: 0; min-width: 0; background: none; border: none; text-align: left; cursor: pointer; color: inherit; appearance: none; font: inherit; }
  .vk-spine__node:disabled { cursor: default; }
  .vk-spine__track { position: relative; height: 22px; display: flex; align-items: center; }
  .vk-spine__line { position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: var(--c-line-2); transform: translateY(-50%); }
  .vk-spine__line[data-done="1"] { background: var(--vk-amber); }
  .vk-spine__dot { position: relative; z-index: 2; width: 14px; height: 14px; border-radius: 50%;
    background: var(--c-panel); border: 2px solid var(--c-line-3); display: flex; align-items: center; justify-content: center; }
  .vk-spine__dot[data-state="done"] { background: var(--vk-amber); border-color: var(--vk-amber); }
  .vk-spine__dot[data-state="now"] { border-color: var(--vk-amber); box-shadow: 0 0 0 4px rgba(var(--accent-rgb),.16); }
  .vk-spine__dot[data-state="done"]::after { content: "✓"; font-size:var(--fs-label); color: var(--c-on-amber); font-weight: 900; line-height: 1; }
  .vk-spine__lab { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .12em; text-transform: uppercase; }
  .vk-spine__lab[data-state="done"] { color: var(--c-ink); }
  .vk-spine__lab[data-state="now"] { color: var(--vk-amber); }
  .vk-spine__lab[data-state="todo"] { color: var(--c-ink-4); }
  .vk-spine__desc { font-size:var(--fs-label); color: var(--c-ink-4); line-height: 1.35; }
  .vk-spine__node:hover .vk-spine__lab[data-state="todo"] { color: var(--c-ink-2); }

  /* ══ PANEL + CHIP ══ */
  .vk-panel { background: var(--c-panel); border: 1px solid var(--c-line); border-radius: var(--vk-radius); }
  .vk-panel-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .vk-panel-head__n { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--vk-amber); font-weight: 600; }
  .vk-panel-head__t { font-family: var(--f-display); font-style: italic; font-size:var(--fs-title); color: var(--c-ink); letter-spacing: -.01em; }
  .vk-panel-head__s { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .14em; color: var(--c-ink-4); margin-left: auto; }
  .vk-chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 999px;
    border: 1px solid var(--c-line-2); background: transparent; color: var(--c-ink-3);
    font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .08em; font-weight: 600; cursor: pointer;
    text-transform: uppercase; transition: all .15s ease; appearance: none; }
  .vk-chip:hover { color: var(--c-ink); border-color: var(--c-line-3); }
  .vk-chip[data-on="1"] { background: rgba(var(--accent-rgb),.1); border-color: rgba(var(--accent-rgb),.4); color: var(--vk-amber); }
  `;
  document.head.appendChild(el);
})();

// stage metadata mirror (TalentAPI owns the real one; this is the display copy)
const VAULT_STAGES_META = [
{ id: "birth", label: "Birth", desc: "Portrait · screen test" },
{ id: "train", label: "Train", desc: "Continuity · range" },
{ id: "style", label: "Style", desc: "Wardrobe · looks" },
{ id: "mint", label: "Mint", desc: "Likeness NFT" },
{ id: "license", label: "License", desc: "Open to projects" },
{ id: "cast", label: "Cast", desc: "Roles in films" },
{ id: "promote", label: "Promote", desc: "Commercials" }];

// ─── VaultAvatar — consistent portrait framing ─────────────────────────────
function VaultAvatar({ actor, size = 300, shot = "wide" }) {
  if (!actor || typeof window.CastPortrait !== "function") {
    return <div style={{ width: "100%", height: "100%", background: actor?.palette?.[1] || "var(--c-panel-2)" }} />;
  }
  return <window.CastPortrait actor={actor} size={size} shot={shot} cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />;
}

// ─── VaultHero — the shared cinematic masthead ─────────────────────────────
// faces: array of actors for the backdrop strip (rotates subtly).
function VaultHero({ kicker, title, lede, faces = [], stats = [], children }) {
  const strip = faces.slice(0, 6);
  return (
    <section className="vk-hero" data-screen-label={typeof title === "string" ? title : "Vault hero"}>
      <div className="vk-hero__bg" style={{ gridTemplateColumns: `repeat(${Math.max(strip.length, 1)}, 1fr)`, opacity: .5 }}>
        {strip.map((a, i) =>
        <div key={a.id || i} className="vk-hero__face">
            <div className="vk-hero__faceInner" style={{ animationDelay: `${(i * -2.6).toFixed(1)}s` }}>
              <VaultAvatar actor={a} size={360} shot="wide" />
            </div>
          </div>
        )}
      </div>
      <div className="vk-hero__scrim"></div>
      <div className="vk-hero__grain"></div>
      <div className="vk-hero__inner">
        {kicker && <div className="vk-kicker"><span className="vk-kicker__dot"></span>{kicker}</div>}
        {title && <h1 className="vk-title">{title}</h1>}
        {lede && <p className="vk-lede">{lede}</p>}
        {children}
        {stats.length > 0 && <VaultStatRibbon stats={stats} />}
      </div>
    </section>);

}

// ─── VaultStatRibbon ───────────────────────────────────────────────────────
function VaultStatRibbon({ stats }) {
  return (
    <div className="vk-ribbon">
      {stats.map((p, i) =>
      <div key={p.k || i} className="vk-ribbon__cell">
          <span className="vk-ribbon__k">{p.tint && <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.tint }}></span>}{p.k}</span>
          <span className="vk-ribbon__v" style={p.tint ? { color: p.tint } : null}>{p.v}</span>
          {p.s && <span className="vk-ribbon__s">{p.s}</span>}
        </div>
      )}
    </div>);

}

// ─── VaultActorCard — the single performer object ──────────────────────────
// variant "watch" adds a footer with a trend read + a Career-timeline link
// (and never shows a price). Pitch passes its own footer via `footer`.
function VaultActorCard({ actor, onClick, meta, variant, footer }) {
  const accent = "var(--vk-amber)";
  // stage progress from TalentAPI if available
  const pips = umVK(() => {
    const rec = window.TalentAPI && window.TalentAPI.get ? window.TalentAPI.get(actor.id) : null;
    const s = rec && window.TalentAPI ? window.TalentAPI.stages(rec) : null;
    return VAULT_STAGES_META.map((st) => st.id === "birth" ? 1 : s && s[st.id] ? 1 : 0);
  }, [actor.id]);
  const go = onClick || (() => window.navigate && window.navigate(`/cast/${actor.id}`));
  const sig = (actor.bio || "").split(".")[0];
  const metaText = meta || `${actor.appearances} FILMS · ${(actor.followers / 1000).toFixed(0)}K`;
  const retired = typeof window.cinaIsRetired === "function" && window.cinaIsRetired(actor.id);
  const hasTrend = typeof window.TrendHologram === "function";
  return (
    <div className="vk-card" style={{ "--accent": accent }}>
      <button onClick={go} title={actor.name} style={{ all: "unset", cursor: "pointer", display: "block" }}>
        <div className="vk-card__cover">
          <VaultAvatar actor={actor} size={360} shot="wide" />
          <span className="vk-card__shade"></span>
          <div className="vk-card__top">
            {retired && <span className="vk-card__arch" style={{ color: tkc("ink"), borderColor: "rgba(205,211,218,.35)" }}>◆ RETIRED</span>}
            <span style={{ flex: 1 }}></span>
            {hasTrend
              ? <window.TrendHologram actor={actor} size={22} />
              : <span className="vk-pips">{pips.map((on, i) => <span key={i} className="vk-pip" data-on={on}></span>)}</span>}
          </div>
          <div className="vk-card__body">
            <div className="vk-card__name">{actor.name}</div>
            {actor.archetype && <div className="vk-card__role" style={{ color: accent }}>{actor.archetype}</div>}
            <div className="vk-card__meta">{metaText}</div>
          </div>
        </div>
      </button>
      {variant === "watch" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 13px", borderTop: "1px solid var(--c-line)" }}>
          <button onClick={(e) => { e.stopPropagation(); window.navigate && window.navigate(`/cast/${actor.id}`); }}
            className="vk-chip" style={{ height: 28 }}>
            Profile →
          </button>
          <span style={{ flex: 1 }}></span>
          <button onClick={(e) => { e.stopPropagation(); window.navigate && window.navigate(`/journey/${actor.id}`); }}
            className="vk-chip" data-on="1" style={{ height: 28, color: accent, borderColor: accent + "66", background: accent + "14" }}>
            Timeline →
          </button>
        </div>
      )}
      {footer}
    </div>);

}

// ─── VaultStageSpine — the birth→promote pipeline, shared everywhere ───────
// rec: a TalentAPI record (optional). onStage(stageId) for navigation.
function VaultStageSpine({ rec, onStage, compact = false }) {
  const s = rec && window.TalentAPI ? window.TalentAPI.stages(rec) : {};
  const next = rec && window.TalentAPI ? window.TalentAPI.nextStage(rec) : null;
  const stageState = (id) => {
    if (id === "birth" || s[id]) return "done";
    if (id === next) return "now";
    return "todo";
  };
  return (
    <div className="vk-spine">
      {VAULT_STAGES_META.map((st, i) => {
        const state = stageState(st.id);
        const prevDone = i === 0 || stageState(VAULT_STAGES_META[i - 1].id) === "done";
        return (
          <button key={st.id} className="vk-spine__node" disabled={!onStage}
          onClick={onStage ? () => onStage(st.id, st) : undefined}>
            <div className="vk-spine__track">
              {i > 0 && <span className="vk-spine__line" data-done={prevDone ? "1" : "0"} style={{ right: "50%" }}></span>}
              {i < VAULT_STAGES_META.length - 1 && <span className="vk-spine__line" data-done={state === "done" ? "1" : "0"} style={{ left: "50%" }}></span>}
              <span className="vk-spine__dot" data-state={state} style={{ margin: "0 auto" }}></span>
            </div>
            <div className="vk-spine__lab" data-state={state}>{st.label}</div>
            {!compact && <div className="vk-spine__desc">{st.desc}</div>}
          </button>);

      })}
    </div>);

}

// ─── VaultPanel — titled container ─────────────────────────────────────────
function VaultPanel({ n, title, sub, children, style }) {
  return (
    <section style={style}>
      {(title || n) &&
      <div className="vk-panel-head">
          {n && <span className="vk-panel-head__n">{n}</span>}
          {title && <span className="vk-panel-head__t">{title}</span>}
          {sub && <span className="vk-panel-head__s">{sub}</span>}
        </div>
      }
      {children}
    </section>);

}

function VaultChip({ on, children, ...rest }) {
  return <CinaPill size="lg" active={on} {...rest}>{children}</CinaPill>;
}

Object.assign(window, { VaultHero, VaultActorCard, VaultStageSpine, VaultPanel, VaultChip, VaultAvatar, VAULT_STAGES_META });