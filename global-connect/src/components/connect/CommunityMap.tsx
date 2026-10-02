import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  CalendarStar,
  GraduationCap,
  Lightbulb,
  MapPin,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { WorldTiles } from "@/components/WorldTiles";
import { useElementSize } from "@/hooks/useElementSize";
import { fitPoints, toScreen, type Inset, type LatLng, type Size } from "@/lib/geo";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";
import { EASE } from "./shared";

const LIGHT_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const HUB: LatLng = [12.97, 77.59];

type Region = { id: string; label: string; at: LatLng; countries: string; places: string[] };

const REGIONS: Region[] = [
  { id: "na", label: "North America", at: [39, -98], countries: "United States · Canada", places: ["San Francisco Bay Area", "New York", "Toronto"] },
  { id: "eu", label: "Europe", at: [50, 10], countries: "United Kingdom · Germany · Netherlands", places: ["London", "Berlin", "Amsterdam"] },
  { id: "me", label: "Middle East", at: [25, 47], countries: "UAE · Qatar · Oman · Saudi Arabia", places: ["Dubai", "Doha", "Muscat"] },
  { id: "ap", label: "Asia Pacific", at: [22, 116], countries: "Singapore · Japan · Malaysia", places: ["Singapore", "Tokyo", "Kuala Lumpur"] },
  { id: "au", label: "Australia", at: [-26, 134], countries: "Australia · New Zealand", places: ["Sydney", "Melbourne", "Auckland"] },
  { id: "af", label: "Africa", at: [0, 22], countries: "Kenya · South Africa · Nigeria", places: ["Nairobi", "Johannesburg", "Lagos"] },
];

const NETWORK: { label: string; icon: Icon }[] = [
  { label: "Kannadiga Associations", icon: UsersThree },
  { label: "Professionals", icon: Briefcase },
  { label: "Entrepreneurs", icon: Lightbulb },
  { label: "Students", icon: GraduationCap },
  { label: "Community Events", icon: CalendarStar },
  { label: "Karnataka Initiatives", icon: MapPin },
];

const POINTS: LatLng[] = [...REGIONS.map((r) => r.at), HUB, [62, -120], [-40, 150]];

function insetFor({ w }: Size): Inset {
  return w >= 1024 ? { l: 40, r: 420, t: 50, b: 40 } : { l: 24, r: 24, t: 40, b: 30 };
}

