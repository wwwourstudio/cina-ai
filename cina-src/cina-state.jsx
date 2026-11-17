// cina-state.jsx — Cina Studio shared state.
// Single STUDIO object holds the live project + workflow state.
// All views read via useStudio(), mutate via the helpers below.
// Persists per-project to localStorage (cina:state:<projectId>).

const { useState: usSt, useEffect: ueSt } = React;

const _stSubs = new Set();
function bumpStudio() { _stSubs.forEach(fn => fn(Date.now())); }

function useStudio() {
  const [, setT] = usSt(0);
  ueSt(() => { _stSubs.add(setT); return () => _stSubs.delete(setT); }, []);
  return window.STUDIO;
}

const _stKey = (id) => `cina:state:${id}`;
function _stLoad(id, init) {
  try { const s = localStorage.getItem(_stKey(id)); return s ? { ...init, ...JSON.parse(s) } : init; } catch { return init; }
}
function _stSave(id, v) { try { localStorage.setItem(_stKey(id), JSON.stringify(v)); } catch {} }

// ─── Initial project workspace ──────────────────────────────────────
function _emptyWorkspace() {
  return {
    // Script
    scriptScenes: window.SCRIPT_SCENES ? JSON.parse(JSON.stringify(window.SCRIPT_SCENES)) : [],
    scriptStage:  "writing", // writing | table-read | revision | locked
    tableRead:    { played: false, notes: [] },
    revisions:    [],

    // Storyboard
    board:        window.STORYBOARD ? JSON.parse(JSON.stringify(window.STORYBOARD)) : [],
    boardRatio:   "2.39:1",  // 2.39:1 | 16:9 | 4:3
    beats:        [
      { id: "b1", title: "Voss returns home, can't sleep",        scenes: ["12","13"], status: "locked" },
      { id: "b2", title: "The darkroom — the photograph appears", scenes: ["14"],      status: "active" },
      { id: "b3", title: "He decides not to make the call",       scenes: ["14"],      status: "draft" },
      { id: "b4", title: "Dawn — he goes east",                   scenes: ["15"],      status: "draft" },
    ],

    // Generate
    renders:      window.GEN_HISTORY ? JSON.parse(JSON.stringify(window.GEN_HISTORY)) : [],
    activeShot:   "14E",
    queue:        [], // scheduled renders not yet running

    // Editor
    cut:          "rough", // rough | fine | final
    editorNotes:  [
      { id: "n1", t: 18.5, by: "editor",   text: "14D holds 2 frames too long — pull head.",  resolved: false },
      { id: "n2", t: 32.4, by: "director", text: "Tighten the gap between INSERT and phone.", resolved: false },
    ],

    // Score
    score:        {
      stage: "brief", // brief | composer | mix | master
      brief: "Cold, deliberate. 62 bpm. Sodium hum as drone. No score during dialogue.",
      style: "minimal-electronic",
      tracks: [
        { id: "sc-pad",   label: "Ambient pad",   ver: 2, status: "approved" },
        { id: "sc-perc",  label: "Soft perc",     ver: 1, status: "draft"    },
        { id: "sc-theme", label: "Voss theme",    ver: 0, status: "queued"   },
      ],
      mixStems: 0, // 0..1
      master: false,
    },

    // Vault
    vault:        [
      { id: "v1", kind: "ref",    name: "Se7en — opening rooftop",     tags: ["rain","sodium","reference"], used: 3 },
      { id: "v2", kind: "ref",    name: "Klute — darkroom safelight",  tags: ["darkroom","lighting"],       used: 7 },
      { id: "v3", kind: "loc",    name: "user-upload-0341.jpg",        tags: ["voss-bldg","exterior"],       used: 2 },
      { id: "v4", kind: "char",   name: "Voss · v7 likeness",          tags: ["character","voss"],           used: 12 },
      { id: "v5", kind: "char",   name: "Maren · v3 likeness",         tags: ["character","maren"],          used: 4 },
      { id: "v6", kind: "shot",   name: "14C · developer · master",    tags: ["shot","approved"],            used: 1 },
    ],
    vaultIngest:  [], // recently ingested

    // Autopilot
    autopilot:    {
      autonomy: "supervised", // manual | supervised | full
      brief:    "",
      plan:     [],           // [{step, agent, eta, status}]
      runs:     [],           // [{id, started, finished, log:[...]}]
      running:  false,
    },

    // Publish
    publish:     {
      stage: "draft", // draft | review | mastered | live
      master: null,
      distribution: { watch: false, pitch: false },
      releaseDate: null,
    },

    // Activity
    activity:    window.ACTIVITY ? window.ACTIVITY.slice() : [],
    pinned:      [],

    // Memory
    memory:      [
      { id: "m1", topic: "Visual rules",    when: Date.now()-1000*60*60*48, body: "No handheld. Practical light only. One-side face lighting." },
      { id: "m2", topic: "Red rule",        when: Date.now()-1000*60*60*30, body: "Red appears 7 times total. Used: 4. Remaining: 3." },
      { id: "m3", topic: "Dialogue silence",when: Date.now()-1000*60*60*8,  body: "Director: cut dialogue tag on 14D. He says nothing." },
      { id: "m4", topic: "DNA balance",     when: Date.now()-1000*60*30,    body: "Fincher 42% / Hitchcock 28% / Nolan 18% / Kubrick 12%." },
    ],
  };
}

// ─── Build live STUDIO ──────────────────────────────────────────────
const _projects = (window.PROJECTS || []).slice();
const _projectStates = {};
_projects.forEach(p => { _projectStates[p.id] = _stLoad(p.id, _emptyWorkspace()); });

