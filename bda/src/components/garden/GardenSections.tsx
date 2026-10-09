import {
  ArrowRight,
  Calculator,
  ChartLineUp,
  CreditCard,
  Database,
  Desktop,
  FileText,
  HouseLine,
  Leaf,
  MagnifyingGlass,
  MapPinArea,
  MapTrifold,
  Megaphone,
  NotePencil,
  Phone,
  SquaresFour,
  TreeStructure,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Assets, ImportantLinks, Updates } from "@/components/civic/CivicSections";
import { DotGrid, EdgeCurl, Fern, SoftHills, SoftLeaf, WaveBand } from "@/components/garden/GardenDecor";
import { LeafShape } from "@/components/garden/GardenHero";
import { Container, EASE } from "@/components/home/shared";
import { SitemapCallout } from "@/components/portal/SitemapCallout";
import { HIGHLIGHTS, ONLINE_SERVICES, ORG, SERVICES, type ServiceIcon } from "@/lib/content";
import { AREAS, INITIATIVES, type AreaKey } from "@/lib/ia";
import { useLang, type Text } from "@/lib/i18n";
import { cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });
const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!;
const area = (key: AreaKey) => AREAS.find((a) => a.key === key)!;
const highlight = (key: (typeof HIGHLIGHTS)[number]["key"]) => HIGHLIGHTS.find((h) => h.key === key)!;
const online = (icon: (typeof ONLINE_SERVICES)[number]["icon"]) => ONLINE_SERVICES.find((s) => s.icon === icon)!;

const TEXT = {
  quick: t2("Quick Citizen Services", "ತ್ವರಿತ ನಾಗರಿಕ ಸೇವೆಗಳು"),
  quickSub: t2("Easier access to the services you use most", "ನೀವು ಹೆಚ್ಚು ಬಳಸುವ ಸೇವೆಗಳಿಗೆ ಸುಲಭ ಪ್ರವೇಶ"),
  explore: t2("Explore BDA", "ಬಿಡಿಎ ಅನ್ವೇಷಿಸಿ"),
  exploreSub: t2("Find information and access services across BDA's key areas", "ಬಿಡಿಎಯ ಪ್ರಮುಖ ವಿಭಾಗಗಳಲ್ಲಿ ಮಾಹಿತಿ ಮತ್ತು ಸೇವೆಗಳನ್ನು ಪಡೆಯಿರಿ"),
  allServices: t2("View All Services", "ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ನೋಡಿ"),
  initiatives: t2("Current Initiatives", "ಪ್ರಸ್ತುತ ಉಪಕ್ರಮಗಳು"),
  initiativesSub: t2("Key initiatives for a sustainable and inclusive Bengaluru", "ಸುಸ್ಥಿರ ಮತ್ತು ಒಳಗೊಳ್ಳುವ ಬೆಂಗಳೂರಿಗಾಗಿ ಪ್ರಮುಖ ಉಪಕ್ರಮಗಳು"),
  allInitiatives: t2("View All Initiatives", "ಎಲ್ಲಾ ಉಪಕ್ರಮಗಳನ್ನು ನೋಡಿ"),
};

const reveal = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } };
const stagger = (gap = 0.08) => ({
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, margin: "-50px" },
  variants: { show: { transition: { staggerChildren: gap } } },
});

function PillLink({ label, href, to }: { label: Text; href?: string; to?: string }) {
  const { t } = useLang();
  const cls =
    "group inline-flex shrink-0 items-center gap-2 rounded-full border border-white bg-white/85 py-1 pl-4 pr-1 text-[12.5px] font-semibold text-navy shadow-sm backdrop-blur transition-colors hover:border-brand hover:bg-brand hover:text-white";
  const body = (
    <>
      {t(label)}
      <span className="grid size-7 place-items-center rounded-full bg-navy text-white transition-transform group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-brand">
        <ArrowRight weight="bold" className="size-3.5" />
      </span>
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <a href={href} {...external(href ?? "")} className={cls}>
      {body}
    </a>
  );
}

