// watch-splash.jsx — Apple TV × YouTube hybrid: hero billboard, shelves.

const { useState: uss, useEffect: ues, useMemo: ums, useRef: urs } = React;

// ─── Film card (used by shelves) ─────────────────────────────────────────
// Thin wrapper around the canonical <FilmTile> primitive.
function FilmCard({ film, size = "md", showProgress = false, portrait = false, fluid = false }) {
  const isSeries = film.kind === "series";
  // Landscape widths (16/9) — bumped up so carousels feel cinematic.
  const landW = size === "lg" ? 384 : size === "sm" ? 210 : size === "ranked" ? 300 : 300;
  // Portrait widths (2/3 poster) — used by Top 10 / trending, like other pages.
  const portW = size === "lg" ? 248 : size === "sm" ? 168 : 208;
  const W = portrait ? portW : landW;
  const progress = showProgress && isSeries
    ? (film.series?.find(e => e.watched > 0 && e.watched < 1)?.watched || 0)
    : 0;

  // Max TWO badges top-left (cert always; then the single most important
  // status) and ONE top-right — prevents the badge pile-ups that overlapped
  // on smaller tiles.
  const status = film.branched ? <TileBadge key="b" kind="alert">⑂ BRANCHED</TileBadge>
    : isSeries ? <TileBadge key="s">S{film.season} · {film.totalEpisodes} EP</TileBadge>
    : film.tags?.includes("new") ? <TileBadge key="n" kind="alert">NEW</TileBadge>
    : film.free ? <TileBadge key="f" kind="good">FREE</TileBadge>
    : null;
  const topLeft = [
    typeof CertBadge === "function" && film.cert ? <CertBadge key="c" cert={film.cert}/> : null,
    status,
  ];
  const trophy = typeof topTrophy === "function" ? topTrophy(film.id) : null;
  const owned = typeof window.libraryOwns === "function" && window.libraryOwns(film.id);
  const topRight = film.nftPremiere
    ? <TileBadge kind="live" icon="ticket">{film.premiereHrs}H EARLY</TileBadge>
    : owned
    ? <TileBadge kind="good" key="own">✓ IN LIBRARY</TileBadge>
    : null;

  // Premium hover treatment (CSS fades it in — see cina.css):
  //   • a soft dim so the play affordance reads
  //   • a centered amber play button — the tile's primary action
  //   • bottom strip: "Resume" on continue-watching, else a TWO-line
  //     programmer teaser. The poster stays legible through the middle.
  const resumeLabel = isSeries
    ? `Resume · S${film.season || 1} · E${film.currentEp || (film.series?.findIndex(e => e.watched > 0 && e.watched < 1) + 1) || 1}`
    : "Resume watching";
  // Programmer teaser only on LARGE cards — on sm/md tiles the two-line note
  // crowded the thumb, so smaller cards hover with just the play affordance.
  const showNote = size === "lg" && !portrait;
  const progOverlay = (
    <div className="cina-tile-prog" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Soft obsidian vignette on hover */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.92) 0%, rgba(8,8,10,.45) 42%, rgba(8,8,10,.12) 100%)" }}/>
      {/* Bottom editorial bar */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: "24px 12px 10px",
        display: "flex", flexDirection: "column", gap: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 9px", borderRadius: 1,
            background: "rgba(10,10,12,.82)", border: "1px solid rgba(var(--accent-rgb),.5)",
            fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--c-amber)",
          }}>
            <Icon name="play" size={9}/> {showProgress ? resumeLabel : "Watch"}
          </span>
          {film.rating && (
            <span className="t-mono" style={{ fontSize: "0.65rem", color: "var(--c-ink-2)" }}>★ {film.rating}</span>
          )}
        </div>
        {showNote && film.programmerNote && !showProgress && (
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-body)", lineHeight: 1.35, color: tkc("white"),
            letterSpacing: "-0.01em",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", marginTop: 2,
          }}>{film.programmerNote}</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={fluid ? { width: "100%" } : { flex: "0 0 auto", width: W }}>
      <FilmTile
        className="cina-tile-host"
        thumb={film.thumb}
        rating={film.rating}
        color={film.color}
        ratio={portrait ? "2/3" : "16/9"}
        title={film.title}
        subtitle={`${film.creator} · ${film.genre[0]}`}
        trophyFilmId={film.id}
        topLeft={topLeft}
        topRight={topRight}
        overlay={progOverlay}
        progress={progress}
        onClick={() => navigate(film.branched ? `/branches/${film.id}` : isSeries ? `/series/${film.id}` : `/film/${film.id}`)}
      />
    </div>
  );
}

