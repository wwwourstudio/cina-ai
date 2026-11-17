// premiere-you.jsx — Library and Search on the Premiere system.

function PmLibrary() {
  useSession && useSession();
  usePmState();
  const S = window.SESSION || {};
  const lib = window.libraryRead ? libraryRead() : [];
  const film = (id) => (window.getFilm ? getFilm(id) : pmFilm(id));
  const ago = window.lbAgo || (() => "");
  const left = window.lbLeft || (() => "");
  const owned = lib.filter(r => r.kind === "buy" && film(r.filmId));
  const rentals = lib.filter(r => r.kind === "rent" && film(r.filmId));
  const others = lib.filter(r => (r.kind === "sub" || r.kind === "free") && film(r.filmId));
  const continued = (S.continued || []).filter(c => film(c.filmId));
  const watchlist = (S.watchlist || []).map(film).filter(Boolean);
  const branches = window.lbBranches ? lbBranches() : [];
  const subs = pmSubs(), rems = pmReminders();
  const orders = (() => { try { const l = JSON.parse(localStorage.getItem("cina:commerce:ledger")); return Array.isArray(l) ? l : []; } catch (e) { return []; } })();
  const liveRentals = rentals.filter(r => r.expiresAt > Date.now()).length;
  const empty = !lib.length && !continued.length && !watchlist.length && !branches.length && !orders.length && !subs.length && !rems.length;
  const go = (f) => pmGo(pmDest(f));
  const heroFilm = (continued[0] && film(continued[0].filmId)) || (owned[0] && film(owned[0].filmId)) || watchlist[0] || (window.CATALOG || [])[0];
  let n = 0; const N = () => String(++n).padStart(2, "0");

  return (
    <div className="pm" data-screen-label="Library">
      <PmHero
        short
        image={heroFilm?.thumb}
        color={heroFilm?.color || tkc("black")}
        kicker={<><b>Personal Screening Room</b> — {S.handle || "Viewer"}</>}
        title="Your Library"
        lede="Everything you own, rent, co-finance, subscribe to, or left halfway through — synced across Watch and Studio."
        facts={[
          ["Owned", owned.length],
          ["Active Rentals", liveRentals],
          ["In Progress", continued.length],
          ["Watchlist", watchlist.length],
          ["Subscriptions", subs.length],
        ]}
        actions={<>
          {heroFilm && (
            <button className="pm-btn pm-btn--primary" onClick={() => go(heroFilm)}>
              <Icon name="play" size={13}/>{continued.length ? `Resume ${heroFilm.title}` : `Watch ${heroFilm.title}`}
            </button>
          )}
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo("/wallet")}>Backed Stakes &amp; Splits</button>
        </>}
      />

      <nav className="pm-tabs" aria-label="Library sections" style={{ marginTop: 0 }}>
        <div className="pm-wrap" style={{ display: "flex", gap: "clamp(1.2rem, 2.4vw, 2.2rem)", overflowX: "auto" }}>
          {[["/library", "Overview"], ["/watchlist", "Watchlist"], ["/history", "History"], ["/taste", "Taste Print"], ["/wallet", "Backed"]].map(([href, label]) => (
            <button key={href} className="pm-tab" data-on={href === "/library" ? "1" : "0"} onClick={() => pmGo(href)}>{label}</button>
          ))}
        </div>
      </nav>

      {empty && (
        <section className="pm-wrap">
          <PmEmpty title="Nothing here yet." body="Buy, rent, subscribe or start watching anything and it lands here.">
            <button className="pm-btn pm-btn--primary" onClick={() => pmGo("/browse")}>Browse Watch</button>
          </PmEmpty>
        </section>
      )}

      {continued.length > 0 && (
        <PmRailSection n={N()} title="Continue watching" note={`${continued.length} in progress`} col="still">
          {continued.map(c => {
            const f = film(c.filmId);
            return <PmStill key={c.filmId + (c.ep || "")} film={f} progress={c.dur ? c.t / c.dur : 0}
              meta={`${c.ep ? `E${String(c.ep).padStart(2, "0")} · ` : ""}${Math.max(1, Math.round((c.dur - c.t) / 60))} min left · ${ago(c.at)}`}
              onClick={() => pmGo(c.ep && f.kind === "series" ? `/series/${f.id}/ep/${c.ep}` : pmDest(f))}/>;
          })}
        </PmRailSection>
      )}

      {rems.length > 0 && (
        <PmSection n={N()} title="Reminders" note="Episodes and releases you asked to hear about">
          <div className="pm-index">
            {rems.map(r => (
              <div key={r.key} className="pm-row" style={{ gridTemplateColumns: "14% minmax(0,1fr) auto" }}>
                <span className="pm-k"><b>{r.date ? r.date.slice(5).replace("-", "/") : "Any day"}</b></span>
                <button className="pm-card" onClick={() => r.to && pmGo(r.to)} style={{ gap: "0.25rem" }}>
                  <span className="pm-index__name">{r.label}</span>
                  {r.sub && <span className="pm-k">{r.sub}</span>}
                </button>
                <span className="pm-row__act"><button className="pm-btn pm-btn--sm" onClick={() => pmToggleReminder(r.key, r)}>Remove</button></span>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      {subs.length > 0 && (
        <PmSection n={N()} title="Subscriptions" note="Paid directly to the filmmakers">
          <div className="pm-index">
            {subs.map(s => (
              <div key={s.id} className="pm-row" style={{ gridTemplateColumns: "14% minmax(0,1fr) auto" }}>
                <span className="pm-k"><b>${s.price}</b>/mo</span>
                <button className="pm-card" onClick={() => pmGo(s.to || `/studios/${s.id}`)} style={{ gap: "0.25rem" }}>
                  <span className="pm-index__name">{s.name}</span>
                  <span className="pm-k">{s.plan} plan · since {new Date(s.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </button>
                <span className="pm-row__act"><button className="pm-btn pm-btn--sm" onClick={() => pmCancelSub(s.id, s.name)}>Cancel</button></span>
              </div>
            ))}
          </div>
        </PmSection>
      )}

      {(owned.length + rentals.length + others.length) > 0 && (
        <PmSection n={N()} title="Owned and rented" note="Purchases never expire">
          <div className="pm-grid">
            {owned.map(r => <PmPoster key={"b" + r.filmId} film={film(r.filmId)} badge={{ t: "Owned" }}/>)}
            {rentals.map(r => {
              const live = r.expiresAt > Date.now();
              return <PmPoster key={"r" + r.filmId} film={film(r.filmId)} badge={{ t: live ? `Rental · ${left(r.expiresAt)}` : "Rental expired", red: live }}/>;
            })}
            {others.map(r => <PmPoster key={"o" + r.filmId + r.kind} film={film(r.filmId)} badge={{ t: r.kind === "sub" ? "Subscription" : "Free with ads" }}/>)}
          </div>
        </PmSection>
      )}

      {branches.length > 0 && (
        <PmSection n={N()} title="Your branches" note="The paths you chose · rewatch to re-choose">
          <div className="pm-grid pm-grid--wide">
            {branches.map(b => <PmStill key={"br" + b.film.id} film={b.film} badge={{ t: `Path ${b.letters.join("·")}`, red: true }} meta={`${b.letters.length} fork${b.letters.length === 1 ? "" : "s"} taken · carries into the next episode`} onClick={() => go(b.film)}/>)}
          </div>
        </PmSection>
      )}

      {watchlist.length > 0 && (
        <PmSection n={N()} title="Watchlist" note={`${watchlist.length} saved`}>
          <div className="pm-grid">{watchlist.map(f => <PmPoster key={"w" + f.id} film={f}/>)}</div>
        </PmSection>
      )}

      {orders.length > 0 && (
        <PmSection n={N()} title="Wardrobe orders" note="Bought from the screen · every sale supports the director">
          <div className="pm-index">
            {orders.slice(0, 8).map(o => {
              const f = o.filmId && film(o.filmId);
              return (
                <div key={o.id} className="pm-row" style={{ gridTemplateColumns: "minmax(0,1fr) auto auto", cursor: "default" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0 }}>
                    <span className="pm-card__t">{o.name}</span>
                    <span className="pm-k">{o.brand}{f ? ` · from ${f.title}` : ""}</span>
                  </span>
                  <span className="pm-k">{ago(o.ts)}</span>
                  <span className="pm-stat__v" style={{ fontSize: "var(--fs-title)" }}>${o.price}</span>
                </div>
              );
            })}
          </div>
        </PmSection>
      )}
    </div>
  );
}

function PmSearch() {
  const route = typeof useRoute === "function" ? useRoute() : { params: {} };
  const [q, setQ] = usPm(route.params?.q || "");
  const [kind, setKind] = usPm("all");
  const [sort, setSort] = usPm("match");
  const ref = urPm(null);
  uePm(() => { setQ(route.params?.q || ""); }, [route.params?.q]);
  uePm(() => { ref.current && ref.current.focus(); }, []);
  const ql = q.trim().toLowerCase();
  const C = window.CATALOG || [];
  const scored = umPm(() => !ql ? [] : C.map(f => {
    let s = 0;
    if (f.title.toLowerCase().includes(ql)) s += 100;
    if (f.title.toLowerCase().startsWith(ql)) s += 40;
    if ((f.creator || "").toLowerCase().includes(ql)) s += 50;
    if ((f.genre || []).some(g => g.toLowerCase().includes(ql))) s += 30;
    if ((f.moods || []).some(m => m.toLowerCase().includes(ql))) s += 20;
    if ((f.logline || "").toLowerCase().includes(ql)) s += 15;
    return { f, s };
  }).filter(x => x.s > 0), [ql]);
  const studios = umPm(() => !ql ? [] : [
    ...(window.STUDIOS || []).filter(s => s.name.toLowerCase().includes(ql)).map(s => ({ id: s.id, name: s.name, hint: `Collective · ${(s.members || []).length} directors` })),
    ...(window.CREATORS || []).filter(c => c.name.toLowerCase().includes(ql)).map(c => ({ id: c.id, name: c.name, hint: `${pmNum(c.followers || 0)} followers · ${C.filter(f => f.creatorId === c.id).length} films` })),
  ].slice(0, 8), [ql]);
  const cast = umPm(() => !ql ? [] : (window.CAST || []).filter(p => p.name.toLowerCase().includes(ql) || (p.range || "").toLowerCase().includes(ql)).slice(0, 8), [ql]);
  const others = umPm(() => {
    if (!ql) return [];
    const out = [];
    Object.values(window.BRANCH_FILMS || {}).forEach(t => { if (t.title.toLowerCase().includes(ql) || String(t.director || "").toLowerCase().includes(ql)) out.push({ id: "room:" + t.filmId, cls: "Room", label: t.title, hint: `${t.roomSize ? t.roomSize.toLocaleString() + " in room · " : ""}${t.totalCuts} cuts`, to: "/branches/" + t.filmId }); });
    (window.STUDIOS || []).forEach(st => { const tk = window.stToken && stToken(st.id); if (tk && (st.name.toLowerCase().includes(ql) || tk.ticker.toLowerCase().includes(ql))) out.push({ id: "token:" + st.id, cls: "Token", label: `${tk.ticker} · ${st.name}`, hint: `$${tk.price.toFixed(2)} · ${tk.yieldApy.toFixed(1)}% APY`, to: `/studios/${st.id}/token` }); });
    (window.fvLineup ? fvLineup() : []).forEach((f, i) => { if (f.title.toLowerCase().includes(ql)) out.push({ id: "fest:" + f.id, cls: "Screening", label: f.title, hint: `No. ${String(i + 1).padStart(2, "0")} in the running order`, to: "/festival/film/" + f.id }); });
    return out.slice(0, 8);
  }, [ql]);
  let films = scored.filter(x => kind === "all" || (kind === "series" ? x.f.kind === "series" : kind === "film" && x.f.kind !== "series"));
  films = [...films].sort((a, b) => sort === "rating" ? b.f.rating - a.f.rating : sort === "newest" ? b.f.year - a.f.year : b.s - a.s);
  const nFilm = scored.filter(x => x.f.kind !== "series").length, nSer = scored.length - nFilm;
  const total = scored.length + studios.length + cast.length + others.length;
  const show = (k) => kind === "all" || kind === k;
  const suggestions = ["noir", "slow burn", "sci-fi", "Voss", "horror", "western"];
  let n = 0; const N = () => String(++n).padStart(2, "0");

  return (
    <div className="pm" data-screen-label="Search">
      <header className="pm-mast pm-wrap">
        <div className="pm-mast__top"><span className="pm-k"><b>Search</b> — all of Cina</span>{ql && <span className="pm-k">{total} results</span>}</div>
        <label className="pm-search">
          <Icon name="search" size={28}/>
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Films, series, studios, cast…"
            onKeyDown={(e) => { if (e.key === "Enter") pmGo(`/search?q=${encodeURIComponent(q.trim())}`); if (e.key === "Escape") setQ(""); }}/>
          {q && <button className="pm-arrow" aria-label="Clear search" onClick={(e) => { e.preventDefault(); setQ(""); ref.current && ref.current.focus(); }}><Icon name="x" size={14}/></button>}
        </label>
        <div className="pm-mast__tools">
          {ql ? <>
            <PmChips options={[{ value: "all", label: `All ${total}` }, { value: "film", label: `Films ${nFilm}` }, { value: "series", label: `Series ${nSer}` }, { value: "studios", label: `Studios ${studios.length}` }, { value: "cast", label: `Cast ${cast.length}` }, ...(others.length ? [{ value: "elsewhere", label: `Rooms & tokens ${others.length}` }] : [])]} value={kind} onChange={setKind}/>
            <span className="pm-sep"></span>
            <PmChips options={[{ value: "match", label: "Best match" }, { value: "rating", label: "Top rated" }, { value: "newest", label: "Newest" }]} value={sort} onChange={setSort}/>
          </> : <>
            <span className="pm-k" style={{ marginRight: 6 }}>Try</span>
            {suggestions.map(s => <button key={s} className="pm-chip" onClick={() => setQ(s)}>{s}</button>)}
          </>}
        </div>
      </header>

      {!ql && (
        <PmRailSection n="01" title="Trending searches" note="What the room is watching">
          {((window.SHELVES || []).find(s => s.id === "trending")?.filmIds || []).map(pmFilm).filter(Boolean).map(f => <PmPoster key={f.id} film={f}/>)}
        </PmRailSection>
      )}

      {ql && total === 0 && (
        <section className="pm-wrap">
          <PmEmpty title={window.cinaVoice ? cinaVoice("empty.search", q) : `Nothing for “${q}”`} body="Try a shorter word, a genre like “noir”, or a mood like “slow burn”.">
            <button className="pm-btn" onClick={() => pmGo("/genre/film")}>Browse films</button>
          </PmEmpty>
        </section>
      )}

      {ql && show("film") || ql && show("series") ? films.length > 0 && (kind !== "studios" && kind !== "cast" && kind !== "elsewhere") && (
        <PmSection n={N()} title="Films and series" note={`${films.length} matches`}>
          <div className="pm-grid">{films.map(({ f }) => <PmPoster key={f.id} film={f} badge={f.kind === "series" ? { t: "Series" } : undefined}/>)}</div>
        </PmSection>
      ) : null}

      {ql && show("studios") && studios.length > 0 && (
        <PmSection n={N()} title="Studios">
          <div className="pm-index">
            {studios.map((s, i) => (
              <button key={s.id} onClick={() => pmGo(`/studios/${s.id}`)}>
                <span className="pm-k">{String(i + 1).padStart(2, "0")}</span>
                <span className="pm-index__name">{s.name}</span>
                <span className="pm-k">{s.hint} →</span>
              </button>
            ))}
          </div>
        </PmSection>
      )}

      {ql && show("cast") && cast.length > 0 && (
        <PmRailSection n={N()} title="Cast" col="person">{cast.map(p => <PmPerson key={p.id} person={p}/>)}</PmRailSection>
      )}

      {ql && show("elsewhere") && others.length > 0 && (
        <PmSection n={N()} title="Elsewhere on Cina" note="Rooms, tokens, screenings">
          <div className="pm-index">
            {others.map(o => (
              <button key={o.id} onClick={() => pmGo(o.to)}>
                <span className="pm-k"><b>{o.cls}</b></span>
                <span className="pm-index__name" style={{ fontSize: "clamp(22px, 2.2vw, 32px)" }}>{o.label}</span>
                <span className="pm-k">{o.hint} →</span>
              </button>
            ))}
          </div>
        </PmSection>
      )}
    </div>
  );
}

Object.assign(window, { PmLibrary, PmSearch });
