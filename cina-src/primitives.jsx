// primitives.jsx — Reusable UI atoms: icons, agent glyphs, frame thumbnails.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Refined optical icon set — precision 1.6px stroke & balanced cinema proportions
function Icon({ name, size = 14, className }) {
  const s = size;
  const props = {
    width: s, height: s, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round", strokeLinejoin: "round",
    className
  };
  switch (name) {
    case "play":return <svg {...props}><path d="M7.5 4.8a1 1 0 0 1 1.52-.85l11.2 7.2a1 1 0 0 1 0 1.7l-11.2 7.2A1 1 0 0 1 7.5 19.2z" fill="currentColor" stroke="none" /></svg>;
    case "pause":return <svg {...props}><rect x="6.5" y="4.5" width="3.8" height="15" rx="1" fill="currentColor" stroke="none" /><rect x="13.7" y="4.5" width="3.8" height="15" rx="1" fill="currentColor" stroke="none" /></svg>;
    case "rec":return <svg {...props}><circle cx="12" cy="12" r="5.5" fill="currentColor" stroke="none" /></svg>;
    case "chat":return <svg {...props}><path d="M21 12a8.5 8.5 0 0 1-8.5 8.5 8.7 8.7 0 0 1-3.8-.85L4 21l1.35-4.7A8.5 8.5 0 1 1 21 12z" /></svg>;
    case "board":return <svg {...props}><rect x="3" y="4" width="7.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="7.5" height="6.5" rx="1" /><rect x="3" y="13.5" width="7.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="7.5" height="6.5" rx="1" /></svg>;
    case "book":return <svg {...props}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17h14" /></svg>;
    case "vault":return <svg {...props}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5" /></svg>;
    case "ref":return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 9.5h18" /><circle cx="7.5" cy="14" r="1.4" fill="currentColor" stroke="none" /></svg>;
    case "search":return <svg {...props}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.2 4.2" /></svg>;
    case "send":return <svg {...props}><path d="M21 3L10 14" /><path d="M21 3l-7 18-4-7-7-4z" /></svg>;
    case "plus":return <svg {...props}><path d="M12 5.5v13M5.5 12h13" /></svg>;
    case "x":return <svg {...props}><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg>;
    case "check":return <svg {...props}><path d="M5 12.5l4.5 4.5 9.5-10" /></svg>;
    case "chev-r":return <svg {...props}><path d="M9.5 6l6 6-6 6" /></svg>;
    case "chev-d":return <svg {...props}><path d="M6.5 9.5l5.5 5.5 5.5-5.5" /></svg>;
    case "chev-l":return <svg {...props}><path d="M14.5 6l-6 6 6 6" /></svg>;
    case "settings":return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case "more":return <svg {...props}><circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>;
    case "drag":return <svg {...props}><circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" /></svg>;
    case "upload":return <svg {...props}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>;
    case "wand":return <svg {...props}><path d="M4 20L15 9M17.5 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9zM6.5 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" /></svg>;
    case "film":return <svg {...props}><rect x="3" y="4.5" width="18" height="15" rx="1.5" /><path d="M7 4.5v15M17 4.5v15M3 9h4M17 9h4M3 15h4M17 15h4" /></svg>;
    case "actor":return <svg {...props}><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" /></svg>;
    case "globe":return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.5 3.7 5.6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.6-3.7-9S9.6 5.5 12 3z" /></svg>;
    case "lock":return <svg {...props}><rect x="5" y="11" width="14" height="9.5" rx="1.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    case "spark":return <svg {...props}><path d="M12 3l1.8 5.4L19 10.2l-5.2 1.8L12 17.5l-1.8-5.5L5 10.2l5.2-1.8z" /></svg>;
    case "sparkles":return <svg {...props}><path d="M11 3l1.6 4.2L17 9l-4.4 1.8L11 15l-1.6-4.2L5 9l4.4-1.8z" /><path d="M18 14l.8 2 2 .8-2 .8L18 20l-.8-2.4L15 17l2.2-1z" /></svg>;
    case "reload":
    case "refresh":return <svg {...props}><path d="M4 12a8 8 0 0 1 13.8-5.5L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-13.8 5.5L4 15" /><path d="M4 20v-5h5" /></svg>;
    case "dot":return <svg {...props}><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></svg>;
    case "circle":return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>;
    case "ticket":return <svg {...props}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" /><path d="M14 6.5v11" strokeDasharray="2 2" /></svg>;
    case "vol":
    case "sound":return <svg {...props}><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" /></svg>;
    case "mute":return <svg {...props}><path d="M11 5L6 9H3v6h3l5 4z" /><path d="M21 9l-5 6M16 9l5 6" /></svg>;
    case "apple":return <svg {...props}><path d="M16 4c-1.5 0-2.8.8-3.5 2-.7-1.2-2-2-3.5-2C6.5 4 4 6.5 4 10c0 4 4 10 8 10s8-6 8-10c0-3.5-2.5-6-4-6z" fill="currentColor" stroke="none" /></svg>;
    case "share":return <svg {...props}><path d="M4 13v6a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-6" /><path d="M16 7l-4-4-4 4M12 3v12" /></svg>;
    case "shuffle":return <svg {...props}><path d="M16 3h5v5M21 3l-7 7M16 21h5v-5M21 21l-5-5M3 4l5 5M3 20l5-5" /></svg>;
    case "alert":return <svg {...props}><path d="M12 3.5l9.5 16.5h-19z" /><path d="M12 9.5v4.5M12 17v.5" /></svg>;
    case "shield":return <svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></svg>;
    case "clock":return <svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></svg>;
    case "type":return <svg {...props}><path d="M5 6h14M12 6v14M9 20h6" /></svg>;
    case "edit":return <svg {...props}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></svg>;
    case "grid":return <svg {...props}><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></svg>;
    case "close":return <svg {...props}><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /></svg>;
    case "bell":return <svg {...props}><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.8 2H4.2z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;
    case "apps":return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "heart":return <svg {...props}><path d="M12 20.2s-7-4.5-9.2-8.8A4.9 4.9 0 0 1 12 6.2a4.9 4.9 0 0 1 9.2 5.2c-2.2 4.3-9.2 8.8-9.2 8.8z" /></svg>;
    case "user":return <svg {...props}><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" /></svg>;
    case "inbox":return <svg {...props}><path d="M4 13h4l2 3h4l2-3h4" /><path d="M4 13l2-8h12l2 8v6H4z" /></svg>;
    case "wallet":return <svg {...props}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" /></svg>;
    case "folder":return <svg {...props}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
    case "trend":return <svg {...props}><path d="M3 17l6-6 4 4 7-8" /><path d="M20 7h-5M20 7v5" /></svg>;
    case "arrow-right":return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "coin":return <svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M14.5 9.5c-.4-.9-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2.1-.6-2.5-1.5M12 6.5V8M12 16v1.5" /></svg>;
    case "rows":return <svg {...props}><rect x="4" y="5" width="16" height="4" rx="1" /><rect x="4" y="15" width="16" height="4" rx="1" /></svg>;
    case "doc":return <svg {...props}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>;
    case "scissors":return <svg {...props}><circle cx="6" cy="7" r="2.5" /><circle cx="6" cy="17" r="2.5" /><path d="M8 8.5L20 18M8 15.5L20 6" /></svg>;
    case "music":return <svg {...props}><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>;
    case "diamond":return <svg {...props}><path d="M12 3l9 9-9 9-9-9z" /></svg>;
    case "tag":return <svg {...props}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" /></svg>;
    case "archive":return <svg {...props}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11h14V8M10 12h4" /></svg>;
    case "robot":return <svg {...props}><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M12 4v4M9 13v1M15 13v1M3 12v3M21 12v3" /></svg>;
    case "key":return <svg {...props}><circle cx="8" cy="14" r="4" /><path d="M11 11l9-9M17 5l2 2M15 7l2 2" /></svg>;
    case "home":return <svg {...props}><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" /></svg>;
    case "users":return <svg {...props}><circle cx="9" cy="8" r="3.4" /><path d="M3 20c.8-3.5 3.2-5.4 6-5.4s5.2 1.9 6 5.4" /><path d="M16 4.8a3.4 3.4 0 0 1 0 6.8M18.2 14.8c1.5.7 2.5 2.5 2.8 5.2" /></svg>;
    case "sliders":return <svg {...props}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>;
    case "download":return <svg {...props}><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></svg>;
    case "bookmark":return <svg {...props}><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2L5.5 20.5v-16a1 1 0 0 1 1-1z" /></svg>;
    case "bookmark-fill":return <svg {...props}><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2L5.5 20.5v-16a1 1 0 0 1 1-1z" fill="currentColor" stroke="currentColor" /></svg>;
    case "calendar":return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="1.5" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case "mic":return <svg {...props}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3.5" /></svg>;
    case "captions":return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3" /></svg>;
    case "fullscreen":return <svg {...props}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>;
    case "flag":return <svg {...props}><path d="M5 21V4M5 4h12l-2 4 2 4H5" /></svg>;
    case "compass":return <svg {...props}><circle cx="12" cy="12" r="9" /><polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8" /></svg>;
    case "eye":return <svg {...props}><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></svg>;
    case "info":return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
    default:return <svg {...props}><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" /></svg>;
  }
}

