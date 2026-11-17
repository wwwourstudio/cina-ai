// pitch-data.jsx — Advertiser-side data: brands, campaigns, targeting, payout chain.

// ─── Advertiser persona — pretend the user is this brand ────────────────
const ADVERTISER = {
  brand: "Patagonia",
  contact: "molly.k@patagonia.com",
  budget: 84_000,           // remaining budget cents-equiv (USD)
  spent: 116_000,           // lifetime spent
  walletUSD: 84_000,
  trustScore: 92,           // brand-safety trust
  industry: "Apparel · Outdoor",
  color: tkc("line-3"),
  accent: tkc("good"),
  logo: "P",
};

// ─── Format pack templates (what advertisers can make) ──────────────────
const AD_FORMATS = [
  { id: "preroll-15", name: "15s pre-roll",    duration: 15,  cpm: 28,  desc: "Before play.",                fits: ["Awareness","Reach"] },
  { id: "preroll-30", name: "30s pre-roll",    duration: 30,  cpm: 42,  desc: "Skippable after 5s.",          fits: ["Brand story","Launch"] },
  { id: "midroll",    name: "60s mid-roll",    duration: 60,  cpm: 64,  desc: "AI-placed at scene breaks.",   fits: ["Premium","High intent"] },
  { id: "sponsor",    name: "90s sponsor read",duration: 90,  cpm: 95,  desc: "In creator's voice. Opt-in.",  fits: ["Trust","Endorsement"] },
  { id: "endcard",    name: "Endcard + offer", duration: 8,   cpm: 16,  desc: "After credits. House inv.",    fits: ["Performance","DTC"] },
];

// ─── Existing campaigns for this advertiser ─────────────────────────────
const CAMPAIGNS = [
  {
    id: "c-001",
    name: "Snowpack Anorak — Spring",
    product: "Snowpack Anorak",
    state: "live",
    format: "midroll",
    creative: "draft-2",
    budget: 24_000,
    spent: 15_840,
    flightStart: "2026-04-22",
    flightEnd:   "2026-05-22",
    targets: { genres: ["Drama","Doc","Adventure"], rating: ["G","PG","PG-13"], creators: ["voss","aika","ykim","sten"], audiences: ["outdoor","slow-burn"] },
    metrics: { impressions: 184_300, completion: 0.87, ctr: 0.024, cpv: 0.018 },
    payouts: { creators: 7_920, holders: 3_960, cinaCut: 3_960 },
    placedOn: ["ll","swallows","moss","thefence","longhall"],
  },
  {
    id: "c-002",
    name: "Worn Wear — repair before replace",
    product: "Worn Wear",
    state: "scheduled",
    format: "sponsor",
    creative: "draft-1",
    budget: 36_000,
    spent: 0,
    flightStart: "2026-05-15",
    flightEnd:   "2026-06-30",
    targets: { genres: ["Doc","Drama"], rating: ["G","PG"], creators: ["aika","sten","roan"], audiences: ["sustainability","craft"] },
    metrics: { impressions: 0, completion: 0, ctr: 0, cpv: 0 },
    payouts: { creators: 0, holders: 0, cinaCut: 0 },
    placedOn: [],
  },
  {
    id: "c-003",
    name: "Provisions Dry Bag — Endcard",
    product: "Provisions Dry Bag",
    state: "ended",
    format: "endcard",
    creative: "draft-1",
    budget: 8_000,
    spent: 8_000,
    flightStart: "2026-03-12",
    flightEnd:   "2026-04-12",
    targets: { genres: ["Adventure","Doc"], rating: ["G","PG","PG-13"], creators: ["aika","ykim"], audiences: ["outdoor"] },
    metrics: { impressions: 92_400, completion: 0.94, ctr: 0.041, cpv: 0.011 },
    payouts: { creators: 4_400, holders: 2_200, cinaCut: 2_200 },
    placedOn: ["moss","obsidian","pearl"],
  },
  {
    id: "c-004",
    name: "Recycled Down Jacket — Pre-roll test",
    product: "Recycled Down",
    state: "draft",
    format: "preroll-30",
    creative: null,
    budget: 12_000,
    spent: 0,
    flightStart: null,
    flightEnd: null,
    targets: { genres: [], rating: [], creators: [], audiences: [] },
    metrics: { impressions: 0, completion: 0, ctr: 0, cpv: 0 },
    payouts: { creators: 0, holders: 0, cinaCut: 0 },
    placedOn: [],
  },
];

