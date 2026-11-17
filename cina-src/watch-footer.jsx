// ─── Site footer ─────────────────────────────────────────────────────────
// Editorial end-card footer: brand + manifesto, link columns, a dedicated
// "get the app" band with redesigned store buttons + a scan code, and a
// legal strip with a live status pip. Used on splash + most marketing routes.

// fNav — use window.location.hash so the router's `hashchange` listener fires.
// (history.pushState + popstate doesn't trigger hashchange, which is what
// useRoute in watch-shell.jsx subscribes to — that bug used to silently
// break every link in this footer.)
const fNav = (to) => () => {
  const target = to.startsWith("/") || to === "" ? to : "/" + to;
  window.location.hash = "#" + target;
};

function FootCol({ title, links }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13, minWidth: 132 }}>
      <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{title}</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
        {links.map((l) =>
        <li key={l.label} style={{ display: "flex" }}>
            {l.href ?
          <a href={l.href} target={l.ext ? "_blank" : undefined} rel="noreferrer"
          className="foot-lnk"
          style={{ color: "var(--c-ink-2)", textDecoration: "none", fontSize: "var(--fs-body)" }}>
            
                {l.label}{l.ext && <span style={{ marginLeft: 4, color: "var(--c-ink-4)" }}>↗</span>}
              </a> :

          <button onClick={fNav(l.to)} className="foot-lnk" style={{
            background: "none", border: "none", padding: 0,
            color: "var(--c-ink-2)", fontSize: "var(--fs-body)", textAlign: "left", cursor: "pointer",
            fontFamily: "inherit"
          }}>
            {l.label}</button>
          }
          </li>
        )}
      </ul>
    </div>);

}

function SocialIcon({ kind }) {
  const paths = {
    x: <path d="M3 3l8.5 12L3.5 25h2.4l7-9.4L19 25h4L13.8 12.2 21.6 3h-2.4l-6.4 8.5L7 3H3z" fill="currentColor" />,
    ig: <><rect x="4" y="4" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6" fill="none" /><circle cx="14" cy="14" r="4.5" stroke="currentColor" strokeWidth="1.6" fill="none" /><circle cx="20" cy="8" r="1.2" fill="currentColor" /></>,
    yt: <><rect x="3" y="6" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" fill="none" /><path d="M12 10l6 4-6 4z" fill="currentColor" /></>,
    tt: <path d="M17 3v11.5a4 4 0 1 1-4-4M17 3a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />,
    rd: <><circle cx="14" cy="15" r="9" stroke="currentColor" strokeWidth="1.6" fill="none" /><circle cx="11" cy="14" r="1.2" fill="currentColor" /><circle cx="17" cy="14" r="1.2" fill="currentColor" /><path d="M10.5 18c1 1 2.2 1.4 3.5 1.4s2.5-.4 3.5-1.4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /><circle cx="22" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.2" fill="none" /><path d="M14 6h6.7" stroke="currentColor" strokeWidth="1.4" fill="none" /></>,
    dc: <path d="M9 8c2-1 4-1.5 5-1.5s3 .5 5 1.5l1 1.5c1 4 1 8 0 12l-2 1-1-2c-1 .5-2 .8-3 .8s-2-.3-3-.8l-1 2-2-1c-1-4-1-8 0-12L9 8z M11 14a1.5 1.8 0 1 0 3 0 1.5 1.8 0 1 0-3 0z M14 14a1.5 1.8 0 1 0 3 0 1.5 1.8 0 1 0-3 0z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
  };
  return <svg viewBox="0 0 28 28" width="16" height="16">{paths[kind]}</svg>;
}

const FOOT_CSS = `
.foot-lnk { transition: color .14s ease; position: relative; }
.foot-lnk:hover { color: var(--c-ink); }
.foot-soc:hover { color: var(--c-amber) !important; border-color: var(--c-amber-d) !important; background: rgba(var(--accent-rgb),.06) !important; }
`;

