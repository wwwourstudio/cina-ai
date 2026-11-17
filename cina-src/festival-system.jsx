// festival-system.jsx — Single source of truth for the Cina Festival workflow.
// Loaded BEFORE strategy-watch.jsx so FestivalPage (and everything else) can
// read one wired data object: edition, schedule, passes, prizes, voting state,
// past winners + the dynamic WinnerTrophy seal, and a global upcoming banner.

const { useState: fxUS, useEffect: fxUE, useMemo: fxUM, useRef: fxUR } = React;

// ─── Edition (one object the whole site reads) ──────────────────────────
// Doors / showtime are anchored a fixed offset from load so the countdown is
// always "live" in a demo, but everything derives from these two timestamps.
const _FEST_DOORS = Date.now() + 1000 * 60 * 60 * 30; // 30h out
const _FEST_SHOW = _FEST_DOORS + 1000 * 60 * 30; // +30m
const _FEST_VOTE_OPEN = _FEST_SHOW + 1000 * 60 * 60 * 2 + 1000 * 60 * 15; // mid-program
const _FEST_VOTE_CLOSE = _FEST_VOTE_OPEN + 1000 * 60 * 18; // 18m poll
const _FEST_DROP = _FEST_VOTE_CLOSE + 1000 * 60 * 90; // catalog unlock

function _isoOffset(ts) {return new Date(ts).toISOString();}

const FESTIVAL = {
  number: 7,
  name: "Cina Festival · Vol VII",
  tagline: "Twelve premieres. One night. Holder-only afterparty.",
  doorsTs: _FEST_DOORS,
  showTs: _FEST_SHOW,
  voteOpenTs: _FEST_VOTE_OPEN,
  voteCloseTs: _FEST_VOTE_CLOSE,
  dropTs: _FEST_DROP,
  date: _isoOffset(_FEST_SHOW),
  doors: _isoOffset(_FEST_DOORS),
  city: "ONLINE · GLOBAL ROOM",
  host: "LIN HARA",
  curator: "Selected by ELIAS VOSS · LIN HARA · MIRA ASIM",
  pass: { regular: 12, holder: 0, frontRow: 49 },
  seatsLeft: 182,
  prize: { grand: 25000, audience: 10000, craft: 5000, debut: 5000 },
  lineupIds: ["ll", "frequency", "swallows", "marauder", "kindling", "verge", "drift", "carrion"],
  curators: [
  { initials: "EV", name: "Elias Voss", role: "Director · Bluejay", pick: "Slow cinema that doesn't apologize for itself.", color: "var(--c-amber)" },
  { initials: "LH", name: "Lin Hara", role: "Director · Haul", pick: "Crime films where nobody gets what they deserve.", color: tkc("bad") },
  { initials: "MA", name: "Mira Asim", role: "DP · Cannes '24", pick: "Documentaries that refuse to look away.", color: tkc("cat-1") }],

  runOfShow: [
  { phase: "DOORS", label: "Front-row check-in", sub: "Live stage feed opens. Q&A queue opens.", at: _FEST_DOORS, color: tkc("ink-3") },
  { phase: "PROGRAM", label: "Twelve premieres", sub: "4h 12m total · in running order, no skips.", at: _FEST_SHOW, color: "var(--c-amber)" },
  { phase: "VOTE", label: "Audience pick", sub: "Polls open — settle the audience prize.", at: _FEST_VOTE_OPEN, color: tkc("cat-2") },
  { phase: "PAYOUT", label: "Prize payout, live", sub: "Jury + audience purses released on stage.", at: _FEST_VOTE_CLOSE, color: tkc("good") },
  { phase: "AFTERPARTY", label: "Holder voice rooms", sub: "One room per director. Secondary market unlocks.", at: _FEST_VOTE_CLOSE + 6e5, color: tkc("bad") },
  { phase: "DROP", label: "Watch unlocks for all", sub: "All 12 premieres roll into the catalog.", at: _FEST_DROP, color: tkc("cat-1") }],

  whatItIs: [
  { n: "01", h: "Curated, not algorithmic.", b: "Three guest curators each pick four films. Every release is a debut — the first time anyone sees them." },
  { n: "02", h: "Live, then forever.", b: "Watch live with everyone else, or stream the same program on demand for 24 hours. After that it joins the catalog." },
  { n: "03", h: "The room is the show.", b: "Holders walk into voice rooms with the directors. The audience prize is voted live, and the purse is paid out on stage." }]

};

// ─── Past winners — the spine of the trophy system ──────────────────────
// Each edition awards Grand Jury / Audience Pick / Best Craft to real CATALOG
// titles. These power the seals everywhere films appear.
const FESTIVAL_WINNERS = [
{ edition: 6, date: "2026-05-01", attended: 18420, sales: 1840000, awards: [
  { award: "GRAND JURY", filmId: "swallows", citation: "For three sisters and a grief that never raises its voice." },
  { award: "AUDIENCE PICK", filmId: "drift", citation: "Voted by 18,420 seats in the room." },
  { award: "BEST CRAFT", filmId: "frequency", citation: "For a soundtrack that is the whole plot." }]
},
{ edition: 5, date: "2026-04-03", attended: 14310, sales: 1280000, awards: [
  { award: "GRAND JURY", filmId: "bluejay", citation: "A single afternoon, stretched to a lifetime." },
  { award: "AUDIENCE PICK", filmId: "swallows", citation: "The first film to win two editions running." },
  { award: "BEST CRAFT", filmId: "thefence", citation: "For letting the high desert do the threatening." }]
},
{ edition: 4, date: "2026-03-06", attended: 11200, sales: 890000, awards: [
  { award: "GRAND JURY", filmId: "thefence", citation: "The inaugural Grand Jury seal." },
  { award: "AUDIENCE PICK", filmId: "salt", citation: "A year of mourning, salted by hand." },
  { award: "BEST CRAFT", filmId: "obsidian", citation: "For a canyon that shouldn't be on any map." }]
}];

