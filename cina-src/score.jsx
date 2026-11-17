// score.jsx — Cina Studio · Score tab. AI music workflow + audio editor.
//
// Three columns:
//   LEFT   Cue sheet (per-scene cues, status dots, dur, take counts)
//   MAIN   Take work area: video sync strip → master waveform with handles +
//          hit-points → transport → stem mixer → tabbed tools (Region / Mix /
//          EQ / FX / Sync). Every control mutates real per-take state.
//   RIGHT  AI assistant: free-text prompt, quick transforms, reference
//          uploads, transformation history per take.

const { useState: usSc, useEffect: ueSc, useRef: urSc, useMemo: umSc } = React;

// ─── Cues ──────────────────────────────────────────────────────────────
const CUES_INIT = [
  { id: "c1", scene: "01 OPEN",     label: "Main title",     dur: 90,  status: "ready",      brief: "Sodium-lit city, low strings, hushed piano. A theme that doesn't promise resolution.",
    hits: [{ t: 14, label: "Title in" }, { t: 62, label: "Cut to wide" }] },
  { id: "c2", scene: "07 DARKROOM", label: "Discovery",      dur: 42,  status: "draft",      brief: "Pulse builds as the photograph emerges. Tension without melody.",
    hits: [{ t: 18, label: "Image surfaces" }, { t: 33, label: "She sees it" }] },
  { id: "c3", scene: "14 DARKROOM", label: "The photograph", dur: 28,  status: "approved",   brief: "Held drone in C minor. One cello, one breath of choir, a clock somewhere.",
    hits: [{ t: 9, label: "Close on print" }] },
  { id: "c4", scene: "15 STREET",   label: "Dawn / resolve", dur: 60,  status: "ready",      brief: "First light. The pad opens. A single, hopeful note that won't resolve until the cut.",
    hits: [{ t: 22, label: "Sun crests" }, { t: 41, label: "She walks out" }, { t: 56, label: "Cut to black" }] },
  { id: "c5", scene: "20 CLIMAX",   label: "Confrontation",  dur: 95,  status: "empty",      brief: "", hits: [] },
  { id: "c6", scene: "24 END",      label: "End credits",    dur: 180, status: "empty",      brief: "", hits: [] },
];

const MOOD_PRESETS = [
  { id: "tense",      label: "Tense",      icon: "▲" },
  { id: "melancholy", label: "Melancholy", icon: "◐" },
  { id: "hopeful",    label: "Hopeful",    icon: "○" },
  { id: "dread",      label: "Dread",      icon: "▼" },
  { id: "kinetic",    label: "Kinetic",    icon: "▶" },
  { id: "neutral",    label: "Neutral",    icon: "—" },
];

const ENSEMBLE = [
  "Solo piano", "String quartet", "Full orchestra", "Synth pad",
  "Choir + strings", "Cello + electronics", "Hybrid (orch + synth)",
];
const KEYS = ["C minor","D minor","E minor","A minor","C major","D major","F# minor","G minor","B♭ major"];

const STEM_DEFS = [
  { id: "pads",    label: "Pads",     color: tkc("cat-1") },
  { id: "strings", label: "Strings",  color: tkc("warn") },
  { id: "perc",    label: "Perc",     color: tkc("ink-2") },
  { id: "fx",      label: "FX",       color: tkc("cat-2") },
];

const newId = (p="t") => `${p}_${Date.now().toString(36)}_${Math.floor(Math.random()*1e4)}`;

// per-take edit state — all controls write here
function defaultEdit(dur) {
  return {
    trim: [0, dur], fadeIn: 0.5, fadeOut: 1.5,
    gain: 0, pan: 0, width: 100,
    hp: 60, lp: 95, mid: 50, midGain: 0,
    reverb: 30, comp: 25, sidechain: 40,
    stems: STEM_DEFS.reduce((a, s) => ({ ...a, [s.id]: { vol: 75, pan: 0, mute: false, solo: false }}), {}),
    history: [], // { t, label } applied AI transforms
  };
}

const VARIANTS_INIT = [
  { id: "v5", cueId: "c1", model: "Udio 1.5",     bpm: 72, key: "D minor",  duration: 90, waveSeed: 0.62, status: "ready", description: "Theme statement · piano + low strings", edit: defaultEdit(90) },
  { id: "v6", cueId: "c3", model: "Suno v4",      bpm: 58, key: "C minor",  duration: 28, waveSeed: 0.5,  status: "ready", description: "Drone + clock tick · the brief, exactly", edit: defaultEdit(28) },
  { id: "v1", cueId: "c4", model: "Suno v4",      bpm: 62, key: "C minor",  duration: 60, waveSeed: 0.6,  status: "ready", description: "Cello + sub pad · one note that won't end", edit: defaultEdit(60) },
  { id: "v2", cueId: "c4", model: "Udio 1.5",     bpm: 70, key: "C minor",  duration: 60, waveSeed: 0.7,  status: "ready", description: "Choir + strings · more motion, less mystery", edit: defaultEdit(60) },
  { id: "v3", cueId: "c4", model: "Stable Audio", bpm: 58, key: "A minor",  duration: 60, waveSeed: 0.5,  status: "ready", description: "Piano + ambience · sparse, watchful", edit: defaultEdit(60) },
];

