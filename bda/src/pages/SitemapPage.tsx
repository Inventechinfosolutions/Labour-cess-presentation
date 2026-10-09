import {
  ArrowSquareOut,
  ArrowsInSimple,
  ArrowsOutSimple,
  CaretDown,
  House,
  MagnifyingGlass,
  Sparkle,
  TreeStructure,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { EASE } from "@/components/home/shared";
import { PortalHeading } from "@/components/portal/PortalSections";
import { ORG } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { AREAS, DEPARTMENT_GROUPS, IA_STATS, INITIATIVES, UTILITY, ZONES, type IaArea, type IaLink } from "@/lib/ia";
import { useLang, type Text } from "@/lib/i18n";
import { cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  eyebrow: t2("Proposed information architecture", "ಪ್ರಸ್ತಾವಿತ ಮಾಹಿತಿ ರಚನೆ"),
  title: t2("BDA Website Sitemap", "ಬಿಡಿಎ ಜಾಲತಾಣ ಸೈಟ್‌ಮ್ಯಾಪ್"),
  sub: t2(
    "The complete new structure: seven primary areas, a utility layer and homepage initiatives. Pages marked New are proposed and currently link to the closest live page.",
    "ಸಂಪೂರ್ಣ ಹೊಸ ರಚನೆ: ಏಳು ಪ್ರಮುಖ ವಿಭಾಗಗಳು, ಉಪಯುಕ್ತ ಪದರ ಮತ್ತು ಮುಖಪುಟದ ಉಪಕ್ರಮಗಳು. ಹೊಸ ಎಂದು ಗುರುತಿಸಿದ ಪುಟಗಳು ಪ್ರಸ್ತಾವಿತವಾಗಿದ್ದು, ಸದ್ಯಕ್ಕೆ ಹತ್ತಿರದ ಲೈವ್ ಪುಟಕ್ಕೆ ಲಿಂಕ್ ಆಗಿವೆ.",
  ),
  areas: t2("Primary areas", "ಪ್ರಮುಖ ವಿಭಾಗಗಳು"),
  pages: t2("Pages in total", "ಒಟ್ಟು ಪುಟಗಳು"),
  live: t2("Live today", "ಈಗ ಲಭ್ಯ"),
  fresh: t2("New pages", "ಹೊಸ ಪುಟಗಳು"),
  search: t2("Filter pages, e.g. auction, tax, RTI", "ಪುಟಗಳನ್ನು ಹುಡುಕಿ, ಉದಾ. ಹರಾಜು, ತೆರಿಗೆ, ಆರ್‌ಟಿಐ"),
  onlyNew: t2("Only new pages", "ಹೊಸ ಪುಟಗಳು ಮಾತ್ರ"),
  expand: t2("Expand all", "ಎಲ್ಲಾ ತೆರೆಯಿರಿ"),
  collapse: t2("Collapse all", "ಎಲ್ಲಾ ಮುಚ್ಚಿ"),
  legendLive: t2("Live page", "ಲೈವ್ ಪುಟ"),
  legendNew: t2("New page (proposed)", "ಹೊಸ ಪುಟ (ಪ್ರಸ್ತಾವಿತ)"),
  isNew: t2("New", "ಹೊಸ"),
  home: t2("Home", "ಮುಖಪುಟ"),
  utility: t2("Utility layer, on every page", "ಉಪಯುಕ್ತ ಪದರ, ಪ್ರತಿ ಪುಟದಲ್ಲಿ"),
  initiatives: t2("Current Initiatives, featured on the homepage", "ಪ್ರಸ್ತುತ ಉಪಕ್ರಮಗಳು, ಮುಖಪುಟದಲ್ಲಿ"),
  noMatch: t2("No pages match this filter.", "ಈ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಪುಟಗಳಿಲ್ಲ."),
  orgEyebrow: t2("Departments", "ವಿಭಾಗಗಳು"),
  org: t2("How BDA is organised", "ಬಿಡಿಎ ಸಂಘಟನೆ"),
  orgSub: t2("Departments grouped by function, with zonal and project offices.", "ಕಾರ್ಯದ ಆಧಾರದಲ್ಲಿ ವಿಭಾಗಗಳು, ವಲಯ ಮತ್ತು ಯೋಜನಾ ಕಚೇರಿಗಳೊಂದಿಗೆ."),
  zones: t2("Zones & Project Offices", "ವಲಯಗಳು ಮತ್ತು ಯೋಜನಾ ಕಚೇರಿಗಳು"),
  seeHome: t2("See it on the Design 7 homepage", "ವಿನ್ಯಾಸ 7 ಮುಖಪುಟದಲ್ಲಿ ನೋಡಿ"),
  pagesIn: t2("pages", "ಪುಟಗಳು"),
};

const keyOf = (path: string, l: IaLink) => `${path}/${l.label.en}`;

function filterLinks(links: IaLink[], match: (l: IaLink) => boolean, onlyNew: boolean): IaLink[] {
  return links.flatMap((l) => {
    const kids = l.children ? filterLinks(l.children, match, onlyNew) : [];
    if (kids.length) return [{ ...l, children: kids }];
    if (match(l)) return [{ ...l, children: onlyNew ? undefined : l.children }];
    return [];
  });
}

const countAll = (links: IaLink[]): number => links.reduce((n, l) => n + 1 + (l.children ? countAll(l.children) : 0), 0);

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-amber-200 px-0.5 text-ink">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function NewBadge() {
  const { t } = useLang();
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-dashed border-amber-500 bg-amber-50 px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wide text-amber-700 group-hover:border-white group-hover:bg-white/20 group-hover:text-white">
      <Sparkle weight="fill" className="size-2.5" />
      {t(TEXT.isNew)}
    </span>
  );
}

