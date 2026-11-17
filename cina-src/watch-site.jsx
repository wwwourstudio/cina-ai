// watch-site.jsx — The PUBLISHED studio site, rendered for visitors.
//
// This is what the Builder's "Publish" actually produces: /site/:id renders
// the page saved in localStorage (cina:studio-pages-v2) with zero editor
// chrome — real scrolling, real animations, the exact header/footer presets.
// "View live" in the builder and the popup customizer both land here.
// Falls back to the builder's default page if the studio never published.
//
// Sub-pages: /site/:id/notebook/:slug is an auto-generated post detail page —
// blog/news cards on the home page link here, so posts no longer dead-end.

const { useState: usSite, useEffect: ueSite } = React;

// Shared loader — published page (or builder default), refreshed on publish.
function useSitePage(id, creator) {
  const [page, setPage] = usSite(() => {
    try {
      const all = JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}");
      if (all[id]) return all[id];
    } catch {}
    return (typeof DEFAULT_PAGE_V2 === "function") ? DEFAULT_PAGE_V2(creator) : null;
  });
  ueSite(() => {
    // Re-resolve when the id changes — the component instance is reused
    // across /site/:id routes, so the useState initializer only ran once.
    try {
      const all = JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}");
      if (all[id]) { setPage(all[id]); return; }
    } catch {}
    setPage((typeof DEFAULT_PAGE_V2 === "function") ? DEFAULT_PAGE_V2(creator) : null);
  }, [id]);
  ueSite(() => {
    const refresh = () => {
      try {
        const all = JSON.parse(localStorage.getItem("cina:studio-pages-v2") || "{}");
        if (all[id]) setPage(all[id]);
      } catch {}
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("cina:site-published", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("cina:site-published", refresh); };
  }, [id]);
  return page;
}

// Sharing & SEO + Enterprise CSS — applied while the site is open.
function useSiteHead(page, titleOverride) {
  ueSite(() => {
    if (!page) return;
    const prevTitle = document.title;
    document.title = titleOverride || (page.seo && page.seo.title) || `${page.studioName} · a Cina studio site`;
    const ensure = (attr, name, content) => {
      if (!content) return null;
      let el = document.head.querySelector(`meta[${attr}="${name}"]`);
      const made = !el;
      if (made) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      const prev = el.getAttribute("content");
      el.setAttribute("content", content);
      return () => { if (made) el.remove(); else el.setAttribute("content", prev || ""); };
    };
    const undos = [
      ensure("name", "description", page.seo && page.seo.description),
      ensure("property", "og:title", titleOverride || (page.seo && page.seo.title) || page.studioName),
      ensure("property", "og:description", page.seo && page.seo.description),
      ensure("property", "og:image", page.seo && page.seo.ogImage),
    ].filter(Boolean);
    let cssEl = null;
    if (page.tier === "enterprise" && page.customCss) {
      cssEl = document.createElement("style");
      cssEl.setAttribute("data-site-custom-css", "1");
      cssEl.textContent = page.customCss;
      document.head.appendChild(cssEl);
    }
    return () => { document.title = prevTitle; undos.forEach(u => u()); if (cssEl) cssEl.remove(); };
  }, [page, titleOverride]);
}

const siteBodyFont = (t) => (typeof wbFont === "function" ? wbFont(t.bodyFont || "sans") : "var(--f-sans)");
const siteHeadFont = (t) => (typeof wbFont === "function" ? wbFont(t.headlineFont || "display") : "var(--f-display)");

