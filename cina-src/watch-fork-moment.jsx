// watch-fork-moment.jsx — in-player viewer choice moments.
//
// Surfaces the studio Board's branch points (localStorage "cina:board-v2",
// written by the Storyboard's ⑂ Branch tool) inside the public Watch player:
// playback pauses at each fork, the room votes, the viewer picks a path,
// and the film continues down that branch. Falls back to an authored demo
// fork set when no board data exists in this browser.
//
// Loaded BEFORE watch-watch.jsx. Exposes:
//   window.useForkMoments({ film, t, dur, playing, setPlaying })
//   window.ForkMomentOverlay
(function () {
  const { useState: usFM, useEffect: ueFM, useMemo: umFM, useRef: urFM } = React;

  const FM_CAST = ["calo-vey", "domek-ari", "evren-koll", "io-marsh", "nadya-ash", "rune-okafor", "siri-vale", "wren-soto"];
  const FM_GRADES = [
    "saturate(.92) contrast(1.1) brightness(.85)",
    "grayscale(.6) sepia(.3) hue-rotate(-14deg) contrast(1.08) brightness(.8)",
    "grayscale(.9) contrast(1.22) brightness(.84)",
    "sepia(.42) hue-rotate(-24deg) saturate(1.2) contrast(1.06) brightness(.82)",
  ];
  function fmHash(s) { let h = 0; s = String(s || ""); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function fmPhoto(key) { return "assets/cast/" + FM_CAST[fmHash(key) % FM_CAST.length] + ".png"; }

  // ─── Fork ledger — every real viewer choice, shared with the studio ────
  // The Board's Branch map reads this to show directors which path wins
  // and what each branch earns. Rate: per-choice view-share royalty.
  const FORK_LEDGER_KEY = "cina:fork-ledger";
  const FORK_ROYALTY = 0.12; // $ per recorded path-choice (view share)
  function forkLedgerRead() {
    try { const l = JSON.parse(localStorage.getItem(FORK_LEDGER_KEY)); return Array.isArray(l) ? l : []; } catch (e) { return []; }
  }
  function forkLedgerRecord(rec) {
    try {
      const l = forkLedgerRead();
      localStorage.setItem(FORK_LEDGER_KEY, JSON.stringify([{ ts: Date.now(), ...rec }, ...l].slice(0, 500)));
    } catch (e) {}
  }
  function forkLedgerCounts(forkId) {
    const by = {};
    forkLedgerRead().forEach(r => { if (r.forkId === forkId) by[r.letter] = (by[r.letter] || 0) + 1; });
    return by;
  }

  // ─── Fork data: the director's Board branches, else an authored demo ─────
  function buildForks(film, dur) {
    let board = null;
    try { board = JSON.parse(localStorage.getItem("cina:board-v2")); } catch (e) {}
    const out = [];
    if (board && Array.isArray(board.scenes)) {
      const roots = board.scenes.filter(s => !s.branchOf);
      const forked = roots.filter(r => board.scenes.some(b => b.branchOf === r.id));
      forked.forEach((root, i) => {
        const family = [root, ...board.scenes.filter(b => b.branchOf === root.id)];
        out.push({
          id: "bd_" + root.id,
          at: Math.round(dur * ((i + 1) / (forked.length + 1))),
          sceneNum: root.number,
          heading: root.title,
          question: "The director shot this scene more than one way. Which way does it go?",
          source: "board",
          options: family.map((b, bi) => {
            const frames = (board.framesByScene || {})[b.id] || [];
            const key = (frames[0] && frames[0].id) || b.id;
            return {
              id: b.id, letter: b.branchLabel || "A",
              beat: frames[0] ? frames[0].desc : root.title,
              shots: frames.length,
              photo: fmPhoto(key), grade: FM_GRADES[(fmHash(key) + bi) % FM_GRADES.length],
              votes: 34 + ((fmHash(b.id) % 55)) + (forkLedgerCounts("bd_" + root.id)[b.branchLabel || "A"] || 0),
            };
          }),
        });
      });
    }
    if (out.length) return out;
    // Authored fallback so the moment always demos on a clean browser.
    return [
      {
        id: "demo_1", at: Math.round(dur * 0.33), sceneNum: "14", heading: "Street, rain begins",
        question: "She's at the curb. The car is waiting. Which way does it go?",
        source: "demo",
        options: [
          { id: "d1a", letter: "A", beat: "She gets in. The city slides past; she says nothing the whole ride.", shots: 6, photo: fmPhoto("d1a"), grade: FM_GRADES[0], votes: 61 },
          { id: "d1b", letter: "B", beat: "She lets it go, turns her collar up, and walks into the rain.", shots: 5, photo: fmPhoto("d1b"), grade: FM_GRADES[1], votes: 39 },
        ],
      },
      {
        id: "demo_2", at: Math.round(dur * 0.72), sceneNum: "21", heading: "Diner, last booth",
        question: "The envelope is on the table. Which way does it go?",
        source: "demo",
        options: [
          { id: "d2a", letter: "A", beat: "She opens it. The photographs change what the last act means.", shots: 7, photo: fmPhoto("d2a"), grade: FM_GRADES[2], votes: 48 },
          { id: "d2b", letter: "B", beat: "She slides it back unopened and asks for the check.", shots: 6, photo: fmPhoto("d2b"), grade: FM_GRADES[3], votes: 52 },
        ],
      },
    ];
  }

  const FM_SECONDS = 20;

  // ── Watch party: real cross-tab presence + vote sync (storage events) ───
  const FM_TAB_ID = "tab_" + Math.random().toString(36).slice(2, 8);
  const FM_PRESENCE_KEY = "cina:party-presence";
  const FM_LIVE_KEY = "cina:fork-live";
  function fmPresenceBeat() {
    try {
      const now = Date.now();
      const m = JSON.parse(localStorage.getItem(FM_PRESENCE_KEY) || "{}");
      m[FM_TAB_ID] = now;
      Object.keys(m).forEach(k => { if (now - m[k] > 15000) delete m[k]; });
      localStorage.setItem(FM_PRESENCE_KEY, JSON.stringify(m));
      return Object.keys(m).length;
    } catch (e) { return 1; }
  }
  function fmBroadcastVote(forkId, letter) {
    try { localStorage.setItem(FM_LIVE_KEY, JSON.stringify({ forkId, letter, from: FM_TAB_ID, ts: Date.now() })); } catch (e) {}
  }

  function useForkMoments({ film, t, dur, playing, setPlaying }) {
    const forks = umFM(() => buildForks(film, dur), [film.id, dur]);
    const lsKey = "cina:fork-choices:" + film.id;
    const [choices, setChoices] = usFM(() => { try { return JSON.parse(localStorage.getItem(lsKey)) || {}; } catch (e) { return {}; } });
    const [activeId, setActiveId] = usFM(null);
    const [partySize, setPartySize] = usFM(1);

    // Presence heartbeat — other open tabs on this catalog are your watch party.
    ueFM(() => {
      setPartySize(fmPresenceBeat());
      const i = setInterval(() => setPartySize(fmPresenceBeat()), 5000);
      return () => clearInterval(i);
    }, []);

    // Carry-forward: the last path chosen anywhere in this series — the next
    // episode opens on that branch.
    const carry = umFM(() => {
      try { const c = JSON.parse(localStorage.getItem("cina:series-arc:" + film.id)); return c && c.lastLetter ? c : null; } catch (e) { return null; }
    }, [film.id]);

    // Trip a fork the moment playback crosses it (skips count too — like a chapter gate).
    ueFM(() => {
      if (activeId) return;
      const hit = forks.find(f => t >= f.at && t < f.at + 30 && !choices[f.id]);
      if (hit) { setActiveId(hit.id); setPlaying(false); }
    }, [t, activeId, forks, choices]);

    const active = forks.find(f => f.id === activeId) || null;

    function choose(fork, opt, meta) {
      const next = { ...choices, [fork.id]: opt.letter };
      setChoices(next);
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch (e) {}
      // Book the choice into the shared fork ledger — the director's Branch
      // map reads this for path performance + branch royalties. `minority`
      // marks a vote cast AGAINST the room's leading option.
      forkLedgerRecord({ filmId: film.id, forkId: fork.id, rootId: String(fork.id).replace(/^bd_/, ""), sceneNum: fork.sceneNum, letter: opt.letter, source: fork.source, royalty: FORK_ROYALTY, minority: !!(meta && meta.against), roomPct: meta ? meta.roomPct : null });
      // Broadcast to the watch party (other open tabs see the vote live) and
      // write the series carry-forward — the next episode opens on this path.
      fmBroadcastVote(fork.id, opt.letter);
      try { localStorage.setItem("cina:series-arc:" + film.id, JSON.stringify({ lastLetter: opt.letter, forkId: fork.id, sceneNum: fork.sceneNum, ts: Date.now() })); } catch (e) {}
      setActiveId(null);
      setPlaying(true);
      if (window.toast) {
        if (meta && meta.against) toast({ title: "MINORITY CUT · PATH " + opt.letter, text: `The room went ${meta.roomLetter} (${meta.roomPct}%) — you didn't. Your cut, your spine.`, kind: "good" });
        else toast({ title: "PATH " + opt.letter + " CHOSEN", text: `Scene ${fork.sceneNum} · the film continues down your branch`, kind: "good" });
      }
    }
    function resetPath() {
      setChoices({});
      try { localStorage.removeItem(lsKey); } catch (e) {}
    }

    const pathLabel = forks.filter(f => choices[f.id]).map(f => choices[f.id]).join("·");
    return { forks, active, choose, choices, pathLabel, resetPath, fromBoard: forks[0] && forks[0].source === "board", partySize, carry };
  }

  // ─── The choice moment itself ─────────────────────────────────────────────
  const FM_ROOM = ["Mara", "Dev", "Okonkwo", "Lena", "Theo", "Priya", "Sam", "Iris"];
  function ForkMomentOverlay({ fm }) {
    const fork = fm.active;
    const [left, setLeft] = usFM(FM_SECONDS);
    const [hoverId, setHoverId] = usFM(null);
    // Live room voting — members cast votes while the countdown runs.
    const [roomVotes, setRoomVotes] = usFM({});   // optId -> [names]
    const [partyVotes, setPartyVotes] = usFM({}); // optId -> count · REAL votes from other tabs
    ueFM(() => { setRoomVotes({}); setPartyVotes({}); }, [fork.id]);
    // REAL sync: another open tab choosing a path fires a storage event here.
    ueFM(() => {
      const onStorage = (e) => {
        if (e.key !== "cina:fork-live" || !e.newValue) return;
        try {
          const v = JSON.parse(e.newValue);
          if (v.forkId !== fork.id) return;
          const opt = fork.options.find(o => o.letter === v.letter);
          if (opt) setPartyVotes(pv => ({ ...pv, [opt.id]: (pv[opt.id] || 0) + 1 }));
        } catch (err) {}
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }, [fork.id]);
    ueFM(() => {
      let n = 0;
      const i = setInterval(() => {
        if (n >= FM_ROOM.length) { clearInterval(i); return; }
        const name = FM_ROOM[n++];
        const sorted = [...fork.options].sort((a, b) => b.votes - a.votes);
        const opt = Math.random() < 0.62 ? sorted[0] : sorted[Math.min(1, sorted.length - 1)];
        setRoomVotes(v => ({ ...v, [opt.id]: [...(v[opt.id] || []), name] }));
      }, 2100);
      return () => clearInterval(i);
    }, [fork.id]);

    const liveVotes = (o) => o.votes + ((roomVotes[o.id] || []).length * 3) + ((partyVotes[o.id] || 0) * 8);
    const totalVotes = fork.options.reduce((a, o) => a + liveVotes(o), 0) || 1;
    const leading = [...fork.options].sort((a, b) => liveVotes(b) - liveVotes(a))[0];

    ueFM(() => { setLeft(FM_SECONDS); }, [fork.id]);
    ueFM(() => {
      const i = setInterval(() => setLeft(v => {
        if (v <= 1) { clearInterval(i); fm.choose(fork, leading); return 0; }
        return v - 1;
      }), 1000);
      return () => clearInterval(i);
    }, [fork.id]);

    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "linear-gradient(180deg, rgba(4,4,7,.25) 0%, rgba(4,4,7,.88) 62%, rgba(4,4,7,.97) 100%)", backdropFilter: "blur(2px)" }}>
        <div style={{ padding: "0 min(5%, var(--gutter)) 34px" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>⑂ THE FILM FORKS HERE</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.45)" }}>SCENE {fork.sceneNum} · {fm.fromBoard ? "SHOT BOTH WAYS BY THE DIRECTOR" : "THE ROOM DECIDES"}</span>
            {fm.partySize > 1 && (
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 8px rgba(106,163,122,.8)" }}></span>
                WATCHING TOGETHER · {fm.partySize} · VOTES SYNC LIVE
              </span>
            )}
            <span style={{ flex: 1 }}></span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: left <= 5 ? "var(--c-amber)" : "rgba(255,255,255,.6)" }}>AUTO-CONTINUES WITH THE ROOM · {left}s</span>
          </div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(20px, 2.4vw, 30px)", color: tkc("white"), letterSpacing: "-0.02em", marginBottom: 16 }}>{fork.question}</div>

          {/* options */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${fork.options.length}, 1fr)`, gap: 12 }}>
            {fork.options.map(o => {
              const pct = Math.round((liveVotes(o) / totalVotes) * 100);
              const hovered = hoverId === o.id;
              const voters = roomVotes[o.id] || [];
              return (
                <button key={o.id}
                  onClick={() => fm.choose(fork, o, { against: leading && leading.id !== o.id, roomLetter: leading && leading.letter, roomPct: Math.round((liveVotes(leading) / totalVotes) * 100) })}
                  onMouseEnter={() => setHoverId(o.id)} onMouseLeave={() => setHoverId(null)}
                  style={{
                    position: "relative", textAlign: "left", padding: 0, borderRadius: "var(--r-3)", overflow: "hidden", cursor: "pointer",
                    border: `1.5px solid ${hovered ? "var(--c-amber)" : "rgba(255,255,255,.16)"}`,
                    background: tkc("bg"), transform: hovered ? "translateY(-3px)" : "none",
                    transition: "transform .18s ease, border-color .18s ease",
                    boxShadow: hovered ? "0 18px 44px rgba(0,0,0,.6)" : "0 8px 24px rgba(0,0,0,.45)",
                  }}>
                  <div style={{ position: "relative", aspectRatio: "21/9", overflow: "hidden" }}>
                    <img src={o.photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%", filter: o.grade, transform: hovered ? "scale(1.06)" : "scale(1.01)", transition: "transform .5s ease" }}/>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,8,.05) 40%, rgba(5,5,8,.72))" }}></div>
                    <span style={{
                      position: "absolute", top: 10, left: 10, padding: "3px 9px", borderRadius: "var(--r-2)",
                      background: hovered ? "var(--c-amber)" : "rgba(8,8,10,.8)", color: hovered ? tkc("on-amber") : tkc("white"),
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", transition: "all .18s",
                    }}>PATH {o.letter}</span>
                    {o.id === leading.id && (
                      <span className="t-mono" style={{ position: "absolute", top: 12, right: 10, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>ROOM'S PICK</span>
                    )}
                  </div>
                  <div style={{ padding: "10px 13px 12px" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.35, minHeight: 40, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {o.beat}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: "var(--r-1)", background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: hovered ? "var(--c-amber)" : "rgba(255,255,255,.45)", transition: "width .6s ease, background .18s" }}></div>
                      </div>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.6)" }}>{pct}% OF THE ROOM</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.35)" }}>{o.shots} SHOTS</span>
                    </div>
                    {(partyVotes[o.id] || 0) > 0 && (
                      <div className="t-mono" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)" }}></span>
                        YOUR PARTY · {partyVotes[o.id]} REAL VOTE{partyVotes[o.id] === 1 ? "" : "S"} → PATH {o.letter}
                      </div>
                    )}
                    {voters.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                        <span style={{ display: "flex" }}>
                          {voters.slice(-4).map((name, i) => (
                            <span key={name} title={name} style={{
                              width: 16, height: 16, borderRadius: "50%", marginLeft: i ? -5 : 0,
                              background: `hsl(${(name.charCodeAt(0) * 47) % 360}, 32%, 38%)`,
                              border: `1.5px solid ${tkc("bg")}`, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              fontSize: "var(--fs-label)", color: tkc("white"), fontFamily: "var(--f-mono)", fontWeight: 700,
                            }}>{name[0]}</span>
                          ))}
                        </span>
                        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)" }}>
                          {voters[voters.length - 1].toUpperCase()} {voters.length > 1 ? "+ " + (voters.length - 1) + " VOTED" : "JUST VOTED"} → PATH {o.letter}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* countdown rail */}
          <div style={{ height: 2, borderRadius: "var(--r-1)", background: "rgba(255,255,255,.12)", marginTop: 16, overflow: "hidden" }}>
            <div style={{ width: (left / FM_SECONDS) * 100 + "%", height: "100%", background: "var(--c-amber)", transition: "width 1s linear" }}></div>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { useForkMoments, ForkMomentOverlay, forkLedgerRead, forkLedgerCounts });
})();
