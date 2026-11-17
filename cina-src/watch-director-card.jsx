// watch-director-card.jsx — One shared "Studio + Director" rail card.
//
// Used on BOTH the film watch page and the series page so the relationship
// between a studio (the house), a collective, and the individual director
// (the person) reads identically everywhere. Resolves the "creators /
// directors / studios feel disconnected" confusion: every title now shows
// the studio it came from AND the director inside it, with a one-line label
// that says exactly how they relate.

function dscFmt(n) {
  if (n == null) return "0";
  if (typeof fmtCount === "function") return fmtCount(n);
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + "K";
  return String(n);
}

function DirectorStudioCard({ film }) {
  const creator = (window.CREATORS || []).find(c => c.id === (film && film.creatorId));
  if (!creator) return null;

  const following = typeof isFollowing === "function" && isFollowing(creator.id);
  const collective = (typeof getStudiosForCreator === "function" ? getStudiosForCreator(creator.id) : [])[0];

  // Studio identity — a collective if the director belongs to one, otherwise
  // the director's own one-person studio site.
  const studioName  = collective ? collective.name : `${creator.name} Studio`;
  const studioColor = collective ? collective.color : (creator.color || tkc("amber"));
  const studioLetter = (collective ? collective.name : creator.name)[0];
  const relation = collective
    ? `${(collective.members || []).length}-DIRECTOR COLLECTIVE`
    : "ONE-PERSON STUDIO";
  const domain = collective ? `${collective.id}.cina` : (creator.domain || `${creator.id}.cina`);
  const verified = collective ? !!collective.verified : ((creator.followers || 0) >= 100000);
  const goStudio = () => collective ? navigate("/studios") : navigate(`/creator/${creator.id}`);
  const initials = creator.name.split(" ").map(p => p[0]).join("").slice(0, 2);

  return (
    <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
      {/* ── STUDIO band ── */}
      <div style={{ padding: "16px 18px 14px", background: `linear-gradient(135deg, ${studioColor}1c 0%, transparent 70%)` }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 11 }}>STUDIO</div>
        <button onClick={goStudio} className="btn-ghost" style={{
          padding: 0, height: "auto", width: "100%", justifyContent: "flex-start",
          gap: 12, textAlign: "left", display: "flex", alignItems: "center",
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: "var(--r-2)", background: studioColor, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
            border: "1px solid rgba(255,255,255,.14)",
          }}>{studioLetter}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{studioName}</span>
              {verified && (
                <span title="Verified studio" style={{
                  width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                  background: tkc("cat-1"), color: tkc("panel"), fontSize: "var(--fs-label)", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✓</span>
              )}
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 3 }}>{relation}</div>
          </div>
        </button>
        <button onClick={goStudio} className="t-mono" style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", marginTop: 12,
          background: "transparent", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
          padding: "7px 10px", cursor: "pointer", fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".16em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", flexShrink: 0 }}></span>
          {domain.toUpperCase()}
          <span style={{ flex: 1 }}></span>
          <span style={{ color: "var(--c-amber)" }}>VISIT STUDIO →</span>
        </button>
      </div>

      <div style={{ height: 1, background: "var(--c-line)" }}></div>

      {/* ── DIRECTOR band ── */}
      <div style={{ padding: "14px 18px 16px" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 11 }}>DIRECTOR</div>
        <button onClick={() => navigate(`/creator/${creator.id}`)} className="btn-ghost" style={{
          padding: 0, height: "auto", width: "100%", justifyContent: "flex-start",
          gap: 12, textAlign: "left", marginBottom: 12, display: "flex", alignItems: "center",
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: "50%", background: creator.color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
          }}>{initials}</span>
          <div style={{ minWidth: 0 }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.1 }}>{creator.name}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 1 }}>{dscFmt(creator.followers)} followers</div>
          </div>
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" style={{
            flex: 1, height: 32, justifyContent: "center", fontSize: "var(--fs-body)",
            color: following ? "var(--c-amber)" : "var(--c-ink)",
            borderColor: following ? "rgba(var(--accent-rgb),.4)" : "var(--c-line-2)",
          }} onClick={() => typeof toggleFollow === "function" && toggleFollow(creator.id)}>
            {following ? "✓ Following" : "+ Follow"}
          </button>
          <button className="btn" style={{
            flex: 1, height: 32, justifyContent: "center", fontSize: "var(--fs-body)",
            background: "rgba(var(--accent-rgb),.08)", borderColor: "rgba(var(--accent-rgb),.4)", color:  "var(--c-amber)",
          }} onClick={() => window.openTipModal && window.openTipModal(creator)}>
            Tip director
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DirectorStudioCard });
