// slate-signals.jsx — What each film on the slate is doing out in the world.
// The Studio slate knows a film's production status; it did not know whether
// that film has a room running, a pool open, or a festival seal. This module
// supplies those signals and the catalog-wide totals band above the list.

// Map a studio project to its public catalog title. Studio ids (p1, LL-01)
// don't match Watch ids, so match on title first, then code.
const ssNorm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function ssPublic(film) {
  const cat = window.CATALOG || window.WD_CATALOG || [];
  const t = ssNorm(film.title);
  if (!t) return null;
  return cat.find(f => ssNorm(f.title) === t)
      || cat.find(f => ssNorm(f.id) === ssNorm(film.id))
      || null;
}

// A room can be matched by the branched metadata's own title even when the
// studio project has no public catalog entry yet.
function ssBranchByTitle(film) {
  const t = ssNorm(film.title);
  if (!t) return null;
  const all = window.PB_BRANCH || {};
  return Object.values(all).find(m => ssNorm(m.title) === t
    || ssNorm(m.title).startsWith(t) || t.startsWith(ssNorm(m.title))) || null;
}

// Every outside signal attached to one slate row.
function ssSignals(film) {
  const pub = ssPublic(film);
  const out = { pub, branch: null, pool: null, trophy: null, screening: null, live: false };
  out.branch = (pub && window.pbMeta ? window.pbMeta(pub.id) : null) || ssBranchByTitle(film);
  out.live = !!(out.branch && out.branch.liveNow);
  if (pub) {
    if (pub.nft) out.pool = (window.NFT_PROJECTS || {})[pub.nft] || null;
    if (window.topTrophy) out.trophy = window.topTrophy(pub.id);
    const lineup = window.fvLineup ? window.fvLineup() : [];
    const i = lineup.findIndex(f => f.id === pub.id);
    if (i >= 0) out.screening = i + 1;
  }
  return out;
}

// What a film earns, per month, from everything wired to it.
function ssEarnings(film, sig) {
  let royalties = 0, rentals = 0;
  if (sig.pool) royalties = (sig.pool.royaltyPaid || 0) / 12;
  if (sig.branch) rentals = (sig.branch.cutsRentedWk || 0) * (sig.branch.rentPriceUSD || 0) * 4.3;
  const ads = (film.views || 0) * 0.0009;
  return { royalties, rentals, ads, total: royalties + rentals + ads };
}

const ssMoney = n => n >= 1000 ? "$" + (n / 1000).toFixed(1) + "K" : "$" + Math.round(n);

// ─── Row chips ──────────────────────────────────────────────────────────
function SlateSignalChips({ film, compact }) {
  const sig = ssSignals(film);
  const chips = [];
  const base = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: compact ? "2px 6px" : "3px 8px", borderRadius: "var(--r-1)",
    fontFamily: "var(--f-mono)", fontSize: compact ? 8 : 8.5,
    letterSpacing: ".16em", fontWeight: 700, whiteSpace: "nowrap", textTransform: "uppercase",
  };

  if (sig.live) chips.push(
    <span key="live" style={{ ...base, background: "rgba(201,85,72,.16)", border: "1px solid rgba(201,85,72,.45)", color: "var(--c-bad)" }}>
      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: `0 0 6px ${tkc("bad")}` }}/>
      {sig.branch.liveNow.toLocaleString()} in room
    </span>
  );
  else if (sig.branch) chips.push(
    <span key="br" style={{ ...base, background: "rgba(201,85,72,.1)", border: "1px solid rgba(201,85,72,.35)", color: tkc("ink-3") }}>
      {sig.branch.forks} forks
    </span>
  );

  if (sig.screening) chips.push(
    <span key="sc" style={{ ...base, background: "rgba(var(--accent-rgb),.12)", border: "1px solid rgba(var(--accent-rgb),.4)", color: "var(--c-amber)" }}>
      Screening {String(sig.screening).padStart(2, "0")}
    </span>
  );

  if (sig.trophy) chips.push(
    <span key="tr" style={{ ...base, background: "rgba(var(--accent-rgb),.12)", border: "1px solid rgba(var(--accent-rgb),.4)", color: "var(--c-amber)" }}>
      ✦ {sig.trophy.award === "GRAND JURY" ? "Grand jury" : sig.trophy.award === "AUDIENCE PICK" ? "Audience" : "Craft"}
    </span>
  );

  if (sig.pool) {
    const pct = sig.pool.goal ? Math.round((sig.pool.raised || 0) / sig.pool.goal * 100) : null;
    chips.push(
      <span key="pl" style={{ ...base, background: "var(--c-panel-3)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)" }}>
        ◈ {pct != null ? pct + "% funded" : "Pool open"}
      </span>
    );
  }

  if (!chips.length) return null;
  return <span style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>{chips}</span>;
}

// ─── Totals band above the list ─────────────────────────────────────────

Object.assign(window, { SlateSignalChips, ssSignals, ssEarnings });