// Agent badge — circular monogram in agent color
function AgentBadge({ agent, size = 22 }) {
  const a = window.AGENTS.find((x) => x.id === agent) || { glyph: "C", color: "var(--c-amber)", name: "Cina" };
  return (
    <div
      title={a.name}
      style={{
        width: size, height: size,
        borderRadius: "50%",
        background: "var(--c-panel-2)",
        border: `1.5px solid ${a.color}`,
        color: a.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-mono)",
        fontSize: size * 0.42,
        fontWeight: 600,
        letterSpacing: 0,
        flexShrink: 0
      }}>
      
      {a.glyph}
    </div>);

}

// CINA wordmark — italic Fraunces. The whole brand, no mark, no chrome.
// `size` controls font-size; renders as an inline span so it can sit
// beside other text on a single header line.
function CinaMark({ size = 26, color = "var(--c-ink)" }) {
  return (
    <span style={{
      fontFamily: "var(--f-display)",
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: size,
      lineHeight: 1,
      color,
      letterSpacing: "-0.01em",
      flexShrink: 0,
      display: "inline-block"
    }}>Cina</span>);

}

// Legacy callsite — now identical to CinaMark
function CinaBadge({ size = 28 }) {
  return <CinaMark size={size} />;
}

// Map of thumb-kind → real photo file. When a kind has an entry here, we
// render the photo instead of the procedural SVG. Keyed off each title's
// `thumb` value. 16 cinematic stills across four genre families:
//   A = noir / urban-night · B = western · C = sci-fi · D = drama / horror
const C = "assets/covers/";
const THUMB_IMAGES = {
  // ── Noir / urban night ──
  "noir-m": C + "a1.png", // man, wet street, dusk
  "noir-f": C + "a4.png", // woman, wet alley, night
  "face-night": C + "d1.png", // intense face, neon night
  "alley-night": C + "d4.png", // man, cobblestone alley, night
  // ── Mood / interior / mystery ──
  "lantern": C + "a2.png", // lantern in dark forest
  "window-rain": C + "a3.png", // woman at rainy window
  "interior-dim": C + "d2.png", // dim room interior
  "scared-hall": C + "d3.png", // couple in hallway, fear
  // ── Western ──
  "west-rider": C + "b1.png", // lone rider, mesa, sunset
  "west-riders": C + "b2.png", // posse, monument valley
  "west-canyon": C + "b3.png", // rider in dusty canyon
  "west-dusk": C + "b4.png", // figure + horse, dead tree
  // ── Sci-fi ──
  "sci-surface": C + "c1.png", // astronauts, red planet
  "sci-neon": C + "c2.png", // explorer, neon alien world
  "sci-ship": C + "c3.png", // astronaut, ship porthole
  "sci-city": C + "c4.png", // figure over future city

  // ── Legacy keys (series episodes & ad-hoc) mapped onto the new stills ──
  "darkroom-wide": C + "a3.png",
  "darkroom-est": C + "a4.png",
  "developer": C + "d2.png",
  "voss-eye": C + "d1.png",
  "voss-enter": C + "a1.png",
  "the-photo": C + "a3.png",
  "phone": C + "c3.png",
  "frequency": C + "c2.png",
  "swallows": C + "a3.png",
  "noir": C + "a4.png",
  "thriller": C + "d4.png",
  "western": C + "b1.png",
  "drama": C + "a3.png",
  "earth": C + "c1.png",
  "cosmos": C + "c4.png",
  "ice": C + "c1.png",
  "vacuum": C + "c3.png",
  "dunes": C + "b4.png",
  "horizon": C + "b3.png"
};

// Deterministic fallback: unknown kinds hash into the full 16-still set so
// shelves stay varied.
const _THUMB_FALLBACK = [
C + "a1.png", C + "a2.png", C + "a3.png", C + "a4.png",
C + "b1.png", C + "b3.png", C + "c1.png", C + "c3.png",
C + "d1.png", C + "d2.png", C + "d4.png", C + "b4.png"];

function _photoForKind(kind) {
  if (THUMB_IMAGES[kind]) return THUMB_IMAGES[kind];
  if (!kind) return _THUMB_FALLBACK[0];
  let h = 0;
  for (let i = 0; i < kind.length; i++) h = h * 31 + kind.charCodeAt(i) | 0;
  return _THUMB_FALLBACK[Math.abs(h) % _THUMB_FALLBACK.length];
}

