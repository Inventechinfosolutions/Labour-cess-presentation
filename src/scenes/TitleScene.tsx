import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { KaMark } from "@/components/SlideKit";
import { Orb3D } from "@/components/Depth";
import { Buildings, ChartLineUp, ShieldCheck, UsersThree } from "@/lib/icons";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import splashSkyline from "@/assets/splash-skyline.jpg";

const PILLARS = [
  { label: "Registered workers", Icon: UsersThree, c: "#22c1d6" },
  { label: "Construction projects", Icon: Buildings, c: "#f0b429" },
  { label: "CESS compliance", Icon: ShieldCheck, c: "#34d399" },
  { label: "Worker welfare", Icon: ChartLineUp, c: "#60a5fa" },
];

const TITLE = ["Labour", "CESS", "Tracking", "&"];
const HIGHLIGHT = "Monitoring";

const STARS = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 55, s: 1 + r(3) * 2, d: r(4) * 4, t: 2.4 + r(5) * 2.6 };
});

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 7.137 + n * 31.71) * 24634.6345) % 1 + 1) % 1;
  return { x: 8 + r(1) * 84, d: r(2) * 6, t: 5 + r(3) * 4, s: 2 + r(4) * 2.5 };
});

const easeOut = [0.22, 1, 0.36, 1] as const;
const READY_AT = 4200;

