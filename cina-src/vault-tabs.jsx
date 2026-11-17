// vault-tabs.jsx — Tab content for the Actor Vault.
// Stills, Motion, Voice, Wardrobe, Continuity tabs + inspector tabs
// + version strip + QC HUD.

const { useState: useStateVT, useEffect: useEffectVT, useRef: useRefVT, useMemo: useMemoVT } = React;

// ─── Helpers ──────────────────────────────────────────────────────────

// Match an actor to storyboard shots by name token.
function appearsIn(character) {
  if (!window.STORYBOARD) return [];
  const tokens = character.name.split(" ").filter(t => t.length > 2);
  return window.STORYBOARD.filter(s =>
    tokens.some(t => s.desc.toUpperCase().includes(t.toUpperCase()))
  );
}

// Mock wardrobe per character.
function wardrobeFor(character) {
  const base = {
    "AUGUST REIN": [
      { id: "w1", name: "Trench coat",   era: "Late 70s", fit: "loose",   distress: 72, palette: [tkc("line-2"), tkc("panel-2"), tkc("line-3")], primary: true },
      { id: "w2", name: "Wool suit",     era: "Late 70s", fit: "tailored", distress: 28, palette: [tkc("panel-2"), tkc("line-2"), tkc("ink-4")], primary: false },
      { id: "w3", name: "Pajamas",       era: "Late 70s", fit: "loose",   distress: 12, palette: [tkc("ink-4"), tkc("ink-3")], primary: false },
      { id: "w4", name: "Bathrobe",      era: "Late 70s", fit: "loose",   distress: 24, palette: [tkc("line-2"), tkc("line-3")], primary: false },
    ],
    "MAREN KELL": [
      { id: "w1", name: "Black silk",    era: "Late 70s", fit: "tailored", distress: 4,  palette: [tkc("void"), tkc("blood")], primary: true },
      { id: "w2", name: "Wool overcoat", era: "Late 70s", fit: "tailored", distress: 18, palette: [tkc("panel-2"), tkc("blood")], primary: false },
    ],
    "DET. ARI NOMURA": [
      { id: "w1", name: "Field coat",    era: "Late 70s", fit: "loose",   distress: 56, palette: [tkc("line-2"), tkc("ink-4")], primary: true },
      { id: "w2", name: "Detective suit",era: "Late 70s", fit: "loose",   distress: 32, palette: [tkc("panel-2"), tkc("line-2")], primary: false },
    ],
    "THE SUBJECT": [
      { id: "w1", name: "Yellow dress",  era: "Late 70s", fit: "tailored", distress: 8,  palette: ["var(--c-amber)", tkc("cat-4")], primary: true },
    ],
  };
  return base[character.name] || [
    { id: "w1", name: "Default",  era: "Late 70s", fit: "tailored", distress: 20, palette: [character.color, tkc("panel-2")], primary: true },
  ];
}

// ─── QC HUD ───────────────────────────────────────────────────────────

function Stat({ label, value, good, warn }) {
  return <CinaStat size="sm" label={label} value={value} tone={good ? "good" : warn ? "warn" : undefined}/>;
}

// ─── STILLS TAB ───────────────────────────────────────────────────────

