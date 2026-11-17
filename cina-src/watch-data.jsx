// watch-data.jsx — Catalog for the public-facing watch app.
// ~30 films + series, NFT projects, user holdings, governance, market.

// ─── Helpers ─────────────────────────────────────────────────────────────

const _palette = {
  noir:    tkc("line-3"),
  cobalt:  tkc("cat-6"),
  rust:    tkc("blood"),
  forest:  tkc("cat-6"),
  pearl:   tkc("ink-4"),
  ember:   tkc("cat-3"),
  steel:   tkc("cat-6"),
  amber:   tkc("amber-d"),
  iron:    tkc("line-2"),
  rose:    tkc("blood"),
  sand:    tkc("ink-3"),
  ash:     tkc("cat-6"),
  spruce:  tkc("line-3"),
  blood:   tkc("blood"),
};

// ─── Catalog of films + series ──────────────────────────────────────────

const CATALOG = [
  // ── Series ── (S/E)
  {
    id: "ll", title: "Last Light",
    creator: "ELIAS VOSS · Cina Pictures",
    creatorId: "voss",
    kind: "series", season: 1, totalEpisodes: 8, currentEp: 5,
    nextDrop: "2026-05-12T19:00:00", // friday
    genre: ["Noir thriller"],
    runtime: "47m avg",
    year: 2026,
    rating: 4.7, ratings: 8412,
    views: 184000,
    cover: _palette.noir,
    thumb: "noir-f",
    logline: "A photographer discovers her dead sister in undeveloped film, frame by frame.",
    synopsis: "Nadya Voss has been developing the same roll of film for thirteen years. Tonight, in the safelight, the seventh frame finally surfaces — and her sister is standing behind her in it. Each weekly episode pulls one more frame from the bath.",
    moods: ["slow burn", "rain", "secrets"],
    tags: ["AI generated", "series", "drops Fridays"],
    free: false, rent: 4.99, buy: 24.99,
    nftPremiere: true, premiereHrs: 168,
    series: [
      { ep: 1, title: "Eight, Hold", drop: "2026-04-10", duration: "44m", thumb: "darkroom-wide", watched: 1.0, status: "released" },
      { ep: 2, title: "The Stop Bath", drop: "2026-04-17", duration: "46m", thumb: "darkroom-est", watched: 1.0, status: "released" },
      { ep: 3, title: "Safelight", drop: "2026-04-24", duration: "48m", thumb: "developer", watched: 1.0, status: "released" },
      { ep: 4, title: "Fixer", drop: "2026-05-01", duration: "44m", thumb: "voss-eye", watched: 0.62, status: "released" },
      { ep: 5, title: "The Seventh Frame", drop: "2026-05-08", duration: "49m", thumb: "the-photo", watched: 0, status: "released", new: true },
      { ep: 6, title: "Print", drop: "2026-05-15", duration: "—", thumb: "phone", watched: 0, status: "scheduled" },
      { ep: 7, title: "Dodge & Burn", drop: "2026-05-22", duration: "—", thumb: "darkroom-est", watched: 0, status: "scheduled" },
      { ep: 8, title: "Negative", drop: "2026-05-29", duration: "—", thumb: "darkroom-wide", watched: 0, status: "scheduled", finale: true },
    ],
    nft: "voss-ll",
    color: tkc("cat-3"),
  },
  {
    id: "marauder", title: "Marauder",
    creator: "Lin Hara",
    creatorId: "hara",
    kind: "series", season: 2, totalEpisodes: 6, currentEp: 4,
    nextDrop: "2026-05-13T19:00:00",
    genre: ["Sci-fi", "Crime"],
    runtime: "52m avg",
    year: 2026,
    rating: 4.4, ratings: 12300,
    views: 410000,
    cover: _palette.cobalt,
    thumb: "sci-ship",
    logline: "A salvage crew on Europa runs into something that learned to mimic ice.",
    synopsis: "After the events of Season One, the Marauder limps home with a stowaway nobody can find on cameras. Eight episodes. One of them is lying.",
    moods: ["tense", "crew dynamics"],
    tags: ["AI generated", "season 2"],
    free: false, rent: 4.99, buy: 29.99,
    nftPremiere: false,
    series: [
      { ep: 1, title: "Crawlspace", drop: "2026-04-22", duration: "52m", thumb: "phone", watched: 1.0, status: "released" },
      { ep: 2, title: "Ice Memory", drop: "2026-04-29", duration: "54m", thumb: "phone", watched: 0.45, status: "released" },
      { ep: 3, title: "The Hold", drop: "2026-05-06", duration: "51m", thumb: "phone", watched: 0, status: "released" },
      { ep: 4, title: "Hatch", drop: "2026-05-13", duration: "—", thumb: "phone", watched: 0, status: "scheduled" },
      { ep: 5, title: "Vacuum", drop: "2026-05-20", duration: "—", thumb: "phone", watched: 0, status: "scheduled" },
      { ep: 6, title: "Mimic", drop: "2026-05-27", duration: "—", thumb: "phone", watched: 0, status: "scheduled", finale: true },
    ],
    nft: "hara-mar",
    color: tkc("cat-6"),
  },
  {
    id: "longhall", title: "Long Hall",
    creator: "Mira Sten",
    creatorId: "sten",
    kind: "series", season: 1, totalEpisodes: 10, currentEp: 1,
    nextDrop: "2026-05-15T18:00:00",
    genre: ["Drama"],
    runtime: "38m avg",
    year: 2026,
    rating: 4.2, ratings: 980,
    views: 21000,
    cover: _palette.forest,
    thumb: "window-rain",
    logline: "Two brothers run their late father's diner. Episode 1 is the day they put the sign up.",
    synopsis: "A quiet ten-part drama about grief and pancakes. Drops weekly through summer.",
    moods: ["warm", "slow"],
    tags: ["AI generated", "premieres Friday"],
    free: false, rent: 3.99, buy: 19.99,
    nftPremiere: true, premiereHrs: 72,
    series: [
      { ep: 1, title: "Pilot — Open", drop: "2026-05-15", duration: "—", thumb: "darkroom-wide", watched: 0, status: "scheduled", premiere: true },
      ...Array.from({ length: 9 }, (_, i) => ({ ep: i + 2, title: ["Mornings", "The Gravy", "Mom Calls", "Card Reader", "Health Inspector", "The Regulars", "Mid-Shift", "The Sale", "Last Pancake"][i], drop: `2026-05-${22 + i*7 < 30 ? 22 + i*7 : (22+i*7)%30}`, duration: "—", thumb: "darkroom-wide", watched: 0, status: "scheduled" })),
    ],
    nft: "sten-lh",
    color: tkc("cat-5"),
  },

  // ── Films (single)
  { id: "bluejay",  title: "Bluejay",         creator: "Elias Voss",       creatorId: "voss",  kind: "film", genre: ["Drama", "Coming-of-age"], runtime: "1h 47m", year: 2025, rating: 4.6, ratings: 38000, views: 920000, cover: _palette.cobalt, thumb: "interior-dim",          logline: "A boy in 1991 finds a stolen radio scanner. What he hears makes him grow up in a single afternoon.", moods: ["tender", "summer"],     tags: ["AI generated", "award winner"],     free: false, rent: 4.99, buy: 14.99, nftPremiere: false, nft: "voss-bj",  color: tkc("cat-6") },
  { id: "thefence", title: "The Fence",       creator: "Yara Kim",         creatorId: "ykim",  kind: "film", genre: ["Western"],       runtime: "2h 02m", year: 2026, rating: 4.5, ratings: 14500, views: 312000, cover: _palette.rust,    thumb: "west-rider",   logline: "A widow in the high desert refuses to move the line.", moods: ["slow burn", "wide"],   tags: ["AI generated"],          free: false, rent: 4.99, buy: 19.99, nftPremiere: true, premiereHrs: 96, nft: "ykim-tf", color: tkc("cat-3") },
  { id: "frequency",title: "Frequency 88.6",  creator: "Tao Reng",         creatorId: "reng",  kind: "film", genre: ["Sci-fi"],        runtime: "1h 38m", year: 2026, rating: 4.3, ratings: 22100, views: 540000, cover: _palette.steel,   thumb: "sci-neon",      logline: "A pirate radio DJ in 1979 starts receiving broadcasts from her own future.", moods: ["cassette", "neon"],   tags: ["AI generated", "trending"], free: false, rent: 3.99, buy: 16.99, nftPremiere: true, premiereHrs: 48, nft: "reng-fr", color: tkc("ink-4") },
  { id: "carrion",  title: "Carrion",         creator: "Boris Helm",       creatorId: "helm",  kind: "film", genre: ["Horror"],        runtime: "1h 32m", year: 2026, rating: 4.1, ratings: 18800, views: 390000, cover: _palette.blood,   thumb: "scared-hall",      logline: "A taxidermist's apprentice finds out what her mentor really collects.",          moods: ["wet", "patient"],     tags: ["AI generated"],         free: false, rent: 4.99, buy: 14.99, nftPremiere: false, nft: "helm-car", color: tkc("blood") },
  { id: "pelt",     title: "Pelt",            creator: "Boris Helm",       creatorId: "helm",  kind: "film", genre: ["Horror", "Folk"], runtime: "1h 18m", year: 2025, rating: 4.0, ratings: 9100,  views: 178000, cover: _palette.spruce,  thumb: "lantern",       logline: "A village wears its dead through the winter so the cold can't tell who's gone.", moods: ["folk", "cold"],       tags: ["AI generated"],         free: true, ads: true,                    nftPremiere: false, nft: "helm-pel", color: tkc("cat-6") },
  { id: "after",    title: "Afterlight",      creator: "Mira Sten",        creatorId: "sten",  kind: "film", genre: ["Romance"],       runtime: "1h 52m", year: 2025, rating: 4.4, ratings: 31200, views: 620000, cover: _palette.amber,   thumb: "noir-m",      logline: "Two strangers share a delayed flight. Then they share another one. Then another.", moods: ["warm", "patient"],     tags: ["AI generated"],         free: false, rent: 3.99, buy: 14.99, nftPremiere: false, nft: "sten-al", color: tkc("warn") },
  { id: "cellar",   title: "Cellar Door",     creator: "Anson Park",       creatorId: "park",  kind: "film", genre: ["Mystery"],       runtime: "1h 41m", year: 2026, rating: 4.2, ratings: 7400,  views: 142000, cover: _palette.iron,    thumb: "interior-dim",  logline: "An estate sale turns up a key with no door. The house grows one to fit it.",     moods: ["uncanny", "still"],   tags: ["AI generated"],         free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "park-cd", color: tkc("cat-6") },
  { id: "swallows", title: "The Swallows",    creator: "Yara Kim",         creatorId: "ykim",  kind: "film", genre: ["Drama"],         runtime: "2h 14m", year: 2025, rating: 4.7, ratings: 44500, views: 1100000,cover: _palette.sand,    thumb: "window-rain",   logline: "Three sisters return to their childhood home to bury a fourth they never told anyone about.", moods: ["unforgiving", "lyrical"], tags: ["AI generated", "Letterbox top 50"], free: false, rent: 4.99, buy: 19.99, nftPremiere: false, nft: "ykim-sw", color: tkc("ink-3") },
  { id: "haul",     title: "Haul",            creator: "Lin Hara",         creatorId: "hara",  kind: "film", genre: ["Crime"],         runtime: "1h 49m", year: 2024, rating: 4.0, ratings: 12000, views: 240000, cover: _palette.ash,     thumb: "face-night",          logline: "Two long-haul truckers move a load they aren't supposed to know they're moving.", moods: ["asphalt", "diesel"],  tags: ["AI generated"],         free: false, rent: 2.99, buy: 9.99,  nftPremiere: false, nft: "hara-hl", color: tkc("ink-4") },
  { id: "salt",     title: "Salt Year",       creator: "Eve Roan",         creatorId: "roan",  kind: "film", genre: ["Drama"],         runtime: "1h 36m", year: 2025, rating: 4.5, ratings: 19800, views: 376000, cover: _palette.pearl,   thumb: "interior-dim",  logline: "A widower spends a year salting fish with his late wife's recipe book.",          moods: ["mourning", "salt"],   tags: ["AI generated"],         free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "roan-sy", color: tkc("ink-3") },
  { id: "kindling", title: "Kindling",        creator: "Soren Vail",       creatorId: "vail",  kind: "film", genre: ["Thriller"],      runtime: "1h 44m", year: 2026, rating: 4.3, ratings: 8800,  views: 156000, cover: _palette.ember,   thumb: "alley-night",      logline: "An arson inspector starts every fire she's called to investigate.",              moods: ["heat", "guilt"],      tags: ["AI generated", "new"],  free: false, rent: 4.99, buy: 14.99, nftPremiere: true, premiereHrs: 72, nft: "vail-kn", color: tkc("bad") },
  { id: "moss",     title: "Moss",            creator: "June Aikara",      creatorId: "aika",  kind: "film", genre: ["Doc"],           runtime: "58m",    year: 2025, rating: 4.6, ratings: 4400,  views: 88000,  cover: _palette.forest,  thumb: "lantern",  logline: "Four years inside a moss farm in northern Japan.",                                moods: ["green", "patient"],   tags: ["doc"],                  free: true, ads: true,                    nftPremiere: false, nft: "aika-ms", color: tkc("ink-4") },
  { id: "bantam",   title: "Bantam",          creator: "Soren Vail",       creatorId: "vail",  kind: "film", genre: ["Sports"],        runtime: "1h 22m", year: 2024, rating: 4.1, ratings: 14000, views: 290000, cover: _palette.rose,    thumb: "face-night",       logline: "An aging featherweight steps up to bantam to keep his daughter in school.",       moods: ["sweat", "closeness"], tags: ["AI generated"],         free: false, rent: 2.99, buy: 9.99,  nftPremiere: false, nft: "vail-bn", color: tkc("blood-x") },
  { id: "cardinal", title: "Cardinal Rules",  creator: "Anson Park",       creatorId: "park",  kind: "film", genre: ["Comedy"],        runtime: "1h 28m", year: 2025, rating: 4.0, ratings: 22200, views: 480000, cover: _palette.amber,   thumb: "noir-m",          logline: "A nun runs a pirate radio station. Her bishop is the only listener.",             moods: ["dry", "warm"],        tags: ["AI generated"],         free: false, rent: 2.99, buy: 9.99,  nftPremiere: false, nft: "park-cr", color: tkc("amber-d") },
  { id: "ghosting", title: "Ghosting",        creator: "Eve Roan",         creatorId: "roan",  kind: "film", genre: ["Romance"],       runtime: "1h 39m", year: 2026, rating: 4.2, ratings: 6200,  views: 110000, cover: _palette.cobalt,  thumb: "window-rain",       logline: "Two exes keep running into each other in dreams. Their therapist is concerned.",  moods: ["liminal", "tender"],  tags: ["AI generated"],         free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "roan-gh", color: tkc("cat-6") },
  { id: "drift",    title: "Drift",           creator: "Tao Reng",         creatorId: "reng",  kind: "film", genre: ["Sci-fi"],        runtime: "2h 04m", year: 2024, rating: 4.6, ratings: 58200, views: 1300000,cover: _palette.steel,   thumb: "sci-surface",   logline: "A solo astronaut on a one-way mission decides to turn around.",                   moods: ["cold", "vast"],       tags: ["AI generated", "classic"],free: false, rent: 4.99, buy: 19.99, nftPremiere: false, nft: "reng-dr", color: tkc("cat-6") },
  { id: "mire",     title: "Mire",            creator: "Boris Helm",       creatorId: "helm",  kind: "film", genre: ["Horror"],        runtime: "1h 21m", year: 2025, rating: 3.9, ratings: 5600,  views: 92000,  cover: _palette.spruce,  thumb: "scared-hall",      logline: "Surveyors stake a property line through a swamp that doesn't want to be measured.", moods: ["wet", "patient"],   tags: ["AI generated"],         free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "helm-mr", color: tkc("cat-6") },
  { id: "verge",    title: "Verge",           creator: "Lin Hara",         creatorId: "hara",  kind: "film", genre: ["Crime"],         runtime: "1h 51m", year: 2026, rating: 4.4, ratings: 11200, views: 198000, cover: _palette.iron,    thumb: "noir-m",   logline: "A getaway driver's GPS keeps suggesting routes he's never taken before.",         moods: ["asphalt", "tense"],   tags: ["AI generated", "new"],  free: false, rent: 4.99, buy: 14.99, nftPremiere: true, premiereHrs: 24, nft: "hara-vg", color: tkc("cat-6") },
  { id: "pearl",    title: "Pearl & Me",      creator: "June Aikara",      creatorId: "aika",  kind: "film", genre: ["Family"],        runtime: "1h 14m", year: 2025, rating: 4.7, ratings: 16800, views: 286000, cover: _palette.pearl,   thumb: "window-rain",       logline: "A 9-year-old keeps a journal of her grandmother's last summer.",                  moods: ["bright", "soft"],     tags: ["family"],               free: true, ads: true,                    nftPremiere: false, nft: "aika-pm", color: tkc("ink-3") },
  { id: "tender",   title: "Tender",          creator: "Mira Sten",        creatorId: "sten",  kind: "film", genre: ["Drama"],         runtime: "1h 47m", year: 2024, rating: 4.3, ratings: 21000, views: 410000, cover: _palette.amber,   thumb: "interior-dim",      logline: "A line cook trains his replacement on the day he gets fired.",                    moods: ["kitchen", "tight"],   tags: ["AI generated"],         free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "sten-td", color: tkc("amber-d") },
  { id: "obsidian", title: "Obsidian",        creator: "Yara Kim",         creatorId: "ykim",  kind: "film", genre: ["Western"],       runtime: "1h 58m", year: 2024, rating: 4.4, ratings: 13800, views: 244000, cover: _palette.iron,    thumb: "west-canyon",   logline: "A scout maps a canyon that shouldn't be on any map.",                              moods: ["wide", "still"],      tags: ["AI generated"],         free: false, rent: 3.99, buy: 14.99, nftPremiere: false, nft: "ykim-ob", color: tkc("cat-6") },
  { id: "needle",   title: "Needle",          creator: "Soren Vail",       creatorId: "vail",  kind: "film", genre: ["Thriller"],      runtime: "1h 33m", year: 2024, rating: 3.8, ratings: 7200,  views: 140000, cover: _palette.rose,    thumb: "alley-night",      logline: "A tattoo artist starts inking memories she's never had.",                          moods: ["ink", "warm"],        tags: ["AI generated"],         free: false, rent: 2.99, buy: 9.99,  nftPremiere: false, nft: "vail-nd", color: tkc("blood-x") },
  { id: "grail",    title: "Saint Grail Pkwy",creator: "Anson Park",       creatorId: "park",  kind: "film", genre: ["Comedy"],        runtime: "1h 26m", year: 2026, rating: 4.0, ratings: 4800,  views: 78000,  cover: _palette.amber,   thumb: "phone",          logline: "A roadside attraction owner finds the actual grail. It's a coffee mug.",          moods: ["dry", "americana"],   tags: ["AI generated"],         free: false, rent: 2.99, buy: 9.99,  nftPremiere: false, nft: "park-gr", color: tkc("amber-d") },
  { id: "anvil",    title: "Anvil",           creator: "Eve Roan",         creatorId: "roan",  kind: "film", genre: ["Drama"],         runtime: "1h 42m", year: 2024, rating: 4.5, ratings: 19200, views: 320000, cover: _palette.ash,     thumb: "darkroom-wide",  logline: "A blacksmith's daughter inherits the forge and the long argument inside it.",      moods: ["fire", "close"],      tags: ["AI generated"],         free: false, rent: 3.99, buy: 12.99, nftPremiere: false, nft: "roan-an", color: tkc("ink-4") },
];

