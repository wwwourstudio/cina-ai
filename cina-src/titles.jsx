// titles.jsx — Opening title sequence builder.
// A 5th view in the studio: type-on-black title cards in the LAST LIGHT type system.

const { useState: useStateT, useRef: useRefT, useEffect: useEffectT } = React;

// The card list — director's cut of the opening
const TITLE_CARDS = [
  { t: 0.0,  end: 2.6, kind: "studio",   line1: "CINA",                  line2: "PICTURES" },
  { t: 2.6,  end: 5.0, kind: "presents", line1: "presents" },
  { t: 5.0,  end: 7.6, kind: "credit",   role: "A FILM BY",              name: "ELIAS VOSS" },
  { t: 7.6,  end: 10.2, kind: "credit",  role: "STARRING",               name: "MAREN KELL" },
  { t: 10.2, end: 12.8, kind: "credit",  role: "WITH",                   name: "DET. ARI NOMURA" },
  { t: 12.8, end: 15.6, kind: "credit",  role: "DIRECTED BY",            name: "CINA" },
  { t: 15.6, end: 21.0, kind: "title",   line1: "LAST",                  line2: "LIGHT" },
];

const SEQ_DURATION = 21.0;

function buildDynamicCards(filmTitle) {
  const clean = String(filmTitle || "LAST LIGHT").trim() || "LAST LIGHT";
  const parts = clean.split(/\s+/);
  const line1 = parts.length > 1 ? parts.slice(0, -1).join(" ").toUpperCase() : clean.toUpperCase();
  const line2 = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
  return TITLE_CARDS.map(c => c.kind === "title" ? { ...c, line1, line2 } : c);
}

