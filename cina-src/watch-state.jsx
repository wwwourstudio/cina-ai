// watch-state.jsx — Global mutable session: auth, watchlist, continue-watching,
// notifications, comments, bids, premiere RSVPs, royalty claims.
// Premium state lives in watch-ads.jsx (usePremium/setPremium there).

const { useState: usSe, useEffect: ueSe } = React;

// ─── Pub/sub for session bumps ────────────────────────────────────────
const _sessSubs = new Set();
function bumpSession() {
  // SESSION is a stable singleton, so consumers can't diff it by identity.
  // A version counter gives memos something real to depend on.
  if (window.SESSION) window.SESSION.v = (window.SESSION.v || 0) + 1;
  _sessSubs.forEach(fn => fn(Date.now()));
}

function useSession() {
  const [, setT] = usSe(0);
  ueSe(() => {
    _sessSubs.add(setT);
    return () => _sessSubs.delete(setT);
  }, []);
  return window.SESSION;
}

// ─── localStorage keys ───────────────────────────────────────────────
const SK = {
  signedIn:   "cina:signed-in",
  email:      "cina:email",
  handle:     "cina:handle",
  watchlist:  "cina:watchlist",
  continued:  "cina:continued",
  ratings:    "cina:ratings",
  comments:   "cina:comments",
  notifsRead: "cina:notifs-read",
  rsvps:      "cina:rsvps",
  bids:       "cina:bids",
  followed:   "cina:followed",
  tips:       "cina:tips",
  payouts:    "cina:claimed-payouts",
};

function _ls(k, init) {
  try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : init; } catch { return init; }
}
function _save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function _t(opts) { if (window.toast) window.toast(opts); }
function _money(n) { return window.fmtUSD ? window.fmtUSD(n) : "$" + Math.round(n); }

// ─── Build initial SESSION on load ────────────────────────────────────
const SESSION = {
  v: 0,
  // Identity is owned by the shared Cina ID (cina-identity.jsx). Read the
  // canonical signed-in/handle/email from CINA so Watch agrees with every
  // other surface; fall back to legacy localStorage if CINA isn't present.
  signedIn:  window.CINA ? window.CINA.signedIn : _ls(SK.signedIn, false),
  email:     window.CINA ? window.CINA.email    : _ls(SK.email, ""),
  handle:    window.CINA ? window.CINA.handle   : _ls(SK.handle, ""),
  watchlist: _ls(SK.watchlist, (window.USER?.watchlist || []).slice()),
  continued: _ls(SK.continued, [
    { filmId: "ll", ep: 4, t: 1700, dur: 2640, at: Date.now() - 1000*60*60*3 },
    { filmId: "marauder", ep: 2, t: 1450, dur: 3240, at: Date.now() - 1000*60*60*26 },
    { filmId: "frequency", t: 2200, dur: 5880, at: Date.now() - 1000*60*60*72 },
  ]),
  ratings:   _ls(SK.ratings, {}),
  comments:  _ls(SK.comments, {
    ll: [
      { id: "c1", author: "marlen.eth",  when: Date.now()-1000*60*22,    body: "The seventh frame moment broke me. Voss is operating on another plane.", likes: 142 },
      { id: "c2", author: "io.cina.eth", when: Date.now()-1000*60*60*3,  body: "If you're not catching the radio cues in episode 3 you're missing half the story.", likes: 88 },
      { id: "c3", author: "kira_yuen",   when: Date.now()-1000*60*60*9,  body: "Episode 5 better not be the last one without Nadya speaking. Five episodes of silence is doing things to me.", likes: 31 },
    ],
  }),
  notifsRead: _ls(SK.notifsRead, []),
  rsvps:      _ls(SK.rsvps, []),
  bids:       _ls(SK.bids, {}),
  followed:   _ls(SK.followed, (window.USER?.followingCreators || []).slice()),
  tips:       _ls(SK.tips, []),
  payouts:    _ls(SK.payouts, []),
};

