// data.jsx — Film Bible content for the prototype.
// Demo project: "LAST LIGHT" — a neo-noir thriller. Director's choice.

const PROJECTS = [
  {
    id: "p1", title: "LAST LIGHT", code: "LL-01",
    kind: "movie",
    status: "in production", stage: "shooting",
    shots: 47, completed: 32, runtime: "1h 42m",
    cover: tkc("blood"),
    genre: "Neo-Noir Thriller",
    director: "Cina + you",
    updated: "2h ago",
    progress: 0.68,
    // Public viewing stats
    published: true,
    views: 142_835,
    avgWatch: 0.78,            // % of runtime watched on average
    completionRate: 0.61,      // % who finish
    likes: 8421,
    comments: 312,
    shares: 1840,
    countries: 47,
    topRegion: "United States",
    rating: 4.7,
    ratings: 1284,
    // Daily views, last 14 days
    dailyViews: [4200, 5100, 4800, 6300, 7100, 9400, 12800, 14200, 13100, 16800, 18400, 15600, 11200, 8400],
    // Drop-off curve, 100 points across runtime
    retention: [100,99,98,97,96,95,93,91,89,88,87,87,86,85,84,84,83,82,82,81,80,79,79,78,78,77,77,76,76,75,75,74,74,73,73,72,72,71,71,70,69,69,68,68,67,67,66,66,65,65,64,64,63,63,62,62,61,61,60,60,59,59,58,58,57,57,56,56,55,55,54,54,53,53,52,52,51,51,50,50,49,49,48,48,47,47,46,46,45,45,44,44,43,43,42,41,40,38,35,30],
  },
  {
    id: "p2", title: "THE LONG HALL", code: "TLH-02",
    kind: "series",
    season: 1, episodes: 8, epDone: 2, epReleased: 0, cadence: "weekly",
    status: "storyboard", stage: "boarding",
    shots: 22, completed: 8, runtime: "8 × ~24m",
    cover: tkc("line-3"),
    genre: "Slow Horror",
    director: "Cina + you",
    updated: "yesterday",
    progress: 0.31,
    published: false,
  },
  {
    id: "p3", title: "MARAUDER", code: "MRD-03",
    kind: "branched",
    forks: 4, cuts: 18,
    status: "script", stage: "writing",
    shots: 0, completed: 0, runtime: "1h 30m + 4 forks",
    cover: tkc("panel-3"),
    genre: "Heist",
    director: "Cina + you",
    updated: "3d ago",
    progress: 0.12,
    published: false,
  },
  {
    id: "p4", title: "Untitled / 04", code: "UN-04",
    kind: "movie",
    status: "draft", stage: "pitch",
    shots: 0, completed: 0, runtime: "—",
    cover: tkc("panel-2"),
    genre: "—",
    director: "—",
    updated: "1w ago",
    progress: 0.02,
    published: false,
  },
  {
    id: "p5", title: "BLUEJAY", code: "BJ-05",
    kind: "movie",
    status: "released", stage: "released",
    shots: 38, completed: 38, runtime: "0h 28m",
    cover: tkc("cat-1"),
    genre: "Drama Short",
    director: "Cina + you",
    updated: "released 6w ago",
    progress: 1.0,
    published: true,
    views: 481_220,
    avgWatch: 0.86,
    completionRate: 0.74,
    likes: 32_140,
    comments: 1_092,
    shares: 6_480,
    countries: 89,
    topRegion: "Japan",
    rating: 4.9,
    ratings: 4_211,
    dailyViews: [38000, 42000, 51000, 48000, 39000, 32000, 28000, 24000, 22000, 19000, 17000, 15000, 14000, 13000],
    retention: [100,99,99,98,98,97,97,96,96,95,95,94,94,94,93,93,93,92,92,92,91,91,91,90,90,90,90,89,89,89,89,88,88,88,88,88,87,87,87,87,87,86,86,86,86,86,85,85,85,85,85,85,84,84,84,84,84,84,83,83,83,83,83,83,82,82,82,82,82,82,81,81,81,81,81,81,80,80,80,80,80,80,79,79,79,79,79,79,78,78,78,77,76,75,74,73,72,70,68,65],
  },
];

