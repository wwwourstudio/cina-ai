// actor-ai-studio.jsx — Cina's AI image + video pipeline for Cast
//
// Route: /cast/:id/studio
//
// This is where a director (or the actor's owner) takes a Cina performer
// from "a face the platform invented" → "a fully photoreal, locked-identity
// human you can drop into any scene, commercial, or branched cut."
//
// Five stages, each a tab:
//
//   1. Identity      — train the face. Flux LoRA. 15-30 refs, ~20 min.
//                       Outputs a locked identity hash that every later
//                       render must match.
//
//   2. Stills        — generate photoreal stills with the locked identity.
//                       Wardrobe, lighting, pose, focal length controls.
//                       Cost & continuity score per output.
//
//   3. Motion        — text-to-video (Veo 3 / Sora 2) using a Stills frame
//                       as start conditioning. Camera moves, dialogue,
//                       8s native audio.
//
//   4. Talking       — Hedra Character-3 for full lip-sync to a script.
//                       Pairs voice clone (ElevenLabs v3) with face.
//
//   5. Commercials   — placement into branded scenarios. The full pitch
//                       deck for the actor — "this is what you can sell
//                       them in." Drag-pick template, render, deliver.
//
// Recommended stack (we say it on the Identity tab too):
//   stills      → Flux 1.1 Pro Ultra + custom LoRA
//   motion      → Veo 3 (image+text → video w/ audio)
//   talking     → Hedra Character-3 + ElevenLabs v3
//   continuity  → InstantID face embedding for per-render match score

const { useState: usAS, useEffect: ueAS, useMemo: umAS, useRef: urAS, useCallback: ucAS } = React;

// ─── Engines catalog ────────────────────────────────────────────────────

const AI_ENGINES = {
  stills: [
    {
      id: "flux-1.1-pro-ultra",
      vendor: "Black Forest Labs",
      name: "Flux 1.1 [pro] Ultra",
      blurb: "Best-in-class photorealism. Native LoRA support. 2k native res.",
      recommended: true,
      pricePerImage: 0.06,
      avgSec: 7,
      strengths: ["photoreal", "loRA", "consistent skin"],
      max: "2048×2048",
    },
    {
      id: "recraft-v3",
      vendor: "Recraft",
      name: "Recraft V3",
      blurb: "Strong on typography & product placement. Slightly stylized faces.",
      pricePerImage: 0.04,
      avgSec: 9,
      strengths: ["product", "type"],
      max: "2048×2048",
    },
    {
      id: "ideogram-3",
      vendor: "Ideogram",
      name: "Ideogram 3",
      blurb: "Photoreal w/ excellent prompt adherence. No LoRA today.",
      pricePerImage: 0.04,
      avgSec: 6,
      strengths: ["prompt fidelity", "fast"],
      max: "1536×1536",
    },
    {
      id: "gpt-image-1",
      vendor: "OpenAI",
      name: "gpt-image-1",
      blurb: "Best at compositional reasoning. Slower. No LoRA today.",
      pricePerImage: 0.19,
      avgSec: 22,
      strengths: ["reasoning", "in-context edits"],
      max: "1792×1024",
    },
  ],
  motion: [
    {
      id: "veo-3",
      vendor: "Google",
      name: "Veo 3",
      blurb: "Cinema-grade T2V & I2V with native audio. 8s clips, 4K. Best for commercials.",
      recommended: true,
      pricePerSecond: 0.75,
      avgSecPerClipSec: 14,
      strengths: ["audio", "cinema", "I2V"],
      max: "3840×2160 · 8s",
    },
    {
      id: "sora-2",
      vendor: "OpenAI",
      name: "Sora 2",
      blurb: "Narrative-strong. Up to 20s. Excellent multi-shot. Audio.",
      pricePerSecond: 0.60,
      avgSecPerClipSec: 16,
      strengths: ["narrative", "long", "audio"],
      max: "1920×1080 · 20s",
    },
    {
      id: "kling-2.5",
      vendor: "Kuaishou",
      name: "Kling 2.5",
      blurb: "Best motion fidelity. Strong character preservation. Image-to-video.",
      pricePerSecond: 0.45,
      avgSecPerClipSec: 10,
      strengths: ["I2V", "motion", "character"],
      max: "1920×1080 · 10s",
    },
    {
      id: "runway-gen4",
      vendor: "Runway",
      name: "Gen-4 Turbo",
      blurb: "Fast iteration loops. VFX-friendly. Strong for B-roll & inserts.",
      pricePerSecond: 0.50,
      avgSecPerClipSec: 6,
      strengths: ["fast", "VFX"],
      max: "1920×1080 · 10s",
    },
  ],
  talking: [
    {
      id: "hedra-character-3",
      vendor: "Hedra",
      name: "Character-3",
      blurb: "Audio-driven face animation. Best lip-sync on the market.",
      recommended: true,
      pricePerSecond: 0.30,
      strengths: ["lip-sync", "emotion"],
      max: "1080p · any length",
    },
    {
      id: "heygen-avatar-iv",
      vendor: "HeyGen",
      name: "Avatar IV",
      blurb: "Polished talking head. Custom backgrounds. Slightly stiff body.",
      pricePerSecond: 0.25,
      strengths: ["polish", "background"],
      max: "1080p",
    },
    {
      id: "sync-so",
      vendor: "Sync",
      name: "Sync 2.0",
      blurb: "Re-dub any existing Motion clip. Fast retakes.",
      pricePerSecond: 0.20,
      strengths: ["retake", "dub"],
      max: "1080p",
    },
  ],
  voice: [
    {
      id: "eleven-v3",
      vendor: "ElevenLabs",
      name: "Voice v3 · Clone",
      blurb: "Clone from 30s. 32 languages. Whisper-to-shout range.",
      recommended: true,
      pricePerMinute: 0.30,
    },
    {
      id: "cartesia-sonic",
      vendor: "Cartesia",
      name: "Sonic 2",
      blurb: "Fastest realtime voice. Lower latency. Smaller emotional range.",
      pricePerMinute: 0.20,
    },
  ],
};

// ─── Cast (read from window if available, else local fallback) ──────────

function getStudioActor(id) {
  const fromCast = (typeof window !== "undefined" && typeof window.getCast === "function") ? window.getCast(id) : null;
  if (fromCast) return fromCast;
  // Fallback skeleton so the studio still renders even without /cast data
  return {
    id, name: "Untitled Performer",
    role: "Cast", actor: "—", age: 32,
    desc: "An actor on Cina.",
    color: tkc("cat-3"), traits: ["new"],
    archetype: "Performer", range: ["Drama"], voice: "Tenor",
    seed: 4242, palette: [tkc("cat-3"), tkc("on-amber"), tkc("amber-x")], born: false,
  };
}

// ─── Identity reference set (deterministic placeholder, not real images) ─

function refSeed(actorId, idx) {
  let h = 0;
  for (let i = 0; i < actorId.length; i++) h = (h * 31 + actorId.charCodeAt(i)) & 0xffffffff;
  return (h ^ (idx * 73)) >>> 0;
}

