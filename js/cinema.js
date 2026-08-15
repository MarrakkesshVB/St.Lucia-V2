/* === M4 CINEMA LAYER — Lenis + parallax === */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* --- Lenis: smooth scroll mantecoso (solo desktop con mouse) --- */
  let lenis = null;
  if (!reduced && !isTouch && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    // Anclas con el mismo feel mantecoso
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
        }
      });
    });
  }

  /* --- GSAP: parallax cinematográfico del hero --- */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // El fondo del hero se mueve más lento que el frente (profundidad)
    gsap.to('.hero-bg', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-bg', start: 'top top', end: 'bottom top', scrub: true }
    });

    // El contenido del hero se despide con fade al scrollear
    gsap.to('.hero-content', {
      yPercent: -10,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-bg', start: 'top top', end: '80% top', scrub: true }
    });
  }
})();