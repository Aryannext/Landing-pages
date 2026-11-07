import { PRODUCT } from './config.js';

export const formatPrice = value => '$' + new Intl.NumberFormat(PRODUCT.locale, {
  minimumFractionDigits: 0, maximumFractionDigits: 0,
}).format(value);

export function getPack(quantity) {
  const pack = PRODUCT.packs.find(item => item.quantity === Number(quantity));
  if (!pack) throw new Error('Selecciona un paquete válido.');
  return pack;
}

export function savingsFor(quantity) {
  const pack = getPack(quantity);
  return PRODUCT.packs[0].price * pack.quantity - pack.price;
}

export function normalizePhone(value) {
  const digits = String(value).replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('57') ? digits.slice(2) : digits;
  return /^3\d{9}$/.test(national) ? national : null;
}

export function createOrder(quantity, fields) {
  const pack = getPack(quantity);
  const phone = normalizePhone(fields.phone);
  if (!phone) throw new Error('Escribe un celular colombiano de 10 dígitos que empiece por 3.');
  const clean = Object.fromEntries(['name', 'address', 'neighborhood', 'department', 'city'].map(key => [key, String(fields[key] || '').trim()]));
  if (Object.values(clean).some(value => !value)) throw new Error('Completa los datos de envío.');
  return { ...clean, email: String(fields.email || '').trim(), phone, quantity: pack.quantity, subtotal: pack.price, shipping: PRODUCT.shipping, total: pack.price + PRODUCT.shipping };
}

export function buildMessage(order) {
  return [
    'Hola, quiero confirmar mi pedido.',
    '',
    `Producto: ${PRODUCT.name}`,
    `Cantidad: ${order.quantity} ${order.quantity === 1 ? 'unidad' : 'unidades'}`,
    `Subtotal: ${formatPrice(order.subtotal)} COP`,
    'Envío: incluido',
    `Total: ${formatPrice(order.total)} COP`,
    'Pago: contra entrega',
    '',
    'DATOS DE ENVÍO',
    `Nombre completo: ${order.name}`,
    `Celular: +57 ${order.phone}`,
    `Dirección: ${order.address}`,
    `Barrio / apartamento: ${order.neighborhood}`,
    `Departamento: ${order.department}`,
    `Ciudad: ${order.city}`,
    ...(order.email ? [`Correo: ${order.email}`] : []),
  ].join('\n');
}

export function buildWhatsAppUrl(order) {
  return `https://wa.me/${PRODUCT.whatsapp}?text=${encodeURIComponent(buildMessage(order))}`;
}
