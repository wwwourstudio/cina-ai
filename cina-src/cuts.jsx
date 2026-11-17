// cuts.jsx — Trailer + Episode workflow
//
// Two modes:
//   1. TRAILER — pick a vibe, AI assembles a 30/60/90s teaser from your shots
//      with built-in trailer beats (cold-open · build · drop · title · payoff).
//   2. EPISODES — slice a long cut into 30-45min installments with auto-
//      detected breakpoints (act outs, scene turns, music cues).

const { useState: useStateCu, useEffect: useEffectCu, useMemo: useMemoCu, useRef: useRefCu } = React;

// ─── Shared mock shot library ────────────────────────────────────────────

const CUT_SHOTS = [
  { id: "14A", scene: "Scene 14", label: "EXT · apartment", duration: 8,  type: "EWS",  color: "var(--c-amber)" },
  { id: "14B", scene: "Scene 14", label: "INT · darkroom",   duration: 5,  type: "MS",   color: tkc("blood") },
  { id: "14C", scene: "Scene 14", label: "INS · developer",  duration: 6,  type: "INS",  color: tkc("bad") },
  { id: "14D", scene: "Scene 14", label: "ECU · eye",        duration: 3,  type: "ECU",  color: tkc("cat-2") },
  { id: "14E", scene: "Scene 14", label: "POV · the photo",  duration: 5,  type: "POV",  color: "var(--c-amber)" },
  { id: "14F", scene: "Scene 14", label: "WS · darkroom",    duration: 9,  type: "WS",   color: tkc("cat-1") },
  { id: "15A", scene: "Scene 15", label: "INT · diner",      duration: 12, type: "MS",   color: tkc("cat-4") },
  { id: "15B", scene: "Scene 15", label: "EXT · rain street",duration: 6,  type: "WS",   color: tkc("cat-1") },
  { id: "16A", scene: "Scene 16", label: "INT · stairwell",  duration: 8,  type: "MS",   color: tkc("cat-2") },
  { id: "16B", scene: "Scene 16", label: "ECU · phone",      duration: 4,  type: "ECU",  color: tkc("bad") },
  { id: "18A", scene: "Scene 18", label: "EXT · rooftop",    duration: 14, type: "EWS",  color: "var(--c-amber)" },
  { id: "19A", scene: "Scene 19", label: "INT · interrogation", duration: 10, type: "MS", color: tkc("blood") },
  { id: "20A", scene: "Scene 20", label: "WS · highway",     duration: 9,  type: "WS",   color: tkc("cat-1") },
  { id: "22A", scene: "Scene 22", label: "INT · car",        duration: 6,  type: "CU",   color: tkc("cat-2") },
];

// ─── Root ────────────────────────────────────────────────────────────────

