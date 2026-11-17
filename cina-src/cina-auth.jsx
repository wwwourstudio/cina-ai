// cina-auth.jsx — One auth core for every surface, passkey-first.
//
// Replaces two parallel sign-in modals (watch-flows.jsx SignInModal and
// cina-identity.jsx CinaSignInModal) and the two sign-in paths that mirrored
// each other (watch-state.jsx signIn + cinaSignIn). Everything now routes
// through this file:
//
//   CinaAuth.open({reason, surface, accent})  — the one sheet
//   CinaAuth.state()                          — {signedIn, handle, email, method}
//   CinaAuth.credentials()                    — registered passkeys / wallets
//   CinaAuth.signOut() / .forget(id)
//
// window.openSignIn and window.openCinaSignIn are both re-pointed here, so
// every existing caller across the four apps gets the new flow untouched.
//
// Load AFTER cina-identity.jsx (it delegates the session write to cinaSync
// so persistence and cross-surface propagation stay in one place).

const { useState: usAu2, useEffect: ueAu2, useRef: urAu2 } = React;

const CA_KEY = "cina:credentials";
const CA_ACCENT = "var(--c-amber)";

// ─── Credential registry ────────────────────────────────────────────────
// A credential is how this device proves who you are. Passkeys are the
// primary; wallet and email are kept as recovery paths.
function caLoad() {
  try { return JSON.parse(localStorage.getItem(CA_KEY)) || { creds: [], lastId: null }; }
  catch (_) { return { creds: [], lastId: null }; }
}
function caSave(v) { try { localStorage.setItem(CA_KEY, JSON.stringify(v)); } catch (_) {} }

const caSubs = new Set();
function caBump() { caSubs.forEach(fn => fn(Date.now())); }
function useCinaAuth() {
  const [, setT] = usAu2(0);
  ueAu2(() => { caSubs.add(setT); return () => caSubs.delete(setT); }, []);
  return { ...caLoad(), ...CinaAuth.state() };
}

function caAdd(cred) {
  const reg = caLoad();
  const creds = [cred, ...reg.creds.filter(c => c.id !== cred.id)].slice(0, 6);
  caSave({ creds, lastId: cred.id });
  caBump();
  return cred;
}

// ─── WebAuthn, where the browser has it ─────────────────────────────────
// Real platform authenticator when available; a deterministic stand-in
// otherwise, so the flow is demonstrable on any device.
const caHasWebAuthn = () =>
  typeof window.PublicKeyCredential === "function" && !!navigator.credentials;

async function caCreatePasskey(handle) {
  const id = "pk_" + Math.random().toString(36).slice(2, 10);
  if (caHasWebAuthn()) {
    try {
      await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Cina" },
          user: { id: crypto.getRandomValues(new Uint8Array(16)), name: handle, displayName: handle },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { userVerification: "preferred" },
          timeout: 45000,
        },
      });
    } catch (_) { /* user dismissed or unsupported — fall through to the stand-in */ }
  }
  return { id, kind: "passkey", handle, label: caDeviceLabel(), at: Date.now() };
}

async function caAssertPasskey(cred) {
  if (caHasWebAuthn()) {
    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: "preferred",
          timeout: 45000,
        },
      });
    } catch (_) {}
  }
  return true;
}

function caDeviceLabel() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad/.test(ua)) return "This iPhone · Face ID";
  if (/Macintosh/.test(ua)) return "This Mac · Touch ID";
  if (/Android/.test(ua)) return "This Android device";
  if (/Windows/.test(ua)) return "This PC · Windows Hello";
  return "This device";
}

// ─── The core ───────────────────────────────────────────────────────────
let caOpener = null;