// ─── Shelf (horizontal scrolling row) ────────────────────────────────────
function Shelf({ shelf, size = "md", fade = "var(--c-bg)", portrait = false }) {
  const ref = urs(null);
  const films = shelf.filmIds.map(getFilm).filter(Boolean);
  const isMobile = useIsMobile();
  if (!films.length) return null;

  const isContinue = shelf.id === "continue";

  // Mobile Continue Watching: 2-col grid instead of horizontal scroll
  if (isMobile && isContinue) {
    return (
      <section style={{ padding: "24px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 16 }}>
          <h2 className="t-display" style={{
            fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 400,
            margin: 0, color: "var(--c-ink)", letterSpacing: "-0.01em",
          }}>{shelf.title}</h2>
          <span style={{ flex: 1 }}/>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase",
          }}>{films.length} TITLES</span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}>
          {films.map(f => <FilmCard key={f.id} film={f} showProgress={true} fluid/>)}
        </div>
      </section>
    );
  }

  const scroll = (dir) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: "smooth" });
  };

  const showProgress = shelf.id === "continue";

  return (
    <section style={{ padding: isMobile ? "22px 20px 8px" : "22px var(--gutter) 8px", position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 14, marginBottom: shelf.note ? 6 : 12,
        paddingBottom: 4,
      }}>
        <h2 className="t-display" style={{
          fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400,
          margin: 0, color: "var(--c-ink)",
          letterSpacing: "-0.02em",
        }}>{shelf.title}</h2>
        {shelf.subtitle && (
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            color: "var(--c-ink-3)", letterSpacing: ".16em",
            textTransform: "uppercase",
            paddingLeft: 12, marginLeft: 2,
            borderLeft: "1px solid var(--c-line-2)",
          }}>{shelf.subtitle}</span>
        )}
        <span style={{ flex: 1 }}/>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          color: "var(--c-ink-4)", letterSpacing: ".16em",
          textTransform: "uppercase",
        }}>{films.length} TITLES</span>
        <button
          className="btn-ghost"
          style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}
          onClick={() => navigate(`/shelf/${shelf.id}`)}
        >See all <Icon name="chev-r" size={10}/></button>
      </div>

      {/* Programmer's note — appears under curated shelves */}
      {shelf.note && (
        <div style={{ marginBottom: 16, display: "flex", alignItems: "baseline", gap: 10, maxWidth: 720 }}>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
            letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700,
            flexShrink: 0,
          }}>— FROM THE PROGRAMMER</span>
          <span style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45,
            letterSpacing: "-0.01em",
          }}>"{shelf.note.body}"</span>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
            letterSpacing: ".16em", textTransform: "uppercase",
          }}>· {shelf.note.who}</span>
        </div>
      )}

      <CarouselRail fade={fade} gap={12} padY={13} arrowOffset={-8} style={{ marginTop: 1 }}>
        {films.map(f => (
          <div key={f.id} style={{ scrollSnapAlign: "start" }}>
            <FilmCard film={f} size={size} showProgress={showProgress} portrait={portrait}/>
          </div>
        ))}
      </CarouselRail>
    </section>
  );
}

