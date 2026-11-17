// watch-royalty.jsx — Director Royalty Pool · the public ledger
// "Train on us, earn for life." Every film that cites a director's style
// tithes 5% of revenue into a pool. This page makes the graph public.
//
// Route: /royalty

const { useState: usRy, useEffect: ueRy, useMemo: umRy, useRef: urRy } = React;

// ─── Data ────────────────────────────────────────────────────────────────

const RP_MONTHS = [
  { id: "2026-05", label: "May 2026", pool: 2_847_392, paidCount: 1284 },
  { id: "2026-04", label: "Apr 2026", pool: 2_488_220, paidCount: 1198 },
  { id: "2026-03", label: "Mar 2026", pool: 2_316_400, paidCount: 1142 },
  { id: "2026-02", label: "Feb 2026", pool: 2_104_990, paidCount: 1080 },
  { id: "2026-01", label: "Jan 2026", pool: 1_972_840, paidCount: 1024 },
  { id: "2025-12", label: "Dec 2025", pool: 1_842_600, paidCount:  980 },
];
const RP_POOL_LIFETIME = 41_209_887;

// 6-month spark for the pool itself (oldest → newest)
const RP_POOL_SPARK = RP_MONTHS.slice().reverse().map(m => m.pool);

const RP_CITED = [
  { id: "kurosawa",  name: "Akira Kurosawa",   short: "Kurosawa",  era: "Estate",  years: "1950–1990", cites: 412, paid: 184_220, growth:  9, color: "var(--c-amber)", strength: 4.8,
    hits: ["weather as character", "long-take violence", "frame composition"],
    citingFilms: [{ id: "thefence", t: "The Fence", who: "Y. Kim", $: 18_440 }, { id: "obsidian", t: "Obsidian", who: "Y. Kim", $: 12_800 }, { id: "longhall", t: "Long Hall", who: "M. Aikara", $: 9_220 }, { id: "ll", t: "Last Light", who: "E. Voss", $: 8_420 }],
    claimed: true, claimant: "Kurosawa Foundation",
    spark: [80, 92, 110, 138, 142, 168, 184],
  },
  { id: "wong", name: "Wong Kar-wai", short: "Kar-wai", era: "Active", years: "1988–2024", cites: 388, paid: 162_980, growth: 22, color: tkc("bad"), strength: 4.7,
    hits: ["slow motion in crowds", "warm neons", "lonely interiority"],
    citingFilms: [{ id: "thequiet", t: "The Quiet Hour", who: "E. Voss", $: 22_140 }, { id: "ghosting", t: "Ghosting", who: "T. Roan", $: 14_220 }, { id: "ll", t: "Last Light", who: "E. Voss", $: 11_400 }, { id: "swallows", t: "Swallows", who: "M. Sten", $: 8_140 }],
    claimed: true, claimant: "Block 2 Pictures (Kar-wai estate licensing)",
    spark: [62, 78, 92, 108, 132, 148, 162],
  },
  { id: "tarkovsky", name: "Andrei Tarkovsky", short: "Tarkovsky", era: "Trust",  years: "1962–1986", cites: 244, paid: 122_710, growth: 4, color: tkc("cat-1"), strength: 4.5,
    hits: ["water imagery", "interior monologue", "long static takes"],
    citingFilms: [{ id: "frequency", t: "Frequency 88.6", who: "T. Reng", $: 14_220 }, { id: "drift", t: "Drift", who: "C. Bridge", $: 9_840 }, { id: "cellar", t: "Cellar Door", who: "S. Park", $: 6_120 }],
    claimed: true, claimant: "International Tarkovsky Institute",
    spark: [98, 102, 108, 112, 118, 120, 122],
  },
  { id: "denis", name: "Claire Denis", short: "Denis", era: "Active", years: "1988–2024", cites: 207, paid:  98_120, growth: 18, color: tkc("cat-2"), strength: 4.4,
    hits: ["bodies in close-up", "elliptical edit"],
    citingFilms: [{ id: "tender", t: "Tender", who: "M. Sten", $: 12_220 }, { id: "carrion", t: "Carrion", who: "J. Saro", $: 9_140 }, { id: "ghosting", t: "Ghosting", who: "T. Roan", $: 6_440 }],
    claimed: true, claimant: "Claire Denis (direct)",
    spark: [40, 52, 64, 72, 78, 88, 98],
  },
  { id: "jarmusch", name: "Jim Jarmusch", short: "Jarmusch", era: "Active", years: "1980–2024", cites: 184, paid:  82_440, growth: -3, color: tkc("cat-4"), strength: 4.2,
    hits: ["deadpan rhythm", "street-corner geography"],
    citingFilms: [{ id: "cardinal", t: "Cardinal Rules", who: "S. Park", $: 12_140 }, { id: "moss", t: "Moss", who: "J. Aikara", $: 5_220 }, { id: "swallows", t: "Swallows", who: "M. Sten", $: 4_120 }],
    claimed: false, claimant: null,
    spark: [78, 84, 80, 86, 90, 86, 82],
  },
  { id: "lynch", name: "David Lynch", short: "Lynch", era: "Estate", years: "1976–2024", cites: 158, paid:  74_500, growth: 11, color: tkc("blood-x"), strength: 4.3,
    hits: ["red drape", "drone room", "uncomfortable silence"],
    citingFilms: [{ id: "cellar", t: "Cellar Door", who: "S. Park", $: 14_640 }, { id: "pelt", t: "Pelt", who: "J. Saro", $: 6_220 }, { id: "needle", t: "Needle", who: "Y. Kim", $: 4_840 }],
    claimed: true, claimant: "Lynch Foundation",
    spark: [42, 48, 56, 60, 66, 72, 74],
  },
  { id: "chazelle", name: "Damien Chazelle", short: "Chazelle", era: "Active", years: "2012–2024", cites: 142, paid:  61_880, growth:  6, color: "var(--c-amber)", strength: 4.0,
    hits: ["whip pan tempo", "yellow + cyan grade"],
    citingFilms: [{ id: "verge", t: "Verge", who: "L. Hara", $: 9_220 }, { id: "kindling", t: "Kindling", who: "J. Saro", $: 6_440 }, { id: "anvil", t: "Anvil", who: "T. Reng", $: 4_100 }],
    claimed: false, claimant: null,
    spark: [38, 42, 48, 52, 56, 58, 62],
  },
  { id: "varda", name: "Agnès Varda", short: "Varda", era: "Estate", years: "1955–2019", cites: 128, paid:  58_240, growth: 13, color: tkc("amber-d"), strength: 4.1,
    hits: ["essay film voice-over", "found-object closeups"],
    citingFilms: [{ id: "moss", t: "Moss", who: "J. Aikara", $: 8_440 }, { id: "after", t: "After", who: "M. Sten", $: 5_640 }, { id: "thequiet", t: "The Quiet Hour", who: "E. Voss", $: 4_220 }],
    claimed: true, claimant: "Ciné-Tamaris (Varda estate)",
    spark: [32, 38, 44, 48, 52, 54, 58],
  },
];

