// watch-app.jsx — Public watch app root + router.

const { useState: usWA, useEffect: ueWA } = React;

function fmtUSD2(n) { return "$" + Math.round(n).toLocaleString(); }

// ─── Route placeholders ─────────────────────────────────────────────────
// Destinations the menus and footer imply but that haven't shipped yet. The
// router renders a branded "coming soon" card for these (see WatchRoot) rather
// than silently dropping the visitor on the home splash.
const PLACEHOLDER_ROUTES = {
  // notifications / history / search / help / download all shipped.
};

function ShelfPage({ shelfId }) {
  const shelf = SHELVES.find(s => s.id === shelfId);
  if (!shelf) return (
    <div style={{ padding: "60px var(--gutter)", maxWidth: "var(--w-page)", margin: "0 auto", textAlign: "center" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>SHELF NOT FOUND</div>
      <button className="btn btn-ghost" onClick={() => navigate("/browse")}>Back to browse</button>
    </div>
  );
  const films = shelf.filmIds.map(id => CATALOG.find(f => f.id === id)).filter(Boolean);
  return (
    <div style={{ padding: "32px var(--gutter) 64px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <button onClick={() => navigate("/browse")} className="btn btn-ghost" style={{ marginBottom: 16, fontSize: "var(--fs-label)" }}>
        <Icon name="chev-l" size={11}/> All shelves
      </button>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>SHELF · {films.length} films</div>
      <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{shelf.title}</h1>
      {shelf.subtitle && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 28 }}>{shelf.subtitle}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginTop: 18 }}>
        {films.map(f => (
          <button key={f.id} onClick={() => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} className="btn-ghost" style={{
            height: "auto", padding: 0, borderRadius: "var(--r-2)", overflow: "hidden",
            display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0, textAlign: "left", justifyContent: "flex-start",
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
          }}>
            <div style={{ aspectRatio: "16/9", background: f.color, overflow: "hidden" }}>
              <FrameThumb kind={f.thumb} usePhoto/>
            </div>
            <div style={{ padding: 12 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{f.title}</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{f.creator}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4 }}>{f.year} · {f.genre[0]} · ★ {f.rating}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page intro — sourced from primitives.jsx ────────────────────────────
// `<PageIntro/>` is now the canonical primitive for /genre/* /cast headers.
// See primitives.jsx for the implementation.

function GenreHero({ film, slug }) {
  if (!film) return null;
  const isSeries = film.kind === "series";
  return (
    <section style={{
      position: "relative",
      width: "100%",
      height: 540,
      overflow: "hidden",
      borderBottom: "1px solid var(--c-line)",
    }}>
      {/* Background photo */}
      <div style={{ position: "absolute", inset: 0, background: film.color }}>
        <FrameThumb kind={film.thumb} usePhoto/>
      </div>

      {/* Cinematic gradient — left+bottom heavy */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(8,8,10,.95) 0%, rgba(8,8,10,.7) 35%, rgba(8,8,10,.15) 70%, transparent 100%), linear-gradient(0deg, rgba(8,8,10,.85) 0%, rgba(8,8,10,0) 50%)",
      }}/>

      {/* Top sticky context */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "26px var(--gutter) 0", display: "flex", alignItems: "center", gap: 12 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>BROWSE</div>
        <div style={{ width: 1, height: 14, background: "var(--c-line-2)" }}/>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{slug.toUpperCase()}</div>
      </div>

      {/* Content block */}
      <div style={{
        position: "absolute",
        left: 56, bottom: 48,
        maxWidth: 640,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="t-mono" style={{
            fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
            padding: "4px 8px", border: "1px solid rgba(var(--accent-rgb),.4)",
            borderRadius: "var(--r-1)", background: "rgba(var(--accent-rgb),.08)",
          }}>FEATURED</span>
          {isSeries && (
            <span className="t-mono" style={{
              fontSize: "var(--fs-label)", color: "var(--c-ink)", letterSpacing: ".16em",
              padding: "4px 8px", background: "rgba(255,255,255,.1)",
              borderRadius: "var(--r-1)",
            }}>S{film.season} · {film.totalEpisodes} EPISODES</span>
          )}
          {film.nftPremiere && (
            <span className="t-mono" style={{
              fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
              padding: "4px 8px", background: "rgba(var(--accent-rgb),.12)",
              borderRadius: "var(--r-1)", display: "flex", alignItems: "center", gap: 4,
            }}><Icon name="ticket" size={9}/> NFT PREMIERE</span>
          )}
        </div>

        <h1 className="t-display" style={{
          fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 500,
          margin: 0, lineHeight: .95, letterSpacing: "-0.02em",
          color: tkc("white"),
          textShadow: "0 4px 30px rgba(0,0,0,.6)",
        }}>{film.title}</h1>

        <div style={{
          display: "flex", gap: 14, alignItems: "center",
          fontSize: "var(--fs-body)", color: "rgba(255,255,255,.75)",
          fontFamily: "var(--f-mono)", letterSpacing: ".08em",
        }}>
          <span>{film.creator?.toUpperCase()}</span>
          <span style={{ color: "var(--c-ink-4)" }}>·</span>
          <span>{film.year}</span>
          <span style={{ color: "var(--c-ink-4)" }}>·</span>
          <span>{film.genre.join(" / ")}</span>
          <span style={{ color: "var(--c-ink-4)" }}>·</span>
          <span style={{ color: "var(--c-amber)" }}>★ {film.rating}</span>
        </div>

        {film.logline && (
          <p style={{
            margin: 0, fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.85)",
            lineHeight: 1.5, maxWidth: 520,
          }}>{film.logline}</p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            onClick={() => navigate(isSeries ? `/series/${film.id}` : `/film/${film.id}`)}
            className="btn"
            style={{
              height: 40, padding: "0 22px",
              background: "var(--c-amber)", color: "var(--c-on-amber)",
              border: "none", fontWeight: 600, fontSize: "var(--fs-body)",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <Icon name="play" size={14}/> {isSeries ? "Watch series" : "Watch film"}
          </button>
          <button
            onClick={() => navigate(isSeries ? `/series/${film.id}` : `/film/${film.id}`)}
            className="btn"
            style={{
              height: 40, padding: "0 18px",
              background: "rgba(0,0,0,.55)", color: tkc("white"),
              border: "1px solid rgba(255,255,255,.25)", fontSize: "var(--fs-body)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <Icon name="bookmark" size={13}/> Add to watchlist
          </button>
          {film.nft && (
            <button
              onClick={() => navigate(`/producers/project/${film.nft}`)}
              className="btn"
              style={{
                height: 40, padding: "0 18px",
                background: "transparent", color:  "var(--c-amber)",
                border: "1px solid rgba(var(--accent-rgb),.4)", fontSize: "var(--fs-body)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Back this project <Icon name="chev-r" size={12}/>
            </button>
          )}
        </div>

        {typeof window.FilmCrossLinks === "function" && <window.FilmCrossLinks film={film}/>}
      </div>

      {/* Side stats panel */}
      <div style={{
        position: "absolute", right: 56, bottom: 48,
        display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-end",
      }}>
        <div style={{
          padding: "10px 14px",
          background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "var(--r-2)", backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column", gap: 4, minWidth: 160,
        }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>WATCHING NOW</div>
          <div className="t-num" style={{ fontSize: "var(--fs-title)", color: tkc("white"), fontWeight: 600, fontFamily: "var(--f-display)" }}>
            {fmtCount(Math.floor((film.views || 50000) / 1000))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-label)", color: "var(--c-good)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}/>
            LIVE · trending
          </div>
        </div>
      </div>
    </section>
  );
}

function GenreStatsStrip({ list, slug }) {
  const totalEps = list.reduce((s, f) => s + (f.totalEpisodes || 1), 0);
  const totalHours = Math.round(list.reduce((s, f) => s + (f.runtimeMin || 95) * (f.totalEpisodes || 1), 0) / 60);
  const creators = new Set(list.map(f => f.creator)).size;
  const avgRating = (list.reduce((s, f) => s + (f.rating || 4), 0) / list.length).toFixed(1);
  const isSeries = slug === "series";
  const stats = [
    { l: isSeries ? "SERIES" : "FILMS", v: list.length, sub: "in library" },
    { l: isSeries ? "EPISODES" : "RUNTIME", v: isSeries ? totalEps : `${totalHours}h`, sub: isSeries ? "across all" : "total" },
    { l: "CREATORS", v: creators, sub: "publishing" },
    { l: "AVG RATING", v: `★ ${avgRating}`, sub: "viewer score", amber: true },
  ];
  return (
    <section style={{
      padding: "22px var(--gutter)",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
      background: "var(--c-panel)",
      borderTop: "1px solid var(--c-line)",
      borderBottom: "1px solid var(--c-line)",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{s.l}</div>
          <div className="t-num" style={{
            fontSize: "var(--fs-title)", fontFamily: "var(--f-display)", fontStyle: "italic",
            fontWeight: 500, lineHeight: 1,
            color: s.amber ? "var(--c-amber)" : "var(--c-ink)",
          }}>{s.v}</div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{s.sub}</div>
        </div>
      ))}
    </section>
  );
}

function GenrePage({ slug }) {
  const list = slug === "series" ? CATALOG.filter(f => f.kind === "series")
            : slug === "film"   ? CATALOG.filter(f => f.kind !== "series")
            : slug === "premiere" ? CATALOG.filter(f => f.nftPremiere)
            : CATALOG.filter(f => f.genre.some(g => g.toLowerCase().includes(slug)));

  // Page intro copy by slug — editorial framing, not lorem
  const introCopy = (() => {
    if (slug === "film") return {
      title: "Films",
      kicker: "ALL ORIGINALS · ONE WAY IN",
      lede: "Every Cina-native film, sorted by what the audience is watching tonight. New every Friday.",
    };
    if (slug === "series") return {
      title: "Series",
      kicker: "EPISODIC · WEEKLY DROPS",
      lede: "Drama, science fiction, slow horror, and one diner. Episodes drop on the day the director chose.",
    };
    if (slug === "premiere") return {
      title: "Premiere window",
      kicker: "PRODUCER NFT HOLDERS WATCH FIRST",
      lede: "Hold the pass, watch 24–72 hours before everyone else. Share of revenue from your seat onward.",
    };
    return {
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      kicker: "BY GENRE",
      lede: `Every ${slug} on Cina, ranked by what the room is watching tonight.`,
    };
  })();

  // Sort by rating × views for "featured"
  const sorted = [...list].sort((a, b) => (b.rating * (b.views || 0)) - (a.rating * (a.views || 0)));
  const hero = sorted[0];

  // Build dynamic shelves
  const shelves = [];

  // 1. Trending — top by recent views
  shelves.push({
    id: "trending",
    title: "Trending now",
    subtitle: "Most-watched this week",
    filmIds: sorted.slice(0, 8).map(f => f.id),
  });

  // 2. New & noteworthy
  const newAndNoted = list.filter(f => f.tags?.includes("new") || (f.year >= 2026));
  if (newAndNoted.length) {
    shelves.push({
      id: "new",
      title: "New & noteworthy",
      subtitle: "Fresh from creators · 2026",
      filmIds: newAndNoted.map(f => f.id),
    });
  }

  // 3. Premiere soon (NFT premieres)
  const premieres = list.filter(f => f.nftPremiere);
  if (premieres.length) {
    shelves.push({
      id: "premiere",
      title: "Premiere access",
      subtitle: "NFT holders watch first · 24–72h early",
      filmIds: premieres.map(f => f.id),
    });
  }

  // 4. Free
  const free = list.filter(f => f.free);
  if (free.length) {
    shelves.push({
      id: "free",
      title: "Free to watch",
      subtitle: "No subscription · ad-supported",
      filmIds: free.map(f => f.id),
    });
  }

  // 5. By genre — auto-group when slug is "series" or "film" (otherwise we're already filtered by genre)
  if (slug === "series" || slug === "film") {
    const allGenres = [...new Set(list.flatMap(f => f.genre))];
    allGenres.slice(0, 6).forEach(g => {
      const gFilms = list.filter(f => f.genre.includes(g));
      if (gFilms.length >= 2) {
        shelves.push({
          id: `genre-${g}`,
          title: g,
          subtitle: `${gFilms.length} ${slug === "series" ? "series" : "films"}`,
          filmIds: gFilms.map(f => f.id),
        });
      }
    });
  }

  // 6. By creator — top creators with 2+ titles
  const byCreator = list.reduce((acc, f) => {
    if (!acc[f.creator]) acc[f.creator] = [];
    acc[f.creator].push(f);
    return acc;
  }, {});
  Object.entries(byCreator).filter(([_, fs]) => fs.length >= 2).slice(0, 3).forEach(([creator, fs]) => {
    shelves.push({
      id: `creator-${creator}`,
      title: `From ${creator}`,
      subtitle: `${fs.length} titles · follow for new drops`,
      filmIds: fs.map(f => f.id),
    });
  });

  return (
    <div>
      <PageIntro {...introCopy} count={list.length} kind={slug}/>
      {hero && <GenreHero film={hero} slug={slug}/>}
      <GenreStatsStrip list={list} slug={slug}/>
      {shelves.map((s, i) => (
        <React.Fragment key={s.id}>
          <Shelf shelf={s}/>
          {/* Promo break after the 2nd shelf */}
          {i === 1 && <PromoBreak slug={slug}/>}
        </React.Fragment>
      ))}
      {/* If empty, fallback */}
      {!list.length && (
        <div style={{ padding: "80px var(--gutter)", textAlign: "center", color: "var(--c-ink-3)" }}>
          No titles in this category yet.
        </div>
      )}
      <div style={{ height: 64 }}/>
    </div>
  );
}

function PromoBreak({ slug }) {
  const isSeries = slug === "series";
  return (
    <section style={{
      margin: "20px var(--gutter) 28px",
      padding: "26px 32px",
      background: "linear-gradient(105deg, rgba(var(--accent-rgb),.12) 0%, rgba(var(--accent-rgb),.02) 50%, transparent 100%)",
      border: "1px solid rgba(var(--accent-rgb),.25)",
      borderRadius: "var(--r-2)",
      display: "flex", alignItems: "center", gap: 24,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(var(--accent-rgb),.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        color:  "var(--c-amber)",
      }}>
        <Icon name="ticket" size={24}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 4 }}>EARN WHILE YOU WATCH</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>
          Co-finance the {isSeries ? "next season" : "next film"}
        </div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 4 }}>
          Buy an NFT stake · watch first · earn a share of revenue · vote on creative decisions.
        </div>
      </div>
      <button
        onClick={() => navigate("/producers")}
        className="btn"
        style={{
          background: "var(--c-amber)", color: "var(--c-on-amber)",
          border: "none", height: 38, padding: "0 18px",
          fontSize: "var(--fs-body)", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}
      >
        Browse projects <Icon name="chev-r" size={12}/>
      </button>
    </section>
  );
}

// Simplified portfolio + NFT pages that use the real watch-data schema
function SimplePortfolio() {
  const totalInvested = USER.holdings.reduce((s, h) => s + (h.costBasis * h.qty * 2700), 0);
  const totalValue = USER.holdings.reduce((s, h) => s + (h.currentPrice * h.qty * 2700), 0);
  const gain = totalValue - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  return (
    <div style={{ padding: "32px var(--gutter) 64px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>YOUR PORTFOLIO</div>
      <h1 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(32px, 8vw, 44px)", margin: "0 0 24px", letterSpacing: "-0.02em" }}>
        Films you've backed
      </h1>

      <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { l: "INVESTED", v: fmtUSD2(totalInvested), s: `${USER.holdings.filter(h=>h.qty>0).length} films` },
          { l: "CURRENT VALUE", v: fmtUSD2(totalValue), s: `${gain >= 0 ? "+" : ""}${gainPct.toFixed(1)}%`, sc: gain >= 0 ? "var(--c-good)" : "var(--c-blood-l)" },
          { l: "ROYALTIES EARNED", v: fmtUSD2(USER.totalEarned), s: "lifetime", hi: true },
          { l: "NEXT PAYOUT", v: "Jun 1", s: `est. ${fmtUSD2(USER.pendingClaim)}` },
        ].map((b, i) => (
          <div key={i} style={{
            padding: 18,
            background: b.hi ? "linear-gradient(180deg, rgba(var(--accent-rgb),.05) 0%, var(--c-panel) 100%)" : "var(--c-panel)",
            border: b.hi ? "1px solid rgba(var(--accent-rgb),.3)" : "1px solid var(--c-line)",
            borderRadius: "var(--r-2)",
          }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>{b.l}</div>
            <div className="t-num" style={{ fontSize: "var(--fs-head)", fontWeight: 600, lineHeight: 1, color: b.hi ? "var(--c-amber)" : "var(--c-ink)", fontFamily: "var(--f-display)" }}>{b.v}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: b.sc || "var(--c-ink-3)", marginTop: 6, fontWeight: b.sc ? 600 : 400 }}>{b.s}</div>
          </div>
        ))}
      </div>

      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: "0 0 14px" }}>Your holdings</h2>
      <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", marginBottom: 28 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
          padding: "10px 18px", background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)",
          fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", fontFamily: "var(--f-mono)",
        }}>
          <div>FILM</div><div>TIER</div><div>HELD</div><div>COST</div><div>VALUE</div><div>EARNED</div>
        </div>
        {USER.holdings.filter(h => h.qty > 0).map((h, i, arr) => {
          const project = NFT_PROJECTS[h.projectId];
          const film = CATALOG.find(f => f.nft === h.projectId);
          const cost = h.costBasis * h.qty * 2700;
          const value = h.currentPrice * h.qty * 2700;
          const valuePct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
          return (
            <button key={i} onClick={() => navigate(`/nft/${h.projectId}`)} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
              padding: "12px 18px", border: "none", background: "transparent",
              borderBottom: i < arr.length - 1 ? "1px solid var(--c-line)" : "none",
              fontSize: "var(--fs-body)", alignItems: "center", textAlign: "left", color: "var(--c-ink)", cursor: "pointer", width: "100%",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 56, height: 32, borderRadius: "var(--r-1)", overflow: "hidden", background: film?.color || "var(--c-panel-2)", flexShrink: 0 }}>
                  {film && <FrameThumb kind={film.thumb} usePhoto/>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)" }}>{project?.title}</div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{project?.creator}</div>
                </div>
              </div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", fontWeight: 600, textTransform: "uppercase" }}>{h.tier}</div>
              <div className="t-num">{h.qty}×</div>
              <div className="t-num" style={{ color: "var(--c-ink-2)" }}>{fmtUSD2(cost)}</div>
              <div>
                <div className="t-num" style={{ fontWeight: 600 }}>{fmtUSD2(value)}</div>
                <div className="t-num" style={{ fontSize: "var(--fs-label)", color: valuePct >= 0 ? "var(--c-good)" : "var(--c-blood-l)" }}>{valuePct >= 0 ? "+" : ""}{valuePct.toFixed(1)}%</div>
              </div>
              <div className="t-num" style={{ color: "var(--c-amber)", fontWeight: 600 }}>{fmtUSD2(h.earned)}</div>
            </button>
          );
        })}
      </div>

      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: "0 0 14px" }}>Recent royalty payouts</h2>
      <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
        {USER.txHistory.filter(t => t.kind === "royalty").map((r, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: i < arr.length - 1 ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ width: 38, textAlign: "center" }}>
              <div className="t-mono t-num" style={{ fontSize: "var(--fs-body)", fontWeight: 600, lineHeight: 1 }}>{r.d.split("-")[2]}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2 }}>
                {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][parseInt(r.d.split("-")[1]) - 1]}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)" }}>{NFT_PROJECTS[r.project]?.title}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{r.desc}</div>
            </div>
            <div className="t-num" style={{ color: "var(--c-good)", fontWeight: 600, fontSize: "var(--fs-body)" }}>+{fmtUSD2(r.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleNFTPage({ projectId }) {
  const project = NFT_PROJECTS[projectId];
  const film = project ? CATALOG.find(f => f.nft === project.id) : null;
  if (!project) return (
    <NotFoundPage
      kicker="Producer pass not found"
      title="No pass with that ID."
      body={projectId ? `We couldn't find a producer pass for "${projectId}". The offering may have closed.` : "No project ID was provided in the URL."}
      cta={{ label: "Browse open offerings", href: "/producers" }}
    />
  );
  return <UnifiedNFTPage project={project} film={film} navigate={navigate} onBack={() => navigate("/browse")} showHolderHub={true}/>;
}

// ─── Reusable not-found / empty-state page ───────────────────────────────
function NotFoundPage({ kicker = "Page not found", title, body, cta }) {
  return (
    <div style={{
      maxWidth: 640, margin: "0 auto", padding: "120px var(--gutter)",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
        letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600,
        marginBottom: 18,
      }}>{kicker}</div>
      <h1 style={{
        fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400,
        fontSize: "var(--fs-display)", lineHeight: 1.0, letterSpacing: "-0.02em",
        margin: "0 0 18px", color: "var(--c-ink)", textWrap: "balance",
      }}>{title}</h1>
      {body && (
        <p style={{
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: "var(--fs-lead)", lineHeight: 1.5, color: "var(--c-ink-2)",
          margin: "0 auto 32px", maxWidth: 480,
        }}>{body}</p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {cta && (
          <button onClick={() => navigate(cta.href)} className="btn btn-primary" style={{ height: 40, padding: "0 18px" }}>
            {cta.label} →
          </button>
        )}
        <button onClick={() => navigate("/")} className="btn" style={{ height: 40, padding: "0 18px" }}>
          Back to home
        </button>
      </div>
    </div>
  );
}

// ─── Top-level error boundary — prevents a single page crash from killing the app
class WatchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Log but don't bubble — we'd rather show a graceful fallback than blank.
    if (typeof console !== "undefined") console.error("[Watch] route render failed:", error, info);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.routeKey !== this.props.routeKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      const msg = (this.state.error && this.state.error.message) || "Something rendered incorrectly.";
      return (
        <NotFoundPage
          kicker="Something went wrong"
          title={window.cinaVoice ? window.cinaVoice("error.crash") : "This page didn't render cleanly."}
          body={`${msg} You can keep browsing — most of Cina is still working.`}
        />
      );
    }
    return this.props.children;
  }
}

// ─── Router ──────────────────────────────────────────────────────────────
function WatchRoot() {
  const route = useRoute();
  const [p0, p1, p2, p3] = route.parts;

  const [layout, setLayout] = usWA(() => window.__cinaLayout || "premiere");
  ueWA(() => { const h = () => setLayout(window.__cinaLayout || "premiere"); window.addEventListener("cina:layout", h); return () => window.removeEventListener("cina:layout", h); }, []);
  let page;
  if (!p0 || p0 === "browse") page = <SplashPage/>;
  else if (p0 === "film")     page = <WatchPage filmId={p1}/>;
  else if (p0 === "branches" && p1) page = <BranchedFilmPage filmId={p1}/>;
  else if (p0 === "branches") page = <GenrePage slug="branched"/>;
  else if (p0 === "royalty")  page = <RoyaltyPoolPage/>;
  else if (p0 === "series" && p2 === "ep") page = <WatchPage filmId={p1} episodeNum={parseInt(p3)}/>;
  else if (p0 === "series")   page = <SeriesPage seriesId={p1}/>;
  // Profile + site are merged — ONE noun: studio. /studios/:id and /creator/:id
  // both render the standard studio profile; /site/:id is the studio's own
  // published website from the builder.
  else if (p0 === "creator")  page = <StudioProfilePage id={p1}/>;
  // Studios index — /studios is canonical; /creators kept as alias for saved links.
  else if (p0 === "creators") page = <StudiosIndexPage/>;
  else if (p0 === "genre")    page = <GenrePage slug={p1}/>;
  else if (p0 === "shelf")    page = <ShelfPage shelfId={p1}/>;
  else if (p0 === "nft")      page = <SimpleNFTPage projectId={p1}/>;
  else if (p0 === "wallet" && p1 === "buy") page = <BuyCryptoPage/>;
  else if (p0 === "wallet")   page = <SimplePortfolio/>;
  else if (p0 === "watchlist") page = <WatchlistPage/>;
  else if (p0 === "library")  page = <LibraryPage/>;
  else if (p0 === "taste")    page = <TastePrintPage/>;
  else if (p0 === "history")  page = <HistoryPage/>;
  else if (p0 === "search")   page = <SearchResultsPage/>;
  else if (p0 === "apply")    page = <ApplyPage/>;
  else if (p0 === "account")  page = <AccountPage/>;
  else if (p0 === "payouts")  page = <PayoutsPage/>;
  else if (p0 === "leaderboard") page = <LeaderboardPage/>;
  else if (p0 === "party")    page = <WatchPartyPage filmId={p1}/>;
  else if (p0 === "premiere") page = <PremierePage filmId={p1}/>;
  else if (p0 === "settings" && p1 === "family") page = <ParentalControlsPage/>;
  else if (p0 === "settings") page = <AccountPage/>;
  else if (p0 === "build")    page = <CreatorBuilder creatorId={p1 || "voss"}/>;
  else if (p0 === "site")     page = <StudioSitePage id={p1 || "voss"} sub={p2} slug={p3}/>;
  else if (p0 === "auctions" && p1) page = <AuctionDetailPage auctionId={p1}/>;
  else if (p0 === "auctions") page = <AuctionMarketPage/>;
  else if (p0 === "auction")  page = <AuctionDetailPage auctionId={p1}/>;
  else if (p0 === "cast" && p1 && p2 === "studio") page = <ActorAIStudio id={p1}/>;
  else if (p0 === "journey" && p1)  page = <ActorCareerJourney id={p1}/>;
  else if (p0 === "cast" && p1)    page = <ActorProfilePage id={p1}/>;
  else if (p0 === "cast")          page = <CastIndexPage/>;
  else if (p0 === "mint")     page = <DirectorMintPage filmId={p1}/>;
  else if (p0 === "notifications") page = <CinaNotifPage/>;
  else if (p0 === "studios" && p1 && p2 === "token") page = <window.StudioTokenPage studioId={p1}/>;
  else if (p0 === "studios" && p1) page = <StudioProfilePage id={p1}/>;
  else if (p0 === "studios")  page = <StudiosIndexPage/>;
  else if (p0 === "kids")     page = <GenrePage slug="kids"/>;
  else if (p0 === "talent" && p1) page = <ActorCareerJourney id={p1}/>;
  else if (p0 === "talent")   page = <CastIndexPage/>;
  else if (p0 === "tokens")   page = <StudioTokenMarketplace/>;
  else if (p0 === "about" && p1 === "blog" && p2) page = <CompanyBlogPostPage slug={p2}/>;
  else if (p0 === "about" && p1 === "blog")    page = <CompanyBlogPage/>;
  else if (p0 === "about" && p1 === "press")   page = <CompanyPressPage/>;
  else if (p0 === "about" && p1 === "careers") page = <CompanyCareersPage/>;
  else if (p0 === "about" && p1 === "contact") page = <CompanyContactPage/>;
  else if (p0 === "about" && p1 === "found")   page = <CompanyFoundStudioPage/>;
  else if (p0 === "about")    page = <GenericAboutPage slug={p1 || ""}/>;
  else if (p0 === "cuts" && p1) page = <window.CutRentalsPage filmId={p1}/>;
  else if (p0 === "festival" && p1 === "film" && route.parts[2]) page = <window.FestivalFilmPage filmId={route.parts[2]}/>;
  else if (p0 === "festival") page = <FestivalPage/>;
  else if (p0 === "rooms")    page = <HolderRoomsPage/>;
  else if (p0 === "producers") page = <ProducersMarketPage/>;
  else if (p0 === "help")     page = <HelpCenterPage/>;
  else if (p0 === "download") page = <DownloadPage/>;
  // Known destinations the menus/footer imply but that aren't built yet — show
  // a branded "coming soon" placeholder instead of silently dropping to home.
  else if (PLACEHOLDER_ROUTES[p0]) {
    const pl = PLACEHOLDER_ROUTES[p0];
    page = <NotFoundPage kicker={pl.kicker} title={pl.title} body={pl.body} cta={pl.cta}/>;
  }
  // Anything else is a genuine dead route — a real not-found, never the splash.
  else page = (
    <NotFoundPage
      kicker="Page not found"
      title={window.cinaVoice ? window.cinaVoice("error.route", p0) : "There's nothing at this address."}
      body="The link may be old, or the page hasn't shipped yet. Everything still standing is one tap away."
      cta={{ label: "Browse films", href: "/genre/film" }}
    />
  );

  // Premiere layout — the shared page system.
  if (layout === "premiere" && window.PmHome) {
    const p2x = route.parts[2];
    if (!p0 || p0 === "browse") page = <PmHome/>;
    else if (p0 === "catalog") page = <PmGenre slug="all"/>;
    else if (p0 === "genre" && p1) page = <PmGenre slug={p1}/>;
    else if (p0 === "kids") page = <PmGenre slug="kids"/>;
    else if (p0 === "branches" && !p1) page = <PmGenre slug="branched"/>;
    else if (p0 === "shelf") page = <PmShelf shelfId={p1}/>;
    else if (p0 === "series" && p1 && !p2x) page = <PmSeries seriesId={p1}/>;
    else if ((p0 === "studios" || p0 === "creators") && !p1) page = <PmStudios/>;
    else if (p0 === "studios" && p1 && !p2x) page = <PmStudioProfile id={p1}/>;
    else if ((p0 === "cast" || p0 === "talent") && !p1) page = <PmCastIndex/>;
    else if (p0 === "cast" && p1 && !p2x && window.PmCastProfile) page = <PmCastProfile id={p1}/>;
    else if (p0 === "library" && !p1 && window.PmLibrary) page = <PmLibrary/>;
    else if (p0 === "search" && window.PmSearch) page = <PmSearch/>;
    else if (p0 === "festival" && !p1 && window.PmFestival) page = <PmFestival/>;
    else if ((p0 === "account" || (p0 === "settings" && !p1)) && window.PmAccount) page = <PmAccount/>;
    else if (p0 === "help" && window.PmHelp) page = <PmHelp/>;
    else if ((p0 === "producers" || p0 === "portfolio") && !p1 && window.PmWallet) page = <PmWallet/>;
    else if (p0 === "nft" && p1 && window.PmNFT) page = <PmNFT projectId={p1}/>;
    else if (p0 === "film" && p1 && window.PmFilm) page = <PmFilm filmId={p1}/>;
    else if (p0 === "wallet" && !p1 && window.PmWallet) page = <PmWallet/>;
    else if (p0 === "auctions" && !p1 && window.PmAuctions) page = <PmAuctions/>;
    else if (p0 === "watchlist" && window.PmWatchlist) page = <PmWatchlist/>;
    else if (p0 === "history" && window.PmHistory) page = <PmHistory/>;
    else if (p0 === "leaderboard" && window.PmLeaderboard) page = <PmLeaderboard/>;
    else if (p0 === "payouts" && window.PmPayouts) page = <PmPayouts/>;
    else if ((p0 === "auction" || p0 === "auctions") && p1 && window.PmAuctionDetail) page = <PmAuctionDetail auctionId={p1}/>;
    else {
      const immersive = (p0 === "series" && p2x === "ep") || p0 === "party" || p0 === "premiere" || p0 === "journey" || (p0 === "talent" && p1) || p0 === "build" || p0 === "site" || p0 === "creator";
      if (!immersive && window.PmFrame) page = <PmFrame>{page}</PmFrame>;
    }
  }

  // No unsolicited arrival popups — onboarding opens only when explicitly requested
  const [showOnboard, setShowOnboard] = usWA(false);
  window.openCinaOnboarding = () => setShowOnboard(true);

  // Routes that look like a standalone studio website — hide Cina chrome.
  const whiteLabel = p0 === "creator" || p0 === "build" || p0 === "site";

  // The immersive video surfaces — the player and live co-watch / premiere
  // experiences. These run edge-to-edge and must NOT carry the site footer.
  const isPlayer =
    (p0 === "film" && layout !== "premiere") ||
    (p0 === "series" && p2 === "ep") ||
    p0 === "party" ||
    p0 === "premiere" ||
    p0 === "journey" ||
    (p0 === "talent" && p1);
  const showFooter = !whiteLabel && !isPlayer && typeof SiteFooter === "function";

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)" }}>
      {!whiteLabel && <TopNav/>}
      {!whiteLabel && typeof FestivalBanner === "function" && <FestivalBanner/>}
      <main id="main-content" tabIndex={-1} style={{ outline: "none" }}>
        <WatchErrorBoundary routeKey={route.parts.join("/")}>{page}</WatchErrorBoundary>
      </main>
      {showFooter && <SiteFooter/>}
      <ToastHost/>
      <FlowsHost/>
      {!whiteLabel && typeof WatchCommandPalette === "function" && <WatchCommandPalette/>}
      {showOnboard && !whiteLabel && <OnboardingFlow onFinish={() => setShowOnboard(false)}/>}
      {typeof CinaDesignCheck === "function" && <CinaDesignCheck/>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<WatchRoot/>);
