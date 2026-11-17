// account-panels.jsx — Slide-in panels for Profile, Preferences, Help & docs.
// Rendered at root level (outside header) to escape stacking contexts.

const { useState: useStateAP, useEffect: useEffectAP } = React;

// ─── Shared slide-in shell ───────────────────────────────────────────
function SlidePanel({ open, onClose, title, subtitle, children, width = 400 }) {
  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200,
        }}/>
      )}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width, background: "var(--c-panel)",
        borderLeft: "1px solid var(--c-line)",
        zIndex: 201,
        transform: open ? "translateX(0)" : "translateX(110%)",
        transition: "transform .28s cubic-bezier(.2,.8,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,.6)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: "1px solid var(--c-line)", flexShrink: 0,
        }}>
          <div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", letterSpacing: "-0.01em" }}>{title}</div>
            {subtitle && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" title="Close" className="btn btn-icon btn-ghost" style={{ width: 30, height: 30 }}>
            <Icon name="x" size={12}/>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>
      </aside>
    </>
  );
}

// Legacy ProfilePanel & PreferencesPanel consolidated into unified <CinaAccountPanel> (User Settings).
function ProfilePanel({ open, onClose }) {
  useEffectAP(() => {
    if (open) {
      onClose && onClose();
      window.openCinaAccountSettings && window.openCinaAccountSettings("profile");
    }
  }, [open]);
  return null;
}

function PreferencesPanel({ open, onClose }) {
  useEffectAP(() => {
    if (open) {
      onClose && onClose();
      window.openCinaAccountSettings && window.openCinaAccountSettings("studio");
    }
  }, [open]);
  return null;
}

// ─── Help & docs panel ──────────────────────────────────────────────
function HelpPanel({ open, onClose }) {
  const [search, setSearch] = useStateAP("");

  const docs = [
    { cat: "GETTING STARTED", items: [
      { title: "Your first film", desc: "Pitch → Bible → Script → Board → Render → Cut → Mint. The full pipeline in one walkthrough." },
      { title: "Series workflow", desc: "Lock a bible, then ship episodes on cadence. One world, many entries." },
      { title: "Branched cinema", desc: "Build a choose-your-own-adventure film. Audiences vote on forks." },
    ]},
    { cat: "STUDIO", items: [
      { title: "Director hub", desc: "The AI co-director. Chat, get suggestions, manage your pipeline." },
      { title: "Actor Vault", desc: "Birth performers, train LoRAs, lock identities, deploy to scenes." },
      { title: "Storyboard", desc: "Shot-by-shot planning. Drag, reorder, annotate, render." },
      { title: "Editor timeline", desc: "Non-linear editing with AI-generated footage." },
    ]},
    { cat: "MINTING & CREDITS", items: [
      { title: "Credits system", desc: "Credits power renders, script generation, scores, and minting. Buy packs from the credits panel." },
      { title: "Minting a film", desc: "Turn a locked cut into an on-chain release. Pick edition model, set price, deploy." },
      { title: "Royalties", desc: "EIP-2981 royalties on every secondary sale. Set your percentage at mint time." },
    ]},
    { cat: "KEYBOARD SHORTCUTS", items: [
      { title: "⌘K", desc: "Command palette — search anything." },
      { title: "⌘S", desc: "Save current state." },
      { title: "Space", desc: "Play/pause in editor and branch preview." },
      { title: "1 / 2 / 3", desc: "Vote on branches in audience preview." },
      { title: "Esc", desc: "Close overlays, exit preview." },
    ]},
  ];

  const q = search.trim().toLowerCase();
  const filtered = q ? docs.map(d => ({
    ...d,
    items: d.items.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
  })).filter(d => d.items.length > 0) : docs;

  return (
    <SlidePanel open={open} onClose={onClose} title="Help & docs" subtitle="KNOWLEDGE BASE" width={440}>
      <div style={{ padding: "16px 22px 6px" }}>
        {/* Replay the studio walkthrough */}
        <button
          onClick={() => {
            onClose();
            const f = (window.PROJECTS || []).find(p => p.id === window.__cinaActiveFilmId);
            window.dispatchEvent(new CustomEvent("cina:setRoute", { detail: "studio" }));
            setTimeout(() => window.dispatchEvent(new CustomEvent("cina:start-tour", { detail: { kind: (f && f.kind) || "movie" } })), 300);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
            padding: "13px 14px", marginBottom: 14, cursor: "pointer",
            background: "rgba(var(--accent-rgb),.07)", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-2)",
            transition: "border-color .12s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),.65)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(var(--accent-rgb),.35)"}
        >
          <span style={{ width: 28, height: 28, borderRadius: "var(--r-2)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(var(--accent-rgb),.14)", color: "var(--c-amber)", flexShrink: 0 }}>
            <Icon name="spark" size={13}/>
          </span>
          <span>
            <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>Replay the studio walkthrough</span>
            <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>A guided lap of every tool on the production line.</span>
          </span>
        </button>
        <div style={{ position: "relative", marginBottom: 18 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs…"
            style={{ ...apInput, paddingLeft: 32 }}/>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-4)", display: "flex" }}>
            <Icon name="search" size={12}/>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 22 }}>
        {filtered.map(cat => (
          <div key={cat.cat}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 10 }}>{cat.cat}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cat.items.map(item => (
                <div key={item.title} style={{
                  padding: "12px 14px", background: "var(--c-panel-2)", borderRadius: "var(--r-2)",
                  border: "1px solid var(--c-line)", cursor: "pointer",
                  transition: "border-color .12s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-line-3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-line)"}
                >
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--c-ink-4)", fontStyle: "italic", fontFamily: "var(--f-display)" }}>
            No results for "{search}".
          </div>
        )}
      </div>
    </SlidePanel>
  );
}

// ─── Shared form primitives ─────────────────────────────────────────
const apInput = {
  width: "100%", padding: "9px 12px",
  background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
  color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "inherit", outline: "none",
};

function APField({ label, children }) {
  return (
    <div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase", marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

function APSection({ label, children }) {
  return (
    <div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--c-line)" }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function APToggle({ label, hint, on, onToggle }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{label}</div>
        {hint && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>{hint}</div>}
      </div>
      <button onClick={onToggle} role="switch" aria-checked={!!on} aria-label={label} style={{
        width: 40, height: 22, borderRadius: "var(--r-3)", padding: 2,
        background: on ? "var(--c-amber)" : "var(--c-panel-2)",
        border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
        cursor: "pointer", position: "relative",
        transition: "background .15s, border-color .15s",
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: on ? tkc("void") : "var(--c-ink-3)",
          transform: on ? "translateX(18px)" : "translateX(0)",
          transition: "transform .15s ease",
        }}/>
      </button>
    </div>
  );
}

Object.assign(window, { ProfilePanel, PreferencesPanel, HelpPanel });