function SiteFooter() {
  const yr = 2026;
  const wrap = { maxWidth: "var(--w-page)", margin: "0 auto" };
  return (
    <footer style={{
      borderTop: "1px solid var(--c-line)",
      background: "linear-gradient(180deg, var(--c-bg) 0%, var(--c-void) 100%)"
    }}>
      <style>{FOOT_CSS}</style>

      {/* ── Main — brand + manifesto + link columns ── */}
      <div style={{
        ...wrap, padding: "52px var(--gutter) 44px",
        display: "flex", flexWrap: "wrap", gap: 56, alignItems: "flex-start",
        borderBottom: "1px solid var(--c-line)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: "1 1 280px", maxWidth: 360, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 11 }}>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-head)", lineHeight: 1, color: "var(--c-ink)" }}>Cina</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>WATCH</span>
          </div>
          <p style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", lineHeight: 1.6, margin: 0, maxWidth: 320 }}>
            The studio in your pocket. Watch indie films, invest in productions, and follow the filmmakers building the next era of cinema.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
            {[
            { k: "x", label: "X / Twitter", href: "https://x.com/cina" },
            { k: "ig", label: "Instagram", href: "https://instagram.com/cina" },
            { k: "yt", label: "YouTube", href: "https://youtube.com/@cina" },
            { k: "tt", label: "TikTok", href: "https://tiktok.com/@cina" },
            { k: "rd", label: "Reddit", href: "https://reddit.com/r/cina" },
            { k: "dc", label: "Discord", href: "https://discord.gg/cina" }].
            map((s) =>
            <a key={s.k} href={s.href} target="_blank" rel="noreferrer" title={s.label} className="foot-soc"
            style={{
              width: 34, height: 34, borderRadius: "var(--r-2)",
              border: "1px solid var(--c-line-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--c-ink-2)", textDecoration: "none",
              transition: "color .14s, border-color .14s, background .14s"
            }}>
              <SocialIcon kind={s.k} />
            </a>
            )}
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(124px, 1fr))", gap: "36px 40px",
          flex: "3 1 540px", minWidth: 0
        }}>
          <FootCol title="WATCH" links={[
          { label: "Home", to: "" },
          { label: "Films", to: "/genre/film" },
          { label: "Series", to: "/genre/series" },
          { label: "Branched", to: "/branches" },
          { label: "Cast", to: "/cast" },
          { label: "Studios", to: "/studios" },
          { label: "Festival", to: "/festival" },
          { label: "Holder rooms", to: "/rooms" }]
          } />
          <FootCol title="INVEST" links={[
          { label: "Producer market", href: "Producers.html#market" },
          { label: "Catalog index", href: "Producers.html#index" },
          { label: "Auction floor", href: "Producers.html#auctions" },
          { label: "My stakes & wallet", href: "Producers.html#portfolio" },
          { label: "How it works", to: "/about/invest" }]
          } />
          <FootCol title="MAKE" links={[
          { label: "Become a creator", to: "/apply" },
          { label: "Open Studio", href: "Cina.html", ext: true },
          { label: "Filmmaker handbook", to: "/about/handbook" },
          { label: "Pricing & credits", to: "/about/pricing" },
          { label: "Submit a film", to: "/about/submit" },
          { label: "Found a studio", to: "/about/found" }]
          } />
          <FootCol title="COMPANY" links={[
          { label: "About", to: "/about" },
          { label: "Blog", to: "/about/blog" },
          { label: "Press", to: "/about/press" },
          { label: "Careers", to: "/about/careers" },
          { label: "Contact", to: "/about/contact" }]
          } />
        </div>
      </div>

      {/* ── Legal strip ── */}
      <div style={{
        ...wrap, padding: "20px var(--gutter)",
        display: "flex", gap: "12px 24px", alignItems: "center", flexWrap: "wrap"
      }}>
        <span style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>© {yr} Cina, Inc. · All films © their respective creators.</span>
        <a href="https://status.cina" target="_blank" rel="noreferrer" className="foot-lnk"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--fs-label)", color: "var(--c-ink-3)", textDecoration: "none" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)", boxShadow: "0 0 0 3px rgba(106,163,122,.16)" }} />
          All systems operational
        </a>
        <span style={{ flex: 1, minWidth: 16 }} />
        <div style={{ display: "flex", gap: "10px 18px", fontSize: "var(--fs-label)", flexWrap: "wrap" }}>
          {[
          { l: "Terms", to: "/about/terms" },
          { l: "Privacy", to: "/about/privacy" },
          { l: "Cookies", to: "/about/cookies" },
          { l: "Content guidelines", to: "/about/guidelines" },
          { l: "DMCA", to: "/about/dmca" }].
          map((x) =>
          <button key={x.l} onClick={fNav(x.to)} className="foot-lnk" style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            color: "var(--c-ink-3)", fontSize: "var(--fs-label)", fontFamily: "inherit"
          }}>{x.l}</button>
          )}
        </div>
      </div>
    </footer>);

}

