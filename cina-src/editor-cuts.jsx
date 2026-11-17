// editor-cuts.jsx — Cut assembly per branch path.
//
// Loads AFTER editor.jsx and wraps window.EditorPanel with a Path bar:
// every path in the Board's branch tree (localStorage "cina:board-v2")
// becomes an assemblable cut. Picking a path rebuilds the V1 track from
// that path's shots (in board order) and remounts the editor timeline.
// The active path persists, and each path shows its readiness
// (rendered / approved / draft) so the director can see which cuts can ship.

(function () {
  const { useState: usEC, useMemo: umEC } = React;
  const BaseEditor = window.EditorPanel;
  const EC_KEY = "cina:cut-path";

  const EC_COLORS = [tkc("line-3"), tkc("panel-3"), tkc("line-2"), tkc("blood"), tkc("panel-2"), tkc("cat-1")];
  const EC_THUMBS = ["darkroom-est", "voss-enter", "developer", "voss-eye", "the-photo", "darkroom-wide", "timestamp", "phone", "dawn"];

  function ecBoard() {
    try { const b = JSON.parse(localStorage.getItem("cina:board-v2")); if (b && b.scenes && b.framesByScene) return b; } catch (e) {}
    return null;
  }

  // Every path = for each forked family, one member; unforked scenes ride along.
  // We enumerate per-family choices (A × B × …) capped to keep the bar sane.
  function ecPaths() {
    const b = ecBoard();
    if (!b) return [];
    const roots = b.scenes.filter(s => !s.branchOf);
    const families = roots.map(r => [r, ...b.scenes.filter(x => x.branchOf === r.id)]);
    let combos = [[]];
    for (const fam of families) {
      if (fam.length === 1) { combos = combos.map(c => [...c, fam[0]]); continue; }
      const next = [];
      for (const c of combos) for (const member of fam) next.push([...c, member]);
      combos = next;
      if (combos.length > 8) { combos = combos.slice(0, 8); break; }
    }
    return combos.map(sceneList => {
      const letters = sceneList.filter(s => {
        const fam = families.find(f => f.some(m => m.id === s.id));
        return fam && fam.length > 1;
      }).map(s => s.branchLabel || "A");
      const id = "path_" + (letters.join("") || "A");
      const frames = sceneList.flatMap(s => (b.framesByScene[s.id] || []));
      const rendered = frames.filter(f => f.status === "rendered").length;
      const approved = frames.filter(f => f.status === "approved" || f.status === "rendered").length;
      return {
        id, letters: letters.length ? letters : ["A"],
        label: "Path " + (letters.join("·") || "A"),
        scenes: sceneList, frames, rendered, approved,
        ready: frames.length > 0 && rendered === frames.length,
      };
    });
  }

  // Build V1 clips from a path's frames, in board order.
  function ecAssembleV1(path) {
    let t = 0;
    return path.frames.map((f, i) => {
      const dur = Math.max(2, parseFloat(f.duration) || 4);
      const clip = {
        id: "cut-" + path.id + "-" + i,
        start: t, dur,
        label: `${f.scene}${f.shot} · ${f.type} · ${(f.desc || "").slice(0, 18)}`,
        kind: "shot",
        color: EC_COLORS[i % EC_COLORS.length],
        thumb: f.thumb || EC_THUMBS[i % EC_THUMBS.length],
        pathStatus: f.status,
      };
      t += dur;
      return clip;
    });
  }

  function CutAssemblyBar({ activeId, onPick }) {
    const paths = umEC(ecPaths, []);
    if (paths.length < 2) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)", overflowX: "auto", flexShrink: 0 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", whiteSpace: "nowrap" }}>⑂ ASSEMBLE CUT</span>
        {paths.map(p => {
          const on = p.id === activeId;
          return (
            <button key={p.id} onClick={() => onPick(p)} title={`${p.frames.length} shots · ${p.rendered} rendered · ${p.ready ? "ready to ship" : "renders pending"}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px",
                borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap",
                background: on ? "rgba(var(--accent-rgb),.1)" : "transparent",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                color: on ? "var(--c-amber)" : "var(--c-ink-2)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600,
              }}>
              {p.label.toUpperCase()}
              <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>{p.frames.length} SHOTS</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.ready ? "var(--c-good)" : p.rendered > 0 ? "var(--c-amber)" : "var(--c-line-2)" }}/>
            </button>
          );
        })}
        <span style={{ flex: 1 }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", whiteSpace: "nowrap" }}>EACH PATH IS ITS OWN TIMELINE · ● READY ○ RENDERS PENDING</span>
      </div>
    );
  }

  function EditorWithCuts(props) {
    const [activeId, setActiveId] = usEC(() => { try { return localStorage.getItem(EC_KEY) || null; } catch (e) { return null; } });
    const [mountKey, setMountKey] = usEC(0);

    // On first mount, if a saved path exists, rebuild V1 before the editor reads it.
    umEC(() => {
      if (!activeId) return null;
      const p = ecPaths().find(x => x.id === activeId);
      if (p && p.frames.length) window.TIMELINE_CLIPS = { ...window.TIMELINE_CLIPS, V1: ecAssembleV1(p) };
      return null;
    }, []);

    function pick(p) {
      if (p.frames.length) window.TIMELINE_CLIPS = { ...window.TIMELINE_CLIPS, V1: ecAssembleV1(p) };
      try { localStorage.setItem(EC_KEY, p.id); } catch (e) {}
      setActiveId(p.id);
      setMountKey(k => k + 1); // remount the editor on the new assembly
      window.dispatchEvent(new CustomEvent("cina:toast", { detail: { msg: `Assembled ${p.label} · ${p.frames.length} shots on V1` } }));
    }

    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <CutAssemblyBar activeId={activeId} onPick={pick}/>
        <BaseEditor key={mountKey} {...props}/>
      </div>
    );
  }

  window.EditorPanel = EditorWithCuts;
})();
