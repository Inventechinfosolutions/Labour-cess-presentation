import { motion, useReducedMotion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from "react";
import type { Opportunity } from "@/lib/types";
import { formatOpportunityLandAddressReadOnly } from "@/lib/opportunity-land-display";
import { buildIppUploadChecklist } from "@/lib/opportunity-ipp-checklist";
import { formatDate } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ClipboardList,
  FileText,
  MapPin,
} from "lucide-react";

/** Mirrors admin "Create opportunity" wizard (5 steps; view-only for IPP). */
export const OPPORTUNITY_SECTION_META = [
  { title: "Scheme identity", description: "Name, code, description, project type" },
  {
    title: "Location, capacity & land",
    description: "State, district, MW, location mode, fixed site or IPP / department land model",
  },
  { title: "Application window", description: "Start / end dates and approval timeline" },
  {
    title: "Eligibility, documents & terms",
    description: "Criteria, upload checklist, and terms & conditions",
  },
] as const;

type Tone = "indigo" | "emerald" | "amber" | "violet";

const TONE_CLASS: Record<Tone, string> = {
  indigo: "opp-section",
  emerald: "opp-section-emerald",
  amber: "opp-section-amber",
  violet: "opp-section-violet",
};

const TONE_TEXT: Record<Tone, string> = {
  indigo: "text-primary",
  emerald: "text-primary",
  amber: "text-primary",
  violet: "text-primary",
};

function nearestScrollParent(el: HTMLElement): Element {
  let n: HTMLElement | null = el.parentElement;
  while (n) {
    const { overflow, overflowY } = getComputedStyle(n);
    const oy = overflowY !== "visible" ? overflowY : overflow.split(" ")[1] ?? overflow.split(" ")[0];
    if (/(auto|scroll|overlay)/.test(oy ?? "")) return n;
    n = n.parentElement;
  }
  return document.documentElement;
}

/** True while the first column is pinned by `position: sticky` inside the scroll container. */
function useStickySchemeColumnPin(opts: {
  enabled: boolean;
  topPx: number;
  sentinelRef: RefObject<HTMLElement | null>;
  stickyRef: RefObject<HTMLElement | null>;
}) {
  const { enabled, topPx, sentinelRef, stickyRef } = opts;
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPinned(false);
      return;
    }
    const sticky = stickyRef.current;
    if (!sticky) return;

    const root = nearestScrollParent(sticky);
    let raf = 0;

    const tick = () => {
      const sen = sentinelRef.current;
      const card = stickyRef.current;
      if (!sen || !card) return;

      const origin = root instanceof HTMLElement ? root.getBoundingClientRect().top : 0;
      const stickLine = origin + topPx;

      const senTop = sen.getBoundingClientRect().top;
      const cardRect = card.getBoundingClientRect();

      const engaged = senTop < stickLine && cardRect.bottom > stickLine + 2;
      setPinned(engaged);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    };

    tick();
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const ro = new ResizeObserver(onScroll);
    ro.observe(sticky);

    return () => {
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [enabled, topPx, sentinelRef, stickyRef]);

  return pinned;
}

function SectionShell({
  index,
  title,
  description,
  icon: Icon,
  tone,
  className,
  children,
}: {
  index: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: Tone;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn("opp-section-card group p-4 sm:p-5", TONE_CLASS[tone], className)}
    >
      <header className="relative flex items-start gap-3 border-b border-border/45 pb-3">
        <div className="opp-section-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-[9.5px] font-bold uppercase tracking-[0.08em]", TONE_TEXT[tone])}>
              Step {index}
            </span>
            <span className="rounded-full border border-border/60 bg-muted/40 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              View only
            </span>
          </div>
          <h2 className="mt-0.5 text-[15px] font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      <div className="relative mt-3 space-y-2.5 text-sm leading-relaxed">{children}</div>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/40 bg-gradient-to-b from-background to-muted/10 px-3 py-2 transition-colors hover:border-border/70 dark:border-border/20 dark:from-muted/10 dark:to-muted/5">
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 break-words text-[13px] text-foreground">{children}</div>
    </div>
  );
}