export function TitleScene() {
  const reduce = !!useReducedMotion();
  const [ready, setReady] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setReady(true), READY_AT);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const from = <T extends object>(v: T) => (reduce ? false : v);

  return (
    <section className="relative grid h-full place-items-center overflow-hidden bg-[#050d2a] px-4 text-center text-white sm:px-8">
      <motion.img
        src={splashSkyline}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
        initial={from({ scale: 1.14, opacity: 0 })}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 9, ease: "easeOut", opacity: { duration: 1.4 } }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_38%,rgba(10,28,84,0.25)_0%,rgba(5,13,42,0.72)_70%,rgba(3,8,28,0.92)_100%)]"
      />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgba(3,8,28,0.85),rgba(3,8,28,0))]" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s }}
            initial={{ opacity: reduce ? 0.5 : 0 }}
            animate={reduce ? { opacity: 0.5 } : { opacity: [0.15, 0.9, 0.15] }}
            transition={reduce ? undefined : { duration: s.t, delay: s.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        {!reduce &&
          SPARKS.map((s, i) => (
            <motion.span
              key={i}
              className="absolute bottom-[18%] rounded-full bg-[#f6c65b] shadow-[0_0_8px_2px_rgba(246,198,91,0.55)]"
              style={{ left: `${s.x}%`, width: s.s, height: s.s }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, -260], opacity: [0, 0.9, 0] }}
              transition={{ duration: s.t, delay: 1.2 + s.d, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
      </div>

      <KarnatakaOutline reduce={reduce} />

      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.09),rgba(255,255,255,0))]"
          initial={{ x: "0%" }}
          animate={{ x: "480%" }}
          transition={{ duration: 1.8, delay: 1.9, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10 w-full max-w-4xl py-4">
        <Emblem reduce={reduce} />

        <motion.div
          className="mt-4 text-[10px] font-bold text-teal-bright uppercase sm:mt-5 sm:text-[11px]"
          initial={from({ opacity: 0, letterSpacing: "0.7em" })}
          animate={{ opacity: 1, letterSpacing: "0.2em" }}
          transition={{ delay: 0.9, duration: 1, ease: easeOut }}
        >
          Government of Karnataka
        </motion.div>
        <motion.div
          className="mx-auto mt-1 max-w-3xl text-[12px] font-semibold tracking-wide text-white/85 sm:text-sm"
          initial={from({ opacity: 0, y: 10 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: easeOut }}
        >
          Karnataka Building and Other Construction Workers Welfare Board
        </motion.div>

        <div className="mx-auto mt-3 mb-3 flex w-[min(520px,86%)] items-center gap-3 sm:mt-4 sm:mb-4">
          {[0, 1].map((side) => (
            <motion.span
              key={side}
              className={`relative h-px flex-1 ${side ? "order-3 origin-left bg-[linear-gradient(90deg,#f0c14a,transparent)]" : "origin-right bg-[linear-gradient(90deg,transparent,#f0c14a)]"}`}
              initial={from({ scaleX: 0 })}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.35, duration: 0.8, ease: easeOut }}
            >
              {!reduce && (
                <motion.span
                  className="absolute -top-[2px] size-[5px] rounded-full bg-white shadow-[0_0_10px_3px_rgba(240,193,74,0.8)]"
                  initial={{ left: side ? "0%" : "100%", opacity: 0 }}
                  animate={{ left: side ? ["0%", "100%"] : ["100%", "0%"], opacity: [0, 1, 0] }}
                  transition={{ delay: 2.2, duration: 1.4, repeat: Infinity, repeatDelay: 4, ease: "easeOut" }}
                />
              )}
            </motion.span>
          ))}
          <motion.span
            className="order-2 text-[10px] font-bold tracking-[0.22em] whitespace-nowrap text-gold uppercase sm:text-xs"
            initial={from({ opacity: 0, scale: 0.9 })}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            Labour Department · CESS
          </motion.span>
        </div>

        <h1 className="font-display text-[1.85rem] leading-[1.12] font-extrabold tracking-tight drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl">
          {TITLE.map((w, i) => (
            <motion.span
              key={w}
              className="mr-[0.25em] inline-block"
              initial={from({ opacity: 0, y: 36, filter: "blur(10px)" })}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 1.6 + i * 0.1, duration: 0.7, ease: easeOut }}
            >
              {w}
            </motion.span>
          ))}
          <br />
          <motion.span
            className="inline-block bg-[linear-gradient(100deg,#7ec8ff_0%,#7ec8ff_38%,#ffffff_50%,#7ec8ff_62%,#7ec8ff_100%)] bg-[length:250%_100%] bg-clip-text text-transparent"
            initial={from({ opacity: 0, scale: 0.86, filter: "blur(12px)", backgroundPosition: "100% 0%" })}
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, filter: "blur(0px)", backgroundPosition: ["100% 0%", "0% 0%"] }
            }
            transition={{
              delay: 2.05,
              duration: 0.8,
              ease: easeOut,
              backgroundPosition: { delay: 2.6, duration: 1.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut" },
            }}
          >
            {HIGHLIGHT}
          </motion.span>
        </h1>

        <motion.p
          className="mx-auto mt-3 max-w-xl text-[13px] text-white/75 sm:mt-4 sm:text-base"
          initial={from({ opacity: 0, y: 12 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.6, ease: easeOut }}
        >
          One Central Platform for projects, CESS demand, payment and remittance. It supports worker welfare in Karnataka.
        </motion.p>

        <div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-7 sm:gap-3">
          {PILLARS.map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] py-1 pr-3.5 pl-1 text-[11px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_20px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md sm:text-sm"
              initial={from({ opacity: 0, y: 18, scale: 0.8 })}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 2.8 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
            >
              <Orb3D c={item.c} Icon={item.Icon} className="size-6 sm:size-7" iconClassName="size-3.5 sm:size-4" />
              {item.label}
            </motion.div>
          ))}
        </div>

        <ReadyBar ready={ready} reduce={reduce} />
      </div>
    </section>
  );
}

