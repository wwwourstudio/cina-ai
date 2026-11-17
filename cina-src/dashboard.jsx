// dashboard.jsx — The home. Landing page. All your films + viewing stats + activity.

const { useState: useStateD } = React;

// Responsive system for the Studio home. Phones are handled by the desktop
// gate; this keeps the page fluid + legible from ~600px up to ultrawide.
const DASH_CSS = `
:root { --dsh-gut: clamp(16px, 4vw, 64px); }
.dsh-wrap { width: 100%; max-width: 1680px; margin: 0 auto; padding: 14px var(--dsh-gut) 92px; box-sizing: border-box; }

/* ════ Command header & 4-Tab Workspace Chrome ════ */
.dsh-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--c-line); width: 100%; }
.dsh-head__left { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.dsh-head__eyebrow { font-family: var(--f-mono); font-size: var(--fs-label); letter-spacing: .18em; text-transform: uppercase; color: var(--c-amber); font-variant-numeric: tabular-nums; }
.dsh-head__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 1 1 320px; justify-content: flex-end; }
.dsh-searchbox { display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 10px; background: var(--c-panel); border: 1px solid var(--c-line-2); border-radius: 0; flex: 0 1 clamp(180px, 24%, 280px); min-width: 160px; }
.dsh-searchbox input { flex: 1; min-width: 0; background: transparent; border: none; outline: none; color: var(--c-ink); font-family: var(--f-mono); font-size: var(--fs-label); letter-spacing: .06em; }
.dsh-searchbox input::placeholder { color: var(--c-ink-4); }
.dsh-act-btn { height: 34px; padding: 0 12px; border-radius: 0; border: 1px solid var(--c-line-2); background: var(--c-panel); color: var(--c-ink-2); font-family: var(--f-mono); font-size: var(--fs-label); letter-spacing: .12em; text-transform: uppercase; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; transition: border-color .14s, color .14s; }
.dsh-act-btn:hover { border-color: var(--c-amber); color: var(--c-ink); }
.dsh-act-btn--primary { background: var(--c-amber); border-color: var(--c-amber); color: var(--c-on-amber); font-weight: 700; }
.dsh-act-btn--primary:hover { color: var(--c-on-amber); filter: brightness(1.06); }

.dsh-tabs { display: flex; align-items: stretch; gap: 2px; border-bottom: 1px solid var(--c-line); margin: 0 0 22px; overflow-x: auto; scrollbar-width: none; width: 100%; }
.dsh-tabs::-webkit-scrollbar { display: none; }
.dsh-tab { position: relative; height: 42px; padding: 0 16px; border: none; border-radius: 0; background: transparent; color: var(--c-ink-3); font-family: var(--f-mono); font-size: var(--fs-label); letter-spacing: .14em; text-transform: uppercase; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0; transition: color .14s, background .14s; font-variant-numeric: tabular-nums; }
.dsh-tab:hover { color: var(--c-ink); background: rgba(255,255,255,.025); }
.dsh-tab[aria-selected="true"] { color: var(--c-amber); background: rgba(var(--accent-rgb),.06); }
.dsh-tab[aria-selected="true"]::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--c-amber); }
.dsh-tab__cnt { color: var(--c-ink-4); font-size: var(--fs-label); }
.dsh-tab[aria-selected="true"] .dsh-tab__cnt { color: var(--c-amber); opacity: .85; }

.dsh-overview-grid { display: grid; grid-template-columns: minmax(0, 62%) minmax(0, 38%); gap: 18px; align-items: start; width: 100%; }
.dsh-overview-desk { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.dsh-surface-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 14px; width: 100%; }
.dsh-surface-card { border: 1px solid var(--c-line); border-radius: 0; background: var(--c-panel); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; color: inherit; text-align: left; transition: border-color .14s, background .14s; }
.dsh-surface-card:hover { border-color: var(--c-amber); background: var(--c-panel-2); }
@media (max-width: 1040px) { .dsh-overview-grid { grid-template-columns: 100%; } }


/* ════ THE CONSOLE — cinematic operator masthead ════ */
.dsh-console {
  position: relative; margin: 0 calc(-1 * var(--dsh-gut)) clamp(24px,2.6vw,36px);
  min-height: clamp(320px, 52vh, 560px); display: flex; flex-direction: column; justify-content: flex-end;
  border-bottom: 1px solid var(--c-line); overflow: hidden;
  background: var(--c-void);
}
.dsh-console__bg { position: absolute; inset: 0; }
.dsh-console__bg > * { position: absolute; inset: 0; width: 100%; height: 100%; }
@media (prefers-reduced-motion: no-preference) {
  .dsh-console__bg > * { animation: dshKen 26s ease-in-out infinite alternate; }
}
@keyframes dshKen { from { transform: scale(1); } to { transform: scale(1.07); } }
.dsh-console__bg::after {
  content: ""; position: absolute; inset: 0;
  background:
    linear-gradient(to top, var(--c-void) 4%, rgba(7,7,10,.55) 38%, rgba(7,7,10,.25) 70%, rgba(7,7,10,.55) 100%),
    linear-gradient(to right, rgba(7,7,10,.86) 0%, rgba(7,7,10,.35) 52%, rgba(7,7,10,.6) 100%);
}
.dsh-console__grain {
  position: absolute; inset: 0; pointer-events: none; opacity: .5; mix-blend-mode: overlay;
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px);
}
.dsh-console__inner { position: relative; padding: clamp(18px,2.2vw,28px) var(--dsh-gut) clamp(18px,2.2vw,26px); display: flex; flex-direction: column; gap: clamp(16px,2.6vw,32px); }
/* command bar */
.dsh-cbar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.dsh-cbar__mark { display: flex; align-items: center; gap: 9px; white-space: nowrap; flex-shrink: 0; }
.dsh-cbar__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--c-amber); box-shadow: 0 0 8px var(--c-amber); }
.dsh-cmdk {
  display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 12px 0 13px;
  background: rgba(12,12,15,.55); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.14); border-radius: 8px; cursor: pointer;
  color: var(--c-ink-3); font-size:var(--fs-body); width: clamp(220px, 26vw, 360px); transition: border-color .15s, color .15s;
}
.dsh-cmdk:hover { border-color: var(--c-amber); color: var(--c-ink); }
.dsh-cmdk span:not(.dsh-cmdk__key) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dsh-cmdk__key { margin-left: auto; flex-shrink: 0; font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; color: var(--c-ink-4); border: 1px solid var(--c-line-2); border-radius: 4px; padding: 2px 6px; }
.dsh-cbar__status { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border: 1px solid rgba(106,163,122,.4); border-radius: 999px; background: rgba(106,163,122,.08); white-space: nowrap; flex-shrink: 0; }
.dsh-cbar__status .t-mono { white-space: nowrap; }
/* title lockup */
.dsh-lockup { max-width: min(900px, 80vw); }
.dsh-lockup__title {
  font-family: var(--f-display); font-style: italic; font-weight: 400;
  font-size: clamp(42px, 6.4vw, 92px); line-height: .9; letter-spacing: -0.035em;
  margin: 8px 0 0; color: var(--c-ink); text-wrap: balance;
  text-shadow: 0 2px 30px rgba(0,0,0,.5);
}
.dsh-lockup__bar { height: 4px; border-radius: 3px; background: rgba(255,255,255,.16); overflow: hidden; margin-top: 14px; max-width: 460px; }
@media (prefers-reduced-motion: no-preference) {
  .dsh-lockup__bar > div { animation: dshBarIn 1.3s cubic-bezier(.4,0,.2,1) both .25s; }
}
@keyframes dshBarIn { from { width: 0; } }
.dsh-lockup__actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 16px; }
/* instrument ribbon */
.dsh-ribbon {
  position: relative; display: grid; grid-template-columns: repeat(5, 1fr);
  border: 1px solid var(--c-line); border-radius: 12px; margin-top: 16px;
  background: var(--c-panel); overflow: hidden;
}
.dsh-ribbon__cell { padding: 13px clamp(14px,2.4vw,26px) 14px; border-left: 1px solid var(--c-line); display: flex; flex-direction: column; gap: 4px; }
.dsh-ribbon__cell:first-child { border-left: none; }
.dsh-ribbon__k { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--c-ink-4); text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.dsh-ribbon__v { font-family: var(--f-display); font-style: italic; font-size: clamp(24px,3vw,34px); line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.dsh-ribbon__s { font-size:var(--fs-label); color: var(--c-ink-3); }
@media (max-width: 900px) {
  .dsh-ribbon { grid-template-columns: repeat(3,1fr); }
  .dsh-ribbon__cell:nth-child(n+4) { border-top: 1px solid var(--c-line); }
  .dsh-ribbon__cell:nth-child(4) { border-left: none; }
}
@media (max-width: 560px) {
  .dsh-ribbon { grid-template-columns: repeat(2,1fr); }
  .dsh-cmdk { min-width: 0; flex: 1; }
}
/* Console responsiveness — collapse chrome before it crowds */
@media (max-width: 860px) {
  .dsh-cbar__status { display: none; }
  .dsh-cmdk { flex: 1 1 180px; width: auto; min-width: 0; }
}
@media (max-width: 640px) {
  .dsh-cmdk__key { display: none; }
  .dsh-console { min-height: clamp(300px, 46vh, 420px); }
  .dsh-lockup { max-width: 100%; }
}

/* ════ Zone headers — unified module chrome (replaces editorial bands) ════ */
.dsh-zone { display: flex; align-items: center; gap: 13px; margin: clamp(30px,3.4vw,46px) 0 18px; }
.dsh-zone__bar { width: 3px; height: 26px; border-radius: 2px; background: var(--c-amber); flex-shrink: 0; }
.dsh-zone__n { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-amber); letter-spacing: .24em; font-weight: 600; flex-shrink: 0; }
.dsh-zone__t { font-family: var(--f-display); font-style: italic; font-weight: 400; font-size: clamp(22px,2.5vw,30px); letter-spacing: -0.018em; color: var(--c-ink); line-height: 1; white-space: nowrap; }
.dsh-zone__s { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-ink-4); letter-spacing: .14em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.dsh-zone__sp { flex: 1; min-width: 8px; }
@media (max-width: 600px) { .dsh-zone__s, .dsh-zone__walk { display: none !important; } .dsh-zone { flex-wrap: wrap; row-gap: 10px; } }

/* Generic responsive grids */
.dsh-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(16px,2vw,24px); align-items: start; }
.dsh-g3 { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: clamp(18px,2.4vw,32px); align-items: start; }
@media (max-width: 940px) { .dsh-g3 { grid-template-columns: 1fr; gap: 32px; } }
@media (max-width: 760px) { .dsh-g2 { grid-template-columns: 1fr; } }

/* Now in the room */
.dsh-room { display: grid; grid-template-columns: minmax(0,1.9fr) minmax(360px,1fr); }
.dsh-room-below { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: clamp(16px,2vw,24px); align-items: start; margin-top: clamp(16px,2vw,24px); }
.dsh-room-below > * { min-width: 0; margin: 0 !important; height: auto !important; min-height: 0 !important; align-self: start; }
.dsh-room-below > :only-child { grid-column: 1 / -1; }
@media (max-width: 860px) { .dsh-room-below { grid-template-columns: 1fr; } }
@media (max-width: 1100px) {
  .dsh-room { grid-template-columns: 1fr; }
  .dsh-room > *:last-child { border-left: none !important; border-top: 1px solid var(--c-line); }
}

/* Format chooser */
.dsh-formats { display: grid; grid-template-columns: repeat(3,1fr); gap: clamp(14px, 1.6vw, 22px); }
@media (max-width: 840px) {
  .dsh-formats { grid-template-columns: 1fr; }
  .dsh-formats > button { min-height: 0 !important; }
}

/* Performance digest */
.dsh-perf-stats { display: grid; grid-template-columns: repeat(4,1fr); }
.dsh-perf-num { font-size: clamp(36px, 5vw, clamp(20px, 4vw, 56px)) !important; }
@media (max-width: 720px) { .dsh-perf-stats { grid-template-columns: repeat(2,1fr); row-gap: 26px; } }
.dsh-perf-charts { display: grid; grid-template-columns: 1.4fr 1fr; gap: 36px; }
@media (max-width: 780px) { .dsh-perf-charts { grid-template-columns: 1fr; gap: 30px; } }

/* The studio (crew + vault/site) */
.dsh-studio { display: grid; grid-template-columns: 1.35fr 1fr; gap: clamp(28px,4vw,56px); }
@media (max-width: 840px) { .dsh-studio { grid-template-columns: 1fr; } }

/* Ledger band head — denser inline header for the floor */
.dsh-band-head { display: flex; align-items: baseline; gap: 12px; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid var(--c-line); }
.dsh-band-head__n { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-amber); letter-spacing: .24em; font-weight: 600; white-space: nowrap; }
.dsh-band-head__s { font-family: var(--f-mono); font-size:var(--fs-label); color: var(--c-ink-4); letter-spacing: .14em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Studio hub — rail variant (compact stacked rows) */
.dsh-hub-rail { display: flex; flex-direction: column; }
.dsh-hub-rail__head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
.dsh-hub-rail__list { display: flex; flex-direction: column; gap: 8px; }
.dsh-hub-rail__row {
  display: grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 12px;
  padding: 11px 13px; border: 1px solid var(--c-line); border-radius: 9px;
  background: var(--c-panel); cursor: pointer; color: inherit; text-decoration: none;
  appearance: none; font: inherit; text-align: left; width: 100%;
  transition: border-color .16s ease, transform .16s ease;
}
.dsh-hub-rail__row:hover { border-color: var(--c-line-3); transform: translateX(2px); }

/* Chart reveal — draws charts in left-to-right on mount */
@keyframes dshReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
.dsh-chart-reveal { animation: dshReveal 1.05s cubic-bezier(.4,0,.2,1) both; }
.dsh-chart-card { cursor: pointer; transition: border-color .16s ease, transform .16s ease; }
.dsh-chart-card:hover { border-color: var(--c-line-3); transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) { .dsh-chart-reveal { animation: none; } }

/* Crew log — wired timeline */
.dsh-crew__row { display: grid; grid-template-columns: 30px minmax(0,1fr) auto; gap: 13px; align-items: start; padding: 11px 8px 11px 0; position: relative; border: none; background: none; width: 100%; text-align: left; cursor: pointer; border-radius: 8px; transition: background .14s ease; }
button.dsh-crew__row:hover { background: var(--c-panel-2); }
button.dsh-crew__row:hover .dsh-crew__go { opacity: 1; transform: none; }
.dsh-crew__go { position: absolute; right: 8px; bottom: 11px; opacity: 0; transform: translateX(-3px); transition: all .14s ease; color: var(--c-ink-4); }
.dsh-crew__rail { position: relative; display: flex; justify-content: center; }
.dsh-crew__rail::before { content: ""; position: absolute; top: 26px; bottom: -11px; width: 1px; background: var(--c-line); }
.dsh-crew__row:last-child .dsh-crew__rail::before { display: none; }
.dsh-crew__chip { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--c-line-2); background: var(--c-panel); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .04em; }

/* Equal-height On-air row */
.dsh-g2--stretch { align-items: stretch; }
.dsh-g2--stretch > * { min-width: 0; height: 100%; }

/* Sales desk — store / sell notifications */
.sdesk { border: 1px solid var(--c-line); border-radius: 14px; background: var(--c-panel); overflow: hidden; }
.sdesk__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--c-line); }
.sdesk__body { display: grid; grid-template-columns: 1.5fr 1fr; }
@media (max-width: 820px) { .sdesk__body { grid-template-columns: 1fr; } .sdesk__sum { border-left: none !important; border-top: 1px solid var(--c-line); } }
.sdesk__feed { padding: 6px 8px 10px; max-height: 312px; overflow-y: auto; }
.sdesk__row { display: grid; grid-template-columns: 34px minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 11px 12px; border-radius: 10px; transition: background .14s ease; cursor: pointer; }
.sdesk__row:hover { background: var(--c-panel-2); }
.sdesk__badge { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sdesk__amt { font-family: var(--f-mono); font-size:var(--fs-body); color: var(--c-good); font-weight: 600; white-space: nowrap; }
.sdesk__sum { border-left: 1px solid var(--c-line); padding: 20px 22px; display: flex; flex-direction: column; gap: 18px; }
@keyframes sdeskIn { from { opacity: 0; transform: translateY(-6px); background: rgba(var(--accent-rgb),.14); } to { opacity: 1; transform: none; } }
.sdesk__row--new { animation: sdeskIn .6s cubic-bezier(.2,.8,.2,1); }

/* ════ Dashboard shell — left sidebar menu + scrolling main ════ */
.dsh-shell { position: absolute; inset: 0; padding-top: 64px; display: flex; }
.dsh-side {
  width: 216px; flex-shrink: 0; display: flex; flex-direction: column;
  border-right: 1px solid var(--c-line); background: var(--c-panel);
  padding: 20px 12px 18px; overflow-y: auto;
}
.dsh-side__label { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .22em; color: var(--c-ink-4); text-transform: uppercase; padding: 0 10px; margin: 0 0 8px; }
.dsh-side__item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 8px 10px; border: none; border-radius: 0; background: transparent;
  color: var(--c-ink-2); font-size:var(--fs-body); font-family: var(--f-sans); font-weight: 500;
  text-align: left; cursor: pointer; text-decoration: none;
  transition: background .14s ease, color .14s ease;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dsh-side__item:hover { background: var(--c-panel-2); color: var(--c-ink); }
.dsh-side__item[data-active="true"] { background: rgba(var(--accent-rgb),.1); color: var(--c-amber); }
.dsh-side__n { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .12em; color: var(--c-ink-4); width: 20px; flex-shrink: 0; }
.dsh-side__item[data-active="true"] .dsh-side__n { color: var(--c-amber); }
.dsh-side__glyph {
  width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--f-mono); font-size:var(--fs-label); font-weight: 700;
}
.dsh-side__rule { height: 1px; background: var(--c-line); margin: 16px 10px; flex-shrink: 0; }
.dsh-main { flex: 1; min-width: 0; overflow-y: auto; position: relative; }
@media (max-width: 1080px) { .dsh-side { display: none; } }

/* The studio — site band on top, crew + wide vault below, equal heights */
.dsh-studio2 { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.7fr); gap: clamp(16px,1.8vw,24px); align-items: stretch; margin: clamp(16px,1.8vw,24px) 0 8px; }
.dsh-studio2__card { border: 1px solid var(--c-line); border-radius: 12px; background: var(--c-panel); padding: clamp(18px,1.8vw,24px); min-width: 0; display: flex; flex-direction: column; }
@media (max-width: 940px) { .dsh-studio2 { grid-template-columns: 1fr; } }

/* Sidebar extras */
.dsh-side__item { position: relative; }
.dsh-side__item[data-active="true"] { box-shadow: inset 2px 0 0 var(--c-amber); }

/* Vault card fills its studio column — no dead band above the footer */
.dsh-studio2__card .dsh-vault-grid { flex: 1; }
.dsh-studio2__card .dsh-vault-card { aspect-ratio: auto; height: 100%; min-height: 240px; }
.dsh-side__count { margin-left: auto; font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .08em; color: var(--c-ink-4); flex-shrink: 0; }
.dsh-side__livedot { margin-left: auto; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dsh-side__room {
  display: block; width: 100%; text-align: left; cursor: pointer;
  margin-top: 8px; padding: 12px 13px 11px; border: 1px solid var(--c-line);
  border-radius: 10px; background: var(--c-panel-2); color: inherit;
  transition: border-color .15s ease;
}
.dsh-side__room:hover { border-color: rgba(var(--accent-rgb),.55); }

/* Vault performer cards */
.dsh-vault-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
@media (max-width: 1240px) { .dsh-vault-grid { grid-template-columns: repeat(2, 1fr); } }
.dsh-vault-card { position: relative; aspect-ratio: 3/4; border-radius: 10px; overflow: hidden; border: 1px solid var(--c-line); cursor: pointer; background: var(--c-panel-2); transition: border-color .16s ease, transform .16s ease; display: block; padding: 0; text-align: left; }
.dsh-vault-card:hover { border-color: var(--c-line-3); transform: translateY(-3px); }
`;

