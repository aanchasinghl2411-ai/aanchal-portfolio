/* ==========================================================================
   Aanchal Singh — Portfolio interactions
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. Neural network particle canvas (signature hero element)
     ------------------------------------------------------------------ */
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };
  let animationId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initParticles() {
    const area = canvas.width * canvas.height;
    const count = Math.min(90, Math.max(36, Math.floor(area / 22000)));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201,168,118,0.55)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          const opacity = (1 - dist / 130) * 0.15;
          ctx.strokeStyle = `rgba(106,107,240,${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(drawParticles);
  }

  function startCanvas() {
    resizeCanvas();
    initParticles();
    if (!prefersReducedMotion) {
      cancelAnimationFrame(animationId);
      drawParticles();
    } else {
      drawParticles();
      cancelAnimationFrame(animationId);
    }
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  startCanvas();

  /* ------------------------------------------------------------------
     2. Scroll reveal via IntersectionObserver
     ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     3. Count-up stats
     ------------------------------------------------------------------ */
  const counters = document.querySelectorAll(".stat-num[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     4. Navbar scrolled state
     ------------------------------------------------------------------ */
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });

  /* ------------------------------------------------------------------
     5. Mobile menu toggle
     ------------------------------------------------------------------ */
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  document.querySelectorAll('.mobile-menu a[data-nav]').forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });

  /* ------------------------------------------------------------------
     6. Side progress dots — active section tracking + click to scroll
     ------------------------------------------------------------------ */
  const sections = document.querySelectorAll("main > section[id], header ~ * section[id]");
  const allSections = document.querySelectorAll("section[id]");
  const dots = document.querySelectorAll(".side-dots .dot");

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          dots.forEach((dot) => {
            dot.classList.toggle("active", dot.dataset.target === id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  allSections.forEach((sec) => sectionObserver.observe(sec));

  /* ------------------------------------------------------------------
     7. Magnetic buttons (desktop only, subtle pull toward cursor)
     ------------------------------------------------------------------ */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !prefersReducedMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ------------------------------------------------------------------
     8. Smooth scroll for in-page nav links (fallback / offset handling)
     ------------------------------------------------------------------ */
  document.querySelectorAll('a[data-nav]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

});
