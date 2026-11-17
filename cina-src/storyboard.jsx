// storyboard.jsx — AI-driven board: scenes, generation, replace, variants, sequences, history.

const { useState: useStateS, useMemo: useMemoS, useEffect: useEffectS, useRef: useRefS } = React;

const SB_SCENES = [
  { id: "sc12", number: "12", title: "Apartment, after the fight", color: tkc("ink-4") },
  { id: "sc13", number: "13", title: "Stairwell descent", color: tkc("ink-4") },
  { id: "sc14", number: "14", title: "Street, rain begins", color: tkc("ink-4") },
  { id: "sc15", number: "15", title: "Diner, last booth", color: tkc("ink-3") },
];

const STYLE_PRESETS = [
  { id: "cinema",  label: "Cinematic", hint: "35mm, soft falloff" },
  { id: "noir",    label: "Noir",      hint: "hard shadows, contrast" },
  { id: "natural", label: "Natural",   hint: "daylight, no grade" },
  { id: "dream",   label: "Dream",     hint: "diffused, halation" },
];
const SHOT_TYPES = ["EWS", "WS", "MS", "MCU", "CU", "ECU", "OTS", "POV", "INSERT"];
const LENS_OPTIONS = ["18mm", "24mm", "35mm", "50mm", "85mm", "135mm"];
const DURATION_OPTIONS = ["0:02", "0:03", "0:04", "0:05", "0:06", "0:08", "0:12"];
const STATUSES = ["draft", "approved", "queued", "rendering", "rendered"];

// ─── Persistence + step navigation ─────────────────────────────────
const SB_SAVE_KEY = "cina:board-v2";
function sbLoad() {
  try { const s = JSON.parse(localStorage.getItem(SB_SAVE_KEY)); if (s && s.scenes && s.framesByScene) return s; } catch (e) {}
  return null;
}
function goBoardView(v) { window.dispatchEvent(new CustomEvent("cina:setView", { detail: v })); }

// ─── Real cast frames — board thumbnails use actual performer photography ──
const SB_CAST = ["calo-vey", "domek-ari", "evren-koll", "io-marsh", "nadya-ash", "rune-okafor", "siri-vale", "wren-soto"];
const SB_GRADES = [
  { f: "saturate(.92) contrast(1.08) brightness(.92)", p: "50% 16%" },
  { f: "grayscale(.55) sepia(.32) hue-rotate(-12deg) contrast(1.06) brightness(.86)", p: "42% 20%" },
  { f: "grayscale(.25) saturate(1.16) hue-rotate(6deg) brightness(.85) contrast(1.1)", p: "58% 14%" },
  { f: "grayscale(.9) contrast(1.2) brightness(.9)", p: "50% 22%" },
  { f: "sepia(.4) hue-rotate(-24deg) saturate(1.2) contrast(1.05) brightness(.86)", p: "46% 12%" },
];
const SB_ZOOM = { EWS: 1, WS: 1.02, MS: 1.18, MCU: 1.32, CU: 1.5, ECU: 1.85, OTS: 1.26, POV: 1.06, INSERT: 1.6 };
function sbHash(s) { let h = 0; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
// Deterministic still resolution — shared so the Board and the Generate studio
// render the SAME frame for a shot (no more disconnected placeholders).
function sbPhotoFor(frame) {
  const h = sbHash((frame && frame.id) + ((frame && frame.thumb) || ""));
  return "assets/cast/" + SB_CAST[h % SB_CAST.length] + ".png";
}
function sbGradeFor(frame) {
  const h = sbHash((frame && frame.id) + ((frame && frame.thumb) || ""));
  return SB_GRADES[(h + ((frame && frame.seed) || 0)) % SB_GRADES.length];
}
function BoardStill({ frame }) {
  const photo = (frame && frame.img) || sbPhotoFor(frame);
  const g = sbGradeFor(frame);
  const zoom = SB_ZOOM[frame.type] || 1.12;
  return (
    <div style={{ position: "absolute", inset: 0, background: tkc("bg"), overflow: "hidden" }}>
      <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: g.p, transform: frame?.img ? "none" : `scale(${zoom})`, transformOrigin: g.p, filter: frame?.img ? "none" : g.f, display: "block" }}/>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,6,9,.06) 52%, rgba(5,6,9,.55))" }}/>
    </div>
  );
}

// ─── Shot status vocabulary — single source of truth for pills across the board ──
const SHOT_STATUS = {
  draft:     { label: "Draft",     color: "var(--c-ink-3)" },
  review:    { label: "In review", color: "var(--c-warn)" },
  queued:    { label: "Queued",    color: "var(--c-ink-3)" },
  approved:  { label: "Approved",  color: "var(--c-amber)" },
  rendering: { label: "Rendering", color: "var(--c-amber-x)" },
  rendered:  { label: "Rendered",  color: "var(--c-good)" },
};
function ShotStatus({ status, size = 9.5 }) {
  const s = SHOT_STATUS[status] || SHOT_STATUS.draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--f-mono)", fontSize: size, letterSpacing: ".16em", textTransform: "uppercase", color: s.color, fontWeight: 600, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }}/>
      {s.label}
    </span>
  );
}

// ─── Header count chip ──────────────────────────────────────────────
function BoardChip({ label, value, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 9px 0 8px", borderRadius: 999, background: "var(--c-panel-2)", border: "1px solid var(--c-line)" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color || "var(--c-ink-4)", boxShadow: color ? `0 0 6px ${color}` : "none" }}/>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink)", fontWeight: 700 }}>{value}</span>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>
    </span>
  );
}

// ─── Board header meta — title, scene context, live counts ──────────
function BoardMeta({ scene, frames, framesByScene, activePerformer }) {
  const P = window.CinaProject;
  const proj = P ? P.get() : null;
  const shots = Object.values(framesByScene).flat();
  const approved = shots.filter(f => f.status === "approved").length;
  const rendered = shots.filter(f => f.status === "rendered").length;
  const takes = proj ? (proj.renders || []).length : 0;
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 11, flexWrap: "wrap" }}>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>Storyboard</span>
        <span style={{ width: 1, height: 13, background: "var(--c-line-2)", alignSelf: "center" }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>{scene?.title || "—"}</span>
        {activePerformer?.name && (
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".12em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.4)", padding: "1px 7px", textTransform: "uppercase" }}>
            CAST · {activePerformer.name}
          </span>
        )}
        {scene?.branchLabel && (
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color: tkc("on-amber"), background: "var(--c-amber)", borderRadius: "var(--r-1)", padding: "1px 6px" }}>PATH {scene.branchLabel}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 7, marginTop: 11, alignItems: "center", minWidth: 0 }}>
        <BoardChip label="shots" value={shots.length}/>
        <BoardChip label="approved" value={approved} color= "var(--c-amber)"/>
        <BoardChip label="rendered" value={rendered} color={rendered > 0 ? "var(--c-good)" : null}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginLeft: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1, minWidth: 0 }}>DRAFT → APPROVE → RENDER → CUT · EVERY STEP EDITABLE</span>
      </div>
    </div>
  );
}
const THUMB_POOL = ["wide-rain", "medium-bench", "close-hands", "extreme-eye"];

