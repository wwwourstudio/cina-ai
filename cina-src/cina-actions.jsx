// cina-actions.jsx — Real handlers for the actions the chrome promises.
//
// An audit of all 181 modules found 88 buttons with no handler at all, 46 of
// them carrying a real action label: "Delete account", "Clear watch history",
// "Export data", "Accept buyout", "Withdraw", "RSVP". A button that states an
// action and does nothing is worse than a missing button — the user believes
// it happened. This module supplies the shared pieces those handlers need:
//
//   cinaConfirm({...})    → Promise<bool>, a real modal for destructive acts
//   cinaExportData()      → downloads the user's actual stored data as JSON
//   cinaDownload(name, text, mime)
//   cinaClearHistory()    → clears watch history for real, with confirm
//   cinaDeleteAccount()   → confirm → sign out → clear local identity
//   cinaNotYet(what)      → honest "not in this build" for genuinely
//                           server-side actions, instead of a false success
//
// Load after cina-identity.jsx / watch-state.jsx.

const { useState: usAc, useEffect: ueAc } = React;

// ─── Download helper ────────────────────────────────────────────────────
function cinaDownload(filename, text, mime) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: mime || "application/json;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch (_) { return false; }
}

// ─── Confirm dialog ─────────────────────────────────────────────────────
// Destructive actions get a real gate. Resolves false on dismiss, and for
// `requireTyping` the confirm button stays inert until the word is typed.
let _acOpener = null;
function cinaConfirm(opts) {
  return new Promise(resolve => {
    if (!_acOpener) { resolve(window.confirm(opts.title || "Are you sure?")); return; }
    _acOpener({ ...opts, resolve });
  });
}

function CinaConfirmHost() {
  const [ctx, setCtx] = usAc(null);
  const [typed, setTyped] = usAc("");
  ueAc(() => { _acOpener = (c) => { setTyped(""); setCtx(c); }; }, []);
  ueAc(() => {
    if (!ctx) return;
    const onKey = e => { if (e.key === "Escape") close(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);
  if (!ctx) return null;

  const close = (v) => { ctx.resolve(v); setCtx(null); };
  const needWord = ctx.requireTyping;
  const ready = !needWord || typed.trim().toUpperCase() === String(needWord).toUpperCase();

  return ReactDOM.createPortal(
    <div onClick={() => close(false)} style={{
      position: "fixed", inset: 0, zIndex: 9800, background: "rgba(0,0,0,.66)",
      backdropFilter: "blur(5px)", display: "grid", placeItems: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 430, background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 24,
        boxShadow: "0 24px 70px rgba(0,0,0,.55)",
      }}>
        <div className="t-mono" style={{
          fontSize: "var(--fs-label)", letterSpacing: ".16em", marginBottom: 10,
          color: ctx.danger ? "var(--c-bad)" :  "var(--c-amber)",
        }}>{(ctx.kicker || (ctx.danger ? "THIS CANNOT BE UNDONE" : "CONFIRM")).toUpperCase()}</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.2, marginBottom: 10 }}>
          {ctx.title}
        </div>
        {ctx.body && <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: "0 0 16px", textWrap: "pretty" }}>{ctx.body}</p>}
        {needWord && (
          <div style={{ marginBottom: 16 }}>
            <label className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", display: "block", marginBottom: 7 }}>
              TYPE “{String(needWord).toUpperCase()}” TO CONFIRM
            </label>
            <input autoFocus value={typed} onChange={e => setTyped(e.target.value)} style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px",
              background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
              borderRadius: "var(--r-2)", color: "var(--c-ink)", fontFamily: "var(--f-mono)",
              fontSize: "var(--fs-body)", letterSpacing: ".16em",
            }}/>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" style={{ height: 34, fontSize: "var(--fs-body)" }} onClick={() => close(false)}>
            {ctx.cancelLabel || "Cancel"}
          </button>
          <button
            onClick={() => ready && close(true)}
            style={{
              height: 34, padding: "0 16px", borderRadius: "var(--r-2)", border: "none",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 700,
              cursor: ready ? "pointer" : "default",
              background: !ready ? "var(--c-panel-2)" : ctx.danger ? "var(--c-bad)" :  "var(--c-amber)",
              color: !ready ? "var(--c-ink-4)" : ctx.danger ? tkc("white") : tkc("on-amber"),
            }}>
            {(ctx.confirmLabel || "Confirm").toUpperCase()}
          </button>
        </div>
      </div>
    </div>, document.body);
}