const FILM_BIBLE = {
  title: "LAST LIGHT",
  logline: "A retired forensic photographer is hired to authenticate a single roll of film — and discovers it documents a murder that hasn't happened yet.",
  genre: ["Neo-Noir", "Psychological Thriller"],
  tone: "Cold, deliberate, claustrophobic. Long silences. Cigarette smoke under sodium light.",
  director_dna: [
    { name: "Fincher", weight: 0.42, note: "Surgical framing. Static cameras. Greens that aren't quite green." },
    { name: "Hitchcock", weight: 0.28, note: "Suspense from withheld information. POV shots tied to the lens." },
    { name: "Nolan",     weight: 0.18, note: "Recursive structure — the photo loops back on itself." },
    { name: "Kubrick",   weight: 0.12, note: "One-point perspective in the darkroom corridor." },
  ],
  palette: [
    { name: "Sodium",  hex: tkc("amber"), usage: "street lamps, taxi interiors, the safelight" },
    { name: "Blood",   hex: tkc("blood"), usage: "the only red allowed on screen" },
    { name: "Gunmetal", hex: tkc("line-2"), usage: "the city, costumes, every shadow" },
    { name: "Bone",    hex: tkc("cat-4"), usage: "skin, paper, the photographs themselves" },
    { name: "Void",    hex: tkc("void"), usage: "negative space, frame edges, the unknown" },
  ],
  rules: [
    "No handheld. Camera is on sticks or a dolly. Always.",
    "Practical light only. If a light source isn't in frame or motivated, it doesn't exist.",
    "No score during dialogue. Diegetic sound only between speakers.",
    "Faces are lit from one side. The other side is gone.",
    "Red appears exactly seven times in the film. We have used it four.",
  ],
};

const CHARACTERS = [
  {
    id: "c1",
    name: "AUGUST REIN",
    role: "Protagonist",
    castId: "evren-koll",
    castName: "Evren Koll",
    photo: "assets/cast/evren-koll.png",
    age: 58,
    desc: "Forensic photographer, retired. Hands shake unless he's holding a camera. Drinks bourbon in coffee cups.",
    traits: ["weary", "precise", "haunted"],
    color: tkc("cat-4"),
    refs: 12,
    archetype: "The Watcher",
    range: ["Drama", "Noir"],
    voice: "Baritone · Quiet",
    credits: 1840, // ML credits earned (royalties from appearances)
    films: 3,      // films appeared in
    training: 96,  // training % (avg of 4 metrics)
    lastUsed: "Today",
    seed: 117,
    palette: [tkc("cat-3"), tkc("on-amber"), tkc("amber-x")],
  },
  {
    id: "c2",
    name: "MAREN KELL",
    role: "Antagonist",
    castId: "nadya-ash",
    castName: "Nadya Ash",
    photo: "assets/cast/nadya-ash.png",
    age: 34,
    desc: "Gallerist. Commissions the authentication. Knows more than she says, says less than she knows.",
    traits: ["composed", "lethal", "deliberate"],
    color: tkc("blood"),
    refs: 8,
    archetype: "The Almost-Sayer",
    range: ["Drama", "Thriller"],
    voice: "Mezzo · Smoke",
    credits: 920,
    films: 2,
    training: 84,
    lastUsed: "2 days ago",
    seed: 134,
    palette: [tkc("blood"), tkc("void"), tkc("blood-x")],
  },
  {
    id: "c3",
    name: "DET. ARI NOMURA",
    role: "Supporting",
    castId: "domek-ari",
    castName: "Domek Ari",
    photo: "assets/cast/domek-ari.png",
    age: 41,
    desc: "Detective. Old colleague. The only person Voss still answers the phone for.",
    traits: ["loyal", "tired", "blunt"],
    color: tkc("cat-1"),
    refs: 5,
    archetype: "The Captain",
    range: ["Drama", "Crime"],
    voice: "Baritone · Warm",
    credits: 540,
    films: 2,
    training: 78,
    lastUsed: "5 days ago",
    seed: 151,
    palette: [tkc("cat-6"), tkc("bg"), tkc("cat-1")],
  },
  {
    id: "c4",
    name: "THE SUBJECT",
    role: "Victim",
    castId: "siri-vale",
    castName: "Siri Vale",
    photo: "assets/cast/siri-vale.png",
    age: 27,
    desc: "The woman in the photograph. We see her three times before we learn her name.",
    traits: ["unaware", "luminous", "doomed"],
    color: tkc("amber"),
    refs: 3,
    archetype: "The Witness",
    range: ["Drama"],
    voice: "Soprano · Bright",
    credits: 280,
    films: 1,
    training: 62,
    lastUsed: "3 weeks ago",
    seed: 168,
    palette: [tkc("amber-d"), tkc("panel-2"), tkc("amber-x")],
  },
];

