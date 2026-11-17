// festival-viewer.jsx — Per-film screening room: #/festival/film/:id
// The stage (player), the room (live chat), and the ballot (vote / rank /
// critique) side by side. One film of the running order at a time.

const { useState: usFV, useEffect: ueFV, useMemo: umFV, useRef: urFV } = React;

const FV_ACCENT = "var(--c-amber)";

// ─── Lineup access (mirrors FestivalPage's builder) ─────────────────────
function fvLineup() {
  const out = [], seen = new Set();
  const add = f => {
    if (!f) return;
    const k = String(f.title || f.id).toLowerCase();
    if (seen.has(k)) return;
    seen.add(k); out.push(f);
  };
  const ed = window.FESTIVAL_EDITION || window.FESTIVAL || {};
  (ed.lineupIds || []).forEach(id => add(window.getFestivalFilm ? window.getFestivalFilm(id) : null));
  (window.FESTIVAL_ONLY || []).forEach(add);
  const cat = window.CATALOG || [];
  for (const f of cat) { if (out.length >= 12) break; if (!String(f.id).startsWith("pub-")) add(f); }
  return out.slice(0, 12);
}

function fvRuntimeSec(f) {
  const m = String(f?.runtime || "").match(/(\d+)\s*m/);
  return (m ? parseInt(m[1]) : 96) * 60;
}
function fvClock(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(ss).padStart(2, "0");
}

// ─── Persisted ballot ───────────────────────────────────────────────────
const FV_KEY = "cina-fest-ballot-v1";
function fvReadBallot() { try { return JSON.parse(localStorage.getItem(FV_KEY)) || {}; } catch (_) { return {}; } }
function fvWriteBallot(b) { try { localStorage.setItem(FV_KEY, JSON.stringify(b)); } catch (_) {} }

// ─── Live chat seed ─────────────────────────────────────────────────────
const FV_VOICES = [
  ["@mira_h", "PRODUCER · 3×", tkc("cat-4")], ["@klaus.w", "COLLECTOR", tkc("cat-1")],
  ["@yara", "PATRON · 2×", tkc("cat-2")], ["@tao_reng", "DIRECTOR", "var(--c-amber)"],
  ["@void_91", "FRONT ROW", tkc("bad")], ["@juno.f", "SEAT 41", tkc("cat-1")],
  ["@reel.eth", "COLLECTOR", tkc("warn")], ["@sable", "JURY", tkc("bad")],
];
const FV_LINES = [
  "that opening shot held four seconds longer than it had any right to. worked.",
  "sound design is doing the whole scene. nobody's said a word in three minutes.",
  "she's lying and the camera knows it",
  "whoever cut this understood that you leave the room before the reaction",
  "the grade shifts every time she goes inside. anyone else clocking that",
  "i was not ready for the bell",
  "this is the third film tonight with a phone as the villain and i'm not mad",
  "front row can confirm: the director is in here watching us watch it",
  "the score drops out at exactly the right second",
  "okay the match cut. okay.",
  "runtime is 12 minutes and it earns every one",
  "second watch and the ending reads completely differently",
];

function fvSeedChat(filmId) {
  const seed = String(filmId).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 7 }, (_, i) => {
    const v = FV_VOICES[(seed + i * 3) % FV_VOICES.length];
    return { id: "s" + i, who: v[0], role: v[1], color: v[2], body: FV_LINES[(seed + i * 5) % FV_LINES.length], t: 14 + i * 23 };
  });
}

