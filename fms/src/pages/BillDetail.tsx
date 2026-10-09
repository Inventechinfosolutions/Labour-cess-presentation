import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CreditCard,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { BillAttachmentsSection, BillCommentsSection, BillSummaryCard } from '@/components/bill/BillRecordPanels';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WorkflowStepper } from '@/components/shared/WorkflowStepper';
import { formatINR, formatDate } from '@/lib/format';
import type { Bill, Role } from '@/store/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCoinSfx } from '@/lib/useCoinSfx';
import {
  RecordWorkflowConfirmDialog,
  type WorkflowConfirmIntent,
} from '@/components/shared/RecordWorkflowConfirmDialog';

type DialogKind =
  | { kind: 'reject'; mode: 'verifier' | 'finance' }
  | { kind: 'sendBack' }
  | { kind: 'override'; bill: Bill }
  | { kind: 'pay'; bill: Bill }
  | null;

export function BillDetailPage({ billId }: { billId: string }) {
  const {
    bills,
    currentRole,
    submitBill,
    verifierApprove,
    verifierReject,
    verifierSendBack,
    financeApprove,
    financeReject,
    processPayment,
    budgetForHead,
    tasks,
  } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const { play: playPaymentSfx } = useCoinSfx();
  const ref = useRef<HTMLDivElement>(null);

  const bill = useMemo(() => bills.find((b) => b.billId === billId), [bills, billId]);
  const myTask = useMemo(() => tasks.find((t) => t.subjectType === 'Bill' && t.billId === billId && t.assignedToRole === role && t.status === 'Pending'), [tasks, billId, role]);

  const budget = bill ? budgetForHead(bill.budgetHead) : null;
  const utilizationPct = budget ? Math.min(100, Math.round((budget.used / budget.allocated) * 100)) : 0;
  const wouldExceed = budget && bill ? bill.amount > budget.remaining : false;
  const nearLimit = budget ? budget.used / budget.allocated > 0.8 : false;

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [workflowConfirm, setWorkflowConfirm] = useState<WorkflowConfirmIntent | null>(null);
  const [reason, setReason] = useState('');
  const [paymentMode, setPaymentMode] = useState<'RTGS' | 'NEFT' | 'Cheque'>('NEFT');

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
  }, [billId]);

  if (!bill) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">Bill not found</h2>
        <Button onClick={() => navigate('/bills')} className="mt-4">Back to bills</Button>
      </div>
    );
  }

  const canEdit = role === 'Creator' && (bill.status === 'Draft' || bill.status === 'Sent Back') && bill.createdByRole === 'Creator';
  const canSubmit = role === 'Creator' && (bill.status === 'Draft' || bill.status === 'Sent Back');
  const canVerify = role === 'Verifier' && !!myTask;
  const canFinance = role === 'Finance' && !!myTask;
  const canPay = role === 'Payment' && !!myTask;

  const onVerifierApprove = () => {
    verifierApprove(bill.billId);
    toast.success('Bill verified and forwarded to Finance');
    navigate('/bills');
  };

  const onSubmitDialog = () => {
    if (!dialog) return;
    if (dialog.kind === 'reject') {
      if (!reason.trim()) return toast.error('Please provide a reason');
      if (dialog.mode === 'verifier') verifierReject(bill.billId, reason);
      else financeReject(bill.billId, reason);
      toast.success('Bill rejected');
      setDialog(null);
      navigate('/bills');
      return;
    }
    if (dialog.kind === 'sendBack') {
      if (!reason.trim()) return toast.error('Please provide a reason');
      verifierSendBack(bill.billId, reason);
      toast.success('Bill sent back to creator for edits');
      setDialog(null);
      navigate('/bills');
      return;
    }
    if (dialog.kind === 'override') {
      if (!reason.trim()) return toast.error('Please provide a justification');
      financeApprove(bill.billId, { reason });
      toast.success('Approved with budget override');
      setDialog(null);
      navigate('/bills');
      return;
    }
    if (dialog.kind === 'pay') {
      const ref = `${paymentMode}-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
      processPayment(bill.billId, paymentMode, ref);
      playPaymentSfx();
      toast.success(`Payment processed via ${paymentMode}`);
      setDialog(null);
      navigate('/bills');
      return;
    }
  };

  const closeDialog = () => {
    setDialog(null);
    setReason('');
  };

  return (
    <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-14 pt-2 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/bills')}
        className="-ml-1 gap-1.5 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to bills
      </Button>

      <div className="tdetail-block flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="min-w-0 space-y-2">
          <h1 className="fms-dashboard-title text-[1.65rem] leading-[1.12] text-foreground md:text-[2rem]">{bill.billType}</h1>
          <p className="font-mono text-[13px] text-foreground md:text-sm">{bill.billId}</p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <StatusBadge status={bill.status} />
            <span className="text-xs text-muted-foreground">
              Created by <span className="font-medium text-foreground">{bill.createdBy}</span> · {formatDate(bill.createdAt)}
            </span>
          </div>
        </div>
        <div className="shrink-0 md:text-right">
          <div className="inline-block rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] px-5 py-4 text-left shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))] md:min-w-[11rem]">
            <div className="fms-dashboard-section-label mb-1 opacity-90">Bill amount</div>
            <div className="kpi-stat-value text-2xl text-foreground md:text-[1.75rem]">{formatINR(bill.amount)}</div>
          </div>
        </div>
      </div>

      <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
        <p className="fms-dashboard-section-label mb-3">Workflow position</p>
        <WorkflowStepper status={bill.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BillSummaryCard bill={bill} showOpenFullBill={false} />
          <BillAttachmentsSection attachments={bill.attachments} />
          <BillCommentsSection comments={bill.comments} />
        </div>

        {/* Right: actions / budget / timeline */}
        <div className="space-y-6">
          {/* Budget panel — for Finance role */}
          {budget && role === 'Finance' && bill.status === 'Verification Approved' && (
            <BudgetPanel
              head={bill.budgetHead}
              allocated={budget.allocated}
              used={budget.used}
              remaining={budget.remaining}
              billAmount={bill.amount}
              utilizationPct={utilizationPct}
              wouldExceed={wouldExceed}
              nearLimit={nearLimit}
            />
          )}

          {/* Action panel */}
          <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board space-y-4 p-6 md:p-7">
            <div>
              <p className="fms-dashboard-section-label mb-1">Next step</p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Actions</h3>
              <p className="mt-2 text-sm text-muted-foreground">Available based on your role: {role}</p>
            </div>

            {!canEdit && !canSubmit && !canVerify && !canFinance && !canPay && (
              <div className="text-sm text-muted-foreground py-2">
                No actions available — this bill is not in your queue, or you have read-only access.
              </div>
            )}

            {canSubmit && (
              <Button
                onClick={() => setWorkflowConfirm('submitVerification')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-4 w-4 mr-1.5" /> Submit for Verification
              </Button>
            )}

            {canVerify && (
              <>
                <Button onClick={onVerifierApprove} className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Forward to Finance
                </Button>
                <Button
                  variant="outline"
                  className="w-full status-warn-text status-warn-border hover:status-warn-bg"
                  onClick={() => {
                    setReason('');
                    setDialog({ kind: 'sendBack' });
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Send Back to Creator
                </Button>
                <Button
                  variant="outline"
                  className="w-full status-danger-text status-danger-border hover:status-danger-bg"
                  onClick={() => {
                    setReason('');
                    setDialog({ kind: 'reject', mode: 'verifier' });
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </>
            )}

            {canFinance && (
              <>
                {wouldExceed ? (
                  <>
                    <Button disabled className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground disabled:opacity-50">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve (blocked)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full status-warn-text status-warn-border hover:status-warn-bg"
                      onClick={() => {
                        setReason('');
                        setDialog({ kind: 'override', bill });
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1.5" /> Override & Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      financeApprove(bill.billId);
                      toast.success('Bill approved — sent to Payment Officer');
                      navigate('/bills');
                    }}
                    className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full status-danger-text status-danger-border hover:status-danger-bg"
                  onClick={() => {
                    setReason('');
                    setDialog({ kind: 'reject', mode: 'finance' });
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </>
            )}

            {canPay && (
              <Button
                onClick={() => setDialog({ kind: 'pay', bill })}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CreditCard className="h-4 w-4 mr-1.5" /> Process Payment
              </Button>
            )}

            {canEdit && (
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() =>
                  navigate(
                    bill.billType === 'Vendor Payment'
                      ? '/bills/new/vendor-payment'
                      : bill.billType === 'TA/DA Reimbursement'
                        ? '/bills/new/ta-da-reimbursement'
                        : '/bills/new',
                  )
                }
              >
                Edit bill (resubmit)
              </Button>
            )}
          </div>

          {/* Timeline */}
          <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
            <p className="fms-dashboard-section-label mb-1">History</p>
            <h3 className="fms-dashboard-title text-xl text-foreground">Activity timeline</h3>
            <ol className="mt-4 space-y-4">
              {bill.history.map((h, i) => (
                <li key={h.id} className="relative pl-6">
                  <div className={cn(
                    'absolute left-0 top-1.5 h-3 w-3 rounded-full',
                    i === bill.history.length - 1 ? 'bg-primary ring-4 ring-ring/20' : 'bg-muted'
                  )} />
                  {i < bill.history.length - 1 && <div className="absolute left-[5px] top-4 bottom-[-16px] w-px bg-muted" />}
                  <div className="text-sm font-medium">{h.action}</div>
                  <div className="text-xs text-muted-foreground">{h.user} • {h.role} • {formatDate(h.at)}</div>
                  {h.detail && <div className="text-xs text-muted-foreground mt-1 italic">"{h.detail}"</div>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog && (
        <Modal onClose={closeDialog}>
          {dialog.kind === 'reject' && (
            <DialogBody
              title="Reject Bill"
              description="Please provide a clear reason — this will be visible to the creator and audit logs."
              tone="rose"
              onConfirm={onSubmitDialog}
              onCancel={closeDialog}
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Reason for rejection (mandatory)"
                className="dialog-input"
              />
            </DialogBody>
          )}
          {dialog.kind === 'sendBack' && (
            <DialogBody
              title="Send Back to Creator"
              description="Bill will be returned for edits. The creator can re-submit after corrections."
              tone="orange"
              onConfirm={onSubmitDialog}
              onCancel={closeDialog}
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="What needs to be corrected? (mandatory)"
                className="dialog-input"
              />
            </DialogBody>
          )}
          {dialog.kind === 'override' && (
            <DialogBody
              title="Budget Override Justification"
              description={`This bill exceeds the remaining budget by ${formatINR(Math.abs((budget?.remaining ?? 0) - bill.amount))}. Override will be logged in the audit trail.`}
              tone="amber"
              onConfirm={onSubmitDialog}
              onCancel={closeDialog}
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Justification for override (mandatory)"
                className="dialog-input"
              />
            </DialogBody>
          )}
          {dialog.kind === 'pay' && (
            <DialogBody
              title="Process Payment"
              description={`You're about to pay ${formatINR(bill.amount)} to ${bill.payeeName}.`}
              tone="cyan"
              onConfirm={onSubmitDialog}
              onCancel={closeDialog}
              confirmLabel="Pay Now"
            >
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-foreground mb-1.5">Payment Mode</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['NEFT', 'RTGS', 'Cheque'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMode(m)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm transition',
                          paymentMode === m
                            ? 'border-primary status-info-bg text-primary font-medium ring-2 ring-ring/20'
                            : 'border-border hover:border-border',
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 border border-border p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-mono">{bill.bankAccount}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">IFSC</span><span className="font-mono">{bill.ifsc}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span>{bill.bankName}</span></div>
                </div>
              </div>
            </DialogBody>
          )}
        </Modal>
      )}

      <style>{`
        .dialog-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-size: 14px;
          resize: vertical;
        }
        .dialog-input:focus {
          outline: none;
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent);
          background: var(--card);
        }
      `}</style>

      <RecordWorkflowConfirmDialog
        open={workflowConfirm !== null}
        onOpenChange={(o) => {
          if (!o) setWorkflowConfirm(null);
        }}
        intent={workflowConfirm}
        recordLabel="bill"
        onConfirm={() => {
          if (workflowConfirm === 'submitVerification') {
            submitBill(bill.billId);
            toast.success('Bill submitted for verification');
            navigate('/bills');
          }
        }}
      />
    </div>
  );
}

