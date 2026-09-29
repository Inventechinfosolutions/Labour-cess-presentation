(() => {
  const ABC = [12.9616, 77.6973];
  const BLR = [12.9716, 77.5946];
  const KA = [14.7, 76.35];

  const PROJECTS = [
    { id: "abc", name: "ABC Commercial Complex", latlng: ABC, color: "#0e9aa7", status: "In progress" },
    { id: "sky", name: "Skyline Residency", latlng: [13.035, 77.571], color: "#1b9a58", status: "Assessed" },
    { id: "tech", name: "Tech Park Phase 2", latlng: [12.935, 77.695], color: "#1d6fb3", status: "Active" },
    { id: "orion", name: "Orion Mall Expansion", latlng: [13.011, 77.555], color: "#e08a00", status: "Pending" },
    { id: "maple", name: "Maple Apartments", latlng: [12.927, 77.518], color: "#1b9a58", status: "Active" },
  ];

  const LEAK = [
    { id: "abc", name: "ABC Commercial Complex", latlng: ABC, color: "#d64545", status: "Exception" },
    { id: "a", name: "Project A", latlng: [13.04, 77.61], color: "#1b9a58", status: "CESS paid" },
    { id: "b", name: "Project B", latlng: [12.97, 77.54], color: "#e08a00", status: "Payment pending" },
    { id: "c", name: "Project C", latlng: [13.08, 77.64], color: "#e08a00", status: "Unregistered" },
    { id: "d", name: "Project D", latlng: [12.96, 77.72], color: "#1b9a58", status: "Registered" },
    { id: "e", name: "Project E", latlng: [12.89, 77.58], color: "#e08a00", status: "Remittance pending" },
  ];

  const DISTRICTS = [
    { id: "abc", name: "Bengaluru · ABC Complex", latlng: ABC, color: "#d64545" },
    { id: "mys", name: "Mysuru", latlng: [12.295, 76.655], color: "#1b9a58" },
    { id: "tum", name: "Tumakuru", latlng: [13.34, 77.102], color: "#e08a00" },
    { id: "bel", name: "Belagavi", latlng: [15.849, 74.498], color: "#1d6fb3" },
    { id: "kal", name: "Kalaburagi", latlng: [17.329, 76.834], color: "#1b9a58" },
  ];

  function ring(centerLngLat, rx, ry, n = 72) {
    const coords = [];
    for (let i = 0; i <= n; i += 1) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      coords.push([centerLngLat[0] + Math.cos(a) * rx, centerLngLat[1] + Math.sin(a) * ry]);
    }
    return coords;
  }

  const ADMIN = [
    { name: "North Zone", color: "#1d6fb3", ring: [[77.52, 13.02], [77.68, 13.02], [77.68, 13.14], [77.52, 13.14]] },
    { name: "East Zone", color: "#0e9aa7", ring: [[77.64, 12.92], [77.78, 12.92], [77.78, 13.06], [77.64, 13.06]] },
    { name: "West Zone", color: "#1b9a58", ring: [[77.46, 12.9], [77.58, 12.9], [77.58, 13.04], [77.46, 13.04]] },
    { name: "South Zone", color: "#e08a00", ring: [[77.54, 12.82], [77.7, 12.82], [77.7, 12.94], [77.54, 12.94]] },
  ];

  const ORR = ring([77.61, 12.97], 0.105, 0.092);
  const FOOTPRINT = [
    [77.6958, 12.9604],
    [77.6988, 12.9604],
    [77.6988, 12.9628],
    [77.6958, 12.9628],
  ];
  const GPS_VISITS = [
    [77.6973, 12.9616],
    [77.6964, 12.9624],
    [77.6982, 12.9608],
  ];

  const registry = new Map();
  const waiters = [];
  let mapsReady = false;
  let loading = false;

  function ll(pair) {
    return { lat: pair[0], lng: pair[1] };
  }

  function lnglat(pair) {
    return { lat: pair[1], lng: pair[0] };
  }

  function getKey() {
    const q = new URLSearchParams(location.search).get("gmaps");
    if (q) {
      try { localStorage.setItem("CESS_GMAPS_KEY", q); } catch (err) { /* ignore */ }
      return q;
    }
    if (window.CESS_GMAPS_KEY) return String(window.CESS_GMAPS_KEY).trim();
    try { return localStorage.getItem("CESS_GMAPS_KEY") || ""; } catch (err) { return ""; }
  }

  function group(items) {
    return {
      items,
      setMap(map) {
        items.forEach((item) => item.setMap(map));
      },
    };
  }

  function pinIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28">
      <path d="M11 1C5.7 1 1.4 5.2 1.4 10.4c0 7.1 9.6 16.2 9.6 16.2s9.6-9.1 9.6-16.2C20.6 5.2 16.3 1 11 1z" fill="${color}" stroke="#fff" stroke-width="1.6"/>
      <circle cx="11" cy="10.2" r="3.1" fill="#fff"/>
    </svg>`;
    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(22, 28),
      anchor: new google.maps.Point(11, 28),
    };
  }

  function popupHtml(p) {
    return `<div class="cess-pop"><b>${p.name}</b><p>${p.status || ""}</p>
      <p class="gps-coords">${p.latlng[0].toFixed(4)}° N, ${p.latlng[1].toFixed(4)}° E</p></div>`;
  }

  function resize(rec) {
    if (!rec || !rec.map) return;
    google.maps.event.trigger(rec.map, "resize");
    rec.map.setCenter(rec.center);
  }

  function placeMarkers(map, list, slide, rec) {
    rec.markers = {};
    rec.info = new google.maps.InfoWindow();
    rec.markerGroup = [];
    list.forEach((p) => {
      const marker = new google.maps.Marker({
        position: ll(p.latlng),
        map,
        title: p.name,
        icon: pinIcon(p.color),
        optimized: false,
      });
      marker.__meta = p;
      marker.addListener("click", (ev) => {
        if (ev && ev.domEvent) ev.domEvent.stopPropagation();
        rec.info.setContent(popupHtml(p));
        rec.info.open({ map, anchor: marker });
        if (window.CESSSelectPin) window.CESSSelectPin(slide, p.id);
      });
      rec.markers[p.id] = marker;
      rec.markerGroup.push(marker);
    });
  }

  function addOverlays(map, rec, kind) {
    rec.layers.admin = group(ADMIN.map((zone) => new google.maps.Polygon({
      map,
      paths: zone.ring.map(lnglat),
      strokeColor: "#5b3d9c",
      strokeOpacity: 0.9,
      strokeWeight: 1.6,
      fillColor: zone.color,
      fillOpacity: 0.18,
      clickable: false,
    })));

    rec.layers.roads = new google.maps.Polyline({
      map: kind === "leak" ? null : map,
      path: ORR.map(lnglat),
      strokeColor: "#d4a017",
      strokeOpacity: 0.95,
      strokeWeight: 3.5,
      clickable: false,
    });

    rec.layers.approval = new google.maps.Polygon({
      map: kind === "layers" ? map : null,
      paths: FOOTPRINT.map(lnglat),
      strokeColor: "#d4a017",
      strokeWeight: 3,
      fillColor: "#0b1f4a",
      fillOpacity: 0.35,
      clickable: false,
    });

    rec.layers.gps = group(GPS_VISITS.map((pt) => new google.maps.Circle({
      map: kind === "layers" ? map : null,
      center: lnglat(pt),
      radius: 28,
      strokeColor: "#fff",
      strokeWeight: 2,
      fillColor: "#14c4d4",
      fillOpacity: 1,
      clickable: false,
    })));

    rec.layers.cess = new google.maps.Circle({
      map: kind === "layers" ? map : null,
      center: ll(ABC),
      radius: 220,
      strokeColor: "#e08a00",
      strokeWeight: 2,
      fillColor: "#e08a00",
      fillOpacity: 0.16,
      clickable: false,
    });
  }

  function init(el) {
    const kind = el.dataset.map;
    if (registry.has(el.id) || !kind || !window.google || !google.maps) return;
    const slide = el.closest(".slide");
    const cfg = {
      gis: { center: BLR, zoom: 12, list: PROJECTS, overlays: true, zoomControl: true },
      layers: { center: ABC, zoom: 15, list: [PROJECTS[0]], overlays: true, zoomControl: true },
      leak: { center: BLR, zoom: 12, list: LEAK, overlays: true, zoomControl: true },
      gps: { center: ABC, zoom: 17, list: [PROJECTS[0]], overlays: false, zoomControl: false },
      karnataka: { center: KA, zoom: 7, list: DISTRICTS, overlays: false, zoomControl: true },
      "karnataka-mini": { center: KA, zoom: 6, list: DISTRICTS, overlays: false, zoomControl: false, locked: true },
    }[kind];

    const center = ll(cfg.center);
    const map = new google.maps.Map(el, {
      center,
      zoom: cfg.zoom,
      mapTypeId: "roadmap",
      disableDefaultUI: true,
      zoomControl: !!cfg.zoomControl,
      gestureHandling: cfg.locked ? "none" : "greedy",
      keyboardShortcuts: false,
      clickableIcons: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      backgroundColor: "#e8eef4",
    });

    const rec = { map, kind, slide, markers: {}, layers: {}, center, markerGroup: [] };
    registry.set(el.id, rec);
    if (cfg.overlays) addOverlays(map, rec, kind);
    placeMarkers(map, cfg.list, slide, rec);
    google.maps.event.addListenerOnce(map, "idle", () => resize(rec));
    setTimeout(() => resize(rec), 120);
    setTimeout(() => resize(rec), 480);
  }

  function paintKeyGate(el) {
    if (el.querySelector(".gmaps-keygate")) return;
    el.innerHTML = `
      <form class="gmaps-keygate js-hold">
        <b>Google Maps</b>
        <p>Paste a Maps JavaScript API key to load live streets and satellite.</p>
        <input name="key" type="text" autocomplete="off" spellcheck="false" placeholder="AIza…" />
        <button type="submit">Load Google Maps</button>
      </form>`;
    el.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const key = el.querySelector("input").value.trim();
      if (!key) return;
      try { localStorage.setItem("CESS_GMAPS_KEY", key); } catch (err) { /* ignore */ }
      window.CESS_GMAPS_KEY = key;
      document.querySelectorAll(".map-canvas").forEach((node) => { node.innerHTML = ""; });
      registry.clear();
      mapsReady = false;
      loading = false;
      ensureApi().then(() => {
        const slide = document.querySelector(".slide.is-active");
        if (slide) sync(slide);
      });
    });
  }

  function sync(slide) {
    if (!slide) return;
    if (!mapsReady) {
      waiters.push(slide);
      ensureApi();
      slide.querySelectorAll(".map-canvas").forEach((el) => {
        if (!getKey()) paintKeyGate(el);
      });
      return;
    }
    slide.querySelectorAll(".map-canvas").forEach((el) => init(el));
    slide.querySelectorAll(".map-canvas").forEach((el) => resize(registry.get(el.id)));
  }

  function flushWaiters() {
    const slides = waiters.splice(0);
    slides.forEach((slide) => sync(slide));
  }

  function ensureApi() {
    if (mapsReady) return Promise.resolve();
    const key = getKey();
    if (!key) return Promise.resolve();
    if (loading) return Promise.resolve();
    loading = true;
    return new Promise((resolve) => {
      window.__cessGmapsReady = () => {
        mapsReady = true;
        flushWaiters();
        resolve();
      };
      if (window.google && google.maps && google.maps.Map) {
        window.__cessGmapsReady();
        return;
      }
      const s = document.createElement("script");
      s.id = "gmaps-sdk";
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) + "&callback=__cessGmapsReady&v=weekly";
      s.async = true;
      s.defer = true;
      s.onerror = () => { loading = false; };
      document.head.appendChild(s);
    });
  }

  function toggleLayer(slide, layer, on) {
    slide.querySelectorAll(".map-canvas").forEach((el) => {
      const rec = registry.get(el.id);
      if (!rec) return;
      if (layer === "base") {
        rec.map.setMapTypeId(on ? "roadmap" : "hybrid");
        return;
      }
      if (layer === "projects") {
        rec.markerGroup.forEach((m) => m.setMap(on ? rec.map : null));
        return;
      }
      const key = layer === "infra" || layer === "roads" ? "roads" : layer;
      const lyr = rec.layers[key];
      if (!lyr) return;
      lyr.setMap(on ? rec.map : null);
    });
  }

  function focus(slide, id) {
    slide.querySelectorAll(".map-canvas").forEach((el) => {
      const rec = registry.get(el.id);
      if (!rec || !rec.markers[id]) return;
      const marker = rec.markers[id];
      rec.map.panTo(marker.getPosition());
      rec.map.setZoom(Math.max(rec.map.getZoom(), 14));
      if (marker.__meta) rec.info.setContent(popupHtml(marker.__meta));
      rec.info.open({ map: rec.map, anchor: marker });
    });
  }

  window.CESSMaps = { sync, toggleLayer, focus };
  ensureApi();
})();
