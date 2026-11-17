// vault-wardrobe.jsx — Shoppable designer wardrobe for the Vault.
//
// Replaces the abstract era/fit/distress panel with a real store: a curated
// catalog of actual brands (Nike, Levi's, Carhartt, Dr. Martens, Ray-Ban…)
// that you EQUIP onto a performer to build a look, and can actually BUY —
// per-item or the whole look — through the shared pay drawer. State (the
// equipped look + shopping bag) persists per character.
//
// Loaded AFTER vault-v2.jsx so it overrides window.WardrobeTab +
// window.CostumeInspector, which vault-v2 renders in the stage + right rail.

const { useState: usW, useEffect: ueW, useMemo: umW, useRef: urW } = React;

// ─── Catalog ──────────────────────────────────────────────────────────────
// slot: which body slot it occupies (one item per slot on a look)
// c: primary colorway hex · ways: selectable colorways
const WD_SLOTS = [
  { id: "headwear",  label: "Headwear" },
  { id: "eyewear",   label: "Eyewear" },
  { id: "outerwear", label: "Outerwear" },
  { id: "top",       label: "Top" },
  { id: "bottom",    label: "Bottom" },
  { id: "footwear",  label: "Footwear" },
  { id: "accessory", label: "Accessory" },
];

const WD_CATALOG = [
  // ── Footwear ──
  { id: "af1",      brand: "Nike",             name: "Air Force 1 '07",       slot: "footwear", price: 115, ways: [tkc("ink"), tkc("panel"), tkc("amber-d")] },
  { id: "am90",     brand: "Nike",             name: "Air Max 90",            slot: "footwear", price: 130, ways: [tkc("ink"), tkc("panel-2"), tkc("cat-1")] },
  { id: "dunk",     brand: "Nike",             name: "Dunk Low Retro",        slot: "footwear", price: 115, ways: [tkc("line-3"), tkc("ink"), tkc("cat-6")] },
  { id: "samba",    brand: "adidas",           name: "Samba OG",              slot: "footwear", price: 100, ways: [tkc("panel"), tkc("ink"), tkc("line-3")] },
  { id: "nb990",    brand: "New Balance",      name: "990v6",                 slot: "footwear", price: 200, ways: [tkc("ink-3"), tkc("panel"), tkc("cat-6")] },
  { id: "dm1460",   brand: "Dr. Martens",      name: "1460 8-Eye",            slot: "footwear", price: 170, ways: [tkc("on-amber"), tkc("blood"), tkc("line")] },
  { id: "chuck70",  brand: "Converse",         name: "Chuck 70 Hi",           slot: "footwear", price: 85,  ways: [tkc("panel"), tkc("ink"), tkc("blood")] },
  { id: "cproj",    brand: "Common Projects",  name: "Original Achilles",     slot: "footwear", price: 425, ways: [tkc("ink"), tkc("panel"), tkc("ink-4")] },
  // ── Bottoms ──
  { id: "levi501",  brand: "Levi's",           name: "501 Original",          slot: "bottom",   price: 98,  ways: [tkc("line-3"), tkc("panel"), tkc("cat-1")] },
  { id: "apcpns",   brand: "A.P.C.",           name: "Petit New Standard",    slot: "bottom",   price: 210, ways: [tkc("line-2"), tkc("panel-2")] },
  { id: "carhdk",   brand: "Carhartt WIP",     name: "Double Knee",           slot: "bottom",   price: 148, ways: [tkc("ink-3"), tkc("line"), tkc("line-3")] },
  { id: "acne1991", brand: "Acne Studios",     name: "1991 Toj",              slot: "bottom",   price: 300, ways: [tkc("cat-6"), tkc("panel-2")] },
  { id: "dickies",  brand: "Dickies",          name: "874 Work Pant",         slot: "bottom",   price: 40,  ways: [tkc("line"), tkc("line-3"), tkc("line-3")] },
  // ── Tops ──
  { id: "uqtee",    brand: "Uniqlo U",         name: "Crew Neck Tee",         slot: "top",      price: 20,  ways: [tkc("ink"), tkc("panel"), tkc("line-3"), tkc("blood")] },
  { id: "suntee",   brand: "Sunspel",          name: "Riviera Tee",           slot: "top",      price: 95,  ways: [tkc("ink"), tkc("panel"), tkc("cat-6")] },
  { id: "carhtee",  brand: "Carhartt WIP",     name: "Pocket Tee",            slot: "top",      price: 45,  ways: [tkc("cat-4"), tkc("line"), tkc("line-3")] },
  { id: "cosshirt", brand: "COS",              name: "Oversized Shirt",       slot: "top",      price: 89,  ways: [tkc("ink"), tkc("panel-2"), tkc("ink-4")] },
  { id: "sunspoxf", brand: "Drake's",          name: "Oxford Shirt",          slot: "top",      price: 195, ways: [tkc("ink"), tkc("ink"), tkc("bad")] },
  // ── Outerwear ──
  { id: "schott",   brand: "Schott NYC",       name: "Perfecto Leather",      slot: "outerwear", price: 890, ways: [tkc("panel"), tkc("panel-3")] },
  { id: "barbour",  brand: "Barbour",          name: "Bedale Wax",            slot: "outerwear", price: 420, ways: [tkc("line-2"), tkc("line"), tkc("line-3")] },
  { id: "carhdet",  brand: "Carhartt WIP",     name: "Detroit Jacket",        slot: "outerwear", price: 228, ways: [tkc("ink-3"), tkc("line"), tkc("line-3")] },
  { id: "tnf",      brand: "The North Face",   name: "Nuptse 700",            slot: "outerwear", price: 320, ways: [tkc("panel"), tkc("amber-d"), tkc("line-3")] },
  { id: "apcden",   brand: "A.P.C.",           name: "Denim Jacket",          slot: "outerwear", price: 285, ways: [tkc("cat-6"), tkc("panel-2")] },
  // ── Eyewear ──
  { id: "rbway",    brand: "Ray-Ban",          name: "Wayfarer",              slot: "eyewear",  price: 171, ways: [tkc("panel"), tkc("line-2"), tkc("line")] },
  { id: "opgp",     brand: "Oliver Peoples",   name: "Gregory Peck",          slot: "eyewear",  price: 430, ways: [tkc("line-2"), tkc("panel")] },
  { id: "persol",   brand: "Persol",           name: "649 Original",          slot: "eyewear",  price: 360, ways: [tkc("panel-3"), tkc("panel")] },
  // ── Headwear ──
  { id: "newera",   brand: "New Era",          name: "59Fifty Fitted",        slot: "headwear", price: 45,  ways: [tkc("panel"), tkc("line-3"), tkc("blood")] },
  { id: "carhbeanie", brand: "Carhartt WIP",   name: "Acrylic Beanie",        slot: "headwear", price: 22,  ways: [tkc("ink-3"), tkc("line"), tkc("blood"), tkc("line-3")] },
  // ── Accessory ──
  { id: "seiko5",   brand: "Seiko",            name: "5 Sports Automatic",    slot: "accessory", price: 275, ways: [tkc("line"), tkc("panel"), tkc("line-2")] },
  { id: "timex",    brand: "Timex",            name: "Marlin Hand-Wind",      slot: "accessory", price: 199, ways: [tkc("ink"), tkc("panel-2")] },
  { id: "cdgwallet", brand: "Comme des Garçons", name: "Classic Wallet",      slot: "accessory", price: 200, ways: [tkc("panel"), tkc("blood")] },
];

const WD_CATS = [
  { id: "all",       label: "All" },
  { id: "footwear",  label: "Footwear" },
  { id: "top",       label: "Tops" },
  { id: "bottom",    label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "eyewear",   label: "Eyewear" },
  { id: "headwear",  label: "Headwear" },
  { id: "accessory", label: "Accessories" },
];

const wdItem = (id) => WD_CATALOG.find(i => i.id === id);
const wdSlotLabel = (id) => (WD_SLOTS.find(s => s.id === id) || {}).label || id;

