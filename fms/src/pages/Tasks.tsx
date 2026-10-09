import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Inbox,
  ArrowRight,
  Eye,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import type {
  Bill,
  Budget,
  BudgetStatus,
  Receipt,
  ReceiptStatus,
  Role,
  Task,
  TaskStatus,
} from '@/store/types';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';
import { TASK_ROLE_TONE, TASK_ROLE_TONE_FALLBACK } from '@/components/shared/taskRoleTone';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';
import { ListTableCardsFlipToggle, type ListViewMode } from '@/components/shared/ListTableCardsFlipToggle';
import { departments } from '@/store/mockData';

type DateFilter = 'all' | 'today' | 'week' | 'month';

const actionTone: Record<string, string> = {
  'Verify Bill': 'status-warn-bg status-warn-text',
  'Approve Bill': 'status-success-bg status-success-text',
  'Process Payment': 'status-info-bg text-primary',
  'Edit & Resubmit': 'status-warn-bg status-warn-text',
  'Verify Budget': 'status-warn-bg status-warn-text',
  'Approve Budget': 'status-success-bg status-success-text',
  'Review Approved Budget': 'status-info-bg text-primary',
  'Edit & Resubmit Budget': 'status-warn-bg status-warn-text',
  'Verify Receipt': 'status-warn-bg status-warn-text',
  'Approve Receipt': 'status-success-bg status-success-text',
  'Edit & Resubmit Receipt': 'status-warn-bg status-warn-text',
  'Approve Cancellation': 'status-danger-bg status-danger-text',
};

const ROWS_OPTIONS = [5, 10, 25] as const;

const BUDGET_STATUS_BADGE: Record<BudgetStatus, string> = {
  Draft: 'badge-draft',
  Submitted: 'badge-submitted',
  Verified: 'badge-verification',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  'Sent Back': 'badge-sentback',
  'On Hold': 'badge-verification',
  Locked: 'badge-paid',
};

const RECEIPT_STATUS_BADGE: Record<ReceiptStatus, string> = {
  Draft: 'badge-draft',
  Submitted: 'badge-submitted',
  Verified: 'badge-verification',
  Approved: 'badge-approved',
  Confirmed: 'badge-paid',
  Rejected: 'badge-rejected',
  'Sent Back': 'badge-sentback',
  'On Hold': 'badge-verification',
  Cancelled: 'badge-rejected',
};

