// promo-bridge.jsx — the connective tissue between the advertiser side (Pitch)
// and the creator side (Studio).
//
// Loaded by BOTH Cina.html and Pitch.html. It is a localStorage-backed store
// so an action taken in one surface (an advertiser requesting a performer, a
// director submitting a film to a future Pitch Night) shows up in the other.
//
// Surfaces it feeds:
//   · Studio "Promotion" inbox  — actor requests + commercial-placement approvals
//   · Studio promotion / PR stats — what's happening while your work is promoted
//   · Pitch Night lineup         — films directors submitted from the Studio
//
// Everything is seeded with believable data so the Studio looks alive on first
// load, then mutated live as the user approves/declines/submits.

const PROMO_KEY = "cina:promo-bridge:v1";

// ─── Seed: the creator's inbound from the advertiser world ───────────────
const PROMO_SEED = {
  // Advertisers asking to license one of THIS studio's performers for a spot.
  actorRequests: [
    { id: "ar-1", performer: "MOREL", performerId: "morel", advertiser: "Patagonia · Worn Wear", brand: tkc("cat-6"),
      use: "60s repair-program spot · placed in Doc & Drama", fee: 2400, royalty: 30, scope: "Full campaign",
      note: "Heritage tone, no dialogue. Your genre allow-list is respected.", ago: "2h ago", status: "pending" },
    { id: "ar-2", performer: "HALEY", performerId: "haley", advertiser: "Aesop · Hands", brand: tkc("ink-4"),
      use: "Beauty spot · in-film midroll", fee: 1200, royalty: 28, scope: "Single scene",
      note: "Quiet, considered. They've cleared final-cut approval to you.", ago: "5h ago", status: "pending" },
    { id: "ar-3", performer: "MOREL", performerId: "morel", advertiser: "Leica · M-series", brand: tkc("panel-2"),
      use: "Brand film · always-on", fee: 5800, royalty: 30, scope: "Always-on",
      note: "Premium placement. Camera-in-hand, exactly on-character.", ago: "Yesterday", status: "pending" },
  ],
  // Advertisers asking to run a commercial INSIDE one of this studio's films.
  commercialApprovals: [
    { id: "ca-1", film: "LAST LIGHT", filmId: "p1", advertiser: "Cardinal Spirits", brand: tkc("line-3"),
      format: "Mid-roll · 60s", spend: 24000, share: 7920, placement: "After Scene 14 · the darkroom",
      spot: "The slow option — a single object, observed.", ago: "1h ago", status: "pending" },
    { id: "ca-2", film: "BLUEJAY", filmId: "p5", advertiser: "Field Notes", brand: tkc("cat-1"),
      format: "End-card · 15s", spend: 8000, share: 2640, placement: "End credits",
      spot: "Quiet product card over the last frame.", ago: "4h ago", status: "pending" },
  ],
  // Promotion stats — live spend flowing through this studio's published films.
  promo: {
    films: [
      { film: "LAST LIGHT", filmId: "p1", spend: 38200, impressions: 184300, reach: 142000, advertisers: 3, completion: 0.87 },
      { film: "BLUEJAY",    filmId: "p5", spend: 21400, impressions: 92400,  reach: 78000,  advertisers: 2, completion: 0.94 },
    ],
  },
  // PR / press — the buzz around the studio while it's being promoted.
  pr: {
    mentions: 1284, mentionsTrend: 0.18, sentiment: 0.82, reachM: 4.2, audienceGrowth: 0.24,
    items: [
      { outlet: "The Verge", quote: "Cina's 'Last Light' is the first AI film that feels authored.", kind: "press", sentiment: "pos", ago: "1d ago" },
      { outlet: "@filmcrit_ari", quote: "BLUEJAY's color work is doing things I haven't seen.", kind: "social", sentiment: "pos", ago: "2d ago" },
      { outlet: "IndieWire", quote: "A studio of one, shipping at the pace of a major.", kind: "press", sentiment: "pos", ago: "3d ago" },
      { outlet: "@nightowl", quote: "Not sure how I feel about the ad placements mid-film.", kind: "social", sentiment: "neu", ago: "3d ago" },
    ],
  },
  // Pitch Night — results of nights this studio's films screened in, plus the
  // submissions queue (directors submit from the Studio; Pitch reads these).
  nightResults: [
    { ep: "13 · Eel-Light", film: "LAST LIGHT cut", funded: 184200, ships: "shipped", rating: 4.5, when: "2 weeks ago" },
    { ep: "11 · Bone Orchestra", film: "BLUEJAY teaser", funded: 212500, ships: "shipped", rating: 4.7, when: "6 weeks ago" },
  ],
  nightSubmissions: [
    // Director-submitted films queued for an upcoming night. Seeded with one
    // so the Pitch Night lineup isn't empty.
    { id: "ns-seed", film: "THE LONG HALL — pilot", filmId: "p2", director: "Elias Voss", logline: "A night-shift switchboard that connects calls between the living and the recently gone.", ep: "EP 15", votes: 312, status: "queued", when: "Submitted 3d ago" },
  ],
};

