import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import {
  Briefcase,
  Buildings,
  ChalkboardTeacher,
  Check,
  Flask,
  GraduationCap,
  House,
  MagnifyingGlass,
  RocketLaunch,
  SquaresFour,
  UserCircle,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import avatar from "@/assets/talent/avatar.jpg";
import desk from "@/assets/talent/profile.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";

const ROLES: { label: string; icon: Icon; color: string; sector: string }[] = [
  { label: "Professional", icon: Briefcase, color: "#1f6fe5", sector: "Technology" },
  { label: "Student", icon: GraduationCap, color: "#8a3fd6", sector: "Computer Science" },
  { label: "Researcher", icon: Flask, color: "#0e9c97", sector: "Life Sciences" },
  { label: "Entrepreneur", icon: RocketLaunch, color: "#ea6c12", sector: "Clean Energy" },
  { label: "Academic", icon: ChalkboardTeacher, color: "#e0335c", sector: "Higher Education" },
  { label: "Job Seeker", icon: MagnifyingGlass, color: "#1554b8", sector: "Engineering" },
  { label: "Mentor", icon: UsersThree, color: "#16a05a", sector: "Advanced Manufacturing" },
  { label: "Organisation", icon: Buildings, color: "#e0a91f", sector: "Industry & Institutions" },
];

const SKILLS = ["AI", "Cloud", "Data", "Engineering"];
const INTERESTS = ["Global Jobs", "Research", "Mentoring", "Collaboration"];
const SIDEBAR = [House, UserCircle, SquaresFour, Buildings];

export function TalentProfile({ reduce }: { reduce: boolean }) {
  const [picked, setPicked] = useState("Professional");
  const role = ROLES.find((r) => r.label === picked)!;

  return (
    <section id="profile" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-(color:--gc-surface) to-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1220px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionHeading
            eyebrow="Your profile"
            title="Create Your Talent Profile"
            sub="Tell the world what you can do and how you want to connect."
            reduce={reduce}
            align="left"
          />
          <p className="mt-8 text-[13px] font-semibold tracking-wide text-(color:--gc-body) uppercase">I am a…</p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {ROLES.map(({ label, icon: Icon, color }, i) => {
              const on = picked === label;
              return (
                <motion.button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(label)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left transition-colors",
                    on ? "shadow-[0_10px_24px_rgba(11,31,74,0.12)]" : "border-(color:--gc-line) hover:border-(color:--gc-primary)/40",
                  )}
                  style={on ? { borderColor: color, background: `${color}0d` } : undefined}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  animate={{ scale: on ? 1.03 : 1 }}
                  transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.05, ease: EASE, scale: { type: "spring", stiffness: 420, damping: 24 } }}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ background: `${color}16`, color }}>
                    <Icon size={20} weight="duotone" />
                  </span>
                  <span className="text-[13.5px] font-semibold text-(color:--gc-ink)">{label}</span>
                  {on ? (
                    <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full text-white" style={{ background: color }}>
                      <Check size={11} weight="bold" />
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
          <GoldButton href="#profile" className="mt-8">
            Create Your Talent Profile
          </GoldButton>
        </div>

        <motion.div
          className="relative"
          initial={reduce ? false : { opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img
            src={desk}
            alt="A desk with a computer showing a talent profile"
            className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-[0_30px_70px_rgba(11,31,74,0.18)]"
            loading="lazy"
          />
          <ProfileScreen reduce={reduce} role={role} />
        </motion.div>
      </div>
    </section>
  );
}

function ProfileScreen({ reduce, role }: { reduce: boolean; role: (typeof ROLES)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const rows: [string, string][] = [
    ["Name", "Ananya Rao"],
    ["Location", "Bengaluru, Karnataka"],
    ["Profession / Sector", role.sector],
  ];
  const total = rows.length + 2;
  const [shown, setShown] = useState(reduce ? total : 0);

  useEffect(() => {
    if (reduce || !inView || shown >= total) return;
    const id = window.setTimeout(() => setShown(shown + 1), shown === 0 ? 500 : 260);
    return () => window.clearTimeout(id);
  }, [inView, reduce, shown, total]);

  const reveal = (i: number) => ({
    initial: false as const,
    animate: i < shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 },
    transition: { duration: 0.35, ease: EASE },
  });

  return (
    <div
      ref={ref}
      className="relative mt-[-48px] flex overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(11,31,74,0.22)] ring-1 ring-(color:--gc-ink)/8 sm:absolute sm:top-[9%] sm:left-[7%] sm:mt-0 sm:w-[66%]"
    >
      <div className="flex w-11 shrink-0 flex-col items-center gap-3 bg-(color:--gc-ink) py-4 text-white/60">
        {SIDEBAR.map((I, i) => (
          <span key={i} className={cn("grid size-7 place-items-center rounded-lg", i === 1 && "bg-white/15 text-(color:--gc-gold)")}>
            <I size={16} weight="duotone" />
          </span>
        ))}
      </div>
      <div className="flex-1 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <img src={avatar} alt="" className="size-12 rounded-full object-cover ring-2" style={{ "--tw-ring-color": role.color } as CSSProperties} />
          <div className="leading-tight">
            <p className="text-[10px] font-bold tracking-[0.16em] text-(color:--gc-primary-deep) uppercase">My Global Talent Profile</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={role.label}
                className="text-[13px] font-semibold"
                style={{ color: role.color }}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {role.label}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <dl className="mt-4 space-y-1.5">
          {rows.map(([label, value], i) => (
            <motion.div key={label} className="grid grid-cols-[110px_1fr] items-center gap-2 text-[12px]" {...reveal(i)}>
              <dt className="text-(color:--gc-muted)">{label}</dt>
              <dd className="rounded-md border border-(color:--gc-line) px-2.5 py-1.5 font-semibold text-(color:--gc-ink)">{value}</dd>
            </motion.div>
          ))}
          <motion.div className="grid grid-cols-[110px_1fr] items-center gap-2 text-[12px]" {...reveal(rows.length)}>
            <dt className="text-(color:--gc-muted)">Skills</dt>
            <dd className="flex flex-wrap gap-1">
              {SKILLS.map((s) => (
                <span key={s} className="rounded-md bg-[#eef4ff] px-2 py-1 font-semibold text-(color:--gc-primary-deep)">
                  {s}
                </span>
              ))}
            </dd>
          </motion.div>
        </dl>
        <motion.div className="mt-3" {...reveal(rows.length + 1)}>
          <p className="text-[12px] text-(color:--gc-muted)">Interests</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {INTERESTS.map((s) => (
              <span key={s} className="rounded-full border border-[#e0a91f]/40 bg-[#fffaf0] px-2.5 py-1 text-[11px] font-medium text-[#8a6410]">
                {s}
              </span>
            ))}
          </div>
        </motion.div>
        <p className="mt-3 text-[10px] text-(color:--gc-muted)">Concept preview. Final fields may differ.</p>
      </div>
    </div>
  );
}
