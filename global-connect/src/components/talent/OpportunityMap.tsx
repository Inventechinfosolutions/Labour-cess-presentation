import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  Buildings,
  Flask,
  GlobeHemisphereEast,
  GlobeHemisphereWest,
  GlobeSimple,
  GraduationCap,
  MapPin,
  type Icon,
} from "@phosphor-icons/react";
import asiapacific from "@/assets/talent/region-asiapacific.jpg";
import australia from "@/assets/talent/region-australia.jpg";
import europe from "@/assets/talent/region-europe.jpg";
import japan from "@/assets/talent/region-japan.jpg";
import middleeast from "@/assets/talent/region-middleeast.jpg";
import others from "@/assets/talent/region-others.jpg";
import usa from "@/assets/talent/region-usa.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { WorldTiles } from "@/components/WorldTiles";
import { useElementSize } from "@/hooks/useElementSize";
import { fitPoints, toScreen, type Inset, type LatLng, type Size } from "@/lib/geo";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";

const LIGHT_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const HUB: LatLng = [12.97, 77.59];

type Point = { id: string; label: string; at: LatLng };
const POINTS: Point[] = [
  { id: "usa", label: "USA", at: [40.71, -74.0] },
  { id: "ca", label: "Canada", at: [49.28, -123.12] },
  { id: "uk", label: "UK", at: [51.5, -0.13] },
  { id: "eu", label: "Europe", at: [41.9, 12.5] },
  { id: "me", label: "Middle East", at: [25.2, 55.3] },
  { id: "af", label: "Africa", at: [-1.29, 36.82] },
  { id: "sg", label: "Singapore", at: [1.35, 103.8] },
  { id: "jp", label: "Japan", at: [35.68, 139.7] },
  { id: "au", label: "Australia", at: [-33.87, 151.2] },
];

type Region = { id: string; label: string; icon: Icon; points: string[]; image: string; skills: string[] };
const REGIONS: Region[] = [
  { id: "us", label: "United States", icon: GlobeHemisphereWest, points: ["usa"], image: usa, skills: ["AI", "Data Science", "Healthcare", "Clean Energy"] },
  { id: "eu", label: "Europe", icon: GlobeSimple, points: ["uk", "eu"], image: europe, skills: ["Semiconductors", "Automotive", "Green Technology", "Life Sciences"] },
  { id: "me", label: "Middle East", icon: GlobeHemisphereEast, points: ["me"], image: middleeast, skills: ["Infrastructure", "Energy", "Healthcare", "Finance"] },
  { id: "ap", label: "Asia Pacific", icon: GlobeHemisphereEast, points: ["sg"], image: asiapacific, skills: ["Semiconductors", "Fintech", "Logistics", "Digital Services"] },
  { id: "au", label: "Australia", icon: MapPin, points: ["au"], image: australia, skills: ["Mining Technology", "Healthcare", "Education", "Agritech"] },
  { id: "jp", label: "Japan", icon: MapPin, points: ["jp"], image: japan, skills: ["Robotics", "Electronics", "Automotive", "Research"] },
  { id: "ot", label: "Others", icon: GlobeSimple, points: ["ca", "af"], image: others, skills: ["Cloud", "Aerospace", "Agritech", "Public Health"] },
];

const OPPS: { label: string; icon: Icon }[] = [
  { label: "Jobs", icon: Briefcase },
  { label: "Research", icon: Flask },
  { label: "Industry Partnerships", icon: Buildings },
  { label: "Academic Exchange", icon: GraduationCap },
];

function insetFor({ w }: Size): Inset {
  return w >= 640 ? { l: 50, r: 60, t: 50, b: 40 } : { l: 24, r: 30, t: 40, b: 30 };
}

