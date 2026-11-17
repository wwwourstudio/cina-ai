// watch-series.jsx — Series page: season layout, scheduled drops, ritual.

const { useState: usss, useEffect: uess, useMemo: umss } = React;

function SeriesPage({ seriesId }) {
  const film = getFilm(seriesId);
  if (!film || film.kind !== "series") return <div style={{ padding: 56 }}>Series not found.</div>;

  const released = film.series.filter(e => e.status === "released");
  const scheduled = film.series.filter(e => e.status === "scheduled");
  const next = scheduled[0];
  const finale = scheduled[scheduled.length - 1];
  const watchedCount = released.filter(e => e.watched > 0).length;
  const allWatched = released.every(e => e.watched >= 0.99);
  const watching = released.find(e => e.watched > 0 && e.watched < 1);
  const continueWith = watching || released.find(e => e.watched === 0) || released[0];

  const t = next ? timeUntilFromNow(next.drop + "T19:00:00") : null;

  return (
    <div>
      {/* Hero — full bleed */}
      <section style={{
        position: "relative",
        height: "min(64vh, 620px)",
        minHeight: 440,
        background: film.color,
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <FrameThumb kind={film.thumb} usePhoto/>
        </div>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(8,8,10,.95) 0%, rgba(8,8,10,.7) 40%, rgba(8,8,10,.2) 70%, transparent 100%)",
        }}/>
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: "60%",
          background: "linear-gradient(to top, var(--c-bg) 0%, rgba(8,8,10,.6) 50%, transparent 100%)",
        }}/>

        <div style={{
          position: "absolute", inset: 0,
          padding: "60px var(--gutter) 80px",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          maxWidth: 760,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span className="t-mono" style={{
              fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 600,
              padding: "4px 8px",
              border: "1px solid rgba(var(--accent-rgb),.5)",
              borderRadius: "var(--r-1)",
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(8px)",
            }}>SERIES · CINA ORIGINAL</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>
              SEASON {film.season} · {film.totalEpisodes} EPISODES · WEEKLY
            </span>
          </div>

          <h1 className="t-display" style={{
            fontStyle: "italic",
            fontSize: "clamp(56px, 7vw, 104px)",
            lineHeight: 0.95,
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
            textShadow: "0 4px 30px rgba(0,0,0,.6)",
          }}>{film.title}</h1>

          <p style={{
            fontSize: "var(--fs-lead)", lineHeight: 1.5,
            color: "var(--c-ink)", margin: "0 0 8px", maxWidth: 580,
            textShadow: "0 2px 12px rgba(0,0,0,.7)",
          }}>{film.synopsis}</p>

          <div style={{ display: "flex", gap: 14, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginBottom: 28, alignItems: "center" }}>
            <span className="t-mono">{film.creator}</span>
            <span style={{ width: 3, height: 3, background: "var(--c-ink-3)", borderRadius: "50%" }}/>
            <span>{film.genre.join(" · ")}</span>
            <span style={{ width: 3, height: 3, background: "var(--c-ink-3)", borderRadius: "50%" }}/>
            <span style={{ color: "var(--c-amber)" }}>★ {film.rating} <span style={{ color: "var(--c-ink-3)" }}>({fmtCount(film.ratings)})</span></span>
            <span style={{ width: 3, height: 3, background: "var(--c-ink-3)", borderRadius: "50%" }}/>
            <span>{fmtViews(film.views)} viewers</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              style={{ height: 46, padding: "0 24px", fontSize: "var(--fs-body)", gap: 8 }}
              onClick={() => navigate(`/series/${film.id}/ep/${continueWith.ep}`)}
            >
              <Icon name="play" size={14}/>
              {watching ? `Continue · S${film.season}·E${watching.ep}` : watchedCount === 0 ? "Start watching" : "Resume"}
            </button>
            <button className="btn" style={{ height: 46, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8 }} onClick={() => window.cinaNotYet && window.cinaNotYet("The season trailer", "No trailer cut for this season yet — the film itself is up.")}>
              <Icon name="play" size={12}/>
              Season trailer </button>
            <button className="btn" style={{ height: 46, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8 }} onClick={() => toast({ title: "FOLLOWING", text: `Get notified when ${film.title} drops`, kind: "good" })}>
              <Icon name="bell" size={13}/>
              Set alert
            </button>
            {film.nftPremiere && (
              <button
                className="btn"
                style={{
                  height: 46, padding: "0 18px", fontSize: "var(--fs-body)", gap: 8,
                  background: "rgba(var(--accent-rgb),.08)", borderColor: "rgba(var(--accent-rgb),.4)",
                  color:  "var(--c-amber)",
                }}
                onClick={() => navigate(`/nft/${film.nft}`)}
              >
                <Icon name="ticket" size={13}/>
                Invest · NFT
              </button>
            )}

            {next && t && (
              <div style={{
                height: 46, padding: "0 16px",
                background: "rgba(0,0,0,.5)",
                border: "1px solid var(--c-line-2)",
                borderRadius: "var(--r-2)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>
                  {next.finale ? "FINALE IN" : `EP ${next.ep} IN`}
                </div>
                <span style={{ width: 1, height: 18, background: "var(--c-line-2)" }}/>
                <div className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: t.urgent ? "var(--c-blood-l)" : "var(--c-amber)", fontWeight: 600, letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                  {t.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <div style={{ padding: "32px var(--gutter) 64px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
        {/* The programmer's argument — why this series earns its place */}
        <FromTheProgrammer film={film} style={{ maxWidth: 920 }}/>

        {/* Season-progress strip */}
        <div style={{
          padding: "16px 20px",
          background: "var(--c-panel)",
          border: "1px solid var(--c-line)",
          borderRadius: "var(--r-2)",
          marginBottom: 28,
          display: "flex", alignItems: "center", gap: 24,
        }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>YOUR PROGRESS</div>
            <div className="t-num" style={{ fontSize: "var(--fs-title)", fontWeight: 600 }}>
              <span style={{ color: "var(--c-amber)" }}>{watchedCount}</span>
              <span style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-lead)", fontWeight: 400 }}> / {film.totalEpisodes}</span>
              <span style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-body)", marginLeft: 8 }}>watched</span>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 3, alignItems: "center" }}>
            {film.series.map((e, i) => (
              <div key={i} style={{
                flex: 1, height: 24,
                background: e.watched > 0 ? "var(--c-amber)" : e.status === "scheduled" ? "var(--c-line)" : "var(--c-line-2)",
                opacity: e.watched > 0 ? (0.4 + e.watched * 0.6) : (e.status === "scheduled" ? 0.4 : 1),
                borderRadius: "var(--r-1)",
                position: "relative",
              }} title={`E${e.ep} ${e.title}`}>
                {e.status === "scheduled" && (
                  <div style={{
                    position: "absolute", inset: 0,
                    border: "1px dashed var(--c-line-3)",
                    borderRadius: "var(--r-1)",
                  }}/>
                )}
              </div>
            ))}
          </div>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>WEEKLY DROPS</div>
            <div className="t-num" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>
              Fridays · 7:00 PM ET
            </div>
          </div>
        </div>

        {/* ⑂ Season-level branch map — your path through the season */}
        {window.SeasonArcMap && <SeasonArcMap film={film}/>}

        {/* Two-column: episodes + ritual rail */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
          {/* Episodes list */}
          <section>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 18 }}>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0, letterSpacing: "-0.01em" }}>
                Episodes
              </h2>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                Season {film.season} · {film.totalEpisodes} episodes
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {film.series.map(e => <EpisodeRow key={e.ep} film={film} ep={e}/>)}
            </div>
          </section>

          {/* Ritual rail */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Director / studio — shared card, mirrors the film watch page */}
            {window.DirectorStudioCard ? <DirectorStudioCard film={film}/> : <SeriesDirectorCard film={film}/>}

            {/* Next-drop countdown */}
            {next && t && <CountdownCard ep={next} t={t} film={film}/>}

            {/* Drop schedule */}
            <ScheduleCard film={film}/>

            {/* Hiatus marketing slot */}
            {finale && <HiatusCard film={film} finale={finale}/>}
          </aside>
        </div>

        {/* ─── Extras: cast, world, commentary, theories, related ─── */}
        <SeriesExtras film={film}/>
      </div>
    </div>
  );
}

// ─── SeriesExtras — richer below-the-fold content ────────────────────────
function SeriesExtras({ film }) {
  return (
    <>
      {/* Cast row */}
      {typeof FilmCastRow === "function" && (
        <section style={{ marginTop: 56 }}>
          <FilmCastRow filmId={film.id} max={6}/>
        </section>
      )}

      {/* World of … */}
      <WorldOfSection film={film}/>

      {/* Director commentary */}
      <DirectorCommentary film={film}/>

      {/* Fan theories */}
      <FanTheories film={film}/>

      {/* You might also like */}
      <RelatedSeries currentId={film.id}/>
    </>
  );
}

// World moodboard — 4 visual pillars
function WorldOfSection({ film }) {
  const accent = film.color || tkc("amber");
  const pillars = [
    { label: "WORLD",     v: "Salvage tug · LEO · 2074",  sub: "Working-class crew, rust-bitten metal, three months from home." },
    { label: "MOOD",      v: "Cold light · long quiet",   sub: "Composed in 2.39:1. Camera held until something looks back." },
    { label: "PALETTE",   v: "Steel · brick · neon",      sub: "Three colors. We never break them.", swatch: [accent, tkc("cat-6"), tkc("cat-3")] },
    { label: "SOUND",     v: "Distant. Mostly silence.",  sub: "Score is one cello and a room mic. The ship hums in C." },
  ];
  return (
    <section style={{ marginTop: 56 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600 }}>
          The world of
        </span>
        <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em" }}>{film.title}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {pillars.map((p, i) => (
          <div key={i} style={{
            padding: 22,
            background: "var(--c-panel)",
            border: "1px solid var(--c-line)",
            borderLeft: `2px solid ${accent}`,
            borderRadius: "var(--r-2)",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent }}>{p.label}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: "var(--c-ink)", lineHeight: 1.15 }}>{p.v}</div>
            {p.swatch && (
              <div style={{ display: "flex", gap: 4 }}>
                {p.swatch.map((c, j) => (
                  <div key={j} style={{ width: 28, height: 14, background: c, border: "1px solid var(--c-line-2)" }}/>
                ))}
              </div>
            )}
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{p.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Director commentary
function DirectorCommentary({ film }) {
  const accent = film.color || tkc("amber");
  return (
    <section style={{ marginTop: 56,
      display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "flex-start",
      padding: 32,
      background: `linear-gradient(135deg, ${accent}10 0%, var(--c-panel) 70%)`,
      border: "1px solid var(--c-line)",
      borderLeft: `2px solid ${accent}`,
      borderRadius: "var(--r-2)",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}40 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: "var(--fs-title)", color: tkc("white"), fontWeight: 500, flexShrink: 0,
      }}>{film.creator?.split(" ").map(p => p[0]).join("").slice(0, 2)}</div>
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: 8 }}>
          DIRECTOR'S NOTE · S{film.season}
        </div>
        <blockquote style={{
          margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: "var(--fs-title)", lineHeight: 1.45, color: "var(--c-ink)",
          maxWidth: 880,
        }}>
          "We made this season about the kind of attention that wears you down. The crew don't hate each other — they're just tired of looking at each other. Watch for what they don't say. The script is a third the size of the runtime."
        </blockquote>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginTop: 14 }}>
          — {film.creator}
        </div>
      </div>
    </section>
  );
}

