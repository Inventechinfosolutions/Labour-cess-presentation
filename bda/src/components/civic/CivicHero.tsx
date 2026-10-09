import { ChartLineUp, Leaf, ShieldCheck, UsersThree, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "@/components/home/shared";
import { HeroSearch } from "@/components/kit/HeroIntro";
import { HERO, SERVICES, type ServiceIcon } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });
const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!;

const TITLE: { text: Text; accent?: boolean }[] = [
  { text: t2("Planning Today", "ಇಂದಿನ ಯೋಜನೆ") },
  { text: t2("for a Better", "ಉತ್ತಮ ನಾಳೆಯ") },
  { text: t2("Bengaluru Tomorrow", "ಬೆಂಗಳೂರಿಗಾಗಿ"), accent: true },
];

const LINES: Text[] = [
  t2("Planned layouts. Sustainable development.", "ಯೋಜಿತ ಬಡಾವಣೆಗಳು. ಸುಸ್ಥಿರ ಅಭಿವೃದ್ಧಿ."),
  t2("Vibrant communities. A global city for tomorrow.", "ಚೈತನ್ಯಪೂರ್ಣ ಸಮುದಾಯಗಳು. ನಾಳೆಯ ಜಾಗತಿಕ ನಗರ."),
];

const CHIPS: { label: Text; href: string }[] = [
  svc("layouts"),
  svc("auction"),
  { label: t2("Property Tax", "ಆಸ್ತಿ ತೆರಿಗೆ"), href: svc("tax").href },
  svc("online"),
  svc("cdrms"),
  svc("map"),
];

const VALUES: { icon: Icon; label: Text; tone: string }[] = [
  { icon: Leaf, label: t2("Liveable Communities", "ವಾಸಯೋಗ್ಯ ಸಮುದಾಯಗಳು"), tone: "bg-emerald-50 text-emerald-600" },
  { icon: ChartLineUp, label: t2("Sustainable Growth", "ಸುಸ್ಥಿರ ಬೆಳವಣಿಗೆ"), tone: "bg-blue-50 text-blue-600" },
  { icon: ShieldCheck, label: t2("Transparent Governance", "ಪಾರದರ್ಶಕ ಆಡಳಿತ"), tone: "bg-teal-50 text-teal-600" },
  { icon: UsersThree, label: t2("Future Ready Bengaluru", "ಭವಿಷ್ಯಕ್ಕೆ ಸಿದ್ಧ ಬೆಂಗಳೂರು"), tone: "bg-indigo-50 text-indigo-600" },
];

const PHOTO_SET = [PHOTOS.towers, PHOTOS.headOffice, PHOTOS.flats];
const ALT = t2("BDA housing and offices in Bengaluru", "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಬಿಡಿಎ ವಸತಿ ಮತ್ತು ಕಚೇರಿಗಳು");
const MASK = "[mask-image:radial-gradient(ellipse_72%_68%_at_55%_46%,black_58%,transparent_78%)]";

function Waves() {
  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { delay, duration: 1.6, ease: "easeInOut" as const },
  });
  return (
    <svg viewBox="0 0 640 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full" aria-hidden>
      <motion.path d="M380 200 C 470 150 560 120 640 112 V200 Z" fill="#2563eb" fillOpacity="0.12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }} />
      <motion.path d="M-10 196 C 160 120 360 130 650 30" stroke="#34d399" strokeOpacity="0.55" strokeWidth="16" strokeLinecap="round" fill="none" {...draw(0.6)} />
      <motion.path d="M60 205 C 230 145 430 150 650 82" stroke="#fcd34d" strokeOpacity="0.8" strokeWidth="12" strokeLinecap="round" fill="none" {...draw(0.85)} />
      <motion.path d="M200 210 C 340 170 500 170 650 128" stroke="#93c5fd" strokeOpacity="0.7" strokeWidth="8" strokeLinecap="round" fill="none" {...draw(1.1)} />
    </svg>
  );
}

function ValuesPanel({ className }: { className?: string }) {
  const { t } = useLang();
  return (
    <motion.ul
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }}
      className={className}
    >
      {VALUES.map((v) => (
        <motion.li key={v.label.en} variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}>
          <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-brand">
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg transition-colors group-hover:bg-white/20 group-hover:text-white", v.tone)}>
              <v.icon weight="duotone" className="size-5" />
            </span>
            <span className="text-[12.5px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(v.label)}</span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function CivicHero() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    PHOTO_SET.slice(1).forEach((p) => {
      new Image().src = asset(p);
    });
    const id = setInterval(() => setIndex((i) => (i + 1) % PHOTO_SET.length), 6500);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#f5f9ff] to-[#eaf2ff]">
      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
        className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full border-[36px] border-brand/10"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-site items-center gap-6 px-5 pt-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8 lg:pt-6">
        <div className="relative z-20 pb-4 lg:pb-16">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[11px] font-semibold uppercase text-navy/70"
          >
            {t(HERO.eyebrow)}
          </motion.p>
          <h1 key={lang} className="mt-3 font-display text-[2.3rem] font-bold leading-[1.08] sm:text-[2.8rem] xl:text-[3.3rem]">
            {TITLE.map((line, i) => (
              <span key={line.text.en} className="block overflow-hidden pb-1">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE }}
                  className={cn(
                    "inline-block",
                    line.accent ? "bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent" : "text-navy",
                  )}
                >
                  {t(line.text)}
                </motion.span>
              </span>
            ))}
          </h1>
          <div key={`l-${lang}`} className="mt-4">
            {LINES.map((l, i) => (
              <motion.p
                key={l.en}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: EASE }}
                className="text-[15px] font-medium text-ink/80 md:text-base"
              >
                {t(l)}
              </motion.p>
            ))}
          </div>
          <HeroSearch className="mt-6" delay={0.85} />
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 1.05 } } }}
            className="mt-4 flex flex-wrap gap-1.5"
          >
            {CHIPS.map((c) => (
              <motion.li key={c.label.en} variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}>
                <a
                  href={c.href}
                  {...external(c.href)}
                  className="inline-block whitespace-nowrap rounded-full border border-brand/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
                >
                  {t(c.label)}
                </a>
              </motion.li>
            ))}
          </motion.ul>
          <ValuesPanel className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-white bg-white/80 p-1.5 shadow-sm lg:hidden" />
        </div>

        <div className="relative h-72 sm:h-96 lg:h-[500px]">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            transition={{ opacity: { duration: 1 }, scale: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute left-[14%] top-[4%] size-56 rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-transparent sm:size-72"
            aria-hidden
          />
          <div className={cn("absolute inset-0", MASK)}>
            <AnimatePresence initial={false}>
              <motion.img
                key={index}
                src={asset(PHOTO_SET[index])}
                alt={t(ALT)}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.02 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.4, ease: "easeInOut" }, scale: { duration: 9, ease: "linear" } }}
                className="absolute inset-0 size-full object-cover"
              />
            </AnimatePresence>
          </div>
          <Waves />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0, y: reduce ? 0 : [0, -8, 0] }}
            transition={{ opacity: { delay: 0.7, duration: 0.6 }, x: { delay: 0.7, duration: 0.8, ease: EASE }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute right-0 top-8 z-10 hidden w-56 rounded-2xl border border-white bg-white/85 p-1.5 shadow-[0_24px_50px_-20px_rgba(11,44,107,0.45)] backdrop-blur-md lg:block"
          >
            <ValuesPanel className="divide-y divide-line/70" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
