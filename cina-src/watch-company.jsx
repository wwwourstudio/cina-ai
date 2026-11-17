// watch-company.jsx — Rich company pages: Blog, Press, Careers, Contact,
// Found a Studio. These replace the flat GenericAboutPage template for the
// slugs visitors actually click from the footer. Legal pages (terms,
// privacy…) keep the generic template.

const { useState: usCo } = React;

// ─── Shared scaffolding ──────────────────────────────────────────────────
function CoPage({ kicker, title, lede, children, wide }) {
  const [idx, ...rest] = String(kicker || "").split(/\s*·\s*/);
  return (
    <div className="pm">
      <PmMasthead index={idx} path={rest.join(" · ")} title={title} lede={lede}/>
      <div className="pm-wrap"><div style={{ maxWidth: wide ? "none" : 880 }}>{children}</div></div>
    </div>
  );
}

// ─── Blog ────────────────────────────────────────────────────────────────
const CO_POSTS = [
  { id: "hara-4200", tag: "FILMMAKER SPOTLIGHT", date: "Jun 2, 2026", read: "9 min",
    title: "How Hara Lin shot a six-episode space drama for $4,200 in render credits",
    excerpt: "Verge was boarded in eleven days, rendered across three models, and grossed 40× its budget in producer dividends. Lin walks through every line item.",
    author: "Cina Editorial", color: tkc("cat-6"),
    body: [
      ["h", "The pitch was a single image"],
      ["p", "Hara Lin didn't start Verge with a script. She started with a render: a maintenance worker, alone, watching a cargo hauler the size of a city drift past a viewport. \u201cI made that one frame, looked at it for a week, and knew there were six hours of television behind it,\u201d she says. \u201cThe whole show is that person trying to get home.\u201d"],
      ["p", "What follows is unusual for a spotlight: Lin gave us the actual ledger. Every render credit, every revision, every model swap. We're reproducing the line items because the number people fixate on \u2014 $4,200 \u2014 only means something when you can see what it bought."],
      ["h", "Eleven days of boarding"],
      ["p", "The previs phase ate 38% of the budget and almost none of the calendar. Lin boarded all six episodes in eleven days using the cheapest draft model, generating thumbnails at a quarter resolution. \u201cBoarding is where you fail cheaply,\u201d she says. \u201cI threw away maybe four hundred shots. Each one cost less than a coffee.\u201d"],
      ["quote", "You're not paying for the shots you keep. You're paying for the freedom to delete the ones you don't."],
      ["p", "The render-aware timeline mattered here more than anywhere. Because each clip carried its projected cost before she committed, Lin could see an expensive sequence forming and rewrite around it. A planned exterior battle became a sound-and-reaction scene shot entirely inside the hauler \u2014 cheaper, and as three different editors later told her, scarier."],
      ["h", "Three models, one look"],
      ["p", "The hardest technical problem wasn't cost, it was continuity across models. Lin rendered wide establishing shots on one model for its architecture, character close-ups on a second for its faces, and the final-episode zero-gravity sequence on a third that simply handled motion better. Holding a single grade across all three took the Vault's style-lock and, she admits, \u201ca humiliating amount of manual color work at 2am.\u201d"],
      ["h", "The economics"],
      ["p", "Verge cost $4,200 in credits and grossed just over 40\u00d7 that in producer dividends in its first ninety days. But Lin is quick to deflate the fairy tale: \u201cThe budget was four thousand dollars. The time was four months of my life. Don't confuse the two. The credits are cheap. The taste is not.\u201d"],
      ["p", "That's the line we keep coming back to across these spotlights. The tools collapse the cost of trying things. They do not collapse the cost of knowing which things are worth keeping."],
    ] },
  { id: "weekly-vs-binge", tag: "DISTRIBUTION DATA", date: "May 27, 2026", read: "7 min",
    title: "The economics of releasing weekly versus all-at-once",
    excerpt: "We pulled finish-rate and revenue curves from 412 series releases. Weekly wins on revenue. Binge wins on completion. The hybrid window wins on both.",
    author: "Data team", color: tkc("ink-4"),
    body: [
      ["p", "This is the question we get asked most by creators staging a series release, so we did the unglamorous thing and looked at the data: 412 multi-episode series released on Cina over fourteen months, normalized for catalog size and promotion spend."],
      ["h", "Weekly wins on revenue"],
      ["p", "Series released one episode per week earned 23% more producer revenue per title over their first ninety days than series dropped all at once. The mechanism is boring and reliable: a weekly cadence creates seven discrete promotion moments instead of one, and each episode's premiere re-surfaces the title in recommendation feeds."],
      ["quote", "A weekly release isn't a delivery schedule. It's seven chances to be discovered instead of one."],
      ["h", "Binge wins on completion"],
      ["p", "But all-at-once releases had a 31% higher series-completion rate. Viewers who started an available-in-full series were far more likely to finish it \u2014 momentum is real, and a one-week gap is where momentum goes to die. For a creator whose goal is a finished, talked-about body of work rather than week-over-week revenue, binge is the honest choice."],
      ["h", "The hybrid window"],
      ["p", "The highest performers on both axes did neither cleanly. They released the first two episodes together to establish momentum, then moved to weekly. This \u201cdouble premiere\u201d pattern captured the completion lift of a binge opening and the discovery lift of a weekly tail. It outperformed both pure strategies on revenue and finished within three points of pure-binge on completion."],
      ["p", "If you take one thing from this: don't pick a release strategy by gut or by copying a streamer whose economics are nothing like yours. The double-premiere-then-weekly window is, for now, the closest thing we have to a free lunch."],
    ] },
  { id: "own-nle", tag: "ENGINEERING", date: "May 19, 2026", read: "12 min",
    title: "Why we built our own NLE instead of integrating Resolve",
    excerpt: "Render-aware timelines need the editor to know what a shot costs before you cut it. No external NLE gives us that.",
    author: "Editor team", color: tkc("ink-4"),
    body: [
      ["p", "Building a non-linear editor from scratch is, by any reasonable engineering judgment, a bad idea. Mature editors represent thousands of person-years of work. We did it anyway, and this post is our attempt to justify that decision honestly \u2014 including the parts where we're not sure we were right."],
      ["h", "The thing no external NLE knows"],
      ["p", "On Cina, every shot has a cost. Re-rendering a sequence at higher resolution, swapping a model, extending a clip by two seconds \u2014 each of these spends credits. An editor that doesn't understand this is editing blind. We needed the timeline itself to surface, per clip, what a change would cost before you make it."],
      ["quote", "A cut isn't just an aesthetic decision here. It's a budget decision. The editor has to show both in the same gesture."],
      ["p", "We spent two weeks prototyping this as a plugin layer on top of an existing NLE. It worked, technically. It also felt like surgery through a keyhole \u2014 we were constantly fighting an interaction model that assumed footage was free and already on disk."],
      ["h", "What we gave up"],
      ["p", "Let's be clear about the cost. Our editor does not have the maturity, the keyboard-shortcut muscle memory, or the third-party plugin ecosystem of a twenty-year-old tool. Professional editors who join Cina spend a frustrating first week. We get email about it. They are not wrong."],
      ["h", "What we got"],
      ["p", "In exchange: a timeline where the cost of a creative choice is visible at the moment you make it, where re-rendering a shot is a right-click and not an export-import round trip, and where the AI that generated the footage and the tool that cuts it share one model of the project. That integration is the entire bet. If render-aware editing turns out not to matter, we built the wrong thing. We're betting it's the thing that matters most."],
    ] },
  { id: "six-themes", tag: "DESIGN NOTES", date: "May 8, 2026", read: "5 min",
    title: "A field guide to Cina's six channel themes",
    excerpt: "Darkroom, Atlas, Kitchen, Plains, Tape, Basement \u2014 where each came from and which films wear them best.",
    author: "Design team", color: tkc("cat-6"),
    body: [
      ["p", "A channel theme on Cina isn't a color scheme. It's a complete environment \u2014 typography, motion, the texture behind a poster, the sound a page makes when it loads. Six shipped this year. Here's where each came from."],
      ["h", "Darkroom"],
      ["p", "Our default, and the one most films wear. Graded charcoal, a single amber accent, type that behaves like a film title card. It came from a simple constraint: posters should glow, and nothing glows against white. Darkroom gets out of the way of the work."],
      ["h", "Atlas"],
      ["p", "Built for documentary and non-fiction. Cooler, more architectural, with a typographic system that loves captions and credits. Atlas assumes the viewer wants context, not mood."],
      ["h", "Kitchen"],
      ["p", "Warm, dense, a little chaotic \u2014 designed for cooking shows, how-to series, and anything where the appeal is competence on display. The one theme where we let things feel busy on purpose."],
      ["quote", "A theme should tell you what kind of attention a film is asking for before you press play."],
      ["h", "Plains, Tape, Basement"],
      ["p", "Plains is for slow cinema \u2014 enormous margins, almost no chrome, the film alone in a field of space. Tape is unapologetically retro, built for genre work that wants the texture of a worn VHS. Basement is the loudest: high-contrast, aggressive, made for horror and anything that wants to make you slightly uncomfortable in the navigation itself. Pick the one that matches the attention your film deserves."],
    ] },
  { id: "first-festival", tag: "FESTIVAL", date: "Apr 30, 2026", read: "6 min",
    title: "What we learned running the first all-AI film festival with human juries",
    excerpt: "14,000 submissions, 60 finalists, three sleepless jury weekends. The bar held.",
    author: "Festival desk", color: tkc("blood"),
    body: [
      ["p", "We went in with one fear: that an all-AI festival would be a novelty \u2014 interesting because of how the films were made, not whether they were any good. Fourteen thousand submissions later, that fear is mostly gone. Here's what actually happened."],
      ["h", "The juries were human, and skeptical"],
      ["p", "We recruited jurors from traditional festivals \u2014 programmers, critics, two editors with no particular love for AI. We told them nothing about how any film was made. The instruction was simply: is this good? Would you program it?"],
      ["quote", "By the second weekend the jury had stopped asking how a film was made and started arguing about whether its third act earned its ending. That was the whole point."],
      ["h", "What rose to the top"],
      ["p", "The finalists were not the technical showcases. The films that survived three rounds of jury were the ones with a point of view \u2014 a specific, often small human story told with unusual confidence. The tool was invisible. The taste was not."],
      ["h", "What we'd change"],
      ["p", "Three sleepless jury weekends is not sustainable; next time we stage the rounds across a month. And 14,000 submissions overwhelmed our first-pass review \u2014 we'll publish clearer entry guidance so creators don't submit a rough cut hoping the jury sees potential. The jury sees what's on screen. That's the deal, and it's the right one."],
    ] },
  { id: "actor-rights", tag: "POLICY", date: "Apr 22, 2026", read: "10 min",
    title: "Performer rights when the performer is synthetic",
    excerpt: "Vault actors accrue credits, royalties and \u2014 controversially \u2014 refusal rights. Why we modeled performer contracts on SAG scale.",
    author: "Trust & Safety", color: tkc("blood"),
    body: [
      ["p", "A synthetic performer has no agent, no union, and no ability to walk off set. That's precisely why we wrote them rights anyway. This post explains a decision that gets us criticized from both directions \u2014 and why we'd make it again."],
      ["h", "Why give rights to something that can't demand them"],
      ["p", "The cynical read is that performer rights are a constraint extracted by performers with leverage. We think that's backwards. Rights are how a system encodes what it refuses to do regardless of leverage. A Vault actor can't object \u2014 so the object has to be built into the contract, or it won't exist at all."],
      ["quote", "The test of a value isn't whether you honor it when forced to. It's whether you honor it when nobody can make you."],
      ["h", "Credits and royalties"],
      ["p", "Every Vault performer accrues a credit on the films they appear in and a royalty share on those films' revenue. That share flows to the performer's originating creator and, where a real likeness was licensed, to that person. We modeled the scale on SAG minimums because we wanted a number we could defend in a room full of working actors."],
      ["h", "Refusal rights, and the controversy"],
      ["p", "The contested part: a Vault performer carries refusal rights \u2014 categories of content it will not be cast in, set at creation and enforced at the platform level. Critics on one side call this anthropomorphic theater. Critics on the other say it doesn't go far enough. We think a synthetic performer with encoded refusals is a better world than one without, and we'd rather be argued with than be neutral."],
    ] },
];

