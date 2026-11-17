// overlays.jsx — Global Lightbox + Toast primitives.
// Usage:
//   const lb = useLightbox();    lb.open({ title, subtitle, items: [{thumb, label, meta}], index });
//   const toast = useToast();    toast.push({ kind: 'ok'|'info'|'warn', title, message, agent });
// Both providers are mounted by Shell at the root.

const { createContext: createCtxOv, useContext: useCtxOv,
        useState: useStateOv, useEffect: useEffectOv,
        useCallback: useCbOv, useRef: useRefOv } = React;

// ─────────────────────────── LIGHTBOX

const LightboxCtx = createCtxOv(null);

function LightboxProvider({ children }) {
  const [state, setState] = useStateOv(null);
  // state shape: { title, subtitle, items, index, kind }

  const open  = useCbOv((cfg) => setState({ index: 0, ...cfg }), []);
  const close = useCbOv(() => setState(null), []);
  const next  = useCbOv(() => setState(s => s && ({ ...s, index: Math.min(s.items.length - 1, s.index + 1) })), []);
  const prev  = useCbOv(() => setState(s => s && ({ ...s, index: Math.max(0, s.index - 1) })), []);

  useEffectOv(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === "Escape")     close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close, next, prev]);

  return (
    <LightboxCtx.Provider value={{ open, close, next, prev }}>
      {children}
      {state && <Lightbox {...state} onClose={close} onNext={next} onPrev={prev}/>}
    </LightboxCtx.Provider>
  );
}

function useLightbox() { return useCtxOv(LightboxCtx); }

