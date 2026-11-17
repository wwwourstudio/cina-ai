// builder-v3-inspector.jsx — SectionInspectorV3
// Full per-type editors for EVERY block in the Studio Builder, plus a
// shared DISPLAY group (animate · background tone · padding · duplicate).
// Replaces SectionInspectorV2 at the call site in builder-app.jsx.

const { useState: usI3 } = React;

const inpI3 = {
  width: "100%", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", padding: "8px 10px", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none", boxSizing: "border-box",
};
const smBtnI3 = {
  padding: "8px 14px", background: "transparent",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
  color: "var(--c-ink-2)", fontSize: "var(--fs-label)", cursor: "pointer",
  fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase",
};
const mlPickBtnI3 = {
  width: "100%", padding: "10px", background: "rgba(var(--accent-rgb),.08)",
  border: "1px solid rgba(var(--accent-rgb),.4)", borderRadius: "var(--r-2)", cursor: "pointer",
  color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
  fontWeight: 700, textTransform: "uppercase",
};

function FieldI3({ label, children, hint }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.4 }}>{hint}</span>}
    </label>
  );
}
function SelI3({ label, value, onChange, options }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      {label && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={inpI3}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function SlI3({ label, min, max, step, value, onChange, fmt }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{label}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ width: "100%", accentColor: tkc("amber") }}/>
    </div>
  );
}
function TogI3({ label, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 9px",
      background: value ? "rgba(var(--accent-rgb),.08)" : "var(--c-bg)", border: "1px solid var(--c-line)",
      borderRadius: "var(--r-1)", flex: 1, appearance: "none", textAlign: "left",
    }}>
      <span style={{
        width: 28, height: 15, borderRadius: "var(--r-2)", padding: 1.5, flexShrink: 0,
        background: value ? "var(--c-amber)" : "var(--c-panel-3)", transition: "background .15s",
      }}>
        <span style={{
          display: "block", width: 12, height: 12, borderRadius: "50%",
          background: value ? tkc("on-amber") : "var(--c-ink-3)",
          transform: value ? "translateX(13px)" : "translateX(0)", transition: "transform .15s",
        }}></span>
      </span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{label}</span>
    </button>
  );
}

// Generic list editor — rows of fields with add/remove/reorder.
function ListEditorI3({ items = [], onChange, fields, addLabel, makeNew }) {
  const upd = (i, patch) => { const next = [...items]; next[i] = { ...next[i], ...patch }; onChange(next); };
  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: 10, border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", background: "var(--c-panel-2)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {fields.map(f => f.long ? (
              <textarea key={f.key} value={it[f.key] || ""} placeholder={f.ph} rows={2}
                onChange={e => upd(i, { [f.key]: e.target.value })} style={{ ...inpI3, resize: "vertical" }}></textarea>
            ) : (
              <input key={f.key} value={it[f.key] ?? ""} placeholder={f.ph}
                onChange={e => upd(i, { [f.key]: f.num ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value })} style={inpI3}/>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            <button onClick={() => move(i, -1)} style={{ ...smBtnI3, padding: "4px 8px" }}>↑</button>
            <button onClick={() => move(i, 1)} style={{ ...smBtnI3, padding: "4px 8px" }}>↓</button>
            <span style={{ flex: 1 }}></span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ ...smBtnI3, padding: "4px 10px", color: "var(--c-blood-l)", borderColor: "var(--c-blood)" }}>Remove</button>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...items, makeNew()])} style={{
        padding: "9px 12px", background: "transparent", border: "1px dashed var(--c-line-3)",
        borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer",
      }}>+ {addLabel}</button>
    </div>
  );
}

// Film picker fed by the live catalog.
function FilmPickI3({ value, onChange }) {
  const films = (window.CATALOG || []);
  return (
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={inpI3}>
      {films.map(f => <option key={f.id} value={f.id}>{f.title} · {f.year}</option>)}
    </select>
  );
}

