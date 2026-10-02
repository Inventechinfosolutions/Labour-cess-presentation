import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowsClockwise,
  BookmarkSimple,
  CaretDown,
  FunnelSimple,
  MagnifyingGlass,
  MapPin,
  X,
} from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import {
  applyFilters,
  CATEGORIES,
  CATEGORY_BY_ID,
  EMPTY_FILTERS,
  OPPORTUNITIES,
  ORGANISATIONS,
  REGIONS,
  SECTORS,
  STATUSES,
  type Filters,
  type Opportunity,
  type Status,
} from "./data";

const STATUS_STYLE: Record<Status, string> = {
  Open: "bg-[#16a05a]/12 text-[#0f7a43]",
  Upcoming: "bg-(color:--gc-primary)/12 text-[#1554b8]",
  "Closing Soon": "bg-[#e0335c]/12 text-[#b82146]",
};

const PAGE = 5;

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-(color:--gc-ink-2)">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-(color:--gc-ink)/12 bg-white pr-9 pl-3.5 text-[13.5px] text-(color:--gc-ink) transition outline-none hover:border-(color:--gc-ink)/25 focus:border-[#e0335c] focus:ring-3 focus:ring-[#e0335c]/15"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <CaretDown size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-(color:--gc-body)" />
      </span>
    </label>
  );
}

