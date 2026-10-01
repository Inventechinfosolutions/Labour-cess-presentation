import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  Briefcase,
  Buildings,
  ChalkboardTeacher,
  Check,
  Flask,
  GraduationCap,
  Lightbulb,
  TrendUp,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import profilePhoto from "@/assets/connect/profile.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import { EASE } from "./shared";

const CATEGORIES: { label: string; icon: Icon; color: string }[] = [
  { label: "Professional", icon: Briefcase, color: "#1f6fe5" },
  { label: "Entrepreneur", icon: Lightbulb, color: "#ea6c12" },
  { label: "Investor", icon: TrendUp, color: "#16a05a" },
  { label: "Student", icon: GraduationCap, color: "#8a3fd6" },
  { label: "Researcher", icon: Flask, color: "#0e9c97" },
  { label: "Academic", icon: ChalkboardTeacher, color: "#e0335c" },
  { label: "Community Leader", icon: UsersThree, color: "#e0a91f" },
  { label: "Association / Organisation", icon: Buildings, color: "#1554b8" },
];

const FIELDS = [
  ["Country", "United States"],
  ["City", "San Francisco"],
  ["Profession / Sector", "Technology"],
  ["Area of Expertise", "Artificial Intelligence"],
  ["Interests", "Innovation • Startups • Education"],
  ["Connection to Karnataka", "Professional & Community"],
];

export function JoinNetwork({ reduce }: { reduce: boolean }) {
  const [picked, setPicked] = useState("Professional");

  return (
    <section id="join" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-[#f4f8fd] to-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1220px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Register"
            title="Join the Global Kannadiga Network"
            sub="Create a profile that helps you discover relevant people, communities, opportunities and initiatives."
            reduce={reduce}
            align="left"
          />
          <p className="mt-8 text-[13px] font-semibold tracking-wide text-[#4a5a78] uppercase">I am a…</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {CATEGORIES.map(({ label, icon: Icon, color }, i) => {
              const on = picked === label;
              return (
                <motion.button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(label)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border bg-white px-2 py-3.5 text-center transition-colors",
                    on ? "border-[#e0a91f] bg-[#fffaf0] shadow-[0_10px_24px_rgba(224,169,31,0.18)]" : "border-[#e6ebf3] hover:border-[#1f6fe5]/40",
                  )}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  animate={{ scale: on ? 1.03 : 1 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.05, ease: EASE, scale: { type: "spring", stiffness: 420, damping: 24 } }}
                >
                  <span className="grid size-10 place-items-center rounded-xl" style={{ background: `${color}14`, color }}>
                    <Icon size={22} weight="duotone" />
                  </span>
                  <span className="text-[12.5px] leading-tight font-semibold text-[#0b1f4a]">{label}</span>
                  {on ? (
                    <span className="absolute top-1.5 right-1.5 grid size-4.5 place-items-center rounded-full bg-[#e0a91f] text-white">
                      <Check size={10} weight="bold" />
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          className="relative"
          initial={reduce ? false : { opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img
            src={profilePhoto}
            alt="A Kannadiga professional creating her profile"
            className="ml-auto aspect-[4/3] w-full rounded-[28px] object-cover object-right shadow-[0_30px_70px_rgba(11,31,74,0.18)] sm:w-[78%]"
            loading="lazy"
          />
          <ProfilePreview reduce={reduce} category={picked} />
        </motion.div>
      </div>
    </section>
  );
}

function ProfilePreview({ reduce, category }: { reduce: boolean; category: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [shown, setShown] = useState(reduce ? FIELDS.length : 0);

  useEffect(() => {
    if (reduce || !inView || shown >= FIELDS.length) return;
    const id = window.setTimeout(() => setShown(shown + 1), shown === 0 ? 500 : 220);
    return () => window.clearTimeout(id);
  }, [inView, reduce, shown]);

  return (
    <div
      ref={ref}
      className="relative mt-[-40px] w-full rounded-2xl bg-white p-5 shadow-[0_24px_60px_rgba(11,31,74,0.2)] ring-1 ring-[#0b1f4a]/6 sm:absolute sm:top-1/2 sm:left-0 sm:mt-0 sm:w-[54%] sm:-translate-y-1/2"
    >
      <div className="flex items-center gap-2.5">
        <img src={emblem} alt="" className="h-7 w-auto" />
        <div className="leading-tight">
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#1f5fbf] uppercase">My Global Kannadiga Profile</p>
          <p className="text-[12px] font-semibold text-[#0b1f4a]">{category}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2">
        {FIELDS.map(([label, value], i) => (
          <motion.div
            key={label}
            className="rounded-lg border border-[#e6ebf3] px-3 py-1.5"
            initial={false}
            animate={i < shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <dt className="text-[9.5px] font-medium tracking-wide text-[#8a97ad] uppercase">{label}</dt>
            <dd className="text-[12.5px] font-semibold text-[#0b1f4a]">{value}</dd>
          </motion.div>
        ))}
      </dl>
      <motion.span
        className="mt-4 block rounded-full bg-[#0b1f4a] py-2.5 text-center text-[13px] font-semibold text-white"
        initial={false}
        animate={shown >= FIELDS.length ? { opacity: 1, scale: [0.96, 1.04, 1] } : { opacity: 0.35, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Create Profile
      </motion.span>
      <p className="mt-2 text-center text-[10.5px] text-[#8a97ad]">Concept preview. Final fields may differ.</p>
    </div>
  );
}
