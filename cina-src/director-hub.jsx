// director-hub.jsx — Director hub: chat at center + Status rail + Pulse rail.
// Wraps ChatPanel with at-a-glance project state on either side.
// Fully responsive: rails collapse below the chat on tablet, hide on phone
// (their actions live in the nav + command palette). Fluid type via clamp().

const { useState: useStateDH, useEffect: useEffectDH } = React;

// One-time responsive stylesheet for the hub.
if (typeof document !== "undefined" && !document.getElementById("dh-css")) {
  const s = document.createElement("style"); s.id = "dh-css";
  s.textContent = `
  .dh-wrap { display: flex; height: 100%; min-height: 0; }
  .dh-center { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .dh-rail {
    flex-shrink: 0; overflow-y: auto; padding: clamp(14px, 1.6vw, 22px) clamp(12px, 1.2vw, 18px);
    display: flex; flex-direction: column; gap: clamp(16px, 2vw, 26px);
  }
  .dh-rail--left  { width: clamp(200px, 16vw, 260px); border-right: 1px solid var(--c-line); }
  .dh-rail--right { width: clamp(210px, 17vw, 280px); border-left: 1px solid var(--c-line); }
  .dh-card {
    padding: clamp(9px, 1vw, 12px) clamp(10px, 1.1vw, 13px);
    border: 1px solid var(--c-line); border-radius: 12px; background: transparent;
    text-align: left; cursor: pointer; color: inherit; width: 100%;
    transition: border-color .14s ease, color .14s ease, background .14s ease;
  }
  .dh-card:hover { border-color: var(--c-amber); }
  .dh-label { font-size: clamp(8.5px, .62vw, 9.5px); color: var(--c-ink-4); letter-spacing: .22em; }
  /* Tablet: fold the rails under the chat as horizontal scrollers */
  @media (max-width: 880px) {
    .dh-wrap { flex-direction: column; overflow-y: auto; }
    .dh-center { order: -1; min-height: 62vh; }
    .dh-rail { width: auto; border: none; border-top: 1px solid var(--c-line);
      flex-direction: row; gap: 14px; overflow-x: auto; }
    .dh-rail > div { min-width: 240px; flex-shrink: 0; }
  }
  /* Phone: chat only — rail actions live in nav + ⌘K */
  @media (max-width: 680px) {
    .dh-rail { display: none; }
  }`;
  document.head.appendChild(s);
}

// Pull the freshest pipeline numbers if the bridge is present; else sensible defaults.
function livePipeline(kind) {
  try {
    if (window.CinaPipeline && window.CinaPipeline.snapshot) {
      const s = window.CinaPipeline.snapshot(kind);
      if (s && s.stages) return s;
    }
  } catch {}
  return null;
}

