// premiere-kit.jsx — The Watch layout system. Every browse + detail page is built
// from these parts so pages share one grammar: Masthead or Hero → Architectural
// Sections → Rails/Grids of refined cinema cards.

const { useState: usPm, useEffect: uePm, useRef: urPm, useMemo: umPm } = React;

(function pmCss() {
  const existing = document.getElementById("pm-css");
  if (existing) existing.remove();
  const s = document.createElement("style");
  s.id = "pm-css";
  s.textContent = `
.pm{width:100%;--pm-edge:4.5%;--pm-poster:15.4%;--pm-still:28.5%;--pm-person:14%;--pm-studio:28.5%;--pm-r:2px;padding-bottom:calc(var(--sec-gap) + 2rem)}
.pm-wrap{margin:0;padding:0 var(--pm-edge);width:100%;box-sizing:border-box}
.pm-k{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--c-ink-3)}
.pm-k b{color:var(--c-amber);font-weight:600}
.pm-xl{font-family:var(--f-display);font-style:italic;font-weight:400;font-size:clamp(2.4rem,5vw,5.1rem)!important;line-height:.96!important;letter-spacing:-0.025em!important;margin:0;text-wrap:balance}
.pm-h2{font-family:var(--f-display);font-style:italic;font-weight:400;font-size:clamp(1.35rem,1.85vw,1.95rem);line-height:1.12;letter-spacing:-0.015em;margin:0}
.pm-lede{font-size:clamp(0.92rem,1.06vw,1.06rem);line-height:1.62;color:var(--c-ink-2);margin:0;max-width:60ch;text-wrap:pretty}
/* Masthead */
.pm-mast{padding-top:clamp(2rem,4vw,3.75rem);padding-bottom:0.5rem;display:flex;flex-direction:column;gap:0.85rem}
.pm-mast--bare{padding-top:clamp(1.5rem,3vw,3rem)}
.pm-mast__top{display:flex;justify-content:space-between;gap:1rem}
.pm-mast__top>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-mast__body{display:flex;flex-direction:column;gap:0.7rem}
.pm-mast .pm-xl{font-size:clamp(2.15rem,4vw,4rem)!important}
.pm-mast__tools{display:flex;flex-wrap:wrap;gap:0;align-items:center;margin-top:0.65rem;border-bottom:1px solid var(--c-line)}
/* Full-bleed Hero — percentage/vh flex layout prevents clipping at any viewport ratio */
.pm-hero{position:relative;width:100%;min-height:72vh;height:auto;display:flex;align-items:flex-end;padding:13vh 0 5.5vh;overflow:hidden;background:var(--c-black);isolation:isolate;border-bottom:1px solid var(--c-line)}
.pm-hero--short{min-height:56vh;padding:11vh 0 4.5vh}
.pm-hero__img{position:absolute;inset:0;z-index:-2;transition:opacity 1.1s ease;width:100%;height:100%}
.pm-hero__img>*{width:100%;height:100%;object-fit:cover}
.pm-hero__img.is-on>*{animation:pmKen 16s ease-out forwards}
.pm-hero__scrim{position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,var(--c-bg) 0%,rgba(10,10,10,.72) 28%,rgba(10,10,10,.16) 65%),linear-gradient(90deg,rgba(10,10,10,.92) 0%,rgba(10,10,10,.55) 42%,rgba(10,10,10,.12) 78%),linear-gradient(180deg,rgba(10,10,10,.58) 0%,rgba(10,10,10,0) 20%)}
.pm-hero__body{position:relative;z-index:2;width:100%}
.pm-hero--home{min-height:84vh;padding:13vh 0 5.5vh}
.pm-hero--home .pm-xl{font-size:clamp(2.9rem,6vw,6.4rem)!important;line-height:.92!important;letter-spacing:-0.032em!important}
.pm-hero--home .pm-hero__main{max-width:44rem;gap:0.9rem}
.pm-hero--home .pm-hero__scrim{background:linear-gradient(0deg,var(--c-bg) 0%,rgba(10,10,10,.76) 24%,rgba(10,10,10,.15) 60%),linear-gradient(90deg,rgba(10,10,10,.94) 0%,rgba(10,10,10,.64) 38%,rgba(10,10,10,.22) 74%),linear-gradient(180deg,rgba(10,10,10,.6) 0%,rgba(10,10,10,0) 16%)}
.pm-hero__note{padding-top:0.75rem;border-top:1px solid rgba(255,255,255,.14);margin-top:0.35rem;max-width:48ch}
.pm-hero__note .pm-note{font-size:clamp(0.88rem,1vw,1rem);color:var(--c-ink-2)}
.pm-hero__note cite{margin-top:0.35rem}
.pm-hero__grid{display:grid;grid-template-columns:minmax(0,62%) minmax(0,34%);justify-content:space-between;gap:4%;align-items:end;width:100%}
.pm-hero__main{display:flex;flex-direction:column;gap:0.85rem;max-width:44rem;animation:pmRise .5s ease both}
.pm-hero__main .pm-xl{text-shadow:0 4px 40px rgba(0,0,0,.55)}
.pm-hero__main .pm-lede{color:var(--c-ink);text-shadow:0 1px 14px rgba(0,0,0,.65);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pm-hero__meta{display:flex;flex-wrap:wrap;align-items:center;gap:0.25rem 0;font-size:var(--fs-body);color:var(--c-ink-2)}
.pm-hero__meta>span{display:inline-flex;align-items:center;white-space:nowrap}
.pm-hero__meta>span+span::before{content:"·";color:var(--c-ink-4);margin:0 0.6rem}
.pm-hero__aside{justify-self:end;width:100%;padding-top:0.85rem;border-top:1px solid rgba(255,255,255,.16)}
.pm-note{margin:0;font-family:var(--f-display);font-style:italic;font-size:clamp(0.95rem,1.1vw,1.12rem);line-height:1.45;color:var(--c-ink-2);text-wrap:pretty}
.pm-note cite{display:block;margin-top:0.55rem;font-style:normal;font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--c-ink-3)}
.pm-actions{display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;margin-top:0.35rem}
.pm-over{position:relative;z-index:3;margin-top:0}
.pm-over>.pm-sec:first-child{margin-top:clamp(1.75rem,3vw,2.75rem)}
/* Home Hero Programme Strip */
.pm-prog-strip{display:flex;flex-direction:column;gap:0;width:100%;background:rgba(10,10,12,.72);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.12);border-radius:0}
.pm-prog-strip__head{display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0.85rem;border-bottom:1px solid rgba(255,255,255,.1);font-family:var(--f-mono);font-size:0.65rem;letter-spacing:.16em;text-transform:uppercase;color:var(--c-ink-3)}
.pm-prog-item{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1.6rem 3.8rem minmax(0,1fr) auto;align-items:center;gap:0.7rem;padding:0.6rem 0.85rem;border-bottom:1px solid rgba(255,255,255,.08);position:relative;transition:background .16s ease;width:100%;border-radius:0!important}
.pm-prog-item:last-child{border-bottom:none}
.pm-prog-item:hover{background:rgba(255,255,255,.05)}
.pm-prog-item[data-on="1"]{background:rgba(255,255,255,.08)}
.pm-prog-item__thumb{width:3.8rem;aspect-ratio:16/9;overflow:hidden;position:relative;background:var(--c-panel-2)}
.pm-prog-item__thumb>*{width:100%;height:100%;object-fit:cover}
.pm-prog-item__bar{position:absolute;left:0;right:0;bottom:0;height:2px;background:transparent;overflow:hidden}
.pm-prog-item[data-on="1"] .pm-prog-item__bar{background:rgba(255,255,255,.14)}
.pm-prog-item[data-on="1"] .pm-prog-item__bar>span{display:block;height:100%;background:var(--c-amber);animation:pmFill 8s linear forwards}
.pm-prog-item[data-paused="1"] .pm-prog-item__bar>span{animation:none;width:100%}
/* Home Discovery Bar — zero radius architectural hairline bar */
.pm-home-bar{position:sticky;top:3.75rem;z-index:7;width:100%;background:rgba(10,10,12,.92);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--c-line)}
.pm-home-bar__inner{display:flex;align-items:center;justify-content:space-between;gap:1.25rem;overflow-x:auto;scrollbar-width:none}
.pm-home-bar__inner::-webkit-scrollbar{display:none}
.pm-home-bar__tabs{display:flex;align-items:center;gap:clamp(1rem,2vw,1.85rem)}
.pm-home-bento{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.4%;width:100%}
.pm-bento-card{all:unset;box-sizing:border-box;cursor:pointer;position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:13.5rem;padding:1.25rem;overflow:hidden;background:var(--c-panel);border:1px solid var(--c-line);transition:border-color .2s ease,transform .22s cubic-bezier(.16,1,.3,1)}
.pm-bento-card:hover{border-color:rgba(var(--accent-rgb),.55);transform:translateY(-2px)}
.pm-bento-card__bg{position:absolute;inset:0;z-index:0;opacity:.52;transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .25s ease}
.pm-bento-card:hover .pm-bento-card__bg{transform:scale(1.04);opacity:.68}
.pm-bento-card__bg>*{width:100%;height:100%;object-fit:cover}
.pm-bento-card__scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,rgba(8,8,10,.95) 0%,rgba(8,8,10,.62) 52%,rgba(8,8,10,.18) 100%)}
.pm-bento-card__body{position:relative;z-index:2;display:flex;flex-direction:column;gap:0.4rem}
/* Facts */
.pm-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(10.5rem,1fr));gap:1.25rem 2.5%;margin:0;width:100%}
.pm-facts>div{display:flex;flex-direction:column;gap:0.35rem;min-width:0}
.pm-facts dt{font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.14em;text-transform:uppercase;color:var(--c-ink-3)}
.pm-facts dd{margin:0;font-size:var(--fs-body);color:var(--c-ink);line-height:1.45;font-variant-numeric:tabular-nums}
/* Architectural Buttons + Filter Controls (Zero-radius on lined menus/tabs) */
.pm-btn{height:2.65rem;padding:0 1.2rem;display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;border-radius:2px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:var(--c-ink);font-family:var(--f-sans);font-size:var(--fs-body);font-weight:500;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,color .15s,transform .15s}
.pm-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.32)}
.pm-btn:active{transform:scale(.985)}
.pm-btn--primary{background:var(--c-amber);border-color:var(--c-amber);color:var(--c-on-amber);font-weight:600;padding:0 1.45rem}
.pm-btn--primary:hover{background:var(--c-amber-x);border-color:var(--c-amber-x)}
.pm-btn--glass{background:rgba(12,12,14,.62);border-color:rgba(255,255,255,.2);backdrop-filter:blur(14px)}
.pm-btn--on{border-color:var(--c-amber);color:var(--c-amber)}
.pm-btn--sm{height:2.1rem;padding:0 0.85rem;font-size:0.8rem}
.pm-btn--icon{width:2.65rem;padding:0;border-radius:2px}
.pm-btn--icon.pm-btn--sm{width:2.1rem}
.pm-link{background:none;border:none;border-radius:0;padding:0;color:var(--c-ink-3);font-family:var(--f-sans);font-size:var(--fs-body);font-weight:500;cursor:pointer;white-space:nowrap;transition:color .15s;display:inline-flex;align-items:center;gap:0.25rem}
.pm-link:hover{color:var(--c-ink)}
/* Hairline Filter Tabs (replaces rounded pills — strict 0 corner radius) */
.pm-chip{height:2.25rem;padding:0 0.85rem;border-radius:0!important;border:none;border-bottom:2px solid transparent;background:transparent;color:var(--c-ink-3);font-family:var(--f-sans);font-size:var(--fs-body);font-weight:500;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:0.4rem;transition:color .15s,border-color .15s,background .15s}
.pm-chip:hover{color:var(--c-ink);background:rgba(255,255,255,.03)}
.pm-chip[data-on="1"]{border-bottom-color:var(--c-amber);color:var(--c-ink);font-weight:600;background:transparent}
.pm-sep{width:1px;height:1.15rem;background:var(--c-line-2);margin:0 0.35rem}
.pm-more{position:relative;display:inline-flex}
.pm-more__menu{position:absolute;bottom:calc(100% + 0.5rem);left:0;min-width:14rem;background:rgba(14,14,16,.98);backdrop-filter:blur(20px);border:1px solid var(--c-line-2);border-radius:0!important;padding:0.25rem 0;box-shadow:0 24px 60px rgba(0,0,0,.68);display:flex;flex-direction:column;gap:0;z-index:30;animation:pmRise .16s ease both}
.pm-more__menu .pm-btn{justify-content:flex-start;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.05);height:2.4rem;border-radius:0!important;backdrop-filter:none;padding:0 0.9rem;width:100%}
.pm-more__menu .pm-btn:last-child{border-bottom:none}
.pm-more__menu .pm-btn:hover{background:rgba(255,255,255,.07)}
.pm-more__menu .pm-btn--primary{color:var(--c-amber)}
/* Architectural Hairline Tabs — strict 0 corner radius */
.pm-tabs{position:sticky;top:3.75rem;z-index:6;background:rgba(10,10,12,.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--c-line);border-radius:0!important;margin-top:0;width:100%}
.pm-tabs .pm-wrap{display:flex;gap:clamp(1.25rem,2.4vw,2.25rem);overflow-x:auto;scrollbar-width:none}
.pm-tab{all:unset;cursor:pointer;padding:0.95rem 0 0.85rem;font-size:var(--fs-body);font-weight:500;color:var(--c-ink-3);border-bottom:2px solid transparent;border-radius:0!important;white-space:nowrap;transition:color .15s}
.pm-tab:hover{color:var(--c-ink)}
.pm-tab[data-on="1"]{color:var(--c-ink);border-bottom-color:var(--c-amber);font-weight:600}
.pm-tab:focus-visible{outline:2px solid var(--c-ink);outline-offset:2px}
/* Sections */
.pm-sec{margin-top:clamp(2rem,3.6vw,3.25rem);width:100%}
.pm-sec__head{display:flex;justify-content:space-between;align-items:flex-end;gap:1.25rem;margin-bottom:1.1rem;padding-bottom:0.65rem;border-bottom:1px solid var(--c-line);border-radius:0!important}
.pm-sec__titles{display:flex;flex-direction:column;gap:0.3rem;min-width:0}
.pm-sec__note{font-size:var(--fs-label);color:var(--c-ink-3);font-family:var(--f-mono);letter-spacing:.09em;text-transform:uppercase}
.pm-sec__quote{margin:0;font-family:var(--f-display);font-style:italic;font-size:var(--fs-body);color:var(--c-ink-2);max-width:70ch}
.pm-sec__quote cite{font-style:normal;font-family:var(--f-mono);font-size:var(--fs-label);letter-spacing:.12em;text-transform:uppercase;color:var(--c-ink-4);margin-left:0.6rem}
.pm-sec__tools{display:flex;align-items:center;gap:0.45rem;flex-shrink:0}
.pm-arrow{width:1.95rem;height:1.95rem;border-radius:0;border:1px solid var(--c-line-2);background:transparent;color:var(--c-ink-2);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;opacity:.85;transition:opacity .2s,border-color .15s,color .15s,background .15s}
.pm-arrow:hover{border-color:var(--c-ink);color:var(--c-ink);background:rgba(255,255,255,.04);opacity:1}
@media (hover:none){.pm-arrow{display:none}}
/* Percentage-Scaled Rails & Grids */
.pm-rail{display:grid;grid-auto-flow:column;grid-auto-columns:var(--pm-col,var(--pm-poster));gap:1.35%;overflow-x:auto;overflow-y:visible;scroll-snap-type:x mandatory;scrollbar-width:none;scroll-padding-left:var(--pm-edge);padding:0.5rem var(--pm-edge) 0.85rem;margin:-0.5rem calc(var(--pm-edge) * -1) -0.85rem}
.pm-rail::-webkit-scrollbar{display:none}
.pm-rail>*{scroll-snap-align:start}
.pm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--pm-min,15.5%),1fr));gap:2.8vh 1.4%;width:100%}
.pm-grid--wide{grid-template-columns:repeat(auto-fill,minmax(28.5%,1fr));gap:3vh 1.8%}
/* Refined Cinema Cards — zero clunky orange blocks or giant corner squares */
.pm-card{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:0.55rem;cursor:pointer;min-width:0;width:100%;color:var(--c-ink)}
.pm-card:focus-visible .pm-card__img{outline:2px solid var(--c-amber);outline-offset:3px}
.pm-card__img{position:relative;width:100%;overflow:hidden;background:var(--c-panel-2);border-radius:1px;transition:transform .28s cubic-bezier(.16,1,.3,1),box-shadow .28s cubic-bezier(.16,1,.3,1)}
.pm-card:hover .pm-card__img{transform:translateY(-3px);box-shadow:0 18px 42px rgba(0,0,0,.62)}
.pm-card__img>.pm-fill{position:absolute;inset:0;width:100%;height:100%;transition:transform .45s cubic-bezier(.16,1,.3,1)}
.pm-card:hover .pm-card__img>.pm-fill{transform:scale(1.035)}
.pm-card__img>.pm-fill>*{width:100%;height:100%;object-fit:cover}
.pm-card__img img,.pm-card__img video{width:100%;height:100%;object-fit:cover;display:block}
.pm-card__img::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09);border-radius:inherit;pointer-events:none;z-index:4;transition:box-shadow .22s ease}
.pm-card:hover .pm-card__img::after{box-shadow:inset 0 0 0 1px rgba(var(--accent-rgb),.45)}
/* Widescreen Still Bottom Overlay */
.pm-card__over{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:2.4rem 0.9rem 0.75rem;background:linear-gradient(0deg,rgba(8,8,10,.92) 0%,rgba(8,8,10,.45) 55%,rgba(8,8,10,0) 100%);display:flex;align-items:flex-end;justify-content:space-between;gap:0.65rem}
.pm-card__ot{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-family:var(--f-display);font-style:italic;font-size:clamp(1.02rem,1.3vw,1.3rem);line-height:1.14;letter-spacing:-0.01em;color:var(--c-ink);text-shadow:0 1px 12px rgba(0,0,0,.75)}
.pm-card__cue{display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.5rem;background:rgba(10,10,12,.76);backdrop-filter:blur(10px);border:1px solid rgba(var(--accent-rgb),.42);border-radius:1px;font-family:var(--f-mono);font-size:0.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-amber);opacity:0;transform:translateX(-4px);transition:opacity .2s ease,transform .2s ease;flex-shrink:0}
.pm-card:hover .pm-card__cue{opacity:1;transform:none}
/* Poster Darkroom Hover Curtain */
.pm-card__curtain{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0.85rem;background:linear-gradient(0deg,rgba(8,8,10,.95) 0%,rgba(8,8,10,.72) 44%,rgba(8,8,10,.06) 100%);opacity:0;transition:opacity .22s ease;pointer-events:none}
.pm-card:hover .pm-card__curtain,.pm-card:focus-visible .pm-card__curtain{opacity:1}
.pm-card__dir{font-family:var(--f-mono);font-size:0.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-amber);margin-bottom:0.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-card__log{font-size:0.76rem;line-height:1.38;color:var(--c-ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:0.55rem}
.pm-card__foot{display:flex;align-items:center;justify-content:space-between;padding-top:0.45rem;border-top:1px solid rgba(255,255,255,.14);font-family:var(--f-mono);font-size:0.64rem;letter-spacing:.12em;text-transform:uppercase;color:var(--c-ink)}
.pm-card__foot span{display:inline-flex;align-items:center;gap:0.32rem}
.pm-card__t{font-family:var(--f-sans);font-size:var(--fs-body);font-weight:500;line-height:1.3;color:var(--c-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color .15s}
.pm-card:hover .pm-card__t{color:var(--c-amber-x)}
.pm-card__m{font-size:var(--fs-label);line-height:1.35;min-height:1.35em;color:var(--c-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.pm-card__s{font-size:var(--fs-body);line-height:1.48;color:var(--c-ink-3);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
/* Understated Dark-Glass Status Tag (never solid loud orange) */
.pm-badge{position:absolute;top:0.5rem;left:0.5rem;z-index:3;font-family:var(--f-mono);font-size:0.6rem;letter-spacing:.13em;text-transform:uppercase;padding:0.18rem 0.45rem;background:rgba(10,10,12,.76);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:var(--c-ink-2);border:1px solid rgba(255,255,255,.14);border-radius:1px;line-height:1.2}
.pm-badge--red{background:rgba(12,10,10,.82);border-color:rgba(var(--accent-rgb),.45);color:var(--c-amber);font-weight:600}
/* Minimal Dark-Glass Architectural Bookmark Ribbon (zero bulky circles or solid orange squares) */
.pm-quick{position:absolute;top:0.45rem;right:0.45rem;z-index:5;width:1.72rem;height:1.85rem;border-radius:1px;border:1px solid rgba(255,255,255,.16);background:rgba(10,10,12,.68);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--c-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transform:translateY(-2px);transition:opacity .18s ease,transform .18s ease,background .15s,color .15s,border-color .15s}
.pm-card:hover .pm-quick,.pm-card:focus-within .pm-quick,.pm-quick.is-on{opacity:1;transform:none}
.pm-quick:hover{background:rgba(16,16,20,.94);color:var(--c-ink);border-color:rgba(255,255,255,.45)}
.pm-quick.is-on{background:rgba(10,10,12,.86);border-color:rgba(var(--accent-rgb),.7);color:var(--c-amber);box-shadow:0 4px 12px rgba(0,0,0,.45)}
@media (hover:none){.pm-quick{opacity:1;transform:none}}
.pm-prog{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.2);z-index:3;overflow:hidden}
.pm-prog>span{display:block;height:100%;background:var(--c-amber)}
.pm-card__over:has(+.pm-prog){padding-bottom:1.1rem}
/* Top 10 Rank Card — Fixed percentage column ratio locks every poster at identical size and baseline */
.pm-rank{display:grid;grid-template-columns:30% minmax(0,70%);align-items:start;gap:0.25rem;width:100%}
.pm-rank>.pm-card{position:relative;z-index:1;width:100%}
.pm-rank__n{align-self:end;text-align:right;font-variant-numeric:tabular-nums;font-family:var(--f-display);font-style:italic;font-weight:400;font-size:clamp(2.8rem,4.6vw,4.9rem);line-height:.84;letter-spacing:-0.05em;color:transparent;-webkit-text-stroke:1.25px var(--c-ink-4);padding-bottom:2.35rem;user-select:none;transition:color .2s,-webkit-text-stroke-color .2s}
.pm-rank:hover .pm-rank__n{-webkit-text-stroke-color:var(--c-amber)}
/* Editorial + panels */
.pm-quote{display:grid;grid-template-columns:minmax(0,1fr);gap:0.85rem;padding:clamp(1.35rem,2.6vw,2.15rem);background:var(--c-panel);border:1px solid var(--c-line);border-left:2px solid var(--c-amber);border-radius:0}
.pm-quote blockquote{margin:0;font-family:var(--f-display);font-style:italic;font-size:clamp(1.15rem,1.75vw,1.65rem);line-height:1.38;letter-spacing:-0.01em;color:var(--c-ink);text-wrap:pretty;max-width:54ch}
.pm-index{display:grid;width:100%}
.pm-index>button,.pm-index>.pm-row{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:3rem minmax(0,1fr) auto;align-items:center;gap:2%;padding:0.95rem 0;border-top:1px solid var(--c-line);border-radius:0!important;width:100%}
.pm-index>button:last-child,.pm-index>.pm-row:last-child{border-bottom:1px solid var(--c-line)}
.pm-index__name{font-family:var(--f-display);font-style:italic;font-size:clamp(1.3rem,2.1vw,2rem);line-height:1.08;letter-spacing:-0.02em;transition:color .15s,transform .2s}
.pm-index>button:hover .pm-index__name,.pm-index>.pm-row:hover .pm-index__name{color:var(--c-amber);transform:translateX(4px)}
.pm-duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,44%),1fr));gap:2%;width:100%}
.pm-panel{background:var(--c-panel);border:1px solid var(--c-line);border-radius:2px;padding:clamp(1.15rem,2vw,1.6rem);width:100%;box-sizing:border-box}
.pm-stat{display:flex;flex-direction:column;gap:0.35rem;min-width:0}
.pm-stat__v{font-family:var(--f-display);font-style:italic;font-size:clamp(1.6rem,2.5vw,2.35rem);font-weight:400;line-height:1;letter-spacing:-0.02em;font-variant-numeric:tabular-nums}
.pm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(18%,1fr));gap:1.25rem 2%;width:100%}
/* Film Dossier 2-Column Overview */
.pm-dossier{display:grid;grid-template-columns:minmax(0,58%) minmax(0,37%);justify-content:space-between;gap:5%;align-items:start;width:100%}
.pm-dossier__specs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.5rem;padding:1.35rem;background:var(--c-panel);border:1px solid var(--c-line);border-top:2px solid rgba(var(--accent-rgb),.55)}
.pm-dossier__specs dt{font-family:var(--f-mono);font-size:0.65rem;letter-spacing:.15em;text-transform:uppercase;color:var(--c-ink-3);margin-bottom:0.25rem}
.pm-dossier__specs dd{margin:0;font-size:var(--fs-body);color:var(--c-ink);line-height:1.4}
.pm-dots{display:flex;gap:0.4rem;margin-top:1rem}
.pm-dot{all:unset;cursor:pointer;width:2rem;padding:0.45rem 0}
.pm-dot__bar{display:block;height:2px;border-radius:0;background:rgba(255,255,255,.25);overflow:hidden}
.pm-dot__bar>span{display:block;height:100%;background:var(--c-amber)}
.pm-dot[data-on="1"] .pm-dot__bar>span{animation:pmFill 8s linear forwards}
.pm-dot:focus-visible{outline:2px solid var(--c-ink);outline-offset:2px}
@keyframes pmRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes pmFill{from{width:0}to{width:100%}}
@keyframes pmKen{from{transform:scale(1)}to{transform:scale(1.06) translate(-1%,-1%)}}
@media (prefers-reduced-motion:reduce){.pm-hero__img.is-on>*{animation:none}}
/* Legacy Frame */
.pm-legacy{padding-bottom:var(--sec-gap);width:100%}
.pm-legacy h1{overflow-wrap:break-word;min-width:0}
.pm-legacy h1.t-display{font-style:italic;font-weight:400!important;font-size:clamp(2.2rem,4.2vw,4rem)!important;line-height:1!important;letter-spacing:-0.025em!important;text-wrap:balance}
.pm-legacy .btn{border-radius:2px}
.pm-empty{display:flex;flex-direction:column;gap:0.9rem;align-items:flex-start;padding:clamp(1.75rem,4vw,3.5rem) 0}
.pm-empty .pm-h2{font-size:clamp(1.35rem,2.2vw,1.9rem)}
.pm-search{display:flex;align-items:center;gap:1rem;border-bottom:1px solid var(--c-line-3);border-radius:0!important;padding:0.5rem 0 0.9rem;width:100%}
.pm-search:focus-within{border-bottom-color:var(--c-amber)}
.pm-search input{all:unset;flex:1;min-width:0;font-family:var(--f-display);font-style:italic;font-size:clamp(1.85rem,3.6vw,3.5rem);line-height:1.1;letter-spacing:-0.02em;color:var(--c-ink)}
.pm-search input::placeholder{color:var(--c-ink-4)}
.pm-row__act{display:flex;gap:0.5rem;align-items:center;justify-content:flex-end}
.pm-ep{display:grid;grid-template-columns:minmax(0,26%) minmax(0,1fr);gap:2.5%;align-items:center;padding:0.95rem 0;border-top:1px solid var(--c-line);border-radius:0!important;width:100%}
.pm-ep:last-child{border-bottom:1px solid var(--c-line)}
.pm-ep__t{font-family:var(--f-display);font-style:italic;font-size:clamp(1.2rem,1.6vw,1.5rem);line-height:1.15;margin:0}
@media (max-width:75em){.pm{--pm-poster:21.5%;--pm-still:38%;--pm-person:19%;--pm-studio:38%}.pm-grid{grid-template-columns:repeat(auto-fill,minmax(21.5%,1fr))}.pm-grid--wide{grid-template-columns:repeat(auto-fill,minmax(45%,1fr))}.pm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-home-bento{grid-template-columns:1fr 1fr}}
@media (max-width:58em){.pm-hero__grid,.pm-dossier{grid-template-columns:1fr;gap:1.75rem}.pm-hero__aside{display:none}.pm-hero{min-height:64vh}.pm-hero--home{min-height:auto;padding:7.5rem 0 2.5rem}.pm-ep{grid-template-columns:36% minmax(0,1fr)}.pm-duo,.pm-home-bento{grid-template-columns:1fr}}
@media (max-width:44em){.pm{--pm-edge:5%;--pm-poster:44%;--pm-still:82%;--pm-person:40%;--pm-studio:82%}.pm-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:2.2vh 3.5%}.pm-grid--wide{grid-template-columns:1fr}.pm-mast__top{flex-wrap:wrap;row-gap:0.4rem}.pm-mast__top>span{white-space:normal}.pm-hold{grid-template-columns:22% minmax(0,1fr)!important}.pm-hold .pm-card__img{width:100%!important}.pm-hold__stats{grid-column:1/-1;grid-template-columns:repeat(3,minmax(0,1fr))!important;text-align:left!important;gap:0.75rem!important}.pm-ep{grid-template-columns:1fr;gap:0.75rem}}
`;
  document.head.appendChild(s);
})();

