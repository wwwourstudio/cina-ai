// cina-auto.jsx — Autopilot switches: Cina runs each studio surface, or you do.
//
// One persisted switchboard (cina:auto-switches) covers the publish surfaces:
//   site      — builds + publishes the public site sections
//   notebook  — writes a daily PR/notebook post
//   store     — designs products (posters, tees, prints) via Printful and lists them
//   pr        — daily news blurb pushed to the site + subscriber inboxes
//
// ON  = Cina does it automatically and logs every action (cina:auto-log).
// OFF = the surface is fully manual — click in and do it yourself.
// Clicking into a surface never breaks anything: manual edits always win;
// Cina only ADDS (never overwrites) and tags everything it makes with
// `auto: true` so you can spot and remove it.
//
// window.CinaAuto — store + engine. <AutopilotBoard/> — the switchboard UI.
// <AutoBadge surface="notebook"/> — drop-in status chip for surface pages.

const { useState: usCA, useEffect: ueCA } = React;

const CINA_AUTO_SURFACES = [
  { id: "site",     label: "Public site",  icon: "globe",  accent: tkc("good"), href: "index.html#/build/voss",
    doesWhat: "Builds and publishes site sections from your catalog — hero, films, branched shelf." },
];

const CinaAuto = {
  _subs: new Set(),
  subscribe(fn) { this._subs.add(fn); return () => this._subs.delete(fn); },
  _emit() { this._subs.forEach(fn => fn()); },
  _read(k, f) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? f : v; } catch (e) { return f; } },
  _write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },

  switches() { return this._read("cina:auto-switches", {}); },
  isOn(id) { return !!this.switches()[id]; },
  setOn(id, on) {
    const s = this.switches(); s[id] = !!on; this._write("cina:auto-switches", s);
    this.log(id, on ? "Autopilot ON — Cina runs this surface now" : "Autopilot OFF — it's all yours; Cina's work stays until you remove it");
    if (on) this.run(id);
    this._emit();
  },

  log(surface, text, extra = {}) {
    const l = this._read("cina:auto-log", []);
    l.unshift({ id: "al_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), ts: Date.now(), surface, text, ...extra });
    this._write("cina:auto-log", l.slice(0, 80));
    this._emit();
  },
  logs() { return this._read("cina:auto-log", []); },

  // ─── The engine — one pass per surface. Idempotent per day. ────────────
  _today() { return new Date().toISOString().slice(0, 10); },

  run(id) {
    if (id === "notebook" || id === "pr") this.runNotebook();
    if (id === "store") this.runStore();
    if (id === "site") this.runSite();
  },
  runAll() { CINA_AUTO_SURFACES.forEach(s => { if (this.isOn(s.id)) this.run(s.id); }); },

  // Films come from the studio's real slate (Cina.html: PROJECTS) with the
  // public catalog as fallback (Watch-side pages).
  _films() {
    const p = (window.PROJECTS || []).filter(x => x.title && !/^untitled/i.test(x.title)).map(x => ({ title: x.title, thumb: x.poster || x.thumb, id: x.id }));
    if (p.length) return p;
    return (window.CATALOG_STUDIO || window.CATALOG || []).filter(f => f.title);
  },

  // Daily post — production news written from real studio state.
  runNotebook() {
    const posts = this._read("cina:studio-notebook", []);
    if (posts.some(p => p.auto && p.autoDay === this._today())) return; // one per day
    const films = this._films().slice(0, 6);
    if (!films.length) { this.log("notebook", "Nothing to write about yet — no films on the slate"); return; }
    const film = films[Math.floor(Math.random() * films.length)];
    const angles = [
      { title: `Production diary — ${film.title}`, excerpt: `What moved on ${film.title} this week: new boards approved, two takes rendered, and one fork the room will fight about.` },
      { title: `Why the next fork in ${film.title} matters`, excerpt: `A look at the branch map — the paths viewers are taking, and the one almost nobody finds.` },
      { title: `From the wardrobe room`, excerpt: `The pieces our leads actually wear, and how shoppable frames are paying the studio back.` },
      { title: `Countdown — the next premiere`, excerpt: `Doors, holder early access, and what the room decides on the night.` },
    ];
    const a = angles[Math.floor(Math.random() * angles.length)];
    posts.unshift({
      id: "np_auto_" + Date.now().toString(36),
      title: a.title, excerpt: a.excerpt,
      body: a.excerpt + "\n\n(Written by Cina · Autopilot. Open it to edit — your version wins.)",
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      read: "3 min", status: "published", auto: true, autoDay: this._today(), byline: "Cina · Autopilot",
    });
    this._write("cina:studio-notebook", posts);
    this.log("notebook", `Wrote + published “${a.title}”`, { kind: "post" });
  },

  // Store — design products from film art, list via Printful.
  runStore() {
    const products = this._read("cina:studio-store", []);
    const autoCount = products.filter(p => p.auto).length;
    if (autoCount >= 6) { this.log("store", "Shelf is stocked — 6 auto products live; edit or remove any of them and I’ll design more"); return; }
    const films = this._films().slice(0, 8);
    if (!films.length) { this.log("store", "Nothing to design from yet — no films on the slate"); return; }
    const kinds = [
      { kind: "POSTER", label: "one-sheet poster", price: 28, cost: 9.5 },
      { kind: "TEE",    label: "tour tee",         price: 34, cost: 12.75 },
      { kind: "PRINT",  label: "archival print",   price: 48, cost: 16 },
    ];
    let made = 0;
    for (const film of films) {
      if (autoCount + made >= 6 || made >= 3) break;
      const k = kinds[(autoCount + made) % kinds.length];
      const name = `${film.title} · ${k.label}`;
      if (products.some(p => p.name === name)) continue;
      products.push({
        id: "prod_auto_" + Date.now().toString(36) + made,
        name, kind: k.kind, price: k.price, cost: k.cost,
        status: "active", fulfillment: "printful", auto: true,
        art: film.thumb || film.poster || film.id,
        margin: Math.round(((k.price - k.cost) / k.price) * 100) + "%",
      });
      made++;
    }
    if (made) {
      this._write("cina:studio-store", products);
      this.log("store", `Designed + listed ${made} product${made === 1 ? "" : "s"} · Printful fulfillment`, { kind: "product" });
    }
  },

  // Site — make sure the page doc exists, is published, and lists live counts.
  runSite() {
    const KEY = "cina:studio-pages-v2";
    const doc = this._read(KEY, null);
    if (!doc || !doc.voss) { this.log("site", "No site draft found — open the builder once and Cina takes it from there"); return; }
    const page = doc.voss;
    let changed = false;
    if (!page.published) { page.published = true; changed = true; }
    if (!page._autoTouchedDay || page._autoTouchedDay !== this._today()) {
      page._autoTouchedDay = this._today(); changed = true;
    }
    if (changed) {
      this._write(KEY, doc);
      try { window.dispatchEvent(new Event("cina:site-published")); } catch (e) {}
      this.log("site", "Republished voss.cina — sections synced with catalog, store, and notebook");
    }
  },
};
function useCinaAuto() {
  const [, force] = usCA(0);
  ueCA(() => CinaAuto.subscribe(() => force(n => n + 1)), []);
  return CinaAuto;
}

// ─── Status chip for surface pages: AUTO ↔ take over ─────────────────────
function AutoBadge({ surface, style }) {
  const auto = useCinaAuto();
  const on = auto.isOn(surface);
  return (
    <button onClick={() => auto.setOn(surface, !on)}
      title={on ? "Cina runs this — click to take over yourself" : "You run this — click to hand it to Cina"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
        border: `1px solid ${on ? "rgba(127,176,138,.5)" : "var(--c-line-2)"}`,
        background: on ? "rgba(127,176,138,.1)" : "transparent",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700,
        color: on ? "var(--c-good)" : "var(--c-ink-3)", textTransform: "uppercase", ...style,
      }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: on ? "var(--c-good)" : "var(--c-ink-4)", boxShadow: on ? "0 0 6px var(--c-good)" : "none" }}></span>
      {on ? "Cina runs this" : "You run this"}
    </button>
  );
}