const CinaAuth = {
  registerOpener(fn) { caOpener = fn; },
  open(opts) { if (caOpener) caOpener(opts || {}); },
  close() { if (caOpener) caOpener(null); },

  state() {
    const C = window.CINA || {};
    return { signedIn: !!C.signedIn, handle: C.handle || "", email: C.email || "", method: C.method || "" };
  },
  credentials() { return caLoad().creds; },
  lastCredential() {
    const reg = caLoad();
    return reg.creds.find(c => c.id === reg.lastId) || reg.creds[0] || null;
  },

  // Every successful path lands here — one write, one propagation.
  complete({ handle, email, method, cred }) {
    if (cred) caAdd(cred);
    const h = handle || (email ? email.split("@")[0] : (window.CINA || {}).handle) || "you.eth";
    if (window.CINA) window.CINA.method = method || "";
    if (window.cinaSync) window.cinaSync({ signedIn: true, handle: h, email: email || "" });
    else if (window.signIn) window.signIn({ handle: h, email, method });
    caBump();
    if (window.toast) window.toast({ title: "WELCOME", text: "Signed in · " + (method || "Cina ID"), kind: "good" });
  },

  signOut() {
    if (window.cinaSignOut) window.cinaSignOut();
    else if (window.signOut) window.signOut();
    caBump();
  },

  // Drop one credential (a lost device, a rotated wallet).
  forget(id) {
    const reg = caLoad();
    caSave({ creds: reg.creds.filter(c => c.id !== id), lastId: reg.lastId === id ? null : reg.lastId });
    caBump();
    if (window.toast) window.toast({ title: "REMOVED", text: "That credential can no longer sign you in.", kind: "info" });
  },
};

