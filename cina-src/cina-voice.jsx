// cina-voice.jsx — The director's voice, in the chrome.
//
// Cina's product copy was written twice: editorial and considered inside the
// pages, generic and system-flavoured in the chrome around them ("No results",
// "Loading…", "Nothing here yet"). This module gives the chrome the same voice
// the rest of the product has — a working director's, dry and specific — and
// keeps it in ONE place so it can be tuned without touching thirty files.
//
//   cinaVoice(slot, ctx)        → a line for that slot
//   <VoiceLine slot ctx/>       → the line, styled as chrome
//   <VoiceEmpty slot ctx .../>  → a voiced empty state
//
// Rules the lines follow: no exclamation marks, no "oops", no apologies for
// the software, never cheerful. State the situation, then the next move.

const { useMemo: uvM, useState: uvS, useEffect: uvE } = React;

// Deterministic pick — the same slot on the same day reads the same, so the
// chrome feels authored rather than randomised on every render.
function _vPick(list, seedStr) {
  if (!list || !list.length) return "";
  const day = Math.floor(Date.now() / 86400000);
  let h = day;
  const s = String(seedStr || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

const CINA_VOICE = {
  // ── Loading — what the building is doing, not a spinner's apology ──
  loading: [
    "Threading the reel.",
    "Warming the lamp.",
    "Pulling the print.",
    "Cueing up.",
  ],
  loadingLong: [
    "Still pulling the print. Big file.",
    "The lamp takes a moment.",
  ],

  // ── Empty states, by where you are ──
  "empty.search": [
    "Nothing under that name.",
    "No print by that title.",
  ],
  "empty.watchlist": [
    "Nothing saved yet. The catalog is deep — start anywhere.",
    "An empty list. Add the ones you mean to get to.",
  ],
  "empty.history": [
    "No screenings logged. Yet.",
  ],
  "empty.holdings": [
    "You don't hold anything on the slate. Back a film and it shows here.",
  ],
  "empty.slate": [
    "No projects. Every film starts as one paragraph — write it.",
  ],
  "empty.room": [
    "Nobody in the room. Doors open before the screening.",
  ],
  "empty.notifications": [
    "Quiet. We'll tell you when something ships.",
  ],
  "empty.generic": [
    "Nothing here yet.",
  ],

  // ── Errors — plain, never chirpy, always a next move ──
  "error.route": [
    "That page isn't in the building.",
  ],
  "error.save": [
    "That didn't save. Nothing is lost — try once more.",
  ],
  "error.crash": [
    "This screen broke. The rest of the building is fine.",
  ],

  // ── Header curator's note, rotates by route ──
  "note.home": [
    "Twenty-eight titles. Most of them shot this year.",
    "The room votes on the branched ones while they play.",
  ],
  "note.films": [
    "Features and shorts. Runtime is honest — no padding.",
  ],
  "note.series": [
    "Episodic work. New drops land Thursdays.",
  ],
  "note.branches": [
    "The film stops and the room decides. Ninety seconds a fork.",
  ],
  "note.festival": [
    "Twelve premieres, three purses, one running order.",
  ],
  "note.studios": [
    "Collectives and one-person shops. Same page, same terms.",
  ],
  "note.producers": [
    "Back the work, take a slice of what it earns.",
  ],
  "note.slate": [
    "Your catalog, and what it's doing out in the world.",
  ],

  // ── Confirmations — what happened, in the product's own terms ──
  "ok.saved": ["Saved."],
  "ok.published": ["Live."],
  "ok.backed": ["You're on the slate."],
};

function cinaVoice(slot, ctx) {
  const list = CINA_VOICE[slot] || CINA_VOICE[String(slot).split(".")[0]] || CINA_VOICE["empty.generic"];
  return _vPick(list, slot + "|" + (ctx || ""));
}

// Map a Watch hash route to its curator's-note slot.
function cinaVoiceSlotForRoute(parts) {
  const p0 = (parts && parts[0]) || "";
  if (!p0) return "note.home";
  if (p0 === "genre") return parts[1] === "series" ? "note.series" : "note.films";
  if (p0 === "branches") return "note.branches";
  if (p0 === "festival") return "note.festival";
  if (p0 === "studios" || p0 === "creator") return "note.studios";
  if (p0 === "producers") return "note.producers";
  return null;
}

// ─── A line of chrome ───────────────────────────────────────────────────
function VoiceLine({ slot, ctx, style, className }) {
  const line = uvM(() => cinaVoice(slot, ctx), [slot, ctx]);
  if (!line) return null;
  return (
    <span className={className || "t-mono"} style={{
      fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)",
      textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden",
      textOverflow: "ellipsis", ...style,
    }}>{line}</span>
  );
}

// ─── A voiced empty state ───────────────────────────────────────────────
function VoiceEmpty({ slot, ctx, kicker, cta, icon }) {
  return <CinaEmpty center icon={icon} kicker={kicker} title={cinaVoice(slot, ctx)} cta={cta}/>;
}

// ─── Loading — escalates its line if the wait runs long ─────────────────

Object.assign(window, { CINA_VOICE, cinaVoice, cinaVoiceSlotForRoute, VoiceLine });