function _coNav(slug) {
  (window.navigate || ((u) => { location.hash = u; }))("/about/blog/" + slug);
}

function CompanyBlogPage() {
  const [feat, ...rest] = CO_POSTS;
  return (
    <CoPage kicker="COMPANY · BLOG" title="Notes from the studio." lede="Filmmaker spotlights, model release notes, distribution data, and the occasional manifesto. New posts most Tuesdays." wide>
      {/* Featured */}
      <button onClick={() => _coNav(feat.id)} style={{
        display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: 0, width: "100%",
        background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", overflow: "hidden",
        textAlign: "left", cursor: "pointer", color: "inherit", padding: 0, marginBottom: 18,
      }}>
        <div style={{ aspectRatio: "16/9", background: `linear-gradient(120deg, ${feat.color} 0%, ${tkc("bg")} 85%)`, position: "relative" }}>
          <div style={{ position: "absolute", left: 22, top: 20 }} className="t-mono">
            <span style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.3)", borderRadius: "var(--r-1)", padding: "3px 7px" }}>{feat.tag}</span>
          </div>
        </div>
        <div style={{ padding: "clamp(20px, 3vw, 36px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginBottom: 12 }}>{feat.date.toUpperCase()} · {feat.read.toUpperCase()}</div>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(22px, 2.6vw, 30px)", lineHeight: 1.12, letterSpacing: "-0.01em", marginBottom: 12, textWrap: "balance" }}>{feat.title}</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>{feat.excerpt}</div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", marginTop: 18 }}>READ →</div>
        </div>
      </button>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {rest.map(p => (
          <button key={p.id} onClick={() => _coNav(p.id)} style={{
            background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)",
            padding: 0, overflow: "hidden", textAlign: "left", cursor: "pointer", color: "inherit",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ height: 6, background: p.color }}/>
            <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{p.tag} · {p.date.toUpperCase()}</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.18, letterSpacing: "-0.01em", textWrap: "balance" }}>{p.title}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55, flex: 1 }}>{p.excerpt}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{p.author.toUpperCase()} · {p.read.toUpperCase()}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Subscribe strip */}
      <div style={{ marginTop: 28, padding: "22px 26px", background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px" }}>
          <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>The dailies, weekly.</div>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 4 }}>One email every Friday — new films, festival calls, and what shipped in Studio.</div>
        </div>
        <div style={{ display: "flex", gap: 8, flex: "1 1 320px" }}>
          <input placeholder="you@example.com" style={{ flex: 1, minWidth: 0, background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "11px 14px", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}/>
          <button className="btn btn-primary" style={{ height: 40, padding: "0 18px", flexShrink: 0 }} onClick={() => window.toast && window.toast({ title: "SUBSCRIBED", text: "See you Friday.", kind: "good" })}>Subscribe</button>
        </div>
      </div>
    </CoPage>
  );
}

