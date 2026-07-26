// Ironclad Tech - Homepage hero dashboard image parallax + bob
(function () {
  var wrap = document.getElementById("heroMediaWrap");
  var img = document.getElementById("heroMediaImg");
  if (!wrap || !img) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduceMotion || !canHover) return;

  wrap.classList.add("js-parallax-active");

  var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  var targetScale = 1, currentScale = 1;
  var bobStart = performance.now();

  wrap.addEventListener("mousemove", function (e) {
    var rect = wrap.getBoundingClientRect();
    var relX = (e.clientX - rect.left) / rect.width - 0.5;
    var relY = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = relX * 10;
    targetY = relY * 10;
  });

  wrap.addEventListener("mouseenter", function () {
    targetScale = 1.02;
  });

  wrap.addEventListener("mouseleave", function () {
    targetX = 0;
    targetY = 0;
    targetScale = 1;
  });

  function tick(now) {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    currentScale += (targetScale - currentScale) * 0.08;
    var bob = Math.sin((now - bobStart) / 1000) * 6;
    img.style.transform =
      "rotateX(" + (-currentY).toFixed(2) + "deg) " +
      "rotateY(" + currentX.toFixed(2) + "deg) " +
      "translateY(" + bob.toFixed(2) + "px) " +
      "scale(" + currentScale.toFixed(3) + ")";
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
