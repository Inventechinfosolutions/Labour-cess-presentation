import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileSignature,
  GitBranch,
  Rocket,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

type Stage = {
  key: string;
  label: string;
  actor: string;
  description: string;
  sla: string;
  icon: LucideIcon;
  tone: string;
};

const STAGES: Stage[] = [
  {
    key: "submit",
    label: "IPP submit",
    actor: "Independent Power Producer",
    description: "Develops application against published opportunity, uploads required documents, and submits for review.",
    sla: "Open window",
    icon: ClipboardList,
    tone: "task-tone-allotment",
  },
  {
    key: "review",
    label: "Officer review",
    actor: "Evaluation Officer",
    description: "Verifies documents, raises queries, scores against rubrics, and forwards a recommendation note.",
    sla: "7 days",
    icon: FileSignature,
    tone: "task-tone-query",
  },
  {
    key: "decision",
    label: "Approver decision",
    actor: "Approving Authority",
    description: "Reviews officer note, signs off allotment, or returns the case with directions and rationale.",
    sla: "7 days",
    icon: ShieldCheck,
    tone: "task-tone-waiting",
  },
  {
    key: "execution",
    label: "Execution",
    actor: "IPP & Project Cell",
    description: "Milestone tracker activates with execution checklist, statutory clearances, and commissioning gates.",
    sla: "Project term",
    icon: Rocket,
    tone: "task-tone-milestone",
  },
];

const SLA_ESCALATION_CARDS = [
  {
    key: "sla",
    title: "SLA per stage",
    value: "7 days",
    desc: "Officer review and approver decision both follow a 7-day clock from assignment.",
    tone: "task-tone-allotment",
    icon: Timer,
  },
  {
    key: "l1",
    title: "L1 escalation",
    value: "80% consumed",
    desc: "Reminder sent to assignee + supervisor when 80% of the SLA window is elapsed.",
    tone: "task-tone-waiting",
    icon: AlertTriangle,
  },
  {
    key: "l2",
    title: "L2 on breach",
    value: "Auto-route",
    desc: "On SLA breach, the case auto-routes to the next-level approver and a breach note is logged.",
    tone: "task-tone-issue",
    icon: ShieldCheck,
  },
] as const;

export const Route = createFileRoute("/admin/workflows/")({
  head: () => ({ meta: [{ title: "Workflows — PMIS" }] }),
  component: WorkflowsPage,
});

function WorkflowsPage() {
  const reduceMotion = useReducedMotion();

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Workflows"
              count={STAGES.length}
              description="Standardised stage gates with SLA hooks. Mirrors the journey IPPs see — submission through commissioning."
            />
          }
        />

        {/* Top KPI strip */}
        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Workflow summary metrics"
        >
          {(
            [
              {
                key: "stages",
                label: "Stage gates",
                value: `${STAGES.length}`,
                footerBadge: "Pipeline",
                footer: "End-to-end coverage",
                icon: GitBranch,
              },
              {
                key: "sla",
                label: "Standard SLA",
                value: "7 d",
                footerBadge: "Review",
                footer: "Officer & approver clocks",
                icon: Timer,
              },
              {
                key: "esc",
                label: "L1 escalation",
                value: "80 %",
                footerBadge: "Alerts",
                footer: "Of SLA window consumed",
                icon: AlertTriangle,
              },
              {
                key: "auto",
                label: "Live",
                value: "Automated",
                footerBadge: "Nudges",
                footer: "Reminders & routing",
                icon: TrendingUp,
              },
            ] as const
          ).map((tile, i) => {
            const Icon = tile.icon;
            return (
              <MotionMetricCard
                key={tile.key}
                label={tile.label}
                value={tile.value}
                icon={Icon}
                iconTone={metricTileToneAt(i)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={i === 0}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left: SLA, L1, L2 — stacked policy cards */}
          <aside className="flex flex-col gap-3 lg:col-span-5" aria-label="SLA and escalation rules">
            {SLA_ESCALATION_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.key}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "rounded-xl border border-border/60 bg-card p-5 shadow-md shadow-black/[0.045] ring-1 ring-black/[0.03] dark:bg-card dark:shadow-black/25 dark:ring-white/[0.04]",
                    card.tone,
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="task-kpi-icon flex size-12 shrink-0 items-center justify-center rounded-xl">
                      <Icon className="size-5 text-[inherit]" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="mt-1 text-xl font-bold leading-tight tracking-tight text-foreground">{card.value}</p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </aside>

          {/* Right: Standard approval flow */}
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.12 }}
            className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg shadow-black/[0.05] ring-1 ring-foreground/[0.04] dark:shadow-black/25 lg:col-span-7"
            aria-labelledby="workflow-flow-heading"
          >
          <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/[0.07] via-card to-chart-2/[0.05] px-5 py-4 sm:px-6 sm:py-5">
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-center gap-3">
              <span className="task-kpi-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
                <GitBranch className="size-5" aria-hidden />
              </span>
              <div>
                <h2 id="workflow-flow-heading" className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Standard approval flow
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Reference pipeline applied to every opportunity unless overridden.</p>
              </div>
            </div>
          </div>

          {/* Horizontal stage strip */}
          <div className="relative border-b border-border/50 px-5 py-6 sm:px-6">
            <div className="relative grid gap-3 md:grid-cols-4">
              {/* connector line */}
              <div
                className="pointer-events-none absolute left-6 top-7 hidden h-[2px] w-[calc(100%-3rem)] bg-gradient-to-r from-primary/40 via-primary/25 to-primary/40 md:block"
                aria-hidden
              />
              {STAGES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.key}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.2 + i * 0.07 }}
                    className={cn("relative flex flex-col items-center gap-2 text-center", s.tone)}
                  >
                    <div className="relative">
                      <span className="task-kpi-icon flex size-14 items-center justify-center rounded-2xl ring-4 ring-card">
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full border border-border bg-background text-[10px] font-bold tabular-nums text-foreground shadow-sm">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-sm font-semibold tracking-tight text-foreground">{s.label}</p>
                    <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{s.actor}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stage detail rows */}
          <div className="grid gap-0 divide-y divide-border/50">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const isLast = i === STAGES.length - 1;
              return (
                <motion.div
                  key={s.key}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.32 + i * 0.06 }}
                  className={cn("group grid items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/15 sm:grid-cols-[auto_1fr_auto] sm:px-6", s.tone)}
                >
                  <div className="flex items-center gap-3">
                    <span className="task-kpi-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="sm:hidden">
                      <p className="text-sm font-semibold text-foreground">
                        Stage {i + 1} · {s.label}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.actor}</p>
                    </div>
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Stage {i + 1} · {s.label}
                      </p>
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.actor}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[10.5px] font-semibold text-foreground shadow-sm">
                      <Clock className="size-3" aria-hidden />
                      {s.sla}
                    </span>
                    {!isLast ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-primary/80">
                        Next stage
                        <ArrowRight className="size-3" aria-hidden />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 className="size-3" aria-hidden />
                        Final
                      </span>
                    )}
                  </div>
                  <p className="-mt-2 text-xs leading-relaxed text-muted-foreground sm:hidden">{s.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
