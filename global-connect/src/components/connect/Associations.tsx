import { motion } from "motion/react";
import { ArrowRight, CalendarPlus, IdentificationCard, PlugsConnected, UserCirclePlus, type Icon } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

const ACTIONS: { title: string; text: string; icon: Icon }[] = [
  { title: "Register", text: "Your association or organisation", icon: UserCirclePlus },
  { title: "Create Profile", text: "Share objectives and activities", icon: IdentificationCard },
  { title: "Organise Events", text: "Reach the global Kannada community", icon: CalendarPlus },
  { title: "Collaborate", text: "Connect with Karnataka initiatives", icon: PlugsConnected },
];

export function Associations({ reduce }: { reduce: boolean }) {
  return (
    <section id="associations" className="relative scroll-mt-16 bg-[#f4f8fd] px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1220px] items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="Associations & organisations"
            title="Connect Communities With Karnataka"
            sub="The network is not only for individuals. Associations and organisations can join too."
            reduce={reduce}
            align="left"
          />
          <motion.a
            href="#join"
            className="group mt-7 inline-flex items-center gap-2 rounded-full border border-[#0b1f4a]/20 bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0b1f4a] transition hover:border-[#0b1f4a]/50"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Learn More
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>

        <ol className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map(({ title, text, icon: Icon }, i) => (
            <motion.li
              key={title}
              className="relative flex flex-col items-start rounded-2xl bg-white p-5 shadow-[0_10px_28px_rgba(11,31,74,0.07)]"
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.14, ease: EASE }}
            >
              <span className="font-display text-[12px] font-bold text-[#e0a91f]">0{i + 1}</span>
              <span className="mt-2 grid size-12 place-items-center rounded-xl bg-[#e7f0ff] text-[#1f6fe5]">
                <Icon size={26} weight="duotone" />
              </span>
              <span className="mt-4 font-display text-[16px] font-semibold text-[#0b1f4a]">{title}</span>
              <span className="mt-1 text-[13.5px] leading-snug text-[#4a5a78]">{text}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