// Annotate CATALOG so each title carries its wins. Runs once at load.
(function _annotateWins() {
  const cat = window.CATALOG || [];
  FESTIVAL_WINNERS.forEach((ed) => {
    ed.awards.forEach((a) => {
      const f = cat.find((c) => c.id === a.filmId);
      if (!f) return;
      f.festivalWins = f.festivalWins || [];
      if (!f.festivalWins.some((w) => w.edition === ed.edition && w.award === a.award)) {
        f.festivalWins.push({ edition: ed.edition, date: ed.date, award: a.award, citation: a.citation });
      }
    });
  });
})();

function getFilmTrophies(filmId) {
  const f = (window.CATALOG || []).find((c) => c.id === filmId);
  return f && f.festivalWins || [];
}
// Award rank for choosing the "headline" trophy on a tile.
const _AWARD_RANK = { "GRAND JURY": 3, "AUDIENCE PICK": 2, "BEST CRAFT": 1 };
const _AWARD_COLOR = { "GRAND JURY": "var(--c-amber)", "AUDIENCE PICK": tkc("cat-2"), "BEST CRAFT": tkc("cat-1"), "BEST DEBUT": tkc("good") };
function awardColor(award) {return _AWARD_COLOR[award] || tkc("amber");}
function topTrophy(filmId) {
  const wins = getFilmTrophies(filmId);
  if (!wins.length) return null;
  const t = [...wins].sort((a, b) => (_AWARD_RANK[b.award] || 0) - (_AWARD_RANK[a.award] || 0))[0];
  return { ...t, color: awardColor(t.award) };
}

// ─── Formatting helpers ─────────────────────────────────────────────────
const _ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
function festRoman(n) {return _ROMAN[n] || "" + n;}
function festMonthYear(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}
function festShortAward(award) {
  return { "GRAND JURY": "GRAND JURY", "AUDIENCE PICK": "AUDIENCE", "BEST CRAFT": "CRAFT", "BEST DEBUT": "DEBUT" }[award] || award;
}

// ─── Countdown hook (shared) ────────────────────────────────────────────
function useFestCountdown(ts) {
  const [now, setNow] = fxUS(Date.now());
  fxUE(() => {const t = setInterval(() => setNow(Date.now()), 1000);return () => clearInterval(t);}, []);
  const diff = Math.max(0, ts - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor(diff / 3600000) % 24,
    m: Math.floor(diff / 60000) % 60,
    s: Math.floor(diff / 1000) % 60,
    done: diff === 0, diff
  };
}

