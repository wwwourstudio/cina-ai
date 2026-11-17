// studio-site-panel.jsx — "Site" tab inside the Studio app (Cina.html).
//
// All the public-site options in one place, synced with the Watch page
// builder through the same localStorage document (cina:studio-pages-v2).
// Sections (title / show-in-menu / order), identity, store products and
// notebook posts are all editable here; deep links open the full builder.

const { useState: usSP, useMemo: umSP } = React;

const SP_LS = "cina:studio-pages-v2";
const SP_CID = "voss"; // the signed-in studio

function spLoadPage() {
  try {
    const all = JSON.parse(localStorage.getItem(SP_LS) || "{}");
    if (all[SP_CID]) return { page: all[SP_CID], published: true };
  } catch {}
  // Draft default — mirrors the builder's starter so edits made here
  // appear when the builder is opened later.
  return {
    published: false,
    page: {
      studioName: "Voss Pictures",
      logo: { kind: "wordmark", text: "Voss Pictures" },
      theme: { bg: tkc("bg"), ink: tkc("ink"), accent: tkc("bad") },
      header: { preset: "wordmark-right" },
      sections: [
        { id: "s-hero",     type: "hero-parallax", title: "Home" },
        { id: "s-featured", type: "featured",      title: "Featured" },
        { id: "s-upcoming", type: "upcoming",      title: "Upcoming", inMenu: true },
        { id: "s-branched", type: "branched-shelf",title: "Branched", inMenu: true },
        { id: "s-films",    type: "films",         title: "Films",    inMenu: true },
        { id: "s-store",    type: "store",         title: "Store",    inMenu: true, props: { headline: "The store", products: [
          { name: "Poster · Last Light", kind: "POSTER", price: 28 },
          { name: "Score · vinyl LP",    kind: "VINYL",  price: 42 },
        ] } },
        { id: "s-news",     type: "blog",          title: "Notebook", inMenu: true, props: { headline: "Notebook", posts: [
          { date: "May 22, 2026", read: "8 min", title: "Why we shoot on safelight", excerpt: "It's not nostalgia. It's that the wait teaches you what the photo is going to be." },
        ] } },
        { id: "s-contact",  type: "contact",       title: "Contact",  inMenu: true },
      ],
    },
  };
}

function spSave(page) {
  try {
    const all = JSON.parse(localStorage.getItem(SP_LS) || "{}");
    all[SP_CID] = page;
    localStorage.setItem(SP_LS, JSON.stringify(all));
  } catch {}
}

// Live data written by the dedicated managers (Store.html / Notebook.html).
function spReadStore() {
  try { const v = JSON.parse(localStorage.getItem("cina:studio-store") || "null"); if (Array.isArray(v)) return v; } catch {}
  return [];
}
function spReadNotebook() {
  try { const v = JSON.parse(localStorage.getItem("cina:studio-notebook") || "null"); if (Array.isArray(v)) return v; } catch {}
  return [];
}
// Contact messages + newsletter subscribers written by the live site's
// contact/newsletter blocks (builder-blocks.jsx).
function spReadInbox() {
  try { return JSON.parse(localStorage.getItem("cina:site-inbox-v1") || "null") || { messages: [], subscribers: [] }; }
  catch { return { messages: [], subscribers: [] }; }
}
const spMoney = (n) => "$" + (Number(n) || 0).toFixed(0);
const spReadMins = (p) => Math.max(1, Math.round(((p.blocks || []).reduce((n, b) => n + ((b.value || "").split(/\s+/).filter(Boolean).length), 0)) / 200));
const spFmtDate = (d) => d ? new Date(d + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

const spInp = {
  width: "100%", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", padding: "7px 10px", color: "var(--c-ink)",
  fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)", outline: "none",
};
const spBtn = {
  padding: "7px 13px", background: "transparent",
  border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
  color: "var(--c-ink-2)", fontSize: "var(--fs-label)", cursor: "pointer",
  fontFamily: "var(--f-mono)", letterSpacing: ".16em", textTransform: "uppercase",
};