function BudgetPanel({
  head,
  allocated,
  used,
  remaining,
  billAmount,
  utilizationPct,
  wouldExceed,
  nearLimit,
}: {
  head: string;
  allocated: number;
  used: number;
  remaining: number;
  billAmount: number;
  utilizationPct: number;
  wouldExceed: boolean;
  nearLimit: boolean;
}) {
  const tone = wouldExceed ? 'rose' : nearLimit ? 'amber' : 'emerald';
  const toneClasses = {
    rose: 'status-danger-border status-danger-bg status-danger-text',
    amber: 'status-warn-border status-warn-bg status-warn-text',
    emerald: 'status-success-border status-success-bg status-success-text',
  } as const;

  const dotClasses = {
    rose: 'status-danger-dot',
    amber: 'status-warn-dot',
    emerald: 'status-success-dot',
  } as const;

  return (
    <div className={`tdetail-block rounded-2xl p-6 border ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${dotClasses[tone]}`} />
        <h3 className="font-semibold">Budget Validation</h3>
      </div>
      <div className="text-xs mt-1 opacity-90">{head}</div>
      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between"><span>Allocated</span><span className="font-medium">{formatINR(allocated)}</span></div>
        <div className="flex justify-between"><span>Utilised</span><span className="font-medium">{formatINR(used)}</span></div>
        <div className="flex justify-between"><span>Remaining</span><span className="font-semibold">{formatINR(remaining)}</span></div>
        <div className="flex justify-between border-t border-current/10 pt-2 mt-2"><span>This Bill</span><span className="font-semibold">{formatINR(billAmount)}</span></div>
      </div>
      <div className="mt-4">
        <div className="h-2 rounded-full bg-card/60 overflow-hidden">
          <div className={`h-full ${dotClasses[tone]} transition-all duration-700`} style={{ width: `${utilizationPct}%` }} />
        </div>
        <div className="text-xs mt-1.5 opacity-90">{utilizationPct}% utilised</div>
      </div>
      <div className="mt-4 text-sm font-medium">
        {wouldExceed ? '🔴 Budget Exceeded — approval blocked, override required.' : nearLimit ? '🟠 Near budget limit.' : '🟢 Within budget.'}
      </div>
    </div>
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
      <div ref={panel} className="bg-card rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DialogBody({
  title,
  description,
  tone,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
}: {
  title: string;
  description: string;
  tone: 'rose' | 'amber' | 'emerald' | 'cyan' | 'orange';
  children: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}) {
  const btnTone: Record<typeof tone, string> = {
    rose: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    amber: 'bg-[color:var(--chart-3)] hover:opacity-90 text-primary-foreground',
    emerald: 'bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground',
    cyan: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    orange: 'bg-[color:var(--chart-3)] hover:opacity-90 text-primary-foreground',
  };
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <div className="mt-4">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} className={btnTone[tone]}>{confirmLabel}</Button>
      </div>
    </div>
  );
}
