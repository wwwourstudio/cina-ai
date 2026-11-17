// watch-branches-v4.jsx — Branched Cinema · v4
//
// What v4 adds on top of v3:
//
//  Branched Market (lobby):
//    - "Your cuts" library shelf (past completed sequences)
//    - Filter chips (All · Live now · Pre-show · Holders only)
//    - Compose CTA for directors → /branches/compose
//
//  Branched Viewer (watch page) — UX overhaul:
//    - Fork warning chyron slides in at T-30s with a teaser of the upcoming choice
//    - Hover-timeline tooltips on each fork marker (heading + leading option)
//    - In-room cohort grid (18 live viewers w/ their current leaning)
//    - Director's annotations (rotating pill in player chrome)
//    - Subtitle / dialogue overlay (current line, between forks)
//    - Branch-tree visualization replaces the 4-card row — shows all 81 cuts
//      with your traversal highlighted, plus the room's canonical path
//    - Streak / accuracy stat next to the director chip
//    - Skip-to-next-fork button (with confirm)
//
//  Branched Composer (director workflow):
//    - 4-fork tree editor: edit heading, setup, question, options inline
//    - Scene metadata strip per fork (timecode, tone, runtime)
//    - Live preview of the lobby card
//    - Launch flow → schedules a Room
//
// Routes touched:
//   /branches              → BranchedMarketV4
//   /branches/compose      → BranchedComposer
//   /branches/:filmId      → BranchedViewerV4

const { useState: usV, useEffect: ueV, useMemo: umV, useRef: urV, useCallback: ucV } = React;

const PCT = (n) => `${Math.round(n * 100)}%`;

// ─── BranchRoom store — the room's real, persistent state ──────────────
// Everything the live backend will own later flows through this one surface:
// picks (yours, per film), vote tallies (mutable — your vote moves them),
// and the fork ledger write that pays the director. Swap the internals for a
// websocket and every panel updates for free.
const BranchRoom = {
  _subs: new Set(),
  _emit() { this._subs.forEach(fn => fn()); },
  subscribe(fn) { this._subs.add(fn); return () => this._subs.delete(fn); },
  _read(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch (e) { return fallback; } },
  _write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  // ── picks ──
  picks(filmId, n) { const p = this._read("cina:branch:picks:" + filmId, null); return Array.isArray(p) ? p.concat(Array(Math.max(0, n - p.length)).fill(null)).slice(0, n) : Array(n).fill(null); },
  savePicks(filmId, picks) { this._write("cina:branch:picks:" + filmId, picks); this._emit(); },
  clearPicks(filmId, n) { this.savePicks(filmId, Array(n).fill(null)); },
  // ── votes ── stored as { [forkId]: { [optId]: extraVotes } }, merged over seeds
  votes(filmId) { return this._read("cina:branch:votes:" + filmId, {}); },
  castVote(filmId, tree, forkIdx, optId, weight = 1) {
    const fork = tree.forks[forkIdx];
    const v = this.votes(filmId);
    const fkey = fork.id || "fork" + forkIdx;
    v[fkey] = v[fkey] || {};
    v[fkey][optId] = (v[fkey][optId] || 0) + weight;
    this._write("cina:branch:votes:" + filmId, v);
    // Pay the director — same ledger the Board's analytics + payouts read.
    try {
      const led = this._read("cina:fork-ledger", []);
      const letter = ["A", "B", "C"][fork.options.findIndex(o => o.id === optId)] || "A";
      const leading = [...fork.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      led.unshift({ id: "bfk_" + Date.now().toString(36), ts: Date.now(), source: "branch-room", rootId: fkey, forkId: fkey, filmId, letter, minority: leading && leading.id !== optId });
      this._write("cina:fork-ledger", led.slice(0, 500));
    } catch (e) {}
    this._emit();
  },
  // Merge stored votes over a tree's seed numbers — all panels read this.
  mergedTree(filmId, tree) {
    const v = this.votes(filmId);
    if (!Object.keys(v).length) return tree;
    return {
      ...tree,
      forks: tree.forks.map((f, i) => {
        const extra = v[f.id || "fork" + i] || {};
        return { ...f, options: f.options.map(o => ({ ...o, votes: (o.votes || 0) + (extra[o.id] || 0) })) };
      }),
    };
  },
};
// ─── Mock cohort + annotations + dialogue ────────────────────────────────
// 36 viewers in the room cohort. Color denotes current leaning.

const COHORT_HANDLES = [
  "maela","orin","bex","p_chen","a_kindt","mosshouse","quiet","v_arrow","ji_lin",
  "aurora","laila","sten","yura","kobe","temi","ren","nox","alma",
  "shio","velvet","ami","kojin","penn","wren","odette","tao","sage",
  "thalia","ish","milo","kura","fenn","ova","jess","ria","bren",
];

function makeCohort(seedStr) {
  // Deterministic per film (seed by filmId)
  const seed = [...seedStr].reduce((a, c) => a + c.charCodeAt(0), 0);
  const palette = ["var(--c-amber)", tkc("bad"), tkc("cat-1"), tkc("cat-2"), tkc("ink-3"), tkc("good")];
  return COHORT_HANDLES.map((h, i) => {
    const r = (seed * 9301 + i * 49297) % 233280;
    const cIdx = (r >> 4) % palette.length;
    const isHolder = (r & 7) === 0;
    const leaning = palette[cIdx];
    return {
      handle: "@" + h,
      initials: h.slice(0, 2).toUpperCase(),
      color: leaning,
      holder: isHolder,
      dot: ((r >> 8) & 1) ? "live" : "watching",
    };
  });
}

const DIRECTOR_NOTES_BY_FILM = {
  frequency: [
    "Shot at 4am on a real abandoned transmitter outside Joshua Tree.",
    "Esme's actor learned morse code for one inaudible scene.",
    "The score here was generated from real shortwave numbers stations.",
    "Long take — 6 minutes, no cuts. We did 14 takes.",
    "The amber here is exactly the amber of a 1970s booth lamp.",
    "If she walks away, you never see the booth again. Permanently.",
  ],
  marauder: [
    "Most of the lighting on this deck is one practical bulb.",
    "Captain's actor improvised the manifest count from memory.",
    "The cryo pod props are working — they actually open and close.",
    "Audio: the recyclers were re-recorded in a real grain silo.",
    "If they vent the deck, the next 14 minutes are pure silence.",
    "We shot the carrier interior in a decommissioned tanker.",
  ],
  swallows: [
    "All the rain in this scene is real. We waited three months.",
    "The grandfather's coat is the actor's grandfather's coat.",
    "Each letter is written in calligraphy by the same hand.",
    "The kitchen sequence was unscripted past the first line.",
    "Yara holds shots until the actor blinks. That's the cut.",
    "If she burns both, the rest of the film is one location.",
  ],
};

const DIALOGUE_BY_FILM = {
  frequency: [
    { at: 30,  text: "Static. There's no station here at this hour." },
    { at: 90,  text: "I picked up the headphones because no one had been here in years." },
    { at: 180, text: "It said my name. Not 'hello'. My name." },
    { at: 280, text: "I want to know who you are before I answer." },
    { at: 360, text: "If I run tape, I keep a copy. That's all." },
  ],
  marauder: [
    { at: 30,  text: "Beacon's clean. Too clean for fourteen years out." },
    { at: 90,  text: "Manifest says twelve pods. I count twelve. One reads zero." },
    { at: 180, text: "Don't tell the crew. Not yet." },
    { at: 280, text: "Something's moving through the recyclers." },
  ],
  swallows: [
    { at: 30,  text: "Two letters. Sealed. Never sent." },
    { at: 90,  text: "The dates don't match. They were before he was born." },
    { at: 180, text: "She's eighty-four. Three towns over. Still living." },
    { at: 280, text: "There's someone on the porch. He has a key." },
  ],
};

// ─── Your past cuts (library) ────────────────────────────────────────────
// In a real product this comes from the user's profile. Mocked here.

const YOUR_CUTS_LIBRARY = [
  { filmId: "frequency", filmTitle: "Frequency 88.6", director: "Tao Reng", accent: tkc("amber"),
    completedAt: "2 weeks ago",
    glyphs: ["◆", "■", "❍", "▲"],
    titles: ["Sit at the console", "Her sister's name", "Herself", "Signal"],
    matchedRoom: 3, of: 4 },
  { filmId: "swallows",  filmTitle: "The Swallows",   director: "Yara Kim", accent: tkc("cat-1"),
    completedAt: "last month",
    glyphs: ["◆", "●", "◉", "■"],
    titles: ["Open both", "Visit", "Talk on porch", "Send"],
    matchedRoom: 4, of: 4 },
  { filmId: "marauder",  filmTitle: "Marauder",       director: "Yara Kim", accent: tkc("bad"),
    completedAt: "March",
    glyphs: ["▲", "■", "◉", "●"],
    titles: ["Board it", "Captain only", "Talk to it", "Nothing at all"],
    matchedRoom: 2, of: 4 },
];

// ─── Fork warning chyron ─────────────────────────────────────────────────
// Slides in from top at T-30s. Teases the upcoming choice without spoiling.

function ForkWarning({ fork, accent, secondsLeft }) {
  // Show only between 30s and 1s before the fork; the overlay takes over after.
  if (secondsLeft > 30 || secondsLeft < 1) return null;
  const flash = secondsLeft <= 8;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: 76, zIndex: 8,
      display: "flex", justifyContent: "center",
      pointerEvents: "none",
      animation: "v4WarnIn .5s ease-out",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 18,
        padding: "12px 22px 12px 18px",
        background: "rgba(8,8,10,.82)", backdropFilter: "blur(14px)",
        border: `1px solid ${flash ? "var(--c-blood-l)" : accent + "aa"}`,
        borderRadius: 999,
        boxShadow: `0 12px 32px rgba(0,0,0,.6), 0 0 0 1px ${flash ? "var(--c-blood-l)" : accent}33`,
        animation: flash ? "v4WarnPulse 0.9s ease-in-out infinite" : "none",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: flash ? "var(--c-blood-l)" : accent,
          boxShadow: `0 0 10px ${flash ? "var(--c-blood-l)" : accent}`,
          animation: "v4Blink 1s infinite",
        }}/>
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            letterSpacing: ".16em", fontWeight: 700,
            color: flash ? "var(--c-blood-l)" : accent,
            textTransform: "uppercase",
          }}>
            {flash ? `FORK IN ${secondsLeft}S` : `Fork approaching · ${fork.actLabel}`}
          </div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", color: tkc("white"), fontWeight: 500, lineHeight: 1.1,
            marginTop: 2,
          }}>{fork.heading}</div>
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.15)" }}/>
        <div style={{ display: "flex", gap: 6 }}>
          {fork.options.map(o => (
            <span key={o.id} title={o.title} style={{
              width: 26, height: 26, borderRadius: "var(--r-2)",
              background: o.color + "30", border: `1px solid ${o.color}88`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-body)", color: o.color, lineHeight: 1,
            }}>{o.glyph}</span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes v4WarnIn { from { transform: translateY(-24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes v4WarnPulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.018) } }
        @keyframes v4Blink { 50% { opacity: 0.35 } }
      `}</style>
    </div>
  );
}

// ─── Subtitle overlay ────────────────────────────────────────────────────

function SubtitleOverlay({ filmId, elapsedSec, accent, hide }) {
  const lines = DIALOGUE_BY_FILM[filmId] || [];
  // Show the most recent line whose `at` is past, for ~6 seconds
  const visible = lines.filter(l => elapsedSec >= l.at && elapsedSec < l.at + 6).slice(-1)[0];
  if (!visible || hide) return null;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 110, zIndex: 4,
      display: "flex", justifyContent: "center",
      pointerEvents: "none",
      animation: "v4SubIn .25s ease-out",
    }}>
      <div style={{
        maxWidth: 760, padding: "8px 18px",
        background: "rgba(0,0,0,.62)", backdropFilter: "blur(6px)",
        borderLeft: `2px solid ${accent}`,
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: "var(--fs-title)", color: tkc("ink"), lineHeight: 1.3,
        textWrap: "balance", textAlign: "center",
      }}>
        {visible.text}
      </div>
      <style>{`@keyframes v4SubIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  );
}

// ─── Director's annotation pill — rotating ───────────────────────────────

