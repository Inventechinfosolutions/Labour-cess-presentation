import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowDownToLine,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Pause,
  Send,
  Lock,
  ArrowRight,
  AlertTriangle,
  Building2,
  Table2,
  FileText,
  Landmark,
  GitCompare,
  ScrollText,
  Ban,
  ShieldCheck,
  Sparkles,
  FileStack,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { ReceiptStatusBadge } from '@/components/shared/ReceiptStatusBadge';
import { ReceiptPaymentInstrumentCard, ReceiptSummaryCard } from '@/components/receipt/ReceiptSummaryCard';
import { ReceiptDuplicatesMatchesTable } from '@/components/receipt/ReceiptDuplicatesMatchesTable';
import { MatchScoreBadge } from '@/components/shared/ReceiptComparison';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';
import type { Receipt, ReceiptDuplicateMatch, Role } from '@/store/types';
import {
  RecordWorkflowConfirmDialog,
  type WorkflowConfirmIntent,
} from '@/components/shared/RecordWorkflowConfirmDialog';

type Tab = 'overview' | 'lines' | 'payment' | 'duplicates' | 'audit';

type Dialog =
  | { kind: 'forward' }
  | { kind: 'sendBack' }
  | { kind: 'approve' }
  | { kind: 'reject' }
  | { kind: 'hold' }
  | { kind: 'sendBackVerifier' }
  | { kind: 'financeConfirm' }
  | { kind: 'financeReject' }
  | { kind: 'cancel' }
  | { kind: 'markDuplicate'; againstId: string }
  | null;

const HIGH_VALUE_THRESHOLD = 500_000;

