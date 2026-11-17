// watch-genre-v2.jsx — Redesigned Films / Series / genre index pages.
//
// Replaces the old GenrePage (PageIntro dead-band + single static hero +
// stat strip + plain shelves) with:
//
//   • NO top dead band — the page opens straight into a cinematic hero.
//   • Section switcher baked into the hero (Films · Series · Branched).
//   • Auto-rotating featured carousel (top 3) with crossfade + dots.
//   • Sticky toolbar: genre filter chips · sort · Rails/Grid view toggle.
//   • Ranked "trending" rail with oversized Fraunces numerals.
//   • Dynamic shelves (reuse window.Shelf) OR a responsive poster grid.
//
// Overrides window.GenrePage. Route /genre/:slug uses the bare identifier,
// which resolves to this reassigned global.

const { useState: usG2, useEffect: ueG2, useMemo: umG2, useRef: urG2 } = React;

// ─── Section meta ──────────────────────────────────────────────────────

const GENRE_SECTIONS = {
  film:   { label: "Films",  eyebrow: "ALL ORIGINALS", route: "/genre/film",
            lede: "Every Cina original film — sorted by what the room is watching tonight, not by what shipped last." },
  series: { label: "Series", eyebrow: "EPISODIC · WEEKLY DROPS", route: "/genre/series",
            lede: "Episodic originals that drop a chapter a week. Start a season; the room votes on where some of them go." },
  branched: { label: "Branched", eyebrow: "⑂ VOTE AT EVERY FORK", route: "/branches",
            lede: "Films with live decision points. The room votes at every fork — the majority becomes canon, your picks become your cut." },
  kids:   { label: "Kids", eyebrow: "G & PG ONLY · HUMAN-REVIEWED", route: "/kids",
            lede: "Safe by design, good by taste. Every rating is reviewed by a human programmer — the Kids zone shows G and PG only." },
};

function gFilms(slug) {
  if (typeof CATALOG === "undefined") return [];
  if (slug === "series") return CATALOG.filter(f => f.kind === "series");
  if (slug === "film")   return CATALOG.filter(f => f.kind !== "series");
  if (slug === "branched") return CATALOG.filter(f => f.branched || (window.BRANCH_FILMS && window.BRANCH_FILMS[f.id]));
  if (slug === "kids")   return CATALOG.filter(f => f.cert === "G" || f.cert === "PG");
  if (slug === "premiere") return CATALOG.filter(f => f.nftPremiere);
  return CATALOG.filter(f => (f.genre || []).some(g => g.toLowerCase().includes(slug)));
}