const STUDIO = {
  activeId:  _projects[0]?.id || "p1",
  projects:  _projects,
  workspace: _projectStates,
  // Cross-project session
  shortcuts: { open: false },
  publishing: { open: false, target: null }, // active publish wizard
};

// Round-trip handoff: if Watch (or anywhere) asked to open a specific project
// in Studio, honor it once on boot. Set via localStorage["cina:studio-open"].
try {
  const _want = localStorage.getItem("cina:studio-open");
  if (_want) {
    localStorage.removeItem("cina:studio-open");
    if (STUDIO.projects.some(p => p.id === _want)) STUDIO.activeId = _want;
  }
} catch {}

// ─── Helpers ────────────────────────────────────────────────────────
function getActiveProject() { return STUDIO.projects.find(p => p.id === STUDIO.activeId); }
function getActiveWorkspace() { return STUDIO.workspace[STUDIO.activeId] || _emptyWorkspace(); }
function _saveActive() { _stSave(STUDIO.activeId, getActiveWorkspace()); }
function _patchWorkspace(patch) {
  STUDIO.workspace[STUDIO.activeId] = { ...getActiveWorkspace(), ...patch };
  _saveActive();
  bumpStudio();
}

function pushActivity(agent, text) {
  const w = getActiveWorkspace();
  const a = [{ t: "now", agent, text }, ...(w.activity || [])].slice(0, 80);
  _patchWorkspace({ activity: a });
}

// ─── Project state preset (fresh / mid-production / near-final) ──────
function applyProjectPreset(preset) {
  const w = getActiveWorkspace();
  let next = { ...w };
  if (preset === "fresh") {
    next = {
      ..._emptyWorkspace(),
      scriptStage: "writing",
      board: (w.board || []).map(s => ({ ...s, status: "draft" })),
      renders: [],
      cut: "rough",
      score: { ...w.score, stage: "brief", master: false, mixStems: 0 },
      publish: { stage: "draft", master: null, distribution: { watch: false, pitch: false }, releaseDate: null },
    };
  } else if (preset === "mid") {
    next = {
      ...w,
      scriptStage: "revision",
      board: (w.board || []).map((s, i) => ({ ...s, status: i < 4 ? "approved" : i < 6 ? "review" : "draft" })),
      cut: "rough",
      score: { ...w.score, stage: "composer", mixStems: 0.4, master: false },
      publish: { ...w.publish, stage: "draft" },
    };
  } else if (preset === "near-final") {
    next = {
      ...w,
      scriptStage: "locked",
      board: (w.board || []).map(s => ({ ...s, status: "approved" })),
      renders: (w.renders || []).map(r => ({ ...r, status: "complete", progress: 1 })),
      cut: "fine",
      score: { ...w.score, stage: "mix", mixStems: 0.85, master: false },
      publish: { ...w.publish, stage: "review" },
    };
  }
  _patchWorkspace(next);
  pushActivity("director", `Loaded "${preset}" project state.`);
}

// ─── Publish ────────────────────────────────────────────────────────
function shipMaster({ releaseDate, watch = true, pitch = false }) {
  const w = getActiveWorkspace();
  const project = getActiveProject();

  // ── Close the loop: write a real, Watch-shaped film into the shared
  //    catalog so a film mastered here actually shows up on Watch. ──
  let liveFilm = null;
  if (watch && window.cinaBuildFilmEntry && window.cinaPublishFilm) {
    const logline =
      (window.FILM_BIBLE && project && project.id === "p1" ? window.FILM_BIBLE.logline : null) ||
      (project && project.logline) || null;
    liveFilm = window.cinaBuildFilmEntry(project, w, { logline, releaseDate, watch, pitch });
    window.cinaPublishFilm(liveFilm);
  }

  _patchWorkspace({ publish: {
    stage: "live",
    master: { id: "mst" + Date.now(), at: Date.now() },
    distribution: { watch, pitch },
    releaseDate,
    liveFilmId: liveFilm ? liveFilm.id : (w.publish && w.publish.liveFilmId) || null,
    liveAt: liveFilm ? Date.now() : (w.publish && w.publish.liveAt) || null,
  } });
  pushActivity("director", "Master shipped · published to " + [watch && "Watch", pitch && "Pitch"].filter(Boolean).join(" + "));
  if (window.toast) window.toast({ title: "SHIPPED", text: "Master published" + (releaseDate ? ` · drops ${releaseDate}` : ""), kind: "good" });
}

// ─── Shortcuts overlay ──────────────────────────────────────────────
function toggleShortcuts() { STUDIO.shortcuts.open = !STUDIO.shortcuts.open; bumpStudio(); }
function setShortcuts(open) { STUDIO.shortcuts.open = open; bumpStudio(); }

// ─── Publishing wizard ──────────────────────────────────────────────
function openPublishWizard(target) { STUDIO.publishing = { open: true, target: target || null }; bumpStudio(); }
function closePublishWizard() { STUDIO.publishing = { open: false, target: null }; bumpStudio(); }

// ─── Toast bridge (Cina has its own ToastProvider — fall back) ──────
if (!window.toast) {
  window.toast = function(opts) { window.dispatchEvent(new CustomEvent("cina:toast", { detail: opts })); };
}

Object.assign(window, { STUDIO, useStudio, getActiveProject, getActiveWorkspace, applyProjectPreset, pushActivity, shipMaster, openPublishWizard, closePublishWizard, toggleShortcuts, setShortcuts });
