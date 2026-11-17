// festival.jsx — Cina Independent Film Festival
// Hub + per-film viewer + multi-step submission flow.

const { useState: fsUS, useEffect: fsUE, useMemo: fsUM, useRef: fsUR } = React;

// ─── Festival data ─────────────────────────────────────────────────────

const FEST_SUBMIT = {
  edition: "VOL · 04",
  name: "CINA INDEPENDENT",
  tagline: "Six days, one room. The films you couldn't get past a gatekeeper.",
  doors: new Date(Date.now() + 1000 * 60 * 60 * 38).getTime(), // 38h from load
  closes: new Date(Date.now() + 1000 * 60 * 60 * (38 + 144)).getTime(),
  city: "MARSEILLE · LE PROVENCE",
  juryChair: "AGNÈS DUVAL",
  prize: { grand: 25000, audience: 10000, craft: 5000, debut: 5000 },
  fees: { short: 25, feature: 60, doc: 45, student: 15 },
  cats: [
    { id: "feat",    label: "FEATURE",       sub: "60+ MIN",    fee: 60 },
    { id: "short",   label: "SHORT",         sub: "<30 MIN",    fee: 25 },
    { id: "doc",     label: "DOCUMENTARY",   sub: "ANY LENGTH", fee: 45 },
    { id: "stu",     label: "STUDENT",       sub: "ANY LENGTH", fee: 15 },
  ],
  rules: [
    "First public screening — no prior festival or streaming release.",
    "Owner must hold full rights to all sound, image and likeness in the cut.",
    "Runtime declared at submission is binding — final cut may vary ±60s.",
    "Subtitles required for any non-English dialogue.",
    "Submission fee waived for verified Cina creators with ≥1 minted film.",
  ],
  juryNotes: [
    { who: "AGNÈS DUVAL",   role: "JURY CHAIR · DIRECTOR",  pic: "Q" },
    { who: "LARS MIKKELSEN", role: "DOP · BERLIN '23",       pic: "L" },
    { who: "PRIYA RAO",     role: "EDITOR · A24",            pic: "P" },
    { who: "ELIAS VOSS",    role: "FOUNDER · CINA",          pic: "V" },
  ],
};

// Lineup — built from CATALOG so it stays consistent
function _festLineup() {
  const c = (window.CATALOG || []).slice(0, 8);
  return c.map((f, i) => ({
    ...f,
    cat: ["feat","short","doc","stu","feat","short","doc","feat"][i % 8],
    slot: ["FRI 19:30","FRI 21:45","SAT 14:00","SAT 17:30","SAT 21:00","SUN 13:30","SUN 16:00","SUN 20:30"][i],
    venue: ["Le Provence","Le Provence","Salle Bleu","Salle Bleu","Le Provence","Le Provence","Salle Bleu","Le Provence"][i],
    runtime: [82, 14, 96, 22, 71, 11, 104, 88][i],
    votes: 1240 - i * 132,
    audienceScore: (4.8 - i * 0.13).toFixed(1),
    juryScore: (4.6 - i * 0.18).toFixed(1),
    lang: ["EN","FR","ES·EN","EN","PT·EN","EN","AR·EN","EN"][i],
    director: f.creator?.split("·")[0]?.trim() || "—",
  }));
}

// ─── Countdown helper ──────────────────────────────────────────────────

function _useCountdown(ts) {
  const [now, setNow] = fsUS(Date.now());
  fsUE(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, ts - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  return { d, h, m, s, done: diff === 0 };
}

// ─── ROOT PAGE ─────────────────────────────────────────────────────────



// ─── Lineup card ───────────────────────────────────────────────────────

function FestFilmCard({ film }) {
  const catLabel = FEST_SUBMIT.cats.find(c => c.id === film.cat)?.label || "FEATURE";
  return (
    <a href={film.kind === "series" ? `#/series/${film.id}` : `#/film/${film.id}`}
       style={{
         display: "flex", flexDirection: "column",
         background: "var(--c-panel)", border: "1px solid var(--c-line)",
         borderRadius: "var(--r-2)", overflow: "hidden", textDecoration: "none", color: "inherit",
         transition: "border-color .14s ease, transform .14s ease",
       }}
       onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c-amber)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
       onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ position: "relative", aspectRatio: "4/5", background: tkc("void"), overflow: "hidden" }}>
        {window.FrameThumb && (
          <div style={{ position: "absolute", inset: 0 }}>
            <FrameThumb kind={film.thumb || film.id} usePhoto/>
          </div>
        )}
        <div style={{
          position: "absolute", top: 8, left: 8, padding: "3px 8px",
          background: "rgba(var(--accent-rgb),0.92)", borderRadius: 999,
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-on-amber)", letterSpacing: ".16em",
        }}>OFFICIAL · {catLabel}</div>
        <div style={{
          position: "absolute", top: 8, right: 8, padding: "3px 8px",
          background: "rgba(0,0,0,0.7)", borderRadius: 999,
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: tkc("white"), letterSpacing: ".16em",
        }}>{film.runtime}′ · {film.lang}</div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 12px 10px",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.92))",
        }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), lineHeight: 1.1 }}>
            {film.title}
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,0.7)", letterSpacing: ".16em", marginTop: 3, textTransform: "uppercase" }}>
            {film.director}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr auto", gap: 6, borderTop: "1px solid var(--c-line)" }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>SCREENS</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 3 }}>{film.slot}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2 }}>{film.venue}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>AUDIENCE</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 1 }}>{film.audienceScore}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{film.votes} votes</div>
        </div>
      </div>
    </a>
  );
}

