(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    const step = parseFloat(group.dataset.stagger) || 0.09;
    [...group.children].forEach((child, i) => {
      child.classList.add("rv");
      child.style.setProperty("--d", `${i * step}s`);
    });
  });

  document.querySelectorAll(".rv, .draw").forEach((el) => io.observe(el));

  document.querySelectorAll(".intro").forEach((group) =>
    [...group.children].forEach((child, i) => child.style.setProperty("--i", i)),
  );

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", scrollY > 24);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const layers = [...document.querySelectorAll("[data-parallax]")];
  if (layers.length && !reduce) {
    let ticking = false;
    const run = () => {
      layers.forEach((el) => {
        const box = el.parentElement.getBoundingClientRect();
        const k = parseFloat(el.dataset.parallax) || 0.08;
        const shift = (box.top + box.height / 2 - innerHeight / 2) * -k;
        el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(1.12)`;
      });
      ticking = false;
    };
    addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(run);
        }
      },
      { passive: true },
    );
    run();
  }

  // Decorative hero slide indicator: steps through the dots on a timer.
  document.querySelectorAll("[data-dots]").forEach((wrap) => {
    const dots = [...wrap.children];
    if (!dots.length || reduce) return;
    let i = 0;
    setInterval(() => {
      dots[i].classList.remove("on");
      i = (i + 1) % dots.length;
      dots[i].classList.add("on");
    }, 3200);
  });

  // Mobile menu, built from each design's own header links.
  const nav = document.querySelector(".site-header nav");
  const links = nav ? [...nav.querySelectorAll("a.ul")] : [];
  if (links.length) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-btn";
    btn.setAttribute("aria-label", "Open menu");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    (nav.querySelector(".icons") || nav).append(btn);

    const logo = nav.querySelector(".logo img");
    const panel = document.createElement("div");
    panel.className = "menu-panel";
    panel.innerHTML = `
      <div class="menu-top">
        ${logo ? `<img src="${logo.getAttribute("src")}" alt="${logo.alt}" />` : "<span></span>"}
        <button type="button" class="menu-close" aria-label="Close menu"><span></span><span></span></button>
      </div>
      <nav class="menu-links" aria-label="Main"></nav>
      <div class="menu-extra"></div>
      <p class="menu-note">Government of Karnataka Initiative · A Heritage Since 1912</p>`;
    const copy = (a, i) => {
      const item = document.createElement("a");
      item.href = a.getAttribute("href");
      item.textContent = a.textContent.trim();
      item.style.setProperty("--i", i);
      return item;
    };
    panel.querySelector(".menu-links").append(...links.map(copy));
    panel.querySelector(".menu-extra").append(...[...document.querySelectorAll(".topbar a.ul")].map(copy));
    document.body.append(panel);

    const close = panel.querySelector(".menu-close");
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", String(open));
      panel.inert = !open;
      (open ? close : btn).focus({ preventScroll: true });
    };
    panel.inert = true;
    btn.addEventListener("click", () => setOpen(true));
    close.addEventListener("click", () => setOpen(false));
    panel.addEventListener("click", (e) => e.target.closest(".menu-links a, .menu-extra a") && setOpen(false));
    addEventListener("keydown", (e) => e.key === "Escape" && document.body.classList.contains("menu-open") && setOpen(false));
  }

  document.querySelectorAll("form[data-subscribe]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      if (btn) btn.textContent = "Subscribed ✓";
      form.reset();
    }),
  );
})();
