// film-crosslinks.jsx — A film's ties to the rest of Cina: the studio that
// made it, the festival seals it carries, its branched room, its pool.
// One chip row, only rendering the ties that actually exist.

function FcChip({ label, sub, color, glyph, onClick }) {
  return (
    <button onClick={onClick} style={{
      appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit",
      display: "inline-flex", alignItems: "center", gap: 9, padding: "7px 12px",
      borderRadius: "var(--r-2)", background: "rgba(8,8,10,.6)", backdropFilter: "blur(8px)",
      border: `1px solid ${color}55`,
    }}>
      <span style={{ width: 20, height: 20, flex: "0 0 auto", borderRadius: "var(--r-2)", background: color, display: "grid", placeItems: "center", color: tkc("bg"), fontSize: "var(--fs-label)", fontWeight: 800 }}>{glyph}</span>
      <span style={{ minWidth: 0 }}>
        <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.55)" }}>{sub}</span>
        <span style={{ display: "block", fontSize: "var(--fs-body)", color: tkc("white"), lineHeight: 1.25, whiteSpace: "nowrap" }}>{label}</span>
      </span>
    </button>
  );
}

function FilmCrossLinks({ film }) {
  if (!film) return null;
  const chips = [];

  // Studio — the collective that holds the director, else their solo studio.
  const creators = window.CREATORS || [];
  const studios = window.STUDIOS || [];
  const collective = studios.find(s => (s.members || []).includes(film.creatorId));
  const creator = creators.find(c => c.id === film.creatorId);
  if (collective) {
    chips.push({ key: "st", label: collective.name, sub: "COLLECTIVE", color: collective.color, glyph: collective.name[0], onClick: () => navigate(`/studios/${collective.id}`) });
  } else if (creator) {
    chips.push({ key: "st", label: creator.name, sub: "SOLO STUDIO", color: creator.color || tkc("ink-4"), glyph: creator.name[0], onClick: () => navigate(`/studios/${creator.id}`) });
  }

  // Festival seals.
  const trophy = window.topTrophy ? window.topTrophy(film.id) : null;
  if (trophy) {
    chips.push({
      key: "tr", label: trophy.award === "GRAND JURY" ? "Grand Jury" : trophy.award === "AUDIENCE PICK" ? "Audience Pick" : "Best Craft",
      sub: "VOL " + (window.festRoman ? window.festRoman(trophy.edition) : trophy.edition),
      color: trophy.color || tkc("amber"), glyph: "✦", onClick: () => navigate("/festival"),
    });
  }

  // Branched room.
  const tree = window.BRANCH_FILMS ? window.BRANCH_FILMS[film.id] : null;
  if (tree) {
    chips.push({ key: "br", label: tree.roomSize ? tree.roomSize.toLocaleString() + " in room" : "Room opens soon", sub: tree.totalCuts + " CUTS", color: tkc("bad"), glyph: "⑃", onClick: () => navigate(`/branches/${film.id}`) });
  }

  // The pool.
  if (film.nft) {
    const p = (window.NFT_PROJECTS || {})[film.nft];
    const pct = p && p.goal ? Math.round((p.raised || 0) / p.goal * 100) : null;
    chips.push({ key: "nf", label: pct != null ? pct + "% funded" : "Open pool", sub: "PRODUCERS", color: "var(--c-amber)", glyph: "◈", onClick: () => navigate(`/producers/project/${film.nft}`) });
  }

  if (!chips.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
      {chips.map(c => <FcChip key={c.key} {...c}/>)}
    </div>
  );
}

Object.assign(window, { FilmCrossLinks });