export function SearchOpportunities({
  reduce,
  filters,
  setFilters,
  saved,
  toggleSaved,
}: {
  reduce: boolean;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  saved: Set<string>;
  toggleSaved: (id: string) => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const [sort, setSort] = useState<"latest" | "az">("latest");
  const [expanded, setExpanded] = useState(false);

  const results = useMemo(() => {
    const list = applyFilters(OPPORTUNITIES, filters);
    return sort === "latest" ? [...list].sort((a, b) => b.posted.localeCompare(a.posted)) : [...list].sort((a, b) => a.title.localeCompare(b.title));
  }, [filters, sort]);

  const visible = expanded ? results : results.slice(0, PAGE);
  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const toggleStatus = (s: Status) =>
    setFilters((f) => ({ ...f, statuses: f.statuses.includes(s) ? f.statuses.filter((x) => x !== s) : [...f.statuses, s] }));

  return (
    <section id="search" className="relative scroll-mt-16 bg-gradient-to-b from-[#fbf7fb] to-white px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading eyebrow="Search" title="Search Opportunities" sub="Use filters to find the most relevant opportunities for you." reduce={reduce} align="left" />

        <motion.div
          className="mt-8 rounded-[22px] bg-white p-4 shadow-[0_18px_44px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6 sm:p-5"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              document.getElementById("results")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
            }}
          >
            <label className="relative flex-1">
              <span className="sr-only">Search opportunities</span>
              <MagnifyingGlass size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-(color:--gc-body)" />
              <input
                value={filters.q}
                onChange={(e) => set("q", e.target.value)}
                placeholder="Search opportunities by keyword, sector, location or organisation…"
                className="h-12 w-full rounded-xl border border-(color:--gc-ink)/12 bg-[#f8f9fc] pr-10 pl-11 text-[14.5px] text-(color:--gc-ink) transition outline-none placeholder:text-(color:--gc-muted) focus:border-[#e0335c] focus:bg-white focus:ring-3 focus:ring-[#e0335c]/15"
              />
              {filters.q ? (
                <button type="button" onClick={() => set("q", "")} className="absolute top-1/2 right-3 -translate-y-1/2 text-(color:--gc-muted) hover:text-(color:--gc-ink)" aria-label="Clear search">
                  <X size={16} weight="bold" />
                </button>
              ) : null}
            </label>
            <button
              type="submit"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-(color:--gc-button-a) to-(color:--gc-button-b) text-(color:--gc-ink) shadow-[0_8px_20px_rgba(240,180,41,0.35)] transition hover:-translate-y-0.5"
              aria-label="Search"
            >
              <MagnifyingGlass size={20} weight="bold" />
            </button>
          </form>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
            <Select
              label="Category"
              value={filters.category}
              onChange={(v) => set("category", v as Filters["category"])}
              options={[{ value: "all", label: "All Opportunities" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))]}
            />
            <Select label="Sector" value={filters.sector} onChange={(v) => set("sector", v)} options={[{ value: "all", label: "All Sectors" }, ...SECTORS.map((s) => ({ value: s, label: s }))]} />
            <Select
              label="Location"
              value={filters.location}
              onChange={(v) => set("location", v)}
              options={[{ value: "all", label: "All Karnataka" }, ...REGIONS.map((r) => ({ value: r.name, label: r.name }))]}
            />
            <Select
              label="Organisation"
              value={filters.organisation}
              onChange={(v) => set("organisation", v)}
              options={[{ value: "all", label: "All Organisations" }, ...ORGANISATIONS.map((s) => ({ value: s, label: s }))]}
            />
            <button
              type="button"
              onClick={() => setAdvanced((a) => !a)}
              aria-expanded={advanced}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-(color:--gc-primary-deep) transition hover:bg-(color:--gc-primary)/8 lg:col-span-1"
            >
              <FunnelSimple size={16} weight="bold" />
              Advanced Filters
            </button>
          </div>

          <AnimatePresence initial={false}>
            {advanced ? (
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-(color:--gc-ink)/8 pt-4">
                  <span className="mr-1 text-[12px] font-semibold text-(color:--gc-ink-2)">Status</span>
                  {STATUSES.map((s) => {
                    const on = filters.statuses.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleStatus(s)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition",
                          on ? "border-[#e0335c] bg-[#e0335c] text-white" : "border-(color:--gc-ink)/12 text-(color:--gc-ink-2) hover:border-(color:--gc-ink)/30",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div id="results" className="mt-12 flex scroll-mt-24 flex-wrap items-end justify-between gap-3">
          <h3 className="font-display text-[24px] font-bold tracking-[-0.02em] text-(color:--gc-ink) sm:text-[28px]">
            <motion.span key={results.length} className="inline-block text-[#e0335c]" initial={reduce ? false : { y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {results.length}
            </motion.span>{" "}
            {results.length === 1 ? "Opportunity" : "Opportunities"} Found
          </h3>
          <div className="flex items-center gap-3">
            {dirty ? (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-(color:--gc-body) transition hover:text-(color:--gc-ink)"
              >
                <ArrowsClockwise size={14} weight="bold" /> Reset
              </button>
            ) : null}
            <label className="flex items-center gap-2 text-[13px] text-(color:--gc-body)">
              Sort by
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "latest" | "az")}
                  className="h-9 appearance-none rounded-lg border border-(color:--gc-ink)/12 bg-white pr-8 pl-3 text-[13px] font-medium text-(color:--gc-ink) outline-none focus:border-[#e0335c]"
                >
                  <option value="latest">Latest</option>
                  <option value="az">Title A–Z</option>
                </select>
                <CaretDown size={12} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2" />
              </span>
            </label>
          </div>
        </div>

        {results.length ? (
          <motion.ul layout className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <AnimatePresence mode="popLayout">
              {visible.map((o, i) => (
                <ResultCard key={o.id} o={o} i={i} reduce={reduce} saved={saved.has(o.id)} onSave={() => toggleSaved(o.id)} />
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-(color:--gc-ink)/15 bg-white px-6 py-12 text-center">
            <p className="font-display text-[17px] font-semibold text-(color:--gc-ink)">No opportunities match these filters.</p>
            <p className="mt-1 text-[14px] text-(color:--gc-body)">Try a broader search or reset the filters.</p>
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-(color:--gc-ink) px-5 py-2.5 text-[13.5px] font-semibold text-white"
            >
              <ArrowsClockwise size={15} weight="bold" /> Reset filters
            </button>
          </div>
        )}

        {results.length > PAGE ? (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="inline-flex items-center gap-2 rounded-full border border-(color:--gc-ink)/15 bg-white px-6 py-2.5 text-[14px] font-semibold text-(color:--gc-ink) transition hover:border-(color:--gc-ink)/35 hover:shadow-md"
            >
              {expanded ? "Show fewer" : `Show all ${results.length} opportunities`}
              <CaretDown size={14} weight="bold" className={cn("transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ResultCard({ o, i, reduce, saved, onSave }: { o: Opportunity; i: number; reduce: boolean; saved: boolean; onSave: () => void }) {
  const cat = CATEGORY_BY_ID[o.category];
  return (
    <motion.li
      layout
      className="group flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_10px_28px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6 transition-shadow duration-300 hover:shadow-[0_20px_44px_rgba(11,31,74,0.16)]"
      initial={reduce ? false : { opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, delay: reduce ? 0 : Math.min(i, 6) * 0.05, ease: EASE }}
    >
      <span className="relative block overflow-hidden">
        <img src={o.image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
        <span className="absolute bottom-2.5 left-2.5 rounded-md px-2 py-1 text-[10.5px] font-bold text-white shadow" style={{ background: cat.color }}>
          {cat.tag}
        </span>
        <motion.button
          type="button"
          onClick={onSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          whileTap={reduce ? undefined : { scale: 0.8 }}
          className={cn(
            "absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full shadow backdrop-blur transition",
            saved ? "bg-[#e0335c] text-white" : "bg-white/85 text-(color:--gc-ink) hover:bg-white",
          )}
        >
          <BookmarkSimple size={16} weight={saved ? "fill" : "bold"} />
        </motion.button>
      </span>
      <span className="flex flex-1 flex-col p-4">
        <span className="min-h-[2.75em] font-display text-[15px] leading-snug font-semibold text-(color:--gc-ink)">{o.title}</span>
        <span className="mt-1.5 flex items-center gap-1 text-[12.5px] text-(color:--gc-body)">
          <MapPin size={13} weight="fill" style={{ color: cat.color }} /> {o.location}
        </span>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-(color:--gc-ink)/6 pt-3 text-[12px]">
          <dt className="text-(color:--gc-muted)">Sector</dt>
          <dd className="truncate text-(color:--gc-ink-2)">{o.sector}</dd>
          <dt className="text-(color:--gc-muted)">Organisation</dt>
          <dd className="truncate text-(color:--gc-ink-2)">{o.organisation}</dd>
          <dt className="text-(color:--gc-muted)">Status</dt>
          <dd>
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold", STATUS_STYLE[o.status])}>{o.status}</span>
          </dd>
        </dl>
        <a
          href="#share"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-[gap] duration-300 group-hover:gap-2.5"
          style={{ color: cat.color }}
        >
          Explore Opportunity <ArrowRight size={14} weight="bold" />
        </a>
      </span>
    </motion.li>
  );
}
