import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE } from "@/components/home/shared";
import { HeroIntro, HeroSearch } from "@/components/kit/HeroIntro";
import { VALUES } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { VALUE_ICONS } from "@/lib/icons";
import { asset, cn } from "@/lib/utils";

const ALT = { en: "A BDA villa", kn: "ಬಿಡಿಎ ವಿಲ್ಲಾ" };
const FADE = "md:[mask-image:linear-gradient(to_right,transparent_0%,black_32%)]";

function Values({ panel }: { panel?: boolean }) {
  const { t } = useLang();
  return (
    <ul
      className={cn(
        panel
          ? "w-56 space-y-1 rounded-3xl border border-white/70 bg-white/55 p-2 shadow-[0_24px_50px_-24px_rgba(11,44,107,0.45)] backdrop-blur-xl"
          : "grid grid-cols-2 gap-2 sm:grid-cols-4",
      )}
    >
      {VALUES.map((v, i) => {
        const Icon = VALUE_ICONS[v.key];
        return (
          <motion.li
            key={v.key}
            initial={{ opacity: 0, x: panel ? 40 : 0, y: panel ? 0 : 14 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1 + i * 0.12, duration: 0.6, ease: EASE }}
            className={cn(
              "group flex cursor-default items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-300 hover:bg-brand",
              !panel && "border border-line bg-white",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-[background-color,color,rotate] duration-500 group-hover:rotate-[360deg] group-hover:bg-white/15 group-hover:text-white">
              <Icon weight="duotone" className="size-5" />
            </span>
            <span className="text-[13.5px] font-semibold text-navy transition-colors group-hover:text-white">{t(v.label)}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function OrbitHero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-b from-[#f6f9ff] to-[#e9f1ff]">
      <span className="pointer-events-none absolute -left-24 -top-24 size-96 animate-drift rounded-full bg-brand-soft blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute bottom-0 left-[35%] size-72 animate-drift rounded-full bg-sky-100 blur-3xl [animation-delay:-6s]" aria-hidden />

      <motion.div style={{ y: imageY }} className={cn("relative h-72 sm:h-80 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[62%]", FADE)}>
        <motion.img
          src={asset(PHOTOS.villa)}
          alt={t(ALT)}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="size-full object-cover object-[60%_top]"
        />
      </motion.div>

      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 xl:block 2xl:right-10">
        <Values panel />
      </div>

      <div className="relative mx-auto max-w-site px-5 pb-12 pt-8 md:min-h-[600px] md:pb-20 md:pt-14 lg:px-8">
        <div className="relative z-20 md:max-w-[50%] lg:max-w-[45%]">
          <HeroIntro />
          <HeroSearch className="mt-7" />
        </div>
        <div className="mt-8 xl:hidden">
          <Values />
        </div>
      </div>
    </section>
  );
}
