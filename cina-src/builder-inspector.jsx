// builder-inspector.jsx — Studio Builder theme inspector and legacy section inspector.

const { useState: usbIn, useEffect: uebIn } = React;
// ─── Theme inspector ────────────────────────────────────────────────────

function ThemeInspectorV2({ page, onUpdate, onTheme, onHeader, onFooter, onOpenLogoStudio, previewMode }) {
  const t = page.theme;
  // Which device the Type scale / Spacing sliders edit. Follows the canvas
  // preview device by default, but can be switched independently.
  const [layoutBP, setLayoutBP] = usbIn(previewMode === "phone" ? "mobile" : previewMode === "tablet" ? "tablet" : "desktop");
  uebIn(() => { setLayoutBP(previewMode === "phone" ? "mobile" : previewMode === "tablet" ? "tablet" : "desktop"); }, [previewMode]);
  const bpKey = layoutBP === "mobile" ? "Mobile" : layoutBP === "tablet" ? "Tablet" : "";
  const fsKey = "fontScale" + bpKey, spKey = "spacing" + bpKey;
  const fsVal = t[fsKey] != null ? t[fsKey] : (bpKey ? (t.fontScale || 1) : (t.fontScale || 1));
  const spVal = t[spKey] != null ? t[spKey] : (bpKey ? (t.spacing || 1) : (t.spacing || 1));
  const bpOverridden = bpKey && (t[fsKey] != null || t[spKey] != null);
  const PRESETS = [
    { name: "Darkroom", ...CINA_TOKENS.SITE.themes.darkroom },
    { name: "Atlas", ...CINA_TOKENS.SITE.themes.atlas },
    { name: "Kitchen", ...CINA_TOKENS.SITE.themes.kitchen },
    { name: "Plains", ...CINA_TOKENS.SITE.themes.plains },
    { name: "Tape", ...CINA_TOKENS.SITE.themes.tape },
    { name: "Basement", ...CINA_TOKENS.SITE.themes.basement },
  ];

  // One group at a time, picked from tabs.
  const [tab, setTab] = usbIn("identity");
  const grp = (id) => ({ tabbed: true, open: tab === id });
  const TABS = [["identity", "Identity"], ["appearance", "Appearance"], ["layout", "Layout"], ["chrome", "Header & footer"], ["seo", "SEO"], ["plan", "Plan"]];

  return (
    <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column" }}>
      <div style={{ paddingBottom: 16 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>STUDIO</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, marginTop: 4 }}>Theme &amp; identity</div>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 4, lineHeight: 1.5 }}>Everything sitewide lives here. Section content is edited on the canvas.</div>
      </div>
      <CinaTabs tabs={TABS} value={tab} onChange={setTab} style={{ margin: "0 -16px", padding: "0 8px" }}/>

      <InsGroup label="Identity" {...grp("identity")}>

      <FieldV2 label="STUDIO NAME">
        <input value={page.studioName} onChange={e => onUpdate({ studioName: e.target.value })} style={inpV2}/>
      </FieldV2>

      <FieldV2 label="DOMAIN">
        <div style={{ display: "flex", minWidth: 0 }}>
          <input value={page.domain.replace(".cina", "")} disabled={wbTier(page).customDomain === false} onChange={e => onUpdate({ domain: e.target.value.replace(/\s/g, "").toLowerCase() + ".cina" })} style={{ ...inpV2, flex: 1, minWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, opacity: wbTier(page).customDomain === false ? 0.6 : 1 }}/>
          <span style={{
            padding: "8px 10px",
            background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderLeft: "none",
            color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            borderTopRightRadius: 4, borderBottomRightRadius: 4, flexShrink: 0, display: "flex", alignItems: "center",
          }}>.cina</span>
        </div>
        {page.tier === "free"
          ? <div style={{ marginTop: 8, marginBottom: 6, fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", letterSpacing: ".08em", display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "4px 12px", lineHeight: 1.4 }}>
              <span>Custom domains are on Pro</span>
              <button onClick={() => onUpdate({ tier: "pro" })} style={{ background: "transparent", border: "none", color: "var(--c-amber)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>Upgrade to Pro</button>
            </div>
          : <div style={{ marginTop: 8, marginBottom: 6, fontSize: "var(--fs-label)", color: "var(--c-good)", fontFamily: "var(--f-mono)", letterSpacing: ".08em", lineHeight: 1.4 }}>
              ✓ {page.tier === "enterprise" ? "Custom apex enabled (yourdomain.com)" : "Custom subdomain enabled"}
            </div>}
      </FieldV2>

      {wbTier(page).customDomain && <DomainConnectV2 page={page} onUpdate={onUpdate}/>}

      <FieldV2 label="LOGO">
        <div style={{
          padding: 12, background: "var(--c-bg)",
          border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: page.logo?.kind === "monogram" ? "50%" : 4,
            background: page.logo?.src
              ? `url(${page.logo.src}) center/contain no-repeat`
              : `linear-gradient(135deg, ${t.accent}, ${t.accent}55)`,
            color: "var(--c-void)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 600,
            flexShrink: 0,
          }}>{!page.logo?.src && (page.logo?.text || page.studioName)[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{page.logo?.kind === "image" ? "Custom image" : page.logo?.kind === "monogram" ? "Monogram" : "Wordmark"}</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", letterSpacing: ".08em" }}>{page.logo?.text || page.studioName}</div>
          </div>
          <button onClick={onOpenLogoStudio} style={{
            padding: "8px 13px", background: "var(--c-amber)", color: "var(--c-on-amber)",
            border: "none", borderRadius: "var(--r-1)", cursor: "pointer", flexShrink: 0,
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, whiteSpace: "nowrap",
          }}>EDIT</button>
        </div>
      </FieldV2>

      </InsGroup>

      <InsGroup label="Sharing & SEO" {...grp("seo")}>

      <FieldV2 label="LINK PREVIEW · TITLE, DESCRIPTION, IMAGE">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={page.seo?.title || ""} placeholder={`${page.studioName} — films & notes`} onChange={e => onUpdate({ seo: { ...page.seo, title: e.target.value } })} style={inpV2}/>
          <textarea value={page.seo?.description || ""} placeholder="One sentence for search results and link unfurls." rows={2} onChange={e => onUpdate({ seo: { ...page.seo, description: e.target.value } })} style={{ ...inpV2, resize: "vertical", fontFamily: "var(--f-sans)", lineHeight: 1.5 }}></textarea>
          <div style={{ border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-bg)" }}>
            <div style={{ aspectRatio: "1200/630", background: page.seo?.ogImage ? `url(${page.seo.ogImage}) center/cover` : `linear-gradient(135deg, ${t.accent}, ${t.bg} 85%)`, display: "flex", alignItems: "flex-end", padding: 10 }}>
              {!page.seo?.ogImage && <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: t.ink }}>{page.studioName}</span>}
            </div>
            <div style={{ padding: "8px 10px", borderTop: "1px solid var(--c-line-2)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", textTransform: "uppercase" }}>{page.domain}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 2 }}>{page.seo?.title || `${page.studioName} — films & notes`}</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.4 }}>{page.seo?.description || "How this link looks when shared — write a description above."}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => window.openMediaLibrary && window.openMediaLibrary({ type: "image", onPick: (src) => onUpdate({ seo: { ...page.seo, ogImage: src } }) })} style={{ flex: 1, padding: "8px 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>{page.seo?.ogImage ? "CHANGE SHARE IMAGE" : "ADD SHARE IMAGE"}</button>
            {page.seo?.ogImage && <button onClick={() => onUpdate({ seo: { ...page.seo, ogImage: null } })} title="Remove share image" style={{ padding: "8px 10px", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)" }}>✕</button>}
          </div>
        </div>
      </FieldV2>

      </InsGroup>

      <InsGroup label="Plan extras" badge={page.tier === "free" ? "UPGRADE" : page.tier.toUpperCase()} {...grp("plan")}>

      <FieldV2 label="UNLOCKED BY PLAN">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Pro · analytics */}
          <div style={{ padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)" }}>ANALYTICS</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-1)", padding: "1px 4px" }}>PRO</span>
            </div>
            {(page.tier === "pro" || page.tier === "enterprise") ? (
              <input value={page.analyticsId || ""} placeholder="Measurement ID · G-XXXXXXX" onChange={e => onUpdate({ analyticsId: e.target.value })} style={inpV2}/>
            ) : (
              <button onClick={() => onUpdate({ _upsell: { reason: "analytics", at: Date.now() } })} style={{ width: "100%", padding: "9px 10px", background: "transparent", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase" }}>Upgrade to Pro to add analytics</button>
            )}
          </div>
          {/* Enterprise · custom CSS injection */}
          <div style={{ padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)" }}>CODE INJECTION · CSS</span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-1)", padding: "1px 4px" }}>ENTERPRISE</span>
            </div>
            {page.tier === "enterprise" ? (
              <textarea value={page.customCss || ""} rows={4} placeholder={"/* Applied to your live site */\nh1 { letter-spacing: -0.04em; }"} onChange={e => onUpdate({ customCss: e.target.value })} spellCheck={false} style={{ ...inpV2, resize: "vertical", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", lineHeight: 1.5 }}></textarea>
            ) : (
              <button onClick={() => onUpdate({ _upsell: { reason: "code-injection", at: Date.now() } })} style={{ width: "100%", padding: "9px 10px", background: "transparent", border: "1px dashed var(--c-line-3)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase" }}>Enterprise only — upgrade to inject code</button>
            )}
          </div>
        </div>
      </FieldV2>

      </InsGroup>

      <InsGroup label="Appearance" {...grp("appearance")}>

      <FieldV2 label="PRESET">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => onTheme({ bg: p.bg, ink: p.ink, accent: p.accent })} title={p.name} style={{
              padding: 10, background: p.bg, color: p.ink,
              border: `1px solid ${t.bg === p.bg ? p.accent : "var(--c-line-2)"}`,
              borderRadius: "var(--r-1)", cursor: "pointer", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.accent }}/>
              {p.name.toUpperCase()}
            </button>
          ))}
        </div>
      </FieldV2>

      <FieldV2 label="COLORS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          <ColorRow label="BG"     value={t.bg}     onChange={v => onTheme({ bg: v })}/>
          <ColorRow label="INK"    value={t.ink}    onChange={v => onTheme({ ink: v })}/>
          <ColorRow label="ACCENT" value={t.accent} onChange={v => onTheme({ accent: v })}/>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", margin: "12px 0 6px" }}>BACKGROUND SWATCHES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 5 }}>
          {WB_BG_SWATCHES.map(c => (
            <button key={c} onClick={() => onTheme({ bg: c })} title={c} style={{
              aspectRatio: "1", borderRadius: "var(--r-2)", cursor: "pointer", background: c,
              border: t.bg.toLowerCase() === c.toLowerCase() ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
            }}/>
          ))}
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", margin: "12px 0 6px" }}>ACCENT SWATCHES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 5 }}>
          {WB_ACCENT_SWATCHES.map(c => (
            <button key={c} onClick={() => onTheme({ accent: c })} title={c} style={{
              aspectRatio: "1", borderRadius: "var(--r-2)", cursor: "pointer", background: c,
              border: t.accent.toLowerCase() === c.toLowerCase() ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
            }}/>
          ))}
        </div>
      </FieldV2>

      <FieldV2 label="TYPOGRAPHY · PAIRINGS">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {WB_FONT_PAIRINGS.map(pr => {
            const locked = !pr.free && !wbTier(page).allFonts;
            const active = t.headlineFont === pr.headline && t.bodyFont === pr.body;
            return (
              <button key={pr.name} onClick={() => locked ? onUpdate({ _upsell: { reason: "fonts", at: Date.now() } }) : onTheme({ headlineFont: pr.headline, bodyFont: pr.body })}
                title={locked ? "Pro unlocks the full font library" : `${WB_FONTS[pr.headline].label} headlines · ${WB_FONTS[pr.body].label} body`} style={{
                padding: "9px 10px 7px", textAlign: "left", cursor: "pointer", borderRadius: "var(--r-2)", position: "relative",
                background: active ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
                border: `1px solid ${active ? "var(--c-amber)" : "var(--c-line-2)"}`,
                color: "var(--c-ink)", opacity: locked ? 0.6 : 1,
              }}>
                <span style={{ display: "block", fontFamily: locked ? "var(--f-display)" : wbFont(pr.headline), fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1 }}>Ag</span>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: active ? "var(--c-amber)" : "var(--c-ink-4)", marginTop: 5, textTransform: "uppercase" }}>{pr.name}</span>
                {locked && <span className="t-mono" style={{ position: "absolute", top: 6, right: 6, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-1)", padding: "1px 4px" }}>PRO</span>}
              </button>
            );
          })}
        </div>
        {!wbTier(page).allFonts && (
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 8, lineHeight: 1.5 }}>
            3 of {Object.keys(WB_FONTS).length} fonts on Free · <button onClick={() => onUpdate({ tier: "pro" })} style={{ background: "transparent", border: "none", color: "var(--c-amber)", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", padding: 0, textDecoration: "underline" }}>Pro unlocks the library</button>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <SelectV2 label="Headlines" value={t.headlineFont} onChange={v => onTheme({ headlineFont: v })} options={Object.entries(WB_FONTS).filter(([k, f]) => f.free || wbTier(page).allFonts).map(([k, f]) => [k, f.label])}/>
          <SelectV2 label="Body"      value={t.bodyFont}     onChange={v => onTheme({ bodyFont: v })}     options={Object.entries(WB_FONTS).filter(([k, f]) => f.free || wbTier(page).allFonts).map(([k, f]) => [k, f.label])}/>
        </div>
      </FieldV2>

      </InsGroup>

      <InsGroup label="Layout & type" {...grp("layout")}>

      <FieldV2 label="EDITING FOR DEVICE">
        <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", marginBottom: 12 }}>
          {[["desktop", "Desktop"], ["tablet", "Tablet"], ["mobile", "Mobile"]].map(([id, l]) => (
            <button key={id} onClick={() => setLayoutBP(id)} style={{
              flex: 1, height: 28, borderRadius: "var(--r-2)", cursor: "pointer", border: "none",
              background: layoutBP === id ? "var(--c-amber)" : "transparent",
              color: layoutBP === id ? tkc("on-amber") : "var(--c-ink-3)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 600, textTransform: "uppercase",
            }}>{l}</button>
          ))}
        </div>
        <div style={{ fontSize: "var(--fs-label)", color: bpOverridden ? "var(--c-amber)" : "var(--c-ink-4)", lineHeight: 1.4, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{layoutBP === "desktop" ? "Base type & rhythm for all devices." : bpOverridden ? `Custom ${layoutBP} type & rhythm.` : `Inheriting desktop — edit to override for ${layoutBP}.`}</span>
          {bpOverridden && <button onClick={() => onTheme({ [fsKey]: null, [spKey]: null })} style={{ marginLeft: "auto", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "3px 7px", cursor: "pointer", whiteSpace: "nowrap" }}>RESET</button>}
        </div>
        <SliderV2 label="Type scale" min={0.6} max={1.6} step={0.05} value={fsVal} onChange={v => onTheme({ [fsKey]: v })} fmt={(v) => v.toFixed(2) + "×"}/>
        <SliderV2 label="Spacing"    min={0.5} max={1.8} step={0.05} value={spVal} onChange={v => onTheme({ [spKey]: v })}   fmt={(v) => v.toFixed(2) + "×"}/>
        <SliderV2 label="Column"     min={680} max={1400} step={20} value={t.columnWidth} onChange={v => onTheme({ columnWidth: v })} fmt={(v) => v + "px"}/>
        <SliderV2 label="Grain"      min={0}   max={1}    step={0.05} value={t.grain}    onChange={v => onTheme({ grain: v })}      fmt={(v) => Math.round(v * 100) + "%"}/>
      </FieldV2>

      </InsGroup>

      <InsGroup label="Header & footer" {...grp("chrome")}>

      <FieldV2 label="HEADER PRESET">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 5 }}>
          {HEADER_PRESETS.map(p => (
            <button key={p.id} onClick={() => onHeader({ preset: p.id })} title={p.blurb} style={{
              padding: "8px 10px", textAlign: "left",
              background: page.header?.preset === p.id ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
              border: `1px solid ${page.header?.preset === p.id ? "var(--c-amber)" : "var(--c-line-2)"}`,
              borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: page.header?.preset === p.id ? "var(--c-amber)" : "var(--c-ink-2)", letterSpacing: ".08em", fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.3 }}>{p.blurb}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <ToggleV2 label="Sticky"      value={!!page.header?.sticky}      onChange={v => onHeader({ sticky: v })}/>
          <ToggleV2 label="Transparent" value={!!page.header?.transparent} onChange={v => onHeader({ transparent: v })}/>
        </div>
      </FieldV2>

      <FieldV2 label="FOOTER PRESET">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 5 }}>
          {FOOTER_PRESETS.map(p => (
            <button key={p.id} onClick={() => onFooter({ preset: p.id })} style={{
              padding: "8px 10px", textAlign: "left",
              background: page.footer?.preset === p.id ? "rgba(var(--accent-rgb),.10)" : "var(--c-bg)",
              border: `1px solid ${page.footer?.preset === p.id ? "var(--c-amber)" : "var(--c-line-2)"}`,
              borderRadius: "var(--r-1)", cursor: "pointer", color: "inherit",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: page.footer?.preset === p.id ? "var(--c-amber)" : "var(--c-ink-2)", letterSpacing: ".08em", fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.3 }}>{p.blurb}</div>
            </button>
          ))}
        </div>
      </FieldV2>

      <FieldV2 label="DEFAULT ANIMATION">
        <SelectV2
          value={page.defaultAnimation || "fade-up"}
          onChange={v => onUpdate({ defaultAnimation: v })}
          options={[
            ["none",       "None"],
            ["fade-in",    "Fade in"],
            ["fade-up",    "Fade up"],
            ["fade-down",  "Fade down"],
            ["slide-left", "Slide from left"],
            ["slide-right","Slide from right"],
            ["zoom",       "Zoom in"],
            ["blur",       "Blur reveal"],
          ]}
        />
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.5 }}>
          Applies to new sections. Override per-section in the inspector.
        </div>
      </FieldV2>

      </InsGroup>

      <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 16, marginTop: 4 }}>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
          Click any section in the canvas to edit. Drag in the left panel to reorder.
        </div>
      </div>
    </div>
  );
}