// ════════════════════════════════════════════════════════════════════════
//  WinnerTrophy — dynamic laurel seal. Award name + edition + date baked in.
//  variant: "seal" (full medallion) · "chip" (corner pill for thumbnails)
//           · "laurel" (inline laurel + award, for titles)
// ════════════════════════════════════════════════════════════════════════
let _trophyUID = 0;
function WinnerTrophy({ award = "GRAND JURY", edition = 7, date, size = 120, variant = "seal", color = tkc("amber"), title }) {
  const uid = fxUM(() => "tph" + ++_trophyUID, []);
  const my = festMonthYear(date || FESTIVAL.date);
  const editionLabel = "VOL " + festRoman(edition);

  // ── mini: tiny icon-only award seal for thumbnail corners (no text) ──
  if (variant === "mini") {
    const s = size && size <= 40 ? size : 22;
    return (
      <span title={title || `${award} · ${editionLabel}`} aria-label={`${award} winner`} style={{
        width: s, height: s, borderRadius: "50%", flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "rgba(10,7,5,0.78)", backdropFilter: "blur(6px)",
        border: `1px solid ${color}`, boxShadow: `0 1px 6px rgba(0,0,0,.5)`
      }}>
        <LaurelGlyph size={Math.round(s * 0.66)} color={color} />
      </span>);

  }

  // ── chip: compact corner badge for video thumbnails ──
  if (variant === "chip") {
    return (
      <span title={title || `${award} · ${editionLabel}`} style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px 3px 6px", borderRadius: 999,
        background: "rgba(10,7,5,0.82)", backdropFilter: "blur(6px)",
        border: `1px solid ${color}88`, boxShadow: `0 2px 10px rgba(0,0,0,.4)`
      }}>
        <LaurelGlyph size={13} color={color} />
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", color, whiteSpace: "nowrap" }}>
          {festShortAward(award)}
        </span>
      </span>);

  }

  // ── laurel: classic festival-logo lockup — two branches flank the award ──
  if (variant === "laurel") {
    const bh = size && size <= 80 ? size : 46; // branch height
    const place = (FESTIVAL.city || "").split("·")[0].trim();
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <LaurelBranch size={bh} color={color} side={-1} />
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.16, textAlign: "center", whiteSpace: "nowrap", padding: "5px 13px", borderRadius: "var(--r-2)", background: "rgba(10,8,6,0.62)", backdropFilter: "blur(4px)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ width: 12, height: 1, background: `linear-gradient(90deg, transparent, ${color})` }} />
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)" }}>WINNER</span>
            <span style={{ width: 12, height: 1, background: `linear-gradient(90deg, ${color}, transparent)` }} />
          </span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 700, letterSpacing: ".16em", color, textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>{award}</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)", marginTop: 3 }}>{editionLabel} · {place} · {my}</span>
        </span>
        <LaurelBranch size={bh} color={color} side={1} />
      </span>);

  }

  // ── seal: full medallion with arced award text + laurel wreath ──
  const cx = 100,cy = 104,R = 52;
  const topR = 70,botR = 70;
  const arc = (r, a0, a1, sweep) => {
    const p0 = [cx + r * Math.cos(a0 * Math.PI / 180), cy + r * Math.sin(a0 * Math.PI / 180)];
    const p1 = [cx + r * Math.cos(a1 * Math.PI / 180), cy + r * Math.sin(a1 * Math.PI / 180)];
    return `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  };

  // laurel leaves along each side
  const leaf = (side) => {
    const els = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1); // 0 bottom → 1 top
      const theta = (side > 0 ? 108 : 72) + side * t * 132; // degrees
      const rad = theta * Math.PI / 180;
      const x = cx + (R + 12) * Math.cos(rad);
      const y = cy + (R + 12) * Math.sin(rad);
      // leaf points up toward the opening at top
      const dir = Math.atan2(38 - y, 100 - x) * 180 / Math.PI;
      const scale = 0.7 + 0.5 * Math.sin(t * Math.PI);
      els.push(
        <path key={side + "-" + i}
        d="M0 0 Q4.4 -7 0 -15 Q-4.4 -7 0 0 Z"
        transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(dir + 90).toFixed(1)}) scale(${scale.toFixed(2)})`}
        fill={color} opacity={0.5 + 0.45 * t} />
      );
    }
    return els;
  };

  return (
    <svg width={size} height={size} viewBox="0 0 200 208" style={{ display: "block", overflow: "visible" }} role="img" aria-label={`${award} ${editionLabel}`}>
      <defs>
        <path id={uid + "-top"} d={arc(topR, 202, 338, 1)} />
        <path id={uid + "-bot"} d={arc(botR, 158, 22, 0)} />
        <radialGradient id={uid + "-g"} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="70%" stopColor={color} stopOpacity="0.03" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* glow + rings */}
      <circle cx={cx} cy={cy} r="74" fill={`url(#${uid}-g)`} />
      <circle cx={cx} cy={cy} r="58" fill="none" stroke={color} strokeWidth="1" opacity="0.35" />
      <circle cx={cx} cy={cy} r="54" fill="none" stroke={color} strokeWidth="0.6" opacity="0.55" strokeDasharray="1.5 3" />

      {/* laurel wreath */}
      {leaf(-1)}{leaf(1)}
      {/* tie ribbon at base */}
      <path d={`M ${cx - 14} 176 Q ${cx} 168 ${cx + 14} 176`} fill="none" stroke={color} strokeWidth="2" opacity="0.7" />

      {/* trophy cup */}
      <g fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M86 80 L114 80 C114 100 106 110 100 110 C94 110 86 100 86 80 Z" fill={color} fillOpacity="0.12" />
        <path d="M86 84 C78 84 74 80 74 74 C74 70 78 69 84 70" />
        <path d="M114 84 C122 84 126 80 126 74 C126 70 122 69 116 70" />
        <path d="M100 110 L100 120" />
        <path d="M90 122 L110 122" />
        <path d="M88 132 L112 132 L110 122 L90 122 Z" fill={color} fillOpacity="0.12" />
      </g>
      {/* star in cup */}
      <path d="M100 86 l2.2 4.6 5 .5 -3.8 3.4 1.1 4.9 -4.5 -2.6 -4.5 2.6 1.1 -4.9 -3.8 -3.4 5 -.5 z" fill={color} />

      {/* arced texts */}
      <text fontFamily="var(--f-mono)" fontSize="13" fontWeight="700" letterSpacing="3.4" fill={color}>
        <textPath href={`#${uid}-top`} startOffset="50%" textAnchor="middle">{award}</textPath>
      </text>
      <text fontFamily="var(--f-mono)" fontSize="11" fontWeight="600" letterSpacing="3" fill={`var(--c-ink-2, ${tkc("ink-2")})`}>
        <textPath href={`#${uid}-bot`} startOffset="50%" textAnchor="middle">{editionLabel} · {my}</textPath>
      </text>

      {/* little stars flanking */}
      <circle cx="58" cy="104" r="1.6" fill={color} />
      <circle cx="142" cy="104" r="1.6" fill={color} />
    </svg>);

}