function StatusRail({ kind = "movie" }) {
  const STAGES = {
    movie: [
      { label: "Script",   pct: 86, note: "Act 3 in revision",     view: "script"   },
      { label: "Board",    pct: 72, note: "12 of 18 shots locked", view: "board"    },
      { label: "Generate", pct: 54, note: "26 renders queued",     view: "generate" },
      { label: "Editor",   pct: 31, note: "Rough cut · 22 min",     view: "editor"   },
    ],
    series: [
      { label: "Writers' room", pct: 74, note: "Ep 3 of 8 drafted",   view: "script"   },
      { label: "Episodes",      pct: 38, note: "2 of 8 locked",       view: "episodes" },
      { label: "Board",         pct: 60, note: "Ep 1–2 boarded",       view: "board"    },
      { label: "Generate",      pct: 42, note: "Ep 1 rendering",      view: "generate" },
    ],
    branched: [
      { label: "Spine",    pct: 82, note: "Locked · 1h 30m",          view: "script"   },
      { label: "Forks",    pct: 66, note: "4 forks · 18 cuts",        view: "branch"   },
      { label: "Board",    pct: 54, note: "Fork A–C boarded",         view: "board"    },
      { label: "Generate", pct: 40, note: "Branch renders queued",   view: "generate" },
    ],
  };
  const stages = (livePipeline(kind) || {}).stages || STAGES[kind] || STAGES.movie;

  // DIR 6 — context-aware suggestions derived from the lowest-progress stage
  // and any queued renders, so the cards reflect real state, not fixed copy.
  const suggestions = React.useMemo(() => {
    const out = [];
    const behind = [...stages].sort((a, b) => a.pct - b.pct)[0];
    if (behind) out.push({ text: `${behind.label} is furthest behind at ${behind.pct}% — want me to push it?`, view: behind.view });
    const gen = stages.find(s => /generate/i.test(s.label));
    if (gen) out.push({ text: `Approve the finished takes in the render queue.`, view: "generate" });
    out.push({ text: `Tighten the pacing on the latest cut — pull two beats.`, view: "editor" });
    return out;
  }, [stages]);

  const fmt = (window.CINA_FORMATS || {})[kind] || { tag: "FILM" };
  return (
    <aside className="dh-rail dh-rail--left">
      <div>
        <div className="t-mono dh-label" style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{fmt.tag} · WORKFLOW</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stages.map(s => (
            <button key={s.label} className="dh-card" style={{ border: "none", padding: "6px 0" }}
              onClick={() => window.dispatchEvent(new CustomEvent("cina:setView", { detail: s.view }))}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontSize: "clamp(12px, .9vw, 13px)", color: "var(--c-ink)" }}>{s.label}</span>
                <span className="t-mono" style={{ fontSize: "clamp(9.5px, .7vw, 10.5px)", color: "var(--c-ink-3)" }}>{s.pct}%</span>
              </div>
              <div style={{ height: 2, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden", margin: "6px 0" }}>
                <div style={{ width: `${s.pct}%`, height: "100%", background: "var(--c-amber)", opacity: .8 }}/>
              </div>
              <span style={{ fontSize: "clamp(10.5px, .8vw, 11px)", color: "var(--c-ink-3)" }}>{s.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="t-mono dh-label" style={{ marginBottom: 12 }}>FROM CINA TODAY</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {suggestions.map((s, i) => (
            <button key={i} className="dh-card"
              onClick={() => { if (s.view) window.dispatchEvent(new CustomEvent("cina:setView", { detail: s.view })); window.dispatchEvent(new CustomEvent("cina:promptSend", { detail: s.text })); }}
              style={{ fontSize: "clamp(11.5px, .85vw, 12px)", lineHeight: 1.45, color: "var(--c-ink-2)", fontFamily: "var(--f-display)", fontStyle: "italic" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--c-ink)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--c-ink-2)"}
            >{s.text}</button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function PulseRail() {
  const renders = [
    { ttl: "Shot 14 · take 3", status: "DONE",     time: "2m" },
    { ttl: "Shot 09 · take 2", status: "DONE",     time: "8m" },
    { ttl: "Shot 21 · take 1", status: "RENDER",   time: "now", pct: 64 },
    { ttl: "Shot 22 · take 1", status: "QUEUED",   time: "—" },
  ];
  const comments = [
    { who: "@quietframe",   text: "The amber wash in shot 14 is doing it.",       on: "Last Light" },
    { who: "@nightcaller",  text: "Need that diner scene as a poster.",            on: "Last Light" },
    { who: "@kerosene",     text: "Pacing in act 2 felt off — could trim.",        on: "Last Light" },
  ];
  return (
    <aside className="dh-rail dh-rail--right">
      <div>
        <div className="t-mono dh-label" style={{ marginBottom: 12 }}>RENDER QUEUE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {renders.map((r, i) => (
            <button key={i} className="dh-card" style={{ display: "flex", flexDirection: "column", gap: 6 }}
              onClick={() => window.dispatchEvent(new CustomEvent("cina:setView", { detail: "generate" }))}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "clamp(11.5px, .85vw, 12px)", color: "var(--c-ink)" }}>{r.ttl}</span>
                <span className="t-mono" style={{
                  fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  color: r.status === "DONE" ? "var(--c-good)" : r.status === "RENDER" ? "var(--c-amber)" : "var(--c-ink-3)",
                }}>{r.status}</span>
              </div>
              {r.pct != null ? (
                <div style={{ height: 2, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: "var(--c-amber)" }}/>
                </div>
              ) : (
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{r.time}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="t-mono dh-label" style={{ marginBottom: 12 }}>FROM YOUR AUDIENCE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {comments.map((c, i) => (
            <button key={i}
              onClick={() => window.dispatchEvent(new CustomEvent("cina:setView", { detail: "memory" }))}
              style={{ background: "transparent", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: "inherit" }}>
              <div style={{ fontSize: "clamp(11.5px, .85vw, 12px)", lineHeight: 1.5, color: "var(--c-ink-2)", marginBottom: 4, fontStyle: "italic", fontFamily: "var(--f-display)" }}>
                "{c.text}"
              </div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>
                {c.who} · {c.on}
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function DirectorHub({ kind = "movie" }) {
  const [sub, setSub] = useStateDH("room");
  useEffectDH(() => {
    const onSub = (e) => {
      if (e.detail && e.detail.view === "chat" && e.detail.sub) {
        setSub(e.detail.sub);
      }
    };
    window.addEventListener("cina:studioSubTab", onSub);
    return () => window.removeEventListener("cina:studioSubTab", onSub);
  }, []);

  const TABS = [
    { id: "room", label: "Writers' Room · Gemini" },
    { id: "live", label: "Live Voice Rehearsal" },
    { id: "vault", label: "Cloud Slate Vault" },
  ];

  const AI = window.CinaStudioAI || {};

  return (
    <div className="dh-wrap">
      <StatusRail kind={kind}/>
      <div className="dh-center">
        <div role="tablist" style={{ display: "flex", borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)", padding: "0 1.2rem", flexShrink: 0 }}>
          {TABS.map(t => {
            const on = sub === t.id;
            return (
              <button key={t.id} role="tab" aria-selected={on} onClick={() => setSub(t.id)} style={{
                padding: "0.7rem 1rem", background: "transparent", border: "none",
                borderBottom: on ? "2px solid var(--c-amber)" : "2px solid transparent",
                borderRadius: 0, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".12em",
                textTransform: "uppercase", color: on ? "var(--c-amber)" : "var(--c-ink-3)", fontWeight: on ? 700 : 500,
              }}>{t.label}</button>
            );
          })}
        </div>
        {sub === "room" && <ChatPanel/>}
        {sub === "live" && (AI.StudioLiveRehearsal ? <AI.StudioLiveRehearsal/> : <ChatPanel/>)}
        {sub === "vault" && (AI.StudioCloudVault ? <AI.StudioCloudVault/> : <ChatPanel/>)}
      </div>
      <PulseRail/>
    </div>
  );
}

Object.assign(window, { DirectorHub });