// ─── Live data readers (same keys the Notebook + Store apps write) ─────────
function nbLivePosts() { try { const v = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null"); return Array.isArray(v) ? v.filter(p => p.status === "published") : []; } catch { return []; } }
function storeLiveProducts() { try { const v = JSON.parse(localStorage.getItem("cina:studio-store") || "null"); return Array.isArray(v) ? v.filter(p => p.status === "active") : []; } catch { return []; } }

// A "connected to a live source" panel — replaces static content lists so the
// section is understood as DYNAMIC (it mirrors the Notebook / Store), with
// real display controls instead of frozen text fields.
function DynamicSourceI3({ tone = "amber", title, count, noun, manageHref, manageLabel, empty, children }) {
  const live = count > 0;
  const c = tone === "good" ? "var(--c-good)" :  "var(--c-amber)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ borderRadius: "var(--r-2)", border: `1px solid ${live ? "rgba(95,165,106,.35)" : "var(--c-line-2)"}`, background: live ? "rgba(95,165,106,.06)" : "var(--c-bg)", padding: "12px 13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: live ? "var(--c-good)" : "var(--c-ink-4)", flexShrink: 0 }}/>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: live ? "var(--c-good)" : "var(--c-ink-4)" }}>{live ? "CONNECTED · LIVE" : "NOT CONNECTED"}</span>
        </div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginTop: 8 }}>
          {live ? <>This section pulls <b style={{ color: "var(--c-ink)" }}>{count} {noun}{count === 1 ? "" : "s"}</b> live from your {title}. Edits there update the site automatically — no copy to maintain here.</> : (empty || `Nothing published in your ${title} yet. Add ${noun}s and they appear here automatically.`)}
        </div>
        {manageHref && <a href={manageHref} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: c, textDecoration: "none", fontWeight: 700 }}>{manageLabel} →</a>}
      </div>
      {children}
    </div>
  );
}

// Editable list of label/href links (footer social + contact).
function LinkListI3({ items = [], onChange, addLabel }) {
  const upd = (i, patch) => { const n = items.slice(); n[i] = { ...n[i], ...patch }; onChange(n); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={it.label || ""} placeholder="Label" onChange={e => upd(i, { label: e.target.value })} style={{ ...inpI3, flex: 1 }}/>
          <input value={it.href || ""} placeholder="URL / @handle" onChange={e => upd(i, { href: e.target.value })} style={{ ...inpI3, flex: 1 }}/>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ ...smBtnI3, padding: "6px 9px", color: "var(--c-blood-l)", borderColor: "var(--c-blood)" }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { label: "Link", href: "#" }])} style={{ padding: "8px 12px", background: "transparent", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer" }}>+ {addLabel}</button>
    </div>
  );
}