// Procedural frame thumbnail — uses a real photo if available, otherwise
// falls back to a noir-styled SVG composition.
function FrameThumb({ kind, w = 220, h = 124, label, usePhoto = false }) {
  const photo = usePhoto ? _photoForKind(kind) : null;
  if (photo) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: tkc("bg") }}>
        <img src={photo} alt={label || kind}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(.9) contrast(1.05)" }} />
        
        {label &&
        <div style={{ position: "absolute", left: 8, bottom: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white"), textShadow: "0 1px 4px rgba(0,0,0,.8)" }}>{label}</div>
        }
      </div>);

  }
  const compositions = {
    "darkroom-est":
    <g>
        <rect width="100%" height="100%" fill={tkc("bg")} />
        <rect x="0" y="60%" width="100%" height="40%" fill={tkc("bg")} />
        {/* building silhouette */}
        <rect x="20%" y="20%" width="60%" height="50%" fill={tkc("panel")} />
        {/* lit window */}
        <rect x="38%" y="32%" width="6%" height="9%" fill= "var(--c-amber)" opacity="0.85" />
        <rect x="50%" y="42%" width="4%" height="6%" fill= "var(--c-amber)" opacity="0.5" />
        {/* sodium lamp glow */}
        <circle cx="14%" cy="58%" r="7" fill= "var(--c-amber)" opacity="0.9" />
        <circle cx="14%" cy="58%" r="22" fill= "var(--c-amber)" opacity="0.18" />
        {/* rain streaks */}
        {Array.from({ length: 18 }).map((_, i) =>
      <line key={i} x1={`${(i * 7 + 3) % 100}%`} y1={`${i * 13 % 100}%`} x2={`${(i * 7 + 3) % 100 - 2}%`} y2={`${i * 13 % 100 + 8}%`} stroke="var(--c-agent-writer)" strokeWidth="0.5" opacity="0.25" />
      )}
      </g>,

    "voss-enter":
    <g>
        <rect width="100%" height="100%" fill={tkc("on-amber")} />
        <rect width="100%" height="100%" fill="url(#redwash)" opacity="0.7" />
        {/* doorway silhouette */}
        <rect x="42%" y="15%" width="16%" height="80%" fill="var(--c-void)" />
        {/* figure silhouette */}
        <ellipse cx="50%" cy="38%" rx="10" ry="12" fill="var(--c-void)" />
        <rect x="44%" y="48%" width="12%" height="40%" fill="var(--c-void)" />
        <defs>
          <radialGradient id="redwash" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--c-blood)" />
            <stop offset="100%" stopColor={tkc("on-amber")} />
          </radialGradient>
        </defs>
      </g>,

    "developer":
    <g>
        <rect width="100%" height="100%" fill={tkc("bg")} />
        <rect x="10%" y="55%" width="80%" height="40%" fill={tkc("on-amber")} stroke="var(--c-blood)" strokeWidth="0.5" />
        {/* photo emerging — amber rectangle on liquid */}
        <rect x="32%" y="58%" width="36%" height="24%" fill="var(--c-agent-writer)" opacity="0.7" />
        <rect x="38%" y="62%" width="24%" height="16%" fill={tkc("panel-2")} />
        {/* ripples */}
        <ellipse cx="50%" cy="80%" rx="60" ry="3" fill="none" stroke="var(--c-blood)" strokeWidth="0.5" opacity="0.5" />
        <ellipse cx="50%" cy="80%" rx="80" ry="4" fill="none" stroke="var(--c-blood)" strokeWidth="0.5" opacity="0.3" />
        {/* safelight glow */}
        <circle cx="85%" cy="15%" r="14" fill="var(--c-blood-l)" opacity="0.6" />
      </g>,

    "voss-eye":
    <g>
        <rect width="100%" height="100%" fill="var(--c-void)" />
        {/* eye — extreme close up */}
        <ellipse cx="50%" cy="50%" rx="60" ry="22" fill={tkc("panel-2")} />
        <circle cx="50%" cy="50%" r="20" fill={tkc("line-2")} />
        <circle cx="50%" cy="50%" r="9" fill="var(--c-void)" />
        {/* catchlight — amber */}
        <circle cx="48%" cy="46%" r="2" fill= "var(--c-amber)" />
        {/* lashes */}
        {Array.from({ length: 9 }).map((_, i) =>
      <line key={i} x1={`${42 + i * 2}%`} y1="38%" x2={`${42 + i * 2}%`} y2="34%" stroke="var(--c-void)" strokeWidth="1" />
      )}
      </g>,

    "the-photo":
    <g>
        <rect width="100%" height="100%" fill={tkc("on-amber")} />
        {/* photo paper edges — subtle */}
        <rect x="6%" y="6%" width="88%" height="88%" fill="var(--c-agent-writer)" opacity="0.08" />
        {/* window */}
        <rect x="20%" y="18%" width="40%" height="60%" fill="var(--c-void)" />
        <line x1="40%" y1="18%" x2="40%" y2="78%" stroke={tkc("line-2")} strokeWidth="1" />
        <line x1="20%" y1="48%" x2="60%" y2="48%" stroke={tkc("line-2")} strokeWidth="1" />
        {/* her — figure at window */}
        <ellipse cx="40%" cy="38%" rx="6" ry="8" fill="var(--c-agent-writer)" opacity="0.85" />
        <rect x="36%" y="44%" width="8%" height="24%" fill="var(--c-agent-writer)" opacity="0.7" />
        {/* the shape behind — barely there */}
        <ellipse cx="55%" cy="42%" rx="5" ry="7" fill="var(--c-void)" opacity="0.85" />
        <rect x="52%" y="48%" width="6%" height="20%" fill="var(--c-void)" opacity="0.7" />
      </g>,

    "darkroom-wide":
    <g>
        <rect width="100%" height="100%" fill={tkc("void")} />
        {/* corridor / one-point perspective */}
        <polygon points="0,0 100,0 70,40 30,40" fill={tkc("on-amber")} opacity="0.4" />
        <polygon points="0,100 100,100 70,60 30,60" fill={tkc("on-amber")} opacity="0.4" />
        {/* hanging photos — silhouettes */}
        {[15, 32, 50, 68, 85].map((x, i) =>
      <g key={i}>
            <line x1={`${x}%`} y1="20%" x2={`${x}%`} y2="35%" stroke="var(--c-line-3)" strokeWidth="0.5" />
            <rect x={`${x - 3}%`} y="30%" width="6%" height="9%" fill={tkc("on-amber")} stroke={tkc("line-2")} strokeWidth="0.3" />
          </g>
      )}
        {/* figure — small, seated */}
        <ellipse cx="50%" cy="78%" rx="4" ry="5" fill="var(--c-void)" />
        <rect x="46%" y="80%" width="8%" height="14%" fill="var(--c-void)" />
        {/* safelight wash */}
        <rect width="100%" height="100%" fill="var(--c-blood)" opacity="0.18" />
      </g>,

    "timestamp":
    <g>
        <rect width="100%" height="100%" fill={tkc("bg")} />
        {/* film canister */}
        <circle cx="50%" cy="50%" r="42" fill={tkc("panel-2")} stroke="var(--c-line-3)" strokeWidth="1" />
        <circle cx="50%" cy="50%" r="10" fill="var(--c-void)" />
        {/* label / timestamp */}
        <rect x="28%" y="42%" width="44%" height="16%" fill={tkc("bg")} stroke= "var(--c-amber)" strokeWidth="0.5" />
        <text x="50%" y="52%" textAnchor="middle" fill= "var(--c-amber)" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="600">05·07·26 · 02:14</text>
      </g>,

    "phone":
    <g>
        <rect width="100%" height="100%" fill={tkc("bg")} />
        {/* phone — rotary, on table */}
        <rect x="0" y="65%" width="100%" height="35%" fill={tkc("on-amber")} />
        <ellipse cx="50%" cy="65%" rx="40" ry="6" fill={tkc("line-2")} />
        <rect x="38%" y="55%" width="24%" height="14%" rx="2" fill="var(--c-void)" />
        <circle cx="50%" cy="58%" r="6" fill="var(--c-line-3)" />
        {/* hand reaching — silhouette */}
        <path d="M 30,30 Q 45,25 50,40" fill="none" stroke="var(--c-void)" strokeWidth="14" strokeLinecap="round" opacity="0.95" />
        {/* sodium spill */}
        <circle cx="80%" cy="20%" r="22" fill= "var(--c-amber)" opacity="0.25" />
      </g>

  };

  const composition = compositions[kind] || compositions["darkroom-est"];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice"
    style={{ width: "100%", height: "100%", display: "block" }}>
      {composition}
      {/* film grain overlay */}
      <rect width="100%" height="100%" fill="url(#grain-pattern)" opacity="0.06" />
      <defs>
        <pattern id="grain-pattern" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill={tkc("white")} opacity="0.5" />
          <rect width="1" height="1" fill={tkc("black")} />
          <rect x="2" y="1" width="1" height="1" fill={tkc("black")} />
        </pattern>
      </defs>
    </svg>);

}

