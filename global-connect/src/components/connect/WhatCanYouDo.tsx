import { motion } from "motion/react";
import { ArrowRight, CalendarCheck, ChalkboardTeacher, ChartLineUp, HandHeart, ShareNetwork, UsersThree, type Icon } from "@phosphor-icons/react";
import collaborate from "@/assets/connect/do-collaborate.jpg";
import connect from "@/assets/connect/do-connect.jpg";
import contribute from "@/assets/connect/do-contribute.jpg";
import invest from "@/assets/connect/do-invest.jpg";
import mentor from "@/assets/connect/do-mentor.jpg";
import participate from "@/assets/connect/do-participate.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

const ACTIONS: { title: string; text: string; icon: Icon; color: string; image: string }[] = [
  { title: "Connect", text: "Meet professionals, entrepreneurs and communities.", icon: ShareNetwork, color: "#1f6fe5", image: connect },
  { title: "Collaborate", text: "Find people with shared interests and expertise.", icon: UsersThree, color: "#0e9c97", image: collaborate },
  { title: "Mentor", text: "Support students, startups and emerging talent.", icon: ChalkboardTeacher, color: "#8a3fd6", image: mentor },
  { title: "Invest", text: "Discover opportunities in Karnataka.", icon: ChartLineUp, color: "#16a05a", image: invest },
  { title: "Contribute", text: "Share knowledge, skills and global experience.", icon: HandHeart, color: "#e0335c", image: contribute },
  { title: "Participate", text: "Join cultural, professional and government initiatives.", icon: CalendarCheck, color: "#ea6c12", image: participate },
];

export function WhatCanYouDo({ reduce }: { reduce: boolean }) {
  return (
    <section id="do" className="relative scroll-mt-16 bg-gradient-to-b from-white to-[#f4f8fd] px-5 py-20 lg:px-8">
      <SectionHeading eyebrow="What can you do?" title="Connect. Collaborate. Contribute." sub="Many ways to connect, collaborate and contribute." reduce={reduce} />

      <div className="mx-auto mt-12 grid max-w-[1320px] grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.a
              key={a.title}
              href="#join"
              className="group flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_rgba(11,31,74,0.08)] ring-1 ring-[#0b1f4a]/6 transition-shadow hover:shadow-[0_20px_44px_rgba(11,31,74,0.16)]"
              initial={reduce ? false : { opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduce ? undefined : { y: -6 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.08, ease: EASE, y: { duration: 0.3 } }}
            >
              <span className="relative block overflow-hidden">
                <img
                  src={a.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: a.color }} />
              </span>
              <span className="relative flex flex-1 flex-col px-4 pt-7 pb-4">
                <span
                  className="absolute -top-6 left-4 grid size-12 place-items-center rounded-full text-white ring-4 ring-white"
                  style={{ background: a.color }}
                >
                  <Icon size={22} weight="bold" />
                </span>
                <span className="font-display text-[17px] font-semibold" style={{ color: a.color }}>
                  {a.title}
                </span>
                <span className="mt-1.5 flex-1 text-[13.5px] leading-snug text-[#4a5a78]">{a.text}</span>
                <span
                  className="mt-4 grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1.5"
                  style={{ background: `${a.color}18`, color: a.color }}
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
