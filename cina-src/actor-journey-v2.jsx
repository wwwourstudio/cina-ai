// actor-journey-v2.jsx — Modern career journey: a vertical mouse-scroll story
// that rises with the actor, plus a fullscreen horizontal-scroll timeline
// lightbox of big video cards (films · series · branches · awards · milestones).
// Also: an organic career-score model, an All-Time Leading Actors board, and
// the ability to RETIRE a performer into the Hall of Fame.
//
// Reads window.CAST / getCast / getFilm / CastPortrait / FrameThumb / topTrophy.

const { useState: ajUS, useEffect: ajUE, useMemo: ajUM, useRef: ajUR } = React;

// ════════════════════════════════════════════════════════════════════════
function ajFilmsFor(actor) {
  if (!actor) return [];
  return (actor.roles || []).
  map((r) => ({ role: r, film: typeof getFilm === "function" ? getFilm(r.filmId) : null })).
  filter((x) => x.film).
  sort((a, b) => (a.film.year || 0) - (b.film.year || 0));
}

function ajTrophiesFor(actor) {
  const out = [];
  (actor.roles || []).forEach((r) => {
    const t = typeof topTrophy === "function" ? topTrophy(r.filmId) : null;
    if (t) out.push({ ...t, filmId: r.filmId });
  });
  return out;
}

// A single number that ranks a whole career.
function cinaCareerScore(actor) {
  if (!actor) return 0;
  const roles = actor.roles || [];
  const leads = roles.filter((r) => r.lead).length;
  const support = roles.length - leads;
  const eps = roles.reduce((s, r) => s + (r.episodes || 0), 0);
  const awards = (actor.awards || []).length;
  const trophies = ajTrophiesFor(actor).length;
  const followers = actor.followers || 0;
  return Math.round(
    leads * 130 + support * 45 + eps * 6 +
    awards * 180 + trophies * 240 + followers / 1400
  );
}

// ── Retirement (Hall of Fame) state ──
const AJ_RETIRE_KEY = "cina:retired:v1";
function ajReadRetired() {
  try {return JSON.parse(localStorage.getItem(AJ_RETIRE_KEY) || "{}");} catch (e) {return {};}
}
function ajWriteRetired(map) {
  try {localStorage.setItem(AJ_RETIRE_KEY, JSON.stringify(map));} catch (e) {}
}
function useRetired() {
  const [map, setMap] = ajUS(ajReadRetired);
  const retire = (id, when) => setMap((m) => {const n = { ...m, [id]: when || new Date().toISOString().slice(0, 10) };ajWriteRetired(n);return n;});
  const unretire = (id) => setMap((m) => {const n = { ...m };delete n[id];ajWriteRetired(n);return n;});
  return { map, retire, unretire, isRetired: (id) => !!map[id] };
}

// Ranked roster (active first), with rank index attached.
function cinaLeadingActors() {
  const cast = (window.CAST || []).slice();
  return cast.
  map((a) => ({ actor: a, score: cinaCareerScore(a) })).
  sort((a, b) => b.score - a.score).
  map((x, i) => ({ ...x, rank: i + 1 }));
}

// ════════════════════════════════════════════════════════════════════════
function ajBuildTimeline(actor) {
  const films = ajFilmsFor(actor);
  const nodes = [];
  films.forEach((x, i) => {
    const f = x.film,r = x.role;
    const kind = f.kind === "series" ? "series" : f.branched ? "branch" : "film";
    nodes.push({
      type: i === 0 ? "debut" : kind,
      year: f.year, film: f, role: r,
      title: f.title, as: r.as, lead: r.lead, episodes: r.episodes,
      trophy: typeof topTrophy === "function" ? topTrophy(f.id) : null
    });
  });
  // award nodes from the actor's listed honours (parse trailing year if present)
  (actor.awards || []).forEach((a) => {
    const m = a.match(/(\d{4})/);
    nodes.push({ type: "award", year: m ? +m[1] : films[films.length - 1]?.film.year || 2026, title: a });
  });
  nodes.sort((a, b) => (a.year || 0) - (b.year || 0));
  nodes.push({ type: "now", year: 2026, title: "Present day" });
  return nodes;
}

// ════════════════════════════════════════════════════════════════════════
const AJScrollCtx = React.createContext(null);

function useRevealY(ref) {
  const scroller = React.useContext(AJScrollCtx);
  const [p, setP] = ajUS(0.4); // 1 = incoming(right), 0 = centered, -1 = gone(left)
  ajUE(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const node = ref.current;if (!node) return;
      const r = node.getBoundingClientRect();
      const vw = window.innerWidth;
      const center = r.left + r.width / 2;
      setP((center - vw / 2) / vw);
    };
    const onScroll = () => {if (!raf) raf = requestAnimationFrame(calc);};
    calc();
    if (scroller) scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = setTimeout(calc, 80);
    const t2 = setTimeout(calc, 400);
    return () => {if (scroller) scroller.removeEventListener("scroll", onScroll);window.removeEventListener("resize", onScroll);clearTimeout(t);clearTimeout(t2);if (raf) cancelAnimationFrame(raf);};
  }, [scroller]);
  return p;
}

// Inner element that reveals on its own offset (staggered).
function RevealItem({ children, style, delay = 0, intensity = 1 }) {
  const ref = ajUR(null);
  const p = useRevealY(ref);
  const a = Math.min(1, Math.abs(p));
  const eased = Math.max(0, a - delay);
  return (
    <div ref={ref} style={{
      transform: `translate3d(${(p * 24 * intensity).toFixed(1)}px, ${(eased * 30 * intensity).toFixed(1)}px, 0) scale(${(1 - eased * 0.045).toFixed(3)})`,
      opacity: Math.max(0.08, 1 - eased * 1.2),
      transition: "opacity .25s linear, transform .3s cubic-bezier(.2,.8,.2,1)", ...style
    }}>
      {children}
    </div>);

}

// ── Parallax section background — a cinematic backdrop that drifts as the
//    panel crosses the viewport. Tied to the horizontal scroller for depth.
function SectionBG({ src, actor, shot = "wide", opacity = 0.26, parallax = 16, blur = 0 }) {
  const ref = ajUR(null);
  const scroller = React.useContext(AJScrollCtx);
  ajUE(() => {
    const node = ref.current;if (!node) return;
    const host = node.parentElement;let raf = 0;
    const calc = () => {
      raf = 0;
      const r = host.getBoundingClientRect();const vw = window.innerWidth || 1;
      const off = (r.left + r.width / 2 - vw / 2) / vw; // -1..1
      node.style.transform = `translate3d(${(-off * parallax).toFixed(1)}px,0,0) scale(1.18)`;
    };
    const onScroll = () => {if (!raf) raf = requestAnimationFrame(calc);};
    calc();
    if (scroller) scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = setTimeout(calc, 140);
    return () => {if (scroller) scroller.removeEventListener("scroll", onScroll);window.removeEventListener("resize", onScroll);clearTimeout(t);if (raf) cancelAnimationFrame(raf);};
  }, [scroller]);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div ref={ref} style={{ position: "absolute", inset: "-9%", willChange: "transform" }}>
        {src ?
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity, filter: `saturate(.85) brightness(.6)${blur ? ` blur(${blur}px)` : ""}` }} /> :
        actor && typeof CastPortrait === "function" ?
        <div style={{ width: "100%", height: "100%", opacity, filter: blur ? `blur(${blur}px)` : "none" }}><CastPortrait actor={actor} size={1500} shot={shot} cover style={{ width: "100%", height: "100%", borderRadius: 0 }} /></div> :
        null}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.64) 0%, rgba(8,8,10,.8) 50%, var(--c-bg) 100%)" }} />
    </div>);

}

