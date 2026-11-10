const loader = document.getElementById("loader");
const barFill = document.getElementById("barFill");
const pct = document.getElementById("loadingPct");
const loadingText = document.getElementById("loadingText");
const titleFill = document.getElementById("titleFill");

let p = 0;

const timer = setInterval(() => {
  p += 2;
  if (p > 100) p = 100;

  // Progress bar + percent
  barFill.style.width = p + "%";
  pct.textContent = p + "%";

  // Title fill matches progress
  titleFill.style.height = p + "%";

  // Loading blinks near the end
  if (p >= 80) {
    loadingText.style.visibility = p % 4 === 0 ? "hidden" : "visible";
  }

  if (p === 100) {
    clearInterval(timer);

    setTimeout(() => {
      loader.classList.add("hide");
      document.body.classList.add("loaded");
      loadingText.style.visibility = "visible";
    }, 250);
  }
}, 70);
