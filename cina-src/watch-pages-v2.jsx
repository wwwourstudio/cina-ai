// watch-pages-v2.jsx — History · Search results · Apply (become a creator)
// + Invoices & credit-ledger cards for Account → Plan & billing.
// Closes the last Sprint-2 punch-list items: /history, /search, /apply, #10.

const { useState: usP2, useEffect: ueP2, useMemo: umP2, useRef: urP2 } = React;

// ─── shared header (matches watch-extras PageHeader) ─────────────────────
function P2Header({ kicker, title, sub, right, count }) {
  // Same masthead as every kit page: mono index over a rule, display title, lede right.
  const [idx, ...rest] = String(kicker || "").split(/\s*[·—]\s*/);
  return (
    <PmMasthead bare index={idx} path={rest.join(" · ")} count={count} title={title} lede={sub}>{right}</PmMasthead>
  );
}

function P2Empty({ icon = "play", title, body, cta, children }) {
  return <CinaEmpty icon={icon} title={title} body={body} cta={cta}>{children}</CinaEmpty>;
}

function _p2Ago(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return new Date(ms).toLocaleDateString("en", { month: "short", day: "numeric" });
}

// ═══ /history — watch history ════════════════════════════════════════════
// Everything you've started or finished, resumable, removable, clearable.
function HistoryPage() {
  useSession();
  const entries = (SESSION.continued || [])
    .map(c => ({ ...c, film: CATALOG.find(f => f.id === c.filmId) }))
    .filter(c => c.film)
    .sort((a, b) => b.at - a.at);

  const inProgress = entries.filter(e => e.t / e.dur < 0.96);
  const finished   = entries.filter(e => e.t / e.dur >= 0.96);

  const removeEntry = (entry) => {
    SESSION.continued = (SESSION.continued || []).filter(c => !(c.filmId === entry.filmId && c.ep === entry.ep));
    try { localStorage.setItem("cina:continued", JSON.stringify(SESSION.continued)); } catch {}
    bumpSession();
    toast({ title: "REMOVED", text: `${entry.film.title} cleared from history` });
  };
  const clearAll = () => {
    SESSION.continued = [];
    try { localStorage.setItem("cina:continued", JSON.stringify([])); } catch {}
    bumpSession();
    toast({ title: "CLEARED", text: "Watch history is empty", kind: "good" });
  };

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <P2Header
        kicker="LIBRARY · HISTORY"
        title="Watch history"
        sub="Everything you've started or finished. Resume where you left off, or clear the record."
        right={<><PmLibraryTabs current="/history"/>{entries.length > 0 && <><span className="pm-sep"></span><button className="pm-chip" onClick={clearAll}>Clear all history</button></>}</>}
      />

      {entries.length === 0 ? (
        <P2Empty
          icon="play"
          title="Nothing watched yet"
          body="Films and episodes you start will show up here, with your exact spot saved."
          cta={<button className="btn btn-primary" style={{ height: 36 }} onClick={() => navigate("/")}>Browse films</button>}
        />
      ) : (
        <>
          {inProgress.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>IN PROGRESS · {inProgress.length}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inProgress.map((e, i) => <HistoryRow key={`p${i}`} entry={e} onRemove={removeEntry}/>)}
              </div>
            </section>
          )}
          {finished.length > 0 && (
            <section>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>FINISHED · {finished.length}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {finished.map((e, i) => <HistoryRow key={`f${i}`} entry={e} onRemove={removeEntry} finished/>)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function HistoryRow({ entry, onRemove, finished }) {
  const f = entry.film;
  const pct = Math.min(100, Math.round((entry.t / entry.dur) * 100));
  const remaining = Math.max(1, Math.round((entry.dur - entry.t) / 60));
  const myRating = (SESSION.ratings || {})[f.id];
  const dest = f.kind === "series" ? `/series/${f.id}/ep/${entry.ep || 1}` : `/film/${f.id}`;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18,
      padding: 12, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
    }}>
      <button onClick={() => navigate(dest)} className="btn-ghost" style={{
        width: 168, height: 95, padding: 0, borderRadius: "var(--r-2)", overflow: "hidden",
        background: f.color, flexShrink: 0, position: "relative", border: "none",
      }}>
        <FrameThumb kind={f.thumb} usePhoto/>
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.25)" }}>
          <span style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white") }}>
            <Icon name="play" size={14}/>
          </span>
        </span>
        {!finished && (
          <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.18)" }}>
            <span style={{ display: "block", width: `${pct}%`, height: "100%", background: "var(--c-amber)" }}></span>
          </span>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => navigate(dest)} className="t-display" style={{
            appearance: "none", border: "none", background: "transparent", padding: 0, cursor: "pointer",
            fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em",
          }}>{f.title}</button>
          {entry.ep != null && (
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", padding: "1px 6px", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)" }}>
              S{String(f.season || 1).padStart(2, "0")}·E{String(entry.ep).padStart(2, "0")}
            </span>
          )}
          {finished && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em" }}>● FINISHED</span>}
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 5 }}>
          {f.creator} · {f.genre[0]}
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 3 }}>
          {finished ? `watched ${_p2Ago(entry.at)}` : `${remaining}m left · paused ${_p2Ago(entry.at)}`}
          {myRating ? <span style={{ color: "var(--c-amber)", marginLeft: 10 }}>{"★".repeat(myRating)}</span> : null}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button className="btn btn-primary" style={{ height: 32, padding: "0 14px", fontSize: "var(--fs-body)" }} onClick={() => navigate(dest)}>
          <Icon name="play" size={11}/> {finished ? "Watch again" : "Resume"}
        </button>
        <button className="btn-ghost btn-icon" title="Remove from history" style={{ width: 32, height: 32 }} onClick={() => onRemove(entry)}>
          <Icon name="x" size={13}/>
        </button>
      </div>
    </div>
  );
}