// Collapsible group — keeps the inspector scannable; advanced groups fold away.
function GroupI3({ title, children, defaultOpen = true, accent, flat }) {
  const [open, setOpen] = usI3(defaultOpen);
  if (flat) return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>;
  return (
    <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 12px",
        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <span className="t-mono" style={{ flex: 1, fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{title}</span>
        <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
      </button>
      {open && <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>}
    </div>
  );
}

// RESTYLE row — surfaces the same per-block presets as the Add picker, so a
// section can be re-skinned in place without deleting + re-adding it.
function RestyleRowI3({ section, onChange, onChangeMeta }) {
  const variants = (window.variantsForV3 ? window.variantsForV3(section.type) : []) || [];
  if (variants.length <= 1) return null;
  const apply = (v) => { onChangeMeta(v.metaPatch || {}); onChange(v.propsPatch || {}); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>RESTYLE · {variants.length} LOOKS</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {variants.map(v => (
          <button key={v.id} onClick={() => apply(v)} title={v.desc} style={{
            padding: "7px 10px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
            cursor: "pointer", color: "var(--c-ink-2)", display: "flex", alignItems: "center", gap: 7, maxWidth: "100%",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.background = "rgba(var(--accent-rgb),.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.background = "var(--c-bg)"; }}>
            <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, whiteSpace: "nowrap" }}>{v.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── The inspector ────────────────────────────────────────────────────────
function SectionInspectorV3({ section, onChange, onChangeMeta, onMove, onRemove, onDuplicate, onSaveTemplate, previewMode }) {
  const meta = (window.BLOCK_LIBRARY_V2 || []).find(b => b.type === section.type);
  const p = section.props || {};
  const bp = previewMode === "phone" ? "Mobile" : previewMode === "tablet" ? "Tablet" : "";
  const set = onChange;

  const heroLike = ["hero", "hero-parallax", "hero-split", "hero-video"].includes(section.type);

  const [i3Tab, setI3Tab] = usI3("content");
  React.useEffect(() => { setI3Tab("content"); }, [section.id]);
  const i3Tabs = [["content", "Content"], ...(section.type !== "spacer" && section.type !== "footer" ? [["layout", "Layout"]] : []), ...(section.type !== "spacer" ? [["type", "Type"]] : []), ["display", "Display"]];

  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Header — live preview thumb + restyle ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 96, flexShrink: 0 }}>
            {window.BlockThumb ? React.createElement(window.BlockThumb, { type: section.type, accent: tkc("amber") }) : null}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SECTION</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500, marginTop: 3, lineHeight: 1.05 }}>{meta?.name}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.4 }}>{meta?.desc}</div>
          </div>
        </div>
        <RestyleRowI3 section={section} onChange={onChange} onChangeMeta={onChangeMeta}/>
      </div>

      <CinaTabs tabs={i3Tabs} value={i3Tab} onChange={setI3Tab} style={{ margin: "0 -18px", padding: "0 10px" }}/>

      {/* ── Section settings — title, menu, layout ── */}
      {i3Tab === "layout" && section.type !== "spacer" && section.type !== "footer" && (
        <GroupI3 flat title="SECTION SETTINGS" defaultOpen={true}>
          <FieldI3 label="SECTION TITLE" hint="Names this section — used as its menu label.">
            <input value={section.title || ""} placeholder={meta?.name || section.type}
              onChange={e => onChangeMeta({ title: e.target.value })} style={inpI3}/>
          </FieldI3>
          <TogI3 label="Show in site menu" value={!!section.inMenu} onChange={v => onChangeMeta({ inMenu: v })}/>
          <SelI3 label="Width" value={section.width || "container"} onChange={v => onChangeMeta({ width: v })}
            options={[["container", "Container · reading column"], ["wide", "Wide · 1480px"], ["full", "Full width · edge to edge"]]}/>
          <SelI3 label="Padding" value={section.pad || "normal"} onChange={v => onChangeMeta({ pad: v })}
            options={[["none", "None · flush"], ["compact", "Compact"], ["normal", "Normal"], ["spacious", "Spacious"]]}/>
          <SelI3 label="Margin (gap to next)" value={section.margin || "none"} onChange={v => onChangeMeta({ margin: v })}
            options={[["none", "None"], ["sm", "Small"], ["md", "Medium"], ["lg", "Large"]]}/>
        </GroupI3>
      )}

      {/* ── Typography — per-section font size / style / family ── */}
      {i3Tab === "type" && section.type !== "spacer" && (
        <GroupI3 flat title="TYPOGRAPHY" defaultOpen={false}>
          <SlI3 label="Heading size" min={50} max={180} step={5}
            value={(p._typo || {}).scalePct || 100}
            onChange={v => set({ _typo: { ...(p._typo || {}), scalePct: v } })}
            fmt={v => v + "%"}/>
          <SlI3 label="Body text size" min={70} max={160} step={5}
            value={(p._typo || {}).bodyPct || 100}
            onChange={v => set({ _typo: { ...(p._typo || {}), bodyPct: v } })}
            fmt={v => v + "%"}/>
          <SelI3 label="Font family" value={(p._typo || {}).headline || "inherit"}
            onChange={v => set({ _typo: { ...(p._typo || {}), headline: v === "inherit" ? null : v } })}
            options={[["inherit", "Theme default"], ["display", "Display · serif"], ["sans", "Sans"], ["mono", "Mono"]]}/>
          <SelI3 label="Weight" value={String((p._typo || {}).weight || "inherit")}
            onChange={v => set({ _typo: { ...(p._typo || {}), weight: v === "inherit" ? null : parseInt(v, 10) } })}
            options={[["inherit", "Default"], ["300", "Light"], ["400", "Regular"], ["500", "Medium"], ["600", "Semibold"], ["700", "Bold"]]}/>
          <SelI3 label="Style" value={(p._typo || {}).italic == null ? "inherit" : (p._typo || {}).italic ? "italic" : "normal"}
            onChange={v => set({ _typo: { ...(p._typo || {}), italic: v === "inherit" ? null : v === "italic" } })}
            options={[["inherit", "Default"], ["normal", "Upright"], ["italic", "Italic"]]}/>
          <SlI3 label="Letter spacing" min={-5} max={12} step={1}
            value={Math.round((((p._typo || {}).letter) ?? 0) * 100)}
            onChange={v => set({ _typo: { ...(p._typo || {}), letter: v / 100 } })}
            fmt={v => (v / 100).toFixed(2) + "em"}/>
          {p._typo && (
            <button onClick={() => set({ _typo: null })} style={{ padding: "7px 10px", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer", textTransform: "uppercase" }}>Reset type to theme</button>
          )}
        </GroupI3>
      )}

      {/* ── Shared display options ── */}
      {i3Tab === "display" && <GroupI3 flat title="DISPLAY" defaultOpen={false}>
        <SelI3 label="Animate in" value={section.animate || "fade-up"} onChange={v => onChangeMeta({ animate: v })}
          options={[["none", "None"], ["fade-in", "Fade in"], ["fade-up", "Fade up"], ["fade-down", "Fade down"], ["slide-left", "Slide left"], ["slide-right", "Slide right"], ["zoom", "Zoom in"], ["blur", "Blur reveal"]]}/>
        {section.type !== "spacer" && section.type !== "footer" && (
          <SelI3 label="Background" value={p._bgTone || "none"} onChange={v => set({ _bgTone: v === "none" ? null : v })}
            options={[["none", "Page background"], ["wash", "Accent wash"], ["panel", "Raised panel"], ["deep", "Deep / darker"]]}/>
        )}
        {section.type !== "spacer" && section.type !== "footer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>BACKGROUND MEDIA</div>
            {(p._bgImageSrc || p._bgVideoSrc) ? (
              <div style={{ position: "relative", borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line-2)" }}>
                {p._bgVideoSrc
                  ? <video src={p._bgVideoSrc} muted loop autoPlay playsInline style={{ width: "100%", display: "block", maxHeight: 110, objectFit: "cover" }}/>
                  : <img src={p._bgImageSrc} alt="" style={{ width: "100%", display: "block", maxHeight: 110, objectFit: "cover" }}/>}
                <button onClick={() => set({ _bgImageSrc: null, _bgVideoSrc: null })} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "var(--r-2)", background: "rgba(0,0,0,.7)", border: "1px solid var(--c-line-2)", color: tkc("white"), cursor: "pointer" }}>✕</button>
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => window.openMediaLibrary && window.openMediaLibrary({ type: "image", onPick: (src) => set({ _bgImageSrc: src, _bgVideoSrc: null }) })} style={{ flex: 1, padding: "8px", background: "var(--c-bg)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer", color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700 }}>▣ IMAGE</button>
              <button onClick={() => window.openMediaLibrary && window.openMediaLibrary({ type: "video", onPick: (src) => set({ _bgVideoSrc: src, _bgImageSrc: null }) })} style={{ flex: 1, padding: "8px", background: "var(--c-bg)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer", color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700 }}>▶ VIDEO</button>
            </div>
            {(p._bgImageSrc || p._bgVideoSrc) && (
              <SlI3 label="Overlay darkness" min={0} max={0.95} step={0.05} value={p._bgOverlay ?? 0.55} onChange={v => set({ _bgOverlay: v })} fmt={v => Math.round(v * 100) + "%"}/>
            )}
          </div>
        )}
      </GroupI3>}

      {i3Tab === "content" && <>
      {/* ── Per-type content ── */}
      {heroLike && (
        <>
          <FieldI3 label="KICKER"><input value={p.kicker || ""} onChange={e => set({ kicker: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="TITLE"><input value={p.title || ""} onChange={e => set({ title: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="SUBTITLE"><textarea value={p.sub || ""} onChange={e => set({ sub: e.target.value })} rows={3} style={{ ...inpI3, resize: "vertical" }}></textarea></FieldI3>
        </>
      )}
      {(section.type === "hero-parallax" || section.type === "hero-split") && (
        <>
        <FieldI3 label="BACKGROUND IMAGE">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
            {Object.keys(window.BG_IMAGES || {}).map(k => (
              <button key={k} onClick={() => set({ bgImage: k })} title={window.BG_IMAGES[k].blurb} style={{
                aspectRatio: "1/1", padding: 0,
                background: `linear-gradient(135deg, ${window.BG_IMAGES[k].tint}88, ${tkc("black")})`,
                border: `1.5px solid ${p.bgImage === k ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-1)", cursor: "pointer",
              }}></button>
            ))}
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 6, letterSpacing: ".08em" }}>{(window.BG_IMAGES || {})[p.bgImage]?.blurb}</div>
        </FieldI3>
        <ImgUpI3 label="OR UPLOAD YOUR OWN" value={p.bgSrc} onChange={v => set({ bgSrc: v })}/>
        <button onClick={() => window.openMediaLibrary && window.openMediaLibrary({ type: "image", onPick: (src) => set({ bgSrc: src }) })} style={mlPickBtnI3}>▣ Browse media library →</button>
        </>
      )}
      {section.type === "hero-parallax" && (
        <>
          <SlI3 label="Overlay opacity" min={0} max={0.9} step={0.05} value={p.overlay ?? 0.55} onChange={v => set({ overlay: v })} fmt={v => Math.round(v * 100) + "%"}/>
          <SlI3 label="Parallax strength" min={0} max={0.9} step={0.05} value={p.parallax ?? 0.4} onChange={v => set({ parallax: v })} fmt={v => v.toFixed(2)}/>
          <FieldI3 label="CTA BUTTON" hint="Label + where it links. Use #section-id for on-page, or a full URL.">
            <input value={p.cta?.label || ""} placeholder="Button label — empty hides it"
              onChange={e => set({ cta: e.target.value ? { ...(p.cta || {}), label: e.target.value, href: p.cta?.href || "#films" } : null })} style={inpI3}/>
            {p.cta?.label && (
              <input value={p.cta?.href || ""} placeholder="#films  or  https://…"
                onChange={e => set({ cta: { ...(p.cta || {}), href: e.target.value } })} style={{ ...inpI3, marginTop: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}/>
            )}
          </FieldI3>
        </>
      )}
      {section.type === "hero-video" && (
        <FieldI3 label="BACKGROUND FILM"><FilmPickI3 value={p.filmId} onChange={v => set({ filmId: v })}/></FieldI3>
      )}

      {section.type === "marquee" && (
        <>
          <FieldI3 label="MARQUEE TEXT"><textarea value={p.text || ""} onChange={e => set({ text: e.target.value })} rows={2} style={{ ...inpI3, resize: "vertical" }}></textarea></FieldI3>
          <SlI3 label="Loop speed" min={8} max={50} step={1} value={p.speed || 22} onChange={v => set({ speed: v })} fmt={v => v + "s"}/>
        </>
      )}

      {section.type === "about" && (
        <FieldI3 label="TEXT"><textarea value={p.text || ""} onChange={e => set({ text: e.target.value })} rows={6} style={{ ...inpI3, resize: "vertical" }}></textarea></FieldI3>
      )}

      {section.type === "press" && (
        <FieldI3 label="QUOTES">
          <ListEditorI3 items={p.quotes || []} onChange={v => set({ quotes: v })} addLabel="Add quote"
            fields={[{ key: "text", ph: "Quote", long: true }, { key: "source", ph: "Source — e.g. Sight & Sound" }]}
            makeNew={() => ({ source: "Source", text: "Quote." })}/>
        </FieldI3>
      )}

      {section.type === "stats" && (
        <FieldI3 label="STATS">
          <ListEditorI3 items={p.stats || []} onChange={v => set({ stats: v })} addLabel="Add stat"
            fields={[{ key: "v", ph: "Value — e.g. 6 or 84k" }, { key: "k", ph: "Label — e.g. Films" }]}
            makeNew={() => ({ k: "Stat", v: "0" })}/>
        </FieldI3>
      )}

      {section.type === "timeline" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="MILESTONES">
            <ListEditorI3 items={p.items || []} onChange={v => set({ items: v })} addLabel="Add milestone"
              fields={[{ key: "year", ph: "Year" }, { key: "title", ph: "Title" }, { key: "sub", ph: "One-line detail" }]}
              makeNew={() => ({ year: "2026", title: "Milestone", sub: "" })}/>
          </FieldI3>
        </>
      )}

      {section.type === "featured" && (
        <>
          <FieldI3 label="FEATURED FILM"><FilmPickI3 value={p.filmId} onChange={v => set({ filmId: v })}/></FieldI3>
          <FieldI3 label="CTA LABEL"><input value={p.ctaLabel || "Watch the film"} onChange={e => set({ ctaLabel: e.target.value })} style={inpI3}/></FieldI3>
        </>
      )}

      {section.type === "films" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} placeholder="Films" onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <SelI3 label="Card style" value={p.layout || "poster"} onChange={v => set({ layout: v })}
            options={[["poster", "Poster · caption below"], ["overlay", "Poster · title on image"], ["list", "Filmography list"]]}/>
          <SlI3 label="Max films" min={3} max={12} step={1} value={p.count || 6} onChange={v => set({ count: v })} fmt={v => v + ""}/>
        </>
      )}

      {section.type === "gallery" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="SOURCE FILM"><FilmPickI3 value={p.filmId} onChange={v => set({ filmId: v })}/></FieldI3>
          <SlI3 label="Frames" min={4} max={12} step={1} value={p.count || 8} onChange={v => set({ count: v })} fmt={v => v + ""}/>
        </>
      )}

      {(section.type === "branched-shelf" || section.type === "episodes-shelf" || section.type === "trailers-shelf") && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <SlI3 label="Max items" min={2} max={6} step={1} value={p.count || (section.type === "trailers-shelf" ? 4 : 3)} onChange={v => set({ count: v })} fmt={v => v + ""}/>
        </>
      )}

      {section.type === "actor-vault" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="SUBLINE"><input value={p.subline || ""} onChange={e => set({ subline: e.target.value })} style={inpI3}/></FieldI3>
        </>
      )}

      {section.type === "upcoming" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="DATES">
            <ListEditorI3 items={p.items || []} onChange={v => set({ items: v })} addLabel="Add date"
              fields={[{ key: "date", ph: "JUN 14" }, { key: "time", ph: "9:00 PM ET" }, { key: "title", ph: "Title" }, { key: "sub", ph: "One-line detail" }, { key: "cta", ph: "Button — e.g. Remind me" }]}
              makeNew={() => ({ date: "TBA", time: "", title: "New date", sub: "", cta: "Remind me" })}/>
          </FieldI3>
        </>
      )}

      {section.type === "news" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <DynamicSourceI3 tone="good" title="Notebook" noun="post" count={nbLivePosts().length} manageHref={null} manageLabel="Open the Notebook">
            <SlI3 label="Show at most" min={2} max={8} step={1} value={p.limit || 4} onChange={v => set({ limit: v })} fmt={v => v + " posts"}/>
            <SelI3 label="Order" value={p.sort || "recent"} onChange={v => set({ sort: v })} options={[["recent", "Newest first"], ["oldest", "Oldest first"]]}/>
          </DynamicSourceI3>
        </>
      )}

      {section.type === "holders" && (
        <FieldI3 label="HEADLINE" hint="Tier pricing is pulled from your live producer offering.">
          <input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/>
        </FieldI3>
      )}

      {section.type === "newsletter" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="SUB"><textarea value={p.sub || ""} onChange={e => set({ sub: e.target.value })} rows={2} style={{ ...inpI3, resize: "vertical" }}></textarea></FieldI3>
        </>
      )}

      {section.type === "contact" && (
        <>
          <FieldI3 label="EMAIL"><input value={p.email || ""} onChange={e => set({ email: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="AGENT"><input value={p.agent || ""} placeholder="optional" onChange={e => set({ agent: e.target.value })} style={inpI3}/></FieldI3>
          <TogI3 label="Show contact form" value={!!p.formEnabled} onChange={v => set({ formEnabled: v })}/>
          {p.formEnabled && (
            <>
              <FieldI3 label="FORM HEADLINE"><input value={p.formHeadline || ""} onChange={e => set({ formHeadline: e.target.value })} style={inpI3}/></FieldI3>
              <FieldI3 label="FORM SUBLINE"><input value={p.formSubline || ""} onChange={e => set({ formSubline: e.target.value })} style={inpI3}/></FieldI3>
            </>
          )}
        </>
      )}

      {section.type === "store" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <DynamicSourceI3 tone="good" title="Store" noun="product" count={storeLiveProducts().length} manageHref={null} manageLabel="Manage products in the Store" empty="No active products yet. Add them in the Store and set them Active — they flow in here automatically.">
            <SelI3 label="Layout" value={p.layout || "grid"} onChange={v => set({ layout: v })} options={[["grid", "3-up grid · large"], ["row", "4-up row · compact"]]}/>
            <SlI3 label="Show at most" min={2} max={12} step={1} value={p.limit || 6} onChange={v => set({ limit: v })} fmt={v => v + " items"}/>
            <TogI3 label="Show price" value={p.showPrice !== false} onChange={v => set({ showPrice: v })}/>
          </DynamicSourceI3>
        </>
      )}

      {section.type === "shop-nft" && (
        <FieldI3 label="HEADLINE" hint="Drops mirror your live producer tiers.">
          <input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/>
        </FieldI3>
      )}

      {section.type === "blog" && (
        <>
          <FieldI3 label="HEADLINE"><input value={p.headline || ""} onChange={e => set({ headline: e.target.value })} style={inpI3}/></FieldI3>
          <DynamicSourceI3 tone="good" title="Notebook" noun="post" count={nbLivePosts().length} manageHref={null} manageLabel="Open the Notebook" empty="Nothing published yet. Write a post in the Notebook and hit Publish — it appears here and links to the live article.">
            <SlI3 label="Show at most" min={2} max={8} step={1} value={p.limit || 4} onChange={v => set({ limit: v })} fmt={v => v + " posts"}/>
            <SelI3 label="Order" value={p.sort || "recent"} onChange={v => set({ sort: v })} options={[["recent", "Newest first"], ["oldest", "Oldest first"]]}/>
          </DynamicSourceI3>
        </>
      )}

      {section.type === "spacer" && (
        <SlI3 label="Height" min={20} max={240} step={4} value={p.size || 80} onChange={v => set({ size: v })} fmt={v => v + "px"}/>
      )}

      {section.type === "footer" && (
        <>
          <FieldI3 label="LAYOUT">
            <SelI3 value={p.preset || (window.WB_PAGE_FOOTER_DEFAULT || "stacked-mono")} onChange={v => set({ preset: v })}
              options={[["stacked-mono", "Stacked · columns"], ["directory", "Directory · 4-up"], ["single-line", "Single line"], ["big-cta", "Big CTA · newsletter"], ["manifesto", "Manifesto"], ["marquee-tail", "Marquee tail"]]}/>
          </FieldI3>
          <FieldI3 label="TAGLINE" hint="Shown under the studio name on directory / stacked layouts.">
            <textarea value={p.tagline || ""} onChange={e => set({ tagline: e.target.value })} rows={2} placeholder="An independent studio making slow films." style={{ ...inpI3, resize: "vertical" }}></textarea>
          </FieldI3>
          <FieldI3 label="FOLLOW LINKS">
            <LinkListI3 items={p.socials || [{ label: "Instagram", href: "#" }, { label: "X", href: "#" }, { label: "RSS", href: "#" }]} onChange={v => set({ socials: v })} addLabel="Add social"/>
          </FieldI3>
          <FieldI3 label="CONTACT LINKS">
            <LinkListI3 items={p.contacts || [{ label: "Studio mail", href: "#" }, { label: "Agent · WME", href: "#" }]} onChange={v => set({ contacts: v })} addLabel="Add contact"/>
          </FieldI3>
          <FieldI3 label="COPYRIGHT">
            <input value={p.copyright || ""} onChange={e => set({ copyright: e.target.value })} placeholder="© 2026 · All rights reserved" style={inpI3}/>
          </FieldI3>
          <TogI3 label="Show ‘Built with Cina’ badge" value={p.showBadge !== false} onChange={v => set({ showBadge: v })}/>
        </>
      )}

      {section.type === "image" && (
        <>
          <FieldI3 label="STILL FROM YOUR CATALOG"><FilmPickI3 value={p.filmId} onChange={v => set({ filmId: v, src: null })}/></FieldI3>
          <ImgUpI3 label="OR UPLOAD AN IMAGE" value={p.src} onChange={v => set({ src: v })}/>
          <button onClick={() => window.openMediaLibrary && window.openMediaLibrary({ type: "image", onPick: (src) => set({ src }) })} style={mlPickBtnI3}>▣ Browse media library · edit →</button>
          <SelI3 label="Aspect" value={p.aspect || "21/9"} onChange={v => set({ aspect: v })}
            options={[["21/9", "Cinema · 21:9"], ["16/9", "Wide · 16:9"], ["4/3", "Classic · 4:3"], ["1/1", "Square"]]}/>
          {(() => {
            const key = "size" + bp;
            const val = p[key] != null ? p[key] : (bp ? (p.size != null ? p.size : 100) : (p.size != null ? p.size : 100));
            const over = bp && p[key] != null;
            return (
              <FieldI3 label={`IMAGE SIZE${bp ? " · " + bp.toUpperCase() : ""}`} hint={bp ? (over ? `Custom ${bp.toLowerCase()} width.` : `Inheriting desktop — drag to override for ${bp.toLowerCase()}.`) : "Width of the image within its section."}>
                <SlI3 label="Width" min={30} max={100} step={5} value={val} onChange={v => set({ [key]: v })} fmt={(v) => v + "%"}/>
                {over && <button onClick={() => set({ [key]: null })} style={{ marginTop: 6, background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "4px 8px", cursor: "pointer" }}>RESET TO DESKTOP</button>}
              </FieldI3>
            );
          })()}
          <FieldI3 label="CAPTION"><input value={p.caption || ""} onChange={e => set({ caption: e.target.value })} style={inpI3}/></FieldI3>
        </>
      )}

      {section.type === "video" && (
        <>
          {p.src && (
            <div style={{ position: "relative", borderRadius: "var(--r-2)", overflow: "hidden", border: "1px solid var(--c-line-2)" }}>
              <video src={p.src} muted loop autoPlay playsInline style={{ width: "100%", display: "block", maxHeight: 130, objectFit: "cover" }}/>
              <button onClick={() => set({ src: null })} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "var(--r-2)", background: "rgba(0,0,0,.7)", border: "1px solid var(--c-line-2)", color: tkc("white"), cursor: "pointer" }}>✕</button>
            </div>
          )}
          <button onClick={() => window.openMediaLibrary && window.openMediaLibrary({ type: "video", onPick: (src) => set({ src }) })} style={mlPickBtnI3}>▶ {p.src ? "Replace" : "Upload / choose"} video →</button>
          <FieldI3 label="OR CLIP FROM YOUR CATALOG"><FilmPickI3 value={p.filmId} onChange={v => set({ filmId: v })}/></FieldI3>
          <FieldI3 label="DURATION BADGE"><input value={p.duration || ""} placeholder="2:31" onChange={e => set({ duration: e.target.value })} style={inpI3}/></FieldI3>
          <FieldI3 label="CAPTION"><input value={p.caption || ""} onChange={e => set({ caption: e.target.value })} style={inpI3}/></FieldI3>
        </>
      )}

      </>}

      {/* ── Actions ── */}
      <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => onMove(-1)} style={smBtnI3}>↑ Up</button>
        <button onClick={() => onMove(1)} style={smBtnI3}>↓ Down</button>
        {onDuplicate && <button onClick={onDuplicate} style={smBtnI3}>⧉ Duplicate</button>}
        {onSaveTemplate && <button onClick={onSaveTemplate} title="Save this configured section to reuse on any page" style={{ ...smBtnI3, color: "var(--c-amber)", borderColor: "rgba(var(--accent-rgb),.4)" }}>★ Save as template</button>}
        <span style={{ flex: 1 }}></span>
        <button onClick={onRemove} style={{ ...smBtnI3, color: "var(--c-blood-l)", borderColor: "var(--c-blood)" }}>Delete</button>
      </div>
    </div>
  );
}

Object.assign(window, { SectionInspectorV3 });

// ─── Image upload control — FileReader → data URL ──────────────────────
function ImgUpI3({ label, value, onChange }) {
  const ref = React.useRef(null);
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => onChange(r.result);
    r.readAsDataURL(f);
  };
  return (
    <FieldI3 label={label}>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onFile}/>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={() => ref.current && ref.current.click()} style={{
          flex: 1, padding: "10px", background: "var(--c-bg)",
          border: "1.5px dashed var(--c-line-2)", borderRadius: "var(--r-2)", cursor: "pointer",
          color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
        }}>{value ? "↻ REPLACE IMAGE" : "↑ UPLOAD IMAGE"}</button>
        {value && <button onClick={() => onChange(null)} style={{
          padding: "10px 12px", background: "transparent", border: "1px solid var(--c-line-2)",
          borderRadius: "var(--r-2)", cursor: "pointer", color: "var(--c-ink-3)", fontSize: "var(--fs-label)",
        }}>✕</button>}
      </div>
      {value && <img src={value} alt="" style={{ marginTop: 8, width: "100%", borderRadius: "var(--r-2)", border: "1px solid var(--c-line)" }}/>}
    </FieldI3>
  );
}
