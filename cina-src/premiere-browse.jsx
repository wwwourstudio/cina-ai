// premiere-browse.jsx — Full-bleed Hero category pages (Films / Series / Branched / Kids / Catalog / Studios / Cast) matching PmHome.

const PM_SECTIONS = {
  all:      { index: "00", path: "Catalog",  title: "Films & Series", lede: "Every Cina original feature, episodic series, and branched room — programmed nightly and settled directly to creators and pass holders." },
  film:     { index: "01", path: "Films",    title: "Original Films", lede: "Feature-length Cina originals, sorted by what the screening room is watching tonight." },
  series:   { index: "02", path: "Series",   title: "Original Series", lede: "Episodic originals that drop a chapter a week on the director's schedule." },
  branched: { index: "03", path: "Branched", title: "Branched Cinema", lede: "Live narrative forks. Audience majority sets canon; your choices cut your personal print." },
  kids:     { index: "04", path: "Kids",     title: "Family & Kids",  lede: "G and PG cinema only. Every rating is reviewed by a human programmer." },
};
const PM_TABS = [
  ["all", "All Titles", "/catalog"],
  ["film", "Films", "/genre/film"],
  ["series", "Series", "/genre/series"],
  ["branched", "Branched", "/branches"],
  ["kids", "Kids", "/kids"],
];

