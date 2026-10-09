import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Plus,
  Eye,
  Banknote,
  CheckCircle2,
  RotateCcw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ClipboardCheck,
  Undo2,
  CircleDollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { ListTableCardsFlipToggle, type ListViewMode } from '@/components/shared/ListTableCardsFlipToggle';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';
import { WorkflowQueueCard } from '@/components/shared/WorkflowQueueCard';
import { formatINR, formatDate } from '@/lib/format';
import type { Bill, BillStatus, Role } from '@/store/types';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';

function parseQuery() {
  const hash = window.location.hash.split('?')[1] ?? '';
  const params = new URLSearchParams(hash);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

const ROWS_OPTIONS = [5, 10, 25] as const;

export function BillsPage() {
  const { bills, tasks, currentRole, currentUser } = useApp();
  const { navigate } = useRouter();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const ref = useRef<HTMLDivElement>(null);
  const initialQuery = parseQuery();
  const [statusFilter, setStatusFilter] = useState<string>(() => initialQuery.status ?? 'all');
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState<string | undefined>(() => initialQuery.queue);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [listView, setListView] = useState<ListViewMode>('table');

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.bud-block', { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.bud-row', { y: 8, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.4, ease: 'power3.out', delay: 0.1 });
    }, ref);
    return () => ctx.revert();
  }, [statusFilter, search, queue, page, rowsPerPage]);

  const roleScopedBills: Bill[] = useMemo(() => {
    let list = [...bills];

    if (role === 'Verifier') {
      const ids = new Set(tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Verifier' && t.status === 'Pending').map((t) => t.billId!));
      list = list.filter((b) => ids.has(b.billId) || b.history.some((h) => h.role === 'Verifier'));
    }
    if (role === 'Finance') {
      const ids = new Set(tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Finance' && t.status === 'Pending').map((t) => t.billId!));
      list = list.filter((b) => ids.has(b.billId) || ['Approved', 'Paid', 'Rejected'].includes(b.status));
    }
    if (role === 'Approver') {
      list = [];
    }
    if (role === 'Payment') {
      const ids = new Set(tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Payment' && t.status === 'Pending').map((t) => t.billId!));
      list = list.filter((b) => ids.has(b.billId) || ['Paid'].includes(b.status));
    }
    if (role === 'Creator') {
      list = list.filter((b) => b.createdByRole === 'Creator' && b.createdBy === currentUser);
    }

    if (queue === 'verifier') {
      const ids = new Set(tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Verifier' && t.status === 'Pending').map((t) => t.billId!));
      list = list.filter((b) => ids.has(b.billId));
    }
    if (queue === 'finance') {
      const ids = new Set(tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Finance' && t.status === 'Pending').map((t) => t.billId!));
      list = list.filter((b) => ids.has(b.billId));
    }
    if (queue === 'payment') {
      const ids = new Set(tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Payment' && t.status === 'Pending').map((t) => t.billId!));
      list = list.filter((b) => ids.has(b.billId));
    }

    return list;
  }, [bills, tasks, role, currentUser, queue]);

  const filteredBills: Bill[] = useMemo(() => {
    let list = [...roleScopedBills];
    if (statusFilter !== 'all') list = list.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) =>
        [b.billId, b.payeeName, b.panNumber, b.billType, b.department].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [roleScopedBills, statusFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredBills.length / rowsPerPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageStart = filteredBills.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const pageEnd = Math.min(safePage * rowsPerPage, filteredBills.length);

  const pagedBills = useMemo(
    () => filteredBills.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage),
    [filteredBills, safePage, rowsPerPage],
  );

  const counts = useMemo(() => {
    const paid = roleScopedBills.filter((b) => b.status === 'Paid').length;
    const rejected = roleScopedBills.filter((b) => b.status === 'Rejected').length;
    const inFlight = roleScopedBills.filter((b) => !['Paid', 'Rejected'].includes(b.status)).length;
    return {
      total: roleScopedBills.length,
      paid,
      rejected,
      inFlight,
    };
  }, [roleScopedBills]);

  const queueCounts = useMemo(
    () => ({
      pendingVerification: tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Verifier' && t.status === 'Pending').length,
      pendingFinance: tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Finance' && t.status === 'Pending').length,
      readyPayment: tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Payment' && t.status === 'Pending').length,
      sentBack: bills.filter((b) => b.status === 'Sent Back').length,
    }),
    [tasks, bills],
  );

  const highValueCount = useMemo(
    () => roleScopedBills.filter((b) => b.amount > 500000 && !['Paid', 'Rejected'].includes(b.status)).length,
    [roleScopedBills],
  );

  const staleDrafts = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- dashboard counts stale drafts using wall-clock age
    const now = Date.now();
    const fiveDays = 5 * 86400000;
    return roleScopedBills.filter((b) => b.status === 'Draft' && now - new Date(b.updatedAt).getTime() > fiveDays).length;
  }, [roleScopedBills]);

  const statuses: BillStatus[] = ['Draft', 'Submitted', 'Verification Approved', 'Sent Back', 'Approved', 'Paid', 'Rejected'];

  const roleHeadline = useMemo(() => {
    if (role === 'Creator') return 'Bills you have created — drafts, submitted, returned and completed.';
    if (role === 'Verifier') return 'Bills waiting for your verification or already actioned by you.';
    if (role === 'Finance') return 'Bills pending your approval and ones you’ve approved or rejected.';
    if (role === 'Approver') return 'Bills are not managed by the Approver role — switch to Budgets.';
    if (role === 'Payment') return 'Approved bills ready for payment, plus your payment history.';
    if (role === 'Auditor') return 'Read-only view of every bill in the system.';
    return '';
  }, [role]);

  const hasActiveFilters = statusFilter !== 'all' || !!search.trim() || !!queue;

  const selectBarClass =
    'h-10 shrink-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  const showWorkflowPanel = role !== 'Approver';

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1400px] space-y-6">
      <div className="bud-block flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Bill Management</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{roleHeadline}</p>
        </div>
        {role === 'Creator' && (
          <Button
            onClick={() => navigate('/bills/new')}
            className="h-11 shrink-0 rounded-xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={2} /> Create Bill
          </Button>
        )}
      </div>

      <div className="bud-block grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ListPagePrimaryKpiCard
          label="Total bills"
          value={counts.total}
          sub="In your scope"
          icon={<Banknote className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
        />
        <ListPageSecondaryKpiCard
          delayMs={12}
          label="Paid"
          value={counts.paid}
          sub="Completed payments"
          icon={<CheckCircle2 className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="emerald"
        />
        <ListPageSecondaryKpiCard
          delayMs={80}
          label="In pipeline"
          value={counts.inFlight}
          sub="Draft through approval"
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

      {showWorkflowPanel && (
        <div className="bud-block grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 md:grid-cols-4">
            <WorkflowQueueCard
              icon={ShieldCheck}
              label="Pending Verification"
              count={queueCounts.pendingVerification}
              iconTone="teal"
              onView={() => {
                setQueue('verifier');
                setPage(1);
              }}
            />
            <WorkflowQueueCard
              icon={ClipboardCheck}
              label="Pending Finance"
              count={queueCounts.pendingFinance}
              iconTone="purple"
              onView={() => {
                setQueue('finance');
                setPage(1);
              }}
            />
            <WorkflowQueueCard
              icon={Undo2}
              label="Sent Back"
              count={queueCounts.sentBack}
              iconTone="amber"
              onView={() => {
                setQueue(undefined);
                window.location.hash = '/bills';
                setStatusFilter('Sent Back');
                setPage(1);
              }}
            />
            <WorkflowQueueCard
              variant="primary"
              icon={CircleDollarSign}
              label="Ready for Payment"
              count={queueCounts.readyPayment}
              onView={() => {
                setQueue('payment');
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={2} />
              </div>
              <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">Attention needed</h2>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 last:border-0 last:pb-0">
                <span className="text-muted-foreground">High-value in pipeline (&gt; ₹5L)</span>
                <span className="kpi-pill-danger inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                  {highValueCount}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 last:border-0 last:pb-0">
                <span className="text-muted-foreground">Rejected in your scope</span>
                <span className="kpi-pill-neutral inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                  {counts.rejected}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Drafts &gt; 5 days old</span>
                <span className="kpi-pill-info inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                  {staleDrafts}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="bud-block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-card px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div>
              <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">Bill register</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Search, filter, and open a bill for review</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                <AnimatedSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search Bill ID, payee, PAN, department…"
                  inputId="bill-register-search"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={cn(selectBarClass, 'min-w-[160px]')}>
                <option value="all">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearch('');
                    setQueue(undefined);
                    window.location.hash = '/bills';
                  }}
                  className="h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear filters
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
                  <th className={TASKS_TABLE_TH}>Bill ID</th>
                  <th className={TASKS_TABLE_TH}>Type</th>
                  <th className={TASKS_TABLE_TH}>Payee / Department</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
                  <th className={TASKS_TABLE_TH}>Status</th>
                  <th className={TASKS_TABLE_TH}>Updated</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                      <EmptyState
                        title={hasActiveFilters ? 'No bills match your filters' : 'No bills'}
                        description={
                          role === 'Approver'
                            ? 'Switch to Budgets for approvals — bills are not assigned to this role.'
                            : hasActiveFilters
                              ? 'Try clearing filters to see more results.'
                              : role === 'Creator'
                                ? 'Get started by creating your first bill.'
                                : 'Nothing in your scope yet.'
                        }
                        action={
                          role === 'Creator' ? (
                            <Button onClick={() => navigate('/bills/new')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                              <Plus className="mr-1.5 h-4 w-4" /> Create Bill
                            </Button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  pagedBills.map((b, index) => (
                    <tr
                      key={b.billId}
                      className="bud-row cursor-pointer border-border/80 transition odd:bg-background even:bg-muted/25 hover:bg-muted/45"
                      onClick={() => navigate(`/bills/${b.billId}`)}
                    >
                      <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>
                        {(safePage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className={cn(TASKS_TABLE_TD, 'font-mono text-xs')}>{b.billId}</td>
                      <td className={TASKS_TABLE_TD}>
                        <div className="font-medium">{b.billType}</div>
                        <div className="truncate text-xs text-muted-foreground">{b.description}</div>
                      </td>
                      <td className={TASKS_TABLE_TD}>
                        <div className="text-sm">{b.payeeName}</div>
                        <div className="text-xs text-muted-foreground">{b.department}</div>
                      </td>
                      <td className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>{formatINR(b.amount)}</td>
                      <td className={TASKS_TABLE_TD}>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{formatDate(b.updatedAt)}</td>
                      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/45 bg-primary/12 text-primary hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/14 dark:hover:bg-primary/24"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bills/${b.billId}`);
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-border bg-card p-4 md:px-5 md:py-5">
            {filteredBills.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title={hasActiveFilters ? 'No bills match your filters' : 'No bills'}
                  description={
                    role === 'Approver'
                      ? 'Switch to Budgets for approvals — bills are not assigned to this role.'
                      : hasActiveFilters
                        ? 'Try clearing filters to see more results.'
                        : role === 'Creator'
                          ? 'Get started by creating your first bill.'
                          : 'Nothing in your scope yet.'
                  }
                  action={
                    role === 'Creator' ? (
                      <Button onClick={() => navigate('/bills/new')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-1.5 h-4 w-4" /> Create Bill
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pagedBills.map((b, index) => {
                  const serial = (safePage - 1) * rowsPerPage + index + 1;
                  return (
                    <div
                      key={b.billId}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/bills/${b.billId}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/bills/${b.billId}`);
                        }
                      }}
                      className="flex cursor-pointer flex-col rounded-xl border border-border/80 bg-background p-4 text-left shadow-sm ring-1 ring-black/[0.03] transition hover:bg-muted/25 dark:ring-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs tabular-nums text-muted-foreground">Sl. {serial}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="mt-2 font-mono text-sm font-semibold text-foreground">{b.billId}</div>
                      <div className="mt-1 font-medium text-foreground">{b.billType}</div>
                      {b.description ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{b.description}</p> : null}
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <div className="text-sm text-foreground">{b.payeeName}</div>
                        <div className="text-xs text-muted-foreground">{b.department}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-base font-semibold tabular-nums text-foreground">{formatINR(b.amount)}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(b.updatedAt)}</span>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bills/${b.billId}`);
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {filteredBills.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pageStart}</span>–
              <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
              <span className="font-medium text-foreground">{filteredBills.length}</span>
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
  );
}