// ─── Auth ─────────────────────────────────────────────────────────────
function signIn({ email, handle, method }) {
  SESSION.signedIn = true;
  SESSION.email = email || SESSION.email;
  SESSION.handle = handle || SESSION.handle || (email ? email.split("@")[0] : "you");
  _save(SK.signedIn, true); _save(SK.email, SESSION.email); _save(SK.handle, SESSION.handle);
  // Propagate to the shared Cina ID so every surface sees the sign-in.
  if (window.cinaSync) window.cinaSync({ signedIn: true, handle: SESSION.handle, email: SESSION.email });
  bumpSession();
  _t({ title: "WELCOME", text: `Signed in${method ? " · " + method : ""}`, kind: "good" });
}
function signOut() {
  SESSION.signedIn = false;
  _save(SK.signedIn, false);
  if (window.cinaSync) window.cinaSync({ signedIn: false });
  bumpSession();
  _t({ title: "SIGNED OUT", text: "See you on the next drop", kind: "info" });
}

// ─── Watchlist ────────────────────────────────────────────────────────
function isOnWatchlist(filmId) { return SESSION.watchlist.includes(filmId); }
function toggleWatchlist(filmId) {
  if (!SESSION.signedIn) { openSignIn(); return; }
  const on = isOnWatchlist(filmId);
  SESSION.watchlist = on ? SESSION.watchlist.filter(x => x !== filmId) : [...SESSION.watchlist, filmId];
  _save(SK.watchlist, SESSION.watchlist);
  bumpSession();
  const film = (window.CATALOG || []).find(f => f.id === filmId);
  _t({ title: on ? "REMOVED" : "ADDED", text: on ? `${film?.title || "Title"} removed from watchlist` : `${film?.title || "Title"} saved to watchlist`, kind: on ? "info" : "good" });
}

// ─── Continue watching ────────────────────────────────────────────────
function getProgress(filmId, ep) {
  return SESSION.continued.find(c => c.filmId === filmId && c.ep === ep);
}

// ─── Notifications ────────────────────────────────────────────────────
function _alertId(a) { return `${a.kind}:${a.text.slice(0,30)}`; }
function unreadNotifs() {
  const all = (window.USER?.alerts || []);
  return all.filter(a => !SESSION.notifsRead.includes(_alertId(a))).length;
}
function markAllNotifsRead() {
  const ids = (window.USER?.alerts || []).map(_alertId);
  SESSION.notifsRead = Array.from(new Set([...SESSION.notifsRead, ...ids]));
  _save(SK.notifsRead, SESSION.notifsRead);
  bumpSession();
}
function markNotifRead(a) {
  const id = _alertId(a);
  if (!SESSION.notifsRead.includes(id)) {
    SESSION.notifsRead = [...SESSION.notifsRead, id];
    _save(SK.notifsRead, SESSION.notifsRead);
    bumpSession();
  }
}
function isNotifRead(a) { return SESSION.notifsRead.includes(_alertId(a)); }

// ─── Ratings + comments ──────────────────────────────────────────────
function setRating(filmId, n) {
  if (!SESSION.signedIn) { openSignIn(); return; }
  SESSION.ratings = { ...SESSION.ratings, [filmId]: n };
  _save(SK.ratings, SESSION.ratings);
  bumpSession();
  _t({ title: "RATED", text: `You rated this ${n}/5`, kind: "good" });
}
function getRating(filmId) { return SESSION.ratings[filmId] || 0; }
function postComment(filmId, body) {
  if (!SESSION.signedIn) { openSignIn(); return; }
  if (!body.trim()) return;
  const next = { ...SESSION.comments };
  const arr = next[filmId] ? [...next[filmId]] : [];
  arr.unshift({ id: "u" + Date.now(), author: SESSION.handle || "you", when: Date.now(), body: body.trim(), likes: 0, mine: true });
  next[filmId] = arr;
  SESSION.comments = next;
  _save(SK.comments, SESSION.comments);
  bumpSession();
}
function likeComment(filmId, commentId) {
  const arr = (SESSION.comments[filmId] || []).map(c => c.id === commentId ? { ...c, likes: c.likes + (c._liked ? -1 : 1), _liked: !c._liked } : c);
  SESSION.comments = { ...SESSION.comments, [filmId]: arr };
  _save(SK.comments, SESSION.comments);
  bumpSession();
}
function getComments(filmId) { return SESSION.comments[filmId] || []; }