// ═══ Page ═══════════════════════════════════════════════════════════════
function FestivalFilmPage({ filmId }) {
  const lineup = umFV(() => fvLineup(), []);
  const idx = Math.max(0, lineup.findIndex(f => f.id === filmId));
  const film = lineup[idx] || lineup[0];
  const isMobile = typeof useIsMobile === "function" ? useIsMobile() : false;
  const session = window.useSession ? window.useSession() : null;
  const signedIn = !!session?.s?.signedIn;

  const dur = fvRuntimeSec(film);
  const [t, setT] = usFV(Math.round(dur * 0.34));
  const [playing, setPlaying] = usFV(true);
  const [tab, setTab] = usFV("room");
  const [ballot, setBallot] = usFV(() => fvReadBallot());

  ueFV(() => {
    if (!playing) return;
    const iv = setInterval(() => setT(x => Math.min(dur, x + 1)), 1000);
    return () => clearInterval(iv);
  }, [playing, dur]);

  const mine = ballot[film?.id] || {};
  const setMine = patch => {
    const next = { ...ballot, [film.id]: { ...mine, ...patch } };
    setBallot(next); fvWriteBallot(next);
  };

  if (!film) return null;
  const pct = (t / dur) * 100;
  const PADX = "clamp(16px, 4vw, 44px)";

  const go = d => {
    const n = lineup[idx + d];
    if (n) { navigate(`/festival/film/${n.id}`); setT(0); }
  };

  return (
    <div style={{ background: "var(--c-bg)", minHeight: "100vh" }}>
      {/* Running-order bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: `12px ${PADX}`,
        borderBottom: "1px solid var(--c-line)", background: "var(--c-panel)", flexWrap: "wrap",
      }}>
        <button onClick={() => navigate("/festival")} className="btn-ghost" style={{ height: 30, padding: "0 12px", fontSize: "var(--fs-body)" }}>← Programme</button>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: FV_ACCENT, fontWeight: 700 }}>
            NO. {String(idx + 1).padStart(2, "0")} OF {String(lineup.length).padStart(2, "0")}
        </span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
            {(window.FESTIVAL_EDITION || window.FESTIVAL || {}).name || "CINA FESTIVAL"}
        </span>
        <span style={{ flex: 1 }}/>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: `0 0 8px ${tkc("bad")}` }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-bad)", fontWeight: 700 }}>SCREENING LIVE</span>
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => go(-1)} disabled={idx === 0} className="btn-ghost" style={{ height: 30, width: 30, padding: 0, justifyContent: "center", opacity: idx === 0 ? .35 : 1 }}>←</button>
          <button onClick={() => go(1)} disabled={idx >= lineup.length - 1} className="btn-ghost" style={{ height: 30, width: 30, padding: 0, justifyContent: "center", opacity: idx >= lineup.length - 1 ? .35 : 1 }}>→</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) 360px", gap: 0, alignItems: "start" }}>
        {/* ── Stage ── */}
        <div style={{ padding: `18px ${PADX} 40px`, minWidth: 0 }}>
          <FvStage film={film} t={t} dur={dur} pct={pct} playing={playing} setPlaying={setPlaying} onSeek={setT}/>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 340px", minWidth: 0 }}>
              <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: isMobile ? 30 : 42, margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>{film.title}</h1>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginTop: 9, textTransform: "uppercase" }}>
                {[film.creator, film.runtime, film.genre].filter(Boolean).join(" · ")}
              </div>
              {film.logline && (
                <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--c-ink-2)", maxWidth: 620, marginTop: 14, textWrap: "pretty" }}>{film.logline}</p>
              )}
            </div>
            <FvCritiqueMeter film={film} mine={mine}/>
          </div>
        </div>

        {/* ── Rail ── */}
        <aside style={{
          borderLeft: isMobile ? "none" : "1px solid var(--c-line)",
          borderTop: isMobile ? "1px solid var(--c-line)" : "none",
          background: "var(--c-panel)", minHeight: isMobile ? 0 : "calc(100vh - 55px)",
          position: isMobile ? "static" : "sticky", top: 0,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--c-line)" }}>
            {[["room", "The room"], ["ballot", "Your ballot"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                flex: 1, appearance: "none", cursor: "pointer", padding: "13px 10px",
                background: tab === k ? "var(--c-panel-2)" : "transparent", border: "none",
                borderBottom: tab === k ? `2px solid ${FV_ACCENT}` : "2px solid transparent",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
                color: tab === k ? "var(--c-ink)" : "var(--c-ink-3)", fontWeight: 600,
              }}>{l}</button>
            ))}
          </div>
          {tab === "room"
            ? <FvChat film={film} t={t} signedIn={signedIn}/>
            : <FvBallot film={film} lineup={lineup} mine={mine} setMine={setMine} ballot={ballot}/>}
        </aside>
      </div>
    </div>
  );
}

