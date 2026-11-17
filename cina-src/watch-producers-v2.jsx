// watch-producers-v2.jsx — Producers market, full redesign + merge.
// ONE producers surface for the Watch app: co-finance films, series and
// performers. Folds in every function from the old watch-producers.jsx
// (market rows, actor stocks, trending / hyped / top-10) and adds a featured
// fundraise hero, a how-it-works band, filters, and live buy-in wiring.
//
// Reads NFT_PROJECTS + CATALOG + CAST. Routes: /nft/:id (project) · /cast/:id.

const { useState: usP2, useMemo: umP2 } = React;

// ─── Format helpers ───────────────────────────────────────────────────────
function p2USD(n) { return "$" + Math.round(n).toLocaleString(); }
function p2USDk(n) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "k";
  return "$" + Math.round(n);
}
function p2Count(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

// ─── Market rows from NFT_PROJECTS + CATALOG (deterministic stats) ─────────
function useP2Rows() {
  return umP2(() => {
    const projects = Object.values(window.NFT_PROJECTS || {});
    return projects.map((p) => {
      const film = (window.CATALOG || []).find((f) => f.id === p.filmId) || {};
      const totalMinted = (p.tiers || []).reduce((s, t) => s + (t.sold || t.minted || 0), 0);
      const totalSupply = (p.tiers || []).reduce((s, t) => s + (t.count || t.supply || t.sold || 0), 0);
      const cheapest = Math.min(...(p.tiers || []).map((t) => t.priceUSD || t.price || 0).filter((x) => x > 0)) || 50;
      const seed = (p.id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const change24h = ((seed * 7) % 41) - 20;
      const change7d = ((seed * 11) % 81) - 30;
      const hypeScore = Math.min(99, 30 + ((seed * 13) % 70));
      const watchers = 200 + ((seed * 137) % 9800);
      const fundedPct = p.goal ? Math.round((p.raised / p.goal) * 100) : (totalSupply ? Math.round((totalMinted / totalSupply) * 100) : 0);
      return {
        kind: film.kind === "series" ? "series" : "film",
        id: p.id, filmId: film.id, projectId: p.id,
        title: film.title || p.title || "—",
        creator: film.creator || p.creator || "—",
        creatorId: film.creatorId || p.creatorId,
        thumb: film.thumb, color: p.color || film.color || tkc("line-2"),
        genre: (film.genre || [])[0] || "—",
        floor: cheapest, change24h, change7d, hypeScore, watchers,
        fundedPct, totalMinted, totalSupply,
        raised: p.raised || 0, goal: p.goal || 0, backers: p.backers || 0, daysLeft: p.daysLeft || 0,
        summary: p.summary || "", tiers: p.tiers || [],
        views: film.views || 0, rating: film.rating || 0,
      };
    });
  }, []);
}

// ─── Actor stocks (sourced from CAST / CHARACTERS / ACTORS) ───────────────
function useP2Actors() {
  return umP2(() => {
    const sources = [];
    if (window.CAST) sources.push(...window.CAST);
    if (window.CHARACTERS) sources.push(...window.CHARACTERS);
    if (window.ACTORS) sources.push(...window.ACTORS);
    const seen = new Set();
    const list = [];
    for (const a of sources) {
      const id = a.id || a.slug || a.name;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const seed = String(id).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      const roleCount = (a.roles || []).length;
      list.push({
        id, name: a.name, role: a.role || a.archetype || (a.roles && a.roles[0] && a.roles[0].lead ? "Lead" : "Performer"),
        glyph: a.glyph || (a.name || "?")[0], color: (a.palette && a.palette[2]) || a.color || tkc("cat-3"),
        actorObj: a,
        price: 12 + ((seed * 17) % 240),
        change: ((seed * 19) % 81) - 30,
        films: a.films || roleCount || (1 + (seed % 9)),
        popularity: Math.min(99, 40 + ((seed * 7) % 60)),
        minted: !!(a.minted ?? (seed % 2 === 0)),
        followers: a.followers || 0,
      });
    }
    // Sort by popularity so the strongest performers rise to the top.
    return list.sort((a, b) => b.popularity - a.popularity);
  }, []);
}

// ════════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════════
function ProducersMarketPage() {
  const rows = useP2Rows();
  const actors = useP2Actors();
  const [tab, setTab] = usP2("all");

  const stats = umP2(() => {
    const totalCap = rows.reduce((s, r) => s + r.floor * r.totalMinted, 0);
    const totalRaised = rows.reduce((s, r) => s + r.raised, 0);
    const top = [...rows].sort((a, b) => b.change24h - a.change24h)[0];
    const totalWatchers = rows.reduce((s, r) => s + r.watchers, 0);
    return { totalCap, totalRaised, live: rows.length, top, totalWatchers };
  }, [rows]);

  const featured = umP2(() => [...rows].filter((r) => r.goal).sort((a, b) => b.fundedPct - a.fundedPct)[0] || rows[0], [rows]);
  const trending = umP2(() => [...rows].sort((a, b) => b.change24h - a.change24h).slice(0, 8), [rows]);
  const hyped = umP2(() => [...rows].sort((a, b) => b.hypeScore - a.hypeScore).slice(0, 8), [rows]);
  const top10 = umP2(() => [...rows].sort((a, b) => (b.floor * b.totalMinted) - (a.floor * a.totalMinted)).slice(0, 10), [rows]);
  const films = umP2(() => rows.filter((r) => r.kind === "film"), [rows]);
  const series = umP2(() => rows.filter((r) => r.kind === "series"), [rows]);

  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const pad = isMobile ? "0 20px" : "0 var(--gutter)";

  return (
    <div data-screen-label="Producers" style={{ background: "var(--c-bg)", color: "var(--c-ink)", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <header style={{ borderBottom: "1px solid var(--c-line)", background: "linear-gradient(180deg, rgba(var(--accent-rgb),0.07), transparent 60%)" }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: isMobile ? "30px 20px 26px" : "52px var(--gutter) 38px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 14 }}>
            PRODUCERS · CO-FINANCE THE SLATE
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 760 }}>
              <h1 className="t-display" style={{ fontStyle: "italic", fontSize: isMobile ? 38 : 62, lineHeight: 0.98, letterSpacing: "-0.02em", margin: 0, fontWeight: 400 }}>
                Back the films. <span style={{ color: "var(--c-amber)" }}>Earn with the audience.</span>
              </h1>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: "16px 0 0", maxWidth: 600, lineHeight: 1.55, textWrap: "pretty" }}>
                Every film, series and performer on Cina opens a stake. Pick a project, choose a tier, vote on what gets greenlit, and collect a slice of every ad, subscription and ticket the work earns.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 16 : "22px 40px" }}>
              <P2Stat label="Live projects" value={stats.live} />
              <P2Stat label="Raised to date" value={p2USDk(stats.totalRaised)} />
              <P2Stat label="Watchers" value={p2Count(stats.totalWatchers)} />
              <P2Stat label="24h leader" value={stats.top ? stats.top.title : "—"} sub={stats.top ? `+${stats.top.change24h}%` : ""} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Featured fundraise + how-it-works ── */}
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: isMobile ? "24px 20px 0" : "34px var(--gutter) 0" }}>
        {featured && <P2Featured row={featured} isMobile={isMobile} />}
        <P2HowItWorks isMobile={isMobile} />
      </div>

      {/* ── Sticky section nav ── */}
      <div style={{ position: "sticky", top: 56, zIndex: 5, background: "rgba(12,10,9,0.93)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--c-line)", borderTop: "1px solid var(--c-line)", marginTop: isMobile ? 28 : 40 }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: pad, display: "flex", gap: 0, alignItems: "stretch", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "all", label: "All projects" },
            { id: "films", label: "Movies", count: films.length },
            { id: "series", label: "Series", count: series.length },
            { id: "actors", label: "Actors", count: actors.length },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "15px 20px", background: "transparent", border: "none", whiteSpace: "nowrap",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
              color: tab === t.id ? "var(--c-amber)" : "var(--c-ink-3)",
              borderRadius: 0,
              borderBottom: tab === t.id ? "2px solid var(--c-amber)" : "2px solid transparent", cursor: "pointer",
            }}>
              {t.label}{t.count != null && <span style={{ color: "var(--c-ink-4)", marginLeft: 5 }}>{t.count}</span>}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {!isMobile && (
            <button className="btn btn-primary" style={{ alignSelf: "center", height: 30 }} onClick={() => window.open("Cina.html", "_blank")}>
              <Icon name="sparkles" size={11} /> Create your project
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: isMobile ? "26px 20px 70px" : "34px var(--gutter) 90px" }}>
        {(tab === "all" || tab === "films" || tab === "series") && (
          <>
            {tab === "all" && (
              <P2Section title="Trending" subtitle="Strongest 24h price action across the floor">
                <P2Grid rows={trending} min={isMobile ? 200 : 240} />
              </P2Section>
            )}
            {tab === "all" && (
              <P2Section title="Hyped" subtitle="High-momentum drops · social signal + watchlists" accent>
                <P2Grid rows={hyped} min={isMobile ? 200 : 240} />
              </P2Section>
            )}
            {tab === "all" && (
              <P2Section title="Top 10" subtitle="Highest market cap on the floor">
                <P2TopTen rows={top10} isMobile={isMobile} />
              </P2Section>
            )}
            {(tab === "all" || tab === "films") && (
              <P2Section title="Movies" subtitle={`${films.length} feature projects open for buy-in`}>
                <P2Grid rows={films} min={isMobile ? 200 : 240} />
              </P2Section>
            )}
            {(tab === "all" || tab === "series") && (
              <P2Section title="Series" subtitle={`${series.length} ongoing season drops`}>
                <P2Grid rows={series} min={isMobile ? 200 : 240} />
              </P2Section>
            )}
          </>
        )}

        {tab === "actors" && (
          <P2Section title="Actor stocks" subtitle="Buy shares in performers — earn from every film they ship. Strongest careers first.">
            <P2ActorBoard actors={actors} />
          </P2Section>
        )}

        <P2CreateBlock isMobile={isMobile} />
      </div>
    </div>
  );
}

