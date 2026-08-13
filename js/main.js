(function () {
  "use strict";

  const header = document.getElementById("header");
  let navToggle = document.getElementById("nav-toggle");
  const navContainer = document.getElementById("nav-menu-container");
  const backToTop = document.querySelector(".back-to-top");
  const skipLink = document.querySelector(".skip-to-main");
  const preloader = document.getElementById("preloader");

  const setHeaderState = () => {
    if (header) {
      header.classList.toggle("header-scrolled", window.scrollY > 40);
    }
  };

  const setBackToTopState = () => {
    if (backToTop) {
      backToTop.classList.toggle("show", window.scrollY > 300);
    }
  };

  const smoothScrollTo = (target) => {
    const offset = header ? header.offsetHeight + 12 : 0;
    const targetTop = Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  const closeMobileNav = () => {
    document.body.classList.remove("mobile-nav-active");
    navToggle?.classList.remove("active");
    navToggle?.setAttribute("aria-expanded", "false");
    document.getElementById("mobile-nav")?.classList.remove("show");
  };

  const openMobileNav = () => {
    document.body.classList.add("mobile-nav-active");
    navToggle?.classList.add("active");
    navToggle?.setAttribute("aria-expanded", "true");
    document.getElementById("mobile-nav")?.classList.add("show");
  };

  const toggleMobileNav = () => {
    if (document.body.classList.contains("mobile-nav-active")) {
      closeMobileNav();
      return;
    }
    openMobileNav();
  };

  const ensureMobileNav = () => {
    if (!navContainer || document.getElementById("mobile-nav")) {
      return;
    }

    const clonedNav = navContainer.cloneNode(true);
    clonedNav.id = "mobile-nav";
    clonedNav.querySelectorAll(".nav-menu").forEach((menu) => menu.classList.remove("nav-menu"));
    document.body.appendChild(clonedNav);

    if (!navToggle && header) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.id = "nav-toggle";
      toggle.setAttribute("aria-label", "Toggle navigation menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "<span></span><span></span><span></span>";
      header.querySelector(".container-fluid")?.appendChild(toggle);
      navToggle = toggle;
    }
  };

  const initLegacyCarouselSupport = () => {
    const introCarousel = document.querySelector(".carousel");
    const indicators = document.querySelector(".carousel-indicators");
    if (!introCarousel || !indicators) {
      return;
    }

    indicators.innerHTML = "";
    const items = introCarousel.querySelectorAll(".carousel-inner > .carousel-item");
    items.forEach((item, index) => {
      const indicator = document.createElement("li");
      indicator.setAttribute("data-target", "#introCarousel");
      indicator.setAttribute("data-slide-to", String(index));
      if (index === 0) {
        indicator.classList.add("active");
      }
      indicators.appendChild(indicator);

      const image = item.querySelector(".carousel-background img");
      if (image) {
        item.style.backgroundImage = `url('${image.getAttribute("src")}')`;
        item.querySelector(".carousel-background")?.remove();
      }
    });
  };

  const initLegacyQuantityControls = () => {
    document.querySelectorAll(".quantity").forEach((quantity) => {
      if (!quantity.querySelector(".dec.q-btn")) {
        const dec = document.createElement("span");
        dec.className = "dec q-btn";
        dec.textContent = "-";
        quantity.prepend(dec);
      }
      if (!quantity.querySelector(".inc.q-btn")) {
        const inc = document.createElement("span");
        inc.className = "inc q-btn";
        inc.textContent = "+";
        quantity.appendChild(inc);
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.classList.contains("q-btn")) {
        return;
      }
      const quantity = target.parentElement;
      const input = quantity?.querySelector("input");
      if (!input) {
        return;
      }
      const currentValue = Number.parseFloat(input.value || "0");
      const nextValue = target.classList.contains("inc") ? currentValue + 1 : Math.max(currentValue - 1, 0);
      input.value = String(nextValue);
    });
  };

  const initCaptureShield = () => {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const toggle = target.closest("#nav-toggle");
      if (toggle) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleMobileNav();
        return;
      }

      const navLink = target.closest("#nav-menu-container a, #mobile-nav a");
      if (navLink) {
        const submenu = navLink.parentElement?.querySelector(".nav-dropdown");
        const mobile = window.matchMedia("(max-width: 768px)").matches;

        if (submenu && mobile) {
          event.preventDefault();
          event.stopImmediatePropagation();
          submenu.classList.toggle("show");
          return;
        }

        closeMobileNav();
      }

      const hashLink = target.closest('a[href^="#"]');
      if (hashLink) {
        const hash = hashLink.getAttribute("href");
        if (hash && hash !== "#") {
          const destination = document.querySelector(hash);
          if (destination) {
            event.preventDefault();
            event.stopImmediatePropagation();
            smoothScrollTo(destination);
            closeMobileNav();
          }
        }
      }

      if (backToTop && backToTop.contains(target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, true);
  };

  window.addEventListener("load", () => {
    if (preloader) {
      preloader.remove();
    }
    ensureMobileNav();
    initLegacyCarouselSupport();
    initLegacyQuantityControls();
    initCaptureShield();
    setHeaderState();
    setBackToTopState();
  });

  window.addEventListener("scroll", () => {
    setHeaderState();
    setBackToTopState();
  }, { passive: true });

  navToggle?.addEventListener("click", toggleMobileNav);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

  if (skipLink) {
    skipLink.addEventListener("click", (event) => {
      const main = document.querySelector("main");
      if (!main) {
        return;
      }
      event.preventDefault();
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
      smoothScrollTo(main);
    });
  }
})();