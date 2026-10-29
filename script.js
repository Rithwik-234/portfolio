
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const header = $(".header");
  const menuToggle = $(".menu-toggle");
  const nav = $("#nav");
  const backTop = $("#backTop");
  const heroImage = $(".hero-image");
  const loader = $("#loader");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // 1. Loading screen
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add("done");
    document.body.classList.remove("loading");
  };

  document.body.classList.add("loading");

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  // Fallback for unusually slow image or font loading.
  window.setTimeout(hideLoader, 3000);

  // 2. Mobile navigation
  function closeMenu() {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation"
    );

    nav.classList.toggle("open", !isOpen);
  });

  $$("#nav a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", event => {
    if (
      nav.classList.contains("open") &&
      !nav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // 3. Scroll effects: header, back-to-top and parallax
  let ticking = false;

  function updateScrollEffects() {
    const scrollY = window.scrollY;

    header.classList.toggle("scrolled", scrollY > 40);
    backTop.classList.toggle("visible", scrollY > 500);

    if (heroImage && !reducedMotion.matches && scrollY < window.innerHeight) {
      heroImage.style.transform =
        `translate3d(0, ${scrollY * 0.12}px, 0) scale(1.03)`;
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }, { passive: true });

  updateScrollEffects();

  backTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  });

  // 4. Reveal sections as they enter the viewport
  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    });

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("in-view"));
  }

  // 5. Highlight the current navigation section
  const navLinks = $$("#nav a[href^='#']");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          const active =
            link.getAttribute("href") === `#${entry.target.id}`;

          if (active) {
            link.classList.add("active");
            link.setAttribute("aria-current", "location");
          } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
          }
        });
      });
    }, {
      rootMargin: "-25% 0px -60% 0px"
    });

    $$("main section[id]").forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // 6. Gallery lightbox
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");
  let lastFocusedElement = null;

  function closeLightbox() {
    if (lightbox.open) lightbox.close();
  }

  $$(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {
      const image = $("img", item);
      const fullImage = item.dataset.full;

      if (!fullImage || !image) return;

      lastFocusedElement = item;
      lightboxImage.src = fullImage;
      lightboxImage.alt = image.alt;

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
        lightboxClose.focus();
      } else {
        window.open(fullImage, "_blank", "noopener,noreferrer");
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
    if (lastFocusedElement) lastFocusedElement.focus();
  });

  // 7. Social links remain inactive until real URLs are added.
  $$("[data-placeholder='true']").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      alert("Add your real social media profile URL in index.html first.");
    });
  });

  // 8. Contact form validation.
  // This demo does not transmit or store personal information.
  const contactForm = $("#contactForm");
  const formStatus = $("#formStatus");

  contactForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    formStatus.textContent =
      "Your form is valid, but this demo cannot send messages yet. " +
      "Connect a backend or form service to enable delivery.";
  });

  // 9. Dynamic copyright year
  $("#year").textContent = new Date().getFullYear();
});
