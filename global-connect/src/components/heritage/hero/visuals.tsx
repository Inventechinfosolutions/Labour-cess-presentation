import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
  Buildings,
  ChartLineUp,
  Coins,
  Flask,
  GlobeHemisphereEast,
  GraduationCap,
  Handshake,
  Lightning,
  MapPin,
  RocketLaunch,
  ShieldCheck,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import connectHero from "@/assets/heritage/heroes/connect-hero.jpg";
import connectInset from "@/assets/heritage/heroes/connect-inset.jpg";
import discoverHero from "@/assets/heritage/heroes/discover-hero.jpg";
import investHero from "@/assets/heritage/heroes/invest-hero.jpg";
import investInset from "@/assets/heritage/heroes/invest-inset.jpg";
import partnerLeft from "@/assets/heritage/heroes/partner-left.jpg";
import partnerRight from "@/assets/heritage/heroes/partner-right.jpg";
import talentHero from "@/assets/heritage/heroes/talent-hero.jpg";
import talentInset from "@/assets/heritage/heroes/talent-inset.jpg";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";
import { EASE, useCycle } from "../motion";

/** Visuals are drawn on a 700×540 stage; children are placed in stage units and scale with the column. */
const W = 700;
const H = 540;

function box(x: number, y: number, w?: number, h?: number): CSSProperties {
  return {
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    ...(w !== undefined ? { width: `${(w / W) * 100}%` } : {}),
    ...(h !== undefined ? { height: `${(h / H) * 100}%` } : {}),
  };
}

function Stage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="img" aria-label={label} className="relative mx-auto aspect-[700/540] w-full max-w-[720px]">
      {children}
    </div>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
      {children}
    </svg>
  );
}

function KenBurns({ src, reduce, className }: { src: string; reduce: boolean; className?: string }) {
  return (
    <motion.img
      src={src}
      alt=""
      className={cn("size-full object-cover", className)}
      animate={reduce ? undefined : { scale: [1.03, 1.13, 1.03], x: ["0%", "-2.5%", "0%"] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Stamp({ icon: StampIcon, size = 46, active = false }: { icon: Icon; size?: number; active?: boolean }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full shadow-[0_8px_20px_rgba(12,58,42,0.15)] ring-1 ring-(color:--gc-gold-3)/60 transition-all duration-500",
        active
          ? "scale-115 bg-(color:--gc-navy) text-(color:--gc-gold) shadow-[0_0_0_7px_rgba(212,165,55,0.2),0_12px_26px_rgba(12,58,42,0.3)]"
          : "bg-white text-(color:--gc-gold-4)",
      )}
      style={{ width: size, height: size }}
    >
      <StampIcon size={size * 0.46} weight="duotone" />
    </span>
  );
}

const pop = (reduce: boolean, delay: number) => ({
  initial: reduce ? false : ({ opacity: 0, scale: 0.7 } as const),
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.55, delay, ease: EASE },
});

/* ───────────────────────── Invest: palace-arch window with benefit stamps ───────────────────────── */

const INVEST_PATH = "M460,40 C660,120 660,400 460,500";
const INVEST_STAMPS: { at: [number, number]; icon: Icon; label: [string, string] }[] = [
  { at: [537, 88], icon: MapPin, label: ["Strategic", "location"] },
  { at: [601, 197], icon: UsersThree, label: ["Skilled", "talent pool"] },
  { at: [601, 329], icon: ShieldCheck, label: ["Progressive", "policies"] },
  { at: [537, 444], icon: Handshake, label: ["Dedicated", "investor support"] },
];