// ─── Hero stat ─────────────────────────────────────────────────────────────
function P2Stat({ label, value, sub }) {
  return <CinaStat label={label} value={value} sub={sub}/>;
}

// ─── Featured fundraise hero ───────────────────────────────────────────────
function P2Featured({ row, isMobile }) {
  const lowest = [...(row.tiers || [])].sort((a, b) => (a.priceUSD || 0) - (b.priceUSD || 0))[0] || { name: "Collector", priceUSD: row.floor };
  const buy = () => {
    if (window.openPay) window.openPay({
      kind: "nft", title: `${row.title} · ${lowest.name}`, subtitle: `Producer pass · ${row.creator}`,
      accent: row.color, priceUSD: lowest.priceUSD || row.floor, image: { kind: row.thumb, color: row.color },
    });
    else navigate(`/nft/${row.projectId}`);
  };
  return (
    <section style={{
      display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.25fr 1fr", gap: 0,
      background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden",
    }}>
      <button onClick={() => navigate(`/nft/${row.projectId}`)} style={{
        appearance: "none", border: "none", padding: 0, cursor: "pointer",
        position: "relative", aspectRatio: isMobile ? "16/9" : "auto", minHeight: isMobile ? 0 : 320, background: row.color, overflow: "hidden",
      }}>
        {window.FrameThumb && <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={row.thumb} usePhoto /></div>}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,.86) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", left: 22, bottom: 20, right: 22, textAlign: "left" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 8 }}>● FEATURED · {row.kind === "series" ? "SERIES" : "FILM"}</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: isMobile ? 30 : 40, color: tkc("white"), lineHeight: 1, letterSpacing: "-0.02em" }}>{row.title}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.72)", marginTop: 8, letterSpacing: ".16em" }}>{row.creator.toUpperCase()} · {row.genre.toUpperCase()}</div>
        </div>
      </button>

      <div style={{ padding: isMobile ? "20px" : "26px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", margin: 0, lineHeight: 1.55 }}>{row.summary || `Co-finance ${row.title}. Holders get premiere access, revenue share through Year 5, and tiered perks.`}</p>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
          <P2MiniStat label="RAISED" value={p2USDk(row.raised)} sub={`of ${p2USDk(row.goal)} goal`} />
          <P2MiniStat label="BACKERS" value={(row.backers || 0).toLocaleString()} sub={`${row.daysLeft}d left`} />
          <P2MiniStat label="FROM" value={p2USD(lowest.priceUSD || row.floor)} sub={`${lowest.name} tier`} amber />
        </div>
        <div>
          <div style={{ height: 6, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" }}>
            <div style={{ width: Math.min(100, row.fundedPct) + "%", height: "100%", background: `linear-gradient(90deg, var(--c-amber), ${tkc("amber-d")})` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{row.fundedPct}% FUNDED</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{row.daysLeft} DAYS LEFT</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
          <button className="btn btn-primary" style={{ height: 44, padding: "0 22px", fontSize: "var(--fs-body)" }} onClick={buy}>Buy producer NFT →</button>
          <button className="btn" style={{ height: 44, padding: "0 20px", fontSize: "var(--fs-body)" }} onClick={() => navigate(`/nft/${row.projectId}`)}>View project</button>
        </div>
      </div>
    </section>
  );
}

function P2MiniStat({ label, value, sub, amber }) {
  return <CinaStat size="sm" label={label} value={value} sub={sub} tone={amber ? "accent" : undefined}/>;
}

// ─── How it works ──────────────────────────────────────────────────────────
function P2HowItWorks({ isMobile }) {
  const steps = [
    { n: "01", h: "Browse", p: "Every Cina film and series opens a fundraise. Read the slate, see the director's commitments, pick a project." },
    { n: "02", h: "Pick a tier", p: "Collector, Patron or Producer. Higher tiers carry a larger revenue share and deeper perks." },
    { n: "03", h: "Earn", p: "Quarterly royalties from Watch subs, ad revenue and licensing. Smart contracts auto-route on settlement." },
    { n: "04", h: "Trade or hold", p: "Sell your stake on the secondary market anytime. Holders always watch first." },
  ];
  return (
    <section style={{ marginTop: 16, border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: "linear-gradient(180deg, rgba(var(--accent-rgb),.04), transparent 70%)" }}>
      <div style={{ padding: isMobile ? "18px 20px 6px" : "20px 28px 6px", display: "flex", alignItems: "baseline", gap: 12 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>HOW IT WORKS</span>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)" }}>Back films. Earn royalties. Trade your stake.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)" }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ padding: isMobile ? "16px 20px" : "18px 28px 22px", borderLeft: !isMobile && i > 0 ? "1px solid var(--c-line)" : "none", borderTop: (isMobile && i >= 2) || (!isMobile) ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{s.n}</span>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{s.h}</span>
            </div>
            <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: 0, lineHeight: 1.5 }}>{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section header ────────────────────────────────────────────────────────
function P2Section({ title, subtitle, accent, children }) {
  return (
    <section style={{ marginBottom: 46 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, margin: 0, color: accent ? "var(--c-amber)" : "var(--c-ink)", letterSpacing: "-0.01em" }}>{title}</h2>
        {subtitle && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 5 }}>{subtitle}</div>}
      </div>
      {children}
    </section>
  );
}

// ─── Project card ──────────────────────────────────────────────────────────
function P2Card({ row }) {
  const rising = row.change24h >= 0;
  const [hover, setHover] = usP2(false);
  return (
    <button
      onClick={() => navigate(`/nft/${row.projectId}`)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        appearance: "none", textAlign: "left", padding: 0, cursor: "pointer", width: "100%",
        display: "flex", flexDirection: "column",
        background: "var(--c-panel)", border: "1px solid " + (hover ? "var(--c-amber)" : "var(--c-line)"),
        borderRadius: "var(--r-2)", overflow: "hidden", color: "inherit",
        transform: hover ? "translateY(-3px)" : "none", transition: "border-color .15s ease, transform .15s ease",
      }}>
      <div style={{ position: "relative", aspectRatio: "16/10", background: row.color, overflow: "hidden" }}>
        {window.FrameThumb && <div style={{ position: "absolute", inset: 0, transform: hover ? "scale(1.05)" : "none", transition: "transform .5s cubic-bezier(.2,.7,.2,1)" }}><FrameThumb kind={row.thumb} usePhoto /></div>}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,.9))" }} />
        <div style={{ position: "absolute", top: 9, left: 9, padding: "3px 8px", background: "rgba(0,0,0,.66)", backdropFilter: "blur(4px)", borderRadius: 999, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: row.kind === "series" ? tkc("cat-4") : "var(--c-amber)" }}>
          {row.kind === "series" ? "SERIES" : "MOVIE"}
        </div>
        <div style={{ position: "absolute", top: 9, right: 9, padding: "3px 8px", background: rising ? "rgba(124,197,133,.9)" : "rgba(216,106,106,.9)", borderRadius: 999, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", fontWeight: 600 }}>
          {rising ? "▲" : "▼"} {Math.abs(row.change24h)}%
        </div>
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 11 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.05, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{row.title}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.72)", marginTop: 4, textTransform: "uppercase" }}>{row.creator} · {row.genre}</div>
        </div>
      </div>
      <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>FLOOR</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>{p2USD(row.floor)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>FUNDED</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 2 }}>{row.fundedPct}%</div>
        </div>
        <div style={{ gridColumn: "1 / -1", height: 3, background: "var(--c-bg)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
          <div style={{ width: Math.min(100, row.fundedPct) + "%", height: "100%", background: "var(--c-amber)" }} />
        </div>
      </div>
    </button>
  );
}