// ─── The stage ──────────────────────────────────────────────────────────
function FvStage({ film, t, dur, pct, playing, setPlaying, onSeek }) {
  const bar = urFV(null);
  const seek = e => {
    const r = bar.current.getBoundingClientRect();
    onSeek(Math.round(((e.clientX - r.left) / r.width) * dur));
  };
  return (
    <div style={{
      position: "relative", borderRadius: "var(--r-2)", overflow: "hidden",
      aspectRatio: "21/9", background: film.cover || tkc("bg"),
      border: "1px solid var(--c-line-2)",
    }}>
      {window.FrameThumb ? (
        <div style={{ position: "absolute", inset: 0, filter: playing ? "none" : "saturate(.5) brightness(.6)", transition: "filter .4s ease" }}>
          <FrameThumb kind={film.thumb} usePhoto/>
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.78), transparent 42%)" }}/>

      {!playing && (
        <button onClick={() => setPlaying(true)} style={{
          position: "absolute", inset: 0, display: "grid", placeItems: "center",
          appearance: "none", border: "none", background: "rgba(0,0,0,.3)", cursor: "pointer",
        }}>
          <span style={{
            width: 66, height: 66, borderRadius: "50%", background: "rgba(var(--accent-rgb),.95)",
            display: "grid", placeItems: "center", color: "var(--c-on-amber)", fontSize: "var(--fs-title)", paddingLeft: 4,
          }}>▶</span>
        </button>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 16px 14px" }}>
        <div ref={bar} onClick={seek} style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,.2)", cursor: "pointer", marginBottom: 11 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: FV_ACCENT, borderRadius: 999, position: "relative" }}>
            <span style={{ position: "absolute", right: -4, top: -3, width: 10, height: 10, borderRadius: "50%", background: FV_ACCENT }}/>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setPlaying(p => !p)} style={{
            appearance: "none", border: "none", background: "transparent", cursor: "pointer",
            color: tkc("white"), fontSize: "var(--fs-lead)", width: 22, padding: 0,
          }}>{playing ? "❙❙" : "▶"}</button>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.85)", letterSpacing: ".08em" }}>
            {fvClock(t)} / {fvClock(dur)}
          </span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.6)" }}>
            {(2100 + Math.floor(t / 3)).toLocaleString()} WATCHING
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Critique meter (room's read, so far) ───────────────────────────────
function FvCritiqueMeter({ film, mine }) {
  const seed = String(film.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const axes = [
    ["Story", 62 + (seed % 30)],
    ["Craft", 58 + ((seed * 3) % 36)],
    ["Performance", 55 + ((seed * 7) % 40)],
  ];
  return (
    <div style={{ flex: "0 0 232px", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 15, background: "var(--c-panel)" }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 13 }}>THE ROOM'S READ</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {axes.map(([k, v]) => (
          <div key={k}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginBottom: 5 }}>
              <span>{k}</span><span className="t-mono" style={{ color: "var(--c-ink)" }}>{(v / 20).toFixed(1)}</span>
            </div>
            <div style={{ height: 3, background: "var(--c-line-2)", borderRadius: 999 }}>
              <div style={{ width: `${v}%`, height: "100%", background: FV_ACCENT, borderRadius: 999 }}/>
            </div>
          </div>
        ))}
      </div>
      {mine.score ? (
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", marginTop: 13 }}>YOU SCORED IT {mine.score}/5</div>
      ) : (
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 13 }}>YOUR BALLOT IS OPEN →</div>
      )}
    </div>
  );
}

// ─── Live chat ──────────────────────────────────────────────────────────
function FvChat({ film, t, signedIn }) {
  const [msgs, setMsgs] = usFV(() => fvSeedChat(film.id));
  const [draft, setDraft] = usFV("");
  const scroller = urFV(null);

  ueFV(() => { setMsgs(fvSeedChat(film.id)); }, [film.id]);

  // Ambient arrivals
  ueFV(() => {
    const iv = setInterval(() => {
      setMsgs(m => {
        const v = FV_VOICES[Math.floor(Math.random() * FV_VOICES.length)];
        const next = [...m, { id: "a" + Date.now(), who: v[0], role: v[1], color: v[2], body: FV_LINES[Math.floor(Math.random() * FV_LINES.length)], t }];
        return next.slice(-40);
      });
    }, 5200);
    return () => clearInterval(iv);
  }, [t]);

  ueFV(() => { const el = scroller.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    if (!signedIn && window.openSignIn) { window.openSignIn(); return; }
    setMsgs(m => [...m, { id: "me" + Date.now(), who: "You", role: "SEAT 182", color: FV_ACCENT, body, t, mine: true }].slice(-40));
    setDraft("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 360 }}>
      <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "14px 15px", display: "flex", flexDirection: "column", gap: 13, maxHeight: "calc(100vh - 210px)" }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: m.color, fontWeight: 700, letterSpacing: ".08em" }}>{m.who}</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{m.role}</span>
              <span style={{ flex: 1 }}/>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{fvClock(m.t)}</span>
            </div>
            <div style={{ fontSize: "var(--fs-body)", lineHeight: 1.5, color: m.mine ? "var(--c-ink)" : "var(--c-ink-2)", textWrap: "pretty" }}>{m.body}</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--c-line)", padding: 11, display: "flex", gap: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder={signedIn ? "Say something to the room…" : "Sign in to talk to the room"}
          style={{
            flex: 1, minWidth: 0, appearance: "none", background: "var(--c-panel-2)",
            border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "9px 11px",
            color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "inherit",
          }}/>
        <button onClick={send} className="btn" style={{ height: 36, padding: "0 14px", fontSize: "var(--fs-body)" }}>Send</button>
      </div>
    </div>
  );
}

