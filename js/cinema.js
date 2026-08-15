/* === M4 CINEMA LAYER — Lenis + GSAP motion system (único dueño) === */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* --- 1) Reveals: tomamos el control desde el CSS --- */
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  revealEls.forEach((el) =>
    el.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3')
  );

  /* --- 2) Lenis: smooth scroll mantecoso (solo desktop con mouse) --- */
  let lenis = null;
  if (!reduced && !isTouch && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0, duration: 1.6 }); }
        }
      });
    });
  }

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);

    // Sync oficial Lenis ↔ GSAP
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    if (!reduced) {
      /* --- 3) Reveals con stagger + easing power3 --- */
      const groups = new Map();
      revealEls.forEach((el) => {
        const p = el.parentElement || document.body;
        if (!groups.has(p)) groups.set(p, []);
        groups.get(p).push(el);
      });
      groups.forEach((els) => {
        gsap.from(els, {
          y: 36, opacity: 0, duration: 1.1, ease: 'power3.out',
          stagger: 0.12, clearProps: 'all',
          scrollTrigger: { trigger: els[0], start: 'top 90%' }
        });
      });

      /* --- 4) Counters con curva suave --- */
      document.querySelectorAll('.counter').forEach((el) => {
        const target = parseInt(el.dataset.to, 10) || 0;
        const state = { v: 0 };
        gsap.to(state, {
          v: target, duration: 2.2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
          onUpdate: () => { el.innerText = Math.floor(state.v); },
          onComplete: () => { el.innerText = target; }
        });
      });

      /* --- 5) Parallax del hero (ahora con un solo dueño) --- */
      if (!isTouch) {
        gsap.to('.hero-bg', {
          yPercent: 18, ease: 'none',
          scrollTrigger: { trigger: '.hero-bg', start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.hero-content', {
          yPercent: -10, opacity: 0.35, ease: 'none',
          scrollTrigger: { trigger: '.hero-bg', start: 'top top', end: '80% top', scrub: true }
        });
      }

      /* --- 6) Líneas de ruta (Destinations) --- */
      document.querySelectorAll('.path-anim').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 90%', once: true,
          onEnter: () => el.classList.add('active')
        });
      });
    }
  }

  /* --- Fallbacks (reduced-motion o CDN caído): todo visible --- */
  if (reduced || !hasGsap) {
    document.querySelectorAll('.counter').forEach((el) => { el.innerText = el.dataset.to || '0'; });
    document.querySelectorAll('.path-anim').forEach((el) => el.classList.add('active'));
  }
})();