// cina-ui.jsx — The one component set. Every surface (Watch, Studio, Producers)
// uses these and nothing else for: Modal, Sheet, Stat, Pill, Tabs, Empty, Icon, Toast, Tour.
// Older component names (Stat, KPI, EmptyState, P2Empty, Tabs, StatusTag, …) are now thin
// wrappers over these, so call sites keep working.

const { useState: usUI, useEffect: ueUI, useRef: urUI, useLayoutEffect: ulUI } = React;

(function cinaUiCss() {
  if (document.getElementById("cina-ui-css")) return;
  const s = document.createElement("style");
  s.id = "cina-ui-css";
  s.textContent = `
.cui-scrim{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.62);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;animation:cuiFade .18s ease}
.cui-modal{position:relative;width:100%;max-height:min(88vh,900px);display:flex;flex-direction:column;background:var(--c-panel);border:1px solid var(--c-line-2);border-radius:var(--r-2);box-shadow:0 30px 80px rgba(0,0,0,.6);color:var(--c-ink);animation:cuiRise .24s cubic-bezier(.2,.8,.2,1)}
.cui-head{display:flex;align-items:flex-start;gap:16px;padding:20px 22px 14px;border-bottom:1px solid var(--c-line)}
.cui-head__t{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.cui-title{margin:0;font-family:var(--f-display);font-style:italic;font-weight:500;font-size:var(--fs-title);line-height:1.15;letter-spacing:-0.01em}
.cui-body{padding:18px 22px;overflow:auto;min-height:0;font-size:var(--fs-body);line-height:1.55;color:var(--c-ink-2)}
.cui-foot{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;padding:14px 22px;border-top:1px solid var(--c-line)}
.cui-x{flex-shrink:0;width:32px;height:32px;border-radius:var(--r-full);border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.cui-x:hover{color:var(--c-ink);border-color:var(--c-ink-3)}
.cui-label{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.16em;text-transform:uppercase;color:var(--c-ink-3)}
.cui-sheet-scrim{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.5);animation:cuiFade .18s ease}
.cui-sheet{position:fixed;z-index:901;display:flex;flex-direction:column;background:var(--c-panel);color:var(--c-ink);box-shadow:0 0 60px rgba(0,0,0,.5)}
.cui-sheet[data-side="right"]{top:0;right:0;bottom:0;width:min(100vw,var(--cui-w,440px));border-left:1px solid var(--c-line-2);animation:cuiInR .26s cubic-bezier(.2,.8,.2,1)}
.cui-sheet[data-side="left"]{top:0;left:0;bottom:0;width:min(100vw,var(--cui-w,440px));border-right:1px solid var(--c-line-2);animation:cuiInL .26s cubic-bezier(.2,.8,.2,1)}
.cui-sheet[data-side="bottom"]{left:0;right:0;bottom:0;max-height:88vh;border-top:1px solid var(--c-line-2);border-radius:var(--r-2) var(--r-2) 0 0;animation:cuiInB .26s cubic-bezier(.2,.8,.2,1)}
.cui-stat{display:flex;flex-direction:column;gap:6px;min-width:0}
.cui-stat__v{font-family:var(--f-display);font-weight:500;font-size:var(--fs-head);line-height:1;letter-spacing:-0.02em;color:var(--c-ink);display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.cui-stat[data-size="sm"] .cui-stat__v{font-size:var(--fs-title)}
.cui-stat__sub{font-size:var(--fs-body);color:var(--c-ink-3);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cui-delta{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.06em}
.cui-pill{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:var(--r-full);border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-2);font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;line-height:1}
button.cui-pill{cursor:pointer}
button.cui-pill:hover{border-color:var(--c-ink-3);color:var(--c-ink)}
.cui-pill[data-size="lg"]{height:34px;padding:0 14px}
.cui-pill[data-tone="accent"]{border-color:var(--c-amber);color:var(--c-amber)}
.cui-pill[data-tone="good"]{border-color:var(--c-good);color:var(--c-good)}
.cui-pill[data-tone="warn"]{border-color:var(--c-warn);color:var(--c-warn)}
.cui-pill[data-tone="bad"]{border-color:var(--c-bad);color:var(--c-bad)}
.cui-pill[data-tone="solid"]{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber)}
.cui-pill[data-tone="dark"]{background:rgba(0,0,0,.72);border-color:rgba(255,255,255,.14);color:var(--c-white)}
.cui-pill[data-active="1"]{background:var(--c-ink);border-color:var(--c-ink);color:var(--c-bg)}
.cui-pill__dot{width:6px;height:6px;border-radius:var(--r-full);background:currentColor}
.cui-tabs{display:flex;gap:4px;border-bottom:1px solid var(--c-line);overflow-x:auto;scrollbar-width:none}
.cui-tabs::-webkit-scrollbar{display:none}
.cui-tab{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:10px 12px;margin-bottom:-1px;border-bottom:2px solid transparent;font-size:var(--fs-body);color:var(--c-ink-3);white-space:nowrap}
.cui-tab:hover{color:var(--c-ink)}
.cui-tab[aria-selected="true"]{color:var(--c-ink);border-bottom-color:var(--c-amber)}
.cui-tab__n{font-family:var(--f-mono);font-size:var(--fs-label);color:var(--c-ink-4)}
.cui-empty{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:clamp(28px,4vw,56px) 0;max-width:520px}
.cui-empty[data-center="1"]{align-items:center;text-align:center;margin:0 auto}
.cui-empty[data-compact="1"]{padding:18px 0;gap:8px}
.cui-empty__icon{width:44px;height:44px;border-radius:var(--r-full);border:1px solid var(--c-line-2);display:flex;align-items:center;justify-content:center;color:var(--c-ink-3)}
.cui-empty__t{font-family:var(--f-display);font-style:italic;font-size:var(--fs-title);line-height:1.15;color:var(--c-ink)}
.cui-empty__b{font-size:var(--fs-body);line-height:1.55;color:var(--c-ink-3)}
.cui-toasts{position:fixed;right:20px;bottom:calc(20px + var(--orb-safe, 0px));z-index:1000;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:min(380px,calc(100vw - 40px))}
.cui-toast{pointer-events:auto;padding:12px 14px;background:var(--c-panel);border:1px solid var(--c-line-2);border-left:3px solid var(--c-amber);border-radius:var(--r-1);box-shadow:0 12px 36px rgba(0,0,0,.55);font-size:var(--fs-body);line-height:1.45;color:var(--c-ink);animation:cuiRise .22s cubic-bezier(.2,.8,.2,1);display:flex;gap:10px;align-items:flex-start}
.cui-toast[data-kind="good"]{border-left-color:var(--c-good)}
.cui-toast[data-kind="warn"]{border-left-color:var(--c-warn)}
.cui-toast[data-kind="bad"]{border-left-color:var(--c-bad)}
.cui-tour{position:fixed;inset:0;z-index:950;pointer-events:none}
.cui-tour__card{position:fixed;width:min(340px,calc(100vw - 32px));pointer-events:auto;background:var(--c-panel);border:1px solid var(--c-amber);border-radius:var(--r-2);box-shadow:0 20px 50px rgba(0,0,0,.6);padding:18px;display:flex;flex-direction:column;gap:10px;animation:cuiRise .22s ease}
.cui-tour__bar{display:flex;gap:4px}
.cui-tour__bar span{flex:1;height:2px;background:var(--c-line-2)}
.cui-tour__bar span[data-on="1"]{background:var(--c-amber)}
.cui-btn{height:32px;padding:0 14px;border-radius:var(--r-1);border:1px solid var(--c-line-3);background:transparent;color:var(--c-ink);font-family:var(--f-sans);font-size:var(--fs-body);cursor:pointer}
.cui-btn:hover{border-color:var(--c-ink)}
.cui-btn--primary{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-weight:600}
@keyframes cuiFade{from{opacity:0}to{opacity:1}}
:root{--orb-safe:0px}
body[data-orb="on"]{--orb-safe:60px}
body[data-orb="on"]{padding-bottom:var(--orb-safe)}
body[data-orb="on"] .pm-mobilebar{bottom:var(--orb-safe)!important}
@keyframes cuiRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes cuiInL{from{transform:translateX(-100%)}to{transform:none}}
@keyframes cuiInR{from{transform:translateX(100%)}to{transform:none}}
@keyframes cuiInB{from{transform:translateY(100%)}to{transform:none}}
`;
  document.head.appendChild(s);
})();

