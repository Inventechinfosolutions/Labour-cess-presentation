(() => {
  const stage = document.getElementById("stage");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsEl = document.getElementById("dots");
  const counterEl = document.getElementById("counter");
  const titleEl = document.getElementById("chrome-title");
  const overviewEl = document.getElementById("overview");
  const overviewGrid = document.getElementById("overview-grid");
  const hintEl = document.getElementById("hint");
  const helpEl = document.getElementById("help");

  let slideIndex = 0;
  let beatIndex = 0;
  let overviewOpen = false;
  let helpOpen = false;

  const HOLD = [
    "button",
    "a",
    "input",
    "label",
    "select",
    ".js-hold",
    ".source-card",
    ".plat-row",
    ".record-card",
    ".link-node",
    ".step",
    ".assess-card",
    ".pin",
    ".flag",
    ".layer-item",
    ".project-row",
    ".rail-item",
    ".core-mod",
    ".dot",
    ".overview-card",
    ".phone-app",
    ".map-canvas",
    ".map-pin",
    ".map-pin-wrap",
    ".gm-style",
    ".gm-style-iw",
    ".gmnoprint",
    ".gmaps-keygate",
    ".legend-item",
  ].join(",");

  function fit() {
    if (window.CESSMaps && slides[slideIndex]) window.CESSMaps.sync(slides[slideIndex]);
  }

  function maxBeats(slide) {
    return Number(slide.dataset.beats || 1);
  }

  function buildDots() {
    dotsEl.innerHTML = "";
    slides.forEach((slide, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot" + (i === 0 ? " is-title" : "");
      b.title = slide.dataset.title || `Scene ${i}`;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(i, 0);
      });
      dotsEl.appendChild(b);
    });
  }

  function buildOverview() {
    overviewGrid.innerHTML = "";
    slides.forEach((slide, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "overview-card";
      card.innerHTML = `
        <span class="overview-num">${i === 0 ? "Open" : String(i).padStart(2, "0")}</span>
        <span class="overview-name">${slide.dataset.title || ""}</span>
        <span class="overview-sub">${slide.dataset.kicker || ""}</span>
      `;
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(i, 0);
      });
      overviewGrid.appendChild(card);
    });
  }

  function apply(writeHash = true) {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === slideIndex));
    const slide = slides[slideIndex];

    slide.querySelectorAll("[data-reveal]").forEach((el) => {
      el.classList.toggle("is-in", Number(el.dataset.reveal) <= beatIndex);
    });
    slide.querySelectorAll("[data-beat-eq]").forEach((el) => {
      el.classList.toggle("is-current", Number(el.dataset.beatEq) === beatIndex);
    });
    slide.querySelectorAll("[data-beat-min]").forEach((el) => {
      el.classList.toggle("is-in", Number(el.dataset.beatMin) <= beatIndex);
    });

    const name = slide.dataset.title || "";
    titleEl.textContent = name;
    counterEl.textContent =
      slideIndex === 0 ? "Opening" : `${String(slideIndex).padStart(2, "0")} / 10`;

    dotsEl.querySelectorAll(".dot").forEach((d, i) => {
      d.classList.toggle("is-active", i === slideIndex);
      d.classList.toggle("is-past", i < slideIndex);
    });

    overviewGrid.querySelectorAll(".overview-card").forEach((c, i) => {
      c.classList.toggle("is-active", i === slideIndex);
    });

    if (hintEl) {
      hintEl.classList.toggle("is-hidden", slideIndex > 0 || beatIndex > 0);
    }

    slide.dispatchEvent(
      new CustomEvent("cess-beat", { detail: { beat: beatIndex }, bubbles: true })
    );
    if (writeHash) syncHash();
    if (window.CESSMaps) window.CESSMaps.sync(slide);
  }

  function syncHash() {
    const next = `#${slideIndex}/${beatIndex}`;
    if (location.hash !== next) history.replaceState(null, "", next);
  }

  function fromHash() {
    const m = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
    if (!m) return false;
    slideIndex = Math.max(0, Math.min(slides.length - 1, Number(m[1])));
    const slide = slides[slideIndex];
    beatIndex = Math.max(0, Math.min(maxBeats(slide) - 1, Number(m[2] || 0)));
    overviewOpen = false;
    helpOpen = false;
    overviewEl.classList.remove("is-open");
    helpEl.classList.remove("is-open");
    apply(false);
    return true;
  }

  function goTo(i, beat = 0) {
    slideIndex = Math.max(0, Math.min(slides.length - 1, i));
    beatIndex = beat;
    overviewOpen = false;
    helpOpen = false;
    overviewEl.classList.remove("is-open");
    helpEl.classList.remove("is-open");
    apply();
  }

  function next() {
    if (overviewOpen || helpOpen) return;
    const slide = slides[slideIndex];
    const max = maxBeats(slide);
    if (beatIndex < max - 1) {
      beatIndex += 1;
      apply();
    } else if (slideIndex < slides.length - 1) {
      goTo(slideIndex + 1, 0);
    }
  }

  function prev() {
    if (overviewOpen || helpOpen) return;
    if (beatIndex > 0) {
      beatIndex -= 1;
      apply();
    } else if (slideIndex > 0) {
      const prevSlide = slides[slideIndex - 1];
      goTo(slideIndex - 1, maxBeats(prevSlide) - 1);
    }
  }

  function toggleOverview() {
    helpOpen = false;
    helpEl.classList.remove("is-open");
    overviewOpen = !overviewOpen;
    overviewEl.classList.toggle("is-open", overviewOpen);
  }

  function toggleHelp() {
    helpOpen = !helpOpen;
    helpEl.classList.toggle("is-open", helpOpen);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key;
    if (key === "Escape") {
      if (helpOpen) {
        helpOpen = false;
        helpEl.classList.remove("is-open");
        return;
      }
      toggleOverview();
      return;
    }
    if (key === "o" || key === "O") {
      e.preventDefault();
      toggleOverview();
      return;
    }
    if (key === "?" || key === "h" || key === "H") {
      e.preventDefault();
      toggleHelp();
      return;
    }
    if (key === "f" || key === "F") {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    if (overviewOpen || helpOpen) return;
    if (key === "ArrowRight" || key === " " || key === "PageDown" || key === "Enter") {
      e.preventDefault();
      next();
    } else if (key === "ArrowLeft" || key === "PageUp" || key === "Backspace") {
      e.preventDefault();
      prev();
    } else if (key === "Home") {
      e.preventDefault();
      goTo(0, 0);
    } else if (key === "End") {
      e.preventDefault();
      goTo(slides.length - 1, 0);
    } else if (/^[0-9]$/.test(key)) {
      const n = Number(key);
      if (n >= 0 && n < slides.length) goTo(n, 0);
    }
  });

  document.addEventListener("click", (e) => {
    if (overviewOpen || helpOpen) return;
    if (e.target.closest(HOLD)) return;
    if (e.target.closest(".chrome")) return;
    next();
  });

  document.addEventListener("dblclick", (e) => {
    if (e.target.closest(HOLD)) return;
    toggleFullscreen();
  });

  document.getElementById("btn-overview").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleOverview();
  });
  document.getElementById("btn-full").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });
  document.getElementById("btn-help").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleHelp();
  });
  overviewEl.addEventListener("click", (e) => {
    if (e.target === overviewEl) toggleOverview();
  });
  helpEl.addEventListener("click", (e) => {
    if (e.target === helpEl) toggleHelp();
  });

  /* Scene interactions */
  document.querySelectorAll(".source-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      card.classList.toggle("is-on");
      const host = card.closest(".slide");
      if (!host) return;
      const n = host.querySelectorAll(".source-card.is-on").length;
      const note = host.querySelector(".disconnect-note");
      if (note) {
        note.classList.toggle("is-on", n > 0);
        note.querySelector("strong").textContent = `${n} system${n === 1 ? "" : "s"} disconnected`;
      }
    });
  });

  document.querySelectorAll("[data-feed]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const slide = el.closest(".slide");
      const target = el.dataset.feed;
      slide.querySelectorAll(".plat-row").forEach((row) => {
        row.classList.toggle("is-lit", row.dataset.row === target);
      });
      slide.querySelectorAll("[data-feed]").forEach((s) => s.classList.remove("is-sending"));
      el.classList.add("is-sending");
      const packet = slide.querySelector(".data-packet");
      if (packet) {
        packet.dataset.from = target;
        packet.classList.remove("is-fly");
        void packet.offsetWidth;
        packet.classList.add("is-fly");
      }
    });
  });

  document.querySelectorAll(".plat-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      row.parentElement.querySelectorAll(".plat-row").forEach((r) => r.classList.remove("is-lit"));
      row.classList.add("is-lit");
    });
  });

  document.querySelectorAll(".link-node").forEach((node) => {
    node.addEventListener("click", (e) => {
      e.stopPropagation();
      const slide = node.closest(".slide");
      const key = node.dataset.link;
      slide.querySelectorAll(".link-node").forEach((n) => n.classList.toggle("is-on", n === node));
      slide.querySelectorAll(".record-card").forEach((c) => {
        c.classList.toggle("is-lit", c.dataset.card === key);
      });
    });
  });

  document.querySelectorAll(".record-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      card.parentElement.querySelectorAll(".record-card").forEach((c) => c.classList.remove("is-lit"));
      card.classList.add("is-lit");
    });
  });

  document.querySelectorAll(".step, .assess-card").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const n = Number(el.dataset.step);
      if (Number.isNaN(n)) return;
      const slide = el.closest(".slide");
      const idx = slides.indexOf(slide);
      if (idx >= 0) {
        slideIndex = idx;
        beatIndex = n;
        apply();
      }
    });
  });

  function setPin(slide, id) {
    slide.querySelectorAll(".pin, .flag, .project-row").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.pin === id);
    });
    slide.querySelectorAll(".map-popup").forEach((p) => {
      p.classList.toggle("is-on", p.dataset.pin === id);
    });
    const detail = slide.querySelector("[data-project-detail]");
    if (detail && PROJECTS[id]) {
      detail.innerHTML = PROJECTS[id];
    }
    const selected = slide.querySelector("[data-selected-name]");
    if (selected && PIN_META[id]) selected.textContent = PIN_META[id].name;
    if (window.CESSMaps) window.CESSMaps.focus(slide, id);
  }

  document.querySelectorAll(".pin, .flag, .project-row").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const slide = el.closest(".slide");
      setPin(slide, el.dataset.pin);
    });
  });

  document.querySelectorAll(".layer-item[data-layer]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      item.classList.toggle("is-off");
      const layer = item.dataset.layer;
      const on = !item.classList.contains("is-off");
      item.closest(".slide").querySelectorAll(`[data-layer-art="${layer}"]`).forEach((art) => {
        art.classList.toggle("is-off", !on);
      });
      if (window.CESSMaps) window.CESSMaps.toggleLayer(item.closest(".slide"), layer, on);
    });
  });

  document.querySelectorAll(".rail-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const slide = item.closest(".slide");
      slide.querySelectorAll(".rail-item").forEach((r) => r.classList.remove("is-on"));
      item.classList.add("is-on");
      const pulse = item.dataset.pulse;
      slide.querySelectorAll("[data-widget]").forEach((w) => {
        w.classList.toggle("is-pulse", w.dataset.widget === pulse);
      });
    });
  });

  document.querySelectorAll(".core-mod").forEach((mod) => {
    elClick(mod, () => {
      const slide = mod.closest(".slide");
      slide.querySelectorAll(".core-mod").forEach((m) => m.classList.toggle("is-on", m === mod));
      const panel = slide.querySelector(".core-detail");
      const data = CORE[mod.dataset.mod];
      if (panel && data) {
        panel.querySelector("h3").textContent = data.title;
        panel.querySelector("p").textContent = data.body;
        panel.querySelector("ul").innerHTML = data.items.map((i) => `<li>${i}</li>`).join("");
        panel.classList.add("is-on");
      }
    });
  });

  function elClick(el, fn) {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      fn();
    });
  }

  const PIN_META = {
    abc: { name: "ABC Commercial Complex" },
    sky: { name: "Skyline Residency" },
    tech: { name: "Tech Park Phase 2" },
    orion: { name: "Orion Mall Expansion" },
    maple: { name: "Maple Apartments" },
    a: { name: "Project A" },
    b: { name: "Project B" },
    c: { name: "Project C" },
    d: { name: "Project D" },
    e: { name: "Project E" },
  };

  const PROJECTS = {
    abc: `<div class="sel-photo"><svg class="art-fill" viewBox="0 0 280 340" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><use href="#art-site"/></svg></div>
      <div class="sel-body">
        <div class="sel-head"><b>ABC Commercial Complex</b><span class="status warn">Attention Required</span></div>
        <p>CESS-2025-000123 · Bengaluru Urban</p>
        <ul>
          <li>Status <b>Registered</b></li>
          <li>Assessment <b>Pending</b></li>
          <li>Collection <b>Not initiated</b></li>
        </ul>
      </div>`,
    sky: `<div class="sel-body"><div class="sel-head"><b>Skyline Residency</b><span class="status ok">Assessed</span></div><p>Bengaluru Urban · Assessment complete</p></div>`,
    tech: `<div class="sel-body"><div class="sel-head"><b>Tech Park Phase 2</b><span class="status ok">Active</span></div><p>Bengaluru East · Under construction</p></div>`,
    orion: `<div class="sel-body"><div class="sel-head"><b>Orion Mall Expansion</b><span class="status wait">Pending</span></div><p>Bengaluru East · CESS pending</p></div>`,
    maple: `<div class="sel-body"><div class="sel-head"><b>Maple Apartments</b><span class="status ok">Active</span></div><p>RR Nagar · On track</p></div>`,
    a: `<div class="sel-body"><div class="sel-head"><b>Project A</b><span class="status ok">CESS Paid</span></div><p>Registered · Assessment complete</p></div>`,
    b: `<div class="sel-body"><div class="sel-head"><b>Project B</b><span class="status wait">Payment Pending</span></div><p>Registered · Assessment complete</p></div>`,
    c: `<div class="sel-body"><div class="sel-head"><b>Project C</b><span class="status bad">CESS Registration Missing</span></div><p>Approval info available</p></div>`,
    d: `<div class="sel-body"><div class="sel-head"><b>Project D</b><span class="status wait">Assessment Pending</span></div><p>Registered</p></div>`,
    e: `<div class="sel-body"><div class="sel-head"><b>Project E</b><span class="status wait">Remittance Pending</span></div><p>Registered · Assessment complete</p></div>`,
  };

  const CORE = {
    gov: {
      title: "Governance & Control",
      body: "Manage people, structure and control across the department.",
      items: ["Super Administrator", "Territory structure", "Organisation structure", "Roles & permissions", "Administration & audit"],
    },
    doc: {
      title: "Document & Office Workflow",
      body: "Digitise and streamline inward, approvals and e-office processes.",
      items: ["Inward / Outward", "DMS", "E-Office", "Meetings", "Approvals"],
    },
    fin: {
      title: "Finance & CESS Operations",
      body: "Manage the end-to-end CESS lifecycle from demand to remittance.",
      items: ["Labour Cess operations", "Accounts", "Demand", "Payment", "Remittance", "Reconciliation"],
    },
    comm: {
      title: "Communication & Compliance",
      body: "Engage, monitor and ensure compliance with decision support.",
      items: ["Alerts & notifications", "Appeals", "Analytical reports", "DSS", "Compliance monitoring"],
    },
    ext: {
      title: "External Ecosystem",
      body: "Integrate with stakeholders through portal, APIs and connectors.",
      items: ["Labour CESS portal", "API / Integrations", "Connector / Self-service", "External stakeholders"],
    },
    gis: {
      title: "GIS & Spatial Intelligence",
      body: "Projects, locations and insights on a single geographic canvas.",
      items: ["Project visibility", "Assessment status", "Collection monitoring", "Potential exceptions"],
    },
  };

  document.querySelectorAll("[data-project-detail]").forEach((el) => {
    el.innerHTML = PROJECTS.abc;
  });

  window.CESSSelectPin = setPin;

  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", fromHash);
  fit();
  buildDots();
  buildOverview();
  if (!fromHash()) apply();
})();