function Emblem({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative mx-auto grid size-24 place-items-center sm:size-32"
      initial={reduce ? false : { opacity: 0, scale: 0.4, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: 0.2, duration: 0.9, ease: easeOut }}
    >
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute inset-[12%] rounded-full border border-[#f0c14a]/60"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 2.1], opacity: [0.6, 0] }}
            transition={{ delay: 1 + i * 0.7, duration: 2.1, repeat: Infinity, repeatDelay: 1.4, ease: "easeOut" }}
          />
        ))}
      <span aria-hidden className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(240,193,74,0.35),rgba(240,193,74,0)_70%)] blur-md" />
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
        <motion.circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="#f0c14a"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
        />
      </svg>
      <motion.svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute -inset-[9%] size-[118%]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={reduce ? undefined : { duration: 26, repeat: Infinity, ease: "linear" }}
      >
        <motion.circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#22c1d6"
          strokeOpacity="0.7"
          strokeWidth="0.8"
          strokeDasharray="2 5"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        />
        <circle cx="50" cy="2" r="1.6" fill="#22c1d6" />
        <circle cx="98" cy="50" r="1.2" fill="#f0c14a" />
      </motion.svg>
      <KaMark className="relative size-[76%] shadow-[0_0_0_4px_rgba(240,193,74,0.18),0_12px_30px_-6px_rgba(0,0,0,0.6)]" />
    </motion.div>
  );
}

