import { ArrowRight, Buildings, Calculator, Desktop, HouseLine, Key, LinkSimple, MapTrifold, Star } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { Container, CountUp, EASE, Reveal, SPRING, SectionHeader } from "@/components/home/shared";
import { Announcements } from "@/components/home/Updates";
import { CtaButton, IconRow, NewsList, Panel, pop, services } from "@/components/kit/Blocks";
import { LayoutMap } from "@/components/showcase/LayoutMap";
import { ABOUT, SITE, type ServiceIcon } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { SERVICE_ICONS } from "@/lib/icons";
import { asset, cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  services: t2("Our Key Services", "ನಮ್ಮ ಪ್ರಮುಖ ಸೇವೆಗಳು"),
  servicesSub: t2("Access important services and information in one place", "ಪ್ರಮುಖ ಸೇವೆಗಳು ಮತ್ತು ಮಾಹಿತಿಯನ್ನು ಒಂದೇ ಕಡೆ ಪಡೆಯಿರಿ"),
  all: t2("View All Services", "ಎಲ್ಲಾ ಸೇವೆಗಳು"),
  progress: t2("Bengaluru in Progress", "ಪ್ರಗತಿಯತ್ತ ಬೆಂಗಳೂರು"),
  progressBody: t2(
    "Planned layouts, modern infrastructure and better civic amenities for a sustainable future.",
    "ಸುಸ್ಥಿರ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಯೋಜಿತ ಬಡಾವಣೆಗಳು, ಆಧುನಿಕ ಮೂಲಸೌಕರ್ಯ ಮತ್ತು ಉತ್ತಮ ನಾಗರಿಕ ಸೌಲಭ್ಯಗಳು.",
  ),
  featured: t2("Featured Services", "ವಿಶೇಷ ಸೇವೆಗಳು"),
  quick: t2("Quick Links", "ತ್ವರಿತ ಕೊಂಡಿಗಳು"),
};

const KEY: { icon: ServiceIcon; tint: string; tone: string; dot: string; wave: number }[] = [
  { icon: "layouts", tint: "bg-emerald-50", tone: "text-emerald-600", dot: "bg-emerald-500", wave: 30 },
  { icon: "auction", tint: "bg-blue-50", tone: "text-blue-600", dot: "bg-blue-600", wave: 6 },
  { icon: "online", tint: "bg-amber-50", tone: "text-amber-600", dot: "bg-amber-500", wave: 30 },
  { icon: "calculator", tint: "bg-violet-50", tone: "text-violet-600", dot: "bg-violet-500", wave: 0 },
  { icon: "rti", tint: "bg-teal-50", tone: "text-teal-600", dot: "bg-teal-500", wave: 24 },
  { icon: "cdrms", tint: "bg-sky-50", tone: "text-sky-600", dot: "bg-sky-500", wave: 36 },
  { icon: "corridor", tint: "bg-rose-50", tone: "text-rose-600", dot: "bg-rose-500", wave: 8 },
];

const WAVE_PATH = "M0 120 C 110 40, 220 190, 410 110 S 640 30, 820 120 S 1080 200, 1220 100 S 1380 60, 1440 110";