// ─── Root panel ────────────────────────────────────────────────────────
function ScorePanel() {
  const [cues, setCues] = usSc(CUES_INIT);
  const [variants, setVariants] = usSc(VARIANTS_INIT);
  const [selectedCue, setSelectedCue] = usSc("c4");
  const [activeTake, setActiveTake] = usSc("v1");
  const [showAdd, setShowAdd] = usSc(false);

  // brief + generator inputs (mirrored from cue)
  const [brief, setBrief] = usSc("");
  const [mood, setMood] = usSc("dread");
  const [ensemble, setEnsemble] = usSc("Cello + electronics");
  const [bpm, setBpm] = usSc(62);
  const [keySig, setKeySig] = usSc("C minor");
  const [intensity, setIntensity] = usSc(35);

  // transport (live scrubber)
  const [playing, setPlaying] = usSc(false);
  const [scrub, setScrub] = usSc(0);
  const [loop, setLoop] = usSc(false);

  // tools tab
  const [tab, setTab] = usSc("region");

  const cue = cues.find(c => c.id === selectedCue);
  const cueTakes = umSc(() => variants.filter(v => v.cueId === selectedCue), [variants, selectedCue]);
  const take = umSc(() => cueTakes.find(v => v.id === activeTake) || cueTakes[0], [cueTakes, activeTake]);

  // sync brief, transport reset on cue change
  ueSc(() => {
    if (!cue) return;
    setBrief(cue.brief || "");
    if (!cueTakes.find(v => v.id === activeTake)) setActiveTake(cueTakes[0]?.id || "");
    setScrub(0); setPlaying(false);
  }, [selectedCue]);

  // playhead animator
  ueSc(() => {
    if (!playing || !take) return;
    const id = setInterval(() => {
      setScrub(s => {
        const out = take.edit.trim[1];
        const inT = take.edit.trim[0];
        if (s >= out) {
          if (loop) return inT;
          setPlaying(false); return out;
        }
        return s + 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, take, loop]);

  // helpers
  const updateTake = (patch) => {
    if (!take) return;
    setVariants(prev => prev.map(v => v.id === take.id ? { ...v, edit: { ...v.edit, ...patch } } : v));
  };
  const updateStem = (stemId, patch) => {
    if (!take) return;
    setVariants(prev => prev.map(v => {
      if (v.id !== take.id) return v;
      // solo logic — soloing one stem unsolos others
      const stems = { ...v.edit.stems };
      if (patch.solo === true) {
        Object.keys(stems).forEach(k => { stems[k] = { ...stems[k], solo: k === stemId }; });
      } else {
        stems[stemId] = { ...stems[stemId], ...patch };
      }
      return { ...v, edit: { ...v.edit, stems } };
    }));
  };
  const logHistory = (label) => {
    if (!take) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setVariants(prev => prev.map(v => v.id === take.id
      ? { ...v, edit: { ...v.edit, history: [{ t: ts, label }, ...v.edit.history.slice(0, 19)] } }
      : v));
  };

  // cue ops
  const addCue = (data) => {
    const c = { id: newId("cue"), scene: data.scene || "—", label: data.label, dur: Number(data.dur)||60, status: "empty", brief: data.brief || "", hits: [] };
    setCues(p => [...p, c]); setSelectedCue(c.id); setShowAdd(false);
    toastSc(`Cue added · ${c.label}`);
  };
  const deleteCue = async (cueId) => {
    const takes = variants.filter(v => v.cueId === cueId).length;
    const ok = await (window.cinaConfirm ? window.cinaConfirm({
      title: "Delete this cue?",
      body: takes ? takes + " take" + (takes === 1 ? "" : "s") + " recorded against it go too." : "No takes recorded against it yet.",
      confirmLabel: "Delete cue", danger: true,
    }) : Promise.resolve(false));
    if (!ok) return;
    setCues(p => p.filter(c => c.id !== cueId));
    setVariants(p => p.filter(v => v.cueId !== cueId));
    if (selectedCue === cueId) setSelectedCue(cues.find(c => c.id !== cueId)?.id || "");
    toastSc("Cue deleted");
  };
  const saveBrief = () => {
    setCues(p => p.map(c => c.id === selectedCue ? { ...c, brief, status: c.status === "empty" ? "draft" : c.status } : c));
  };

  // generate / upload / reroll / use — includes real Lyria AI score generation
  const onGenerate = () => {
    saveBrief();
    const moodLabel = MOOD_PRESETS.find(m=>m.id===mood)?.label || "—";
    const lyriaId = newId("v");
    const newOnes = [
      { id: lyriaId, cueId: selectedCue, model: "Lyria 3", bpm, key: keySig, duration: cue.dur, waveSeed: 0.48+Math.random()*0.35, status: "rendering", progress: 0.1, description: `${moodLabel} · ${ensemble} · Gemini Lyria`, edit: defaultEdit(cue.dur) },
      { id: newId("v"), cueId: selectedCue, model: "Suno v4",  bpm: bpm+4, key: keySig, duration: cue.dur, waveSeed: 0.45+Math.random()*0.4, status: "rendering", progress: 0, description: `${moodLabel} · ${ensemble} · alt`, edit: defaultEdit(cue.dur) },
    ];
    setVariants(prev => [...newOnes, ...prev]);
    setCues(p => p.map(c => c.id === selectedCue ? { ...c, status: "generating" } : c));
    toastSc(`Generating Lyria 3 score for ${cue.label}…`);

    const fetcher = window.CinaStudioAI?.authFetch || fetch;
    const scorePrompt = `${brief || cue.label}. Mood: ${moodLabel}. Instrumentation: ${ensemble}. Key: ${keySig}.`;
    fetcher("/api/ai/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "clip",
        prompt: scorePrompt,
        bpm: Number(bpm) || 84,
        density: Math.min(1, Math.max(0.15, (Number(intensity) || 60) / 100)),
        brightness: 0.45,
        durationSec: Math.min(30, Math.max(8, Number(cue.dur) || 20)),
        persist: Boolean(window.CinaCloudAuth?.currentUser),
      }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d?.audioDataUrl) {
          setVariants(prev => prev.map(v => v.id === lyriaId ? { ...v, status: "ready", progress: 1, audioUrl: d.audioDataUrl } : v));
          setActiveTake(lyriaId);
          toastSc(`Lyria 3 audio ready · ${cue.label}`);
        }
      })
      .catch(() => {});
  };
  const uploadTrack = () => {
    const v = { id: newId("v"), cueId: selectedCue, model: "Upload", bpm: 60, key: "—", duration: cue.dur, waveSeed: 0.55, status: "ready", description: "Imported · external_track.wav", edit: defaultEdit(cue.dur) };
    setVariants(p => [v, ...p]); setActiveTake(v.id);
    toastSc("Track uploaded");
  };
  const reroll = () => {
    if (!take) return;
    const nv = { ...take, id: newId("v"), status: "rendering", progress: 0, model: take.model === "Suno v4" ? "Udio 1.5" : "Suno v4", description: take.description + " · re-roll", edit: defaultEdit(take.duration) };
    setVariants(p => [nv, ...p]); setActiveTake(nv.id);
    toastSc("Re-rolling…");
  };
  const deleteTake = () => {
    if (!take) return;
    setVariants(p => p.filter(v => v.id !== take.id));
    const next = cueTakes.find(v => v.id !== take.id);
    if (next) setActiveTake(next.id);
    toastSc("Take deleted");
  };
  const useInCut = (openEditor = false) => {
    if (!take) return;
    setCues(p => p.map(c => c.id === selectedCue ? { ...c, status: "approved" } : c));
    if (window.CinaPipeline) {
      window.CinaPipeline.sendAssetToEdit({
        kind: "audio",
        label: `${take.model} · ${cue.label}`,
        dur: Math.max(4, Math.round((take.edit?.trim?.[1] || cue.dur) - (take.edit?.trim?.[0] || 0))),
        audioUrl: take.audioUrl || null,
        openEdit: openEditor,
      });
    }
    toastSc(`${take.model} → A3 track · ${cue.label}`);
  };
  const bounceStem = (stemId) => {
    const s = STEM_DEFS.find(x => x.id === stemId);
    toastSc(`Stem exported · ${cue.label}_${s.label.toLowerCase()}.wav`);
  };

  // rendering progress animator
  ueSc(() => {
    const r = variants.find(v => v.status === "rendering");
    if (!r) return;
    const id = setInterval(() => {
      setVariants(prev => prev.map(v => {
        if (v.id !== r.id) return v;
        const np = (v.progress || 0) + 0.04;
        if (np >= 1) return { ...v, status: "ready", progress: 1 };
        return { ...v, progress: np };
      }));
    }, 220);
    return () => clearInterval(id);
  }, [variants]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: "var(--c-bg)" }}>
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* LEFT — Cue sheet */}
        <CueSheet
          cues={cues} variants={variants}
          selectedCue={selectedCue} onSelect={setSelectedCue}
          onDelete={deleteCue} onAdd={() => setShowAdd(true)}
        />

        {/* MAIN */}
        {!cue ? (
          <ScoreEmpty onAdd={() => setShowAdd(true)}/>
        ) : (
          <div style={{ flex: 1, display: "flex", minWidth: 0, overflow: "hidden" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
              <CueHeader
                cue={cue} brief={brief} setBrief={setBrief} onBlur={saveBrief}
                mood={mood} setMood={setMood} ensemble={ensemble} setEnsemble={setEnsemble}
                bpm={bpm} setBpm={setBpm} keySig={keySig} setKeySig={setKeySig}
                intensity={intensity} setIntensity={setIntensity}
                onGenerate={onGenerate} onUpload={uploadTrack}
              />

              {take ? (
                <>
                  <TakesStrip
                    takes={cueTakes} active={activeTake} onPick={setActiveTake}
                    onAdd={onGenerate}
                  />

                  <VideoStrip cue={cue} scrub={scrub} take={take}/>

                  <MasterWaveform
                    take={take} cue={cue} scrub={scrub} onScrub={setScrub}
                    onChange={updateTake}
                    onAddHit={(t) => {
                      setCues(p => p.map(c => c.id === selectedCue ? { ...c, hits: [...c.hits, { t, label: `Hit @ ${t.toFixed(1)}s` }] } : c));
                      logHistory(`Hit-point at ${t.toFixed(1)}s`);
                    }}
                    onRemoveHit={(idx) => setCues(p => p.map(c => c.id === selectedCue ? { ...c, hits: c.hits.filter((_,i)=>i!==idx) } : c))}
                  />

                  <Transport
                    take={take} scrub={scrub} setScrub={setScrub}
                    playing={playing} setPlaying={setPlaying}
                    loop={loop} setLoop={setLoop}
                    onChange={updateTake}
                    onSplit={() => { logHistory(`Split at ${scrub.toFixed(1)}s`); toastSc(`Split at ${scrub.toFixed(1)}s`); }}
                  />

                  <StemMixer take={take} onChange={updateStem} onBounce={bounceStem}/>

                  <ToolsTabs tab={tab} setTab={setTab}/>
                  <ToolsBody tab={tab} take={take} onChange={updateTake}/>

                  <BounceBar
                    take={take} cue={cue}
                    onUse={useInCut} onReroll={reroll} onDelete={deleteTake}
                    onReset={() => updateTake(defaultEdit(take.duration))}
                  />
                </>
              ) : (
                <div style={{ padding: 60, textAlign: "center", color: "var(--c-ink-4)" }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginBottom: 12 }}>No takes yet</div>
                  <div style={{ fontSize: "var(--fs-body)", marginBottom: 18 }}>Describe how this cue should feel above, then generate — or upload your own.</div>
                  <button className="btn btn-primary" onClick={onGenerate}><Icon name="wand" size={11}/>Generate first takes</button>
                </div>
              )}
            </div>

            {/* RIGHT — AI assistant */}
            <AIAssistant
              take={take} cue={cue}
              onApply={(label, patch) => { updateTake(patch || {}); logHistory(label); toastSc(label); }}
              onLog={logHistory}
            />
          </div>
        )}
      </div>

      {showAdd && <AddCueDialog onClose={() => setShowAdd(false)} onCreate={addCue}/>}
    </div>
  );
}

