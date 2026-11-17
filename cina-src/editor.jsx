// editor.jsx — Cut: drag-and-drop editor, redesigned.
//
// Layout: bin (real thumbnails) · large program viewer · inspector.
// One big grouped toolbar drives everything; Cina panel automates
// fades, crossfades, ducking, levels and assembly. Fully responsive.
// Consumes "cina:editor-drop" from the Generate studio.

const { useState: useStateE, useEffect: useEffectE, useMemo: useMemoE, useRef: useRefE } = React;

// ─── DnD context ──────────────────────────────────────────────────────────
const DND = { current: null }; // { kind: 'bin' | 'clip', payload }

// ─── Real stills — same cast frames the Board and Generate use ───────────
const ED_CAST = ["calo-vey", "domek-ari", "evren-koll", "io-marsh", "nadya-ash", "rune-okafor", "siri-vale", "wren-soto"];
const ED_GRADES = [
  "sepia(.32) contrast(1.12) brightness(.78)",
  "saturate(.42) contrast(1.24) brightness(.7)",
  "hue-rotate(-12deg) saturate(.72) contrast(1.1) brightness(.82)",
  "saturate(.5) contrast(1.3) brightness(.62)",
  "sepia(.18) hue-rotate(160deg) saturate(.5) contrast(1.15) brightness(.7)",
];
function edHash(s) { let h = 0; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function edPhotoFor(key) { return "assets/cast/" + ED_CAST[edHash(key) % ED_CAST.length] + ".png"; }
function EdStill({ thumb, photo, dim = true }) {
  const src = photo || edPhotoFor(thumb);
  const grade = ED_GRADES[edHash(thumb || src) % ED_GRADES.length];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: tkc("bg") }}>
      <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", filter: grade, display: "block" }}/>
      {dim && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.05), rgba(8,8,10,.5) 88%)" }}/>}
    </div>
  );
}

// ─── Toolbar bits ─────────────────────────────────────────────────────────
function Toggle({ onLabel, on, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      height: 30, padding: "0 10px", borderRadius: "var(--r-2)",
      border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line)"}`,
      background: on ? "rgba(var(--accent-rgb),.1)" : "transparent",
      color: on ? "var(--c-amber)" : "var(--c-ink-4)",
      fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer", fontFamily: "var(--f-mono)", fontWeight: 700,
    }}>{onLabel}</button>
  );
}
const zoomBtn = {
  width: 24, height: 24, borderRadius: "var(--r-2)", border: "1px solid var(--c-line)",
  background: "var(--c-panel)", color: "var(--c-ink-2)", cursor: "pointer",
  fontSize: "var(--fs-body)", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
};

