// producers-branched.jsx — Branched cinema as an asset class on Producers.
// Supplies the branched metadata the market / auction floor / index / create
// flow all read from. Loads before watch-auction.jsx and producers-app.jsx.

const PB_BRANCH = {
  frequency: {
    filmId: "frequency", title: "Frequency 88.6", forks: 4, optionsPerFork: 3,
    totalCuts: 81, roomSize: 2840, liveNow: 1284, voteWindowSec: 90,
    canonical: "Signal", cutRevShare: 4, rentPriceUSD: 6, cutsRentedWk: 3120,
    accent: tkc("amber"),
  },
  marauder: {
    filmId: "marauder", title: "Marauder", forks: 4, optionsPerFork: 3,
    totalCuts: 64, roomSize: 1960, liveNow: 742, voteWindowSec: 75,
    canonical: "Take the road", cutRevShare: 5, rentPriceUSD: 5, cutsRentedWk: 2140,
    accent: tkc("bad"),
  },
  swallows: {
    filmId: "swallows", title: "The Swallows", forks: 3, optionsPerFork: 3,
    totalCuts: 27, roomSize: 1210, liveNow: 388, voteWindowSec: 60,
    canonical: "She stays", cutRevShare: 4, rentPriceUSD: 4, cutsRentedWk: 980,
    accent: tkc("cat-2"),
  },
};

const PB_BLOOD = tkc("bad");

function pbMeta(id) { return PB_BRANCH[id] || null; }

// Fork-tree glyph: one root splitting three ways, leading path lit.
function BranchGlyph({ size = 14, color = PB_BLOOD, dim = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={dim} strokeWidth="3.2" strokeLinecap="round" style={{ opacity: 1 }}>
      <path d="M24 8 L24 18"/>
      <path d="M24 18 L10 26 L10 40" opacity=".45"/>
      <path d="M24 18 L24 40" stroke={color}/>
      <path d="M24 18 L38 26 L38 40" opacity=".45"/>
    </svg>
  );
}

function BranchedTag({ compact }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: compact ? "3px 7px" : "4px 9px", borderRadius: "var(--r-2)",
      background: "rgba(201,85,72,.14)", border: "1px solid rgba(201,85,72,.42)",
      color: PB_BLOOD, fontFamily: "var(--f-mono)", fontSize: compact ? 8.5 : 9,
      letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <BranchGlyph size={10} color={PB_BLOOD} dim={PB_BLOOD}/>Branched
    </span>
  );
}

// Live-room strip shown on branched market cards: forks, cuts, room heat.
function BranchedStatStrip({ meta }) {
  if (!meta) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "8px 10px",
      border: "1px solid rgba(201,85,72,.28)", borderRadius: "var(--r-2)",
      background: "rgba(201,85,72,.06)",
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
      color: "var(--c-ink-2)", textTransform: "uppercase",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: PB_BLOOD, fontWeight: 700 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: PB_BLOOD, boxShadow: `0 0 7px ${PB_BLOOD}` }}/>
        {meta.liveNow.toLocaleString()} in room
      </span>
      <span style={{ color: "var(--c-ink-4)" }}>·</span>
      <span>{meta.forks} forks</span>
      <span style={{ color: "var(--c-ink-4)" }}>·</span>
      <span>{meta.totalCuts} cuts</span>
    </div>
  );
}

// Extra lots for the auction floor: rights that only exist on branched films.
function pbBranchedLots() {
  const out = [];
  const thumbs = { frequency: "frequency", marauder: "marauder", swallows: "swallows" };
  const sellers = ["tao_reng", "void_91", "miradawn", "reel.eth", "june_a", "0x3c…44"];
  let n = 0;
  Object.values(PB_BRANCH).forEach((m, i) => {
    [
      { tier: "Canonical Cut", tierKey: "canonical-cut", base: 9.4, count: 1,
        note: `Owns the ${m.canonical} path — the room's locked ending. Rent revenue routes to the holder.` },
      { tier: "Fork Rights", tierKey: "fork-rights", base: 3.1, count: 2,
        note: "One fork of the tree. Every viewer who takes this branch pays through to you." },
      { tier: "Room Seat", tierKey: "room-seat", base: 0.38, count: 3,
        note: "5× vote weight in the live room, for every screening, forever." },
    ].forEach(t => {
      for (let k = 0; k < t.count; k++) {
        n++;
        const drift = Math.sin(n * 0.9) * 0.35 + 1;
        const top = +(t.base * drift * (1 + (n % 7) / 14)).toFixed(3);
        out.push({
          id: `auc_br_${m.filmId}_${t.tierKey}_${k}`,
          projectId: m.filmId, projectTitle: m.title, creator: m.title === "Frequency 88.6" ? "Tao Reng" : "Cina Originals",
          color: m.accent, thumb: thumbs[m.filmId], branched: true, branchMeta: m,
          edition: t.tierKey === "canonical-cut" ? "1 / 1" : `${k + 1} / ${m.forks}`,
          tier: t.tier, tierKey: t.tierKey,
          seller: sellers[(n + i) % sellers.length],
          reservePrice: +(top * 0.72).toFixed(3), currentBid: top, buyItNow: +(top * 1.45).toFixed(3),
          bidCount: 4 + (n % 11), endsInH: 1 + ((n * 13) % 72), royalty: 8,
          synopsis: t.note,
        });
      }
    });
  });
  return out;
}

// Exported as PbBranchGlyph: watch-content-v4.jsx already owns the global
// `BranchGlyph` with a different signature ({accent, lit, w, h}), and this
// file loads later — publishing under the same name silently replaced its
// fork diagram on every branched room card.
Object.assign(window, { PB_BRANCH, pbMeta, PbBranchGlyph: BranchGlyph, BranchedTag, BranchedStatStrip, pbBranchedLots });
// Only claim the bare name where nothing else defined it (Producers, Studio).
if (!window.BranchGlyph) window.BranchGlyph = BranchGlyph;
