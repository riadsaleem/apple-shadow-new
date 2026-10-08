/* الظل للمظلات والسواتر — interactions */
(function () {
  "use strict";

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 50); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile navigation */
  var nav = document.getElementById("mainNav");
  var toggle = document.querySelector(".nav-toggle");
  var scrim = document.querySelector(".nav-scrim");
  function closeNav() {
    if (nav) nav.classList.remove("is-open");
    if (scrim) scrim.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  function openNav() {
    if (nav) nav.classList.add("is-open");
    if (scrim) scrim.classList.add("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? closeNav() : openNav();
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  }
  if (scrim) scrim.addEventListener("click", closeNav);

  /* Scroll reveal */
  var revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ============================================================
     Reusable image lightbox (modal) component.
     A single factory serves every page; markup is reused when
     #lightbox exists, otherwise it is injected automatically.

       Lightbox.open([{ src, alt }], startIndex)
       Lightbox.close()

     Declarative triggers:
       [data-lightbox]            -> navigates across all visible
                                     [data-lightbox] items on the page
       [data-gallery="<category>"] -> opens the full work gallery of a
                                     service category (services page)
     ============================================================ */

  /* Work galleries per service category (used by the services page). */
  var GALLERY_DIRS = {
    madhalat: "assets/img/madhalat/",
    swater: "assets/img/swater/",
    pergolas: "assets/img/pergolas/",
    sandwich: "assets/img/sandwich/",
    tansiq: "assets/img/tansiq/",
    shabak: "assets/img/shabak/",
    grass: "assets/img/grass/",
    metalwork: "assets/img/metalwork/",
    construction: "assets/img/construction/"
  };
  var GALLERY_NUMS = {
    madhalat: [1, 2, 3, 4, 5, 6, 8, 9],
    swater: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    pergolas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    sandwich: [1, 2, 3, 4, 5, 6, 7],
    tansiq: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    shabak: [1, 2, 3, 4, 5, 6, 7, 8],
    grass: [1, 2, 3, 4, 5, 6],
    metalwork: [1, 2, 3],
    construction: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
  };
  function categoryImages(cat, alt) {
    var dir = GALLERY_DIRS[cat], nums = GALLERY_NUMS[cat];
    if (!dir || !nums) return [];
    return nums.map(function (n) { return { src: dir + n + ".jpg", alt: alt || "" }; });
  }

  function createLightbox(root) {
    if (!root) return null;
    var imgEl = root.querySelector("img");
    var prevBtn = root.querySelector(".lightbox__prev");
    var nextBtn = root.querySelector(".lightbox__next");
    var closeBtn = root.querySelector(".lightbox__close");
    var items = [];
    var index = 0;

    function render() {
      var item = items[index];
      if (!item || !imgEl) return;
      imgEl.src = item.src;
      imgEl.alt = item.alt || "";
    }
    function isOpen() { return root.classList.contains("is-open"); }
    function open(list, start) {
      items = (list || []).filter(Boolean).slice();
      if (!items.length) return;
      index = (((start || 0) % items.length) + items.length) % items.length;
      render();
      root.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function close() { root.classList.remove("is-open"); document.body.style.overflow = ""; }
    function step(dir) {
      if (items.length < 1) return;
      index = (index + dir + items.length) % items.length;
      render();
    }

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
    root.addEventListener("click", function (e) { if (e.target === root) close(); });

    /* Touch swipe for mobile */
    var startX = 0, startY = 0, swiping = false;
    root.addEventListener("touchstart", function (e) {
      if (!isOpen() || e.touches.length !== 1) return;
      swiping = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (!swiping) return;
      swiping = false;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      var dx = t.clientX - startX, dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    return { open: open, close: close, step: step, isOpen: isOpen };
  }

  /* Reuse the page's #lightbox markup, or create it once if absent. */
  function ensureLightbox() {
    var root = document.getElementById("lightbox");
    if (root) return root;
    root = document.createElement("div");
    root.className = "lightbox";
    root.id = "lightbox";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "عرض الصورة");
    root.innerHTML =
      '<button class="lightbox__close" aria-label="إغلاق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lightbox__prev" aria-label="السابق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>' +
      '<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="" width="1200" height="800">' +
      '<button class="lightbox__next" aria-label="التالي"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>';
    document.body.appendChild(root);
    return root;
  }

  var lightbox = createLightbox(ensureLightbox());

  function visibleItems(selector) {
    return Array.prototype.filter.call(document.querySelectorAll(selector), function (el) {
      return el.offsetParent !== null; /* skip hidden (filtered) items */
    });
  }

  /* Delegated trigger handling keeps working after filtering. */
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;

    var trigger = e.target.closest("[data-lightbox]");
    if (trigger) {
      e.preventDefault();
      var group = visibleItems("[data-lightbox]");
      var list = group.map(function (el) {
        return { src: el.getAttribute("data-lightbox"), alt: el.getAttribute("data-alt") || "" };
      });
      lightbox.open(list, group.indexOf(trigger));
      return;
    }

    var card = e.target.closest("[data-gallery]");
    if (card) {
      e.preventDefault();
      var thumb = card.querySelector("img");
      var alt = thumb ? thumb.getAttribute("alt") : "";
      var arr = categoryImages(card.getAttribute("data-gallery"), alt);
      var at = thumb ? arr.map(function (o) { return o.src; }).indexOf(thumb.getAttribute("src")) : 0;
      lightbox.open(arr, at < 0 ? 0 : at);
    }
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeNav(); if (lightbox) lightbox.close(); }
    if (!lightbox || !lightbox.isOpen()) return;
    if (e.key === "ArrowLeft") lightbox.step(1);
    if (e.key === "ArrowRight") lightbox.step(-1);
  });

  /* Gallery category filter */
  var filterBtns = document.querySelectorAll("[data-filter]");
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        document.querySelectorAll("[data-cat]").forEach(function (item) {
          var show = cat === "all" || item.getAttribute("data-cat") === cat;
          item.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Contact form -> WhatsApp */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("cf-name") || {}).value || "";
      var phone = (document.getElementById("cf-phone") || {}).value || "";
      var service = (document.getElementById("cf-service") || {}).value || "";
      var msg = (document.getElementById("cf-message") || {}).value || "";
      var target = contactForm.getAttribute("data-wa") || "966503785796";
      var text = "السلام عليكم، أرغب بالاستفسار عن خدمات الظل للمظلات والسواتر.%0A"
        + "الاسم: " + encodeURIComponent(name) + "%0A"
        + "الجوال: " + encodeURIComponent(phone) + "%0A"
        + "الخدمة: " + encodeURIComponent(service) + "%0A"
        + "التفاصيل: " + encodeURIComponent(msg);
      window.open("https://wa.me/" + target + "?text=" + text, "_blank");
    });
  }

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