function StillsTab({ character, attrs, onOpenRefs, onRender, generating }) {
  const presets = [
    { id: "key",   label: "Key light · 220°",  active: true },
    { id: "rim",   label: "Rim · 90°",         active: false },
    { id: "soft",  label: "Soft fill · low",   active: false },
    { id: "harsh", label: "Harsh top · noir",  active: false },
  ];
  const poses = [
    { id: "p1", label: "Three-quarter L", active: true  },
    { id: "p2", label: "Profile",         active: false },
    { id: "p3", label: "Direct",          active: false },
    { id: "p4", label: "Looking down",    active: false },
  ];
  return (
    <>
      {/* Stage */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: tkc("black") }}>
        <div style={{ width: "60%", maxWidth: 460, aspectRatio: "3/4" }}>
          <ActorPortrait color={character.color} attrs={attrs}/>
        </div>
        {generating && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(8,8,10,0.6)", backdropFilter: "blur(2px)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)", animation: "vtPulse 1s infinite" }}/>
            RENDERING · v{character.refs + 1}
          </div>
        )}
      </div>

      {/* Reference strip */}
      <div style={{ borderTop: "1px solid var(--c-line)", padding: "12px 18px", background: "rgba(8,8,10,0.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>REFERENCE SET · {character.refs}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn" onClick={() => onOpenRefs(0)}>
              <Icon name="board" size={11}/> All refs
            </button>
            <button className="btn btn-primary" onClick={onRender} disabled={generating}>
              <Icon name="wand" size={11}/> {generating ? "Rendering…" : "Render variants"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <button key={i} onClick={() => onOpenRefs(i)} style={{
              flex: "0 0 80px", height: 100, borderRadius: "var(--r-1)",
              background: `linear-gradient(${135 + i * 20}deg, ${character.color}55, ${tkc("void")})`,
              border: i === 0 ? "1.5px solid var(--c-amber)" : "1px solid var(--c-line-2)",
              position: "relative", overflow: "hidden", padding: 0, cursor: "zoom-in",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PortraitGlyph color={character.color}/>
              {i === 0 && (
                <div style={{
                  position: "absolute", top: 4, left: 4,
                  fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
                  color: "var(--c-amber)", letterSpacing: ".08em",
                  background: "rgba(8,8,10,.7)", padding: "1px 4px", borderRadius: "var(--r-1)",
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <Icon name="lock" size={8}/> KEY
                </div>
              )}
              <div style={{
                position: "absolute", bottom: 3, right: 4,
                fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", color: "rgba(255,255,255,0.55)",
              }}>r{String(i + 1).padStart(2, "0")}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Presets row */}
      <div style={{ borderTop: "1px solid var(--c-line)", padding: "10px 18px", background: "rgba(8,8,10,0.3)" }}>
        <div style={{ display: "flex", gap: 24 }}>
          <PresetRow title="LIGHTING" items={presets}/>
          <PresetRow title="POSE"     items={poses}/>
        </div>
      </div>
    </>
  );
}

function PresetRow({ title, items }) {
  const [active, setActive] = useStateVT(items.find(i => i.active)?.id);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{title}</span>
      <div style={{ display: "flex", gap: 4 }}>
        {items.map(it => (
          <button key={it.id} className="btn" data-active={it.id === active} onClick={() => setActive(it.id)} style={{ height: 22, fontSize: "var(--fs-label)" }}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MOTION TAB ───────────────────────────────────────────────────────

function MotionTab({ character, attrs }) {
  const beats = [
    { id: "smile", label: "Smile",         len: "0:03", status: "captured" },
    { id: "turn",  label: "Quarter turn",  len: "0:04", status: "captured" },
    { id: "walk",  label: "Walk to camera",len: "0:06", status: "captured" },
    { id: "line",  label: "Line read",     len: "0:05", status: "review"   },
    { id: "rage",  label: "Rage",          len: "0:04", status: "queued"   },
    { id: "grief", label: "Grief",         len: "0:08", status: "queued"   },
  ];
  const [activeBeat, setActiveBeat] = useStateVT(beats[0].id);
  const [playing, setPlaying] = useStateVT(false);
  const [t, setT] = useStateVT(0.32);
  const toast = useToast();

  useEffectVT(() => {
    if (!playing) return;
    const start = performance.now() - t * 6000;
    let raf;
    const tick = (now) => {
      const nt = Math.min(1, (now - start) / 6000);
      setT(nt);
      if (nt < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const beat = beats.find(b => b.id === activeBeat);

  return (
    <>
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: tkc("black"), overflow: "hidden" }}>
        {/* video stand-in: portrait that wobbles slightly */}
        <div style={{
          width: "55%", maxWidth: 420, aspectRatio: "3/4",
          transform: playing ? `translateY(${Math.sin(t * Math.PI * 4) * 1.2}px) scale(${1 + Math.sin(t * Math.PI * 2) * 0.005})` : "none",
          transition: playing ? "none" : "transform .3s ease",
        }}>
          <ActorPortrait color={character.color} attrs={attrs}/>
        </div>

        {/* Take overlay */}
        <div style={{ position: "absolute", top: 14, left: 24, display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--f-mono)" }}>
          <span style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.5)", letterSpacing: ".16em" }}>SCREEN TEST · TAKE 03</span>
          <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", letterSpacing: ".08em" }}>{beat.label.toUpperCase()}</span>
        </div>

        {/* REC dot */}
        {playing && (
          <div style={{
            position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 8px", background: "rgba(8,8,10,0.7)", border: "1px solid var(--c-blood)", borderRadius: "var(--r-1)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-blood-x)", letterSpacing: ".16em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-blood-x)", animation: "vtPulse 1s infinite" }}/>
            REC
          </div>
        )}

        {/* Scrubber */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 18px", background: "linear-gradient(180deg, transparent, rgba(8,8,10,0.85))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-icon" onClick={() => setPlaying(p => !p)}>
              <Icon name={playing ? "pause" : "play"} size={12}/>
            </button>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.18)", borderRadius: 999, position: "relative", cursor: "pointer" }} onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setT(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
            }}>
              <div style={{ position: "absolute", inset: 0, width: `${t * 100}%`, background: "var(--c-amber)", borderRadius: 999 }}/>
              <div style={{ position: "absolute", left: `${t * 100}%`, top: "50%", width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)", transform: "translate(-50%, -50%)", boxShadow: "0 0 0 2px rgba(8,8,10,0.6)" }}/>
            </div>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{`0:0${Math.floor(t * 6)} / ${beat.len}`}</span>
          </div>
        </div>
      </div>

      {/* Beat list */}
      <div style={{ borderTop: "1px solid var(--c-line)", padding: "12px 18px", background: "rgba(8,8,10,0.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SCREEN TEST · {beats.length} BEATS</span>
          <button className="btn" onClick={() => toast.push({ kind: "rec", agent: "visual", title: "New beat", message: "Capturing motion. Stand by..." })}>
            <Icon name="plus" size={11}/> Capture beat
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {beats.map(b => (
            <button key={b.id} onClick={() => { setActiveBeat(b.id); setT(0); }} data-active={b.id === activeBeat} style={{
              padding: "8px 10px",
              background: b.id === activeBeat ? "var(--c-panel-3)" : "var(--c-panel)",
              border: `1px solid ${b.id === activeBeat ? "var(--c-amber)" : "var(--c-line)"}`,
              borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{b.label}</span>
                <StatusDot status={b.status}/>
              </div>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{b.len} · take 3</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StatusDot({ status }) {
  const map = {
    captured: { color: "var(--c-good)",  label: "✓" },
    review:   { color: "var(--c-warn)",  label: "?" },
    queued:   { color: "var(--c-ink-4)", label: "•" },
  };
  const s = map[status] || map.queued;
  return (
    <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: s.color }}>{s.label} {status}</span>
  );
}

// ─── VOICE TAB ────────────────────────────────────────────────────────

function Waveform({ playing, seed = 7 }) {
  const bars = useMemoVT(() => {
    return Array.from({ length: 48 }).map((_, i) => 0.2 + Math.abs(Math.sin(seed * 0.7 + i * 0.43)) * 0.8);
  }, [seed]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1.5, height: 24 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 2, height: `${h * 100}%`,
          background: playing ? "var(--c-amber)" : "var(--c-line-3)",
          opacity: playing ? 0.4 + Math.abs(Math.sin(performance.now() / 240 + i * 0.3)) * 0.6 : 1,
          transition: "background .14s ease",
        }}/>
      ))}
    </div>
  );
}

// ─── WARDROBE TAB ─────────────────────────────────────────────────────



function ChipRowSm({ items, value }) {
  const [v, setV] = useStateVT(value);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map(i => (
        <button key={i} onClick={() => setV(i)} className="btn" data-active={v === i} style={{ height: 22, fontSize: "var(--fs-label)", textTransform: "none" }}>
          {i}
        </button>
      ))}
    </div>
  );
}

// ─── CONTINUITY TAB ───────────────────────────────────────────────────

function ContinuityTab({ character }) {
  const shots = appearsIn(character);
  const scenes = useMemoVT(() => {
    const m = new Map();
    shots.forEach(s => {
      if (!m.has(s.scene)) m.set(s.scene, []);
      m.get(s.scene).push(s);
    });
    return Array.from(m, ([scene, list]) => ({ scene, list }));
  }, [character.id, shots.length]);
  const toast = useToast();

  // ── Drift scan state ──────────────────────────────────────────────────
  // Deterministic per-shot likeness score so a re-scan is stable, and a
  // re-render actually lifts flagged shots back above the 92% gate.
  const DRIFT_GATE = 92;
  const [scanning, setScanning] = useStateVT(false);
  const [progress, setProgress] = useStateVT(0);
  const [scores, setScores] = useStateVT(null);   // { [shotId]: pct }
  const [scanAt, setScanAt] = useStateVT(null);

  const baseScore = (s) => {
    // hash shot id → 84..99, biased by shot status (approved renders drift less)
    let h = 0; const key = character.id + ":" + s.id;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0xffff;
    const bias = s.status === "approved" ? 6 : s.status === "review" ? 2 : 0;
    return Math.min(99, 84 + (h % 12) + bias);
  };

  const runScan = () => {
    if (scanning || !shots.length) return;
    setScanning(true); setProgress(0);
    const start = Date.now(); const DUR = 1600;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / DUR);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        const next = {}; shots.forEach(s => { next[s.id] = baseScore(s); });
        setScores(next); setScanning(false); setScanAt(Date.now());
        const flagged = Object.values(next).filter(v => v < DRIFT_GATE).length;
        toast.push({
          kind: flagged ? "warn" : "good", agent: "editor",
          title: `Drift scan · ${character.name.split(" ")[0]}`,
          message: flagged ? `${flagged} of ${shots.length} shots below ${DRIFT_GATE}% — flagged for re-render.` : `All ${shots.length} shots hold likeness. No drift.`,
        });
      }
    };
    requestAnimationFrame(tick);
  };

  const rerenderFlagged = () => {
    if (!scores) return;
    const flagged = shots.filter(s => scores[s.id] < DRIFT_GATE);
    if (!flagged.length) return;
    const next = { ...scores };
    flagged.forEach(s => { next[s.id] = Math.min(99, 93 + (s.id.length % 5)); });
    setScores(next);
    toast.push({ kind: "good", agent: "visual", title: `Re-rendered ${flagged.length} shot${flagged.length === 1 ? "" : "s"}`, message: "Identity re-locked from the reference set · continuity restored." });
  };

  const scored = scores ? shots.map(s => scores[s.id]) : [];
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null;
  const flaggedCount = scored.filter(v => v < DRIFT_GATE).length;

  const scoreColor = (v) => v == null ? "var(--c-ink-3)" : v >= DRIFT_GATE ? "var(--c-good)" : v >= 86 ? "var(--c-warn)" : `var(--c-blood-x, ${tkc("bad")})`;

  return (
    <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", background: "rgba(8,8,10,0.4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>CONTINUITY</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>
            {character.name.split(" ")[0].toLowerCase().replace(/^./, c => c.toUpperCase())} appears in {shots.length} shots · {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
          </div>
        </div>
        <button className="btn btn-primary" onClick={runScan} disabled={scanning || !shots.length} style={{ opacity: scanning || !shots.length ? 0.6 : 1 }}>
          <Icon name="spark" size={11}/> {scanning ? `Scanning · ${Math.round(progress * 100)}%` : scores ? "Re-scan drift" : "Drift scan"}
        </button>
      </div>

      {/* Scan progress */}
      {scanning && (
        <div style={{ marginBottom: 18, padding: "12px 14px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>ANALYZING LIKENESS · {shots.length} SHOTS</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>InstantID · face-embed cosine</span>
          </div>
          <div style={{ height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress * 100}%`, background: "var(--c-amber)", boxShadow: "0 0 10px var(--c-amber)", transition: "width .1s linear" }}/>
          </div>
        </div>
      )}

      {/* Scan summary */}
      {scores && !scanning && (
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 0, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderRight: "1px solid var(--c-line)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 4 }}>AVG LIKENESS</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: scoreColor(avg) }}>{avg}%</div>
          </div>
          <div style={{ padding: "12px 18px", borderRight: "1px solid var(--c-line)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 4 }}>HOLDING</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-good)" }}>{shots.length - flaggedCount}</div>
          </div>
          <div style={{ padding: "12px 18px" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 4 }}>FLAGGED</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: flaggedCount ? `var(--c-blood-x, ${tkc("bad")})` : "var(--c-ink-3)" }}>{flaggedCount}</div>
          </div>
          {flaggedCount > 0 && (
            <button className="btn btn-primary" onClick={rerenderFlagged} style={{ marginLeft: "auto", marginRight: 14, height: 34 }}>
              <Icon name="spark" size={11}/> Re-render {flaggedCount} flagged
            </button>
          )}
        </div>
      )}

      {shots.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)" }}>Not yet on screen.</div>
          <div style={{ fontSize: "var(--fs-body)", marginTop: 6 }}>Send to a shot in the storyboard to start their continuity.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {scenes.map(({ scene, list }) => (
          <div key={scene}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SCENE {scene}</span>
              <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{list.length} shots</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {list.map(s => (
                <div key={s.id} className="card-sel" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
                  <div style={{
                    aspectRatio: "16/9",
                    background: `linear-gradient(135deg, ${character.color}33, ${tkc("void")})`,
                    position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: `${character.color}aa`, letterSpacing: "-0.02em" }}>
                      {s.scene}{s.shot}
                    </span>
                    <div style={{
                      position: "absolute", top: 6, right: 6,
                      padding: "2px 6px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
                      background: "rgba(8,8,10,0.7)", color: "var(--c-ink-3)", letterSpacing: ".16em", borderRadius: "var(--r-1)",
                    }}>{s.type} · {s.lens}</div>
                    <div style={{
                      position: "absolute", bottom: 6, left: 6,
                      padding: "2px 6px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
                      background: s.status === "approved" ? "rgba(106,163,122,0.18)" : s.status === "review" ? "rgba(216,163,66,0.18)" : "rgba(8,8,10,0.7)",
                      color: s.status === "approved" ? "var(--c-good)" : s.status === "review" ? "var(--c-warn)" : "var(--c-ink-3)",
                      letterSpacing: ".16em", borderRadius: "var(--r-1)",
                    }}>{s.status.toUpperCase()}</div>
                    {scores && scores[s.id] != null && (
                      <div style={{
                        position: "absolute", bottom: 6, right: 6,
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "2px 7px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontWeight: 600,
                        background: "rgba(8,8,10,0.82)", border: `1px solid ${scoreColor(scores[s.id])}`,
                        color: scoreColor(scores[s.id]), letterSpacing: ".08em", borderRadius: "var(--r-1)",
                      }}>
                        {scores[s.id] < DRIFT_GATE ? "⚠ " : "● "}{scores[s.id]}%
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4 }}>{s.desc}</div>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4, letterSpacing: ".16em" }}>{s.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INSPECTOR TABS ───────────────────────────────────────────────────

function IdentityInspector({ attrs, setAttr }) {
  return (
    <>
      <Group title="Identity">
        <Field label="Age" hint="years"><Slider value={attrs.age} min={18} max={90} onChange={v => setAttr("age", v)} format={v => `${v}y`}/></Field>
        <Field label="Weight" hint="lbs"><Slider value={attrs.weight} min={90} max={300} onChange={v => setAttr("weight", v)} format={v => `${v}`}/></Field>
        <Field label="Height" hint="in"><Slider value={attrs.height} min={56} max={84} onChange={v => setAttr("height", v)} format={v => `${Math.floor(v/12)}'${v%12}"`}/></Field>
        <Field label="Build"><Slider value={attrs.build} min={0} max={100} onChange={v => setAttr("build", v)} format={v => v < 33 ? "lean" : v < 66 ? "average" : "heavy"}/></Field>
      </Group>
      <Group title="Hair & Face">
        <Field label="Hair length"><Slider value={attrs.hair} min={0} max={100} onChange={v => setAttr("hair", v)} format={v => v < 20 ? "shaved" : v < 50 ? "short" : v < 80 ? "medium" : "long"}/></Field>
        <Field label="Beard density"><Slider value={attrs.beard} min={0} max={100} onChange={v => setAttr("beard", v)} format={v => v < 20 ? "clean" : v < 50 ? "stubble" : v < 80 ? "full" : "heavy"}/></Field>
        <Field label="Skin weathering"><Slider value={attrs.skin} min={0} max={100} onChange={v => setAttr("skin", v)} format={v => `${v}`}/></Field>
        <Field label="Eye color">
          <SwatchPicker
            options={[tkc("line-2"), tkc("cat-1"), tkc("cat-5"), tkc("ink-3"), tkc("line-3")]}
            value={attrs.eyes}
            onChange={v => setAttr("eyes", v)}
          />
        </Field>
      </Group>
      <Group title="Performance">
        <Field label="Posture"><Slider value={attrs.posture} min={0} max={100} onChange={v => setAttr("posture", v)} format={v => v < 33 ? "stooped" : v < 66 ? "neutral" : "upright"}/></Field>
        <Field label="Gait"><Slider value={attrs.gait} min={0} max={100} onChange={v => setAttr("gait", v)} format={v => v < 33 ? "labored" : v < 66 ? "deliberate" : "fluid"}/></Field>
      </Group>
    </>
  );
}

function VoiceInspector({ attrs, setAttr }) {
  const [accent,  setAccent]  = useStateVT("Mid-Atlantic");
  const [pace,    setPace]    = useStateVT(38);
  const [breath,  setBreath]  = useStateVT(28);
  const accents = ["Mid-Atlantic","Brooklyn","RP","French","None"];
  return (
    <>
      <Group title="Voice register">
        <Field label="Pitch" hint="Hz"><Slider value={attrs.voice} min={60} max={300} onChange={v => setAttr("voice", v)} format={v => `${v}`}/></Field>
        <Field label="Pace" hint="wpm"><Slider value={pace} min={0} max={100} onChange={setPace} format={v => v < 33 ? "slow" : v < 66 ? "natural" : "fast"}/></Field>
        <Field label="Breath" hint="%"><Slider value={breath} min={0} max={100} onChange={setBreath} format={v => `${v}`}/></Field>
      </Group>
      <Group title="Accent">
        <ChipRowSm items={accents} value={accent}/>
      </Group>
      <Group title="Direction">
        <Field label="Whisper distance"><Slider value={42} min={0} max={100} onChange={() => {}} format={v => `${v}cm`}/></Field>
        <Field label="Smoke" hint="vocal grit"><Slider value={68} min={0} max={100} onChange={() => {}} format={v => v < 33 ? "clear" : v < 66 ? "rough" : "wrecked"}/></Field>
      </Group>
    </>
  );
}



// ─── Shared subcomponents (re-exported) ──────────────────────────────

function Group({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="t-label" style={{ marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", fontWeight: 500 }}>{label}</span>
        {hint && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", textTransform: "uppercase", letterSpacing: ".08em" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SwatchPicker({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((c, i) => (
        <button key={i} onClick={() => onChange?.(i * 25)} style={{
          width: 26, height: 22, padding: 0, background: c,
          border: Math.floor(value / 25) === i ? "1.5px solid var(--c-amber)" : "1px solid var(--c-line-2)",
          borderRadius: "var(--r-1)", cursor: "pointer",
        }}/>
      ))}
    </div>
  );
}

// Keep the existing portrait procgen in scope for tabs
function ActorPortrait({ color, attrs }) {
  return window.ActorPortraitImpl ? window.ActorPortraitImpl({ color, attrs }) : null;
}
function PortraitGlyph({ color }) {
  return window.PortraitGlyphImpl ? window.PortraitGlyphImpl({ color }) : null;
}

Object.assign(window, { StillsTab, MotionTab, IdentityInspector, VoiceInspector });

// vault-wardrobe.jsx is the current wardrobe surface and loads after this
// file; these are kept under prefixed names so the override is explicit.
