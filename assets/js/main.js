/* Pizza Puzzle — site interactions & animations
   Animation techniques ported 1:1 from the Gorilla Pizza reference build
   (GSAP timelines, ScrollTrigger.batch reveals, clip-path mobile menu,
   marquee loop, scroll-scrubbed testimonial, animated stat counters). */
(() => {
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header scroll state + top progress rail ---------- */
  const header = document.getElementById('siteHeader');
  const pageProgress = document.getElementById('pageProgress');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (pageProgress) {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      pageProgress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hasGSAP && header) {
    gsap.from(header, { y: -90, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.15 });
  }

  /* ---------- mobile nav (clip-path curtain, matching Navbar.jsx) ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('siteNavMobile');
  let navOpen = false;

  function setMenuOpen(open) {
    navOpen = open;
    navToggle?.classList.toggle('is-open', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    if (!mobileMenu) return;

    if (!hasGSAP) {
      mobileMenu.style.display = open ? 'flex' : 'none';
      return;
    }

    if (open) {
      gsap.set(mobileMenu, { display: 'flex' });
      gsap.fromTo(
        mobileMenu,
        { clipPath: 'inset(0% 0% 100% 0% round 0 0 24px 24px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0 0 24px 24px)', duration: 0.55, ease: 'power4.out' }
      );
      gsap.fromTo(
        mobileMenu.querySelectorAll('a'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.15, ease: 'power2.out' }
      );
    } else {
      gsap.to(mobileMenu, {
        clipPath: 'inset(0% 0% 100% 0% round 0 0 24px 24px)',
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => gsap.set(mobileMenu, { display: 'none' })
      });
    }
  }

  navToggle?.addEventListener('click', () => setMenuOpen(!navOpen));
  mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenuOpen(false)));

  /* ==========================================================
     HERO — entrance timeline, parallax, rotating badge
     ========================================================== */
  const heroVideo = document.querySelector('.hero__img');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  }

  if (hasGSAP) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero__img', { scale: 1.25 }, { scale: 1.05, duration: 2.6, ease: 'power2.out' })
      .from('.hero__eyebrow', { y: 24, opacity: 0, duration: 0.7 }, 0.3)
      .from('.hero__title-line', { y: 70, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.45)
      .from('.hero__tagline', { y: 24, opacity: 0, duration: 0.6 }, '-=0.5')
      .from('.hero__sub', { y: 24, opacity: 0, duration: 0.7 }, '-=0.45')
      .from('.hero__actions .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.12 }, '-=0.4')
      .from('.hero__badge', { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(2.5)' }, '-=0.5');

    gsap.to('.hero__img', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    gsap.to('.hero__badge', { rotate: 360, duration: 14, repeat: -1, ease: 'none' });

    /* ---------- section-head child stagger (builder-intro / featured-head pattern) ---------- */
    gsap.utils.toArray('.section-head').forEach((el) => {
      gsap.from(el.children, {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    gsap.from('.cta-band__inner > *', {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-band', start: 'top 85%' }
    });

    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ==========================================================
     MARQUEE
     ========================================================== */
  const MARQUEE_ITEMS = [
    'Fresh Dough Daily',
    'Hand-Tossed Perfection',
    '1,000+ Combos',
    'Baked Fresh, Never Reheated',
    '100% Real Cheese',
    'Craft Your Own'
  ];

  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    const loop = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    marqueeTrack.innerHTML = loop
      .map((item) => `<span class="marquee__item">${item}</span>`)
      .join('');

    if (hasGSAP) {
      gsap.to(marqueeTrack, { xPercent: -50, ease: 'none', duration: 22, repeat: -1 });
    }
  }

  /* ==========================================================
     FEATURED PIZZAS
     ========================================================== */
  const PIZZAS = [
    {
      name: 'Pepperoni Blast',
      price: '$15.20',
      desc: 'Double pepperoni, mozzarella, oregano, a pinch of chili flakes.',
      img: 'assets/img/hero-sunset.jpg'
    },
    {
      name: 'Classic Cheese Storm',
      price: '$13.50',
      desc: 'San Marzano tomato, mozzarella, basil, olive oil.',
      img: 'assets/img/box-slice.jpg'
    },
    {
      name: 'Veggie Puzzle',
      price: '$14.90',
      desc: 'Bell peppers, onion, mushroom, olives, mozzarella.',
      img: 'assets/img/hero-sunset.jpg'
    }
  ];

  const pizzaGrid = document.getElementById('pizzaGrid');
  if (pizzaGrid) {
    pizzaGrid.innerHTML = PIZZAS.map((p) => `
      <article class="pizza-card">
        <div class="pizza-card__media">
          <img src="${p.img}" alt="${p.name} — Pizza Puzzle" loading="lazy">
        </div>
        <div class="pizza-card__footer">
          <div>
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
          </div>
          <div class="pizza-card__cta">
            <span class="pizza-price">${p.price}</span>
            <a href="#craft" class="btn btn--orange pizza-order">Order Now</a>
          </div>
        </div>
      </article>
    `).join('');

    if (hasGSAP) {
      ScrollTrigger.batch('.pizza-card', {
        start: 'top 88%',
        onEnter: (els) => gsap.to(els, {
          opacity: 1, y: 0, rotate: 0, duration: 0.85, stagger: 0.15, ease: 'power3.out'
        }),
        once: true
      });
    }
  }

  /* ==========================================================
     CRAFT YOUR PIZZA — builder
     ========================================================== */
  const STEPS = [
    {
      key: 'size', title: 'Size', hint: 'How hungry is your mood today?', type: 'single',
      options: [
        { id: 'personal', name: 'Personal 8"', price: 6.5, icon: '🍕', sizePct: 55 },
        { id: 'medium', name: 'Medium 12"', price: 9.5, icon: '🍕', sizePct: 68 },
        { id: 'large', name: 'Large 16"', price: 12.5, icon: '🍕', sizePct: 80 },
        { id: 'family', name: 'Family 20"', price: 16.5, icon: '🍕', sizePct: 92 }
      ]
    },
    {
      key: 'dough', title: 'Dough', hint: 'Pick the base for your puzzle.', type: 'single',
      options: [
        { id: 'classic', name: 'Hand-Tossed', price: 0, icon: '🥖', crust: 'radial-gradient(circle at 42% 38%, #f2c878, #d99a3f 78%, #b97a2c 100%)' },
        { id: 'thin', name: 'Thin & Crispy', price: 0, icon: '🫓', crust: 'radial-gradient(circle at 42% 38%, #f7dca0, #e2ad57 78%, #c68b37 100%)' },
        { id: 'stuffed', name: 'Cheese-Stuffed', price: 2.5, icon: '🧀', crust: 'radial-gradient(circle at 42% 38%, #ffe9a8, #eec25a 78%, #d59c3c 100%)' },
        { id: 'wheat', name: 'Whole Wheat', price: 1, icon: '🌾', crust: 'radial-gradient(circle at 42% 38%, #d9b878, #b6863f 78%, #8f6529 100%)' }
      ]
    },
    {
      key: 'sauce', title: 'Sauce', hint: 'Set the mood underneath it all.', type: 'single',
      options: [
        { id: 'tomato', name: 'Classic Tomato', price: 0, icon: '🍅', color: '#c73a1f' },
        { id: 'bbq', name: 'BBQ Swirl', price: 1, icon: '🥩', color: '#7a3418' },
        { id: 'garlic', name: 'Garlic Cream', price: 1, icon: '🧄', color: '#e8dcc0' },
        { id: 'arrabbiata', name: 'Spicy Arrabbiata', price: 1, icon: '🌶️', color: '#a11e10' }
      ]
    },
    {
      key: 'cheese', title: 'Cheese', hint: 'Every puzzle needs the right melt.', type: 'single',
      options: [
        { id: 'mozzarella', name: 'Mozzarella', price: 0, icon: '🧀', color: '#f4d883' },
        { id: 'extra', name: 'Extra Cheese', price: 1.5, icon: '🧈', color: '#f7e18f' },
        { id: 'cheddar', name: 'Cheddar Blend', price: 1.5, icon: '🟠', color: '#eeb454' },
        { id: 'vegan', name: 'Vegan Cheese', price: 2, icon: '🌱', color: '#e7e2a8' }
      ]
    },
    {
      key: 'toppings', title: 'Toppings', hint: 'Snap in up to 6 topping pieces.', type: 'multi', max: 6,
      options: [
        { id: 'pepperoni', name: 'Pepperoni', price: 1.2, icon: '🍕', color: '#b3291a' },
        { id: 'mushroom', name: 'Mushrooms', price: 0.8, icon: '🍄', color: '#caa27a' },
        { id: 'onion', name: 'Onions', price: 0.6, icon: '🧅', color: '#e7d3ea' },
        { id: 'olive', name: 'Olives', price: 0.8, icon: '🫒', color: '#2f2f2f' },
        { id: 'pepper', name: 'Bell Peppers', price: 0.8, icon: '🫑', color: '#4c9a4c' },
        { id: 'chicken', name: 'Chicken', price: 1.5, icon: '🍗', color: '#c98a4b' },
        { id: 'jalapeno', name: 'Jalapeños', price: 0.7, icon: '🌶️', color: '#4f8f3c' },
        { id: 'pineapple', name: 'Pineapple', price: 0.9, icon: '🍍', color: '#e8c93c' },
        { id: 'corn', name: 'Sweetcorn', price: 0.6, icon: '🌽', color: '#f0c93f' },
        { id: 'sausage', name: 'Sausage', price: 1.3, icon: '🌭', color: '#8a3e28' }
      ]
    },
    {
      key: 'extras', title: 'Extras', hint: 'Snap in a few final pieces.', type: 'multi', max: 4,
      options: [
        { id: 'dip-cheese', name: 'Cheese Dip', price: 1.2, icon: '🥣' },
        { id: 'dip-garlic', name: 'Garlic Dip', price: 1.2, icon: '🧄' },
        { id: 'crust-burst', name: 'Cheese Burst Edge', price: 2.5, icon: '✨' },
        { id: 'mood-sticker', name: 'Mood Sticker', price: 0.5, icon: '🧩' }
      ]
    }
  ];

  const TOPPING_RADII = [34, 30, 37, 32, 35, 29, 36, 33, 31, 35];

  const builderEl = document.getElementById('builder');
  if (builderEl) {
    const state = {
      stepIndex: 0,
      inReview: false,
      selections: {
        size: 'medium',
        dough: 'classic',
        sauce: 'tomato',
        cheese: 'mozzarella',
        toppings: [],
        extras: []
      }
    };

    const els = {
      stepLabels: document.getElementById('stepLabels'),
      barFill: document.getElementById('builderBarFill'),
      body: document.querySelector('.builder__body'),
      review: document.getElementById('builderReview'),
      reviewList: document.getElementById('reviewList'),
      reviewTotal: document.getElementById('reviewTotal'),
      stepPanel: document.getElementById('stepPanel'),
      stepTitle: document.getElementById('stepTitle'),
      stepHint: document.getElementById('stepHint'),
      optionsGrid: document.getElementById('optionsGrid'),
      btnBack: document.getElementById('btnBack'),
      btnNext: document.getElementById('btnNext'),
      btnEdit: document.getElementById('btnEdit'),
      btnOrder: document.getElementById('btnOrder'),
      priceValue: document.getElementById('priceValue'),
      pizza: document.getElementById('pizzaPreview'),
      pzCrust: document.getElementById('pzCrust'),
      pzSauce: document.getElementById('pzSauce'),
      pzCheese: document.getElementById('pzCheese'),
      pzToppings: document.getElementById('pzToppings')
    };

    const priceState = { value: 0 };
    const toppingStep = STEPS.find((s) => s.key === 'toppings');

    function findOpt(stepKey, id) {
      const step = STEPS.find((s) => s.key === stepKey);
      return step.options.find((o) => o.id === id);
    }

    function computeTotal() {
      let total = findOpt('size', state.selections.size).price;
      total += findOpt('dough', state.selections.dough).price;
      total += findOpt('sauce', state.selections.sauce).price;
      total += findOpt('cheese', state.selections.cheese).price;
      state.selections.toppings.forEach((id) => (total += findOpt('toppings', id).price));
      state.selections.extras.forEach((id) => (total += findOpt('extras', id).price));
      return total;
    }

    function animatePrice() {
      const total = computeTotal();
      if (hasGSAP) {
        gsap.to(priceState, {
          value: total, duration: 0.6, ease: 'power2.out',
          onUpdate: () => { els.priceValue.textContent = '$' + priceState.value.toFixed(2); }
        });
      } else {
        els.priceValue.textContent = '$' + total.toFixed(2);
      }
    }

    function renderStepLabels() {
      els.stepLabels.innerHTML = '';
      STEPS.forEach((s, i) => {
        const span = document.createElement('span');
        span.textContent = s.title;
        if (i < state.stepIndex || state.inReview) span.classList.add('is-done');
        if (i === state.stepIndex && !state.inReview) span.classList.add('is-active');
        els.stepLabels.appendChild(span);
      });
      const reviewSpan = document.createElement('span');
      reviewSpan.textContent = 'Review';
      if (state.inReview) reviewSpan.classList.add('is-active');
      els.stepLabels.appendChild(reviewSpan);

      const pct = state.inReview ? 100 : (state.stepIndex / STEPS.length) * 100;
      if (hasGSAP) gsap.to(els.barFill, { width: pct + '%', duration: 0.6, ease: 'power3.out' });
      else els.barFill.style.width = pct + '%';
    }

    /* pre-render every possible topping dot once; selection just toggles .is-active,
       matching PizzaVisual.jsx's always-mounted topping markers */
    function buildToppingDots() {
      els.pzToppings.innerHTML = '';
      toppingStep.options.forEach((t, i) => {
        const angle = (i / toppingStep.options.length) * 360 - 90;
        const radius = TOPPING_RADII[i % TOPPING_RADII.length];
        const rad = (angle * Math.PI) / 180;
        const x = 50 + radius * Math.cos(rad);
        const y = 50 + radius * Math.sin(rad);

        const dot = document.createElement('div');
        dot.className = 'topping-dot';
        dot.dataset.id = t.id;
        dot.style.left = x + '%';
        dot.style.top = y + '%';
        dot.style.setProperty('--delay', `${i * 0.03}s`);
        dot.style.background = t.color;
        dot.textContent = t.icon;
        els.pzToppings.appendChild(dot);
      });
    }

    function syncToppingDots() {
      els.pzToppings.querySelectorAll('.topping-dot').forEach((dot) => {
        dot.classList.toggle('is-active', state.selections.toppings.includes(dot.dataset.id));
      });
    }

    function updatePizzaVisual() {
      const size = findOpt('size', state.selections.size);
      const dough = findOpt('dough', state.selections.dough);
      const sauce = findOpt('sauce', state.selections.sauce);
      const cheese = findOpt('cheese', state.selections.cheese);

      els.pizza.style.width = size.sizePct + '%';
      els.pzCrust.style.background = dough.crust;
      els.pzSauce.style.background = sauce.color;
      els.pzCheese.style.background = cheese.color;
      syncToppingDots();
    }

    function renderOptions() {
      const step = STEPS[state.stepIndex];
      els.stepTitle.textContent = step.title;
      els.stepHint.textContent = step.hint;
      els.optionsGrid.innerHTML = '';

      step.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'opt';
        const selected = step.type === 'single'
          ? state.selections[step.key] === opt.id
          : state.selections[step.key].includes(opt.id);
        if (selected) btn.classList.add('is-selected');

        btn.innerHTML = `
          <span class="opt__icon">${opt.icon}</span>
          <span class="opt__name">${opt.name}</span>
          <span class="opt__price">${opt.price > 0 ? '+$' + opt.price.toFixed(2) : 'Included'}</span>
        `;

        btn.addEventListener('click', () => handleSelect(step, opt, btn));
        els.optionsGrid.appendChild(btn);
      });

      els.btnBack.disabled = state.stepIndex === 0;
      els.btnNext.textContent = state.stepIndex === STEPS.length - 1 ? 'Review Order' : 'Next';

      /* restart the CSS stepIn keyframe (equivalent to React's key={step} remount) */
      if (els.stepPanel) {
        els.stepPanel.style.animation = 'none';
        void els.stepPanel.offsetHeight;
        els.stepPanel.style.animation = '';
      }
    }

    function handleSelect(step, opt, btn) {
      if (step.type === 'single') {
        state.selections[step.key] = opt.id;
      } else {
        const arr = state.selections[step.key];
        const idx = arr.indexOf(opt.id);
        if (idx > -1) {
          arr.splice(idx, 1);
        } else {
          if (arr.length >= step.max) {
            if (hasGSAP) gsap.fromTo(btn, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
            return;
          }
          arr.push(opt.id);
        }
      }
      renderOptions();
      updatePizzaVisual();
      animatePrice();
    }

    function showReview() {
      state.inReview = true;
      els.body.hidden = true;
      els.review.hidden = false;
      els.reviewList.innerHTML = '';

      const rows = [
        ['Size', findOpt('size', state.selections.size).name],
        ['Dough', findOpt('dough', state.selections.dough).name],
        ['Sauce', findOpt('sauce', state.selections.sauce).name],
        ['Cheese', findOpt('cheese', state.selections.cheese).name],
        ['Toppings', state.selections.toppings.length ? state.selections.toppings.map((id) => findOpt('toppings', id).name).join(', ') : 'None'],
        ['Extras', state.selections.extras.length ? state.selections.extras.map((id) => findOpt('extras', id).name).join(', ') : 'None']
      ];
      rows.forEach(([label, val]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${label}</span><b>${val}</b>`;
        els.reviewList.appendChild(li);
      });

      els.reviewTotal.textContent = '$' + computeTotal().toFixed(2);
      renderStepLabels();

      if (hasGSAP) {
        gsap.from(els.review.querySelector('.builder__review-card'), { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out' });
        gsap.from(els.reviewList.children, { opacity: 0, x: -10, duration: 0.35, stagger: 0.06, delay: 0.15 });
      }
    }

    function backToBuilder() {
      state.inReview = false;
      els.review.hidden = true;
      els.body.hidden = false;
      renderStepLabels();
    }

    els.btnNext.addEventListener('click', () => {
      if (state.stepIndex === STEPS.length - 1) { showReview(); return; }
      state.stepIndex++;
      renderOptions();
      renderStepLabels();
    });

    els.btnBack.addEventListener('click', () => {
      if (state.stepIndex === 0) return;
      state.stepIndex--;
      renderOptions();
      renderStepLabels();
    });

    els.btnEdit.addEventListener('click', backToBuilder);

    els.btnOrder.addEventListener('click', () => {
      const original = els.btnOrder.textContent;
      els.btnOrder.textContent = 'Added! 🧩🎉';
      els.btnOrder.disabled = true;
      if (hasGSAP) {
        gsap.fromTo(els.btnOrder, { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.inOut' });
      }
      setTimeout(() => {
        els.btnOrder.textContent = original;
        els.btnOrder.disabled = false;
      }, 2200);
    });

    // init
    buildToppingDots();
    state.selections.toppings = ['pepperoni', 'mushroom'];
    renderStepLabels();
    renderOptions();
    updatePizzaVisual();
    animatePrice();

    if (hasGSAP) {
      gsap.from('#builder', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '#builder', start: 'top 88%' }
      });
    }
  }

  /* ==========================================================
     TESTIMONIAL — word-by-word scroll scrub
     ========================================================== */
  const QUOTE = 'Every slice fits my mood perfectly. Pizza Puzzle solved my cravings in one bite.';
  const testimonialQuote = document.getElementById('testimonialQuote');
  if (testimonialQuote) {
    testimonialQuote.innerHTML = QUOTE.split(' ')
      .map((w) => `<span class="quote-word">${w}&nbsp;</span>`)
      .join('');

    if (hasGSAP) {
      gsap.to('.quote-word', {
        opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: '.testimonial', start: 'top 75%', end: 'top 20%', scrub: true }
      });
    }
  }

  /* ==========================================================
     ABOUT / OUR STORY — side reveals, rotating blob, stat counters
     ========================================================== */
  const STATS = [
    { value: 6, suffix: '+', label: 'Years Piecing Pizzas' },
    { value: 300, suffix: 'K+', label: 'Puzzles Solved' },
    { value: 10, suffix: '', label: 'City Locations' },
    { value: 4.8, suffix: '★', label: 'Average Rating', decimals: 1 }
  ];

  const statsGrid = document.getElementById('statsGrid');
  if (statsGrid) {
    statsGrid.innerHTML = STATS.map((s) => `
      <div class="stat-card">
        <div class="stat-card__row">
          <span class="stat-value" data-value="${s.value}" data-decimals="${s.decimals ?? 0}">0</span>
          <span class="stat-suffix">${s.suffix}</span>
        </div>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');

    if (hasGSAP) {
      gsap.from('.about__media', {
        x: -60, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about__media', start: 'top 82%' }
      });
      gsap.from('.about__copy > *', {
        x: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.about__copy', start: 'top 82%' }
      });
      gsap.to('.about__blob', { rotate: 360, duration: 40, repeat: -1, ease: 'none' });

      document.querySelectorAll('.stat-value').forEach((el) => {
        const target = parseFloat(el.dataset.value);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.6, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = obj.val.toFixed(decimals); }
        });
      });
    }
  }
})();