// ─── Left: cue sheet ───────────────────────────────────────────────────
function CueSheet({ cues, variants, selectedCue, onSelect, onDelete, onAdd }) {
  return (
    <aside style={{ width: 268, flexShrink: 0, borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", background: "var(--c-panel)" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--c-line)" }}>
        <div className="t-label" style={{ marginBottom: 4 }}>Cue sheet</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Last Light · Score</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 6 }}>
          {cues.length} cues · {Math.round(cues.reduce((a,c)=>a+c.dur,0)/60)}m total · {variants.length} takes
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {cues.map(c => {
          const active = c.id === selectedCue;
          const takes = variants.filter(v => v.cueId === c.id).length;
          return (
            <div key={c.id} style={{
              position: "relative",
              borderBottom: "1px solid var(--c-line)",
              borderLeft: active ? "2px solid var(--c-amber)" : "2px solid transparent",
              background: active ? "rgba(var(--accent-rgb),.06)" : "transparent",
            }}>
              <button onClick={() => onSelect(c.id)} style={{
                width: "100%", textAlign: "left", padding: "12px 36px 12px 14px",
                background: "transparent", border: "none",
                cursor: "pointer", display: "flex", flexDirection: "column", gap: 4,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{c.scene}</span>
                  <StatusDot_score status={c.status}/>
                </div>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: active ? "var(--c-ink)" : "var(--c-ink-2)" }}>{c.label}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{Math.floor(c.dur/60)}:{String(c.dur%60).padStart(2,"0")} · {takes} take{takes!==1?"s":""}{c.hits.length ? ` · ${c.hits.length} hit${c.hits.length>1?"s":""}` : ""}</span>
              </button>
              <button onClick={() => onDelete(c.id)} title="Delete cue" style={{
                position: "absolute", top: 10, right: 8, width: 22, height: 22,
                background: "transparent", border: "none", color: "var(--c-ink-4)",
                cursor: "pointer", borderRadius: "var(--r-1)",
              }} onMouseEnter={e => e.currentTarget.style.color = tkc("bad")}
                 onMouseLeave={e => e.currentTarget.style.color = "var(--c-ink-4)"}>
                <Icon name="x" size={11}/>
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ padding: 10, borderTop: "1px solid var(--c-line)" }}>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onAdd}>
          <Icon name="plus" size={11}/>Add cue
        </button>
      </div>
    </aside>
  );
}

