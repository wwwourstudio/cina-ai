// watch-extras.jsx — Watchlist · Account · Comments+Ratings widget
// Adds finished workflows for routes the profile menu links to,
// plus a real, signed-in-aware reviews experience for the watch page.

const { useState: usX, useEffect: ueX, useMemo: umX, useRef: urX } = React;

// ─── shared bits ────────────────────────────────────────────────────────
function _ago_watchExtras(ms) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  return new Date(ms).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function PageHeader({ kicker, title, sub, right, count }) {
  // Same masthead as every kit page: mono index over a rule, display title, lede right.
  const [idx, ...rest] = String(kicker || "").split(/\s*[·—]\s*/);
  return (
    <PmMasthead bare index={idx} path={rest.join(" · ")} count={count} title={title} lede={sub}>{right}</PmMasthead>
  );
}

function EmptyState({ icon = "play", title, body, cta, children }) {
  return <CinaEmpty icon={icon} title={title} body={body} cta={cta}>{children}</CinaEmpty>;
}

// ─── /watchlist ──────────────────────────────────────────────────────────
function WatchlistPage() {
  useSession();
  const ids = SESSION.watchlist || [];
  const films = ids.map(id => CATALOG.find(f => f.id === id)).filter(Boolean);
  const [tab, setTab] = usX("saved"); // saved | continue | rated | followed

  const continued = (SESSION.continued || []).map(c => ({ ...c, film: CATALOG.find(f => f.id === c.filmId) })).filter(c => c.film);
  const ratedIds = Object.keys(SESSION.ratings || {});
  const rated = ratedIds.map(id => ({ id, n: SESSION.ratings[id], film: CATALOG.find(f => f.id === id) })).filter(r => r.film);
  const followed = (SESSION.followed || []).map(id => CREATORS.find(c => c.id === id)).filter(Boolean);

  return (
    <div style={{ padding: "0 var(--gutter) 96px", maxWidth: "var(--w-page)", margin: "0 auto" }}>
      <PageHeader
        kicker="LIBRARY · WATCHLIST"
        title="Watchlist"
        sub="Films and series you've saved, paused, rated, and the creators you follow."
        right={<PmLibraryTabs current="/watchlist"/>}
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid var(--c-line)", paddingBottom: 0 }}>
        {[
          { id: "saved",    label: "Saved",     n: films.length },
          { id: "continue", label: "Continue",  n: continued.length },
          { id: "rated",    label: "Rated",     n: rated.length },
          { id: "followed", label: "Following", n: followed.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            appearance: "none", border: "none", background: "transparent",
            padding: "10px 14px", marginBottom: -1,
            fontSize: "var(--fs-body)", fontWeight: tab === t.id ? 600 : 450,
            color: tab === t.id ? "var(--c-ink)" : "var(--c-ink-3)",
            borderRadius: 0,
            borderBottom: `2px solid ${tab === t.id ? "var(--c-amber)" : "transparent"}`,
            cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center",
          }}>
            {t.label}
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: tab === t.id ? "var(--c-amber)" : "var(--c-ink-4)" }}>{t.n}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "saved" && (
        films.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {films.map(f => <SavedCard key={f.id} film={f}/>)}
          </div>
        ) : (
          <EmptyState
            icon="heart"
            title="Your watchlist is empty"
            body="Tap the heart on any film, series, or premiere — they'll all live here."
            cta={<button className="btn btn-primary" style={{ height: 36 }} onClick={() => navigate("/")}>Browse films</button>}
          />
        )
      )}

      {tab === "continue" && (
        continued.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {continued.map((c, i) => <ContinueCard key={i} entry={c}/>)}
          </div>
        ) : (
          <EmptyState icon="play" title="Nothing in progress" body="When you pause something mid-watch we'll keep your spot here."/>
        )
      )}

      {tab === "rated" && (
        rated.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {rated.map(r => <SavedCard key={r.id} film={r.film} rating={r.n}/>)}
          </div>
        ) : (
          <EmptyState icon="spark" title="No ratings yet" body="Rate a film 1–5 stars after watching to remember what you loved."/>
        )
      )}

      {tab === "followed" && (
        followed.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {followed.map(c => (
              <button key={c.id} onClick={() => navigate(`/creator/${c.id}`)} className="btn-ghost" style={{
                padding: 16, height: "auto", borderRadius: "var(--r-2)",
                background: "var(--c-panel)", border: "1px solid var(--c-line)",
                display: "flex", alignItems: "center", gap: 12, textAlign: "left", justifyContent: "flex-start",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: c.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tkc("white"), fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", fontWeight: 500,
                  flexShrink: 0,
                }}>{c.name.split(" ").map(p=>p[0]).join("")}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{c.name}</div>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".08em" }}>
                    {fmtCount(c.followers)} followers · {CATALOG.filter(f => f.creatorId === c.id).length} films
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleFollow(c.id); }} className="btn" style={{ height: 28, padding: "0 10px", fontSize: "var(--fs-label)" }}>
                  Unfollow
                </button>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon="user" title="Not following anyone yet" body="Follow creators to get drop alerts and never miss a premiere."
            cta={<button className="btn btn-primary" style={{ height: 36 }} onClick={() => navigate("/studios")}>Find creators</button>}/>
        )
      )}
    </div>
  );
}

