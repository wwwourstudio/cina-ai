// branch-tree.jsx — Branched-movie node tree editor
//
// The director's surface for choose-your-own-adventure films. A pan/zoom
// canvas of scene nodes; every scene exposes up to 3 outgoing option
// ports that bezier-noodle to downstream nodes. Endings are special
// terminal cards highlighted in blood-red.
//
// Layout:
//   ┌─ Toolbar ──────────────────────────────────────────────┐
//   │  Title · stats · Add scene · Path stats · Play · Push  │
//   ├─ Library ─┬───── Node canvas ─────┬────── Inspector ───┤
//   │  Scenes   │   pan / zoom / connect│   selected scene   │
//   │  Endings  │   bezier noodles      │   3-option editor  │
//   │           │                       │   continuity stats │
//   ├───────────┴───────────────────────┴────────────────────┤
//   │   Mini-map · Path tally · Health                       │
//   └────────────────────────────────────────────────────────┘
//
// Data shape — see DEFAULT_TREE below.

const { useState: useStateBT, useEffect: useEffectBT, useMemo: useMemoBT, useRef: useRefBT, useCallback: useCallbackBT } = React;

// ─── Default tree (seed: Last Light) ────────────────────────────────────
// 10 scene nodes + 3 ending nodes = 13 nodes total. 30 edges. 81 paths.

const ACT_COLORS = {
  "ACT I":    "var(--c-amber)",
  "ACT II":  tkc("cat-1"),
  "ACT III": tkc("cat-2"),
  "FINALE":  tkc("bad"),
  "ENDING":  tkc("blood"),
};

const DEFAULT_TREE = () => ({
  filmId: "last-light",
  title: "Last Light",
  director: "yo",
  totalRuntimeMin: 96,
  // Levels lay out on the X axis. Each level holds N nodes.
  nodes: [
    // ─ ACT I (col 0) ─
    { id: "n0", title: "She finds the booth.",
      act: "ACT I", atMinute: 12, col: 0, row: 1,
      setup: "Esme arrives at the abandoned transmitter at the top of the hill.",
      question: "What does she do?",
      options: [
        { id: "o0a", label: "Walk away",         beat: "Kills the lights, shuts the door.",        tone: "near-silent · 4m",  color: tkc("ink-3"), next: "n1a" },
        { id: "o0b", label: "Sit at the console", beat: "Lowers the headphones. Answers.",          tone: "score-forward · 7m", color: "var(--c-amber)", next: "n1b" },
        { id: "o0c", label: "Run tape",           beat: "Loads a reel and captures alone.",         tone: "tape hiss · 5m",     color: tkc("cat-1"), next: "n1c" },
      ],
    },

    // ─ ACT II (col 1) ─
    { id: "n1a", title: "She drives away.",         act: "ACT II", atMinute: 38, col: 1, row: 0,
      setup: "Three days later. The booth is still on her dashboard.",
      question: "Does she go back?",
      options: [
        { id: "o1aa", label: "Yes",          beat: "She turns the car around.",       tone: "patient · 7m",     color: "var(--c-amber)", next: "n2a" },
        { id: "o1ab", label: "Burns the tape", beat: "She lights the recording on fire.", tone: "deadpan · 5m",   color: tkc("bad"), next: "n2b" },
        { id: "o1ac", label: "Calls her sister", beat: "Dial tone. Five years apart.",     tone: "elegiac · 6m", color: tkc("cat-1"), next: "n2c" },
      ],
    },
    { id: "n1b", title: "The voice asks her name.", act: "ACT II", atMinute: 38, col: 1, row: 1,
      setup: "Three weeks into the broadcast. The voice wants someone in particular.",
      question: "What name does she give?",
      options: [
        { id: "o1ba", label: "Her own",       beat: "She speaks it into the dark.",          tone: "intimate · 6m",  color: "var(--c-amber)", next: "n2a" },
        { id: "o1bb", label: "Her sister's",  beat: "She names the dead. Hopes for a reply.", tone: "elegiac · 8m",   color: tkc("bad"), next: "n2b" },
        { id: "o1bc", label: "A stranger's",  beat: "Invents a person who never existed.",   tone: "uncanny · 7m",   color: tkc("cat-2"), next: "n2c" },
      ],
    },
    { id: "n1c", title: "She plays back the tape.", act: "ACT II", atMinute: 38, col: 1, row: 2,
      setup: "Her own voice on the reel. Then a second voice underneath it.",
      question: "What does she do with the tape?",
      options: [
        { id: "o1ca", label: "Plays it for someone", beat: "Her father. He hasn't been to her house in years.", tone: "wide · 10m", color: "var(--c-amber)", next: "n2a" },
        { id: "o1cb", label: "Mails it",            beat: "Plain envelope. No return address.",                tone: "deadpan · 4m", color: tkc("cat-2"), next: "n2b" },
        { id: "o1cc", label: "Buries it",           beat: "Behind the booth. With a paper note.",              tone: "patient · 7m", color: tkc("cat-1"), next: "n2c" },
      ],
    },

    // ─ ACT III (col 2) ─
    { id: "n2a", title: "Someone is at the door.", act: "ACT III", atMinute: 65, col: 2, row: 0,
      setup: "A car climbs the access road at 3am.",
      question: "Who is it?",
      options: [
        { id: "o2aa", label: "Her father",   beat: "Nine years apart. He taught her radios.", tone: "wide-shot · 10m", color: "var(--c-amber)", next: "n3a" },
        { id: "o2ab", label: "A patrolman",  beat: "Procedural. Someone reported the booth.",   tone: "deadpan · 6m",    color: tkc("ink-3"), next: "n3b" },
        { id: "o2ac", label: "Herself",      beat: "Same coat. Same face.",                     tone: "long-take · 11m", color: tkc("cat-2"), next: "n3c" },
      ],
    },
    { id: "n2b", title: "The other voice arrives.", act: "ACT III", atMinute: 65, col: 2, row: 1,
      setup: "The signal isn't a signal. It's a person. Inside the room with her.",
      question: "How does she respond?",
      options: [
        { id: "o2ba", label: "Run",          beat: "Down the hill. Headlights. Snow.",                          tone: "kinetic · 9m",   color: tkc("bad"), next: "n3a" },
        { id: "o2bb", label: "Speak to them", beat: "Slowly. Sits down. Asks who.",                              tone: "still · 11m",    color: "var(--c-amber)", next: "n3b" },
        { id: "o2bc", label: "Disconnect",   beat: "Pulls the breaker. The console goes dark.",                 tone: "ambient · 5m",   color: tkc("cat-1"), next: "n3c" },
      ],
    },
    { id: "n2c", title: "The third night.",       act: "ACT III", atMinute: 65, col: 2, row: 2,
      setup: "The booth has changed. The console is older. The window is new.",
      question: "What's different?",
      options: [
        { id: "o2ca", label: "The seasons",  beat: "It's autumn outside. It was spring an hour ago.",            tone: "long-take · 12m", color: tkc("cat-2"), next: "n3a" },
        { id: "o2cb", label: "The voice",    beat: "It's hers, in twenty years.",                                 tone: "intimate · 8m",   color: "var(--c-amber)", next: "n3b" },
        { id: "o2cc", label: "The booth",    beat: "Different cabin. Same hill. Different decade.",               tone: "wide · 14m",      color: tkc("cat-1"), next: "n3c" },
      ],
    },

    // ─ FINALE (col 3) ─
    { id: "n3a", title: "The choice.",            act: "FINALE", atMinute: 88, col: 3, row: 0,
      setup: "One more transmission. Static, signal, or silence.",
      question: "How does it end?",
      options: [
        { id: "o3aa", label: "Static",  beat: "She pulls the breaker. The transmitter dies.", tone: "ambient · score-out",  color: tkc("cat-1"), next: "end-static" },
        { id: "o3ab", label: "Signal",  beat: "She speaks into the mic. The message goes through.", tone: "score-forward", color: "var(--c-amber)", next: "end-signal" },
        { id: "o3ac", label: "Silence", beat: "She puts the headphones on. There is no other side.", tone: "near-silent",  color: tkc("cat-2"), next: "end-silence" },
      ],
    },
    { id: "n3b", title: "What she carries home.", act: "FINALE", atMinute: 88, col: 3, row: 1,
      setup: "She leaves the booth. The car is full of snow.",
      question: "What does she take with her?",
      options: [
        { id: "o3ba", label: "The tape",      beat: "Three hours of static. One name underneath.", tone: "elegiac",          color: "var(--c-amber)", next: "end-signal" },
        { id: "o3bb", label: "Nothing",       beat: "Closes the door behind her.",                  tone: "wide · score-out", color: tkc("cat-1"), next: "end-static" },
        { id: "o3bc", label: "A photograph",  beat: "Of herself, twenty years older.",              tone: "uncanny",          color: tkc("cat-2"), next: "end-silence" },
      ],
    },
    { id: "n3c", title: "The transmission ends.", act: "FINALE", atMinute: 88, col: 3, row: 2,
      setup: "She tries to send one last message.",
      question: "What is the message?",
      options: [
        { id: "o3ca", label: "A name",       beat: "Hers. Twice. The room goes still.",        tone: "intimate",           color: "var(--c-amber)", next: "end-signal" },
        { id: "o3cb", label: "Silence",      beat: "Holds the mic. Doesn't speak.",            tone: "near-silent",        color: tkc("cat-2"), next: "end-silence" },
        { id: "o3cc", label: "A confession", beat: "She tells the static everything.",          tone: "long-take",          color: tkc("bad"), next: "end-static" },
      ],
    },

    // ─ ENDINGS (col 4) ─
    { id: "end-static",  title: "Static.",  act: "ENDING", atMinute: 96, col: 4, row: 0, isEnding: true,
      setup: "The transmitter dies. The hill is dark. The first time the audience hears their own breath in the room.",
      options: [],
    },
    { id: "end-signal",  title: "Signal.",  act: "ENDING", atMinute: 96, col: 4, row: 1, isEnding: true,
      setup: "The mic catches. Whatever was on the other side is no longer on the other side.",
      options: [],
    },
    { id: "end-silence", title: "Silence.", act: "ENDING", atMinute: 96, col: 4, row: 2, isEnding: true,
      setup: "The headphones come off. Nothing happens. Nothing was ever going to happen. The lights stay on.",
      options: [],
    },
  ],
});