// Storyboard — Scene 14: "The Darkroom"
const STORYBOARD = [
  { id: "s1",  scene: "14", shot: "A", type: "EST",   lens: "35mm",  duration: "0:08", desc: "Exterior. Voss's apartment building. Rain. Sodium light pools.",  status: "approved", thumb: "darkroom-est" },
  { id: "s2",  scene: "14", shot: "B", type: "MS",    lens: "50mm",  duration: "0:04", desc: "Voss enters the darkroom. Red safelight clicks on.",            status: "approved", thumb: "voss-enter" },
  { id: "s3",  scene: "14", shot: "C", type: "CU",    lens: "85mm",  duration: "0:06", desc: "Photo paper sliding into developer. Image emerging.",            status: "approved", thumb: "developer" },
  { id: "s4",  scene: "14", shot: "D", type: "ECU",   lens: "100mm", duration: "0:03", desc: "Voss's eye. Pupil dilating. Tears welling but not falling.",     status: "review",   thumb: "voss-eye" },
  { id: "s5",  scene: "14", shot: "E", type: "POV",   lens: "35mm",  duration: "0:05", desc: "What Voss sees in the photo. Her. The window. The shape behind.", status: "review",   thumb: "the-photo" },
  { id: "s6",  scene: "14", shot: "F", type: "WS",    lens: "24mm",  duration: "0:09", desc: "Wide of darkroom. Voss lowers the photograph. Sits.",            status: "draft",    thumb: "darkroom-wide" },
  { id: "s7",  scene: "14", shot: "G", type: "INS",   lens: "100mm", duration: "0:02", desc: "Insert: timestamp on the film canister. Three days from now.",   status: "draft",    thumb: "timestamp" },
  { id: "s8",  scene: "14", shot: "H", type: "MS",    lens: "50mm",  duration: "0:07", desc: "Voss reaches for the phone. Stops. Doesn't.",                    status: "queued",   thumb: "phone" },
];

const AGENTS = [
  { id: "director", name: "Director",  glyph: "D",  role: "Vision · Shot Design · Routing",       color: "var(--c-agent-director)", status: "active",   load: 0.62 },
  { id: "writer",   name: "Writer",    glyph: "W",  role: "Script · Dialogue · Structure",         color: tkc("cat-4"),   status: "idle",     load: 0.12 },
  { id: "visual",   name: "Visual",    glyph: "V",  role: "Storyboard · Character · Set",          color: tkc("cat-1"),   status: "rendering", load: 0.88 },
  { id: "editor",   name: "Editor",    glyph: "E",  role: "QC · Flaw Detection · Polish",          color: "var(--c-agent-editor)",   status: "active",   load: 0.45 },
  { id: "audio",    name: "Audio",     glyph: "A",  role: "Voice · Score · SFX",                    color: tkc("cat-2"),    status: "idle",     load: 0.05 },
];

// Chat seed — quiet opening exchange.
const CHAT_SEED = [
  {
    id: "m1", who: "user", time: "09:14",
    text: "Scene 14 — the darkroom. Hold a breath.",
  },
  {
    id: "m2", who: "cina", agent: "director", time: "09:14",
    scene: "Sodium through the blinds. A fluorescent dying somewhere down the hall.",
    text: "Hold on him. No score, no cut to her face. The realization lives in his eye.",
    actions: [
      { agent: "writer",  text: "Cut the dialogue tag on D. He says nothing." },
      { agent: "visual",  text: "Single safelight, 220° camera-right." },
      { agent: "editor",  text: "Locking iris on the ECU." },
    ],
    suggestions: ["Approve", "Show the board", "Tighten further"],
  },
  {
    id: "m3", who: "user", time: "09:16",
    text: "Tighten. Too many shots for one realization.",
  },
  {
    id: "m4", who: "cina", agent: "director", time: "09:16",
    scene: "Eight shots for a man understanding something. He's right.",
    text: "Cut F and H. Six shots. Ninety-eight seconds. The math serves the silence.",
    diff: { removed: ["14F · WS", "14H · MS"], kept: 6 },
    suggestions: ["Apply", "Keep H", "Compare"],
  },
];