function arcPath([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const bow = Math.min(120, len * 0.3);
  return `M${x1},${y1} Q${mx},${my - bow} ${x2},${y2}`;
}

export function CommunityMap({ reduce }: { reduce: boolean }) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [selected, setSelected] = useState("na");
  const region = REGIONS.find((r) => r.id === selected)!;
  const view = useMemo(() => (size ? fitPoints(POINTS, size, insetFor(size)) : null), [size]);
  const hub = view && size ? toScreen(view, size, HUB) : null;
  const k = (size?.w ?? 1200) < 640 ? 0.08 : 0.13;

  return (
    <section id="community" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Global community"
        title="Find Your Global Kannada Community"
        sub="Discover communities, professionals, associations and initiatives around the world."
        reduce={reduce}
      />

      <motion.div
        className="relative mx-auto mt-12 max-w-[1220px] overflow-hidden rounded-[28px] bg-[#eef3f9] ring-1 ring-(color:--gc-ink)/8"
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div ref={ref} className="relative h-[340px] sm:h-[440px] lg:h-[540px]">
          {view && size ? (
            <WorldTiles
              view={view}
              size={size}
              url={LIGHT_TILES}
              maxZoom={10}
              className="pointer-events-none absolute inset-0 overflow-hidden [filter:saturate(0.6)_hue-rotate(185deg)_brightness(1.02)] opacity-90"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_50%,transparent_40%,rgba(238,243,249,0.8)_100%)]" />

          {view && size && hub ? (
            <>
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
                {REGIONS.map((r) => {
                  const p = toScreen(view, size, r.at);
                  const on = r.id === selected;
                  return (
                    <motion.path
                      key={`${r.id}-${on}`}
                      d={arcPath(p, hub)}
                      fill="none"
                      stroke={on ? "#e0a91f" : "#1f6fe5"}
                      strokeOpacity={on ? 1 : 0.18}
                      strokeWidth={on ? 2.4 : 1.2}
                      strokeDasharray={on ? undefined : "3 5"}
                      initial={reduce || !on ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  );
                })}
                <circle cx={hub[0]} cy={hub[1]} r={26} fill="#f0c14a" opacity={0.18} />
                {!reduce ? (
                  <motion.circle
                    cx={hub[0]}
                    cy={hub[1]}
                    fill="none"
                    stroke="#e0a91f"
                    strokeWidth={1.4}
                    initial={{ r: 8, opacity: 0.8 }}
                    animate={{ r: 40, opacity: 0 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
                <g transform={`translate(${hub[0] - BENGALURU_POINT.x * k} ${hub[1] - BENGALURU_POINT.y * k}) scale(${k})`}>
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <path key={d.name} d={d.d} fill="#f0b429" stroke="#fff" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                  ))}
                </g>
              </svg>
              <span
                className="pointer-events-none absolute -translate-x-1/2 rounded-full bg-(color:--gc-ink) px-2.5 py-1 font-display text-[11px] font-semibold tracking-[0.14em] text-(color:--gc-gold) shadow"
                style={{ left: hub[0], top: hub[1] + 26 }}
              >
                KARNATAKA
              </span>

              {REGIONS.map((r) => {
                const [x, y] = toScreen(view, size, r.at);
                const on = r.id === selected;
                return (
                  <motion.button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r.id)}
                    aria-pressed={on}
                    aria-label={r.label}
                    className={cn(
                      "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full p-1 sm:py-1.5 sm:pr-3 sm:pl-1.5 text-[12px] font-semibold whitespace-nowrap shadow-[0_6px_16px_rgba(11,31,74,0.15)] transition-colors sm:text-[13px]",
                      on ? "z-10 bg-(color:--gc-ink) text-white" : "bg-white text-(color:--gc-ink) hover:bg-[#f2f7ff]",
                    )}
                    style={{ left: x, top: y }}
                    animate={{ scale: on ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <span className={cn("grid size-5 place-items-center rounded-full", on ? "bg-(color:--gc-gold-3) text-(color:--gc-ink)" : "bg-(color:--gc-primary-soft) text-(color:--gc-primary)")}>
                      <MapPin size={12} weight="fill" />
                    </span>
                    <span className="hidden sm:inline">{r.label}</span>
                  </motion.button>
                );
              })}
            </>
          ) : null}
          <span className="absolute bottom-2 left-3 text-[9px] text-(color:--gc-body)/60">Base map: Esri</span>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-(color:--gc-ink)/8 bg-white px-5 pt-4 sm:hidden">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-semibold",
                r.id === selected ? "bg-(color:--gc-ink) text-white" : "bg-(color:--gc-surface) text-(color:--gc-ink)",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="relative bg-white p-5 sm:border-t sm:border-(color:--gc-ink)/8 lg:absolute lg:top-5 lg:right-5 lg:bottom-5 lg:w-[360px] lg:rounded-2xl lg:border-0 lg:shadow-[0_20px_50px_rgba(11,31,74,0.16)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={region.id}
              initial={reduce ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex h-full flex-col"
            >
              <p className="text-[11px] font-bold tracking-[0.18em] text-(color:--gc-primary-deep) uppercase">Selected region</p>
              <h3 className="mt-1 font-display text-[22px] font-bold text-(color:--gc-ink) uppercase">{region.label}</h3>
              <p className="mt-0.5 text-[13px] text-(color:--gc-body)">{region.countries}</p>
              <ul className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {NETWORK.map(({ label, icon: Icon }, i) => (
                  <motion.li
                    key={label}
                    className="flex items-center gap-2.5 rounded-xl bg-(color:--gc-surface) px-3 py-2 text-[13px] font-medium text-(color:--gc-ink)"
                    initial={reduce ? false : { opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  >
                    <Icon size={17} weight="duotone" className="text-(color:--gc-primary)" />
                    {label}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {region.places.map((p) => (
                  <span key={p} className="rounded-full border border-[#e0a91f]/40 bg-[#fffaf0] px-2.5 py-1 text-[11.5px] font-medium text-[#8a6410]">
                    {p}
                  </span>
                ))}
              </div>
              <a
                href="#join"
                className="group mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-(color:--gc-ink) px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#13306d] lg:mt-auto"
              >
                Explore Network
                <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