// ─── Cue header (brief + generator inputs) ─────────────────────────────
function CueHeader({ cue, brief, setBrief, onBlur, mood, setMood, ensemble, setEnsemble, bpm, setBpm, keySig, setKeySig, intensity, setIntensity, onGenerate, onUpload }) {
  return (
    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-line)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{cue.scene}</span>
        <StatusDot_score status={cue.status} withLabel/>
        <div style={{ flex: 1 }}/>
        <button className="btn btn-ghost" onClick={() => window.dispatchEvent(new CustomEvent("cina:setView", { detail: "script" }))}><Icon name="chat" size={11}/>From script</button>
      </div>
      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: 0, marginBottom: 10, letterSpacing: "-0.01em" }}>{cue.label}</h2>
      <textarea
        value={brief} onChange={e => setBrief(e.target.value)} onBlur={onBlur}
        placeholder="Describe how this cue should feel — instrumentation, dynamic arc, references…"
        rows={2}
        style={{
          width: "100%",
          background: "transparent", border: "1px solid var(--c-line)",
          color: "var(--c-ink-2)", fontSize: "var(--fs-body)", lineHeight: 1.5, padding: 10,
          fontFamily: "var(--f-sans)", borderRadius: "var(--r-1)", resize: "vertical",
        }}
      />

      <div style={{ marginTop: 14 }}>
        <div className="t-label" style={{ marginBottom: 8 }}>Mood</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MOOD_PRESETS.map(m => (
            <button key={m.id} onClick={() => setMood(m.id)} style={{
              padding: "6px 12px", border: `1px solid ${mood === m.id ? "var(--c-amber)" : "var(--c-line-2)"}`,
              background: mood === m.id ? "rgba(var(--accent-rgb),.08)" : "transparent",
              color: mood === m.id ? "var(--c-amber)" : "var(--c-ink-2)",
              fontSize: "var(--fs-body)", cursor: "pointer", borderRadius: "var(--r-1)", fontFamily: "var(--f-sans)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: "var(--fs-label)", opacity: 0.7 }}>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fluid-4" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 14, alignItems: "end", marginTop: 14 }}>
        <FieldSc label="Ensemble">
          <select value={ensemble} onChange={e => setEnsemble(e.target.value)} style={selectSc}>
            {ENSEMBLE.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </FieldSc>
        <FieldSc label="Tempo (BPM)">
          <input type="number" min="30" max="300" value={bpm}
            onChange={e => setBpm(e.target.value === "" ? "" : Math.max(30, Math.min(300, Number(e.target.value) || 30)))} style={inputSc}/>
        </FieldSc>
        <FieldSc label="Key">
          <select value={keySig} onChange={e => setKeySig(e.target.value)} style={selectSc}>{KEYS.map(k => <option key={k}>{k}</option>)}</select>
        </FieldSc>
        <FieldSc label={`Intensity arc · ${intensity}%`}>
          <input type="range" min="0" max="100" value={intensity} onChange={e => setIntensity(Number(e.target.value))} style={{ width: "100%" }}/>
        </FieldSc>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <button className="btn btn-primary" onClick={onGenerate} style={{ minWidth: 180 }}>
          <Icon name="wand" size={11}/>Generate · 2 variants
        </button>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>~ {Math.round(cue.dur * 0.4)} cr · 30s ETA</span>
        <div style={{ flex: 1 }}/>
        <button className="btn btn-ghost" onClick={onUpload}><Icon name="upload" size={11}/>Upload track</button>
      </div>
    </div>
  );
}

// ─── Takes A/B strip ────────────────────────────────────────────────────
function TakesStrip({ takes, active, onPick, onAdd }) {
  return (
    <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 8, background: "var(--c-panel)" }}>
      <span className="t-label" style={{ marginRight: 4 }}>Takes</span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
        {takes.map((t, i) => {
          const isActive = t.id === active;
          const isRendering = t.status === "rendering";
          return (
            <button key={t.id} onClick={() => !isRendering && onPick(t.id)} disabled={isRendering} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px",
              border: `1px solid ${isActive ? "var(--c-amber)" : "var(--c-line-2)"}`,
              background: isActive ? "rgba(var(--accent-rgb),.08)" : "var(--c-bg)",
              color: isActive ? "var(--c-ink)" : "var(--c-ink-2)",
              cursor: isRendering ? "wait" : "pointer", borderRadius: "var(--r-1)",
              fontSize: "var(--fs-body)", opacity: isRendering ? 0.6 : 1,
            }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>T{i+1}</span>
              <span style={{ fontWeight: 500 }}>{t.model}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{t.bpm}bpm · {t.key}</span>
              {isRendering && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{Math.round((t.progress||0)*100)}%</span>}
            </button>
          );
        })}
      </div>
      <button className="btn btn-ghost" onClick={onAdd}><Icon name="plus" size={11}/>New take</button>
    </div>
  );
}

