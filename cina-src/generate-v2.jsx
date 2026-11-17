// generate-v2.jsx — Refactored AI video generation workflow.
//
// The original GeneratePanel was a single dense form ("vague"). This v2
// breaks it into five linear steps with clear affordances:
//
//   01 Setup   — pick the shot slot + identity/style refs
//   02 Prompt  — write/edit the scene prompt, w/ chips + Cina rewrites
//   03 Engine  — pick the model & spec (cost + ETA visible)
//   04 Render  — progress, live log, variants stream in
//   05 Pick    — pick a winner, approve, send to Board or Timeline
//
// Each step is reversible. The right rail shows render history + cost.

const { useState: useStateGv, useEffect: useEffectGv, useMemo: useMemoGv, useRef: useRefGv } = React;

// ─── Engine catalog (extends the existing GEN_PRESETS w/ richer info) ────

const GV_ENGINES = [
  { id: "veo-3",       vendor: "Google",   name: "Veo 3",       blurb: "Cinema · audio · 8s · 4K",  cr: 12, sec: 14, recommended: true,
    strengths: ["cinema", "audio", "4K"], best: "wide shots, atmosphere, dialogue" },
  { id: "gemini-omni", vendor: "Google DeepMind", name: "Gemini Omni 1.2", blurb: "Real AI video · 8s · live MP4", cr: 12, sec: 18,
    strengths: ["real", "cinema", "motion"], best: "real playable camera shots" },
  { id: "sora-2",      vendor: "OpenAI",   name: "Sora 2",      blurb: "Narrative · 20s · multi-shot", cr: 14, sec: 16,
    strengths: ["narrative", "long"], best: "story beats, faces, composition" },
  { id: "kling-2.5",   vendor: "Kuaishou", name: "Kling 2.5",   blurb: "I2V · best character motion", cr: 8, sec: 10,
    strengths: ["I2V", "motion", "identity"], best: "character pickups, body motion" },
  { id: "runway-gen4", vendor: "Runway",   name: "Gen-4 Turbo", blurb: "Fast iteration · stylized",  cr: 6,  sec: 6,
    strengths: ["fast", "VFX"], best: "inserts, B-roll, quick variants" },
  { id: "pika-2",      vendor: "Pika",     name: "Pika 2.0",    blurb: "Quick teasers · cheap",       cr: 3,  sec: 5,
    strengths: ["fast", "cheap"], best: "draft passes, look dev" },
];

const GV_IDENTITIES = [
  { id: "elias-voss",  name: "ELIAS VOSS",  role: "Protagonist", color: tkc("ink-3"), locked: true,  cast: "evren-koll"  },
  { id: "maren-kell",  name: "MAREN KELL",  role: "Antagonist",  color: tkc("blood"), locked: true,  cast: "nadya-ash"   },
  { id: "ari-nomura",  name: "DET. NOMURA", role: "Supporting",  color: tkc("cat-6"), locked: true,  cast: "io-marsh"    },
  { id: "the-subject", name: "THE SUBJECT", role: "Victim",      color: tkc("warn"), locked: false, cast: "siri-vale"   },
];
function gvIdentityPhoto(id) {
  const m = GV_IDENTITIES.find(x => x.id === id);
  return "assets/cast/" + (m ? m.cast : "evren-koll") + ".png";
}

const SHOT_SLOTS = ["14A", "14B", "14C", "14D", "14E", "14F", "14G", "14H"];

// ─── Board → Generate handoff ──────────────────────────────────
function gvReadBoardReq() {
  try {
    if (window.__cinaGenReq) return window.__cinaGenReq;
    const raw = localStorage.getItem("cina:gen-req");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function gvDurToSec(d) {
  if (typeof d === "number") return d;
  const m = /^(\d+):(\d+)$/.exec(d || "");
  return m ? Math.max(2, Math.min(20, (+m[1]) * 60 + (+m[2]))) : 8;
}
const GV_CAST = ["calo-vey", "domek-ari", "evren-koll", "io-marsh", "nadya-ash", "rune-okafor", "siri-vale", "wren-soto"];
function gvPhoto(seedStr) {
  let h = 0; const s = String(seedStr || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return "assets/cast/" + GV_CAST[h % GV_CAST.length] + ".png";
}
const GV_VAR_GRADES = [
  "sepia(.35) contrast(1.12) brightness(.8)",
  "saturate(.4) contrast(1.25) brightness(.72)",
  "hue-rotate(-14deg) saturate(.7) contrast(1.1) brightness(.85)",
  "saturate(.55) contrast(1.35) brightness(.6)",
];
// A real still for a variant tile — the same reference frame the board shows,
// re-graded per variant so takes read as takes, not placeholders.
function GvStill({ photo, grade, radius = 0 }) {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden" }}>
      <img src={photo} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", filter: grade, display: "block" }}/>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.1), rgba(8,8,10,.45) 82%)" }}/>
    </div>
  );
}

