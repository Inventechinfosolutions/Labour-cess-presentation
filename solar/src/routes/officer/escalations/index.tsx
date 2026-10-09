import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { AppShell } from "@/components/AppShell";
import { KPICard } from "@/components/Bits";
import { db, useDbVersion, formatDate } from "@/lib/hooks";

export const Route = createFileRoute("/officer/escalations/")({
  head: () => ({ meta: [{ title: "Escalation Queue — PMIS" }] }),
  component: Esc,
});

function Esc() {
  useDbVersion();
  const breached = db.listProjects().filter((p) => p.slaStatus === "Breached");
  const atRisk = db.listProjects().filter((p) => p.slaStatus === "At Risk");
  const totalEsc = breached.length + atRisk.length;
  return (
    <AppShell role="officer">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Escalation queue"
              count={totalEsc}
              description="SLA-breached and at-risk projects requiring intervention."
            />
          }
          right={null}
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KPICard label="Total Escalations" value={breached.length + atRisk.length} accent="warning" />
        <KPICard label="Breached" value={breached.length} accent="destructive" />
        <KPICard label="At Risk" value={atRisk.length} accent="warning" />
      </div>
      <div className="app-data-panel">
        <table className="app-data-table-grid w-full text-sm">
          <thead>
            <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
              <th className="p-3 text-left">Project</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {breached.map((p) => (
              <tr key={p.id} className="app-data-table-body-row transition">
                <td className="p-3"><Link to="/officer/projects/$id" params={{ id: p.id }} className="font-medium text-destructive">{p.name}</Link><div className="text-xs text-muted-foreground">{p.ippName} · due {formatDate(p.slaDueDate)}</div></td>
                <td className="p-3 text-right"><Link to="/officer/projects/$id" params={{ id: p.id }} className="text-sm text-primary">Resolve →</Link></td>
              </tr>
            ))}
            {breached.length === 0 && (
              <tr className="app-data-table-body-row">
                <td colSpan={2} className="p-6 text-center text-muted-foreground">
                  No breached projects
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </DataListPageShell>
    </AppShell>
  );
}