// A horizontal panel that HUGS its content (auto width) — no forced 100vw, so a
// sparse section stays only as wide as it needs and the strip packs tightly.
// Pass bg / bgActor for a parallax cinematic backdrop.
// ── FitBox — scales its content (height-only) so it fills the section's
//    vertical space as large as possible without ever overflowing. Scales DOWN
//    when content is too tall, UP (to a cap) when there's room to spare.
function FitBox({ children, max = 1, min = 0.55 }) {
  const wrapRef = ajUR(null),innerRef = ajUR(null);
  const [scale, setScale] = ajUS(1);
  ajUE(() => {
    const wrap = wrapRef.current,inner = innerRef.current;
    if (!wrap || !inner) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const availH = wrap.clientHeight;
      const ch = inner.offsetHeight; // transform doesn't affect offset metrics
      if (!availH || !ch) return;
      const s = Math.max(min, Math.min(max, availH / ch));
      setScale(s);
    };
    const ping = () => {if (!raf) raf = requestAnimationFrame(measure);};
    measure();
    const ro = new ResizeObserver(ping);
    ro.observe(wrap);ro.observe(inner);
    window.addEventListener("resize", ping);
    const t = setTimeout(measure, 240);
    return () => {ro.disconnect();window.removeEventListener("resize", ping);clearTimeout(t);if (raf) cancelAnimationFrame(raf);};
  }, [children]);
  return (
    <div ref={wrapRef} style={{ position: "relative", zIndex: 2, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div ref={innerRef} style={{ width: "100%", transform: `scale(${scale})`, transformOrigin: "center center", transition: "transform .25s ease" }}>
        {children}
      </div>
    </div>);

}

function VSection({ children, style, label, accent, tone, w, id, bg, bgActor, bgShot, bgOpacity, bgBlur, fit }) {
  const baseBg = tone === "panel" ?
  "linear-gradient(170deg, var(--c-panel) 0%, var(--c-bg) 80%)" :
  tone === "deep" ? `var(--c-void, ${tkc("void")})` : "var(--c-bg)";
  const body =
  <div style={{ width: "100%", padding: "clamp(28px, 5vh, 60px) 0", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {label &&
    <div style={{ width: "100%", padding: AJ_PAD, marginBottom: 26, boxSizing: "border-box" }}>
          <RevealItem>
            <div style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
              <span style={{ width: 30, height: 1, background: accent, display: "inline-block" }} />
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em" }}>{label}</div>
            </div>
          </RevealItem>
        </div>
    }
      {children}
    </div>;

  return (
    <section data-aj-label={label || id} style={{ position: "relative", flex: "0 0 auto", width: w || "auto", minWidth: "100vw", height: "100%", background: baseBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflowY: "hidden", overflowX: "hidden", ...style }}>
      {(bg || bgActor) && <SectionBG src={bg} actor={bgActor} shot={bgShot} opacity={bgOpacity} blur={bgBlur} />}
      <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 140, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,.34), transparent)", zIndex: 1 }} />
      {fit ? <FitBox>{body}</FitBox> : body}
    </section>);

}

// ── Follow state (persisted) + reusable button ──
const AJ_FOLLOW_KEY = "cina:follow:v1";
function useFollow(id) {
  const [map, setMap] = ajUS(() => {try {return JSON.parse(localStorage.getItem(AJ_FOLLOW_KEY) || "{}");} catch (e) {return {};}});
  const following = !!map[id];
  const toggle = () => setMap((s) => {const n = { ...s };if (n[id]) delete n[id];else n[id] = Date.now();try {localStorage.setItem(AJ_FOLLOW_KEY, JSON.stringify(n));} catch (e) {}return n;});
  return { following, toggle };
}
function FollowButton({ actor, accent, big }) {
  const { following, toggle } = useFollow(actor.id);
  const count = (actor.followers || 0) + (following ? 1 : 0);
  return (
    <button onClick={toggle} className={following ? "btn" : "btn btn-primary"} style={{
      height: big ? 48 : 40, padding: big ? "0 24px" : "0 18px", fontSize: "var(--fs-body)", gap: 9,
      ...(following ? { background: "transparent", border: `1px solid ${accent}`, color: accent } : null)
    }}>
      {following ? "✓ Following" : "+ Follow"}
      <span className="t-num" style={{ opacity: .72, fontVariantNumeric: "tabular-nums" }}>{(count / 1000).toFixed(0)}K</span>
    </button>);

}

// ── Deterministic representation (agent + agency) ──
const AJ_AGENCIES = [
["Meridian Talent", "Dana Reyes", "booking@meridiantalent.co", "~2 business days"],
["North Star Artists", "Marcus Vidal", "desk@northstar.art", "within 24 hours"],
["The Vale Group", "Priya Anand", "hello@valegroup.co", "~3 business days"],
["Lantern & Co.", "Theo Brandt", "agents@lantern.co", "same day"],
["Atlas Representation", "Simone Clay", "cast@atlasrep.com", "~48 hours"],
["Greenroom Partners", "Owen Park", "book@greenroom.partners", "~2 business days"]];

function ajAgent(actor) {
  const s = String(actor.id || actor.name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AJ_AGENCIES[s % AJ_AGENCIES.length];
}

const AJ_PAD = "0 clamp(24px, 6vw, 100px)";

// ── Owner gating: the retire control is only visible to the performer's owner.
//    Ownership is held in localStorage (set when a studio mints/claims them).
const AJ_OWN_KEY = "cina:owned:v1";
function cinaIsOwner(id) {
  try {
    if (window.__cinaOwnerAll) return true;
    const m = JSON.parse(localStorage.getItem(AJ_OWN_KEY) || "{}");
    return !!m[id];
  } catch (e) {return false;}
}

// ── PR-approved press: deterministic articles the performer is tagged in ──
const AJ_OUTLETS = [
["SCREEN CANON", "REVIEW", tkc("cat-1")], ["THE FRAME", "INTERVIEW", tkc("amber-d")],
["CINA WEEKLY", "FEATURE", tkc("cat-2")], ["NIGHT CIRCUIT", "REVIEW", tkc("good")],
["THE CUT ROOM", "PROFILE", "var(--c-amber)"], ["LUMEN", "INTERVIEW", tkc("bad")],
["FESTIVAL DAILY", "DISPATCH", tkc("cat-1")], ["THE MARQUEE", "FEATURE", tkc("warn")]];

const AJ_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function ajPress(actor, films) {
  const seed = String(actor.id || actor.name).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const first = actor.name.split(" ")[0];
  const tmpl = [
  (f) => `${actor.name} is the reason to watch “${f.title}”`,
  (f) => `Inside ${first}’s ${f.year}: a quieter kind of star power`,
  (f) => `How ${first} built “${f.title}” one held breath at a time`,
  (f) => `${actor.name} on stillness, risk, and “${f.title}”`,
  (f) => `The performance everyone’s arguing about: ${first} in “${f.title}”`,
  (f) => `${first} doesn’t blink — and that’s the whole trick`,
  (f) => `A face that holds: ${actor.name}’s breakout year`];

  const exc = [
  (f) => `Our critic on why ${first}’s turn in “${f.title}” lingers long after the credits.`,
  (f) => `The performer sits down to talk craft, doubt, and the scene in “${f.title}” they almost walked away from.`,
  (f) => `Inside the making of a career that refuses to raise its voice.`,
  (f) => `${first} has quietly become one of Cina’s most bankable leads. Here’s the receipt.`,
  (f) => `A close read of the role that put ${first} on every casting director’s shortlist.`];

  const pool = films && films.length ? films : [{ film: { title: actor.name, year: 2026, thumb: "noir-f" }, role: { as: "Lead" } }];
  const n = Math.min(7, Math.max(4, 3 + seed % 5));
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = pool[i % pool.length];
    const f = x.film;
    const o = AJ_OUTLETS[(seed + i * 3) % AJ_OUTLETS.length];
    const mo = (seed + i * 5) % 12,yr = 2026 - (seed + i) % 2;
    out.push({
      outlet: o[0], tag: o[1], color: o[2],
      headline: tmpl[(seed + i) % tmpl.length](f),
      excerpt: exc[(seed + i * 2) % exc.length](f),
      date: `${AJ_MONTHS[mo]} ${1 + (seed + i * 7) % 27}, ${yr}`,
      sortKey: yr * 12 + mo,
      read: `${3 + (seed + i) % 9} min`,
      thumb: f.thumb, color: f.color || tkc("panel"),
      film: f
    });
  }
  return out.sort((a, b) => b.sortKey - a.sortKey);
}

// Sample follower faces (other performers stand in for the crowd).
function ajFollowerFaces(actor) {
  const roster = (window.CAST || []).filter((a) => a.id !== actor.id);
  const seed = String(actor.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const arr = [];
  for (let i = 0; i < Math.min(12, roster.length); i++) arr.push(roster[(seed + i * 3) % roster.length]);
  return arr;
}

// ════════════════════════════════════════════════════════════════════════
function ActorCareerJourney({ id }) {
  const actor = typeof getCast === "function" ? getCast(id) : null;
  const { isRetired, retire, unretire } = useRetired();
  const [scrollPct, setScrollPct] = ajUS(0);
  const [scrollerEl, setScrollerEl] = ajUS(null);

  ajUE(() => {if (scrollerEl) scrollerEl.scrollLeft = 0;}, [id, scrollerEl]);

  // Wheel-driven HORIZONTAL scrolling with eased momentum: the vertical wheel
  // feeds a target, and a rAF loop glides scrollLeft toward it — a smooth
  // "scrub" instead of a hard jump. Touch-drag and keys also supported.
  ajUE(() => {
    const el = scrollerEl;if (!el) return;
    let target = el.scrollLeft;
    let raf = 0;
    const clamp = (v) => Math.max(0, Math.min(el.scrollWidth - el.clientWidth, v));
    const loop = () => {
      const cur = el.scrollLeft;
      const next = cur + (target - cur) * 0.12;
      if (Math.abs(target - next) < 0.5) {el.scrollLeft = target;raf = 0;return;}
      el.scrollLeft = next;
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {if (!raf) raf = requestAnimationFrame(loop);};
    // section lefts = the slide boundaries; vertical wheel scrubs the timeline,
    // then settles on the nearest slide — a scrubbable horizontal slideshow.
    const sectionLefts = () => [...el.querySelectorAll(":scope > section")].map((s) => s.offsetLeft);
    let snapT = 0;
    const nearestLeft = (x) => {const L = sectionLefts();if (!L.length) return x;return L.reduce((b, v) => Math.abs(v - x) < Math.abs(b - x) ? v : b, L[0]);};
    const scheduleSnap = () => {clearTimeout(snapT);snapT = setTimeout(() => {target = clamp(nearestLeft(target));kick();}, 150);};
    const onWheel = (e) => {
      if (e.target && e.target.closest && e.target.closest("[data-keep-wheel]")) return;
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (d === 0) return;
      // line-mode wheels report small deltas; scale up for a usable stride
      const step = e.deltaMode === 1 ? d * 28 : d * 1.05;
      target = clamp(target + step);
      e.preventDefault();
      kick();
      scheduleSnap();
    };
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setScrollPct(max > 0 ? el.scrollLeft / max : 0);
    };
    // keep target synced when scrolled by other means (touch, drag, keys)
    const onScrollSync = () => {if (!raf) target = el.scrollLeft;};
    const onKey = (e) => {
      const L = sectionLefts();if (!L.length) return;
      const cur = L.reduce((bi, v, i) => Math.abs(v - el.scrollLeft) < Math.abs(L[bi] - el.scrollLeft) ? i : bi, 0);
      if (e.key === "ArrowRight") {target = clamp(L[Math.min(L.length - 1, cur + 1)]);kick();}
      if (e.key === "ArrowLeft") {target = clamp(L[Math.max(0, cur - 1)]);kick();}
    };
    // pointer drag-to-scrub on empty areas
    let down = false,lastX = 0;
    const onDown = (e) => {if (e.target.closest("[data-keep-wheel],[data-keep-drag],button,a,input,textarea")) return;down = true;lastX = e.clientX;};
    const onMove = (e) => {if (!down) return;target = clamp(target - (e.clientX - lastX) * 1.4);lastX = e.clientX;kick();};
    const onUp = () => {if (down) {down = false;scheduleSnap();}};
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scroll", onScrollSync, { passive: true });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    onScroll();
    return () => {
      if (raf) cancelAnimationFrame(raf);clearTimeout(snapT);
      el.removeEventListener("wheel", onWheel);el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scroll", onScrollSync);el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [scrollerEl]);

  if (!actor) return <div style={{ padding: 80, color: "var(--c-ink-3)", textAlign: "center" }}>Performer not found.</div>;

  const accent = actor.palette && tkc("amber");
  const films = ajFilmsFor(actor);
  const timeline = ajUM(() => ajBuildTimeline(actor), [actor]);
  const tlYears = timeline.map((n) => parseInt(n.year, 10)).filter((y) => !isNaN(y));
  const yearMin = tlYears.length ? Math.min(...tlYears) : "";
  const yearMax = tlYears.length ? Math.max(...tlYears) : "";
  const trophies = ajTrophiesFor(actor);
  const score = cinaCareerScore(actor);
  const ranking = ajUM(() => cinaLeadingActors(), []);
  const myRank = (ranking.find((r) => r.actor.id === actor.id) || {}).rank || "—";
  const autoRetired = typeof window.cinaRetireReason === "function" && window.cinaRetireReason(actor.id) === "auto";
  const retired = isRetired(actor.id) || typeof window.cinaIsRetired === "function" && window.cinaIsRetired(actor.id);
  const pastRoyalties = typeof window.cinaPastRoyalties === "function" ? window.cinaPastRoyalties(actor) : null;

  const leads = (actor.roles || []).filter((r) => r.lead).length;
  const debut = films[0];
  const debutYear = debut ? debut.film.year : 2025;
  const agent = ajAgent(actor);

  // gallery images for the organic wall (portrait + every title + stills)
  const galleryImages = ajUM(() => {
    const pf = window._photoForKind || ((k) => "assets/covers/a1.png");
    const arr = [];
    // lead portrait first
    if (actor.photo) arr.push({ src: actor.photo, title: actor.name, sub: "PORTRAIT" });
    // every title the performer appears in
    films.forEach((x) => {
      arr.push({
        src: pf(x.film.thumb), title: x.film.title, sub: `${x.film.year} · as ${x.role.as}`,
        onOpen: () => navigate(x.film.kind === "series" ? `/series/${x.film.id}` : `/film/${x.film.id}`)
      });
    });
    // production-still variety so the sphere reads full even for short careers
    const extraKinds = ["noir-f", "west-rider", "sci-neon", "face-night", "lantern", "window-rain", "west-canyon", "sci-city", "interior-dim", "west-dusk"];
    let k = 0;
    while (arr.length < 14 && k < extraKinds.length) {
      const f = films[k % Math.max(1, films.length)];
      arr.push({ src: pf(extraKinds[k]), title: f ? f.film.title : actor.name, sub: "PRODUCTION STILL" });
      k++;
    }
    return arr;
  }, [films, actor]);

  return (
    <AJScrollCtx.Provider value={scrollerEl}>
    <div data-screen-label={`Journey · ${actor.name}`} style={{ position: "relative", background: "var(--c-bg)", color: "var(--c-ink)" }}>
      <style>{`@keyframes ajPulse{0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes ajBob{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
        .ajh{scrollbar-width:none}.ajh::-webkit-scrollbar{height:0}
        .ajband{scrollbar-width:none}.ajband::-webkit-scrollbar{height:0}`}</style>

      <div ref={(n) => setScrollerEl(n)} className="ajh"
        style={{ height: "calc(100vh - 60px)", overflowX: "auto", overflowY: "hidden", display: "flex", alignItems: "stretch", overscrollBehaviorX: "contain" }}>

      {/* ════ 1 · INTRO — blurred full-bleed bg + portrait right, info left ════ */}
      <section style={{ position: "relative", flex: "0 0 auto", width: "100vw", minWidth: "100vw", height: "100%", display: "flex", alignItems: "safe center", overflowX: "hidden", overflowY: "auto" }}>
        {/* blurred full-size background */}
        <div style={{ position: "absolute", inset: 0 }}>
          {typeof CastPortrait === "function" && <CastPortrait actor={actor} size={1600} shot="wide" cover style={{ width: "110%", height: "110%", margin: "-5%", borderRadius: 0, filter: "blur(34px) saturate(1.05) brightness(.5)" }} />}
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,6,5,.94) 0%, rgba(8,6,5,.7) 50%, rgba(8,6,5,.5) 100%)" }} />
        <div style={{ position: "absolute", top: "-10%", right: "-6%", width: 560, height: 560, borderRadius: "50%", background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)` }} />

        <div style={{ position: "relative", width: "100%", maxWidth: "min(100vw, 1640px)", margin: "0 auto", padding: AJ_PAD, display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(300px,0.75fr)", gap: "clamp(32px, 5vw, 88px)", alignItems: "center" }}>
          {/* Left — info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => navigate(`/cast`)} style={{ height: 28, padding: "0 12px", fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-2)" }}>← ALL CAST</button>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent }}>CAREER JOURNEY</span>
              {typeof window.TrendChip === "function" && <window.TrendChip actor={actor} />}
            </div>
            <h1 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(56px, 7.5vw, 140px)", lineHeight: 0.86, letterSpacing: "-0.02em", margin: 0, textShadow: "0 6px 40px rgba(0,0,0,.6)" }}>
              {actor.name}
            </h1>
            {actor.archetype && <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(20px,2vw,30px)", color: accent, marginTop: 12 }}>“{actor.archetype}.”</div>}
            <p style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", marginTop: 18, maxWidth: 520, lineHeight: 1.62, textWrap: "pretty" }}>{actor.bio}</p>
            <div style={{ display: "flex", gap: 0, marginTop: 30, flexWrap: "wrap", borderTop: "1px solid var(--c-line)", borderBottom: "1px solid var(--c-line)" }}>
              {[["RANK", "#" + myRank], ["SCORE", score.toLocaleString()], ["LEADS", leads], ["TITLES", films.length], ["FOLLOWING", (actor.followers / 1000).toFixed(0) + "K"]].map(([k, v], i) =>
                  <div key={k} style={{ flex: "1 1 84px", padding: "16px 22px 16px", borderLeft: i === 0 ? "none" : "1px solid var(--c-line)" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>{k}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-ink)", lineHeight: .9 }}>{v}</div>
                </div>
                  )}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", alignItems: "center" }}>
              <FollowButton actor={actor} accent={accent} big />
              <button className="btn" onClick={() => scrollerEl && scrollerEl.scrollBy({ left: window.innerWidth * 0.85, behavior: "smooth" })} style={{ height: 50, padding: "0 24px", fontSize: "var(--fs-body)", gap: 9 }}>
                Explore the career →
              </button>
            </div>
          </div>

          {/* Right — sharp vertical portrait */}
          <div style={{ position: "relative", justifySelf: "end", width: "100%", maxWidth: 480 }}>
            <div style={{ position: "relative", aspectRatio: "3/4.4", borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid rgba(255,255,255,.16)", boxShadow: "0 50px 120px rgba(0,0,0,.6)" }}>
              {typeof CastPortrait === "function" && <CastPortrait actor={actor} size={620} shot="face" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 62%, rgba(8,6,4,.82))" }} />
              <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 3 }}>{actor.handle || "PERFORMER"}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), lineHeight: 1 }}>{actor.name}</div>
                </div>
                {typeof window.TrendHologram === "function" && <window.TrendHologram actor={actor} size={26} />}
              </div>
            </div>
          </div>
        </div>

        {/* scroll cue — wheel scrolls the strip sideways */}
        <div style={{ position: "absolute", right: 26, bottom: 24, display: "flex", alignItems: "center", gap: 10, color: "var(--c-ink-3)" }}>
          <span style={{ width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${accent})` }} />
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", animation: "ajPulse 2.4s ease-in-out infinite" }}>SCROLL TO MOVE →</div>
        </div>
      </section>

      {/* ════ 2 · BIOGRAPHY ════ */}
      <VSection label="THE BIOGRAPHY" accent={accent} tone="panel" fit bgActor={actor} bgShot="face" bgOpacity={0.16} bgBlur={3}>
        <div style={{ padding: AJ_PAD, maxWidth: "var(--w-page)", margin: "0 auto", width: "100%" }}>
          <RevealItem delay={0.04}>
            <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(34px, 5vw, 76px)", lineHeight: 1.04, letterSpacing: "-0.02em", margin: "0 0 28px", maxWidth: "var(--w-mid)", textWrap: "balance" }}>
              {actor.bio}
            </h2>
          </RevealItem>
          <RevealItem delay={0.1}>
            <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.75, color: "var(--c-ink-2)", maxWidth: 760, margin: 0, textWrap: "pretty" }}>
              {actor.name} {retired ? "built" : "is building"} a career across {films.length} title{films.length === 1 ? "" : "s"} on Cina — {leads} as the lead — since debuting in {debutYear}.
              {actor.range ? ` Their range runs ${actor.range.toLowerCase()}.` : ""} Following {(actor.followers / 1000).toFixed(0)}K, ranked #{myRank} all-time by career score.
            </p>
          </RevealItem>
          <RevealItem delay={0.16}>
            <div style={{ display: "flex", gap: 0, marginTop: 38, border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", flexWrap: "wrap", background: "var(--c-panel)" }}>
              {[
                  ["DEBUT", debutYear], ["ACTIVE", `${debutYear}–${retired && !autoRetired ? "2026" : "now"}`],
                  ["SIGNATURE", actor.archetype || "—"], ["RANGE", actor.range || "Versatile"]].
                  map(([k, v], i) =>
                  <div key={k} style={{ flex: "1 1 180px", padding: "22px 26px 20px", borderLeft: i === 0 ? "none" : "1px solid var(--c-line)" }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{k}</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 7, lineHeight: 1.18 }}>{v}</div>
                </div>
                  )}
            </div>
          </RevealItem>
        </div>
      </VSection>

      {/* ════ 3 · THE GALLERY — immersive 3D photo constellation ════ */}
      {/* full-bleed dark stage — no text, sphere fills the whole panel, overflow
                                                       clipped so stills never bleed into neighbouring sections. drag spins;
                                                       wheel still scrubs the strip (data-keep-drag, not keep-wheel). */}
      <section data-aj-label="THE GALLERY" data-keep-drag style={{ position: "relative", flex: "0 0 auto", width: "100vw", height: "100%", background: `var(--c-void, ${tkc("void")})`, overflow: "hidden" }}>
        {typeof window.ActorGallerySphere === "function" ?
            <window.ActorGallerySphere images={galleryImages} accent={typeof accent === "string" && accent.startsWith("#") ? accent: tkc("amber")} height={Math.round((window.innerHeight || 800) - 57)} /> :
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-ink-3)" }}>Gallery unavailable</div>}
        {/* edge fades blend the stage into the strip on both sides */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, var(--c-bg) 0%, transparent 7%, transparent 93%, var(--c-bg) 100%)" }} />
      </section>

      {/* ════ 4 · DOSSIER — vitals + range ════ */}
      {/* no VSection label here — AboutActor renders its own ABOUT eyebrow */}
      <VSection accent={accent} tone="panel" fit>
        <div style={{ padding: AJ_PAD, width: "100%", boxSizing: "border-box" }}>
          <AboutActor actor={actor} accent={accent} films={films} leads={leads} />
        </div>
      </VSection>

      {/* ════ 5 · TIMELINE — inline on the main strip ════ */}
      <VSection label="THE TIMELINE" accent={accent} w="auto" bgActor={actor} bgShot="wide" bgOpacity={0.1} bgBlur={5}>
        <div style={{ display: "flex", alignItems: "stretch", height: "100%" }}>
          {/* ── intro column ── */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(28px,5vw,84px)", width: "min(54vw, 470px)", flexShrink: 0 }}>
            <RevealItem>
              <div className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 20 }}>{yearMin} — {yearMax}</div>
              <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", lineHeight: 0.92, color: "var(--c-ink)", fontSize: "55px" }}>
                {films.length} titles,<br /><span style={{ color: "var(--c-ink-3)" }}>{timeline.length} milestones.</span>
              </h2>
              <div style={{ width: 48, height: 2, background: accent, opacity: 0.75, margin: "28px 0 22px" }} />
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", maxWidth: 320, lineHeight: 1.62, textWrap: "pretty" }}>Every role, series, branch and honour — in the order it happened. Scroll right to move through the career.</div>
            </RevealItem>
          </div>

          {/* ── timeline track: alternating cards on a year-marked spine ── */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "0 clamp(40px,6vw,120px) 0 8px", height: "100%" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "linear-gradient(90deg, transparent, var(--c-line-3) 3%, var(--c-line-3) 97%, transparent)", zIndex: 0 }} />
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(34px, 3.4vw, 72px)", height: "100%", position: "relative", zIndex: 1 }}>
              {timeline.map((n, i) => {
                    const above = i % 2 === 0;
                    const w = n.type === "award" ? 326 : n.type === "now" ? 252 : 408;
                    const dot = n.type === "award" ? "var(--c-amber)" : n.type === "branch" ? "var(--c-blood-l)" : n.type === "series" ? tkc("cat-1") : n.type === "debut" ? accent : "var(--c-ink-2)";
                    const stem = 34;
                    const ring = typeof dot === "string" && dot.startsWith("#") ? dot + "22" : "rgba(var(--accent-rgb),.14)";
                    return (
                      <div key={i} style={{ position: "relative", width: w, flexShrink: 0, alignSelf: "stretch" }}>
                    <div style={{ position: "absolute", left: 0, right: 0, [above ? "bottom" : "top"]: `calc(50% + ${stem}px)` }}>
                      <TimelineNodeCard node={n} accent={accent} />
                    </div>
                    <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 1, height: stem, background: `linear-gradient(${above ? "180deg" : "0deg"}, ${dot}, transparent)`, [above ? "bottom" : "top"]: "50%", zIndex: 1 }} />
                    <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: dot, border: "2px solid var(--c-bg)", boxShadow: `0 0 0 4px ${ring}`, zIndex: 3 }} />
                    <span className="t-mono t-num" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", [above ? "top" : "bottom"]: "calc(50% + 17px)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", whiteSpace: "nowrap" }}>{n.year}</span>
                  </div>);

                  })}
            </div>
          </div>
        </div>
      </VSection>

      {/* ════ 6 · TROPHIES — seal mounted on the winning film's still ════ */}
      {trophies.length > 0 &&
          <VSection accent={accent} tone="panel" w="auto" bgActor={actor} bgShot="wide" bgOpacity={0.1} bgBlur={5}>
          <div style={{ padding: AJ_PAD, marginBottom: 26, textAlign: "center" }}>
            <RevealItem>
              <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(34px,4.4vw,64px)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>Festival seals</h2>
              <div style={{ marginTop: 8, maxWidth: 420, marginLeft: "auto", marginRight: "auto", fontSize: "12px", width: "425px", color: "rgb(247, 173, 0)" }}>Hardware {actor.name.split(" ")[0]} has earned — each seal minted into the film that won it.</div>
            </RevealItem>
          </div>
          <div style={{ display: "flex", gap: 20, padding: "0 var(--gutter)", alignItems: "stretch" }}>
            {trophies.map((t, i) => {
                const f = typeof getFilm === "function" ? getFilm(t.filmId) : null;
                return (
                  <RevealItem key={i} delay={0.05 + i * 0.06} intensity={i % 2 ? -1 : 1}>
                  <button onClick={() => f && navigate(f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`)} style={{
                      position: "relative", width: 360, height: 460, borderRadius: "var(--r-3)", overflow: "hidden", cursor: f ? "pointer" : "default",
                      border: "1px solid var(--c-line-2)", padding: 0, background: f && f.color || tkc("panel"), textAlign: "left",
                      boxShadow: "0 30px 70px rgba(0,0,0,.5)"
                    }}>
                    {f && typeof FrameThumb === "function" && <div style={{ position: "absolute", inset: 0 }}><FrameThumb kind={f.thumb} usePhoto /></div>}
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 38%, ${t.color}22, transparent 60%), linear-gradient(180deg, rgba(8,6,4,.5) 0%, rgba(8,6,4,.4) 40%, rgba(8,6,4,.94) 100%)` }} />
                    <div style={{ position: "absolute", top: 34, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                      {typeof WinnerTrophy === "function" && <WinnerTrophy variant="seal" size={184} award={t.award} edition={t.edition} date={t.date} color={t.color} />}
                    </div>
                    <div style={{ position: "absolute", left: 22, right: 22, bottom: 22 }}>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: t.color, marginBottom: 6 }}>{t.award}</div>
                      <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), lineHeight: 1.05 }}>{f ? f.title : t.filmId}</div>
                      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.6)", marginTop: 6 }}>VOL {t.edition} · {f ? f.year || "" : ""}</div>
                    </div>
                  </button>
                </RevealItem>);

              })}
          </div>
        </VSection>
          }

      {/* ════ 7 · FOLLOW — big audience surface ════ */}
      <VSection accent={accent} tone="panel" fit bgActor={actor} bgShot="face" bgOpacity={0.12} bgBlur={4}>
        <div style={{ padding: AJ_PAD, width: "100%" }}>
          <FollowHero actor={actor} accent={typeof accent === "string" && accent.startsWith("#") ? accent: tkc("amber")} />
        </div>
      </VSection>

      {/* ════ 8 · PRESS — PR-approved articles (replaces standings) ════ */}
      <VSection label="IN THE PRESS" accent={accent} w="auto" style={{ justifyContent: "center" }} bg={typeof window._photoForKind === "function" ? window._photoForKind(films[0] && films[0].film && films[0].film.thumb || "noir-f") : undefined} bgOpacity={0.22} bgBlur={4}>
        <PressWall actor={actor} films={films} accent={typeof accent === "string" && accent.startsWith("#") ? accent: tkc("amber")} />
      </VSection>

      {/* ════ 9 · OWNER-ONLY · retire / hall of fame ════ */}
      {(cinaIsOwner(actor.id) || retired) &&
          <VSection label={cinaIsOwner(actor.id) ? "OWNER CONTROLS · PRIVATE" : "STATUS"} accent={accent} fit style={retired ? { background: "linear-gradient(160deg, rgba(var(--accent-rgb),.07), var(--c-bg) 60%)" } : null}>
          <div style={{ padding: AJ_PAD, width: "100%" }}>
            <RevealItem delay={0.04}>
              {cinaIsOwner(actor.id) && !retired &&
                <div className="t-mono" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, border: `1px solid ${accent}55`, borderRadius: 999, padding: "5px 12px", marginBottom: 18 }}>
                  {typeof Icon === "function" && <Icon name="lock" size={11} />} ONLY YOU CAN SEE THIS
                </div>
                }
              {retired && typeof WinnerTrophy === "function" &&
                <div style={{ marginBottom: 22 }}><WinnerTrophy variant="seal" size={130} award="ALL-TIME GREAT" edition={7} date="2026-06-01" color= "var(--c-amber)" /></div>
                }
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: retired ? "var(--c-amber)" : "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                {retired ? autoRetired ? "AUTO-RETIRED" : "ENSHRINED" : "LEGACY"}
                {typeof window.TrendHologram === "function" && <window.TrendHologram actor={actor} size={18} withScore />}
              </div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(28px,3.4vw,46px)", color: "var(--c-ink)", lineHeight: 1.06 }}>
                {retired ?
                  autoRetired ? `${actor.name} cooled off the active roster.` : `${actor.name} has retired into the Hall of Fame.` :
                  `Retire ${actor.name} at the top.`}
              </div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 12, maxWidth: 560, lineHeight: 1.55 }}>
                {retired ?
                  autoRetired ?
                  `Trend fell below the floor (${typeof window.TREND_FLOOR === "number" ? window.TREND_FLOOR : 16}/100), so casting auto-closed to make room for rising performers.` :
                  "Their DNA is sealed and the career stands as a complete body of work." :
                  "Retiring locks the body of work, mints an all-time seal, and removes the performer from active casting forever. This control is private to you."}
              </div>
              {retired && pastRoyalties != null &&
                <div style={{ marginTop: 18, padding: "14px 16px", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", background: "var(--c-panel)", maxWidth: 460 }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>STILL COLLECTING · PAST ROYALTIES</div>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-good)", marginTop: 3 }}>${pastRoyalties.toLocaleString()}<span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", fontStyle: "normal", marginLeft: 8 }}>LIFETIME</span></div>
                  <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.45 }}>Royalties from past work keep paying out — but no new castings, so no new earnings.</div>
                </div>
                }
              <div style={{ marginTop: 26, display: "flex", gap: 10 }}>
                {retired ?
                  cinaIsOwner(actor.id) && <button className="btn" onClick={() => unretire(actor.id)} style={{ height: 46, padding: "0 22px", fontSize: "var(--fs-body)" }}>Un-retire</button> :

                  <button className="btn btn-primary" onClick={() => {retire(actor.id);if (window.toast) window.toast({ title: "RETIRED", text: `${actor.name} → Hall of Fame`, kind: "good" });}} style={{ height: 46, padding: "0 24px", fontSize: "var(--fs-body)" }}>
                    Retire to Hall of Fame
                  </button>
                  }
              </div>
            </RevealItem>
          </div>
        </VSection>
          }

      {/* ════ 10 · REPRESENTATION — the very end ════ */}
      <VSection accent={accent} tone="panel" fit bgActor={actor} bgShot="wide" bgOpacity={0.1} bgBlur={5}>
        <div style={{ padding: AJ_PAD, width: "100%" }}>
          <RevealItem delay={0.04}><AgentContact actor={actor} agent={agent} accent={accent} retired={retired} /></RevealItem>
        </div>
      </VSection>

      </div>

      {/* fixed progress rail */}
      <div style={{ position: "fixed", left: 0, right: 0, top: 0, height: 3, background: "rgba(255,255,255,.05)", zIndex: 40, pointerEvents: "none" }}>
        <div style={{ height: "100%", width: `${(scrollPct * 100).toFixed(1)}%`, background: `linear-gradient(90deg, ${accent}, var(--c-amber))`, transition: "width .1s linear" }} />
      </div>
    </div>
    </AJScrollCtx.Provider>);

}

