// producers-app.jsx — Cina Producers: NFT marketplace where producers
// browse films & series and buy stakes (collector / patron / producer tiers).
// Reuses NFT_PROJECTS data from watch-data.jsx; for projects without a full
// NFT_PROJECTS entry we synthesize a market-listing card from the CATALOG film.

const { useState: prUseState, useEffect: prUseEffect, useMemo: prUseMemo } = React;

// ─── Build a unified project list from CATALOG + NFT_PROJECTS ──────────
// Every film/series with an `nft` id becomes a tradable project.
function buildProjectIndex() {
  const list = [];
  if (!window.__cinaLaunched) {
    try { window.__cinaLaunched = JSON.parse(localStorage.getItem("cina-launched-v1")) || []; } catch (_) { window.__cinaLaunched = []; }
  }
  (window.__cinaLaunched || []).forEach(p => list.push(p));
  const NFT = window.NFT_PROJECTS || {};
  // Deterministic photo fallback when a film has no thumb mapped.
  const photoThumbs = ["darkroom-wide", "voss-enter", "darkroom-est", "fence"];
  const pickThumb = (f) => {
    if (f.thumb) return f.thumb;
    const seed = (f.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return photoThumbs[seed % photoThumbs.length];
  };
  const brOf = (f) => (window.pbMeta ? window.pbMeta(f.id) : null);
  (window.CATALOG || []).forEach((f) => {
    if (!f.nft) return;
    const existing = NFT[f.nft];
    if (existing) {
      list.push({
        ...existing,
        film: f,
        kind: f.kind, // film | series
        thumb: pickThumb(f),
        cover: f.cover,
        branched: !!brOf(f), branch: brOf(f),
      });
      return;
    }
    // Synthesize a project so producers can still buy in.
    // Deterministic from film id so re-renders are stable.
    const seed = (f.id.charCodeAt(0) || 60) + (f.id.length * 11);
    const totalCol = 600 + (seed % 9) * 80;
    const totalPat = 80 + (seed % 6) * 18;
    const totalProd = 12 + (seed % 5) * 3;
    const soldCol = Math.floor(totalCol * (0.18 + (seed % 60) / 100));
    const soldPat = Math.floor(totalPat * (0.12 + (seed % 50) / 100));
    const soldProd = Math.floor(totalProd * (0.08 + (seed % 40) / 100));
    const floorUSD = 90 + (seed % 18) * 11;
    const goal = (totalCol * floorUSD * 0.4) + (totalPat * floorUSD * 4) + (totalProd * floorUSD * 28);
    const raised = Math.floor(goal * (0.18 + (seed % 70) / 100));
    list.push({
      id: f.nft,
      filmId: f.id,
      film: f,
      kind: f.kind,
      thumb: pickThumb(f),
      cover: f.cover,
      title: (f.title || "Untitled").toUpperCase(),
      creator: f.creator,
      creatorId: f.creatorId,
      color: f.color || tkc("cat-3"),
      raised, goal,
      backers: Math.floor((soldCol + soldPat + soldProd) * 1.0),
      daysLeft: 6 + (seed % 22),
      summary: `Co-finance ${f.title} — holders earn from ad revenue & exhibition windows.`,
      floorUSD,
      revShare: 6 + (seed % 8),
      royaltyPaid: Math.floor(raised * 0.06),
      nextDistribution: "2026-07-01",
      chain: "Base",
      branched: !!brOf(f), branch: brOf(f),
      tiers: [
        { id: "collector", name: "Collector", count: totalCol, sold: soldCol, priceUSD: floorUSD,        perks: ["Premiere window", "Animated frame collectible"], color: tkc("ink-4") },
        { id: "patron",    name: "Patron",    count: totalPat, sold: soldPat, priceUSD: floorUSD * 4.1,  perks: ["BTS vault access", `${(0.04 + (seed % 7)/100).toFixed(2)}% rev share Y5`], color: tkc("cat-3") },
        { id: "producer",  name: "Producer",  count: totalProd, sold: soldProd, priceUSD: floorUSD * 28, perks: ["Production credit", `${(0.4 + (seed % 6)/10).toFixed(1)}% rev share Y5`, "Set visit"], color: "var(--c-amber)" },
      ],
      synthetic: true,
    });
  });
  return list;
}

// ─── Sorting / filtering helpers ───────────────────────────────────────
const SORTS = [
  { id: "trending", label: "Trending"   },
  { id: "ending",   label: "Ending soon" },
  { id: "raised",   label: "Most raised" },
  { id: "floor",    label: "Lowest floor" },
  { id: "new",      label: "Newest" },
];

function sortProjects(list, sort) {
  const arr = [...list];
  if (sort === "ending") arr.sort((a,b) => a.daysLeft - b.daysLeft);
  else if (sort === "raised") arr.sort((a,b) => b.raised - a.raised);
  else if (sort === "floor") arr.sort((a,b) => a.floorUSD - b.floorUSD);
  else if (sort === "new") arr.sort((a,b) => b.daysLeft - a.daysLeft);
  else arr.sort((a,b) => (b.backers || 0) - (a.backers || 0));
  return arr;
}

// ─── Top nav ──────────────────────────────────────────────────────────────
const fmtNavUSD = (n) => "$" + (n || 0).toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 });

function ProducersTopNav({ route, onRoute, query, onQuery }) {
  const tabs = [
    { id: "market",    label: "Market" },
    { id: "auctions",  label: "Auction floor" },
    { id: "index",     label: "Index" },
    { id: "watchlist", label: "Watchlist" },
    { id: "portfolio", label: "My stakes" },
    { id: "activity",  label: "Activity" },
  ];

  const user = window.USER || {};
  const walletUSD = user.walletUSD || 0;
  const addr = user.address || "0x…";
  const [bellOpen, setBellOpen] = prUseState(false);

  const unread = window.cinaUnreadCount ? window.cinaUnreadCount("producers") : 0;

  return (
    <UnifiedTopNav
      surface="producers"
      onWordmark={() => onRoute("market")}
      mobileNav={tabs.map(t => ({ label: t.label, active: route === t.id, onClick: () => onRoute(t.id) }))}
      mobileActions={
        <button onClick={() => window.openCreateProject && window.openCreateProject()} style={{
          width: "100%", height: 44, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none",
          borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>+ Launch project</button>
      }
      wallet={null}
      bell={null}
      accountBalance={{ label: "wallet", value: fmtNavUSD(walletUSD), sub: addr, onClick: () => { location.href = "index.html#/wallet"; } }}
      right={
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => window.openProducersCmdK && window.openProducersCmdK()}
            title="Command palette (⌘K)"
            style={{ display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 11px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-3)", cursor: "pointer", borderRadius: "var(--r-3)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-line-3)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; }}
          >
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".08em" }}>⌘K</span>
          </button>
          {route === "market" && <ProducerSearch query={query} onQuery={onQuery}/>}
        </div>
      }
      tabs={
        <nav style={{ display: "flex", alignItems: "stretch", height: "100%", padding: "0 4px" }}>
        {tabs.map(t => {
          const active = route === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onRoute(t.id)}
              style={{
                position: "relative",                height: "100%", padding: "0 14px",
                fontSize: "var(--fs-body)", fontWeight: active ? 600 : 450,
                color: active ? "var(--c-ink)" : "var(--c-ink-3)",
                background: "transparent", border: "none",
                cursor: "pointer", transition: "color .14s ease",
                fontFamily: "var(--f-sans)",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--c-ink)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--c-ink-3)"; }}
            >
              {t.label}
              {active && (
                <span style={{
                  position: "absolute", left: 12, right: 12, bottom: 14,
                  height: 2, background: "var(--c-amber)", borderRadius: "var(--r-1)",
                }}/>
              )}
            </button>
          );
        })}
        </nav>
      }
    />
  );
}