const QUICK: { icon: Icon; label: Text; href: string; tone: string }[] = [
  { icon: Desktop, label: svc("online").label, href: svc("online").href, tone: "bg-blue-100 text-blue-600" },
  { icon: Calculator, label: svc("calculator").label, href: svc("calculator").href, tone: "bg-emerald-100 text-emerald-600" },
  { icon: CreditCard, label: svc("tax").label, href: svc("tax").href, tone: "bg-fuchsia-100 text-fuchsia-600" },
  { icon: NotePencil, label: t2("Raise Grievance", "ದೂರು ಸಲ್ಲಿಸಿ"), href: highlight("grievance").href, tone: "bg-violet-100 text-violet-600" },
  { icon: MagnifyingGlass, label: t2("Application Tracking", "ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ"), href: online("sakala").href, tone: "bg-orange-100 text-orange-600" },
  { icon: MapPinArea, label: svc("map").label, href: svc("map").href, tone: "bg-teal-100 text-teal-600" },
  { icon: Database, label: svc("cdrms").label, href: svc("cdrms").href, tone: "bg-sky-100 text-sky-600" },
];

function QuickServices() {
  const { t } = useLang();
  const helpline = highlight("helpline");
  return (
    <Container className="pt-8 md:pt-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative grid items-center gap-5 overflow-hidden rounded-[28px] border border-white bg-white/65 p-5 shadow-[0_20px_50px_-30px_rgba(11,44,107,0.4)] backdrop-blur-md lg:grid-cols-[230px_minmax(0,1fr)]"
      >
        <LeafShape className="-left-2 top-2 w-10 -rotate-[40deg]" delay={0.4} />
        <div className="relative pl-8">
          <h2 className="font-display text-xl font-bold leading-tight text-navy md:text-[1.6rem]">{t(TEXT.quick)}</h2>
          <p className="mt-1 text-[12.5px] text-muted">{t(TEXT.quickSub)}</p>
        </div>
        <motion.ul {...stagger(0.05)} className="grid grid-cols-4 gap-1 sm:grid-cols-8">
          {QUICK.map((q) => (
            <motion.li key={q.label.en} variants={reveal}>
              <a href={q.href} {...external(q.href)} className="group flex h-full flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center transition-colors duration-300 hover:bg-brand">
                <span className={cn("grid size-14 place-items-center rounded-full shadow-sm ring-4 ring-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white group-hover:ring-white/30", q.tone)}>
                  <q.icon weight="duotone" className="size-6" />
                </span>
                <span className="text-[11.5px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(q.label)}</span>
              </a>
            </motion.li>
          ))}
          <motion.li variants={reveal}>
            <a href={helpline.href} className="group flex h-full flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center transition-colors duration-300 hover:bg-brand">
              <motion.span
                animate={{ rotate: [0, -12, 10, -6, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2.5 }}
                className="grid size-14 place-items-center rounded-full bg-rose-100 text-rose-500 shadow-sm ring-4 ring-white group-hover:bg-white/20 group-hover:text-white group-hover:ring-white/30"
              >
                <Phone weight="fill" className="size-6" />
              </motion.span>
              <span className="text-[11.5px] font-bold leading-tight text-navy group-hover:text-white">
                {t(helpline.title)}
                <span className="block whitespace-nowrap text-[10.5px] text-rose-600 group-hover:text-white sm:text-[11.5px]">{ORG.helpline}</span>
              </span>
            </a>
          </motion.li>
        </motion.ul>
      </motion.div>
    </Container>
  );
}

const EXPLORE: { key: AreaKey; icon: Icon; title: Text; desc: Text; card: string; dot: string }[] = [
  { key: "services", icon: SquaresFour, title: t2("Services", "ಸೇವೆಗಳು"), desc: t2("Apply, Pay, Track and Access Citizen Services", "ಅರ್ಜಿ, ಪಾವತಿ, ಸ್ಥಿತಿ ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳು"), card: "from-blue-100/90 to-blue-50/60 text-blue-700", dot: "bg-blue-600" },
  { key: "property", icon: HouseLine, title: t2("Property & Land", "ಆಸ್ತಿ ಮತ್ತು ಭೂಮಿ"), desc: t2("Layouts, Sites, E-Auction, Flats/Villas and BDA Properties", "ಬಡಾವಣೆಗಳು, ನಿವೇಶನಗಳು, ಇ-ಹರಾಜು, ಫ್ಲ್ಯಾಟ್/ವಿಲ್ಲಾ ಮತ್ತು ಬಿಡಿಎ ಆಸ್ತಿಗಳು"), card: "from-emerald-100/90 to-emerald-50/60 text-emerald-700", dot: "bg-emerald-600" },
  { key: "departments", icon: TreeStructure, title: t2("Departments", "ವಿಭಾಗಗಳು"), desc: t2("BDA Departments, Functions, Offices and Contacts", "ಬಿಡಿಎ ವಿಭಾಗಗಳು, ಕಾರ್ಯಗಳು, ಕಚೇರಿಗಳು ಮತ್ತು ಸಂಪರ್ಕ"), card: "from-violet-100/90 to-violet-50/60 text-violet-700", dot: "bg-violet-600" },
  { key: "planning", icon: MapTrifold, title: t2("Planning & Development", "ಯೋಜನೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ"), desc: t2("Jurisdiction Map, Bengaluru Business Corridor, Projects", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ, ಬೆಂಗಳೂರು ಬಿಸಿನೆಸ್ ಕಾರಿಡಾರ್, ಯೋಜನೆಗಳು"), card: "from-amber-100/90 to-amber-50/60 text-amber-700", dot: "bg-amber-500" },
  { key: "information", icon: FileText, title: t2("Information & Resources", "ಮಾಹಿತಿ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು"), desc: t2("RTI, Forms, Notifications, Documents, Maps and Gallery", "ಆರ್‌ಟಿಐ, ನಮೂನೆಗಳು, ಅಧಿಸೂಚನೆಗಳು, ದಾಖಲೆಗಳು, ನಕ್ಷೆಗಳು ಮತ್ತು ಗ್ಯಾಲರಿ"), card: "from-rose-100/90 to-rose-50/60 text-rose-700", dot: "bg-rose-500" },
  { key: "news", icon: Megaphone, title: t2("News & Updates", "ಸುದ್ದಿ ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳು"), desc: t2("Latest News, Press Releases, Events and Announcements", "ಇತ್ತೀಚಿನ ಸುದ್ದಿ, ಮಾಧ್ಯಮ ಪ್ರಕಟಣೆಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಪ್ರಕಟಣೆಗಳು"), card: "from-sky-100/90 to-sky-50/60 text-sky-700", dot: "bg-sky-600" },
];

function CardSkyline() {
  return (
    <svg viewBox="0 0 120 50" className="pointer-events-none absolute bottom-0 right-0 h-14 w-32 opacity-[0.13]" fill="currentColor" aria-hidden>
      <rect x="4" y="22" width="14" height="28" />
      <rect x="22" y="8" width="12" height="42" />
      <rect x="38" y="28" width="16" height="22" />
      <rect x="58" y="14" width="10" height="36" />
      <rect x="72" y="30" width="18" height="20" />
      <rect x="94" y="4" width="12" height="46" />
      <rect x="108" y="24" width="10" height="26" />
    </svg>
  );
}

const SLANT = "[clip-path:polygon(0_16px,100%_0,100%_calc(100%-16px),0_100%)]";

function ExploreBda() {
  const { t } = useLang();
  return (
    <Container className="pt-12 md:pt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-display text-2xl font-bold text-navy md:text-[2rem]"
          >
            {t(TEXT.explore)}
          </motion.h2>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-muted">
            <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} className="h-0.5 w-6 origin-left rounded-full bg-rose-500" />
            {t(TEXT.exploreSub)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PillLink label={TEXT.allServices} href={svc("online").href} />
          <span className="hidden grid-cols-3 gap-1.5 md:grid" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="size-1 rounded-full bg-navy/25" />
            ))}
          </span>
        </div>
      </div>
      <motion.div {...stagger()} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {EXPLORE.map((e) => {
          const href = area(e.key).href;
          return (
            <motion.a
              key={e.key}
              href={href}
              {...external(href)}
              variants={reveal}
              whileHover={{ y: -8, rotate: -0.6 }}
              className="group block [filter:drop-shadow(0_14px_20px_rgba(11,44,107,0.13))]"
            >
              <div className={cn("relative flex min-h-[236px] flex-col bg-gradient-to-b px-4 pb-6 pt-7 transition-colors duration-300 group-hover:from-brand group-hover:to-brand", e.card, SLANT)}>
                <CardSkyline />
                <span className={cn("grid size-12 place-items-center rounded-full text-white shadow-md ring-4 ring-white/70 transition-all duration-500 group-hover:rotate-[-10deg] group-hover:bg-white/20", e.dot)}>
                  <e.icon weight="duotone" className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(e.title)}</h3>
                <p className="mt-1.5 text-[12px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(e.desc)}</p>
                <span className="relative mt-auto grid size-8 place-self-end place-items-center rounded-full bg-white text-brand shadow-sm transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight weight="bold" className="size-4" />
                </span>
              </div>
            </motion.a>
          );
        })}
      </motion.div>
    </Container>
  );
}

