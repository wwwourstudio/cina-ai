import React from 'react';
import { createRoot } from 'react-dom/client';
import { CinaDirectorSuite, type SuiteStation } from './ai-suite/CinaDirectorSuite';
import { CinaConciergeWidget } from './ai-suite/CinaConciergeWidget';
import './lib/firebase';

export type CinaSurface = 'watch' | 'studio' | 'producers' | 'about';

interface AtlasItem {
  id: string;
  label: string;
  desc: string;
  href: string;
  aiStation?: SuiteStation;
  category: 'create' | 'actors' | 'finance' | 'watch';
  keywords: string;
}

const ATLAS_ITEMS: AtlasItem[] = [
  // AI Production Suite Direct Stations
  {
    id: 'ai-writers-room',
    label: 'AI Writers’ Room · Screenplay & Beats',
    desc: 'Multi-turn Gemini Carbon / Argon / Hydrogen screenplay & directing table',
    href: '#ai-chat',
    aiStation: 'chat',
    category: 'create',
    keywords: 'ai chat writers room gemini carbon argon hydrogen flash lite script',
  },
  {
    id: 'ai-live-voice',
    label: 'Live Voice Rehearsal & Pitch Room',
    desc: 'Real-time bidirectional voice table read & co-directing (Gemini Live)',
    href: '#ai-live',
    aiStation: 'live',
    category: 'actors',
    keywords: 'live voice audio rehearsal table read pitch gemini live',
  },
  {
    id: 'ai-frame-lab',
    label: '4K Frame Lab · Stills & Continuity Edit',
    desc: 'Generate & edit 1K–4K storyboards with optional Search & Image grounding',
    href: '#ai-image',
    aiStation: 'image',
    category: 'create',
    keywords: 'image nano banana 4k 2k edit storyboard still photo',
  },
  {
    id: 'ai-motion-lab',
    label: 'Motion Lab · Animate Stills to Video',
    desc: 'Animate photos into 16:9 or 9:16 cinema shots & multi-turn extensions',
    href: '#ai-video',
    aiStation: 'video',
    category: 'create',
    keywords: 'animate video omni flash veo landscape portrait motion',
  },
  {
    id: 'ai-score-lab',
    label: 'Lyria Film Score & Cue Composer',
    desc: 'Compose 30s cues (Lyria Clip) & full tracks (Lyria Pro) to picture',
    href: '#ai-music',
    aiStation: 'music',
    category: 'create',
    keywords: 'music score soundtrack lyria clip pro audio compose',
  },
  {
    id: 'ai-voice-slate',
    label: 'Voice Slate & Audio Transcriber',
    desc: 'Record microphone or upload audio to Fountain screenplay dialogue',
    href: '#ai-transcribe',
    aiStation: 'transcribe',
    category: 'actors',
    keywords: 'transcribe microphone audio voice memo dialogue',
  },
  {
    id: 'ai-scout-desk',
    label: 'Location & Cultural Scout (Maps + Search)',
    desc: 'Scout filming locations via Google Maps & industry intel via Search',
    href: '#ai-scout',
    aiStation: 'scout',
    category: 'watch',
    keywords: 'maps location scout venues google search grounding research',
  },
  {
    id: 'ai-cloud-vault',
    label: 'Studio Slate Vault (Cloud SQL)',
    desc: 'Persistent production slates, saved takes, threads & scout dossiers',
    href: '#ai-vault',
    aiStation: 'vault',
    category: 'finance',
    keywords: 'vault cloud sql database projects saved takes google sign in',
  },

  // 1. Create & Site Builder
  {
    id: 'studio-home',
    label: 'Cina AI Film Studio',
    desc: 'Slate cockpit, directing crew, and 18 production stations',
    href: 'Cina.html',
    category: 'create',
    keywords: 'studio slate director cockpit film make',
  },
  {
    id: 'site-builder',
    label: 'Website Site Builder',
    desc: 'Visual block canvas, templates, wizard, and studio shop',
    href: 'index.html#/build',
    category: 'create',
    keywords: 'website site builder blocks templates storefront voss',
  },
  {
    id: 'site-preview',
    label: 'Live Studio Website Preview',
    desc: 'White-label public filmmaker site, films, store & notebook',
    href: 'index.html#/site/voss',
    category: 'create',
    keywords: 'site preview storefront shop white label studio website',
  },
  {
    id: 'studio-editor',
    label: 'NLE Video Timeline Editor',
    desc: 'Multi-track timeline, color, cuts, and rough-cut assembly',
    href: 'Cina.html#editor',
    category: 'create',
    keywords: 'editor timeline nle cuts video edit',
  },
  {
    id: 'studio-generate',
    label: 'Shot Lab & Video Generator',
    desc: 'Generate scene shots conditioned on locked bible & cast',
    href: 'Cina.html#generate',
    category: 'create',
    keywords: 'generate shots video stills storyboard render',
  },
  {
    id: 'studio-script',
    label: 'Script Flow & Storyboard',
    desc: 'Screenplay scenes, beat sheets, branch graph, and boards',
    href: 'Cina.html#script',
    category: 'create',
    keywords: 'script screenplay storyboard beats outline',
  },

  // 2. Actors, Timelines & AI Training
  {
    id: 'cast-hub',
    label: 'Cast & Performer Vault Hub',
    desc: 'Live performer registry, 7-stage career pipeline & 3D view',
    href: 'index.html#/cast',
    category: 'actors',
    keywords: 'cast actors performers talent 3d gallery vault',
  },
  {
    id: 'actor-ai-studio',
    label: 'Actor AI Training Studio',
    desc: 'Flux LoRA identity training, stills, Veo 3 motion & lip-sync',
    href: 'index.html#/cast/nadya-ash/studio',
    category: 'actors',
    keywords: 'training tools lora stills motion talking hedra commercials ai actor',
  },
  {
    id: 'actor-timeline',
    label: 'Actor Career Timelines',
    desc: 'Interactive career journey, timeline reel & Hall of Fame',
    href: 'index.html#/journey/nadya-ash',
    category: 'actors',
    keywords: 'actor timeline career journey hall of fame awards',
  },
  {
    id: 'studio-vault',
    label: 'Actor Editor, Birth & Wardrobe',
    desc: 'Create performers, edit LoRA weights, aging, minds & wardrobe',
    href: 'Cina.html#vault',
    category: 'actors',
    keywords: 'actor editor birth wardrobe minds agent vault studio',
  },
  {
    id: 'actor-profile',
    label: 'Performer Monograph & Radar',
    desc: 'Range radar, filmography, likeness mint & casting handoff',
    href: 'index.html#/cast/nadya-ash',
    category: 'actors',
    keywords: 'nadya ash actor profile dossier range radar',
  },

  // 3. Sales, Stats & Co-Finance Dashboards
  {
    id: 'sales-payouts',
    label: 'Creator Sales & Payouts',
    desc: 'Earnings by film, 30-day revenue trend, USDC/ETH/ACH ledger',
    href: 'index.html#/payouts',
    category: 'finance',
    keywords: 'sales payouts earnings revenue dashboard ledger csv',
  },
  {
    id: 'studio-analytics',
    label: 'Studio Views & Revenue Stats',
    desc: 'Momentum rankings, audience retention curves & ad boosts',
    href: 'Cina.html#analytics',
    category: 'finance',
    keywords: 'analytics stats views retention momentum revenue studio dashboard',
  },
  {
    id: 'producers-market',
    label: 'Producer Co-Finance Market',
    desc: 'Back active productions, inspect budgets & revenue splits',
    href: 'Producers.html#market',
    category: 'finance',
    keywords: 'producers market co-finance nft invest backing',
  },
  {
    id: 'wallet-stakes',
    label: 'User Wallet, Stakes & Royalties',
    desc: 'Personal holdings, streaming dividends, governance & P&L',
    href: 'index.html#/wallet',
    category: 'finance',
    keywords: 'wallet stakes portfolio royalties holdings dashboard',
  },
  {
    id: 'auctions-floor',
    label: 'Live Auction Floor',
    desc: '1-of-1 props, director cuts, and executive producer seats',
    href: 'Producers.html#auctions',
    category: 'finance',
    keywords: 'auctions bids collectibles lots',
  },
  {
    id: 'leaderboard',
    label: 'Top-Earning Films & Holders',
    desc: 'Platform box-office rankings, royalties paid & studio tokens',
    href: 'index.html#/leaderboard',
    category: 'finance',
    keywords: 'leaderboard rankings top earning tokens stats',
  },

  // 4. Watch, Press & Blogs
  {
    id: 'watch-home',
    label: 'Premiere Screening Room',
    desc: 'Tonight’s curated programme, series, and Top 10 selections',
    href: 'index.html#/',
    category: 'watch',
    keywords: 'watch home films series streaming premiere',
  },
  {
    id: 'branched-rooms',
    label: 'Branched Live Cinema Rooms',
    desc: 'Audience-voted narrative forks and canonical cut rentals',
    href: 'index.html#/branches',
    category: 'watch',
    keywords: 'branched interactive forks live rooms voting',
  },
  {
    id: 'editorial-blog',
    label: 'Editorial Blog & Dispatches',
    desc: 'Essays, pipeline notes, and filmmaker interviews',
    href: 'index.html#/about/blog',
    category: 'watch',
    keywords: 'blog articles essays news editorial posts',
  },
  {
    id: 'press-room',
    label: 'Press Room & Media Kit',
    desc: 'Official coverage, announcements, and brand assets',
    href: 'index.html#/about/press',
    category: 'watch',
    keywords: 'press media kit coverage news releases',
  },
  {
    id: 'festival-page',
    label: 'Cina Independent · Edition 04',
    desc: 'Marseille competition lineup, standings & audience ballot',
    href: 'index.html#/festival',
    category: 'watch',
    keywords: 'festival competition awards marseille screenings',
  },
  {
    id: 'manifesto-doc',
    label: 'The Cina Manifesto',
    desc: 'Long-form architecture & philosophy of post-Hollywood cinema',
    href: 'About.html',
    category: 'watch',
    keywords: 'about manifesto company story architecture',
  },
];

