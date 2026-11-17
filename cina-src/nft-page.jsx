// nft-page.jsx — Unified NFT detail page.
// Used by Watch (#/nft/:id) and Producers (#project/:id).
// Takes a resolved project object (shape from watch-data.jsx::NFT_PROJECTS,
// or the on-the-fly synthesized variant in producers-app.jsx::buildProjectIndex).
//
// Optional props:
//   film          — CATALOG entry to surface a "Watch on Cina" deep-link
//   onBack        — handler for the breadcrumb
//   navigate      — Watch-style hash router; defaults to direct location.hash set
//   showHolderHub — render <HolderHub> below tiers for non-synthetic projects

const { useState: usNP } = React;

function fmtNftUSD(n) {
  if (!n) return "$0";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "k";
  return "$" + Math.round(n).toLocaleString();
}

function fmtNftViews(n) {
  if (typeof n !== "number") return n || "";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return Math.round(n / 1e3) + "K";
  return String(n);
}

// ─── Co-financing map ────────────────────────────────────────────────────
// The site mentions "investing" in four places; a visitor cannot tell primary
// from secondary from royalty income. This three-step strip — shown on the
// shared pass page (Watch #/nft AND Producers #project) — is the single map
// that ties the two parallel flows together. Numbers come from the project.
function FinancingMap({ project, daysLeft }) {
  const steps = [
    {
      tag: "1 · PRIMARY",
      where: "On Watch — “Back this film”",
      title: "Mint a producer pass",
      body: `Buy a pass straight from the production during the ${daysLeft || "open"}-day mint. Your capital funds the film. Price is fixed by tier.`,
      live: (daysLeft || 0) > 0 ? `${daysLeft} days left to mint` : "Mint closed",
    },
    {
      tag: "2 · SECONDARY",
      where: "On Producers — the market",
      title: "Trade it on the market",
      body: "Once minted, passes trade peer-to-peer on the Producers market. Buy in late or sell your stake anytime at the live floor price.",
      live: "Open 24/7 after mint",
    },
    {
      tag: "3 · ROYALTY",
      where: "Either way you got in",
      title: "Earn the royalty pool",
      body: `Holders split ${project.revShare}% of this film's revenue through Year 5 — paid pro-rata to your stake, whether you bought primary or secondary.`,
      live: `${project.revShare}% of revenue · to Y5`,
      amber: true,
    },
  ];
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>HOW CO-FINANCING WORKS</div>
        <div style={{ fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", color: "var(--c-ink-4)" }}>Three ways money moves on a film — one pass connects all three.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", background: "var(--c-panel)" }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            padding: "18px 20px",
            borderLeft: i === 0 ? "none" : "1px solid var(--c-line)",
            borderTop: s.amber ? "2px solid var(--c-amber)" : "2px solid transparent",
            position: "relative",
            display: "flex", flexDirection: "column", gap: 9,
          }}>
            {i < 2 && (
              <div style={{
                position: "absolute", right: -9, top: "50%", transform: "translateY(-50%)",
                width: 18, height: 18, borderRadius: "50%", zIndex: 2,
                background: "var(--c-bg)", border: "1px solid var(--c-line-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--c-ink-3)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)",
              }}>→</div>
            )}
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: s.amber ? "var(--c-amber)" : "var(--c-ink-3)", fontWeight: 700 }}>{s.tag}</div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>{s.title}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", textTransform: "uppercase" }}>{s.where}</div>
            <p style={{ margin: "2px 0 0", fontSize: "var(--fs-body)", lineHeight: 1.5, color: "var(--c-ink-2)" }}>{s.body}</p>
            <div style={{ marginTop: "auto", paddingTop: 8 }}>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color: s.amber ? "var(--c-amber)" : "var(--c-ink-3)",
                background: s.amber ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel-2)",
                border: `1px solid ${s.amber ? "rgba(var(--accent-rgb),.3)" : "var(--c-line)"}`,
                borderRadius: "var(--r-1)", padding: "4px 8px", display: "inline-block",
              }}>{s.live}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnifiedNFTPage({ project, film, onBack, navigate: nav, showHolderHub = false }) {
  const [checkout, setCheckout] = usNP(null);
  if (!project) {
    return <div style={{ padding: 56, color: "var(--c-ink-2)", fontFamily: "var(--f-sans)" }}>Project not found.</div>;
  }

  const navTo = nav || ((url) => { location.hash = url; });
  const pct = Math.min(100, (project.raised / project.goal) * 100);
  const linkedFilm = film || project.film;
  const kindLabel = (project.kind || linkedFilm?.kind) === "series" ? "SERIES NFT" : "FILM NFT";
  const chain = (project.chain || "Base").toUpperCase();
  const title = linkedFilm?.title || project.title;
  const totalSold = project.tiers.reduce((s, t) => s + t.sold, 0);
  const totalCount = project.tiers.reduce((s, t) => s + t.count, 0);

  const HeartBtn = window.HeartButton;
  const HoldHub = window.HolderHub;
  const FT = window.FrameThumb;

  const heroBg = project.color || tkc("cat-3");
  const heroThumb = project.thumb || project.film?.thumb || linkedFilm?.thumb;

  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "22px 32px 96px" }}>

      {/* ─── Back link ─── */}
      {onBack && (
        <button onClick={onBack} style={{
          appearance: "none", border: 0, background: "transparent", color: "var(--c-ink-3)",
          cursor: "pointer", fontSize: "var(--fs-body)", marginBottom: 18, padding: 0,
          display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--f-sans)",
        }}>
          ← All projects
        </button>
      )}

      {/* ─── HERO ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.25fr 1fr",
        gap: 32, marginBottom: 30, paddingBottom: 28,
        borderBottom: "1px solid var(--c-line)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color:  "var(--c-amber)",
              letterSpacing: ".16em", padding: "5px 10px",
              background: "rgba(var(--accent-rgb),.08)", border: "1px solid rgba(var(--accent-rgb),.35)",
              borderRadius: "var(--r-1)",
            }}>{kindLabel} · {chain}</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
              {(project.creator || "").toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
            <h1 style={{
              flex: 1, margin: 0,
              fontFamily: "var(--f-display)", fontStyle: "italic",
              fontSize: "var(--fs-display)", lineHeight: 0.95, letterSpacing: "-0.02em",
              fontWeight: 400, textWrap: "balance", color: "var(--c-ink)",
            }}>{title}</h1>
            <div style={{ display: "flex", gap: 8, paddingTop: 10, alignItems: "center" }}>
              {HeartBtn && <HeartBtn projectId={project.id} size={20}/>}
              {window.openBidModal && (
                <button onClick={() => window.openBidModal(project)} style={{
                  appearance: "none", padding: "9px 14px",
                  background: "transparent", border: "1px solid var(--c-line-2)",
                  borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", cursor: "pointer",
                  fontFamily: "var(--f-sans)",
                }}>Place bid →</button>
              )}
            </div>
          </div>

          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginBottom: 18 }}>
            by {project.creator}
          </div>
          <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: "0 0 28px", maxWidth: 580 }}>
            {project.summary}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, maxWidth: 560 }}>
            {[
              { l: "RAISED", v: fmtNftUSD(project.raised), s: `of ${fmtNftUSD(project.goal)}` },
              { l: "BACKERS", v: (project.backers || 0).toLocaleString(), s: "holders" },
              { l: "ENDS IN", v: `${project.daysLeft}d`, s: "primary mint" },
              { l: "REV SHARE", v: `${project.revShare}%`, s: "through Y5", amber: true },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 6 }}>{s.l}</div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-head)",
                  lineHeight: 1, color: s.amber ? "var(--c-amber)" : "var(--c-ink)",
                  fontWeight: 500,
                }}>{s.v}</div>
                <div style={{ fontFamily: "var(--f-sans)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 5 }}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          aspectRatio: "16/10", borderRadius: "var(--r-3)", overflow: "hidden",
          background: heroBg, position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,.4)",
        }}>
          {FT && heroThumb ? (
            <FT kind={heroThumb} usePhoto/>
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,.4)", fontFamily: "var(--f-mono)",
              letterSpacing: ".16em", fontSize: "var(--fs-label)",
            }}>{kindLabel}</div>
          )}
        </div>
      </div>

      {/* ─── FUNDING CARD ─── */}
      <div style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", padding: "20px 24px", marginBottom: 30,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>FUNDING PROGRESS</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{ height: 8, background: "var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", marginBottom: 10 }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            background: "linear-gradient(90deg, var(--c-amber-d) 0%, var(--c-amber) 100%)",
            boxShadow: "0 0 12px rgba(var(--accent-rgb),.4)",
          }}/>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", fontFamily: "var(--f-mono)" }}>
          <span><span style={{ color: "var(--c-ink)", fontWeight: 600 }}>{fmtNftUSD(project.raised)}</span> raised</span>
          <span>{totalSold.toLocaleString()} / {totalCount.toLocaleString()} stakes minted</span>
          <span>goal {fmtNftUSD(project.goal)}</span>
        </div>
      </div>

      {/* ─── CO-FINANCING MAP — primary · secondary · royalty ─── */}
      <FinancingMap project={project} daysLeft={project.daysLeft}/>

      {/* ─── TIER PICKER ─── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>CHOOSE A TIER</div>
          {project.contract && (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>
              CONTRACT {project.contract} · {chain}
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {project.tiers.map((t) => {
            const remaining = t.count - t.sold;
            const sold = t.count > 0 ? t.sold / t.count : 0;
            const isProducer = t.id === "producer";
            const isPatron = t.id === "patron";
            return (
              <div key={t.id} style={{
                padding: 22,
                background: isProducer
                  ? "linear-gradient(180deg, rgba(var(--accent-rgb),.08), var(--c-panel) 70%)"
                  : "var(--c-panel)",
                border: `1px solid ${isProducer ? "rgba(var(--accent-rgb),.5)" : isPatron ? "rgba(168,88,56,.35)" : "var(--c-line)"}`,
                borderRadius: "var(--r-3)",
                display: "flex", flexDirection: "column", gap: 14,
                minHeight: 280,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>TIER</div>
                    <div style={{
                      fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", fontWeight: 500,
                      color: t.color, fontStyle: "italic", marginTop: 4, lineHeight: 1,
                    }}>{t.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", fontWeight: 500, color: "var(--c-ink)", lineHeight: 1 }}>
                      ${(t.priceUSD || 0).toLocaleString()}
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 5 }}>
                      {t.price ? `${t.price} ETH` : ""}
                    </div>
                  </div>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {t.perks.map((p, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>
                      <span style={{ flexShrink: 0, color: t.color, marginTop: 1 }}>◆</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: "auto" }}>
                  <div style={{ height: 3, borderRadius: 999, background: "var(--c-line)", overflow: "hidden" }}>
                    <div style={{ width: `${sold * 100}%`, height: "100%", background: t.color }}/>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                    <span>{t.sold.toLocaleString()} / {t.count.toLocaleString()} minted</span>
                    <span>{remaining.toLocaleString()} left</span>
                  </div>
                </div>

                <button
                  onClick={() => setCheckout(t)}
                  disabled={remaining <= 0}
                  style={{
                    appearance: "none", padding: "11px 14px",
                    background: remaining <= 0 ? "var(--c-line)" : isProducer ? "var(--c-amber)" : "transparent",
                    color: remaining <= 0 ? "var(--c-ink-3)" : isProducer ? tkc("on-amber") : "var(--c-ink)",
                    border: isProducer ? "0" : "1px solid var(--c-line-2)",
                    borderRadius: "var(--r-2)", fontWeight: 600, fontSize: "var(--fs-body)",
                    cursor: remaining <= 0 ? "not-allowed" : "pointer",
                    fontFamily: "var(--f-sans)",
                  }}>
                  {remaining <= 0 ? "Sold out" : `Buy ${t.name.toLowerCase()} →`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── TIMELINE + film sidebar ─── */}
      {(project.timeline?.length || linkedFilm) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: (linkedFilm && FT) ? "1fr 320px" : "1fr",
          gap: 24, marginBottom: 12,
        }}>
          <div>
            {project.timeline && project.timeline.length > 0 && (
              <>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 12 }}>TIMELINE</div>
                <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 20 }}>
                  {project.timeline.map((m, i, arr) => (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--c-line)" : "none" }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: m.state === "done" ? "var(--c-good)"
                                  : m.state === "live" ? "var(--c-amber)"
                                  : m.state === "next" ? "transparent"
                                  : "var(--c-panel-2)",
                        border: m.state === "next" ? "2px solid var(--c-amber)" : "1px solid var(--c-line-2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: m.state === "done" ? tkc("panel-2")
                             : m.state === "live" ? tkc("on-amber")
                             : m.state === "next" ? "var(--c-amber)"
                             : "var(--c-ink-3)",
                        fontSize: "var(--fs-label)", fontWeight: 700, fontFamily: "var(--f-mono)", flexShrink: 0,
                      }}>{m.state === "done" ? "✓" : i + 1}</div>
                      <div>
                        <div style={{
                          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
                          color: m.state === "done" ? "var(--c-good)"
                               : m.state === "live" ? "var(--c-blood-l)"
                               : m.state === "next" ? "var(--c-amber)"
                               : "var(--c-ink-3)",
                          letterSpacing: ".16em",
                        }}>
                          {m.d} {m.state === "live" && "· LIVE NOW"} {m.state === "next" && "· NEXT"}
                        </div>
                        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", marginTop: 3 }}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {linkedFilm && FT && (
            <aside>
              <button onClick={() => navTo(linkedFilm.kind === "series" ? `/series/${linkedFilm.id}` : `/film/${linkedFilm.id}`)}
                style={{
                  appearance: "none", width: "100%", padding: 14, background: "var(--c-panel)",
                  border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 12, textAlign: "left",
                }}>
                <div style={{ aspectRatio: "16/9", borderRadius: "var(--r-2)", overflow: "hidden", background: linkedFilm.color }}>
                  <FT kind={linkedFilm.thumb} usePhoto/>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 6 }}>WATCH ON CINA</div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{linkedFilm.title}</div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 }}>
                    {linkedFilm.views ? `${fmtNftViews(linkedFilm.views)} viewers` : ""}
                    {linkedFilm.rating ? ` · ★ ${linkedFilm.rating}` : ""}
                  </div>
                </div>
              </button>
            </aside>
          )}
        </div>
      )}

      {/* ─── HOLDER HUB ─── */}
      {showHolderHub && !project.synthetic && HoldHub && (
        <div style={{ marginTop: 36, paddingTop: 26, borderTop: "1px solid var(--c-line)" }}>
          <div className="holder-surface" style={{ borderRadius: "var(--r-3)", overflow: "hidden", margin: "0 -32px" }}>
            <HoldHub initialProjectId={project.id}/>
          </div>
        </div>
      )}

      {checkout && window.NFTCheckout && (
        <NFTCheckout project={project} tier={checkout} onClose={() => setCheckout(null)}/>
      )}
    </div>
  );
}

Object.assign(window, { UnifiedNFTPage, FinancingMap, fmtNftUSD });