// ─── Persistence ─────────────────────────────────────────────────────────

const TREE_LS = "cina:branch-tree";

function loadTree() {
  try { const s = localStorage.getItem(TREE_LS); if (s) return JSON.parse(s); } catch {}
  return DEFAULT_TREE();
}
function persistTree(t) {
  try { localStorage.setItem(TREE_LS, JSON.stringify(t)); } catch {}
}

// ─── Layout constants ────────────────────────────────────────────────────

const NODE_W = 260;
const NODE_H = 170;
const COL_GAP = 360;
const ROW_GAP = 220;
const CANVAS_PAD = 200;
// Deterministic node geometry so noodle ports ALWAYS line up with the rows:
// header 32 + title 54 + options-pad 6 → first option row center at 106.
const BT_HDR_H = 32, BT_TITLE_H = 54, BT_OPT_H = 28, BT_OPT_GAP = 4;
const BT_PORT_Y0 = BT_HDR_H + BT_TITLE_H + 6 + BT_OPT_H / 2;   // 106
const BT_PORT_DY = BT_OPT_H + BT_OPT_GAP;                       // 32
function btPortY(node, optIdx) { return nodeXY(node).y + BT_PORT_Y0 + optIdx * BT_PORT_DY; }
function btNodeHeight(node) {
  return node.isEnding ? 118 : BT_HDR_H + BT_TITLE_H + 6 + node.options.length * BT_PORT_DY + 10;
}

function nodeXY(node) {
  // Derive canvas position from col/row + optional override
  if (node.x != null && node.y != null) return { x: node.x, y: node.y };
  return { x: CANVAS_PAD + node.col * COL_GAP, y: CANVAS_PAD + node.row * ROW_GAP };
}

// ─── Path stats ──────────────────────────────────────────────────────────

function computePaths(tree) {
  // Count distinct root → ending paths via DFS
  const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
  const startNodes = tree.nodes.filter(n => n.col === 0);
  let paths = 0, longest = 0;
  const visit = (id, depth) => {
    const n = byId[id];
    if (!n) return;
    if (n.isEnding || n.options.length === 0) {
      paths++; longest = Math.max(longest, depth);
      return;
    }
    n.options.forEach(o => o.next && visit(o.next, depth + 1));
  };
  startNodes.forEach(s => visit(s.id, 1));
  return { paths, longest, endings: tree.nodes.filter(n => n.isEnding).length };
}

// ─── Main panel ──────────────────────────────────────────────────────────

