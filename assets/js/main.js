/* الظل للمظلات والسواتر — interactions */
(function () {
  "use strict";

  /* Header shadow on scroll */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
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

  /* Gallery lightbox */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var triggers = [];
  var current = 0;

  function collectTriggers() {
    triggers = [];
    document.querySelectorAll("[data-lightbox]").forEach(function (el) {
      if (el.offsetParent === null) return; /* skip hidden (filtered) items */
      el.addEventListener("click", function () { openLightbox(triggers.indexOf(el)); });
      triggers.push(el);
    });
  }
  function openLightbox(i) {
    if (!lightbox || !lightboxImg || !triggers[i]) return;
    current = i;
    lightboxImg.src = triggers[i].getAttribute("data-lightbox");
    lightboxImg.alt = triggers[i].getAttribute("data-alt") || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function step(dir) {
    if (!triggers.length) return;
    current = (current + dir + triggers.length) % triggers.length;
    lightboxImg.src = triggers[current].getAttribute("data-lightbox");
    lightboxImg.alt = triggers[current].getAttribute("data-alt") || "";
  }
  if (lightbox) {
    collectTriggers();
    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox__prev").addEventListener("click", function () { step(-1); });
    lightbox.querySelector(".lightbox__next").addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeNav(); closeLightbox(); }
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "ArrowLeft") step(1);
    if (e.key === "ArrowRight") step(-1);
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
        collectTriggers();
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
