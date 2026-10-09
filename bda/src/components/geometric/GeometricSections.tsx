import { Desktop, LinkSimple, MapTrifold, type Icon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Container, EASE, Reveal, SPRING, SectionHeader } from "@/components/home/shared";
import { Announcements } from "@/components/home/Updates";
import { CtaButton, IconRow, LinkList, NewsList, Panel, pop, services } from "@/components/kit/Blocks";
import { PhotoBackdrop } from "@/components/kit/PhotoBackdrop";
import { ABOUT, BUILDING, LAYOUT_LINKS, ONLINE_SERVICES, SITE, type LinkItem, type ServiceIcon } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { SERVICE_ICONS } from "@/lib/icons";
import { asset, cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  explore: t2("Explore", "ಬಿಡಿಎ"),
  services: t2("BDA Services", "ಸೇವೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ"),
  sub: t2("Quick access to important services and information", "ಪ್ರಮುಖ ಸೇವೆಗಳು ಮತ್ತು ಮಾಹಿತಿಗೆ ತ್ವರಿತ ಪ್ರವೇಶ"),
  hub: t2("BDA Services", "ಬಿಡಿಎ ಸೇವೆಗಳು"),
  all: t2("View All Services", "ಎಲ್ಲಾ ಸೇವೆಗಳು"),
  layouts: t2("BDA Layouts & Land", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು ಮತ್ತು ಭೂಮಿ"),
  online: t2("Online Services", "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"),
  details: t2("View Details", "ವಿವರಗಳು"),
  quick: t2("Quick Links", "ತ್ವರಿತ ಕೊಂಡಿಗಳು"),
};

const LATTICE: { icon: ServiceIcon; x: number; y: number }[] = [
  { icon: "auction", x: 0, y: -3 },
  { icon: "layouts", x: -1, y: -2 },
  { icon: "online", x: 1, y: -2 },
  { icon: "calculator", x: 2, y: -1 },
  { icon: "rti", x: 3, y: 0 },
  { icon: "cdrms", x: 2, y: 1 },
  { icon: "map", x: 1, y: 2 },
  { icon: "contact", x: 0, y: 3 },
  { icon: "stray", x: -1, y: 2 },
  { icon: "casite", x: -2, y: 1 },
  { icon: "corridor", x: -3, y: 0 },
  { icon: "flats", x: -2, y: -1 },
];

const UNIT = 12.5;
const SMALL = "12.6%";
const HUB = "25.6%";
const pos = (x: number, y: number) => ({ left: `${50 + x * UNIT}%`, top: `${50 + y * UNIT}%` });

function Lattice() {
  const { t } = useLang();
  const items = services(...LATTICE.map((l) => l.icon));
  return (
    <div className="@container relative mx-auto hidden aspect-[4/3] w-full max-w-[820px] md:block">
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
        style={{ ...pos(0, 0), width: HUB }}
        className="absolute z-10 aspect-square -translate-x-1/2 -translate-y-1/2"
      >
        <span className="absolute -inset-[14%] rotate-45 animate-spin-slow rounded-[18%] border-2 border-dashed border-brand/25" aria-hidden />
        <span className="absolute -inset-[6%] rotate-45 animate-ping-soft rounded-[16%] bg-brand/10" aria-hidden />
        <motion.a
          href={`${SITE}/online-services`}
          {...external(`${SITE}/online-services`)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING}
          className="group relative grid size-full rotate-45 place-items-center rounded-[14%] bg-gradient-to-br from-navy via-[#173f9e] to-brand-bright shadow-[0_30px_60px_-24px_rgba(8,31,80,0.8)] ring-8 ring-white transition-[filter] hover:brightness-110"
        >
          <span className="flex -rotate-45 flex-col items-center gap-[1.2cqw] text-center text-white">
            <img src={asset("images/bda-logo.jpg")} alt="" className="size-[7cqw] rounded-full ring-2 ring-white/60 transition-transform duration-700 group-hover:rotate-[360deg]" />
            <span className="font-display text-[clamp(13px,2.6cqw,24px)] font-bold leading-tight">{t(TEXT.hub)}</span>
          </span>
        </motion.a>
      </motion.div>
      {items.map((s, i) => {
        const { x, y } = LATTICE[i];
        const Icon = SERVICE_ICONS[s.icon];
        const ring = Math.abs(x) + Math.abs(y);
        return (
          <motion.div
            key={s.label.en}
            initial={{ opacity: 0, scale: 0.2, x: `${-x * 60}%`, y: `${-y * 60}%` }}
            whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 170, damping: 17, delay: 0.25 + (ring - 3) * 0.12 + i * 0.03 }}
            style={{ ...pos(x, y), width: SMALL }}
            className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 hover:z-20"
          >
            <motion.a
              href={s.href}
              {...external(s.href)}
              whileHover={{ scale: 1.14 }}
              whileTap={{ scale: 1 }}
              transition={SPRING}
              className="group grid size-full rotate-45 place-items-center rounded-[18%] border border-line bg-white shadow-[0_14px_28px_-16px_rgba(11,44,107,0.45)] transition-[background-color,border-color,box-shadow] duration-300 hover:border-brand hover:bg-brand hover:shadow-[0_22px_40px_-16px_rgba(11,44,107,0.6)]"
            >
              <span className="flex w-[78%] -rotate-45 flex-col items-center gap-[0.5cqw] text-center">
                <Icon weight="duotone" className="size-[3.6cqw] text-brand transition-[color,scale] duration-300 group-hover:scale-110 group-hover:text-white" />
                <span className="text-[clamp(9px,1.35cqw,12.5px)] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(s.label)}</span>
              </span>
            </motion.a>
          </motion.div>
        );
      })}
    </div>
  );
}

