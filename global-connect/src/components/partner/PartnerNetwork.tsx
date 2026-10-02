import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Buildings, Factory, Flask, GraduationCap, Lightbulb, RocketLaunch, Cpu, type Icon } from "@phosphor-icons/react";
import { useElementSize } from "@/hooks/useElementSize";
import { GLOBE_DOTS } from "@/lib/globeDots";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import { EASE } from "@/components/connect/shared";

const KA_LON = 76.4;
const KA_LAT = 14.8;

type Node = { label: string; icon: Icon; at: [number, number] };

/** Positions are unit offsets from the hub, scaled by the network radius. */
const NODES: Node[] = [
  { label: "Universities", icon: GraduationCap, at: [-0.82, -0.78] },
  { label: "Industry", icon: Factory, at: [0.06, -1.08] },
  { label: "Research", icon: Flask, at: [0.9, -0.72] },
  { label: "Government", icon: Buildings, at: [-1.1, -0.06] },
  { label: "Startups", icon: RocketLaunch, at: [1.1, 0.0] },
  { label: "Innovation", icon: Lightbulb, at: [-0.86, 0.68] },
  { label: "Technology", icon: Cpu, at: [0.88, 0.7] },
];

export function PartnerNetwork({ reduce }: { reduce: boolean }) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const desktop = (size?.w ?? 0) >= 1024;
  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const hub = desktop ? { x: w * 0.65, y: h * 0.43 } : { x: w * 0.5, y: h * 0.81 };
  const rx = desktop ? Math.min(w * 0.16, 260) : w * 0.4;
  const ry = desktop ? Math.min(h * 0.28, 230) : 85;
  const nodeAt = (n: Node) => ({
    x: Math.min(w - 66, Math.max(66, hub.x + n.at[0] * rx)),
    y: hub.y + n.at[1] * ry,
  });
  const deg = desktop ? w / 80 : w / 34;
  const kaH = desktop ? Math.min(h * 0.3, 250) : 120;
  const kaScale = kaH / 473;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    const dot = Math.max(1, deg * 0.16);
    const reach = Math.hypot(size.w, size.h);
    for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
      const x = hub.x + (GLOBE_DOTS[i] - KA_LON) * deg;
      const y = hub.y - (GLOBE_DOTS[i + 1] - KA_LAT) * deg;
      if (x < -4 || y < -4 || x > size.w + 4 || y > size.h + 4) continue;
      const d = Math.hypot(x - hub.x, y - hub.y) / reach;
      ctx.globalAlpha = Math.max(0.12, 0.75 - d * 1.4);
      ctx.fillStyle = d < 0.12 ? "#ffd77a" : "#8f9bff";
      ctx.beginPath();
      ctx.arc(x, y, dot, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [size, deg, hub.x, hub.y]);

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
      {size ? (
        <>
          <div
            className="absolute rounded-full bg-[radial-gradient(circle,rgba(255,201,77,0.32),rgba(138,63,214,0.12)_45%,transparent_70%)]"
            style={{ left: hub.x - kaH, top: hub.y - kaH, width: kaH * 2, height: kaH * 2 }}
          />
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            {[1, 1.55].map((k, i) => (
              <motion.ellipse
                key={k}
                cx={hub.x}
                cy={hub.y}
                rx={rx * k * 0.62}
                ry={ry * k * 0.62}
                fill="none"
                stroke="#8f9bff"
                strokeOpacity={0.22}
                strokeDasharray="3 7"
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: EASE }}
              />
            ))}
            {NODES.map((n, i) => {
              const { x, y } = nodeAt(n);
              const mx = (x + hub.x) / 2 + (y - hub.y) * 0.18;
              const my = (y + hub.y) / 2 - (x - hub.x) * 0.18;
              const d = `M${x} ${y} Q${mx} ${my} ${hub.x} ${hub.y}`;
              return (
                <g key={n.label}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="url(#pn-line)"
                    strokeWidth={1.6}
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.9 + i * 0.12, ease: EASE }}
                  />
                  {!reduce ? (
                    <circle r={3} fill="#fff1c4" style={{ filter: "drop-shadow(0 0 6px #ffd77a)" }}>
                      <animateMotion dur={`${2.4 + (i % 3) * 0.4}s`} begin={`${2 + i * 0.25}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  ) : null}
                </g>
              );
            })}
            <defs>
              <linearGradient id="pn-line" x1="0" x2="1">
                <stop offset="0" stopColor="#8f9bff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#ffd77a" />
              </linearGradient>
            </defs>
          </svg>

          <motion.svg
            viewBox={KARNATAKA_VIEWBOX}
            className="absolute drop-shadow-[0_0_24px_rgba(255,200,90,0.55)]"
            style={{
              left: hub.x - BENGALURU_POINT.x * kaScale,
              top: hub.y - BENGALURU_POINT.y * kaScale,
              width: 300 * kaScale,
              height: kaH,
            }}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: EASE }}
          >
            <defs>
              <linearGradient id="pn-ka" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe08a" />
                <stop offset="1" stopColor="#f0a71f" />
              </linearGradient>
            </defs>
            {KARNATAKA_DISTRICTS.map((d) => (
              <path key={d.name} d={d.d} fill="url(#pn-ka)" stroke="#fff3c9" strokeOpacity={0.55} strokeWidth={0.8} />
            ))}
          </motion.svg>

          <span className="absolute size-3" style={{ left: hub.x - 6, top: hub.y - 6 }}>
            {!reduce ? <span className="absolute inset-0 animate-ping rounded-full bg-white/80" /> : null}
            <span className="absolute inset-0 rounded-full bg-white shadow-[0_0_12px_#ffd77a]" />
          </span>

          <motion.div
            className="absolute -translate-x-1/2 text-center"
            style={{ left: hub.x + (desktop ? 70 : 0), top: hub.y + (473 - BENGALURU_POINT.y) * kaScale + 10 }}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6, ease: EASE }}
          >
            <p className="font-display text-[13px] font-bold tracking-[0.3em] text-white lg:text-[15px]">KARNATAKA</p>
            <p className="mt-0.5 hidden text-[11.5px] font-semibold tracking-[0.12em] text-(color:--gc-gold) uppercase lg:block">
              A Global Partner in Progress
            </p>
          </motion.div>

          {NODES.map((n, i) => {
            const Icon = n.icon;
            return (
              <motion.span
                key={n.label}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-[color:var(--gc-hl,#8f9bff)]/40 bg-[color:var(--gc-hero-2,#120f45)]/85 px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm lg:gap-2 lg:px-3.5 lg:py-1.5 lg:text-[13px]"
                style={{ left: nodeAt(n).x, top: nodeAt(n).y }}
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.12, ease: EASE }}
              >
                <Icon weight="duotone" className="size-3.5 text-(color:--gc-gold) lg:size-4" />
                {n.label}
              </motion.span>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