// ════════════════════════════════════════════════════════════════════════
function RangeBars({ actor, accent }) {
  const ref = ajUR(null);
  const p = useRevealY(ref);
  const inView = Math.abs(p) < 0.6;
  const seed = String(actor.id).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const axes = ["Drama", "Comedy", "Action", "Tension", "Voice", "Period"];
  const vals = axes.map((ax, i) => {
    // varied per-axis hash so no two bars collide
    const h = (seed * 131 + (i + 1) * 2654435761 >>> 0) % 1000 / 1000;
    return { ax, v: Math.round(38 + h * 58) };
  });
  return (
    <div ref={ref} style={{ display: "grid", gap: 13 }}>
      {vals.map((r, i) =>
      <div key={r.ax} style={{ display: "grid", gridTemplateColumns: "78px 1fr 34px", gap: 14, alignItems: "center" }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", textTransform: "uppercase" }}>{r.ax}</span>
          <span style={{ height: 7, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", overflow: "hidden", position: "relative" }}>
            <span style={{
            display: "block", height: "100%", borderRadius: "var(--r-2)",
            width: (inView ? r.v : 0) + "%",
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            transition: `width 1.1s cubic-bezier(.2,.8,.2,1) ${i * 0.07}s`,
            boxShadow: inView ? `0 0 12px -2px ${accent}` : "none"
          }} />
          </span>
          <span className="t-mono t-num" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", textAlign: "right" }}>{inView ? r.v : 0}</span>
        </div>
      )}
    </div>);

}

function AboutActor({ actor, accent, films, leads }) {
  const ac = typeof accent === "string" && accent.startsWith("#") ? accent: tkc("amber");
  const firstName = actor.name.split(" ")[0];
  const vitals = [
  ["BORN", actor.born], ["BASED", actor.based || actor.home], ["HEIGHT", actor.height],
  ["VOICE", actor.voice], ["PRESENCE", actor.presence], ["LANGUAGES", (actor.languages || []).join(" · ")]].
  filter(([, v]) => v);
  const titlesLine = `${films.length} title${films.length === 1 ? "" : "s"}`;
  const credits = [
  ["TITLES", String(films.length)],
  ["LEAD ROLES", String(leads)],
  ["ARCHETYPE", actor.archetype ? actor.archetype.replace(/^The /, "") : "—"]];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.78fr)", gap: "clamp(34px,4.5vw,72px)", alignItems: "stretch", width: "min(92vw, 1460px)" }}>
      {/* Left — the writing, distributed to fill the full column height */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "min(74vh, 680px)" }}>
        <RevealItem>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
            <span style={{ width: 26, height: 1, background: ac }} />
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: ac, letterSpacing: ".16em" }}>ABOUT</span>
          </div>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(34px,4.4vw,68px)", lineHeight: 1, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            About {firstName}
          </h2>
          {actor.archetype && <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: ac, marginBottom: 22 }}>{actor.archetype.toUpperCase()}</div>}
        </RevealItem>
        <RevealItem delay={0.06}>
          <p style={{ fontSize: "var(--fs-lead)", lineHeight: 1.68, color: "var(--c-ink-2)", margin: "0 0 16px", maxWidth: 560, textWrap: "pretty" }}>{actor.bio}</p>
        </RevealItem>
        <RevealItem delay={0.1}>
          <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.66, color: "var(--c-ink-3)", margin: "0 0 24px", maxWidth: 560, textWrap: "pretty" }}>
            Across {titlesLine} — {leads} as the lead — {firstName} has become known for {(actor.range || "a wide emotional range").toLowerCase()}.
            {actor.voice ? ` A ${actor.voice.toLowerCase()} that carries a room,` : ""} {actor.presence ? `${actor.presence.toLowerCase()} presence,` : ""} and the kind of stillness directors build a frame around.
          </p>
        </RevealItem>
        {/* credit stat band */}
        <RevealItem delay={0.12}>
          <div style={{ display: "flex", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", overflow: "hidden", marginBottom: 24 }}>
            {credits.map(([k, v], i) =>
            <div key={k} style={{ flex: 1, padding: "13px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none", background: "var(--c-panel)" }}>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1 }}>{v}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 6 }}>{k}</div>
              </div>
            )}
          </div>
        </RevealItem>
        {/* signature pull quote */}
        <RevealItem delay={0.14}>
          <div style={{ borderLeft: `2px solid ${ac}`, paddingLeft: 18, margin: "0 0 26px" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(20px,2vw,26px)", color: "var(--c-ink)", lineHeight: 1.3 }}>
              “{actor.quote || `I don't play the line — I play the second before it.`}”
            </div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginTop: 10 }}>— {actor.name.toUpperCase()}</div>
          </div>
        </RevealItem>
        {/* vitals inline */}
        <RevealItem delay={0.18}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px 24px", borderTop: "1px solid var(--c-line)", paddingTop: 22 }}>
            {vitals.map(([k, v]) =>
            <div key={k}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 5 }}>{k}</div>
                <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.2 }}>{v}</div>
              </div>
            )}
          </div>
        </RevealItem>
        {/* range profile — full-width feature band, pinned to the bottom so the
                     column always fills its height to match the portrait */}
        <RevealItem delay={0.22} style={{ marginTop: "auto", paddingTop: 26 }}>
          <div style={{ padding: "18px 22px 20px", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: ac }}>RANGE PROFILE</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>CASTING INDEX · 0–100</div>
            </div>
            <RangeBars actor={actor} accent={ac} />
          </div>
        </RevealItem>
      </div>

      {/* Right — one strong portrait, filling the full column height */}
      <RevealItem delay={0.06} style={{ display: "flex" }}>
        <div style={{ position: "relative", flex: 1, minHeight: 0, borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid var(--c-line-2)", background: actor.palette && actor.palette[2] || tkc("panel"), boxShadow: "0 30px 70px rgba(0,0,0,.45)" }}>
          {typeof CastPortrait === "function" && <CastPortrait actor={actor} size={620} shot="face" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 56%, rgba(8,6,4,.85))" }} />
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 22, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: ac, letterSpacing: ".16em", marginBottom: 4 }}>{actor.handle || "PERFORMER"}</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), lineHeight: 1 }}>{actor.name}</div>
            </div>
            {actor.archetype && <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.7)", letterSpacing: ".16em", textAlign: "right" }}>{actor.archetype.toUpperCase()}</div>}
          </div>
        </div>
      </RevealItem>
    </div>);

}

