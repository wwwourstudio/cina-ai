// watch-shop-moment.jsx — ShopThisLook inside the public Watch player.
//
// Redesigned: no headshots, no hotspot dots. Shopping is a storefront sheet
// that slides over the paused frame — product-image cards, one-tap buy at the
// real retailer. Nothing shoppable renders ANYWHERE until the viewer connects
// a shopping platform (Shopify / Amazon / Cina Affiliate); the connection is
// persisted and shared with the Cina AI companion's SHOP tab.
// Every buy books the sale + director cut into the SAME commerce ledger the
// studio wardrobe reads ("cina:commerce:ledger"). Loaded BEFORE watch-watch.jsx.
//
// Exposes: window.useShopMoment, window.ShopMomentOverlay, window.CinaShopLook
(function () {
  const { useState: usSM, useEffect: ueSM, useMemo: umSM } = React;

  // ── Provider / affiliate config (mirrors the studio wardrobe) ────────────
  const SM_COMMERCE = { provider: "cina-affiliate", commissionRate: 0.12, currency: "USD" };

  // The scene's look — real items, real retailer deep-links.
  const SM_LOOK = [
    { id: "sm_schott", slot: "jacket", brand: "Schott NYC", name: "Perfecto 618 Leather Jacket", price: 890, retailer: "Schott NYC", url: "https://www.schottnyc.com/products/motorcycle-jackets/618.htm" },
    { id: "sm_levis",  slot: "denim",  brand: "Levi's",     name: "501 Original Fit Jeans",    price: 98,  retailer: "Levi's",     url: "https://www.levi.com/US/en_US/apparel/clothing/bottoms/501-original-fit-mens-jeans/p/005010000" },
    { id: "sm_rayban", slot: "eyewear", brand: "Ray-Ban",   name: "Original Wayfarer",         price: 163, retailer: "Ray-Ban",    url: "https://www.ray-ban.com/usa/sunglasses/RB2140%20UNISEX%20original%20wayfarer%20classic-black/805289126577" },
    { id: "sm_af1",    slot: "shoes",  brand: "Nike",       name: "Air Force 1 '07",           price: 115, retailer: "Nike",       url: "https://www.nike.com/t/air-force-1-07-mens-shoes-jBrhbr" },
  ];
  function smBuyUrl(item) {
    const u = new URL(item.url);
    u.searchParams.set("utm_source", "cina");
    u.searchParams.set("utm_medium", "shoppable_player");
    u.searchParams.set("utm_campaign", SM_COMMERCE.provider);
    return u.toString();
  }

  // ── Shopping platform connection — products only exist once connected ────
  const SM_PLATFORM_KEY = "cina:commerce:platform";
  const SM_PLATFORMS = [
    { id: "shopify",   label: "Shopify",           sub: "Storefront API · live inventory" },
    { id: "amazon",    label: "Amazon Storefront",  sub: "Affiliate links · one-tap buy" },
    { id: "affiliate", label: "Cina Affiliate",     sub: "Direct retailer deep-links" },
  ];
  function smPlatform() { try { return JSON.parse(localStorage.getItem(SM_PLATFORM_KEY)); } catch (e) { return null; } }
  function smConnect(id) {
    try { localStorage.setItem(SM_PLATFORM_KEY, JSON.stringify({ provider: id, ts: Date.now() })); } catch (e) {}
    window.dispatchEvent(new CustomEvent("cina:platform"));
  }
  function smDisconnect() {
    try { localStorage.removeItem(SM_PLATFORM_KEY); } catch (e) {}
    window.dispatchEvent(new CustomEvent("cina:platform"));
  }
  function usePlatform() {
    const [plat, setPlat] = usSM(smPlatform);
    ueSM(() => {
      const on = () => setPlat(smPlatform());
      window.addEventListener("storage", on);
      window.addEventListener("cina:platform", on);
      return () => { window.removeEventListener("storage", on); window.removeEventListener("cina:platform", on); };
    }, []);
    return plat;
  }

  // ── Product visuals — material tiles per garment ─────────────────────────
  const SM_MATERIALS = {
    jacket: `linear-gradient(160deg, rgba(255,255,255,.09), transparent 45%), radial-gradient(130% 100% at 28% 18%, ${tkc("line-2")} 0%, ${tkc("panel")} 52%, ${tkc("bg")} 100%)`,
    denim:  `linear-gradient(160deg, rgba(255,255,255,.08), transparent 45%), repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px 4px), radial-gradient(140% 110% at 30% 15%, ${tkc("cat-6")} 0%, ${tkc("line")} 55%, ${tkc("panel-2")} 100%)`,
    eyewear:`linear-gradient(160deg, rgba(255,255,255,.1), transparent 45%), radial-gradient(120% 100% at 30% 20%, ${tkc("line-2")} 0%, ${tkc("panel")} 60%, ${tkc("bg")} 100%)`,
    shoes:  `linear-gradient(160deg, rgba(255,255,255,.16), transparent 45%), radial-gradient(130% 110% at 30% 15%, ${tkc("ink")} 0%, ${tkc("ink-3")} 60%, ${tkc("ink-4")} 100%)`,
  };
  const SM_GLYPHS = {
    jacket:  "M12 3 L8 5 L5 8 L5 20 L9 20 L9 10 M12 3 L16 5 L19 8 L19 20 L15 20 L15 10 M9 20 L15 20 M12 3 L11 7 L12 10 L13 7 Z",
    denim:   "M8 3 L16 3 L17 21 L13.5 21 L12 10 L10.5 21 L7 21 Z M8 6 L16 6",
    eyewear: "M2 10 L22 10 M4 10 A4 4 0 1 0 12 10 A4 4 0 1 0 4 10 M12 10 A4 4 0 1 0 20 10 A4 4 0 1 0 12 10",
    shoes:   "M3 16 C3 13 5 12 7 11 L9 8 L11 10 C14 12 18 12 21 14 L21 17 L3 17 Z M3 17 L21 17",
  };
  function SMProductVisual({ item, size = 64, radius = 10 }) {
    const dark = item.slot !== "shoes";
    return (
      <span style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: SM_MATERIALS[item.slot] || SM_MATERIALS.jacket,
        border: "1px solid rgba(255,255,255,.09)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none"
          stroke={dark ? "rgba(255,255,255,.75)" : "rgba(24,22,18,.72)"} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
          <path d={SM_GLYPHS[item.slot] || SM_GLYPHS.jacket}/>
        </svg>
      </span>
    );
  }

  // ── Connect gate — shown wherever shopping would be, until linked ────────
  function SMConnectGate({ compact }) {
    const [busy, setBusy] = usSM(null);
    const connect = (id) => { setBusy(id); setTimeout(() => { smConnect(id); setBusy(null); }, 900); };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ padding: compact ? "4px 2px 6px" : "8px 2px 10px" }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>✦ SHOPPING IS OFF</div>
          <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: compact ? 16 : 19, color: tkc("white"), marginTop: 5, lineHeight: 1.25 }}>Connect a platform to shop the film.</div>
          <div style={{ fontSize: "var(--fs-body)", color: "rgba(255,255,255,.55)", lineHeight: 1.55, marginTop: 4 }}>Wardrobe pieces become buyable the moment a platform is linked. {Math.round(SM_COMMERCE.commissionRate * 100)}% of every sale supports the director.</div>
        </div>
        {SM_PLATFORMS.map(p => (
          <button key={p.id} onClick={() => connect(p.id)} disabled={!!busy} style={{
            display: "flex", alignItems: "center", gap: 11, textAlign: "left", padding: "11px 13px",
            borderRadius: "var(--r-2)", cursor: busy ? "wait" : "pointer",
            background: busy === p.id ? "rgba(var(--accent-rgb),.08)" : "rgba(255,255,255,.03)",
            border: `1px solid ${busy === p.id ? "var(--c-amber)" : "rgba(255,255,255,.12)"}`,
            color: "inherit",
          }}>
            <span className="t-mono" style={{
              width: 30, height: 30, borderRadius: "var(--r-2)", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
              color: tkc("white"), fontSize: "var(--fs-body)", fontWeight: 700,
            }}>{p.label[0]}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "var(--fs-body)", color: tkc("white") }}>{p.label}</span>
              <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "rgba(255,255,255,.45)", marginTop: 2 }}>{p.sub.toUpperCase()}</span>
            </span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: busy === p.id ? "var(--c-amber)" : "rgba(255,255,255,.55)", flexShrink: 0 }}>
              {busy === p.id ? "CONNECTING…" : "CONNECT →"}
            </span>
          </button>
        ))}
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.35)", padding: "2px 2px" }}>DEMO — CONNECTS INSTANTLY. LIVE ADAPTER STUB WIRED FOR SHOPIFY STOREFRONT API.</div>
      </div>
    );
  }

  // ── Product card — image tile, brand once, buy at retailer ───────────────
  function SMProductCard({ item, onBuy }) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: "var(--r-3)",
        background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)",
      }}>
        <SMProductVisual item={item} size={56}/>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.45)" }}>{item.brand.toUpperCase()}</span>
          <span style={{ display: "block", fontSize: "var(--fs-body)", color: tkc("white"), margin: "3px 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
          <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "rgba(255,255,255,.85)" }}>${item.price}</span>
        </span>
        <button onClick={() => onBuy(item)} className="t-mono" title={"Buy at " + item.retailer} style={{
          height: 32, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0,
          background: "var(--c-amber)", color: tkc("on-amber"), fontSize: "var(--fs-label)", letterSpacing: ".08em", fontWeight: 700,
        }}>BUY ↗</button>
      </div>
    );
  }

  // ── Hook — owns open state; pauses playback while shopping ───────────────
  function useShopMoment({ film, t, setPlaying }) {
    const [open, setOpenRaw] = usSM(false);
    const plat = usePlatform();
    const available = t > 12 && !!plat; // scene established + platform connected
    const setOpen = (v) => { setOpenRaw(v); setPlaying(!v); };
    return { open, setOpen, available, film };
  }

  // ── The overlay: storefront sheet over the paused frame ─────────────────
  function ShopMomentOverlay({ sm }) {
    const film = sm.film;
    const plat = usePlatform();
    const [tick, setTick] = usSM(0);
    const earnings = umSM(() => smFilmEarnings(film.id), [film.id, tick]);
    const totalLook = SM_LOOK.reduce((a, i) => a + i.price, 0);
    const platLabel = plat && (SM_PLATFORMS.find(p => p.id === plat.provider) || {}).label;

    function buy(item) {
      try { window.open(smBuyUrl(item), "_blank", "noopener,noreferrer"); } catch (e) {}
      smRecordSale(item, film.id);
      setTick(x => x + 1);
      if (window.toast) window.toast({ title: "SALE RECORDED · " + item.brand.toUpperCase(), text: `${item.name} · ${Math.round(SM_COMMERCE.commissionRate * 100)}% supports the director`, kind: "good" });
    }

    return (
      <div onClick={() => sm.setOpen(false)} style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", justifyContent: "flex-end", background: "rgba(4,4,7,.55)", backdropFilter: "blur(2px)" }}>
        <div onClick={e => e.stopPropagation()} className="sc-scroll" style={{
          width: "min(400px, 92%)", height: "100%", overflowY: "auto",
          background: "rgba(10,10,14,.97)", borderLeft: "1px solid rgba(255,255,255,.12)",
          padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 12,
          boxShadow: "-30px 0 80px rgba(0,0,0,.6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", fontWeight: 700 }}>✦ SHOP THE SCENE</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: tkc("white"), marginTop: 3 }}>{film.title}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.4)", marginTop: 3 }}>PAUSED · AS WORN IN THIS SCENE</div>
            </div>
            <button onClick={() => sm.setOpen(false)} className="t-mono" style={{ width: 30, height: 30, borderRadius: "var(--r-2)", background: "transparent", border: "1px solid rgba(255,255,255,.25)", color: tkc("white"), cursor: "pointer", fontSize: "var(--fs-body)" }}>×</button>
          </div>

          {!plat ? <SMConnectGate/> : (
            <>
              <div className="t-mono" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-good)" }}></span>
                SHOPPING VIA {String(platLabel).toUpperCase()}
                <span style={{ flex: 1 }}></span>
                <button onClick={smDisconnect} className="t-mono" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontSize: "var(--fs-label)", letterSpacing: ".16em", cursor: "pointer" }}>DISCONNECT</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SM_LOOK.map(item => <SMProductCard key={item.id} item={item} onBuy={buy}/>)}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.45)" }}>FULL LOOK ${totalLook.toLocaleString()}</span>
                <span style={{ flex: 1 }}></span>
                {earnings.sales > 0 && (
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>
                    ${earnings.earned} TO THE DIRECTOR · {earnings.sales} SALE{earnings.sales === 1 ? "" : "S"}
                  </span>
                )}
              </div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.35)" }}>{Math.round(SM_COMMERCE.commissionRate * 100)}% OF EVERY SALE SUPPORTS THE DIRECTOR</div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Shared commerce ledger — same key + record shape as the studio ──────
  const SM_LEDGER_KEY = "cina:commerce:ledger";
  function smLedgerRead() {
    try { const l = JSON.parse(localStorage.getItem(SM_LEDGER_KEY)); return Array.isArray(l) ? l : []; } catch (e) { return []; }
  }
  function smRecordSale(item, filmId) {
    const cut = Math.round(item.price * SM_COMMERCE.commissionRate);
    const rec = {
      id: "sale_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      ts: Date.now(),
      itemId: item.id, brand: item.brand, name: item.name, slot: item.slot,
      retailer: item.retailer, price: item.price, cut, rate: SM_COMMERCE.commissionRate,
      character: null, filmId: filmId || null, buyer: "viewer",
    };
    try { localStorage.setItem(SM_LEDGER_KEY, JSON.stringify([rec, ...smLedgerRead()].slice(0, 200))); } catch (e) {}
    return rec;
  }
  function smFilmEarnings(filmId) {
    const rows = smLedgerRead().filter(r => r.filmId === filmId);
    return { sales: rows.length, earned: rows.reduce((a, r) => a + (r.cut || 0), 0) };
  }

  Object.assign(window, { useShopMoment, ShopMomentOverlay, // Shared with the Cina AI companion's SHOP tab
    CinaShopLook: {
      LOOK: SM_LOOK, buyUrl: smBuyUrl, record: smRecordSale, earnings: smFilmEarnings, rate: SM_COMMERCE.commissionRate, platform: smPlatform, connect: smConnect, disconnect: smDisconnect, usePlatform, ProductCard: SMProductCard, ConnectGate: SMConnectGate, platforms: SM_PLATFORMS } });
})();