// ─── Panel ─────────────────────────────────────────────────────────
function StoryboardPanel() {
  const saved = useMemoS(sbLoad, []);
  const [scenes, setScenes] = useStateS(saved ? saved.scenes : SB_SCENES);
  const [activeSceneId, setActiveSceneId] = useStateS(saved && saved.activeSceneId ? saved.activeSceneId : "sc14");
  const [framesByScene, setFramesByScene] = useStateS(() => saved ? saved.framesByScene : ({
    sc12: window.STORYBOARD.slice(0, 4).map(f => ({ ...f, sceneId: "sc12", history: [] })),
    sc13: window.STORYBOARD.slice(0, 3).map((f, i) => ({ ...f, id: f.id + "_b", sceneId: "sc13", history: [] })),
    sc14: window.STORYBOARD.map(f => ({ ...f, sceneId: "sc14", history: [] })),
    sc15: window.STORYBOARD.slice(0, 2).map((f, i) => ({ ...f, id: f.id + "_d", sceneId: "sc15", history: [] })),
  }));
  const [selectedId, setSelectedId] = useStateS(null);
  const [activePerformer, setActivePerformer] = useStateS(() => window.CinaPipeline?.getActivePerformer?.() || null);

  // Every tweak survives reload — the board is a living document.
  useEffectS(() => {
    try { localStorage.setItem(SB_SAVE_KEY, JSON.stringify({ scenes, framesByScene, activeSceneId })); } catch (e) {}
    window.CinaPipeline?.emit?.({ step: "stills", sceneId: activeSceneId });
  }, [scenes, framesByScene, activeSceneId]);
  const [dragId, setDragId] = useStateS(null);
  const [dragOverId, setDragOverId] = useStateS(null);
  const [generator, setGenerator] = useStateS(null);
  const [gridOpen, setGridOpen] = useStateS(false);
  const [mapOpen, setMapOpen] = useStateS(false);
  const [newScene, setNewScene] = useStateS({ open: false, title: "" });
  const [bulkSel, setBulkSel] = useStateS(() => new Set());
  const [compareIds, setCompareIds] = useStateS(null); // [idA, idB] when comparing
  const [walk, setWalk] = useStateS(false);            // storyboard walkthrough overlay
  const [copilotOpen, setCopilotOpen] = useStateS(true); // Cina copilot rail
  const [frameLabOpen, setFrameLabOpen] = useStateS(false);
  const lb = useLightbox();
  const toast = useToast();

  useEffectS(() => {
    const onVoice = (e) => {
      if (e.detail?.tool === "generate_image") setFrameLabOpen(true);
    };
    const onBoardSync = (e) => {
      const b = e.detail?.board;
      if (b && b.scenes && b.framesByScene) {
        setScenes(b.scenes);
        setFramesByScene(b.framesByScene);
        if (b.activeSceneId) setActiveSceneId(b.activeSceneId);
        const first = (b.framesByScene[b.activeSceneId] || [])[0];
        if (first) setSelectedId(first.id);
      }
    };
    const onPerf = (e) => {
      if (e.detail) setActivePerformer(e.detail);
    };
    window.addEventListener("cina:voiceStudioTrigger", onVoice);
    window.addEventListener("cina:board-sync", onBoardSync);
    window.addEventListener("cina:performer-sync", onPerf);
    return () => {
      window.removeEventListener("cina:voiceStudioTrigger", onVoice);
      window.removeEventListener("cina:board-sync", onBoardSync);
      window.removeEventListener("cina:performer-sync", onPerf);
    };
  }, []);

  const frames = framesByScene[activeSceneId] || [];
  const scene = scenes.find(s => s.id === activeSceneId);
  const selected = frames.find(f => f.id === selectedId) || frames[0];

  function patchFrames(sceneId, updater) {
    setFramesByScene(s => ({ ...s, [sceneId]: updater(s[sceneId] || []) }));
  }

  function patchFrame(frameId, patch) {
    patchFrames(activeSceneId, list => list.map(f => f.id === frameId ? { ...f, ...(typeof patch === "function" ? patch(f) : patch) } : f));
  }

  function reorderInActive(fromId, toId) {
    patchFrames(activeSceneId, list => {
      const fromIdx = list.findIndex(f => f.id === fromId);
      const toIdx = list.findIndex(f => f.id === toId);
      if (fromIdx < 0 || toIdx < 0) return list;
      const next = [...list];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    toast.push({ kind: "info", agent: "editor", title: "Boards reordered", message: "Editor: shot order updated." });
  }

  function addNewScene() {
    if (!newScene.title.trim()) return;
    const id = "sc" + Math.floor(Math.random() * 9000 + 1000);
    const num = String(scenes.length + 12);
    setScenes(s => [...s, { id, number: num, title: newScene.title, color: tkc("cat-5") }]);
    setFramesByScene(s => ({ ...s, [id]: [] }));
    setActiveSceneId(id);
    setNewScene({ open: false, title: "" });
    toast.push({ kind: "good", agent: "director", title: "Scene added", message: `Scene ${num} — ${newScene.title}` });
  }

  // ─── Branching — fork a scene into an alternate path (branch series) ──
  function branchScene() {
    const parentId = scene.branchOf || activeSceneId;
    const parent = scenes.find(s => s.id === parentId);
    if (!parent) return;
    const sibs = scenes.filter(s => s.id === parentId || s.branchOf === parentId);
    const label = String.fromCharCode(65 + sibs.length); // parent is Path A
    const id = parentId + "_br" + label;
    const src = framesByScene[activeSceneId] || [];
    setScenes(s => [...s, { ...parent, id, branchOf: parentId, branchLabel: label }]);
    setFramesByScene(s => ({ ...s, [id]: src.map(f => ({ ...f, id: f.id + "_" + label.toLowerCase(), sceneId: id, status: f.status === "rendered" ? "approved" : f.status })) }));
    setActiveSceneId(id);
    toast.push({ kind: "good", agent: "director", title: `Path ${label} created`, message: `Scene ${parent.number} forked — edit this branch freely; Path A is untouched.` });
  }

  // ─── Generator entry points ─────────────────────────────────────
  function openGenerator(opts = {}) {
    setGenerator({
      mode: "new",
      prompt: "",
      style: "cinema",
      refId: null,
      shotType: "MS",
      lens: "35mm",
      duration: "0:04",
      busy: false,
      variants: [],
      targetId: null,
      ...opts,
    });
  }

  function openReplace(frameId) {
    const f = frames.find(x => x.id === frameId);
    if (!f) return;
    openGenerator({
      mode: "replace",
      prompt: f.desc,
      style: f.style || "cinema",
      shotType: f.type, lens: f.lens, duration: f.duration,
      refId: f.id,
      targetId: f.id,
    });
  }

  function openVariants(frameId) {
    const f = frames.find(x => x.id === frameId);
    if (!f) return;
    openGenerator({
      mode: "variants",
      prompt: f.desc,
      style: f.style || "cinema",
      shotType: f.type, lens: f.lens, duration: f.duration,
      refId: f.id, targetId: f.id,
    });
  }

  function openInsert(afterId) {
    openGenerator({ mode: "insert", refId: afterId, targetId: afterId });
  }

  function openSeries() {
    openGenerator({ mode: "series", prompt: "" });
  }

  // ─── Generation simulation ──────────────────────────────────────
  async function runGeneration() {
    if (!generator) return;
    const { mode, prompt } = generator;
    if (mode !== "series" && !prompt.trim()) return;
    setGenerator(g => ({ ...g, busy: true, variants: [] }));

    if (mode === "series") {
      // Generate a 3-shot beat: WS → MS → CU
      const beats = [
        { type: "WS",  lens: "35mm", duration: "0:05", thumb: "wide-rain" },
        { type: "MS",  lens: "50mm", duration: "0:04", thumb: "medium-bench" },
        { type: "CU",  lens: "85mm", duration: "0:03", thumb: "close-hands" },
      ];
      const out = [];
      for (let i = 0; i < beats.length; i++) {
        await new Promise(r => setTimeout(r, 450));
        out.push({
          id: `s${Date.now()}_${i}`,
          ...beats[i],
          seed: 8800 + Math.floor(Math.random() * 999),
          prompt: generator.prompt,
        });
        setGenerator(g => g && ({ ...g, variants: [...out] }));
      }
    } else {
      // 4 variants of a single shot
      const out = [];
      for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 380));
        out.push({
          id: `v${Date.now()}_${i}`,
          thumb: THUMB_POOL[(i + Math.floor(Math.random() * 4)) % 4],
          seed: 8800 + Math.floor(Math.random() * 999),
          prompt: generator.prompt,
          style: generator.style,
        });
        setGenerator(g => g && ({ ...g, variants: [...out] }));
      }
    }
    setGenerator(g => g && ({ ...g, busy: false }));
  }

  // ─── Variant acceptance (mode-aware) ────────────────────────────
  function acceptVariant(v) {
    const g = generator;
    if (!g) return;
    if (g.mode === "replace") {
      patchFrame(g.targetId, prev => ({
        history: [...(prev.history || []), {
          thumb: prev.thumb, desc: prev.desc, seed: prev.seed,
          style: prev.style, ts: Date.now(),
        }],
        thumb: v.thumb, desc: v.prompt + ".", seed: v.seed, style: v.style,
      }));
      toast.push({ kind: "good", agent: "visual", title: "Shot replaced", message: "Prior version saved to history." });
      setGenerator(null);
    } else if (g.mode === "variants" || g.mode === "new" || g.mode === "series") {
      const list = framesByScene[activeSceneId] || [];
      const idx = list.length;
      const newFrame = {
        id: v.id, sceneId: activeSceneId, scene: scene.number,
        shot: String.fromCharCode(65 + idx),
        type: v.type || g.shotType, lens: v.lens || g.lens, duration: v.duration || g.duration,
        status: "draft", thumb: v.thumb, desc: (v.prompt || g.prompt) + ".",
        seed: v.seed, style: v.style, history: [],
      };
      patchFrames(activeSceneId, l => [...l, newFrame]);
      setSelectedId(newFrame.id);
      toast.push({ kind: "good", agent: "visual", title: "Added to board", message: `${scene.number}${newFrame.shot} drafted.` });
    } else if (g.mode === "insert") {
      const list = framesByScene[activeSceneId] || [];
      const afterIdx = list.findIndex(f => f.id === g.targetId);
      const newFrame = {
        id: v.id, sceneId: activeSceneId, scene: scene.number,
        shot: String.fromCharCode(65 + list.length),
        type: g.shotType, lens: g.lens, duration: g.duration,
        status: "draft", thumb: v.thumb, desc: (v.prompt || g.prompt) + ".",
        seed: v.seed, style: v.style, history: [],
      };
      patchFrames(activeSceneId, l => {
        const next = [...l];
        next.splice(afterIdx + 1, 0, newFrame);
        return next;
      });
      setSelectedId(newFrame.id);
      toast.push({ kind: "good", agent: "visual", title: "Shot inserted", message: `Inserted after ${list[afterIdx].scene}${list[afterIdx].shot}.` });
    }
  }

  function acceptAllSeries() {
    const g = generator;
    if (!g) return;
    const list = framesByScene[activeSceneId] || [];
    const newFrames = g.variants.map((v, i) => ({
      id: v.id, sceneId: activeSceneId, scene: scene.number,
      shot: String.fromCharCode(65 + list.length + i),
      type: v.type, lens: v.lens, duration: v.duration,
      status: "draft", thumb: v.thumb, desc: g.prompt + ".",
      seed: v.seed, history: [],
    }));
    patchFrames(activeSceneId, l => [...l, ...newFrames]);
    setSelectedId(newFrames[0]?.id);
    toast.push({ kind: "good", agent: "visual", title: "Sequence added", message: `${newFrames.length} shots drafted from beat.` });
    setGenerator(null);
  }

  // ─── Render to video — the real handoff into the Render step ────
  function renderShot(frameId) {
    const sceneId = activeSceneId;
    const f = (framesByScene[sceneId] || []).find(x => x.id === frameId);
    if (!f) return;
    const mark = (status) => patchFrames(sceneId, l => l.map(x => x.id === frameId ? { ...x, status } : x));
    mark("queued");
    setTimeout(() => mark("rendering"), 500);
    setTimeout(() => {
      mark("rendered");
      const P = window.CinaProject;
      if (P) P.handoff({ id: frameId, step: "board", kind: "shot", label: `${f.scene}${f.shot} · ${f.type} · ${f.lens}`, scene: f.sceneId }, "render", { navigate: false });
      toast.push({ kind: "good", agent: "visual", title: `Shot ${f.scene}${f.shot} rendered`, message: "Take handed to Render → open the Editor to cut it in." });
    }, 2300);
  }

  function approveFrame(id) {
    patchFrames(activeSceneId, l => l.map(x => x.id === id ? { ...x, status: "approved" } : x));
    toast.push({ kind: "good", agent: "director", title: "Shot approved", message: "Ready to render." });
  }

  function deleteFrame(id) {
    patchFrames(activeSceneId, list => list.filter(f => f.id !== id));
    setBulkSel(s => { const n = new Set(s); n.delete(id); return n; });
    toast.push({ kind: "info", title: "Shot removed", message: "Use Cmd-Z to undo." });
  }

  // ─── Bulk select ────────────────────────────────────────────────
  function toggleBulk(id, e) {
    if (e) e.stopPropagation();
    setBulkSel(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }
  function selectAll() { setBulkSel(new Set(frames.map(f => f.id))); }
  function clearBulk() { setBulkSel(new Set()); }
  function bulkApprove() {
    const ids = bulkSel;
    patchFrames(activeSceneId, list => list.map(f => ids.has(f.id) ? { ...f, status: "approved" } : f));
    toast.push({ kind: "good", agent: "director", title: `Approved ${ids.size} shots`, message: "Marked ready for render." });
    clearBulk();
  }
  function bulkDelete() {
    const ids = bulkSel;
    patchFrames(activeSceneId, list => list.filter(f => !ids.has(f.id)));
    toast.push({ kind: "info", title: `Deleted ${ids.size} shots`, message: "Removed from board." });
    clearBulk();
  }
  function bulkRegen() {
    if (bulkSel.size === 0) return;
    // Pick the first selected as the reference for regen
    const firstId = [...bulkSel][0];
    openReplace(firstId);
    toast.push({ kind: "info", agent: "visual", title: "Bulk regen queued", message: `Generating alternates for ${bulkSel.size} shots — start here.` });
  }

  // Coverage stats — count by shot type for current scene
  const coverage = useMemoS(() => {
    const buckets = { WIDE: 0, MEDIUM: 0, CLOSE: 0, OTHER: 0 };
    frames.forEach(f => {
      const t = f.type;
      if (t === "EWS" || t === "WS") buckets.WIDE++;
      else if (t === "MS" || t === "MCU") buckets.MEDIUM++;
      else if (t === "CU" || t === "ECU") buckets.CLOSE++;
      else buckets.OTHER++;
    });
    return buckets;
  }, [frames]);

  function duplicateFrame(id) {
    patchFrames(activeSceneId, list => {
      const idx = list.findIndex(f => f.id === id);
      if (idx < 0) return list;
      const src = list[idx];
      const copy = { ...src, id: src.id + "_dup" + Date.now(), shot: String.fromCharCode(65 + list.length), history: [] };
      const next = [...list];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function revertHistory(frameId, histIdx) {
    patchFrame(frameId, prev => {
      const h = prev.history || [];
      if (!h[histIdx]) return {};
      const target = h[histIdx];
      const newHist = [
        ...h.slice(0, histIdx),
        { thumb: prev.thumb, desc: prev.desc, seed: prev.seed, style: prev.style, ts: Date.now() },
        ...h.slice(histIdx + 1),
      ];
      return { thumb: target.thumb, desc: target.desc, seed: target.seed, style: target.style, history: newHist };
    });
    toast.push({ kind: "info", agent: "visual", title: "Reverted", message: "Swapped to a prior version." });
  }

  // ─── Prompt → shot: hand a board shot into the Generate studio ──────────
  // The whole point of the board is that every shot is wired. Clicking Generate
  // carries the shot's slot, identity, prompt, specs and REAL reference frame
  // into the render studio, then navigates there.
  function sendToGenerate(frame, mode) {
    if (!frame) return;
    if (window.CinaPipeline && typeof window.CinaPipeline.sendShotToVideo === "function") {
      window.CinaPipeline.sendShotToVideo({
        frame, scene, mode: mode || "replace",
        photo: sbPhotoFor(frame), grade: sbGradeFor(frame),
      });
      toast.push({ kind: "info", agent: "visual", title: `Opening 05 Video · ${frame.scene}${frame.shot}`, message: "Shot, lens, prompt and reference carried into the render studio." });
      return;
    }
    const req = {
      frameId: frame.id, sceneId: activeSceneId, sceneNum: scene ? scene.number : null,
      shotLabel: `${frame.scene}${frame.shot}`, shot: frame.shot,
      type: frame.type, lens: frame.lens, duration: frame.duration,
      prompt: frame.desc || "", style: frame.style || "cinema",
      mode: mode || "new", photo: sbPhotoFor(frame), grade: sbGradeFor(frame),
    };
    try { window.__cinaGenReq = req; localStorage.setItem("cina:gen-req", JSON.stringify(req)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("cina:generate-shot", { detail: req }));
    window.dispatchEvent(new CustomEvent("cina:setView", { detail: "generate" }));
    toast.push({ kind: "info", agent: "visual", title: `Opening Generate · ${req.shotLabel}`, message: "Shot, identity, prompt and reference carried into the render studio." });
  }

  // Generate studio hands a finished take back onto the board — the loop closes.
  useEffectS(() => {
    const onWB = (e) => {
      const d = e.detail || {};
      if (!d.frameId) return;
      setFramesByScene(s => {
        const sid = (d.sceneId && s[d.sceneId]) ? d.sceneId : Object.keys(s).find(k => (s[k] || []).some(f => f.id === d.frameId));
        if (!sid) return s;
        return { ...s, [sid]: s[sid].map(f => f.id === d.frameId ? { ...f, status: d.status || "rendered", seed: (d.seed != null ? d.seed : f.seed) } : f) };
      });
      toast.push({ kind: "good", agent: "visual", title: `${d.shotLabel || "Shot"} · take landed`, message: "Render studio pushed the pick back to the board." });
    };
    window.addEventListener("cina:board-writeback", onWB);
    return () => window.removeEventListener("cina:board-writeback", onWB);
  }, []);

  // ─── Cina automations — one-click board operations ──────────────────────
  function fillCoverageGaps() {
    const gaps = [];
    if (coverage.WIDE === 0)   gaps.push({ type: "WS",  lens: "24mm", duration: "0:06", desc: "Wide establishing. Orient the space before we go in." });
    if (coverage.MEDIUM === 0) gaps.push({ type: "MS",  lens: "50mm", duration: "0:04", desc: "Medium. Hold the performance at a conversational distance." });
    if (coverage.CLOSE === 0)  gaps.push({ type: "CU",  lens: "85mm", duration: "0:03", desc: "Close-up. Land the emotional beat." });
    if (gaps.length === 0) { toast.push({ kind: "info", agent: "editor", title: "Coverage is complete", message: "Wide, medium and close are all represented in this scene." }); return; }
    const list = framesByScene[activeSceneId] || [];
    const added = gaps.map((g, i) => ({
      id: `gap${Date.now()}_${i}`, sceneId: activeSceneId, scene: scene.number,
      shot: String.fromCharCode(65 + list.length + i),
      type: g.type, lens: g.lens, duration: g.duration, status: "draft",
      thumb: THUMB_POOL[i % THUMB_POOL.length], desc: g.desc,
      seed: 8000 + Math.floor(Math.random() * 999), history: [],
    }));
    patchFrames(activeSceneId, l => [...l, ...added]);
    setSelectedId(added[0].id);
    toast.push({ kind: "good", agent: "visual", title: `Cina filled ${gaps.length} coverage gap${gaps.length > 1 ? "s" : ""}`, message: gaps.map(g => g.type).join(" · ") + " drafted — review or generate." });
  }

  function suggestNextShot() {
    const last = frames[frames.length - 1];
    const nextType = !last ? "MS" : (["WS", "EWS"].includes(last.type) ? "MCU" : (["CU", "ECU", "INS", "INSERT"].includes(last.type) ? "WS" : "CU"));
    openGenerator({
      mode: last ? "insert" : "new",
      refId: last ? last.id : null, targetId: last ? last.id : null,
      shotType: nextType,
      prompt: last ? `${nextType} to follow ${last.scene}${last.shot}. ${last.desc}` : "",
    });
    toast.push({ kind: "info", agent: "director", title: `Cina suggests a ${nextType}`, message: last ? `A ${nextType} cuts well after your ${last.type}. Prompt prefilled.` : "Start with a medium to anchor the scene." });
  }

  function autoApproveDrafts() {
    const draftIds = frames.filter(f => f.status === "draft").map(f => f.id);
    if (!draftIds.length) { toast.push({ kind: "info", agent: "editor", title: "No drafts to approve", message: "Every shot in this scene is already past draft." }); return; }
    patchFrames(activeSceneId, l => l.map(f => f.status === "draft" ? { ...f, status: "approved" } : f));
    toast.push({ kind: "good", agent: "director", title: `Approved ${draftIds.length} draft${draftIds.length > 1 ? "s" : ""}`, message: "All drafts marked ready to render — still fully editable." });
  }

  function rebalancePacing() {
    const dur = { EWS: "0:06", WS: "0:05", MS: "0:04", MCU: "0:04", OTS: "0:04", POV: "0:04", CU: "0:03", ECU: "0:02", INS: "0:02", INSERT: "0:02" };
    patchFrames(activeSceneId, l => l.map(f => dur[f.type] ? { ...f, duration: dur[f.type] } : f));
    toast.push({ kind: "good", agent: "editor", title: "Pacing rebalanced", message: "Durations tuned to shot size — wides breathe, cuts snap." });
  }

  function applyLookToAll(styleId) {
    const preset = STYLE_PRESETS.find(p => p.id === styleId);
    patchFrames(activeSceneId, l => l.map(f => ({ ...f, style: styleId })));
    toast.push({ kind: "good", agent: "visual", title: `Look applied · ${preset ? preset.label : styleId}`, message: "Every shot in this scene now shares one grade." });
  }

  function renderAllApproved() {
    const ids = frames.filter(f => f.status === "approved").map(f => f.id);
    if (!ids.length) { toast.push({ kind: "info", agent: "visual", title: "Nothing approved yet", message: "Approve shots first — then Cina renders them in a batch." }); return; }
    ids.forEach((id, i) => setTimeout(() => renderShot(id), i * 350));
    toast.push({ kind: "good", agent: "visual", title: `Rendering ${ids.length} approved shot${ids.length > 1 ? "s" : ""}`, message: "Batch handed to Render — takes land in the Editor as they finish." });
  }

  function askCina(text) {
    const t = (text || "").trim();
    if (!t) return;
    openGenerator({ prompt: t });
  }

  // First visit opens the walkthrough once.
  useEffectS(() => {
    try { if (!localStorage.getItem("cina:board-walk-seen") && window.__cinaStudioMode === "full") setWalk(true); } catch (e) {}
  }, []);
  function closeWalk() { setWalk(false); try { localStorage.setItem("cina:board-walk-seen", "1"); } catch (e) {} }

  const sendBoardNextRef = useRefS(null);
  sendBoardNextRef.current = () => {
    const target = frames.find(f => f.status === "approved") || selected || frames[0];
    if (target) {
      sendToGenerate(target, "replace");
      return true;
    }
    window.CinaPipeline?.go?.("generate");
    return true;
  };

  useEffectS(() => {
    if (!window.CinaPipeline?.registerSendNext) return;
    return window.CinaPipeline.registerSendNext("board", () => sendBoardNextRef.current());
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "var(--c-bg)" }}>
      {/* Header — title, scene context, live counts, tools */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "18px 32px 14px", flexShrink: 0 }}>
        <BoardMeta scene={scene} frames={frames} framesByScene={framesByScene} activePerformer={activePerformer}/>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={() => setWalk(true)} title="How this page works"><Icon name="book" size={12}/>Walkthrough</button>
          <button className="btn btn-ghost" onClick={() => setMapOpen(true)} title="See how every path diverges across the film">⑂ Branch map</button>
          <button className="btn btn-ghost" onClick={branchScene} title="Fork this scene into an alternate path — for branching cuts and series">⑂ Branch</button>
          <button className="btn btn-ghost" onClick={() => setGridOpen(true)}><Icon name="grid" size={12}/>All scenes</button>
          <button className="btn btn-ghost" onClick={openSeries}><Icon name="film" size={12}/>Sequence</button>
          <button className="btn btn-ghost" onClick={selectAll} title="Select all in scene"><Icon name="check" size={12}/>Select all</button>
          <span style={{ width: 1, height: 20, background: "var(--c-line-2)", margin: "0 4px" }}/>
          <button className="btn btn-primary" style={{ borderRadius: 0 }} onClick={() => sendBoardNextRef.current()} title="Carry selected or approved shot directly into 05 Video render">Send Next · 05 Video →</button>
          <button className="btn btn-ghost" onClick={() => openGenerator()}><Icon name="sparkles" size={12}/>Generate</button>
        </div>
      </div>

      {/* Scene reel selector — quiet tabs, amber underline on active */}
      <div style={{
        display: "flex", gap: 2, padding: "0 32px",
        borderBottom: "1px solid var(--c-line)", flexShrink: 0,
        overflowX: "auto", alignItems: "stretch",
      }}>
        {scenes.filter(s => !s.branchOf).map(s => {
          const branches = scenes.filter(b => b.branchOf === s.id);
          const family = [s, ...branches];
          const activeMember = family.find(f => f.id === activeSceneId);
          const active = !!activeMember;
          const shownId = activeMember ? activeMember.id : s.id;
          const count = framesByScene[shownId]?.length || 0;
          return (
            <button
              key={s.id}
              onClick={() => { setActiveSceneId(shownId); setSelectedId(framesByScene[shownId]?.[0]?.id); }}
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px 11px", borderRadius: 0,
                background: "transparent", border: "none",
                color: "inherit", cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "var(--f-sans)", opacity: active ? 1 : .72,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "var(--r-1)", background: s.color, opacity: active ? 1 : .6 }}/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: active ? "var(--c-amber)" : "var(--c-ink-4)", letterSpacing: ".16em", fontWeight: active ? 700 : 400 }}>SC {s.number}</span>
              <span style={{ fontSize: "var(--fs-body)", color: active ? "var(--c-ink)" : "var(--c-ink-3)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>
                {s.title}
              </span>
              {active && <span style={{ position: "absolute", left: 8, right: 8, bottom: 0, height: 2, background: "var(--c-amber)", borderRadius: "2px 2px 0 0", boxShadow: "0 -1px 8px rgba(var(--accent-rgb),.35)" }}/>}
              {branches.length > 0 && (
                <span style={{ display: "inline-flex", gap: 3 }} title="Alternate paths — click to switch">
                  {family.map(b => {
                    const lbl = b.branchLabel || "A";
                    const on = activeMember && activeMember.id === b.id;
                    return (
                      <span key={b.id}
                        onClick={(e) => { e.stopPropagation(); setActiveSceneId(b.id); setSelectedId(framesByScene[b.id]?.[0]?.id); }}
                        title={`Path ${lbl} · ${framesByScene[b.id]?.length || 0} shots`}
                        style={{
                          width: 18, height: 18, borderRadius: "var(--r-2)", display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, cursor: "pointer",
                          background: on ? "var(--c-amber)" : "transparent",
                          color: on ? tkc("on-amber") : "var(--c-ink-3)",
                          border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                        }}>{lbl}</span>
                    );
                  })}
                </span>
              )}
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{count}</span>
            </button>
          );
        })}
        <button
          onClick={() => setNewScene({ open: true, title: "" })}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "0 12px", margin: "6px 0 6px 6px", borderRadius: "var(--r-2)",
            background: "transparent", border: "1px dashed var(--c-line-2)",
            color: "var(--c-ink-3)", cursor: "pointer", whiteSpace: "nowrap",
            fontSize: "var(--fs-body)", alignSelf: "center", height: 28,
          }}
        >
          <Icon name="plus" size={11}/> New scene
        </button>
      </div>

      {/* MAIN BODY — Cina copilot (left) · board grid (center) · inspector (right) */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* LEFT — Cina copilot / automations */}
        <CinaCopilot
          open={copilotOpen}
          onToggle={() => setCopilotOpen(o => !o)}
          scene={scene}
          frames={frames}
          coverage={coverage}
          selected={selected}
          onAsk={askCina}
          onAutoBoard={openSeries}
          onFillGaps={fillCoverageGaps}
          onSuggestNext={suggestNextShot}
          onApplyLook={applyLookToAll}
          onAutoApprove={autoApproveDrafts}
          onRebalance={rebalancePacing}
          onRenderAll={renderAllApproved}
          onStudio={() => sendToGenerate(selected, "replace")}
          onFrameLab={() => setFrameLabOpen(true)}
          onWalk={() => setWalk(true)}
        />

        {/* CENTER — the board grid (the storyboard itself) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          <div style={{ flexShrink: 0, borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
            {frames.length > 0 && <CoverageBar coverage={coverage} total={frames.length}/>}
            {bulkSel.size > 0 && (
              <BulkBar count={bulkSel.size} onApprove={bulkApprove} onRegen={bulkRegen} onDelete={bulkDelete} onClear={clearBulk}/>
            )}
          </div>

          <div className="sc-scroll" data-tour="board-grid" style={{ flex: 1, overflowY: "auto", padding: "18px 24px 30px", background: "var(--c-bg)" }}>
            {frames.length === 0 ? (
              <BoardEmpty onGenerate={() => openGenerator()} onSeries={openSeries}/>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(262px, 1fr))", gap: 16, alignItems: "start" }}>
                {frames.map((f, i) => (
                  <BoardCard
                    key={f.id}
                    frame={f} index={i}
                    selected={selectedId === f.id}
                    checked={bulkSel.has(f.id)}
                    bulkActive={bulkSel.size > 0}
                    onToggleCheck={(e) => toggleBulk(f.id, e)}
                    dragOver={dragOverId === f.id}
                    onSelect={() => setSelectedId(f.id)}
                    onExpand={() => lb.open({
                      subtitle: `Storyboard · Scene ${scene.number}`,
                      title: `"${f.desc.split(".")[0]}."`,
                      kind: "frame", index: i,
                      items: frames.map(fr => ({ thumb: fr.thumb, label: `${fr.scene}${fr.shot} · ${fr.lens} · ${fr.duration}` })),
                    })}
                    onDragStart={() => setDragId(f.id)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverId(f.id); }}
                    onDrop={(e) => { e.preventDefault(); if (dragId && dragId !== f.id) reorderInActive(dragId, f.id); setDragId(null); setDragOverId(null); }}
                    onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                    onReplace={() => openReplace(f.id)}
                    onVariants={() => openVariants(f.id)}
                    onInsertAfter={() => openInsert(f.id)}
                    onDuplicate={() => duplicateFrame(f.id)}
                    onDelete={() => deleteFrame(f.id)}
                    onApprove={() => approveFrame(f.id)}
                    onRender={() => renderShot(f.id)}
                    onStudio={() => sendToGenerate(f, "replace")}
                    onEditor={() => goBoardView("editor")}
                  />
                ))}
                <button onClick={() => openGenerator()} data-tour="new-shot" style={{
                  minHeight: 210, borderRadius: "var(--r-3)",
                  border: "1.5px dashed var(--c-line-2)", background: "var(--c-panel)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, color: "var(--c-ink-3)", cursor: "pointer",
                }}>
                  <span style={{ width: 40, height: 40, borderRadius: "var(--r-3)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-amber-tint)", color: "var(--c-amber)" }}><Icon name="plus" size={18}/></span>
                  <span style={{ fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em" }}>NEW SHOT</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — preview + specs inspector */}
        {selected && (
          <aside data-tour="inspector" style={{ width: 384, flexShrink: 0, borderLeft: "1px solid var(--c-line)", background: "var(--c-panel)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--c-line)", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PreviewPane
                  frame={selected}
                  sceneNum={scene?.number}
                  onReplace={() => openReplace(selected.id)}
                  onVariants={() => openVariants(selected.id)}
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", height: 36, marginTop: 12 }} onClick={() => sendToGenerate(selected, "replace")}>
                <Icon name="sparkles" size={12}/>Generate in studio →
              </button>
            </div>
            <SpecsPane
              frame={selected}
              sceneNum={scene?.number}
              onPatch={(patch) => patchFrame(selected.id, patch)}
              onReplace={() => openReplace(selected.id)}
              onVariants={() => openVariants(selected.id)}
              onInsertAfter={() => openInsert(selected.id)}
              onRevert={(idx) => revertHistory(selected.id, idx)}
              onRender={() => renderShot(selected.id)}
            />
          </aside>
        )}
      </div>

      {/* GENERATOR */}
      {generator && (
        <GeneratorOverlay
          gen={generator}
          setGen={setGenerator}
          frames={frames}
          sceneTitle={scene?.title}
          onRun={runGeneration}
          onAccept={acceptVariant}
          onAcceptAll={acceptAllSeries}
          onClose={() => setGenerator(null)}
        />
      )}

      {/* BRANCH MAP */}
      {mapOpen && (
        <BranchMapOverlay
          scenes={scenes}
          framesByScene={framesByScene}
          activeSceneId={activeSceneId}
          onSelect={(id) => { setActiveSceneId(id); setSelectedId(framesByScene[id]?.[0]?.id); setMapOpen(false); }}
          onSetCanon={(rootId, letter) => {
            setScenes(s => s.map(x => x.id === rootId ? { ...x, canon: letter } : x));
            // Publish the decision — the Watch app's alerts bell reads this and
            // tells every viewer whether THEIR path won.
            try {
              const evs = JSON.parse(localStorage.getItem("cina:canon-events") || "[]");
              const sc = scenes.find(x => x.id === rootId);
              evs.unshift({ id: "canon_" + Date.now().toString(36), ts: Date.now(), filmId: "ll", rootId, sceneNum: sc ? sc.number : null, letter });
              localStorage.setItem("cina:canon-events", JSON.stringify(evs.slice(0, 40)));
            } catch (e) {}
            toast.push({ kind: "good", agent: "director", title: `Path ${letter} is canon`, message: `Scene ${scenes.find(x=>x.id===rootId)?.number} · default path for new viewers — forks still offered.` });
          }}
          onBranch={(rootId) => {
            const parent = scenes.find(s => s.id === rootId);
            if (!parent) return;
            const sibs = scenes.filter(s => s.id === rootId || s.branchOf === rootId);
            const label = String.fromCharCode(65 + sibs.length);
            const id = rootId + "_br" + label;
            const src = framesByScene[rootId] || [];
            setScenes(s => [...s, { ...parent, id, branchOf: rootId, branchLabel: label }]);
            setFramesByScene(s => ({ ...s, [id]: src.map(f => ({ ...f, id: f.id + "_" + label.toLowerCase(), sceneId: id, status: f.status === "rendered" ? "approved" : f.status })) }));
            toast.push({ kind: "good", agent: "director", title: `Path ${label} created`, message: `Scene ${parent.number} forked from Path A.` });
          }}
          onClose={() => setMapOpen(false)}
        />
      )}

      {/* GRID */}
      {gridOpen && (
        <GridOverlay
          framesByScene={framesByScene}
          scenes={scenes}
          activeSceneId={activeSceneId}
          onSelect={(id, sceneId) => { setActiveSceneId(sceneId); setSelectedId(id); setGridOpen(false); }}
          onReorder={(sceneId, fromId, toId) => {
            patchFrames(sceneId, list => {
              const fi = list.findIndex(f => f.id === fromId);
              const ti = list.findIndex(f => f.id === toId);
              if (fi < 0 || ti < 0) return list;
              const next = [...list];
              const [m] = next.splice(fi, 1);
              next.splice(ti, 0, m);
              return next;
            });
          }}
          onMoveAcross={(fromSceneId, toSceneId, frameId) => {
            const frame = framesByScene[fromSceneId].find(f => f.id === frameId);
            if (!frame) return;
            setFramesByScene(s => ({
              ...s,
              [fromSceneId]: s[fromSceneId].filter(f => f.id !== frameId),
              [toSceneId]: [...(s[toSceneId] || []), { ...frame, sceneId: toSceneId, scene: scenes.find(sc => sc.id === toSceneId)?.number }],
            }));
            toast.push({ kind: "info", title: "Shot moved", message: `Moved across scenes.` });
          }}
          onClose={() => setGridOpen(false)}
        />
      )}

      {/* NEW SCENE */}
      {newScene.open && (
        <div onClick={() => setNewScene({ open: false, title: "" })} style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(8px)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 480, padding: "28px 28px 24px",
            background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
            borderRadius: "var(--r-3)",
          }}>
            <div className="t-label" style={{ color: "var(--c-ink-4)", marginBottom: 8 }}>NEW SCENE</div>
            <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: "0 0 18px" }}>
              What's the scene about?
            </h3>
            <input
              autoFocus
              value={newScene.title}
              onChange={e => setNewScene(s => ({ ...s, title: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addNewScene()}
              placeholder="e.g. Hospital corridor, dawn"
              style={{
                width: "100%", height: 44, padding: "0 14px",
                background: "var(--c-bg)", border: "1px solid var(--c-line)",
                borderRadius: "var(--r-2)", color: "var(--c-ink)",
                fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", outline: "none",
              }}
            />
            <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setNewScene({ open: false, title: "" })}>Cancel</button>
              <button className="btn btn-primary" onClick={addNewScene} disabled={!newScene.title.trim()}>Create scene</button>
            </div>
          </div>
        </div>
      )}

      {/* WALKTHROUGH */}
      {walk && <StoryboardWalkthrough onClose={closeWalk}/>}

      {/* 4K FRAME LAB (GEMINI) */}
      {window.CinaStudioAI?.StudioFrameLabModal && (
        <window.CinaStudioAI.StudioFrameLabModal
          open={frameLabOpen}
          initialPrompt={selected?.desc}
          onClose={() => setFrameLabOpen(false)}
          onApplyImage={(url, prompt) => {
            if (selected) patchFrame(selected.id, { img: url, desc: selected.desc || prompt });
          }}
        />
      )}
    </div>
  );
}