// ── helpers ───────────────────────────────────────────────────────────
const pmDest = (f) => (window.gDest ? window.gDest(f) : (f.kind === "series" ? `/series/${f.id}` : `/film/${f.id}`));
const pmGo = (to) => window.navigate && window.navigate(to);
function pmScroller() { const b = document.body; return b.scrollHeight > b.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(b).overflowY) ? b : (document.scrollingElement || document.documentElement); }
function pmScrollTo(target, offset = 80) {
  const sc = pmScroller();
  if (typeof target === "number") { sc.scrollTo({ top: target, behavior: "smooth" }); return; }
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (el) sc.scrollBy({ top: el.getBoundingClientRect().top - offset, behavior: "smooth" });
}
const pmNum = (n) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K" : String(n);
const pmFilm = (id) => (window.CATALOG || []).find(f => f.id === id);
const pmCreatorName = (f) => (f?.creator || "").split("·")[0].trim();
function pmMeta(f, includeRating = false) {
  if (!f) return "";
  const parts = [
    f.year,
    (f.genre || [])[0],
    f.kind === "series" ? `S${f.season} · ${f.totalEpisodes} EP` : f.runtime,
    includeRating && f.rating ? `★ ${f.rating}` : null,
  ];
  return parts.filter(Boolean).join(" · ");
}
function pmProgress(f) {
  if (f.kind === "series") { const w = (f.series || []).find(e => e.watched > 0 && e.watched < 1); return w ? w.watched : 0; }
  try { const p = window.getProgress && window.getProgress(f.id); return p && p.dur ? Math.min(1, p.t / p.dur) : 0; } catch (_) { return 0; }
}
function useWatchlistTick() {
  const [, set] = usPm(0);
  return () => set(n => n + 1);
}

