// festival-record.jsx — A studio's and a performer's standing at the festival,
// and the houses a performer works for. Reads FESTIVAL_WINNERS + the lineup.

// Every seal a studio's films have won, newest first.
function frStudioRecord(studioId, films) {
  const ids = new Set((films || []).map(f => f.id));
  const out = [];
  (window.FESTIVAL_WINNERS || []).forEach(ed => {
    ed.awards.forEach(a => {
      if (!ids.has(a.filmId)) return;
      const film = (window.CATALOG || []).find(f => f.id === a.filmId);
      out.push({ ...a, edition: ed.edition, date: ed.date, film });
    });
  });
  return out.sort((a, b) => b.edition - a.edition);
}

// Which of a studio's films are in the current running order.
function frInLineup(films) {
  const lineup = window.fvLineup ? window.fvLineup() : [];
  const ids = new Set((films || []).map(f => f.id));
  return lineup.map((f, i) => ({ f, no: i + 1 })).filter(x => ids.has(x.f.id));
}

function StudioFestivalRecord({ studio, films }) {
  const wins = frStudioRecord(studio?.id, films);
  const running = frInLineup(films);
  if (!wins.length && !running.length) return null;
  const roman = window.festRoman || (n => String(n));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {running.length > 0 && (
        <div style={{ padding: 16, borderRadius: "var(--r-2)", background: "rgba(var(--accent-rgb),.06)", border: "1px solid rgba(var(--accent-rgb),.3)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700, marginBottom: 12 }}>
            IN THIS EDITION'S RUNNING ORDER
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {running.map(({ f, no }) => (
              <button key={f.id} onClick={() => navigate(`/festival/film/${f.id}`)} style={{
                appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit", border: "none",
                background: "transparent", display: "flex", alignItems: "center", gap: 12, padding: "8px 2px",
              }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", fontWeight: 700, width: 22 }}>{String(no).padStart(2, "0")}</span>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SCREENING →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {wins.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 12 }}>
          {wins.map((w, i) => (
            <button key={i} onClick={() => w.film && navigate(`/film/${w.film.id}`)} style={{
              appearance: "none", cursor: "pointer", textAlign: "left", color: "inherit",
              padding: 15, borderRadius: "var(--r-2)", background: "var(--c-panel)",
              border: "1px solid var(--c-line)", display: "flex", gap: 13, alignItems: "flex-start",
            }}>
              {window.WinnerTrophy
                ? <window.WinnerTrophy variant="mini" size={40} award={w.award} edition={w.edition} date={w.date} color={window.awardColor ? window.awardColor(w.award) : "var(--c-amber)"}/>
                : <span style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(var(--accent-rgb),.15)", display: "grid", placeItems: "center", color: "var(--c-amber)", flex: "0 0 auto" }}>✦</span>}
              <span style={{ minWidth: 0 }}>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>
                  {w.award} · VOL {roman(w.edition)}
                </span>
                <span className="t-display" style={{ display: "block", fontStyle: "italic", fontSize: "var(--fs-lead)", marginTop: 5, lineHeight: 1.15 }}>{w.film?.title || w.filmId}</span>
                {w.citation && <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.45 }}>{w.citation}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Performer: the houses that cast them, and their festival credits ───

Object.assign(window, { StudioFestivalRecord, frStudioRecord, frInLineup });
