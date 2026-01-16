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
  const FREE_SHIPPING_THRESHOLD = 50.00;

  // Calcular envío: gratis si subtotal >= 50€
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : S_SHIPPING_COST;
  const total = subtotal + shippingCost;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  // Página carrito
  const subtotalEl = document.getElementById('s-subtotal');
  const envioEl = document.getElementById('s-envio');
  const totalEl = document.getElementById('s-total');
  const freeShippingMsgEl = document.getElementById('s-free-shipping-msg');

  if (subtotalEl) subtotalEl.textContent = sFormatPrice(subtotal);

  if (envioEl) {
    if (shippingCost === 0) {
      envioEl.textContent = '¡GRATIS!';
      envioEl.style.color = '#4CAF50';
    } else {
      envioEl.textContent = sFormatPrice(shippingCost);
      envioEl.style.color = '';
    }
  }

  if (totalEl) totalEl.textContent = sFormatPrice(total);

  // Mostrar mensaje de cuánto falta para envío gratis
  if (freeShippingMsgEl) {
    if (subtotal > 0 && remainingForFreeShipping > 0) {
      freeShippingMsgEl.innerHTML = `<i class="bi bi-truck"></i> ¡Añade <strong>${sFormatPrice(remainingForFreeShipping)}</strong> más para envío GRATIS!`;
      freeShippingMsgEl.style.display = 'block';
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      freeShippingMsgEl.innerHTML = `<i class="bi bi-check-circle-fill"></i> ¡Tienes envío GRATIS!`;
      freeShippingMsgEl.style.display = 'block';
    } else {
      freeShippingMsgEl.style.display = 'none';
    }
  }

  // Página pago
  const subtotalPagoEl = document.getElementById('s-subtotal-pago');
  const envioPagoEl = document.getElementById('s-envio-pago');
  const totalPagoEl = document.getElementById('s-total-pago');

  if (subtotalPagoEl) subtotalPagoEl.textContent = sFormatPrice(subtotal);
  if (envioPagoEl) {
    if (shippingCost === 0) {
      envioPagoEl.textContent = '¡GRATIS!';
      envioPagoEl.style.color = '#4CAF50';
    } else {
      envioPagoEl.textContent = sFormatPrice(shippingCost);
      envioPagoEl.style.color = '';
    }
  }
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


/* =====================================================
   VIDEOJUEGOS PAGE - HERO SLIDESHOW
   ===================================================== */