function PmImg({ kind, src, alt = "" }) {
  return <div className="pm-fill">{src ? <img src={src} alt={alt}/> : <FrameThumb kind={kind} usePhoto/>}</div>;
}

// ── Persistent viewer state: reminders + studio subscriptions ─────────
const PM_KEYS = { rem: "cina:pm-reminders", subs: "cina:pm-subs" };
function pmRead(key) { try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) { return {}; } }
function pmWrite(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} window.dispatchEvent(new Event("cina:pm-state")); }
function usePmState() {
  const [, set] = usPm(0);
  uePm(() => { const h = () => set(n => n + 1); window.addEventListener("cina:pm-state", h); window.addEventListener("storage", h); return () => { window.removeEventListener("cina:pm-state", h); window.removeEventListener("storage", h); }; }, []);
}
const pmHasReminder = (key) => !!pmRead(PM_KEYS.rem)[key];
function pmToggleReminder(key, info) {
  const r = pmRead(PM_KEYS.rem);
  if (r[key]) { delete r[key]; window.toast && toast({ title: "REMINDER REMOVED", text: info?.label || "" }); }
  else { r[key] = { ...info, at: Date.now() }; window.toast && toast({ title: "REMINDER SET", text: [info?.label, info?.date ? "· " + info.date.slice(5).replace("-", "/") : ""].join(" "), kind: "good" }); }
  pmWrite(PM_KEYS.rem, r);
}
const pmReminders = () => Object.entries(pmRead(PM_KEYS.rem)).map(([key, v]) => ({ key, ...v })).sort((a, b) => String(a.date || "9").localeCompare(String(b.date || "9")));
const pmIsSubbed = (id) => !!pmRead(PM_KEYS.subs)[id];
const pmSubs = () => Object.entries(pmRead(PM_KEYS.subs)).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.at - a.at);
function pmSetSub(id, info) { const s = pmRead(PM_KEYS.subs); s[id] = { ...info, at: Date.now() }; pmWrite(PM_KEYS.subs, s); }
async function pmCancelSub(id, name) {
  const ok = window.cinaConfirm ? await cinaConfirm({ kicker: "Subscription", title: `Cancel your ${name} subscription?`, body: "You keep access until the end of this billing month.", confirmLabel: "Cancel subscription" }) : true;
  if (!ok) return;
  const s = pmRead(PM_KEYS.subs); delete s[id]; pmWrite(PM_KEYS.subs, s);
  window.toast && toast({ title: "SUBSCRIPTION CANCELLED", text: name });
}