// ─── Generator ─────────────────────────────────────────────────────
const MODE_COPY = {
  new:      { label: "NEW SHOT",         help: "Describe what you want to see." },
  replace:  { label: "REPLACE SHOT",     help: "Generate alternates. Pick one — the current image moves to history." },
  variants: { label: "VARIANTS",         help: "Riff on this shot. Accept one or more as new shots." },
  insert:   { label: "INSERT NEW SHOT",  help: "New shot will be placed right after the reference." },
  series:   { label: "GENERATE SEQUENCE",help: "Cina will draft a 3-shot beat: wide → medium → close." },
};

function GeneratorOverlay({ gen, setGen, frames, sceneTitle, onRun, onAccept, onAcceptAll, onClose }) {
  const copy = MODE_COPY[gen.mode] || MODE_COPY.new;
  const refFrame = frames.find(f => f.id === gen.refId);
  const isSeries = gen.mode === "series";
  const variantCount = isSeries ? 3 : 4;
  const credits = isSeries ? 18 : 12;

  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,.78)", backdropFilter: "blur(10px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(960px, 100%)", maxHeight: "100%",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-3)", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 22px", borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)" }}/>
          <div style={{ flex: 1 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>
              VISUAL · {copy.label}
            </div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
              {sceneTitle}
            </div>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close" title="Close"><Icon name="x" size={12}/></button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px", overflowY: "auto" }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 14 }}>{copy.help}</div>

          {/* Reference frame */}
          {refFrame && !isSeries && (
            <div style={{
              display: "flex", gap: 12, padding: "10px 12px", marginBottom: 14,
              background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
              alignItems: "center",
            }}>
              <div style={{ width: 88, aspectRatio: "16/9", borderRadius: "var(--r-2)", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                <BoardStill frame={refFrame}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>REFERENCE</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 2 }}>
                  {refFrame.scene}{refFrame.shot} · {refFrame.type} · {refFrame.lens}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ height: 24, padding: "0 8px", fontSize: "var(--fs-label)" }}
                      onClick={() => setGen(g => ({ ...g, refId: null }))}>
                <Icon name="x" size={10}/>Clear
              </button>
            </div>
          )}

          {/* Prompt */}
          <label className="t-label" style={{ color: "var(--c-ink-4)", display: "block", marginBottom: 8 }}>PROMPT</label>
          <textarea
            value={gen.prompt}
            onChange={e => setGen(g => ({ ...g, prompt: e.target.value }))}
            placeholder={isSeries
              ? "What happens in this beat? e.g. 'She steps off the curb. Rain begins. Cars pass.'"
              : "Wide shot, rain begins, character steps off curb. Cool blue grade, 35mm anamorphic, shallow depth."}
            rows={3}
            style={{
              width: "100%", padding: "12px 14px",
              background: "var(--c-bg)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", color: "var(--c-ink)",
              fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", lineHeight: 1.55, outline: "none", resize: "vertical",
            }}
          />

          {/* Style */}
          <div style={{ marginTop: 14 }}>
            <div className="t-label" style={{ color: "var(--c-ink-4)", marginBottom: 8 }}>STYLE</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STYLE_PRESETS.map(p => {
                const on = gen.style === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setGen(g => ({ ...g, style: p.id }))}
                    style={{
                      padding: "6px 10px", borderRadius: "var(--r-2)",
                      background: on ? "var(--c-amber-tint)" : "var(--c-bg)",
                      border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line)"}`,
                      color: on ? "var(--c-amber)" : "var(--c-ink-2)",
                      cursor: "pointer", fontSize: "var(--fs-label)", display: "flex", alignItems: "baseline", gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{p.label}</span>
                    <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{p.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shot specs (skip for series — beats define their own) */}
          {!isSeries && (
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Field label="TYPE">
                <select value={gen.shotType} onChange={e => setGen(g => ({ ...g, shotType: e.target.value }))} style={selStyle}>
                  {SHOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="LENS">
                <select value={gen.lens} onChange={e => setGen(g => ({ ...g, lens: e.target.value }))} style={selStyle}>
                  {LENS_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="DURATION">
                <select value={gen.duration} onChange={e => setGen(g => ({ ...g, duration: e.target.value }))} style={selStyle}>
                  {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Reference picker (when there's no ref) */}
          {!refFrame && !isSeries && frames.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="t-label" style={{ color: "var(--c-ink-4)", marginBottom: 8 }}>REFERENCE FRAME (OPTIONAL)</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {frames.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setGen(g => ({ ...g, refId: f.id }))}
                    title={`${f.scene}${f.shot} · ${f.type}`}
                    style={{
                      flex: "0 0 84px", aspectRatio: "16/9",
                      borderRadius: "var(--r-2)", overflow: "hidden", padding: 0, position: "relative",
                      border: "1px solid var(--c-line)", cursor: "pointer", background: tkc("bg"),
                    }}
                  >
                    <BoardStill frame={f}/>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action row */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            <PresetChip label="Cool grade" onClick={() => setGen(g => ({ ...g, prompt: g.prompt + " Cool blue grade." }))}/>
            <PresetChip label="Handheld"  onClick={() => setGen(g => ({ ...g, prompt: g.prompt + " Handheld, slight shake." }))}/>
            <PresetChip label="Backlit"   onClick={() => setGen(g => ({ ...g, prompt: g.prompt + " Backlit, rim light." }))}/>
            <div style={{ flex: 1 }}/>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>VEO-3 · {variantCount} {isSeries ? "BEATS" : "VARIANTS"} · ~{credits} CR</span>
            <button className="btn btn-primary" onClick={onRun} disabled={gen.busy || (!isSeries && !gen.prompt.trim())} style={{ height: 36 }}>
              <Icon name={isSeries ? "film" : "sparkles"} size={12}/>{gen.busy ? "Generating…" : (isSeries ? "Generate sequence" : "Generate")}
            </button>
          </div>

          {/* Variants */}
          {(gen.busy || gen.variants.length > 0) && (
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                <span className="t-label" style={{ color: "var(--c-ink-4)" }}>{isSeries ? "BEATS" : "VARIANTS"}</span>
                <div style={{ flex: 1 }}/>
                {isSeries && gen.variants.length === 3 && !gen.busy && (
                  <button className="btn btn-primary" onClick={onAcceptAll} style={{ height: 28 }}>
                    <Icon name="check" size={11}/>Add all 3 to board
                  </button>
                )}
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${isSeries ? 3 : 4}, 1fr)`,
                gap: 12,
              }}>
                {Array.from({ length: variantCount }).map((_, i) => {
                  const v = gen.variants[i];
                  if (!v) return (
                    <div key={i} style={{
                      aspectRatio: "16/9", background: "var(--c-bg)",
                      border: "1px dashed var(--c-line)", borderRadius: "var(--r-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--c-ink-4)", fontSize: "var(--fs-label)",
                      animation: gen.busy ? "pulse 1.6s ease-in-out infinite" : "none",
                    }}>
                      {gen.busy ? "rendering…" : ""}
                    </div>
                  );
                  return (
                    <div key={v.id} style={{
                      borderRadius: "var(--r-2)", overflow: "hidden",
                      border: "1px solid var(--c-line-2)",
                    }}>
                      <div style={{ aspectRatio: "16/9", position: "relative", background: tkc("bg") }}>
                        <BoardStill frame={{ ...v, type: v.type || gen.shotType }}/>
                        {isSeries && (
                          <div style={{
                            position: "absolute", top: 6, left: 6,
                            padding: "2px 6px", background: "rgba(8,8,10,.8)",
                            borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                            letterSpacing: ".08em",
                          }}>
                            {v.type} · {v.lens}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "8px 10px", background: "var(--c-bg)", display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>seed {v.seed}</span>
                        <div style={{ flex: 1 }}/>
                        <button className="btn btn-ghost" style={{ height: 24, padding: "0 8px", fontSize: "var(--fs-label)" }} onClick={() => onAccept(v)}>
                          {gen.mode === "replace" ? "↻ Use this" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const selStyle = {
  width: "100%", height: 32, padding: "0 8px",
  background: "var(--c-bg)", border: "1px solid var(--c-line)",
  borderRadius: "var(--r-2)", color: "var(--c-ink)",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", outline: "none",
  cursor: "pointer", appearance: "none", WebkitAppearance: "none",
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'><path d='M0 0l4 5 4-5z' fill='%23615c50'/></svg>\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
};

function Field({ label, children }) {
  return (
    <div>
      <div className="t-label" style={{ color: "var(--c-ink-4)", marginBottom: 6, fontSize: "var(--fs-label)" }}>{label}</div>
      {children}
    </div>
  );
}

function PresetChip({ label, onClick }) {
  return <CinaPill onClick={onClick}>{label}</CinaPill>;
}

// ─── Branch Map — the film as a tree of paths ───────────────────────
// Scenes flow left → right. Where a scene forks, alternate paths hang
// below Path A with elbow connectors. Every node is clickable.
function BranchMapOverlay({ scenes, framesByScene, activeSceneId, onSelect, onBranch, onSetCanon, onClose }) {
  const roots = scenes.filter(s => !s.branchOf);
  const totalPaths = roots.reduce((acc, r) => acc * Math.max(1, scenes.filter(b => b.branchOf === r.id).length + 1), 1);

  // ── Viewer fork ledger — real choices recorded by the Watch player ──
  const FORK_RATE = 0.12; // $ view-share per recorded choice
  let forkLedger = [];
  try { const l = JSON.parse(localStorage.getItem("cina:fork-ledger")); forkLedger = Array.isArray(l) ? l : []; } catch (e) {}
  function forkStats(rootId) {
    const rows = forkLedger.filter(r => r.rootId === rootId || r.forkId === "bd_" + rootId);
    const by = {};
    rows.forEach(r => { by[r.letter] = (by[r.letter] || 0) + 1; });
    const minority = rows.filter(r => r.minority).length;
    return { total: rows.length, by, royalty: rows.length * FORK_RATE, minority };
  }
  const boardChoices = forkLedger.filter(r => r.source === "board").length;
  const boardRoyalty = boardChoices * FORK_RATE;
  // Audience temperament — who is watching this film, computed from every
  // recorded choice: letter split + how often they defy the room.
  const audTemper = (() => {
    const by = { A: 0, B: 0, C: 0 }; let minority = 0;
    forkLedger.forEach(r => { if (by[r.letter] != null) by[r.letter]++; if (r.minority) minority++; });
    const total = by.A + by.B + by.C;
    if (!total) return null;
    const dom = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
    return { total, dom: dom[0], domPct: Math.round((dom[1] / total) * 100), contrarian: Math.round((minority / total) * 100) };
  })();
  const AUD_WORDS = { A: "MERCIFUL", B: "RUTHLESS", C: "CURIOUS" };

  function NodeCard({ s, isBranch, stats, canon }) {
    const list = framesByScene[s.id] || [];
    const first = list[0];
    const approved = list.filter(f => f.status === "approved").length;
    const rendered = list.filter(f => f.status === "rendered").length;
    const active = s.id === activeSceneId;
    const letter = s.branchLabel || "A";
    const isCanon = canon === letter;
    const share = stats && stats.total > 0 ? Math.round(((stats.by[letter] || 0) / stats.total) * 100) : null;
    return (
      <button onClick={() => onSelect(s.id)} title={`Open Scene ${s.number}${s.branchLabel ? " · Path " + s.branchLabel : ""}`}
        style={{
          width: 196, textAlign: "left", padding: 0, borderRadius: "var(--r-2)", overflow: "hidden", cursor: "pointer",
          background: "var(--c-bg)", position: "relative", flexShrink: 0,
          border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
          boxShadow: active ? "0 0 0 3px rgba(var(--accent-rgb),.18)" : "0 2px 8px rgba(0,0,0,.35)",
        }}>
        <div style={{ aspectRatio: "16/9", position: "relative", background: tkc("bg") }}>
          {first
            ? <BoardStill frame={first}/>
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em" }}>NO SHOTS</div>}
          <span style={{
            position: "absolute", top: 6, left: 6, padding: "1px 7px", borderRadius: "var(--r-1)",
            background: s.branchLabel ? "var(--c-amber)" : "rgba(8,8,10,.8)",
            color: s.branchLabel ? tkc("on-amber") : "var(--c-ink-2)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em",
          }}>PATH {s.branchLabel || "A"}</span>
          {isCanon && <span style={{ position: "absolute", bottom: 6, left: 6, padding: "1px 7px", borderRadius: "var(--r-1)", background: "rgba(106,163,122,.9)", color: tkc("panel"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em" }}>★ CANON</span>}
          {rendered > 0 && <span style={{ position: "absolute", top: 6, right: 6, padding: "1px 6px", borderRadius: "var(--r-1)", background: "rgba(8,8,10,.8)", color: "var(--c-good)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>✦ {rendered}</span>}
        </div>
        <div style={{ padding: "8px 10px 9px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SCENE {s.number}</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 4, display: "flex", gap: 8 }}>
            <span>{list.length} SHOTS</span>
            {approved > 0 && <span style={{ color: "var(--c-good)" }}>{approved} APPROVED</span>}
            {share !== null && <span style={{ color: "var(--c-amber)", marginLeft: "auto" }}>{share}% OF VIEWERS</span>}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,.84)", backdropFilter: "blur(10px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(1240px, 100%)", height: "100%",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>Branch map</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>
              EVERY PATH THE FILM CAN TAKE · {totalPaths} POSSIBLE CUT{totalPaths === 1 ? "" : "S"} · CLICK ANY NODE TO EDIT IT
            </div>
          </div>
          <div style={{ flex: 1 }}/>
          {boardChoices > 0 && (
            <div style={{ textAlign: "right", paddingRight: 14 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-good)", lineHeight: 1 }}>${boardRoyalty.toFixed(2)}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>BRANCH ROYALTIES · {boardChoices} VIEWER CHOICE{boardChoices === 1 ? "" : "S"}</div>
            </div>
          )}
          {audTemper && (
            <div style={{ textAlign: "right", paddingRight: 14 }} title="Computed from every recorded viewer choice: dominant path letter + share of votes cast against the room's lead">
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)", lineHeight: 1 }}>{AUD_WORDS[audTemper.dom]} {audTemper.domPct}%</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>YOUR AUDIENCE{audTemper.contrarian > 0 ? ` · ${audTemper.contrarian}% VOTE AGAINST THE ROOM` : ""}</div>
            </div>
          )}
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close" title="Close"><Icon name="x" size={12}/></button>
        </div>

        <div className="sc-scroll" style={{ flex: 1, overflow: "auto", padding: "34px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: "max-content" }}>
            {roots.map((root, ri) => {
              const branches = scenes.filter(b => b.branchOf === root.id);
              const isFork = branches.length > 0;
              const stats = isFork ? forkStats(root.id) : null;
              const family = isFork ? [root, ...branches] : null;
              const winner = stats && stats.total > 0
                ? family.map(f => f.branchLabel || "A").sort((a, b) => (stats.by[b] || 0) - (stats.by[a] || 0))[0]
                : null;
              const canon = root.canon || null;
              return (
                <React.Fragment key={root.id}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                    {/* Path A node */}
                    <NodeCard s={root} stats={stats} canon={canon}/>
                    {/* Fork label + alternates below */}
                    {isFork && (
                      <div style={{ marginTop: 12, paddingLeft: 26, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: -12, bottom: 30, width: 1.5, background: "var(--c-amber)", opacity: .45 }}/>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 196 }}>
                          <span className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", whiteSpace: "nowrap" }}>
                            ⑂ VIEWER CHOICE{winner ? ` · PATH ${winner} WINS ${Math.round(((stats.by[winner] || 0) / stats.total) * 100)}%` : " · NO VIEWS YET"}
                          </span>
                          {stats && stats.total > 0 && (
                            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>
                              ${stats.royalty.toFixed(2)} ROYALTIES{stats.minority > 0 ? ` · ${Math.round((stats.minority / stats.total) * 100)}% DEFIED THE ROOM` : ""}
                            </span>
                          )}
                          {winner && canon !== winner && (
                            <button onClick={(e) => { e.stopPropagation(); onSetCanon(root.id, winner); }}
                              className="t-mono"
                              style={{ background: "rgba(106,163,122,.08)", border: "1px solid var(--c-good)", borderRadius: "var(--r-2)", color: "var(--c-good)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "3px 8px", cursor: "pointer", alignSelf: "flex-start", whiteSpace: "nowrap" }}>
                              ★ MAKE PATH {winner} CANON
                            </button>
                          )}
                        </div>
                        {branches.map((b) => (
                          <div key={b.id} style={{ position: "relative" }}>
                            {/* elbow connector from the spine into this branch */}
                            <span style={{
                              position: "absolute", left: -14, top: 0, width: 14, height: "50%",
                              borderLeft: "1.5px solid var(--c-amber)", borderBottom: "1.5px solid var(--c-amber)",
                              borderBottomLeftRadius: 8, opacity: .65,
                            }}/>
                            <NodeCard s={b} isBranch stats={stats} canon={canon}/>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* + branch action under each scene family */}
                    <button onClick={() => onBranch(root.id)}
                      className="t-mono"
                      style={{
                        marginTop: 10, marginLeft: isFork ? 26 : 0, height: 26, borderRadius: "var(--r-2)",
                        border: "1px dashed var(--c-line-2)", background: "transparent",
                        color: "var(--c-ink-4)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer", width: 196,
                      }}>
                      + FORK SCENE {root.number}
                    </button>
                  </div>
                  {ri < roots.length - 1 && (
                    <div style={{ alignSelf: "flex-start", marginTop: 52, padding: "0 10px", color: "var(--c-line-3)", display: "flex", alignItems: "center" }}>
                      <span style={{ width: 18, height: 1.5, background: "var(--c-line-2)", display: "inline-block" }}/>
                      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginLeft: 2 }}>›</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Grid Overlay ───────────────────────────────────────────────────
function GridOverlay({ framesByScene, scenes, activeSceneId, onSelect, onReorder, onMoveAcross, onClose }) {
  const [drag, setDrag] = useStateS(null);
  const [overScene, setOverScene] = useStateS(null);

  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(10px)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(1200px, 100%)", height: "100%",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>All scenes</div>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
            DRAG TO REORDER OR MOVE BETWEEN SCENES
          </span>
          <div style={{ flex: 1 }}/>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close" title="Close"><Icon name="x" size={12}/></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
          {scenes.map(s => {
            const list = framesByScene[s.id] || [];
            const isOver = overScene === s.id && drag && drag.sceneId !== s.id;
            return (
              <div key={s.id}
                onDragOver={e => { e.preventDefault(); setOverScene(s.id); }}
                onDrop={e => {
                  e.preventDefault();
                  if (drag && drag.sceneId !== s.id) onMoveAcross(drag.sceneId, s.id, drag.id);
                  setDrag(null); setOverScene(null);
                }}
                style={{ marginBottom: 28 }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                  padding: "8px 0", borderBottom: `1px solid ${isOver ? "var(--c-amber)" : "var(--c-line)"}`,
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: "var(--r-1)", background: s.color }}/>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
                    SCENE {s.number}{s.branchLabel ? " · PATH " + s.branchLabel : ""}
                  </span>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>
                    {s.title}
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{list.length} shots</span>
                  {isOver && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", marginLeft: "auto" }}>DROP HERE</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {list.length === 0 && (
                    <div style={{
                      aspectRatio: "16/9", border: "1.5px dashed var(--c-line)",
                      borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--c-ink-4)", fontSize: "var(--fs-label)",
                    }}>No shots</div>
                  )}
                  {list.map((f, i) => (
                    <div
                      key={f.id}
                      draggable
                      onDragStart={() => setDrag({ id: f.id, sceneId: s.id })}
                      onDragEnd={() => { setDrag(null); setOverScene(null); }}
                      onDragOver={e => { e.preventDefault(); }}
                      onDrop={e => {
                        e.preventDefault(); e.stopPropagation();
                        if (drag && drag.id !== f.id) {
                          if (drag.sceneId === s.id) onReorder(s.id, drag.id, f.id);
                          else onMoveAcross(drag.sceneId, s.id, drag.id);
                        }
                        setDrag(null); setOverScene(null);
                      }}
                      onClick={() => onSelect(f.id, s.id)}
                      style={{
                        position: "relative", borderRadius: "var(--r-2)", overflow: "hidden",
                        border: "1px solid var(--c-line-2)",
                        cursor: drag?.id === f.id ? "grabbing" : "grab",
                        opacity: drag?.id === f.id ? 0.4 : 1,
                        background: tkc("bg"),
                      }}
                    >
                      <div style={{ aspectRatio: "16/9", position: "relative" }}><BoardStill frame={f}/></div>
                      <div style={{
                        position: "absolute", top: 4, left: 4,
                        padding: "1px 5px", background: "rgba(0,0,0,.7)",
                        borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
                      }}>{String(i + 1).padStart(2, "0")}</div>
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "6px 8px",
                        background: "linear-gradient(to top, rgba(0,0,0,.85), transparent)",
                        fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{f.scene}{f.shot} · {f.lens}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Frame card (with hover actions) ───────────────────────────────
function Frame({ frame, index, selected, checked, bulkActive, onToggleCheck, dragOver, onSelect, onDragStart, onDragOver, onDrop, onDragEnd,
                 onReplace, onVariants, onInsertAfter, onDuplicate, onDelete, onApprove }) {
  const [hover, setHover] = useStateS(false);
  return (
    <div
      draggable
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      style={{
        flex: "0 0 176px", position: "relative",
        cursor: "grab",
        opacity: dragOver ? 0.5 : 1,
        transform: selected ? "translateY(-2px)" : "none",
        transition: "transform .15s ease",
        outline: checked ? "2px solid var(--c-amber)" : "none",
        outlineOffset: 2, borderRadius: "var(--r-2)",
      }}
    >
      {(hover || checked || bulkActive) && (
        <button
          onClick={onToggleCheck}
          title={checked ? "Deselect" : "Select"}
          style={{
            position: "absolute", top: 22, left: 6, zIndex: 3,
            width: 18, height: 18, borderRadius: "var(--r-2)",
            background: checked ? "var(--c-amber)" : "rgba(8,8,10,.85)",
            border: `1px solid ${checked ? "var(--c-amber)" : "var(--c-line-2)"}`,
            color: checked ? tkc("bg") : "var(--c-ink-2)",
            cursor: "pointer", fontSize: "var(--fs-label)", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >{checked ? "✓" : ""}</button>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 5, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
        letterSpacing: ".08em",
      }}>
        <span style={{ fontWeight: 700, color: selected ? "var(--c-amber)" : "var(--c-ink-2)" }}>{frame.scene}{frame.shot}</span>
        <span style={{ color: "var(--c-ink-4)" }}>{frame.type}</span>
        <span style={{ marginLeft: "auto", color: "var(--c-ink-4)" }}>{frame.duration}</span>
      </div>
      <div style={{
        position: "relative", height: 96,
        borderRadius: "var(--r-2)", overflow: "hidden",
        border: selected ? "1.5px solid var(--c-amber)" : "1px solid var(--c-line-2)",
        boxShadow: selected ? "0 0 0 4px rgba(217,151,87,.15)" : "0 1px 2px rgba(0,0,0,.3)",
        background: "var(--c-void)",
      }}>
        <BoardStill frame={frame}/>
        <div style={{
          position: "absolute", top: 6, left: 6,
          padding: "2px 6px", borderRadius: "var(--r-1)",
          background: selected ? "var(--c-amber)" : "rgba(8,8,10,.78)",
          border: `0.5px solid ${selected ? "var(--c-amber)" : "rgba(255,255,255,.15)"}`,
          color: selected ? tkc("on-amber") : "var(--c-ink-2)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontWeight: 700,
        }}>{String(index + 1).padStart(2, "0")}</div>
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "16px 8px 6px",
          background: "linear-gradient(to top, rgba(8,8,10,.92), transparent)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <ShotStatus status={frame.status} size={9}/>
          <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{frame.lens}</span>
        </div>
        {(frame.history?.length > 0) && (
          <div style={{
            position: "absolute", top: 6, right: 30,
            padding: "1px 5px", borderRadius: "var(--r-1)",
            background: "rgba(8,8,10,.75)", border: "0.5px solid rgba(255,255,255,.15)",
            color: "var(--c-ink-3)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
          }} title={`${frame.history.length} prior versions`}>
            ↻ {frame.history.length}
          </div>
        )}
        {hover && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,.55), transparent 40%, transparent 60%, rgba(0,0,0,.55))",
            pointerEvents: "none",
          }}/>
        )}
        {hover && (
          <div onMouseDown={(e) => e.stopPropagation()} style={{
            position: "absolute", top: 6, right: 6, display: "flex", gap: 4, zIndex: 2,
          }}>
            <HoverIcon title="Duplicate shot" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>⧉</HoverIcon>
            <HoverIcon title="Delete shot" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</HoverIcon>
          </div>
        )}
        {hover && (
          <div onMouseDown={(e) => e.stopPropagation()} style={{
            position: "absolute", left: 4, right: 4, top: "50%", transform: "translateY(-50%)",
            display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", zIndex: 2,
          }}>
            {frame.status === "draft" && <CardAction label="✓ Approve" accent onClick={(e) => { e.stopPropagation(); onApprove(); }}/>}
            <CardAction label="✦ Variants" onClick={(e) => { e.stopPropagation(); onVariants(); }}/>
            <CardAction label="↻ Replace" onClick={(e) => { e.stopPropagation(); onReplace(); }}/>
            <CardAction label="+ Insert" onClick={(e) => { e.stopPropagation(); onInsertAfter(); }}/>
          </div>
        )}
      </div>
      <div style={{
        marginTop: 6, fontSize: "var(--fs-body)", color: selected ? "var(--c-ink)" : "var(--c-ink-2)",
        lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {frame.desc}
      </div>
    </div>
  );
}

function HoverIcon({ children, title, onClick }) {
  return (
    <button title={title} onClick={onClick} onMouseDown={(e) => e.stopPropagation()} style={{
      width: 22, height: 22, borderRadius: "var(--r-2)",
      background: "rgba(0,0,0,.8)", border: "1px solid var(--c-line-2)",
      color: "var(--c-ink-2)", cursor: "pointer", fontSize: "var(--fs-body)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{children}</button>
  );
}

function CardAction({ label, accent, onClick }) {
  return (
    <button onClick={onClick} onMouseDown={(e) => e.stopPropagation()} draggable={false} title={label} style={{
      height: 24, padding: "0 9px", borderRadius: 999,
      background: accent ? "rgba(96,140,105,.92)" : "rgba(8,8,10,.92)",
      border: `1px solid ${accent ? "var(--c-good)" : "var(--c-line-2)"}`,
      color: accent ? tkc("ink") : "var(--c-ink)", cursor: "pointer",
      fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".08em", fontWeight: 600, whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center", backdropFilter: "blur(6px)",
    }}>
      {label}
    </button>
  );
}

// ─── PreviewPane — the live shot preview (fills the hero region) ────
function PreviewPane({ frame, sceneNum, onReplace, onVariants }) {
  const st = SHOT_STATUS[frame.status] || SHOT_STATUS.draft;
  return (
    <div style={{
      aspectRatio: "16/9", width: "100%", maxWidth: "100%",
      position: "relative", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", overflow: "hidden",
      boxShadow: "0 18px 44px rgba(0,0,0,.55)", background: tkc("bg"),
    }}>
      <BoardStill frame={frame}/>
      {/* top + bottom scrims for legibility */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(6,6,9,.62) 0%, transparent 22%, transparent 62%, rgba(6,6,9,.72) 100%)" }}/>

      {/* Slate — top-left */}
      <div style={{ position: "absolute", top: 10, left: 12, right: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".08em", color: "var(--c-amber)" }}>{sceneNum}{frame.shot}</span>
          <span style={{ width: 1, height: 10, background: "rgba(255,255,255,.22)" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(232,227,214,.72)" }}>{frame.type} · {frame.lens} · {frame.duration}</span>
          <span style={{ marginLeft: "auto" }}><ShotStatus status={frame.status} size={9}/></span>
        </div>
        <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", color: "var(--c-ink)", marginTop: 5, textShadow: "0 2px 12px rgba(0,0,0,.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          "{frame.desc.split(".")[0]}."
        </div>
      </div>

      {/* Transport — bottom */}
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <button className="btn btn-icon" style={{ background: "rgba(8,8,10,.7)", backdropFilter: "blur(6px)" }}><Icon name="play" size={12}/></button>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.14)", borderRadius: "var(--r-1)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "32%", background: "var(--c-amber)", borderRadius: "var(--r-1)" }}/>
          <div style={{ position: "absolute", left: "32%", top: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: "var(--c-ink)", border: "1px solid var(--c-amber-d)", boxShadow: "0 0 8px rgba(0,0,0,.6)" }}/>
        </div>
        <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>00:01 / {frame.duration}</span>
      </div>
    </div>
  );
}

// ─── SpecsPane — docked inspector for the selected shot ────────────
function SpecsPane({ frame, sceneNum, onPatch, onReplace, onVariants, onInsertAfter, onRevert, onRender }) {
  return (
    <>
      <div style={{ padding: "13px 20px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>
          {sceneNum ? `${sceneNum}${frame.shot}` : frame.shot} · {frame.type}
        </span>
        <span style={{ flex: 1 }}/>
        <ShotStatus status={frame.status}/>
      </div>
      <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 22px" }}>
        {/* Editable specs */}
        <div className="t-label" style={{ marginBottom: 10 }}>Shot specs</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <Field label="TYPE">
            <select value={frame.type} onChange={e => onPatch({ type: e.target.value })} style={selStyle}>
              {SHOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="LENS">
            <select value={frame.lens} onChange={e => onPatch({ lens: e.target.value })} style={selStyle}>
              {LENS_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="DURATION">
            <select value={frame.duration} onChange={e => onPatch({ duration: e.target.value })} style={selStyle}>
              {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="STATUS">
            <select value={frame.status} onChange={e => onPatch({ status: e.target.value })} style={selStyle}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        {/* Direction (editable) */}
        <div style={{ borderTop: "1px solid var(--c-line)", marginTop: 16, paddingTop: 14 }}>
        <div className="t-label" style={{ marginBottom: 8 }}>Direction</div>
        <textarea
          value={frame.desc}
          onChange={e => onPatch({ desc: e.target.value })}
          rows={3}
          style={{
            width: "100%", padding: "10px 12px",
            background: "var(--c-bg)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)", color: "var(--c-ink)",
            fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", lineHeight: 1.5, outline: "none", resize: "vertical",
          }}
        />
        </div>

        {/* Variant history */}
        {frame.history?.length > 0 && (
          <div style={{ borderTop: "1px solid var(--c-line)", marginTop: 16, paddingTop: 14 }}>
            <div className="t-label" style={{ marginBottom: 8 }}>
              Version history <span style={{ color: "var(--c-ink-4)", textTransform: "none", letterSpacing: 0 }}>· {frame.history.length} prior</span>
            </div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
              {frame.history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => onRevert(i)}
                  title="Click to revert to this version"
                  style={{
                    flex: "0 0 96px", aspectRatio: "16/9",
                    borderRadius: "var(--r-2)", overflow: "hidden", padding: 0, position: "relative",
                    border: "1px solid var(--c-line)", cursor: "pointer", background: tkc("bg"),
                  }}
                >
                  <BoardStill frame={{ ...h, id: frame.id + "_h" + i, type: frame.type }}/>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "2px 5px", background: "linear-gradient(to top, rgba(0,0,0,.85), transparent)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
                  }}>↻ revert</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Routing */}
        <div style={{ borderTop: "1px solid var(--c-line)", marginTop: 16, paddingTop: 14 }}>
        <div className="t-label" style={{ marginBottom: 10 }}>Routing</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <RouteRow model="Veo-3" pct={68} hint="motion · primary"/>
          <RouteRow model="Kling-2" pct={22} hint="identity · backup"/>
          <RouteRow model="Runway" pct={10} hint="dialog · standby"/>
        </div>
        </div>

        {/* Actions — status-gated: draft → approve → render → cut */}
        <div style={{ display: "flex", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--c-line)" }}>
          {frame.status === "draft" && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onPatch({ status: "approved" })}>
              <Icon name="check" size={11}/>Approve shot
            </button>
          )}
          {frame.status === "approved" && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={onRender}>
              <Icon name="film" size={11}/>Render to video
            </button>
          )}
          {(frame.status === "queued" || frame.status === "rendering") && (
            <button className="btn btn-primary" style={{ flex: 1, opacity: .55, cursor: "progress" }} disabled>
              <Icon name="film" size={11}/>{frame.status === "queued" ? "Queued…" : "Rendering…"}
            </button>
          )}
          {frame.status === "rendered" && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => goBoardView("editor")}>
              <Icon name="film" size={11}/>Open in Editor →
            </button>
          )}
          <button className="btn btn-ghost" onClick={onInsertAfter}>
            <Icon name="plus" size={11}/>Insert after
          </button>
        </div>
        {frame.status === "draft" && (
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 8 }}>APPROVING UNLOCKS RENDER · EVERYTHING STAYS EDITABLE AFTER</div>
        )}
        {frame.status === "rendered" && (
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".08em", marginTop: 8 }}>✓ TAKE SENT TO RENDER — RE-RENDER ANY TIME BY SETTING STATUS BACK TO APPROVED</div>
        )}
      </div>
    </>
  );
}

function RouteRow({ model, pct, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--fs-body)" }}>
      <span className="t-mono" style={{ width: 70, color: "var(--c-ink-2)", fontWeight: 500 }}>{model}</span>
      <div style={{ flex: 1, height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--c-amber)" }}/>
      </div>
      <span className="t-mono" style={{ width: 34, textAlign: "right", color: "var(--c-ink-2)", fontSize: "var(--fs-label)" }}>{pct}%</span>
      <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", fontFamily: "var(--f-mono)", whiteSpace: "nowrap" }}>{hint}</span>
    </div>
  );
}

Object.assign(window, { StoryboardPanel });

// ─── Coverage Bar ────────────────────────────────────────────────────────────────
function CoverageBar({ coverage, total }) {
  const segments = [
    { key: "WIDE",   color: tkc("cat-1"), count: coverage.WIDE },
    { key: "MEDIUM", color: tkc("ink-3"), count: coverage.MEDIUM },
    { key: "CLOSE",  color: tkc("amber-d"), count: coverage.CLOSE },
    { key: "OTHER",  color: tkc("ink-4"), count: coverage.OTHER },
  ].filter(s => s.count > 0);
  return (
    <div style={{
      padding: "0 24px 10px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
    }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>COVERAGE</span>
      <div style={{ flex: "0 0 180px", height: 3, display: "flex", borderRadius: "var(--r-1)", overflow: "hidden", background: "var(--c-line)", gap: 1 }}>
        {segments.map(s => (
          <div key={s.key} title={`${s.key}: ${s.count}`} style={{
            width: `${(s.count / total) * 100}%`, background: s.color,
          }}/>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".08em" }}>
        {segments.map(s => (
          <span key={s.key} style={{ color: "var(--c-ink-4)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "var(--r-1)", background: s.color }}/>
            {s.key} <span style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Bulk Bar ──────────────────────────────────────────────────────────────────────
function BulkBar({ count, onApprove, onRegen, onDelete, onClear }) {
  return (
    <div style={{
      margin: "0 24px 12px", padding: "10px 14px",
      background: "var(--c-panel-2)", border: "1px solid var(--c-amber)",
      borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,.4)",
    }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>
        {count} SELECTED
      </span>
      <div style={{ width: 1, height: 18, background: "var(--c-line-2)" }}/>
      <button className="btn btn-ghost" onClick={onApprove}>
        <Icon name="check" size={11}/>Approve all
      </button>
      <button className="btn btn-ghost" onClick={onRegen}>
        <Icon name="sparkles" size={11}/>Regenerate
      </button>
      <button className="btn btn-ghost" onClick={onDelete} style={{ color: tkc("bad") }}>
        <Icon name="x" size={11}/>Delete
      </button>
      <div style={{ flex: 1 }}/>
      <button className="btn btn-ghost" onClick={onClear}>Clear</button>
    </div>
  );
}

// ─── BoardEmpty — first-run / empty scene ───────────────────────────
function BoardEmpty({ onGenerate, onSeries }) {
  return (
    <div style={{ minHeight: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 470, textAlign: "center", padding: "40px 32px", border: "1.5px dashed var(--c-line-2)", borderRadius: "var(--r-3)", background: "var(--c-panel)" }}>
        <div style={{ display: "inline-flex", width: 46, height: 46, borderRadius: "var(--r-3)", alignItems: "center", justifyContent: "center", background: "var(--c-amber-tint)", color: "var(--c-amber)", marginBottom: 14 }}>
          <Icon name="film" size={22}/>
        </div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>This scene is a blank slate.</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8, lineHeight: 1.55 }}>
          Describe a shot and Cina generates it — or let Cina draft a whole beat (a wide, a medium and a close) in one pass.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <button className="btn btn-primary" onClick={onGenerate} style={{ height: 38, padding: "0 16px" }}><Icon name="sparkles" size={13}/>Generate a shot</button>
          <button className="btn btn-ghost" onClick={onSeries} style={{ height: 38, padding: "0 16px" }}><Icon name="film" size={13}/>Auto-board the scene</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cina copilot — plain-language asks + one-click automations ─────
function coverageAdvice(coverage, frames) {
  if (!frames.length) return { tone: "dim", text: "No shots yet. Ask Cina or auto-board to begin." };
  if (coverage.CLOSE === 0) return { tone: "warn", text: "No close-ups — the scene may feel distant. Add one for the emotional beat." };
  if (coverage.WIDE === 0) return { tone: "warn", text: "No wide shot — the audience can't place the space. Add an establishing wide." };
  if (coverage.MEDIUM === 0) return { tone: "warn", text: "No medium — dialogue has nowhere comfortable to sit." };
  return { tone: "good", text: "Coverage is balanced: wide, medium and close are all present." };
}

function CinaCopilot({ open, onToggle, scene, frames, coverage, selected, onAsk, onAutoBoard, onFillGaps, onSuggestNext, onApplyLook, onAutoApprove, onRebalance, onRenderAll, onStudio, onFrameLab, onWalk }) {
  const [q, setQ] = useStateS("");
  const drafts = frames.filter(f => f.status === "draft").length;
  const approved = frames.filter(f => f.status === "approved").length;
  const advice = coverageAdvice(coverage, frames);
  const adviceColor = advice.tone === "warn" ? "var(--c-warn)" : advice.tone === "good" ? "var(--c-good)" : "var(--c-ink-4)";

  if (!open) {
    return (
      <div style={{ width: 44, flexShrink: 0, borderRight: "1px solid var(--c-line)", background: "var(--c-panel)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, gap: 12 }}>
        <button className="btn btn-icon btn-ghost" title="Open Cina copilot" onClick={onToggle}><Icon name="sparkles" size={14}/></button>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginTop: 6 }}>CINA COPILOT</div>
      </div>
    );
  }

  const auto = [
    { icon: "sparkles", title: "4K Frame Lab (Gemini)", sub: "Generate real 4K still on selected card", onClick: onFrameLab },
    { icon: "film",   title: "Auto-board scene",   sub: "Draft a wide → medium → close beat", onClick: onAutoBoard },
    { icon: "grid",   title: "Fill coverage gaps", sub: "Add the shot sizes you're missing", onClick: onFillGaps },
    { icon: "wand",   title: "Suggest next shot",  sub: "Cina proposes the cut that follows", onClick: onSuggestNext },
    { icon: "sparkles", title: "Generate in studio", sub: selected ? `Open ${selected.scene}${selected.shot} in the render studio` : "Select a shot first", onClick: onStudio },
    { icon: "check",  title: "Approve all drafts", sub: drafts ? `${drafts} draft${drafts > 1 ? "s" : ""} waiting` : "Nothing in draft", onClick: onAutoApprove },
    { icon: "clock",  title: "Rebalance pacing",   sub: "Tune every duration to shot size", onClick: onRebalance },
    { icon: "film",   title: "Render approved",    sub: approved ? `${approved} ready to render` : "Approve shots first", onClick: onRenderAll },
  ];

  return (
    <aside data-tour="copilot" style={{ width: 268, flexShrink: 0, borderRight: "1px solid var(--c-line)", background: "var(--c-panel)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)" }}/>
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Cina</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>COPILOT</span>
        <span style={{ flex: 1 }}/>
        <button className="btn btn-icon btn-ghost" title="Collapse" onClick={onToggle}><Icon name="chev-l" size={13}/></button>
      </div>

      <div className="sc-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px 20px" }}>
        <textarea
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { onAsk(q); setQ(""); } }}
          placeholder="Ask Cina to board this scene… e.g. “add a reaction close-up after the door opens”"
          rows={3}
          style={{ width: "100%", padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", lineHeight: 1.5, outline: "none", resize: "vertical" }}
        />
        <button className="btn btn-primary" style={{ width: "100%", height: 34, marginTop: 8 }} onClick={() => { onAsk(q); setQ(""); }} disabled={!q.trim()}>
          <Icon name="sparkles" size={12}/>Ask Cina
        </button>

        <div style={{ marginTop: 16, padding: "11px 12px", borderRadius: "var(--r-2)", background: "var(--c-bg)", border: "1px solid var(--c-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <Icon name="alert" size={11}/>
            <span className="t-label" style={{ color: "var(--c-ink-3)" }}>COVERAGE READ</span>
          </div>
          <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: adviceColor }}>{advice.text}</div>
          {advice.tone === "warn" && (
            <button className="btn btn-ghost" style={{ height: 26, marginTop: 8, fontSize: "var(--fs-label)" }} onClick={onFillGaps}><Icon name="plus" size={10}/>Fix it</button>
          )}
        </div>

        <div className="t-label" style={{ margin: "18px 0 9px", color: "var(--c-ink-4)" }}>AUTOMATIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {auto.map(a => (
            <button key={a.title} onClick={a.onClick} style={{
              display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              padding: "9px 11px", borderRadius: "var(--r-2)", cursor: "pointer",
              background: "var(--c-bg)", border: "1px solid var(--c-line)", color: "var(--c-ink)",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.background = "var(--c-panel-2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-bg)"; }}
            >
              <span style={{ width: 26, height: 26, borderRadius: "var(--r-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-amber-tint)", color: "var(--c-amber)" }}>
                <Icon name={a.icon} size={13}/>
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{a.title}</span>
                <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 1 }}>{a.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="t-label" style={{ margin: "18px 0 9px", color: "var(--c-ink-4)" }}>APPLY A LOOK TO ALL</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STYLE_PRESETS.map(p => (
            <button key={p.id} onClick={() => onApplyLook(p.id)} title={p.hint} style={{
              padding: "6px 10px", borderRadius: 999, cursor: "pointer",
              background: "var(--c-bg)", border: "1px solid var(--c-line)", color: "var(--c-ink-2)", fontSize: "var(--fs-label)",
            }}>{p.label}</button>
          ))}
        </div>

        <button className="btn btn-ghost" style={{ width: "100%", height: 32, marginTop: 20 }} onClick={onWalk}>
          <Icon name="book" size={12}/>Replay walkthrough
        </button>
      </div>
    </aside>
  );
}

// ─── BoardCard — a large, fully-wired shot card ─────────────────────
function SbCardBtn({ children, primary, disabled, onClick, title }) {
  return (
    <button title={title} disabled={disabled} draggable={false}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); if (!disabled && onClick) onClick(); }}
      className={primary ? "btn btn-primary" : "btn btn-ghost"}
      style={{ height: 28, padding: "0 10px", fontSize: "var(--fs-label)", ...(disabled ? { opacity: .55, cursor: "progress" } : {}) }}>
      {children}
    </button>
  );
}
function SbIconBtn({ children, onClick, title }) {
  return (
    <button title={title} draggable={false}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick && onClick(); }}
      style={{ width: 28, height: 28, borderRadius: "var(--r-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--c-bg)", border: "1px solid var(--c-line)", color: "var(--c-ink-2)", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.color = "var(--c-amber)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.color = "var(--c-ink-2)"; }}>
      {children}
    </button>
  );
}
function SbStillTool({ children, title, onClick }) {
  return (
    <button title={title} draggable={false} onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onClick && onClick(); }} style={{
      width: 24, height: 24, borderRadius: "var(--r-2)", background: "rgba(8,8,10,.82)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)", cursor: "pointer", fontSize: "var(--fs-body)", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)",
    }}>{children}</button>
  );
}

function BoardCard({ frame, index, selected, checked, bulkActive, onToggleCheck, dragOver, onSelect, onExpand, onDragStart, onDragOver, onDrop, onDragEnd, onReplace, onVariants, onInsertAfter, onDuplicate, onDelete, onApprove, onRender, onStudio, onEditor }) {
  const [hover, setHover] = useStateS(false);
  const isDraft = frame.status === "draft";
  const isApproved = frame.status === "approved";
  const isRendered = frame.status === "rendered";
  const busy = frame.status === "queued" || frame.status === "rendering";
  const showTools = hover && !busy;
  return (
    <div draggable
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      onClick={onSelect}
      style={{
        position: "relative", borderRadius: "var(--r-3)", overflow: "hidden", cursor: "grab",
        background: "var(--c-panel)",
        border: selected ? "1.5px solid var(--c-amber)" : "1px solid var(--c-line-2)",
        boxShadow: selected ? "0 0 0 4px rgba(var(--accent-rgb),.14), 0 10px 26px rgba(0,0,0,.42)" : "0 2px 8px rgba(0,0,0,.3)",
        opacity: dragOver ? .5 : 1, outline: checked ? "2px solid var(--c-amber)" : "none", outlineOffset: 2,
        transition: "transform .14s ease, box-shadow .14s ease",
        transform: selected ? "translateY(-2px)" : "none",
      }}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: tkc("bg") }}>
        <BoardStill frame={frame}/>

        {(hover || checked || bulkActive) && (
          <button onClick={onToggleCheck} onMouseDown={e => e.stopPropagation()} title={checked ? "Deselect" : "Select"} style={{
            position: "absolute", top: 8, left: 8, zIndex: 4, width: 20, height: 20, borderRadius: "var(--r-2)",
            background: checked ? "var(--c-amber)" : "rgba(8,8,10,.82)", border: `1px solid ${checked ? "var(--c-amber)" : "var(--c-line-2)"}`,
            color: checked ? tkc("bg") : "var(--c-ink-2)", cursor: "pointer", fontSize: "var(--fs-body)", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{checked ? "✓" : ""}</button>
        )}

        {/* slate — shifts right when checkbox shows so they never overlap */}
        <div style={{ position: "absolute", top: 8, left: (hover || checked || bulkActive) ? 34 : 8, display: "flex", gap: 5, alignItems: "center", transition: "left .12s ease" }}>
          <span style={{ padding: "2px 7px", borderRadius: "var(--r-2)", background: selected ? "var(--c-amber)" : "rgba(8,8,10,.82)", color: selected ? tkc("on-amber") : "var(--c-ink)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".08em" }}>{frame.scene}{frame.shot}</span>
          <span style={{ padding: "2px 6px", borderRadius: "var(--r-2)", background: "rgba(8,8,10,.7)", color: "var(--c-ink-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em" }}>{frame.type}</span>
        </div>

        {/* top-right: badges when idle, tools on hover — swapped so no overlap */}
        {!showTools && (
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 5, alignItems: "center" }}>
            {frame.history?.length > 0 && (
              <span title={`${frame.history.length} prior versions`} style={{ padding: "2px 6px", borderRadius: "var(--r-2)", background: "rgba(8,8,10,.7)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>↻ {frame.history.length}</span>
            )}
            <span style={{ padding: "2px 6px", borderRadius: "var(--r-2)", background: "rgba(8,8,10,.7)", color: "var(--c-ink-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>{frame.duration}</span>
          </div>
        )}
        {showTools && (
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4, zIndex: 4 }}>
            <SbStillTool title="Open full-frame" onClick={onExpand}><Icon name="search" size={12}/></SbStillTool>
            <SbStillTool title="Duplicate" onClick={onDuplicate}>⧉</SbStillTool>
            <SbStillTool title="Delete" onClick={onDelete}>×</SbStillTool>
          </div>
        )}

        {/* status */}
        <div style={{ position: "absolute", left: 8, bottom: 8 }}>
          <span style={{ padding: "3px 7px", borderRadius: "var(--r-2)", background: "rgba(8,8,10,.72)", display: "inline-flex" }}><ShotStatus status={frame.status} size={9}/></span>
        </div>
        {!showTools && (
          <div style={{ position: "absolute", right: 8, bottom: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.7)" }}>{frame.lens}</div>
        )}

        {busy && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(8,8,10,.55)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backdropFilter: "blur(2px)" }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--c-amber)", borderTopColor: "transparent", animation: "sbSpin 0.8s linear infinite" }}/>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{frame.status === "queued" ? "QUEUED" : "RENDERING"}…</span>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 12px 11px" }}>
        <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.4, color: selected ? "var(--c-ink)" : "var(--c-ink-2)", minHeight: 35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{frame.desc}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
          {isDraft && <SbCardBtn primary onClick={onApprove} title="Approve — unlocks render"><Icon name="check" size={11}/>Approve</SbCardBtn>}
          {isApproved && <SbCardBtn primary onClick={onRender} title="Render this shot to video"><Icon name="film" size={11}/>Render</SbCardBtn>}
          {busy && <SbCardBtn primary disabled><Icon name="film" size={11}/>{frame.status === "queued" ? "Queued…" : "Rendering…"}</SbCardBtn>}
          {isRendered && <SbCardBtn primary onClick={onEditor} title="Open in the Editor"><Icon name="film" size={11}/>In Editor</SbCardBtn>}
          <div style={{ flex: 1 }}/>
          <SbIconBtn title="Generate in studio" onClick={onStudio}><Icon name="sparkles" size={13}/></SbIconBtn>
          <SbIconBtn title="Replace shot" onClick={onReplace}><Icon name="shuffle" size={13}/></SbIconBtn>
          <SbIconBtn title="Insert shot after" onClick={onInsertAfter}><Icon name="plus" size={13}/></SbIconBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Storyboard walkthrough — coach the whole page ──────────────────
function WalkSchematic({ region }) {
  const hi = (r) => region === r || region === "all";
  const box = (active) => ({ background: active ? "var(--c-amber-tint)" : "var(--c-bg)", border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`, borderRadius: "var(--r-2)" });
  return (
    <div style={{ width: "100%", aspectRatio: "16/7", borderRadius: "var(--r-2)", border: "1px solid var(--c-line)", background: "var(--c-panel-2)", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ height: 20, ...box(hi("top")), display: "flex", alignItems: "center", padding: "0 8px", gap: 6 }}>
        <span style={{ width: 22, height: 6, borderRadius: "var(--r-1)", background: hi("top") ? "var(--c-amber)" : "var(--c-line-3)" }}/>
        <span style={{ width: 34, height: 6, borderRadius: "var(--r-1)", background: hi("top") ? "var(--c-amber)" : "var(--c-line-2)" }}/>
      </div>
      <div style={{ flex: 1, display: "flex", gap: 6, minHeight: 0 }}>
        <div style={{ width: "22%", ...box(hi("copilot")) }}/>
        <div style={{ flex: 1, ...box(hi("grid")), display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 5 }}>
          {[0, 1, 2, 3].map(k => <div key={k} style={{ borderRadius: "var(--r-1)", background: hi("grid") ? "rgba(var(--accent-rgb),.5)" : "var(--c-line-2)" }}/>)}
        </div>
        <div style={{ width: "26%", ...box(hi("inspector")) }}/>
      </div>
    </div>
  );
}

function StoryboardWalkthrough({ onClose }) {
  const steps = [
  { region: "all", title: "This is your board.", body: "Every card is one shot. The whole scene lives here as a grid — Cina's copilot on the left, the selected shot's specs on the right." },
  { region: "copilot", title: "Ask Cina, or automate.", body: "Type a plain-language request, or use one-click automations: auto-board a scene, fill coverage gaps, suggest the next cut, rebalance pacing, or render every approved shot at once." },
  { region: "grid", title: "Every shot is wired.", body: "Generate variants, replace, or insert right from a card. Drag to reorder. Click a card to select it; the ⤢ opens it full-frame. “Generate in studio” carries the shot — prompt, specs and reference frame — into the render studio." },
  { region: "inspector", title: "Draft → Approve → Render → Cut.", body: "Tune type, lens, duration and direction. Approve to unlock render; a rendered take hands straight to the Editor. Nothing locks — every step stays editable." },
  { region: "top", title: "Scenes & branching.", body: "Tabs switch scenes. Fork any scene into alternate paths, then open the Branch map to see every cut your audience can take — and which one they choose." },
];
  return <CinaTour id="board" steps={steps.map(s => ({ target: s.region && s.region !== "all" ? `[data-tour-region="${s.region}"]` : null, title: s.title, body: s.body }))} onDone={onClose}/>;
}

// Spin keyframes for rendering cards.
(function () {
  if (typeof document !== "undefined" && !document.getElementById("sb-anim")) {
    const s = document.createElement("style");
    s.id = "sb-anim";
    s.textContent = "@keyframes sbSpin { to { transform: rotate(360deg) } }";
    document.head.appendChild(s);
  }
})();
