// watch-onboarding.jsx — New user signup, parental controls, ID verification.
// Uses localStorage to persist verification + kid mode + onboarding state.

const { useState: uso, useEffect: ueo, useMemo: umo } = React;

const LS = {
  onboarded:    "cina:onboarded",
  ageVerified:  "cina:age-verified",   // true once user passes ID check
  kidPin:       "cina:kid-pin",         // 4-digit PIN — set by adult, locks/unlocks kid mode
  kidMode:      "cina:kid-mode",        // boolean — when on, hides PG-13/R
  prefGenres:   "cina:pref-genres",     // ["Drama", "Sci-fi"]
  prefCreators: "cina:pref-creators",   // ["voss"]
};

function useLS(key, init) {
  const [v, setV] = uso(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  ueo(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

// ─── Onboarding overlay (multi-step, runs once) ───────────────────────

function OnboardingFlow({ onFinish }) {
  const [step, setStep] = uso(0);
  const [name, setName] = uso("");
  const [genres, setGenres] = useLS(LS.prefGenres, []);
  const [creators, setCreators] = useLS(LS.prefCreators, []);
  const [ageMode, setAgeMode] = uso(""); // 18+ · under-18 · skip

  const toggle = (arr, set, item) => set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const finish = () => {
    try { localStorage.setItem(LS.onboarded, "1"); } catch {}
    onFinish();
  };

  const Card = ({ children }) => (
    <div onClick={e => e.stopPropagation()} style={{
      width: 600, maxWidth: "100%",
      background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
      borderRadius: "var(--r-2)", padding: 36,
      display: "flex", flexDirection: "column", gap: 24,
      maxHeight: "90vh", overflowY: "auto",
    }}>{children}</div>
  );

  const Header = ({ kicker, title, sub }) => (
    <div>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 8 }}>{kicker}</div>
      <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      {sub && <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", margin: "10px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );

  const StepNav = ({ progress }) => (
    <div style={{ display: "flex", gap: 4, marginBottom: -8 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ flex: 1, height: 2, background: i <= progress ? "var(--c-amber)" : "var(--c-line)", borderRadius: "var(--r-1)", transition: "background .2s ease" }}/>
      ))}
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, overflow: "auto",
    }}>
      <Card>
        <StepNav progress={step}/>

        {step === 0 && (
          <>
            <Header kicker="WELCOME TO CINA" title="The cinema, on your terms." sub="A new place for AI-made films and series. Let's get you in."/>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>WHAT SHOULD WE CALL YOU</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name or handle"
                autoFocus
                style={{
                  background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                  borderRadius: "var(--r-2)", padding: "12px 14px", color: "var(--c-ink)",
                  fontSize: "var(--fs-lead)", fontFamily: "var(--f-sans)",
                }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(1)} disabled={!name.trim()} style={btnPrimary(name.trim())}>Continue →</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Header kicker="STEP 02 · TASTE" title="What do you watch?" sub="Pick at least three. We use these to build your shelves."/>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {["Drama","Sci-fi","Noir","Horror","Western","Romance","Comedy","Crime","Doc","Family","Thriller","Mystery"].map(g => {
                const on = genres.includes(g);
                return (
                  <button key={g} onClick={() => toggle(genres, setGenres, g)} style={chipStyle(on)}>{g}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setStep(0)} style={btnGhost}>← Back</button>
              <button onClick={() => setStep(2)} disabled={genres.length < 3} style={btnPrimary(genres.length >= 3)}>Continue →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Header kicker="STEP 03 · CREATORS" title="Pick a few directors to follow." sub="You'll get notified when their next film drops. Optional."/>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CREATORS.slice(0, 6).map(c => {
                const on = creators.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggle(creators, setCreators, c.id)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 14px", borderRadius: "var(--r-2)",
                    background: on ? "rgba(var(--accent-rgb),.06)" : "var(--c-bg)",
                    border: `1px solid ${on ? c.color : "var(--c-line-2)"}`,
                    cursor: "pointer", color: "inherit", textAlign: "left",
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.color, color: tkc("white"), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 600 }}>{c.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{c.tagline} · {c.films} films</div>
                    </div>
                    <span style={{ fontSize: "var(--fs-lead)", color: on ? c.color : "var(--c-ink-4)" }}>{on ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={btnGhost}>← Back</button>
              <button onClick={() => setStep(3)} style={btnPrimary(true)}>Continue →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Header kicker="STEP 04 · AGE" title="Are you 18 or older?" sub="Some films on Cina are R-rated. We need to know whether to show them. You can change this later in Settings."/>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setAgeMode("18")} style={ageOption(ageMode === "18")}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500 }}>I'm 18 or older</span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 }}>Verify with ID to unlock R-rated films. You can skip and verify later.</span>
              </button>
              <button onClick={() => setAgeMode("under")} style={ageOption(ageMode === "under")}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500 }}>I'm under 18</span>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 }}>Kid Mode is on. R-rated content is hidden. An adult can unlock with a PIN.</span>
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={btnGhost}>← Back</button>
              <button onClick={() => setStep(4)} disabled={!ageMode} style={btnPrimary(!!ageMode)}>Continue →</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <Header kicker="ALL SET" title={`Welcome${name ? ", " + name.split(" ")[0] : ""}.`} sub="Your shelves are ready. Adjust anything later in Settings."/>
            <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 18 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 10 }}>YOUR PROFILE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: "var(--fs-body)" }}>
                <div><b>Name:</b> {name}</div>
                <div><b>Age:</b> {ageMode === "18" ? "18+" : "Under 18 · Kid Mode"}</div>
                <div><b>Genres:</b> {genres.slice(0, 4).join(", ")}{genres.length > 4 && "…"}</div>
                <div><b>Following:</b> {creators.length} creators</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={finish} style={btnPrimary(true)}>Enter Cina →</button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// Style helpers (function decls hoist; const arrow fns don't — keep these as functions)
