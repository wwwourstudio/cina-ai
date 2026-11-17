// watch-branches.jsx — Branched Cinema · v3
//
// Two routes:
//   /branches                  → BranchedMarket  (lobby/marketplace)
//   /branches/:filmId          → BranchedViewer  (cinema-mode player + forks)
//
// Design intent:
//   - The viewer is a real "watching" experience: a 21:9 stage with
//     subtle motion that auto-advances between forks (no dead air).
//   - At each fork the player dims and a full-bleed choice overlay rises.
//     The room votes in real time; when the timer hits zero, the leading
//     branch becomes canonical and the cut continues.
//   - Below the stage: timeline w/ four fork markers, live chat, vote tally.
//   - The market is a real lobby. Multiple films, each w/ # currently
//     watching, next fork ETA, leading branch live.

const { useState: usBr, useEffect: ueBr, useMemo: umBr, useRef: urBr } = React;

// ─── Data ────────────────────────────────────────────────────────────────
// Three films, each with 4 forks. Synthesized but consistent.

function buildForks(spec, totalMin) {
  return spec.map((f, i) => ({
    ...f,
    timecodeStart: minToTC(f.atMinute),
  }));
}
function minToTC(m) {
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  const s = Math.floor((m % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const BRANCH_FILMS = {
  frequency: {
    filmId: "frequency",
    title: "Frequency 88.6",
    director: "Tao Reng",
    directorInitials: "TR",
    accentColor: tkc("amber"),
    poster: "frequency",
    totalRuntimeMin: 98,
    totalCuts: 81,
    roomSize: 2840,
    lobbyBlurb: "She tunes a dead transmitter and answers something on the other side. Four forks decide what she does, who she becomes, and what the signal turns into.",
    genre: ["Sci-fi", "Slow burn"],
    rating: 4.3,
    yourCutAtMinute: 0,
    forks: [
      { id: "f1", actLabel: "ACT I", actNum: "01", atMinute: 12, heading: "She finds the booth.",
        setup: "Esme arrives at the abandoned transmitter at the top of the hill. The console is warm. A voice says her name.",
        question: "What does she do?",
        options: [
          { id: "ignore", glyph: "□", title: "Walk away", beat: "She kills the lights and shuts the door.", tone: "near-silent · 4m", color: tkc("ink-3"), votes: 421 },
          { id: "enter", glyph: "◆", title: "Sit at the console", beat: "She lowers the headphones and answers the voice.", tone: "score-forward · 7m", color: "var(--c-amber)", votes: 1844 },
          { id: "record", glyph: "△", title: "Run tape", beat: "She loads a reel and captures the signal alone.", tone: "tape hiss · 5m", color: tkc("cat-1"), votes: 575 },
        ],
      },
      { id: "f2", actLabel: "ACT II", actNum: "02", atMinute: 38, heading: "The voice asks for a name.",
        setup: "Three weeks into the broadcast. The voice on the other end is gentler, more specific. It wants someone in particular.",
        question: "What name does she give?",
        options: [
          { id: "hers", glyph: "●", title: "Her own", beat: "She speaks her name into the dark.", tone: "intimate · 6m", color: "var(--c-amber)", votes: 1402 },
          { id: "sister", glyph: "■", title: "Her sister's", beat: "She names the dead, hoping for a reply.", tone: "elegiac · 8m", color: tkc("bad"), votes: 1024 },
          { id: "stranger", glyph: "▲", title: "A stranger's", beat: "She invents a person who never existed.", tone: "uncanny · 7m", color: tkc("cat-2"), votes: 414 },
        ],
      },
      { id: "f3", actLabel: "ACT III", actNum: "03", atMinute: 65, heading: "Someone is at the door.",
        setup: "A car climbs the access road at 3am. Headlights wash the booth windows. The voice falls silent for the first time.",
        question: "Who is it?",
        options: [
          { id: "father", glyph: "▣", title: "Her father", beat: "The man who taught her radios. Nine years apart.", tone: "wide-shot · 10m", color: tkc("cat-4"), votes: 988 },
          { id: "cop", glyph: "◉", title: "A patrolman", beat: "Someone reported the transmitter. Procedural.", tone: "deadpan · 6m", color: tkc("ink-3"), votes: 612 },
          { id: "her", glyph: "❍", title: "Herself", beat: "Esme stepping out of the car. Same coat. Same face.", tone: "long-take · 11m", color: "var(--c-amber)", votes: 1240 },
        ],
      },
      { id: "f4", actLabel: "FINALE", actNum: "04", atMinute: 88, heading: "The choice.",
        setup: "One more transmission. Static, signal, or silence.",
        question: "How does it end?",
        options: [
          { id: "static", glyph: "■", title: "Static", beat: "She pulls the breaker. The transmitter dies.", tone: "ambient · score-out", color: tkc("cat-1"), votes: 1102, runtime: "8m 14s" },
          { id: "signal", glyph: "▲", title: "Signal", beat: "She speaks into the mic. The message goes through.", tone: "score-forward · vocal", color: "var(--c-amber)", votes: 1481, runtime: "11m 02s", leading: true },
          { id: "silence", glyph: "●", title: "Silence", beat: "She puts the headphones on. There is no other side.", tone: "near-silent", color: tkc("cat-2"), votes: 762, runtime: "9m 48s" },
        ],
      },
    ],
    chatSeed: [
      { who: "@maela",     text: "the room is locked in tonight",                                color: "var(--c-amber)" },
      { who: "@orin",      text: "absolutely losing it at the booth scene",                       color: tkc("bad") },
      { who: "@bex",       text: "ack i picked record and now i regret it",                       color: tkc("cat-2") },
      { who: "@p_chen",    text: "static is the only one that respects the silence",              color: tkc("cat-1") },
      { who: "@a_kindt",   text: "if signal wins again im rioting",                               color: "var(--c-amber)" },
      { who: "@mosshouse", text: "ok the score-out version is so brave",                          color: tkc("cat-1") },
    ],
  },
  marauder: {
    filmId: "marauder",
    title: "Marauder",
    director: "Yara Kim",
    directorInitials: "YK",
    accentColor: tkc("bad"),
    poster: "marauder",
    totalRuntimeMin: 112,
    totalCuts: 81,
    roomSize: 1410,
    lobbyBlurb: "A salvage tug stumbles onto a derelict carrier. The crew is tired. The find is wrong. Four forks decide who lives, who lies, and what stays behind.",
    genre: ["Sci-fi", "Thriller"],
    rating: 4.5,
    forks: [
      { id: "f1", actLabel: "ACT I", actNum: "01", atMinute: 14, heading: "The carrier is hailing.", setup: "Their console answers a 14-year-old distress beacon. The signal is too clean.", question: "Do they answer?",
        options: [
          { id: "answer", glyph: "◆", title: "Answer it",   beat: "Captain authorizes the response.",          tone: "ensemble · 7m",  color: tkc("bad"), votes: 612 },
          { id: "log",    glyph: "□", title: "Log and pass",beat: "Forward the beacon to fleet, keep moving.", tone: "wide quiet · 4m", color: tkc("ink-3"), votes: 188 },
          { id: "board",  glyph: "▲", title: "Board it",    beat: "Suit up. Three on the away team.",          tone: "tense · 11m",     color: "var(--c-amber)", votes: 610 },
        ],
      },
      { id: "f2", actLabel: "ACT II", actNum: "02", atMinute: 44, heading: "The cargo manifest is short one body.", setup: "Twelve cryo pods. Eleven still sealed. One pried open from the inside.", question: "Who do they tell?",
        options: [
          { id: "crew",   glyph: "●", title: "The crew",     beat: "Full briefing. Vote on next steps.",     tone: "long-take · 9m", color: tkc("bad"), votes: 712 },
          { id: "captain",glyph: "■", title: "Captain only", beat: "Keep it tight. Avoid a panic.",          tone: "intimate · 6m",  color: "var(--c-amber)", votes: 480 },
          { id: "noone",  glyph: "▲", title: "No one",       beat: "Lock the bay. Lie on the manifest.",     tone: "uncanny · 8m",   color: tkc("cat-2"), votes: 218 },
        ],
      },
      { id: "f3", actLabel: "ACT III", actNum: "03", atMinute: 78, heading: "The thing comes back.", setup: "Something is using the air recyclers as corridors. It speaks Mandarin.", question: "How do they fight?",
        options: [
          { id: "vent",  glyph: "▣", title: "Vent the deck",     beat: "Cut power. Lose half the cargo.",          tone: "kinetic · 10m", color: "var(--c-amber)", votes: 560 },
          { id: "talk",  glyph: "◉", title: "Talk to it",         beat: "The captain remembers the name.",          tone: "still · 8m",    color: tkc("cat-1"), votes: 612 },
          { id: "burn",  glyph: "❍", title: "Burn the carrier",   beat: "Detach and torch from a safe orbit.",      tone: "wide · 12m",    color: tkc("bad"), votes: 238 },
        ],
      },
      { id: "f4", actLabel: "FINALE", actNum: "04", atMinute: 102, heading: "Who comes home.", setup: "Sole survivor at the cockpit. Three messages queued for fleet.", question: "Which one do they send?",
        options: [
          { id: "truth", glyph: "■", title: "The truth",       beat: "Full transcript. Names everything that happened.", tone: "long static take", color: tkc("bad"), votes: 502, runtime: "9m 50s", leading: true },
          { id: "lie",   glyph: "▲", title: "The lie",         beat: "Engine fire. Nothing worth investigating.",         tone: "score-forward",     color: "var(--c-amber)", votes: 388, runtime: "11m 10s" },
          { id: "silent",glyph: "●", title: "Nothing at all",  beat: "She turns off the comms and drifts.",              tone: "near-silent",       color: tkc("cat-2"), votes: 244, runtime: "12m 30s" },
        ],
      },
    ],
    chatSeed: [
      { who: "@mosshouse", text: "burn the carrier is a CRIME but here we are",     color: tkc("bad") },
      { who: "@v_arrow",   text: "captain only or we lose the cold open's tone",    color: "var(--c-amber)" },
      { who: "@ji_lin",    text: "WHY IS IT SPEAKING MANDARIN",                      color: tkc("cat-2") },
    ],
  },
  swallows: {
    filmId: "swallows",
    title: "The Swallows",
    director: "Yara Kim",
    directorInitials: "YK",
    accentColor: tkc("cat-1"),
    poster: "swallows",
    totalRuntimeMin: 134,
    totalCuts: 81,
    roomSize: 982,
    lobbyBlurb: "A diplomat returns to her grandfather's village to bury him and finds two letters in his coat. Four forks decide what she does with each.",
    genre: ["Drama", "Period"],
    rating: 4.7,
    forks: [
      { id: "f1", actLabel: "ACT I", actNum: "01", atMinute: 16, heading: "The two letters.", setup: "Sealed, never sent. The dates make her recalculate when her father was born.", question: "Open or burn?",
        options: [
          { id: "open",  glyph: "◆", title: "Open both",    beat: "She reads. The kitchen is very quiet.",      tone: "intimate · 7m",  color: tkc("cat-1"), votes: 720 },
          { id: "one",   glyph: "□", title: "Open only one",beat: "She picks the one with cleaner handwriting.",tone: "elegiac · 6m",   color: "var(--c-amber)", votes: 142 },
          { id: "burn",  glyph: "▲", title: "Burn both",    beat: "The stove still works. The smoke is thin.",  tone: "long-take · 10m",color: tkc("bad"), votes: 120 },
        ],
      },
      { id: "f2", actLabel: "ACT II", actNum: "02", atMinute: 48, heading: "The other woman.", setup: "She finds the address. The other woman is alive and 84. Living three towns over.", question: "Does she visit?",
        options: [
          { id: "visit", glyph: "●", title: "Yes",            beat: "She drives. The road has rain.",                     tone: "patient · 11m",  color: tkc("cat-1"), votes: 410 },
          { id: "write", glyph: "■", title: "Write instead",  beat: "Three drafts. None of them sent.",                   tone: "intimate · 7m",  color: "var(--c-amber)", votes: 360 },
          { id: "leave", glyph: "▲", title: "Leave it",       beat: "She returns to the embassy. The work covers her.",   tone: "deadpan · 8m",   color: tkc("cat-2"), votes: 212 },
        ],
      },
      { id: "f3", actLabel: "ACT III", actNum: "03", atMinute: 86, heading: "The brother on the porch.", setup: "He's been waiting. He's older than her father was. He has a key.", question: "Does she let him in?",
        options: [
          { id: "in",    glyph: "▣", title: "Let him in",     beat: "Tea. Quiet. Eventually the photo albums.",            tone: "long-take · 13m", color: tkc("cat-1"), votes: 380 },
          { id: "talk",  glyph: "◉", title: "Talk on the porch", beat: "Forty minutes. The sun moves.",                    tone: "wide quiet · 9m", color: "var(--c-amber)", votes: 340 },
          { id: "shut",  glyph: "❍", title: "Shut the door",    beat: "He leaves the key on the step.",                    tone: "near-silent · 5m",color: tkc("bad"), votes: 262 },
        ],
      },
      { id: "f4", actLabel: "FINALE", actNum: "04", atMinute: 124, heading: "The letter she writes.", setup: "She drafts one of her own. To herself, before she was born.", question: "Does she send it?",
        options: [
          { id: "yes",  glyph: "■", title: "Send",       beat: "She mails it. The address is a ruined post office.",   tone: "elegiac",      color: tkc("cat-1"), votes: 388, runtime: "10m 14s", leading: true },
          { id: "keep", glyph: "▲", title: "Keep",       beat: "She folds it into the coat she will not give away.",   tone: "intimate",     color: "var(--c-amber)", votes: 322, runtime: "9m 22s" },
          { id: "burn", glyph: "●", title: "Burn",       beat: "Same stove. The smoke is the same color.",             tone: "long-take",    color: tkc("bad"), votes: 280, runtime: "11m 02s" },
        ],
      },
    ],
    chatSeed: [
      { who: "@aurora",  text: "this director makes weather a character",    color: tkc("cat-1") },
      { who: "@quiet",   text: "the stove is going to come back i swear",     color: tkc("bad") },
      { who: "@laila",   text: "long-take wins again. yara never misses",     color: "var(--c-amber)" },
    ],
  },
};

function getBranchTree(filmId) { return BRANCH_FILMS[filmId] || null; }
function listBranchedFilms() { return Object.values(BRANCH_FILMS); }
const fmtPct = (n) => `${(n * 100).toFixed(0)}%`;

// ─── Procedural alive-frame for scenes between forks ─────────────────────
// Renders a continuously animating "now playing" image based on a film
// + time-of-show. Subtle parallax + drifting glow.
function LiveScene({ tree, elapsedSec, paused }) {
  const accent = tree.accentColor;
  const [pulse, setPulse] = usBr(0);
  ueBr(() => {
    if (paused) return;
    let raf;
    const tick = () => { setPulse(p => (p + 0.012) % (Math.PI * 2)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  // Pick a "shot" based on time-of-show
  const shotIdx = Math.floor(elapsedSec / 6) % 6;
  const drift = Math.sin(pulse) * 6;
  const drift2 = Math.cos(pulse * 0.7) * 4;
  const glowR = 110 + Math.sin(pulse * 1.2) * 18;

  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      background: tkc("void"),
    }}>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
        {/* Atmospheric backdrop */}
        <defs>
          <radialGradient id="ls-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.7"/>
            <stop offset="60%" stopColor={accent} stopOpacity="0.12"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="ls-h" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,.85)"/>
            <stop offset="40%" stopColor="rgba(0,0,0,.3)"/>
            <stop offset="60%" stopColor="rgba(0,0,0,.3)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,.95)"/>
          </linearGradient>
        </defs>
        {/* Distant horizon */}
        <rect x="0" y="0" width="1600" height="900" fill={`${accent}08`}/>
        <ellipse cx={800 + drift * 2} cy={460} rx={glowR * 4} ry={glowR * 0.8} fill="url(#ls-glow)"/>

        {/* Layered shapes per shot index */}
        {shotIdx === 0 && (
          <g>
            <rect x={580 + drift} y="380" width="440" height="200" fill={`${accent}16`} stroke={`${accent}55`} strokeWidth="1"/>
            <line x1="0" y1="582" x2="1600" y2="582" stroke={`${accent}33`} strokeWidth="1"/>
            <circle cx={800} cy={460} r={60} fill="none" stroke={accent} strokeWidth="1.2" opacity="0.7"/>
            <circle cx={800} cy={460} r={28} fill={accent} fillOpacity="0.3"/>
          </g>
        )}
        {shotIdx === 1 && (
          <g>
            <line x1="40" y1={440 + drift} x2="1560" y2={440 + drift2} stroke={`${accent}88`} strokeWidth="1.5"/>
            <line x1="40" y1={460 + drift2} x2="1560" y2={460 - drift} stroke={`${accent}44`} strokeWidth="0.6"/>
            <rect x={700} y={420} width="200" height="60" fill="rgba(0,0,0,.4)" stroke={`${accent}88`} strokeWidth="1"/>
            <text x="800" y="455" textAnchor="middle" fill={accent} fontSize="14" fontFamily="JetBrains Mono" letterSpacing="6">88.6 MHz</text>
          </g>
        )}
        {shotIdx === 2 && (
          <g>
            {Array.from({ length: 80 }).map((_, k) => (
              <rect key={k} x={(k * 47 + Math.floor(pulse * 100)) % 1600} y={k * 11 % 900} width="2" height="1" fill={accent} opacity={0.2 + (k % 5) * 0.12}/>
            ))}
            <line x1="0" y1="450" x2="1600" y2="450" stroke={`${accent}55`} strokeWidth="0.5"/>
          </g>
        )}
        {shotIdx === 3 && (
          <g>
            <polygon points={`${600 + drift},${300} ${1000 - drift},${300} ${1100},${600} ${500},${600}`} fill={`${accent}1a`} stroke={`${accent}77`} strokeWidth="1.2"/>
            <polygon points={`${700},${380} ${900},${380} ${950},${540} ${650},${540}`} fill="rgba(0,0,0,.5)" stroke={`${accent}55`} strokeWidth="0.8"/>
          </g>
        )}
        {shotIdx === 4 && (
          <g>
            <circle cx={800 + drift * 3} cy={440 + drift2} r={140} fill="none" stroke={`${accent}55`} strokeWidth="1.2"/>
            <circle cx={800 + drift * 3} cy={440 + drift2} r={80} fill="none" stroke={`${accent}88`} strokeWidth="1.4"/>
            <circle cx={800 + drift * 3} cy={440 + drift2} r={28} fill={accent} fillOpacity="0.7"/>
          </g>
        )}
        {shotIdx === 5 && (
          <g>
            <rect x="40" y="40" width="1520" height="820" fill="none" stroke={`${accent}33`} strokeWidth="0.6"/>
            <rect x="120" y="120" width="1360" height="660" fill="none" stroke={`${accent}66`} strokeWidth="0.8"/>
            <rect x="280" y="280" width="1040" height="340" fill={`${accent}10`} stroke={accent} strokeWidth="1.2"/>
            <text x="800" y="470" textAnchor="middle" fill="rgba(255,255,255,.85)" fontFamily="Fraunces" fontSize="80" fontStyle="italic">Static.</text>
          </g>
        )}

        {/* Letterboxing */}
        <rect x="0" y="0" width="1600" height="900" fill="url(#ls-h)"/>
        <rect x="0" y="0" width="1600" height="58" fill={tkc("black")}/>
        <rect x="0" y="842" width="1600" height="58" fill={tkc("black")}/>
      </svg>

      {/* Grain */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
        opacity: paused ? 0.3 : 0.7,
        pointerEvents: "none",
      }}/>
    </div>
  );
}

// ─── Market / lobby ──────────────────────────────────────────────────────
function BranchedMarket() {
  const films = listBranchedFilms();
  const [now, setNow] = usBr(Date.now());
  ueBr(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // Synthesize "next fork in X" using time-of-day for stable display
  const filmsWithETA = umBr(() => {
    return films.map(f => {
      const seed = (f.filmId.charCodeAt(0) + f.filmId.length * 7) % 240;
      const cycleSec = 180 + seed; // 3-7m cycles
      const inCycle = Math.floor(now / 1000) % cycleSec;
      const remaining = cycleSec - inCycle;
      const inForkWindow = remaining < 30;
      const leading = f.forks[Math.floor((now / 1000 / cycleSec)) % f.forks.length];
      const leadingOpt = leading.options.find(o => o.leading) || leading.options[0];
      return { ...f, nextForkInSec: remaining, inForkWindow, leadingFork: leading, leadingOpt };
    });
  }, [films, now]);

  return (
    <div style={{ background: "var(--c-bg)", color: "var(--c-ink)", minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{
        padding: "56px var(--gutter) 36px", borderBottom: "1px solid var(--c-line)",
        background: "radial-gradient(ellipse at 20% 0%, rgba(var(--accent-rgb),.06) 0%, transparent 70%), var(--c-bg)",
      }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 8px var(--c-blood-l)", animation: "bcLive 1.4s infinite" }}/>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-blood-l)", fontWeight: 700, textTransform: "uppercase" }}>
              BRANCHED CINEMA · {filmsWithETA.reduce((s, f) => s + f.roomSize, 0).toLocaleString()} WATCHING
            </span>
          </div>
          <h1 style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontWeight: 400, fontSize: "var(--fs-display)", lineHeight: 0.96,
            margin: 0, letterSpacing: "-0.02em", maxWidth: 980,
            textWrap: "balance",
          }}>
            Pick a room. <em style={{ color: "var(--c-amber)" }}>Watch together.</em><br/>
            Vote at every fork.
          </h1>
          <p style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.5,
            color: "var(--c-ink-2)", maxWidth: 660,
            margin: "20px 0 0",
          }}>
            Every Branched film plays continuously on Cina. Drop in any time — at the next fork, the room votes; the leading branch is the canonical cut.
            Your own picks are saved as a personal alt.
          </p>
        </div>
      </section>

      {/* Now showing */}
      <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "36px var(--gutter) 80px" }}>
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20,
        }}>
          <h2 style={{
            margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic",
            fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.01em",
          }}>Now showing</h2>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>
            {filmsWithETA.length} ROOMS · LIVE
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 18 }}>
          {filmsWithETA.map(f => <RoomCard key={f.filmId} film={f}/>)}
        </div>

        {/* How it works */}
        <section style={{ marginTop: 64, padding: 32, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderLeft: "2px solid var(--c-amber)", borderRadius: "var(--r-2)" }}>
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
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", fontWeight: 700, letterSpacing: ".16em", flexShrink: 0, paddingTop: 2 }}>{s.n}</span>
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 }}>{s.h}</div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 4 }}>{s.b}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <style>{`
        @keyframes bcLive { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  );
}

function RoomCard({ film }) {
  const m = Math.floor(film.nextForkInSec / 60);
  const s = film.nextForkInSec % 60;
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
      {/* Live still */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "var(--c-void)" }}>
        <LiveScene tree={film} elapsedSec={Math.floor(Date.now() / 1000)} paused={false}/>
        {/* LIVE chip */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          display: "flex", alignItems: "center", gap: 6,
          padding: "4px 10px", background: "rgba(201,85,72,.18)",
          border: "1px solid rgba(201,85,72,.5)", borderRadius: "var(--r-1)",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: "0 0 4px var(--c-blood-l)", animation: "bcLive 1.4s infinite" }}/>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-blood-l)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>LIVE</span>
        </div>
        {/* Watching */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "4px 8px", background: "rgba(0,0,0,.65)",
          border: "1px solid rgba(255,255,255,.12)", borderRadius: "var(--r-1)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"),
          letterSpacing: ".16em",
        }}>{film.roomSize.toLocaleString()} watching</div>
        {/* Fork countdown overlay */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "14px 16px",
          background: "linear-gradient(180deg, transparent, rgba(8,8,10,.95))",
          color: tkc("white"),
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: film.accentColor, letterSpacing: ".16em", fontWeight: 700, marginBottom: 4 }}>
                {film.inForkWindow ? "FORK IN" : "NEXT FORK"}
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)", color: tkc("white"), fontWeight: 500, lineHeight: 1 }}>
                {m}:{String(s).padStart(2, "0")}
              </div>
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

      {/* Card body */}
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
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
          marginTop: 10, padding: "14px 16px",
          background: film.accentColor, color: "var(--c-void)",
          borderRadius: "var(--r-2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
          boxShadow: `0 4px 16px ${film.accentColor}33`,
          transition: "transform .14s ease, box-shadow .14s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${film.accentColor}55`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${film.accentColor}33`; }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "var(--r-1)", background: "var(--c-void)", animation: "bcLive 1.4s infinite" }}/>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>JOIN THE ROOM</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.7, letterSpacing: ".16em", marginTop: 2, textTransform: "uppercase" }}>WATCHING LIVE · {film.roomSize.toLocaleString()} HOLDERS</div>
            </div>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-lead)", fontWeight: 700 }}>→</span>
        </div>
      </div>
    </button>
  );
}

// ─── Viewer: the cinema-mode page ────────────────────────────────────────
function BranchedViewer({ filmId }) {
  const tree = getBranchTree(filmId);
  if (!tree) return <BranchedMarket/>;

  // Continuous "scene clock" — auto advances; pauses on fork
  const [elapsed, setElapsed] = usBr(tree.yourCutAtMinute * 60 || 0); // seconds
  const [paused, setPaused] = usBr(false);
  const [picks, setPicks] = usBr([null, null, null, null]);
  const [forkOverlayOpen, setForkOverlayOpen] = usBr(false);
  const [activeForkIdx, setActiveForkIdx] = usBr(0);
  const [chatLog, setChatLog] = usBr(() => tree.chatSeed.slice());
  const [forkCountdown, setForkCountdown] = usBr(90); // sec
  const [showAllPicked, setShowAllPicked] = usBr(false);
  const [resultPreview, setResultPreview] = usBr(null); // { forkIdx, pickedId, auto }

  // Time tick — 1 stage-second every 1 real-second.
  ueBr(() => {
    if (paused || forkOverlayOpen || resultPreview) return;
    const id = setInterval(() => setElapsed(e => Math.min(e + 1, tree.totalRuntimeMin * 60)), 1000);
    return () => clearInterval(id);
  }, [paused, forkOverlayOpen, resultPreview, tree]);

  // Check if we've crossed into a fork zone
  ueBr(() => {
    const min = elapsed / 60;
    for (let i = 0; i < tree.forks.length; i++) {
      const f = tree.forks[i];
      if (Math.abs(min - f.atMinute) < 0.1 && !picks[i] && !forkOverlayOpen) {
        setActiveForkIdx(i);
        setForkOverlayOpen(true);
        setForkCountdown(90);
        return;
      }
    }
  }, [elapsed, picks, forkOverlayOpen, tree]);

  // Fork countdown
  ueBr(() => {
    if (!forkOverlayOpen) return;
    const id = setInterval(() => {
      setForkCountdown(c => {
        if (c <= 1) {
          // Auto-pick the leading option
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

  // Synth chat
  ueBr(() => {
    const id = setInterval(() => {
      setChatLog(log => {
        const handles = ["@maela", "@orin", "@bex", "@p_chen", "@a_kindt", "@mosshouse", "@quiet", "@v_arrow", "@ji_lin"];
        const lines = [
          "this scene", "look at the lighting", "im not ok", "the score!", "ok this is it",
          "PEAK CINEMA", "we are in it", "watching with my mom", "every fork has been correct",
        ];
        const next = {
          who: handles[Math.floor(Math.random() * handles.length)],
          text: lines[Math.floor(Math.random() * lines.length)],
          color: ["var(--c-amber)", tkc("cat-1"), tkc("bad"), tkc("cat-2")][Math.floor(Math.random() * 4)],
        };
        return [...log.slice(-40), next];
      });
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const submitPick = (id, auto = false) => {
    const fork = tree.forks[activeForkIdx];
    const next = [...picks];
    next[activeForkIdx] = id;
    setPicks(next);
    setForkOverlayOpen(false);
    setForkCountdown(90);

    // Show result preview for 3.6s before continuing
    setResultPreview({ forkIdx: activeForkIdx, pickedId: id, auto });
    setTimeout(() => {
      setResultPreview(null);
      // Bump elapsed slightly so we don't re-trigger
      setElapsed(e => e + 6);
      if (next.every(Boolean)) setShowAllPicked(true);
    }, 3600);

    const opt = fork.options.find(o => o.id === id);
    if (window.toast) {
      window.toast({
        title: auto ? `${fork.actLabel} CANONICAL` : `${fork.actLabel} LOCKED`,
        text: `${opt.title} · ${auto ? "room consensus" : "your cut"}`,
        kind: "good",
      });
    }
  };

  const tcSec = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };
  const totalSec = tree.totalRuntimeMin * 60;

  return (
    <div style={{ background: tkc("black"), color: tkc("white"), minHeight: "100vh" }}>
      {/* Cinema stage */}
      <section style={{ position: "relative" }}>
        <div style={{
          position: "relative", width: "100%", aspectRatio: "21/9",
          background: tkc("black"), overflow: "hidden",
        }}>
          <LiveScene tree={tree} elapsedSec={elapsed} paused={paused}/>

          {/* Top chrome */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            padding: "20px 28px",
            display: "flex", alignItems: "center", gap: 14,
            background: "linear-gradient(180deg, rgba(0,0,0,.7) 0%, transparent 100%)",
          }}>
            <a href="#/branches" onClick={(e) => { e.preventDefault(); navigate("/branches"); }} style={{
              padding: "6px 10px", background: "rgba(0,0,0,.5)",
              border: "1px solid rgba(255,255,255,.15)", borderRadius: "var(--r-1)",
              color: "rgba(255,255,255,.85)", textDecoration: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              textTransform: "uppercase",
            }}>← All rooms</a>
            <div style={{ flex: 1 }}/>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)", letterSpacing: ".16em" }}>
              {tree.director.toUpperCase()} · {tree.title.toUpperCase()}
            </span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,.2)" }}/>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor, letterSpacing: ".16em", fontWeight: 700 }}>
              ● LIVE · {tree.roomSize.toLocaleString()}
            </span>
          </div>

          {/* Fork overlay */}
          {forkOverlayOpen && (
            <ForkOverlay
              tree={tree}
              fork={tree.forks[activeForkIdx]}
              countdown={forkCountdown}
              onPick={(id) => submitPick(id, false)}
            />
          )}

          {/* Result preview — shown for ~3.6s after a pick / auto-pick */}
          {resultPreview && (
            <ResultPreview
              tree={tree}
              fork={tree.forks[resultPreview.forkIdx]}
              pickedId={resultPreview.pickedId}
              auto={resultPreview.auto}
              onSkip={() => { setResultPreview(null); setElapsed(e => e + 6); if (picks.every(Boolean)) setShowAllPicked(true); }}
            />
          )}

          {/* Bottom chrome — when not in fork */}
          {!forkOverlayOpen && (
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              padding: "0 28px 22px",
              background: "linear-gradient(0deg, rgba(0,0,0,.85) 0%, transparent 100%)",
            }}>
              {/* Scene chyron */}
              <div style={{ marginBottom: 14, color: tkc("white") }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor, letterSpacing: ".16em", marginBottom: 4, fontWeight: 700 }}>
                  {tcSec(elapsed)} / {tcSec(totalSec)}{(() => {
                    const upcoming = tree.forks.find((f, i) => !picks[i] && f.atMinute * 60 > elapsed);
                    if (!upcoming) return null;
                    const eta = Math.floor(upcoming.atMinute * 60 - elapsed);
                    const m = Math.floor(eta / 60), s = eta % 60;
                    return ` · NEXT FORK IN ${m}:${String(s).padStart(2, "0")}`;
                  })()}
                </div>
              </div>

              {/* Progress + fork markers */}
              <div style={{ position: "relative", height: 36 }}>
                <div style={{
                  position: "absolute", left: 0, right: 0, top: 16, height: 4,
                  background: "rgba(255,255,255,.15)", borderRadius: "var(--r-1)",
                }}/>
                <div style={{
                  position: "absolute", left: 0, top: 16, height: 4,
                  width: `${(elapsed / totalSec) * 100}%`,
                  background: tree.accentColor,
                  borderRadius: "var(--r-1)",
                  boxShadow: `0 0 12px ${tree.accentColor}`,
                  transition: "width .3s linear",
                }}/>
                {/* Fork markers */}
                {tree.forks.map((f, i) => {
                  const pct = (f.atMinute / tree.totalRuntimeMin) * 100;
                  const picked = picks[i];
                  const pickedOpt = picked ? f.options.find(o => o.id === picked) : null;
                  const reached = elapsed >= f.atMinute * 60 || picked;
                  return (
                    <div key={f.id} style={{
                      position: "absolute", left: `${pct}%`, top: 10,
                      width: 18, height: 18, marginLeft: -9, borderRadius: "50%",
                      background: pickedOpt ? pickedOpt.color : reached ? tree.accentColor : tkc("panel-2"),
                      border: `2px solid ${reached ? tkc("white") : "rgba(255,255,255,.4)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                      color: pickedOpt ? tkc("void") : reached ? tkc("on-amber") : "var(--c-ink-3)",
                    }}>{f.actNum}</div>
                  );
                })}
                {/* Playhead */}
                <div style={{
                  position: "absolute", left: `${(elapsed / totalSec) * 100}%`,
                  top: 8, width: 2, height: 20, marginLeft: -1, background: tkc("white"),
                  boxShadow: "0 0 10px rgba(255,255,255,.6)",
                }}/>
              </div>

              {/* Controls row */}
              <div style={{
                marginTop: 6, display: "flex", alignItems: "center", gap: 12,
              }}>
                <button onClick={() => setPaused(p => !p)} style={{
                  width: 34, height: 34, background: tree.accentColor, color: "var(--c-void)",
                  border: "none", borderRadius: "var(--r-3)", cursor: "pointer", fontSize: "var(--fs-body)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{paused ? "▶" : "▮▮"}</button>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.6)", letterSpacing: ".08em" }}>
                  {paused ? "PAUSED" : "PLAYING · 21:9 · 4K HDR · CINA DOLBY ATMOS"}
                </span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)", letterSpacing: ".16em" }}>
                  YOU · {picks.filter(Boolean).length}/4 FORKS PICKED
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Below the stage */}
      <section style={{ background: "var(--c-bg)", padding: "28px var(--gutter) 64px" }}>
        <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "flex-start" }}>
          {/* Fork map */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor, letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase" }}>YOUR PATH</span>
              <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, letterSpacing: "-0.01em" }}>The four forks</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {tree.forks.map((f, i) => {
                const picked = picks[i];
                const pickedOpt = picked ? f.options.find(o => o.id === picked) : null;
                const isCurrent = !picked && Math.floor(elapsed / 60) >= f.atMinute - 1;
                return (
                  <div key={f.id} style={{
                    padding: 16,
                    background: pickedOpt ? `${pickedOpt.color}10` : "var(--c-panel)",
                    border: `1px solid ${pickedOpt ? pickedOpt.color : isCurrent ? tree.accentColor : "var(--c-line)"}`,
                    borderRadius: "var(--r-2)",
                    display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    <div style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                      letterSpacing: ".16em", color: pickedOpt ? pickedOpt.color : isCurrent ? tree.accentColor : "var(--c-ink-3)",
                      textTransform: "uppercase", fontWeight: 600,
                    }}>{f.actLabel} · {f.atMinute}M</div>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{f.heading}</div>
                    {pickedOpt ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: pickedOpt.color }}>{pickedOpt.glyph}</span>
                        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)" }}>{pickedOpt.title}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "auto" }}>{isCurrent ? "Voting now…" : "Not reached"}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* My cut summary */}
            {showAllPicked && (
              <div style={{
                marginTop: 22, padding: 26,
                background: `linear-gradient(135deg, ${tree.accentColor}12 0%, var(--c-panel) 70%)`,
                border: `1px solid ${tree.accentColor}`, borderRadius: "var(--r-2)",
                display: "flex", alignItems: "center", gap: 22,
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {picks.map((id, i) => {
                    const opt = tree.forks[i].options.find(o => o.id === id);
                    return (
                      <div key={i} style={{
                        width: 44, height: 44, borderRadius: "var(--r-1)",
                        background: `linear-gradient(135deg, ${opt.color}50 0%, ${tkc("void")} 100%)`,
                        border: `1px solid ${opt.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--f-display)", fontStyle: "italic",
                        fontSize: "var(--fs-title)", color: opt.color, fontWeight: 500,
                      }}>{opt.glyph}</div>
                    );
                  })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor, letterSpacing: ".16em", fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>YOUR CUT · 1 OF {tree.totalCuts}</div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
                    {picks.map((id, i) => tree.forks[i].options.find(o => o.id === id).title).join(" → ")}
                  </div>
                </div>
                <button onClick={() => { setPicks([null, null, null, null]); setShowAllPicked(false); setElapsed(0); }} style={{
                  padding: "10px 18px", background: tree.accentColor, color: "var(--c-void)",
                  border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                }}>Watch a different cut →</button>
              </div>
            )}
          </div>

          {/* Side: live chat + room */}
          <aside style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Room stats */}
            <div style={{ padding: 16, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${tree.accentColor} 0%, ${tree.accentColor}55 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: tkc("white"),
                }}>{tree.directorInitials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{tree.director}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2, textTransform: "uppercase" }}>Director · in room</div>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", flexDirection: "column", height: 360, overflow: "hidden" }}>
              <div style={{
                padding: "10px 14px", borderBottom: "1px solid var(--c-line)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 4px var(--c-good)" }}/>
                <span>LIVE CHAT · {tree.roomSize.toLocaleString()}</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                {chatLog.slice(-30).map((m, i) => (
                  <div key={i} style={{ fontSize: "var(--fs-body)", lineHeight: 1.4 }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: m.color, marginRight: 6, fontWeight: 600 }}>{m.who}</span>
                    <span style={{ color: "var(--c-ink-2)" }}>{m.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: 10, borderTop: "1px solid var(--c-line)", display: "flex", gap: 6 }}>
                <input placeholder="Say something to the room…" style={{
                  flex: 1, padding: "8px 11px",
                  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                  borderRadius: "var(--r-1)", color: "var(--c-ink)", outline: "none",
                  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
                }}/>
                <button style={{
                  padding: "8px 14px", background: tree.accentColor, color: "var(--c-void)",
                  border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                }} onClick={() => window.toast && toast({ title: "SENT", text: "Your message is in the room.", kind: "good" })}>SEND </button>
              </div>
            </div>

            {/* Become a holder (upsell to PayDrawer if available) */}
            <div style={{
              padding: 18, background: `linear-gradient(135deg, ${tree.accentColor}10 0%, var(--c-panel) 70%)`,
              border: `1px solid ${tree.accentColor}40`, borderRadius: "var(--r-2)",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tree.accentColor, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>HOLDER PERK</div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.3 }}>Vote 5× · unlock all {tree.totalCuts} cuts.</div>
              {typeof window.OwnThisForkButton === "function" && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <window.OwnThisForkButton tree={tree}/>
                  <button onClick={() => navigate(`/cuts/${tree.filmId}`)} style={{
                    appearance: "none", cursor: "pointer", padding: "8px 14px", borderRadius: "var(--r-2)",
                    background: "transparent", border: "1px solid var(--c-line-3)", color: "var(--c-ink-2)",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                  }}>RENT ANOTHER CUT</button>
                </div>
              )}
              <button onClick={() => window.openPay && window.openPay({
                kind: "nft", title: `${tree.title} · Producer`, subtitle: tree.director,
                accent: tree.accentColor, priceUSD: 320,
                image: { kind: tree.poster, color: tree.accentColor },
                perks: ["5× vote weight in every Branched film", "All 81 cuts unlocked", "Director room afterparty access", "Quarterly royalty on Watch revenue"],
                ticketUrl: `/branches/${tree.filmId}`,
              })} style={{
                marginTop: 12, width: "100%", padding: "10px 14px",
                background: tree.accentColor, color: "var(--c-void)",
                border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>Back this film · $320</button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

// ─── Fork overlay (full-bleed at fork moment) ────────────────────────────
function ForkOverlay({ tree, fork, countdown, onPick }) {
  const total = fork.options.reduce((s, o) => s + o.votes, 0);
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      background: "rgba(0,0,0,.86)", backdropFilter: "blur(10px)",
      display: "flex", flexDirection: "column",
      animation: "bcFadeIn .3s ease-out",
    }}>
      {/* Top bar */}
      <div style={{
        padding: "22px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
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

      {/* Setup */}
      <div style={{ padding: "0 28px 18px" }}>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.7)", lineHeight: 1.5, maxWidth: 720 }}>
          "{fork.setup}"
        </div>
      </div>

      {/* Three large choice cards */}
      <div style={{
        flex: 1, padding: "0 28px 28px",
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
      }}>
        {fork.options.map(opt => {
          const share = opt.votes / total;
          return (
            <button key={opt.id} onClick={() => onPick(opt.id)} style={{
              position: "relative",
              background: `linear-gradient(135deg, ${opt.color}30 0%, rgba(8,8,10,.85) 70%)`,
              border: `2px solid ${opt.color}`,
              borderRadius: "var(--r-2)", padding: "26px 26px 22px",
              cursor: "pointer", color: "inherit", textAlign: "left",
              display: "flex", flexDirection: "column", gap: 12, justifyContent: "space-between",
              transition: "transform .14s, box-shadow .14s",
              boxShadow: `0 0 0 0 ${opt.color}55`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 18px 44px ${opt.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 0 0 0 ${opt.color}55`; }}>
              <div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-display)", color: opt.color, fontWeight: 500, lineHeight: 1, marginBottom: 12,
                }}>{opt.glyph}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-head)", color: tkc("white"), fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 8,
                }}>{opt.title}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-lead)", color: "rgba(255,255,255,.78)", lineHeight: 1.4,
                }}>"{opt.beat}"</div>
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                  color: "rgba(255,255,255,.55)", textTransform: "uppercase",
                  marginBottom: 6,
                }}>{opt.tone}</div>
                {/* Vote bar */}
                <div style={{ height: 4, background: "rgba(255,255,255,.15)", borderRadius: "var(--r-1)", overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: `${share * 100}%`, height: "100%", background: opt.color, borderRadius: "var(--r-1)" }}/>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
                  <span style={{ color: opt.color, fontWeight: 600 }}>{fmtPct(share)} · {opt.votes.toLocaleString()} votes</span>
                  <span style={{ color: "rgba(255,255,255,.5)" }}>{opt.leading ? "LEADING" : ""}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes bcFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}

