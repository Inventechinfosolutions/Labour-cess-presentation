import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CreditCard,
  Desktop,
  FileText,
  Info,
  Leaf,
  MapPinArea,
  MapTrifold,
  NotePencil,
  Phone,
  RoadHorizon,
  Sparkle,
  TreeStructure,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Container, EASE } from "@/components/home/shared";
import { HIGHLIGHTS, NEWS, ORG, SERVICES, type ServiceIcon } from "@/lib/content";
import { AREAS, DEPARTMENT_GROUPS, INITIATIVES, type AreaKey, type IaLink } from "@/lib/ia";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const area = (key: AreaKey) => AREAS.find((a) => a.key === key)!;

function find(key: AreaKey, en: string): IaLink {
  const walk = (links: IaLink[]): IaLink | undefined => {
    for (const l of links) {
      if (l.label.en === en) return l;
      const hit = l.children && walk(l.children);
      if (hit) return hit;
    }
  };
  const hit = walk(area(key).items);
  if (!hit) throw new Error(`IA link not found: ${key} / ${en}`);
  return hit;
}

const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!;
const highlight = (key: (typeof HIGHLIGHTS)[number]["key"]) => HIGHLIGHTS.find((h) => h.key === key)!;

const TEXT = {
  needEyebrow: t2("Start here", "ಇಲ್ಲಿಂದ ಆರಂಭಿಸಿ"),
  need: t2("What do you need?", "ನಿಮಗೆ ಏನು ಬೇಕು?"),
  needSub: t2("Three simple paths to everything BDA offers citizens.", "ಬಿಡಿಎ ನಾಗರಿಕರಿಗೆ ನೀಡುವ ಎಲ್ಲದಕ್ಕೂ ಮೂರು ಸರಳ ಮಾರ್ಗಗಳು."),
  goTo: t2("Go to", "ಇಲ್ಲಿಗೆ ಹೋಗಿ:"),
  explore: t2("Explore BDA", "ಬಿಡಿಎ ಅನ್ವೇಷಿಸಿ"),
  exploreSub: t2("Learn how BDA is organised and what it is building.", "ಬಿಡಿಎ ಸಂಘಟನೆ ಮತ್ತು ಅದರ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ."),
  sitemap: t2("View full sitemap", "ಸಂಪೂರ್ಣ ಸೈಟ್‌ಮ್ಯಾಪ್ ನೋಡಿ"),
  initiatives: t2("Current Initiatives", "ಪ್ರಸ್ತುತ ಉಪಕ್ರಮಗಳು"),
  initiativesSub: t2("Flagship programmes shaping the city today.", "ಇಂದು ನಗರವನ್ನು ರೂಪಿಸುತ್ತಿರುವ ಪ್ರಮುಖ ಕಾರ್ಯಕ್ರಮಗಳು."),
  initiative: t2("Initiative", "ಉಪಕ್ರಮ"),
};

export function PortalHeading({ eyebrow, title, sub, action }: { eyebrow?: Text; title: Text; sub?: Text; action?: ReactNode }) {
  const { t } = useLang();
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand"
          >
            {t(eyebrow)}
          </motion.p>
        )}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-1 font-display text-2xl font-bold text-navy md:text-[1.9rem]"
        >
          {t(title)}
        </motion.h2>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          className="mt-2 block h-1 w-12 origin-left rounded-full bg-brand-bright"
        />
        {sub && <p className="mt-3 max-w-xl text-sm text-muted">{t(sub)}</p>}
      </div>
      {action}
    </div>
  );
}

function SitemapLink({ className }: { className?: string }) {
  const { t } = useLang();
  return (
    <Link
      to="/sitemap"
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-brand/30 px-4 py-2 text-[13px] font-semibold text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white",
        className,
      )}
    >
      <TreeStructure weight="bold" />
      {t(TEXT.sitemap)}
      <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