function arcPath([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const bow = Math.min(110, len * 0.28);
  return `M${x1},${y1} Q${mx},${my - bow} ${x2},${y2}`;
}

export function OpportunityMap({ reduce }: { reduce: boolean }) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [selected, setSelected] = useState("us");
  const region = REGIONS.find((r) => r.id === selected)!;
  const view = useMemo(() => (size ? fitPoints([...POINTS.map((p) => p.at), HUB, [62, -130], [-42, 155]], size, insetFor(size)) : null), [size]);
  const hub = view && size ? toScreen(view, size, HUB) : null;
  const k = (size?.w ?? 1200) < 640 ? 0.07 : 0.11;

  return (
    <section id="where" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading
          eyebrow="Global opportunities"
          title="Where Are Opportunities Emerging?"
          sub="Explore global talent opportunities and connect with institutions and employers."
          reduce={reduce}
          align="left"
        />

        <motion.div
          className="mt-10 grid gap-5 lg:grid-cols-[200px_1fr_310px]"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {REGIONS.map((r) => {
              const on = r.id === selected;
              const I = r.icon;
              return (
                <li key={r.id} className="relative shrink-0">
                  {on ? (
                    <motion.span
                      layoutId="talent-region"
                      className="absolute inset-0 rounded-xl bg-(color:--gc-primary) shadow-[0_10px_24px_rgba(31,111,229,0.35)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(r.id)}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold whitespace-nowrap transition-colors",
                      on ? "text-white" : "text-(color:--gc-ink) hover:bg-[#f2f7ff]",
                    )}
                  >
                    <I size={18} weight="duotone" className={on ? "text-white" : "text-(color:--gc-primary)"} />
                    {r.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div ref={ref} className="relative h-[320px] overflow-hidden rounded-[24px] bg-[#eef4fb] ring-1 ring-(color:--gc-ink)/6 sm:h-[420px]">
            {view && size ? (
              <WorldTiles
                view={view}
                size={size}
                url={LIGHT_TILES}
                maxZoom={10}
                className="pointer-events-none absolute inset-0 overflow-hidden [filter:saturate(0.6)_hue-rotate(185deg)_brightness(1.02)] opacity-80"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_50%,transparent_45%,rgba(238,244,251,0.85)_100%)]" />

            {view && size && hub ? (
              <>
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
                  {POINTS.map((p) => {
                    const on = region.points.includes(p.id);
                    const d = arcPath(toScreen(view, size, p.at), hub);
                    return (
                      <g key={`${p.id}-${on}`}>
                        <motion.path
                          d={d}
                          fill="none"
                          stroke={on ? "#ea6c12" : "#1f6fe5"}
                          strokeOpacity={on ? 1 : 0.22}
                          strokeWidth={on ? 2.2 : 1.1}
                          strokeDasharray={on ? undefined : "3 5"}
                          initial={reduce || !on ? false : { pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                        {on && !reduce ? (
                          <circle r={3.2} fill="#ea6c12">
                            <animateMotion dur="2.2s" begin="0.8s" repeatCount="indefinite" path={d} />
                          </circle>
                        ) : null}
                      </g>
                    );
                  })}
                  {!reduce ? (
                    <motion.circle
                      cx={hub[0]}
                      cy={hub[1]}
                      fill="none"
                      stroke="#ea6c12"
                      strokeWidth={1.4}
                      initial={{ r: 8, opacity: 0.8 }}
                      animate={{ r: 38, opacity: 0 }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                    />
                  ) : null}
                  <g transform={`translate(${hub[0] - BENGALURU_POINT.x * k} ${hub[1] - BENGALURU_POINT.y * k}) scale(${k})`}>
                    {KARNATAKA_DISTRICTS.map((d) => (
                      <path key={d.name} d={d.d} fill="#f08a24" stroke="#fff" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                    ))}
                  </g>
                </svg>
                <span
                  className="pointer-events-none absolute -translate-x-1/2 rounded-md bg-(color:--gc-ink) px-2 py-0.5 font-display text-[11px] font-semibold text-(color:--gc-gold-4) shadow"
                  style={{ left: hub[0], top: hub[1] + 22 }}
                >
                  Karnataka
                </span>
                {POINTS.map((p) => {
                  const [x, y] = toScreen(view, size, p.at);
                  const on = region.points.includes(p.id);
                  if (!on && size.w < 640) return null;
                  return (
                    <motion.span
                      key={p.id}
                      className={cn(
                        "pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap shadow-[0_4px_12px_rgba(11,31,74,0.18)] sm:text-[11.5px]",
                        on ? "z-10 bg-[#ea6c12] text-white" : "bg-(color:--gc-ink) text-white",
                      )}
                      style={{ left: x, top: y - 6 }}
                      animate={{ scale: on ? 1.12 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      {p.label}
                    </motion.span>
                  );
                })}
                {POINTS.map((p) => {
                  const [x, y] = toScreen(view, size, p.at);
                  return <span key={`${p.id}-dot`} className="pointer-events-none absolute size-2 -translate-1/2 rounded-full bg-[#ffb938] ring-2 ring-white" style={{ left: x, top: y }} />;
                })}
              </>
            ) : null}
            <span className="absolute bottom-2 left-3 text-[9px] text-(color:--gc-body)/60">Base map: Esri</span>
          </div>

          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_20px_50px_rgba(11,31,74,0.14)] ring-1 ring-(color:--gc-ink)/6">
            <AnimatePresence mode="wait">
              <motion.div
                key={region.id}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex h-full flex-col"
              >
                <img src={region.image} alt={`${region.label} skyline`} className="aspect-[16/7] w-full object-cover" loading="lazy" />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="flex items-center gap-2 font-display text-[18px] font-bold text-(color:--gc-ink)">
                    <region.icon size={20} weight="duotone" className="text-(color:--gc-primary)" />
                    {region.label}
                  </h3>
                  <p className="mt-3 text-[12px] font-bold tracking-wide text-(color:--gc-body) uppercase">High-demand skills</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {region.skills.map((s, i) => (
                      <motion.span
                        key={s}
                        className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11.5px] font-semibold text-(color:--gc-primary-deep)"
                        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                  <p className="mt-4 text-[12px] font-bold tracking-wide text-(color:--gc-body) uppercase">Opportunities</p>
                  <ul className="mt-2 space-y-1.5">
                    {OPPS.map(({ label, icon: I }) => (
                      <li key={label} className="flex items-center gap-2 text-[13px] text-(color:--gc-ink)">
                        <I size={16} weight="duotone" className="text-[#16a05a]" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#looking"
                    className="group mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-(color:--gc-primary) px-5 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#1858c0]"
                  >
                    Explore Opportunities
                    <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
