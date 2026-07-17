// Ironclad Tech - Core UI behaviors
window.addEventListener("scroll", function () {
  var navbar = document.querySelector(".navbar");
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add("shadow");
  } else {
    navbar.classList.remove("shadow");
  }
});

// Auto-close mobile nav after a link is tapped
document.addEventListener("DOMContentLoaded", function () {
  var navLinks = document.querySelectorAll("#navbarNav .nav-link, #navbarNav .btn");
  var collapseEl = document.getElementById("navbarNav");
  if (!collapseEl || !window.bootstrap) return;
  var bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (collapseEl.classList.contains("show")) bsCollapse.hide();
    });
  });
});

// Back-to-top button
document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
