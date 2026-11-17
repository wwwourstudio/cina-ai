// cut-rentals.jsx — The rental storefront for branched cinema.
// A branched film's canonical path is what everyone sees first; every other
// path through the tree is a distinct cut you can rent. This is the shelf
// where those cuts are browsed, priced, and rented. Route: #/cuts/:filmId

const { useState: usCR, useMemo: umCR } = React;

const CR_BLOOD = tkc("bad");

// Enumerate a sample of paths through the tree. A 4×3 tree has 81 cuts —
// far too many to list, so we surface the ones the room actually watches:
// the canonical path, the near-misses, and a few deep-cut outliers.
function crCuts(tree, meta) {
  const forks = tree?.forks || [];
  if (!forks.length) return [];
  const out = [];
  const label = (picks) => picks.map((p, i) => (forks[i].options[p] || {}).title || "—").join(" → ");

  const canonPicks = forks.map(f => Math.max(0, f.options.findIndex(o => o.leading)));
  out.push({
    id: "canon", picks: canonPicks, name: "The Canonical Cut",
    path: label(canonPicks), rank: 1,
    rentedWk: Math.round((meta.cutsRentedWk || 0) * 0.42),
    note: "What the room voted in. The version a new viewer sees first.",
    canonical: true,
  });

  // Near-misses: flip one fork away from canon.
  forks.forEach((f, i) => {
    const alt = f.options.findIndex((o, j) => !o.leading && j !== canonPicks[i]);
    if (alt < 0) return;
    const picks = canonPicks.map((p, j) => (j === i ? alt : p));
    out.push({
      id: "near" + i, picks, name: `The ${f.actLabel || "Act " + (i + 1)} Divergence`,
      path: label(picks), rank: out.length + 1,
      rentedWk: Math.round((meta.cutsRentedWk || 0) * (0.14 - i * 0.02)),
      note: `Identical until ${f.atMinute}′, then takes the branch the room passed on.`,
    });
  });

  // Deep cuts: diverge everywhere.
  const contrary = forks.map((f, i) => {
    const idx = f.options.findIndex(o => !o.leading);
    return idx < 0 ? 0 : idx;
  });
  out.push({
    id: "contrary", picks: contrary, name: "The Contrary Cut",
    path: label(contrary), rank: out.length + 1,
    rentedWk: Math.round((meta.cutsRentedWk || 0) * 0.03),
    note: "Every fork taken against the room. A different film by the end.",
  });

  return out.map(c => ({
    ...c,
    priceUSD: c.canonical ? meta.rentPriceUSD : Math.max(2, meta.rentPriceUSD - 2),
    runtimeMin: (tree.totalRuntimeMin || 96) + (c.canonical ? 0 : (c.id.length % 5) - 2),
  }));
}

