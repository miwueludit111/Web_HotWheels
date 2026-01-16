const images = document.querySelectorAll(".img");
const text = document.getElementById("text");
const currentNumEl = document.getElementById("current-num");
const totalNumEl = document.getElementById("total-num");
const scrollIndicator = document.querySelector(".col-scroll-indicator");
const buyBtn = document.getElementById("comprar-btn");

let currentIndex = 0;
const totalImages = images.length;
let isTransitioning = false; // Prevenir transiciones múltiples

// Detectar si es móvil
let isMobile = window.innerWidth <= 768;

// Actualizar el contador total
if (totalNumEl) {
  totalNumEl.textContent = String(totalImages).padStart(2, '0');
}

// Función para actualizar el número actual
function updateCounter(index) {
  if (currentNumEl) {
    currentNumEl.textContent = String(index + 1).padStart(2, '0');
  }
}

// Datos del producto actual
let currentProduct = {
  id: '',
  name: '',
  price: 0,
  image: ''
};

// Función para actualizar estado del botón de compra
function updateBuyButton(index) {
  const steps = document.querySelectorAll(".step");
  const step = steps[index];

  if (buyBtn && step) {
    // Actualizar datos del producto actual
    currentProduct.id = step.dataset.id || `car-${index + 1}`;
    currentProduct.name = step.dataset.title;
    currentProduct.price = parseFloat(step.dataset.price.replace(',', '.')) || 0;
    currentProduct.image = step.dataset.image;

    // Habilitar botón para todos los coches con precio válido
    if (currentProduct.price > 0) {
      buyBtn.classList.remove("disabled");
    } else {
      buyBtn.classList.add("disabled");
    }
  }
}

// Manejar clic en el botón de comprar
if (buyBtn) {
  buyBtn.addEventListener('click', function (e) {
    e.preventDefault();

    if (buyBtn.classList.contains('disabled')) {
      return;
    }

    // Usar la función global sAddToCart del script.js
    if (typeof sAddToCart === 'function') {
      sAddToCart(currentProduct.id, currentProduct.name, currentProduct.price, currentProduct.image);

      // Feedback visual
      const originalText = buyBtn.querySelector('span').textContent;
      buyBtn.querySelector('span').textContent = '¡Añadido!';
      buyBtn.classList.add('added');

      setTimeout(() => {
        buyBtn.querySelector('span').textContent = originalText;
        buyBtn.classList.remove('added');
      }, 1500);
    } else {
      console.error('sAddToCart no está disponible');
    }
  });
}

// Función para habilitar/deshabilitar scroll al footer
function updateScrollState() {
  if (isMobile) {
    if (currentIndex >= totalImages - 1) {
      // Llego al último coche, habilitar scroll
      document.body.classList.add('can-scroll');
    } else {
      // No está en el último coche, deshabilitar scroll
      document.body.classList.remove('can-scroll');
    }
  }
}

// Función para cambiar de coche
function changeCar(newIndex) {
  if (newIndex === currentIndex || isTransitioning) return;
  if (newIndex < 0 || newIndex >= totalImages) return;

  isTransitioning = true;

  const direction = newIndex > currentIndex ? "down" : "up";
  const currentImg = images[currentIndex];
  const nextImg = images[newIndex];

  // Limpiar clases
  images.forEach((img) => {
    img.classList.remove(
      "active",
      "exit-top",
      "exit-bottom",
      "from-top",
      "from-bottom"
    );
  });

  // Imagen actual sale
  currentImg.classList.add(
    direction === "down" ? "exit-top" : "exit-bottom"
  );

  // Imagen nueva entra
  nextImg.classList.add(direction === "down" ? "from-bottom" : "from-top");

  // Forzar reflow
  nextImg.offsetHeight;

  nextImg.classList.add("active");

  // Actualizar contador
  updateCounter(newIndex);

  // Actualizar estado del botón de compra
  updateBuyButton(newIndex);

  // Texto con animación
  text.style.opacity = 0;
  text.style.transform = "translateY(20px)";

  const steps = document.querySelectorAll(".step");
  const step = steps[newIndex];

  setTimeout(() => {
    const title = step.dataset.title;
    const description = step.dataset.description;
    const price = step.dataset.price;

    const formattedPrice = parseFloat(price.replace(',', '.')) > 0 ? `${price} €` : 'No disponible';
    text.innerHTML = `
      <h2>${title}</h2>
      <p class="col-description">${description}</p>
      <p class="col-price">${formattedPrice}</p>
    `;
    text.style.opacity = 1;
    text.style.transform = "translateY(0)";
  }, 300);

  currentIndex = newIndex;

  // Actualizar estado del scroll
  updateScrollState();

  // Cooldown para prevenir rebotes
  setTimeout(() => {
    isTransitioning = false;
  }, 600);
}

