import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Plus,
  AlertTriangle,
  Banknote,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileEdit,
  XCircle,
  ShieldCheck,
  ClipboardCheck,
  Wallet,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { ReceiptStatusBadge } from '@/components/shared/ReceiptStatusBadge';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { ListTableCardsFlipToggle, type ListViewMode } from '@/components/shared/ListTableCardsFlipToggle';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';
import { WorkflowQueueCard } from '@/components/shared/WorkflowQueueCard';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import type { Receipt, ReceiptStatus, Role } from '@/store/types';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';

const ROWS_OPTIONS = [5, 10, 25] as const;

export function ReceiptsPage() {
  const { receipts, currentRole, currentUser, receiptCancellations } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
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
  }, [statusFilter, modeFilter, search, page, rowsPerPage]);

  const baseReceipts = useMemo(() => {
    if (role === 'Creator') {
      return receipts.filter(
        (r) =>
          r.createdBy === currentUser &&
          ['Draft', 'Submitted', 'Sent Back', 'Approved', 'Confirmed', 'Rejected', 'Cancelled', 'On Hold', 'Verified'].includes(r.status),
      );
    }
    if (role === 'Verifier') return receipts.filter((r) => ['Submitted'].includes(r.status) || r.history.some((h) => h.role === 'Verifier'));
    if (role === 'Approver')
      return receipts.filter((r) => ['Verified', 'Approved', 'Confirmed', 'Rejected', 'On Hold'].includes(r.status) || r.history.some((h) => h.role === 'Approver'));
    if (role === 'Finance') return receipts;
    if (role === 'Auditor') return receipts;
    return receipts;
  }, [receipts, role, currentUser]);

  const filtered = useMemo(() => {
    return baseReceipts
      .filter((r) => (statusFilter === 'all' ? true : r.status === statusFilter))
      .filter((r) => (modeFilter === 'all' ? true : r.paymentMode === modeFilter))
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [r.receiptNumber, r.payerName, r.payerIdentifier, r.transactionReference, r.entityName].some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [baseReceipts, statusFilter, modeFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const pageEnd = Math.min(safePage * rowsPerPage, filtered.length);

  const pagedRows = useMemo(
    () => filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage),
    [filtered, safePage, rowsPerPage],
  );

  const totals = useMemo(() => {
    const confirmed = baseReceipts.filter((r) => r.status === 'Confirmed');
    const collected = confirmed.reduce((s, r) => s + r.amount, 0);
    return {
      total: baseReceipts.length,
      confirmed: confirmed.length,
      cancelled: baseReceipts.filter((r) => r.status === 'Cancelled').length,
      duplicates: baseReceipts.filter((r) => r.duplicateFlag).length,
      collected,
    };
  }, [baseReceipts]);

  const queueCounts = useMemo(
    () => ({
      pendingVerification: receipts.filter((r) => r.status === 'Submitted').length,
      pendingApproval: receipts.filter((r) => r.status === 'Verified').length,
      pendingFinanceReview: receipts.filter((r) => r.status === 'Approved').length,
      sentBack: receipts.filter((r) => r.status === 'Sent Back').length,
      onHold: receipts.filter((r) => r.status === 'On Hold').length,
      pendingCancellations: receiptCancellations.filter((c) => c.status === 'PENDING').length,
    }),
    [receipts, receiptCancellations],
  );

  const roleHeadline = useMemo(() => {
    if (role === 'Creator') return 'Create incoming receipts and track their verification, approval and confirmation.';
    if (role === 'Verifier') return 'Receipts pending your verification. Forward to Approver or send back to creator.';
    if (role === 'Approver') return 'Verified receipts awaiting your decision. Approve & forward to Finance Officer for final review.';
    if (role === 'Finance') return 'Final review, monitoring, duplicate resolution and cancellations.';
    return 'Read-only oversight of every receipt and its lifecycle.';
  }, [role]);

  const hasActiveFilters = statusFilter !== 'all' || modeFilter !== 'all' || !!search.trim();

  const selectBarClass =
    'h-10 shrink-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1400px] space-y-6">
      <div className="bud-block flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">Receipt Management</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{roleHeadline}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {(role === 'Finance' || role === 'Auditor') && (
            <Button variant="outline" className="h-11 rounded-xl" onClick={() => navigate('/receipts/duplicates')}>
              <AlertTriangle className="mr-2 h-4 w-4" strokeWidth={2} /> Duplicates &amp; Exceptions
            </Button>
          )}
          {role === 'Creator' && (
            <Button
              onClick={() => navigate('/receipts/new')}
              className="h-11 shrink-0 rounded-xl bg-primary px-5 text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" strokeWidth={2} /> New Receipt
            </Button>
          )}
        </div>
      </div>

      <div className="bud-block grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ListPagePrimaryKpiCard
          label="Total receipts"
          value={totals.total}
          sub={`${totals.confirmed} confirmed`}
          icon={<Banknote className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
        />
        <ListPageSecondaryKpiCard
          delayMs={40}
          label="Collected (confirmed)"
          value={formatINR(totals.collected)}
          sub="Recorded inflows"
          icon={<CheckCircle2 className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="emerald"
        />
        <ListPageSecondaryKpiCard
          delayMs={80}
          label="Cancelled"
          value={totals.cancelled}
          sub="Voided receipts"
          icon={<XCircle className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="destructive"
        />
        <ListPageSecondaryKpiCard
          delayMs={120}
          label="Duplicate risks"
          value={totals.duplicates}
          sub="Review carefully"
          icon={<AlertTriangle className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="purple"
        />
      </div>

      <div className="bud-block grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="grid grid-cols-2 gap-3 lg:col-span-2 md:grid-cols-4">
          <WorkflowQueueCard
            icon={ShieldCheck}
            label="Pending Verification"
            count={queueCounts.pendingVerification}
            iconTone="teal"
            onView={() => {
              setStatusFilter('Submitted');
              setPage(1);
            }}
          />
          <WorkflowQueueCard
            icon={ClipboardCheck}
            label="Pending Approval"
            count={queueCounts.pendingApproval}
            iconTone="purple"
            onView={() => {
              setStatusFilter('Verified');
              setPage(1);
            }}
          />
          <WorkflowQueueCard
            icon={Wallet}
            label="Pending Finance Review"
            count={queueCounts.pendingFinanceReview}
            iconTone="amber"
            onView={() => {
              setStatusFilter('Approved');
              setPage(1);
            }}
          />
          <WorkflowQueueCard
            variant="primary"
            icon={Pause}
            label="On Hold"
            count={queueCounts.onHold}
            onView={() => {
              setStatusFilter('On Hold');
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
              <span className="text-muted-foreground">Possible duplicates</span>
              <span className="kpi-pill-danger inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                {totals.duplicates}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 last:border-0 last:pb-0">
              <span className="text-muted-foreground">High-value receipts (&gt; ₹5L)</span>
              <span className="kpi-pill-neutral inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                {receipts.filter((r) => r.amount > 500000).length}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-border/80 pb-3 last:border-0 last:pb-0">
              <span className="text-muted-foreground">Sent back</span>
              <span className="kpi-pill-warn inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                {queueCounts.sentBack}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Pending cancellations</span>
              <span className="kpi-pill-info inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums">
                {queueCounts.pendingCancellations}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bud-block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-card px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div>
              <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">Receipt register</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Search, filter, and open a receipt for review</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                <AnimatedSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search receipt #, payer, txn ref, entity…"
                  inputId="receipt-register-search"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReceiptStatus | 'all')}
                className={cn(selectBarClass, 'min-w-[140px]')}
              >
                <option value="all">All statuses</option>
                {(['Draft', 'Submitted', 'Verified', 'Confirmed', 'Sent Back', 'On Hold', 'Rejected', 'Cancelled'] as ReceiptStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className={cn(selectBarClass, 'min-w-[120px]')}>
                <option value="all">All modes</option>
                {['UPI', 'NEFT', 'RTGS', 'IMPS', 'CARD', 'CASH', 'CHEQUE'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setModeFilter('all');
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
            <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1100px] table-fixed')}>
              <thead>
                <tr>
                  <th className={cn(TASKS_TABLE_TH, 'w-14')}>SL. NO</th>
                  <th className={TASKS_TABLE_TH}>Receipt</th>
                  <th className={TASKS_TABLE_TH}>Payer</th>
                  <th className={TASKS_TABLE_TH}>Entity</th>
                  <th className={TASKS_TABLE_TH}>Mode / Ref</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
                  <th className={TASKS_TABLE_TH}>Status</th>
                  <th className={TASKS_TABLE_TH}>Updated</th>
                  <th className={cn(TASKS_TABLE_TH, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                      <EmptyState
                        title={hasActiveFilters ? 'No receipts match your filters' : 'No receipts'}
                        description={
                          hasActiveFilters
                            ? 'Try clearing filters to see more results.'
                            : role === 'Creator'
                              ? 'Create your first receipt to record an incoming payment.'
                              : 'Nothing in your scope yet.'
                        }
                        action={
                          role === 'Creator' ? (
                            <Button onClick={() => navigate('/receipts/new')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                              <Plus className="mr-1.5 h-4 w-4" /> New Receipt
                            </Button>
                          ) : undefined
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((r, index) => (
                    <ReceiptRow
                      key={r.id}
                      serialNo={(safePage - 1) * rowsPerPage + index + 1}
                      receipt={r}
                      role={role}
                      onOpen={() => navigate(`/receipts/${r.id}`)}
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
                  title={hasActiveFilters ? 'No receipts match your filters' : 'No receipts'}
                  description={
                    hasActiveFilters
                      ? 'Try clearing filters to see more results.'
                      : role === 'Creator'
                        ? 'Create your first receipt to record an incoming payment.'
                        : 'Nothing in your scope yet.'
                  }
                  action={
                    role === 'Creator' ? (
                      <Button onClick={() => navigate('/receipts/new')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="mr-1.5 h-4 w-4" /> New Receipt
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {pagedRows.map((r, index) => (
                  <ReceiptCard
                    key={r.id}
                    serialNo={(safePage - 1) * rowsPerPage + index + 1}
                    receipt={r}
                    role={role}
                    onOpen={() => navigate(`/receipts/${r.id}`)}
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

function ReceiptCard({ serialNo, receipt, role, onOpen }: { serialNo: number; receipt: Receipt; role: Role; onOpen: () => void }) {
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
        <ReceiptStatusBadge status={receipt.status} />
      </div>
      <div className="mt-2 font-mono text-sm font-semibold text-foreground">{receipt.receiptNumber}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(receipt.receiptDate)}</div>
      {receipt.duplicateFlag ? (
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider status-warn-text">
          <AlertTriangle className="h-3 w-3" /> Duplicate
        </div>
      ) : null}
      <div className="mt-3 border-t border-border/60 pt-3">
        <div className="font-medium text-foreground">{receipt.payerName}</div>
        <div className="font-mono text-xs text-muted-foreground">{receipt.payerIdentifier}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{receipt.sourceType}</div>
      </div>
      <div className="mt-2 text-sm text-foreground">{receipt.entityName}</div>
      <div className="text-xs text-muted-foreground">{receipt.entityType}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div>
          <div className="text-sm font-medium">{receipt.paymentMode}</div>
          <div className="font-mono text-xs text-muted-foreground">{receipt.transactionReference}</div>
        </div>
        <span className="text-base font-semibold tabular-nums text-foreground">{formatINR(receipt.amount)}</span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{relativeTime(receipt.updatedAt)}</div>
      <div className="mt-3 flex justify-end">
        <RowAction receipt={receipt} role={role} onOpen={onOpen} layout="card" />
      </div>
    </div>
  );
}

function ReceiptRow({ serialNo, receipt, role, onOpen }: { serialNo: number; receipt: Receipt; role: Role; onOpen: () => void }) {
  return (
    <tr className="bud-row cursor-pointer border-border/80 transition odd:bg-background even:bg-muted/25 hover:bg-muted/45" onClick={onOpen}>
      <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
      <td className={TASKS_TABLE_TD}>
        <div className="font-mono text-xs font-medium">{receipt.receiptNumber}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(receipt.receiptDate)}</div>
        {receipt.duplicateFlag && (
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider status-warn-text">
            <AlertTriangle className="h-3 w-3" /> Duplicate
          </div>
        )}
      </td>
      <td className={TASKS_TABLE_TD}>
        <div className="font-medium">{receipt.payerName}</div>
        <div className="font-mono text-xs text-muted-foreground">{receipt.payerIdentifier}</div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{receipt.sourceType}</div>
      </td>
      <td className={TASKS_TABLE_TD}>
        <div className="text-sm">{receipt.entityName}</div>
        <div className="text-xs text-muted-foreground">{receipt.entityType}</div>
      </td>
      <td className={TASKS_TABLE_TD}>
        <div className="text-sm font-medium">{receipt.paymentMode}</div>
        <div className="font-mono text-xs text-muted-foreground">{receipt.transactionReference}</div>
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>{formatINR(receipt.amount)}</td>
      <td className={TASKS_TABLE_TD}>
        <ReceiptStatusBadge status={receipt.status} />
      </td>
      <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{relativeTime(receipt.updatedAt)}</td>
      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
        <RowAction receipt={receipt} role={role} onOpen={onOpen} />
      </td>
    </tr>
  );
}

const RECEIPT_CARD_ROW_BTN =
  'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90';

function RowAction({
  receipt,
  role,
  onOpen,
  layout = 'table',
}: {
  receipt: Receipt;
  role: Role;
  onOpen: () => void;
  layout?: 'table' | 'card';
}) {
  const tablePrimary = 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90';

  if (role === 'Creator' && (receipt.status === 'Draft' || receipt.status === 'Sent Back')) {
    return (
      <Button
        type="button"
        size="sm"
        variant={layout === 'card' ? 'default' : 'ghost'}
        className={cn(layout === 'card' && RECEIPT_CARD_ROW_BTN)}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        <FileEdit className="mr-1 h-4 w-4" /> Edit
      </Button>
    );
  }
  if (role === 'Verifier' && receipt.status === 'Submitted') {
    return (
      <Button
        type="button"
        size="sm"
        variant="default"
        className={cn(tablePrimary, layout === 'card' && RECEIPT_CARD_ROW_BTN)}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Verify <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    );
  }
  if (role === 'Approver' && receipt.status === 'Verified') {
    return (
      <Button
        type="button"
        size="sm"
        variant="default"
        className={cn(tablePrimary, layout === 'card' && RECEIPT_CARD_ROW_BTN)}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Decide <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    );
  }
  if (receipt.status === 'Confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs status-success-text">
        <Lock className="h-3 w-3" /> Confirmed
      </span>
    );
  }
  return (
    <Button
      type="button"
      size="sm"
      variant={layout === 'card' ? 'default' : 'ghost'}
      className={cn(layout === 'card' && RECEIPT_CARD_ROW_BTN)}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      View <ArrowRight className="ml-1 h-4 w-4" />
    </Button>
  );
}
