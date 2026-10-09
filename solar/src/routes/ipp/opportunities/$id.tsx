import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { DataListPageShell } from "@/components/DataListPage";
import { AppShell } from "@/components/AppShell";
import { OpportunityReadOnlySections } from "@/components/OpportunityReadOnlySections";
import { Button } from "@/components/ui/button";
import { formatOpportunityLandAddressReadOnly } from "@/lib/opportunity-land-display";
import { pageLoadEpochMs } from "@/lib/dates";
import { db, formatDate, useSession } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Hourglass,
  MapPin,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { ComponentType, ReactNode } from "react";
import type { Opportunity } from "@/lib/types";

function oppTypeHeroChipClass(type: Opportunity["type"]): string {
  switch (type) {
    case "Wind":
      return "border-sky-400/45 bg-sky-500/[0.12] text-sky-800 shadow-sm shadow-sky-500/10 dark:border-sky-500/35 dark:bg-sky-500/12 dark:text-sky-200";
    case "Hybrid":
      return "border-violet-400/45 bg-violet-500/[0.12] text-violet-800 shadow-sm shadow-violet-500/10 dark:border-violet-500/35 dark:bg-violet-500/12 dark:text-violet-200";
    default:
      return "border-amber-400/50 bg-amber-500/[0.14] text-amber-950 shadow-sm shadow-amber-500/10 dark:border-amber-500/38 dark:bg-amber-500/14 dark:text-amber-100";
  }
}

