import type { ReactNode } from "react";
import { SLABadge, StatusBadge } from "@/components/Bits";
import { formatDate } from "@/lib/hooks";
import { pageLoadEpochMs } from "@/lib/dates";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

export function registerProjectBrowseVariant(projectType: Project["type"]) {
  return projectType === "Wind"
    ? "opp-browse-card--Wind"
    : projectType === "Hybrid"
      ? "opp-browse-card--Hybrid"
      : "opp-browse-card--Solar";
}

function TypeBadge({ type }: { type: Project["type"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        type === "Solar" &&
          "bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:bg-amber-500/14 dark:text-amber-100",
        type === "Wind" &&
          "bg-sky-500/10 text-sky-900 ring-sky-500/25 dark:bg-sky-500/14 dark:text-sky-100",
        type === "Hybrid" &&
          "bg-violet-500/10 text-violet-900 ring-violet-500/25 dark:bg-violet-500/14 dark:text-violet-100",
      )}
    >
      {type}
    </span>
  );
}

function slaRunway(project: Project) {
  const startMs = new Date(project.submittedAt ?? project.lastUpdated).getTime();
  const dueMs = new Date(project.slaDueDate).getTime();
  const now = pageLoadEpochMs;
  const span = Math.max(1, dueMs - startMs);
  let pct = Math.round(((now - startMs) / span) * 100);
  pct = Math.min(100, Math.max(0, pct));
  const overdue = dueMs < now;
  if (overdue) pct = 100;
  const daysLeft = Math.ceil((dueMs - now) / 86400000);
  return { pct, daysLeft, overdue };
}

type Props = {
  project: Project;
  schemeCode?: string;
  schemeRef?: string | null;
  /** Replaces default “Scheme” land block */
  middle?: ReactNode;
  /** Primary actions (e.g. Open link). Omit for read-only summary cards. */
  footer?: ReactNode;
  className?: string;
};

/**
 * Card shell matching `/admin/opportunities` browse cards (`opp-browse-*` in `index.css`).
 */
export function RegisterProjectBrowseCard({
  project: p,
  schemeCode,
  schemeRef,
  middle,
  footer,
  className,
}: Props) {
  const codeLine = schemeCode?.trim() || "—";
  const { pct, daysLeft, overdue } = slaRunway(p);

  return (
    <article
      className={cn(
        "opp-browse-card group",
        registerProjectBrowseVariant(p.type),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{codeLine}</p>
          {schemeRef ? (
            <p className="mt-0.5 font-mono text-[11px] font-semibold text-primary">{schemeRef}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <TypeBadge type={p.type} />
          <StatusBadge status={p.status} />
        </div>
      </div>

      <h3 className="pr-1 text-[1.0625rem] font-bold leading-snug tracking-tight text-foreground sm:text-lg">
        {p.name}
      </h3>
      <p className="text-xs text-muted-foreground">
        {p.state}
        {p.district ? ` · ${p.district}` : ""} · {p.capacityMW} MW
      </p>

      {middle ?? (
        <div className="opp-browse-card-land">
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Scheme</div>
          <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11.5px] leading-snug text-foreground/90">
            {p.opportunityName}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{p.ippName}</p>
        </div>
      )}

      <div className="mt-1">
        <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">SLA runway</span>
          <span className="tabular-nums text-foreground/70">
            {overdue
              ? `${Math.abs(daysLeft)}d overdue`
              : daysLeft === 0
                ? "Due today"
                : `${daysLeft}d left`}
          </span>
        </div>
        <div className="opp-browse-progress-track mt-1.5">
          <div
            className={cn(
              "opp-browse-progress-fill",
              overdue && "bg-gradient-to-r from-destructive to-destructive/80 shadow-none",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="text-[11px] text-muted-foreground">
            SLA due <span className="font-medium text-foreground">{formatDate(p.slaDueDate)}</span>
          </p>
          <SLABadge status={p.slaStatus} />
        </div>
      </div>

      {footer}
    </article>
  );
}