function useSiteMode() {
  const get = () => window.innerWidth <= 640 ? "phone" : window.innerWidth <= 1024 ? "tablet" : "desktop";
  const [m, setM] = React.useState(get);
  React.useEffect(() => { const h = () => setM(get()); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
}

function SitePage({ creatorId }) {
  const id = creatorId || "voss";
  const creator = (typeof CREATORS !== "undefined" && CREATORS.find(c => c.id === id)) || { id, name: id };
  const page = useSitePage(id, creator);
  useSiteHead(page);
  const siteMode = useSiteMode();

  if (!page) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <EmptyState icon="globe" title="No site published yet" body="Open the builder, lay out your page, and hit Publish."
          cta={<button className="btn btn-primary" onClick={() => navigate(`/build/${id}`)}>Open the builder</button>}/>
      </div>
    );
  }

  const t = page.theme;

  return (
    <div data-wb-live="1" style={{
      minHeight: "100vh",
      background: t.bg, color: t.ink,
      fontFamily: siteBodyFont(t),
      fontSize: 16 * (t.fontScale || 1),
      position: "relative",
    }}>
      {/* Owner tool sits in the reserved bottom corner; the credit lives at the end of the page. */}
      <button onClick={() => navigate(`/build/${id}`)} title="Edit this site in the builder" style={{
        position: "fixed", left: 14, bottom: "calc(12px + var(--orb-safe, 0px))", zIndex: 500,
        height: 32, padding: "0 12px", borderRadius: 999, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(10,10,12,.78)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,.16)", color: tkc("ink"),
        fontFamily: "var(--f-sans)", fontSize: "var(--fs-label)",
      }}>Edit site</button>

      {typeof RenderedHeader === "function" && <RenderedHeader mode={siteMode} page={page}/>}

      {page.sections.map(s => (
        <SectionRendererV2
          mode={siteMode}
          key={s.id}
          section={s}
          page={page}
          siteId={id}
          selected={false}
          onClick={() => {}}
          onInsertAfter={() => {}}
          onMove={() => {}}
          onRemove={() => {}}
          onDuplicate={() => {}}
        />
      ))}
      {page.tier === "free" && (
        <div style={{ padding: "18px 14px 64px", textAlign: "center", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.ink, opacity: 0.45 }}>MADE WITH CINA</div>
      )}
      {page.tier !== "free" && <div style={{ height: 56 }}></div>}

      {/* No footer section saved? The page.footer preset still renders. */}
      {!page.sections.some(s => s.type === "footer") && (
        <SectionRendererV2
          mode={siteMode}
          section={{ id: "__auto-footer", type: "footer", props: {} }}
          page={page} siteId={id} selected={false}
          onClick={() => {}} onInsertAfter={() => {}} onMove={() => {}} onRemove={() => {}} onDuplicate={() => {}}
        />
      )}
    </div>
  );
}

