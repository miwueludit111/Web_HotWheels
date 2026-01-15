gsap.registerPlugin(ScrollTrigger);

/* INTRO */
gsap.to(".intro h1", {
  y: 200,
  opacity: 0,
  ease: "none",
  scrollTrigger: {
    trigger: ".intro",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});

/* HORIZONTAL FAKE SCROLLssss */
const panels = gsap.utils.toArray(".panel");

const horizontalScroll = gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-section",
    pin: true,
    scrub: true,
    end: () => "+=" + window.innerWidth * panels.length,
  },
});

/* TEXTO + BOTÓN POR PANEL */
panels.forEach((panel) => {
  const text = panel.querySelector(".panel-text");
  const btn = panel.querySelector(".panel-btn");

  // ENTRADA
  gsap.fromTo(
    [text, btn],
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        containerAnimation: horizontalScroll,
        start: "left center",
        end: "center center",
        scrub: true,
      },
    }
  );

  // SALIDA (vuelve al estado inicial)
  gsap.to([text, btn], {
    y: -40,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: panel,
      containerAnimation: horizontalScroll,
      start: "center center",
      end: "right center",
      scrub: true,
    },
  });
});
