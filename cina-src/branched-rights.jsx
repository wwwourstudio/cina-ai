// branched-rights.jsx — The branched asset class, everywhere it's traded.
// A fork-tree panel for the Producers project page, path context for auction
// lots, a buy entry inside the room itself, and a rights class in the
// portfolio. All read the same PB_BRANCH / BRANCH_FILMS metadata.

const { useState: usBR2, useMemo: umBR2 } = React;

const BR2_BLOOD = tkc("bad");

// The three rights sold on any branched film.
function br2Rights(meta, project) {
  const floor = project?.floorUSD || 120;
  return [
    { key: "canonical-cut", name: "Canonical Cut", supply: 1, priceUSD: floor * 34,
      body: `Co-owns the ${meta.canonical || "locked"} path — the ending the room voted in. Every rental of the canonical cut pays through to the holder.`,
      perks: ["1 / 1 edition", `${meta.cutRevShare}% of all cut rentals`, "Named in the room credits"] },
    { key: "fork-rights", name: "Fork Rights", supply: meta.forks, priceUSD: floor * 5,
      body: "One branch of the tree, for the life of the film. When a viewer takes your fork, the rental routes to you.",
      perks: [`1 of ${meta.forks} editions`, "Revenue on your path only", "Vote weight ×3 at your fork"] },
    { key: "room-seat", name: "Room Seat", supply: meta.roomSize || 1200, priceUSD: floor,
      body: "A permanent seat in the live room: five times the vote weight at every fork, every screening.",
      perks: ["Vote weight ×5", "All cuts you unlock stay yours", "Front-row chat"] },
  ];
}