export function InvestVisual({ reduce }: { reduce: boolean }) {
  const active = useCycle(INVEST_STAMPS.length, 1500, !reduce);
  return (
    <Stage label="Heritage building before Bengaluru towers, framed in a palace arch, with the four reasons to invest">
      <motion.div
        className="absolute overflow-hidden rounded-t-full rounded-b-[28px] shadow-[0_30px_60px_rgba(12,58,42,0.25)] ring-[6px] ring-white"
        style={box(110, 14, 330, 486)}
        initial={reduce ? false : { clipPath: "inset(100% 0 0 0 round 0)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0 0 0 round 0)", opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
      >
        <KenBurns src={investHero} reduce={reduce} />
        <span aria-hidden className="absolute inset-[10px] rounded-t-full rounded-b-[20px] border border-white/70" />
      </motion.div>

      <motion.div
        className="absolute flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_16px_36px_rgba(12,58,42,0.16)] ring-1 ring-(color:--gc-line) backdrop-blur"
        style={box(-10, 64)}
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
      >
        <Stamp icon={Coins} size={40} />
        <span className="leading-tight">
          <span className="block font-display text-[22px] font-bold whitespace-nowrap text-(color:--gc-ink)">
            ₹25<span className="ml-1 text-[13px]">lakh crore</span>+
          </span>
          <span className="block text-[11.5px] text-(color:--gc-body)">GSDP, among India's leaders</span>
        </span>
      </motion.div>

      <motion.div className="absolute aspect-square" style={box(0, 336, 160)} {...pop(reduce, 1.1)}>
        <img src={investInset} alt="" className="size-full rounded-full object-cover shadow-[0_14px_30px_rgba(12,58,42,0.25)] ring-4 ring-white" />
        <span aria-hidden className="absolute -inset-2 rounded-full border border-dashed border-(color:--gc-gold-3)/70" />
      </motion.div>

      <Overlay>
        <motion.path
          d={INVEST_PATH}
          fill="none"
          stroke="var(--gc-gold-3)"
          strokeWidth={1.6}
          strokeDasharray="4 6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />
        {!reduce ? (
          <circle r={4} fill="var(--gc-gold-4)">
            <animateMotion dur="5s" begin="1.6s" repeatCount="indefinite" path={INVEST_PATH} />
          </circle>
        ) : null}
      </Overlay>

      {INVEST_STAMPS.map(({ at, icon, label }, i) => (
        <motion.div
          key={label[0]}
          className="absolute flex -translate-x-[23px] -translate-y-1/2 items-center gap-2.5"
          style={box(at[0], at[1])}
          {...pop(reduce, 1.2 + i * 0.15)}
        >
          <Stamp icon={icon} active={i === active} />
          <span className="hidden text-[12.5px] leading-tight font-semibold text-(color:--gc-ink) sm:block">
            {label[0]}
            <br />
            <span className="font-normal text-(color:--gc-body)">{label[1]}</span>
          </span>
        </motion.div>
      ))}
    </Stage>
  );
}

/* ───────────────────────── Kannadigas: circle of belonging with world-city pins ───────────────────────── */

const C = { x: 350, y: 262 };
const ORBIT = 250;
const CITIES: { name: string; deg: number }[] = [
  { name: "USA", deg: 190 },
  { name: "UK", deg: 228 },
  { name: "Germany", deg: 262 },
  { name: "UAE", deg: 300 },
  { name: "Singapore", deg: 345 },
  { name: "Australia", deg: 25 },
];
const onOrbit = (deg: number, r = ORBIT): [number, number] => [
  C.x + r * Math.cos((deg * Math.PI) / 180),
  C.y + r * Math.sin((deg * Math.PI) / 180),
];

export function ConnectVisual({ reduce }: { reduce: boolean }) {
  const active = useCycle(CITIES.length, 1400, !reduce);
  return (
    <Stage label="Kannadiga families celebrating together, ringed by cities where Kannadigas live">
      <Overlay>
        <circle cx={C.x} cy={C.y} r={205} fill="none" stroke="var(--gc-gold-3)" strokeOpacity={0.35} />
        <motion.circle
          cx={C.x}
          cy={C.y}
          r={ORBIT}
          fill="none"
          stroke="var(--gc-gold-3)"
          strokeWidth={1.4}
          strokeDasharray="3 9"
          style={{ transformOrigin: `${C.x}px ${C.y}px` }}
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, rotate: 360 }}
          transition={{ opacity: { duration: 0.8, delay: 0.6 }, rotate: { duration: 140, repeat: Infinity, ease: "linear" } }}
        />
        {!reduce
          ? CITIES.map((c, i) => {
              const [x1, y1] = onOrbit(c.deg);
              const [x2, y2] = onOrbit(c.deg, 196);
              return (
                <motion.circle
                  key={c.name}
                  r={3.5}
                  fill="var(--gc-gold-4)"
                  initial={{ cx: x1, cy: y1, opacity: 0 }}
                  animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.2, delay: 1.6 + i * 0.45, repeat: Infinity, repeatDelay: 1.4, ease: "easeIn" }}
                />
              );
            })
          : null}
      </Overlay>

      <motion.div
        className="absolute aspect-square overflow-hidden rounded-full shadow-[0_30px_60px_rgba(12,58,42,0.28)] ring-[6px] ring-white"
        style={box(C.x - 190, C.y - 190, 380)}
        initial={reduce ? false : { opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE }}
      >
        <KenBurns src={connectHero} reduce={reduce} />
      </motion.div>

      {CITIES.map((c, i) => {
        const [x, y] = onOrbit(c.deg);
        return (
          <motion.span
            key={c.name}
            className={cn(
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap shadow-[0_8px_20px_rgba(12,58,42,0.16)] ring-1 ring-(color:--gc-gold-3)/50 transition-colors duration-500",
              i === active ? "bg-(color:--gc-navy) text-white" : "bg-white text-(color:--gc-ink)",
            )}
            style={box(x, y)}
            {...pop(reduce, 0.9 + i * 0.12)}
          >
            <MapPin size={13} weight="fill" className="text-(color:--gc-gold-4)" />
            {c.name}
          </motion.span>
        );
      })}

      <motion.div className="absolute hidden flex-col items-center gap-2 sm:flex" style={box(10, 372, 150)} {...pop(reduce, 1.5)}>
        <img src={connectInset} alt="" className="aspect-square w-full rounded-full object-cover shadow-[0_14px_30px_rgba(12,58,42,0.25)] ring-4 ring-white" />
        <span className="text-center text-[11.5px] leading-tight font-semibold text-(color:--gc-ink-2)">Kannada associations worldwide</span>
      </motion.div>

      <motion.span
        className="absolute flex -translate-x-1/2 items-center gap-2 rounded-full bg-(color:--gc-navy) px-4 py-2 text-[12px] font-bold tracking-[0.16em] text-white shadow-[0_12px_28px_rgba(12,58,42,0.35)] ring-2 ring-(color:--gc-gold-3)/70"
        style={box(C.x, 488)}
        {...pop(reduce, 1.3)}
      >
        <svg viewBox="0 0 300 473" className="h-4 w-auto" aria-hidden>
          {KARNATAKA_DISTRICTS.map((d) => (
            <path key={d.name} d={d.d} fill="var(--gc-gold-3)" stroke="var(--gc-gold-3)" strokeWidth={6} />
          ))}
        </svg>
        KARNATAKA · HOME
      </motion.span>
    </Stage>
  );
}