const PROMPT_CHIPS = [
  "35mm · static · no camera move",
  "long-take · slow push-in",
  "handheld · stays with subject",
  "anamorphic · 2.40 · lens flares",
  "natural light · golden hour",
  "sodium streetlight · noir wet street",
  "practical bulb only · dim",
  "score-out · diegetic sound",
];

// ─── Root panel ──────────────────────────────────────────────────────────

function gvResolveIdentity(name) {
  if (!name) return "elias-voss";
  const low = String(name).toLowerCase();
  const match = GV_IDENTITIES.find(x => low.includes(x.name.toLowerCase()) || x.name.toLowerCase().includes(low));
  return match ? match.id : "elias-voss";
}

function GeneratePanelV2() {
  const boardReq = gvReadBoardReq();
  const initPerf = window.CinaPipeline?.getActivePerformer?.();
  const [req, setReq] = useStateGv(boardReq);
  const [step, setStep] = useStateGv(boardReq ? "prompt" : "setup"); // setup | prompt | engine | render | pick
  const [shot, setShot] = useStateGv(boardReq ? boardReq.shotLabel : "14E");
  const [aspect, setAspect] = useStateGv("21:9");
  const [duration, setDuration] = useStateGv(boardReq ? gvDurToSec(boardReq.duration) : 8);
  const [refs, setRefs] = useStateGv(["voss-eye", "the-photo"]);
  const [identity, setIdentity] = useStateGv(() => gvResolveIdentity(boardReq?.performerName || initPerf?.name));
  const [prompt, setPrompt] = useStateGv((boardReq && boardReq.prompt) || "POV through a darkroom safelight wash. A photograph in developer, image emerging. Woman backlit at a window. A figure forming behind her. 35mm. Static. No camera move.");
  const [engineId, setEngineId] = useStateGv("veo-3");
  const [rendering, setRendering] = useStateGv(false);
  const [progress, setProgress] = useStateGv(0);
  const [variants, setVariants] = useStateGv([]);
  const [chosen, setChosen] = useStateGv(null);
  const [rewriting, setRewriting] = useStateGv(false);

  const engine = GV_ENGINES.find(e => e.id === engineId);
  const photo = (req && req.photo) || gvPhoto(shot);
  const toastFn = (typeof window !== "undefined" && typeof window.useToast === "function") ? window.useToast() : null;
  const toast = toastFn?.push || ((t) => window.toast && window.toast(t));

  // Live handoff: a board card's "Generate in studio" refills this wizard even
  // if it's already mounted.
  useEffectGv(() => {
    const onReq = (e) => {
      const d = e.detail; if (!d) return;
      setReq(d);
      setShot(d.shotLabel || "14E");
      setPrompt(d.prompt || "");
      setDuration(gvDurToSec(d.duration));
      if (d.performerName) setIdentity(gvResolveIdentity(d.performerName));
      setVariants([]); setChosen(null);
      setStep("prompt");
    };
    const onPerf = (e) => {
      if (e.detail?.name) setIdentity(gvResolveIdentity(e.detail.name));
    };
    const onVoice = (e) => {
      if (e.detail?.tool === "generate_video") {
        setEngineId("gemini-omni");
        setStep("prompt");
      }
    };
    window.addEventListener("cina:generate-shot", onReq);
    window.addEventListener("cina:performer-sync", onPerf);
    window.addEventListener("cina:voiceStudioTrigger", onVoice);
    return () => {
      window.removeEventListener("cina:generate-shot", onReq);
      window.removeEventListener("cina:performer-sync", onPerf);
      window.removeEventListener("cina:voiceStudioTrigger", onVoice);
    };
  }, []);

  // Close the loop: push the picked take back onto the board frame.
  function writeBack(extra) {
    if (!req || !req.frameId) return false;
    window.dispatchEvent(new CustomEvent("cina:board-writeback", {
      detail: { frameId: req.frameId, sceneId: req.sceneId, shotLabel: req.shotLabel, status: "rendered", seed: chosen ? chosen.seed : undefined, ...extra },
    }));
    try { delete window.__cinaGenReq; localStorage.removeItem("cina:gen-req"); } catch (e) {}
    return true;
  }

  // Render — dispatches real Gemini Omni /api/ai/video when Gemini Omni engine is active
  useEffectGv(() => {
    if (!rendering) return;
    setProgress(0);
    setVariants([]);
    let cancelled = false;
    const isRealOmni = engineId === "gemini-omni";

    if (isRealOmni) {
      let realProgress = 0.08;
      const timer = setInterval(() => {
        if (cancelled) return;
        realProgress = Math.min(0.92, realProgress + 0.04);
        setProgress(realProgress);
      }, 600);
      const fetcher = window.CinaStudioAI?.authFetch || fetch;
      fetcher("/api/ai/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio: aspect === "9:16" ? "9:16" : "16:9",
          resolution: "720p",
          persist: Boolean(window.CinaCloudAuth?.currentUser),
        }),
      })
        .then(r => r.json().then(d => ({ ok: r.ok, d })))
        .then(({ ok, d }) => {
          if (cancelled) return;
          clearInterval(timer);
          setProgress(1);
          const videoUrl = ok ? (d?.videoDataUrl || d?.videoUri) : null;
          const built = [0, 1, 2, 3].map(i => ({
            ...makeVariant(i),
            ...(i === 0 && videoUrl ? { videoUrl, cina: "Gemini Omni 1.2 live master clip ready." } : {}),
          }));
          setVariants(built);
          setChosen(built[0]);
          setRendering(false);
          setStep("pick");
          toast({
            kind: ok ? "ok" : "warn",
            agent: "visual",
            title: ok ? `${shot} · Gemini Omni clip ready` : `${shot} · Fallback preview ready`,
            message: ok ? "Real AI video rendered." : (d?.error || "Check API access for live clip"),
          });
        })
        .catch(() => {
          if (cancelled) return;
          clearInterval(timer);
          setProgress(1);
          setVariants([0, 1, 2, 3].map(makeVariant));
          setRendering(false);
          setStep("pick");
        });
      return () => { cancelled = true; clearInterval(timer); };
    }

    const start = Date.now();
    const dur = engine.sec * 1000 + 1500;
    let raf;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setProgress(p);
      // Stream 4 variants, one every 25% complete
      const count = Math.min(4, Math.floor(p * 5));
      setVariants(prev => prev.length < count ? Array.from({ length: count }).map((_, i) => prev[i] || makeVariant(i)) : prev);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setRendering(false);
        setStep("pick");
        toast({ kind: "ok", agent: "visual", title: `${shot} · 4 variants ready`, message: `${engine.name} · ${engine.cr}cr each · ${duration}s` });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [rendering, engineId]);

  // If the user jumps straight to Pick with nothing rendered, kick a render.
  useEffectGv(() => {
    if (step === "pick" && variants.length === 0 && !rendering) {
      setRendering(true);
      setStep("render");
    }
  }, [step]);

  const makeVariant = (i) => ({
    id: `v${Date.now()}-${i}`,
    seed: Math.floor(Math.random() * 9999),
    continuity: 0.88 + Math.random() * 0.11,
    cina: ["Closer to the brief.", "Drift on the third beat.", "Tightest read so far.", "Continuity off — see hand."][i] || "",
  });

  const cinaRewrite = async () => {
    setRewriting(true);
    const sysPrompt = "You are Cina, a film director's prompt editor. Rewrite the user's AI-video prompt to be more specific (camera, lens, lighting, action) in under 80 words. Return ONLY the rewritten prompt.";
    try {
      const fetcher = window.CinaStudioAI?.authFetch || fetch;
      const resp = await fetcher("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gemini-3-flash-preview", system: sysPrompt, messages: [{ role: "user", content: prompt }] }),
      });
      if (resp.ok) {
        const d = await resp.json();
        if (d?.text) { setPrompt(d.text.trim().replace(/^["']|["']$/g, "")); return; }
      }
      const r = await window.claude.complete(`You are Cina, a film director's prompt editor. Rewrite this AI-video prompt to be more specific (camera, lens, lighting, action), and keep it under 80 words. No fluff. Return ONLY the rewrite:\n\n"${prompt}"`);
      setPrompt(r.trim().replace(/^["']|["']$/g, ""));
    } catch (e) {
      // ignore
    } finally {
      setRewriting(false);
    }
  };

  const stepIdx = ["setup", "prompt", "engine", "render", "pick"].indexOf(step);
  const advance = () => {
    if (step === "render") return;
    const next = ["setup", "prompt", "engine", "render", "pick"][stepIdx + 1];
    if (next === "render") {
      setRendering(true);
      setStep("render");
    } else {
      setStep(next);
    }
  };
  const back = () => {
    const prev = ["setup", "prompt", "engine", "render", "pick"][stepIdx - 1];
    if (prev) setStep(prev);
  };

  const sendVideoNextRef = useRefGv(null);
  sendVideoNextRef.current = () => {
    const pick = chosen || variants[0] || { seed: 4820, continuity: 0.94 };
    writeBack({ seed: pick.seed });
    const payload = {
      kind: "shot",
      shot,
      seed: pick.seed,
      engine: engine.name,
      duration,
      dur: duration,
      photo,
      videoUrl: pick.videoUrl,
      prompt,
    };
    if (window.CinaPipeline) {
      window.CinaPipeline.sendAssetToEdit({ ...payload, openEdit: true });
    } else {
      try { localStorage.setItem("cina:editor-drop", JSON.stringify({ ...payload, at: Date.now() })); } catch (e) {}
      window.dispatchEvent(new CustomEvent("cina:editor-drop", { detail: payload }));
      window.dispatchEvent(new CustomEvent("cina:setView", { detail: "editor" }));
    }
    toast({ kind: "ok", agent: "editor", title: "05 VIDEO → 06 EDIT", text: `${shot} (${engine.name} · seed ${pick.seed}) placed on V1.` });
    return true;
  };

  useEffectGv(() => {
    if (!window.CinaPipeline?.registerSendNext) return;
    return window.CinaPipeline.registerSendNext(["generate", "branch"], () => sendVideoNextRef.current());
  }, []);

  const STEPS = [
    { id: "setup",  n: "01", label: "Setup",   sub: shot + " · " + identity },
    { id: "prompt", n: "02", label: "Prompt",  sub: `${prompt.length} chars` },
    { id: "engine", n: "03", label: "Engine",  sub: engine.name },
    { id: "render", n: "04", label: "Render",  sub: rendering ? `${Math.round(progress * 100)}%` : variants.length ? "ready" : "queued" },
    { id: "pick",   n: "05", label: "Pick",    sub: chosen ? "approved" : variants.length ? `${variants.length} variants` : "—" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "var(--c-bg)", color: "var(--c-ink)" }}>
      {/* Horizontal stepper header */}
      <header style={{ flexShrink: 0, borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)", padding: "14px 26px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, letterSpacing: "-0.02em" }}>Prompt → shot</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            SHOT {shot} · {engine.name.toUpperCase()} · {engine.cr * 4} CR EST · ~{engine.sec}s
          </div>
          <span style={{ flex: 1 }}/>
          {req && (
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", padding: "3px 9px", border: "1px solid var(--c-amber)", borderRadius: 999 }}>
              ↳ FROM STORYBOARD · {req.shotLabel}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 }}>
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = i < stepIdx || (s.id === "render" && variants.length === 4);
            return (
              <button key={s.id} onClick={() => setStep(s.id)} style={{
                flex: "1 1 0", minWidth: 128, display: "flex", gap: 9, alignItems: "center",
                padding: "8px 12px", textAlign: "left",
                background: active ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
                border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: done ? "var(--c-good)" : active ? "var(--c-amber)" : "var(--c-panel-2)",
                  border: `1px solid ${done ? "var(--c-good)" : active ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  color: done ? tkc("panel-2") : active ? tkc("void") : "var(--c-ink-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                }}>{done ? "✓" : s.n}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: active ? "var(--c-ink)" : "var(--c-ink-2)", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ display: "block", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: active ? "var(--c-amber)" : "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Single-column body */}
      <main style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "26px clamp(20px, 6vw, 90px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {step === "setup" && (
          <StepSetup
            req={req}
            photo={photo}
            shot={shot} setShot={setShot}
            aspect={aspect} setAspect={setAspect}
            duration={duration} setDuration={setDuration}
            identity={identity} setIdentity={setIdentity}
            refs={refs} setRefs={setRefs}
          />
        )}
        {step === "prompt" && (
          <StepPrompt
            prompt={prompt} setPrompt={setPrompt}
            cinaRewrite={cinaRewrite} rewriting={rewriting}
          />
        )}
        {step === "engine" && (
          <StepEngine engineId={engineId} setEngineId={setEngineId} duration={duration} aspect={aspect}/>
        )}
        {step === "render" && (
          <StepRender progress={progress} variants={variants} engine={engine} prompt={prompt} photo={photo}/>
        )}
        {step === "pick" && (
          <StepPick variants={variants} chosen={chosen} setChosen={setChosen} shot={shot} engine={engine}
            photo={photo}
            toast={toast}
            onApprove={() => {
              toast({ kind: "ok", agent: "director", title: `${shot} approved`, message: `Sent to assembly · V1 · ${chosen?.seed}` });
            }}
            onSendBoard={() => {
              const ok = writeBack();
              toast({ kind: "ok", agent: "editor", title: ok ? `${shot} · placed on the board` : "Sent to storyboard", message: ok ? "The board card now carries this take — marked rendered." : `${shot} placed in Scene 14 · slot replaced.` });
              if (ok) window.dispatchEvent(new CustomEvent("cina:setView", { detail: "board" }));
            }}
            onSendTimeline={() => {
              writeBack();
              const payload = { kind: "shot", shot, seed: chosen?.seed, engine: engine.name, duration, dur: duration, photo, videoUrl: chosen?.videoUrl, prompt };
              if (window.CinaPipeline) {
                window.CinaPipeline.sendAssetToEdit({ ...payload, openEdit: true });
              } else {
                try { localStorage.setItem("cina:editor-drop", JSON.stringify({ ...payload, at: Date.now() })); } catch (e) {}
                window.dispatchEvent(new CustomEvent("cina:editor-drop", { detail: payload }));
                window.dispatchEvent(new CustomEvent("cina:setView", { detail: "editor" }));
              }
              toast({ kind: "info", agent: "editor", title: "Placed on timeline", message: `${shot} dropped on V1 — opening 06 Edit.` });
            }}
          />
        )}

        {/* Step nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--c-line)" }}>
          <button onClick={back} disabled={stepIdx === 0} style={{
            padding: "9px 14px",
            background: "transparent", color: stepIdx === 0 ? "var(--c-ink-4)" : "var(--c-ink-2)",
            border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
            cursor: stepIdx === 0 ? "default" : "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 600, textTransform: "uppercase",
          }}>← Back</button>

          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            STEP {stepIdx + 1} OF 5
          </span>

          {step === "engine" ? (
            <button onClick={advance} disabled={rendering} style={{
              padding: "10px 20px",
              background: "var(--c-amber)", color: "var(--c-void)",
              border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase",
            }}>▲ Render · {engine.cr * 4} cr →</button>
          ) : step === "pick" ? (
            <button disabled={!chosen} onClick={() => {
              writeBack();
              const payload = { kind: "shot", shot, seed: chosen?.seed, engine: engine.name, duration, dur: duration, photo, videoUrl: chosen?.videoUrl, prompt };
              if (window.CinaPipeline) {
                window.CinaPipeline.sendAssetToEdit({ ...payload, openEdit: true });
              } else {
                try { localStorage.setItem("cina:editor-drop", JSON.stringify({ ...payload, at: Date.now() })); } catch (e) {}
                window.dispatchEvent(new CustomEvent("cina:editor-drop", { detail: payload }));
                window.dispatchEvent(new CustomEvent("cina:setView", { detail: "editor" }));
              }
              toast({ kind: "ok", agent: "editor", title: `${shot} approved & locked`, message: `Seed ${chosen?.seed} placed on V1 — opening 06 Edit.` });
              setVariants([]); setChosen(null);
            }} style={{
              padding: "10px 20px",
              background: chosen ? "var(--c-good)" : "var(--c-panel-3)",
              color: chosen ? tkc("panel-2") : "var(--c-ink-4)",
              border: "none", borderRadius: "var(--r-1)", cursor: chosen ? "pointer" : "default",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase",
            }}>{chosen ? "✓ Approve & Send to 06 Edit" : "Pick a variant"}</button>
          ) : step === "render" ? (
            <span style={{ width: 100 }}/>
          ) : (
            <button onClick={advance} style={{
              padding: "10px 18px",
              background: "transparent", color:  "var(--c-amber)",
              border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase",
            }}>Next →</button>
          )}
        </div>

        {/* Render history — inline, real stills */}
        <details open style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid var(--c-line)" }}>
          <summary className="t-label" style={{ cursor: "pointer", color: "var(--c-ink-3)", marginBottom: 12, listStyle: "none" }}>
            RENDER HISTORY · {GV_HISTORY.length} RUNS
          </summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {GV_HISTORY.map((h, i) => (
              <div key={i} style={{
                display: "flex", gap: 9, padding: 8,
                background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
              }}>
                <div style={{ width: 58, aspectRatio: "16/9", position: "relative", borderRadius: "var(--r-1)", overflow: "hidden", flexShrink: 0 }}>
                  <GvStill photo={gvPhoto(h.shot + h.seed)} grade={GV_VAR_GRADES[i % GV_VAR_GRADES.length]}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em" }}>{h.shot} · {h.v} · {h.model}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>seed {h.seed}</div>
                </div>
                <span style={{
                  padding: "1px 5px", borderRadius: "var(--r-1)", alignSelf: "flex-start", height: "fit-content",
                  background: h.status === "approved" ? "rgba(106,163,122,.18)" : h.status === "rejected" ? "rgba(201,85,72,.15)" : "rgba(var(--accent-rgb),.15)",
                  border: `1px solid ${h.status === "approved" ? "var(--c-good)" : h.status === "rejected" ? "var(--c-blood-l)" : "var(--c-amber)"}`,
                  color: h.status === "approved" ? "var(--c-good)" : h.status === "rejected" ? "var(--c-blood-l)" :  "var(--c-amber)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                }}>{h.status === "review" ? "REV" : h.status === "approved" ? "OK" : "REJ"}</span>
              </div>
            ))}
          </div>
        </details>

        </div>
      </main>
    </div>
  );
}

const GV_HISTORY = [
  { shot: "14E", v: "v3", model: "Veo 3",     seed: 8841, status: "review" },
  { shot: "14E", v: "v2", model: "Kling 2.0", seed: 4412, status: "review" },
  { shot: "14D", v: "v3", model: "Sora 2",    seed: 9921, status: "review" },
  { shot: "14C", v: "v2", model: "Veo 3",     seed: 1188, status: "approved" },
  { shot: "14B", v: "v1", model: "Gen-4",     seed: 2204, status: "rejected" },
  { shot: "14A", v: "v3", model: "Veo 3",     seed: 7733, status: "approved" },
];

// ─── Step bodies ─────────────────────────────────────────────────────────

function StepSetup({ req, photo, shot, setShot, aspect, setAspect, duration, setDuration, identity, setIdentity, refs, setRefs }) {
  const vaultExtras = (window.CHARACTERS || []).filter(c => !GV_IDENTITIES.some(g => g.name.toLowerCase() === (c.name || "").toLowerCase()))
    .slice(0, 4)
    .map(c => ({ id: c.id, name: (c.name || "CAST").toUpperCase(), role: c.role || "Performer", color: c.color || "var(--c-amber)", locked: (c.training || 0) >= 80 || Boolean(c.licensed), photo: c.photo }));
  const identities = [...GV_IDENTITIES, ...vaultExtras];
  const refOptions = [
    { id: "voss-eye",    label: "Voss · eye"     },
    { id: "the-photo",   label: "The photograph" },
    { id: "darkroom",    label: "Darkroom interior" },
    { id: "rain-street", label: "Rain street" },
    { id: "diner",       label: "Diner booth" },
  ];

  return (
    <div>
      <StepHeader n="01" title="Setup" sub="Pick the shot slot, identity, and references."/>

      {req && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", padding: 12, marginBottom: 20, background: "rgba(var(--accent-rgb),.08)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-2)" }}>
          <div style={{ width: 96, aspectRatio: "16/9", position: "relative", borderRadius: "var(--r-1)", overflow: "hidden", flexShrink: 0 }}>
            <GvStill photo={photo} grade={req.grade || GV_VAR_GRADES[0]}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>FROM THE STORYBOARD · {req.shotLabel}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 4, lineHeight: 1.45, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.prompt}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>{req.type} · {req.lens} · {req.duration} · reference frame attached</div>
          </div>
        </div>
      )}

      <Section_generateV2 label="SHOT SLOT" sub="which storyboard frame this fills">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
          {SHOT_SLOTS.map(s => (
            <button key={s} onClick={() => setShot(s)} style={{
              padding: "9px 6px",
              background: shot === s ? "var(--c-amber)" : "var(--c-bg)",
              color: shot === s ? tkc("void") : "var(--c-ink-2)",
              border: `1px solid ${shot === s ? "var(--c-amber)" : "var(--c-line-2)"}`,
              borderRadius: "var(--r-1)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 700,
            }}>{s}</button>
          ))}
        </div>
      </Section_generateV2>

      <Section_generateV2 label="IDENTITY" sub="the actor on screen — face locked via Vault">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {identities.map(i => (
            <button key={i.id} onClick={() => setIdentity(i.id)} style={{
              padding: 10,
              background: identity === i.id ? `${i.color}22` : "var(--c-bg)",
              border: `1px solid ${identity === i.id ? i.color : "var(--c-line-2)"}`,
              borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
              textAlign: "left", display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ position: "relative", aspectRatio: "1/1", borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 2, border: `1px solid ${i.color}88` }}>
                <img src={i.photo || gvIdentityPhoto(i.id)} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: identity === i.id ? "none" : "grayscale(.4) brightness(.82)" }}/>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 55%, ${i.color}cc)` }}/>
                {identity === i.id && <div style={{ position: "absolute", top: 5, right: 5, width: 16, height: 16, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-void)", fontSize: "var(--fs-label)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink)", letterSpacing: ".16em", fontWeight: 700 }}>{i.name}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: i.color, letterSpacing: ".16em" }}>
                {i.locked ? "● LOCKED" : "○ UNLOCKED"}
              </div>
            </button>
          ))}
        </div>
      </Section_generateV2>

      <Section_generateV2 label="REFERENCES" sub="visual anchors — composition, light, palette">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {refOptions.map(r => {
            const on = refs.includes(r.id);
            return (
              <button key={r.id} onClick={() => setRefs(rs => on ? rs.filter(x => x !== r.id) : [...rs, r.id])} style={{
                padding: "6px 12px",
                background: on ? "var(--c-amber)" : "var(--c-bg)",
                color: on ? tkc("void") : "var(--c-ink-2)",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: 999, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
              }}>{on ? "✓ " : "+ "}{r.label}</button>
            );
          })}
        </div>
      </Section_generateV2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Section_generateV2 label="ASPECT">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
            {["21:9", "16:9", "9:16", "1:1"].map(a => (
              <button key={a} onClick={() => setAspect(a)} style={{
                padding: "9px 6px",
                background: aspect === a ? "var(--c-panel-3)" : "var(--c-bg)",
                color: aspect === a ? "var(--c-amber)" : "var(--c-ink-2)",
                border: `1px solid ${aspect === a ? "var(--c-amber-d)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 600,
              }}>{a}</button>
            ))}
          </div>
        </Section_generateV2>
        <Section_generateV2 label={`DURATION · ${duration}s`}>
          <input type="range" min={2} max={20} step={2} value={duration} onChange={e => setDuration(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: tkc("amber") }}/>
        </Section_generateV2>
      </div>
    </div>
  );
}

function StepPrompt({ prompt, setPrompt, cinaRewrite, rewriting }) {
  return (
    <div>
      <StepHeader n="02" title="Prompt" sub="Describe the shot in plain prose. Cina can tighten it."/>

      <Section_generateV2 label={`PROMPT · ${prompt.length} CHARS`} sub="camera + subject + action + light">
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={8} style={{
          width: "100%", padding: "12px 14px",
          background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
          borderRadius: "var(--r-1)", color: "var(--c-ink)",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-display)", fontStyle: "italic",
          lineHeight: 1.5, outline: "none", resize: "vertical",
        }}/>
      </Section_generateV2>

      <Section_generateV2 label="STYLE CHIPS · click to append">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PROMPT_CHIPS.map(c => (
            <button key={c} onClick={() => setPrompt(p => p.trim() + ". " + c)} style={{
              padding: "5px 10px",
              background: "var(--c-bg)", color: "var(--c-ink-2)",
              border: "1px solid var(--c-line-2)", borderRadius: 999,
              cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em",
            }}>+ {c}</button>
          ))}
        </div>
      </Section_generateV2>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={cinaRewrite} disabled={rewriting} style={{
          padding: "10px 16px",
          background: rewriting ? "var(--c-panel-3)" : "transparent",
          color: rewriting ? "var(--c-ink-4)" :  "var(--c-amber)",
          border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)",
          cursor: rewriting ? "default" : "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>{rewriting ? "Cina is thinking…" : "✦ Cina rewrites"}</button>
        <button onClick={() => setPrompt("")} style={{
          padding: "10px 12px", background: "transparent", color: "var(--c-ink-3)",
          border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
        }}>Clear</button>
      </div>
    </div>
  );
}

function StepEngine({ engineId, setEngineId, duration, aspect }) {
  return (
    <div>
      <StepHeader n="03" title="Engine" sub="Pick a model. Cost & ETA shown per engine."/>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GV_ENGINES.map(e => {
          const active = e.id === engineId;
          return (
            <button key={e.id} onClick={() => setEngineId(e.id)} style={{
              padding: 16, textAlign: "left",
              background: active ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel)",
              border: `1.5px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`,
              borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "var(--r-2)",
                background: active ? `linear-gradient(135deg, var(--c-amber), ${tkc("amber-d")})` : "var(--c-bg)",
                border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-lead)", color: active ? tkc("void") : "var(--c-ink-3)",
                fontWeight: 600,
              }}>{e.name.slice(0, 1)}</div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.01em" }}>{e.name}</span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>{e.vendor}</span>
                  {e.recommended && <span style={{ padding: "1px 6px", background: "var(--c-amber)", color: "var(--c-void)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, borderRadius: "var(--r-1)" }}>BEST FOR THIS SHOT</span>}
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 4 }}>{e.blurb}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>
                  Best for · {e.best}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: active ? "var(--c-amber)" : "var(--c-ink)", fontWeight: 500, lineHeight: 1 }}>{e.cr} cr</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4 }}>{e.sec}s ETA</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepRender({ progress, variants, engine, prompt, photo }) {
  return (
    <div>
      <StepHeader n="04" title="Render" sub={`${engine.name} is generating 4 variants. They stream in as they finish.`}/>
      <div style={{
        padding: 16, background: "var(--c-panel)", border: `1px solid var(--c-amber)`,
        borderRadius: "var(--r-2)", marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background:  "var(--c-amber)",
              boxShadow: "0 0 8px var(--c-amber)",
              animation: "gvBlink 1s infinite",
            }}/>
            RENDERING · {engine.name.toUpperCase()} · {Math.round(progress * 100)}%
          </span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
            {Math.max(0, Math.ceil((1 - progress) * engine.sec))}s remaining
          </span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "var(--c-amber)", transition: "width .1s linear", boxShadow: "0 0 12px var(--c-amber)" }}/>
        </div>
        <div style={{ marginTop: 12, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>
          <div>$ {engine.id} render --duration 8 --aspect 21:9 --identity elias-voss</div>
          {progress > 0.1 && <div>{">"} prompt encoded · {prompt.split(" ").length} tokens</div>}
          {progress > 0.25 && <div>{">"} variant 1 frame 1/192 · identity hash matched</div>}
          {progress > 0.4 && <div>{">"} variant 2 frame 22/192 · continuity 0.94</div>}
          {progress > 0.55 && <div>{">"} variant 3 sampling · cfg 4.5 · steps 28</div>}
          {progress > 0.75 && <div>{">"} variant 4 mastering · audio -14 LUFS</div>}
          {progress > 0.95 && <div style={{ color: "var(--c-good)" }}>{">"} all variants ready · uploading</div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => {
          const v = variants[i];
          return (
            <div key={i} style={{
              aspectRatio: "21/9",
              background: "var(--c-panel)",
              border: `1px solid ${v ? "var(--c-amber)" : "var(--c-line-2)"}`,
              borderRadius: "var(--r-1)", position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {!v && (
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>QUEUED</span>
              )}
              {v && (
                <>
                  <GvStill photo={photo} grade={GV_VAR_GRADES[i % GV_VAR_GRADES.length]}/>
                  <span style={{
                    position: "absolute", top: 6, left: 6, zIndex: 2,
                    padding: "1px 6px", background: "rgba(0,0,0,.7)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                    letterSpacing: ".16em", border: "1px solid var(--c-amber)",
                  }}>VAR {i + 1} · SEED {v.seed}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes gvBlink { 50% { opacity: 0.4 } }`}</style>
    </div>
  );
}

function StepPick({ variants, chosen, setChosen, shot, engine, photo, onSendBoard, onSendTimeline }) {
  return (
    <div>
      <StepHeader n="05" title="Pick a variant" sub="Click to select. Cina has notes on each."/>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 18 }}>
        {variants.map((v, i) => {
          const active = chosen?.id === v.id;
          return (
            <button key={v.id} onClick={() => setChosen(v)} style={{
              padding: 0, background: "transparent",
              border: `1.5px solid ${active ? "var(--c-good)" : "var(--c-line-2)"}`,
              borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
              textAlign: "left", overflow: "hidden",
              position: "relative",
              boxShadow: active ? "0 0 0 3px rgba(106,163,122,.18)" : "none",
            }}>
              <div style={{
                aspectRatio: "21/9",
                position: "relative", overflow: "hidden", background: tkc("bg"),
              }}>
                {v.videoUrl ? (
                  <video src={v.videoUrl} controls muted loop playsInline onClick={e => e.stopPropagation()} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                ) : (
                  <GvStill photo={photo} grade={GV_VAR_GRADES[i % GV_VAR_GRADES.length]}/>
                )}
                <span style={{
                  position: "absolute", top: 8, left: 8,
                  padding: "2px 7px", background: "rgba(0,0,0,.7)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: active ? "var(--c-good)" :  "var(--c-amber)",
                  letterSpacing: ".16em", border: `1px solid ${active ? "var(--c-good)" : "var(--c-amber)"}`,
                  fontWeight: 700,
                }}>VAR {i + 1} · SEED {v.seed}</span>
                <span style={{
                  position: "absolute", top: 8, right: 8,
                  padding: "2px 7px", background: "rgba(0,0,0,.7)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: v.continuity > 0.93 ? "var(--c-good)" :  "var(--c-amber)",
                  letterSpacing: ".16em", border: `1px solid ${v.continuity > 0.93 ? "var(--c-good)" : "var(--c-amber)"}`,
                }}>CONT {Math.round(v.continuity * 100)}%</span>
                {active && (
                  <div style={{
                    position: "absolute", right: 10, bottom: 10,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--c-good)", color: tkc("panel-2"),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--fs-lead)", fontWeight: 700,
                  }}>✓</div>
                )}
              </div>
              <div style={{ padding: 12, background: "var(--c-panel)" }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700, marginBottom: 4 }}>
                  CINA SAYS
                </div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.4 }}>
                  "{v.cina}"
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {chosen && (
        <div style={{
          padding: 16, background: "var(--c-panel)",
          border: "1px solid var(--c-good)", borderRadius: "var(--r-2)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--c-good)", color: tkc("panel-2"),
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-lead)",
          }}>✓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              PICKED · SEED {chosen.seed} · CONT {Math.round(chosen.continuity * 100)}%
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
              Shot {shot} · {engine.name} · ready to place
            </div>
          </div>
          <button onClick={onSendBoard} style={pickBtn}>↗ Send to Board</button>
          <button onClick={onSendTimeline} style={pickBtn}>↗ Place on Timeline</button>
        </div>
      )}
    </div>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────

function StepHeader({ n, title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
        letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
      }}>STEP {n}</div>
      <h2 style={{
        margin: "4px 0 6px", fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.02em",
      }}>{title}</h2>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function Section_generateV2({ label, sub, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="t-label">{label}</span>
        {sub && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}

const pickBtn = {
  padding: "8px 12px",
  background: "transparent", color:  "var(--c-amber)",
  border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)", cursor: "pointer",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
  fontWeight: 700, textTransform: "uppercase",
};

// ─── Override the existing GeneratePanel ─────────────────────────────────

window.GeneratePanel = GeneratePanelV2;