// ─── Studio search — the ⌘K palette behind "Jump to a film, scene, or agent" ─
// Opens on the search pill, on ⌘K/Ctrl-K, or the cina:studio-search event.
// Searches the slate (films + their scenes), the AI crew (agents), and every
// studio destination, then routes you there. This is what the box always
// should have done — it used to just open "new project".
const STUDIO_DESTS = [
  { kind: "go", label: "Director", view: "chat",     hint: "Talk to the film" },
  { kind: "go", label: "Pipeline", view: "pipeline", hint: "Shot queue & renders" },
  { kind: "go", label: "Script",   view: "script",   hint: "Screenplay" },
  { kind: "go", label: "Board",    view: "board",    hint: "Storyboard" },
  { kind: "go", label: "Generate", view: "gen",      hint: "Render shots" },
  { kind: "go", label: "Editor",   view: "edit",     hint: "Cut the film" },
  { kind: "go", label: "Vault",    view: "vault",    hint: "Performers", route: "studio" },
  { kind: "go", label: "Mint",     view: "mint",     hint: "Producer passes" },
  { kind: "go", label: "Analytics", route: "analytics", hint: "Views, money, audience" },
  { kind: "go", label: "Promotion", route: "promo",    hint: "Spend & pitch night" },
];
const STUDIO_AGENTS = [
  { id: "writer",   label: "Writer",   view: "script", hint: "Script & story" },
  { id: "director", label: "Director", view: "chat",   hint: "Creative lead" },
  { id: "visual",   label: "Visual",   view: "gen",    hint: "Look & shots" },
  { id: "editor",   label: "Editor",   view: "edit",   hint: "The cut" },
  { id: "audio",    label: "Audio",    view: "audio",  hint: "Score & sound" },
];
function StudioSearch({ onOpenFilm }) {
  const [open, setOpen] = useStateD(false);
  const [q, setQ] = useStateD("");
  const [sel, setSel] = useStateD(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const openIt = () => setOpen(true);
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setOpen(o => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("cina:studio-search", openIt);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("cina:studio-search", openIt); window.removeEventListener("keydown", key); };
  }, []);
  React.useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const films = window.PROJECTS || [];
  const ql = q.trim().toLowerCase();
  const results = React.useMemo(() => {
    const out = [];
    // Films + a couple of scene hits per film
    films.forEach(f => {
      const t = (f.title || "").toLowerCase();
      if (!ql || t.includes(ql) || (f.creator || "").toLowerCase().includes(ql) || (f.logline || "").toLowerCase().includes(ql)) {
        out.push({ type: "Film", id: f.id, label: f.title, hint: (f.status || "film") + (f.creator ? " · " + f.creator : ""), film: f, view: "chat", thumb: f.thumb });
      }
    });
    // Scenes (only when typing) — synthesize a believable scene reference
    if (ql.length >= 2) {
      films.filter(f => f.status === "in production" || f.published).slice(0, 4).forEach(f => {
        ["Opening", "The turn", "Climax"].forEach((sc, i) => {
          if (sc.toLowerCase().includes(ql) || (f.title || "").toLowerCase().includes(ql)) {
            out.push({ type: "Scene", id: f.id + "-sc" + i, label: `${f.title} · ${sc}`, hint: "Open in editor", film: f, view: "edit", thumb: f.thumb });
          }
        });
      });
    }
    STUDIO_AGENTS.forEach(a => {
      if (!ql || a.label.toLowerCase().includes(ql) || a.hint.toLowerCase().includes(ql))
        out.push({ type: "Agent", id: "ag-" + a.id, label: a.label + " agent", hint: a.hint, view: a.view });
    });
    STUDIO_DESTS.forEach(d => {
      if (!ql || d.label.toLowerCase().includes(ql) || (d.hint || "").toLowerCase().includes(ql))
        out.push({ type: "Go to", id: "go-" + d.label, label: d.label, hint: d.hint, view: d.view, route: d.route });
    });
    return out.slice(0, 20);
  }, [ql, films]);

  React.useEffect(() => { if (sel >= results.length) setSel(0); }, [results.length]);

  const run = (r) => {
    setOpen(false);
    if (!r) return;
    if (r.film) { onOpenFilm && onOpenFilm(r.film, r.view || "chat"); return; }
    if (r.route && r.route !== "studio") { window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: r.route })); return; }
    if (r.view) {
      const active = (window.PROJECTS || [])[0];
      onOpenFilm && onOpenFilm(active, r.view);
    }
  };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    if (e.key === "Enter")     { e.preventDefault(); run(results[sel]); }
  };

  if (!open) return null;
  const TYPE_TINT = { Film: "var(--c-amber)", Scene: tkc("cat-1"), Agent: "var(--c-good)", "Go to": "var(--c-ink-3)" };
  return (
    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(6,6,8,.72)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(620px, 92vw)", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--c-line)" }}>
          <Icon name="search" size={16}/>
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey}
            placeholder="Jump to a film, scene, or agent…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--c-ink)", fontSize: "var(--fs-lead)", fontFamily: "inherit" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "3px 7px" }}>ESC</span>
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", padding: 8 }}>
          {results.length === 0 && (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>No matches for “{q}”.</div>
          )}
          {results.map((r, i) => (
            <button key={r.id} onMouseEnter={() => setSel(i)} onClick={() => run(r)} style={{
              display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 12, alignItems: "center", width: "100%",
              padding: "10px 12px", borderRadius: "var(--r-2)", border: "none", cursor: "pointer", textAlign: "left",
              background: i === sel ? "var(--c-panel-2)" : "transparent",
            }}>
              <span style={{ width: 40, height: 28, borderRadius: "var(--r-2)", overflow: "hidden", background: r.film?.color || "var(--c-panel-3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {r.thumb && window.FrameThumb ? <FrameThumb kind={r.thumb} usePhoto/> :
                  <span style={{ color: TYPE_TINT[r.type], fontSize: "var(--fs-body)" }}>{r.type === "Agent" ? "◐" : r.type === "Go to" ? "→" : "▸"}</span>}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{r.hint}</span>
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: TYPE_TINT[r.type], textTransform: "uppercase" }}>{r.type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar menu — section nav + studio surfaces + quick actions ─────────
function SlateSideNav({ zones, scrollRef, inProduction, onNewFilm, onOpenFilm, onOpenSite, onOpenVault, onOpenPromo, onOpenAnalytics }) {
  const [active, setActive] = useStateD(zones[0] && zones[0].n);

  React.useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onScroll = () => {
      const top = sc.getBoundingClientRect().top;
      let cur = zones[0] && zones[0].n;
      sc.querySelectorAll('[id^="dsh-zone-"]').forEach(el => {
        if (el.getBoundingClientRect().top - top <= 110) cur = el.id.replace("dsh-zone-", "");
      });
      setActive(cur);
    };
    onScroll();
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, [zones.length]);

  const jump = (n) => {
    const sc = scrollRef.current;
    const el = sc && sc.querySelector("#dsh-zone-" + n);
    if (!sc) return;
    if (n === "top" || !el) { sc.scrollTo({ top: 0, behavior: "smooth" }); return; }
    sc.scrollTo({ top: el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 14, behavior: "smooth" });
  };

  const glyph = (g, accent) => (
    <span className="dsh-side__glyph" style={{ background: `color-mix(in oklch, ${accent} 16%, transparent)`, color: accent }}>{g}</span>
  );
  const sd = studioSiteData();
  const surfaces = [
    { g: "▤", accent: tkc("amber"), label: "Page builder", href: "index.html#/build/voss", count: sd.sections || null },
    { g: "◍", accent: "var(--c-good)",  label: "Public site",  onClick: onOpenSite, live: sd.published },
  ];
  const studio = [
    { g: "◐", accent: "var(--c-ink-3)", label: "Vault",     onClick: onOpenVault },
    { g: "◎", accent: "var(--c-ink-3)", label: "Promotion", onClick: onOpenPromo },
    { g: "∿", accent: "var(--c-ink-3)", label: "Analytics", onClick: onOpenAnalytics },
  ];

  return (
    <aside className="dsh-side">
      <div className="dsh-side__label">Overview</div>
      {zones.map(z => (
        <button key={z.n} className="dsh-side__item" data-active={active === z.n ? "true" : "false"} onClick={() => jump(z.n)}>
          <span className="dsh-side__n">{z.n}</span>{z.t}
        </button>
      ))}

      <div className="dsh-side__rule"></div>
      <div className="dsh-side__label">Surfaces</div>
      {surfaces.map(s => {
        const trail = s.live
          ? <span className="dsh-side__livedot" style={{ background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}></span>
          : s.count != null ? <span className="dsh-side__count">{s.count}</span> : null;
        return s.href
          ? <a key={s.label} href={s.href} className="dsh-side__item">{glyph(s.g, s.accent)}{s.label}{trail}</a>
          : <button key={s.label} onClick={s.onClick} className="dsh-side__item">{glyph(s.g, s.accent)}{s.label}{trail}</button>;
      })}

      <div className="dsh-side__rule"></div>
      <div className="dsh-side__label">Studio</div>
      {studio.map(s => (
        <button key={s.label} onClick={s.onClick} className="dsh-side__item">{glyph(s.g, s.accent)}{s.label}</button>
      ))}

      <div style={{ flex: 1, minHeight: 18 }}></div>
      {inProduction && (
        <button className="dsh-side__room" onClick={() => onOpenFilm(inProduction, "chat")} title={"Resume " + inProduction.title}>
          <span className="t-mono" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 7 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 6px var(--c-amber)" }}></span>
            In the room
          </span>
          <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em", lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inProduction.title}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
            <span style={{ flex: 1, height: 3, borderRadius: "var(--r-1)", background: "var(--c-line)", overflow: "hidden" }}>
              <span style={{ display: "block", width: `${Math.round((inProduction.progress || 0) * 100)}%`, height: "100%", background: "var(--c-amber)" }}></span>
            </span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{Math.round((inProduction.progress || 0) * 100)}%</span>
          </span>
        </button>
      )}
      <button className="btn btn-primary" onClick={() => onNewFilm("movie")} style={{ height: 36, justifyContent: "center", fontSize: "var(--fs-body)", marginTop: 10 }}>+ New film</button>
    </aside>
  );
}

function Dashboard({ activeFilmId, onOpenFilm, onNewFilm, onOpenVault, onOpenSite, onOpenPromo, onOpenAnalytics }) {
  const [query, setQuery] = useStateD("");
  const [slateTab, setSlateTab] = useStateD("overview");
  const [nightSubmitOpen, setNightSubmitOpen] = useStateD(false);
  const [homeWalk, setHomeWalk] = useStateD(false);
  const closeHomeWalk = () => { setHomeWalk(false); try { localStorage.setItem("cina:home-walk-seen", "1"); } catch {} };
  const films = window.PROJECTS || [];

  const inProduction = (activeFilmId && films.find(f => f.id === activeFilmId)) || films.find(f => f.status === "in production") || films[0];
  const published    = films.filter(f => f.published);
  const featured     = published[0]; // LAST LIGHT

  const scrollRef = React.useRef(null);

  const Head = ({ title, sub, action }) => (
    <div className="dsh-zone" style={{ marginTop: 18, marginBottom: 14 }}>
      <span className="dsh-zone__bar"></span>
      <span className="dsh-zone__t">{title}</span>
      {sub && <span className="dsh-zone__s">· {sub}</span>}
      <span className="dsh-zone__sp"></span>
      {action}
    </div>
  );
  const DeskHead = ({ title, sub, action }) => <Head title={title} sub={sub} action={action}/>;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "catalog",  label: "Catalog", count: films.length },
    { id: "revenue",  label: "Revenue & Audience" },
    { id: "surfaces", label: "Surfaces & Crew" },
  ];

  const surfaceLinks = [
    { id: "site",      label: "Site Builder", hint: "Public page & store", fn: onOpenSite,      icon: "globe" },
    { id: "vault",     label: "Cast Vault",   hint: "Performers & minds",  fn: onOpenVault,     icon: "actor" },
    { id: "promo",     label: "Promotion",    hint: "Spend & pitch night", fn: onOpenPromo,     icon: "spark" },
    { id: "analytics", label: "Analytics",    hint: "Box office & watch",  fn: onOpenAnalytics, icon: "trend" },
  ].filter(s => typeof s.fn === "function");

  return (
    <div data-screen-label="Studio · Home" className="dsh-shell">
      <style>{DASH_CSS}</style>
      <StudioSearch onOpenFilm={onOpenFilm}/>
      <div className="dsh-main" ref={scrollRef}>
        <div className="dsh-wrap">
          <header className="dsh-head" data-tour-region="header">
            <div className="dsh-head__left">
              <span className="dsh-head__eyebrow">CINA STUDIO · SLATE · {films.length} PROJECTS</span>
              <h1 className="t-display" style={{ margin: 0, fontStyle: "italic", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>Your studio.</h1>
            </div>
            <div className="dsh-head__actions">
              <label className="dsh-searchbox" aria-label="Filter projects">
                <Icon name="search" size={13}/>
                <input
                  value={query}
                  onChange={e => {
                    const val = e.target.value;
                    setQuery(val);
                    if (val.trim() && slateTab !== "catalog") setSlateTab("catalog");
                  }}
                  placeholder="Filter slate…"
                />
                {query && (
                  <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "var(--c-ink-4)", cursor: "pointer", padding: 0, fontSize: "var(--fs-label)" }} aria-label="Clear filter">×</button>
                )}
              </label>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("cina:studio-search"))}
                className="dsh-act-btn"
                title="Command palette (⌘K)"
              >
                ⌘K
              </button>
              <button
                onClick={() => setHomeWalk(true)}
                className="dsh-act-btn"
                title="Studio walkthrough"
              >
                <Icon name="book" size={12}/> Walkthrough
              </button>
              <button
                onClick={() => onNewFilm()}
                className="dsh-act-btn dsh-act-btn--primary"
              >
                <Icon name="plus" size={13}/> New film
              </button>
            </div>
          </header>

          <nav className="dsh-tabs" role="tablist" aria-label="Slate workspace sections">
            {tabs.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={slateTab === t.id}
                className="dsh-tab"
                onClick={() => setSlateTab(t.id)}
              >
                <span>{t.label}</span>
                {t.count != null && <span className="dsh-tab__cnt">{t.count}</span>}
              </button>
            ))}
          </nav>

          {slateTab === "overview" && (
            <div>
              <div className="dsh-overview-grid">
                <div data-tour-region="room" style={{ minWidth: 0 }}>
                  <Head title="In the room" sub={inProduction ? inProduction.title : "Building now"}/>
                  <NowInTheRoom film={inProduction} onOpenFilm={onOpenFilm}/>
                </div>
                <div data-tour-region="desk" className="dsh-overview-desk">
                  {window.CockpitSection && <window.CockpitSection onOpenFilm={onOpenFilm} ZoneHead={DeskHead} compact activeFilmId={inProduction && inProduction.id}/>}
                </div>
              </div>
              <div className="dsh-room-below" style={{ marginTop: 22 }}>
                <NowLiveOnWatch/>
                {window.AutopilotBoard && <AutopilotBoard/>}
              </div>
            </div>
          )}

          {slateTab === "catalog" && (
            <div data-tour-region="slate">
              <Head title="The slate" sub={`${films.length} projects`}/>
              <StudioSlate films={films} query={query} activeFilmId={activeFilmId} onOpenFilm={onOpenFilm} onNewFilm={onNewFilm}/>
              <Head title="Start a new format" sub="Film · Series · Branched"/>
              <FormatChooser onNewFilm={onNewFilm}/>
            </div>
          )}

          {slateTab === "revenue" && (
            <div data-tour-region="studio">
              <Head title="Earnings & reception" sub="Box office, passes and tips" action={onOpenAnalytics ? <button onClick={onOpenAnalytics} className="dsh-act-btn">Full analytics <Icon name="chev-r" size={11}/></button> : null}/>
              <SalesDesk onOpenFilm={onOpenFilm} onOpenAnalytics={onOpenAnalytics}/>
              {featured && (
                <div style={{ marginTop: 22 }}>
                  <PerformanceDigest film={featured} onOpenAnalytics={onOpenAnalytics}/>
                </div>
              )}
            </div>
          )}

          {slateTab === "surfaces" && (
            <div data-tour-region="surfaces">
              <Head title="Public surfaces & pitch night" sub="External presence & distribution"
                action={window.SubmitToNightModal && window.PromoBridge ? (
                  <button onClick={() => setNightSubmitOpen(true)} className="dsh-act-btn dsh-act-btn--primary">
                    Submit to Pitch Night →
                  </button>
                ) : null}
              />
              <SiteStatusCard onOpenSite={onOpenSite}/>

              {surfaceLinks.length > 0 && (
                <div className="dsh-surface-strip">
                  {surfaceLinks.map(s => (
                    <button key={s.id} className="dsh-surface-card" onClick={s.fn}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <Icon name={s.icon} size={15}/>
                        <div style={{ minWidth: 0 }}>
                          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--c-ink)" }}>{s.label}</div>
                          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>{s.hint}</div>
                        </div>
                      </div>
                      <span className="t-mono" style={{ color: "var(--c-amber)", fontSize: "var(--fs-label)" }}>→</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="dsh-studio2" style={{ marginTop: 22 }}>
                <div className="dsh-studio2__card" style={{ borderRadius: 0 }}>
                  <CrewLog onOpenFilm={onOpenFilm}/>
                </div>
                <div className="dsh-studio2__card" style={{ borderRadius: 0 }}>
                  <VaultTeaser onOpen={onOpenVault}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {nightSubmitOpen && window.SubmitToNightModal && window.PromoBridge && (
        <SubmitToNightModal bridge={PromoBridge} onClose={() => setNightSubmitOpen(false)}/>
      )}
      {homeWalk && <StudioHomeWalkthrough onClose={closeHomeWalk}/>}
    </div>
  );
}

// ─── Studio home walkthrough — orient a new director ─────────────────────
function StudioHomeWalkthrough({ onClose }) {
  const steps = [
  { region: "header", title: "This is your studio, at a glance.", body: "The masthead shows the film currently in the room, your greeting, and — top right — your credit balance and crew. Everything below flows top to bottom: what needs you, then the work, then the world." },
  { region: "desk", title: "On your desk — decisions waiting.", body: "Live approvals, earnings, and the calls only you can make. Clear these first; Cina handles the rest and logs everything it touches." },
  { region: "room", title: "In the room — building right now.", body: "The film in active production, its render feed and progress. This is where the day's work actually moves." },
  { region: "slate", title: "The slate — every project.", body: "Your whole catalog as a working list: status, progress, and one click into any film's chat, board or cut." },
  { region: "studio", title: "The studio around the work.", body: "Your public site, crew and vault live at the bottom. Publish a site, license talent, and see how films are playing — all from here." },
];
  return <CinaTour id="studio-home" steps={steps.map(s => ({ target: s.region && s.region !== "all" ? `[data-tour-region="${s.region}"]` : null, title: s.title, body: s.body }))} onDone={onClose}/>;
}

// ─── Site status — the public site, managed from the Site tab ──────────
function SiteStatusCard({ onOpenSite }) {
  let page = null, published = false;
  try {
    const all = JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}");
    if (all.voss) { page = all.voss; published = true; }
  } catch {}
  const sections = (page && page.sections || []).length;
  const inMenu = (page && page.sections || []).filter(s => s.inMenu).length;
  return (
    <div style={{
      border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)",
      padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
    }}>
      <div style={{ flex: "1 1 380px", minWidth: 0 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: published ? "var(--c-good)" : "var(--c-amber)", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: published ? "var(--c-good)" : "var(--c-amber)", boxShadow: published ? "0 0 7px var(--c-good)" : "none" }}></span>
          {published ? "SITE LIVE · VOSS.CINA" : "SITE DRAFT · VOSS.CINA"}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>Your public site.</span>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
            {published
              ? `${sections} sections · ${inMenu} in the menu · store & notebook editable from the Site tab.`
              : "Sections, menu, store, notebook, logo — manage it all from the Site tab."}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={onOpenSite} className="btn btn-primary" style={{ height: 34, padding: "0 16px", fontSize: "var(--fs-body)" }}>Site settings →</button>
        <a href="index.html#/creator/voss" className="btn" style={{ height: 34, padding: "0 16px", fontSize: "var(--fs-body)", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View live</a>
      </div>
    </div>
  );
}

// ─── Now live on Watch — the payoff for shipping ─────────────────────────
// A film mastered in Studio and published lands on Watch for real. This strip
// is its homecoming: it closes the loop the director just completed, with the
// film's first views + royalties and a real deep link to the live page.
function NowLiveOnWatch() {
  const [, force] = useStateD(0);
  const fromPublish = (window.cinaPublishedFilms ? window.cinaPublishedFilms() : []).filter(f => f && (!f.distribution || f.distribution.watch !== false));
  const published = fromPublish.length ? fromPublish
    : (window.PROJECTS || []).filter(p => p && (p.published || p.status === "released")).map(p => ({ ...p, thumb: p.thumb || ({ p1: "darkroom-est", p2: "darkroom-wide", p3: "phone", p5: "the-photo" })[p.id], publishedAt: p.publishedAt || (Date.now() - 6 * 3600000) }));
  // Gentle live tick so the numbers feel alive on this session.
  React.useEffect(() => {
    if (!published.length) return;
    const t = setInterval(() => force(n => n + 1), 4000);
    return () => clearInterval(t);
  }, [published.length]);
  if (!published.length) return (
    <div style={{ height: "100%", boxSizing: "border-box", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-3)", padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 10, background: "var(--c-panel)" }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, color: "var(--c-ink-3)" }}>LIVE ON WATCH</span>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>Nothing showing yet.</div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, maxWidth: 380 }}>Publish a cut and it lands here with live views, finish rate and royalties.</div>
    </div>
  );

  const f = published[0];
  const mins = Math.max(1, Math.round((Date.now() - (f.publishedAt || Date.now())) / 60000));
  // Seeded early traction: a believable curve off minutes-live.
  const views = Math.round(8 + mins * 2.4 + (Date.now() / 4000 % 7));
  const finishRate = Math.min(0.74, 0.42 + mins * 0.004);
  const royalty = (views * 0.021).toFixed(2);
  const href = window.cinaWatchHref ? window.cinaWatchHref(f.id) : "index.html#/film/" + f.id;

  return (
    <a href={href} title={"Open " + f.title + " on Watch"} style={{
      display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", textDecoration: "none", color: "inherit",
      border: "1px solid rgba(106,163,122,.34)", borderRadius: "var(--r-3)", overflow: "hidden",
      background: "var(--c-panel)",
    }}>
      {/* Still — full-bleed with overlay chrome */}
      <div style={{ position: "relative", flex: 1, minHeight: 170, background: f.color || tkc("cat-6") }}>
        {window.FrameThumb ? <FrameThumb kind={f.thumb} usePhoto/> : null}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.92) 0%, rgba(8,8,10,.25) 45%, rgba(8,8,10,.35) 100%)" }}></div>
        <span className="t-mono" style={{
          position: "absolute", top: 12, left: 12,
          display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 10px",
          background: "rgba(8,8,10,.6)", backdropFilter: "blur(6px)",
          border: "1px solid rgba(106,163,122,.5)", borderRadius: 999,
          fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", fontWeight: 700,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)", animation: "nirPulse 1.6s ease-in-out infinite" }}></span>
          LIVE ON WATCH
        </span>
        <div style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), letterSpacing: "-0.01em", lineHeight: 1.05, textShadow: "0 1px 14px rgba(0,0,0,.7)" }}>
            {f.title} is showing.
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.72)", marginTop: 4 }}>
            Published {mins < 60 ? `${mins} min` : `${Math.round(mins/60)}h`} ago · leading your front page
          </div>
        </div>
      </div>

      {/* Live stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[["VIEWS", views.toLocaleString()], ["FINISH", Math.round(finishRate * 100) + "%"], ["ROYALTIES", "$" + royalty]].map(([k, v], i) => (
          <div key={k} style={{ padding: "12px 16px 13px", borderLeft: i ? "1px solid var(--c-line)" : "none", display: "flex", flexDirection: "column", gap: 3 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{k}</span>
            <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: i === 2 ? "var(--c-good)" : "var(--c-ink)", letterSpacing: "-0.01em", lineHeight: 1 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="t-mono" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderTop: "1px solid var(--c-line)",
        background: "linear-gradient(90deg, rgba(106,163,122,.08), transparent 70%)",
        fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", fontWeight: 700,
      }}>
        VIEW LIVE PAGE
        <span aria-hidden="true">→</span>
      </div>
    </a>
  );
}

// ─── Format chooser — the three things you can make ──────────────────────
// The first decision: Film, Series, or Branch. Each opens the new-work flow
// pre-set to that format, whose studio workflow is tuned for it.
function FormatIcon({ kind, color }) {
  const common = { width: 40, height: 40, viewBox: "0 0 48 48", fill: "none", stroke: color, strokeWidth: 1.4 };
  if (kind === "series") return (
    <svg {...common}>
      <rect x="6" y="10" width="14" height="12" rx="1.5"/><rect x="24" y="10" width="14" height="12" rx="1.5"/>
      <rect x="6" y="26" width="14" height="12" rx="1.5"/><rect x="24" y="26" width="14" height="12" rx="1.5"/>
    </svg>
  );
  if (kind === "branched") return (
    <svg {...common}>
      <path d="M24 8 L24 18"/><path d="M24 18 L10 26 L10 40"/><path d="M24 18 L24 40"/><path d="M24 18 L38 26 L38 40"/>
      <circle cx="24" cy="8" r="2.5" fill={color}/><circle cx="24" cy="18" r="2.5"/>
      <circle cx="10" cy="40" r="2.5"/><circle cx="24" cy="40" r="2.5"/><circle cx="38" cy="40" r="2.5"/>
    </svg>
  );
  return (
    <svg {...common}>
      <rect x="6" y="11" width="36" height="26" rx="2"/>
      <line x1="6" y1="16" x2="42" y2="16"/><line x1="6" y1="32" x2="42" y2="32"/>
      <line x1="14" y1="11" x2="14" y2="16"/><line x1="22" y1="11" x2="22" y2="16"/><line x1="30" y1="11" x2="30" y2="16"/><line x1="38" y1="11" x2="38" y2="16"/>
      <line x1="14" y1="32" x2="14" y2="37"/><line x1="22" y1="32" x2="22" y2="37"/><line x1="30" y1="32" x2="30" y2="37"/><line x1="38" y1="32" x2="38" y2="37"/>
    </svg>
  );
}

function FormatChooser({ onNewFilm }) {
  const formats = window.CINA_FORMATS;
  const colors = window.FORMAT_COLORS || { movie: tkc("ink-3"), series: tkc("cat-1"), branched: "var(--c-amber)" };
  const order = ["movie", "series", "branched"];
  const counts = (window.PROJECTS || []).reduce((a, p) => { a[p.kind] = (a[p.kind] || 0) + 1; return a; }, {});

  return (
    <section style={{ marginBottom: 8 }}>
      <div className="dsh-formats">
        {order.map(k => {
          const f = formats[k];
          const color = colors[k];
          const featured = k === "branched";
          return (
            <button key={k} onClick={() => onNewFilm(k)} style={{
              appearance: "none", cursor: "pointer", textAlign: "left",
              background: featured ? "linear-gradient(160deg, rgba(var(--accent-rgb),.06), var(--c-panel) 70%)" : "var(--c-panel)",
              border: `1px solid ${featured ? "rgba(var(--accent-rgb),.35)" : "var(--c-line)"}`,
              borderRadius: "var(--r-2)", padding: "20px 20px 18px",
              color: "var(--c-ink)", display: "flex", flexDirection: "column", gap: 12,
              transition: "transform .12s ease, border-color .14s ease",
              minHeight: 248,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color === "var(--c-amber)" ? "var(--c-amber)" : color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = featured ? "rgba(var(--accent-rgb),.35)" : "var(--c-line)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <FormatIcon kind={k} color={color}/>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", paddingTop: 4 }}>
                  {counts[k] || 0} ON SLATE
                </span>
              </div>
              <div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, color, lineHeight: 1, letterSpacing: "-0.01em" }}>{f.label}</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 6 }}>{f.tagline}</div>
              </div>
              <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>{f.blurb}</p>

              {/* Workflow steps — what makes this format efficient */}
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--c-line)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Workflow</div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                  {f.flow.map((step, i) => (
                    <React.Fragment key={step}>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em" }}>{step}</span>
                      {i < f.flow.length - 1 && <span style={{ color: color, fontSize: "var(--fs-label)", opacity: .6 }}>›</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{
                marginTop: 4, padding: "10px 14px",
                background: featured ? "var(--c-amber)" : "var(--c-panel-2)",
                color: featured ? tkc("on-amber") : "var(--c-ink)",
                borderRadius: "var(--r-2)", textAlign: "center",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                letterSpacing: ".16em", textTransform: "uppercase",
              }}>
                Start {f.label} →
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Command hero — greeting, the night's first move, and a live pulse ────
// Replaces the lonely 64px headline + floating button. The left column gives
// the editorial greeting and the two actions that actually start work (new
// film · resume what's in production). The right column is a live "Studio
// Pulse" rail — four real numbers off the slate so the home feels alive and
// tells you where things stand the instant it loads.
function HeroCommand({ films, inProduction, onNewFilm, onOpenFilm }) {
  // Live clock — greeting, date and time stay current without a reload.
  const [now, setNow] = useStateD(() => new Date());
  React.useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  // Cina ID — greet the director by name; re-renders when they edit their profile.
  const cinaId = window.useCinaId ? window.useCinaId() : (window.CINA || {});
  const firstBit = ((cinaId.handle || "").split("@")[0].split(/[._\-\s]/)[0] || "");
  const who = firstBit && !/^(you|user|me|guest|anon)$/i.test(firstBit)
    ? firstBit.charAt(0).toUpperCase() + firstBit.slice(1)
    : "director";
  // A long handle (a studio slug, say) would push the 92px headline off the
  // hero — step the type down rather than let it collide with the edge.
  const nameLen = (greeting + who).length;
  const titleSize = nameLen > 26 ? "clamp(30px, 4vw, 58px)"
                  : nameLen > 20 ? "clamp(34px, 5vw, 72px)"
                  : undefined;

  const inProd = films.filter(f => f.status === "in production" || f.status === "storyboard").length;
  const drafts = films.filter(f => f.status === "draft" || f.status === "script").length;
  const pubFilms = films.filter(f => f.published);
  const totalViews = pubFilms.reduce((a, f) => a + (f.views || 0), 0);
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const hr = now.getHours();
  const greeting = hr < 5 ? "Still up" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";

  const pulse = [
    { k: "In motion",   v: String(inProd),       sub: "in production", tint: "var(--c-amber)" },
    { k: "On the desk", v: String(drafts),       sub: "drafts & scripts", tint: "var(--c-ink-2)" },
    { k: "Published",   v: String(pubFilms.length), sub: "live on Watch", tint: "var(--c-good)" },
    { k: "Total views", v: fmt(totalViews),      sub: "all-time", tint: "var(--c-ink-2)" },
  ];

  // The film in the room drives the masthead still + lockup.
  const room = inProduction;
  const roomPct = Math.round((room && room.progress || 0) * 100);
  const thumbKind = room ? (room.id === "p1" ? "darkroom-est" : room.id === "p2" ? "darkroom-wide" : room.id === "p3" ? "phone" : room.thumb) : null;
  const stageLabel = room ? (room.status || "in production") : "";
  // Live agent count from the activity log → "the room is staffed".
  const agents = Array.from(new Set((window.ACTIVITY || []).slice(0, 6).map(a => a.agent))).length || 4;

  return (
    <header className="dsh-console">
      {/* Background — still from the film in the room */}
      <div className="dsh-console__bg">
        {thumbKind && window.FrameThumb
          ? <FrameThumb kind={thumbKind} usePhoto/>
          : <div style={{ background: (room && room.cover) || tkc("panel") }}></div>}
      </div>
      <div className="dsh-console__grain"></div>

      <div className="dsh-console__inner">
        {/* Command bar */}
        <div className="dsh-cbar">
          <div className="dsh-cbar__mark">
            <span className="dsh-cbar__dot"></span>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", letterSpacing: "-0.01em", color: "var(--c-ink)" }}>Studio</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{dateStr} · {timeStr}</span>
          </div>
          <span style={{ flex: 1 }}></span>
        </div>

        {/* Title lockup */}
        <div className="dsh-lockup">
          {room && (
            <div className="t-mono" style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 7px var(--c-amber)" }}></span>
              On the floor · {room.code} · {stageLabel}
            </div>
          )}
          <h1 className="dsh-lockup__title" style={titleSize ? { fontSize: titleSize } : undefined}>{greeting}, {who}.</h1>
          {room && (
            <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.78)", marginTop: 12, textShadow: "0 1px 12px rgba(0,0,0,.6)" }}>
              <span className="t-display" style={{ fontStyle: "italic", color: tkc("white") }}>{room.title}</span>
              {` is in the room — ${room.completed}/${room.shots} shots, ${roomPct}% through ${room.stage}.`}
            </div>
          )}
          {room && (
            <div className="dsh-lockup__bar">
              <div style={{ width: `${roomPct}%`, height: "100%", background: "var(--c-amber)" }}></div>
            </div>
          )}
          <div className="dsh-lockup__actions">
            {room && (
              <button className="btn btn-primary" onClick={() => onOpenFilm(room, "chat")} style={{ height: 38, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8 }}>
                <Icon name="play" size={12}/> Resume {room.title}
              </button>
            )}
            <button className="btn" onClick={() => onNewFilm("movie")} style={{ height: 38, padding: "0 16px", fontSize: "var(--fs-body)", background: "rgba(12,12,15,.55)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,.18)" }}>
              + New film
            </button>
          </div>
        </div>

        {/* Instrument ribbon */}
        <div className="dsh-ribbon">
          {pulse.map((p) => (
            <div key={p.k} className="dsh-ribbon__cell">
              <span className="dsh-ribbon__k">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.tint }}></span>{p.k}
              </span>
              <span className="dsh-ribbon__v" style={{ color: p.tint }}>{p.v}</span>
              <span className="dsh-ribbon__s">{p.sub}</span>
            </div>
          ))}
          <div className="dsh-ribbon__cell">
            <span className="dsh-ribbon__k"><span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)" }}></span>Agents</span>
            <span className="dsh-ribbon__v" style={{ color: "var(--c-good)" }}>{agents}</span>
            <span className="dsh-ribbon__s">online now</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Now in the Room — featured in-production banner ─────────────────────
// Big editorial photo left, live status column right. Anchors the page on
// what the studio is *doing* right now, rather than a generic dashboard KPI.
function NowInTheRoom({ film, onOpenFilm }) {
  if (!film) return null;
  const go = (view) => onOpenFilm(film, view);
  const onOpen = () => go("chat");
  const isLL = film.id === "p1";
  const thumbKind = isLL ? "darkroom-est" : film.id === "p2" ? "darkroom-wide" : film.id === "p3" ? "phone" : null;

  // Live render mini-feed — pulled from the studio activity log, tied to the
  // film in the room. The lead item carries this film's current progress.
  const feed = (window.ACTIVITY || []).slice(0, 3);
  const renderTicks = feed.length ? feed.map((a, i) => ({
    agent: a.agent,
    text: (a.text || "").replace(/\s*✓\s*$/, ""),
    pct: i === 0 ? Math.round((film.progress || 0) * 100) : null,
  })) : [
    { agent: "visual",   text: "14E · POV · v3 · Veo-3",         pct: 62 },
    { agent: "editor",   text: "QC pass on 14D",                  pct: null },
    { agent: "audio",    text: "Score sketch v2 · 62 BPM",        pct: null },
  ];

  return (
    <section className="dsh-room" style={{
      marginBottom: 0,
      gap: 0,
      border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)", overflow: "hidden",
      background: "var(--c-panel)",
    }}>
      {/* Left — photo with overlay chrome */}
      <button
        onClick={onOpen}
        style={{
          position: "relative",
          minHeight: "clamp(280px, 52vw, 460px)", height: "100%",
          background: film.cover,
          border: "none", padding: 0,
          cursor: "pointer", overflow: "hidden",
          textAlign: "left", color: "inherit",
        }}
      >
        {thumbKind && (
          <div style={{ position: "absolute", inset: 0 }}>
            <FrameThumb kind={thumbKind} usePhoto/>
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.15) 50%, rgba(0,0,0,.7) 100%)",
        }}/>
        {/* Top-left running tag */}
        <div style={{
          position: "absolute", top: 18, left: 22,
          display: "flex", alignItems: "center", gap: 10,
          padding: "6px 12px",
          background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(var(--accent-rgb),.5)", borderRadius: "var(--r-1)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700,
          textTransform: "uppercase",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background:  "var(--c-amber)",
            animation: "nirPulse 1.4s ease-in-out infinite",
          }}/>
          ON THE FLOOR · {film.code}
        </div>
        <style>{`@keyframes nirPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }`}</style>

        {/* Bottom-left scene title */}
        <div style={{
          position: "absolute", left: 24, bottom: 22, right: 24,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div className="t-mono" style={{
            fontSize: "var(--fs-label)", color: "rgba(255,255,255,.75)",
            letterSpacing: ".16em", textTransform: "uppercase",
          }}>Scene 14 · The Darkroom · Shot 14E</div>
          <div className="t-display" style={{
            fontStyle: "italic", fontSize: "clamp(40px, 6vw, 64px)",
            lineHeight: .92, letterSpacing: "-0.02em",
            color: tkc("white"), textShadow: "0 2px 24px rgba(0,0,0,.8)",
          }}>{film.title}.</div>
        </div>

        {/* Progress strip */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: 3, background: "rgba(0,0,0,.55)",
        }}>
          <div style={{
            width: `${Math.round(film.progress * 100)}%`,
            height: "100%", background:  "var(--c-amber)",
          }}/>
        </div>
      </button>

      {/* Right — live status + CTAs */}
      <div style={{
        padding: "26px 28px 24px",
        display: "flex", flexDirection: "column", gap: 18,
        borderLeft: "1px solid var(--c-line)",
        background: "linear-gradient(180deg, var(--c-panel) 0%, var(--c-bg) 100%)",
      }}>
        <div>
          <div className="t-mono" style={{
            fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", textTransform: "uppercase",
            marginBottom: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", animation: "nirPulse 1.4s ease-in-out infinite" }}></span>
            NOW IN THE ROOM
          </div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-title)", lineHeight: 1.18, color: "var(--c-ink)",
            letterSpacing: "-0.01em", textWrap: "pretty",
          }}>
            {film.id === "p1" ? "Voss reaches for the developer tray." : `${film.title}. is in the room.`}
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8, lineHeight: 1.5 }}>
            The {(window.AGENTS && (window.AGENTS.find(a => a.id === (renderTicks[0] && renderTicks[0].agent)) || {}).name) || "Visual"} agent is working · updated {film.updated}.
          </div>
        </div>

        {/* Production stats — 3-up micro grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
          padding: "16px 0",
          borderTop: "1px solid var(--c-line)",
          borderBottom: "1px solid var(--c-line)",
        }}>
          <NirStat label="Progress" value={`${Math.round(film.progress * 100)}%`} sub={`${film.completed}/${film.shots} shots`}/>
          <NirStat label="Stage"    value={film.stage[0].toUpperCase() + film.stage.slice(1)} sub={film.updated}/>
          <NirStat label="Runtime"  value={film.runtime} sub={film.genre.split(" ")[0]}/>
        </div>

        {/* Live crew feed — fills the column */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 }}>Live feed</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {renderTicks.map((t, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "10px 12px", borderRadius: "var(--r-2)",
                border: "1px solid var(--c-line)", background: "var(--c-panel)",
                fontSize: "var(--fs-body)", color: "var(--c-ink-2)",
              }}>
                <AgentBadge agent={t.agent} size={22}/>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.text}</span>
                  {t.pct != null && (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                      <span style={{ flex: 1, height: 2.5, borderRadius: "var(--r-1)", background: "var(--c-line)", overflow: "hidden" }}>
                        <span style={{ display: "block", width: `${t.pct}%`, height: "100%", background: "var(--c-amber)" }}></span>
                      </span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".08em" }}>{t.pct}%</span>
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={() => go("chat")}
                  style={{ flex: 1, height: 40, fontSize: "var(--fs-body)", gap: 8 }}>
            <Icon name="play" size={12}/> Enter studio
          </button>
          <button className="btn" onClick={() => go("board")}
                  style={{ height: 40, padding: "0 14px", fontSize: "var(--fs-body)" }}>
            Board
          </button>
          <button className="btn" onClick={() => go("pipeline")}
                  style={{ height: 40, padding: "0 14px", fontSize: "var(--fs-body)" }}>
            Pipeline →
          </button>
        </div>
      </div>
    </section>
  );
}