function DirectorAnnotation({ filmId, accent, directorInitials, paused }) {
  const notes = DIRECTOR_NOTES_BY_FILM[filmId] || [];
  const [idx, setIdx] = usV(0);
  ueV(() => {
    if (paused || !notes.length) return;
    const id = setInterval(() => setIdx(i => (i + 1) % notes.length), 14000);
    return () => clearInterval(id);
  }, [paused, notes.length]);
  if (!notes.length) return null;
  const note = notes[idx];
  return (
    <div key={idx} style={{
      position: "absolute", left: 28, bottom: 156, zIndex: 4,
      maxWidth: 360, padding: "10px 14px 10px 12px",
      background: "rgba(8,8,10,.7)", backdropFilter: "blur(10px)",
      border: `1px solid ${accent}55`, borderRadius: "var(--r-2)",
      display: "flex", gap: 10, alignItems: "flex-start",
      animation: "v4NoteIn .45s ease-out",
      pointerEvents: "none",
    }}>
      <span style={{
        flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
        background: `linear-gradient(135deg, ${accent}, ${accent}66)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-display)", fontStyle: "italic",
        fontSize: "var(--fs-label)", color: "var(--c-on-amber)", fontWeight: 700,
      }}>{directorInitials}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          letterSpacing: ".16em", color: accent, fontWeight: 700,
          textTransform: "uppercase", marginBottom: 2,
        }}>DIRECTOR&apos;S NOTE</div>
        <div style={{
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: "var(--fs-body)", lineHeight: 1.35, color: "rgba(240,231,223,.92)",
        }}>{note}</div>
      </div>
      <style>{`@keyframes v4NoteIn { from { opacity: 0; transform: translateX(-12px) } to { opacity: 1; transform: translateX(0) } }`}</style>
    </div>
  );
}

// ─── Timeline with hoverable fork markers + tooltip ──────────────────────

function CinemaTimeline({ tree, elapsed, totalSec, picks, accent, onSeekFork }) {
  const [hover, setHover] = usV(null); // { idx, x }
  const trackRef = urV(null);
  return (
    <div style={{ position: "relative", height: 42 }} ref={trackRef}>
      {/* Background track */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 18, height: 4,
        background: "rgba(255,255,255,.13)", borderRadius: "var(--r-1)",
      }}/>
      {/* Filled track */}
      <div style={{
        position: "absolute", left: 0, top: 18, height: 4,
        width: `${(elapsed / totalSec) * 100}%`,
        background: `linear-gradient(90deg, ${accent}99, ${accent})`,
        borderRadius: "var(--r-1)",
        boxShadow: `0 0 14px ${accent}aa`,
        transition: "width .3s linear",
      }}/>
      {/* Fork markers */}
      {tree.forks.map((f, i) => {
        const pct = (f.atMinute / tree.totalRuntimeMin) * 100;
        const picked = picks[i];
        const pickedOpt = picked ? f.options.find(o => o.id === picked) : null;
        const reached = elapsed >= f.atMinute * 60 || picked;
        const isNext = !picked && tree.forks.findIndex((g, j) => !picks[j] && g.atMinute * 60 > elapsed) === i;
        return (
          <div key={f.id}
            onMouseEnter={() => setHover({ idx: i, pct })}
            onMouseLeave={() => setHover(h => h?.idx === i ? null : h)}
            onClick={() => onSeekFork && onSeekFork(i)}
            style={{
              position: "absolute", left: `${pct}%`, top: 10,
              width: 22, height: 22, marginLeft: -11, borderRadius: "50%",
              background: pickedOpt ? pickedOpt.color : reached ? accent : "var(--c-panel)",
              border: `2px solid ${isNext ? tkc("white") : reached ? tkc("white") : "rgba(255,255,255,.35)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
              color: pickedOpt ? tkc("void") : reached ? tkc("on-amber") : "var(--c-ink-3)",
              cursor: onSeekFork ? "pointer" : "default",
              boxShadow: isNext ? `0 0 0 4px ${accent}33, 0 0 18px ${accent}88` : "none",
              animation: isNext ? "v4ForkPulse 2.4s ease-in-out infinite" : "none",
              zIndex: hover?.idx === i ? 5 : 2,
              transition: "transform .14s",
              transform: hover?.idx === i ? "scale(1.18)" : "scale(1)",
            }}>{f.actNum}</div>
        );
      })}
      {/* Playhead */}
      <div style={{
        position: "absolute", left: `${(elapsed / totalSec) * 100}%`,
        top: 10, width: 2, height: 22, marginLeft: -1, background: tkc("white"),
        boxShadow: "0 0 10px rgba(255,255,255,.6)", borderRadius: "var(--r-1)",
        pointerEvents: "none",
      }}/>
      {/* Hover tooltip */}
      {hover != null && (() => {
        const f = tree.forks[hover.idx];
        const leading = [...f.options].sort((a, b) => b.votes - a.votes)[0];
        return (
          <div style={{
            position: "absolute", left: `${hover.pct}%`, bottom: 36,
            transform: "translateX(-50%)",
            width: 280, padding: 14,
            background: "rgba(8,8,10,.96)", backdropFilter: "blur(14px)",
            border: `1px solid ${accent}66`, borderRadius: "var(--r-2)",
            boxShadow: "0 16px 40px rgba(0,0,0,.6)",
            pointerEvents: "none", zIndex: 10,
            animation: "v4Tip .15s ease-out",
          }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: accent, fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
            }}>{f.actLabel} · {f.atMinute}M · {f.question}</div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.2, marginBottom: 10,
              letterSpacing: "-0.01em",
            }}>{f.heading}</div>
            {picks[hover.idx] ? (
              <div style={{
                padding: "6px 10px",
                background: `${f.options.find(o => o.id === picks[hover.idx]).color}22`,
                borderLeft: `2px solid ${f.options.find(o => o.id === picks[hover.idx]).color}`,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                color: "rgba(255,255,255,.85)", letterSpacing: ".16em",
              }}>
                YOU PICKED · {f.options.find(o => o.id === picks[hover.idx]).title.toUpperCase()}
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  color: "rgba(255,255,255,.45)", marginBottom: 4, textTransform: "uppercase",
                }}>Currently leading</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-lead)", color: leading.color,
                  }}>{leading.glyph}</span>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-lead)", color: tkc("white"),
                  }}>{leading.title}</span>
                  <span style={{ flex: 1 }}/>
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                    color: leading.color, fontWeight: 600,
                  }}>{Math.round(leading.votes / f.options.reduce((s, o) => s + o.votes, 0) * 100)}%</span>
                </div>
              </>
            )}
          </div>
        );
      })()}
      <style>{`
        @keyframes v4ForkPulse { 0%, 100% { box-shadow: 0 0 0 4px ${accent}33, 0 0 18px ${accent}88 } 50% { box-shadow: 0 0 0 8px ${accent}22, 0 0 28px ${accent}cc } }
        @keyframes v4Tip { from { opacity: 0; transform: translate(-50%, 6px) } to { opacity: 1; transform: translate(-50%, 0) } }
      `}</style>
    </div>
  );
}

// ─── In-room cohort grid ─────────────────────────────────────────────────

