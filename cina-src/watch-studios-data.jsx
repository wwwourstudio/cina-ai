// watch-studios-data.jsx — Production studios (creator collectives).
// A studio is a group of creators sharing a flat-rate streaming subscription,
// a customizable channel page, and a revenue-split agreement.

const STUDIOS = [
  {
    id: "darkroom",
    name: "DARKROOM",
    verified: true,
    tagline: "Films made in the dim. Six creators. One light.",
    description: "A collective of psychological-thriller and slow-burn horror directors. Founded May 2025. Members split subscription revenue and ad share against a 6-way agreement.",
    color: tkc("cat-3"),
    accent: tkc("amber"),
    bgImage: "darkroom-hero",
    theme: "Darkroom", // matches creator-page theme
    founded: "2025-05",
    members: ["voss", "vail", "helm"],
    leadId: "voss",
    splits: { voss: 38, vail: 32, helm: 30 },
    subs: 12_840,
    mrr: 64_137,    // $ per month
    arpu: 4.99,
    churn: 3.2,
    growth30d: 18.4, // % growth
    plans: [
      { id: "monthly", name: "Monthly", price: 4.99, features: ["All Darkroom films & series", "168hr early premiere window", "Comments + reactions", "1 stream"], pop: false },
      { id: "annual",  name: "Annual",  price: 47.88, features: ["Everything in Monthly", "2 months free", "Annual NFT print drop", "2 streams"], pop: true, savings: "2 months free" },
      { id: "patron",  name: "Patron",  price: 14.99, features: ["Everything in Annual", "Behind-the-scenes vault", "Director Q&A access", "Early script reads", "4 streams"], pop: false },
    ],
    upcoming: [
      { id: "u1", title: "Last Light · S2", creatorId: "voss", date: "2026-09-12", kind: "series" },
      { id: "u2", title: "The Long Hall",   creatorId: "helm", date: "2026-07-22", kind: "film" },
      { id: "u3", title: "Verge",           creatorId: "vail", date: "2026-06-18", kind: "series" },
    ],
    submissions: [
      { id: "sub1", title: "Carrion Hour", creatorId: "ash", status: "pending", submitted: "2d", views: 0, fit: 92, notes: "Tone matches Darkroom slow-burn DNA. Recommend approve." },
      { id: "sub2", title: "Half Mile Wide", creatorId: "park_dr", status: "pending", submitted: "5d", views: 0, fit: 68, notes: "More action-thriller than psych horror. Borderline." },
    ],
    monthlyRevenue: [38_400, 41_200, 43_800, 47_100, 51_400, 56_800, 60_200, 64_137],
  },
  {
    id: "atlas",
    name: "ATLAS",
    verified: true,
    tagline: "Documentary. Architecture. The systems beneath.",
    description: "Documentary-leaning filmmakers with a shared interest in infrastructure, cities, and the systems we live inside. Cold blueprint aesthetic.",
    color: tkc("cat-6"),
    accent: tkc("cat-2"),
    theme: "Atlas",
    founded: "2024-11",
    members: ["hara", "park"],
    leadId: "hara",
    splits: { hara: 55, park: 45 },
    subs: 8_240,
    mrr: 41_120,
    arpu: 4.99,
    churn: 2.1,
    growth30d: 12.8,
    plans: [
      { id: "monthly", name: "Monthly", price: 4.99, features: ["All Atlas docs & series", "Subscribe-only essays", "1 stream"], pop: false },
      { id: "annual",  name: "Annual",  price: 47.88, features: ["Everything in Monthly", "2 months free", "Print drop", "2 streams"], pop: true, savings: "2 months free" },
    ],
    upcoming: [
      { id: "u1", title: "The Grid", creatorId: "hara", date: "2026-08-04", kind: "series" },
      { id: "u2", title: "Coastline", creatorId: "park", date: "2026-07-01", kind: "film" },
    ],
    submissions: [],
    monthlyRevenue: [22_400, 25_100, 28_400, 31_200, 33_800, 36_400, 39_200, 41_120],
  },
  {
    id: "kitchen",
    name: "KITCHEN",
    verified: true,
    tagline: "Slow films. Long sentences. Cream paper.",
    description: "Literary-fiction filmmakers. Dialogue-driven, character-focused, often quiet. Members write the year's best slow movies.",
    color: tkc("ink-3"),
    accent: tkc("line-2"),
    theme: "Kitchen",
    founded: "2025-02",
    members: ["sten", "roan"],
    leadId: "sten",
    splits: { sten: 50, roan: 50 },
    subs: 4_320,
    mrr: 21_557,
    arpu: 4.99,
    churn: 4.1,
    growth30d: 6.2,
    plans: [
      { id: "monthly", name: "Monthly", price: 4.99, features: ["All Kitchen films", "Director essays", "1 stream"], pop: true },
      { id: "annual",  name: "Annual",  price: 47.88, features: ["Everything in Monthly", "2 months free", "First-edition essay collection", "2 streams"], pop: false, savings: "2 months free" },
    ],
    upcoming: [
      { id: "u1", title: "Soft Errors", creatorId: "sten", date: "2026-09-30", kind: "film" },
    ],
    submissions: [],
    monthlyRevenue: [12_800, 14_200, 15_600, 17_100, 18_400, 19_800, 20_800, 21_557],
  },
  {
    id: "plains",
    name: "PLAINS",
    verified: true,
    tagline: "Wide horizons. Thin air. Patience as method.",
    description: "Slow cinema, landscape-driven. Long takes, natural light, a lot of weather. Two filmmakers.",
    color: tkc("amber-d"),
    accent: tkc("warn"),
    theme: "Plains",
    founded: "2025-07",
    members: ["ykim", "aika"],
    leadId: "ykim",
    splits: { ykim: 50, aika: 50 },
    subs: 3_180,
    mrr: 15_868,
    arpu: 4.99,
    churn: 3.8,
    growth30d: 9.1,
    plans: [
      { id: "monthly", name: "Monthly", price: 4.99, features: ["All Plains films", "Field journals", "1 stream"], pop: true },
      { id: "annual",  name: "Annual",  price: 47.88, features: ["Everything in Monthly", "2 months free", "Print drop", "2 streams"], pop: false, savings: "2 months free" },
    ],
    upcoming: [
      { id: "u1", title: "The Fence (S2)", creatorId: "ykim", date: "2026-10-14", kind: "series" },
    ],
    submissions: [],
    monthlyRevenue: [9_400, 10_200, 11_400, 12_600, 13_400, 14_200, 15_100, 15_868],
  },
];

function getStudiosForCreator(creatorId) { return STUDIOS.filter(s => s.members.includes(creatorId)); }

// Whether the current user has subscribed to a studio
const USER_STUDIO_SUBS = ["darkroom"]; // user is subbed to darkroom

Object.assign(window, { STUDIOS, getStudiosForCreator, USER_STUDIO_SUBS });
