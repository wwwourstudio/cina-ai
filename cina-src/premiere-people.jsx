// premiere-people.jsx — Cast profile on the Premiere system.

function PmCastProfile({ id }) {
  useSession && useSession();
  const actor = typeof getCast === "function" ? getCast(id) : (window.CAST || []).find(c => c.id === id);
  const [, bump] = usPm(0);
  if (!actor) return <div className="pm"><PmMasthead index="—" path="Cast" title="Performer not found" lede="They may have been renamed or removed."><button className="pm-btn" onClick={() => pmGo("/cast")}>All cast</button></PmMasthead></div>;
  const rec = window.TalentAPI ? TalentAPI.get(id) : null;
  const lic = (rec && rec.licensing) || { base: 1900, royalty: 27, out: 0 };
  const films = (actor.roles || []).map(r => ({ role: r, film: window.getFilm ? getFilm(r.filmId) : pmFilm(r.filmId) })).filter(x => x.film);
  const following = typeof isFollowing === "function" && isFollowing(actor.id);
  const first = actor.name.split(" ")[0];
  const prod = (window.V3_PRODUCTION || {})[actor.id];
  const co = (() => {
    const set = new Set();
    (actor.roles || []).forEach(r => (window.CAST || []).forEach(o => { if (o.id !== actor.id && (o.roles || []).some(x => x.filmId === r.filmId)) set.add(o); }));
    return [...set];
  })();
  const axes = ["Drama", "Comedy", "Action", "Quiet", "Voice", "Period"];
  const seed = actor.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const scores = axes.map((_, i) => Math.min(1, 0.5 + seed * (i + 3) % 50 / 100));
  const toStudio = (intent, toast) => window.xActor ? xActor("Cina.html", { intent, actorId: actor.id, actorName: actor.name }, toast) : (window.location.href = "Cina.html");
  let n = 0; const N = () => String(++n).padStart(2, "0");

  return (
    <div className="pm" data-screen-label={`Cast · ${actor.name}`}>
      <PmHero short
        media={typeof CastPortrait === "function" ? <CastPortrait actor={actor} size={1400} shot="wide" cover/> : null}
        imageSrc={typeof CastPortrait === "function" ? null : actor.photo}
        kicker={<><b>{actor.archetype}</b> — {actor.handle}</>}
        title={actor.name} lede={actor.bio}
        actions={<>
          <button className={"pm-btn" + (following ? " pm-btn--glass pm-btn--on" : " pm-btn--primary")} onClick={() => { typeof toggleFollow === "function" && toggleFollow(actor.id); bump(x => x + 1); }}>{following ? "✓ Following" : `Follow ${first}`}</button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/cast/${actor.id}/studio`)}>AI Studio</button>
          <button className="pm-btn pm-btn--glass" onClick={() => pmGo(`/journey/${actor.id}`)}>Career journey</button>
          <button className="pm-btn pm-btn--glass" onClick={() => toStudio("cast", { title: "OPENING STUDIO", text: `${actor.name} · cast`, kind: "good" })}>Cast in a film ↗</button>
        </>}
        facts={[
          ["Appearances", actor.appearances],
          ["Followers", pmNum((actor.followers || 0) + (following ? 1 : 0))],
          ["Leads", (actor.roles || []).filter(r => r.lead).length],
          ["Licenses", lic.out > 0 ? `${lic.out} active` : "Open · per project"],
          ["Range", actor.range],
        ]}/>

      {prod && (
        <section className="pm-wrap" style={{ marginTop: 8 }}>
          <button className="pm-card pm-panel" onClick={() => toStudio("vault", { title: "OPENING STUDIO", text: `${actor.name} · ${prod.role}`, kind: "good" })}
            style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 20, alignItems: "center", width: "100%" }}>
            <span className="pm-k"><b>● Now in production</b></span>
            <span style={{ fontSize: "var(--fs-body)" }}>Playing <b>{prod.role}</b> in <i style={{ fontFamily: "var(--f-display)" }}>{prod.film}</i></span>
            <span className="pm-link">Open in Studio ↗</span>
          </button>
        </section>
      )}

      <PmSection n={N()} title="Filmography" note={`${films.length} credits`}>
        {films.length ? (
          <div className="pm-grid" style={{ "--pm-min": "280px" }}>
            {films.map(({ film, role }) => (
              <PmStill key={film.id} film={film} badge={role.lead ? { t: "Lead", red: true } : null}
                meta={`As ${role.as || "ensemble"} · ${film.year}${film.kind === "series" ? ` · Season ${film.season}` : ""}`}
                onClick={() => pmGo(film.branched ? `/branches/${film.id}` : pmDest(film))}/>
            ))}
          </div>
        ) : (
          <PmEmpty title="No screen credits yet." body={`${actor.name} is vault-ready. Cast ${first} in a film and the credit lands here.`}>
            <button className="pm-btn pm-btn--primary" onClick={() => toStudio("cast", { title: "OPENING STUDIO", text: `${actor.name} · cast`, kind: "good" })}>{`Cast ${first} in a film`}</button>
          </PmEmpty>
        )}
      </PmSection>

      {window.CareerRailV3 && <PmSection n={N()} title="Career" note="Lifecycle on Cina"><CareerRailV3 actor={actor} rec={rec} accent="var(--c-amber)"/></PmSection>}

      <PmSection n={N()} title="Vitals and range">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "clamp(28px, 5vw, 96px)", alignItems: "center" }}>
          <PmFacts items={[["Born", actor.born], ["Height", actor.height], ["Voice", actor.voice], ["Presence", actor.presence], ["Languages", (actor.languages || []).join(" · ")],
            ["Vault ID", `VLT-${actor.id.toUpperCase().replace(/-/g, "")}-${String(actor.seed || 0).padStart(2, "0")}`], ["Continuity", `Locked · ${actor.appearances} titles`]]}/>
          {window.RangeRadarV3 && <div style={{ maxWidth: 380, width: "100%", justifySelf: "center" }}><RangeRadarV3 axes={axes} scores={scores} color={tkc("amber")}/></div>}
        </div>
      </PmSection>

      {window.ConnectedWorkflowsV3 && <PmSection n={N()} title={`Work with ${first}`} note="Generate, cast, license"><ConnectedWorkflowsV3 actor={actor} accent={tkc("amber")}/></PmSection>}

      {co.length > 0 && (
        <PmRailSection n={N()} title="Has worked with" col="person" link="All cast" onLink={() => pmGo("/cast")}>
          {co.map(p => <PmPerson key={p.id} person={p}/>)}
        </PmRailSection>
      )}

      <PmSection n={N()} title="Recognition and terms">
        <div className="pm-duo" style={{ alignItems: "start" }}>
          <div className="pm-index">
            {(actor.awards || []).length ? actor.awards.map((a, i) => (
              <div key={i} className="pm-row" style={{ gridTemplateColumns: "48px minmax(0,1fr)", cursor: "default" }}>
                <span className="pm-k"><b>★</b></span><span style={{ fontSize: "var(--fs-lead)" }}>{a}</span>
              </div>
            )) : <PmEmpty title="No awards yet." body="Festival laurels and juried prizes appear here."/>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PmFacts items={[["Base · full project", `$${lic.base.toLocaleString()}`], ["Royalty to performer", `${lic.royalty}% rev share`], ["Usage", "Allow-list · on-chain"]]}/>
            <div className="pm-actions"><button className="pm-btn" onClick={() => toStudio("license", { title: "OPENING STUDIO", text: `License ${actor.name}`, kind: "good" })}>{`License ${first} ↗`}</button></div>
          </div>
        </div>
      </PmSection>
    </div>
  );
}

Object.assign(window, { PmCastProfile });