function CohortGrid({ filmId, accent, picks, currentForkIdx }) {
  const cohort = umV(() => makeCohort(filmId), [filmId]);
  // Animated "live activity" pulse
  const [pulse, setPulse] = usV(0);
  ueV(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % 1000), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      padding: 16, background: "var(--c-panel)",
      border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
    }}>
      <div style={{
        display: "flex", alignItems: "baseline",
        justifyContent: "space-between", marginBottom: 12,
      }}>
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent,
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
          }}>IN YOUR ROW</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1, marginTop: 4 }}>
            36 watching with you
          </div>
        </div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
          letterSpacing: ".16em", textTransform: "uppercase",
        }}>
          {cohort.filter(c => c.holder).length} HOLDERS · 5×
        </div>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 4,
      }}>
        {cohort.slice(0, 36).map((c, i) => {
          const shimmer = (pulse + i * 7) % 36 < 3;
          return (
            <div key={i} title={`${c.handle}${c.holder ? " · holder" : ""}`} style={{
              position: "relative",
              aspectRatio: "1/1", borderRadius: "var(--r-2)",
              background: `linear-gradient(135deg, ${c.color}55, ${c.color}22)`,
              border: c.holder ? `1.5px solid ${c.color}` : `1px solid ${c.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-label)", color: c.color, fontWeight: 600,
              opacity: shimmer ? 1 : 0.85,
              transition: "opacity .4s",
            }}>
              {c.initials}
              {c.holder && (
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  width: 7, height: 7, borderRadius: "50%",
                  background: "var(--c-amber)", boxShadow: "0 0 4px var(--c-amber)",
                }}/>
              )}
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--c-line)",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        <span style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
          letterSpacing: ".16em", textTransform: "uppercase",
        }}>LEANING</span>
        {(() => {
          const tally = {};
          cohort.forEach(c => { tally[c.color] = (tally[c.color] || 0) + (c.holder ? 5 : 1); });
          return Object.entries(tally)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([color, n]) => (
              <span key={color} style={{
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "var(--r-1)",
                  background: color,
                }}/>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>{n}w</span>
              </span>
            ));
        })()}
      </div>
    </div>
  );
}

// ─── Branch-tree visualization (replaces 4-card row) ─────────────────────
// A clean 4-stage tree showing each fork's 3 branches; your path lit up.

function BranchTree({ tree, picks, accent }) {
  const W = 1080, H = 264;
  const colX = [60, 360, 660, 960];
  // Use first 3 options per fork (some have only 3); arrange vertically
  const rowY = [56, 140, 224];
  const optPos = (forkIdx, optIdx) => ({ x: colX[forkIdx], y: rowY[optIdx] });
  return (
    <div style={{
      padding: "22px 24px 24px",
      background: "var(--c-panel)",
      border: "1px solid var(--c-line)",
      borderRadius: "var(--r-2)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent,
            letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
          }}>YOUR PATH THROUGH THE TREE</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, marginTop: 4, letterSpacing: "-0.01em" }}>
            {picks.filter(Boolean).length} / {tree.forks.length} forks taken · {tree.totalCuts} cuts possible
          </div>
        </div>
        <div style={{
          padding: "6px 12px",
          background: `${accent}14`, border: `1px solid ${accent}55`, borderRadius: "var(--r-2)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          color: accent, letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>1 of {tree.totalCuts}</div>
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto", paddingTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", minWidth: 600, height: "auto", display: "block" }}>
          {/* Connecting lines: prev pick → next options, plus all all → all (dim) */}
          {tree.forks.map((f, i) => (
            <g key={"l" + i}>
              {/* From column i to column i+1, draw lines */}
              {i < tree.forks.length - 1 && f.options.slice(0, 3).map((opt, oi) => (
                tree.forks[i + 1].options.slice(0, 3).map((next, ni) => {
                  const fromPicked = picks[i] === opt.id;
                  const toPicked   = picks[i + 1] === next.id;
                  const onPath = fromPicked && toPicked;
                  const a = optPos(i, oi);
                  const b = optPos(i + 1, ni);
                  // Bezier curve
                  const cx1 = a.x + 100, cx2 = b.x - 100;
                  return (
                    <path key={`${oi}-${ni}`}
                      d={`M${a.x + 16},${a.y} C${cx1},${a.y} ${cx2},${b.y} ${b.x - 16},${b.y}`}
                      fill="none"
                      stroke={onPath ? accent : `${accent}10`}
                      strokeWidth={onPath ? 2 : 0.8}
                      style={{ filter: onPath ? `drop-shadow(0 0 6px ${accent}aa)` : "none" }}
                    />
                  );
                })
              )).flat()}
            </g>
          ))}
          {/* Stage labels */}
          {tree.forks.map((f, i) => (
            <g key={"h" + i}>
              <text x={colX[i]} y={18} textAnchor="middle"
                style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: 2, fill: accent, fontWeight: 700, textTransform: "uppercase" }}>
                {f.actLabel} · {f.atMinute}M
              </text>
            </g>
          ))}
          {/* Nodes */}
          {tree.forks.map((f, i) =>
            f.options.slice(0, 3).map((opt, oi) => {
              const { x, y } = optPos(i, oi);
              const picked = picks[i] === opt.id;
              const reached = picks[i] || (i < picks.findIndex(p => !p) + 1 && picks[i - 1]);
              const dim = picks[i] && picks[i] !== opt.id;
              return (
                <g key={`n${i}-${oi}`} opacity={dim ? 0.32 : 1}>
                  <circle cx={x} cy={y} r={picked ? 13 : 9}
                    fill={picked ? opt.color : `${opt.color}25`}
                    stroke={picked ? tkc("white") : opt.color}
                    strokeWidth={picked ? 1.5 : 1}
                    style={{ filter: picked ? `drop-shadow(0 0 8px ${opt.color})` : "none" }}
                  />
                  <text x={x} y={y + 3} textAnchor="middle"
                    style={{
                      fontFamily: "var(--f-display)", fontStyle: "italic",
                      fontSize: picked ? 12 : 10,
                      fill: picked ? tkc("void") : opt.color,
                      fontWeight: 600,
                    }}>{opt.glyph}</text>
                  <text x={x + 20} y={y + 4}
                    style={{
                      fontFamily: "var(--f-display)", fontStyle: "italic",
                      fontSize: picked ? 17 : 14.5,
                      fill: picked ? tkc("ink") : "var(--c-ink-2)",
                      fontWeight: picked ? 500 : 400,
                    }}>{opt.title}</text>
                </g>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}

// ─── Live room chat — one panel, dockable beside the player or below ────
function RoomChatPanel({ tree, chatLog, chatDraft, setChatDraft, sendChat, dark, style }) {
  const endRef = urV(null);
  ueV(() => { if (endRef.current) endRef.current.scrollTop = 1e6; }, [chatLog]);
  return (
    <div style={{
      background: dark ? "rgba(10,10,12,.97)" : "var(--c-panel)",
      border: dark ? "none" : "1px solid var(--c-line)",
      borderLeft: dark ? "1px solid rgba(255,255,255,.1)" : undefined,
      borderRadius: dark ? 0 : 10, display: "flex", flexDirection: "column",
      overflow: "hidden", minHeight: 0, ...style,
    }}>
      <div style={{
        padding: "12px 14px", borderBottom: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid var(--c-line)",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: dark ? "rgba(255,255,255,.55)" : "var(--c-ink-3)",
        letterSpacing: ".16em", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 4px var(--c-good)" }}/>
        <span>LIVE CHAT · {tree.roomSize.toLocaleString()}</span>
      </div>
      <div ref={endRef} style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7, minHeight: 0 }}>
        {chatLog.slice(-40).map((m, i) => (
          <div key={i} style={{ fontSize: "var(--fs-body)", lineHeight: 1.4, padding: m.mine ? "4px 8px" : 0, background: m.mine ? `${tree.accentColor}14` : "transparent", borderRadius: "var(--r-2)" }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: m.color, marginRight: 6, fontWeight: 600 }}>{m.who}</span>
            <span style={{ color: dark ? "rgba(255,255,255,.8)" : "var(--c-ink-2)" }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: 8, borderTop: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid var(--c-line)", display: "flex", gap: 6, flexShrink: 0 }}>
        <input value={chatDraft} onChange={e => setChatDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendChat(); }} placeholder="Say something to the room…" style={{
          flex: 1, minWidth: 0, padding: "7px 11px",
          background: dark ? "rgba(255,255,255,.06)" : "var(--c-bg)",
          border: dark ? "1px solid rgba(255,255,255,.15)" : "1px solid var(--c-line-2)",
          borderRadius: "var(--r-1)", color: dark ? tkc("white") : "var(--c-ink)", outline: "none",
          fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
        }}/>
        <button onClick={sendChat} style={{
          padding: "7px 12px", background: tree.accentColor, color: "var(--c-void)",
          border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
        }}>SEND</button>
      </div>
    </div>
  );
}

function BranchedViewerV4({ filmId }) {
  const tree0 = (window.BRANCH_FILMS && window.BRANCH_FILMS[filmId]) || null;
  if (!tree0) return <BranchedMarketV4/>;

  // Votes are real: your casts merge over the seed tallies, everywhere.
  const [voteTick, setVoteTick] = usV(0);
  const tree = umV(() => BranchRoom.mergedTree(filmId, tree0), [filmId, tree0, voteTick]);

  const [elapsed, setElapsed] = usV(tree0.yourCutAtMinute * 60 || 0);
  const [paused, setPaused] = usV(false);
  const [picks, setPicks] = usV(() => BranchRoom.picks(filmId, tree0.forks.length));
  const [forkOverlayOpen, setForkOverlayOpen] = usV(false);
  const [activeForkIdx, setActiveForkIdx] = usV(0);
  const [forkCountdown, setForkCountdown] = usV(60);
  const [resultPreview, setResultPreview] = usV(null);
  const [showAllPicked, setShowAllPicked] = usV(() => BranchRoom.picks(filmId, tree0.forks.length).every(Boolean));
  const [chatLog, setChatLog] = usV(() => tree0.chatSeed.slice());
  const [chatDraft, setChatDraft] = usV("");
  const [skipConfirm, setSkipConfirm] = usV(false);
  const [aiOpen, setAiOpen] = usV(false);
  const [cutsOpen, setCutsOpen] = usV(false);
  const [belowTab, setBelowTab] = usV("path"); // path | room | cuts
  // Live chat docked beside the player — visible above the fold by default.
  const [sideChat, setSideChat] = usV(() => { try { return localStorage.getItem("cina:branch:sidechat") !== "0"; } catch { return true; } });
  ueV(() => { try { localStorage.setItem("cina:branch:sidechat", sideChat ? "1" : "0"); } catch {} }, [sideChat]);
  const isMobileV = typeof useIsMobile === "function" ? useIsMobile() : false;
  const chatDocked = sideChat && !isMobileV;

  // Picks persist — refresh drops you back into the same traversal.
  ueV(() => { BranchRoom.savePicks(filmId, picks); }, [picks, filmId]);

  // CATALOG entry powers the AI companion (chapters, cast x-ray, ask).
  const film = umV(() => (window.CATALOG || []).find(f => f.id === filmId) || {
    id: filmId, title: tree.title, logline: tree.lobbyBlurb || "",
    thumb: tree.poster, color: tree.accentColor,
  }, [filmId, tree]);

  // Tick — auto-advance time
  ueV(() => {
    if (paused || forkOverlayOpen || resultPreview) return;
    const id = setInterval(() => setElapsed(e => Math.min(e + 1, tree.totalRuntimeMin * 60)), 1000);
    return () => clearInterval(id);
  }, [paused, forkOverlayOpen, resultPreview, tree]);

  // Fork trigger when elapsed crosses fork minute
  ueV(() => {
    const min = elapsed / 60;
    for (let i = 0; i < tree.forks.length; i++) {
      const f = tree.forks[i];
      if (Math.abs(min - f.atMinute) < 0.1 && !picks[i] && !forkOverlayOpen) {
        setActiveForkIdx(i);
        setForkOverlayOpen(true);
        setForkCountdown(60);
        return;
      }
    }
  }, [elapsed, picks, forkOverlayOpen, tree]);

  // Fork countdown
  ueV(() => {
    if (!forkOverlayOpen) return;
    const id = setInterval(() => {
      setForkCountdown(c => {
        if (c <= 1) {
          const fork = tree.forks[activeForkIdx];
          const leading = [...fork.options].sort((a, b) => b.votes - a.votes)[0];
          submitPick(leading.id, true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [forkOverlayOpen, activeForkIdx]);

  // Chat tick (kept light)
  ueV(() => {
    const lines = ["this scene", "look at the lighting", "im not ok", "the score!", "PEAK CINEMA", "watching with my mom"];
    const handles = ["@maela", "@orin", "@bex", "@p_chen", "@a_kindt", "@mosshouse"];
    const id = setInterval(() => {
      setChatLog(log => {
        const next = {
          who: handles[Math.floor(Math.random() * handles.length)],
          text: lines[Math.floor(Math.random() * lines.length)],
          color: ["var(--c-amber)", tkc("cat-1"), tkc("bad"), tkc("cat-2")][Math.floor(Math.random() * 4)],
        };
        return [...log.slice(-40), next];
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const submitPick = (id, auto = false) => {
    const fork = tree.forks[activeForkIdx];
    // Cast the vote for real — tallies move, the director gets paid.
    if (!auto) { BranchRoom.castVote(filmId, tree, activeForkIdx, id, 1); setVoteTick(t => t + 1); }
    const next = [...picks]; next[activeForkIdx] = id; setPicks(next);
    setForkOverlayOpen(false); setForkCountdown(60);
    setResultPreview({ forkIdx: activeForkIdx, pickedId: id, auto });
    setTimeout(() => {
      setResultPreview(null); setElapsed(e => e + 6);
      if (next.every(Boolean)) {
        setShowAllPicked(true);
        // Save the path the room locked in tonight as a rentable cut, and the
        // viewer's own picks as their personal cut.
        if (window.branchedSaveCut) {
          const roomOpts = tree.forks.map(f => [...f.options].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]);
          window.branchedSaveCut(tree, roomOpts, { name: `Room cut · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}` });
          const yourOpts = next.map((pid, i) => tree.forks[i].options.find(o => o.id === pid)).filter(Boolean);
          window.branchedSaveCut(tree, yourOpts, { mine: true, name: "Your cut" });
        }
      }
    }, 3600);
    const opt = fork.options.find(o => o.id === id);
    if (window.toast) window.toast({
      title: auto ? `${fork.actLabel} CANONICAL` : `${fork.actLabel} LOCKED`,
      text: `${opt.title} · ${auto ? "room consensus" : "your cut"}`, kind: "good",
    });
  };

  // Load a named cut into the room — the player replays that traversal.
  const loadCut = (cut) => {
    const ids = cut.opts.map(o => o.id);
    setPicks(ids.concat(Array(Math.max(0, tree.forks.length - ids.length)).fill(null)).slice(0, tree.forks.length));
    setShowAllPicked(true);
    setElapsed(totalSec);
    setCutsOpen(false);
    if (window.toast) window.toast({ title: "CUT LOADED", text: `${cut.name} · ${cut.pathLabel || ids.length + " forks"}`, kind: "good" });
  };

  const sendChat = () => {
    const text = chatDraft.trim();
    if (!text) return;
    setChatLog(log => [...log.slice(-40), { who: "@you", text, color: tree.accentColor, mine: true }]);
    setChatDraft("");
  };

  const skipToNextFork = () => {
    const next = tree.forks.find((f, i) => !picks[i] && f.atMinute * 60 > elapsed);
    if (!next) return;
    setElapsed(next.atMinute * 60);
    setSkipConfirm(false);
    if (window.toast) window.toast({ title: "SKIPPED AHEAD", text: `Jumped to ${next.actLabel}`, kind: "info" });
  };

  const tcSec = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };
  const totalSec = tree.totalRuntimeMin * 60;

  const nextFork = tree.forks.find((f, i) => !picks[i] && f.atMinute * 60 > elapsed);
  const nextForkSecs = nextFork ? Math.floor(nextFork.atMinute * 60 - elapsed) : Infinity;

  // External components from v3 we depend on
  const LiveScene = window.BranchedLiveScene;
  const ForkOverlay = window.BranchedForkOverlay; // not exported; we render our own via v3 fallback
  const ResultPreviewC = window.BranchedResultPreview;

  return (
    <div style={{ background: tkc("black"), color: tkc("white"), minHeight: "100vh" }}>
      <section style={{ position: "relative", background: tkc("black") }}>
        <div style={{ display: "grid", gridTemplateColumns: chatDocked ? "minmax(0, 1fr) minmax(260px, 330px)" : "1fr", alignItems: "stretch" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: chatDocked ? "16/9" : "21/9", maxHeight: "calc(100vh - 118px)", minHeight: 320, background: tkc("black"), overflow: "hidden" }}>
          {LiveScene && <LiveScene tree={tree} elapsedSec={elapsed} paused={paused}/>}

          {/* Top chrome */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 6,
            padding: chatDocked ? "14px 18px" : "18px 28px",
            display: "flex", alignItems: "center", gap: 10, minWidth: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,.75) 0%, transparent 100%)",
          }}>
            <a href="#/branches" onClick={(e) => { e.preventDefault(); navigate("/branches"); }} style={{
              padding: "6px 10px", background: "rgba(0,0,0,.5)",
              border: "1px solid rgba(255,255,255,.15)", borderRadius: "var(--r-1)",
              color: "rgba(255,255,255,.85)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              textTransform: "uppercase",
            }}>← {chatDocked ? "Rooms" : "All rooms"}</a>

            <div style={{ flex: 1, minWidth: 0 }}/>

            {!chatDocked && (
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)",
                letterSpacing: ".16em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0,
              }}>
                {tree.director.toUpperCase()} · {tree.title.toUpperCase()}
              </span>
            )}
            {!chatDocked && <span style={{ width: 1, height: 14, background: "rgba(255,255,255,.2)", flexShrink: 0 }}/>}
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor,
              letterSpacing: ".16em", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--c-blood-l)", boxShadow: "0 0 6px var(--c-blood-l)",
                animation: "v4Blink 1.4s infinite",
              }}/>
              LIVE · {tree.roomSize.toLocaleString()}
            </span>

            {/* Skip-to-fork */}
            {nextFork && nextForkSecs > 8 && (
              <button onClick={() => setSkipConfirm(true)} style={{
                padding: "6px 12px", whiteSpace: "nowrap", flexShrink: 0,
                background: "rgba(var(--accent-rgb),.12)",
                border: `1px solid ${tree.accentColor}55`, borderRadius: "var(--r-1)",
                color: tree.accentColor, cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                fontWeight: 700, textTransform: "uppercase",
              }}>↦ {chatDocked ? "Skip" : `Skip to ${nextFork.actLabel}`}</button>
            )}

            {/* Live chat dock toggle — keeps the room's chat above the fold */}
            {!isMobileV && (
              <button onClick={() => setSideChat(o => !o)} title={sideChat ? "Undock chat" : "Dock live chat beside the player"} style={{
                padding: "6px 12px", whiteSpace: "nowrap", flexShrink: 0,
                background: sideChat ? `${tree.accentColor}22` : "rgba(0,0,0,.5)",
                border: `1px solid ${sideChat ? tree.accentColor + "88" : "rgba(255,255,255,.15)"}`, borderRadius: "var(--r-1)",
                color: sideChat ? tree.accentColor : "rgba(255,255,255,.85)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                fontWeight: 700, textTransform: "uppercase",
              }}>◧ Chat</button>
            )}

            {/* Cuts drawer toggle — every named branch, watchable */}
            <button onClick={() => setCutsOpen(o => !o)} title="Named cuts · watch another branch" style={{
              padding: "6px 12px", whiteSpace: "nowrap", flexShrink: 0,
              background: cutsOpen ? `${tree.accentColor}22` : "rgba(0,0,0,.5)",
              border: `1px solid ${cutsOpen ? tree.accentColor + "88" : "rgba(255,255,255,.15)"}`, borderRadius: "var(--r-1)",
              color: cutsOpen ? tree.accentColor : "rgba(255,255,255,.85)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase",
            }}>⤑ Cuts</button>

            {/* Cina AI companion toggle */}
            <button onClick={() => setAiOpen(o => !o)} title="Cina — film companion" style={{
              padding: "6px 12px", whiteSpace: "nowrap", flexShrink: 0,
              background: aiOpen ? `${tree.accentColor}22` : "rgba(0,0,0,.5)",
              border: `1px solid ${aiOpen ? tree.accentColor + "88" : "rgba(255,255,255,.15)"}`, borderRadius: "var(--r-1)",
              color: aiOpen ? tree.accentColor : "rgba(255,255,255,.85)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase",
            }}>✦ Cina AI</button>
          </div>

          {/* Pre-fork warning */}
          {nextFork && !forkOverlayOpen && !resultPreview && (
            <ForkWarning fork={nextFork} accent={tree.accentColor} secondsLeft={nextForkSecs}/>
          )}

          {/* Subtitle */}
          <SubtitleOverlay
            filmId={filmId}
            elapsedSec={elapsed}
            accent={tree.accentColor}
            hide={forkOverlayOpen || resultPreview}
          />

          {/* Director annotation */}
          {!forkOverlayOpen && !resultPreview && (
            <DirectorAnnotation
              filmId={filmId}
              accent={tree.accentColor}
              directorInitials={tree.directorInitials}
              paused={paused}
            />
          )}

          {/* Fork overlay (delegates to v3) */}
          {forkOverlayOpen && window.BranchedForkOverlayShim && (
            <window.BranchedForkOverlayShim
              tree={tree} fork={tree.forks[activeForkIdx]}
              countdown={forkCountdown} onPick={(id) => submitPick(id, false)}
            />
          )}
          {forkOverlayOpen && !window.BranchedForkOverlayShim && (
            <ForkOverlayInline tree={tree} fork={tree.forks[activeForkIdx]} countdown={forkCountdown} onPick={(id) => submitPick(id, false)}/>
          )}

          {/* Result preview */}
          {resultPreview && (
            <ResultPreviewInline
              tree={tree} fork={tree.forks[resultPreview.forkIdx]}
              pickedId={resultPreview.pickedId} auto={resultPreview.auto}
              onSkip={() => { setResultPreview(null); setElapsed(e => e + 6); if (picks.every(Boolean)) setShowAllPicked(true); }}
            />
          )}

          {/* Cina AI film companion — slide-out (spoiler-safe; reads only up to NOW) */}
          {aiOpen && window.CinaPlayerIntel && (
            <window.CinaPlayerIntel
              film={film}
              t={elapsed}
              dur={totalSec}
              seek={(s) => setElapsed(Math.max(0, Math.min(totalSec, Math.floor(s))))}
              playing={!paused}
              setPlaying={(v) => setPaused(!v)}
              onClose={() => setAiOpen(false)}
              topOffset={68}
            />
          )}

          {/* Bottom chrome */}
          {!forkOverlayOpen && (
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 4,
              padding: "0 28px 22px",
              background: "linear-gradient(0deg, rgba(0,0,0,.92) 0%, transparent 100%)",
            }}>
              <div style={{ marginBottom: 14, display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor,
                  letterSpacing: ".16em", fontWeight: 700,
                }}>
                  {tcSec(elapsed)} / {tcSec(totalSec)}
                  {nextFork && ` · NEXT FORK IN ${Math.floor(nextForkSecs / 60)}:${String(nextForkSecs % 60).padStart(2, "0")}`}
                </div>
                <span style={{ flex: 1 }}/>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.45)",
                  letterSpacing: ".16em",
                }}>
                  CHAPTER {tree.forks.findIndex((f, i) => !picks[i] && f.atMinute * 60 > elapsed) + 1 || tree.forks.length} / {tree.forks.length}
                </div>
              </div>

              <CinemaTimeline tree={tree} elapsed={elapsed} totalSec={totalSec} picks={picks} accent={tree.accentColor}/>

              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => setPaused(p => !p)} style={{
                  width: 36, height: 36, background: tree.accentColor, color: "var(--c-void)",
                  border: "none", borderRadius: "var(--r-3)", cursor: "pointer", fontSize: "var(--fs-body)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{paused ? "▶" : "❚❚"}</button>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.6)", letterSpacing: ".08em" }}>
                  {paused ? "PAUSED" : "PLAYING · 21:9 · 4K HDR · CINA DOLBY ATMOS"}
                </span>
                <div style={{ flex: 1 }}/>
                <span style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)",
                  letterSpacing: ".16em",
                }}>
                  <span style={{
                    padding: "3px 8px",
                    background: `${tree.accentColor}22`, color: tree.accentColor,
                    border: `1px solid ${tree.accentColor}55`, borderRadius: "var(--r-1)",
                    fontWeight: 700, letterSpacing: ".16em",
                  }}>CC</span>
                  YOU · {picks.filter(Boolean).length}/4 FORKS PICKED
                </span>
              </div>
            </div>
          )}

          {/* Cuts drawer — watch another branch without leaving the room */}
          {cutsOpen && (
            <div style={{
              position: "absolute", top: 64, right: 20, bottom: 90, zIndex: 15, width: 340,
              background: "rgba(8,8,10,.94)", backdropFilter: "blur(16px)",
              border: `1px solid ${tree.accentColor}44`, borderRadius: "var(--r-2)",
              display: "flex", flexDirection: "column", overflow: "hidden",
              animation: "v4NoteIn .3s ease-out",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tree.accentColor, fontWeight: 700 }}>⤑ THE CUTS</span>
                <span style={{ flex: 1 }}/>
                <button onClick={() => setCutsOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: "var(--fs-body)" }}>×</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {(window.branchedListCuts ? window.branchedListCuts(tree) : []).map(cut => {
                  const owned = window.branchedOwned ? window.branchedOwned(tree.filmId) : { cuts: [], allAccess: false };
                  const isOwned = owned.allAccess || (owned.cuts || []).includes(cut.id) || cut.tag === "YOURS" || cut.tag === "CANONICAL";
                  return (
                    <div key={cut.id} style={{ padding: "11px 12px", borderRadius: "var(--r-2)", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white") }}>{cut.name}</span>
                        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: cut.tag === "CANONICAL" ? tree.accentColor : cut.tag === "YOURS" ? "var(--c-good)" : "rgba(255,255,255,.5)", border: "1px solid currentColor", borderRadius: "var(--r-1)", padding: "1px 5px", fontWeight: 700 }}>{cut.tag}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, margin: "8px 0" }}>
                        {cut.opts.map((o, k) => (
                          <span key={k} style={{ width: 20, height: 20, borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "center", background: `${o.color || tree.accentColor}22`, border: `1px solid ${o.color || tree.accentColor}77`, color: o.color || tree.accentColor, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-label)" }}>{o.glyph}</span>
                        ))}
                        <span style={{ flex: 1 }}/>
                        {isOwned
                          ? <button onClick={() => loadCut(cut)} style={{ padding: "3px 10px", borderRadius: "var(--r-2)", border: "none", background: tree.accentColor, color: "var(--c-void)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" }}>▶ PLAY</button>
                          : <button onClick={() => window.openBranchedRent && window.openBranchedRent(tree, cut, () => setCutsOpen(false))} style={{ padding: "3px 10px", borderRadius: "var(--r-2)", border: `1px solid ${tree.accentColor}88`, background: "transparent", color: tree.accentColor, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" }}>RENT ${cut.price ? cut.price.toFixed(2) : "3.00"}</button>}
                      </div>
                      <div style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cut.pathLabel}</div>
                    </div>
                  );
                })}
                {!(window.branchedListCuts && window.branchedListCuts(tree).length) && (
                  <div style={{ padding: 18, fontSize: "var(--fs-body)", color: "rgba(255,255,255,.5)", fontStyle: "italic", textAlign: "center" }}>No named cuts yet — finish a traversal and yours lands here.</div>
                )}
              </div>
            </div>
          )}

          {/* Skip confirm dialog */}
          {skipConfirm && (
            <div onClick={() => setSkipConfirm(false)} style={{
              position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,.7)",
              backdropFilter: "blur(10px)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <div onClick={e => e.stopPropagation()} style={{
                width: 480, padding: 28,
                background: "rgba(8,8,10,.95)", border: `1px solid ${tree.accentColor}66`,
                borderRadius: "var(--r-2)",
              }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor,
                  letterSpacing: ".16em", fontWeight: 700, marginBottom: 6,
                }}>SKIP AHEAD</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1.1, marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}>Jump to "{nextFork?.heading}"?</div>
                <p style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.7)", lineHeight: 1.5, margin: "8px 0 20px" }}>
                  You'll skip ~{Math.floor(nextForkSecs / 60)} minutes of the scene leading to this fork.
                  You'll still vote with the room. Your personal cut keeps the scene.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setSkipConfirm(false)} style={{
                    padding: "10px 16px", background: "transparent",
                    border: "1px solid rgba(255,255,255,.2)", borderRadius: "var(--r-1)", color: tkc("white"),
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                    fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
                  }}>Cancel</button>
                  <span style={{ flex: 1 }}/>
                  <button onClick={skipToNextFork} style={{
                    padding: "10px 18px", background: tree.accentColor, color: "var(--c-void)",
                    border: "none", borderRadius: "var(--r-1)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                    fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
                  }}>↦ Skip to fork</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Docked live chat — above the fold, beside the player */}
        {chatDocked && (
          <RoomChatPanel tree={tree} chatLog={chatLog} chatDraft={chatDraft} setChatDraft={setChatDraft} sendChat={sendChat} dark style={{ height: "100%", maxHeight: "calc(100vh - 118px)" }}/>
        )}
        </div>
      </section>

      {/* Below the stage */}
      <section style={{ background: "var(--c-bg)", padding: "22px var(--gutter) 64px", color: "var(--c-ink)" }}>
        {/* Room strip — director, live count, your standing, one CTA */}
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto 16px", display: "flex", alignItems: "center", gap: 20, padding: "13px 18px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${tree.accentColor}, ${tree.accentColor}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: tkc("white"), flexShrink: 0 }}>{tree.directorInitials}</div>
            <div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1 }}>{tree.director}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>DIRECTOR · IN ROOM</div>
            </div>
            <button onClick={() => navigate(`/creator/${((window.CATALOG || []).find(f => f.id === filmId) || {}).creatorId || "voss"}`)} style={{ padding: "4px 9px", background: "transparent", color: tree.accentColor, border: `1px solid ${tree.accentColor}55`, borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, cursor: "pointer", textTransform: "uppercase" }}>Follow</button>
          </div>
          <span style={{ width: 1, height: 26, background: "var(--c-line)" }}/>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-blood-l)", lineHeight: 1 }}>{tree.roomSize.toLocaleString()}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>LIVE IN THE ROOM</div>
          </div>
          <span style={{ width: 1, height: 26, background: "var(--c-line)" }}/>
          {(() => {
            let matched = 0, taken = 0;
            picks.forEach((p, i) => { if (!p) return; taken++; const leader = [...tree.forks[i].options].sort((a, b) => (b.votes||0) - (a.votes||0))[0]; if (leader.id === p) matched++; });
            return (
              <div>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tree.accentColor, lineHeight: 1 }}>{taken ? `${matched}/${taken}` : "—"}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>{taken ? (matched === taken ? "WITH THE ROOM" : matched > taken / 2 ? "MOSTLY WITH THE ROOM" : "AGAINST THE GRAIN") : "NO FORKS TAKEN YET"}</div>
              </div>
            );
          })()}
          <span style={{ flex: 1 }}/>
          <button onClick={() => window.openPay && window.openPay({
            kind: "nft", title: `${tree.title} · Producer`, subtitle: tree.director,
            accent: tree.accentColor, priceUSD: 320,
            image: { kind: tree.poster, color: tree.accentColor },
            perks: ["5× vote weight in every Branched film", `All ${tree.totalCuts} cuts unlocked`, "Director room afterparty access", "Quarterly royalty on Watch revenue"],
            ticketUrl: `/branches/${tree.filmId}`,
          })} style={{ padding: "9px 16px", background: tree.accentColor, color: "var(--c-void)", border: "none", borderRadius: "var(--r-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>Vote 5× · Back this film · $320</button>
        </div>

        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)", gap: 24, alignItems: "flex-start" }}>
          {/* Left column — tabbed, not stacked: the room stays scannable */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: 999, alignSelf: "flex-start" }}>
              {[["path", "Your path"], ["room", "The room"], ["cuts", "Cuts"]].map(([k, l]) => (
                <button key={k} onClick={() => setBelowTab(k)} style={{
                  padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: belowTab === k ? tree.accentColor : "transparent",
                  color: belowTab === k ? tkc("on-amber") : "var(--c-ink-3)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                }}>{l}</button>
              ))}
            </div>
            {belowTab === "path" && <BranchTree tree={tree} picks={picks} accent={tree.accentColor}/>}
            {belowTab === "room" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {window.BranchRoomStats && <BranchRoomStats tree={tree} picks={picks} accent={tree.accentColor}/>}
                <CohortGrid filmId={filmId} accent={tree.accentColor} picks={picks}/>
              </div>
            )}
            {belowTab === "cuts" && window.BranchNamedCuts && <BranchNamedCuts tree={tree} picks={picks} accent={tree.accentColor}/>}

            {/* Your cut summary — when complete */}
            {showAllPicked && (
              <div style={{
                padding: 26,
                background: `linear-gradient(135deg, ${tree.accentColor}14 0%, var(--c-panel) 70%)`,
                border: `1px solid ${tree.accentColor}`, borderRadius: "var(--r-2)",
                display: "flex", alignItems: "center", gap: 22,
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {picks.map((id, i) => {
                    const opt = tree.forks[i].options.find(o => o.id === id);
                    return (
                      <div key={i} style={{
                        width: 46, height: 46, borderRadius: "var(--r-1)",
                        background: `linear-gradient(135deg, ${opt.color}55, ${tkc("void")})`,
                        border: `1px solid ${opt.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--f-display)", fontStyle: "italic",
                        fontSize: "var(--fs-title)", color: opt.color, fontWeight: 500,
                      }}>{opt.glyph}</div>
                    );
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor,
                    letterSpacing: ".16em", fontWeight: 700, marginBottom: 4, textTransform: "uppercase",
                  }}>YOUR CUT · COMPLETE</div>
                  <div style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                  }}>
                    {picks.map((id, i) => tree.forks[i].options.find(o => o.id === id).title).join(" → ")}
                  </div>
                </div>
                <button onClick={() => { setPicks(Array(tree.forks.length).fill(null)); setShowAllPicked(false); setElapsed(0); }} style={{
                  padding: "10px 18px", background: tree.accentColor, color: "var(--c-void)",
                  border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  fontWeight: 700, textTransform: "uppercase",
                }}>Watch a different cut →</button>
              </div>
            )}
          </div>

          {/* Right rail — the chat IS the room (or a dock note when it's beside the player) */}
          <aside style={{ position: "sticky", top: 24 }}>
            {chatDocked ? (
              <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", padding: 18 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 4px var(--c-good)" }}/>
                  LIVE CHAT · DOCKED
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginBottom: 14 }}>
                  The room's chat is beside the player, above the fold. Undock it to read it here instead.
                </div>
                <button onClick={() => setSideChat(false)} style={{
                  padding: "8px 14px", background: "transparent", border: `1px solid ${tree.accentColor}66`, borderRadius: "var(--r-2)",
                  color: tree.accentColor, cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                }}>◧ Undock chat</button>
              </div>
            ) : (
              <RoomChatPanel tree={tree} chatLog={chatLog} chatDraft={chatDraft} setChatDraft={setChatDraft} sendChat={sendChat} style={{ height: 480 }}/>
            )}
          </aside>
        </div>

        {/* More rooms · more like this — bottom scroller */}
        {typeof Shelf === "function" && (() => {
          const C = window.CATALOG || [];
          const base = C.find(f => f.id === filmId) || {};
          const rel = C.filter(f => f.id !== filmId && (f.branched || f.creatorId === base.creatorId || (f.genre || []).some(g => (base.genre || []).includes(g)))).slice(0, 12).map(f => f.id);
          return rel.length ? (
            <div style={{ maxWidth: "var(--w-page)", margin: "40px auto 0", borderTop: "1px solid var(--c-line)" }}>
              <Shelf shelf={{ id: "more-like-" + filmId, title: "More like this", filmIds: rel }} size="sm"/>
            </div>
          ) : null;
        })()}
      </section>
    </div>
  );
}

