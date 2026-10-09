import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE, SPRING } from "@/components/home/shared";
import { HeroIntro, HeroSearch } from "@/components/kit/HeroIntro";
import { HIGHLIGHTS } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { HIGHLIGHT_ICONS } from "@/lib/icons";
import { asset, cn, external } from "@/lib/utils";

const ALT = { en: "BDA apartment towers", kn: "ಬಿಡಿಎ ವಸತಿ ಸಮುಚ್ಚಯದ ಗೋಪುರಗಳು" };
const HELP = HIGHLIGHTS.filter((h) => h.key === "helpline" || h.key === "grievance" || h.key === "green");
const SLANT = "polygon(14% 0%, 100% 0%, 100% 100%, 0% 100%)";
const CARD = "[clip-path:polygon(9%_0,100%_0,100%_100%,0_100%)]";
const SHADES = ["from-navy to-[#173f9e]", "from-[#173f9e] to-brand", "from-brand to-brand-bright"];
const DECOR = [
  { at: "left-[6%] top-[18%]", look: "size-16 border-brand/40" },
  { at: "left-[1%] top-[58%]", look: "size-10 border-brand-bright/50" },
  { at: "right-[38%] bottom-[10%]", look: "size-12 border-white/80" },
];

function HelpCards({ stacked }: { stacked?: boolean }) {
  const { t } = useLang();
  return (
    <div className={cn(stacked ? "flex w-[290px] flex-col gap-2.5" : "grid gap-2.5 sm:grid-cols-3")}>
      {HELP.map((h, i) => {
        const Icon = HIGHLIGHT_ICONS[h.key];
        return (
          <motion.div
            key={h.key}
            initial={{ opacity: 0, x: stacked ? 120 : 0, y: stacked ? 0 : 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.9 + i * 0.14, duration: 0.7, ease: EASE }}
            style={stacked ? { marginLeft: i * 18 } : undefined}
          >
            <motion.a
              href={h.href}
              {...external(h.href)}
              whileHover={{ x: stacked ? -14 : 0, y: stacked ? 0 : -4 }}
              whileTap={{ x: 0, y: 0 }}
              transition={SPRING}
              className={cn(
                "group relative flex items-center gap-3 bg-gradient-to-r py-3.5 pl-9 pr-4 text-white shadow-[0_16px_30px_-16px_rgba(8,31,80,0.8)] transition-[filter] duration-300 hover:brightness-125",
                CARD,
                SHADES[i],
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Icon weight="duotone" className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold leading-snug">{t(h.title)}</span>
                <span className="block text-[11.5px] leading-snug text-white/75">{t(h.sub)}</span>
              </span>
            </motion.a>
          </motion.div>
        );
      })}
    </div>
  );
}

export function GeometricHero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-white">
      <motion.span
        initial={{ x: "-20%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="pointer-events-none absolute -left-20 top-0 h-full w-[58%] bg-gradient-to-br from-brand-soft to-white/0 [clip-path:polygon(0_0,72%_0,42%_100%,0_100%)]"
        aria-hidden
      />
      <motion.span
        initial={{ x: "-20%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 1.1, ease: EASE }}
        className="pointer-events-none absolute left-[30%] top-0 hidden h-full w-28 bg-brand-soft/60 [clip-path:polygon(60%_0,100%_0,40%_100%,0_100%)] md:block"
        aria-hidden
      />

      <div className="relative h-72 sm:h-80 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[58%]">
        <motion.div
          initial={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }}
          animate={{ clipPath: SLANT }}
          transition={{ duration: 1.3, ease: EASE }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.img src={asset(PHOTOS.towers)} alt={t(ALT)} style={{ y: imageY, scale: 1.12 }} className="size-full object-cover object-[60%_center]" />
        </motion.div>
        {DECOR.map((d, i) => (
          <motion.span
            key={d.at}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.15, type: "spring", stiffness: 200, damping: 12 }}
            className={cn("pointer-events-none absolute hidden md:block", d.at)}
            aria-hidden
          >
            <span className={cn("block rotate-45 animate-float rounded-md border-2", d.look)} style={{ animationDelay: `${i * 1.2}s` }} />
          </motion.span>
        ))}
      </div>

      <div className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
        <HelpCards stacked />
      </div>

      <div className="relative mx-auto max-w-site px-5 pb-12 pt-8 md:min-h-[600px] md:pb-20 md:pt-14 lg:px-8">
        <div className="relative z-20 md:max-w-[50%] lg:max-w-[45%]">
          <HeroIntro />
          <HeroSearch className="mt-7" />
        </div>
        <div className="mt-8 xl:hidden">
          <HelpCards />
        </div>
      </div>
    </section>
  );
}
