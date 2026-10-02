import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";

/** All points are in the 1600×900 pixel space of the background image. */
const W = 1600;
const H = 900;

type Point = [number, number];
export type ImageMapSource = { label: string; at: Point; side: "left" | "right" | "above" | "below" };

function arc([x1, y1]: Point, [x2, y2]: Point) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const bow = Math.min(220, len * 0.35);
  return `M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 - bow} ${x2},${y2}`;
}

const CHIP_OFFSET: Record<ImageMapSource["side"], string> = {
  above: "-translate-x-1/2 -translate-y-[calc(100%+10px)]",
  below: "-translate-x-1/2 translate-y-[10px]",
  left: "-translate-x-[calc(100%+10px)] -translate-y-1/2",
  right: "translate-x-[10px] -translate-y-1/2",
};

const pct = ([x, y]: Point) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

const EDGE_FADE =
  "linear-gradient(to right, transparent, #000 14%, #000 88%, transparent), linear-gradient(to bottom, transparent, #000 16%, #000 82%, transparent)";
const PANEL_MASK = {
  maskImage: EDGE_FADE,
  WebkitMaskImage: EDGE_FADE,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

/** A generated map image with animated arcs from world regions into Karnataka, drawn in the image's own coordinates. */
export function ImageHeroMap({
  reduce,
  image,
  hub,
  sources,
  caption,
  captionAlign = "center",
  scale = 0.27,
  chipClassName = "border-(color:--gc-accent-3)/40 bg-[#061a4d]/85",
  className = "lg:top-[78px] lg:bottom-auto lg:left-[36%] lg:w-[min(64%,1000px)]",
}: {
  reduce: boolean;
  image: string;
  hub: Point;
  sources: ImageMapSource[];
  caption: { title: string; sub: ReactNode };
  /** `left` right-aligns the caption so it ends just past the hub, keeping the area east of Karnataka clear. */
  captionAlign?: "center" | "left";
  scale?: number;
  chipClassName?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const ref = (n: string) => `${uid}-${n}`;

  return (
    <div className={cn("absolute inset-x-0 bottom-[70px] aspect-[16/9]", className)}>
      <motion.img
        src={image}
        alt=""
        className="absolute inset-0 gc-tint-photo h-full w-full object-cover"
        style={PANEL_MASK}
        initial={reduce ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={ref("arc")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffd77a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffe9b0" />
          </linearGradient>
          <radialGradient id={ref("glow")}>
            <stop offset="0" stopColor="#ffd56a" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#ffb938" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ffb938" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={ref("ka")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="1" stopColor="#f5a524" />
          </linearGradient>
          <filter id={ref("soft")} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={hub[0]} cy={hub[1] - 30} r={170} fill={`url(#${ref("glow")})`} />

        {sources.map((s, i) => {
          const d = arc(s.at, hub);
          return (
            <g key={s.label}>
              <path d={d} fill="none" stroke="#ffcf6b" strokeOpacity={0.15} strokeWidth={8} />
              <motion.path
                d={d}
                fill="none"
                stroke={`url(#${ref("arc")})`}
                strokeWidth={2.6}
                strokeLinecap="round"
                filter={`url(#${ref("soft")})`}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.7 + i * 0.18, ease: [0.4, 0, 0.2, 1] }}
              />
              <circle cx={s.at[0]} cy={s.at[1]} r={14} fill="#ffc94d" opacity={0.2} />
              <circle cx={s.at[0]} cy={s.at[1]} r={6} fill="#fff1c4" filter={`url(#${ref("soft")})`} />
              {!reduce ? (
                <circle r={5} fill="#fff4d1" filter={`url(#${ref("soft")})`}>
                  <animateMotion dur={`${3 + (i % 3) * 0.5}s`} begin={`${2.2 + i * 0.3}s`} repeatCount="indefinite" path={d} />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.1;0.85;1"
                    dur={`${3 + (i % 3) * 0.5}s`}
                    begin={`${2.2 + i * 0.3}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
            </g>
          );
        })}

        {!reduce
          ? [0, 1].map((n) => (
              <motion.circle
                key={n}
                cx={hub[0]}
                cy={hub[1]}
                fill="none"
                stroke="#ffd56a"
                strokeWidth={2}
                initial={{ r: 10, opacity: 0.7 }}
                animate={{ r: 130, opacity: 0 }}
                transition={{ duration: 3, delay: 1.8 + n * 1.5, repeat: Infinity, ease: "easeOut" }}
              />
            ))
          : null}

        <motion.g
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${hub[0]}px ${hub[1]}px` }}
        >
          <g
            transform={`translate(${hub[0] - BENGALURU_POINT.x * scale} ${hub[1] - BENGALURU_POINT.y * scale}) scale(${scale})`}
            filter={`url(#${ref("soft")})`}
          >
            {KARNATAKA_DISTRICTS.map((d) => (
              <path
                key={d.name}
                d={d.d}
                fill={`url(#${ref("ka")})`}
                stroke="#fff3c8"
                strokeOpacity={0.6}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <circle cx={hub[0]} cy={hub[1]} r={6} fill="#fff" filter={`url(#${ref("soft")})`} />
        </motion.g>
      </svg>

      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {sources.map((s, i) => (
          <motion.span
            key={s.label}
            className="absolute"
            style={pct(s.at)}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.5 + i * 0.18 }}
          >
            <span
              className={cn(
                "absolute block rounded-md border px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-white shadow-[0_6px_16px_rgba(0,0,0,0.35)] backdrop-blur",
                chipClassName,
                CHIP_OFFSET[s.side],
              )}
            >
              {s.label}
            </span>
          </motion.span>
        ))}
      </div>

      <motion.div
        className={cn("pointer-events-none absolute", captionAlign === "left" ? "-translate-x-full text-right" : "-translate-x-1/2 text-center")}
        style={{
          left: captionAlign === "left" ? `calc(${pct(hub).left} + 3%)` : pct(hub).left,
          top: `calc(${pct(hub).top} + 4.5%)`,
        }}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.7 }}
      >
        <p
          className="font-display text-[11px] font-bold tracking-[0.22em] text-white sm:text-[15px]"
          style={{ textShadow: "0 0 18px rgba(255,200,90,0.6)" }}
        >
          {caption.title}
        </p>
        <p className="text-[9.5px] font-semibold tracking-[0.12em] whitespace-nowrap text-(color:--gc-gold) uppercase sm:text-[12px]">{caption.sub}</p>
      </motion.div>
    </div>
  );
}
