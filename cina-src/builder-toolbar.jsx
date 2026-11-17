// builder-toolbar.jsx — Studio Builder toolbar, plan sheet, domain connect and per-section toolbar.

const { useState: usbTb, useEffect: uebTb, useRef: urbTb } = React;
// ─── Toolbar ────────────────────────────────────────────────────────────

function BuilderToolbar({ page, previewMode, setPreviewMode, dirty, publish, viewLive, undo, redo, canUndo, canRedo, openVersions, compactUI, onSections, onDesign, onPlan }) {
  const used = (page.sections || []).length, lim = wbTier(page);
  const atCap = lim.maxSections !== Infinity && used >= lim.maxSections;
  const planDetail = lim.maxSections === Infinity ? " plan" : ` · ${used} of ${lim.maxSections} sections`;
  const live = () => { if (viewLive) viewLive(); else { const id = (page.domain || "").split(".")[0] || "voss"; if (window.navigate) window.navigate(`/site/${id}`); else window.location.hash = `#/site/${id}`; } };
  const devices = [
    ["desktop", "Desktop", "Desktop · full width", <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><rect x="2.5" y="4" width="19" height="12" rx="1.5"/><path d="M8.5 20h7M12 16v4"/></></svg>],
    ["tablet", "Tablet", "Tablet · 768px", <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M11 18.5h2"/></></svg>],
    ["phone", "Phone", "Phone · 390px", <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><rect x="7" y="2" width="10" height="20" rx="2.2"/><path d="M11 18.5h2"/></></svg>],
  ];
  return (
    <div className="builder-toolbar" role="toolbar" aria-label="Site builder">
      <style>{`
        .builder-toolbar{min-height:56px;padding:0 12px;border-bottom:1px solid var(--c-line);display:flex;align-items:center;gap:8px;background:var(--c-panel);flex-shrink:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
        .builder-toolbar::-webkit-scrollbar{display:none}
        .btb{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 11px;border-radius:var(--r-1);border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-2);font:500 var(--fs-body)/1 var(--f-sans);cursor:pointer;white-space:nowrap;flex-shrink:0}
        .btb:hover:not(:disabled){color:var(--c-ink);border-color:var(--c-ink-3)}
        .btb:disabled{opacity:.4;cursor:default}
        .btb--quiet{border-color:transparent}
        .btb--primary{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-weight:600}
        .btb--primary:hover:not(:disabled){color:var(--c-on-amber);border-color:var(--c-amber-x);background:var(--c-amber-x)}
        .btb-seg{display:flex;gap:2px;padding:2px;border:1px solid var(--c-line);border-radius:var(--r-1);flex-shrink:0}
        .btb-seg .btb{border-color:transparent;height:28px}
        .btb-seg .btb[aria-pressed="true"]{background:var(--c-panel-3);color:var(--c-ink)}
        .btb-div{width:1px;height:22px;background:var(--c-line);flex-shrink:0}
        .btb-save span{display:inline}
        .btb-save{display:inline-flex;align-items:center;gap:7px;font-size:var(--fs-label);color:var(--c-ink-3);white-space:nowrap;flex-shrink:0}
        .btb-save i{width:6px;height:6px;border-radius:50%;background:var(--c-good)}
        .btb-save[data-dirty="1"] i{background:var(--c-amber)}
        @media (max-width:1360px){.builder-toolbar .btb-opt{display:none}}
        @media (max-width:1100px){.builder-toolbar .btb-x{display:none}}
        @media (max-width:960px){.builder-toolbar .btb-x2{display:none}.builder-toolbar{gap:6px;padding:0 8px}}
      `}</style>
      {compactUI && <button className="btb" onClick={onSections}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>Sections</button>}
      <button className="btb btb--quiet" onClick={undo} disabled={!canUndo} title="Undo · ⌘Z" aria-label="Undo"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></></svg><span className="btb-opt">Undo</span></button>
      <button className="btb btb--quiet" onClick={redo} disabled={!canRedo} title="Redo · ⌘⇧Z" aria-label="Redo"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></></svg><span className="btb-opt">Redo</span></button>
      {openVersions && <button className="btb btb--quiet" onClick={openVersions} title="Every publish is kept; restore any of them" aria-label="Versions"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></></svg><span className="btb-opt">Versions</span></button>}
      <button className="btb btb--quiet" onClick={() => window.dispatchEvent(new Event("cina:design-check"))} title="Audit the canvas against the design bar" aria-label="Design check"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg><span className="btb-opt">Check</span></button>
      <span className="btb-div"></span>
      <div className="btb-seg" role="group" aria-label="Preview device">
        {devices.map(([k, label, title, icon]) => (
          <button key={k} className="btb" aria-pressed={previewMode === k} onClick={() => setPreviewMode(k)} title={title} aria-label={label}>{icon}<span className="btb-opt">{label}</span></button>
        ))}
      </div>
      <span className="btb-save" data-dirty={dirty ? "1" : "0"} title={dirty ? "Unsaved changes" : "All saved"}><i></i><span className="btb-x">{dirty ? "Unsaved changes" : "All saved"}</span></span>
      <span style={{ flex: 1 }}></span>
      <CinaPill tone={atCap ? "warn" : lim === WB_TIERS.free ? undefined : "accent"} onClick={onPlan} title={lim.blurb} aria-label={"Plan: " + lim.label + planDetail}>{lim.label}<span className="btb-x">{planDetail}</span></CinaPill>
      <button className="btb" onClick={live} title="Open the site exactly as visitors see it" aria-label="View live"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg><span className="btb-x2">View live</span></button>
      <button className={"btb" + (dirty ? " btb--primary" : "")} onClick={publish} disabled={!dirty} title={dirty ? "Publish your site" : "Everything is live"}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V6M6 11l6-6 6 6"/></svg>{dirty ? "Publish" : "Published"}</button>
      {compactUI && <button className="btb" onClick={onDesign}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></></svg>Design</button>}
    </div>
  );
}

// Plan sheet — billing lives here, not in the editing toolbar.
function BuilderPlanSheet({ page, onPick, onClose }) {
  const used = (page.sections || []).length;
  return (
    <CinaSheet title="Plan" kicker="Your site" onClose={onClose} width={420}>
      <p style={{ margin: "0 0 18px", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
        {page.tier === "free" ? `Free sites can have up to ${WB_TIERS.free.maxSections} sections. You're using ${used}.` : `You're on ${wbTier(page).label}. Sections are unlimited.`}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.entries(WB_TIERS).map(([id, t]) => {
          const on = (page.tier || "free") === id;
          return (
            <button key={id} onClick={() => onPick(id)} style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, padding: 16, borderRadius: "var(--r-2)", border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`, background: on ? "rgba(var(--accent-rgb),.06)" : "transparent" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{t.label}</span>
                {on && <CinaPill tone="accent">Current</CinaPill>}
              </span>
              <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{t.blurb}</span>
            </button>
          );
        })}
      </div>
    </CinaSheet>
  );
}

// ─── Custom domain connect ─ a real (simulated) DNS flow, not a text label ──
function DomainConnectV2({ page, onUpdate }) {
  const tier = wbTier(page);
  const dc = page.customDomain;
  const [host, setHost] = usbTb(dc ? dc.host : "");
  const [checking, setChecking] = usbTb(false);
  const clean = (host || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const isApex = clean.split(".").filter(Boolean).length === 2;
  const apexBlocked = isApex && !tier.apex;
  const valid = /^[a-z0-9.-]+\.[a-z]{2,}$/.test(clean);
  const mono = { fontFamily: "var(--f-mono)", letterSpacing: ".08em" };
  const recRow = (kind, name, value) => (
    <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 8, padding: "6px 8px", background: "var(--c-panel-2)", borderRadius: "var(--r-1)" }}>
      <span style={{ ...mono, fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{kind}</span>
      <span style={{ ...mono, fontSize: "var(--fs-label)", color: "var(--c-ink-2)", wordBreak: "break-all" }}>{name} → {value}</span>
    </div>
  );
  const check = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      onUpdate({ customDomain: { host: clean, status: "verified", at: Date.now() } });
      if (window.toast) window.toast({ title: "DOMAIN CONNECTED", text: `${clean} now points at your site · SSL issues automatically.`, kind: "good" });
    }, 1600);
  };
  return (
    <FieldV2 label="CUSTOM DOMAIN">
      {dc && dc.status === "verified" ? (
        <div style={{ padding: "10px 12px", background: "var(--c-bg)", border: "1px solid rgba(106,163,122,.4)", borderRadius: "var(--r-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)", flexShrink: 0 }}/>
            <span style={{ ...mono, fontSize: "var(--fs-label)", color: "var(--c-ink)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dc.host}</span>
            <span style={{ ...mono, fontSize: "var(--fs-label)", color: "var(--c-good)" }}>CONNECTED · SSL</span>
          </div>
          <button onClick={() => { onUpdate({ customDomain: null }); setHost(""); }} style={{ marginTop: 8, padding: "5px 9px", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", color: "var(--c-ink-3)", cursor: "pointer", ...mono, fontSize: "var(--fs-label)" }}>DISCONNECT</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={host} placeholder={tier.apex ? "yourdomain.com" : "films.yourdomain.com"} onChange={e => setHost(e.target.value)} style={inpV2}/>
          {apexBlocked && (
            <div style={{ ...mono, fontSize: "var(--fs-label)", color: `var(--c-warn, ${tkc("warn")})`, lineHeight: 1.5 }}>Apex domains ({clean}) need Enterprise — use a subdomain, or <button onClick={() => onUpdate({ tier: "enterprise" })} style={{ background: "transparent", border: "none", color: "var(--c-amber)", cursor: "pointer", ...mono, fontSize: "var(--fs-label)", padding: 0, textDecoration: "underline" }}>upgrade</button>.</div>
          )}
          {valid && !apexBlocked && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ ...mono, fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>ADD AT YOUR DNS PROVIDER</div>
              {isApex ? recRow("A", "@", "76.76.21.21") : recRow("CNAME", clean.split(".")[0], `${page.domain}.site`)}
              <button onClick={check} disabled={checking} style={{ marginTop: 4, padding: "8px 10px", background: checking ? "var(--c-panel-2)" : "var(--c-amber)", border: "none", borderRadius: "var(--r-1)", color: checking ? "var(--c-ink-3)" : tkc("on-amber"), cursor: checking ? "default" : "pointer", ...mono, fontSize: "var(--fs-label)", fontWeight: 700 }}>{checking ? "CHECKING DNS…" : "CHECK DNS & CONNECT"}</button>
            </div>
          )}
        </div>
      )}
    </FieldV2>
  );
}


// ─── Section toolbar (floating on selected) ─────────────────────────────

function SectionToolbar({ accent, onInsertAfter, onMove, onRemove, onDuplicate, onDragStart, onDragEnd }) {
  // Clamp below the site's sticky/overlay header: if the default spot
  // (top 8) would sit under the page <header>, push the toolbar down so
  // the nav and the section controls never interleave.
  const tbRef = urbTb(null);
  const [tbTop, setTbTop] = usbTb(8);
  uebTb(() => {
    const el = tbRef.current; if (!el) return;
    const sec = el.offsetParent;
    const hdr = sec && sec.parentElement ? sec.parentElement.querySelector("header") : null;
    const update = () => {
      if (!sec || !hdr) { setTbTop(8); return; }
      const hb = hdr.getBoundingClientRect().bottom;
      const sr = sec.getBoundingClientRect();
      setTbTop(sr.top + 8 < hb ? Math.min(hb - sr.top + 8, Math.max(8, sr.height - 34)) : 8);
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, []);
  const btn = {
    width: 28, height: 24, fontSize: "var(--fs-label)", color: tkc("white"),
    background: "rgba(0,0,0,0.7)", border: `1px solid ${accent}66`,
    borderRadius: "var(--r-1)", cursor: "pointer",
  };
  return (
    <div ref={tbRef} onClick={e => e.stopPropagation()} style={{
      position: "absolute", top: tbTop, right: 8, display: "flex", gap: 4, zIndex: 10,
    }}>
      {onDragStart && (
        <button
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{ ...btn, cursor: "grab", borderColor: accent, color: accent, fontSize: "var(--fs-body)", letterSpacing: "-1px" }}
          title="Drag to reorder">⠿</button>
      )}
      <button onClick={() => onMove(-1)} style={btn} title="Move up">↑</button>
      <button onClick={() => onMove(1)}  style={btn} title="Move down">↓</button>
      <button onClick={onDuplicate}      style={btn} title="Duplicate · ⌘D">⧉</button>
      <button onClick={onInsertAfter}    style={btn} title="Add below">+</button>
      <button onClick={onRemove}         style={{ ...btn, color: tkc("amber-x") }} title="Delete · ⌫">×</button>
    </div>
  );
}

Object.assign(window, { BuilderToolbar, BuilderPlanSheet, DomainConnectV2, SectionToolbar });
