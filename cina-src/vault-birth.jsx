// vault-birth.jsx — Birth a Performer · rebuilt working flow
//
// A clean 4-step wizard that actually produces a usable performer and
// hands them to the Vault pipeline at the Identity stage:
//
//   1. BRIEF    — describe the performer (Cina can draft the brief)
//   2. CAST     — generate 6 candidate faces, pick one (re-cast freely)
//   3. PERSONA  — name + archetype + range + voice + bio
//                 ("✦ Cina writes the persona" auto-fills from the brief)
//   4. BORN     — confirmation; lands in the Vault at Identity · unlocked
//
// Overrides window.ActorCreator. Used by VaultPanel (vault-v2.jsx).

const { useState: useStateBR, useEffect: useEffectBR, useRef: useRefBR } = React;

// ─── Candidate face (richer than v1: lighting, film frame) ──────────────

function BirthFace({ seed, palette, size = 240, selected, label, sub }) {
  const [bg1, bg2, accent] = palette;
  const id = `bf-${seed}`;
  const skin = `hsl(${(seed * 47) % 50 + 22}, ${26 + (seed % 14)}%, ${46 + (seed % 16)}%)`;
  const hair = `hsl(${(seed * 13) % 44 + 12}, ${18 + (seed % 26)}%, ${9 + (seed % 20)}%)`;
  const eyes = `hsl(${(seed * 17) % 30 + 12}, 32%, 24%)`;
  const W = size, H = size * 1.25;
  const cx = W * 0.5, cy = H * 0.4, headR = W * 0.3;
  const beard = (seed % 5) > 2;
  const hairLong = (seed % 3) === 0;

  return (
    <div style={{
      position: "relative", borderRadius: "var(--r-2)", overflow: "hidden",
      border: selected ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
      boxShadow: selected ? "0 0 0 3px rgba(var(--accent-rgb),.18), 0 16px 40px rgba(0,0,0,.5)" : "0 6px 18px rgba(0,0,0,.4)",
      transition: "border-color .14s, box-shadow .2s, transform .14s",
      transform: selected ? "translateY(-2px)" : "none",
    }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={bg2} stopOpacity="0.6"/>
            <stop offset="0.55" stopColor={bg1}/>
            <stop offset="1" stopColor={tkc("black")}/>
          </linearGradient>
          <radialGradient id={`${id}-key`} cx="22%" cy="20%" r="75%">
            <stop offset="0" stopColor= "var(--c-amber)" stopOpacity="0.4"/>
            <stop offset="0.7" stopColor= "var(--c-amber)" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={`${id}-rim`} cx="92%" cy="55%" r="60%">
            <stop offset="0" stopColor={accent} stopOpacity="0.5"/>
            <stop offset="0.7" stopColor={accent} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${id})`}/>
        {/* shoulders */}
        <ellipse cx={cx} cy={H + headR * 0.15} rx={W * 0.52} ry={headR * 1.3} fill={tkc("void")} opacity="0.9"/>
        <path d={`M ${cx - W*0.42} ${H} Q ${cx} ${H - headR*1.6} ${cx + W*0.42} ${H} Z`} fill={`${bg1}`} opacity="0.5"/>
        {/* neck */}
        <rect x={cx - headR * 0.3} y={cy + headR * 0.7} width={headR * 0.6} height={headR * 0.7} fill={skin} opacity="0.92"/>
        {/* head */}
        <ellipse cx={cx} cy={cy} rx={headR * 0.9} ry={headR * 1.06} fill={skin}/>
        {/* shadow side */}
        <ellipse cx={cx + headR * 0.42} cy={cy + headR * 0.2} rx={headR * 0.46} ry={headR * 0.6} fill={tkc("black")} opacity="0.2"/>
        {/* hair */}
        <path d={`M ${cx - headR * 0.96} ${cy + headR * (hairLong ? 0.7 : 0.25)} Q ${cx} ${cy - headR * 1.5}, ${cx + headR * 0.96} ${cy + headR * (hairLong ? 0.7 : 0.25)} L ${cx + headR * 0.82} ${cy - headR*0.1} Q ${cx} ${cy - headR*0.7} ${cx - headR * 0.82} ${cy - headR*0.1} Z`} fill={hair}/>
        {/* eyes */}
        <ellipse cx={cx - headR * 0.28} cy={cy} rx={headR * 0.1} ry={headR * 0.05} fill={tkc("white")} opacity="0.75"/>
        <ellipse cx={cx + headR * 0.28} cy={cy} rx={headR * 0.1} ry={headR * 0.05} fill={tkc("white")} opacity="0.75"/>
        <circle cx={cx - headR * 0.28} cy={cy} r={headR * 0.045} fill={eyes}/>
        <circle cx={cx + headR * 0.28} cy={cy} r={headR * 0.045} fill={eyes}/>
        {/* brow */}
        <path d={`M ${cx - headR*0.42} ${cy - headR*0.18} Q ${cx - headR*0.28} ${cy - headR*0.26} ${cx - headR*0.12} ${cy - headR*0.16}`} stroke={hair} strokeWidth={headR*0.05} fill="none" opacity="0.7"/>
        <path d={`M ${cx + headR*0.12} ${cy - headR*0.16} Q ${cx + headR*0.28} ${cy - headR*0.26} ${cx + headR*0.42} ${cy - headR*0.18}`} stroke={hair} strokeWidth={headR*0.05} fill="none" opacity="0.7"/>
        {/* nose + mouth */}
        <path d={`M ${cx} ${cy + headR*0.05} L ${cx - headR*0.08} ${cy + headR*0.34} L ${cx + headR*0.06} ${cy + headR*0.34}`} fill={tkc("black")} opacity="0.18"/>
        <path d={`M ${cx - headR * 0.2} ${cy + headR * 0.56} Q ${cx} ${cy + headR * 0.62}, ${cx + headR * 0.2} ${cy + headR * 0.56}`} stroke={tkc("blood")} strokeWidth={headR * 0.05} fill="none" strokeLinecap="round" opacity="0.8"/>
        {/* beard */}
        {beard && <ellipse cx={cx} cy={cy + headR*0.6} rx={headR*0.5} ry={headR*0.4} fill={hair} opacity="0.4"/>}
        {/* light passes */}
        <rect width={W} height={H} fill={`url(#${id}-key)`}/>
        <rect width={W} height={H} fill={`url(#${id}-rim)`}/>
      </svg>
      {label && (
        <div style={{
          position: "absolute", bottom: 6, left: 8, right: 8,
          fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
          color: "rgba(255,255,255,0.75)", letterSpacing: ".16em",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{label}</span>
          {selected ? <span style={{ color: "var(--c-amber)" }}>● PICKED</span> : sub ? <span style={{ opacity: 0.55 }}>{sub}</span> : null}
        </div>
      )}
    </div>
  );
}

// ─── Real casting pool — Cina casts from its roster of trained performers ──
// Birth-a-performer shows REAL headshots (assets/cast/*.png) as candidates
// instead of procedural faces. The pick carries its photo through the whole
// pipeline (roster, stills, motion) because VFace renders c.photo.
const CAST_POOL = [
  { castId: "io-marsh",    castName: "Io Marsh",    photo: "assets/cast/io-marsh.png",    color: tkc("cat-6") },
  { castId: "rune-okafor", castName: "Rune Okafor", photo: "assets/cast/rune-okafor.png", color: tkc("cat-5") },
  { castId: "calo-vey",    castName: "Calo Vey",    photo: "assets/cast/calo-vey.png",    color: tkc("blood") },
  { castId: "wren-soto",   castName: "Wren Soto",   photo: "assets/cast/wren-soto.png",   color: tkc("cat-6") },
  { castId: "evren-koll",  castName: "Evren Koll",  photo: "assets/cast/evren-koll.png",  color: tkc("cat-3") },
  { castId: "nadya-ash",   castName: "Nadya Ash",   photo: "assets/cast/nadya-ash.png",   color: tkc("ink-3") },
  { castId: "domek-ari",   castName: "Domek Ari",   photo: "assets/cast/domek-ari.png",   color: tkc("cat-6") },
  { castId: "siri-vale",   castName: "Siri Vale",   photo: "assets/cast/siri-vale.png",   color: tkc("cat-5") },
];

// Photoreal candidate portrait. Renders the real headshot; falls back to the
// procedural BirthFace only if a candidate has no photo.
function BirthPortrait({ c, size = 240, selected, label, sub, block }) {
  if (c && c.photo) {
    return (
      <div style={{ position: "relative", width: block ? size : "100%", aspectRatio: "3/4", borderRadius: "var(--r-2)", overflow: "hidden", background: tkc("bg"), border: selected ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)", boxShadow: selected ? "0 0 0 3px rgba(var(--accent-rgb),.2)" : "none", transition: "border-color .15s, box-shadow .15s" }}>
        <img src={c.photo} alt={c.castName || ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.88) 2%, rgba(8,8,10,0) 42%)" }}/>
        {label && <div style={{ position: "absolute", top: 8, left: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), background: "rgba(8,8,10,.6)", padding: "2px 7px", borderRadius: "var(--r-1)" }}>{label}</div>}
        {selected && <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", fontSize: "var(--fs-label)", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}
        <div style={{ position: "absolute", left: 11, bottom: 10, right: 11 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.05, textShadow: "0 1px 6px rgba(0,0,0,.7)" }}>{c.castName}</div>
          {sub && <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.62)", marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
    );
  }
  return window.BirthFace ? window.BirthFace({ seed: c.seed, palette: c.palette, size, selected, label, sub }) : null;
}

// ─── Step dots ──────────────────────────────────────────────────────────

function BirthSteps({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: i <= current ? 1 : 0.4 }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              border: `1px solid ${i === current ? "var(--c-amber)" : i < current ? "var(--c-amber)" : "var(--c-line-2)"}`,
              background: i < current ? "var(--c-amber)" : "transparent",
              color: i < current ? tkc("on-amber") : i === current ? "var(--c-amber)" : "var(--c-ink-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
            }}>{i < current ? "✓" : i + 1}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: i === current ? "var(--c-ink)" : "var(--c-ink-3)" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <span style={{ width: 22, height: 1, background: "var(--c-line)" }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Brief presets ────────────────────────────────────────────────────

const BRIEF_PRESETS = [
  "A weathered drifter, mid-50s. Salt-pepper stubble, eyes that have seen too much. Speaks rarely.",
  "A composed gallerist, early 30s. Sharp cheekbones, says less than she knows. Cold elegance.",
  "A tired detective, 40s. Heavy build, kind face under the exhaustion. Old-school.",
  "A luminous young woman, late 20s. The kind of face a whole film orbits. Doomed glamour.",
  "An ageless figure, indeterminate. Androgynous, unsettling calm. Could be anyone's memory.",
];

// ─── Main flow ──────────────────────────────────────────────────────────

function BirthPerformer({ onClose, onCreate }) {
  const [step, setStep] = useStateBR(0);
  const [brief, setBrief] = useStateBR("");
  const [candidates, setCandidates] = useStateBR([]);
  const [casting, setCasting] = useStateBR(false);
  const [picked, setPicked] = useStateBR(null);
  const [identity, setIdentity] = useStateBR({ name: "", archetype: "", range: [], voice: "", bio: "" });
  const [birthing, setBirthing] = useStateBR(false);
  const [cinaDrafting, setCinaDrafting] = useStateBR(false);
  const [cinaPersona, setCinaPersona] = useStateBR(false);
  const toast = (typeof useToast === "function") ? useToast() : { push: () => {} };

  const steps = ["BRIEF", "CAST", "PERSONA", "BORN"];
  const pickedCandidate = candidates.find(c => c.id === picked);

  // ── Cast 6 candidates from the real talent pool
  const cast = () => {
    setCasting(true);
    setPicked(null);
    setTimeout(() => {
      const shuffled = [...CAST_POOL].sort(() => Math.random() - 0.5).slice(0, 6);
      setCandidates(shuffled.map((p, i) => ({
        id: `cand${i + 1}`,
        castId: p.castId, castName: p.castName, photo: p.photo,
        color: p.color, palette: [p.color, tkc("bg"), tkc("amber-x")],
        seed: 100 + i * 23 + Math.floor(Math.random() * 60),
      })));
      setCasting(false);
    }, 1300);
  };

  // ── Cina drafts the brief
  const cinaBrief = async () => {
    setCinaDrafting(true);
    try {
      const r = await window.claude.complete(`You are Cina, a casting director. Write a vivid one-to-two sentence physical casting brief for an original film performer. Be specific about age, face, build, and presence. No name. Under 40 words. Return ONLY the brief, no quotes.`);
      setBrief(r.trim().replace(/^["']|["']$/g, ""));
    } catch (e) {
      setBrief(BRIEF_PRESETS[Math.floor(Math.random() * BRIEF_PRESETS.length)]);
    } finally { setCinaDrafting(false); }
  };

  // ── Cina writes the persona from brief + face
  const writePersona = async () => {
    setCinaPersona(true);
    try {
      const r = await window.claude.complete(`You are Cina, a casting director naming a new film performer based on this brief: "${brief}".
Respond with VALID JSON only, no fences:
{
  "name": "A two-word invented stage name, memorable, not a real celebrity",
  "archetype": "one of: The Watcher, The Captain, The Almost-Sayer, The Holder of Lines, The Witness, The Bright One, The Signal",
  "range": ["2-3 of: Drama, Sci-fi, Horror, Comedy, Western, Romance, Action, Period, Thriller, Noir"],
  "voice": "one of: Soprano · Bright, Alto · Salt, Mezzo · Smoke, Tenor · Warm, Baritone · Quiet, Bass · Resonant",
  "bio": "one evocative sentence about what's in their face"
}`);
      const j = JSON.parse(r.match(/\{[\s\S]*\}/)?.[0] || "{}");
      setIdentity(prev => ({
        name: j.name || prev.name,
        archetype: j.archetype || prev.archetype,
        range: Array.isArray(j.range) ? j.range : prev.range,
        voice: j.voice || prev.voice,
        bio: j.bio || prev.bio,
      }));
    } catch (e) {
      toast.push({ kind: "info", agent: "director", title: "Cina is offline", message: "Fill the persona manually." });
    } finally { setCinaPersona(false); }
  };

  const born = () => {
    setBirthing(true);
    setTimeout(() => {
      setBirthing(false);
      if (onCreate && pickedCandidate) {
        onCreate({
          id: "ac_" + Date.now().toString(36),
          name: (identity.name || "New Performer").toUpperCase(),
          role: identity.archetype || "Cast",
          actor: "—", age: 30,
          desc: identity.bio || brief || `${identity.archetype || "Performer"}. Born today.`,
          traits: Array.isArray(identity.range) ? identity.range.slice(0, 3).map(s => s.toLowerCase()) : ["new"],
          color: pickedCandidate.palette[0],
          photo: pickedCandidate.photo,
          castName: pickedCandidate.castName,
          castId: pickedCandidate.castId,
          refs: 6,
          archetype: identity.archetype,
          range: Array.isArray(identity.range) ? identity.range : [],
          voice: identity.voice,
          credits: 0, films: 0, training: 62, lastUsed: "Just now",
          seed: pickedCandidate.seed, palette: pickedCandidate.palette,
          born: true, brief,
        });
      }
      setStep(3);
    }, 1600);
  };

  const reset = () => {
    setStep(0); setBrief(""); setCandidates([]); setPicked(null);
    setIdentity({ name: "", archetype: "", range: [], voice: "", bio: "" });
  };

  const canNext = (step === 0 && brief.trim()) || (step === 1 && picked) || (step === 2 && identity.name && identity.archetype);

  return (
    <div style={{ width: "100%", height: "100%", background: "var(--c-bg)", color: "var(--c-ink)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@keyframes brPulse { 0%,100% { opacity:.35 } 50% { opacity:1 } }`}</style>
      {/* Header */}
      <div style={{ padding: "18px 32px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>VAULT · CASTING</span>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 }}>Birth a performer</span>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <BirthSteps steps={steps} current={step}/>
        </div>
        <button onClick={onClose} style={{ padding: "8px 14px", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: 999, color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer" }} aria-label="Close" title="Close">Cancel</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "26px 40px", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {/* STEP 1 — BRIEF */}
          {step === 0 && (
            <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18, paddingTop: 12 }}>
              <div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em" }}>Describe the performer.</div>
                <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, marginTop: 8, maxWidth: 560 }}>
                  Age, face, build, presence. Cina turns this into six candidate faces. You'll pick one and lock it.
                </p>
              </div>
              <textarea value={brief} onChange={e => setBrief(e.target.value)} rows={4} autoFocus
                placeholder="A weathered drifter, mid-50s. Salt-pepper stubble, eyes that have seen too much."
                style={{
                  width: "100%", padding: "14px 16px",
                  background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
                  fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.5, outline: "none", resize: "vertical",
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                }}/>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={cinaBrief} disabled={cinaDrafting} style={{
                  padding: "8px 14px", background: "transparent", color:  "var(--c-amber)",
                  border: "1px solid var(--c-amber)", borderRadius: 999, cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                }}>{cinaDrafting ? "Cina drafting…" : "✦ Cina drafts a brief"}</button>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>OR START FROM</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {BRIEF_PRESETS.map((p, i) => (
                  <button key={i} onClick={() => setBrief(p)} style={{
                    padding: "6px 11px", fontSize: "var(--fs-label)", textAlign: "left",
                    background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
                    color: "var(--c-ink-3)", cursor: "pointer", maxWidth: 340,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }} title={p}>{p.slice(0, 44)}…</button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — CAST */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, letterSpacing: "-0.02em" }}>Pick the face that holds the role.</div>
                  <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6, maxWidth: 520, fontStyle: "italic", fontFamily: "var(--f-display)" }}>"{brief}"</p>
                </div>
                <button onClick={cast} disabled={casting} style={{
                  padding: "9px 16px", whiteSpace: "nowrap",
                  background: casting ? "var(--c-panel-3)" : candidates.length ? "transparent" :  "var(--c-amber)",
                  color: casting ? "var(--c-ink-4)" : candidates.length ? "var(--c-amber)" : tkc("on-amber"),
                  border: candidates.length && !casting ? "1px solid var(--c-amber)" : "none",
                  borderRadius: 999, cursor: casting ? "default" : "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                }}>{casting ? "Casting…" : candidates.length ? "↻ Re-cast" : "✦ Cast 6 candidates"}</button>
              </div>

              {candidates.length === 0 && !casting && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)" }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink-2)" }}>Ready to cast.</div>
                  <div style={{ fontSize: "var(--fs-body)" }}>Hit "Cast 6 candidates" to generate faces from your brief.</div>
                </div>
              )}
              {casting && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 110px)", gap: 12 }}>
                    {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 110, height: 138, background: "var(--c-panel-2)", borderRadius: "var(--r-2)", border: "1px solid var(--c-line)", animation: `brPulse 1.4s ${i*0.1}s infinite` }}/>)}
                  </div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>Casting six candidates…</div>
                </div>
              )}
              {candidates.length > 0 && !casting && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingBottom: 8 }}>
                  {candidates.map((c, i) => (
                    <button key={c.id} onClick={() => setPicked(c.id)} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}>
                      <BirthPortrait c={c} selected={picked === c.id} label={`CAND ${String(i + 1).padStart(2, "0")}`} sub={`SCREEN TEST`} size={300}/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — PERSONA */}
          {step === 2 && pickedCandidate && (
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 36, height: "100%" }}>
              <div style={{ alignSelf: "start", display: "flex", flexDirection: "column", gap: 12 }}>
                <BirthPortrait c={pickedCandidate} size={280}/>
                <button onClick={writePersona} disabled={cinaPersona} style={{
                  padding: "10px 14px", background: cinaPersona ? "var(--c-panel-3)" :  "var(--c-amber)",
                  color: cinaPersona ? "var(--c-ink-4)" : tkc("on-amber"), border: "none", borderRadius: "var(--r-2)", cursor: cinaPersona ? "default" : "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                }}>{cinaPersona ? "Cina writing…" : "✦ Cina writes persona"}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", paddingRight: 8 }}>
                <BRField label="STAGE NAME" hint="Two words. Memorable, not real.">
                  <input value={identity.name} onChange={e => setIdentity(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Nadya Ash"
                    style={{ width: "100%", padding: "8px 0", background: "transparent", border: "none", borderBottom: "1px solid var(--c-line-2)", fontSize: "var(--fs-title)", fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--c-ink)", outline: "none" }}/>
                </BRField>
                <BRField label="ARCHETYPE" hint="One role they always carry.">
                  <BRChips items={["The Watcher","The Captain","The Almost-Sayer","The Holder of Lines","The Witness","The Bright One","The Signal"]} value={identity.archetype} onChange={v => setIdentity(p => ({ ...p, archetype: v }))}/>
                </BRField>
                <BRField label="RANGE" hint="Genres they read in.">
                  <BRChips items={["Drama","Sci-fi","Horror","Comedy","Western","Romance","Action","Period","Thriller","Noir"]} value={identity.range} onChange={v => setIdentity(p => ({ ...p, range: v }))} multi/>
                </BRField>
                <BRField label="VOICE">
                  <BRChips items={["Soprano · Bright","Alto · Salt","Mezzo · Smoke","Tenor · Warm","Baritone · Quiet","Bass · Resonant"]} value={identity.voice} onChange={v => setIdentity(p => ({ ...p, voice: v }))}/>
                </BRField>
                <BRField label="BIO" hint="One line. What's in their face.">
                  <textarea value={identity.bio} onChange={e => setIdentity(p => ({ ...p, bio: e.target.value }))} rows={2}
                    placeholder="A face that holds a smile two seconds too long."
                    style={{ width: "100%", padding: "10px 12px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.5, resize: "vertical", outline: "none", fontFamily: "var(--f-display)", fontStyle: "italic" }}/>
                </BRField>
              </div>
            </div>
          )}

          {/* STEP 4 — BORN */}
          {step === 3 && pickedCandidate && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 22, textAlign: "center" }}>
              <BirthPortrait c={pickedCandidate} size={210} block/>
              <div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6 }}>BORN · ENTERING THE PIPELINE</div>
                <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>{identity.name}</h2>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 }}>{identity.archetype} · {Array.isArray(identity.range) ? identity.range.join(" · ") : identity.range}</div>
              </div>
              <div style={{ maxWidth: 540, padding: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 10 }}>NEXT · LOCK THE IDENTITY</div>
                <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: 0, fontStyle: "italic", fontFamily: "var(--f-display)" }}>
                  {identity.name} starts with 6 reference faces. Open them in the Vault and run <b style={{ color: "var(--c-amber)" }}>Lock identity</b> to train the LoRA — then Stills, Motion, and Voice unlock.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={reset} style={{ padding: "10px 18px", fontSize: "var(--fs-body)", background: "transparent", color: "var(--c-ink)", border: "1px solid var(--c-line-2)", borderRadius: 999, cursor: "pointer" }}>Birth another</button>
                <button onClick={onClose} style={{ padding: "10px 24px", fontSize: "var(--fs-body)", fontWeight: 600, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", borderRadius: 999, cursor: "pointer" }} aria-label="Close" title="Close">Open in Vault →</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {step < 3 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--c-line)", marginTop: 14 }}>
            <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} style={{
              padding: "8px 14px", fontSize: "var(--fs-body)", background: "transparent", border: "1px solid var(--c-line-2)",
              color: step === 0 ? "var(--c-ink-4)" : "var(--c-ink-2)", borderRadius: 999, cursor: step === 0 ? "default" : "pointer",
            }}>← Back</button>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>STEP {step + 1} OF 3</span>
            {step === 2 ? (
              <button onClick={born} disabled={!canNext || birthing} style={{
                padding: "9px 22px", fontSize: "var(--fs-body)", fontWeight: 600,
                background: canNext && !birthing ? "var(--c-amber)" : "var(--c-panel-3)",
                color: canNext && !birthing ? tkc("on-amber") : "var(--c-ink-4)",
                border: "none", borderRadius: 999, cursor: canNext && !birthing ? "pointer" : "default",
              }}>{birthing ? "Birthing…" : "Birth performer ✦"}</button>
            ) : (
              <button onClick={() => {
                if (step === 0 && candidates.length === 0) { setStep(1); setTimeout(cast, 60); }
                else if (canNext) setStep(step + 1);
              }} disabled={!canNext && !(step === 0 && brief.trim())} style={{
                padding: "8px 18px", fontSize: "var(--fs-body)", fontWeight: 600,
                background: (canNext || (step === 0 && brief.trim())) ? "var(--c-amber)" : "var(--c-panel-3)",
                color: (canNext || (step === 0 && brief.trim())) ? tkc("on-amber") : "var(--c-ink-4)",
                border: "none", borderRadius: 999, cursor: (canNext || (step === 0 && brief.trim())) ? "pointer" : "default",
              }}>Next →</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BRField({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{hint}</div>}
    </div>
  );
}
function BRChips({ items, value, onChange, multi }) {
  const v = multi ? (Array.isArray(value) ? value : []) : value;
  const on = (i) => multi ? v.includes(i) : v === i;
  const toggle = (i) => multi ? onChange(v.includes(i) ? v.filter(x => x !== i) : [...v, i]) : onChange(i);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map(i => (
        <button key={i} onClick={() => toggle(i)} style={{
          padding: "6px 12px", fontSize: "var(--fs-body)",
          background: on(i) ? "rgba(var(--accent-rgb),.12)" : "transparent",
          border: `1px solid ${on(i) ? "var(--c-amber)" : "var(--c-line-2)"}`,
          color: on(i) ? "var(--c-amber)" : "var(--c-ink-3)", borderRadius: 999, cursor: "pointer",
        }}>{i}</button>
      ))}
    </div>
  );
}

// Override the birth flow + expose the richer candidate face
window.ActorCreator = BirthPerformer;
window.BirthFace = BirthFace;