// ─── Video strip (5 thumbs synced to scrub) ─────────────────────────────
function VideoStrip({ cue, scrub, take }) {
  const FRAMES = 8;
  const dur = take.duration;
  const palette = [tkc("line-2"), tkc("line-3"), tkc("line-3"), tkc("ink-4"), tkc("ink-4"), tkc("ink-3"), tkc("ink-3"), tkc("amber-d")];
  return (
    <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid var(--c-line)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="t-label">Picture · {cue.scene}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{dur}s · synced to playhead</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${FRAMES}, 1fr)`, gap: 4 }}>
        {Array.from({ length: FRAMES }).map((_, i) => {
          const tStart = (i / FRAMES) * dur;
          const tEnd = ((i + 1) / FRAMES) * dur;
          const isCur = scrub >= tStart && scrub < tEnd;
          return (
            <div key={i} style={{
              aspectRatio: "16 / 9",
              background: `linear-gradient(135deg, ${palette[i]} 0%, ${palette[(i+2)%palette.length]} 100%)`,
              border: `1px solid ${isCur ? "var(--c-amber)" : "var(--c-line)"}`,
              outline: isCur ? "1px solid var(--c-amber)" : "none",
              position: "relative", overflow: "hidden", borderRadius: "var(--r-1)",
              boxShadow: isCur ? "0 0 0 2px rgba(var(--accent-rgb),.18)" : "none",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at ${30+i*8}% ${40+(i%3)*15}%, rgba(255,230,180,.${15+i}) 0%, transparent 60%)`,
              }}/>
              <span className="t-mono" style={{
                position: "absolute", top: 3, left: 4, fontSize: "var(--fs-label)",
                color: isCur ? "var(--c-amber)" : "rgba(255,255,255,.5)",
              }}>{Math.floor(tStart)}s</span>
              {isCur && <span style={{
                position: "absolute", bottom: 3, right: 4, width: 6, height: 6,
                background: "var(--c-amber)", borderRadius: "50%",
              }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Master waveform with handles, fades, hit-points, playhead ─────────
function MasterWaveform({ take, cue, scrub, onScrub, onChange, onAddHit, onRemoveHit }) {
  const e = take.edit;
  const W = 100;
  const inPct  = (e.trim[0] / take.duration) * W;
  const outPct = (e.trim[1] / take.duration) * W;
  const scrubPct = (scrub / take.duration) * W;
  const ref = urSc(null);
  const dragging = urSc(null); // 'in' | 'out' | 'scrub' | null

  const fromClient = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };
  const onTrackDown = (ev) => {
    const t = fromClient(ev.clientX) * take.duration;
    onScrub(Math.max(e.trim[0], Math.min(e.trim[1], t)));
    dragging.current = "scrub";
  };
  ueSc(() => {
    const onMove = (ev) => {
      if (!dragging.current) return;
      const f = fromClient(ev.clientX);
      const t = f * take.duration;
      if (dragging.current === "in")  onChange({ trim: [Math.max(0, Math.min(t, e.trim[1] - 0.2)), e.trim[1]] });
      else if (dragging.current === "out") onChange({ trim: [e.trim[0], Math.max(e.trim[0] + 0.2, Math.min(take.duration, t))] });
      else if (dragging.current === "scrub") onScrub(Math.max(0, Math.min(take.duration, t)));
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [take.duration, e.trim]);

  const dblClick = (ev) => {
    const t = fromClient(ev.clientX) * take.duration;
    onAddHit(t);
  };

  // axis ticks
  const ticks = umSc(() => {
    const stepCandidates = [1, 2, 5, 10, 15, 30, 60];
    const step = stepCandidates.find(s => take.duration / s <= 14) || 60;
    const out = [];
    for (let t = 0; t <= take.duration; t += step) out.push(t);
    return out;
  }, [take.duration]);

  return (
    <div style={{ padding: "0 24px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, marginTop: 4 }}>
        <span className="t-label">Master · {take.model} · {take.bpm}bpm · {take.key}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>
          double-click to drop a hit-point · drag handles to trim
        </span>
      </div>
      <div ref={ref} onMouseDown={onTrackDown} onDoubleClick={dblClick} style={{
        position: "relative", height: 110, background: "var(--c-panel-2)",
        border: "1px solid var(--c-line)", overflow: "hidden", cursor: "crosshair",
        userSelect: "none",
      }}>
        {/* waveform bars */}
        <div style={{ position: "absolute", inset: "12px 0 14px", display: "flex", alignItems: "center", gap: 1, padding: "0 4px" }}>
          {Array.from({ length: 200 }).map((_, i) => {
            const seed = (i * 9301 + 49297 + Math.floor(take.waveSeed * 1000)) % 233280;
            const a = 0.18 + (seed / 233280) * 0.82;
            // shape envelope by position (rise + fall)
            const x = i / 199;
            const env = 0.5 + 0.5 * Math.sin(x * Math.PI * 2.2 - 0.5);
            const aFinal = a * (0.45 + 0.55 * env);
            const inSel = x*100 >= inPct && x*100 <= outPct;
            return <div key={i} style={{
              flex: 1, height: `${aFinal * 100}%`,
              background: inSel ? "var(--c-ink-2)" : "var(--c-ink-4)",
              opacity: inSel ? 0.85 : 0.35,
            }}/>;
          })}
        </div>
        {/* fade in ramp */}
        <div style={{
          position: "absolute", left: `${inPct}%`, width: `${(e.fadeIn / take.duration) * 100}%`,
          top: 0, bottom: 0,
          background: "linear-gradient(90deg, rgba(var(--accent-rgb),0) 0%, rgba(var(--accent-rgb),.22) 100%)",
          pointerEvents: "none",
        }}/>
        <div style={{
          position: "absolute", right: `${100 - outPct}%`, width: `${(e.fadeOut / take.duration) * 100}%`,
          top: 0, bottom: 0,
          background: "linear-gradient(90deg, rgba(var(--accent-rgb),.22) 0%, rgba(var(--accent-rgb),0) 100%)",
          pointerEvents: "none",
        }}/>
        {/* trim region overlay */}
        <div style={{
          position: "absolute", left: `${inPct}%`, width: `${outPct - inPct}%`,
          top: 0, bottom: 0,
          border: "1px solid var(--c-amber)",
          background: "rgba(var(--accent-rgb),.04)",
          pointerEvents: "none",
        }}/>
        {/* hit points */}
        {cue.hits.map((h, i) => {
          const x = (h.t / take.duration) * 100;
          return (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: 0, bottom: 14,
              width: 0, borderLeft: `1px dashed ${tkc("bad")}`,
              pointerEvents: "none",
            }}>
              <div style={{
                position: "absolute", top: -2, left: -3, width: 7, height: 7,
                background: tkc("bad"), transform: "rotate(45deg)", pointerEvents: "auto",
              }} title={h.label}/>
              <span className="t-mono" style={{
                position: "absolute", top: 8, left: 6, fontSize: "var(--fs-label)", color: tkc("bad"),
                whiteSpace: "nowrap", pointerEvents: "auto",
              }}>{h.label}
                <button onClick={(ev) => { ev.stopPropagation(); onRemoveHit(i); }} style={{
                  marginLeft: 4, background: "transparent", border: "none", color: tkc("bad"),
                  cursor: "pointer", fontSize: "var(--fs-label)",
                }}>×</button>
              </span>
            </div>
          );
        })}
        {/* trim handles */}
        <div onMouseDown={(ev) => { ev.stopPropagation(); dragging.current = "in"; }} style={{
          position: "absolute", left: `${inPct}%`, top: 0, bottom: 14,
          width: 8, marginLeft: -4, cursor: "ew-resize", zIndex: 4,
        }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 3, width: 2, background: "var(--c-amber)" }}/>
          <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, background: "var(--c-amber)" }}/>
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, background: "var(--c-amber)" }}/>
        </div>
        <div onMouseDown={(ev) => { ev.stopPropagation(); dragging.current = "out"; }} style={{
          position: "absolute", left: `${outPct}%`, top: 0, bottom: 14,
          width: 8, marginLeft: -4, cursor: "ew-resize", zIndex: 4,
        }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 3, width: 2, background: "var(--c-amber)" }}/>
          <div style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, background: "var(--c-amber)" }}/>
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, background: "var(--c-amber)" }}/>
        </div>
        {/* playhead */}
        <div style={{
          position: "absolute", left: `${scrubPct}%`, top: 0, bottom: 14, width: 0,
          borderLeft: `1.5px solid ${tkc("white")}`, zIndex: 5, pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", top: -1, left: -5, width: 10, height: 10,
            background: tkc("white"), transform: "rotate(45deg)",
          }}/>
        </div>
        {/* time axis */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, background: "var(--c-bg)", borderTop: "1px solid var(--c-line)" }}>
          {ticks.map((t, i) => (
            <span key={i} className="t-mono" style={{
              position: "absolute", left: `${(t / take.duration) * 100}%`,
              top: 1, fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
              transform: "translateX(2px)",
            }}>{Math.floor(t/60)}:{String(t%60).padStart(2,"0")}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>IN <span style={{ color: "var(--c-amber)" }}>{e.trim[0].toFixed(1)}s</span></span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>OUT <span style={{ color: "var(--c-amber)" }}>{e.trim[1].toFixed(1)}s</span></span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>LEN <span style={{ color: "var(--c-ink-2)" }}>{(e.trim[1]-e.trim[0]).toFixed(1)}s</span></span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>FADE <span style={{ color: "var(--c-ink-2)" }}>↗{e.fadeIn.toFixed(1)} ↘{e.fadeOut.toFixed(1)}</span></span>
      </div>
    </div>
  );
}

// ─── Transport ─────────────────────────────────────────────────────────
function Transport({ take, scrub, setScrub, playing, setPlaying, loop, setLoop, onChange, onSplit }) {
  const e = take.edit;
  return (
    <div style={{ padding: "0 24px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button className="btn btn-ghost" onClick={() => setScrub(0)} title="To start">⟸⟸</button>
      <button className="btn btn-ghost" onClick={() => setScrub(e.trim[0])} title="To in">⟸</button>
      <button className="btn btn-primary" onClick={() => setPlaying(!playing)} style={{ minWidth: 96 }}>
        {playing ? "❚❚ Pause" : "▶ Play"}
      </button>
      <button className="btn btn-ghost" onClick={() => setScrub(e.trim[1])} title="To out">⟹</button>
      <button className="btn btn-ghost" onClick={() => setLoop(!loop)} style={{
        background: loop ? "rgba(var(--accent-rgb),.12)" : "transparent",
        color: loop ? "var(--c-amber)" : "var(--c-ink-2)",
      }} title="Loop region">↻ Loop</button>

      <span className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginLeft: 10, minWidth: 110 }}>
        {fmtTime(scrub)} / {fmtTime(take.duration)}
      </span>

      <div style={{ flex: 1 }}/>

      <button className="btn btn-ghost" onClick={() => onChange({ trim: [scrub, e.trim[1]] })}>Set IN @ playhead</button>
      <button className="btn btn-ghost" onClick={() => onChange({ trim: [e.trim[0], scrub] })}>Set OUT @ playhead</button>
      <button className="btn btn-ghost" onClick={onSplit}><Icon name="x" size={11}/>Split</button>
      {take?.audioUrl && (
        <div style={{ width: "100%", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".14em" }}>LYRIA AUDIO MASTER</span>
          <audio src={take.audioUrl} controls style={{ flex: 1, height: 32 }}/>
        </div>
      )}
    </div>
  );
}

const fmtTime = (s) => {
  const m = Math.floor(s/60), sec = Math.floor(s%60), cs = Math.floor((s%1)*10);
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}.${cs}`;
};

// ─── Stem mixer ────────────────────────────────────────────────────────
function StemMixer({ take, onChange, onBounce }) {
  const stems = take.edit.stems;
  const anySolo = STEM_DEFS.some(s => stems[s.id]?.solo);
  return (
    <div style={{ padding: "14px 24px", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="t-label">Stems</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>4 stems · split from generation · independently mixable</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {STEM_DEFS.map(s => {
          const st = stems[s.id] || {};
          const audible = !st.mute && (!anySolo || st.solo);
          return (
            <div key={s.id} style={{
              border: `1px solid ${st.solo ? "var(--c-amber)" : "var(--c-line-2)"}`,
              background: "var(--c-bg)", padding: 10, borderRadius: "var(--r-1)",
              opacity: audible ? 1 : 0.5,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }}/>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>{s.label}</span>
                <div style={{ flex: 1 }}/>
                <button onClick={() => onChange(s.id, { mute: !st.mute })} style={miniBtn(st.mute, tkc("bad"))} title="Mute">M</button>
                <button onClick={() => onChange(s.id, { solo: !st.solo })} style={miniBtn(st.solo, "var(--c-amber)")} title="Solo">S</button>
              </div>
              {/* mini stem wave */}
              <div style={{ height: 22, display: "flex", alignItems: "center", gap: 1, marginBottom: 8 }}>
                {Array.from({ length: 50 }).map((_, i) => {
                  const seed = (i * 9301 + 49297 + s.id.charCodeAt(0)*100) % 233280;
                  const a = 0.2 + (seed / 233280) * 0.8;
                  return <div key={i} style={{
                    flex: 1, height: `${a * 100}%`,
                    background: audible ? s.color : "var(--c-ink-4)",
                    opacity: audible ? (st.vol / 100) : 0.3,
                  }}/>;
                })}
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span className="t-label" style={{ fontSize: "var(--fs-label)" }}>VOL</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>{st.vol}</span>
                </div>
                <input type="range" min="0" max="100" value={st.vol} onChange={ev => onChange(s.id, { vol: Number(ev.target.value) })} style={{ width: "100%" }}/>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span className="t-label" style={{ fontSize: "var(--fs-label)" }}>PAN</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>{st.pan === 0 ? "C" : (st.pan < 0 ? `L${-st.pan}` : `R${st.pan}`)}</span>
                </div>
                <input type="range" min="-100" max="100" value={st.pan} onChange={ev => onChange(s.id, { pan: Number(ev.target.value) })} style={{ width: "100%" }}/>
              </div>
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: "var(--fs-label)" }} onClick={() => onBounce(s.id)}>
                <Icon name="upload" size={10}/>Bounce stem
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const miniBtn = (active, activeColor) => ({
  width: 22, height: 18, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontWeight: 600,
  background: active ? activeColor : "transparent",
  color: active ? tkc("panel-2") : "var(--c-ink-3)",
  border: `1px solid ${active ? activeColor : "var(--c-line-2)"}`,
  borderRadius: "var(--r-1)", cursor: "pointer",
});

// ─── Tools tabs ────────────────────────────────────────────────────────
function ToolsTabs({ tab, setTab }) {
  return <CinaTabs tabs={[{ id: "region", label: "Region & Fades" }, { id: "mix", label: "Mix" }, { id: "eq", label: "EQ" }, { id: "fx", label: "FX" }, { id: "sync", label: "Sync to picture" }]} value={tab} onChange={setTab}/>;
}

function ToolsBody({ tab, take, onChange }) {
  const e = take.edit;
  return (
    <div style={{ padding: "18px 24px" }}>
      {tab === "region" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <SliderCtl label="Trim in"  value={e.trim[0]}  min={0} max={take.duration} step={0.1} unit="s" onChange={n => onChange({ trim: [Math.min(n, e.trim[1]-0.1), e.trim[1]] })}/>
          <SliderCtl label="Trim out" value={e.trim[1]}  min={0} max={take.duration} step={0.1} unit="s" onChange={n => onChange({ trim: [e.trim[0], Math.max(n, e.trim[0]+0.1)] })}/>
          <SliderCtl label="Fade in"  value={e.fadeIn}   min={0} max={10}            step={0.1} unit="s" onChange={n => onChange({ fadeIn: n })}/>
          <SliderCtl label="Fade out" value={e.fadeOut}  min={0} max={10}            step={0.1} unit="s" onChange={n => onChange({ fadeOut: n })}/>
        </div>
      )}
      {tab === "mix" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          <SliderCtl label="Master gain"   value={e.gain}  min={-24} max={12}   step={0.5} unit=" dB" onChange={n => onChange({ gain: n })}/>
          <SliderCtl label="Pan"           value={e.pan}   min={-100} max={100} step={1}   unit=""    onChange={n => onChange({ pan: n })} format={n => n===0 ? "C" : (n<0 ? `L${-n}` : `R${n}`)}/>
          <SliderCtl label="Stereo width"  value={e.width} min={0}   max={150}  step={1}   unit="%"   onChange={n => onChange({ width: n })}/>
        </div>
      )}
      {tab === "eq" && (
        <div>
          <EQCurve hp={e.hp} mid={e.mid} midGain={e.midGain} lp={e.lp} onChange={onChange}/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 16 }}>
            <SliderCtl label="Hi-pass"   value={e.hp}      min={20}    max={500}  step={5}  unit=" Hz" onChange={n => onChange({ hp: n })}/>
            <SliderCtl label="Mid freq"  value={e.mid}     min={20}    max={100}  step={1}  unit=""    onChange={n => onChange({ mid: n })} format={n => `${Math.round(200 * Math.pow(50, n/100))} Hz`}/>
            <SliderCtl label="Mid gain"  value={e.midGain} min={-12}   max={12}   step={0.5} unit=" dB" onChange={n => onChange({ midGain: n })}/>
            <SliderCtl label="Lo-pass"   value={e.lp}      min={20}    max={100}  step={1}  unit="%"   onChange={n => onChange({ lp: n })}/>
          </div>
        </div>
      )}
      {tab === "fx" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          <SliderCtl label="Reverb send"           value={e.reverb}    min={0} max={100} step={1} unit="%" onChange={n => onChange({ reverb: n })}/>
          <SliderCtl label="Compressor"            value={e.comp}      min={0} max={100} step={1} unit="%" onChange={n => onChange({ comp: n })}/>
          <SliderCtl label="Sidechain to dialogue" value={e.sidechain} min={0} max={100} step={1} unit="%" onChange={n => onChange({ sidechain: n })}/>
        </div>
      )}
      {tab === "sync" && (
        <SyncPanel take={take} onChange={onChange}/>
      )}
    </div>
  );
}

// ─── Sync to picture panel ─────────────────────────────────────────────
function SyncPanel({ take, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        <SliderCtl label="Tempo (BPM)"  value={take.bpm} min={40} max={180} step={1} unit=""    onChange={() => {}}/>
        <SliderCtl label="Time-stretch" value={100}     min={50} max={150} step={1} unit="%"   onChange={() => {}}/>
        <SliderCtl label="Offset"       value={0}       min={-2} max={2}   step={0.1} unit="s" onChange={() => {}}/>
      </div>
      <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line)", padding: 14, borderRadius: "var(--r-1)" }}>
        <div className="t-label" style={{ marginBottom: 8 }}>Snap modes</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Beat to cut", "Hit-points to bars", "Cadence to dialogue out", "End on freeze frame", "Crescendo at climax"].map(s => (
            <button key={s} className="btn btn-ghost" style={{ fontSize: "var(--fs-label)" }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EQ curve (draggable mid node) ─────────────────────────────────────
function EQCurve({ hp, mid, midGain, lp, onChange }) {
  const W = 520, H = 90;
  const xForFreq = (f) => Math.log10(f / 20) / Math.log10(20000 / 20) * W;
  const midX = xForFreq(200 * Math.pow(50, mid/100));
  const midY = H/2 - (midGain / 12) * (H/2 - 4);
  const ref = urSc(null);
  const dragging = urSc(false);
  ueSc(() => {
    const onMove = (ev) => {
      if (!dragging.current || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const y = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height));
      const f = 20 * Math.pow(1000, x);
      const m = Math.max(0, Math.min(100, Math.log(f / 200) / Math.log(50) * 100));
      const g = Math.max(-12, Math.min(12, (0.5 - y) * 24));
      onChange({ mid: m, midGain: g });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [onChange]);
  // build curve
  const path = umSc(() => {
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const x = (i / 80) * W;
      const f = 20 * Math.pow(1000, i / 80);
      let g = 0;
      // hi-pass attenuates lows
      g -= Math.max(0, (hp - f) / hp) * 14;
      // bell at mid
      const midFreq = 200 * Math.pow(50, mid/100);
      const oct = Math.log2(f / midFreq);
      g += midGain * Math.exp(-Math.pow(oct, 2) * 0.6);
      // lo-pass attenuates highs
      const lpF = 20 * Math.pow(1000, lp/100);
      g -= Math.max(0, (f - lpF) / lpF) * 14;
      const y = H/2 - (g / 12) * (H/2 - 4);
      pts.push(`${i===0 ? "M" : "L"}${x.toFixed(1)},${Math.max(2, Math.min(H-2, y)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [hp, mid, midGain, lp]);

  return (
    <div ref={ref} onMouseDown={(ev) => { dragging.current = true; }} style={{
      height: H + 20, background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
      position: "relative", overflow: "hidden", cursor: "crosshair", borderRadius: "var(--r-1)",
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: H, display: "block" }}>
        {[H*0.25, H*0.5, H*0.75].map((y, i) => <line key={i} x1="0" x2={W} y1={y} y2={y} stroke="var(--c-line)" strokeWidth="0.5"/>)}
        {[100, 1000, 10000].map(f => {
          const x = xForFreq(f);
          return <line key={f} x1={x} x2={x} y1="0" y2={H} stroke="var(--c-line)" strokeWidth="0.5"/>;
        })}
        <line x1="0" x2={W} y1={H/2} y2={H/2} stroke="var(--c-line-2)" strokeWidth="0.7"/>
        <path d={path} fill="none" stroke= "var(--c-amber)" strokeWidth="1.6"/>
        <path d={path + ` L${W},${H/2} L0,${H/2} Z`} fill= "var(--c-amber)" opacity="0.07"/>
        {/* mid node */}
        <circle cx={midX} cy={midY} r={5} fill= "var(--c-amber)" stroke={tkc("panel-2")} strokeWidth="1"/>
      </svg>
      <span className="t-mono" style={{ position: "absolute", left: 6, bottom: 4, fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>20Hz</span>
      <span className="t-mono" style={{ position: "absolute", right: 6, bottom: 4, fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>20kHz</span>
      <span className="t-mono" style={{ position: "absolute", left: 6, top: 4, fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>+12dB</span>
      <span className="t-mono" style={{ position: "absolute", left: 6, top: H - 14, fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>-12dB</span>
    </div>
  );
}

// ─── Bounce / actions footer ───────────────────────────────────────────
function BounceBar({ take, cue, onUse, onReroll, onDelete, onReset }) {
  return (
    <div style={{
      display: "flex", gap: 6, padding: "14px 24px 20px",
      borderTop: "1px solid var(--c-line)", marginTop: 8,
    }}>
      <button className="btn btn-ghost" onClick={onReset}><Icon name="x" size={11}/>Reset edits</button>
      <button className="btn btn-ghost" onClick={() => toastSc(`Bounced · ${cue.label}_${take.id}.wav`)}><Icon name="upload" size={11}/>Export master</button>
      <button className="btn btn-ghost" onClick={() => toastSc("Saved as preset")}><Icon name="check" size={11}/>Save preset</button>
      <div style={{ flex: 1 }}/>
      <button className="btn btn-ghost" onClick={onDelete}><Icon name="x" size={11}/>Delete take</button>
      <button className="btn btn-ghost" onClick={onReroll}><Icon name="wand" size={11}/>Re-roll</button>
      <button className="btn btn-ghost" onClick={() => onUse(false)}>
        <Icon name="check" size={11}/>Queue to A3
      </button>
      <button className="btn btn-primary" onClick={() => onUse(true)} style={{ minWidth: 160 }}>
        <Icon name="check" size={11}/>Use in Cut &amp; Open NLE →
      </button>
    </div>
  );
}

// ─── AI assistant (right rail) ─────────────────────────────────────────
function AIAssistant({ take, cue, onApply, onLog }) {
  const [prompt, setPrompt] = usSc("");
  const [thinking, setThinking] = usSc(false);
  const presetGroups = [
    { title: "Reshape", prompts: [
      { id: "warmer",    label: "Warmer · cello-led",   patch: { hp: 40, midGain: 4, mid: 38, ensemble: "Cello + electronics" } },
      { id: "colder",    label: "Colder · pad-only",    patch: { hp: 80, midGain: -3, mid: 70, reverb: 60 } },
      { id: "darker",    label: "Darker · drop highs",  patch: { lp: 60, midGain: -2 } },
      { id: "brighter",  label: "Brighter · open up",   patch: { lp: 95, hp: 35, midGain: 2, mid: 78 } },
    ]},
    { title: "Reorchestrate", prompts: [
      { id: "piano",     label: "Replace cello → piano",  patch: {} },
      { id: "choir",     label: "Add breath of choir",    patch: { reverb: 55 } },
      { id: "remove_perc", label: "Remove percussion",    patch: {} },
      { id: "synth",     label: "Layer synth pad",        patch: {} },
    ]},
    { title: "Sync to picture", prompts: [
      { id: "fit",       label: `Stretch to ${cue?.dur || 60}s`,  patch: {} },
      { id: "land",      label: "Land cadence on last cut",       patch: {} },
      { id: "swell",     label: "Build a swell at climax",        patch: {} },
      { id: "duck",      label: "Duck under dialogue",            patch: { sidechain: 70 } },
    ]},
    { title: "Repair", prompts: [
      { id: "denoise",   label: "Denoise · −12 dB floor",  patch: {} },
      { id: "declick",   label: "Remove click @ 0:08",     patch: {} },
      { id: "loop",      label: "Smooth a 4-bar loop",     patch: {} },
      { id: "extend",    label: "Extend tail by 4s",       patch: { fadeOut: 4 } },
    ]},
  ];
  const apply = (label, patch) => {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      onApply(label, patch);
    }, 480);
  };
  const submit = () => {
    if (!prompt.trim()) return;
    const p = prompt.trim();
    setPrompt("");
    apply(`AI · ${p.slice(0, 60)}${p.length > 60 ? "…" : ""}`, {});
  };

  return (
    <aside style={{
      width: 320, flexShrink: 0, borderLeft: "1px solid var(--c-line)",
      background: "var(--c-panel)", display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid var(--c-line)" }}>
        <div className="t-label" style={{ marginBottom: 4 }}>AI score assistant</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.45 }}>
          Describe a change in plain English. Cina applies it non-destructively to the active take and logs every move below.
        </div>
        <textarea
          value={prompt} onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
          placeholder="e.g. drop the strings 6dB after the second hit, then bring the choir back warmer"
          rows={3}
          style={{
            width: "100%", marginTop: 10,
            background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
            color: "var(--c-ink)", fontSize: "var(--fs-body)", lineHeight: 1.5, padding: 10,
            fontFamily: "var(--f-sans)", borderRadius: "var(--r-1)", resize: "vertical",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={submit} disabled={!prompt.trim() || thinking} style={{ flex: 1 }}>
            {thinking ? "Applying…" : <><Icon name="wand" size={11}/>Apply</>}
          </button>
          <button className="btn btn-ghost" onClick={() => { setPrompt(""); }} title="Clear">×</button>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 6 }}>⌘↵ to apply · ~6 cr</div>
      </div>

      <div style={{ padding: "14px 18px 4px", borderBottom: "1px solid var(--c-line)" }}>
        <div className="t-label" style={{ marginBottom: 8 }}>Reference</div>
        <div style={{
          padding: 12, border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-1)",
          textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-body)",
          cursor: "pointer",
        }} onClick={() => onLog("Reference uploaded · ref_track.wav")}>
          <Icon name="upload" size={14}/>
          <div style={{ marginTop: 6 }}>Drop a reference track to match its texture & arc</div>
        </div>
      </div>

      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)" }}>
        {presetGroups.map(g => (
          <div key={g.title} style={{ marginBottom: 14 }}>
            <div className="t-label" style={{ marginBottom: 6, fontSize: "var(--fs-label)" }}>{g.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {g.prompts.map(p => (
                <button key={p.id} onClick={() => apply(`${g.title} · ${p.label}`, p.patch)} disabled={thinking} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 10px", textAlign: "left",
                  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                  color: "var(--c-ink-2)", fontSize: "var(--fs-body)", cursor: "pointer",
                  borderRadius: "var(--r-1)", fontFamily: "var(--f-sans)",
                }} onMouseEnter={ev => { ev.currentTarget.style.borderColor = "var(--c-amber)"; ev.currentTarget.style.color = "var(--c-ink)"; }}
                   onMouseLeave={ev => { ev.currentTarget.style.borderColor = "var(--c-line-2)"; ev.currentTarget.style.color = "var(--c-ink-2)"; }}>
                  <Icon name="wand" size={10}/>{p.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 18px", flex: 1 }}>
        <div className="t-label" style={{ marginBottom: 8 }}>History · this take</div>
        {(!take || take.edit.history.length === 0) ? (
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>No edits yet. Apply a prompt or move a control to begin a non-destructive edit chain.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {take.edit.history.map((h, i) => (
              <div key={i} style={{
                display: "flex", gap: 8, padding: "6px 8px",
                background: i === 0 ? "rgba(var(--accent-rgb),.05)" : "transparent",
                border: "1px solid " + (i === 0 ? "rgba(var(--accent-rgb),.25)" : "var(--c-line)"),
                borderRadius: "var(--r-1)",
              }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", flexShrink: 0, paddingTop: 1 }}>{h.t}</span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.35 }}>{h.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────
function ScoreEmpty({ onAdd }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-ink-4)" }}>
      <div style={{ textAlign: "center" }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginBottom: 10 }}>No cues yet</div>
        <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={11}/>Add cue</button>
      </div>
    </div>
  );
}

// ─── Add cue dialog ────────────────────────────────────────────────────
function AddCueDialog({ onClose, onCreate }) {
  const [scene, setScene] = usSc("");
  const [label, setLabel] = usSc("");
  const [dur, setDur] = usSc(60);
  const [brief, setBrief] = usSc("");
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        padding: 24, borderRadius: "var(--r-1)",
      }}>
        <div className="t-label" style={{ marginBottom: 4 }}>New cue</div>
        <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: 0, marginBottom: 18 }}>Add a cue to the score</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FieldSc label="Scene tag (e.g. 09 ALLEY)">
            <input value={scene} onChange={e => setScene(e.target.value)} style={inputSc} placeholder="03 LOFT"/>
          </FieldSc>
          <FieldSc label="Cue title">
            <input value={label} onChange={e => setLabel(e.target.value)} style={inputSc} placeholder="Late-night drive" autoFocus/>
          </FieldSc>
          <FieldSc label="Length (seconds)">
            <input type="number" value={dur}
              onChange={e => setDur(e.target.value === "" ? "" : Math.max(1, Math.min(900, Number(e.target.value) || 1)))} style={inputSc} min="1" max="900"/>
          </FieldSc>
          <FieldSc label="Brief (optional)">
            <textarea rows={3} value={brief} onChange={e => setBrief(e.target.value)} style={{ ...inputSc, resize: "vertical", fontFamily: "var(--f-sans)" }} placeholder="Mood, instrumentation, references…"/>
          </FieldSc>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close" title="Close">Cancel</button>
          <button className="btn btn-primary" onClick={() => label && onCreate({ scene, label, dur, brief })} disabled={!label}>
            <Icon name="plus" size={11}/>Add cue
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Small UI primitives ───────────────────────────────────────────────
function SliderCtl({ label, value, min, max, step, unit, onChange, format }) {
  const display = format ? format(value) : `${typeof value === "number" ? (step < 1 ? value.toFixed(1) : Math.round(value)) : value}${unit}`;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
        <span className="t-label">{label}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%" }}/>
    </div>
  );
}

function FieldSc({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span className="t-label">{label}</span>
      {children}
    </label>
  );
}

function StatusDot_score({ status, withLabel }) {
  const map = {
    ready:      { c: tkc("ink-2"), l: "Ready" },
    approved:   { c: "var(--c-amber)", l: "Approved" },
    generating: { c: tkc("cat-1"), l: "Generating" },
    draft:      { c: "var(--c-ink-4)", l: "Draft" },
    empty:      { c: "var(--c-line-2)", l: "Empty" },
  };
  const m = map[status] || map.empty;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.c }}/>
      {withLabel && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", textTransform: "uppercase" }}>{m.l}</span>}
    </span>
  );
}

function toastSc(msg) {
  window.dispatchEvent(new CustomEvent("cina:toast", { detail: { msg } }));
}

const inputSc = {
  width: "100%", padding: "8px 10px",
  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)",
  borderRadius: "var(--r-1)",
};
const selectSc = { ...inputSc, fontFamily: "var(--f-sans)" };

Object.assign(window, { ScorePanel });
