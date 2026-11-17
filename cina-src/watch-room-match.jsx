// watch-room-match.jsx — Matched rooms · taste-print compatibility for parties.
//
// Every live room gets a temperament LEAN (seeded from its film's real fork
// ledger where it exists, deterministic otherwise). Your Taste Print is
// compared against it:
//   · LiveRoomsStrip cards wear a "92% MATCH" badge
//   · WatchPartyPage opens with a room-lean banner — "This room leans
//     RUTHLESS 2:1 · expect to lose fork votes" — so group fork voting has
//     stakes you can feel before the first choice moment.
//
// Loaded after watch-taste.jsx, before watch-party.jsx users render.

(function () {
  const { useMemo: umRM } = React;

  const RM_COLORS = { A: tkc("good"), B: tkc("bad"), C: tkc("cat-2") };
  const RM_WORDS  = { A: "MERCIFUL", B: "RUTHLESS", C: "CURIOUS" };

  function rmHash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) >>> 0; return h; }

  // A room's temperament lean: real fork-ledger rows for the film first,
  // seeded split otherwise. Returns { A, B, C } shares summing to 1.
  function roomLean(filmId) {
    const rows = (window.forkLedgerRead ? window.forkLedgerRead() : []).filter(r => r.filmId === filmId);
    const by = { A: 0, B: 0, C: 0 };
    rows.forEach(r => { if (by[r.letter] != null) by[r.letter]++; });
    const total = by.A + by.B + by.C;
    if (total >= 4) return { A: by.A / total, B: by.B / total, C: by.C / total, real: true };
    const h = rmHash(filmId);
    const a = 0.2 + ((h % 47) / 100);           // .20–.66
    const b = (1 - a) * (0.35 + ((h >> 4) % 31) / 100);
    return { A: a, B: b, C: Math.max(0, 1 - a - b), real: false };
  }

  // Compatibility between the viewer's print and a room lean: how much of
  // your fork behavior the room shares. No print yet → null (no badge).
  function roomMatch(filmId) {
    const tp = window.computeTastePrint ? window.computeTastePrint() : null;
    if (!tp || !tp.forkTotal) return null;
    const lean = roomLean(filmId);
    const mine = { A: 0, B: 0, C: 0 };
    tp.temper.forEach(t => mine[t.letter] = (t.pct || 0) / 100);
    // overlap of the two distributions
    const overlap = Math.min(mine.A, lean.A) + Math.min(mine.B, lean.B) + Math.min(mine.C, lean.C);
    return { pct: Math.round(overlap * 100), lean, mine };
  }

  function rmDominant(lean) {
    const e = Object.entries({ A: lean.A, B: lean.B, C: lean.C }).sort((x, y) => y[1] - x[1]);
    const [letter, share] = e[0];
    const ratio = e[1][1] > 0 ? (share / e[1][1]) : 3;
    return { letter, share, ratio: Math.min(9.9, Math.round(ratio * 10) / 10) };
  }

  // ─── Badge for room cards ─────────────────────────────────────────────────
  function RoomMatchBadge({ filmId }) {
    const m = umRM(() => roomMatch(filmId), [filmId]);
    if (!m) return null;
    const good = m.pct >= 60;
    return (
      <span className="t-mono" title={`Room temperament vs your taste print — ${m.pct}% overlap in how you choose at forks`} style={{
        display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 999,
        background: "rgba(8,8,10,.6)", backdropFilter: "blur(8px)",
        border: `1px solid ${good ? "rgba(var(--accent-rgb),.6)" : "rgba(255,255,255,.28)"}`,
        color: good ? "var(--c-amber)" : "rgba(255,255,255,.75)",
        fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em",
      }}>{m.pct}% MATCH</span>
    );
  }

  // ─── Party banner — the room's temperament, declared up front ─────────────
  function PartyLeanBanner({ film }) {
    const data = umRM(() => {
      const lean = roomLean(film.id);
      const dom = rmDominant(lean);
      const m = roomMatch(film.id);
      return { lean, dom, m };
    }, [film.id]);
    const { lean, dom, m } = data;
    const myDom = m && Object.entries(m.mine).sort((x, y) => y[1] - x[1])[0][0];
    const aligned = m && myDom === dom.letter;

    return (
      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", background: `linear-gradient(90deg, ${RM_COLORS[dom.letter]}14, transparent 70%)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: RM_COLORS[dom.letter], fontWeight: 700 }}>
            ⑂ THIS ROOM LEANS {RM_WORDS[dom.letter]}{dom.ratio >= 1.5 ? ` ${dom.ratio}:1` : ""}
          </span>
          {m && (
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
              · {m.pct}% MATCH WITH YOUR PRINT{aligned ? " — FORK VOTES SHOULD GO YOUR WAY" : " — EXPECT TO LOSE FORK VOTES"}
            </span>
          )}
        </div>
        {/* lean bar */}
        <div style={{ display: "flex", height: 5, borderRadius: "var(--r-1)", overflow: "hidden", marginTop: 9, maxWidth: 420 }}>
          {["A", "B", "C"].map(L => lean[L] > 0.02 && (
            <span key={L} title={`${RM_WORDS[L]} ${Math.round(lean[L] * 100)}%`} style={{ width: (lean[L] * 100) + "%", background: RM_COLORS[L], opacity: L === dom.letter ? 1 : .45 }}></span>
          ))}
        </div>
      </div>
    );
  }

  Object.assign(window, { RoomMatchBadge, PartyLeanBanner });
})();