function P2Grid({ rows, min = 240 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 14 }}>
      {rows.map((r) => <P2Card key={r.id} row={r} />)}
    </div>
  );
}

// ─── Top 10 ────────────────────────────────────────────────────────────────
function P2TopTen({ rows, isMobile }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
      {rows.map((r, i) => (
        <button key={r.id} onClick={() => navigate(`/nft/${r.projectId}`)} style={{
          appearance: "none", textAlign: "left", cursor: "pointer",
          display: "grid", gridTemplateColumns: "42px 1fr auto auto", gap: 14, alignItems: "center", padding: "13px 18px",
          color: "inherit", background: "var(--c-panel)",
          borderBottom: (isMobile ? i < rows.length - 1 : i < rows.length - 2) ? "1px solid var(--c-line)" : "none",
          borderRight: !isMobile && i % 2 === 0 ? "1px solid var(--c-line)" : "none",
        }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--c-panel-2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "var(--c-panel)"}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: i < 3 ? "var(--c-amber)" : "var(--c-ink-4)" }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
            <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2, textTransform: "uppercase" }}>{r.creator} · {r.kind}</span>
          </span>
          <span style={{ textAlign: "right" }}>
            <span style={{ display: "block" }} className="t-display"><em style={{ fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>{p2USD(r.floor)}</em></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>FLOOR</span>
          </span>
          <span style={{ padding: "4px 9px", borderRadius: 999, background: r.change24h >= 0 ? "rgba(124,197,133,.16)" : "rgba(216,106,106,.16)", color: r.change24h >= 0 ? "var(--c-good)" : tkc("bad"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>
            {r.change24h >= 0 ? "+" : ""}{r.change24h}%
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Actor stocks ──────────────────────────────────────────────────────────
function P2ActorBoard({ actors }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
      {actors.map((a) => <P2ActorCard key={a.id} actor={a} />)}
    </div>
  );
}

function P2ActorCard({ actor }) {
  const rising = actor.change >= 0;
  const [hover, setHover] = usP2(false);
  const hasPortrait = typeof CastPortrait === "function" && actor.actorObj;
  return (
    <button onClick={() => navigate(`/cast/${actor.id}`)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ appearance: "none", textAlign: "left", padding: 0, cursor: "pointer", width: "100%",
        display: "flex", flexDirection: "column", background: "var(--c-panel)",
        border: "1px solid " + (hover ? "var(--c-amber)" : "var(--c-line)"), borderRadius: "var(--r-2)", overflow: "hidden", color: "inherit", transition: "border-color .15s ease" }}>
      <div style={{ aspectRatio: "1/1", background: `linear-gradient(135deg, ${actor.color}, ${tkc("void")})`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {hasPortrait
          ? <CastPortrait actor={actor.actorObj} size={300} shot="face" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />
          : <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", color: "rgba(255,255,255,0.4)" }}>{actor.glyph}</div>}
        <div style={{ position: "absolute", top: 10, right: 10, padding: "3px 8px", background: actor.minted ? "rgba(124,197,133,.9)" : "rgba(var(--accent-rgb),.9)", borderRadius: 999, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", letterSpacing: ".16em", fontWeight: 600 }}>
          {actor.minted ? "● MINTED" : "○ MINT REQ"}
        </div>
      </div>
      <div style={{ padding: "13px 15px" }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{actor.name}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase", marginTop: 3 }}>{actor.role} · {actor.films} films</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
          <div><div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SHARE</div><div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>{p2USD(actor.price)}</div></div>
          <div><div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>24H</div><div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: rising ? "var(--c-good)" : tkc("bad") }}>{rising ? "+" : ""}{actor.change}%</div></div>
          <div><div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>HEAT</div><div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{actor.popularity}</div></div>
        </div>
      </div>
    </button>
  );
}

// ─── Create your project ───────────────────────────────────────────────────
function P2CreateBlock({ isMobile }) {
  return (
    <section style={{ marginTop: 40, border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", overflow: "hidden", background: "linear-gradient(135deg, rgba(var(--accent-rgb),0.10), rgba(168,88,56,0.04) 50%, transparent)" }}>
      <div style={{ padding: isMobile ? "28px 22px" : "44px 48px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 36, alignItems: "center" }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 }}>CREATE YOUR PROJECT</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: isMobile ? 32 : 44, lineHeight: 1.04, margin: "0 0 12px", letterSpacing: "-0.01em" }}>Make a film. Mint a series. Sell shares.</h2>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", maxWidth: 620, lineHeight: 1.55 }}>
            Open Studio to draft a project, mint your performers, and list a tier ladder for producers. Royalties stream straight back to your wallet from every screen — Watch, Pitch, Cast.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <a href="Cina.html" target="_blank" rel="noopener" className="btn btn-primary" style={{ height: 40, padding: "0 18px" }}><Icon name="sparkles" size={12} /> Open Studio</a>
            <button className="btn" style={{ height: 40, padding: "0 18px" }} onClick={() => navigate("/leaderboard")}><Icon name="trend" size={12} /> Producer leaderboard</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minWidth: isMobile ? 0 : 360 }}>
          {[["DRAFT", "Free"], ["MINT", "0.012 ETH"], ["TIERS", "3 — 9"], ["ROYALTY", "12 — 25%"]].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: "14px 16px" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{k}</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ProducersMarketPage });