// ─── Blog post (detail) ──────────────────────────────────────────────────
function CompanyBlogPostPage({ slug }) {
  const idx = CO_POSTS.findIndex(p => p.id === slug);
  const post = CO_POSTS[idx];
  if (!post) {
    return (
      <CoPage kicker="COMPANY · BLOG" title="That post has moved." lede="We couldn't find the article at this link — it may have been retitled or unpublished.">
        <button className="btn btn-primary" style={{ height: 40, padding: "0 18px" }} onClick={() => _coNav2("/about/blog")}>← All posts</button>
      </CoPage>
    );
  }
  const next = CO_POSTS[(idx + 1) % CO_POSTS.length];
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px clamp(20px, 5vw, var(--gutter)) 96px" }}>
      <button onClick={() => _coNav2("/about/blog")} className="btn btn-ghost" style={{ marginBottom: 26, fontSize: "var(--fs-label)" }}>
        <Icon name="chev-l" size={11}/> All posts
      </button>

      {/* Masthead */}
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 16 }}>{post.tag}</div>
      <h1 className="t-display" style={{ fontSize: "clamp(30px, 5vw, 46px)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.08, margin: "0 0 22px", letterSpacing: "-0.02em", color: "var(--c-ink)", textWrap: "balance" }}>{post.title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 26, marginBottom: 4, borderBottom: "1px solid var(--c-line-2)" }} className="t-mono">
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)", letterSpacing: ".08em" }}>{post.author}</span>
        <span style={{ color: "var(--c-line-3)" }}>·</span>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{post.date.toUpperCase()}</span>
        <span style={{ color: "var(--c-line-3)" }}>·</span>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{post.read.toUpperCase()} READ</span>
      </div>

      {/* Hero band */}
      <div style={{ height: 200, borderRadius: "var(--r-3)", margin: "28px 0 36px", background: `linear-gradient(120deg, ${post.color} 0%, ${tkc("bg")} 88%)`, border: "1px solid var(--c-line)" }}/>

      {/* Body */}
      <article>
        {(post.body || []).map((block, i) => {
          const [kind, text] = block;
          if (kind === "h") return <h2 key={i} className="t-display" style={{ fontStyle: "italic", fontWeight: 500, fontSize: "clamp(22px, 3vw, 28px)", letterSpacing: "-0.01em", color: "var(--c-ink)", margin: "40px 0 14px", lineHeight: 1.2 }}>{text}</h2>;
          if (kind === "quote") return (
            <blockquote key={i} style={{ margin: "32px 0", padding: "4px 0 4px 24px", borderLeft: "2px solid var(--c-amber)" }}>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "clamp(20px, 2.6vw, 25px)", lineHeight: 1.4, color: "var(--c-ink)", textWrap: "pretty" }}>{text}</span>
            </blockquote>
          );
          return <p key={i} style={{ fontSize: "var(--fs-lead)", lineHeight: 1.72, color: "var(--c-ink-2)", margin: "0 0 22px", textWrap: "pretty" }}>{text}</p>;
        })}
      </article>

      {/* Footer / next */}
      <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--c-line-2)" }}>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 12 }}>READ NEXT</div>
        <button onClick={() => _coNav2("/about/blog/" + next.id)} style={{
          display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
          background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: 16, cursor: "pointer", color: "inherit",
        }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--r-2)", flexShrink: 0, background: `linear-gradient(120deg, ${next.color} 0%, ${tkc("bg")} 90%)` }}/>
          <div style={{ minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 5 }}>{next.tag}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", lineHeight: 1.2, textWrap: "balance" }}>{next.title}</div>
          </div>
          <div className="t-mono" style={{ marginLeft: "auto", fontSize: "var(--fs-label)", color: "var(--c-amber)", flexShrink: 0 }}>→</div>
        </button>
      </div>
    </div>
  );
}

