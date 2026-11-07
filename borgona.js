const galleryImage = document.querySelector('#gallery-image');
const thumbnails = Array.from(document.querySelectorAll('[data-gallery]'));
const galleryDots = Array.from(document.querySelectorAll('.gallery-dots .dot'));

let currentGalleryIdx = 0;
let galleryTimer = null;

function setGallerySlide(index) {
  if (!thumbnails.length || !galleryImage) return;
  currentGalleryIdx = (index + thumbnails.length) % thumbnails.length;
  const currentThumb = thumbnails[currentGalleryIdx];

  galleryImage.style.opacity = '0.35';
  setTimeout(() => {
    galleryImage.src = 'assets/' + currentThumb.dataset.gallery;
    const label = currentThumb.getAttribute('aria-label');
    if (label) galleryImage.alt = label.replace('Ver ', '');
    galleryImage.style.opacity = '1';
  }, 120);

  thumbnails.forEach((t, i) => {
    t.setAttribute('aria-pressed', String(i === currentGalleryIdx));
  });

  galleryDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentGalleryIdx);
  });
}

function startGalleryAutoPlay() {
  if (galleryTimer) clearInterval(galleryTimer);
  galleryTimer = setInterval(() => {
    const dialog = document.querySelector('#order-dialog');
    if (!document.hidden && (!dialog || !dialog.open)) {
      setGallerySlide(currentGalleryIdx + 1);
    }
  }, 3500);
}

thumbnails.forEach((thumbnail, idx) => {
  thumbnail.addEventListener('click', () => {
    setGallerySlide(idx);
    clearInterval(galleryTimer);
    setTimeout(startGalleryAutoPlay, 7000);
  });
});

galleryDots.forEach((dot, idx) => {
  dot.addEventListener('click', () => {
    setGallerySlide(idx);
    clearInterval(galleryTimer);
    setTimeout(startGalleryAutoPlay, 7000);
  });
});

startGalleryAutoPlay();

const demoEndsAt = Date.now() + 86399000;
function updateDemoClock() {
  const remaining = Math.max(0, Math.floor((demoEndsAt - Date.now()) / 1000));
  const units = {
    hours: Math.floor(remaining / 3600),
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60,
  };
  for (const [name, value] of Object.entries(units)) {
    document.querySelector('[data-clock="' + name + '"]').textContent = String(value).padStart(2, '0');
  }
}
updateDemoClock();
setInterval(updateDemoClock, 1000);

function forwardPulse(depth, peak) {
  const rest = { transform: 'perspective(420px) translateZ(0) scale(1)', filter: 'none' };
  return [
    rest,
    {
      offset: peak,
      transform: `perspective(420px) translateZ(${depth}px) scale(1.04)`,
      filter: 'brightness(1.12) drop-shadow(0 3px 7px #e8b96560)',
    },
    rest,
  ];
}

const rise = [
  { translate: '0 5px', opacity: .72 },
  { translate: '0 0', opacity: 1 },
];
const productSpotlight = [
  { scale: '.98', translate: '0 4px' },
  { scale: '1.035', translate: '0 -3px' },
  { scale: '1', translate: '0 0' },
];
const gleam = [
  { filter: 'none' },
  { filter: 'brightness(1.16) drop-shadow(0 0 5px #e2a74880)' },
  { filter: 'none' },
];
const accent = [
  { scale: '1', translate: '0 0' },
  { scale: '1.055', translate: '0 -2px' },
  { scale: '1', translate: '0 0' },
];
const badge = [
  { translate: '0 0', rotate: '0deg', filter: 'none' },
  { translate: '0 -4px', rotate: '-4deg', filter: 'brightness(1.18)' },
  { translate: '0 -2px', rotate: '3deg', filter: 'brightness(1.08)' },
  { translate: '0 0', rotate: '0deg', filter: 'none' },
];
const truck = [
  { translate: '0 0', opacity: 1 },
  { translate: '7px -1px', opacity: 1, offset: .57 },
  { translate: '0 0', opacity: 1 },
];

function highlightsFor(selector, frames, duration, repeats = false) {
  return Array.from(document.querySelectorAll(selector), element => ({
    element,
    frames: frames.map(frame => ({ easing: 'ease-in-out', ...frame })),
    duration,
    repeats,
    played: false,
  }));
}

const highlights = [
  ...highlightsFor('.hero-cup', productSpotlight, 800),
  ...highlightsFor('.hero h1', rise, 460),
  ...highlightsFor('.hero-cta .cta', forwardPulse(17, .43), 1000, true),
  ...highlightsFor('.gold-stroke', gleam, 350),
  ...highlightsFor('.generation', badge, 540),
  ...highlightsFor('.hero-features li', accent, 330),
  ...highlightsFor('.hero-trust .icon-truck', truck, 600, true),
  ...highlightsFor('.hero-trust .icon:not(.icon-truck), .benefits .icon', accent, 330),
  ...highlightsFor('.detail-copy', rise, 420),
  ...highlightsFor('.detail-image img', productSpotlight, 640),
  ...highlightsFor('.detail-checks li', rise, 250),
  ...highlightsFor('.thumbnails button', gleam, 310),
  ...highlightsFor('#offers-title', rise, 420),
  ...highlightsFor('.timer', accent, 920, true),
  ...highlightsFor('.offer .popular', badge, 850, true),
  ...highlightsFor('.offer-cups', productSpotlight, 580),
  ...highlightsFor('.offer-cost', accent, 510),
  ...highlightsFor('#reviews-title, .review-grid article', rise, 440),
  ...highlightsFor('.review-grid .stars', gleam, 540),
  ...highlightsFor('.guarantee-seal', gleam, 720),
  ...highlightsFor('#guarantee-title', rise, 440),
];

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const orderDialog = document.querySelector('#order-dialog');
const visibleHighlights = new Set();
let activeHighlight;
let highlightPause;
let lastHighlight = -1;

function playNextHighlight() {
  if (activeHighlight || highlightPause || motionPreference.matches || document.hidden || orderDialog.open) return;

  for (let step = 1; step <= highlights.length; step += 1) {
    const index = (lastHighlight + step) % highlights.length;
    const highlight = highlights[index];
    const { element, frames, duration, repeats, played } = highlight;
    if (!visibleHighlights.has(element) || (played && !repeats)) continue;

    lastHighlight = index;
    activeHighlight = element.animate(frames, { duration });
    activeHighlight.finished.then(
      () => {
        highlight.played = true;
        endHighlight(repeats ? 360 : 90);
      },
      () => endHighlight(90),
    );
    return;
  }
}

function endHighlight(pause) {
  activeHighlight = undefined;
  highlightPause = setTimeout(() => {
    highlightPause = undefined;
    playNextHighlight();
  }, pause);
}

function syncHighlightPlayback() {
  if (motionPreference.matches || document.hidden || orderDialog.open) {
    activeHighlight?.cancel();
    return;
  }
  playNextHighlight();
}

const highlightObserver = new IntersectionObserver(entries => {
  for (const { target, intersectionRatio } of entries) {
    if (intersectionRatio >= .55) visibleHighlights.add(target);
    else visibleHighlights.delete(target);
  }
  if (activeHighlight && !visibleHighlights.has(activeHighlight.effect.target)) {
    activeHighlight.cancel();
  }
  playNextHighlight();
}, { threshold: .55 });
for (const { element } of highlights) highlightObserver.observe(element);

motionPreference.addEventListener('change', syncHighlightPlayback);
document.addEventListener('visibilitychange', syncHighlightPlayback);
new MutationObserver(syncHighlightPlayback).observe(orderDialog, { attributeFilter: ['open'] });
