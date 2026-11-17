// cina-cmdk-shared.jsx — One command registry every surface's ⌘K reads.
//
// Each app had its own palette that could only reach its own routes; the
// only cross-app entry was "Switch to Studio", which dropped you on that
// app's home and made you navigate again. This module publishes every
// surface's real destinations as commands with absolute targets, so ⌘K on
// any surface can jump straight to a film's cut on Studio, a campaign on
// Pitch, or a project page on Producers.
//
//   cinaCrossCommands(currentSurface) → [{id, kind, label, hint, icon, href}]
//
// Load after each surface's data layer, before its palette.

const CC_SURFACES = {
  watch:     { label: "Watch",     file: "index.html",     dot: tkc("good") },
  studio:    { label: "Studio",    file: "Cina.html",      dot: "var(--c-amber)" },
  producers: { label: "Producers", file: "Producers.html", dot: tkc("warn") },
};

// An absolute target: the surface's file plus its own hash route.
function ccTarget(surface, hash) {
  const s = CC_SURFACES[surface];
  if (!s) return null;
  return s.file + (hash ? (hash.startsWith("#") ? hash : "#" + hash) : "");
}

function ccGo(href) {
  return () => { window.location.href = href; };
}

// ─── Per-surface destination tables ─────────────────────────────────────
// Static destinations. Kept deliberately short — the deep, data-driven
// entries below are what make cross-surface search useful.
const CC_DESTS = {
  watch: [
    ["Watch home", "Browse everything", "play", "/"],
    ["Branched rooms", "Live interactive films", "shuffle", "/branches"],
    ["Festival programme", "Screenings & juries", "ticket", "/festival"],
    ["Studios directory", "Every house on Cina", "globe", "/studios"],
    ["Your watchlist", "Saved films", "heart", "/watchlist"],
  ],
  studio: [
    ["The slate", "Every project", "board", "slate"],
    ["New film", "Start a project", "plus", "new"],
    ["The vault", "Performers & likenesses", "actor", "vault"],
    ["Studio site builder", "Your public page", "globe", "site"],
    ["Analytics", "How the work is playing", "trend", "analytics"],
  ],
  pitch: [
    ["Campaign floor", "Every campaign", "trend", "lobby"],
    ["New brief", "Start a campaign", "plus", "brief"],
    ["Pitch Night", "The live auction", "ticket", "night"],
    ["Talent market", "License performers", "actor", "talent"],
  ],
  producers: [
    ["Producers market", "Back a film", "trend", "market"],
    ["My stakes", "Holdings & P/L", "wallet", "portfolio"],
    ["Auction floor", "Secondary market", "coin", "auctions"],
    ["Catalog index", "Every tradable title", "board", "index"],
    ["Launch a project", "Open a fundraise", "plus", "market"],
  ],
};

// ─── The registry ───────────────────────────────────────────────────────
function cinaCrossCommands(current) {
  const out = [];
  const other = Object.keys(CC_SURFACES).filter(s => s !== current);

  // Static destinations on the OTHER surfaces (the current surface's own
  // palette already covers its own routes far better than we could).
  other.forEach(surface => {
    const s = CC_SURFACES[surface];
    (CC_DESTS[surface] || []).forEach(([label, hint, icon, hash]) => {
      const href = ccTarget(surface, hash);
      out.push({
        id: "x:" + surface + ":" + hash + ":" + label,
        kind: s.label, label, hint, icon, href, run: ccGo(href),
        surface, dot: s.dot,
      });
    });
  });

  // ── Deep entries: a film, reachable on whichever surface owns that verb ──
  const cat = window.CATALOG || [];
  const nft = window.NFT_PROJECTS || {};

  if (current !== "producers") {
    Object.values(nft).forEach(p => {
      const film = cat.find(f => f.id === p.filmId) || null;
      const title = (film && film.title) || p.title;
      if (!title) return;
      const href = ccTarget("producers", "project/" + p.id);
      out.push({
        id: "x:pr:" + p.id, kind: "Producers", label: title,
        hint: "Back it · " + (p.goal ? Math.round((p.raised || 0) / p.goal * 100) + "% funded" : "open pool"),
        icon: "coin", href, run: ccGo(href), surface: "producers", dot: CC_SURFACES.producers.dot,
      });
    });
  }

  if (current !== "watch") {
    // Rooms and screenings are things you WATCH — always point at Watch.
    Object.values(window.BRANCH_FILMS || {}).forEach(t => {
      const href = ccTarget("watch", "/branches/" + t.filmId);
      out.push({
        id: "x:room:" + t.filmId, kind: "Watch", label: t.title,
        hint: "Enter the room · " + t.totalCuts + " cuts",
        icon: "shuffle", href, run: ccGo(href), surface: "watch", dot: CC_SURFACES.watch.dot,
      });
    });
    (window.fvLineup ? window.fvLineup() : []).forEach((f, i) => {
      const href = ccTarget("watch", "/festival/film/" + f.id);
      out.push({
        id: "x:fest:" + f.id, kind: "Watch", label: f.title,
        hint: "Screening " + String(i + 1).padStart(2, "0"),
        icon: "ticket", href, run: ccGo(href), surface: "watch", dot: CC_SURFACES.watch.dot,
      });
    });
  }

  if (current !== "studio") {
    // Studio owns the making of a film — deep-link to its workspace.
    (window.PROJECTS || []).forEach(p => {
      const href = ccTarget("studio", "film/" + p.id);
      out.push({
        id: "x:st:" + p.id, kind: "Studio", label: p.title,
        hint: "Open in Studio · " + (p.status || "draft"),
        icon: "board", href, run: ccGo(href), surface: "studio", dot: CC_SURFACES.studio.dot,
      });
    });
  }

  return out;
}

// A compact "on another surface" badge for palette rows.
function CcSurfaceBadge({ surface }) {
  const s = CC_SURFACES[surface];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
      padding: "2px 7px", borderRadius: "var(--r-1)", border: "1px solid var(--c-line-2)",
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
      color: "var(--c-ink-3)", textTransform: "uppercase", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.dot }}/>{s.label}
    </span>
  );
}

Object.assign(window, { cinaCrossCommands, CcSurfaceBadge });