// One laurel branch (mirror with side=-1 / 1) — for the festival-logo lockup.
function LaurelBranch({ size = 46, color = tkc("amber"), side = 1 }) {
  const w = size * 0.5;
  return (
    <svg width={w} height={size} viewBox="0 0 22 46" style={{ display: "block", flexShrink: 0, transform: side < 0 ? "scaleX(-1)" : "none" }} aria-hidden="true">
      {/* curved stem opening upward */}
      <path d="M18 44 C9 39 5 30 7 19 C8.2 12 11 6 15 2" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* leaves down the inner edge */}
      <g fill={color}>
        <ellipse cx="8.4" cy="22" rx="1.5" ry="3" transform="rotate(28 8.4 22)" />
        <ellipse cx="7.6" cy="27" rx="1.6" ry="3.2" transform="rotate(14 7.6 27)" />
        <ellipse cx="8" cy="32" rx="1.6" ry="3.2" transform="rotate(2 8 32)" />
        <ellipse cx="9.6" cy="37" rx="1.5" ry="3" transform="rotate(-12 9.6 37)" />
        <ellipse cx="12.2" cy="41.4" rx="1.4" ry="2.7" transform="rotate(-26 12.2 41.4)" />
        <ellipse cx="10.6" cy="16.5" rx="1.4" ry="2.8" transform="rotate(40 10.6 16.5)" />
        <ellipse cx="13.4" cy="11" rx="1.3" ry="2.6" transform="rotate(52 13.4 11)" />
      </g>
    </svg>);

}

// Standalone laurel glyph — a fuller wreath that nearly closes into a ring,
// opening at the top to a star. Reads as an award seal at small sizes.
function LaurelGlyph({ size = 16, color = "var(--c-amber)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: "block", flexShrink: 0 }} aria-hidden="true">
      {/* star at the crown */}
      <path d="M16 2.5 l1.6 3.3 3.6.4 -2.7 2.5 .7 3.5 -3.2 -1.9 -3.2 1.9 .7 -3.5 -2.7 -2.5 3.6 -.4 z" fill={color} />
      {/* two branches sweeping from the base up around to the crown */}
      <g fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 29.5 C8 28 4.5 21 5.5 14 C6 10.5 7.6 8.2 9.5 6.6" />
        <path d="M16 29.5 C24 28 27.5 21 26.5 14 C26 10.5 24.4 8.2 22.5 6.6" />
      </g>
      {/* leaves — left branch */}
      <g fill={color}>
        <ellipse cx="5.6" cy="15" rx="1.4" ry="2.7" transform="rotate(40 5.6 15)" />
        <ellipse cx="5.4" cy="19" rx="1.4" ry="2.7" transform="rotate(22 5.4 19)" />
        <ellipse cx="6.6" cy="23" rx="1.4" ry="2.6" transform="rotate(2 6.6 23)" />
        <ellipse cx="9.2" cy="26.4" rx="1.3" ry="2.4" transform="rotate(-18 9.2 26.4)" />
        <ellipse cx="8.4" cy="9.6" rx="1.3" ry="2.4" transform="rotate(58 8.4 9.6)" />
        {/* right branch */}
        <ellipse cx="26.4" cy="15" rx="1.4" ry="2.7" transform="rotate(-40 26.4 15)" />
        <ellipse cx="26.6" cy="19" rx="1.4" ry="2.7" transform="rotate(-22 26.6 19)" />
        <ellipse cx="25.4" cy="23" rx="1.4" ry="2.6" transform="rotate(-2 25.4 23)" />
        <ellipse cx="22.8" cy="26.4" rx="1.3" ry="2.4" transform="rotate(18 22.8 26.4)" />
        <ellipse cx="23.6" cy="9.6" rx="1.3" ry="2.4" transform="rotate(-58 23.6 9.6)" />
      </g>
    </svg>);

}

// Tiny convenience: the trophy chip for a film, or null. Drop into thumbnails.
function TrophyChip({ filmId, style }) {
  const t = topTrophy(filmId);
  if (!t) return null;
  return <span style={style}><WinnerTrophy variant="chip" award={t.award} edition={t.edition} date={t.date} color={t.color} /></span>;
}

// Tiny icon-only award seal for a film, or null. For dense thumbnail corners.
function MiniTrophy({ filmId, size = 22, style }) {
  const t = topTrophy(filmId);
  if (!t) return null;
  return <span style={style}><WinnerTrophy variant="mini" size={size} award={t.award} edition={t.edition} date={t.date} color={t.color} /></span>;
}

// ─── Voting + payout state (localStorage-backed) ────────────────────────
const FEST_VOTE_KEY = "cina:fest:vote:" + FESTIVAL.number;
const FEST_PAID_KEY = "cina:fest:paid:" + FESTIVAL.number;

function festReadVote() {try {return localStorage.getItem(FEST_VOTE_KEY) || null;} catch (e) {return null;}}
function festWriteVote(id) {try {localStorage.setItem(FEST_VOTE_KEY, id);} catch (e) {}}
function festReadPaid() {try {return localStorage.getItem(FEST_PAID_KEY) === "1";} catch (e) {return false;}}
function festWritePaid() {try {localStorage.setItem(FEST_PAID_KEY, "1");} catch (e) {}}

// Seeded base tallies so the leaderboard is stable across renders but lively.
function festBaseTally(lineup) {
  return lineup.map((f, i) => {
    let h = 0;const s = (f.id || "") + i;
    for (let k = 0; k < s.length; k++) h = h * 31 + s.charCodeAt(k) | 0;
    return 600 + Math.abs(h) % 900 + (lineup.length - i) * 40;
  });
}

