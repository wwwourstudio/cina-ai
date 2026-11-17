// cina-publish.jsx — Publish wizard (Studio → Watch / Pitch).
// Triggered via window.openPublishWizard(target?). Shows readiness, distribution
// picks, release scheduling, then writes to STUDIO via shipMaster().

const { useState: usPb, useEffect: uePb } = React;

function PublishWizard() {
  const w = useStudio(); // re-renders on STUDIO bumps
  const open = w?.publishing?.open;
  const target = w?.publishing?.target;
  const project = getActiveProject();
  const ws = getActiveWorkspace();

  const [step, setStep] = usPb(0);
  const [dist, setDist] = usPb({ watch: true, pitch: false });
  const [release, setRelease] = usPb("now");           // now | 24h | 7d | custom
  const [customDate, setCustomDate] = usPb("");
  const [shipping, setShipping] = usPb(false);
  const [shipped, setShipped] = usPb(false);

  uePb(() => {
    if (!open) {
      // reset on close
      setTimeout(() => { setStep(0); setShipping(false); setShipped(false); }, 200);
    } else if (target) {
      setDist(d => ({ ...d, [target]: true }));
    }
  }, [open, target]);

  if (!open) return null;

  // ─── Readiness check ────────────────────────────────────
  const checks = [
    { id: "script",   label: "Script locked",       ok: ws.scriptStage === "locked",                      fix: "Open Script → Lock pages" },
    { id: "board",    label: "Boards approved",     ok: (ws.board || []).every(s => s.status === "approved"), fix: "Open Board → Approve all" },
    { id: "renders",  label: "All shots rendered",  ok: (ws.renders || []).length > 0 && (ws.renders || []).every(r => r.status === "complete"), fix: "Open Generate → Render queue" },
    { id: "cut",      label: "Picture locked",      ok: ws.cut === "fine" || ws.cut === "final",          fix: "Open Editor → Lock fine cut" },
    { id: "score",    label: "Score mastered",      ok: ws.score?.master,                                  fix: "Open Score → Master mix" },
  ];
  const passed = checks.filter(c => c.ok).length;
  const total = checks.length;
  const ready = passed === total;
  const dur = (project?.runtime) || `${(ws.renders || []).length * 6}s`;

  // ─── Steps ──────────────────────────────────────────────
  const steps = [
    { id: 0, label: "Readiness" },
    { id: 1, label: "Where" },
    { id: 2, label: "When" },
    { id: 3, label: "Confirm" },
  ];
  const canAdvance = (() => {
    if (step === 0) return true; // can always proceed; warnings are surfaced
    if (step === 1) return dist.watch || dist.pitch;
    if (step === 2) return release !== "custom" || customDate.trim().length > 0;
    return true;
  })();

  function ship() {
    setShipping(true);
    const releaseDate =
      release === "now"  ? null :
      release === "24h"  ? "tomorrow" :
      release === "7d"   ? "next week" :
      customDate;
    setTimeout(() => {
      shipMaster({ releaseDate, watch: dist.watch, pitch: dist.pitch });
      setShipping(false);
      setShipped(true);
    }, 1400);
  }

  return (
    <div onClick={closePublishWizard} style={{
      position: "fixed", inset: 0, zIndex: 250,
      background: "rgba(0,0,0,.84)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
      animation: "pb-fade .2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(880px, 100%)", maxHeight: "100%",
        background: "var(--c-panel)",
        border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)",
        boxShadow: "0 60px 120px rgba(0,0,0,.7), 0 0 0 1px rgba(var(--accent-rgb),.06)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px 18px",
          borderBottom: "1px solid var(--c-line)",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>PUBLISH</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>
              {project?.title || "this film"}
            </div>
          </div>
          <span style={{ flex: 1 }}/>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => !shipped && !shipping && setStep(s.id)}
                  disabled={shipped || shipping}
                  style={{
                    height: 22, padding: "0 8px",
                    background: step === s.id ? "var(--c-amber)" : "transparent",
                    color: step === s.id ? tkc("on-amber") : "var(--c-ink-3)",
                    border: `1px solid ${step === s.id ? "var(--c-amber)" : "var(--c-line)"}`,
                    borderRadius: "var(--r-3)",
                    fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
                    letterSpacing: ".08em", cursor: shipping ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <span className="t-num" style={{ opacity: 0.7 }}>{i + 1}</span>
                  <span>{s.label}</span>
                </button>
                {i < steps.length - 1 && <span style={{ color: `var(--c-ink-5,${tkc("cat-6")})`, fontSize: "var(--fs-label)" }}>·</span>}
              </React.Fragment>
            ))}
          </div>

          <button onClick={closePublishWizard} className="btn btn-icon btn-ghost" style={{ marginLeft: 12 }}>
            <Icon name="x" size={12}/>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28, minHeight: 320 }}>
          {shipped ? (
            <Shipped project={project} dist={dist}/>
          ) : shipping ? (
            <Shipping/>
          ) : step === 0 ? (
            <ReadinessStep checks={checks} passed={passed} total={total}/>
          ) : step === 1 ? (
            <WhereStep dist={dist} setDist={setDist}/>
          ) : step === 2 ? (
            <WhenStep release={release} setRelease={setRelease} customDate={customDate} setCustomDate={setCustomDate}/>
          ) : (
            <ConfirmStep project={project} ws={ws} dist={dist} release={release} customDate={customDate} dur={dur} ready={ready} passed={passed} total={total}/>
          )}
        </div>

        {/* Footer */}
        {!shipping && !shipped && (
          <div style={{
            padding: "14px 24px", borderTop: "1px solid var(--c-line)",
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--c-panel-2)",
          }}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
            )}
            <span style={{ flex: 1 }}/>
            {!ready && step === 0 && (
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginRight: 4 }}>
                {total - passed} ITEM{total - passed === 1 ? "" : "S"} OUTSTANDING — PUBLISH ANYWAY?
              </span>
            )}
            {step < 3 ? (
              <button className="btn btn-primary" disabled={!canAdvance} onClick={() => setStep(step + 1)}
                      style={{ opacity: canAdvance ? 1 : 0.4 }}>
                {step === 0 && !ready ? "Publish anyway →" : "Continue →"}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={ship}>
                <Icon name="upload" size={11}/>Ship master
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pb-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pb-spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

// ─── Step 1: Readiness ──────────────────────────────────────────
function ReadinessStep({ checks, passed, total }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: 0 }}>
          Is this film ready?
        </h3>
        <span className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: passed === total ? "var(--c-good)" : "var(--c-amber)" }}>
          {passed}<span style={{ color: "var(--c-ink-4)" }}> / {total}</span>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--c-line)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
        {checks.map(c => (
          <div key={c.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 16px", background: "var(--c-panel-2)",
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: c.ok ? "var(--c-good)" : "transparent",
              border: `1px solid ${c.ok ? "var(--c-good)" : "var(--c-line-2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {c.ok && <Icon name="check" size={11}/>}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{c.label}</div>
              {!c.ok && (
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 3 }}>
                  ↳ {c.fix}
                </div>
              )}
            </div>
            <span className="t-mono" style={{
              fontSize: "var(--fs-label)",
              color: c.ok ? "var(--c-good)" : "var(--c-ink-4)",
              letterSpacing: ".16em",
            }}>{c.ok ? "READY" : "PENDING"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Where ──────────────────────────────────────────────
function WhereStep({ dist, setDist }) {
  const targets = [
    { id: "watch", title: "Cina Watch", line: "Public-facing site. Fans, viewers, NFT holders.", sub: "Goes live to followers + Discover", icon: "globe" },
    { id: "pitch", title: "Cina Pitch", line: "Investor-facing. Feature pitches, decks, fundraising.", sub: "Adds to your fund deck. Visible to invited investors.", icon: "spark" },
  ];
  return (
    <div>
      <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: "0 0 6px" }}>
        Where should this film live?
      </h3>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 22px" }}>Pick one or both. You can change this anytime.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {targets.map(t => {
          const on = dist[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setDist(d => ({ ...d, [t.id]: !d[t.id] }))}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: 18, textAlign: "left",
                background: on ? "var(--c-panel-3)" : "var(--c-panel-2)",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer",
                boxShadow: on ? "0 0 0 1px rgba(var(--accent-rgb),.15) inset" : "none",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "var(--r-2)", flexShrink: 0,
                background: on ? "var(--c-amber)" : "var(--c-bg)",
                color: on ? tkc("on-amber") : "var(--c-ink-3)",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={t.icon} size={16}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{t.title}</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 4, lineHeight: 1.45 }}>{t.line}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 6, letterSpacing: ".08em" }}>↳ {t.sub}</div>
              </div>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `1.5px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
                background: on ? "var(--c-amber)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 2,
              }}>{on && <Icon name="check" size={11}/>}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: When ───────────────────────────────────────────────
function WhenStep({ release, setRelease, customDate, setCustomDate }) {
  const opts = [
    { id: "now",    title: "Drop now",                  sub: "Immediately visible." },
    { id: "24h",    title: "In 24 hours",               sub: "Social tease window. Followers notified." },
    { id: "7d",     title: "Next week",                 sub: "Build anticipation. Holders unlock 24h early." },
    { id: "custom", title: "Custom date",               sub: "Pick any future date." },
  ];
  return (
    <div>
      <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: "0 0 6px" }}>
        When does it go live?
      </h3>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 22px" }}>Cina handles the schedule + audience pings.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {opts.map(o => {
          const on = release === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setRelease(o.id)}
              style={{
                padding: 16, textAlign: "left",
                background: on ? "var(--c-panel-3)" : "var(--c-panel-2)",
                border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line)"}`,
                borderRadius: "var(--r-2)", cursor: "pointer",
                position: "relative",
              }}
            >
              {on && <span style={{ position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%", background: "var(--c-amber)" }}/>}
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: on ? "var(--c-amber)" : "var(--c-ink)" }}>{o.title}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.45 }}>{o.sub}</div>
            </button>
          );
        })}
      </div>

      {release === "custom" && (
        <div style={{ marginTop: 18 }}>
          <div className="t-label" style={{ marginBottom: 6 }}>Release date</div>
          <input
            type="date"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            style={{
              padding: "10px 14px", background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
              color: "var(--c-ink)", fontSize: "var(--fs-body)", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)",
              outline: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Confirm ────────────────────────────────────────────
function ConfirmStep({ project, ws, dist, release, customDate, dur, ready, passed, total }) {
  const targets = [dist.watch && "Watch", dist.pitch && "Pitch"].filter(Boolean).join(" + ");
  const when = release === "now" ? "Drop immediately" :
               release === "24h" ? "Drops in 24 hours" :
               release === "7d"  ? "Drops next week" :
               customDate ? `Drops ${customDate}` : "—";

  return (
    <div>
      <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", margin: "0 0 6px" }}>
        Ready to ship?
      </h3>
      <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "0 0 22px" }}>Review and confirm.</p>

      <div style={{
        background: "var(--c-panel-2)",
        border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", padding: 20, marginBottom: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{project?.title}</div>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
            {project?.code} · {dur}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 18px", fontSize: "var(--fs-body)" }}>
          <span className="t-label">Distribution</span>
          <span style={{ color: "var(--c-ink)" }}>{targets || "—"}</span>

          <span className="t-label">Schedule</span>
          <span style={{ color: "var(--c-ink)" }}>{when}</span>

          <span className="t-label">Readiness</span>
          <span style={{ color: ready ? "var(--c-good)" : "var(--c-amber)" }}>
            {passed}/{total} checks {ready ? "passed" : "passed · " + (total - passed) + " pending"}
          </span>

          <span className="t-label">Master</span>
          <span style={{ color: "var(--c-ink)" }}>2K · 24fps · 1.85 · stereo + 5.1</span>
        </div>
      </div>

      <div style={{
        padding: "10px 14px",
        background: "rgba(var(--accent-rgb),.06)",
        border: "1px solid var(--c-amber-d)", borderLeft: "2px solid var(--c-amber)",
        borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5,
      }}>
        <span style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--c-amber)" }}>Cina:</span>{" "}
        I'll mint the master, push to your selected destinations, queue trailer assets, and notify your audience. Reversible for 24h.
      </div>
    </div>
  );
}

// ─── Shipping/Shipped states ────────────────────────────────────
function Shipping() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "60px 0" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "1.5px solid var(--c-line-2)",
        borderTopColor:  "var(--c-amber)",
        animation: "pb-spin .8s linear infinite",
      }}/>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>Mastering & shipping…</div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>
        SIGNING · UPLOADING · NOTIFYING AUDIENCE
      </div>
    </div>
  );
}