function oppStatusHeroChipClass(status: Opportunity["status"]): string {
  switch (status) {
    case "Published":
      return "border-emerald-400/45 bg-emerald-500/[0.12] text-emerald-900 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/35 dark:bg-emerald-500/14 dark:text-emerald-100";
    case "Draft":
      return "border-amber-400/45 bg-amber-500/[0.1] text-amber-900 shadow-sm dark:border-amber-500/32 dark:bg-amber-500/12 dark:text-amber-100";
    case "Closed":
      return "border-border bg-muted/60 text-muted-foreground shadow-sm dark:bg-muted/40";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

export const Route = createFileRoute("/ipp/opportunities/$id")({
  head: () => ({ meta: [{ title: "Opportunity — PMIS" }] }),
  component: OppDetail,
});

type IconCmp = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
type StatTone = "emerald" | "sky" | "violet" | "amber" | "rose";

function StatPill({
  icon: Icon,
  label,
  value,
  tone,
  delay,
  pulse,
}: {
  icon: IconCmp;
  label: string;
  value: ReactNode;
  tone: StatTone;
  delay: number;
  pulse?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn("opp-stat px-3 py-2.5", `opp-stat-${tone}`)}
    >
      <div className="flex items-center gap-2.5">
        <span className="opp-stat-icon relative flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" aria-hidden />
          {pulse && !reduceMotion ? (
            <span className="absolute inset-0 animate-ping rounded-lg bg-destructive/40" aria-hidden />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/90">
            {label}
          </p>
          <p className="truncate text-[13px] font-bold leading-tight text-foreground">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function OppDetail() {
  const { id } = Route.useParams();
  const o = db.getOpportunity(id);
  const user = useSession();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  if (!o) {
    return (
      <AppShell role="ipp">
        <p className="text-muted-foreground">Opportunity not found.</p>
      </AppShell>
    );
  }

  const apply = () => {
    if (!user) return;
    const p = db.createProject({
      name: `${user.org ?? user.name} — ${o.name.slice(0, 30)}`,
      ippId: user.id,
      ippName: user.name,
      opportunityId: o.id,
      capacityMW: Math.min(50, o.capacityMW),
    });
    toast.success("Draft application created");
    navigate({ to: "/ipp/applications/$id", params: { id: p.id } });
  };

  const endMs = new Date(o.endDate).getTime();
  const daysLeft = Math.max(0, Math.round((endMs - pageLoadEpochMs) / 86400000));
  const urgent = daysLeft <= 7;
  const closeDate =
    o.applicationEndDate ? formatDate(o.applicationEndDate) : formatDate(o.endDate);
  const openDate =
    o.applicationStartDate ? formatDate(o.applicationStartDate) : formatDate(o.startDate);

  const capacityLabel =
    o.capacityMinMW != null && o.capacityMinMW > 0
      ? `${o.capacityMinMW}–${o.capacityMW} MW`
      : `Up to ${o.capacityMW} MW`;

  const codeLine = [o.code, o.referenceCode].filter(Boolean).join(" · ");
  const locationShort = [o.district, o.state].filter(Boolean).join(", ");

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        {/* Hero — two columns, no outer card shell */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            {/* LEFT — title + chips + stats + land */}
            <div className="min-w-0">
              {/* Chips row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                  <span className="relative flex size-1.5">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full rounded-full bg-primary-foreground/80",
                        !reduceMotion && "animate-ping",
                      )}
                    />
                    <span className="relative inline-flex size-1.5 rounded-full bg-primary-foreground" />
                  </span>
                  Open
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    oppTypeHeroChipClass(o.type),
                  )}
                >
                  <Tag className="size-2.5 opacity-90" aria-hidden />
                  {o.type}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    oppStatusHeroChipClass(o.status),
                  )}
                >
                  <CheckCircle2 className="size-2.5 opacity-90" aria-hidden />
                  {o.status}
                </span>
                {codeLine ? (
                  <motion.span
                    className="ml-0.5 inline-block origin-center font-mono text-[10px] text-muted-foreground/90 will-change-transform"
                    initial={reduceMotion ? false : { scale: 1 }}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: [1, 1.07, 1],
                          }
                    }
                    transition={{
                      duration: 2.4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    {codeLine}
                  </motion.span>
                ) : null}
              </div>

              {/* Title */}
              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="mt-2 text-[1.55rem] font-bold leading-tight tracking-tight sm:text-3xl"
              >
                <span className="text-foreground">{o.name}</span>
              </motion.h1>

              {/* Stat strip */}
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <StatPill
                  icon={Zap}
                  label="Capacity"
                  value={capacityLabel}
                  tone="emerald"
                  delay={0.05}
                />
                <StatPill
                  icon={MapPin}
                  label="Location"
                  value={locationShort || "—"}
                  tone="sky"
                  delay={0.1}
                />
                <StatPill
                  icon={Sparkles}
                  label="Type"
                  value={o.locationType ? `${o.type} · ${o.locationType}` : o.type}
                  tone="violet"
                  delay={0.15}
                />
                <StatPill
                  icon={urgent ? Hourglass : CalendarClock}
                  label={urgent ? "Closes soon" : "Days left"}
                  value={daysLeft === 0 ? "Closes today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                  tone={urgent ? "rose" : "amber"}
                  delay={0.2}
                  pulse={urgent}
                />
              </div>

              {/* Land summary inline */}
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-border/50 bg-background/55 px-3 py-2 shadow-sm backdrop-blur-sm dark:bg-muted/10">
                <span className="opp-hero-land-icon mt-0.5 flex size-6 shrink-0 items-center justify-center shadow-sm">
                  <MapPin className="size-3" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="mr-1.5 align-middle text-[9.5px] font-bold uppercase tracking-wider text-primary">
                    Land
                  </span>
                  <span className="align-middle text-xs leading-snug text-foreground/85">
                    {formatOpportunityLandAddressReadOnly(o)
                      .replace(/\n+/g, " · ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — compact CTA card */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col gap-2 lg:w-72"
            >
              <div
                className={cn(
                  "relative overflow-hidden p-3.5",
                  urgent ? "opp-cta-panel opp-cta-panel--urgent" : "opp-cta-panel",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="opp-cta-icon flex size-9 shrink-0 items-center justify-center">
                    {urgent ? (
                      <Hourglass className={cn("size-4", !reduceMotion && "animate-pulse")} aria-hidden />
                    ) : (
                      <CalendarClock className="size-4" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-foreground/80">
                      Apply by
                    </p>
                    <p className="text-sm font-bold leading-tight text-foreground">{closeDate}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Opens {openDate}</p>
                    <p
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ring-1",
                        urgent
                          ? "bg-destructive/15 text-destructive ring-destructive/30"
                          : "bg-primary/15 text-primary ring-primary/30",
                      )}
                    >
                      {daysLeft === 0
                        ? "Closes today"
                        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={apply}
                className="opp-cta-btn group h-11 rounded-xl text-sm font-semibold"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="size-4" aria-hidden />
                  Apply now
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-[11px] text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/ipp/opportunities">← Browse other opportunities</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Scheme details */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="opp-scheme-heading-icon flex size-6 items-center justify-center shadow-sm">
              <Sparkles className="size-3.5" aria-hidden />
            </span>
            <h2 className="text-base font-semibold tracking-tight text-foreground">Scheme details</h2>
            <span className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" aria-hidden />
          </div>
          <OpportunityReadOnlySections o={o} />
        </motion.div>
      </DataListPageShell>
    </AppShell>
  );
}