const PATHS: { key: AreaKey; icon: Icon; title: Text; sub: Text; links: IaLink[] }[] = [
  {
    key: "services",
    icon: Desktop,
    title: t2("Services", "ಸೇವೆಗಳು"),
    sub: t2("Apply, pay, track and get help online.", "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅರ್ಜಿ, ಪಾವತಿ, ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಹಾಯ."),
    links: [find("services", "Online Services"), find("services", "Pay Property Tax"), find("services", "Track Application"), find("services", "Grievances")],
  },
  {
    key: "property",
    icon: MapTrifold,
    title: t2("Property & Land", "ಆಸ್ತಿ ಮತ್ತು ಭೂಮಿ"),
    sub: t2("Find layouts, sites, auctions and homes.", "ಬಡಾವಣೆಗಳು, ನಿವೇಶನಗಳು, ಹರಾಜು ಮತ್ತು ಮನೆಗಳನ್ನು ಹುಡುಕಿ."),
    links: [find("property", "E-Auction"), find("property", "BDA Layouts"), find("property", "Flats / Villas"), find("property", "Stray Sites")],
  },
  {
    key: "information",
    icon: Info,
    title: t2("Information", "ಮಾಹಿತಿ"),
    sub: t2("Find RTI, forms, notices, documents and maps.", "ಆರ್‌ಟಿಐ, ನಮೂನೆಗಳು, ಸೂಚನೆಗಳು, ದಾಖಲೆಗಳು ಮತ್ತು ನಕ್ಷೆಗಳು."),
    links: [find("information", "RTI"), find("information", "Notifications"), find("information", "Tenders"), find("information", "Maps")],
  },
];

