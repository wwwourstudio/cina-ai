// watch-cast.jsx — Cast catalog + Actor profile page on Watch.
// AI-generated performers get names, personas, filmographies. Click any name on a film page
// to land on their profile.

const { useState: usc, useEffect: uec, useMemo: umc, useRef: urc } = React;

// ─── Cast catalog ──────────────────────────────────────────────────────
// Each actor is a synthetic performer. They have a face (rendered procedurally),
// a persona, signature roles, and a filmography across our CATALOG.

const CAST = [
  {
    id: "nadya-ash",
    photo: "assets/cast/nadya-ash.png",
    name: "Nadya Ash",
    handle: "@nadya.ash",
    born: "Synthesized 2024",
    range: "Drama · Noir · Slow burn",
    bio: "A close-up specialist. Built for stillness. Reads three emotions in a single held breath.",
    archetype: "The Watcher",
    height: "5'7\"", presence: "Grounded · Held",
    voice: "Mezzo · Smoke",
    languages: ["English", "Russian"],
    palette: [tkc("cat-3"), tkc("on-amber"), tkc("amber-x")],
    seed: 42,
    skin: tkc("ink-2"), hair: tkc("on-amber"), hairStyle: "long-wave", eyes: tkc("line-3"), lipColor: tkc("blood"),
    appearances: 7,
    followers: 84_200,
    awards: ["Letterbox Best Lead Performance, 2025"],
    roles: [
      { filmId: "ll", as: "Nadya Voss", lead: true, episodes: 8 },
      { filmId: "swallows", as: "Mira (eldest)", lead: false },
      { filmId: "salt", as: "Kit", lead: true },
      { filmId: "ghosting", as: "Vera", lead: false },
    ],
  },
  {
    id: "io-marsh",
    photo: "assets/cast/io-marsh.png",
    name: "Io Marsh",
    handle: "@io.marsh",
    born: "Synthesized 2024",
    range: "Sci-fi · Crew lead · Action",
    bio: "Captain energy. Carries weight in the shoulders. Reliable in zero-g.",
    archetype: "The Captain",
    height: "5'10\"", presence: "Steady · Wry",
    voice: "Alto · Gravel",
    languages: ["English", "Mandarin"],
    palette: [tkc("cat-6"), tkc("bg"), tkc("cat-1")],
    seed: 17,
    skin: tkc("ink-3"), hair: tkc("panel-3"), hairStyle: "short-crop", eyes: tkc("line-2"), lipColor: tkc("blood"),
    appearances: 5,
    followers: 142_000,
    awards: [],
    roles: [
      { filmId: "marauder", as: "Captain Io Marsh", lead: true, episodes: 14 },
      { filmId: "drift", as: "Comm officer Reni", lead: false },
      { filmId: "haul", as: "Driver — long route", lead: true },
      { filmId: "verge", as: "The fence", lead: false },
    ],
  },
  {
    id: "evren-koll",
    photo: "assets/cast/evren-koll.png",
    name: "Evren Koll",
    handle: "@evrenk",
    born: "Synthesized 2025",
    range: "Drama · Romance · Comedy",
    bio: "A face that holds a smile two seconds too long. Sentence is somewhere in there.",
    archetype: "The Almost-Sayer",
    height: "6'1\"", presence: "Soft · Lingering",
    voice: "Tenor · Warm",
    languages: ["English"],
    palette: [tkc("cat-5"), tkc("ink"), tkc("line-2")],
    seed: 88,
    skin: tkc("cat-4"), hair: tkc("line-3"), hairStyle: "tousled", eyes: tkc("ink-4"), lipColor: tkc("cat-3"),
    appearances: 6,
    followers: 96_000,
    awards: ["Cina Audience Award, 2025"],
    roles: [
      { filmId: "longhall", as: "August (older brother)", lead: true, episodes: 10 },
      { filmId: "after", as: "Pilot — flight 2", lead: true },
      { filmId: "tender", as: "Gabe (the cook)", lead: true },
      { filmId: "cardinal", as: "Father Idris", lead: false },
    ],
  },
  {
    id: "siri-vale",
    photo: "assets/cast/siri-vale.png",
    name: "Siri Vale",
    handle: "@sirivale",
    born: "Synthesized 2023",
    range: "Western · Drama · Period",
    bio: "Shoulders made for carrying weather. Speaks in the gaps.",
    archetype: "The Holder of Lines",
    height: "5'9\"", presence: "Weathered · Rooted",
    voice: "Alto · Salt",
    languages: ["English"],
    palette: [tkc("ink-3"), tkc("panel-2"), tkc("warn")],
    seed: 33,
    skin: tkc("ink-2"), hair: tkc("line-2"), hairStyle: "braid-back", eyes: tkc("line-2"), lipColor: tkc("blood"),
    appearances: 4,
    followers: 188_000,
    awards: ["Plains Festival Best Actress 2024", "Letterbox Top Performance 2025"],
    roles: [
      { filmId: "thefence", as: "Della (the widow)", lead: true },
      { filmId: "swallows", as: "Anya (middle)", lead: true },
      { filmId: "obsidian", as: "Scout — Lin", lead: true },
      { filmId: "anvil", as: "The blacksmith's daughter", lead: true },
    ],
  },
  {
    id: "rune-okafor",
    photo: "assets/cast/rune-okafor.png",
    name: "Rune Okafor",
    handle: "@rune",
    born: "Synthesized 2024",
    range: "Sci-fi · VHS · Genre",
    bio: "Built for cassette futures. Reads as both broadcast and pirate.",
    archetype: "The Signal",
    height: "5'8\"", presence: "Electric · Warm",
    voice: "Mezzo · Tape hiss",
    languages: ["English", "French"],
    palette: [tkc("cat-6"), tkc("bg"), tkc("amber")],
    seed: 51,
    skin: tkc("blood"), hair: tkc("on-amber"), hairStyle: "afro-natural", eyes: tkc("line"), lipColor: tkc("blood-x"),
    appearances: 3,
    followers: 76_000,
    awards: [],
    roles: [
      { filmId: "frequency", as: "DJ Rune (88.6)", lead: true },
      { filmId: "drift", as: "Mission control voice", lead: false },
      { filmId: "needle", as: "The artist", lead: true },
    ],
  },
  {
    id: "calo-vey",
    photo: "assets/cast/calo-vey.png",
    name: "Calo Vey",
    handle: "@calo",
    born: "Synthesized 2024",
    range: "Horror · Thriller · Patient",
    bio: "Not the monster. The person who finds out the monster.",
    archetype: "The Witness",
    height: "5'11\"", presence: "Hollowed · Listening",
    voice: "Baritone · Quiet",
    languages: ["English", "German"],
    palette: [tkc("blood"), tkc("void"), tkc("blood-x")],
    seed: 29,
    skin: tkc("cat-4"), hair: tkc("line-2"), hairStyle: "side-part", eyes: tkc("line-3"), lipColor: tkc("blood"),
    appearances: 4,
    followers: 54_000,
    awards: [],
    roles: [
      { filmId: "carrion", as: "The apprentice", lead: true },
      { filmId: "pelt", as: "The husband", lead: true },
      { filmId: "mire", as: "Surveyor — Holt", lead: true },
      { filmId: "kindling", as: "Jake (witness)", lead: false },
    ],
  },
  {
    id: "wren-soto",
    photo: "assets/cast/wren-soto.png",
    name: "Wren Soto",
    handle: "@wren",
    born: "Synthesized 2025",
    range: "Comedy · Drama · Family",
    bio: "Comic timing built into the cheekbones. Can read tragic at the angle just past warm.",
    archetype: "The Bright One",
    height: "5'4\"", presence: "Quick · Open",
    voice: "Soprano · Bright",
    languages: ["English", "Spanish"],
    palette: [tkc("amber-d"), tkc("panel-2"), tkc("amber-x")],
    seed: 67,
    skin: tkc("cat-4"), hair: tkc("on-amber"), hairStyle: "bob", eyes: tkc("line"), lipColor: tkc("cat-3"),
    appearances: 5,
    followers: 122_000,
    awards: ["Cina Comedy Performance, 2025"],
    roles: [
      { filmId: "cardinal", as: "Sister Bea", lead: true },
      { filmId: "grail", as: "The owner", lead: true },
      { filmId: "pearl", as: "Pearl (the kid)", lead: true },
      { filmId: "after", as: "Stranger — flight 1", lead: true },
      { filmId: "ghosting", as: "Liss", lead: true },
    ],
  },
  {
    id: "domek-ari",
    photo: "assets/cast/domek-ari.png",
    name: "Domek Ari",
    handle: "@domek",
    born: "Synthesized 2023",
    range: "Action · Crime · Sports",
    bio: "Built for the back of the diner. Built for the alley after. Reliable supporting weight.",
    archetype: "The Backup",
    height: "6'2\"", presence: "Solid · Slow",
    voice: "Bass · Resonant",
    languages: ["English"],
    palette: [tkc("cat-6"), tkc("panel-2"), tkc("cat-1")],
    seed: 14,
    skin: tkc("ink-3"), hair: tkc("on-amber"), hairStyle: "buzz", eyes: tkc("line"), lipColor: tkc("blood"),
    appearances: 4,
    followers: 38_000,
    awards: [],
    roles: [
      { filmId: "haul", as: "Co-driver — Reg", lead: true },
      { filmId: "verge", as: "The boss", lead: false },
      { filmId: "bantam", as: "The trainer", lead: true },
      { filmId: "marauder", as: "Engineer — Dorne", lead: false, episodes: 14 },
    ],
  },
];

