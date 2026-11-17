// holder-hub.jsx — Governance chat + votes + live earnings for an NFT holder.
// This is the OTHER side of the chain — connects what advertisers pay to who receives.

const { useState: hhUseState, useMemo: hhUseMemo, useRef: hhUseRef, useEffect: hhUseEffect } = React;
const $f = (n, d = 0) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n) => Math.round(Number(n || 0) * 100) + "%";
const compact = (n) => Number(n || 0) >= 1000 ? (Number(n || 0) / 1000).toFixed(1) + "k" : String(n || 0);

function HolderHub({ initialProjectId = "voss-ll" }) {
  const [projectId, setProjectId] = hhUseState(initialProjectId);
  const project = NFT_PROJECTS[projectId];
  const film = CATALOG.find(f => f.id === project.filmId);
  const votes = ACTIVE_VOTES[projectId] || [];

  // Pretend the user holds 4 collectors + 1 patron in this project
  const myHoldings = { collector: 4, patron: 1, producer: 0 };
  const myValueUSD = myHoldings.collector * project.tiers[0].priceUSD
                    + myHoldings.patron * project.tiers[1].priceUSD
                    + myHoldings.producer * project.tiers[2].priceUSD;

  // Synthesize earnings — recent ad-driven payouts to this holder
  const myWeight = myHoldings.collector * TIER_WEIGHTS.collector
                 + myHoldings.patron * TIER_WEIGHTS.patron
                 + myHoldings.producer * TIER_WEIGHTS.producer;
  const totalProjectWeight = project.tiers.reduce((s, t) =>
    s + t.sold * TIER_WEIGHTS[t.id], 0);
  const myShare = myWeight / totalProjectWeight;
  const myEarningsLifetime = (project.royaltyPaid || 0) * myShare;
  const myEarnings30d = myEarningsLifetime * 0.18;

  return (
    <div className="holder-surface" style={{ minHeight: "calc(100vh - 60px)" }}>
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "28px 32px 96px" }}>

        {/* Project picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.6)", letterSpacing: ".16em" }}>
            HOLDER HUB · YOUR PROJECTS
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.values(NFT_PROJECTS).slice(0, 5).map(p => (
              <button key={p.id} onClick={() => setProjectId(p.id)} style={{
                appearance: "none", cursor: "pointer",
                padding: "5px 12px", borderRadius: 999,
                background: projectId === p.id ? "var(--c-amber)" : "transparent",
                color: projectId === p.id ? tkc("on-amber") : "rgba(232,227,214,.7)",
                border: `1px solid ${projectId === p.id ? "var(--c-amber)" : "rgba(232,227,214,.18)"}`,
                fontSize: "var(--fs-body)",
              }}>{p.title}</button>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, marginBottom: 28, paddingBottom: 22, borderBottom: "1px solid rgba(232,227,214,.12)" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em", marginBottom: 8 }}>
              {film?.creator?.toUpperCase() || project.title}
            </div>
            <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-head)", lineHeight: 1.05, margin: 0, fontWeight: 400, color: "var(--c-ink)" }}>
              {project.title}
            </h1>
            <p style={{ fontSize: "var(--fs-body)", color: "rgba(232,227,214,.7)", margin: "10px 0 0", maxWidth: 580, lineHeight: 1.5 }}>
              {project.summary || "Your stake, your earnings, your vote. Talk to the creator. Approve sponsors. Watch the money come in."}
            </p>
          </div>
          <div style={{ aspectRatio: "16/9", borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid rgba(232,227,214,.18)" }}>
            <FrameThumb kind={film?.thumb || "darkroom-est"} />
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <HoldStat label="YOUR HOLDINGS" value={myHoldings.collector + myHoldings.patron + myHoldings.producer} sub={`${myHoldings.collector}× collector · ${myHoldings.patron}× patron`} />
          <HoldStat label="ESTIMATED VALUE" value={$f(myValueUSD)} sub={`+${pct(0.14)} this month`} trend="up" />
          <HoldStat label="EARNINGS · 30D" value={$f(myEarnings30d, 2)} sub={`incl. ad revenue from Pitch`} trend="up" />
          <HoldStat label="LIFETIME PAYOUTS" value={$f(myEarningsLifetime, 2)} sub={`next distribution ${project.nextDistribution || "—"}`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
          {/* Left — value chart + votes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <ValueChart project={project} myShare={myShare} />
            <BidBook project={project} />
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em", marginBottom: 10 }}>
                ACTIVE VOTES · {votes.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {votes.map(v => <VoteCard key={v.id} v={v} />)}
                {votes.length === 0 && (
                  <div style={{ padding: 24, textAlign: "center", color: "rgba(232,227,214,.5)", border: "1px dashed rgba(232,227,214,.18)", borderRadius: "var(--r-3)" }}>
                    No active votes on this project.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — holder chat */}
          <HolderChat projectId={projectId} project={project} film={film} />
        </div>
      </div>
    </div>
  );
}

function HoldStat({ label, value, sub, trend }) {
  return <CinaStat label={label} value={value} sub={sub} trend={trend}/>;
}