function CutsPanel() {
  const [mode, setMode] = useStateCu("trailer"); // trailer | episodes
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "var(--c-bg)" }}>
      {/* Header */}
      <div style={{
        padding: "18px 32px 10px", borderBottom: "1px solid var(--c-line)",
        display: "flex", alignItems: "flex-end", gap: 24,
      }}>
        <div>
          <div className="t-label" style={{ marginBottom: 4 }}>CUTS WORKSHOP</div>
          <h2 className="t-display" style={{
            margin: 0, fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, letterSpacing: "-0.02em",
          }}>
            {mode === "trailer" ? "Cut a trailer." : "Slice into episodes."}
          </h2>
        </div>
        <span style={{ flex: 1 }}/>
        <div style={{
          display: "flex", gap: 2, padding: 2,
          background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
          borderRadius: "var(--r-2)",
        }}>
          {[
            ["trailer", "Trailer"],
            ["episodes", "Episodes"],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{
              padding: "7px 14px",
              background: mode === k ? "var(--c-panel-3)" : "transparent",
              color: mode === k ? "var(--c-amber)" : "var(--c-ink-3)",
              border: `1px solid ${mode === k ? "var(--c-amber-d)" : "transparent"}`,
              borderRadius: "var(--r-1)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {mode === "trailer" ? <TrailerCutter/> : <EpisodeSplitter/>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TRAILER CUTTER
// ═══════════════════════════════════════════════════════════════════════

const TRAILER_BEATS = [
  { id: "cold",   name: "Cold open",       blurb: "A single beat. Hold quiet.",       duration: 6,  color: "var(--c-amber)" },
  { id: "world",  name: "World setup",     blurb: "Where we are. What is normal.",     duration: 10, color: tkc("cat-1") },
  { id: "stakes", name: "Stakes",          blurb: "What's about to break.",            duration: 12, color: tkc("cat-2") },
  { id: "drop",   name: "The drop",        blurb: "Title card. Music kicks.",          duration: 4,  color: tkc("bad") },
  { id: "build",  name: "Build",           blurb: "Montage. Faces. Choices.",          duration: 14, color: "var(--c-amber)" },
  { id: "payoff", name: "Final beat",      blurb: "The line you remember.",            duration: 6,  color: tkc("blood") },
];

const TRAILER_VIBES = [
  { id: "slow",   name: "Slow burn",       blurb: "No music until 0:42. Tight cuts at the drop only.",       primary: tkc("ink-3") },
  { id: "score",  name: "Score-forward",   blurb: "Score from frame 1. Cuts on the downbeat.",               primary: "var(--c-amber)" },
  { id: "noir",   name: "Cold noir",       blurb: "Long holds. Diegetic sound. One sting at 0:55.",           primary: tkc("cat-1") },
  { id: "kinetic",name: "Kinetic",         blurb: "Fast cuts. Stinger transitions. Title at 0:18.",            primary: tkc("bad") },
];

function TrailerCutter() {
  const [length, setLength] = useStateCu(60); // 30 | 60 | 90
  const [vibe, setVibe] = useStateCu("score");
  const [beats, setBeats] = useStateCu(() => assembleBeats(60));
  const [generating, setGenerating] = useStateCu(false);
  const [progress, setProgress] = useStateCu(0);
  const [renderedAt, setRenderedAt] = useStateCu(null);

  function assembleBeats(len) {
    // Auto-pick shots per beat based on length budget
    const baseBeats = TRAILER_BEATS.map(b => ({ ...b }));
    const totalBudget = len;
    const baseSum = baseBeats.reduce((s, b) => s + b.duration, 0);
    const scale = totalBudget / baseSum;
    return baseBeats.map((b, i) => {
      const targetDur = b.duration * scale;
      let acc = 0; const shots = [];
      const pool = [...CUT_SHOTS].sort(() => Math.random() - 0.5);
      while (acc < targetDur && pool.length) {
        const s = pool.shift();
        // Trailer shots are cut shorter — average 1.4s
        const dur = Math.min(1.4 + Math.random() * 0.8, Math.max(0.6, targetDur - acc));
        shots.push({ ...s, trimmedTo: parseFloat(dur.toFixed(1)) });
        acc += dur;
      }
      return { ...b, duration: parseFloat(acc.toFixed(1)), shots };
    });
  }

  useEffectCu(() => {
    setBeats(assembleBeats(length));
  }, [length]);

  const totalShots = beats.reduce((s, b) => s + b.shots.length, 0);
  const totalDur = beats.reduce((s, b) => s + b.duration, 0);

  const render = () => {
    setGenerating(true); setProgress(0);
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / 6000);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        setGenerating(false);
        setRenderedAt(new Date().toLocaleTimeString());
        if (window.toast) window.toast({
          title: "TRAILER RENDERED",
          text: `${length}s · ${totalShots} cuts · ${TRAILER_VIBES.find(v => v.id === vibe).name}`,
          kind: "good",
        });
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 320px", height: "100%", minHeight: 0 }}>
      {/* Left: Controls */}
      <aside style={{
        borderRight: "1px solid var(--c-line)",
        background: "var(--c-panel)",
        padding: 18, display: "flex", flexDirection: "column", gap: 18,
        overflowY: "auto",
      }}>
        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>STEP 01 · LENGTH</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[30, 60, 90].map(l => (
              <button key={l} onClick={() => setLength(l)} style={{
                padding: "10px 8px",
                background: length === l ? `var(--c-amber)` : "var(--c-bg)",
                color: length === l ? tkc("void") : "var(--c-ink-2)",
                border: `1px solid ${length === l ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer",
                fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
              }}>{l}s</button>
            ))}
          </div>
        </div>

        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>STEP 02 · VIBE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {TRAILER_VIBES.map(v => (
              <button key={v.id} onClick={() => setVibe(v.id)} style={{
                padding: 10, textAlign: "left",
                background: vibe === v.id ? `${v.primary}14` : "var(--c-bg)",
                border: `1px solid ${vibe === v.id ? v.primary : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
              }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500, marginBottom: 2 }}>
                  {v.name}
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>
                  {v.blurb}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>STEP 03 · BEATS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {beats.map((b, i) => (
              <div key={b.id} style={{
                display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 8, alignItems: "center",
                padding: "6px 10px",
                background: "var(--c-bg)", border: `1px solid ${b.color}33`, borderLeft: `2px solid ${b.color}`,
                borderRadius: "var(--r-1)",
              }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{b.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 1 }}>
                    {b.shots.length} cuts
                  </div>
                </div>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: b.color, fontWeight: 600 }}>{b.duration.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={render} disabled={generating} style={{
          padding: "12px 14px",
          background: generating ? "var(--c-panel-3)" :  "var(--c-amber)",
          color: generating ? "var(--c-ink-3)" : tkc("void"),
          border: "none", borderRadius: "var(--r-1)",
          cursor: generating ? "default" : "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>{generating ? `Rendering · ${Math.round(progress * 100)}%` : `▲ Render trailer · ${length}s`}</button>
      </aside>

      {/* Center: Storyboard sequence */}
      <main style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Preview frame */}
        <div style={{
          flex: 1, minHeight: 0,
          background: `linear-gradient(180deg, ${tkc("void")}, ${tkc("void")})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, position: "relative",
        }}>
          <div style={{
            width: "100%", maxWidth: 920, aspectRatio: "21/9",
            background: "linear-gradient(135deg, rgba(var(--accent-rgb),.14), rgba(8,8,10,.95) 75%)",
            border: "1px solid var(--c-line-2)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Faux frame */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.6,
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,.03) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}/>
            <div style={{
              position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
              textAlign: "center", fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-display)", fontWeight: 400, color: "rgba(var(--accent-rgb),.65)",
              letterSpacing: "-0.02em",
            }}>{renderedAt ? "Last Light." : "Preview"}</div>
            {/* Letterboxing handled by the aspect ratio */}
            {/* Top burn */}
            <div style={{
              position: "absolute", top: 12, left: 12,
              display: "flex", alignItems: "center", gap: 6,
              padding: "3px 8px", background: "rgba(0,0,0,.6)",
              border: "1px solid rgba(255,255,255,.18)", borderRadius: "var(--r-1)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"),
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-blood-l)" }}/>
              REC · TRAILER v{renderedAt ? "3" : "1"}
            </div>
            {/* Bottom timecode */}
            <div style={{
              position: "absolute", bottom: 12, left: 12,
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.65)",
              letterSpacing: ".16em",
            }}>00:00 / 0:{String(Math.round(totalDur)).padStart(2, "0")}</div>
            <div style={{
              position: "absolute", bottom: 12, right: 12,
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.65)",
              letterSpacing: ".16em",
            }}>{TRAILER_VIBES.find(v => v.id === vibe).name.toUpperCase()}</div>
            {generating && (
              <div style={{
                position: "absolute", left: 0, right: 0, bottom: 0, height: 3,
                background: "rgba(255,255,255,.1)",
              }}>
                <div style={{
                  height: "100%", width: `${progress * 100}%`,
                  background: "var(--c-amber)", transition: "width .1s linear",
                  boxShadow: "0 0 12px var(--c-amber)",
                }}/>
              </div>
            )}
          </div>
        </div>

        {/* Beat ribbon */}
        <div style={{
          padding: "12px 18px 8px", borderTop: "1px solid var(--c-line)",
          background: "var(--c-panel)",
        }}>
          <div className="t-label" style={{ marginBottom: 8 }}>SEQUENCE · {totalShots} CUTS · {totalDur.toFixed(1)}s</div>
          <div style={{ display: "flex", gap: 2, height: 64, overflowX: "auto", paddingBottom: 4 }}>
            {beats.map((b, bi) => (
              <div key={b.id} style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{
                  height: 16, padding: "2px 6px",
                  background: `${b.color}22`, color: b.color,
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  borderRadius: "var(--r-1)", marginBottom: 2,
                  whiteSpace: "nowrap",
                }}>{b.name.toUpperCase()}</div>
                <div style={{ display: "flex", gap: 1, height: 46 }}>
                  {b.shots.map((s, si) => (
                    <div key={si} style={{
                      width: Math.max(14, s.trimmedTo * 10),
                      background: s.color, opacity: 0.6,
                      border: "1px solid rgba(255,255,255,.08)",
                      borderRadius: "var(--r-1)",
                      position: "relative",
                      flexShrink: 0,
                    }} title={`${s.id} · ${s.label} · ${s.trimmedTo}s`}>
                      <span style={{
                        position: "absolute", top: 2, left: 3,
                        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                        color: "rgba(0,0,0,.7)", fontWeight: 700, letterSpacing: ".08em",
                      }}>{s.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right: Output card */}
      <aside style={{
        borderLeft: "1px solid var(--c-line)", background: "var(--c-panel)",
        padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div>
          <div className="t-label" style={{ marginBottom: 4, color: "var(--c-amber)" }}>OUTPUT</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            Last Light · {length}s trailer
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 6 }}>
            {totalShots} CUTS · {totalDur.toFixed(1)}s · {TRAILER_VIBES.find(v => v.id === vibe).name.toUpperCase()}
          </div>
        </div>

        <div style={{
          padding: 14, background: "var(--c-bg)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
          fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55,
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6, fontWeight: 600 }}>HOW CINA CUTS A TRAILER</div>
          A trailer is six beats: <em>cold open · world · stakes · drop · build · payoff</em>.
          We pick your sharpest shots per beat, cut them tight (avg 1.4s), drop the title at the drop, and end on a held line.
        </div>

        {/* Render queue */}
        <div>
          <div className="t-label" style={{ marginBottom: 8 }}>RENDER QUEUE</div>
          {(renderedAt ? [
            { ver: "v3", time: renderedAt, len: length, status: "ready" },
            { ver: "v2", time: "12 min ago", len: 60, status: "ready" },
            { ver: "v1", time: "1 hr ago", len: 90, status: "archived" },
          ] : [
            { ver: "v2", time: "12 min ago", len: 60, status: "ready" },
            { ver: "v1", time: "1 hr ago", len: 90, status: "archived" },
          ]).map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px",
              background: "var(--c-bg)", border: `1px solid ${i === 0 && renderedAt ? "var(--c-amber)" : "var(--c-line)"}`,
              borderRadius: "var(--r-1)", marginBottom: 4,
            }}>
              <div style={{
                width: 36, height: 24,
                background: `linear-gradient(135deg, ${TRAILER_VIBES.find(v => v.id === vibe).primary}33, ${tkc("void")})`,
                borderRadius: "var(--r-1)", flexShrink: 0,
              }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em" }}>
                  TRAILER {r.ver} · {r.len}s
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
                  {r.time}
                </div>
              </div>
              <span style={{
                padding: "1px 6px", borderRadius: "var(--r-1)",
                background: r.status === "ready" ? "rgba(106,163,122,.18)" : "transparent",
                border: `1px solid ${r.status === "ready" ? "var(--c-good)" : "var(--c-line-2)"}`,
                color: r.status === "ready" ? "var(--c-good)" : "var(--c-ink-3)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>{r.status}</span>
            </div>
          ))}
        </div>

        <button style={{
          padding: "10px 14px",
          background: renderedAt ? "var(--c-amber)" : "var(--c-panel-2)",
          color: renderedAt ? tkc("void") : "var(--c-ink-3)",
          border: renderedAt ? "none" : "1px solid var(--c-line-2)",
          borderRadius: "var(--r-1)", cursor: renderedAt ? "pointer" : "default",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>↗ Push to Watch · marketing</button>
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// EPISODE SPLITTER
// ═══════════════════════════════════════════════════════════════════════

// Mock long-form cut: 96 minutes, 24 scenes
const FULL_RUNTIME = 96 * 60; // sec

const EPISODE_BREAKPOINTS = [
  // Generated from script structure — natural act outs, music cues, scene turns
  { atSec: 14 * 60 + 25, kind: "act-out", label: "Act I close · 'She finds the booth'", confidence: 0.94 },
  { atSec: 28 * 60 + 12, kind: "scene-turn", label: "Scene 9 · diner exit", confidence: 0.82 },
  { atSec: 38 * 60 + 8,  kind: "act-out", label: "Act II midpoint · 'The voice'", confidence: 0.91 },
  { atSec: 52 * 60 + 36, kind: "music-cue", label: "Score swell · stairwell descent", confidence: 0.78 },
  { atSec: 65 * 60 + 4,  kind: "act-out", label: "Act III turn · 'Someone is at the door'", confidence: 0.96 },
  { atSec: 78 * 60 + 22, kind: "scene-turn", label: "Scene 19 · interrogation exit", confidence: 0.80 },
  { atSec: 88 * 60 + 15, kind: "act-out", label: "Finale · 'The choice'", confidence: 0.97 },
];

function EpisodeSplitter() {
  const [count, setCount] = useStateCu(4); // 2, 3, 4, 6
  const [picked, setPicked] = useStateCu(() => autoPick(4));
  const [generating, setGenerating] = useStateCu(false);

  function autoPick(n) {
    // Pick n-1 highest-confidence breakpoints, evenly spread
    const sorted = [...EPISODE_BREAKPOINTS].sort((a, b) => a.atSec - b.atSec);
    if (n === 2) return [sorted[3]];                          // mid
    if (n === 3) return [sorted[2], sorted[5]];                // 1/3 + 2/3
    if (n === 4) return [sorted[2], sorted[3], sorted[5]];     // 4 episodes — 3 breaks
    if (n === 6) return [sorted[0], sorted[2], sorted[3], sorted[5], sorted[6]];
    return sorted.slice(0, n - 1);
  }

  useEffectCu(() => {
    setPicked(autoPick(count));
  }, [count]);

  const togglePick = (bp) => {
    setPicked(p => {
      const has = p.some(x => x.atSec === bp.atSec);
      if (has) return p.filter(x => x.atSec !== bp.atSec);
      return [...p, bp].sort((a, b) => a.atSec - b.atSec);
    });
  };

  // Build episodes from picks
  const episodes = useMemoCu(() => {
    const breaks = [...picked].map(p => p.atSec);
    const starts = [0, ...breaks];
    const ends = [...breaks, FULL_RUNTIME];
    return starts.map((s, i) => ({
      n: i + 1,
      title: episodeTitle(i + 1),
      start: s, end: ends[i],
      duration: ends[i] - s,
    }));
  }, [picked]);

  function episodeTitle(n) {
    const titles = ["The Booth", "The Voice", "The Door", "The Choice", "After-light", "The Static"];
    return titles[n - 1] || `Episode ${n}`;
  }

  function fmt(s) {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 320px", height: "100%", minHeight: 0 }}>
      {/* Left: Episode count + format */}
      <aside style={{
        borderRight: "1px solid var(--c-line)", background: "var(--c-panel)",
        padding: 18, display: "flex", flexDirection: "column", gap: 18, overflowY: "auto",
      }}>
        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>STEP 01 · HOW MANY EPISODES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[2, 3, 4, 6].map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                padding: "10px 8px",
                background: count === n ? "var(--c-amber)" : "var(--c-bg)",
                color: count === n ? tkc("void") : "var(--c-ink-2)",
                border: `1px solid ${count === n ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer",
                fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
              }}>{n}</button>
            ))}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 6, letterSpacing: ".16em" }}>
            ~{Math.round(96 / count)} MIN PER EPISODE
          </div>
        </div>

        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>STEP 02 · BREAKPOINT PICKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {EPISODE_BREAKPOINTS.map(bp => {
              const isPicked = picked.some(x => x.atSec === bp.atSec);
              return (
                <button key={bp.atSec} onClick={() => togglePick(bp)} style={{
                  padding: "8px 10px", textAlign: "left",
                  background: isPicked ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
                  border: `1px solid ${isPicked ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                      color: bp.kind === "act-out" ? "var(--c-amber)" : bp.kind === "music-cue" ? "var(--c-blood-l)" : "var(--c-ink-3)",
                      fontWeight: 700, textTransform: "uppercase",
                    }}>{bp.kind.replace("-", " ")}</span>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink)" }}>{fmt(bp.atSec)}</span>
                  </div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.2 }}>
                    {bp.label}
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: isPicked ? "var(--c-amber)" : "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>
                    CONFIDENCE {Math.round(bp.confidence * 100)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => {
          setGenerating(true);
          setTimeout(() => {
            setGenerating(false);
            if (window.toast) window.toast({
              title: "EPISODES SPLIT",
              text: `${episodes.length} episodes · ${episodes.length - 1} breaks committed`,
              kind: "good",
            });
          }, 2200);
        }} disabled={generating} style={{
          padding: "12px 14px",
          background: generating ? "var(--c-panel-3)" :  "var(--c-amber)",
          color: generating ? "var(--c-ink-3)" : tkc("void"),
          border: "none", borderRadius: "var(--r-1)",
          cursor: generating ? "default" : "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>{generating ? "Splitting…" : `▲ Commit · ${episodes.length} episodes`}</button>
      </aside>

      {/* Center: Timeline + episode previews */}
      <main style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
        {/* Episode preview row */}
        <div style={{ padding: "18px 24px 8px", overflowY: "auto" }}>
          <div className="t-label" style={{ marginBottom: 8 }}>EPISODES · {episodes.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(episodes.length, 4)}, 1fr)`, gap: 10, marginBottom: 16 }}>
            {episodes.map(ep => (
              <div key={ep.n} style={{
                padding: 12,
                background: "var(--c-panel)",
                border: "1px solid var(--c-line)",
                borderLeft: "2px solid var(--c-amber)",
                borderRadius: "var(--r-2)",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                  letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                }}>EP {String(ep.n).padStart(2, "0")} · {fmt(ep.duration)}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500,
                  lineHeight: 1.05, letterSpacing: "-0.01em",
                }}>{ep.title}</div>
                <div style={{
                  aspectRatio: "16/9",
                  background: `linear-gradient(${(ep.n * 73) % 360}deg, rgba(var(--accent-rgb),.18), ${tkc("void")} 75%)`,
                  border: "1px solid var(--c-line)",
                  position: "relative",
                  marginTop: 4,
                }}>
                  <div style={{
                    position: "absolute", inset: 0, opacity: 0.55,
                    backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,.03) 1px, transparent 1px)",
                    backgroundSize: "3px 3px",
                  }}/>
                  <div style={{
                    position: "absolute", left: 8, bottom: 8,
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.7)",
                    letterSpacing: ".16em",
                  }}>{fmt(ep.start)} → {fmt(ep.end)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master timeline w/ breakpoints */}
        <div style={{
          flex: 1, padding: "16px 24px",
          background: "var(--c-bg)", borderTop: "1px solid var(--c-line)",
          display: "flex", flexDirection: "column", gap: 14, minHeight: 0,
        }}>
          <div className="t-label" style={{ color: "var(--c-amber)" }}>MASTER · 96:00 · DROP A PIN TO ADD A BREAK</div>
          <div style={{
            position: "relative", height: 60, background: "var(--c-panel)",
            border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
          }}>
            {/* Acts overlay */}
            {[
              { from: 0,         to: 14 * 60 + 25, label: "ACT I",   color: "var(--c-amber)" },
              { from: 14 * 60 + 25, to: 38 * 60 + 8,  label: "ACT II",  color: tkc("cat-1") },
              { from: 38 * 60 + 8,  to: 65 * 60 + 4,  label: "ACT III", color: tkc("cat-2") },
              { from: 65 * 60 + 4,  to: 96 * 60,      label: "FINALE",  color: tkc("bad") },
            ].map(a => (
              <div key={a.label} style={{
                position: "absolute", top: 0, bottom: 0,
                left: `${(a.from / FULL_RUNTIME) * 100}%`,
                width: `${((a.to - a.from) / FULL_RUNTIME) * 100}%`,
                background: `${a.color}10`, borderRight: `1px dashed ${a.color}55`,
                display: "flex", alignItems: "flex-start", padding: "4px 6px",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: a.color, letterSpacing: ".16em",
                fontWeight: 700, textTransform: "uppercase",
              }}>{a.label}</div>
            ))}
            {/* All candidate breakpoints */}
            {EPISODE_BREAKPOINTS.map(bp => {
              const isPicked = picked.some(x => x.atSec === bp.atSec);
              return (
                <div key={bp.atSec} onClick={() => togglePick(bp)}
                  title={bp.label}
                  style={{
                    position: "absolute", left: `${(bp.atSec / FULL_RUNTIME) * 100}%`,
                    top: -4, bottom: -4, width: isPicked ? 3 : 1,
                    background: isPicked ? "var(--c-amber)" : "rgba(255,255,255,.25)",
                    boxShadow: isPicked ? "0 0 12px var(--c-amber)" : "none",
                    cursor: "pointer",
                    transform: "translateX(-50%)",
                }}>
                  {isPicked && (
                    <div style={{
                      position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
                      padding: "2px 6px",
                      background: "var(--c-amber)", color: "var(--c-void)",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                      fontWeight: 700, borderRadius: "var(--r-1)", whiteSpace: "nowrap",
                    }}>↓ BREAK</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Scrub legend */}
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            <span>00:00</span>
            <span>24:00</span>
            <span>48:00</span>
            <span>72:00</span>
            <span>96:00</span>
          </div>

          {/* Health summary */}
          <div style={{
            marginTop: 8, padding: 14,
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-1)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
          }}>
            <Stat label="EPISODES" value={String(episodes.length)}/>
            <Stat label="SHORTEST" value={`${Math.floor(Math.min(...episodes.map(e => e.duration)) / 60)}m`}/>
            <Stat label="LONGEST"  value={`${Math.floor(Math.max(...episodes.map(e => e.duration)) / 60)}m`}/>
            <Stat label="AVG"      value={`${Math.floor(episodes.reduce((s, e) => s + e.duration, 0) / episodes.length / 60)}m`}/>
          </div>
        </div>
      </main>

      {/* Right: Release card */}
      <aside style={{
        borderLeft: "1px solid var(--c-line)", background: "var(--c-panel)",
        padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div>
          <div className="t-label" style={{ marginBottom: 4, color: "var(--c-amber)" }}>RELEASE PLAN</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            Last Light · Series
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 6 }}>
            {episodes.length} EPISODES · WEEKLY DROPS
          </div>
        </div>

        <div style={{
          padding: 14, background: "var(--c-bg)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
          fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55,
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6, fontWeight: 600 }}>HOW CINA FINDS BREAKS</div>
          We look at three signals: <em>script act-outs</em> (highest confidence),
          <em> scene exits</em> (when characters leave a location), and
          <em> music cues</em> (the score's natural lift). You can override any pin.
        </div>

        <div>
          <div className="t-label" style={{ marginBottom: 8 }}>EPISODE SCHEDULE</div>
          {episodes.map(ep => (
            <div key={ep.n} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px",
              background: "var(--c-bg)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-1)", marginBottom: 4,
            }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                width: 26, letterSpacing: ".08em", fontWeight: 600,
              }}>EP{String(ep.n).padStart(2, "0")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{ep.title}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 1 }}>
                  {fmt(ep.duration)} · drops {weekDate(ep.n)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button style={{
          padding: "10px 14px",
          background: "var(--c-amber)", color: "var(--c-void)",
          border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>↗ Push to Watch · series</button>
      </aside>
    </div>
  );
}

function weekDate(n) {
  const dates = ["Jun 14", "Jun 21", "Jun 28", "Jul 05", "Jul 12", "Jul 19"];
  return dates[n - 1] || `wk ${n}`;
}

function Stat({ label, value, k, v, icon, sub, good, warn }) {
  return <CinaStat size="sm" icon={icon} label={label ?? k} value={value ?? v} sub={sub} tone={good ? "good" : warn ? "warn" : undefined}/>;
}

// ─── Export ──────────────────────────────────────────────────────────────

window.CutsPanel = CutsPanel;