// ─── Commerce / affiliate layer ─────────────────────────────────────────────
// The creator STYLES the actor with real, for-sale products. Each piece deep-
// links to the real retailer and is tagged shoppable in the finished film —
// when a viewer buys, the director earns a commission. (The creator never buys.)
const COMMERCE = { provider: "Cina Shopping", network: "affiliate", commissionRate: 0.12, affiliate: "cina_creator", payout: "monthly" };
// Real retailer search endpoints per brand (a live catalog would come from the
// adapter below; these resolve to the actual store today).
const WD_RETAILERS = {
  "Nike": "https://www.nike.com/w?q=",
  "adidas": "https://www.adidas.com/us/search?q=",
  "New Balance": "https://www.newbalance.com/search?q=",
  "Dr. Martens": "https://www.drmartens.com/us/en/search?q=",
  "Converse": "https://www.converse.com/shop/c/search?text=",
  "Common Projects": "https://www.mrporter.com/en-us/mens/search?keywords=",
  "Levi's": "https://www.levi.com/US/en_US/search/?q=",
  "A.P.C.": "https://www.apc-us.com/search?q=",
  "Carhartt WIP": "https://www.carhartt-wip.com/en/search?q=",
  "Acne Studios": "https://www.acnestudios.com/us/en/search?q=",
  "Dickies": "https://www.dickies.com/search?q=",
  "Uniqlo U": "https://www.uniqlo.com/us/en/search?q=",
  "Sunspel": "https://www.sunspel.com/search?q=",
  "COS": "https://www.cos.com/en_usd/search.html?q=",
  "Drake's": "https://www.drakes.com/search?q=",
  "Schott NYC": "https://www.schottnyc.com/search?q=",
  "Barbour": "https://www.barbour.com/us/search?q=",
  "The North Face": "https://www.thenorthface.com/search?q=",
  "Ray-Ban": "https://www.ray-ban.com/usa/search?q=",
  "Oliver Peoples": "https://www.oliverpeoples.com/us/search?q=",
  "Persol": "https://www.persol.com/usa/search?q=",
  "New Era": "https://www.neweracap.com/search?q=",
  "Seiko": "https://www.seikowatches.com/us-en/search/?q=",
  "Timex": "https://www.timex.com/search?q=",
  "Comme des Garçons": "https://www.doverstreetmarket.com/search?q=",
};
const commerceRetailer = (brand) => ({ retailer: brand, base: WD_RETAILERS[brand] || ("https://www.google.com/search?q=" + encodeURIComponent(brand) + "+") });
function commerceBuyUrl(item) {
  const { base } = commerceRetailer(item.brand);
  const q = encodeURIComponent(item.brand + " " + item.name);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${q}${sep}utm_source=cina&aff=${COMMERCE.affiliate}`;
}
const commerceCut = (amount) => Math.round((amount || 0) * COMMERCE.commissionRate);

// ─── Sales ledger — records the director's commission on every real buy ─────
// A viewer taps a shoppable garment → buys at the real retailer → the sale and
// the director's cut are written to a persistent, shared ledger. This is the
// source of truth for the royalties readout in the wardrobe + costume rail.
const _ledgerKey = "cina:commerce:ledger";
let _ledger = null;
const _ledgerSubs = new Set();
function commerceLedgerLoad() {
  if (_ledger) return _ledger;
  try { _ledger = JSON.parse(localStorage.getItem(_ledgerKey)); } catch (e) { _ledger = null; }
  if (!Array.isArray(_ledger)) _ledger = [];
  return _ledger;
}
function commerceLedgerSave() {
  try { localStorage.setItem(_ledgerKey, JSON.stringify(_ledger)); } catch (e) {}
  _ledgerSubs.forEach(fn => fn());
}
function commerceRecordSale(item, ctx = {}) {
  const led = commerceLedgerLoad();
  const cut = commerceCut(item.price);
  const rec = {
    id: "sale_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    ts: Date.now(),
    itemId: item.id, brand: item.brand, name: item.name, slot: item.slot,
    retailer: commerceRetailer(item.brand).retailer,
    price: item.price, cut, rate: COMMERCE.commissionRate,
    character: ctx.character || null, filmId: ctx.filmId || null, buyer: ctx.buyer || "viewer",
  };
  _ledger = [rec, ...led].slice(0, 200);
  commerceLedgerSave();
  return rec;
}
function commerceLedgerTotals() {
  const led = commerceLedgerLoad();
  return { sales: led.length, gross: led.reduce((a, r) => a + r.price, 0), earned: led.reduce((a, r) => a + r.cut, 0) };
}
function commerceLedgerClear() { _ledger = []; commerceLedgerSave(); }
function useCommerceLedger() {
  const [, force] = usW(0);
  ueW(() => { const fn = () => force(n => n + 1); _ledgerSubs.add(fn); return () => _ledgerSubs.delete(fn); }, []);
  return { ledger: commerceLedgerLoad(), totals: commerceLedgerTotals() };
}
// The buy action: open the REAL retailer deep-link AND record the director's cut.
function commerceBuy(item, ctx = {}, toast) {
  try { window.open(commerceBuyUrl(item), "_blank", "noopener,noreferrer"); } catch (e) {}
  const rec = commerceRecordSale(item, ctx);
  if (toast && toast.push) toast.push({ kind: "ok", agent: "visual", title: `Sale recorded · ${item.brand}`, message: `${item.name} · you earn ${wdMoney(rec.cut)} · ${Math.round(COMMERCE.commissionRate * 100)}% director cut` });
  return rec;
}

// Live adapter (disabled in the prototype — no store key shipped). Point this at
// a Shopify Storefront GraphQL endpoint or an affiliate product feed and flip
// `enabled` to pull a real, live catalog instead of the built-in list.
const COMMERCE_LIVE = { enabled: false, endpoint: "", token: "" };

// Where each garment sits on a full-body figure (for the try-on hotspots).
const WD_BODY_POS = {
  headwear:  { top: "11%", left: "50%" },
  eyewear:   { top: "17%", left: "50%" },
  outerwear: { top: "40%", left: "31%" },
  top:       { top: "42%", left: "50%" },
  accessory: { top: "56%", left: "70%" },
  bottom:    { top: "71%", left: "50%" },
  footwear:  { top: "93%", left: "50%" },
};

// ─── Curated "Style with Cina" presets ─────────────────────────────────────
// One tap dresses the performer head-to-toe in a coherent, on-brand look.
const WD_PRESETS = [
  { id: "noir",   name: "Neo-noir",     note: "Rain, sodium, leather",  items: { outerwear: "schott",  top: "suntee",   bottom: "apcpns",   footwear: "dm1460", eyewear: "persol" }, ways: { suntee: tkc("panel") } },
  { id: "work",   name: "Workwear",     note: "Detroit, duck canvas",   items: { outerwear: "carhdet", top: "carhtee",  bottom: "carhdk",   footwear: "samba",  headwear: "carhbeanie" }, ways: { carhtee: tkc("line") } },
  { id: "street", name: "'90s Street",  note: "Nuptse, denim, AF1s",    items: { outerwear: "tnf",     top: "uqtee",    bottom: "levi501",  footwear: "af1",    headwear: "newera" }, ways: { uqtee: tkc("ink"), af1: tkc("ink") } },
  { id: "luxe",   name: "Quiet luxe",   note: "Soft tailoring, leather",items: { outerwear: "apcden",  top: "cosshirt", bottom: "acne1991", footwear: "cproj",  eyewear: "opgp", accessory: "seiko5" } },
  { id: "field",  name: "Field & rain", note: "Waxed cotton, oxford",   items: { outerwear: "barbour", top: "sunspoxf", bottom: "dickies",  footwear: "dm1460", eyewear: "rbway" } },
];

// ─── Persistent per-character store ────────────────────────────────────────
const _wdState = {};
const _wdSubs = new Set();
function _wdKey(id) { return "cina:wardrobe:" + id; }
function wdLoad(id) {
  if (_wdState[id]) return _wdState[id];
  let v;
  try { v = JSON.parse(localStorage.getItem(_wdKey(id))); } catch (e) { v = null; }
  _wdState[id] = (v && v.equipped) ? v : { equipped: {}, ways: {}, bag: [], looks: [] };
  if (!_wdState[id].ways) _wdState[id].ways = {};
  if (!_wdState[id].bag) _wdState[id].bag = [];
  if (!_wdState[id].looks) _wdState[id].looks = [];
  return _wdState[id];
}
function wdSave(id) {
  try { localStorage.setItem(_wdKey(id), JSON.stringify(_wdState[id])); } catch (e) {}
  _wdSubs.forEach(fn => fn());
}
function wdEquip(id, item) {
  const s = wdLoad(id);
  if (s.equipped[item.slot] === item.id) delete s.equipped[item.slot];
  else s.equipped[item.slot] = item.id;
  wdSave(id);
}
function wdUnequip(id, slot) { const s = wdLoad(id); delete s.equipped[slot]; wdSave(id); }
function wdSetWay(id, itemId, way) { const s = wdLoad(id); s.ways[itemId] = way; wdSave(id); }
function wdClearLook(id) { const s = wdLoad(id); s.equipped = {}; wdSave(id); }
// Apply a curated preset: equip its items (+ their colorways) as the whole look.
function wdApplyPreset(id, preset) {
  const s = wdLoad(id);
  s.equipped = { ...preset.items };
  s.ways = { ...s.ways, ...(preset.ways || {}) };
  wdSave(id);
}
// Saved looks — name + snapshot of the current equipped set (for scene continuity).
function wdSaveLook(id, name) {
  const s = wdLoad(id);
  const equipped = { ...s.equipped };
  if (!Object.keys(equipped).length) return;
  const ways = {}; Object.values(equipped).forEach(iid => { if (s.ways[iid]) ways[iid] = s.ways[iid]; });
  s.looks = [{ id: "lk" + Date.now().toString(36), name: name || `Look ${s.looks.length + 1}`, equipped, ways }, ...s.looks].slice(0, 12);
  wdSave(id);
}
function wdLoadLook(id, lookId) {
  const s = wdLoad(id); const lk = s.looks.find(l => l.id === lookId); if (!lk) return;
  s.equipped = { ...lk.equipped }; s.ways = { ...s.ways, ...(lk.ways || {}) }; wdSave(id);
}
function wdDeleteLook(id, lookId) { const s = wdLoad(id); s.looks = s.looks.filter(l => l.id !== lookId); wdSave(id); }
function useWardrobe(charId) {
  const [, force] = usW(0);
  ueW(() => { const fn = () => force(n => n + 1); _wdSubs.add(fn); return () => _wdSubs.delete(fn); }, []);
  return wdLoad(charId);
}

// ─── Garment glyphs (line art per slot) ─────────────────────────────────────
function WdGlyph({ slot, size = 44, color = "rgba(255,255,255,.85)" }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinejoin: "round", strokeLinecap: "round" };
  const paths = {
    footwear:  <path d="M4 30 L4 21 C4 20 5 20 6 20 L11 20 L16 24 L27 24 C29 24 30 26 30 28 L30 30 Z M11 20 L11 24" {...common}/>,
    top:       <path d="M13 8 L9 11 L6 14 L9 18 L11 16 L11 30 L25 30 L25 16 L27 18 L30 14 L27 11 L23 8 C21 11 15 11 13 8 Z" {...common}/>,
    bottom:    <path d="M11 7 L25 7 L25 30 L20 30 L18 16 L16 30 L11 30 Z" {...common}/>,
    outerwear: <path d="M14 7 L9 10 L5 14 L8 19 L10 17 L10 30 L26 30 L26 17 L28 19 L31 14 L27 10 L22 7 L18 12 Z M18 7 L18 30" {...common}/>,
    eyewear:   <><circle cx="11" cy="19" r="5" {...common}/><circle cx="25" cy="19" r="5" {...common}/><path d="M16 18 L20 18 M6 17 L4 15 M30 17 L32 15" {...common}/></>,
    headwear:  <path d="M6 22 C6 13 12 9 18 9 C24 9 27 13 27 18 L30 22 Z M6 22 L27 22" {...common}/>,
    accessory: <><circle cx="18" cy="19" r="7" {...common}/><path d="M18 15 L18 19 L21 21 M14 10 L15 13 M22 10 L21 13" {...common}/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 36 38">{paths[slot] || paths.top}</svg>;
}

const wdMoney = (n) => "$" + Math.round(n).toLocaleString();

// ═══════════════════════════════════════════════════════════════════════
function WardrobeTab({ character }) {
  const cid = character.id;
  const wd = useWardrobe(cid);
  const { totals: ledgerTotals } = useCommerceLedger();
  const toast = (typeof useToast === "function") ? useToast() : { push: () => {} };
  const [cat, setCat] = usW("all");
  const [brand, setBrand] = usW("all");
  const [query, setQuery] = usW("");
  const [mode, setMode] = usW("shop");   // shop | preview

  const brands = umW(() => ["all", ...Array.from(new Set(WD_CATALOG.map(i => i.brand)))], []);
  const shown = umW(() => WD_CATALOG.filter(i =>
    (cat === "all" || i.slot === cat) &&
    (brand === "all" || i.brand === brand) &&
    (!query || (i.brand + " " + i.name).toLowerCase().includes(query.toLowerCase()))
  ), [cat, brand, query]);

  const equippedItems = WD_SLOTS.map(s => wd.equipped[s.id] ? wdItem(wd.equipped[s.id]) : null);
  const lookTotal = equippedItems.filter(Boolean).reduce((a, i) => a + i.price, 0);
  const lookCount = equippedItems.filter(Boolean).length;

  const wayOf = (item) => wd.ways[item.id] || item.ways[0];
  const looks = wd.looks || [];
  const lookCut = commerceCut(lookTotal);

  const buyLook = null;
  const applyPreset = (p) => {
    wdApplyPreset(cid, p);
    toast.push({ kind: "ok", agent: "visual", title: `${p.name} on ${character.name.split(" ")[0]}`, message: `${Object.keys(p.items).length} pieces · ${p.note}` });
  };
  const saveLook = async () => {
    if (!lookCount) { toast.push({ kind: "warn", agent: "visual", title: "Nothing to save", message: "Build a look first." }); return; }
    const fallback = `Look ${looks.length + 1}`;
    const name = await (window.cinaPrompt ? window.cinaPrompt({
      kicker: "Wardrobe", title: "Name this look",
      body: "Looks are recalled by name when you dress a scene.",
      value: fallback, placeholder: "e.g. Act 1 · street", confirmLabel: "Save look",
    }) : Promise.resolve(window.prompt ? window.prompt("Name this look (e.g. Act 1 · street)", fallback) : fallback));
    if (name === null) return;
    wdSaveLook(cid, (name || fallback).trim());
    toast.push({ kind: "ok", agent: "visual", title: `Saved to your account`, message: `“${(name || "Look").trim()}” · synced to ${character.name.split(" ")[0]}'s wardrobe — available on every device.` });
  };

  return (
    <div className="sc-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "rgba(8,8,10,0.4)" }}>
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", alignItems: "start" }}>
      <style>{WD_CSS}</style>

      {/* ── LEFT · THE LOOK ── */}
      <div className="wd-look">
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
          <div className="wd-look__face">
            {character.photo
              ? <img src={character.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }}/>
              : <span style={{ background: `linear-gradient(135deg, ${character.color || tkc("line-2")}, ${tkc("void")})`, position: "absolute", inset: 0 }}/>}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>STYLING</div>
            <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", lineHeight: 1.05, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{character.name}</div>
          </div>
        </div>

        {/* Style with Cina — one-tap curated looks */}
        <div style={{ marginBottom: 12 }}>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="sparkles" size={10}/> STYLE WITH CINA
          </div>
          <div className="wd-presets">
            {WD_PRESETS.map(p => (
              <button key={p.id} className="wd-preset" onClick={() => applyPreset(p)} title={p.note}>
                <span className="wd-preset__sw">
                  {["outerwear", "top", "bottom", "footwear"].map(sl => {
                    const it = p.items[sl] && wdItem(p.items[sl]);
                    const c = it ? ((p.ways && p.ways[it.id]) || it.ways[0]) : "transparent";
                    return <span key={sl} style={{ background: c }}/>;
                  })}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="wd-slots">
          {WD_SLOTS.map(s => {
            const it = wd.equipped[s.id] ? wdItem(wd.equipped[s.id]) : null;
            return (
              <div key={s.id} className="wd-slot" data-filled={!!it}
                onClick={() => !it && setCat(s.id)}
                style={{ cursor: it ? "default" : "pointer" }}
                title={it ? "" : `Shop ${s.label.toLowerCase()}`}>
                <div className="wd-slot__ic" style={{ background: it ? wayOf(it) : "transparent" }}>
                  {it ? null : <WdGlyph slot={s.id} size={22} color="var(--c-ink-4)"/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>{s.label.toUpperCase()}</div>
                  {it
                    ? <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><b style={{ fontWeight: 600 }}>{it.brand}</b> {it.name}</div>
                    : <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", fontStyle: "italic" }}>+ add {s.label.toLowerCase()}</div>}
                </div>
                {it && <button className="wd-x" onClick={(e) => { e.stopPropagation(); wdUnequip(cid, s.id); }} title="Remove">✕</button>}
              </div>
            );
          })}
        </div>

        {/* Saved looks — scene continuity */}
        {looks.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-line)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 7 }}>SAVED LOOKS · {looks.length}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 176, overflowY: "auto" }} className="sc-scroll">
              {looks.map(lk => {
                const n = Object.keys(lk.equipped || {}).length;
                return (
                  <div key={lk.id} className="wd-savedlook">
                    <button className="wd-savedlook__load" onClick={() => { wdLoadLook(cid, lk.id); toast.push({ kind: "ok", agent: "visual", title: `Loaded “${lk.name}”`, message: `${n} pieces on ${character.name.split(" ")[0]}` }); }}>
                      <span className="wd-savedlook__dots">
                        {Object.values(lk.equipped || {}).slice(0, 5).map((iid, i) => { const it = wdItem(iid); return <span key={i} style={{ background: it ? ((lk.ways && lk.ways[iid]) || it.ways[0]) : tkc("line-2") }}/>; })}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lk.name}</span>
                      <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)" }}>{n}pc</span>
                    </button>
                    <button className="wd-x" onClick={() => wdDeleteLook(cid, lk.id)} title="Delete look">✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="wd-look__foot">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>{lookCount} PIECE{lookCount === 1 ? "" : "S"} · RETAIL</span>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)" }}>{wdMoney(lookTotal)}</span>
          </div>
          <div className="wd-earn">
            <span><b style={{ color: "var(--c-good)" }}>You earn {wdMoney(lookCut)}</b> when a viewer buys the full look</span>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em" }}>{Math.round(COMMERCE.commissionRate * 100)}% commission · {COMMERCE.provider}</span>
            {ledgerTotals.sales > 0 && <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--c-good)" }}/>{wdMoney(ledgerTotals.earned)} recorded · {ledgerTotals.sales} sale{ledgerTotals.sales === 1 ? "" : "s"}</span>}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button className="wd-ghost" onClick={saveLook} disabled={!lookCount}><Icon name="plus" size={11}/> Save look</button>
            <button className="wd-ghost" onClick={() => wdClearLook(cid)} disabled={!lookCount}>Clear</button>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
            Real for-sale pieces · tagged shoppable in every frame
          </div>
        </div>
      </div>

      {/* ── RIGHT · SHOP / TRY-ON ── */}
      <div className="wd-shop">
        <div className="wd-shop__head">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>WARDROBE · SHOP REAL BRANDS</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", marginTop: 3 }}>{mode === "preview" ? "Shop this look" : `${shown.length} ${cat === "all" ? "pieces" : (WD_CATS.find(c => c.id === cat) || {}).label}`}</div>
            </div>
            <div className="wd-modes">
              <button className="wd-mode" data-on={mode === "shop"} onClick={() => setMode("shop")}>Shop</button>
              <button className="wd-mode" data-on={mode === "preview"} onClick={() => setMode("preview")}>Preview</button>
            </div>
          </div>
          {mode === "shop" && <>
          <div className="wd-search" style={{ marginBottom: 10 }}>
            <Icon name="search" size={12}/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search brand or piece…"/>
          </div>
          <div className="wd-cats">
            {WD_CATS.map(c => (
              <button key={c.id} className="wd-cat" data-on={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="wd-brands">
            {brands.map(b => (
              <button key={b} className="wd-brand" data-on={brand === b} onClick={() => setBrand(b)}>{b === "all" ? "All designers" : b}</button>
            ))}
          </div>
          </>}
        </div>

        {mode === "preview"
          ? <WdTryOn character={character} cid={cid} wd={wd} toast={toast}/>
          : <div className="wd-grid">
              {shown.map(item => (
                <WdProductCard key={item.id} item={item} cid={cid} wd={wd} toast={toast}/>
              ))}
              {!shown.length && <div style={{ gridColumn: "1/-1", padding: 40, textAlign: "center", color: "var(--c-ink-4)", fontStyle: "italic" }}>No pieces match those filters.</div>}
            </div>
        }
      </div>
    </div>
    </div>
  );
}

function WdProductCard({ item, cid, wd, toast }) {
  const equipped = wd.equipped[item.slot] === item.id;
  const way = wd.ways[item.id] || item.ways[0];
  const light = wdIsLight(way);
  return (
    <div className="wd-card" data-on={equipped}>
      <div className="wd-card__vis" style={{ background: `radial-gradient(120% 120% at 30% 20%, ${way}, ${wdShade(way)} 92%)` }}>
        <span style={{ position: "absolute", top: 9, left: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: light ? "rgba(20,20,26,.6)" : "rgba(255,255,255,.7)" }}>{item.brand.toUpperCase()}</span>
        <WdGlyph slot={item.slot} size={64} color={light ? "rgba(20,20,26,.82)" : "rgba(255,255,255,.92)"}/>
        <span style={{ position: "absolute", bottom: 9, right: 10, fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: light ? "rgba(20,20,26,.55)" : "rgba(255,255,255,.6)" }}>{wdSlotLabel(item.slot).toUpperCase()}</span>
        {equipped && <span className="wd-card__on">WORN</span>}
        <div className="wd-card__ways">
          {item.ways.map(w => (
            <button key={w} className="wd-way" data-on={w === way} style={{ background: w }} onClick={() => wdSetWay(cid, item.id, w)} title={w}/>
          ))}
        </div>
      </div>
      <div className="wd-card__body">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="wd-card__brand">{item.brand}</div>
          <div className="wd-card__name">{item.name}</div>
        </div>
        <div className="wd-card__price">{wdMoney(item.price)}</div>
      </div>
      <div className="wd-card__acts">
        <button className="wd-eq" data-on={equipped} onClick={() => wdEquip(cid, item)}>
          {equipped ? "✓ Worn" : "Wear it"}
        </button>
        <a className="wd-view" href={commerceBuyUrl(item)} target="_blank" rel="noreferrer" title={`View at ${commerceRetailer(item.brand).retailer}`}>↗</a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
function WdTryOn({ character, cid, wd, toast }) {
  const [phase, setPhase] = usW("idle");   // idle | gen | done
  const [seed, setSeed] = usW(1);
  const [sel, setSel] = usW(null);          // selected garment for shop card
  const canvasRef = urW(null);
  const imgRef = urW(null);

  const equipped = WD_SLOTS.map(s => wd.equipped[s.id] ? { slot: s.id, item: wdItem(wd.equipped[s.id]) } : null).filter(x => x && x.item);
  const colorOf = (it) => wd.ways[it.id] || it.ways[0];
  const has = (slot) => equipped.find(e => e.slot === slot);
  const c = (slot, fallback) => { const e = has(slot); return e ? colorOf(e.item) : fallback; };
  const lookKey = equipped.map(e => e.item.id + (wd.ways[e.item.id] || "")).join("|");

  // Preload the actor headshot for compositing the face.
  ueW(() => {
    if (!character.photo) { imgRef.current = null; return; }
    const im = new Image();
    im.onload = () => { imgRef.current = im; if (phase === "done") draw(); };
    im.src = character.photo;
  }, [character.photo]);

  // Re-render if the look changes while showing a result.
  ueW(() => { if (phase === "done") draw(); }, [lookKey, seed, phase]);

  function draw() {
    const cv = canvasRef.current; if (!cv) return;
    const W = cv.width, H = cv.height, x0 = W / 2;
    const ctx = cv.getContext("2d");
    // studio backdrop
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, tkc("panel-2")); g.addColorStop(1, tkc("bg"));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x0, H - 12, 46, 10, 0, 0, 7); ctx.fill();

    const skin = tkc("ink-2");
    const outer = c("outerwear", null), top = c("top", tkc("line-3")), bottom = c("bottom", tkc("line-2")), foot = c("footwear", tkc("panel-2"));
    // legs
    ctx.fillStyle = bottom;
    ctx.fillRect(x0 - 22, 150, 18, 92); ctx.fillRect(x0 + 4, 150, 18, 92);
    // shoes
    ctx.fillStyle = foot;
    ctx.beginPath(); ctx.ellipse(x0 - 13, 246, 15, 8, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x0 + 13, 246, 15, 8, 0, 0, 7); ctx.fill();
    // torso (shirt/top)
    ctx.fillStyle = top;
    ctx.beginPath(); ctx.moveTo(x0 - 30, 84); ctx.lineTo(x0 + 30, 84); ctx.lineTo(x0 + 26, 152); ctx.lineTo(x0 - 26, 152); ctx.closePath(); ctx.fill();
    // sleeves + jacket
    const armC = outer || top;
    ctx.fillStyle = armC;
    ctx.fillRect(x0 - 40, 84, 12, 66); ctx.fillRect(x0 + 28, 84, 12, 66);
    if (outer) { // open jacket panels over the shirt
      ctx.fillStyle = outer;
      ctx.beginPath(); ctx.moveTo(x0 - 32, 80); ctx.lineTo(x0 - 8, 84); ctx.lineTo(x0 - 12, 152); ctx.lineTo(x0 - 30, 152); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x0 + 32, 80); ctx.lineTo(x0 + 8, 84); ctx.lineTo(x0 + 12, 152); ctx.lineTo(x0 + 30, 152); ctx.closePath(); ctx.fill();
    }
    // hands
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(x0 - 34, 150, 6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(x0 + 34, 150, 6, 0, 7); ctx.fill();
    // accessory (wrist)
    const acc = has("accessory"); if (acc) { ctx.fillStyle = colorOf(acc.item); ctx.fillRect(x0 + 30, 142, 8, 6); }
    // neck
    ctx.fillStyle = skin; ctx.fillRect(x0 - 6, 66, 12, 20);
    // head — actor photo clipped into a circle, else skin
    ctx.save();
    ctx.beginPath(); ctx.arc(x0, 46, 24, 0, 7); ctx.closePath(); ctx.clip();
    if (imgRef.current) { const s = 60; ctx.drawImage(imgRef.current, x0 - s / 2, 46 - 30, s, s); }
    else { ctx.fillStyle = skin; ctx.fillRect(x0 - 24, 22, 48, 48); }
    ctx.restore();
    // headwear
    const hw = has("headwear"); if (hw) { ctx.fillStyle = colorOf(hw.item); ctx.beginPath(); ctx.arc(x0, 40, 25, Math.PI, 2 * Math.PI); ctx.fill(); ctx.fillRect(x0 - 25, 38, 50, 6); }
    // eyewear
    const ew = has("eyewear"); if (ew) { ctx.fillStyle = colorOf(ew.item); ctx.fillRect(x0 - 16, 44, 32, 5); }
    // low-res grain
    for (let i = 0; i < 340; i++) { ctx.fillStyle = `rgba(${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},${Math.random() > .5 ? 255 : 0},.03)`; ctx.fillRect(Math.random() * W | 0, Math.random() * H | 0, 1, 1); }
  }

  const generate = () => {
    if (phase === "gen") return;
    if (!equipped.length) { toast.push({ kind: "warn", agent: "visual", title: "Dress them first", message: "Add a few pieces, then generate the try-on." }); return; }
    setSel(null); setPhase("gen");
    toast.push({ kind: "info", agent: "visual", title: `Rendering ${character.name.split(" ")[0]} in the look…`, message: "Shoppable frame · full body" });
    setTimeout(() => { setSeed(s => s + 1); setPhase("done"); }, 1500);
  };

  return (
    <div className="wd-tryon">
      <div className="wd-tryon__frame">
        {phase === "idle" && (
          <div className="wd-tryon__empty">
            <WdGlyph slot="top" size={40} color="var(--c-ink-4)"/>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", marginTop: 10 }}>Shop the look on {character.name.split(" ")[0]}.</div>
            <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 4, maxWidth: 250, lineHeight: 1.5 }}>Render a shoppable frame of the actor in the equipped pieces — tap any garment to buy it for real. You earn a cut on every sale.</div>
            <button className="wd-buy" style={{ width: "auto", padding: "0 18px", marginTop: 16 }} onClick={generate}><Icon name="sparkles" size={12}/> Generate shoppable preview</button>
          </div>
        )}

        {phase !== "idle" && (
          <div className="wd-tryon__stage">
            <canvas ref={canvasRef} width="160" height="270" className="wd-tryon__canvas"/>
            {phase === "gen" && <div className="wd-tryon__gen"><span className="wd-tryon__shim"/><span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em", zIndex: 1 }}>RENDERING · LOW-RES</span></div>}
            {phase === "done" && <>
              <div className="wd-tryon__tag">▶ SHOP THIS LOOK · {character.name.split(" ")[0].toUpperCase()}</div>
              {equipped.map(({ slot, item }) => {
                const pos = WD_BODY_POS[slot] || { top: "50%", left: "50%" };
                return <button key={slot} className="wd-hot" style={{ top: pos.top, left: pos.left }} data-on={sel && sel.id === item.id} onClick={() => setSel(sel && sel.id === item.id ? null : item)} title={`${item.brand} ${item.name}`}><span/></button>;
              })}
            </>}
          </div>
        )}

        {/* Shop card for the tapped garment */}
        {phase === "done" && sel && (
          <div className="wd-shopcard">
            <span className="wd-shopcard__sw" style={{ background: wd.ways[sel.id] || sel.ways[0] }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-amber)", letterSpacing: ".16em" }}>{sel.brand.toUpperCase()} · {commerceRetailer(sel.brand).retailer}</div>
              <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink)", margin: "1px 0 2px" }}>{sel.name}</div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)" }}>You earn {wdMoney(commerceCut(sel.price))} · {Math.round(COMMERCE.commissionRate * 100)}% per sale</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{wdMoney(sel.price)}</span>
              <a className="wd-shopnow" href={commerceBuyUrl(sel)} target="_blank" rel="noreferrer" onClick={() => commerceRecordSale(sel, { character, buyer: "viewer" }) && toast.push({ kind: "ok", agent: "visual", title: `Sale recorded · ${sel.brand}`, message: `${sel.name} · you earn ${wdMoney(commerceCut(sel.price))} · ${Math.round(COMMERCE.commissionRate * 100)}% director cut` })}>Buy ↗</a>
            </div>
          </div>
        )}
      </div>

      {phase === "done" && (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button className="wd-ghost" onClick={generate}><Icon name="sparkles" size={11}/> Regenerate</button>
          <button className="wd-ghost" onClick={() => { setPhase("idle"); setSel(null); }}>Reset</button>
        </div>
      )}
    </div>
  );
}