// ─── Ballot: vote · rank · critique ─────────────────────────────────────
function FvBallot({ film, lineup, mine, setMine, ballot }) {
  const ranked = lineup.filter(f => ballot[f.id]?.score).sort((a, b) => ballot[b.id].score - ballot[a.id].score);
  const AWARDS = [
    ["audience", "Audience Pick", "The purse the room decides."],
    ["craft", "Best Craft", "Sound, image, cut."],
    ["debut", "Best Debut", "First film only."],
  ];
  return (
    <div style={{ overflowY: "auto", padding: "16px 15px 24px", display: "flex", flexDirection: "column", gap: 22, maxHeight: "calc(100vh - 110px)" }}>
      {/* Vote */}
      <section>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 10 }}>01 · NOMINATE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {AWARDS.map(([k, l, sub]) => {
            const on = mine.awards?.includes(k);
            return (
              <button key={k} onClick={() => {
                const cur = mine.awards || [];
                setMine({ awards: on ? cur.filter(x => x !== k) : [...cur, k] });
              }} style={{
                appearance: "none", cursor: "pointer", textAlign: "left", width: "100%",
                padding: "10px 12px", borderRadius: "var(--r-2)", color: "inherit",
                background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
                border: `1px solid ${on ? "rgba(var(--accent-rgb),.5)" : "var(--c-line-2)"}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{
                  width: 15, height: 15, flex: "0 0 auto", borderRadius: "var(--r-1)",
                  border: `1px solid ${on ? FV_ACCENT : "var(--c-line-3)"}`, background: on ? FV_ACCENT : "transparent",
                  display: "grid", placeItems: "center", color: "var(--c-on-amber)", fontSize: "var(--fs-label)", fontWeight: 700,
                }}>{on ? "✓" : ""}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{l}</span>
                  <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Score */}
      <section>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 10 }}>02 · SCORE</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => {
            const on = (mine.score || 0) >= n;
            return (
              <button key={n} onClick={() => setMine({ score: n })} style={{
                appearance: "none", cursor: "pointer", flex: 1, height: 40, borderRadius: "var(--r-2)",
                background: on ? "rgba(var(--accent-rgb),.16)" : "var(--c-panel-2)",
                border: `1px solid ${on ? "rgba(var(--accent-rgb),.55)" : "var(--c-line-2)"}`,
                color: on ? FV_ACCENT : "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700,
              }}>{n}</button>
            );
          })}
        </div>
      </section>

      {/* Critique */}
      <section>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 10 }}>03 · CRITIQUE</div>
        <textarea value={mine.note || ""} onChange={e => setMine({ note: e.target.value })}
          placeholder="Two sentences the jury should read. Attributed to your seat."
          style={{
            width: "100%", minHeight: 96, resize: "vertical", appearance: "none",
            background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
            padding: "10px 11px", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "inherit", lineHeight: 1.5,
          }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
          <button onClick={() => {
            setMine({ submitted: true });
            if (window.toast) window.toast({ title: "BALLOT LOGGED", text: `${film.title} · seat 182`, kind: "good" });
          }} className="btn btn-primary" style={{ height: 34, padding: "0 15px", fontSize: "var(--fs-body)" }}>Log ballot</button>
          {mine.submitted && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>LOGGED ✓</span>}
        </div>
      </section>

      {/* Your running rank */}
      {ranked.length > 1 && (
        <section>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 10 }}>YOUR RANKING SO FAR</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {ranked.map((f, i) => (
              <button key={f.id} onClick={() => navigate(`/festival/film/${f.id}`)} style={{
                appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit",
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--r-2)",
                background: f.id === film.id ? "var(--c-panel-2)" : "transparent", border: "none",
              }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", width: 16 }}>{i + 1}</span>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: FV_ACCENT, fontWeight: 700 }}>{ballot[f.id].score}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

Object.assign(window, { FestivalFilmPage, fvLineup });