export function ReceiptDetailPage({ receiptId }: { receiptId: string }) {
  const {
    receipts,
    currentRole,
    receiptVerifierForward,
    receiptVerifierSendBack,
    receiptApproverApprove,
    receiptApproverReject,
    receiptApproverHold,
    receiptApproverSendBack,
    receiptFinanceConfirm,
    receiptFinanceReject,
    submitReceipt,
    withdrawReceipt,
    requestReceiptCancellation,
    receiptCancellations,
    approveReceiptCancellation,
    rejectReceiptCancellation,
    detectReceiptDuplicates,
    markReceiptAsDuplicate,
  } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const receipt = useMemo(() => receipts.find((r) => r.id === receiptId), [receipts, receiptId]);
  const cancellation = useMemo(() => receiptCancellations.find((c) => c.receiptId === receiptId && c.status === 'PENDING'), [receiptCancellations, receiptId]);

  const [tab, setTab] = useState<Tab>('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [workflowConfirm, setWorkflowConfirm] = useState<WorkflowConfirmIntent | null>(null);
  const [reason, setReason] = useState('');
  const [comparedId, setComparedId] = useState<string | null>(null);

  // Validation checklist (Verifier)
  const [checkRef, setCheckRef] = useState(false);
  const [checkAmt, setCheckAmt] = useState(false);
  const [checkDup, setCheckDup] = useState(false);
  const [checkHeads, setCheckHeads] = useState(false);

  // Decision checklist (Approver)
  const [chkPayment, setChkPayment] = useState(false);
  const [chkDupOk, setChkDupOk] = useState(false);
  const [chkAmtOk, setChkAmtOk] = useState(false);

  const duplicates: ReceiptDuplicateMatch[] = useMemo(() => (receipt ? detectReceiptDuplicates(receipt) : []), [receipt, detectReceiptDuplicates]);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tdetail-block',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' },
      );
    }, ref);
    return () => ctx.revert();
  }, [receiptId, tab]);

  if (!receipt) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">Receipt not found</h2>
        <Button onClick={() => navigate('/receipts')} className="mt-4">Back to receipts</Button>
      </div>
    );
  }

  const isLocked = receipt.status === 'Confirmed';
  const isCancelled = receipt.status === 'Cancelled';
  const isHighValue = receipt.amount > HIGH_VALUE_THRESHOLD;
  const hasMissingRef = !receipt.transactionReference;
  const hasDuplicate = duplicates.length > 0;
  const topMatch = duplicates[0];
  const compared = comparedId ? duplicates.find((d) => d.receipt.id === comparedId)?.receipt ?? null : duplicates[0]?.receipt ?? null;

  // Role gating per the corrected workflow
  const canEdit = role === 'Creator' && (receipt.status === 'Draft' || receipt.status === 'Sent Back');
  const canSubmit = role === 'Creator' && (receipt.status === 'Draft' || receipt.status === 'Sent Back');
  const canWithdraw = role === 'Creator' && receipt.status === 'Submitted';
  const canVerify = role === 'Verifier' && receipt.status === 'Submitted';
  const canApprove = role === 'Approver' && receipt.status === 'Verified';
  const canReviewAsFinance = role === 'Finance' && receipt.status === 'Approved';
  const canRequestCancel = (role === 'Creator' || role === 'Finance') && receipt.status === 'Confirmed' && !cancellation;
  const canDecideCancel = role === 'Finance' && !!cancellation;
  const canMarkDuplicate = role === 'Finance' && (receipt.status === 'Confirmed' || receipt.status === 'Approved') && hasDuplicate && !cancellation;

  // Verifier checklist gating: forward only when at least the basic checks are ticked
  const verifierReady = checkRef && checkAmt && checkDup && checkHeads;
  const approverReady = chkPayment && chkDupOk && chkAmtOk;

  const closeDialog = () => { setDialog(null); setReason(''); };

  const onConfirmDialog = () => {
    if (!dialog) return;
    if (dialog.kind === 'forward') {
      receiptVerifierForward(receipt.id, reason);
      toast.success('Verified — forwarded to Approver');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'sendBack') {
      if (!reason.trim()) return toast.error('Reason is mandatory');
      receiptVerifierSendBack(receipt.id, reason);
      toast.success('Sent back to Creator');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'approve') {
      receiptApproverApprove(receipt.id, reason);
      toast.success('Approved — forwarded to Finance Officer');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'reject') {
      if (!reason.trim()) return toast.error('Rejection reason is mandatory');
      receiptApproverReject(receipt.id, reason);
      toast.success('Receipt rejected');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'hold') {
      if (!reason.trim()) return toast.error('Hold reason is mandatory');
      receiptApproverHold(receipt.id, reason);
      toast.success('Receipt put on hold');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'sendBackVerifier') {
      if (!reason.trim()) return toast.error('Reason is mandatory');
      receiptApproverSendBack(receipt.id, reason);
      toast.success('Sent back to Verifier');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'financeConfirm') {
      receiptFinanceConfirm(receipt.id, reason);
      toast.success('Receipt confirmed & locked');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'financeReject') {
      if (!reason.trim()) return toast.error('Rejection reason is mandatory');
      receiptFinanceReject(receipt.id, reason);
      toast.success('Receipt rejected by Finance Officer');
      closeDialog(); navigate('/receipts'); return;
    }
    if (dialog.kind === 'cancel') {
      if (!reason.trim()) return toast.error('Cancellation reason is mandatory');
      requestReceiptCancellation(receipt.id, reason);
      toast.success('Cancellation requested — pending Finance approval');
      closeDialog(); return;
    }
    if (dialog.kind === 'markDuplicate') {
      if (!reason.trim()) return toast.error('Reason is mandatory');
      markReceiptAsDuplicate(receipt.id, dialog.againstId, reason);
      toast.success('Marked as duplicate — cancellation request created');
      closeDialog(); return;
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof FileText; count?: number; show?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: FileText, show: true },
    { id: 'lines', label: 'Line Items', icon: Table2, count: receipt.lines.length, show: true },
    { id: 'payment', label: 'Payment', icon: Landmark, show: true },
    { id: 'duplicates', label: 'Duplicates', icon: GitCompare, count: duplicates.length, show: hasDuplicate },
    { id: 'audit', label: 'Audit', icon: ScrollText, count: receipt.history.length, show: true },
  ];
  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-14 pt-2 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/receipts')}
        className="-ml-1 gap-1.5 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to receipts
      </Button>

      {/* Header — aligned with Create TA/DA Reimbursement (BillCreate) hero + amount card */}
      <div className="tdetail-block flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] text-primary shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))]"
            aria-hidden
          >
            <ArrowDownToLine className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="fms-dashboard-title text-[1.65rem] leading-[1.12] text-foreground md:text-[2rem]">{receipt.receiptNumber}</h1>
              <ReceiptStatusBadge status={receipt.status} />
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-xs status-success-text">
                  <Lock className="h-3 w-3" /> Confirmed
                </span>
              )}
              {hasDuplicate && (
                <span className="inline-flex items-center gap-1.5 text-xs status-danger-text">
                  <AlertTriangle className="h-3 w-3" /> Duplicate risk
                  {receipt.duplicateMatchScore && <MatchScoreBadge score={receipt.duplicateMatchScore} />}
                </span>
              )}
            </div>
            <p className="font-mono text-[13px] text-muted-foreground md:text-sm">
              {receipt.status.toUpperCase()} · {receipt.sourceType} · {receipt.entityName}
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 opacity-80" />
                {receipt.entityType} · {receipt.entityName}
              </span>
              <span className="mx-2 text-border">·</span>
              Receipt date {formatDate(receipt.receiptDate)}
            </p>
          </div>
        </div>
        <div className="shrink-0 md:text-right">
          <div className="inline-block rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] px-5 py-4 text-left shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))] md:min-w-[12rem]">
            <div className="fms-dashboard-section-label mb-1 opacity-90">Receipt amount</div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-primary shadow-inner">
                <FileStack className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="kpi-stat-value text-2xl leading-none text-foreground md:text-[1.75rem]">{formatINR(receipt.amount)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Status banner — visible to Creator and others */}
      {hasDuplicate ? (
        <div
          className={cn(
            'tdetail-block flex flex-col gap-3 rounded-2xl border p-4 shadow-sm ring-1 ring-destructive/20 sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:p-5',
            'status-danger-border status-danger-bg',
            'dark:bg-[color:color-mix(in_oklch,var(--destructive)_16%,transparent)] dark:ring-destructive/25',
          )}
        >
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/20 dark:bg-destructive/25">
              <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold status-danger-text">Possible duplicate detected</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {duplicates.length} matching receipt(s) found.
                {topMatch && (
                  <>
                    {' '}
                    Top match:{' '}
                    <span className="font-mono font-medium status-danger-text">{topMatch.receipt.receiptNumber}</span>
                    {' — '}
                    {topMatch.matchReason}.
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => navigate(`/receipts/${receipt.id}/duplicates`)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold status-danger-text underline-offset-4 transition hover:bg-destructive/10 hover:underline"
              >
                Open duplicate panel
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {topMatch && (
            <div className="flex shrink-0 items-center justify-end">
              <MatchScoreBadge score={topMatch.matchScore} />
            </div>
          )}
        </div>
      ) : (
        <div className="tdetail-block rounded-2xl status-success-bg status-success-border border p-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4" /> No duplicate found — validation clean.
        </div>
      )}

      {/* Cancellation banner */}
      {cancellation && (
        <div className="tdetail-block rounded-2xl status-warn-bg status-warn-border border p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-medium">Cancellation request pending</div>
            <div className="text-xs mt-1">Requested by <span className="font-medium">{cancellation.requestedBy}</span> — "{cancellation.reason}". Finance Controller will decide.</div>
          </div>
          {canDecideCancel && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="status-danger-text status-danger-border" onClick={() => { rejectReceiptCancellation(cancellation.id, 'Rejected by finance'); toast.success('Cancellation request rejected'); }}>
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" className="bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground" onClick={() => { approveReceiptCancellation(cancellation.id); toast.success('Receipt cancelled'); navigate('/receipts'); }}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tabs — reference-style underline rail */}
      <div className="tdetail-block overflow-x-auto rounded-2xl border border-border bg-card/90 px-1 shadow-sm">
        <div className="flex min-w-max items-stretch gap-0 border-b border-border">
          {visibleTabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition',
                  active ? 'text-[color:var(--tone-blue)]' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <t.icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                      active ? 'count-chip-active' : 'count-chip-idle',
                    )}
                  >
                    {t.count}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[color:var(--tone-blue)]" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Center column */}
        <div className="lg:col-span-2 space-y-5">
          {tab === 'overview' && <OverviewTab receipt={receipt} />}
          {tab === 'lines' && <LinesTab receipt={receipt} />}
          {tab === 'payment' && <PaymentTab receipt={receipt} />}
          {tab === 'duplicates' && (
            <DuplicatesTab
              current={receipt}
              matches={duplicates}
              comparedId={comparedId ?? compared?.id ?? null}
              onSelect={(id) => setComparedId(id)}
              onOpen={(matchedReceiptId) =>
                navigate(`/receipts/${receipt.id}/duplicates?match=${encodeURIComponent(matchedReceiptId)}`)
              }
              onMarkDuplicate={role === 'Finance' ? (against) => { setReason(''); setDialog({ kind: 'markDuplicate', againstId: against }); } : undefined}
            />
          )}
          {tab === 'audit' && <AuditTab receipt={receipt} />}
        </div>

        {/* Right rail — actions, validation, risk */}
        <div className="space-y-5">

          {/* Verifier validation panel */}
          {canVerify && (
            <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 status-info-text" strokeWidth={1.75} /> Validation checklist</h3>
              <div className="space-y-2 text-sm">
                <Check label="Transaction reference valid" checked={checkRef} onChange={setCheckRef} />
                <Check label="Amount matches bank record" checked={checkAmt} onChange={setCheckAmt} />
                <Check label={hasDuplicate ? 'No duplicate OR justified' : 'No duplicate found'} checked={checkDup} onChange={setCheckDup} />
                <Check label="Account heads correct" checked={checkHeads} onChange={setCheckHeads} />
              </div>
              {hasDuplicate && (
                <div className="mt-3 rounded-lg status-warn-bg status-warn-border border p-2 text-xs">
                  ⚠️ Confirm duplicate is justified before forwarding.
                </div>
              )}
            </div>
          )}

          {/* Approver decision panel */}
          {canApprove && (
            <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 status-purple-text" strokeWidth={1.75} /> Risk summary</h3>
              <ul className="space-y-2 text-sm mb-4">
                {hasDuplicate && (
                  <li className="flex items-start gap-2 status-danger-text">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Potential duplicate detected ({topMatch?.matchReason}).</span>
                  </li>
                )}
                {isHighValue && (
                  <li className="flex items-start gap-2 status-warn-text">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>High-value receipt (&gt; ₹5L).</span>
                  </li>
                )}
                {hasMissingRef && (
                  <li className="flex items-start gap-2 status-warn-text">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Missing transaction reference.</span>
                  </li>
                )}
                {!hasDuplicate && !isHighValue && !hasMissingRef && (
                  <li className="flex items-start gap-2 status-success-text">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>All validations passed.</span>
                  </li>
                )}
              </ul>

              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Decision Checklist</h4>
              <div className="space-y-2 text-sm">
                <Check label="Payment verified" checked={chkPayment} onChange={setChkPayment} />
                <Check label={hasDuplicate ? 'No duplicate OR justified' : 'No duplicate'} checked={chkDupOk} onChange={setChkDupOk} />
                <Check label="Amount correct" checked={chkAmtOk} onChange={setChkAmtOk} />
              </div>
            </div>
          )}

          {/* Finance review panel */}
          {canReviewAsFinance && (
            <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 status-paid-text" strokeWidth={1.75} /> Finance officer review</h3>
              <p className="text-xs text-muted-foreground">
                This receipt has been approved by <span className="font-medium text-foreground">{receipt.approvedBy}</span>. Confirm to lock the record permanently, or reject if there are any issues.
              </p>
              {hasDuplicate && (
                <div className="mt-3 rounded-lg status-danger-bg status-danger-border border p-2 text-xs">
                  ⚠️ Duplicate risk detected. Review carefully before confirming.
                </div>
              )}
            </div>
          )}

          {/* Action panel */}
          <div className="tdetail-block fms-dashboard-panel space-y-3 p-5 md:p-6">
            <div>
              <h3 className="font-semibold">Actions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{role} • {receipt.status}</p>
            </div>

            {!canSubmit && !canVerify && !canApprove && !canReviewAsFinance && !canWithdraw && !canRequestCancel && !canEdit && !canDecideCancel && !canMarkDuplicate && (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                {isCancelled ? 'Receipt is cancelled — no further actions available.' : 'No actions available'}
              </div>
            )}

            <div className="space-y-2">
              {canEdit && (
                <Button variant="outline" className="w-full" onClick={() => navigate(`/receipts/${receipt.id}/edit`)}>
                  Open in Editor
                </Button>
              )}
              {canSubmit && (
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setWorkflowConfirm('submitVerification')}>
                  <Send className="h-4 w-4 mr-1.5" /> Submit for Verification
                </Button>
              )}
              {canWithdraw && (
                <Button variant="outline" className="w-full" onClick={() => setWorkflowConfirm('withdrawDraft')}>
                  Withdraw to Draft
                </Button>
              )}
              {canVerify && (
                <>
                  <Button
                    className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground disabled:opacity-50"
                    disabled={!verifierReady}
                    onClick={() => { setReason(''); setDialog({ kind: 'forward' }); }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Forward to Approver
                  </Button>
                  {!verifierReady && <p className="text-[11px] text-muted-foreground text-center">Tick all checklist items to enable forward.</p>}
                  <Button variant="outline" className="w-full status-warn-text status-warn-border hover:status-warn-bg" onClick={() => { setReason(''); setDialog({ kind: 'sendBack' }); }}>
                    <RotateCcw className="h-4 w-4 mr-1.5" /> Send Back to Creator
                  </Button>
                </>
              )}
              {canApprove && (
                <>
                  <Button
                    className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground disabled:opacity-50"
                    disabled={!approverReady}
                    onClick={() => { setReason(''); setDialog({ kind: 'approve' }); }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Forward to Finance
                  </Button>
                  {!approverReady && <p className="text-[11px] text-muted-foreground text-center">Tick the decision checklist to enable approve.</p>}
                  <Button variant="outline" className="w-full status-danger-text status-danger-border hover:status-danger-bg" onClick={() => { setReason(''); setDialog({ kind: 'reject' }); }}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                  <Button variant="outline" className="w-full status-warn-text status-warn-border hover:status-warn-bg" onClick={() => { setReason(''); setDialog({ kind: 'sendBackVerifier' }); }}>
                    <RotateCcw className="h-4 w-4 mr-1.5" /> Send Back to Verifier
                  </Button>
                  <Button variant="outline" className="w-full status-warn-text status-warn-border hover:status-warn-bg" onClick={() => { setReason(''); setDialog({ kind: 'hold' }); }}>
                    <Pause className="h-4 w-4 mr-1.5" /> Put On Hold
                  </Button>
                </>
              )}
              {canReviewAsFinance && (
                <>
                  <Button className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground" onClick={() => { setReason(''); setDialog({ kind: 'financeConfirm' }); }}>
                    <Lock className="h-4 w-4 mr-1.5" /> Confirm & Lock
                  </Button>
                  <Button variant="outline" className="w-full status-danger-text status-danger-border hover:status-danger-bg" onClick={() => { setReason(''); setDialog({ kind: 'financeReject' }); }}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </>
              )}
              {canMarkDuplicate && topMatch && (
                <Button variant="outline" className="w-full status-danger-text status-danger-border hover:status-danger-bg" onClick={() => { setReason(''); setDialog({ kind: 'markDuplicate', againstId: topMatch.receipt.id }); }}>
                  <Ban className="h-4 w-4 mr-1.5" /> Mark as Duplicate
                </Button>
              )}
              {canRequestCancel && (
                <Button variant="outline" className="w-full status-danger-text status-danger-border hover:status-danger-bg" onClick={() => { setReason(''); setDialog({ kind: 'cancel' }); }}>
                  <Ban className="h-4 w-4 mr-1.5" /> Request Cancellation
                </Button>
              )}
            </div>
          </div>

          {/* Status timeline — reflects new lifecycle */}
          <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
            <h3 className="font-semibold mb-3">Status timeline</h3>
            <ol className="space-y-3 text-sm">
              <TimelineNode active label="Created" by={receipt.createdBy} at={receipt.createdAt} />
              <TimelineNode active={!!receipt.submittedAt} label="Submitted" by={receipt.submittedBy} at={receipt.submittedAt} />
              <TimelineNode active={!!receipt.verifiedAt} label="Verified" by={receipt.verifiedBy} at={receipt.verifiedAt} />
              <TimelineNode active={!!receipt.approvedAt} label="Approved" by={receipt.approvedBy} at={receipt.approvedAt} />
              <TimelineNode
                active={!!receipt.confirmedAt || receipt.status === 'Rejected' || receipt.status === 'Cancelled'}
                label={receipt.status === 'Cancelled' ? 'Cancelled' : receipt.status === 'Rejected' ? 'Rejected' : 'Confirmed'}
                by={receipt.confirmedBy ?? receipt.cancelledBy}
                at={receipt.confirmedAt ?? receipt.cancelledAt}
                tone={receipt.status === 'Rejected' || receipt.status === 'Cancelled' ? 'danger' : 'success'}
              />
            </ol>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog && (
        <Modal onClose={closeDialog}>
          {dialog.kind === 'forward' && (
            <DialogBody title="Forward to Approver" description="Verifier check passes — receipt will move to the Approver queue." tone="success" confirmLabel="Forward" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional comment" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'sendBack' && (
            <DialogBody title="Send Back to Creator" description="The creator will be notified with your reason and asked to resubmit." tone="warn" confirmLabel="Send Back" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'approve' && (
            <DialogBody title="Approve & Forward to Finance" description="Receipt will move to the Finance Officer's queue for final review and lock." tone="success" confirmLabel="Approve" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional approver note" className="dialog-input" />
              {hasDuplicate && (
                <div className="mt-3 rounded-lg status-warn-bg status-warn-border border p-3 text-xs">
                  ⚠️ Duplicate risk flag is set. Approve only if you've verified it's not a true duplicate.
                </div>
              )}
            </DialogBody>
          )}
          {dialog.kind === 'reject' && (
            <DialogBody title="Reject Receipt" description="Receipt will be marked Rejected and the workflow ends." tone="danger" confirmLabel="Reject" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'hold' && (
            <DialogBody title="Put Receipt On Hold" description="Pause the workflow with a reason. You can resume later." tone="warn" confirmLabel="Hold" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'sendBackVerifier' && (
            <DialogBody title="Send Back to Verifier" description="Receipt will return to the verifier's queue with your comment." tone="warn" confirmLabel="Send Back" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'financeConfirm' && (
            <DialogBody title="Confirm & Lock Receipt" description="Final review — once confirmed, receipt is locked and only Finance can request cancellation." tone="success" confirmLabel="Confirm" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional confirmation note" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'financeReject' && (
            <DialogBody title="Reject (Finance Officer)" description="Receipt will be marked Rejected and the workflow ends." tone="danger" confirmLabel="Reject" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'cancel' && (
            <DialogBody title="Request Cancellation" description="A cancellation request will be sent to Finance Controller for approval." tone="danger" confirmLabel="Request" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
              <div className="mt-3 rounded-lg bg-muted/40 border border-border p-3 text-xs">
                Impact: this will reduce confirmed collections by <span className="font-semibold">{formatINR(receipt.amount)}</span>.
              </div>
            </DialogBody>
          )}
          {dialog.kind === 'markDuplicate' && (
            <DialogBody
              title="Mark as Duplicate"
              description={`Flag this receipt as a duplicate of ${dialog.againstId}. A cancellation request will be auto-created and sent for approval.`}
              tone="danger"
              confirmLabel="Mark Duplicate"
              onConfirm={onConfirmDialog}
              onCancel={closeDialog}
            >
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
        </Modal>
      )}

      <RecordWorkflowConfirmDialog
        open={workflowConfirm !== null}
        onOpenChange={(o) => {
          if (!o) setWorkflowConfirm(null);
        }}
        intent={workflowConfirm}
        recordLabel="receipt"
        onConfirm={() => {
          if (workflowConfirm === 'submitVerification') {
            submitReceipt(receipt.id);
            toast.success('Submitted for verification');
            navigate('/receipts');
          } else if (workflowConfirm === 'withdrawDraft') {
            withdrawReceipt(receipt.id);
            toast.success('Withdrawn to draft');
            navigate('/receipts');
          }
        }}
      />

      <style>{`
        .dialog-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--background); color: var(--foreground); font-size: 14px; resize: vertical; }
        .dialog-input:focus { outline: none; border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent); }
      `}</style>
    </div>
  );
}

/* ===== Tabs ===== */

function OverviewTab({ receipt }: { receipt: Receipt }) {
  return <ReceiptSummaryCard receipt={receipt} />;
}

function LinesTab({ receipt }: { receipt: Receipt }) {
  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board overflow-hidden">
      <div className="border-b border-border px-5 py-4 md:px-7 md:pt-7">
        <p className="fms-dashboard-section-label mb-1">Fiscal</p>
        <h3 className="fms-dashboard-title text-xl tracking-tight text-foreground md:text-[1.35rem]">Line items</h3>
        <p className="mt-1 text-xs text-muted-foreground">Account heads this receipt is split across.</p>
      </div>
      <div className={TASKS_TABLE_SCROLL_WRAP}>
        <table className={cn(TASKS_TABLE_ROOT, 'min-w-[720px]')}>
          <thead>
            <tr>
              <th className={TASKS_TABLE_TH}>Sl. No</th>
              <th className={TASKS_TABLE_TH}>Account Head</th>
              <th className={TASKS_TABLE_TH}>Remarks</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((l, index) => (
              <tr key={l.id} className="transition hover:bg-muted/35">
                <td className={cn(TASKS_TABLE_TD, 'whitespace-nowrap text-xs text-muted-foreground')}>{index + 1}</td>
                <td className={cn(TASKS_TABLE_TD, 'font-medium text-foreground')}>{l.accountHead}</td>
                <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{l.remarks ?? '—'}</td>
                <td className={cn(TASKS_TABLE_TD, 'text-right font-mono font-semibold')}>{formatINR(l.amount)}</td>
              </tr>
            ))}
            <tr className="bg-muted/25">
              <td className={cn(TASKS_TABLE_TD, 'font-semibold text-foreground')}>Total</td>
              <td className={TASKS_TABLE_TD} />
              <td className={TASKS_TABLE_TD} />
              <td className={cn(TASKS_TABLE_TD, 'text-right font-mono text-base font-bold')}>{formatINR(receipt.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentTab({ receipt }: { receipt: Receipt }) {
  return <ReceiptPaymentInstrumentCard receipt={receipt} />;
}

function DuplicatesTab({
  current, matches, comparedId, onSelect, onOpen, onMarkDuplicate,
}: {
  current: Receipt;
  matches: ReceiptDuplicateMatch[];
  comparedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onMarkDuplicate?: (againstId: string) => void;
}) {
  if (matches.length === 0) {
    return (
      <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-12 text-center md:p-14">
        <CheckCircle2 className="mx-auto mb-3 h-7 w-7 status-success-text" />
        <div className="font-medium">No duplicate candidates found</div>
        <p className="text-sm text-muted-foreground mt-1">This receipt looks unique within the last 30 days.</p>
      </div>
    );
  }
  void current;
  return (
    <ReceiptDuplicatesMatchesTable
      matches={matches}
      comparedId={comparedId}
      onSelect={onSelect}
      onOpen={onOpen}
      onMarkDuplicate={onMarkDuplicate}
      hint="Click a row to highlight the candidate. Use Open duplicate panel on Overview for the full workspace."
    />
  );
}

function AuditTab({ receipt }: { receipt: Receipt }) {
  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
      <p className="fms-dashboard-section-label mb-1">Trail</p>
      <h3 className="fms-dashboard-title mb-6 text-xl tracking-tight text-foreground md:text-[1.35rem]">Activity</h3>
      <ol className="space-y-4">
        {receipt.history.map((h, i) => (
          <li key={h.id} className="relative pl-7">
            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full status-info-dot ring-4 ring-ring/15" />
            {i < receipt.history.length - 1 && <div className="absolute left-[5px] top-5 bottom-[-12px] w-px bg-border" />}
            <div className="text-sm font-medium">{h.action}</div>
            <div className="text-xs text-muted-foreground">{h.user} · {h.role} · {formatDate(h.at)}</div>
            {h.detail && <div className="text-xs italic text-muted-foreground mt-0.5">"{h.detail}"</div>}
          </li>
        ))}
      </ol>

      {receipt.comments.length > 0 && (
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Comments</div>
          <div className="space-y-3">
            {receipt.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full status-info-bg flex items-center justify-center text-xs font-semibold">{c.user[0]?.toUpperCase()}</div>
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{c.user}</span>{' '}
                    <span className="text-xs text-muted-foreground ml-1">· {c.role} · {relativeTime(c.at)}</span>
                  </div>
                  <div className="mt-1 rounded-xl bg-muted/40 border border-border px-3 py-2 text-sm">{c.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Helpers ===== */

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" />
      <span>{label}</span>
    </label>
  );
}

function TimelineNode({ active, label, by, at, tone = 'info' }: { active: boolean; label: string; by?: string; at?: string; tone?: 'info' | 'success' | 'danger' }) {
  const dot = !active ? 'bg-muted' : tone === 'danger' ? 'status-danger-dot' : tone === 'success' ? 'status-success-dot' : 'status-info-dot';
  return (
    <li className="flex items-start gap-3">
      <div className={`h-3 w-3 rounded-full mt-1.5 ${dot}`} />
      <div className="flex-1">
        <div className={cn('text-sm', active ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</div>
        {active && at && <div className="text-[11px] text-muted-foreground">{by ?? '—'} · {formatDate(at)}</div>}
      </div>
    </li>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!overlay.current || !panel.current) return;
    gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(panel.current, { y: 20, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' });
  }, []);
  return (
    <div ref={overlay} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div ref={panel} className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DialogBody({ title, description, tone, children, onConfirm, onCancel, confirmLabel = 'Confirm' }: {
  title: string; description: string; tone: 'success' | 'danger' | 'warn' | 'info';
  children: React.ReactNode; onConfirm: () => void; onCancel: () => void; confirmLabel?: string;
}) {
  const btnTone: Record<typeof tone, string> = {
    success: 'bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground',
    danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    warn: 'bg-[color:var(--chart-3)] hover:opacity-90 text-primary-foreground',
    info: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  };
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <div className="mt-4">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} className={btnTone[tone]}>{confirmLabel} <ArrowRight className="h-4 w-4 ml-1.5" /></Button>
      </div>
    </div>
  );
}