// Canonical destination for a title — branched rooms beat plain film pages.
function gDest(f) {
  if (f.branched || (window.BRANCH_FILMS && window.BRANCH_FILMS[f.id])) return `/branches/${f.id}`;
  return f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`;
}

// ─── Main page ─────────────────────────────────────────────────────────

function GenrePageV2({ slug }) {
  const all = umG2(() => gFilms(slug), [slug]);
  const [genre, setGenre] = usG2("All");
  const [sort, setSort] = usG2("trending");
  const [view, setView] = usG2("rails");
  const [heroIdx, setHeroIdx] = usG2(0);

  const isSeries = slug === "series";
  const sec = GENRE_SECTIONS[slug] || { label: slug.charAt(0).toUpperCase() + slug.slice(1), eyebrow: "BY GENRE" };

  // genres present
  const genres = umG2(() => ["All", ...[...new Set(all.flatMap(f => f.genre || []))].sort()], [all]);

  // filtered + sorted
  const list = umG2(() => {
    let l = genre === "All" ? all : all.filter(f => (f.genre || []).includes(genre));
    const by = {
      trending: (a, b) => (b.rating * (b.views || 0)) - (a.rating * (a.views || 0)),
      newest:   (a, b) => (b.year || 0) - (a.year || 0),
      rated:    (a, b) => (b.rating || 0) - (a.rating || 0),
      az:       (a, b) => a.title.localeCompare(b.title),
    };
    return [...l].sort(by[sort] || by.trending);
  }, [all, genre, sort]);

  // top 3 for hero carousel (always from full set, trending)
  const heroFilms = umG2(() => [...all].sort((a, b) => (b.rating * (b.views || 0)) - (a.rating * (a.views || 0))).slice(0, 3), [all]);

  // auto-advance hero
  ueG2(() => {
    if (heroFilms.length < 2) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroFilms.length), 6500);
    return () => clearInterval(t);
  }, [heroFilms.length]);

  // shelves for rails view (respect active genre filter)
  const shelves = umG2(() => {
    const out = [];
    const base = genre === "All" ? all : list;
    const sorted = [...base].sort((a, b) => (b.rating * (b.views || 0)) - (a.rating * (a.views || 0)));
    out.push({ id: "trending", title: "Trending now", subtitle: "Most-watched this week", ranked: true, filmIds: sorted.slice(0, 10).map(f => f.id) });
    const fresh = base.filter(f => f.tags?.includes("new") || (f.year >= 2026));
    if (fresh.length) out.push({ id: "new", title: "New & noteworthy", subtitle: "Fresh from creators · 2026", filmIds: fresh.map(f => f.id) });
    const prem = base.filter(f => f.nftPremiere);
    if (prem.length) out.push({ id: "prem", title: "Premiere access", subtitle: "NFT holders watch first · 24–72h early", filmIds: prem.map(f => f.id) });
    const free = base.filter(f => f.free);
    if (free.length) out.push({ id: "free", title: "Free to watch", subtitle: "No subscription · ad-supported", filmIds: free.map(f => f.id) });
    if (genre === "All") {
      [...new Set(base.flatMap(f => f.genre || []))].slice(0, 6).forEach(g => {
        const gf = base.filter(f => (f.genre || []).includes(g));
        if (gf.length >= 2) out.push({ id: "g-" + g, title: g, subtitle: `${gf.length} ${isSeries ? "series" : "films"}`, filmIds: gf.map(f => f.id) });
      });
    }
    // creators
    const byC = base.reduce((a, f) => { (a[f.creator] = a[f.creator] || []).push(f); return a; }, {});
    Object.entries(byC).filter(([, fs]) => fs.length >= 2).slice(0, 2).forEach(([c, fs]) =>
      out.push({ id: "c-" + c, title: `From ${c}`, subtitle: `${fs.length} titles · follow for new drops`, filmIds: fs.map(f => f.id) }));
    return out;
  }, [all, list, genre, isSeries]);

  if (!all.length) {
    return <div style={{ padding: "120px var(--gutter)", textAlign: "center", color: "var(--c-ink-3)" }}>No titles in this category yet.</div>;
  }

  return (
    <div style={{ background: "var(--c-bg)" }}>
      <GenreHeroV3 films={heroFilms} idx={heroIdx} setIdx={setHeroIdx} sec={sec} slug={slug} count={all.length}/>
      <GenreToolbar
        genres={genres} genre={genre} setGenre={setGenre}
        sort={sort} setSort={setSort} view={view} setView={setView}
        count={list.length} isSeries={isSeries}
      />
      {slug === "branched" ? (
        <BranchedRoomGrid list={list}/>
      ) : view === "rails" ? (
        <div style={{ paddingTop: 8 }}>
          {shelves.map((s, i) => (
            <React.Fragment key={s.id}>
              {s.ranked ? <RankedRail shelf={s}/> : (window.Shelf ? <window.Shelf shelf={s}/> : null)}
              {i === 1 && <GenrePromo isSeries={isSeries} slug={slug}/>}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <PosterGrid list={list} isSeries={isSeries}/>
      )}
      <div style={{ height: 64 }}/>
    </div>
  );
}

// ─── Hero carousel ─────────────────────────────────────────────────────

function GenreHeroV3({ films, idx, setIdx, sec, slug, count }) {
  if (!films.length) return null;
  const film = films[idx] || films[0];
  const isSeries = film.kind === "series";

  return (
    <section style={{ position: "relative", width: "100%", height: 600, overflow: "hidden", background: tkc("black"), borderBottom: "1px solid var(--c-line)" }}>
      {/* Crossfading backgrounds */}
      {films.map((f, i) => (
        <div key={f.id} style={{
          position: "absolute", inset: 0,
          opacity: i === idx ? 1 : 0, transition: "opacity 1.1s ease",
          background: f.color,
        }}>
          <FrameThumb kind={f.thumb} usePhoto/>
          {/* slow zoom */}
          <div style={{ position: "absolute", inset: 0, animation: i === idx ? "g2KenBurns 12s ease-out forwards" : "none" }}/>
        </div>
      ))}

      {/* Gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,8,10,.96) 0%, rgba(8,8,10,.72) 38%, rgba(8,8,10,.12) 72%, transparent 100%), linear-gradient(0deg, rgba(8,8,10,.92) 0%, transparent 46%)" }}/>

      {/* Section switcher — top */}
      <div style={{ position: "absolute", top: 24, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 12, zIndex: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", gap: 2, padding: 3, background: "rgba(8,8,10,.55)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 999, backdropFilter: "blur(10px)" }}>
          {[["film", "Films"], ["series", "Series"], ["branched", "Branched"], ["kids", "Kids"]].map(([k, l]) => {
            const active = (slug === k);
            const to = k === "branched" ? "/branches" : k === "kids" ? "/kids" : `/genre/${k}`;
            return (
              <button key={k} onClick={() => navigate(to)} style={{
                padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                background: active ? "var(--c-amber)" : "transparent",
                color: active ? tkc("on-amber") : "rgba(255,255,255,.7)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>{l}</button>
            );
          })}
        </div>
        <span style={{ flex: 1 }}/>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", fontWeight: 500, lineHeight: 1 }}>{count}</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)", letterSpacing: ".16em" }}>{slug === "branched" ? "ROOMS" : isSeries ? "SERIES" : "TITLES"}</span>
        </span>
        </div>
        {sec.lede && (
          <p style={{ margin: 0, maxWidth: 560, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.4, color: "rgba(255,255,255,.82)", letterSpacing: "-0.01em", textShadow: "0 2px 10px rgba(0,0,0,.75)" }}>{sec.lede}</p>
        )}
      </div>

      {/* Content */}
      <div style={{ position: "absolute", left: 56, bottom: 52, maxWidth: 680, display: "flex", flexDirection: "column", gap: 16, zIndex: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 30, height: 2, background: "var(--c-amber)" }}/>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700 }}>{sec.eyebrow}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", padding: "4px 8px", border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: "var(--r-1)", background: "rgba(var(--accent-rgb),.08)" }}>FEATURED</span>
          {isSeries && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em", padding: "4px 8px", background: "rgba(255,255,255,.1)", borderRadius: "var(--r-1)" }}>S{film.season} · {film.totalEpisodes} EP</span>}
          {film.nftPremiere && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", padding: "4px 8px", background: "rgba(var(--accent-rgb),.12)", borderRadius: "var(--r-1)" }}>◇ {film.premiereHrs}H EARLY</span>}
        </div>
        <h1 key={film.id} className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", fontWeight: 500, margin: 0, lineHeight: .92, letterSpacing: "-0.02em", color: tkc("white"), textShadow: "0 4px 30px rgba(0,0,0,.6)", animation: "g2RiseIn .6s ease-out" }}>{film.title}</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "rgba(255,255,255,.72)", letterSpacing: ".08em", flexWrap: "wrap" }}>
          <span>{(film.creator || "").toUpperCase()}</span><Dot/><span>{film.year}</span><Dot/><span>{(film.genre || []).join(" / ")}</span><Dot/><span style={{ color: "var(--c-amber)" }}>★ {film.rating}</span>
        </div>
        {film.logline && <p style={{ margin: 0, fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.86)", lineHeight: 1.5, maxWidth: 540, fontFamily: "var(--f-display)", fontStyle: "italic" }}>{film.logline}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button onClick={() => navigate(gDest(film))} style={{ height: 42, padding: "0 24px", background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)", fontWeight: 700, fontSize: "var(--fs-body)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase" }}>▶ {film.branched ? "Enter the room" : isSeries ? "Watch series" : "Watch film"}</button>
          <button onClick={() => navigate(gDest(film))} style={{ height: 42, padding: "0 18px", background: "rgba(0,0,0,.5)", color: tkc("white"), border: "1px solid rgba(255,255,255,.25)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", cursor: "pointer", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase" }}>+ Watchlist</button>
        </div>
      </div>

      {/* Live + dots — bottom right */}
      <div style={{ position: "absolute", right: 56, bottom: 52, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16, zIndex: 3 }}>
        <div style={{ padding: "10px 14px", background: "rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "var(--r-2)", backdropFilter: "blur(10px)", minWidth: 150 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)", letterSpacing: ".16em" }}>WATCHING NOW</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), fontWeight: 500, lineHeight: 1.1 }}>{fmtCount(Math.floor((film.views || 50000) / 1000))}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-label)", color: "var(--c-good)", fontFamily: "var(--f-mono)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)" }}/>LIVE · TRENDING
          </div>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {films.map((f, i) => (
            <button key={f.id} onClick={() => setIdx(i)} style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer", background: i === idx ? "var(--c-amber)" : "rgba(255,255,255,.3)", transition: "width .3s, background .3s" }}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes g2RiseIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes g2KenBurns { from { transform: scale(1) } to { transform: scale(1.06) } }
      `}</style>
    </section>
  );
}