function CostumeInspector({ character }) {
  const cid = character.id;
  const wd = useWardrobe(cid);
  const { ledger, totals } = useCommerceLedger();
  const toast = (typeof useToast === "function") ? useToast() : { push: () => {} };

  const equipped = WD_SLOTS.map(s => wd.equipped[s.id] ? wdItem(wd.equipped[s.id]) : null).filter(Boolean);
  const lookTotal = equipped.reduce((a, i) => a + i.price, 0);
  const cut = commerceCut(lookTotal);
  const views = (window.PROJECTS || []).filter(f => f && f.published).reduce((a, f) => a + (f.views || 0), 0) || 120000;
  const avgItem = equipped.length ? lookTotal / equipped.length : 0;
  const projected = Math.round(views * 0.0005 * avgItem * COMMERCE.commissionRate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{WD_CSS}</style>

      {/* Current look */}
      <div>
        <div className="wd-insp-h"><span>THE LOOK</span><span>{equipped.length} pc</span></div>
        {equipped.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {equipped.map(it => (
              <div key={it.id} className="wd-line">
                <span className="wd-line__sw" style={{ background: wd.ways[it.id] || it.ways[0] }}/>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ color: "var(--c-ink)", fontWeight: 600 }}>{it.brand}</b>
                  <span style={{ color: "var(--c-ink-3)" }}> {it.name}</span>
                  <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em", marginTop: 1 }}>{wdSlotLabel(it.slot).toUpperCase()} · you earn {wdMoney(commerceCut(it.price))}</span>
                </span>
                <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-2)" }}>{wdMoney(it.price)}</span>
              </div>
            ))}
            <div className="wd-total"><span>Retail value</span><span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{wdMoney(lookTotal)}</span></div>
          </div>
        ) : (
          <div style={{ marginTop: 10, padding: "16px 12px", border: "1px dashed var(--c-line-2)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-4)", fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>
            Nothing worn yet. Tap <b style={{ color: "var(--c-ink-3)" }}>Wear it</b> in the shop to style {character.name.split(" ")[0]}.
          </div>
        )}
      </div>

      {/* Shoppable in the film — director revenue share */}
      <div>
        <div className="wd-insp-h"><span>SHOPPABLE IN THE FILM</span><span>{Math.round(COMMERCE.commissionRate * 100)}%</span></div>
        <div style={{ marginTop: 10, padding: "13px 14px", background: "linear-gradient(180deg, rgba(var(--accent-rgb, 229,72,47),.06), var(--c-panel) 70%)", border: "1px solid rgba(var(--accent-rgb, 229,72,47),.28)", borderRadius: "var(--r-2)" }}>
          <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.5, marginBottom: 12 }}>
            Every piece is tagged to its real retailer. When a viewer taps it in the film and buys, you earn a commission.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid var(--c-line)" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>YOUR CUT · FULL LOOK</span>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-good)" }}>{wdMoney(cut)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".16em" }}>EST. ROYALTIES / MO</span>
            <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)" }}>{equipped.length ? wdMoney(projected) : "—"}</span>
          </div>
          <div className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", letterSpacing: ".08em", marginTop: 8, lineHeight: 1.5 }}>
            {COMMERCE.provider} · pays {COMMERCE.payout} · based on {(views / 1000).toFixed(0)}K viewers
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-line)" }}>
            <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", marginBottom: 6 }}>CONNECTED RETAIL RAILS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {["Shopify Collabs", "Amazon PA-API", "LTK", "Impact", "Rakuten"].map(p => (
                <span key={p} style={{ fontFamily: "var(--f-mono)", fontSize: "var(--fs-label)", letterSpacing: ".08em", color: "var(--c-ink-3)", padding: "2px 6px", border: "1px solid var(--c-line-2)", borderRadius: "var(--r-2)" }}>{p}</span>
              ))}
            </div>
            <div style={{ fontSize: "var(--fs-label)", color: "var(--c-ink-4)", lineHeight: 1.5, marginTop: 8 }}>
              Sales clear through these affiliate networks. <b style={{ color: "var(--c-ink-3)" }}>Stripe Connect</b> auto-splits each payout the instant it lands — the studio, this creator, and every credited collaborator are paid their share automatically, with the platform fee routed to admin. No invoicing, no manual reconciliation.
            </div>
          </div>
        </div>
      </div>

      {/* Royalties ledger — real recorded director commission on every sale */}
      <div>
        <div className="wd-insp-h"><span>ROYALTIES LEDGER</span><span>{totals.sales} sale{totals.sales === 1 ? "" : "s"}</span></div>
        <div className="wd-ledger">
          <div className="wd-ledger__tot">
            <div>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>DIRECTOR EARNED</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-good)", lineHeight: 1 }}>{wdMoney(totals.earned)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>GROSS SALES</div>
              <div className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-title)", color: "var(--c-ink)", lineHeight: 1 }}>{wdMoney(totals.gross)}</div>
            </div>
          </div>
          {ledger.length ? (
            <div className="wd-ledger__rows">
              {ledger.slice(0, 6).map(r => (
                <div key={r.id} className="wd-ledger__row">
                  <span className="wd-ledger__brand">{r.brand}</span>
                  <span style={{ flex: 1, minWidth: 0, color: "var(--c-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  <span className="t-mono" style={{ fontSize: "var(--fs-label)", color: "var(--c-good)", flexShrink: 0 }}>+{wdMoney(r.cut)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="wd-ledger__empty">No sales yet. Open <b style={{ color: "var(--c-ink-3)" }}>Shoppable preview</b>, tap a tagged piece and buy — the director cut lands here.</div>
          )}
          {ledger.length > 0 && (
            <button className="wd-ledger__clear" onClick={() => { commerceLedgerClear(); toast.push({ kind: "info", agent: "visual", title: "Ledger cleared", message: "Recorded sales reset" }); }}>Clear ledger</button>
          )}
        </div>
      </div>

      {/* Continuity note */}
      <div>
        <div className="wd-insp-h"><span>CONTINUITY</span></div>
        <div style={{ marginTop: 10, padding: "11px 13px", background: "var(--c-panel)", border: "1px solid var(--c-line)", borderRadius: "var(--r-2)", fontSize: "var(--fs-body)", color: "var(--c-ink-2)", lineHeight: 1.55, fontStyle: "italic", fontFamily: "var(--f-display)" }}>
          {equipped.length
            ? `${character.name}'s look is locked to the identity — every still and clip renders these pieces until you change them.`
            : "Build a look and it carries across every shot for continuity."}
        </div>
      </div>
    </div>
  );
}

// ─── color helpers ──────────────────────────────────────────────────────────
function wdHex(c) { const m = (c || tkc("ink-3")).replace("#", ""); return [parseInt(m.slice(0,2),16)||128, parseInt(m.slice(2,4),16)||128, parseInt(m.slice(4,6),16)||128]; }
function wdIsLight(c) { const [r,g,b] = wdHex(c); return (0.299*r + 0.587*g + 0.114*b) > 150; }
function wdShade(c) { const [r,g,b] = wdHex(c); const f = 0.45; return `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`; }

const WD_CSS = `
.wd-look { padding: 18px 18px 18px; border-right: 1px solid var(--c-line); display: flex; flex-direction: column; position: sticky; top: 0; max-height: calc(100vh - 140px); overflow-y: auto; }
.wd-look__face { width: 46px; height: 46px; border-radius: 8px; overflow: hidden; position: relative; flex-shrink: 0; border: 1px solid var(--c-line-2); background: var(--c-bg); }
.wd-slots { display: flex; flex-direction: column; gap: 6px; padding-bottom: 8px; }
.wd-slot { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--c-line); background: var(--c-panel); }
.wd-slot[data-filled="true"] { border-color: var(--c-line-2); background: var(--c-panel-2); }
.wd-slot__ic { width: 30px; height: 30px; border-radius: 5px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--c-line-2); }
.wd-x { background: none; border: none; color: var(--c-ink-4); cursor: pointer; font-size:var(--fs-body); padding: 2px 4px; line-height: 1; flex-shrink: 0; }
.wd-x:hover { color: var(--c-blood-x, var(--c-bad)); }
.wd-look__foot { padding: 14px 0 18px; border-top: 1px solid var(--c-line); margin-top: 4px; }
.wd-buy { width: 100%; height: 42px; border: none; border-radius: 8px; background: var(--c-amber); color: var(--c-on-amber); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .12em; font-weight: 700; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: filter .15s; }
.wd-buy:hover { filter: brightness(1.08); }
.wd-buy:disabled { opacity: .4; cursor: default; filter: none; }

.wd-presets { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
.wd-preset { flex-shrink: 0; display: flex; align-items: center; gap: 7px; height: 30px; padding: 0 11px 0 7px; border-radius: 999px; border: 1px solid var(--c-line-2); background: var(--c-panel); color: var(--c-ink-2); font-size:var(--fs-label); cursor: pointer; white-space: nowrap; transition: all .14s; }
.wd-preset:hover { border-color: var(--c-amber); color: var(--c-ink); }
.wd-preset__sw { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; width: 16px; height: 16px; border-radius: 4px; overflow: hidden; flex-shrink: 0; }
.wd-preset__sw span { display: block; }
.wd-ghost { flex: 1; height: 30px; border-radius: 7px; border: 1px solid var(--c-line-2); background: transparent; color: var(--c-ink-2); font-size:var(--fs-label); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .13s; }
.wd-ghost:hover:not(:disabled) { border-color: var(--c-line-3); color: var(--c-ink); }
.wd-ghost:disabled { opacity: .4; cursor: default; }
.wd-savedlook { display: flex; align-items: center; gap: 4px; }
.wd-savedlook__load { flex: 1; min-width: 0; display: flex; align-items: center; gap: 9px; padding: 7px 9px; border-radius: 6px; border: 1px solid var(--c-line); background: var(--c-panel); color: var(--c-ink-2); font-size:var(--fs-body); cursor: pointer; text-align: left; transition: all .13s; }
.wd-savedlook__load:hover { border-color: var(--c-amber); color: var(--c-ink); }
.wd-savedlook__dots { display: flex; gap: 2px; flex-shrink: 0; }
.wd-savedlook__dots span { width: 8px; height: 8px; border-radius: 2px; border: 1px solid rgba(0,0,0,.35); }

.wd-shop { display: flex; flex-direction: column; container-type: inline-size; }
.wd-modes { display: flex; gap: 2px; padding: 3px; border-radius: 999px; border: 1px solid var(--c-line-2); background: var(--c-bg); }
.wd-mode { height: 26px; padding: 0 14px; border-radius: 999px; border: none; background: transparent; color: var(--c-ink-3); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; text-transform: uppercase; cursor: pointer; transition: all .13s; }
.wd-mode[data-on="true"] { background: var(--c-amber); color: var(--c-on-amber); font-weight: 700; }
.wd-earn { padding: 9px 11px; border-radius: 7px; border: 1px solid rgba(var(--accent-rgb, 229,72,47),.28); background: linear-gradient(180deg, rgba(var(--accent-rgb, 229,72,47),.06), transparent); display: flex; flex-direction: column; gap: 3px; font-size:var(--fs-label); color: var(--c-ink-2); line-height: 1.4; }
.wd-view { width: 34px; height: 30px; flex-shrink: 0; border-radius: 6px; border: 1px solid var(--c-line-2); background: var(--c-panel-2); color: var(--c-ink-2); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size:var(--fs-body); text-decoration: none; transition: all .13s; }
.wd-view:hover { color: var(--c-amber); border-color: var(--c-amber); }

/* Try-on frame */
.wd-tryon { padding: 20px 22px 26px; }
.wd-tryon__frame { position: relative; border: 1px solid var(--c-line); border-radius: 12px; background: var(--c-bg); overflow: hidden; min-height: 380px; display: flex; align-items: center; justify-content: center; }
.wd-tryon__empty { text-align: center; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; }
.wd-tryon__stage { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; padding: 18px 0; }
.wd-tryon__canvas { width: 300px; height: 506px; image-rendering: pixelated; border-radius: 8px; filter: saturate(1.05); }
.wd-tryon__gen { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(8,8,10,.6); overflow: hidden; }
.wd-tryon__shim { position: absolute; inset: 0; background: linear-gradient(100deg, transparent 20%, rgba(var(--accent-rgb, 229,72,47),.14) 50%, transparent 80%); background-size: 220% 100%; animation: wdShim 1.1s linear infinite; }
@keyframes wdShim { 0% { background-position: 120% 0 } 100% { background-position: -120% 0 } }
.wd-tryon__tag { position: absolute; top: 12px; left: 12px; font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .14em; color: var(--c-amber); background: rgba(8,8,10,.7); border: 1px solid rgba(var(--accent-rgb, 229,72,47),.4); padding: 3px 8px; border-radius: 3px; }
.wd-hot { position: absolute; transform: translate(-50%, -50%); width: 22px; height: 22px; border-radius: 50%; border: none; background: transparent; cursor: pointer; padding: 0; }
.wd-hot span { position: absolute; inset: 6px; border-radius: 50%; background: var(--c-amber); box-shadow: 0 0 0 3px rgba(var(--accent-rgb, 229,72,47),.3), 0 0 10px rgba(var(--accent-rgb, 229,72,47),.6); }
.wd-hot::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid var(--c-amber); opacity: .6; animation: wdPing 2s ease-out infinite; }
@keyframes wdPing { 0% { transform: scale(.6); opacity: .7 } 100% { transform: scale(1.5); opacity: 0 } }
.wd-hot[data-on="true"] span { background: var(--c-white); }
.wd-shopcard { position: absolute; left: 12px; right: 12px; bottom: 12px; display: flex; align-items: center; gap: 12px; padding: 11px 13px; background: rgba(12,12,16,.94); backdrop-filter: blur(8px); border: 1px solid var(--c-line-2); border-radius: 10px; }
.wd-shopcard__sw { width: 34px; height: 34px; border-radius: 6px; flex-shrink: 0; border: 1px solid var(--c-line-2); }
.wd-shopnow { display: inline-flex; align-items: center; height: 26px; padding: 0 12px; border-radius: 999px; background: var(--c-amber); color: var(--c-on-amber); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .08em; font-weight: 700; text-decoration: none; border: 0; cursor: pointer; }
.wd-shopnow:hover { filter: brightness(1.08); }
.wd-shop__head { padding: 18px 22px 12px; border-bottom: 1px solid var(--c-line); position: sticky; top: 0; z-index: 3; background: var(--c-bg); }
.wd-search { display: flex; align-items: center; gap: 7px; height: 32px; padding: 0 11px; border: 1px solid var(--c-line-2); border-radius: 999px; color: var(--c-ink-4); background: var(--c-bg); }
.wd-search input { background: none; border: none; outline: none; color: var(--c-ink); font-size:var(--fs-body); width: 180px; }
.wd-cats { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
.wd-cat { height: 28px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--c-line-2); background: transparent; color: var(--c-ink-3); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .08em; text-transform: uppercase; cursor: pointer; transition: all .13s; }
.wd-cat[data-on="true"] { background: var(--c-amber); color: var(--c-on-amber); border-color: var(--c-amber); font-weight: 700; }
.wd-cat:hover:not([data-on="true"]) { border-color: var(--c-line-3); color: var(--c-ink); }
.wd-brands { display: flex; gap: 5px; flex-wrap: wrap; }
.wd-brand { height: 24px; padding: 0 10px; border-radius: 4px; border: 1px solid var(--c-line); background: transparent; color: var(--c-ink-4); font-size:var(--fs-label); cursor: pointer; transition: all .13s; }
.wd-brand[data-on="true"] { color: var(--c-amber); border-color: var(--c-amber-d); background: rgba(var(--accent-rgb, 229,72,47),.07); }
.wd-brand:hover:not([data-on="true"]) { color: var(--c-ink-2); border-color: var(--c-line-2); }

.wd-grid { padding: 16px 22px 30px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); grid-auto-rows: max-content; gap: 14px; align-content: start; }
.wd-card { border: 1px solid var(--c-line); border-radius: 9px; overflow: hidden; background: var(--c-panel); display: flex; flex-direction: column; transition: border-color .14s, transform .14s; }
.wd-card:hover { border-color: var(--c-line-3); transform: translateY(-2px); }
.wd-card[data-on="true"] { border-color: var(--c-amber); box-shadow: 0 0 0 1px var(--c-amber); }
.wd-card__vis { position: relative; height: 170px; display: flex; align-items: center; justify-content: center; }
.wd-card__on { position: absolute; top: 8px; left: 8px; font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .16em; color: var(--c-on-amber); background: var(--c-amber); padding: 2px 7px; border-radius: 3px; font-weight: 700; }
.wd-card__ways { position: absolute; bottom: 8px; left: 8px; display: flex; gap: 4px; }
.wd-way { width: 13px; height: 13px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.55); cursor: pointer; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,.4); }
.wd-way[data-on="true"] { border-color: var(--c-white); transform: scale(1.18); }
.wd-card__body { padding: 10px 11px 4px; display: flex; align-items: flex-start; gap: 8px; }
.wd-card__brand { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; text-transform: uppercase; color: var(--c-amber); }
.wd-card__name { font-size:var(--fs-body); color: var(--c-ink); line-height: 1.25; margin-top: 2px; text-wrap: pretty; }
.wd-card__price { font-family: var(--f-display); font-style: italic; font-size:var(--fs-lead); color: var(--c-ink); white-space: nowrap; }
.wd-card__acts { display: flex; gap: 6px; padding: 8px 11px 11px; }
.wd-eq { flex: 1; height: 30px; border-radius: 6px; border: 1px solid var(--c-line-2); background: var(--c-panel-2); color: var(--c-ink); font-size:var(--fs-label); cursor: pointer; transition: all .13s; }
.wd-eq:hover { border-color: var(--c-line-3); }
.wd-eq[data-on="true"] { background: rgba(var(--accent-rgb, 229,72,47),.14); border-color: var(--c-amber); color: var(--c-amber); }
.wd-cart { width: 34px; height: 30px; flex-shrink: 0; border-radius: 6px; border: 1px solid var(--c-line-2); background: var(--c-panel-2); color: var(--c-ink-3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .13s; }
.wd-cart:hover { color: var(--c-ink); border-color: var(--c-line-3); }
.wd-cart[data-on="true"] { background: var(--c-amber); color: var(--c-on-amber); border-color: var(--c-amber); }

.wd-insp-h { display: flex; justify-content: space-between; align-items: center; font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .2em; color: var(--c-ink-4); text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid var(--c-line); }
.wd-line { display: flex; align-items: center; gap: 9px; font-size:var(--fs-body); padding: 5px 0; }
.wd-line__sw { width: 20px; height: 20px; border-radius: 4px; flex-shrink: 0; border: 1px solid var(--c-line-2); }
.wd-total { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; margin-top: 4px; border-top: 1px solid var(--c-line); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; text-transform: uppercase; color: var(--c-ink-4); }

.wd-ledger { margin-top: 10px; border: 1px solid var(--c-line); border-radius: 8px; overflow: hidden; background: var(--c-panel); }
.wd-ledger__tot { display: flex; justify-content: space-between; align-items: flex-end; padding: 13px 14px; background: linear-gradient(180deg, rgba(106,163,122,.08), transparent); border-bottom: 1px solid var(--c-line); }
.wd-ledger__rows { display: flex; flex-direction: column; }
.wd-ledger__row { display: flex; align-items: center; gap: 9px; padding: 8px 14px; font-size:var(--fs-body); border-bottom: 1px solid var(--c-line); }
.wd-ledger__row:last-child { border-bottom: none; }
.wd-ledger__brand { font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .1em; text-transform: uppercase; color: var(--c-amber); flex-shrink: 0; }
.wd-ledger__empty { padding: 14px; font-size:var(--fs-label); color: var(--c-ink-4); font-style: italic; line-height: 1.5; text-align: center; }
.wd-ledger__clear { width: 100%; padding: 8px; border: none; border-top: 1px solid var(--c-line); background: transparent; color: var(--c-ink-4); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .14em; text-transform: uppercase; cursor: pointer; }
.wd-ledger__clear:hover { color: var(--c-ink-2); }

@media (max-width: 900px) {
  .wd-look { grid-column: 1 / -1; border-right: none; border-bottom: 1px solid var(--c-line); }
}
`;

// Register a "bag" icon if the shared Icon set doesn't have one.
(function () {
  if (typeof window === "undefined" || !window.Icon) return;
  const prev = window.Icon;
  window.Icon = function (p) {
    if (p.name === "bag") {
      const s = p.size || 14;
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={p.className}>
          <path d="M6 8 L6 7 A6 6 0 0 1 18 7 L18 8"/>
          <path d="M4 8 L20 8 L19 21 L5 21 Z"/>
        </svg>
      );
    }
    return prev(p);
  };
})();

// ═══ SHOP THIS LOOK v2 — the real actor frame, tappable garments, buy cards ═══
const WD_STL_POS = { headwear: { x: 50, y: 7 }, eyewear: { x: 50, y: 20 }, top: { x: 57, y: 64 }, outerwear: { x: 27, y: 56 }, bottom: { x: 45, y: 87 }, footwear: { x: 56, y: 96 }, accessory: { x: 75, y: 74 } };
const WD_STL_CSS = `
.wd-stl { display: grid; grid-template-columns: minmax(280px, 360px) minmax(300px, 1fr); gap: 20px; padding: 20px 22px 34px; align-items: start; }
@container (max-width: 720px) { .wd-stl { grid-template-columns: 1fr; } .wd-stl__frame { max-width: 380px; } }
@media (max-width: 1150px) { .wd-stl { grid-template-columns: 1fr; } .wd-stl__frame { max-width: 380px; } }
.wd-stl__frame { position: relative; aspect-ratio: 3 / 4; border-radius: 12px; overflow: hidden; border: 1px solid var(--c-line-2); background: var(--c-bg); box-shadow: 0 22px 60px rgba(0,0,0,.5); }
.wd-stl__frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 10%; filter: saturate(.94) contrast(1.06) brightness(.92); }
.wd-stl__hot { position: absolute; transform: translate(-50%,-50%); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; background: rgba(8,8,10,.72); border: 1.5px solid rgba(255,255,255,.7); color: var(--c-white); font-size:var(--fs-body); font-weight: 700; line-height: 1; display: flex; align-items: center; justify-content: center; transition: all .15s; padding: 0; }
.wd-stl__hot:hover { border-color: var(--c-amber); }
.wd-stl__hot[data-on="true"] { background: var(--c-amber); border-color: var(--c-amber); color: var(--c-on-amber); box-shadow: 0 0 0 6px rgba(var(--accent-rgb, 229,72,47),.25); }
.wd-stl__cards { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.wd-stl__card { display: flex; align-items: center; gap: 14px; padding: 13px 15px; border-radius: 10px; border: 1px solid var(--c-line); background: var(--c-panel); cursor: pointer; transition: border-color .14s, background .14s; text-align: left; }
.wd-stl__card:hover { border-color: var(--c-line-3); }
.wd-stl__card[data-on="true"] { border-color: var(--c-amber); background: rgba(var(--accent-rgb, 229,72,47),.05); }
.wd-stl__vis { width: 58px; height: 58px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.wd-stl__buy { height: 32px; padding: 0 15px; border-radius: 999px; border: none; cursor: pointer; background: var(--c-amber); color: var(--c-on-amber); font-family: var(--f-mono); font-size:var(--fs-label); letter-spacing: .08em; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.wd-stl__buy:hover { filter: brightness(1.08); }
`;

function WdShopLook({ character, cid, wd, toast, onShop }) {
  const equipped = WD_SLOTS.map(s => wd.equipped[s.id] ? { slot: s.id, item: wdItem(wd.equipped[s.id]) } : null).filter(x => x && x.item);
  const [selId, setSelId] = usW(null);
  const first = character.name.split(" ")[0];
  const total = equipped.reduce((a, e) => a + e.item.price, 0);
  const cut = commerceCut(total);

  if (!equipped.length) return (
    <div style={{ padding: "48px 22px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{WD_STL_CSS}</style>
      <WdGlyph slot="top" size={40} color="var(--c-ink-4)"/>
      <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink-2)", marginTop: 12 }}>Nothing on {first} yet.</div>
      <div style={{ fontSize: "var(--fs-body)", color: "var(--c-ink-4)", marginTop: 5, maxWidth: 300, lineHeight: 1.55 }}>Equip pieces in the Shop — each one becomes a tappable, buyable garment on {first}'s frame.</div>
      <button className="wd-buy" style={{ width: "auto", padding: "0 18px", marginTop: 16 }} onClick={onShop}>Open the shop</button>
    </div>
  );

  return (
    <div className="wd-stl">
      <style>{WD_STL_CSS}</style>

      {/* the actor frame — tap a garment */}
      <div className="wd-stl__frame">
        {character.photo
          ? <img src={character.photo} alt=""/>
          : <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${character.color || tkc("line")}, ${tkc("void")})` }}></div>}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,8,.02) 55%, rgba(5,5,8,.72))" }}></div>
        <span className="t-mono" style={{ position: "absolute", left: 10, top: 10, fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-amber)", padding: "3px 9px", background: "rgba(8,8,10,.75)", borderRadius: "var(--r-2)", border: "1px solid rgba(var(--accent-rgb, 229,72,47),.35)" }}>▶ SHOP THIS LOOK · {first.toUpperCase()}</span>
        {equipped.map(({ slot, item }) => {
          const p = WD_STL_POS[slot] || { x: 50, y: 50 };
          return (
            <button key={slot} className="wd-stl__hot" data-on={selId === item.id} style={{ left: p.x + "%", top: p.y + "%" }}
              title={item.brand + " · " + item.name}
              onClick={() => setSelId(selId === item.id ? null : item.id)}>+</button>
          );
        })}
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 11, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "rgba(255,255,255,.7)" }}>{equipped.length} PIECES · {wdMoney(total)}</span>
          <span style={{ flex: 1 }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>YOU EARN {wdMoney(cut)}</span>
        </div>
      </div>

      {/* the products — real cards, real buy */}
      <div className="wd-stl__cards">
        <div className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)", padding: "2px 2px 4px" }}>ON {first.toUpperCase()} RIGHT NOW · TAP A + ON THE FRAME OR BUY DIRECT</div>
        {equipped.map(({ slot, item }) => {
          const way = wd.ways[item.id] || item.ways[0];
          const on = selId === item.id;
          return (
            <div key={item.id} className="wd-stl__card" data-on={on} onClick={() => setSelId(on ? null : item.id)}>
              <span className="wd-stl__vis" style={{ background: `radial-gradient(120% 120% at 30% 20%, ${way}, ${wdShade(way)} 92%)` }}>
                <WdGlyph slot={slot} size={30} color={wdIsLight(way) ? "rgba(20,20,26,.72)" : "rgba(255,255,255,.85)"}/>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", letterSpacing: ".16em", color: on ? "var(--c-amber)" : "var(--c-ink-4)" }}>{item.brand.toUpperCase()} · {commerceRetailer(item.brand).retailer.toUpperCase()}</span>
                <span style={{ display: "block", fontSize: "var(--fs-body)", color: "var(--c-ink)", margin: "2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                <span className="t-mono" style={{ display: "block", fontSize: "var(--fs-label)", color: "var(--c-good)", letterSpacing: ".08em" }}>You earn {wdMoney(commerceCut(item.price))} per sale</span>
              </span>
              <span className="t-display" style={{ fontStyle: "italic", fontSize: "var(--fs-lead)", color: "var(--c-ink)", flexShrink: 0 }}>{wdMoney(item.price)}</span>
              <button className="wd-stl__buy" onClick={(e) => { e.stopPropagation(); commerceBuy(item, { character: character.name, buyer: "viewer" }, toast); }}>
                BUY ↗
              </button>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "8px 2px 0", borderTop: "1px solid var(--c-line)", marginTop: 2 }}>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-ink-4)" }}>FULL LOOK {wdMoney(total)}</span>
          <span style={{ flex: 1 }}></span>
          <span className="t-mono" style={{ fontSize: "var(--fs-label)", letterSpacing: ".16em", color: "var(--c-good)" }}>{wdMoney(cut)} TO YOU ON A FULL-LOOK PURCHASE · {Math.round(COMMERCE.commissionRate * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WardrobeTab, CostumeInspector, WD_CATALOG, ShopThisLook: WdShopLook, COMMERCE });
