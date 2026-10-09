import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  CreditCard,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  Inbox,
  ArrowRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Landmark,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/shared/EmptyState';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import type { Role } from '@/store/types';
import { toast } from 'sonner';
import { useCoinSfx } from '@/lib/useCoinSfx';
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
import { departments } from '@/store/mockData';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type ViewMode = 'queue' | 'paid';

export function PaymentsPage() {
  const { bills, tasks, currentRole, processPayment } = useApp();
  const role: Role = (currentRole ?? 'Payment') as Role;
  const { navigate } = useRouter();
  const { play: playPaymentSfx } = useCoinSfx();
  const ref = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('queue');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState<'NEFT' | 'RTGS' | 'Cheque'>('NEFT');
  const [page, setPage] = useState(1);

  const queueSource = useMemo(() => {
    const ids = new Set(
      tasks.filter((t) => t.subjectType === 'Bill' && t.assignedToRole === 'Payment' && t.status === 'Pending').map((t) => t.billId!),
    );
    return bills.filter((b) => ids.has(b.billId));
  }, [bills, tasks]);

  const paidSource = useMemo(
    () => bills.filter((b) => b.status === 'Paid').sort((a, b) => new Date(b.paidAt ?? b.updatedAt).getTime() - new Date(a.paidAt ?? a.updatedAt).getTime()),
    [bills],
  );

  const processingCount = useMemo(() => bills.filter((b) => b.status === 'Payment Processing').length, [bills]);
  const totalPaidFY = useMemo(() => paidSource.reduce((a, b) => a + b.amount, 0), [paidSource]);

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

  const filteredQueue = useMemo(() => {
    return queueSource
      .filter((b) => (deptFilter === 'all' ? true : b.department === deptFilter))
      .filter((b) => dateOk(b.updatedAt, dateFilter))
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [b.billId, b.payeeName, b.billType, b.bankAccount, b.ifsc].some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [queueSource, deptFilter, dateFilter, search]);

  const filteredPaid = useMemo(() => {
    return paidSource
      .filter((b) => (deptFilter === 'all' ? true : b.department === deptFilter))
      .filter((b) => {
        const anchor = b.paidAt ?? b.updatedAt;
        return dateOk(anchor, dateFilter);
      })
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [b.billId, b.payeeName, b.paymentRef ?? '', b.paymentMode ?? ''].some((v) => String(v).toLowerCase().includes(q));
      });
  }, [paidSource, deptFilter, dateFilter, search]);

  const activeList = viewMode === 'queue' ? filteredQueue : filteredPaid;
  const pageCount = Math.max(1, Math.ceil(activeList.length / LIST_TABLE_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageStart = activeList.length === 0 ? 0 : (safePage - 1) * LIST_TABLE_PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * LIST_TABLE_PAGE_SIZE, activeList.length);

  const pagedQueue = useMemo(
    () => filteredQueue.slice((safePage - 1) * LIST_TABLE_PAGE_SIZE, safePage * LIST_TABLE_PAGE_SIZE),
    [filteredQueue, safePage],
  );
  const pagedPaid = useMemo(
    () => filteredPaid.slice((safePage - 1) * LIST_TABLE_PAGE_SIZE, safePage * LIST_TABLE_PAGE_SIZE),
    [filteredPaid, safePage],
  );

  const tableCascadeKey = useMemo(
    () => (viewMode === 'queue' ? pagedQueue.map((b) => b.billId) : pagedPaid.map((b) => b.billId)).join('|'),
    [viewMode, pagedQueue, pagedPaid],
  );

  const hasActiveFilters = dateFilter !== 'all' || deptFilter !== 'all' || !!search.trim();

  useEffect(() => {
    setPage(1);
  }, [viewMode, dateFilter, deptFilter, search]);

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

      const theadRow = root.querySelector('table thead tr');
      const bodyRows = root.querySelectorAll('tbody tr.list-dash-row');

      const tl = gsap.timeline({ defaults: { duration: 0.75, ease: smoothEase } });

      if (theadRow) {
        tl.fromTo(theadRow, { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.68 });
      }

      if (bodyRows.length) {
        tl.fromTo(
          bodyRows,
          { opacity: 0, y: -22 },
          { opacity: 1, y: 0, duration: 0.78, stagger: { each: 0.085, from: 'start', ease: smoothEase } },
          theadRow ? '+=0.1' : 0,
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [viewMode, dateFilter, deptFilter, search, page, tableCascadeKey]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const processBatch = () => {
    if (role !== 'Payment') {
      toast.error('Only Payment Officer can process payments.');
      return;
    }
    if (selected.length === 0) return toast.error('Select at least one bill.');
    selected.forEach((id) => {
      const refStr = `${batchMode}-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
      processPayment(id, batchMode, refStr);
    });
    playPaymentSfx();
    toast.success(`Processed ${selected.length} payment(s) via ${batchMode}`);
    setSelected([]);
  };

  const generateBankFile = () => {
    if (role !== 'Payment') {
      toast.error('Only Payment Officer can generate bank files.');
      return;
    }

    const exportBills = selected.length > 0 ? filteredQueue.filter((b) => selected.includes(b.billId)) : filteredQueue;
    if (exportBills.length === 0) {
      toast.error('No bills available to generate bank file.');
      return;
    }

    const generatedAt = new Date();
    const fileDate = generatedAt.toISOString().slice(0, 10);
    const fileTs = generatedAt.toISOString().replace(/[:.]/g, '-');

    const rows = [
      ['bill_id', 'payee_name', 'bank_account', 'ifsc', 'bank_name', 'amount', 'payment_mode', 'narration', 'generated_on'],
      ...exportBills.map((b) => [
        b.billId,
        b.payeeName,
        b.bankAccount,
        b.ifsc,
        b.bankName,
        b.amount.toFixed(2),
        batchMode,
        `RGUHS FMS payout for ${b.billId}`,
        fileDate,
      ]),
    ];

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csvContent = rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bank-file-${batchMode.toLowerCase()}-${fileTs}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success(`Bank file generated for ${exportBills.length} bill(s).`);
  };

  const selectBarClass =
    'h-10 min-w-0 rounded-lg border border-border/90 bg-background px-3 text-sm text-foreground shadow-sm ring-1 ring-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:ring-white/[0.04]';

  const deptOptions = useMemo(
    () => Array.from(new Set([...departments, ...bills.map((b) => b.department)])).filter(Boolean),
    [bills],
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
              <CreditCard className="h-6 w-6" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">Payments</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                Process approved bills via RTGS, NEFT or cheque, generate bank files and review settled vouchers — same controls as your task queue.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <ListPagePrimaryKpiCard
            label="Ready for payment"
            value={queueSource.length}
            sub="In your disbursement queue"
            icon={<Clock className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />}
          />
          <ListPageSecondaryKpiCard
            delayMs={40}
            label="Paid (FY)"
            value={paidSource.length}
            sub="Settled vouchers"
            icon={<CheckCircle2 className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
            tone="emerald"
          />
          <ListPageSecondaryKpiCard
            delayMs={80}
            label="Processing"
            value={processingCount}
            sub="In payment processing"
            icon={<Activity className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
            tone="amber"
          />
          <ListPageSecondaryKpiCard
            delayMs={120}
            label="Disbursed value"
            value={formatINR(totalPaidFY)}
            sub="Across all paid bills"
            icon={<TrendingUp className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
            tone="purple"
          />
        </div>

        <div className="list-dash-reveal fms-dashboard-panel fms-dashboard-chart-board overflow-hidden rounded-2xl">
          <div className="border-b border-border bg-card p-4 md:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              <div className="min-w-0 shrink-0 lg:max-w-[min(100%,320px)]">
                <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">
                  {viewMode === 'queue' ? 'Payment queue' : 'Payment history'}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {viewMode === 'queue' ? 'Bills with an active payment-officer task' : 'Completed disbursements and references'}
                </p>
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
                <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                  <AnimatedSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder={viewMode === 'queue' ? 'Search bill, payee, bank…' : 'Search payee, ref, bill…'}
                  />
                </div>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  className={cn(selectBarClass, 'min-w-[160px] shrink-0')}
                >
                  <option value="queue">Payment queue</option>
                  <option value="paid">Payment history</option>
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
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className={cn(selectBarClass, 'min-w-[140px] max-w-[200px] shrink-0')}
                >
                  <option value="all">All departments</option>
                  {deptOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {(dateFilter !== 'all' || deptFilter !== 'all' || search) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter('all');
                      setDeptFilter('all');
                      setSearch('');
                    }}
                    className="h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'queue' && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                <select
                  value={batchMode}
                  onChange={(e) => setBatchMode(e.target.value as 'NEFT' | 'RTGS' | 'Cheque')}
                  className={cn(selectBarClass, 'min-w-[120px]')}
                >
                  <option value="NEFT">NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="Cheque">Cheque</option>
                </select>
                <Button
                  onClick={processBatch}
                  disabled={selected.length === 0 || role !== 'Payment'}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" aria-hidden />
                  Process {selected.length > 0 ? `${selected.length} ` : ''}
                  payment{selected.length === 1 ? '' : 's'}
                </Button>
                <Button type="button" variant="outline" onClick={generateBankFile} className="gap-1.5">
                  <FileText className="h-4 w-4" aria-hidden />
                  Generate bank file
                </Button>
                <span className="text-xs text-muted-foreground lg:ml-auto">
                  Select rows below, choose instrument, then process or export CSV.
                </span>
              </div>
            )}
          </div>

          <div className={TASKS_TABLE_SCROLL_WRAP}>
            {viewMode === 'queue' ? (
              <table className={cn(TASKS_TABLE_ROOT, 'min-w-[980px] table-fixed')}>
                <thead>
                  <tr>
                    <th className={TASKS_TABLE_TH} style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={filteredQueue.length > 0 && selected.length === filteredQueue.length}
                        onChange={(e) => setSelected(e.target.checked ? filteredQueue.map((b) => b.billId) : [])}
                      />
                    </th>
                    <th className={TASKS_TABLE_TH}>Sl. No</th>
                    <th className={TASKS_TABLE_TH}>Bill ID</th>
                    <th className={TASKS_TABLE_TH}>Payee & type</th>
                    <th className={TASKS_TABLE_TH}>Department</th>
                    <th className={TASKS_TABLE_TH}>Bank details</th>
                    <th className={TASKS_TABLE_TH}>Amount</th>
                    <th className={TASKS_TABLE_TH}>Status</th>
                    <th className={TASKS_TABLE_TH}>Updated</th>
                    <th className={TASKS_TABLE_TH}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                        <EmptyState
                          title={hasActiveFilters ? 'No bills match your filters' : 'No bills in payment queue'}
                          description={
                            hasActiveFilters
                              ? 'Try clearing filters or widening your search.'
                              : 'When finance approves bills, they will appear here with a payment task.'
                          }
                          icon={<Inbox className="h-7 w-7 text-muted-foreground" />}
                        />
                      </td>
                    </tr>
                  ) : (
                    pagedQueue.map((b, index) => {
                      const serialNo = (safePage - 1) * LIST_TABLE_PAGE_SIZE + index + 1;
                      const bankLine = `${b.bankAccount} · ${b.ifsc}`;
                      const bankTip = `${b.bankName}\n${b.bankAccount}\n${b.ifsc}`;
                      return (
                        <tr
                          key={b.billId}
                          className="list-dash-row cursor-pointer transition hover:bg-muted/35"
                          onClick={() => navigate(`/bills/${b.billId}`)}
                        >
                          <td className={TASKS_TABLE_TD} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="rounded border-border"
                              checked={selected.includes(b.billId)}
                              onChange={() => toggleSelect(b.billId)}
                            />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={b.billId} tip={b.billId} className="font-mono text-xs" />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip
                              line={`${b.payeeName} · ${b.billType}`}
                              tip={`${b.payeeName}\n${b.billType}\n${formatINR(b.amount)}`}
                              className="text-sm font-medium"
                            />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={b.department} />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={bankLine} tip={bankTip} className="text-xs" />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-right font-semibold tabular-nums')}>{formatINR(b.amount)}</td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <StatusBadge status={b.status} />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>
                            <TruncateTip line={relativeTime(b.updatedAt)} tip={formatDate(b.updatedAt)} />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, 'w-[1%] whitespace-nowrap text-right')}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/bills/${b.billId}`);
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
            ) : (
              <table className={cn(TASKS_TABLE_ROOT, 'min-w-[920px] table-fixed')}>
                <thead>
                  <tr>
                    <th className={TASKS_TABLE_TH}>Sl. No</th>
                    <th className={TASKS_TABLE_TH}>Bill ID</th>
                    <th className={TASKS_TABLE_TH}>Payee</th>
                    <th className={TASKS_TABLE_TH}>Department</th>
                    <th className={TASKS_TABLE_TH}>Mode</th>
                    <th className={TASKS_TABLE_TH}>Reference</th>
                    <th className={TASKS_TABLE_TH}>Amount</th>
                    <th className={TASKS_TABLE_TH}>Paid on</th>
                    <th className={TASKS_TABLE_TH}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaid.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                        <EmptyState
                          title={hasActiveFilters ? 'No payments match your filters' : 'No paid vouchers yet'}
                          description={
                            hasActiveFilters ? 'Adjust filters to see more rows.' : 'Completed disbursements will appear here with instrument references.'
                          }
                          icon={<Landmark className="h-7 w-7 text-muted-foreground" />}
                        />
                      </td>
                    </tr>
                  ) : (
                    pagedPaid.map((b, index) => {
                      const serialNo = (safePage - 1) * LIST_TABLE_PAGE_SIZE + index + 1;
                      return (
                        <tr
                          key={b.billId}
                          className="list-dash-row cursor-pointer transition hover:bg-muted/35"
                          onClick={() => navigate(`/bills/${b.billId}`)}
                        >
                          <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs text-muted-foreground')}>{serialNo}</td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={b.billId} className="font-mono text-xs" />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={b.payeeName} className="text-sm font-medium" />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={b.department} />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <span className="inline-flex items-center gap-1 rounded-full status-paid-bg status-paid-text px-2 py-0.5 text-[11px] font-semibold">
                              <CheckCircle2 className="h-3 w-3" aria-hidden />
                              {b.paymentMode ?? '—'}
                            </span>
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={b.paymentRef ?? '—'} className="font-mono text-xs" />
                          </td>
                          <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-right font-semibold tabular-nums')}>{formatINR(b.amount)}</td>
                          <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>
                            {b.paidAt ? <TruncateTip line={formatDate(b.paidAt)} tip={relativeTime(b.paidAt)} /> : '—'}
                          </td>
                          <td className={cn(TASKS_TABLE_TD, 'w-[1%] whitespace-nowrap text-right')}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/bills/${b.billId}`);
                              }}
                            >
                              <Download className="mr-1 h-4 w-4" aria-hidden />
                              Voucher
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {activeList.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{pageStart}</span>–
                <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
                <span className="font-medium text-foreground">{activeList.length}</span>
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
          onClick={(e) => e.stopPropagation()}
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
