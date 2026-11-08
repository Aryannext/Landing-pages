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

// ========================================================
// ARREGLO DE OBJETOS: TESTIMONIOS Y RESEÑAS EN TIEMPO REAL
// ========================================================
export const customerReviews = [
  {
    name: "Carlos M.",
    city: "Bogotá",
    time: "Hace 3 min",
    stars: 5,
    text: "Excelente calidad, muy discreto y realista. Superó mis expectativas en todos los sentidos."
  },
  {
    name: "Andrés R.",
    city: "Medellín",
    time: "Hace 11 min",
    stars: 5,
    text: "Es cómodo, fácil de limpiar y el material se siente increíble. Llegó súper rápido y bien sellado."
  },
  {
    name: "Julián S.",
    city: "Cali",
    time: "Hace 24 min",
    stars: 5,
    text: "Llegó al día siguiente de pedirlo. La caja vino 100% sellada en plástico negro, sin logos ni nombres. Cero pena con el repartidor."
  },
  {
    name: "Mateo G.",
    city: "Barranquilla",
    time: "Hace 36 min",
    stars: 5,
    text: "Tenía dudas por pedir online, pero con el pago contra entrega estuve 100% tranquilo. Pagué en efectivo al recibirlo."
  },
  {
    name: "David H.",
    city: "Bucaramanga",
    time: "Hace 52 min",
    stars: 5,
    text: "El material de TPE de grado médico es ultra suave y se calienta rápido al tacto. Se limpia en dos minutos con agua tibia."
  },
  {
    name: "Sebastián P.",
    city: "Pereira",
    time: "Hace 1 hora",
    stars: 5,
    text: "La atención por WhatsApp para confirmar los datos fue muy respetuosa y rápida. Lo recibí en mi portería sin ningún inconveniente."
  },
  {
    name: "Felipe T.",
    city: "Cartagena",
    time: "Hace 2 horas",
    stars: 5,
    text: "Vale totalmente cada peso. El diseño es ergonómico, de fácil agarre y no genera ruidos incómodos. Muy superior a lo que esperaba."
  },
  {
    name: "Camilo B.",
    city: "Manizales",
    time: "Hace 3 horas",
    stars: 5,
    text: "Aproveché la oferta de 2 unidades con un amigo y ambos quedamos fascinados. Envío gratis y empaque totalmente sellado y confidencial."
  }
];

function initReviewsRotator() {
  const stage = document.querySelector('#reviews-stage');
  const dotsContainer = document.querySelector('#reviews-dots');
  const prevBtn = document.querySelector('#reviews-prev');
  const nextBtn = document.querySelector('#reviews-next');
  const rotator = document.querySelector('#reviews-rotator');

  if (!stage || !rotator) return;

  let currentPage = 0;
  let autoplayTimer = null;
  let isHovered = false;

  function getItemsPerPage() {
    return window.innerWidth <= 620 ? 1 : 2;
  }

  function getTotalPages() {
    const perPage = getItemsPerPage();
    return Math.ceil(customerReviews.length / perPage);
  }

  function buildCardsHtml(reviews) {
    return reviews.map(r => `
      <article class="review-card review-msg-card new-arrival">
        <div class="review-top">
          <div class="stars" aria-hidden="true">${'★'.repeat(r.stars)}</div>
          <div class="review-meta-badges">
            <span class="verified-tag"><span class="icon icon-check" aria-hidden="true"></span> Compra verificada</span>
            <span class="review-time-tag"><span class="msg-dot" aria-hidden="true"></span> ${r.time}</span>
          </div>
        </div>
        <blockquote>“${r.text}”</blockquote>
        <div class="review-bottom">
          <p class="reviewer"><span class="icon icon-person" aria-hidden="true"></span> ${r.name} <small>· ${r.city}</small></p>
          <span class="review-channel-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg> Confirmado
          </span>
        </div>
      </article>
    `).join('');
  }

  function renderPage(page, animate = true) {
    const perPage = getItemsPerPage();
    const totalPages = getTotalPages();
    currentPage = (page + totalPages) % totalPages;

    const startIdx = currentPage * perPage;
    const currentReviews = customerReviews.slice(startIdx, startIdx + perPage);

    if (animate && stage.children.length > 0) {
      const oldCards = Array.from(stage.querySelectorAll('.review-msg-card'));
      
      // Animación de salida: desplazamiento hacia arriba con desvanecimiento
      const exitAnimations = oldCards.map(card => card.animate([
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(-32px)', opacity: 0 }
      ], { duration: 240, easing: 'cubic-bezier(0.4, 0, 0.7, 1)' }));

      Promise.all(exitAnimations.map(a => a.finished).concat(new Promise(res => setTimeout(res, 220)))).then(() => {
        stage.innerHTML = buildCardsHtml(currentReviews);
        const newCards = Array.from(stage.querySelectorAll('.review-msg-card'));

        // Animación de entrada: los mensajes nuevos llegan subiendo desde abajo con ligero efecto elástico
        newCards.forEach((card, idx) => {
          card.animate([
            { transform: 'translateY(42px) scale(0.96)', opacity: 0 },
            { transform: 'translateY(-4px) scale(1.01)', opacity: 1, offset: 0.75, easing: 'ease-out' },
            { transform: 'translateY(0) scale(1)', opacity: 1 }
          ], {
            duration: 440,
            delay: idx * 95,
            easing: 'cubic-bezier(0.18, 0.89, 0.32, 1.15)',
            fill: 'backwards'
          });

          setTimeout(() => card.classList.remove('new-arrival'), 1400);
        });
      });
    } else {
      stage.innerHTML = buildCardsHtml(currentReviews);
      stage.querySelectorAll('.new-arrival').forEach(c => c.classList.remove('new-arrival'));
    }

    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const totalPages = getTotalPages();

    if (dotsContainer.children.length !== totalPages) {
      dotsContainer.innerHTML = Array.from({ length: totalPages }, (_, i) =>
        `<button type="button" class="dot ${i === currentPage ? 'active' : ''}" data-review-page="${i}" aria-label="Ir a página ${i + 1} de testimonios"></button>`
      ).join('');

      dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          renderPage(idx);
          restartAutoplay();
        });
      });
    } else {
      dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentPage);
      });
    }
  }

  function nextPage() {
    renderPage(currentPage + 1);
  }

  function prevPage() {
    renderPage(currentPage - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextPage();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevPage();
      restartAutoplay();
    });
  }

  function startAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      const dialog = document.querySelector('#order-dialog');
      if (!isHovered && !document.hidden && (!dialog || !dialog.open)) {
        nextPage();
      }
    }, 4500);
  }

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    startAutoplay();
  }

  rotator.addEventListener('mouseenter', () => { isHovered = true; });
  rotator.addEventListener('mouseleave', () => { isHovered = false; });

  // Soporte táctil en móvil (Swipe)
  let touchStartX = 0;
  rotator.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    isHovered = true;
  }, { passive: true });

  rotator.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    isHovered = false;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextPage();
      else prevPage();
      restartAutoplay();
    }
  }, { passive: true });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderPage(currentPage, false);
    }, 150);
  });

  renderPage(0, false);
  startAutoplay();
}

initReviewsRotator();

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
  ...highlightsFor('#reviews-title, .review-card, .reviews-privacy-card', rise, 440),
  ...highlightsFor('.reviews .stars', gleam, 540),
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