// Fan theories
function FanTheories({ film }) {
  const accent = film.color || tkc("amber");
  const LS = "cina:theories:" + film.id;
  const SEED = [
    { id: "t1", user: "@maela",      text: "The salvage manifest from ep 02 — same serial as the ship in Voss's Bluejay. Yara is universe-stitching.", votes: 1284, ago: "3h" },
    { id: "t2", user: "@phch_n",     text: "The hum frequency is the same as Frequency 88.6. Two shows, same signal. Wake up.",                     votes:  944, ago: "6h" },
    { id: "t3", user: "@bex_studio", text: "Captain is a ghost. Notice she only speaks when no one else is on screen.",                              votes:  812, ago: "1d" },
    { id: "t4", user: "@orin",       text: "Episode 4 'Hatch' will be a bottle episode. The script breakdown leaked — 11 scene headings, all interior.", votes:  611, ago: "1d" },
  ];
  const [theories, setTheories] = usss(() => {
    try { const v = JSON.parse(localStorage.getItem(LS)); if (Array.isArray(v) && v.length) return v; } catch (e) {}
    return SEED;
  });
  const [votes, setVotes] = usss(() => { try { return JSON.parse(localStorage.getItem(LS + ":v")) || {}; } catch (e) { return {}; } });
  const [composing, setComposing] = usss(false);
  const [draft, setDraft] = usss("");
  const [handle, setHandle] = usss(() => { try { return localStorage.getItem("cina:theory-handle") || ""; } catch (e) { return ""; } });

  const persist = (list, v) => {
    setTheories(list); setVotes(v);
    try { localStorage.setItem(LS, JSON.stringify(list)); localStorage.setItem(LS + ":v", JSON.stringify(v)); } catch (e) {}
  };
  const vote = (id, dir) => {
    const cur = votes[id] || 0;
    const next = cur === dir ? 0 : dir;              // toggle off if same, else set
    const delta = next - cur;                        // -2..+2
    const list = theories.map(t => t.id === id ? { ...t, votes: t.votes + delta } : t);
    persist(list, { ...votes, [id]: next });
  };
  const post = () => {
    const text = draft.trim(); if (!text) return;
    const u = (handle.trim() || "you").replace(/^@/, "");
    try { localStorage.setItem("cina:theory-handle", "@" + u); } catch (e) {}
    const t = { id: "t" + Date.now(), user: "@" + u, text, votes: 1, ago: "now" };
    persist([t, ...theories], { ...votes, [t.id]: 1 });
    setDraft(""); setComposing(false);
    if (window.toast) window.toast({ title: "POSTED", text: "Your theory is live in the room.", kind: "good" });
  };

  return (
    <section style={{ marginTop: 56 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600 }}>
            Theories · live
          </span>
          <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em" }}>What the room thinks</h2>
        </div>
        <button onClick={() => setComposing(c => !c)} style={{
          padding: "8px 14px",
          background: composing ? accent : "transparent", color: composing ? tkc("bg") : accent,
          border: `1px solid ${accent}55`, borderRadius: "var(--r-1)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 600,
          letterSpacing: ".16em", textTransform: "uppercase",
          cursor: "pointer",
        }}>{composing ? "Close" : "Post a theory →"}</button>
      </div>

      {composing && (
        <div style={{ marginBottom: 16, padding: 18, background: "var(--c-panel)", border: `1px solid ${accent}55`, borderRadius: "var(--r-2)" }}>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} autoFocus
            placeholder="Drop your theory. What's really going on in this show?"
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) post(); }}
            style={{ width: "100%", boxSizing: "border-box", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", padding: "12px 14px", lineHeight: 1.5, resize: "vertical", outline: "none" }}/>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>@</span>
            <input value={handle.replace(/^@/, "")} onChange={e => setHandle(e.target.value.replace(/[^a-z0-9_]/gi, ""))} placeholder="handle"
              style={{ width: 140, background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", padding: "8px 10px", outline: "none" }}/>
            <span style={{ flex: 1 }}/>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>⌘↵ TO POST</span>
            <button onClick={post} disabled={!draft.trim()} style={{
              padding: "9px 18px", borderRadius: "var(--r-2)", border: "none", cursor: draft.trim() ? "pointer" : "default",
              background: draft.trim() ? accent : "var(--c-line-2)", color: draft.trim() ? tkc("bg") : "var(--c-ink-4)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>Post</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: 12 }}>
        {theories.map((t) => {
          const mv = votes[t.id] || 0;
          return (
          <div key={t.id} style={{
            padding: 20,
            background: "var(--c-panel)",
            border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)",
            display: "flex", gap: 14,
          }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              flexShrink: 0, minWidth: 36,
            }}>
              <button onClick={() => vote(t.id, 1)} title="Upvote" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1, color: mv === 1 ? accent : "var(--c-ink-4)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)" }}>▲</button>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1, margin: "2px 0" }}>{t.votes.toLocaleString()}</div>
              <button onClick={() => vote(t.id, -1)} title="Downvote" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1, color: mv === -1 ? accent : "var(--c-ink-4)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)" }}>▼</button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.5, marginBottom: 8,
              }}>"{t.text}"</div>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", color: "var(--c-ink-3)",
                textTransform: "uppercase",
              }}>{t.user} · {t.ago}</div>
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