function SavedCard({ film, rating }) {
  const [hover, setHover] = usX(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", borderRadius: "var(--r-2)", overflow: "hidden",
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        cursor: "pointer",
      }}
      onClick={() => navigate(film.kind === "series" ? `/series/${film.id}` : `/film/${film.id}`)}
    >
      <div style={{ aspectRatio: "16/9", background: film.color, overflow: "hidden", position: "relative" }}>
        <FrameThumb kind={film.thumb} usePhoto/>
        {hover && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <button className="btn btn-primary" style={{ height: 32, padding: "0 14px", fontSize: "var(--fs-body)" }} onClick={(e) => { e.stopPropagation(); navigate(film.kind === "series" ? `/series/${film.id}` : `/film/${film.id}`); }}>
              <Icon name="play" size={11}/> Watch
            </button>
            <button className="btn-ghost btn-icon" style={{ width: 32, height: 32, color: tkc("white"), background: "rgba(0,0,0,.5)" }}
              onClick={(e) => { e.stopPropagation(); toggleWatchlist(film.id); }}
              title="Remove from watchlist">
              <Icon name="x" size={12}/>
            </button>
          </div>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{film.title}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 }}>
          {film.creator} · {film.genre[0]}{rating ? "" : ` · ★ ${film.rating}`}
        </div>
        {rating && (
          <div style={{ marginTop: 4, fontSize: "var(--fs-body)", color: "var(--c-amber)" }}>
            {"★".repeat(rating)}<span style={{ color: "var(--c-line-2)" }}>{"★".repeat(5 - rating)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ContinueCard({ entry }) {
  const f = entry.film;
  const pct = Math.min(100, Math.round((entry.t / entry.dur) * 100));
  const remaining = Math.max(1, Math.round((entry.dur - entry.t) / 60));
  return (
    <button onClick={() => navigate(f.kind === "series" ? `/series/${f.id}/ep/${entry.ep || 1}` : `/film/${f.id}`)}
      className="btn-ghost" style={{
        padding: 0, height: "auto", borderRadius: "var(--r-2)", overflow: "hidden",
        background: "var(--c-panel)", border: "1px solid var(--c-line)",
        display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0, textAlign: "left", justifyContent: "flex-start",
      }}>
      <div style={{ aspectRatio: "16/9", background: f.color, position: "relative", overflow: "hidden" }}>
        <FrameThumb kind={f.thumb} usePhoto/>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.25)" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: tkc("white") }}>
            <Icon name="play" size={20}/>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(255,255,255,.18)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--c-amber)" }}/>
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)" }}>{f.title}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 3 }}>
          {entry.ep ? `S${String(f.season || 1).padStart(2,"0")}·E${String(entry.ep).padStart(2,"0")} · ` : ""}
          {remaining}m left · paused {_ago_watchExtras(entry.at)}
        </div>
      </div>
    </button>
  );
}

