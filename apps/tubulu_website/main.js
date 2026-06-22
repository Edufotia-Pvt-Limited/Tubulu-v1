/* ==========================================================================
   TUBULU — Interactive JavaScript
   Exact replica of aircenter.space behaviour:
   - Scrolled header
   - Full-screen nav overlay (slides down)
   - Hero 3D rotating tower (parallax + scroll)
   - Hero BG letters parallax
   - Intersection observer reveals
   - Horizontal slider with counter
   - Performance image toggle
   - Module filter (by parameters)
   - Architectural plan SVG node spec panel
   - Bookmark / Favourites drawer
   - Contact form + modal callback form
   - Interactive map modal
   - Cookie bar
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. Header scroll class ─────────────────────────────────────────── */
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ─── 2. Intersection observer — reveal on scroll ────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ─── 3. Hero — Build 3D tower slabs ────────────────────────────────── */
  const towerSlabs = document.getElementById('towerSlabs');
  const NUM_SLABS = 26;

  if (towerSlabs) {
    for (let i = 0; i < NUM_SLABS; i++) {
      const slab = document.createElement('div');
      slab.className = 'tower-slab';
      towerSlabs.appendChild(slab);
    }
    layoutSlabs();
  }

  function layoutSlabs() {
    const slabs = towerSlabs ? towerSlabs.querySelectorAll('.tower-slab') : [];
    const total = slabs.length;
    const halfH = 240; // half the visual height

    slabs.forEach((slab, i) => {
      const fraction = i / (total - 1); // 0 → 1
      const yOffset = (fraction - 0.5) * halfH * 2; // top to bottom
      const rotY = i * (360 / total);
      const depth = 80 + Math.sin(fraction * Math.PI) * 20;
      slab.style.cssText = `
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(calc(-50% + ${yOffset}px))
                   rotateY(${rotY}deg) translateZ(${depth}px);
        opacity: ${0.55 + Math.abs(Math.sin(fraction * Math.PI)) * 0.45};
      `;
    });
  }

  /* ─── 4. Hero — Parallax on scroll + mouse ───────────────────────────── */
  const towerWrap = document.getElementById('towerWrap');
  const bgLetters = document.querySelectorAll('.hero__bg-letters span');
  let mouseNX = 0, mouseNY = 0;

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      mouseNX = (e.clientX - rect.width  / 2) / rect.width;
      mouseNY = (e.clientY - rect.height / 2) / rect.height;
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      mouseNX = 0; mouseNY = 0;
    });
  }

  let raf;
  function animateHero() {
    const scrollFrac = Math.min(window.scrollY / (window.innerHeight * 0.8), 1);

    if (towerWrap) {
      const rotX = -mouseNY * 8 + scrollFrac * -10;
      const rotY = mouseNX * 12;
      const scale = 1 - scrollFrac * 0.12;
      towerWrap.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;

      // Slowly spin the slabs based on scroll
      if (towerSlabs) {
        towerSlabs.style.transform = `rotateY(${scrollFrac * 120}deg)`;
      }
    }

    // Parallax on giant background letters
    bgLetters.forEach((span, i) => {
      const offset = (i - bgLetters.length / 2) * 0.5;
      const y = mouseNY * -10 + scrollFrac * (-30 + offset * 5);
      const x = mouseNX * -5 * (i % 2 === 0 ? 1 : -1);
      span.style.transform = `translate(${x}px, ${y}px)`;
    });

    raf = requestAnimationFrame(animateHero);
  }
  animateHero();

  // Stop RAF when hero is off screen
  const heroObserver = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      if (!raf) raf = requestAnimationFrame(animateHero);
    } else {
      cancelAnimationFrame(raf);
      raf = null;
    }
  });
  if (heroSection) heroObserver.observe(heroSection);

  /* ─── 5. Nav overlay (full screen menu) ─────────────────────────────── */
  const navOverlay = document.getElementById('navOverlay');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose  = document.getElementById('menuClose');

  function openNav() {
    navOverlay.classList.add('open');
    menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    navOverlay.classList.remove('open');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openNav);
  if (menuClose)  menuClose.addEventListener('click', closeNav);

  // Close when clicking a nav link
  navOverlay?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  /* ─── 6. Horizontal slider (Section 2) ──────────────────────────────── */
  const sliderTrack   = document.getElementById('sliderTrack');
  const sliderCounter = document.getElementById('sliderCounter');
  const slidePrev     = document.getElementById('slidePrev');
  const slideNext     = document.getElementById('slideNext');

  let currentSlide = 0;
  const slides = sliderTrack ? sliderTrack.querySelectorAll('.hslide') : [];
  const total   = slides.length;

  function goToSlide(idx) {
    currentSlide = Math.max(0, Math.min(idx, total - 1));
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (sliderCounter) {
      sliderCounter.textContent = `${currentSlide + 1}  /  ${total}`;
    }
  }

  if (slidePrev) slidePrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (slideNext) slideNext.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Swipe support
  if (sliderTrack) {
    let startX = 0;
    sliderTrack.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    sliderTrack.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
    });
  }

  /* ─── 7. Performance section — image toggle 1/2 ─────────────────────── */
  const perfDots    = document.querySelectorAll('.perf-dot');
  const perfImgs    = document.querySelectorAll('.perf-img');
  const perfCounter = document.getElementById('perfCounter');

  perfDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = +dot.dataset.idx;
      perfImgs.forEach((img, i) => img.classList.toggle('perf-img--active', i === idx));
      perfDots.forEach((d, i) => d.classList.toggle('perf-dot--active', i === idx));
      if (perfCounter) perfCounter.textContent = `${idx + 1} / ${perfDots.length}`;
    });
  });

  /* ─── 8. Module tabs ─────────────────────────────────────────────────── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b  => b.classList.toggle('tab-btn--active',   b === btn));
      tabPanels.forEach(p => p.classList.toggle('tab-panel--active', p.id === `panel-${target}`));
    });
  });

  /* ─── 9. Module filter (by parameters) ──────────────────────────────── */
  const filterChecks = document.querySelectorAll('.modules-filters input[type=checkbox]');
  const modCards     = document.querySelectorAll('.mod-card');

  function applyFilters() {
    const active = { verticals: [], protocols: [], infra: [] };
    filterChecks.forEach(cb => {
      if (!cb.checked) return;
      const v = cb.value;
      if (['fb','grocery','retail'].includes(v)) active.verticals.push(v);
      if (['rest','ws'].includes(v))             active.protocols.push(v);
      if (['postgres','redis'].includes(v))      active.infra.push(v);
    });

    modCards.forEach(card => {
      const cv = (card.dataset.verticals || '').split(',');
      const cp = (card.dataset.protocols || '').split(',');
      const ci = (card.dataset.infra     || '').split(',');

      const vMatch = active.verticals.length === 0 || active.verticals.some(v => cv.includes(v));
      const pMatch = active.protocols.length === 0 || active.protocols.some(p => cp.includes(p));
      const iMatch = active.infra.length     === 0 || active.infra.some(i     => ci.includes(i));

      card.style.display = (vMatch && pMatch && iMatch) ? '' : 'none';
    });
  }

  filterChecks.forEach(cb => cb.addEventListener('change', applyFilters));

  /* ─── 10. Architectural plan — SVG node click → spec panel ──────────── */
  const planNodes = document.querySelectorAll('.plan-node[data-nid]');
  const specHint  = document.getElementById('specHint');
  const specTitle = document.getElementById('specTitle');
  const specBody  = document.getElementById('specBody');
  const specDetails = document.getElementById('specDetails');
  const specRoutes  = document.getElementById('specRoutes');
  const specModel   = document.getElementById('specModel');
  const specUI      = document.getElementById('specUI');
  const specBookBtn = document.getElementById('specBookmarkBtn');

  const NODE_DATA = {
    'mod-auth-core': {
      title: 'Identity, Auth & Core Infrastructure',
      hint:  'IDENTITY',
      body:  'Secure OTP registration, device token mappings, and Redis database connectors.',
      routes: '/api/v1/user, /api/v1/auth/otp, /api/v1/device',
      model:  'User, UserDevice, OtpLog',
      ui:     'apps/admin_portal/src/auth/',
    },
    'mod-merchant-kyc': {
      title: 'Merchant Onboarding & KYC Pipeline',
      hint:  'KYC',
      body:  'Handles business registrations, automated PAN/GSTIN audit checks, and calculates trust scores.',
      routes: '/api/v1/merchant, /api/v1/kyc, /api/v1/trust',
      model:  'Merchant, KYCDocument, TrustScore',
      ui:     'apps/admin_portal/src/merchant/',
    },
    'mod-ai-playbooks': {
      title: 'AI Playbooks & Persona Engine',
      hint:  'PERSONA',
      body:  'Sets AI Agent conversational guidelines, templates, and vocabulary constraints.',
      routes: '/api/v1/playbook, /api/v1/persona',
      model:  'Playbook, PersonaVocab, TemplateBlock',
      ui:     'apps/admin_portal/src/playbooks/',
    },
    'mod-inventory': {
      title: 'Catalog & Custom Inventory',
      hint:  'CATALOG',
      body:  'Houses SKU listings, subcategories, product attributes, and real-time inventory levels.',
      routes: '/api/v1/catalog, /api/v1/sku, /api/v1/inventory',
      model:  'Product, SKU, Category, InventoryLevel',
      ui:     'apps/admin_portal/src/catalog/',
    },
    'mod-conversational-ai': {
      title: 'Conversational AI Agent Core',
      hint:  'TELEPHONY',
      body:  'Integrates Sarvam AI speech synthesis/recognition and handles WebSocket telephony streams.',
      routes: 'ws://server/stream, /api/v1/ai/session',
      model:  'AISession, SpeechEvent, OrderDraft',
      ui:     'apps/tubulu_mobile/lib/features/voice/',
    },
    'mod-checkout': {
      title: 'Checkout & Booking Engine',
      hint:  'TRANSACTION',
      body:  'Orchestrates payment gateways, shopping carts, transaction history, and courier tracking.',
      routes: '/api/v1/order, /api/v1/payment, /api/v1/tracking',
      model:  'Order, CartItem, Payment, CourierAssignment',
      ui:     'apps/tubulu_mobile/lib/features/checkout/',
    },
  };

  planNodes.forEach(node => {
    node.addEventListener('click', () => {
      const nid  = node.dataset.nid;
      const data = NODE_DATA[nid];
      if (!data) return;

      planNodes.forEach(n => n.classList.remove('plan-node--selected'));
      node.classList.add('plan-node--selected');

      if (specHint)  specHint.textContent  = data.hint;
      if (specTitle) specTitle.textContent = data.title;
      if (specBody)  specBody.textContent  = data.body;
      if (specRoutes) specRoutes.textContent = data.routes;
      if (specModel)  specModel.textContent  = data.model;
      if (specUI)     specUI.textContent     = data.ui;
      if (specDetails) specDetails.style.display = '';

      if (specBookBtn) {
        specBookBtn.textContent = 'Bookmark this module';
        specBookBtn.onclick = () => {
          bookmarkModule(nid, data.title);
          specBookBtn.textContent = '✓ Bookmarked';
        };
      }
    });
  });

  /* ─── 11. Bookmarks / Favourites system ─────────────────────────────── */
  let bookmarks = [];
  const favDrawer   = document.getElementById('favDrawer');
  const favOverlay  = document.getElementById('favOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const drawerCount = document.getElementById('drawerCount');
  const drawerList  = document.getElementById('drawerList');
  const drawerEmpty = document.getElementById('drawerEmpty');
  const drawerActions = document.getElementById('drawerActions');
  const drawerSendBtn = document.getElementById('drawerSendBtn');
  const drawerEmailForm = document.getElementById('drawerEmailForm');
  const favCount    = document.getElementById('favCount');
  const favTrigger  = document.getElementById('favTrigger');

  function openDrawer() {
    favDrawer?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    favDrawer?.classList.remove('open');
    document.body.style.overflow = '';
  }

  favTrigger?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  favOverlay?.addEventListener('click', closeDrawer);

  function bookmarkModule(id, name) {
    if (bookmarks.find(b => b.id === id)) return;
    bookmarks.push({ id, name });
    renderDrawer();
  }

  function removeBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    renderDrawer();
  }

  function renderDrawer() {
    const count = bookmarks.length;
    if (drawerCount) drawerCount.textContent = count;

    // Header count badge
    if (favCount) {
      favCount.textContent = count > 9 ? '9+' : count;
      favCount.classList.toggle('has-count', count > 0);
    }

    if (drawerEmpty) drawerEmpty.style.display = count === 0 ? '' : 'none';
    if (drawerActions) drawerActions.style.display = count > 0 ? '' : 'none';
    if (drawerList) {
      drawerList.innerHTML = '';
      bookmarks.forEach(b => {
        const li = document.createElement('li');
        li.className = 'drawer__item';
        li.innerHTML = `<span>${b.name}</span><button aria-label="Remove">×</button>`;
        li.querySelector('button').addEventListener('click', () => removeBookmark(b.id));
        drawerList.appendChild(li);
      });
    }
  }
  renderDrawer();

  // Bookmark buttons on mod-cards
  document.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.mod-card');
      if (!card) return;
      const title = card.querySelector('.mod-title')?.textContent || 'Module';
      const tag   = card.querySelector('.mod-tag')?.textContent  || 'mod';
      if (btn.classList.contains('saved')) {
        btn.classList.remove('saved');
        removeBookmark(tag);
      } else {
        btn.classList.add('saved');
        bookmarkModule(tag, title);
      }
    });
  });

  drawerSendBtn?.addEventListener('click', () => {
    if (drawerEmailForm) {
      drawerEmailForm.style.display = drawerEmailForm.style.display === 'none' ? '' : 'none';
    }
  });

  document.getElementById('favEmailForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const sent = document.getElementById('favSent');
    if (sent) sent.classList.add('visible');
    setTimeout(() => sent?.classList.remove('visible'), 4000);
    e.target.reset();
  });

  /* ─── 12. Contact form ───────────────────────────────────────────────── */
  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    e.target.style.display = 'none';
    document.getElementById('formThanks')?.classList.add('visible');
  });

  /* ─── 13. Map modal ──────────────────────────────────────────────────── */
  const mapModal   = document.getElementById('mapModal');
  const mapOverlay = document.getElementById('mapOverlay');
  const mapClose   = document.getElementById('mapClose');
  const mapTooltip = document.getElementById('mapTooltip');
  const mapBtn     = document.getElementById('mapBtn');

  mapBtn?.addEventListener('click', () => {
    mapModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  mapOverlay?.addEventListener('click', () => {
    mapModal?.classList.remove('open');
    document.body.style.overflow = '';
  });
  mapClose?.addEventListener('click', () => {
    mapModal?.classList.remove('open');
    document.body.style.overflow = '';
  });

  document.querySelectorAll('.map-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      if (mapTooltip) mapTooltip.textContent = node.dataset.hub || '';
    });
    node.addEventListener('mouseleave', () => {
      if (mapTooltip) mapTooltip.textContent = 'Hover over a node';
    });
  });

  /* ─── 14. Cookie bar ─────────────────────────────────────────────────── */
  const cookieBar = document.getElementById('cookieBar');
  const cookieKey = 'tubulu_cookie_accepted';

  if (cookieBar && !localStorage.getItem(cookieKey)) {
    setTimeout(() => cookieBar.classList.add('visible'), 1200);
    document.getElementById('cookieAccept')?.addEventListener('click', () => {
      cookieBar.classList.remove('visible');
      localStorage.setItem(cookieKey, '1');
    });
  }

});
