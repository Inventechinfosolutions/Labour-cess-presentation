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

  document.querySelectorAll("form[data-subscribe]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      if (btn) btn.textContent = "Subscribed ✓";
      form.reset();
    }),
  );
})();
