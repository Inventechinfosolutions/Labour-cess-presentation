import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ArrowLeft, Banknote, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Pencil, Sparkles } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fmsAudio } from '@/lib/assets';
import { useRouter } from '@/router';
import {
  TASKS_TD_CLAMP,
  TASKS_TABLE_ROOT,
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  LIST_TABLE_PAGE_SIZE,
} from '@/components/shared/tasksTableTokens';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';
import {
  playReconciliationMatchSound,
  runReconciliationAutoMatchGsap,
} from '@/lib/reconciliationMatchAnimation';
import type { ReconciliationBatch, ReconTxn } from '@/store/types';
import { ListTableCardsFlipToggle, type ListViewMode } from '@/components/shared/ListTableCardsFlipToggle';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ReconciliationBatchDetailPage({ batchId }: { batchId: string }) {
  const { navigate } = useRouter();
  const { reconBatches, autoMatch, finalizeBatch, correctReconTxn, currentRole } = useApp();
  const [editTxn, setEditTxn] = useState<ReconTxn | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const activeBatchMetaRef = useRef<HTMLDivElement>(null);
  const reconSoundRef = useRef<HTMLAudioElement | null>(null);
  const [txnPage, setTxnPage] = useState(1);
  const [txnView, setTxnView] = useState<ListViewMode>('table');

  const batch = useMemo(() => reconBatches.find((b) => b.batchId === batchId) ?? null, [reconBatches, batchId]);

  useEffect(() => {
    const a = new Audio(fmsAudio.reconciliationMatch);
    a.preload = 'auto';
    a.volume = 0.4;
    reconSoundRef.current = a;
    return () => {
      try {
        a.pause();
        a.src = '';
      } catch (_) {}
      reconSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    setTxnPage(1);
  }, [batch?.batchId]);

  const txnList = batch?.transactions ?? [];
  const txnPageCount = Math.max(1, Math.ceil(txnList.length / LIST_TABLE_PAGE_SIZE));
  const safeTxnPage = Math.min(txnPage, txnPageCount);
  const pagedTxn = useMemo(
    () => txnList.slice((safeTxnPage - 1) * LIST_TABLE_PAGE_SIZE, safeTxnPage * LIST_TABLE_PAGE_SIZE),
    [txnList, safeTxnPage],
  );
  const txnCascadeKey = useMemo(() => pagedTxn.map((t) => t.id).join('|'), [pagedTxn]);
  const txnPageStart = txnList.length === 0 ? 0 : (safeTxnPage - 1) * LIST_TABLE_PAGE_SIZE + 1;
  const txnPageEnd = Math.min(safeTxnPage * LIST_TABLE_PAGE_SIZE, txnList.length);

  useEffect(() => {
    if (txnPage > txnPageCount) setTxnPage(txnPageCount);
  }, [txnPage, txnPageCount]);

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
  }, [batch?.batchId, txnPage, txnCascadeKey]);

  const matchMap = {
    Matched: 'status-success-bg status-success-text',
    Unmatched: 'status-danger-bg status-danger-text',
    Exception: 'status-warn-bg status-warn-text',
  } as const;

  const batchStatusClass = (s: ReconciliationBatch['status']) =>
    cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
      s === 'Reconciled' && 'status-paid-bg status-paid-text',
      s === 'Matching' && 'status-info-bg status-info-text',
      (s === 'Uploaded' || s === 'Validated') && 'status-warn-bg status-warn-text',
      s === 'Exception' && 'status-danger-bg status-danger-text',
    );

  const onAutoMatch = () => {
    if (!batch) return;
    autoMatch(batch.batchId);
    playReconciliationMatchSound(reconSoundRef.current);
    runReconciliationAutoMatchGsap(ref.current, activeBatchMetaRef.current);
    toast.success('Auto-matching complete.');
  };

  const onFinalize = () => {
    if (!batch) return;
    finalizeBatch(batch.batchId);
    toast.success('Reconciliation finalized.');
    navigate('/reconciliation');
  };

  const canPaymentCorrectExceptions = currentRole === 'Payment' && batch?.status !== 'Reconciled';

  if (!batch) {
    return (
      <TooltipProvider delayDuration={350}>
        <div className="fms-dashboard relative mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-12 md:px-6">
          <div className="list-dash-reveal fms-dashboard-panel fms-dashboard-chart-board rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Batch not found.</p>
            <Button type="button" variant="outline" className="mt-4 gap-2" onClick={() => navigate('/reconciliation')}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to reconciliation
            </Button>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={350}>
      <ReconCorrectMappingDialog
        open={editTxn !== null}
        onOpenChange={(open) => !open && setEditTxn(null)}
        txn={editTxn}
        onSave={(patch) => {
          correctReconTxn(batch.batchId, editTxn!.id, patch);
          setEditTxn(null);
          toast.success('Bank mapping updated.');
        }}
      />
      <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-12 md:px-6">
        <section className="list-dash-reveal flex flex-wrap items-center gap-3 pt-4 md:pt-6">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => navigate('/reconciliation')}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="fms-dashboard-title text-2xl leading-tight text-foreground md:text-[1.75rem]">Statement lines</h1>
            <p className="mt-1 text-sm text-muted-foreground">Same data as the list drill-down — card or table layout.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="list-dash-reveal">
            <ListPagePrimaryKpiCard
              label="Statement file"
              value={
                <span className="block max-w-full truncate text-left text-[1.35rem] leading-tight sm:text-[1.5rem]">{batch.fileName}</span>
              }
              sub={`${batch.batchId} · ${formatDate(batch.uploadedAt)} · ${batch.uploadedBy}`}
              icon={<FileText className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />}
            />
          </div>
          <div className="list-dash-reveal">
            <ListPageSecondaryKpiCard
              delayMs={40}
              label="Match health"
              value={
                <span className="tabular-nums">
                  <span data-recon-number>{batch.matchedCount}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span data-recon-number>{batch.totalTransactions}</span>
                </span>
              }
              sub={`Matched · Unmatched: ${batch.unmatchedCount} · Exceptions: ${batch.exceptionsCount} · ${relativeTime(batch.uploadedAt)}`}
              icon={<Banknote className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
              tone="emerald"
            />
          </div>
        </div>

        <div className="list-dash-reveal fms-dashboard-panel fms-dashboard-chart-board overflow-hidden rounded-2xl">
          <div className="border-b border-border bg-card px-4 py-4 md:px-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">Matching engine results</h3>
                  <span className={batchStatusClass(batch.status)}>{batch.status}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">Search and filter this list</p>
                {/* Meta kept off-screen for auto-match GSAP scramble target */}
                <div ref={activeBatchMetaRef} className="sr-only" aria-hidden>
                  <span>{batch.fileName}</span>
                  {' · '}
                  <span>{batch.batchId}</span>
                  {' · '}
                  <span data-recon-number>{batch.totalTransactions}</span> transactions · Matched:{' '}
                  <span data-recon-number>{batch.matchedCount}</span> · Exceptions:{' '}
                  <span data-recon-number>{batch.exceptionsCount}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 lg:max-w-[min(100%,520px)] lg:shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ListTableCardsFlipToggle view={txnView} onViewChange={setTxnView} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {txnView === 'table' ? 'Cards view (stacked)' : 'Table view (grid)'}
                    <span className="ml-1 text-muted-foreground">· click to switch</span>
                  </TooltipContent>
                </Tooltip>
                {batch.status !== 'Reconciled' && (
                  <>
                    <Button type="button" variant="outline" size="sm" onClick={onAutoMatch} className="h-9 gap-1.5">
                      <Sparkles className="h-4 w-4" aria-hidden />
                      Auto match
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={onFinalize}
                      className="h-9 gap-1.5 bg-[color:var(--chart-2)] text-primary-foreground hover:opacity-90"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Finalize
                    </Button>
                  </>
                )}
                <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5">
                  <Download className="h-4 w-4" aria-hidden />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {txnView === 'table' ? (
            <div className={TASKS_TABLE_SCROLL_WRAP}>
              <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1220px] table-fixed')}>
                <thead>
                  <tr>
                    <th className={TASKS_TABLE_TH}>Sl. No</th>
                    <th className={TASKS_TABLE_TH}>System txn</th>
                    <th className={TASKS_TABLE_TH}>Bank txn</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-right')}>System amt</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-right')}>Bank amt</th>
                    <th className={TASKS_TABLE_TH}>Reference</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-center')}>Match status</th>
                    <th className={TASKS_TABLE_TH}>Issue</th>
                    {canPaymentCorrectExceptions && <th className={cn(TASKS_TABLE_TH, 'text-center')}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {txnList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canPaymentCorrectExceptions ? 9 : 8}
                        className="border border-border/80 bg-muted/20 px-4 py-16 text-center text-sm text-muted-foreground"
                      >
                        No line items in this batch (finalized summary only).
                      </td>
                    </tr>
                  ) : (
                    pagedTxn.map((t, index) => {
                      const serialNo = (safeTxnPage - 1) * LIST_TABLE_PAGE_SIZE + index + 1;
                      return (
                        <tr key={t.id} data-recon-cascade className="list-dash-row transition-colors hover:bg-muted/35">
                          <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs tabular-nums text-muted-foreground')}>{serialNo}</td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <span className="font-mono text-xs font-medium text-foreground">{t.systemTxnId}</span>
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <span className="font-mono text-xs font-medium text-foreground">{t.bankTxnId}</span>
                          </td>
                          <td data-recon-number className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>
                            {formatINR(t.amountSystem)}
                          </td>
                          <td data-recon-number className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>
                            {t.amountBank ? formatINR(t.amountBank) : <span className="font-normal text-muted-foreground">—</span>}
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                            <TruncateTip line={t.reference} className="text-sm text-foreground" />
                          </td>
                          <td className={TASKS_TABLE_TD}>
                            <span
                              data-recon-scramble
                              data-scramble-final={t.matchStatus}
                              data-recon-number
                              className={cn(
                                'inline-flex min-w-[5.5rem] justify-center rounded-full px-2.5 py-1 text-xs font-medium',
                                matchMap[t.matchStatus],
                              )}
                            >
                              {t.matchStatus}
                            </span>
                          </td>
                          <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP, 'text-xs text-muted-foreground')}>{t.issueType ?? '—'}</td>
                          {canPaymentCorrectExceptions && (
                            <td className={cn(TASKS_TABLE_TD, 'text-center align-middle')}>
                              {t.issueType === 'Missing' || t.issueType === 'Amount Mismatch' ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                  onClick={() => setEditTxn(t)}
                                >
                                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                                  Edit
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-b border-border/60 bg-card px-4 py-5 md:px-6 md:py-6">
              <TxnCardsView
                pagedTxn={pagedTxn}
                safeTxnPage={safeTxnPage}
                matchMap={matchMap}
                canPaymentCorrectExceptions={canPaymentCorrectExceptions}
                onEditException={(t) => setEditTxn(t)}
              />
            </div>
          )}

          {txnList.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{txnPageStart}</span>–
                <span className="font-medium text-foreground">{txnPageEnd}</span> of{' '}
                <span className="font-medium text-foreground">{txnList.length}</span> lines
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={safeTxnPage <= 1}
                  onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  Previous
                </Button>
                <span className="px-2 text-sm tabular-nums text-muted-foreground">
                  Page {safeTxnPage} of {txnPageCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={safeTxnPage >= txnPageCount}
                  onClick={() => setTxnPage((p) => Math.min(txnPageCount, p + 1))}
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

function TxnCardsView({
  pagedTxn,
  safeTxnPage,
  matchMap,
  canPaymentCorrectExceptions,
  onEditException,
}: {
  pagedTxn: ReconTxn[];
  safeTxnPage: number;
  matchMap: Record<ReconTxn['matchStatus'], string>;
  canPaymentCorrectExceptions?: boolean;
  onEditException?: (t: ReconTxn) => void;
}) {
  if (pagedTxn.length === 0) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No line items in this batch (finalized summary only).</div>;
  }

  const shell =
    'flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.5rem] bg-card p-6 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.1)] ring-1 ring-black/[0.06] md:p-8 dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)] dark:ring-white/[0.08]';

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* System — all lines, table-in-card */}
      <div className={shell}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-semibold tracking-tight text-foreground md:text-lg">System</h4>
          <span className="text-[11px] font-medium text-muted-foreground">Ledger / voucher side</span>
        </div>
        <div className={TASKS_TABLE_SCROLL_WRAP}>
          <table className={cn(TASKS_TABLE_ROOT, 'min-w-[480px] table-fixed')}>
            <thead>
              <tr>
                <th className={TASKS_TABLE_TH}>Sl.</th>
                <th className={TASKS_TABLE_TH}>System txn</th>
                <th className={cn(TASKS_TABLE_TH, 'text-right')}>System amt</th>
                <th className={TASKS_TABLE_TH}>Reference</th>
                <th className={TASKS_TABLE_TH}>Issue</th>
                {canPaymentCorrectExceptions && <th className={cn(TASKS_TABLE_TH, 'text-center')}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pagedTxn.map((t, index) => {
                const serialNo = (safeTxnPage - 1) * LIST_TABLE_PAGE_SIZE + index + 1;
                const editable = (t.issueType === 'Missing' || t.issueType === 'Amount Mismatch') && onEditException;
                return (
                  <tr key={`sys-${t.id}`} data-recon-cascade className="list-dash-row transition-colors hover:bg-muted/35">
                    <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs tabular-nums text-muted-foreground')}>{serialNo}</td>
                    <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                      <span className="font-mono text-xs font-medium text-foreground">{t.systemTxnId}</span>
                    </td>
                    <td data-recon-number className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>
                      {formatINR(t.amountSystem)}
                    </td>
                    <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                      <TruncateTip line={t.reference} className="text-sm text-foreground" />
                    </td>
                    <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP, 'text-xs text-muted-foreground')}>{t.issueType ?? '—'}</td>
                    {canPaymentCorrectExceptions && (
                      <td className={cn(TASKS_TABLE_TD, 'text-center align-middle')}>
                        {editable ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => onEditException!(t)}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Edit
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank — same row count, aligned */}
      <div className={shell}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-semibold tracking-tight text-foreground md:text-lg">Bank</h4>
          <span className="text-[11px] font-medium text-muted-foreground">Statement side</span>
        </div>
        <div className={TASKS_TABLE_SCROLL_WRAP}>
          <table className={cn(TASKS_TABLE_ROOT, 'min-w-[360px] table-fixed')}>
            <thead>
              <tr>
                <th className={TASKS_TABLE_TH}>Sl.</th>
                <th className={TASKS_TABLE_TH}>Bank txn</th>
                <th className={cn(TASKS_TABLE_TH, 'text-right')}>Bank amt</th>
                <th className={cn(TASKS_TABLE_TH, 'text-center')}>Match status</th>
              </tr>
            </thead>
            <tbody>
              {pagedTxn.map((t, index) => {
                const serialNo = (safeTxnPage - 1) * LIST_TABLE_PAGE_SIZE + index + 1;
                return (
                  <tr key={`bnk-${t.id}`} data-recon-cascade className="list-dash-row transition-colors hover:bg-muted/35">
                    <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs tabular-nums text-muted-foreground')}>{serialNo}</td>
                    <td className={cn(TASKS_TABLE_TD, TASKS_TD_CLAMP)}>
                      <span className="font-mono text-xs font-medium text-foreground">{t.bankTxnId}</span>
                    </td>
                    <td data-recon-number className={cn(TASKS_TABLE_TD, 'text-right font-semibold tabular-nums')}>
                      {t.amountBank ? formatINR(t.amountBank) : <span className="font-normal text-muted-foreground">—</span>}
                    </td>
                    <td className={cn(TASKS_TABLE_TD, 'text-center align-middle')}>
                      <span
                        data-recon-scramble
                        data-scramble-final={t.matchStatus}
                        data-recon-number
                        className={cn(
                          'inline-flex min-w-[5.25rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold',
                          matchMap[t.matchStatus],
                        )}
                      >
                        {t.matchStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReconCorrectMappingDialog({
  open,
  onOpenChange,
  txn,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txn: ReconTxn | null;
  onSave: (patch: { bankTxnId: string; amountBank: number }) => void;
}) {
  const [bankTxnId, setBankTxnId] = useState('');
  const [bankAmt, setBankAmt] = useState('');

  useEffect(() => {
    if (!txn) return;
    setBankTxnId(txn.bankTxnId === '—' ? '' : txn.bankTxnId);
    setBankAmt(String(txn.amountBank > 0 ? txn.amountBank : txn.amountSystem));
  }, [txn, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!txn) return;
    const id = bankTxnId.trim();
    if (!id) {
      toast.error('Enter the bank transaction ID from the statement.');
      return;
    }
    const n = Number(String(bankAmt).replace(/,/g, ''));
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Enter a valid bank amount greater than zero.');
      return;
    }
    onSave({ bankTxnId: id, amountBank: Math.round(n) });
  };

  const issue = txn?.issueType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Correct bank mapping</DialogTitle>
          <DialogDescription>
            {issue === 'Missing' && 'Link the missing bank line to the system transaction.'}
            {issue === 'Amount Mismatch' && 'Adjust the bank amount to match the ledger after verification.'}
          </DialogDescription>
        </DialogHeader>
        {txn && (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{txn.systemTxnId}</span>
              {' · '}
              System amount <span className="tabular-nums text-foreground">{formatINR(txn.amountSystem)}</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recon-bank-txn-id">Bank transaction ID</Label>
              <Input
                id="recon-bank-txn-id"
                className="font-mono text-sm"
                value={bankTxnId}
                onChange={(e) => setBankTxnId(e.target.value)}
                placeholder="e.g. BNK-9004"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recon-bank-amt">Bank amount (₹)</Label>
              <Input
                id="recon-bank-amt"
                type="text"
                inputMode="decimal"
                className="tabular-nums"
                value={bankAmt}
                onChange={(e) => setBankAmt(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save mapping</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
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