// ─── /account ────────────────────────────────────────────────────────────
function AccountPage() {
  useSession();
  const [section, setSection] = usX(() => {
    const m = (window.location.hash || "").match(/[?&]tab=([^&]+)/);
    const t = m ? decodeURIComponent(m[1]) : "";
    if (t === "appearance" || t === "display") return "display";
    if (["profile", "playback", "billing", "wallet", "alerts", "privacy", "danger"].includes(t)) return t;
    return "profile";
  });

  const sections = [
    { id: "profile",  label: "Profile" },
    { id: "display",  label: "Display & mood" },
    { id: "playback", label: "Playback" },
    { id: "billing",  label: "Plan & billing" },
    { id: "wallet",   label: "Wallet" },
    { id: "alerts",   label: "Notifications" },
    { id: "privacy",  label: "Privacy & data" },
    { id: "danger",   label: "Sign out" },
  ];

  return (
    <div style={{ padding: "3% var(--gutter) 80px", maxWidth: "var(--w-page)", margin: "0 auto", width: "100%" }}>
      <PageHeader kicker="ACCOUNT" title="User Settings" sub="Manage your Cina ID, display mood, plan, wallet, and how Cina behaves on every device."/>

      <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "22% minmax(0,78%)", gap: "4%" }}>
        {/* Sidebar — 0-radius architectural hairline menu */}
        <aside style={{ position: "sticky", top: 84, alignSelf: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--c-line)" }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                appearance: "none", border: "none", borderBottom: "1px solid var(--c-line)", textAlign: "left",
                padding: "11px 12px", borderRadius: 0, cursor: "pointer",
                background: section === s.id ? "var(--c-panel-2)" : "transparent",
                color: section === s.id ? "var(--c-ink)" : "var(--c-ink-3)",
                fontSize: "var(--fs-body)", fontWeight: section === s.id ? 600 : 400,
                borderLeft: `2px solid ${section === s.id ? "var(--c-amber)" : "transparent"}`,
              }}>{s.label}</button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div>
          {section === "profile"  && <ProfileSection/>}
          {section === "display"  && <SettingCard title="Display mood & motion" sub="Controls surface color theme, editorial density, and projection motion across Watch, Studio, and Producers.">{window.AppearanceSection ? <window.AppearanceSection accent="var(--c-amber)"/> : null}</SettingCard>}
          {section === "playback" && <PlaybackSection/>}
          {section === "billing"  && <BillingSection/>}
          {section === "wallet"   && <WalletSettingsSection/>}
          {section === "alerts"   && <AlertsSection/>}
          {section === "privacy"  && <PrivacySection/>}
          {section === "danger"   && <DangerSection/>}
        </div>
      </div>
    </div>
  );
}

function SettingCard({ title, sub, children }) {
  return (
    <section style={{ background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", padding: 22, marginBottom: 14 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", marginBottom: 4 }}>{title}</div>
        {sub && <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>{sub}</div>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="m-stack" style={{ display: "grid", gridTemplateColumns: "180px minmax(0,1fr)", gap: 16, padding: "10px 0", borderTop: "1px solid var(--c-line)", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", marginTop: 2 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      appearance: "none", border: "none", width: 38, height: 22, borderRadius: "var(--r-3)",
      background: on ? "var(--c-amber)" : "var(--c-panel-2)",
      border: `1px solid ${on ? "var(--c-amber-d)" : "var(--c-line-2)"}`,
      position: "relative", cursor: "pointer", transition: "background .14s ease",
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16,
        borderRadius: "50%", background: on ? tkc("on-amber") : "var(--c-ink-2)",
        transition: "left .14s ease",
      }}/>
    </button>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", w = 280 }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
      width: w, height: 32, padding: "0 10px",
      background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)",
      color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-sans)",
    }}/>
  );
}