function btnPrimary(active) {
  return {
    padding: "12px 24px", background: active ? "var(--c-amber)" : "var(--c-line-2)",
    border: "none", color: active ? tkc("on-amber") : "var(--c-ink-4)",
    borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", fontWeight: 600, cursor: active ? "pointer" : "not-allowed",
    fontFamily: "var(--f-sans)",
  };
}
const btnGhost = {
  padding: "12px 18px", background: "transparent", border: "none",
  color: "var(--c-ink-3)", fontSize: "var(--fs-body)", cursor: "pointer", fontFamily: "var(--f-sans)",
};
function chipStyle(on) {
  return {
    padding: "10px 14px", fontSize: "var(--fs-body)",
    background: on ? "var(--c-amber)" : "transparent",
    color: on ? tkc("on-amber") : "var(--c-ink-2)",
    border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
    borderRadius: "var(--r-2)", cursor: "pointer", fontWeight: on ? 600 : 400,
    fontFamily: "var(--f-sans)",
  };
}
function ageOption(on) {
  return {
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    padding: "16px 18px", borderRadius: "var(--r-2)",
    cursor: "pointer", color: "inherit", textAlign: "left",
    background: on ? "var(--c-panel-2)" : "var(--c-panel)",
    border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line)"}`,
  };
}

// ─── ID Verification flow ─────────────────────────────────────────────

const methodOption = (on) => ({
  padding: "12px 14px", borderRadius: "var(--r-2)",
  background: on ? "rgba(var(--accent-rgb),.06)" : "var(--c-bg)",
  border: `1px solid ${on ? "var(--c-amber)" : "var(--c-line-2)"}`,
  cursor: "pointer", color: "inherit",
});

// ─── Parental Controls Page ───────────────────────────────────────────

