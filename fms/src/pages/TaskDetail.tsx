import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Send,
  ListChecks,
  Hash,
  Clock,
  ArrowRight,
  FilePenLine,
} from 'lucide-react';
import { BillAttachmentsSection, BillCommentsSection, BillSummaryCard } from '@/components/bill/BillRecordPanels';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { WorkflowStepper } from '@/components/shared/WorkflowStepper';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import type { Role } from '@/store/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TASK_ROLE_TONE, TASK_ROLE_TONE_FALLBACK } from '@/components/shared/taskRoleTone';

type DialogKind =
  | { kind: 'reject'; mode: 'verifier' | 'finance' }
  | { kind: 'sendBack' }
  | { kind: 'override' }
  | { kind: 'pay' }
  | null;

const taskStatusTone: Record<string, string> = {
  Pending: 'status-info-bg',
  Completed: 'status-success-bg',
  Rejected: 'status-danger-bg',
  Returned: 'status-warn-bg',
};

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const {
    tasks,
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
  } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const billSummaryPanelRef = useRef<HTMLDivElement>(null);

  const task = useMemo(() => tasks.find((t) => t.taskId === taskId), [tasks, taskId]);
  // Defensive: infer subjectType from which id is present if missing.
  const isBudgetTask = task?.subjectType === 'Budget' || (!task?.subjectType && !!task?.budgetId);
  const bill = useMemo(() => (task && !isBudgetTask ? bills.find((b) => b.billId === task.billId) : undefined), [bills, task, isBudgetTask]);

  // Budget tasks are handled by the dedicated Budget Detail surface — redirect.
  useEffect(() => {
    if (task && isBudgetTask && task.budgetId) {
      navigate(`/budgets/${task.budgetId}`);
    }
  }, [task, isBudgetTask, navigate]);

  // All tasks for the same bill — these form the cross-role transition history
  const billTasks = useMemo(() => {
    if (!task || task.subjectType !== 'Bill') return [];
    return tasks
      .filter((t) => t.subjectType === 'Bill' && t.billId === task.billId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [tasks, task]);

  const [dialog, setDialog] = useState<DialogKind>(null);
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
  }, [taskId]);

  useLayoutEffect(() => {
    const root = billSummaryPanelRef.current;
    if (!root || !bill?.billId) return;
    const items = root.querySelectorAll('.bill-summary-cascade');
    if (items.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.52,
          stagger: 0.072,
          ease: 'power3.out',
          delay: 0.2,
        },
      );
    }, root);
    return () => ctx.revert();
  }, [bill?.billId, taskId]);

  if (!task || !bill) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">Task not found</h2>
        <p className="text-muted-foreground text-sm mt-2">It may have been completed and reassigned to another role.</p>
        <Button onClick={() => navigate('/tasks')} className="mt-4">Back to tasks</Button>
      </div>
    );
  }

  // Role-based action gating — only the role this task is assigned to can act
  const isMine = task.assignedToRole === role && task.status === 'Pending';
  const isEditResubmit = task.actionRequired === 'Edit & Resubmit';
  const budget = budgetForHead(bill.budgetHead);
  const wouldExceed = !!budget && bill.amount > budget.remaining;
  const utilizationPct = budget ? Math.min(100, Math.round((budget.used / budget.allocated) * 100)) : 0;
  const nearLimit = budget ? budget.used / budget.allocated > 0.8 : false;

  const closeDialog = () => {
    setDialog(null);
    setReason('');
  };

  const onConfirmDialog = () => {
    if (!dialog) return;
    if (dialog.kind === 'reject') {
      if (!reason.trim()) return toast.error('Please provide a reason');
      if (dialog.mode === 'verifier') verifierReject(bill.billId, reason);
      else financeReject(bill.billId, reason);
      toast.success('Bill rejected — workflow ended');
      closeDialog();
      navigate('/tasks');
      return;
    }
    if (dialog.kind === 'sendBack') {
      if (!reason.trim()) return toast.error('Please provide a reason');
      verifierSendBack(bill.billId, reason);
      toast.success('Sent back to Creator for correction');
      closeDialog();
      navigate('/tasks');
      return;
    }
    if (dialog.kind === 'override') {
      if (!reason.trim()) return toast.error('Please provide a justification');
      financeApprove(bill.billId, { reason });
      toast.success('Approved with budget override — moved to Payment Officer');
      closeDialog();
      navigate('/tasks');
      return;
    }
    if (dialog.kind === 'pay') {
      const ref = `${paymentMode}-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
      processPayment(bill.billId, paymentMode, ref);
      toast.success(`Payment processed via ${paymentMode} — bill marked Paid`);
      closeDialog();
      navigate('/tasks');
      return;
    }
  };

  return (
    <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-14 pt-2 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/tasks')}
        className="-ml-1 gap-1.5 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tasks
      </Button>

      {/* Task header */}
      {isEditResubmit ? (
        <div className="tdetail-block flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="min-w-0 space-y-2">
            <h1 className="fms-dashboard-title text-[1.65rem] leading-[1.12] text-foreground md:text-[2rem]">
              {isMine ? 'Correct & resubmit for verification' : 'Bill returned for correction'}
            </h1>
            <p className="font-mono text-[13px] text-foreground md:text-sm">
              {task.taskId}
              <span className="mx-2 text-muted-foreground">·</span>
              <button
                type="button"
                onClick={() => navigate(`/bills/${bill.billId}`)}
                className="font-mono text-primary underline-offset-4 hover:underline"
              >
                {bill.billId}
              </button>
            </p>
          </div>
          <div className="shrink-0 md:text-right">
            <div className="inline-block rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] px-5 py-4 text-left shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))] md:min-w-[11rem]">
              <div className="fms-dashboard-section-label mb-1 opacity-90">Bill amount</div>
              <div className="kpi-stat-value text-2xl text-foreground md:text-[1.75rem]">{formatINR(bill.amount)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="tdetail-block relative overflow-hidden fms-dashboard-hero px-6 py-8 md:px-10 md:py-9">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-4">
              <p className="fms-dashboard-kicker">Task detail · bill workflow</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <ListChecks className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {task.taskId}
                </span>
                <span className="text-border">·</span>
                <button
                  type="button"
                  onClick={() => navigate(`/bills/${bill.billId}`)}
                  className="inline-flex items-center gap-1 font-mono text-primary underline-offset-4 hover:underline"
                >
                  <Hash className="h-3 w-3" />
                  {bill.billId}
                </button>
              </div>
              <h1 className="fms-dashboard-title text-[1.65rem] leading-[1.12] text-foreground md:text-[2rem]">{task.actionRequired}</h1>
              <div className="fms-dashboard-trust-row border-t-0 pt-0">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight', taskStatusTone[task.status])}>
                  {task.status}
                </span>
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', TASK_ROLE_TONE[task.assignedToRole] ?? TASK_ROLE_TONE_FALLBACK)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> {task.assignedToRole}
                </span>
                <StatusBadge status={bill.status} />
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" /> Queued {relativeTime(task.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col lg:items-end">
              <div className="rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] px-5 py-4 shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))]">
                <div className="fms-dashboard-section-label mb-1 opacity-90">Bill amount</div>
                <div className="kpi-stat-value text-2xl text-foreground md:text-[1.75rem]">{formatINR(bill.amount)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
        <p className="fms-dashboard-section-label mb-3">Workflow position</p>
        <WorkflowStepper status={bill.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: bill summary + comments */}
        <div className="space-y-6 lg:col-span-2">
          <BillSummaryCard
            bill={bill}
            panelRef={billSummaryPanelRef}
            onOpenFullBill={() => navigate(`/bills/${bill.billId}`)}
          />
          <BillAttachmentsSection attachments={bill.attachments} />
          <BillCommentsSection comments={bill.comments} />
        </div>

        {/* Right column: actions, budget panel, transitions */}
        <div className="space-y-6">
          {/* Budget panel for Finance */}
          {budget && role === 'Finance' && task.actionRequired === 'Approve Bill' && task.status === 'Pending' && (
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
          <div
            className={cn(
              'tdetail-block space-y-4 p-6 md:p-7',
              isMine && isEditResubmit
                ? 'relative overflow-hidden border-[color:color-mix(in_oklch,var(--chart-3)_38%,var(--border))] bg-[color:color-mix(in_oklch,var(--chart-3)_06%,var(--card))] shadow-[0_18px_44px_-26px_color-mix(in_oklch,var(--chart-3)_28%,transparent)] dark:bg-[color:color-mix(in_oklch,var(--chart-3)_12%,var(--card))]'
                : 'fms-dashboard-panel fms-dashboard-chart-board',
            )}
          >
            {isMine && isEditResubmit && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--chart-3)] to-transparent opacity-60"
                aria-hidden
              />
            )}
            <div>
              <p className="fms-dashboard-section-label mb-1">
                {isEditResubmit && isMine ? 'Resolution' : 'Next step'}
              </p>
              <h3 className="fms-dashboard-title text-xl text-foreground">Actions</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isMine
                  ? isEditResubmit
                    ? 'Follow the checklist, update the bill in full detail, then confirm resubmission — the verifier will receive it instantly.'
                    : `Available actions for ${role}.`
                  : task.assignedToRole === role
                    ? 'This task has already been actioned.'
                    : isEditResubmit
                      ? `Waiting on ${task.assignedToRole} to correct and resubmit.`
                      : `Assigned to ${task.assignedToRole}. You can review this record but cannot act on it.`}
              </p>
            </div>

            {!isMine && (
              <div className="rounded-xl border border-dashed border-border bg-muted/25 px-4 py-8 text-center text-sm text-muted-foreground">
                No actions available
              </div>
            )}

            {isMine && task.actionRequired === 'Edit & Resubmit' && (
              <div className="space-y-6">
                <ol className="relative space-y-0">
                  {[
                    { step: 1, title: 'Review feedback', body: 'Read verifier comments and attachment notes in this page.' },
                    { step: 2, title: 'Edit the bill', body: 'Open the bill, adjust amounts or narrative, replace PDFs if required.' },
                    { step: 3, title: 'Resubmit', body: 'Send back to verification — finance routing stays intact.' },
                  ].map((row, idx) => (
                    <li key={row.step} className="relative flex gap-4 pb-6 last:pb-0">
                      {idx < 2 && (
                        <div
                          className="absolute left-[17px] top-10 bottom-0 w-px bg-[color:color-mix(in_oklch,var(--tone-amber)_48%,var(--border))]"
                          aria-hidden
                        />
                      )}
                      <span className="relative z-[1] flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-[color:color-mix(in_oklch,var(--tone-amber)_34%,var(--card))] font-semibold tabular-nums text-[color:var(--tone-amber-ink)] shadow-sm ring-2 ring-[color:color-mix(in_oklch,var(--tone-amber)_42%,transparent)] dark:bg-[color:color-mix(in_oklch,var(--tone-amber)_26%,var(--card))] dark:text-[color:color-mix(in_oklch,var(--tone-amber)_88%,white)]">
                        {row.step}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <div className="font-semibold text-foreground">{row.title}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{row.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="flex flex-col gap-3 pt-1">
                  <Button
                    type="button"
                    onClick={() => navigate(`/bills/${bill.billId}`)}
                    variant="outline"
                    className="h-12 w-full justify-center gap-2 rounded-xl border-[color:color-mix(in_oklch,var(--primary)_35%,var(--border))] bg-background/90 font-medium shadow-sm hover:bg-muted/50"
                  >
                    <FilePenLine className="h-4 w-4" /> Open bill to edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      submitBill(bill.billId);
                      toast.success('Resubmitted to Verifier');
                      navigate('/tasks');
                    }}
                    className="h-12 w-full justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-[0_14px_36px_-12px_color-mix(in_oklch,var(--primary)_55%,transparent)] transition hover:bg-primary/92"
                  >
                    <Send className="h-4 w-4" /> Resubmit for verification
                  </Button>
                </div>
              </div>
            )}

            {isMine && task.actionRequired === 'Verify Bill' && (
              <>
                <Button
                  onClick={() => {
                    verifierApprove(bill.billId);
                    toast.success('Verified — task moved to Finance');
                    navigate('/tasks');
                  }}
                  className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Forward to Finance
                </Button>
                <Button
                  variant="outline"
                  className="w-full status-warn-text status-warn-border hover:status-warn-bg dark:border-[color:color-mix(in_oklch,var(--chart-3)_30%,transparent)] dark:text-[color:var(--chart-3)] dark:hover:bg-[color:color-mix(in_oklch,var(--chart-3)_22%,transparent)]"
                  onClick={() => setDialog({ kind: 'sendBack' })}
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Send Back to Creator
                </Button>
                <Button
                  variant="outline"
                  className="w-full status-danger-text status-danger-border hover:status-danger-bg dark:border-[color:color-mix(in_oklch,var(--destructive)_30%,transparent)] dark:text-destructive dark:hover:bg-[color:color-mix(in_oklch,var(--destructive)_18%,transparent)]"
                  onClick={() => setDialog({ kind: 'reject', mode: 'verifier' })}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </>
            )}

            {isMine && task.actionRequired === 'Approve Bill' && (
              <>
                {wouldExceed ? (
                  <>
                    <Button disabled className="w-full status-success-dot disabled:opacity-50 text-white">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve (blocked)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full status-warn-text status-warn-border hover:status-warn-bg dark:border-[color:color-mix(in_oklch,var(--chart-3)_30%,transparent)] dark:text-[color:var(--chart-3)] dark:hover:bg-[color:color-mix(in_oklch,var(--chart-3)_22%,transparent)]"
                      onClick={() => setDialog({ kind: 'override' })}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1.5" /> Override & Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      financeApprove(bill.billId);
                      toast.success('Approved — task moved to Payment Officer');
                      navigate('/tasks');
                    }}
                    className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full status-danger-text status-danger-border hover:status-danger-bg dark:border-[color:color-mix(in_oklch,var(--destructive)_30%,transparent)] dark:text-destructive dark:hover:bg-[color:color-mix(in_oklch,var(--destructive)_18%,transparent)]"
                  onClick={() => setDialog({ kind: 'reject', mode: 'finance' })}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </>
            )}

            {isMine && task.actionRequired === 'Process Payment' && (
              <Button onClick={() => setDialog({ kind: 'pay' })} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-white">
                <CreditCard className="h-4 w-4 mr-1.5" /> Process Payment
              </Button>
            )}
          </div>

          {/* Task transition history */}
          <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
            <p className="fms-dashboard-section-label mb-1">History</p>
            <h3 className="fms-dashboard-title text-xl text-foreground">Task transitions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Every task created for this bill — across roles, in order. No transition is lost.
            </p>
            <ol className="mt-4 space-y-4">
              {billTasks.map((t, i) => {
                const isLast = i === billTasks.length - 1;
                const isCurrent = t.taskId === task.taskId;
                return (
                  <li key={t.taskId} className="relative pl-7">
                    <div
                      className={cn(
                        'absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4',
                        t.status === 'Completed' && 'status-success-dot ring-[color:color-mix(in_oklch,var(--chart-2)_25%,transparent)]',
                        t.status === 'Pending' && 'bg-primary ring-ring/20',
                        t.status === 'Rejected' && 'status-danger-dot ring-[color:color-mix(in_oklch,var(--destructive)_25%,transparent)]',
                        t.status === 'Returned' && 'status-warn-dot ring-[color:color-mix(in_oklch,var(--chart-3)_25%,transparent)]',
                      )}
                    />
                    {!isLast && <div className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-border" />}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', TASK_ROLE_TONE[t.assignedToRole] ?? TASK_ROLE_TONE_FALLBACK)}>
                        {t.assignedToRole}
                      </span>
                      <span className="text-sm font-medium">{t.actionRequired}</span>
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight', taskStatusTone[t.status])}>
                        {t.status}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Current</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{t.taskId}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(t.createdAt)}{t.status !== 'Pending' && ` · Closed ${formatDate(t.updatedAt)}`}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Action history derived from bill */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Action log</div>
              <ol className="space-y-3">
                {bill.history.map((h) => (
                  <li key={h.id} className="flex gap-3 text-sm">
                    <span className={cn('inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium h-fit mt-0.5', TASK_ROLE_TONE[h.role] ?? TASK_ROLE_TONE_FALLBACK)}>
                      {h.role}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{h.action}</div>
                      <div className="text-xs text-muted-foreground">{h.user} · {formatDate(h.at)}</div>
                      {h.detail && <div className="text-xs italic text-muted-foreground mt-0.5">"{h.detail}"</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog && (
        <Modal onClose={closeDialog}>
          {dialog.kind === 'reject' && (
            <DialogBody
              title="Reject Bill"
              description="The bill will be marked Rejected and the workflow will end. Reason is logged in the audit trail."
              tone="rose"
              onConfirm={onConfirmDialog}
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
              description="A new task will be assigned to the Creator with action 'Edit & Resubmit'."
              tone="orange"
              onConfirm={onConfirmDialog}
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
              description={budget ? `This bill exceeds the remaining budget by ${formatINR(Math.max(0, bill.amount - budget.remaining))}. Override will be logged.` : ''}
              tone="amber"
              onConfirm={onConfirmDialog}
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
              description={`You're about to pay ${formatINR(bill.amount)} to ${bill.payeeName}. Bill will be marked Paid.`}
              tone="cyan"
              onConfirm={onConfirmDialog}
              onCancel={closeDialog}
              confirmLabel="Pay Now"
            >
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1.5">Payment Mode</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['NEFT', 'RTGS', 'Cheque'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPaymentMode(m)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm transition',
                          paymentMode === m
                            ? 'border-primary status-info-bg text-primary font-medium ring-2 ring-ring/20'
                            : 'border-border hover:border-muted-foreground dark:hover:border-muted-foreground',
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
          font-size: 14px;
          resize: vertical;
        }
        .dialog-input:focus {
          outline: none;
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent);
        }
      `}</style>
    </div>
  );
}

function BudgetPanel({
  head, allocated, used, remaining, billAmount, utilizationPct, wouldExceed, nearLimit,
}: {
  head: string; allocated: number; used: number; remaining: number; billAmount: number; utilizationPct: number; wouldExceed: boolean; nearLimit: boolean;
}) {
  const tone = wouldExceed ? 'rose' : nearLimit ? 'amber' : 'emerald';
  const toneClasses = {
    rose: 'status-danger-border status-danger-bg status-danger-text dark:bg-[color:color-mix(in_oklch,var(--destructive)_14%,transparent)] dark:status-danger-text dark:border-[color:color-mix(in_oklch,var(--destructive)_30%,transparent)]',
    amber: 'status-warn-border status-warn-bg status-warn-text dark:bg-[color:color-mix(in_oklch,var(--chart-3)_18%,transparent)] dark:text-[color:var(--chart-3)] dark:border-[color:color-mix(in_oklch,var(--chart-3)_30%,transparent)]',
    emerald: 'status-success-border status-success-bg status-success-text dark:bg-[color:color-mix(in_oklch,var(--chart-2)_18%,transparent)] dark:status-success-text dark:border-[color:color-mix(in_oklch,var(--chart-2)_30%,transparent)]',
  } as const;
  const dotClasses = { rose: 'status-danger-dot', amber: 'status-warn-dot', emerald: 'status-success-dot' } as const;

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
        <div className="h-2 rounded-full bg-current/10 overflow-hidden">
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
      <div ref={panel} className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DialogBody({
  title, description, tone, children, onConfirm, onCancel, confirmLabel = 'Confirm',
}: {
  title: string; description: string; tone: 'rose' | 'amber' | 'emerald' | 'cyan' | 'orange';
  children: React.ReactNode; onConfirm: () => void; onCancel: () => void; confirmLabel?: string;
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
        <Button onClick={onConfirm} className={`${btnTone[tone]} text-white`}>
          {confirmLabel} <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