// ─── Store ───────────────────────────────────────────────────────────────
const PromoBridge = (() => {
  let state;
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    state = raw ? JSON.parse(raw) : null;
  } catch { state = null; }
  if (!state) state = JSON.parse(JSON.stringify(PROMO_SEED));

  const subs = new Set();
  const persist = () => { try { localStorage.setItem(PROMO_KEY, JSON.stringify(state)); } catch {} };
  const emit = () => { persist(); subs.forEach(fn => { try { fn(); } catch {} }); };

  return {
    get() { return state; },
    counts() {
      return {
        actorRequests: state.actorRequests.filter(r => r.status === "pending").length,
        commercialApprovals: state.commercialApprovals.filter(r => r.status === "pending").length,
      };
    },
    pendingTotal() {
      const c = this.counts();
      return c.actorRequests + c.commercialApprovals;
    },
    // Approve / decline an inbound request (actor or commercial).
    resolveActor(id, status) {
      state.actorRequests = state.actorRequests.map(r => r.id === id ? { ...r, status } : r);
      emit();
    },
    resolveCommercial(id, status) {
      state.commercialApprovals = state.commercialApprovals.map(r => r.id === id ? { ...r, status } : r);
      emit();
    },
    // Revert a resolved request back to pending (Undo).
    reopenActor(id) { state.actorRequests = state.actorRequests.map(r => r.id === id ? { ...r, status: "pending" } : r); emit(); },
    reopenCommercial(id) { state.commercialApprovals = state.commercialApprovals.map(r => r.id === id ? { ...r, status: "pending" } : r); emit(); },
    // Counter-offer: adjust the deal terms before approving.
    counterActor(id, patch) { state.actorRequests = state.actorRequests.map(r => r.id === id ? { ...r, ...patch, countered: true } : r); emit(); },
    counterCommercial(id, patch) { state.commercialApprovals = state.commercialApprovals.map(r => r.id === id ? { ...r, ...patch, countered: true } : r); emit(); },
    // Promotion: pause / resume live ad spend on a film.
    togglePromoPause(filmId) { state.promo.films = state.promo.films.map(f => f.filmId === filmId ? { ...f, paused: !f.paused } : f); emit(); },
    // Pitch Night: withdraw a queued submission.
    withdrawSubmission(id) { state.nightSubmissions = state.nightSubmissions.filter(s => s.id !== id); emit(); },
    // Advertiser side pushes a new inbound request (used when Pitch casts /
    // lists a performer / places a spot).
    addActorRequest(req) {
      state.actorRequests = [{ id: "ar-" + Date.now().toString(36), status: "pending", ago: "just now", ...req }, ...state.actorRequests];
      emit();
    },
    // Director submits a film to a future night (from the Studio).
    submitToNight(sub) {
      const rec = { id: "ns-" + Date.now().toString(36), votes: 0, status: "queued", when: "Submitted just now", ...sub };
      state.nightSubmissions = [rec, ...state.nightSubmissions];
      emit();
      return rec;
    },
    voteSubmission(id) {
      state.nightSubmissions = state.nightSubmissions.map(s => s.id === id ? { ...s, votes: (s.votes || 0) + 1, _voted: true } : s);
      emit();
    },
    earnings() {
      const fromActors = state.actorRequests.filter(r => r.status === "approved").reduce((s, r) => s + (r.fee || 0), 0);
      const fromSpots  = state.commercialApprovals.filter(r => r.status === "approved").reduce((s, r) => s + (r.share || 0), 0);
      const fromPromo  = state.promo.films.reduce((s, f) => s + Math.round(f.spend * 0.7), 0);
      const fromNights = state.nightResults.reduce((s, n) => s + Math.round((n.funded || 0) * 0.55), 0);
      return { fromActors, fromSpots, fromPromo, fromNights, total: fromActors + fromSpots + fromPromo + fromNights };
    },
    reset() { state = JSON.parse(JSON.stringify(PROMO_SEED)); emit(); },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
})();

// React hook: subscribe to the bridge and re-render on change.
function usePromo() {
  const [, force] = React.useState(0);
  React.useEffect(() => PromoBridge.subscribe(() => force(n => n + 1)), []);
  return PromoBridge;
}

Object.assign(window, { PromoBridge, usePromo });
