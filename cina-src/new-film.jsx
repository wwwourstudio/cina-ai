// new-film.jsx — Pitch → Bible. A guided one-line-to-blueprint flow.

const { useState: useStateNF, useEffect: useEffectNF } = React;

function NewFilmFlow({ onCancel, onCreate, initialKind }) {
  const [kind, setKind] = useStateNF(initialKind || null); // movie | series | branched
  const [pitch, setPitch] = useStateNF("");
  const [phase, setPhase] = useStateNF(initialKind ? "pitch" : "kind"); // kind → pitch → forging → review → forks (branched only) → produce → minting
  const [forgeStep, setForgeStep] = useStateNF(0);
  const [forks, setForks] = useStateNF([
    { act: "Act I", at: "12m", prompt: "Where does she go?", options: ["Into the booth.", "Out the back door."] },
    { act: "Act II", at: "38m", prompt: "Who is on the other line?", options: ["A child.", "Her own voice.", "Silence."] },
    { act: "Act III", at: "65m", prompt: "Does she answer?", options: ["Yes.", "She unplugs the phone."] },
    { act: "Finale", at: "88m", prompt: "The choice.", options: ["Stay.", "Burn it down.", "Send the signal."] },
  ]);
  const [producers, setProducers] = useStateNF({
    enabled: true,
    supply: 250,
    floor: 250,
    royalty: 60, // pct creator keeps; rest cascades to producers
    tiers: [
      { name: "Backer",     price: 50,    supply: 200, perks: "Premiere · ending credits · weekly dividend" },
      { name: "Co-producer",price: 1000,  supply: 40,  perks: "All Backer + private cut + monthly call w/ director" },
      { name: "Executive",  price: 25000, supply: 10,  perks: "EP credit on screen + script vote + on-set visit" },
    ],
  });

  const FORGE_STEPS = [
    { who: "writer",  text: "Drafting logline · structure · 3 acts" },
    { who: "director",text: "Choosing director DNA · Fincher / Hitchcock weights" },
    { who: "visual",  text: "Building palette · 5 colors · oxblood / sodium" },
    { who: "editor",  text: "Setting world rules · 5 invariants" },
    { who: "audio",   text: "Tone bed · 62 BPM ambient · room tone defined" },
  ];

  useEffectNF(() => {
    if (phase !== "forging") return;
    if (forgeStep >= FORGE_STEPS.length) {
      const t = setTimeout(() => setPhase("review"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setForgeStep(s => s + 1), 700);
    return () => clearTimeout(t);
  }, [phase, forgeStep]);

  return (
    <div style={{ position: "absolute", inset: 0, paddingTop: 72, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "28px 40px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", rowGap: 14 }}>
        <div>
          <div className="t-label" style={{ marginBottom: 6 }}>
            {kind === "series" ? "New series" : kind === "branched" ? "New branched film" : kind === "movie" ? "New film" : "Start something"}
          </div>
          <h1 className="t-display" style={{ margin: 0, fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em" }}>
            {phase === "kind"
              ? <><span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>What</span> are we making?</>
              : kind === "branched"
                ? <><span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>One spine,</span> many endings.</>
                : kind === "series"
                  ? <><span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>One bible.</span> Many episodes.</>
                  : <><span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>One line.</span> Cina takes it from there.</>
            }
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, paddingBottom: 4 }}>
          <NFSteps kind={kind} phase={phase}/>
          <button className="btn btn-ghost" onClick={onCancel}><Icon name="x" size={12}/> Cancel</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        {phase === "kind"    && <KindPhase onPick={(k) => { setKind(k); setPhase("pitch"); }}/>}
        {phase === "pitch"   && <PitchPhase pitch={pitch} setPitch={setPitch} kind={kind} onBack={() => setPhase("kind")} onForge={() => { setPhase("forging"); setForgeStep(0); }}/>}
        {phase === "forging" && <ForgingPhase pitch={pitch} kind={kind} steps={FORGE_STEPS} current={forgeStep}/>}
        {phase === "review"  && <ReviewPhase pitch={pitch} kind={kind} onCreate={() => setPhase(kind === "branched" ? "forks" : "produce")} onBack={() => setPhase("pitch")}/>}
        {phase === "forks"   && <ForksPhase pitch={pitch} forks={forks} setForks={setForks} onBack={() => setPhase("review")} onNext={() => setPhase("produce")}/>}
        {phase === "produce" && <ProducePhase producers={producers} setProducers={setProducers} kind={kind} onMint={() => onCreate(kind)} onBack={() => setPhase(kind === "branched" ? "forks" : "review")}/>}
      </div>
    </div>
  );
}

// ─── Step rail — where you are in the pitch → studio journey ───────────
function NFSteps({ kind, phase }) {
  if (phase === "kind") return null;
  const steps = kind === "branched"
    ? [["pitch", "Pitch"], ["bible", "Bible"], ["forks", "Forks"], ["produce", "Financing"]]
    : [["pitch", "Pitch"], ["bible", "Bible"], ["produce", "Financing"]];
  const phaseKey = (phase === "forging" || phase === "review") ? "bible" : phase;
  const idx = Math.max(0, steps.findIndex(s => s[0] === phaseKey));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      {steps.map(([k, label], i) => {
        const done = i < idx, active = i === idx;
        return (
          <React.Fragment key={k}>
            {i > 0 && <span style={{ width: 22, height: 1, background: (done || active) ? "var(--c-amber)" : "var(--c-line-2)", flexShrink: 0 }}></span>}
            <span className="t-mono" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", whiteSpace: "nowrap",
              color: active ? "var(--c-amber)" : done ? "var(--c-ink-2)" : "var(--c-ink-4)",
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${active ? "var(--c-amber)" : done ? "var(--c-ink-3)" : "var(--c-line-2)"}`,
                background: active ? "rgba(var(--accent-rgb),.12)" : "transparent", fontSize: "var(--fs-label)", flexShrink: 0,
              }}>{done ? "✓" : i + 1}</span>
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function KindPhase({ onPick }) {
  const options = [
    {
      id: "movie", label: "Film",
      tagline: "A single-cut feature or short.",
      detail: "One arc, one ending. Cina forges a complete bible — characters, palette, world rules — from your pitch in seconds.",
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="6" y="11" width="36" height="26" rx="2"/>
          <line x1="6" y1="16" x2="42" y2="16"/>
          <line x1="6" y1="32" x2="42" y2="32"/>
          <line x1="14" y1="11" x2="14" y2="16"/>
          <line x1="22" y1="11" x2="22" y2="16"/>
          <line x1="30" y1="11" x2="30" y2="16"/>
          <line x1="38" y1="11" x2="38" y2="16"/>
          <line x1="14" y1="32" x2="14" y2="37"/>
          <line x1="22" y1="32" x2="22" y2="37"/>
          <line x1="30" y1="32" x2="30" y2="37"/>
          <line x1="38" y1="32" x2="38" y2="37"/>
        </svg>
      ),
      runtime: "1h 30m–2h 10m", tiers: "3", chain: "Base",
    },
    {
      id: "series", label: "Series",
      tagline: "Multi-episode arc with a bible.",
      detail: "One world, many entries. Cina locks the bible, then ships episodes on cadence. Holders renew per season.",
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="6"  y="10" width="14" height="12" rx="1.5"/>
          <rect x="24" y="10" width="14" height="12" rx="1.5"/>
          <rect x="6"  y="26" width="14" height="12" rx="1.5"/>
          <rect x="24" y="26" width="14" height="12" rx="1.5"/>
          <circle cx="13" cy="16" r="2"/>
          <circle cx="31" cy="16" r="2"/>
          <circle cx="13" cy="32" r="2"/>
          <circle cx="31" cy="32" r="2"/>
        </svg>
      ),
      runtime: "6–10 episodes", tiers: "3 + season pass", chain: "Base",
    },
    {
      id: "branched", label: "Branched · CYA",
      tagline: "Choose-your-own-adventure cinema.",
      detail: "One spine, many endings. Audience votes on forks during the runup; the cut they pick locks for them, the others persist as alternate canons.",
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M24 8 L24 18"/>
          <path d="M24 18 L10 26 L10 40"/>
          <path d="M24 18 L24 40"/>
          <path d="M24 18 L38 26 L38 40"/>
          <circle cx="24" cy="8"  r="2.5" fill="currentColor"/>
          <circle cx="24" cy="18" r="2.5"/>
          <circle cx="10" cy="40" r="2.5"/>
          <circle cx="24" cy="40" r="2.5"/>
          <circle cx="38" cy="40" r="2.5"/>
        </svg>
      ),
      runtime: "1h 30m + 3–5 forks", tiers: "3 · branch passes available", chain: "Base",
      featured: true,
    },
  ];

  return (
    <div style={{ maxWidth: "var(--w-mid)", margin: "0 auto" }}>
      <p style={{ margin: "0 0 28px", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", maxWidth: 640, lineHeight: 1.55 }}>
        Pick the format. You can change your mind later — the bible carries over to any kind.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onPick(o.id)} style={{
            appearance: "none", border: 0, cursor: "pointer",
            background: o.featured
              ? "linear-gradient(160deg, rgba(var(--accent-rgb),.07), var(--c-panel) 70%)"
              : "var(--c-panel)",
            borderRadius: "var(--r-3)", padding: "26px 24px 22px",
            border: `1px solid ${o.featured ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}`,
            color: "var(--c-ink)", textAlign: "left",
            display: "flex", flexDirection: "column", gap: 12,
            transition: "transform .12s ease, border-color .14s ease",
            minHeight: 320,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = o.featured ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ color: o.featured ? "var(--c-amber)" : "var(--c-ink-2)", lineHeight: 0 }}>{o.icon}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, color: o.featured ? "var(--c-amber)" : "var(--c-ink)", lineHeight: 1, letterSpacing: "-0.01em" }}>{o.label}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{o.tagline}</div>
            <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>{o.detail}</p>
            <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>RUNTIME</span><span style={{ color: "var(--c-ink-2)" }}>{o.runtime}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>TIERS</span><span style={{ color: "var(--c-ink-2)" }}>{o.tiers}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>CHAIN</span><span style={{ color: "var(--c-ink-2)" }}>{o.chain}</span></div>
            </div>
            <div style={{
              marginTop: 6, padding: "10px 14px",
              background: o.featured ? "var(--c-amber)" : "var(--c-panel-2)",
              color: o.featured ? tkc("on-amber") : "var(--c-ink)",
              borderRadius: "var(--r-2)", textAlign: "center",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
              letterSpacing: ".16em", textTransform: "uppercase",
            }}>
              Start {o.label} →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ForksPhase({ pitch, forks, setForks, onBack, onNext }) {
  const addOption = (i) => setForks(fs => fs.map((f, idx) => idx === i ? { ...f, options: [...f.options, "Another option…"] } : f));
  const setOption = (i, j, val) => setForks(fs => fs.map((f, idx) => idx === i ? { ...f, options: f.options.map((o, jj) => jj === j ? val : o) } : f));
  const removeOption = (i, j) => setForks(fs => fs.map((f, idx) => idx === i ? { ...f, options: f.options.filter((_, jj) => jj !== j) } : f));
  const setPrompt = (i, val) => setForks(fs => fs.map((f, idx) => idx === i ? { ...f, prompt: val } : f));
  const addFork = () => setForks(fs => [...fs, { act: `Act ${fs.length + 1}`, at: `${(fs.length + 1) * 18}m`, prompt: "What changes here?", options: ["Option A", "Option B"] }]);
  const removeFork = (i) => setForks(fs => fs.filter((_, idx) => idx !== i));
  const totalEndings = forks.reduce((acc, f) => acc * Math.max(1, f.options.length), 1);

  return (
    <div style={{ maxWidth: "var(--w-mid)", margin: "0 auto" }}>
      <div className="panel" style={{ padding: 24, borderRadius: "var(--r-3)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
        <div>
          <div className="t-label">Branch builder · {forks.length} forks</div>
          <div className="t-display" style={{ fontSize: "var(--fs-title)", fontStyle: "italic", marginTop: 4 }}>
            {totalEndings.toLocaleString()} possible cuts
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4, maxWidth: 560 }}>
            Each fork is a moment the audience votes on. The cut they pick locks for them; the others persist as alternate canons that holders can unlock.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={addFork}><Icon name="plus" size={12}/> Add fork</button>
        </div>
      </div>

      {/* Spine visualization */}
      <div style={{ position: "relative", padding: "0 0 16px", marginBottom: 24 }}>
        <div style={{ position: "absolute", left: 24, right: 24, top: 22, height: 2, background: "linear-gradient(90deg, var(--c-amber-d) 0%, var(--c-amber) 50%, transparent 100%)", opacity: .5 }}/>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${forks.length}, 1fr)`, gap: 8, position: "relative" }}>
          {forks.map((f, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--c-bg)", border: "2px solid var(--c-amber)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                letterSpacing: ".08em", boxShadow: "0 0 0 4px var(--c-bg)",
                fontWeight: 600,
              }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 8, letterSpacing: ".16em" }}>{f.at.toUpperCase()}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4, letterSpacing: ".16em" }}>{f.options.length} OPTIONS</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fork cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {forks.map((f, i) => (
          <div key={i} className="panel" style={{ borderRadius: "var(--r-3)", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "var(--r-2)", background: "rgba(var(--accent-rgb),.12)", color: "var(--c-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".08em" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>FORK · {f.act.toUpperCase()} · {f.at.toUpperCase()}</div>
                  <input value={f.prompt} onChange={e => setPrompt(i, e.target.value)} style={{
                    appearance: "none", background: "transparent", border: 0, outline: "none",
                    fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)",
                    width: 460, padding: 0, marginTop: 4,
                  }}/>
                </div>
              </div>
              {forks.length > 1 && (
                <button className="btn btn-ghost" onClick={() => removeFork(i)} style={{ color: "var(--c-blood-l)" }}>
                  <Icon name="x" size={12}/> Remove
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, f.options.length)}, 1fr)`, gap: 10 }}>
              {f.options.map((opt, j) => (
                <div key={j} style={{
                  background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
                  borderRadius: "var(--r-2)", padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
                    flexShrink: 0,
                  }}>{String.fromCharCode(65 + j)}</div>
                  <input value={opt} onChange={e => setOption(i, j, e.target.value)} style={{
                    flex: 1, appearance: "none", background: "transparent", border: 0, outline: "none",
                    fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", color: "var(--c-ink)",
                  }}/>
                  {f.options.length > 2 && (
                    <button onClick={() => removeOption(i, j)} style={{
                      appearance: "none", border: 0, background: "transparent",
                      color: "var(--c-ink-4)", cursor: "pointer", padding: 4,
                    }}><Icon name="x" size={10}/></button>
                  )}
                </div>
              ))}
              {f.options.length < 5 && (
                <button className="btn btn-ghost" onClick={() => addOption(i)} style={{
                  border: "1px dashed var(--c-line-2)", height: "auto", padding: "10px 12px",
                  color: "var(--c-ink-3)", borderRadius: "var(--r-2)", justifyContent: "center",
                }}>
                  <Icon name="plus" size={11}/> Option {String.fromCharCode(65 + f.options.length)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Bible</button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{forks.length} FORKS · {totalEndings.toLocaleString()} CUTS</span>
          <button className="btn btn-primary" onClick={onNext} disabled={forks.length === 0}>
            Configure financing <Icon name="chev-r" size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function PitchPhase({ pitch, setPitch, kind, onForge, onBack }) {
  const [focused, setFocused] = useStateNF(false);
  const examplesByKind = {
    movie: [
      "A retired forensic photographer authenticates a roll of film documenting a murder that hasn't happened yet.",
      "Two estranged sisters return to the family farm to bury their father — and find the cellar has been sealed from the inside.",
      "A heist crew tries to steal something they don't know exists from a building that doesn't show up on any map.",
    ],
    series: [
      "A small-town coroner who can see how anyone died, but never how to stop it from happening again.",
      "Five astronauts wake from cryo to discover the rest of the crew is already on Earth — and have been for forty years.",
      "An off-grid commune that runs an illegal radio station broadcasting weather reports to ghosts.",
    ],
    branched: [
      "Three strangers receive the same letter and have until midnight to decide whether to open it.",
      "A late-shift switchboard operator gets a call from someone who already hung up — every choice she makes redials a different decade.",
      "A getaway driver waits in a car outside a vault. Every fork is a different exit, a different city, a different ending.",
    ],
  };
  const examples = examplesByKind[kind] || examplesByKind.movie;
  const ready = pitch.trim().length >= 10;
  const kindTint = { movie: tkc("ink-3"), series: tkc("cat-1"), branched: "var(--c-amber)" }[kind] || tkc("amber");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {onBack && (
        <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 14 }}>
          <Icon name="chev-l" size={11}/> Choose a different format
        </button>
      )}

      {/* The pitch — a title card you type into */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "var(--c-panel)", borderRadius: "var(--r-3)",
        border: `1px solid ${focused ? "rgba(var(--accent-rgb),.55)" : "var(--c-line)"}`,
        boxShadow: focused ? "0 0 0 3px rgba(var(--accent-rgb),.1)" : "none",
        padding: "26px 30px 22px",
        transition: "border-color .18s ease, box-shadow .18s ease",
      }}>
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: focused || ready ? "var(--c-amber)" : "var(--c-line-2)", transition: "background .18s ease" }}></span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <label className="t-label">The pitch</label>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: kindTint, border: `1px solid color-mix(in oklch, ${kindTint} 45%, transparent)`, borderRadius: 999, padding: "2px 9px", textTransform: "uppercase" }}>
            {kind === "series" ? "Series" : kind === "branched" ? "Branched" : "Film"}
          </span>
        </div>
        <textarea
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus
          placeholder={kind === "branched" ? "One sentence. The spine — the rest can branch." : kind === "series" ? "One sentence. The world the series lives in." : "One sentence. The promise of the film."}
          rows={3}
          className="t-display"
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none", resize: "none",
            color: "var(--c-ink)", fontSize: "var(--fs-title)", fontStyle: "italic", lineHeight: 1.4,
            letterSpacing: "-0.01em", caretColor:  "var(--c-amber)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: 14, paddingTop: 16, borderTop: "1px solid var(--c-line)" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: ready ? "var(--c-ink-3)" : "var(--c-ink-4)" }}>
            {pitch.length} / 240 · longer is fine, leaner reads better
          </span>
          <button
            className="btn btn-primary"
            disabled={!ready}
            onClick={onForge}
            style={{ opacity: ready ? 1 : 0.45, height: 38, padding: "0 20px", fontSize: "var(--fs-body)", gap: 8 }}
          >
            <Icon name="wand" size={12}/> Forge bible
          </button>
        </div>
      </div>

      {/* Sparks — steal a line to start from */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <div className="t-label">No pitch yet? Steal a spark</div>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>CLICK TO USE · EDIT FREELY</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setPitch(ex)} className="nf-spark" style={{
              display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", gap: 14, alignItems: "center",
              textAlign: "left", padding: "15px 6px 15px 2px",
              background: "transparent", border: "none", borderBottom: "1px solid var(--c-line)",
              borderRadius: 0, color: "var(--c-ink-2)", cursor: "pointer",
            }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.45, color: "inherit" }}>{ex}</span>
              <span className="nf-spark__go" style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>→</span>
            </button>
          ))}
        </div>
        <style>{`
          .nf-spark { transition: color .14s ease; }
          .nf-spark:hover { color: var(--c-ink); }
          .nf-spark:hover .nf-spark__go { color: var(--c-amber); }
        `}</style>
      </div>
    </div>
  );
}

function ForgingPhase({ pitch, steps, current }) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div className="panel" style={{ padding: 28, borderRadius: "var(--r-3)" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>
          Forging from
        </div>
        <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", color: "var(--c-ink-2)", lineHeight: 1.4 }}>
          “{pitch}”
        </div>
      </div>

      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px", borderRadius: "var(--r-2)",
              background: active ? "var(--c-panel-2)" : "transparent",
              border: `1px solid ${active ? "var(--c-line-2)" : "transparent"}`,
              opacity: i > current ? 0.4 : 1,
              transition: "opacity .3s ease, background .3s ease",
            }}>
              <AgentBadge agent={s.who} size={20}/>
              <span style={{ flex: 1, color: done ? "var(--c-ink-3)" : "var(--c-ink)", fontSize: "var(--fs-body)" }}>
                {s.text}
              </span>
              {done && <span style={{ color: "var(--c-good)" }}><Icon name="check" size={12}/></span>}
              {active && <span className="rec-dot" style={{ background: "var(--c-amber)", boxShadow: "0 0 8px rgba(var(--accent-rgb),.6)" }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewPhase({ pitch, kind, onCreate, onBack }) {
  const [adjusting, setAdjusting] = useStateNF(false);
  const [dna, setDna] = useStateNF([
    { name: "Fincher",   w: 0.42 },
    { name: "Hitchcock", w: 0.28 },
    { name: "Nolan",     w: 0.18 },
    { name: "Kubrick",   w: 0.12 },
  ]);
  const [palette, setPalette] = useStateNF([tkc("amber"), tkc("blood"), tkc("line-2"), tkc("cat-4"), tkc("void")]);
  const [rules, setRules] = useStateNF([
    "No handheld. Camera is on sticks or dolly.",
    "Practical light only. Motivated, or it doesn't exist.",
    "No score during dialogue.",
    "Faces lit from one side. The other side is gone.",
    "Red appears exactly seven times in the film.",
  ]);

  const normalizeDna = (arr) => {
    const sum = arr.reduce((s, d) => s + d.w, 0) || 1;
    return arr.map(d => ({ ...d, w: d.w / sum }));
  };
  const setDnaWeight = (idx, newW) => {
    setDna(prev => {
      const next = prev.map((d, i) => i === idx ? { ...d, w: Math.max(0.02, Math.min(0.90, newW)) } : d);
      return normalizeDna(next);
    });
  };

  const PALETTE_OPTIONS = [
    tkc("amber"), tkc("blood"), tkc("line-2"), tkc("cat-4"), tkc("void"),
    tkc("bad"), tkc("cat-1"), tkc("cat-2"), tkc("ink-4"), tkc("amber-d"),
    tkc("panel-2"), tkc("ink"), tkc("line-2"), tkc("cat-6"), tkc("ink-3"),
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div className="panel" style={{ padding: 28, borderRadius: "var(--r-3)", border: adjusting ? "1px solid rgba(var(--accent-rgb),.35)" : undefined }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <div>
            <div className="t-label">{adjusting ? "Adjusting DNA" : "Forged bible"}</div>
            <div className="t-display" style={{ fontSize: "var(--fs-title)", fontWeight: 500, marginTop: 4, letterSpacing: "-0.02em" }}>
              UNTITLED <span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>/ 05</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {adjusting && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>● EDITING</span>}
            <StatusPill status="active"/>
          </div>
        </div>

        <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", color: "var(--c-ink-2)", lineHeight: 1.5, marginBottom: 24 }}>
          "{pitch}"
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div className="t-label" style={{ marginBottom: 10 }}>Director DNA</div>
            <div style={{ display: "flex", flexDirection: "column", gap: adjusting ? 14 : 8 }}>
              {dna.map((d, i) => (
                <div key={d.name}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 70, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{d.name}</span>
                    <div style={{
                      flex: 1, height: adjusting ? 6 : 3,
                      background: "var(--c-line)", borderRadius: "var(--r-1)",
                      overflow: "visible", position: "relative",
                      cursor: adjusting ? "pointer" : "default",
                    }}
                    onClick={adjusting ? (e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDnaWeight(i, (e.clientX - rect.left) / rect.width);
                    } : undefined}
                    >
                      <div style={{
                        width: `${d.w*100}%`, height: "100%",
                        background: "var(--c-amber)", borderRadius: "var(--r-1)",
                        transition: "width .15s ease",
                      }}/>
                      {adjusting && (
                        <div style={{
                          position: "absolute", top: -4,
                          left: `${d.w*100}%`, transform: "translateX(-50%)",
                          width: 14, height: 14, borderRadius: "50%",
                          background:  "var(--c-amber)",
                          border: "2px solid var(--c-bg)",
                          boxShadow: "0 2px 8px rgba(0,0,0,.4)",
                          cursor: "ew-resize",
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const bar = e.currentTarget.parentElement;
                          const onMove = (ev) => {
                            const rect = bar.getBoundingClientRect();
                            setDnaWeight(i, Math.max(0.02, Math.min(0.90, (ev.clientX - rect.left) / rect.width)));
                          };
                          const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                          document.addEventListener("mousemove", onMove);
                          document.addEventListener("mouseup", onUp);
                        }}
                        />
                      )}
                    </div>
                    <span className="t-mono t-num" style={{
                      fontSize: "var(--fs-label)", width: 30, textAlign: "right",
                      color: adjusting ? "var(--c-amber)" : "var(--c-ink-3)",
                      fontWeight: adjusting ? 600 : 400,
                    }}>{Math.round(d.w*100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="t-label" style={{ marginBottom: 10 }}>Palette</div>
            <div style={{ display: "flex", gap: 6 }}>
              {palette.map((c, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{
                    height: 56, background: c, borderRadius: "var(--r-2)",
                    cursor: adjusting ? "pointer" : "default",
                    border: adjusting ? "2px solid transparent" : "none",
                    transition: "border-color .12s",
                  }}
                  onMouseEnter={e => { if (adjusting) e.currentTarget.style.borderColor = "var(--c-amber)"; }}
                  onMouseLeave={e => { if (adjusting) e.currentTarget.style.borderColor = "transparent"; }}
                  onClick={adjusting ? () => {
                    const ci = PALETTE_OPTIONS.indexOf(c);
                    setPalette(prev => prev.map((pc, pi) => pi === i ? PALETTE_OPTIONS[(ci + 1) % PALETTE_OPTIONS.length] : pc));
                  } : undefined}
                  />
                  {adjusting && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", textAlign: "center", marginTop: 4 }}>{c}</div>}
                </div>
              ))}
            </div>
            {adjusting && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 8, fontStyle: "italic" }}>Click a swatch to cycle colors</div>}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="t-label" style={{ marginBottom: 10 }}>Five rules of this world</div>
          {adjusting ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rules.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", width: 18, flexShrink: 0 }}>{i+1}.</span>
                  <input type="text" value={r}
                    onChange={e => setRules(prev => prev.map((pr, pi) => pi === i ? e.target.value : pr))}
                    style={{
                      flex: 1, background: "var(--c-panel-2)",
                      border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
                      padding: "8px 10px", color: "var(--c-ink-2)", fontSize: "var(--fs-body)",
                      fontFamily: "inherit", outline: "none",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--c-amber)"}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--c-line-2)"}
                  />
                </div>
              ))}
            </div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18, color: "var(--c-ink-2)", fontSize: "var(--fs-body)", lineHeight: 1.7 }}>
              {rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Refine pitch</button>
        <div style={{ display: "flex", gap: 8 }}>
          {adjusting ? (
            <button className="btn" onClick={() => setAdjusting(false)} style={{ borderColor: "var(--c-amber)", color: "var(--c-amber)" }}>
              ✓ Done adjusting
            </button>
          ) : (
            <button className="btn" onClick={() => setAdjusting(true)}>Adjust DNA</button>
          )}
          <button className="btn btn-primary" onClick={onCreate}>
            Configure financing <Icon name="chev-r" size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProducePhase({ producers, setProducers, onMint, onBack }) {
  const enabled = producers.enabled;
  const totalSupply = producers.tiers.reduce((s, t) => s + t.supply, 0);
  const totalRaise  = producers.tiers.reduce((s, t) => s + t.supply * t.price, 0);

  const setTier = (i, patch) => setProducers(p => ({
    ...p,
    tiers: p.tiers.map((t, idx) => idx === i ? { ...t, ...patch } : t),
  }));

  const fmtUSD = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const tierColors = [tkc("ink-4"), tkc("cat-3"), tkc("amber")];

  const doMint = () => {
    if (!enabled) { onMint(); return; }
    if (window.openPay) {
      window.openPay({
        kind: "nft",
        title: "Producer Pool",
        subtitle: "MINT ON BASE",
        accent: tkc("amber"),
        priceUSD: 0.18,
        items: producers.tiers.map((t, i) => ({
          label: t.name + " tier",
          sub: t.supply + " slots · " + fmtUSD(t.price) + " each",
          price: 0,
        })).concat([{ label: "Gas fee", sub: "Base L2", price: 0.18 }]),
        perks: [
          totalSupply + " producer slots across " + producers.tiers.length + " tiers",
          "Royalty split engine deployed",
          "Secondary market wired automatically",
          producers.royalty + "% creator royalty on all revenue",
        ],
        image: { color: "var(--c-amber)" },
        onConfirm: () => {
          if (window.toast) window.toast({ title: "MINTED", text: "Producer pool live on Base", kind: "good" });
          onMint();
        },
      });
    } else {
      // Never die silently — if the pay surface is missing, still create.
      if (window.toast) window.toast({ title: "MINTED", text: "Producer pool live on Base", kind: "good" });
      onMint();
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <div className="t-label" style={{ marginBottom: 6 }}>Financing</div>
        <h2 className="t-display" style={{
          margin: 0, fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em",
        }}>
          <span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>Producers,</span>{" "}
          you decide who gets in.
        </h2>
        <p style={{
          marginTop: 10, fontSize: "var(--fs-body)", color: "var(--c-ink-3)",
          maxWidth: 620, lineHeight: 1.5,
        }}>
          Mint a producer pool on-chain. Three tiers, three commitments.
          You keep <span style={{ color: "var(--c-amber)" }}>{producers.royalty}%</span> of all
          downstream revenue; the rest cascades to holders quarterly.
        </p>
      </div>

      {/* Enabled toggle */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px", marginBottom: 18,
        background: "var(--c-panel-2)",
        border: `1px solid ${enabled ? "var(--c-amber)" : "var(--c-line)"}`,
        borderRadius: "var(--r-2)",
      }}>
        <button onClick={() => setProducers(p => ({ ...p, enabled: !p.enabled }))}
          style={{
            width: 38, height: 22, borderRadius: "var(--r-3)",
            background: enabled ? "var(--c-amber)" : "var(--c-line-3)",
            border: "none", padding: 0, cursor: "pointer",
            position: "relative", flexShrink: 0,
          }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%", background: tkc("bg"),
            position: "absolute", top: 3, left: enabled ? 19 : 3,
            transition: "left .15s ease",
          }}/>
        </button>
        <div style={{ flex: 1 }}>
          <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", color: "var(--c-ink)" }}>
            {enabled ? "On-chain producer pool" : "Skip financing · self-produced"}
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>
            {enabled
              ? `${totalSupply} producer slots · ≈ ${fmtUSD(totalRaise)} target raise`
              : "You retain 100%. You can always mint later from Studio → Mint."}
          </div>
        </div>
        {enabled && (
          <div className="t-mono t-num" style={{ fontSize: "var(--fs-title)", fontWeight: 500, color: "var(--c-amber)" }}>
            {fmtUSD(totalRaise)}
          </div>
        )}
      </div>

      {enabled && (
        <>
          {/* Royalty split + supply */}
          <div className="panel" style={{ padding: 22, borderRadius: "var(--r-3)", marginBottom: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div className="t-label" style={{ marginBottom: 8 }}>
                  Creator royalty · you keep <span style={{ color: "var(--c-amber)" }}>{producers.royalty}%</span>
                </div>
                <input type="range" min="30" max="90" step="5" value={producers.royalty}
                  onChange={(e) => setProducers(p => ({ ...p, royalty: +e.target.value }))}
                  style={{ width: "100%", accentColor: tkc("amber") }}/>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  color: "var(--c-ink-4)", marginTop: 4,
                }}>
                  <span>30% · max holder share</span>
                  <span>90% · nominal</span>
                </div>
              </div>
              <div>
                <div className="t-label" style={{ marginBottom: 8 }}>
                  Total slots · <span style={{ color: "var(--c-amber)" }}>{totalSupply}</span>
                </div>
                <div style={{ display: "flex", gap: 4, height: 28 }}>
                  {producers.tiers.map((t, i) => (
                    <div key={i} style={{
                      flex: t.supply,
                      background: tierColors[i],
                      borderRadius: "var(--r-1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("bg"),
                      fontWeight: 600,
                    }} title={`${t.name} · ${t.supply}`}>{t.supply}</div>
                  ))}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  color: "var(--c-ink-4)", marginTop: 6,
                }}>
                  {producers.tiers.map(t => <span key={t.name}>{t.name}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Tier cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
            {producers.tiers.map((t, i) => (
              <div key={i} className="panel" style={{
                padding: 18, borderRadius: "var(--r-3)",
                borderTop: `2px solid ${tierColors[i]}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", fontWeight: 500 }}>{t.name}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
                    TIER {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                <label style={{ display: "block", marginBottom: 12 }}>
                  <div className="t-label" style={{ marginBottom: 4, color: tierColors[i] }}>
                    Price · {fmtUSD(t.price)}
                  </div>
                  <input type="range"
                    min={i === 0 ? 25 : i === 1 ? 250 : 5000}
                    max={i === 0 ? 250 : i === 1 ? 5000 : 100000}
                    step={i === 0 ? 25 : i === 1 ? 250 : 2500}
                    value={t.price}
                    onChange={(e) => setTier(i, { price: +e.target.value })}
                    style={{ width: "100%", accentColor: tierColors[i] }}/>
                </label>

                <label style={{ display: "block", marginBottom: 12 }}>
                  <div className="t-label" style={{ marginBottom: 4, color: tierColors[i] }}>
                    Supply · {t.supply}
                  </div>
                  <input type="range"
                    min={i === 0 ? 10 : i === 1 ? 5 : 1}
                    max={i === 0 ? 500 : i === 1 ? 100 : 25}
                    value={t.supply}
                    onChange={(e) => setTier(i, { supply: +e.target.value })}
                    style={{ width: "100%", accentColor: tierColors[i] }}/>
                </label>

                <textarea
                  value={t.perks}
                  onChange={(e) => setTier(i, { perks: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%", padding: 10, resize: "none",
                    background: "transparent", border: "1px solid var(--c-line)",
                    borderRadius: "var(--r-2)", color: "var(--c-ink-2)",
                    fontSize: "var(--fs-body)", lineHeight: 1.4,
                    fontFamily: "var(--f-sans)",
                  }}/>

                <div style={{
                  marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--c-line)",
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".08em",
                }}>
                  <span>Tier raise</span>
                  <span style={{ color: tierColors[i], fontWeight: 600 }}>
                    {fmtUSD(t.price * t.supply)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary strip */}
          <div className="panel" style={{
            padding: "16px 22px", borderRadius: "var(--r-2)",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          }}>
            <NFStat label="Target raise"   value={fmtUSD(totalRaise)} amber/>
            <NFStat label="Producer slots" value={totalSupply}/>
            <NFStat label="Holder cascade" value={`${100 - producers.royalty}% · quarterly`}/>
            <NFStat label="Mint cost"      value={"$ 0.18 gas"}/>
          </div>
        </>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back to bible</button>
        <button className="btn btn-primary" onClick={doMint}
          style={{ height: 38, padding: "0 22px" }}>
          {enabled
            ? <><Icon name="spark" size={12}/> Mint &amp; open studio</>
            : <>Open studio <Icon name="chev-r" size={12}/></>}
        </button>
      </div>
    </div>
  );
}

function NFStat({ label, value, amber }) {
  return <CinaStat size="sm" label={label} value={value} tone={amber ? "accent" : undefined}/>;
}

Object.assign(window, { NewFilmFlow });