// Related series — pick 3 series from CATALOG, exclude current
function RelatedSeries({ currentId }) {
  const list = (typeof CATALOG !== "undefined")
    ? CATALOG.filter(f => f.kind === "series" && f.id !== currentId).slice(0, 4)
    : [];
  if (list.length === 0) return null;
  return (
    <section style={{ marginTop: 56, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 600 }}>
          For viewers of this
        </span>
        <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em" }}>Watch next</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {list.map(f => (
          <button key={f.id} onClick={() => navigate(`/series/${f.id}`)} style={{
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-2)", overflow: "hidden", cursor: "pointer",
            display: "flex", flexDirection: "column",
            padding: 0, textAlign: "left", color: "inherit",
            transition: "border-color .14s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-line-3)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-line)"}>
            <div style={{ aspectRatio: "16/9", background: f.color, position: "relative" }}>
              {typeof FrameThumb === "function" && <FrameThumb kind={f.thumb} usePhoto/>}
              <div style={{
                position: "absolute", top: 8, left: 8,
                padding: "3px 7px",
                background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.15)",
                color: tkc("white"), fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", borderRadius: "var(--r-1)",
              }}>S{f.season} · {f.totalEpisodes} EP</div>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 }}>{f.title}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 4 }}>{f.creator}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                <span>{f.year}</span>
                <span>·</span>
                <span style={{ color: "var(--c-amber)" }}>★ {f.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Episode row ─────────────────────────────────────────────────────────
function EpisodeRow({ film, ep }) {
  const isReleased = ep.status === "released";
  const isWatched = ep.watched >= 0.99;
  const inProgress = ep.watched > 0 && ep.watched < 1;
  const isNew = ep.new;
  const isPremiere = ep.premiere;

  return (
    <button
      onClick={() => isReleased && navigate(`/series/${film.id}/ep/${ep.ep}`)}
      className="btn-ghost"
      disabled={!isReleased}
      style={{
        padding: 16, height: "auto", borderRadius: "var(--r-2)", gap: 16,
        display: "flex", alignItems: "stretch", justifyContent: "flex-start",
        background: isReleased ? "var(--c-panel)" : "transparent",
        border: "1px solid var(--c-line)",
        textAlign: "left",
        cursor: isReleased ? "pointer" : "default",
        opacity: isReleased ? 1 : 0.7,
      }}
    >
      <div style={{
        flexShrink: 0, width: 200, aspectRatio: "16/9",
        background: film.color, borderRadius: "var(--r-2)", overflow: "hidden",
        position: "relative",
      }}>
        {/* Cover still — every episode gets one; unreleased are dimmed */}
        <div style={{ position: "absolute", inset: 0, filter: isReleased ? "none" : "grayscale(.55) brightness(.5)" }}>
          <FrameThumb kind={ep.thumb || film.thumb} usePhoto/>
        </div>
        {!isReleased && (
          <span className="t-mono" style={{
            position: "absolute", top: 6, left: 6,
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)",
            background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.12)", borderRadius: 999, padding: "3px 8px",
          }}><Icon name="lock" size={9}/> UPCOMING</span>
        )}
        {/* play overlay */}
        {isReleased && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity .15s",
            background: "rgba(0,0,0,.4)",
          }} className="ep-play-overlay">
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--c-amber)", color: "var(--c-on-amber)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Icon name="play" size={14}/></div>
          </div>
        )}
        {/* progress */}
        {inProgress && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(0,0,0,.7)" }}>
            <div style={{ height: "100%", width: `${ep.watched * 100}%`, background: "var(--c-amber)" }}/>
          </div>
        )}
        {/* check */}
        {isWatched && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            width: 22, height: 22, borderRadius: "50%",
            background: "var(--c-good)", color: tkc("panel-2"),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><Icon name="check" size={12}/></div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            S{film.season}·E{String(ep.ep).padStart(2, "0")}
          </span>
          {isNew && <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, padding: "1px 6px", background: "var(--c-blood)", color: tkc("white"), borderRadius: "var(--r-1)", letterSpacing: ".16em" }}>NEW</span>}
          {ep.finale && <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, padding: "1px 6px", background: "var(--c-amber)", color: "var(--c-on-amber)", borderRadius: "var(--r-1)", letterSpacing: ".16em" }}>FINALE</span>}
          {isPremiere && <span className="t-mono" style={{ fontSize: "var(--fs-label)", fontWeight: 700, padding: "1px 6px", border: "1px solid var(--c-amber)", color: "var(--c-amber)", borderRadius: "var(--r-1)", letterSpacing: ".16em" }}>PREMIERE</span>}
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>· {ep.duration}</span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: isReleased ? "var(--c-ink-3)" : "var(--c-amber)" }}>
            {isReleased ? `Released ${ep.drop}` : `Drops ${ep.drop}`}
          </span>
        </div>
        <h3 className="t-display" style={{
          fontStyle: "italic", fontSize: "var(--fs-lead)", margin: "0 0 6px",
          color: isReleased ? "var(--c-ink)" : "var(--c-ink-2)",
          letterSpacing: "-0.01em",
        }}>{ep.title}</h3>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, margin: 0, flex: 1 }}>
          {isReleased ? episodeBlurb(ep) : "Drops with the weekly release — set an alert and it's in your queue the moment it lands."}
        </p>
      </div>
    </button>
  );
}

