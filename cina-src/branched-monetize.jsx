// branched-monetize.jsx — the Branched economy.
//
// One clever loop:
//   · LIVE PASS — pay to enter a live room, vote at every fork, and keep your
//     personal cut. The room's majority path is saved as a dated "canonical
//     cut" the moment the night ends.
//   · RENT-A-CUT — anyone who missed the live night can rent a specific saved
//     cut for 48h: the canonical Room's Cut, a rare alternate, or a path a
//     past viewer locked in. 81 possible films; these are the ones with names.
//   · ALL-ACCESS — holders/backers unlock every cut forever + 5× vote weight.
//
// Saved cuts persist in localStorage so a path voted live tonight becomes a
// rentable version tomorrow. All checkout routes through window.openPay.
//
// Loads after watch-branches-v4.jsx, before watch-branched-v5.jsx.

const { useState: usBM, useMemo: umBM, useEffect: ueBM } = React;

// ─── Cut library (persistent) ──────────────────────────────────────────────
const BM_KEY = "cina:branch-cuts-v1";
const BM_OWNED_KEY = "cina:branch-owned-v1";

function bmLoad(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; } catch { return fallback; }
}
function bmSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// The leading option at each fork → the canonical room path.
function bmCanonicalPath(tree) {
  return tree.forks.map(f => [...f.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]);
}
// The least-popular option at each fork → the rarest cut.
function bmRarePath(tree) {
  return tree.forks.map(f => [...f.options].sort((a, b) => (a.votes || 0) - (b.votes || 0))[0]);
}
function bmPathLabel(opts) { return opts.map(o => o.title).join(" → "); }
function bmPathRarity(tree, opts) {
  // product of each option's vote share → % of rooms that land this exact film
  let p = 1;
  opts.forEach((o, i) => {
    const total = tree.forks[i].options.reduce((s, x) => s + (x.votes || 0), 0) || 1;
    p *= (o.votes || 0) / total;
  });
  return p;
}

// Seeded named cuts + any cuts saved from live nights, newest first.
function bmListCuts(tree) {
  const canonical = bmCanonicalPath(tree);
  const rare = bmRarePath(tree);
  const seeded = [
    {
      id: "room", name: "The Room's Cut", tag: "CANONICAL",
      opts: canonical, price: 4.99,
      note: "The leading choice at every fork — what the room made canon tonight.",
      savedAt: "Tonight · live",
    },
    {
      id: "quiet", name: "The Quiet Cut", tag: "RARE",
      opts: rare, price: 6.99,
      note: "The road less taken, all four times. Almost no room ends up here.",
      savedAt: "Archive",
    },
  ];
  const saved = (bmLoad(BM_KEY, {})[tree.filmId] || []).map(c => ({
    ...c, opts: c.optIds.map((oid, i) => tree.forks[i].options.find(o => o.id === oid)).filter(Boolean),
  })).filter(c => c.opts.length === tree.forks.length);
  return [...saved, ...seeded].map(c => ({
    ...c,
    pathLabel: bmPathLabel(c.opts),
    rarity: bmPathRarity(tree, c.opts),
  }));
}

// Save a path (array of option objects) as a named, rentable cut.
function bmSaveCut(tree, opts, { name, mine } = {}) {
  if (!opts || opts.length !== tree.forks.length || opts.some(o => !o)) return null;
  const all = bmLoad(BM_KEY, {});
  const list = all[tree.filmId] || [];
  const optIds = opts.map(o => o.id);
  const sig = optIds.join("|");
  if (list.some(c => c.optIds.join("|") === sig)) return null; // dedupe
  const rarity = bmPathRarity(tree, opts);
  const entry = {
    id: "cut-" + Date.now(),
    name: name || (mine ? "Your cut" : "Room cut"),
    tag: mine ? "YOURS" : "FROM A ROOM",
    optIds,
    price: rarity < 0.02 ? 6.99 : 4.99,
    note: mine ? "The path you locked in, fork by fork." : "A path a live room voted into being.",
    savedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  };
  all[tree.filmId] = [entry, ...list].slice(0, 12);
  bmSet(BM_KEY, all);
  return entry;
}

// Ownership (rented/unlocked cuts + passes)
function bmOwned(filmId) { return bmLoad(BM_OWNED_KEY, {})[filmId] || { cuts: [], pass: false, allAccess: false }; }
function bmGrant(filmId, patch) {
  const all = bmLoad(BM_OWNED_KEY, {});
  all[filmId] = { cuts: [], pass: false, allAccess: false, ...(all[filmId] || {}), ...patch };
  bmSet(BM_OWNED_KEY, all);
  return all[filmId];
}