function ValueChart({ project, myShare }) {
  // Synth a 90-day floor price line
  const points = hhUseMemo(() => Array.from({ length: 90 }, (_, i) => {
    const v = project.floorUSD * (0.85 + Math.sin(i / 9) * 0.08 + (i / 90) * 0.18);
    return v;
  }), [project.id]);
  const w = 720, h = 180, pad = 8;
  const min = Math.min(...points) * 0.95, max = Math.max(...points) * 1.05;
  const pts = points.map((v, i) => [
    pad + (i/(points.length-1)) * (w-pad*2),
    h - pad - ((v - min)/(max - min)) * (h - pad*2),
  ]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fill = `${path} L${pts[pts.length-1][0]},${h-pad} L${pts[0][0]},${h-pad} Z`;
  return (
    <div style={{ padding: 18, background: "rgba(232,227,214,.04)", border: "1px solid rgba(232,227,214,.12)", borderRadius: "var(--r-3)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em" }}>FLOOR · 90D</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>
            ${project.floorUSD} <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-good)" }}>+18%</span>
          </div>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", textAlign: "right" }}>
          your share<br/><span style={{ color: "var(--c-amber)" }}>{(myShare * 100).toFixed(2)}%</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 180 }}>
        <defs>
          <linearGradient id="vgrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor= "var(--c-amber)" stopOpacity=".35" />
            <stop offset="100%" stopColor= "var(--c-amber)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(y =>
          <line key={y} x1={pad} x2={w-pad} y1={pad + (h-pad*2)*y} y2={pad + (h-pad*2)*y} stroke="rgba(232,227,214,.08)" strokeDasharray="2 4"/>
        )}
        <path d={fill} fill="url(#vgrad)" />
        <path d={path} fill="none" stroke= "var(--c-amber)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function BidBook({ project }) {
  const bids = [
    { addr: "0xCAFE…91a2", tier: "patron",  priceUSD: project.tiers[1].priceUSD * 1.18, qty: 1, t: "12 min ago" },
    { addr: "0x49DA…0b4c", tier: "collector", priceUSD: project.tiers[0].priceUSD * 1.04, qty: 3, t: "44 min ago" },
    { addr: "0x12C8…aa7e", tier: "patron",  priceUSD: project.tiers[1].priceUSD * 1.06, qty: 1, t: "2h ago" },
    { addr: "0xBEEF…ff03", tier: "collector", priceUSD: project.tiers[0].priceUSD * 0.98, qty: 5, t: "5h ago" },
  ];
  return (
    <div style={{ padding: 18, background: "rgba(232,227,214,.04)", border: "1px solid rgba(232,227,214,.12)", borderRadius: "var(--r-3)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em" }}>OPEN BIDS · ON YOUR HOLDINGS</div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{bids.length} active</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {bids.map((b, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "120px 90px 1fr 90px 80px",
            alignItems: "center", gap: 10,
            padding: "9px 12px",
            background: "rgba(232,227,214,.025)",
            border: "1px solid rgba(232,227,214,.08)",
            borderRadius: "var(--r-2)",
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)",
          }}>
            <span style={{ color: "rgba(232,227,214,.7)" }}>{b.addr}</span>
            <span style={{ color: "rgba(232,227,214,.5)" }}>{b.tier}</span>
            <span style={{ color: "var(--c-amber)" }}>${b.priceUSD.toFixed(0)} <span style={{ color: "rgba(232,227,214,.4)" }}>× {b.qty}</span></span>
            <span style={{ color: "rgba(232,227,214,.4)", fontSize: "var(--fs-label)" }}>{b.t}</span>
            <button style={{
              appearance: "none", border: "1px solid rgba(232,227,214,.2)", background: "transparent",
              color: "rgba(232,227,214,.8)", padding: "4px 8px", borderRadius: "var(--r-2)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", cursor: "pointer",
            }}>review</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoteCard({ v }) {
  const [yourVote, setYourVote] = hhUseState(v.yourVote);
  const total = v.yesPower + v.noPower + v.abstainPower;
  const yes = v.yesPower / total, no = v.noPower / total;
  const closes = new Date(v.closes);
  const hoursLeft = Math.max(0, (closes - Date.now()) / 36e5);
  const kindBadge = {
    "ad-approval":  { label: "AD · APPROVE",  c: "var(--c-amber)" },
    "ad-rejection": { label: "AD · REJECT",   c: tkc("bad") },
    "greenlight":   { label: "GREENLIGHT",    c: tkc("good") },
    "creative":     { label: "CREATIVE",      c: tkc("cat-1") },
  }[v.kind] || { label: "GOVERNANCE", c: "rgba(232,227,214,.5)" };

  return (
    <div style={{
      padding: 16,
      background: "rgba(232,227,214,.04)",
      border: "1px solid rgba(232,227,214,.12)",
      borderRadius: "var(--r-3)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <span style={{
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            padding: "2px 6px", borderRadius: "var(--r-1)",
            background: `color-mix(in oklab, ${kindBadge.c} 16%, transparent)`,
            color: kindBadge.c, marginRight: 8,
          }}>{kindBadge.label}</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)" }}>
            {hoursLeft < 24 ? `${hoursLeft.toFixed(0)}h left` : `${Math.floor(hoursLeft/24)}d left`}
          </span>
        </div>
        <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)" }}>
          {v.thread} comments
        </span>
      </div>

      <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 }}>{v.title}</div>
      <div style={{ fontSize: "var(--fs-body)", color: "rgba(232,227,214,.65)", lineHeight: 1.45, marginBottom: 12 }}>{v.summary}</div>

      {v.payoutPreview != null && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", marginBottom: 10, background: "rgba(var(--accent-rgb),.12)", borderRadius: "var(--r-2)", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>
          {v.payoutPreview > 0 ? "+" : ""}{$f(v.payoutPreview)} to holder pool if passed
        </div>
      )}

      {/* Tally bar */}
      <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(232,227,214,.08)", marginBottom: 8 }}>
        <div style={{ width: `${yes*100}%`, background: "var(--c-good)" }} />
        <div style={{ width: `${no*100}%`, background: "var(--c-blood-l)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.55)", marginBottom: 12 }}>
        <span>YES {pct(yes)} · {compact(v.yesPower)} pwr</span>
        <span>NO {pct(no)} · {compact(v.noPower)} pwr</span>
      </div>

      {/* Vote buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        {["yes","no","abstain"].map(opt => (
          <button key={opt} onClick={() => setYourVote(opt)} style={{
            flex: 1, appearance: "none", padding: "8px 0",
            background: yourVote === opt
              ? (opt === "yes" ? tkc("good") : opt === "no" ? tkc("bad") : "rgba(232,227,214,.2)")
              : "transparent",
            color: yourVote === opt ? tkc("bg") : "rgba(232,227,214,.7)",
            border: `1px solid ${yourVote === opt ? "transparent" : "rgba(232,227,214,.18)"}`,
            borderRadius: "var(--r-2)", fontSize: "var(--fs-label)", fontWeight: 600, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: ".08em",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function HolderChat({ projectId, project, film }) {
  const seed = HOLDER_CHAT[projectId] || [];
  const [msgs, setMsgs] = hhUseState(seed);
  const [draft, setDraft] = hhUseState("");
  const scrollRef = hhUseRef(null);

  hhUseEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, { user: "you.eth", role: "patron", color: tkc("cat-3"), text: draft, t: new Date().toISOString(), avatar: "Y" }]);
    setDraft("");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      background: "rgba(232,227,214,.04)",
      border: "1px solid rgba(232,227,214,.12)",
      borderRadius: "var(--r-3)",
      height: "calc(100vh - 220px)", minHeight: 540,
      position: "sticky", top: 86,
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(232,227,214,.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.5)", letterSpacing: ".16em" }}>HOLDER ROOM</div>
            <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)", marginTop: 2 }}>{project.title}</div>
          </div>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>● {project.backers} holders</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => <ChatMsg key={i} m={m} />)}
      </div>

      {/* Composer */}
      <div style={{ padding: 12, borderTop: "1px solid rgba(232,227,214,.1)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Talk to the creator and 1,341 other holders…"
            style={{
              flex: 1, appearance: "none",
              background: "rgba(232,227,214,.06)",
              border: "1px solid rgba(232,227,214,.14)",
              borderRadius: "var(--r-2)", padding: "9px 12px",
              color: "var(--c-ink)", fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)",
              outline: "none",
            }}
          />
          <button onClick={send} style={{
            appearance: "none", padding: "8px 12px",
            background: "var(--c-amber)", color: "var(--c-on-amber)",
            border: 0, borderRadius: "var(--r-2)", cursor: "pointer",
            fontWeight: 600, fontSize: "var(--fs-body)",
          }}><Icon name="send" size={13} /></button>
        </div>
        <div style={{ marginTop: 8, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)", display: "flex", justifyContent: "space-between" }}>
          <span>Voting power weighted by tier · your power: 12·</span>
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
}

function ChatMsg({ m }) {
  const isAgent = m.role === "agent";
  const isCreator = m.role === "creator";
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: isAgent ? "var(--c-amber)" : m.color,
        color: isAgent ? tkc("on-amber") : tkc("white"),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-display)", fontSize: "var(--fs-label)", fontWeight: 600, flexShrink: 0,
      }}>{m.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 2 }}>
          <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: isCreator ? "var(--c-amber)" : isAgent ? "var(--c-amber)" : tkc("ink") }}>
            {m.user}
          </span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.4)", letterSpacing: ".08em" }}>
            {m.role.toUpperCase()}
          </span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "rgba(232,227,214,.3)" }}>
            {new Date(m.t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div style={{
          fontSize: "var(--fs-body)", color: "rgba(232,227,214,.85)", lineHeight: 1.45,
          padding: isAgent ? "8px 10px" : 0,
          background: isAgent ? "rgba(var(--accent-rgb),.08)" : "transparent",
          borderRadius: isAgent ? 6 : 0,
          borderLeft: isAgent ? "2px solid var(--c-amber)" : "none",
        }}>{m.text}</div>
      </div>
    </div>
  );
}

Object.assign(window, { HolderHub });
