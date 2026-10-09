import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Plus,
  AlertTriangle,
  TrendingUp,
  Wallet,
  CircleDollarSign,
  ArrowRight,
  Lock,
  FileEdit,
  ShieldCheck,
  ClipboardCheck,
  Undo2,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { BudgetStatusBadge } from '@/components/shared/BudgetStatusBadge';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import type { Budget, BudgetStatus, Role } from '@/store/types';
import { fiscalYears } from '@/store/mockData';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';
import { LIST_PAGE_KPI_ICON_TONE } from '@/components/shared/listPageKpiTones';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { ListTableCardsFlipToggle, type ListViewMode } from '@/components/shared/ListTableCardsFlipToggle';
import { ListPagePrimaryKpiCard } from '@/components/shared/ListPageKpi';
import { WorkflowQueueCard } from '@/components/shared/WorkflowQueueCard';

const ROWS_OPTIONS = [5, 10, 25] as const;

export function BudgetsPage() {
  const { budgets, currentRole, currentUser, adjustments } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [fy, setFy] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'all'>('all');
  const [entityType, setEntityType] = useState<string>('all');
  const [search, setSearch] = useState('');
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
  }, [statusFilter, entityType, fy, search, page, rowsPerPage]);

  const baseBudgets = useMemo(() => {
    if (role === 'Verifier')
      return budgets.filter(
        (b) => ['Submitted'].includes(b.status) || (b.verifiedBy && b.history.some((h) => h.role === 'Verifier')),
      );
    if (role === 'Approver')
      return budgets.filter(
        (b) => ['Verified', 'Approved', 'Rejected', 'On Hold'].includes(b.status) || b.history.some((h) => h.role === 'Approver'),
      );
    if (role === 'Finance') return budgets;
    if (role === 'Auditor') return budgets;
    if (role === 'Payment') return budgets.filter((b) => b.status === 'Approved');
    return budgets.filter((b) => b.createdBy === currentUser);
  }, [budgets, role, currentUser]);

  const filtered = useMemo(() => {
    return baseBudgets
      .filter((b) => (fy === 'all' ? true : b.fy === fy))
      .filter((b) => (statusFilter === 'all' ? true : b.status === statusFilter))
      .filter((b) => (entityType === 'all' ? true : b.entityType === entityType))
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [b.id, b.name, b.entityName].some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [baseBudgets, fy, statusFilter, entityType, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const pageEnd = Math.min(safePage * rowsPerPage, filtered.length);

  const pagedRows = useMemo(
    () => filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage),
    [filtered, safePage, rowsPerPage],
  );

  const totals = useMemo(() => {
    const approved = baseBudgets.filter((b) => b.status === 'Approved');
    const allocated = approved.reduce((a, b) => a + b.heads.reduce((aa, h) => aa + h.allocated, 0), 0);
    const utilized = approved.reduce((a, b) => a + b.heads.reduce((aa, h) => aa + h.utilized, 0), 0);
    const reserved = approved.reduce((a, b) => a + b.heads.reduce((aa, h) => aa + h.reserved, 0), 0);
    const available = allocated - utilized - reserved;
    return { allocated, utilized, reserved, available };
  }, [baseBudgets]);

  const utilPct = pct(totals.utilized, totals.allocated);
  const availPct = pct(Math.max(0, totals.available), totals.allocated);

  const queueCounts = useMemo(
    () => ({
      pendingVerification: budgets.filter((b) => b.status === 'Submitted').length,
      pendingApproval: budgets.filter((b) => b.status === 'Verified').length,
      sentBack: budgets.filter((b) => b.status === 'Sent Back').length,
      onHold: budgets.filter((b) => b.status === 'On Hold').length,
    }),
    [budgets],
  );

  const breachHeads = useMemo(() => {
    let count = 0;
    budgets.filter((b) => b.status === 'Approved').forEach((b) => {
      b.heads.forEach((h) => {
        const totalUsed = h.utilized + h.reserved;
        if (h.allocated > 0 && totalUsed / h.allocated > 0.9) count += 1;
      });
    });
    return count;
  }, [budgets]);

  const pendingAdjustments = adjustments.filter((a) => a.status === 'PENDING').length;
  const staleDrafts = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- dashboard counts stale drafts using wall-clock age
    const now = Date.now();
    const fiveDays = 5 * 86400000;
    return baseBudgets.filter((b) => b.status === 'Draft' && now - new Date(b.updatedAt).getTime() > fiveDays).length;
  }, [baseBudgets]);

  const roleHeadline = useMemo(() => {
    if (role === 'Creator') return 'Track allocations, utilisation, and workflow across all entities and fiscal years.';
    if (role === 'Verifier') return 'Budgets pending your verification. Forward to approver or send back to creator.';
    if (role === 'Approver') return 'Verified budgets awaiting your decision. Approve to lock, reject, or put on hold.';
    if (role === 'Finance') return 'Allocate to sub-entities, adjust between heads, and monitor every approved budget.';
    if (role === 'Payment') return 'Approved budgets — read-only reference for payment authorisation.';
    return 'Read-only oversight of every budget, allocation, adjustment and reservation.';
  }, [role]);

  const selectBarClass =
    'h-10 shrink-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  const hasActiveFilters = fy !== 'all' || statusFilter !== 'all' || entityType !== 'all' || !!search.trim();

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1400px] space-y-6">
      {/* Page header */}
      <div className="bud-block flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Budget Management</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{roleHeadline}</p>
        </div>
        {role === 'Creator' && (
          <Button
            onClick={() => navigate('/budgets/new')}
            className="h-11 shrink-0 rounded-xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={2} /> Create Budget
          </Button>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="bud-block grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ListPagePrimaryKpiCard
          label="Total allocated"
          value={formatINR(totals.allocated)}
          sub="Approved budgets — FY aggregate"
          icon={<CircleDollarSign className="size-[18px] sm:size-5" strokeWidth={1.75} aria-hidden />}
        />

        <div className="rounded-2xl border border-border/90 bg-card p-5 text-card-foreground shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Utilised</p>
              <p className="mt-3 font-sans text-2xl font-bold tabular-nums text-foreground md:text-3xl">{formatINR(totals.utilized)}</p>
              <p className="mt-2 text-xs font-medium text-primary">{utilPct}% of allocated</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-amber-500 dark:bg-amber-400" style={{ width: `${Math.min(utilPct, 100)}%` }} />
              </div>
            </div>
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm', LIST_PAGE_KPI_ICON_TONE.amber)}>
              <TrendingUp className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/90 bg-card p-5 text-card-foreground shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Reserved</p>
              <p className="mt-3 font-sans text-2xl font-bold tabular-nums text-foreground md:text-3xl">{formatINR(totals.reserved)}</p>
              <p className="mt-2 text-xs font-medium text-primary">Encumbrances & commitments</p>
            </div>
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm', LIST_PAGE_KPI_ICON_TONE.purple)}>
              <Wallet className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/90 bg-card p-5 text-card-foreground shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Available</p>
              <p className="mt-3 font-sans text-2xl font-bold tabular-nums text-foreground md:text-3xl">{formatINR(Math.max(0, totals.available))}</p>
              <p className="mt-2 text-xs font-medium text-primary">{availPct}% remaining</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${Math.min(availPct, 100)}%` }} />
              </div>
            </div>
            <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm', LIST_PAGE_KPI_ICON_TONE.emerald)}>
              <TrendingUp className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
          </div>
        </div>
      </div>

      {/* Workflow + Attention */}
      <div className="bud-block grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="grid grid-cols-2 gap-3 lg:col-span-2 md:grid-cols-4">
          <WorkflowQueueCard
            icon={ShieldCheck}
            label="Pending Verification"
            count={queueCounts.pendingVerification}
            iconTone="teal"
            onView={() => setStatusFilter('Submitted')}
          />
          <WorkflowQueueCard
            icon={ClipboardCheck}
            label="Pending Approval"
            count={queueCounts.pendingApproval}
            iconTone="purple"
            onView={() => setStatusFilter('Verified')}
          />
          <WorkflowQueueCard
            icon={Undo2}
            label="Sent Back"
            count={queueCounts.sentBack}
            iconTone="amber"
            onView={() => setStatusFilter('Sent Back')}
          />
          <WorkflowQueueCard
            variant="primary"
            icon={Pause}
            label="On Hold"
            count={queueCounts.onHold}
            onView={() => setStatusFilter('On Hold')}
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
              <span className="text-muted-foreground">Heads over 90% utilised</span>
              <span className="kpi-pill-danger inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                {breachHeads}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 last:border-0 last:pb-0">
              <span className="text-muted-foreground">Pending adjustments</span>
              <span className="kpi-pill-warn inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                {pendingAdjustments}
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

      {/* Budget register */}
      <div className="bud-block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-card px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div>
              <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">Budget register</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Search, filter, and open a budget for review</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                <AnimatedSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search budget name, entity, ID…"
                  inputId="budget-register-search"
                />
              </div>
              <select value={fy} onChange={(e) => setFy(e.target.value)} className={cn(selectBarClass, 'min-w-[120px]')}>
                <option value="all">All FYs</option>
                {fiscalYears.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BudgetStatus | 'all')}
                className={cn(selectBarClass, 'min-w-[140px]')}
              >
                <option value="all">All statuses</option>
                {(['Draft', 'Submitted', 'Verified', 'Approved', 'Rejected', 'Sent Back', 'On Hold'] as BudgetStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className={cn(selectBarClass, 'min-w-[130px]')}>
                <option value="all">All entities</option>
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Department">Department</option>
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setFy('all');
                    setStatusFilter('all');
                    setEntityType('all');
                    setSearch('');
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
            <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1080px] table-fixed')}>
              <thead>
                <tr>
                  <th className={cn(TASKS_TABLE_TH, 'w-14')}>SL. NO</th>
                  <th className={TASKS_TABLE_TH}>Budget</th>
                  <th className={TASKS_TABLE_TH}>Entity</th>
                  <th className={cn(TASKS_TABLE_TH, 'w-24')}>Version</th>
                  <th className={TASKS_TABLE_TH}>Status</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>Allocated</th>
                  <th className={cn(TASKS_TABLE_TH, 'w-[18%]')}>Utilisation</th>
                  <th className={TASKS_TABLE_TH}>Updated</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                      <EmptyState
                        title="No budgets match your filters"
                        description={
                          role === 'Creator' ? 'Create your first budget to get started.' : 'Try clearing filters to see more results.'
                        }
                        action={
                          role === 'Creator' ? (
                            <Button
                              onClick={() => navigate('/budgets/new')}
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="mr-1.5 h-4 w-4" /> Create Budget
                            </Button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((b, index) => (
                    <BudgetRow
                      key={b.id}
                      serialNo={(safePage - 1) * rowsPerPage + index + 1}
                      budget={b}
                      onOpen={() => navigate(`/budgets/${b.id}`)}
                      role={role}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-border bg-card p-4 md:px-5 md:py-5">
            {filtered.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No budgets match your filters"
                  description={
                    role === 'Creator' ? 'Create your first budget to get started.' : 'Try clearing filters to see more results.'
                  }
                  action={
                    role === 'Creator' ? (
                      <Button
                        onClick={() => navigate('/budgets/new')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="mr-1.5 h-4 w-4" /> Create Budget
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pagedRows.map((b, index) => (
                  <BudgetListCard
                    key={b.id}
                    serialNo={(safePage - 1) * rowsPerPage + index + 1}
                    budget={b}
                    role={role}
                    onOpen={() => navigate(`/budgets/${b.id}`)}
                  />
                ))}
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
  );
}

function pct(used: number, total: number) {
  if (!total) return 0;
  return Math.round((used / total) * 100);
}

function BudgetListCard({
  serialNo,
  budget,
  onOpen,
  role,
}: {
  serialNo: number;
  budget: Budget;
  onOpen: () => void;
  role: Role;
}) {
  const allocated = budget.heads.reduce((a, h) => a + h.allocated, 0);
  const used = budget.heads.reduce((a, h) => a + h.utilized + h.reserved, 0);
  const p = pct(used, allocated);
  const dot = p > 90 ? 'bg-destructive' : p > 70 ? 'bg-[color-mix(in_oklch,var(--chart-3)_75%,var(--foreground))]' : 'bg-[color-mix(in_oklch,var(--chart-2)_70%,var(--foreground))]';

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
        <BudgetStatusBadge status={budget.status} />
      </div>
      <div className="mt-2 font-semibold text-foreground">{budget.name}</div>
      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {budget.id} · {budget.fy}
      </div>
      <div className="mt-3 border-t border-border/60 pt-3">
        <div className="text-sm text-foreground">{budget.entityName}</div>
        <div className="text-xs text-muted-foreground">{budget.entityType}</div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
        <span>v{budget.version}</span>
        <span className="text-border">·</span>
        <span className="font-semibold text-foreground">{formatINR(allocated)}</span>
        <span>allocated</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full transition-all duration-700', dot)} style={{ width: `${Math.min(p, 100)}%` }} />
        </div>
        <div className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">{p}%</div>
      </div>
      <div className="mt-2 text-xs text-foreground">{relativeTime(budget.updatedAt)}</div>
      <div className="text-[10px] text-muted-foreground">{formatDate(budget.updatedAt)}</div>
      <div className="mt-3 flex justify-end">
        <RowAction budget={budget} role={role} onOpen={onOpen} layout="card" />
      </div>
    </div>
  );
}

function BudgetRow({ serialNo, budget, onOpen, role }: { serialNo: number; budget: Budget; onOpen: () => void; role: Role }) {
  const allocated = budget.heads.reduce((a, h) => a + h.allocated, 0);
  const used = budget.heads.reduce((a, h) => a + h.utilized + h.reserved, 0);
  const p = pct(used, allocated);
  const dot = p > 90 ? 'bg-destructive' : p > 70 ? 'bg-[color-mix(in_oklch,var(--chart-3)_75%,var(--foreground))]' : 'bg-[color-mix(in_oklch,var(--chart-2)_70%,var(--foreground))]';
  return (
    <tr className="bud-row cursor-pointer border-border/80 transition odd:bg-background even:bg-muted/25 hover:bg-muted/45" onClick={onOpen}>
      <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
      <td className={TASKS_TABLE_TD}>
        <div className="font-semibold text-foreground">{budget.name}</div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {budget.id} · {budget.fy}
        </div>
      </td>
      <td className={TASKS_TABLE_TD}>
        <div className="text-sm text-foreground">{budget.entityName}</div>
        <div className="text-xs text-muted-foreground">{budget.entityType}</div>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-xs tabular-nums')}>v{budget.version}</td>
      <td className={TASKS_TABLE_TD}>
        <BudgetStatusBadge status={budget.status} />
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>{formatINR(allocated)}</td>
      <td className={TASKS_TABLE_TD}>
        <div className="flex items-center gap-2">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full transition-all duration-700', dot)} style={{ width: `${Math.min(p, 100)}%` }} />
          </div>
          <div className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">{p}%</div>
        </div>
      </td>
      <td className={TASKS_TABLE_TD}>
        <div className="text-xs text-foreground">{relativeTime(budget.updatedAt)}</div>
        <div className="text-[10px] text-muted-foreground">{formatDate(budget.updatedAt)}</div>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
        <RowAction budget={budget} role={role} onOpen={onOpen} />
      </td>
    </tr>
  );
}

const BUDGET_CARD_ROW_BTN =
  'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90';

function RowAction({
  budget,
  role,
  onOpen,
  layout = 'table',
}: {
  budget: Budget;
  role: Role;
  onOpen: () => void;
  layout?: 'table' | 'card';
}) {
  const cardGhost =
    'inline-flex h-8 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-primary/40 bg-primary/12 px-2.5 text-[0.8rem] font-medium text-primary shadow-sm hover:bg-primary/22';
  const linkEdit =
    'inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline';
  const tablePrimary = 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90';

  if (role === 'Creator' && budget.status === 'Draft') {
    return (
      <button
        type="button"
        className={layout === 'card' ? cardGhost : linkEdit}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        <FileEdit className="h-3.5 w-3.5" strokeWidth={2} /> Edit
      </button>
    );
  }
  if (role === 'Verifier' && budget.status === 'Submitted') {
    return (
      <Button
        type="button"
        size="sm"
        variant="default"
        className={cn(tablePrimary, layout === 'card' && BUDGET_CARD_ROW_BTN)}
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
      >
        Verify <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    );
  }
  if (role === 'Approver' && budget.status === 'Verified') {
    return (
      <Button
        type="button"
        size="sm"
        variant="default"
        className={cn(tablePrimary, layout === 'card' && BUDGET_CARD_ROW_BTN)}
        onClick={(e) => { e.stopPropagation(); onOpen(); }}
      >
        Decide <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    );
  }
  if (budget.status === 'Approved' || budget.status === 'Locked') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Lock className="h-3.5 w-3.5" strokeWidth={2} /> Locked
      </span>
    );
  }
  return (
    <button
      type="button"
      className={
        layout === 'card'
          ? `${cardGhost} font-semibold`
          : 'inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
      }
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      View <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}
