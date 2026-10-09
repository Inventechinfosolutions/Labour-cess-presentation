import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useRouter } from '@/router';
import {
  Upload,
  Banknote,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Inbox,
  ArrowRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/EmptyState';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { formatDate, relativeTime } from '@/lib/format';
import type { ReconciliationBatch } from '@/store/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TD_CLAMP,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
  LIST_TABLE_PAGE_SIZE,
} from '@/components/shared/tasksTableTokens';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';

type DateFilter = 'all' | 'today' | 'week' | 'month';

const BATCH_STATUSES: ReconciliationBatch['status'][] = ['Uploaded', 'Validated', 'Matching', 'Reconciled', 'Exception'];

export function ReconciliationPage() {
  const { navigate } = useRouter();
  const { reconBatches, uploadBatch } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [showUpload, setShowUpload] = useState(false);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<ReconciliationBatch['status'] | 'all'>('all');
  const [page, setPage] = useState(1);

  const totals = reconBatches.reduce(
    (a, b) => ({
      total: a.total + b.totalTransactions,
      matched: a.matched + b.matchedCount,
      unmatched: a.unmatched + b.unmatchedCount,
      exceptions: a.exceptions + b.exceptionsCount,
    }),
    { total: 0, matched: 0, unmatched: 0, exceptions: 0 },
  );

  const dateOk = (iso: string, filter: DateFilter) => {
    if (filter === 'all') return true;
    const now = Date.now();
    const dayMs = 86_400_000;
    const t = new Date(iso).getTime();
    if (filter === 'today') return now - t < dayMs;
    if (filter === 'week') return now - t < dayMs * 7;
    if (filter === 'month') return now - t < dayMs * 31;
    return true;
  };

  const filteredBatches = useMemo(() => {
    return reconBatches
      .filter((b) => (statusFilter === 'all' ? true : b.status === statusFilter))
      .filter((b) => dateOk(b.uploadedAt, dateFilter))
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [b.batchId, b.fileName, b.uploadedBy].some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [reconBatches, statusFilter, dateFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredBatches.length / LIST_TABLE_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = filteredBatches.length === 0 ? 0 : (safePage - 1) * LIST_TABLE_PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * LIST_TABLE_PAGE_SIZE, filteredBatches.length);

  const pagedBatches = useMemo(
    () => filteredBatches.slice((safePage - 1) * LIST_TABLE_PAGE_SIZE, safePage * LIST_TABLE_PAGE_SIZE),
    [filteredBatches, safePage],
  );

  const tableCascadeKey = useMemo(() => pagedBatches.map((b) => b.batchId).join('|'), [pagedBatches]);

  const hasActiveFilters = statusFilter !== 'all' || dateFilter !== 'all' || !!search.trim();

  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, search]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const smoothEase = 'power3.out' as const;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll('.list-dash-reveal'),
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, stagger: { each: 0.07, ease: smoothEase }, duration: 0.72, ease: smoothEase },
      );

      const tl = gsap.timeline({ defaults: { duration: 0.75, ease: smoothEase } });
      let slot = 0;
      root.querySelectorAll('table').forEach((table) => {
        const theadRow = table.querySelector('thead tr');
        const bodyRows = table.querySelectorAll('tbody tr.list-dash-row');
        if (theadRow) {
          tl.fromTo(theadRow, { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.68 }, slot);
        }
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
            theadRow ? slot + 0.1 : slot,
          );
        }
        slot += 0.22;
      });
    }, ref);

    return () => ctx.revert();
  }, [statusFilter, dateFilter, search, page, tableCascadeKey]);

  const onUpload = (fileName: string) => {
    const b = uploadBatch(fileName);
    setShowUpload(false);
    toast.success('Bank statement uploaded — ready for matching.');
    navigate(`/reconciliation/${b.batchId}`);
  };

  const selectBarClass =
    'h-10 min-w-0 rounded-lg border border-border/90 bg-background px-3 text-sm text-foreground shadow-sm ring-1 ring-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:ring-white/[0.04]';

  const batchStatusClass = (s: ReconciliationBatch['status']) =>
    cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
      s === 'Reconciled' && 'status-paid-bg status-paid-text',
      s === 'Matching' && 'status-info-bg status-info-text',
      (s === 'Uploaded' || s === 'Validated') && 'status-warn-bg status-warn-text',
      s === 'Exception' && 'status-danger-bg status-danger-text',
    );

  return (
    <TooltipProvider delayDuration={350}>
      <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-12 md:px-6">
        <section className="list-dash-reveal space-y-2 pt-4 md:pt-6">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18"
              aria-hidden
            >
              <Banknote className="h-6 w-6" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">Banking & reconciliation</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                Upload bank statements, auto-match lines to system vouchers and clear exceptions — same list controls as Tasks.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <ListPagePrimaryKpiCard
            label="Total transactions"
            value={totals.total}
            sub="Across all uploaded batches"
            icon={<Banknote className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />}
          />
          <ListPageSecondaryKpiCard
            delayMs={40}
            label="Matched"
            value={totals.matched}
            sub="Linked to system"
            icon={<CheckCircle2 className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
            tone="emerald"
          />
          <ListPageSecondaryKpiCard
            delayMs={80}
            label="Unmatched"
            value={totals.unmatched}
            sub="Needs pairing"
            icon={<XCircle className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
            tone="destructive"
          />
          <ListPageSecondaryKpiCard
            delayMs={120}
            label="Exceptions"
            value={totals.exceptions}
            sub="Amount / duplicate issues"
            icon={<AlertCircle className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
            tone="amber"
          />
        </div>

        {/* Recent uploads — Tasks-style board */}
        <div className="list-dash-reveal fms-dashboard-panel fms-dashboard-chart-board overflow-hidden rounded-2xl">
          <div className="border-b border-border bg-card p-4 md:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="min-w-0 shrink-0 lg:max-w-[min(100%,320px)]">
                <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">Recent uploads</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Statement batches — select a row to drill into lines</p>
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                  <AnimatedSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search batch ID, file, uploader…"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ReconciliationBatch['status'] | 'all')}
                  className={cn(selectBarClass, 'min-w-[148px] shrink-0')}
                >
                  <option value="all">All statuses</option>
                  {BATCH_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
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
                <Button
                  type="button"
                  onClick={() => setShowUpload(true)}
                  className="h-10 shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  Upload statement
                </Button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setDateFilter('all');
                      setSearch('');
                    }}
                    className="h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={TASKS_TABLE_SCROLL_WRAP}>
            <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1000px] table-fixed')}>
              <thead>
                <tr>
                  <th className={TASKS_TABLE_TH}>Sl. No</th>
                  <th className={TASKS_TABLE_TH}>Batch</th>
                  <th className={TASKS_TABLE_TH}>Uploaded</th>
                  <th className={TASKS_TABLE_TH}>Records</th>
                  <th className={TASKS_TABLE_TH}>Matched</th>
                  <th className={TASKS_TABLE_TH}>Unmatched</th>
                  <th className={TASKS_TABLE_TH}>Exceptions</th>
                  <th className={TASKS_TABLE_TH}>Status</th>
                  <th className={TASKS_TABLE_TH}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                      <EmptyState
                        title={hasActiveFilters ? 'No batches match your filters' : 'No batches yet'}
                        description={
                          hasActiveFilters
                            ? 'Try clearing filters or widening your search.'
                            : 'Upload a bank statement CSV to start reconciliation.'
                        }
                        icon={<Inbox className="h-7 w-7 text-muted-foreground" />}
                        action={
                          <Button type="button" onClick={() => setShowUpload(true)} className="gap-1.5">
                            <Upload className="h-4 w-4" aria-hidden />
                            Upload
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  pagedBatches.map((b, index) => {
                    const serialNo = (safePage - 1) * LIST_TABLE_PAGE_SIZE + index + 1;
                    const batchLine = `${b.batchId} · ${b.fileName}`;
                    return (
                      <tr
                        key={b.batchId}
                        className="list-dash-row cursor-pointer transition hover:bg-muted/35"
                        onClick={() => navigate(`/reconciliation/${b.batchId}`)}
                      >
                        <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
                        <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                          <TruncateTip line={batchLine} tip={`${b.batchId}\n${b.fileName}`} className="font-mono text-xs" />
                        </td>
                        <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                          <TruncateTip
                            line={`${formatDate(b.uploadedAt)} · ${b.uploadedBy}`}
                            tip={`${formatDate(b.uploadedAt)}\n${relativeTime(b.uploadedAt)}\n${b.uploadedBy}`}
                            className="text-xs"
                          />
                        </td>
                        <td className={cn(TASKS_TABLE_TD, 'tabular-nums')}>{b.totalTransactions}</td>
                        <td className={cn(TASKS_TABLE_TD, 'status-success-text text-right font-medium tabular-nums')}>{b.matchedCount}</td>
                        <td className={cn(TASKS_TABLE_TD, 'text-right font-medium tabular-nums text-muted-foreground')}>{b.unmatchedCount}</td>
                        <td className={cn(TASKS_TABLE_TD, 'status-warn-text text-right font-medium tabular-nums')}>{b.exceptionsCount}</td>
                        <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                          <span className={batchStatusClass(b.status)}>{b.status}</span>
                        </td>
                        <td className={cn(TASKS_TABLE_TD, 'w-[1%] whitespace-nowrap text-right')}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/reconciliation/${b.batchId}`);
                            }}
                          >
                            Open <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredBatches.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{pageStart}</span>–
                <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
                <span className="font-medium text-foreground">{filteredBatches.length}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
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
                <span className="px-2 text-sm tabular-nums text-muted-foreground">
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

        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={onUpload} />}
      </div>
    </TooltipProvider>
  );
}

function TruncateTip({
  line,
  tip,
  className,
}: {
  line: string;
  tip?: string;
  className?: string;
}) {
  const full = (tip ?? line).trim();
  if (!line.trim()) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="presentation"
          className={cn(
            'block min-w-0 cursor-default truncate text-left text-sm leading-tight text-foreground',
            className,
          )}
        >
          {line}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
        <p className="whitespace-pre-wrap break-words leading-snug">{full}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (name: string) => void }) {
  const [fileName, setFileName] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-semibold">Upload bank statement</h3>
          <p className="mt-1 text-sm text-muted-foreground">Supported formats: CSV, XLSX. Duplicate uploads will be flagged.</p>
          <div className="mt-4 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <div className="mt-2 font-medium">Drop file or click to choose</div>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. sbi-stmt-may-2026.csv"
              className="mt-3 h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onUpload(fileName || `statement-${Date.now()}.csv`)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="mr-1.5 h-4 w-4" aria-hidden />
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