// Reference library (mock)
const REFERENCES = [
  { id: "r1", source: "Se7en (1995)",          tag: "rain · sodium",   note: "Opening rooftop." },
  { id: "r2", source: "Blade Runner (1982)",   tag: "interior · neon", note: "Deckard's apt." },
  { id: "r3", source: "Klute (1971)",           tag: "darkroom",        note: "Reference for safelight wash." },
  { id: "r4", source: "user-upload-0341.jpg",   tag: "location",        note: "Voss's building. Approved." },
  { id: "r5", source: "Chinatown (1974)",       tag: "lens · 35mm",     note: "Compression on close-ups." },
];

// Activity log feed
const ACTIVITY = [
  { t: "now",     agent: "visual", text: "Rendering 14E · POV · v3 · seed 8841" },
  { t: "12s",     agent: "editor", text: "QC pass on 14D — no warp detected. ✓" },
  { t: "01m",     agent: "writer", text: "Trimmed dialogue: scene 14, line 02." },
  { t: "04m",     agent: "audio",  text: "Score sketch v2 — ambient pad, 62 BPM." },
  { t: "11m",     agent: "director", text: "Routed 14E to Veo-3 (motion priority)." },
  { t: "23m",     agent: "editor", text: "Flag: 14F has 2 frames of light spill. Fixed." },
  { t: "47m",     agent: "visual", text: "Generated character ref — Voss · v7." },
];

// =================================================================
// SCRIPT — full screenplay format. Slugs / action / character / dialogue / paren / transition.
// =================================================================
const SCRIPT_SCENES = [
  {
    id: "sc12", number: "12", slug: "INT. VOSS'S APARTMENT — NIGHT",
    location: "Voss's Apartment", timeOfDay: "NIGHT",
    pages: 1.2, status: "locked",
    summary: "Voss returns home. Examines the canister. Doesn't sleep.",
    elements: [
      { kind: "action", text: "VOSS (58, weathered, the kind of tired that doesn't go away) lets himself in. Doesn't turn the lights on. Crosses to the window." },
      { kind: "action", text: "He places a small black FILM CANISTER on the desk. Stares at it." },
      { kind: "action", text: "From the street below, sodium light pools on the wall. He doesn't move." },
      { kind: "transition", text: "CUT TO:" },
    ],
  },
  {
    id: "sc13", number: "13", slug: "INT. VOSS'S APARTMENT — KITCHEN — LATER",
    location: "Voss's Apartment", timeOfDay: "NIGHT",
    pages: 0.6, status: "locked",
    summary: "He pours bourbon into a coffee cup. Takes the canister into the darkroom.",
    elements: [
      { kind: "action", text: "Voss pours bourbon into a coffee cup. Drinks half of it standing up." },
      { kind: "action", text: "He picks up the canister. Walks toward a closed door at the end of the hall." },
    ],
  },
  {
    id: "sc14", number: "14", slug: "INT. VOSS'S APARTMENT — DARKROOM — CONTINUOUS",
    location: "Voss's Apartment", timeOfDay: "NIGHT",
    pages: 2.4, status: "writing",
    summary: "He develops the photograph. Sees what's in it. The film holds something that hasn't happened.",
    elements: [
      { kind: "action", text: "The room is small. Smaller than it should be. A red SAFELIGHT clicks on, washing everything." },
      { kind: "action", text: "Voss works in silence. The motions are old. Hands that haven't shaken in decades." },
      { kind: "action", text: "He slides photo paper into developer. Watches the image emerge." },
      { kind: "character", text: "VOSS" },
      { kind: "paren", text: "(quiet)" },
      { kind: "dialogue", text: "What did you bring me." },
      { kind: "action", text: "An IMAGE forms. A WOMAN, mid-twenties, at a window. Backlit. Beautiful. And behind her — a SHAPE. A figure. Not yet whole." },
      { kind: "action", text: "Voss leans closer. The image keeps forming. The shape keeps becoming." },
      { kind: "action", text: "He picks up the FILM CANISTER. Reads the timestamp etched into the side." },
      { kind: "character", text: "VOSS (CONT'D)" },
      { kind: "dialogue", text: "...this is three days from now." },
      { kind: "action", text: "He sets the photo down. Reaches for the phone on the wall. His hand stops, mid-air." },
      { kind: "action", text: "He doesn't pick it up." },
      { kind: "action", text: "The safelight hums." },
    ],
  },
  {
    id: "sc15", number: "15", slug: "EXT. STREET — DAWN",
    location: "City Street", timeOfDay: "DAWN",
    pages: 0.8, status: "draft",
    summary: "The sun comes up. He hasn't slept. He has a plan.",
    elements: [
      { kind: "action", text: "First light. Voss leaves the building, coat collar up, the canister in his pocket." },
      { kind: "action", text: "He walks east, toward the sun. Doesn't look back." },
    ],
  },
];

