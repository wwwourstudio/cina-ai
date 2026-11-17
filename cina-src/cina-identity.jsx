// cina-identity.jsx — ONE Cina ID + User Settings & Display Mood across every surface.

const { useState: useIdState, useEffect: useIdEffect, useRef: useIdRef } = React;

// ─── Display Mood & Appearance Store (lives exclusively in User Settings) ──
const CINA_MOODS_META = [
  { id: "premiere",   label: "Premiere",   sub: "Cinema black · lab red",      bg: "#0a0a0a", ink: "#f3efe8", accent: "#e5482f" },
  { id: "programmer", label: "Programmer", sub: "Booth slate · warm amber",    bg: "#0d0e10", ink: "#e8e3d6", accent: "#e8a33d" },
  { id: "darkroom",   label: "Darkroom",   sub: "Safelight oxblood · silver",  bg: "#0a0807", ink: "#efd9c8", accent: "#d24a3a" },
  { id: "midnight",   label: "Midnight",   sub: "Nocturne steel · cold cyan",  bg: "#07090d", ink: "#dde6f2", accent: "#7eb6ff" },
  { id: "daylight",   label: "Daylight",   sub: "Archival cream · warm bronze", bg: "#f3eee2", ink: "#1a1812", accent: "#b46a1f" },
];

const CINA_VOICES_META = [
  { id: "quiet",    label: "Quiet",    sub: "Minimal chrome, shelves first" },
  { id: "magazine", label: "Magazine", sub: "Editorial default" },
  { id: "loud",     label: "Loud",     sub: "Monumental widescreen scale" },
];

const CINA_MOTIONS_META = [
  { id: "still",    label: "Still",    sub: "Static frames, zero grain" },
  { id: "restless", label: "Restless", sub: "Subtle Ken-Burns drift" },
  { id: "cinema",   label: "Cinema",   sub: "35mm grain & projector pulse" },
];

const _appSubs = new Set();
const CinaAppearance = {
  get() {
    let mood = "premiere", voice = "magazine", motion = "restless";
    try {
      const m = localStorage.getItem("cina:mood");
      if (m && CINA_MOODS_META.some(x => x.id === m)) mood = m;
      const v = localStorage.getItem("cina:voice");
      if (v && CINA_VOICES_META.some(x => x.id === v)) voice = v;
      const mo = localStorage.getItem("cina:motion");
      if (mo && CINA_MOTIONS_META.some(x => x.id === mo)) motion = mo;
    } catch (_) {}
    return { mood, voice, motion };
  },
  applyToDOM(next) {
    const cur = next || this.get();
    if (document.body) {
      document.body.dataset.cinaMood = cur.mood;
      document.body.dataset.cinaVoice = cur.voice;
      document.body.dataset.cinaMotion = cur.motion;
    }
    document.documentElement.dataset.mood = cur.mood;
    document.documentElement.dataset.theme = cur.mood === "daylight" ? "light" : "dark";
    if (window.CINA_TOKENS && window.CINA_TOKENS.setThemeColor) {
      window.CINA_TOKENS.setThemeColor();
    }
  },
  set(patch) {
    const cur = { ...this.get(), ...patch };
    try {
      localStorage.setItem("cina:mood", cur.mood);
      localStorage.setItem("cina:voice", cur.voice);
      localStorage.setItem("cina:motion", cur.motion);
    } catch (_) {}
    this.applyToDOM(cur);
    _appSubs.forEach(fn => fn(cur));
    window.dispatchEvent(new CustomEvent("cina:appearance-changed", { detail: cur }));
  },
};
CinaAppearance.applyToDOM();

function useCinaAppearance() {
  const [st, setSt] = useIdState(() => CinaAppearance.get());
  useIdEffect(() => {
    _appSubs.add(setSt);
    const onStorage = () => setSt(CinaAppearance.get());
    window.addEventListener("storage", onStorage);
    return () => { _appSubs.delete(setSt); window.removeEventListener("storage", onStorage); };
  }, []);
  return [st, (patch) => CinaAppearance.set(patch)];
}

// ─── Persistence ──────────────────────────────────────────────────────
const CINA_KEY = "cina:identity";
const LEGACY = { signedIn: "cina:signed-in", email: "cina:email", handle: "cina:handle" };