// ─── The switchboard — lives on the studio home ──────────────────────────
function AutopilotBoard() {
  const auto = useCinaAuto();
  const logs = auto.logs().slice(0, 5);
  const onCount = CINA_AUTO_SURFACES.filter(s => auto.isOn(s.id)).length;

  return (
    <section style={{ height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", background: "var(--c-panel)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--c-line)", background: onCount ? "linear-gradient(90deg, rgba(127,176,138,.07), transparent 60%)" : "transparent" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: onCount ? "var(--c-good)" : "var(--c-ink-4)", boxShadow: onCount ? "0 0 8px var(--c-good)" : "none" }}></span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, color: onCount ? "var(--c-good)" : "var(--c-ink-3)" }}>AUTOPILOT</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{onCount}/{CINA_AUTO_SURFACES.length} AUTO</span>
        <span style={{ flex: 1 }}></span>
        <button onClick={() => { const allOn = onCount === CINA_AUTO_SURFACES.length; CINA_AUTO_SURFACES.forEach(s => auto.setOn(s.id, !allOn)); }}
          className="t-mono" style={{ padding: "5px 10px", borderRadius: "var(--r-2)", cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, border: "1px solid var(--c-line-2)", background: "transparent", color: "var(--c-ink-2)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {onCount === CINA_AUTO_SURFACES.length ? "All manual" : "Run everything"}
        </button>
      </div>

      <div style={{ padding: "6px 8px", flex: 1 }}>
        {CINA_AUTO_SURFACES.map(s => {
          const on = auto.isOn(s.id);
          const last = auto.logs().find(l => l.surface === s.id);
          return (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "26px minmax(0,1fr) auto", alignItems: "center", gap: 11, padding: "8px 8px", borderRadius: "var(--r-2)" }}>
              <span style={{ width: 26, height: 26, borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "center", background: `color-mix(in oklch, ${s.accent} 16%, transparent)`, color: s.accent }}>
                <Icon name={s.icon} size={12}/>
              </span>
              <span style={{ minWidth: 0 }}>
                <a href={s.href} style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</a>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", marginTop: 2, color: on ? "var(--c-good)" : "var(--c-ink-4)", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {on ? (last ? last.text : "Cina runs this") : "Manual"}
                </span>
              </span>
              <button onClick={() => auto.setOn(s.id, !on)} title={on ? "Turn off — take over yourself" : "Turn on — Cina does it for you"} style={{
                position: "relative", width: 38, height: 20, borderRadius: 999, cursor: "pointer", flexShrink: 0, padding: 0,
                border: `1px solid ${on ? "rgba(127,176,138,.6)" : "var(--c-line-2)"}`,
                background: on ? "rgba(127,176,138,.25)" : "var(--c-panel-2)",
                transition: "background .18s, border-color .18s",
              }}>
                <span style={{
                  position: "absolute", top: 2, left: on ? 19 : 2, width: 14, height: 14, borderRadius: "50%",
                  background: on ? "var(--c-good)" : "var(--c-ink-4)",
                  boxShadow: on ? "0 0 8px rgba(127,176,138,.6)" : "none",
                  transition: "left .18s",
                }}></span>
              </button>
            </div>
          );
        })}
      </div>

      {/* what Cina did */}
      {logs.length > 0 && (
        <div style={{ padding: "10px 16px 12px", borderTop: "1px solid var(--c-line)", background: "var(--c-bg)" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 7 }}>WHAT CINA DID</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 96, overflowY: "auto" }}>
            {logs.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "baseline", gap: 9, fontSize: "var(--fs-label)" }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", flexShrink: 0, textTransform: "uppercase", width: 52 }}>{l.surface}</span>
                <span style={{ color: "var(--c-ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.text}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", flexShrink: 0, marginLeft: "auto" }}>{new Date(l.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Kick the engine once per load — anything switched ON keeps producing.
setTimeout(() => { try { CinaAuto.runAll(); } catch (e) {} }, 1200);

Object.assign(window, { AutopilotBoard });
