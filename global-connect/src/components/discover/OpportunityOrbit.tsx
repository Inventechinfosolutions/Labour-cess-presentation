import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useElementSize } from "@/hooks/useElementSize";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import { EASE } from "@/components/connect/shared";
import { CATEGORIES } from "./data";

const SPEED = (Math.PI * 2) / 70000;
const KA_CENTER = { x: 150, y: 236 };

export function OpportunityOrbit({ reduce }: { reduce: boolean }) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const nodeRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const paused = useRef(false);

  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const desktop = w >= 1024;
  const c = desktop ? { x: w * 0.69, y: h * 0.47 } : { x: w * 0.5, y: h * 0.8 };
  const rx = desktop ? Math.min(w * 0.155, 250) : w * 0.42;
  const ry = desktop ? Math.min(h * 0.27, 230) : 88;
  const kaH = desktop ? Math.min(h * 0.42, 360) : 150;
  const kaScale = kaH / 473;

  useEffect(() => {
    if (!size) return;
    let angle = -Math.PI / 2;
    let raf = 0;
    let last = performance.now();
    const place = () => {
      CATEGORIES.forEach((_, i) => {
        const el = nodeRefs.current[i];
        if (!el) return;
        const a = angle + (i / CATEGORIES.length) * Math.PI * 2;
        const depth = (Math.sin(a) + 1) / 2;
        const x = c.x + rx * Math.cos(a);
        const y = c.y + ry * Math.sin(a);
        el.style.transform = `translate(${x}px, ${y}px) translate(-22px, -22px) scale(${0.78 + depth * 0.3})`;
        el.style.opacity = String(0.55 + depth * 0.45);
        el.style.zIndex = depth > 0.45 ? "20" : "5";
      });
    };
    place();
    if (reduce) return;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!paused.current) {
        angle += dt * SPEED;
        place();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size, reduce, c.x, c.y, rx, ry]);

  return (
    <div ref={ref} className="absolute inset-0">
      {size ? (
        <>
          <div
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,120,150,0.28),rgba(255,180,90,0.12)_45%,transparent_70%)]"
            style={{ left: c.x - kaH, top: c.y - kaH, width: kaH * 2, height: kaH * 2 }}
            aria-hidden
          />
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {[1, 0.62].map((k, i) => (
              <motion.ellipse
                key={k}
                cx={c.x}
                cy={c.y}
                rx={rx * k}
                ry={ry * k}
                fill="none"
                stroke={i ? "var(--gc-pink,#ff9fb4)" : "#ffd77a"}
                strokeOpacity={i ? 0.18 : 0.35}
                strokeWidth={i ? 1 : 1.4}
                strokeDasharray={i ? "2 6" : undefined}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.6, delay: 0.4 + i * 0.2, ease: EASE }}
              />
            ))}
          </svg>

          <motion.svg
            viewBox={KARNATAKA_VIEWBOX}
            className="pointer-events-none absolute z-10 drop-shadow-[0_0_26px_rgba(255,150,120,0.55)]"
            style={{ left: c.x - KA_CENTER.x * kaScale, top: c.y - KA_CENTER.y * kaScale, width: 300 * kaScale, height: kaH }}
            initial={reduce ? false : { opacity: 0, scale: 0.5, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
            aria-hidden
          >
            <defs>
              <linearGradient id="oo-ka" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0" stopColor="#ffe08a" />
                <stop offset="0.55" stopColor="var(--gc-orange,#ffb057)" />
                <stop offset="1" stopColor="var(--gc-pink-3,#ff6f91)" />
              </linearGradient>
            </defs>
            {KARNATAKA_DISTRICTS.map((d) => (
              <path key={d.name} d={d.d} fill="url(#oo-ka)" stroke="#fff4d6" strokeOpacity={0.6} strokeWidth={0.8} />
            ))}
            <circle cx={BENGALURU_POINT.x} cy={BENGALURU_POINT.y} r={5} fill="#fff" />
            {!reduce ? (
              <circle cx={BENGALURU_POINT.x} cy={BENGALURU_POINT.y} r={5} fill="none" stroke="#fff" strokeWidth={2}>
                <animate attributeName="r" values="5;22" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2.4s" repeatCount="indefinite" />
              </circle>
            ) : null}
          </motion.svg>

          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.a
                key={cat.id}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                href="#find"
                onMouseEnter={() => (paused.current = true)}
                onMouseLeave={() => (paused.current = false)}
                onFocus={() => (paused.current = true)}
                onBlur={() => (paused.current = false)}
                className="group absolute top-0 left-0 flex items-center gap-2 will-change-transform"
                initial={reduce ? false : { filter: "blur(8px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
              >
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full text-white ring-4 ring-white/15 transition-transform duration-300 group-hover:scale-115"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`, boxShadow: `0 0 22px ${cat.color}99` }}
                >
                  <Icon size={22} weight="duotone" />
                </span>
                <span
                  className="hidden max-w-[132px] rounded-lg bg-[#0b1236]/70 px-2 py-1 text-[12.5px] leading-tight font-semibold text-white backdrop-blur-sm lg:block"
                  style={{ boxShadow: `inset 0 0 0 1px ${cat.color}66` }}
                >
                  {cat.label}
                </span>
              </motion.a>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