const INITIATIVE_STYLE: { icon: Icon; sub: Text; card: string; iconTone: string }[] = [
  { icon: Leaf, sub: t2("15 Lakh Planting Initiative for a Greener Bengaluru", "ಹಸಿರು ಬೆಂಗಳೂರಿಗಾಗಿ 15 ಲಕ್ಷ ಗಿಡ ನೆಡುವ ಉಪಕ್ರಮ"), card: "from-emerald-100/90 via-emerald-50/70 to-white/60", iconTone: "text-emerald-600" },
  { icon: HouseLine, sub: t2("Site Allotment and Project Information", "ನಿವೇಶನ ಹಂಚಿಕೆ ಮತ್ತು ಯೋಜನಾ ಮಾಹಿತಿ"), card: "from-violet-100/90 via-violet-50/70 to-white/60", iconTone: "text-violet-600" },
  { icon: ChartLineUp, sub: t2("Driving the Next Phase of Growth", "ಮುಂದಿನ ಹಂತದ ಬೆಳವಣಿಗೆಗೆ ಚಾಲನೆ"), card: "from-orange-100/90 via-orange-50/70 to-white/60", iconTone: "text-orange-600" },
  { icon: UsersThree, sub: t2("Public Interaction and Citizen Engagement", "ಸಾರ್ವಜನಿಕ ಸಂವಾದ ಮತ್ತು ನಾಗರಿಕ ಭಾಗವಹಿಸುವಿಕೆ"), card: "from-sky-100/90 via-sky-50/70 to-white/60", iconTone: "text-sky-600" },
];

