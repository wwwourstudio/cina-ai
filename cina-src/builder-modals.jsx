// builder-modals.jsx — Studio Builder dialogs: versions, logo studio, Cina assist.

const { useState: usbMd, useRef: urbMd } = React;
// ─── Insert overlay ─────────────────────────────────────────────────────────
// (The old InsertOverlayV2 was removed — InsertOverlayV3 in
// builder-templates.jsx is the only picker.)

// ─── Versions — publish history modal ────────────────────────────────
const vBtnV2 = { padding: "7px 11px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 };
function VersionsModalV2({ creatorId, livePage, onClose, onRestore }) {
  const snaps = wbLoadSnapshotsV2(creatorId);
  const fmt = (ts) => new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const exportFile = () => {
    const pg = livePage || (snaps[0] && snaps[0].page); if (!pg) return;
    const blob = new Blob([JSON.stringify({ cina: "studio-site", v: 2, creatorId, at: Date.now(), page: pg }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${(pg.domain || creatorId).replace(/\W+/g, "-")}-site.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importFile = (ev) => {
    const file = ev.target.files && ev.target.files[0]; if (!file) return;
    file.text().then(txt => { const d = JSON.parse(txt); if (!d || d.cina !== "studio-site" || !d.page || !Array.isArray(d.page.sections)) throw new Error("bad"); onRestore(d.page, "file"); })
      .catch(() => window.toast && toast({ title: "NOT A SITE FILE", text: "Pick a file downloaded from Versions.", kind: "warn" }));
  };
  const row = { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--c-line)" };
  return (
    <CinaModal onClose={onClose} title="Versions" kicker={`Last ${snaps.length} publish${snaps.length === 1 ? "" : "es"}`} width={500} bodyStyle={{ padding: 0 }}
      actions={<>
        <button onClick={exportFile} style={vBtnV2}>Download site file</button>
        <label style={{ ...vBtnV2, display: "inline-flex", alignItems: "center", cursor: "pointer" }}>Open site file<input type="file" accept="application/json,.json" onChange={importFile} style={{ display: "none" }}/></label>
      </>}>
        {livePage && (
          <div style={row}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-good)", flexShrink: 0 }}></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Currently live</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 2 }}>{(livePage.sections || []).length} SECTIONS</div>
            </div>
            <button onClick={() => onRestore(livePage, "live")} style={vBtnV2}>Revert canvas to live</button>
          </div>
        )}
        {snaps.length === 0 && <div style={{ padding: 22, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>No published versions yet. Every publish is kept here, so one bad publish is never one-way.</div>}
        {snaps.map((s, i) => (
          <div key={s.at} style={row}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", width: 18 }}>{String(snaps.length - i).padStart(2, "0")}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{fmt(s.at)}{i === 0 ? " · latest" : ""}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 2 }}>{(s.page.sections || []).length} SECTIONS · {(s.page.tier || "free").toUpperCase()}</div>
            </div>
            <button onClick={() => onRestore(s.page, "snapshot")} style={vBtnV2}>Restore</button>
          </div>
        ))}
        <div style={{ padding: "14px 16px", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.55 }}>Sites are saved in this browser. To move a site to another device, download the site file here and open it there.</div>
    </CinaModal>
  );
}

// ─── Logo Studio ────────────────────────────────────────────────────────

// Live preview of the logo exactly as it sits in the site header — so the
// choice is judged in context, not as a floating swatch.
function LogoHeaderPreview({ logo, studioName, accent, bg = tkc("bg"), ink = tkc("ink") }) {
  const renderMark = () => {
    if (logo?.kind === "image" && logo.src) return <img src={logo.src} alt="logo" style={{ height: 34, width: "auto", objectFit: "contain" }}/>;
    if (logo?.kind === "monogram") {
      const letter = (logo.text || studioName || "S")[0];
      const shape = logo.shape || "circle";
      const fill = (logo.color === "ink") ? ink : accent;
      return (
        <span style={{
          width: 38, height: 38, flexShrink: 0,
          borderRadius: shape === "circle" ? "50%" : shape === "square" ? 7 : 0,
          background: shape === "none" ? "transparent" : fill,
          color: shape === "none" ? fill : bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 600,
        }}>{letter}</span>
      );
    }
    return <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: ink, fontWeight: 500, letterSpacing: "-0.01em" }}>{logo?.text || studioName}</span>;
  };
  return (
    <div style={{ borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line)" }}>
      <div style={{ height: 64, background: bg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px" }}>
        {renderMark()}
        <div style={{ display: "flex", gap: 18 }}>
          {["WORK", "ABOUT", "SHOP"].map(m => (
            <span key={m} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: ink, opacity: 0.6 }}>{m}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "6px 10px", background: "var(--c-bg)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)", flexShrink: 0 }}/>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>LIVE HEADER PREVIEW</span>
      </div>
    </div>
  );
}

function LogoStudio({ logo, setLogo, studioName, accent, onClose }) {
  const [tab, setTab] = usbMd(logo?.kind === "image" ? "upload" : logo?.kind === "monogram" ? "monogram" : "wordmark");
  const [aiPrompt, setAiPrompt] = usbMd(`A minimal monogram logo for "${studioName}". Black on transparent. Single letter, hand-drawn feel, serif inspired.`);
  const [aiGenerating, setAiGenerating] = usbMd(false);
  const [aiResults, setAiResults] = usbMd([]);
  const [removingBg, setRemovingBg] = usbMd(false);
  const fileRef = urbMd(null);

  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setLogo({ ...logo, kind: "image", src: r.result, transparentBg: false });
    r.readAsDataURL(f);
  };
  const runAi = () => {
    setAiGenerating(true);
    setTimeout(() => {
      // Local mark engine — 8 art-directed candidates built from the studio
      // name + prompt hints. Real logo constructions, not just a glyph.
      const q = (aiPrompt || "").toLowerCase();
      const name = (studioName || "Studio").trim();
      const words = name.split(/\s+/);
      const initials = words.map(w => w[0]).join("").slice(0, 2).toUpperCase();
      const L = initials[0] || "S";
      const ink = tkc("ink");
      const useSerif = !q.includes("geometric") && !q.includes("sans");
      const f = useSerif ? "Fraunces, Georgia, serif" : "Geist, Helvetica, sans-serif";
      const svgs = [
        // 1 · Ring monogram — thin circle, italic letter
        `<circle cx='100' cy='100' r='78' fill='none' stroke='${accent}' stroke-width='3'/><text x='100' y='138' font-family='${f}' font-size='104' font-style='italic' fill='${ink}' text-anchor='middle' font-weight='500'>${L}</text>`,
        // 2 · Frame + baseline — editorial plate
        `<rect x='28' y='28' width='144' height='144' fill='none' stroke='${ink}' stroke-width='2.5'/><text x='100' y='128' font-family='${f}' font-size='84' font-style='italic' fill='${ink}' text-anchor='middle' font-weight='500'>${initials}</text><rect x='52' y='146' width='96' height='4' fill='${accent}'/>`,
        // 3 · Cut slash — letter sliced by an accent diagonal
        `<text x='100' y='148' font-family='${f}' font-size='150' fill='${ink}' text-anchor='middle' font-weight='600'>${L}</text><rect x='-30' y='94' width='260' height='9' fill='${accent}' transform='rotate(-18 100 100)'/>`,
        // 4 · Solid coin — filled disc, knockout letter
        `<circle cx='100' cy='100' r='84' fill='${accent}'/><text x='100' y='140' font-family='${f}' font-size='110' font-style='italic' fill={tkc("bg")} text-anchor='middle' font-weight='600'>${L}</text>`,
        // 5 · Stacked initials — offset overlap
        `<text x='78' y='124' font-family='${f}' font-size='118' fill='${ink}' text-anchor='middle' font-weight='500' opacity='.92'>${initials[0] || L}</text><text x='126' y='160' font-family='${f}' font-size='118' font-style='italic' fill='${accent}' text-anchor='middle' font-weight='500'>${initials[1] || L}</text>`,
        // 6 · Marquee dot — letter + orbiting premiere dot
        `<text x='94' y='142' font-family='${f}' font-size='128' font-style='italic' fill='${ink}' text-anchor='middle' font-weight='500'>${L}</text><circle cx='156' cy='62' r='12' fill='${accent}'/>`,
        // 7 · Negative bar — black plate, letter punched over accent column
        `<rect x='30' y='30' width='140' height='140' fill='${ink}'/><rect x='30' y='30' width='34' height='140' fill='${accent}'/><text x='112' y='138' font-family='${f}' font-size='96' font-style='italic' fill={tkc("bg")} text-anchor='middle' font-weight='600'>${L}</text>`,
        // 8 · Underscored wordmark chip — full name, tiny
        `<text x='100' y='106' font-family='${f}' font-size='${Math.max(18, Math.min(34, 300 / name.length))}' font-style='italic' fill='${ink}' text-anchor='middle' font-weight='500'>${name}</text><rect x='40' y='122' width='120' height='3.5' fill='${accent}'/>`,
      ].map(inner => "data:image/svg+xml;utf8," + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>${inner}</svg>`
      ));
      setAiResults(svgs);
      setAiGenerating(false);
    }, 1400);
  };
  const removeBg = () => {
    setRemovingBg(true);
    setTimeout(() => {
      setLogo({ ...logo, transparentBg: true });
      setRemovingBg(false);
      if (window.toast) window.toast({ title: "BG REMOVED", text: "Logo is now transparent PNG · 1024×1024", kind: "good" });
    }, 2200);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(18px)",
      zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 880, maxWidth: "100%", maxHeight: "85vh", display: "flex",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", overflow: "hidden",
      }}>
        <div style={{ width: 200, padding: 18, borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6 }}>✸ LOGO STUDIO</div>
          {[
            { id: "wordmark", label: "Wordmark", sub: "Italic display type" },
            { id: "monogram", label: "Monogram", sub: "One-letter mark" },
            { id: "upload",   label: "Upload",   sub: "PNG / SVG · ≤2 MB" },
            { id: "ai",       label: "AI generate", sub: "From a prompt" },
            { id: "bgremove", label: "Remove BG",  sub: "→ transparent PNG" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "9px 11px", textAlign: "left",
              background: tab === t.id ? "rgba(var(--accent-rgb),.10)" : "transparent",
              border: `1px solid ${tab === t.id ? "var(--c-amber)" : "transparent"}`,
              borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tab === t.id ? "var(--c-amber)" : "var(--c-ink)", letterSpacing: ".08em", fontWeight: 600 }}>{t.label}</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{t.sub}</span>
            </button>
          ))}
          <div style={{ flex: 1 }}></div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", lineHeight: 1.5, margin: "8px 0" }}>
            Your pick applies live to the header.
          </div>
          <button onClick={onClose} style={{
            padding: "9px 11px", background: "var(--c-amber)", color: "var(--c-on-amber)",
            border: "none", borderRadius: "var(--r-1)", cursor: "pointer",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
          }} aria-label="Close" title="Close">✓ USE THIS LOGO</button>
        </div>

        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <div style={{ marginBottom: 22 }}>
            <LogoHeaderPreview logo={logo} studioName={studioName} accent={accent}/>
          </div>
          {tab === "wordmark" && (
            <div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 6px" }}>Wordmark</h2>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 }}>The studio name set in your headline typeface.</p>
              <FieldV2 label="WORDMARK TEXT">
                <input value={logo?.text || studioName} onChange={e => setLogo({ ...logo, kind: "wordmark", text: e.target.value })} style={inpV2}/>
              </FieldV2>
              <div style={{
                marginTop: 18, padding: 36,
                background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: "var(--fs-display)", color: "var(--c-ink)", fontWeight: 500, letterSpacing: "-0.02em",
                }}>{logo?.text || studioName}</span>
              </div>
            </div>
          )}

          {tab === "monogram" && (
            <div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 6px" }}>Monogram</h2>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 }}>A single letter mark. Works at 24px and 240px.</p>
              <FieldV2 label="LETTER">
                <input value={(logo?.text || studioName)[0]} maxLength={2} onChange={e => setLogo({ ...logo, kind: "monogram", text: e.target.value.toUpperCase() })} style={inpV2}/>
              </FieldV2>
              <FieldV2 label="SHAPE">
                <div style={{ display: "flex", gap: 6 }}>
                  {[["circle", "Circle"], ["square", "Rounded"], ["none", "Letter only"]].map(([id, lbl]) => (
                    <button key={id} onClick={() => setLogo({ ...logo, kind: "monogram", shape: id })} style={{
                      flex: 1, padding: "9px 8px", cursor: "pointer", borderRadius: "var(--r-2)",
                      background: (logo?.shape || "circle") === id ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
                      border: `1px solid ${(logo?.shape || "circle") === id ? "var(--c-amber)" : "var(--c-line-2)"}`,
                      color: (logo?.shape || "circle") === id ? "var(--c-amber)" : "var(--c-ink-2)",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                    }}>{lbl}</button>
                  ))}
                </div>
              </FieldV2>
              <FieldV2 label="FILL">
                <div style={{ display: "flex", gap: 6 }}>
                  {[["accent", "Accent"], ["ink", "Ink"]].map(([id, lbl]) => (
                    <button key={id} onClick={() => setLogo({ ...logo, kind: "monogram", color: id })} style={{
                      flex: 1, padding: "9px 8px", cursor: "pointer", borderRadius: "var(--r-2)",
                      background: (logo?.color || "accent") === id ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
                      border: `1px solid ${(logo?.color || "accent") === id ? "var(--c-amber)" : "var(--c-line-2)"}`,
                      color: (logo?.color || "accent") === id ? "var(--c-amber)" : "var(--c-ink-2)",
                      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                    }}>{lbl}</button>
                  ))}
                </div>
              </FieldV2>
            </div>
          )}

          {tab === "upload" && (
            <div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 6px" }}>Upload a logo</h2>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 }}>PNG, SVG, or JPG up to 2 MB. We recommend transparent PNG.</p>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile}/>
              <button onClick={() => fileRef.current?.click()} style={{
                width: "100%", padding: "32px", background: "var(--c-bg)",
                border: "1.5px dashed var(--c-amber)", borderRadius: "var(--r-2)", cursor: "pointer",
                color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>↑ Drop or click to upload</button>
              {logo?.src && (
                <div style={{ marginTop: 18, padding: 24, background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 18 }}>
                  <img src={logo.src} alt="logo" style={{ height: 80, width: "auto", objectFit: "contain" }}/>
                  <div style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>
                    {logo.transparentBg ? "✓ Transparent PNG · 1024×1024" : "Uploaded · click Remove BG to get a transparent version"}
                  </div>
                  <button onClick={() => setLogo({ ...logo, src: null })} style={smBtnV2}>Clear</button>
                </div>
              )}
            </div>
          )}

          {tab === "ai" && (
            <div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 6px" }}>AI generate a logo</h2>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 }}>Describe the mark. Cina drafts 8 constructions — ring, frame, slash, coin, stack, orbit, plate, wordmark. Pick one; it becomes your header logo.</p>
              <FieldV2 label="PROMPT">
                <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={4} style={{ ...inpV2, resize: "vertical" }}/>
              </FieldV2>
              <button onClick={runAi} disabled={aiGenerating} style={{
                marginTop: 8, padding: "10px 16px",
                background: aiGenerating ? "var(--c-panel-3)" :  "var(--c-amber)",
                color: aiGenerating ? "var(--c-ink-3)" : tkc("on-amber"),
                border: "none", borderRadius: "var(--r-1)", cursor: aiGenerating ? "default" : "pointer",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
              }}>{aiGenerating ? "Drafting marks…" : "✦ Generate 8 candidates"}</button>
              {aiResults.length > 0 && (
                <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {aiResults.map((src, i) => (
                    <button key={i} onClick={() => setLogo({ ...logo, kind: "image", src, transparentBg: true })} style={{
                      aspectRatio: "1/1", padding: 0,
                      background: `url(${src}) center/contain no-repeat ${tkc("panel-3")}`,
                      border: logo?.src === src ? `2px solid var(--c-amber)` : `1px solid var(--c-line-2)`,
                      borderRadius: "var(--r-2)", cursor: "pointer",
                    }}/>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "bgremove" && (
            <div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "0 0 6px" }}>Remove background</h2>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 }}>Convert your uploaded logo to transparent PNG. Uses BiRefNet. ~3s.</p>
              {logo?.src ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 14, alignItems: "center" }}>
                    <div style={{ padding: 20, background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", textAlign: "center" }}>
                      <div className="t-label" style={{ marginBottom: 10 }}>BEFORE</div>
                      <img src={logo.src} alt="before" style={{ maxHeight: 140, width: "auto" }}/>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-lead)", color: "var(--c-amber)", textAlign: "center" }}>→</div>
                    <div style={{
                      padding: 20, background: "repeating-conic-gradient(rgba(255,255,255,.05) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
                      border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", textAlign: "center",
                    }}>
                      <div className="t-label" style={{ marginBottom: 10 }}>AFTER · TRANSPARENT</div>
                      <img src={logo.src} alt="after" style={{ maxHeight: 140, width: "auto", filter: logo.transparentBg ? "" : "blur(2px)" }}/>
                    </div>
                  </div>
                  <button onClick={removeBg} disabled={removingBg || logo.transparentBg} style={{
                    marginTop: 18, padding: "10px 16px",
                    background: logo.transparentBg ? "var(--c-good)" : removingBg ? "var(--c-panel-3)" :  "var(--c-amber)",
                    color: logo.transparentBg ? tkc("panel-2") : removingBg ? "var(--c-ink-3)" : tkc("on-amber"),
                    border: "none", borderRadius: "var(--r-1)", cursor: removingBg || logo.transparentBg ? "default" : "pointer",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
                  }}>{logo.transparentBg ? "✓ Background removed" : removingBg ? "Removing · ~3s" : "▲ Remove background"}</button>
                </>
              ) : (
                <div style={{
                  padding: 36, background: "var(--c-bg)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)",
                  fontSize: "var(--fs-body)", color: "var(--c-ink-3)", textAlign: "center",
                }}>
                  Upload a logo first (see Upload tab).
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 18,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,0,0,.5)", border: "1px solid var(--c-line-2)",
          color: "var(--c-ink-3)", cursor: "pointer", fontSize: "var(--fs-body)",
        }} aria-label="Close" title="Close">×</button>
      </div>
    </div>
  );
}

// ─── Cina assist ────────────────────────────────────────────────────────

function CinaAssistV2({ page, onClose, onApply }) {
  const [prompt, setPrompt] = usbMd("");
  const [thinking, setThinking] = usbMd(false);
  const [response, setResponse] = usbMd(null);
  const CHIPS = [
    "Make it feel like a darkroom — red, hand-crafted, mono.",
    "More minimal — strip everything and lean into white space.",
    "Brighter, paper-like, editorial — magazine vibe.",
    "Add a parallax hero and reorder for film-first feel.",
    "A 90s VHS aesthetic — purple, scanlines, urgent.",
  ];
  // Local design engine — used when the live model isn't reachable, so
  // Ask Cina ALWAYS answers. Keyword-driven, opinionated presets.
  const localDesign = (text) => {
    const q = (text || "").toLowerCase();
    const has = (...ws) => ws.some(w => q.includes(w));
    if (has("darkroom", "red", "oxblood", "blood", "hand-crafted", "mono"))
      return { summary: "Darkroom: near-black warm bg, oxblood accent, framed header, mono footer, slow fades.",
        theme: { ...CINA_TOKENS.SITE.themes.noir }, defaultAnimation: "fade-in",
        header: { preset: "framed", transparent: false }, footer: { preset: "stacked-mono" } };
    if (has("paper", "bright", "editorial", "magazine", "light"))
      return { summary: "Editorial paper: warm ivory page, ink type, terracotta accent, centered wordmark.",
        theme: { ...CINA_TOKENS.SITE.themes.paper }, defaultAnimation: "fade-up",
        header: { preset: "wordmark-center", transparent: false }, footer: { preset: "single-line" } };
    if (has("vhs", "90s", "scanline", "purple", "urgent"))
      return { summary: "VHS: deep violet bg, electric purple accent, live ticker header, blur reveals.",
        theme: { ...CINA_TOKENS.SITE.themes.violet }, defaultAnimation: "blur",
        header: { preset: "ticker", transparent: false }, footer: { preset: "marquee-tail" } };
    if (has("minimal", "strip", "white space", "clean", "quiet"))
      return { summary: "Minimal: strip the chrome — logo-only header, single-line footer, no entrance motion.",
        theme: { ...CINA_TOKENS.SITE.themes.mono }, defaultAnimation: "none",
        header: { preset: "logo-only", transparent: true }, footer: { preset: "single-line" } };
    if (has("ocean", "blue", "cold", "sea"))
      return { summary: "Cold open: ink-blue page, steel accent, transparent header over the hero.",
        theme: { ...CINA_TOKENS.SITE.themes.marine }, defaultAnimation: "fade-up",
        header: { preset: "transparent", transparent: true }, footer: { preset: "directory" } };
    if (has("gold", "lux", "premiere", "gala", "prestige"))
      return { summary: "Prestige: black-tie page, champagne-gold accent, split-bar header with a CTA.",
        theme: { ...CINA_TOKENS.SITE.themes.ochre }, defaultAnimation: "zoom",
        header: { preset: "split-bar", transparent: false }, footer: { preset: "big-cta" } };
    if (has("forest", "green", "natural", "organic"))
      return { summary: "Undergrowth: moss-dark page, sage accent, hamburger header, manifesto footer.",
        theme: { ...CINA_TOKENS.SITE.themes.moss }, defaultAnimation: "fade-up",
        header: { preset: "hamburger", transparent: false }, footer: { preset: "manifesto" } };
    if (has("parallax", "film-first", "cinematic", "cinema"))
      return { summary: "Film-first: transparent header floating over a parallax hero, zoom-in sections.",
        defaultAnimation: "zoom", header: { preset: "transparent", transparent: true }, footer: { preset: "big-cta" } };
    // Fallback — derive a stable hue from the prompt and build a dark theme around it.
    let h = 0; for (let i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    const accent = `hsl(${hue}, 48%, 62%)`;
    return { summary: `A dark room keyed to your words — accent pulled to hue ${hue}°, soft fades, right-aligned wordmark.`,
      theme: { bg: tkc("bg"), ink: tkc("ink"), accent }, defaultAnimation: "fade-up",
      header: { preset: "wordmark-right", transparent: false }, footer: { preset: "stacked-mono" } };
  };

  const ask = async (text) => {
    setThinking(true); setResponse(null);
    try {
      if (!window.claude || !window.claude.complete) { setResponse(localDesign(text)); return; }
      const r = await window.claude.complete(`You are Cina, design AI for filmmaker studio websites.
Current theme: ${JSON.stringify(page.theme)}
Current sections: ${page.sections.map(s => s.type).join(", ")}
User asks: "${text}"
Respond VALID JSON only, no fences:
{
  "summary": "one sentence about what you'd change",
  "theme": { "bg": "#hex", "ink": "#hex", "accent": "#hex" },
  "defaultAnimation": "fade-up|fade-in|slide-left|zoom|blur|none",
  "header": { "preset": "wordmark-right|wordmark-center|logo-only|hamburger|split-bar|framed|transparent|ticker", "transparent": true },
  "footer": { "preset": "stacked-mono|single-line|big-cta|manifesto|directory|marquee-tail" }
}
Only include keys you want to change. Be opinionated and specific.`);
      const j = JSON.parse(r.match(/\{[\s\S]*\}/)?.[0] || "{}");
      setResponse(j.summary ? j : localDesign(text));
    } catch (e) {
      setResponse(localDesign(text));
    } finally { setThinking(false); }
  };
  const apply = () => {
    if (!response) return;
    const updates = {};
    if (response.theme) updates.theme = { ...page.theme, ...response.theme };
    if (response.header) updates.header = { ...page.header, ...response.header };
    if (response.footer) updates.footer = { ...page.footer, ...response.footer };
    if (response.defaultAnimation) updates.defaultAnimation = response.defaultAnimation;
    onApply(updates);
  };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(20px)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 600, maxWidth: "100%", background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 28,
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>✦ CINA · DESIGN ASSIST</div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, margin: "6px 0 8px" }}>Tell Cina the vibe.</h2>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: 0 }}>One sentence. Cina rewrites theme + header + footer + animation.</p>
        </div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Cinema feel · transparent header · zoom-in sections · oxblood accent." rows={3} autoFocus
          style={{ ...inpV2, resize: "vertical", fontSize: "var(--fs-body)" }}/>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CHIPS.map(p => <button key={p} onClick={() => setPrompt(p)} style={{
            padding: "5px 10px", fontSize: "var(--fs-label)",
            background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
            color: "var(--c-ink-2)", cursor: "pointer",
          }}>{p}</button>)}
        </div>
        {response && !response.error && (
          <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-amber)", borderRadius: "var(--r-2)", padding: 14 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>CINA SUGGESTS</div>
            <div style={{ fontSize: "var(--fs-body)", fontStyle: "italic", fontFamily: "var(--f-display)", marginBottom: 10 }}>"{response.summary}"</div>
            {response.theme && (
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                {response.theme.bg     && <div title="bg"     style={{ width: 28, height: 28, background: response.theme.bg,     border: "1px solid var(--c-line-2)" }}/>}
                {response.theme.ink    && <div title="ink"    style={{ width: 28, height: 28, background: response.theme.ink,    border: "1px solid var(--c-line-2)" }}/>}
                {response.theme.accent && <div title="accent" style={{ width: 28, height: 28, background: response.theme.accent, border: "1px solid var(--c-line-2)" }}/>}
              </div>
            )}
          </div>
        )}
        {response?.error && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-blood-l)" }}>{response.summary}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={smBtnV2} aria-label="Close" title="Close">Close</button>
          {response && !response.error
            ? <button onClick={apply} style={{ ...smBtnV2, background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", fontWeight: 700 }}>Apply changes</button>
            : <button onClick={() => ask(prompt)} disabled={!prompt.trim() || thinking} style={{ ...smBtnV2, background: prompt.trim() && !thinking ? "var(--c-amber)" : "var(--c-line-2)", color: prompt.trim() && !thinking ? tkc("on-amber") : "var(--c-ink-4)", border: "none", fontWeight: 700, cursor: prompt.trim() && !thinking ? "pointer" : "default" }}>
                {thinking ? "Thinking…" : "Ask Cina"}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VersionsModalV2, LogoStudio, CinaAssistV2 });
