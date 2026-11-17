// producers-create.jsx — "Launch your project" multi-step lightbox.
// A creator-facing flow to open a new fundraise on Producers.
// Steps: Film → Story → Raise → Tiers → Review → Launched.
//
// Mount via window.openCreateProject(). Self-contained modal.

const { useState: usPC, useEffect: uePC, useMemo: umPC, useRef: urPC } = React;

let _pcSet = null;
function openCreateProject() { if (_pcSet) _pcSet(true); }
window.openCreateProject = openCreateProject;

const PC_BASE_TIERS = [
  { id: "collector", name: "Collector", priceUSD: 120, count: 800, perks: ["Premiere window · watch first", "Animated frame collectible"] },
  { id: "patron",    name: "Patron",    priceUSD: 480, count: 120, perks: ["BTS vault access", "0.05% rev share · Y5"] },
  { id: "producer",  name: "Producer",  priceUSD: 3200, count: 12, perks: ["Production credit on screen", "0.6% rev share · Y5", "Set visit"] },
];
const PC_BRANCH_TIERS = [
  { id: "seat",     name: "Room Seat",     priceUSD: 90,   count: 1200, perks: ["2× vote weight at every fork", "All cuts you unlock stay yours"] },
  { id: "fork",     name: "Fork Rights",   priceUSD: 620,  count: 40,   perks: ["Own one branch of the tree", "Rental revenue on that path"] },
  { id: "canonical",name: "Canonical Cut", priceUSD: 4200, count: 4,    perks: ["Co-own the locked ending", "Named in the room credits", "1.2% rev share · Y5"] },
];
const PC_COLORS = [tkc("cat-3"), tkc("cat-6"), tkc("cat-6"), tkc("blood"), tkc("line-3"), tkc("cat-6"), tkc("warn"), tkc("ink-3")];
const PC_THUMBS = ["darkroom-wide", "frequency", "marauder", "swallows", "the-photo", "phone"];

function pcFmtUSD(n) {
  if (!n) return "$0";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
  return "$" + Math.round(n);
}

function ProjectCreator() {
  const [open, setOpen] = usPC(false);
  uePC(() => { _pcSet = setOpen; return () => { _pcSet = null; }; }, []);
  if (!open) return null;
  return <ProjectCreatorInstance onClose={() => setOpen(false)}/>;
}

