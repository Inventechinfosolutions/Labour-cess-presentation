import { motion } from "motion/react";
import { ChartBar, GlobeHemisphereWest, HandsClapping, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import experience from "@/assets/talent/start-experience.jpg";
import launch from "@/assets/talent/start-launch.jpg";
import learn from "@/assets/talent/start-learn.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";

const START = [
  { title: "Learn", text: "Connect with universities and learning opportunities.", image: learn, color: "#1f6fe5" },
  { title: "Experience", text: "Find internships and international exposure.", image: experience, color: "#0e9c97" },
  { title: "Launch", text: "Build a global career or entrepreneurial journey.", image: launch, color: "#ea6c12" },
];

type Stage = { label: string; icon?: Icon; color: string };
const BACK: Stage[] = [
  { label: "Global Experience", icon: GlobeHemisphereWest, color: "#1f6fe5" },
  { label: "Expertise", icon: Lightbulb, color: "#16a05a" },
  { label: "Karnataka Opportunity", color: "#f0a020" },
  { label: "Mentorship", icon: UsersThree, color: "#8a3fd6" },
  { label: "Collaboration", icon: HandsClapping, color: "#e0335c" },
  { label: "Local Impact", icon: ChartBar, color: "#0e9c97" },
];
const STEP = 0.2;

function Heading({ title, sub, reduce }: { title: string; sub: string; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <h2 className="font-display text-[24px] leading-tight font-bold tracking-[-0.02em] text-(color:--gc-ink) sm:text-[28px]">{title}</h2>
      <p className="mt-1.5 text-[14.5px] text-(color:--gc-body)">{sub}</p>
    </motion.div>
  );
}

export function TwoWays({ reduce }: { reduce: boolean }) {
  return (
    <section id="two-ways" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-2 lg:gap-12">
        <div id="young" className="scroll-mt-20">
          <Heading title="Start Global From Karnataka" sub="For students and young professionals." reduce={reduce} />
          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {START.map((s, i) => (
              <motion.div
                key={s.title}
                className="group flex overflow-hidden rounded-2xl bg-white sm:block shadow-[0_10px_30px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6"
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.12, ease: EASE }}
              >
                <span className="relative block w-[38%] shrink-0 overflow-hidden sm:w-auto">
                  <img src={s.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.06] sm:aspect-[16/10]" />
                  <span className="absolute top-2.5 left-2.5 grid size-7 place-items-center rounded-full bg-white font-display text-[11px] font-bold" style={{ color: s.color }}>
                    {i + 1}
                  </span>
                </span>
                <div className="self-center p-3.5">
                  <p className="font-display text-[15px] font-semibold" style={{ color: s.color }}>
                    {s.title}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-snug text-(color:--gc-body)">{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <GoldButton href="#looking" className="mt-7">
            Explore Young Talent Opportunities
          </GoldButton>
        </div>

        <div id="contribute" className="scroll-mt-20 lg:border-l lg:border-(color:--gc-ink)/8 lg:pl-12">
          <Heading title="Bring Global Experience Back to Karnataka" sub="For professionals and experts." reduce={reduce} />
          <motion.div
            className="relative mt-9"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            <span aria-hidden className="absolute top-[26px] right-[8%] left-[8%] hidden h-[2px] overflow-hidden rounded-full bg-(color:--gc-ink)/8 sm:block">
              <motion.span
                className="absolute inset-0 origin-left bg-gradient-to-r from-(color:--gc-primary) via-[#f0a020] to-[#0e9c97]"
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: BACK.length * STEP, ease: "easeInOut" } } }}
              />
              {!reduce ? (
                <motion.span
                  className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_rgba(240,160,32,0.8)]"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 3.2, delay: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
            </span>
            <ol className="relative grid grid-cols-3 gap-y-6 sm:flex sm:justify-between">
              {BACK.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.li
                      key={b.label}
                      className="flex flex-col items-center text-center sm:w-[78px]"
                      variants={{
                        hidden: { opacity: 0, y: 14, scale: 0.85 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { delay: i * STEP, duration: 0.45, ease: EASE } },
                      }}
                    >
                      <span
                        className="grid size-[52px] place-items-center rounded-full bg-white ring-4 ring-white"
                        style={{ color: b.color, boxShadow: `0 10px 24px ${b.color}33, inset 0 0 0 1.5px ${b.color}55` }}
                      >
                        {Icon ? (
                          <Icon size={24} weight="duotone" />
                        ) : (
                          <svg viewBox={KARNATAKA_VIEWBOX} className="h-8 w-auto" aria-hidden>
                            {KARNATAKA_DISTRICTS.map((d) => (
                              <path key={d.name} d={d.d} fill={b.color} stroke="#fff" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                            ))}
                          </svg>
                        )}
                      </span>
                      <span className="mt-2.5 text-[12px] leading-tight font-semibold text-(color:--gc-ink)">{b.label}</span>
                    </motion.li>
                );
              })}
            </ol>
          </motion.div>
          <GoldButton href="#profile" className="mt-9">
            Learn How You Can Contribute
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