function useFestivalVoting(lineup) {
  const [vote, setVote] = fxUS(festReadVote);
  const base = fxUM(() => festBaseTally(lineup), [lineup.length]);
  const [bump, setBump] = fxUS(() => base.map(() => 0));
  const phase = useFestPhase();

  // live drift while polls are open
  fxUE(() => {
    if (phase !== "vote") return;
    const t = setInterval(() => {
      setBump((prev) => prev.map((v) => v + Math.floor(Math.random() * 7)));
    }, 1400);
    return () => clearInterval(t);
  }, [phase]);

  const tally = base.map((b, i) => b + bump[i] + (lineup[i] && vote === lineup[i].id ? 1 : 0));
  const total = tally.reduce((a, b) => a + b, 0);
  const ranked = lineup.map((f, i) => ({ film: f, votes: tally[i], pct: total ? tally[i] / total * 100 : 0 })).
  sort((a, b) => b.votes - a.votes);
  const leader = ranked[0];

  const cast = (id) => {
    festWriteVote(id);setVote(id);
    setBump((prev) => prev.map((v, i) => v + (lineup[i] && lineup[i].id === id ? 120 : 0)));
    if (window.toast) {
      const f = lineup.find((x) => x.id === id);
      window.toast({ title: "VOTE CAST", text: `"${f?.title}" for Audience Pick`, kind: "good" });
    }
  };
  return { vote, cast, ranked, leader, total, phase };
}

// Festival lifecycle phase derived from the clock.
function useFestPhase() {
  const [now, setNow] = fxUS(Date.now());
  fxUE(() => {const t = setInterval(() => setNow(Date.now()), 5000);return () => clearInterval(t);}, []);
  if (now < FESTIVAL.doorsTs) return "upcoming";
  if (now < FESTIVAL.voteOpenTs) return "live";
  if (now < FESTIVAL.voteCloseTs) return "vote";
  if (now < FESTIVAL.dropTs) return "payout";
  return "closed";
}

// ─── Next followed drop (mirrors ReleaseBanner logic, as one notification) ──
function useFestUpcomingDrop() {
  return fxUM(() => {
    const cat = window.CATALOG || [];
    const user = window.USER || { followingCreators: [], watchlist: [] };
    const items = [];
    cat.forEach((f) => {
      const followed = (user.followingCreators || []).includes(f.creatorId) || (user.watchlist || []).includes(f.id);
      if (!followed) return;
      if (f.kind === "series" && Array.isArray(f.series)) {
        const next = f.series.find((e) => e.status === "scheduled");
        if (next) items.push({ film: f, ep: next, dropISO: next.drop + "T19:00:00" });
      }
    });
    items.sort((a, b) => new Date(a.dropISO) - new Date(b.dropISO));
    return items[0] || null;
  }, []);
}

// ════════════════════════════════════════════════════════════════════════
//  Global notification banner — ONE bar that cross-fades between live
//  notifications (festival phase card + next followed drop). Replaces the
//  old stacked ReleaseBanner + FestivalBanner pair.
// ════════════════════════════════════════════════════════════════════════
function _BannerRow({ badge, badgeColor, live, title, sub, meta, cta, onCta, narrow }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: narrow ? 8 : 12, width: "100%", paddingRight: narrow ? 56 : 84 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px",
        background: live ? "rgba(201,85,72,.18)" : "rgba(var(--accent-rgb),.10)",
        border: `1px solid ${live ? "rgba(201,85,72,.45)" : "rgba(var(--accent-rgb),.3)"}`, borderRadius: "var(--r-1)",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
        color: badgeColor, letterSpacing: ".16em", whiteSpace: "nowrap", flexShrink: 0
      }}>
        {live ? <span className="rec-dot" /> : <LaurelGlyph size={12} color={badgeColor} />}
        {badge}
      </span>
      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", whiteSpace: "nowrap", flexShrink: 0, ...(narrow && { overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }) }}>
        {narrow ? title.short || title.full : title.full}
      </span>
      {!narrow && sub &&
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flexShrink: 1 }}>
          {sub}
        </span>
      }
      <span style={{ flex: 1 }} />
      {!narrow && meta &&
      <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: live ? "var(--c-blood-l)" : "var(--c-ink-2)", fontWeight: 600, letterSpacing: ".08em", whiteSpace: "nowrap", flexShrink: 0 }}>
          {meta}
        </span>
      }
      <button className="btn-ghost" style={{
        height: 22, padding: "0 9px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
        letterSpacing: ".16em", fontWeight: 600, color: badgeColor, whiteSpace: "nowrap", flexShrink: 0
      }} onClick={onCta}>{cta}</button>
    </div>);

}