// ─── Result preview — shown after a vote closes ──────────────────────────
// Shows the winner with full vote breakdown for ~3.6s, then auto-dismisses.
// User can "skip ahead" to keep watching immediately.
function ResultPreview({ tree, fork, pickedId, auto, onSkip }) {
  const [progress, setProgress] = usBr(0); // 0 → 100 over 3.6s
  ueBr(() => {
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

  // Sort options by votes descending — winner first
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
      animation: "bcRevealIn .4s ease-out",
    }}>
      {/* Top bar */}
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
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
          textTransform: "uppercase",
        }}>Skip ahead →</button>
      </div>

      {/* Winner reveal */}
      <div style={{ padding: "12px 28px 22px", display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{
          width: 120, height: 120, flexShrink: 0,
          background: `linear-gradient(135deg, ${winner.color}60 0%, ${tkc("void")} 75%)`,
          border: `2px solid ${winner.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-display)",
          color: winner.color, fontWeight: 500, lineHeight: 1,
          boxShadow: `0 0 32px ${winner.color}50, 0 0 0 4px rgba(0,0,0,.4)`,
          animation: "bcWinnerPop .55s cubic-bezier(.2,.9,.3,1.2) both .15s",
        }}>{winner.glyph}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: winner.color,
            letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            marginBottom: 6,
          }}>CANONICAL CUT · {fmtPct(winner.votes / totalVotes)}</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-display)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em",
            color: tkc("white"), marginBottom: 8, textWrap: "balance",
          }}>{winner.title}</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-lead)", lineHeight: 1.4, color: "rgba(255,255,255,.7)", maxWidth: 720,
          }}>"{winner.beat}" <span style={{ fontFamily: "var(--f-mono)", fontStyle: "normal", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.45)", letterSpacing: ".16em", textTransform: "uppercase", marginLeft: 8 }}>{winner.tone}</span></div>
        </div>
      </div>

      {/* Full vote breakdown */}
      <div style={{ padding: "12px 28px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)",
          letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 4,
        }}>Final tally</div>
        {sorted.map((opt, i) => {
          const share = opt.votes / totalVotes;
          const isWinner = i === 0;
          const isYours = opt.id === pickedId;
          return (
            <div key={opt.id} style={{
              display: "grid", gridTemplateColumns: "32px 1fr auto",
              alignItems: "center", gap: 14,
              animation: `bcRowIn .45s ease-out both ${.25 + i * .08}s`,
            }}>
              <div style={{
                fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)",
                color: opt.color, lineHeight: 1, textAlign: "center",
              }}>{opt.glyph}</div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic",
                    fontSize: "var(--fs-lead)", color: isWinner ? tkc("white") : "rgba(255,255,255,.65)",
                    fontWeight: isWinner ? 500 : 400, letterSpacing: "-0.01em",
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
                    }}>YOUR PICK · SAVED TO YOUR CUT</span>
                  )}
                  {isYours && isWinner && (
                    <span style={{
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-good)",
                      letterSpacing: ".16em", fontWeight: 700, padding: "1px 6px",
                      border: "1px solid var(--c-good)", borderRadius: "var(--r-1)",
                    }}>YOU PICKED THIS</span>
                  )}
                </div>
                <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,.08)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${share * 100}%`,
                    background: opt.color, borderRadius: "var(--r-1)",
                    boxShadow: isWinner ? `0 0 12px ${opt.color}` : "none",
                    animation: `bcBarFill .9s cubic-bezier(.2,.7,.2,1) both ${.3 + i * .08}s`,
                    transformOrigin: "left",
                  }}/>
                </div>
              </div>
              <div style={{
                fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums",
                fontSize: "var(--fs-body)", fontWeight: 700,
                color: isWinner ? tkc("white") : "rgba(255,255,255,.55)",
                letterSpacing: ".08em", textAlign: "right", minWidth: 88,
              }}>{fmtPct(share)}<span style={{ fontSize: "var(--fs-label)", fontWeight: 500, color: "rgba(255,255,255,.4)", marginLeft: 6 }}>{opt.votes.toLocaleString()}</span></div>
            </div>
          );
        })}
      </div>

      {/* Bottom: status + auto-continue progress */}
      <div style={{ marginTop: "auto", padding: "0 28px 18px" }}>
        {!userMatchedWinner && userPicked && (
          <div style={{
            padding: "12px 16px", marginBottom: 12,
            background: `linear-gradient(90deg, ${userPicked.color}20 0%, transparent 100%)`,
            borderLeft: `2px solid ${userPicked.color}`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)",
              color: userPicked.color, lineHeight: 1,
            }}>{userPicked.glyph}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: userPicked.color,
                letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase", marginBottom: 2,
              }}>YOUR PICK · "{userPicked.title}"</div>
              <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.7)" }}>
                Saved to your personal cut. The room watches "{winner.title}" — your version stays in your library.
              </div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,.1)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: tree.accentColor, transition: "width .1s linear",
            }}/>
          </div>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.5)",
            letterSpacing: ".16em", textTransform: "uppercase",
          }}>{auto ? "Room consensus · resuming" : "Continuing"} · {Math.max(0, Math.ceil((100 - progress) * 0.036))}s</span>
        </div>
      </div>

      <style>{`
        @keyframes bcRevealIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bcWinnerPop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes bcRowIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bcBarFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>
    </div>
  );
}

// ─── Compatibility export: BranchedFilmPage routes to market or viewer ──
function BranchedFilmPage({ filmId }) {
  if (!filmId || filmId === "" || !BRANCH_FILMS[filmId]) return <BranchedMarket/>;
  return <BranchedViewer filmId={filmId}/>;
}

window.BranchedFilmPage = BranchedFilmPage;
window.BranchedLiveScene = LiveScene;
window.BRANCH_FILMS = BRANCH_FILMS;
// Mark catalog films that have a live branch tree so heroes, cards, and the
// genre pages label + route them as Branched. (Series keep their series
// identity — their rooms are still reachable from the Branched shelves.)
(window.CATALOG || []).forEach(f => { if (BRANCH_FILMS[f.id] && f.kind !== "series") f.branched = true; });
window._branch_fmtPct = fmtPct;
window.listBranchedFilms = listBranchedFilms;