// Add a synopsis to series (loose default)
CATALOG.forEach(c => { if (!c.synopsis && c.kind === "film") c.synopsis = c.logline; });

// ─── Close the publish loop: films mastered in Studio ───────────────────
// Studio writes Watch-shaped entries into a shared localStorage key on ship.
// We pull them in here so a film you made actually appears in the catalog —
// leading every shelf, exactly as a real premiere would. Tagged with
// studioProjectId so the film page can link back to its Studio project.
const _pubNorm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const PUBLISHED_FROM_STUDIO = (window.cinaPublishedFilms ? window.cinaPublishedFilms() : []);
PUBLISHED_FROM_STUDIO.forEach(p => {
  if (!p || !p.id) return;
  // Match on id first, then on title. A Studio project that shares a title
  // with an authored catalog film is the SAME film — publishing it must
  // update that entry, not mint a twin with the publisher's handle as its
  // director. Authored fields (creator, creatorId, logline, programmer note)
  // win; the publish only contributes the loop metadata and live numbers.
  let at = CATALOG.findIndex(f => f.id === p.id);
  if (at < 0) at = CATALOG.findIndex(f => _pubNorm(f.title) === _pubNorm(p.title));
  if (at >= 0) {
    const authored = CATALOG[at];
    CATALOG[at] = {
      ...authored,
      studioProjectId: p.studioProjectId || authored.studioProjectId,
      studioCode: p.studioCode || authored.studioCode,
      publishedByYou: true,
      publishedAt: p.publishedAt || Date.now(),
      distribution: p.distribution || authored.distribution,
      releaseDate: p.releaseDate || authored.releaseDate,
      tags: [...new Set([...(authored.tags || []), ...(p.tags || [])])],
    };
    // Re-key the published record so shelves point at the surviving entry.
    p.id = authored.id;
    return;
  }
  CATALOG.unshift(p);
});

