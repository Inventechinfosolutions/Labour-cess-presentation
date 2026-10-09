import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Pause,
  Send,
  Lock,
  ArrowDownUp,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Building2,
  ListChecks,
  Receipt,
  PieChart as PieIcon,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { BudgetStatusBadge } from '@/components/shared/BudgetStatusBadge';
import { formatINR, formatDate, relativeTime } from '@/lib/format';
import { entityList } from '@/store/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';
import type { Role, EntityType } from '@/store/types';
import {
  RecordWorkflowConfirmDialog,
  type WorkflowConfirmIntent,
} from '@/components/shared/RecordWorkflowConfirmDialog';

type Tab = 'overview' | 'lines' | 'allocations' | 'adjustments' | 'reservations' | 'history';

type Dialog =
  | { kind: 'forward' }
  | { kind: 'sendBack' }
  | { kind: 'approve' }
  | { kind: 'reject' }
  | { kind: 'hold' }
  | { kind: 'allocate'; head: string }
  | { kind: 'adjust' }
  | null;

export function BudgetDetailPage({ budgetId }: { budgetId: string }) {
  const {
    budgets,
    bills,
    reservations,
    allocations,
    adjustments,
    currentRole,
    budgetVerifierForward,
    budgetVerifierSendBack,
    budgetApproverApprove,
    budgetApproverReject,
    budgetApproverHold,
    submitBudget,
    withdrawBudget,
    createAllocation,
    createAdjustment,
    approveAdjustment,
    rejectAdjustment,
  } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const budget = useMemo(() => budgets.find((b) => b.id === budgetId), [budgets, budgetId]);

  const [tab, setTab] = useState<Tab>('overview');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [workflowConfirm, setWorkflowConfirm] = useState<WorkflowConfirmIntent | null>(null);
  const [reason, setReason] = useState('');
  const [allocAmount, setAllocAmount] = useState<number>(0);
  const [allocTargetType, setAllocTargetType] = useState<EntityType>('Department');
  const [allocTargetName, setAllocTargetName] = useState<string>('');
  const [adjFrom, setAdjFrom] = useState<string>('');
  const [adjTo, setAdjTo] = useState<string>('');
  const [adjAmount, setAdjAmount] = useState<number>(0);

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
  }, [budgetId, tab]);

  if (!budget) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">Budget not found</h2>
        <Button onClick={() => navigate('/budgets')} className="mt-4">Back to budgets</Button>
      </div>
    );
  }

  const isLocked = budget.status === 'Approved' || budget.status === 'Locked';
  const totalAllocated = budget.heads.reduce((a, h) => a + h.allocated, 0);

  const linkedReservations = reservations.filter((r) => r.budgetId === budget.id);
  const linkedAllocations = allocations.filter((a) => a.budgetId === budget.id);
  const linkedAdjustments = adjustments.filter((a) => a.budgetId === budget.id);

  // Role gating
  const canSubmit = role === 'Creator' && (budget.status === 'Draft' || budget.status === 'Sent Back');
  const canEdit = role === 'Creator' && (budget.status === 'Draft' || budget.status === 'Sent Back');
  const canVerify = role === 'Verifier' && budget.status === 'Submitted';
  const canApprove = role === 'Approver' && budget.status === 'Verified';
  const canAllocate = role === 'Finance' && isLocked;
  const canAdjust = role === 'Finance' && isLocked;
  const canWithdraw = role === 'Creator' && budget.status === 'Submitted';
  const hasInlineActions =
    canEdit || canSubmit || canWithdraw || canVerify || canApprove || canAllocate || canAdjust;

  // Variance / risk metrics
  const headRisks = budget.heads.map((h) => {
    const variance = h.lastYearAmount ? Math.round(((h.allocated - h.lastYearAmount) / h.lastYearAmount) * 100) : 0;
    const usedPct = h.allocated ? Math.round(((h.utilized + h.reserved) / h.allocated) * 100) : 0;
    return { ...h, variance, usedPct };
  });
  const highVarianceCount = headRisks.filter((h) => Math.abs(h.variance) > 30).length;
  const nearBreachCount = headRisks.filter((h) => h.usedPct > 90).length;

  const closeDialog = () => { setDialog(null); setReason(''); setAllocAmount(0); setAdjAmount(0); };

  const onConfirmDialog = () => {
    if (!dialog) return;
    if (dialog.kind === 'forward') {
      budgetVerifierForward(budget.id, reason);
      toast.success('Budget verified — forwarded to Approver');
      closeDialog(); navigate('/budgets'); return;
    }
    if (dialog.kind === 'sendBack') {
      if (!reason.trim()) return toast.error('Reason is mandatory');
      budgetVerifierSendBack(budget.id, reason);
      toast.success('Sent back to Creator for correction');
      closeDialog(); navigate('/budgets'); return;
    }
    if (dialog.kind === 'approve') {
      budgetApproverApprove(budget.id, reason);
      toast.success('Budget approved & locked');
      closeDialog(); navigate('/budgets'); return;
    }
    if (dialog.kind === 'reject') {
      if (!reason.trim()) return toast.error('Rejection reason is mandatory');
      budgetApproverReject(budget.id, reason);
      toast.success('Budget rejected');
      closeDialog(); navigate('/budgets'); return;
    }
    if (dialog.kind === 'hold') {
      if (!reason.trim()) return toast.error('Hold reason is mandatory');
      budgetApproverHold(budget.id, reason);
      toast.success('Budget put on hold');
      closeDialog(); navigate('/budgets'); return;
    }
    if (dialog.kind === 'allocate') {
      if (!allocTargetName) return toast.error('Pick a target entity');
      if (allocAmount <= 0) return toast.error('Amount must be greater than 0');
      const head = budget.heads.find((h) => h.name === dialog.head);
      const available = head ? head.allocated - head.utilized - head.reserved : 0;
      const alreadyAllocated = linkedAllocations.filter((a) => a.headName === dialog.head).reduce((sum, a) => sum + a.amount, 0);
      const allocLeft = (head?.allocated ?? 0) - alreadyAllocated;
      if (allocAmount > allocLeft) return toast.error(`Cannot exceed remaining allocation for ${dialog.head} (${formatINR(allocLeft)})`);
      void available;
      createAllocation({
        budgetId: budget.id,
        headName: dialog.head,
        targetEntityType: allocTargetType,
        targetEntityName: allocTargetName,
        amount: allocAmount,
      });
      toast.success(`Allocated ${formatINR(allocAmount)} to ${allocTargetName}`);
      closeDialog(); return;
    }
    if (dialog.kind === 'adjust') {
      if (!adjFrom || !adjTo) return toast.error('From and To heads are required');
      if (adjFrom === adjTo) return toast.error('Source and destination must differ');
      if (adjAmount <= 0) return toast.error('Amount must be greater than 0');
      if (!reason.trim()) return toast.error('Reason is mandatory');
      const fromHead = budget.heads.find((h) => h.name === adjFrom);
      const fromAvailable = fromHead ? fromHead.allocated - fromHead.utilized - fromHead.reserved : 0;
      if (adjAmount > fromAvailable) return toast.error(`Cannot transfer more than available in ${adjFrom} (${formatINR(fromAvailable)})`);
      createAdjustment({ budgetId: budget.id, fromHead: adjFrom, toHead: adjTo, amount: adjAmount, type: 'TRANSFER', reason });
      toast.success('Adjustment created — pending approval');
      closeDialog(); setTab('adjustments'); return;
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof ListChecks; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: PieIcon },
    { id: 'lines', label: 'Line Items', icon: ListChecks, count: budget.heads.length },
    ...(isLocked ? [
      { id: 'allocations' as Tab, label: 'Allocations', icon: ArrowRight, count: linkedAllocations.length },
      { id: 'adjustments' as Tab, label: 'Adjustments', icon: ArrowDownUp, count: linkedAdjustments.length },
      { id: 'reservations' as Tab, label: 'Reservations', icon: Receipt, count: linkedReservations.length },
    ] : []),
    { id: 'history', label: 'Activity', icon: ClipboardCheck, count: budget.history.length },
  ];

  return (
    <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-14 pt-2 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/budgets')}
        className="-ml-1 gap-1.5 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to budgets
      </Button>

      {/* Header — same shell as ReceiptDetail / BillDetail */}
      <div className="tdetail-block flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] text-primary shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))]"
            aria-hidden
          >
            <PieIcon className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="fms-dashboard-title text-[1.65rem] leading-[1.12] text-foreground md:text-[2rem]">{budget.name}</h1>
              <BudgetStatusBadge status={budget.status} />
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-xs status-success-text">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              )}
            </div>
            <p className="font-mono text-[13px] text-muted-foreground md:text-sm">
              {budget.id} · {budget.fy} · v{budget.version}
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 opacity-80" />
                {budget.entityType} · {budget.entityName}
              </span>
            </p>
          </div>
        </div>
        <div className="shrink-0 md:text-right">
          <div className="inline-block rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--background)_52%,var(--card))] px-5 py-4 text-left shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))] md:min-w-[12rem]">
            <div className="fms-dashboard-section-label mb-1 opacity-90">Total allocated</div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-primary shadow-inner">
                <PieIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="kpi-stat-value text-2xl leading-none text-foreground md:text-[1.75rem]">{formatINR(totalAllocated)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — same underline rail as ReceiptDetail */}
      <div className="tdetail-block overflow-x-auto rounded-2xl border border-border bg-card/90 px-1 shadow-sm">
        <div className="flex min-w-max items-stretch gap-0 border-b border-border">
          {tabs.map((t) => {
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
          {tab === 'overview' && (
            <OverviewTab headRisks={headRisks} highVarianceCount={highVarianceCount} nearBreachCount={nearBreachCount} />
          )}

          {tab === 'lines' && (
            <LineItemsTable headRisks={headRisks} canAllocate={canAllocate} onAllocate={(h) => { setAllocTargetName(entityList.find((e) => e.type === 'Department')?.name ?? ''); setAllocTargetType('Department'); setAllocAmount(0); setDialog({ kind: 'allocate', head: h }); }} linkedAllocations={linkedAllocations} />
          )}

          {tab === 'allocations' && (
            <AllocationsTable allocations={linkedAllocations} canAllocate={canAllocate} onAdd={() => { const head = budget.heads[0]?.name ?? ''; setDialog({ kind: 'allocate', head }); }} />
          )}

          {tab === 'adjustments' && (
            <AdjustmentsTable
              adjustments={linkedAdjustments}
              canAdjust={canAdjust}
              onAdd={() => {
                const heads = budget.heads.filter((h) => h.allocated - h.utilized - h.reserved > 0);
                setAdjFrom(heads[0]?.name ?? budget.heads[0]?.name ?? '');
                setAdjTo(budget.heads[1]?.name ?? budget.heads[0]?.name ?? '');
                setAdjAmount(0);
                setReason('');
                setDialog({ kind: 'adjust' });
              }}
              onApprove={(id) => { approveAdjustment(id); toast.success('Adjustment approved & applied'); }}
              onReject={(id) => { rejectAdjustment(id, 'Manual rejection'); toast.success('Adjustment rejected'); }}
              role={role}
            />
          )}

          {tab === 'reservations' && (
            <ReservationsTable reservations={linkedReservations} bills={bills} onOpenBill={(billId) => navigate(`/bills/${billId}`)} />
          )}

          {tab === 'history' && (
            <ActivityTimeline budget={budget} />
          )}
        </div>

        {/* Right rail — actions (only when applicable) + insights */}
        <div className="space-y-5">
          {hasInlineActions && (
            <div className="tdetail-block fms-dashboard-panel space-y-3 p-5 md:p-6">
              <div>
                <h3 className="font-semibold">Actions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{role} • {budget.status}</p>
              </div>

              <div className="space-y-2">
                {canEdit && (
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/budgets/${budget.id}/edit`)}>
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
                    <Button className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground" onClick={() => { setReason(''); setDialog({ kind: 'forward' }); }}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Forward to Approver
                    </Button>
                    <Button variant="outline" className="w-full status-warn-text status-warn-border hover:status-warn-bg" onClick={() => { setReason(''); setDialog({ kind: 'sendBack' }); }}>
                      <RotateCcw className="h-4 w-4 mr-1.5" /> Send Back to Creator
                    </Button>
                  </>
                )}
                {canApprove && (
                  <>
                    <Button className="w-full bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground" onClick={() => { setReason(''); setDialog({ kind: 'approve' }); }}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Lock
                    </Button>
                    <Button variant="outline" className="w-full status-danger-text status-danger-border hover:status-danger-bg" onClick={() => { setReason(''); setDialog({ kind: 'reject' }); }}>
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                    <Button variant="outline" className="w-full status-warn-text status-warn-border hover:status-warn-bg" onClick={() => { setReason(''); setDialog({ kind: 'hold' }); }}>
                      <Pause className="h-4 w-4 mr-1.5" /> Put On Hold
                    </Button>
                  </>
                )}
                {canAllocate && (
                  <Button variant="outline" className="w-full" onClick={() => { const head = budget.heads[0]?.name ?? ''; setDialog({ kind: 'allocate', head }); setAllocTargetName(entityList.find((e) => e.type === 'Department')?.name ?? ''); setAllocTargetType('Department'); setAllocAmount(0); }}>
                    <ArrowRight className="h-4 w-4 mr-1.5" /> New Allocation
                  </Button>
                )}
                {canAdjust && (
                  <Button variant="outline" className="w-full" onClick={() => {
                    setAdjFrom(budget.heads[0]?.name ?? '');
                    setAdjTo(budget.heads[1]?.name ?? budget.heads[0]?.name ?? '');
                    setAdjAmount(0);
                    setReason('');
                    setDialog({ kind: 'adjust' });
                  }}>
                    <ArrowDownUp className="h-4 w-4 mr-1.5" /> New Adjustment
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Risk Insights */}
          {(highVarianceCount > 0 || nearBreachCount > 0) && (
            <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 status-purple-text" strokeWidth={1.75} /> Risk insights</h3>
              <ul className="space-y-2 text-sm">
                {highVarianceCount > 0 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 status-warn-text mt-0.5" />
                    <span><span className="font-medium">{highVarianceCount}</span> head(s) with variance &gt; 30% YoY</span>
                  </li>
                )}
                {nearBreachCount > 0 && (
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 status-danger-text mt-0.5" />
                    <span><span className="font-medium">{nearBreachCount}</span> head(s) above 90% utilisation</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Status timeline (small) */}
          <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
            <h3 className="font-semibold mb-3">Status timeline</h3>
            <ol className="space-y-3 text-sm">
              <TimelineNode active={true} label="Created" by={budget.createdBy} at={budget.createdAt} />
              <TimelineNode active={!!budget.submittedAt} label="Submitted" by={budget.submittedBy} at={budget.submittedAt} />
              <TimelineNode active={!!budget.verifiedAt} label="Verified" by={budget.verifiedBy} at={budget.verifiedAt} />
              <TimelineNode active={!!budget.approvedAt} label={budget.status === 'Rejected' ? 'Rejected' : 'Approved'} by={budget.approvedBy} at={budget.approvedAt} tone={budget.status === 'Rejected' ? 'danger' : 'success'} />
            </ol>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog && (
        <Modal onClose={closeDialog} wide={dialog.kind === 'allocate' || dialog.kind === 'adjust'}>
          {dialog.kind === 'forward' && (
            <DialogBody title="Forward to Approver" description="Verifier approval — budget will be ready for final approval." tone="success" confirmLabel="Forward" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional comment" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'sendBack' && (
            <DialogBody title="Send Back to Creator" description="Creator will be notified to revise and resubmit." tone="warn" confirmLabel="Send Back" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'approve' && (
            <DialogBody title="Approve & Lock Budget" description="Approved budgets become active and cannot be edited. Adjustments are required for any future changes." tone="success" confirmLabel="Approve & Lock" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Optional approver note" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'reject' && (
            <DialogBody title="Reject Budget" description="Budget will be marked Rejected and the workflow will end." tone="danger" confirmLabel="Reject" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'hold' && (
            <DialogBody title="Put Budget On Hold" description="Pause workflow with a reason. You can resume later." tone="warn" confirmLabel="Hold" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Reason (mandatory)" className="dialog-input" />
            </DialogBody>
          )}
          {dialog.kind === 'allocate' && (
            <DialogBody title="Allocate to Sub-Entity" description={`Distribute funds from ${dialog.head} to a college or department.`} tone="info" confirmLabel="Save Allocation" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1.5">Source Head</div>
                  <select
                    value={dialog.head}
                    onChange={(e) => setDialog({ kind: 'allocate', head: e.target.value })}
                    className="dialog-input"
                  >
                    {budget.heads.map((h) => <option key={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium mb-1.5">Target Type</div>
                    <select value={allocTargetType} onChange={(e) => setAllocTargetType(e.target.value as EntityType)} className="dialog-input">
                      <option>College</option>
                      <option>Department</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1.5">Target Entity</div>
                    <select value={allocTargetName} onChange={(e) => setAllocTargetName(e.target.value)} className="dialog-input">
                      {entityList.filter((e) => e.type === allocTargetType).map((e) => <option key={e.name}>{e.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1.5">Amount (INR)</div>
                  <input type="number" value={allocAmount || ''} onChange={(e) => setAllocAmount(Number(e.target.value))} className="dialog-input" placeholder="0" />
                </div>
                {(() => {
                  const head = budget.heads.find((h) => h.name === dialog.head);
                  const allocated = head?.allocated ?? 0;
                  const already = linkedAllocations.filter((a) => a.headName === dialog.head).reduce((s, a) => s + a.amount, 0);
                  const left = allocated - already;
                  return (
                    <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Head allocated</span><span className="font-medium">{formatINR(allocated)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Already allocated</span><span className="font-medium">{formatINR(already)}</span></div>
                      <div className="flex justify-between text-foreground"><span>Available to allocate</span><span className="font-semibold">{formatINR(left)}</span></div>
                    </div>
                  );
                })()}
              </div>
            </DialogBody>
          )}
          {dialog.kind === 'adjust' && (
            <DialogBody title="Budget Adjustment / Transfer" description="Move funds between heads. Transfer is approved by Finance Controller." tone="warn" confirmLabel="Submit Adjustment" onConfirm={onConfirmDialog} onCancel={closeDialog}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <div className="text-xs font-medium mb-1.5">From Head</div>
                    <select value={adjFrom} onChange={(e) => setAdjFrom(e.target.value)} className="dialog-input">
                      {budget.heads.map((h) => <option key={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1.5">To Head</div>
                    <select value={adjTo} onChange={(e) => setAdjTo(e.target.value)} className="dialog-input">
                      {budget.heads.map((h) => <option key={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-center text-muted-foreground -my-1">
                  <ChevronRight className="h-5 w-5 -rotate-90" />
                </div>
                <div>
                  <div className="text-xs font-medium mb-1.5">Amount</div>
                  <input type="number" value={adjAmount || ''} onChange={(e) => setAdjAmount(Number(e.target.value))} className="dialog-input" placeholder="0" />
                </div>
                <div>
                  <div className="text-xs font-medium mb-1.5">Reason</div>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="dialog-input" placeholder="Mandatory" />
                </div>
                {/* Impact preview */}
                {(adjFrom && adjTo && adjAmount > 0) && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[adjFrom, adjTo].map((name, idx) => {
                      const head = budget.heads.find((h) => h.name === name);
                      if (!head) return null;
                      const before = head.allocated;
                      const after = idx === 0 ? before - adjAmount : before + adjAmount;
                      return (
                        <div key={name} className="rounded-lg bg-muted/40 border border-border p-2">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{idx === 0 ? 'From' : 'To'}: {name}</div>
                          <div className="mt-1 flex items-center justify-between"><span>Before</span><span className="font-mono">{formatINR(before)}</span></div>
                          <div className="flex items-center justify-between"><span className="font-medium">After</span><span className="font-mono font-semibold">{formatINR(after)}</span></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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
        recordLabel="budget"
        onConfirm={() => {
          if (workflowConfirm === 'submitVerification') {
            submitBudget(budget.id);
            toast.success('Submitted for verification');
            navigate('/budgets');
          } else if (workflowConfirm === 'withdrawDraft') {
            withdrawBudget(budget.id);
            toast.success('Withdrawn to draft');
            navigate('/budgets');
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

function OverviewTab({ headRisks, highVarianceCount, nearBreachCount }: { headRisks: any[]; highVarianceCount: number; nearBreachCount: number }) {
  return (
    <div className="space-y-5">
      <div className="tdetail-block rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Year Comparison</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last year vs allocated · variance and flags per budget head.</p>
        </div>
        <div className={TASKS_TABLE_SCROLL_WRAP}>
          <table className={cn(TASKS_TABLE_ROOT, 'min-w-[920px]')}>
            <thead>
              <tr>
                <th className={TASKS_TABLE_TH}>Sl. No</th>
                <th className={TASKS_TABLE_TH}>Head</th>
                <th className={cn(TASKS_TABLE_TH, 'text-right')}>Last Year</th>
                <th className={cn(TASKS_TABLE_TH, 'text-right')}>Allocated</th>
                <th className={cn(TASKS_TABLE_TH, 'text-right')}>Variance</th>
                <th className={TASKS_TABLE_TH}>Flags</th>
              </tr>
            </thead>
            <tbody>
              {headRisks.map((h, index) => {
                const flag = Math.abs(h.variance) > 30 ? 'High variance' : h.allocated === 0 ? 'Zero alloc' : null;
                return (
                  <tr key={h.id} className="transition odd:bg-background even:bg-muted/25 hover:bg-muted/40">
                    <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                    <td className={cn(TASKS_TABLE_TD, 'font-medium')}>{h.name}</td>
                    <td className={cn(TASKS_TABLE_TD, 'text-right text-muted-foreground')}>{formatINR(h.lastYearAmount ?? 0)}</td>
                    <td className={cn(TASKS_TABLE_TD, 'text-right font-mono')}>{formatINR(h.allocated)}</td>
                    <td className={cn(TASKS_TABLE_TD, 'text-right')}>
                      {h.lastYearAmount ? (
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          Math.abs(h.variance) > 30 && h.variance > 0 ? 'status-warn-bg' :
                          Math.abs(h.variance) > 30 && h.variance < 0 ? 'status-danger-bg' :
                          'status-neutral-bg')}>
                          {h.variance > 0 ? '+' : ''}{h.variance}%
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className={TASKS_TABLE_TD}>
                      {flag && <span className="inline-flex items-center gap-1 status-warn-text text-xs"><AlertTriangle className="h-3.5 w-3.5" /> {flag}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(highVarianceCount > 0 || nearBreachCount > 0) && (
        <div className="tdetail-block rounded-2xl status-warn-bg status-warn-border border p-4 text-sm flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <div>
            <div className="font-medium">Verifier should review:</div>
            <ul className="mt-1 list-disc pl-5">
              {highVarianceCount > 0 && <li>{highVarianceCount} head(s) with variance &gt; 30% YoY</li>}
              {nearBreachCount > 0 && <li>{nearBreachCount} head(s) above 90% utilisation</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function LineItemsTable({ headRisks, canAllocate, onAllocate, linkedAllocations }: { headRisks: any[]; canAllocate: boolean; onAllocate: (head: string) => void; linkedAllocations: any[] }) {
  return (
    <div className="tdetail-block rounded-2xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold">Line Items</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Allocated · Utilised · Reserved · Available — per head.</p>
      </div>
      <div className={TASKS_TABLE_SCROLL_WRAP}>
        <table className={cn(TASKS_TABLE_ROOT, 'min-w-[920px]')}>
          <thead>
            <tr>
              <th className={TASKS_TABLE_TH}>Sl. No</th>
              <th className={TASKS_TABLE_TH}>Head</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Allocated</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Utilised</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Reserved</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Available</th>
              <th className={cn(TASKS_TABLE_TH, 'w-[18%]')}>Usage</th>
              {canAllocate && <th className={TASKS_TABLE_TH} />}
            </tr>
          </thead>
          <tbody>
            {headRisks.map((h, index) => {
              const available = h.allocated - h.utilized - h.reserved;
              const dot = h.usedPct > 90 ? 'bg-destructive' : h.usedPct > 70 ? 'bg-[color-mix(in_oklch,var(--chart-3)_75%,var(--foreground))]' : 'bg-[color-mix(in_oklch,var(--chart-2)_70%,var(--foreground))]';
              const allocLeft = h.allocated - linkedAllocations.filter((a) => a.headName === h.name).reduce((s, a) => s + a.amount, 0);
              return (
                <tr key={h.id} className="transition odd:bg-background even:bg-muted/25 hover:bg-muted/40">
                  <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                  <td className={TASKS_TABLE_TD}>
                    <div className="font-medium">{h.name}</div>
                    {h.remarks && <div className="text-xs text-muted-foreground">{h.remarks}</div>}
                  </td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right font-mono')}>{formatINR(h.allocated)}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right font-mono')}>{formatINR(h.utilized)}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right font-mono status-purple-text')}>{formatINR(h.reserved)}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right font-mono font-semibold')}>{formatINR(available)}</td>
                  <td className={TASKS_TABLE_TD}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className={cn('h-full rounded-full transition-all duration-700', dot)} style={{ width: `${Math.min(h.usedPct, 100)}%` }} />
                      </div>
                      <div className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{h.usedPct}%</div>
                    </div>
                  </td>
                  {canAllocate && (
                    <td className={cn(TASKS_TABLE_TD, 'text-right')}>
                      <Button size="sm" variant="ghost" disabled={allocLeft <= 0} onClick={() => onAllocate(h.name)}>
                        Allocate
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllocationsTable({ allocations, canAllocate, onAdd }: { allocations: any[]; canAllocate: boolean; onAdd: () => void }) {
  if (allocations.length === 0) {
    return (
      <div className="tdetail-block rounded-2xl bg-card border border-border p-12 text-center">
        <ArrowRight className="h-7 w-7 mx-auto text-muted-foreground mb-3" />
        <div className="font-medium">No allocations yet</div>
        <p className="text-sm text-muted-foreground mt-1">Distribute approved funds to colleges or departments.</p>
        {canAllocate && <Button onClick={onAdd} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">New Allocation</Button>}
      </div>
    );
  }
  return (
    <div className="tdetail-block rounded-2xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Sub-Entity Allocations</h3>
        {canAllocate && <Button size="sm" onClick={onAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><ArrowRight className="h-4 w-4 mr-1" /> New</Button>}
      </div>
      <div className={TASKS_TABLE_SCROLL_WRAP}>
        <table className={cn(TASKS_TABLE_ROOT, 'min-w-[840px]')}>
          <thead>
            <tr>
              <th className={TASKS_TABLE_TH}>Sl. No</th>
              <th className={TASKS_TABLE_TH}>Source Head</th>
              <th className={TASKS_TABLE_TH}>Target</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
              <th className={TASKS_TABLE_TH}>Allocated By</th>
              <th className={TASKS_TABLE_TH}>Allocated At</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, index) => (
              <tr key={a.id} className="transition odd:bg-background even:bg-muted/25 hover:bg-muted/40">
                <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                <td className={cn(TASKS_TABLE_TD, 'font-medium')}>{a.headName}</td>
                <td className={TASKS_TABLE_TD}>
                  <div>{a.targetEntityName}</div>
                  <div className="text-xs text-muted-foreground">{a.targetEntityType}</div>
                </td>
                <td className={cn(TASKS_TABLE_TD, 'text-right font-mono font-semibold')}>{formatINR(a.amount)}</td>
                <td className={cn(TASKS_TABLE_TD, 'text-xs')}>{a.createdBy}</td>
                <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{formatDate(a.allocatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdjustmentsTable({ adjustments, canAdjust, onAdd, onApprove, onReject, role }: { adjustments: any[]; canAdjust: boolean; onAdd: () => void; onApprove: (id: string) => void; onReject: (id: string) => void; role: Role }) {
  if (adjustments.length === 0) {
    return (
      <div className="tdetail-block rounded-2xl bg-card border border-border p-12 text-center">
        <ArrowDownUp className="h-7 w-7 mx-auto text-muted-foreground mb-3" />
        <div className="font-medium">No adjustments yet</div>
        <p className="text-sm text-muted-foreground mt-1">Move funds between heads when priorities change.</p>
        {canAdjust && <Button onClick={onAdd} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">New Adjustment</Button>}
      </div>
    );
  }
  return (
    <div className="tdetail-block rounded-2xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Budget Adjustments</h3>
        {canAdjust && <Button size="sm" onClick={onAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground"><ArrowDownUp className="h-4 w-4 mr-1" /> New</Button>}
      </div>
      <div className={TASKS_TABLE_SCROLL_WRAP}>
        <table className={cn(TASKS_TABLE_ROOT, 'min-w-[960px]')}>
          <thead>
            <tr>
              <th className={TASKS_TABLE_TH}>Sl. No</th>
              <th className={TASKS_TABLE_TH}>From → To</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
              <th className={TASKS_TABLE_TH}>Reason</th>
              <th className={TASKS_TABLE_TH}>Status</th>
              <th className={TASKS_TABLE_TH}>Created</th>
              {role === 'Finance' && <th className={TASKS_TABLE_TH} />}
            </tr>
          </thead>
          <tbody>
            {adjustments.map((a, index) => (
              <tr key={a.id} className="transition odd:bg-background even:bg-muted/25 hover:bg-muted/40">
                <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                <td className={TASKS_TABLE_TD}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.fromHead}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{a.toHead}</span>
                  </div>
                </td>
                <td className={cn(TASKS_TABLE_TD, 'text-right font-mono font-semibold')}>{formatINR(a.amount)}</td>
                <td className={cn(TASKS_TABLE_TD, 'max-w-[260px] truncate text-xs text-muted-foreground')}>{a.reason}</td>
                <td className={TASKS_TABLE_TD}>
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                    a.status === 'PENDING' ? 'status-warn-bg' :
                    a.status === 'APPROVED' ? 'status-success-bg' :
                    'status-danger-bg')}>{a.status}</span>
                </td>
                <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{formatDate(a.createdAt)}<div>{a.createdBy}</div></td>
                {role === 'Finance' && (
                  <td className={cn(TASKS_TABLE_TD, 'text-right')}>
                    {a.status === 'PENDING' && (
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onReject(a.id)} className="status-danger-text"><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
                        <Button size="sm" className="bg-[color:var(--chart-2)] hover:opacity-90 text-primary-foreground" onClick={() => onApprove(a.id)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReservationsTable({ reservations, bills, onOpenBill }: { reservations: any[]; bills: any[]; onOpenBill: (id: string) => void }) {
  if (reservations.length === 0) {
    return (
      <div className="tdetail-block rounded-2xl bg-card border border-border p-12 text-center">
        <Receipt className="h-7 w-7 mx-auto text-muted-foreground mb-3" />
        <div className="font-medium">No reservations</div>
        <p className="text-sm text-muted-foreground mt-1">When bills are submitted, reservations show up here.</p>
      </div>
    );
  }
  const billMap = new Map(bills.map((b) => [b.billId, b]));
  return (
    <div className="tdetail-block rounded-2xl bg-card border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold">Reservations / Encumbrances</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bills hold a reservation against a head until paid (consumed) or rejected (released).</p>
      </div>
      <div className={TASKS_TABLE_SCROLL_WRAP}>
        <table className={cn(TASKS_TABLE_ROOT, 'min-w-[880px]')}>
          <thead>
            <tr>
              <th className={TASKS_TABLE_TH}>Sl. No</th>
              <th className={TASKS_TABLE_TH}>Head</th>
              <th className={TASKS_TABLE_TH}>Reference</th>
              <th className={TASKS_TABLE_TH}>Payee</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
              <th className={TASKS_TABLE_TH}>Status</th>
              <th className={TASKS_TABLE_TH}>Created</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r, index) => {
              const bill = billMap.get(r.refId);
              return (
                <tr
                  key={r.id}
                  className="cursor-pointer transition odd:bg-background even:bg-muted/25 hover:bg-muted/50"
                  onClick={() => bill && onOpenBill(r.refId)}
                >
                  <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                  <td className={cn(TASKS_TABLE_TD, 'font-medium')}>{r.headName}</td>
                  <td className={cn(TASKS_TABLE_TD, 'font-mono text-xs')}>{r.refId}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-xs')}>{bill?.payeeName ?? '—'}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right font-mono font-semibold')}>{formatINR(r.amount)}</td>
                  <td className={TASKS_TABLE_TD}>
                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                      r.status === 'ACTIVE' ? 'status-warn-bg' :
                      r.status === 'CONSUMED' ? 'status-success-bg' :
                      'status-neutral-bg')}>{r.status}</span>
                  </td>
                  <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{relativeTime(r.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTimeline({ budget }: { budget: any }) {
  return (
    <div className="tdetail-block rounded-2xl bg-card border border-border p-6">
      <h3 className="font-semibold mb-4">Activity</h3>
      <ol className="space-y-4">
        {budget.history.map((h: any, i: number) => (
          <li key={h.id} className="relative pl-7">
            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full status-info-dot ring-4 ring-ring/15" />
            {i < budget.history.length - 1 && <div className="absolute left-[5px] top-5 bottom-[-12px] w-px bg-border" />}
            <div className="text-sm font-medium">{h.action}</div>
            <div className="text-xs text-muted-foreground">{h.user} · {h.role} · {formatDate(h.at)}</div>
            {h.detail && <div className="text-xs italic text-muted-foreground mt-0.5">"{h.detail}"</div>}
          </li>
        ))}
      </ol>

      {budget.comments.length > 0 && (
        <>
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Comments</div>
            <div className="space-y-3">
              {budget.comments.map((c: any) => (
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
        </>
      )}
    </div>
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

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!overlay.current || !panel.current) return;
    gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    gsap.fromTo(panel.current, { y: 20, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' });
  }, []);
  return (
    <div ref={overlay} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div ref={panel} className={cn('bg-card rounded-2xl shadow-2xl w-full border border-border', wide ? 'max-w-lg' : 'max-w-md')} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function DialogBody({ title, description, tone, children, onConfirm, onCancel, confirmLabel = 'Confirm' }: { title: string; description: string; tone: 'success' | 'danger' | 'warn' | 'info'; children: React.ReactNode; onConfirm: () => void; onCancel: () => void; confirmLabel?: string }) {
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
