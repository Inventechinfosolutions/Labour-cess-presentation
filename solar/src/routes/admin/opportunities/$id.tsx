import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { AppShell } from "@/components/AppShell";
import { OpportunityReadOnlySections } from "@/components/OpportunityReadOnlySections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatOpportunityLandAddressReadOnly } from "@/lib/opportunity-land-display";
import { pageLoadEpochMs } from "@/lib/dates";
import { db, formatDate } from "@/lib/hooks";
import { CalendarClock, Pencil } from "lucide-react";

export const Route = createFileRoute("/admin/opportunities/$id")({
  head: () => ({ meta: [{ title: "Opportunity Details — PMIS" }] }),
  component: AdminOppDetail,
});

function AdminOppDetail() {
  const { id } = Route.useParams();
  const o = db.getOpportunity(id);

  if (!o) {
    return (
      <AppShell role="admin">
        <p className="p-4 text-muted-foreground">Opportunity not found.</p>
      </AppShell>
    );
  }

  const endMs = new Date(o.endDate).getTime();
  const daysLeft = Math.max(0, Math.round((endMs - pageLoadEpochMs) / 86400000));
  const windowLabel =
    o.applicationEndDate && o.applicationStartDate
      ? `${formatDate(o.applicationStartDate)} → ${formatDate(o.applicationEndDate)}`
      : `${formatDate(o.startDate)} → ${formatDate(o.endDate)}`;

  const headingDescription = [
    o.code,
    o.referenceCode ?? null,
    `${o.state} · ${o.district}`,
    `${o.capacityMW} MW`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-normal">
                  {o.type}
                </Badge>
                <Badge variant="outline" className="border-chart-4/30 bg-chart-4/5 text-foreground">
                  {o.status}
                </Badge>
              </div>
              <DataListPageHeading title={o.name} description={headingDescription} />
              <div className="max-w-2xl rounded-xl border border-border/60 bg-muted/20 px-4 py-3 dark:bg-muted/10">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Land (summary)</p>
                <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-foreground/90">
                  {formatOpportunityLandAddressReadOnly(o)}
                </p>
              </div>
            </div>
          }
          right={
            <div className="flex w-full flex-col gap-3 lg:max-w-xs">
              <div className="rounded-xl border border-border/60 bg-muted/15 p-4 dark:bg-muted/10">
                <div className="flex items-start gap-2 text-sm">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold text-foreground">Application window</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{windowLabel}</p>
                    <p className="mt-2 text-xs font-medium text-chart-3">
                      {daysLeft === 0 ? "Closes today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                    </p>
                  </div>
                </div>
              </div>
              <Button type="button" size="lg" className="h-11 shrink-0 rounded-xl gap-2" asChild>
                <Link to="/admin/opportunities/edit/$id" params={{ id: o.id }}>
                  <Pencil className="size-4" aria-hidden />
                  Edit opportunity
                </Link>
              </Button>
              <Button type="button" variant="outline" size="lg" className="h-11 shrink-0 rounded-xl" asChild>
                <Link to="/admin/opportunities">Back to opportunities</Link>
              </Button>
            </div>
          }
        />

        <div>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Opportunity details</h2>
          <OpportunityReadOnlySections o={o} />
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
