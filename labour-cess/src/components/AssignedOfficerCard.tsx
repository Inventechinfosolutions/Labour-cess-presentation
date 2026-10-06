import { motion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import { Bank, CheckCircle, EnvelopeSimple, MapPin, MapTrifold, Phone, User } from "@/lib/icons";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import officerPhoto from "@/assets/assign-officer-photo.jpg";
import territoryMap from "@/assets/assign-territory-map.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const TERRITORY = KARNATAKA_DISTRICTS.find((d) => d.name === "Bengaluru Urban")?.d ?? "";

const PLACE: { label: string; value: string; Icon: CessIcon; tint: string; color: string }[] = [
  { label: "District", value: "Bengaluru Urban", Icon: Bank, tint: "#ece6fd", color: "#6d44d8" },
  { label: "Taluk / Area", value: "Yelahanka", Icon: MapPin, tint: "#dcf3e6", color: "#159a55" },
  { label: "Ward / Zone", value: "East Zone", Icon: MapTrifold, tint: "#fdf0d6", color: "#d98a06" },
];

/** Flat "Assigned Officer" card — officer, contact, territory map and place strip. */
export function AssignedOfficerCard({ reduce }: { reduce: boolean }) {
  const rise = (delay: number, y = 8) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease },
        };

  return (
    <div
      className="relative w-full rounded-[clamp(14px,2.4cqw,24px)] bg-[linear-gradient(180deg,#f7fbff,#eef5fd)] p-[1.6%] shadow-[0_22px_44px_rgba(7,20,51,0.18)] ring-1 ring-[#d5e4f4] [container-type:inline-size]"
      role="img"
      aria-label="Assigned officer — R. Kumar, Labour Inspector, AST-2025-014, Bengaluru Urban, Yelahanka, East Zone. Territory mapped."
    >
      <div className="relative flex flex-col overflow-hidden rounded-[clamp(12px,2cqw,20px)] bg-white shadow-[0_6px_18px_rgba(20,60,120,0.08)] ring-1 ring-[#e1ebf6]">
        {/* Header ribbon + status */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-[1.4cqw] bg-[linear-gradient(90deg,#1b5fd0,#3d8df2)] py-[1cqw] pr-[5cqw] pl-[1.4cqw] text-white"
            style={{ clipPath: "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)" }}
          >
            <span className="grid size-[4.4cqw] place-items-center rounded-full bg-white/20 ring-2 ring-white/60">
              <User weight="fill" className="size-[55%]" />
            </span>
            <span className="font-display text-[2.4cqw] leading-none font-extrabold">Assigned Officer</span>
          </motion.div>
          <motion.span
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: reduce ? 0 : 1.5, type: "spring", stiffness: 320, damping: 18 }}
            className="mr-[2cqw] flex items-center gap-[1cqw] rounded-[1.2cqw] bg-[linear-gradient(135deg,#149456,#28b36b)] py-[0.8cqw] pr-[2.2cqw] pl-[0.9cqw] text-white shadow-[0_6px_14px_rgba(20,148,86,0.32)]"
          >
            <CheckCircle weight="fill" className="size-[3.4cqw] rounded-full bg-white text-[#149456]" />
            <span className="font-display text-[1.75cqw] leading-none font-bold">Territory Mapped</span>
          </motion.span>
        </div>

        {/* Officer + territory */}
        <div className="grid grid-cols-[minmax(0,1fr)_27%] gap-[1.6cqw] px-[2.4cqw] pt-[1.2cqw]">
          <div className="flex items-center gap-[2cqw]">
            <motion.img
              src={officerPhoto}
              alt=""
              draggable={false}
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.2, ease }}
              className="aspect-square w-[25%] shrink-0 rounded-full object-cover shadow-[0_8px_18px_rgba(20,50,90,0.25)] ring-[0.6cqw] ring-white"
            />
            <span aria-hidden className="h-[80%] w-px shrink-0 bg-[#dbe6f3]" />
            <div className="min-w-0">
              <motion.p {...rise(0.3)} className="font-display text-[3.6cqw] leading-none font-extrabold text-[#0f2e63]">
                R. Kumar
              </motion.p>
              <motion.p {...rise(0.38)} className="mt-[0.8cqw] text-[2.1cqw] leading-none font-semibold text-[#3e5f8c]">
                Labour Inspector
              </motion.p>
              <motion.span
                {...rise(0.46)}
                className="mt-[1.2cqw] inline-block rounded-[0.9cqw] bg-[#dcebfd] px-[2cqw] py-[0.7cqw] text-[1.9cqw] leading-none font-bold tracking-[0.02em] text-[#123a6e]"
              >
                AST-2025-014
              </motion.span>
              <motion.div {...rise(0.54)} className="mt-[1.6cqw] flex items-center gap-[2cqw] whitespace-nowrap">
                <Contact Icon={Phone} text="+91 98765 43210" />
                <Contact Icon={EnvelopeSimple} text="rkumar@karnataka.gov.in" />
              </motion.div>
            </div>
          </div>

          <motion.div
            {...rise(0.4, 0)}
            className="relative aspect-[1.6/1] self-center overflow-hidden rounded-[1.4cqw] shadow-[0_6px_14px_rgba(20,60,120,0.14)] ring-1 ring-[#d5e4f4]"
          >
            <img src={territoryMap} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <svg viewBox="212 357.5 42 45" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
              <motion.path
                d={TERRITORY}
                fill="rgba(46,120,230,0.26)"
                stroke="#2a6fdc"
                strokeWidth={0.7}
                strokeLinejoin="round"
                strokeDasharray="1.4 0.7"
                initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: 1 }}
                transition={{ duration: 1.1, delay: 0.6, ease: "easeInOut" }}
              />
              {!reduce && (
                <motion.circle
                  cx={BENGALURU_POINT.x}
                  cy={BENGALURU_POINT.y}
                  fill="none"
                  stroke="#e0302f"
                  strokeWidth={0.6}
                  initial={{ r: 1, opacity: 0 }}
                  animate={{ r: [1, 7], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1.6 }}
                />
              )}
              <motion.g
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3, ease }}
              >
                <ellipse cx={BENGALURU_POINT.x} cy={BENGALURU_POINT.y + 0.3} rx={2.2} ry={0.8} fill="rgba(30,70,160,0.35)" />
                <g transform={`translate(${BENGALURU_POINT.x} ${BENGALURU_POINT.y}) scale(0.34)`}>
                  <path d="M0 0 C-3 -6 -10 -11 -10 -18 A10 10 0 1 1 10 -18 C10 -11 3 -6 0 0 Z" fill="#e0302f" stroke="#fff" strokeWidth={1.4} />
                  <circle cx={0} cy={-18} r={4} fill="#fff" />
                </g>
              </motion.g>
            </svg>
            <span className="absolute bottom-[8%] left-[6%] flex items-center gap-[0.6cqw] rounded-[0.8cqw] bg-white px-[1.2cqw] py-[0.7cqw] text-[1.55cqw] leading-none font-bold text-[#123a6e] shadow-[0_3px_8px_rgba(20,50,90,0.2)]">
              <MapPin weight="fill" className="size-[1.2em] text-[#1d4f9a]" />
              East Zone
            </span>
          </motion.div>
        </div>

        {/* Place strip */}
        <div className="m-[1.6cqw] mt-[1.4cqw] grid grid-cols-3 rounded-[1.4cqw] bg-[#f5f9fe] py-[1.3cqw] ring-1 ring-[#e3ecf7]">
          {PLACE.map((p, i) => (
            <motion.div
              key={p.label}
              {...rise(0.7 + i * 0.1)}
              className="flex items-center gap-[1.6cqw] border-l border-[#dbe6f3] px-[2cqw] first:border-0"
            >
              <span className="grid size-[5cqw] shrink-0 place-items-center rounded-full" style={{ background: p.tint, color: p.color }}>
                <p.Icon weight="fill" className="size-[50%]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[1.5cqw] leading-tight font-semibold text-[#5b7390]">{p.label}</span>
                <span className="block text-[1.95cqw] leading-tight font-extrabold text-[#0f2e63]">{p.value}</span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Contact({ Icon, text }: { Icon: CessIcon; text: string }) {
  return (
    <span className="flex items-center gap-[0.8cqw] text-[1.5cqw] leading-none font-semibold text-[#243f66]">
      <span className="grid size-[3.3cqw] shrink-0 place-items-center rounded-full bg-[#dcebfd] text-[#1b5fd0]">
        <Icon weight="fill" className="size-[50%]" />
      </span>
      {text}
    </span>
  );
}