function ParentalControlsPage() {
  const [pin, setPin] = useLS(LS.kidPin, null);
  const [kidMode, setKidMode] = useLS(LS.kidMode, false);
  const [setupOpen, setSetupOpen] = uso(false);
  const [unlockOpen, setUnlockOpen] = uso(false);

  const handleToggle = () => {
    if (!pin) { setSetupOpen(true); return; }
    if (kidMode) { setUnlockOpen(true); return; }
    setKidMode(true);
    toast("Kid Mode on · R-rated content hidden");
  };

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <PmMasthead bare index="Account" path="Family" title="Parental controls" lede="Hide PG-13 and R-rated content with a four-digit PIN. Kids can't turn it off; only an adult with the PIN can.">
        <button className="pm-chip" onClick={() => navigate("/account")}>← Account</button>
      </PmMasthead>
      <div style={{ maxWidth: 760 }}>

      {/* Kid Mode toggle */}
      <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 24, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: kidMode ? "rgba(93,217,124,.12)" : "var(--c-bg)", border: `1px solid ${kidMode ? tkc("good") : "var(--c-line-2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--fs-title)" }}>
            {kidMode ? "🔒" : "🔓"}
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 }}>Kid Mode</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>
              {kidMode ? "ON · Only G and PG content is shown. PIN required to disable." : pin ? "OFF · All content visible. Tap to enable." : "Set a PIN to enable Kid Mode."}
            </div>
          </div>
          <button onClick={handleToggle} style={{
            padding: "10px 22px",
            background: kidMode ? "rgba(93,217,124,.14)" :  "var(--c-amber)",
            border: kidMode ? `1px solid ${tkc("good")}` : "none",
            color: kidMode ? tkc("good") : tkc("on-amber"),
            borderRadius: "var(--r-3)", fontSize: "var(--fs-body)", fontWeight: 600, cursor: "pointer",
          }}>{kidMode ? "Unlock" : pin ? "Turn on" : "Set up"}</button>
        </div>
      </div>

      {/* PIN management */}
      {pin && (
        <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "var(--fs-body)", fontWeight: 600 }}>Family PIN</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2, fontFamily: "var(--f-mono)" }}>•••• set</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setSetupOpen(true)} style={{ padding: "8px 14px", background: "transparent", border: "1px solid var(--c-line-2)", color: "var(--c-ink-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", cursor: "pointer" }}>Change</button>
            <button onClick={() => { setPin(null); setKidMode(false); toast("PIN removed"); }} style={{ padding: "8px 14px", background: "transparent", border: "1px solid var(--c-blood)", color: "var(--c-blood)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", cursor: "pointer" }}>Remove</button>
          </div>
        </div>
      )}

      {/* Rating controls */}
      <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 22 }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 14 }}>WHAT KID MODE HIDES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["G",  "All ages",    true,  tkc("good")],
            ["PG", "Some themes", true,  tkc("good")],
            ["PG-13", "Mature themes", false, "var(--c-amber)"],
            ["R",  "Adult content",   false, "var(--c-blood)"],
          ].map(([rating, desc, allowed, color]) => (
            <div key={rating} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--c-bg)", borderRadius: "var(--r-2)", border: "1px solid var(--c-line)" }}>
              <span style={{ width: 36, padding: "3px 6px", textAlign: "center", border: `1px solid ${color}`, borderRadius: "var(--r-1)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", fontWeight: 700, color }}>{rating}</span>
              <span style={{ flex: 1, fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>{desc}</span>
              <span style={{ fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".16em", color: allowed ? tkc("good") : "var(--c-ink-4)" }}>{allowed ? "VISIBLE" : "HIDDEN"}</span>
            </div>
          ))}
        </div>
      </div>

      {setupOpen && <PinSetupOverlay current={pin} onSet={(p) => { setPin(p); setSetupOpen(false); toast("PIN saved"); }} onClose={() => setSetupOpen(false)}/>}
      {unlockOpen && <PinUnlockOverlay pin={pin} onSuccess={() => { setKidMode(false); setUnlockOpen(false); toast("Kid Mode off"); }} onClose={() => setUnlockOpen(false)}/>}
      </div>
    </div>
  );
}

function PinSetupOverlay({ current, onSet, onClose }) {
  const [p1, setP1] = uso("");
  const [p2, setP2] = uso("");
  const [err, setErr] = uso("");
  const submit = () => {
    if (p1.length !== 4) { setErr("Pin must be 4 digits"); return; }
    if (p1 !== p2) { setErr("Pins don't match"); return; }
    onSet(p1);
  };
  return (
    <PinOverlay title={current ? "Change PIN" : "Set a 4-digit PIN"} onClose={onClose}>
      <PinInput value={p1} onChange={setP1} label="New PIN"/>
      <PinInput value={p2} onChange={setP2} label="Confirm"/>
      {err && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-blood)" }}>{err}</div>}
      <button onClick={submit} style={btnPrimary(p1.length === 4 && p2.length === 4)}>Save PIN</button>
    </PinOverlay>
  );
}

function PinUnlockOverlay({ pin, onSuccess, onClose }) {
  const [v, setV] = uso("");
  const [err, setErr] = uso("");
  const submit = () => {
    if (v === pin) onSuccess();
    else setErr("Wrong PIN");
  };
  ueo(() => { if (v.length === 4) submit(); }, [v]); // eslint-disable-line
  return (
    <PinOverlay title="Enter PIN to unlock" onClose={onClose}>
      <PinInput value={v} onChange={setV} label="Family PIN"/>
      {err && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-blood)" }}>{err}</div>}
    </PinOverlay>
  );
}

function PinOverlay({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 250,
      background: "rgba(0,0,0,0.78)", backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 360, background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", padding: 28,
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", fontWeight: 500 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function PinInput({ value, onChange, label }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{label.toUpperCase()}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
        type="password" inputMode="numeric" autoFocus
        style={{
          background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
          borderRadius: "var(--r-2)", padding: "14px 18px", color: "var(--c-ink)",
          fontSize: "var(--fs-title)", fontFamily: "var(--f-mono)", letterSpacing: ".16em",
          textAlign: "center",
        }}
      />
    </label>
  );
}

// Helper: test whether onboarding has run
function shouldOnboard() {
  try { return localStorage.getItem(LS.onboarded) !== "1"; } catch { return false; }
}

Object.assign(window, { OnboardingFlow, ParentalControlsPage, shouldOnboard });