function Lightbox({ title, subtitle, items, index: initIndex, kind = "frame", onClose, onNext, onPrev }) {
  const [idx, setIdx] = useStateOv(initIndex);
  useEffectOv(() => setIdx(initIndex), [initIndex]);

  // Keep arrow keys in sync with local idx
  useEffectOv(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIdx(i => Math.min(items.length - 1, i + 1));
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  const item = items[idx];
  const hasMany = items.length > 1;
  const goNext = () => setIdx(i => Math.min(items.length - 1, i + 1));
  const goPrev = () => setIdx(i => Math.max(0, i - 1));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,.86)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", flexDirection: "column",
        animation: "lb-in .18s ease-out",
      }}
    >
      <style>{`
        @keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lb-stage { from { transform: scale(.97); opacity: .4; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Top bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex", alignItems: "center",
          padding: "16px 24px", gap: 16,
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-label" style={{ color: "var(--c-amber)", marginBottom: 4 }}>{subtitle}</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.2 }}>
            {title}
          </div>
        </div>
        <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", letterSpacing: ".08em" }}>
          {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <button
          onClick={onClose}
          style={{
            width: 32, height: 32, padding: 0, justifyContent: "center",
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "var(--r-2)", color: tkc("white"),
          }}
          className="btn"
          title="Close (esc)"
          aria-label="Close">
          <Icon name="x" size={13}/>
        </button>
      </div>

      {/* Stage */}
      <div
        onClick={onClose}
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 80px",
          minHeight: 0, position: "relative",
        }}
      >
        {hasMany && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            disabled={idx === 0}
            style={{
              position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, padding: 0, justifyContent: "center",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "50%", color: tkc("white"),
              opacity: idx === 0 ? 0.3 : 1,
            }}
            className="btn"
          >
            <span style={{ transform: "rotate(180deg)" }}><Icon name="chev-r" size={14}/></span>
          </button>
        )}

        <div
          key={idx}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "min(1200px, 86vw)",
            height: "min(78vh, calc(min(1200px, 86vw) * " + (kind === "portrait" ? "4 / 3" : "9 / 16") + "))",
            aspectRatio: kind === "portrait" ? "3/4" : "16/9",
            background: tkc("black"),
            border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 40px 100px rgba(0,0,0,.7)",
            animation: "lb-stage .22s cubic-bezier(.2,.8,.2,1)",
            overflow: "hidden",
          }}
        >
          {item.render ? item.render() : <FrameThumb kind={item.thumb}/>}

          {/* Burnt-in metadata corners */}
          {item.tcIn && (
            <div className="t-mono" style={{
              position: "absolute", top: 12, left: 14,
              fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", letterSpacing: ".08em",
            }}>
              ● REC · {item.tcIn} → {item.tcOut}
            </div>
          )}
          {item.seed && (
            <div className="t-mono" style={{
              position: "absolute", bottom: 12, right: 14,
              fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", letterSpacing: ".08em",
            }}>
              SEED {item.seed} · {item.aspect || "1.85"} · 24fps
            </div>
          )}
          {item.label && (
            <div style={{
              position: "absolute", left: 14, bottom: 12,
              padding: "4px 8px", background: "rgba(0,0,0,.55)",
              border: "0.5px solid rgba(255,255,255,.12)", borderRadius: "var(--r-1)",
              fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
              color: "rgba(255,255,255,.85)", letterSpacing: ".08em",
            }}>{item.label}</div>
          )}
        </div>

        {hasMany && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            disabled={idx === items.length - 1}
            style={{
              position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, padding: 0, justifyContent: "center",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "50%", color: tkc("white"),
              opacity: idx === items.length - 1 ? 0.3 : 1,
            }}
            className="btn"
          >
            <Icon name="chev-r" size={14}/>
          </button>
        )}
      </div>

      {/* Filmstrip */}
      {hasMany && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex", gap: 4, padding: "12px 24px 20px",
            overflowX: "auto", justifyContent: "center",
          }}
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              style={{
                flex: "0 0 auto", width: 88, aspectRatio: kind === "portrait" ? "3/4" : "16/9",
                padding: 0, position: "relative", overflow: "hidden",
                background: "var(--c-panel-2)",
                border: i === idx ? "1.5px solid var(--c-amber)" : "1px solid rgba(255,255,255,.08)",
                borderRadius: "var(--r-1)", opacity: i === idx ? 1 : 0.55,
                transition: "opacity .15s ease",
              }}
            >
              {it.render ? it.render() : <FrameThumb kind={it.thumb}/>}
              {it.label && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "2px 4px", background: "rgba(0,0,0,.6)",
                  fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
                  color: i === idx ? "var(--c-amber)" : "rgba(255,255,255,.7)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{it.label}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── TOAST

const ToastCtx = createCtxOv(null);

function ToastProvider({ children }) {
  return <ToastCtx.Provider value={{ push: cinaToast }}>{children}</ToastCtx.Provider>;
}

function useToast() { return useCtxOv(ToastCtx); }

function Toast({ kind = "info", title, message, agent }) {
  const accent = kind === "ok"   ? "var(--c-good)"
               : kind === "warn" ? "var(--c-warn)"
               : kind === "rec"  ? "var(--c-blood-l)"
               :                    "var(--c-amber)";
  return (
    <div style={{
      pointerEvents: "auto",
      minWidth: 280, maxWidth: 360,
      background: "var(--c-panel-2)",
      border: "1px solid var(--c-line-2)",
      borderLeft: `2px solid ${accent}`,
      borderRadius: "var(--r-2)",
      padding: "10px 14px 11px",
      boxShadow: "0 16px 50px rgba(0,0,0,.55)",
      display: "flex", gap: 10,
      animation: "toast-in .22s cubic-bezier(.2,.8,.2,1)",
    }}>
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      {agent ? <AgentBadge agent={agent} size={18}/> : (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: accent, marginTop: 6, flexShrink: 0,
          boxShadow: `0 0 8px ${accent}`,
        }}/>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="t-display" style={{ fontSize: "var(--fs-body)", fontStyle: "italic", color: accent, fontWeight: 500 }}>
            {title}
          </span>
        </div>
        {message && (
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45, marginTop: 2, textWrap: "pretty" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LightboxProvider, useLightbox, ToastProvider, useToast });
