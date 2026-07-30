// Ironclad Tech - Premium Loader controller (once per session)
(function () {
  var loader = document.getElementById("premiumLoader");
  if (!loader) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var alreadyShown = sessionStorage.getItem("ironcladLoaderShown");

  function remove() {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    document.documentElement.classList.remove("loader-lock");
  }

  if (alreadyShown || prefersReduced) {
    remove();
    return;
  }

  sessionStorage.setItem("ironcladLoaderShown", "1");
  document.documentElement.classList.add("loader-lock");

  var HOLD_MS = 2600;
  var EXIT_MS = 700;

  window.setTimeout(function () {
    loader.classList.add("is-exiting");
    window.setTimeout(remove, EXIT_MS + 50);
  }, HOLD_MS);
})();