/* ───────────────────────── Talent: campus photo with a four-step career ladder ───────────────────────── */

const LADDER: { icon: Icon; title: string; text: string }[] = [
  { icon: GraduationCap, title: "Learn", text: "Study at Karnataka's institutions" },
  { icon: Lightning, title: "Skill", text: "Build in-demand expertise" },
  { icon: UsersThree, title: "Connect", text: "Meet employers worldwide" },
  { icon: GlobeHemisphereEast, title: "Global role", text: "Grow your career anywhere" },
];
const LADDER_X = 525;
const LADDER_Y = [70, 190, 310, 430];

export function TalentVisual({ reduce }: { reduce: boolean }) {
  const active = useCycle(LADDER.length, 1300, !reduce);
  return (
    <Stage label="Students in a heritage campus corridor, with the path from learning to a global role">
      <motion.span
        aria-hidden
        className="absolute rounded-[30px] border-2 border-(color:--gc-gold-3)/70"
        style={box(168, 30, 330, 470)}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      />
      <motion.div
        className="absolute overflow-hidden rounded-[30px] shadow-[0_30px_60px_rgba(12,58,42,0.25)]"
        style={box(150, 10, 330, 470)}
        initial={reduce ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: EASE }}
      >
        <KenBurns src={talentHero} reduce={reduce} />
      </motion.div>
      <motion.div
        className="absolute overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(12,58,42,0.28)] ring-4 ring-white"
        style={box(10, 346, 230, 170)}
        initial={reduce ? false : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
      >
        <img src={talentInset} alt="" className="size-full object-cover" />
      </motion.div>

      <Overlay>
        <line x1={LADDER_X} y1={LADDER_Y[0]} x2={LADDER_X} y2={LADDER_Y[3]} stroke="var(--gc-line)" strokeWidth={3} strokeLinecap="round" />
        <motion.line
          x1={LADDER_X}
          y1={LADDER_Y[0]}
          x2={LADDER_X}
          y2={LADDER_Y[3]}
          stroke="var(--gc-gold-3)"
          strokeWidth={3}
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1, ease: "easeInOut" }}
        />
        {!reduce ? (
          <motion.circle
            cx={LADDER_X}
            r={5}
            fill="var(--gc-gold-4)"
            initial={{ cy: LADDER_Y[0], opacity: 0 }}
            animate={{ cy: [LADDER_Y[0], LADDER_Y[3]], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.2, delay: 2.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
          />
        ) : null}
      </Overlay>

      {LADDER.map(({ icon, title, text }, i) => (
        <motion.div
          key={title}
          className="absolute flex -translate-x-[23px] -translate-y-1/2 items-center gap-3"
          style={box(LADDER_X, LADDER_Y[i])}
          {...pop(reduce, 1 + i * 0.4)}
        >
          <Stamp icon={icon} active={i === active} />
          <span className="hidden leading-tight sm:block">
            <span className="block text-[10.5px] font-bold tracking-[0.18em] text-(color:--gc-gold-4)">STEP {i + 1}</span>
            <span className="block font-display text-[16px] font-bold text-(color:--gc-ink)">{title}</span>
            <span className="block max-w-[140px] text-[12px] text-(color:--gc-body)">{text}</span>
          </span>
        </motion.div>
      ))}
    </Stage>
  );
}

