import { useMemo, useRef } from 'react';
import {
  Receipt as ReceiptLucide,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  PieChart as PieChartIcon,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  Eye,
  Landmark,
  Activity,
  TrendingUp,
  FileSearch,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter, Link } from '@/router';
import { BudgetStatusBadge } from '@/components/shared/BudgetStatusBadge';
import { ReceiptStatusBadge } from '@/components/shared/ReceiptStatusBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatINR, relativeTime } from '@/lib/format';
import type { BillStatus, BudgetStatus, ReceiptStatus, Role } from '@/store/types';
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

function billsByStatusChartData(bills: { status: BillStatus }[]): PipelineStatusRow[] {
  const order: BillStatus[] = [
    'Draft',
    'Submitted',
    'Under Verification',
    'Sent Back',
    'Verification Approved',
    'Approved',
    'Rejected',
    'Payment Processing',
    'Paid',
  ];
  return order.map((status) => ({
    label: status,
    count: bills.filter((b) => b.status === status).length,
  }));
}

function budgetsByStatusChartData(budgets: { status: BudgetStatus }[]): PipelineStatusRow[] {
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
    count: budgets.filter((x) => x.status === r.status).length,
  }));
}

function receiptsByStatusChartData(receipts: { status: ReceiptStatus }[]): PipelineStatusRow[] {
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
    count: receipts.filter((x) => x.status === r.status).length,
  }));
}