function ProjectCreatorInstance({ onClose }) {
  const [step, setStep] = usPC(0);
  const [data, setData] = usPC({
    title: "", kind: "film", genre: "Drama", runtime: 96,
    color: PC_COLORS[0], thumb: PC_THUMBS[0], coverUrl: "",
    logline: "", creator: (window.USER?.handle || "you.eth"),
    goalK: 250, daysLeft: 30, revShare: 8, chain: "Base",
    forkCount: 4, optionsPerFork: 3, voteWindowSec: 90,
    forks: [
      { act: "ACT I",  at: 12, heading: "The first door.",   question: "What does she do?" },
      { act: "ACT II", at: 38, heading: "Someone asks for a name.", question: "What name does she give?" },
      { act: "ACT III",at: 65, heading: "Headlights on the road.",  question: "Who is it?" },
      { act: "FINALE", at: 88, heading: "The choice.",        question: "How does it end?" },
    ],
    cutRentals: true, rentPriceUSD: 6, cutRevShare: 4, canonicalRule: "room",
    tiers: [
      { id: "collector", name: "Collector", priceUSD: 120, count: 800, perks: ["Premiere window · watch first", "Animated frame collectible"] },
      { id: "patron",    name: "Patron",    priceUSD: 480, count: 120, perks: ["BTS vault access", "0.05% rev share · Y5"] },
      { id: "producer",  name: "Producer",  priceUSD: 3200, count: 12, perks: ["Production credit on screen", "0.6% rev share · Y5", "Set visit"] },
    ],
    accept: false,
  });
  const upd = (patch) => setData(d => ({ ...d, ...patch }));
  const setFork = (i, patch) => setData(d => ({ ...d, forks: d.forks.map((f, j) => j === i ? { ...f, ...patch } : f) }));
  const setTier = (i, patch) => setData(d => ({ ...d, tiers: d.tiers.map((t, j) => j === i ? { ...t, ...patch } : t) }));

  const goal = data.goalK * 1000;
  const projectedRaise = data.tiers.reduce((s, t) => s + t.priceUSD * t.count, 0);

  const branched = data.kind === "branched";
  const STEPS = branched
    ? ["Film", "Story", "Forks", "Raise", "Tiers", "Review", "Live"]
    : ["Film", "Story", "Raise", "Tiers", "Review", "Live"];
  const cur = STEPS[Math.min(step, STEPS.length - 1)];
  const lastNum = STEPS.length - 1;

  const canNext =
    cur === "Film"   ? data.title.trim().length > 1 :
    cur === "Story"  ? data.logline.trim().length > 8 :
    cur === "Forks"  ? data.forks.slice(0, data.forkCount).every(f => f.heading.trim().length > 2) :
    cur === "Raise"  ? data.goalK > 0 :
    cur === "Tiers"  ? data.tiers.every(t => t.priceUSD > 0 && t.count > 0) && projectedRaise >= goal :
    cur === "Review" ? data.accept :
    true;

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));

  // Publish the project into the live market index.
  const launch = () => {
    const id = "usr-" + data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) + "-" + Date.now().toString(36).slice(-4);
    const proj = {
      id, filmId: id, kind: data.kind, thumb: data.thumb, cover: data.coverUrl || null,
      title: (data.title || "Untitled").toUpperCase(),
      creator: data.creator, creatorId: "you", color: data.color,
      raised: 0, goal, backers: 0, daysLeft: data.daysLeft,
      summary: data.logline,
      floorUSD: Math.min(...data.tiers.map(t => t.priceUSD)),
      revShare: data.revShare, royaltyPaid: 0,
      nextDistribution: "2026-10-01", chain: data.chain,
      tiers: data.tiers.map((t, i) => ({ ...t, sold: 0, color: [tkc("ink-4"), tkc("cat-3"), "var(--c-amber)"][i] || tkc("ink-4") })),
      film: { id, title: data.title, kind: data.kind, creator: data.creator, color: data.color, thumb: data.thumb, cover: data.coverUrl || null, genre: data.genre, runtime: data.runtime },
      branched, branch: branched ? {
        filmId: id, title: data.title, forks: data.forkCount, optionsPerFork: data.optionsPerFork,
        totalCuts: Math.pow(data.optionsPerFork, data.forkCount), roomSize: 0, liveNow: 0,
        voteWindowSec: data.voteWindowSec, canonical: "—", cutRevShare: data.cutRevShare,
        rentPriceUSD: data.rentPriceUSD, cutsRentedWk: 0, accent: data.color,
        forkSpec: data.forks.slice(0, data.forkCount),
      } : null,
      userLaunched: true, launchedAt: Date.now(),
    };
    window.__cinaLaunched = [proj, ...(window.__cinaLaunched || [])];
    try { localStorage.setItem("cina-launched-v1", JSON.stringify(window.__cinaLaunched)); } catch (_) {}
    window.dispatchEvent(new CustomEvent("cina-project-launched", { detail: proj }));
    next();
  };
  const back = () => step === 0 ? onClose() : setStep(s => s - 1);

  // ESC
  uePC(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(1080px, 100%)", maxHeight: "100%",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-3)", overflow: "hidden",
        display: "grid", gridTemplateColumns: "320px 1fr",
      }}>
        {/* ─── Left rail: live preview card ─── */}
        <div style={{
          background: "var(--c-void)", borderRight: "1px solid var(--c-line)",
          padding: 24, display: "flex", flexDirection: "column", gap: 18,
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase" }}>
            LIVE PREVIEW
          </div>
          <PcPreviewCard data={data} goal={goal} projectedRaise={projectedRaise}/>
          {/* Step list */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 10px", borderRadius: "var(--r-2)",
                background: i === step ? "rgba(var(--accent-rgb),.08)" : "transparent",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: i < step ? "var(--c-good)" : i === step ? "var(--c-amber)" : "var(--c-panel-2)",
                  border: i === step ? "none" : "1px solid var(--c-line-2)",
                  color: i < step ? tkc("void") : i === step ? tkc("on-amber") : "var(--c-ink-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
                }}>{i < step ? "✓" : i + 1}</span>
                <span style={{
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                  letterSpacing: ".16em", textTransform: "uppercase",
                  color: i === step ? "var(--c-ink)" : "var(--c-ink-3)",
                  fontWeight: i === step ? 600 : 500,
                }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: step body ─── */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <div style={{
            padding: "18px 28px", borderBottom: "1px solid var(--c-line)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 3 }}>
                {cur === "Live" ? "PROJECT LIVE · ON " + data.chain.toUpperCase() : (branched ? "LAUNCH A BRANCHED ROOM · STEP " : "LAUNCH A PROJECT · STEP ") + (step + 1) + " / " + lastNum}
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1 }}>
                {({ Film: branched ? "Name your branched film" : "Name your film", Story: "Tell the story", Forks: "Build the fork tree", Raise: "Set the raise", Tiers: "Design the tiers", Review: "Review & launch", Live: "You're live" })[cur]}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, background: "transparent", color: "var(--c-ink-3)",
              border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-body)",
            }} aria-label="Close" title="Close">×</button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "26px 28px", minHeight: 380 }}>
            {cur === "Film"   && <PcStepFilm data={data} upd={upd}/>}
            {cur === "Story"  && <PcStepStory data={data} upd={upd}/>}
            {cur === "Forks"  && <PcStepForks data={data} upd={upd} setFork={setFork}/>}
            {cur === "Raise"  && <PcStepRaise data={data} upd={upd} goal={goal}/>}
            {cur === "Tiers"  && <PcStepTiers data={data} setTier={setTier} projectedRaise={projectedRaise} goal={goal}/>}
            {cur === "Review" && <PcStepReview data={data} upd={upd} goal={goal} projectedRaise={projectedRaise}/>}
            {cur === "Live"   && <PcStepLive data={data} onClose={onClose}/>}
          </div>

          {/* Footer */}
          {cur !== "Live" && (
            <div style={{
              padding: "14px 28px", borderTop: "1px solid var(--c-line)",
              background: "var(--c-panel-2)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <button onClick={back} style={{
                padding: "10px 16px", background: "transparent",
                border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
                color: "var(--c-ink-2)", cursor: "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
                textTransform: "uppercase",
              }}>{step === 0 ? "Cancel" : "← Back"}</button>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
                letterSpacing: ".16em", textTransform: "uppercase",
              }}>
                {cur === "Tiers" && <>Projected raise · <span style={{ color: "var(--c-amber)", fontWeight: 600 }}>{pcFmtUSD(projectedRaise)}</span></>}
                {cur === "Raise" && <>Goal · <span style={{ color: "var(--c-amber)", fontWeight: 600 }}>{pcFmtUSD(goal)}</span></>}
                {cur === "Forks" && <>{Math.pow(data.optionsPerFork, data.forkCount).toLocaleString()} possible cuts</>}
              </div>
              <button disabled={!canNext} onClick={() => { if (cur === "Review") launch(); else next(); }} style={{
                padding: "10px 22px",
                background: canNext ? "var(--c-amber)" : "var(--c-line)",
                color: canNext ? tkc("on-amber") : "var(--c-ink-4)",
                border: "none", borderRadius: "var(--r-2)",
                cursor: canNext ? "pointer" : "not-allowed",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                textTransform: "uppercase",
              }}>{cur === "Review" ? (branched ? "Open the room →" : "Launch project →") : "Next →"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Live preview card (mirrors a real market card) ──────────────────────
function PcPreviewCard({ data, goal, projectedRaise }) {
  const pct = Math.min(1, projectedRaise / goal);
  const cheapest = [...data.tiers].sort((a, b) => a.priceUSD - b.priceUSD)[0];
  return (
    <div style={{
      background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)", overflow: "hidden",
    }}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: data.color, overflow: "hidden" }}>
        {data.coverUrl
          ? <img src={data.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
          : (typeof FrameThumb === "function" && <FrameThumb kind={data.thumb} usePhoto/>)}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.7))" }}/>
        <div style={{ position: "absolute", top: 8, left: 8, padding: "3px 7px", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "var(--r-1)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em" }}>
          {data.kind === "branched" ? "BRANCHED" : data.kind === "series" ? "SERIES" : "FILM"}
        </div>
        <div style={{ position: "absolute", left: 10, bottom: 8, right: 10, color: tkc("white") }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, lineHeight: 1 }}>
            {data.title || "Untitled"}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.65)", letterSpacing: ".16em", marginTop: 3 }}>
            {data.creator.toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>FROM</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)", fontWeight: 500, lineHeight: 1 }}>${cheapest.priceUSD}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>REV SHARE</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1 }}>{data.revShare}%</div>
          </div>
        </div>
        <div>
          <div style={{ height: 3, background: "var(--c-line)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${pct * 100}%`, height: "100%", background: "var(--c-amber)" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
            <span>{pcFmtUSD(projectedRaise)} projected</span>
            <span>{(pct * 100).toFixed(0)}% / {pcFmtUSD(goal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cover-art picker ────────────────────────────────────────────────────
// Four sources: AI generation, stills pulled from the film, a user upload,
// and the universal media library. A pick sets either data.thumb (a library
// kind) or data.coverUrl (an uploaded / custom image).
const PC_LIBRARY = [
  "noir-m", "noir-f", "face-night", "alley-night",
  "lantern", "window-rain", "interior-dim", "scared-hall",
  "west-rider", "west-riders", "west-canyon", "west-dusk",
  "sci-surface", "sci-neon", "sci-ship", "sci-city",
];
function pcGenreStills(genre) {
  const m = {
    "Drama":    ["window-rain", "interior-dim", "lantern", "noir-f", "face-night", "scared-hall"],
    "Sci-fi":   ["sci-surface", "sci-neon", "sci-ship", "sci-city", "face-night", "interior-dim"],
    "Horror":   ["scared-hall", "alley-night", "lantern", "interior-dim", "face-night", "west-dusk"],
    "Thriller": ["noir-m", "alley-night", "face-night", "interior-dim", "west-canyon", "sci-ship"],
    "Doc":      ["window-rain", "interior-dim", "west-rider", "sci-city", "noir-m", "lantern"],
    "Romance":  ["window-rain", "lantern", "noir-f", "interior-dim", "face-night", "west-dusk"],
  };
  return m[genre] || PC_LIBRARY.slice(0, 6);
}
function pcCoverSrc(kind) { return window._photoForKind ? window._photoForKind(kind) : null; }

function PcCoverThumb({ kind, url, selected, onClick, fixed }) {
  const src = url || pcCoverSrc(kind);
  return (
    <button onClick={onClick} style={{
      ...(fixed ? { width: fixed.w, height: fixed.h } : { width: "100%", aspectRatio: "16 / 10" }),
      borderRadius: "var(--r-2)", overflow: "hidden", padding: 0, cursor: "pointer",
      border: selected ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
      background: tkc("panel"), position: "relative", flexShrink: 0,
      boxShadow: selected ? "0 0 0 2px rgba(var(--accent-rgb),.25)" : "none",
    }}>
      {src && <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>}
      {selected && <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "var(--c-amber)", color: "var(--c-on-amber)", fontSize: "var(--fs-label)", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
    </button>
  );
}

function PcCoverArt({ data, upd }) {
  const [mode, setMode] = usPC("ai");
  const [prompt, setPrompt] = usPC("");
  const [busy, setBusy] = usPC(false);
  const [gen, setGen] = usPC([]);
  const [nonce, setNonce] = usPC(0);
  const fileRef = urPC(null);

  uePC(() => { setPrompt(`${data.genre}${data.title ? " · " + data.title : ""} — cinematic key art, moody light`); }, []);

  const pickKind = (k) => upd({ thumb: k, coverUrl: "" });
  const isSel = (k) => !data.coverUrl && data.thumb === k;

  const generate = () => {
    setBusy(true);
    const seed = (prompt || data.genre) + "#" + nonce;
    let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    setTimeout(() => {
      const pool = [...PC_LIBRARY]; const out = []; let x = Math.abs(h) || 7;
      while (out.length < 4 && pool.length) { x = (x * 1103515245 + 12345) & 0x7fffffff; out.push(pool.splice(x % pool.length, 1)[0]); }
      setGen(out); setBusy(false); setNonce(n => n + 1);
    }, 850);
  };

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { window.toast && window.toast({ title: "TOO LARGE", text: "Pick an image under 5 MB.", kind: "warn" }); e.target.value = ""; return; }
    const r = new FileReader();
    r.onload = () => { upd({ coverUrl: r.result }); window.toast && window.toast({ title: "COVER UPLOADED", text: "Using your image as key art.", kind: "good" }); };
    r.readAsDataURL(f); e.target.value = "";
  };

  const TABS = [["ai", "✦ AI generate"], ["stills", "Film stills"], ["upload", "Upload"], ["library", "Library"]];
  const note = { fontSize: "var(--fs-body)", color: "var(--c-ink-4)", margin: "0 0 10px", lineHeight: 1.5 };

  return (
    <PcField label="Cover art">
      <style>{"@keyframes pcPulse{0%,100%{opacity:.45}50%{opacity:.9}}"}</style>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {TABS.map(([id, lab]) => (
          <button key={id} onClick={() => setMode(id)} style={pcChip(mode === id)}>{lab}</button>
        ))}
      </div>

      {mode === "ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the key art…"
              onKeyDown={e => { if (e.key === "Enter") generate(); }} style={{ ...pcInput, flex: 1 }}/>
            <button onClick={generate} disabled={busy} style={{
              padding: "0 16px", background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)",
              cursor: busy ? "default" : "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, whiteSpace: "nowrap", opacity: busy ? .7 : 1,
            }}>{busy ? "GENERATING…" : "✦ GENERATE"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {busy && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "16 / 10", borderRadius: "var(--r-2)", background: "var(--c-panel-2)", animation: "pcPulse 1s ease-in-out infinite", animationDelay: `${i * 0.12}s` }}/>
            ))}
            {!busy && gen.map(k => <PcCoverThumb key={k} kind={k} selected={isSel(k)} onClick={() => pickKind(k)}/>)}
            {!busy && gen.length === 0 && (
              <div style={{ gridColumn: "1 / -1", padding: "22px 16px", textAlign: "center", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>
                Write a prompt and hit Generate to render four cover options.
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "stills" && (
        <div>
          <p style={note}>Frames pulled from your {data.genre.toLowerCase()} {data.kind === "series" ? "series" : "film"}. Pick a still to use as key art.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {pcGenreStills(data.genre).map(k => <PcCoverThumb key={k} kind={k} selected={isSel(k)} onClick={() => pickKind(k)}/>)}
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }}/>
          {data.coverUrl ? (
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <img src={data.coverUrl} alt="" style={{ width: 168, aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "var(--r-2)", border: "2px solid var(--c-amber)" }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => fileRef.current && fileRef.current.click()} style={pcChip(false)}>Replace image</button>
                <button onClick={() => upd({ coverUrl: "" })} style={pcChip(false)}>Remove</button>
              </div>
            </div>
          ) : (
            <button onClick={() => fileRef.current && fileRef.current.click()} style={{
              width: "100%", padding: "30px 16px", borderRadius: "var(--r-2)", cursor: "pointer",
              border: "1px dashed var(--c-line-3)", background: "var(--c-panel-2)", color: "var(--c-ink-2)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: "var(--fs-title)", color: "var(--c-ink-3)" }}>↑</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--c-ink-2)" }}>Upload an image</span>
              <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>PNG or JPG · up to 5 MB · 16:9 works best</span>
            </button>
          )}
        </div>
      )}

      {mode === "library" && (
        <div>
          <p style={note}>Your universal media library — stills, stock, and past renders.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, maxHeight: 208, overflowY: "auto", paddingRight: 4 }}>
            {PC_LIBRARY.map(k => <PcCoverThumb key={k} kind={k} selected={isSel(k)} onClick={() => pickKind(k)}/>)}
          </div>
        </div>
      )}
    </PcField>
  );
}