function ForkOverlayInline({ tree, fork, countdown, onPick }) {
  // The room votes while the window is open — tallies tick live.
  const [liveExtra, setLiveExtra] = usV({});
  ueV(() => {
    const id = setInterval(() => {
      setLiveExtra(ex => {
        const opt = fork.options[Math.floor(Math.random() * fork.options.length)];
        return { ...ex, [opt.id]: (ex[opt.id] || 0) + 1 + Math.floor(Math.random() * 4) };
      });
    }, 1100);
    return () => clearInterval(id);
  }, [fork]);
  const liveVotes = (o) => (o.votes || 0) + (liveExtra[o.id] || 0);
  const total = fork.options.reduce((s, o) => s + liveVotes(o), 0);
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      background: "rgba(0,0,0,.86)", backdropFilter: "blur(10px)",
      display: "flex", flexDirection: "column",
      animation: "v4FadeIn .3s ease-out",
    }}>
      <div style={{
        padding: "22px 28px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor,
            letterSpacing: ".16em", fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
          }}>{fork.actLabel} · FORK {fork.actNum} · {fork.question}</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-head)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em",
          }}>{fork.heading}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)", letterSpacing: ".16em" }}>VOTE CLOSES</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-head)", fontWeight: 500, lineHeight: 1,
            color: countdown < 15 ? "var(--c-blood-l)" : tree.accentColor,
            fontVariantNumeric: "tabular-nums",
          }}>0:{String(countdown).padStart(2, "0")}</div>
        </div>
      </div>
      <div style={{ padding: "0 28px 18px" }}>
        <div style={{
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.7)", lineHeight: 1.5, maxWidth: 720,
        }}>"{fork.setup}"</div>
      </div>
      <div className="m-stack m-pad" style={{ flex: 1, padding: "0 28px 28px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14 }}>
        {fork.options.map(opt => {
          const share = liveVotes(opt) / total;
          return (
            <button key={opt.id} onClick={() => onPick(opt.id)} style={{
              position: "relative",
              background: `linear-gradient(135deg, ${opt.color}30, rgba(8,8,10,.85) 70%)`,
              border: `2px solid ${opt.color}`,
              borderRadius: "var(--r-2)", padding: "26px 26px 22px",
              cursor: "pointer", color: "inherit", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 12, justifyContent: "space-between",
              transition: "transform .14s, box-shadow .14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 18px 44px ${opt.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-display)", color: opt.color, fontWeight: 500, lineHeight: 1, marginBottom: 12,
                }}>{opt.glyph}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-head)", color: tkc("white"), fontWeight: 500, lineHeight: 1,
                  letterSpacing: "-0.02em", marginBottom: 8,
                }}>{opt.title}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.78)", lineHeight: 1.4,
                }}>"{opt.beat}"</div>
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  color: "rgba(255,255,255,.55)", textTransform: "uppercase", marginBottom: 6,
                }}>{opt.tone}</div>
                <div style={{ height: 4, background: "rgba(255,255,255,.15)", borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: `${share * 100}%`, height: "100%", background: opt.color, borderRadius: "var(--r-1)", transition: "width .6s ease" }}/>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
                  <span style={{ color: opt.color, fontWeight: 600 }}>{PCT(share)} · {liveVotes(opt).toLocaleString()} votes</span>
                  <span style={{ color: "rgba(255,255,255,.5)" }}>{opt.leading ? "LEADING" : ""}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <style>{`@keyframes v4FadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

function ResultPreviewInline({ tree, fork, pickedId, auto, onSkip }) {
  const [progress, setProgress] = usV(0);
  ueV(() => {
    const startedAt = Date.now();
    let raf;
    const tick = () => {
      const p = Math.min(100, ((Date.now() - startedAt) / 3600) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sorted = [...fork.options].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((s, o) => s + o.votes, 0);
  const winner = sorted[0];
  const userPicked = fork.options.find(o => o.id === pickedId);
  const userMatchedWinner = winner.id === pickedId;

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 12,
      background: "rgba(0,0,0,.92)", backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column",
      animation: "v4FadeIn .4s ease-out",
    }}>
      <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              padding: "3px 10px", background: "var(--c-amber)", color: "var(--c-on-amber)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
              letterSpacing: ".16em", borderRadius: "var(--r-1)", textTransform: "uppercase",
            }}>VOTE CLOSED</span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>{fork.actLabel} · FORK {fork.actNum} · {totalVotes.toLocaleString()} VOTES</span>
          </div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-head)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "rgba(255,255,255,.7)",
          }}>The room chose…</div>
        </div>
        <button onClick={onSkip} style={{
          padding: "8px 14px", background: "transparent", color: "rgba(255,255,255,.7)",
          border: "1px solid rgba(255,255,255,.25)", borderRadius: "var(--r-1)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 600, textTransform: "uppercase",
        }}>Skip ahead →</button>
      </div>
      <div style={{ padding: "12px 28px 22px", display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{
          width: 120, height: 120, flexShrink: 0,
          background: `linear-gradient(135deg, ${winner.color}60, ${tkc("void")} 75%)`,
          border: `2px solid ${winner.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-display)",
          color: winner.color, fontWeight: 500, lineHeight: 1,
          boxShadow: `0 0 32px ${winner.color}50`,
        }}>{winner.glyph}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: winner.color,
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 6,
          }}>CANONICAL CUT · {PCT(winner.votes / totalVotes)}</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-display)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em",
            color: tkc("white"), marginBottom: 8, textWrap: "balance",
          }}>{winner.title}</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.4, color: "rgba(255,255,255,.7)", maxWidth: 720,
          }}>"{winner.beat}"</div>
        </div>
      </div>
      <div style={{ padding: "12px 28px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((opt, i) => {
          const share = opt.votes / totalVotes;
          const isWinner = i === 0;
          const isYours = opt.id === pickedId;
          return (
            <div key={opt.id} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", alignItems: "center", gap: 14 }}>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: opt.color, textAlign: "center" }}>{opt.glyph}</div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-lead)", color: isWinner ? tkc("white") : "rgba(255,255,255,.65)",
                    fontWeight: isWinner ? 500 : 400,
                  }}>{opt.title}</span>
                  {isWinner && (
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: opt.color,
                      letterSpacing: ".16em", fontWeight: 700, padding: "1px 6px",
                      border: `1px solid ${opt.color}55`, borderRadius: "var(--r-1)",
                    }}>CANONICAL</span>
                  )}
                  {isYours && !isWinner && (
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: opt.color,
                      letterSpacing: ".16em", fontWeight: 700, padding: "1px 6px",
                      border: `1px solid ${opt.color}55`, borderRadius: "var(--r-1)",
                    }}>YOUR PICK · SAVED</span>
                  )}
                  {isYours && isWinner && (
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-good)",
                      letterSpacing: ".16em", fontWeight: 700, padding: "1px 6px",
                      border: "1px solid var(--c-good)", borderRadius: "var(--r-1)",
                    }}>WITH THE ROOM</span>
                  )}
                </div>
                <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${share * 100}%`, background: opt.color, borderRadius: "var(--r-1)" }}/>
                </div>
              </div>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700,
                color: isWinner ? tkc("white") : "rgba(255,255,255,.55)",
                letterSpacing: ".08em", textAlign: "right", minWidth: 80,
              }}>{PCT(share)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", padding: "0 28px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,.1)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: tree.accentColor, transition: "width .1s linear" }}/>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", letterSpacing: ".16em", textTransform: "uppercase" }}>
            {auto ? "Room consensus · resuming" : "Continuing"} · {Math.max(0, Math.ceil((100 - progress) * 0.036))}s
          </span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════

function BranchedMarketV4() {
  const films = (window.listBranchedFilms ? window.listBranchedFilms() : []);
  const [now, setNow] = usV(Date.now());
  const [filter, setFilter] = usV("all"); // all | live | preshow | holders
  ueV(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const filmsWithETA = umV(() => films.map(f => {
    const seed = (f.filmId.charCodeAt(0) + f.filmId.length * 7) % 240;
    const cycleSec = 180 + seed;
    const inCycle = Math.floor(now / 1000) % cycleSec;
    const remaining = cycleSec - inCycle;
    const inForkWindow = remaining < 30;
    const leading = f.forks[Math.floor((now / 1000 / cycleSec)) % f.forks.length];
    const leadingOpt = leading.options.find(o => o.leading) || leading.options[0];
    return { ...f, nextForkInSec: remaining, inForkWindow, leadingFork: leading, leadingOpt };
  }), [films, now]);

  const filtered = filmsWithETA.filter(f => {
    if (filter === "all") return true;
    if (filter === "live") return !f.inForkWindow;
    if (filter === "preshow") return f.inForkWindow;
    if (filter === "holders") return f.roomSize > 1000;
    return true;
  });

  const totalWatching = filmsWithETA.reduce((s, f) => s + f.roomSize, 0);

  return (
    <div style={{ background: "var(--c-bg)", color: "var(--c-ink)", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        padding: "30px var(--gutter) 32px", borderBottom: "1px solid var(--c-line)",
        background: "radial-gradient(ellipse at 20% 0%, rgba(var(--accent-rgb),.06), transparent 70%), var(--c-bg)",
      }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}>
          {/* Section switcher — unifies Films · Series · Branched */}
          <div style={{ display: "flex", marginBottom: 22 }}>
            <div style={{ display: "flex", gap: 2, padding: 3, background: "rgba(8,8,10,.55)", border: "1px solid var(--c-line-2)", borderRadius: 999 }}>
              {[["film", "Films"], ["series", "Series"], ["__b", "Branched"]].map(([k, l]) => {
                const active = k === "__b";
                return (
                  <button key={k} onClick={() => navigate(k === "__b" ? "/branches" : `/genre/${k}`)} style={{
                    padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                    background: active ? "var(--c-amber)" : "transparent",
                    color: active ? tkc("on-amber") : "var(--c-ink-3)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  }}>{l}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 8px var(--c-blood-l)", animation: "v4Blink 1.4s infinite" }}/>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: "var(--c-blood-l)", fontWeight: 700, textTransform: "uppercase",
            }}>BRANCHED CINEMA · {totalWatching.toLocaleString()} WATCHING NOW</span>
          </div>
          <h1 style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontWeight: 400, fontSize: "var(--fs-display)", lineHeight: 0.96,
            margin: 0, letterSpacing: "-0.02em", maxWidth: 980, textWrap: "balance",
          }}>
            Pick a room. <em style={{ color: "var(--c-amber)" }}>Watch together.</em><br/>
            Vote at every fork.
          </h1>
          <p style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.5,
            color: "var(--c-ink-2)", maxWidth: 660, margin: "20px 0 0",
          }}>
            Every Branched film plays continuously. Drop in any time — at the next fork, the room votes; the leading branch becomes canonical. Your picks save as a personal cut.
          </p>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 28, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { id: "all",     label: "All rooms",        n: filmsWithETA.length },
              { id: "live",    label: "Playing now",       n: filmsWithETA.filter(f => !f.inForkWindow).length },
              { id: "preshow", label: "Fork imminent",     n: filmsWithETA.filter(f => f.inForkWindow).length },
              { id: "holders", label: "Holder rooms",      n: filmsWithETA.filter(f => f.roomSize > 1000).length },
            ].map(c => {
              const active = filter === c.id;
              return (
                <button key={c.id} onClick={() => setFilter(c.id)} style={{
                  padding: "8px 14px",
                  background: active ? "var(--c-amber)" : "transparent",
                  color: active ? tkc("on-amber") : "var(--c-ink-2)",
                  border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  borderRadius: 999, cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>{c.label}</span>
                  <span style={{ opacity: 0.7 }}>{c.n}</span>
                </button>
              );
            })}
            <span style={{ flex: 1 }}/>
            <button onClick={() => { window.location.href = "Cina.html"; }} title="Branched films are authored in Studio — Graph + Script, one film" style={{
              padding: "8px 16px 8px 12px",
              background: "transparent",
              color:  "var(--c-amber)",
              border: "1px dashed var(--c-amber)",
              borderRadius: "var(--r-2)", cursor: "pointer",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⊕</span>
              Make one in Studio →
            </button>
          </div>
        </div>
      </section>

      {/* Rooms grid */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "36px var(--gutter) 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.01em" }}>
            {filter === "all" ? "Now showing" : filter === "live" ? "Playing now" : filter === "preshow" ? "Vote imminent" : "Holder rooms"}
          </h2>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
            {filtered.length} {filtered.length === 1 ? "ROOM" : "ROOMS"} · LIVE
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 18 }}>
          {filtered.map(f => <RoomCardV4 key={f.filmId} film={f}/>)}
        </div>
      </section>

      {/* Your cuts library */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "36px var(--gutter) 28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              YOUR CUTS · LIBRARY
            </div>
            <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.01em" }}>
              {YOUR_CUTS_LIBRARY.length} cuts you've made.
            </h2>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
            {YOUR_CUTS_LIBRARY.reduce((s, c) => s + c.matchedRoom, 0)} / {YOUR_CUTS_LIBRARY.reduce((s, c) => s + c.of, 0)} ROOM MATCHES
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
          {YOUR_CUTS_LIBRARY.map((c, i) => (
            <button key={i} onClick={() => navigate(`/branches/${c.filmId}`)} style={{
              padding: 18, textAlign: "left",
              background: "var(--c-panel)",
              border: "1px solid var(--c-line)", borderLeft: `2px solid ${c.accent}`,
              borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
              display: "flex", flexDirection: "column", gap: 12,
              transition: "border-color .15s, transform .14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderLeftColor = c.accent; }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.01em" }}>{c.filmTitle}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>
                    {c.director} · COMPLETED {c.completedAt}
                  </div>
                </div>
                <div style={{
                  padding: "3px 8px", background: `${c.accent}14`, color: c.accent,
                  border: `1px solid ${c.accent}55`, borderRadius: "var(--r-1)",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  fontWeight: 700, textTransform: "uppercase", flexShrink: 0,
                }}>{c.matchedRoom}/{c.of} ROOM</div>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {c.glyphs.map((g, gi) => (
                  <React.Fragment key={gi}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "var(--r-1)",
                      background: `linear-gradient(135deg, ${c.accent}50, ${tkc("void")})`,
                      border: `1px solid ${c.accent}88`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--f-display)", fontStyle: "italic",
                      fontSize: "var(--fs-body)", color: c.accent, fontWeight: 500,
                    }}>{g}</div>
                    {gi < c.glyphs.length - 1 && <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-4)", fontSize: "var(--fs-label)" }}>→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
                {c.titles.join(" → ")}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "36px var(--gutter) 80px" }}>
        <div style={{
          padding: 32, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderLeft: "2px solid var(--c-amber)",
          borderRadius: "var(--r-2)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 600 }}>HOW IT WORKS</span>
            <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em" }}>The room shapes the cut.</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[
              { n: "01", h: "Drop in", b: "Films play continuously. Click in at the current scene." },
              { n: "02", h: "Vote at forks", b: "Four moments per film. Pick your branch. Holders count 5×." },
              { n: "03", h: "Room cuts canonical", b: "The leading branch becomes the version the next room sees." },
              { n: "04", h: "Your cut, saved", b: "Your unique 4-fork sequence stays in your library forever." },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: 10 }}>
                <span style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                  fontWeight: 700, letterSpacing: ".16em", flexShrink: 0, paddingTop: 2,
                }}>{s.n}</span>
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 }}>{s.h}</div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 4 }}>{s.b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function RoomCardV4({ film }) {
  const m = Math.floor(film.nextForkInSec / 60);
  const s = film.nextForkInSec % 60;
  const LiveScene = window.BranchedLiveScene;
  return (
    <button onClick={() => navigate(`/branches/${film.filmId}`)} style={{
      position: "relative", borderRadius: "var(--r-2)", overflow: "hidden",
      border: "1px solid var(--c-line)",
      background: "var(--c-panel)", color: "inherit",
      padding: 0, cursor: "pointer", textAlign: "left",
      display: "flex", flexDirection: "column",
      transition: "border-color .15s, transform .2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = film.accentColor; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "var(--c-void)" }}>
        {LiveScene && <LiveScene tree={film} elapsedSec={Math.floor(Date.now() / 1000)} paused={false}/>}
        {film.inForkWindow && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            padding: "5px 12px",
            background: "var(--c-blood-l)", color: tkc("white"),
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            fontWeight: 700, textTransform: "uppercase", borderRadius: "var(--r-1)",
            animation: "v4Blink 1s infinite",
          }}>FORK IN {s}S · VOTE NOW</div>
        )}
        {!film.inForkWindow && (
          <div style={{
            position: "absolute", top: 12, left: 12,
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", background: "rgba(201,85,72,.18)",
            border: "1px solid rgba(201,85,72,.5)", borderRadius: "var(--r-1)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 4px var(--c-blood-l)", animation: "v4Blink 1.4s infinite" }}/>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>LIVE</span>
          </div>
        )}
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "4px 8px", background: "rgba(0,0,0,.65)",
          border: "1px solid rgba(255,255,255,.12)", borderRadius: "var(--r-1)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"),
          letterSpacing: ".16em",
        }}>{film.roomSize.toLocaleString()} watching</div>
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "14px 16px",
          background: "linear-gradient(180deg, transparent, rgba(8,8,10,.95))",
          color: tkc("white"),
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor,
                letterSpacing: ".16em", fontWeight: 700, marginBottom: 4,
              }}>{film.inForkWindow ? "FORK IN" : "NEXT FORK"}</div>
              <div style={{
                fontFamily: "var(--f-display)", fontStyle: "italic",
                fontSize: "var(--fs-head)", color: tkc("white"), fontWeight: 500, lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}>{m}:{String(s).padStart(2, "0")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)", letterSpacing: ".16em" }}>LEADING</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: film.leadingOpt.color, fontSize: "var(--fs-lead)", fontWeight: 500 }}>{film.leadingOpt.glyph}</span>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white") }}>{film.leadingOpt.title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{film.title}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase" }}>
              {film.director} · {film.totalRuntimeMin}M · {film.totalCuts} CUTS
            </div>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>★ {film.rating}</span>
        </div>
        <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>{film.lobbyBlurb}</p>
        <div style={{
          padding: "14px 16px",
          background: film.accentColor, color: "var(--c-void)",
          borderRadius: "var(--r-2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
          boxShadow: `0 6px 22px ${film.accentColor}55`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "rgba(8,8,10,.16)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--fs-body)",
            }}>▶</span>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>JOIN THE ROOM</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.72, letterSpacing: ".16em", marginTop: 3, textTransform: "uppercase" }}>
                <span style={{ width: 5, height: 5, borderRadius: "var(--r-1)", background: "var(--c-void)", animation: "v4Blink 1.4s infinite" }}/>
                WATCHING LIVE · {film.roomSize.toLocaleString()} HOLDERS
              </div>
            </div>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700, letterSpacing: ".16em", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>WATCH →</span>
        </div>
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════

const COMPOSER_DEFAULT = () => ({
  title: "Untitled Branched Film",
  director: "Your Name",
  directorInitials: "YN",
  accentColor: tkc("amber"),
  totalRuntimeMin: 96,
  totalCuts: 81,
  blurb: "A one-sentence pitch your audience will see in the lobby.",
  forks: [
    { actLabel: "ACT I", actNum: "01", atMinute: 12, heading: "She finds the booth.",
      setup: "Esme arrives at the abandoned transmitter at the top of the hill.",
      question: "What does she do?",
      options: [
        { glyph: "□", title: "Walk away",         beat: "She kills the lights and shuts the door.", tone: "near-silent · 4m", color: tkc("ink-3") },
        { glyph: "◆", title: "Sit at the console", beat: "She lowers the headphones and answers.",    tone: "score-forward · 7m", color: "var(--c-amber)" },
        { glyph: "△", title: "Run tape",          beat: "She loads a reel and captures the signal.", tone: "tape hiss · 5m",     color: tkc("cat-1") },
      ],
    },
    { actLabel: "ACT II", actNum: "02", atMinute: 38, heading: "The voice asks for a name.",
      setup: "Three weeks into the broadcast. The voice wants someone in particular.",
      question: "What name does she give?",
      options: [
        { glyph: "●", title: "Her own",       beat: "She speaks her name into the dark.",         tone: "intimate · 6m",  color: "var(--c-amber)" },
        { glyph: "■", title: "Her sister's",  beat: "She names the dead, hoping for a reply.",    tone: "elegiac · 8m",   color: tkc("bad") },
        { glyph: "▲", title: "A stranger's",  beat: "She invents a person who never existed.",    tone: "uncanny · 7m",   color: tkc("cat-2") },
      ],
    },
    { actLabel: "ACT III", actNum: "03", atMinute: 65, heading: "Someone is at the door.",
      setup: "A car climbs the access road at 3am.",
      question: "Who is it?",
      options: [
        { glyph: "▣", title: "Her father",   beat: "Nine years apart. He taught her radios.", tone: "wide-shot · 10m", color: tkc("cat-4") },
        { glyph: "◉", title: "A patrolman",  beat: "Procedural. Someone reported the booth.",   tone: "deadpan · 6m",    color: tkc("ink-3") },
        { glyph: "❍", title: "Herself",      beat: "Same coat. Same face.",                     tone: "long-take · 11m", color: "var(--c-amber)" },
      ],
    },
    { actLabel: "FINALE", actNum: "04", atMinute: 88, heading: "The choice.",
      setup: "One more transmission. Static, signal, or silence.",
      question: "How does it end?",
      options: [
        { glyph: "■", title: "Static",  beat: "She pulls the breaker.",      tone: "ambient · score-out",  color: tkc("cat-1") },
        { glyph: "▲", title: "Signal",  beat: "She speaks into the mic.",    tone: "score-forward",         color: "var(--c-amber)" },
        { glyph: "●", title: "Silence", beat: "She puts the headphones on.", tone: "near-silent",           color: tkc("cat-2") },
      ],
    },
  ],
  schedule: {
    premiereAt: "Fri Jun 14 · 9:00pm ET",
    roomSize: "Holders + public",
    voteWindow: 60,
  },
});

function BranchedComposer() {
  const [film, setFilm] = usV(COMPOSER_DEFAULT);
  const [activeForkIdx, setActiveForkIdx] = usV(0);
  const [activeOptIdx, setActiveOptIdx] = usV(null);
  const [step, setStep] = usV("tree"); // tree | timeline | launch
  const [launched, setLaunched] = usV(false);

  const fork = film.forks[activeForkIdx];
  const opt = activeOptIdx != null ? fork.options[activeOptIdx] : null;

  const updateFilm = (patch) => setFilm(f => ({ ...f, ...patch }));
  const updateFork = (patch) => setFilm(f => ({
    ...f, forks: f.forks.map((g, i) => i === activeForkIdx ? { ...g, ...patch } : g),
  }));
  const updateOpt = (patch) => setFilm(f => ({
    ...f, forks: f.forks.map((g, i) => i === activeForkIdx ? {
      ...g, options: g.options.map((o, j) => j === activeOptIdx ? { ...o, ...patch } : o),
    } : g),
  }));

  const launch = () => {
    setLaunched(true);
    if (window.toast) window.toast({
      title: "ROOM SCHEDULED",
      text: `${film.title} · ${film.schedule.premiereAt}`,
      kind: "good",
    });
  };

  return (
    <div style={{ background: "var(--c-bg)", color: "var(--c-ink)", minHeight: "100vh" }}>
      {/* Header */}
      <section style={{
        padding: "32px var(--gutter) 22px", borderBottom: "1px solid var(--c-line)",
      }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", display: "flex", alignItems: "flex-end", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <a href="#/branches" onClick={(e) => { e.preventDefault(); navigate("/branches"); }} style={{
                color: "var(--c-ink-3)", textDecoration: "none",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
              }}>← Branched lobby</a>
              <span style={{ color: "var(--c-ink-4)" }}>/</span>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700,
              }}>COMPOSE A BRANCHED FILM</span>
            </div>
            <input
              value={film.title}
              onChange={e => updateFilm({ title: e.target.value })}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic",
                fontWeight: 400, fontSize: "var(--fs-display)", lineHeight: 1, letterSpacing: "-0.02em",
                padding: 0, marginBottom: 6,
              }}
            />
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
              letterSpacing: ".16em", textTransform: "uppercase",
            }}>
              <input
                value={film.director}
                onChange={e => updateFilm({ director: e.target.value, directorInitials: e.target.value.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() })}
                style={{ background: "transparent", border: "none", outline: "none", color: "var(--c-ink-2)", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit" }}
              />
              <span>·</span>
              <span>{film.totalRuntimeMin}M · {film.forks.length} FORKS · {film.totalCuts} CUTS</span>
              <span>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                ACCENT
                <input
                  type="color"
                  value={film.accentColor}
                  onChange={e => updateFilm({ accentColor: e.target.value })}
                  style={{ width: 22, height: 22, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
                />
              </span>
            </div>
          </div>

          {/* Step buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["tree", "01 Tree"], ["timeline", "02 Timeline"], ["launch", "03 Launch"]].map(([k, l]) => (
              <button key={k} onClick={() => setStep(k)} style={{
                padding: "8px 14px",
                background: step === k ? "var(--c-amber)" : "transparent",
                color: step === k ? tkc("on-amber") : "var(--c-ink-2)",
                border: `1px solid ${step === k ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px var(--gutter) 80px" }}>
        {step === "tree" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 22, alignItems: "flex-start" }}>
            {/* Tree editor */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Forks row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {film.forks.map((f, i) => {
                  const isActive = i === activeForkIdx;
                  return (
                    <button key={i} onClick={() => { setActiveForkIdx(i); setActiveOptIdx(null); }} style={{
                      padding: 14, textAlign: "left",
                      background: isActive ? `${film.accentColor}14` : "var(--c-panel)",
                      border: `1px solid ${isActive ? film.accentColor : "var(--c-line)"}`,
                      borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
                      display: "flex", flexDirection: "column", gap: 6,
                    }}>
                      <div style={{
                        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: isActive ? film.accentColor : "var(--c-ink-3)",
                        letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                      }}>{f.actLabel} · {f.atMinute}M</div>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.15, color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{f.heading}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {f.options.map((o, oi) => (
                          <span key={oi} title={o.title} style={{
                            width: 22, height: 22, borderRadius: "var(--r-1)",
                            background: `${o.color}33`, border: `1px solid ${o.color}88`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--f-display)", fontStyle: "italic",
                            fontSize: "var(--fs-label)", color: o.color, fontWeight: 500,
                          }}>{o.glyph}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active fork editor */}
              <div style={{
                padding: 22, background: "var(--c-panel)",
                border: `1px solid ${film.accentColor}55`, borderRadius: "var(--r-2)",
              }}>
                <div style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  marginBottom: 14,
                }}>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor,
                    letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  }}>EDITING · {fork.actLabel} · FORK {fork.actNum}</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                    letterSpacing: ".16em", textTransform: "uppercase",
                  }}>
                    AT MINUTE
                    <input type="number" value={fork.atMinute} min={1} max={film.totalRuntimeMin - 1}
                      onChange={e => updateFork({ atMinute: parseInt(e.target.value) || 0 })}
                      style={{
                        width: 64, padding: "5px 8px",
                        background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                        color: "var(--c-ink)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                        borderRadius: "var(--r-1)",
                      }}/>
                  </div>
                </div>

                <Field4 label="Scene heading">
                  <input value={fork.heading} onChange={e => updateFork({ heading: e.target.value })}
                    style={composerHeadlineInp}/>
                </Field4>
                <Field4 label="Setup · what the room sees just before the vote">
                  <textarea value={fork.setup} onChange={e => updateFork({ setup: e.target.value })}
                    rows={2} style={{ ...composerInp, resize: "vertical" }}/>
                </Field4>
                <Field4 label="The question on screen">
                  <input value={fork.question} onChange={e => updateFork({ question: e.target.value })}
                    style={composerInp}/>
                </Field4>

                {/* Options */}
                <div style={{ marginTop: 14 }}>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                    letterSpacing: ".16em", fontWeight: 600, marginBottom: 8, textTransform: "uppercase",
                  }}>THE BRANCHES · {fork.options.length}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {fork.options.map((o, oi) => {
                      const isActive = oi === activeOptIdx;
                      return (
                        <button key={oi} onClick={() => setActiveOptIdx(oi)} style={{
                          padding: 14, textAlign: "left",
                          background: isActive
                            ? `linear-gradient(135deg, ${o.color}30, var(--c-panel) 70%)`
                            : "var(--c-bg)",
                          border: `1.5px solid ${isActive ? o.color : "var(--c-line)"}`,
                          borderRadius: "var(--r-2)", cursor: "pointer", color: "inherit",
                          display: "flex", flexDirection: "column", gap: 6,
                        }}>
                          <div style={{
                            fontFamily: "var(--f-display)", fontStyle: "italic",
                            fontSize: "var(--fs-head)", color: o.color, lineHeight: 1, marginBottom: 2,
                          }}>{o.glyph}</div>
                          <div style={{
                            fontFamily: "var(--f-display)", fontStyle: "italic",
                            fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500,
                            lineHeight: 1.1, letterSpacing: "-0.01em",
                          }}>{o.title}</div>
                          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>{o.beat}</div>
                          <div style={{
                            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: o.color,
                            letterSpacing: ".16em", marginTop: 2, textTransform: "uppercase",
                          }}>{o.tone}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inline option editor */}
              {opt && (
                <div style={{
                  padding: 18, background: "var(--c-panel)",
                  border: `1px solid ${opt.color}66`, borderRadius: "var(--r-2)",
                  display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "flex-start",
                }}>
                  <div style={{
                    aspectRatio: "1/1",
                    background: `linear-gradient(135deg, ${opt.color}40, ${tkc("void")})`,
                    border: `1.5px solid ${opt.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-display)", color: opt.color, fontWeight: 500, lineHeight: 1,
                  }}>{opt.glyph}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 8 }}>
                      <Field4 label="Glyph">
                        <input value={opt.glyph} onChange={e => updateOpt({ glyph: e.target.value })}
                          style={{ ...composerInp, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", textAlign: "center" }}/>
                      </Field4>
                      <Field4 label="Title">
                        <input value={opt.title} onChange={e => updateOpt({ title: e.target.value })}
                          style={composerInp}/>
                      </Field4>
                      <Field4 label="Color">
                        <div style={{ display: "flex", gap: 6, alignItems: "center", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: 5 }}>
                          <input type="color" value={opt.color} onChange={e => updateOpt({ color: e.target.value })}
                            style={{ width: 26, height: 26, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}/>
                          <input value={opt.color} onChange={e => updateOpt({ color: e.target.value })}
                            style={{ ...composerInp, border: "none", padding: 0, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}/>
                        </div>
                      </Field4>
                    </div>
                    <Field4 label="Beat · the one-line that plays on the choice card">
                      <input value={opt.beat} onChange={e => updateOpt({ beat: e.target.value })}
                        style={composerInp}/>
                    </Field4>
                    <Field4 label="Tone & runtime (e.g. 'long-take · 10m')">
                      <input value={opt.tone} onChange={e => updateOpt({ tone: e.target.value })}
                        style={composerInp}/>
                    </Field4>
                  </div>
                </div>
              )}
            </div>

            {/* Live lobby card preview */}
            <aside style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase", marginBottom: 4,
              }}>LIVE LOBBY PREVIEW</div>
              <div style={{
                borderRadius: "var(--r-2)", overflow: "hidden",
                border: `1px solid ${film.accentColor}55`,
              }}>
                <div style={{
                  position: "relative", aspectRatio: "16/9",
                  background: `linear-gradient(135deg, ${film.accentColor}33, ${tkc("void")} 80%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-display)", fontWeight: 400, color: tkc("ink"),
                    letterSpacing: "-0.02em", textShadow: `0 0 30px ${film.accentColor}80`,
                  }}>{film.title.split(" ")[0]}.</span>
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    padding: "4px 10px",
                    background: "rgba(201,85,72,.18)", border: "1px solid rgba(201,85,72,.5)",
                    borderRadius: "var(--r-1)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-blood-l)",
                    letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  }}>● PREVIEW</div>
                </div>
                <div style={{ padding: 16, background: "var(--c-panel)" }}>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em" }}>{film.title}</div>
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                    letterSpacing: ".16em", marginTop: 4, textTransform: "uppercase",
                  }}>{film.director} · {film.totalRuntimeMin}M · {film.totalCuts} CUTS</div>
                  <textarea value={film.blurb}
                    onChange={e => updateFilm({ blurb: e.target.value })}
                    rows={3} style={{
                      width: "100%", marginTop: 12,
                      background: "transparent", border: "none",
                      color: "var(--c-ink-2)", fontFamily: "var(--f-sans)",
                      fontSize: "var(--fs-body)", lineHeight: 1.5, outline: "none", resize: "vertical", padding: 0,
                    }}/>
                </div>
              </div>

              <div style={{
                padding: 14,
                background: "var(--c-panel)", border: "1px solid var(--c-line)",
                borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5,
              }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
                  letterSpacing: ".16em", fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
                }}>3 OPTIONS PER FORK</div>
                More than three branches stretches the room thin. Three is the sweet spot — two feels false, four dilutes.
              </div>

              <button onClick={() => setStep("timeline")} style={{
                padding: "12px 16px", background: film.accentColor, color: "var(--c-void)",
                border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                fontWeight: 700, textTransform: "uppercase",
              }}>02 Place forks on timeline →</button>
            </aside>
          </div>
        )}

        {step === "timeline" && (
          <ComposerTimeline film={film} updateFork={(i, patch) => setFilm(f => ({ ...f, forks: f.forks.map((g, j) => i === j ? { ...g, ...patch } : g) }))} updateFilm={updateFilm} onNext={() => setStep("launch")}/>
        )}

        {step === "launch" && (
          <ComposerLaunch
            film={film}
            updateSchedule={(patch) => setFilm(f => ({ ...f, schedule: { ...f.schedule, ...patch } }))}
            onLaunch={launch}
            launched={launched}
          />
        )}
      </section>
    </div>
  );
}

