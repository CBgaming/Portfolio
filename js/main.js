(function () {
  "use strict";

  // "" on normal pages, "../" on pages inside /games/
  var root = document.body.getAttribute("data-root") || "";
  var links = (window.SITE && window.SITE.links) || {};

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-links");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Links driven by js/config.js ---------- */
  function isAbsolute(v) { return /^(https?:|mailto:|tel:|#)/i.test(v); }

  function resolve(key) {
    var v = (links[key] || "").trim();
    if (!v) return "";
    if (!isAbsolute(v) && v.indexOf("@") !== -1 && v.indexOf("/") === -1) return "mailto:" + v;
    return isAbsolute(v) ? v : root + v.replace(/^\//, "");
  }

  document.querySelectorAll("[data-link]").forEach(function (el) {
    var key = el.getAttribute("data-link");
    var href = resolve(key);
    var val = el.querySelector("[data-val]");
    if (href) {
      el.setAttribute("href", href);
      if (/^https?:/i.test(href)) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
      if (key === "cv") el.setAttribute("download", "");
      if (val) val.textContent = href.replace(/^(https?:\/\/|mailto:)/i, "").replace(/\/$/, "");
    } else {
      el.setAttribute("href", "#");
      el.classList.add("link-unset");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("title", "Link coming soon");
      el.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });

  /* ---------- Auto-load images dropped into assets/images ----------
     Placeholders with data-img="assets/images/name" turn into the real image
     as soon as a file called name.jpg / name.png / name.webp exists. */
  var EXTS = ["jpg", "png", "webp"];

  function tryLoad(base, exts, ok) {
    if (!exts.length) return;
    var img = new Image();
    img.onload = function () { ok(img); };
    img.onerror = function () { tryLoad(base, exts.slice(1), ok); };
    img.src = root + base + "." + exts[0];
  }

  document.querySelectorAll("[data-img]").forEach(function (el) {
    tryLoad(el.getAttribute("data-img"), EXTS, function (img) {
      img.alt = el.getAttribute("data-alt") || "";
      img.className = "media-img";
      img.loading = "lazy";
      el.replaceWith(img);
    });
  });

  /* Optional profile photo: appears (and the layout adapts) only if
     assets/images/profile.jpg / .png / .webp exists. */
  document.querySelectorAll("[data-photo]").forEach(function (el) {
    tryLoad(el.getAttribute("data-photo"), EXTS, function (img) {
      img.alt = "Photo of Carter Raymond";
      img.className = "profile-photo";
      el.appendChild(img);
      el.hidden = false;
      var hero = el.closest(".hero");
      if (hero) hero.classList.add("has-photo");
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Fade-in on scroll ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  } else {
    items.forEach(function (i) { i.classList.add("visible"); });
  }
})();