// ─── Generated commercial drafts (the AI's output) ──────────────────────
const COMMERCIAL_DRAFTS = [
  {
    id: "draft-1",
    label: "The slow option",
    style: "Patient, observational. Long take of a single object.",
    duration: 60,
    palette: [tkc("line-3"), tkc("good"), tkc("panel-2"), tkc("cat-4")],
    storyboard: [
      { t: 0, frame: "moss",         caption: "Wide. Worn anorak hung on a peg. Steam rises off it. Rain outside." },
      { t: 12, frame: "darkroom-est", caption: "Match cut to a sewing machine. Tight on hands repairing the same shoulder." },
      { t: 28, frame: "the-photo",   caption: "Pull out: same person, twenty years older, still wearing it." },
      { t: 46, frame: "voss-eye",    caption: "Endcard: WORN WEAR. Repair before replace." },
    ],
    voPrompt: "Soft baritone. Two sentences. The first is a statement. The second is a question.",
    safety: { brand: 0.96, ip: 0.98, model: "Cina Brand Verify v3" },
  },
  {
    id: "draft-2",
    label: "The mountain option",
    style: "Cold landscape. Wide. Synth pad swells.",
    duration: 60,
    palette: [tkc("line-3"), tkc("cat-1"), tkc("panel-2"), tkc("cat-4")],
    storyboard: [
      { t: 0, frame: "darkroom-wide", caption: "Wide. Two figures cresting a ridge in storm. Backs to camera." },
      { t: 14, frame: "phone",        caption: "Tight on the closer figure's anorak — battered, taped at one elbow." },
      { t: 32, frame: "voss-enter",   caption: "Lens flare. They drop down out of frame, into white." },
      { t: 50, frame: "developer",    caption: "Card: SNOWPACK ANORAK. Made for the next thirty years." },
    ],
    voPrompt: "No VO. Wind. A single line of dialogue: \"Still good for one more.\"",
    safety: { brand: 0.94, ip: 0.99, model: "Cina Brand Verify v3" },
  },
  {
    id: "draft-3",
    label: "The unbranded option",
    style: "Documentary. Real customer. Rough handheld.",
    duration: 60,
    palette: [tkc("ink-4"), tkc("cat-4"), tkc("panel-2"), tkc("line-2")],
    storyboard: [
      { t: 0, frame: "darkroom-est", caption: "A woman, ~70, in her kitchen. \"This was my husband's.\"" },
      { t: 18, frame: "voss-eye",    caption: "Cut to her mending a sleeve. Long shot, no music." },
      { t: 38, frame: "the-photo",   caption: "Photograph: her husband, 1986, wearing the same anorak." },
      { t: 52, frame: "moss",        caption: "Card: WORN WEAR. (no logo, no website)" },
    ],
    voPrompt: "She speaks. We don't.",
    safety: { brand: 0.92, ip: 0.97, model: "Cina Brand Verify v3" },
  },
];

// ─── Audience taxonomies ────────────────────────────────────────────────
const AUDIENCES = [
  { id: "outdoor",    label: "Outdoor / adventure",        size: 4_200_000, fit: 0.94 },
  { id: "slow-burn",  label: "Slow-burn drama viewers",    size: 1_800_000, fit: 0.71 },
  { id: "craft",      label: "Craft & maker",              size: 920_000,   fit: 0.88 },
  { id: "sustainability", label: "Sustainability-leaning", size: 2_700_000, fit: 0.91 },
  { id: "noir",       label: "Noir / mystery",             size: 1_400_000, fit: 0.32 },
  { id: "family",     label: "Family-friendly viewers",    size: 3_100_000, fit: 0.62 },
  { id: "scifi",      label: "Sci-fi & speculative",       size: 2_200_000, fit: 0.41 },
  { id: "horror",     label: "Horror / after-dark",        size: 980_000,   fit: 0.08 },
];

// ─── Payout chain math ──────────────────────────────────────────────────
// When an advertiser pays $X on a film, the waterfall is:
//   Cina platform: 25%
//   Creator:       50%   (or 35% if film is NFT-funded — extra goes to holders)
//   NFT holders:   25%   (or 40%)
//
// Holders distribute by tier weight: producer > patron > collector.
// Each holder gets (their qty * tier weight) / sum.
const PAYOUT_DEFAULTS = {
  cinaCut: 0.25,
  creatorCut_unfunded: 0.75,
  creatorCut_funded:   0.50,
  holderCut_funded:    0.25,
};