// ─── Schedule ──────────────────────────────────────────────────────────

function FestSchedule({ lineup }) {
  const days = [
    { d: "FRI", date: "APR 18", color: "var(--c-amber)" },
    { d: "SAT", date: "APR 19", color: tkc("ink") },
    { d: "SUN", date: "APR 20", color: tkc("ink") },
  ];
  const byDay = {
    FRI: lineup.filter(f => f.slot.startsWith("FRI")),
    SAT: lineup.filter(f => f.slot.startsWith("SAT")),
    SUN: lineup.filter(f => f.slot.startsWith("SUN")),
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {days.map(day => (
        <div key={day.d} style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: day.color, letterSpacing: "-0.02em" }}>{day.d}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{day.date}</div>
          </div>
          {byDay[day.d].length === 0 && (
            <div style={{ padding: "26px 18px", color: "var(--c-ink-4)", fontSize: "var(--fs-body)" }}>No screenings programmed.</div>
          )}
          {byDay[day.d].map((f, i) => (
            <a key={f.id} href={f.kind === "series" ? `#/series/${f.id}` : `#/film/${f.id}`}
               style={{
                 display: "grid", gridTemplateColumns: "auto 1fr",
                 gap: 14, padding: "12px 18px", textDecoration: "none", color: "inherit",
                 borderBottom: i < byDay[day.d].length - 1 ? "1px solid var(--c-line)" : "none",
                 transition: "background .12s ease",
               }}
               onMouseEnter={e => e.currentTarget.style.background = "var(--c-panel-2)"}
               onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", paddingTop: 2, minWidth: 48 }}>
                {f.slot.split(" ")[1]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 2 }}>
                  {f.runtime}′ · {f.venue.toUpperCase()} · {f.lang}
                </div>
              </div>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Leaderboard ───────────────────────────────────────────────────────

function FestLeaderboard({ lineup }) {
  const ranked = [...lineup].sort((a, b) => b.votes - a.votes).slice(0, 6);
  const top = ranked[0]?.votes || 1;
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {ranked.map((f, i) => (
        <a key={f.id} href={f.kind === "series" ? `#/series/${f.id}` : `#/film/${f.id}`} style={{
          display: "grid", gridTemplateColumns: "32px 1fr 80px 60px",
          gap: 14, alignItems: "center", padding: "12px 16px",
          textDecoration: "none", color: "inherit",
          background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
          transition: "border-color .14s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-amber)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--c-line)"}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: i === 0 ? "var(--c-amber)" : "var(--c-ink-4)" }}>
            {String(i + 1).padStart(2, "0")}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.title}</div>
            <div style={{ height: 3, background: "var(--c-bg)", borderRadius: "var(--r-1)", marginTop: 6, overflow: "hidden" }}>
              <div style={{ width: `${(f.votes/top)*100}%`, height: "100%", background: "var(--c-amber)" }}/>
            </div>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right" }}>{f.votes.toLocaleString()}</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)", textAlign: "right" }}>{f.audienceScore}</div>
        </a>
      ))}
    </div>
  );
}

// ─── SUBMIT MODAL ──────────────────────────────────────────────────────

const _SUB_STEPS = ["Project", "Category", "Cut & rights", "Credits", "Pay & confirm"];