// ─── Featured NFT projects strip ─────────────────────────────────────────
// Just ONE editor's pick on the homepage. The Producers tab is where you
// browse the rest. Keeps the home page focused on watching.
function NFTSpotlight() {
  const projects = Object.values(NFT_PROJECTS);
  if (!projects.length) return null;
  // Pick the one closest to closing — that's the urgent editorial cue.
  const p = [...projects].sort((a, b) => (a.daysLeft || 99) - (b.daysLeft || 99))[0];
  const film = getFilm(p.filmId);
  const pct = (p.raised / p.goal) * 100;

  return (
    <section data-cina-banner="nft" style={{ padding: "20px var(--gutter) 32px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 14 }}>
        <span className="t-mono" style={{
          fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>EDITOR'S PICK · CO-FINANCE</span>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>One film a week. Picked by the Producers team.</span>
        <span style={{ flex: 1 }}/>
        <button
          onClick={() => { window.location.href = "Producers.html"; }}
          className="btn-ghost"
          style={{ height: 24, padding: "0 10px", fontSize: "var(--fs-label)", color: "var(--c-amber)" }}
        >See all open offerings <Icon name="chev-r" size={10}/></button>
      </div>

      <div
        onClick={() => navigate(`/nft/${p.id}`)}
        style={{
          position: "relative", borderRadius: "var(--r-2)", overflow: "hidden",
          border: "1px solid var(--c-line)", cursor: "pointer",
          transition: "border-color .15s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; }}
      >
        {/* Full-bleed film still */}
        <div style={{ position: "absolute", inset: 0 }}>
          <FrameThumb kind={film.thumb} usePhoto/>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,8,10,.97) 0%, rgba(8,8,10,.9) 36%, rgba(8,8,10,.55) 64%, rgba(8,8,10,.18) 100%)" }}></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,.75) 0%, transparent 38%)" }}></div>

        {/* Content — single left-anchored column, nothing competes with it */}
        <div style={{ position: "relative", padding: "36px 44px 34px", maxWidth: 640, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span className="t-mono" style={{
              padding: "3px 9px", borderRadius: "var(--r-1)",
              background: "rgba(var(--accent-rgb),.14)", border: "1px solid rgba(var(--accent-rgb),.45)",
              fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em",
              color: "var(--c-amber)", textTransform: "uppercase",
            }}>Open · {p.daysLeft}d left</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
              {p.creator} · {p.chain}
            </span>
          </div>

          <h3 className="t-display" style={{
            fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", lineHeight: 1.04,
            letterSpacing: "-0.02em", color: "var(--c-ink)", margin: "0 0 10px",
            textShadow: "0 2px 18px rgba(0,0,0,.7)",
          }}>Own a piece of <em style={{ color: "var(--c-amber)" }}>{film.title}.</em></h3>

          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "0 0 20px", maxWidth: 460 }}>{p.summary}</p>

          {/* Stats — ruled row */}
          <div style={{ display: "flex", marginBottom: 18 }}>
            {[
              ["RAISED", <span key="r">{fmtUSD(p.raised)} <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontWeight: 500 }}>/ {fmtUSD(p.goal)}</span></span>, "var(--c-ink)"],
              ["BACKERS", fmtCount(p.backers), "var(--c-ink)"],
              ["REV SHARE", `${p.revShare}%`, "var(--c-good)"],
            ].map(([label, value, color], i) => (
              <div key={label} style={{
                paddingRight: 26, paddingLeft: i === 0 ? 0 : 26,
                borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,.14)",
              }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{label}</div>
                <div className="t-num" style={{ fontSize: "var(--fs-lead)", color, fontWeight: 600, marginTop: 3 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ width: "100%", maxWidth: 460, marginBottom: 22 }}>
            <div style={{ height: 4, background: "rgba(255,255,255,.13)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: "var(--c-amber)" }}></div>
            </div>
            <div className="t-mono" style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 7 }}>
              <span>{Math.round(pct)}% FUNDED</span>
              <span>CLOSES IN {p.daysLeft} DAYS</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              className="btn btn-primary"
              style={{ height: 40, padding: "0 20px", fontSize: "var(--fs-body)", gap: 8 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/nft/${p.id}`); }}
            >View the pass <Icon name="chev-r" size={11}/></button>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
              ONE PASS · STREAM + REV SHARE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── First-load skeleton — the home page while the catalog "loads" ───────
// Shows once per page load (a refresh replays it). Gives the front page a
// real loading state instead of a blank flash before the rails paint.
let _splashBooted = false;

// ─── Personalized rails — driven by real signals (history · follows ·
// holdings · watchlist). Only shows for signed-in viewers with signal. The
// copy carries the house "programmer" voice rather than algorithm-speak. ──
function buildPersonalShelves() {
  const U = window.USER || {};
  const S = window.SESSION || {};
  const C = window.CATALOG || [];
  const creatorName = (window.CREATORS || []).reduce((m, c) => { m[c.id] = c.name; return m; }, {});
  const filmById = (id) => C.find(f => f.id === id);
  const projToFilm = (pid) => C.find(x => [x.id, x.studioProjectId, x.nft, x.studioCode].includes(pid));
  const shelves = [];

  // 1 — From my library (owned + unexpired rentals)
  const libRows = (typeof window.libraryRead === "function" ? window.libraryRead() : [])
    .filter(r => !r.expiresAt || r.expiresAt > Date.now());
  const libFilms = [...new Set(libRows.map(r => r.filmId))].map(filmById).filter(Boolean);
  if (libFilms.length) shelves.push({
    id: "pf-lib", title: "From my library", subtitle: "OWNED & RENTED · NEVER EXPIRES",
    filmIds: libFilms.map(f => f.id),
  });

  // 2 — Films you co-finance (producer holdings)
  const held = [...new Set((U.holdings || []).map(h => h.projectId))].map(projToFilm).filter(Boolean);
  if (held.length) shelves.push({
    id: "pf-back", title: "The films you back", subtitle: "YOUR PRODUCER STAKES",
    note: { body: "You put money behind these. Watching is the least we can do — and every view pays you back.", who: "CINA" },
    filmIds: [...new Set(held.map(f => f.id))],
  });

  // 2 — New from studios you follow
  const follow = U.followingCreators || [];
  const followFilms = C.filter(f => follow.includes(f.creatorId));
  if (followFilms.length) shelves.push({
    id: "pf-follow", title: "From the directors you follow",
    subtitle: follow.map(id => creatorName[id] || id).slice(0, 3).join(" · ").toUpperCase(),
    filmIds: [...new Set(followFilms.map(f => f.id))],
  });

  // 3 — Because you watched [X] — genre/mood similarity off your last resume
  const watched = (S.continued || []).map(c => filmById(c.filmId)).filter(Boolean);
  if (watched.length) {
    const seed = watched[0];
    const seedTags = new Set([...(seed.genre || []), ...(seed.moods || [])].map(x => String(x).toLowerCase()));
    const seen = new Set((S.continued || []).map(c => c.filmId));
    const sim = C.filter(f => f.id !== seed.id && !seen.has(f.id))
      .map(f => {
        const tags = [...(f.genre || []), ...(f.moods || [])].map(x => String(x).toLowerCase());
        return { f, score: tags.filter(t => seedTags.has(t)).length };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.f.id);
    if (sim.length) shelves.push({
      id: "pf-sim", title: `Because you watched ${seed.title}`, subtitle: "CUT FROM THE SAME CLOTH",
      filmIds: sim,
    });
  }

  // 4 — Your watchlist. Merge the seeded list with the live session so a save
  //     made this visit shows up without a reload.
  const wl = [...new Set([...(U.watchlist || []), ...(S.watchlist || [])])].filter(filmById);
  if (wl.length) shelves.push({
    id: "pf-wl", title: "You said you'd get to these", subtitle: "YOUR WATCHLIST",
    filmIds: wl,
  });

  // 5 — Rooms you hold rights in. A branched stake is a standing invitation:
  //     your vote weight only matters while the room is running.
  const roomFilms = Object.values(window.BRANCH_FILMS || {})
    .map(t => ({ t, film: filmById(t.filmId) }))
    .filter(x => x.film && held.some(h => h.id === x.film.id));
  if (roomFilms.length) shelves.push({
    id: "pf-rooms", title: "Rooms you have a vote in", subtitle: "BRANCHED · YOUR RIGHTS",
    note: { body: "You hold rights on these paths. Every screening you sit out is a fork decided without you.", who: "CINA" },
    filmIds: roomFilms.map(x => x.film.id),
  });

  // 6 — Directors you rate. Anything scored 4+ becomes a standing preference
  //     for that director's other work.
  const rated = Object.entries(S.ratings || {}).filter(([, n]) => n >= 4).map(([id]) => filmById(id)).filter(Boolean);
  if (rated.length) {
    const dirs = [...new Set(rated.map(f => f.creatorId))];
    const seenIds = new Set(rated.map(f => f.id));
    const more = C.filter(f => dirs.includes(f.creatorId) && !seenIds.has(f.id)).map(f => f.id);
    if (more.length) shelves.push({
      id: "pf-rated", title: "More from the directors you rate",
      subtitle: dirs.map(id => creatorName[id] || id).slice(0, 3).join(" · ").toUpperCase(),
      filmIds: [...new Set(more)].slice(0, 10),
    });
  }

  // 7 — Screenings you scored at the festival but haven't finished.
  let ballot = {};
  try { ballot = JSON.parse(localStorage.getItem("cina-fest-ballot-v1")) || {}; } catch (_) {}
  const balloted = Object.keys(ballot).filter(id => ballot[id] && (ballot[id].score || (ballot[id].awards || []).length));
  const ballotFilms = balloted.map(filmById).filter(Boolean);
  if (ballotFilms.length) shelves.push({
    id: "pf-fest", title: "You put these on your ballot", subtitle: "FESTIVAL · YOUR SCORES",
    filmIds: ballotFilms.map(f => f.id),
  });

  return shelves;
}

Object.assign(window, { FilmCard, Shelf, NFTSpotlight });