function PmRemindBtn({ k, info, glass, sm }) {
  usePmState();
  const on = pmHasReminder(k);
  return (
    <button className={"pm-btn" + (glass ? " pm-btn--glass" : "") + (sm ? " pm-btn--sm" : "") + (on ? " pm-btn--on" : "")} onClick={() => pmToggleReminder(k, info)}>
      <Icon name={on ? "check" : "bell"} size={13}/>{on ? "Reminder set" : "Remind me"}
    </button>
  );
}

function PmEmpty({ title, body, children }) {
  return <CinaEmpty title={title} body={body}>{children}</CinaEmpty>;
}

function PmCardShell({ onClick, label, children, className }) {
  return (
    <div className={"pm-card" + (className ? " " + className : "")} role="link" tabIndex={0} aria-label={label} onClick={onClick}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick && onClick(); } }}>
      {children}
    </div>
  );
}

function PmQuickAdd({ film }) {
  const bump = useWatchlistTick();
  if (!film || !film.id) return null;
  const on = window.isOnWatchlist && isOnWatchlist(film.id);
  return (
    <button className={"pm-quick" + (on ? " is-on" : "")} aria-label={on ? `Remove ${film.title} from watchlist` : `Save ${film.title} to watchlist`} title={on ? "Saved to My List" : "Save to My List"}
      onClick={(e) => { e.stopPropagation(); window.toggleWatchlist && toggleWatchlist(film.id); bump(); }}>
      <Icon name={on ? "bookmark-fill" : "bookmark"} size={13}/>
    </button>
  );
}