// ─── Section inspector ──────────────────────────────────────────────────

function SectionInspectorV2({ section, onChange, onChangeMeta, onMove, onRemove }) {
  const meta = BLOCK_LIBRARY_V2.find(b => b.type === section.type);
  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SECTION · {meta?.icon}</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, marginTop: 4 }}>{meta?.name}</div>
        <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{meta?.desc}</div>
      </div>

      <FieldV2 label="ANIMATE IN">
        <SelectV2
          value={section.animate || "fade-up"}
          onChange={v => onChangeMeta({ animate: v })}
          options={[
            ["none",       "None"],
            ["fade-in",    "Fade in"],
            ["fade-up",    "Fade up"],
            ["fade-down",  "Fade down"],
            ["slide-left", "Slide left"],
            ["slide-right","Slide right"],
            ["zoom",       "Zoom in"],
            ["blur",       "Blur reveal"],
          ]}
        />
      </FieldV2>

      {/* Per-type fields */}
      {(section.type === "hero" || section.type === "hero-parallax" || section.type === "hero-split" || section.type === "hero-video") && (
        <>
          <FieldV2 label="KICKER">
            <input value={section.props.kicker || ""} onChange={e => onChange({ kicker: e.target.value })} style={inpV2}/>
          </FieldV2>
          <FieldV2 label="TITLE">
            <input value={section.props.title || ""} onChange={e => onChange({ title: e.target.value })} style={inpV2}/>
          </FieldV2>
          <FieldV2 label="SUBTITLE">
            <textarea value={section.props.sub || ""} onChange={e => onChange({ sub: e.target.value })} rows={3} style={{ ...inpV2, resize: "vertical" }}/>
          </FieldV2>
          {(section.type === "hero-parallax" || section.type === "hero-split") && (
            <>
              <FieldV2 label="BACKGROUND IMAGE">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                  {Object.keys(BG_IMAGES).map(k => (
                    <button key={k} onClick={() => onChange({ bgImage: k })} title={BG_IMAGES[k].blurb} style={{
                      aspectRatio: "1/1", padding: 0,
                      background: `linear-gradient(135deg, ${BG_IMAGES[k].tint}88, ${tkc("black")})`,
                      border: `1.5px solid ${section.props.bgImage === k ? "var(--c-amber)" : "var(--c-line-2)"}`,
                      borderRadius: "var(--r-1)", cursor: "pointer",
                    }}/>
                  ))}
                </div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 6, letterSpacing: ".08em" }}>
                  {BG_IMAGES[section.props.bgImage]?.blurb}
                </div>
              </FieldV2>
              {section.type === "hero-parallax" && (
                <>
                  <SliderV2 label="Overlay opacity" min={0} max={0.9} step={0.05} value={section.props.overlay ?? 0.55} onChange={v => onChange({ overlay: v })} fmt={(v) => Math.round(v * 100) + "%"}/>
                  <SliderV2 label="Parallax strength" min={0} max={0.9} step={0.05} value={section.props.parallax ?? 0.4} onChange={v => onChange({ parallax: v })} fmt={(v) => v.toFixed(2)}/>
                </>
              )}
            </>
          )}
        </>
      )}

      {section.type === "marquee" && (
        <FieldV2 label="MARQUEE TEXT">
          <textarea value={section.props.text} onChange={e => onChange({ text: e.target.value })} rows={2} style={{ ...inpV2, resize: "vertical" }}/>
        </FieldV2>
      )}

      {section.type === "about" && (
        <FieldV2 label="TEXT">
          <textarea value={section.props.text} onChange={e => onChange({ text: e.target.value })} rows={6} style={{ ...inpV2, resize: "vertical" }}/>
        </FieldV2>
      )}

      {section.type === "contact" && (
        <>
          <FieldV2 label="EMAIL"><input value={section.props.email} onChange={e => onChange({ email: e.target.value })} style={inpV2}/></FieldV2>
          <FieldV2 label="PHONE"><input value={section.props.phone || ""} placeholder="optional" onChange={e => onChange({ phone: e.target.value })} style={inpV2}/></FieldV2>
          <FieldV2 label="STUDIO ADDRESS"><input value={section.props.address || ""} placeholder="optional" onChange={e => onChange({ address: e.target.value })} style={inpV2}/></FieldV2>
          <FieldV2 label="HOURS"><input value={section.props.hours || ""} placeholder="optional" onChange={e => onChange({ hours: e.target.value })} style={inpV2}/></FieldV2>
          <FieldV2 label="AGENT"><input value={section.props.agent} placeholder="optional" onChange={e => onChange({ agent: e.target.value })} style={inpV2}/></FieldV2>
          <ToggleV2 label="Show form" value={!!section.props.formEnabled} onChange={v => onChange({ formEnabled: v })}/>
          {section.props.formEnabled && (
            <>
              <FieldV2 label="FORM HEADLINE"><input value={section.props.formHeadline || ""} onChange={e => onChange({ formHeadline: e.target.value })} style={inpV2}/></FieldV2>
              <FieldV2 label="FORM SUBLINE"><input value={section.props.formSubline || ""} onChange={e => onChange({ formSubline: e.target.value })} style={inpV2}/></FieldV2>
            </>
          )}
        </>
      )}

      {(section.type === "upcoming" || section.type === "news" || section.type === "branched-shelf" || section.type === "episodes-shelf" || section.type === "trailers-shelf" || section.type === "holders" || section.type === "store" || section.type === "blog" || section.type === "shop-nft" || section.type === "actor-vault") && (
        <FieldV2 label="HEADLINE">
          <input value={section.props.headline || ""} onChange={e => onChange({ headline: e.target.value })} style={inpV2}/>
        </FieldV2>
      )}

      {section.type === "newsletter" && (
        <>
          <FieldV2 label="HEADLINE"><input value={section.props.headline || ""} onChange={e => onChange({ headline: e.target.value })} style={inpV2}/></FieldV2>
          <FieldV2 label="SUB"><textarea value={section.props.sub || ""} onChange={e => onChange({ sub: e.target.value })} rows={2} style={{ ...inpV2, resize: "vertical" }}/></FieldV2>
        </>
      )}

      {section.type === "spacer" && (
        <SliderV2 label="Height" min={20} max={240} step={4} value={section.props.size} onChange={v => onChange({ size: v })} fmt={(v) => v + "px"}/>
      )}

      <div style={{ borderTop: "1px solid var(--c-line)", paddingTop: 14, display: "flex", gap: 6 }}>
        <button onClick={() => onMove(-1)} style={smBtnV2}>↑ Up</button>
        <button onClick={() => onMove(1)}  style={smBtnV2}>↓ Down</button>
        <span style={{ flex: 1 }}/>
        <button onClick={onRemove} style={{ ...smBtnV2, color: "var(--c-blood-l)", borderColor: "var(--c-blood)" }}>Delete</button>
      </div>
    </div>
  );
}

Object.assign(window, { ThemeInspectorV2, SectionInspectorV2 });