// ─── TIMELINE ─────────────────────────────────────────────────────────────
function Track({ track, zoom, muted, selected, hover, onSelectClip, onHover, onDropBin, onMoveClip }) {
  const h = track.primary ? 72 : 46;
  const ref = useRefE(null);

  const compatible = (item) => {
    if (track.kind === "video" && item?.thumb) return true;
    if (track.kind === "audio" && (item?.color || ["audio", "sfx", "score", "ambience", "dialogue"].includes(item?.kind))) return true;
    return track.kind === "video";
  };

  const onDragOver = (e) => {
    if (!DND.current) return;
    const item = DND.current.kind === "bin" ? DND.current.payload : null;
    if (item && !compatible(item)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = DND.current.kind === "bin" ? "copy" : "move";
    onHover(true);
  };
  const onDrop = (e) => {
    e.preventDefault();
    onHover(false);
    if (!DND.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dropTime = Math.max(0, (e.clientX - rect.left) / zoom);
    if (DND.current.kind === "bin") onDropBin(DND.current.payload, dropTime);
    else if (DND.current.kind === "clip") onMoveClip(DND.current.payload.id, dropTime);
    DND.current = null;
  };

  return (
    <div ref={ref} onDragOver={onDragOver} onDragLeave={() => onHover(false)} onDrop={onDrop}
         style={{
           position: "relative", height: h,
           borderBottom: "1px solid var(--c-line)",
           background: hover ? "rgba(var(--accent-rgb),.07)" : (track.primary ? "rgba(255,255,255,.015)" : "transparent"),
           outline: hover ? "1px dashed var(--c-amber)" : "none",
           outlineOffset: -1,
           opacity: muted ? .4 : 1,
           transition: "background .12s ease",
         }}>
      {track.clips.map(c => (
        <Clip key={c.id} clip={c} zoom={zoom} h={h} kind={track.kind}
              isSelected={selected === c.id}
              onClick={() => onSelectClip(c.id)}/>
      ))}
      {track.clips.length === 0 && hover && (
        <div style={{ position: "absolute", inset: 4, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".08em" }}>DROP HERE</span>
        </div>
      )}
    </div>
  );
}

function Clip({ clip, zoom, h, kind, isSelected, onClick }) {
  const w = Math.max(14, clip.dur * zoom);
  const x = clip.start * zoom;
  const fadeInW = Math.min(w * 0.6, (clip.fadeIn || 0) * zoom);
  const fadeOutW = Math.min(w * 0.6, (clip.fadeOut || 0) * zoom);

  const onDragStart = (e) => {
    DND.current = { kind: "clip", payload: { id: clip.id } };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", clip.label);
  };
  const onDragEnd = () => { DND.current = null; };

  const fadeOverlays = (
    <>
      {fadeInW > 2 && (
        <svg style={{ position: "absolute", left: 0, top: 0, height: "100%", width: fadeInW, zIndex: 3, pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 10 10">
          <path d="M0 10 L10 0 L0 0 Z" fill="rgba(8,8,10,.75)"/>
          <path d="M0 10 L10 0" stroke= "var(--c-amber)" strokeWidth=".5" fill="none"/>
        </svg>
      )}
      {fadeOutW > 2 && (
        <svg style={{ position: "absolute", right: 0, top: 0, height: "100%", width: fadeOutW, zIndex: 3, pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 10 10">
          <path d="M0 0 L10 10 L10 0 Z" fill="rgba(8,8,10,.75)"/>
          <path d="M0 0 L10 10" stroke= "var(--c-amber)" strokeWidth=".5" fill="none"/>
        </svg>
      )}
      {clip.transition === "xfade" && (
        <span title="Crossfade" style={{ position: "absolute", left: 2, top: 2, zIndex: 4, padding: "0 4px", borderRadius: "var(--r-1)", background: "rgba(var(--accent-rgb),.9)", color: tkc("bg"), fontSize: "var(--fs-label)", fontWeight: 700, fontFamily: "var(--f-mono)" }}>X</span>
      )}
    </>
  );

  if (kind === "video") {
    return (
      <button onClick={onClick} draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
              style={{
                position: "absolute",
                left: x, top: 4, height: h - 8, width: w - 2,
                padding: 0, border: `1px solid ${isSelected ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-2)", overflow: "hidden",
                background: clip.color || "var(--c-panel-2)",
                boxShadow: isSelected ? "0 0 0 1px rgba(var(--accent-rgb),.4), 0 0 12px rgba(var(--accent-rgb),.2)" : "none",
                textAlign: "left",
                zIndex: isSelected ? 3 : 2,
                cursor: "grab",
                opacity: (clip.opacity != null ? clip.opacity : 100) / 100,
              }}>
        <div style={{ position: "absolute", inset: 0 }}><EdStill thumb={clip.thumb} photo={clip.photo}/></div>
        {fadeOverlays}
        <div style={{ position: "absolute", left: 6, bottom: 4, right: 6, zIndex: 4 }}>
          <span style={{
            display: "block", fontSize: "var(--fs-label)", color: tkc("white"), fontFamily: "var(--f-mono)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            textShadow: "0 1px 2px rgba(0,0,0,.9)",
          }}>{clip.label}</span>
        </div>
      </button>
    );
  }

  const vol = clip.volume != null ? clip.volume : 80;
  const bars = Math.max(8, Math.floor(w / 3));
  return (
    <button onClick={onClick} draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
            style={{
              position: "absolute",
              left: x, top: 4, height: h - 8, width: w - 2,
              padding: "4px 6px",
              border: `1px solid ${isSelected ? "var(--c-amber)" : clip.color}`,
              borderRadius: "var(--r-2)",
              background: `${clip.color}26`,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              textAlign: "left", overflow: "hidden",
              zIndex: isSelected ? 3 : 2,
              cursor: "grab",
            }}>
      {fadeOverlays}
      <span style={{
        fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontFamily: "var(--f-mono)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{clip.label}{vol !== 80 ? ` · ${vol}%` : ""}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 1, height: h * 0.35, justifyContent: "space-between" }}>
        {Array.from({ length: bars }).map((_, i) => {
          const seed = (i * 9301 + 49297) % 233280;
          const amp = (0.25 + (seed / 233280) * 0.7) * (vol / 100 + 0.15);
          return <div key={i} style={{ width: 1, height: `${Math.min(100, amp * 100)}%`, background: clip.color, opacity: 0.85 }}/>;
        })}
      </div>
    </button>
  );
}

// ─── WALKTHROUGH ──────────────────────────────────────────────────────────
const WALK_STEPS = [
  { target: "bin",      title: "Pick a shot",      body: "Every take generated for this film lands here — including picks sent from the Generate studio. Drag any thumbnail onto the timeline, or double-click to append.", arrow: "left" },
  { target: "timeline", title: "Drop on a track",  body: "V1 holds picture, V2 titles. A1/A2/A3 are dialogue, sfx and score. Tracks light up amber when they accept your drop. Drag the ruler to scrub.", arrow: "down" },
  { target: "toolbar",  title: "One toolbar, everything", body: "Transport, Split / Dup / Mark / Del, fade in, fade out and crossfade, snap & ripple, and a zoom that fits the whole cut. Hover any button for its shortcut.", arrow: "up" },
  { target: "inspector",title: "Tune the selected clip", body: "Click a clip and this panel opens: fades, transition type, volume, opacity, speed — all live. Esc closes it.", arrow: "right" },
  { target: "cina-btn", title: "Let Cina do the pass", body: "Cina's auto-editor assembles the bin, crossfades every cut, fades the program, ducks music under dialogue and normalizes levels — one click each.", arrow: "up" },
  { target: "render",   title: "Render & deliver", body: "When the cut is locked, render straight to the next stage — Score → Release.", arrow: "up" },
];

function Walkthrough({ step, onFinish }) {
  return <CinaTour id="cut" start={Math.max(0, step || 0)} steps={WALK_STEPS.map(s => ({ target: `[data-walk="${s.target}"]`, title: s.title, body: s.body }))} onDone={onFinish}/>;
}

// ─── helpers ──────────────────────────────────────────────────────────────

function toast(msg) {
  cinaToast(msg);
}

