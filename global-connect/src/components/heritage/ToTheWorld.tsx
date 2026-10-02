import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, GlobeHemisphereEast, MapPin } from "@phosphor-icons/react";
import panorama from "@/assets/heritage/panorama.jpg";
import { HeritageTitle } from "./parts";
import { EASE } from "./motion";

const CHAIN = ["Bengaluru", "Mysuru", "Mangaluru"];

export function ToTheWorld({ reduce }: { reduce: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-(color:--gc-surface)">
      <div className="relative z-10 px-5 pt-16 lg:px-8 lg:pt-20">
        <HeritageTitle reduce={reduce} sub="From the world's technology centres to Karnataka's emerging ecosystems, connections create new possibilities.">
          From Karnataka to the World
        </HeritageTitle>
      </div>

      <div className="relative -mt-6 h-[360px] sm:h-[420px]">
        <motion.img
          src={panorama}
          alt="Mysuru Palace and a modern Karnataka campus reflected in a river at sunset"
          loading="lazy"
          className="absolute inset-0 size-full object-cover object-[50%_60%]"
          initial={reduce ? false : { scale: 1.08 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.8, ease: EASE }}
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-(color:--gc-surface) to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[rgba(6,36,25,0.85)] to-transparent" />

        <ol className="absolute inset-x-0 bottom-8 mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-2 gap-y-3 px-5">
          {CHAIN.map((c, i) => (
            <Fragment key={c}>
              <motion.li
                className="flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-[13.5px] font-semibold text-(color:--gc-ink) shadow-[0_8px_20px_rgba(0,0,0,0.2)] backdrop-blur"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.9 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.25, ease: EASE }}
              >
                <MapPin size={15} weight="fill" className="text-(color:--gc-gold-4)" />
                {c}
              </motion.li>
              <motion.li
                aria-hidden
                className="flex items-center text-(color:--gc-gold)"
                initial={reduce ? false : { opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true, amount: 0.9 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.25, ease: EASE }}
                style={{ transformOrigin: "left" }}
              >
                <span className="hidden h-px w-10 bg-[repeating-linear-gradient(90deg,currentColor_0_5px,transparent_5px_9px)] sm:block lg:w-20" />
                <ArrowRight size={14} weight="bold" />
              </motion.li>
            </Fragment>
          ))}
          <motion.li
            className="flex items-center gap-2 rounded-full bg-(color:--gc-navy) px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_10px_26px_rgba(0,0,0,0.3)] ring-2 ring-(color:--gc-gold-3)"
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.9 }}
            transition={{ duration: 0.5, delay: 1, ease: EASE }}
          >
            <GlobeHemisphereEast size={17} weight="duotone" className="text-(color:--gc-gold)" />
            Global Karnataka
          </motion.li>
        </ol>
      </div>
    </section>
  );
}
