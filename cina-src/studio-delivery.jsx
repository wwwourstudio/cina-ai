// studio-delivery.jsx — "05 SHIP · Deliver" — master exports, deliverables
// checklist, and festival submission packages for the active film. The step
// that sits between a locked cut (Editor/Cuts) and Mint/Publish.

const { useState: useDelState, useEffect: useDelEffect, useMemo: useDelMemo } = React;

// Local download helper (mirrors producers-app's, scoped here).
function delDownload(name, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  document.body.removeChild(a); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const delToast = (t) => window.toast && window.toast(t);
const delSlug = (s) => (s || "film").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const MASTER_FORMATS = [
  { id: "prores", name: "ProRes 4444", res: "3840×2160", note: "Archival master · 12-bit", size: "—", ext: "mov" },
  { id: "h265",   name: "H.265 / HEVC", res: "3840×2160", note: "4K streaming delivery", size: "—", ext: "mp4" },
  { id: "h264",   name: "H.264", res: "1920×1080", note: "Universal 1080p", size: "—", ext: "mp4" },
  { id: "dcp",    name: "DCP", res: "2K · 24fps", note: "Digital Cinema Package · theatrical", size: "—", ext: "zip" },
];

function DeliveryPanel() {
  const film = window.cinaActiveFilm ? window.cinaActiveFilm() : (window.PROJECTS || [])[0];
  const slug = delSlug(film?.title);
  const [pipeTick, setPipeTick] = useDelState(0);

  useDelEffect(() => {
    const bump = () => setPipeTick(t => t + 1);
    window.addEventListener("cina:pipeline-change", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("cina:pipeline-change", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const pipeSummary = useDelMemo(() => (
    window.CinaPipeline?.getSummary ? window.CinaPipeline.getSummary() : null
  ), [pipeTick]);

  const liveShotsTotal = Math.max(film?.shots || 0, pipeSummary?.stills?.total || 0);
  const liveShotsDone = Math.max(film?.completed || 0, pipeSummary?.motion?.generated || 0);
  const cutLocked = !!(pipeSummary?.edit?.locked) || film?.stage === "released" || (liveShotsTotal > 0 && liveShotsDone >= liveShotsTotal);
  const locked = cutLocked;
  const renderPct = locked ? 100 : (liveShotsTotal ? Math.min(100, Math.round((liveShotsDone / liveShotsTotal) * 100)) : 100);
  const liveRuntime = pipeSummary?.edit?.duration || film?.runtime || "00:52:14";
  const v1Clips = pipeSummary?.edit?.v1Count || liveShotsDone;

  const [fmt, setFmt] = useDelState("h265");
  const [exporting, setExporting] = useDelState(false);
  const [progress, setProgress] = useDelState(0);
  const [done, setDone] = useDelState(false);

  // Deliverables checklist persisted per-film.
  const dkey = "cina:deliver:" + (film?.id || "p1");
  const loadDeliv = () => { try { return JSON.parse(localStorage.getItem(dkey)) || {}; } catch (e) { return {}; } };
  const [deliv, setDeliv] = useDelState(loadDeliv());
  const saveDeliv = (next) => { setDeliv(next); try { localStorage.setItem(dkey, JSON.stringify(next)); } catch (e) {} };

  const startExport = () => {
    if (exporting) return;
    setExporting(true); setDone(false); setProgress(0);
    const f = MASTER_FORMATS.find(x => x.id === fmt);
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 16 + 6;
      if (p >= 100) {
        p = 100; clearInterval(tick);
        setProgress(100); setExporting(false); setDone(true);
        delToast({ title: "MASTER READY", text: `${f.name} export complete.`, kind: "good" });
        setTimeout(() => setDone(false), 4000);
      } else { setProgress(Math.round(p)); }
    }, 320);
  };

  const downloadMaster = () => {
    const f = MASTER_FORMATS.find(x => x.id === fmt);
    const manifest = [
      "CINA MASTER EXPORT", "==================",
      "Title:    " + (film?.title || "Untitled"),
      "Code:     " + (film?.code || "—"),
      "Format:   " + f.name + " (" + f.res + ")",
      "Runtime:  " + liveRuntime,
      "Clips:    " + v1Clips + " picture clips",
      "Status:   " + (locked ? "CUT LOCKED" : "WORK IN PROGRESS"),
      "Color:    Rec.2020 · Darkroom grade",
      "Audio:    5.1 + stereo fold-down",
      "Rendered: " + new Date().toISOString().slice(0, 10),
      "",
      "This is a platform manifest for the master deliverable.",
    ].join("\n");
    delDownload("cina-master-" + slug + "." + f.ext + ".txt", manifest, "text/plain");
  };

  const DELIVERABLES = [
    { id: "captions", label: "Closed captions", sub: "SRT · English, auto-timed", icon: "type",
      build: () => delDownload(slug + "-captions.srt", "1\n00:00:01,000 --> 00:00:04,000\n[ " + (film?.title || "Film") + " ]\n\n2\n00:00:05,000 --> 00:00:08,000\nGenerated caption track.\n", "text/plain") },
    { id: "poster", label: "Key art / poster", sub: "2000×3000 · title treatment", icon: "ref",
      build: () => delDownload(slug + "-keyart.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="3000"><rect width="2000" height="3000" fill="${film?.cover || tkc("panel-2")}"/><text x="100" y="2820" fill="${tkc("white")}" font-family="Georgia" font-style="italic" font-size="150">${film?.title || "Untitled"}</text></svg>`, "image/svg+xml") },
    { id: "trailer", label: "Trailer cut", sub: "90s · social + festival", icon: "play",
      build: () => delToast({ title: "TRAILER QUEUED", text: "90s cut sent to the render queue.", kind: "info" }) },
    { id: "presskit", label: "Press kit", sub: "Synopsis, stills, credits (PDF)", icon: "folder",
      build: () => delDownload(slug + "-presskit.txt", [(film?.title || "Untitled").toUpperCase(), film?.genre || "", "", "LOGLINE", "—", "", "SELECTED STILLS: " + (pipeSummary?.stills?.total || 8), "RUNTIME: " + liveRuntime, "DIRECTOR: " + (window.CINA?.handle || "—")].join("\n"), "text/plain") },
  ];

  const toggleDeliv = (d) => {
    const next = { ...deliv, [d.id]: !deliv[d.id] };
    saveDeliv(next);
    if (next[d.id]) { d.build(); delToast({ title: d.label.toUpperCase(), text: "Generated.", kind: "good" }); }
  };

  const delivDone = DELIVERABLES.filter(d => deliv[d.id]).length;

  // Festival package assembly.
  const [pkgBuilding, setPkgBuilding] = useDelState(false);
  const assemblePackage = () => {
    setPkgBuilding(true);
    setTimeout(() => {
      setPkgBuilding(false);
      const lines = [
        "CINA FESTIVAL SUBMISSION PACKAGE",
        "================================",
        "Title:        " + (film?.title || "Untitled"),
        "Runtime:      " + liveRuntime,
        "Genre:        " + (film?.genre || "—"),
        "Format:       " + (MASTER_FORMATS.find(x => x.id === fmt)?.name || "—"),
        "",
        "INCLUDED:",
        "  • Screener link (password-protected, 30-day)",
        "  • Master file reference",
        ...DELIVERABLES.filter(d => deliv[d.id]).map(d => "  • " + d.label),
        "",
        "Screener: https://cina.studio/screener/" + slug + "-" + Math.random().toString(36).slice(2, 8),
        "Generated: " + new Date().toISOString().slice(0, 10),
      ];
      delDownload("cina-festival-" + slug + ".txt", lines.join("\n"), "text/plain");
      delToast({ title: "PACKAGE ASSEMBLED", text: "Festival submission ready to send.", kind: "good" });
    }, 1600);
  };

  const card = { background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)" };
  const sectionLbl = (t) => <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 12 }}>{t}</div>;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 80px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, paddingBottom: 18, borderBottom: "1px solid var(--c-line)", marginBottom: 26 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 8 }}>07 SHIP · DELIVER</div>
            <h1 className="t-display" style={{ fontSize: "var(--fs-head)", margin: 0, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.01em" }}>
              Masters &amp; festival packages
            </h1>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8 }}>
              Export the finished cut of <span style={{ color: "var(--c-ink)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>{film?.title}</span> and assemble everything a festival or distributor needs.
            </div>
          </div>
          <div style={{
            padding: "8px 14px", borderRadius: 0, flexShrink: 0, textAlign: "right",
            background: locked ? "rgba(106,163,122,.1)" : "rgba(var(--accent-rgb),.08)",
            border: `1px solid ${locked ? "rgba(106,163,122,.35)" : "rgba(var(--accent-rgb),.3)"}`,
          }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: locked ? "var(--c-good)" : "var(--c-amber)" }}>{locked ? "CUT LOCKED" : "RENDER " + renderPct + "%"}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 }}>
              {locked ? `${v1Clips} clips · ${liveRuntime}` : `${liveShotsDone} / ${liveShotsTotal} shots`}
            </div>
          </div>
        </div>

        {/* Master export */}
        {sectionLbl("MASTER EXPORT")}
        <div style={{ ...card, padding: 20, marginBottom: 26 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 18 }}>
            {MASTER_FORMATS.map(f => {
              const sel = fmt === f.id;
              return (
                <button key={f.id} onClick={() => { setFmt(f.id); setDone(false); }} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", textAlign: "left",
                  background: sel ? "rgba(var(--accent-rgb),.07)" : "var(--c-panel-2)",
                  border: `1.5px solid ${sel ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  borderRadius: "var(--r-2)", cursor: "pointer", width: "100%",
                }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${sel ? "var(--c-amber)" : "var(--c-line-3)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {sel && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-amber)" }}/>}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{f.name}</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{f.res}</span>
                    </div>
                    <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>{f.note}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress / action */}
          {exporting ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>RENDERING MASTER…</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{progress}%</span>
              </div>
              <div style={{ height: 6, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ width: progress + "%", height: "100%", background: "var(--c-amber)", transition: "width .25s ease" }}/>
              </div>
            </div>
          ) : done ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={downloadMaster} className="btn btn-primary" style={{ height: 42, padding: "0 20px" }}>
                <Icon name="upload" size={13}/> Download {MASTER_FORMATS.find(x => x.id === fmt)?.name}
              </button>
              <button onClick={startExport} className="btn btn-ghost" style={{ height: 42, padding: "0 16px" }}>Re-render</button>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", marginLeft: "auto" }}>✓ MASTER READY</span>
            </div>
          ) : (
            <button onClick={startExport} className="btn btn-primary" style={{ height: 44, padding: "0 22px", width: "100%", justifyContent: "center" }}>
              Render {MASTER_FORMATS.find(x => x.id === fmt)?.name} master →
            </button>
          )}
        </div>

        {/* Deliverables */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          {sectionLbl("DELIVERABLES")}
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: delivDone === DELIVERABLES.length ? "var(--c-good)" : "var(--c-ink-4)" }}>{delivDone} / {DELIVERABLES.length} READY</span>
        </div>
        <div style={{ ...card, overflow: "hidden", marginBottom: 26 }}>
          {DELIVERABLES.map((d, i) => {
            const on = !!deliv[d.id];
            return (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                <span style={{ width: 34, height: 34, borderRadius: "var(--r-2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: on ? "rgba(106,163,122,.14)" : "var(--c-panel-2)", border: "1px solid var(--c-line-2)", color: on ? "var(--c-good)" : "var(--c-ink-3)" }}>
                  <Icon name={d.icon} size={15}/>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{d.label}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2, letterSpacing: ".08em" }}>{d.sub}</div>
                </div>
                {on && <button onClick={() => d.build()} className="btn btn-ghost btn-icon" style={{ width: 32, height: 32 }} title="Download again"><Icon name="upload" size={13}/></button>}
                <button onClick={() => toggleDeliv(d)} style={{
                  height: 32, padding: "0 14px", borderRadius: "var(--r-2)", cursor: "pointer", flexShrink: 0,
                  background: on ? "transparent" : "var(--c-amber)", color: on ? "var(--c-ink-3)" : tkc("on-amber"),
                  border: on ? "1px solid var(--c-line-2)" : "none",
                  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
                }}>{on ? "✓ DONE" : "GENERATE"}</button>
              </div>
            );
          })}
        </div>

        {/* Festival package */}
        {sectionLbl("FESTIVAL PACKAGE")}
        <div style={{ ...card, padding: 22, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", background: "linear-gradient(180deg, rgba(var(--accent-rgb),.05), var(--c-panel))" }}>
          <div style={{ flex: "1 1 380px" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 6 }}>Assemble a submission package</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, maxWidth: 480 }}>
              Bundles a password-protected screener link, the selected master, and every generated deliverable into one manifest you can send to a festival or buyer.
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 10, letterSpacing: ".08em" }}>
              {delivDone} deliverable{delivDone !== 1 ? "s" : ""} · {MASTER_FORMATS.find(x => x.id === fmt)?.name} master
            </div>
          </div>
          <button onClick={assemblePackage} disabled={pkgBuilding} className="btn btn-primary" style={{ height: 46, padding: "0 24px", flexShrink: 0 }}>
            {pkgBuilding ? "Assembling…" : "Assemble package →"}
          </button>
        </div>

        {/* Hand-off to publish */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 26, padding: "16px 20px", flexWrap: "wrap", ...card }}>
          <Icon name="send" size={16}/>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Ready to release to Cina Watch?</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>Take the master straight into the publish wizard or live Premiere room.</div>
          </div>
          <button onClick={() => window.openPublishWizard && window.openPublishWizard()} className="btn btn-ghost" style={{ height: 38, padding: "0 18px", borderRadius: 0 }}>Open publish →</button>
          <button onClick={() => window.CinaPipeline?.sendNext ? window.CinaPipeline.sendNext("deliver") : window.dispatchEvent(new CustomEvent("cina:setView", { detail: "watch" }))} className="btn btn-primary" style={{ height: 38, padding: "0 18px", borderRadius: 0 }}>Send Next · Premiere Live →</button>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { DeliveryPanel });
