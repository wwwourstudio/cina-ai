// premiere-home.jsx — Watch Screening Room Home.
// Full-bleed Tonight's Programme stage with interactive 4-film selector strip,
// zero-radius discovery filter bar, live cinema rooms bento, and curated rails.

function pmHomePicks() {
  const notes = window.PROGRAMMER_NOTES || {};
  return (window.CATALOG || []).filter(f => notes[f.id]).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4)
    .map(f => ({ id: f.id, film: f, note: notes[f.id].split(/(?<=[.!?])\s/)[0] }));
}

function PmHomeHero() {
  const picks = umPm(pmHomePicks, []);
  const [i, setI] = usPm(0);
  const [paused, setPaused] = usPm(false);
  const [trailerFilm, setTrailerFilm] = usPm(null);

  uePm(() => {
    if (paused || trailerFilm || picks.length < 2) return;
    const t = setTimeout(() => setI(x => (x + 1) % picks.length), 8000);
    return () => clearTimeout(t);
  }, [i, paused, trailerFilm, picks.length]);

  const { film, note } = picks[i] || {};
  if (!film) return null;
  const isSeries = film.kind === "series";
  const play = isSeries ? "Start Season" : film.free ? "Watch Free" : `Watch · $${film.rent}`;
  const who = (window.PROGRAMMER && window.PROGRAMMER.name) || "Ada Beresford";

  return (
    <section className="pm-hero pm-hero--home" data-cina-hero onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {trailerFilm && typeof TrailerModal === "function" && <TrailerModal film={trailerFilm} onClose={() => setTrailerFilm(null)}/>}
      {picks.map((p, k) => (
        <div key={p.id} className={"pm-hero__img" + (k === i ? " is-on" : "")} style={{ opacity: k === i ? 1 : 0 }}>
          <FrameThumb kind={p.film.thumb} usePhoto/>
        </div>
      ))}
      <div className="pm-hero__scrim"></div>
      <div className="pm-hero__body">
        <div className="pm-wrap">
          <div className="pm-hero__grid">
            <div className="pm-hero__main" key={film.id}>
              <span className="pm-k" style={{ color: "var(--c-ink-2)" }}>
                <b>Tonight's Programme · 0{i + 1} / 0{picks.length}</b> — Curated Screening Room
              </span>
              <h1 className="pm-xl">{film.title}</h1>
              <div className="pm-hero__meta">
                <span>{pmCreatorName(film)}</span>
                <span>{(film.genre || [])[0]}</span>
                <span>{isSeries ? `Season ${film.season} · ${film.totalEpisodes} EP` : film.runtime}</span>
                <span style={{ color: "var(--c-amber)" }}>★ {film.rating}</span>
              </div>
              <p className="pm-lede">{film.logline}</p>
              <div className="pm-actions">
                <button className="pm-btn pm-btn--primary" onClick={() => pmGo(pmDest(film))}>
                  <Icon name="play" size={13}/>{play}
                </button>
                {typeof TrailerModal === "function" && (
                  <button className="pm-btn pm-btn--glass" onClick={() => setTrailerFilm(film)}>
                    <Icon name="film" size={14}/>Trailer
                  </button>
                )}
                <PmWatchlistBtn film={film} glass/>
                {window.openCreateParty && (
                  <button className="pm-btn pm-btn--glass pm-btn--icon" title="Watch together in a synced room" aria-label="Start a watch party" onClick={() => openCreateParty(film)}>
                    <Icon name="users" size={15}/>
                  </button>
                )}
              </div>
              <div className="pm-hero__note" key={film.id + "-n"} style={{ animation: "pmRise .55s .08s ease both" }}>
                <p className="pm-note">“{note}”<cite>{who} · Lead Programmer</cite></p>
              </div>
            </div>

            <div className="pm-prog-strip" role="tablist" aria-label="Tonight's 4 featured films">
              <div className="pm-prog-strip__head">
                <span>On the Marquee</span>
                <span style={{ color: "var(--c-amber)" }}>{paused ? "Paused" : "Auto-screening"}</span>
              </div>
              {picks.map((p, k) => {
                const active = k === i;
                return (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={active}
                    className="pm-prog-item"
                    data-on={active ? "1" : "0"}
                    data-paused={active && paused ? "1" : "0"}
                    onClick={() => setI(k)}
                    onDoubleClick={() => pmGo(pmDest(p.film))}
                  >
                    <span className="pm-k" style={{ color: active ? "var(--c-amber)" : "var(--c-ink-4)" }}>
                      0{k + 1}
                    </span>
                    <span className="pm-prog-item__thumb">
                      <FrameThumb kind={p.film.thumb} usePhoto/>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, textAlign: "left" }}>
                      <span style={{ fontSize: "0.86rem", fontWeight: active ? 600 : 500, color: active ? "var(--c-ink)" : "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.film.title}
                      </span>
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: "0.64rem", letterSpacing: ".08em", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {pmCreatorName(p.film)} · {p.film.kind === "series" ? `S${p.film.season}` : p.film.runtime}
                      </span>
                    </span>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "0.68rem", color: active ? "var(--c-amber)" : "var(--c-ink-4)" }}>
                      ★ {p.film.rating}
                    </span>
                    <span className="pm-prog-item__bar"><span/></span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PmHome() {
  const S = window.SHELVES || [], C = window.CATALOG || [];
  const [filter, setFilter] = usPm("all");

  const sh = (id) => S.find(s => s.id === id);
  const films = (id) => (sh(id)?.filmIds || []).map(pmFilm).filter(Boolean);
  const quote = (id) => { const n = sh(id)?.note; return n ? { body: n.body, who: n.who } : null; };
  const continuing = C.filter(f => pmProgress(f) > 0);
  const top = [...C].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const forYou = (() => {
    const p = typeof window.buildPersonalShelves === "function" ? window.buildPersonalShelves()[0] : null;
    const ids = p ? p.filmIds : (sh("trending")?.filmIds || []);
    return { title: p ? p.title : "Selected for your taste", note: p ? p.subtitle : "Curated from independent cinema houses", films: ids.map(pmFilm).filter(Boolean) };
  })();
  const rooms = Object.values(window.BRANCH_FILMS || {}).map(t => ({ t, film: pmFilm(t.filmId) })).filter(x => x.film).sort((a, b) => (b.t.roomSize || 0) - (a.t.roomSize || 0));
  const ed = typeof window.pmNextEdition === "function" ? pmNextEdition() : null;
  const studios = window.STUDIOS || [];
  const yours = sh("yourpremieres");

  const FILTERS = [
    ["all", "All Tonight"],
    ["film", "Feature Films"],
    ["series", "Series"],
    ["branched", "Branched"],
    ["Sci-Fi", "Sci-Fi"],
    ["Noir", "Noir"],
    ["Thriller", "Thriller"],
    ["Drama", "Drama"],
  ];

  const filteredCatalog = umPm(() => {
    if (filter === "all") return [];
    if (filter === "film") return C.filter(f => f.kind !== "series");
    if (filter === "series") return C.filter(f => f.kind === "series");
    if (filter === "branched") return C.filter(f => f.branched || (window.BRANCH_FILMS && window.BRANCH_FILMS[f.id]));
    const needle = filter.toLowerCase();
    return C.filter(f => (f.genre || []).some(g => g.toLowerCase().includes(needle)));
  }, [filter, C.length]);

  const leadRoom = rooms[0];
  const liveViewers = rooms.reduce((acc, r) => acc + (r.t.roomSize || 0), 0);

  return (
    <div className="pm" data-screen-label="Home">
      <PmHomeHero/>

      {/* Architectural Hairline Discovery Bar (0 corner radius) */}
      <div className="pm-home-bar" role="navigation" aria-label="Screening room filters">
        <div className="pm-wrap pm-home-bar__inner">
          <div className="pm-home-bar__tabs" role="tablist">
            {FILTERS.map(([val, label]) => (
              <button
                key={val}
                role="tab"
                aria-selected={filter === val}
                className="pm-tab"
                data-on={filter === val ? "1" : "0"}
                onClick={() => setFilter(val)}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
            <button className="pm-link" onClick={() => pmGo("/rooms")}>
              <Icon name="users" size={13}/>Watch Parties
            </button>
            <span className="pm-sep"/>
            <button className="pm-link" onClick={() => pmGo("/festival")}>
              <Icon name="award" size={13}/>Festival
            </button>
          </div>
        </div>
      </div>

      <div className="pm-over">
        {filter !== "all" ? (
          <PmSection
            title={FILTERS.find(x => x[0] === filter)?.[1] || filter}
            note={`${filteredCatalog.length} ${filteredCatalog.length === 1 ? "title" : "titles"} screening`}
            link="Reset to full programme"
            onLink={() => setFilter("all")}
          >
            {filteredCatalog.length > 0 ? (
              <div className="pm-grid">
                {filteredCatalog.map(f => <PmPoster key={f.id} film={f}/>)}
              </div>
            ) : (
              <PmEmpty title="Nothing in this filter right now." body="Return to tonight's full screening room.">
                <button className="pm-btn" onClick={() => setFilter("all")}>Show all titles</button>
              </PmEmpty>
            )}
          </PmSection>
        ) : (
          <>
            {continuing.length > 0 && (
              <PmRailSection title="Continue watching" note="Pick up right at your frame" col="still" link="My Library" onLink={() => pmGo("/library")}>
                {continuing.map(f => {
                  const ep = f.kind === "series" ? f.series.find(e => e.watched > 0 && e.watched < 1) : null;
                  return (
                    <PmStill
                      key={f.id}
                      film={f}
                      progress={pmProgress(f)}
                      thumb={ep?.thumb}
                      meta={ep ? `S${f.season} · E${ep.ep} · ${ep.title}` : `${f.runtime} · ★ ${f.rating}`}
                      onClick={() => pmGo(ep ? `/series/${f.id}/ep/${ep.ep}` : `/film/${f.id}`)}
                    />
                  );
                })}
              </PmRailSection>
            )}

            {/* Live Cinema Experiences Bento — replaces scattered generic banners */}
            <PmSection title="Live Screening Rooms" note="Interactive forks, synced rooms & monthly festival">
              <div className="pm-home-bento">
                <button className="pm-bento-card" onClick={() => pmGo(leadRoom ? `/branches/${leadRoom.t.filmId}` : "/branches")}>
                  <div className="pm-bento-card__bg"><FrameThumb kind={leadRoom?.film?.thumb || C[0]?.thumb} usePhoto/></div>
                  <div className="pm-bento-card__scrim"/>
                  <div className="pm-bento-card__body">
                    <span className="pm-k"><b>● Live Branched Cinema</b> · {liveViewers.toLocaleString()} in rooms</span>
                    <span className="pm-h2">{leadRoom ? leadRoom.t.title : "Audience-Voted Story Forks"}</span>
                    <span className="pm-card__m" style={{ whiteSpace: "normal" }}>
                      Every viewer votes in real time when the story reaches a narrative crossroads.
                    </span>
                  </div>
                </button>

                <button className="pm-bento-card" onClick={() => pmGo("/rooms")}>
                  <div className="pm-bento-card__bg"><FrameThumb kind={(pmFilm("ll") || C[1] || C[0])?.thumb} usePhoto/></div>
                  <div className="pm-bento-card__scrim"/>
                  <div className="pm-bento-card__body">
                    <span className="pm-k"><b>● Synced Watch Parties</b> · Open lobbies</span>
                    <span className="pm-h2">Watch Together, Frame-Accurate</span>
                    <span className="pm-card__m" style={{ whiteSpace: "normal" }}>
                      Drop into a live screening room with friends or host a private premiere.
                    </span>
                  </div>
                </button>

                {ed && (
                  <button className="pm-bento-card" onClick={() => pmGo("/festival")}>
                    <div className="pm-bento-card__bg"><FrameThumb kind={(films("new")[0] || C[2] || C[0])?.thumb} usePhoto/></div>
                    <div className="pm-bento-card__scrim"/>
                    <div className="pm-bento-card__body">
                      <span className="pm-k"><b>Edition {String(ed.number).padStart(2, "0")}</b> · {ed.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · 7 PM PT</span>
                      <span className="pm-h2">Cina Monthly Film Festival</span>
                      <span className="pm-card__m" style={{ whiteSpace: "normal" }}>
                        Twelve curated world premieres screened in sequence, followed by director rooms.
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </PmSection>

            {yours && films("yourpremieres").length > 0 && (
              <PmRailSection title={yours.title} note={yours.subtitle} link="Portfolio" onLink={() => pmGo("/wallet")}>
                {films("yourpremieres").map(f => <PmPoster key={f.id} film={f} badge={{ t: "Backed", red: true }}/>)}
              </PmRailSection>
            )}

            <PmRailSection title="Top 10 on Cina this week" note="Most watched across independent houses" col="rank">
              {top.map((f, k) => <PmRankCard key={f.id} film={f} n={k + 1}/>)}
            </PmRailSection>

            {forYou.films.length > 0 && (
              <PmRailSection title={forYou.title} note={forYou.note} link="Taste Print" onLink={() => pmGo("/taste")}>
                {forYou.films.map(f => <PmPoster key={f.id} film={f}/>)}
              </PmRailSection>
            )}

            <PmRailSection title="New releases" quote={quote("new")} col="still" link="All Films" onLink={() => pmGo("/genre/film")}>
              {films("new").map(f => <PmStill key={f.id} film={f} badge={{ t: "New" }}/>)}
            </PmRailSection>

            {rooms.length > 0 && (
              <PmRailSection title="Branched rooms open now" note="Vote on the canonical cut live" col="still" link="All Branched" onLink={() => pmGo("/branches")}>
                {rooms.map(({ t, film }) => (
                  <PmStill
                    key={t.filmId}
                    film={film}
                    title={t.title}
                    badge={{ t: "● Live", red: true }}
                    meta={`${(t.roomSize || 0).toLocaleString()} watching · ${(t.forks || []).length} story forks`}
                    onClick={() => pmGo(`/branches/${t.filmId}`)}
                  />
                ))}
              </PmRailSection>
            )}

            <PmRailSection title="Slow-burn noir" quote={quote("noir")} link="Browse Noir" onLink={() => pmGo("/genre/noir")}>
              {films("noir").map(f => <PmPoster key={f.id} film={f}/>)}
            </PmRailSection>

            <PmRailSection title="After-dark horror & tension" quote={quote("horror")}>
              {films("horror").map(f => <PmPoster key={f.id} film={f}/>)}
            </PmRailSection>

            <PmRailSection title="Drama, in close" col="still" link="All Series" onLink={() => pmGo("/genre/series")}>
              {films("drama").map(f => <PmStill key={f.id} film={f}/>)}
            </PmRailSection>

            {studios.length > 0 && (
              <PmRailSection title="Director-Owned Studios" note="Subscribe directly to independent houses" col="studio" link="All Studios" onLink={() => pmGo("/studios")}>
                {studios.map(s => <PmStudioCard key={s.id} studio={s}/>)}
              </PmRailSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PmHome });