// ─── From the programmer ────────────────────────────────────────────────
// Ada Beresford (Editor-in-chief) writes ONE line for every title in the
// catalog — ~30 words, an argument, not a logline. This is the difference
// between a CMS dump and a programmed front page. Keyed by film id so the
// note travels with the title onto every shelf, tile and detail page.
const PROGRAMMER_NOTES = {
  ll:        "Voss shoots a darkroom like a confession booth. Start here even if noir isn't yours — the seventh-frame reveal in episode five is the best-engineered gut-punch we've run all year.",
  marauder:  "The rare genre series that respects your patience. Hara hides the whole mystery in episode one's camera blocking. Watch it twice; you'll be furious about everything you missed the first time.",
  longhall:  "Ten episodes about grief and pancakes, and somehow never twee. Sten earns every quiet minute. The pilot's sign-hanging scene is the most I have ever cried at carpentry.",
  bluejay:   "A single summer afternoon stretched to feature length, and it never sags. Voss's most tender film — proof the man who does dread so well can do warmth just as precisely.",
  thefence:  "A western that refuses the showdown and is better for it. Kim lets the high desert do the threatening. Sit with the stillness; it pays back every minute you give it.",
  frequency: "The one I push hardest this season. Reng turns a pirate-radio booth into a time machine without a single effect that announces itself. Pure analog dread, and the soundtrack is immaculate.",
  carrion:   "Helm's patience is the whole horror. Don't skip the first forty minutes — they are loading the spring. By the reveal you won't trust a single quiet room again.",
  pelt:      "Folk horror that earns its cold. The village's grief-ritual logic is so airtight it stops reading as metaphor. Free, with ads, and worth far more than the price of neither.",
  after:     "A romance built entirely in delayed departure lounges, and it somehow flies. Sten finds the whole relationship in the spaces between flights. Quietly one of the most rewatched films we carry.",
  cellar:    "A haunted-house film where the house is the curious one. Park keeps every scare architectural. The key-with-no-door image has been renting space in my head for three weeks now.",
  swallows:  "Our highest-rated drama, and it earns every star. Three sisters, one buried secret, zero melodrama. Kim writes silence better than most writers write dialogue. Unforgiving, lyrical, and never sentimental.",
  haul:      "Two truckers, one load they shouldn't understand, and the most tension we've ever wrung from a speed limit. Hara shoots asphalt like a lead character. Lean, mean, badly underseen.",
  salt:      "A widower, a recipe book, and a full year of salting fish. It should be unbearable; it is the opposite. Roan films mourning as a form of devotion.",
  kindling:  "The arson inspector starts the fires she's called to investigate, and the film never lets you off the hook about why. Vail's tightest thriller yet — new, and already a staff fixation.",
  moss:      "Four years inside a northern moss farm, and the slowest fifty-eight minutes you will happily lose. A documentary that quietly recalibrates your sense of time. Free; clear an evening for it.",
  bantam:    "A boxing film that stays in the corner, not the ring. Vail keeps the camera close enough to smell the fatigue. The fatherhood underneath lands harder than any single punch.",
  cardinal:  "A nun runs a pirate radio station for an audience of exactly one. Park's driest comedy and his warmest. Don't let the logline fool you — it is secretly about faith.",
  ghosting:  "Exes who keep meeting in dreams, and a film smart enough to make that the problem rather than the cure. Roan finds real ache inside a premise that could have been a gimmick.",
  drift:     "The astronaut decides to turn around, and the film becomes about everything that one word costs. A modern classic in our library — cold, vast, devastating. Begin your sci-fi here.",
  mire:      "Surveyors versus a swamp that refuses to be measured. Helm at his most elemental. Slighter than Carrion, but cut from the same patient, dripping cloth. A quiet, wet nightmare.",
  verge:     "A getaway driver whose GPS knows roads he has never driven. The premise could have been a trick; Hara makes it existential instead. New this week, and climbing the charts fast.",
  pearl:     "A nine-year-old's journal of her grandmother's last summer. Family-rated and never once saccharine. Aikara trusts a child's eye completely and is rewarded. Free, and the film I'd show a skeptic.",
  tender:    "A line cook trains his replacement on the day he is fired. Ninety minutes, one kitchen, no fat on it. Sten's most contained film, maybe her best. Wren Soto is a revelation.",
  obsidian:  "A scout maps a canyon that should not exist, and Kim lets the landscape turn the screws. A western paced like a horror film. Badly underseen — please help me correct that.",
  needle:    "A tattoo artist inks memories that were never hers. Vail's strangest film, and the one whose ideas gloriously outrun its budget. Flawed, haunting, and absolutely worth arguing about afterward.",
  grail:     "The actual Holy Grail turns out to be a roadside coffee mug, and Park plays it dead straight. Americana comedy with a real ache underneath the gag. Genuinely, unexpectedly charming.",
  anvil:     "A blacksmith's daughter inherits the forge and the family argument welded inside it. Roan writes inheritance like nobody else working. Fire, family, and a closing scene that fully earns its heat.",
};
CATALOG.forEach(f => { f.programmerNote = PROGRAMMER_NOTES[f.id] || null; });
const PROGRAMMER = { name: "Ada Beresford", role: "Editor-in-chief", initials: "AB" };