function TreeList({
  links,
  path,
  query,
  forceOpen,
  closed,
  toggle,
  depth = 0,
}: {
  links: IaLink[];
  path: string;
  query: string;
  forceOpen: boolean;
  closed: Set<string>;
  toggle: (k: string) => void;
  depth?: number;
}) {
  const { t } = useLang();
  return (
    <ul className={cn(depth > 0 && "ml-3 border-l-2 border-dashed border-brand/20 pl-3")}>
      {links.map((l) => {
        const k = keyOf(path, l);
        const open = forceOpen || !closed.has(k);
        return (
          <li key={k} className="relative">
            {depth > 0 && <span className="absolute -left-3 top-[15px] h-0.5 w-2.5 bg-brand/20" aria-hidden />}
            <div className="flex items-center gap-1">
              <a
                href={l.href}
                {...external(l.href)}
                className="group flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink transition-colors hover:bg-brand hover:text-white"
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    l.isNew ? "border-2 border-dashed border-amber-500 group-hover:border-white" : "bg-brand group-hover:bg-white",
                  )}
                />
                <span className={cn("min-w-0 flex-1", l.children && "font-semibold text-navy group-hover:text-white")}>
                  <Highlight text={t(l.label)} query={query} />
                </span>
                {l.isNew && <NewBadge />}
                <ArrowSquareOut className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              {l.children && (
                <button
                  onClick={() => toggle(k)}
                  aria-expanded={open}
                  aria-label={t(l.label)}
                  className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  {l.children.length}
                  <CaretDown weight="bold" className={cn("size-3 transition-transform duration-300", open && "rotate-180")} />
                </button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {l.children && open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <TreeList links={l.children} path={k} query={query} forceOpen={forceOpen} closed={closed} toggle={toggle} depth={depth + 1} />
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

function AreaCard({
  area,
  links,
  index,
  query,
  forceOpen,
  closed,
  toggle,
}: {
  area: IaArea;
  links: IaLink[];
  index: number;
  query: string;
  forceOpen: boolean;
  closed: Set<string>;
  toggle: (k: string) => void;
}) {
  const { t } = useLang();
  const total = countAll(area.items);
  return (
    <motion.section
      id={`area-${area.key}`}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: EASE }}
      className="scroll-mt-24 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-white shadow-sm"
    >
      <a
        href={area.href}
        {...external(area.href)}
        className="group flex items-start gap-3 bg-gradient-to-br from-brand-soft to-white px-4 py-4 transition-colors duration-300 hover:from-brand hover:to-brand"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm transition-transform duration-500 group-hover:rotate-[-8deg]">
          <area.icon weight="duotone" className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="font-display text-[16px] font-bold text-navy group-hover:text-white">
              <span className="mr-1.5 text-brand/50 group-hover:text-white/60">{String(index + 1).padStart(2, "0")}</span>
              {t(area.label)}
            </span>
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10.5px] font-bold text-brand">
              {total} {t(TEXT.pagesIn)}
            </span>
          </span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-muted group-hover:text-white/80">{t(area.blurb)}</span>
        </span>
      </a>
      <div className="px-2 py-2">
        <TreeList links={links} path={area.key} query={query} forceOpen={forceOpen} closed={closed} toggle={toggle} />
      </div>
    </motion.section>
  );
}

function OrgMap() {
  const { t } = useLang();
  return (
    <section className="mx-auto max-w-site px-5 pt-14 lg:px-8">
      <PortalHeading eyebrow={TEXT.orgEyebrow} title={TEXT.org} sub={TEXT.orgSub} />
      <div className="rounded-3xl border border-line bg-white p-5 shadow-sm md:p-8">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="rounded-2xl bg-gradient-to-br from-navy to-brand px-6 py-3 text-center text-white shadow-lg"
          >
            <p className="font-display text-base font-bold">{t(ORG.name)}</p>
            <p className="text-[11px] text-white/75">{t(ORG.govt)}</p>
          </motion.div>
        </div>
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mx-auto h-6 w-0.5 origin-top bg-brand/30"
          aria-hidden
        />
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
          className="mx-auto hidden h-0.5 w-3/4 bg-brand/30 lg:block"
          aria-hidden
        />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.8 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {DEPARTMENT_GROUPS.map((g) => (
            <motion.div key={g.key} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="relative lg:pt-6">
              <span className="absolute left-1/2 top-0 hidden h-6 w-0.5 bg-brand/30 lg:block" aria-hidden />
              <div className="h-full overflow-hidden rounded-2xl border border-line">
                <p className="bg-brand-soft px-4 py-2.5 text-center font-display text-[14px] font-bold text-navy">{t(g.label)}</p>
                <ul className="space-y-0.5 p-2">
                  {g.departments.map((d) => (
                    <li key={d.label.en}>
                      <a
                        href={d.href}
                        {...external(d.href)}
                        className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-brand hover:text-white"
                      >
                        {t(d.label)}
                        {d.isNew && <NewBadge />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-6 rounded-2xl border border-dashed border-brand/30 bg-page p-4">
          <p className="mb-3 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-brand">{t(TEXT.zones)}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ZONES.map((z) => (
              <a
                key={z.label.en}
                href={z.href}
                {...external(z.href)}
                className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white"
              >
                {t(z.label)}
                {z.isNew && <NewBadge />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LayerRow({ title, links }: { title: Text; links: IaLink[] }) {
  const { t } = useLang();
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand">{t(title)}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label.en}
            href={l.href}
            {...external(l.href)}
            className="rounded-full bg-page px-3 py-1.5 text-[12.5px] font-medium text-navy transition-colors hover:bg-brand hover:text-white"
          >
            {t(l.label)}
          </a>
        ))}
      </div>
    </div>
  );
}

export function SitemapPage() {
  const { t, lang } = useLang();
  const { root } = useDesign();
  const [query, setQuery] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const q = query.trim();
  const filtering = Boolean(q) || onlyNew;

  const toggle = (k: string) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const allParents = useMemo(() => {
    const keys: string[] = [];
    const walk = (links: IaLink[], path: string) =>
      links.forEach((l) => {
        if (l.children) {
          keys.push(keyOf(path, l));
          walk(l.children, keyOf(path, l));
        }
      });
    AREAS.forEach((a) => walk(a.items, a.key));
    return keys;
  }, []);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    const match = (l: IaLink) =>
      (!needle || l.label.en.toLowerCase().includes(needle) || l.label.kn.toLowerCase().includes(needle)) && (!onlyNew || Boolean(l.isNew));
    return AREAS.map((a) => ({ area: a, links: filtering ? filterLinks(a.items, match, onlyNew) : a.items })).filter((x) => x.links.length);
  }, [q, onlyNew, filtering]);

  const stats = [
    { value: AREAS.length, label: TEXT.areas },
    { value: IA_STATS.total, label: TEXT.pages },
    { value: IA_STATS.total - IA_STATS.fresh, label: TEXT.live },
    { value: IA_STATS.fresh, label: TEXT.fresh },
  ];

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-brand text-white">
        <span className="absolute -right-24 -top-24 size-96 rotate-12 rounded-[5rem] bg-white/5" aria-hidden />
        <span className="absolute -bottom-32 left-1/3 size-80 rounded-full bg-brand-bright/10" aria-hidden />
        <div className="relative mx-auto max-w-site px-5 py-10 md:py-14 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[12px] text-white/70">
            <Link to={root} className="flex items-center gap-1 rounded px-1 transition-colors hover:bg-brand hover:text-white">
              <House weight="fill" />
              {t(TEXT.home)}
            </Link>
            <span>/</span>
            <span className="text-white">{t(TEXT.title)}</span>
          </nav>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-bright">
            {t(TEXT.eyebrow)}
          </motion.p>
          <motion.h1
            key={lang}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-2 flex items-center gap-3 font-display text-3xl font-bold md:text-[2.6rem]"
          >
            <TreeStructure weight="duotone" className="size-10 text-brand-bright" />
            {t(TEXT.title)}
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-white/80">{t(TEXT.sub)}</p>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label.en}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: EASE }}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <p className="font-display text-3xl font-bold tabular-nums">{s.value}</p>
                <p className="text-[12px] text-white/75">{t(s.label)}</p>
              </motion.div>
            ))}
          </div>
          <Link
            to="/design-7"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-navy transition-colors hover:bg-brand hover:text-white"
          >
            {t(TEXT.seeHome)}
            <ArrowSquareOut weight="bold" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-site px-5 pt-8 lg:px-8">
        <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-sm">
            <span className="grid size-10 place-items-center rounded-xl bg-navy text-white">
              <House weight="fill" className="size-5" />
            </span>
            <div>
              <p className="font-display text-[15px] font-bold text-navy">{t(TEXT.home)}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {AREAS.map((a) => (
                  <a
                    key={a.key}
                    href={`#area-${a.key}`}
                    title={t(a.label)}
                    className="grid size-7 place-items-center rounded-md bg-brand-soft text-brand transition-colors hover:bg-brand hover:text-white"
                  >
                    <a.icon weight="duotone" className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <LayerRow title={TEXT.utility} links={UTILITY} />
        </div>

        <div className="z-30 mt-4 md:sticky md:top-[49px] flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/95 p-2 shadow-sm backdrop-blur">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-page px-3 py-2">
            <MagnifyingGlass weight="bold" className="size-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(TEXT.search)}
              aria-label={t(TEXT.search)}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear" className="rounded p-0.5 text-muted transition-colors hover:bg-brand hover:text-white">
                <X weight="bold" className="size-3.5" />
              </button>
            )}
          </label>
          <button
            onClick={() => setOnlyNew((v) => !v)}
            aria-pressed={onlyNew}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors",
              onlyNew ? "bg-amber-500 text-white" : "bg-page text-navy hover:bg-brand hover:text-white",
            )}
          >
            <span className={cn("relative h-4 w-7 rounded-full transition-colors", onlyNew ? "bg-white/40" : "bg-line")}>
              <motion.span layout className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow", onlyNew ? "right-0.5" : "left-0.5")} />
            </span>
            {t(TEXT.onlyNew)}
          </button>
          <button
            onClick={() => setClosed(new Set())}
            className="flex items-center gap-1.5 rounded-xl bg-page px-3 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-brand hover:text-white"
          >
            <ArrowsOutSimple weight="bold" />
            {t(TEXT.expand)}
          </button>
          <button
            onClick={() => setClosed(new Set(allParents))}
            className="flex items-center gap-1.5 rounded-xl bg-page px-3 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-brand hover:text-white"
          >
            <ArrowsInSimple weight="bold" />
            {t(TEXT.collapse)}
          </button>
          <span className="flex items-center gap-3 px-2 text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-brand" />
              {t(TEXT.legendLive)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full border-2 border-dashed border-amber-500" />
              {t(TEXT.legendNew)}
            </span>
          </span>
        </div>

        {filtered.length ? (
          <div className="mt-5 columns-1 gap-5 md:columns-2 xl:columns-3 [&>*]:mb-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(({ area, links }) => (
                <AreaCard
                  key={area.key}
                  area={area}
                  links={links}
                  index={AREAS.indexOf(area)}
                  query={q}
                  forceOpen={filtering}
                  closed={closed}
                  toggle={toggle}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-line bg-white py-12 text-center text-sm text-muted">{t(TEXT.noMatch)}</p>
        )}

        <div className="mt-2">
          <LayerRow title={TEXT.initiatives} links={INITIATIVES} />
        </div>
      </div>

      <OrgMap />
    </div>
  );
}
