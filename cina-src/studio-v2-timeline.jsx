// studio-v2-timeline.jsx — Player + multi-track timeline for Studio v2 workspace.

const { useState: useStateWT, useEffect: useEffectWT, useRef: useRefWT } = React;

// Draft fidelity per shot — the film is always playable; renders replace boards in place.
const WS_FIDELITY = {
  approved: { label: "Final", short: "FINAL", color: "var(--c-good)" },
  review:   { label: "Render · review", short: "RENDER", color: "var(--c-amber)" },
  draft:    { label: "Animatic", short: "ANIM", color: "var(--c-agent-visual)" },
  queued:   { label: "Board frame", short: "BOARD", color: "var(--c-ink-3)" },
};

function wsFmt(t) {
  const m = Math.floor(t / 60), s = Math.floor(t % 60), f = Math.floor((t % 1) * 24);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
}

function wsClipAt(clips, t) {
  return clips.find(c => t >= c.start && t < c.start + c.dur) || null;
}

function WsPlayer({ tracks, time, total, playing, onToggle, onSeek, selected, fidelity }) {
  const shot = wsClipAt(tracks.V1, time) || tracks.V1[0];
  const title = wsClipAt(tracks.V2, time);
  const line = wsClipAt(tracks.A1, time);
  const fid = shot ? WS_FIDELITY[fidelity(shot)] : null;
  const isBoard = shot && (fidelity(shot) === "queued");
  const isAnim = shot && (fidelity(shot) === "draft");
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1, gap: 10 }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", height: "100%", maxWidth: "100%", aspectRatio: "16 / 9", containerType: "inline-size", background: tkc("void"), borderRadius: "var(--r-2)", overflow: "hidden", boxShadow: "0 0 0 1px var(--c-line)" }}>
          {shot && <div key={shot.id} style={{ position: "absolute", inset: 0, filter: isBoard ? "grayscale(1) contrast(1.3) brightness(.85)" : isAnim ? "saturate(.35)" : "none", animation: "wsFade .25s ease" }}>
            <FrameThumb kind={shot.thumb} usePhoto/>
          </div>}
          {isBoard && <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg, rgba(0,0,0,.0) 0 6px, rgba(0,0,0,.18) 6px 7px)" }}></div>}
          {title && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontSize: "6cqw", whiteSpace: "nowrap", letterSpacing: ".16em", color: tkc("ink"), textShadow: "0 2px 24px rgba(0,0,0,.7)" }}>{title.label.replace(/^TITLE:\s*/, "")}</div>}
          {line && <div style={{ position: "absolute", left: 0, right: 0, bottom: "7%", textAlign: "center", fontSize: "clamp(12px, 1.4vw, 17px)", color: tkc("white"), textShadow: "0 1px 6px rgba(0,0,0,.9)" }}>{line.label.split("—")[1]?.trim()}</div>}
          <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), background: "rgba(0,0,0,.55)", padding: "4px 8px", borderRadius: "var(--r-2)" }}>{shot ? shot.label : ""}</span>
            {fid && <span className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), background: "rgba(0,0,0,.55)", padding: "4px 8px", borderRadius: "var(--r-2)" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: fid.color }}></span>{fid.label.toUpperCase()}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
        <button onClick={() => onSeek(0)} className="ws-ctl" title="Start">⏮</button>
        <button onClick={() => { const i = tracks.V1.findIndex(c => c === shot); const p = tracks.V1[Math.max(0, i - 1)]; p && onSeek(p.start); }} className="ws-ctl" title="Previous shot">◀︎◀︎</button>
        <button onClick={onToggle} className="ws-ctl ws-ctl--play" title="Play / pause (Space)">{playing ? "❚❚" : "▶"}</button>
        <button onClick={() => { const i = tracks.V1.findIndex(c => c === shot); const n = tracks.V1[i + 1]; n && onSeek(n.start); }} className="ws-ctl" title="Next shot">▶︎▶︎</button>
        <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", minWidth: 150, textAlign: "center" }}>{wsFmt(time)} <span style={{ color: "var(--c-ink-4)" }}>/ {wsFmt(total)}</span></span>
      </div>
    </div>
  );
}