// ─── Curated rows for the splash ────────────────────────────────────────

const SHELVES = [
  { id: "trending",   title: "Trending now",          subtitle: "What everyone's watching this week",
    note: { who: "Ada Beresford", body: "Three premiered this week and none of them are losing." },
    filmIds: ["frequency","verge","ll","drift","kindling","carrion","marauder","longhall"] },
  { id: "new",        title: "New releases",          subtitle: "Premiered in the last 30 days",
    note: { who: "Ada Beresford", body: "Watch the second one first. I'll defend that pick all week." },
    filmIds: ["verge","kindling","carrion","ghosting","grail","longhall","frequency","cellar"] },
  { id: "premiere",   title: "NFT premiere · holders watch first", filmIds: ["ll","thefence","frequency","kindling","verge","longhall"] },
  { id: "free",       title: "Free with ads",         filmIds: ["pelt","moss","pearl"] },
  { id: "noir",       title: "Slow-burn noir",
    note: { who: "Ada Beresford", body: "Order matters — Last Light, then Cellar, then Swallows." },
    filmIds: ["ll","cellar","swallows","verge","obsidian","needle"] },
  { id: "scifi",      title: "Sci-fi this season",    filmIds: ["frequency","drift","marauder"] },
  { id: "horror",     title: "After-dark horror",
    note: { who: "Ada Beresford", body: "Helm's Carrion is the one. Don't fast-forward the first 40 minutes." },
    filmIds: ["carrion","pelt","mire","cellar"] },
  { id: "voss",       title: "Films by Elias Voss",   subtitle: "From the director of Bluejay",      filmIds: ["ll","bluejay"] },
  { id: "drama",      title: "Drama, in close",       filmIds: ["swallows","tender","anvil","salt","longhall","after"] },
  { id: "continue",   title: "Continue watching",     filmIds: ["ll","marauder","drift","carrion"] },
];

// ─── Lead the front page with anything you just published ───────────────
// A film you shipped from Studio earns the top of the page — a dedicated
// "Premiered from your Studio" row, plus a spot at the head of New + Trending,
// so the payoff for making a film is immediate and unmistakable.
if (PUBLISHED_FROM_STUDIO.length) {
  const pubIds = PUBLISHED_FROM_STUDIO.map(f => f.id).filter(id => CATALOG.some(f => f.id === id));
  if (pubIds.length) {
    SHELVES.unshift({
      id: "yourpremieres",
      title: "Premiered from your Studio",
      subtitle: "Mastered in Cina Studio · now live on Watch",
      note: { who: "Cina", body: "You made this, and now the world can watch it. This is the whole point." },
      filmIds: pubIds,
    });
    const lead = (shelfId) => {
      const s = SHELVES.find(x => x.id === shelfId);
      if (s) s.filmIds = [...pubIds, ...s.filmIds.filter(id => !pubIds.includes(id))];
    };
    lead("new"); lead("trending");
  }
}

// ─── Creators (channels) ─────────────────────────────────────────────────

