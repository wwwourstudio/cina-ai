// watch-producers-shelf.jsx — "Open pools" shelf on the Watch home.
// Image-thumb tiles with NFT chips (floor tier, funded %, window, branched),
// scrolling horizontally, ending in a card that hands off to Producers.

const { useMemo: umPS, useRef: urPS, useState: usPS } = React;

function psLaunched() {
  if (window.__cinaLaunched) return window.__cinaLaunched;
  try { return JSON.parse(localStorage.getItem("cina-launched-v1")) || []; } catch (_) { return []; }
}

function psRows() {
  const NFT = window.NFT_PROJECTS || {};
  const cat = window.CATALOG || [];
  const byNft = {};
  cat.forEach(f => { if (f.nft) byNft[f.nft] = f; });
  // Pools opened through the create flow lead the shelf — they're the newest.
  const mine = psLaunched().map(p => ({
    id: p.id, film: p.film || null, title: p.film?.title || p.title, creator: p.creator || "You",
    color: p.color || tkc("cat-3"), thumb: p.thumb || "darkroom-wide",
    floorUSD: p.floorUSD || 90, fundedPct: Math.min(100, Math.round((p.raised || 0) / (p.goal || 1) * 100)),
    daysLeft: p.daysLeft ?? 30, revShare: p.revShare || 8, backers: p.backers || 0,
    branched: !!p.branched, yours: true,
  }));
  return mine.concat(Object.values(NFT)
    .map(p => {
      const film = byNft[p.id] || cat.find(f => f.id === p.filmId) || null;
      const goal = p.goal || 1;
      return {
        id: p.id, film,
        title: film?.title || p.title || "Untitled",
        creator: p.creator || film?.creator || "",
        color: p.color || film?.color || tkc("cat-3"),
        thumb: film?.thumb || p.thumb || "darkroom-wide",
        floorUSD: p.floorUSD || 120,
        fundedPct: Math.min(100, Math.round((p.raised || 0) / goal * 100)),
        daysLeft: p.daysLeft ?? 12,
        revShare: p.revShare || 8,
        backers: p.backers || 0,
        branched: !!(window.BRANCH_FILMS && film && window.BRANCH_FILMS[film.id]),
      };
    })
    .filter(r => r.fundedPct < 100)
    .sort((a, b) => b.fundedPct - a.fundedPct))
    .slice(0, 10);
}

function PsChip({ children, tone }) {
  return <CinaPill tone={tone === "amber" ? "solid" : tone === "blood" ? "bad" : "dark"}>{children}</CinaPill>;
}

function PsTile({ row }) {
  const [hover, setHover] = usPS(false);
  return (
    <button
      onClick={() => navigate(`/nft/${row.id}`)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        appearance: "none", padding: 0, border: "none", background: "transparent",
        textAlign: "left", cursor: "pointer", color: "inherit",
        width: 268, flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 11,
      }}>
      <div style={{
        position: "relative", aspectRatio: "16/10", borderRadius: "var(--r-2)", overflow: "hidden",
        background: `linear-gradient(140deg, ${row.color}, ${tkc("void")})`,
        border: `1px solid ${hover ? "var(--c-line-3)" : "var(--c-line)"}`, transition: "border-color .15s ease",
      }}>
        {window.FrameThumb ? (
          <div style={{ position: "absolute", inset: 0, transform: hover ? "scale(1.04)" : "none", transition: "transform .5s cubic-bezier(.2,.7,.2,1)" }}>
            <FrameThumb kind={row.thumb} usePhoto/>
          </div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.82), rgba(0,0,0,.05) 55%)" }}/>
        <div style={{ position: "absolute", top: 9, left: 9, display: "flex", gap: 5, flexWrap: "wrap" }}>
          <PsChip tone="amber">NFT · ${row.floorUSD}</PsChip>
          {row.branched && <PsChip tone="blood">Branched</PsChip>}
          {row.yours && <PsChip>Yours</PsChip>}
        </div>
        <div style={{ position: "absolute", top: 9, right: 9 }}>
          <PsChip>{row.daysLeft}d left</PsChip>
        </div>
        <div style={{ position: "absolute", left: 11, right: 11, bottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.75)" }}>
            <span style={{ color: "var(--c-amber)", fontWeight: 700 }}>{row.fundedPct}% FUNDED</span>
            <span>{row.backers.toLocaleString()} BACKERS</span>
          </div>
          <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,.18)", overflow: "hidden" }}>
            <div style={{ width: `${row.fundedPct}%`, height: "100%", background: "var(--c-amber)" }}/>
          </div>
        </div>
      </div>
      <div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, color: hover ? "var(--c-amber)" : "var(--c-ink)", transition: "color .15s ease" }}>{row.title}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginTop: 5, textTransform: "uppercase" }}>
          {row.creator} · {row.revShare}% rev share
        </div>
      </div>
    </button>
  );
}

function ProducersShelf() {
  const rows = umPS(() => psRows(), []);
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const scroller = urPS(null);
  if (!rows.length) return null;
  const nudge = (dir) => { const el = scroller.current; if (el) el.scrollBy({ left: dir * 560, behavior: "smooth" }); };
  return (
    <section style={{ padding: isMobile ? "28px 20px 24px" : "38px var(--gutter) 32px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)" }}/>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>PRODUCERS · OPEN POOLS</span>
          </span>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: isMobile ? 23 : 30, margin: 0, letterSpacing: "-0.02em", lineHeight: 0.98 }}>
            Own a piece of what you watch.
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isMobile && (
            <>
              <button onClick={() => nudge(-1)} className="btn" style={{ width: 34, height: 34, padding: 0, justifyContent: "center" }} aria-label="Scroll left">←</button>
              <button onClick={() => nudge(1)} className="btn" style={{ width: 34, height: 34, padding: 0, justifyContent: "center" }} aria-label="Scroll right">→</button>
            </>
          )}
          <button onClick={() => navigate("/producers")} className="btn" style={{ height: 34, padding: "0 16px", fontSize: "var(--fs-body)" }}>All pools →</button>
        </div>
      </div>
      <div ref={scroller} style={{ display: "flex", gap: 16, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {rows.map(r => <PsTile key={r.id} row={r}/>)}
        <button onClick={() => navigate("/producers")} style={{
          appearance: "none", cursor: "pointer", color: "inherit", textAlign: "left",
          width: 268, flex: "0 0 auto", borderRadius: "var(--r-2)", padding: 20,
          background: "linear-gradient(140deg, rgba(var(--accent-rgb),.12), transparent 65%)",
          border: "1px dashed rgba(var(--accent-rgb),.4)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, minHeight: 168,
        }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.05 }}>Every open pool on Cina.</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>Tiers, royalties, the auction floor, and your stakes in one market.</div>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700, marginTop: 4 }}>OPEN PRODUCERS →</span>
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { ProducersShelf });
