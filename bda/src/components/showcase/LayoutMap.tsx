import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { ArrowsOut, MapTrifold } from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/home/shared";
import { CtaButton, Panel } from "@/components/kit/Blocks";
import { LAYOUT_PINS, ONLINE_SERVICES } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  map: t2("Interactive Map", "ಸಂವಾದಾತ್ಮಕ ನಕ್ಷೆ"),
  mapBody: t2("Explore BDA layouts, sites and development activities across Bengaluru.", "ಬೆಂಗಳೂರಿನಾದ್ಯಂತ ಬಿಡಿಎ ಬಡಾವಣೆಗಳು, ನಿವೇಶನಗಳು ಮತ್ತು ಅಭಿವೃದ್ಧಿ ಕಾರ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ."),
  gis: t2("Open GIS Map", "GIS ನಕ್ಷೆ ತೆರೆಯಿರಿ"),
  all: t2("Show all", "ಎಲ್ಲವನ್ನೂ ತೋರಿಸಿ"),
};

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const PIN_SVG =
  '<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0Z" fill="currentColor"/><circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>';
const FIT = { paddingTopLeft: [40, 96] as [number, number], paddingBottomRight: [40, 20] as [number, number] };
const CYCLE = 3000;

export function LayoutMap() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const showAll = useRef<() => void>(() => {});
  const inView = useInView(box, { once: true, margin: "-60px" });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  const select = (i: number) => {
    setTouched(true);
    setActive(i);
  };
  const focus = (i: number) => {
    select(i);
    const p = LAYOUT_PINS[i];
    map.current?.flyTo([p.lat, p.lng], 14, { duration: reduce ? 0 : 1.1 });
  };
  const actions = useRef({ select, focus });
  actions.current = { select, focus };

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    let instance: LeafletMap | undefined;
    import("leaflet").then(({ default: L }) => {
      if (cancelled || !box.current) return;
      instance = L.map(box.current, { zoomControl: false, scrollWheelZoom: false, dragging: !L.Browser.mobile, zoomSnap: 0.25 });
      instance.attributionControl.setPrefix(false);
      L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(instance);
      L.control.zoom({ position: "topright" }).addTo(instance);
      const bounds = L.latLngBounds(LAYOUT_PINS.map((p) => [p.lat, p.lng]));
      instance.fitBounds(bounds, FIT);
      const m = instance;
      showAll.current = () => m.flyToBounds(bounds, { ...FIT, duration: 1 });
      markers.current = LAYOUT_PINS.map((p, i) =>
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            className: cn("bda-marker", i === 0 && "is-office"),
            html: `<span class="bda-pin" style="--d:${250 + i * 110}ms">${PIN_SVG}</span>`,
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            tooltipAnchor: [0, -44],
          }),
          riseOnHover: true,
        })
          .bindTooltip("", { permanent: true, direction: "top", className: "bda-tip", opacity: 1 })
          .on("mouseover", () => actions.current.select(i))
          .on("click", () => actions.current.focus(i))
          .addTo(m),
      );
      map.current = m;
      setReady(true);
    });
    return () => {
      cancelled = true;
      instance?.remove();
      map.current = null;
      markers.current = [];
    };
  }, [inView]);

  useEffect(() => {
    if (!ready) return;
    markers.current.forEach((mk, i) => {
      const p = LAYOUT_PINS[i];
      mk.setTooltipContent(`<strong>${t(p.label)}</strong><span>${t(p.area)}</span>`);
      mk.getElement()?.setAttribute("aria-label", t(p.label));
    });
  }, [ready, lang]);

  useEffect(() => {
    if (!ready) return;
    markers.current.forEach((mk, i) => {
      const on = i === active;
      mk.getElement()?.classList.toggle("is-active", on);
      mk.getTooltip()?.getElement()?.classList.toggle("is-on", on);
      mk.setZIndexOffset(on ? 1000 : 0);
    });
    const c = row.current;
    const chip = c?.children[active] as HTMLElement | undefined;
    if (c && chip) c.scrollTo({ left: chip.offsetLeft - c.clientWidth / 2 + chip.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
  }, [active, ready, lang, reduce]);

  useEffect(() => {
    if (!ready || touched || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % LAYOUT_PINS.length), CYCLE);
    return () => clearInterval(id);
  }, [ready, touched, reduce]);

  return (
    <Reveal delay={0.08} className="h-full">
      <Panel className="flex h-full flex-col rounded-[28px]">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <MapTrifold weight="duotone" className="size-6" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-navy">{t(TEXT.map)}</h3>
            <p className="mt-0.5 text-[13px] text-muted">{t(TEXT.mapBody)}</p>
          </div>
        </div>

        <div className="relative isolate mt-4 min-h-72 flex-1 overflow-hidden rounded-2xl border border-line">
          <div ref={box} className="bda-map absolute inset-0" />
          <AnimatePresence>
            {!ready && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-[#eef4ff]"
              >
                <MapTrifold weight="duotone" className="size-12 animate-pulse text-brand/40" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={row} className="no-scrollbar relative -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 py-1 [contain:inline-size]">
          {LAYOUT_PINS.map((p, i) => (
            <button
              key={p.label.en}
              type="button"
              aria-pressed={i === active}
              onMouseEnter={() => select(i)}
              onClick={() => focus(i)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-300",
                i === active ? "border-brand bg-brand text-white" : "border-line bg-white text-navy hover:border-brand hover:bg-brand hover:text-white",
              )}
            >
              {t(p.label)}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CtaButton href={ONLINE_SERVICES[0].href}>{t(TEXT.gis)}</CtaButton>
          <button
            type="button"
            onClick={() => showAll.current()}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-navy transition-colors duration-300 hover:border-brand hover:bg-brand hover:text-white"
          >
            <ArrowsOut weight="bold" />
            {t(TEXT.all)}
          </button>
        </div>
      </Panel>
    </Reveal>
  );
}