function CutRentalsPage({ filmId }) {
  const tree = window.BRANCH_FILMS ? window.BRANCH_FILMS[filmId] : null;
  const meta = window.pbMeta ? window.pbMeta(filmId) : null;
  const [sort, setSort] = usCR("rented");
  const cuts = umCR(() => (tree && meta ? crCuts(tree, meta) : []), [tree, meta]);

  if (!tree || !meta) return (
    <div style={{ padding: "80px var(--gutter)", textAlign: "center" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 14 }}>NO CUTS FOR THIS FILM</div>
      <button className="btn" onClick={() => navigate("/branches")}>Branched rooms</button>
    </div>
  );

  const sorted = sort === "rented" ? [...cuts].sort((a, b) => b.rentedWk - a.rentedWk)
               : sort === "rare" ? [...cuts].sort((a, b) => a.rentedWk - b.rentedWk)
               : cuts;
  const PADX = "var(--gutter)";

  return (
    <div data-screen-label="Cut rentals" style={{ background: "var(--c-bg)", minHeight: "100vh", paddingBottom: 90 }}>
      {/* Head */}
      <PmMasthead index="Cut rentals" path={tree.title} count={`${meta.forks} forks`} title={<>The {meta.totalCuts.toLocaleString()} films inside this one.</>} lede={`The room voted one path into canon. Every other route through the ${meta.forks} forks still exists as a finished cut. Rent any of them, and ${meta.cutRevShare}% routes to whoever holds the rights to that branch.`}>
        <button className="pm-chip" onClick={() => navigate(`/branches/${filmId}`)}>← The room</button>
      </PmMasthead>
      <section className="pm-wrap">
        <div className="pm-stats pm-panel">
          <div className="pm-stat"><span className="pm-k">Rented this week</span><span className="pm-stat__v">{(meta.cutsRentedWk || 0).toLocaleString()}</span></div>
          <div className="pm-stat"><span className="pm-k">Per cut</span><span className="pm-stat__v">${meta.rentPriceUSD}</span></div>
          <div className="pm-stat"><span className="pm-k">To rights holders</span><span className="pm-stat__v" style={{ color: "var(--c-amber)" }}>{meta.cutRevShare}%</span></div>
        </div>
      </section>

      {/* Sort */}
      <div style={{ padding: `18px ${PADX} 0`, display: "flex", gap: 7, flexWrap: "wrap" }}>
        {[["rented", "MOST RENTED"], ["rare", "RAREST"], ["tree", "TREE ORDER"]].map(([k, l]) => (
          <button key={k} onClick={() => setSort(k)} style={{
            appearance: "none", cursor: "pointer", borderRadius: 999, padding: "6px 13px",
            border: `1px solid ${sort === k ? "rgba(201,85,72,.5)" : "var(--c-line-2)"}`,
            background: sort === k ? "rgba(201,85,72,.12)" : "transparent",
            color: sort === k ? tkc("amber-x") : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
          }}>{l}</button>
        ))}
      </div>

      {/* Shelf */}
      <div style={{ padding: `18px ${PADX} 0`, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
        {sorted.map(c => (
          <div key={c.id} style={{
            borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-panel)",
            border: `1px solid ${c.canonical ? "rgba(201,85,72,.4)" : "var(--c-line)"}`,
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ position: "relative", aspectRatio: "16/9", background: `linear-gradient(140deg, ${tree.accentColor}, ${tkc("void")})`, overflow: "hidden" }}>
              {window.FrameThumb ? <FrameThumb kind={tree.poster} usePhoto/> : null}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.1) 60%)" }}/>
              {c.canonical && (
                <span className="t-mono" style={{ position: "absolute", top: 10, left: 10, padding: "3px 8px", borderRadius: "var(--r-1)", background: CR_BLOOD, color: tkc("white"), fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700 }}>CANON</span>
              )}
              <span className="t-mono" style={{ position: "absolute", top: 10, right: 10, padding: "3px 8px", borderRadius: "var(--r-1)", background: "rgba(8,8,10,.75)", color: "rgba(255,255,255,.8)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
                {c.runtimeMin}M
              </span>
              <div style={{ position: "absolute", left: 12, right: 12, bottom: 11 }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.1 }}>{c.name}</div>
              </div>
            </div>
            <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{c.path.toUpperCase()}</div>
              <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink-3)", margin: 0, textWrap: "pretty" }}>{c.note}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto", paddingTop: 4 }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{c.rentedWk.toLocaleString()} RENTED / WK</span>
                <button className="btn btn-primary" style={{ height: 32, padding: "0 13px", fontSize: "var(--fs-body)" }} onClick={() => {
                  if (window.openPay) window.openPay({
                    kind: "rent", title: tree.title + " · " + c.name, subtitle: c.path,
                    accent: tree.accentColor, priceUSD: c.priceUSD,
                    image: { kind: tree.poster, color: tree.accentColor },
                    perks: ["48-hour window", c.runtimeMin + " minutes", meta.cutRevShare + "% routes to the branch holder"],
                    onConfirm: () => window.toast && window.toast({ title: "RENTED", text: c.name, kind: "good" }),
                  });
                  else if (window.toast) window.toast({ title: "RENTED", text: c.name, kind: "good" });
                }}>Rent ${c.priceUSD}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CutRentalsPage });