const TIER_WEIGHTS = { producer: 100, patron: 12, collector: 1 };

// ─── Holder governance state — reuse existing NFT_PROJECTS ──────────────
// Active votes per project (synthesized once based on existing data).
const ACTIVE_VOTES = {
  "voss-ll": [
    {
      id: "v-ll-001",
      title: "Approve Patagonia Worn Wear sponsor read",
      summary: "Run a 90s sponsor read in Voss's voice as the mid-break for Episodes 6 + 7. $34,200 to creator pool, $17,100 to holders.",
      kind: "ad-approval",
      created: "2026-05-09",
      closes: "2026-05-13T19:00:00",
      yesPower: 4_280, noPower: 980, abstainPower: 220,
      yourVote: null,
      thread: 28,
      proposer: "Patagonia · via Cina Pitch",
      payoutPreview: 17_100,
    },
    {
      id: "v-ll-002",
      title: "Greenlight Season 2 — 8 episodes",
      summary: "Director proposes a Season 2 mint at the same revenue split. New ceiling: $360,000 raise.",
      kind: "greenlight",
      created: "2026-05-04",
      closes: "2026-05-20T19:00:00",
      yesPower: 5_120, noPower: 410, abstainPower: 80,
      yourVote: "yes",
      thread: 142,
      proposer: "Elias Voss",
      payoutPreview: null,
    },
    {
      id: "v-ll-003",
      title: "Reject Liquid Death mid-roll",
      summary: "Liquid Death proposed a 30s mid-roll. Tone mismatch flagged by 14 holders. Recommend reject.",
      kind: "ad-rejection",
      created: "2026-05-07",
      closes: "2026-05-11T12:00:00",
      yesPower: 3_640, noPower: 2_180, abstainPower: 320,
      yourVote: null,
      thread: 64,
      proposer: "Holder coalition · @ash.404",
      payoutPreview: -8_400,
    },
  ],
  "reng-fr": [
    {
      id: "v-fr-001",
      title: "Approve Audible 60s mid-roll",
      summary: "Audible bidding on the mid-roll slot. Strong audience fit (sci-fi readers, 0.78).",
      kind: "ad-approval",
      created: "2026-05-08",
      closes: "2026-05-14T12:00:00",
      yesPower: 1_840, noPower: 220, abstainPower: 60,
      yourVote: null, thread: 18,
      proposer: "Audible · via Cina Pitch",
      payoutPreview: 4_200,
    },
  ],
  "ykim-tf": [
    {
      id: "v-tf-001",
      title: "Festival cut vs streaming cut",
      summary: "Director asks: keep the 4-min coda for the streaming release, or trim to match the festival cut?",
      kind: "creative",
      created: "2026-05-06",
      closes: "2026-05-18T12:00:00",
      yesPower: 380, noPower: 240, abstainPower: 90,
      yourVote: null, thread: 52,
      proposer: "Yara Kim",
      payoutPreview: null,
    },
  ],
};

