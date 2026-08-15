document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Dynamic Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Custom Cursor
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 1024) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
    });

    document.querySelectorAll('a, button, input, select, .hover-target').forEach(el => {
      el.addEventListener('mouseenter', () => isHovering = true);
      el.addEventListener('mouseleave', () => isHovering = false);
    });

    function render() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      const scale = isHovering ? 'scale(1.5)' : 'scale(1)';
      ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%)) ${scale}`;
      dot.style.opacity = isHovering ? '0' : '1';

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  // Tilt Cards
  document.querySelectorAll('.tilt-card').forEach(card => {
    const inner = card.querySelector('.tilt-inner');
    if (!inner) return;
    card.addEventListener('mousemove', e => {
      if (window.innerWidth < 1024) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;
      inner.style.transform = `rotateX(${-yPct * 5}deg) rotateY(${xPct * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });

  // Form handling
  const form = document.getElementById('quote-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const origin = document.getElementById('q-origin').value;
      const dest = document.getElementById('q-dest').value;
      const type = document.getElementById('q-type').value;
      const weight = document.getElementById('q-weight').value;

      const subject = encodeURIComponent("Quote Request");
      const body = encodeURIComponent(
        `Hello St. Lucia Express,\n\nI would like to request a quote for the following shipment:\n\n` +
        `- Origin: ${origin}\n` +
        `- Destination: ${dest}\n` +
        `- Type: ${type}\n` +
        `- Weight/Volume: ${weight}\n\n` +
        `Please contact me with an estimate.\n\nThank you.`
      );
      window.location.href = `mailto:ingrid@stluciaexpress.com?subject=${subject}&body=${body}`;
    });
  }
});