// Each creator owns their own channel page. `theme` = how the page LOOKS:
//   darkroom: Voss — chemical/red, monospaced, frame index, contact-sheet grid
//   atlas:    Hara — cold blueprint, system-card, schematic crosshairs
//   kitchen:  Sten — soft cream, tall single column, long-form text essays
//   plains:   Ykim — sand & ink, wide horizon hero, journal entries
//   tape:     Reng — VHS chrome, scanlines, magenta/cyan, glitch labels
//   basement: Helm — pure black, oxblood, wet ink, single grid no chrome
const CREATORS = [
  { id: "voss",  name: "Elias Voss",     handle: "@voss",     films: 4,  followers: 184000, sub: 5.99, color: tkc("cat-3"), bg: tkc("on-amber"), accent: tkc("warn"), theme: "darkroom", tagline: "Things developing in chemicals.",         domain: "voss.cina",        bio: "Noir. Slow burn. Things developing in chemicals.",     since: 2023 },
  { id: "hara",  name: "Lin Hara",       handle: "@harafilm", films: 6,  followers: 312000, sub: 6.99, color: tkc("cat-6"), bg: tkc("bg"), accent: tkc("cat-1"), theme: "atlas",    tagline: "Genre, with grit.",                       domain: "harafilm.cina",    bio: "Sci-fi, crime, cold air. Built on cassette tape and hard math.", since: 2022 },
  { id: "sten",  name: "Mira Sten",      handle: "@stenframe",films: 5,  followers: 96000,  sub: 4.99, color: tkc("cat-5"), bg: tkc("ink"), accent: tkc("line-2"), theme: "kitchen",  tagline: "Quiet drama. Long takes. Kitchens.",      domain: "sten.cina",        bio: "I make small films about people who almost say it.", since: 2024 },
  { id: "ykim",  name: "Yara Kim",       handle: "@yk",       films: 7,  followers: 244000, sub: 5.99, color: tkc("ink-3"), bg: tkc("panel-2"), accent: tkc("warn"), theme: "plains",   tagline: "Westerns. Sisters.",                      domain: "yk.cina",          bio: "Wide country, narrow dialogue.",                       since: 2021 },
  { id: "reng",  name: "Tao Reng",       handle: "@reng",     films: 3,  followers: 168000, sub: 6.99, color: tkc("cat-6"), bg: tkc("bg"), accent: tkc("amber"), theme: "tape",     tagline: "Cassette futures. Neon pasts.",           domain: "reng.cina",        bio: "Synthwave noir. Frame-by-frame VHS aesthetics.",       since: 2023 },
  { id: "helm",  name: "Boris Helm",     handle: "@helm",     films: 4,  followers: 88000,  sub: 4.99, color: tkc("blood"), bg: tkc("void"), accent: tkc("blood-x"), theme: "basement", tagline: "Patient horror. Wet basements.",         domain: "helm.cina",        bio: "Don't watch alone.",                                   since: 2024 },
  { id: "park",  name: "Anson Park",     handle: "@park",     films: 5,  followers: 76000,  sub: 4.99, color: tkc("cat-6"), bg: tkc("panel-2"), accent: tkc("cat-1"), theme: "atlas",    tagline: "Comedy that doesn't feel like comedy.",   domain: "park.cina",        bio: "Awkward films about awkward people.",                  since: 2022 },
  { id: "roan",  name: "Eve Roan",       handle: "@roan",     films: 4,  followers: 142000, sub: 5.99, color: tkc("ink-3"), bg: tkc("ink"), accent: tkc("line-2"), theme: "kitchen",  tagline: "Grief. Salt. Pacific light.",             domain: "roan.cina",        bio: "I write the slow ones.",                               since: 2023 },
  { id: "vail",  name: "Soren Vail",     handle: "@vail",     films: 4,  followers: 64000,  sub: 4.99, color: tkc("bad"), bg: tkc("on-amber"), accent: tkc("amber"), theme: "darkroom", tagline: "Heat and consequence.",                   domain: "vail.cina",        bio: "Films about people running out of time.",              since: 2024 },
  { id: "aika",  name: "June Aikara",    handle: "@aika",     films: 3,  followers: 38000,  sub: 3.99, color: tkc("ink-4"), bg: tkc("panel"), accent: tkc("good"), theme: "plains",   tagline: "Patient documentary.",                    domain: "aika.cina",        bio: "Real people. Real time.",                              since: 2025 },
];

// ─── Reactions (live during a scene) and Reviews (Letterboxd-ish) ──────

const REACTIONS_FOR_LL = [
  { t: 12.4, user: "rena_ko",   color: tkc("bad"), text: "the safelight color grading. unreal.", count: 18 },
  { t: 14.1, user: "park_dr",   color: tkc("cat-6"), text: "she heard something",                  count: 9 },
  { t: 18.6, user: "voss_fan99",color: tkc("cat-3"), text: "FRAME 7 IS COMING",                    count: 47 },
  { t: 22.0, user: "miradawn",  color: tkc("cat-5"), text: "this is just the prologue isn't it",   count: 5 },
  { t: 28.4, user: "ash.404",   color: tkc("cat-6"), text: "second watch. still scared.",          count: 22 },
  { t: 33.8, user: "june_a",    color: tkc("ink-4"), text: "the developer hum is cold",            count: 12 },
  { t: 41.2, user: "soren_v",   color: tkc("bad"), text: "OH",                                   count: 88 },
  { t: 46.5, user: "tao_reng",  color: tkc("cat-6"), text: "she's been looking at it the whole time", count: 31 },
];

const REVIEWS_FOR_LL = [
  { user: "Marlowe Inks",   stars: 5,   when: "3 days ago",  hearts: 412, body: "Voss has made the patience of a darkroom into a metaphor for grief. Episode 5 is the most controlled hour of television this year. The seventh frame doesn't show you what you think it will. It shows you what you've been afraid of for thirteen years.", spoiler: false },
  { user: "june_a",         stars: 5,   when: "2 days ago",  hearts: 188, body: "I watched the first four episodes in a single sitting. I have not stopped thinking about the safelight scene. The way the red light makes everyone look like they have already been buried.", spoiler: false },
  { user: "harafilm",       stars: 4,   when: "1 day ago",   hearts: 96,  body: "The slow build is the show. If you bounce off the first 20 minutes, this isn't for you. If you stay, you're staying for the whole season.", spoiler: false },
  { user: "ash.404",        stars: 5,   when: "12h",         hearts: 54,  body: "[SPOILER] When she realizes the photo isn't of her sister but of HER, taken from across the room — I screamed. I am still screaming.", spoiler: true },
  { user: "rena_ko",        stars: 4.5, when: "8h",          hearts: 31,  body: "Cinematography is doing things I didn't think AI generation could do this year. The grain. The patience.", spoiler: false },
  { user: "park_dr",        stars: 3.5, when: "6h",          hearts: 14,  body: "I want to love this more than I do. Episode 4 stalled for me. Cutting back to the brother in episode 5 saved it.", spoiler: false },
];

// ─── NFT projects (per film) ────────────────────────────────────────────