function PortraitPlaceholder({ actor, label, w = "100%", h = "100%", aspect = "3/4", idx = 0, photoStatus = "synthetic" }) {
  const s = refSeed(actor.id, idx);
  const hue = (s % 360);
  const accent = actor.color || tkc("cat-3");
  // Real cast members render their canonical CastPortrait face. Per-ref
  // variation (zoom / flip / lighting) makes a grid of refs read as a contact
  // sheet of the SAME face under different setups — which is exactly what a
  // LoRA reference set should look like.
  const hasFace = typeof CastPortrait === "function" && actor.skin && actor.palette;
  const flip = ((s >> 3) % 2) === 1;
  const zoom = 1.02 + ((s % 5) * 0.07);
  const shiftX = (((s >> 4) % 9) - 4) * 1.2;
  const bright = 0.8 + (((s >> 6) % 5) * 0.1);
  const warm = ((((s >> 8) % 7) - 3) * 7);
  return (
    <div style={{
      position: "relative", width: w, aspectRatio: aspect,
      background: hasFace ? tkc("bg") : `linear-gradient(${(s % 40) + 145}deg, ${accent}33 0%, ${tkc("void")} 70%)`,
      overflow: "hidden", border: "1px solid var(--c-line)",
    }}>
      {hasFace && (
        <div style={{
          position: "absolute", inset: 0,
          transform: `${flip ? "scaleX(-1) " : ""}scale(${zoom}) translateX(${shiftX}%)`,
          transformOrigin: "50% 40%",
          filter: `brightness(${bright}) hue-rotate(${warm}deg) saturate(.92) contrast(1.04)`,
        }}>
          <CastPortrait actor={actor} size={300} shot="wide" cover style={{ width: "100%", height: "100%", borderRadius: 0 }}/>
        </div>
      )}
      {/* Faux film-grain */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.55,
        backgroundImage: "radial-gradient(circle at 30% 35%, rgba(255,255,255,.04) 1px, transparent 1px), radial-gradient(circle at 70% 65%, rgba(255,255,255,.03) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 5px 5px",
      }}/>
      {/* Soft vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,.5) 100%)",
      }}/>
      {/* Faux portrait fallback — soft mass, no facial features (non-cast actors) */}
      {!hasFace && (
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id={`g${s}`} cx="50%" cy="42%" r="50%">
            <stop offset="0%"  stopColor={`hsl(${hue}, 18%, 55%)`} stopOpacity="0.9"/>
            <stop offset="60%" stopColor={`hsl(${hue}, 18%, 32%)`} stopOpacity="0.85"/>
            <stop offset="100%" stopColor="var(--c-void)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="150" cy={150 + (s % 8)} rx="68" ry="92" fill={`url(#g${s})`}/>
        <path d={`M150 ${250 - (s % 8)} q -110 18 -110 220 l 220 0 q 0 -202 -110 -220 z`} fill={`url(#g${s})`}/>
        {/* Subtle stripes signaling placeholder */}
        <g opacity="0.18">
          {Array.from({ length: 16 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 26} x2="300" y2={i * 26} stroke={accent} strokeWidth="0.5"/>
          ))}
        </g>
      </svg>
      )}
      {/* Label */}
      <div style={{
        position: "absolute", bottom: 8, left: 8, right: 8,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.7)",
        letterSpacing: ".16em", textTransform: "uppercase",
      }}>
        <span>{label}</span>
        <span style={{
          padding: "1px 5px",
          background: photoStatus === "photoreal" ? "rgba(106,163,122,.18)" : "rgba(8,8,10,.6)",
          border: `1px solid ${photoStatus === "photoreal" ? "var(--c-good)" : "rgba(255,255,255,.18)"}`,
          color: photoStatus === "photoreal" ? "var(--c-good)" : "rgba(255,255,255,.55)",
          fontSize: "var(--fs-label)", letterSpacing: ".16em",
        }}>{photoStatus === "photoreal" ? "PHOTOREAL" : "SYNTHETIC"}</span>
      </div>
    </div>
  );
}

