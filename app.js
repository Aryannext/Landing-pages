import { PRODUCT } from './config.js';
import { normalizePhone, createOrder, buildMessage, buildWhatsAppUrl } from './order.js';
const orderDialog = document.querySelector('#order-dialog');
const orderForm = document.querySelector('#order-form');
const money = value => '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const retailMoney = value => '$' + value.toLocaleString('es-CO');
document.querySelectorAll('[data-price]').forEach(element => {
  const pack = PRODUCT.packs.find(pack => pack.quantity === Number(element.dataset.price));
  if (pack) element.textContent = retailMoney(pack.price);
});
document.querySelectorAll('[data-compare], [data-saving]').forEach(element => {
  const quantity = Number(element.dataset.compare || element.dataset.saving);
  const pack = PRODUCT.packs.find(pack => pack.quantity === quantity);
  if (pack && quantity > 1) element.textContent = element.hasAttribute('data-compare')
    ? retailMoney(quantity * PRODUCT.packs[0].price)
    : `Ahorras ${retailMoney(quantity * PRODUCT.packs[0].price - pack.price)}`;
});
const packOptions = PRODUCT.packs.map((pack, i) => ({ ...pack,
  title: ['COMPRA 1 UNIDAD (IDEAL PARA PROBAR)', 'COMPRA 2 UNIDADES (PACK RECOMENDADO)', 'COMPRA 3 UNIDADES (MÁXIMO AHORRO)'][i],
  badge: ['PRECIO ESPECIAL', 'PACK RECOMENDADO', 'MEJOR PRECIO'][i], type: ['', 'popular', 'saving'][i],
}));
let selectedPack = 0;
let lastTrigger;
let locations = {};
function invalidateSummary() {
  document.querySelector('#prepared-order').hidden = true;
  document.querySelector('#order-feedback').hidden = true;
  document.querySelector('#order-message').value = '';
  document.querySelector('#whatsapp-link').href = `https://wa.me/${PRODUCT.whatsapp}`;
}
function renderPacks() {
  document.querySelector('#packs').innerHTML = '<legend class="sr-only">Elige tu pack</legend>' + packOptions.map((pack, i) => `<div class="pack ${i === selectedPack ? 'selected' : ''}">
    <button class="pack-choice" type="button" data-pack="${i}" aria-pressed="${i === selectedPack}">
      <span class="order-pack-art" aria-hidden="true">${'<img src="assets/velio-cutout-v2.png" alt="" width="953" height="1650">'.repeat(pack.quantity)}</span>
      <span class="pack-copy">${pack.title}<br><span class="pack-badge ${pack.type}">${pack.badge}</span></span>
      <span class="pack-prices">${i ? `<small class="pack-savings">Ahorras ${retailMoney(pack.quantity * packOptions[0].price - pack.price)}</small>` : ''}<strong class="pack-final-price">${money(pack.price)}</strong></span>
    </button>
    ${i === selectedPack ? `<div class="variant-rows"><div class="selected-detail"><strong>${pack.quantity} ${pack.quantity === 1 ? 'copa' : 'copas'} · Crema dorado</strong><span>TPE suave · Uso manual sin pilas</span></div></div>` : ''}</div>`).join('');
  document.querySelectorAll('[data-total]').forEach(element => element.textContent = money(packOptions[selectedPack].price));
}
document.querySelector('#packs').addEventListener('click', event => {
  const button = event.target.closest('[data-pack]');
  if (!button) return;
  selectedPack = Number(button.dataset.pack);
  renderPacks();
  invalidateSummary();
  document.querySelector(`[data-pack="${selectedPack}"]`).focus({ preventScroll: true });
});
document.querySelectorAll('[data-open-order]').forEach(button => button.addEventListener('click', () => {
  lastTrigger = button;
  if (button.hasAttribute('data-order-pack')) {
    selectedPack = Number(button.dataset.orderPack);
    renderPacks();
    invalidateSummary();
  }
  orderDialog.showModal();
  orderDialog.scrollTop = 0;
  orderDialog.querySelector('.close-modal').focus({ preventScroll: true });
}));
document.querySelectorAll('dialog .close-modal').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
orderDialog.addEventListener('close', () => lastTrigger?.focus({ preventScroll: true }));
orderDialog.addEventListener('click', event => {
  const rect = orderDialog.getBoundingClientRect();
  if (event.target === orderDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) orderDialog.close();
});
const departments = document.querySelector('#department');
const cities = document.querySelector('#city');
fetch('assets/colombia.json').then(response => {
  if (!response.ok) throw new Error('No se pudo cargar el listado de ciudades.');
  return response.json();
}).then(data => {
  locations = data;
  Object.keys(data).sort((a, b) => a.localeCompare(b, 'es')).forEach(name => departments.add(new Option(name, name)));
}).catch(() => feedback('No se pudo cargar el listado de ciudades. Vuelve a cargar la página.'));
departments.addEventListener('change', () => {
  cities.replaceChildren(new Option('Ciudad', ''));
  (locations[departments.value] || []).forEach(name => cities.add(new Option(name, name)));
});
document.querySelector('#phone').addEventListener('input', event => event.target.setCustomValidity(''));
orderForm.addEventListener('input', invalidateSummary);
orderForm.addEventListener('change', invalidateSummary);
function feedback(text) {
  const element = document.querySelector('#order-feedback');
  element.hidden = false;
  element.className = 'feedback';
  element.textContent = text;
}
function prepare() {
  const phone = document.querySelector('#phone');
  phone.setCustomValidity(normalizePhone(phone.value) ? '' : 'Escribe un celular colombiano de 10 dígitos que empiece por 3.');
  if (!orderForm.reportValidity()) return null;
  if (!locations[departments.value]?.includes(cities.value)) { feedback('Selecciona tu departamento y ciudad.'); return null; }
  try {
    const order = createOrder(packOptions[selectedPack].quantity, Object.fromEntries(new FormData(orderForm)));
    document.querySelector('#order-message').value = buildMessage(order);
    document.querySelector('#whatsapp-link').href = buildWhatsAppUrl(order);
    document.querySelector('#prepared-order').hidden = false;
    return order;
  } catch (error) { feedback(error.message); return null; }
}
orderForm.addEventListener('submit', event => {
  event.preventDefault();
  const order = prepare();
  if (!order) return;
  feedback('Revisa y envía tu pedido por WhatsApp. Si no se abre, usa el botón de abajo.');
  window.open(buildWhatsAppUrl(order), '_blank', 'noopener,noreferrer');
});
document.querySelector('#copy-order').addEventListener('click', async () => {
  const order = prepare();
  if (!order) return;
  try { await navigator.clipboard.writeText(buildMessage(order)); feedback('Resumen copiado. Revisa y envía tu pedido por WhatsApp.'); }
  catch { document.querySelector('#order-message').focus(); document.querySelector('#order-message').select(); feedback('Selecciona y copia el resumen de abajo para enviarlo por WhatsApp.'); }
});
document.querySelectorAll('.wa-real-grid').forEach(grid => {
  const cards = [...grid.querySelectorAll('.screenshot-card')];
  const toggle = grid.closest('.wa-real-container').querySelector('.wa-carousel-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let hovered = false;
  let focused = false;
  let visible = false;
  let lastInteraction = -Infinity;
  function updateToggle() {
    toggle.textContent = userPaused ? 'Reproducir' : 'Pausar';
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.setAttribute('aria-label', userPaused ? 'Reproducir conversaciones' : 'Pausar conversaciones');
  }
  function nearestIndex() {
    const center = grid.getBoundingClientRect().left + grid.clientWidth / 2;
    return cards.reduce((nearest, card, i) => Math.abs(card.getBoundingClientRect().left + card.offsetWidth / 2 - center) < Math.abs(cards[nearest].getBoundingClientRect().left + cards[nearest].offsetWidth / 2 - center) ? i : nearest, 0);
  }
  function showCard(index) {
    const card = cards[(index + cards.length) % cards.length];
    const left = card.getBoundingClientRect().left - grid.getBoundingClientRect().left + grid.scrollLeft - (grid.clientWidth - card.offsetWidth) / 2;
    grid.scrollTo({ left: Math.max(0, Math.min(left, grid.scrollWidth - grid.clientWidth)), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  toggle.addEventListener('click', () => { userPaused = !userPaused; if (!userPaused) lastInteraction = -Infinity; updateToggle(); });
  grid.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true; });
  grid.addEventListener('pointerleave', () => { hovered = false; });
  grid.addEventListener('pointerdown', () => { lastInteraction = performance.now(); });
  grid.addEventListener('wheel', () => { lastInteraction = performance.now(); }, { passive: true });
  grid.addEventListener('focusin', () => { focused = true; });
  grid.addEventListener('focusout', event => { focused = grid.contains(event.relatedTarget); });
  grid.tabIndex = 0;
  grid.setAttribute('role', 'region');
  grid.setAttribute('aria-label', 'Conversaciones ilustrativas. Avance automático; también puedes deslizar.');
  grid.setAttribute('aria-live', 'off');
  grid.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      lastInteraction = performance.now();
      showCard(nearestIndex() + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: .15 }).observe(grid);
  else visible = true;
  setInterval(() => {
    if (!visible || userPaused || hovered || focused || document.hidden || document.querySelector('dialog[open]') || performance.now() - lastInteraction < 10000 || cards.length < 2) return;
    showCard(nearestIndex() + 1);
  }, 5500);
  updateToggle();
});
// Keep the original fixed CTA, showing it only when no complete inline CTA is visible.
const sticky = document.querySelector('.sticky-cta');
if (sticky && 'IntersectionObserver' in window) {
  const visibleButtons = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio >= .75) visibleButtons.add(entry.target);
      else visibleButtons.delete(entry.target);
    }
    sticky.hidden = visibleButtons.size > 0;
  }, { threshold: [0, .75, 1] });
  document.querySelectorAll('#landing [data-open-order]').forEach(button => observer.observe(button));
}
renderPacks();