function ProfileSection() {
  const savedPrefs = (() => { try { return JSON.parse(localStorage.getItem("cina:account-prefs") || "{}"); } catch { return {}; } })();
  const [handle, setHandle] = usX((window.CINA && window.CINA.handle) || SESSION.handle || USER.ens || "");
  const [email, setEmail] = usX((window.CINA && window.CINA.email) || SESSION.email || "you@cina.io");
  const [bio, setBio] = usX(savedPrefs.bio || "Building cinema on Cina.");
  const [avatar, setAvatar] = usX(() => { try { return savedPrefs.avatar || localStorage.getItem("cina:avatar") || ""; } catch { return ""; } });
  const fileRef = urX(null);
  const onAvatarFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast({ title: "TOO LARGE", text: "Pick an image under 4 MB.", kind: "warn" }); e.target.value = ""; return; }
    const r = new FileReader();
    r.onload = () => {
      const url = r.result;
      setAvatar(url);
      try {
        localStorage.setItem("cina:avatar", url);
        const p = JSON.parse(localStorage.getItem("cina:account-prefs") || "{}");
        localStorage.setItem("cina:account-prefs", JSON.stringify({ ...p, avatar: url }));
      } catch {}
      window.dispatchEvent(new CustomEvent("cina:avatar", { detail: url }));
      toast({ title: "AVATAR UPDATED", text: "Your new picture is live.", kind: "good" });
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };
  const removeAvatar = () => {
    setAvatar("");
    try {
      localStorage.removeItem("cina:avatar");
      const p = JSON.parse(localStorage.getItem("cina:account-prefs") || "{}");
      delete p.avatar;
      localStorage.setItem("cina:account-prefs", JSON.stringify(p));
    } catch {}
    window.dispatchEvent(new CustomEvent("cina:avatar", { detail: "" }));
    toast({ title: "AVATAR REMOVED", text: "Back to your initials.", kind: "info" });
  };
  const initials = (handle || SESSION.handle || "y").replace(/[^a-z0-9]/gi, "").slice(0, 2).toLowerCase() || "y";
  return (
    <>
      <SettingCard title="Public profile" sub="What other watchers see when you comment, follow, or co-host a party.">
        <Field label="Avatar" hint="JPG, PNG or GIF. Square works best.">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
              background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--c-amber)", fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500, fontSize: "var(--fs-lead)",
            }}>{avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : initials}</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: "none" }}/>
            <button className="btn" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={() => fileRef.current && fileRef.current.click()}>{avatar ? "Replace" : "Upload image"}</button>
            {avatar && <button className="btn" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={removeAvatar}>Remove</button>}
          </div>
        </Field>
        <Field label="Handle" hint="Lowercase, dot, dash, underscore. Public.">
          <TextInput value={handle} onChange={setHandle}/>
        </Field>
        <Field label="Bio">
          <TextInput value={bio} onChange={setBio} w={420}/>
        </Field>
        <Field label="Email" hint="Used for sign-in and drop reminders.">
          <TextInput value={email} onChange={setEmail} type="email"/>
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={() => window.toast && toast({ title: "CANCELLED", text: "Nothing was changed.", kind: "info" })} className="btn" style={{ height: 32, fontSize: "var(--fs-body)" }}>Cancel</button>
          <button className="btn btn-primary" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={() => {
            if (window.cinaSync) window.cinaSync({ handle: handle.trim(), email: email.trim() });
            try {
              const p = JSON.parse(localStorage.getItem("cina:account-prefs") || "{}");
              localStorage.setItem("cina:account-prefs", JSON.stringify({ ...p, bio }));
            } catch {}
            toast({ title: "SAVED", text: "Profile synced across all surfaces", kind: "good" });
          }}>Save profile</button>
        </div>
      </SettingCard>
    </>
  );
}