export function TasksPage() {
  const { tasks, bills, budgets, receipts, currentRole } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('Pending');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [listView, setListView] = useState<ListViewMode>('table');

  // Each role sees only tasks assigned to them. (Auditor doesn't have tasks at all.)
  const baseScopedTasks = useMemo(
    () => tasks.filter((t) => t.assignedToRole === role),
    [tasks, role],
  );

  const billByid = useMemo(() => new Map(bills.map((b) => [b.billId, b])), [bills]);
  const budgetById = useMemo(() => new Map(budgets.map((b) => [b.id, b])), [budgets]);
  const receiptById = useMemo(() => new Map(receipts.map((r) => [r.id, r])), [receipts]);

  const subjectDept = (t: Task): string => {
    if (t.subjectType === 'Bill' && t.billId) return billByid.get(t.billId)?.department ?? '';
    if (t.subjectType === 'Budget' && t.budgetId) return budgetById.get(t.budgetId)?.entityName ?? '';
    if (t.subjectType === 'Receipt' && t.receiptId) return receiptById.get(t.receiptId)?.entityName ?? '';
    return '';
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const dayMs = 86_400_000;
    return baseScopedTasks
      .filter((t) =>
        statusFilter === 'all' ? t.status !== 'Completed' : t.status === statusFilter,
      )
      .filter((t) => {
        if (dateFilter === 'all') return true;
        const created = new Date(t.createdAt).getTime();
        if (dateFilter === 'today') return now - created < dayMs;
        if (dateFilter === 'week') return now - created < dayMs * 7;
        if (dateFilter === 'month') return now - created < dayMs * 31;
        return true;
      })
      .filter((t) => (deptFilter === 'all' ? true : subjectDept(t) === deptFilter))
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const bill = t.subjectType === 'Bill' && t.billId ? billByid.get(t.billId) : undefined;
        const budget = t.subjectType === 'Budget' && t.budgetId ? budgetById.get(t.budgetId) : undefined;
        const receipt = t.subjectType === 'Receipt' && t.receiptId ? receiptById.get(t.receiptId) : undefined;
        const tokens = [
          t.taskId,
          t.billId ?? '',
          t.budgetId ?? '',
          t.receiptId ?? '',
          bill?.payeeName ?? '',
          bill?.billType ?? '',
          bill?.department ?? '',
          budget?.name ?? '',
          budget?.entityName ?? '',
          receipt?.receiptNumber ?? '',
          receipt?.payerName ?? '',
          receipt?.entityName ?? '',
        ];
        return tokens.some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseScopedTasks, statusFilter, dateFilter, deptFilter, search, billByid, budgetById, receiptById]);

  const counts = useMemo(() => {
    const pendingMine = baseScopedTasks.filter((t) => t.status === 'Pending').length;
    const completed = baseScopedTasks.filter((t) => t.status === 'Completed').length;
    const rejected = baseScopedTasks.filter((t) => t.status === 'Rejected').length;
    const returned = baseScopedTasks.filter((t) => t.status === 'Returned').length;
    return { pendingMine, completed, rejected, returned };
  }, [baseScopedTasks]);

  const hasActiveFilters =
    statusFilter !== 'Pending' || dateFilter !== 'all' || deptFilter !== 'all' || !!search.trim();

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const pageEnd = Math.min(safePage * rowsPerPage, filtered.length);

  const pagedTasks = useMemo(
    () => filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage),
    [filtered, safePage, rowsPerPage],
  );

  /** Re-run row cascade whenever visible rows change (filters, pagination, data). */
  const tableCascadeKey = useMemo(() => pagedTasks.map((t) => t.taskId).join('|'), [pagedTasks]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, deptFilter, search, role]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const smoothEase = 'power3.out' as const;

    const ctx = gsap.context(() => {
      /* Page sections: soft cascade */
      gsap.fromTo(
        root.querySelectorAll('.list-dash-reveal'),
        { y: -18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: { each: 0.07, ease: smoothEase },
          duration: 0.72,
          ease: smoothEase,
        },
      );

      const theadRow = root.querySelector('table thead tr');
      const bodyRows = root.querySelectorAll('tbody tr.list-dash-row');

      const tl = gsap.timeline({ defaults: { duration: 0.75, ease: smoothEase } });

      /* Table header: gentle settle from above */
      if (theadRow) {
        tl.fromTo(
          theadRow,
          { opacity: 0, y: -22 },
          { opacity: 1, y: 0, duration: 0.68 },
        );
      }

      /* Body rows: smooth top → bottom cascade */
      if (bodyRows.length) {
        tl.fromTo(
          bodyRows,
          { opacity: 0, y: -22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.78,
            stagger: { each: 0.085, from: 'start', ease: smoothEase },
          },
          theadRow ? '+=0.1' : 0,
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [statusFilter, dateFilter, deptFilter, search, page, rowsPerPage, tableCascadeKey]);

  const selectBarClass =
    'h-10 min-w-0 rounded-lg border border-border/90 bg-background px-3 text-sm text-foreground shadow-sm ring-1 ring-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:ring-white/[0.04]';

  return (
    <TooltipProvider delayDuration={350}>
    <div ref={ref} className="fms-dashboard relative w-full max-w-[1600px] mx-auto px-4 md:px-6 pb-12 space-y-6">
      {/* Header — matches Creator dashboard intro */}
      <section className="list-dash-reveal pt-4 md:pt-6 space-y-2">
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18"
            aria-hidden
          >
            <ListChecks className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="fms-dashboard-title text-3xl md:text-[2rem] leading-tight text-foreground">Tasks</h1>
            <p className="max-w-2xl text-sm md:text-[15px] text-muted-foreground leading-relaxed">
              Work assigned to your role. Completing an action advances the record to the next stage automatically.
            </p>
          </div>
        </div>
      </section>

      {/* KPI strip — same language as Creator dashboard (featured primary + elevated cards) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <ListPagePrimaryKpiCard
          label="Pending"
          value={counts.pendingMine}
          sub="In your queue"
          icon={<Clock className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />}
        />
        <ListPageSecondaryKpiCard
          delayMs={40}
          label="Completed"
          value={counts.completed}
          sub="Resolved actions"
          icon={<CheckCircle2 className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="emerald"
        />
        <ListPageSecondaryKpiCard
          delayMs={80}
          label="Returned"
          value={counts.returned}
          sub="Sent back for edits"
          icon={<RotateCcw className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="amber"
        />
        <ListPageSecondaryKpiCard
          delayMs={120}
          label="Rejected"
          value={counts.rejected}
          sub="Closed as rejected"
          icon={<XCircle className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="destructive"
        />
      </div>

      {/* Table + merged toolbar (single board) */}
      <div className="list-dash-reveal fms-dashboard-panel fms-dashboard-chart-board overflow-hidden rounded-2xl">
        {/* Toolbar — heading left; search + filters inline on the right */}
        <div className="border-b border-border bg-card p-4 md:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="min-w-0 shrink-0 lg:max-w-[min(100%,280px)]">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">Task register</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Search, filter, and open a task for review</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                <AnimatedSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search tasks, bills, payees…"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')} className={cn(selectBarClass, 'min-w-[132px] shrink-0')}>
                <option value="all">Active</option>
                <option value="Pending">Pending</option>
                <option value="Returned">Returned</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="relative min-w-[148px] shrink-0">
                <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className={cn(selectBarClass, 'w-full pl-9')}
                >
                  <option value="all">Any date</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                </select>
              </div>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className={cn(selectBarClass, 'min-w-[140px] max-w-[200px] shrink-0')}>
                <option value="all">All departments / entities</option>
                {Array.from(new Set([...departments, ...budgets.map((b) => b.entityName)])).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('Pending');
                    setDateFilter('all');
                    setDeptFilter('all');
                    setSearch('');
                  }}
                  className="h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              )}
              <ListTableCardsFlipToggle view={listView} onViewChange={setListView} />
            </div>
          </div>
        </div>

        {listView === 'table' ? (
          <div className={TASKS_TABLE_SCROLL_WRAP}>
            <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1040px] table-fixed')}>
              <thead>
                <tr>
                  <th className={cn(TASKS_TABLE_TH, 'w-14')}>SL. NO</th>
                  <th className={TASKS_TABLE_TH}>TASK ID</th>
                  <th className={TASKS_TABLE_TH}>SUBJECT / TYPE</th>
                  <th className={TASKS_TABLE_TH}>PAYEE / ENTITY</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>AMOUNT</th>
                  <th className={TASKS_TABLE_TH}>STATUS</th>
                  <th className={TASKS_TABLE_TH}>UPDATED</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                      <EmptyState
                        title={hasActiveFilters ? 'No tasks match your filters' : 'No tasks'}
                        description={
                          hasActiveFilters
                            ? 'Try clearing filters or widening your search to see more tasks.'
                            : 'Nothing is assigned to your role yet. New tasks will appear here when records enter your queue.'
                        }
                        icon={<Inbox className="h-7 w-7 text-muted-foreground" />}
                      />
                    </td>
                  </tr>
                ) : (
                  pagedTasks.map((t, index) => {
                    const serialNo = (safePage - 1) * rowsPerPage + index + 1;
                    const isReceipt = t.subjectType === 'Receipt' || (!t.subjectType && !!t.receiptId);
                    const isBudget = !isReceipt && (t.subjectType === 'Budget' || (!t.subjectType && !!t.budgetId));
                    const isBill = !isReceipt && !isBudget && (t.subjectType === 'Bill' || !!t.billId);
                    if (isReceipt && t.receiptId) {
                      const r = receiptById.get(t.receiptId);
                      if (!r) return null;
                      return (
                        <ReceiptTaskRow
                          key={t.taskId}
                          serialNo={serialNo}
                          task={t}
                          receipt={r}
                          onOpen={() => navigate(`/receipts/${r.id}`)}
                        />
                      );
                    }
                    if (isBudget && t.budgetId) {
                      const bg = budgetById.get(t.budgetId);
                      if (!bg) return null;
                      return (
                        <BudgetTaskRow key={t.taskId} serialNo={serialNo} task={t} budget={bg} onOpen={() => navigate(`/budgets/${bg.id}`)} />
                      );
                    }
                    if (isBill && t.billId) {
                      const b = billByid.get(t.billId);
                      if (!b) return null;
                      return <TaskRow key={t.taskId} serialNo={serialNo} task={t} bill={b} onOpen={() => navigate(`/tasks/${t.taskId}`)} />;
                    }
                    return null;
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-border bg-card p-4 md:p-5">
            {filtered.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title={hasActiveFilters ? 'No tasks match your filters' : 'No tasks'}
                  description={
                    hasActiveFilters
                      ? 'Try clearing filters or widening your search to see more tasks.'
                      : 'Nothing is assigned to your role yet. New tasks will appear here when records enter your queue.'
                  }
                  icon={<Inbox className="h-7 w-7 text-muted-foreground" />}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pagedTasks.map((t, index) => {
                  const serialNo = (safePage - 1) * rowsPerPage + index + 1;
                  const isReceipt = t.subjectType === 'Receipt' || (!t.subjectType && !!t.receiptId);
                  const isBudget = !isReceipt && (t.subjectType === 'Budget' || (!t.subjectType && !!t.budgetId));
                  const isBill = !isReceipt && !isBudget && (t.subjectType === 'Bill' || !!t.billId);
                  if (isReceipt && t.receiptId) {
                    const r = receiptById.get(t.receiptId);
                    if (!r) return null;
                    return (
                      <TaskReceiptListCard
                        key={t.taskId}
                        serialNo={serialNo}
                        task={t}
                        receipt={r}
                        onOpen={() => navigate(`/receipts/${r.id}`)}
                      />
                    );
                  }
                  if (isBudget && t.budgetId) {
                    const bg = budgetById.get(t.budgetId);
                    if (!bg) return null;
                    return (
                      <TaskBudgetListCard key={t.taskId} serialNo={serialNo} task={t} budget={bg} onOpen={() => navigate(`/budgets/${bg.id}`)} />
                    );
                  }
                  if (isBill && t.billId) {
                    const b = billByid.get(t.billId);
                    if (!b) return null;
                    return (
                      <TaskBillListCard key={t.taskId} serialNo={serialNo} task={t} bill={b} onOpen={() => navigate(`/tasks/${t.taskId}`)} />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pageStart}</span>–
              <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
              <span className="font-medium text-foreground">{filtered.length}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className={cn(selectBarClass, 'h-9 min-w-[4.5rem] py-0 text-xs')}
                >
                  {ROWS_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </Button>
              <span className="px-1 text-sm tabular-nums text-muted-foreground">
                Page {safePage} of {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}

function tasksIsoTooltip(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function TasksBlockTip({ text, children, className }: { text: string; children: ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('min-w-0', className)} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
        <p className="whitespace-pre-wrap break-words leading-snug">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function TaskPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-full px-2 py-0.5 text-left text-xs font-medium leading-snug whitespace-normal break-words',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </span>
  );
}

function ReceiptTaskRow({ serialNo, task, receipt, onOpen }: { serialNo: number; task: Task; receipt: Receipt; onOpen: () => void }) {
  const taskTip = [
    task.taskId,
    `Created: ${tasksIsoTooltip(task.createdAt)}`,
    `Action: ${task.actionRequired}`,
    `Your task: ${task.status}`,
    `Queue: ${task.assignedToRole}`,
  ].join('\n');
  const payeeTip = [`Payer: ${receipt.payerName}`, `Entity: ${receipt.entityName}`, `Receipt ID: ${receipt.id}`].join('\n');
  const statusTip = `Workflow status of this receipt.\nYour task: ${task.status}`;
  const amountTip = `${formatINR(receipt.amount)}\nRef: ${receipt.receiptNumber}`;
  const updatedTip = tasksIsoTooltip(task.updatedAt);

  return (
    <tr
      className="list-dash-row bud-row cursor-pointer border-border/80 transition odd:bg-background even:bg-muted/25 hover:bg-muted/45"
      onClick={onOpen}
    >
      <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={taskTip}>
          <div className="font-mono text-xs font-medium text-foreground">{task.taskId}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {relativeTime(task.createdAt)} · {task.actionRequired}
          </div>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip
          text={[`${receipt.receiptNumber}`, `${receipt.sourceType} · ${receipt.paymentMode}`].join('\n')}
        >
          <div className="font-medium text-foreground">{receipt.receiptNumber}</div>
          <div className="truncate text-xs text-muted-foreground">
            {receipt.sourceType} · {receipt.paymentMode}
          </div>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={payeeTip}>
          <div className="text-sm text-foreground">{receipt.payerName}</div>
          <div className="text-xs text-muted-foreground">{receipt.entityName}</div>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums text-foreground')}>
        <TasksBlockTip text={amountTip} className="inline-block max-w-full text-right">
          <span className="tabular-nums">{formatINR(receipt.amount)}</span>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={statusTip} className="inline-flex">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
              RECEIPT_STATUS_BADGE[receipt.status],
            )}
          >
            {receipt.status}
          </span>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>
        <TasksBlockTip text={`Last updated:\n${updatedTip}`}>
          <span>{formatDate(task.updatedAt)}</span>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/45 bg-primary/12 text-primary hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/14 dark:hover:bg-primary/24"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              <Eye className="mr-1 h-4 w-4" aria-hidden />
              View
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            Open receipt for review
          </TooltipContent>
        </Tooltip>
      </td>
    </tr>
  );
}

function BudgetTaskRow({ serialNo, task, budget, onOpen }: { serialNo: number; task: Task; budget: Budget; onOpen: () => void }) {
  const total = budget.heads.reduce((s, h) => s + h.allocated, 0);
  const taskTip = [
    task.taskId,
    `Created: ${tasksIsoTooltip(task.createdAt)}`,
    `Action: ${task.actionRequired}`,
    `Your task: ${task.status}`,
    `Queue: ${task.assignedToRole}`,
  ].join('\n');
  const subjectTip = [`${budget.name}`, `ID: ${budget.id}`, `FY: ${budget.fy}`].join('\n');
  const entityTip = [`Entity: ${budget.entityName}`, `Type: ${budget.entityType}`].join('\n');
  const statusTip = `Workflow status of this budget.\nYour task: ${task.status}`;
  const amountTip = `${formatINR(total)}\nTotal allocated across heads`;
  const updatedTip = tasksIsoTooltip(task.updatedAt);

  return (
    <tr
      className="list-dash-row bud-row cursor-pointer border-border/80 transition odd:bg-background even:bg-muted/25 hover:bg-muted/45"
      onClick={onOpen}
    >
      <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={taskTip}>
          <div className="font-mono text-xs font-medium text-foreground">{task.taskId}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {relativeTime(task.createdAt)} · {task.actionRequired}
          </div>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={subjectTip}>
          <div className="font-medium text-foreground">{budget.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {budget.id} · {budget.fy}
          </div>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={entityTip}>
          <div className="text-sm text-foreground">{budget.entityName}</div>
          <div className="text-xs text-muted-foreground">{budget.entityType}</div>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums text-foreground')}>
        <TasksBlockTip text={amountTip} className="inline-block max-w-full text-right">
          <span className="tabular-nums">{formatINR(total)}</span>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={statusTip} className="inline-flex">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
              BUDGET_STATUS_BADGE[budget.status],
            )}
          >
            {budget.status}
          </span>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>
        <TasksBlockTip text={`Last updated:\n${updatedTip}`}>
          <span>{formatDate(task.updatedAt)}</span>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/45 bg-primary/12 text-primary hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/14 dark:hover:bg-primary/24"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              <Eye className="mr-1 h-4 w-4" aria-hidden />
              View
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            Open budget for review
          </TooltipContent>
        </Tooltip>
      </td>
    </tr>
  );
}

function TaskReceiptListCard({
  serialNo,
  task,
  receipt,
  onOpen,
}: {
  serialNo: number;
  task: Task;
  receipt: Receipt;
  onOpen: () => void;
}) {
  const taskLine = `${task.taskId} · ${relativeTime(task.createdAt)} · Receipt`;
  const subjectLine = `${receipt.receiptNumber} · ${receipt.payerName} · ${receipt.paymentMode} · ${formatINR(receipt.amount)}`;
  const entityLine = `${receipt.entityName} · ${receipt.entityType}`;
  const statusLine = `${task.status} · ${receipt.status}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex cursor-pointer flex-col rounded-xl border border-border/80 bg-background p-4 text-left shadow-sm ring-1 ring-black/[0.03] transition hover:bg-muted/25 dark:ring-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">Sl. {serialNo}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Receipt</span>
      </div>
      <div className="mt-2 font-mono text-xs text-foreground">{taskLine}</div>
      <div className="mt-3 border-t border-border/60 pt-3 text-sm font-medium text-foreground">{subjectLine}</div>
      <div className="mt-1 text-sm text-muted-foreground">{entityLine}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <TaskPill label={task.actionRequired} className={actionTone[task.actionRequired] ?? 'bg-muted text-foreground'} />
        <TaskPill label={task.assignedToRole} className={TASK_ROLE_TONE[task.assignedToRole] ?? TASK_ROLE_TONE_FALLBACK} />
      </div>
      <div className="mt-2 text-xs text-foreground">{statusLine}</div>
      <div className="mt-1 text-xs text-muted-foreground">{formatDate(task.updatedAt)}</div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="border-transparent bg-chart-2 text-primary-foreground shadow-sm hover:bg-chart-2/90"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          Open <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function TaskBudgetListCard({
  serialNo,
  task,
  budget,
  onOpen,
}: {
  serialNo: number;
  task: Task;
  budget: Budget;
  onOpen: () => void;
}) {
  const total = budget.heads.reduce((s, h) => s + h.allocated, 0);
  const taskLine = `${task.taskId} · ${relativeTime(task.createdAt)} · Budget`;
  const subjectLine = `${budget.name} · ${budget.id} · ${budget.fy} · ${formatINR(total)}`;
  const entityLine = `${budget.entityName} · ${budget.entityType}`;
  const statusLine = `${task.status} · ${budget.status}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex cursor-pointer flex-col rounded-xl border border-border/80 bg-background p-4 text-left shadow-sm ring-1 ring-black/[0.03] transition hover:bg-muted/25 dark:ring-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">Sl. {serialNo}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Budget</span>
      </div>
      <div className="mt-2 font-mono text-xs text-foreground">{taskLine}</div>
      <div className="mt-3 border-t border-border/60 pt-3 text-sm font-semibold text-foreground">{subjectLine}</div>
      <div className="mt-1 text-sm text-muted-foreground">{entityLine}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <TaskPill label={task.actionRequired} className={actionTone[task.actionRequired] ?? 'bg-muted text-foreground'} />
        <TaskPill label={task.assignedToRole} className={TASK_ROLE_TONE[task.assignedToRole] ?? TASK_ROLE_TONE_FALLBACK} />
      </div>
      <div className="mt-2 text-xs text-foreground">{statusLine}</div>
      <div className="mt-1 text-xs text-muted-foreground">{formatDate(task.updatedAt)}</div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="border border-chart-3/45 bg-chart-3 text-foreground shadow-sm hover:bg-chart-3/90 dark:border-chart-3/40"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          Open <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function TaskBillListCard({
  serialNo,
  task,
  bill,
  onOpen,
}: {
  serialNo: number;
  task: Task;
  bill: Bill;
  onOpen: () => void;
}) {
  const taskLine = `${task.taskId} · ${relativeTime(task.createdAt)}`;
  const subjectLine = `${bill.billType} · ${bill.billId} · ${bill.payeeName} · ${formatINR(bill.amount)}`;
  const statusLine = `${task.status} · ${bill.status}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex cursor-pointer flex-col rounded-xl border border-border/80 bg-background p-4 text-left shadow-sm ring-1 ring-black/[0.03] transition hover:bg-muted/25 dark:ring-white/[0.04]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">Sl. {serialNo}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Bill</span>
      </div>
      <div className="mt-2 font-mono text-xs text-foreground">{taskLine}</div>
      <div className="mt-3 border-t border-border/60 pt-3 text-sm font-medium text-foreground">{subjectLine}</div>
      <div className="mt-1 text-sm text-muted-foreground">{bill.department}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <TaskPill label={task.actionRequired} className={actionTone[task.actionRequired] ?? 'bg-muted text-foreground'} />
        <TaskPill label={task.assignedToRole} className={TASK_ROLE_TONE[task.assignedToRole] ?? TASK_ROLE_TONE_FALLBACK} />
      </div>
      <div className="mt-2 text-xs text-foreground">{statusLine}</div>
      <div className="mt-1 text-xs text-muted-foreground">{formatDate(task.updatedAt)}</div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          Open <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function TaskRow({ serialNo, task, bill, onOpen }: { serialNo: number; task: Task; bill: Bill; onOpen: () => void }) {
  const taskTip = [
    task.taskId,
    `Created: ${tasksIsoTooltip(task.createdAt)}`,
    `Action: ${task.actionRequired}`,
    `Your task: ${task.status}`,
    `Queue: ${task.assignedToRole}`,
  ].join('\n');
  const subjectSecondary = bill.description || bill.billId;
  const subjectTip = [bill.billType, bill.description ? `Details: ${bill.description}` : null, `Bill ID: ${bill.billId}`]
    .filter(Boolean)
    .join('\n');
  const payeeTip = [`Payee: ${bill.payeeName}`, `Department: ${bill.department}`, `Bill ID: ${bill.billId}`].join('\n');
  const statusTip = `Workflow status of this bill.\nYour task: ${task.status}`;
  const amountTip = `${formatINR(bill.amount)}\nBill: ${bill.billId}`;
  const updatedTip = tasksIsoTooltip(task.updatedAt);

  return (
    <tr
      className="list-dash-row bud-row cursor-pointer border-border/80 transition odd:bg-background even:bg-muted/25 hover:bg-muted/45"
      onClick={onOpen}
    >
      <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={taskTip}>
          <div className="font-mono text-xs font-medium text-foreground">{task.taskId}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {relativeTime(task.createdAt)} · {task.actionRequired}
          </div>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={subjectTip}>
          <div className="font-medium text-foreground">{bill.billType}</div>
          <div className="truncate text-xs text-muted-foreground">{subjectSecondary}</div>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={payeeTip}>
          <div className="text-sm text-foreground">{bill.payeeName}</div>
          <div className="text-xs text-muted-foreground">{bill.department}</div>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums text-foreground')}>
        <TasksBlockTip text={amountTip} className="inline-block max-w-full text-right">
          <span className="tabular-nums">{formatINR(bill.amount)}</span>
        </TasksBlockTip>
      </td>
      <td className={TASKS_TABLE_TD}>
        <TasksBlockTip text={statusTip} className="inline-flex">
          <StatusBadge status={bill.status} />
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>
        <TasksBlockTip text={`Last updated:\n${updatedTip}`}>
          <span>{formatDate(task.updatedAt)}</span>
        </TasksBlockTip>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/45 bg-primary/12 text-primary hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/14 dark:hover:bg-primary/24"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              <Eye className="mr-1 h-4 w-4" aria-hidden />
              View
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            Open task workspace for this bill
          </TooltipContent>
        </Tooltip>
      </td>
    </tr>
  );
}