function _coNav2(url) { (window.navigate || ((u) => { location.hash = u; }))(url); }

// ─── Press ───────────────────────────────────────────────────────────────
function CompanyPressPage() {
  const coverage = [
    { outlet: "The Verge", date: "May 2026", title: "Cina's festival proved AI films can hold a human jury's attention" },
    { outlet: "Variety", date: "Apr 2026", title: "Inside the platform paying audiences dividends to watch indie films" },
    { outlet: "IndieWire", date: "Mar 2026", title: "The post-Hollywood stack: how Cina collapses studio, theater and box office" },
    { outlet: "TechCrunch", date: "Feb 2026", title: "Cina raises Series B to scale its filmmaker-owned streaming model" },
  ];
  const facts = [
    ["FOUNDED", "2024"], ["FILMS RELEASED", "1,400+"], ["PAID TO CREATORS", "$31M"],
    ["PRODUCER PASSES", "212k"], ["TEAM", "38 people"], ["HUBS", "LA · Tokyo · Lagos · Berlin"],
  ];
  return (
    <CoPage kicker="COMPANY · PRESS" title="Press & media." lede="For press inquiries write press@cina.studio — a human answers within one business day. We don't comment on generic AI think pieces; we will talk for hours about distribution economics." wide>
      {/* Fast facts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: "var(--c-line)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden", marginBottom: 36 }}>
        {facts.map(([k, v]) => (
          <div key={k} style={{ background: "var(--c-panel)", padding: "18px 20px" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 }}>{k}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
        {/* Coverage */}
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 14 }}>RECENT COVERAGE</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {coverage.map((c, i) => (
              <div key={i} style={{ padding: "14px 2px", borderTop: i > 0 ? "1px solid var(--c-line)" : "none" }}>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", marginBottom: 5 }}>{c.outlet.toUpperCase()} · {c.date.toUpperCase()}</div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", lineHeight: 1.4 }}>{c.title}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Press kit */}
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 14 }}>PRESS KIT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Logo lockups", "SVG + PNG, dark & light", "2.1 MB"],
              ["Product screenshots", "Watch, Studio, Producers — approved set", "18 MB"],
              ["Approved film stills", "24 stills across 8 films, cleared for editorial", "64 MB"],
              ["Founder bios & headshots", "Short + long bios", "4 MB"],
              ["Fact sheet (PDF)", "One page, updated monthly", "180 KB"],
            ].map(([name, sub, size]) => (
              <button key={name} onClick={() => window.toast && window.toast({ title: "DOWNLOADING", text: name, kind: "info" })} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", textAlign: "left",
                background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", color: "inherit", cursor: "pointer",
              }}>
                <span style={{ fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>↓</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{name}</span>
                  <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 2 }}>{sub}</span>
                </span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", flexShrink: 0 }}>{size}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </CoPage>
  );
}