function PlaybackSection() {
  const [autoplay, setAutoplay] = usX(true);
  const [autoSubs, setAutoSubs] = usX(true);
  const [hdr, setHdr] = usX(true);
  const [reduced, setReduced] = usX(false);
  const [quality, setQuality] = usX("auto");
  const [language, setLanguage] = usX("en");
  return (
    <>
      <SettingCard title="Playback" sub="How videos auto-play and how good they look on your connection.">
        <Field label="Autoplay next" hint="Roll into the next episode automatically.">
          <Toggle on={autoplay} onChange={setAutoplay}/>
        </Field>
        <Field label="Show subtitles by default">
          <Toggle on={autoSubs} onChange={setAutoSubs}/>
        </Field>
        <Field label="HDR / Dolby Vision">
          <Toggle on={hdr} onChange={setHdr}/>
        </Field>
        <Field label="Reduced motion" hint="Damp scrolling auto-play and animated billboards.">
          <Toggle on={reduced} onChange={setReduced}/>
        </Field>
        <Field label="Streaming quality">
          <select value={quality} onChange={(e) => setQuality(e.target.value)} style={{ height: 32, padding: "0 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}>
            <option value="auto">Auto (recommended)</option>
            <option value="4k">4K · uses more data</option>
            <option value="hd">HD · 1080p</option>
            <option value="sd">SD · save data</option>
          </select>
        </Field>
        <Field label="Audio language">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ height: 32, padding: "0 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="ja">日本語</option>
          </select>
        </Field>
      </SettingCard>
      <SettingCard title="Devices" sub="Where you're signed in. Sign out remotely if you don't recognize one.">
        <DeviceRow icon="play" name="MacBook Pro · Safari" loc="San Francisco · Now" current/>
        <DeviceRow icon="play" name="Apple TV · Living room" loc="Last active 2h ago"/>
        <DeviceRow icon="play" name="iPhone · Safari" loc="Last active yesterday"/>
      </SettingCard>
    </>
  );
}
function DeviceRow({ icon, name, loc, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--c-line)" }}>
      <div style={{ width: 32, height: 32, borderRadius: "var(--r-2)", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-ink-3)" }}>
        <Icon name={icon} size={14}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{name} {current && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", marginLeft: 6, letterSpacing: ".16em" }}>● THIS DEVICE</span>}</div>
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>{loc}</div>
      </div>
      <button className="btn" style={{ height: 28, fontSize: "var(--fs-label)" }} disabled={current}>{current ? "—" : "Sign out"}</button>
    </div>
  );
}

function BillingSection() {
  const [premium, setPrem] = usePremium();
  const [card, setCard] = usX(() => {
    try { return JSON.parse(localStorage.getItem("cina:card")) || { brand: "VISA", last4: "4242", exp: "09/28" }; }
    catch { return { brand: "VISA", last4: "4242", exp: "09/28" }; }
  });
  const [editingCard, setEditingCard] = usX(false);
  const [cardNum, setCardNum] = usX("");
  const [cardExp, setCardExp] = usX("");
  const brandOf = (num) => {
    const n = num.replace(/\D/g, "");
    if (/^4/.test(n)) return "VISA";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "MC";
    if (/^3[47]/.test(n)) return "AMEX";
    if (/^6/.test(n)) return "DISC";
    return "CARD";
  };
  const startEditCard = () => { setCardNum(""); setCardExp(card.exp || ""); setEditingCard(true); };
  const saveCard = () => {
    const clean = cardNum.replace(/\D/g, "");
    if (clean.length < 4) { toast({ title: "CHECK CARD", text: "Enter a full card number.", kind: "warn" }); return; }
    const next = { brand: brandOf(cardNum), last4: clean.slice(-4), exp: (cardExp || "").trim() || card.exp };
    setCard(next);
    try { localStorage.setItem("cina:card", JSON.stringify(next)); } catch {}
    setEditingCard(false);
    toast({ title: "CARD UPDATED", text: "•••• " + next.last4 + " is now your default.", kind: "good" });
  };
  const upgrade = () => {
    if (premium) {
      setPrem(false);
      toast({ title: "DOWNGRADED", text: "Back on the free plan — Premium runs until your next bill date.", kind: "info" });
      return;
    }
    if (window.openPay) {
      window.openPay({
        kind: "sub", title: "Cina Premium", subtitle: "Ad-free membership",
        accent: tkc("amber"), priceUSD: 8.99, recurring: "month",
        perks: ["No ads on Cina Originals", "4K HDR streaming", "Offline downloads on mobile", "Early access to producer drops"],
        onConfirm: () => { setPrem(true); },
      });
    } else {
      setPrem(true);
      toast({ title: "UPGRADED", text: "Cina Premium · $8.99/mo", kind: "good" });
    }
  };
  return (
    <>
      <SettingCard title="Cina plan" sub="Free with ads or premium ad-free. Subscriptions to creators are billed separately.">
        <div style={{
          padding: 18, border: `1px solid ${premium ? "rgba(var(--accent-rgb),.4)" : "var(--c-line)"}`,
          background: premium ? "linear-gradient(180deg, rgba(var(--accent-rgb),.05) 0%, transparent 70%)" : "var(--c-panel-2)",
          borderRadius: "var(--r-2)", marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)" }}>{premium ? "Cina Premium" : "Cina Free"}</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)", letterSpacing: ".16em" }}>{premium ? "$8.99 / MONTH · NEXT BILL JUN 1" : "FREE · WITH ADS"}</span>
          </div>
          <ul style={{ margin: "10px 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {(premium ? ["No ads on Cina Originals","4K HDR streaming","Offline downloads on mobile","Early access to producer drops"] : ["Browse the entire library","Watch with 4 ad breaks per film","Standard 1080p streaming","Upgrade anytime"]).map((p, i) => (
              <li key={i} style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)" }}>▸ {p}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={upgrade}
            >{premium ? "Switch to Free" : "Upgrade to Premium"}</button>
          </div>
        </div>
      </SettingCard>
      <SettingCard title="Creator subscriptions" sub="Recurring monthly subs to filmmakers you've backed.">
        {(SESSION.followed || []).slice(0, 3).map(id => {
          const c = CREATORS.find(x => x.id === id); if (!c) return null;
          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--c-line)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.color, color: tkc("white"), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 500, fontSize: "var(--fs-body)" }}>
                {c.name.split(" ").map(p=>p[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>{c.name}</div>
                <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>${c.sub}/mo · renews monthly</div>
              </div>
              <button className="btn" style={{ height: 28, fontSize: "var(--fs-label)" }} onClick={() => toggleFollow(c.id)}>Cancel</button>
            </div>
          );
        })}
        {(!SESSION.followed || !SESSION.followed.length) && (
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", padding: "12px 0" }}>No active subscriptions. Follow a creator to subscribe.</div>
        )}
      </SettingCard>
      <SettingCard title="Payment method">
        <Field label="Card on file" hint="Used for premium and creator subs.">
          {!editingCard ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--fs-body)", color: "var(--c-ink)" }}>
              <span style={{ padding: "3px 8px", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-1)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)" }}>{card.brand}</span>
              <span>•••• •••• •••• {card.last4}</span>
              <span className="t-mono" style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-label)" }}>EXP {card.exp}</span>
              <button className="btn" style={{ height: 26, fontSize: "var(--fs-label)", marginLeft: "auto" }} onClick={startEditCard}>Update</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input value={cardNum} onChange={(e) => setCardNum(e.target.value.replace(/[^\d ]/g, "").slice(0, 19))} placeholder="Card number" inputMode="numeric" autoFocus
                  style={{ width: 220, height: 32, padding: "0 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)" }}/>
                <input value={cardExp} onChange={(e) => setCardExp(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))} placeholder="MM/YY" inputMode="numeric"
                  style={{ width: 90, height: 32, padding: "0 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)", fontFamily: "var(--f-mono)" }}/>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={saveCard}>Save card</button>
                <button className="btn" style={{ height: 30, fontSize: "var(--fs-body)" }} onClick={() => setEditingCard(false)}>Cancel</button>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", alignSelf: "center" }}>Test mode · no real charge</span>
              </div>
            </div>
          )}
        </Field>
      </SettingCard>
      {/* #10 — invoice history + credit ledger (watch-pages-v2.jsx) */}
      <InvoicesCard/>
      <CreditLedgerCard/>
    </>
  );
}

