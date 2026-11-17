// festival-standings.jsx — The jury board. Aggregates every ballot logged in
// the screening rooms into live standings for the three purses, plus the
// critiques the room wrote. Mounts on the festival page at #/festival.

const { useState: usFS2, useEffect: ueFS2, useMemo: umFS2 } = React;

const FS2_KEY = "cina-fest-ballot-v1";
const FS2_ACCENT = "var(--c-amber)";

function fs2ReadBallots() {
  try { return JSON.parse(localStorage.getItem(FS2_KEY)) || {}; } catch (_) { return {}; }
}

// The room's votes, synthesized around the user's own ballot so the board
// reads like a live tally rather than a table of one.
function fs2Standings(lineup, ballots) {
  return lineup.map((f, i) => {
    const seed = String(f.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const mine = ballots[f.id] || {};
    const room = 340 + (seed * 37) % 900;
    const boost = (mine.score || 0) * 46 + (mine.awards?.length || 0) * 62;
    return {
      film: f,
      votes: room + boost,
      score: ((seed % 18) / 10 + 3.1 + (mine.score ? (mine.score - 3) * 0.18 : 0)),
      mine,
      awards: {
        audience: room + boost,
        craft: Math.round((room * 0.7) + (mine.awards?.includes("craft") ? 90 : 0)),
        debut: Math.round((room * 0.4) + (mine.awards?.includes("debut") ? 70 : 0)),
      },
      order: i + 1,
    };
  }).sort((a, b) => b.votes - a.votes);
}

function FestivalStandings() {
  const [ballots, setBallots] = usFS2(() => fs2ReadBallots());
  const [award, setAward] = usFS2("audience");
  const lineup = umFS2(() => (window.fvLineup ? window.fvLineup() : []), []);

  // Pick up ballots logged in a screening room without a reload.
  ueFS2(() => {
    const sync = () => setBallots(fs2ReadBallots());
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    const iv = setInterval(sync, 4000);
    return () => { window.removeEventListener("focus", sync); window.removeEventListener("storage", sync); clearInterval(iv); };
  }, []);

  const rows = umFS2(() => fs2Standings(lineup, ballots), [lineup, ballots]);
  if (!rows.length) return null;

  const sorted = [...rows].sort((a, b) => b.awards[award] - a.awards[award]);
  const top = sorted[0]?.awards[award] || 1;
  const logged = Object.values(ballots).filter(b => b && (b.score || b.awards?.length)).length;
  const critiques = lineup
    .map(f => ({ f, note: (ballots[f.id] || {}).note }))
    .filter(x => x.note && x.note.trim().length > 3);

  const AWARDS = [["audience", "AUDIENCE PICK", "$10,000"], ["craft", "BEST CRAFT", "$5,000"], ["debut", "BEST DEBUT", "$5,000"]];
  const PADX = "clamp(20px, 5vw, 72px)";

  return (
    <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", width: "100%", padding: `clamp(44px,6vw,78px) ${PADX}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", paddingBottom: 13, borderBottom: "1px solid var(--c-line)", marginBottom: 22 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: FS2_ACCENT, fontWeight: 700, marginBottom: 8 }}>THE JURY BOARD · LIVE</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(28px,3.4vw,44px)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
            Standings as the room votes.
          </h2>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textAlign: "right" }}>
          {logged ? <span style={{ color: "var(--c-good)" }}>YOU'VE LOGGED {logged} BALLOT{logged === 1 ? "" : "S"}</span> : "YOUR BALLOT IS EMPTY — OPEN A SCREENING"}
          <span style={{ display: "block", color: "var(--c-ink-4)", marginTop: 5 }}>{rows.length} FILMS IN CONTENTION</span>
        </div>
      </div>

      {/* Purse switch */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {AWARDS.map(([k, l, purse]) => (
          <button key={k} onClick={() => setAward(k)} style={{
            appearance: "none", cursor: "pointer", padding: "9px 15px", borderRadius: "var(--r-2)",
            border: `1px solid ${award === k ? "rgba(var(--accent-rgb),.5)" : "var(--c-line-2)"}`,
            background: award === k ? "rgba(var(--accent-rgb),.12)" : "transparent",
            color: award === k ? FS2_ACCENT : "var(--c-ink-3)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 9,
          }}>
            {l}<span style={{ color: "var(--c-ink-4)", fontWeight: 400 }}>{purse}</span>
          </button>
        ))}
      </div>

      {/* Board */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {sorted.map((r, i) => {
          const v = r.awards[award];
          const pct = (v / top) * 100;
          return (
            <button key={r.film.id} onClick={() => navigate(`/festival/film/${r.film.id}`)} style={{
              appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit",
              display: "grid", gridTemplateColumns: "30px minmax(0,1fr) 74px 62px",
              gap: 14, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-2)",
              background: i === 0 ? "rgba(var(--accent-rgb),.06)" : "var(--c-panel)",
              border: `1px solid ${i === 0 ? "rgba(var(--accent-rgb),.32)" : "var(--c-line)"}`,
            }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-body)", fontWeight: 700, color: i === 0 ? FS2_ACCENT : "var(--c-ink-4)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.film.title}</span>
                  {r.mine.score ? <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", border: "1px solid rgba(155,201,122,.4)", borderRadius: "var(--r-1)", padding: "2px 6px", whiteSpace: "nowrap" }}>YOU: {r.mine.score}/5</span> : null}
                </span>
                <span style={{ display: "block", height: 3, borderRadius: 999, background: "var(--c-line-2)", marginTop: 8 }}>
                  <span style={{ display: "block", width: `${pct}%`, height: "100%", background: i === 0 ? FS2_ACCENT : "var(--c-ink-4)", borderRadius: 999 }}/>
                </span>
              </span>
              <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", textAlign: "right" }}>{v.toLocaleString()}<span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}> VOTES</span></span>
              <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: FS2_ACCENT, fontWeight: 700, textAlign: "right" }}>{r.score.toFixed(1)}</span>
            </button>
          );
        })}
      </div>

      {/* Critiques the room wrote */}
      {critiques.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 13 }}>YOUR CRITIQUES · SUBMITTED TO THE JURY</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 12 }}>
            {critiques.map(({ f, note }) => (
              <div key={f.id} style={{ padding: 16, borderRadius: "var(--r-2)", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderLeft: `2px solid ${FS2_ACCENT}` }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 8 }}>{f.title}</div>
                <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: 0, textWrap: "pretty" }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

Object.assign(window, { FestivalStandings });