function Shipped({ project, dist }) {
  const ws = getActiveWorkspace();
  const liveId = ws && ws.publish && ws.publish.liveFilmId;
  const watchHref = liveId
    ? (window.cinaWatchHref ? window.cinaWatchHref(liveId) : "index.html#/film/" + liveId)
    : "index.html";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 0" }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "var(--c-good)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 8px rgba(122,176,143,.12)",
      }}>
        <Icon name="check" size={26}/>
      </div>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 400, color: "var(--c-ink)", textAlign: "center" }}>
        Now showing on {dist.watch && dist.pitch ? "Watch & Pitch" : dist.watch ? "Watch" : "Pitch"}.
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", textAlign: "center", maxWidth: 460, lineHeight: 1.55 }}>
        <span className="t-display" style={{ fontStyle: "italic" }}>{project?.title}</span> is live{dist.watch && liveId ? " — it now leads your front page on Watch" : ""}.
        {dist.watch && dist.pitch ? " It's on Cina Watch and in your Pitch deck." : ""}
      </div>
      {dist.watch && liveId && (
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 2 }}>
          PUBLIC PAGE · {watchHref.replace("index.html", "cina.watch")}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {dist.watch && (
          <a href={watchHref} className="btn btn-primary" style={{ height: 32, padding: "0 14px" }}>
            <Icon name="globe" size={12}/>{liveId ? "View live page" : "Open in Watch"}
          </a>
        )}
        <button className="btn btn-ghost" onClick={closePublishWizard}>Done</button>
      </div>
    </div>
  );
}

Object.assign(window, { PublishWizard });