// Status pill
function StatusPill({ status }) {
  const map = {
    approved: { color: tkc("good"), label: "Approved" },
    review: { color: tkc("warn"), label: "Review" },
    draft: { color: tkc("ink-3"), label: "Draft" },
    queued: { color: "var(--c-ink-4)", label: "Queued" },
    rendering: { color: "var(--c-amber)", label: "Rendering" },
    rendered: { color: "var(--c-amber)", label: "Rendered ✦" },
    active: { color: tkc("good"), label: "Active" },
    idle: { color: tkc("ink-3"), label: "Idle" }
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
      textTransform: "uppercase", letterSpacing: ".08em",
      color: s.color, fontWeight: 500
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: s.color, boxShadow: `0 0 6px ${s.color}`
      }} />
      {s.label}
    </span>);

}

// Simple slider control
function Slider({ value, min = 0, max = 100, step = 1, onChange, format }) {
  const pct = (value - min) / (max - min) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
      <div style={{
        position: "relative", flex: 1, height: 4,
        background: "var(--c-line)", borderRadius: "var(--r-1)"
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`, background: "var(--c-amber)", borderRadius: "var(--r-1)"
        }} />
        <div style={{
          position: "absolute", left: `${pct}%`, top: "50%",
          width: 10, height: 10, borderRadius: "50%",
          background: "var(--c-ink)", border: "1px solid var(--c-amber-d)",
          transform: "translate(-50%, -50%)"
        }} />
        <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        style={{
          position: "absolute", inset: -8, width: "calc(100% + 16px)",
          opacity: 0, cursor: "default"
        }} />
      </div>
      <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", minWidth: 32, textAlign: "right" }}>
        {format ? format(value) : value}
      </span>
    </div>);

}

// Section header — quiet, no border, no background
function SectionHead({ title, count, action, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 32px 14px"
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{title}</span>
        {count != null && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{count}</span>}
      </div>
      {action || children}
    </div>);

}

// ─── Canonical film/project tile ────────────────────────────────────────
// One thumbnail + title pattern used everywhere films, projects, and NFTs
// are listed (Watch shelves, Producers market, Studio dashboard).
//
// Props:
//   thumb       — frame kind for FrameThumb (string) or a custom <node>
//   color       — fallback bg if no photo
//   title       — main label (rendered italic display)
//   subtitle    — small line under title (creator · genre · etc)
//   topLeft     — array of <Badge>-style nodes
//   topRight    — single node (e.g. NFT badge, heart button)
//   overlay     — node painted on the image (rare; used by dashboard hero)
//   footer      — node BELOW the meta row, for context-specific stats
//   width       — fixed width (px) or null for fluid (fills parent)
//   ratio       — aspect ratio string, default "16/9"
//   onClick     — click handler
//   showTitleOnImage — overlay the title on the photo (Studio hero style)
//   progress    — 0..1 thin amber progress bar at bottom of thumb
//   selected    — subtle amber border highlight
function FilmTile({
  thumb, color, title, subtitle,
  topLeft, topRight, overlay, footer,
  width, ratio = "16/9",
  onClick, showTitleOnImage = false,
  progress, selected, rating,
  trophyFilmId, // when set + film has won, shows a tiny award seal bottom-left
  meta, // optional 3rd line in meta zone (e.g. updated time)
  className, style
}) {
  const [hover, setHover] = useState(false);
  // Hover-play: after 1.2s of sustained hover the tile comes alive — a slow
  // silent "first beat" (Ken Burns drift + letterbox + running timecode).
  const [preview, setPreview] = useState(false);
  const prevT = useRef(null);
  const enter = () => { setHover(true); if (onClick) prevT.current = setTimeout(() => setPreview(true), 1200); };
  const leave = () => { setHover(false); setPreview(false); if (prevT.current) { clearTimeout(prevT.current); prevT.current = null; } };
  useEffect(() => () => { if (prevT.current) clearTimeout(prevT.current); }, []);
  return (
    <button
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={onClick}
      className={className}
      style={{
        appearance: "none", border: 0, padding: 0, margin: 0,
        background: "transparent", color: "inherit",
        textAlign: "left", cursor: onClick ? "pointer" : "default",
        width: width || "100%",
        display: "flex", flexDirection: "column", gap: 10,
        transform: hover && onClick ? "translateY(-4px)" : "translateY(0)",
        transition: "transform .22s cubic-bezier(.2,.7,.2,1)",
        ...style
      }}>
      
      {/* Thumbnail */}
      <div style={{
        position: "relative",
        aspectRatio: ratio,
        background: color || "var(--c-panel-2)",
        border: selected ? "1px solid var(--c-amber)" : hover && onClick ? "1px solid var(--c-line-3)" : "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)",
        overflow: "hidden",
        boxShadow: hover ? "0 18px 38px rgba(0,0,0,.6)" : "0 2px 6px rgba(0,0,0,.35)",
        transition: "box-shadow .22s ease, border-color .15s ease"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          transform: preview ? undefined : hover && onClick ? "scale(1.06)" : "scale(1)",
          animation: preview ? "cinaTilePlay 9s ease-in-out both" : "none",
          transition: "transform .5s cubic-bezier(.2,.7,.2,1)"
        }}>
        {typeof thumb === "string" ?
        <FrameThumb kind={thumb} usePhoto /> :
        thumb || null}
        </div>

        {/* Hover-play chrome — letterbox bars + muted-preview timecode */}
        {preview && <>
          <style>{`@keyframes cinaTilePlay{0%{transform:scale(1.07) translate(0,0)}100%{transform:scale(1.16) translate(-2.5%,-1.5%)}}@keyframes cinaTileBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes cinaTileTC{from{width:0%}to{width:100%}}`}</style>
          <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: "9%", background: "rgba(4,3,3,.92)", transformOrigin: "top", animation: "cinaTileBar .45s ease both", zIndex: 2 }}></span>
          <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "9%", background: "rgba(4,3,3,.92)", transformOrigin: "bottom", animation: "cinaTileBar .45s ease both", zIndex: 2 }}></span>
          <span className="t-mono" style={{ position: "absolute", top: 8, left: 8, zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: "var(--r-1)", background: "rgba(0,0,0,.72)", border: "1px solid rgba(255,255,255,.16)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("white") }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 6px var(--c-amber)", animation: "pulse-dot 1.4s ease-in-out infinite" }}></span>PREVIEW · MUTED
          </span>
          <span aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, height: 2, background: "var(--c-amber)", zIndex: 3, animation: "cinaTileTC 9s linear both" }}></span>
        </>}

        {/* Bottom gradient — present when title-on-image OR on hover */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: showTitleOnImage ?
          "linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.15) 55%, transparent 100%)" :
          hover ?
          "linear-gradient(to top, rgba(0,0,0,.7) 0%, rgba(0,0,0,.1) 50%, transparent 100%)" :
          "transparent",
          transition: "background .2s ease"
        }} />

        {overlay}

        {/* Hover play affordance — sleek editorial darkroom bar */}
        {onClick && !overlay && !showTitleOnImage &&
        <div style={{
          position: "absolute", left: 10, right: 10, bottom: progress > 0 ? 10 : 8,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          pointerEvents: "none",
          opacity: hover ? 1 : 0,
          transform: hover ? "translateY(0)" : "translateY(4px)",
          transition: "opacity .18s cubic-bezier(.16,1,.3,1), transform .18s cubic-bezier(.16,1,.3,1)",
          zIndex: 3
        }}>
            <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 3,
            background: "rgba(10,10,12,.84)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.18)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".12em",
            textTransform: "uppercase", color: tkc("white")
          }}>
              <Icon name="play" size={10} /> Watch
            </span>
          </div>
        }
        {/* Top-left cluster: minimal translucent status label */}
        {(() => {
          const hasTrophy = trophyFilmId && typeof topTrophy === "function" && topTrophy(trophyFilmId);
          const badges = (topLeft || []).filter(Boolean);
          if (!hasTrophy && !badges.length) return null;
          return (
            <div style={{
              position: "absolute", top: 8, left: 8,
              display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", maxWidth: "80%", zIndex: 2
            }}>
              {hasTrophy && typeof MiniTrophy === "function" && <MiniTrophy filmId={trophyFilmId} size={20} />}
              {badges}
            </div>
          );
        })()}

        {/* Top-right slot */}
        {topRight &&
        <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
            {topRight}
          </div>
        }

        {/* Title-on-image variant */}
        {showTitleOnImage &&
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, zIndex: 2 }}>
            <div className="t-display" style={{
            fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
            color: tkc("white"), lineHeight: 1.12, letterSpacing: "-0.01em",
            textShadow: "0 2px 12px rgba(0,0,0,.65)"
          }}>{title}</div>
            {subtitle &&
          <div className="t-mono" style={{
            fontSize: "var(--fs-label)", color: "rgba(255,255,255,.72)",
            marginTop: 3, letterSpacing: ".12em", textTransform: "uppercase"
          }}>{subtitle}</div>
          }
          </div>
        }

        {/* Progress bar */}
        {progress > 0 && progress < 1 &&
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 2,
          background: "rgba(255,255,255,.18)", zIndex: 3
        }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: "var(--c-amber)" }} />
          </div>
        }
      </div>

      {/* Title block — clean unboxed typography with inline rating */}
      {!showTitleOnImage &&
      <div style={{ padding: "0 2px", display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <div className="t-display" style={{
              fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 400,
              color: hover && onClick ? "var(--c-amber)" : "var(--c-ink)",
              lineHeight: 1.2, letterSpacing: "-0.01em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              transition: "color .15s ease", minWidth: 0
            }}>{title}</div>
            {rating > 0 && (
              <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", flexShrink: 0 }}>
                <span style={{ color: "var(--c-amber)" }}>★</span> {Number(rating).toFixed(1)}
              </span>
            )}
          </div>
          {subtitle &&
        <div style={{
          fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>{subtitle}</div>
        }
          {meta &&
        <div className="t-mono" style={{
          fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em",
          marginTop: 1
        }}>{meta}</div>
        }
        </div>
      }

      {footer}
    </button>);

}

// Standardized minimal badge for FilmTile slots — translucent darkroom label
function TileBadge({ kind = "info", children, icon }) {
  const accent = kind === "amber" || kind === "live";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 6px", borderRadius: 2,
      background: "rgba(10,10,12,.76)", backdropFilter: "blur(8px)",
      border: `1px solid ${accent ? "rgba(232,163,61,.45)" : "rgba(255,255,255,.14)"}`,
      color: accent ? "var(--c-amber)" : "var(--c-ink-2)",
      fontFamily: "var(--f-mono)", fontSize: "0.62rem", letterSpacing: ".12em", textTransform: "uppercase"
    }}>
      {icon && <Icon name={icon} size={10} />}
      {children}
    </span>
  );
}

// ─── Editorial primitives — Eyebrow / ChapterMark / PageIntro ────────────
// Phase 3 migration. Use these everywhere instead of hand-rolling. Visual
// rhythm is anchored in cina.css (.t-d-1..5, .t-eyebrow). These components
// just compose the right layout around them.

/**
 * Eyebrow — the small mono-caps kicker above any title.
 *   <Eyebrow>From the editor · 12 May</Eyebrow>
 *   <Eyebrow tone="dim" dot={false}>S01 · EP 5 OF 8</Eyebrow>
 */
function Eyebrow({ children, tone = "amber", dot = true, style }) {
  const cls = "t-eyebrow" + (
  tone === "dim" ? " t-eyebrow--dim" : "") + (
  !dot ? " t-eyebrow--bare" : "");
  return <span className={cls} style={style}>{children}</span>;
}

/**
 * ChapterMark — magazine-style chapter divider with eyebrow + italic title.
 * Used to break a long page into named programs.
 *
 *   <ChapterMark num="01" kicker="Tonight" title="What we'd like you to watch."
 *                note="LIVE NOW · 3 ROOMS"/>
 */
function ChapterMark({ num, kicker, title, note, style }) {
  return (
    <div data-cina-chapter style={{ padding: "56px var(--gutter) 4px", ...style }}>
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 24, flexWrap: "wrap",
        paddingBottom: 16, borderBottom: "1px solid var(--c-line)",
        position: "relative"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Eyebrow dot={false}>
            —— Chapter {num}{kicker ? ` · ${kicker}` : ""}
          </Eyebrow>
          <h2 className="t-d-2" style={{
            margin: 0, color: "var(--c-ink)"
          }}>{title}</h2>
        </div>
        {note &&
        <span className="t-eyebrow t-eyebrow--bare t-eyebrow--dim" style={{
          paddingBottom: 6, flexShrink: 0
        }}>{note}</span>
        }
        <div style={{
          position: "absolute", left: 0, bottom: -1,
          width: 64, height: 2, background: "var(--c-amber)"
        }} />
      </div>
    </div>);

}

/**
 * PageIntro — magazine-style section header for index pages
 * (/genre/film, /genre/series, /cast, /festival).
 *
 *   <PageIntro kicker="ALL ORIGINALS · ONE WAY IN" title="Films"
 *              lede="Every Cina film, sorted by what the room is watching tonight."
 *              count={64}/>
 */
function PageIntro({ kicker, title, lede, count, countLabel = "TITLES", style }) {
  return (
    <section style={{
      padding: "44px var(--gutter) 36px",
      background: "var(--c-bg)",
      borderBottom: "1px solid var(--c-line)",
      position: "relative",
      ...style
    }}>
      <div style={{
        position: "absolute", left: 56, top: 44, width: 36, height: 2,
        background: "var(--c-amber)"
      }} />
      <div style={{
        maxWidth: "var(--w-page)", margin: "0 auto",
        display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 32, alignItems: "flex-end"
      }}>
        <div>
          <div style={{ paddingTop: 10, marginBottom: 14 }}>
            <Eyebrow dot={false}>{kicker}</Eyebrow>
          </div>
          <h1 className="t-d-4" style={{ margin: 0, color: "var(--c-ink)" }}>
            {title}.
          </h1>
          {lede &&
          <p style={{
            margin: "16px 0 0",
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.45, color: "var(--c-ink-2)",
            maxWidth: 620, letterSpacing: "-0.01em", textWrap: "pretty"
          }}>{lede}</p>
          }
        </div>
        {count != null &&
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, paddingBottom: 8 }}>
            <span className="t-d-3" style={{ color: "var(--c-amber)" }}>{count}</span>
            <span className="t-eyebrow t-eyebrow--bare t-eyebrow--dim">{countLabel}</span>
          </div>
        }
      </div>
    </section>);

}

// ─── FromTheProgrammer — the curator's line on a single title ────────────
// Ada Beresford's ~30-word argument for why a film/series earns its place.
// Distinct from FromTheDirector (the maker's voice): this is the house's
// editorial point of view. Used on /film and /series detail pages.
//   variant="block"  — full bordered panel with signature (detail pages)
//   variant="inline" — slim eyebrow + italic line (tighter contexts)
function FromTheProgrammer({ film, variant = "block", style }) {
  const note = film && film.programmerNote;
  if (!note) return null;
  const who = typeof PROGRAMMER !== "undefined" && PROGRAMMER ||
  { name: "Ada Beresford", role: "Editor-in-chief", initials: "AB" };

  if (variant === "inline") {
    return (
      <div data-cina-prog="inline" style={{
        display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap",
        maxWidth: 720, ...style
      }}>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
          letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700,
          flexShrink: 0
        }}>— FROM THE PROGRAMMER</span>
        <span style={{
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45,
          letterSpacing: "-0.01em"
        }}>"{note}"</span>
      </div>);

  }

  return (
    <div data-cina-prog="block" style={{
      margin: "0 0 36px",
      padding: "22px 26px",
      background: "var(--c-panel)",
      border: "1px solid var(--c-line)",
      borderLeft: "2px solid var(--c-amber)",
      borderRadius: "var(--r-2)",
      ...style
    }}>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
        letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 14
      }}>FROM THE PROGRAMMER</div>
      <p style={{
        margin: 0,
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: "var(--fs-lead)", lineHeight: 1.5, color: "var(--c-ink)",
        letterSpacing: "-0.01em", textWrap: "pretty", maxWidth: 660
      }}>"{note}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--c-amber) 0%, transparent 80%)",
          border: "1px solid var(--c-line-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)",
          color: "var(--c-ink)", fontWeight: 500, flexShrink: 0
        }}>{who.initials}</div>
        <span style={{
          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)",
          color: "var(--c-ink)", letterSpacing: "-0.01em"
        }}>{who.name}</span>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
          letterSpacing: ".16em", textTransform: "uppercase", paddingLeft: 12,
          borderLeft: "1px solid var(--c-line-2)"
        }}>{who.role}</span>
      </div>
    </div>);

}

// ─── UnifiedTopNav system ────────────────────────────────────────────────────
// Shared 60 px top bar (+ optional 44 px second row) for Watch · Studio ·
// Pitch · Producers.  Puts the surface-switcher segment directly in the bar —
// no more buried apps dropdown; "Back to Watch" is always the first chip.

/**
 * SurfaceSegment — Watch · Studio · Pitch · Producers inline in the bar.
 * Current surface: amber underline.  Others: dim, navigate on click.
 */
function SurfaceSegment({ surface }) {
  // Hide on narrow viewports — the MobileNavDrawer carries surface switching there.
  const [narrow, setNarrow] = useState(() => window.innerWidth <= 767);
  useEffect(() => {
    const h = () => setNarrow(window.innerWidth <= 767);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  if (narrow) return null;

  const surfaces = (window.CINA_SURFACES || []).length ?
  window.CINA_SURFACES :
  [
  { id: "watch", label: "Watch", href: "index.html" },
  { id: "studio", label: "Studio", href: "Cina.html" },
  { id: "producers", label: "Producers", href: "Producers.html" }];

  return (
    <div style={{ display: "flex", alignItems: "stretch", height: "100%" }}>
      {surfaces.map((s) => {
        const here = s.id === surface;
        return (
          <button
            key={s.id}
            onClick={() => {if (!here) window.location.href = s.href;}}
            title={here ? undefined : `Switch to ${s.label}`}
            style={{
              position: "relative",
              height: "100%", padding: "0 11px",
              background: "transparent", border: "none",
              fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)",
              fontWeight: here ? 600 : 400,
              color: here ? "var(--c-ink)" : "var(--c-ink-4)",
              cursor: here ? "default" : "pointer",
              transition: "color .14s ease",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {if (!here) e.currentTarget.style.color = "var(--c-ink-2)";}}
            onMouseLeave={(e) => {if (!here) e.currentTarget.style.color = "var(--c-ink-4)";}}>
            
            {s.label}
            {here &&
            <span style={{
              position: "absolute", left: 11, right: 11, bottom: 0,
              height: 2, background: "var(--c-amber)", borderRadius: 0
            }} />
            }
          </button>);

      })}
    </div>);

}

/**
 * NavWalletPill — canonical wallet / credits pill for every surface.
 *   value   primary italic value ("$12,400" or "342")
 *   label   secondary mono label after separator ("0xA1…" or "credits")
 *   dot     left status dot color (default var(--c-amber))
 *   onClick click handler
 *   href    navigation fallback (used as <a> when no onClick)
 *   active  amber-tinted active state
 */
function NavWalletPill({ value, label, dot = tkc("amber"), onClick, href, active }) {
  const [h, setH] = useState(false);
  const isLink = href && !onClick;
  const Tag = isLink ? "a" : "button";
  return (
    <Tag
      href={isLink ? href : undefined}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 34, padding: "0 12px",
        background: active ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
        border: `1px solid ${active ? "rgba(var(--accent-rgb),.35)" : h ? "var(--c-line-3)" : "var(--c-line-2)"}`,
        borderRadius: "var(--r-3)",
        cursor: "pointer", textDecoration: "none",
        transition: "border-color .14s ease, background .14s ease",
        appearance: "none", flexShrink: 0
      }}>
      
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: dot, boxShadow: `0 0 6px ${dot}`,
        flexShrink: 0
      }} />
      <span style={{
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontWeight: 600, fontSize: "var(--fs-body)",
        color: active ? "var(--c-amber)" : "var(--c-ink)",
        whiteSpace: "nowrap"
      }}>{value}</span>
      {label &&
      <>
          <span style={{ width: 1, height: 12, background: "var(--c-line-2)", flexShrink: 0 }} />
          <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          color: "var(--c-ink-3)", letterSpacing: ".08em",
          whiteSpace: "nowrap"
        }}>{label}</span>
        </>
      }
    </Tag>);

}

/**
 * NavBell — notification bell + optional unread badge and dropdown.
 *   count    unread count (0 = no badge)
 *   open     dropdown visibility
 *   onClick  toggle
 *   children the dropdown component
 */
function NavBell({ count = 0, open, onClick, children }) {
  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn-ghost btn-icon"
        style={{ width: 34, height: 34, position: "relative" }}
        onClick={onClick}
        data-active={open || undefined}
        title={count > 0 ? `${count} unread` : "Notifications"}>
        
        <Icon name="bell" size={15} />
        {count > 0 &&
        <span style={{
          position: "absolute", top: 5, right: 5,
          minWidth: 13, height: 13, padding: "0 3px",
          borderRadius: "var(--r-2)", background: "var(--c-blood)",
          border: "1.5px solid var(--c-bg)",
          fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
          fontWeight: 600, color: tkc("ink"),
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>{count > 9 ? "9+" : count}</span>
        }
      </button>
      {open && children &&
      <div style={{
        position: "fixed",
        top: 60,
        right: 12,
        width: 380,
        maxHeight: "calc(100vh - 80px)",
        background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)",
        boxShadow: "0 24px 64px rgba(0,0,0,.55), 0 4px 12px rgba(0,0,0,.3)",
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "dropIn .16s cubic-bezier(.2,.8,.2,1)"
      }}>
          <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
          {children}
        </div>
      }
    </div>);

}

/**
 * UnifiedTopNav — THE shared top bar for Watch · Studio · Pitch · Producers.
 *
 * Row 1 (60 px):
 *   [CinaMark SURFACE] | [SurfaceSegment] | [children] · flex:1 · [right] | [wallet][bell][avatar]
 * Row 2 (44 px, optional):
 *   [tabs]
 *
 * Props:
 *   surface      "watch" | "studio" | "pitch" | "producers"
 *   onWordmark   click on the wordmark area
 *   children     center-left zone: surface tabs, project switcher, breadcrumb…
 *   right        before the fixed cluster: search, budget meter, extra buttons…
 *   tabs         second-row content (44 px with border-top)
 *   wallet       NavWalletPill props, or null/undefined to hide
 *   bell         { count, open, onClick, dropdown? } for NavBell, or null
 *   avatar       custom avatar node; default <CinaAccountButton/>
 *   headerStyle  style overrides on <header> (e.g. position:"absolute" for Studio)
 */
// Slide-up mobile drawer for UnifiedTopNav — generic across pro surfaces.
function UTNMobileDrawer({ items, actions, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,.65)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "utnFade .2s ease forwards" }}/>
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 81, background: "var(--c-panel)", borderTop: "1px solid var(--c-line)", borderRadius: "12px 12px 0 0", animation: "utnSlide .26s cubic-bezier(.32,.72,0,1) forwards", paddingBottom: "max(env(safe-area-inset-bottom,0px),16px)", maxHeight: "82vh", overflowY: "auto" }}>
        <div style={{ width: 32, height: 3, borderRadius: "var(--r-1)", background: "var(--c-line-3)", margin: "14px auto 6px" }}/>
        <nav>
          {(items || []).map((t, i) => (
            <button key={i} onClick={() => { t.onClick && t.onClick(); onClose(); }} style={{
              width: "100%", padding: "13px 28px",
              background: t.active ? "rgba(var(--accent-rgb),.06)" : "transparent",
              border: "none", borderLeft: `2px solid ${t.active ? "var(--c-amber)" : "transparent"}`,
              display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.2, color: t.active ? "var(--c-amber)" : "var(--c-ink)", letterSpacing: "-0.01em" }}>{t.label}</span>
            </button>
          ))}
        </nav>
        {actions && <div style={{ padding: "12px 24px 4px", display: "flex", flexDirection: "column", gap: 10 }} onClick={onClose}>{actions}</div>}
        <div style={{ borderTop: "1px solid var(--c-line)", marginTop: 10, padding: "16px 28px 8px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 }}>Switch surface</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Watch", href: "index.html" }, { label: "Studio", href: "Cina.html" }, { label: "Producers", href: "Producers.html" }].map(s => (
              <a key={s.label} href={s.href} style={{ padding: "8px 14px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textDecoration: "none", textTransform: "uppercase" }}>{s.label}</a>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes utnFade{from{opacity:0}to{opacity:1}}@keyframes utnSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </>
  );
}

function UnifiedTopNav({ collapseAt = 768,
  surface, onWordmark, children, right, tabs,
  wallet, bell, avatar, headerStyle, accountBalance,
  mobileNav, mobileActions
}) {
  const [utnNarrow, setUtnNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < collapseAt);
  const [utnDrawer, setUtnDrawer] = useState(false);
  useEffect(() => {
    const h = () => setUtnNarrow(window.innerWidth < collapseAt);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  const surfaceLabel = {
    watch: "WATCH", studio: "STUDIO", pitch: "PITCH", producers: "PRODUCERS"
  }[surface] || (surface ? surface.toUpperCase() : "");

  const avatarNode = (() => {
    if (avatar !== undefined) return avatar;
    if (typeof CinaAccountButton !== "undefined")
    return <CinaAccountButton surface={surface} accent= "var(--c-amber)" balance={accountBalance} />;
    return null;
  })();

  return (
    <>
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(8, 8, 10, 0.78)",
      backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      borderBottom: "1px solid var(--c-line)",
      ...headerStyle
    }}>
      {/* Skip past the chrome. Visually hidden until focused, then it sits
          top-left as a normal amber pill. */}
      <a href="#main-content" className="skip-link">SKIP TO CONTENT</a>
      {/* Row 1 — 60 px */}
      <nav aria-label="Cina surfaces" style={{ height: 60, display: "flex", alignItems: "stretch", padding: "0 24px" }}>

        {/* Wordmark */}
        <button
          onClick={onWordmark}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            paddingRight: 14, height: "100%",
            background: "transparent", border: "none",
            cursor: onWordmark ? "pointer" : "default",
            color: "inherit", lineHeight: 1, flexShrink: 0
          }}>
          
          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1, transform: "translateY(-1px)" }}>
            <CinaMark size={26} />
          </span>
          {surfaceLabel &&
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            letterSpacing: ".16em", color: "var(--c-ink-4)", lineHeight: 1
          }}>{surfaceLabel}</span>
          }
        </button>

        {/* Separator */}
        <div style={{ width: 1, alignSelf: "center", height: 22, background: "var(--c-line)", flexShrink: 0 }} />

        {/* Surface segment — always visible, replaces apps dropdown */}
        <SurfaceSegment surface={surface} />

        {/* Separator before surface-specific content */}
        {children && !utnNarrow && <div style={{ width: 1, alignSelf: "center", height: 22, background: "var(--c-line)", flexShrink: 0 }} />}

        {/* Surface-specific center-left slot */}
        {children && !utnNarrow &&
        <div className="utn-slot" style={{ display: "flex", alignItems: "stretch", minWidth: 0, flex: "0 1 auto" }}>
            {children}
          </div>
        }

        <div style={{ flex: "1 0 12px" }} />

        {/* Surface-specific right slot */}
        {right && !utnNarrow &&
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {right}
          </div>
        }

        {/* Fixed cluster: workspace · wallet · bell · avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: right && !utnNarrow ? 6 : 0 }}>
          {!utnNarrow && surface !== "studio" && surface !== "watch" && (
            <button
              type="button"
              onClick={() => window.toggleCinaAtlas && window.toggleCinaAtlas(true)}
              title="Open Cina Workspace Atlas (⌘K)"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: "2.1rem", padding: "0 0.7rem",
                background: "rgba(255,255,255,.04)", border: "1px solid var(--c-line-2)",
                color: "var(--c-ink-3)", cursor: "pointer", borderRadius: 0,
                fontFamily: "var(--f-sans)", fontSize: "var(--fs-label)",
              }}
            >
              <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--c-amber)" }}>Cina</span>
              <span>Workspace</span>
              <span className="t-mono" style={{ fontSize: "0.64rem", color: "var(--c-ink-4)" }}>⌘K</span>
            </button>
          )}
          {wallet && !utnNarrow && <NavWalletPill {...wallet} />}
          {bell &&
          <NavBell count={bell.count || 0} open={bell.open} onClick={bell.onClick}>
              {bell.dropdown}
            </NavBell>
          }
          {avatarNode}
          {utnNarrow && (mobileNav || mobileActions) &&
          <button aria-label="Open menu" onClick={() => setUtnDrawer(true)} style={{
            width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
            color: "var(--c-ink-2)", cursor: "pointer", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          }
        </div>
      </nav>

      {/* Row 2 — optional (44 px) */}
      {tabs && !utnNarrow &&
      <div style={{
        height: 44, display: "flex", alignItems: "center",
        padding: "0 16px",
        borderTop: "1px solid var(--c-line)"
      }}>
          {tabs}
        </div>
      }
    </header>
    {utnNarrow && utnDrawer && (mobileNav || mobileActions) &&
      <UTNMobileDrawer items={mobileNav} actions={mobileActions} onClose={() => setUtnDrawer(false)} />}
    </>);

}

Object.assign(window, { Icon, AgentBadge, CinaBadge, CinaMark, FrameThumb, StatusPill, Slider, SectionHead, FilmTile, TileBadge, Eyebrow, PageIntro, FromTheProgrammer, EmptyState, ErrorState, Skeleton, UnifiedTopNav, CarouselRail, _photoForKind });

// ─── Global credits store — one balance, every header and panel ──────────
(function () {
  const KEY = "cina:credits";
  const read = () => { try { const v = parseInt(localStorage.getItem(KEY), 10); return isNaN(v) ? 342 : v; } catch (e) { return 342; } };
  window.CinaCredits = {
    get: read,
    set(v) {
      try { localStorage.setItem(KEY, String(Math.max(0, Math.round(v)))); } catch (e) {}
      window.dispatchEvent(new CustomEvent("cina:credits-changed", { detail: { value: read() } }));
    },
    add(n) { this.set(read() + (n || 0)); },
    spend(n) { this.set(read() - (n || 0)); },
  };
  window.useCinaCredits = function () {
    const [v, setV] = React.useState(read);
    React.useEffect(() => {
      const h = () => setV(read());
      window.addEventListener("cina:credits-changed", h);
      window.addEventListener("storage", h);
      return () => { window.removeEventListener("cina:credits-changed", h); window.removeEventListener("storage", h); };
    }, []);
    return v;
  };
})();

// ─── Empty / Error / Skeleton — universal state primitives ───────────────

/**
 * EmptyState — for blank lists, no-search-results, "you haven't added"
 *   <EmptyState icon="bell" title="No notifications yet" body="…" cta={…}/>
 */
function EmptyState({ icon = "play", title, body, cta, children }) {
  return <CinaEmpty icon={icon} title={title} body={body} cta={cta}>{children}</CinaEmpty>;
}

/**
 * ErrorState — for failed requests, broken IDs, "something went wrong"
 *   <ErrorState title="Couldn't load this film" body="…" onRetry={…}/>
 */
function ErrorState({ icon = "alert", title = "Something didn't load", body, onRetry, cta }) {
  return (
    <div className="cina-state cina-state--error">
      <div className="cina-state__icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="cina-state__title">{title}</div>
      {body && <div className="cina-state__body">{body}</div>}
      {onRetry &&
      <button className="btn btn-sm" onClick={onRetry} style={{ height: 32 }}>
          <Icon name="refresh" size={11} /> Try again
        </button>
      }
      {cta || null}
    </div>);

}

/**
 * Skeleton — shimmering placeholder for loading content
 *   <Skeleton w={240} h={32}/>
 *   <Skeleton w="100%" h={120} radius={8}/>
 */
function Skeleton({ w = "100%", h = 12, radius = 4, style }) {
  return (
    <span className="cina-skeleton" style={{
      width: typeof w === "number" ? `${w}px` : w,
      height: typeof h === "number" ? `${h}px` : h,
      borderRadius: radius,
      ...style
    }} />);

}

/**
 * CarouselRail — the canonical horizontal scroller for Cina.
 * Wraps a row of cards with:
 *   • left + right edge-fade gradients that dissolve partially-scrolled cards
 *     into the EXACT page background (pass `fade`), shown only when there's
 *     more content that direction.
 *   • round prev/next arrows that appear only when scrollable in that
 *     direction (hidden at the start / end).
 */
function CarouselRail({ children, fade = "var(--c-bg)", gap = 12, padY = 12, arrowOffset = -6, snap = true, fadeW = 80, style = {} }) {
  const ref = React.useRef(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(true);
  const [scrollable, setScrollable] = React.useState(false);

  const update = React.useCallback(() => {
    const el = ref.current; if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 8);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  React.useEffect(() => {
    update();
    const el = ref.current; if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    const t1 = setTimeout(update, 250);
    const t2 = setTimeout(update, 900); // re-check after images/fonts settle
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearTimeout(t1); clearTimeout(t2);
    };
  }, [update, children]);

  const scroll = (dir) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const arrow = (dir, show) => (
    <button
      onClick={() => scroll(dir)}
      aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
      tabIndex={show ? 0 : -1}
      style={{
        position: "absolute", top: "50%", [dir < 0 ? "left" : "right"]: arrowOffset,
        transform: "translateY(-50%)",
        width: 38, height: 38, borderRadius: "50%", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(8,8,10,.86)", backdropFilter: "blur(8px)",
        border: "1px solid var(--c-line-2)", color: "var(--c-ink)", cursor: "pointer",
        zIndex: 3, boxShadow: "0 6px 20px rgba(0,0,0,.4)",
        opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none",
        transition: "opacity .18s ease",
      }}
    >
      <span style={{ transform: dir < 0 ? "rotate(180deg)" : "none", display: "flex" }}>
        <Icon name="chev-r" size={15} />
      </span>
    </button>
  );

  return (
    <div style={{ position: "relative", ...style }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, bottom: 0, left: 0, width: fadeW, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to right, ${fade} 10%, transparent)`,
        opacity: scrollable && !atStart ? 1 : 0, transition: "opacity .2s ease",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, bottom: 0, right: 0, width: fadeW, zIndex: 2, pointerEvents: "none",
        background: `linear-gradient(to left, ${fade} 12%, transparent)`,
        opacity: scrollable && !atEnd ? 1 : 0, transition: "opacity .2s ease",
      }} />
      <div ref={ref} className="cina-rail-scroller" style={{
        display: "flex", gap, overflowX: "auto", overflowY: "hidden",
        scrollbarWidth: "none", paddingTop: padY, paddingBottom: padY,
        scrollSnapType: snap ? "x proximity" : "none",
      }}>
        {children}
      </div>
      {arrow(-1, scrollable && !atStart)}
      {arrow(1, scrollable && !atEnd)}
    </div>
  );
}