function FestivalBanner() {
  const route = typeof useRoute === "function" ? useRoute() : { parts: [] };
  const phase = useFestPhase();
  const [dismissed, setDismissed] = fxUS(false);
  const [idx, setIdx] = fxUS(0);
  const cdDoors = useFestCountdown(FESTIVAL.doorsTs);
  const cdClose = useFestCountdown(FESTIVAL.voteCloseTs);
  const [narrow, setNarrow] = fxUS(() => window.innerWidth <= 767);
  const drop = useFestUpcomingDrop();
  fxUE(() => {
    const h = () => setNarrow(window.innerWidth <= 767);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);

  const p0 = route.parts[0] || "";
  const onPlayer = ["film", "party", "premiere", "creator", "build", "site", "journey"].includes(p0) ||
  p0 === "series" && route.parts[2] === "ep";

  // Build notification slides (festival first, then the followed drop).
  const slides = [];
  if (phase !== "closed" && p0 !== "festival") {
    const live = phase === "live" || phase === "vote" || phase === "payout";
    const meta = phase === "vote" ?
    `polls close in ${String(cdClose.m).padStart(2, "0")}:${String(cdClose.s).padStart(2, "0")}` :
    phase === "upcoming" ?
    `doors in ${cdDoors.d > 0 ? cdDoors.d + "d " : ""}${String(cdDoors.h).padStart(2, "0")}h ${String(cdDoors.m).padStart(2, "0")}m` :
    "happening now";
    slides.push({
      key: "fest", live,
      badge: phase === "vote" ? "AUDIENCE VOTE OPEN" : phase === "payout" ? "PRIZE PAYOUT LIVE" : live ? "FESTIVAL LIVE" : `FESTIVAL VOL.${FESTIVAL.number}`,
      badgeColor: live ? "var(--c-blood-l)" :  "var(--c-amber)",
      title: { full: "Twelve premieres, one night.", short: "12 premieres" },
      sub: FESTIVAL.curator, meta,
      cta: phase === "vote" ? "VOTE →" : live ? "ENTER →" : "GET A PASS →",
      onCta: () => navigate("/festival")
    });
  }
  if (drop) {
    const t = typeof timeUntilFromNow === "function" ? timeUntilFromNow(drop.dropISO) : { label: "soon", days: 0 };
    if (t.days == null || t.days <= 10) {
      const isToday = t.urgent && (t.days == null || t.days === 0);
      slides.push({
        key: "drop", live: isToday,
        badge: isToday ? "DROPPING TODAY" : "UPCOMING",
        badgeColor: isToday ? "var(--c-blood-l)" :  "var(--c-amber)",
        title: { full: drop.film.title, short: drop.film.title },
        sub: drop.film.kind === "series" ? `S${String(drop.film.season).padStart(2, "0")}·E${String(drop.ep.ep).padStart(2, "0")} · ${drop.ep.title}` : null,
        meta: `in ${t.label}`,
        cta: isToday ? "WATCH →" : "REMIND",
        onCta: () => navigate(drop.film.kind === "series" ? `/series/${drop.film.id}` : `/film/${drop.film.id}`)
      });
    }
  }

  // Auto-advance the slideshow (cross-fade).
  fxUE(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);

  if (onPlayer || dismissed || slides.length === 0) return null;
  const active = idx % slides.length;
  const anyLive = slides[active] && slides[active].live;

  return (
    <div style={{
      position: "relative", zIndex: 2, isolation: "isolate",
      background: anyLive ?
      "linear-gradient(90deg, rgba(201,85,72,.16) 0%, rgba(var(--accent-rgb),.07) 45%, transparent 100%), var(--c-bg)" :
      "linear-gradient(90deg, rgba(var(--accent-rgb),.11) 0%, rgba(var(--accent-rgb),.03) 50%, transparent 100%), var(--c-bg)",
      borderBottom: "1px solid var(--c-line)",
      padding: narrow ? "6px 14px" : "7px 28px",
      minHeight: 34, overflow: "hidden",
      transition: "background .6s ease"
    }}>
      {/* Fading slide layers */}
      <div style={{ position: "relative", minHeight: 22 }}>
        {slides.map((s, i) =>
        <div key={s.key} style={{
          position: i === active ? "relative" : "absolute",
          inset: i === active ? "auto" : 0,
          opacity: i === active ? 1 : 0,
          transition: `opacity .28s ease ${i === active ? ".3s" : "0s"}`,
          pointerEvents: i === active ? "auto" : "none"
        }}>
            <_BannerRow {...s} narrow={narrow} />
          </div>
        )}
      </div>
      {/* Static controls: progress dots + single dismiss */}
      <div style={{ position: "absolute", top: 0, bottom: 0, right: narrow ? 10 : 24, display: "flex", alignItems: "center", gap: 10 }}>
        {slides.length > 1 &&
        <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {slides.map((s, i) =>
          <button key={s.key} onClick={() => setIdx(i)} aria-label={`Notification ${i + 1}`} style={{
            appearance: "none", border: "none", cursor: "pointer", padding: 0,
            width: i === active ? 14 : 5, height: 5, borderRadius: "var(--r-1)",
            background: i === active ? "var(--c-amber)" : "rgba(255,255,255,.28)",
            transition: "all .3s ease"
          }} />
          )}
          </span>
        }
        <button onClick={() => setDismissed(true)} aria-label="Dismiss" title="Dismiss" className="btn-ghost btn-icon" style={{ width: 20, height: 20, color: "var(--c-ink-3)" }}>
          <Icon name="x" size={10} />
        </button>
      </div>
    </div>);

}

// ════════════════════════════════════════════════════════════════════════
//  FestivalParallax — layered cinematic stills that drift on scroll + mouse.
//  Sits behind the festival hero; gradient overlay keeps text readable.
// ════════════════════════════════════════════════════════════════════════
function FestivalParallax({ kinds = ["a4", "d1", "b1", "c2", "a3"] }) {
  const [s, setS] = fxUS({ y: 0, mx: 0 });
  fxUE(() => {
    let raf = 0;
    const update = () => {raf = 0;};
    const onScroll = () => {if (!raf) raf = requestAnimationFrame(() => {setS((o) => ({ ...o, y: window.scrollY }));raf = 0;});};
    const onMove = (e) => {if (!raf) raf = requestAnimationFrame(() => {setS((o) => ({ ...o, mx: e.clientX / window.innerWidth - 0.5 }));raf = 0;});};
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {window.removeEventListener("scroll", onScroll);window.removeEventListener("mousemove", onMove);if (raf) cancelAnimationFrame(raf);};
  }, []);
  const cover = (k) => "assets/covers/" + k + ".png";
  // five columns fanned across the upper-right of the hero
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "flex-end", gap: 14, paddingRight: "2%", opacity: 0.5 }}>
        {kinds.map((k, i) => {
          const depth = i % 3 + 1; // 1..3
          const ty = -(s.y * (0.04 + depth * 0.03));
          const tx = s.mx * (10 + depth * 14);
          return (
            <div key={k + i} style={{
              width: "clamp(120px, 13vw, 220px)", height: "120%",
              marginTop: i % 2 ? "-6%" : "-12%",
              transform: `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`,
              transition: "transform .12s linear",
              borderRadius: "var(--r-2)", overflow: "hidden", flexShrink: 0,
              boxShadow: "0 30px 80px rgba(0,0,0,.5)"
            }}>
              <img src={cover(k)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.85) contrast(1.05) brightness(.82)" }} />
            </div>);

        })}
      </div>
      {/* readability washes */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--c-bg) 18%, rgba(20,16,12,.72) 48%, rgba(20,16,12,.30) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(18,14,10,.55) 0%, transparent 30%, var(--c-bg) 96%)" }} />
    </div>);

}

