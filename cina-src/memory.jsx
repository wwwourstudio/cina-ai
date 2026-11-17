// memory.jsx — Cina Memory: the AI's growing model of the director's taste.
// Confidence meter, taste dimensions, learned traits log, calibration loop.

const { useState: usMm, useEffect: usMmE, useMemo: usMmM } = React;

// ─── Data ─────────────────────────────────────────────────────────────────

const MEMORY_DATA = {
  overall: 73,             // % confidence
  projectsAnalyzed: 4,
  hoursIngested: 142,
  notesIngested: 318,
  cutsObserved: 1247,
  trend: [12, 18, 24, 31, 38, 44, 51, 58, 64, 67, 70, 73],

  dimensions: [
    {
      id: "pacing",
      name: "Pacing",
      pct: 84,
      tag: "Cuts 0.3s before instinct",
      desc: "You consistently trim 8–12 frames earlier than the L-cut. You favor breath over action.",
      examples: ["Last Light · Diner scene", "Ash Hour · Rooftop monologue"],
      delta: +6,
    },
    {
      id: "color",
      name: "Color",
      pct: 91,
      tag: "Amber/teal · low contrast",
      desc: "Warm key, cool fill. You push amber to oklch(.78 .14 70) and pull shadows toward 220° hue.",
      examples: ["The Long Look · entire film", "Last Light · act 2"],
      delta: +3,
    },
    {
      id: "casting",
      name: "Casting",
      pct: 67,
      tag: "Quiet faces · sub-30 dialogue",
      desc: "Leads under 35 with restrained delivery. You skip auditions over 60s of monologue.",
      examples: ["Voss as 'the brother'", "Mara declined for 'Eve'"],
      delta: +12,
    },
    {
      id: "sound",
      name: "Sound",
      pct: 78,
      tag: "Cello + electronics · 60bpm",
      desc: "Single-instrument leads under 70bpm. You reject percussive cues for emotional beats.",
      examples: ["Score · Dawn/resolve", "Score · Confrontation"],
      delta: +9,
    },
    {
      id: "camera",
      name: "Camera",
      pct: 58,
      tag: "Static · low angle · 35mm",
      desc: "Held frames over moves. You use 35mm for interiors, 50mm for closeups, never wider than 28mm.",
      examples: ["Last Light · all interiors"],
      delta: +4,
    },
    {
      id: "dialogue",
      name: "Dialogue",
      pct: 71,
      tag: "≤4 lines · subtext over text",
      desc: "Scenes never exceed four spoken lines. You prefer questions to declarations, 2:1.",
      examples: ["Script · The Fence", "Script · Last Light"],
      delta: +7,
    },
    {
      id: "story",
      name: "Story",
      pct: 62,
      tag: "Quiet endings · no resolution",
      desc: "Three-act structure with the catharsis intentionally withheld. You rewrite finales 3.4× on average.",
      examples: ["Last Light · ending", "The Fence · act 3"],
      delta: +5,
    },
  ],

  recentLearnings: [
    { d: "2 hr ago",   from: "Editor · Last Light",     text: "You cut shot 14 four frames earlier than my suggestion. Logged as pacing preference.", strength: "strong", dim: "pacing" },
    { d: "5 hr ago",   from: "Score · Confrontation",   text: "You rejected the kinetic variant twice in favor of the melancholy one. Avoiding kinetic cues for confrontation beats.", strength: "strong", dim: "sound" },
    { d: "Yesterday",  from: "Generate · Shot 21",      text: "You re-rolled until the angle dropped below eye-line. Updating camera bias to favor low angle for protagonist intros.", strength: "medium", dim: "camera" },
    { d: "Yesterday",  from: "Script · Act 3",          text: "You cut a 6-line monologue down to 2. Tightening dialogue length ceiling.", strength: "medium", dim: "dialogue" },
    { d: "2 days ago", from: "Casting · 'Eve'",         text: "You passed on three auditions over 60 seconds of monologue. Adding pattern: prefer restraint in casting reels.", strength: "strong", dim: "casting" },
    { d: "3 days ago", from: "Editor · Color pass",     text: "You pulled shadows toward 220° in five shots. Color memory updated.", strength: "medium", dim: "color" },
    { d: "4 days ago", from: "Bible · The Long Look",   text: "You marked 'amber wash' as a recurring motif. Linking to color preference.", strength: "weak", dim: "color" },
    { d: "Last week",  from: "Watch · audience react",  text: "Your audience flagged the rooftop scene 14× as a favorite. Reinforcing pacing pattern.", strength: "medium", dim: "pacing" },
  ],

  // What Cina ALMOST learned but is unsure about — needs calibration
  pendingCalibrations: [
    { id: "c1", q: "You skipped 4 of 5 auctions for archival 16mm footage. Should I stop surfacing that format?", confirm: "Stop surfacing 16mm", reject: "Keep showing it", dim: "camera" },
    { id: "c2", q: "Your last three scores opened on a held cello note. Is that a signature, or coincidence?", confirm: "It's a signature", reject: "Just coincidence", dim: "sound" },
    { id: "c3", q: "You haven't written a kiss scene in any of 4 films. Avoidance, or just hasn't come up?", confirm: "I avoid them", reject: "Just hasn't come up", dim: "dialogue" },
  ],

  // Settings
  settings: {
    learning: true,
    influence: 65,           // how much memory shapes Cina's defaults
    exportable: true,
  },
};

