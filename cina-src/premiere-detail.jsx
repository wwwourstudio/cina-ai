// premiere-detail.jsx — Series and Studio profile on the Premiere layout system.
// Every action from the classic pages is carried over; shared modules
// (season arc map, director card, schedule, extras, festival record) are reused.

function PmSeries({ seriesId }) {
  const [epFilter, setEpFilter] = usPm("all");
  const [tab, setTab] = usPm("episodes");
  usePmState();
  const film = window.getFilm ? getFilm(seriesId) : pmFilm(seriesId);
  if (!film || film.kind !== "series") return <div className="pm"><PmMasthead index="Series" title="Series not found"><button className="pm-btn" onClick={() => pmGo("/genre/series")}>All series</button></PmMasthead></div>;
  const eps = film.series || [];
  const released = eps.filter(e => e.status === "released");
  const scheduled = eps.filter(e => e.status === "scheduled");
  const next = scheduled[0], finale = scheduled[scheduled.length - 1];
  const watching = released.find(e => e.watched > 0 && e.watched < 1);
  const watchedCount = released.filter(e => e.watched > 0).length;
  const cont = watching || released.find(e => e.watched === 0) || released[0];
  const t = next && window.timeUntilFromNow ? timeUntilFromNow(next.drop + "T19:00:00") : null;
  const shown = eps.filter(e => epFilter === "all" || (epFilter === "released" ? e.status === "released" : e.status === "scheduled"));
  const pNote = (window.PROGRAMMER_NOTES || {})[film.id];
  const who = (window.PROGRAMMER && PROGRAMMER.name) || "Cina programmer";
  const like = (window.CATALOG || []).filter(f => f.id !== film.id && (f.genre || []).some(g => (film.genre || []).includes(g))).slice(0, 12);
  const remindEp = (e) => pmToggleReminder(`ep:${film.id}:${e.ep}`, { label: `${film.title} · E${e.ep} ${e.title}`, sub: e.finale ? "Season finale" : "New episode", date: e.drop, to: `/series/${film.id}` });

  return (
    <div className="pm" data-screen-label={`Series · ${film.title}`}>
      <PmHero image={film.thumb} color={film.color}
        kicker={<><b>Cina original series</b> · {pmCreatorName(film)}</>}
        title={film.title} lede={film.logline || film.synopsis}
        note={pNote ? { body: pNote.split(/(?<=[.!?])\s/)[0], who } : null}
        facts={[
          ["s", `Season ${film.season}`], ["e", `${film.totalEpisodes} episodes`], ["g", (film.genre || [])[0]], ["r", <>★ {film.rating}</>],
          next && t ? ["n", <span style={{ color: "var(--c-amber)" }}>{next.finale ? "Finale" : `E${next.ep}`} in {t.label}</span>] : null,
        ]}
        actions={<>
          {cont && <button className="pm-btn pm-btn--primary" onClick={() => pmGo(`/series/${film.id}/ep/${cont.ep}`)}><Icon name="play" size={13}/>{watching ? `Continue · E${watching.ep}` : watchedCount === 0 ? "Play episode 1" : "Resume"}</button>}
          <PmWatchlistBtn film={film} glass icon/>
          <PmRemindBtn glass k={`series:${film.id}`} info={{ label: film.title, sub: next ? `E${next.ep} · ${next.title}` : `Season ${film.season}`, date: next?.drop, to: `/series/${film.id}` }}/>
          {film.nftPremiere && <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/nft/${film.nft}`)}><Icon name="ticket" size={14}/>Co-finance this series</button>}
          {window.openCreateParty && <button className="pm-btn pm-btn--glass" onClick={() => openCreateParty(film)}><Icon name="users" size={14}/>Start a watch party</button>}
          <button className="pm-btn pm-btn--glass" onClick={() => window.cinaCopyShareLink ? cinaCopyShareLink(film) : window.toast && toast({ title: "LINK COPIED", text: film.title })}><Icon name="share" size={14}/>Share</button>
        </>}/>

      <PmTabs value={tab} onChange={setTab} tabs={[["episodes", "Episodes"], ["like", "More like this"], ["extras", "Extras"], ["details", "Details"]]}/>

      {tab === "episodes" && (
        <section className="pm-sec pm-wrap">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <PmChips options={[{ value: "all", label: `Season ${film.season} · ${eps.length}` }, { value: "released", label: `Out now · ${released.length}` }, { value: "scheduled", label: `Coming · ${scheduled.length}` }]} value={epFilter} onChange={setEpFilter}/>
            </div>
            <span className="pm-card__m">You've watched {watchedCount} of {film.totalEpisodes} · new episodes Fridays</span>
          </div>
          <div>
            {shown.map(e => {
              const out = e.status === "released";
              const rem = pmHasReminder(`ep:${film.id}:${e.ep}`);
              return (
                <div key={e.ep} className="pm-ep">
                  <PmStill film={film} thumb={e.thumb} progress={e.watched} title={`${e.ep}. ${e.title}`} meta={null}
                    badge={e.new ? { t: "New", red: true } : !out ? { t: "Coming" } : null}
                    onClick={() => out ? pmGo(`/series/${film.id}/ep/${e.ep}`) : remindEp(e)}/>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                    <span className="pm-card__m">{out ? `${e.duration} · ${e.drop.slice(5).replace("-", "/")}${e.watched >= 0.99 ? " · watched" : ""}` : `Drops ${e.drop.slice(5).replace("-", "/")}${e.finale ? " · finale" : ""}`}</span>
                    <h3 className="pm-ep__t">{e.title}</h3>
                    {e.synopsis && <p className="pm-card__s" style={{ WebkitLineClamp: 3, maxWidth: "64ch" }}>{e.synopsis}</p>}
                    <div className="pm-actions" style={{ marginTop: 4 }}>
                      {out ? <button className="pm-btn pm-btn--sm" onClick={() => pmGo(`/series/${film.id}/ep/${e.ep}`)}><Icon name="play" size={12}/>{e.watched > 0 && e.watched < 0.99 ? "Resume" : "Play"}</button>
                        : <button className={"pm-btn pm-btn--sm" + (rem ? " pm-btn--on" : "")} onClick={() => remindEp(e)}><Icon name={rem ? "check" : "bell"} size={12}/>{rem ? "Reminder set" : "Remind me"}</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "like" && <PmSection title="More like this" note={(film.genre || []).join(" · ")}><div className="pm-grid">{like.map(f => <PmPoster key={f.id} film={f}/>)}</div></PmSection>}

      {tab === "extras" && <>
        {pNote && <section className="pm-sec pm-wrap"><div className="pm-quote"><blockquote>“{pNote}”</blockquote><span className="pm-k">{who}</span></div></section>}
        {window.SeasonArcMap && <PmSection title="Your path through the season" note="Branch votes so far"><SeasonArcMap film={film}/></PmSection>}
        <PmSection title="Behind the season">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16, alignItems: "start" }}>
            {window.DirectorStudioCard ? <DirectorStudioCard film={film}/> : window.SeriesDirectorCard && <SeriesDirectorCard film={film}/>}
            {next && t && window.CountdownCard && <CountdownCard ep={next} t={t} film={film}/>}
            {window.ScheduleCard && <ScheduleCard film={film}/>}
            {finale && window.HiatusCard && <HiatusCard film={film} finale={finale}/>}
          </div>
        </PmSection>
        {window.SeriesExtras && <section className="pm-wrap"><SeriesExtras film={film}/></section>}
      </>}

      {tab === "details" && (
        <PmSection title="Details">
          <p className="pm-lede" style={{ maxWidth: "70ch", marginBottom: 28 }}>{film.synopsis}</p>
          <PmFacts items={[["Director", pmCreatorName(film)], ["Genre", (film.genre || []).join(", ")], ["Season", `${film.season} · ${film.totalEpisodes} episodes`], ["Schedule", "Fridays · 7:00 PM ET"], ["Rating", `★ ${film.rating} · ${pmNum(film.ratings)} ratings`], ["Viewers", pmNum(film.views)]]}/>
        </PmSection>
      )}
    </div>
  );
}

function pmResolveStudio(id) {
  const S = window.STUDIOS || [], C = window.CREATORS || [];
  const col = S.find(s => s.id === id);
  if (col) return { ...col, kind: "collective", siteId: col.leadId, directors: col.members.map(m => C.find(c => c.id === m)).filter(Boolean) };
  const c = C.find(x => x.id === id);
  if (!c) return null;
  const home = S.find(s => (s.members || []).includes(c.id));
  return { id: c.id, name: c.name, verified: true, kind: "solo", tagline: c.tagline, description: c.bio || c.tagline, color: c.color, accent: c.accent, followers: c.followers, siteId: c.id, leadId: c.id, directors: [c], home,
    plans: [{ id: "monthly", name: "Monthly", price: c.sub, features: [`Every ${c.name.split(" ")[0]} film & series`, "Early premiere windows", "Comments + reactions"], pop: true }], upcoming: [] };
}

function PmStudioProfile({ id }) {
  const studio = umPm(() => pmResolveStudio(id), [id]);
  usePmState();
  const [following, setFollowing] = usPm(() => !!(window.isFollowing && window.isFollowing(id)));
  if (!studio) return <div className="pm"><PmMasthead index="—" path="Studios" title="Studio not found"><button className="pm-btn" onClick={() => pmGo("/studios")}>All studios</button></PmMasthead></div>;
  const films = (window.CATALOG || []).filter(f => studio.directors.map(d => d.id).includes(f.creatorId));
  const latest = [...films].sort((a, b) => (b.year || 0) - (a.year || 0))[0];
  const heroFilm = latest || films[0];
  const posts = studio.kind === "solo" ? (() => { try { const v = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null"); return Array.isArray(v) ? v.filter(p => p.status === "published").slice(0, 3) : []; } catch (e) { return []; } })() : [];
  const sitePublished = (() => { try { return !!(JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}")[studio.siteId]); } catch (e) { return false; } })();
  const token = window.stToken && window.stToken(studio.id);
  const subbed = pmIsSubbed(studio.id);
  const subscribe = (plan) => {
    const p = plan || studio.plans[0];
    if (window.openPay) openPay({ kind: "sub", title: studio.name, price: p.price, priceUSD: p.price, cadence: "mo", recurring: "month", accent: studio.accent, image: heroFilm ? { kind: heroFilm.thumb, color: studio.color } : { color: studio.color }, perks: p.features || [], onConfirm: () => pmSetSub(studio.id, { name: studio.name, plan: p.name, price: p.price, to: `/studios/${studio.id}` }) });
    else pmSetSub(studio.id, { name: studio.name, plan: p.name, price: p.price, to: `/studios/${studio.id}` });
  };
  const follow = () => { if (window.toggleFollow) toggleFollow(studio.id); setFollowing(f => !f); };
  const series = films.filter(f => f.kind === "series").length;
  const avg = films.length ? (films.reduce((n, f) => n + (parseFloat(f.rating) || 0), 0) / films.length).toFixed(1) : "—";
  const display = studio.name.charAt(0) + (studio.kind === "collective" ? studio.name.slice(1).toLowerCase() : studio.name.slice(1));
  let n = 0; const N = () => String(++n).padStart(2, "0");
  const rec = window.frStudioRecord ? frStudioRecord(studio.id, films) : [];
  const run = window.frInLineup ? frInLineup(films) : [];

  return (
    <div className="pm" data-screen-label={`Studio · ${studio.name}`}>
      <PmHero short image={heroFilm?.thumb} color={studio.color}
        kicker={<><b>{studio.kind === "collective" ? "Collective" : "Solo studio"}</b>{studio.verified ? " — Verified" : ""}{studio.home ? ` — Member of ${studio.home.name}` : ""}</>}
        title={display} lede={studio.description || studio.tagline}
        actions={<>
          <button className={"pm-btn" + (subbed ? " pm-btn--glass pm-btn--on" : " pm-btn--primary")} onClick={() => subbed ? pmCancelSub(studio.id, studio.name) : subscribe()} title={subbed ? "Manage subscription" : undefined}>{subbed ? "✓ Subscribed" : `Subscribe · $${studio.plans[0]?.price}/mo`}</button>
          <button className={"pm-btn pm-btn--glass" + (following ? " pm-btn--on" : "")} onClick={follow}>{following ? "✓ Following" : "Follow"}</button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/site/${studio.siteId}`)}>{sitePublished ? "Visit site ↗" : "Preview site ↗"}</button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/build/${studio.siteId}`)}>Edit site</button>
          {token && <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/studios/${studio.id}/token`)}>{`${token.ticker} · $${token.price.toFixed(2)}`}</button>}
          {studio.home && <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/studios/${studio.home.id}`)}>{studio.home.name}</button>}
        </>}
        facts={[
          ["Catalog", `${films.length - series} films · ${series} series`],
          studio.subs != null ? ["Subscribers", pmNum(studio.subs)] : ["Followers", pmNum((studio.followers || 0) + (following ? 1 : 0))],
          ["Directors", studio.directors.length],
          ["Avg rating", `★ ${avg}`],
          studio.growth30d != null ? ["Growth · 30d", `+${studio.growth30d}%`] : null,
          studio.founded ? ["Founded", studio.founded] : null,
          studio.kind === "collective" ? ["Payouts", `${studio.directors.length}-way split`] : null,
        ]}/>

      {latest && (
        <PmSection n={N()} title="Latest release" note={String(latest.year || "")}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "clamp(24px, 4vw, 64px)", alignItems: "end" }}>
            <PmStill film={latest}/>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 8 }}>
              <span className="pm-k"><b>{latest.kind === "series" ? `Series · Season ${latest.season || 1}` : "Feature film"}</b></span>
              <p className="pm-lede">{(window.PROGRAMMER_NOTES || {})[latest.id] || latest.logline}</p>
              <div className="pm-actions"><button className="pm-btn pm-btn--primary" onClick={() => pmGo(pmDest(latest))}><Icon name="play" size={13}/>Watch</button><PmWatchlistBtn film={latest}/></div>
            </div>
          </div>
        </PmSection>
      )}

      {studio.kind === "collective" && (
        <PmSection n={N()} title="The directors" note={studio.splits ? "Revenue split by agreement" : null}>
          <div className="pm-index">
            {studio.directors.map((d, k) => (
              <button key={d.id} onClick={() => pmGo(`/studios/${d.id}`)}>
                <span className="pm-k">{String(k + 1).padStart(2, "0")}</span>
                <span className="pm-index__name">{d.name}</span>
                <span className="pm-k">{pmNum(d.followers)} followers{studio.splits?.[d.id] ? ` · ${studio.splits[d.id]}% split` : ""} →</span>
              </button>
            ))}
          </div>
        </PmSection>
      )}

      {typeof window.StudioFestivalRecord === "function" && (rec.length + run.length) > 0 && (
        <PmSection n={N()} title="Festival record"><window.StudioFestivalRecord studio={studio} films={films}/></PmSection>
      )}

      <PmSection n={N()} title="Filmography" note={`${films.length} titles`}>
        {films.length ? <div className="pm-grid">{films.map(f => <PmPoster key={f.id} film={f}/>)}</div> : <p className="pm-lede">Nothing released yet.</p>}
      </PmSection>

      {posts.length > 0 && (
        <PmSection n={N()} title="From the notebook" note="Production diary" link="All posts on the site" onLink={() => pmGo(`/site/${studio.siteId}`)}>
          <div className="pm-duo">
            {posts.map(p => (
              <button key={p.id} className="pm-card pm-panel" onClick={() => window.cinaNotebook && cinaNotebook.open(p.id)}>
                <span className="pm-k"><b>{p.date}</b>{p.read ? ` · ${p.read}` : ""}</span>
                <span className="pm-card__t" style={{ fontSize: "var(--fs-title)", fontStyle: "italic" }}>{p.title || "Untitled"}</span>
                <span className="pm-card__s">{p.dek || p.excerpt || ""}</span>
              </button>
            ))}
          </div>
        </PmSection>
      )}

      {studio.upcoming?.length > 0 && (
        <PmSection n={N()} title="Upcoming" note="Dated on the slate">
          <div className="pm-index">
            {studio.upcoming.map(u => {
              const d = (window.CREATORS || []).find(c => c.id === u.creatorId);
              return (
                <button key={u.id} onClick={() => pmToggleReminder(`up:${studio.id}:${u.id}`, { label: u.title, sub: studio.name, date: u.date, to: `/studios/${studio.id}` })}>
                  <span className="pm-k"><b>{u.date.slice(5).replace("-", "/")}</b></span>
                  <span className="pm-index__name" style={{ fontSize: "clamp(24px, 2.6vw, 38px)" }}>{u.title}</span>
                  <span className="pm-k">{pmHasReminder(`up:${studio.id}:${u.id}`) ? <b>✓ Reminder set · </b> : null}{u.kind}{d ? ` · ${d.name}` : ""}</span>
                </button>
              );
            })}
          </div>
        </PmSection>
      )}

      {studio.plans?.length > 0 && (
        <PmSection n={N()} title="Subscribe" note="Paid directly to the filmmakers">
          <div className="pm-grid" style={{ "--pm-min": "260px" }}>
            {studio.plans.map(p => (
              <div key={p.id} className="pm-panel" style={{ display: "flex", flexDirection: "column", gap: 16, borderTopColor: p.pop ? "var(--c-amber)" : undefined, borderTopWidth: p.pop ? 2 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <span className="pm-h2" style={{ fontSize: "var(--fs-title)" }}>{p.name}</span>
                  <span className="pm-stat__v" style={{ fontSize: "var(--fs-title)" }}>${p.price}</span>
                </div>
                {p.savings && <span className="pm-k" style={{ color: "var(--c-good)" }}>{p.savings}</span>}
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", paddingLeft: 16, position: "relative" }}><span style={{ position: "absolute", left: 0, color: "var(--c-amber)" }}>—</span>{f}</li>)}
                </ul>
                <button className={"pm-btn" + (p.pop && !subbed ? " pm-btn--primary" : "") + (subbed && pmSubs().find(s => s.id === studio.id)?.plan === p.name ? " pm-btn--on" : "")} style={{ marginTop: "auto", justifyContent: "center" }} onClick={() => subscribe(p)}>{subbed && pmSubs().find(s => s.id === studio.id)?.plan === p.name ? "✓ Your plan" : subbed ? `Switch to ${p.name}` : `Choose ${p.name}`}</button>
              </div>
            ))}
          </div>
        </PmSection>
      )}
    </div>
  );
}

Object.assign(window, { PmSeries, PmStudioProfile });