// ─── Generic info pages — for footer link targets ───────────────────────
const ABOUT_PAGES = {
  "": {
    title: "About Cina",
    kicker: "OUR STORY",
    body: "Cina is a studio for the post-Hollywood era. Filmmakers raise capital, render scenes with AI, ship weekly to a global audience, and split revenue with the people who showed up early. The platform is one half public theater and one half production house — every film you watch was made in the same studio you can open today.",
    sections: [
    { h: "What we believe", p: "Distribution is the new theater. The middle of the industry has been hollowed out and the edges — independent crews and the people who love their work — are where the next era of cinema is being built." },
    { h: "How it works", p: "Filmmakers open Studio, develop a film with AI collaborators, mint a Producer pass collection to fund the production, ship to the public Watch site, and share revenue with their producers and crew. The audience pays once at the box office and earns dividends every time the film is watched after." },
    { h: "The team", p: "We're a small group of filmmakers, engineers, and ex-studio veterans based across LA, Tokyo, Lagos, and Berlin." }]

  },
  invest: {
    title: "How investing on Cina works", kicker: "INVEST",
    body: "Every original film and series can mint a limited Producer pass collection that funds production. Producers earn a share of streaming revenue, voting rights on key creative decisions, and access to private cuts.",
    sections: [
    { h: "Tiers", p: "Most films offer 3-5 producer tiers — from a Backer pass at $50 to an Executive Producer credit at $25,000. Higher tiers earn a larger share of revenue and vote on more decisions." },
    { h: "Royalties", p: "Producers receive their share weekly, paid in USDC to the wallet that holds the pass. Director typically retains 50-70%; Cina takes 5%." },
    { h: "Secondary market", p: "Producer passes are tradeable on the Auction floor. The original director earns a 5-10% royalty on every resale, in perpetuity." }]

  },
  handbook: {
    title: "Filmmaker handbook", kicker: "MAKE",
    body: "Everything you need to ship your first film on Cina, from idea to release night.",
    sections: [
    { h: "Idea → Bible", p: "Open Studio, pitch your film in one paragraph. The Crew (writer, director, visual designer, editor, audio designer) drafts a film bible: tone, palette, pacing rules, world rules. You revise from there." },
    { h: "Script → Board", p: "Write in industry-standard format inside the Script panel. Every scene auto-links to a storyboard. The board generates concept frames you can promote to actual shots." },
    { h: "Cast → Render", p: "Birth original performers in the Vault, or cast from the public catalog. Send shots to the Generate panel — Veo 3, Kling, Gen-3, Sora, or Pika, depending on what fits the shot best." },
    { h: "Cut → Release", p: "The Editor is a real multi-track NLE. Lock picture, master audio, color, and ship a release window. Your film lives on Watch the moment you publish." }]

  },
  pricing: {
    title: "Pricing & credits", kicker: "MAKE",
    body: "Every Studio account gets 1,000 render credits per month, free. Beyond that, credits are billed at the cost of compute with no markup.",
    sections: [
    { h: "Free", p: "1,000 monthly credits. ~30 seconds of Veo 3, ~3 minutes of Kling, unlimited Pika. All editor and script tools." },
    { h: "Studio", p: "$49/mo. 10,000 monthly credits, priority queue, custom domain on your Watch channel, sponsor integrations." },
    { h: "House", p: "$199/mo. 50,000 monthly credits, multi-seat, found-a-studio tools, audited contracts, white-glove onboarding." }]

  },
  submit: {
    title: "Submit a film", kicker: "MAKE",
    body: "Films made outside Cina are welcome. Upload a master, set monetization, choose whether to mint, and we'll review for the public catalog within 72 hours.",
    sections: [
    { h: "Eligibility", p: "Original films, any length, any genre. You retain 100% of underlying IP. We require either an exclusive distribution window of 6 months or a non-exclusive co-listing." },
    { h: "Quality bar", p: "We don't gate on production budget. We do gate on craft — story, sound, image. Most submissions get notes back, not rejections." }]

  },
  press: { title: "Press", kicker: "COMPANY", body: "For press inquiries: press@cina.studio. We do not respond to outreach about generic AI think pieces.", sections: [{ h: "Brand assets", p: "Logo lockups, screenshots, and approved film stills available on request." }, { h: "Founder bios", p: "Available on request." }] },
  careers: {
    title: "Careers", kicker: "COMPANY",
    body: "We're hiring filmmakers, engineers, and operators. Remote-first, with hubs in LA and Tokyo.",
    sections: [
    { h: "Open roles", p: "Senior Frontend Engineer · ML Research (motion synthesis) · Filmmaker in Residence · Head of Trust & Safety · Studios Partnerships Lead." },
    { h: "How we work", p: "Async by default, four-day work weeks, equity for everyone, no Slack after 6pm. Apply at jobs@cina.studio." }]

  },
  blog: { title: "The Cina blog", kicker: "COMPANY", body: "Notes from the studio: filmmaker spotlights, model release notes, distribution data, and the occasional manifesto.", sections: [{ h: "Recent posts", p: "→ How Hara Lin shot a six-episode space drama for $4,200 in render credits  ·  → The economics of releasing a series weekly versus all-at-once  ·  → Why we built our own NLE instead of integrating Resolve  ·  → A field guide to Cina's six channel themes" }] },
  contact: { title: "Contact", kicker: "COMPANY", body: "support@cina.studio for everything that isn't press, careers, or partnerships.", sections: [{ h: "Other inboxes", p: "press@cina.studio  ·  jobs@cina.studio  ·  studios@cina.studio  ·  legal@cina.studio" }, { h: "Mailing address", p: "Cina, Inc. · 1421 Sunset Blvd · Los Angeles, CA 90026" }] },
  terms: { title: "Terms of service", kicker: "LEGAL", body: "By using Cina you agree to the following. Plain-language summary first; the full agreement is below.", sections: [{ h: "What you can do", p: "Watch films, invest in productions, make your own films, share what you love." }, { h: "What you can't do", p: "Reupload films you don't own, resell render output as your own training data, harass other users, or use the platform for prohibited categories (CSAM, non-consensual sexual content, real-person deepfakes without permission)." }, { h: "Your content", p: "You own your films. You grant Cina a non-exclusive license to host, transcode, and distribute them on the platform." }] },
  privacy: { title: "Privacy policy", kicker: "LEGAL", body: "We collect what we need to run the platform and nothing else. We do not sell user data.", sections: [{ h: "What we collect", p: "Account info, payment info via Stripe, viewing history, render usage, and crash logs. That's it." }, { h: "What we share", p: "Anonymized aggregates with creators (your views, ratings) so they can improve their films. Nothing personally identifiable." }, { h: "Your rights", p: "Export your data, delete your account, opt out of analytics — all from /settings." }] },
  cookies: { title: "Cookie policy", kicker: "LEGAL", body: "We use a small number of cookies for sign-in, preferences, and analytics. You can disable analytics cookies in /settings.", sections: [{ h: "Strictly necessary", p: "Session, sign-in, CSRF protection." }, { h: "Preferences", p: "Theme, audio defaults, kid mode, language." }, { h: "Analytics", p: "Aggregate page views and player engagement. Off by default in EU." }] },
  guidelines: { title: "Content guidelines", kicker: "LEGAL", body: "Cina is for serious creative work. The bar is craft, not taste — but a few categories are out of bounds.", sections: [{ h: "Not allowed", p: "Sexual content involving minors, non-consensual deepfakes of real people, content promoting violence against protected groups, instructional content for self-harm or weapon manufacture." }, { h: "Allowed with rating gate", p: "Graphic violence, sexual content between adults, drug use, gore. These earn an R rating and require ID verification to view." }, { h: "Reporting", p: "Every film page has a Report button. We respond to reports within 24h." }] },
  dmca: { title: "DMCA notice", kicker: "LEGAL", body: "Send takedown requests to dmca@cina.studio. Include the URL, the original work, your contact info, and a sworn statement.", sections: [{ h: "Counter-notices", p: "If your film was taken down in error, file a counter-notice via the same address. We restore content within 10-14 business days unless the original claimant files suit." }] }
};

function GenericAboutPage({ slug }) {
  const page = ABOUT_PAGES[slug || ""] || ABOUT_PAGES[""];
  return (
    <div className="pm">
      <PmMasthead index={(page.kicker || "").split(" · ")[0]} path={(page.kicker || "").split(" · ").slice(1).join(" · ")} title={page.title} lede={page.body}/>
      <div className="pm-wrap"><div style={{ maxWidth: 880 }}>
      {page.sections.map((s, i) =>
      <section key={i} style={{ marginBottom: 36, paddingBottom: 28, borderBottom: i === page.sections.length - 1 ? "none" : "1px solid var(--c-line)" }}>
          <h2 className="t-display" style={{ fontSize: "var(--fs-title)", fontStyle: "italic", fontWeight: 400, margin: "0 0 12px", color: "var(--c-ink)" }}>{s.h}</h2>
          <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.65, color: "var(--c-ink-2)", margin: 0 }}>{s.p}</p>
        </section>
      )}
      </div></div>
    </div>);

}

Object.assign(window, { SiteFooter, GenericAboutPage });