// ═══ /search — full results page ═════════════════════════════════════════
// Reads ?q= from the route; filter chips + sort; films, series, studios.
function SearchResultsPage() {
  const route = useRoute();
  const [q, setQ] = usP2(route.params.q || "");
  const [kind, setKind] = usP2("all");    // all | film | series | studios
  const [sort, setSort] = usP2("match");  // match | rating | newest
  const inputRef = urP2(null);

  // Keep the field in sync when the SearchBar pushes a new query.
  ueP2(() => { setQ(route.params.q || ""); }, [route.params.q]);

  const ql = q.trim().toLowerCase();

  const scored = umP2(() => {
    if (!ql) return [];
    return CATALOG.map(f => {
      let score = 0;
      if (f.title.toLowerCase().includes(ql)) score += 100;
      if (f.title.toLowerCase().startsWith(ql)) score += 40;
      if (f.creator.toLowerCase().includes(ql)) score += 50;
      if (f.genre.some(g => g.toLowerCase().includes(ql))) score += 30;
      if ((f.moods || []).some(m => m.toLowerCase().includes(ql))) score += 20;
      if (f.logline.toLowerCase().includes(ql)) score += 15;
      return { f, score };
    }).filter(x => x.score > 0);
  }, [ql]);

  const studios = umP2(() => {
    if (!ql || typeof CREATORS === "undefined") return [];
    return CREATORS.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 6);
  }, [ql]);

  // Everything on Cina that isn't a film or a studio: live rooms, studio
  // equity tokens, festival screenings.
  const others = umP2(() => {
    if (!ql) return [];
    const out = [];
    Object.values(window.BRANCH_FILMS || {}).forEach(t => {
      if (!t.title.toLowerCase().includes(ql) && !String(t.director || "").toLowerCase().includes(ql)) return;
      out.push({ id: "room:" + t.filmId, cls: "ROOM", label: t.title,
        hint: (t.roomSize ? t.roomSize.toLocaleString() + " in room · " : "") + t.totalCuts + " cuts",
        color: t.accentColor || tkc("bad"), to: "/branches/" + t.filmId });
    });
    (window.STUDIOS || []).forEach(st => {
      const tk = window.stToken && window.stToken(st.id);
      if (!tk) return;
      if (!st.name.toLowerCase().includes(ql) && !tk.ticker.toLowerCase().includes(ql)) return;
      out.push({ id: "token:" + st.id, cls: "TOKEN", label: tk.ticker + " · " + st.name,
        hint: "$" + tk.price.toFixed(2) + " · " + tk.yieldApy.toFixed(1) + "% APY",
        color: tk.color || tkc("amber"), to: "/studios/" + st.id + "/token" });
    });
    (window.fvLineup ? window.fvLineup() : []).forEach((f, i) => {
      if (!f.title.toLowerCase().includes(ql)) return;
      out.push({ id: "fest:" + f.id, cls: "SCREENING", label: f.title,
        hint: "No. " + String(i + 1).padStart(2, "0") + " in the running order",
        color: "var(--c-amber)", to: "/festival/film/" + f.id });
    });
    return out.slice(0, 8);
  }, [ql]);

  let films = scored.filter(x => kind === "all" || x.f.kind === kind || (kind === "film" && x.f.kind !== "series"));
  if (sort === "match")  films = [...films].sort((a, b) => b.score - a.score);
  if (sort === "rating") films = [...films].sort((a, b) => b.f.rating - a.f.rating);
  if (sort === "newest") films = [...films].sort((a, b) => b.f.year - a.f.year);

  const nFilms  = scored.filter(x => x.f.kind !== "series").length;
  const nSeries = scored.filter(x => x.f.kind === "series").length;
  const total = scored.length + studios.length + others.length;
  const showStudios = (kind === "all" || kind === "studios") && studios.length > 0;
  const showOthers = (kind === "all" || kind === "elsewhere") && others.length > 0;

  const chip = (id, label, n) => (
    <button key={id} onClick={() => setKind(id)} style={{
      appearance: "none", cursor: "pointer", borderRadius: 999, padding: "5px 13px",
      border: `1px solid ${kind === id ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)"}`,
      background: kind === id ? "rgba(var(--accent-rgb),.1)" : "transparent",
      color: kind === id ? "var(--c-amber)" : "var(--c-ink-3)",
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 600,
      display: "inline-flex", gap: 7, alignItems: "center",
    }}>
      {label}{n != null && <span style={{ opacity: .65 }}>{n}</span>}
    </button>
  );

  return (
    <div style={{ padding: "32px var(--gutter) 80px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 14 }}>SEARCH</div>

      {/* Big query field */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 22,
        borderBottom: "1px solid var(--c-line-2)", paddingBottom: 14, maxWidth: 760,
      }}>
        <Icon name="search" size={20}/>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") navigate(`/search?q=${encodeURIComponent(q.trim())}`); }}
          placeholder="Films, series, studios, genres, moods…"
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
            color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "clamp(22px, 6vw, 34px)", letterSpacing: "-0.02em",
          }}
        />
        {q && (
          <button className="btn-ghost btn-icon" style={{ width: 32, height: 32 }} onClick={() => { setQ(""); inputRef.current?.focus(); }}>
            <Icon name="x" size={14}/>
          </button>
        )}
      </div>

      {ql && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {chip("all", "ALL", total)}
          {chip("film", "FILMS", nFilms)}
          {chip("series", "SERIES", nSeries)}
          {chip("studios", "STUDIOS", studios.length)}
          {others.length > 0 && chip("elsewhere", "ROOMS & TOKENS", others.length)}
          <span style={{ flex: 1 }}></span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={{
            height: 30, padding: "0 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
            borderRadius: "var(--r-2)", color: "var(--c-ink-2)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)", letterSpacing: ".08em",
          }}>
            <option value="match">BEST MATCH</option>
            <option value="rating">HIGHEST RATED</option>
            <option value="newest">NEWEST</option>
          </select>
        </div>
      )}

      {!ql ? (
        <P2Empty icon="search" title="Search all of Cina" body="Films, series, studios, rooms, tokens, screenings — start typing above, or press ⌘K from anywhere."/>
      ) : total === 0 ? (
        <P2Empty
          icon="search"
          title={window.cinaVoice ? window.cinaVoice("empty.search", q) : `Nothing for “${q}”`}
          body="Try a shorter word, a genre like “noir”, or a mood like “slow burn”."
          cta={<button className="btn btn-primary" style={{ height: 36 }} onClick={() => navigate("/genre/film")}>Browse films</button>}
        />
      ) : (
        <>
          {/* Studios strip */}
          {showStudios && (
            <section style={{ marginBottom: 32 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>STUDIOS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {studios.map(c => (
                  <button key={c.id} onClick={() => navigate(`/creator/${c.id}`)} className="btn-ghost" style={{
                    padding: 16, height: "auto", borderRadius: "var(--r-2)", background: "var(--c-panel)", border: "1px solid var(--c-line)",
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left", justifyContent: "flex-start",
                  }}>
                    <span style={{
                      width: 44, height: 44, borderRadius: "50%", background: c.color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
                    }}>{c.name.split(" ").map(p => p[0]).join("")}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{c.name}</span>
                      <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 2 }}>
                        {fmtCount(c.followers)} followers · {CATALOG.filter(f => f.creatorId === c.id).length} films
                      </span>
                    </span>
                    <Icon name="chev-r" size={12}/>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Rooms, tokens, screenings */}
          {showOthers && (
            <section style={{ marginBottom: 32 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>ELSEWHERE ON CINA</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {others.map(o => (
                  <button key={o.id} onClick={() => navigate(o.to)} className="btn-ghost" style={{
                    padding: 15, height: "auto", borderRadius: "var(--r-2)", background: "var(--c-panel)",
                    border: "1px solid var(--c-line)", borderLeft: `2px solid ${o.color}`,
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left", justifyContent: "flex-start",
                  }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: o.color, fontWeight: 700, marginBottom: 5 }}>{o.cls}</span>
                      <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
                      <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 3 }}>{o.hint}</span>
                    </span>
                    <Icon name="chev-r" size={12}/>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Film / series grid */}
          {kind !== "studios" && kind !== "elsewhere" && films.length > 0 && (
            <section>
              {showStudios && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>FILMS & SERIES</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
                {films.map(({ f }) => (
                  <button key={f.id} onClick={() => navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} className="btn-ghost" style={{
                    height: "auto", padding: 0, borderRadius: "var(--r-2)", overflow: "hidden",
                    display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0, textAlign: "left", justifyContent: "flex-start",
                    background: "var(--c-panel)", border: "1px solid var(--c-line)",
                  }}>
                    <span style={{ display: "block", aspectRatio: "16/9", background: f.color, overflow: "hidden", position: "relative" }}>
                      <FrameThumb kind={f.thumb} usePhoto/>
                      {f.kind === "series" && (
                        <span className="t-mono" style={{
                          position: "absolute", top: 8, left: 8, fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em",
                          padding: "2px 6px", background: "rgba(0,0,0,.55)", borderRadius: "var(--r-1)",
                        }}>SERIES</span>
                      )}
                    </span>
                    <span style={{ display: "block", padding: 12 }}>
                      <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{f.title}</span>
                      <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{f.creator}</span>
                      <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4 }}>{f.year} · {f.genre[0]} · ★ {f.rating}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {kind !== "studios" && films.length === 0 && !showStudios && (
            <P2Empty icon="search" title="No matches in this filter" body="Switch back to All — there may be studios or series that match."/>
          )}
        </>
      )}
    </div>
  );
}

// ═══ /apply — become a creator ═══════════════════════════════════════════
// The missing path from Watch into Studio for a new filmmaker.
function ApplyPage() {
  const [format, setFormat] = usP2(null);
  const [title, setTitle] = usP2("");
  const formats = [
    { id: "short",  label: "Short film",   sub: "5–20 min · fastest path to a premiere" },
    { id: "feature", label: "Feature",     sub: "70–120 min · full theatrical treatment" },
    { id: "series", label: "Series",       sub: "Weekly drops · build a returning audience" },
    { id: "branch", label: "Branched film", sub: "The audience votes the story forward" },
  ];

  const begin = () => {
    try {
      localStorage.setItem("cina:apply-draft", JSON.stringify({ format, title: title.trim(), at: Date.now() }));
    } catch {}
    toast({ title: "WELCOME TO THE STUDIO", text: title.trim() ? `“${title.trim()}” — let's make it` : "Your studio is opening", kind: "good" });
    setTimeout(() => { window.location.href = "Cina.html"; }, 600);
  };

  const steps = [
    { n: "01", t: "Tell the machine what you see", d: "Describe a scene in plain words. The crew — writer, cinematographer, editor, composer — drafts it back as footage." },
    { n: "02", t: "Direct, don't render", d: "Give notes the way a director does. Performance, pacing, light. Every pass is yours to keep or kill." },
    { n: "03", t: "Premiere on Watch", d: "Ship the master and it's live on the same shelves as every film here — with your name on the card." },
    { n: "04", t: "Get backed", d: "Open a producer pool. Your audience co-finances the next one and shares the royalties." },
  ];

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <PmMasthead bare index="Make" path="Become a creator" title="Every film on this site was made by someone who started where you are." lede="Cina Studio is the same tool the directors on the front page use — an AI crew that turns direction into footage. There's no application to pass. Pick a format, name the thing, and start."/>

      {/* How it works */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 48 }}>
        {steps.map(s => (
          <div key={s.n} style={{ padding: "18px 18px 20px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 }}>{s.n}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 8, letterSpacing: "-0.01em" }}>{s.t}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55 }}>{s.d}</div>
          </div>
        ))}
      </div>

      {/* Start block */}
      <div style={{
        padding: 28, borderRadius: "var(--r-2)", border: "1px solid var(--c-line)",
        background: "linear-gradient(135deg, rgba(var(--accent-rgb),.05) 0%, var(--c-panel) 60%)",
      }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 16 }}>START YOUR FIRST PROJECT</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
          {formats.map(fm => (
            <button key={fm.id} onClick={() => setFormat(fm.id)} style={{
              appearance: "none", cursor: "pointer", textAlign: "left",
              padding: "14px 16px", borderRadius: "var(--r-2)",
              border: `1px solid ${format === fm.id ? "rgba(var(--accent-rgb),.5)" : "var(--c-line-2)"}`,
              background: format === fm.id ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
              transition: "border-color .14s, background .14s",
            }}>
              <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", color: format === fm.id ? "var(--c-amber)" : "var(--c-ink)" }}>{fm.label}</span>
              <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 5, lineHeight: 1.45 }}>{fm.sub}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && format) begin(); }}
            placeholder="Working title — you can change it later"
            style={{
              flex: 1, minWidth: 260, height: 44, padding: "0 16px",
              background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
              color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
            }}
          />
          <button
            className="btn btn-primary"
            style={{ height: 44, padding: "0 22px", fontSize: "var(--fs-body)", opacity: format ? 1 : .45 }}
            disabled={!format}
            onClick={begin}
          >
            Open the Studio <Icon name="chev-r" size={12}/>
          </button>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 12 }}>
          FREE TO START · 120 RENDER CREDITS INCLUDED · YOU OWN EVERYTHING YOU MAKE
        </div>
      </div>

      {/* Proof strip */}
      <div style={{ display: "flex", gap: 28, marginTop: 28, padding: "18px 4px 0", borderTop: "1px solid var(--c-line)", flexWrap: "wrap" }}>
        {[
          ["2,400+", "films premiered from the Studio"],
          ["$1.9M", "paid to creators this year"],
          ["68%", "of front-page films are first features"],
        ].map(([v, k]) => (
          <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>{v}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>{k.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ Account → billing depth (#10): invoices + credit ledger ═════════════

const P2_INVOICES = [
  { id: "INV-0231", date: "May 1, 2026", what: "Cina Premium · monthly", amt: 8.99, status: "paid" },
  { id: "INV-0224", date: "Apr 18, 2026", what: "Credits · 500 pack", amt: 25.00, status: "paid" },
  { id: "INV-0219", date: "Apr 1, 2026", what: "Cina Premium · monthly", amt: 8.99, status: "paid" },
  { id: "INV-0203", date: "Mar 12, 2026", what: "Premiere ticket · The Long Quiet", amt: 12.00, status: "paid" },
  { id: "INV-0198", date: "Mar 1, 2026", what: "Cina Premium · monthly", amt: 8.99, status: "paid" },
];

const P2_LEDGER = [
  { when: "May 28", what: "Rented Cobalt Run", delta: -120, kind: "spend" },
  { when: "May 21", what: "Tip → Mara Senn, after the premiere", delta: -50, kind: "spend" },
  { when: "May 9",  what: "Watch-party ticket · Last Light E5", delta: -80, kind: "spend" },
  { when: "Apr 18", what: "Bought 500-credit pack", delta: +500, kind: "buy" },
  { when: "Apr 2",  what: "Promo · premiere week", delta: +100, kind: "earn" },
];

function InvoicesCard() {
  return (
    <section style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 22, marginBottom: 14 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 4 }}>Invoices</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>Every charge to your card, with downloadable receipts.</div>
      </div>
      <div>
        {P2_INVOICES.map(inv => (
          <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: "1px solid var(--c-line)" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", width: 76, flexShrink: 0 }}>{inv.id}</span>
            <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{inv.what}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", width: 90, textAlign: "right" }}>{inv.date}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", width: 64, textAlign: "right" }}>${inv.amt.toFixed(2)}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", width: 40 }}>PAID</span>
            <button className="btn" style={{ height: 26, fontSize: "var(--fs-label)" }} onClick={() => toast({ title: "RECEIPT", text: `${inv.id} — PDF saved to downloads`, kind: "good" })}>Receipt</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// The export button used to announce "Ledger CSV saved to downloads" without
// writing a file — the one claim a user checks immediately. Now it builds the
// CSV from the same ledger the card renders and downloads it for real.
function exportLedgerCsv() {
  const opening = 230;
  let running = opening;
  const rows = [["Date", "Description", "Change (credits)", "Balance"]];
  P2_LEDGER.forEach(e => {
    running += e.delta;
    rows.push([e.when, e.what, (e.delta > 0 ? "+" : "") + e.delta, String(running)]);
  });
  const esc = (v) => /[",\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : v;
  const csv = rows.map(r => r.map(esc).join(",")).join("\r\n");
  try {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cina-credit-ledger-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    if (window.toast) toast({ title: "EXPORTED", text: rows.length - 1 + " entries · balance " + running + " credits", kind: "good" });
  } catch (_) {
    if (window.toast) toast({ title: "EXPORT FAILED", text: "Your browser blocked the download.", kind: "bad" });
  }
}

function CreditLedgerCard() {
  const balance = P2_LEDGER.reduce((s, e) => s + e.delta, 0) + 230; // opening balance
  return (
    <section style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 22, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 4 }}>Credit ledger</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>What you bought, what you spent, and on what.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>BALANCE</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 2 }}>{balance} <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>credits</span></div>
        </div>
      </div>
      <div>
        {P2_LEDGER.map((e, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 0", borderTop: "1px solid var(--c-line)" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", width: 52, flexShrink: 0 }}>{e.when}</span>
            <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{e.what}</span>
            <span className="t-mono" style={{
              fontSize: "var(--fs-body)", fontWeight: 600, width: 64, textAlign: "right",
              color: e.delta > 0 ? "var(--c-good)" : "var(--c-ink)",
            }}>{e.delta > 0 ? "+" : ""}{e.delta}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button className="btn btn-primary" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={() => window.openPay && window.openPay({
          kind: "buy", title: "500-credit pack", subtitle: "Credits never expire · usable on rentals, tips and tickets", priceUSD: 25,
        })}>Buy credits</button>
        <button className="btn" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={exportLedgerCsv}>Export CSV</button>
      </div>
    </section>
  );
}

Object.assign(window, { HistoryPage, SearchResultsPage, ApplyPage, InvoicesCard, CreditLedgerCard });