// ─── Careers ─────────────────────────────────────────────────────────────
function CompanyCareersPage() {
  const roles = [
    { title: "Senior Frontend Engineer", team: "PRODUCT", loc: "Remote · US/EU", type: "Full-time", blurb: "Own the Watch player and the Studio editor surface. Deep React, deeper taste." },
    { title: "ML Research — Motion Synthesis", team: "RESEARCH", loc: "Tokyo or remote", type: "Full-time", blurb: "Push character consistency across shots. You'll work with the Vault team on performer identity." },
    { title: "Filmmaker in Residence", team: "EDITORIAL", loc: "Los Angeles", type: "6-month", blurb: "Make films on the platform full-time, break the tools, write about both." },
    { title: "Head of Trust & Safety", team: "POLICY", loc: "Remote · US", type: "Full-time", blurb: "Own content guidelines, performer-rights policy, and the report queue. Hard problems, real stakes." },
    { title: "Studios Partnerships Lead", team: "BUSINESS", loc: "Los Angeles", type: "Full-time", blurb: "Bring independent production houses onto founded studios. You speak both film and term-sheet." },
  ];
  const values = [
    ["Async by default", "Write it down. Meetings are the exception."],
    ["Four-day weeks", "32 hours. Fridays are for your own films."],
    ["Equity for everyone", "Every full-time role, no exceptions."],
    ["Ship to audiences", "Everything we build lands in front of millions of watchers."],
  ];
  return (
    <CoPage kicker="COMPANY · CAREERS" title="Build the post-Hollywood stack." lede="We're 38 filmmakers, engineers and operators across LA, Tokyo, Lagos and Berlin. We hire slowly, pay well, and ship constantly." wide>
      {/* Values */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 40 }}>
        {values.map(([h, p]) => (
          <div key={h} style={{ padding: "18px 20px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 6 }}>{h}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>{p}</div>
          </div>
        ))}
      </div>

      {/* Open roles */}
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 14 }}>OPEN ROLES · {roles.length}</div>
      <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", overflow: "hidden" }}>
        {roles.map((r, i) => (
          <button key={r.title} onClick={() => window.toast && window.toast({ title: "APPLY", text: r.title + " — jobs@cina.studio", kind: "info" })} style={{
            display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 16, alignItems: "center", width: "100%",
            padding: "18px 22px", textAlign: "left", cursor: "pointer", color: "inherit",
            background: "var(--c-panel)", border: "none", borderTop: i > 0 ? "1px solid var(--c-line)" : "none",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--c-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--c-panel)"}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{r.title}</span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", border: "1px solid rgba(var(--accent-rgb),.35)", borderRadius: "var(--r-1)", padding: "2px 6px" }}>{r.team}</span>
              </span>
              <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink-3)", marginTop: 5, lineHeight: 1.5 }}>{r.blurb}</span>
            </span>
            <span style={{ textAlign: "right", flexShrink: 0 }}>
              <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{r.loc}</span>
              <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 3 }}>{r.type.toUpperCase()}</span>
            </span>
          </button>
        ))}
      </div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 16 }}>
        Don't see your role? Pitch us anyway — jobs@cina.studio. The best people we've hired wrote the email we didn't expect.
      </div>
    </CoPage>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────
