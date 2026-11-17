// cina-autopilot.jsx — Continuous AI improvement view for the studio.
//
// Shows the user the agents are *always running* in the background:
// - Refining shot prompts based on what gets approved
// - Watching audience analytics for monetization opportunities
// - Triaging bug reports & UX comments from the public watch site
// - Proposing new features they think would help
// - Auto-fixing detected workflow bottlenecks
//
// Three-column layout:
//   LEFT   Live agent ticker — what's happening right now
//   CENTER Proposals queue (the user accepts/rejects)
//   RIGHT  Health gauges (model performance, render quality, $$$)
//
// Style: matches the studio's calmer panels. Amber only on actionable items.

const { useState: usAp, useEffect: ueAp, useRef: urAp } = React;

// ─── Synthetic agent activity ────────────────────────────────────────────

const AUTOPILOT_AGENTS = [
  { id: "writer",   name: "Writer",       color: tkc("warn"), short: "WR" },
  { id: "director", name: "Director",     color: tkc("amber-d"), short: "DR" },
  { id: "visual",   name: "Visual",       color: tkc("cat-1"), short: "VS" },
  { id: "editor",   name: "Editor",       color: tkc("cat-2"), short: "ED" },
  { id: "audio",    name: "Audio",        color: tkc("good"), short: "AU" },
  { id: "research", name: "Research",     color: tkc("ink-2"), short: "RS" },
  { id: "ops",      name: "Ops",          color: tkc("ink-3"), short: "OP" },
  { id: "money",    name: "Monetization", color: tkc("warn"), short: "MN" },
];

const AUTOPILOT_ACTIVITY = [
  { agent: "visual",   action: "tuned",      target: "Veo3 prompt template · 'darkroom interior'",  delta: "+8.4% approval rate over 12 generations" },
  { agent: "money",    action: "found",      target: "ad-yield opportunity in Episode 5 act break", delta: "+$0.42 CPM if midroll moved 14s earlier" },
  { agent: "ops",      action: "auto-fixed", target: "stuck render queue (3 jobs)",                 delta: "5 minutes saved · retried with fallback model" },
  { agent: "research", action: "noticed",    target: "audience drop-off at 02:14 in The Fence ep3", delta: "consider tightening 8s of hallway walk" },
  { agent: "editor",   action: "drafted",    target: "shorter cut for TikTok promo (47s)",          delta: "ready for review · 3 options" },
  { agent: "writer",   action: "improved",   target: "Cina suggestion model on dialogue scenes",    delta: "+12% acceptance vs last week" },
  { agent: "director", action: "flagged",    target: "Shot 14B continuity with 14C",                delta: "different lens? check before approve" },
  { agent: "money",    action: "drafted",    target: "sponsor pitch · Aesop for The Swallows S2",   delta: "$48K projected · matches creator brand" },
  { agent: "ops",      action: "triaged",    target: "23 viewer comments on Last Light Ep5",        delta: "1 bug · 3 feature reqs · 19 reactions" },
  { agent: "audio",    action: "balanced",   target: "dialogue mix on Ep5 02:40–03:12",             delta: "lifted dialogue +2dB · tamed wind bed" },
  { agent: "visual",   action: "learned",    target: "your color preference: warmer mids",          delta: "applied to next 8 generations automatically" },
  { agent: "research", action: "found",      target: "similar films trending on Letterboxd",        delta: "Stalker, In Search of Darkness, Pickpocket" },
];

const AUTOPILOT_PROPOSALS = [
  {
    id: "p1",
    title: "Reduce regenerations: introduce style memory",
    by: "visual",
    impact: "save ~$240 in compute / week",
    body: "I'm noticing you regenerate shots 2-3x to nudge color. I can store your accepted-shot lookup table and apply it as a pre-prompt on every generation. ~28% fewer regens.",
    cost: "1 click. Stored in your Bible · Visual.",
    cta: "Enable style memory",
    kind: "tool",
  },
  {
    id: "p2",
    title: "Monetization: 'first 24h holders only' premiere",
    by: "money",
    impact: "+$8.4K projected for Last Light finale",
    body: "Holders unlock 24h before public. Drives mints AND drives wallet creation in subscribers (we see 14% conversion in similar drops).",
    cost: "Set premiere window in Series → Schedule.",
    cta: "Schedule premiere",
    kind: "money",
  },
  {
    id: "p3",
    title: "Auto-fix: 6 viewers reported subtitle desync",
    by: "ops",
    impact: "fixes a recurring bug",
    body: "Captions drift on Ep3 after a re-encode. I generated corrected SRT and verified against waveform. Ready to push.",
    cost: "Replaces existing subtitle track. Reversible.",
    cta: "Push fix",
    kind: "fix",
  },
  {
    id: "p4",
    title: "New feature: Shot-grade presets, learned from your work",
    by: "editor",
    impact: "saves ~30 min on every new film",
    body: "I've watched your last 4 grades. Three recurring looks: 'darkroom warm', 'cold morning', 'safelight glow'. I can save these as one-click LUTs.",
    cost: "Adds 3 entries to Editor → Color presets.",
    cta: "Save presets",
    kind: "tool",
  },
  {
    id: "p5",
    title: "Audience finding: subscribers want a behind-scenes",
    by: "research",
    impact: "+18% engagement in last 4 BTS posts on Cina",
    body: "Top comment theme on Last Light: 'how did you make the safelight scene'. A 4-min BTS would map well to your existing dailies footage.",
    cost: "I can draft a cut from your dailies. Review then publish.",
    cta: "Draft BTS cut",
    kind: "content",
  },
];