// ════════════════════════════════════════════════════════════════════════
function FollowHero({ actor, accent }) {
  const { following, toggle } = useFollow(actor.id);
  const [notify, setNotify] = ajUS(false);
  const base = actor.followers || 0;
  const count = base + (following ? 1 : 0);
  const weekly = 200 + String(actor.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 1800;
  const faces = ajUM(() => ajFollowerFaces(actor), [actor]);
  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : String(n);
  const share = () => {
    try {navigator.clipboard && navigator.clipboard.writeText(location.origin + location.pathname + "#/cast/" + actor.id);} catch (e) {}
    if (window.toast) window.toast({ title: "LINK COPIED", text: `Share ${actor.name}'s journey`, kind: "good" });
  };
  const first = actor.name.split(" ")[0];
  const notables = faces.slice(0, 2).map((f) => f.name).filter(Boolean);
  // deterministic 12-week growth curve for the momentum sparkline
  const curve = ajUM(() => {
    const s = String(actor.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = (i) => {const x = Math.sin((s + i * 17.3) * 91.7) * 43758.5;return x - Math.floor(x);};
    let v = 0.3;const pts = [];
    for (let i = 0; i < 12; i++) {v = Math.min(1, Math.max(0.12, v + (r(i) - 0.35) * 0.22));pts.push(v);}
    pts[11] = 1; // end at the peak (today)
    return pts;
  }, [actor]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,0.9fr)", gap: "clamp(40px,5vw,84px)", alignItems: "center", width: "min(94vw, 1480px)" }}>
      {/* ── Left — the ask, set like a headline ── */}
      <div>
        <RevealItem delay={0.04}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
            <span style={{ width: 26, height: 1, background: accent }} />
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em" }}>THE AUDIENCE</span>
          </div>
        </RevealItem>
        <RevealItem delay={0.08}>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(38px, 4.6vw, 76px)", lineHeight: 0.98, letterSpacing: "-0.02em", margin: "0 0 22px", maxWidth: 620, textWrap: "balance" }}>
            Stand behind {first}'s next move.
          </h2>
        </RevealItem>
        <RevealItem delay={0.12}>
          <p style={{ fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", maxWidth: 500, lineHeight: 1.62, margin: "0 0 30px", textWrap: "pretty" }}>
            Followers get every premiere, festival run and new title the moment it drops — and a vote in what {first} makes next.
          </p>
        </RevealItem>
        <RevealItem delay={0.16}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={toggle} className={following ? "btn" : "btn btn-primary"} style={{
              height: 58, padding: "0 32px", fontSize: "var(--fs-lead)", gap: 11, borderRadius: 999, fontWeight: 600,
              ...(following ? { background: "transparent", border: `1.5px solid ${accent}`, color: accent } : null)
            }}>
              {following ? "✓ Following" : "Follow " + first}
            </button>
            <button onClick={() => setNotify((v) => !v)} title="Notify me about new work" style={{
              height: 58, width: 58, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              background: notify ? accent : "transparent", border: "1.5px solid " + (notify ? accent : "var(--c-line-2)"),
              color: notify ? tkc("void") : "var(--c-ink-2)", transition: "all .2s ease"
            }}>{typeof Icon === "function" ? <Icon name="bell" size={20} /> : "🔔"}</button>
            <button onClick={share} title="Share" style={{
              height: 58, width: 58, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent", border: "1.5px solid var(--c-line-2)", color: "var(--c-ink-2)", transition: "all .2s ease"
            }}>{typeof Icon === "function" ? <Icon name="share" size={18} /> : "↗"}</button>
          </div>
        </RevealItem>
        {following &&
        <RevealItem delay={0.04}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: notify ? "var(--c-good)" : "var(--c-ink-3)", letterSpacing: ".16em", marginTop: 18 }}>
              {notify ? "✓ NOTIFICATIONS ON — you'll hear about every drop" : "TIP: TURN ON NOTIFICATIONS FOR NEW RELEASES"}
            </div>
          </RevealItem>
        }
      </div>

      {/* ── Right — the crowd, open on the page (no box) ── */}
      <RevealItem delay={0.14} intensity={-1}>
        <div style={{ position: "relative" }}>
          {/* soft glow pooled behind the count */}
          <div aria-hidden="true" style={{ position: "absolute", top: -30, left: -20, width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, ${accent}1c, transparent 68%)`, pointerEvents: "none" }} />

          {/* the big living number + momentum line */}
          <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 8 }}>
            <div className="t-display t-num" style={{ fontStyle: "italic", fontSize: "clamp(72px, 10vw, 148px)", lineHeight: 0.78, letterSpacing: "-0.02em", color: "var(--c-ink)" }}>{fmt(count)}</div>
            <svg width="120" height="56" viewBox="0 0 120 56" style={{ marginBottom: 14, overflow: "visible" }}>
              <defs>
                <linearGradient id={`flGrad-${actor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={accent} stopOpacity="0.32" />
                  <stop offset="1" stopColor={accent} stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const pts = curve.map((v, i) => [i / 11 * 120, 50 - v * 44]);
                const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
                const area = line + ` L120 56 L0 56 Z`;
                const last = pts[pts.length - 1];
                return <>
                  <path d={area} fill={`url(#flGrad-${actor.id})`} />
                  <path d={line} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx={last[0]} cy={last[1]} r="3.5" fill={accent} />
                </>;
              })()}
            </svg>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-3)", marginBottom: 30, display: "flex", alignItems: "center", gap: 14 }}>
            <span>FOLLOWERS</span>
            <span style={{ color: "var(--c-good)" }}>▲ {fmt(weekly)} THIS WEEK</span>
          </div>

          {/* WHO'S WATCHING — an overlapping face pile, no container */}
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 16 }}>WHO'S WATCHING</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {faces.slice(0, 8).map((f, i) =>
            <button key={f.id + i} onClick={() => navigate(`/cast/${f.id}`)} title={f.name}
            onMouseEnter={(e) => {e.currentTarget.style.transform = "translateY(-8px)";e.currentTarget.style.zIndex = 20;}}
            onMouseLeave={(e) => {e.currentTarget.style.transform = "none";e.currentTarget.style.zIndex = String(8 - i);}}
            style={{
              width: 60, height: 60, borderRadius: "50%", overflow: "hidden", padding: 0, cursor: "pointer",
              marginLeft: i === 0 ? 0 : -16, zIndex: 8 - i, position: "relative",
              border: "2.5px solid var(--c-bg)", outline: `1px solid ${accent}33`,
              background: f.palette && f.palette[2] || tkc("line"), flexShrink: 0,
              boxShadow: "0 8px 22px rgba(0,0,0,.5)", transition: "transform .35s cubic-bezier(.2,.8,.2,1)"
            }}>
                {typeof CastPortrait === "function" && <CastPortrait actor={f} size={96} shot="face" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />}
              </button>
            )}
            <div style={{
              marginLeft: -16, width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
              border: "2.5px solid var(--c-bg)", outline: `1px solid ${accent}33`, background: `var(--c-panel-2, ${tkc("panel")})`,
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0
            }}>
              <span className="t-mono t-num" style={{ fontSize: "var(--fs-body)", color: accent, letterSpacing: ".02em" }}>+{fmt(Math.max(0, count - 8))}</span>
            </div>
          </div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, margin: "20px 0 0", maxWidth: 420, textWrap: "pretty" }}>
            {notables.length === 2 ?
            <>Followed by <span style={{ color: "var(--c-ink)" }}>{notables[0]}</span>, <span style={{ color: "var(--c-ink)" }}>{notables[1]}</span> and <span className="t-num" style={{ color: accent }}>{fmt(count)}</span> others.</> :
            <><span className="t-num" style={{ color: accent }}>{fmt(count)}</span> people follow {first}.</>}
          </p>
        </div>
      </RevealItem>
    </div>);

}