function landBlock(o: Opportunity) {
  if (o.locationType === "Fixed") {
    return (
      <>
        <Field label="Mode">Fixed site — department-coordinated land</Field>
        <Field label="Site address">
          <span className="whitespace-pre-wrap text-xs leading-relaxed">{o.fixedSiteAddress?.trim() || "—"}</span>
        </Field>
        <Field label="Region">{[o.district, o.state].filter(Boolean).join(", ") || "—"}</Field>
        {o.fixedSiteSupportDocName ? <Field label="Reference attachment (scheme)">{o.fixedSiteSupportDocName}</Field> : null}
      </>
    );
  }
  return (
    <>
      <Field label="Mode">Flexible — IPP or department land model</Field>
      <Field label="Land source">
        {o.landSource === "IPP Provided" ? "IPP provided" : "Department provided"}
      </Field>
      {o.landSource === "Department Provided" && o.departmentFixedLocationSummary ? (
        <Field label="Nodal / land bank reference">{o.departmentFixedLocationSummary}</Field>
      ) : null}
    </>
  );
}

export function OpportunityReadOnlySections({
  o,
  layout = "default",
}: {
  o: Opportunity;
  layout?: "default" | "sheet";
}) {
  const reduceMotion = useReducedMotion();
  const schemeStickySentinelRef = useRef<HTMLDivElement>(null);
  const schemeStickyCardRef = useRef<HTMLDivElement>(null);
  /** Tailwind `top-3`: pin line inside the scrolling `main` region. */
  const schemeStickyTopPx = 12;
  const schemeFirstColumnPinned = useStickySchemeColumnPin({
    enabled: true,
    topPx: schemeStickyTopPx,
    sentinelRef: schemeStickySentinelRef,
    stickyRef: schemeStickyCardRef,
  });

  const appStart = o.applicationStartDate ?? o.startDate;
  const appEnd = o.applicationEndDate ?? o.endDate;
  const checklist = buildIppUploadChecklist(o);
  const eligRows = (o.eligibility ?? []).filter((r) => r.criterion.trim());
  const meta = OPPORTUNITY_SECTION_META;

  return (
    <div className={cn("space-y-5", layout === "sheet" && "space-y-4")}>
      <div className={cn("grid gap-5", layout === "sheet" ? "lg:gap-4 xl:grid-cols-2" : "md:grid-cols-2")}>
        <div className="min-w-0">
          <div
            ref={schemeStickySentinelRef}
            className="pointer-events-none h-px w-full shrink-0 select-none opacity-0"
            aria-hidden
          />
          {/* Plain div — no transforms on sticky (transform breaks sticky in browsers). */}
          <div
            ref={schemeStickyCardRef}
            className={cn(
              "md:sticky md:top-3 md:z-10 md:self-start md:rounded-2xl",
              !reduceMotion && "md:transition-[background-color,box-shadow,backdrop-filter,ring-color] md:duration-300 md:ease-out",
              schemeFirstColumnPinned
                ? "md:bg-background/90 md:shadow-xl md:shadow-black/14 md:ring-1 md:ring-border/80 md:backdrop-blur-md md:backdrop-saturate-150 dark:md:bg-background/75 dark:md:shadow-black/45 max-md:bg-transparent max-md:shadow-none max-md:ring-0"
                : undefined,
            )}
          >
            <motion.div
              initial={false}
              animate={
                reduceMotion ? undefined : { filter: schemeFirstColumnPinned ? "brightness(1.028)" : "brightness(1)" }
              }
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionShell index={1} title={meta[0].title} description={meta[0].description} icon={FileText} tone="indigo">
                <Field label="Project title">{o.name || "—"}</Field>
                <Field label="Scheme code">
                  <span className="font-mono text-xs">{o.code || "—"}</span>
                </Field>
                {o.referenceCode ? (
                  <Field label="Public reference">
                    <span className="font-mono text-xs font-semibold text-primary">{o.referenceCode}</span>
                  </Field>
                ) : null}
                <Field label="Project type">{o.type}</Field>
                <Field label="Description">
                  <span className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{o.description?.trim() || "—"}</span>
                </Field>
              </SectionShell>
            </motion.div>
          </div>
        </div>

        <SectionShell index={2} title={meta[1].title} description={meta[1].description} icon={MapPin} tone="emerald">
          <Field label="State / UT">{o.state || "—"}</Field>
          <Field label="District">{o.district || "—"}</Field>
          <Field label="Address">
            <span className="whitespace-pre-wrap text-xs leading-relaxed">{o.locationAddress?.trim() || "—"}</span>
          </Field>
          <Field label="Capacity band">
            <span className="tabular-nums font-semibold text-primary">
              {o.capacityMinMW != null && o.capacityMinMW > 0
                ? `${o.capacityMinMW}–${o.capacityMW} MW`
                : `Up to ${o.capacityMW} MW`}
            </span>
          </Field>
          <Field label="Location type">{o.locationType ?? "—"}</Field>
          <div className="mt-4 border-t border-border/45 pt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              <span className="opp-subhead-icon">
                <MapPin className="size-2.5" aria-hidden />
              </span>
              Land
            </div>
            {landBlock(o)}
            <Field label="Land summary">
              <span className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                {formatOpportunityLandAddressReadOnly(o)}
              </span>
            </Field>
          </div>
        </SectionShell>

        <SectionShell index={3} title={meta[2].title} description={meta[2].description} icon={CalendarIcon} tone="amber">
          <Field label="Applications open">{appStart ? formatDate(appStart) : "—"}</Field>
          <Field label="Applications close">
            <span className="font-semibold text-primary">
              {appEnd ? formatDate(appEnd) : "—"}
            </span>
          </Field>
          <Field label="Approval target (indicative)">
            {o.approvalTimelineDays != null && o.approvalTimelineDays > 0 ? (
              <span className="tabular-nums">{o.approvalTimelineDays} days</span>
            ) : (
              "—"
            )}
          </Field>
        </SectionShell>

        <SectionShell
          index={4}
          title={meta[3].title}
          description={meta[3].description}
          icon={ClipboardList}
          tone="violet"
          className={layout === "sheet" ? "xl:col-span-2" : "md:col-span-2"}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <span className="opp-subhead-icon">
                  <ClipboardList className="size-2.5" aria-hidden />
                </span>
                Eligibility
              </div>
              {eligRows.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
                  No structured eligibility table for this scheme. Refer to the description and document checklist.
                </p>
              ) : (
                <ul className="space-y-2">
                  {eligRows.map((row, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3 text-xs leading-snug transition-colors hover:border-primary/40 dark:bg-muted/10"
                    >
                      <div className="font-semibold text-foreground">{row.criterion.trim() || "—"}</div>
                      <div className="mt-2">
                        {row.mandatory ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive ring-1 ring-destructive/30">
                            <span aria-hidden>*</span> Mandatory
                          </span>
                        ) : (
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <span className="opp-subhead-icon">
                  <ClipboardList className="size-2.5" aria-hidden />
                </span>
                Upload checklist (after you apply)
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Upload one file per checklist item when you start an application. Mandatory items are marked with an
                asterisk.
              </p>
              <ul className="space-y-2">
                {checklist.length === 0 ? (
                  <li className="text-xs text-muted-foreground">No documents configured.</li>
                ) : (
                  checklist.map((row, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/55 bg-muted/15 px-3 py-2.5 transition-colors hover:border-primary/40 dark:bg-muted/10"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        {row.mandatory ? (
                          <span className="mt-0.5 font-bold text-destructive" title="Mandatory" aria-hidden>
                            *
                          </span>
                        ) : (
                          <span className="mt-0.5 w-3 shrink-0" aria-hidden />
                        )}
                        <span className="min-w-0 break-words text-sm font-medium leading-snug">{row.name}</span>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                            row.mandatory
                              ? "bg-destructive/12 text-destructive ring-1 ring-destructive/30"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {row.mandatory ? "Required" : "Optional"}
                        </span>
                        <span className="rounded-md bg-primary/12 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/25">
                          Scheme checklist
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          {(o.termsAndConditions ?? []).filter(r => r.term.trim()).length > 0 ? (
            <div className="mt-5 border-t border-border/45 pt-5">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                <span className="opp-subhead-icon">
                  <FileText className="size-2.5" aria-hidden />
                </span>
                Terms &amp; Conditions
              </div>
              <ul className="space-y-2">
                {(o.termsAndConditions ?? []).filter(r => r.term.trim()).map((row, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border/60 bg-muted/20 px-3 py-3 text-xs leading-snug transition-colors hover:border-primary/40 dark:bg-muted/10"
                  >
                    <div className="text-foreground">{row.term.trim()}</div>
                    <div className="mt-2">
                      {row.mandatory ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-destructive/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive ring-1 ring-destructive/30">
                          <span aria-hidden>*</span> Mandatory
                        </span>
                      ) : (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                          Optional
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </SectionShell>
      </div>
    </div>
  );
}