function TitlesPanel() {
  const [tab, setTab] = useStateT("preview"); // preview | timeline | export
  const [filmTitle, setFilmTitle] = useStateT(() => window.FILM_BIBLE?.title || "LAST LIGHT");

  useEffectT(() => {
    const onDna = (e) => {
      if (e.detail?.title) setFilmTitle(e.detail.title);
    };
    window.addEventListener("cina:dna-updated", onDna);
    return () => window.removeEventListener("cina:dna-updated", onDna);
  }, []);

  const cards = buildDynamicCards(filmTitle);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <SectionHead title="Titles" count={`21.0s · 7 cards · ${filmTitle}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4, padding: 2, background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: 0 }}>
            {[
              { id: "preview",  label: "Preview"  },
              { id: "timeline", label: "Timeline" },
              { id: "export",   label: "Export"   },
            ].map(b => (
              <button key={b.id} onClick={() => setTab(b.id)} style={{
                height: 22, padding: "0 10px", border: "none",
                borderRadius: 0, fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
                textTransform: "uppercase", letterSpacing: ".08em", cursor: "pointer",
                background: tab === b.id ? "var(--c-panel-3)" : "transparent",
                color: tab === b.id ? "var(--c-amber)" : "var(--c-ink-3)",
              }}>{b.label}</button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ height: 28, fontSize: "var(--fs-label)" }}
            onClick={() => {
              const title = window.FILM_BIBLE?.title || "LAST LIGHT";
              if (window.CinaPipeline) {
                window.CinaPipeline.sendAssetToEdit({ kind: "title", label: `TITLE: ${title}`, dur: 5, openEdit: true });
              }
              window.toast?.({ title: "TITLE PLACED ON V2", text: `${title} opening card added to Timeline V2.`, kind: "good" });
            }}
          >Place on Timeline V2 →</button>
        </div>
      </SectionHead>

      {tab === "preview"  && <TitlesPreview cards={cards}/>}
      {tab === "timeline" && <TitlesTimeline cards={cards}/>}
      {tab === "export"   && <TitlesExport filmTitle={filmTitle}/>}
    </div>
  );
}

// The big black canvas with the actual title sequence playing
function TitlesPreview({ cards }) {
  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", minHeight: 0 }}>
      {/* Stage area — letterboxed, looping animation */}
      <div style={{
        background: tkc("black"), position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", borderRight: "1px solid var(--c-line)",
      }}>
        <div style={{
          width: "min(92%, 980px)", aspectRatio: "16/9",
          position: "relative",
          boxShadow: "0 40px 100px rgba(0,0,0,.7)",
          background: tkc("black"),
          overflow: "hidden",
        }}>
          <Stage width={1920} height={1080} duration={SEQ_DURATION} background={tkc("black")} loop>
            <TitleSequence cards={cards}/>
          </Stage>
        </div>

        {/* Scene-set caption */}
        <div style={{ position: "absolute", top: 18, left: 24 }}>
          <div className="t-label" style={{ marginBottom: 4 }}>Opening · v3 · locked</div>
          <div className="t-display" style={{ fontSize: "var(--fs-lead)", fontStyle: "italic", color: "var(--c-ink)" }}>
            "Type on black. Hold the silence. Earn the title."
          </div>
        </div>
      </div>

      {/* Inspector */}
      <div style={{ overflowY: "auto", padding: "16px 18px" }}>
        <div className="t-label" style={{ marginBottom: 10 }}>Type system</div>
        <KVRow k="Display" v="Fraunces italic"/>
        <KVRow k="Body"    v="Geist 500"/>
        <KVRow k="Stamp"   v="JetBrains Mono"/>
        <KVRow k="Tracking" v="title 0 / credit .18"/>

        <div className="t-label" style={{ marginTop: 22, marginBottom: 10 }}>Pacing</div>
        <KVRow k="Cards" v="7"/>
        <KVRow k="Total" v="21.0s"/>
        <KVRow k="Avg"   v="2.4s"/>
        <KVRow k="Title" v="5.4s hold"/>

        <div className="t-label" style={{ marginTop: 22, marginBottom: 10 }}>Director's note</div>
        <div style={{
          padding: 12, background: "var(--c-panel-2)",
          border: "1px solid var(--c-line)", borderLeft: "1.5px solid var(--c-amber)",
          borderRadius: "var(--r-md)",
          fontFamily: "var(--f-display)", fontStyle: "italic",
          fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, textWrap: "pretty",
        }}>
          The credits don't fade — they cut. We're not nostalgic, we're patient. The title arrives on a held black, like a light coming on in a room you already knew was occupied.
        </div>

        <div className="t-label" style={{ marginTop: 22, marginBottom: 10 }}>QC</div>
        {["Type drift", "Kerning collisions", "Flash threshold", "Safe-area"].map(c => (
          <div key={c} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 10px", marginBottom: 4,
            background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-sm)",
            fontSize: "var(--fs-body)", color: "var(--c-ink-2)",
          }}>
            <Icon name="check" size={11} style={{ color: "var(--c-good)" }}/>
            <span style={{ flex: 1 }}>{c}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)" }}>pass</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KVRow({ k, v }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "6px 0", borderBottom: "1px solid var(--c-line)" }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontFamily: "var(--f-mono)", lineHeight: 1.4 }}>{v}</span>
    </div>
  );
}

// The actual title sequence animation
function TitleSequence({ cards = TITLE_CARDS }) {
  return (
    <>
      {cards.map((c, i) => (
        <Sprite key={i} start={c.t} end={c.end}>
          <TitleCard card={c}/>
        </Sprite>
      ))}

      {/* Persistent timecode — TOP-RIGHT corner, like a director's reel */}
      <Timecode/>

      {/* Subtle film grain over everything */}
      <GrainOverlay/>

      {/* Final flash on title card */}
      <Sprite start={15.6} end={15.85}>
        <FlashFrame/>
      </Sprite>
    </>
  );
}

function TitleCard({ card }) {
  const { localTime, duration } = useSprite();
  const entryDur = 0.55;
  const exitDur = 0.4;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  if (localTime < entryDur) {
    opacity = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
  } else if (localTime > exitStart) {
    opacity = 1 - Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
  }

  const W = 1920, H = 1080;

  if (card.kind === "studio") {
    return (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity,
      }}>
        <div style={{ textAlign: "center" }}>
          {/* Crest mark */}
          <div style={{
            width: 90, height: 90, margin: "0 auto 28px",
            border: `1.5px solid ${tkc("amber")}`,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Fraunces, serif", fontStyle: "italic",
            fontSize: "var(--fs-display)", color: "var(--c-amber)", fontWeight: 400,
            lineHeight: 1,
          }}>C</div>
          <div style={{
            fontFamily: "Fraunces, serif", fontStyle: "italic",
            fontSize: "var(--fs-display)", fontWeight: 400, color:  "var(--c-amber)",
            letterSpacing: "-0.01em", lineHeight: 0.95,
          }}>{card.line1}</div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "var(--fs-lead)", color: "rgba(var(--accent-rgb),.55)",
            textTransform: "uppercase", letterSpacing: ".16em",
            marginTop: 12, paddingLeft: "0.5em",
          }}>{card.line2}</div>
        </div>
      </div>
    );
  }

  if (card.kind === "presents") {
    return (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity,
      }}>
        <div style={{
          fontFamily: "Fraunces, serif", fontStyle: "italic",
          fontSize: "var(--fs-head)", color: "var(--c-agent-writer)", fontWeight: 300,
          letterSpacing: ".02em",
        }}>{card.line1}</div>
      </div>
    );
  }

  if (card.kind === "credit") {
    // Type-on effect for the name — characters reveal one at a time
    const nameDur = 0.7;
    const nameStart = entryDur;
    const charProgress = clamp((localTime - nameStart) / nameDur, 0, 1);
    const charsToShow = Math.ceil(card.name.length * Easing.easeOutQuad(charProgress));
    const visibleName = card.name.slice(0, charsToShow);

    return (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "var(--fs-body)", color: "rgba(212,197,160,.65)",
            textTransform: "uppercase", letterSpacing: ".16em",
            marginBottom: 22, paddingLeft: "0.32em",
          }}>{card.role}</div>
          <div style={{
            fontFamily: "Fraunces, serif",
            fontSize: "var(--fs-display)", color: "var(--c-ink)", fontWeight: 400,
            letterSpacing: ".02em",
            position: "relative",
            minHeight: 80,
          }}>
            {visibleName}
            <span style={{
              display: "inline-block",
              width: 2, height: "0.7em",
              background:  "var(--c-amber)",
              marginLeft: 6,
              opacity: charProgress < 1 ? 1 : 0,
              animation: "title-cursor 0.7s step-end infinite",
              verticalAlign: "baseline",
            }}/>
          </div>
        </div>
        <style>{`@keyframes title-cursor { 50% { opacity: 0 } }`}</style>
      </div>
    );
  }

  if (card.kind === "title") {
    // Title slowly grows / pushes up; second word arrives on a beat
    const word1Pop = clamp(localTime / 0.8, 0, 1);
    const word2Pop = clamp((localTime - 0.7) / 0.8, 0, 1);
    const grow = 1 + Easing.easeOutCubic(clamp(localTime / 4, 0, 1)) * 0.04;

    return (
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity,
        background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb),.04) 0%, transparent 65%)",
      }}>
        <div style={{ textAlign: "center", transform: `scale(${grow})`, transformOrigin: "center" }}>
          <div style={{
            fontFamily: "Fraunces, serif", fontWeight: 400,
            fontSize: "var(--fs-display)", color: "var(--c-ink)",
            lineHeight: 0.92, letterSpacing: "-0.02em",
            opacity: Easing.easeOutCubic(word1Pop),
            transform: `translateY(${(1 - Easing.easeOutCubic(word1Pop)) * 20}px)`,
          }}>{card.line1}</div>
          <div style={{
            fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 400,
            fontSize: "var(--fs-display)", color:  "var(--c-amber)",
            lineHeight: 0.92, letterSpacing: "-0.02em",
            opacity: Easing.easeOutCubic(word2Pop),
            transform: `translateY(${(1 - Easing.easeOutCubic(word2Pop)) * 20}px)`,
            marginTop: -10,
          }}>{card.line2}</div>

          {/* Tagline below — appears late */}
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "var(--fs-body)", color: "rgba(212,197,160,.5)",
            textTransform: "uppercase", letterSpacing: ".16em",
            marginTop: 40, paddingLeft: "0.5em",
            opacity: clamp((localTime - 2.0) / 1.2, 0, 1),
          }}>A film about what you don't see coming</div>
        </div>
      </div>
    );
  }

  return null;
}

function FlashFrame() {
  const { localTime, duration } = useSprite();
  // Single brief flash that fades fast
  const o = Math.max(0, 1 - localTime / duration);
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "rgba(var(--accent-rgb),.18)",
      pointerEvents: "none",
      opacity: o,
    }}/>
  );
}

function Timecode() {
  const time = useTime();
  const ms = Math.floor((time % 1) * 100);
  const s = Math.floor(time);
  const frames = Math.floor((time % 1) * 24);
  return (
    <div style={{
      position: "absolute", top: 28, right: 32,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "var(--fs-body)", color: "rgba(var(--accent-rgb),.55)",
      letterSpacing: ".08em",
      display: "flex", gap: 14, alignItems: "center",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-blood-l)", boxShadow: `0 0 8px ${tkc("bad")}` }}/>
        REC
      </span>
      <span>00:00:{String(s).padStart(2, "0")}:{String(frames).padStart(2, "0")}</span>
      <span style={{ color: "rgba(var(--accent-rgb),.3)" }}>· LL-01 · v0.7 · TAKE 03</span>
    </div>
  );
}

function GrainOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      pointerEvents: "none",
      opacity: 0.08,
      mixBlendMode: "overlay",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
    }}/>
  );
}

// Timeline view — track-based editor for the cards
function TitlesTimeline({ cards = TITLE_CARDS }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      <div className="t-label" style={{ marginBottom: 12 }}>Track 01 · Type</div>
      <div style={{
        position: "relative", height: 64,
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-sm)", marginBottom: 14,
      }}>
        {/* Time ruler */}
        {Array.from({ length: 22 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: `${(i / SEQ_DURATION) * 100}%`, top: 0, bottom: 0,
            width: 1, background: "var(--c-line)",
          }}/>
        ))}
        {cards.map((c, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${(c.t / SEQ_DURATION) * 100}%`,
            width: `${((c.end - c.t) / SEQ_DURATION) * 100}%`,
            top: 6, bottom: 6,
            background: c.kind === "title" ? "var(--c-amber)" : "var(--c-panel-3)",
            border: c.kind === "title" ? "1px solid var(--c-amber-d)" : "1px solid var(--c-line-2)",
            color: c.kind === "title" ? tkc("on-amber") : "var(--c-ink)",
            borderRadius: "var(--r-1)", padding: "4px 8px",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
            textTransform: "uppercase", letterSpacing: ".08em",
            display: "flex", alignItems: "center", gap: 6,
            overflow: "hidden", whiteSpace: "nowrap",
          }}>
            <span style={{ opacity: 0.7 }}>{(c.end - c.t).toFixed(1)}s</span>
            <span>· {c.kind}</span>
          </div>
        ))}
      </div>

      <div className="t-label" style={{ marginBottom: 12 }}>Track 02 · Audio (planned)</div>
      <div style={{
        position: "relative", height: 48,
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-sm)", marginBottom: 14,
        display: "flex", alignItems: "center", padding: "0 14px",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} style={{
              width: 2,
              height: `${10 + Math.abs(Math.sin(i * 0.6)) * 24}px`,
              background: i < 60 ? "var(--c-agent-audio)" : "var(--c-line-3)",
              opacity: i < 60 ? 0.7 : 0.3,
            }}/>
          ))}
        </div>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginLeft: 12 }}>cina_score_v2.wav · 21.0s</span>
      </div>

      <div className="t-label" style={{ marginBottom: 12 }}>Card list</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "32px 80px 100px 1fr 80px",
            gap: 14, alignItems: "center",
            padding: "10px 14px",
            background: "var(--c-panel)", border: "1px solid var(--c-line)",
            borderRadius: "var(--r-sm)",
          }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", fontWeight: 600 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>
              {c.t.toFixed(1)}–{c.end.toFixed(1)}s
            </span>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
              textTransform: "uppercase", letterSpacing: ".08em",
              color: c.kind === "title" ? "var(--c-amber)" : "var(--c-ink-3)",
            }}>{c.kind}</span>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontFamily: "var(--f-display)", fontStyle: "italic" }}>
              {c.role && <span style={{ color: "var(--c-ink-3)", marginRight: 8, fontStyle: "normal", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", textTransform: "uppercase", letterSpacing: ".08em" }}>{c.role}</span>}
              {c.line1 || c.name}
              {c.line2 && <span style={{ color: "var(--c-amber)" }}> · {c.line2}</span>}
            </span>
            <button className="btn btn-ghost" style={{ height: 22, padding: "0 8px", fontSize: "var(--fs-label)" }}>
              <Icon name="more" size={11}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export view — model routing + render queue
function TitlesExport({ filmTitle = "LAST LIGHT" }) {
  const [rendering, setRendering] = useStateT(false);
  const lutSlug = String(filmTitle || "LAST_LIGHT").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").toUpperCase();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 980 }}>
        {/* Specs */}
        <section>
          <div className="t-label" style={{ marginBottom: 12 }}>Output specs</div>
          <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-md)" }}>
            <ExportRow k="Resolution" v="3840 × 2160 (4K UHD)"/>
            <ExportRow k="Frame rate" v="24 fps"/>
            <ExportRow k="Codec"      v="ProRes 422 HQ"/>
            <ExportRow k="Container"  v=".mov"/>
            <ExportRow k="Color"      v={`Rec.709 · ${lutSlug}_v3.cube`}/>
            <ExportRow k="Audio"      v="48kHz · stereo · score sketch v2"/>
            <ExportRow k="Duration"   v="21.0s · 504 frames" last/>
          </div>
        </section>

        {/* Routing */}
        <section>
          <div className="t-label" style={{ marginBottom: 12 }}>Smart routing</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-md)" }}>
            <RouteRow model="Native"  pct={100} hint="type · all cards"/>
            <RouteRow model="Topaz"   pct={0}   hint="upscale · disabled"/>
            <RouteRow model="ElevenLabs" pct={0} hint="VO · n/a"/>
          </div>
          <div style={{
            marginTop: 14, padding: 12,
            background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderLeft: "1.5px solid var(--c-amber)",
            borderRadius: "var(--r-md)",
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55,
          }}>
            All seven cards are pure type. No model needed. We render this in-house at 4K and ship it in eight seconds.
          </div>
        </section>

        {/* Cost */}
        <section style={{ gridColumn: "1 / -1" }}>
          <div className="t-label" style={{ marginBottom: 12 }}>Render queue</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "16px 20px",
            background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-md)",
          }}>
            <div style={{ flex: 1 }}>
              <div className="t-display" style={{ fontSize: "var(--fs-title)", fontStyle: "italic", color: "var(--c-ink)" }}>
                Opening Sequence v3
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 }}>
                7 cards · 504 frames · 4K · ProRes 422 HQ
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".08em" }}>Estimate</div>
              <div className="t-display" style={{ fontSize: "var(--fs-title)", fontStyle: "italic", color: "var(--c-amber)", marginTop: 2 }}>
                00:08 · 0 cr
              </div>
            </div>
            <button
              onClick={() => { setRendering(true); setTimeout(() => setRendering(false), 4500); }}
              className="btn btn-primary"
              style={{ height: 40, padding: "0 18px", fontSize: "var(--fs-body)" }}
            >
              <Icon name="film" size={14}/>
              {rendering ? "Rendering…" : "Render & queue"}
            </button>
          </div>

          {rendering && (
            <div style={{
              marginTop: 12, padding: "12px 16px",
              background: "var(--c-panel-2)", border: "1px solid var(--c-amber-d)", borderRadius: "var(--r-md)",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span className="rec-dot"/>
              <div style={{ flex: 1 }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  Editor agent · QC pass · frame 142 / 504
                </div>
                <div style={{ marginTop: 6, height: 3, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--c-amber)", animation: "render-bar 4.5s linear forwards" }}/>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ExportRow({ k, v, last }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "120px 1fr",
      gap: 14, padding: "10px 14px",
      borderBottom: last ? "none" : "1px solid var(--c-line)",
    }}>
      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</span>
      <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontFamily: "var(--f-mono)" }}>{v}</span>
    </div>
  );
}

Object.assign(window, { TitlesPanel });