// Motion clip placeholder — looks like a paused video frame with playhead
function MotionPlaceholder({ actor, idx = 0, label, aspect = "16/9", duration = "0:08", engine = "Veo 3" }) {
  const s = refSeed(actor.id, idx);
  const hasFace = typeof CastPortrait === "function" && (actor.photo || (actor.skin && actor.palette));
  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: aspect,
      overflow: "hidden", border: "1px solid var(--c-line)",
      background: `linear-gradient(${(s % 40) + 145}deg, ${actor.color}28, ${tkc("void")} 80%)`,
    }}>
      {/* The actor's face as the paused frame */}
      {hasFace && (
        <div style={{
          position: "absolute", inset: 0,
          transform: `scale(${1.05 + (s % 4) * 0.05}) translateX(${(((s >> 5) % 7) - 3) * 2}%)`,
          transformOrigin: "50% 35%",
          filter: `brightness(${0.78 + ((s >> 6) % 4) * 0.08}) saturate(.9)`,
        }}>
          <CastPortrait actor={actor} size={400} shot="wide" cover style={{ width: "100%", height: "100%", borderRadius: 0 }}/>
        </div>
      )}
      {hasFace && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,7,.85) 0%, transparent 40%)" }}/>
      )}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.5,
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,.04) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}/>
      {/* Center subject mass (fallback when no canonical face) */}
      {!hasFace && (
      <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id={`m${s}`} cx="50%" cy="48%" r="40%">
            <stop offset="0%"  stopColor={actor.color} stopOpacity="0.55"/>
            <stop offset="100%" stopColor="var(--c-void)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="800" height="450" fill={`url(#m${s})`}/>
        <ellipse cx={400 + (s % 30) - 15} cy={200 + (s % 18) - 9} rx="120" ry="160" fill={`${actor.color}33`}/>
        <ellipse cx={400 + (s % 30) - 15} cy={150 + (s % 18) - 9} rx="60" ry="80" fill={`${actor.color}66`}/>
      </svg>
      )}
      {/* Play icon */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(8,8,10,.65)", backdropFilter: "blur(6px)",
        border: "1px solid rgba(255,255,255,.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: tkc("white"), fontSize: "var(--fs-lead)", paddingLeft: 4,
      }}>▶</div>
      {/* Top label */}
      {label && (
        <div style={{
          position: "absolute", top: 10, left: 10,
          padding: "3px 8px",
          background: "rgba(8,8,10,.6)", border: "1px solid rgba(255,255,255,.15)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"),
          letterSpacing: ".16em", textTransform: "uppercase",
        }}>{label}</div>
      )}
      {/* Engine pill */}
      <div style={{
        position: "absolute", top: 10, right: 10,
        padding: "3px 8px",
        background: "rgba(var(--accent-rgb),.15)", border: "1px solid rgba(var(--accent-rgb),.4)",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
        letterSpacing: ".16em", textTransform: "uppercase",
      }}>{engine}</div>
      {/* Bottom strip — timeline */}
      <div style={{
        position: "absolute", left: 10, right: 10, bottom: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em" }}>0:00</span>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.15)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "0%", background: actor.color }}/>
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em" }}>{duration}</span>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────

function ActorAIStudio({ id }) {
  const actor = getStudioActor(id);
  const [tab, setTab] = usAS("identity");
  const [identityState, setIdentityState] = usAS({
    refs: 0,
    target: 25,
    training: false,
    trainedAt: null,
    lockedHash: null,
    continuity: 0.62, // 0..1
    progress: 0,
  });
  const [stillsEngine, setStillsEngine] = usAS("flux-1.1-pro-ultra");
  const [motionEngine, setMotionEngine] = usAS("veo-3");
  const [talkingEngine, setTalkingEngine] = usAS("hedra-character-3");

  // Persist locked identity to localStorage so demos survive reload
  ueAS(() => {
    try {
      const raw = localStorage.getItem(`cina:identity:${actor.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIdentityState(s => ({ ...s, ...parsed }));
      }
    } catch {}
  }, [actor.id]);
  ueAS(() => {
    try {
      const persist = { lockedHash: identityState.lockedHash, trainedAt: identityState.trainedAt, refs: identityState.refs, continuity: identityState.continuity };
      localStorage.setItem(`cina:identity:${actor.id}`, JSON.stringify(persist));
    } catch {}
  }, [actor.id, identityState.lockedHash, identityState.trainedAt, identityState.refs, identityState.continuity]);

  const locked = !!identityState.lockedHash;

  return (
    <div style={{ background: "var(--c-bg)", color: "var(--c-ink)", minHeight: "100vh" }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <section style={{
        padding: "28px var(--gutter) 18px", borderBottom: "1px solid var(--c-line)",
        position: "sticky", top: 0, zIndex: 8,
        background: "var(--c-bg)",
      }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}>
          {/* Crumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <a href="#/cast" onClick={(e) => { e.preventDefault(); navigate("/cast"); }} style={{
              color: "var(--c-ink-3)", textDecoration: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
            }}>← Cast</a>
            <span style={{ color: "var(--c-ink-4)" }}>/</span>
            <a href={`#/cast/${actor.id}`} onClick={(e) => { e.preventDefault(); navigate(`/cast/${actor.id}`); }} style={{
              color: "var(--c-ink-3)", textDecoration: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
            }}>{actor.name}</a>
            <span style={{ color: "var(--c-ink-4)" }}>/</span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>AI STUDIO</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
            {/* Actor swatch */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "var(--r-2)", overflow: "hidden",
                border: `1.5px solid ${actor.color}`,
              }}>
                <PortraitPlaceholder actor={actor} label="" aspect="1/1"
                  photoStatus={locked ? "photoreal" : "synthetic"}/>
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                  letterSpacing: ".16em", textTransform: "uppercase",
                }}>{actor.archetype || actor.role} · AI VAULT</div>
                <h1 style={{
                  margin: "4px 0 0", fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.02em", lineHeight: 1,
                }}>{actor.name}</h1>
              </div>
            </div>

            <span style={{ flex: 1 }}/>

            {/* Status pills + workflow links */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <StatusPill
                label={locked ? "IDENTITY LOCKED" : "IDENTITY OPEN"}
                color={locked ? "var(--c-good)" : "var(--c-ink-3)"}
                detail={locked ? identityState.lockedHash : `${identityState.refs}/${identityState.target} refs`}
              />
              <StatusPill
                label="CONTINUITY"
                color={identityState.continuity > 0.85 ? "var(--c-good)" : identityState.continuity > 0.6 ? "var(--c-amber)" : "var(--c-blood-l)"}
                detail={`${Math.round(identityState.continuity * 100)}%`}
              />
              <StatusPill
                label="RENDERS THIS MONTH"
                color="var(--c-ink-3)"
                detail="2,481"
              />
              <span style={{ width: 1, height: 44, background: "var(--c-line)", margin: "0 4px" }}></span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="btn" style={{ height: 26, padding: "0 12px", fontSize: "var(--fs-label)", gap: 6, justifyContent: "flex-start" }} onClick={() => navigate(`/cast/${actor.id}`)}>Public profile →</button>
                <button className="btn" style={{ height: 26, padding: "0 12px", fontSize: "var(--fs-label)", gap: 6, justifyContent: "flex-start" }} onClick={() => navigate(`/journey/${actor.id}`)}>Career journey →</button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginTop: 22 }}>
            {[
              ["identity",    "01 Identity",   locked ? "✓" : null],
              ["stills",      "02 Stills",     null],
              ["motion",      "03 Motion",     null],
              ["talking",     "04 Talking",    null],
              ["commercials", "05 Commercials",null],
              ["pipeline",    "Pipeline",      null],
            ].map(([k, label, badge]) => {
              const active = tab === k;
              const disabled = !locked && (k === "stills" || k === "motion" || k === "talking" || k === "commercials");
              return (
                <button
                  key={k}
                  onClick={() => !disabled && setTab(k)}
                  disabled={disabled}
                  style={{
                    padding: "10px 16px",
                    background: active ? "var(--c-panel)" : "transparent",
                    color: active ? "var(--c-ink)" : disabled ? "var(--c-ink-4)" : "var(--c-ink-2)",
                    border: "none", borderRadius: 0,
                    borderBottom: `2px solid ${active ? "var(--c-amber)" : "transparent"}`,
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                    letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {label}
                  {badge && <span style={{ color: "var(--c-good)" }}>{badge}</span>}
                  {disabled && <span style={{ color: "var(--c-ink-4)" }}>· LOCKED</span>}
                </button>
              );
            })}
            <span style={{ flex: 1 }}></span>
            {/* Switch performer — every cast member's studio is one tap away */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 4 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SWITCH</span>
              {(window.CAST || []).filter(a => a.id !== actor.id).slice(0, 7).map(a => (
                <button key={a.id} onClick={() => navigate(`/cast/${a.id}/studio`)} title={`${a.name} · AI Studio`} style={{
                  width: 28, height: 28, borderRadius: "50%", overflow: "hidden", padding: 0,
                  border: "1px solid var(--c-line-2)", cursor: "pointer", background: a.color || "var(--c-panel-2)",
                  flexShrink: 0,
                }}>
                  {typeof CastPortrait === "function" && a.skin
                    ? <CastPortrait actor={a} size={56} shot="headshot" cover style={{ width: "100%", height: "100%", borderRadius: 0 }}/>
                    : <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)", color: tkc("white") }}>{(a.name || "?")[0]}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "32px var(--gutter) 96px" }}>
        {tab === "identity" && (
          <IdentityTab
            actor={actor} state={identityState} setState={setIdentityState}
          />
        )}
        {tab === "stills" && (
          <StillsTab_actorAiStudio
            actor={actor} state={identityState}
            engineId={stillsEngine} setEngineId={setStillsEngine}
          />
        )}
        {tab === "motion" && (
          <MotionTab_actorAiStudio
            actor={actor} state={identityState}
            engineId={motionEngine} setEngineId={setMotionEngine}
          />
        )}
        {tab === "talking" && (
          <TalkingTab
            actor={actor} state={identityState}
            engineId={talkingEngine} setEngineId={setTalkingEngine}
          />
        )}
        {tab === "commercials" && (
          <CommercialsTab actor={actor} state={identityState}/>
        )}
        {tab === "pipeline" && (
          <PipelineTab actor={actor} state={identityState}/>
        )}
      </section>
    </div>
  );
}

// ─── Header sub: status pill ─────────────────────────────────────────────

function StatusPill({ label, color, detail }) {
  return (
    <div style={{
      padding: "8px 12px",
      background: "var(--c-panel)", border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)",
      display: "flex", flexDirection: "column", gap: 2,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: color, boxShadow: `0 0 6px ${color}`,
        }}/>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color,
          letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>{label}</span>
      </div>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink)",
        letterSpacing: ".08em", marginLeft: 12,
      }}>{detail}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 01 — IDENTITY TAB
// ════════════════════════════════════════════════════════════════════════

function IdentityTab({ actor, state, setState }) {
  const isTraining = state.training;
  const locked = !!state.lockedHash;
  const refsList = umAS(() => Array.from({ length: state.refs }).map((_, i) => i), [state.refs]);

  // Simulate training progress
  ueAS(() => {
    if (!isTraining) return;
    const startedAt = Date.now();
    const DURATION = 12000; // 12s sped-up for demo
    let raf;
    const tick = () => {
      const p = Math.min(1, (Date.now() - startedAt) / DURATION);
      setState(s => ({ ...s, progress: p }));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Done
        setState(s => ({
          ...s,
          training: false,
          progress: 1,
          lockedHash: "0xLORA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
          trainedAt: new Date().toISOString(),
          continuity: 0.94,
        }));
        if (window.toast) window.toast({
          title: "IDENTITY LOCKED",
          text: "LoRA trained · continuity 94%",
          kind: "good",
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isTraining]);

  const startTraining = () => setState(s => ({ ...s, training: true, progress: 0 }));
  const addRef = () => setState(s => ({ ...s, refs: Math.min(s.target, s.refs + 1) }));
  const addBatch = () => setState(s => ({ ...s, refs: s.target }));
  const reset = () => setState(s => ({ ...s, refs: 0, lockedHash: null, trainedAt: null, training: false, progress: 0, continuity: 0.62 }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Recommended stack call-out */}
        <div style={{
          padding: 18,
          background: "var(--c-panel)", borderLeft: "2px solid var(--c-amber)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>CINA'S RECOMMENDED STACK · MAY 2026</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { stage: "Stills",    pick: "Flux 1.1 [pro] Ultra",  why: "Photoreal, native LoRA, 2k res." },
              { stage: "Motion",    pick: "Veo 3",                  why: "Cinema I2V with audio. 8s, 4K." },
              { stage: "Talking",   pick: "Hedra Character-3",      why: "Best lip-sync. Emotion-aware." },
              { stage: "Voice",     pick: "ElevenLabs v3",          why: "Clone from 30s. 32 languages." },
            ].map(s => (
              <div key={s.stage}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
                }}>{s.stage}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500,
                  lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.01em",
                }}>{s.pick}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 4 }}>{s.why}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Identity panel */}
        <div style={{
          padding: 22,
          background: "var(--c-panel)", border: "1px solid var(--c-line)",
          borderRadius: "var(--r-2)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>STEP 01 · IDENTITY LOCK</span>
          </div>
          <h2 style={{
            margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em",
          }}>
            Train the face. Lock the identity.
          </h2>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "10px 0 18px", maxWidth: 700 }}>
            We train a Flux LoRA on {state.target} reference stills of {actor.name}. The output is an identity hash —
            every future render must match this face to within 92%, or it's flagged. Training takes ~20 minutes on an H100.
          </p>

          {/* Refs grid — a contact sheet of the SAME locked face */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6, marginBottom: 16,
          }}>
            {Array.from({ length: state.target }).map((_, i) => {
              const filled = i < state.refs;
              return (
                <div key={i} style={{ position: "relative", opacity: filled ? 1 : 0.22, transition: "opacity .2s ease" }}>
                  <PortraitPlaceholder
                    actor={actor}
                    idx={i}
                    aspect="3/4"
                    label={`R${String(i + 1).padStart(2, "0")}`}
                    photoStatus={filled ? "photoreal" : "queued"}
                  />
                  {!filled && (
                    <div style={{
                      position: "absolute", inset: 0, border: "1px dashed var(--c-line-3)",
                      borderRadius: "var(--r-1)", display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(8,8,10,.4)",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em",
                    }}>+ ADD</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add refs row */}
          {!locked && (
            <div style={{
              display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
              padding: 12, background: "var(--c-bg)", borderRadius: "var(--r-2)",
              border: "1px solid var(--c-line)",
            }}>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                letterSpacing: ".16em", textTransform: "uppercase",
              }}>ADD REFERENCE STILLS</span>
              <button onClick={addRef} disabled={state.refs >= state.target} style={{
                padding: "7px 12px",
                background: "transparent", color: state.refs >= state.target ? "var(--c-ink-4)" : "var(--c-ink-2)",
                border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", cursor: state.refs >= state.target ? "default" : "pointer",
                fontWeight: 600, textTransform: "uppercase",
              }}>↑ Upload one</button>
              <button onClick={addRef} disabled={state.refs >= state.target} style={{
                padding: "7px 12px",
                background: "transparent", color: state.refs >= state.target ? "var(--c-ink-4)" : "var(--c-ink-2)",
                border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", cursor: state.refs >= state.target ? "default" : "pointer",
                fontWeight: 600, textTransform: "uppercase",
              }}>✦ Generate w/ Flux</button>
              <span style={{ flex: 1 }}/>
              <button onClick={addBatch} style={{
                padding: "7px 12px",
                background: "transparent", color:  "var(--c-amber)",
                border: "1px dashed var(--c-amber)", borderRadius: "var(--r-1)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", cursor: "pointer",
                fontWeight: 700, textTransform: "uppercase",
              }}>Auto-fill all {state.target} (demo)</button>
            </div>
          )}

          {/* Train CTA */}
          <div style={{ marginTop: 16 }}>
            {!isTraining && !locked && (
              <button
                onClick={startTraining}
                disabled={state.refs < state.target}
                style={{
                  padding: "13px 22px",
                  background: state.refs >= state.target ? "var(--c-amber)" : "var(--c-panel-2)",
                  color: state.refs >= state.target ? tkc("void") : "var(--c-ink-4)",
                  border: "none", borderRadius: "var(--r-2)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)",
                  letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  cursor: state.refs >= state.target ? "pointer" : "default",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                ▲ Train LoRA · ~20 min · ~$1.40
              </button>
            )}
            {isTraining && (
              <div style={{
                padding: 18,
                background: "var(--c-bg)", border: `1px solid ${actor.color}55`,
                borderRadius: "var(--r-2)",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", marginBottom: 8,
                }}>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color,
                    letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: actor.color,
                      boxShadow: `0 0 6px ${actor.color}`,
                      animation: "asPulse 1s infinite",
                    }}/>
                    TRAINING LoRA · {Math.round(state.progress * 100)}%
                  </span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
                    {Math.max(0, Math.ceil((1 - state.progress) * 12))}s · H100 · Replicate
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${state.progress * 100}%`,
                    background: actor.color, transition: "width .1s linear",
                    boxShadow: `0 0 12px ${actor.color}`,
                  }}/>
                </div>
                <div style={{
                  marginTop: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  color: "var(--c-ink-3)", letterSpacing: ".08em", lineHeight: 1.6,
                }}>
                  <div>$ flux-train --identity {actor.id} --refs {state.target} --steps 2400</div>
                  {state.progress > 0.15 && <div>{">"} bucketing refs · 1024 / 1024 / 768</div>}
                  {state.progress > 0.3  && <div>{">"} embedding face · InstantID</div>}
                  {state.progress > 0.5  && <div>{">"} lora rank=32 · alpha=16 · lr=4e-4</div>}
                  {state.progress > 0.75 && <div>{">"} validation step {Math.floor(state.progress * 2400)} · loss 0.0{Math.floor(state.progress * 99)}</div>}
                  {state.progress > 0.95 && <div style={{ color: "var(--c-good)" }}>{">"} compiling identity hash…</div>}
                </div>
              </div>
            )}
            {locked && (
              <div style={{
                padding: 18,
                background: `linear-gradient(135deg, var(--c-good) 0%, ${tkc("line-2")} 100%)`,
                color: tkc("panel-2"), borderRadius: "var(--r-2)",
                display: "flex", alignItems: "center", gap: 18,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: tkc("panel-2"), color: "var(--c-good)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--fs-lead)",
                }}>✓</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                    fontWeight: 700, textTransform: "uppercase", marginBottom: 4,
                  }}>IDENTITY LOCKED · {state.lockedHash}</div>
                  <div style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-lead)", lineHeight: 1.3, fontWeight: 500,
                  }}>
                    {actor.name} is now photoreal. Every render must match this face at ≥92%.
                  </div>
                </div>
                <button onClick={reset} style={{
                  padding: "8px 14px",
                  background: "transparent", border: "1px solid rgba(10,26,16,.4)",
                  color: tkc("panel-2"), borderRadius: "var(--r-1)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
                }}>Retrain</button>
              </div>
            )}
          </div>
        </div>

        {/* Identity sliders — for fine-tuning the locked face */}
        <div style={{
          padding: 22, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>IDENTITY DIALS</span>
            <span style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", letterSpacing: "-0.01em",
            }}>fine-tune before lock, freeze after</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {[
              { label: "Apparent age",     min: 8,  max: 90, val: actor.age || 32, unit: "yr" },
              { label: "Build",            min: 0,  max: 100, val: 48, unit: "" },
              { label: "Height",           min: 145, max: 210, val: 178, unit: "cm" },
              { label: "Skin weathering",  min: 0, max: 100, val: 62, unit: "%" },
              { label: "Hair length",      min: 0, max: 100, val: 28, unit: "%" },
              { label: "Posture",          min: 0, max: 100, val: 70, unit: "%" },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  marginBottom: 4,
                }}>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                    letterSpacing: ".16em", textTransform: "uppercase",
                  }}>{s.label}</span>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: locked ? "var(--c-ink-4)" : actor.color,
                    letterSpacing: ".08em", fontWeight: 600,
                  }}>{s.val}{s.unit}</span>
                </div>
                <input type="range" min={s.min} max={s.max} value={s.val} disabled={locked} readOnly
                  style={{ width: "100%", accentColor: actor.color }}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right rail ──────────────────────────────────────────── */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 200 }}>
        <div style={{
          padding: 16, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 10,
          }}>WHY 25 REFS</div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: 0 }}>
            Flux LoRAs converge cleanly at 15–30 reference stills. Below 12 the face drifts;
            above 35 you start memorizing background. Mix lighting, angles, and expressions
            so the model learns the <em>face</em>, not the photoshoot.
          </p>
        </div>

        <div style={{
          padding: 16, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 10,
          }}>CONTINUITY = SAFETY</div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: 0 }}>
            After lock, every render is auto-embedded and scored against the canonical face.
            Anything under 92% is rejected. This is what stops a "Siri Vale" generation
            from accidentally drifting into another person.
          </p>
        </div>

        <div style={{
          padding: 16, background: "var(--c-panel)",
          border: "1px solid var(--c-blood-l)", borderRadius: "var(--r-2)",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-blood-l)",
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 10,
          }}>CHAIN OF CUSTODY</div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: 0 }}>
            The locked hash is minted on the actor's vault NFT. Royalties on every downstream
            render route to whoever holds the contract — actor estate, studio, or original
            director.
          </p>
        </div>
      </aside>

      <style>{`@keyframes asPulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 02 — STILLS TAB
// ════════════════════════════════════════════════════════════════════════

const PROMPT_PRESETS_STILL = [
  "noir street, sodium streetlight, rain on asphalt, three-quarter from below",
  "warm kitchen, late afternoon window light, looking at the ceiling, calm",
  "desert highway at dusk, denim jacket, dust in the air, profile shot",
  "interrogation room, single overhead bulb, leaning forward, hands on table",
  "wedding rehearsal, candlelight, half-smile, soft focal plane on the eyes",
  "1979 booth lamp on a hilltop transmitter, headphones, looking into the dial",
];

function StillsTab_actorAiStudio({ actor, state, engineId, setEngineId }) {
  const [prompt, setPrompt] = usAS(PROMPT_PRESETS_STILL[0]);
  const [aspect, setAspect] = usAS("3:4");
  const [lighting, setLighting] = usAS("key+rim");
  const [wardrobe, setWardrobe] = usAS("noir wool coat");
  const [focal, setFocal] = usAS(50);
  const [running, setRunning] = usAS(false);
  const [progress, setProgress] = usAS(0);
  const [results, setResults] = usAS(() => Array.from({ length: 6 }).map((_, i) => ({
    id: "r" + i,
    seed: 1000 + i * 137,
    continuity: 0.93 + Math.random() * 0.06,
    cost: 0.06,
    sec: 6 + i,
    photoreal: true,
    prompt: PROMPT_PRESETS_STILL[i % PROMPT_PRESETS_STILL.length],
  })));
  const engine = AI_ENGINES.stills.find(e => e.id === engineId);

  const run = () => {
    setRunning(true); setProgress(0);
    const startedAt = Date.now();
    const DUR = 5000;
    const tick = () => {
      const p = Math.min(1, (Date.now() - startedAt) / DUR);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        // Add 4 new results to the top
        const next = Array.from({ length: 4 }).map((_, i) => ({
          id: "r" + Date.now() + "-" + i,
          seed: Math.floor(Math.random() * 9999),
          continuity: 0.92 + Math.random() * 0.07,
          cost: engine.pricePerImage,
          sec: engine.avgSec + (Math.random() * 4 - 2) | 0,
          photoreal: true,
          prompt,
        }));
        setResults(r => [...next, ...r]);
        setRunning(false);
        if (window.toast) window.toast({
          title: `${engine.name.toUpperCase()} · 4 STILLS`,
          text: `Cont. avg ${Math.round(next.reduce((s, r) => s + r.continuity, 0) / 4 * 100)}%`,
          kind: "good",
        });
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
      {/* ── Left: Generator controls ─────────────────────────────── */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 200 }}>
        <EnginePicker engines={AI_ENGINES.stills} selected={engineId} onChange={setEngineId} unit="img"/>

        <div style={{
          padding: 18, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <SectionLabel>PROMPT</SectionLabel>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            style={asInp}
            placeholder={PROMPT_PRESETS_STILL[0]}
          />
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PROMPT_PRESETS_STILL.slice(0, 3).map(p => (
              <button key={p} onClick={() => setPrompt(p)} style={{
                padding: "5px 9px", fontSize: "var(--fs-label)",
                background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                color: "var(--c-ink-3)", borderRadius: "var(--r-3)", cursor: "pointer",
                fontFamily: "var(--f-mono)", letterSpacing: ".08em", textAlign: "left",
                maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }} title={p}>{p.slice(0, 26)}…</button>
            ))}
          </div>

          <SectionLabel>WARDROBE</SectionLabel>
          <input value={wardrobe} onChange={e => setWardrobe(e.target.value)}
            placeholder="noir wool coat, white shirt" style={asInp}/>

          <SectionLabel>LIGHTING</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
            {[
              ["key+rim", "Key + Rim"],
              ["soft",    "Soft window"],
              ["harsh",   "Harsh top"],
              ["practical","Practical bulb"],
            ].map(([v, l]) => (
              <button key={v} onClick={() => setLighting(v)} style={{
                padding: "8px 10px", textAlign: "left",
                background: lighting === v ? `${actor.color}22` : "var(--c-bg)",
                border: `1px solid ${lighting === v ? actor.color : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                fontWeight: 600,
              }}>{l}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <SectionLabel>ASPECT</SectionLabel>
              <select value={aspect} onChange={e => setAspect(e.target.value)} style={asInp}>
                <option value="3:4">3:4 · portrait</option>
                <option value="2:3">2:3 · classic</option>
                <option value="1:1">1:1 · square</option>
                <option value="16:9">16:9 · scene</option>
                <option value="21:9">21:9 · cinema</option>
              </select>
            </div>
            <div>
              <SectionLabel>FOCAL · {focal}mm</SectionLabel>
              <input type="range" min={24} max={135} value={focal} onChange={e => setFocal(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: actor.color, marginTop: 8 }}/>
            </div>
          </div>

          {/* Identity guard */}
          <div style={{
            padding: 10,
            background: "var(--c-bg)", border: `1px solid ${state.lockedHash ? "var(--c-good)" : "var(--c-line-2)"}`,
            borderRadius: "var(--r-1)",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: state.lockedHash ? "var(--c-good)" : "var(--c-ink-4)",
            }}/>
            <span>
              Identity guard <b style={{ color: state.lockedHash ? "var(--c-good)" : "var(--c-ink-4)" }}>
                {state.lockedHash ? "ON" : "OFF"}
              </b> · {state.lockedHash ? `using ${state.lockedHash}` : "renders unlocked"}
            </span>
          </div>

          <button onClick={run} disabled={running} style={{
            padding: "12px 16px",
            background: running ? "var(--c-panel-3)" :  "var(--c-amber)",
            color: running ? "var(--c-ink-3)" : tkc("void"),
            border: "none", borderRadius: "var(--r-2)", cursor: running ? "default" : "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>
            {running ? `Rendering · ${Math.round(progress * 100)}%` : `▲ Render 4 · ~${(engine.pricePerImage * 4).toFixed(2)}$`}
          </button>
        </div>
      </aside>

      {/* ── Right: Result gallery ─────────────────────────────────── */}
      <div>
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14,
        }}>
          <div>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>STEP 02 · STILLS · {engine.name.toUpperCase()}</div>
            <h2 style={{
              margin: "4px 0 0", fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em",
            }}>{results.length} photoreal stills of {actor.name}.</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{
              padding: "6px 10px",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase",
              border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
            }}>AVG CONT · {Math.round(results.reduce((s, r) => s + r.continuity, 0) / results.length * 100)}%</span>
            <span style={{
              padding: "6px 10px",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase",
              border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
            }}>SPENT · ${(results.reduce((s, r) => s + r.cost, 0)).toFixed(2)}</span>
          </div>
        </div>

        {/* In-flight slot when rendering */}
        {running && (
          <div style={{
            marginBottom: 14, padding: 14,
            background: "var(--c-panel)", border: `1px solid ${actor.color}55`,
            borderRadius: "var(--r-2)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: actor.color,
              animation: "asPulse 1s infinite",
            }}/>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color,
                letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4,
              }}>RENDERING · {engine.name} · 4 IMAGES</div>
              <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress * 100}%`, background: actor.color, transition: "width .1s linear" }}/>
              </div>
            </div>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
              letterSpacing: ".16em",
            }}>{Math.max(0, Math.ceil((1 - progress) * 5))}s</span>
          </div>
        )}

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        }}>
          {results.map((r, i) => (
            <div key={r.id} style={{
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", overflow: "hidden",
            }}>
              <PortraitPlaceholder
                actor={actor}
                label={`SEED ${r.seed}`}
                idx={i + 7}
                aspect={aspect.includes(":") ? aspect.replace(":", "/") : "3/4"}
                photoStatus="photoreal"
              />
              <div style={{ padding: 10 }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 4,
                }}>
                  CONT <span style={{ color: r.continuity > 0.93 ? "var(--c-good)" : "var(--c-amber)" }}>{Math.round(r.continuity * 100)}%</span>
                  {" · "}
                  ${r.cost.toFixed(2)} {" · "} {r.sec}s
                </div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {r.prompt}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  <button style={asPillBtn}>↻ Re-roll</button>
                  <button style={asPillBtn}>→ To Motion</button>
                  <span style={{ flex: 1 }}/>
                  <button style={{ ...asPillBtn, color: "var(--c-amber)", borderColor: "var(--c-amber)" }}>✓ Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 03 — MOTION TAB
// ════════════════════════════════════════════════════════════════════════

const PROMPT_PRESETS_MOTION = [
  "She turns slowly, catching the rim light. The camera dollies in to a tight close-up. Wind picks up the hair.",
  "He walks into frame from camera left, sits on the bench, looks off-screen. 35mm. Diffused fill.",
  "Tight pull-focus from her hand on the steering wheel to her eyes in the rear-view. Sodium streetlight strobing past.",
  "Wide-shot of the figure standing at the cliff edge. Wind. Slow push-in. Score swells then drops.",
];

function MotionTab_actorAiStudio({ actor, state, engineId, setEngineId }) {
  const [prompt, setPrompt] = usAS(PROMPT_PRESETS_MOTION[0]);
  const [duration, setDuration] = usAS(8);
  const [aspect, setAspect] = usAS("21:9");
  const [audio, setAudio] = usAS(true);
  const [startFrame, setStartFrame] = usAS("still-04");
  const [running, setRunning] = usAS(false);
  const [progress, setProgress] = usAS(0);
  const [clips, setClips] = usAS(() => [
    { id: "m1", duration: 8, engine: "Veo 3", cost: 6.0, continuity: 0.94, prompt: PROMPT_PRESETS_MOTION[0], audio: true },
    { id: "m2", duration: 6, engine: "Kling 2.5", cost: 2.7, continuity: 0.91, prompt: PROMPT_PRESETS_MOTION[1], audio: false },
    { id: "m3", duration: 8, engine: "Sora 2", cost: 4.8, continuity: 0.96, prompt: PROMPT_PRESETS_MOTION[2], audio: true },
  ]);
  const engine = AI_ENGINES.motion.find(e => e.id === engineId);
  const cost = engine.pricePerSecond * duration;
  const renderTime = engine.avgSecPerClipSec * duration;

  const run = () => {
    setRunning(true); setProgress(0);
    const startedAt = Date.now();
    const DUR = Math.min(8000, renderTime * 1000);
    const tick = () => {
      const p = Math.min(1, (Date.now() - startedAt) / DUR);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        setClips(c => [{
          id: "m" + Date.now(),
          duration, engine: engine.name,
          cost, continuity: 0.92 + Math.random() * 0.07,
          prompt, audio,
        }, ...c]);
        setRunning(false);
        if (window.toast) window.toast({
          title: `${engine.name.toUpperCase()} · CLIP READY`,
          text: `${duration}s · cont. ${Math.round((0.92 + Math.random() * 0.07) * 100)}%`,
          kind: "good",
        });
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 200 }}>
        <EnginePicker engines={AI_ENGINES.motion} selected={engineId} onChange={setEngineId} unit="sec"/>

        <div style={{
          padding: 18, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <SectionLabel>START FRAME (I2V) · OPTIONAL</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <button key={i} onClick={() => setStartFrame(`still-0${i}`)} style={{
                padding: 0, border: `1.5px solid ${startFrame === `still-0${i}` ? actor.color : "var(--c-line-2)"}`,
                background: "transparent", cursor: "pointer", borderRadius: "var(--r-1)", overflow: "hidden",
              }}>
                <PortraitPlaceholder actor={actor} label={`R0${i}`} idx={i} aspect="3/4" photoStatus="photoreal"/>
              </button>
            ))}
          </div>

          <SectionLabel>SCENE PROMPT</SectionLabel>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} style={asInp}/>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {PROMPT_PRESETS_MOTION.slice(0, 2).map((p, i) => (
              <button key={i} onClick={() => setPrompt(p)} style={{
                padding: "5px 9px", fontSize: "var(--fs-label)",
                background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                color: "var(--c-ink-3)", borderRadius: "var(--r-3)", cursor: "pointer",
                fontFamily: "var(--f-mono)", letterSpacing: ".08em",
                maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }} title={p}>{p.slice(0, 32)}…</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <SectionLabel>DURATION · {duration}s</SectionLabel>
              <input type="range" min={2} max={engine.id === "sora-2" ? 20 : 10} step={2} value={Math.min(duration, engine.id === "sora-2" ? 20 : 10)}
                onChange={e => setDuration(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: actor.color, marginTop: 8 }}/>
            </div>
            <div>
              <SectionLabel>ASPECT</SectionLabel>
              <select value={aspect} onChange={e => setAspect(e.target.value)} style={asInp}>
                <option>21:9</option>
                <option>16:9</option>
                <option>9:16</option>
                <option>1:1</option>
              </select>
            </div>
          </div>

          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: 10, background: "var(--c-bg)",
            border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
            fontSize: "var(--fs-body)", color: "var(--c-ink-2)", cursor: engine.strengths.includes("audio") ? "pointer" : "not-allowed",
            opacity: engine.strengths.includes("audio") ? 1 : 0.5,
          }}>
            <input type="checkbox" checked={audio} disabled={!engine.strengths.includes("audio")}
              onChange={e => setAudio(e.target.checked)}/>
            <span>Native audio · {engine.strengths.includes("audio") ? "supported" : "engine has no audio"}</span>
          </label>

          {/* Identity guard */}
          <div style={{
            padding: 10,
            background: "var(--c-bg)", border: `1px solid ${state.lockedHash ? "var(--c-good)" : "var(--c-line-2)"}`,
            borderRadius: "var(--r-1)",
            fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
          }}>
            Identity guard <b style={{ color: state.lockedHash ? "var(--c-good)" : "var(--c-ink-4)" }}>
              {state.lockedHash ? "ON" : "OFF"}</b>
            {state.lockedHash && <> · enforcing {state.lockedHash} per-frame</>}
          </div>

          <button onClick={run} disabled={running} style={{
            padding: "12px 16px",
            background: running ? "var(--c-panel-3)" :  "var(--c-amber)",
            color: running ? "var(--c-ink-3)" : tkc("void"),
            border: "none", borderRadius: "var(--r-2)", cursor: running ? "default" : "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>{running ? `Rendering · ${Math.round(progress * 100)}%` : `▲ Render ${duration}s · ~$${cost.toFixed(2)} · ~${renderTime}s`}</button>
        </div>
      </aside>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>STEP 03 · MOTION · {engine.name.toUpperCase()}</div>
            <h2 style={{ margin: "4px 0 0", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em" }}>
              Stills become takes.
            </h2>
          </div>
        </div>

        {running && (
          <div style={{
            marginBottom: 14, padding: 14,
            background: "var(--c-panel)", border: `1px solid ${actor.color}55`,
            borderRadius: "var(--r-2)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", marginBottom: 8,
            }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color, letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: actor.color, animation: "asPulse 1s infinite" }}/>
                RENDERING {duration}s · {engine.name}
              </span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                {Math.max(0, Math.ceil((1 - progress) * (renderTime)))}s
              </span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress * 100}%`, background: actor.color, transition: "width .1s linear" }}/>
            </div>
            <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>
              <div>$ veo render --identity {state.lockedHash || "open"} --duration {duration} --audio {audio ? "on" : "off"}</div>
              {progress > 0.2 && <div>{">"} encoding prompt · 73 tokens</div>}
              {progress > 0.4 && <div>{">"} sampling 1/{Math.floor(progress * duration * 24)} frames · cont. check ok</div>}
              {progress > 0.7 && <div>{">"} mastering audio · -14 LUFS</div>}
            </div>
          </div>
        )}

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14,
        }}>
          {clips.map((c, i) => (
            <div key={c.id} style={{
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", overflow: "hidden",
            }}>
              <MotionPlaceholder
                actor={actor} idx={i + 21}
                duration={`0:${String(c.duration).padStart(2, "0")}`}
                engine={c.engine}
              />
              <div style={{ padding: 12 }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6,
                  display: "flex", gap: 14, flexWrap: "wrap",
                }}>
                  <span>CONT <span style={{ color: c.continuity > 0.93 ? "var(--c-good)" : "var(--c-amber)" }}>{Math.round(c.continuity * 100)}%</span></span>
                  <span>${c.cost.toFixed(2)}</span>
                  <span>{c.duration}s</span>
                  {c.audio && <span style={{ color: "var(--c-amber)" }}>♪ AUDIO</span>}
                </div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.45,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>"{c.prompt}"</div>
                <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                  <button style={asPillBtn}>↻ Re-roll</button>
                  <button style={asPillBtn}>↗ Extend +4s</button>
                  <button style={asPillBtn}>→ To Talking</button>
                  <span style={{ flex: 1 }}/>
                  <button style={{ ...asPillBtn, color: "var(--c-amber)", borderColor: "var(--c-amber)" }}>✓ Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 04 — TALKING TAB
// ════════════════════════════════════════════════════════════════════════

function TalkingTab({ actor, state, engineId, setEngineId }) {
  const [script, setScript] = usAS("I never said I'd come back. I said I'd answer. Those are two different things.");
  const [voice, setVoice] = usAS("eleven-v3");
  const [emotion, setEmotion] = usAS("level");
  const [running, setRunning] = usAS(false);
  const [progress, setProgress] = usAS(0);
  const [clips, setClips] = usAS(() => [
    { id: "t1", line: "Don't tell the crew. Not yet.", duration: 4, continuity: 0.95, voice: "eleven-v3", engine: "Hedra Character-3" },
    { id: "t2", line: "Two letters. Sealed. Never sent.", duration: 5, continuity: 0.93, voice: "eleven-v3", engine: "Hedra Character-3" },
  ]);
  const engine = AI_ENGINES.talking.find(e => e.id === engineId);
  const voiceEngine = AI_ENGINES.voice.find(v => v.id === voice);
  const duration = Math.max(3, Math.ceil(script.length / 16));
  const cost = engine.pricePerSecond * duration + (voiceEngine.pricePerMinute * duration / 60);

  const run = () => {
    setRunning(true); setProgress(0);
    const startedAt = Date.now();
    const DUR = 5500;
    const tick = () => {
      const p = Math.min(1, (Date.now() - startedAt) / DUR);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        setClips(c => [{
          id: "t" + Date.now(),
          line: script, duration,
          continuity: 0.93 + Math.random() * 0.06,
          voice, engine: engine.name,
        }, ...c]);
        setRunning(false);
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 200 }}>
        <EnginePicker engines={AI_ENGINES.talking} selected={engineId} onChange={setEngineId} unit="sec"/>

        <div style={{
          padding: 18, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <SectionLabel>SCRIPT</SectionLabel>
          <textarea value={script} onChange={e => setScript(e.target.value)} rows={5} style={asInp}
            placeholder="The line that lands. One sentence at a time."/>

          <SectionLabel>VOICE · CLONED</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {AI_ENGINES.voice.map(v => (
              <button key={v.id} onClick={() => setVoice(v.id)} style={{
                padding: 10, textAlign: "left",
                background: voice === v.id ? `${actor.color}18` : "var(--c-bg)",
                border: `1px solid ${voice === v.id ? actor.color : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
                display: "flex", flexDirection: "column", gap: 2,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500,
                  }}>{v.name}</span>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: voice === v.id ? actor.color : "var(--c-ink-3)",
                    letterSpacing: ".16em",
                  }}>{v.vendor.toUpperCase()}</span>
                </div>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4 }}>{v.blurb}</span>
              </button>
            ))}
          </div>

          <SectionLabel>EMOTION</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
            {[
              ["level", "Level"],
              ["wound", "Wound"],
              ["grin", "Grin"],
              ["whisper", "Whisper"],
              ["shout", "Shout"],
              ["broken", "Broken"],
            ].map(([v, l]) => (
              <button key={v} onClick={() => setEmotion(v)} style={{
                padding: "7px 9px",
                background: emotion === v ? `${actor.color}22` : "var(--c-bg)",
                border: `1px solid ${emotion === v ? actor.color : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                fontWeight: 600,
              }}>{l}</button>
            ))}
          </div>

          <button onClick={run} disabled={running} style={{
            padding: "12px 16px",
            background: running ? "var(--c-panel-3)" :  "var(--c-amber)",
            color: running ? "var(--c-ink-3)" : tkc("void"),
            border: "none", borderRadius: "var(--r-2)", cursor: running ? "default" : "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>{running ? `Rendering · ${Math.round(progress * 100)}%` : `▲ Speak · ~${duration}s · ~$${cost.toFixed(2)}`}</button>
        </div>
      </aside>

      <div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>
            STEP 04 · TALKING · {engine.name.toUpperCase()} + {voiceEngine.name.toUpperCase()}
          </div>
          <h2 style={{ margin: "4px 0 0", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em" }}>
            Lip-sync the lines.
          </h2>
        </div>

        {running && (
          <div style={{
            marginBottom: 14, padding: 14,
            background: "var(--c-panel)", border: `1px solid ${actor.color}55`,
            borderRadius: "var(--r-2)",
          }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color,
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              marginBottom: 8, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: actor.color, animation: "asPulse 1s infinite" }}/>
              SYNTHESIZING VOICE → LIP-SYNC · {Math.round(progress * 100)}%
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: "var(--r-1)" }}>
              <div style={{ height: "100%", width: `${progress * 100}%`, background: actor.color, transition: "width .1s linear" }}/>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {clips.map((c, i) => (
            <div key={c.id} style={{
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", overflow: "hidden",
              display: "grid", gridTemplateColumns: "260px 1fr", gap: 0,
            }}>
              <MotionPlaceholder actor={actor} idx={i + 41} aspect="1/1"
                duration={`0:${String(c.duration).padStart(2, "0")}`} engine={c.engine}/>
              <div style={{ padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>CONT <span style={{ color: c.continuity > 0.93 ? "var(--c-good)" : "var(--c-amber)" }}>{Math.round(c.continuity * 100)}%</span></span>
                    <span>{c.engine}</span>
                    <span style={{ color: "var(--c-amber)" }}>♪ {c.voice.toUpperCase()}</span>
                  </div>
                  <div style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1.3,
                    letterSpacing: "-0.01em", marginBottom: 8,
                  }}>
                    "{c.line}"
                  </div>
                  {/* Waveform-ish strip */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24, marginTop: 8 }}>
                    {Array.from({ length: 50 }).map((_, k) => {
                      const h = 4 + Math.abs(Math.sin(k * 0.6 + (i + 1) * 1.4)) * 18;
                      return <div key={k} style={{ width: 3, height: h, background: actor.color, opacity: 0.55, borderRadius: "var(--r-1)" }}/>;
                    })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  <button style={asPillBtn}>↻ Re-take</button>
                  <button style={asPillBtn}>↗ Different emotion</button>
                  <span style={{ flex: 1 }}/>
                  <button style={{ ...asPillBtn, color: "var(--c-amber)", borderColor: "var(--c-amber)" }}>✓ Lock</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// 05 — COMMERCIALS TAB
// ════════════════════════════════════════════════════════════════════════

const COMMERCIAL_TEMPLATES = [
  { id: "perfume",  cat: "Beauty",  name: "Perfume · slow burn",      duration: 30, brief: "Single subject, single object. Soft natural light. One silent gesture. Voiceover at 18s." },
  { id: "car",      cat: "Auto",    name: "Auto · winding road",      duration: 30, brief: "Dawn highway, exterior + interior shots. Two POVs. Engine + ambient." },
  { id: "watch",    cat: "Luxury",  name: "Watch · macro hands",      duration: 15, brief: "Five tight insert shots. Hands, dial, sky. No dialogue." },
  { id: "denim",    cat: "Fashion", name: "Denim · documentary",      duration: 45, brief: "Subject in three locations. Interview cutaways. Natural sound." },
  { id: "spirits",  cat: "Spirits", name: "Whisky · the pour",        duration: 30, brief: "One room, one bottle, golden hour. Voiceover throughout." },
  { id: "telco",    cat: "Tech",    name: "Telco · everyday hero",    duration: 30, brief: "Domestic scene → public moment. Phone as anchor object." },
];

function CommercialsTab({ actor, state }) {
  const [template, setTemplate] = usAS(COMMERCIAL_TEMPLATES[0]);
  const [brand, setBrand] = usAS("Lumen No. 7");
  const [running, setRunning] = usAS(false);
  const [progress, setProgress] = usAS(0);
  const [completed, setCompleted] = usAS([
    { id: "ad1", brand: "House of Mara", template: COMMERCIAL_TEMPLATES[2], delivered: "yesterday", revenue: 14_200, continuity: 0.96 },
    { id: "ad2", brand: "Veld Whisky",   template: COMMERCIAL_TEMPLATES[4], delivered: "3 days ago", revenue: 22_400, continuity: 0.94 },
  ]);

  const run = () => {
    setRunning(true); setProgress(0);
    const start = Date.now();
    const DUR = 7000;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / DUR);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else {
        setCompleted(c => [{
          id: "ad" + Date.now(), brand, template, delivered: "just now",
          revenue: Math.floor(template.duration * 800 + Math.random() * 4000),
          continuity: 0.93 + Math.random() * 0.06,
        }, ...c]);
        setRunning(false);
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "flex-start" }}>
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 200 }}>
        <div style={{
          padding: 18, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <SectionLabel>BRAND</SectionLabel>
          <input value={brand} onChange={e => setBrand(e.target.value)} style={asInp} placeholder="Lumen No. 7"/>

          <SectionLabel>TEMPLATE</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 380, overflowY: "auto" }}>
            {COMMERCIAL_TEMPLATES.map(t => {
              const active = t.id === template.id;
              return (
                <button key={t.id} onClick={() => setTemplate(t)} style={{
                  padding: 10, textAlign: "left",
                  background: active ? `${actor.color}18` : "var(--c-bg)",
                  border: `1px solid ${active ? actor.color : "var(--c-line-2)"}`,
                  borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
                  display: "flex", flexDirection: "column", gap: 2,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{
                      fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500,
                    }}>{t.name}</span>
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: active ? actor.color : "var(--c-ink-3)",
                      letterSpacing: ".16em",
                    }}>{t.cat.toUpperCase()} · {t.duration}s</span>
                  </div>
                  <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.4 }}>{t.brief}</span>
                </button>
              );
            })}
          </div>

          <button onClick={run} disabled={running} style={{
            padding: "12px 16px",
            background: running ? "var(--c-panel-3)" :  "var(--c-amber)",
            color: running ? "var(--c-ink-3)" : tkc("void"),
            border: "none", borderRadius: "var(--r-2)", cursor: running ? "default" : "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>{running ? `Producing · ${Math.round(progress * 100)}%` : `▲ Produce ${template.duration}s spot`}</button>
        </div>
      </aside>

      <div>
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
          }}>STEP 05 · COMMERCIALS</div>
          <h2 style={{ margin: "4px 0 0", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em" }}>
            {actor.name}, on a brand.
          </h2>
        </div>

        {running && (
          <div style={{ marginBottom: 14, padding: 14, background: "var(--c-panel)", border: `1px solid ${actor.color}55`, borderRadius: "var(--r-2)" }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color,
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              marginBottom: 8, display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: actor.color, animation: "asPulse 1s infinite" }}/>
              PRODUCING · {template.name.toUpperCase()} · {brand.toUpperCase()}
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,.06)", borderRadius: "var(--r-1)" }}>
              <div style={{ height: "100%", width: `${progress * 100}%`, background: actor.color, transition: "width .1s linear" }}/>
            </div>
            <div style={{ marginTop: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>
              {progress > 0.1 && <div>{">"} storyboarding {Math.ceil(template.duration / 6)} shots</div>}
              {progress > 0.3 && <div>{">"} Veo 3 batch · 8s × {Math.ceil(template.duration / 8)}</div>}
              {progress > 0.5 && <div>{">"} ElevenLabs voice · clone matched · -14 LUFS</div>}
              {progress > 0.7 && <div>{">"} Hedra lip-sync · CC pass · continuity 9{Math.floor(progress * 9)}%</div>}
              {progress > 0.9 && <div style={{ color: "var(--c-good)" }}>{">"} compositing master · ProRes · 1080p / 4K</div>}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {completed.map((c, i) => (
            <div key={c.id} style={{
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", overflow: "hidden",
            }}>
              <MotionPlaceholder actor={actor} idx={i + 61} aspect="16/9"
                duration={`0:${String(c.template.duration).padStart(2, "0")}`}
                label={`SPOT · ${c.brand.toUpperCase()}`} engine="Veo 3 + Hedra"/>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>
                      {c.template.cat.toUpperCase()} · DELIVERED {c.delivered}
                    </div>
                    <div style={{
                      fontFamily: "var(--f-display)", fontStyle: "italic",
                      fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500,
                      lineHeight: 1.1, marginTop: 3, letterSpacing: "-0.01em",
                    }}>{c.brand}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                      letterSpacing: ".16em", textTransform: "uppercase",
                    }}>REV TO ACTOR</div>
                    <div style={{
                      fontFamily: "var(--f-display)", fontStyle: "italic",
                      fontSize: "var(--fs-lead)", color: "var(--c-good)", fontWeight: 500, lineHeight: 1,
                    }}>${c.revenue.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4, marginTop: 8 }}>{c.template.brief}</div>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em", marginTop: 8, display: "flex", gap: 14, textTransform: "uppercase",
                }}>
                  <span>CONT <span style={{ color: c.continuity > 0.93 ? "var(--c-good)" : "var(--c-amber)" }}>{Math.round(c.continuity * 100)}%</span></span>
                  <span>{c.template.duration}s · 4K MASTER</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PIPELINE TAB — full end-to-end visualization
// ════════════════════════════════════════════════════════════════════════

function PipelineTab({ actor, state }) {
  const stages = [
    { n: "01", id: "identity", h: "Identity",
      vendor: "Flux LoRA · Replicate",
      done: !!state.lockedHash,
      out: state.lockedHash ? `${state.refs} refs → ${state.lockedHash}` : `${state.refs}/${state.target} refs`,
      cost: "$1.40 once",
    },
    { n: "02", id: "stills", h: "Stills",
      vendor: "Flux 1.1 [pro] Ultra + LoRA",
      done: !!state.lockedHash,
      out: state.lockedHash ? "Photoreal stills on tap · 7s ea" : "Locked behind Identity",
      cost: "$0.06 / image",
    },
    { n: "03", id: "motion", h: "Motion",
      vendor: "Veo 3 (I2V + audio)",
      done: !!state.lockedHash,
      out: state.lockedHash ? "8s 4K cinematic clips · native audio" : "Locked",
      cost: "$0.75 / sec",
    },
    { n: "04", id: "talking", h: "Talking",
      vendor: "Hedra Character-3 + ElevenLabs v3",
      done: !!state.lockedHash,
      out: state.lockedHash ? "Full lip-sync to any script" : "Locked",
      cost: "$0.30 + voice",
    },
    { n: "05", id: "commercials", h: "Commercials",
      vendor: "Veo 3 + Hedra · placed in templates",
      done: !!state.lockedHash,
      out: state.lockedHash ? "30s spots delivered · royalty back to actor" : "Locked",
      cost: "$60–180 / spot",
    },
    { n: "06", id: "scene", h: "On-screen",
      vendor: "→ /film/* · /branches/*",
      done: false,
      out: "Actor available in Branched casting · Watch films",
      cost: "Revenue → royalty",
    },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
          letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>END-TO-END · PIPELINE</div>
        <h2 style={{ margin: "4px 0 0", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em" }}>
          From {state.refs || 0} reference stills to a working performer.
        </h2>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "12px 0 0", maxWidth: 760 }}>
          Every stage is a separate model. Identity locks the face, then every downstream model is conditioned on that lock — so {actor.name} is the same {actor.name} whether you render a still, a 30-second motion clip, or a perfume ad.
        </p>
      </div>

      <div style={{
        padding: 22, background: "var(--c-panel)",
        border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto" }}>
          {stages.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{
                flex: 1, minWidth: 200, padding: "0 14px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: s.done ? actor.color : "var(--c-bg)",
                    border: `1.5px solid ${s.done ? actor.color : "var(--c-line-2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                    color: s.done ? tkc("void") : "var(--c-ink-3)",
                  }}>{s.done ? "✓" : s.n}</span>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}>{s.h}</span>
                </div>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color,
                  letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600,
                }}>{s.vendor}</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, flex: 1 }}>{s.out}</div>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em",
                }}>{s.cost}</div>
              </div>
              {i < stages.length - 1 && (
                <div style={{
                  width: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--c-ink-4)", fontSize: "var(--fs-lead)",
                }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Royalty / chain of custody box */}
      <div style={{
        padding: 22, background: "var(--c-panel)",
        border: `1px solid ${actor.color}33`, borderLeft: `2px solid ${actor.color}`, borderRadius: "var(--r-2)",
      }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: actor.color,
          letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 10,
        }}>CHAIN OF CUSTODY</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.15, marginBottom: 6, letterSpacing: "-0.01em" }}>
              The lock is the asset.
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
              {actor.name}'s LoRA + face embedding live on a vault NFT. The contract owns the right to render this face.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.15, marginBottom: 6, letterSpacing: "-0.01em" }}>
              Every render pays.
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
              Each Stills / Motion / Commercial production routes a royalty to the contract holder automatically. Cina settles monthly.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.15, marginBottom: 6, letterSpacing: "-0.01em" }}>
              No lock, no render.
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
              Without a locked identity we will not render this person. Continuity below 92%? Reject. Period.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small reusable bits ─────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
      letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
    }}>{children}</div>
  );
}