function Initiatives() {
  const { t } = useLang();
  return (
    <Container className="relative pt-12 md:pt-14">
      <SoftLeaf className="-top-1 right-[30%] -z-10 hidden w-12 rotate-[35deg] md:block" tone="mint" opacity={0.55} delay={0.3} />
      <DotGrid className="right-[37%] top-16 -z-10 hidden md:grid" />
      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Leaf weight="duotone" className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-navy md:text-2xl">{t(TEXT.initiatives)}</h2>
          <p className="text-[13px] text-muted">{t(TEXT.initiativesSub)}</p>
        </div>
        <PillLink label={TEXT.allInitiatives} to="/sitemap" />
      </div>
      <motion.div {...stagger()} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 2, 1, 3].map((i) => {
          const it = INITIATIVES[i];
          const s = INITIATIVE_STYLE[i];
          return (
            <motion.a
              key={it.label.en}
              href={it.href}
              {...external(it.href)}
              variants={reveal}
              whileHover={{ y: -5 }}
              className={cn(
                "group relative flex items-start gap-3 overflow-hidden rounded-[26px] border border-white bg-gradient-to-br p-4 shadow-sm transition-colors duration-300 hover:border-brand hover:from-brand hover:via-brand hover:to-brand",
                s.card,
              )}
            >
              <span className="absolute right-4 top-3 flex gap-1 opacity-40" aria-hidden>
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1 rounded-full bg-navy group-hover:bg-white" />
                ))}
              </span>
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-full bg-white shadow-sm transition-all duration-500 group-hover:rotate-[-10deg] group-hover:bg-white/20 group-hover:text-white", s.iconTone)}>
                <s.icon weight="duotone" className="size-6" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col self-stretch">
                <span className="font-display text-[15px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(it.label)}</span>
                <span className="mt-1 text-[12px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(s.sub)}</span>
                <span className="mt-2 grid size-7 place-self-end place-items-center rounded-full bg-white text-brand shadow-sm transition-transform group-hover:translate-x-1">
                  <ArrowRight weight="bold" className="size-3.5" />
                </span>
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </Container>
  );
}

export function GardenSections() {
  return (
    <>
      <QuickServices />
      <SitemapCallout />
      <div className="relative">
        <WaveBand className="top-[34%] h-[72%]" />
        <ExploreBda />
      </div>
      <div className="relative">
        <Fern className="-left-3 top-0 -z-10 hidden w-16 lg:block xl:w-20" />
        <EdgeCurl className="-right-2 top-[30%] hidden h-80 w-28 lg:block" />
        <Initiatives />
      </div>
      <div className="relative">
        <WaveBand className="top-[8%] h-[40%]" tones={["#bae6fd", "#ddd6fe", "#fbcfe8"]} />
        <SoftHills className="h-72" />
        <Container className="pt-10 md:pt-12">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <Updates tagged />
            <Assets />
          </div>
        </Container>
        <ImportantLinks />
      </div>
    </>
  );
}