/* ───────────────────────── Partnerships: two photos joined by a gold bridge ───────────────────────── */

const BRIDGE = "M185,118 Q350,-34 515,118";
const PARTNER_TYPES: { icon: Icon; label: string }[] = [
  { icon: Buildings, label: "Industry" },
  { icon: GraduationCap, label: "Universities" },
  { icon: Flask, label: "Research" },
  { icon: ShieldCheck, label: "Government" },
  { icon: RocketLaunch, label: "Startups" },
];

export function PartnerVisual({ reduce }: { reduce: boolean }) {
  const active = useCycle(PARTNER_TYPES.length, 1400, !reduce);
  const side = (src: string, x: number, rotate: number, tag: string, delay: number) => (
    <motion.figure
      className="absolute overflow-hidden rounded-[26px] shadow-[0_26px_50px_rgba(12,58,42,0.25)] ring-[5px] ring-white"
      style={box(x, 118, 270, 360)}
      initial={reduce ? false : { opacity: 0, y: 30, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      <KenBurns src={src} reduce={reduce} />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(6,36,25,0.85)] to-transparent px-4 pt-10 pb-3 text-[11.5px] font-bold tracking-[0.2em] text-(color:--gc-gold)">
        {tag}
      </figcaption>
    </motion.figure>
  );

  return (
    <Stage label="A Karnataka partnership signing and an international research team, joined by a gold bridge">
      {side(partnerLeft, 50, -3, "KARNATAKA", 0.15)}
      {side(partnerRight, 380, 3, "THE WORLD", 0.3)}

      <Overlay>
        <motion.path
          d={BRIDGE}
          fill="none"
          stroke="var(--gc-gold-3)"
          strokeWidth={2}
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 0.9, ease: EASE }}
        />
        {!reduce ? (
          <path d={BRIDGE} fill="none" stroke="var(--gc-gold-4)" strokeWidth={3} strokeDasharray="2 16" strokeLinecap="round" className="animate-[dash-flow_1.2s_linear_infinite]" />
        ) : null}
        <circle cx={185} cy={118} r={5} fill="var(--gc-gold-3)" />
        <circle cx={515} cy={118} r={5} fill="var(--gc-gold-3)" />
      </Overlay>

      <motion.span
        className="absolute grid aspect-square -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(color:--gc-navy) text-(color:--gc-gold) shadow-[0_14px_30px_rgba(12,58,42,0.35)] ring-4 ring-(color:--gc-gold-3)/70"
        style={box(350, 42, 74)}
        {...pop(reduce, 1.6)}
      >
        <Handshake size={34} weight="duotone" />
        {!reduce ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-(color:--gc-gold-3)"
            animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 2 }}
          />
        ) : null}
      </motion.span>

      <ul className="absolute inset-x-0 hidden justify-center gap-2 sm:flex" style={{ top: `${(498 / H) * 100}%` }}>
        {PARTNER_TYPES.map(({ icon: TypeIcon, label }, i) => (
          <motion.li
            key={label}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-[0_6px_16px_rgba(12,58,42,0.12)] ring-1 ring-(color:--gc-gold-3)/50 transition-colors duration-500",
              i === active ? "bg-(color:--gc-navy) text-white" : "bg-white text-(color:--gc-ink)",
            )}
            {...pop(reduce, 1.8 + i * 0.1)}
          >
            <TypeIcon size={14} weight="duotone" className="text-(color:--gc-gold-4)" />
            {label}
          </motion.li>
        ))}
      </ul>
    </Stage>
  );
}