// Search-as-pill — collapses to icon, expands to input
function ProducerSearch({ query, onQuery }) {
  const [open, setOpen] = prUseState(Boolean(query));
  if (!open) {
    return (
      <button
        className="btn-ghost btn-icon"
        style={{ width: 36, height: 36 }}
        onClick={() => setOpen(true)}
        title="Search projects"
      ><Icon name="search" size={16}/></button>
    );
  }
  return (
    <div style={{ position: "relative", width: 240 }}>
      <Icon name="search" size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-3)" }}/>
      <input
        autoFocus
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        onBlur={() => { if (!query) setOpen(false); }}
        placeholder="Search projects"
        style={{
          width: "100%", height: 34, padding: "0 12px 0 32px",
          background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
          borderRadius: "var(--r-3)", color: "var(--c-ink)",
          fontSize: "var(--fs-body)", outline: "none",
          fontFamily: "var(--f-sans)",
        }}
      />
    </div>
  );
}

// ─── Market grid ───────────────────────────────────────────────────────
// First-load skeleton so the market has a real loading state, not a blank.
let _marketBooted = false;
function MarketSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginTop: 22 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
          <Skeleton w="100%" h={150} radius={0}/>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <Skeleton w="70%" h={18} radius={4}/>
            <Skeleton w="45%" h={11} radius={3}/>
            <Skeleton w="100%" h={5} radius={3} style={{ marginTop: 4 }}/>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <Skeleton w={64} h={10} radius={3}/>
              <Skeleton w={48} h={10} radius={3}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProducerMarket({ projects, query, onOpen }) {
  const [sort, setSort] = prUseState("trending");
  const [kindFilter, setKindFilter] = prUseState("all"); // all | series | film
  const [booting, setBooting] = prUseState(!_marketBooted);

  prUseEffect(() => {
    if (_marketBooted) return;
    const t = setTimeout(() => { _marketBooted = true; setBooting(false); }, 640);
    return () => clearTimeout(t);
  }, []);

  const filtered = prUseMemo(() => {
    let list = projects;
    if (kindFilter === "branched") list = list.filter(p => p.branched);
    else if (kindFilter !== "all") list = list.filter(p => p.kind === kindFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.creator || "").toLowerCase().includes(q) ||
        (p.film?.genre || []).some(g => g.toLowerCase().includes(q))
      );
    }
    return sortProjects(list, sort);
  }, [projects, query, sort, kindFilter]);

  // Featured = the project closest to its goal but not yet funded
  const featured = prUseMemo(() => {
    return [...projects]
      .filter(p => p.raised < p.goal)
      .sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal))[0];
  }, [projects]);

  if (booting) {
    return (
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" }}>
        <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>NFT MARKET · PRODUCERS</div>
          <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", lineHeight: 1.05, margin: 0, fontWeight: 400, letterSpacing: "-0.01em", textWrap: "balance" }}>
            Back films, series, and branched rooms. <span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>Earn with the audience.</span>
          </h1>
        </div>
        <Skeleton w="100%" h={200} radius={10} style={{ marginBottom: 22 }}/>
        <MarketSkeleton/>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" }}>
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>NFT MARKET · PRODUCERS</div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", lineHeight: 1.05, margin: 0, fontWeight: 400, letterSpacing: "-0.01em", textWrap: "balance" }}>
          Back films, series, and branched rooms. <span style={{ fontStyle: "italic", color: "var(--c-amber)" }}>Earn with the audience.</span>
        </h1>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: "10px 0 0", maxWidth: 720, lineHeight: 1.5 }}>
          Every film, series, and branched room on Cina opens a stake. Pick a project, choose a tier, vote on what gets greenlit, and collect a slice of every ad, ticket, and cut rental the work earns.
        </p>
      </div>

      {featured && <FeaturedHero project={featured} onOpen={onOpen} />}

      {/* Launch-your-own banner */}
      <button
        onClick={() => window.openCreateProject && window.openCreateProject()}
        style={{
          width: "100%", marginTop: 18, padding: "18px 24px",
          background: "linear-gradient(105deg, rgba(var(--accent-rgb),.10) 0%, rgba(var(--accent-rgb),.02) 60%, transparent 100%)",
          border: "1px solid rgba(var(--accent-rgb),.3)", borderRadius: "var(--r-2)",
          cursor: "pointer", textAlign: "left", color: "inherit",
          display: "flex", alignItems: "center", gap: 18,
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: "rgba(var(--accent-rgb),.14)", border: "1px solid rgba(var(--accent-rgb),.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--c-amber)", fontSize: "var(--fs-title)", fontFamily: "var(--f-display)", fontStyle: "italic",
        }}>+</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 4 }}>FOR CREATORS</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--c-ink)" }}>
            Raising for your own film? Launch a pool in five steps.
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 3 }}>
            Set your goal, design three tiers, deploy on-chain — backers buy in immediately.
          </div>
        </div>
        <span style={{
          flexShrink: 0, padding: "10px 18px",
          background: "var(--c-amber)", color: "var(--c-on-amber)", borderRadius: "var(--r-2)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>Launch project →</span>
      </button>

      {/* How Producers works · explainer strip */}
      <HowItWorks/>

      {/* Top movers · live ticker */}
      <TopMovers projects={projects} onOpen={onOpen}/>

      {/* Filter row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 14px", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { id: "all", label: "All projects" },
            { id: "series", label: "Series" },
            { id: "film", label: "Films" },
            { id: "branched", label: "Branched" },
          ].map((k) => {
            const active = kindFilter === k.id;
            return (
              <button key={k.id} onClick={() => setKindFilter(k.id)} style={{
                appearance: "none", padding: "6px 12px", borderRadius: 999,
                background: active ? "var(--c-amber)" : "transparent",
                color: active ? tkc("on-amber") : "var(--c-ink-2)",
                border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line)"}`,
                fontSize: "var(--fs-body)", fontWeight: active ? 600 : 500, cursor: "pointer", fontFamily: "var(--f-sans)",
              }}>{k.label}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>SORT</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
            appearance: "none", padding: "5px 28px 5px 10px", background: "var(--c-panel)", color: "var(--c-ink)",
            border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
            backgroundImage: "linear-gradient(45deg, transparent 50%, var(--c-ink-3) 50%), linear-gradient(135deg, var(--c-ink-3) 50%, transparent 50%)",
            backgroundPosition: "calc(100% - 14px) 50%, calc(100% - 9px) 50%",
            backgroundSize: "5px 5px, 5px 5px",
            backgroundRepeat: "no-repeat",
          }}>
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map((p) => <MarketCard key={p.id} project={p} onOpen={onOpen} />)}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="search"
          title={query.trim() ? `No projects match “${query.trim()}”` : "No projects match those filters"}
          body="Try a different sort or filter, or clear your search to see every open pool."
          cta={<button className="btn" style={{ height: 34 }} onClick={() => setKindFilter("all")}>Show all projects</button>}
        />
      )}
    </div>
  );
}

function FeaturedHero({ project, onOpen }) {
  const pctRaised = Math.min(1, project.raised / project.goal);
  const lowestTier = project.tiers[0];
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  return (
    <div style={{
      marginTop: 22, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: 0,
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden",
    }}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: project.color, overflow: "hidden" }}>
        <FrameThumb kind={project.thumb} usePhoto/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 50%)" }}/>
        <div style={{ position: "absolute", left: 18, bottom: 16, color: tkc("white") }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 6 }}>FEATURED · {project.branched ? "BRANCHED" : project.kind === "series" ? "SERIES" : "FILM"}</div>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", fontStyle: "italic", margin: 0, fontWeight: 400, letterSpacing: "-0.01em", color: tkc("white") }}>{project.film?.title || project.title}</h2>
          <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.7)", marginTop: 4, fontFamily: "var(--f-mono)", letterSpacing: ".16em" }}>{project.creator?.toUpperCase()}</div>
        </div>
      </div>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.5 }}>{project.summary}</p>

        <div style={{ display: "flex", gap: 18, paddingTop: 6 }}>
          <Stat label="RAISED" value={fmtUSDK(project.raised)} sub={`of ${fmtUSDK(project.goal)} goal`}/>
          <Stat label="BACKERS" value={(project.backers || 0).toLocaleString()} sub={`${project.daysLeft}d left`}/>
          <Stat label="FROM" value={`$${lowestTier.priceUSD}`} sub={lowestTier.name + " tier"} amber/>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ height: 5, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" }}>
            <div style={{ width: `${pctRaised*100}%`, height: "100%", background: "var(--c-amber)" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            <span>{(pctRaised*100).toFixed(0)}% FUNDED</span>
            <span>{project.daysLeft} DAYS LEFT</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onOpen(project.id)} style={{
            appearance: "none", padding: "10px 16px", background:  "var(--c-amber)",
            border: 0, borderRadius: "var(--r-2)", color: "var(--c-on-amber)", fontWeight: 700, fontSize: "var(--fs-body)", cursor: "pointer", letterSpacing: ".02em",
          }}>Buy producer NFT →</button>
          <button onClick={() => onOpen(project.id)} style={{
            appearance: "none", padding: "10px 14px", background: "transparent",
            border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", cursor: "pointer",
          }}>View project</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, amber }) {
  return <CinaStat size="sm" label={label} value={value} sub={sub} tone={amber ? "accent" : undefined}/>;
}

function MarketCard({ project, onOpen }) {
  const pctRaised = Math.min(1, project.raised / project.goal);
  const cheapest = project.tiers[0];
  const totalSupply = project.tiers.reduce((s, t) => s + t.count, 0);
  const totalSold = project.tiers.reduce((s, t) => s + t.sold, 0);

  const meta = project.branch || null;
  const topLeft = [
    <TileBadge key="k">{project.branched ? "BRANCHED" : project.kind === "series" ? "SERIES" : "FILM"}</TileBadge>,
    meta && <TileBadge key="live" kind="amber">● {meta.liveNow.toLocaleString()} IN ROOM</TileBadge>,
    !meta && project.daysLeft <= 7 && <TileBadge key="d" kind="amber">{project.daysLeft}D LEFT</TileBadge>,
  ];

  return (
    <FilmTile
      thumb={project.thumb}
      color={project.color}
      title={project.film?.title || project.title}
      subtitle={project.creator}
      topLeft={topLeft}
      topRight={window.HeartButton ? <HeartButton projectId={project.id} size={15}/> : null}
      onClick={() => onOpen(project.id)}
      footer={
        <div style={{ padding: "12px 2px 2px", display: "flex", flexDirection: "column", gap: 13 }}>
          {meta && window.BranchedStatStrip ? <window.BranchedStatStrip meta={meta}/> : null}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>FROM</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", fontWeight: 500, color: "var(--c-amber)", lineHeight: 1, marginTop: 4 }}>${cheapest.priceUSD}</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 }}>{cheapest.name} tier</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>REV SHARE</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)", lineHeight: 1, marginTop: 4 }}>{project.revShare}%</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 }}>{meta ? `+ ${meta.cutRevShare}% cut rentals` : "through Y5"}</div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: pctRaised >= 0.8 ? "var(--c-amber)" : "var(--c-ink-2)", letterSpacing: ".08em", fontWeight: 600 }}>
                {(pctRaised*100).toFixed(0)}% funded
              </span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
                {fmtUSDK(project.raised)} <span style={{ color: "var(--c-ink-4)" }}>/ {fmtUSDK(project.goal)}</span>
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" }}>
              <div style={{ width: `${pctRaised*100}%`, height: "100%", background: "var(--c-amber)" }}/>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
              <span>{totalSold.toLocaleString()} backers</span>
              <span>{Math.max(0, totalSupply - totalSold).toLocaleString()} passes left</span>
            </div>
          </div>
        </div>
      }
    />
  );
}

function fmtUSDK(n) {
  if (!n) return "$0";
  if (n >= 1_000_000) return "$" + (n/1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return "$" + Math.round(n/1_000) + "k";
  return "$" + n;
}

// ─── Project detail (buy + tiers + holder hub if real) ─────────────────
function ProducerDetail({ project, onBack }) {
  return (
    <>
      <UnifiedNFTPage
        project={project}
        film={project?.film}
        onBack={onBack}
        showHolderHub={true}
      />
      {typeof window.BranchedProjectPanel === "function" && <window.BranchedProjectPanel project={project}/>}
    </>
  );
}

// ─── Branched rights holdings ──────────────────────────────────────────
// Branched stakes pay twice: the film's rev share, and rentals of the cuts
// on the paths you hold. This table reads that second stream separately.
function BranchedRightsTable({ rows, onOpen }) {
  if (!rows.length) return null;
  return (
    <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 90px 96px 104px 108px",
        gap: 12, padding: "10px 14px", background: "var(--c-panel-2)",
        borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)",
        fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)",
      }}>
        <div>FILM · RIGHT</div><div>FORKS</div><div>CUTS RENTED</div><div>RENTAL YIELD</div><div>YOUR SHARE</div>
      </div>
      {rows.map(r => {
        const m = r.project.branch || (window.pbMeta ? window.pbMeta(r.project.film?.id) : null);
        if (!m) return null;
        const weekly = (m.cutsRentedWk || 0) * (m.rentPriceUSD || 0);
        const yours = weekly * (m.cutRevShare / 100) * 0.04;
        return (
          <button key={r.project.id} onClick={() => onOpen && onOpen(r.project.id)} style={{
            width: "100%", appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit",
            display: "grid", gridTemplateColumns: "minmax(0,1.5fr) 90px 96px 104px 108px", gap: 12,
            padding: "13px 14px", background: "transparent", border: 0, borderBottom: "1px solid var(--c-line)",
            alignItems: "center",
          }}>
            <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
              {window.PbBranchGlyph ? <window.PbBranchGlyph size={13} color={tkc("bad")} dim="rgba(201,85,72,.45)"/> : null}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.project.film?.title || r.project.title}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3 }}>{(r.tier?.name || "ROOM SEAT").toUpperCase()}</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{m.forks}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{(m.cutsRentedWk || 0).toLocaleString()}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>${weekly.toLocaleString()}<span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>/WK</span></div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>${yours.toFixed(2)}<span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>/WK</span></div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Watchlist (the user's "saved" projects) ───────────────────────────
function WatchlistPage({ projects, onOpen }) {
  const session = window.useProducerSession ? window.useProducerSession() : { s: { watchlist: [] } };
  const watched = session.s.watchlist || [];
  const list = projects.filter(p => watched.includes(p.id));
  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" }}>
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>WATCHLIST</div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Projects you're tracking
        </h1>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon="folder"
          title="Nothing on your watchlist yet"
          body="Open any project in the market and bookmark it — tracked pools land here so you can watch them raise."
          cta={<button className="btn btn-primary" style={{ height: 36 }} onClick={() => { location.hash = "market"; }}>Browse the market</button>}
        />
      ) : (
        <>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>
            {list.length} PROJECT{list.length === 1 ? "" : "S"} TRACKED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {list.map(p => <MarketCard key={p.id} project={p} onOpen={onOpen}/>)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Portfolio (the user's actual holdings) ────────────────────────────
function PortfolioPage({ projects, onOpen }) {
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const holdings = session?.s?.holdings || window.USER?.holdings || [];
  const claims   = session?.s?.claims || [];
  const listings = session?.s?.listings || [];
  const bids     = session?.s?.bids || [];
  const [tab, setTab] = prUseState("holdings");

  // Projects you launched yourself: you hold the founder allocation.
  const launched = projects.filter(p => p.userLaunched);
  const synth = launched.map(p => ({
    projectId: p.id, tierId: (p.tiers[p.tiers.length - 1] || {}).id, qty: 1,
    costUSD: 0, founder: true, at: p.launchedAt,
  }));
  const allHoldings = [...synth.filter(sh => !holdings.some(h => h.projectId === sh.projectId)), ...holdings];

  const rows = allHoldings.map(h => {
    const proj = projects.find(p => p.id === h.projectId);
    if (!proj) return null;
    const tier = proj.tiers.find(t => t.id === h.tier) || proj.tiers[0];
    const cost = (h.costBasis || tier.priceUSD * 0.85) * h.qty;
    const value = tier.priceUSD * h.qty;
    return { h, holding: h, proj, project: proj, tier, cost, value };
  }).filter(Boolean);

  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const claimable = claims.filter(c => c.status === "claimable");
  const claimableTotal = claimable.reduce((s, c) => s + c.amount, 0);
  const royalties = claims.filter(c => c.status === "claimed").reduce((s, c) => s + c.amount, 0)
                  + rows.reduce((s, r) => s + (r.proj.royaltyPaid || 0) * 0.001 * r.h.qty, 0);

  // Branched holdings pay a second stream: rentals of the cuts on their paths.
  const cutIncome = rows.reduce((s, r) => {
    const m = r.proj.branch || (window.pbMeta ? window.pbMeta(r.proj.film?.id) : null);
    if (!m) return s;
    return s + (m.cutsRentedWk || 0) * (m.rentPriceUSD || 0) * (m.cutRevShare / 100) * 0.04 * 4.3;
  }, 0);

  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" }}>
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>MY STAKES</div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>
          Your producer holdings
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : `repeat(${cutIncome > 0 ? 5 : 4}, 1fr)`, gap: 12, marginBottom: 22 }}>
        <KPI label="MARKET VALUE" value={fmtUSDK(totalValue)} sub="across all stakes"/>
        <KPI label="COST BASIS" value={fmtUSDK(totalCost)} sub="invested"/>
        <KPI label="UNREALIZED P/L" value={`${pnl >= 0 ? "+" : "−"}${fmtUSDK(Math.abs(pnl))}`} sub={`${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`} amber={pnl >= 0}/>
        <KPI label="ROYALTIES PAID" value={fmtUSDK(royalties)} sub="lifetime distributions"/>
        {cutIncome > 0 && <KPI label="CUT RENTALS" value={fmtUSDK(cutIncome)} sub="branched paths · /mo" amber/>}
      </div>

      {/* Performance chart + claim CTA */}
      {rows.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap: 14, marginBottom: 22 }}>
          <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>PORTFOLIO VALUE · 60D</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4, fontStyle: "italic" }}>
                  {fmtUSDK(totalValue)}
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: pnl >= 0 ? "var(--c-amber)" : tkc("bad"), marginLeft: 8 }}>
                    {pnl >= 0 ? "▲" : "▼"} {pnlPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            {window.PortfolioSpark && <PortfolioSpark height={150}/>}
          </div>
          <div style={{
            background: claimable.length > 0 ? "linear-gradient(180deg, rgba(var(--accent-rgb),.08) 0%, var(--c-panel) 100%)" : "var(--c-panel)",
            border: `1px solid ${claimable.length > 0 ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}`,
            borderRadius: "var(--r-3)", padding: 18, display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>READY TO CLAIM</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", fontStyle: "italic", color: "var(--c-amber)", lineHeight: 1 }}>
              {fmtUSDK(claimableTotal)}
            </div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", flex: 1 }}>
              {claimable.length > 0
                ? `${claimable.length} distribution${claimable.length > 1 ? "s" : ""} across ${new Set(claimable.map(c => c.projectId)).size} project${new Set(claimable.map(c => c.projectId)).size > 1 ? "s" : ""} — settle in one tx.`
                : "You're up to date. Next quarter's distribution arrives Apr 1."}
            </div>
            {claimable.length > 0 && (
              <button onClick={() => session.claimAll()} style={{
                appearance: "none", padding: "10px 14px", background:  "var(--c-amber)",
                border: 0, borderRadius: "var(--r-2)", color: "var(--c-on-amber)", fontWeight: 600, fontSize: "var(--fs-body)", cursor: "pointer",
              }}>Claim all {fmtUSDK(claimableTotal)} →</button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      {rows.length > 0 && (
        <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--c-line)", marginBottom: 16 }}>
          {[
            { id: "holdings", label: "Holdings", count: rows.length },
            ...(rows.some(r => r.project.branched) ? [{ id: "branched", label: "Branched rights", count: rows.filter(r => r.project.branched).length }] : []),
            { id: "distributions", label: "Distributions", count: claims.length },
            { id: "listings", label: "My listings", count: listings.filter(l => l.status === "open").length },
            { id: "bids", label: "My bids", count: bids.filter(b => b.status === "open").length },
          ].map(p => {
            const active = tab === p.id;
            return (
              <button key={p.id} onClick={() => setTab(p.id)} style={{
                appearance: "none", padding: "10px 14px", background: "transparent",
                border: 0, borderRadius: 0, borderBottom: `2px solid ${active ? "var(--c-amber)" : "transparent"}`,
                color: active ? "var(--c-ink)" : "var(--c-ink-3)",
                fontSize: "var(--fs-body)", fontWeight: active ? 600 : 450, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {p.label}
                {p.count > 0 && <span style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", padding: "1px 6px",
                  background: active ? "var(--c-amber)" : "var(--c-line)",
                  color: active ? tkc("on-amber") : "var(--c-ink-3)",
                  borderRadius: "var(--r-2)",
                }}>{p.count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="No stakes yet"
          body="Back a film in the market and your producer holdings, distributions and P/L all show up here."
          cta={<button className="btn btn-primary" style={{ height: 36 }} onClick={() => { location.hash = "market"; }}>Find a film to back</button>}
        />
      ) : tab === "branched" ? (
        <BranchedRightsTable rows={rows.filter(r => r.project.branched)} onOpen={onOpen}/>
      ) : tab === "distributions" ? (
        <DistributionSchedule
          claims={claims} projects={projects}
          onClaim={(c, proj) => window.openClaimModal && window.openClaimModal(c, proj)}
        />
      ) : tab === "listings" ? (
        <ListingsTable listings={listings} projects={projects} onCancel={(id) => session.cancelListing(id)}/>
      ) : tab === "bids" ? (
        <BidsTable bids={bids} projects={projects} onCancel={(id) => session.cancelBid(id)}/>
      ) : (
        <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 0.8fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            <div>PROJECT</div><div>TIER</div><div>QTY</div><div>COST</div><div>VALUE</div><div style={{ textAlign: "right" }}>P/L</div>
          </div>
          {rows.map((r, i) => {
            const rowPnl = r.value - r.cost;
            return (
              <button key={i} onClick={() => onOpen(r.proj.id)} style={{
                display: "grid", gridTemplateColumns: "1.6fr 1fr 0.8fr 1fr 1fr 1fr", padding: "12px 16px",
                borderBottom: i < rows.length - 1 ? "1px solid var(--c-line)" : 0,
                fontSize: "var(--fs-body)", alignItems: "center", textAlign: "left",
                background: "transparent", border: "none", borderRadius: 0, color: "inherit", cursor: "pointer",
                width: "100%", appearance: "none", borderTopWidth: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 24, borderRadius: "var(--r-1)", overflow: "hidden", background: r.proj.color }}>
                    <FrameThumb kind={r.proj.thumb} usePhoto/>
                  </div>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic" }}>{r.proj.film?.title || r.proj.title}</span>
                </div>
                <div style={{ color: r.tier.color, fontWeight: 500 }}>{r.tier.name}</div>
                <div className="t-num" style={{ fontFamily: "var(--f-mono)" }}>×{r.h.qty}</div>
                <div className="t-num" style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-2)" }}>{fmtUSDK(r.cost)}</div>
                <div className="t-num" style={{ fontFamily: "var(--f-mono)" }}>{fmtUSDK(r.value)}</div>
                <div className="t-num" style={{ fontFamily: "var(--f-mono)", textAlign: "right", color: rowPnl >= 0 ? "var(--c-amber)" : tkc("bad"), display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                  <span>{rowPnl >= 0 ? "+" : "−"}{fmtUSDK(Math.abs(rowPnl))}</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); window.openListModal && window.openListModal(r.proj, r.h); }}
                    style={{
                      appearance: "none", border: "1px solid var(--c-line)",
                      background: "var(--c-panel-2)", color: "var(--c-ink-2)",
                      padding: "4px 8px", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)",
                      fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer",
                    }}
                  >LIST</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Documents: KYC / verification + tax statements ────────────────────
const PRO_KYC_KEY = "cina:producers:kyc";
function prKycLoad() { try { return JSON.parse(localStorage.getItem(PRO_KYC_KEY)) || {}; } catch (e) { return {}; } }
function prKycSave(v) { try { localStorage.setItem(PRO_KYC_KEY, JSON.stringify(v)); } catch (e) {} }

function downloadFile(name, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ProducerDocsPage({ projects }) {
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const claims = session?.s?.claims || [];
  const holdings = session?.s?.holdings || [];
  const cina = window.useCinaId ? window.useCinaId() : null;

  const [kyc, setKyc] = prUseState(prKycLoad());
  const [wizard, setWizard] = prUseState(null); // null | step index
  const [form, setForm] = prUseState({ legalName: "", country: "United States", idType: "Passport", idNumber: "", tin: "" });

  const verified = kyc.status === "verified";
  const pending = kyc.status === "pending";

  // Build per-year distribution totals from claimed distributions.
  const byYear = {};
  claims.filter(c => c.status === "claimed").forEach(c => {
    const yr = (c.date && c.date.slice(0, 4)) || "2025";
    byYear[yr] = (byYear[yr] || 0) + (c.amount || 0);
  });
  if (Object.keys(byYear).length === 0) { byYear["2025"] = 0; }
  const years = Object.keys(byYear).sort().reverse();

  const submitKyc = () => {
    const next = { status: "pending", legalName: form.legalName, country: form.country, submittedAt: Date.now() };
    setKyc(next); prKycSave(next); setWizard(null);
    window.toast && window.toast({ title: "SUBMITTED", text: "Verification usually clears within minutes.", kind: "info" });
    // Simulate async approval.
    setTimeout(() => {
      const done = { ...next, status: "verified", verifiedAt: Date.now() };
      setKyc(done); prKycSave(done);
      window.toast && window.toast({ title: "VERIFIED", text: "You're cleared to receive distributions.", kind: "good" });
    }, 3200);
  };

  const export1099 = (yr) => {
    const gross = byYear[yr] || 0;
    const lines = [
      "FORM 1099-MISC (informational copy) — Cina Producers",
      "Tax year: " + yr,
      "Recipient: " + (kyc.legalName || cina?.handle || "Producer"),
      "TIN on file: " + (kyc.status === "verified" ? "•••-••-" + String(Math.abs((kyc.legalName || "x").length * 137 % 10000)).padStart(4, "0") : "NOT VERIFIED"),
      "Box 2 — Royalties: " + fmtNavUSD(gross),
      "Box 3 — Other income: $0.00",
      "",
      "Payer: Cina Studio, Inc. · payer EIN 88-•••••••",
      "This is a platform-generated informational copy, not a filed tax document.",
    ];
    downloadFile("cina-1099-" + yr + ".txt", lines.join("\n"), "text/plain");
    window.toast && window.toast({ title: "1099 EXPORTED", text: yr + " statement downloaded.", kind: "good" });
  };

  const exportAnnualCSV = (yr) => {
    const rows = [["date", "project", "type", "amount_usd"]];
    claims.filter(c => c.status === "claimed" && ((c.date && c.date.slice(0, 4)) || "2025") === yr).forEach(c => {
      const proj = projects.find(p => p.id === c.projectId);
      rows.push([c.date || yr + "-01-01", (proj?.film?.title || proj?.title || c.projectId), "royalty distribution", (c.amount || 0).toFixed(2)]);
    });
    if (rows.length === 1) rows.push([yr + "-01-01", "—", "no distributions", "0.00"]);
    downloadFile("cina-statement-" + yr + ".csv", rows.map(r => r.join(",")).join("\n"), "text/csv");
    window.toast && window.toast({ title: "STATEMENT EXPORTED", text: yr + " activity (CSV) downloaded.", kind: "good" });
  };

  const field = { width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none" };
  const lbl = { fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 6, display: "block" };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 32px 96px" }}>
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>ACCOUNT · DOCUMENTS</div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>Verification &amp; tax documents</h1>
      </div>

      {/* KYC status */}
      <div style={{
        background: verified ? "linear-gradient(180deg, rgba(106,163,122,.08), var(--c-panel))" : pending ? "linear-gradient(180deg, rgba(var(--accent-rgb),.07), var(--c-panel))" : "var(--c-panel)",
        border: `1px solid ${verified ? "rgba(106,163,122,.4)" : pending ? "rgba(var(--accent-rgb),.35)" : "var(--c-line-2)"}`,
        borderRadius: "var(--r-3)", padding: 20, marginBottom: 18, display: "flex", gap: 18, alignItems: "flex-start",
      }}>
        <div style={{ width: 40, height: 40, borderRadius: "var(--r-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: verified ? "rgba(106,163,122,.18)" : pending ? "rgba(var(--accent-rgb),.16)" : "var(--c-panel-2)", border: "1px solid var(--c-line-2)" }}>
          <Icon name={verified ? "check" : "shield"} size={18}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>Identity verification</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "3px 8px", borderRadius: "var(--r-1)", background: verified ? "rgba(106,163,122,.2)" : pending ? "rgba(var(--accent-rgb),.18)" : "var(--c-line)", color: verified ? "var(--c-good)" : pending ? "var(--c-amber)" : "var(--c-ink-3)" }}>
              {verified ? "VERIFIED" : pending ? "PENDING" : "REQUIRED"}
            </span>
          </div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: "8px 0 0", maxWidth: 560 }}>
            {verified
              ? `Cleared as ${kyc.legalName}. You can receive distributions and your tax statements carry a TIN on file.`
              : pending
                ? "Your details are in review — distributions are paused until this clears. This usually takes a few minutes."
                : "Producers must verify identity before receiving royalty distributions. KYC also unlocks your 1099 statements below."}
          </p>
          {!verified && !pending && (
            <button onClick={() => setWizard(0)} className="btn btn-primary" style={{ height: 38, padding: "0 18px", marginTop: 14 }}>Start verification →</button>
          )}
        </div>
      </div>

      {/* Branched rights term sheet — only if the user holds any */}
      {(() => {
        const held = (projects || []).filter(pr => pr.branched && holdings.some(h => h.projectId === pr.id));
        if (!held.length) return null;
        return (
          <>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", margin: "26px 0 12px" }}>BRANCHED RIGHTS · TERM SHEETS</div>
            <div style={{ background: "var(--c-panel)", border: "1px solid rgba(201,85,72,.3)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
              {held.map((pr, i) => {
                const m = pr.branch || (window.pbMeta ? window.pbMeta(pr.film?.id) : null);
                if (!m) return null;
                return (
                  <div key={pr.id} style={{ padding: "16px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12, flexWrap: "wrap" }}>
                      {window.PbBranchGlyph ? <window.PbBranchGlyph size={14} color={tkc("bad")} dim="rgba(201,85,72,.45)"/> : null}
                      <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{pr.film?.title || pr.title}</span>
                      <span style={{ flex: 1 }}/>
                      <button className="btn" style={{ height: 30, padding: "0 12px", fontSize: "var(--fs-body)" }} onClick={() => {
                        const lines = [
                          "BRANCHED RIGHTS TERM SHEET — Cina Producers",
                          "",
                          "Work: " + (pr.film?.title || pr.title),
                          "Director: " + (pr.creator || "—"),
                          "Chain: " + (pr.chain || "Base"),
                          "",
                          "STRUCTURE",
                          "Forks: " + m.forks,
                          "Options per fork: " + (m.optionsPerFork || 3),
                          "Distinct cuts: " + m.totalCuts,
                          "Vote window: " + m.voteWindowSec + " seconds per fork",
                          "Canonical path: " + (m.canonical || "set by the room"),
                          "",
                          "ECONOMICS",
                          "Rental price per cut: $" + m.rentPriceUSD,
                          "Cuts rented (trailing week): " + (m.cutsRentedWk || 0),
                          "Holder share of rental revenue: " + m.cutRevShare + "%",
                          "Film revenue share: " + (pr.revShare || 0) + "% through Y5",
                          "Distribution: monthly, on-chain, to the holder of record",
                          "",
                          "ALLOCATION OF RENTAL REVENUE",
                          "Rentals are attributed to the branch the viewer walked. A holder of",
                          "Fork Rights earns on their path only; the Canonical Cut holder earns",
                          "on the path the room voted in. Room Seats carry vote weight, not",
                          "rental revenue.",
                          "",
                          "This is an informational summary, not the executed agreement.",
                        ];
                        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a2 = document.createElement("a");
                        a2.href = url; a2.download = "cina-branched-terms-" + pr.id + ".txt";
                        a2.click(); URL.revokeObjectURL(url);
                        window.toast && window.toast({ title: "DOWNLOADED", text: "Term sheet · " + (pr.film?.title || pr.title), kind: "good" });
                      }}>Download</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14 }}>
                      {[
                        ["FORKS", m.forks],
                        ["CUTS", m.totalCuts.toLocaleString()],
                        ["RENTAL", "$" + m.rentPriceUSD],
                        ["HOLDER SHARE", m.cutRevShare + "%"],
                        ["FILM REV SHARE", (pr.revShare || 0) + "%"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 }}>{k}</div>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: k === "HOLDER SHARE" ? "var(--c-amber)" : "var(--c-ink)" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* Tax statements */}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", margin: "26px 0 12px" }}>TAX STATEMENTS</div>
      <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.4fr", padding: "10px 18px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
          <div>TAX YEAR</div><div>ROYALTIES</div><div style={{ textAlign: "right" }}>DOCUMENTS</div>
        </div>
        {years.map((yr, i) => (
          <div key={yr} style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.4fr", padding: "14px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{yr}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{fmtNavUSD(byYear[yr])}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button onClick={() => verified ? export1099(yr) : setWizard(0)} title={verified ? "" : "Verify your identity first"} style={{
                appearance: "none", padding: "7px 12px", borderRadius: "var(--r-2)", cursor: "pointer",
                background: verified ? "var(--c-amber)" : "var(--c-panel-2)", color: verified ? tkc("on-amber") : "var(--c-ink-4)",
                border: verified ? "none" : "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
              }}>{verified ? "1099-MISC ↓" : "1099 · LOCKED"}</button>
              <button onClick={() => exportAnnualCSV(yr)} style={{
                appearance: "none", padding: "7px 12px", borderRadius: "var(--r-2)", cursor: "pointer",
                background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              }}>STATEMENT (CSV) ↓</button>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", lineHeight: 1.6, marginTop: 12 }}>
        Statements are platform-generated informational copies covering royalty distributions paid to your wallet. They are not filed tax documents — consult a tax professional. A 1099-MISC is issued when annual distributions exceed $600.
      </p>

      {/* KYC wizard modal */}
      {wizard !== null && (
        <div onClick={() => setWizard(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", padding: 24, boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>Verify your identity</div>
              <button onClick={() => setWizard(null)} className="btn-ghost btn-icon" style={{ width: 28, height: 28 }}><Icon name="x" size={12}/></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={lbl}>LEGAL NAME</label><input value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} placeholder="As on your government ID" style={field}/></div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><label style={lbl}>COUNTRY</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={field}>
                    {["United States", "Canada", "United Kingdom", "Germany", "Japan", "Nigeria", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={lbl}>ID TYPE</label>
                  <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })} style={field}>
                    {["Passport", "Driver's license", "National ID"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={lbl}>ID NUMBER</label><input value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} placeholder="••••••••" style={field}/></div>
              <div><label style={lbl}>TAX ID (TIN / SSN)</label><input value={form.tin} onChange={e => setForm({ ...form, tin: e.target.value })} placeholder="For 1099 reporting" style={field}/></div>
              <button onClick={submitKyc} disabled={!form.legalName || !form.idNumber} style={{
                height: 44, borderRadius: "var(--r-2)", marginTop: 4, border: "none",
                background: (form.legalName && form.idNumber) ? "var(--c-amber)" : "var(--c-line)",
                color: (form.legalName && form.idNumber) ? tkc("on-amber") : "var(--c-ink-4)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                cursor: (form.legalName && form.idNumber) ? "pointer" : "not-allowed",
              }}>SUBMIT FOR REVIEW</button>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", textAlign: "center", letterSpacing: ".16em" }}>ENCRYPTED · DEMO MODE · NO REAL DATA STORED</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Listings + bids tables (sub-tabs of portfolio) ────────────────────
function ListingsTable({ listings, projects, onCancel }) {
  const items = listings.filter(l => l.status === "open");
  if (items.length === 0) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-3)" }}>
      No active listings. List a holding to put it on the secondary market.
    </div>
  );
  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
        <div>PROJECT</div><div>TIER</div><div>QTY</div><div>ASK</div><div>LISTED</div><div style={{ textAlign: "right" }}>ACTION</div>
      </div>
      {items.map((l, i) => {
        const proj = projects.find(p => p.id === l.projectId);
        return (
          <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 16px", fontSize: "var(--fs-body)", alignItems: "center", borderBottom: i < items.length - 1 ? "1px solid var(--c-line)" : 0 }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic" }}>{proj?.film?.title || l.projectTitle}</div>
            <div style={{ color: "var(--c-ink-2)" }}>{l.tier}</div>
            <div style={{ fontFamily: "var(--f-mono)" }}>×{l.qty}</div>
            <div style={{ fontFamily: "var(--f-mono)", color: "var(--c-amber)" }}>${l.priceUSD.toLocaleString()}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{psRelTime ? psRelTime(l.t) : "recently"}</div>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => onCancel(l.id)} style={{ appearance: "none", border: "1px solid var(--c-line)", background: "transparent", color: "var(--c-ink-2)", padding: "5px 10px", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer" }}>CANCEL</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BidsTable({ bids, projects, onCancel }) {
  const items = bids.filter(b => b.status === "open");
  if (items.length === 0) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--c-ink-3)", border: "1px dashed var(--c-line)", borderRadius: "var(--r-3)" }}>
      No active bids. Place one from any project page.
    </div>
  );
  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
        <div>PROJECT</div><div>TIER</div><div>QTY</div><div>BID</div><div>EXPIRES</div><div style={{ textAlign: "right" }}>ACTION</div>
      </div>
      {items.map((b, i) => (
        <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 16px", fontSize: "var(--fs-body)", alignItems: "center", borderBottom: i < items.length - 1 ? "1px solid var(--c-line)" : 0 }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic" }}>{b.projectTitle}</div>
          <div style={{ color: "var(--c-ink-2)" }}>{b.tier}</div>
          <div style={{ fontFamily: "var(--f-mono)" }}>×{b.qty}</div>
          <div style={{ fontFamily: "var(--f-mono)", color: "var(--c-amber)" }}>${b.priceUSD.toLocaleString()}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{b.expiry}</div>
          <div style={{ textAlign: "right" }}>
            <button onClick={() => onCancel(b.id)} style={{ appearance: "none", border: "1px solid var(--c-line)", background: "transparent", color: "var(--c-ink-2)", padding: "5px 10px", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer" }}>CANCEL</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function KPI({ label, value, sub, amber }) {
  return <CinaStat label={label} value={value} sub={sub} tone={amber ? "accent" : undefined}/>;
}

// ─── Activity feed ─────────────────────────────────────────────────────
function ActivityPage({ projects }) {
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const [scope, setScope] = prUseState("market"); // market | mine
  const [kind, setKind] = prUseState("all"); // all | mint | sale | claim | bid | vote

  const marketEvents = prUseMemo(() => {
    // A believable live tape: varied event kinds, every tier (not just Collector),
    // a deep wallet pool, prices that reflect the tier with small jitter, and
    // timestamps that spread from seconds-ago to days-ago (non-uniform).
    const WALLETS = [
      "0xC1…a2", "0x4f…b8", "0x91…7d", "0xab…3c", "0xee…14", "0x8a…fe",
      "loop.eth", "noir.eth", "agora.eth", "still.eth", "0x2d…91", "0x77…0e",
      "frame.eth", "0xBE…ff", "reel.eth", "0x3c…44", "vault.eth", "0x09…1b",
    ];
    // weighted kinds — mints lead, then resales, bids, listings, the odd claim
    const KIND_BAG = ["mint","mint","mint","mint","sale","sale","sale","bid","bid","list","claim"];
    const out = [];
    let clock = Date.now() - 40000; // newest event ~40s ago
    projects.forEach((p) => {
      const seed = (p.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const rnd = (n) => {
        // deterministic per (project, n)
        const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
        return x - Math.floor(x);
      };
      const n = 3 + Math.floor(rnd(1) * 4); // 3–6 events per project
      for (let i = 0; i < n; i++) {
        const tier = p.tiers[Math.floor(rnd(i * 7 + 2) * p.tiers.length)] || p.tiers[0];
        const kind = KIND_BAG[Math.floor(rnd(i * 5 + 3) * KIND_BAG.length)];
        // advance the shared clock by an irregular gap so the tape feels live
        const gapMin = Math.round(1 + rnd(i * 11 + 4) * 220 * (1 + i * 0.6));
        clock -= gapMin * 60000;
        const jitter = 0.9 + rnd(i * 3 + 9) * 0.35;
        out.push({
          t: clock,
          project: p, tier,
          actor: WALLETS[Math.floor(rnd(i * 13 + 6) * WALLETS.length)],
          kind,
          priceUSD: Math.round((tier.priceUSD || 100) * jitter),
        });
      }
    });
    return out.sort((a, b) => b.t - a.t).slice(0, 60);
  }, [projects]);

  const myEvents = prUseMemo(() => {
    if (!session) return [];
    const out = [];
    (session.s.holdings || []).forEach(h => {
      const proj = projects.find(p => p.id === h.projectId);
      if (!proj) return;
      const tier = proj.tiers.find(t => t.id === h.tier) || proj.tiers[0];
      out.push({ t: Date.now() - 86400000 * 14 * (out.length + 1), project: proj, tier, kind: "mint", actor: "you", priceUSD: (h.costBasis || tier.priceUSD * 0.85) * h.qty });
    });
    (session.s.claims || []).filter(c => c.status === "claimed").forEach(c => {
      const proj = projects.find(p => p.id === c.projectId);
      if (!proj) return;
      out.push({ t: c.claimedAt || c.availableAt, project: proj, tier: proj.tiers[0], kind: "claim", actor: "you", priceUSD: c.amount });
    });
    (session.s.listings || []).forEach(l => {
      const proj = projects.find(p => p.id === l.projectId);
      if (!proj) return;
      out.push({ t: l.t, project: proj, tier: proj.tiers.find(x => x.id === l.tier) || proj.tiers[0], kind: "list", actor: "you", priceUSD: l.priceUSD });
    });
    (session.s.bids || []).forEach(b => {
      const proj = projects.find(p => p.id === b.projectId);
      if (!proj) return;
      out.push({ t: b.t, project: proj, tier: proj.tiers.find(x => x.id === b.tier) || proj.tiers[0], kind: "bid", actor: "you", priceUSD: b.priceUSD });
    });
    return out.sort((a, b) => b.t - a.t);
  }, [session?.s, projects]);

  // A launch is the first event on its own tape.
  const launchEvents = prUseMemo(() => projects.filter(x => x.userLaunched).map(x => ({
    t: x.launchedAt || Date.now(), project: x, tier: x.tiers[0] || {},
    actor: "you", kind: "mint", priceUSD: 0, launch: true,
  })), [projects]);

  const events = prUseMemo(() => {
    const list = scope === "mine" ? [...launchEvents, ...myEvents] : [...launchEvents, ...marketEvents];
    return kind === "all" ? list : list.filter(e => e.kind === kind);
  }, [scope, kind, marketEvents, myEvents, launchEvents]);

  const KIND_LABELS = {
    mint:  { label: "MINT",   color: tkc("good") },
    sale:  { label: "SALE",   color: "var(--c-amber)" },
    claim: { label: "CLAIM",  color: tkc("cat-2") },
    bid:   { label: "BID",    color: tkc("cat-1") },
    list:  { label: "LIST",   color: tkc("bad") },
    vote:  { label: "VOTE",   color: tkc("good") },
  };

  return (
    <div style={{ maxWidth: "var(--w-mid)", margin: "0 auto", padding: "28px 32px 96px" }}>
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>ACTIVITY</div>
        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>
          {scope === "mine" ? "Your activity" : "Across the market"}
        </h1>
      </div>

      {/* Scope + kind filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: 999 }}>
          {[{ id: "market", label: "Market" }, { id: "mine", label: "My activity" }].map(s => (
            <button key={s.id} onClick={() => setScope(s.id)} style={{
              appearance: "none", padding: "6px 14px", borderRadius: 999,
              background: scope === s.id ? "var(--c-amber)" : "transparent",
              color: scope === s.id ? tkc("on-amber") : "var(--c-ink-2)", border: 0,
              fontSize: "var(--fs-body)", fontWeight: scope === s.id ? 600 : 450, cursor: "pointer",
            }}>{s.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all","mint","sale","claim","bid","list"].map(k => (
            <button key={k} onClick={() => setKind(k)} style={{
              appearance: "none", padding: "5px 10px", borderRadius: 999,
              background: kind === k ? "var(--c-amber)" : "transparent",
              color: kind === k ? tkc("on-amber") : "var(--c-ink-3)",
              border: `1px solid ${kind === k ? "var(--c-amber)" : "var(--c-line)"}`,
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer",
              textTransform: "uppercase",
            }}>{k}</button>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1.6fr 1fr 1fr 1fr 1fr", padding: "10px 16px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
          <div>EVENT</div><div>PROJECT</div><div>TIER</div><div>PRICE</div><div>ACTOR</div><div style={{ textAlign: "right" }}>TIME</div>
        </div>
        {events.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-body)" }}>
            No {kind === "all" ? "" : kind + " "}events {scope === "mine" ? "in your activity" : "in the market"} yet.
          </div>
        )}
        {events.map((e, i) => {
          const k = KIND_LABELS[e.kind] || KIND_LABELS.mint;
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "100px 1.6fr 1fr 1fr 1fr 1fr",
              padding: "11px 16px", borderBottom: i < events.length - 1 ? "1px solid var(--c-line)" : 0,
              fontSize: "var(--fs-body)", alignItems: "center",
            }}>
              <div>
                <span style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  padding: "3px 7px", borderRadius: "var(--r-1)",
                  background: `color-mix(in oklab, ${k.color} 18%, transparent)`,
                  color: k.color,
                }}>{k.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 24, borderRadius: "var(--r-1)", overflow: "hidden", background: e.project.color }}>
                  <FrameThumb kind={e.project.thumb} usePhoto/>
                </div>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic" }}>{e.project.film?.title || e.project.title}</span>
              </div>
              <div style={{ color: e.tier.color, fontWeight: 500 }}>{e.tier.name}</div>
              <div className="t-num" style={{ fontFamily: "var(--f-mono)" }}>${(e.priceUSD || e.tier.priceUSD).toLocaleString()}</div>
              <div className="t-num" style={{ fontFamily: "var(--f-mono)", color: e.actor === "you" ? "var(--c-amber)" : "var(--c-ink-2)" }}>{e.actor}</div>
              <div className="t-num" style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-3)", textAlign: "right" }}>{relTime(e.t)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function relTime(t) {
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 60) return s < 10 ? "just now" : `${s}s ago`;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── App root ──────────────────────────────────────────────────────────
const PRODUCERS_TWEAKS = /*EDITMODE-BEGIN*/{
  "defaultSort": "trending",
  "showSyntheticBadge": false
}/*EDITMODE-END*/;

// ─── Command palette (⌘K) ──────────────────────────────────────────────
function ProducersCmdK() {
  const [open, setOpen] = prUseState(false);
  const [q, setQ] = prUseState("");
  const [sel, setSel] = prUseState(0);
  const inputRef = React.useRef(null);

  prUseEffect(() => {
    window.openProducersCmdK = () => { setOpen(true); setQ(""); setSel(0); };
    const onKey = (e) => {
      const t = e.target, inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(o => !o); setQ(""); setSel(0); return; }
      if (e.key === "Escape" && open) setOpen(false);
      if (e.key === "/" && !inField && !open) { e.preventDefault(); setOpen(true); setQ(""); setSel(0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  prUseEffect(() => { if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }, [open]);

  const goHash = (h) => () => { location.hash = h; setOpen(false); };
  const goHref = (href) => () => { window.location.href = href; setOpen(false); };

  const cmds = prUseMemo(() => {
    const out = [];
    [
      { label: "Market", hint: "All open projects", icon: "trend", to: "market" },
      { label: "Catalog Index", hint: "Every project", icon: "grid", to: "index" },
      { label: "Watchlist", hint: "Projects you track", icon: "heart", to: "watchlist" },
      { label: "My stakes", hint: "Portfolio & P/L", icon: "wallet", to: "portfolio" },
      { label: "Activity", hint: "Live market tape", icon: "clock", to: "activity" },
      { label: "Documents & tax", hint: "KYC · 1099 · statements", icon: "shield", to: "documents" },
    ].forEach(v => out.push({ id: "go:" + v.to, kind: "Go to", label: v.label, hint: v.hint, icon: v.icon, run: goHash(v.to) }));
    [
      { label: "Cina Watch", hint: "Public site", href: "index.html" },
      { label: "Cina Studio", hint: "Creator side", href: "Cina.html" },
    ].forEach(v => out.push({ id: "surf:" + v.href, kind: "Switch to", label: v.label, hint: v.hint, icon: "apps", run: goHref(v.href) }));
    try {
      buildProjectIndex().forEach(p => out.push({
        id: "proj:" + p.id, kind: "Project",
        label: p.film?.title || p.title, hint: (p.kind || "film") + (p.tiers ? " · " + p.tiers.length + " tiers" : ""),
        icon: "folder", run: goHash("project/" + p.id),
      }));
    } catch (e) {}
    if (window.cinaCrossCommands) out.push(...window.cinaCrossCommands("producers"));
    return out;
  }, [open]);

  const results = prUseMemo(() => {
    if (!q.trim()) return cmds.filter(c => c.kind === "Go to" || c.kind === "Switch to");
    const n = q.toLowerCase();
    return cmds.map(c => {
      const hay = (c.label + " " + (c.hint || "")).toLowerCase();
      let s = 0;
      if (c.label.toLowerCase().startsWith(n)) s = 100; else if (hay.includes(n)) s = 50;
      else { let i = 0; for (const ch of n) { const idx = hay.indexOf(ch, i); if (idx === -1) return null; i = idx + 1; } s = 10; }
      return { ...c, _s: s };
    }).filter(Boolean).sort((a, b) => b._s - a._s).slice(0, 16);
  }, [q, cmds]);

  prUseEffect(() => { setSel(0); }, [q]);
  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(results.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[sel]; if (r) r.run(); }
  };
  const groups = [];
  let lk = null;
  results.forEach((r, i) => { if (r.kind !== lk) { groups.push({ kind: r.kind, items: [] }); lk = r.kind; } groups[groups.length - 1].items.push({ ...r, _i: i }); });

  return (
    <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "min(620px,92vw)", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", boxShadow: "0 40px 120px rgba(0,0,0,.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--c-line)" }}>
          <Icon name="search" size={14}/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKeyDown} placeholder="Jump to a project, view, or surface…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--c-ink)", fontSize: "var(--fs-lead)" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", border: "1px solid var(--c-line-2)", padding: "2px 6px", borderRadius: "var(--r-1)" }}>ESC</span>
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto", padding: "6px 0" }}>
          {results.length === 0 && <div style={{ padding: "30px", textAlign: "center", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>No matches for "{q}"</div>}
          {groups.map((g, gi) => (
            <div key={gi}>
              <div className="t-mono" style={{ padding: "6px 16px 4px", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{g.kind.toUpperCase()}</div>
              {g.items.map(r => {
                const active = r._i === sel;
                return (
                  <button key={r.id} onClick={r.run} onMouseEnter={() => setSel(r._i)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "9px 16px", background: active ? "rgba(255,255,255,.04)" : "transparent", border: "none", borderLeft: active ? "2px solid var(--c-amber)" : "2px solid transparent", textAlign: "left", cursor: "pointer", color: "var(--c-ink)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "var(--r-2)", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: active ? "var(--c-amber)" : "var(--c-ink-3)" }}><Icon name={r.icon || "dot"} size={11}/></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
                      {r.hint && <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.hint}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function _parseProducersHash() {
  const h = (location.hash || "").replace(/^#\/?/, "");
  if (!h) return { route: "market", projectId: null };
  const [r, sub] = h.split("/");
  if (r === "project" && sub) return { route: "market", projectId: sub };
  if (r === "auction" && sub) return { route: "auction/" + sub, projectId: null };
  if (["market","watchlist","portfolio","activity","index","documents","auctions"].includes(r)) {
    return { route: r, projectId: null };
  }
  return { route: "market", projectId: null };
}

function ProducersApp() {
  const [t, setTweak] = useTweaks(PRODUCERS_TWEAKS);
  const session = window.useProducerSession ? window.useProducerSession() : null;
  const cina = useCinaId();
  const [appAppearance] = window.useCinaAppearance ? window.useCinaAppearance() : [null];
  const _initP = _parseProducersHash();
  const [route, setRoute] = prUseState(_initP.route);
  const [openProjectId, setOpenProjectId] = prUseState(_initP.projectId);
  const [query, setQuery] = prUseState("");

  prUseEffect(() => {
    if (window.CinaAppearance) window.CinaAppearance.applyToDOM();
  }, [appAppearance && appAppearance.mood]);

  // Hash routing
  prUseEffect(() => {
    const apply = () => {
      const h = (location.hash || "").replace(/^#/, "");
      if (!h) { setRoute("market"); setOpenProjectId(null); return; }
      const [r, sub] = h.split("/");
      if (r === "project" && sub) { setOpenProjectId(sub); }
      else if (r === "auction" && sub) { setRoute("auction/" + sub); setOpenProjectId(null); }
      else if (["market","watchlist","portfolio","activity","index","documents","auctions"].includes(r)) {
        setRoute(r); setOpenProjectId(null);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const goRoute = (r) => { location.hash = r; setRoute(r); setOpenProjectId(null); };

  // watch-auction.jsx pages call navigate("/auction/:id") etc. (watch-app
  // routes). Inside the Producers app, map those onto our hash router; any
  // other watch path goes to the public site.
  prUseEffect(() => {
    if (window.navigate) return;
    window.navigate = (to) => {
      const m = String(to || "");
      if (m === "/auctions") { location.hash = "auctions"; return; }
      const a = m.match(/^\/auction\/(.+)$/);
      if (a) { location.hash = "auction/" + a[1]; return; }
      window.location.href = "index.html#" + m;
    };
  }, []);
  const openProject = (id) => { location.hash = `project/${id}`; setOpenProjectId(id); };
  const closeProject = () => { location.hash = "market"; setOpenProjectId(null); setRoute("market"); };

  const [launchNonce, setLaunchNonce] = prUseState(0);
  prUseEffect(() => {
    const h = () => setLaunchNonce(n => n + 1);
    window.addEventListener("cina-project-launched", h);
    return () => window.removeEventListener("cina-project-launched", h);
  }, []);
  const projects = prUseMemo(() => buildProjectIndex(), [launchNonce]);
  const opened = openProjectId ? projects.find(p => p.id === openProjectId) : null;

  // One identity across the building: Producers requires a signed-in Cina ID.
  if (!cina.signedIn) {
    return <CinaSignedOut surface="producers" accent= "var(--c-amber)"/>;
  }

  return (
    <div>
      <ProducersTopNav route={route} onRoute={goRoute} query={query} onQuery={setQuery}/>

      <main id="main-content" tabIndex={-1} style={{ outline: "none" }}>
      {opened ? (
        <ProducerDetail project={opened} onBack={closeProject}/>
      ) : route === "market" ? (
        <ProducerMarket projects={projects} query={query} onOpen={openProject}/>
      ) : route === "watchlist" ? (
        <WatchlistPage projects={projects} onOpen={openProject}/>
      ) : route === "portfolio" ? (
        <>
          <PortfolioPage projects={projects} onOpen={openProject}/>
          {window.ChainedSplitRouterPanel && (
            <div style={{ width: "91%", margin: "0 auto 6vh" }}>
              <window.ChainedSplitRouterPanel/>
            </div>
          )}
        </>
      ) : route === "activity" ? (
        <ActivityPage projects={projects}/>
      ) : route === "auctions" ? (
        window.AuctionMarketPage ? <AuctionMarketPage/> : null
      ) : route.startsWith("auction/") ? (
        window.AuctionDetailPage ? <AuctionDetailPage auctionId={route.slice(8)}/> : null
      ) : route === "index" ? (
        <CatalogIndexPage projects={projects} onOpen={openProject}/>
      ) : route === "documents" ? (
        <ProducerDocsPage projects={projects}/>
      ) : null}
      </main>

      {window.ProducerFlowsHost && <ProducerFlowsHost/>}
      <ProducersCmdK/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<ProducersApp/>);
