import { useMemo, useRef } from 'react';
import {
  Receipt as ReceiptLucide,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  PieChart as PieChartIcon,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter, Link } from '@/router';
import { BudgetStatusBadge } from '@/components/shared/BudgetStatusBadge';
import { ReceiptStatusBadge } from '@/components/shared/ReceiptStatusBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatINR, relativeTime } from '@/lib/format';
import type { BudgetStatus, ReceiptStatus } from '@/store/types';
import {
  PipelineByStatusBarPanel,
  SnapshotFeedCard,
  DashboardTaskRow,
  KpiStrip,
  AuditPulsePanel,
  BudgetUtilisationSection,
  buildBudgetUtilisationBundle,
  useDashboardChartTokens,
  useDashboardReveal,
  type DashboardKpi,
  type PipelineStatusRow,
} from '@/pages/dashboard/shared';

export function CreatorDashboard() {
  const { currentUser, bills, tasks, budgets, receipts, auditLogs } = useApp();
  const { navigate } = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const chartTokens = useDashboardChartTokens();
  useDashboardReveal(rootRef);

  const myTasks = tasks.filter((t) => t.assignedToRole === 'Creator' && t.status === 'Pending');
  const myBills = useMemo(
    () => bills.filter((b) => b.createdByRole === 'Creator' && b.createdBy === currentUser),
    [bills, currentUser],
  );
  const myReceipts = useMemo(() => receipts.filter((r) => r.createdBy === currentUser), [receipts, currentUser]);
  const myBudgets = useMemo(() => budgets.filter((b) => b.createdBy === currentUser), [budgets, currentUser]);

  const creatorTasksSorted = useMemo(
    () => [...myTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8),
    [myTasks],
  );

  const receiptByStatusChartData = useMemo((): PipelineStatusRow[] => {
    const rows: { status: ReceiptStatus; label: string }[] = [
      { status: 'Draft', label: 'Draft' },
      { status: 'Submitted', label: 'Submitted' },
      { status: 'Verified', label: 'Verified' },
      { status: 'Approved', label: 'Approved' },
      { status: 'Confirmed', label: 'Confirmed' },
      { status: 'Sent Back', label: 'Sent back' },
      { status: 'Rejected', label: 'Rejected' },
      { status: 'On Hold', label: 'On hold' },
    ];
    return rows.map((r) => ({
      label: r.label,
      count: myReceipts.filter((x) => x.status === r.status).length,
    }));
  }, [myReceipts]);

  const budgetByStatusChartData = useMemo((): PipelineStatusRow[] => {
    const rows: { status: BudgetStatus; label: string }[] = [
      { status: 'Draft', label: 'Draft' },
      { status: 'Submitted', label: 'Submitted' },
      { status: 'Verified', label: 'Verified' },
      { status: 'Approved', label: 'Approved' },
      { status: 'Rejected', label: 'Rejected' },
      { status: 'Sent Back', label: 'Sent back' },
      { status: 'On Hold', label: 'On hold' },
      { status: 'Locked', label: 'Locked' },
    ];
    return rows.map((r) => ({
      label: r.label,
      count: myBudgets.filter((x) => x.status === r.status).length,
    }));
  }, [myBudgets]);

  const creatorBudgetUtil = useMemo(() => {
    const approved = myBudgets.filter((b) => b.status === 'Approved');
    if (approved.length === 0) return null;
    return approved.sort(
      (a, b) => new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime(),
    )[0];
  }, [myBudgets]);

  const budgetUtilisationBundle = useMemo(() => buildBudgetUtilisationBundle(creatorBudgetUtil), [creatorBudgetUtil]);

  const snapshotBills = useMemo(
    () => [...myBills].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [myBills],
  );
  const snapshotReceipts = useMemo(
    () => [...myReceipts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [myReceipts],
  );
  const snapshotBudgets = useMemo(
    () => [...myBudgets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [myBudgets],
  );

  const kpis: DashboardKpi[] = [
    {
      variant: 'featured',
      title: 'Bill drafts',
      value: myBills.filter((b) => b.status === 'Draft').length,
      pill: 'Submission queue',
      sub: 'Awaiting submission',
      icon: ReceiptLucide,
      onClick: () => navigate('/bills?status=Draft'),
    },
    {
      variant: 'default',
      title: 'In workflow',
      value: myBills.filter((b) => ['Submitted', 'Verification Approved'].includes(b.status)).length,
      sub: 'With verifier / finance',
      icon: Clock,
      onClick: () => navigate('/bills'),
      iconTone: 'teal',
    },
    {
      variant: 'default',
      title: 'Needs action',
      value: myTasks.filter(
        (t) =>
          t.actionRequired === 'Edit & Resubmit' ||
          t.actionRequired === 'Edit & Resubmit Budget' ||
          t.actionRequired === 'Edit & Resubmit Receipt',
      ).length,
      sub: 'Returned items',
      icon: AlertTriangle,
      onClick: () => navigate('/tasks'),
      iconTone: 'amber',
    },
    {
      variant: 'default',
      title: 'Paid',
      value: myBills.filter((b) => b.status === 'Paid').length,
      sub: 'Completed bills',
      icon: CheckCircle2,
      onClick: () => navigate('/bills?status=Paid'),
      iconTone: 'emerald',
    },
  ];

  const budgetHeading =
    creatorBudgetUtil?.name != null
      ? `${creatorBudgetUtil.name} — allocation vs utilisation`
      : 'University Annual Operating Budget — allocation vs utilisation';

  return (
    <div ref={rootRef} className="fms-dashboard relative w-full max-w-[1600px] mx-auto px-4 md:px-6 pb-12">
      <section className="creator-dash-reveal mb-8 pt-4 md:pt-6" aria-labelledby="creator-dashboard-heading">
        <div className="min-w-0 space-y-2">
          <h1 id="creator-dashboard-heading" className="fms-dashboard-title text-3xl md:text-[2rem] leading-tight text-foreground">
            Creator dashboard
          </h1>
          <p className="max-w-2xl text-sm md:text-[15px] text-muted-foreground leading-relaxed">
            Track your bills, receipts, budgets and open tasks in one place.
          </p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      {myReceipts.some((r) => r.duplicateFlag) && (
        <div className="creator-dash-reveal mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 shadow-sm dark:border-border dark:bg-card">
          <div className="min-w-0 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-bold">Duplicate checks</span>
            {' — review potential duplicate receipts.'}
          </div>
          <Link
            to="/receipts/duplicates"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Review <span aria-hidden>→</span>
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <PipelineByStatusBarPanel
          kicker="Receipts"
          blurb="Live distribution across all your receipts."
          data={receiptByStatusChartData}
          chartTokens={chartTokens}
        />
        <PipelineByStatusBarPanel
          kicker="Budgets"
          blurb="Live distribution across all your budgets."
          data={budgetByStatusChartData}
          chartTokens={chartTokens}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="fms-dashboard-section-label mb-1">Action required</p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Priority tasks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Bills, budgets and receipts awaiting you</p>
            </div>
            <Link to="/tasks" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Open queue →
            </Link>
          </div>
          {creatorTasksSorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center text-sm text-muted-foreground">
              No pending tasks — you are fully aligned.
            </div>
          ) : (
            <div className="space-y-3">
              {creatorTasksSorted.map((task) => (
                <DashboardTaskRow key={task.taskId} task={task} bills={bills} budgets={budgets} receipts={receipts} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
        <AuditPulsePanel auditLogs={auditLogs} />
      </div>

      <section className="mb-10" aria-label="Recent bills, receipts, and budgets">
        <div className="mb-6">
          <p className="fms-dashboard-section-label mb-2">Your portfolio</p>
          <h2 className="fms-dashboard-title text-xl md:text-2xl text-foreground">Recent activity</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Latest records you created — select a row for full detail and supporting documents.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <SnapshotFeedCard
            title="Recent bills"
            subtitle="Latest submission & payment states"
            href="/bills"
            icon={ReceiptLucide}
            accent="chart1"
            rows={snapshotBills}
            empty="No bills yet — create one from Bills."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium leading-snug text-foreground">{b.payeeName}</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px]">{b.billId}</span>
                    <span className="text-border" aria-hidden>
                      ·
                    </span>
                    <span>{relativeTime(b.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={b.status} />
                  <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground">{formatINR(b.amount)}</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Recent receipts"
            subtitle="Inflow confirmations & workflow"
            href="/receipts"
            icon={ArrowDownToLine}
            accent="chart2"
            rows={snapshotReceipts}
            empty="No receipts yet."
            rowKey={(r) => r.id}
            renderRow={(r) => (
              <button
                type="button"
                onClick={() => navigate(`/receipts/${r.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium leading-snug text-foreground">{r.payerName}</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px]">{r.receiptNumber}</span>
                    <span className="text-border" aria-hidden>
                      ·
                    </span>
                    <span>{relativeTime(r.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <ReceiptStatusBadge status={r.status} />
                  <span className="text-sm font-semibold tabular-nums tracking-tight text-foreground">{formatINR(r.amount)}</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Recent budgets"
            subtitle="Plans & approval progress"
            href="/budgets"
            icon={PieChartIcon}
            accent="chart3"
            rows={snapshotBudgets}
            empty="No budgets yet."
            rowKey={(bg) => bg.id}
            renderRow={(bg) => (
              <button
                type="button"
                onClick={() => navigate(`/budgets/${bg.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium leading-snug text-foreground">{bg.name}</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="font-mono text-[10px]">{bg.id}</span>
                    <span className="text-border" aria-hidden>
                      ·
                    </span>
                    <span>FY {bg.fy}</span>
                    <span className="text-border" aria-hidden>
                      ·
                    </span>
                    <span>{relativeTime(bg.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <BudgetStatusBadge status={bg.status} />
                  <span className="max-w-[7rem] truncate text-right text-[11px] font-medium text-muted-foreground sm:max-w-[9rem]">
                    {bg.entityName}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
        </div>
      </section>

      <BudgetUtilisationSection chartTokens={chartTokens} headingDetail={budgetHeading} bundle={budgetUtilisationBundle} />
    </div>
  );
}