function NeedPaths() {
  const { t } = useLang();
  return (
    <Container>
      <PortalHeading eyebrow={TEXT.needEyebrow} title={TEXT.need} sub={TEXT.needSub} />
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="grid gap-5 md:grid-cols-3"
      >
        {PATHS.map((p, i) => {
          const a = area(p.key);
          return (
            <motion.article
              key={p.key}
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(11,44,107,0.45)]"
            >
              <a href={a.href} {...external(a.href)} className="relative block overflow-hidden px-6 pb-5 pt-6 text-navy transition-colors duration-300 hover:text-white">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-br from-brand to-navy transition-transform duration-500 ease-out group-hover:scale-y-100" aria-hidden />
                <span className="relative flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition-all duration-500 group-hover:rotate-[-8deg] group-hover:bg-white/15 group-hover:text-white">
                    <p.icon weight="duotone" className="size-8" />
                  </span>
                  <span className="font-display text-4xl font-bold text-brand/10 transition-colors group-hover:text-white/20">0{i + 1}</span>
                </span>
                <span className="relative mt-4 block font-display text-xl font-bold group-hover:text-white">{t(p.title)}</span>
                <span className="relative mt-1 block text-[13.5px] text-muted transition-colors group-hover:text-white/80">{t(p.sub)}</span>
              </a>
              <ul className="flex-1 space-y-0.5 px-3 pb-3 pt-2">
                {p.links.map((l) => (
                  <li key={l.label.en}>
                    <a
                      href={l.href}
                      {...external(l.href)}
                      className="group/link flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium text-ink transition-colors hover:bg-brand hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-brand-bright transition-colors group-hover/link:bg-white" />
                        {t(l.label)}
                      </span>
                      <ArrowRight weight="bold" className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={a.href}
                {...external(a.href)}
                className="mx-3 mb-3 flex items-center justify-center gap-1.5 rounded-xl bg-page py-2.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                {t(TEXT.goTo)} {t(p.title)}
                <ArrowRight weight="bold" />
              </a>
            </motion.article>
          );
        })}
      </motion.div>
    </Container>
  );
}

function OrgMini() {
  const { t } = useLang();
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 px-3">
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="rounded-md bg-navy px-3 py-1 text-[11px] font-bold tracking-wide text-white ring-2 ring-white"
      >
        BDA
      </motion.span>
      <svg viewBox="0 0 200 16" className="h-4 w-[86%] text-brand/50 group-hover:text-white/60" aria-hidden>
        <motion.path
          d="M100 0 V8 M25 16 V8 H175 V16 M75 8 V16 M125 8 V16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.9, ease: "easeInOut" }}
        />
      </svg>
      <div className="grid w-full grid-cols-4 gap-1.5">
        {DEPARTMENT_GROUPS.map((g, i) => (
          <motion.span
            key={g.key}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="rounded-md border border-brand/20 bg-white px-1 py-1.5 text-center text-[9.5px] font-semibold leading-tight text-navy"
          >
            {t(g.label)}
            <span className="mt-0.5 block text-[9px] font-medium text-muted">{g.departments.length}</span>
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function NewsTicker() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % NEWS.length), 3200);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-4">
      {[0, 1, 2].map((k) => {
        const n = NEWS[(i + k) % NEWS.length];
        return (
          <motion.div
            key={`${lang}-${(i + k) % NEWS.length}`}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: k === 0 ? 1 : 0.55, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={cn("rounded-lg bg-white px-3 py-1.5 shadow-sm", k === 0 && "ring-1 ring-brand/30")}
          >
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-brand">{t(n.kind)}</p>
            <p className="line-clamp-1 text-[11.5px] font-medium text-ink">{t(n.title)}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

const EXPLORE: { key: AreaKey; visual: ReactNode; tint: string }[] = [
  { key: "about", tint: "from-[#e8f0ff]", visual: <img src={asset(PHOTOS.headOffice)} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" /> },
  { key: "departments", tint: "from-[#eaf6ff]", visual: <OrgMini /> },
  { key: "planning", tint: "from-[#eefaf3]", visual: <img src={asset(PHOTOS.layoutBoard)} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" /> },
  { key: "news", tint: "from-[#fff5e8]", visual: <NewsTicker /> },
];

function ExploreBda() {
  const { t } = useLang();
  return (
    <Container>
      <PortalHeading title={TEXT.explore} sub={TEXT.exploreSub} action={<SitemapLink />} />
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {EXPLORE.map(({ key, visual, tint }) => {
          const a = area(key);
          return (
            <motion.a
              key={key}
              href={a.href}
              {...external(a.href)}
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
              whileHover={{ y: -6 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-colors duration-300 hover:border-brand hover:bg-brand hover:shadow-[0_24px_48px_-24px_rgba(11,44,107,0.55)]"
            >
              <div className={cn("bg-gradient-to-b to-transparent px-5 pb-3 pt-5 transition-colors", tint, "group-hover:from-transparent")}>
                <span className="grid size-12 place-items-center rounded-full bg-white text-brand shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-10deg]">
                  <a.icon weight="duotone" className="size-6" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-navy transition-colors group-hover:text-white">{t(a.label)}</h3>
                <p className="mt-1 min-h-[2.6rem] text-[13px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(a.blurb)}</p>
              </div>
              <div className="relative mx-4 h-36 overflow-hidden rounded-xl bg-page">{visual}</div>
              <span className="flex items-center justify-between px-5 py-3.5 text-[13px] font-semibold text-brand transition-colors group-hover:text-white">
                {t(a.label)}
                <span className="grid size-8 place-items-center rounded-full bg-brand-soft transition-all group-hover:translate-x-1 group-hover:bg-white group-hover:text-brand">
                  <ArrowRight weight="bold" />
                </span>
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </Container>
  );
}

const UTILITIES: { icon: Icon; label: Text; sub?: string; href: string }[] = [
  { icon: Phone, label: highlight("helpline").title, sub: ORG.helpline, href: highlight("helpline").href },
  { icon: NotePencil, label: t2("Raise Grievance", "ದೂರು ಸಲ್ಲಿಸಿ"), href: highlight("grievance").href },
  { icon: Desktop, label: svc("online").label, href: svc("online").href },
  { icon: Calculator, label: svc("calculator").label, href: svc("calculator").href },
  { icon: CreditCard, label: svc("tax").label, href: svc("tax").href },
  { icon: MapPinArea, label: svc("map").label, href: svc("map").href },
  { icon: FileText, label: t2("RTI Information", "ಆರ್‌ಟಿಐ ಮಾಹಿತಿ"), href: svc("rti").href },
];

function UtilityStrip() {
  const { t } = useLang();
  return (
    <Container className="pt-10 md:pt-12">
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-sm sm:grid-cols-4 lg:grid-cols-7"
      >
        {UTILITIES.map((u, i) => (
          <motion.li
            key={u.label.en}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            className={cn(i === 0 && "col-span-2 sm:col-span-1")}
          >
            <a
              href={u.href}
              {...external(u.href)}
              className="group flex h-full items-center gap-3 bg-white px-4 py-4 transition-colors duration-300 hover:bg-brand lg:flex-col lg:justify-center lg:gap-2 lg:text-center"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white">
                <u.icon weight="duotone" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(u.label)}</span>
                {u.sub && <span className="mt-0.5 block text-[12px] font-bold text-brand transition-colors group-hover:text-white/90">{u.sub}</span>}
              </span>
            </a>
          </motion.li>
        ))}
      </motion.ul>
    </Container>
  );
}

const INITIATIVE_VISUALS: { icon: Icon; sub: Text; image?: string; gradient: string }[] = [
  { icon: Leaf, sub: highlight("green").sub, gradient: "from-emerald-500 to-emerald-700" },
  { icon: MapTrifold, sub: t2("Site allotment applications open", "ನಿವೇಶನ ಹಂಚಿಕೆ ಅರ್ಜಿಗಳು ತೆರೆದಿವೆ"), image: PHOTOS.layoutSigns, gradient: "from-brand to-navy" },
  { icon: RoadHorizon, sub: t2("Formerly the Peripheral Ring Road project", "ಹಿಂದಿನ ಪೆರಿಫೆರಲ್ ರಿಂಗ್ ರಸ್ತೆ ಯೋಜನೆ"), gradient: "from-sky-500 to-brand" },
  { icon: UsersThree, sub: t2("Citizen interaction, view the invitee list", "ನಾಗರಿಕ ಸಂವಾದ, ಆಹ್ವಾನಿತರ ಪಟ್ಟಿ ನೋಡಿ"), gradient: "from-amber-500 to-orange-600" },
];

function Initiatives() {
  const { t } = useLang();
  return (
    <Container>
      <PortalHeading eyebrow={TEXT.initiative} title={TEXT.initiatives} sub={TEXT.initiativesSub} />
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {INITIATIVES.map((it, i) => {
          const v = INITIATIVE_VISUALS[i];
          return (
            <motion.a
              key={it.label.en}
              href={it.href}
              {...external(it.href)}
              variants={{ hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } } }}
              whileHover={{ y: -5 }}
              className="group relative flex min-h-[148px] overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-colors duration-300 hover:border-brand hover:bg-brand"
            >
              <div className="relative z-10 flex flex-1 flex-col p-4 pr-2">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand transition-colors group-hover:bg-white/20 group-hover:text-white">
                  <Sparkle weight="fill" className="size-3" />
                  {t(TEXT.initiative)}
                </span>
                <h3 className="mt-2 font-display text-[15px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(it.label)}</h3>
                <p className="mt-1 text-[12px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(v.sub)}</p>
                <ArrowUpRight weight="bold" className="mt-auto size-4 text-brand transition-all group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:text-white" />
              </div>
              <div className={cn("relative w-[38%] shrink-0 overflow-hidden bg-gradient-to-br", v.gradient)}>
                {v.image ? (
                  <img src={asset(v.image)} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <>
                    <span className="absolute -right-6 -top-6 size-24 rounded-full bg-white/15" aria-hidden />
                    <span className="absolute -bottom-8 -left-4 size-20 rounded-full bg-white/10" aria-hidden />
                    <v.icon weight="duotone" className="absolute inset-0 m-auto size-14 text-white transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110" />
                  </>
                )}
              </div>
            </motion.a>
          );
        })}
      </motion.div>
    </Container>
  );
}

export function PortalSections() {
  return (
    <>
      <NeedPaths />
      <ExploreBda />
      <UtilityStrip />
      <Initiatives />
    </>
  );
}
