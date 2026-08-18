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
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      if (formData.get('bot-field')) return;   // honeypot anti-spam
      formData.delete('bot-field');            // mail limpio

      submitBtn.disabled = true;
      btnText.textContent = 'Sending...';

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          btnText.textContent = 'Quote sent ✔';
          submitBtn.style.background = '#22c55e';
          submitBtn.style.color = '#fff';
          form.reset();
          setTimeout(() => {
            btnText.textContent = 'Submit Request';
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
          }, 3000);
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        btnText.textContent = 'Error — try again';
        submitBtn.disabled = false;
        console.error('Form submission error:', err);
      }
    });
  }
});