function MobileDiamonds() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:hidden">
      {services(...LATTICE.map((l) => l.icon)).map((s, i) => {
        const Icon = SERVICE_ICONS[s.icon];
        return (
          <motion.a key={s.label.en} href={s.href} {...external(s.href)} {...pop(i)} className="group flex flex-col items-center gap-3 text-center">
            <span className="grid size-14 rotate-45 place-items-center rounded-xl border border-line bg-white shadow-sm transition-colors group-hover:border-brand group-hover:bg-brand">
              <Icon weight="duotone" className="size-6 -rotate-45 text-brand transition-colors group-hover:text-white" />
            </span>
            <span className="rounded px-1 text-[12px] font-medium leading-tight text-ink transition-colors group-hover:bg-brand group-hover:text-white">{t(s.label)}</span>
          </motion.a>
        );
      })}
    </div>
  );
}

function ExploreServices() {
  const { t } = useLang();
  return (
    <section className="relative mt-12 overflow-hidden bg-gradient-to-b from-[#f2f7ff] to-page py-12 md:mt-16 md:py-16">
      <PhotoBackdrop image={PHOTOS.headOffice} />
      <span className="pointer-events-none absolute -right-20 top-0 h-full w-[40%] bg-brand-soft/70 [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-site items-center gap-10 px-5 lg:grid-cols-[0.8fr_1.4fr] lg:px-8">
        <div>
          <Reveal>
            <h2 className="font-display text-[2rem] font-bold leading-tight text-navy md:text-[2.5rem]">
              {t(TEXT.explore)}
              <span className="block bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent">{t(TEXT.services)}</span>
            </h2>
            <p className="mt-2 max-w-xs text-[14.5px] text-muted">{t(TEXT.sub)}</p>
          </Reveal>
        </div>
        <div>
          <Lattice />
          <MobileDiamonds />
          <div className="mt-6 flex justify-end">
            <CtaButton href={`${SITE}/online-services`}>{t(TEXT.all)}</CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageLinkCard({ icon: IconCmp, title, href, image, links, delay }: { icon: Icon; title: Text; href: string; image: string; links: LinkItem[]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <Panel>
        <SectionHeader icon={IconCmp} title={title} href={href} linkLabel={TEXT.details} />
        <div className="grid gap-4 sm:grid-cols-[0.9fr_1fr]">
          <div className="group h-44 overflow-hidden sm:h-auto sm:[clip-path:polygon(0_0,100%_0,86%_100%,0_100%)]">
            <img src={asset(image)} alt="" loading="lazy" className="size-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-110 sm:rounded-none" />
          </div>
          <LinkList links={links} />
        </div>
      </Panel>
    </Reveal>
  );
}

function BuildingBanner() {
  const { t, lang } = useLang();
  const words = t(BUILDING).split(" ");
  const [from, to] = lang === "en" ? [2, 5] : [0, 4];
  return (
    <section className="relative mt-16 overflow-hidden border-t border-line bg-white md:mt-20">
      <motion.img
        src={asset(PHOTOS.flats)}
        alt=""
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.2, ease: EASE }}
        className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[64%] object-cover object-bottom md:block md:[mask-image:linear-gradient(to_right,transparent_0%,black_30%)]"
      />
      <span className="pointer-events-none absolute -left-16 top-0 h-full w-[38%] bg-brand-soft/70 [clip-path:polygon(0_0,100%_0,70%_100%,0_100%)]" aria-hidden />
      <div className="relative mx-auto max-w-site px-5 py-14 md:py-20 lg:px-8">
        <h2 key={lang} className="max-w-md font-display text-[1.8rem] font-bold leading-tight text-navy md:text-[2.2rem]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                initial={{ y: "105%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: EASE }}
                className={cn("inline-block", i >= from && i <= to && "text-brand")}
              >
                {w}
              </motion.span>
              {"\u00a0"}
            </span>
          ))}
        </h2>
        <CtaButton href={ABOUT.href} className="mt-6">
          {t(ABOUT.cta)}
        </CtaButton>
      </div>
    </section>
  );
}

export function GeometricSections() {
  const { t } = useLang();
  return (
    <>
      <ExploreServices />
      <Container className="md:pt-12">
        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <Reveal>
            <Announcements limit={4} />
          </Reveal>
          <Reveal delay={0.08}>
            <NewsList />
          </Reveal>
        </div>
      </Container>
      <Container className="pt-6 md:pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ImageLinkCard icon={MapTrifold} title={TEXT.layouts} href={`${SITE}/bda-layout`} image={PHOTOS.layoutBoard} links={LAYOUT_LINKS} delay={0} />
          <ImageLinkCard icon={Desktop} title={TEXT.online} href={`${SITE}/online-services`} image={PHOTOS.villa} links={ONLINE_SERVICES.slice(0, 5)} delay={0.08} />
        </div>
      </Container>
      <Container>
        <Reveal>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-navy md:text-xl">
            <LinkSimple weight="duotone" className="size-6 text-brand" />
            {t(TEXT.quick)}
          </h2>
        </Reveal>
        <IconRow stacked className="sm:grid-cols-4 lg:grid-cols-7" items={services("commissioner", "business", "formed", "south", "flats", "gallery", "jcc")} />
      </Container>
      <BuildingBanner />
    </>
  );
}