// ─── Post detail page ─────────────────────────────────────────────────────
// Auto-generated from the page's Notebook data: a published Notebook post
// (cina:studio-notebook, matched by id) or the blog section's own posts[]
// (matched by index). Same theme, header, and footer as the home page.
function SitePostPage({ creatorId, slug }) {
  const id = creatorId || "voss";
  const creator = (typeof CREATORS !== "undefined" && CREATORS.find(c => c.id === id)) || { id, name: id };
  const page = useSitePage(id, creator);

  // Resolve the post: shared Notebook first (rich blocks), then section props.
  let post = null;
  try {
    const nb = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null");
    if (Array.isArray(nb)) {
      const hit = nb.find(p => String(p.id) === String(slug) && p.status === "published");
      if (hit) {
        const fmt = (d) => {
          if (!d) return "";
          let dt = typeof d === "number" ? new Date(d) : new Date(String(d) + "T12:00");
          if (isNaN(dt.getTime())) dt = new Date(d);
          return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        };
        post = {
          title: hit.title || "Untitled",
          date: fmt(hit.date),
          read: Math.max(1, Math.round(((hit.blocks || []).reduce((n, b) => n + ((b.value || "").split(/\s+/).filter(Boolean).length), 0)) / 200)) + " min",
          dek: hit.dek || "",
          blocks: hit.blocks || [],
        };
      }
    }
  } catch {}
  if (!post && page) {
    const sec = (page.sections || []).find(s => s.type === "blog" || s.type === "news");
    const p = sec && (sec.props.posts || [])[parseInt(slug, 10)];
    if (p) post = { title: p.title, date: p.date, read: p.read, dek: p.excerpt, blocks: p.body ? [{ type: "text", value: p.body }] : [] };
  }

  useSiteHead(page, post && page ? `${post.title} · ${page.studioName}` : undefined);
  const siteMode = useSiteMode();

  if (!page) return <SitePage creatorId={id}/>;
  const t = page.theme;
  const accent = t.accent;
  const headlineFont = siteHeadFont(t);
  const back = (e) => { e.preventDefault(); navigate(`/site/${id}`); };

  return (
    <div data-wb-live="1" style={{
      minHeight: "100vh", background: t.bg, color: t.ink,
      fontFamily: siteBodyFont(t), fontSize: 16 * (t.fontScale || 1), position: "relative",
      display: "flex", flexDirection: "column",
    }}>
      {typeof RenderedHeader === "function" && <RenderedHeader mode={siteMode} page={{ ...page, header: { ...page.header, transparent: false } }}/>}

      <main style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "72px 28px 96px", boxSizing: "border-box" }}>
        <a href="#" onClick={back} style={{
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent,
          textDecoration: "none", textTransform: "uppercase",
        }}>← {page.studioName}</a>

        {!post ? (
          <div style={{ padding: "80px 0" }}>
            <h1 style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, margin: "0 0 14px", letterSpacing: "-0.02em" }}>Post not found</h1>
            <p style={{ opacity: 0.7, lineHeight: 1.6 }}>This post may have been unpublished. <a href="#" onClick={back} style={{ color: accent }}>Back to the site</a>.</p>
          </div>
        ) : (
          <article style={{ marginTop: 36 }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
              {post.date && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase" }}>{post.date}</span>}
              {post.read && <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", opacity: 0.5, letterSpacing: ".16em", textTransform: "uppercase" }}>{post.read} read</span>}
            </div>
            <h1 style={{
              fontFamily: headlineFont, fontStyle: "italic", fontWeight: 400,
              fontSize: `clamp(36px, 6cqi, ${58 * (t.fontScale || 1)}px)`, lineHeight: 1.04,
              letterSpacing: "-0.02em", margin: "0 0 22px", textWrap: "balance",
            }}>{post.title}</h1>
            {post.dek && <p style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 20 * (t.fontScale || 1), lineHeight: 1.5, opacity: 0.78, margin: "0 0 34px" }}>{post.dek}</p>}
            <div style={{ width: 54, height: 1, background: accent, opacity: 0.6, marginBottom: 34 }}></div>
            {(post.blocks || []).map((b, i) => {
              if (b.type === "quote") return <blockquote key={i} style={{ margin: "30px 0", padding: "4px 0 4px 22px", borderLeft: `2px solid ${accent}`, fontFamily: headlineFont, fontStyle: "italic", fontSize: 21 * (t.fontScale || 1), lineHeight: 1.5, opacity: 0.9 }}>{b.value}</blockquote>;
              if (b.type === "heading" || b.type === "h2") return <h2 key={i} style={{ fontFamily: headlineFont, fontStyle: "italic", fontSize: 28 * (t.fontScale || 1), fontWeight: 500, margin: "38px 0 14px", letterSpacing: "-0.01em" }}>{b.value}</h2>;
              if (b.type === "image" && b.src) return <figure key={i} style={{ margin: "32px 0" }}><img src={b.src} alt={b.caption || ""} style={{ width: "100%", display: "block", borderRadius: "var(--r-2)" }}/>{b.caption && <figcaption style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", opacity: 0.5, marginTop: 8, textTransform: "uppercase" }}>{b.caption}</figcaption>}</figure>;
              if (b.type === "image" || b.type === "video" || b.type === "card") return null;
              if (b.value) return <p key={i} style={{ fontSize: 16.5 * (t.fontScale || 1), lineHeight: 1.75, opacity: 0.88, margin: "0 0 22px", textWrap: "pretty" }}>{b.value}</p>;
              return null;
            })}
            <div style={{ marginTop: 44, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase" }}>— {page.studioName}</div>
          </article>
        )}
      </main>

      <SectionRendererV2
          mode={siteMode}
        section={{ id: "__post-footer", type: "footer", props: {} }}
        page={page} siteId={id} selected={false}
        onClick={() => {}} onInsertAfter={() => {}} onMove={() => {}} onRemove={() => {}} onDuplicate={() => {}}
      />
    </div>
  );
}

// ─── Merged studio page ───────────────────────────────────────────────────
// Profile (/creator/:id) and site (/site/:id) are now ONE page. If the
// owner has published a page-builder site it wins; otherwise the themed
// channel profile renders. Both routes land here.
function StudioSitePage({ id, sub, slug }) {
  // /site/:id ALWAYS renders the builder's output (published page, or the
  // builder's default when unpublished) — so the live site matches the
  // builder exactly. The standard profile lives at /studios/:id.
  // /site/:id/notebook/:slug is the auto-generated post detail page.
  if (sub === "notebook" && slug != null) return <SitePostPage creatorId={id || "voss"} slug={slug}/>;
  return <SitePage creatorId={id || "voss"}/>;
}

Object.assign(window, { StudioSitePage });