// ════════════════════════════════════════════════════════════════════════
function PressWall({ actor, films, accent }) {
  const articles = ajUM(() => ajPress(actor, films), [actor, films]);
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "stretch", padding: "0 var(--gutter)" }}>
      {/* intro panel rides the rack as its first card — keeps the section wide, not tall */}
      <RevealItem style={{ alignSelf: "stretch", flexShrink: 0 }}>
        <div style={{ width: "min(30vw, 380px)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 26 }}>
          <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(34px, 3.6vw, 64px)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.02 }}>{actor.name} in the press</h2>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", marginTop: 14, maxWidth: 340, lineHeight: 1.6, textWrap: "pretty" }}>Coverage the publicist has cleared — reviews, interviews and features, newest on the left.</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginTop: 20 }}>{String(articles.length).padStart(2, "0")} CLEARED CLIPPINGS →</div>
        </div>
      </RevealItem>
      {articles.slice(0, 6).map((a, i) =>
      <RevealItem key={i} delay={0.04 + i * 0.05} intensity={i % 2 ? -1 : 1} style={{ alignSelf: "center" }}>
          <PressPoster a={a} accent={accent} featured={i === 0} />
        </RevealItem>
      )}
    </div>);

}

// One press story as a magazine cover on the rack: the still as art, the
// outlet masthead up top, the headline set big at the foot. Hover lifts the
// cover and slides the standfirst up from behind it.
function PressPoster({ a, accent, featured }) {
  const [hover, setHover] = ajUS(false);
  return (
    <button
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => a.film && navigate(`/film/${a.film.id || ""}`)}
      style={{
        position: "relative", flex: "0 0 auto",
        width: featured ? "min(40vw, 440px)" : 300,
        height: featured ? "min(56vh, 520px)" : "min(52vh, 470px)",
        borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid var(--c-line-2)", padding: 0, cursor: "pointer",
        background: a.color, textAlign: "left", color: "inherit",
        boxShadow: hover ? "0 34px 80px rgba(0,0,0,.62)" : "0 16px 44px rgba(0,0,0,.45)",
        transform: hover ? "translateY(-10px)" : "none",
        transition: "transform .55s cubic-bezier(.2,.8,.2,1), box-shadow .55s ease"
      }}>
      <div style={{ position: "absolute", inset: 0 }}>
        {typeof FrameThumb === "function" && <FrameThumb kind={a.thumb} usePhoto />}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,5,4,.66) 0%, rgba(6,5,4,.12) 30%, rgba(6,5,4,.5) 60%, rgba(6,5,4,.96) 100%)" }} />
      <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, transparent 75%)` }} />
      {/* masthead */}
      <div style={{ position: "absolute", top: 18, left: 18, right: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span className="t-mono" style={{ fontSize: featured ? 11 : 10, letterSpacing: ".16em", color: tkc("white"), fontWeight: 700, textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>{a.outlet}</span>
        <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: tkc("bg"), background: accent, padding: "3px 9px", borderRadius: 999, fontWeight: 700 }}>{a.tag}</span>
      </div>
      {/* headline + standfirst */}
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 18 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: featured ? "clamp(26px,2.5vw,40px)" : 23, color: tkc("white"), lineHeight: 1.06, textShadow: "0 2px 16px rgba(0,0,0,.72)" }}>{a.headline}</div>
        <div style={{ maxHeight: hover ? 90 : 0, opacity: hover ? 1 : 0, overflow: "hidden", transition: "max-height .4s ease, opacity .3s ease, margin .3s ease", marginTop: hover ? 10 : 0 }}>
          <p style={{ margin: 0, fontSize: "var(--fs-body)", color: "rgba(255,255,255,.84)", lineHeight: 1.5 }}>{a.excerpt}</p>
        </div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.62)", letterSpacing: ".16em", marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>{a.date.toUpperCase()}</span><span>{a.read.toUpperCase()} READ</span>
          <span style={{ color: "var(--c-good)", display: "inline-flex", alignItems: "center", gap: 5 }}>✓ PR-APPROVED</span>
        </div>
      </div>
    </button>);

}

// ── AgentContact — represented-by card + booking/license form + follow ──
function AgentContact({ actor, agent, accent, retired }) {
  const [agency, name, email, response] = agent;
  const [form, setForm] = ajUS({ name: "", email: "", brand: "", message: "" });
  const [sent, setSent] = ajUS(false);
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    if (window.toast) window.toast({ title: "ENQUIRY SENT", text: `${name} at ${agency} will reply ${response}`, kind: "good" });
  };
  const initials = name.split(" ").map((p) => p[0]).join("");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1fr)", gap: 44, alignItems: "center" }}>
      {/* Left — representation */}
      <div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: accent, letterSpacing: ".16em", marginBottom: 14 }}>REPRESENTATION</div>
        <h2 className="t-display" style={{ fontStyle: "italic", fontWeight: 400, fontSize: "clamp(30px, 3.4vw, 46px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Work with {actor.name.split(" ")[0]}.
        </h2>
        <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, maxWidth: 420, margin: "0 0 22px" }}>
          {retired ?
          `${actor.name} is retired from new castings, but the estate fields licensing and archival enquiries.` :
          `Booking, licensing and brand work route through their agent. Typical reply ${response}.`}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-panel)", maxWidth: 420 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, ${tkc("on-amber")})`, display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", flexShrink: 0 }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>REPRESENTED BY</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.2 }}>{name}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{agency} · <a href={`mailto:${email}`} style={{ color: accent, textDecoration: "none" }}>{email}</a></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          <FollowButton actor={actor} accent={accent} />
          <button className="btn" onClick={() => navigate(`/cast/${actor.id}`)} style={{ height: 40, padding: "0 16px", fontSize: "var(--fs-body)" }}>License likeness →</button>
        </div>
      </div>

      {/* Right — enquiry form */}
      <div style={{ padding: "26px 26px", border: "1px solid var(--c-line)", borderRadius: "var(--r-3)", background: "var(--c-bg)" }}>
        {sent ?
        <div style={{ textAlign: "center", padding: "26px 10px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px", background: "rgba(125,179,138,.16)", border: "1px solid rgba(125,179,138,.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-good)", fontSize: "var(--fs-title)" }}>✓</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>Enquiry sent.</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 8, lineHeight: 1.5 }}>{name} will be in touch {response}.</div>
            <button className="btn" onClick={() => {setSent(false);setForm({ name: "", email: "", brand: "", message: "" });}} style={{ height: 38, padding: "0 16px", fontSize: "var(--fs-body)", marginTop: 18 }}>Send another</button>
          </div> :

        <form onSubmit={submit}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", marginBottom: 16 }}>CONTACT THE AGENT</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <AJField label="Your name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
                <AJField label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
              </div>
              <AJField label="Brand / production" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} />
              <AJField label="What's the project?" textarea value={form.message} onChange={(v) => setForm((f) => ({ ...f, message: v }))} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 44, width: "100%", fontSize: "var(--fs-body)", marginTop: 16 }}>Send enquiry →</button>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 12, textAlign: "center" }}>GOES TO {name.toUpperCase()} · {agency.toUpperCase()}</div>
          </form>
        }
      </div>
    </div>);

}