export function VerifierDashboard() {
  const { bills, tasks, budgets, receipts, auditLogs, taskCountFor } = useApp();
  const { navigate } = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const chartTokens = useDashboardChartTokens();
  useDashboardReveal(rootRef);

  const myTasks = tasks.filter((t) => t.assignedToRole === 'Verifier' && t.status === 'Pending');
  const sortedTasks = useMemo(
    () => [...myTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8),
    [myTasks],
  );

  const verifyQueueBills = useMemo(
    () =>
      [...bills]
        .filter((b) => ['Submitted', 'Under Verification'].includes(b.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [bills],
  );
  const verifyQueueBudgets = useMemo(
    () =>
      [...budgets]
        .filter((b) => b.status === 'Submitted')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [budgets],
  );
  const verifyQueueReceipts = useMemo(
    () =>
      [...receipts]
        .filter((r) => r.status === 'Submitted')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [receipts],
  );

  const institutionBudget = useMemo(() => {
    const approved = budgets.filter((b) => b.status === 'Approved');
    if (approved.length === 0) return null;
    return approved.sort(
      (a, b) => new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime(),
    )[0];
  }, [budgets]);
  const budgetBundle = useMemo(() => buildBudgetUtilisationBundle(institutionBudget), [institutionBudget]);
  const budgetHeading =
    institutionBudget?.name != null
      ? `${institutionBudget.name} — institutional allocation vs utilisation`
      : 'University Annual Operating Budget — allocation vs utilisation';

  const kpis: DashboardKpi[] = [
    {
      variant: 'featured',
      title: 'Verify queue',
      value: taskCountFor('Verifier'),
      pill: 'Your inbox',
      sub: 'Bills, budgets & receipts',
      icon: FileSearch,
      onClick: () => navigate('/tasks'),
    },
    {
      variant: 'default',
      title: 'Bills in review',
      value: bills.filter((b) => ['Submitted', 'Under Verification'].includes(b.status)).length,
      sub: 'Campus-wide pipeline',
      icon: ReceiptLucide,
      onClick: () => navigate('/bills'),
      iconTone: 'teal',
    },
    {
      variant: 'default',
      title: 'Budgets submitted',
      value: budgets.filter((b) => b.status === 'Submitted').length,
      sub: 'Awaiting verification',
      icon: PieChartIcon,
      onClick: () => navigate('/budgets'),
      iconTone: 'amber',
    },
    {
      variant: 'default',
      title: 'Receipts submitted',
      value: receipts.filter((r) => r.status === 'Submitted').length,
      sub: 'Incoming payments',
      icon: ArrowDownToLine,
      onClick: () => navigate('/receipts'),
      iconTone: 'emerald',
    },
  ];

  return (
    <div ref={rootRef} className="fms-dashboard relative mx-auto w-full max-w-[1600px] px-4 pb-12 md:px-6">
      <section className="creator-dash-reveal mb-8 pt-4 md:pt-6" aria-labelledby="verifier-dashboard-heading">
        <div className="min-w-0 space-y-2">
          <h1 id="verifier-dashboard-heading" className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">
            Verifier dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            First-line checks on bills, budgets and receipts before they advance to finance or approvers.
          </p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <PipelineByStatusBarPanel
          kicker="Bills"
          blurb="Institutional bill pipeline — spot bottlenecks early."
          data={billsByStatusChartData(bills)}
          chartTokens={chartTokens}
        />
        <PipelineByStatusBarPanel
          kicker="Budgets"
          blurb="Budget lifecycle across all entities."
          data={budgetsByStatusChartData(budgets)}
          chartTokens={chartTokens}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="fms-dashboard-section-label mb-1">Action required</p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Verification tasks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Complete items to unblock downstream approval</p>
            </div>
            <Link to="/tasks" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Open queue →
            </Link>
          </div>
          {sortedTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center text-sm text-muted-foreground">
              No pending verification tasks.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <DashboardTaskRow key={task.taskId} task={task} bills={bills} budgets={budgets} receipts={receipts} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
        <AuditPulsePanel auditLogs={auditLogs} />
      </div>

      <section className="mb-10" aria-label="Verifier queues">
        <div className="mb-6">
          <p className="fms-dashboard-section-label mb-2">Queues</p>
          <h2 className="fms-dashboard-title text-xl text-foreground md:text-2xl">What needs eyes next</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Latest records sitting in verification states — open any row to complete checks.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <SnapshotFeedCard
            title="Bills to verify"
            subtitle="Submitted & under verification"
            href="/bills"
            icon={ReceiptLucide}
            accent="chart1"
            rows={verifyQueueBills}
            empty="No bills awaiting verification."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{b.payeeName}</span>
                  <span className="text-[11px] text-muted-foreground">{b.billId}</span>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Budgets submitted"
            subtitle="Awaiting verifier sign-off"
            href="/budgets"
            icon={PieChartIcon}
            accent="chart2"
            rows={verifyQueueBudgets}
            empty="No budgets in submitted state."
            rowKey={(bg) => bg.id}
            renderRow={(bg) => (
              <button
                type="button"
                onClick={() => navigate(`/budgets/${bg.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{bg.name}</span>
                  <span className="text-[11px] text-muted-foreground">{bg.entityName}</span>
                </div>
                <BudgetStatusBadge status={bg.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Receipts submitted"
            subtitle="Incoming payments to validate"
            href="/receipts"
            icon={ArrowDownToLine}
            accent="chart3"
            rows={verifyQueueReceipts}
            empty="No receipts awaiting verification."
            rowKey={(r) => r.id}
            renderRow={(r) => (
              <button
                type="button"
                onClick={() => navigate(`/receipts/${r.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{r.payerName}</span>
                  <span className="text-[11px] text-muted-foreground">{r.receiptNumber}</span>
                </div>
                <ReceiptStatusBadge status={r.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
        </div>
      </section>

      <BudgetUtilisationSection chartTokens={chartTokens} headingDetail={budgetHeading} bundle={budgetBundle} />
    </div>
  );
}

export function ApproverDashboard() {
  const { bills, tasks, budgets, receipts, auditLogs, taskCountFor } = useApp();
  const { navigate } = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const chartTokens = useDashboardChartTokens();
  useDashboardReveal(rootRef);

  const myTasks = tasks.filter((t) => t.assignedToRole === 'Approver' && t.status === 'Pending');
  const sortedTasks = useMemo(
    () => [...myTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8),
    [myTasks],
  );

  const readyBudgets = useMemo(
    () =>
      [...budgets]
        .filter((b) => b.status === 'Verified')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [budgets],
  );
  const recentApproved = useMemo(
    () =>
      [...budgets]
        .filter((b) => b.status === 'Approved')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [budgets],
  );
  const billsPostVerify = useMemo(
    () =>
      [...bills]
        .filter((b) => ['Verification Approved', 'Approved', 'Payment Processing', 'Paid'].includes(b.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [bills],
  );

  const institutionBudget = useMemo(() => {
    const approved = budgets.filter((b) => b.status === 'Approved');
    if (approved.length === 0) return null;
    return approved.sort(
      (a, b) => new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime(),
    )[0];
  }, [budgets]);
  const budgetBundle = useMemo(() => buildBudgetUtilisationBundle(institutionBudget), [institutionBudget]);
  const budgetHeading =
    institutionBudget?.name != null
      ? `${institutionBudget.name} — allocation vs utilisation (approved baseline)`
      : 'University Annual Operating Budget — allocation vs utilisation';

  const kpis: DashboardKpi[] = [
    {
      variant: 'featured',
      title: 'Approve queue',
      value: taskCountFor('Approver'),
      pill: 'Decision inbox',
      sub: 'Budgets ready for sign-off',
      icon: Landmark,
      onClick: () => navigate('/tasks'),
    },
    {
      variant: 'default',
      title: 'Verified budgets',
      value: budgets.filter((b) => b.status === 'Verified').length,
      sub: 'Awaiting your approval',
      icon: Clock,
      onClick: () => navigate('/budgets?status=Verified'),
      iconTone: 'teal',
    },
    {
      variant: 'default',
      title: 'Approved FY',
      value: budgets.filter((b) => b.status === 'Approved').length,
      sub: 'Locked-in plans',
      icon: CheckCircle2,
      onClick: () => navigate('/budgets?status=Approved'),
      iconTone: 'emerald',
    },
    {
      variant: 'default',
      title: 'On hold / rejected',
      value: budgets.filter((b) => b.status === 'On Hold' || b.status === 'Rejected').length,
      sub: 'Needs follow-up',
      icon: AlertTriangle,
      onClick: () => navigate('/budgets'),
      iconTone: 'amber',
    },
  ];

  return (
    <div ref={rootRef} className="fms-dashboard relative mx-auto w-full max-w-[1600px] px-4 pb-12 md:px-6">
      <section className="creator-dash-reveal mb-8 pt-4 md:pt-6" aria-labelledby="approver-dashboard-heading">
        <div className="min-w-0 space-y-2">
          <h1 id="approver-dashboard-heading" className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">
            Approver dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            Final calls on verified budgets and institutional commitments — align fiscal guardrails before execution.
          </p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <PipelineByStatusBarPanel
          kicker="Budgets"
          blurb="Where each budget sits in the approval lifecycle."
          data={budgetsByStatusChartData(budgets)}
          chartTokens={chartTokens}
        />
        <PipelineByStatusBarPanel
          kicker="Bills"
          blurb="Expense pipeline after verification — context for cash planning."
          data={billsByStatusChartData(bills)}
          chartTokens={chartTokens}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="fms-dashboard-section-label mb-1">Action required</p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Approval tasks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Budget decisions routed to you</p>
            </div>
            <Link to="/tasks" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Open queue →
            </Link>
          </div>
          {sortedTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center text-sm text-muted-foreground">
              No pending approval tasks.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <DashboardTaskRow key={task.taskId} task={task} bills={bills} budgets={budgets} receipts={receipts} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
        <AuditPulsePanel auditLogs={auditLogs} />
      </div>

      <section className="mb-10" aria-label="Approver activity">
        <div className="mb-6">
          <p className="fms-dashboard-section-label mb-2">Budget governance</p>
          <h2 className="fms-dashboard-title text-xl text-foreground md:text-2xl">Decisions & downstream impact</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Verified budgets awaiting you, recent approvals, and how bills are progressing after verification.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <SnapshotFeedCard
            title="Ready to approve"
            subtitle="Verified — pending your decision"
            href="/budgets"
            icon={PieChartIcon}
            accent="chart1"
            rows={readyBudgets}
            empty="No budgets awaiting final approval."
            rowKey={(bg) => bg.id}
            renderRow={(bg) => (
              <button
                type="button"
                onClick={() => navigate(`/budgets/${bg.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{bg.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    FY {bg.fy} · {relativeTime(bg.updatedAt)}
                  </span>
                </div>
                <BudgetStatusBadge status={bg.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Recently approved"
            subtitle="Plans you can reference"
            href="/budgets?status=Approved"
            icon={CheckCircle2}
            accent="chart2"
            rows={recentApproved}
            empty="No approved budgets yet."
            rowKey={(bg) => bg.id}
            renderRow={(bg) => (
              <button
                type="button"
                onClick={() => navigate(`/budgets/${bg.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{bg.name}</span>
                  <span className="text-[11px] text-muted-foreground">{bg.entityName}</span>
                </div>
                <BudgetStatusBadge status={bg.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Bills post-verification"
            subtitle="Spend flowing toward finance / payment"
            href="/bills"
            icon={ReceiptLucide}
            accent="chart3"
            rows={billsPostVerify}
            empty="No bills past verification yet."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{b.payeeName}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(b.amount)}</span>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
        </div>
      </section>

      <BudgetUtilisationSection chartTokens={chartTokens} headingDetail={budgetHeading} bundle={budgetBundle} />
    </div>
  );
}

export function FinanceDashboard() {
  const { bills, tasks, budgets, receipts, auditLogs, taskCountFor } = useApp();
  const { navigate } = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const chartTokens = useDashboardChartTokens();
  useDashboardReveal(rootRef);

  const myTasks = tasks.filter((t) => t.assignedToRole === 'Finance' && t.status === 'Pending');
  const sortedTasks = useMemo(
    () => [...myTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8),
    [myTasks],
  );

  const overBudgetHeadsCount = useMemo(() => {
    let n = 0;
    for (const bg of budgets) {
      for (const h of bg.heads) {
        if (h.allocated > 0 && (h.utilized + h.reserved) / h.allocated > 0.9) n++;
      }
    }
    return n;
  }, [budgets]);

  const financeBills = useMemo(
    () =>
      [...bills]
        .filter((b) => ['Verification Approved', 'Approved', 'Payment Processing'].includes(b.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [bills],
  );
  const financeReceipts = useMemo(
    () =>
      [...receipts]
        .filter((r) => ['Verified', 'Approved', 'Submitted'].includes(r.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [receipts],
  );
  const financeBudgets = useMemo(
    () =>
      [...budgets]
        .filter((b) => ['Submitted', 'Verified', 'Approved', 'Locked'].includes(b.status))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [budgets],
  );

  const institutionBudget = useMemo(() => {
    const approved = budgets.filter((b) => b.status === 'Approved' || b.status === 'Locked');
    if (approved.length === 0) return null;
    return approved.sort(
      (a, b) => new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime(),
    )[0];
  }, [budgets]);
  const budgetBundle = useMemo(() => buildBudgetUtilisationBundle(institutionBudget), [institutionBudget]);
  const budgetHeading =
    institutionBudget?.name != null
      ? `${institutionBudget.name} — fiscal monitoring & utilisation`
      : 'University Annual Operating Budget — allocation vs utilisation';

  const approvedValue = bills.filter((b) => ['Approved', 'Paid'].includes(b.status)).reduce((a, b) => a + b.amount, 0);

  const kpis: DashboardKpi[] = [
    {
      variant: 'featured',
      title: 'Finance actions',
      value: taskCountFor('Finance'),
      pill: 'Approval & review',
      sub: 'Bills & receipts',
      icon: Landmark,
      onClick: () => navigate('/tasks'),
    },
    {
      variant: 'default',
      title: 'Approved bills',
      value: bills.filter((b) => b.status === 'Approved' || b.status === 'Payment Processing').length,
      sub: 'Ready or paying',
      icon: CheckCircle2,
      onClick: () => navigate('/bills'),
      iconTone: 'teal',
    },
    {
      variant: 'default',
      title: 'Budget alerts',
      value: overBudgetHeadsCount,
      sub: 'Heads over 90% utilisation',
      icon: AlertTriangle,
      onClick: () => navigate('/budgets'),
      iconTone: 'amber',
    },
    {
      variant: 'default',
      title: 'Approved value',
      value: Math.round(approvedValue / 100_000) / 10,
      sub: '₹ Cr — bills cleared',
      icon: TrendingUp,
      onClick: () => navigate('/reports'),
      iconTone: 'emerald',
    },
  ];

  return (
    <div ref={rootRef} className="fms-dashboard relative mx-auto w-full max-w-[1600px] px-4 pb-12 md:px-6">
      <section className="creator-dash-reveal mb-8 pt-4 md:pt-6" aria-labelledby="finance-dashboard-heading">
        <div className="min-w-0 space-y-2">
          <h1 id="finance-dashboard-heading" className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">
            Finance officer dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            Approve expenditure, monitor budgets and shepherd inflows after verifier and approver gates.
          </p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <PipelineByStatusBarPanel
          kicker="Bills"
          blurb="End-to-end bill states — from verification through disbursement."
          data={billsByStatusChartData(bills)}
          chartTokens={chartTokens}
        />
        <PipelineByStatusBarPanel
          kicker="Receipts"
          blurb="Incoming payments and confirmations across campus."
          data={receiptsByStatusChartData(receipts)}
          chartTokens={chartTokens}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="fms-dashboard-section-label mb-1">Action required</p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Finance tasks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Bill approval, receipt review & overrides</p>
            </div>
            <Link to="/tasks" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Open queue →
            </Link>
          </div>
          {sortedTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center text-sm text-muted-foreground">
              No pending finance tasks.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <DashboardTaskRow key={task.taskId} task={task} bills={bills} budgets={budgets} receipts={receipts} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
        <AuditPulsePanel auditLogs={auditLogs} />
      </div>

      <section className="mb-10" aria-label="Finance pulse">
        <div className="mb-6">
          <p className="fms-dashboard-section-label mb-2">Operational lens</p>
          <h2 className="fms-dashboard-title text-xl text-foreground md:text-2xl">Cash & commitment</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Bills moving through finance, receipts in workflow, and active budget envelopes.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <SnapshotFeedCard
            title="Bills in finance"
            subtitle="Post-verification approvals"
            href="/bills"
            icon={ReceiptLucide}
            accent="chart1"
            rows={financeBills}
            empty="No bills in finance stages."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{b.payeeName}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(b.amount)}</span>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Receipts pipeline"
            subtitle="Inflows to validate or confirm"
            href="/receipts"
            icon={ArrowDownToLine}
            accent="chart2"
            rows={financeReceipts}
            empty="No receipts in finance view."
            rowKey={(r) => r.id}
            renderRow={(r) => (
              <button
                type="button"
                onClick={() => navigate(`/receipts/${r.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{r.payerName}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(r.amount)}</span>
                </div>
                <ReceiptStatusBadge status={r.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Budget envelopes"
            subtitle="Active & locked plans"
            href="/budgets"
            icon={PieChartIcon}
            accent="chart3"
            rows={financeBudgets}
            empty="No budgets in active states."
            rowKey={(bg) => bg.id}
            renderRow={(bg) => (
              <button
                type="button"
                onClick={() => navigate(`/budgets/${bg.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{bg.name}</span>
                  <span className="text-[11px] text-muted-foreground">{bg.entityName}</span>
                </div>
                <BudgetStatusBadge status={bg.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
        </div>
      </section>

      <BudgetUtilisationSection chartTokens={chartTokens} headingDetail={budgetHeading} bundle={budgetBundle} />
    </div>
  );
}

export function PaymentDashboard() {
  const { bills, tasks, budgets, receipts, auditLogs, taskCountFor } = useApp();
  const { navigate } = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const chartTokens = useDashboardChartTokens();
  useDashboardReveal(rootRef);

  const myTasks = tasks.filter((t) => t.assignedToRole === 'Payment' && t.status === 'Pending');
  const sortedTasks = useMemo(
    () => [...myTasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8),
    [myTasks],
  );

  const today = new Date().toDateString();
  const paidToday = bills.filter((b) => b.status === 'Paid' && b.paidAt && new Date(b.paidAt).toDateString() === today).length;

  const readyToPay = useMemo(
    () =>
      [...bills]
        .filter((b) => b.status === 'Approved' || b.status === 'Payment Processing')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [bills],
  );
  const recentPaid = useMemo(
    () =>
      [...bills]
        .filter((b) => b.status === 'Paid')
        .sort((a, b) => new Date(b.paidAt ?? b.updatedAt).getTime() - new Date(a.paidAt ?? a.updatedAt).getTime())
        .slice(0, 5),
    [bills],
  );

  const institutionBudget = useMemo(() => {
    const approved = budgets.filter((b) => b.status === 'Approved' || b.status === 'Locked');
    if (approved.length === 0) return null;
    return approved.sort(
      (a, b) => new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime(),
    )[0];
  }, [budgets]);
  const budgetBundle = useMemo(() => buildBudgetUtilisationBundle(institutionBudget), [institutionBudget]);
  const budgetHeading =
    institutionBudget?.name != null
      ? `${institutionBudget.name} — utilisation vs outflows`
      : 'University Annual Operating Budget — allocation vs utilisation';

  const kpis: DashboardKpi[] = [
    {
      variant: 'featured',
      title: 'Payment runs',
      value: taskCountFor('Payment'),
      pill: 'Disbursement queue',
      sub: 'Approved bills',
      icon: CreditCard,
      onClick: () => navigate('/tasks'),
    },
    {
      variant: 'default',
      title: 'Processed today',
      value: paidToday,
      sub: 'Marked paid today',
      icon: CheckCircle2,
      onClick: () => navigate('/payments'),
      iconTone: 'emerald',
    },
    {
      variant: 'default',
      title: 'Total paid (FY)',
      value: Math.round(bills.filter((b) => b.status === 'Paid').reduce((a, b) => a + b.amount, 0) / 100_000) / 10,
      sub: '₹ Cr disbursed',
      icon: TrendingUp,
      onClick: () => navigate('/payments'),
      iconTone: 'teal',
    },
    {
      variant: 'default',
      title: 'Reconciliation',
      value: bills.filter((b) => b.status === 'Paid').length,
      sub: 'Paid vouchers · drill in',
      icon: Activity,
      onClick: () => navigate('/reconciliation'),
      iconTone: 'amber',
    },
  ];

  const paymentStageData = useMemo((): PipelineStatusRow[] => {
    const labels = [
      { key: 'Approved' as const, label: 'Approved' },
      { key: 'Payment Processing' as const, label: 'Processing' },
      { key: 'Paid' as const, label: 'Paid' },
    ];
    return labels.map(({ key, label }) => ({
      label,
      count: bills.filter((b) => b.status === key).length,
    }));
  }, [bills]);

  return (
    <div ref={rootRef} className="fms-dashboard relative mx-auto w-full max-w-[1600px] px-4 pb-12 md:px-6">
      <section className="creator-dash-reveal mb-8 pt-4 md:pt-6" aria-labelledby="payment-dashboard-heading">
        <div className="min-w-0 space-y-2">
          <h1 id="payment-dashboard-heading" className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">
            Payment officer dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            Execute disbursements, instrument references and reconciliation against approved obligations.
          </p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <PipelineByStatusBarPanel
          kicker="Disbursement"
          blurb="Approved → processing → paid — your operational runway."
          data={paymentStageData}
          chartTokens={chartTokens}
        />
        <PipelineByStatusBarPanel
          kicker="All bills"
          blurb="Full pipeline context while you run payment batches."
          data={billsByStatusChartData(bills)}
          chartTokens={chartTokens}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="fms-dashboard-section-label mb-1">Action required</p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Payment tasks</h3>
              <p className="mt-1 text-xs text-muted-foreground">Post instruments & confirm bank outcomes</p>
            </div>
            <Link to="/tasks" className="shrink-0 text-sm font-medium text-primary hover:underline">
              Open queue →
            </Link>
          </div>
          {sortedTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-14 text-center text-sm text-muted-foreground">
              No pending payment tasks.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTasks.map((task) => (
                <DashboardTaskRow key={task.taskId} task={task} bills={bills} budgets={budgets} receipts={receipts} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
        <AuditPulsePanel auditLogs={auditLogs} />
      </div>

      <section className="mb-10" aria-label="Payment snapshots">
        <div className="mb-6">
          <p className="fms-dashboard-section-label mb-2">Execution</p>
          <h2 className="fms-dashboard-title text-xl text-foreground md:text-2xl">Runs & settlements</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            What is cleared for disbursement and what has recently left the account.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <SnapshotFeedCard
            title="Ready to pay"
            subtitle="Approved & processing"
            href="/bills"
            icon={CreditCard}
            accent="chart1"
            rows={readyToPay}
            empty="Nothing waiting in the payment queue."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{b.payeeName}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(b.amount)}</span>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Recently paid"
            subtitle="Latest settlements"
            href="/payments"
            icon={CheckCircle2}
            accent="chart2"
            rows={recentPaid}
            empty="No paid vouchers yet."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{b.payeeName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {b.paidAt ? relativeTime(b.paidAt) : relativeTime(b.updatedAt)}
                  </span>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Receipts (context)"
            subtitle="Inflows while you reconcile outflows"
            href="/receipts"
            icon={ArrowDownToLine}
            accent="chart3"
            rows={[...receipts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)}
            empty="No receipts on file."
            rowKey={(r) => r.id}
            renderRow={(r) => (
              <button
                type="button"
                onClick={() => navigate(`/receipts/${r.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{r.payerName}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(r.amount)}</span>
                </div>
                <ReceiptStatusBadge status={r.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
        </div>
      </section>

      <BudgetUtilisationSection chartTokens={chartTokens} headingDetail={budgetHeading} bundle={budgetBundle} />
    </div>
  );
}

export function AuditorDashboard() {
  const { bills, budgets, receipts, auditLogs } = useApp();
  const { navigate } = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const chartTokens = useDashboardChartTokens();
  useDashboardReveal(rootRef);

  const nowMs = Date.now();
  const last24h = auditLogs.filter((l) => nowMs - new Date(l.at).getTime() < 86_400_000).length;
  const modulesCount = useMemo(() => new Set(auditLogs.map((l) => l.module)).size, [auditLogs]);

  const auditByModule = useMemo((): PipelineStatusRow[] => {
    const counts = auditLogs.reduce<Record<string, number>>((acc, l) => {
      acc[l.module] = (acc[l.module] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [auditLogs]);

  const snapshotBills = useMemo(
    () => [...bills].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [bills],
  );
  const snapshotReceipts = useMemo(
    () => [...receipts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [receipts],
  );
  const snapshotBudgets = useMemo(
    () => [...budgets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [budgets],
  );

  const institutionBudget = useMemo(() => {
    const approved = budgets.filter((b) => b.status === 'Approved' || b.status === 'Locked');
    if (approved.length === 0) return null;
    return approved.sort(
      (a, b) => new Date(b.approvedAt ?? b.updatedAt).getTime() - new Date(a.approvedAt ?? a.updatedAt).getTime(),
    )[0];
  }, [budgets]);
  const budgetBundle = useMemo(() => buildBudgetUtilisationBundle(institutionBudget), [institutionBudget]);
  const budgetHeading =
    institutionBudget?.name != null
      ? `${institutionBudget.name} — read-only utilisation snapshot`
      : 'University Annual Operating Budget — allocation vs utilisation';

  const kpis: DashboardKpi[] = [
    {
      variant: 'featured',
      title: 'Audit entries',
      value: auditLogs.length,
      pill: 'Immutable trail',
      sub: 'Institutional log',
      icon: ShieldCheck,
      onClick: () => navigate('/audit'),
    },
    {
      variant: 'default',
      title: 'Last 24 hours',
      value: last24h,
      sub: 'Recent actions',
      icon: Activity,
      onClick: () => navigate('/audit'),
      iconTone: 'teal',
    },
    {
      variant: 'default',
      title: 'Modules covered',
      value: modulesCount,
      sub: 'Distinct areas',
      icon: Eye,
      onClick: () => navigate('/audit'),
      iconTone: 'amber',
    },
    {
      variant: 'default',
      title: 'Total bills',
      value: bills.length,
      sub: 'Expense vouchers',
      icon: ReceiptLucide,
      onClick: () => navigate('/bills'),
      iconTone: 'emerald',
    },
  ];

  return (
    <div ref={rootRef} className="fms-dashboard relative mx-auto w-full max-w-[1600px] px-4 pb-12 md:px-6">
      <section className="creator-dash-reveal mb-8 pt-4 md:pt-6" aria-labelledby="auditor-dashboard-heading">
        <div className="min-w-0 space-y-2">
          <h1 id="auditor-dashboard-heading" className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">
            Audit dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            Read-only oversight across bills, receipts, budgets and the tamper-evident activity trail — no workflow actions.
          </p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <PipelineByStatusBarPanel
          kicker="Audit trail"
          blurb="Volume of logged actions by module — drill into Audit Logs for detail."
          data={auditByModule.length ? auditByModule : [{ label: '—', count: 0 }]}
          chartTokens={chartTokens}
        />
        <PipelineByStatusBarPanel
          kicker="Bills"
          blurb="Institutional expense distribution — monitor outliers and stuck states."
          data={billsByStatusChartData(bills)}
          chartTokens={chartTokens}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7 lg:col-span-2">
          <div className="mb-5">
            <p className="fms-dashboard-section-label mb-1">Coverage</p>
            <h3 className="fms-dashboard-title text-xl text-foreground">Read-only workspace</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tasks are hidden for auditors — use Bills, Receipts, Budgets, Payments and Audit Logs from the navigation rail.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/audit"
              className="creator-dash-reveal rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/35 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">Full audit logs</div>
                  <div className="text-xs text-muted-foreground">Filter by role, module & export CSV</div>
                </div>
              </div>
            </Link>
            <Link
              to="/reports"
              className="creator-dash-reveal rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/35 hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18">
                  <Activity className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">Reports</div>
                  <div className="text-xs text-muted-foreground">Cross-cutting fiscal insights</div>
                </div>
              </div>
            </Link>
            <Link
              to="/payments"
              className="creator-dash-reveal rounded-xl border border-border/80 bg-card p-4 shadow-sm transition hover:border-primary/35 hover:bg-muted/30 sm:col-span-2"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18">
                  <CreditCard className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">Payments & reconciliation</div>
                  <div className="text-xs text-muted-foreground">Review disbursement records without mutating state</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <AuditPulsePanel auditLogs={auditLogs} />
      </div>

      <section className="mb-10" aria-label="Auditor snapshots">
        <div className="mb-6">
          <p className="fms-dashboard-section-label mb-2">Institution snapshot</p>
          <h2 className="fms-dashboard-title text-xl text-foreground md:text-2xl">Latest movements</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Recent bills, receipts and budgets — open read-only detail views for sampling and testing.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <SnapshotFeedCard
            title="Recent bills"
            subtitle="Expense vouchers"
            href="/bills"
            icon={ReceiptLucide}
            accent="chart1"
            rows={snapshotBills}
            empty="No bills."
            rowKey={(b) => b.billId}
            renderRow={(b) => (
              <button
                type="button"
                onClick={() => navigate(`/bills/${b.billId}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{b.payeeName}</span>
                  <span className="text-[11px] text-muted-foreground">{b.billId}</span>
                </div>
                <StatusBadge status={b.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Recent receipts"
            subtitle="Incoming payments"
            href="/receipts"
            icon={ArrowDownToLine}
            accent="chart2"
            rows={snapshotReceipts}
            empty="No receipts."
            rowKey={(r) => r.id}
            renderRow={(r) => (
              <button
                type="button"
                onClick={() => navigate(`/receipts/${r.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{r.payerName}</span>
                  <span className="text-[11px] text-muted-foreground">{formatINR(r.amount)}</span>
                </div>
                <ReceiptStatusBadge status={r.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
          <SnapshotFeedCard
            title="Recent budgets"
            subtitle="Plans & allocations"
            href="/budgets"
            icon={PieChartIcon}
            accent="chart3"
            rows={snapshotBudgets}
            empty="No budgets."
            rowKey={(bg) => bg.id}
            renderRow={(bg) => (
              <button
                type="button"
                onClick={() => navigate(`/budgets/${bg.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate font-medium text-foreground">{bg.name}</span>
                  <span className="text-[11px] text-muted-foreground">{bg.entityName}</span>
                </div>
                <BudgetStatusBadge status={bg.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" aria-hidden />
              </button>
            )}
          />
        </div>
      </section>

      <BudgetUtilisationSection chartTokens={chartTokens} headingDetail={budgetHeading} bundle={budgetBundle} />
    </div>
  );
}

export function RoleDashboard({ role }: { role: Exclude<Role, 'Creator'> }) {
  switch (role) {
    case 'Verifier':
      return <VerifierDashboard />;
    case 'Approver':
      return <ApproverDashboard />;
    case 'Finance':
      return <FinanceDashboard />;
    case 'Payment':
      return <PaymentDashboard />;
    case 'Auditor':
      return <AuditorDashboard />;
    default:
      return <VerifierDashboard />;
  }
}