// ─── Fork tree diagram ──────────────────────────────────────────────────
function Br2Tree({ meta, tree }) {
  const forks = tree?.forks || (meta.forkSpec || []).map((f, i) => ({ actLabel: f.act, atMinute: f.at, heading: f.heading, question: f.question, options: [] }));
  if (!forks.length) return null;
  const per = meta.optionsPerFork || 3;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {forks.map((f, i) => {
        const opts = f.options && f.options.length ? f.options : Array.from({ length: per }, (_, j) => ({ id: j, title: "—", votes: 0, leading: j === 0 }));
        const total = opts.reduce((s, o) => s + (o.votes || 0), 0) || 1;
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "84px 1fr", gap: 14, padding: "12px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700 }}>{f.actLabel || "ACT " + (i + 1)}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 5 }}>{f.atMinute}′</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.35 }}>{f.heading}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 3, fontStyle: "italic" }}>{f.question}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                {opts.map((o, j) => {
                  const share = Math.round(((o.votes || 0) / total) * 100);
                  return (
                    <span key={j} style={{
                      display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 9px", borderRadius: "var(--r-2)",
                      border: `1px solid ${o.leading ? BR2_BLOOD + "88" : "var(--c-line-2)"}`,
                      background: o.leading ? "rgba(201,85,72,.09)" : "transparent",
                      fontSize: "var(--fs-body)", color: o.leading ? "var(--c-ink)" : "var(--c-ink-3)",
                    }}>
                      {o.glyph ? <span style={{ color: o.color || BR2_BLOOD, fontSize: "var(--fs-label)" }}>{o.glyph}</span> : null}
                      {o.title}
                      {o.votes ? <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{share}%</span> : null}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Producers project page: the branched panel ─────────────────────────
function BranchedProjectPanel({ project }) {
  const meta = project?.branch || (window.pbMeta ? window.pbMeta(project?.film?.id || project?.filmId) : null);
  if (!meta) return null;
  const tree = window.BRANCH_FILMS ? window.BRANCH_FILMS[meta.filmId] : null;
  const rights = br2Rights(meta, project);
  const weekly = (meta.cutsRentedWk || 0) * (meta.rentPriceUSD || 0);

  return (
    <section style={{ margin: "0 auto", maxWidth: "var(--w-mid)", padding: "0 clamp(16px,3vw,32px) 44px" }}>
      <div style={{ border: "1px solid rgba(201,85,72,.32)", borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-panel)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-line)", background: "rgba(201,85,72,.06)", display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
          {window.PbBranchGlyph ? <window.PbBranchGlyph size={20} color={BR2_BLOOD} dim="rgba(201,85,72,.5)"/> : null}
          <div style={{ minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700 }}>BRANCHED CINEMA</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 5 }}>
              {meta.forks} forks · {meta.totalCuts.toLocaleString()} possible cuts · room votes {meta.voteWindowSec}s at each
            </div>
          </div>
          <span style={{ flex: 1 }}/>
          {tree && (
            <button className="btn" style={{ height: 34, padding: "0 14px", fontSize: "var(--fs-body)" }}
              onClick={() => { window.location.href = "index.html#/branches/" + meta.filmId; }}>
              Enter the room →
            </button>
          )}
        </div>

        {/* Cut economics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", borderBottom: "1px solid var(--c-line)" }}>
          {[
            ["IN ROOM NOW", meta.liveNow ? meta.liveNow.toLocaleString() : "—"],
            ["CUTS RENTED / WK", (meta.cutsRentedWk || 0).toLocaleString()],
            ["RENTAL PRICE", "$" + (meta.rentPriceUSD || 0)],
            ["WEEKLY CUT REVENUE", "$" + weekly.toLocaleString()],
            ["TO HOLDERS", meta.cutRevShare + "%"],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: "14px 18px", borderRight: "1px solid var(--c-line)" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 }}>{k}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-lead)", color: k === "TO HOLDERS" ? "var(--c-amber)" : "var(--c-ink)" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Tree */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-line)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 10 }}>THE FORK TREE</div>
          <Br2Tree meta={meta} tree={tree}/>
        </div>

        {/* Rights on sale */}
        <div style={{ padding: "16px 20px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 12 }}>RIGHTS ON SALE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(258px,1fr))", gap: 12 }}>
            {rights.map(r => (
              <div key={r.key} style={{ padding: 15, border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", background: "var(--c-panel-2)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{r.name}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>{r.supply === 1 ? "1 / 1" : r.supply.toLocaleString() + " EDS"}</span>
                </div>
                <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink-3)", margin: 0, textWrap: "pretty" }}>{r.body}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto", paddingTop: 4 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>${r.priceUSD.toLocaleString()}</span>
                  <button className="btn btn-primary" style={{ height: 32, padding: "0 13px", fontSize: "var(--fs-body)" }} onClick={() => {
                    if (window.openPayDrawer) window.openPayDrawer({
                      kind: "nft", title: r.name, subtitle: (project.film?.title || project.title) + " · branched rights",
                      accent: BR2_BLOOD, priceUSD: r.priceUSD, perks: r.perks,
                    });
                    else if (window.toast) window.toast({ title: "ADDED", text: r.name, kind: "good" });
                  }}>Acquire</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Auction lot: which path is being sold ──────────────────────────────
function BranchedLotContext({ auction }) {
  const meta = auction?.branchMeta || (window.pbMeta ? window.pbMeta(auction?.projectId) : null);
  if (!auction?.branched || !meta) return null;
  const tree = window.BRANCH_FILMS ? window.BRANCH_FILMS[meta.filmId] : null;
  const isCanon = auction.tierKey === "canonical-cut";
  const isFork = auction.tierKey === "fork-rights";
  const forkIdx = isFork ? (parseInt(String(auction.edition).split("/")[0]) || 1) - 1 : -1;
  const fork = tree && forkIdx >= 0 ? tree.forks[forkIdx] : null;

  return (
    <div style={{ border: "1px solid rgba(201,85,72,.3)", borderRadius: "var(--r-2)", overflow: "hidden", background: "rgba(201,85,72,.05)" }}>
      <div style={{ padding: "12px 15px", borderBottom: "1px solid rgba(201,85,72,.22)", display: "flex", alignItems: "center", gap: 10 }}>
        {window.PbBranchGlyph ? <window.PbBranchGlyph size={15} color={BR2_BLOOD} dim="rgba(201,85,72,.5)"/> : null}
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700 }}>
          {isCanon ? "THE CANONICAL PATH" : isFork ? "FORK " + (forkIdx + 1) + " OF " + meta.forks : "A SEAT IN THE ROOM"}
        </span>
      </div>
      <div style={{ padding: "14px 15px", display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: 0, textWrap: "pretty" }}>
          {isCanon
            ? `The room voted "${meta.canonical}" into canon. This lot is that path: the cut new viewers see first, and the one most rented of the ${meta.totalCuts.toLocaleString()} possible.`
            : isFork && fork
              ? `Fork at ${fork.atMinute}′ — "${fork.heading}" The winner takes ${meta.optionsPerFork} ways from here; whoever holds this lot earns on every viewer who walks this branch.`
              : `${meta.forks} forks, ${meta.voteWindowSec} seconds each. This seat votes at five times weight, at every screening, forever.`}
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            ["CUTS RENTED / WK", (meta.cutsRentedWk || 0).toLocaleString()],
            ["RENTAL", "$" + (meta.rentPriceUSD || 0)],
            ["HOLDER SHARE", meta.cutRevShare + "%"],
            ["IN ROOM", (meta.liveNow || 0).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 }}>{k}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{v}</div>
            </div>
          ))}
        </div>
        {fork && fork.options && fork.options.length > 0 && (
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 8 }}>WHERE IT LEADS</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {fork.options.map((o, j) => (
                <span key={j} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: "var(--r-2)",
                  border: `1px solid ${o.leading ? BR2_BLOOD + "88" : "var(--c-line-2)"}`,
                  background: o.leading ? "rgba(201,85,72,.09)" : "transparent", fontSize: "var(--fs-body)",
                  color: o.leading ? "var(--c-ink)" : "var(--c-ink-3)",
                }}>
                  <span style={{ color: o.color || BR2_BLOOD, fontSize: "var(--fs-label)" }}>{o.glyph}</span>{o.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── In-room buy entry ──────────────────────────────────────────────────
function OwnThisForkButton({ tree, fork }) {
  const meta = window.pbMeta ? window.pbMeta(tree.filmId) : null;
  const [open, setOpen] = usBR2(false);
  if (!meta) return null;
  const rights = br2Rights(meta, { floorUSD: 120, film: tree, title: tree.title });
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderRadius: "var(--r-2)", background: "rgba(201,85,72,.16)",
        border: "1px solid rgba(201,85,72,.5)", color: "var(--c-bad)",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
      }}>
        {window.PbBranchGlyph ? <window.PbBranchGlyph size={11} color={tkc("amber-x")} dim={tkc("amber-x")}/> : null}
        OWN THIS FORK
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 400, background: "rgba(6,6,9,.86)", backdropFilter: "blur(10px)",
          display: "grid", placeItems: "center", padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "min(660px,100%)", maxHeight: "88vh", overflowY: "auto", borderRadius: "var(--r-3)",
            background: "var(--c-panel)", border: "1px solid var(--c-line-2)", padding: 24,
          }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: BR2_BLOOD, fontWeight: 700, marginBottom: 9 }}>BRANCHED RIGHTS · {tree.title.toUpperCase()}</div>
            <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Own a path, not a poster.
            </h2>
            <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--c-ink-3)", margin: "0 0 20px", textWrap: "pretty" }}>
              {meta.cutsRentedWk.toLocaleString()} cuts rented last week at ${meta.rentPriceUSD} each. {meta.cutRevShare}% of that routes to rights holders, split by whose branch the viewer took.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {rights.map(r => (
                <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{r.name}</div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4, lineHeight: 1.45 }}>{r.body}</div>
                  </div>
                  <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-lead)", color: "var(--c-amber)", marginBottom: 7 }}>${r.priceUSD.toLocaleString()}</div>
                    <button className="btn btn-primary" style={{ height: 30, padding: "0 12px", fontSize: "var(--fs-body)" }} onClick={() => {
                      setOpen(false);
                      if (window.openPayDrawer) window.openPayDrawer({
                        kind: "nft", title: r.name, subtitle: tree.title + " · branched rights",
                        accent: BR2_BLOOD, priceUSD: r.priceUSD, perks: r.perks,
                      });
                    }}>Acquire</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn" style={{ marginTop: 18, height: 34, padding: "0 14px", fontSize: "var(--fs-body)" }} onClick={() => setOpen(false)}>Back to the room</button>
          </div>
        </div>
      )}
    </>
  );
}

Object.assign(window, { BranchedProjectPanel, BranchedLotContext, OwnThisForkButton });
