const openVideo = document.getElementById('openVideo');
const modal = document.getElementById('videoModal');
const closeBtn = document.querySelector('.close');

if (openVideo) {
  openVideo.addEventListener('click', () => {
    modal.style.display = 'flex';
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/* =====================================================
   JAVASCRIPT DE SEBASTIÁN - Carrito y Pago
   Prefijo "s" en funciones para evitar conflictos
   ===================================================== */

// ========== DATOS DEL CARRITO (localStorage) ==========
const S_SHIPPING_COST = 5.00;

// Obtener carrito del localStorage
function sGetCart() {
  const cart = localStorage.getItem('sCarrito');
  return cart ? JSON.parse(cart) : [];
}

// Guardar carrito en localStorage
function sSaveCart(cart) {
  localStorage.setItem('sCarrito', JSON.stringify(cart));
}

// ========== FUNCIONES DEL CARRITO ==========

// Añadir producto al carrito (para usar desde catálogo)
function sAddToCart(id, name, price, image) {
  const cart = sGetCart();
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: parseFloat(price),
      image: image,
      quantity: 1
    });
  }

  sSaveCart(cart);
  sUpdateCartCount();
}

// Eliminar producto del carrito
function sRemoveFromCart(id) {
  let cart = sGetCart();
  cart = cart.filter(item => item.id !== id);
  sSaveCart(cart);
  sRenderCart();
}

// Actualizar cantidad
function sUpdateQuantity(id, change) {
  const cart = sGetCart();
  const item = cart.find(item => item.id === id);

  if (item) {
    item.quantity += change;

    if (item.quantity <= 0) {
      sRemoveFromCart(id);
      return;
    }

    sSaveCart(cart);
    sRenderCart();
  }
}