function WalletSettingsSection() {
  return (
    <>
      <SettingCard title="On-chain wallet" sub="Where producer NFTs and royalties land.">
        <Field label="Connected" hint="Your primary signing wallet.">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "var(--r-2)", background: "var(--c-good)" }}/>
            <span className="t-mono" style={{ color: "var(--c-ink)" }}>{USER.address}</span>
            <button className="btn" style={{ height: 26, fontSize: "var(--fs-label)", marginLeft: 8 }} onClick={async () => { const ok = await (window.cinaConfirm ? window.cinaConfirm({ title: "Disconnect this wallet?", body: "Cina stops reading its balance and holdings. The wallet and everything in it stay yours — nothing is transferred or burned.", confirmLabel: "Disconnect", danger: true }) : Promise.resolve(false)); if (ok && window.toast) toast({ title: "WALLET DISCONNECTED", text: "Reconnect any time from Wallet.", kind: "info" }); }}>Disconnect </button>
          </div>
        </Field>
        <Field label="Default chain">
          <select defaultValue="base" style={{ height: 32, padding: "0 10px", background: "var(--c-panel-2)", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)", color: "var(--c-ink)", fontSize: "var(--fs-body)" }}>
            <option value="base">Base</option>
            <option value="op">Optimism</option>
            <option value="eth">Ethereum mainnet</option>
          </select>
        </Field>
        <Field label="Auto-claim royalties" hint="Sweep payouts to your wallet on the 1st.">
          <Toggle on={true} onChange={() => {}}/>
        </Field>
        <Field label="Tax export">
          <button className="btn" style={{ height: 30, fontSize: "var(--fs-body)" }}>Download 1099-DIV (CSV)</button>
        </Field>
      </SettingCard>
    </>
  );
}

function AlertsSection() {
  const [drops, setDrops] = usX(true);
  const [royalty, setRoyalty] = usX(true);
  const [premiere, setPremiere] = usX(true);
  const [followAlerts, setFA] = usX(true);
  const [comments, setCom] = usX(false);
  const [emailDigest, setED] = usX(true);
  return (
    <SettingCard title="Notifications" sub="What pings the bell, and what hits your inbox.">
      <Field label="New drops from followed creators"><Toggle on={drops} onChange={setDrops}/></Field>
      <Field label="Royalty payouts"><Toggle on={royalty} onChange={setRoyalty}/></Field>
      <Field label="Premiere reminders"><Toggle on={premiere} onChange={setPremiere}/></Field>
      <Field label="New followers"><Toggle on={followAlerts} onChange={setFA}/></Field>
      <Field label="Replies to my comments"><Toggle on={comments} onChange={setCom}/></Field>
      <Field label="Weekly email digest" hint="Friday recap of what's coming."><Toggle on={emailDigest} onChange={setED}/></Field>
    </SettingCard>
  );
}