function NirStat({ label, value, sub }) {
  return <CinaStat size="sm" label={label} value={value} sub={sub}/>;
}

// ─── Studio hub — surface the build/publish surfaces with live counts ─────
function studioSiteData() {
  let page = null, published = false;
  try {
    const all = JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}");
    if (all.voss) { page = all.voss; published = true; }
  } catch {}
  const readLen = (k) => {
    try { const v = JSON.parse(localStorage.getItem(k) || "null"); return Array.isArray(v) ? v.length : (v && typeof v === "object" ? Object.keys(v).length : 0); } catch { return 0; }
  };
  const sections = (page && page.sections || []);
  return {
    page, published,
    sections: sections.length,
    inMenu: sections.filter(s => s.inMenu).length,
    posts: readLen("cina:studio-notebook"),
    products: readLen("cina:studio-store"),
    hasStore: sections.some(s => /store|shop|merch/i.test(s.type || "")),
    hasNotebook: sections.some(s => /notebook|news|blog|press/i.test(s.type || "")),
  };
}

// ─── Performance digest — editorial data spread ──────────────────────────
// Replaces the panel-style spotlight. Big italic numbers laid out as the
// composition, not as cards. Charts live below at full width.
function PerformanceDigest({ film, onOpenAnalytics }) {
  if (!film?.published) return null;
  const stats = [
    { label: "Views",        value: fmt(film.views) },
    { label: "Avg. watched", value: `${Math.round(film.avgWatch * 100)}%` },
    { label: "Completion",   value: `${Math.round(film.completionRate * 100)}%` },
    { label: "Countries",    value: String(film.countries) },
  ];

  return (
    <section style={{ marginBottom: 8 }}>
      {/* Big italic stat row */}
      <div className="dsh-perf-stats" style={{ marginBottom: 36 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            padding: "12px 0 12px 0",
            paddingLeft: i === 0 ? 0 : 24,
            borderLeft: i === 0 ? "none" : "1px solid var(--c-line)",
          }}>
            <div className="t-mono" style={{
              fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
              letterSpacing: ".16em", textTransform: "uppercase",
              marginBottom: 12,
            }}>{s.label}</div>
            <div className="t-display t-num dsh-perf-num" style={{
              fontStyle: "italic", fontWeight: 400,
              color: "var(--c-ink)", lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts — 2-col, no panel chrome, just rules. Click → full analytics. */}
      <div className="dsh-perf-charts" style={{
        paddingTop: 24, borderTop: "1px solid var(--c-line)",
      }}>
        <div className="dsh-chart-card" role={onOpenAnalytics ? "button" : undefined} onClick={onOpenAnalytics} style={{ borderRadius: "var(--r-3)", padding: "16px 18px", border: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
          <div style={{ marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
              Daily views · last 14 days
            </span>
            {onOpenAnalytics && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>OPEN →</span>}
          </div>
          <div className="dsh-chart-reveal"><DailyViewsChart data={film.dailyViews} h={140}/></div>
        </div>
        <div className="dsh-chart-card" role={onOpenAnalytics ? "button" : undefined} onClick={onOpenAnalytics} style={{ borderRadius: "var(--r-3)", padding: "16px 18px", border: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
          <div style={{ marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
              Audience retention · across runtime
            </span>
            {onOpenAnalytics && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>OPEN →</span>}
          </div>
          <div className="dsh-chart-reveal"><RetentionChart data={film.retention} runtime={film.runtime} h={140}/></div>
        </div>
      </div>
    </section>
  );
}

// ─── Sales desk — live store / sell notifications ─────────────────────────
// The money side of the studio: producer-pass sales, box-office buys, tips and
// bundle purchases land here in real time. A new sale slides in every few
// seconds (flashed amber), and the right rail keeps the running take. Click a
// sale to open that film. Synthesised from the published slate — deterministic
// seed, evolving feed.
const SALE_KINDS = {
  pass:   { label: "Producer pass", glyph: "◈", bg: "rgba(var(--accent-rgb),.16)", fg: "var(--c-amber)" },
  ticket: { label: "Box office",    glyph: "▸", bg: "rgba(125,179,216,.16)", fg: tkc("cat-1") },
  tip:    { label: "Tip",           glyph: "♥", bg: "rgba(106,163,122,.16)", fg: "var(--c-good)" },
  bundle: { label: "Bundle",        glyph: "❒", bg: "rgba(155,142,196,.18)", fg: tkc("cat-2") },
};
const SALE_HANDLES = ["@mara_v", "@deckard.io", "@nightowl", "@s.okafor", "@violetstills", "@kenji_r", "@orbit_films", "@p.lindqvist", "@redroom", "@a.haddad", "@tess.w", "@lumen"];
function sMoney(n) { return "$" + Math.round(n).toLocaleString(); }
function makeSale(seed) {
  const r = (k) => { const x = Math.sin(seed * 73.13 + k * 19.7) * 43758.5453; return x - Math.floor(x); };
  const pub = (window.PROJECTS || []).filter(f => f.published);
  const film = pub[Math.floor(r(1) * pub.length)] || pub[0] || { title: "LAST LIGHT", id: "p1" };
  const kinds = ["pass", "pass", "ticket", "ticket", "ticket", "tip", "bundle"];
  const kind = kinds[Math.floor(r(2) * kinds.length)];
  const amt = kind === "pass" ? [240, 480, 960, 1500][Math.floor(r(3) * 4)]
            : kind === "ticket" ? [6, 6, 12, 18][Math.floor(r(4) * 4)]
            : kind === "tip" ? [3, 5, 10, 25][Math.floor(r(5) * 4)]
            : [45, 60, 90][Math.floor(r(6) * 3)];
  const tier = kind === "pass" ? ["Backer", "Tier II", "Tier III", "Executive"][Math.floor(r(7) * 4)] : null;
  return {
    id: "s" + seed, kind, amt,
    film: film.title, filmId: film.id,
    who: SALE_HANDLES[Math.floor(r(8) * SALE_HANDLES.length)],
    detail: tier ? tier + " pass" : kind === "ticket" ? "Ticket" : kind === "tip" ? "Tip" : "Watch bundle",
  };
}
function SalesDesk({ onOpenFilm, onOpenAnalytics }) {
  const [sales, setSales] = useStateD(() => Array.from({ length: 6 }, (_, i) => ({ ...makeSale(1000 - i), age: (i + 1) * 90 })));
  const seedRef = React.useRef(1001);
  const [newId, setNewId] = useStateD(null);

  React.useEffect(() => {
    const id = setInterval(() => {
      const s = makeSale(seedRef.current++);
      setNewId(s.id);
      setSales(prev => [{ ...s, age: 0 }, ...prev.map(p => ({ ...p, age: p.age + 6 }))].slice(0, 14));
    }, 5200);
    return () => clearInterval(id);
  }, []);
  const [, force] = useStateD(0);
  React.useEffect(() => { const id = setInterval(() => force(n => n + 1), 12000); return () => clearInterval(id); }, []);

  const rel = (s) => s < 5 ? "now" : s < 60 ? s + "s" : s < 3600 ? Math.round(s / 60) + "m" : Math.round(s / 3600) + "h";

  const today = sales.filter(s => s.age < 86400).reduce((a, b) => a + b.amt, 0) + 4120;
  const week = today + 18640;
  const count = sales.length + 47;
  const byFilm = {};
  sales.forEach(s => { byFilm[s.film] = (byFilm[s.film] || 0) + s.amt; });
  const topFilm = Object.entries(byFilm).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="sdesk">
      <div className="sdesk__head">
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 7px var(--c-good)", animation: "nirPulse 1.8s ease-in-out infinite" }}/>
          SALES DESK · LIVE
        </span>
        <button onClick={onOpenAnalytics} className="btn" style={{ height: 30, padding: "0 12px", fontSize: "var(--fs-label)", gap: 6 }}>
          Revenue <Icon name="chev-r" size={11}/>
        </button>
      </div>
      <div className="sdesk__body">
        <div className="sdesk__feed">
          {sales.map(s => {
            const k = SALE_KINDS[s.kind];
            return (
              <div key={s.id} className={"sdesk__row" + (s.id === newId ? " sdesk__row--new" : "")} onClick={() => onOpenFilm && onOpenFilm(s.filmId, "chat")}>
                <span className="sdesk__badge" style={{ background: k.bg, color: k.fg, fontSize: "var(--fs-lead)" }}>{k.glyph}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <b style={{ fontWeight: 600 }}>{k.label}</b> <span style={{ color: "var(--c-ink-4)" }}>·</span> <span className="t-display" style={{ fontStyle: "italic", color: "var(--c-ink-2)" }}>{s.film}</span>
                  </div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 3 }}>
                    {s.detail} · {s.who} · {rel(s.age)}
                  </div>
                </div>
                <span className="sdesk__amt">+{sMoney(s.amt)}</span>
              </div>
            );
          })}
        </div>
        <div className="sdesk__sum">
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>Today</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", letterSpacing: "-0.02em", lineHeight: .9 }}>{sMoney(today)}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", marginTop: 6 }}>▲ {count} sales today</div>
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>This week</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{sMoney(week)}</div>
            </div>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>Top seller</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{topFilm ? topFilm[0] : "—"}</div>
            </div>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--c-line)", display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(SALE_KINDS).map(([key, k]) => (
              <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "var(--r-1)", background: k.fg }}/>{k.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Crew log — live activity across the whole slate ──────────────────────
// Was: every row collapsed onto the active film (looked broken — a wall of
// "LAST LIGHT"). Now a real cross-slate feed: each entry carries its own film
// + agent, the lead item pulses "live", and the relative clock ticks so the
// panel feels alive on a still page. Film colour comes from the project.
function crewFilmColor(title) {
  const f = (window.PROJECTS || []).find(p => (p.title || "").toUpperCase() === (title || "").toUpperCase());
  return (f && f.cover) || tkc("amber");
}
function crewFilmId(title) {
  const f = (window.PROJECTS || []).find(p => (p.title || "").toUpperCase() === (title || "").toUpperCase());
  return f && f.id;
}
// Which studio view each agent owns — clicking a log row jumps you straight
// to where that work is happening.
const CREW_VIEW = { writer: "script", director: "chat", visual: "gen", editor: "edit", audio: "audio" };
function CrewLog({ onOpenFilm }) {
  const [, force] = useStateD(0);
  // A believable cross-slate feed. Mixes the live render queue (Last Light)
  // with work happening on the other projects so the studio reads as busy.
  const feed = [
    { agent: "visual",   text: "Rendering 14E · POV · v3 · seed 8841", film: "LAST LIGHT", live: true },
    { agent: "editor",   text: "QC pass on 14D — no warp detected.",   film: "LAST LIGHT", t0: 12 },
    { agent: "writer",   text: "Drafted scene 4 — the vault job.",      film: "MARAUDER",   t0: 64 },
    { agent: "visual",   text: "12 character refs generated.",          film: "THE LONG HALL", t0: 240 },
    { agent: "audio",    text: "Score sketch v2 — ambient pad, 62 BPM.", film: "LAST LIGHT", t0: 264 },
    { agent: "director", text: "Routed 14E to Veo-3 (motion priority).", film: "LAST LIGHT", t0: 660 },
    { agent: "editor",   text: "Locked picture on Bluejay v17.",        film: "BLUEJAY",    t0: 7200 },
  ];
  // Tick the clock so "now / 1m / 2m" advances while you watch.
  React.useEffect(() => { const id = setInterval(() => force(n => n + 1), 15000); return () => clearInterval(id); }, []);
  const tick = Math.floor(Date.now() / 15000);
  const rel = (s) => { const x = s + (tick % 4) * 15; if (x < 60) return x + "s"; if (x < 3600) return Math.round(x / 60) + "m"; return Math.round(x / 3600) + "h"; };

  const openRow = (it) => {
    const id = crewFilmId(it.film);
    if (id && onOpenFilm) onOpenFilm(id, CREW_VIEW[it.agent] || "chat");
    else window.toast?.(it.film + " · " + it.agent);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: 0, letterSpacing: "-0.01em" }}>Crew log.</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", textTransform: "uppercase", letterSpacing: ".16em", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}/>5 agents live
        </span>
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "0 0 12px", maxWidth: 320 }}>
        What your AI crew is doing right now, across every film. Tap a line to jump into that scene.
      </p>
      <div>
        {feed.map((it, i) => (
          <button key={i} className="dsh-crew__row" onClick={() => openRow(it)}>
            <div className="dsh-crew__rail">
              <AgentBadge agent={it.agent} size={26}/>
              {it.live && <span style={{ position: "absolute", top: -1, right: 0, width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)", border: "1.5px solid var(--c-bg)", animation: "nirPulse 1.4s ease-in-out infinite" }}/>}
            </div>
            <div style={{ minWidth: 0, paddingTop: 2 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4, textWrap: "pretty" }}>{it.text}</div>
              <span className="dsh-crew__chip" style={{ marginTop: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: "var(--r-1)", background: crewFilmColor(it.film) }}/>
                <span style={{ color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{it.film}</span>
              </span>
            </div>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: it.live ? "var(--c-amber)" : "var(--c-ink-4)", letterSpacing: ".08em", paddingTop: 3, whiteSpace: "nowrap" }}>
              {it.live ? "now" : rel(it.t0)}
            </span>
            <span className="dsh-crew__go"><Icon name="chev-r" size={13}/></span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Vault teaser — real performer cards, like the casting page ───────────
// Was an overlapping strip of crude procedural SVG faces. Now uses the real
// headshots carried on each character (assets/cast/*.png) in proper poster
// cards: portrait, gradient floor, name + role, a credits chip and a mint
// state dot — the same visual language as the public Cast page.
function VaultTeaser({ onOpen }) {
  const all = window.CHARACTERS || [];
  const actors = all.slice(0, 4);
  const totalCredits = all.reduce((a, c) => a + (c.credits || 0), 0);
  const totalFilms   = all.reduce((a, c) => a + (c.films || 0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: 0, letterSpacing: "-0.01em" }}>The vault.</h2>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", textTransform: "uppercase", letterSpacing: ".16em" }}>
          {all.length} performers
        </span>
      </div>

      <div className="dsh-vault-grid" style={{ marginBottom: 14 }}>
        {actors.map(a => {
          let minted = false;
          try { minted = localStorage.getItem(`cina:actor-minted:${a.id}`) === "1"; } catch {}
          return (
            <button key={a.id} onClick={onOpen} className="dsh-vault-card" title={a.name}>
              {a.photo
                ? <img src={a.photo} alt={a.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                : <span style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${a.color || tkc("line-2")}, ${tkc("void")})` }}/>}
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.94) 6%, rgba(8,8,10,.05) 52%, rgba(8,8,10,.4) 100%)" }}/>
              {/* credits chip */}
              <span style={{ position: "absolute", top: 8, left: 8, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 7px", background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)", borderRadius: 999, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".08em" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--c-amber)" }}/>{fmt(a.credits || 0)}
              </span>
              {/* mint dot */}
              <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: minted ? "var(--c-good)" : "transparent", border: `1.5px solid ${minted ? "var(--c-good)" : "rgba(255,255,255,.5)"}`, boxShadow: minted ? "0 0 6px var(--c-good)" : "none" }}/>
              {/* name + role */}
              <span style={{ position: "absolute", left: 11, right: 11, bottom: 10 }}>
                <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.05, letterSpacing: "-0.01em", textShadow: "0 1px 8px rgba(0,0,0,.7)" }}>{a.name}</span>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.72)", letterSpacing: ".16em", marginTop: 3, textTransform: "uppercase" }}>{a.role} · {a.films || 0} film{(a.films || 0) === 1 ? "" : "s"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginTop: "auto", paddingTop: 14, marginBottom: 8 }}>
        {fmt(totalCredits)} credits · {totalFilms} appearances
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4, letterSpacing: "-0.01em", marginBottom: 14 }}>
        Birth a performer, train them on your slate, mint them as your own.
      </div>

      <button onClick={onOpen} className="btn" style={{ height: 38, padding: "0 16px", fontSize: "var(--fs-body)" }}>
        <Icon name="grid" size={11}/> Open the vault
      </button>
    </div>
  );
}

// ─────────────────────────── ACTOR VAULT (homepage section)

function ActorPortrait_dashboard({ seed = 117, palette = [tkc("cat-3"), tkc("on-amber"), tkc("amber-x")], size = 110 }) {
  const [bg1, bg2, accent] = palette;
  const id = `dap-${seed}`;
  const skin = `hsl(${(seed * 47) % 60 + 20}, ${30 + (seed % 12)}%, ${48 + (seed % 18)}%)`;
  const hair = `hsl(${(seed * 13) % 50 + 10}, ${20 + (seed % 30)}%, ${10 + (seed % 24)}%)`;
  const eyes = `hsl(${(seed * 17) % 30 + 10}, 30%, 24%)`;
  const w = size, h = size * 1.25;
  const cx = w * 0.5, cy = h * 0.42, R = w * 0.30;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg2} stopOpacity="0.5"/>
          <stop offset="0.6" stopColor={bg1}/>
          <stop offset="1" stopColor={tkc("black")}/>
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`}/>
      <ellipse cx={cx} cy={h + R * 0.2} rx={w * 0.55} ry={R * 1.25} fill={tkc("void")} opacity="0.85"/>
      <rect x={cx - R * 0.32} y={cy + R * 0.7} width={R * 0.64} height={R * 0.7} fill={skin}/>
      <ellipse cx={cx} cy={cy} rx={R * 0.92} ry={R * 1.05} fill={skin}/>
      <ellipse cx={cx + R * 0.45} cy={cy + R * 0.25} rx={R * 0.45} ry={R * 0.55} fill={tkc("black")} opacity="0.18"/>
      <path d={`M ${cx - R * 0.95} ${cy + R * 0.4} Q ${cx} ${cy - R * 1.4}, ${cx + R * 0.95} ${cy + R * 0.4} L ${cx + R * 0.85} ${cy} L ${cx - R * 0.85} ${cy} Z`} fill={hair}/>
      <circle cx={cx - R * 0.27} cy={cy} r={R * 0.045} fill={eyes}/>
      <circle cx={cx + R * 0.27} cy={cy} r={R * 0.045} fill={eyes}/>
      <path d={`M ${cx - R * 0.18} ${cy + R * 0.55} Q ${cx} ${cy + R * 0.6}, ${cx + R * 0.18} ${cy + R * 0.55}`} stroke={tkc("blood")} strokeWidth={R * 0.045} fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d={`M ${cx - R * 0.05} ${cy - R * 0.85} Q ${cx + R * 0.85} ${cy - R * 0.4}, ${cx + R * 0.55} ${cy + R * 0.85}`} stroke={accent} strokeOpacity="0.18" strokeWidth="3" fill="none"/>
    </svg>
  );
}

const cardActionStyle = {
  background: "transparent", border: "none",
  padding: "9px 0", fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
  cursor: "pointer",
  fontFamily: "var(--f-mono)", letterSpacing: ".08em",
};

const modalInput = {
  background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
  padding: "10px 12px", fontSize: "var(--fs-body)", color: "var(--c-ink)", outline: "none",
  fontFamily: "var(--f-display)",
};

// ─────────────────────────── KPI

function KPI({ label, value, sub, delta, stars, trend }) {
  return <CinaStat label={label} value={value} sub={sub} delta={trend ? undefined : delta} trend={trend} stars={stars ? 5 : undefined}/>;
}

function Sparkline_dashboard({ data, w = 80, h = 24, color = "var(--c-amber)" }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={w} cy={h - ((data[data.length-1] - min) / range) * h} r="2" fill={color}/>
    </svg>
  );
}

function Tabs({ tab, setTab, options }) {
  return <CinaTabs tabs={options} value={tab} onChange={setTab}/>;
}

// ─────────────────────────── FILM CARD

function FilmCard({ film, hero, onClick }) {
  const span = hero ? 4 : 2;

  const thumbKind = film.id === "p1" ? "darkroom-est"
                   : film.id === "p2" ? "darkroom-wide"
                   : film.id === "p3" ? "phone"
                   : film.id === "p5" ? "the-photo"
                   : null;

  const statusKey = film.status === "released" ? "approved"
                  : film.status === "in production" ? "active"
                  : film.status === "storyboard" ? "review"
                  : "draft";

  const topLeft = [
    <StatusPill key="s" status={statusKey}/>,
  ];
  const topRight = !hero
    ? <span className="t-mono" style={{
        fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)",
        background: "rgba(0,0,0,.5)", padding: "2px 5px", borderRadius: "var(--r-1)",
        letterSpacing: ".08em",
      }}>{film.code}</span>
    : null;

  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <FilmTile
        thumb={thumbKind || (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${film.cover}, ${tkc("void")})` }}/>
        )}
        color={film.cover}
        ratio={hero ? "16/9" : "4/3"}
        title={film.title}
        subtitle={`${film.code} · ${film.genre} · ${film.runtime || `${film.shots} shots`}`}
        meta={film.shots > 0 ? `${film.completed}/${film.shots} · ${film.updated}` : film.updated}
        topLeft={topLeft}
        topRight={topRight}
        progress={film.progress > 0 && film.progress < 1 ? film.progress : 0}
        showTitleOnImage
        onClick={onClick}
        overlay={hero && film.published ? (
          <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 16, color: "rgba(255,255,255,.9)" }}>
            <Stat icon="play" value={fmt(film.views)} label="views"/>
            <Stat icon="check" value={`${Math.round(film.completionRate*100)}%`} label="finish"/>
            <Stat value={film.rating} label="★"/>
          </div>
        ) : null}
      />
    </div>
  );
}

function Stat({ icon, value, label, k, v }) {
  return <CinaStat size="sm" icon={icon} label={label ?? k} value={value ?? v}/>;
}

// ─── Daily views chart — annotated thin-stem field ────────────────────────
// Was a row of stocky bars. Now: hairline amber stems with a cap dot per
// day, weekday letters underneath, dotted average line across, and a peak
// stem highlighted with a vertical callout to the value. Reads like an
// NYT-Sunday data graphic, not a Google Sheets chart.
function DailyViewsChart({ data, h = 120 }) {
  const max  = Math.max(...data);
  const avg  = data.reduce((a, b) => a + b, 0) / data.length;
  const N    = data.length;
  const w    = N * 36;
  const baseY = h - 22;     // leave room for weekday labels
  const topY  = 26;         // leave room for peak callout
  const yFor = (v) => baseY - (v / max) * (baseY - topY);
  const peakIdx = data.indexOf(max);

  // Weekday letters, anchored to "today is rightmost"
  const today = new Date();
  const DOW   = ["S","M","T","W","T","F","S"];
  const labels = data.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (N - 1 - i));
    return DOW[d.getDay()];
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%", height: h, display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="dv-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor= "var(--c-amber)"   stopOpacity=".95"/>
          <stop offset="100%" stopColor="var(--c-amber-d)" stopOpacity=".25"/>
        </linearGradient>
      </defs>

      {/* Baseline rule */}
      <line x1="0" x2={w} y1={baseY} y2={baseY} stroke="var(--c-line-2)" strokeWidth=".5"/>

      {/* Average dotted line */}
      <line
        x1="0" x2={w}
        y1={yFor(avg)} y2={yFor(avg)}
        stroke="var(--c-ink-4)" strokeWidth=".5"
        strokeDasharray="3 4"
      />
      <text
        x={w} y={yFor(avg) - 4} textAnchor="end"
        fill="var(--c-ink-3)" fontSize="9"
        fontFamily="JetBrains Mono" letterSpacing=".12em"
      >avg {fmt(Math.round(avg))}</text>

      {/* Per-day stems */}
      {data.map((v, i) => {
        const cx     = (i + 0.5) * (w / N);
        const yTop   = yFor(v);
        const isPeak = i === peakIdx;
        return (
          <g key={i}>
            {/* Stem */}
            <rect
              x={cx - 2} y={yTop}
              width="4" height={baseY - yTop}
              fill={isPeak ? "var(--c-amber)" : "url(#dv-stem)"}
              opacity={isPeak ? 1 : .85}
              rx="2"
            />
            {/* Cap dot */}
            <circle
              cx={cx} cy={yTop}
              r={isPeak ? 5 : 2.75}
              fill={isPeak ? "var(--c-amber-x)" :  "var(--c-amber)"}
              stroke={isPeak ? "var(--c-bg)" : "none"}
              strokeWidth={isPeak ? 1.5 : 0}
            />
            {/* Peak callout — thin line up to value */}
            {isPeak && (
              <g>
                <line
                  x1={cx} x2={cx}
                  y1={yTop - 8} y2={14}
                  stroke= "var(--c-amber)" strokeWidth=".75"
                />
                <text
                  x={cx} y={10} textAnchor="middle"
                  fill= "var(--c-amber)" fontSize="11"
                  fontFamily="JetBrains Mono" fontWeight="600"
                  letterSpacing=".04em"
                >{fmt(v)}</text>
              </g>
            )}
            {/* Weekday letter */}
            <text
              x={cx} y={baseY + 14} textAnchor="middle"
              fill={isPeak ? "var(--c-amber)" : "var(--c-ink-4)"}
              fontSize="9" fontFamily="JetBrains Mono"
              fontWeight={isPeak ? 700 : 400}
              letterSpacing=".06em"
            >{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Retention chart — annotated narrative arc ───────────────────────────
// Three-act structure overlaid: dotted dividers at 33% and 66% of runtime,
// faint Y-grid at 25/50/75 with mono labels, the curve drawn at 1.75px,
// auto-detected steepest drop tagged in blood-red, and a finish dot at the
// end with the final completion %.
function RetentionChart({ data, runtime, h = 120 }) {
  const w     = 600;
  const N     = data.length;
  const topY  = 8;
  const baseY = h - 28;        // leave room for time/act labels

  // Find the "half gone" moment — first index where retention crosses
  // below 50%. For monotonic-decreasing curves with no sharp cliff (the
  // common case), this is more narratively useful than a synthetic
  // "biggest drop" callout that lands on a gentle slope.
  let halfIdx = -1;
  for (let i = 0; i < N; i++) { if (data[i] <= 50) { halfIdx = i; break; } }
  if (halfIdx < 0) halfIdx = N - 1;
  // We still surface the (relatively) steepest 6% window for visual weight,
  // but only use it to draw the dashed line — the LABEL goes on "half gone".
  const tailGuard = Math.floor(N * 0.92);
  const window    = Math.max(3, Math.floor(N * 0.06));
  let steepIdx = halfIdx, maxDrop = 0;
  for (let i = window; i < tailGuard; i++) {
    const d = data[i - window] - data[i];
    if (d > maxDrop) { maxDrop = d; steepIdx = i; }
  }
  const dropIdx = halfIdx; // annotation lands here
  const finishPct = data[N - 1];

  const pts = data.map((v, i) => [
    (i / (N - 1)) * w,
    baseY - (v / 100) * (baseY - topY),
  ]);
  const path     = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const fillPath = `${path} L ${w} ${baseY} L 0 ${baseY} Z`;

  const dropX = pts[dropIdx][0];
  const dropY = pts[dropIdx][1];
  const endX  = pts[N - 1][0];
  const endY  = pts[N - 1][1];

  // Position the drop label LEFT of marker if it's in the last third,
  // to avoid colliding with the finish dot
  const dropLabelOnLeft = (dropIdx / (N - 1)) > 0.7;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%", height: h, display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="ret-grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor= "var(--c-amber)" stopOpacity=".22"/>
          <stop offset="100%" stopColor= "var(--c-amber)" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Y grid + labels at 25/50/75 */}
      {[25, 50, 75].map(pct => {
        const y = baseY - (pct / 100) * (baseY - topY);
        return (
          <g key={pct}>
            <line x1="0" x2={w} y1={y} y2={y}
                  stroke="var(--c-line)" strokeWidth=".5" strokeDasharray="2 5"/>
            <text x={w} y={y - 4} textAnchor="end"
                  fill="var(--c-ink-4)" fontSize="8.5"
                  fontFamily="JetBrains Mono" letterSpacing=".1em">{pct}%</text>
          </g>
        );
      })}

      {/* Three-act dividers */}
      {[[0.333, "ACT II"], [0.666, "ACT III"]].map(([frac, label]) => {
        const x = frac * w;
        return (
          <g key={label}>
            <line x1={x} x2={x} y1={topY} y2={baseY}
                  stroke="var(--c-line-2)" strokeWidth=".5" strokeDasharray="3 5"/>
            <text x={x + 6} y={topY + 9}
                  fill="var(--c-ink-4)" fontSize="8.5"
                  fontFamily="JetBrains Mono" letterSpacing=".22em">{label}</text>
          </g>
        );
      })}
      {/* Act I label */}
      <text x="6" y={topY + 9}
            fill="var(--c-ink-4)" fontSize="8.5"
            fontFamily="JetBrains Mono" letterSpacing=".22em">ACT I</text>

      {/* Curve fill + line */}
      <path d={fillPath} fill="url(#ret-grad2)"/>
      <path d={path} fill="none" stroke= "var(--c-amber)" strokeWidth="1.75" strokeLinejoin="round"/>

      {/* Half-gone annotation — 50% retention crossing */}
      <line x1={dropX} x2={dropX} y1={topY} y2={baseY}
            stroke="var(--c-blood-x)" strokeWidth=".75"
            strokeDasharray="2 3" opacity=".7"/>
      <circle cx={dropX} cy={dropY} r="4.5"
              fill="var(--c-blood-x)"
              stroke="var(--c-bg)" strokeWidth="2"/>
      <g transform={`translate(${dropLabelOnLeft ? dropX - 10 : dropX + 10}, ${dropY - 12})`}>
        <text x="0" y="0"
              textAnchor={dropLabelOnLeft ? "end" : "start"}
              fill="var(--c-blood-x)" fontSize="9"
              fontFamily="JetBrains Mono" fontWeight="700"
              letterSpacing=".18em">HALF GONE</text>
        <text x="0" y="11"
              textAnchor={dropLabelOnLeft ? "end" : "start"}
              fill="var(--c-ink-3)" fontSize="9"
              fontFamily="JetBrains Mono" letterSpacing=".08em">
          at {Math.round((dropIdx / (N - 1)) * 100)}% of runtime
        </text>
      </g>

      {/* Finish dot + label */}
      <circle cx={endX} cy={endY} r="4.5"
              fill= "var(--c-amber)"
              stroke="var(--c-bg)" strokeWidth="2"/>
      <text x={endX - 8} y={endY - 8} textAnchor="end"
            fill= "var(--c-amber)" fontSize="9"
            fontFamily="JetBrains Mono" fontWeight="700"
            letterSpacing=".18em">FINISH · {finishPct}%</text>

      {/* Time labels */}
      <text x="0" y={h - 6}
            fill="var(--c-ink-4)" fontSize="9"
            fontFamily="JetBrains Mono" letterSpacing=".14em">00:00</text>
      <text x={w} y={h - 6} textAnchor="end"
            fill="var(--c-ink-4)" fontSize="9"
            fontFamily="JetBrains Mono" letterSpacing=".14em">{runtime}</text>
    </svg>
  );
}

// ─────────────────────────── helpers

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

Object.assign(window, { Dashboard });