// ─── Step 0: Film basics ─────────────────────────────────────────────────
function PcStepFilm({ data, upd }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PcField label="Title">
        <input value={data.title} onChange={e => upd({ title: e.target.value })} autoFocus
          placeholder="e.g. The Salt Year" style={pcInput}/>
      </PcField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <PcField label="Format" hint={data.kind === "branched" ? "Plays live — the room votes at every fork." : null}>
          <div style={{ display: "flex", gap: 6 }}>
            {["film", "series", "branched"].map(k => {
              const on = data.kind === k;
              const isBr = k === "branched";
              return (
                <button key={k} onClick={() => upd({ kind: k, tiers: isBr ? PC_BRANCH_TIERS : (data.kind === "branched" ? PC_BASE_TIERS : data.tiers) })}
                  style={{
                    ...pcChip(on),
                    ...(isBr ? {
                      display: "inline-flex", alignItems: "center", gap: 6,
                      borderColor: on ? tkc("bad") : "rgba(201,85,72,.45)",
                      background: on ? "rgba(201,85,72,.16)" : "transparent",
                      color: on ? tkc("amber-x") : tkc("ink-3"),
                    } : {}),
                  }}>
                  {isBr && window.PbBranchGlyph ? <window.PbBranchGlyph size={11} color={on ? tkc("amber-x") : tkc("ink-3")} dim={on ? tkc("amber-x") : tkc("ink-3")}/> : null}
                  {k}
                </button>
              );
            })}
          </div>
        </PcField>
        <PcField label="Genre">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Drama", "Sci-fi", "Horror", "Thriller", "Doc", "Romance"].map(g => (
              <button key={g} onClick={() => upd({ genre: g })} style={pcChip(data.genre === g)}>{g}</button>
            ))}
          </div>
        </PcField>
      </div>
      <PcCoverArt data={data} upd={upd}/>
      <PcField label="Accent color">
        <div style={{ display: "flex", gap: 8 }}>
          {PC_COLORS.map(c => (
            <button key={c} onClick={() => upd({ color: c })} style={{
              width: 32, height: 32, borderRadius: "50%", background: c,
              border: data.color === c ? `2px solid ${tkc("white")}` : "1px solid var(--c-line-2)",
              cursor: "pointer", boxShadow: data.color === c ? `0 0 0 2px ${c}` : "none",
            }}/>
          ))}
        </div>
      </PcField>
    </div>
  );
}

