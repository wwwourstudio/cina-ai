// studio-v2.jsx — Studio v2 workspace. The film stays on screen; every tool docks around it.
// Every legacy view remains reachable as a full sheet (rail ↗, ⌘K, cina:setView).

const { useState: useStateWS, useEffect: useEffectWS, useRef: useRefWS, useMemo: useMemoWS } = React;

(function injectWsCss() {
  if (document.getElementById("ws-css")) return;
  const s = document.createElement("style");
  s.id = "ws-css";
  s.textContent = `@keyframes wsFade{from{opacity:.35}to{opacity:1}}
.ws-ctl{height:32px;min-width:36px;padding:0 10px;border-radius:8px;border:1px solid var(--c-line-2);background:var(--c-panel-2);color:var(--c-ink-2);cursor:pointer;font-size:var(--fs-label);display:inline-flex;align-items:center;justify-content:center}
.ws-ctl:hover{border-color:var(--c-line-3);color:var(--c-ink)}
.ws-ctl--play{height:40px;width:52px;border-radius:20px;background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-size:var(--fs-body)}
.ws-ctl--play:hover{background:var(--c-amber-x);color:var(--c-on-amber)}
.ws-rail{width:40px;height:40px;border-radius:9px;border:none;background:transparent;color:var(--c-ink-3);cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative}
.ws-rail:hover{background:var(--c-panel-2);color:var(--c-ink)}
.ws-rail[data-on="1"]{background:rgba(var(--accent-rgb),.12);color:var(--c-amber)}
.ws-rail .ws-tip{position:absolute;left:48px;top:50%;transform:translateY(-50%);background:var(--c-panel-3);color:var(--c-ink);font-size:var(--fs-body);padding:5px 9px;border-radius:6px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s;z-index:30;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.ws-rail:hover .ws-tip{opacity:1}
.ws-btn{height:32px;padding:0 12px;border-radius:8px;border:1px solid var(--c-line-2);background:var(--c-panel-2);color:var(--c-ink);cursor:pointer;font-family:var(--f-sans);font-size:var(--fs-body);display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.ws-btn:hover{border-color:var(--c-line-3)}
.ws-btn--amber{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-weight:600}
.ws-btn--amber:hover{background:var(--c-amber-x)}
.ws-btn--ghost{background:transparent}
.ws-k{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.16em;color:var(--c-ink-3);text-transform:uppercase}
.ws-scroll::-webkit-scrollbar{width:8px;height:8px}.ws-scroll::-webkit-scrollbar-thumb{background:var(--c-line-2);border-radius:4px}
.ws-chip{height:28px;padding:0 11px;border-radius:14px;border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-2);cursor:pointer;font-size:var(--fs-body);font-family:var(--f-sans);white-space:nowrap}
.ws-chip:hover{border-color:var(--c-amber);color:var(--c-ink)}`;
  document.head.appendChild(s);
})();

// Rail: grouped by stage. dock = compact panel in workspace; otherwise opens the full legacy view.
function wsRail(kind) {
  return [
    { stage: "Write", items: [{ id: "script", label: "Script", icon: "edit", dock: true }, { id: "bible", label: "Story", icon: "book", dock: true }, ...(kind === "series" ? [{ id: "episodes", label: "Episodes", icon: "film" }] : [])] },
    { stage: "Cast", items: [{ id: "vault", label: "Cast", icon: "vault", dock: true }] },
    { stage: "Shots", items: [{ id: "board", label: "Board", icon: "board", dock: true }, { id: "generate", label: "Generate", icon: "sparkles", dock: true }, ...(kind === "branched" ? [{ id: "branch", label: "Branches", icon: "shuffle" }] : [])] },
    { stage: "Edit", items: [{ id: "score", label: "Music", icon: "spark", dock: true }, { id: "titles", label: "Titles", icon: "type", dock: true }, { id: "cuts", label: "Cuts", icon: "grid" }, { id: "editor", label: "Pro editor", icon: "film" }] },
    { stage: "Crew", items: [{ id: "pipeline", label: "Pipeline", icon: "reload" }, { id: "memory", label: "Memory", icon: "clock" }, { id: "autopilot", label: "Autopilot", icon: "wand" }] },
  ];
}

const WS_VIEW_TITLES = { chat: "Director", pipeline: "Pipeline", script: "Script", episodes: "Episodes", board: "Storyboard", generate: "Generate", editor: "Pro editor", branch: "Branches", cuts: "Cuts", score: "Score", mint: "Sell", deliver: "Export", watch: "Preview", bible: "Story", vault: "Cast", titles: "Titles", autopilot: "Autopilot", memory: "Memory" };