function Dot() { return <span style={{ color: "var(--c-ink-4)" }}>·</span>; }

// ─── Sticky toolbar ────────────────────────────────────────────────────

function GenreToolbar({ genres, genre, setGenre, sort, setSort, view, setView, count, isSeries }) {
  const sorts = [["trending", "Trending"], ["newest", "Newest"], ["rated", "Top rated"], ["az", "A–Z"]];
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "rgba(13,14,16,.94)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--c-line)",
      padding: "12px var(--gutter)",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      {/* Genre chips */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, scrollbarWidth: "none" }}>
        {genres.map(g => {
          const active = genre === g;
          return (
            <button key={g} onClick={() => setGenre(g)} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 999, cursor: "pointer",
              background: active ? "var(--c-ink)" : "transparent",
              color: active ? "var(--c-bg)" : "var(--c-ink-2)",
              border: `1px solid ${active ? "var(--c-ink)" : "var(--c-line-2)"}`,
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, whiteSpace: "nowrap",
            }}>{g === "All" ? `All ${count}` : g}</button>
          );
        })}
      </div>

      {/* Sort */}
      <div style={{ display: "flex", gap: 2, padding: 2, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", flexShrink: 0 }}>
        {sorts.map(([k, l]) => (
          <button key={k} onClick={() => setSort(k)} style={{
            padding: "6px 11px", borderRadius: "var(--r-1)", border: "none", cursor: "pointer",
            background: sort === k ? "var(--c-panel-3)" : "transparent",
            color: sort === k ? "var(--c-amber)" : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600, whiteSpace: "nowrap",
          }}>{l}</button>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 2, padding: 2, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", flexShrink: 0 }}>
        {[["rails", "▭ Rails"], ["grid", "▦ Grid"]].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{
            padding: "6px 11px", borderRadius: "var(--r-1)", border: "none", cursor: "pointer",
            background: view === k ? "var(--c-panel-3)" : "transparent",
            color: view === k ? "var(--c-amber)" : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600, whiteSpace: "nowrap",
          }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Ranked rail (oversized numerals) ──────────────────────────────────

function RankedRail({ shelf }) {
  const ref = urG2(null);
  const films = shelf.filmIds.map(getFilm).filter(Boolean);
  if (!films.length) return null;
  const scroll = (d) => { const el = ref.current; if (el) el.scrollBy({ left: d * el.clientWidth * 0.7, behavior: "smooth" }); };
  return (
    <section style={{ padding: "28px var(--gutter) 14px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 18 }}>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, margin: 0, color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{shelf.title}</h2>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase", paddingLeft: 12, borderLeft: "1px solid var(--c-line-2)" }}>{shelf.subtitle}</span>
      </div>
      <CarouselRail fade="var(--c-bg)" gap={8} padY={12} arrowOffset={-8}>
          {films.map((f, i) => {
            return (
              <button key={f.id} onClick={() => navigate(gDest(f))} style={{
                flex: "0 0 auto", display: "flex", alignItems: "flex-end", gap: 0,
                background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "inherit",
              }}>
                {/* Big rank numeral */}
                <span style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500,
                  fontSize: "var(--fs-display)", lineHeight: 0.7, color: "transparent",
                  WebkitTextStroke: "1.5px var(--c-line-3)",
                  marginRight: -18, marginBottom: 4, userSelect: "none",
                }}>{i + 1}</span>
                {/* Poster */}
                <div style={{ width: 184, position: "relative", borderRadius: "var(--r-2)", overflow: "hidden", aspectRatio: "2/3", background: f.color, border: "1px solid var(--c-line-2)" }}>
                  <FrameThumb kind={f.thumb} usePhoto/>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,8,10,.92) 0%, transparent 50%)" }}/>
                  <div style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), fontWeight: 500, lineHeight: 1.05 }}>{f.title}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.6)", letterSpacing: ".16em", marginTop: 3 }}>{(f.genre || [])[0]} · ★ {f.rating}</div>
                  </div>
                </div>
              </button>
            );
          })}
      </CarouselRail>
    </section>
  );
}