// =============================================
// MÓVIL: Navegación por gestos táctiles y wheel
// =============================================

if (isMobile) {
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50;

  // Detectar inicio del toque
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  // Detectar fin del toque y calcular dirección
  document.addEventListener('touchend', (e) => {
    // Si puede hacer scroll (último coche), no interceptar
    if (document.body.classList.contains('can-scroll')) {
      // Solo interceptar si está en la parte superior y hace swipe up
      if (window.scrollY > 50) return;
    }

    touchEndY = e.changedTouches[0].screenY;
    const swipeDistance = touchStartY - touchEndY;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe hacia arriba - siguiente coche
        if (currentIndex < totalImages - 1) {
          changeCar(currentIndex + 1);
        }
      } else {
        // Swipe hacia abajo - coche anterior
        if (currentIndex > 0) {
          changeCar(currentIndex - 1);
        }
      }
    }
  }, { passive: true });

  // También soportar wheel en móvil (para dispositivos táctiles con trackpad)
  document.addEventListener('wheel', (e) => {
    // Si puede hacer scroll y no está en la parte superior, permitir scroll normal
    if (document.body.classList.contains('can-scroll') && window.scrollY > 10) {
      return;
    }

    // Si está haciendo scroll hacia arriba en la parte superior, volver al coche anterior
    if (document.body.classList.contains('can-scroll') && e.deltaY < 0 && window.scrollY <= 10) {
      if (currentIndex > 0) {
        e.preventDefault();
        document.body.classList.remove('can-scroll');
        window.scrollTo(0, 0);
        changeCar(currentIndex - 1);
      }
      return;
    }

    if (isTransitioning) return;

    e.preventDefault();

    if (e.deltaY > 0) {
      // Scroll down - siguiente coche
      if (currentIndex < totalImages - 1) {
        changeCar(currentIndex + 1);
      }
    } else {
      // Scroll up - coche anterior
      if (currentIndex > 0) {
        changeCar(currentIndex - 1);
      }
    }
  }, { passive: false });
}

// =============================================
// DESKTOP: IntersectionObserver para scroll
// =============================================

if (!isMobile) {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "-20% 0px -20% 0px"
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (isTransitioning) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const newIndex = Number(entry.target.dataset.index);
          changeCar(newIndex);
        }
      });
    },
    observerOptions
  );

  document.querySelectorAll(".step").forEach((step) => observer.observe(step));
}

// Asegurar que la página empiece en el coche 1
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  currentIndex = 0;
  updateCounter(0);
  updateBuyButton(0);
  updateScrollState();
});

// Ocultar indicador de scroll después del primer cambio de coche
let hasScrolled = false;

function hideScrollIndicator() {
  if (!hasScrolled && currentIndex > 0) {
    hasScrolled = true;
    if (scrollIndicator) {
      scrollIndicator.style.opacity = "0";
      scrollIndicator.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        scrollIndicator.style.display = "none";
      }, 500);
    }
  }
}

// En desktop, ocultar con scroll normal
if (!isMobile) {
  window.addEventListener("scroll", () => {
    if (!hasScrolled && window.scrollY > 100) {
      hideScrollIndicator();
    }
  });
}

// Actualizar isMobile en resize
window.addEventListener('resize', () => {
  const wasMobile = isMobile;
  isMobile = window.innerWidth <= 768;

  // Si cambia de móvil a desktop o viceversa, recargar para aplicar los event listeners correctos
  if (wasMobile !== isMobile) {
    location.reload();
  }
});