function WsLegacyView({ id, kind }) {
  const W = window;
  const map = { chat: W.DirectorHub, pipeline: W.PipelinePanel, script: W.ScriptFlow, episodes: W.EpisodesPanel, board: W.StoryboardPanel, generate: W.GeneratePanel, editor: W.EditorPanel, branch: W.BranchTreePanel, cuts: W.CutsPanel, score: W.ScorePanel, mint: W.MintPanel, deliver: W.DeliveryPanel, watch: W.WatchStation, bible: W.BiblePanel, vault: W.VaultPanel, titles: W.TitlesPanel, autopilot: W.AutopilotView, memory: W.MemoryPanel };
  const C = map[id];
  return C ? <C kind={kind}/> : <div style={{ padding: 40, color: "var(--c-ink-3)" }}>Unavailable.</div>;
}

// ── Timeline model ────────────────────────────────────────────────
function wsInitialTracks() {
  const T = window.TIMELINE_CLIPS;
  const V1 = T.V1.map(c => ({ ...c }));
  const end = Math.max(...V1.map(c => c.start + c.dur));
  const keep = (arr) => arr.filter(c => c.start < end).map(c => ({ ...c }));
  return { V2: keep(T.V2), V1, A1: keep(T.A1), A2: keep(T.A2), A3: keep(T.A3) };
}
const wsTotal = (tracks) => Math.max(...tracks.V1.map(c => c.start + c.dur));
const wsShotCode = (c) => (c.label.match(/^(\d+[A-Z])/) || [])[1];

function wsRippleRemove(tracks, ids) {
  const gone = tracks.V1.filter(c => ids.includes(c.id)).map(c => [c.start, c.start + c.dur]);
  const shiftAt = (t) => gone.reduce((s, [a, b]) => s + (b <= t ? b - a : 0), 0);
  const inside = (c) => gone.some(([a, b]) => c.start >= a && c.start < b);
  const out = {};
  Object.keys(tracks).forEach(k => {
    out[k] = tracks[k].filter(c => !ids.includes(c.id) && !(k !== "V1" && k !== "A3" && inside(c))).map(c => {
      if (k === "A3" && c.dur > 20) return { ...c, dur: c.dur - gone.reduce((s, [a, b]) => s + (b - a), 0) };
      return { ...c, start: c.start - shiftAt(c.start) };
    });
  });
  return out;
}

function wsRippleExtend(tracks, id, by) {
  const clip = tracks.V1.find(c => c.id === id);
  if (!clip) return tracks;
  const edge = clip.start + clip.dur;
  const out = {};
  Object.keys(tracks).forEach(k => {
    out[k] = tracks[k].map(c => c.id === id ? { ...c, dur: c.dur + by } : (k === "A3" && c.dur > 20) ? { ...c, dur: c.dur + by } : c.start >= edge ? { ...c, start: c.start + by } : c);
  });
  return out;
}

// Director: turns a request into a reviewable change set on the timeline.
function wsPropose(text, tracks, selId) {
  const t = text.toLowerCase();
  const sel = tracks.V1.find(c => c.id === selId) || tracks.V1[0];
  if (/tight|cut|short|trim|faster|too many/.test(t)) {
    const ids = ["v1-6", "v1-8"].filter(id => tracks.V1.some(c => c.id === id));
    if (!ids.length) return { agent: "editor", text: "Scene 14 is already at six shots. Nothing left to cut without losing the realization.", changes: [], none: true };
    const secs = tracks.V1.filter(c => ids.includes(c.id)).reduce((s, c) => s + c.dur, 0);
    return { agent: "director", text: "Eight shots for a man understanding something. Cut the wide and the phone. Six shots. The math serves the silence.", changes: tracks.V1.filter(c => ids.includes(c.id)).map(c => `Remove ${c.label}`).concat([`Ripple ${secs}s out of the cut`]), removed: ids, result: wsRippleRemove(tracks, ids) };
  }
  if (/music|score|cello|sound|pad/.test(t)) {
    const eye = tracks.V1.find(c => c.id === "v1-4") || sel;
    const cue = { id: "a3-cue" + Date.now(), start: Math.max(0, eye.start - 2), dur: 10, label: "SCORE · low cello · 62bpm", kind: "score", color: tkc("cat-2") };
    return { agent: "audio", text: "A single low cello enters two seconds before the eye and holds under the photograph. No melody.", changes: [`Add ${cue.label}`, `${wsFmt(cue.start)} → ${wsFmt(cue.start + cue.dur)}`], added: [cue.id], preview: { ...tracks, A3: [...tracks.A3, cue] } };
  }
  if (/title|card|credit/.test(t)) {
    const card = { id: "v2-new" + Date.now(), start: 0, dur: 4, label: "TITLE: THREE DAYS EARLIER", kind: "title", color: "var(--c-amber)" };
    return { agent: "editor", text: "Open on a plain card before the rain. White on black, four seconds.", changes: [`Add ${card.label.replace("TITLE: ", "title card “")}”`], added: [card.id], preview: { ...tracks, V2: [card, ...tracks.V2] } };
  }
  if (/slow|hold|longer|breath|linger/.test(t)) {
    return { agent: "director", text: `Hold ${wsShotCode(sel)} two seconds longer. Let the audience arrive before he does.`, changes: [`Extend ${sel.label} · ${sel.dur}s → ${sel.dur + 2}s`, "Ripple everything after"], added: [sel.id], result: wsRippleExtend(tracks, sel.id, 2) };
  }
  return { agent: "visual", text: `New take of ${wsShotCode(sel)} with your note: “${text}”. Same lens, same seed family.`, changes: [`Regenerate ${sel.label}`, "Current take stays available"], added: [sel.id], regen: sel.id, note: text };
}