// ─── Step 1: Story ───────────────────────────────────────────────────────
function PcStepStory({ data, upd }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PcField label="Logline" hint="One sentence. The promise of the film.">
        <textarea value={data.logline} onChange={e => upd({ logline: e.target.value })} autoFocus
          rows={3} placeholder="A retired conservator returns to a flooding archive to save one reel — and finds her own face in it."
          style={{ ...pcInput, resize: "vertical", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.45 }}/>
      </PcField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <PcField label="Director / handle">
          <input value={data.creator} onChange={e => upd({ creator: e.target.value })} style={pcInput}/>
        </PcField>
        <PcField label={`Runtime · ${data.runtime} min`}>
          <input type="range" min="8" max="180" value={data.runtime}
            onChange={e => upd({ runtime: +e.target.value })} style={{ width: "100%", accentColor: tkc("amber") }}/>
        </PcField>
      </div>
      <div style={{ padding: 14, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55 }}>
        Your logline appears on the market card and the project page. It's the single most important thing backers read — make it concrete.
      </div>
    </div>
  );
}

// ─── Branched: fork-tree builder ─────────────────────────────────────────
function PcStepForks({ data, upd, setFork }) {
  const BLOOD = tkc("bad");
  const cuts = Math.pow(data.optionsPerFork, data.forkCount);
  const forks = data.forks.slice(0, data.forkCount);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <PcField label="Forks">
          <div style={{ display: "flex", gap: 6 }}>
            {[3, 4, 5, 6].map(n => (
              <button key={n} onClick={() => upd({
                forkCount: n,
                forks: Array.from({ length: n }, (_, i) => data.forks[i] || { act: "ACT " + (i + 1), at: 12 + i * 18, heading: "", question: "What happens?" }),
              })} style={pcChip(data.forkCount === n)}>{n}</button>
            ))}
          </div>
        </PcField>
        <PcField label="Options per fork">
          <div style={{ display: "flex", gap: 6 }}>
            {[2, 3, 4].map(n => <button key={n} onClick={() => upd({ optionsPerFork: n })} style={pcChip(data.optionsPerFork === n)}>{n}</button>)}
          </div>
        </PcField>
        <PcField label="Vote window">
          <div style={{ display: "flex", gap: 6 }}>
            {[45, 60, 90, 120].map(n => <button key={n} onClick={() => upd({ voteWindowSec: n })} style={pcChip(data.voteWindowSec === n)}>{n}s</button>)}
          </div>
        </PcField>
      </div>

      {/* Tree summary */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
        border: "1px solid rgba(201,85,72,.32)", background: "rgba(201,85,72,.06)", borderRadius: "var(--r-2)",
      }}>
        {window.PbBranchGlyph ? <window.PbBranchGlyph size={26} color={BLOOD} dim="rgba(201,85,72,.5)"/> : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1 }}>
            {cuts.toLocaleString()} possible cuts
          </div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 5, lineHeight: 1.45 }}>
            {data.forkCount} forks × {data.optionsPerFork} options. The room votes for {data.voteWindowSec}s at each fork; the leading branch plays and becomes canonical. Every other path stays rentable.
          </div>
        </div>
      </div>

      {/* Per-fork editor */}
      <PcField label="Decision points" hint="Where the film stops and the room decides.">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {forks.map((f, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "62px 74px 1fr 1fr", gap: 10, alignItems: "center",
              padding: "10px 12px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
            }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: BLOOD, letterSpacing: ".16em", fontWeight: 700 }}>
                {String(i + 1).padStart(2, "0")} ◆
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input value={f.at} onChange={e => setFork(i, { at: parseInt(e.target.value) || 0 })} type="number"
                  style={{ ...pcInput, padding: "7px 8px", fontSize: "var(--fs-body)", width: 52, fontFamily: "var(--f-mono)" }}/>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>MIN</span>
              </div>
              <input value={f.heading} onChange={e => setFork(i, { heading: e.target.value })} placeholder="Scene heading — e.g. She finds the booth."
                style={{ ...pcInput, padding: "8px 10px", fontSize: "var(--fs-body)" }}/>
              <input value={f.question} onChange={e => setFork(i, { question: e.target.value })} placeholder="Question put to the room"
                style={{ ...pcInput, padding: "8px 10px", fontSize: "var(--fs-body)" }}/>
            </div>
          ))}
        </div>
      </PcField>

      {/* Cut economics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <PcField label="Cut rentals">
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => upd({ cutRentals: true })} style={pcChip(data.cutRentals)}>On</button>
            <button onClick={() => upd({ cutRentals: false })} style={pcChip(!data.cutRentals)}>Off</button>
          </div>
        </PcField>
        <PcField label="Rental price">
          <div style={{ display: "flex", gap: 6 }}>
            {[3, 4, 6, 9].map(n => <button key={n} onClick={() => upd({ rentPriceUSD: n })} style={pcChip(data.rentPriceUSD === n)} disabled={!data.cutRentals}>${n}</button>)}
          </div>
        </PcField>
        <PcField label="Canonical path set by">
          <div style={{ display: "flex", gap: 6 }}>
            {[["room", "The room"], ["holders", "Holders"], ["director", "You"]].map(([k, l]) => (
              <button key={k} onClick={() => upd({ canonicalRule: k })} style={pcChip(data.canonicalRule === k)}>{l}</button>
            ))}
          </div>
        </PcField>
      </div>
    </div>
  );
}

// ─── Step 2: Raise ───────────────────────────────────────────────────────
function PcStepRaise({ data, upd, goal }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <PcField label={`Funding goal · ${pcFmtUSD(goal)}`}>
        <input type="range" min="25" max="2000" step="25" value={data.goalK}
          onChange={e => upd({ goalK: +e.target.value })} style={{ width: "100%", accentColor: tkc("amber") }}/>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>
          <span>$25k · short film</span><span>$2M · feature</span>
        </div>
      </PcField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <PcField label={`Raise window · ${data.daysLeft} days`}>
          <input type="range" min="7" max="90" value={data.daysLeft}
            onChange={e => upd({ daysLeft: +e.target.value })} style={{ width: "100%", accentColor: tkc("amber") }}/>
        </PcField>
        <PcField label={`Backer revenue share · ${data.revShare}%`}>
          <input type="range" min="3" max="25" value={data.revShare}
            onChange={e => upd({ revShare: +e.target.value })} style={{ width: "100%", accentColor: tkc("amber") }}/>
        </PcField>
      </div>
      <PcField label="Settlement chain">
        <div style={{ display: "flex", gap: 6 }}>
          {["Base", "Optimism", "Mainnet"].map(c => (
            <button key={c} onClick={() => upd({ chain: c })} style={pcChip(data.chain === c)}>{c}</button>
          ))}
        </div>
      </PcField>
      <div style={{
        padding: 16, background: "linear-gradient(135deg, rgba(var(--accent-rgb),.06), var(--c-panel) 70%)",
        border: "1px solid rgba(var(--accent-rgb),.35)", borderLeft: "2px solid var(--c-amber)", borderRadius: "var(--r-2)",
      }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6, textTransform: "uppercase" }}>WHAT BACKERS GET</div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
          {data.revShare}% of all downstream revenue (Watch subs, ads, licensing) flows to holders quarterly, pro-rata by tier. Cina takes 6% of primary, 1% of secondary.
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Tiers ───────────────────────────────────────────────────────
function PcStepTiers({ data, setTier, projectedRaise, goal }) {
  const palette = [tkc("ink-4"), tkc("cat-3"), "var(--c-amber)"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>Three tiers</span>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: projectedRaise >= goal ? "var(--c-good)" : "var(--c-warn)", letterSpacing: ".16em" }}>
          Projected {pcFmtUSD(projectedRaise)} · {((projectedRaise / goal) * 100).toFixed(0)}% of goal
        </span>
      </div>
      {projectedRaise < goal && (
        <div style={{
          padding: "10px 12px", borderRadius: "var(--r-2)", background: "rgba(216,163,66,.08)",
          border: "1px solid rgba(216,163,66,.3)", fontSize: "var(--fs-body)", color: "var(--c-warn)", lineHeight: 1.45,
        }}>
          Every tier sold out still leaves you {pcFmtUSD(goal - projectedRaise)} short of {pcFmtUSD(goal)}. Raise a price, add supply, or lower the goal before you launch.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {data.tiers.map((t, i) => (
          <div key={t.id} style={{
            padding: 16, background: "var(--c-panel-2)",
            border: "1px solid var(--c-line)", borderTop: `2px solid ${palette[i]}`,
            borderRadius: "var(--r-2)", display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, color: palette[i] }}>{t.name}</div>
            <PcMini label={`Price · $${t.priceUSD.toLocaleString()}`}>
              <input type="range" min={i === 0 ? 20 : i === 1 ? 200 : 1000} max={i === 0 ? 400 : i === 1 ? 2000 : 25000} step={i === 0 ? 10 : i === 1 ? 50 : 500}
                value={t.priceUSD} onChange={e => setTier(i, { priceUSD: +e.target.value })}
                style={{ width: "100%", accentColor: palette[i] }}/>
            </PcMini>
            <PcMini label={`Supply · ${t.count}`}>
              <input type="range" min={i === 0 ? 50 : i === 1 ? 10 : 1} max={i === 0 ? 2000 : i === 1 ? 400 : 40}
                value={t.count} onChange={e => setTier(i, { count: +e.target.value })}
                style={{ width: "100%", accentColor: palette[i] }}/>
            </PcMini>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
              {t.perks.map((p, j) => (
                <li key={j} style={{ display: "flex", gap: 7, fontSize: "var(--fs-label)", color: "var(--c-ink-2)", lineHeight: 1.4 }}>
                  <span style={{ color: palette[i], flexShrink: 0 }}>◆</span><span>{p}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
              <span>Tier raise</span>
              <span style={{ color: palette[i], fontWeight: 600 }}>{pcFmtUSD(t.priceUSD * t.count)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Review ──────────────────────────────────────────────────────
function PcStepReview({ data, upd, goal, projectedRaise }) {
  const branched = data.kind === "branched";
  const rows = [
    ["Title", data.title || "Untitled"],
    ["Format", `${data.kind} · ${data.genre} · ${data.runtime}m`],
    ["Director", data.creator],
    ["Goal", pcFmtUSD(goal)],
    ["Window", `${data.daysLeft} days`],
    ["Rev share", `${data.revShare}% · quarterly`],
    ["Chain", data.chain],
    ["Projected raise", pcFmtUSD(projectedRaise)],
    ...(branched ? [
      ["Fork tree", `${data.forkCount} forks × ${data.optionsPerFork} options · ${Math.pow(data.optionsPerFork, data.forkCount).toLocaleString()} cuts`],
      ["Vote window", `${data.voteWindowSec}s at each fork`],
      ["Canonical path", data.canonicalRule === "room" ? "Set by the room" : data.canonicalRule === "holders" ? "Set by holders" : "Set by you"],
      ["Cut rentals", data.cutRentals ? `$${data.rentPriceUSD} · ${data.cutRevShare}% to holders` : "Off"],
    ] : []),
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 20 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, padding: "9px 0",
            borderBottom: i < rows.length - 1 ? "1px solid var(--c-line)" : "none",
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>{r[0]}</div>
            <div style={{ fontSize: "var(--fs-body)", color: r[0] === "Projected raise" ? "var(--c-amber)" : "var(--c-ink)", fontWeight: r[0] === "Projected raise" ? 600 : 400 }}>{r[1]}</div>
          </div>
        ))}
      </div>
      <label style={{
        display: "flex", gap: 12, alignItems: "flex-start", padding: 14,
        background: data.accept ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
        border: `1px solid ${data.accept ? "var(--c-amber)" : "var(--c-line)"}`, borderRadius: "var(--r-2)", cursor: "pointer",
      }}>
        <input type="checkbox" checked={data.accept} onChange={e => upd({ accept: e.target.checked })} style={{ accentColor: tkc("amber"), marginTop: 2, width: 16, height: 16 }}/>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
          I hold the rights to this project and agree to Cina's producer terms. Smart contracts deploy on launch and are immutable.
        </span>
      </label>
    </div>
  );
}

// ─── Step 5: Live ────────────────────────────────────────────────────────
function PcStepLive({ data, onClose }) {
  const ref = data.title.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "FILM";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 360, gap: 14 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--c-good)", color: "var(--c-void)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-head)", fontWeight: 700 }}>✓</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", textTransform: "uppercase" }}>PROJECT LIVE · DEPLOYED ON {data.chain.toUpperCase()}</div>
      <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", letterSpacing: "-0.02em" }}>
        <em style={{ color: "var(--c-amber)" }}>{data.title || "Untitled"}</em> is raising.
      </h2>
      <p style={{ margin: "0 0 8px", maxWidth: 440, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
        Your three tier contracts are live and listed on the market. Backers can buy in now; royalties settle quarterly. Reference <span style={{ fontFamily: "var(--f-mono)", color: "var(--c-amber)" }}>PROD-{ref}-{Math.floor(Math.random() * 9000) + 1000}</span>.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { onClose(); location.hash = "market"; }} style={{
          padding: "12px 22px", background: "var(--c-amber)", color: "var(--c-on-amber)",
          border: "none", borderRadius: "var(--r-2)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
        }}>View on market →</button>
        <button onClick={onClose} style={{
          padding: "12px 18px", background: "transparent", color: "var(--c-ink)",
          border: "1px solid var(--c-line-3)", borderRadius: "var(--r-2)", cursor: "pointer",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
        }} aria-label="Close" title="Close">Done</button>
      </div>
    </div>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────
const pcInput = {
  width: "100%", padding: "11px 14px",
  background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", outline: "none",
  fontFamily: "var(--f-sans)",
};
function pcChip(active) {
  return {
    padding: "7px 13px",
    background: active ? "rgba(var(--accent-rgb),.14)" : "transparent",
    color: active ? "var(--c-amber)" : "var(--c-ink-2)",
    border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
    borderRadius: "var(--r-1)", cursor: "pointer",
    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600,
    textTransform: "uppercase",
  };
}
function PcField({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>{label}</span>
        {hint && <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
function PcMini({ label, children }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

// Auto-mount
(function () {
  const ready = () => {
    if (document.getElementById("__project-creator-host")) return;
    const host = document.createElement("div");
    host.id = "__project-creator-host";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(<ProjectCreator/>);
    else ReactDOM.render(<ProjectCreator/>, host);
  };
  if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(ready, 60);
  else document.addEventListener("DOMContentLoaded", ready);
})();