// Calcular subtotal
function sCalculateSubtotal() {
  const cart = sGetCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Formatear precio
function sFormatPrice(price) {
  return price.toFixed(2).replace('.', ',') + ' €';
}

// ========== RENDERIZADO ==========

// Renderizar carrito completo
function sRenderCart() {
  const cart = sGetCart();
  const cartEmpty = document.getElementById('s-carrito-vacio');
  const cartContent = document.getElementById('s-carrito-contenido');
  const cartItems = document.getElementById('s-cart-items');
  const summaryItems = document.getElementById('s-summary-items');

  // Mostrar/ocultar según si hay productos
  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartContent) cartContent.style.display = 'block';

  // Renderizar items del carrito
  if (cartItems) {
    cartItems.innerHTML = cart.map(item => `
      <div class="s-cart-item" data-id="${item.id}">
        <div class="s-cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="s-cart-item-details">
          <h4 class="s-cart-item-name">${item.name}</h4>
          <p class="s-cart-item-price">${sFormatPrice(item.price)}</p>
        </div>
        <div class="s-cart-item-quantity">
          <button class="s-qty-btn s-qty-minus" onclick="sUpdateQuantity('${item.id}', -1)">−</button>
          <span class="s-qty-value">${item.quantity}</span>
          <button class="s-qty-btn s-qty-plus" onclick="sUpdateQuantity('${item.id}', 1)">+</button>
        </div>
        <div class="s-cart-item-total">
          <p>${sFormatPrice(item.price * item.quantity)}</p>
        </div>
        <button class="s-cart-item-remove" onclick="sRemoveFromCart('${item.id}')" title="Eliminar">✕</button>
      </div>
    `).join('');
  }

  // Renderizar resumen
  if (summaryItems) {
    summaryItems.innerHTML = cart.map(item => `
      <div class="s-summary-item">
        <span class="s-summary-item-name">${item.name} (x${item.quantity})</span>
        <span class="s-summary-item-price">${sFormatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  // Actualizar totales
  sUpdateTotals();
}

// Actualizar totales
function sUpdateTotals() {
  const subtotal = sCalculateSubtotal();
  const total = subtotal + S_SHIPPING_COST;

  // Página carrito
  const subtotalEl = document.getElementById('s-subtotal');
  const envioEl = document.getElementById('s-envio');
  const totalEl = document.getElementById('s-total');

  if (subtotalEl) subtotalEl.textContent = sFormatPrice(subtotal);
  if (envioEl) envioEl.textContent = sFormatPrice(S_SHIPPING_COST);
  if (totalEl) totalEl.textContent = sFormatPrice(total);

  // Página pago
  const subtotalPagoEl = document.getElementById('s-subtotal-pago');
  const envioPagoEl = document.getElementById('s-envio-pago');
  const totalPagoEl = document.getElementById('s-total-pago');

  if (subtotalPagoEl) subtotalPagoEl.textContent = sFormatPrice(subtotal);
  if (envioPagoEl) envioPagoEl.textContent = sFormatPrice(S_SHIPPING_COST);
  if (totalPagoEl) totalPagoEl.textContent = sFormatPrice(total);
}

// Renderizar resumen en página de pago
function sRenderPaymentSummary() {
  const cart = sGetCart();
  const summaryItems = document.getElementById('s-summary-items-pago');

  if (summaryItems) {
    summaryItems.innerHTML = cart.map(item => `
      <div class="s-summary-item">
        <span class="s-summary-item-name">${item.name} (x${item.quantity})</span>
        <span class="s-summary-item-price">${sFormatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  sUpdateTotals();
}

// Actualizar contador del carrito (para navbar si lo añades)
function sUpdateCartCount() {
  const cart = sGetCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const countElement = document.getElementById('s-cart-count');

  if (countElement) {
    countElement.textContent = count;
    countElement.style.display = count > 0 ? 'block' : 'none';
  }
}

// ========== FORMULARIO DE PAGO ==========

function sHandlePaymentSubmit(e) {
  e.preventDefault();

  const cart = sGetCart();

  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  // Obtener datos del formulario
  const formData = {
    nombre: document.getElementById('s-nombre')?.value,
    email: document.getElementById('s-email')?.value,
    telefono: document.getElementById('s-telefono')?.value,
    direccion: document.getElementById('s-direccion')?.value,
    ciudad: document.getElementById('s-ciudad')?.value,
    cp: document.getElementById('s-cp')?.value,
    pais: document.getElementById('s-pais')?.value,
    titular: document.getElementById('s-titular')?.value,
    tarjeta: document.getElementById('s-tarjeta')?.value,
    fecha: document.getElementById('s-fecha')?.value,
    cvv: document.getElementById('s-cvv')?.value
  };

  // Aquí iría la lógica de procesamiento del pago
  console.log('Datos del pedido:', formData);
  console.log('Productos:', cart);
  console.log('Total:', sFormatPrice(sCalculateSubtotal() + S_SHIPPING_COST));

  // Simular procesamiento
  alert('¡Pedido realizado con éxito! Gracias por tu compra.');

  // Limpiar carrito
  localStorage.removeItem('sCarrito');

  // Redirigir a inicio
  window.location.href = 'index.html';
}

// ========== INICIALIZACIÓN DE SEBASTIÁN ==========

document.addEventListener('DOMContentLoaded', function () {
  // Si estamos en la página del carrito
  if (document.getElementById('s-cart-items')) {
    sRenderCart();
  }

  // Si estamos en la página de pago
  if (document.getElementById('s-summary-items-pago')) {
    sRenderPaymentSummary();

    // Manejar envío del formulario
    const form = document.getElementById('s-form-pago');
    if (form) {
      form.addEventListener('submit', sHandlePaymentSubmit);
    }
  }

  // Actualizar contador del carrito
  sUpdateCartCount();
});

// ========== FUNCIÓN PARA AÑADIR PRODUCTOS DE PRUEBA ==========
// Puedes llamar esto desde la consola para probar: sAddTestProducts()
function sAddTestProducts() {
  sAddToCart('1', 'Twin Mill', 4.99, 'img/card1.webp');
  sAddToCart('2', 'Pista Loop Básico', 19.99, 'img/card1.webp');
  sAddToCart('2', 'Pista Loop Básico', 19.99, 'img/card1.webp');
  sAddToCart('3', 'Pack 5 Coches', 14.99, 'img/card1.webp');
  sRenderCart();
  console.log('Productos de prueba añadidos al carrito');
}
