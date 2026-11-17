// watch-shell.jsx — Top nav, release banner, alerts bell, route store, primitives.

const { useState: usw, useEffect: uew, useMemo: umw, useRef: urw, useCallback: ucw } = React;

// ─── Route store ─────────────────────────────────────────────────────────
// Hash-based: #/   #/film/ll   #/series/ll/ep/5   #/creator/voss
//             #/nft/voss-ll   #/wallet   #/wallet/holdings   #/wallet/governance
//             #/wallet/market/voss-ll   #/genre/horror   #/search?q=
function parseHash() {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  const [path, qs] = h.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(qs || ""));
  return { parts, params, raw: h };
}
// Watch scrolls <body>, not the window, so window.scrollTo alone leaves the
// old offset in place and a shorter new page opens at its bottom.
function cinaScrollTop() {
  try {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const m = document.getElementById("main-content"); if (m) m.scrollTop = 0;
  } catch (e) {}
}
function useRoute() {
  const [r, setR] = usw(parseHash());
  uew(() => {
    const onHash = () => {
      const next = parseHash();
      setR(prev => {
        // Any time the page (path) changes, jump to the top so users never
        // land mid-page or at the bottom of a freshly-opened route.
        const prevPath = (prev.parts || []).join("/");
        const nextPath = (next.parts || []).join("/");
        if (prevPath !== nextPath) {
          cinaScrollTop();
          // Re-assert after paint and after lazy content mounts.
          requestAnimationFrame(cinaScrollTop);
          setTimeout(cinaScrollTop, 120);
        }
        return next;
      });
    };
    window.addEventListener("hashchange", onHash);
    // On first load, start at the top too.
    cinaScrollTop();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return r;
}
function navigate(to) { window.location.hash = "#" + to; }

// ─── Currency / number formatting ────────────────────────────────────────
const fmtUSD = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 });
const fmtETH = (n) => n.toFixed(n < 0.1 ? 4 : 3) + " ETH";
const fmtViews = (n) => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? Math.round(n/1e3)+"K" : ""+n;
const fmtCount = (n) => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : ""+n;
const fmtPct  = (n, d=1) => (n>=0?"+":"") + n.toFixed(d) + "%";

// Today is set so Last Light Ep 6 (2026-05-15) reads as ~3 days out
const NOW = new Date("2026-05-12T14:00:00");
function timeUntilFromNow(iso) {
  const ms = new Date(iso) - NOW;
  if (ms <= 0) return { live: true, label: "LIVE", urgent: true };
  const days = Math.floor(ms / 86400000);
  const hrs  = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 7) return { live: false, label: `${days}d`, days, urgent: false };
  if (days > 0) return { live: false, label: `${days}d ${hrs}h`, days, hrs, urgent: days <= 1 };
  return { live: false, label: `${hrs}h ${mins}m`, hrs, mins, urgent: true };
}

