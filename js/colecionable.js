const images = document.querySelectorAll(".img");
const text = document.getElementById("text");
const inspectBtn = document.querySelector(".inspect-btn");

let currentIndex = 0;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const newIndex = Number(entry.target.dataset.index);
      if (newIndex === currentIndex) return;

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

      // Texto
      text.style.opacity = 0;
      text.style.transform = "translateY(20px)";

      setTimeout(() => {
        text.innerHTML = `
        <h2>${entry.target.dataset.title}</h2>
        <p>${entry.target.dataset.text}</p>
      `;
        text.style.opacity = 1;
        text.style.transform = "translateY(0)";
      }, 300);

      currentIndex = newIndex;
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".step").forEach((step) => observer.observe(step));

// ACCIÓN DEL BOTÓN
// inspectBtn.addEventListener("click", () => {
//   alert("Imagen activa: " + (currentIndex + 1));
// });