const NFT_PROJECTS = {
  "voss-ll": {
    id: "voss-ll", filmId: "ll",
    title: "LAST LIGHT · The Seventh Frame",
    creator: "Elias Voss",
    creatorId: "voss",
    color: tkc("cat-3"),
    raised: 184_200, goal: 250_000,
    backers: 1142,
    daysLeft: 11,
    summary: "Co-finance Last Light Season 1 finale week. Holders get premiere access, revenue share through Year 5, and tiered perks.",
    floorPrice: 0.082, // ETH
    floorUSD: 224,
    revShare: 12, // %
    royaltyPaid: 38_400, // total to date
    nextDistribution: "2026-06-01",
    chain: "Base",
    contract: "0x73a2…ee4c",
    tiers: [
      { id: "collector", name: "Collector", count: 1500, sold: 1142, price: 0.082, priceUSD: 224, perks: ["Premiere watch (168hr early)", "Animated frame collectible", "Pulse on the wall (live signal during episode)"], color: tkc("ink-4") },
      { id: "patron",    name: "Patron",    count: 250,  sold: 184,  price: 0.34,  priceUSD: 920, perks: ["Everything in Collector", "0.04% revenue share through Y5", "Behind-the-scenes vault access"], color: tkc("cat-3") },
      { id: "producer",  name: "Producer",  count: 25,   sold: 18,   price: 2.4,   priceUSD: 6500, perks: ["Everything in Patron", "0.4% revenue share through Y5", "Production credit on the closing card", "Set visit to Episode 8"], color: tkc("amber") },
    ],
    timeline: [
      { d: "2026-04-10", label: "Mint open · Collector tier", state: "done" },
      { d: "2026-04-22", label: "Episode 1 live · holders 168h early", state: "done" },
      { d: "2026-05-08", label: "Episode 5 — half-season distribution paid", state: "done" },
      { d: "2026-05-29", label: "Episode 8 finale · closing card credits Producers", state: "live" },
      { d: "2026-06-01", label: "Q2 revenue distribution", state: "next" },
      { d: "2026-09-01", label: "Q3 distribution + Season 2 vote", state: "future" },
    ],
    market: [
      { kind: "ask", tier: "collector", price: 0.085, qty: 1, seller: "0xC1…a2" },
      { kind: "ask", tier: "collector", price: 0.088, qty: 2, seller: "0x4f…b8" },
      { kind: "ask", tier: "collector", price: 0.091, qty: 1, seller: "0x91…7d" },
      { kind: "ask", tier: "patron",    price: 0.42,  qty: 1, seller: "0xab…3c" },
      { kind: "ask", tier: "patron",    price: 0.46,  qty: 1, seller: "0xee…14" },
      { kind: "bid", tier: "collector", price: 0.078, qty: 3, buyer:  "0x8a…fe" },
      { kind: "bid", tier: "collector", price: 0.075, qty: 2, buyer:  "0x33…2b" },
      { kind: "bid", tier: "patron",    price: 0.31,  qty: 1, buyer:  "0x7c…9a" },
    ],
    priceHistory: [0.05, 0.052, 0.058, 0.061, 0.064, 0.068, 0.071, 0.073, 0.076, 0.078, 0.079, 0.081, 0.082, 0.082],
  },
  "ykim-tf": {
    id: "ykim-tf", filmId: "thefence",
    title: "THE FENCE · Producer Credit",
    creator: "Yara Kim",
    creatorId: "ykim",
    color: tkc("cat-3"),
    raised: 92_000, goal: 120_000,
    backers: 312, daysLeft: 4,
    summary: "Co-finance the festival run.",
    floorPrice: 0.06, floorUSD: 162, revShare: 8, royaltyPaid: 4_200,
    nextDistribution: "2026-07-01", chain: "Base", contract: "0x91b…22cd",
    tiers: [
      { id: "collector", name: "Collector", count: 800, sold: 312, price: 0.06, priceUSD: 162, perks: ["96hr premiere window", "Animated end-frame"], color: tkc("ink-4") },
      { id: "patron",    name: "Patron",    count: 100, sold: 41,  price: 0.28, priceUSD: 760, perks: ["Q&A access", "0.05% rev share Y5"], color: tkc("cat-3") },
      { id: "producer",  name: "Producer",  count: 12,  sold: 4,   price: 1.8,  priceUSD: 4800, perks: ["Production credit", "0.5% rev share Y5"], color: tkc("amber") },
    ],
    timeline: [
      { d: "2026-04-01", label: "Mint open", state: "done" },
      { d: "2026-04-15", label: "First festival screening", state: "done" },
      { d: "2026-05-20", label: "Streaming release · holders early", state: "next" },
      { d: "2026-07-01", label: "Q3 distribution", state: "future" },
    ],
    market: [
      { kind: "ask", tier: "collector", price: 0.062, qty: 2, seller: "0x..." },
      { kind: "bid", tier: "collector", price: 0.058, qty: 1, buyer:  "0x..." },
    ],
    priceHistory: [0.04, 0.045, 0.05, 0.055, 0.058, 0.06, 0.062, 0.06, 0.06],
  },
  "reng-fr": {
    id: "reng-fr", filmId: "frequency",
    title: "FREQUENCY 88.6",
    creator: "Tao Reng",
    creatorId: "reng",
    color: tkc("cat-6"),
    raised: 142_000, goal: 200_000, backers: 781, daysLeft: 18,
    summary: "Pirate radio sci-fi · co-finance full release.",
    floorPrice: 0.075, floorUSD: 204, revShare: 10, royaltyPaid: 18_900,
    nextDistribution: "2026-06-15", chain: "Base", contract: "0x4f1…aa9e",
    tiers: [
      { id: "collector", name: "Collector", count: 1200, sold: 781, price: 0.075, priceUSD: 204, perks: ["48hr premiere", "Cassette-art collectible"], color: tkc("ink-4") },
      { id: "patron",    name: "Patron",    count: 200,  sold: 96,  price: 0.32,  priceUSD: 870, perks: ["Director soundboard access", "0.06% rev Y5"], color: tkc("cat-3") },
      { id: "producer",  name: "Producer",  count: 18,   sold: 11,  price: 2.1,   priceUSD: 5700, perks: ["Producer credit", "0.6% rev Y5"], color: tkc("amber") },
    ],
    timeline: [
      { d: "2026-03-22", label: "Mint open", state: "done" },
      { d: "2026-04-30", label: "Premiere window", state: "done" },
      { d: "2026-06-15", label: "Q2 distribution", state: "next" },
    ],
    market: [
      { kind: "ask", tier: "collector", price: 0.078, qty: 4, seller: "0x..." },
      { kind: "ask", tier: "patron",    price: 0.34,  qty: 2, seller: "0x..." },
      { kind: "bid", tier: "collector", price: 0.072, qty: 5, buyer:  "0x..." },
    ],
    priceHistory: [0.05, 0.058, 0.062, 0.066, 0.07, 0.073, 0.075, 0.077, 0.075],
  },
};

// ─── User holdings & wallet ─────────────────────────────────────────────

const USER = {
  handle: "you.eth",
  ens: "you.cina.eth",
  address: "0xA1c4…f3D2",
  walletUSD: 28_413,
  walletETH: 10.45,
  totalEarned: 1_842, // royalties to date
  pendingClaim: 184.20,
  joined: "2025-09",
  tier: "Patron",

  holdings: [
    { projectId: "voss-ll", tier: "patron",    qty: 1, costBasis: 0.32, currentPrice: 0.42, earned: 268.40 },
    { projectId: "voss-ll", tier: "collector", qty: 3, costBasis: 0.075, currentPrice: 0.082, earned: 96.00 },
    { projectId: "reng-fr", tier: "patron",    qty: 1, costBasis: 0.28, currentPrice: 0.32, earned: 142.00 },
    { projectId: "ykim-tf", tier: "collector", qty: 2, costBasis: 0.06, currentPrice: 0.062, earned: 28.00 },
    { projectId: "voss-ll", tier: "producer",  qty: 0, costBasis: 0,     currentPrice: 2.4,  earned: 0,    onWatchlist: true },
  ],

  txHistory: [
    { d: "2026-05-08", kind: "royalty",  project: "voss-ll", desc: "Episode 5 distribution", amount: +84.20, asset: "USDC" },
    { d: "2026-05-02", kind: "buy",      project: "voss-ll", desc: "Patron tier · 1×",      amount: -920,    asset: "USDC" },
    { d: "2026-04-22", kind: "royalty",  project: "voss-ll", desc: "Episode 1 distribution", amount: +44.00, asset: "USDC" },
    { d: "2026-04-15", kind: "royalty",  project: "ykim-tf", desc: "Festival distribution", amount: +28.00, asset: "USDC" },
    { d: "2026-04-08", kind: "buy",      project: "reng-fr", desc: "Patron tier · 1×",      amount: -870,    asset: "USDC" },
    { d: "2026-03-30", kind: "buy",      project: "voss-ll", desc: "Collector · 3×",        amount: -612,    asset: "USDC" },
    { d: "2026-03-22", kind: "royalty",  project: "reng-fr", desc: "Mint allocation",       amount: +120,   asset: "USDC" },
    { d: "2026-03-15", kind: "buy",      project: "ykim-tf", desc: "Collector · 2×",        amount: -324,    asset: "USDC" },
    { d: "2026-02-12", kind: "transfer", project: null,      desc: "Inbound from Coinbase", amount: +5000,  asset: "USDC" },
  ],

  watchlist: ["ll", "marauder", "longhall", "frequency", "kindling"],
  followingCreators: ["voss", "ykim", "reng"],
  alerts: [
    { d: "now",  kind: "drop",     text: "Last Light Episode 6 drops Friday at 7pm",  filmId: "ll", urgent: true },
    { d: "1h",   kind: "royalty",  text: "Royalty: $84.20 from LAST LIGHT · Ep 5",     projectId: "voss-ll" },
    { d: "3h",   kind: "premiere", text: "Verge premiere window opens (24h holder early)", filmId: "verge" },
    { d: "yest", kind: "follow",   text: "Yara Kim posted: \"The Fence is on Letterbox top 50\"", creatorId: "ykim" },
    { d: "2d",   kind: "drop",     text: "Marauder S2 E4 drops Wednesday",             filmId: "marauder" },
    { d: "5d",   kind: "drop",     text: "Long Hall pilot drops May 15",                filmId: "longhall" },
  ],
};