// ── Refined Cinema Cards ──────────────────────────────────────────────
function PmPoster({ film, badge, onClick, quick }) {
  if (!film) return null;
  const b = badge !== undefined ? badge : film.branched ? { t: "Branched", red: true } : film.free ? { t: "Free" } : film.nftPremiere ? { t: "Premiere" } : null;
  const dir = pmCreatorName(film);
  return (
    <PmCardShell className="pm-card--poster" onClick={onClick || (() => pmGo(pmDest(film)))} label={film.title}>
      <div className="pm-card__img" style={{ aspectRatio: "2 / 3", background: film.color }}>
        <PmImg kind={film.thumb}/>
        {b && <span className={"pm-badge" + (b.red ? " pm-badge--red" : "")}>{b.t}</span>}
        {quick !== false && <PmQuickAdd film={film}/>}
        <div className="pm-card__curtain" aria-hidden="true">
          {dir && <span className="pm-card__dir">{dir}</span>}
          {film.logline && <span className="pm-card__log">{film.logline}</span>}
          <div className="pm-card__foot">
            <span><Icon name="play" size={10}/>Watch</span>
            {film.rating && <span style={{ color: "var(--c-amber)" }}>★ {film.rating}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="pm-card__t">{film.title}</span>
        <span className="pm-card__m">{pmMeta(film, true)}</span>
      </div>
    </PmCardShell>
  );
}

function PmStill({ film, title, meta, sub, thumb, progress, badge, onClick, quick = true }) {
  if (!film && !title) return null;
  const hasQuick = quick !== false && film?.id && (window.CATALOG || []).some(c => c.id === film.id);
  return (
    <PmCardShell onClick={onClick || (() => pmGo(pmDest(film)))} label={title || film.title}>
      <div className="pm-card__img" style={{ aspectRatio: "16 / 9", background: film?.color }}>
        <PmImg kind={thumb || film?.thumb}/>
        {badge && <span className={"pm-badge" + (badge.red ? " pm-badge--red" : "")}>{badge.t}</span>}
        {hasQuick && <PmQuickAdd film={film}/>}
        <div className="pm-card__over" style={progress > 0 ? { paddingBottom: 18 } : null}>
          <span className="pm-card__ot">{title || film.title}</span>
          <span className="pm-card__cue" aria-hidden="true"><Icon name="play" size={10}/>Watch</span>
        </div>
        {progress > 0 && <span className="pm-prog"><span style={{ width: `${Math.round(progress * 100)}%` }}></span></span>}
      </div>
      {(meta !== null || sub) && <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {meta !== null && <span className="pm-card__m">{meta || pmMeta(film, true)}</span>}
        {sub && <span className="pm-card__s">{sub}</span>}
      </div>}
    </PmCardShell>
  );
}

function PmRankCard({ film, n }) {
  return (
    <div className="pm-rank">
      <span className="pm-rank__n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <PmPoster film={film} badge={null}/>
    </div>
  );
}

function PmPerson({ person }) {
  return (
    <PmCardShell onClick={() => pmGo(`/cast/${person.id}`)} label={person.name}>
      <div className="pm-card__img" style={{ aspectRatio: "4 / 5" }}>
        <PmImg src={person.photo} alt={person.name}/>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="pm-card__t">{person.name}</span>
        <span className="pm-card__m">{(person.range || "").split("·")[0].trim()} · {person.appearances} films</span>
      </div>
    </PmCardShell>
  );
}

function PmStudioCard({ studio }) {
  const own = (window.CATALOG || []).filter(f => (studio.members || []).includes(f.creatorId));
  const films = own.length;
  const art = (own.find(f => f.id === studio.featuredId) || own[0] || {}).thumb || studio.bgImage;
  return (
    <PmCardShell onClick={() => pmGo(`/studios/${studio.id}`)} label={studio.name}>
      <div className="pm-card__img" style={{ aspectRatio: "16 / 10", background: studio.color }}>
        <PmImg kind={art}/>
        {studio.verified && <span className="pm-badge">Verified House</span>}
        <div className="pm-card__over">
          <span className="pm-card__ot">{studio.name.charAt(0) + studio.name.slice(1).toLowerCase()}</span>
          <span className="pm-card__cue" aria-hidden="true">Enter ›</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span className="pm-card__m">{films} {films === 1 ? "title" : "titles"} · {pmNum(studio.subs || 0)} subscribers</span>
        {studio.tagline && <span className="pm-card__s" style={{ WebkitLineClamp: 1 }}>{studio.tagline}</span>}
      </div>
    </PmCardShell>
  );
}

// ── Structure ─────────────────────────────────────────────────────────
function PmSection({ n, title, note, quote, link, onLink, railRef, children, id }) {
  const scroll = (dir) => { const el = railRef?.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" }); };
  return (
    <section className="pm-sec pm-wrap" id={id}>
      <div className="pm-sec__head">
        <div className="pm-sec__titles">
          <h2 className="pm-h2">{title}</h2>
          {quote ? <p className="pm-sec__quote">“{quote.body}”<cite>{quote.who}</cite></p> : note && <span className="pm-sec__note">{note}</span>}
        </div>
        <div className="pm-sec__tools">
          {railRef && <>
            <button className="pm-arrow" onClick={() => scroll(-1)} aria-label="Scroll left"><Icon name="chev-l" size={14}/></button>
            <button className="pm-arrow" onClick={() => scroll(1)} aria-label="Scroll right"><Icon name="chev-r" size={14}/></button>
          </>}
          {link && <button className="pm-link" style={{ marginLeft: 6 }} onClick={onLink}>{link} <Icon name="chev-r" size={13}/></button>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PmRailSection({ n, title, note, quote, link, onLink, col = "poster", children }) {
  const ref = urPm(null);
  const cols = { poster: "var(--pm-poster)", still: "var(--pm-still)", person: "var(--pm-person)", studio: "var(--pm-studio)", rank: "calc(var(--pm-poster) * 1.46)" };
  return (
    <PmSection n={n} title={title} note={note} quote={quote} link={link} onLink={onLink} railRef={ref}>
      <div ref={ref} className="pm-rail" style={{ "--pm-col": cols[col] || col }}>{children}</div>
    </PmSection>
  );
}

function PmMasthead({ index, path, count, title, lede, children, bare }) {
  return (
    <header className={"pm-mast" + (bare ? " pm-mast--bare" : " pm-wrap")}>
      <div className="pm-mast__top">
        <span className="pm-k">{/^[0-9—–-]+$/.test(String(index || "")) ? <b>{path}</b> : <><b>{index}</b>{path ? ` — ${path}` : ""}</>}</span>
        {count != null && <span className="pm-k">{count}</span>}
      </div>
      <div className="pm-mast__body">
        <h1 className="pm-xl">{title}</h1>
        {lede && <p className="pm-lede">{lede}</p>}
      </div>
      {children && <div className="pm-mast__tools">{children}</div>}
    </header>
  );
}

function PmHero({ kicker, title, lede, actions, facts, note, image, imageSrc, media, short, home, children, color }) {
  const meta = (facts || []).filter(Boolean).filter(([key]) => !/programmer/i.test(key)).slice(0, 5).map(([, v]) => v).filter(v => v != null && v !== "");
  return (
    <section className={"pm-hero" + (short ? " pm-hero--short" : "") + (home ? " pm-hero--home" : "")} data-cina-hero style={{ background: color || tkc("black") }}>
      <div className="pm-hero__img is-on">{media ? media : imageSrc ? <img src={imageSrc} alt="" style={{ objectFit: "cover" }}/> : <FrameThumb kind={image} usePhoto/>}</div>
      <div className="pm-hero__scrim"></div>
      <div className="pm-hero__body">
        <div className="pm-wrap">
          <div className="pm-hero__grid">
            <div className="pm-hero__main">
              {kicker && <span className="pm-k" style={{ color: "var(--c-ink-2)" }}>{kicker}</span>}
              <h1 className="pm-xl">{title}</h1>
              {meta.length > 0 && <div className="pm-hero__meta">{meta.map((v, i) => <span key={i}>{v}</span>)}</div>}
              {lede && <p className="pm-lede">{lede}</p>}
              {actions && <PmActionRow>{actions}</PmActionRow>}
            </div>
            {note && <aside className="pm-hero__aside"><p className="pm-note">“{note.body}”<cite>{note.who}</cite></p></aside>}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function PmActionRow({ children, max = 3 }) {
  const [open, setOpen] = usPm(false);
  const ref = urPm(null);
  uePm(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  const flat = (n) => React.Children.toArray(n).flatMap(c => c && c.type === React.Fragment ? flat(c.props.children) : [c]).filter(Boolean);
  const all = flat(children);
  const shown = all.length > max + 1 ? all.slice(0, max) : all;
  const rest = all.length > max + 1 ? all.slice(max) : [];
  return (
    <div className="pm-actions">
      {shown}
      {rest.length > 0 && (
        <span className="pm-more" ref={ref}>
          <button className="pm-btn pm-btn--glass pm-btn--icon" aria-label="More actions" aria-expanded={open} title="More actions" onClick={() => setOpen(o => !o)}><Icon name="more" size={16}/></button>
          {open && <div className="pm-more__menu" role="menu" onClick={() => setOpen(false)}>{rest}</div>}
        </span>
      )}
    </div>
  );
}

function PmTabs({ tabs, value, onChange }) {
  return (
    <nav className="pm-tabs" aria-label="Sections">
      <div className="pm-wrap" role="tablist">
        {tabs.filter(Boolean).map(([v, label]) => <button key={v} role="tab" aria-selected={value === v} className="pm-tab" data-on={value === v ? "1" : "0"} onClick={() => onChange(v)}>{label}</button>)}
      </div>
    </nav>
  );
}

function PmFacts({ items }) {
  return (
    <dl className="pm-facts">
      {items.filter(Boolean).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  );
}

function PmWatchlistBtn({ film, glass, icon }) {
  const bump = useWatchlistTick();
  const on = window.isOnWatchlist && window.isOnWatchlist(film.id);
  if (icon) return (
    <button className={"pm-btn pm-btn--icon" + (glass ? " pm-btn--glass" : "") + (on ? " pm-btn--on" : "")} aria-label={on ? "Remove from My List" : "Save to My List"} title={on ? "Saved to My List" : "Save to My List"} onClick={() => { window.toggleWatchlist && window.toggleWatchlist(film.id); bump(); }}>
      <Icon name={on ? "bookmark-fill" : "bookmark"} size={15}/>
    </button>
  );
  return (
    <button className={"pm-btn" + (glass ? " pm-btn--glass" : "") + (on ? " pm-btn--on" : "")} onClick={() => { window.toggleWatchlist && window.toggleWatchlist(film.id); bump(); }}>
      <Icon name={on ? "bookmark-fill" : "bookmark"} size={14}/>{on ? "Saved to My List" : "My List"}
    </button>
  );
}

const PM_LIB_TABS = [["/library", "Overview"], ["/watchlist", "Watchlist"], ["/history", "History"], ["/taste", "Taste print"], ["/wallet", "Backed"]];
function PmLibraryTabs({ current }) {
  return PM_LIB_TABS.map(([href, label]) => <button key={href} className="pm-chip" data-on={current === href ? "1" : "0"} onClick={() => pmGo(href)}>{label}</button>);
}

function PmChips({ options, value, onChange }) {
  return options.map(o => {
    const v = typeof o === "string" ? o : o.value, l = typeof o === "string" ? o : o.label;
    return <button key={v} className="pm-chip" data-on={value === v ? "1" : "0"} onClick={() => onChange(v)}>{l}</button>;
  });
}

Object.assign(window, { PmActionRow, PmTabs, PmQuickAdd, PmLibraryTabs, PmPoster, PmStill, PmRankCard, PmPerson, PmStudioCard, PmSection, PmRailSection, PmMasthead, PmHero, PmFacts, PmWatchlistBtn, PmChips, PmImg, pmScrollTo, PmEmpty, PmRemindBtn, usePmState, pmHasReminder, pmToggleReminder, pmReminders, pmIsSubbed, pmSubs, pmSetSub, pmCancelSub, pmDest, pmGo, pmNum, pmFilm, pmMeta, pmProgress, pmCreatorName });