function episodeBlurb(ep) {
  const blurbs = {
    "Eight, Hold": "Nadya develops the first frame. The chemistry isn't right.",
    "The Stop Bath": "An old colleague comes back. Nadya doesn't open the door.",
    "Safelight": "A power outage in the building. The darkroom stays lit.",
    "Fixer": "Three people show up at the apartment uninvited. Two of them are real.",
    "The Seventh Frame": "Nadya develops what she's been dreaming about for thirteen years.",
    "Crawlspace": "Something on the manifest doesn't match the cargo.",
    "Ice Memory": "A salvage drone returns with footage that hasn't been recorded yet.",
    "The Hold": "The crew counts off. They get one extra answer.",
  };
  return blurbs[ep.title] || "An episode about waiting, then about not waiting anymore.";
}

// ─── Director / studio card — same affordances as the film watch page ───
function SeriesDirectorCard({ film }) {
  const creator = (window.CREATORS || []).find(c => c.id === film.creatorId);
  if (!creator) return null;
  const following = typeof isFollowing === "function" && isFollowing(creator.id);
  const studios = (typeof getStudiosForCreator === "function") ? getStudiosForCreator(creator.id) : [];
  const studio = studios[0];
  return (
    <div style={{ padding: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>
        DIRECTOR
      </div>
      <button onClick={() => navigate(`/creator/${creator.id}`)} className="btn-ghost" style={{ padding: 0, height: "auto", justifyContent: "flex-start", gap: 12, textAlign: "left", marginBottom: 12, width: "100%" }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: creator.color, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
        }}>{creator.name.split(" ").map(p => p[0]).join("")}</div>
        <div style={{ minWidth: 0 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{creator.name}</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{fmtCount(creator.followers)} followers</div>
        </div>
      </button>
      {/* Studio website link */}
      <button onClick={() => navigate(`/creator/${creator.id}`)} className="t-mono" style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
        padding: "7px 10px", marginBottom: 12, cursor: "pointer",
        fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", flexShrink: 0 }}></span>
        {(creator.domain || `${creator.id}.cina`).toUpperCase()}
        <span style={{ flex: 1 }}></span>
        <span style={{ color: "var(--c-amber)" }}>VISIT STUDIO →</span>
      </button>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn" style={{ flex: 1, height: 30, justifyContent: "center", fontSize: "var(--fs-label)", color: following ? "var(--c-amber)" : "var(--c-ink)", borderColor: following ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)" }} onClick={() => typeof toggleFollow === "function" && toggleFollow(creator.id)}>
          {following ? "✓ Following" : "+ Follow"}
        </button>
        <button className="btn" style={{ flex: 1, height: 30, justifyContent: "center", fontSize: "var(--fs-label)", background: "rgba(var(--accent-rgb),.08)", borderColor: "rgba(var(--accent-rgb),.4)", color: "var(--c-amber)" }} onClick={() => window.openTipModal && window.openTipModal(creator)}>
          Tip director
        </button>
      </div>
      {studio && (
        <button onClick={() => navigate("/studios")} className="t-mono" style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          background: "transparent", border: "none", borderTop: "1px solid var(--c-line)",
          padding: "10px 0 0", marginTop: 12, cursor: "pointer",
          fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em",
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: "var(--r-1)", background: studio.color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)",
          }}>{studio.name[0]}</span>
          MEMBER OF {studio.name}
          <span style={{ flex: 1 }}></span>
          <span style={{ color: "var(--c-ink-2)" }}>→</span>
        </button>
      )}
    </div>
  );
}