const AUTOPILOT_HEALTH = [
  { label: "Model approval rate",   v: 0.71, sub: "+4.2% wk", good: true },
  { label: "Avg regens per shot",   v: 0.28, sub: "1.4 → 1.1", good: true },
  { label: "Render queue latency",  v: 0.62, sub: "3.2 min avg" },
  { label: "Story coherence score", v: 0.84, sub: "Ep5 strongest yet", good: true },
  { label: "Audience retention",    v: 0.58, sub: "drop @ 02:14" },
  { label: "Monetization yield",    v: 0.91, sub: "+$640 vs forecast", good: true },
];

// ─── Live ticker ─────────────────────────────────────────────────────────

function ActivityTicker() {
  const [items, setItems] = usAp(AUTOPILOT_ACTIVITY.slice(0, 8));
  const seenRef = urAp(0);

  ueAp(() => {
    const i = setInterval(() => {
      seenRef.current = (seenRef.current + 1) % AUTOPILOT_ACTIVITY.length;
      const next = AUTOPILOT_ACTIVITY[seenRef.current];
      setItems(prev => [next, ...prev].slice(0, 8));
    }, 5200);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {items.map((it, i) => {
        const a = AUTOPILOT_AGENTS.find(x => x.id === it.agent);
        return (
          <div key={`${it.agent}-${i}-${it.target}`} style={{
            display: "flex", gap: 12,
            padding: "12px 0",
            borderBottom: i === items.length - 1 ? "none" : "1px solid var(--c-line)",
            opacity: i === 0 ? 1 : Math.max(0.45, 1 - i * 0.07),
            transition: "opacity .3s",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "var(--r-2)",
              background: a?.color, color: tkc("bg"),
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 2, letterSpacing: ".08em",
            }}>{a?.short}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4 }}>
                <span style={{ color: "var(--c-ink)" }}>{a?.name}</span>{" "}
                <span style={{ color: "var(--c-ink-3)" }}>{it.action}</span>{" "}
                <span style={{ color: "var(--c-ink-2)" }}>{it.target}</span>
              </div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 4 }}>
                {it.delta}
              </div>
            </div>
            {i === 0 && (
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--c-amber)", flexShrink: 0, marginTop: 8,
                animation: "ap-pulse 1.6s ease-in-out infinite",
              }}/>
            )}
          </div>
        );
      })}
      <style>{`@keyframes ap-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }`}</style>
    </div>
  );
}

// ─── Proposal card ───────────────────────────────────────────────────────

function ProposalCard({ p, onApply, onDismiss }) {
  const a = AUTOPILOT_AGENTS.find(x => x.id === p.by);
  const kindLabel = {
    tool: "TOOL IMPROVEMENT",
    money: "MONETIZATION",
    fix: "BUG FIX",
    content: "AUDIENCE",
  }[p.kind] || "PROPOSAL";

  return (
    <div style={{
      border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)",
      padding: 18,
      background: "var(--c-panel)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 18, height: 18, borderRadius: "var(--r-1)",
          background: a?.color, color: tkc("bg"),
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, letterSpacing: ".08em",
        }}>{a?.short}</div>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
          {kindLabel}
        </span>
        <span style={{ flex: 1 }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
          {p.impact}
        </span>
      </div>

      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.2, color: "var(--c-ink)", marginBottom: 8 }}>
        {p.title}
      </div>

      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "0 0 10px" }}>
        {p.body}
      </p>

      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginBottom: 16 }}>
        cost: {p.cost}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-primary"
          onClick={() => onApply(p)}
          style={{ height: 30, padding: "0 14px", fontSize: "var(--fs-body)" }}
        >{p.cta}</button>
        <button
          className="btn-ghost"
          onClick={() => onDismiss(p)}
          style={{ height: 30, padding: "0 12px", fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}
        >Dismiss</button>
      </div>
    </div>
  );
}

// ─── Health gauge ────────────────────────────────────────────────────────