const WS_TRACKS = [
  { id: "V2", label: "Titles", h: 26 },
  { id: "V1", label: "Picture", h: 54 },
  { id: "A1", label: "Dialogue", h: 24 },
  { id: "A2", label: "SFX", h: 22 },
  { id: "A3", label: "Music", h: 24 },
];

function WsTimeline({ tracks, total, time, onSeek, selectedId, onSelect, zoom, setZoom, proposal, fidelity, kind, onTracks }) {
  const scrollRef = useRefWT(null);
  const laneRef = useRefWT(null);
  const [drag, setDrag] = useStateWT(false);
  const [edit, setEdit] = useStateWT(null);
  useEffectWT(() => {
    if (!edit) return;
    const mv = (e) => {
      const w = laneRef.current.getBoundingClientRect().width;
      const d = Math.round(((e.clientX - edit.x) / w) * edit.total * 4) / 4;
      const snap = edit.snap, c0 = snap[edit.track].find(c => c.id === edit.id);
      if (edit.track === "V1") {
        const by = Math.max(1 - c0.dur, d);
        onTracks(by ? window.wsRippleExtend(snap, edit.id, by) : snap);
      } else {
        const next = edit.mode === "trim"
          ? { ...c0, dur: Math.max(0.25, c0.dur + d) }
          : { ...c0, start: Math.max(0, Math.min(edit.total - c0.dur, c0.start + d)) };
        onTracks({ ...snap, [edit.track]: snap[edit.track].map(c => c.id === edit.id ? next : c) });
      }
    };
    const up = () => setEdit(null);
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [edit]);
  const beginEdit = (e, c, track, mode) => {
    if (!onTracks || proposal) return;
    e.stopPropagation();
    onSelect(c.id, track);
    setEdit({ x: e.clientX, id: c.id, track, mode, snap: tracks, total });
  };
  const pct = (s) => `${(s / total) * 100}%`;
  const seekFromEvent = (e) => {
    const r = laneRef.current.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(total - 0.01, ((e.clientX - r.left) / r.width) * total)));
  };
  useEffectWT(() => {
    if (!drag) return;
    const mv = (e) => seekFromEvent(e), up = () => setDrag(false);
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag]);

  // Scenes derived from shot labels ("14A · …" → scene 14)
  const scenes = [];
  tracks.V1.forEach(c => {
    const n = (c.label.match(/^(\d+)/) || [])[1];
    const last = scenes[scenes.length - 1];
    if (last && last.n === n) last.end = c.start + c.dur; else scenes.push({ n, start: c.start, end: c.start + c.dur });
  });
  const removed = new Set(proposal?.removed || []);
  const ticks = [];
  const step = zoom >= 2 ? 2 : 5;
  for (let s = 0; s <= total; s += step) ticks.push(s);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, borderTop: "1px solid var(--c-line)", background: "var(--c-panel)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 14px", borderBottom: "1px solid var(--c-line)" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>TIMELINE</span>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>Drag edges to trim · drag sound and titles to move</span>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(WS_FIDELITY).map(([k, f]) => (
            <span key={k} className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}><span style={{ width: 8, height: 3, borderRadius: "var(--r-1)", background: f.color }}></span>{f.label}</span>
          ))}
        </div>
        <span style={{ flex: 1 }}></span>
        <label className="t-mono" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>ZOOM
          <input type="range" min="1" max="4" step="0.5" value={zoom} onChange={e => setZoom(+e.target.value)} style={{ width: 90, accentColor: tkc("amber") }}/>
        </label>
      </div>
      <div style={{ display: "flex", minHeight: 0, flex: 1 }}>
        <div style={{ width: 84, flexShrink: 0, borderRight: "1px solid var(--c-line)" }}>
          <div style={{ height: 20 }}></div>
          <div style={{ height: 20 }}></div>
          {WS_TRACKS.map(tr => (
            <div key={tr.id} style={{ height: tr.h, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{tr.id}</span>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{tr.label}</span>
            </div>
          ))}
        </div>
        <div ref={scrollRef} style={{ flex: 1, minWidth: 0, overflowX: "auto", overflowY: "hidden" }}>
          <div ref={laneRef} style={{ position: "relative", width: `${zoom * 100}%`, minWidth: "100%", paddingRight: 0 }}>
            <div onPointerDown={(e) => { seekFromEvent(e); setDrag(true); }} style={{ position: "relative", height: 20, cursor: "ew-resize", borderBottom: "1px solid var(--c-line)" }}>
              {ticks.map(s => (
                <span key={s} className="t-mono" style={{ position: "absolute", left: pct(s), top: 4, fontSize: "var(--fs-label)", color: "var(--c-ink-4)", transform: s === 0 ? "none" : "translateX(-50%)" }}>{s}s</span>
              ))}
            </div>
            <div style={{ position: "relative", height: 20 }}>
              {scenes.map(sc => (
                <div key={sc.n + sc.start} style={{ position: "absolute", left: pct(sc.start), width: pct(sc.end - sc.start), top: 3, height: 14, borderLeft: "1px solid var(--c-line-3)", padding: "0 6px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span className="t-mono" style={{ color: "var(--c-amber)" }}>SC {sc.n}</span> {(window.SCRIPT_SCENES.find(s => s.number === sc.n) || {}).location || ""}
                </div>
              ))}
            </div>
            {WS_TRACKS.map(tr => (
              <div key={tr.id} style={{ position: "relative", height: tr.h, marginBottom: 4, background: "var(--c-bg)", borderRadius: "var(--r-1)" }}>
                {(tracks[tr.id] || []).map(c => {
                  const sel = c.id === selectedId;
                  const isRemoved = removed.has(c.id);
                  const isAdded = proposal?.added?.includes(c.id);
                  const fk = tr.id === "V1" ? fidelity(c) : null;
                  return (
                    <button key={c.id} onClick={(e) => { e.stopPropagation(); onSelect(c.id, tr.id); }} onPointerDown={(e) => tr.id !== "V1" && beginEdit(e, c, tr.id, "move")} title={c.label + (tr.id === "V1" ? " — drag right edge to trim" : " — drag to move, right edge to trim")}
                      style={{
                        position: "absolute", left: pct(c.start), width: `calc(${pct(c.dur)} - 2px)`, top: 0, bottom: 0,
                        padding: 0, border: "none", borderRadius: "var(--r-1)", cursor: "pointer", overflow: "hidden", textAlign: "left",
                        background: tr.id === "V1" ? tkc("bg") : c.color, opacity: isRemoved ? .45 : (tr.id === "V1" ? 1 : .8),
                        boxShadow: sel ? "0 0 0 2px var(--c-amber)" : isAdded ? "0 0 0 1.5px var(--c-amber-x)" : "inset 0 0 0 1px rgba(255,255,255,.06)",
                        transition: edit ? "none" : "box-shadow .12s, opacity .2s", cursor: tr.id === "V1" ? "pointer" : "grab",
                      }}>
                      {!proposal && <span onPointerDown={(e) => beginEdit(e, c, tr.id, "trim")} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 7, cursor: "ew-resize", zIndex: 2, background: sel ? "rgba(var(--accent-rgb),.55)" : "transparent" }}></span>}
                      {tr.id === "V1" && <div style={{ position: "absolute", inset: 0, opacity: .75, filter: fk === "queued" ? "grayscale(1)" : fk === "draft" ? "saturate(.35)" : "none" }}><FrameThumb kind={c.thumb} usePhoto/></div>}
                      {tr.id === "V1" && <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: WS_FIDELITY[fk].color }}></span>}
                      {isRemoved && <span style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg, rgba(201,85,72,.55) 0 5px, transparent 5px 10px)" }}></span>}
                      <span style={{ position: "relative", display: "block", padding: tr.id === "V1" ? "4px 6px" : "0 6px", lineHeight: tr.id === "V1" ? 1.2 : `${tr.h}px`, fontSize: "var(--fs-label)", color: tr.id === "V1" || ["amb", "score"].includes(c.kind) || c.color === tkc("blood") ? tkc("ink") : tkc("panel"), textShadow: tr.id === "V1" ? "0 1px 3px rgba(0,0,0,.9)" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: pct(time), width: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: -0.5, width: 1, background: "var(--c-amber)" }}></div>
              <div style={{ position: "absolute", top: 0, left: -5, width: 10, height: 10, background: "var(--c-amber)", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WsPlayer, WsTimeline, WS_FIDELITY, wsFmt, wsClipAt });