// Hydrate persistent smart-contract wallet & holdings ledger across surfaces
(function _hydrateChainUser() {
  try {
    const saved = JSON.parse(localStorage.getItem("cina:chain:user-ledger") || "null");
    if (saved && typeof saved === "object") {
      if (typeof saved.walletUSD === "number") USER.walletUSD = saved.walletUSD;
      if (typeof saved.walletETH === "number") USER.walletETH = saved.walletETH;
      if (typeof saved.totalEarned === "number") USER.totalEarned = saved.totalEarned;
      if (typeof saved.pendingClaim === "number") USER.pendingClaim = saved.pendingClaim;
      if (Array.isArray(saved.holdings)) USER.holdings = saved.holdings;
      if (Array.isArray(saved.txHistory)) USER.txHistory = saved.txHistory;
    }
  } catch (_) {}
})();

// ─── Helpers exposed ────────────────────────────────────────────────────

// Deterministic per-film randomness: same film id → same figures, on every
// surface and across reloads. `salt` lets one film derive several independent
// values without them correlating.
function _nftRand(filmId) {
  return (salt) => {
    let h = 2166136261 ^ (salt * 0x9e3779b1);
    const s = String(filmId);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13;
    return ((h >>> 0) % 100000) / 100000;
  };
}

// Auto-fill NFT projects for any film that references one but doesn't have an entry,
// so the /nft/:id route never 404s. Generated projects use defaults derived from the film.
CATALOG.forEach(f => {
  if (!f.nft || NFT_PROJECTS[f.nft]) return;
  const isHighProfile = f.views > 200000 || f.kind === "series";
  const goal = isHighProfile ? 180_000 : 90_000;
  // Deterministic per-film pseudo-randomness. These figures were previously
  // Math.random(): they re-rolled on every page load, so the same film showed
  // one number on Watch and a different one on Producers in the same sitting,
  // and a refresh changed the money in front of you. Seeding off the film id
  // makes every surface agree and survive a reload.
  const rnd = _nftRand(f.id);
  const collectorPrice = +(0.04 + rnd(1) * 0.04).toFixed(3);
  const collectorUSD = Math.round(collectorPrice * 2700);
  const patronPrice = +(collectorPrice * 4.2).toFixed(2);
  const producerPrice = +(collectorPrice * 28).toFixed(2);
  const collectorCap = isHighProfile ? 1200 : 600;
  const collectorSold = Math.round(collectorCap * (0.4 + rnd(2) * 0.5));
  // Tier shape first, then money DERIVED from it — the progress bar and the
  // tier table are the same fact, so they can't contradict each other.
  const patronCap = Math.round(collectorCap * 0.18);
  const producerCap = Math.max(6, Math.round(collectorCap * 0.018));
  const patronSold = Math.min(patronCap, Math.round(collectorSold * 0.16));
  const producerSold = Math.min(producerCap, Math.max(1, Math.round(collectorSold * 0.012)));
  const patronUSD = Math.round(patronPrice * 2700);
  const producerUSD = Math.round(producerPrice * 2700);
  const raised = collectorSold * collectorUSD + patronSold * patronUSD + producerSold * producerUSD;
  NFT_PROJECTS[f.nft] = {
    id: f.nft, filmId: f.id,
    title: f.title.toUpperCase(),
    creator: f.creator, creatorId: f.creatorId,
    color: f.color || tkc("cat-3"),
    raised, goal,
    _generated: true,
    backers: collectorSold + patronSold + producerSold,
    daysLeft: 4 + Math.floor(rnd(3) * 22),
    summary: `Co-finance ${f.title}. Holders get premiere access, revenue share through Y5, tiered perks.`,
    floorPrice: collectorPrice, floorUSD: collectorUSD,
    revShare: isHighProfile ? 10 : 8,
    royaltyPaid: Math.round(raised * 0.08),
    nextDistribution: "2026-07-01", chain: "Base",
    contract: "0x" + f.nft.replace(/[^0-9a-f]/gi,"").padEnd(4,"a") + "…" + (1000 + Math.floor(rnd(4) * 8999)).toString(16),
    tiers: [
      { id: "collector", name: "Collector", count: collectorCap, sold: collectorSold, price: collectorPrice, priceUSD: collectorUSD, perks: [`${isHighProfile ? 96 : 48}hr premiere window`, "Animated frame collectible", "Live signal during episode"], color: tkc("ink-4") },
      { id: "patron",    name: "Patron",    count: patronCap, sold: patronSold, price: patronPrice, priceUSD: patronUSD, perks: ["Everything in Collector", "0.05% revenue share Y5", "BTS vault access"], color: tkc("cat-3") },
      { id: "producer",  name: "Producer",  count: producerCap, sold: producerSold, price: producerPrice, priceUSD: producerUSD, perks: ["Everything in Patron", "0.5% revenue share Y5", "Production credit", "Set visit"], color: tkc("amber") },
    ],
    timeline: [
      { d: "2026-04-01", label: "Mint open", state: "done" },
      { d: "2026-04-22", label: "First release · holders early", state: "done" },
      { d: "2026-05-15", label: "Public release", state: "live" },
      { d: "2026-07-01", label: "Q3 distribution", state: "next" },
      { d: "2026-10-01", label: "Q4 distribution + sequel vote", state: "future" },
    ],
    market: [
      { kind: "ask", tier: "collector", price: +(collectorPrice * 1.04).toFixed(3), qty: 2, seller: "0xC1…a2" },
      { kind: "ask", tier: "collector", price: +(collectorPrice * 1.08).toFixed(3), qty: 1, seller: "0x4f…b8" },
      { kind: "ask", tier: "patron",    price: +(patronPrice * 1.05).toFixed(2),    qty: 1, seller: "0xab…3c" },
      { kind: "bid", tier: "collector", price: +(collectorPrice * 0.96).toFixed(3), qty: 3, buyer:  "0x8a…fe" },
      { kind: "bid", tier: "collector", price: +(collectorPrice * 0.92).toFixed(3), qty: 2, buyer:  "0x33…2b" },
      { kind: "bid", tier: "patron",    price: +(patronPrice * 0.94).toFixed(2),    qty: 1, buyer:  "0x7c…9a" },
    ],
    // Seeded, so a token's 12-month chart keeps its shape between visits
    // instead of redrawing a different history every load.
    priceHistory: Array.from({ length: 12 }, (_, i) => +(collectorPrice * (0.7 + i * 0.025 + (rnd(20 + i) - 0.5) * 0.02)).toFixed(3)),
    autoGenerated: true,
  };
});

// ─── Revenue streams + past results: enrich every NFT project ───────────
// Per-source yield buckets so holders can SEE and CLAIM from each stream
// (ad revenue, subscriptions, secondary sales, theatrical/licensing).