function FestSubmitModal({ onClose }) {
  const [step, setStep] = fsUS(0);
  const [data, setData] = fsUS({
    title: "", logline: "", runtime: 14, lang: "EN",
    cat: "short", first: true, ownsRights: true,
    director: "", producer: "", dop: "", editor: "",
    coverFile: "", cutFile: "",
    fee: 25, pay: "card", agree: false, submitted: false,
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const cat = FEST_SUBMIT.cats.find(c => c.id === data.cat) || FEST_SUBMIT.cats[1];
  fsUE(() => { set("fee", cat.fee); }, [data.cat]);

  const next = () => setStep(s => Math.min(_SUB_STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const submit = () => {
    set("submitted", true);
    if (window.toast) window.toast({ title: "SUBMITTED", text: `"${data.title}" is in the pile`, kind: "good" });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10, 6, 6, 0.78)", backdropFilter: "blur(4px)",
      display: "grid", placeItems: "center", padding: 32,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(880px, 96vw)", maxHeight: "92vh", overflow: "auto",
        background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 28px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>SUBMIT TO {FEST_SUBMIT.name}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 2 }}>
              Step {step + 1} of {_SUB_STEPS.length} · {_SUB_STEPS[step]}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 32, height: 32, padding: 0, color: "var(--c-ink-3)" }} aria-label="Close" title="Close">
            <Icon name="x" size={14}/>
          </button>
        </div>

        {/* Stepper */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${_SUB_STEPS.length}, 1fr)`, gap: 0, padding: "0 28px", marginTop: 16 }}>
          {_SUB_STEPS.map((s, i) => (
            <div key={s} style={{
              padding: "10px 6px",
              borderTop: "2px solid " + (i <= step ? "var(--c-amber)" : "var(--c-line)"),
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: i === step ? "var(--c-amber)" : i < step ? "var(--c-ink-2)" : "var(--c-ink-4)",
            }}>
              {String(i + 1).padStart(2, "0")} · {s.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "26px 28px 32px", minHeight: 360 }}>
          {data.submitted ? (
            <FestSubmitDone data={data} onClose={onClose}/>
          ) : step === 0 ? (
            <FestStepProject data={data} set={set}/>
          ) : step === 1 ? (
            <FestStepCategory data={data} set={set}/>
          ) : step === 2 ? (
            <FestStepCut data={data} set={set}/>
          ) : step === 3 ? (
            <FestStepCredits data={data} set={set}/>
          ) : (
            <FestStepPay data={data} set={set}/>
          )}
        </div>

        {/* Footer */}
        {!data.submitted && (
          <div style={{
            padding: "16px 28px", borderTop: "1px solid var(--c-line)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "var(--c-panel)",
          }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
              FEE: <span style={{ color: "var(--c-amber)" }}>${data.fee}</span> · {cat.label}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={back} disabled={step === 0}
                      style={{ height: 36, padding: "0 18px", opacity: step === 0 ? 0.4 : 1 }}>
                Back
              </button>
              {step < _SUB_STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={next} style={{ height: 36, padding: "0 22px" }}>
                  Continue <Icon name="chev-r" size={11}/>
                </button>
              ) : (
                <button className="btn btn-primary" onClick={submit} disabled={!data.agree}
                        style={{ height: 36, padding: "0 22px", opacity: data.agree ? 1 : 0.4 }}>
                  Pay ${data.fee} & submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Submit step screens ───────────────────────────────────────────────

function _FldLabel({ children }) {
  return <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>{children}</div>;
}
function _Inp(props) {
  return <input {...props} style={{
    width: "100%", padding: "10px 12px", background: "var(--c-panel)", color: "var(--c-ink)",
    border: "1px solid var(--c-line)", borderRadius: "var(--r-1)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans, inherit)",
    ...props.style,
  }}/>;
}
function _Tar(props) {
  return <textarea {...props} style={{
    width: "100%", padding: "10px 12px", background: "var(--c-panel)", color: "var(--c-ink)",
    border: "1px solid var(--c-line)", borderRadius: "var(--r-1)", fontSize: "var(--fs-body)", minHeight: 90, fontFamily: "inherit", resize: "vertical",
  }}/>;
}

function FestStepProject({ data, set }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <_FldLabel>WORKING TITLE</_FldLabel>
        <_Inp value={data.title} placeholder="e.g. The Last Mile" onChange={e => set("title", e.target.value)}/>
      </div>
      <div>
        <_FldLabel>LOGLINE · ONE SENTENCE</_FldLabel>
        <_Tar value={data.logline} placeholder="A washed-up cellist returns to her childhood city to find her missing brother…" onChange={e => set("logline", e.target.value)}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <_FldLabel>RUNTIME · MINUTES</_FldLabel>
          <_Inp type="number" min={1} max={400} value={data.runtime} onChange={e => set("runtime", parseInt(e.target.value || 0))}/>
        </div>
        <div>
          <_FldLabel>PRIMARY LANGUAGE</_FldLabel>
          <_Inp value={data.lang} placeholder="EN, FR, ES…" onChange={e => set("lang", e.target.value.toUpperCase())}/>
        </div>
      </div>
    </div>
  );
}

function FestStepCategory({ data, set }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <_FldLabel>CHOOSE A CATEGORY</_FldLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {FEST_SUBMIT.cats.map(c => (
          <button key={c.id} onClick={() => set("cat", c.id)} className="btn-ghost"
            style={{
              height: "auto", padding: "18px 20px", textAlign: "left", display: "block",
              background: data.cat === c.id ? "rgba(var(--accent-rgb),0.10)" : "var(--c-panel)",
              border: "1px solid " + (data.cat === c.id ? "var(--c-amber)" : "var(--c-line)"),
              borderRadius: "var(--r-2)",
            }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>{c.label}</div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 4 }}>{c.sub}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)", marginTop: 12 }}>${c.fee}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function FestStepCut({ data, set }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <_FldLabel>UPLOAD MASTER · MOV / MP4 / PRORES</_FldLabel>
        <FestDropZone value={data.cutFile} onChange={v => set("cutFile", v)} hint="Drag .mov / .mp4 here · or paste a screener link"/>
      </div>
      <div>
        <_FldLabel>POSTER · 2:3 · MIN 1200×1800</_FldLabel>
        <FestDropZone value={data.coverFile} onChange={v => set("coverFile", v)} hint="Drop a poster image" small/>
      </div>
      <div style={{ display: "grid", gap: 10, padding: "16px 18px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
        <_CheckRow checked={data.first} onChange={v => set("first", v)}
          label="This will be the film's first public screening"
          sub="Required — Cina Independent is a premiere festival."/>
        <_CheckRow checked={data.ownsRights} onChange={v => set("ownsRights", v)}
          label="I own all music, image, and likeness rights in the cut"
          sub="If you're not sure, declare here and our team will help clear them."/>
      </div>
    </div>
  );
}

function FestStepCredits({ data, set }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <_FldLabel>HEAD CREDITS</_FldLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <_FldLabel>DIRECTED BY</_FldLabel>
          <_Inp value={data.director} placeholder="Director name" onChange={e => set("director", e.target.value)}/>
        </div>
        <div>
          <_FldLabel>PRODUCED BY</_FldLabel>
          <_Inp value={data.producer} placeholder="Producer name" onChange={e => set("producer", e.target.value)}/>
        </div>
        <div>
          <_FldLabel>CINEMATOGRAPHY</_FldLabel>
          <_Inp value={data.dop} placeholder="DOP name" onChange={e => set("dop", e.target.value)}/>
        </div>
        <div>
          <_FldLabel>EDITED BY</_FldLabel>
          <_Inp value={data.editor} placeholder="Editor name" onChange={e => set("editor", e.target.value)}/>
        </div>
      </div>
      <div style={{ padding: "12px 16px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
        Need to add cast, sound, score? You can edit credits any time before <strong style={{ color: "var(--c-ink)" }}>Apr 14, 23:59 CET</strong>.
      </div>
    </div>
  );
}

function FestStepPay({ data, set }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{
        padding: "20px 22px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
      }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>
          REVIEW
        </div>
        <_Sum k="Title"     v={data.title || "—"}/>
        <_Sum k="Category"  v={(FEST_SUBMIT.cats.find(c => c.id === data.cat) || {}).label}/>
        <_Sum k="Runtime"   v={`${data.runtime}′ · ${data.lang}`}/>
        <_Sum k="Director"  v={data.director || "—"}/>
        <_Sum k="Premiere"  v={data.first ? "World premiere" : "Not first"}/>
        <_Sum k="Master"    v={data.cutFile || "Not uploaded"} mono/>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em" }}>SUBMISSION FEE</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)" }}>${data.fee}</div>
        </div>
      </div>
      <div>
        <_FldLabel>PAYMENT METHOD</_FldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[["card","CARD"],["wallet","WALLET · USDC"],["waiver","CREATOR WAIVER"]].map(([k, l]) => (
            <button key={k} onClick={() => { set("pay", k); if (k === "waiver") set("fee", 0); else set("fee", FEST_SUBMIT.cats.find(c=>c.id===data.cat).fee); }}
              className="btn-ghost" style={{
                height: 48, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                background: data.pay === k ? "rgba(var(--accent-rgb),0.10)" : "var(--c-panel)",
                border: "1px solid " + (data.pay === k ? "var(--c-amber)" : "var(--c-line)"),
                color: data.pay === k ? "var(--c-amber)" : "var(--c-ink-2)", borderRadius: "var(--r-2)",
              }}>{l}</button>
          ))}
        </div>
        {data.pay === "waiver" && (
          <div style={{ marginTop: 10, fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>
            Verified Cina creators with at least one minted release submit free.
          </div>
        )}
      </div>
      <_CheckRow checked={data.agree} onChange={v => set("agree", v)}
        label="I agree to the festival rules and warrant the rights declared above."
        sub="By continuing you authorize the jury to download a screener for evaluation."/>
    </div>
  );
}

function _Sum({ k, v, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--c-line)" }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{k.toUpperCase()}</span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontFamily: mono ? "var(--f-mono)" : "inherit", maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
    </div>
  );
}

function _CheckRow({ checked, onChange, label, sub }) {
  return (
    <button onClick={() => onChange(!checked)} className="btn-ghost" style={{
      display: "grid", gridTemplateColumns: "22px 1fr", gap: 12, alignItems: "start",
      padding: "8px 0", textAlign: "left", height: "auto", background: "transparent", border: "none",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "var(--r-1)", marginTop: 2,
        border: "1.5px solid " + (checked ? "var(--c-amber)" : "var(--c-line-2)"),
        background: checked ? "var(--c-amber)" : "transparent",
        display: "grid", placeItems: "center", color: "var(--c-on-amber)",
      }}>{checked && <Icon name="check" size={11}/>}</div>
      <div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{label}</div>
        {sub && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 2 }}>{sub}</div>}
      </div>
    </button>
  );
}

function FestDropZone({ value, onChange, hint, small }) {
  const ref = fsUR(null);
  const fake = () => onChange(value ? "" : "MASTER_FINAL_v07.mov · 4.2GB");
  return (
    <button ref={ref} onClick={fake} className="btn-ghost" style={{
      width: "100%", padding: small ? "18px" : "28px",
      background: "var(--c-panel)", border: "1.5px dashed " + (value ? "var(--c-amber)" : "var(--c-line-2)"), borderRadius: "var(--r-2)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, color: value ? "var(--c-amber)" : "var(--c-ink-3)", height: "auto",
    }}>
      <Icon name={value ? "check" : "plus"} size={small ? 16 : 22}/>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em" }}>
        {value || hint}
      </div>
      {!value && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>(Click to mock-upload — no file is sent)</div>}
    </button>
  );
}

function FestSubmitDone({ data, onClose }) {
  return (
    <div style={{ textAlign: "center", padding: "30px 0" }}>
      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-display)", color: "var(--c-amber)", letterSpacing: "-0.02em" }}>
        Submitted.
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", maxWidth: 520, margin: "10px auto 0", lineHeight: 1.5 }}>
        “{data.title || "Untitled"}” is in the pile. Jury notifications go out by <strong style={{ color: "var(--c-ink)" }}>Apr 16</strong>.
        Your screener URL has been emailed to you.
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ height: 38, padding: "0 18px" }} aria-label="Close" title="Close">Close</button>
        <a href="#/festival" className="btn btn-primary" style={{ height: 38, padding: "0 18px" }} onClick={onClose}>
          Back to festival
        </a>
      </div>
    </div>
  );
}

// NOTE: This file's FestivalPage was superseded by the monthly online
// festival in strategy-watch.jsx (loads later, wins the name). What survives
// from here is the SUBMISSION flow — FestSubmitModal — which the live
// festival page now opens via window.openFestivalSubmit().
window.FestivalSubmitModal = FestSubmitModal;
window.openFestivalSubmit = function () {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = ReactDOM.createRoot ? ReactDOM.createRoot(host) : null;
  const close = () => { try { root ? root.unmount() : ReactDOM.unmountComponentAtNode(host); } catch {} host.remove(); };
  if (root) root.render(<FestSubmitModal onClose={close}/>);
  else ReactDOM.render(<FestSubmitModal onClose={close}/>, host);
};