// ─── Holder chat per project ────────────────────────────────────────────
const HOLDER_CHAT = {
  "voss-ll": [
    { user: "Elias Voss",    role: "creator",  color: tkc("cat-3"), text: "Sending the Episode 6 cut to the holder vault tonight. Let me know what lands.", t: "2026-05-09T22:14", avatar: "EV" },
    { user: "ash.404",       role: "producer", color: tkc("amber"), text: "The Patagonia read is tonally right but I'd cut 8 seconds. Let it breathe at the front, not the tail.", t: "2026-05-10T08:02", avatar: "A4" },
    { user: "rena_ko",       role: "patron",   color: tkc("cat-3"), text: "+1. Front-load the brand mention, leave the back half to the creator.", t: "2026-05-10T08:14", avatar: "RK" },
    { user: "june_a",        role: "patron",   color: tkc("cat-3"), text: "The Liquid Death pitch felt off. We don't want sugar drinks against this tone.", t: "2026-05-10T09:01", avatar: "JA" },
    { user: "park_dr",       role: "collector",color: tkc("ink-4"), text: "Voted no on Liquid Death. Yes on Worn Wear.", t: "2026-05-10T09:32", avatar: "PD" },
    { user: "Elias Voss",    role: "creator",  color: tkc("cat-3"), text: "I'd record the Patagonia read myself rather than have Cina synthesize. Keeps the trust chain clean.", t: "2026-05-10T11:08", avatar: "EV" },
    { user: "Cina · agent",  role: "agent",    color: tkc("amber"), text: "Synthesizing Voss's voice with consent flag set to off. Read will route to Voss directly. Estimated holder distribution: $17,100 if approved.", t: "2026-05-10T11:09", avatar: "C" },
    { user: "you.eth",       role: "patron",   color: tkc("cat-3"), text: "Sounds right. I'll vote yes once the cut comes back.", t: "2026-05-10T13:40", avatar: "Y" },
    { user: "soren_v",       role: "collector",color: tkc("ink-4"), text: "Are we splitting the holder pool by tier weight or by token? Last time it felt like producers got disproportionate share.", t: "2026-05-10T14:22", avatar: "SV" },
    { user: "Cina · agent",  role: "agent",    color: tkc("amber"), text: "Tier weights: Producer 100·, Patron 12·, Collector 1·. By design — proportional to capital risked. Adjustable by holder vote (60% threshold).", t: "2026-05-10T14:24", avatar: "C" },
  ],
  "reng-fr": [
    { user: "Tao Reng",      role: "creator",  color: tkc("cat-6"), text: "Audible read would be the first sponsor I've taken. Tempted but want to hear the holder room.", t: "2026-05-09T19:00", avatar: "TR" },
    { user: "kyle.b",        role: "patron",   color: tkc("cat-3"), text: "If they let you write it, yes. If it's a script handed to you, no.", t: "2026-05-09T19:14", avatar: "KB" },
    { user: "void_91",       role: "collector",color: tkc("ink-4"), text: "Sci-fi readers are exactly Audible's market. Take it.", t: "2026-05-09T19:50", avatar: "V9" },
  ],
  "ykim-tf": [
    { user: "Yara Kim",      role: "creator",  color: tkc("ink-3"), text: "Festival cut won, but I keep coming back to the coda. Asking the room.", t: "2026-05-08T11:00", avatar: "YK" },
  ],
};

// ─── Campaign store — real persistence ──────────────────────────────────
// The seed CAMPAIGNS are the demo's history; campaigns the user builds in the
// Create wizard are added here and persisted to localStorage, so a spot you
// finish actually shows up in the Campaigns list (and survives reload).
const CAMPAIGN_STORE_KEY = "cina:pitch:campaigns:v1";
const CampaignStore = (() => {
  let userCampaigns = [];
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORE_KEY);
    if (raw) userCampaigns = JSON.parse(raw) || [];
  } catch {}
  const subs = new Set();
  const persist = () => { try { localStorage.setItem(CAMPAIGN_STORE_KEY, JSON.stringify(userCampaigns)); } catch {} };
  const emit = () => subs.forEach(fn => { try { fn(); } catch {} });
  return {
    all() { return [...userCampaigns, ...CAMPAIGNS]; },
    get(id) { return this.all().find(c => c.id === id) || null; },
    isUser(id) { return userCampaigns.some(c => c.id === id); },
    add(c) { userCampaigns = [c, ...userCampaigns]; persist(); emit(); return c; },
    update(id, patch) {
      userCampaigns = userCampaigns.map(c => c.id === id ? { ...c, ...patch } : c);
      persist(); emit();
    },
    remove(id) { userCampaigns = userCampaigns.filter(c => c.id !== id); persist(); emit(); },
    // Advance live user campaigns — spend paces toward budget, impressions +
    // payouts follow. Called on an interval by the lobby so ON AIR numbers
    // move while you watch.
    advance() {
      let changed = false;
      userCampaigns = userCampaigns.map(c => {
        if (c.state !== "live" || !c.budget) return c;
        const stepSpend = Math.max(8, Math.round(c.budget / ((c.flightDays || 30) * 240)));
        if ((c.spent || 0) >= c.budget) return c;
        changed = true;
        const spent = Math.min(c.budget, (c.spent || 0) + stepSpend);
        const imps = Math.round((c.metrics && c.metrics.impressions || 0) + stepSpend / 42 * 1000);
        return {
          ...c, spent,
          metrics: { ...(c.metrics || {}), impressions: imps },
          payouts: { ...(c.payouts || {}), creators: Math.round(spent * 0.34), holders: Math.round(spent * 0.17) },
        };
      });
      if (changed) { persist(); emit(); }
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
})();

// ─── Expose ─────────────────────────────────────────────────────────────
Object.assign(window, { TIER_WEIGHTS, ACTIVE_VOTES, HOLDER_CHAT });