function BranchTreePanel() {
  const activeFilm = (window.cinaActiveFilm && window.cinaActiveFilm()) || null;
  const filmTitle = activeFilm && activeFilm.kind === "branched" ? activeFilm.title : null;
  const [tree, setTree] = useStateBT(loadTree);
  const [selectedId, setSelectedId] = useStateBT(null);
  const [hoveredEdge, setHoveredEdge] = useStateBT(null); // optId
  const [zoom, setZoom] = useStateBT(0.65);
  const [pan, setPan] = useStateBT({ x: 0, y: 0 });
  const [panning, setPanning] = useStateBT(false);
  const [draggingNodeId, setDraggingNodeId] = useStateBT(null);
  const [dragEdge, setDragEdge] = useStateBT(null);       // { fromId, optId, color, x, y } — live rewiring
  const [selectedEdge, setSelectedEdge] = useStateBT(null); // { nodeId, optId } — click a noodle to select
  const [dropTargetId, setDropTargetId] = useStateBT(null);
  const [showMinimap, setShowMinimap] = useStateBT(true);
  const [preview, setPreview] = useStateBT(null); // { startId } — opens audience viewer
  const [mode, setMode] = useStateBT("graph"); // graph | script — two views, one film
  const canvasRef = useRefBT(null);

  // Persist
  useEffectBT(() => persistTree(tree), [tree]);

  const selected = tree.nodes.find(n => n.id === selectedId);
  const stats = useMemoBT(() => computePaths(tree), [tree]);
  const byId = useMemoBT(() => Object.fromEntries(tree.nodes.map(n => [n.id, n])), [tree]);

  const updateNode = (id, patch) => setTree(t => ({
    ...t, nodes: t.nodes.map(n => n.id === id ? { ...n, ...patch } : n),
  }));
  const updateOption = (nodeId, optId, patch) => setTree(t => ({
    ...t, nodes: t.nodes.map(n => n.id === nodeId ? {
      ...n, options: n.options.map(o => o.id === optId ? { ...o, ...patch } : o),
    } : n),
  }));
  const addScene = () => {
    const id = "scene-" + Math.random().toString(36).slice(2, 7);
    const newNode = {
      id, title: "New scene.",
      act: "ACT II", atMinute: 30, col: 1, row: 4,
      x: pan.x ? -pan.x / zoom + 400 : 600,
      y: pan.y ? -pan.y / zoom + 200 : 600,
      setup: "What happens here?", question: "What does she do?",
      options: [
        { id: "a", label: "Option A", beat: "—", tone: "—", color: "var(--c-amber)", next: null },
        { id: "b", label: "Option B", beat: "—", tone: "—", color: tkc("cat-1"), next: null },
        { id: "c", label: "Option C", beat: "—", tone: "—", color: tkc("bad"), next: null },
      ],
    };
    setTree(t => ({ ...t, nodes: [...t.nodes, newNode] }));
    setSelectedId(id);
  };
  const addEnding = () => {
    const id = "ending-" + Math.random().toString(36).slice(2, 7);
    setTree(t => ({ ...t, nodes: [...t.nodes, {
      id, title: "New ending.", act: "ENDING", atMinute: 96, col: 4, row: t.nodes.filter(n => n.isEnding).length,
      x: 1800, y: 200 + t.nodes.filter(n => n.isEnding).length * ROW_GAP,
      setup: "How it ends.", options: [], isEnding: true,
    }]}));
    setSelectedId(id);
  };
  const deleteNode = (id) => {
    setTree(t => ({
      ...t,
      nodes: t.nodes
        .filter(n => n.id !== id)
        .map(n => ({ ...n, options: n.options.map(o => o.next === id ? { ...o, next: null } : o) })),
    }));
    setSelectedId(null);
  };

  // Pan
  const onMouseDownCanvas = (e) => {
    if (e.target !== canvasRef.current && !e.target.dataset?.panSurface) return;
    setPanning(true);
    setSelectedId(null);
    setSelectedEdge(null);
  };
  // Client → world coords
  const toWorld = (clientX, clientY) => {
    const rect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { left: 0, top: 0 };
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom };
  };
  const nodeAtPoint = (wx, wy) => tree.nodes.find(n => {
    const xy = nodeXY(n); const h = btNodeHeight(n);
    return wx >= xy.x - 14 && wx <= xy.x + NODE_W + 14 && wy >= xy.y - 10 && wy <= xy.y + h + 10;
  });
  useEffectBT(() => {
    if (!panning && !draggingNodeId && !dragEdge) return;
    const onMove = (e) => {
      if (panning) {
        setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
      } else if (draggingNodeId) {
        const n = tree.nodes.find(x => x.id === draggingNodeId);
        if (!n) return;
        const xy = nodeXY(n);
        updateNode(draggingNodeId, { x: xy.x + e.movementX / zoom, y: xy.y + e.movementY / zoom });
      } else if (dragEdge) {
        const w = toWorld(e.clientX, e.clientY);
        setDragEdge(d => d && { ...d, x: w.x, y: w.y });
        const hit = nodeAtPoint(w.x, w.y);
        setDropTargetId(hit && hit.id !== dragEdge.fromId ? hit.id : null);
      }
    };
    const onUp = (e) => {
      if (dragEdge) {
        const w = toWorld(e.clientX, e.clientY);
        const hit = nodeAtPoint(w.x, w.y);
        // Drop on a node → rewire. Drop on empty canvas → disconnect.
        updateOption(dragEdge.fromId, dragEdge.optId, { next: hit && hit.id !== dragEdge.fromId ? hit.id : null });
        setDragEdge(null); setDropTargetId(null);
      }
      setPanning(false); setDraggingNodeId(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [panning, draggingNodeId, dragEdge, zoom, pan]);

  // Delete / Backspace removes the selected noodle
  useEffectBT(() => {
    const onKey = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEdge) {
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        updateOption(selectedEdge.nodeId, selectedEdge.optId, { next: null });
        setSelectedEdge(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEdge]);

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(1.6, z - e.deltaY * 0.001)));
  };

  // Open the immersive audience preview from a given node (defaults to the start).
  const openPreview = (startId) => {
    const start = startId || tree.nodes.find(n => n.col === 0)?.id;
    if (start) setPreview({ startId: start });
  };
  useEffectBT(() => { window.cinaOpenBranchPreview = openPreview; return () => { delete window.cinaOpenBranchPreview; }; }, [tree]);

  const [walkthrough, setWalkthrough] = useStateBT(() => { try { return !localStorage.getItem("cina:bt:walkthrough-seen"); } catch { return true; } });
  const [handoff, setHandoff] = useStateBT(false);

  return (
    <div className="bt-root" style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden", background: "var(--c-bg)" }}>
      <style>{`
        .bt-root .bt-toolbar { display: flex; flex-wrap: nowrap; align-items: center; gap: 10px; padding: 8px 16px; overflow: hidden; }
        @media (max-width: 1600px) { .bt-root .bt-btn-label { display: none; } .bt-root .bt-toolbar { gap: 8px; } }
        @media (max-width: 1500px) { .bt-root .bt-stats { display: none !important; } }
        @media (max-width: 1280px) { .bt-root .bt-lib { display: none !important; } }
        @media (max-width: 900px) { .bt-root .bt-minimap, .bt-root .bt-pathstats { display: none !important; } }
        @media (max-width: 1140px) {
          .bt-root .bt-insp-empty { display: none; }
          .bt-root .bt-insp { position: fixed; right: 0; top: 0; bottom: 0; z-index: 60; box-shadow: -24px 0 60px rgba(0,0,0,.55); }
        }
        .bt-root .bt-port { cursor: crosshair; }
        .bt-root .bt-port:hover { transform: translateY(-50%) scale(1.45) !important; }
      `}</style>
      {/* Library — graph mode only */}
      {mode === "graph" && <div className="bt-lib" style={{ display: "contents" }}><BTLibrary tree={tree} filmTitle={filmTitle} selectedId={selectedId} setSelectedId={setSelectedId} onAddScene={addScene} onAddEnding={addEnding} stats={stats}/></div>}

      {/* Canvas column — toolbar in flow (wraps on narrow widths), canvas fills the rest */}
      <div style={{ flex: 1, position: "relative", minWidth: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, var(--c-bg) 0%, var(--c-void) 100%)" }}>
        <BTToolbar tree={tree} filmTitle={filmTitle} zoom={zoom} setZoom={setZoom} setPan={setPan} stats={stats}
          mode={mode} setMode={setMode}
          onAddScene={addScene} onAddEnding={addEnding}
          onPlay={() => openPreview()}
          onGuide={() => setWalkthrough(true)}
          onPushToWatch={() => setHandoff(true)}
        />

        {mode === "script" && window.BTScriptView && (
          <BTScriptView
            tree={tree}
            filmTitle={filmTitle}
            updateNode={updateNode}
            updateOption={updateOption}
            setSelectedId={setSelectedId}
            onJumpToGraph={() => setMode("graph")}
          />
        )}

        {mode === "graph" && (
        <div
          ref={canvasRef}
          data-pan-surface="true"
          onMouseDown={onMouseDownCanvas}
          onWheel={onWheel}
          style={{
            position: "relative", flex: 1, minHeight: 0, overflow: "hidden",
            cursor: dragEdge ? "crosshair" : panning ? "grabbing" : "grab",
            backgroundImage: "radial-gradient(rgba(var(--accent-rgb),.05) 1px, transparent 1px)",
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}>
          {/* World */}
          <div style={{
            position: "absolute", inset: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
          }}>
            {/* Column labels */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {[
                { col: 0, label: "ACT I" },
                { col: 1, label: "ACT II" },
                { col: 2, label: "ACT III" },
                { col: 3, label: "FINALE" },
                { col: 4, label: "ENDINGS" },
              ].map(c => (
                <div key={c.col} style={{
                  position: "absolute", left: CANVAS_PAD + c.col * COL_GAP, top: 60,
                  width: NODE_W,
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-lead)",
                  color: ACT_COLORS[c.label] || tkc("amber"),
                  letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  textAlign: "center", opacity: 0.55,
                }}>{c.label}</div>
              ))}
            </div>

            {/* Edges (SVG) */}
            <svg style={{
              position: "absolute", left: 0, top: 0, width: 3000, height: 2000,
              pointerEvents: "none", overflow: "visible",
            }}>
              <defs>
                <filter id="bt-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3"/>
                </filter>
              </defs>
              {tree.nodes.flatMap(n => n.options.map(opt => {
                if (!opt.next) return null;
                if (dragEdge && dragEdge.fromId === n.id && dragEdge.optId === opt.id) return null;
                const next = byId[opt.next];
                if (!next) return null;
                return <Edge key={opt.id} from={n} to={next} opt={opt}
                  highlighted={hoveredEdge === opt.id}
                  selected={selectedEdge && selectedEdge.optId === opt.id}
                  onSelect={() => { setSelectedEdge({ nodeId: n.id, optId: opt.id }); setSelectedId(null); }}/>;
              }))}
              {/* Live rewiring noodle */}
              {dragEdge && (() => {
                const from = byId[dragEdge.fromId];
                if (!from) return null;
                const oi = from.options.findIndex(o => o.id === dragEdge.optId);
                const x1 = nodeXY(from).x + NODE_W, y1 = btPortY(from, oi);
                const dx = Math.max(60, Math.abs(dragEdge.x - x1) * 0.5);
                return (
                  <g>
                    <path d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${dragEdge.x - dx} ${dragEdge.y}, ${dragEdge.x} ${dragEdge.y}`}
                      stroke={dragEdge.color} strokeWidth="2.5" strokeDasharray="7 5" fill="none"
                      style={{ filter: `drop-shadow(0 0 6px ${dragEdge.color})` }}/>
                    <circle cx={dragEdge.x} cy={dragEdge.y} r="6" fill={dragEdge.color}/>
                  </g>
                );
              })()}
            </svg>

            {/* Disconnect chip for the selected noodle */}
            {selectedEdge && (() => {
              const n = byId[selectedEdge.nodeId]; if (!n) return null;
              const opt = n.options.find(o => o.id === selectedEdge.optId); if (!opt || !opt.next) return null;
              const to = byId[opt.next]; if (!to) return null;
              const oi = n.options.findIndex(o => o.id === opt.id);
              const x1 = nodeXY(n).x + NODE_W, y1 = btPortY(n, oi);
              const x2 = nodeXY(to).x, y2 = nodeXY(to).y + btNodeHeight(to) / 2;
              return (
                <button
                  onMouseDown={e => e.stopPropagation()}
                  onClick={() => { updateOption(n.id, opt.id, { next: null }); setSelectedEdge(null); }}
                  style={{
                    position: "absolute", left: (x1 + x2) / 2 - 44, top: (y1 + y2) / 2 - 13,
                    pointerEvents: "auto", zIndex: 5, height: 26, padding: "0 10px",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(8,7,6,.92)", border: `1px solid ${opt.color}`, borderRadius: 999,
                    color: opt.color, cursor: "pointer", fontFamily: "var(--f-mono)",
                    fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                    boxShadow: `0 8px 22px rgba(0,0,0,.55)`,
                  }}>✕ DISCONNECT</button>
              );
            })()}

            {/* Nodes */}
            <div style={{ position: "relative", pointerEvents: "auto" }}>
              {tree.nodes.map(n => (
                <SceneNode
                  key={n.id} node={n}
                  selected={selectedId === n.id}
                  dropTarget={dropTargetId === n.id}
                  onSelect={() => { setSelectedId(n.id); setSelectedEdge(null); }}
                  onDragStart={() => setDraggingNodeId(n.id)}
                  onHoverOption={setHoveredEdge}
                  onStartEdge={(opt, oi, e) => {
                    e.stopPropagation(); e.preventDefault();
                    const w = toWorld(e.clientX, e.clientY);
                    setSelectedId(null); setSelectedEdge(null);
                    setDragEdge({ fromId: n.id, optId: opt.id, color: opt.color, x: w.x, y: w.y });
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mini-map (HUD layer) */}
          {showMinimap && <div className="bt-minimap" style={{ display: "contents" }}><BTMinimap tree={tree} pan={pan} zoom={zoom} selectedId={selectedId}/></div>}

          {/* Path tally */}
          <div className="bt-pathstats" style={{ display: "contents" }}><BTPathStats tree={tree} stats={stats}/></div>

        </div>
        )}
      </div>

      {/* Immersive audience preview — rendered at top level to escape overflow clips */}
      {preview && <BranchWatchPreview
        tree={tree} byId={byId} startId={preview.startId}
        filmTitle={filmTitle || tree.title}
        onClose={() => setPreview(null)}
        onEditNode={(id) => { setPreview(null); setSelectedId(id); }}
      />}

      {/* Inspector — graph mode only; the script view edits inline */}
      {mode === "graph" && <BTInspector
        node={selected}
        nodes={tree.nodes}
        onUpdate={(p) => selected && updateNode(selected.id, p)}
        onUpdateOption={(optId, p) => selected && updateOption(selected.id, optId, p)}
        onDelete={() => selected && deleteNode(selected.id)}
        onPlayFromHere={() => selected && openPreview(selected.id)}
      />}

      {/* Workflow walkthrough + Push-to-Watch handoff */}
      {walkthrough && window.BTWalkthrough && <BTWalkthrough onClose={() => { setWalkthrough(false); try { localStorage.setItem("cina:bt:walkthrough-seen", "1"); } catch {} }}/>}
      {handoff && window.BTHandoffModal && <BTHandoffModal tree={tree} stats={stats} filmTitle={filmTitle || tree.title} onClose={() => setHandoff(false)}/>}
    </div>
  );
}

// ─── Library (left rail) ────────────────────────────────────────────────

function BTLibrary({ tree, filmTitle, selectedId, setSelectedId, onAddScene, onAddEnding, stats }) {
  const scenes = tree.nodes.filter(n => !n.isEnding);
  const endings = tree.nodes.filter(n => n.isEnding);
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      borderRight: "1px solid var(--c-line)",
      background: "var(--c-panel)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--c-line)" }}>
        <div className="t-label" style={{ marginBottom: 4 }}>BRANCH TREE</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{filmTitle || tree.title}</div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4, letterSpacing: ".16em" }}>
          {stats.paths} PATHS · {stats.endings} ENDINGS
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "6px 8px", marginBottom: 4,
        }}>
          <span className="t-label">SCENES · {scenes.length}</span>
        </div>
        {scenes.map(n => (
          <button key={n.id} onClick={() => setSelectedId(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "8px 8px",
            background: selectedId === n.id ? `${ACT_COLORS[n.act] || tkc("amber")}14` : "transparent",
            border: `1px solid ${selectedId === n.id ? ACT_COLORS[n.act] : "transparent"}`,
            borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
            textAlign: "left", marginBottom: 2,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: ACT_COLORS[n.act] || tkc("amber"), flexShrink: 0,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                color: "var(--c-ink-4)", letterSpacing: ".16em",
              }}>{n.act} · {n.atMinute}M</div>
              <div style={{
                fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-body)", color: "var(--c-ink)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "-0.01em",
              }}>{n.title}</div>
            </div>
          </button>
        ))}

        <button onClick={onAddScene} style={{
          width: "100%", padding: "8px 10px", marginTop: 6,
          background: "transparent", border: "1px dashed var(--c-line-3)",
          color: "var(--c-ink-3)", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 600, textTransform: "uppercase",
        }}>+ Add scene</button>

        <div style={{
          marginTop: 18,
          padding: "6px 8px",
        }}>
          <span className="t-label">ENDINGS · {endings.length}</span>
        </div>
        {endings.map(n => (
          <button key={n.id} onClick={() => setSelectedId(n.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "8px 8px",
            background: selectedId === n.id ? `${ACT_COLORS.ENDING}25` : "rgba(123,45,38,.06)",
            border: `1px solid ${selectedId === n.id ? ACT_COLORS.ENDING : "rgba(123,45,38,.3)"}`,
            borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
            textAlign: "left", marginBottom: 2,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "var(--r-1)",
              background: ACT_COLORS.ENDING, flexShrink: 0,
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                color: "rgba(201,85,72,.7)", letterSpacing: ".16em",
              }}>ENDING</div>
              <div style={{
                fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-body)", color: "var(--c-ink)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                letterSpacing: "-0.01em",
              }}>{n.title}</div>
            </div>
          </button>
        ))}
        <button onClick={onAddEnding} style={{
          width: "100%", padding: "8px 10px", marginTop: 6,
          background: "transparent", border: "1px dashed rgba(201,85,72,.3)",
          color: "rgba(201,85,72,.7)", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 600, textTransform: "uppercase",
        }}>+ Add ending</button>
      </div>
    </aside>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────

function BTToolbar({ tree, filmTitle, zoom, setZoom, setPan, stats, mode, setMode, onAddScene, onAddEnding, onPlay, onGuide, onPushToWatch }) {
  return (
    <div className="bt-toolbar" style={{
      position: "relative", zIndex: 8, flexShrink: 0,
      background: "rgba(13,14,16,.92)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--c-line)",
    }}>
      <span style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
        letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", flexShrink: 0,
      }}>BRANCH</span>
      {/* Graph ↔ Script — two views, one film */}
      <div style={{
        display: "flex", gap: 2, padding: 2, flexShrink: 0,
        background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
      }}>
        {[["graph", "∴ Graph"], ["script", "¶ Script"]].map(([m, l]) => (
          <button key={m} onClick={() => setMode && setMode(m)} style={{
            padding: "4px 12px", border: "none", borderRadius: "var(--r-1)", cursor: "pointer", whiteSpace: "nowrap",
            background: mode === m ? "var(--c-amber)" : "transparent",
            color: mode === m ? tkc("void") : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>{l}</button>
        ))}
      </div>
      <span className="bt-stats" style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
        letterSpacing: ".16em", whiteSpace: "nowrap",
      }}>{tree.nodes.length} NODES · {stats.paths} PATHS · {stats.endings} ENDINGS</span>
      <span style={{ flex: 1, minWidth: 8 }}/>

      {/* Zoom — graph only */}
      {mode !== "script" && (
      <div style={{
        display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
        padding: 2, background: "var(--c-panel-2)",
        border: "1px solid var(--c-line)", borderRadius: "var(--r-1)",
      }}>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} style={btToolbarBtn}>−</button>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", padding: "0 6px", minWidth: 38, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => setZoom(z => Math.min(1.6, z + 0.1))} style={btToolbarBtn}>+</button>
        <button onClick={() => { setZoom(0.65); setPan({ x: 0, y: 0 }); }} style={{ ...btToolbarBtn, fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>FIT</button>
      </div>
      )}

      {mode !== "script" && <button onClick={onAddScene} title="Add scene" style={btToolbarPill}>+<span className="bt-btn-label"> Scene</span></button>}
      {mode !== "script" && <button onClick={onAddEnding} title="Add ending" style={btToolbarPill}>+<span className="bt-btn-label"> Ending</span></button>}
      {onGuide && <button onClick={onGuide} title="Workflow walkthrough" style={{ ...btToolbarPill, padding: "6px 9px" }}>?</button>}
      <button onClick={onPlay} title="Audience preview" style={{ ...btToolbarPill, color: "var(--c-amber)", borderColor: "var(--c-amber)" }}>▶<span className="bt-btn-label"> Preview</span></button>
      <button onClick={onPushToWatch} title="Push to Watch" style={{
        padding: "6px 12px", background: "var(--c-amber)", color: "var(--c-void)",
        border: "none", borderRadius: "var(--r-1)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
        fontWeight: 700, textTransform: "uppercase",
      }}>↗<span className="bt-btn-label"> Push to Watch</span></button>
    </div>
  );
}

// ─── Edge ────────────────────────────────────────────────────────────────

function Edge({ from, to, opt, highlighted, selected, onSelect }) {
  const fromXY = nodeXY(from);
  const toXY = nodeXY(to);
  const optIdx = from.options.findIndex(o => o.id === opt.id);
  const fromX = fromXY.x + NODE_W;
  const fromY = btPortY(from, optIdx);
  const toX = toXY.x;
  const toY = toXY.y + btNodeHeight(to) / 2;
  const dx = Math.max(70, (toX - fromX) * 0.5);
  const d = `M ${fromX} ${fromY} C ${fromX + dx} ${fromY}, ${toX - dx} ${toY}, ${toX} ${toY}`;
  const hot = highlighted || selected;
  return (
    <g opacity={hot ? 1 : 0.6}>
      {/* Fat invisible hit path — the noodle is directly clickable */}
      <path d={d} stroke="transparent" strokeWidth="14" fill="none"
        style={{ pointerEvents: "stroke", cursor: "pointer" }}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onSelect && onSelect(); }}/>
      <path
        d={d}
        stroke={opt.color}
        strokeWidth={hot ? 3.5 : 1.5}
        strokeDasharray={selected ? "9 5" : "none"}
        fill="none"
        style={{ filter: hot ? `drop-shadow(0 0 6px ${opt.color})` : "none", transition: "stroke-width .2s", pointerEvents: "none" }}
      />
      <circle cx={toX} cy={toY} r={hot ? 5 : 3} fill={opt.color}/>
    </g>
  );
}

// ─── Scene Node ──────────────────────────────────────────────────────────

function SceneNode({ node, selected, dropTarget, inPath, pathIdx, onSelect, onDragStart, onHoverOption, onStartEdge }) {
  const xy = nodeXY(node);
  const color = ACT_COLORS[node.act] || tkc("amber");
  const isEnding = node.isEnding;

  return (
    <div
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); onDragStart(); }}
      style={{
        position: "absolute", left: xy.x, top: xy.y,
        width: NODE_W, minHeight: isEnding ? 0 : NODE_H,
        background: selected
          ? `linear-gradient(135deg, ${color}28, var(--c-panel) 75%)`
          : "var(--c-panel)",
        border: `1.5px solid ${dropTarget ? "var(--c-good, var(--c-good))" : selected ? color : isEnding ? "rgba(123,45,38,.45)" : "var(--c-line-2)"}`,
        borderRadius: "var(--r-2)", cursor: "grab",
        boxShadow: dropTarget ? `0 0 0 3px rgba(111,191,138,.35), 0 12px 32px rgba(0,0,0,.5)` : selected ? `0 12px 32px ${color}33, 0 0 0 2px ${color}33` : inPath ? `0 0 0 2px ${color}88` : "0 4px 12px rgba(0,0,0,.4)",
        userSelect: "none",
        transition: "box-shadow .2s, border-color .15s",
      }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px",
        borderBottom: `1px solid ${selected ? color + "55" : "var(--c-line)"}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {inPath != null && pathIdx >= 0 && (
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: color, color: "var(--c-void)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
            flexShrink: 0,
          }}>{pathIdx + 1}</div>
        )}
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color, letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>{node.act} · {node.atMinute}M</span>
        {isEnding && (
          <span style={{
            marginLeft: "auto",
            padding: "1px 6px", background: ACT_COLORS.ENDING, color: tkc("ink"),
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
            borderRadius: "var(--r-1)", textTransform: "uppercase",
          }}>END</span>
        )}
      </div>

      {/* Heading */}
      <div style={{ padding: "12px 12px 8px" }}>
        <div style={{
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: isEnding ? 22 : 17, color: "var(--c-ink)",
          fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.01em",
        }}>{node.title}</div>
      </div>

      {/* Options (ports) */}
      {!isEnding && (
        <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {node.options.map((opt, i) => (
            <div key={opt.id}
              onMouseEnter={() => onHoverOption(opt.id)}
              onMouseLeave={() => onHoverOption(null)}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 8px 5px 6px",
                background: `${opt.color}14`, border: `1px solid ${opt.color}55`,
                borderRadius: "var(--r-1)",
                fontSize: "var(--fs-label)", color: "var(--c-ink-2)",
              }}>
              <span style={{
                width: 14, height: 14, borderRadius: "50%",
                background: opt.color, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-void)", fontWeight: 700,
              }}>{String.fromCharCode(65 + i)}</span>
              <span style={{
                flex: 1, fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{opt.label}</span>
              {/* Output port (right edge) — grab it to pull a noodle */}
              <span
                className="bt-port"
                title="Drag to connect this option to a scene"
                onMouseDown={(e) => onStartEdge && onStartEdge(opt, i, e)}
                style={{
                  position: "absolute", right: -9, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, borderRadius: "50%",
                  background: opt.color,
                  border: "2px solid var(--c-panel)",
                  boxShadow: `0 0 8px ${opt.color}`,
                  transition: "transform .12s ease",
                }}/>
            </div>
          ))}
        </div>
      )}

      {/* Input port (left edge) — for non-start nodes */}
      {node.col > 0 && (
        <span style={{
          position: "absolute", left: -8, top: btNodeHeight(node) / 2 - 5,
          width: 10, height: 10, borderRadius: "50%",
          background: dropTarget ? `var(--c-good, ${tkc("good")})` : color,
          boxShadow: `0 0 0 2px var(--c-panel)${dropTarget ? ", 0 0 10px rgba(111,191,138,.8)" : ""}`,
          pointerEvents: "none",
        }}/>
      )}
    </div>
  );
}

// ─── Mini-map ────────────────────────────────────────────────────────────

function BTMinimap({ tree, pan, zoom, selectedId }) {
  // World bounds — assume 5 columns x N rows
  const worldW = CANVAS_PAD * 2 + 5 * COL_GAP;
  const worldH = CANVAS_PAD * 2 + 4 * ROW_GAP;
  const W = 200, H = (W / worldW) * worldH;
  const sx = W / worldW;
  const sy = H / worldH;
  return (
    <div style={{
      position: "absolute", right: 14, bottom: 14, zIndex: 9,
      width: W + 16, padding: 8,
      background: "rgba(8,8,10,.85)", backdropFilter: "blur(8px)",
      border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
    }}>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
        letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6,
      }}>MAP</div>
      <svg width={W} height={H} style={{ display: "block", background: "var(--c-bg)", borderRadius: "var(--r-1)" }}>
        {tree.nodes.flatMap(n => n.options.map(opt => {
          if (!opt.next) return null;
          const next = tree.nodes.find(x => x.id === opt.next); if (!next) return null;
          const a = nodeXY(n), b = nodeXY(next);
          return <line key={opt.id} x1={a.x * sx + 4} y1={a.y * sy + 4} x2={b.x * sx} y2={b.y * sy + 4}
            stroke={opt.color} strokeWidth="0.5" opacity="0.5"/>;
        }))}
        {tree.nodes.map(n => {
          const xy = nodeXY(n);
          return <rect key={n.id}
            x={xy.x * sx} y={xy.y * sy}
            width={Math.max(4, NODE_W * sx)} height={Math.max(3, NODE_H * sy)}
            fill={n.isEnding ? ACT_COLORS.ENDING : ACT_COLORS[n.act] || tkc("amber")}
            opacity={selectedId === n.id ? 1 : 0.7}
            stroke={selectedId === n.id ? tkc("white") : "none"}
            strokeWidth="0.7"/>;
        })}
        {/* Viewport rect */}
        <rect
          x={-pan.x / zoom * sx} y={-pan.y / zoom * sy}
          width={(window.innerWidth / zoom) * sx}
          height={(window.innerHeight / zoom) * sy}
          fill="none" stroke= "var(--c-amber)" strokeWidth="1" opacity="0.55"
        />
      </svg>
    </div>
  );
}

// ─── Path stats ──────────────────────────────────────────────────────────

function BTPathStats({ tree, stats }) {
  // Tally endings reach count
  const reach = {};
  const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
  const visit = (id, m) => {
    const n = byId[id]; if (!n) return;
    if (n.isEnding || n.options.length === 0) { reach[id] = (reach[id] || 0) + m; return; }
    n.options.forEach(o => o.next && visit(o.next, m));
  };
  tree.nodes.filter(n => n.col === 0).forEach(s => visit(s.id, 1));

  return (
    <div style={{
      position: "absolute", left: 14, bottom: 14, zIndex: 9,
      padding: "10px 14px",
      background: "rgba(8,8,10,.85)", backdropFilter: "blur(8px)",
      border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
      display: "flex", gap: 14, alignItems: "center",
    }}>
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>TOTAL PATHS</div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.01em" }}>{stats.paths}</div>
      </div>
      <div style={{ width: 1, alignSelf: "stretch", background: "var(--c-line-2)" }}/>
      {tree.nodes.filter(n => n.isEnding).map(n => (
        <div key={n.id}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: ACT_COLORS.ENDING, letterSpacing: ".16em", textTransform: "uppercase" }}>{n.title.replace(".", "")}</div>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 6, marginTop: 2,
          }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500 }}>{reach[n.id] || 0}</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>paths</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Inspector (right rail) ─────────────────────────────────────────────

function BTInspector({ node, nodes, onUpdate, onUpdateOption, onDelete, onPlayFromHere }) {
  if (!node) {
    return (
      <aside style={{
        width: 320, flexShrink: 0, borderLeft: "1px solid var(--c-line)",
        background: "var(--c-panel)", padding: 20,
      }}>
        <div className="t-label" style={{ marginBottom: 8 }}>NO SCENE SELECTED</div>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", lineHeight: 1.4 }}>
          Click a node in the canvas to edit it. Drag a node to reposition. Hold ⌘ + scroll to zoom.
        </div>
        <div style={{ marginTop: 22, padding: 14, background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
          <div className="t-label" style={{ marginBottom: 6, color: "var(--c-amber)" }}>QUICK TIPS</div>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>
            <li>Each scene has up to 3 options.</li>
            <li>Each option's noodle picks the next scene.</li>
            <li>Endings have no outgoing options.</li>
            <li>Push to Watch ships this tree as a Branched film.</li>
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 340, flexShrink: 0, borderLeft: "1px solid var(--c-line)",
      background: "var(--c-panel)", overflowY: "auto",
    }}>
      <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: ACT_COLORS[node.act] || tkc("amber"),
          letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>EDITING · {node.act} · {node.atMinute}M</div>
        <input value={node.title} onChange={e => onUpdate({ title: e.target.value })}
          style={{
            width: "100%", marginTop: 6,
            background: "transparent", border: "none", outline: "none",
            color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", fontWeight: 500, letterSpacing: "-0.01em", padding: 0,
          }}/>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <BTField label="ACT">
          <select value={node.act} onChange={e => onUpdate({ act: e.target.value })} style={btInp}>
            {Object.keys(ACT_COLORS).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </BTField>
        <BTField label="AT MINUTE">
          <input type="number" value={node.atMinute} min={1} max={300}
            onChange={e => onUpdate({ atMinute: parseInt(e.target.value) || 0 })} style={btInp}/>
        </BTField>
        <BTField label="SETUP · what the audience sees before the choice">
          <textarea value={node.setup} onChange={e => onUpdate({ setup: e.target.value })} rows={2}
            style={{ ...btInp, resize: "vertical", fontFamily: "var(--f-display)", fontStyle: "italic" }}/>
        </BTField>
        {!node.isEnding && (
          <BTField label="QUESTION">
            <input value={node.question} onChange={e => onUpdate({ question: e.target.value })} style={btInp}/>
          </BTField>
        )}

        {/* Options editor */}
        {!node.isEnding && (
          <div>
            <div className="t-label" style={{ marginBottom: 6 }}>THE 3 BRANCHES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {node.options.map((opt, i) => (
                <div key={opt.id} style={{
                  padding: 10, background: "var(--c-bg)",
                  border: `1px solid ${opt.color}44`, borderLeft: `2px solid ${opt.color}`,
                  borderRadius: "var(--r-1)",
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: opt.color, color: "var(--c-void)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                    }}>{String.fromCharCode(65 + i)}</span>
                    <input value={opt.label} onChange={e => onUpdateOption(opt.id, { label: e.target.value })}
                      style={{ ...btInp, flex: 1, padding: "5px 8px",
                        fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", fontWeight: 500,
                      }}/>
                    <input type="color" value={opt.color} onChange={e => onUpdateOption(opt.id, { color: e.target.value })}
                      style={{ width: 22, height: 22, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}/>
                  </div>
                  <input value={opt.beat} placeholder="One-line beat"
                    onChange={e => onUpdateOption(opt.id, { beat: e.target.value })}
                    style={{ ...btInp, padding: "5px 8px", fontSize: "var(--fs-body)" }}/>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={opt.tone} placeholder="tone · runtime"
                      onChange={e => onUpdateOption(opt.id, { tone: e.target.value })}
                      style={{ ...btInp, padding: "5px 8px", flex: 1, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}/>
                    <select value={opt.next || ""} onChange={e => onUpdateOption(opt.id, { next: e.target.value || null })}
                      style={{ ...btInp, padding: "5px 8px", flex: 1, fontSize: "var(--fs-label)" }}>
                      <option value="">→ unconnected</option>
                      {nodes.filter(n => n.id !== node.id).map(n => (
                        <option key={n.id} value={n.id}>{n.isEnding ? "END · " : ""}{n.title.slice(0, 36)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginTop: 6, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
          <button onClick={onPlayFromHere} style={{
            flex: 1, padding: "8px 12px",
            background: "transparent", color:  "var(--c-amber)",
            border: "1px solid var(--c-amber)", borderRadius: "var(--r-1)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>▶ Play from here</button>
          <button onClick={onDelete} style={{
            padding: "8px 12px",
            background: "transparent", color: "var(--c-blood-l)",
            border: "1px solid var(--c-blood)", borderRadius: "var(--r-1)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase",
          }}>Delete</button>
        </div>
      </div>
    </aside>
  );
}

// ─── Audience viewing experience ─────────────────────────────────────────
// The full-screen, fork-by-fork player. This is what a viewer on Cina Watch
// experiences: a scene, a live vote between branches, then the next scene —
// until they hit one of the endings. Drives the whole "viewing experience".

const BWP_THUMBS = ["darkroom-est", "the-photo", "phone", "developer", "voss-eye", "darkroom-wide", "timestamp", "dawn", "voss-enter", "the-photo", "developer"];

function bwpHash(s) { let h = 0; for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

function bwpVotes(node) {
  const base = node.options.map((o, i) => {
    let w = o.color === "var(--c-amber)" ? 40 : o.color === tkc("bad") ? 31 : o.color === tkc("cat-1") ? 28 : o.color === tkc("cat-2") ? 26 : 24;
    w += (bwpHash(node.id + o.id) % 11) - 5;
    return Math.max(7, w);
  });
  const sum = base.reduce((a, b) => a + b, 0) || 1;
  const pct = base.map(w => Math.round(w / sum * 100));
  pct[0] += 100 - pct.reduce((a, b) => a + b, 0); // settle rounding on the leader
  return pct;
}

const VOTE_SECONDS = 9;

function BranchWatchPreview({ tree, byId, startId, filmTitle, onClose, onEditNode }) {
  const thumbMap = useMemoBT(() => {
    const m = {}; tree.nodes.forEach((n, i) => { m[n.id] = n.thumb || BWP_THUMBS[i % BWP_THUMBS.length]; }); return m;
  }, [tree]);

  const [currentId, setCurrentId] = useStateBT(startId);
  const [history, setHistory] = useStateBT([]); // { fromId, optId, optLabel, act }
  const [remaining, setRemaining] = useStateBT(VOTE_SECONDS);
  const [chosenOpt, setChosenOpt] = useStateBT(null); // optId being committed (for flash)

  const node = byId[currentId];
  const ended = !node || node.isEnding || node.options.length === 0;
  const votes = useMemoBT(() => (node && !ended ? bwpVotes(node) : []), [node, ended]);

  const choose = useCallbackBT((opt) => {
    if (!node || ended || chosenOpt) return;
    setChosenOpt(opt.id);
    setTimeout(() => {
      setHistory(h => [...h, { fromId: node.id, fromTitle: node.title, optId: opt.id, optLabel: opt.label, act: node.act, color: opt.color }]);
      setChosenOpt(null);
      setRemaining(VOTE_SECONDS);
      if (opt.next && byId[opt.next]) setCurrentId(opt.next);
    }, 620);
  }, [node, ended, chosenOpt, byId]);

  // Live vote countdown — auto-commits the leading branch, like a real broadcast.
  useEffectBT(() => {
    if (ended || chosenOpt) return;
    if (remaining <= 0) {
      const lead = node.options.reduce((best, o, i) => votes[i] > best.v ? { o, v: votes[i] } : best, { o: node.options[0], v: -1 });
      choose(lead.o);
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, ended, chosenOpt, node, votes, choose]);

  useEffectBT(() => { setRemaining(VOTE_SECONDS); }, [currentId]);

  // Keyboard: 1/2/3 choose · Esc close
  useEffectBT(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (ended || chosenOpt || !node) return;
      const idx = ["1", "2", "3"].indexOf(e.key);
      if (idx >= 0 && node.options[idx]) choose(node.options[idx]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, ended, chosenOpt, choose, onClose]);

  const restart = () => { setHistory([]); setChosenOpt(null); setRemaining(VOTE_SECONDS); setCurrentId(startId); };

  // Act progress (I→II→III→FINALE→ENDING)
  const ACT_SEQ = ["ACT I", "ACT II", "ACT III", "FINALE", "ENDING"];
  const curActIdx = node ? ACT_SEQ.indexOf(node.act) : ACT_SEQ.length - 1;
  const reachPct = node ? 18 + (bwpHash(node.id) % 40) : 24;
  const accent = node ? (ACT_COLORS[node.act] || tkc("amber")) : ACT_COLORS.ENDING;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: `radial-gradient(120% 90% at 50% 0%, ${tkc("bg")} 0%, ${tkc("void")} 70%, ${tkc("black")} 100%)`,
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @keyframes bwpRise { from { transform: translateY(16px); } to { transform: translateY(0); } }
        @keyframes bwpVoteGrow { from { width: 0; } }
      `}</style>

      {/* Top chrome */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,.06)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", fontWeight: 700, padding: "3px 8px",
            border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: "var(--r-1)",
          }}>● AUDIENCE PREVIEW</span>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{filmTitle}</span>
        </div>

        {/* Act progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {ACT_SEQ.map((a, i) => (
            <React.Fragment key={a}>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color: i === curActIdx ? (ACT_COLORS[a] || tkc("amber")) : i < curActIdx ? "var(--c-ink-3)" : `var(--c-ink-5, ${tkc("line-3")})`,
                fontWeight: i === curActIdx ? 700 : 400,
              }}>{a.replace("ACT ", "")}</span>
              {i < ACT_SEQ.length - 1 && <span style={{ width: 14, height: 1, background: i < curActIdx ? "var(--c-ink-3)" : "rgba(255,255,255,.1)" }}/>}
            </React.Fragment>
          ))}
        </div>

        <button onClick={onClose} style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
          color: "var(--c-ink-2)", cursor: "pointer", padding: "5px 10px",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
        }} aria-label="Close" title="Close">EXIT ✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "26px 24px 36px" }}>
        {!ended ? (
          <div style={{ width: "min(940px, 100%)", display: "flex", flexDirection: "column", gap: 20 }} key={currentId}>
            {/* Frame */}
            <div style={{
              position: "relative", width: "100%", aspectRatio: "16/9",
              borderRadius: "var(--r-2)", overflow: "hidden", border: `1px solid ${accent}33`,
              boxShadow: `0 30px 80px rgba(0,0,0,.6)`, animation: "bwpRise .4s ease",
              background: tkc("bg"), flexShrink: 0,
            }}>
              {typeof FrameThumb === "function" && <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={thumbMap[node.id]} usePhoto/></div>}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 40%, rgba(0,0,0,.85) 100%)" }}/>
              {/* Act chip */}
              <div style={{
                position: "absolute", top: 16, left: 18,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent,
                letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)",
                padding: "4px 9px", borderRadius: "var(--r-1)", border: `1px solid ${accent}55`,
              }}>{node.act} · {node.atMinute}M</div>
              {/* Title + setup */}
              <div style={{ position: "absolute", left: 24, right: 24, bottom: 22 }}>
                <div className="t-display" style={{
                  fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, color: tkc("white"),
                  lineHeight: .98, letterSpacing: "-0.02em", textShadow: "0 2px 30px rgba(0,0,0,.8)",
                }}>{node.title}</div>
                <div className="t-display" style={{
                  fontStyle: "italic", fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.78)",
                  lineHeight: 1.5, marginTop: 10, maxWidth: 640, textWrap: "pretty",
                }}>{node.setup}</div>
              </div>
            </div>

            {/* Vote header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>
                {node.question}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>● LIVE VOTE</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", minWidth: 22, textAlign: "right" }}>0:0{Math.max(0, remaining)}</span>
              </div>
            </div>
            {/* Countdown bar */}
            <div style={{ height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden", marginTop: -10 }}>
              <div style={{ width: `${(remaining / VOTE_SECONDS) * 100}%`, height: "100%", background: "var(--c-amber)", transition: "width 1s linear" }}/>
            </div>

            {/* Option cards */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${node.options.length}, 1fr)`, gap: 12 }}>
              {node.options.map((opt, i) => {
                const isChosen = chosenOpt === opt.id;
                const dimmed = chosenOpt && !isChosen;
                return (
                  <button key={opt.id} onClick={() => choose(opt)} disabled={!!chosenOpt}
                    style={{
                      textAlign: "left", cursor: chosenOpt ? "default" : "pointer",
                      background: isChosen ? `${opt.color}22` : "var(--c-panel)",
                      border: `1.5px solid ${isChosen ? opt.color : opt.color + "44"}`,
                      borderRadius: "var(--r-2)", padding: "16px 16px 14px",
                      display: "flex", flexDirection: "column", gap: 10,
                      opacity: dimmed ? 0.4 : 1,
                      transform: isChosen ? "translateY(-3px)" : "none",
                      boxShadow: isChosen ? `0 16px 40px ${opt.color}33` : "none",
                      transition: "opacity .3s, transform .3s, box-shadow .3s, border-color .15s",
                    }}
                    onMouseEnter={e => { if (!chosenOpt) e.currentTarget.style.borderColor = opt.color; }}
                    onMouseLeave={e => { if (!chosenOpt) e.currentTarget.style.borderColor = opt.color + "44"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: "50%", background: opt.color, color: "var(--c-void)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</span>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{opt.label}</span>
                    </div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45, minHeight: 34, textWrap: "pretty" }}>{opt.beat}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase" }}>{opt.tone}</div>
                    {/* Vote bar */}
                    <div style={{ marginTop: 2 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>AUDIENCE</span>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: opt.color, fontWeight: 700 }}>{votes[i]}%</span>
                      </div>
                      <div style={{ height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                        <div style={{ width: `${votes[i]}%`, height: "100%", background: opt.color, animation: "bwpVoteGrow .6s ease" }}/>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ textAlign: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>
              CLICK A BRANCH OR PRESS 1–{node.options.length} · THE LEADING VOTE LOCKS WHEN THE TIMER ENDS
            </div>
          </div>
        ) : (
          /* Ending screen */
          <div style={{ width: "min(760px, 100%)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: 12 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: ACT_COLORS.ENDING, letterSpacing: ".16em", fontWeight: 700, marginBottom: 14 }}>YOU REACHED THE ENDING</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 400, color: tkc("cat-4"), lineHeight: .9, letterSpacing: "-0.02em", textShadow: "0 4px 40px rgba(123,45,38,.5)" }}>
              {node ? node.title : "The end."}
            </div>
            {node?.setup && (
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", lineHeight: 1.55, marginTop: 18, maxWidth: 560, textWrap: "pretty" }}>
                {node.setup}
              </div>
            )}

            {/* Stat strip */}
            <div style={{ display: "flex", gap: 0, marginTop: 30, marginBottom: 26, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
              {[
                { label: "Your choices", value: String(history.length) },
                { label: "Your cut", value: `~${node ? node.atMinute : 96}m` },
                { label: "Reached by", value: `${reachPct}%` },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: "14px 26px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Path recap */}
            {history.length > 0 && (
              <div style={{ width: "100%", maxWidth: 560, textAlign: "left", marginBottom: 26 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 12 }}>The path you cut</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: h.color, flexShrink: 0 }}/>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.fromTitle}</span>
                      <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>→</span>
                      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: h.color, flexShrink: 0 }}>{h.optLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button onClick={restart} style={{
                padding: "11px 20px", background: "var(--c-amber)", color: "var(--c-void)",
                border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>↺ Watch again</button>
              {node && onEditNode && (
                <button onClick={() => onEditNode(node.id)} style={{
                  padding: "11px 20px", background: "transparent", color: "var(--c-ink-2)",
                  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
                }}>Edit this ending</button>
              )}
              <button onClick={onClose} style={{
                padding: "11px 20px", background: "transparent", color: "var(--c-ink-2)",
                border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
              }} aria-label="Close" title="Close">Back to tree</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────

const btInp = {
  width: "100%", padding: "7px 9px",
  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-1)", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
};
const btToolbarBtn = {
  width: 22, height: 22,
  background: "transparent", border: "none", color: "var(--c-ink-2)",
  cursor: "pointer", fontSize: "var(--fs-body)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const btToolbarPill = {
  padding: "6px 10px", whiteSpace: "nowrap", flexShrink: 0,
  background: "var(--c-panel-2)", color: "var(--c-ink-2)",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
  letterSpacing: ".16em", cursor: "pointer",
  fontWeight: 600, textTransform: "uppercase",
};

function BTField({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="t-label" style={{ letterSpacing: ".16em" }}>{label}</span>
      {children}
    </label>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────

window.BranchTreePanel = BranchTreePanel;