// ─── Confidence ring ──────────────────────────────────────────────────────

function ConfidenceRing({ pct, size = 220 }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const cx = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-amber-d)"/>
            <stop offset="100%" stopColor= "var(--c-amber)"/>
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cx} r={r} stroke="var(--c-line)" strokeWidth="2" fill="none"/>
        <circle cx={cx} cy={cx} r={r} stroke="url(#confGrad)" strokeWidth="3" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 10px rgba(var(--accent-rgb),.45))", transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>I KNOW YOU</span>
        <span style={{ fontSize: "var(--fs-display)", fontFamily: "var(--f-display)", fontStyle: "italic", lineHeight: 1, color: "var(--c-ink)" }}>{pct}<span style={{ fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>%</span></span>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 8, fontStyle: "italic", fontFamily: "var(--f-display)" }}>and getting closer</span>
      </div>
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────

function Sparkline_memory({ data, w = 100, h = 24, stroke = "var(--c-amber)" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / rng) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: w, height: h, display: "block" }}>
      <polyline points={pts} stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={h - ((data[data.length-1] - min) / rng) * h} r="2" fill={stroke}/>
    </svg>
  );
}

// ─── Dimension card ───────────────────────────────────────────────────────

function DimensionCard({ dim, expanded, onToggle }) {
  const stroke = dim.pct >= 80 ? "var(--c-good)" : dim.pct >= 60 ? "var(--c-amber)" : "var(--c-ink-3)";
  return (
    <div style={{
      background: "var(--c-panel)",
      border: "1px solid " + (expanded ? "var(--c-amber)" : "var(--c-line)"),
      borderRadius: "var(--r-2)",
      transition: "border-color .14s ease",
    }}>
      <button onClick={onToggle} style={{
        width: "100%", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer",
        textAlign: "left", color: "inherit", display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{dim.name}</span>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", flex: 1 }}>{dim.tag}</span>
          <span className="t-num" style={{ fontSize: "var(--fs-lead)", fontWeight: 600, color: stroke, fontFamily: "var(--f-display)" }}>{dim.pct}<span style={{ fontSize: "var(--fs-label)", opacity: .6 }}>%</span></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>+{dim.delta}</span>
        </div>
        <div style={{ height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden", position: "relative" }}>
          <div style={{
            width: `${dim.pct}%`, height: "100%",
            background: `linear-gradient(90deg, ${stroke}66 0%, ${stroke} 100%)`,
            transition: "width .6s cubic-bezier(.2,.8,.2,1)",
          }}/>
        </div>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--c-line)", paddingTop: 12 }}>
          <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: "0 0 12px" }}>{dim.desc}</p>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>LEARNED FROM</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {dim.examples.map((e, i) => (
              <span key={i} style={{
                fontSize: "var(--fs-label)", padding: "3px 8px",
                background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
                borderRadius: "var(--r-1)", color: "var(--c-ink-2)",
              }}>{e}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calibration card ─────────────────────────────────────────────────────

function CalibrationCard({ cal, onAnswer }) {
  return (
    <div style={{
      padding: 16, background: "var(--c-panel)",
      border: "1px solid var(--c-line)", borderLeft: "3px solid var(--c-amber)",
      borderRadius: "var(--r-2)", display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>CINA WANTS TO ASK</div>
      <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>
        "{cal.q}"
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onAnswer(cal.id, "confirm")} className="btn btn-primary" style={{ flex: 1, height: 32, justifyContent: "center", fontSize: "var(--fs-body)" }}>
          <Icon name="check" size={11}/> {cal.confirm}
        </button>
        <button onClick={() => onAnswer(cal.id, "reject")} className="btn btn-ghost" style={{ flex: 1, height: 32, justifyContent: "center", fontSize: "var(--fs-body)" }}>
          <Icon name="x" size={11}/> {cal.reject}
        </button>
      </div>
    </div>
  );
}

// ─── Recent learning row ──────────────────────────────────────────────────

function LearningRow({ entry }) {
  const dotColor = entry.strength === "strong" ? "var(--c-good)" : entry.strength === "medium" ? "var(--c-amber)" : "var(--c-ink-3)";
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--c-line)" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 6,
        boxShadow: entry.strength === "strong" ? `0 0 8px ${dotColor}` : "none" }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink)" }}>{entry.text}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginTop: 4 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{entry.d}</span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>· {entry.from}</span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: dotColor, letterSpacing: ".16em", textTransform: "uppercase" }}>
            {entry.strength}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────

function MemoryPanel() {
  const [data, setData] = usMm(MEMORY_DATA);
  const [expanded, setExpanded] = usMm(null);
  const [filter, setFilter] = usMm("all");

  const handleCalibration = (id, ans) => {
    setData(d => ({
      ...d,
      pendingCalibrations: d.pendingCalibrations.filter(c => c.id !== id),
      overall: Math.min(100, d.overall + (ans === "confirm" ? 1 : 0.5)),
    }));
    if (typeof toast === "function") {
      toast({ title: "LEARNED", text: ans === "confirm" ? "Pattern confirmed" : "Pattern dismissed", kind: "good" });
    }
  };

  const filteredLearnings = filter === "all" ? data.recentLearnings : data.recentLearnings.filter(e => e.dim === filter);

  return (
    <div style={{ padding: "28px 32px 80px", overflowY: "auto", height: "100%", background: "var(--c-bg)" }}>
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}>

        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>
            CINA MEMORY · ALWAYS LEARNING
          </div>
          <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", lineHeight: 1, margin: 0, letterSpacing: "-0.02em" }}>
            What I've learned about you
          </h1>
          <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.55, color: "var(--c-ink-2)", maxWidth: 640, margin: "14px 0 0" }}>
            Every cut, retake, and rejection teaches me. The more we work together, the more my defaults become yours — and the less you'll have to redirect.
          </p>
        </header>

        {/* Top — confidence + stats */}
        <section style={{
          display: "grid", gridTemplateColumns: "auto 1fr",
          gap: 40, alignItems: "center",
          padding: "32px 36px", background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", marginBottom: 32,
        }}>
          <ConfidenceRing pct={data.overall}/>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Trend */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>GROWTH OVER 12 PROJECTS</span>
                <span style={{ flex: 1 }}/>
                <span className="t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-good)" }}>+{data.trend[data.trend.length - 1] - data.trend[0]}% this year</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
                {data.trend.map((v, i) => (
                  <div key={i} style={{
                    flex: 1, height: `${v}%`,
                    background: i === data.trend.length - 1 ? "var(--c-amber)" : `oklch(.55 .08 70 / ${0.3 + i * 0.06})`,
                    borderRadius: "2px 2px 0 0",
                    transition: "height .6s ease",
                  }}/>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
              {[
                { l: "PROJECTS", v: data.projectsAnalyzed,    s: "analyzed" },
                { l: "HOURS",    v: data.hoursIngested,       s: "of footage" },
                { l: "NOTES",    v: data.notesIngested,       s: "ingested" },
                { l: "CUTS",     v: data.cutsObserved.toLocaleString(), s: "observed" },
              ].map(s => (
                <div key={s.l}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 4 }}>{s.l}</div>
                  <div className="t-num" style={{ fontSize: "var(--fs-title)", fontWeight: 500, fontFamily: "var(--f-display)", lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calibration — Cina asking questions */}
        {data.pendingCalibrations.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0 }}>Help me learn faster</h2>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{data.pendingCalibrations.length} OPEN</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {data.pendingCalibrations.map(c => <CalibrationCard key={c.id} cal={c} onAnswer={handleCalibration}/>)}
            </div>
          </section>
        )}

        {/* Two columns: dimensions + recent */}
        <section style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28 }}>

          {/* Taste dimensions */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0 }}>Your taste, mapped</h2>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>7 DIMENSIONS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.dimensions.map(dim => (
                <DimensionCard
                  key={dim.id}
                  dim={dim}
                  expanded={expanded === dim.id}
                  onToggle={() => setExpanded(expanded === dim.id ? null : dim.id)}
                />
              ))}
            </div>
          </div>

          {/* Recent learnings */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0 }}>Recently learned</h2>
              <span style={{ flex: 1 }}/>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
                  color: "var(--c-ink-2)", fontSize: "var(--fs-label)", padding: "4px 8px", borderRadius: "var(--r-1)",
                  fontFamily: "var(--f-mono)", letterSpacing: ".08em", textTransform: "uppercase",
                }}
              >
                <option value="all">All dimensions</option>
                {data.dimensions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: "0 16px" }}>
              {filteredLearnings.map((e, i) => <LearningRow key={i} entry={e}/>)}
              {filteredLearnings.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-body)", fontStyle: "italic" }}>
                  Nothing learned in this dimension yet.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Settings */}
        <section style={{ marginTop: 40 }}>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: "0 0 16px" }}>Memory settings</h2>
          <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
            <SettingRow
              title="Active learning"
              desc="Cina watches your edits and updates its model in the background."
              control={<Toggle on={data.settings.learning} onChange={v => setData(d => ({ ...d, settings: { ...d.settings, learning: v } }))}/>}
            />
            <SettingRow
              title="Influence on defaults"
              desc="How strongly memory shapes Cina's first-pass output. Lower = more neutral."
              control={
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 240 }}>
                  <input type="range" min="0" max="100" value={data.settings.influence}
                    onChange={e => setData(d => ({ ...d, settings: { ...d.settings, influence: +e.target.value } }))}
                    style={{ flex: 1, accentColor: tkc("amber") }}
                  />
                  <span className="t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600, minWidth: 40, textAlign: "right" }}>{data.settings.influence}%</span>
                </div>
              }
            />
            <SettingRow
              title="Export model"
              desc="Download a portable bundle of your taste model. Bring it to another tool."
              control={<button className="btn btn-ghost" style={{ height: 30 }} onClick={() => toast && toast({ title: "EXPORTED", text: "cina-memory-voss.json (4.2 MB)", kind: "good" })}><Icon name="upload" size={11}/>Export .json</button>}
              last
            />
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" style={{ fontSize: "var(--fs-body)" }} onClick={() => toast && toast({ title: "RESET", text: "Memory baseline saved as snapshot", kind: "good" })}>
              <Icon name="settings" size={11}/>Snapshot current memory
            </button>
            <button className="btn btn-ghost" style={{ fontSize: "var(--fs-body)", color: "var(--c-blood-l)" }} onClick={async () => {
              const S = window.SESSION || {};
              const nRatings = Object.keys(S.ratings || {}).length;
              const nHistory = (S.history || []).length;
              const ok = await (window.cinaConfirm ? window.cinaConfirm({
                title: "Forget everything Cina has learned?",
                body: "Clears the " + nRatings + " rating" + (nRatings === 1 ? "" : "s") + " and " + nHistory + " logged screening" + (nHistory === 1 ? "" : "s") + " your recommendations are built from. Your watchlist and holdings stay. Shelves will go generic until you watch and rate again.",
                confirmLabel: "Forget everything", danger: true,
              }) : Promise.resolve(false));
              if (!ok) return;
              S.ratings = {}; S.history = []; if (S.progress) S.progress = {};
              try { localStorage.removeItem("cina-watch-progress"); } catch (_) {}
              if (window.bumpSession) window.bumpSession();
              toast && toast({ title: "FORGOTTEN", text: nRatings + " ratings and " + nHistory + " screenings cleared.", kind: "good" });
            }}>
              <Icon name="x" size={11}/>Forget everything
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({ title, desc, control, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 24,
      padding: "16px 18px",
      borderBottom: last ? "none" : "1px solid var(--c-line)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{desc}</div>
      </div>
      {control}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 38, height: 22, border: "none", padding: 0, cursor: "pointer",
      borderRadius: "var(--r-3)", background: on ? "var(--c-amber)" : "var(--c-line-2)",
      position: "relative", transition: "background .15s ease",
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2, width: 18, height: 18,
        borderRadius: "50%", background: on ? tkc("on-amber") : "var(--c-ink-3)",
        transition: "left .15s cubic-bezier(.2,.8,.2,1)",
      }}/>
    </button>
  );
}

Object.assign(window, { MemoryPanel });