function useEscape(onClose) {
  ueUI(() => {
    if (!onClose) return;
    const h = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [onClose]);
}
function useScrollLock() {
  ueUI(() => { const b = document.body, prev = b.style.overflow; b.style.overflow = "hidden"; return () => { b.style.overflow = prev; }; }, []);
}

// ── Modal ─────────────────────────────────────────────────────────────
function CinaModal({ onClose, title, kicker, width = 560, actions, children, bodyStyle, panelStyle, dismissible = true, label }) {
  useEscape(dismissible ? onClose : null);
  useScrollLock();
  const ref = urUI(null);
  ueUI(() => { const el = ref.current && ref.current.querySelector("input,textarea,select,button:not(.cui-x)"); el && el.focus && el.focus({ preventScroll: true }); }, []);
  return ReactDOM.createPortal(
    <div className="cui-scrim" onMouseDown={(e) => { if (dismissible && e.target === e.currentTarget && onClose) onClose(); }}>
      <div ref={ref} className="cui-modal" role="dialog" aria-modal="true" aria-label={label || (typeof title === "string" ? title : undefined)} style={{ maxWidth: width, ...panelStyle }}>
        {(title || kicker || onClose) && (
          <div className="cui-head">
            <div className="cui-head__t">
              {kicker && <span className="cui-label">{kicker}</span>}
              {title && <h2 className="cui-title">{title}</h2>}
            </div>
            {onClose && <button className="cui-x" onClick={onClose} aria-label="Close"><Icon name="x" size={13}/></button>}
          </div>
        )}
        <div className="cui-body" style={bodyStyle}>{children}</div>
        {actions && <div className="cui-foot">{actions}</div>}
      </div>
    </div>, document.body);
}

// ── Sheet ─────────────────────────────────────────────────────────────
function CinaSheet({ onClose, title, kicker, side = "right", width = 440, actions, children, bodyStyle }) {
  useEscape(onClose);
  useScrollLock();
  return ReactDOM.createPortal(
    <>
      <div className="cui-sheet-scrim" onClick={onClose}></div>
      <aside className="cui-sheet" data-side={side} role="dialog" aria-modal="true" style={{ "--cui-w": width + "px" }}>
        {(title || kicker || onClose) && (
          <div className="cui-head">
            <div className="cui-head__t">{kicker && <span className="cui-label">{kicker}</span>}{title && <h2 className="cui-title">{title}</h2>}</div>
            {onClose && <button className="cui-x" onClick={onClose} aria-label="Close"><Icon name="x" size={13}/></button>}
          </div>
        )}
        <div className="cui-body" style={{ flex: 1, ...bodyStyle }}>{children}</div>
        {actions && <div className="cui-foot">{actions}</div>}
      </aside>
    </>, document.body);
}

// ── Stat ──────────────────────────────────────────────────────────────
function CinaSpark({ data, w = 72, h = 22 }) {
  if (!Array.isArray(data) || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / r) * h}`).join(" ");
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}><polyline points={pts} fill="none" stroke="var(--c-amber)" strokeWidth="1.5"/></svg>;
}
function CinaStat({ label, value, sub, delta, up, tone, size = "md", icon, trend, stars, children, style }) {
  const toneColor = { accent: "var(--c-amber)", good: "var(--c-good)", warn: "var(--c-warn)", bad: "var(--c-bad)" }[tone];
  let dUp = up;
  if (dUp == null && delta != null) dUp = typeof delta === "number" ? delta >= 0 : !/^\s*[-−▼]/.test(String(delta));
  const dText = delta == null ? null : typeof delta === "number" ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)}%` : String(delta);
  return (
    <div className="cui-stat" data-size={size} style={style}>
      <span className="cui-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>{icon && (typeof icon === "string" ? <Icon name={icon} size={12}/> : icon)}{label}</span>
      <span className="cui-stat__v" style={toneColor ? { color: toneColor } : null}>
        {value}
        {stars != null && <span style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)", letterSpacing: ".1em" }}>{"★".repeat(Math.round(+stars || 5))}</span>}
      </span>
      {(sub || dText || trend) && (
        <span className="cui-stat__sub">
          {sub && <span>{sub}</span>}
          {Array.isArray(trend) ? <CinaSpark data={trend}/> : trend != null && !dText ? <span className="cui-delta">{trend}</span> : null}
          {dText && <span className="cui-delta" style={{ color: dUp ? "var(--c-good)" : "var(--c-bad)" }}>{dText}</span>}
        </span>
      )}
      {children}
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────
function CinaPill({ children, tone, active, onClick, size, dot, icon, title, style, className, ...rest }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag className={"cui-pill" + (className ? " " + className : "")} data-tone={tone || undefined} data-active={active ? "1" : undefined} data-size={size || undefined} onClick={onClick} title={title} style={style} {...rest}>
      {dot && <span className="cui-pill__dot"></span>}
      {icon && (typeof icon === "string" ? <Icon name={icon} size={11}/> : icon)}
      {children}
    </Tag>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────
function CinaTabs({ tabs, value, onChange, style }) {
  const norm = (tabs || []).map(t => typeof t === "string" ? { id: t, label: t } : Array.isArray(t) ? { id: t[0], label: t[1], count: t[2] } : { id: t.id ?? t.value ?? t.key, label: t.label ?? t.name, count: t.count });
  return (
    <div className="cui-tabs" role="tablist" style={style}>
      {norm.map(t => (
        <button key={t.id} className="cui-tab" role="tab" aria-selected={value === t.id} onClick={() => onChange && onChange(t.id)}>
          {t.label}{t.count != null && <span className="cui-tab__n">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────
function CinaEmpty({ icon, title, body, cta, children, compact, center, kicker }) {
  return (
    <div className="cui-empty" data-compact={compact ? "1" : undefined} data-center={center ? "1" : undefined}>
      {icon && <span className="cui-empty__icon">{typeof icon === "string" ? <Icon name={icon} size={18}/> : icon}</span>}
      {kicker && <span className="cui-label">{kicker}</span>}
      {title && <span className="cui-empty__t">{title}</span>}
      {body && <span className="cui-empty__b">{body}</span>}
      {(cta || children) && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>{cta}{children}</div>}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────
const __cuiToasts = { items: [], subs: new Set() };
function cinaToast(p) {
  if (p == null) return;
  if (typeof p === "string") p = { text: p };
  const kindMap = { ok: "good", success: "good", good: "good", warn: "warn", warning: "warn", error: "bad", bad: "bad", danger: "bad" };
  const t = { id: Date.now() + Math.random(), kind: kindMap[p.kind] || "info", title: p.title, text: p.text || p.message || p.msg || p.body || "", duration: p.duration || 3600 };
  if (!t.title && !t.text) return;
  __cuiToasts.items = [...__cuiToasts.items.slice(-3), t];
  __cuiToasts.subs.forEach(fn => fn(__cuiToasts.items));
  setTimeout(() => { __cuiToasts.items = __cuiToasts.items.filter(x => x.id !== t.id); __cuiToasts.subs.forEach(fn => fn(__cuiToasts.items)); }, t.duration);
}
function CinaToastHost() {
  const [items, set] = usUI(__cuiToasts.items);
  ueUI(() => { __cuiToasts.subs.add(set); return () => __cuiToasts.subs.delete(set); }, []);
  return (
    <div className="cui-toasts" role="status" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className="cui-toast" data-kind={t.kind}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {t.title && <div className="cui-label" style={{ marginBottom: 4 }}>{t.title}</div>}
            {t.text}
          </div>
        </div>
      ))}
    </div>
  );
}
(function mountToasts() {
  const go = () => {
    if (document.getElementById("cui-toast-root")) return;
    const host = document.createElement("div"); host.id = "cui-toast-root"; document.body.appendChild(host);
    ReactDOM.createRoot(host).render(<CinaToastHost/>);
  };
  if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
  window.addEventListener("cina:toast", (e) => cinaToast(e.detail));
})();

// ── Tour ──────────────────────────────────────────────────────────────
// One engine. Steps: { target?: selector, title, body, kicker?, onEnter?() }.
// Only one tour runs at a time; `id` + once marks it seen in localStorage.
const cinaTours = {
  active: null,
  seen: (id) => { try { return localStorage.getItem("cina:tour:" + id) === "1"; } catch (e) { return false; } },
  markSeen: (id) => { try { localStorage.setItem("cina:tour:" + id, "1"); } catch (e) {} },
  reset: (id) => { try { localStorage.removeItem("cina:tour:" + id); } catch (e) {} },
};
function CinaTour({ id, steps, start = 0, once = false, onDone, onStep }) {
  const [i, setI] = usUI(start);
  const [rect, setRect] = usUI(null);
  const [blocked, setBlocked] = usUI(() => (once && cinaTours.seen(id)) || (cinaTours.active && cinaTours.active !== id));
  const step = steps && steps[i];
  const finish = () => { cinaTours.markSeen(id); if (cinaTours.active === id) cinaTours.active = null; onDone && onDone(); };
  ueUI(() => { if (blocked) { onDone && onDone(); return; } cinaTours.active = id; return () => { if (cinaTours.active === id) cinaTours.active = null; }; }, []);
  ueUI(() => {
    if (blocked || !step) return;
    step.onEnter && step.onEnter();
    onStep && onStep(i);
    let raf, tries = 0;
    const measure = () => {
      const el = step.target && document.querySelector(step.target);
      if (el) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) { setRect(r); return; } }
      if (step.target && tries++ < 30) raf = requestAnimationFrame(measure); else setRect(null);
    };
    raf = requestAnimationFrame(measure);
    const onR = () => measure();
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, [i, blocked]);
  ueUI(() => {
    if (blocked) return;
    const h = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); finish(); }
      else if (e.key === "ArrowRight") { e.stopPropagation(); next(); }
      else if (e.key === "ArrowLeft") { e.stopPropagation(); setI(x => Math.max(0, x - 1)); }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  });
  if (blocked || !step) return null;
  const next = () => (i + 1 < steps.length ? setI(i + 1) : finish());
  const W = Math.min(340, window.innerWidth - 32), H = 210, G = 14, vw = window.innerWidth, vh = window.innerHeight;
  let pos = { left: vw / 2 - W / 2, top: vh / 2 - H / 2 };
  if (rect) {
    const below = rect.bottom + G + H < vh, right = rect.right + G + W < vw, left = rect.left - G - W > 0;
    if (below) pos = { left: rect.left + rect.width / 2 - W / 2, top: rect.bottom + G };
    else if (right) pos = { left: rect.right + G, top: rect.top + rect.height / 2 - H / 2 };
    else if (left) pos = { left: rect.left - G - W, top: rect.top + rect.height / 2 - H / 2 };
    else pos = { left: rect.left + rect.width / 2 - W / 2, top: Math.max(16, rect.top - G - H) };
    pos.left = Math.max(16, Math.min(vw - W - 16, pos.left)); pos.top = Math.max(16, Math.min(vh - H - 16, pos.top));
  }
  return ReactDOM.createPortal(
    <div className="cui-tour">
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "auto" }} onClick={next}>
        <defs><mask id={"cui-tour-mask-" + id}><rect width="100%" height="100%" fill="white"/>{rect && <rect x={rect.left - 6} y={rect.top - 6} width={rect.width + 12} height={rect.height + 12} rx="8" fill="black"/>}</mask></defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,.66)" mask={`url(#cui-tour-mask-${id})`}/>
        {rect && <rect x={rect.left - 6} y={rect.top - 6} width={rect.width + 12} height={rect.height + 12} rx="8" fill="none" stroke="var(--c-amber)" strokeWidth="1.5"/>}
      </svg>
      <div className="cui-tour__card" style={pos} role="dialog" aria-label={step.title}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span className="cui-label" style={{ color: "var(--c-amber)" }}>{step.kicker || `Step ${i + 1} of ${steps.length}`}</span>
          <button onClick={finish} style={{ background: "none", border: "none", color: "var(--c-ink-3)", fontSize: "var(--fs-label)", cursor: "pointer", padding: 0 }}>Skip tour</button>
        </div>
        <div className="cui-title">{step.title}</div>
        <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)" }}>{step.body}</div>
        <div className="cui-tour__bar">{steps.map((_, k) => <span key={k} data-on={k <= i ? "1" : "0"}></span>)}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
          {i > 0 && <button className="cui-btn" onClick={() => setI(i - 1)}>Back</button>}
          <button className="cui-btn cui-btn--primary" onClick={next}>{i + 1 < steps.length ? "Next" : "Done"}</button>
        </div>
      </div>
    </div>, document.body);
}

const CinaIcon = (props) => <Icon {...props}/>;

Object.assign(window, { CinaModal, CinaSheet, CinaStat, CinaPill, CinaTabs, CinaEmpty, CinaTour, cinaToast, toast: cinaToast });