function CompanyContactPage() {
  const [sent, setSent] = usCo(false);
  const [topic, setTopic] = usCo("support");
  const inboxes = [
    ["support", "Support", "Account, payments, playback — answered within 24h."],
    ["filmmakers", "Filmmakers", "Studio tools, render credits, publishing."],
    ["partnerships", "Partnerships", "Studios, brands, festivals."],
    ["press", "Press", "Interviews, data, assets."],
    ["legal", "Legal", "DMCA, rights, performer policy."],
  ];
  return (
    <CoPage kicker="COMPANY · CONTACT" title="Talk to a human." lede="Pick the right inbox and your message lands with the actual team — no ticket purgatory." wide>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, alignItems: "start" }}>
        {/* Form */}
        <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "clamp(18px, 3vw, 28px)" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "36px 12px" }}>
              <div style={{ width: 48, height: 48, margin: "0 auto 14px", borderRadius: "50%", background: "var(--c-good)", display: "flex", alignItems: "center", justifyContent: "center", color: tkc("panel"), fontSize: "var(--fs-lead)" }}>✓</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", marginBottom: 8 }}>Sent.</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>We'll reply to your email within one business day.</div>
            </div>
          ) : (
            <>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 10 }}>TOPIC</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                {inboxes.map(([id, label]) => (
                  <button key={id} onClick={() => setTopic(id)} style={{
                    padding: "7px 13px", borderRadius: "var(--r-3)", cursor: "pointer", fontSize: "var(--fs-body)",
                    background: topic === id ? "rgba(var(--accent-rgb),.12)" : "var(--c-bg)",
                    border: `1px solid ${topic === id ? "var(--c-amber)" : "var(--c-line-2)"}`,
                    color: topic === id ? "var(--c-amber)" : "var(--c-ink-3)",
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input placeholder="Name" style={coInp()}/>
                <input placeholder="Email" style={coInp()}/>
              </div>
              <input placeholder="Subject" style={{ ...coInp(), width: "100%", marginBottom: 10 }}/>
              <textarea placeholder="What's going on?" rows={5} style={{ ...coInp(), width: "100%", resize: "vertical", marginBottom: 14 }}/>
              <button className="btn btn-primary" style={{ height: 40, padding: "0 22px" }} onClick={() => setSent(true)}>Send message</button>
            </>
          )}
        </div>
        {/* Inbox directory */}
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 14 }}>DIRECT INBOXES</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {inboxes.map(([id, label, blurb], i) => (
              <div key={id} style={{ padding: "13px 2px", borderTop: i > 0 ? "1px solid var(--c-line)" : "none" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <span style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{label}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)" }}>{id}@cina.studio</span>
                </div>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 3 }}>{blurb}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, padding: "16px 18px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 }}>MAILING ADDRESS</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>Cina, Inc. · 1421 Sunset Blvd · Los Angeles, CA 90026</div>
          </div>
        </div>
      </div>
    </CoPage>
  );
}
function coInp() {
  return { background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", padding: "11px 13px", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)" };
}

// ─── Found a studio ──────────────────────────────────────────────────────
function CompanyFoundStudioPage() {
  const steps = [
    ["01", "Name it", "Pick a name and a .cina domain. Your studio is a real label — films ship under its banner, not yours alone."],
    ["02", "Set the table", "Invite collaborators with roles and revenue splits. Writer 15%, composer 10% — splits are enforced on-chain, on every dollar, forever."],
    ["03", "Fund the slate", "Mint producer passes per film or for the studio itself. Studio passes earn from everything the label ships."],
    ["04", "Ship under the banner", "Every release carries the studio mark, builds the studio audience, and pays the studio treasury."],
  ];
  return (
    <CoPage kicker="MAKE · FOUND A STUDIO" title="Don't just make a film. Found a label." lede="A studio on Cina is a shared banner with a treasury, enforced revenue splits, and its own audience. Two filmmakers or twenty — the contracts hold either way." wide>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 40 }}>
        {steps.map(([n, h, p]) => (
          <div key={n} style={{ padding: "20px 22px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", position: "relative" }}>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", color: "var(--c-amber)", opacity: .5, marginBottom: 10 }}>{n}</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 8 }}>{h}</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.55 }}>{p}</div>
          </div>
        ))}
      </div>

      {/* What you get */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 12 }}>A STUDIO GETS</div>
          {[
            "A shared treasury with on-chain revenue splits",
            "A studio channel page (the same builder, label-wide)",
            "Slate-level producer passes",
            "Shared Vault — performers any member can cast",
            "A studio token tradeable on the market",
          ].map(x => (
            <div key={x} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid var(--c-line)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>
              <span style={{ color: "var(--c-good)", fontSize: "var(--fs-body)" }}>✓</span>{x}
            </div>
          ))}
        </div>
        <div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 12 }}>STUDIOS SHIPPING TODAY</div>
          {[
            ["Cina Pictures", "Elias Voss + 4", "Last Light · 212k holders"],
            ["Hara Lab", "Lin Hara + 2", "Verge · weekly sci-fi"],
            ["Mosshouse", "Collective of 7", "Folk horror anthologies"],
          ].map(([name, who, what]) => (
            <div key={name} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ width: 34, height: 34, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-amber)" }}>{name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-body)", fontWeight: 600, color: "var(--c-ink)" }}>{name}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", marginTop: 2 }}>{who.toUpperCase()} · {what.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="Cina.html" className="btn btn-primary" style={{ height: 42, padding: "0 22px", fontSize: "var(--fs-body)" }}>Found your studio in Studio →</a>
        <button className="btn" style={{ height: 42, padding: "0 18px" }} onClick={() => navigate("/studios")}>Browse existing studios</button>
      </div>
    </CoPage>
  );
}

Object.assign(window, { CompanyBlogPage, CompanyPressPage, CompanyCareersPage, CompanyContactPage, CompanyFoundStudioPage });
