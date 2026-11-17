// builder-app.jsx — Studio Builder root: state, layout, welcome and quick-start guide.
// Load order: core → blocks → canvas → toolbar → inspector → modals → app.

const { useState: usbAp, useEffect: uebAp, useMemo: umbAp, useRef: urbAp } = React;
// ─── The Studio Builder root ────────────────────────────────────────────

function StudioBuilder({ creatorId }) {
  const creator = (typeof CREATORS !== "undefined" && CREATORS.find(c => c.id === creatorId)) || (typeof CREATORS !== "undefined" && CREATORS[0]) || { id: creatorId || "voss", name: "Studio" };
  const [pages, setPages] = usbAp(loadPagesV2);
  // Prefer an autosaved working draft over the last published snapshot, so a
  // refresh never loses in-progress edits.
  const draftKey = "cina:builder-draft-v2";
  const loadDraft = () => { try { const d = JSON.parse(localStorage.getItem(draftKey) || "{}"); return d && d[creator.id] ? d[creator.id] : null; } catch { return null; } };
  const initial = loadDraft() || pages[creator.id] || DEFAULT_PAGE_V2(creator);
  const [page, setPage] = usbAp(initial);
  const [selectedId, setSelectedId] = usbAp(null);
  const [insertOpen, setInsertOpen] = usbAp(false);
  const [insertCat, setInsertCat] = usbAp("Heroes");
  const [insertAfter, setInsertAfter] = usbAp(null);
  const [insertTab, setInsertTab] = usbAp("blocks");
  const [aiOpen, setAiOpen] = usbAp(false);
  const [goLiveOpen, setGoLiveOpen] = usbAp(false);
  const [logoStudioOpen, setLogoStudioOpen] = usbAp(false);
  const [previewMode, setPreviewMode] = usbAp("desktop");
  const [dirty, setDirty] = usbAp(false);
  const [versionsOpen, setVersionsOpen] = usbAp(false);
  const [lastSavedAt, setLastSavedAt] = usbAp(loadDraft() ? Date.now() : null);
  const [showMobileInspector, setShowMobileInspector] = usbAp(false);
  const [showMobileOutline, setShowMobileOutline] = usbAp(false);
  // Track builder-chrome width so the 3-pane layout collapses to drawers on mobile.
  const [uiW, setUiW] = usbAp(typeof window !== "undefined" ? window.innerWidth : 1400);
  uebAp(() => {
    const on = () => setUiW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const compactUI = uiW < 1080;   // drawers, canvas keeps toolbar
  // Auto-generated sub-pages (P1: posts shouldn't dead-end) — each published
  // Notebook post gets a real route on the studio's site.
  const autoPages = umbAp(() => {
    const blogSec = (page.sections || []).find(s => s.type === "blog" || s.type === "news");
    if (!blogSec) return [];
    let out = [];
    try {
      const nb = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null");
      if (Array.isArray(nb)) out = nb.filter(p => p.status === "published").map(p => ({ key: p.id, title: p.title || "Untitled", to: `/site/${creator.id}/notebook/${p.id}` }));
    } catch {}
    if (!out.length) out = (blogSec.props.posts || []).map((p, i) => ({ key: "i" + i, title: p.title, to: `/site/${creator.id}/notebook/${i}` }));
    return out;
  }, [page.sections]);
  const phoneUI = uiW < 720;      // full-width drawers
  const mobileChromeBtn = { display: "inline-flex", alignItems: "center", gap: 7, height: 32, padding: "0 12px", borderRadius: "var(--r-2)", cursor: "pointer", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)", flexShrink: 0 };

  // ── New-user setup guide ────────────────────────────────────────────
  // A 5-step checklist that walks a first-time studio owner from a blank
  // page to a published site. Steps auto-complete from real signals (a logo
  // chosen, a section added, a publish) so it never lies about progress.
  const initialLogoRef = urbAp(JSON.stringify(initial.logo || null));
  const initialSecCountRef = urbAp((initial.sections || []).length);
  const [guideDone, setGuideDone] = usbAp(() => new Set(["name"]));
  const [guideOpen, setGuideOpen] = usbAp(false);
  const [welcomeOpen, setWelcomeOpen] = usbAp(false);
  const [wizardOpen, setWizardOpen] = usbAp(false);
  uebAp(() => {
    try { if (!localStorage.getItem("cina:builder-wizard-seen") && !localStorage.getItem("cina:builder-welcomed")) setWizardOpen(true); } catch {}
  }, []);
  const markGuide = (id) => setGuideDone(prev => { if (prev.has(id)) return prev; const n = new Set(prev); n.add(id); return n; });
  uebAp(() => {
    if (JSON.stringify(page.logo || null) !== initialLogoRef.current) markGuide("logo");
    if ((page.sections || []).length !== initialSecCountRef.current) markGuide("section");
  }, [page.logo, page.sections.length]);
  const closeWelcome = (keepGuide) => {
    setWelcomeOpen(false);
    try { localStorage.setItem("cina:builder-welcomed", "1"); } catch {}
    setGuideOpen(!!keepGuide);
  };
  const guideAction = (id) => {
    if (id === "name" || id === "theme") { setSelectedId(null); setShowMobileOutline(false); setShowMobileInspector(true); markGuide(id); }
    else if (id === "logo") { setLogoStudioOpen(true); }
    else if (id === "section") { setInsertAfter(null); setInsertTab("blocks"); setInsertOpen(true); }
    else if (id === "publish") { publish(); }
  };

  // ── Undo / redo history ──────────────────────────────────────────────
  // An effect watches `page` and records the PREVIOUS value, so every
  // mutation path (drag, inspector, AI apply, insert…) is captured without
  // having to wrap each setPage call site. undo()/redo() set a skip flag so
  // their own page change isn't re-recorded.
  const history = urbAp({ past: [], future: [] });
  const prevPageRef = urbAp(page);
  const skipHistory = urbAp(false);
  const [, setHistTick] = usbAp(0);

  uebAp(() => {
    const prev = prevPageRef.current;
    if (prev !== page) {
      setDirty(true);
      if (!skipHistory.current) {
        history.current.past.push(prev);
        if (history.current.past.length > 80) history.current.past.shift();
        history.current.future = [];
        setHistTick(t => t + 1);
      }
    }
    skipHistory.current = false;
    prevPageRef.current = page;
  }, [page]);

  // ── Autosave draft ─────────────────────────────────────────────────────
  // Debounced write of the working page to a draft key so nothing is lost on
  // refresh. This is separate from Publish (which announces the site live).
  uebAp(() => {
    const h = setTimeout(() => {
      try {
        const d = JSON.parse(localStorage.getItem(draftKey) || "{}");
        d[creator.id] = page;
        localStorage.setItem(draftKey, JSON.stringify(d));
        setLastSavedAt(Date.now());
        window.__wbDraftFail = false;
      } catch {
        if (window.toast && !window.__wbDraftFail) {
          window.__wbDraftFail = true;
          window.toast({ title: "COULDN'T SAVE DRAFT", text: "Browser storage is full — delete large media from your library, or your edits won't survive a refresh.", kind: "bad" });
        }
      }
    }, 700);
    return () => clearTimeout(h);
  }, [page]);

  const undo = () => {
    const h = history.current;
    if (!h.past.length) return;
    const prev = h.past.pop();
    h.future.push(page);
    skipHistory.current = true;
    setPage(prev);
    setHistTick(t => t + 1);
  };
  const redo = () => {
    const h = history.current;
    if (!h.future.length) return;
    const next = h.future.pop();
    h.past.push(page);
    skipHistory.current = true;
    setPage(next);
    setHistTick(t => t + 1);
  };

  const updatePage = (patch) => setPage(p => ({ ...p, ...patch }));
  const updateTheme = (patch) => setPage(p => ({ ...p, theme: { ...p.theme, ...patch } }));
  const updateHeader = (patch) => setPage(p => ({ ...p, header: { ...p.header, ...patch } }));
  const updateFooter = (patch) => setPage(p => ({ ...p, footer: { ...p.footer, ...patch } }));
  const updateLogo = (patch) => setPage(p => ({ ...p, logo: { ...p.logo, ...patch } }));
  const updateSection = (id, patch) => setPage(p => ({
    ...p, sections: p.sections.map(s => s.id === id ? { ...s, props: { ...s.props, ...patch } } : s),
  }));
  const updateSectionMeta = (id, patch) => setPage(p => ({
    ...p, sections: p.sections.map(s => s.id === id ? { ...s, ...patch } : s),
  }));
  const removeSection = (id) => setPage(p => ({ ...p, sections: p.sections.filter(s => s.id !== id) }));
  const duplicateSection = (id) => setPage(p => {
    const i = p.sections.findIndex(s => s.id === id);
    if (i < 0) return p;
    const src = p.sections[i];
    const copy = { ...src, id: "s" + Math.random().toString(36).slice(2, 7), props: { ...src.props } };
    const next = [...p.sections]; next.splice(i + 1, 0, copy);
    return { ...p, sections: next };
  });
  const moveSection = (id, dir) => setPage(p => {
    const i = p.sections.findIndex(s => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= p.sections.length) return p;
    const copy = [...p.sections];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return { ...p, sections: copy };
  });
  const insertSection = (type, afterId, patch) => {
    const lim = wbTier(page);
    if ((page.sections || []).length >= lim.maxSections) {
      if (window.toast) window.toast({ title: "PLAN LIMIT", text: `Free sites cap at ${lim.maxSections} sections. Upgrade to Pro for unlimited.`, kind: "warn" });
      setInsertOpen(false);
      updatePage({ _upsell: { reason: "sections", at: Date.now() } });
      return;
    }
    const id = "s" + Math.random().toString(36).slice(2, 7);
    const metaPatch = (patch && patch.metaPatch) || {};
    const propsPatch = (patch && patch.propsPatch) || {};
    const newSec = {
      id, type, animate: page.defaultAnimation || "fade-up",
      // Marquees read as a full-bleed ribbon — flush by default.
      ...(type === "marquee" ? { width: "full", pad: "none", margin: "none" } : {}),
      props: { ...defaultPropsV2(type, creator), ...propsPatch },
      ...metaPatch,
    };
    setPage(p => {
      const i = afterId ? p.sections.findIndex(s => s.id === afterId) : p.sections.length - 1;
      const next = [...p.sections]; next.splice(i + 1, 0, newSec);
      return { ...p, sections: next };
    });
    setInsertOpen(false);
    setSelectedId(id);
  };
  // Materialize a saved/template spec into a live section (defaults filled in,
  // then the spec's content + look layered on top).
  const materializeSpec = (spec) => {
    const id = "s" + Math.random().toString(36).slice(2, 7);
    const { type, props, ...meta } = spec;
    return {
      id, type,
      animate: spec.animate || page.defaultAnimation || "fade-up",
      props: { ...defaultPropsV2(type, creator), ...(props || {}) },
      ...meta,
    };
  };
  const insertSpec = (spec, afterId) => {
    const lim = wbTier(page);
    if ((page.sections || []).length >= lim.maxSections) {
      if (window.toast) window.toast({ title: "PLAN LIMIT", text: `Free sites cap at ${lim.maxSections} sections. Upgrade to Pro for unlimited.`, kind: "warn" });
      setInsertOpen(false);
      updatePage({ _upsell: { reason: "sections", at: Date.now() } });
      return;
    }
    const sec = materializeSpec(spec);
    setPage(p => {
      const i = afterId ? p.sections.findIndex(s => s.id === afterId) : p.sections.length - 1;
      const next = [...p.sections]; next.splice(i + 1, 0, sec);
      return { ...p, sections: next };
    });
    setInsertOpen(false);
    setSelectedId(sec.id);
  };
  // Replace the whole section stack from a starter page template.
  const applyTemplate = (tpl) => {
    const lim = wbTier(page);
    let specs = tpl.specs || [];
    const capped = specs.length > lim.maxSections;
    if (capped) specs = specs.slice(0, lim.maxSections);
    const sections = specs.map(materializeSpec);
    setPage(p => ({ ...p, sections, ...(capped ? { _upsell: { reason: "sections", at: Date.now() } } : {}) }));
    setInsertOpen(false);
    setSelectedId(null);
    if (window.toast) window.toast(capped
      ? { title: "PLAN LIMIT", text: `"${tpl.name}" has ${(tpl.specs || []).length} sections — Free caps at ${lim.maxSections}. Applied the first ${lim.maxSections}; upgrade to Pro for the rest.`, kind: "warn" }
      : { title: "LAYOUT APPLIED", text: `"${tpl.name}" · ${sections.length} sections · your theme + logo kept`, kind: "good" });
  };
  const saveSectionAsTemplate = (id) => {
    const sec = page.sections.find(s => s.id === id);
    if (sec && window.wbSaveSection) window.wbSaveSection(sec);
  };
  const publish = () => {
    const next = { ...pages, [creator.id]: page };
    setPages(next); savePagesV2(next); setDirty(false);
    wbPushSnapshotV2(creator.id, page);
    markGuide("publish");
    window.dispatchEvent(new Event("cina:site-published"));
    if (window.toast) window.toast({ title: "PUBLISHED", text: `${page.studioName} → ${page.domain} · View live to see it`, kind: "good" });
  };

  // View Live ALWAYS reflects the current canvas: persist the working page
  // under the real save key (creator.id), then open the visitor site. (Old
  // behaviour read a domain-derived id + only the last published snapshot,
  // so fresh edits never showed.)
  const viewLive = () => {
    const next = { ...pages, [creator.id]: page };
    setPages(next); savePagesV2(next); setDirty(false);
    window.dispatchEvent(new Event("cina:site-published"));
    if (window.navigate) window.navigate(`/site/${creator.id}`);
    else window.location.hash = `#/site/${creator.id}`;
  };

  const selected = page.sections.find(s => s.id === selectedId);

  // ── Keyboard shortcuts — undo/redo, delete, duplicate, deselect ───────
  uebAp(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault(); redo();
      } else if (mod && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault(); duplicateSection(selectedId);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !typing) {
        e.preventDefault(); removeSection(selectedId); setSelectedId(null);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, page]);

  // ── Drag reorder — with live drop-position indicator ──────────────────
  const dragId = urbAp(null);
  const [draggingId, setDraggingId] = usbAp(null);
  const [dropTarget, setDropTarget] = usbAp(null); // { id, pos: "before" | "after" }

  const onDragStart = (e, id) => {
    dragId.current = id;
    setDraggingId(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", id); } catch {}
    }
  };
  const onDragOverItem = (e, overId) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    if (!dragId.current || overId === dragId.current) { if (dropTarget) setDropTarget(null); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientY - r.top) < r.height / 2 ? "before" : "after";
    setDropTarget(prev => (prev && prev.id === overId && prev.pos === pos) ? prev : { id: overId, pos });
  };
  const onDragEnd = () => { dragId.current = null; setDraggingId(null); setDropTarget(null); };
  const commitDrop = (e) => {
    if (e) e.preventDefault();
    const from = dragId.current, dt = dropTarget;
    if (!from || !dt) { onDragEnd(); return; }
    setPage(p => {
      const arr = [...p.sections];
      const fromI = arr.findIndex(s => s.id === from);
      if (fromI < 0) return p;
      const [moved] = arr.splice(fromI, 1);
      let toI = arr.findIndex(s => s.id === dt.id);
      if (toI < 0) return p;
      if (dt.pos === "after") toI += 1;
      arr.splice(toI, 0, moved);
      return { ...p, sections: arr };
    });
    onDragEnd();
  };

  const [planOpen, setPlanOpen] = usbAp(false);
  const wrapOutline = (kids) => compactUI
    ? (showMobileOutline ? <CinaSheet side="left" title="Sections" onClose={() => setShowMobileOutline(false)} width={phoneUI ? 360 : 340} bodyStyle={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>{kids}</CinaSheet> : null)
    : <aside style={{ borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", background: "var(--c-panel)", overflow: "hidden" }}>{kids}</aside>;
  const wrapInspector = (kids) => compactUI
    ? (showMobileInspector ? <CinaSheet title={selected ? "Section" : "Design"} onClose={() => setShowMobileInspector(false)} width={phoneUI ? 400 : 380} bodyStyle={{ padding: 0 }}>{kids}</CinaSheet> : null)
    : <aside style={{ borderLeft: "1px solid var(--c-line)", overflowY: "auto", overflowX: "hidden", minHeight: 0, height: "100vh", background: "var(--c-panel)" }}>{kids}</aside>;

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: compactUI ? "1fr" : "260px 1fr 320px", gridTemplateRows: "100vh", background: "var(--c-bg)", color: "var(--c-ink)", overflow: "hidden" }}>
      {/* LEFT — outline (sheet when compact) */}
      {wrapOutline(<>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--c-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <a href="Cina.html" title="Exit the builder — back to your studio" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              height: 30, padding: "0 12px", borderRadius: "var(--r-2)", textDecoration: "none",
              background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", textTransform: "uppercase",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              Studio
            </a>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 4 }}>BUILDING</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--c-ink)" }}>{page.studioName}</div>
          <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: page.tier === "free" ? "var(--c-ink-3)" : page.tier === "pro" ? "var(--c-amber)" : "var(--c-good)",
            }}/>
            <span>{page.domain}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", padding: "4px 8px 6px" }}>PAGES</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: "var(--r-1)", background: "rgba(var(--accent-rgb),.08)", border: "1px solid rgba(var(--accent-rgb),.3)" }}>
              <span style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)", lineHeight: 1 }}>⌂</span>
              <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>Home</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>THIS CANVAS</span>
            </div>
            {autoPages.slice(0, 5).map(pg => (
              <button key={pg.key} onClick={() => { if (window.navigate) navigate(pg.to); else window.location.hash = "#" + pg.to; }} title="Auto-generated from your Notebook section — opens the live page" style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginTop: 2,
                background: "transparent", border: "1px solid transparent", borderRadius: "var(--r-1)", cursor: "pointer",
                color: "var(--c-ink-3)", fontSize: "var(--fs-body)", textAlign: "left",
              }}>
                <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)", width: 12, textAlign: "center" }}>└</span>
                <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pg.title}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)", border: "1px solid rgba(106,163,122,.35)", borderRadius: "var(--r-1)", padding: "1px 4px", flexShrink: 0 }}>AUTO</span>
              </button>
            ))}
            {autoPages.length > 5 && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", padding: "4px 8px 0", letterSpacing: ".08em" }}>+{autoPages.length - 5} more post pages</div>}
            {autoPages.length === 0 && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", padding: "6px 8px 0", lineHeight: 1.5 }}>Post pages generate automatically once your page has a Notebook section.</div>}
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", padding: "4px 8px 8px" }}>
            SECTIONS · {page.sections.length}
          </div>
          {page.sections.map((s, i) => {
            const meta = BLOCK_LIBRARY_V2.find(b => b.type === s.type);
            const isDragging = draggingId === s.id;
            const showBefore = dropTarget && dropTarget.id === s.id && dropTarget.pos === "before";
            const showAfter = dropTarget && dropTarget.id === s.id && dropTarget.pos === "after";
            const dropLine = (
              <span style={{
                position: "absolute", left: 6, right: 6, height: 2, borderRadius: "var(--r-1)",
                background: "var(--c-amber)", boxShadow: "0 0 6px rgba(var(--accent-rgb),.7)", zIndex: 2,
              }}/>
            );
            return (
              <div key={s.id} style={{ position: "relative" }}
                onDragOver={(e) => onDragOverItem(e, s.id)}
                onDrop={commitDrop}>
                {showBefore && <span style={{ position: "absolute", top: -2, left: 6, right: 6, height: 2, borderRadius: "var(--r-1)", background: "var(--c-amber)", boxShadow: "0 0 6px rgba(var(--accent-rgb),.7)", zIndex: 2 }}/>}
                <div
                  draggable
                  role="button"
                  tabIndex={0}
                  onDragStart={(e) => onDragStart(e, s.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => { setSelectedId(s.id); if (compactUI) { setShowMobileOutline(false); setShowMobileInspector(true); } }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(s.id); if (compactUI) { setShowMobileOutline(false); setShowMobileInspector(true); } } }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 8px", marginBottom: 3,
                    background: selectedId === s.id ? "rgba(var(--accent-rgb),.10)" : "transparent",
                    border: `1px solid ${selectedId === s.id ? "var(--c-amber)" : "transparent"}`,
                    borderRadius: "var(--r-1)", cursor: "grab", textAlign: "left",
                    color: "var(--c-ink-2)", fontSize: "var(--fs-body)",
                    opacity: isDragging ? 0.4 : 1,
                  }}>
                  <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-body)", width: 12, lineHeight: 1, letterSpacing: "-1px", cursor: "grab" }} title="Drag to reorder">⠿</span>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)", width: 18, textAlign: "center" }}>{meta?.icon || "■"}</span>
                  <span style={{ flex: 1, color: selectedId === s.id ? "var(--c-ink)" : "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.title || meta?.name || s.type}
                  </span>
                  <button
                    title={s.inMenu ? "In site menu — click to remove" : "Add to site menu"}
                    onClick={(e) => { e.stopPropagation(); updateSectionMeta(s.id, { inMenu: !s.inMenu }); }}
                    style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", borderRadius: "var(--r-1)", padding: "2px 4px", cursor: "pointer",
                      color: s.inMenu ? "var(--c-amber)" : "var(--c-ink-4)",
                      border: `1px solid ${s.inMenu ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)"}`,
                      background: s.inMenu ? "rgba(var(--accent-rgb),.08)" : "transparent", opacity: s.inMenu ? 1 : 0.55 }}>MENU</button>
                  {s.animate && s.animate !== "none" && (
                    <span title={`animate: ${s.animate}`} style={{
                      width: 5, height: 5, borderRadius: "50%", background: "var(--c-amber)", opacity: 0.6,
                    }}/>
                  )}
                </div>
                {showAfter && <span style={{ position: "absolute", bottom: 1, left: 6, right: 6, height: 2, borderRadius: "var(--r-1)", background: "var(--c-amber)", boxShadow: "0 0 6px rgba(var(--accent-rgb),.7)", zIndex: 2 }}/>}
              </div>
            );
          })}
          <button onClick={() => { const lim = wbTier(page); if ((page.sections||[]).length >= lim.maxSections) { if (window.toast) window.toast({ title: "PLAN LIMIT", text: `Free caps at ${lim.maxSections} sections — upgrade to Pro for unlimited.`, kind: "warn" }); updatePage({ _upsell: { reason: "sections", at: Date.now() } }); return; } setInsertAfter(null); setInsertTab("blocks"); setInsertOpen(true); }} style={{
            width: "100%", marginTop: 8, padding: "12px 10px",
            background: "transparent", border: "1px dashed var(--c-line-3)",
            borderRadius: "var(--r-2)", color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer",
          }}>+ Add section{page.tier === "free" ? `  ·  ${(page.sections||[]).length}/${WB_TIERS.free.maxSections}` : ""}</button>
        </div>

        <div style={{ padding: 10, borderTop: "1px solid var(--c-line)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <button onClick={() => setGuideOpen(o => !o)} title={`Quick start${guideDone.size < 5 ? ` · ${guideDone.size}/5 done` : " · done"}`} style={{ ...smallTool, flexDirection: "column", height: 58, gap: 5, color: "var(--c-amber)", borderColor: "rgba(var(--accent-rgb),.4)", position: "relative" }}>
            <Icon name="rows" size={18}/><span style={{ fontSize: "var(--fs-label)" }}>Quick start</span>
            {guideDone.size < 5 && <span style={{ position: "absolute", top: 5, right: 6, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{guideDone.size}/5</span>}
          </button>
          <button onClick={() => setLogoStudioOpen(true)} title="Logo studio — wordmark, monogram, upload or AI-generate" style={{ ...smallTool, flexDirection: "column", height: 58, gap: 5 }}>
            <Icon name="spark" size={18}/><span style={{ fontSize: "var(--fs-label)" }}>Logo</span>
          </button>
          <button onClick={() => setWizardOpen(true)} title="Build with Cina — guided site builder from your account" style={{ ...smallTool, flexDirection: "column", height: 58, gap: 5 }}>
            <Icon name="sparkles" size={18}/><span style={{ fontSize: "var(--fs-label)" }}>Guided build</span>
          </button>
        </div>
      </>)}

      {/* CENTER — canvas */}
      <main style={{ display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, gridColumn: compactUI ? "1" : "auto" }}>
        <BuilderToolbar
          page={page} updatePage={updatePage} updateTheme={updateTheme}
          previewMode={previewMode} setPreviewMode={setPreviewMode}
          dirty={dirty} publish={publish} viewLive={viewLive}
          undo={undo} redo={redo}
          canUndo={history.current.past.length > 0}
          canRedo={history.current.future.length > 0}
          openVersions={() => setVersionsOpen(true)}
          compactUI={compactUI}
          onSections={() => { setShowMobileOutline(true); setShowMobileInspector(false); }}
          onDesign={() => { setShowMobileInspector(true); setShowMobileOutline(false); }}
          onPlan={() => setPlanOpen(true)}
        />
        <div data-builder-canvas="true" style={{ flex: 1, overflowY: "auto", background: tkc("black"), padding: previewMode === "desktop" ? 0 : 32, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          <PreviewCanvasV2
            page={page} mode={previewMode}
            selectedId={selectedId} onSelect={setSelectedId}
            onInsertAfter={(id) => { setInsertAfter(id); setInsertTab("blocks"); setInsertOpen(true); }}
            onMove={moveSection} onRemove={removeSection} onDuplicate={duplicateSection}
            draggingId={draggingId} dropTarget={dropTarget}
            onDragStartSec={onDragStart} onDragOverSec={onDragOverItem}
            onDropSec={commitDrop} onDragEndSec={onDragEnd}
          />
        </div>
      </main>

      {/* RIGHT — inspector (sheet when compact) */}
      {wrapInspector(<>
        {selected
          ? React.createElement(window.SectionInspectorV3 || SectionInspectorV2, {
              section: selected,
              previewMode: previewMode,
              onChange: (p) => updateSection(selected.id, p),
              onChangeMeta: (p) => updateSectionMeta(selected.id, p),
              onMove: (d) => moveSection(selected.id, d),
              onDuplicate: () => duplicateSection(selected.id),
              onSaveTemplate: () => saveSectionAsTemplate(selected.id),
              onRemove: () => { removeSection(selected.id); setSelectedId(null); },
            })
          : <ThemeInspectorV2
              page={page} onUpdate={updatePage} onTheme={updateTheme}
              onHeader={updateHeader} onFooter={updateFooter}
              previewMode={previewMode}
              onOpenLogoStudio={() => setLogoStudioOpen(true)}/>
        }
      </>)}
      {planOpen && <BuilderPlanSheet page={page} onClose={() => setPlanOpen(false)} onPick={(id) => { updatePage({ tier: id, _upsell: null }); setPlanOpen(false); }}/>}

      {insertOpen && (
        <InsertOverlayV3
          activeCat={insertCat} setActiveCat={setInsertCat}
          initialTab={insertTab}
          accent={page.theme.accent}
          onClose={() => setInsertOpen(false)}
          onInsertBlock={(t, patch) => insertSection(t, insertAfter, patch)}
          onInsertTemplate={(tpl) => applyTemplate(tpl)}
          onInsertSaved={(spec) => insertSpec(spec, insertAfter)}/>
      )}
      {logoStudioOpen && (
        <LogoStudio
          logo={page.logo} setLogo={(l) => setPage(p => ({ ...p, logo: l }))}
          studioName={page.studioName}
          accent={page.theme.accent}
          onClose={() => setLogoStudioOpen(false)}/>
      )}
      {versionsOpen && (
        <VersionsModalV2 creatorId={creator.id} livePage={pages[creator.id]} onClose={() => setVersionsOpen(false)}
          onRestore={(pg, kind) => {
            setPage(pg); setVersionsOpen(false);
            if (window.toast) window.toast({ title: kind === "live" ? "REVERTED TO LIVE" : kind === "file" ? "SITE FILE OPENED" : "VERSION RESTORED", text: "The canvas now shows that version — publish to make it live.", kind: "good" });
          }}/>
      )}
      {aiOpen && <CinaAssistV2 page={page} onClose={() => setAiOpen(false)} onApply={(updates) => { setPage(p => ({ ...p, ...updates })); setAiOpen(false); if (window.toast) window.toast({ title: "CINA UPDATED", text: "Theme + order applied", kind: "good" }); }}/>}
      {wizardOpen && window.CinaSiteWizard && (
        <CinaSiteWizard
          page={page} creator={creator}
          onClose={() => setWizardOpen(false)}
          onApply={(updates) => {
            const lim = wbTier(page);
            let u = updates;
            if (u && u.sections && u.sections.length > lim.maxSections) {
              u = { ...u, sections: u.sections.slice(0, lim.maxSections), _upsell: { reason: "sections", at: Date.now() } };
              if (window.toast) window.toast({ title: "PLAN LIMIT", text: `Free caps at ${lim.maxSections} sections — kept the first ${lim.maxSections}. Upgrade to Pro for the full build.`, kind: "warn" });
            } else if (window.toast) window.toast({ title: "CINA", msg: "Built your site from your account." });
            setPage(p => ({ ...p, ...u }));
          }}/>
      )}
      {goLiveOpen && window.GoLiveModal && (
        <GoLiveModal
          page={page} updatePage={updatePage}
          onClose={() => setGoLiveOpen(false)}
          onConfirm={(view) => { setGoLiveOpen(false); if (view) viewLive(); else publish(); }}/>
      )}
      {welcomeOpen && <BuilderWelcome page={page}
        onStart={() => closeWelcome(true)}
        onWizard={() => { closeWelcome(false); setWizardOpen(true); }}
        onTemplate={() => { closeWelcome(false); setInsertAfter(null); setInsertTab("templates"); setInsertOpen(true); }}
        onSkip={() => closeWelcome(false)}/>}
      {guideOpen && (
        <BuilderGuide
          page={page} done={guideDone} dirty={dirty}
          onAction={guideAction} onClose={() => setGuideOpen(false)}
        />
      )}
      {window.MediaLibraryHost && <MediaLibraryHost/>}
    </div>
  );
}

// ─── New-user setup guide ─────────────────────────────────────────────────

function BuilderWelcome({ page, onStart, onSkip, onWizard, onTemplate }) {
  return (
    <div onClick={onSkip} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", backdropFilter: "blur(16px)",
      zIndex: 240, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 540, maxWidth: "100%", background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)", padding: 38, textAlign: "center",
      }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 16 }}>✸ STUDIO BUILDER</div>
        <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Let’s build {page.studioName}.</h2>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 auto 26px", maxWidth: 420 }}>
          Your studio gets its own site at <span style={{ color: "var(--c-ink)" }}>{page.domain}</span>.
          Let Cina design it from your films — or start from a blank canvas.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onWizard} style={{
            width: "100%", padding: "16px 20px", borderRadius: "var(--r-3)", cursor: "pointer", textAlign: "left",
            background: "rgba(var(--accent-rgb),.12)", border: "1px solid var(--c-amber)", color: "var(--c-ink)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "var(--c-amber)", color: "var(--c-on-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-lead)", fontWeight: 700 }}>✦</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: "var(--fs-lead)", fontWeight: 650, color: "var(--c-amber)" }}>Build it with Cina</span>
              <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>Answer a few questions — Cina designs the whole site from your account. ~1 min.</span>
            </span>
            <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-lead)" }}>→</span>
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onTemplate} style={{
              flex: 1, padding: "12px 14px", borderRadius: "var(--r-3)", cursor: "pointer", textAlign: "left",
              background: "var(--c-bg)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)",
            }}>
              <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600 }}>Start from a template</span>
              <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>Pick a ready-made layout</span>
            </button>
            <button onClick={onStart} style={{
              flex: 1, padding: "12px 14px", borderRadius: "var(--r-3)", cursor: "pointer", textAlign: "left",
              background: "var(--c-bg)", border: "1px solid var(--c-line-2)", color: "var(--c-ink)",
            }}>
              <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600 }}>Blank canvas</span>
              <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>Build it yourself, step by step</span>
            </button>
          </div>
          <button className="btn btn-ghost" style={{ height: 34, marginTop: 4 }} onClick={onSkip}>Skip — just let me explore</button>
        </div>
      </div>
    </div>
  );
}