Object.values(NFT_PROJECTS).forEach(p => {
  const film = CATALOG.find(f => f.id === p.filmId) || {};
  const views = film.views || 80_000;
  const isHigh = views > 200_000 || film.kind === "series";

  // Total cumulative payout to date (all sources combined)
  const total = p.royaltyPaid || Math.round((p.raised || 100_000) * 0.18);

  // Source breakdown (% of total)
  const adPct  = isHigh ? 0.42 : 0.36;
  const subPct = isHigh ? 0.31 : 0.28;
  const salePct = isHigh ? 0.17 : 0.22;
  const licPct = 1 - adPct - subPct - salePct;

  p.revenue = {
    total,
    sources: {
      ad:    { name: "Ad revenue",    color: tkc("amber"), paid: Math.round(total * adPct),  monthly: Math.round((total * adPct) / 8),  description: "Pre-roll + mid-roll + sponsor reads" },
      sub:   { name: "Subscriptions", color: tkc("cat-5"), paid: Math.round(total * subPct), monthly: Math.round((total * subPct) / 8), description: "Channel + studio sub share" },
      sale:  { name: "Secondary",     color: tkc("cat-2"), paid: Math.round(total * salePct), monthly: Math.round((total * salePct) / 8), description: "5% royalty on resale" },
      lic:   { name: "Licensing",     color: tkc("cat-3"), paid: Math.round(total * licPct),  monthly: Math.round((total * licPct) / 8),  description: "Theatrical + distribution deals" },
    },
    monthlyHistory: Array.from({ length: 8 }, (_, i) => {
      const base = total / 12;
      const trend = 1 + (i / 8) * 0.4;
      const noise = 0.85 + Math.random() * 0.3;
      return Math.round(base * trend * noise);
    }),
  };

  // 12-month forward yield projection (low/expected/high)
  const annual = Math.round(total * 1.6);
  p.projection = {
    low:      Math.round(annual * 0.65),
    expected: annual,
    high:     Math.round(annual * 1.45),
    yieldPct: ((annual / (p.raised || 100_000)) * 100).toFixed(1),
  };
});

// ─── Director track records (past results for new investors) ────────────
// Returns { id, films, hitRate, avgROI, totalReturned, history }

const DIRECTOR_TRACK = {
  voss: {
    films: [
      { id: "ll",     title: "Last Light",       year: 2026, raised: 184_200, returned: 38_400, views: 412_000, ongoing: true,  rating: 4.7 },
      { id: "static", title: "Static Country",   year: 2024, raised: 60_000,  returned: 71_200, views: 184_000, ongoing: false, rating: 4.4 },
      { id: "lowtide",title: "Low Tide",         year: 2023, raised: 42_000,  returned: 38_800, views: 96_000,  ongoing: false, rating: 4.1 },
    ],
    hitRate: 0.83, avgROI: 1.34, totalReturned: 148_400,
  },
  ykim: {
    films: [
      { id: "thefence", title: "The Fence",      year: 2026, raised: 92_000,  returned: 4_200,  views: 28_400,  ongoing: true,  rating: 4.5 },
      { id: "deltawk",  title: "Delta Walk",     year: 2024, raised: 38_000,  returned: 41_200, views: 72_000,  ongoing: false, rating: 4.2 },
    ],
    hitRate: 0.5, avgROI: 1.08, totalReturned: 45_400,
  },
  reng: {
    films: [
      { id: "frequency", title: "Frequency 88.6", year: 2026, raised: 142_000, returned: 18_900, views: 218_000, ongoing: true, rating: 4.6 },
      { id: "shortwave", title: "Shortwave",      year: 2025, raised: 80_000,  returned: 93_000, views: 162_000, ongoing: false, rating: 4.3 },
      { id: "hammr",     title: "Hammr",          year: 2023, raised: 50_000,  returned: 22_000, views: 41_000,  ongoing: false, rating: 3.7 },
    ],
    hitRate: 0.67, avgROI: 1.21, totalReturned: 133_900,
  },
};

// ─── User holder claim buckets (per source) ─────────────────────────────
// What's claimable RIGHT NOW from each stream, across user's holdings
USER.claimable = {
  ad:   124.80,
  sub:  68.40,
  sale: 32.10,
  lic:  18.50,
  get total() { return this.ad + this.sub + this.sale + this.lic; },
};

// Per-holding source breakdown of earnings (so portfolio can show splits)
USER.holdings.forEach(h => {
  const earned = h.earned || 0;
  h.earnedBy = {
    ad:   +(earned * 0.42).toFixed(2),
    sub:  +(earned * 0.30).toFixed(2),
    sale: +(earned * 0.18).toFixed(2),
    lic:  +(earned * 0.10).toFixed(2),
  };
});

// ─── Funding invariant ──────────────────────────────────────────────────
// A project states `raised` and also lists per-tier sales. Those are the same
// fact told twice, and they disagreed by 36–530% across the slate: the
// progress bar said one thing, the tier table another, and anyone who did the
// multiplication caught it. Authored projects carry a deliberate
// raised/goal story ("$184.2k of $250k, 11 days left"), so `raised` is the
// source of truth and the sold counts are back-solved from it, richest tier
// first, respecting each tier's cap.
function _reconcileFunding(p) {
  const tiers = p.tiers || [];
  if (!tiers.length || !p.raised) return;
  const priced = tiers
    .map((t, i) => ({ t, i, usd: t.priceUSD || 0, cap: t.count != null ? t.count : t.supply || 0 }))
    .filter(x => x.usd > 0)
    .sort((a, b) => b.usd - a.usd);
  if (!priced.length) return;

  let left = p.raised;
  // Fill from the top tier down, but never past ~85% of a cap — a raise with
  // every premium tier sold out reads as closed, not open.
  priced.forEach((x, n) => {
    const isLast = n === priced.length - 1;
    if (isLast) {
      x.t.sold = Math.max(0, Math.min(x.cap, Math.round(left / x.usd)));
      left -= x.t.sold * x.usd;
      return;
    }
    const share = n === 0 ? 0.28 : 0.3;                 // premium tiers carry less volume
    const want = Math.floor((p.raised * share) / x.usd);
    x.t.sold = Math.max(1, Math.min(Math.floor(x.cap * 0.85), want));
    left -= x.t.sold * x.usd;
  });

  // Any rounding remainder rides on the cheapest tier, which has the headroom.
  const cheapest = priced[priced.length - 1];
  if (left !== 0) {
    cheapest.t.sold = Math.max(0, Math.min(cheapest.cap, cheapest.t.sold + Math.round(left / cheapest.usd)));
  }
  // `raised` is now exactly what the tier table adds up to.
  p.raised = tiers.reduce((a, t) => a + (t.sold || 0) * (t.priceUSD || 0), 0);
  p.backers = tiers.reduce((a, t) => a + (t.sold || 0), 0);
  if (p.royaltyPaid == null) p.royaltyPaid = Math.round(p.raised * 0.08);

  // Generated projects carried a flat $90k/$180k goal, so once `raised` came
  // from real tier sales 21 of 27 read as 150%+ funded — a slate where almost
  // everything is overfunded is as unconvincing as one where the numbers
  // don't add up. Derive the goal from the raise instead, seeded per film, so
  // the market shows a believable spread: mostly mid-raise, a few closed out.
  if (p._generated) {
    const target = 0.34 + _nftRand(p.filmId || p.id)(7) * 0.58;   // 34–92% funded
    const rawGoal = p.raised / target;
    // Round to a figure a producer would actually publish.
    const step = rawGoal > 400000 ? 50000 : rawGoal > 150000 ? 25000 : 10000;
    p.goal = Math.max(p.raised > 0 ? step : 0, Math.round(rawGoal / step) * step);
    delete p._generated;
  }
}
Object.values(NFT_PROJECTS).forEach(_reconcileFunding);

function getFilm(id) { return CATALOG.find(f => f.id === id); }
function getCreator(id) { return CREATORS.find(c => c.id === id); }

Object.assign(window, { CATALOG, SHELVES, CREATORS, REVIEWS_FOR_LL, NFT_PROJECTS, USER, getFilm, getCreator, PROGRAMMER, PROGRAMMER_NOTES });