// ─── Top nav ─────────────────────────────────────────────────────────────
function TopNav() {
  const route = useRoute();
  if (typeof useSession === "function") useSession();
  if (typeof window.useChainLedger === "function") window.useChainLedger();
  const [menuOpen, setMenuOpen] = usw(false);
  const isMobile = useIsMobile();
  const navCollapsed = useIsMobile(1240);

  const part0 = route.parts[0] || "";
  const onSplash = part0 === "" || part0 === "browse";
  const inWallet = part0 === "wallet";

  const navTabs = [
    { id: "home",     label: "Home",          to: "/" },
    { id: "films",    label: "Films",         to: "/genre/film" },
    { id: "series",   label: "Series",        to: "/genre/series" },
    { id: "branched", label: "Branched",      to: "/branches" },
    { id: "parties",  label: "Watch Parties", to: "/rooms" },
    { id: "festival", label: "Festivals",     to: "/festival" },
    { id: "mylist",   label: "My List",       to: "/watchlist" },
  ];
  const isActive = (to) => {
    if (to === "/") return onSplash;
    if (to === "/genre/film" && (route.parts[0] === "catalog" || route.parts[0] === "film")) return true;
    if (to === "/genre/series" && route.parts[0] === "series") return true;
    if (to.startsWith("/genre/")) return route.parts[0] === "genre" && route.parts[1] === to.split("/")[2];
    if (to === "/branches") return route.parts[0] === "branches";
    if (to === "/rooms") return route.parts[0] === "rooms" || route.parts[0] === "party";
    if (to === "/festival") return route.parts[0] === "festival";
    if (to === "/watchlist") return ["watchlist", "library", "history", "taste"].includes(route.parts[0]);
    return false;
  };

  return (
    <>
      <UnifiedTopNav
        surface="watch"
        onWordmark={() => { navigate("/"); setMenuOpen(false); }}
        wallet={null}
        bell={null}
        accountBalance={SESSION.signedIn ? { label: "wallet", value: fmtUSD(USER.walletUSD), sub: USER.address, onClick: () => navigate("/wallet") } : null}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            {!isMobile && (
              <>
                <button
                  onClick={() => window.openWatchCmdK ? window.openWatchCmdK() : (window.toggleCinaAtlas && window.toggleCinaAtlas(true))}
                  title="Search films, directors, cast (⌘K)"
                  aria-label="Search cinema catalog"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.45rem",
                    height: "2.15rem", padding: "0 0.7rem",
                    background: "rgba(255,255,255,.04)", border: "1px solid var(--c-line-2)",
                    color: "var(--c-ink-3)", cursor: "pointer", borderRadius: 0,
                    fontFamily: "var(--f-sans)", fontSize: "var(--fs-label)",
                    transition: "border-color .14s ease, color .14s ease, background .14s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-line-3)"; e.currentTarget.style.color = "var(--c-ink)"; e.currentTarget.style.background = "rgba(255,255,255,.07)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.color = "var(--c-ink-3)"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
                >
                  <Icon name="search" size={14}/>
                  <span>Search</span>
                </button>
                <button
                  onClick={() => window.toggleCinaAtlas && window.toggleCinaAtlas(true)}
                  title="Open Cina Workspace Atlas (⌘K)"
                  aria-label="Open Cina Workspace Atlas"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    height: "2.15rem", padding: "0 0.7rem",
                    background: "rgba(255,255,255,.04)", border: "1px solid var(--c-line-2)",
                    color: "var(--c-ink-3)", cursor: "pointer", borderRadius: 0,
                    fontFamily: "var(--f-sans)", fontSize: "var(--fs-label)",
                    transition: "border-color .14s ease, color .14s ease, background .14s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.color = "var(--c-ink)"; e.currentTarget.style.background = "rgba(var(--accent-rgb),.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line-2)"; e.currentTarget.style.color = "var(--c-ink-3)"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
                >
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--c-amber)" }}>Cina</span>
                  <span>Workspace</span>
                  <span className="t-mono" style={{ fontSize: "0.64rem", color: "var(--c-ink-4)", letterSpacing: ".06em" }}>⌘K</span>
                </button>
              </>
            )}
            {navCollapsed && (
              <button
                className="btn-ghost btn-icon"
                style={{ width: "2.2rem", height: "2.2rem" }}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Open navigation menu"
              >
                <Icon name={menuOpen ? "x" : "apps"} size={17}/>
              </button>
            )}
          </div>
        }
      >
        {!navCollapsed && (
          <nav style={{ display: "flex", alignItems: "stretch", height: "100%", padding: "0 0.35rem", gap: "0.15rem" }}>
            {navTabs.map(t => {
              const active = isActive(t.to);
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(t.to)}
                  style={{
                    position: "relative",
                    height: "100%", padding: "0 0.72rem",
                    fontSize: "var(--fs-body)", fontWeight: active ? 600 : 450,
                    color: active ? "var(--c-ink)" : "var(--c-ink-3)",
                    background: "transparent", border: "none", borderRadius: 0,
                    cursor: "pointer", transition: "color .14s ease",
                    fontFamily: "var(--f-sans)", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--c-ink)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--c-ink-3)"; }}
                >
                  {t.label}
                  {active && (
                    <span style={{
                      position: "absolute", left: "0.72rem", right: "0.72rem", bottom: 0,
                      height: 2, background: "var(--c-amber)", borderRadius: 0,
                    }}/>
                  )}
                </button>
              );
            })}
          </nav>
        )}
      </UnifiedTopNav>
      {navCollapsed && (
        <MobileNavDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          navItems={navTabs}
          isActive={isActive}
        />
      )}
    </>
  );
}
// ─── Search bar ──────────────────────────────────────────────────────────
function SearchBar({ open, setOpen }) {
  const [q, setQ] = usw("");
  const inputRef = urw(null);

  uew(() => { if (open) inputRef.current?.focus(); }, [open]);

  const matches = umw(() => {
    if (!q.trim()) return [];
    const ql = q.toLowerCase();
    return CATALOG.filter(f =>
      f.title.toLowerCase().includes(ql) ||
      f.creator.toLowerCase().includes(ql) ||
      f.genre.some(g => g.toLowerCase().includes(ql)) ||
      f.logline.toLowerCase().includes(ql)
    ).slice(0, 8);
  }, [q]);

  if (!open) {
    return (
      <button
        className="btn-ghost btn-icon"
        style={{ width: 36, height: 36 }}
        onClick={() => setOpen(true)}
      ><Icon name="search" size={16}/></button>
    );
  }

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 40 }}
      />
      <div style={{ position: "relative", zIndex: 41, width: 360 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          height: 36, padding: "0 12px",
          background: "var(--c-panel-2)",
          border: "1px solid var(--c-line-2)",
          borderRadius: "var(--r-3)",
          boxShadow: q ? "0 12px 36px rgba(0,0,0,.6)" : "none",
        }}>
          <Icon name="search" size={14}/>
          <input
            ref={inputRef}
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setQ(""); setOpen(false); }
              if (e.key === "Enter" && q.trim()) { const qq = q.trim(); setQ(""); setOpen(false); navigate(`/search?q=${encodeURIComponent(qq)}`); }
            }}
            placeholder="Search films, studios, genres…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "var(--c-ink)", fontSize: "var(--fs-body)",
            }}
          />
          <button onClick={() => { setQ(""); setOpen(false); }} className="btn-ghost btn-icon" style={{ width: 22, height: 22 }}>
            <Icon name="x" size={12}/>
          </button>
        </div>

        {matches.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            background: "var(--c-panel)",
            border: "1px solid var(--c-line-2)",
            borderRadius: "var(--r-2)",
            boxShadow: "0 24px 60px rgba(0,0,0,.7)",
            overflow: "hidden",
            maxHeight: 480, overflowY: "auto",
          }}>
            {matches.map(f => (
              <button
                key={f.id}
                onClick={() => { setOpen(false); setQ(""); navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`); }}
                className="btn-ghost"
                style={{
                  width: "100%", height: "auto", padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 12,
                  borderRadius: 0, justifyContent: "flex-start", textAlign: "left",
                }}
              >
                <div style={{
                  width: 56, height: 36, background: f.color,
                  borderRadius: "var(--r-1)", flexShrink: 0, overflow: "hidden",
                }}>
                  <FrameThumb kind={f.thumb}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="t-display" style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{f.title}</span>
                    {f.kind === "series" && (
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", padding: "1px 4px", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)" }}>SERIES</span>
                    )}
                  </div>
                  <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {f.creator} · {f.genre[0]} · {f.year}
                  </div>
                </div>
                <Icon name="chev-r" size={12}/>
              </button>
            ))}
            <button
              onClick={() => { const qq = q.trim(); setOpen(false); setQ(""); navigate(`/search?q=${encodeURIComponent(qq)}`); }}
              className="btn-ghost"
              style={{
                width: "100%", height: "auto", padding: "10px 12px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderRadius: 0, borderTop: "1px solid var(--c-line)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color:  "var(--c-amber)",
              }}
            >ALL RESULTS FOR “{q.trim().toUpperCase()}” <Icon name="chev-r" size={11}/></button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Alerts dropdown ─────────────────────────────────────────────────────
function AlertsDropdown({ onClose }) {
  const iconFor = (kind) => kind === "drop" ? "play" : kind === "royalty" ? "coin" : kind === "premiere" ? "spark" : kind === "follow" ? "user" : "bell";
  const colorFor = (kind) => kind === "royalty" ? "var(--c-good)" : kind === "drop" ? "var(--c-amber)" : kind === "premiere" ? "var(--c-blood-l)" : "var(--c-ink-2)";

  // Canon decisions from the director's Branch map, personalized against
  // THIS viewer's recorded fork choices.
  const canonAlerts = (() => {
    try {
      const evs = JSON.parse(localStorage.getItem("cina:canon-events") || "[]");
      return evs.slice(0, 5).map(ev => {
        const film = (window.CATALOG || []).find(f => f.id === ev.filmId);
        let mine = null;
        try { const ch = JSON.parse(localStorage.getItem("cina:fork-choices:" + ev.filmId) || "{}"); mine = ch["bd_" + ev.rootId] || Object.values(ch)[0] || null; } catch (e) {}
        const won = mine && mine === ev.letter;
        return {
          kind: won ? "royalty" : "drop", filmId: ev.filmId, ts: ev.ts, id: ev.id,
          text: won
            ? `Your path won — the director made Path ${ev.letter} canon${ev.sceneNum ? ` at scene ${ev.sceneNum}` : ""} in ${film ? film.title : "a film"}. You called it.`
            : mine
            ? `The director went the other way — Path ${ev.letter} is now canon in ${film ? film.title : "a film"} (you chose ${mine}). Your cut still exists.`
            : `Path ${ev.letter} is now canon in ${film ? film.title : "a film"} — chosen by the audience.`,
        };
      });
    } catch (e) { return []; }
  })();
  const allAlerts = [...canonAlerts, ...USER.alerts];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }}/>
      <div style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 380, zIndex: 41,
        background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)",
        boxShadow: "0 24px 60px rgba(0,0,0,.7)",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid var(--c-line)",
        }}>
          <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>Alerts</span>
          <button className="btn-ghost" style={{ height: 22, padding: "0 8px", fontSize: "var(--fs-label)" }} onClick={markAllNotifsRead}>Mark all read</button>
        </div>
        <div style={{ maxHeight: 460, overflowY: "auto" }}>
          {allAlerts.map((a, i) => {
            const unread = !isNotifRead(a);
            return (
            <button
              key={i}
              onClick={() => {
                markNotifRead(a);
                onClose();
                if (a.filmId) navigate(`/film/${a.filmId}`);
                else if (a.creatorId) navigate(`/creator/${a.creatorId}`);
                else if (a.projectId) navigate(`/nft/${a.projectId}`);
              }}
              className="btn-ghost"
              style={{
                width: "100%", padding: "12px 16px",
                display: "flex", alignItems: "flex-start", gap: 12,
                borderRadius: 0, justifyContent: "flex-start", textAlign: "left",
                borderBottom: "1px solid var(--c-line)",
                height: "auto",
                background: a.urgent ? "rgba(var(--accent-rgb),.04)" : "transparent",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--c-panel-2)",
                border: `1px solid ${colorFor(a.kind)}40`,
                color: colorFor(a.kind),
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon name={iconFor(a.kind)} size={14}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.4 }}>{a.text}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3, letterSpacing: ".08em" }}>
                  {a.d === "now" ? "JUST NOW" : a.d.toUpperCase()}
                  {a.urgent && <span style={{ color: "var(--c-blood-l)", marginLeft: 8 }}>● UPCOMING</span>}
                </div>
              </div>
            </button>
            );
          })}
        </div>
        <button
          onClick={() => { onClose(); navigate("/wallet"); }}
          className="btn-ghost"
          style={{
            width: "100%", height: 36,
            justifyContent: "center",
            color: "var(--c-amber)", fontSize: "var(--fs-body)",
            borderRadius: 0,
            background: "var(--c-panel-2)",
          }}
        >View all activity →</button>
      </div>
    </>
  );
}

// ─── Profile menu ────────────────────────────────────────────────────────
function ProfileMenu({ onClose }) {
  const signedIn = SESSION.signedIn;
  const items = signedIn ? [
    { label: "Library",                  to: "/library" },
    { label: "Taste print",              to: "/taste" },
    { label: "Watchlist",                to: "/watchlist" },
    { label: "Watch history",            to: "/history" },
    { label: "Wallet & holdings",       to: "/wallet" },
    { label: "Buy crypto",                to: "/wallet/buy" },
    { label: "Payouts (creators)",        to: "/payouts" },
    { label: "Leaderboard",               to: "/leaderboard" },
    null,
    { label: "Festival programme",        to: "/festival" },
    { label: "Royalty pool",              to: "/royalty" },
    { label: "Holder rooms",              to: "/rooms" },
    null,
    { custom: "kid" },
    { label: "Switch to Studio",         href: "Cina.html", external: true },
    { label: "Producer Market",          href: "Producers.html", external: true },
    null,
    { label: "Account & billing",        to: "/account" },
    { label: "Sign out",                 action: () => { signOut(); navigate("/"); } },
  ] : [
    { custom: "signin" },
    null,
    { label: "Browse home",              to: "/" },
    { label: "Films",                    to: "/genre/film" },
    { label: "Series",                   to: "/genre/series" },
    { label: "Producers",                to: "/producers" },
    null,
    { label: "Festival programme",        to: "/festival" },
    { label: "Royalty pool",              to: "/royalty" },
    null,
    { label: "Switch to Studio",         href: "Cina.html", external: true },
    { label: "Producer Market",          href: "Producers.html", external: true },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }}/>
      <div style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 240, zIndex: 41,
        background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)",
        boxShadow: "0 24px 60px rgba(0,0,0,.7)",
        overflow: "hidden",
      }}>
        {signedIn ? (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--c-line)" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{SESSION.handle || USER.ens}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{SESSION.email || USER.address}</div>
          </div>
        ) : (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--c-line)" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>Welcome to Cina</div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2, lineHeight: 1.4 }}>Sign in to save films, track royalties, and join watch parties.</div>
          </div>
        )}
        {items.map((it, i) => it === null ? (
          <div key={i} style={{ height: 1, background: "var(--c-line)", margin: "4px 0" }}/>
        ) : it.custom === "kid" ? (
          <div key={i} style={{ padding: "6px 8px" }}><KidModeToggle/></div>
        ) : it.custom === "signin" ? (
          <div key={i} style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn btn-primary" style={{ height: 32, justifyContent: "center", fontSize: "var(--fs-body)" }} onClick={() => { onClose(); openSignIn(); }}>Sign in</button>
            <button className="btn-ghost" style={{ height: 28, justifyContent: "center", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }} onClick={() => { onClose(); openSignIn({ tab: "signup" }); }}>Create account</button>
          </div>
        ) : (
          <button
            key={i}
            onClick={() => {
              onClose();
              if (it.action) it.action();
              else if (it.external) window.location.href = it.href;
              else if (it.to) navigate(it.to);
            }}
            className="btn-ghost"
            style={{
              width: "100%", height: 32, padding: "0 16px",
              justifyContent: "flex-start", borderRadius: 0,
              fontSize: "var(--fs-body)", color: "var(--c-ink-2)",
            }}
          >{it.label}{it.external && <span style={{ marginLeft: "auto", fontSize: "var(--fs-label)" }}>↗</span>}</button>
        ))}
      </div>
    </>
  );
}

// ─── Release-day banner ──────────────────────────────────────────────────
// Shows ONLY on splash (home), and only if there's an upcoming drop within ~7 days
// or one releasing today. Persistently dismissible per-session via state.
function ReleaseBanner() {
  const [dismissed, setDismissed] = usw(false);
  const [narrow, setNarrow] = usw(() => window.innerWidth <= 767);
  const route = useRoute();
  uew(() => {
    const h = () => setNarrow(window.innerWidth <= 767);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);

  // Find next drop user is following (followed creator OR film in watchlist)
  const upcoming = umw(() => {
    const items = [];
    CATALOG.forEach(f => {
      if (!USER.followingCreators.includes(f.creatorId) && !USER.watchlist.includes(f.id)) return;
      if (f.kind === "series") {
        const next = f.series?.find(e => e.status === "scheduled");
        if (next) items.push({ film: f, ep: next, dropISO: next.drop + "T19:00:00" });
      } else if (f.nftPremiere) {
        // imaginary; skip for now
      }
    });
    items.sort((a, b) => new Date(a.dropISO) - new Date(b.dropISO));
    return items[0];
  }, []);

  // Hide if not splash / not upcoming / dismissed
  const onSplash = (route.parts[0] || "") === "" || route.parts[0] === "browse";
  if (!onSplash || dismissed || !upcoming) return null;

  const t = timeUntilFromNow(upcoming.dropISO);
  if (t.days != null && t.days > 7) return null;

  const film = upcoming.film;
  const isToday = t.urgent && (t.days == null || t.days === 0);

  return (
    <div style={{
      position: "relative",
      background: isToday
        ? "linear-gradient(90deg, rgba(201,85,72,.20) 0%, rgba(123,45,38,.10) 50%, transparent 100%)"
        : "linear-gradient(90deg, rgba(var(--accent-rgb),.10) 0%, rgba(var(--accent-rgb),.03) 50%, transparent 100%)",
      borderBottom: "1px solid var(--c-line)",
      padding: narrow ? "6px 16px" : "6px 28px",
      display: "flex", alignItems: "center", gap: narrow ? 8 : 12,
      minHeight: 32,
      overflow: "hidden",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "2px 7px",
        background: isToday ? "rgba(201,85,72,.20)" : "rgba(var(--accent-rgb),.10)",
        border: `1px solid ${isToday ? "rgba(201,85,72,.4)" : "rgba(var(--accent-rgb),.25)"}`,
        borderRadius: "var(--r-1)",
        fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700,
        color: isToday ? "var(--c-blood-l)" : "var(--c-amber)", letterSpacing: ".16em",
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {isToday && <span className="rec-dot"/>}
        {isToday ? "DROPPING TODAY" : "UPCOMING"}
      </span>
      <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)", letterSpacing: "-0.01em", whiteSpace: "nowrap", flexShrink: 0, ...(narrow && { overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }) }}>
        {film.title}
      </span>
      {!narrow && film.kind === "series" && (
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flexShrink: 1 }}>
          S{String(film.season).padStart(2,"0")}·E{String(upcoming.ep.ep).padStart(2,"0")} · {upcoming.ep.title}
        </span>
      )}
      <span style={{ flex: 1 }}/>
      {!narrow && (
        <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", fontWeight: 600, letterSpacing: ".08em", whiteSpace: "nowrap", flexShrink: 0 }}>
          in {t.label}
        </span>
      )}
      <button
        className="btn-ghost"
        style={{
          height: 22, padding: "0 8px", fontSize: "var(--fs-label)",
          fontFamily: "var(--f-mono)", letterSpacing: ".16em", fontWeight: 600,
          color: "var(--c-amber)", whiteSpace: "nowrap", flexShrink: 0,
        }}
        onClick={() => navigate(film.kind === "series" ? `/series/${film.id}` : `/film/${film.id}`)}
      >
        {isToday ? "WATCH →" : "REMIND"}
      </button>
      <button onClick={() => setDismissed(true)} className="btn-ghost btn-icon" style={{ width: 20, height: 20, color: "var(--c-ink-3)" }}>
        <Icon name="x" size={10}/>
      </button>
    </div>
  );
}

// ─── Toast (bottom-right, agent-attributed) ──────────────────────────────
const __wToasts = { items: [], setters: new Set() };
function toast(opts) {
  return cinaToast(opts);
}
function ToastHost() {
  return null;
}

// ─── Bell icon (added to primitives.jsx Icon set without touching it) ───
const _origIcon = window.Icon;
window.Icon = function(p) {
  if (p.name === "bell") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5z"/>
      <path d="M10 20a2 2 0 0 0 4 0"/>
    </svg>
  );
  if (p.name === "user") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>
    </svg>
  );
  if (p.name === "coin") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="12" cy="12" r="9"/><path d="M9 9h5a2 2 0 0 1 0 4H9v4h6"/>
    </svg>
  );
  if (p.name === "heart") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={p.className}>
      <path d="M12 21s-7-4.5-9-9c-1.5-3.4 1-7 4.5-7 1.7 0 3 .9 4.5 2.5C13.5 5.9 14.8 5 16.5 5c3.5 0 6 3.6 4.5 7-2 4.5-9 9-9 9z"/>
    </svg>
  );
  if (p.name === "share") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>
      <path d="M9 11l6-3M9 13l6 3"/>
    </svg>
  );
  if (p.name === "ticket") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/>
      <path d="M9 6v12" strokeDasharray="2 2"/>
    </svg>
  );
  if (p.name === "cart") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 4h2l3 13h11l2-9H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/>
    </svg>
  );
  if (p.name === "vol") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/>
    </svg>
  );
  if (p.name === "captions") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 12h3M14 12h3M7 16h3M14 16h3"/>
    </svg>
  );
  if (p.name === "fullscreen") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>
    </svg>
  );
  if (p.name === "calendar") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  );
  if (p.name === "trend-up") return (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
      <path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>
    </svg>
  );
  return _origIcon(p);
};

Object.assign(window, { useRoute, navigate, fmtUSD, fmtViews, fmtCount, fmtPct, timeUntilFromNow, NOW, TopNav, ReleaseBanner, ToastHost, toast });

window.cinaScrollTop = cinaScrollTop;