// =================================================================
// VIDEO EDITOR — multi-track timeline.
// =================================================================
const TIMELINE_CLIPS = {
  // Each track has clips with start (s), duration (s), label, source
  V2: [
    { id: "v2-1", start: 12, dur: 4,  label: "TITLE: LAST LIGHT",   kind: "title", color: tkc("amber") },
    { id: "v2-2", start: 88, dur: 3,  label: "INSERT · timestamp",  kind: "insert", color: tkc("cat-1") },
  ],
  V1: [
    { id: "v1-1", start: 0,   dur: 8,  label: "14A · EST · rain",         kind: "shot", color: tkc("line-3"), thumb: "darkroom-est" },
    { id: "v1-2", start: 8,   dur: 4,  label: "14B · MS · enter",         kind: "shot", color: tkc("panel-3"), thumb: "voss-enter" },
    { id: "v1-3", start: 12,  dur: 6,  label: "14C · CU · developer",     kind: "shot", color: tkc("line-2"), thumb: "developer" },
    { id: "v1-4", start: 18,  dur: 3,  label: "14D · ECU · eye",          kind: "shot", color: tkc("blood"), thumb: "voss-eye" },
    { id: "v1-5", start: 21,  dur: 5,  label: "14E · POV · photo",        kind: "shot", color: tkc("panel-2"), thumb: "the-photo" },
    { id: "v1-6", start: 26,  dur: 9,  label: "14F · WS · darkroom",      kind: "shot", color: tkc("line-2"), thumb: "darkroom-wide" },
    { id: "v1-7", start: 35,  dur: 2,  label: "14G · INS · canister",     kind: "shot", color: tkc("line-3"), thumb: "timestamp" },
    { id: "v1-8", start: 37,  dur: 7,  label: "14H · MS · phone",         kind: "shot", color: tkc("panel-3"), thumb: "phone" },
    { id: "v1-9", start: 44,  dur: 8,  label: "15A · EXT · dawn",         kind: "shot", color: tkc("cat-1"), thumb: "dawn" },
  ],
  A1: [ // dialogue
    { id: "a1-1", start: 14, dur: 1.5, label: "VOSS — \u201cWhat did you bring me\u201d", kind: "dialogue", color: tkc("cat-4") },
    { id: "a1-2", start: 33, dur: 2.2, label: "VOSS — \u201cthree days from now\u201d", kind: "dialogue", color: tkc("cat-4") },
  ],
  A2: [ // sfx
    { id: "a2-1", start: 8,  dur: 0.4, label: "click · safelight",         kind: "sfx", color: tkc("cat-1") },
    { id: "a2-2", start: 16, dur: 1.0, label: "splash · developer",        kind: "sfx", color: tkc("cat-1") },
    { id: "a2-3", start: 38, dur: 0.6, label: "phone · hesitation",        kind: "sfx", color: tkc("cat-1") },
  ],
  A3: [ // score / ambience
    { id: "a3-1", start: 0,  dur: 52,  label: "AMB · room tone · sodium hum", kind: "amb", color: tkc("line-2") },
    { id: "a3-2", start: 44, dur: 8,   label: "SCORE · pad · 62bpm",          kind: "score", color: tkc("blood") },
  ],
};

