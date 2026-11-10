document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Sections (these IDs exist in your HTML)
  const sections = {
    beginner: document.getElementById("beginner"),
    intermediate: document.getElementById("intermediate"),
    pro: document.getElementById("pro"),
  };

  const groups = document.querySelectorAll(".group");
  const navButtons = document.querySelectorAll(".nav-btn");
  const brand = document.querySelector(".nav-brand");

  // This exists in your HTML (top of the white content area)
  const contentStart = document.getElementById("content-start");

  function setActive(btn) {
    navButtons.forEach((b) => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
  }

  function showOnly(id) {
    // show everything by default
    groups.forEach((g) => (g.style.display = "block"));

    // filter view: hide other groups + collapse hero via CSS (body.filtered)
    if (id !== "all") {
      groups.forEach((g) => {
        if (g.id !== id) g.style.display = "none";
      });
      body.classList.add("filtered");
    } else {
      body.classList.remove("filtered");
    }
  }

  function scrollToView(id) {
    if (id === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // When filtered, we want the cards to sit at the top of the white section
    if (contentStart) {
      contentStart.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // fallback
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Navbar click behavior
  navButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href") || "";

      // Home button (shows all)
      if (href.includes("home.html")) {
        e.preventDefault();
        setActive(btn);
        showOnly("all");
        scrollToView("all");
        return;
      }

      // Section buttons (#beginner, #intermediate, #pro)
      if (href.startsWith("#")) {
        const id = href.slice(1).toLowerCase();
        if (sections[id]) {
          e.preventDefault();
          setActive(btn);
          showOnly(id);
          scrollToView(id);
        }
      }
    });
  });

  // Clicking the brand resets to Home
  if (brand) {
    brand.addEventListener("click", (e) => {
      e.preventDefault();
      const homeBtn = Array.from(navButtons).find((b) =>
        (b.getAttribute("href") || "").includes("home.html")
      );
      setActive(homeBtn);
      showOnly("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Default view on load
  showOnly("all");
});