const RP_RECENT_PAYMENTS = [
  { to: "wong",      label: "Wong Kar-wai",       amount: 384.20, fromTitle: "The Quiet Hour", fromCreator: "Voss", filmId: "thequiet", citation: "warm neons" },
  { to: "tarkovsky", label: "Tarkovsky Trust",    amount: 612.80, fromTitle: "Frequency 88.6", fromCreator: "Reng", filmId: "frequency", citation: "long static takes" },
  { to: "kurosawa",  label: "Kurosawa Foundation",amount: 184.50, fromTitle: "The Fence",      fromCreator: "Kim",  filmId: "thefence", citation: "weather as character" },
  { to: "lynch",     label: "Lynch Foundation",   amount:  72.10, fromTitle: "Cellar Door",    fromCreator: "Park", filmId: "cellar", citation: "red drape" },
  { to: "denis",     label: "Claire Denis",       amount: 244.00, fromTitle: "Tender",         fromCreator: "Sten", filmId: "tender", citation: "bodies in close-up" },
  { to: "varda",     label: "Varda estate",       amount: 412.50, fromTitle: "Moss",           fromCreator: "Aikara", filmId: "moss", citation: "essay voice-over" },
  { to: "jarmusch",  label: "Jim Jarmusch",       amount:  88.40, fromTitle: "Cardinal Rules", fromCreator: "Park", filmId: "cardinal", citation: "deadpan rhythm" },
  { to: "wong",      label: "Wong Kar-wai",       amount: 224.10, fromTitle: "Ghosting",       fromCreator: "Roan", filmId: "ghosting", citation: "slow mo in crowds" },
  { to: "kurosawa",  label: "Kurosawa Foundation",amount: 145.00, fromTitle: "Obsidian",       fromCreator: "Kim",  filmId: "obsidian", citation: "frame composition" },
  { to: "chazelle",  label: "Chazelle (active)",  amount:  61.40, fromTitle: "Verge",          fromCreator: "Hara", filmId: "verge", citation: "whip pan" },
  { to: "denis",     label: "Claire Denis",       amount: 198.20, fromTitle: "Carrion",        fromCreator: "Saro", filmId: "carrion", citation: "elliptical edit" },
];

const RP_TOP_CITERS = [
  { id: "voss",  name: "Elias Voss",   films: 7, citationsOut: 38, paidOut: 12_440 },
  { id: "reng",  name: "Tao Reng",     films: 5, citationsOut: 29, paidOut: 18_220 },
  { id: "ykim",  name: "Yara Kim",     films: 6, citationsOut: 24, paidOut:  9_800 },
  { id: "sten",  name: "Mira Sten",    films: 4, citationsOut: 22, paidOut:  8_650 },
  { id: "aika",  name: "June Aikara",  films: 4, citationsOut: 19, paidOut:  6_420 },
];