function PrivacySection() {
  return (
    <>
      <SettingCard title="Privacy" sub="What's visible on your profile and to other watchers.">
        <Field label="Show watch history on profile"><Toggle on={false} onChange={() => {}}/></Field>
        <Field label="Show ratings publicly"><Toggle on={true} onChange={() => {}}/></Field>
        <Field label="Show holdings on profile"><Toggle on={true} onChange={() => {}}/></Field>
        <Field label="Allow tagging in watch parties"><Toggle on={true} onChange={() => {}}/></Field>
      </SettingCard>
      <SettingCard title="Data" sub="Your data is yours.">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={() => window.cinaExportData && window.cinaExportData()}>Download my data</button>
          <button className="btn" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={() => window.cinaClearHistory && window.cinaClearHistory()}>Clear watch history</button>
        </div>
      </SettingCard>
    </>
  );
}

function DangerSection() {
  return (
    <>
      <SettingCard title="Sign out" sub="On this device only. Your watchlist and ratings stay synced.">
        <button className="btn" style={{ height: 32, fontSize: "var(--fs-body)" }} onClick={() => { signOut(); navigate("/"); }}>Sign out</button>
      </SettingCard>
      <SettingCard title="Delete account" sub="Removes your profile, watchlist, ratings, and comments. Wallets stay yours.">
        <button className="btn" style={{ height: 32, fontSize: "var(--fs-body)", borderColor: "rgba(195,69,57,.4)", color: "var(--c-blood-l)" }} onClick={() => window.cinaDeleteAccount && window.cinaDeleteAccount()}>Permanently delete</button>
      </SettingCard>
    </>
  );
}