// ─── Branched rooms grid — uses the shared site-wide BranchedRoomCard ────
function BranchedRoomGrid({ list }) {
  const rooms = (list || []).filter(f => window.BRANCH_FILMS && window.BRANCH_FILMS[f.id]);
  if (!rooms.length) return <div style={{ padding: "80px var(--gutter)", textAlign: "center", color: "var(--c-ink-3)" }}>No live rooms right now.</div>;
  return (
    <section style={{ padding: "28px var(--gutter)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {rooms.map(f => window.BranchedRoomCard
          ? <window.BranchedRoomCard key={f.id} id={f.id} film={f} br={window.BRANCH_FILMS[f.id]}/>
          : null)}
      </div>
    </section>
  );
}

// ─── Poster grid view ──────────────────────────────────────────────────

function PosterGrid({ list, isSeries }) {
  return (
    <section style={{ padding: "28px var(--gutter)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 18 }}>
        {list.map(f => {
          const series = f.kind === "series";
          const topLeft = [
            series && (window.TileBadge ? <window.TileBadge key="s">S{f.season} · {f.totalEpisodes} EP</window.TileBadge> : null),
            f.tags?.includes("new") && (window.TileBadge ? <window.TileBadge key="n" kind="alert">NEW</window.TileBadge> : null),
            f.free && (window.TileBadge ? <window.TileBadge key="f" kind="good">FREE</window.TileBadge> : null),
          ].filter(Boolean);
          const topRight = f.nftPremiere && window.TileBadge ? <window.TileBadge kind="live" icon="ticket">{f.premiereHrs}H EARLY</window.TileBadge> : null;
          return (
            <window.FilmTile key={f.id}
              thumb={f.thumb} color={f.color} title={f.title}
              subtitle={`${f.creator} · ${(f.genre || [])[0]}`}
              topLeft={topLeft} topRight={topRight}
              onClick={() => navigate(gDest(f))}
            />
          );
        })}
      </div>
    </section>
  );
}

// ─── Promo break ───────────────────────────────────────────────────────

function GenrePromo({ isSeries, slug }) {
  // The co-finance upsell has no place on the Kids page — show parents the
  // controls instead.
  if (slug === "kids") {
    return (
      <section style={{ margin: "20px var(--gutter) 28px", padding: "26px 32px", background: "linear-gradient(105deg, rgba(95,165,106,.12) 0%, rgba(95,165,106,.02) 50%, transparent 100%)", border: "1px solid rgba(95,165,106,.3)", borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(95,165,106,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: tkc("good"), fontSize: "var(--fs-title)" }}>✓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("good"), letterSpacing: ".16em", marginBottom: 4 }}>FOR PARENTS</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>Kid Mode locks Watch to G & PG</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 4 }}>Every rating reviewed by a human programmer · adult content banned platform-wide · set a PIN to keep it locked.</div>
        </div>
        <button onClick={() => navigate("/settings/family")} style={{ background: tkc("good"), color: tkc("panel"), border: "none", height: 38, padding: "0 18px", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase" }}>Parental controls ›</button>
      </section>
    );
  }
  return (
    <section style={{ margin: "20px var(--gutter) 28px", padding: "26px 32px", background: "linear-gradient(105deg, rgba(var(--accent-rgb),.12) 0%, rgba(var(--accent-rgb),.02) 50%, transparent 100%)", border: "1px solid rgba(var(--accent-rgb),.25)", borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(var(--accent-rgb),.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--c-amber)", fontSize: "var(--fs-title)" }}>◇</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 4 }}>EARN WHILE YOU WATCH</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>Co-finance the {isSeries ? "next season" : "next film"}</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 4 }}>Buy an NFT stake · watch first · earn a share of revenue · vote on creative decisions.</div>
      </div>
      <button onClick={() => navigate("/producers")} style={{ background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", height: 38, padding: "0 18px", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase" }}>Browse projects ›</button>
    </section>
  );
}

// ─── Override ──────────────────────────────────────────────────────────

window.GenrePage = GenrePageV2;