// ─── Bids ─────────────────────────────────────────────────────────────
function placeBid(auctionId, usd) {
  if (!SESSION.signedIn) { openSignIn(); return false; }
  SESSION.bids = { ...SESSION.bids, [auctionId]: Math.max(SESSION.bids[auctionId] || 0, usd) };
  _save(SK.bids, SESSION.bids);
  bumpSession();
  _t({ title: "BID PLACED", text: `${_money(usd)} · You're now top bidder`, kind: "good" });
  return true;
}

// ─── Follow / tip creator ─────────────────────────────────────────────
function isFollowing(creatorId) { return SESSION.followed.includes(creatorId); }
function toggleFollow(creatorId) {
  if (!SESSION.signedIn) { openSignIn(); return; }
  const on = isFollowing(creatorId);
  SESSION.followed = on ? SESSION.followed.filter(x => x !== creatorId) : [...SESSION.followed, creatorId];
  _save(SK.followed, SESSION.followed);
  bumpSession();
  _t({ title: on ? "UNFOLLOWED" : "FOLLOWING", text: on ? "" : "We'll alert you on new drops", kind: on ? "info" : "good" });
}
function recordTip(creatorId, amount) {
  if (!SESSION.signedIn) { openSignIn(); return; }
  SESSION.tips = [...SESSION.tips, { creatorId, amount, at: Date.now() }];
  _save(SK.tips, SESSION.tips);
  if (window.USER) window.USER.walletUSD = Math.max(0, (window.USER.walletUSD || 0) - amount);
  bumpSession();
  _t({ title: "TIP SENT", text: `${_money(amount)} to creator`, kind: "good" });
}

// ─── Royalty payouts ──────────────────────────────────────────────────
function claimPayout(bucket, amount) {
  if (SESSION.payouts.includes(bucket)) {
    _t({ title: "ALREADY CLAIMED", text: "This payout is already in your wallet", kind: "info" });
    return;
  }
  SESSION.payouts = [...SESSION.payouts, bucket];
  _save(SK.payouts, SESSION.payouts);
  if (window.USER) window.USER.walletUSD = (window.USER.walletUSD || 0) + amount;
  bumpSession();
  _t({ title: "CLAIMED", text: `+${_money(amount)} into wallet`, kind: "good" });
}

// ─── Modal openers (registered by the host) ──────────────────────────
let _signInOpener = null;
function registerSignInOpener(fn) { _signInOpener = fn; }
function openSignIn(opts) { if (_signInOpener) _signInOpener(opts || {}); else _t({title:"SIGN IN", text:"Sign-in not available yet."}); }

let _tipOpener = null;
function registerTipOpener(fn) { _tipOpener = fn; }
function openTipModal(creator) { if (_tipOpener) _tipOpener(creator); }

let _buyCryptoOpener = null;
function registerBuyCryptoOpener(fn) { _buyCryptoOpener = fn; }
function openBuyCrypto(opts) { if (_buyCryptoOpener) _buyCryptoOpener(opts || {}); else window.navigate?.("/wallet/buy"); }

let _claimOpener = null;
function registerClaimOpener(fn) { _claimOpener = fn; }
function openClaim(opts) { if (_claimOpener) _claimOpener(opts || {}); }

let _bidOpener = null;
function registerBidOpener(fn) { _bidOpener = fn; }
function openBidModal(auction) { if (_bidOpener) _bidOpener(auction); }

let _partyOpener = null;
function registerPartyOpener(fn) { _partyOpener = fn; }
function openCreateParty(film) { if (_partyOpener) _partyOpener(film); }

// Expose globally
Object.assign(window, { SESSION, useSession, bumpSession, signIn, signOut, isOnWatchlist, toggleWatchlist, getProgress, unreadNotifs, markAllNotifsRead, markNotifRead, isNotifRead, setRating, getRating, postComment, likeComment, getComments, placeBid, isFollowing, toggleFollow, recordTip, claimPayout, openSignIn, registerSignInOpener, openTipModal, registerTipOpener, openBuyCrypto, registerBuyCryptoOpener, openClaim, registerClaimOpener, openBidModal, registerBidOpener, openCreateParty, registerPartyOpener });