// ─── Reviews + ratings widget (used by WatchPage) ────────────────────────
// Combines the seeded REVIEWS with the user's session comments. Top: rate
// the film, then a comment composer, then list (newest first).
function ReviewsAndRatings({ film, hideHeader = false }) {
  useSession();
  const [body, setBody] = usX("");
  const [filter, setFilter] = usX("all"); // all | holders | mine
  const [showAll, setShowAll] = usX(false);

  const sessionComments = (getComments(film.id) || []).map(c => ({
    id: c.id, user: c.author, when: _ago_watchExtras(c.when), rating: SESSION.ratings[film.id] || 5,
    text: c.body, holder: false, likes: c.likes, mine: c.mine, _ts: c.when,
  }));

  const seeded = (window.REVIEWS_FOR_LL && film.id === "ll") ? window.REVIEWS_FOR_LL.map((r, i) => ({
    id: "seed-" + i, user: r.user, when: r.when, rating: r.rating || 5, text: r.text,
    holder: !!r.holder, likes: 30 + Math.floor((r.rating || 5) * 7), mine: false, _ts: 0,
  })) : [];

  let all = [...sessionComments, ...seeded];
  if (filter === "holders") all = all.filter(r => r.holder);
  if (filter === "mine")    all = all.filter(r => r.mine);

  const visible = showAll ? all : all.slice(0, 4);
  const myRating = getRating(film.id);

  const handlePost = () => {
    if (!body.trim()) return;
    if (!SESSION.signedIn) { openSignIn(); return; }
    postComment(film.id, body);
    setBody("");
    toast({ title: "POSTED", text: "Your review is live", kind: "good" });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 14px", marginBottom: 16 }}>
        {!hideHeader && (
          <h3 className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", margin: 0, letterSpacing: "-0.01em", fontWeight: 400 }}>Reviews</h3>
        )}
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-amber)", fontWeight: 600 }}>★ {film.rating}</span>
        <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)" }}>· {fmtCount(film.ratings)} ratings · {all.length} {all.length === 1 ? "review" : "reviews"}</span>
        <span style={{ flex: 1 }}/>
        <div role="tablist" aria-label="Filter reviews" style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--c-line)", fontSize: "var(--fs-label)", fontFamily: "var(--f-mono)", letterSpacing: ".12em" }}>
          {[
            { id: "all",     label: "ALL" },
            { id: "holders", label: "HOLDERS" },
            { id: "mine",    label: "MINE" },
          ].map(t => (
            <button key={t.id} role="tab" aria-selected={filter === t.id} onClick={() => setFilter(t.id)} style={{
              appearance: "none", border: "none",
              borderBottom: filter === t.id ? "2px solid var(--c-amber)" : "2px solid transparent",
              padding: "6px 12px",
              background: "transparent",
              color: filter === t.id ? "var(--c-ink)" : "var(--c-ink-3)",
              borderRadius: 0, cursor: "pointer", fontSize: "var(--fs-label)", fontWeight: filter === t.id ? 600 : 500,
              transition: "color .15s, border-color .15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Rate widget + composer */}
      <div style={{
        padding: "16px 18px", marginBottom: 20,
        background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "2px",
      }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <span className="t-mono" style={{ fontSize: "0.68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>Your Rating</span>
          <StarRater value={myRating} onChange={(n) => setRating(film.id, n)}/>
          {myRating > 0 && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".14em" }}>SAVED · {myRating}/5</span>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={SESSION.signedIn ? "Write a note on the cinematography, pacing, or performance…" : "Sign in to rate and publish a review…"}
            rows={2}
            onFocus={() => { if (!SESSION.signedIn) openSignIn(); }}
            style={{
              flex: "1 1 260px", resize: "vertical",
              minHeight: 54, padding: "10px 12px",
              background: "var(--c-bg)", border: "1px solid var(--c-line-2)", borderRadius: "2px",
              color: "var(--c-ink)", fontSize: "var(--fs-body)", lineHeight: 1.5,
              fontFamily: "var(--f-sans)", outline: "none",
            }}
          />
          <button className="pm-btn pm-btn--primary pm-btn--sm" style={{ height: 38, padding: "0 18px" }} onClick={handlePost}>
            Post Review
          </button>
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-3)", padding: "8px 0" }}>
          {filter === "all" ? "Be the first viewer to leave a note in the screening ledger." : "No reviews match this filter yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {visible.map(r => (
            <div key={r.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", fontWeight: 500 }}>{r.user}</span>
                {r.holder && (
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", padding: "1px 5px", border: "1px solid rgba(var(--accent-rgb),.3)", borderRadius: "var(--r-1)" }}>HOLDER</span>
                )}
                {r.mine && (
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".16em", padding: "1px 5px", border: "1px solid rgba(91,169,109,.3)", borderRadius: "var(--r-1)" }}>YOU</span>
                )}
                <span style={{ color: "var(--c-amber)", fontSize: "var(--fs-body)" }}>{"★".repeat(r.rating)}</span>
                <span style={{ flex: 1 }}/>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{r.when}</span>
              </div>
              <p style={{ fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--c-ink-2)", margin: 0 }}>{r.text}</p>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }}>
                <button onClick={() => r.id.startsWith("u") ? likeComment(film.id, r.id) : null} className="btn-ghost" style={{ height: 22, padding: "0 6px", fontSize: "var(--fs-label)", color: r._liked ? "var(--c-amber)" : "var(--c-ink-3)" }}>
                  ♥ {r.likes}
                </button>
                <button className="btn-ghost" style={{ height: 22, padding: "0 6px", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }} onClick={() => window.cinaNotYet && window.cinaNotYet("Replies", "Threaded replies need the live comment service.")}>Reply </button>
                {r.mine && <button className="btn-ghost" style={{ height: 22, padding: "0 6px", fontSize: "var(--fs-label)", color: "var(--c-ink-3)" }} onClick={() => window.cinaNotYet && window.cinaNotYet("Editing a posted comment", "Comment editing needs the live comment service.")}>Edit </button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {all.length > 4 && (
        <button className="btn-ghost" style={{ height: 32, marginTop: 18, fontSize: "var(--fs-body)" }} onClick={() => setShowAll(s => !s)}>
          {showAll ? "Show less" : `Show all ${all.length} reviews →`}
        </button>
      )}
    </div>
  );
}

function StarRater({ value = 0, onChange }) {
  const [hover, setHover] = usX(0);
  const display = hover || value;
  return (
    <div style={{ display: "flex", gap: 2 }} onMouseLeave={() => setHover(0)}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onMouseEnter={() => setHover(n)} onClick={() => onChange?.(n)} style={{
          appearance: "none", border: "none", background: "transparent", padding: 2,
          color: n <= display ? "var(--c-amber)" : "var(--c-line-2)",
          fontSize: "var(--fs-lead)", lineHeight: 1, cursor: "pointer",
          transition: "color .12s ease, transform .1s ease",
          transform: hover === n ? "scale(1.15)" : "scale(1)",
        }}>★</button>
      ))}
    </div>
  );
}

Object.assign(window, { WatchlistPage, AccountPage, ReviewsAndRatings });
