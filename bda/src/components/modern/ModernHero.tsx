import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE } from "@/components/home/shared";
import { HeroIntro } from "@/components/kit/HeroIntro";
import { useLang } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn } from "@/lib/utils";

const IMAGE = PHOTOS.flats;
const ALT = { en: "BDA apartment complex", kn: "ಬಿಡಿಎ ವಸತಿ ಸಮುಚ್ಚಯ" };
const WAVE = "M0 50 Q 180 0 360 50 T 720 50 T 1080 50 T 1440 50 V100 H0 Z";

const LAYERS = [
  { fill: "fill-brand/15", motion: "animate-wave-slow", offset: "bottom-7" },
  { fill: "fill-brand-bright/25", motion: "animate-wave", offset: "bottom-3" },
  { fill: "fill-page", motion: "animate-wave-slow [animation-direction:reverse]", offset: "-bottom-px" },
];

function Waves() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden md:h-36" aria-hidden>
      {LAYERS.map((l) => (
        <div key={l.fill} className={cn("absolute left-0 flex w-[200%]", l.motion, l.offset)}>
          {[0, 1].map((k) => (
            <svg key={k} viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-20 w-1/2 md:h-28">
              <path d={WAVE} className={l.fill} />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}

export function ModernHero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-br from-white via-[#f1f6ff] to-[#e2ecff]">
      <span className="pointer-events-none absolute -left-24 top-10 size-72 animate-drift rounded-full bg-brand-soft blur-2xl" aria-hidden />
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-y-0 right-0 hidden w-[58%] md:block md:[mask-image:linear-gradient(to_right,transparent_0%,black_26%)]"
      >
        <motion.img
          src={asset(IMAGE)}
          alt={t(ALT)}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.08 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" } }}
          className="size-full object-cover object-[70%_center]"
        />
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.35, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
        className="pointer-events-none absolute bottom-40 left-[44%] hidden h-24 w-36 bg-[radial-gradient(circle,#1d4fc4_1.2px,transparent_1.4px)] bg-[length:14px_14px] lg:block"
        aria-hidden
      />
      <div className="relative mx-auto max-w-site px-5 pb-32 pt-10 md:min-h-[540px] md:pb-48 md:pt-16 lg:px-8">
        <HeroIntro features={false} className="max-w-2xl" />
      </div>
      <motion.img
        src={asset(IMAGE)}
        alt=""
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
        className="-mt-24 mb-24 h-56 w-full object-cover md:hidden"
      />
      <Waves />
    </section>
  );
}
