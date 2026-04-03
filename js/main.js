// ARCADE VOID — Main JS

document.addEventListener('DOMContentLoaded', () => {

  // ── Card hover sound effect (visual feedback via class) ──
  const activeCards = document.querySelectorAll('.game-card.active');
  activeCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ── Intersection Observer: animate cards on scroll ──
  const cards = document.querySelectorAll('.game-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 0.08}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.25s, background 0.25s';
    observer.observe(card);
  });

  // Trigger visible class
  document.querySelectorAll('.game-card').forEach(card => {
    card.classList.add = (cls) => {
      if (cls === 'visible') {
        card.style.opacity = card.classList.contains('empty') ? '0.4' : '1';
        card.style.transform = 'translateY(0)';
      }
    };
  });

  // Simpler fallback: just reveal after short delay
  setTimeout(() => {
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.style.opacity = card.classList.contains('empty') ? '0.4' : '1';
        card.style.transform = 'translateY(0)';
      }, i * 100);
    });
  }, 200);

  // ── Console easter egg ──
  console.log('%c[ARCADE VOID]', 'color: #f5c400; font-size: 18px; font-weight: bold;');
  console.log('%cWelcome, player. Add your games to the grid.', 'color: #a88800; font-size: 12px;');

});