function KeyServices() {
  const { t } = useLang();
  return (
    <Container>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <Reveal>
          <h2 className="font-display text-[1.9rem] font-bold text-navy md:text-[2.2rem]">{t(TEXT.services)}</h2>
          <p className="mt-1 text-[14.5px] text-muted">{t(TEXT.servicesSub)}</p>
        </Reveal>
        <CtaButton href={`${SITE}/online-services`}>{t(TEXT.all)}</CtaButton>
      </div>
      <div className="relative">
        <svg className="pointer-events-none absolute inset-x-0 top-[22%] hidden h-48 w-full lg:block" viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden>
          <motion.path
            d={WAVE_PATH}
            fill="none"
            stroke="#c9d8f5"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <path d={WAVE_PATH} fill="none" stroke="#1d4fc4" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="3 9" className="animate-dash" />
        </svg>
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:pb-10">
          {services(...KEY.map((k) => k.icon)).map((s, i) => {
            const k = KEY[i];
            const Icon = SERVICE_ICONS[s.icon];
            return (
              <motion.div key={s.label.en} {...pop(i, 0.05)} style={{ "--wave": `${k.wave}px` } as CSSProperties} className="lg:mt-[var(--wave)]">
                <motion.a
                  href={s.href}
                  {...external(s.href)}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 1, y: 0 }}
                  transition={SPRING}
                  className="group relative flex h-full flex-col items-center rounded-[26px] border border-white bg-white/95 p-3 py-6 text-center shadow-[0_18px_40px_-22px_rgba(11,44,107,0.45)] transition-[background-color,box-shadow] duration-300 hover:bg-brand hover:shadow-[0_28px_50px_-20px_rgba(11,44,107,0.55)]"
                >
                  <span className={cn("grid size-14 place-items-center rounded-2xl transition-colors duration-300 group-hover:bg-white/15", k.tint)}>
                    <Icon weight="duotone" className={cn("size-8 transition-[color,scale] duration-300 group-hover:scale-110 group-hover:text-white", k.tone)} />
                  </span>
                  <span className="mt-3 flex min-h-[2.6em] items-center text-[13.5px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(s.label)}</span>
                  <span className={cn("mt-2 grid size-7 place-items-center rounded-full text-white transition-colors duration-300 group-hover:bg-white group-hover:text-brand", k.dot)}>
                    <ArrowRight weight="bold" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </motion.a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

const STAT_ICONS = [HouseLine, Buildings, Key];

function Progress() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <Reveal className="h-full">
      <div ref={ref} className="relative h-full min-h-[380px] overflow-hidden rounded-[28px] shadow-[0_20px_44px_-24px_rgba(11,44,107,0.5)]">
        <motion.img src={asset(PHOTOS.flats)} alt="" style={{ y, scale: 1.18 }} className="absolute inset-0 size-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/0" />
        <div className="relative flex h-full flex-col justify-between gap-8 p-6 md:p-9">
          <div className="max-w-sm">
            <h2 className="font-display text-[1.9rem] font-bold leading-tight text-navy md:text-[2.3rem]">{t(TEXT.progress)}</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink/75">{t(TEXT.progressBody)}</p>
            <CtaButton href={ABOUT.href} className="mt-5">
              {t(ABOUT.cta)}
            </CtaButton>
          </div>
          <dl className="grid max-w-xl grid-cols-1 gap-3 rounded-2xl bg-white/85 p-3 backdrop-blur sm:grid-cols-3">
            {ABOUT.stats.slice(0, 3).map((s, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <motion.div key={s.value} {...pop(i, 0.3)} className="flex items-center gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon weight="duotone" className="size-5" />
                  </span>
                  <span>
                    <dt className="font-display text-lg font-bold leading-none text-navy">
                      <CountUp value={s.value} />
                    </dt>
                    <dd className="mt-1 text-[11px] leading-tight text-muted">{t(s.label)}</dd>
                  </span>
                </motion.div>
              );
            })}
          </dl>
        </div>
      </div>
    </Reveal>
  );
}

const FEATURED = [
  {
    icon: MapTrifold,
    title: t2("BDA Layouts & Land", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು ಮತ್ತು ಭೂಮಿ"),
    sub: t2("Residential, commercial, industrial sites and more", "ವಸತಿ, ವಾಣಿಜ್ಯ, ಕೈಗಾರಿಕಾ ನಿವೇಶನಗಳು ಮತ್ತು ಇನ್ನಷ್ಟು"),
    href: `${SITE}/bda-layout`,
    image: PHOTOS.layoutBoard,
  },
  {
    icon: Calculator,
    title: t2("Property Tax Calculator", "ಆಸ್ತಿ ತೆರಿಗೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್"),
    sub: t2("Calculate property tax easily and instantly", "ಆಸ್ತಿ ತೆರಿಗೆಯನ್ನು ಸುಲಭವಾಗಿ ಮತ್ತು ತಕ್ಷಣ ಲೆಕ್ಕ ಹಾಕಿ"),
    href: `${SITE}/ptcalculator`,
    image: PHOTOS.villa,
  },
  {
    icon: Desktop,
    title: t2("Online Services", "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"),
    sub: t2("Apply for sites, schemes and certificates", "ನಿವೇಶನ, ಯೋಜನೆ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"),
    href: `${SITE}/online-services`,
    image: PHOTOS.headOffice,
  },
];

function Featured() {
  const { t } = useLang();
  return (
    <Panel>
      <SectionHeader icon={Star} title={TEXT.featured} />
      <div className="space-y-3">
        {FEATURED.map((f, i) => (
          <motion.div key={f.title.en} {...pop(i, 0.15)}>
            <motion.a
              href={f.href}
              {...external(f.href)}
              whileHover={{ x: 4 }}
              transition={SPRING}
              className="group flex items-center gap-3 rounded-2xl border border-line p-2.5 pl-3 transition-colors duration-300 hover:border-brand hover:bg-brand"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-white transition-colors group-hover:bg-white/15">
                <f.icon weight="duotone" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-semibold leading-snug text-navy transition-colors group-hover:text-white">{t(f.title)}</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(f.sub)}</span>
              </span>
              <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                <img src={asset(f.image)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <span className="absolute bottom-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-white text-brand shadow transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight weight="bold" className="size-3" />
                </span>
              </span>
            </motion.a>
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

export function ShowcaseSections() {
  const { t } = useLang();
  return (
    <>
      <KeyServices />
      <Container>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <Progress />
          <LayoutMap />
        </div>
      </Container>
      <Container>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <Announcements limit={4} />
          </Reveal>
          <Reveal delay={0.06}>
            <NewsList />
          </Reveal>
          <Reveal delay={0.12}>
            <Featured />
          </Reveal>
        </div>
      </Container>
      <Container className="pb-16 md:pb-20">
        <Reveal>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-navy md:text-xl">
            <LinkSimple weight="duotone" className="size-6 text-brand" />
            {t(TEXT.quick)}
          </h2>
        </Reveal>
        <IconRow stacked className="sm:grid-cols-5 lg:grid-cols-9" items={services("casite", "map", "stray", "commissioner", "business", "flats", "gallery", "jcc", "contact")} />
      </Container>
    </>
  );
}