/* ───────────────────────── Opportunities: coastal panorama with opportunity pins ───────────────────────── */

const PHOTO_PINS: { x: number; y: number; label: string; icon: Icon }[] = [
  { x: 16, y: 50, label: "Ports & logistics", icon: Buildings },
  { x: 52, y: 47, label: "Infrastructure", icon: ChartLineUp },
  { x: 62, y: 78, label: "Agri & food processing", icon: Lightning },
  { x: 82, y: 26, label: "Eco-tourism", icon: GlobeHemisphereEast },
];
const MAP_DOTS: [number, number][] = [
  [234, 378],
  [166, 426],
  [52, 385],
  [74, 212],
  [40, 140],
  [200, 85],
];

export function DiscoverVisual({ reduce }: { reduce: boolean }) {
  const active = useCycle(PHOTO_PINS.length, 1500, !reduce);
  return (
    <Stage label="Coastal Karnataka with its port, rivers and Western Ghats, marked with opportunity areas">
      <motion.div
        className="absolute overflow-hidden rounded-[30px] shadow-[0_30px_60px_rgba(12,58,42,0.25)] ring-[6px] ring-white"
        style={box(30, 20, 670, 430)}
        initial={reduce ? false : { opacity: 0, clipPath: "inset(0 100% 0 0 round 30px)" }}
        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0 round 30px)" }}
        transition={{ duration: 1.2, delay: 0.15, ease: EASE }}
      >
        <KenBurns src={discoverHero} reduce={reduce} />
        {PHOTO_PINS.map(({ x, y, label, icon: PinIcon }, i) => (
          <motion.span
            key={label}
            className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%` }}
            {...pop(reduce, 1.2 + i * 0.25)}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-500",
                i === active ? "-translate-y-1.5 bg-(color:--gc-navy) text-white" : "bg-white/95 text-(color:--gc-ink)",
              )}
            >
              <PinIcon size={14} weight="duotone" className="text-(color:--gc-gold-4)" />
              <span className="hidden sm:inline">{label}</span>
            </span>
            <span className="h-4 w-px bg-white" />
            <span className="relative size-2.5 rounded-full bg-(color:--gc-gold-3) ring-2 ring-white">
              {!reduce ? (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-(color:--gc-gold-3)"
                  animate={{ scale: [1, 3], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.6 + i * 0.25 }}
                />
              ) : null}
            </span>
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        className="absolute flex items-center gap-3 rounded-2xl bg-white/95 p-3 pr-5 shadow-[0_18px_40px_rgba(12,58,42,0.2)] ring-1 ring-(color:--gc-line) backdrop-blur"
        style={box(0, 392)}
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1, ease: EASE }}
      >
        <svg viewBox="0 0 300 473" className="h-[86px] w-auto" aria-hidden>
          {KARNATAKA_DISTRICTS.map((d) => (
            <path key={d.name} d={d.d} fill="var(--gc-primary-soft)" stroke="var(--gc-gold-3)" strokeWidth={1.5} />
          ))}
          {MAP_DOTS.map(([x, y], i) => (
            <motion.circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={13}
              fill="var(--gc-gold-4)"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 1.3 + i * 0.12, ease: EASE }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          ))}
        </svg>
        <span className="leading-tight">
          <span className="block font-display text-[16px] font-bold text-(color:--gc-ink)">Every region</span>
          <span className="block max-w-[130px] text-[12px] text-(color:--gc-body)">Opportunities across all of Karnataka</span>
        </span>
      </motion.div>
    </Stage>
  );
}