// ════════════════════════════════════════════════════════════════════════
//  FestivalWinnersSection — past editions' honour roll, dynamic trophy seals
// ════════════════════════════════════════════════════════════════════════
function FestivalWinnersSection() {
  const cat = window.CATALOG || [];
  const filmOf = (id) => cat.find((c) => c.id === id);
  const [openEd, setOpenEd] = fxUS(FESTIVAL_WINNERS[0] ? FESTIVAL_WINNERS[0].edition : null);
  return (
    <section style={{ padding: "44px var(--gutter) 24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>THE HONOUR ROLL</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>Past winners</h2>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
          EVERY SEAL IS MINTED WITH THE FILM
        </div>
      </div>

      {/* Edition tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {FESTIVAL_WINNERS.map((ed) =>
        <button key={ed.edition} onClick={() => setOpenEd(ed.edition)} className="btn-ghost" style={{
          height: 34, padding: "0 16px", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          background: openEd === ed.edition ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel)",
          border: "1px solid " + (openEd === ed.edition ? "var(--c-amber)" : "var(--c-line)"),
          color: openEd === ed.edition ? "var(--c-amber)" : "var(--c-ink-2)", borderRadius: 999
        }}>VOL {festRoman(ed.edition)} · {festMonthYear(ed.date)}</button>
        )}
      </div>

      {FESTIVAL_WINNERS.filter((ed) => ed.edition === openEd).map((ed) =>
      <div key={ed.edition}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {ed.awards.map((a) => {
            const f = filmOf(a.filmId);
            const color = a.award === "GRAND JURY" ? "var(--c-amber)" : a.award === "AUDIENCE PICK" ? tkc("cat-2") : tkc("cat-1");
            return (
              <div key={a.award} onClick={() => f && navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)}
              style={{
                background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden",
                cursor: f ? "pointer" : "default", transition: "border-color .15s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--c-line)"}>
                  <div style={{ position: "relative", height: 150, background: f && f.color || tkc("panel"), overflow: "hidden" }}>
                    {window.FrameThumb && <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={f && f.thumb || a.filmId} usePhoto /></div>}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,6,4,.2) 0%, rgba(8,6,4,.85) 100%)" }} />
                    <div style={{ position: "absolute", right: 10, top: 10 }}>
                      <WinnerTrophy variant="seal" size={92} award={a.award} edition={ed.edition} date={ed.date} color={color} />
                    </div>
                    <div style={{ position: "absolute", left: 14, bottom: 12, right: 14 }}>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color, fontWeight: 700 }}>{a.award}</div>
                      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), lineHeight: 1.05, marginTop: 2 }}>{f && f.title || a.filmId}</div>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>"{a.citation}"</p>
                  </div>
                </div>);

          })}
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 18, flexWrap: "wrap" }}>
            {[["ATTENDED", ed.attended.toLocaleString() + " seats"], ["BOX OFFICE", "$" + (ed.sales / 1e6).toFixed(2) + "M"], ["AWARDS", ed.awards.length + " seals minted"]].map(([k, v]) =>
          <div key={k}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{k}</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 2 }}>{v}</div>
              </div>
          )}
          </div>
        </div>
      )}
    </section>);

}

// ════════════════════════════════════════════════════════════════════════
//  FestivalVotePayout — phase-aware live audience vote + prize payout.
// ════════════════════════════════════════════════════════════════════════
function FestivalVotePayout({ lineup }) {
  const { vote, cast, ranked, leader, total, phase } = useFestivalVoting(lineup);
  const [paid, setPaid] = fxUS(festReadPaid);
  const cdOpen = useFestCountdown(FESTIVAL.voteOpenTs);
  const cdClose = useFestCountdown(FESTIVAL.voteCloseTs);

  const open = phase === "vote";
  const settled = phase === "payout" || phase === "closed";
  const winner = leader && leader.film;
  const purse = FESTIVAL.prize.audience;

  const doPayout = () => {
    festWritePaid();setPaid(true);
    if (window.toast) window.toast({ title: "PURSE RELEASED", text: `$${purse.toLocaleString()} → ${winner?.title}`, kind: "good" });
  };

  const headline = open ? "Audience vote is open." : phase === "upcoming" || phase === "live" ? "The audience prize, live." : "Audience pick — settled.";
  const sub = open ?
  `One vote per seat. Polls close in ${String(cdClose.m).padStart(2, "0")}:${String(cdClose.s).padStart(2, "0")}.` :
  phase === "upcoming" ?
  `Voting opens mid-program, ${cdOpen.d > 0 ? cdOpen.d + "d " : ""}${String(cdOpen.h).padStart(2, "0")}h ${String(cdOpen.m).padStart(2, "0")}m from now.` :
  phase === "live" ?
  "Voting opens the moment the last premiere ends." :
  `The room cast ${total.toLocaleString()} votes. The purse pays out on stage.`;

  return (
    <section style={{ padding: "32px var(--gutter)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", marginBottom: 8, color: open ? "var(--c-blood-l)" : "var(--c-amber)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            {open && <span className="rec-dot" />}
            {open ? "LIVE · AUDIENCE PRIZE" : settled ? "PRIZE PAYOUT" : "AUDIENCE PRIZE"}
          </div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>{headline}</h2>
          <div style={{ color: "var(--c-ink-3)", marginTop: 6, maxWidth: 560, fontSize: "12px" }}>{sub}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>AUDIENCE PURSE</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", letterSpacing: "-0.02em", lineHeight: 1 }}>${purse.toLocaleString()}</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ display: "grid", gap: 8 }}>
        {ranked.slice(0, 6).map((r, i) => {
          const f = r.film;
          const isLeader = i === 0;
          const mine = vote === f.id;
          return (
            <div key={f.id} style={{
              display: "grid", gridTemplateColumns: "30px 52px 1fr 96px auto", gap: 14, alignItems: "center",
              padding: "10px 14px", borderRadius: "var(--r-2)",
              background: isLeader && settled ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel)",
              border: "1px solid " + (isLeader && settled ? "var(--c-amber)" : mine ? "rgba(var(--accent-rgb),.5)" : "var(--c-line)")
            }}>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: isLeader ? "var(--c-amber)" : "var(--c-ink-4)" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ width: 52, height: 32, borderRadius: "var(--r-1)", overflow: "hidden", background: f.color, position: "relative" }}>
                {window.FrameThumb && <FrameThumb kind={f.thumb} usePhoto />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</span>
                  {isLeader && settled && <WinnerTrophy variant="chip" award="AUDIENCE PICK" edition={FESTIVAL.number} date={FESTIVAL.date} color={tkc("cat-2")} />}
                  {mine && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: "var(--r-1)", padding: "1px 5px" }}>YOUR VOTE</span>}
                </div>
                <div style={{ height: 3, background: "var(--c-bg)", borderRadius: "var(--r-1)", marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: r.pct.toFixed(1) + "%", height: "100%", background: isLeader ? "var(--c-amber)" : "var(--c-ink-3)", transition: "width 1.2s ease" }} />
                </div>
              </div>
              <div className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right" }}>{Math.round(r.votes).toLocaleString()}<span style={{ color: "var(--c-ink-4)" }}> · {r.pct.toFixed(1)}%</span></div>
              <div style={{ textAlign: "right" }}>
                {open ?
                <button className="btn" onClick={() => cast(f.id)} disabled={!!vote} style={{
                  height: 30, padding: "0 14px", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em",
                  background: mine ? "var(--c-amber)" : "transparent", color: mine ? tkc("void") :  "var(--c-amber)",
                  border: "1px solid var(--c-amber)", borderRadius: 999, opacity: vote && !mine ? 0.4 : 1
                }}>{mine ? "VOTED" : "VOTE"}</button> :

                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{i === 0 && settled ? "WINNER" : "—"}</span>
                }
              </div>
            </div>);

        })}
      </div>

      {/* Payout strip when polls are settled */}
      {settled && winner &&
      <div style={{
        marginTop: 18, padding: "20px 24px", borderRadius: "var(--r-2)",
        background: "linear-gradient(100deg, rgba(var(--accent-rgb),.1) 0%, var(--c-panel) 55%)",
        border: "1px solid rgba(var(--accent-rgb),.4)", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap"
      }}>
          <WinnerTrophy variant="seal" size={108} award="AUDIENCE PICK" edition={FESTIVAL.number} date={FESTIVAL.date} color= "var(--c-amber)" />
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 4 }}>AUDIENCE PICK · VOL {festRoman(FESTIVAL.number)}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", lineHeight: 1.05 }}>{winner.title}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6 }}>
              {paid ? `$${purse.toLocaleString()} released to ${winner.creator || "the filmmaker"} on stage.` : `${total.toLocaleString()} votes counted. The purse is ready to release.`}
            </div>
          </div>
          <button className="btn btn-primary" onClick={doPayout} disabled={paid} style={{ height: 46, padding: "0 24px", fontSize: "var(--fs-body)", opacity: paid ? 0.6 : 1 }}>
            {paid ? "✓ Purse released" : `Release $${purse.toLocaleString()} purse`}
          </button>
        </div>
      }
    </section>);

}

Object.assign(window, { FESTIVAL, FESTIVAL_WINNERS, topTrophy, WinnerTrophy, LaurelGlyph, TrophyChip, MiniTrophy, festRoman, FestivalBanner, FestivalWinnersSection, FestivalVotePayout });