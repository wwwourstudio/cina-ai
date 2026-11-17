// actor-creator.jsx — The performer creator now lives in vault-birth.jsx.
// This file keeps the shared Field label wrapper other Studio panels use.

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</div>
      {children}
      {hint && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{hint}</div>}
    </div>
  );
}
