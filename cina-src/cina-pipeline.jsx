// cina-pipeline.jsx — the connective spine for the whole studio.
//
// ONE source of truth for a film's production: DNA → Script → Cast →
// Stills → Motion → Voice → Wardrobe → Board → Render → Cut. Every asset
// carries PROVENANCE (what it came from), so the flow is traceable end to
// end and nothing is ever regenerated from scratch — a motion clip remembers
// the still it animated, which remembers the performer, which remembers the
// DNA tone.
//
// Exposed on window:
//   CinaProject — { get, patch, subscribe, addAsset, handoff, takeInbound,
//                   lineage, assetsForStep, STEPS, viewForStep }
//   useProject() — React hook returning the live project
//   <Lineage assetId/> — breadcrumb of where an asset came from
//   <HandoffBar asset/> — "send forward" buttons that actually move it on
//
// Loaded BEFORE cina-flow.jsx, AFTER React.

(function () {
  const LS = "cina:pipeline-v1";
  const uid = (p) => (p || "a") + Math.random().toString(36).slice(2, 8);

  // ─── The ordered pipeline + where each step's real tool lives ─────────────
  const STEPS = [
    { id: "dna",     label: "DNA",     view: "bible",    icon: "❖", blurb: "Tone, rules, palette — the law every step obeys." },
    { id: "script",  label: "Script",  view: "script",   icon: "✎", blurb: "Beats and scenes, grown from the DNA." },
    { id: "cast",    label: "Cast",    view: "vault",    icon: "☉", blurb: "Performers born for the roles in the script." },
    { id: "stills",  label: "Stills",  view: "vault",    icon: "▦", blurb: "Photoreal frames of a locked performer." },
    { id: "motion",  label: "Motion",  view: "vault",    icon: "▶", blurb: "Moving takes, animated FROM the chosen stills." },
    { id: "voice",   label: "Voice",   view: "vault",    icon: "♫", blurb: "A trained voice, reading the script's lines." },
    { id: "board",   label: "Board",   view: "board",    icon: "▤", blurb: "Shots, each filled by a performer + still." },
    { id: "render",  label: "Render",  view: "generate", icon: "✦", blurb: "Final shots, generated from board + motion." },
    { id: "cut",     label: "Cut",     view: "editor",   icon: "✂", blurb: "The edit, assembled from approved renders." },
  ];
  const stepIndex = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));
  const viewForStep = (id) => (STEPS.find(s => s.id === id) || {}).view || "pipeline";

  // ─── Seed: LAST LIGHT, fully wired with provenance ────────────────────────
  function seed() {
    // DNA
    const dna = {
      tone: "Cold, deliberate, claustrophobic. Long silences. Cigarette smoke under sodium light.",
      genres: ["Neo-noir", "Psychological thriller"],
      palette: [tkc("blood"), "var(--c-amber)", tkc("cat-6"), tkc("panel-3"), tkc("ink")],
      rules: [
        "No handheld. Camera is on sticks or a dolly. Always.",
        "Practical light only. If a source isn't in frame or motivated, it doesn't exist.",
        "No score during dialogue. Diegetic sound only between speakers.",
        "Faces are lit from one side. The other side is gone.",
        "Red appears exactly seven times in the film.",
      ],
    };
    // Script — beats → scenes
    const beats = [
      { id: "b1", act: "I",   kind: "ESTABLISH", title: "The storm warning", summary: "Radio. Voss prepares: shutters, water, the cellar." },
      { id: "b2", act: "II",  kind: "MIDPOINT",  title: "The shared silence", summary: "They don't talk for a day. Mira knows where the salt is kept." },
      { id: "b3", act: "II",  kind: "TICKING",   title: "The lamp flickers",  summary: "Voss notices the lamp is dimmer. She doesn't tell Mira." },
      { id: "b4", act: "III", kind: "CLIMAX",    title: "The lamp dies",      summary: "Voss must choose: burn the last thing, or let the sea take it." },
    ];
    const scenes = [
      { id: "sc12", slug: "INT. VOSS'S APARTMENT — NIGHT", summary: "Voss places a film canister on the desk. Doesn't turn the lights on.", from: ["b1"] },
      { id: "sc14", slug: "INT. APARTMENT — DARKROOM — CONT", summary: "The safelight wash. Voss reaches for the developer tray.", from: ["b2", "b3"] },
      { id: "sc21", slug: "EXT. LIGHTHOUSE — STORM — NIGHT", summary: "The lamp dies. The choice.", from: ["b4"] },
    ];
    // Performers — each with stills → motion → voice, all provenance-linked
    const voss = perf("Elias Voss", "Protagonist", "p1-voss", dna, {
      identityHash: "0xLORA-VOSS", locked: true,
      stillSeeds: [1000, 1137, 1274, 1411], motionFromStill: 1411,
      voiceLines: ["I don't know why you're here.", "There's tea. If you want it."],
    });
    const mira = perf("Maren Kell", "The Witness", "p1-mira", dna, {
      identityHash: "0xLORA-MIRA", locked: true,
      stillSeeds: [1685, 1822, 1959], motionFromStill: 1822,
      voiceLines: ["I came back for you."],
    });

    return {
      meta: { id: "p1", title: "LAST LIGHT", code: "LL-01", kind: "film", version: "0.7" },
      dna, script: { logline: "A retired forensic photographer is hired to authenticate a single roll of film — and discovers it documents a murder that hasn't happened yet.", beats, scenes },
      performers: [voss, mira],
      board: [
        { id: "sh14e", scene: "sc14", label: "14E · ECU · the tray", from: ["sc14", voss.stills[3].id], status: "boarded" },
        { id: "sh21a", scene: "sc21", label: "21A · WIDE · the lamp", from: ["sc21"], status: "boarded" },
      ],
      renders: [
        { id: "rn14e", shot: "sh14e", label: "14E · take 3", from: ["sh14e", voss.motion[0].id], status: "approved" },
      ],
      cut: { length: "00:14:22", from: ["rn14e"], sequences: 2 },
      inbound: {}, // pending pre-fills, keyed by step
    };
  }

  function perf(name, role, id, dna, cfg) {
    const stills = cfg.stillSeeds.map(seed => ({
      id: "st" + id + seed, kind: "still", seed, cont: 90 + (seed % 9),
      label: "SEED " + seed, from: [id + ":identity"], step: "stills",
    }));
    const animatedStill = stills.find(s => s.seed === cfg.motionFromStill) || stills[0];
    const motion = [{
      id: "mo" + id, kind: "motion", label: "Slow push-in, rim light catches the eyes",
      dur: "0:08", cont: animatedStill.cont, from: [animatedStill.id], step: "motion",
    }];
    return {
      id, name, role,
      identity: { id: id + ":identity", hash: cfg.identityHash, locked: cfg.locked, refs: 6, from: [id + ":cast"], step: "cast" },
      stills, motion,
      voice: {
        id: "vo" + id, trained: cfg.voiceLines.length > 0, model: "v2a · cloned",
        lines: cfg.voiceLines.map((t, i) => ({ id: "vl" + id + i, text: t, from: [id], step: "voice" })),
        from: [id], step: "voice",
      },
      wardrobe: [],
    };
  }

  // ─── Store ────────────────────────────────────────────────────────────────
  let state = load();
  const subs = new Set();
  function load() { try { const v = JSON.parse(localStorage.getItem(LS) || "null"); if (v && v.meta) return v; } catch {} return seed(); }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch {} }
  function emit() { save(); subs.forEach(fn => { try { fn(state); } catch (e) {} }); }

  // Flatten every asset across the project, with its step, for lookup/lineage.
  function allAssets() {
    const out = {};
    const add = (a) => { if (a && a.id) out[a.id] = a; };
    state.dna.rules.forEach((r, i) => add({ id: "dna:rule" + i, kind: "rule", label: r, step: "dna", from: [] }));
    add({ id: "dna:tone", kind: "tone", label: state.dna.tone, step: "dna", from: [] });
    state.script.beats.forEach(b => add({ ...b, kind: "beat", step: "script", label: b.title, from: b.from || ["dna:tone"] }));
    state.script.scenes.forEach(s => add({ ...s, kind: "scene", step: "script", label: s.slug }));
    state.performers.forEach(p => {
      add({ id: p.id + ":cast", kind: "cast", label: p.name + " · " + p.role, step: "cast", from: ["dna:tone"] });
      add({ ...p.identity, kind: "identity", label: p.name + " · identity" + (p.identity.locked ? " · locked" : "") });
      p.stills.forEach(add);
      p.motion.forEach(add);
      add({ ...p.voice, kind: "voice", label: p.name + " · voice" + (p.voice.trained ? " · trained" : "") });
      p.voice.lines.forEach(ln => add({ ...ln, kind: "line", label: ln.text }));
    });
    state.board.forEach(b => add({ ...b, kind: "shot", step: "board" }));
    state.renders.forEach(r => add({ ...r, kind: "render", step: "render" }));
    return out;
  }

  function lineage(assetId) {
    const map = allAssets();
    const chain = [];
    const seen = new Set();
    let frontier = [assetId];
    while (frontier.length) {
      const next = [];
      frontier.forEach(id => {
        const a = map[id];
        if (!a || seen.has(id)) return;
        seen.add(id);
        chain.push(a);
        (a.from || []).forEach(f => next.push(f));
      });
      frontier = next;
    }
    return chain; // [self, ...ancestors]
  }

  function assetsForStep(step) {
    const map = allAssets();
    return Object.values(map).filter(a => a.step === step);
  }

  // ─── Handoff: move an asset to the next step, pre-filled ───────────────────
  // Records a pending inbound payload the target step reads on mount, navigates
  // there, and (for in-flow demo) materializes the downstream asset so the
  // chain visibly grows.
  function handoff(asset, toStep, opts) {
    opts = opts || {};
    const payload = { sourceId: asset.id, sourceLabel: asset.label || asset.name, kind: asset.kind, at: Date.now(), ...opts };
    state.inbound = { ...state.inbound, [toStep]: payload };

    // Materialize the downstream asset so the pipeline actually grows.
    if (toStep === "motion" && asset.step === "stills") {
      const perf = state.performers.find(p => p.stills.some(s => s.id === asset.id));
      if (perf) perf.motion = [...perf.motion, { id: uid("mo"), kind: "motion", label: "New take from " + asset.label, dur: "0:08", cont: asset.cont, from: [asset.id], step: "motion" }];
    } else if (toStep === "voice" && asset.step === "motion") {
      const perf = state.performers.find(p => p.motion.some(m => m.id === asset.id));
      if (perf) { perf.voice.trained = true; perf.voice.from = Array.from(new Set([...(perf.voice.from || []), asset.id])); }
    } else if (toStep === "board") {
      state.board = [...state.board, { id: uid("sh"), kind: "shot", label: "New shot · " + (asset.label || asset.name), scene: asset.scene || (state.script.scenes[0] || {}).id, from: [asset.id], step: "board", status: "boarded" }];
    } else if (toStep === "render" && asset.step === "board") {
      state.renders = [...state.renders, { id: uid("rn"), kind: "render", label: (asset.label || "shot") + " · take 1", shot: asset.id, from: [asset.id], step: "render", status: "queued" }];
    }
    emit();
    if (window.toast) window.toast({ title: "HANDED OFF", text: `${asset.label || asset.name} → ${toStep}`, kind: "good" });
    if (opts.navigate !== false) window.dispatchEvent(new CustomEvent("cina:setView", { detail: viewForStep(toStep) }));
    return payload;
  }
  function takeInbound(step) { const p = state.inbound[step]; if (p) { const n = { ...state.inbound }; delete n[step]; state.inbound = n; emit(); } return p || null; }

  // ─── Write-back API — the real editors push their work here ───────────────
  // Script's Beats stage owns the beat cards; it writes them straight into the
  // project so the Flow board's Script column reflects them live.
  function syncBeats(editorBeats) {
    if (!Array.isArray(editorBeats)) return;
    // Preserve provenance + scene links where ids match the prior beats.
    const prev = Object.fromEntries(state.script.beats.map(b => [b.id, b]));
    state.script.beats = editorBeats.map(b => {
      const old = prev[b.id] || {};
      return {
        id: b.id,
        act: b.act || old.act || "I",
        kind: (b.tag || b.kind || old.kind || "BEAT").toString().toUpperCase(),
        title: b.title || old.title || "Untitled beat",
        summary: b.body != null ? b.body : (b.summary != null ? b.summary : old.summary || ""),
        from: old.from || ["dna:tone"],
      };
    });
    // Re-link scenes whose source beats vanished, so lineage never dangles.
    const liveIds = new Set(state.script.beats.map(b => b.id));
    state.script.scenes = state.script.scenes.map(s => ({ ...s, from: (s.from || []).filter(id => liveIds.has(id)).length ? s.from : (state.script.beats[0] ? [state.script.beats[0].id] : []) }));
    emit();
  }
  // The editor inherits the project's beats on mount (so it opens pre-filled,
  // not from scratch). Returns them in the editor's own shape.
  function beatsForEditor() {
    return state.script.beats.map(b => ({ id: b.id, act: b.act, title: b.title, body: b.summary, tag: (b.kind || "").toLowerCase() }));
  }

  // Vault writes performer state back: locking identity, rendering stills, etc.
  function findPerformer(nameOrId) {
    const q = (nameOrId || "").toString().toLowerCase().trim();
    const first = q.split(/\s+/)[0];
    return state.performers.find(p => p.id === nameOrId || (p.name || "").toLowerCase() === q || (p.name || "").toLowerCase().split(/\s+/)[0] === first) || null;
  }
  function lockPerformer(nameOrId, info) {
    const p = findPerformer(nameOrId); if (!p) return false;
    p.identity = { ...p.identity, locked: true, hash: (info && info.hash) || p.identity.hash || "0xLORA-LOCKED", label: p.name + " · identity · locked" };
    if (!p.stills.length) { // a freshly-locked identity gets its first frames
      p.stills = [1, 2, 3].map((n, i) => ({ id: "st" + p.id + (1000 + i), kind: "still", seed: 1000 + i, cont: 90 + n, label: "SEED " + (1000 + i), from: [p.id + ":identity"], step: "stills" }));
    }
    emit(); return true;
  }
  function bumpStills(nameOrId, n) {
    const p = findPerformer(nameOrId); if (!p) return false;
    const base = 1000 + p.stills.length;
    for (let i = 0; i < (n || 1); i++) { const seed = base + i; p.stills.push({ id: "st" + p.id + seed, kind: "still", seed, cont: 90 + (seed % 9), label: "SEED " + seed, from: [p.id + ":identity"], step: "stills" }); }
    emit(); return true;
  }
  function addPerformer(name, role) {
    if (findPerformer(name)) return;
    const id = "p1-" + (name || "x").toLowerCase().replace(/\s+/g, "-").slice(0, 12);
    state.performers.push({ id, name, role: role || "Performer", identity: { id: id + ":identity", hash: null, locked: false, refs: 4, from: [id + ":cast"], step: "cast" }, stills: [], motion: [], voice: { id: "vo" + id, trained: false, model: "", lines: [], from: [id], step: "voice" }, wardrobe: [] });
    emit();
  }

  const CinaProject = {
    STEPS, stepIndex, viewForStep,
    get: () => state,
    patch: (fn) => { state = (typeof fn === "function" ? fn(state) : { ...state, ...fn }) || state; emit(); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
    reset: () => { state = seed(); emit(); },
    allAssets, lineage, assetsForStep, handoff, takeInbound,
    syncBeats, beatsForEditor, findPerformer, lockPerformer, bumpStills, addPerformer,
    nextStepOf: (stepId) => STEPS[Math.min(STEPS.length - 1, (stepIndex[stepId] ?? 0) + 1)],
  };
  window.CinaProject = CinaProject;

  // ─── React glue ───────────────────────────────────────────────────────────
  function useProject() {
    const [, force] = React.useReducer(x => x + 1, 0);
    React.useEffect(() => CinaProject.subscribe(() => force()), []);
    return CinaProject.get();
  }
  window.useProject = useProject;

  // ─── Lineage breadcrumb ─────────────────────────────────────────────────────
  function Lineage({ assetId, compact }) {
    const chain = CinaProject.lineage(assetId).slice().reverse(); // oldest → newest
    if (chain.length <= 1) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {chain.map((a, i) => {
          const st = STEPS.find(s => s.id === a.step);
          return (
            <React.Fragment key={a.id}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: i === chain.length - 1 ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)", border: `1px solid ${i === chain.length - 1 ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}` }}>
                <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-label)" }}>{st ? st.icon : "•"}</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: i === chain.length - 1 ? "var(--c-amber)" : "var(--c-ink-3)", whiteSpace: "nowrap", maxWidth: compact ? 90 : 160, overflow: "hidden", textOverflow: "ellipsis" }}>{String(a.label || a.name || a.text || a.kind || "asset").slice(0, compact ? 14 : 28)}</span>
              </span>
              {i < chain.length - 1 && <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>→</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  window.Lineage = Lineage;

  // ─── Handoff bar ────────────────────────────────────────────────────────────
  // The real "carry it forward" control. Shows where this asset can go next.
  function HandoffBar({ asset, onAfter }) {
    const next = CinaProject.nextStepOf(asset.step);
    const targets = [];
    if (asset.step === "stills") targets.push({ step: "motion", label: "Animate → Motion" });
    if (asset.step === "motion") targets.push({ step: "voice", label: "Add voice → Voice" }, { step: "board", label: "Place → Board" });
    if (asset.step === "cast" || asset.step === "stills") targets.push({ step: "board", label: "Send to scene → Board" });
    if (asset.step === "board") targets.push({ step: "render", label: "Render → Generate" });
    if (asset.step === "scene") targets.push({ step: "board", label: "Board this scene" });
    if (!targets.length && next && next.id !== asset.step) targets.push({ step: next.id, label: "Send → " + next.label });
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {targets.map(t => (
          <button key={t.step} onClick={() => { CinaProject.handoff(asset, t.step, { navigate: false }); onAfter && onAfter(t.step); }} style={{
            display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 13px", borderRadius: "var(--r-2)", cursor: "pointer",
            background: "rgba(var(--accent-rgb),.1)", border: "1px solid rgba(var(--accent-rgb),.4)", color:  "var(--c-amber)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600,
          }}>{t.label} →</button>
        ))}
        <button onClick={() => window.dispatchEvent(new CustomEvent("cina:setView", { detail: viewForStep(asset.step) }))} style={{
          display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 13px", borderRadius: "var(--r-2)", cursor: "pointer",
          background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em",
        }}>Open in tool ↗</button>
      </div>
    );
  }
  window.HandoffBar = HandoffBar;
})();
