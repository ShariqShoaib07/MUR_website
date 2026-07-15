const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const sections = [...document.querySelectorAll("main section[id]")];
const video = document.querySelector(".video-frame video");
const videoPlaceholder = document.querySelector(".video-placeholder");
const modelViewer = document.querySelector("model-viewer");
const modelFallback = document.querySelector(".model-fallback");
const canvas = document.querySelector(".particles");
const demoReel = document.querySelector("[data-demo-reel]");

const setNavState = () => {
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 24);
};

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  const currentPage = document.body.dataset.page;
  if (currentPage && link.dataset.page === currentPage) {
    link.classList.add("active");
  }

  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const hasAnchorNav = [...navLinks].some((link) => link.getAttribute("href")?.startsWith("#"));

if (sections.length && hasAnchorNav) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-45% 0px -48% 0px", threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

const countObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target || 0);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased).toLocaleString();
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    observer.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll(".count").forEach((el) => countObserver.observe(el));

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--x", `${event.clientX - rect.left}px`);
    button.style.setProperty("--y", `${event.clientY - rect.top}px`);
  });
});

document.querySelectorAll(".email-reveal").forEach((button) => {
  button.setAttribute("aria-expanded", "false");

  button.addEventListener("click", () => {
    const isOpen = button.classList.contains("is-open");
    document.querySelectorAll(".email-reveal.is-open").forEach((openButton) => {
      openButton.classList.remove("is-open");
      openButton.setAttribute("aria-expanded", "false");
      openButton.closest(".socials")?.classList.remove("email-open");
    });

    if (!isOpen) {
      button.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      button.closest(".socials")?.classList.add("email-open");
    }
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    button.closest(".socials")?.classList.remove("email-open");
    button.blur();
  });
});

if (video && videoPlaceholder) {
  const syncPlaceholder = () => {
    videoPlaceholder.style.display = video.readyState > 0 ? "none" : "grid";
  };
  video.addEventListener("loadedmetadata", syncPlaceholder);
  video.addEventListener("error", () => { videoPlaceholder.style.display = "grid"; });
  syncPlaceholder();
}

if (modelViewer && modelFallback) {
  modelViewer.addEventListener("load", () => { modelFallback.style.display = "none"; });
  modelViewer.addEventListener("error", () => { modelFallback.style.display = "grid"; });
}

if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(canvas.offsetWidth * ratio);
    canvas.height = Math.floor(canvas.offsetHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: window.innerWidth < 720 ? 42 : 76 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 2.2 + 0.6,
      s: Math.random() * 0.35 + 0.12,
      a: Math.random() * 0.5 + 0.18
    }));
  };

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    particles.forEach((p) => {
      p.y -= p.s;
      p.x += Math.sin((p.y + p.r) * 0.012) * 0.12;
      if (p.y < -10) {
        p.y = canvas.offsetHeight + 10;
        p.x = Math.random() * canvas.offsetWidth;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 225, 255, ${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(animateParticles);
  };

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("load", () => {
    resizeCanvas();
    animateParticles();
  });
}

if (demoReel && !window.__murDemoReelStarted) {
  window.__murDemoReelStarted = true;
  let showingSecondSet = false;

  const updateDemoReel = () => {
    demoReel.classList.toggle("is-second", showingSecondSet);
  };

  updateDemoReel();

  window.setInterval(() => {
    showingSecondSet = !showingSecondSet;
    updateDemoReel();
  }, 2000);
}

window.addEventListener("scroll", setNavState, { passive: true });
window.addEventListener("load", () => {
  setNavState();
  if (window.lucide) window.lucide.createIcons();
  if (window.AOS) {
    window.AOS.init({
      duration: 760,
      easing: "ease-out-cubic",
      once: true,
      offset: 70
    });
  }
});
