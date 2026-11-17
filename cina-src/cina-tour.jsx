// cina-tour.jsx — Ordered step-by-step filmmaking walkthrough:
// 01 Build DNA → 02 Write Script → 03 Cast Actors → 04 Make Stills →
// 05 Generate Video → 06 Cut & Score → 07 Chained Splits & Premiere.
//
// Start it from anywhere: window.dispatchEvent(new CustomEvent("cina:start-tour", { detail: { kind } }))

const { useState: useStateTour, useEffect: useEffectTour } = React;

function tourSteps(kind) {
  const fmt = kind === "series" ? "series" : kind === "branched" ? "branched film" : "film";
  const steps = [
    { id: "bible",    g: "STEP 01 · BUILD DNA",   title: "Build the Film DNA",      body: `Start every ${fmt} here. Lock visual tone, lens grammar, color palette, and canon rules — every downstream tool inherits your DNA.` },
    { id: "script",   g: "STEP 02 · WRITE SCRIPT",title: "Write & Break the Script",body: "Draft scenes, dialogue, and beat breakdowns with the writer crew before casting or rendering." },
    ...(kind === "series" ? [
      { id: "episodes", g: "STEP 02 · SERIES",    title: "Plan Season Episodes",    body: "Map the season arc. Each episode inherits the series DNA and cast." },
    ] : []),
    { id: "vault",    g: "STEP 03 · CAST ACTORS", title: "Cast & Train Performers", body: "Select synthesized performers, tune Flux LoRA identity weights, fit wardrobe, and set character minds." },
    { id: "board",    g: "STEP 04 · MAKE STILLS", title: "Frame Stills & Storyboard",body: "Generate and lock keyframe stills for every beat before spending motion render credits." },
    { id: "generate", g: "STEP 05 · MOTION",      title: "Generate Motion Takes",   body: "Render video shots conditioned on your locked DNA, script, cast LoRAs, and approved stills." },
    ...(kind === "branched" ? [
      { id: "branch", g: "STEP 05 · BRANCHES",    title: "Wire Interactive Forks",  body: "Connect audience choice points and alternate endings across the narrative graph." },
    ] : []),
    { id: "editor",   g: "STEP 06 · CUT & SCORE", title: "Assemble Timeline & Score",body: "Cut the rough assembly, compare alternate cuts, compose the score, and generate title cards." },
    { id: "mint",     g: "STEP 07 · SPLITS",      title: "Smart-Contract Splits",   body: "Configure CinaSplitRouter.sol co-finance passes so box-office streams automatically pay out investors, cast, and studio." },
    { id: "deliver",  g: "STEP 07 · DELIVER",     title: "Master & Package",        body: "Export 4K masters, trailers, and subtitles ready for Cina Watch and festival rooms." },
    { id: "watch",    g: "STEP 07 · PREMIERE",    title: "Premiere on Cina Watch",  body: "Inspect live viewer forks, wardrobe sales, and chained smart-contract settlements flowing back in real time." },
    { id: "chat",     g: "CO-DIRECTOR",           title: "Director Room",           body: "Need a sweeping change across DNA, script, and board? Direct Cina in plain language anytime." },
    { id: "__crew",   g: "SPECIALIST CREW",       title: "Crew Drawer",             body: "Check which specialist agents — writer, cinematographer, editor, composer — are active on your slate.", sel: '[data-tour="crew"]', noView: true },
  ];
  return steps;
}

function StudioTour() {
  const [kind, setKind] = useStateTour(null);
  useEffectTour(() => {
    const start = (e) => setKind((e.detail && e.detail.kind) || "movie");
    window.addEventListener("cina:start-tour", start);
    return () => window.removeEventListener("cina:start-tour", start);
  }, []);
  if (!kind) return null;
  const steps = tourSteps(kind).map(s => ({
    target: s.sel || `[data-tour="${s.id}"]`, title: s.title, body: s.body, kicker: s.g,
    onEnter: s.noView ? null : () => window.dispatchEvent(new CustomEvent("cina:setView", { detail: s.id })),
  }));
  const done = () => {
    setKind(null);
    window.dispatchEvent(new CustomEvent("cina:setView", { detail: "bible" }));
  };
  return <CinaTour id={"studio-" + kind} steps={steps} onDone={done}/>;
}

Object.assign(window, { StudioTour });
