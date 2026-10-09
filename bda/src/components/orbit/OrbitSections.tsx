import {
  ArrowRight,
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  Desktop,
  FilePdf,
  Gavel,
  HouseLine,
  MapTrifold,
  Megaphone,
  Newspaper,
  NotePencil,
  Phone,
  Star,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, EASE, Reveal, SPRING, SectionHeader } from "@/components/home/shared";
import { AnnouncementTabs } from "@/components/home/Updates";
import { CtaButton, LinkList, NEWS_TITLE, Panel, READ_MORE, pop, services } from "@/components/kit/Blocks";
import {
  ABOUT,
  ANNOUNCEMENTS,
  BUILDING,
  EAUCTION_LINKS,
  HIGHLIGHTS,
  LAYOUT_LINKS,
  NEWS,
  ONLINE_SERVICES,
  ORG,
  SITE,
  type AnnouncementTab,
  type LinkItem,
  type ServiceIcon,
} from "@/lib/content";
import { PhotoBackdrop } from "@/components/kit/PhotoBackdrop";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { SERVICE_ICONS } from "@/lib/icons";
import { asset, cn, dateParts, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  glance: t2("Key Services", "ಪ್ರಮುಖ ಸೇವೆಗಳು"),
  glance2: t2("at a Glance", "ಒಂದು ನೋಟದಲ್ಲಿ"),
  sub: t2("Access important services quickly. Turn the wheel or hover a service.", "ಪ್ರಮುಖ ಸೇವೆಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಪಡೆಯಿರಿ. ಚಕ್ರವನ್ನು ತಿರುಗಿಸಿ ಅಥವಾ ಸೇವೆಯ ಮೇಲೆ ಕರ್ಸರ್ ಇಡಿ."),
  hub: t2("BDA Services", "ಬಿಡಿಎ ಸೇವೆಗಳು"),
  prev: t2("Rotate back", "ಹಿಂದಕ್ಕೆ ತಿರುಗಿಸಿ"),
  next: t2("Rotate forward", "ಮುಂದಕ್ಕೆ ತಿರುಗಿಸಿ"),
  popular: t2("Popular Services", "ಜನಪ್ರಿಯ ಸೇವೆಗಳು"),
  all: t2("View All Services", "ಎಲ್ಲಾ ಸೇವೆಗಳು"),
  announcements: t2("Announcements", "ಪ್ರಕಟಣೆಗಳು"),
  link: t2("Online", "ಆನ್‌ಲೈನ್"),
  green: t2("Know More", "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ"),
  layouts: t2("BDA Layouts & Land", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು ಮತ್ತು ಭೂಮಿ"),
  eauction: t2("E-Auction", "ಇ-ಹರಾಜು"),
  online: t2("Online Services", "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"),
};

const ORBIT: ServiceIcon[] = ["auction", "online", "calculator", "rti", "cdrms", "casite", "map", "stray", "corridor", "layouts"];
const RADIUS = 39;

function Orbit() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const items = services(...ORBIT);
  const n = items.length;
  const [step, setStep] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const rotation = useSpring(0, { stiffness: 60, damping: 16 });
  const counter = useTransform(rotation, (r) => -r);
  const active = ((step % n) + n) % n;
  const shown = hover ?? active;

  useEffect(() => {
    rotation.set((-step * 360) / n);
  }, [step, n, rotation]);

  useEffect(() => {
    if (hover !== null || reduce) return;
    const id = setInterval(() => setStep((s) => s + 1), 3200);
    return () => clearInterval(id);
  }, [hover, reduce]);

  return (
    <div className="relative mx-auto w-full max-w-[560px] px-5 sm:px-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -30 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.1, ease: EASE }}
        className="@container relative aspect-square w-full"
      >
        <span className="absolute inset-[3%] animate-spin-slow rounded-full border-2 border-dashed border-brand/20" aria-hidden />
        <span className="absolute inset-[22%] animate-spin-reverse rounded-full border border-brand/15" aria-hidden />
        <span className="absolute left-1/2 top-[-1.5%] size-0 -translate-x-1/2 border-x-[7px] border-t-[10px] border-x-transparent border-t-brand" aria-hidden />

        <motion.div style={{ rotate: rotation }} className="absolute inset-0">
          {items.map((s, i) => {
            const angle = ((i * 360) / n - 90) * (Math.PI / 180);
            const Icon = SERVICE_ICONS[s.icon];
            const on = i === shown;
            return (
              <div
                key={s.label.en}
                style={{ left: `${50 + RADIUS * Math.cos(angle)}%`, top: `${50 + RADIUS * Math.sin(angle)}%` }}
                className="absolute aspect-square w-[19.5%] -translate-x-1/2 -translate-y-1/2"
              >
                <motion.div style={{ rotate: counter }} className="size-full">
                  <motion.a
                    href={s.href}
                    {...external(s.href)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    animate={{ scale: on ? 1.12 : 1 }}
                    whileTap={{ scale: 1 }}
                    transition={SPRING}
                    className={cn(
                      "flex size-full flex-col items-center justify-center gap-[0.6cqw] rounded-full border p-[1.4cqw] text-center shadow-[0_14px_28px_-16px_rgba(11,44,107,0.5)] transition-colors duration-300",
                      on ? "border-brand bg-brand text-white" : "border-line bg-white text-navy",
                    )}
                  >
                    <Icon weight="duotone" className={cn("size-[5cqw] shrink-0 transition-colors", on ? "text-white" : "text-brand")} />
                    <span className="text-[clamp(8px,1.8cqw,12px)] font-semibold leading-tight">{t(s.label)}</span>
                  </motion.a>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 aspect-square w-[38%] -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 animate-ping-soft rounded-full bg-brand/15" aria-hidden />
          <div className="relative flex size-full flex-col items-center justify-center rounded-full bg-gradient-to-br from-navy via-[#173f9e] to-brand-bright text-center text-white shadow-[0_30px_60px_-24px_rgba(8,31,80,0.8)] ring-[1.6cqw] ring-white">
            <img src={asset("images/bda-logo.jpg")} alt="" className="size-[9cqw] rounded-full ring-2 ring-white/60" />
            <span className="mt-[1.2cqw] font-display text-[clamp(13px,3.6cqw,22px)] font-bold leading-tight">{t(TEXT.hub)}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={shown}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-[0.8cqw] max-w-[80%] text-[clamp(9px,2.1cqw,12.5px)] leading-tight text-white/80"
              >
                {t(items[shown].label)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      {[
        { d: -1, Icon: CaretLeft, label: TEXT.prev, pos: "left-0" },
        { d: 1, Icon: CaretRight, label: TEXT.next, pos: "right-0" },
      ].map(({ d, Icon, label, pos }) => (
        <motion.button
          key={d}
          type="button"
          aria-label={t(label)}
          onClick={() => setStep((s) => s + d)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className={cn("absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-navy shadow-md transition-colors hover:bg-brand hover:text-white", pos)}
        >
          <Icon weight="bold" />
        </motion.button>
      ))}
    </div>
  );
}

const ALLOTMENT = HIGHLIGHTS.find((h) => h.key === "allotment")!;
const POPULAR: (LinkItem & { icon: Icon | ServiceIcon })[] = [
  { icon: HouseLine, label: t2("Apply for allotment of BDA sites, Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆಯಲ್ಲಿ ನಿವೇಶನ ಹಂಚಿಕೆಗೆ ಅರ್ಜಿ"), href: ALLOTMENT.href },
  ...services("tax", "flats", "south", "jcc"),
];

function Popular() {
  const { t } = useLang();
  return (
    <Panel className="rounded-3xl">
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
        <Star weight="duotone" className="size-6 text-brand" />
        {t(TEXT.popular)}
      </h3>
      <ul className="space-y-2">
        {POPULAR.map((p, i) => {
          const IconCmp = typeof p.icon === "string" ? SERVICE_ICONS[p.icon] : p.icon;
          return (
            <motion.li key={p.label.en} {...pop(i, 0.2)}>
              <motion.a
                href={p.href}
                {...external(p.href)}
                whileHover={{ x: 4 }}
                transition={SPRING}
                className="group flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition-colors duration-300 hover:border-brand hover:bg-brand"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-white/15 group-hover:text-white">
                  <IconCmp weight="duotone" className="size-5" />
                </span>
                <span className="flex-1 text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover:text-white">{t(p.label)}</span>
                <ArrowRight weight="bold" className="size-3.5 shrink-0 text-brand transition-[color,translate] group-hover:translate-x-1 group-hover:text-white" />
              </motion.a>
            </motion.li>
          );
        })}
      </ul>
      <a
        href={`${SITE}/online-services`}
        {...external(`${SITE}/online-services`)}
        className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-navy py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand"
      >
        {t(TEXT.all)}
        <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
      </a>
    </Panel>
  );
}

function KeyServices() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <PhotoBackdrop image={PHOTOS.towers} />
      <span className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#e3edff_0%,transparent_65%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-site items-center gap-10 px-5 lg:grid-cols-[0.7fr_1.4fr_0.9fr] lg:px-8">
        <Reveal>
          <h2 className="font-display text-[2rem] font-bold leading-tight text-navy md:text-[2.4rem]">
            {t(TEXT.glance)}
            <span className="block bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent">{t(TEXT.glance2)}</span>
          </h2>
          <p className="mt-2 max-w-xs text-[14px] text-muted">{t(TEXT.sub)}</p>
        </Reveal>
        <Orbit />
        <Reveal delay={0.1}>
          <Popular />
        </Reveal>
      </div>
    </section>
  );
}

function AnnouncementCards() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<AnnouncementTab>("all");
  const items = ANNOUNCEMENTS.filter((a) => tab === "all" || a.tab === tab).slice(0, 4);
  const green = HIGHLIGHTS.find((h) => h.key === "green")!;
  return (
    <Container className="pt-2 md:pt-4">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Reveal>
          <Panel>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy md:text-xl">
                <Megaphone weight="duotone" className="size-6 text-brand" />
                {t(TEXT.announcements)}
              </h2>
              <AnnouncementTabs tab={tab} onChange={setTab} className="order-last w-full sm:order-none sm:ml-4 sm:w-auto" />
              <a href={`${SITE}/news`} {...external(`${SITE}/news`)} className="group ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
                {t({ en: "View All", kn: "ಎಲ್ಲಾ ನೋಡಿ" })}
                <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((a) => {
                  const d = dateParts(a.date, lang);
                  return (
                    <motion.a
                      key={a.href + a.date}
                      layout
                      href={a.href}
                      {...external(a.href)}
                      initial={{ opacity: 0, y: 14, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="group flex flex-col rounded-xl border border-line p-4 transition-[background-color,border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-brand hover:bg-brand hover:shadow-[0_18px_32px_-16px_rgba(11,44,107,0.45)]"
                    >
                      <span className="font-display text-2xl font-bold leading-none text-navy transition-colors group-hover:text-white">{d.day}</span>
                      <span className="mt-1 text-[10.5px] font-semibold uppercase text-muted transition-colors group-hover:text-white/75">{d.monthYear}</span>
                      <span className="mt-3 line-clamp-3 flex-1 text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-white">{t(a.title)}</span>
                      <span className="mt-3 flex items-center justify-between text-[11px] font-semibold text-muted transition-colors group-hover:text-white/85">
                        <span className="flex items-center gap-1">
                          {a.pdf ? <FilePdf weight="fill" className="size-4 text-red-600" /> : <ArrowSquareOut weight="bold" className="size-4 text-brand group-hover:text-white" />}
                          {a.pdf ? "PDF" : t(TEXT.link)}
                        </span>
                        <ArrowRight weight="bold" className="text-brand transition-[color,translate] group-hover:translate-x-1 group-hover:text-white" />
                      </span>
                    </motion.a>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </Panel>
        </Reveal>
        <Reveal delay={0.1}>
          <a
            href={green.href}
            {...external(green.href)}
            className="group relative flex h-full min-h-72 flex-col justify-end overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_36px_-20px_rgba(11,44,107,0.6)]"
          >
            <img src={asset(PHOTOS.headOffice)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <span className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy/40 to-transparent" />
            <span className="absolute inset-0 bg-brand/0 transition-colors duration-500 group-hover:bg-brand/70" />
            <span className="relative">
              <span className="block font-display text-xl font-bold">{t(green.title)}</span>
              <span className="mt-1 block text-[12.5px] text-white/85">{t(green.sub)}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-navy transition-colors group-hover:text-brand">
                {t(TEXT.green)}
                <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </Container>
  );
}

function MediaCard({ icon, title, href, image, links, delay }: { icon: Icon; title: Text; href: string; image: string; links: LinkItem[]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <Panel>
        <SectionHeader icon={icon} title={title} href={href} />
        <div className="flex gap-4">
          <div className="group hidden w-[40%] shrink-0 overflow-hidden rounded-xl sm:block">
            <img src={asset(image)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </div>
          <LinkList links={links} className="flex-1" />
        </div>
      </Panel>
    </Reveal>
  );
}

function NewsAndHelp() {
  const { t, lang } = useLang();
  const grievance = HIGHLIGHTS.find((h) => h.key === "grievance")!;
  const help = [
    { Icon: Phone, title: t2("24x7 Helpline", "24x7 ಸಹಾಯವಾಣಿ"), sub: t2(ORG.helpline, ORG.helpline), href: "tel:+919483166622" },
    { Icon: NotePencil, title: grievance.title, sub: grievance.sub, href: grievance.href },
  ];
  return (
    <Container>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Reveal>
          <Panel>
            <SectionHeader icon={Newspaper} title={NEWS_TITLE} href={`${SITE}/news`} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {NEWS.map((n, i) => {
                const d = dateParts(n.date, lang);
                return (
                  <motion.a
                    key={n.href + n.date}
                    href={n.href}
                    {...external(n.href)}
                    {...pop(i, 0.15)}
                    className="group flex flex-col rounded-xl border border-line p-4 transition-colors duration-300 hover:border-brand hover:bg-brand"
                  >
                    <span className="font-display text-2xl font-bold leading-none text-brand transition-colors group-hover:text-white">{d.day}</span>
                    <span className="mt-1 text-[10.5px] font-semibold uppercase text-muted transition-colors group-hover:text-white/75">{d.monthYear}</span>
                    <span className="mt-3 line-clamp-3 flex-1 text-[13px] font-semibold leading-snug text-navy transition-colors group-hover:text-white">{t(n.title)}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-brand transition-colors group-hover:text-white">
                      {t(READ_MORE)}
                      <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </Panel>
        </Reveal>
        <div className="grid gap-4">
          {help.map(({ Icon, title, sub, href }, i) => (
            <Reveal key={href} delay={0.08 + i * 0.08}>
              <motion.a
                href={href}
                {...external(href)}
                whileHover={{ y: -4 }}
                whileTap={{ y: 0 }}
                transition={SPRING}
                className="group flex h-full items-center gap-4 rounded-2xl bg-gradient-to-br from-navy to-[#173f9e] p-5 text-white shadow-[0_18px_36px_-20px_rgba(8,31,80,0.8)] transition-colors duration-300 hover:from-brand hover:to-brand-bright"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
                  <Icon weight="duotone" className="size-7" />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold leading-snug">{t(title)}</span>
                  <span className="mt-0.5 block text-[12px] text-white/75">{t(sub)}</span>
                </span>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </Container>
  );
}

function Panorama() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "4%"]);
  const words = t(BUILDING).split(" ");
  return (
    <section ref={ref} className="relative mt-16 h-[340px] overflow-hidden md:mt-20 md:h-[420px]">
      <motion.img src={asset(PHOTOS.flats)} alt="" style={{ y }} className="absolute inset-x-0 top-0 h-[125%] w-full object-cover object-bottom" />
      <div className="absolute inset-0 bg-gradient-to-b from-page via-page/60 to-transparent" />
      <div className="relative mx-auto max-w-site px-5 pt-10 text-center md:pt-14 lg:px-8">
        <h2 key={lang} className="mx-auto max-w-3xl font-display text-[1.7rem] font-bold leading-tight text-navy md:text-[2.4rem]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                initial={{ y: "105%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: EASE }}
                className="inline-block"
              >
                {w}
              </motion.span>
              {"\u00a0"}
            </span>
          ))}
        </h2>
        <CtaButton href={ABOUT.href} className="mt-5">
          {t(ABOUT.cta)}
        </CtaButton>
      </div>
    </section>
  );
}

export function OrbitSections() {
  return (
    <>
      <KeyServices />
      <AnnouncementCards />
      <Container className="pt-6 md:pt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <MediaCard icon={MapTrifold} title={TEXT.layouts} href={`${SITE}/bda-layout`} image={PHOTOS.layoutBoard} links={LAYOUT_LINKS} delay={0} />
          <MediaCard icon={Gavel} title={TEXT.eauction} href={`${SITE}/e-auction`} image={PHOTOS.layoutSigns} links={EAUCTION_LINKS} delay={0.06} />
          <MediaCard icon={Desktop} title={TEXT.online} href={`${SITE}/online-services`} image={PHOTOS.towers} links={ONLINE_SERVICES.slice(0, 5)} delay={0.12} />
        </div>
      </Container>
      <NewsAndHelp />
      <Panorama />
    </>
  );
}