function AJField({ label, value, onChange, type = "text", textarea, required }) {
  const base = {
    width: "100%", background: "var(--c-panel)", border: "1px solid var(--c-line-2)",
    borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", padding: "10px 12px",
    outline: "none", fontFamily: "var(--f-sans)", resize: "vertical"
  };
  return (
    <label style={{ display: "block" }}>
      <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 6 }}>{label.toUpperCase()}{required ? " *" : ""}</span>
      {textarea ?
      <textarea value={value} onChange={(e) => onChange(e.target.value)} required={required} rows={3} style={base} /> :
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} style={base} />}
    </label>);

}

// ════════════════════════════════════════════════════════════════════════
function TimelineNodeCard({ node, accent }) {
  // Award / now / debut chrome
  if (node.type === "award") {
    return (
      <div style={{ width: 326, padding: "30px 30px 32px", borderRadius: "var(--r-3)", background: "linear-gradient(158deg, rgba(var(--accent-rgb),.13), rgba(20,16,12,.62))", border: "1px solid rgba(var(--accent-rgb),.34)", boxShadow: "0 20px 48px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
          {typeof LaurelGlyph === "function" && <LaurelGlyph size={20} color= "var(--c-amber)" />}
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>HONOUR · {node.year}</span>
        </div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), lineHeight: 1.12, letterSpacing: "-0.01em" }}>{node.title}</div>
      </div>);

  }
  if (node.type === "now") {
    return (
      <div style={{ width: 252, padding: "30px 28px", borderRadius: "var(--r-3)", background: "rgba(20,16,12,.62)", border: "1px solid rgba(255,255,255,.13)", textAlign: "center", boxShadow: "0 20px 48px rgba(0,0,0,.4)" }}>
        <span className="rec-dot" style={{ margin: "0 auto 14px" }} />
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent }}>{node.year}</div>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: tkc("white"), marginTop: 8 }}>{node.title}</div>
      </div>);

  }
  // Film / series / branch / debut — a big video card
  const f = node.film;
  const kindLabel = node.type === "debut" ? "DEBUT" : node.type === "series" ? "SERIES" : node.type === "branch" ? "BRANCHED" : "FILM";
  const kindColor = node.type === "debut" ? accent : node.type === "branch" ? "var(--c-blood-l)" : node.type === "series" ? tkc("cat-1") : "rgba(255,255,255,.7)";
  return (
    <button onClick={() => f && navigate(f.kind === "series" ? `/series/${f.id}` : f.branched ? `/branches/${f.id}` : `/film/${f.id}`)}
    style={{ appearance: "none", textAlign: "left", cursor: "pointer", border: "none", background: "transparent", padding: 0, margin: "0 4px", flexShrink: 0 }}>
      <div style={{ width: 408, borderRadius: "var(--r-3)", overflow: "hidden", border: "1px solid rgba(255,255,255,.14)", background: f && f.color || tkc("panel"), boxShadow: "0 30px 64px rgba(0,0,0,.55)" }}>
        <div style={{ position: "relative", aspectRatio: "16/10" }}>
          {f && typeof FrameThumb === "function" && <FrameThumb kind={f.thumb} usePhoto />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,6,4,.08) 0%, rgba(8,6,4,.88) 100%)" }} />
          <div style={{ position: "absolute", top: 15, left: 15, display: "flex", gap: 9, alignItems: "center" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", fontWeight: 700, color: kindColor, padding: "4px 9px", borderRadius: 999, background: "rgba(8,6,4,.72)", border: `1px solid ${kindColor === "rgba(255,255,255,.7)" ? "rgba(255,255,255,.25)" : kindColor}` }}>{kindLabel}</span>
            <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: tkc("white"), textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{node.year}</span>
          </div>
          {node.trophy && typeof TrophyChip === "function" &&
          <div style={{ position: "absolute", top: 15, right: 15 }}><TrophyChip filmId={f.id} /></div>
          }
          <div style={{ position: "absolute", left: 18, bottom: 17, right: 18 }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: tkc("white"), lineHeight: 1.02, letterSpacing: "-0.01em", textShadow: "0 2px 14px rgba(0,0,0,.7)" }}>{f ? f.title : node.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "rgba(255,255,255,.84)" }}>as {node.as}</span>
              {node.lead && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: accent, border: `1px solid ${accent}`, borderRadius: "var(--r-1)", padding: "2px 6px" }}>LEAD</span>}
              {node.episodes ? <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "rgba(255,255,255,.55)" }}>· {node.episodes} EP</span> : null}
            </div>
          </div>
        </div>
      </div>
    </button>);

}

