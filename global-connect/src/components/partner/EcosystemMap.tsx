import { useState } from "react";
import { motion } from "motion/react";
import bengaluru from "@/assets/invest/loc-bengaluru.jpg";
import hubballi from "@/assets/invest/loc-hubballi.jpg";
import mangaluru from "@/assets/invest/loc-mangaluru.jpg";
import mysuru from "@/assets/invest/loc-mysuru.jpg";
import belagavi from "@/assets/partner/city-belagavi.jpg";
import tumakuru from "@/assets/partner/city-tumakuru.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";

type City = {
  name: string;
  focus: string;
  image: string;
  color: string;
  /** City position inside the 300×473 Karnataka map. */
  at: [number, number];
  side: "left" | "right";
  /** Vertical slot of the photo, 0–1 of the stage height. */
  slot: number;
};

const CITIES: City[] = [
  { name: "Belagavi", focus: "Industrial Growth", image: belagavi, color: "#ea6c12", at: [40, 140], side: "left", slot: 0.1 },
  { name: "Hubballi-Dharwad", focus: "Manufacturing", image: hubballi, color: "#e0335c", at: [74, 212], side: "left", slot: 0.45 },
  { name: "Mangaluru", focus: "Logistics & Trade", image: mangaluru, color: "#0e9c97", at: [52, 385], side: "left", slot: 0.8 },
  { name: "Tumakuru", focus: "Aerospace & Defence", image: tumakuru, color: "#3b4fd8", at: [195, 338], side: "right", slot: 0.1 },
  { name: "Bengaluru", focus: "Technology & Startups", image: bengaluru, color: "#1f6fe5", at: [234, 378], side: "right", slot: 0.45 },
  { name: "Mysuru", focus: "Research & Education", image: mysuru, color: "#16a05a", at: [166, 426], side: "right", slot: 0.8 },
];

/** Stage coordinates: a 640×473 box with the 300-wide map centred. */
const STAGE_W = 640;
const MAP_X = (STAGE_W - 300) / 2;
const PHOTO_X = { left: 96, right: STAGE_W - 96 };

export function EcosystemMap({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div id="ecosystem" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Regional strengths"
        title="Explore Karnataka's Ecosystem"
        sub="A thriving ecosystem for global collaboration."
        reduce={reduce}
        align="left"
      />

      <motion.div
        className="relative mx-auto mt-6 w-full max-w-[640px]"
        style={{ aspectRatio: `${STAGE_W} / 473` }}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <svg viewBox={`0 0 ${STAGE_W} 473`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="eco-ka" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#dfe9ff" />
              <stop offset="1" stopColor="#c9d8ff" />
            </linearGradient>
          </defs>
          <motion.g
            transform={`translate(${MAP_X} 0)`}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8 } } }}
          >
            {KARNATAKA_DISTRICTS.map((d) => (
              <path key={d.name} d={d.d} fill="url(#eco-ka)" stroke="#ffffff" strokeWidth={1} />
            ))}
          </motion.g>
          {CITIES.map((c, i) => {
            const cx = MAP_X + c.at[0];
            const cy = c.at[1];
            const px = PHOTO_X[c.side];
            const py = c.slot * 473;
            const on = active === c.name;
            return (
              <g key={c.name}>
                <motion.path
                  d={`M${px} ${py} C ${(px + cx) / 2} ${py}, ${(px + cx) / 2} ${cy}, ${cx} ${cy}`}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={on ? 2.4 : 1.4}
                  strokeOpacity={on ? 1 : 0.55}
                  strokeDasharray={on ? undefined : "4 4"}
                  variants={{
                    hidden: { pathLength: 0 },
                    show: { pathLength: 1, transition: { duration: 0.9, delay: 0.5 + i * 0.12, ease: EASE } },
                  }}
                />
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={on ? 9 : 6}
                  fill={c.color}
                  stroke="#fff"
                  strokeWidth={2}
                  variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { delay: 0.4 + i * 0.12, type: "spring", stiffness: 260, damping: 14 } } }}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
                {!reduce ? (
                  <circle cx={cx} cy={cy} r={6} fill="none" stroke={c.color} strokeWidth={1.5}>
                    <animate attributeName="r" values="6;18" dur="2.2s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0" dur="2.2s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
                  </circle>
                ) : null}
              </g>
            );
          })}
        </svg>

        <motion.span
          className="absolute top-[54%] left-1/2 -translate-x-1/2 rounded-full bg-[#1f3a8a] px-4 py-1.5 font-display text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(31,58,138,0.35)]"
          variants={{ hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.5 } } }}
        >
          Karnataka
        </motion.span>

        {CITIES.map((c, i) => {
          const on = active === c.name;
          const left = c.side === "left";
          return (
            <motion.button
              key={c.name}
              type="button"
              onMouseEnter={() => setActive(c.name)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(c.name)}
              onBlur={() => setActive(null)}
              className="absolute -mt-[22px] flex w-[96px] flex-col items-center gap-1 text-center sm:-mt-[34px] sm:w-[124px] sm:gap-1.5"
              style={{
                top: `${c.slot * 100}%`,
                [left ? "left" : "right"]: 0,
              }}
              variants={{
                hidden: { opacity: 0, x: left ? -24 : 24 },
                show: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.25 + i * 0.1, ease: EASE } },
              }}
            >
              <span
                className="relative block size-[44px] shrink-0 overflow-hidden rounded-full ring-[3px] transition-transform duration-300 sm:size-[68px]"
                style={{ ["--tw-ring-color" as string]: c.color, transform: on ? "scale(1.1)" : undefined, boxShadow: on ? `0 0 0 6px ${c.color}22, 0 12px 26px ${c.color}55` : "0 8px 20px rgba(11,31,74,0.18)" }}
              >
                <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[11.5px] font-semibold text-(color:--gc-ink) sm:text-[13.5px]">{c.name}</span>
                <span className="hidden text-[12px] sm:block" style={{ color: on ? c.color : "#4a5a78" }}>
                  {c.focus}
                </span>
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
