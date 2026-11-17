// cina-notifs.jsx — One notification store for the whole building.
//
// Watch had an `AlertsDropdown` reading from static `USER.alerts`.
// Producers had `ProducerNotifBell` with its own localStorage model.
// Studio and Pitch had no bell at all.
// This module unifies them: one localStorage key, one React hook,
// one `<CinaNotifDropdown>` component that swaps into every surface's
// `<UnifiedTopNav bell={…}>`, and a full `<CinaNotifPage>` for Watch's
// `/notifications` route.
//
// Loaded after cina-identity.jsx, before each surface's shell:
//   index.html (Watch) · Cina.html (Studio) · Producers.html
//
// Public API (all on window.*):
//   cinaNotifs(surface?)       → array, newest first, optionally filtered
//   cinaAddNotif(n)            → add / dedupe (by n.id), persist
//   cinaMarkRead(id)           → mark one read
//   cinaMarkAllRead(surface?)  → mark all read, optional surface scope
//   cinaUnreadCount(surface?)  → number
//   useCinaNotifs(surface?)    → React hook — { notifs, unread, markRead, markAllRead }

const NOTIFS_KEY = "cina:notifs";
const NOTIFS_MAX = 80;

// ─── Persistence helpers ──────────────────────────────────────────────
function _nLoad() {
  try { const r = localStorage.getItem(NOTIFS_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function _nSave(arr) {
  try { localStorage.setItem(NOTIFS_KEY, JSON.stringify(arr.slice(0, NOTIFS_MAX))); } catch {}
}
let _nCache = null;
function _get() { if (!_nCache) _nCache = _nLoad(); return _nCache; }
function _set(arr) { _nCache = arr; _nSave(arr); _nBroadcast(); }
function _nBroadcast() { window.dispatchEvent(new Event("cina-notifs-updated")); }

// ─── Seed from legacy models (runs once on load) ──────────────────────
function _nSeedFromLegacy() {
  const existing = new Set(_get().map(n => n.id));

  // Watch USER.alerts → shared store
  const alerts = (window.USER && window.USER.alerts) || [];
  const fromWatch = alerts.map(a => ({
    id: "w-" + (a.filmId || "") + "-" + (a.ts || a.t || ""),
    surface: "watch", kind: a.kind || "drop",
    title: a.title || a.head || "New alert",
    sub: a.sub || a.body || "",
    t: a.ts || a.t || (Date.now() - Math.random() * 864e5),
    read: false,
    href: a.filmId ? "#/film/" + a.filmId : null,
  })).filter(n => n.id && !existing.has(n.id));

  if (fromWatch.length) {
    const merged = [...fromWatch, ..._get()]
      .sort((a, b) => b.t - a.t)
      .slice(0, NOTIFS_MAX);
    _set(merged);
  }
}

// ─── Public store API ─────────────────────────────────────────────────
function cinaNotifs(surface) {
  const all = _get();
  return surface ? all.filter(n => !n.surface || n.surface === surface || n.surface === "all") : all;
}

function cinaAddNotif(n) {
  if (!n || !n.id) return;
  const prev = _get().filter(x => x.id !== n.id);
  _set([{ surface: "all", read: false, t: Date.now(), ...n }, ...prev]);
}

function cinaMarkRead(id) {
  _set(_get().map(n => n.id === id ? { ...n, read: true } : n));
}

function cinaMarkAllRead(surface) {
  _set(_get().map(n =>
    (!surface || !n.surface || n.surface === surface || n.surface === "all")
      ? { ...n, read: true } : n
  ));
}

function cinaUnreadCount(surface) {
  return cinaNotifs(surface).filter(n => !n.read).length;
}

Object.assign(window, { cinaNotifs, cinaMarkRead, cinaMarkAllRead, cinaUnreadCount });

// ─── React hook ───────────────────────────────────────────────────────
const { useState: useCN, useEffect: useCNEff, useCallback: useCNCb } = React;

function useCinaNotifs(surface) {
  const [notifs, setNotifs] = useCN(() => cinaNotifs(surface));
  useCNEff(() => {
    const refresh = () => setNotifs(cinaNotifs(surface));
    window.addEventListener("cina-notifs-updated", refresh);
    return () => window.removeEventListener("cina-notifs-updated", refresh);
  }, [surface]);
  const markRead    = useCNCb(id => { cinaMarkRead(id); }, []);
  const markAllRead = useCNCb(() => { cinaMarkAllRead(surface); }, [surface]);
  const unread = notifs.filter(n => !n.read).length;
  return { notifs, unread, markRead, markAllRead };
}
// ─── Icon + colour look-up ─────────────────────────────────────────────
const N_ICONS = {
  drop:    "play", royalty: "coin",  premiere: "spark",
  publish: "globe", render: "wand", bid: "trend",
  claim:   "wallet", sale: "ticket", follow: "user", outbid: "bell",
};
const N_COLORS = {
  royalty: "var(--c-good)", claim: "var(--c-good)", publish: "var(--c-good)",
  render: "var(--c-amber)", drop: "var(--c-amber)", premiere: "var(--c-blood-l)",
  bid: "var(--c-amber)", outbid: "var(--c-blood-l)", sale:  "var(--c-amber)",
};
const _nIcon  = k => N_ICONS[k]  || "bell";
const _nColor = k => N_COLORS[k] || "var(--c-ink-2)";

function _ago(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// ─── Shared dropdown content ──────────────────────────────────────────
function CinaNotifDropdown({ surface, onClose }) {
  const { notifs, unread, markRead, markAllRead } = useCinaNotifs(surface);
  const goNotif = (n) => {
    markRead(n.id);
    onClose && onClose();
    if (n.href) { window.location.hash = n.href.replace(/^#/, ""); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px 10px", borderBottom: "1px solid var(--c-line)", flexShrink: 0 }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)" }}>NOTIFICATIONS</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ appearance: "none", background: "transparent", border: 0, color: "var(--c-amber)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer", letterSpacing: ".16em", padding: 0 }}>
              MARK ALL READ
            </button>
          )}
          {surface === "watch" && (
            <button onClick={() => { onClose && onClose(); window.location.hash = "#/notifications"; }} style={{ appearance: "none", background: "transparent", border: 0, color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer", letterSpacing: ".16em", padding: 0 }}>
              ALL →
            </button>
          )}
        </div>
      </div>
      {/* List */}
      <div style={{ overflowY: "auto", maxHeight: 440, flex: 1 }}>
        {notifs.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "var(--fs-title)", marginBottom: 8, opacity: .4 }}>🔔</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>You're all caught up.</div>
          </div>
        ) : notifs.map(n => (
          <button key={n.id} onClick={() => goNotif(n)} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            width: "100%", padding: "11px 16px", border: "none", textAlign: "left",
            cursor: "pointer", background: n.read ? "transparent" : "rgba(var(--accent-rgb),.06)",
            borderBottom: "1px solid var(--c-line)", color: "inherit", transition: "background .12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--c-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : "rgba(var(--accent-rgb),.06)"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              background: _nColor(n.kind) + "22", border: `1px solid ${_nColor(n.kind)}44`,
              color: _nColor(n.kind), display: "flex", alignItems: "center", justifyContent: "center",
            }}><Icon name={_nIcon(n.kind)} size={13}/></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: n.read ? 400 : 500, lineHeight: 1.3 }}>{n.title}</div>
              {n.sub && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.4 }}>{n.sub}</div>}
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 4 }}>{_ago(n.t)}</div>
            </div>
            {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", flexShrink: 0, marginTop: 6 }}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
// ─── Full page (Watch /notifications) ────────────────────────────────
function CinaNotifPage() {
  const { notifs, unread, markRead, markAllRead } = useCinaNotifs("watch");
  const [filter, setFilter] = useCN("all");

  const kinds = ["all", "drop", "premiere", "royalty", "publish", "render", "follow"];
  const filtered = filter === "all" ? notifs : notifs.filter(n => n.kind === filter);

  const goNotif = (n) => {
    markRead(n.id);
    if (n.href && window.navigate) window.navigate(n.href.replace(/^#\//, "/"));
    else if (n.href) window.location.hash = n.href.replace(/^#/, "");
  };

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      {window.PmMasthead ? <PmMasthead bare index="Account" path="Notifications" count={`${unread} unread`} title="Notifications" lede="Drops, premieres, royalties and renders from Watch, Studio and Producers.">
        {unread > 0 && <button onClick={markAllRead} className="pm-btn">Mark all read</button>}
      </PmMasthead> : <h1>Notifications</h1>}

      <div className="pm-mast__tools" style={{ margin: "18px 0 8px" }}>
        {kinds.map(k => <button key={k} className="pm-chip" data-on={filter === k ? "1" : "0"} onClick={() => setFilter(k)}>{k === "all" ? "All" : k.charAt(0).toUpperCase() + k.slice(1)}</button>)}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="bell" title="Nothing here yet" body={filter === "all" ? "Notifications from Watch, Studio and Producers show up here." : `No ${filter} notifications yet.`}/>
      ) : (
        <div className="pm-index" style={{ marginTop: 20 }}>
          {filtered.map(n => (
            <button key={n.id} onClick={() => goNotif(n)} style={{ gridTemplateColumns: "44px minmax(0,1fr) auto", alignItems: "start" }}>
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: _nColor(n.kind) + "1c", color: _nColor(n.kind), display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={_nIcon(n.kind)} size={16}/></span>
              <span style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                <span className="pm-k" style={{ color: _nColor(n.kind) }}>{n.kind || "alert"}</span>
                <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "clamp(19px,1.6vw,24px)", lineHeight: 1.2, color: n.read ? "var(--c-ink-2)" : "var(--c-ink)" }}>{n.title}</span>
                {n.sub && <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{n.sub}</span>}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="pm-k">{_ago(n.t)}</span>
                {!n.read && <span aria-label="Unread" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)" }}></span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
window.CinaNotifPage = CinaNotifPage;

// ─── Seed on load ─────────────────────────────────────────────────────
_nSeedFromLegacy();

// ─── Real triggers ────────────────────────────────────────────────────
// Wrap shipMaster on Studio to fire a publish notification.
// This runs after cina-state.jsx, so shipMaster is already on window.
(function _patchShipMaster() {
  const _orig = window.shipMaster;
  if (!_orig) return;
  window.shipMaster = function(opts) {
    _orig(opts);
    const proj = window.getActiveProject && window.getActiveProject();
    cinaAddNotif({
      id: "pub-" + Date.now(),
      surface: "all",
      kind: "publish",
      title: `${(proj && proj.title) || "Your film"} is live on Watch`,
      sub: "Your master is published. Check the dashboard for first views and royalties.",
      t: Date.now(),
      href: null,
    });
  };
})();

// Patch autopilot render-complete toast to also fire a notification.
(function _patchRenderComplete() {
  const _origToast = window.toast;
  if (!_origToast) return;
  window.toast = function(opts) {
    _origToast(opts);
    if (opts && opts.kind === "good" && opts.title && /render|generated|complete/i.test(opts.title)) {
      cinaAddNotif({
        id: "render-" + Date.now(),
        surface: "studio",
        kind: "render",
        title: opts.title,
        sub: opts.text || "Ready in the Generate panel.",
        t: Date.now(),
      });
    }
  };
})();