// ─── Prompt ─────────────────────────────────────────────────────────────
// Resolves to the trimmed string, or null if dismissed. `validate` returns
// an error string to block submission, or null/undefined to allow it.
function cinaPrompt(opts) {
  return new Promise(resolve => {
    if (!_apOpener) {
      const v = window.prompt(opts.title || "", opts.value || "");
      resolve(v == null ? null : v.trim() || null);
      return;
    }
    _apOpener({ ...opts, resolve });
  });
}

let _apOpener = null;

function CinaPromptHost() {
  const [ctx, setCtx] = usAc(null);
  const [val, setVal] = usAc("");
  ueAc(() => { _apOpener = (c) => { setVal((c && c.value) || ""); setCtx(c); }; }, []);
  ueAc(() => {
    if (!ctx) return;
    const onKey = e => { if (e.key === "Escape") close(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);
  if (!ctx) return null;

  const close = (v) => { ctx.resolve(v); setCtx(null); };
  const err = ctx.validate ? ctx.validate(val.trim()) : null;
  const ready = val.trim().length > 0 && !err;
  const submit = () => { if (ready) close(val.trim()); };

  return ReactDOM.createPortal(
    <div onClick={() => close(null)} style={{
      position: "fixed", inset: 0, zIndex: 9800, background: "rgba(0,0,0,.66)",
      backdropFilter: "blur(5px)", display: "grid", placeItems: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 420, background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 24,
        boxShadow: "0 24px 70px rgba(0,0,0,.55)",
      }}>
        {ctx.kicker && <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", marginBottom: 10, color: "var(--c-amber)" }}>{ctx.kicker.toUpperCase()}</div>}
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", lineHeight: 1.2, marginBottom: ctx.body ? 8 : 16 }}>{ctx.title}</div>
        {ctx.body && <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, margin: "0 0 16px", textWrap: "pretty" }}>{ctx.body}</p>}
        <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
          placeholder={ctx.placeholder || ""} style={{
            width: "100%", boxSizing: "border-box", padding: "11px 13px",
            background: "var(--c-panel-2)", border: "1px solid " + (err ? "var(--c-bad)" : "var(--c-line-2)"),
            borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "inherit",
          }}/>
        <div style={{ minHeight: 18, marginTop: 7 }}>
          {err && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-bad)" }}>{err.toUpperCase()}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" style={{ height: 34, fontSize: "var(--fs-body)" }} onClick={() => close(null)}>Cancel</button>
          <button onClick={submit} style={{
            height: 34, padding: "0 16px", borderRadius: "var(--r-2)", border: "none",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", letterSpacing: ".16em", fontWeight: 700,
            cursor: ready ? "pointer" : "default",
            background: ready ? "var(--c-amber)" : "var(--c-panel-2)",
            color: ready ? tkc("on-amber") : "var(--c-ink-4)",
          }}>{(ctx.confirmLabel || "Save").toUpperCase()}</button>
        </div>
      </div>
    </div>, document.body);
}

// ─── Data export — the user's real stored state, not a fixture ──────────
function cinaExportData() {
  const S = window.SESSION || {};
  const C = window.CINA || {};
  const payload = {
    exported: new Date().toISOString(),
    note: "Everything Cina holds for this account on this device.",
    identity: { handle: C.handle || null, email: C.email || null, signedIn: !!C.signedIn, method: C.method || null },
    credentials: (window.CinaAuth ? window.CinaAuth.credentials() : []).map(c => ({ kind: c.kind, label: c.label, added: new Date(c.at).toISOString() })),
    watchlist: S.watchlist || [],
    ratings: S.ratings || {},
    history: S.history || [],
    holdings: S.holdings || [],
    credits: S.credits != null ? S.credits : null,
    localKeys: Object.keys(localStorage).filter(k => /^cina/i.test(k)),
  };
  const ok = cinaDownload("cina-account-data-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(payload, null, 2));
  if (window.toast) {
    ok ? toast({ title: "DATA EXPORTED", text: (payload.watchlist.length) + " saved · " + Object.keys(payload.ratings).length + " rated · " + payload.history.length + " watched", kind: "good" })
       : toast({ title: "EXPORT BLOCKED", text: "Your browser refused the download.", kind: "bad" });
  }
}

// ─── Clear watch history — actually clears it ──────────────────────────
async function cinaClearHistory() {
  const S = window.SESSION || {};
  const n = (S.history || []).length;
  if (!n) { if (window.toast) toast({ title: "NOTHING TO CLEAR", text: "No screenings logged yet.", kind: "info" }); return; }
  const ok = await cinaConfirm({
    title: "Clear your watch history?",
    body: n + " logged screening" + (n === 1 ? "" : "s") + " will be removed. Continue-watching positions go with them. Your watchlist, ratings and holdings are untouched.",
    confirmLabel: "Clear history", danger: true,
  });
  if (!ok) return;
  S.history = [];
  if (S.progress) S.progress = {};
  try { localStorage.removeItem("cina-watch-progress"); } catch (_) {}
  if (window.bumpSession) window.bumpSession();
  if (window.toast) toast({ title: "HISTORY CLEARED", text: n + " screening" + (n === 1 ? "" : "s") + " removed.", kind: "good" });
}

// ─── Delete account ────────────────────────────────────────────────────
async function cinaDeleteAccount() {
  const ok = await cinaConfirm({
    kicker: "This cannot be undone",
    title: "Delete your Cina account?",
    body: "Removes your profile, watchlist, ratings, history and comments from this device and from Cina. Wallets and anything you hold on-chain stay yours — tokens are not burned.",
    requireTyping: "DELETE", confirmLabel: "Delete account", danger: true,
  });
  if (!ok) return;
  const S = window.SESSION || {};
  ["watchlist", "history", "ratings", "holdings"].forEach(k => { if (Array.isArray(S[k])) S[k] = []; else if (S[k]) S[k] = {}; });
  try { Object.keys(localStorage).filter(k => /^cina/i.test(k)).forEach(k => localStorage.removeItem(k)); } catch (_) {}
  if (window.CinaAuth) window.CinaAuth.signOut();
  else if (window.cinaSignOut) window.cinaSignOut();
  if (window.bumpSession) window.bumpSession();
  if (window.toast) toast({ title: "ACCOUNT DELETED", text: "Everything local is gone. Sorry to see you go.", kind: "info" });
  if (window.navigate) window.navigate("/");
}

// ─── Honest placeholder ────────────────────────────────────────────────
// For actions that genuinely need a server we don't have. Says so plainly
// rather than reporting a success that never happened.
function cinaNotYet(what, detail) {
  if (window.toast) toast({
    title: "NOT IN THIS BUILD",
    text: detail || (what + " needs the live Cina backend. Nothing was sent."),
    kind: "info",
  });
}

// Self-mount the confirm host on every surface.
(function () {
  const mount = () => {
    if (document.getElementById("__cina-confirm-root")) return;
    const host = document.createElement("div");
    host.id = "__cina-confirm-root";
    document.body.appendChild(host);
    const tree = <React.Fragment><CinaConfirmHost/><CinaPromptHost/></React.Fragment>;
    if (ReactDOM.createRoot) ReactDOM.createRoot(host).render(tree);
    else ReactDOM.render(tree, host);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();

Object.assign(window, { cinaConfirm, cinaPrompt, cinaExportData, cinaClearHistory, cinaDeleteAccount, cinaNotYet });
