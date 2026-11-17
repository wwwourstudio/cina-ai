// launched-rooms.jsx — Projects launched through the Producers create flow
// become real objects on Watch: a branched room at /branches/:id and a live
// entry in the market tape. Reads the same localStorage record the create
// flow writes, so a launch on one surface shows up on the other.

function lrLaunched() {
  if (window.__cinaLaunched) return window.__cinaLaunched;
  try { window.__cinaLaunched = JSON.parse(localStorage.getItem("cina-launched-v1")) || []; }
  catch (_) { window.__cinaLaunched = []; }
  return window.__cinaLaunched;
}

const LR_GLYPHS = ["◆", "△", "□", "●", "▲", "■"];
const LR_TONES = ["score-forward · 7m", "near-silent · 4m", "tape hiss · 5m", "long-take · 11m", "intimate · 6m"];

// Expand a create-flow fork spec into the full tree shape the viewer expects.
function lrTree(proj) {
  const b = proj.branch;
  if (!b) return null;
  const per = b.optionsPerFork || 3;
  const spec = b.forkSpec || [];
  const forks = spec.map((f, i) => ({
    id: "f" + (i + 1),
    actLabel: f.act || "ACT " + (i + 1),
    actNum: String(i + 1).padStart(2, "0"),
    atMinute: f.at || 12 + i * 18,
    heading: f.heading || "A decision.",
    setup: f.heading || "The film stops here and the room decides.",
    question: f.question || "What happens?",
    options: Array.from({ length: per }, (_, j) => ({
      id: "o" + j,
      glyph: LR_GLYPHS[j % LR_GLYPHS.length],
      title: ["Take it", "Refuse", "Wait", "Run", "Answer"][j % 5],
      beat: "Written on the night — the room has not seen this branch yet.",
      tone: LR_TONES[(i + j) % LR_TONES.length],
      color: j === 0 ? (b.accent || tkc("amber")) : [tkc("ink-3"), tkc("cat-1"), tkc("cat-2"), tkc("bad")][j % 4],
      votes: 0,
      leading: j === 0,
    })),
  }));
  const dir = proj.creator || "You";
  return {
    filmId: proj.filmId || proj.id,
    title: proj.film?.title || proj.title,
    director: dir,
    directorInitials: dir.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase(),
    accentColor: b.accent || tkc("amber"),
    poster: proj.thumb,
    totalRuntimeMin: proj.film?.runtime || 96,
    totalCuts: b.totalCuts || Math.pow(per, forks.length),
    roomSize: 0,
    lobbyBlurb: proj.summary || "A new branched room. The first screening has not happened yet.",
    genre: [proj.film?.genre || "New"],
    rating: null,
    yourCutAtMinute: 0,
    justLaunched: true,
    forks,
    chatSeed: [
      { who: "@" + dir.split(" ")[0].toLowerCase(), text: "doors open for the first time tonight.", color: b.accent || tkc("amber") },
    ],
  };
}

// Register every launched branched project into BRANCH_FILMS.
function lrRegister() {
  const map = window.BRANCH_FILMS;
  if (!map) return 0;
  let n = 0;
  lrLaunched().forEach(p => {
    if (!p.branched || !p.branch) return;
    const id = p.filmId || p.id;
    if (map[id]) return;
    const t = lrTree(p);
    if (t) { map[id] = t; n++; }
  });
  return n;
}

lrRegister();
window.addEventListener("cina-project-launched", lrRegister);
window.addEventListener("storage", e => { if (e.key === "cina-launched-v1") { window.__cinaLaunched = null; lrRegister(); } });