// ════════════════════════════════════════════════════════════════════════
function AllTimeLeadingActors({ highlightId, max = 8 }) {
  const { isRetired } = useRetired();
  const ranking = ajUM(() => cinaLeadingActors(), []);
  const top = ranking.slice(0, max);
  const topScore = top[0] ? top[0].score : 1;
  return (
    <section style={{ padding: "64px var(--gutter) 80px", borderTop: "1px solid var(--c-line)", background: "linear-gradient(180deg, var(--c-panel) 0%, var(--c-bg) 60%)" }}>
      <div style={{ maxWidth: "var(--w-page)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <div>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginBottom: 10 }}>THE STANDINGS</div>
            <h2 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", fontWeight: 400, margin: 0 }}>All-time leading actors</h2>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em", maxWidth: 280, textAlign: "right" }}>
            SCORE = LEADS + RUNS + HONOURS + FESTIVAL SEALS + FOLLOWING
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {top.map(({ actor, score, rank }) => {
            const retired = isRetired(actor.id);
            const me = actor.id === highlightId;
            const accent = actor.palette && tkc("amber");
            return (
              <button key={actor.id} onClick={() => navigate(`/journey/${actor.id}`)} style={{
                appearance: "none", textAlign: "left", cursor: "pointer", width: "100%",
                display: "grid", gridTemplateColumns: "44px var(--gutter) 1fr 200px 90px", gap: 16, alignItems: "center",
                padding: "12px 18px", borderRadius: "var(--r-2)",
                background: me ? "rgba(var(--accent-rgb),.08)" : "var(--c-panel)",
                border: "1px solid " + (me ? "var(--c-amber)" : "var(--c-line)")
              }}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: rank <= 3 ? "var(--c-amber)" : "var(--c-ink-4)" }}>{String(rank).padStart(2, "0")}</span>
                <span style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: `1px solid ${accent}55` }}>
                  {typeof CastPortrait === "function" && <CastPortrait actor={actor} size={56} shot="face" cover style={{ width: "100%", height: "100%", borderRadius: 0 }} />}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{actor.name}</span>
                    {retired && typeof LaurelGlyph === "function" && <LaurelGlyph size={14} color= "var(--c-amber)" />}
                    {rank === 1 && <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.45)", borderRadius: "var(--r-1)", padding: "1px 6px" }}>#1 ALL-TIME</span>}
                  </span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{(actor.roles || []).filter((r) => r.lead).length} LEADS · {(actor.roles || []).length} TITLES{retired ? " · RETIRED" : ""}</span>
                </span>
                <span style={{ height: 5, background: "var(--c-bg)", borderRadius: "var(--r-1)", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: (score / topScore * 100).toFixed(1) + "%", background: rank <= 3 ? "var(--c-amber)" : "var(--c-ink-3)" }} />
                </span>
                <span className="t-display t-num" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink-2)", textAlign: "right" }}>{score.toLocaleString()}</span>
              </button>);

          })}
        </div>
      </div>
    </section>);

}

Object.assign(window, { ActorCareerJourney });