// ─── Checkout flows (route through the unified pay drawer) ──────────────────
function openBranchedLivePass(tree, onDone) {
  if (!window.openPay) return;
  window.openPay({
    kind: "ticket",
    title: `${tree.title} · Live Pass`,
    subtitle: "Tonight's room · vote every fork",
    accent: tree.accentColor, priceUSD: 8.99,
    image: { kind: tree.poster, color: tree.accentColor },
    perks: [
      "Enter the live room — vote at all " + tree.forks.length + " forks",
      "Your picks save as a personal cut you keep",
      "Rent any 5 past cuts free this month",
      "Live chat + director's room afterparty",
    ],
    onConfirm: () => { bmGrant(tree.filmId, { pass: true }); onDone && onDone("pass"); },
  });
}

function openBranchedRent(tree, cut, onDone) {
  if (!window.openPay) return;
  window.openPay({
    kind: "rent",
    title: `${tree.title} — ${cut.name}`,
    subtitle: `48-hour rental · ${cut.pathLabel}`,
    accent: tree.accentColor, priceUSD: cut.price || 4.99,
    image: { kind: tree.poster, color: tree.accentColor },
    onConfirm: () => {
      const owned = bmOwned(tree.filmId);
      bmGrant(tree.filmId, { cuts: [...new Set([...(owned.cuts || []), cut.id])] });
      onDone && onDone("rent", cut);
    },
  });
}

function openBranchedAllAccess(tree, onDone) {
  if (!window.openPay) return;
  window.openPay({
    kind: "nft", title: `${tree.title} · Producer`, subtitle: tree.director,
    accent: tree.accentColor, priceUSD: 320,
    image: { kind: tree.poster, color: tree.accentColor },
    perks: [
      "5× vote weight in every Branched film",
      `All ${tree.totalCuts} cuts unlocked, forever`,
      "Director room afterparty access",
      "Quarterly royalty on Watch revenue",
    ],
    ticketUrl: `/branches/${tree.filmId}`,
    onConfirm: () => { bmGrant(tree.filmId, { allAccess: true }); onDone && onDone("all"); },
  });
}

// ─── Access card (detail-page rail) — Live Pass vs Rent ────────────────────
function BranchedAccessCard({ tree, onEnter }) {
  const accent = tree.accentColor || tkc("amber");
  const [tick, setTick] = usBM(0);
  const owned = bmOwned(tree.filmId);
  const roomCut = umBM(() => bmListCuts(tree)[0], [tree, tick]);
  const hasLive = owned.pass || owned.allAccess;

  return (
    <div style={{ padding: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700, marginBottom: 14 }}>HOW TO WATCH</div>

      {/* Live pass */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Live Pass</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: accent }}>$8.99</div>
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "4px 0 12px" }}>
        Enter tonight's room, vote at all {tree.forks.length} forks, and keep your cut. Includes 5 free rentals.
      </p>
      {hasLive ? (
        <button onClick={onEnter} className="btn btn-primary" style={{ width: "100%", height: 40, fontSize: "var(--fs-body)", gap: 8, justifyContent: "center" }}>
          <Icon name="play" size={12}/> Enter the room — you're in
        </button>
      ) : (
        <button onClick={() => openBranchedLivePass(tree, () => { setTick(t => t + 1); })} className="btn btn-primary" style={{ width: "100%", height: 40, fontSize: "var(--fs-body)", gap: 8, justifyContent: "center" }}>
          <Icon name="ticket" size={12}/> Get Live Pass · $8.99
        </button>
      )}

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
        <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}></span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>OR RENT A CUT</span>
        <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}></span>
      </div>

      {/* Rent the canonical cut */}
      {roomCut && (
        <div style={{ padding: 12, borderRadius: "var(--r-2)", border: `1px solid ${accent}33`, background: `${accent}0c` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, fontWeight: 700 }}>{roomCut.tag}</span>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{roomCut.name}</span>
          </div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.4, marginBottom: 10 }}>{roomCut.note}</div>
          <button onClick={() => openBranchedRent(tree, roomCut, () => setTick(t => t + 1))} className="t-mono" style={{
            width: "100%", padding: "9px 0", background: "transparent", color: accent,
            border: `1px solid ${accent}66`, borderRadius: "var(--r-2)", cursor: "pointer",
            fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
          }}>RENT 48H · ${roomCut.price.toFixed(2)}</button>
        </div>
      )}

      {/* All access */}
      <button onClick={() => openBranchedAllAccess(tree, () => setTick(t => t + 1))} style={{
        marginTop: 12, width: "100%", padding: "10px 0", background: "transparent",
        color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
      }}>◈ ALL {tree.totalCuts} CUTS + 5× VOTE · $320</button>
    </div>
  );
}

Object.assign(window, { branchedListCuts: bmListCuts, branchedSaveCut: bmSaveCut, branchedOwned: bmOwned, openBranchedRent, BranchedAccessCard });