function ComposerTimeline({ film, updateFork, updateFilm, onNext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{
        padding: 22, background: "var(--c-panel)",
        border: `1px solid ${film.accentColor}55`, borderRadius: "var(--r-2)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor,
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
          }}>STEP 02 · TIMELINE</span>
          <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, letterSpacing: "-0.01em" }}>Place each fork on the runtime.</h2>
          <span style={{ flex: 1 }}/>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
            TOTAL {film.totalRuntimeMin}M
          </span>
          <input type="number" value={film.totalRuntimeMin}
            onChange={e => updateFilm({ totalRuntimeMin: parseInt(e.target.value) || 60 })}
            style={{
              width: 72, padding: "5px 8px",
              background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
              color: "var(--c-ink)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              borderRadius: "var(--r-1)",
            }}/>
        </div>

        {/* Big timeline */}
        <div style={{ position: "relative", height: 120, marginBottom: 14 }}>
          <div style={{
            position: "absolute", left: 0, right: 0, top: 56, height: 4,
            background: "var(--c-line-2)", borderRadius: "var(--r-1)",
          }}/>
          {/* Minute ticks every 10m */}
          {Array.from({ length: Math.floor(film.totalRuntimeMin / 10) + 1 }).map((_, i) => {
            const min = i * 10;
            const pct = (min / film.totalRuntimeMin) * 100;
            return (
              <div key={i} style={{
                position: "absolute", left: `${pct}%`, top: 64, height: 8, width: 1,
                background: "var(--c-line-3)",
              }}>
                <div style={{
                  position: "absolute", top: 12, left: -16, width: 32, textAlign: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)",
                  letterSpacing: ".16em",
                }}>{min}M</div>
              </div>
            );
          })}
          {film.forks.map((f, i) => {
            const pct = (f.atMinute / film.totalRuntimeMin) * 100;
            return (
              <div key={i} style={{
                position: "absolute", left: `${pct}%`, top: 32, marginLeft: -12,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: film.accentColor, color: "var(--c-void)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                  border: `2px solid ${tkc("white")}`,
                  boxShadow: `0 0 12px ${film.accentColor}aa`,
                }}>{f.actNum}</div>
                <div style={{
                  position: "absolute", top: 28, left: -60, width: 120, textAlign: "center",
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}>{f.heading}</div>
              </div>
            );
          })}
        </div>

        {/* Sliders */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {film.forks.map((f, i) => (
            <div key={i} style={{
              padding: 12, background: "var(--c-bg)",
              border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
            }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor,
                letterSpacing: ".16em", fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
              }}>{f.actLabel}</div>
              <input
                type="range" min={1} max={film.totalRuntimeMin - 1} value={f.atMinute}
                onChange={e => updateFork(i, { atMinute: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: film.accentColor }}
              />
              <div style={{
                display: "flex", justifyContent: "space-between", marginTop: 4,
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                letterSpacing: ".16em",
              }}>
                <span>AT {f.atMinute}M</span>
                <span>{Math.round((f.atMinute / film.totalRuntimeMin) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onNext} style={{
          padding: "12px 18px", background: film.accentColor, color: "var(--c-void)",
          border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
        }}>03 Launch room →</button>
      </div>
    </div>
  );
}

function ComposerLaunch({ film, updateSchedule, onLaunch, launched }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 22, alignItems: "flex-start" }}>
      <div style={{
        padding: 28, background: "var(--c-panel)",
        border: `1px solid ${film.accentColor}55`, borderRadius: "var(--r-2)",
      }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor,
          letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 8,
        }}>STEP 03 · LAUNCH ROOM</div>
        <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 6 }}>
          Schedule the premiere. The room opens at that hour and never closes.
        </h2>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: "8px 0 22px", maxWidth: 600 }}>
          From here, the film plays continuously. New viewers drop into the current scene; each fork holds a {film.schedule.voteWindow}s vote window; the room's leading branch becomes canonical.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field4 label="Premiere at">
            <input value={film.schedule.premiereAt} onChange={e => updateSchedule({ premiereAt: e.target.value })}
              style={composerInp}/>
          </Field4>
          <Field4 label="Room access">
            <select value={film.schedule.roomSize} onChange={e => updateSchedule({ roomSize: e.target.value })}
              style={composerInp}>
              <option>Holders + public</option>
              <option>Holders only · early</option>
              <option>Private · invite-only premiere</option>
            </select>
          </Field4>
          <Field4 label={`Vote window per fork (sec) · current ${film.schedule.voteWindow}s`}>
            <input type="range" min={20} max={180} step={5} value={film.schedule.voteWindow}
              onChange={e => updateSchedule({ voteWindow: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: film.accentColor }}/>
          </Field4>
          <Field4 label="Total possible cuts">
            <input type="number" value={film.totalCuts} disabled
              style={{ ...composerInp, opacity: 0.6 }}/>
          </Field4>
        </div>

        <div style={{ marginTop: 28, padding: 18,
          background: "var(--c-bg)", border: `1px solid ${film.accentColor}33`, borderRadius: "var(--r-2)",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
            letterSpacing: ".16em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase",
          }}>READY TO SHIP CHECKLIST</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { ok: !!film.title && film.title !== "Untitled Branched Film", label: "Film title set" },
              { ok: film.forks.every(f => f.heading), label: "All 4 forks have headings" },
              { ok: film.forks.every(f => f.options.every(o => o.title && o.beat)), label: "All 12 options have title + beat" },
              { ok: film.forks.every((f, i, arr) => i === 0 || f.atMinute > arr[i - 1].atMinute), label: "Forks are in chronological order" },
              { ok: !!film.schedule.premiereAt, label: "Premiere scheduled" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: "var(--r-2)",
                  background: c.ok ? "var(--c-good)" : "rgba(255,255,255,.08)",
                  border: `1px solid ${c.ok ? "var(--c-good)" : "var(--c-line-2)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--fs-label)", color: "var(--c-void)", fontWeight: 700,
                }}>{c.ok ? "✓" : ""}</span>
                <span style={{ fontSize: "var(--fs-body)", color: c.ok ? "var(--c-ink)" : "var(--c-ink-3)" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onLaunch} disabled={launched} style={{
          marginTop: 22, padding: "14px 22px",
          background: launched ? "var(--c-good)" : film.accentColor,
          color: "var(--c-void)",
          border: "none", borderRadius: "var(--r-2)",
          cursor: launched ? "default" : "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em",
          fontWeight: 700, textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {launched ? "✓ Room scheduled" : "▲ Schedule premiere"}
        </button>
      </div>

      {/* Summary card */}
      <aside style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          padding: 18, background: "var(--c-panel)",
          border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor,
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 8,
          }}>WHAT THE ROOM SEES</div>
          <div style={{
            display: "grid", gridTemplateColumns: "auto 1fr",
            columnGap: 14, rowGap: 8, fontSize: "var(--fs-body)",
          }}>
            <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>FILM</span>
            <span style={{ color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{film.title}</span>
            <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>DIRECTOR</span>
            <span style={{ color: "var(--c-ink-2)" }}>{film.director}</span>
            <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>FORKS</span>
            <span style={{ color: "var(--c-ink-2)" }}>{film.forks.length}</span>
            <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>CUTS</span>
            <span style={{ color: "var(--c-ink-2)" }}>{film.totalCuts}</span>
            <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>RUNTIME</span>
            <span style={{ color: "var(--c-ink-2)" }}>{film.totalRuntimeMin}m</span>
            <span style={{ color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>VOTE WINDOW</span>
            <span style={{ color: "var(--c-ink-2)" }}>{film.schedule.voteWindow}s per fork</span>
          </div>
        </div>

        {launched && (
          <div style={{
            padding: 18, background: `linear-gradient(135deg, var(--c-good) 0%, ${tkc("line-3")} 100%)`,
            color: tkc("panel-2"), borderRadius: "var(--r-2)",
          }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, marginBottom: 6, textTransform: "uppercase",
            }}>✓ SCHEDULED</div>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.3, fontWeight: 500,
            }}>Room opens {film.schedule.premiereAt}. Audience gets a calendar invite when they follow you.</div>
          </div>
        )}
      </aside>
    </div>
  );
}

// ─── Composer mini-primitives ────────────────────────────────────────────

const composerInp = {
  width: "100%", padding: "9px 12px",
  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-1)", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
};
const composerHeadlineInp = {
  ...composerInp,
  fontFamily: "var(--f-display)", fontStyle: "italic",
  fontSize: "var(--fs-lead)", fontWeight: 500, letterSpacing: "-0.01em",
};

function Field4({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
      <span style={{
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
        letterSpacing: ".16em", textTransform: "uppercase",
      }}>{label}</span>
      {children}
    </label>
  );
}

// ════════════════════════════════════════════════════════════════════════

function BranchedFilmPageV4({ filmId }) {
  if (filmId === "compose") return <ComposeMovedToStudio/>;
  if (!filmId || !window.BRANCH_FILMS || !window.BRANCH_FILMS[filmId]) return <BranchedMarketV4/>;
  return <BranchedViewerV4 filmId={filmId}/>;
}

// Authoring lives in ONE place now: Studio's Branch panel (Graph ↔ Script).
// This card catches old /branches/compose links and routes directors there.
function ComposeMovedToStudio() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 480, textAlign: "center", padding: "44px 40px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 14 }}>COMPOSER MOVED</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, letterSpacing: "-0.01em", marginBottom: 12 }}>
          Branched films are made in Studio now.
        </div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, marginBottom: 26 }}>
          One authoring surface, two views: a node graph for structure and a screenplay for the writing — always in sync. Your drafts carried over.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <a href="Cina.html" className="btn btn-primary" style={{ height: 38, padding: "0 18px" }}>Open Studio → Branch</a>
          <button className="btn btn-ghost" style={{ height: 38 }} onClick={() => navigate("/branches")}>Back to Branched</button>
        </div>
      </div>
    </div>
  );
}

window.BranchedFilmPage = BranchedFilmPageV4;
window.BranchedViewerV4 = BranchedViewerV4;