function fmtRpUSD(n)  { return "$" + Math.round(n).toLocaleString(); }
function fmtRpUSDc(n) { return "$" + n.toFixed(2); }
function fmtRpK(n)    { if (n >= 1_000_000) return "$" + (n/1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M"; if (n >= 1_000) return "$" + Math.round(n/1_000) + "k"; return "$" + Math.round(n); }
function fmtRelTime(s) { if (s < 60) return s + "s ago"; if (s < 3600) return Math.floor(s/60) + "m ago"; return Math.floor(s/3600) + "h ago"; }

// ─── Tiny sparkline ──────────────────────────────────────────────────────
function Sparkline_watchRoyalty({ data, color = tkc("amber"), width = 120, height = 28, fill = true }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const dx = width / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * dx},${height - 2 - ((d - min) / range) * (height - 4)}`);
  const path = "M " + points.join(" L ");
  const area = path + ` L ${width},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block", overflow: "visible" }}>
      {fill && <path d={area} fill={color} opacity="0.12"/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.3"/>
      <circle cx={(data.length - 1) * dx} cy={height - 2 - ((data[data.length - 1] - min) / range) * (height - 4)} r="2.5" fill={color}/>
    </svg>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────
function RpHero({ monthId, setMonthId }) {
  const month = RP_MONTHS.find(m => m.id === monthId) || RP_MONTHS[0];
  const [tick, setTick] = usRy(0);
  ueRy(() => { const id = setInterval(() => setTick(t => t + 1), 2200); return () => clearInterval(id); }, []);
  const liveAmount = month.pool + (monthId === RP_MONTHS[0].id ? tick * 7 : 0);
  return (
    <section style={{
      position: "relative", overflow: "hidden",
      padding: "56px var(--gutter) 40px",
      borderBottom: "1px solid var(--c-line)",
      background:
        "radial-gradient(ellipse at 18% 8%, rgba(var(--accent-rgb),.07) 0%, transparent 55%)," +
        "radial-gradient(ellipse at 92% 95%, rgba(123,45,38,.05) 0%, transparent 60%)," +
        "var(--c-bg)",
    }}>
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}>
        {/* Eyebrow row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
            color: "var(--c-ink-3)", textTransform: "uppercase",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-amber)", boxShadow: "0 0 8px var(--c-amber)", animation: "pulse-rec 2s ease-in-out infinite" }}/>
            <span>Director royalty pool · live</span>
          </div>

          {/* Month chips */}
          <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
            {RP_MONTHS.slice(0, 4).map(m => (
              <button key={m.id} onClick={() => setMonthId(m.id)} style={{
                appearance: "none", padding: "6px 10px",
                background: m.id === monthId ? "rgba(var(--accent-rgb),.12)" : "transparent",
                border: `1px solid ${m.id === monthId ? "rgba(var(--accent-rgb),.5)" : "var(--c-line)"}`,
                borderRadius: "var(--r-1)", color: m.id === monthId ? "var(--c-amber)" : "var(--c-ink-3)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                textTransform: "uppercase", cursor: "pointer",
              }}>{m.label}</button>
            ))}
          </div>
        </div>

        <h1 className="pm-xl" style={{ maxWidth: "16ch" }}>
          Every film tithes 5% to the directors it borrowed from.
        </h1>

        <p className="pm-lede" style={{ margin: "22px 0 36px", maxWidth: "60ch" }}>
          When a Cina film cites a director's style, a slice of its revenue
          routes to them — automatically, monthly, on-chain. Estates, trusts,
          and the living. The graph is public.
        </p>

        {/* KPIs */}
        <div className="m-2col" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0, border: "1px solid var(--c-line)",
          borderRadius: "var(--r-2)", overflow: "hidden",
          background: "var(--c-panel)", maxWidth: "var(--w-mid)",
        }}>
          {[
            { l: "PAID THIS MONTH", v: fmtRpUSD(liveAmount), s: month.id === RP_MONTHS[0].id ? "and counting · refreshed every 2s" : `${month.label} · settled`, amber: true,
              spark: RP_POOL_SPARK },
            { l: "PAID LIFETIME",   v: fmtRpK(RP_POOL_LIFETIME), s: "since pool launch · Jul 2024" },
            { l: "DIRECTORS PAID",  v: month.paidCount.toLocaleString(), s: "this month · 8 first-time" },
            { l: "POOL FILL RATE",  v: "5.0%", s: "of every revenue dollar" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "20px 22px",
              borderRight: i < 3 ? "1px solid var(--c-line)" : "none",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                color: "var(--c-ink-3)", textTransform: "uppercase",
              }}>{s.l}</div>
              <div className="t-num" style={{
                fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500,
                fontSize: "var(--fs-head)", lineHeight: 1, color: s.amber ? "var(--c-amber)" : "var(--c-ink)",
                fontVariantNumeric: "tabular-nums",
              }}>{s.v}</div>
              {s.spark && (
                <div style={{ marginTop: -2, marginBottom: -2 }}>
                  <Sparkline_watchRoyalty data={s.spark} color= "var(--c-amber)" width={170} height={24}/>
                </div>
              )}
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.4 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Composition: stacked bar + small constellation ──────────────────────
function RpComposition({ poolTotal, onPickDirector, selectedId }) {
  const totalPaid = RP_CITED.reduce((s, d) => s + d.paid, 0);
  const others = poolTotal - totalPaid;
  const segs = RP_CITED.map(d => ({ ...d, share: d.paid / poolTotal }));
  segs.push({ id: "_others", short: "1,276 others", color: "var(--c-line-3)", paid: others, share: others / poolTotal });

  return (
    <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "44px var(--gutter) 12px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>01 · POOL COMPOSITION</div>
        <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>Where the {fmtRpK(poolTotal)} went.</h2>
        <p style={{ margin: "8px 0 0", maxWidth: 720, fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55 }}>
          Eight named directors took ~{(totalPaid / poolTotal * 100).toFixed(0)}% of the pool. Click any segment to expand them below — or scroll to the full leaderboard.
        </p>
      </div>

      {/* Horizontal stacked bar */}
      <div style={{
        position: "relative", height: 56,
        display: "flex", borderRadius: "var(--r-2)", overflow: "hidden",
        border: "1px solid var(--c-line)",
        background: "var(--c-panel)",
      }}>
        {segs.map(s => (
          <button key={s.id} onClick={() => s.id !== "_others" && onPickDirector(s.id)}
            title={`${s.short || s.name} · ${fmtRpUSD(s.paid)} · ${(s.share*100).toFixed(1)}%`}
            style={{
              appearance: "none",
              flexBasis: `${s.share * 100}%`,
              background: s.color,
              opacity: !selectedId || selectedId === s.id ? 0.9 : 0.35,
              border: 0,
              borderRight: "1px solid rgba(0,0,0,.3)",
              cursor: s.id === "_others" ? "default" : "pointer",
              transition: "opacity .2s ease",
              position: "relative",
              minWidth: s.share * 100 > 3 ? 0 : 12,
            }}>
            {s.share > 0.04 && s.id !== "_others" && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500,
                fontSize: "var(--fs-body)", color: tkc("bg"),
                textShadow: "0 0 6px rgba(0,0,0,.15)",
              }}>{s.short}</div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14, fontSize: "var(--fs-body)" }}>
        {segs.map(s => (
          <button key={s.id} onClick={() => s.id !== "_others" && onPickDirector(s.id)} style={{
            appearance: "none", background: "transparent", border: 0, padding: 0,
            cursor: s.id === "_others" ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 7,
            color: !selectedId || selectedId === s.id ? "var(--c-ink-2)" : "var(--c-ink-4)",
            transition: "color .15s ease",
            fontFamily: "var(--f-mono)", letterSpacing: ".08em",
          }}>
            <span style={{ width: 9, height: 9, borderRadius: "var(--r-1)", background: s.color, flexShrink: 0 }}/>
            <span>{s.short || s.name}</span>
            <span style={{ color: "var(--c-ink-4)" }}>{(s.share * 100).toFixed(1)}%</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Filters bar ─────────────────────────────────────────────────────────
const RP_FILTERS = [
  { id: "all",        label: "All" },
  { id: "active",     label: "Active" },
  { id: "estates",    label: "Estates" },
  { id: "trusts",     label: "Trusts" },
  { id: "unclaimed",  label: "Unclaimed" },
];
const RP_SORTS = [
  { id: "paid",   label: "Paid"   },
  { id: "cites",  label: "Cites"  },
  { id: "growth", label: "Mover"  },
];

function RpFilters({ filter, setFilter, q, setQ, sort, setSort }) {
  return (
    <div style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "0 var(--gutter)" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 18, padding: "16px 0",
        borderBottom: "1px solid var(--c-line)", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {RP_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              appearance: "none", padding: "7px 12px",
              background: filter === f.id ? "var(--c-panel-3)" : "transparent",
              border: `1px solid ${filter === f.id ? "var(--c-line-3)" : "var(--c-line)"}`,
              borderRadius: "var(--r-1)", color: filter === f.id ? "var(--c-ink)" : "var(--c-ink-3)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              textTransform: "uppercase", cursor: "pointer",
            }}>{f.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 200, maxWidth: 360, position: "relative" }}>
          <input
            type="text" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search director or style hit…"
            style={{
              width: "100%", padding: "9px 12px 9px 32px",
              background: "var(--c-panel)", border: "1px solid var(--c-line)",
              borderRadius: "var(--r-2)", color: "var(--c-ink)", fontFamily: "var(--f-sans)",
              fontSize: "var(--fs-body)", outline: "none",
            }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-3)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>SORT</span>
          <div style={{ display: "flex", gap: 4 }}>
            {RP_SORTS.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)} style={{
                appearance: "none", padding: "6px 10px",
                background: sort === s.id ? "var(--c-panel-3)" : "transparent",
                border: `1px solid ${sort === s.id ? "var(--c-line-3)" : "var(--c-line)"}`,
                borderRadius: "var(--r-1)", color: sort === s.id ? "var(--c-ink)" : "var(--c-ink-3)",
                fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                textTransform: "uppercase", cursor: "pointer",
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Director row + expandable detail ────────────────────────────────────
function DirectorRow({ d, rank, expanded, onToggle, onClaim }) {
  const cat = window.CATALOG || [];
  return (
    <div style={{
      borderBottom: "1px solid var(--c-line)",
      background: expanded ? "var(--c-panel-2)" : "transparent",
      transition: "background .14s ease",
    }}>
      <button onClick={onToggle} style={{
        appearance: "none", border: 0, background: "transparent",
        width: "100%", textAlign: "left", cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "32px 1fr 80px 110px 200px 70px 24px",
        gap: 12, padding: "16px 18px", alignItems: "center",
        color: "inherit",
      }}>
        <div className="t-num" style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-3)", fontSize: "var(--fs-label)" }}>{String(rank).padStart(2, "0")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: d.color, opacity: 0.85,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "var(--fs-body)", color: tkc("bg"), fontWeight: 600, flexShrink: 0,
          }}>{d.name.split(" ").map(p => p[0]).join("")}</div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", fontWeight: 500, lineHeight: 1.1 }}>{d.name}</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{
                padding: "1px 5px", borderRadius: "var(--r-1)",
                background: d.claimed ? "rgba(106,163,122,.12)" : "rgba(var(--accent-rgb),.12)",
                color: d.claimed ? "var(--c-good)" :  "var(--c-amber)",
                letterSpacing: ".16em",
              }}>{d.claimed ? "CLAIMED" : "UNCLAIMED"}</span>
              <span>{d.era} · {d.years}</span>
            </div>
          </div>
        </div>
        <div className="t-num" style={{ fontFamily: "var(--f-mono)", color: "var(--c-ink-2)", fontSize: "var(--fs-body)" }}>{d.cites}</div>
        <div className="t-num" style={{ fontFamily: "var(--f-mono)", color: "var(--c-amber)", fontSize: "var(--fs-body)", fontWeight: 600 }}>{fmtRpUSD(d.paid)}</div>
        <Sparkline_watchRoyalty data={d.spark} color={d.color} width={170} height={24}/>
        <div className="t-num" style={{
          textAlign: "right",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", fontWeight: 600,
          color: d.growth >= 0 ? "var(--c-good)" : "var(--c-blood-l)",
        }}>{d.growth >= 0 ? "▲" : "▼"} {Math.abs(d.growth)}%</div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-ink-3)" strokeWidth="2"
             style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .15s ease" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: "0 18px 22px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
          {/* Citations breakdown */}
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Cited by</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {d.citingFilms.map(f => {
                const filmObj = cat.find(c => c.id === f.id);
                const hash = filmObj?.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`;
                return (
                  <button key={f.id} onClick={() => { if (filmObj) window.navigate?.(hash); }} style={{
                    appearance: "none", border: 0, background: "var(--c-panel)",
                    padding: "10px 12px", borderRadius: "var(--r-2)", cursor: filmObj ? "pointer" : "default",
                    display: "grid", gridTemplateColumns: "1fr 80px 90px",
                    gap: 10, alignItems: "center", textAlign: "left",
                    color: "inherit",
                  }}>
                    <div>
                      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{f.t}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 2 }}>by {f.who}</div>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>{filmObj ? "OPEN →" : ""}</div>
                    <div className="t-num" style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600, textAlign: "right" }}>{fmtRpUSD(f.$)}</div>
                  </button>
                );
              })}
            </div>

            {/* Style hits */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginBottom: 10 }}>Style hits</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {d.hits.map((h, i) => (
                  <span key={i} style={{
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em",
                    color: d.color, padding: "5px 9px",
                    border: `1px solid ${d.color}55`, borderRadius: "var(--r-1)", lineHeight: 1.3,
                  }}>{h}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Side: claim status + style strength */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              padding: 16, borderRadius: "var(--r-2)",
              background: d.claimed ? "var(--c-panel)" : "linear-gradient(160deg, rgba(var(--accent-rgb),.08), var(--c-panel) 70%)",
              border: d.claimed ? "1px solid var(--c-line)" : "1px solid rgba(var(--accent-rgb),.4)",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: d.claimed ? "var(--c-good)" : "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>
                {d.claimed ? "Claimed" : "Awaiting claim"}
              </div>
              {d.claimed ? (
                <>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{d.claimant}</div>
                  <p style={{ margin: "6px 0 0", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>Royalties settled monthly to verified beneficiary.</p>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.2 }}>
                    {fmtRpUSD(d.paid)} held in escrow.
                  </div>
                  <p style={{ margin: "6px 0 12px", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
                    The {d.name} pool is unclaimed. Their representative can claim and back-pay.
                  </p>
                  <button onClick={() => onClaim(d)} style={{
                    width: "100%", padding: "10px 14px",
                    background: "var(--c-amber)", color: "var(--c-on-amber)",
                    border: 0, borderRadius: "var(--r-2)", cursor: "pointer",
                    fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
                    fontWeight: 700, textTransform: "uppercase",
                  }}>Begin claim →</button>
                </>
              )}
            </div>

            <div style={{ padding: 16, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase", marginBottom: 8 }}>Style strength</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: d.color, lineHeight: 1 }}>{d.strength.toFixed(1)}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>/ 5.0</div>
              </div>
              <div style={{ marginTop: 10, height: 4, background: "var(--c-line)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                <div style={{ width: `${(d.strength / 5) * 100}%`, height: "100%", background: d.color }}/>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>
                Confidence of style-influence vector across the catalog. Audited monthly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RpLeaderboard({ filter, q, sort, expandedId, setExpandedId, onClaim }) {
  const filtered = umRy(() => {
    let list = RP_CITED.slice();
    if (filter === "active") list = list.filter(d => d.era === "Active");
    else if (filter === "estates") list = list.filter(d => d.era === "Estate");
    else if (filter === "trusts") list = list.filter(d => d.era === "Trust");
    else if (filter === "unclaimed") list = list.filter(d => !d.claimed);
    if (q) {
      const Q = q.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(Q) || d.hits.some(h => h.toLowerCase().includes(Q)));
    }
    if (sort === "cites") list.sort((a, b) => b.cites - a.cites);
    else if (sort === "growth") list.sort((a, b) => b.growth - a.growth);
    else list.sort((a, b) => b.paid - a.paid);
    return list;
  }, [filter, q, sort]);

  return (
    <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "26px var(--gutter) 0" }}>
      <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>02 · LEADERBOARD</div>
          <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
            The directors borrowing changed.
          </h2>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>
          {filtered.length} OF {RP_CITED.length} SHOWN
        </div>
      </div>

      <div style={{
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", overflow: "hidden",
      }} className="m-scroll-x">
        <div style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 80px 110px 200px 70px 24px",
          gap: 12, padding: "11px 18px",
          background: "var(--c-panel-2)", borderBottom: "1px solid var(--c-line)",
          fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
          color: "var(--c-ink-3)", textTransform: "uppercase",
        }}>
          <div>#</div><div>Director</div><div>Cites</div><div>Paid</div><div>6-mo trend</div><div style={{ textAlign: "right" }}>MoM</div><div/>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 18px", textAlign: "center", color: "var(--c-ink-3)", fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)" }}>
            No directors match this filter.
          </div>
        ) : filtered.map((d, i) => (
          <DirectorRow key={d.id} d={d} rank={i + 1}
            expanded={expandedId === d.id}
            onToggle={() => setExpandedId(expandedId === d.id ? null : d.id)}
            onClaim={onClaim}/>
        ))}
      </div>
    </section>
  );
}

// ─── Live ledger + top citers ────────────────────────────────────────────
function RpLiveLedger() {
  const [feed, setFeed] = usRy(() => RP_RECENT_PAYMENTS.slice(0, 6).map((p, i) => ({ ...p, _id: i, _age: 10 + i * 18 })));
  const idRef = urRy(feed.length);

  ueRy(() => {
    const id = setInterval(() => {
      setFeed(prev => {
        const next = prev.map(p => ({ ...p, _age: p._age + 3 }));
        const newPayment = RP_RECENT_PAYMENTS[Math.floor(Math.random() * RP_RECENT_PAYMENTS.length)];
        idRef.current += 1;
        next.unshift({ ...newPayment, _id: idRef.current, _age: 0, _new: true });
        return next.slice(0, 7);
      });
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const cat = window.CATALOG || [];
  const goCreator = (id) => window.navigate && window.navigate(`/creator/${id}`);
  const goFilm = (id) => {
    const f = cat.find(c => c.id === id);
    if (!f) return;
    window.navigate?.(f.kind === "series" ? `/series/${id}` : `/film/${id}`);
  };

  return (
    <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "44px var(--gutter)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>03 · LIVE LEDGER</div>
          <h2 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>Royalties as they land.</h2>
          <div style={{ marginTop: 18, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
            <div style={{
              padding: "10px 16px", background: "var(--c-panel-2)",
              borderBottom: "1px solid var(--c-line)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              color: "var(--c-ink-3)", display: "flex", alignItems: "center", gap: 10,
              textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 6px var(--c-good)", animation: "pulse-rec 2s ease-in-out infinite" }}/>
              Live · settled on Base · {feed.length} recent
            </div>
            {feed.map((p, i) => (
              <div key={p._id} style={{
                padding: "14px 16px", display: "grid",
                gridTemplateColumns: "60px 1fr 160px 110px",
                gap: 14, alignItems: "center",
                borderBottom: i < feed.length - 1 ? "1px solid var(--c-line)" : "none",
                fontSize: "var(--fs-body)",
                background: p._new ? "rgba(var(--accent-rgb),.06)" : "transparent",
                transition: "background 1.6s ease",
                animation: p._new ? "ledger-in 320ms ease-out" : "none",
              }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{fmtRelTime(p._age)}</div>
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{p.label}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em", marginTop: 2 }}>
                    cited "<span style={{ color: "var(--c-amber)" }}>{p.citation}</span>"
                  </div>
                </div>
                <button onClick={() => goFilm(p.filmId)} style={{
                  appearance: "none", background: "transparent", border: 0, padding: 0,
                  textAlign: "left", cursor: cat.find(c => c.id === p.filmId) ? "pointer" : "default",
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink-2)",
                }}>{p.fromTitle}<br/><span style={{ fontFamily: "var(--f-mono)", fontStyle: "normal", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>by {p.fromCreator}</span></button>
                <div className="t-num" style={{ textAlign: "right", fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-good)", fontWeight: 600 }}>+{fmtRpUSDc(p.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>04 · TOP CITERS</div>
            <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-title)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              Cina directors paying the most into the pool.
            </h3>
            <div style={{ marginTop: 14, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
              {RP_TOP_CITERS.map((c, i) => (
                <button key={c.id} onClick={() => goCreator(c.id)} style={{
                  appearance: "none", border: 0, background: "transparent",
                  width: "100%", textAlign: "left", padding: "13px 16px",
                  display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center",
                  borderBottom: i < RP_TOP_CITERS.length - 1 ? "1px solid var(--c-line)" : "none",
                  cursor: "pointer", color: "inherit",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{c.name}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)", marginTop: 2 }}>
                      {c.films} films · {c.citationsOut} citations out
                    </div>
                  </div>
                  <div className="t-num" style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>{fmtRpUSD(c.paidOut)}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: 22, borderRadius: "var(--r-2)",
            background: "linear-gradient(160deg, rgba(var(--accent-rgb),.08) 0%, var(--c-panel) 70%)",
            border: "1px solid rgba(var(--accent-rgb),.35)",
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>You may be cited.</div>
            <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500, fontSize: "var(--fs-lead)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              Claim your director profile and start earning.
            </h3>
            <p style={{ margin: "10px 0 14px", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
              If a Cina film borrowed your shot composition, color, or rhythm — we owe you. Claim once, get paid monthly.
            </p>
            <button onClick={() => window.dispatchEvent(new CustomEvent("rp:openClaim", { detail: { generic: true } }))} style={{
              width: "100%", padding: "11px 16px",
              background: "var(--c-amber)", color: "var(--c-on-amber)", border: 0, borderRadius: "var(--r-2)",
              fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
              fontWeight: 700, textTransform: "uppercase", cursor: "pointer",
            }}>Claim your profile →</button>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ─── How it works ────────────────────────────────────────────────────────
function RpHowItWorks() {
  const steps = [
    { n: "01", title: "Cite, automatically.",  body: "Every Cina render embeds a style-influence vector — every shot remembers which directors shaped it. Nobody declares anything." },
    { n: "02", title: "5% off the top.",       body: "On every revenue dollar — Watch subs, Pitch campaigns, NFT royalties — five cents enter the pool before the creator's split." },
    { n: "03", title: "Distribute by weight.", body: "The pool divides by citation share: 38% Kurosawa, 22% Wong Kar-wai? That's the split." },
    { n: "04", title: "Pay on the first.",     body: "Every month, on-chain, transparent. Estates, trusts, and active directors get a settlement statement they can verify." },
  ];
  return (
    <section style={{ maxWidth: "var(--w-page)", margin: "0 auto", padding: "40px var(--gutter) 96px" }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase", marginBottom: 8 }}>05 · HOW THE POOL WORKS</div>
      <h2 style={{ margin: "0 0 28px", fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 400, fontSize: "var(--fs-head)", lineHeight: 1.05, letterSpacing: "-0.01em" }}>
        Cite, distribute, settle. Monthly. Forever.
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {steps.map(s => (
          <div key={s.n} style={{ padding: 24, background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 12, fontWeight: 600 }}>{s.n}</div>
            <h3 style={{ margin: 0, fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500, fontSize: "var(--fs-title)", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{s.title}</h3>
            <p style={{ margin: "10px 0 0", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>{s.body}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, padding: "20px 24px", background: "var(--c-panel)", borderLeft: "2px solid var(--c-amber)", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", lineHeight: 1.5, maxWidth: 880 }}>
        "No one else can do this without rebuilding their model. We can. It is a generational PR moat,
        and a fundamental act of repair toward the artists whose work taught the machines to see."
      </div>
    </section>
  );
}

// ─── Claim modal ─────────────────────────────────────────────────────────
function RpClaimModal({ open, director, onClose }) {
  const [step, setStep] = usRy(0);
  const [form, setForm] = usRy({ relation: "estate", legal: "", email: "", contact: "", samples: "" });
  ueRy(() => { if (open) setStep(0); }, [open, director?.id]);
  if (!open) return null;

  const submit = () => {
    setStep(2);
    setTimeout(() => {
      if (window.toast) window.toast({ title: "CLAIM FILED", text: `Royalty ops will reply within 48h`, kind: "good" });
      onClose();
    }, 1100);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(8,8,10,.72)",
      backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 560,
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
        borderRadius: "var(--r-2)", overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,.6)",
      }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", textTransform: "uppercase" }}>
              {step === 2 ? "Filing" : "Claim · step " + (step + 1) + " of 2"}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 4 }}>
              {director ? director.name : "Claim a director"}
            </div>
          </div>
          <button onClick={onClose} style={{
            appearance: "none", border: 0, background: "var(--c-panel-2)",
            width: 28, height: 28, borderRadius: "var(--r-3)", color: "var(--c-ink-3)",
            cursor: "pointer", fontSize: "var(--fs-body)",
          }} aria-label="Close" title="Close">✕</button>
        </div>

        {step === 0 && (
          <div style={{ padding: "22px 22px 24px" }}>
            <p style={{ margin: "0 0 16px", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
              {director
                ? <>This pool has <strong style={{ color: "var(--c-amber)" }}>{fmtRpUSD(director.paid)}</strong> held in escrow. Tell us who you are and how you represent the director.</>
                : <>If a Cina film cited your work, register a profile. We'll back-pay everything in escrow.</>}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FieldRadio label="Your relation" value={form.relation} onChange={v => setForm({ ...form, relation: v })}
                options={[
                  { id: "self", label: "I am the director" },
                  { id: "estate", label: "Estate / trust" },
                  { id: "agent", label: "Agent / licensee" },
                ]}/>
              <Field label="Legal name of beneficiary" value={form.legal} onChange={v => setForm({ ...form, legal: v })} placeholder="e.g. Kurosawa Foundation" required/>
              <Field label="Contact email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="ops@example.com" required/>
              <Field label="Verification — link to a film or work" value={form.contact} onChange={v => setForm({ ...form, contact: v })} placeholder="https://…"/>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={ghostBtnStyle} aria-label="Close" title="Close">Cancel</button>
              <button onClick={() => setStep(1)} disabled={!form.legal || !form.email} style={primaryBtnStyle(!!form.legal && !!form.email)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ padding: "22px 22px 24px" }}>
            <p style={{ margin: "0 0 14px", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
              Review and submit. Royalty ops verifies within 48h. Back-pay routes to the supplied wallet upon approval.
            </p>
            <div style={{ background: "var(--c-panel-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, fontSize: "var(--fs-body)" }}>
              <Row k="Director"  v={director?.name || "Generic"}/>
              <Row k="Relation"  v={form.relation === "self" ? "Self" : form.relation === "estate" ? "Estate / trust" : "Agent / licensee"}/>
              <Row k="Beneficiary" v={form.legal}/>
              <Row k="Contact"   v={form.email}/>
              <Row k="In escrow" v={director ? fmtRpUSD(director.paid) : "—"} amber/>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={() => setStep(0)} style={ghostBtnStyle}>← Back</button>
              <button onClick={submit} style={primaryBtnStyle(true)}>File claim →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-amber)" }}>Filing…</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 8, letterSpacing: ".16em" }}>SIGNING TRANSACTION</div>
          </div>
        )}
      </div>
    </div>
  );
}
function Row({ k, v, amber }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", textTransform: "uppercase" }}>{k}</span>
      <span style={{ fontFamily: amber ? "var(--f-mono)" : "var(--f-sans)", color: amber ? "var(--c-amber)" : "var(--c-ink)", fontSize: "var(--fs-body)", fontWeight: amber ? 600 : 400 }}>{v || "—"}</span>
    </div>
  );
}
function Field({ label, value, onChange, placeholder, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>{label}{required && <span style={{ color: "var(--c-amber)" }}> *</span>}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        padding: "9px 11px", background: "var(--c-panel-2)", border: "1px solid var(--c-line)",
        borderRadius: "var(--r-2)", color: "var(--c-ink)", fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", outline: "none",
      }}/>
    </label>
  );
}
function FieldRadio({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            appearance: "none", flex: 1, padding: "9px 10px",
            background: value === o.id ? "rgba(var(--accent-rgb),.1)" : "var(--c-panel-2)",
            border: `1px solid ${value === o.id ? "rgba(var(--accent-rgb),.5)" : "var(--c-line)"}`,
            borderRadius: "var(--r-2)", color: value === o.id ? "var(--c-amber)" : "var(--c-ink-2)",
            fontFamily: "var(--f-sans)", fontSize: "var(--fs-body)", cursor: "pointer",
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}
const ghostBtnStyle = {
  appearance: "none", padding: "10px 16px",
  background: "transparent", border: "1px solid var(--c-line-2)",
  borderRadius: "var(--r-2)", color: "var(--c-ink-2)",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
  textTransform: "uppercase", cursor: "pointer",
};
const primaryBtnStyle = (enabled) => ({
  appearance: "none", padding: "10px 18px",
  background: enabled ? "var(--c-amber)" : "var(--c-line)",
  color: enabled ? tkc("on-amber") : "var(--c-ink-4)", border: 0, borderRadius: "var(--r-2)",
  fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em",
  fontWeight: 700, textTransform: "uppercase",
  cursor: enabled ? "pointer" : "not-allowed",
});

// ─── Page root ───────────────────────────────────────────────────────────
function RoyaltyPoolPage() {
  const [monthId, setMonthId] = usRy(RP_MONTHS[0].id);
  const [filter, setFilter] = usRy("all");
  const [q, setQ] = usRy("");
  const [sort, setSort] = usRy("paid");
  const [expandedId, setExpandedId] = usRy("kurosawa");
  const [claim, setClaim] = usRy(null);

  const month = RP_MONTHS.find(m => m.id === monthId);

  // Generic "Claim profile" CTA opens the modal too
  ueRy(() => {
    const onGeneric = () => setClaim({ generic: true });
    window.addEventListener("rp:openClaim", onGeneric);
    return () => window.removeEventListener("rp:openClaim", onGeneric);
  }, []);

  const onPickDirector = (id) => {
    setExpandedId(id);
    // Scroll the leaderboard row into view
    requestAnimationFrame(() => {
      const el = document.getElementById("rp-leaderboard");
      if (el && window.pmScrollTo) pmScrollTo(el, 80);
    });
  };

  return (
    <div style={{ background: "var(--c-bg)", color: "var(--c-ink)", minHeight: "100vh" }}>
      <style>{`
        @keyframes ledger-in {
          0% { transform: translateY(-8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <RpHero monthId={monthId} setMonthId={setMonthId}/>
      <RpComposition poolTotal={month.pool} onPickDirector={onPickDirector} selectedId={expandedId}/>
      <div id="rp-leaderboard">
        <RpFilters filter={filter} setFilter={setFilter} q={q} setQ={setQ} sort={sort} setSort={setSort}/>
        <RpLeaderboard filter={filter} q={q} sort={sort}
          expandedId={expandedId} setExpandedId={setExpandedId}
          onClaim={(d) => setClaim(d)}/>
      </div>
      <RpLiveLedger/>
      <RpHowItWorks/>

      <RpClaimModal open={!!claim} director={claim && !claim.generic ? claim : null} onClose={() => setClaim(null)}/>
    </div>
  );
}

window.RoyaltyPoolPage = RoyaltyPoolPage;