const CATEGORY_META: Record<AtlasItem['category'], string> = {
  create: 'Studio & Site Builder',
  actors: 'Actors, Timelines & AI',
  finance: 'Sales, Stats & Co-Finance',
  watch: 'Screenings, Press & Blog',
};

const MOODS = [
  { id: 'premiere', label: 'Premiere' },
  { id: 'programmer', label: 'Programmer' },
  { id: 'darkroom', label: 'Darkroom' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'daylight', label: 'Daylight' },
] as const;

declare global {
  interface Window {
    __cinaNavigateSurface?: (href: string, customLabel?: string) => void;
    toggleCinaAtlas?: (force?: boolean) => boolean;
  }
}

function goHref(href: string, label?: string) {
  if (href === '#workspace') {
    window.toggleCinaAtlas?.(true);
    return;
  }
  const targetUrl = new URL(href, window.location.href);
  const sameDoc =
    targetUrl.pathname === window.location.pathname &&
    targetUrl.search === window.location.search;
  if (sameDoc) {
    window.location.hash = targetUrl.hash || '#/';
    return;
  }
  if (window.__cinaNavigateSurface) {
    window.__cinaNavigateSurface(href, label);
  } else {
    window.location.href = href;
  }
}

export function initCinaEnhancer(surface: CinaSurface) {
  if (document.getElementById('__cina-enhancer-host')) return;

  // Restore saved mood across surfaces
  try {
    const savedMood = localStorage.getItem('cina:mood');
    if (savedMood && MOODS.some((m: { id: string; label: string }) => m.id === savedMood)) {
      document.body.dataset.cinaMood = savedMood;
    }
  } catch {
    // ignore
  }

  const host = document.createElement('div');
  host.id = '__cina-enhancer-host';
  document.body.appendChild(host);

  let conciergeOpen = false;

  // Dedicated React mount for the AI Production Suite modal (available via explicit calls on non-studio surfaces)
  let suiteHost = document.getElementById('__cina-ai-suite-root');
  if (!suiteHost && surface !== 'studio') {
    suiteHost = document.createElement('div');
    suiteHost.id = '__cina-ai-suite-root';
    document.body.appendChild(suiteHost);
    const suiteRoot = createRoot(suiteHost);
    suiteRoot.render(
      React.createElement(CinaDirectorSuite, {
        onAuthUserChange: () => {
          renderDockAndAtlas();
        },
      })
    );
  }

  // Dedicated React mount for the unified Animated Cina Voice Orb across ALL surfaces (zero text chat, zero overlaps)
  let conciergeHost = document.getElementById('__cina-concierge-root');
  if (!conciergeHost) {
    conciergeHost = document.createElement('div');
    conciergeHost.id = '__cina-concierge-root';
    document.body.appendChild(conciergeHost);
    const conciergeRoot = createRoot(conciergeHost);
    conciergeRoot.render(
      React.createElement(CinaConciergeWidget, {
        onOpenChange: (isOpen: boolean) => {
          conciergeOpen = isOpen;
          renderDockAndAtlas();
        },
      })
    );
  }

  // Sub-navigation mount slot for Watch contextual clusters
  const subBarContainer = document.createElement('div');
  subBarContainer.id = '__cina-contextual-subbar';

  let atlasOpen = false;
  let searchQuery = '';

  const STUDIO_STATION_ROUTE: Record<SuiteStation, { view: string; sub?: string }> = {
    chat: { view: 'chat', sub: 'room' },
    live: { view: 'chat', sub: 'live' },
    vault: { view: 'chat', sub: 'vault' },
    image: { view: 'storyboard' },
    video: { view: 'generate' },
    music: { view: 'score' },
    transcribe: { view: 'script' },
    scout: { view: 'bible', sub: 'scout' },
  };

  function openSuiteStation(station: SuiteStation = 'chat') {
    window.closeCinaConcierge?.();
    if (atlasOpen) {
      atlasOpen = false;
      searchQuery = '';
      renderDockAndAtlas();
    }
    if (surface === 'studio') {
      const target = STUDIO_STATION_ROUTE[station] || { view: 'chat' };
      const w = window as unknown as {
        __cinaStudioGo?: (view: string, sub?: string) => void;
      };
      if (w.__cinaStudioGo) {
        w.__cinaStudioGo(target.view, target.sub);
      } else {
        window.location.hash = `#${target.view}`;
      }
      return;
    }
    window.openCinaAiSuite?.(station);
  }

  function setAtlasOpen(next?: boolean): boolean {
    const target = typeof next === 'boolean' ? next : !atlasOpen;
    atlasOpen = target;
    if (atlasOpen) {
      window.closeCinaAiSuite?.();
      window.closeCinaConcierge?.();
    } else {
      searchQuery = '';
    }
    renderDockAndAtlas();
    return atlasOpen;
  }

  window.toggleCinaAtlas = setAtlasOpen;

  function renderSubBar() {
    if (surface !== 'watch') {
      subBarContainer.remove();
      return;
    }
    const mainEl = document.getElementById('main-content');
    if (!mainEl || !mainEl.parentElement) return;
    if (!document.getElementById('__cina-contextual-subbar')) {
      mainEl.parentElement.insertBefore(subBarContainer, mainEl);
    }

    const hash = (window.location.hash || '#/').replace(/^#/, '');
    const parts = hash.split('?')[0].split('/').filter(Boolean);
    const p0 = parts[0] || '';
    const p1 = parts[1] || '';
    const p2 = parts[2] || '';

    // Cluster 1: Actors, Timelines & AI Training
    if (p0 === 'cast' || p0 === 'journey' || p0 === 'talent') {
      const actorId = p1 || 'nadya-ash';
      const tabs = [
        { label: 'Performer Hub', href: 'index.html#/cast', active: p0 === 'cast' && !p1 },
        {
          label: 'Performer Profile',
          href: `index.html#/cast/${actorId}`,
          active: p0 === 'cast' && Boolean(p1) && p2 !== 'studio',
        },
        {
          label: 'Career Timelines & Hall of Fame',
          href: `index.html#/journey/${actorId}`,
          active: p0 === 'journey' || (p0 === 'talent' && Boolean(p1)),
        },
        {
          label: 'AI Training Studio (LoRA · Stills · Motion · Lip-Sync)',
          href: `index.html#/cast/${actorId}/studio`,
          active: p0 === 'cast' && p2 === 'studio',
        },
      ];
      mountSubStrip('Performers & AI', tabs, {
        label: 'Open Actor Editor & Vault →',
        href: 'Cina.html#vault',
      });
      return;
    }

    // Cluster 2: User Dashboards, Sales, Royalties & Stats
    if (
      ['payouts', 'wallet', 'leaderboard', 'tokens', 'auctions', 'auction', 'producers', 'portfolio'].includes(p0)
    ) {
      const tabs = [
        { label: 'Sales & Payouts', href: 'index.html#/payouts', active: p0 === 'payouts' },
        {
          label: 'Wallet & Stakes',
          href: 'index.html#/wallet',
          active: p0 === 'wallet' || p0 === 'portfolio' || p0 === 'producers',
        },
        { label: 'Leaderboard', href: 'index.html#/leaderboard', active: p0 === 'leaderboard' },
        { label: 'Studio Tokens', href: 'index.html#/tokens', active: p0 === 'tokens' },
        {
          label: 'Auction Floor',
          href: 'index.html#/auctions',
          active: p0 === 'auctions' || p0 === 'auction',
        },
      ];
      mountSubStrip('Dashboards & Sales', tabs, {
        label: 'Studio Revenue Analytics →',
        href: 'Cina.html#analytics',
      });
      return;
    }

    // Cluster 3: Press, Blog & Editorial
    if (p0 === 'about') {
      const tabs = [
        { label: 'Editorial Blog', href: 'index.html#/about/blog', active: p1 === 'blog' },
        { label: 'Press Room', href: 'index.html#/about/press', active: p1 === 'press' },
        { label: 'About Cina', href: 'index.html#/about', active: !p1 },
        { label: 'Found a Studio', href: 'index.html#/about/found', active: p1 === 'found' },
        { label: 'Careers', href: 'index.html#/about/careers', active: p1 === 'careers' },
        { label: 'Contact', href: 'index.html#/about/contact', active: p1 === 'contact' },
      ];
      mountSubStrip('Press & Editorial', tabs, {
        label: 'Read Full Manifesto →',
        href: 'About.html',
      });
      return;
    }

    subBarContainer.innerHTML = '';
  }

  function mountSubStrip(
    eyebrow: string,
    tabs: Array<{ label: string; href: string; active: boolean }>,
    cta: { label: string; href: string }
  ) {
    subBarContainer.innerHTML = '';
    const nav = document.createElement('div');
    nav.className = 'cina-subbar';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', eyebrow);

    const eye = document.createElement('span');
    eye.className = 'cina-subbar__eyebrow';
    eye.textContent = eyebrow;
    nav.appendChild(eye);

    const tabWrap = document.createElement('div');
    tabWrap.className = 'cina-subbar__tabs';
    for (const t of tabs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cina-subbar__tab';
      btn.dataset.active = String(t.active);
      btn.textContent = t.label;
      btn.addEventListener('click', () => goHref(t.href, t.label));
      tabWrap.appendChild(btn);
    }
    nav.appendChild(tabWrap);

    const ctaBtn = document.createElement('button');
    ctaBtn.type = 'button';
    ctaBtn.className = 'cina-subbar__cta';
    ctaBtn.textContent = cta.label;
    ctaBtn.addEventListener('click', () => goHref(cta.href, cta.label));
    nav.appendChild(ctaBtn);

    subBarContainer.appendChild(nav);
  }

  function getFilteredItems(): AtlasItem[] {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? ATLAS_ITEMS.filter((it: AtlasItem) =>
          `${it.label} ${it.desc} ${it.keywords}`.toLowerCase().includes(q)
        )
      : ATLAS_ITEMS;
  }

  function renderDockAndAtlas() {
    host.innerHTML = '';

    const hash = (window.location.hash || '#/').replace(/^#/, '');
    const cleanPath = hash.split('?')[0];
    const parts = cleanPath.split('/').filter(Boolean);
    const p0 = parts[0] || '';
    const isWhiteLabel = surface === 'watch' && (p0 === 'build' || p0 === 'site' || p0 === 'creator');
    const isImmersive =
      surface === 'watch' &&
      (p0 === 'party' ||
        p0 === 'premiere' ||
        p0 === 'build' ||
        p0 === 'site' ||
        (p0 === 'series' && parts[2] === 'ep'));

    if (isImmersive) {
      document.body.dataset.immersiveRoute = '1';
    } else {
      delete document.body.dataset.immersiveRoute;
    }

    // Bottom-left fixed .cina-dock removed so nothing overlaps page columns, sidebars, or footers.
    // Workspace Atlas remains 1-click via the header Search/Workspace button and ⌘K / Ctrl+K shortcut.
    if (surface === 'watch' && isWhiteLabel) {
      const mainEl = document.getElementById('main-content');
      if (mainEl && mainEl.parentElement) {
        mountSubStrip(
          'Site Builder',
          [
            { label: p0 === 'build' ? 'Preview Site →' : 'Edit in Site Builder →', href: p0 === 'build' ? 'index.html#/site/voss' : 'index.html#/build', active: true },
            { label: '← Watch Home', href: 'index.html#/', active: false },
          ],
          { label: 'Workspace Atlas ⌘K', href: '#workspace' }
        );
      }
    }

    if (!atlasOpen) return;

    const scrim = document.createElement('div');
    scrim.className = 'cina-atlas-scrim';
    scrim.addEventListener('click', (e: MouseEvent) => {
      if (e.target === scrim) {
        setAtlasOpen(false);
      }
    });

    const modal = document.createElement('div');
    modal.className = 'cina-atlas-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Cina Workspace Atlas');

    // Header + Search
    const head = document.createElement('div');
    head.className =
      'flex flex-wrap items-center justify-between gap-4 border-b border-[var(--c-line)] px-[3%] py-4';
    head.innerHTML = `
      <div class="flex items-baseline gap-3">
        <span class="font-[family-name:var(--f-display)] italic text-[clamp(1.25rem,1.6vw,1.6rem)]">Cina</span>
        <span class="font-[family-name:var(--f-mono)] text-[0.68rem] tracking-[0.16em] uppercase text-[var(--c-ink-3)]">Workspace Atlas · All Surfaces &amp; Tools</span>
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'flex items-center gap-2.5 w-full sm:w-auto';

    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Filter studio, site builder, actor AI, sales, press…';
    input.value = searchQuery;
    input.className =
      'h-9 w-full sm:w-80 rounded-md border border-[var(--c-line-2)] bg-[var(--c-bg)] px-3 text-xs text-[var(--c-ink)] placeholder:text-[var(--c-ink-4)] focus:border-[var(--c-amber)] focus:outline-none';
    input.addEventListener('input', () => {
      searchQuery = input.value;
      populateGrid();
    });
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const matches = getFilteredItems();
        if (matches.length > 0) {
          e.preventDefault();
          const first = matches[0];
          if (first.aiStation) {
            openSuiteStation(first.aiStation);
          } else {
            setAtlasOpen(false);
            goHref(first.href, `Loading ${first.label}`);
          }
        }
      }
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className =
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--c-line-2)] text-xs text-[var(--c-ink-3)] hover:border-[var(--c-amber)] hover:text-[var(--c-ink)] cursor-pointer transition-colors';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close Atlas');
    closeBtn.addEventListener('click', () => {
      setAtlasOpen(false);
    });

    controls.appendChild(input);
    controls.appendChild(closeBtn);
    head.appendChild(controls);
    modal.appendChild(head);

    // Body Grid
    const body = document.createElement('div');
    body.className = 'flex-1 overflow-y-auto p-[3%]';
    modal.appendChild(body);

    function populateGrid() {
      body.innerHTML = '';
      const filtered = getFilteredItems();

      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4';

      for (const cat of ['create', 'actors', 'finance', 'watch'] as const) {
        const items = filtered.filter((i: AtlasItem) => i.category === cat);
        if (!items.length) continue;

        const col = document.createElement('div');
        col.className = 'flex flex-col gap-2.5';

        const catTitle = document.createElement('div');
        catTitle.className =
          'border-b border-[var(--c-line)] pb-1.5 font-[family-name:var(--f-mono)] text-[0.66rem] uppercase tracking-[0.16em] text-[var(--c-amber)]';
        catTitle.textContent = CATEGORY_META[cat];
        col.appendChild(catTitle);

        for (const item of items) {
          const card = document.createElement('button');
          card.type = 'button';
          card.className =
            'group flex w-full flex-col items-start gap-1 rounded-lg border border-[var(--c-line)] bg-[var(--c-panel-2)] p-3 text-left transition-colors hover:border-[var(--c-amber)] cursor-pointer';
          card.innerHTML = `
            <span class="text-[0.82rem] font-semibold text-[var(--c-ink)] group-hover:text-[var(--c-amber)] transition-colors">${item.label}</span>
            <span class="text-[0.72rem] leading-snug text-[var(--c-ink-3)]">${item.desc}</span>
          `;
          card.addEventListener('click', () => {
            if (item.aiStation) {
              openSuiteStation(item.aiStation);
            } else {
              setAtlasOpen(false);
              goHref(item.href, `Loading ${item.label}`);
            }
          });
          col.appendChild(card);
        }

        grid.appendChild(col);
      }

      if (!filtered.length) {
        const empty = document.createElement('p');
        empty.className = 'py-10 text-center text-sm text-[var(--c-ink-3)]';
        empty.textContent = 'No tools or pages match your filter.';
        body.appendChild(empty);
      } else {
        body.appendChild(grid);
      }
    }

    populateGrid();

    // Footer with User Settings & Shortcut Hint (Display Mood lives in User Settings)
    const foot = document.createElement('div');
    foot.className =
      'flex flex-wrap items-center justify-between gap-3 border-t border-[var(--c-line)] bg-[var(--c-void)] px-[3%] py-3.5 text-xs';

    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.className =
      'rounded border border-[var(--c-line-2)] px-3 py-1.5 font-[family-name:var(--f-mono)] text-[0.68rem] text-[var(--c-ink-2)] hover:border-[var(--c-amber)] hover:text-[var(--c-ink)] cursor-pointer transition-colors';
    settingsBtn.textContent = 'User Settings & Display Mood →';
    settingsBtn.addEventListener('click', () => {
      setAtlasOpen(false);
      const w = window as unknown as { openCinaAccountSettings?: (tab?: string) => void };
      if (w.openCinaAccountSettings) {
        w.openCinaAccountSettings('appearance');
      } else {
        goHref('index.html#/account?tab=appearance');
      }
    });

    const hint = document.createElement('span');
    hint.className = 'font-[family-name:var(--f-mono)] text-[0.66rem] text-[var(--c-ink-4)]';
    hint.textContent = 'Press ⌘K / Ctrl+K anywhere to toggle Workspace Atlas · Esc to close';

    foot.appendChild(settingsBtn);
    foot.appendChild(hint);
    modal.appendChild(foot);

    scrim.appendChild(modal);
    host.appendChild(scrim);
    requestAnimationFrame(() => input.focus());
  }

  // Global capture-phase listener so Command+K / Control+K reliably toggles
  // the Workspace Atlas modal across all surfaces without triggering overlapping palettes.
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (key === 'k' || key === 'j')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setAtlasOpen();
      } else if (e.key === 'Escape' && atlasOpen) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setAtlasOpen(false);
      }
    },
    { capture: true }
  );

  window.addEventListener('hashchange', () => {
    renderSubBar();
    renderDockAndAtlas();
  });

  // Poll briefly until #main-content mounts on Watch so subBar attaches cleanly
  let tries = 0;
  const syncMount = () => {
    tries += 1;
    renderSubBar();
    if (surface === 'watch' && !document.getElementById('main-content') && tries < 100) {
      setTimeout(syncMount, 60);
    }
  };
  syncMount();
  renderDockAndAtlas();
}
