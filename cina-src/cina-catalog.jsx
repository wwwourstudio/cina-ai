// cina-catalog.jsx — The publish bridge that closes the Studio → Watch loop.
//
// A film mastered in Studio has, until now, never appeared on Watch — the
// catalog was static mock data and the single most important narrative
// ("I made this, now the world can watch it") had no payoff. This module is
// the connective tissue: Studio writes a self-contained, Watch-shaped film
// entry into ONE shared localStorage key; Watch reads it on load and merges
// it into the live catalog. No surface needs the other's code.
//
// Loaded after cina-identity.jsx, before each surface's data layer
// (watch-data.jsx on Watch, cina-state.jsx on Studio).
//
// Exposes:
//   window.cinaPublishedFilms()          → Array<filmEntry>, newest first
//   window.cinaPublishFilm(entry)        → persist one entry (dedupe by id)
//   window.cinaUnpublishFilm(id)         → pull a film back (reversible)
//   window.cinaBuildFilmEntry(project, ws, opts) → Studio project → catalog entry
//   window.cinaWatchHref(film)           → deep link to the live Watch page

const CINA_PUB_KEY = "cina:published-films";

function cinaPublishedFilms() {
  try {
    const raw = localStorage.getItem(CINA_PUB_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function _cinaSavePublished(arr) {
  try { localStorage.setItem(CINA_PUB_KEY, JSON.stringify(arr.slice(0, 16))); } catch {}
}

function cinaPublishFilm(entry) {
  if (!entry || !entry.id) return entry;
  const next = [entry, ...cinaPublishedFilms().filter(f => f.id !== entry.id)];
  _cinaSavePublished(next);
  return entry;
}

function cinaUnpublishFilm(id) {
  _cinaSavePublished(cinaPublishedFilms().filter(f => f.id !== id));
}

// ─── Helpers ──────────────────────────────────────────────────────────
function _cinaTitleCase(s) {
  if (!s) return "Untitled";
  return String(s).toLowerCase().replace(/\b([a-z])/g, (m, c) => c.toUpperCase())
    .replace(/\b(Of|The|And|A|To|In)\b/g, w => w.toLowerCase())
    .replace(/^([a-z])/, c => c.toUpperCase());
}

// Deterministic thumb pick so the generated poster photo stays stable per film.
const _CINA_THUMBS = ["the-photo", "darkroom-est", "darkroom-wide", "phone", "dawn", "developer"];
function _cinaThumbFor(seed) {
  let h = 0; const s = String(seed || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return _CINA_THUMBS[Math.abs(h) % _CINA_THUMBS.length];
}

function _cinaGenreArray(g) {
  if (Array.isArray(g)) return g.filter(Boolean);
  if (!g || g === "—") return ["Drama"];
  // "Neo-Noir Thriller" → one chip; "Drama, Mystery" → two
  return String(g).split(/\s*[,/]\s*/).filter(Boolean).slice(0, 2);
}

// Build a complete, Watch-shaped catalog entry from a Studio project.
//   project — STUDIO project (title, code, runtime, cover, genre, kind…)
//   ws      — its workspace (publish state, etc.)
//   opts    — { logline, releaseDate, watch, pitch, handle, runtimeSec }
function cinaBuildFilmEntry(project, ws, opts = {}) {
  const p = project || {};
  const id = "pub-" + String(p.code || p.id || p.title || "film")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const handle = opts.handle || (window.CINA && window.CINA.handle) || "you.eth";
  const cover = p.cover || tkc("cat-6");
  const logline = opts.logline || p.logline ||
    (window.FILM_BIBLE && p.id === "p1" ? window.FILM_BIBLE.logline : "") ||
    "A new film, mastered in Cina Studio and premiered to Watch.";
  const isSeries = p.kind === "series";

  return {
    id,
    title: _cinaTitleCase(p.title),
    // Prefer the studio's own name; fall back to a tidied handle rather than
    // printing a wallet address as a director credit.
    creator: (p.director
      || (window.STUDIO && window.STUDIO.name)
      || handle.replace(/\.eth$/, "").replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
      + " · Cina Studio",
    creatorId: "you",
    kind: "film",                              // series ship as a single premiere card for now
    genre: _cinaGenreArray(p.genre),
    runtime: p.runtime && p.runtime !== "—" ? p.runtime : (opts.runtimeSec ? `${Math.round(opts.runtimeSec/60)}m` : "—"),
    year: 2026,
    rating: 0, ratings: 0,                     // brand new — no scores yet
    views: 0,
    cover, color: cover,
    thumb: _cinaThumbFor(id),
    logline,
    synopsis: logline,
    moods: (ws && ws.score && ws.score.style ? [ws.score.style.replace(/-/g, " ")] : []).concat(["new release"]),
    tags: ["Made in Cina Studio", "premiere"],
    free: false, rent: 4.99, buy: 19.99,
    nftPremiere: !!opts.pitch || !!(ws && ws.publish && ws.publish.distribution && ws.publish.distribution.pitch),
    premiereHrs: 24,
    // ── Loop metadata ──
    studioProjectId: p.id,
    studioCode: p.code || null,
    publishedByYou: true,
    publishedAt: Date.now(),
    releaseDate: opts.releaseDate || null,
    distribution: { watch: opts.watch !== false, pitch: !!opts.pitch },
  };
}

// Deep link to a film's live Watch page (works from any surface).
function cinaWatchHref(film) {
  const id = typeof film === "string" ? film : (film && film.id);
  return "index.html#/film/" + (id || "");
}

Object.assign(window, { cinaPublishedFilms, cinaPublishFilm, cinaBuildFilmEntry, cinaWatchHref });