// =================================================================
// AI GENERATION — prompt → shot. Models, references, history.
// =================================================================
const GEN_PRESETS = [
  { id: "veo3",     name: "Veo 3",        vendor: "Google",     strength: "Motion · long takes",     speed: 0.6, fidelity: 0.92, cost: 12 },
  { id: "kling",    name: "Kling 2.0",    vendor: "Kuaishou",   strength: "Camera moves · physics",   speed: 0.7, fidelity: 0.86, cost: 8 },
  { id: "runway-g3", name: "Gen-3 Alpha",  vendor: "Runway",     strength: "Stylized · color grade",   speed: 0.85, fidelity: 0.78, cost: 6 },
  { id: "sora",     name: "Sora",         vendor: "OpenAI",     strength: "Composition · faces",       speed: 0.55, fidelity: 0.94, cost: 14 },
  { id: "pika",     name: "Pika 1.5",     vendor: "Pika",       strength: "Quick iteration",           speed: 0.95, fidelity: 0.7, cost: 3 },
];

const GEN_HISTORY = [
  { id: "g1", shot: "14E", v: 3, model: "veo3",  seed: 8841, status: "rendering", progress: 0.62, prompt: "POV through a darkroom safelight wash. A photograph in developer, image emerging. Woman backlit at a window. A figure forming behind her. 35mm. Static. No camera move." },
  { id: "g2", shot: "14E", v: 2, model: "kling", seed: 4412, status: "complete",  progress: 1.0,  prompt: "POV. Same. Slower emergence. Less contrast on the figure." },
  { id: "g3", shot: "14D", v: 4, model: "sora",  seed: 9921, status: "complete",  progress: 1.0,  prompt: "ECU on a man's eye. Sodium reflection in the iris. Pupil dilates. Tears well, do not fall. 100mm. 6 seconds." },
  { id: "g4", shot: "14C", v: 2, model: "veo3",  seed: 1188, status: "complete",  progress: 1.0,  prompt: "CU on photo paper sliding into developer tray. Image emerging slowly. Red safelight only. 85mm." },
  { id: "g5", shot: "14B", v: 1, model: "runway-g3", seed: 2204, status: "rejected", progress: 1.0, prompt: "Voss enters darkroom. Safelight clicks on. — rejected: too clean. Dust." },
  { id: "g6", shot: "14A", v: 3, model: "veo3", seed: 7733, status: "complete",  progress: 1.0,  prompt: "Establishing. Apartment building, rain, sodium pools. 35mm. 8 seconds." },
];

// Format metadata — the three kinds of thing you can make. Shared by the
// homepage type chooser, slate badges and the studio format tag.
const CINA_FORMATS = {
  movie: {
    key: "movie", label: "Film", tag: "FILM",
    tagline: "A single-cut feature or short.",
    blurb: "One arc, one ending. A lean linear pipeline — script to board to render to final cut.",
    flow: ["Script", "Board", "Generate", "Editor", "Final cut"],
  },
  series: {
    key: "series", label: "Series", tag: "SERIES",
    tagline: "Multi-episode arc on one bible.",
    blurb: "One world, many entries. Lock the bible once, then ship episodes on cadence.",
    flow: ["Bible", "Writers' room", "Episodes", "Cuts", "Release"],
  },
  branched: {
    key: "branched", label: "Branch", tag: "BRANCH",
    tagline: "Choose-your-own-adventure cinema.",
    blurb: "One spine, many endings. Audiences vote on forks; every chosen cut locks as canon.",
    flow: ["Spine", "Forks", "Board", "Generate", "Branch cuts"],
  },
};

Object.assign(window, { PROJECTS, FILM_BIBLE, CHARACTERS, STORYBOARD, AGENTS, CHAT_SEED, REFERENCES, ACTIVITY, SCRIPT_SCENES, TIMELINE_CLIPS, GEN_PRESETS, GEN_HISTORY, CINA_FORMATS });