(function () {
  'use strict';

  // Variables del slideshow
  let currentSlide = 0;
  let slideInterval = null;
  let progressInterval = null;
  let isAnimating = false;
  const SLIDE_DURATION = 6000; // 6 segundos por slide
  const PROGRESS_UPDATE = 50; // Actualizar progreso cada 50ms
  const ANIMATION_DURATION = 700; // Duración de la animación en ms

  // Elementos del DOM
  const slidesContainer = document.querySelector('.vj-slides-container');

  // Solo ejecutar si estamos en la página de videojuegos
  if (!slidesContainer) return;

  const slides = document.querySelectorAll('.vj-slide');
  const indicators = document.querySelectorAll('.vj-indicator');
  const prevBtn = document.querySelector('.vj-prev');
  const nextBtn = document.querySelector('.vj-next');
  const progressFill = document.querySelector('.vj-progress-fill');

  if (slides.length === 0) return;

  const totalSlides = slides.length;

  // Inicializar backgrounds de los slides
  function initSlideBackgrounds() {
    slides.forEach(slide => {
      const bgImage = slide.dataset.bg;
      if (bgImage) {
        slide.style.backgroundImage = `url('${bgImage}')`;
      }
    });
  }

  // Inicializar posiciones de los slides
  function initSlidePositions() {
    slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev', 'next');
      if (index === 0) {
        slide.classList.add('active');
      } else {
        slide.classList.add('next');
      }
    });
  }

  // Ir a un slide específico con dirección
  function goToSlide(newIndex, direction = 'next', resetTimer = true) {
    if (isAnimating) return;
    if (newIndex === currentSlide) return;

    isAnimating = true;

    // Calcular índice normalizado (loop infinito)
    let targetIndex = newIndex;
    if (targetIndex < 0) targetIndex = totalSlides - 1;
    if (targetIndex >= totalSlides) targetIndex = 0;

    const currentSlideEl = slides[currentSlide];
    const targetSlideEl = slides[targetIndex];

    // Desactivar transiciones temporalmente para posicionar
    targetSlideEl.style.transition = 'none';

    // Posicionar el nuevo slide según la dirección
    if (direction === 'next') {
      targetSlideEl.classList.remove('prev', 'active');
      targetSlideEl.classList.add('next');
    } else {
      targetSlideEl.classList.remove('next', 'active');
      targetSlideEl.classList.add('prev');
    }

    // Forzar reflow para aplicar el posicionamiento inmediato
    targetSlideEl.offsetHeight;

    // Reactivar transiciones
    targetSlideEl.style.transition = '';

    // Realizar la animación
    requestAnimationFrame(() => {
      // Mover el slide actual hacia afuera
      currentSlideEl.classList.remove('active');
      if (direction === 'next') {
        currentSlideEl.classList.add('prev');
      } else {
        currentSlideEl.classList.add('next');
      }

      // Mover el nuevo slide hacia el centro
      targetSlideEl.classList.remove('prev', 'next');
      targetSlideEl.classList.add('active');
    });

    // Actualizar indicadores
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === targetIndex);
    });

    // Actualizar índice actual
    currentSlide = targetIndex;

    // Desbloquear después de la animación
    setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_DURATION);

    // Reiniciar timer si es necesario
    if (resetTimer) {
      resetProgress();
      startAutoplay();
    }
  }

  // Slide siguiente
  function nextSlide() {
    const next = (currentSlide + 1) % totalSlides;
    goToSlide(next, 'next');
  }

  // Slide anterior
  function prevSlide() {
    const prev = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prev, 'prev');
  }

  // Ir a un slide por indicador (detectar dirección)
  function goToSlideByIndicator(index) {
    if (index === currentSlide) return;
    const direction = index > currentSlide ? 'next' : 'prev';
    goToSlide(index, direction);
  }

  // Iniciar reproducción automática
  function startAutoplay() {
    stopAutoplay();

    let progress = 0;
    const increment = (PROGRESS_UPDATE / SLIDE_DURATION) * 100;

    progressInterval = setInterval(() => {
      progress += increment;
      if (progressFill) {
        progressFill.style.width = `${Math.min(progress, 100)}%`;
      }
    }, PROGRESS_UPDATE);

    slideInterval = setTimeout(() => {
      nextSlide();
    }, SLIDE_DURATION);
  }

  // Detener reproducción automática
  function stopAutoplay() {
    if (slideInterval) {
      clearTimeout(slideInterval);
      slideInterval = null;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  // Resetear barra de progreso
  function resetProgress() {
    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      // Forzar reflow
      progressFill.offsetHeight;
      progressFill.style.transition = 'width 0.1s linear';
    }
  }

  // Event Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlideByIndicator(index);
    });
  });

  // Pausar en hover (opcional - mejor UX)
  slidesContainer.addEventListener('mouseenter', () => {
    stopAutoplay();
  });

  slidesContainer.addEventListener('mouseleave', () => {
    resetProgress();
    startAutoplay();
  });

  // Soporte para teclado
  document.addEventListener('keydown', (e) => {
    // Solo si estamos en la página de videojuegos
    if (!document.querySelector('.vj-hero-slideshow')) return;

    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Soporte para swipe en móvil
  let touchStartX = 0;
  let touchEndX = 0;

  slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe izquierda - siguiente slide
        nextSlide();
      } else {
        // Swipe derecha - slide anterior
        prevSlide();
      }
    }
  }

  // Inicializar
  initSlideBackgrounds();
  initSlidePositions();
  startAutoplay();

})();

// ========== VIDEOJUEGOS - ADD TO CART BUTTONS ==========
document.addEventListener('DOMContentLoaded', function () {
  const addCartButtons = document.querySelectorAll('.vj-add-cart-btn');

  addCartButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const image = this.dataset.image;

      // Usar la función global sAddToCart
      if (typeof sAddToCart === 'function') {
        sAddToCart(id, name, price, image);

        // Feedback visual
        const span = this.querySelector('span');
        const originalText = span.textContent;
        span.textContent = '¡Añadido!';
        this.classList.add('added');

        setTimeout(() => {
          span.textContent = originalText;
          this.classList.remove('added');
        }, 1500);
      } else {
        console.error('sAddToCart no está disponible');
      }
    });
  });
});