// ── Workspace ─────────────────────────────────────────────────────
function StudioWorkspace({ kind, activeView, setActiveView }) {
  const [tracks, setTracks] = useStateWS(wsInitialTracks);
  const [time, setTime] = useStateWS(18.01);
  const [playing, setPlaying] = useStateWS(false);
  const [sel, setSel] = useStateWS({ id: "v1-4", track: "V1" });
  const [dock, setDock] = useStateWS(null);
  const [zoom, setZoom] = useStateWS(1);
  const [proposal, setProposal] = useStateWS(null);
  const [fidOverride, setFidOverride] = useStateWS({});
  const [takes, setTakes] = useStateWS({});
  const [history, setHistory] = useStateWS([]);
  const total = wsTotal(tracks);
  const sheet = activeView && activeView !== "chat" ? activeView : null;
  const [directorFull, setDirectorFull] = useStateWS(false);

  const fidelity = (c) => {
    if (fidOverride[c.id]) return fidOverride[c.id];
    const sb = window.STORYBOARD.find(s => s.thumb === c.thumb);
    return sb ? sb.status : "draft";
  };

  // Playback
  useEffectWS(() => {
    if (!playing) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000; last = now;
      setTime(t => { const n = t + dt; if (n >= total) { setPlaying(false); return total - 0.01; } return n; });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  // Follow playhead selection while playing
  useEffectWS(() => {
    if (!playing) return;
    const c = wsClipAt(tracks.V1, time);
    if (c && c.id !== sel.id) setSel({ id: c.id, track: "V1" });
  }, [time, playing]);

  // Keys
  useEffectWS(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable || sheet) return;
      if (e.code === "Space") { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === "/") { e.preventDefault(); document.getElementById("ws-director-input")?.focus(); }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = tracks.V1.findIndex(c => c.id === sel.id);
        const n = tracks.V1[Math.max(0, Math.min(tracks.V1.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)))];
        if (n) { setSel({ id: n.id, track: "V1" }); setTime(n.start); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tracks, sel, sheet]);

  // Stage strip in the top bar opens docks via event
  useEffectWS(() => {
    const h = (e) => { const id = e.detail; if (["deliver", "mint", "watch"].includes(id)) setActiveView(id); else setDock(d => d === id ? null : id); };
    window.addEventListener("cina:ws-dock", h);
    return () => window.removeEventListener("cina:ws-dock", h);
  }, []);
  useEffectWS(() => { window.__wsProgress = { tracks, fidelity }; window.dispatchEvent(new Event("cina:ws-progress")); }, [tracks, fidOverride]);

  const onSelect = (id, track) => {
    setSel({ id, track });
    const c = (tracks[track] || []).find(x => x.id === id);
    if (c && track === "V1") setTime(c.start + 0.01);
  };
  const seek = (t) => { setTime(t); const c = wsClipAt(tracks.V1, t); if (c) setSel({ id: c.id, track: "V1" }); };

  const startRender = (clipId, note, model) => {
    const code = wsShotCode(tracks.V1.find(c => c.id === clipId) || { label: "" });
    const base = window.GEN_HISTORY.filter(g => g.shot === code);
    const v = Math.max(0, ...base.map(g => g.v), ...(takes[clipId] || []).map(g => g.v)) + 1;
    const take = { id: "t" + Date.now(), shot: code, v, model: model || "veo3", seed: Math.floor(1000 + Math.random() * 9000), status: "rendering", progress: 0, prompt: note || "Regenerate" };
    setTakes(m => ({ ...m, [clipId]: [take, ...(m[clipId] || [])] }));
    let p = 0;
    const iv = setInterval(() => {
      p += 0.12;
      setTakes(m => ({ ...m, [clipId]: (m[clipId] || []).map(t => t.id === take.id ? { ...t, progress: Math.min(1, p), status: p >= 1 ? "complete" : "rendering" } : t) }));
      if (p >= 1) { clearInterval(iv); setFidOverride(f => ({ ...f, [clipId]: "review" })); }
    }, 350);
  };

  const accept = () => {
    if (!proposal) return;
    setHistory(h => [{ tracks, fid: fidOverride, text: proposal.changes[0] }, ...h]);
    if (proposal.result) setTracks(proposal.result);
    else if (proposal.preview) setTracks(proposal.preview);
    if (proposal.regen) startRender(proposal.regen, proposal.note);
    setProposal(null);
  };
  const undo = () => { const [h, ...rest] = history; if (!h) return; setTracks(h.tracks); setFidOverride(h.fid); setHistory(rest); };

  const viewTracks = proposal?.preview || tracks;
  const railGroups = wsRail(kind);
  const releaseViews = ["deliver", "mint", "watch"];

  if (sheet || directorFull) {
    const id = directorFull ? "chat" : sheet;
    const isRelease = releaseViews.includes(id);
    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
          <button className="ws-btn ws-btn--ghost" onClick={() => { setDirectorFull(false); setActiveView("chat"); }}>← Workspace</button>
          {isRelease ? (
            <div style={{ display: "flex", gap: 4, padding: 3, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line)" }}>
              {releaseViews.map(v => (
                <button key={v} onClick={() => setActiveView(v)} style={{ height: 28, padding: "0 12px", border: "none", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", fontWeight: id === v ? 600 : 450, background: id === v ? "var(--c-panel-3)" : "transparent", color: id === v ? "var(--c-ink)" : "var(--c-ink-3)" }}>{WS_VIEW_TITLES[v]}</button>
              ))}
            </div>
          ) : <span style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>{WS_VIEW_TITLES[id]}</span>}
          <span style={{ flex: 1 }}></span>
          <span className="ws-k">Full tool · changes sync to the timeline</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }}>
          <WsLegacyView id={id} kind={kind}/>
        </div>
      </div>
    );
  }

  const selClip = (tracks[sel.track] || []).find(c => c.id === sel.id) || tracks.V1[0];

  return (
    <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateRows: "minmax(0, 1fr) auto", background: "var(--c-bg)" }}>
      <div style={{ display: "grid", gridTemplateColumns: `56px ${dock ? "300px " : ""}minmax(0, 1fr) clamp(280px, 24vw, 340px)`, minHeight: 0 }}>
        {/* Rail */}
        <div className="ws-scroll" style={{ borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", gap: 2, overflowY: "auto", overflowX: "hidden" }}>
          {railGroups.map((g, gi) => (
            <React.Fragment key={g.stage}>
              {gi > 0 && <span style={{ width: 22, height: 1, background: "var(--c-line)", margin: "6px 0" }}></span>}
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", margin: "2px 0" }}>{g.stage.toUpperCase()}</span>
              {g.items.map(it => (
                <button key={it.id} className="ws-rail" data-on={dock === it.id ? "1" : "0"} onClick={() => it.dock ? setDock(d => d === it.id ? null : it.id) : setActiveView(it.id)} aria-label={it.label} title={it.label + (it.dock ? "" : " ↗")}>
                  <Icon name={it.icon} size={17}/>
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
        {/* Dock */}
        {dock && <WsDock id={dock} onClose={() => setDock(null)} onFull={() => setActiveView(dock)} tracks={tracks} setTracks={setTracks} sel={selClip} onSelect={onSelect} time={time} fidelity={fidelity} onRender={startRender} setProposal={setProposal}/>}
        {/* Center: player + Director */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0, padding: "14px 18px 12px", gap: 12, position: "relative" }}>
          <WsPlayer tracks={viewTracks} time={time} total={wsTotal(viewTracks)} playing={playing} onToggle={() => setPlaying(p => !p)} onSeek={seek} fidelity={fidelity}/>
          <WsDirectorBar proposal={proposal} onPropose={(txt) => setProposal(wsPropose(txt, tracks, sel.track === "V1" ? sel.id : null))} onAccept={accept} onReject={() => setProposal(null)} onOpenFull={() => setDirectorFull(true)} canUndo={history.length > 0} onUndo={undo} lastChange={history[0]?.text}/>
        </div>
        {/* Inspector */}
        <WsInspector clip={selClip} track={sel.track} tracks={tracks} fidelity={fidelity} takes={takes[selClip?.id] || []} onRender={startRender} onOpen={setActiveView} setDock={setDock}/>
      </div>
      <div style={{ height: 262, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <WsTimeline tracks={viewTracks} total={wsTotal(viewTracks)} time={Math.min(time, wsTotal(viewTracks))} onSeek={seek} selectedId={sel.id} onSelect={onSelect} zoom={zoom} setZoom={setZoom} proposal={proposal} fidelity={fidelity} kind={kind} onTracks={setTracks}/>
      </div>
    </div>
  );
}

Object.assign(window, { StudioWorkspace, wsShotCode, wsRippleExtend });