function HealthGauge({ label, v, sub, good }) {
  return (
    <div style={{
      padding: "16px 0",
      borderBottom: "1px solid var(--c-line)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{label}</span>
        <span className="t-mono" style={{
          fontSize: "var(--fs-label)", color: good ? "var(--c-good)" : "var(--c-ink-3)",
          letterSpacing: ".08em",
        }}>{Math.round(v * 100)}%</span>
      </div>
      <div style={{ height: 3, background: "var(--c-panel-3)", borderRadius: "var(--r-1)", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${v * 100}%`,
          background: good ? "var(--c-good)" :  "var(--c-amber)",
          transition: "width .4s",
        }}/>
      </div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 6 }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────

function AutopilotView() {
  const [proposals, setProposals] = usAp(AUTOPILOT_PROPOSALS);
  const [enabled, setEnabled] = usAp(true);

  const handleApply = (p) => {
    setProposals(prev => prev.filter(x => x.id !== p.id));
    window.toast?.({ title: "APPLIED", text: p.cta, kind: "good" });
  };
  const handleDismiss = (p) => {
    setProposals(prev => prev.filter(x => x.id !== p.id));
    window.toast?.({ title: "DISMISSED", text: "I'll learn from this." });
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      overflow: "auto", background: "var(--c-bg)",
      paddingTop: 56, // header
    }}>
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "32px 32px 80px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h1 className="t-display" style={{
                fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400,
                margin: 0, letterSpacing: "-0.02em", color: "var(--c-ink)",
              }}>Autopilot</h1>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: enabled ? "var(--c-good)" : "var(--c-ink-4)",
                animation: enabled ? "ap-pulse 2s ease-in-out infinite" : "none",
              }}/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: enabled ? "var(--c-good)" : "var(--c-ink-4)", letterSpacing: ".16em" }}>
                {enabled ? "RUNNING" : "PAUSED"}
              </span>
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", maxWidth: 640 }}>
              Your AI crew runs while you sleep — refining tools from your accepted shots,
              flagging bugs viewers report, finding monetization, drafting features they think you'll want.
              They never act without asking.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setEnabled(e => !e)}
              className="btn"
              style={{ height: 32, padding: "0 14px", fontSize: "var(--fs-body)" }}
            >
              {enabled ? "Pause" : "Resume"} autopilot
            </button>
          </div>
        </div>

        {/* THREE COLUMNS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "0.95fr 1.4fr 0.85fr",
          gap: 32,
          alignItems: "flex-start",
        }}>

          {/* LIVE TICKER */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>LIVE · LAST 24H</div>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>147 actions</span>
            </div>
            <div style={{ borderTop: "1px solid var(--c-line)" }}>
              <ActivityTicker/>
            </div>
            <button
              className="btn-ghost"
              onClick={() => window.toast?.({ title: "ACTIVITY LOG", text: "Full log opens in a new pane" })}
              style={{ marginTop: 14, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", padding: 0, height: "auto", justifyContent: "flex-start" }}
            >View full log →</button>
          </div>

          {/* PROPOSALS */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
                AWAITING YOUR REVIEW · {proposals.length}
              </div>
              {proposals.length > 0 && (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    proposals.forEach(p => window.toast?.({ title: "APPLIED", text: p.cta, kind: "good" }));
                    setProposals([]);
                  }}
                  style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", padding: 0, height: "auto" }}
                >Apply all →</button>
              )}
            </div>

            {proposals.length === 0 ? (
              <div style={{
                border: "1px dashed var(--c-line)", borderRadius: "var(--r-2)",
                padding: "44px 20px", textAlign: "center",
                color: "var(--c-ink-3)", fontSize: "var(--fs-body)",
              }}>
                Nothing to review. Your crew is working — fresh proposals appear as they're ready.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {proposals.map(p => (
                  <ProposalCard key={p.id} p={p} onApply={handleApply} onDismiss={handleDismiss}/>
                ))}
              </div>
            )}
          </div>

          {/* HEALTH GAUGES */}
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 14 }}>
              SYSTEM HEALTH
            </div>
            <div style={{ borderTop: "1px solid var(--c-line)" }}>
              {AUTOPILOT_HEALTH.map(h => <HealthGauge key={h.label} {...h}/>)}
            </div>

            {/* Bottom: agent crew snapshot */}
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", margin: "32px 0 14px" }}>
              CREW
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {AUTOPILOT_AGENTS.map(a => (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px",
                  border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "var(--r-1)",
                    background: a.color, flexShrink: 0,
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("bg"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    letterSpacing: ".08em",
                  }}>{a.short}</div>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{a.name}</span>
                  <span style={{ flex: 1 }}/>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "var(--c-good)",
                    animation: "ap-pulse 2.4s ease-in-out infinite",
                    animationDelay: `${a.id.charCodeAt(0) * 0.07}s`,
                  }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AutopilotView });