function PmGenre({ slug }) {
  const all = umPm(() => {
    if (slug === "all") return (window.CATALOG || []).slice();
    return window.gFilms ? window.gFilms(slug) : [];
  }, [slug]);
  const [genre, setGenre] = usPm("All");
  const [sort, setSort] = usPm("trending");
  const [query, setQuery] = usPm("");
  uePm(() => { setGenre("All"); setQuery(""); }, [slug]);

  const sec = PM_SECTIONS[slug] || {
    index: "05",
    path: "Genre",
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    lede: `Every Cina original filed under ${slug}.`,
  };
  const genres = ["All", ...[...new Set(all.flatMap(f => f.genre || []))].slice(0, 9)];
  const ql = query.trim().toLowerCase();
  const list = all
    .filter(f => (genre === "All" || (f.genre || []).includes(genre)) && (!ql || f.title.toLowerCase().includes(ql) || (f.creator || "").toLowerCase().includes(ql)))
    .slice()
    .sort((a, b) =>
      sort === "new" ? (b.year - a.year) || String(b.id).localeCompare(a.id)
      : sort === "rating" ? b.rating - a.rating
      : (b.views || 0) - (a.views || 0)
    );
  const featured = list[0] || all[0];
  const topTrending = umPm(() => [...all].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10), [all]);
  const topAcclaimed = umPm(() => [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10), [all]);
  const isWide = slug === "series" || slug === "branched";
  const pNote = featured && (window.PROGRAMMER_NOTES || {})[featured.id];
  const noteObj = pNote
    ? { body: pNote.split(/(?<=[.!?])\s/)[0], who: (window.PROGRAMMER && window.PROGRAMMER.name) || "Lead Programmer" }
    : { body: sec.lede, who: `Cina ${sec.path} Desk` };

  return (
    <div className="pm" data-screen-label={sec.title}>
      {featured ? (
        <PmHero
          image={featured.thumb}
          color={featured.color}
          kicker={<><b>{sec.path} · Tonight's Lead Selection</b> — {all.length} curated works</>}
          title={featured.title}
          lede={featured.logline || sec.lede}
          note={noteObj}
          facts={[
            ["Director", pmCreatorName(featured)],
            ["Year", featured.year],
            ["Format", featured.kind === "series" ? `Series · S${featured.season} (${featured.totalEpisodes} EP)` : featured.runtime],
            ["Genre", (featured.genre || [])[0]],
            ["Score", `★ ${featured.rating}`],
          ]}
          actions={<>
            <button className="pm-btn pm-btn--primary" onClick={() => pmGo(pmDest(featured))}>
              <Icon name="play" size={13}/>Watch {featured.kind === "series" ? "Series" : "Film"}
            </button>
            <PmWatchlistBtn film={featured} glass/>
            {featured.nft && (
              <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/nft/${featured.nft}`)}>
                <Icon name="ticket" size={14}/>Co-Finance Pass
              </button>
            )}
          </>}
        />
      ) : (
        <PmMasthead index={sec.index} path={sec.path} count={`${all.length} titles`} title={sec.title} lede={sec.lede}/>
      )}

      <nav className="pm-tabs" aria-label="Catalog categories" style={{ marginTop: 0 }}>
        <div className="pm-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2%", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "clamp(1.1rem, 2.2vw, 2rem)", overflowX: "auto" }}>
            {PM_TABS.map(([k, l, to]) => (
              <button key={k} className="pm-tab" data-on={k === slug ? "1" : "0"} onClick={() => pmGo(to)}>{l}</button>
            ))}
          </div>
          <span className="pm-k" style={{ padding: "0.5rem 0" }}>{all.length} works in {sec.path.toLowerCase()}</span>
        </div>
      </nav>

      {genre === "All" && !ql && topTrending.length > 3 && (
        <PmRailSection n="01" title={`Tonight in ${sec.title}`} note="Ranked by live screening attendance" col={isWide ? "still" : "poster"}>
          {topTrending.map(f => isWide ? <PmStill key={f.id} film={f} sub={f.logline}/> : <PmPoster key={f.id} film={f}/>)}
        </PmRailSection>
      )}

      {genre === "All" && !ql && topAcclaimed.length > 3 && (
        <PmRailSection n="02" title="Highest Acclaimed" note="Audience & programmer consensus" col="still">
          {topAcclaimed.slice(0, 8).map(f => <PmStill key={f.id} film={f} sub={f.logline}/>)}
        </PmRailSection>
      )}

      <PmSection n="03" title={`Complete ${sec.title} Index`} note={`${list.length} shown`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", alignItems: "center" }}>
            <PmChips options={genres} value={genre} onChange={setGenre}/>
            <span className="pm-sep"/>
            <PmChips options={[{ value: "trending", label: "Most Watched" }, { value: "new", label: "Newest" }, { value: "rating", label: "Top Rated" }]} value={sort} onChange={setSort}/>
          </div>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter title or director…"
            style={{
              height: "2.15rem", width: "min(100%, 16rem)", padding: "0 0.75rem",
              background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
              color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
            }}
          />
        </div>
        {list.length ? (
          <div className={isWide ? "pm-grid pm-grid--wide" : "pm-grid"}>
            {list.map(f => isWide ? <PmStill key={f.id} film={f} sub={f.logline}/> : <PmPoster key={f.id} film={f}/>)}
          </div>
        ) : (
          <p className="pm-lede">
            No matching works. <button className="pm-link" onClick={() => { setGenre("All"); setQuery(""); }}>Reset filters</button>
          </p>
        )}
      </PmSection>
    </div>
  );
}

function PmShelf({ shelfId }) {
  const shelf = (window.SHELVES || []).find(s => s.id === shelfId);
  if (!shelf) {
    return (
      <div className="pm">
        <PmMasthead index="—" path="Shelf" title="Shelf not found" lede="It may have been retired.">
          <button className="pm-btn" onClick={() => pmGo("/browse")}>Back to Watch</button>
        </PmMasthead>
      </div>
    );
  }
  const films = shelf.filmIds.map(pmFilm).filter(Boolean);
  const lead = films[0];
  return (
    <div className="pm">
      {lead ? (
        <PmHero
          short
          image={lead.thumb}
          color={lead.color}
          kicker={<><b>Curated Shelf</b> — {films.length} titles</>}
          title={shelf.title}
          lede={shelf.subtitle || shelf.note?.body}
          note={shelf.note}
          actions={<button className="pm-btn pm-btn--glass" onClick={() => pmGo("/browse")}>← Back to Watch</button>}
        />
      ) : (
        <PmMasthead index="Shelf" path={shelf.note?.who || "Cina programmers"} count={`${films.length} titles`} title={shelf.title} lede={shelf.subtitle || shelf.note?.body}/>
      )}
      <PmSection n="01" title="On this shelf" note={`${films.length} selections`}>
        <div className="pm-grid">{films.map(f => <PmPoster key={f.id} film={f}/>)}</div>
      </PmSection>
    </div>
  );
}

function PmStudios() {
  const all = window.STUDIOS || [];
  const [kind, setKind] = usPm("All");
  const [listing, setListing] = usPm(false);
  const growing = [...all].filter(s => s.growth30d != null).sort((a, b) => b.growth30d - a.growth30d).slice(0, 5);
  const C = window.CREATORS || [];
  const cal = all.flatMap(s => (s.upcoming || []).map(u => ({ ...u, studio: s }))).sort((a, b) => a.date.localeCompare(b.date));
  const list = all.filter(s => kind === "All" || (kind === "Collectives" ? (s.members || []).length > 1 : (s.members || []).length <= 1));
  const subs = all.reduce((a, s) => a + (s.subs || 0), 0);
  const paid = all.reduce((a, s) => a + (s.mrr || 0), 0);
  const leadStudio = growing[0] || all[0];
  const leadArt = leadStudio
    ? (((window.CATALOG || []).find(f => f.id === leadStudio.featuredId || (leadStudio.members || []).includes(f.creatorId)) || {}).thumb || leadStudio.bgImage)
    : null;

  return (
    <div className="pm" data-screen-label="Studios">
      <PmHero
        short
        image={leadArt}
        color={leadStudio?.color || tkc("black")}
        kicker={<><b>Director-Owned Studios</b> — {all.length} houses publishing</>}
        title="Independent Studios"
        lede="Every studio on Cina — from six-director collectives to solo auteurs — runs its own white-label storefront, sets its own subscription, and settles revenue on-chain."
        facts={[
          ["Studios", all.length],
          ["Subscribers", pmNum(subs)],
          ["Filmmaker Payouts / Mo", `$${pmNum(paid)}`],
          leadStudio ? ["Fastest Growing", `${leadStudio.name} (+${leadStudio.growth30d || 18}%)`] : null,
        ]}
        actions={<>
          {leadStudio && (
            <button className="pm-btn pm-btn--primary" onClick={() => pmGo(`/studios/${leadStudio.id}`)}>
              Visit {leadStudio.name}
            </button>
          )}
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/build")}>Open Site Builder</button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/tokens")}>Studio Tokens</button>
          <button className="pm-btn pm-btn--glass" onClick={() => window.ListYourStudioModal ? setListing(true) : pmGo("/about/found")}>Found a Studio</button>
        </>}
      />

      <PmSection n="01" title="Studio Directory" note={`${list.length} active houses`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <PmChips options={["All", "Collectives", "Solo"]} value={kind} onChange={setKind}/>
        </div>
        <div className="pm-grid pm-grid--wide">{list.map(s => <PmStudioCard key={s.id} studio={s}/>)}</div>
      </PmSection>

      {growing.length > 0 && (
        <PmSection n="02" title="Fastest Growing Houses" note="Subscriber growth · last 30 days">
          <div className="pm-index">
            {growing.map((s, k) => (
              <button key={s.id} onClick={() => pmGo(`/studios/${s.id}`)}>
                <span className="pm-k">{String(k + 1).padStart(2, "0")}</span>
                <span className="pm-index__name">{s.name.charAt(0) + s.name.slice(1).toLowerCase()}</span>
                <span className="pm-k"><b>+{s.growth30d}%</b> · {pmNum(s.subs || 0)} subscribers →</span>
              </button>
            ))}
          </div>
        </PmSection>
      )}

      {cal.length > 0 && (
        <PmSection n="03" title="Release Calendar" note="Upcoming premieres across every studio">
          <div className="pm-index">
            {cal.map(u => {
              const d = C.find(c => c.id === u.creatorId);
              return (
                <button key={u.studio.id + u.id} onClick={() => pmGo(`/studios/${u.studio.id}`)}>
                  <span className="pm-k"><b>{u.date.slice(5).replace("-", "/")}</b></span>
                  <span className="pm-index__name">{u.title}</span>
                  <span className="pm-k">{u.studio.name}{d ? ` · ${d.name}` : ""} · {u.kind}</span>
                </button>
              );
            })}
          </div>
        </PmSection>
      )}
      {listing && window.ListYourStudioModal && <window.ListYourStudioModal onClose={() => setListing(false)}/>}
    </div>
  );
}

function PmCastIndex() {
  const all = window.CAST || [];
  const ranges = ["All", ...[...new Set(all.flatMap(p => (p.range || "").split("·").map(x => x.trim()).filter(Boolean)))].slice(0, 7)];
  const [r, setR] = usPm("All");
  const list = all.filter(p => r === "All" || (p.range || "").includes(r));
  const lead = all[0];

  return (
    <div className="pm" data-screen-label="Cast">
      <PmHero
        short
        imageSrc={lead?.photo}
        color={tkc("black")}
        kicker={<><b>Performer Registry &amp; Likeness Vault</b> — {all.length} performers</>}
        title="Synthesized Cast"
        lede="Persistent performers with verified LoRA identity weights, career timelines, awards, and smart-contract likeness royalties on every appearance."
        facts={[
          ["Performers", all.length],
          lead ? ["Lead Featured", `${lead.name} (${lead.appearances} films)`] : null,
          ["Likeness Royalty", "10% auto-routed via CinaSplitRouter"],
        ]}
        actions={<>
          <button className="pm-btn pm-btn--primary" onClick={() => pmGo(`/cast/${lead ? lead.id : "nadya-ash"}/studio`)}>
            Open AI Training Studio
          </button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/journey/${lead ? lead.id : "nadya-ash"}`)}>
            Career Timelines
          </button>
          <button className="pm-btn pm-btn--glass" onClick={() => { window.location.href = "Cina.html#vault"; }}>
            Studio Actor Editor →
          </button>
        </>}
      />

      <PmSection n="01" title="Performers" note={`${list.length} shown`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
          <PmChips options={ranges} value={r} onChange={setR}/>
        </div>
        <div className="pm-grid">{list.map(p => <PmPerson key={p.id} person={p}/>)}</div>
      </PmSection>
    </div>
  );
}

Object.assign(window, { PmGenre, PmShelf, PmStudios, PmCastIndex });