// ─── The sheet ──────────────────────────────────────────────────────────
function CinaAuthSheet({ ctx, onClose }) {
  const accent = ctx.accent || CA_ACCENT;
  const known = CinaAuth.lastCredential();
  const [step, setStep] = usAu2(known ? "return" : "choose"); // return | choose | email | code | busy
  const [email, setEmail] = usAu2("");
  const [code, setCode] = usAu2("");
  const [busy, setBusy] = usAu2("");

  ueAu2(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const useKnown = async () => {
    setBusy("Waiting for " + (known.kind === "passkey" ? "your passkey" : "your wallet") + "…");
    if (known.kind === "passkey") await caAssertPasskey(known);
    else await new Promise(r => setTimeout(r, 600));
    CinaAuth.complete({ handle: known.handle, method: known.kind === "passkey" ? "Passkey" : known.label, cred: known });
    onClose();
  };

  const newPasskey = async () => {
    const handle = (email ? email.split("@")[0] : (window.CINA || {}).handle) || "you.eth";
    setBusy("Creating your passkey…");
    const cred = await caCreatePasskey(handle);
    CinaAuth.complete({ handle, email, method: "Passkey", cred });
    onClose();
  };

  const signInGoogle = async () => {
    if (!window.CinaCloudAuth?.signInWithGoogle) {
      if (window.toast) window.toast({ title: "GOOGLE AUTH", text: "Google sign-in is loading, try again in a moment.", kind: "info" });
      return;
    }
    setBusy("Signing in with Google…");
    try {
      const u = await window.CinaCloudAuth.signInWithGoogle();
      const handle = (u?.displayName?.trim() || u?.email?.split("@")[0] || "Director");
      CinaAuth.complete({
        handle,
        email: u?.email || "",
        method: "Google",
        cred: { id: "g_" + (u?.uid || "cloud"), kind: "google", handle, label: u?.email || "Google Cloud Vault", at: Date.now() },
      });
      onClose();
    } catch (_) {
      setBusy("");
    }
  };

  const connectWallet = async (label) => {
    setBusy("Opening " + label + "…");
    await new Promise(r => setTimeout(r, 750));
    const handle = label.toLowerCase().replace(/[^a-z]/g, "") + ".eth";
    CinaAuth.complete({ handle, method: label, cred: { id: "w_" + label, kind: "wallet", handle, label, at: Date.now() } });
    onClose();
  };

  const sendCode = () => {
    if (!email.includes("@")) return;
    setBusy("Sending a code…");
    setTimeout(() => { setBusy(""); setStep("code"); }, 600);
  };
  const verify = () => {
    if (code.replace(/\D/g, "").length < 4) return;
    setBusy("Verifying…");
    setTimeout(() => {
      CinaAuth.complete({ email, method: "Email", cred: { id: "e_" + email, kind: "email", handle: email.split("@")[0], label: email, at: Date.now() } });
      onClose();
    }, 500);
  };

  const field = {
    width: "100%", boxSizing: "border-box", padding: "12px 14px",
    background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
    color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "inherit",
  };
  const primary = (on) => ({
    width: "100%", padding: "13px 16px", borderRadius: "var(--r-2)",
    background: on ? accent : tkc("panel-2"),
    color: on ? tkc("on-amber") : "var(--c-ink-3)", border: "none",
    fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 700,
    cursor: on ? "pointer" : "default",
  });
  const secondary = {
    width: "100%", padding: "12px 14px", borderRadius: "var(--r-2)", textAlign: "left",
    background: "transparent", border: "1px solid var(--c-line-2)",
    color: "var(--c-ink)", fontSize: "var(--fs-body)", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 11,
  };

  const sheet = (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9700,
      background: "rgba(0,0,0,.62)", backdropFilter: "blur(5px)",
      display: "flex", justifyContent: "flex-end",
    }}>
      <style>{`@keyframes caIn{from{transform:translateX(26px);opacity:.5}to{transform:translateX(0);opacity:1}}
@keyframes caPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 432, height: "100%", overflowY: "auto",
        background: "var(--c-panel)", borderLeft: "1px solid var(--c-line-2)",
        boxShadow: "-20px 0 60px rgba(0,0,0,.5)", animation: "caIn .24s cubic-bezier(.2,.8,.2,1)",
      }}>
        {/* Head */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "22px 24px 18px", borderBottom: "1px solid var(--c-line)" }}>
          <div style={{ minWidth: 0, paddingRight: 12 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 9, whiteSpace: "nowrap" }}>
              CINA ID{ctx.surface ? " · " + String(ctx.surface).toUpperCase() : ""}
            </div>
            <div className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              {step === "code" ? "Check your inbox"
                : step === "return" ? "Welcome back"
                : step === "email" ? "Sign in with email"
                : "Sign in"}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 32, height: 32, padding: 0, fontSize: "var(--fs-lead)", color: "var(--c-ink-3)" }} aria-label="Close" title="Close">×</button>
        </div>

        <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {ctx.reason && (
            <div style={{ padding: "10px 12px", borderRadius: "var(--r-2)", background: "rgba(var(--accent-rgb),.08)", border: "1px solid rgba(var(--accent-rgb),.28)", fontSize: "var(--fs-body)", color: accent, lineHeight: 1.45 }}>
              {ctx.reason}
            </div>
          )}

          {busy ? (
            <div style={{ padding: "44px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <span style={{ width: 46, height: 46, borderRadius: "var(--r-3)", border: `1.5px solid ${accent}`, display: "grid", placeItems: "center", color: accent, fontSize: "var(--fs-lead)", animation: "caPulse 1.3s ease-in-out infinite" }}>◉</span>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textAlign: "center" }}>{busy.toUpperCase()}</span>
            </div>
          ) : step === "return" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", color: "var(--c-on-amber)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", flex: "0 0 auto" }}>
                  {(known.handle || "y")[0].toUpperCase()}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>@{known.handle}</span>
                  <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 4, textTransform: "uppercase" }}>
                    {known.kind === "passkey" ? known.label : known.label}
                  </span>
                </span>
              </div>
              <button onClick={useKnown} style={primary(true)}>
                {known.kind === "passkey" ? "CONTINUE WITH PASSKEY" : "CONTINUE WITH " + known.label.toUpperCase()}
              </button>
              <button onClick={signInGoogle} style={secondary}>
                <span style={{ width: 22, textAlign: "center", fontWeight: 700, color: accent }}>G</span>Continue with Google · Cloud Vault
              </button>
              <button onClick={() => setStep("choose")} style={{ ...secondary, justifyContent: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
                USE A DIFFERENT METHOD
              </button>
            </>
          ) : step === "choose" ? (
            <>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: 0 }}>
                One Cina ID for Watch, Studio, Pitch and Producers. Sign in with Google for Cloud Slate Vault or create a device passkey.
              </p>
              <button onClick={signInGoogle} style={primary(true)}>CONTINUE WITH GOOGLE · CLOUD VAULT</button>
              <button onClick={newPasskey} style={secondary}>
                <span style={{ width: 22, textAlign: "center", color: accent }}>⌘</span>Create a Passkey ({caDeviceLabel()})
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}/>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>OR</span>
                <span style={{ flex: 1, height: 1, background: "var(--c-line)" }}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => setStep("email")} style={secondary}>
                  <span style={{ width: 22, textAlign: "center", color: "var(--c-ink-3)" }}>✉</span>Email a one-time code
                </button>
                {[["MetaMask", "🦊"], ["WalletConnect", "◇"], ["Coinbase Wallet", "◉"]].map(([label, icon]) => (
                  <button key={label} onClick={() => connectWallet(label)} style={secondary}>
                    <span style={{ width: 22, textAlign: "center" }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </>
          ) : step === "email" ? (
            <>
              <label className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", display: "block" }}>EMAIL</label>
              <input autoFocus type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCode()} placeholder="you@domain.com" style={field}/>
              <button disabled={!email.includes("@")} onClick={sendCode} style={primary(email.includes("@"))}>SEND CODE</button>
              <button onClick={() => setStep(known ? "return" : "choose")} style={{ ...secondary, justifyContent: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>BACK</button>
            </>
          ) : (
            <>
              <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, margin: 0 }}>
                We sent a 6-digit code to <span style={{ color: "var(--c-ink)" }}>{email}</span>.
              </p>
              <input autoFocus value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === "Enter" && verify()} placeholder="000000" inputMode="numeric"
                style={{ ...field, fontFamily: "var(--f-mono)", fontSize: "var(--fs-title)", letterSpacing: ".16em", textAlign: "center" }}/>
              <button disabled={code.replace(/\D/g, "").length < 4} onClick={verify} style={primary(code.replace(/\D/g, "").length >= 4)}>VERIFY &amp; SIGN IN</button>
              <button onClick={() => setStep("email")} style={{ ...secondary, justifyContent: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>USE A DIFFERENT EMAIL</button>
            </>
          )}

          <div style={{ paddingTop: 8, borderTop: "1px solid var(--c-line)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.5 }}>
            Passkeys stay on your device. We never sell your watch history.
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(sheet, document.body);
}

// ─── Host — mounts once, owns the sheet, re-points every legacy opener ──
function CinaAuthHost() {
  const [ctx, setCtx] = usAu2(null);
  ueAu2(() => {
    CinaAuth.registerOpener(setCtx);
    // Both historical openers now land on this one sheet.
    window.openSignIn = (opts) => setCtx(opts || {});
    window.openCinaSignIn = (opts) => setCtx(opts || {});
    if (window.registerSignInOpener) window.registerSignInOpener(o => setCtx(o || {}));
    if (window.registerCinaSignIn) window.registerCinaSignIn(o => setCtx(o || {}));
  }, []);
  return ctx ? <CinaAuthSheet ctx={ctx} onClose={() => setCtx(null)}/> : null;
}

// ─── Credential manager — for the account panel ─────────────────────────
function CinaCredentialList({ accent = CA_ACCENT }) {
  const auth = useCinaAuth();
  const creds = auth.creds || [];
  const glyph = { passkey: "◉", wallet: "◈", email: "✉" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>HOW YOU SIGN IN</div>
      {creds.length === 0 && (
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
          No credentials on this device yet. Create a passkey and you'll sign in with your face or fingerprint next time.
        </div>
      )}
      {creds.map(c => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)" }}>
          <span style={{ width: 26, height: 26, borderRadius: "var(--r-2)", display: "grid", placeItems: "center", background: "var(--c-panel-3)", color: accent, fontSize: "var(--fs-body)", flex: "0 0 auto" }}>{glyph[c.kind] || "◦"}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{c.kind === "passkey" ? "Passkey" : c.kind === "wallet" ? c.label : c.label}</span>
            <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 3, textTransform: "uppercase" }}>
              {c.kind === "passkey" ? c.label : "@" + c.handle} · ADDED {new Date(c.at).toLocaleDateString()}
            </span>
          </span>
          <button onClick={() => CinaAuth.forget(c.id)} className="btn-ghost" style={{ height: 26, padding: "0 9px", fontSize: "var(--fs-label)", flex: "0 0 auto" }}>Remove</button>
        </div>
      ))}
      {!creds.some(c => c.kind === "passkey") && (
        <button onClick={() => CinaAuth.open({ reason: "Add a passkey so this device can sign you in instantly." })} className="btn" style={{ height: 34, fontSize: "var(--fs-body)", marginTop: 2 }}>
          Add a passkey
        </button>
      )}
    </div>
  );
}

Object.assign(window, { CinaAuth, CinaAuthSheet, CinaCredentialList });

// ─── Self-mount ─────────────────────────────────────────────────────────
// One host on every surface, in its own root, so no app shell has to know
// about auth. Idempotent.
(function () {
  const mount = () => {
    if (document.getElementById("__cina-auth-root")) return;
    const host = document.createElement("div");
    host.id = "__cina-auth-root";
    document.body.appendChild(host);
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(<CinaAuthHost/>);
    else ReactDOM.render(<CinaAuthHost/>, host);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
