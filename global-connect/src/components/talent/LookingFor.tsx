import { motion } from "motion/react";
import { AirplaneTilt, ArrowRight, Flask, GraduationCap, HandsClapping, ShareNetwork, UsersThree, type Icon } from "@phosphor-icons/react";
import collaboration from "@/assets/talent/look-collaboration.jpg";
import education from "@/assets/talent/look-education.jpg";
import employment from "@/assets/talent/look-employment.jpg";
import internships from "@/assets/talent/look-internships.jpg";
import mentorship from "@/assets/talent/look-mentorship.jpg";
import research from "@/assets/talent/look-research.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

const PATHS: { title: string; text: string; icon: Icon; color: string; image: string }[] = [
  { title: "Global Employment", text: "Explore international career opportunities.", icon: AirplaneTilt, color: "#1f6fe5", image: employment },
  { title: "Higher Education", text: "Discover universities and academic opportunities.", icon: GraduationCap, color: "#8a3fd6", image: education },
  { title: "Research", text: "Connect with global research institutions.", icon: Flask, color: "#0e9c97", image: research },
  { title: "Internships", text: "Find international learning opportunities.", icon: ShareNetwork, color: "#e0335c", image: internships },
  { title: "Mentorship", text: "Connect with experienced professionals.", icon: UsersThree, color: "#8a3fd6", image: mentorship },
  { title: "Collaboration", text: "Work with global organisations and experts.", icon: HandsClapping, color: "#ea6c12", image: collaboration },
];

export function LookingFor({ reduce }: { reduce: boolean }) {
  return (
    <section id="looking" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Choose your path"
        title="What Are You Looking For?"
        sub="Choose your global path and explore relevant opportunities."
        reduce={reduce}
      />

      <div className="mx-auto mt-12 grid max-w-[1320px] grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
        {PATHS.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.a
              key={p.title}
              href="#where"
              className="group flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6 transition-shadow hover:shadow-[0_20px_44px_rgba(11,31,74,0.16)]"
              initial={reduce ? false : "hidden"}
              whileInView="show"
              whileHover={reduce ? undefined : { y: -6 }}
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.09, ease: EASE } },
              }}
              transition={{ y: { duration: 0.3 } }}
            >
              <motion.span
                className="relative block overflow-hidden"
                variants={{
                  hidden: { clipPath: "inset(0% 100% 0% 0%)" },
                  show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.8, delay: 0.15 + i * 0.09, ease: EASE } },
                }}
              >
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
              </motion.span>
              <span className="relative flex flex-1 flex-col px-4 pt-8 pb-4">
                <span
                  className="absolute -top-6 left-4 grid size-12 place-items-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(11,31,74,0.15)] transition-transform duration-300 group-hover:-rotate-6"
                  style={{ color: p.color }}
                >
                  <Icon size={24} weight="duotone" />
                </span>
                <span className="font-display text-[16px] font-semibold text-(color:--gc-ink)">{p.title}</span>
                <span className="mt-1.5 flex-1 text-[13px] leading-snug text-(color:--gc-body)">{p.text}</span>
                <span
                  className="mt-4 grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1.5"
                  style={{ background: `${p.color}18`, color: p.color }}
                >
                  <ArrowRight size={15} weight="bold" />
                </span>
              </span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