function EnginePicker({ engines, selected, onChange, unit }) {
  return (
    <div style={{
      padding: 14, background: "var(--c-panel)",
      border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <SectionLabel>ENGINE</SectionLabel>
      {engines.map(e => {
        const active = e.id === selected;
        return (
          <button key={e.id} onClick={() => onChange(e.id)} style={{
            padding: 10, textAlign: "left",
            background: active ? "var(--c-bg)" : "transparent",
            border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
            borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
            position: "relative",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <div>
                <span style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}>{e.name}</span>
                <span style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em", marginLeft: 8, textTransform: "uppercase",
                }}>{e.vendor}</span>
                {e.recommended && (
                  <span style={{
                    marginLeft: 8, padding: "1px 6px",
                    background: "var(--c-amber)", color: "var(--c-on-amber)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                    letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                    borderRadius: "var(--r-1)",
                  }}>BEST</span>
                )}
              </div>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: active ? "var(--c-amber)" : "var(--c-ink-3)",
                letterSpacing: ".08em", fontWeight: 600, whiteSpace: "nowrap",
              }}>
                {e.pricePerImage != null ? `$${e.pricePerImage}/${unit}` : `$${e.pricePerSecond}/${unit}`}
              </span>
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.4, marginTop: 4 }}>{e.blurb}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {(e.strengths || []).map(s => (
                <span key={s} style={{
                  padding: "1px 6px",
                  background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                  letterSpacing: ".16em", borderRadius: "var(--r-1)", textTransform: "uppercase",
                }}>{s}</span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

const asInp = {
  width: "100%", padding: "8px 10px",
  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-1)", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
  resize: "vertical",
};

const asPillBtn = {
  padding: "4px 8px",
  background: "transparent", color: "var(--c-ink-2)",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
  letterSpacing: ".16em", cursor: "pointer",
  textTransform: "uppercase", fontWeight: 600,
};

// ─── Export ──────────────────────────────────────────────────────────────

window.ActorAIStudio = ActorAIStudio;