function BuilderGuide({ page, done, dirty, onAction, onClose }) {
  const steps = [
    { id: "name",    label: "Name your studio", sub: page.domain },
    { id: "theme",   label: "Theme & colors",   sub: "Preset, fonts, accent" },
    { id: "logo",    label: "Create your logo", sub: "Wordmark, AI, or upload" },
    { id: "section", label: "Add a section",    sub: "Pick a block to drop in" },
    { id: "publish", label: "Publish your site", sub: dirty ? "You have unsaved changes" : "Go live at " + page.domain },
  ];
  const count = steps.filter(s => done.has(s.id)).length;
  const allDone = count === steps.length;
  const firstTodo = steps.find(s => !done.has(s.id));
  return (
    <div style={{
      position: "fixed", left: 16, bottom: 16, width: 290, zIndex: 120,
      background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-3)",
      boxShadow: "0 24px 60px -20px rgba(0,0,0,.8)", overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: allDone ? "var(--c-good)" : "var(--c-amber)", letterSpacing: ".16em", fontWeight: 600 }}>{allDone ? "✓ STUDIO READY" : "QUICK START"}</span>
          <span style={{ flex: 1 }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{count}/{steps.length}</span>
          <button onClick={onClose} title="Hide guide" style={{ width: 20, height: 20, border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", fontSize: "var(--fs-body)", lineHeight: 1 }} aria-label="Close">×</button>
        </div>
        <div style={{ height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden", marginTop: 10 }}>
          <div style={{ width: `${(count / steps.length) * 100}%`, height: "100%", background: allDone ? "var(--c-good)" : "var(--c-amber)", transition: "width .3s" }}/>
        </div>
      </div>
      <div style={{ padding: 6 }}>
        {steps.map(s => {
          const isDone = done.has(s.id);
          const isNext = !isDone && firstTodo && firstTodo.id === s.id;
          return (
            <button key={s.id} onClick={() => onAction(s.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "9px 10px",
              background: isNext ? "rgba(var(--accent-rgb),.08)" : "transparent",
              border: `1px solid ${isNext ? "rgba(var(--accent-rgb),.35)" : "transparent"}`,
              borderRadius: "var(--r-2)", cursor: "pointer", textAlign: "left", marginBottom: 2,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-label)", fontWeight: 700,
                background: isDone ? "var(--c-good)" : "transparent",
                border: isDone ? "none" : `1.5px solid ${isNext ? "var(--c-amber)" : "var(--c-line-3)"}`,
                color: isDone ? tkc("panel-2") : (isNext ? "var(--c-amber)" : "var(--c-ink-3)"),
              }}>{isDone ? "✓" : ""}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "var(--fs-body)", color: isDone ? "var(--c-ink-3)" : "var(--c-ink)", textDecoration: isDone ? "line-through" : "none" }}>{s.label}</span>
                <span style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.sub}</span>
              </span>
              {!isDone && <span style={{ color: isNext ? "var(--c-amber)" : "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>→</span>}
            </button>
          );
        })}
      </div>
      {allDone && (
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-body)", color: "var(--c-good)", display: "flex", alignItems: "center", gap: 8 }}>
          <span>●</span> Live at {page.domain}. Nice work.
        </div>
      )}
    </div>
  );
}

window.CreatorBuilder = StudioBuilder;
window.StudioBuilder = StudioBuilder;

Object.assign(window, { StudioBuilder });