// ─── Countdown card ──────────────────────────────────────────────────────
function CountdownCard({ ep, t, film }) {
  return (
    <div style={{
      padding: 18,
      background: "linear-gradient(180deg, rgba(var(--accent-rgb),.06) 0%, var(--c-panel) 80%)",
      border: "1px solid rgba(var(--accent-rgb),.3)",
      borderRadius: "var(--r-2)",
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 4 }}>
        {ep.finale ? "SEASON FINALE" : "NEXT EPISODE"}
      </div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginBottom: 4, letterSpacing: "-0.01em" }}>
        {ep.title}
      </div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginBottom: 16 }}>
        S{film.season}·E{ep.ep} · {ep.drop} · 7:00 PM ET
      </div>

      {/* Big countdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
        {[
          { label: "DAYS",  value: t.days ?? 0 },
          { label: "HRS",   value: t.hrs ?? 0 },
          { label: "MIN",   value: t.mins ?? 0 },
          { label: "SEC",   value: 42 },
        ].map(b => (
          <div key={b.label} style={{
            padding: "10px 4px",
            background: "var(--c-panel-2)",
            border: "1px solid var(--c-line-2)",
            borderRadius: "var(--r-2)", textAlign: "center",
          }}>
            <div className="t-num" style={{ fontSize: "var(--fs-title)", fontWeight: 600, color: "var(--c-amber)", lineHeight: 1, fontFamily: "var(--f-mono)" }}>
              {String(b.value).padStart(2, "0")}
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4 }}>{b.label}</div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ width: "100%", height: 36, justifyContent: "center" }}
        onClick={() => toast({ title: "REMINDER SET", text: `We'll alert you when ${ep.title} drops`, kind: "good" })}
      >
        <Icon name="bell" size={12}/>
        Remind me
      </button>
    </div>
  );
}

// ─── Schedule card ───────────────────────────────────────────────────────
function ScheduleCard({ film }) {
  const upcoming = film.series.filter(e => e.status === "scheduled");
  if (!upcoming.length) return null;

  return (
    <div style={{
      padding: 16,
      background: "var(--c-panel)",
      border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Icon name="calendar" size={14}/>
        <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>Drop schedule</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {upcoming.map((e, i) => (
          <div key={e.ep} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 0",
            borderBottom: i < upcoming.length - 1 ? "1px solid var(--c-line)" : "none",
          }}>
            <div style={{ width: 42, textAlign: "center" }}>
              <div className="t-mono t-num" style={{ fontSize: "var(--fs-lead)", fontWeight: 600, color: "var(--c-ink)", lineHeight: 1 }}>
                {e.drop.split("-")[2]}
              </div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2 }}>
                {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][parseInt(e.drop.split("-")[1]) - 1]}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
                S{film.season}·E{e.ep} {e.finale && <span style={{ color: "var(--c-amber)" }}>· FINALE</span>}
              </div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {e.title}
              </div>
            </div>
            <button className="btn-ghost btn-icon" style={{ width: 26, height: 26 }} data-tip="Set reminder">
              <Icon name="bell" size={12}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Hiatus / between-season card ────────────────────────────────────────
function HiatusCard({ film, finale }) {
  return (
    <div style={{
      padding: 16,
      background: "var(--c-panel-2)",
      border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)",
    }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>
        AFTER THE SEASON
      </div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 8, letterSpacing: "-0.01em" }}>
        Season 2 in development
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginBottom: 12 }}>
        {film.creator} is breaking the next season now. NFT holders get first access to the writers'-room livestream and behind-the-scenes from set.
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn" style={{ flex: 1, height: 30, justifyContent: "center", fontSize: "var(--fs-label)" }} onClick={() => { const on = window.isOnWatchlist && window.isOnWatchlist(series.id); if (window.toggleWatchlist) window.toggleWatchlist(series.id); if (window.toast) toast({ title: on ? "NOTIFICATIONS OFF" : "YOU'LL BE TOLD", text: on ? "We'll stop nudging you about this one." : "We'll message you the day it drops.", kind: "good" }); }}>
          <Icon name="bell" size={11}/>
          Notify me </button>
        {film.nft && (
          <button
            className="btn"
            style={{ flex: 1, height: 30, justifyContent: "center", fontSize: "var(--fs-label)", background: "rgba(var(--accent-rgb),.08)", borderColor: "rgba(var(--accent-rgb),.4)", color: "var(--c-amber)" }}
            onClick={() => navigate(`/nft/${film.nft}`)}
          >
            <Icon name="ticket" size={11}/>
            Hold the NFT
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SeriesPage });