function _idLoad() {
  try {
    const raw = localStorage.getItem(CINA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  let legacySigned = null, legacyHandle = "", legacyEmail = "";
  try {
    const s = localStorage.getItem(LEGACY.signedIn);
    if (s != null) legacySigned = JSON.parse(s);
    legacyHandle = JSON.parse(localStorage.getItem(LEGACY.handle) || '""');
    legacyEmail  = JSON.parse(localStorage.getItem(LEGACY.email)  || '""');
  } catch {}
  return {
    signedIn: legacySigned == null ? true : !!legacySigned,
    handle:   legacyHandle || "you.eth",
    email:    legacyEmail  || "",
  };
}

const _persisted = _idLoad();

const CINA = {
  signedIn: _persisted.signedIn,
  handle:   _persisted.handle  || "you.eth",
  ens:      "you.cina.eth",
  email:    _persisted.email   || "",
  address:  "0xA1c4…f3D2",
  tier:     "Patron",
  joined:   "2025-09",
  walletUSD: 28_413,
};

function _idSave() {
  try {
    localStorage.setItem(CINA_KEY, JSON.stringify({
      signedIn: CINA.signedIn, handle: CINA.handle, email: CINA.email,
    }));
    localStorage.setItem(LEGACY.signedIn, JSON.stringify(CINA.signedIn));
    localStorage.setItem(LEGACY.handle, JSON.stringify(CINA.handle));
    localStorage.setItem(LEGACY.email, JSON.stringify(CINA.email));
  } catch {}
}

// ─── Pub/sub ──────────────────────────────────────────────────────────
const _idSubs = new Set();
function bumpCina() { _idSubs.forEach(fn => fn(Date.now())); }
function useCinaId() {
  const [, setT] = useIdState(0);
  useIdEffect(() => {
    _idSubs.add(setT);
    const onTx = () => setT(Date.now());
    window.addEventListener("cina:chain-tx", onTx);
    return () => { _idSubs.delete(setT); window.removeEventListener("cina:chain-tx", onTx); };
  }, []);
  return CINA;
}

function cinaWallet() {
  const u = window.USER;
  if (u && typeof u.walletUSD === "number") return u.walletUSD;
  try {
    const saved = JSON.parse(localStorage.getItem("cina:chain:user-ledger") || "null");
    if (saved && typeof saved.walletUSD === "number") return saved.walletUSD;
  } catch (_) {}
  return CINA.walletUSD;
}
function cinaHoldingsCount() {
  const h = window.USER?.holdings;
  if (!Array.isArray(h)) return null;
  return h.filter(x => (x.qty || 0) > 0).length;
}
function cinaGlyph() { return (CINA.handle || "Y").trim().charAt(0).toUpperCase() || "Y"; }
function _idMoney(n) { return window.fmtUSD ? window.fmtUSD(n) : ("$" + Math.round(n || 0).toLocaleString("en-US")); }
function _idToast(o) { if (window.toast) window.toast(o); }
function _idDownload(name, text, mime) {
  try {
    const blob = new Blob([text], { type: mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) { _idToast({ title: "DOWNLOAD", text: "Couldn't start the download.", kind: "warn" }); }
}

const CINA_ACCT_KEY = "cina:account-prefs";
function _acctLoad() {
  try { return JSON.parse(localStorage.getItem(CINA_ACCT_KEY) || "{}"); } catch { return {}; }
}
function _acctSave(patch) {
  const next = { ..._acctLoad(), ...patch };
  try { localStorage.setItem(CINA_ACCT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

function cinaSync({ signedIn, handle, email } = {}) {
  if (signedIn != null) CINA.signedIn = !!signedIn;
  if (handle) CINA.handle = handle;
  if (email != null) CINA.email = email;
  _idSave();
  if (window.USER) window.USER.handle = CINA.handle;
  if (window.SESSION) {
    window.SESSION.signedIn = CINA.signedIn;
    window.SESSION.handle = CINA.handle;
    if (email != null) window.SESSION.email = CINA.email;
  }
  if (window.bumpSession) window.bumpSession();
  bumpCina();
}

function cinaSignIn({ email, handle, method } = {}) {
  const h = handle || (email ? email.split("@")[0] : CINA.handle) || "you.eth";
  cinaSync({ signedIn: true, handle: h, email: email || CINA.email });
  _idToast({ title: "WELCOME", text: `Signed in to Cina${method ? " · " + method : ""}`, kind: "good" });
}
function cinaSignOut() {
  cinaSync({ signedIn: false });
  if (window.CinaCloudAuth && typeof window.CinaCloudAuth.signOut === "function") {
    window.CinaCloudAuth.signOut().catch(() => {});
  }
  _idToast({ title: "SIGNED OUT", text: "Your Cina ID is signed out everywhere", kind: "info" });
}

const CINA_SURFACES = [
  { id: "watch",     label: "Watch",     sub: "Screenings & catalog", href: "index.html",     dot: "var(--c-good)" },
  { id: "studio",    label: "Studio",    sub: "Filmmaking pipeline",  href: "Cina.html",      dot: "var(--c-amber)" },
  { id: "producers", label: "Producers", sub: "Smart-contract market",href: "Producers.html", dot: `var(--c-blood, ${tkc("cat-3")})` },
];

let _cinaSignInOpener = null;
function registerCinaSignIn(fn) { _cinaSignInOpener = fn; }
function openCinaSignIn(opts) {
  if (window.CinaAuth) { window.CinaAuth.open(opts || {}); return; }
  if (window.openSignIn && window.SESSION) { window.openSignIn(opts || {}); return; }
  if (_cinaSignInOpener) _cinaSignInOpener(opts || {});
}

let _cinaSettingsOpener = null;
function openCinaAccountSettings(tab = "profile") {
  if (_cinaSettingsOpener) _cinaSettingsOpener(tab);
}

function CinaSignInModal({ surface, accent = tkc("amber"), onClose }) {
  if (window.CinaAuthSheet) return <window.CinaAuthSheet ctx={{ surface, accent }} onClose={onClose}/>;
  return null;
}

// ─── Reusable Display Mood & Appearance Section (for Account Drawer & #/account) ──
function AppearanceSection({ accent = "var(--c-amber)" }) {
  const [app, setApp] = useCinaAppearance();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--c-line)" }}>Display Mood · Color Theme</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr))", gap: "0.6rem" }}>
          {CINA_MOODS_META.map(m => {
            const on = app.mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setApp({ mood: m.id });
                  _idToast({ title: "DISPLAY MOOD", text: `${m.label} · ${m.sub}`, kind: "good" });
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem", width: "100%",
                  padding: "0.75rem 0.85rem", textAlign: "left", cursor: "pointer",
                  background: on ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel-2)",
                  border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                  borderRadius: "var(--r-2)", color: "var(--c-ink)",
                }}
              >
                <span style={{
                  width: "1.65rem", height: "1.65rem", borderRadius: "50%", flexShrink: 0,
                  background: m.bg, border: `2px solid ${m.accent}`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ width: "0.55rem", height: "0.55rem", borderRadius: "50%", background: m.accent }}/>
                </span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1, color: "var(--c-ink)" }}>{m.label}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.2rem" }}>{m.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.65rem", paddingBottom: "0.45rem", borderBottom: "1px solid var(--c-line)" }}>Editorial Density</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
          {CINA_VOICES_META.map(v => {
            const on = app.voice === v.id;
            return (
              <button key={v.id} type="button" onClick={() => setApp({ voice: v.id })} style={{
                padding: "0.65rem 0.7rem", textAlign: "left", cursor: "pointer",
                background: on ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel-2)",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-2)", color: "var(--c-ink)",
              }}>
                <div style={{ fontSize: "var(--fs-body)", fontWeight: on ? 600 : 500 }}>{v.label}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.18rem", lineHeight: 1.3 }}>{v.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.65rem", paddingBottom: "0.45rem", borderBottom: "1px solid var(--c-line)" }}>Projection Motion</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
          {CINA_MOTIONS_META.map(m => {
            const on = app.motion === m.id;
            return (
              <button key={m.id} type="button" onClick={() => setApp({ motion: m.id })} style={{
                padding: "0.65rem 0.7rem", textAlign: "left", cursor: "pointer",
                background: on ? "rgba(var(--accent-rgb),.10)" : "var(--c-panel-2)",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                borderRadius: "var(--r-2)", color: "var(--c-ink)",
              }}>
                <div style={{ fontSize: "var(--fs-body)", fontWeight: on ? 600 : 500 }}>{m.label}</div>
                <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.18rem", lineHeight: 1.3 }}>{m.sub}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Universal account panel ──────────────────────────────────────────
const CINA_ACCT_TABS = [
  { id: "profile",    label: "Profile" },
  { id: "appearance", label: "Display" },
  { id: "studio",     label: "Studio" },
  { id: "wallet",     label: "Wallet" },
  { id: "billing",    label: "Billing" },
  { id: "security",   label: "Security" },
  { id: "alerts",     label: "Alerts" },
  { id: "privacy",    label: "Privacy" },
];

function _acctField() {
  return {
    width: "100%", boxSizing: "border-box", padding: "0.65rem 0.8rem",
    background: tkc("panel-2"), border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
    color: tkc("ink"), fontSize: "var(--fs-body)", fontFamily: "inherit", outline: "none",
  };
}

function CinaAcctLabel({ children }) {
  return <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: "0.45rem" }}>{children}</div>;
}

function CinaAcctToggle({ label, hint, on, onToggle, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{label}</div>
        {hint && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: "0.15rem", lineHeight: 1.4 }}>{hint}</div>}
      </div>
      <button onClick={onToggle} role="switch" aria-checked={!!on} aria-label={label} style={{
        width: "2.5rem", height: "1.4rem", borderRadius: "var(--r-full)", padding: "0.12rem", flexShrink: 0,
        background: on ? accent : "var(--c-panel-2)",
        border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
        cursor: "pointer", position: "relative", transition: "background .15s, border-color .15s",
      }}>
        <div style={{
          width: "1rem", height: "1rem", borderRadius: "50%",
          background: on ? tkc("void") : "var(--c-ink-3)",
          transform: on ? "translateX(1.1rem)" : "translateX(0)", transition: "transform .15s ease",
        }}/>
      </button>
    </div>
  );
}

function BillingSheet({ kind, accent, card, tier, cardLast4, tiers, onClose, onChoose, onSaveCard }) {
  const [num, setNum] = useIdState("");
  const [exp, setExp] = useIdState("");
  const [cvc, setCvc] = useIdState("");
  const sheetField = {
    width: "100%", boxSizing: "border-box", padding: "0.65rem 0.8rem",
    background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
    color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)", outline: "none",
  };
  const title = kind === "card" ? "Payment method" : kind === "manage" ? "Manage plan" : "Choose a plan";
  const numClean = num.replace(/\D/g, "");
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(0,0,0,.5)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxHeight: "86%", overflowY: "auto", background: "var(--c-panel)", borderTop: "1px solid var(--c-line-2)", padding: "1.3rem 1.4rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{title}</div>
          <button onClick={onClose} aria-label="Close" title="Close" className="btn-ghost btn-icon" style={{ width: "1.8rem", height: "1.8rem" }}><Icon name="x" size={12}/></button>
        </div>
        {kind === "card" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div><CinaAcctLabel>Card number</CinaAcctLabel><input value={num} onChange={e => setNum(e.target.value)} placeholder="4242 4242 4242 4242" style={sheetField}/></div>
            <div style={{ display: "flex", gap: "0.65rem" }}>
              <div style={{ flex: 1 }}><CinaAcctLabel>Expiry</CinaAcctLabel><input value={exp} onChange={e => setExp(e.target.value)} placeholder="MM / YY" style={sheetField}/></div>
              <div style={{ width: "35%" }}><CinaAcctLabel>CVC</CinaAcctLabel><input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" style={sheetField}/></div>
            </div>
            <button onClick={() => onSaveCard(num)} disabled={numClean.length < 4} style={{ height: "2.6rem", borderRadius: "var(--r-2)", marginTop: "0.25rem", background: accent, color: "var(--c-on-amber)", border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: numClean.length < 4 ? "not-allowed" : "pointer", opacity: numClean.length < 4 ? .5 : 1 }}>SAVE CARD</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {tiers.map(p => {
              const current = p.id === tier;
              return (
                <div key={p.id} style={{ ...card, padding: "0.9rem 1rem", borderColor: current ? accent : "var(--c-line)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem" }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{p.id}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: current ? accent : "var(--c-ink-3)" }}>{p.price ? "$" + p.price + " / MO" : "FREE"}</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "0.4rem 0 0.75rem" }}>{p.blurb}</div>
                  <button onClick={() => onChoose(p.id)} disabled={current} style={{
                    width: "100%", height: "2.2rem", borderRadius: "var(--r-2)",
                    background: current ? "transparent" : (p.id === "Free" ? "transparent" : accent),
                    color: current ? "var(--c-good)" : (p.id === "Free" ? "var(--c-ink-2)" : tkc("on-amber")),
                    border: current ? "1px solid var(--c-good)" : (p.id === "Free" ? "1px solid var(--c-line-2)" : "none"),
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: current ? "default" : "pointer",
                  }}>{current ? "✓ CURRENT PLAN" : (p.id === "Free" ? "DOWNGRADE TO FREE" : "SWITCH TO " + p.id.toUpperCase())}</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CinaAccountPanel({ surface, accent = "var(--c-amber)", tab = "profile", onTab, onClose }) {
  useCinaId();
  const prefs = _acctLoad();
  const [name, setName]   = useIdState(CINA.handle || "");
  const [email, setEmail] = useIdState(CINA.email || "");
  const [role, setRole]   = useIdState(prefs.role || "Director");
  const [bio, setBio]     = useIdState(prefs.bio != null ? prefs.bio : "Building cinema on Cina.");
  const [saved, setSaved] = useIdState(false);
  const [alerts, setAlerts] = useIdState(prefs.alerts || { drops: true, royalties: true, social: true, marketing: false });
  const [privacy, setPrivacy] = useIdState(prefs.privacy || { history: false, recs: true, holdings: false });

  const [billingSheet, setBillingSheet] = useIdState(null);
  const [tier, setTier]           = useIdState(prefs.tier || CINA.tier);
  const [cardLast4, setCardLast4] = useIdState(prefs.cardLast4 || "4242");
  const [avatar, setAvatar]       = useIdState(prefs.avatar || null);
  const [conns, setConns]         = useIdState(prefs.connections || {});
  const [subs, setSubs]           = useIdState(prefs.subs || [
    { id: "voss", name: "Elias Voss", price: 8, renews: "Jul 12, 2026", accent: tkc("amber") },
    { id: "hara", name: "Hara Lin",   price: 6, renews: "Jul 3, 2026",  accent: tkc("cat-1") },
  ]);
  const avatarInputRef = useIdRef(null);
  const PLAN_TIERS = [
    { id: "Free",   price: 0,  blurb: "Watch with ads. Public catalog, watchlist, ratings." },
    { id: "Patron", price: 12, blurb: "Ad-free, 24h-early drops, holder rooms, priority render queue." },
    { id: "House",  price: 29, blurb: "Everything in Patron + 4K, offline, director's commentary, cinema mode." },
  ];
  const planPrice = (PLAN_TIERS.find(p => p.id === tier) || {}).price;
  const onAvatarFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setAvatar(r.result); _acctSave({ avatar: r.result }); _idToast({ title: "AVATAR", text: "New avatar saved.", kind: "good" }); };
    r.readAsDataURL(f);
  };
  const [studioPrefs, setStudioPrefs] = useIdState(() => Object.assign({
    autoSave: true,
    autoLock: true,
    renderQuality: "high",
    defaultChain: "base",
  }, prefs.studioPrefs || {}));
  const [twTick, setTwTick] = useIdState(0);
  const saveStudioPref = (k, v) => {
    const next = Object.assign({}, studioPrefs, { [k]: v });
    setStudioPrefs(next);
    _acctSave({ studioPrefs: next });
    _idToast({ title: "STUDIO PREFERENCE", text: `${k} updated.`, kind: "good" });
  };
  const choosePlan = (id) => {
    const p = PLAN_TIERS.find(x => x.id === id);
    const applyPlan = () => {
      CINA.tier = id; bumpCina(); setTier(id); _acctSave({ tier: id }); setBillingSheet(null);
      _idToast({ title: "PLAN UPDATED", text: id === "Free" ? "You're on the free plan." : `You're on ${id} · ${_idMoney(p.price)}/mo.`, kind: "good" });
    };
    if (p && p.price > 0 && typeof window.openPay === "function") {
      setBillingSheet(null);
      window.openPay({
        kind: "sub",
        title: `Cina ${id} Plan`,
        subtitle: p.blurb,
        priceUSD: p.price,
        recurring: "month",
        perks: [p.blurb, "Chained smart-contract split discounts", "Cancel or downgrade anytime"],
        onConfirm: applyPlan,
      });
      return;
    }
    applyPlan();
  };
  const saveCard = (raw) => {
    const clean = (raw || "").replace(/\D/g, "").slice(-4) || cardLast4;
    setCardLast4(clean); _acctSave({ cardLast4: clean }); setBillingSheet(null);
    _idToast({ title: "CARD UPDATED", text: "•••• " + clean + " is now your default.", kind: "good" });
  };
  const cancelSub = (s) => {
    const next = subs.filter(x => x.id !== s.id);
    setSubs(next); _acctSave({ subs: next });
    _idToast({ title: "SUBSCRIPTION CANCELLED", text: `${s.name} won't renew. Access until ${s.renews}.`, kind: "info" });
  };
  const toggleConn = (key, label) => {
    const next = { ...conns, [key]: !conns[key] };
    setConns(next); _acctSave({ connections: next });
    _idToast({ title: label.toUpperCase(), text: next[key] ? "Connected." : "Disconnected.", kind: next[key] ? "good" : "info" });
  };
  const downloadInvoice = (month, amt) => {
    const receipt = [
      "CINA — RECEIPT",
      "──────────────────────────────",
      "Billed to:  " + (CINA.handle || "you") + (CINA.email ? "  ·  " + CINA.email : ""),
      "Period:     " + month,
      "Plan:       " + tier + " (" + _idMoney(planPrice) + "/mo)",
      "Amount:     " + amt,
      "Card:       •••• " + cardLast4,
      "Status:     PAID",
    ].join("\n");
    _idDownload("cina-receipt-" + month.replace(/\s+/g, "-").toLowerCase() + ".txt", receipt, "text/plain");
    _idToast({ title: "RECEIPT", text: month + " receipt downloaded.", kind: "good" });
  };
  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { handle: CINA.handle, email: CINA.email, tier, walletAddress: CINA.address },
      subscriptions: subs,
      preferences: { alerts, privacy, connections: conns, appearance: CinaAppearance.get() },
      billing: { defaultCard: "•••• " + cardLast4 },
    };
    _idDownload("cina-data-export.json", JSON.stringify(payload, null, 2), "application/json");
    _idToast({ title: "EXPORT", text: "Your data archive downloaded.", kind: "good" });
  };
  const deleteAccount = async () => {
    if (window.cinaDeleteAccount) { onClose(); window.cinaDeleteAccount(); return; }
    cinaSignOut(); onClose();
  };

  useIdEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const field = _acctField();
  const glyph = (name || CINA.handle || "Y").trim().charAt(0).toUpperCase() || "Y";

  const saveProfile = () => {
    cinaSync({ handle: name.trim() || CINA.handle, email: email.trim() });
    _acctSave({ role, bio });
    setSaved(true); setTimeout(() => setSaved(false), 1800);
    _idToast({ title: "PROFILE SAVED", text: "Your Cina ID has been updated.", kind: "good" });
  };
  const toggleAlert = (k) => { const next = { ...alerts, [k]: !alerts[k] }; setAlerts(next); _acctSave({ alerts: next }); };
  const togglePrivacy = (k) => { const next = { ...privacy, [k]: !privacy[k] }; setPrivacy(next); _acctSave({ privacy: next }); };
  const goWallet = () => { onClose(); window.location.href = "index.html#/wallet"; };

  const card = { background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" };
  const sectionTitle = (t) => <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, textTransform: "uppercase", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--c-line)" }}>{t}</div>;

  return ReactDOM.createPortal((
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9710,
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
      display: "flex", justifyContent: "flex-end",
    }}>
      <style>{`@keyframes cinaAcctSlide{from{transform:translateX(6%);opacity:.6}to{transform:translateX(0);opacity:1}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(32rem, 100%)", height: "100%", display: "flex", flexDirection: "column",
        background: "var(--c-panel)", borderLeft: "1px solid var(--c-line-2)", position: "relative",
        boxShadow: "-24px 0 60px rgba(0,0,0,.55)", animation: "cinaAcctSlide .24s cubic-bezier(.2,.8,.2,1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 1.4rem", borderBottom: "1px solid var(--c-line)", flexShrink: 0 }}>
          <div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>User Settings</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: "0.2rem" }}>
              {CINA.signedIn ? `${(CINA.handle || "").toUpperCase()} · CINA ID` : "GUEST · SIGN IN OR CUSTOMIZE DISPLAY"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" title="Close" className="btn-ghost btn-icon" style={{ width: "2rem", height: "2rem" }}><Icon name="x" size={13}/></button>
        </div>

        {/* Architectural Underline Tabs (zero-radius, wrapped cleanly so nothing clips) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15rem 1.05rem", padding: "0 1.4rem", borderBottom: "1px solid var(--c-line)", flexShrink: 0 }}>
          {CINA_ACCT_TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => onTab(t.id)} style={{
                whiteSpace: "nowrap", padding: "0.7rem 0 0.6rem", cursor: "pointer",
                background: "transparent", border: "none", borderRadius: 0,
                borderBottom: `2px solid ${on ? accent : "transparent"}`,
                color: on ? "var(--c-ink)" : "var(--c-ink-3)",
                fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", fontWeight: on ? 600 : 450,
              }}>{t.label}</button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.35rem 1.4rem 2.25rem" }}>
          {tab === "appearance" && <AppearanceSection accent={accent}/>}

          {tab === "studio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
              <div>
                {sectionTitle("Studio workflow")}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <CinaAcctToggle accent={accent} label="Auto-save timeline & script" hint="Save every 30 seconds while editing scenes." on={studioPrefs.autoSave} onToggle={() => saveStudioPref("autoSave", !studioPrefs.autoSave)}/>
                  <CinaAcctToggle accent={accent} label="Auto-lock cuts" hint="Lock a cut automatically after 48 hours of no edits." on={studioPrefs.autoLock} onToggle={() => saveStudioPref("autoLock", !studioPrefs.autoLock)}/>
                </div>
              </div>
              <div>
                <CinaAcctLabel>Default render quality</CinaAcctLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.5rem" }}>
                  {["draft", "high", "ultra"].map(q => {
                    const on = studioPrefs.renderQuality === q;
                    return (
                      <button key={q} type="button" onClick={() => saveStudioPref("renderQuality", q)} style={{
                        padding: "0.55rem 0", fontSize: "var(--fs-label)", cursor: "pointer", borderRadius: 0,
                        background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
                        border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
                        color: on ? accent : "var(--c-ink-2)",
                        fontFamily: "var(--f-mono)", letterSpacing: ".14em", textTransform: "uppercase",
                      }}>{q}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <CinaAcctLabel>Default settlement chain</CinaAcctLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.45rem" }}>
                  {["base", "ethereum", "zora", "polygon"].map(c => {
                    const on = studioPrefs.defaultChain === c;
                    return (
                      <button key={c} type="button" onClick={() => saveStudioPref("defaultChain", c)} style={{
                        padding: "0.5rem 0", fontSize: "var(--fs-label)", cursor: "pointer", borderRadius: 0,
                        background: on ? "rgba(var(--accent-rgb),.12)" : "var(--c-panel-2)",
                        border: `1px solid ${on ? accent : "var(--c-line-2)"}`,
                        color: on ? accent : "var(--c-ink-2)",
                        fontFamily: "var(--f-mono)", letterSpacing: ".08em", textTransform: "uppercase",
                      }}>{c}</button>
                    );
                  })}
                </div>
              </div>
              {window.__cinaTweaks && window.__setCinaTweak && (
                <div>
                  {sectionTitle("Studio viewport & darkroom filters")}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <CinaAcctToggle accent={accent} label="2.39:1 Letterbox matte" hint="Cinema framing guides across preview monitors." on={!!window.__cinaTweaks.letterbox} onToggle={() => { window.__setCinaTweak("letterbox", !window.__cinaTweaks.letterbox); setTwTick(n => n + 1); }}/>
                    <CinaAcctToggle accent={accent} label="35mm film grain" hint="Subtle Kodak 5219 texture over rendered frames." on={!!window.__cinaTweaks.grain} onToggle={() => { window.__setCinaTweak("grain", !window.__cinaTweaks.grain); setTwTick(n => n + 1); }}/>
                    <CinaAcctToggle accent={accent} label="Monitor vignette" hint="Darken perimeter of playback canvases." on={!!window.__cinaTweaks.vignette} onToggle={() => { window.__setCinaTweak("vignette", !window.__cinaTweaks.vignette); setTwTick(n => n + 1); }}/>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {!CINA.signedIn && (
                <div style={{ ...card, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem" }}>
                  <div>
                    <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>You are browsing signed out</div>
                    <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: "0.15rem" }}>Sign in with Google, passkey, or wallet to sync stakes and studio vault.</div>
                  </div>
                  <button onClick={() => { onClose(); openCinaSignIn({ surface, accent }); }} style={{
                    padding: "0.55rem 1rem", background: accent, color: "var(--c-on-amber)", border: "none",
                    borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".14em", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  }}>SIGN IN</button>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "3.5rem", height: "3.5rem", borderRadius: "50%", flexShrink: 0,
                  background: "var(--c-panel-2)", border: `2px solid ${accent}`, color: accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500, overflow: "hidden",
                }}>{avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : glyph}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{name || CINA.handle}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: "0.15rem" }}>{role} · {CINA.tier} plan</div>
                  <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: "none" }}/>
                  <button className="t-mono" onClick={() => avatarInputRef.current && avatarInputRef.current.click()} style={{
                    marginTop: "0.4rem", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent,
                    background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)",
                    padding: "0.25rem 0.55rem", cursor: "pointer",
                  }}>CHANGE AVATAR</button>
                </div>
              </div>
              <div><CinaAcctLabel>Display name / ENS</CinaAcctLabel><input value={name} onChange={e => setName(e.target.value)} style={field}/></div>
              <div><CinaAcctLabel>Email</CinaAcctLabel><input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@domain.com" style={field}/></div>
              <div>
                <CinaAcctLabel>Primary role</CinaAcctLabel>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {["Director", "Writer", "Producer", "Editor", "Watcher"].map(r => (
                    <button key={r} onClick={() => setRole(r)} style={{
                      padding: "0.45rem 0.75rem", fontSize: "var(--fs-label)", cursor: "pointer", borderRadius: "var(--r-1)", fontFamily: "var(--f-sans)",
                      background: role === r ? "rgba(var(--accent-rgb),.10)" : "transparent",
                      border: `1px solid ${role === r ? accent : "var(--c-line-2)"}`,
                      color: role === r ? accent : "var(--c-ink-2)",
                    }}>{r}</button>
                  ))}
                </div>
              </div>
              <div><CinaAcctLabel>Bio</CinaAcctLabel><textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} style={{ ...field, resize: "vertical" }}/></div>
              <div>
                <CinaAcctLabel>Connected accounts</CinaAcctLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {(() => {
                    const cloudU = window.CinaCloudAuth?.getCurrentUser?.();
                    return [
                      {
                        key: "google",
                        name: "Google · Cloud SQL Vault",
                        value: cloudU ? (cloudU.email || cloudU.displayName || "Connected") : "Not connected",
                        connected: !!cloudU,
                        onAction: () => {
                          if (cloudU) {
                            window.CinaCloudAuth?.signOut?.().then(() => setSaved(s => !s));
                          } else {
                            window.CinaCloudAuth?.signInWithGoogle?.().then(() => _idToast({ title: "CLOUD VAULT", text: "Connected with Google.", kind: "good" })).catch(() => {});
                          }
                        },
                      },
                      { key: "wallet", name: "Base Smart Wallet", value: CINA.address, connected: true, primary: true },
                      { key: "x", name: "X / Twitter", value: "@" + (CINA.handle || "you").replace(/\..*$/, ""), connected: true, primary: true },
                      { key: "youtube", name: "YouTube", value: conns.youtube ? "Connected" : "Not connected", connected: !!conns.youtube },
                    ];
                  })().map(a => (
                    <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.55rem 0.8rem", ...card }}>
                      <div style={{ minWidth: 0, paddingRight: 8 }}>
                        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{a.name}</div>
                        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: a.connected ? "var(--c-ink-3)" : "var(--c-ink-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.value}</div>
                      </div>
                      <button onClick={() => a.onAction ? a.onAction() : a.primary ? _idToast({ title: a.name.toUpperCase(), text: "Primary connection — managed in Wallet.", kind: "info" }) : toggleConn(a.key, a.name)} className="t-mono" style={{
                        fontSize: "var(--fs-label)", letterSpacing: ".14em", color: a.connected ? "var(--c-ink-3)" : accent,
                        background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer", flexShrink: 0,
                      }}>{a.primary ? "PRIMARY" : (a.connected ? "DISCONNECT" : "CONNECT")}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "billing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div>
                {sectionTitle("Current plan")}
                <div style={{ ...card, padding: "1rem 1.1rem" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem" }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>{tier}</span>
                    <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent }}>{planPrice ? "$" + planPrice + " / MO" : "FREE"}</span>
                  </div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5, margin: "0.5rem 0 0.9rem" }}>
                    Early access to drops, smart-contract split discounts, holder rooms, and priority render queue.
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setBillingSheet("plan")} style={{ flex: 1, height: "2.3rem", borderRadius: "var(--r-2)", background: accent, color: "var(--c-on-amber)", border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" }}>CHANGE PLAN</button>
                    <button onClick={() => choosePlan("Free")} disabled={tier === "Free"} style={{ flex: 1, height: "2.3rem", borderRadius: "var(--r-2)", background: "transparent", color: tier === "Free" ? "var(--c-ink-4)" : "var(--c-ink-2)", border: "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: tier === "Free" ? "default" : "pointer" }}>{tier === "Free" ? "FREE PLAN" : "CANCEL PLAN"}</button>
                  </div>
                </div>
              </div>
              <div>
                {sectionTitle("Payment method")}
                <div style={{ ...card, padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>VISA •••• {cardLast4}</span>
                  <button onClick={() => setBillingSheet("card")} className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer" }}>EDIT</button>
                </div>
              </div>
              <div>
                {sectionTitle("Recent invoices")}
                <div style={{ ...card, overflow: "hidden" }}>
                  {[["May 2026", "$12.00"], ["Apr 2026", "$12.00"], ["Mar 2026", "$12.00"]].map(([m, amt], i) => (
                    <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1rem", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{m}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                        <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{amt}</span>
                        <button onClick={() => downloadInvoice(m, amt)} className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, background: "transparent", border: "none", cursor: "pointer" }}>PDF ↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                {sectionTitle("Subscriptions")}
                {subs.length === 0 ? (
                  <div style={{ ...card, padding: "1rem", fontSize: "var(--fs-body)", color: "var(--c-ink-4)" }}>No active creator subscriptions.</div>
                ) : (
                  <div style={{ ...card, overflow: "hidden" }}>
                    {subs.map((s, i) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.7rem 1rem", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                        <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: s.accent, flexShrink: 0 }}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{s.name}</div>
                          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{_idMoney(s.price)}/MO · RENEWS {s.renews.toUpperCase()}</div>
                        </div>
                        <button onClick={() => cancelSub(s)} className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer" }}>CANCEL</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "wallet" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div style={{ display: "flex", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
                <div style={{ flex: 1, padding: "1rem", borderRight: "1px solid var(--c-line)", background: "var(--c-panel-2)" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>USDC BALANCE</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: "0.25rem" }}>{_idMoney(cinaWallet())}</div>
                </div>
                <div style={{ flex: 1, padding: "1rem", background: "var(--c-panel-2)" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>PASS STAKES</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: "0.25rem" }}>{cinaHoldingsCount() == null ? "—" : cinaHoldingsCount()}</div>
                </div>
              </div>
              <div>
                <CinaAcctLabel>Smart-Contract Payout Address (Base L2)</CinaAcctLabel>
                <div style={{ ...card, padding: "0.7rem 0.9rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="t-mono" style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{CINA.address}</span>
                  <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(CINA.address); _idToast({ title: "COPIED", text: "Wallet address copied.", kind: "good" }); }} className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", padding: "0.25rem 0.55rem", cursor: "pointer" }}>COPY</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={goWallet} style={{ flex: 1, height: "2.5rem", borderRadius: "var(--r-2)", background: accent, color: "var(--c-on-amber)", border: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" }}>OPEN FULL WALLET →</button>
                <button onClick={() => { onClose(); window.location.href = "index.html#/payouts"; }} style={{ flex: 1, height: "2.5rem", borderRadius: "var(--r-2)", background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" }}>CHAINED PAYOUTS</button>
              </div>
            </div>
          )}

          {tab === "alerts" && (
            <div>
              {sectionTitle("Email & push")}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <CinaAcctToggle accent={accent} label="Drops & premieres" hint="New episodes, premieres, and films from studios you follow." on={alerts.drops} onToggle={() => toggleAlert("drops")}/>
                <CinaAcctToggle accent={accent} label="Chained smart-contract payouts" hint="Instant alert whenever CinaSplitRouter streams USDC to your wallet." on={alerts.royalties} onToggle={() => toggleAlert("royalties")}/>
                <CinaAcctToggle accent={accent} label="Replies & follows" hint="Comments, follows, and watch-party invites." on={alerts.social} onToggle={() => toggleAlert("social")}/>
                <CinaAcctToggle accent={accent} label="Product & dispatches" hint="Occasional news about Cina. No more than monthly." on={alerts.marketing} onToggle={() => toggleAlert("marketing")}/>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {window.CinaCredentialList ? <window.CinaCredentialList accent={accent}/> : null}
              <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--c-line)" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: "0.6rem" }}>SESSION</div>
                <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: "0 0 0.8rem" }}>
                  Signing out clears your Cina ID on Watch, Studio, and Producers at once. Passkeys remain stored safely on this device.
                </p>
                <button onClick={() => { if (window.CinaAuth) window.CinaAuth.signOut(); else cinaSignOut(); onClose && onClose(); }} className="btn" style={{ height: "2.3rem", fontSize: "var(--fs-body)" }}>
                  Sign out everywhere
                </button>
              </div>
            </div>
          )}

          {tab === "privacy" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              <div>
                {sectionTitle("Privacy")}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <CinaAcctToggle accent={accent} label="Public watch history" hint="Let others see what you've watched on your profile." on={privacy.history} onToggle={() => togglePrivacy("history")}/>
                  <CinaAcctToggle accent={accent} label="Personalized recommendations" hint="Use your viewing to tune what Cina surfaces." on={privacy.recs} onToggle={() => togglePrivacy("recs")}/>
                  <CinaAcctToggle accent={accent} label="Show holdings publicly" hint="Display your stakes and editions on your profile." on={privacy.holdings} onToggle={() => togglePrivacy("holdings")}/>
                </div>
              </div>
              <div>
                {sectionTitle("Your data")}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={exportData} style={{ flex: 1, height: "2.4rem", borderRadius: "var(--r-2)", background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" }}>EXPORT DATA</button>
                  <button onClick={deleteAccount} style={{ flex: 1, height: "2.4rem", borderRadius: "var(--r-2)", background: "transparent", color: `var(--c-bad, ${tkc("bad")})`, border: "1px solid rgba(201,85,72,.4)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" }}>DELETE ACCOUNT</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "0.9rem 1.4rem", borderTop: "1px solid var(--c-line)", flexShrink: 0, display: "flex", gap: "0.6rem", alignItems: "center" }}>
          {tab === "profile" ? (
            <button onClick={saveProfile} style={{
              flex: 1, height: "2.6rem", borderRadius: "var(--r-2)",
              background: saved ? "rgba(106,163,122,.12)" : accent,
              color: saved ? "var(--c-good)" : tkc("on-amber"),
              border: saved ? "1px solid var(--c-good)" : "none",
              cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, textTransform: "uppercase",
            }}>{saved ? "✓ Saved" : "Save changes"}</button>
          ) : (
            <div style={{ flex: 1, fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.4 }}>Saved automatically across all surfaces.</div>
          )}
          {CINA.signedIn ? (
            <button onClick={() => { onClose(); cinaSignOut(); }} style={{
              height: "2.6rem", padding: "0 1rem", borderRadius: "var(--r-2)", flexShrink: 0,
              background: "transparent", color: `var(--c-blood-l, ${tkc("bad")})`, border: "1px solid var(--c-line-2)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer",
            }}>SIGN OUT</button>
          ) : (
            <button onClick={() => { onClose(); openCinaSignIn({ surface, accent }); }} style={{
              height: "2.6rem", padding: "0 1rem", borderRadius: "var(--r-2)", flexShrink: 0,
              background: accent, color: "var(--c-on-amber)", border: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer",
            }}>SIGN IN</button>
          )}
        </div>

        {billingSheet && (
          <BillingSheet
            kind={billingSheet} accent={accent} card={card} tier={tier} cardLast4={cardLast4}
            tiers={PLAN_TIERS} onClose={() => setBillingSheet(null)} onChoose={choosePlan} onSaveCard={saveCard}
          />
        )}
      </div>
    </div>
  ), document.body);
}

// ─── Header User Menu + Sign In + Display Mood Switcher ──────────────
function CinaAccountButton({ surface, accent = "var(--c-amber)", align = "right", balance = null }) {
  useCinaId();
  const [app, setApp] = useCinaAppearance();
  const [open, setOpen] = useIdState(false);
  const [modal, setModal] = useIdState(false);
  const [panel, setPanel] = useIdState(null);
  const ref = useIdRef(null);

  useIdEffect(() => {
    _cinaSettingsOpener = (t) => { setOpen(false); setPanel(t || "profile"); };
    return () => { if (_cinaSettingsOpener) _cinaSettingsOpener = null; };
  }, []);

  useIdEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const signIn = () => {
    setOpen(false);
    if (window.CinaAuth) window.CinaAuth.open({ surface, accent });
    else if (window.openSignIn && window.SESSION) window.openSignIn();
    else setModal(true);
  };

  const holdings = cinaHoldingsCount();
  const unread = (typeof cinaUnreadCount === "function") ? cinaUnreadCount(surface) : 0;

  const row = (label, hint, onClick, opts = {}) => (
    <button key={label} onClick={() => { setOpen(false); onClick && onClick(); }} style={{
      display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.52rem 0.95rem",
      background: "transparent", border: "none", textAlign: "left", cursor: "pointer",
      color: opts.danger ? `var(--c-blood-l, ${tkc("bad")})` : "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "inherit",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel-2)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span style={{ flex: 1 }}>{label}</span>
      {hint && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" }}>{hint}</span>}
    </button>
  );
  const sectionLabel = (l) => <div className="t-mono" style={{ padding: "0.5rem 0.95rem 0.25rem", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{l}</div>;
  const divider = (k) => <div key={k} style={{ height: 1, background: "var(--c-line)", margin: "0.35rem 0" }}/>;

  const moodStrip = (
    <div style={{ padding: "0.35rem 0.95rem 0.55rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>DISPLAY MOOD</span>
        <button type="button" onClick={() => { setOpen(false); setPanel("appearance"); }} className="t-mono" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "var(--fs-label)", letterSpacing: ".12em", color: accent }}>ALL THEMES →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "0.32rem" }}>
        {CINA_MOODS_META.map(m => {
          const isCur = app.mood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              title={`${m.label} — ${m.sub}`}
              aria-label={`Display mood: ${m.label}`}
              aria-pressed={isCur}
              onClick={() => setApp({ mood: m.id })}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.28rem",
                padding: "0.38rem 0.2rem", borderRadius: "var(--r-1)", cursor: "pointer",
                background: isCur ? "rgba(var(--accent-rgb),.14)" : "var(--c-panel-2)",
                border: `1px solid ${isCur ? "var(--c-amber)" : "var(--c-line-2)"}`,
                color: isCur ? "var(--c-ink)" : "var(--c-ink-3)",
              }}
            >
              <span style={{
                width: "1.05rem", height: "1.05rem", borderRadius: "50%",
                background: m.bg, border: `2px solid ${m.accent}`, display: "inline-block",
              }}/>
              <span className="t-mono" style={{ fontSize: "0.62rem", letterSpacing: ".04em", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{m.label.slice(0, 4)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      {!CINA.signedIn && (
        <button
          type="button"
          onClick={signIn}
          style={{
            height: "2.15rem", padding: "0 0.85rem", borderRadius: "var(--r-1)",
            background: accent, color: "var(--c-on-amber)", border: "none",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".14em", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          SIGN IN
        </button>
      )}
      <button
        type="button"
        aria-label={CINA.signedIn ? `${CINA.handle} user menu and settings` : "User settings and sign in"}
        onClick={() => setOpen(o => !o)}
        title={CINA.signedIn ? `${CINA.handle} · Settings & Cina ID` : "User Settings & Sign In"}
        style={{
          position: "relative",
          height: "2.15rem", padding: CINA.signedIn ? "0 0.7rem 0 0.35rem" : "0 0.55rem",
          borderRadius: "var(--r-2)",
          background: CINA.signedIn ? "var(--c-panel-2)" : "transparent",
          border: open ? `1px solid ${accent}` : "1px solid var(--c-line-2)",
          color: "var(--c-ink)", display: "inline-flex", alignItems: "center", gap: "0.45rem",
          cursor: "pointer", transition: "border-color .14s ease",
        }}
      >
        <span style={{
          width: "1.5rem", height: "1.5rem", borderRadius: "50%",
          background: "var(--c-panel-3)", border: `1px solid ${accent}`, color: accent,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", fontWeight: 500,
        }}>
          {CINA.signedIn ? cinaGlyph() : <Icon name="actor" size={13}/>}
        </span>
        {CINA.signedIn && (
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".06em", color: "var(--c-ink-2)", maxWidth: "7.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {CINA.handle}
          </span>
        )}
        <Icon name="chev-d" size={11}/>
        {CINA.signedIn && unread > 0 && (
          <span style={{
            position: "absolute", top: "-0.25rem", right: "-0.25rem", minWidth: "1rem", height: "1rem", padding: "0 0.25rem",
            borderRadius: "var(--r-full)", background: `var(--c-blood-l, ${tkc("bad")})`, color: "var(--c-on-amber)",
            border: "2px solid var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 700, lineHeight: 1,
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "2.65rem", [align === "right" ? "right" : "left"]: 0,
          width: "min(19.5rem, 92vw)", background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
          boxShadow: "0 24px 64px rgba(0,0,0,.62)", borderRadius: "var(--r-2)", padding: "0.45rem 0", zIndex: 9000,
        }}>
          {CINA.signedIn ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.95rem 0.75rem" }}>
                <span style={{
                  width: "2.35rem", height: "2.35rem", borderRadius: "50%", flexShrink: 0,
                  background: "var(--c-panel-2)", border: `1px solid ${accent}`, color: accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
                }}>{cinaGlyph()}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{CINA.handle}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{CINA.email || CINA.address}</div>
                </div>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".14em", color: accent, border: `1px solid ${accent}`, borderRadius: "var(--r-1)", padding: "0.12rem 0.4rem" }}>{CINA.tier.toUpperCase()}</span>
              </div>

              <div style={{ display: "flex", margin: "0 0.95rem 0.5rem", border: "1px solid var(--c-line)", borderRadius: 0, overflow: "hidden" }}>
                {balance ? (
                  <button onClick={() => { setOpen(false); balance.onClick && balance.onClick(); }} style={{ flex: 1, padding: "0.6rem 0.75rem", textAlign: "left", background: "transparent", border: "none", borderRight: "1px solid var(--c-line)", cursor: balance.onClick ? "pointer" : "default" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" }}>{(balance.label || "WALLET").toUpperCase()}</div>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" }}>{balance.value}</div>
                    {balance.sub && <div className="t-mono" style={{ fontSize: "0.62rem", color: "var(--c-ink-4)", marginTop: "0.12rem", letterSpacing: ".06em" }}>{balance.sub}</div>}
                  </button>
                ) : (
                  <a href="index.html#/wallet" onClick={() => setOpen(false)} style={{ flex: 1, padding: "0.6rem 0.75rem", textDecoration: "none", borderRight: "1px solid var(--c-line)" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" }}>WALLET</div>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" }}>{_idMoney(cinaWallet())}</div>
                    <div className="t-mono" style={{ fontSize: "0.62rem", color: "var(--c-ink-4)", marginTop: "0.12rem", letterSpacing: ".06em" }}>{CINA.address}</div>
                  </a>
                )}
                {balance && balance.label === "credits" ? (
                  <a href="index.html#/wallet" onClick={() => setOpen(false)} style={{ flex: 1, padding: "0.6rem 0.75rem", textDecoration: "none" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" }}>WALLET</div>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" }}>{_idMoney(cinaWallet())}</div>
                    <div className="t-mono" style={{ fontSize: "0.62rem", color: "var(--c-ink-4)", marginTop: "0.12rem", letterSpacing: ".06em" }}>{CINA.address}</div>
                  </a>
                ) : (
                  <a href="index.html#/payouts" onClick={() => setOpen(false)} style={{ flex: 1, padding: "0.6rem 0.75rem", textDecoration: "none" }}>
                    <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".14em" }}>STAKES</div>
                    <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", marginTop: "0.15rem" }}>{holdings == null ? "4 active" : holdings + (holdings === 1 ? " stake" : " stakes")}</div>
                    <div className="t-mono" style={{ fontSize: "0.62rem", color: "var(--c-good, #52b788)", marginTop: "0.12rem", letterSpacing: ".06em" }}>ACTIVE</div>
                  </a>
                )}
              </div>

              {divider("dm")}
              {moodStrip}

              {divider("d1")}
              {surface === "watch" && (
                <>
                  {sectionLabel("LIBRARY & WATCH")}
                  {row("Watchlist", null, () => { if (typeof navigate === "function") navigate("/watchlist"); else location.hash = "#/watchlist"; })}
                  {row("Viewing History", null, () => { if (typeof navigate === "function") navigate("/history"); else location.hash = "#/history"; })}
                  {row("Taste Print", null, () => { if (typeof navigate === "function") navigate("/taste"); else location.hash = "#/taste"; })}
                  {divider("d-watch-tools")}
                </>
              )}
              {surface === "studio" && (
                <>
                  {sectionLabel("STUDIO WORKSPACE")}
                  {row("Studio preferences", "RENDER · CHAIN", () => setPanel("studio"))}
                  {row("Credits & render currency", null, () => window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "credits" })))}
                  {row("Team & directing crew", null, () => window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "team" })))}
                  {row("Help & pipeline docs", null, () => window.dispatchEvent(new CustomEvent("cina:openPanel", { detail: "help" })))}
                  {divider("d-studio-tools")}
                </>
              )}
              {sectionLabel("USER SETTINGS")}
              {row("Profile & Cina ID", null, () => setPanel("profile"))}
              {row("Display mood & motion", app.mood.toUpperCase(), () => setPanel("appearance"))}
              {row("Wallet & smart-contract splits", null, () => setPanel("wallet"))}
              {row("Plan, billing & subscriptions", null, () => setPanel("billing"))}
              {row("Passkeys & security", null, () => setPanel("security"))}
              {row("Alerts & notifications", null, () => setPanel("alerts"))}
              {row("Privacy & data export", null, () => setPanel("privacy"))}
              {surface === "watch" && row("Full account & creator page", "#/account", () => { if (typeof navigate === "function") navigate("/account"); else location.hash = "#/account"; })}

              {divider("ds")}
              {sectionLabel("SWITCH SURFACE")}
              <div style={{ padding: "0.15rem 0.5rem 0.25rem" }}>
                {CINA_SURFACES.map(s => {
                  const here = s.id === surface;
                  return (
                    <a key={s.id} href={here ? undefined : s.href} onClick={e => { if (here) e.preventDefault(); setOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.45rem 0.5rem", borderRadius: "var(--r-1)",
                      textDecoration: "none", color: "inherit", cursor: here ? "default" : "pointer",
                      background: here ? "var(--c-panel-2)" : "transparent",
                    }}>
                      <span style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", background: s.dot, flexShrink: 0 }}/>
                      <span style={{ fontSize: "var(--fs-body)", fontWeight: 500, color: "var(--c-ink)", flex: 1 }}>{s.label}</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: here ? accent : "var(--c-ink-4)" }}>{here ? "HERE" : s.sub}</span>
                    </a>
                  );
                })}
              </div>

              {divider("d2")}
              {row("Sign out", null, () => cinaSignOut(), { danger: true })}
            </>
          ) : (
            <>
              <div style={{ padding: "0.85rem 0.95rem 0.65rem" }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Sign in to Cina</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: "0.2rem", lineHeight: 1.45 }}>Passkey, wallet, or email — one Cina ID carries your stakes, library, and studio across every surface.</div>
              </div>
              <div style={{ padding: "0 0.95rem 0.65rem" }}>
                <button onClick={signIn} style={{ width: "100%", height: "2.35rem", background: accent, color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, cursor: "pointer" }}>SIGN IN / CREATE ID</button>
              </div>
              {surface === "watch" && (
                <>
                  {divider("d-out-dir")}
                  {sectionLabel("LIBRARY & ACCOUNT")}
                  {row("Watchlist", null, () => { if (typeof navigate === "function") navigate("/watchlist"); else location.hash = "#/watchlist"; })}
                  {row("Full account & creator page", "#/account", () => { if (typeof navigate === "function") navigate("/account"); else location.hash = "#/account"; })}
                </>
              )}
              {divider("dm-out")}
              {moodStrip}
              {divider("d-out-settings")}
              {row("User settings & display", app.mood.toUpperCase(), () => setPanel("appearance"))}
            </>
          )}
        </div>
      )}

      {modal && <CinaSignInModal surface={surface} accent={accent} onClose={() => setModal(false)}/>}
      {panel && <CinaAccountPanel surface={surface} accent={accent} tab={panel} onTab={setPanel} onClose={() => setPanel(null)}/>}
    </div>
  );
}

// ─── Signed-out gate — full screen, for Studio / Producers ────────────
function CinaSignedOut({ surface = "studio", accent = "var(--c-amber)" }) {
  const [modal, setModal] = useIdState(false);
  const meta = CINA_SURFACES.find(s => s.id === surface) || CINA_SURFACES[1];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000,
      background: `var(--c-void, ${tkc("void")})`, color: "var(--c-ink)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "5%",
    }}>
      <div style={{ width: "100%", maxWidth: "30rem", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.8rem" }}>
          <CinaMark size={28}/>
          <span style={{ width: 1, height: "1.1rem", background: "var(--c-line-2)" }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{meta.label.toUpperCase()}</span>
        </div>

        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, marginBottom: "1rem" }}>CINA ID · SIGNED OUT</div>
        <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-display)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: "0 0 1rem", color: "var(--c-ink)" }}>
          Sign in to enter <span style={{ color: accent }}>{meta.label}</span>.
        </h1>
        <p style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 1.8rem" }}>
          {meta.sub} runs on your Cina ID — the same identity, wallet and smart-contract holdings you use on Watch.
        </p>

        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
          <button onClick={() => { if (window.CinaAuth) window.CinaAuth.open({ surface, accent }); else if (window.openSignIn && window.SESSION) window.openSignIn(); else setModal(true); }} style={{
            height: "2.75rem", padding: "0 1.6rem", background: accent, color: "var(--c-on-amber)", border: "none", borderRadius: "var(--r-2)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 600, cursor: "pointer",
          }}>SIGN IN TO CINA</button>
          <a href="index.html" style={{
            height: "2.75rem", padding: "0 1.4rem", display: "inline-flex", alignItems: "center",
            background: "transparent", color: "var(--c-ink-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
            textDecoration: "none", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em",
          }}>← BACK TO WATCH</a>
        </div>
      </div>

      {modal && <CinaSignInModal surface={surface} accent={accent} onClose={() => setModal(false)}/>}
    </div>
  );
}

Object.assign(window, {
  CINA, useCinaId, cinaSync, cinaSignIn, cinaSignOut, cinaGlyph,
  openCinaSignIn, registerCinaSignIn, openCinaAccountSettings,
  CinaAppearance, useCinaAppearance, AppearanceSection, CINA_MOODS_META,
  CinaSignInModal, CinaAccountButton, CinaAccountPanel, CinaSignedOut, CINA_SURFACES,
});