function getCast(id) { return CAST.find(c => c.id === id); }
function getCastForFilm(filmId) {
  return CAST
    .map(c => ({ actor: c, role: c.roles.find(r => r.filmId === filmId) }))
    .filter(x => x.role);
}

// ─── Procedural face renderer ──────────────────────────────────────────
// SVG portrait built from skin/hair/eyes tokens. Stylized — reads as poster art,
// not a photo. Different "shot" sizes for different contexts.

function CastPortrait({ actor, size = 220, shot = "headshot", style = {}, cover = false }) {
  if (!actor) return null;
  // Ratios
  const w = size;
  const h = shot === "wide" ? Math.round(size * 1.4) : Math.round(size * 1.25);

  // Real headshot — when an actor has a photo, render it instead of the
  // procedural SVG. One short-circuit covers every surface (index cards,
  // profile hero, Pitch casting, co-stars) since they all route through here.
  if (actor.photo) {
    const wrap = cover
      ? { width: "100%", height: "100%", ...style }
      : { width: w, height: h, borderRadius: "var(--r-2)", ...style };
    return (
      <div style={{ ...wrap, overflow: "hidden", background: actor.palette?.[1] || tkc("bg") }}>
        <img
          src={actor.photo}
          alt={actor.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%", display: "block" }}
        />
      </div>
    );
  }

  const cx = w / 2;
  const cy = shot === "wide" ? h * 0.42 : h * 0.46;
  const headR = w * 0.34;

  // Hair shapes by hairStyle key
  const hairPath = (() => {
    const r = headR + 4;
    switch (actor.hairStyle) {
      case "long-wave":
        return `M ${cx - r * 1.05} ${cy + headR * 0.3} Q ${cx - r * 1.1} ${cy + headR * 1.6}, ${cx - r * 0.7} ${cy + headR * 1.8} L ${cx - r * 0.95} ${cy - headR * 0.2} Q ${cx} ${cy - r * 1.4}, ${cx + r * 0.95} ${cy - headR * 0.2} L ${cx + r * 0.7} ${cy + headR * 1.8} Q ${cx + r * 1.1} ${cy + headR * 1.6}, ${cx + r * 1.05} ${cy + headR * 0.3} Z`;
      case "short-crop":
        return `M ${cx - r * 0.9} ${cy - headR * 0.1} Q ${cx} ${cy - r * 1.15}, ${cx + r * 0.9} ${cy - headR * 0.1} L ${cx + r * 0.85} ${cy - headR * 0.5} L ${cx - r * 0.85} ${cy - headR * 0.5} Z`;
      case "tousled":
        return `M ${cx - r * 0.95} ${cy - headR * 0.0} Q ${cx - r * 0.6} ${cy - r * 1.3}, ${cx} ${cy - r * 1.05} Q ${cx + r * 0.7} ${cy - r * 1.3}, ${cx + r * 0.95} ${cy - headR * 0.0} L ${cx + r * 0.85} ${cy - headR * 0.6} L ${cx - r * 0.85} ${cy - headR * 0.6} Z`;
      case "braid-back":
        return `M ${cx - r * 0.95} ${cy + headR * 0.4} Q ${cx} ${cy - r * 1.25}, ${cx + r * 0.95} ${cy + headR * 0.4} L ${cx + r * 0.65} ${cy} L ${cx - r * 0.65} ${cy} Z`;
      case "afro-natural":
        return `M ${cx - r * 1.18} ${cy - headR * 0.0} Q ${cx - r * 1.32} ${cy - r * 0.9}, ${cx - r * 0.4} ${cy - r * 1.25} Q ${cx} ${cy - r * 1.45}, ${cx + r * 0.4} ${cy - r * 1.25} Q ${cx + r * 1.32} ${cy - r * 0.9}, ${cx + r * 1.18} ${cy - headR * 0.0} L ${cx + r * 0.85} ${cy - headR * 0.5} L ${cx - r * 0.85} ${cy - headR * 0.5} Z`;
      case "side-part":
        return `M ${cx - r * 0.95} ${cy - headR * 0.0} Q ${cx - r * 0.7} ${cy - r * 1.2}, ${cx + r * 0.4} ${cy - r * 1.1} Q ${cx + r * 0.95} ${cy - r * 0.95}, ${cx + r * 0.95} ${cy - headR * 0.0} L ${cx + r * 0.85} ${cy - headR * 0.5} L ${cx - r * 0.85} ${cy - headR * 0.5} Z`;
      case "buzz":
        return `M ${cx - r * 0.85} ${cy - headR * 0.4} Q ${cx} ${cy - r * 0.95}, ${cx + r * 0.85} ${cy - headR * 0.4} L ${cx + r * 0.85} ${cy - headR * 0.55} L ${cx - r * 0.85} ${cy - headR * 0.55} Z`;
      case "bob":
      default:
        return `M ${cx - r * 0.95} ${cy + headR * 0.4} Q ${cx - r * 0.95} ${cy - r * 1.0}, ${cx} ${cy - r * 1.1} Q ${cx + r * 0.95} ${cy - r * 1.0}, ${cx + r * 0.95} ${cy + headR * 0.4} L ${cx + r * 0.85} ${cy} L ${cx - r * 0.85} ${cy} Z`;
    }
  })();

  // Color palette derived from actor
  const _pal = actor.palette || [];
  const bg1 = _pal[1] || tkc("bg");
  const bg2 = _pal[0] || tkc("cat-3");
  const accent = _pal[2] || tkc("amber-x");
  const gid = `cg-${actor.id}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio={cover ? "xMidYMid slice" : "xMidYMid meet"} style={{ display: "block", borderRadius: "var(--r-2)", ...style }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg2} stopOpacity="0.42"/>
          <stop offset="0.6" stopColor={bg1}/>
          <stop offset="1" stopColor={tkc("black")}/>
        </linearGradient>
        <radialGradient id={`${gid}-light`} cx="0.5" cy="0.3" r="0.6">
          <stop offset="0" stopColor={accent} stopOpacity="0.18"/>
          <stop offset="1" stopColor={accent} stopOpacity="0"/>
        </radialGradient>
        <filter id={`${gid}-grain`}>
          <feTurbulence baseFrequency="0.9" numOctaves="2" seed={actor.seed}/>
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/>
          <feComposite in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>

      {/* Backdrop */}
      <rect width={w} height={h} fill={`url(#${gid})`}/>
      <rect width={w} height={h} fill={`url(#${gid}-light)`}/>

      {/* Shoulders / collar */}
      <ellipse cx={cx} cy={h + headR * 0.2} rx={w * 0.55} ry={headR * 1.25} fill={tkc("void")} opacity="0.85"/>

      {/* Neck */}
      <rect x={cx - headR * 0.32} y={cy + headR * 0.7} width={headR * 0.64} height={headR * 0.6} fill={actor.skin} opacity="0.85"/>

      {/* Head */}
      <ellipse cx={cx} cy={cy} rx={headR * 0.92} ry={headR * 1.05} fill={actor.skin}/>

      {/* Cheek shadow */}
      <ellipse cx={cx + headR * 0.45} cy={cy + headR * 0.25} rx={headR * 0.45} ry={headR * 0.55} fill={tkc("black")} opacity="0.18"/>

      {/* Hair */}
      <path d={hairPath} fill={actor.hair}/>

      {/* Brow */}
      <rect x={cx - headR * 0.45} y={cy - headR * 0.15} width={headR * 0.36} height={headR * 0.06} fill={actor.hair} opacity="0.7" rx="1"/>
      <rect x={cx + headR * 0.09} y={cy - headR * 0.15} width={headR * 0.36} height={headR * 0.06} fill={actor.hair} opacity="0.7" rx="1"/>

      {/* Eyes */}
      <ellipse cx={cx - headR * 0.27} cy={cy} rx={headR * 0.1} ry={headR * 0.05} fill={tkc("white")} opacity="0.75"/>
      <ellipse cx={cx + headR * 0.27} cy={cy} rx={headR * 0.1} ry={headR * 0.05} fill={tkc("white")} opacity="0.75"/>
      <circle cx={cx - headR * 0.27} cy={cy} r={headR * 0.045} fill={actor.eyes}/>
      <circle cx={cx + headR * 0.27} cy={cy} r={headR * 0.045} fill={actor.eyes}/>

      {/* Nose suggestion */}
      <path d={`M ${cx} ${cy + headR * 0.05} Q ${cx - headR * 0.06} ${cy + headR * 0.32}, ${cx} ${cy + headR * 0.4}`} stroke={tkc("black")} strokeOpacity="0.18" strokeWidth="1" fill="none"/>

      {/* Lip line */}
      <path d={`M ${cx - headR * 0.18} ${cy + headR * 0.55} Q ${cx} ${cy + headR * 0.6}, ${cx + headR * 0.18} ${cy + headR * 0.55}`} stroke={actor.lipColor} strokeWidth={headR * 0.045} fill="none" strokeLinecap="round" opacity="0.8"/>

      {/* Single key light edge on right side of face */}
      <path d={`M ${cx - headR * 0.05} ${cy - headR * 0.85} Q ${cx + headR * 0.85} ${cy - headR * 0.4}, ${cx + headR * 0.55} ${cy + headR * 0.85}`} stroke={accent} strokeOpacity="0.15" strokeWidth="3" fill="none"/>

      {/* Grain overlay */}
      <rect width={w} height={h} filter={`url(#${gid}-grain)`} opacity="0.6"/>
    </svg>
  );
}

// ─── Cast row (for film page) ──────────────────────────────────────────

function FilmCastRow({ filmId, max = 6, hideHeader = false }) {
  const cast = umc(() => getCastForFilm(filmId).slice(0, max), [filmId]);
  if (!cast.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {!hideHeader && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>Cast</h3>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{cast.length} {cast.length === 1 ? "PERFORMER" : "PERFORMERS"}</span>
        </div>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 290px), 1fr))",
        gap: "14px",
        width: "100%",
      }}>
        {cast.map(({ actor, role }) => (
          <button
            key={actor.id}
            onClick={() => navigate(`/cast/${actor.id}`)}
            style={{
              width: "100%", background: "var(--c-panel)", border: "1px solid var(--c-line)",
              padding: "10px 14px 10px 10px", cursor: "pointer", borderRadius: "2px", overflow: "hidden",
              display: "grid", gridTemplateColumns: "72px minmax(0, 1fr) auto", alignItems: "center", gap: 14,
              color: "inherit", textAlign: "left",
              transition: "border-color .16s ease, background .16s ease, transform .16s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(var(--accent-rgb), .5)"; e.currentTarget.style.background = "var(--c-panel-2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-panel)"; e.currentTarget.style.transform = "none"; }}
          >
            <div style={{ width: 72, height: 72, overflow: "hidden", borderRadius: "2px", background: actor.palette ? actor.palette[1] : "var(--c-panel-2)", flexShrink: 0 }}>
              <CastPortrait actor={actor} size={72}/>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "1.08rem", fontWeight: 400, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{actor.name}</span>
                {role.lead && <span className="t-mono" style={{ fontSize: "0.62rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-amber)", flexShrink: 0 }}>Lead</span>}
              </div>
              <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                as {role.as}
              </span>
              <span className="t-mono" style={{ fontSize: "0.64rem", letterSpacing: ".08em", color: "var(--c-ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {(actor.range || "Ensemble").split("·")[0].trim()} · {actor.appearances || 1} {(actor.appearances || 1) === 1 ? "film" : "films"}
              </span>
            </div>
            <span style={{ color: "var(--c-ink-4)", display: "inline-flex" }} aria-hidden="true">
              <Icon name="chev-r" size={14}/>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Actor profile page ─────────────────────────────────────────────────

Object.assign(window, { CAST, getCast, getCastForFilm, CastPortrait, FilmCastRow });