function SpCard({ eyebrow, title, sub, children, accent = "var(--c-amber)" }) {
  return (
    <section style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 22 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", fontWeight: 600, marginBottom: 6 }}>{eyebrow}</div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{title}</div>
      {sub && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function StudioSitePanel() {
  const init = umSP(spLoadPage, []);
  const [page, setPage] = usSP(init.page);
  const [published] = usSP(init.published);
  const update = (fn) => setPage(p => { const n = fn(typeof structuredClone === "function" ? structuredClone(p) : JSON.parse(JSON.stringify(p))); spSave(n); return n; });

  const setSection = (id, patch) => update(p => {
    p.sections = (p.sections || []).map(s => s.id === id ? { ...s, ...patch } : s);
    return p;
  });
  const moveSection = (id, dir) => update(p => {
    const i = p.sections.findIndex(s => s.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= p.sections.length) return p;
    const [s] = p.sections.splice(i, 1);
    p.sections.splice(j, 0, s);
    return p;
  });

  const storeSec = (page.sections || []).find(s => s.type === "store");
  const blogSec  = (page.sections || []).find(s => s.type === "blog" || s.type === "news");
  const liveProducts = spReadStore();
  const liveActive = liveProducts.filter(p => p.status === "active");
  const livePosts = spReadNotebook();
  const inbox = spReadInbox();
  const livePublished = livePosts.filter(p => p.status === "published");
  const menuItems = (page.sections || []).filter(s => s.inMenu);
  const accent = (page.theme && page.theme.accent) || tkc("amber");

  return (
    <div data-screen-label="Studio · Site" style={{ position: "absolute", inset: 0, paddingTop: 72, overflowY: "auto" }}>
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "8px 40px 96px" }}>

        {/* ── Masthead ── */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, padding: "26px 0 22px", borderBottom: "1px solid var(--c-line)", marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", fontWeight: 600, marginBottom: 10 }}>YOUR PUBLIC SITE</div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{page.studioName || "Your studio"}.</h1>
            <div className="t-mono" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: published ? "var(--c-good)" : "var(--c-amber)", boxShadow: published ? "0 0 7px var(--c-good)" : "none" }}></span>
              {published ? "LIVE" : "DRFT — NOT PUBLISHED"} · VOSS.CINA · {(page.sections || []).length} SECTIONS · {menuItems.length} IN MENU
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="index.html#/creator/voss" className="btn" style={{ height: 36, padding: "0 16px", fontSize: "var(--fs-body)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>View live site</a>
            <a href="index.html#/build" className="btn btn-primary" style={{ height: 36, padding: "0 16px", fontSize: "var(--fs-body)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>Open page builder →</a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 18, alignItems: "start" }}>
          {/* ── LEFT — sections + menu ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <SpCard eyebrow="01 · SECTIONS & MENU" title="Page structure."
              sub="Rename a section, toggle it into the site menu, or reorder. The menu is built from these — it updates everywhere instantly.">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {(page.sections || []).map((s, i) => (
                  <div key={s.id} style={{
                    display: "grid", gridTemplateColumns: "24px 1fr auto auto", gap: 12, alignItems: "center",
                    padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--c-line)",
                  }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div style={{ minWidth: 0 }}>
                      <input value={s.title || ""} placeholder={s.type}
                        onChange={e => setSection(s.id, { title: e.target.value })}
                        style={{ ...spInp, border: "1px solid transparent", background: "transparent", padding: "3px 6px", marginLeft: -6, fontSize: "var(--fs-body)", fontWeight: 500 }}
                        onFocus={e => { e.target.style.border = "1px solid var(--c-line-2)"; e.target.style.background = "var(--c-bg)"; }}
                        onBlur={e => { e.target.style.border = "1px solid transparent"; e.target.style.background = "transparent"; }}/>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textTransform: "uppercase", marginLeft: 1 }}>{s.type}</div>
                    </div>
                    <label className="t-mono" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: s.inMenu ? "var(--c-amber)" : "var(--c-ink-4)", cursor: "pointer", userSelect: "none" }}>
                      <input type="checkbox" checked={!!s.inMenu} onChange={e => setSection(s.id, { inMenu: e.target.checked })} style={{ accentColor: tkc("amber") }}/>
                      MENU
                    </label>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => moveSection(s.id, -1)} style={{ ...spBtn, padding: "4px 8px" }}>↑</button>
                      <button onClick={() => moveSection(s.id, 1)} style={{ ...spBtn, padding: "4px 8px" }}>↓</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Menu preview */}
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--c-bg)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>MENU PREVIEW</span>
                {menuItems.length
                  ? menuItems.map(s => <span key={s.id} className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)", textTransform: "uppercase", fontWeight: 600 }}>{s.title || s.type}</span>)
                  : <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)" }}>Nothing flagged — the site falls back to auto-detected sections.</span>}
              </div>
            </SpCard>

            {/* Store — live products from the Store manager */}
            <SpCard eyebrow="02 · STORE" title="Products."
              sub="Live from your Store. Create and edit products there; they appear on the site automatically.">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {liveProducts.length === 0 && (
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", padding: "6px 0 2px" }}>No products yet.</div>
                )}
                {liveProducts.map((pr) => (
                  <div key={pr.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 12, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--c-line)" }}>
                    <span style={{ width: 40, height: 40, borderRadius: "var(--r-2)", background: pr.swatch || "var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-lead)", overflow: "hidden" }}>
                      {pr.images && pr.images[0] ? <img src={pr.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : (pr.glyph || "\uD83D\uDED2")}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pr.title || "Untitled"}</div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>{(pr.type || "ITEM").toUpperCase()} · {(pr.variants || []).length} VARIANTS{pr.source === "printful" ? " · PRINTFUL" : ""}</div>
                    </div>
                    <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{spMoney(pr.price)}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", padding: "3px 8px", borderRadius: 999, color: pr.status === "active" ? "var(--c-good)" : "var(--c-ink-4)", border: `1px solid ${pr.status === "active" ? "rgba(95,165,106,.4)" : "var(--c-line-2)"}` }}>{(pr.status || "draft").toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </SpCard>

            {/* Notebook — live published posts from the Notebook writer */}
            <SpCard eyebrow="03 · NOTEBOOK" title="Posts."
              sub="Live from your Notebook. Write and publish there; posts show on your site and in subscriber inboxes.">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {livePosts.length === 0 && (
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", padding: "6px 0 2px" }}>No posts yet.</div>
                )}
                {livePosts.map((po) => (
                  <div key={po.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--c-line)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: po.status === "published" ? "var(--c-good)" : "var(--c-amber)", flexShrink: 0 }}></span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{po.title || "Untitled"}</div>
                      {po.dek && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{po.dek}</div>}
                    </div>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", whiteSpace: "nowrap" }}>{po.status === "published" ? (spFmtDate(po.date).toUpperCase() + " · " + spReadMins(po) + " MIN") : "DRAFT"}</span>
                  </div>
                ))}
              </div>
            </SpCard>

            {/* Inbox — contact messages + newsletter subscribers from the live site */}
            <SpCard eyebrow="04 · INBOX" title="Messages & subscribers."
              sub="Notes sent through your site's contact form, and newsletter signups — nothing collects into the void.">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
                  <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>✉</span>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}><b style={{ color: "var(--c-ink)" }}>{inbox.subscribers.length}</b> newsletter subscriber{inbox.subscribers.length === 1 ? "" : "s"}</span>
                  {inbox.subscribers[0] && <span className="t-mono" style={{ marginLeft: "auto", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>LATEST · {inbox.subscribers[0].email}</span>}
                </div>
                {inbox.messages.length === 0 && (
                  <div style={{ padding: "14px 12px", fontSize: "var(--fs-body)", color: "var(--c-ink-4)", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", lineHeight: 1.5 }}>
                    No messages yet. Notes sent through your site's contact form land here.
                  </div>
                )}
                {inbox.messages.slice(0, 5).map((m) => (
                  <div key={m.at} style={{ padding: "10px 12px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 600 }}>{m.name || "Anonymous"}</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</span>
                      <span className="t-mono" style={{ marginLeft: "auto", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", whiteSpace: "nowrap" }}>{new Date(m.at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>
                    {m.msg && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4, lineHeight: 1.5 }}>{m.msg}</div>}
                  </div>
                ))}
              </div>
            </SpCard>

          </div>

          {/* ── RIGHT — identity + theme + publish ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <SpCard eyebrow="IDENTITY" title="Name & logo.">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>STUDIO NAME</span>
                  <input value={page.studioName || ""} onChange={e => update(p => { p.studioName = e.target.value; if (p.logo && p.logo.kind !== "image") p.logo.text = e.target.value; return p; })} style={spInp}/>
                </label>
                <div style={{ padding: "18px 16px", background: page.theme.bg, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {page.logo && page.logo.kind === "image" && page.logo.src
                    ? <img src={page.logo.src} alt="logo" style={{ height: 34 }}/>
                    : page.logo && page.logo.kind === "monogram"
                      ? <span style={{ width: 36, height: 36, borderRadius: "50%", background: accent, color: page.theme.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{(page.logo.text || "V")[0]}</span>
                      : <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: page.theme.ink }}>{(page.logo && page.logo.text) || page.studioName}</span>}
                </div>
                <a href="index.html#/build" className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textDecoration: "none" }}>✸ LOGO STUDIO — WORDMARK · MONOGRAM · AI →</a>
              </div>
            </SpCard>

            <SpCard eyebrow="THEME" title="Colors.">
              <div style={{ display: "flex", gap: 8 }}>
                {[["bg", "Page"], ["ink", "Ink"], ["accent", "Accent"]].map(([k, label]) => (
                  <label key={k} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, cursor: "pointer" }}>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</span>
                    <input type="color" value={page.theme[k]} onChange={e => update(p => { p.theme[k] = e.target.value; return p; })}
                      style={{ width: "100%", height: 38, border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", background: "var(--c-bg)", padding: 2, cursor: "pointer" }}/>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{page.theme[k]}</span>
                  </label>
                ))}
              </div>
            </SpCard>

            <SpCard eyebrow="PUBLISH" title={published ? "Your site is live." : "Ready when you are."} accent={published ? "var(--c-good)" : "var(--c-amber)"}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, marginBottom: 12 }}>
                {published
                  ? "Edits here save instantly and show on voss.cina. Reorder freely — the menu follows."
                  : "Changes save as a draft. Publish from the page builder to put voss.cina live."}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="index.html#/creator/voss" style={{ ...spBtn, textDecoration: "none" }}>Preview</a>
                <a href="index.html#/build" style={{ ...spBtn, textDecoration: "none", background: "var(--c-amber)", color: "var(--c-on-amber)", border: "none", fontWeight: 700 }}>{published ? "Open builder" : "Publish in builder"}</a>
              </div>
            </SpCard>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StudioSitePanel });
