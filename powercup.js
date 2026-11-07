const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionTargets = document.querySelectorAll([
  '[data-pc-motion]', '.pc-features li', '.pc-checks li', '.pc-size-list li',
  '.pc-video-copy', '.pc-review-credit', '.pc-promos h2', '.pc-pack',
  '.pc-trust li', '.pc-deal', '.pc-dispatch', '.pc-buy',
].join(', '));
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      entry.target.classList.toggle('is-in-view', entry.intersectionRatio >= .18);
    }
  }, { threshold: .18 });
  motionTargets.forEach(group => observer.observe(group));
} else {
  motionTargets.forEach(group => group.classList.add('is-in-view'));
}

function startCarousel(track, delay) {
  const lastIndex = track.children.length - 1;
  const section = track.closest('[data-pc-motion]');
  let direction = 1;
  let lastInteraction = -Infinity;

  function currentSlide() {
    return Math.min(lastIndex, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
  }
  function showSlide(index) {
    track.scrollTo({
      left: track.clientWidth * Math.min(lastIndex, Math.max(0, index)),
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }
  function advance() {
    if (reducedMotion.matches || document.hidden || document.querySelector('dialog[open]') ||
        !section.classList.contains('is-in-view') || track.matches(':hover, :focus-within') ||
        performance.now() - lastInteraction < 4500) return;
    const index = currentSlide();
    if (index === 0) direction = 1;
    if (index === lastIndex) direction = -1;
    showSlide(index + direction);
  }

  track.addEventListener('pointerdown', () => { lastInteraction = performance.now(); });
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    lastInteraction = performance.now();
    showSlide(currentSlide() + (event.key === 'ArrowRight' ? 1 : -1));
  });
  setTimeout(() => {
    advance();
    setInterval(advance, 3400);
  }, delay);
}

startCarousel(document.querySelector('.pc-review-track'), 3400);
startCarousel(document.querySelector('.pc-gallery-track'), 4400);
