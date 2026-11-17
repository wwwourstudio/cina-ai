// cina-shortcuts.jsx — Global keyboard shortcuts + cheatsheet overlay.
// Press "?" anywhere to open. Press it again or Esc to close.

const { useEffect: ueSk } = React;

const SHORTCUTS = [
  {
    section: "Navigation",
    items: [
      { keys: ["⌘", "K"],     desc: "Quick switcher (any view)" },
      { keys: ["?"],          desc: "This cheatsheet" },
      { keys: ["G", "D"],     desc: "Go to Director / Chat" },
      { keys: ["G", "S"],     desc: "Go to Script" },
      { keys: ["G", "B"],     desc: "Go to Board" },
      { keys: ["G", "G"],     desc: "Go to Generate" },
      { keys: ["G", "E"],     desc: "Go to Editor" },
      { keys: ["G", "M"],     desc: "Go to Score (Music)" },
      { keys: ["G", "A"],     desc: "Go to Autopilot" },
      { keys: ["Esc"],        desc: "Close panel / exit field" },
    ],
  },
  {
    section: "Generate",
    items: [
      { keys: ["⌘", "Enter"], desc: "Run generation" },
      { keys: ["⌘", "↑"],     desc: "Pick previous variant" },
      { keys: ["⌘", "↓"],     desc: "Pick next variant" },
      { keys: ["A"],          desc: "Approve current take" },
      { keys: ["R"],          desc: "Re-roll seed" },
      { keys: ["S"],          desc: "Send to storyboard" },
      { keys: ["T"],          desc: "Send to timeline" },
    ],
  },
  {
    section: "Editor",
    items: [
      { keys: ["Space"],      desc: "Play / pause" },
      { keys: ["J", "K", "L"],desc: "Reverse · pause · forward" },
      { keys: ["I"],          desc: "Mark in" },
      { keys: ["O"],          desc: "Mark out" },
      { keys: ["⌘", "B"],     desc: "Blade at playhead" },
      { keys: ["⌘", "L"],     desc: "Lock fine cut" },
    ],
  },
  {
    section: "Studio",
    items: [
      { keys: ["⌘", "S"],     desc: "Save (autosaves anyway)" },
      { keys: ["⌘", "Z"],     desc: "Undo" },
      { keys: ["⌘", "⇧", "Z"], desc: "Redo" },
      { keys: ["⌘", "P"],     desc: "Open Publish wizard" },
      { keys: ["⌘", "/"],     desc: "Ask Cina (any view)" },
      { keys: ["F"],          desc: "Focus mode (hide chrome)" },
    ],
  },
];

function ShortcutsOverlay() {
  const w = useStudio();
  const open = w?.shortcuts?.open;

  ueSk(() => {
    const onKey = (e) => {
      // Don't fire while typing
      const t = e.target;
      const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "?" && !inField) {
        e.preventDefault();
        toggleShortcuts();
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setShortcuts(false);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p" && !inField) {
        e.preventDefault();
        openPublishWizard();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div onClick={() => setShortcuts(false)} style={{
      position: "fixed", inset: 0, zIndex: 240,
      background: "rgba(0,0,0,.78)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(840px, 100%)", maxHeight: "100%",
        background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)",
        boxShadow: "0 60px 120px rgba(0,0,0,.7)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px 16px", borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SHORTCUTS</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>
              Keyboard cheatsheet
            </div>
          </div>
          <span style={{ flex: 1 }}/>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
            PRESS <Kbd>?</Kbd> ANYTIME
          </span>
          <button onClick={() => setShortcuts(false)} className="btn btn-icon btn-ghost"><Icon name="x" size={12}/></button>
        </div>

        {/* Body — 2-col grid of sections */}
        <div style={{
          flex: 1, overflowY: "auto", padding: 28,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px 40px",
        }}>
          {SHORTCUTS.map(s => (
            <div key={s.section}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 14 }}>
                {s.section.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {s.items.map((it, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 0",
                    borderBottom: i < s.items.length - 1 ? "1px solid var(--c-line)" : "none",
                  }}>
                    <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{it.desc}</span>
                    <span style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                      {it.keys.map((k, j) => (
                        <React.Fragment key={j}>
                          <Kbd>{k}</Kbd>
                          {j < it.keys.length - 1 && <span style={{ color: "var(--c-ink-4)", fontSize: "var(--fs-label)", alignSelf: "center" }}>+</span>}
                        </React.Fragment>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: "12px 28px",
          borderTop: "1px solid var(--c-line)",
          background: "var(--c-panel-2)",
          fontSize: "var(--fs-label)", color: "var(--c-ink-3)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <CinaBadge size={14}/>
          <span>
            <span className="t-display" style={{ fontStyle: "italic", color: "var(--c-amber)" }}>Cina:</span>{" "}
            Most actions live in the toolbar too — these are just the fast lane.
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 22, height: 22, padding: "0 6px",
      background: "var(--c-bg)",
      border: "1px solid var(--c-line-2)",
      borderBottomWidth: 2,
      borderRadius: "var(--r-1)",
      fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", fontWeight: 500,
      color: "var(--c-ink-2)",
      letterSpacing: 0,
    }}>{children}</span>
  );
}

Object.assign(window, { ShortcutsOverlay });