function KarnatakaOutline({ reduce }: { reduce: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox={KARNATAKA_VIEWBOX}
      className="pointer-events-none absolute top-[8%] right-[3%] h-[74%] w-auto overflow-visible max-sm:hidden"
    >
      <defs>
        <linearGradient id="splash-ka" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ec8ff" />
          <stop offset="1" stopColor="#22c1d6" />
        </linearGradient>
        <radialGradient id="splash-pin-gloss" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g opacity="0.25">
        {KARNATAKA_DISTRICTS.map((d, i) => (
          <motion.path
            key={d.name}
            d={d.d}
            fill="rgba(126,200,255,0.05)"
            stroke="url(#splash-ka)"
            strokeWidth="0.7"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.6 + (i % 10) * 0.08, duration: 2.2, ease: "easeInOut" }}
          />
        ))}
      </g>

      {SITE_PINS.map((p, i) => (
        <motion.path
          key={`link-${p.name}`}
          d={`M${p.x} ${p.y} Q${(p.x + BENGALURU_POINT.x) / 2 + 18} ${(p.y + BENGALURU_POINT.y) / 2 - 18} ${BENGALURU_POINT.x} ${BENGALURU_POINT.y}`}
          fill="none"
          stroke={p.c}
          strokeOpacity="0.45"
          strokeWidth="0.9"
          strokeDasharray="2.5 3"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: PIN_AT + 0.9 + i * 0.08, duration: 1, ease: "easeInOut" }}
        />
      ))}
      {!reduce &&
        SITE_PINS.map((p, i) => (
          <circle key={`dot-${p.name}`} r="1.4" fill={p.c} opacity="0">
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.15;0.8;1"
              dur="2.6s"
              begin={`${PIN_AT + 2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
            <animateMotion
              dur="2.6s"
              begin={`${PIN_AT + 2 + i * 0.3}s`}
              repeatCount="indefinite"
              path={`M${p.x} ${p.y} Q${(p.x + BENGALURU_POINT.x) / 2 + 18} ${(p.y + BENGALURU_POINT.y) / 2 - 18} ${BENGALURU_POINT.x} ${BENGALURU_POINT.y}`}
            />
          </circle>
        ))}

      {SITE_PINS.map((p, i) => (
        <MapPinMark key={p.name} x={p.x} y={p.y} c={p.c} size={1} delay={PIN_AT + i * 0.09} reduce={reduce} />
      ))}
      <MapPinMark x={BENGALURU_POINT.x} y={BENGALURU_POINT.y} c="#f0c14a" size={1.6} delay={PIN_AT + 0.95} reduce={reduce} pulse />
      <motion.g
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: PIN_AT + 1.3, duration: 0.5 }}
      >
        <rect x={BENGALURU_POINT.x - 34} y={BENGALURU_POINT.y + 7} width="68" height="15" rx="7.5" fill="rgba(5,13,42,0.8)" stroke="#f0c14a" strokeOpacity="0.6" strokeWidth="0.6" />
        <text x={BENGALURU_POINT.x} y={BENGALURU_POINT.y + 17.5} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#f6d27a" letterSpacing="0.4">
          Bengaluru
        </text>
      </motion.g>
    </svg>
  );
}

const PIN_AT = 2.4;
const PIN_COLORS = ["#22c1d6", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];
const SITE_PINS = ["Belagavi", "Vijayapura", "Kalaburagi", "Dharwad", "Ballari", "Shivamogga", "Dakshina Kannada", "Tumakuru", "Mysuru"].map(
  (name, i) => ({ name, c: PIN_COLORS[i % PIN_COLORS.length], ...centroidOf(name) }),
);

function centroidOf(name: string) {
  const d = KARNATAKA_DISTRICTS.find((k) => k.name === name)?.d ?? "";
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i]);
    maxX = Math.max(maxX, nums[i]);
    minY = Math.min(minY, nums[i + 1]);
    maxY = Math.max(maxY, nums[i + 1]);
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

function MapPinMark({
  x,
  y,
  c,
  size,
  delay,
  reduce,
  pulse,
}: {
  x: number;
  y: number;
  c: string;
  size: number;
  delay: number;
  reduce: boolean;
  pulse?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.ellipse
        cx="0"
        cy="0"
        rx={4 * size}
        ry={1.4 * size}
        fill="rgba(0,0,0,0.55)"
        initial={reduce ? false : { opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.25, duration: 0.3 }}
      />
      {pulse && !reduce && (
        <motion.ellipse
          cx="0"
          cy="0"
          rx={4 * size}
          ry={1.6 * size}
          fill="none"
          stroke={c}
          strokeWidth="0.9"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0.9, 0], scale: [1, 3.4] }}
          transition={{ delay: delay + 0.5, duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.g
        initial={reduce ? false : { y: -34, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, type: "spring", stiffness: 420, damping: 15 }}
      >
        <g transform={`scale(${size})`}>
          <path
            d="M0 0 C-1.8 -4.6 -6 -7.6 -6 -12.2 A6 6 0 1 1 6 -12.2 C6 -7.6 1.8 -4.6 0 0 Z"
            fill={c}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="0.7"
            style={{ filter: `drop-shadow(0 0 3px ${c})` }}
          />
          <path d="M0 0 C-1.8 -4.6 -6 -7.6 -6 -12.2 A6 6 0 1 1 6 -12.2 C6 -7.6 1.8 -4.6 0 0 Z" fill="url(#splash-pin-gloss)" />
          <circle cx="0" cy="-12.2" r="2.4" fill="#fff" />
        </g>
      </motion.g>
    </g>
  );
}

function ReadyBar({ ready, reduce }: { ready: boolean; reduce: boolean }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 sm:mt-9">
      <div className="relative h-[3px] w-[min(260px,60%)] overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#22c1d6,#f0c14a)] shadow-[0_0_10px_rgba(34,193,214,0.8)]"
          initial={reduce ? false : { width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 1, duration: (READY_AT - 1000) / 1000, ease: "easeInOut" }}
        />
      </div>
      <div className="relative h-5 text-[11px] text-white/70 sm:text-sm">
        {ready ? (
          <motion.p
            key="ready"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0.55, 1], y: 0 }}
            transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            <span className="sm:hidden">Tap to begin</span>
            <span className="hidden sm:inline">
              Press <kbd className="mx-1 rounded border border-white/25 bg-white/5 px-1.5 py-0.5">Space</kbd> or click to begin ·{" "}
              <kbd className="mx-1 rounded border border-white/25 bg-white/5 px-1.5 py-0.5">F</kbd> fullscreen
            </span>
          </motion.p>
        ) : (
          <motion.p key="loading" className="tracking-[0.14em] uppercase" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1 }}>
            Preparing the Central Platform
          </motion.p>
        )}
      </div>
    </div>
  );
}
