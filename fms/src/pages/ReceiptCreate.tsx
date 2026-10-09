import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import {
  ArrowDownToLine,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Hash,
  Layers,
  ListChecks,
  Plus,
  Save,
  Send,
  Sparkles,
  AlertTriangle,
  Trash2,
  FileText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/format';
import { entityList, receiptAccountHeads } from '@/store/mockData';
import { toast } from 'sonner';
import type { EntityType, ReceiptPaymentMode, ReceiptSourceType } from '@/store/types';
import { MatchScoreBadge } from '@/components/shared/ReceiptComparison';
import { formatDate } from '@/lib/format';
import type { BillSummaryTone } from '@/components/bill/billSummaryTokens';
import { SectionCardTitle, SidebarSectionTitle } from '@/components/shared/SectionCardTitle';
import { SummaryIconTile } from '@/components/shared/SummaryIconTile';
import {
  TASKS_TABLE_ROOT,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_TD,
  TASKS_TABLE_TH,
} from '@/components/shared/tasksTableTokens';
import { cn } from '@/lib/utils';
import {
  RecordWorkflowConfirmDialog,
  type WorkflowConfirmIntent,
} from '@/components/shared/RecordWorkflowConfirmDialog';

interface DraftLine {
  uid: string;
  accountHead: string;
  amount: number;
  remarks: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function ReceiptCreatePage({ receiptId }: { receiptId?: string }) {
  const { createReceipt, receipts, updateReceiptDraft, submitReceipt, detectReceiptDuplicates } = useApp();
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const editing = receiptId ? receipts.find((r) => r.id === receiptId) : undefined;

  const [receiptDate, setReceiptDate] = useState<string>(editing?.receiptDate.slice(0, 10) ?? todayISO());
  const [entityType, setEntityType] = useState<EntityType>((editing?.entityType ?? 'College') as EntityType);
  const [entityName, setEntityName] = useState<string>(editing?.entityName ?? entityList.find((e) => e.type === 'College')?.name ?? '');
  const [sourceType, setSourceType] = useState<ReceiptSourceType>(editing?.sourceType ?? 'Student');
  const [sourceReferenceId, setSourceReferenceId] = useState<string>(editing?.sourceReferenceId ?? '');
  const [payerName, setPayerName] = useState<string>(editing?.payerName ?? '');
  const [payerIdentifier, setPayerIdentifier] = useState<string>(editing?.payerIdentifier ?? '');
  const [paymentMode, setPaymentMode] = useState<ReceiptPaymentMode>(editing?.paymentMode ?? 'UPI');
  const [transactionReference, setTransactionReference] = useState<string>(editing?.transactionReference ?? '');
  const [bankName, setBankName] = useState<string>(editing?.bankName ?? '');
  const [paymentDate, setPaymentDate] = useState<string>(editing?.paymentDate.slice(0, 10) ?? todayISO());
  const [instrumentDetails, setInstrumentDetails] = useState<string>(editing?.instrumentDetails ?? '');

  const [lines, setLines] = useState<DraftLine[]>(
    editing
      ? editing.lines.map((l) => ({ uid: l.id, accountHead: l.accountHead, amount: l.amount, remarks: l.remarks ?? '' }))
      : [{ uid: rid(), accountHead: receiptAccountHeads[0], amount: 0, remarks: '' }],
  );
  const [confirmIntent, setConfirmIntent] = useState<WorkflowConfirmIntent | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.rcr-block', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    }, ref);
    return () => ctx.revert();
  }, []);

  const filteredEntities = useMemo(() => entityList.filter((e) => e.type === entityType), [entityType]);

  useEffect(() => {
    if (!filteredEntities.find((e) => e.name === entityName)) {
      setEntityName(filteredEntities[0]?.name ?? '');
    }
  }, [entityType, filteredEntities, entityName]);

  const totalAmount = useMemo(() => lines.reduce((s, l) => s + (Number(l.amount) || 0), 0), [lines]);

  // Live duplicate detection (only when txn ref + amount have content)
  const dupCandidates = useMemo(() => {
    if (!transactionReference || totalAmount <= 0) return [];
    return detectReceiptDuplicates({ id: editing?.id ?? '', transactionReference, payerIdentifier, amount: totalAmount, receiptDate });
  }, [transactionReference, payerIdentifier, totalAmount, receiptDate, detectReceiptDuplicates, editing?.id]);

  const topMatch = dupCandidates[0];
  const validationReady = transactionReference && totalAmount > 0;

  const validate = (): string | null => {
    if (!payerName.trim()) return 'Payer name is required';
    if (!payerIdentifier.trim()) return 'Payer identifier is required';
    if (!transactionReference.trim()) return 'Transaction reference is required';
    if (lines.length === 0) return 'Add at least one line item';
    if (lines.some((l) => l.amount < 0)) return 'Amount cannot be negative';
    if (totalAmount <= 0) return 'Total amount must be greater than zero';
    return null;
  };

  const submit = (saveAs: 'Draft' | 'Submitted') => {
    const err = validate();
    if (err) return toast.error(err);

    if (editing) {
      updateReceiptDraft(
        editing.id,
        lines.map((l) => ({ id: l.uid, accountHead: l.accountHead, amount: Number(l.amount) || 0, remarks: l.remarks })),
      );
      if (saveAs === 'Submitted') submitReceipt(editing.id);
      toast.success(saveAs === 'Submitted' ? 'Receipt submitted for verification' : 'Draft saved');
      navigate(`/receipts/${editing.id}`);
      return;
    }

    const created = createReceipt({
      receiptDate,
      entityType,
      entityName,
      sourceType,
      sourceReferenceId: sourceReferenceId || undefined,
      payerName,
      payerIdentifier,
      paymentMode,
      transactionReference,
      bankName: bankName || undefined,
      paymentDate,
      instrumentDetails: instrumentDetails || undefined,
      lines: lines.map((l) => ({ accountHead: l.accountHead, amount: Number(l.amount) || 0, remarks: l.remarks })),
      saveAs,
    });
    toast.success(saveAs === 'Submitted' ? 'Receipt submitted for verification' : 'Draft saved');
    navigate(`/receipts/${created.id}`);
  };

  const addRow = () => {
    setLines((p) => [...p, { uid: rid(), accountHead: receiptAccountHeads[0], amount: 0, remarks: '' }]);
  };
  const removeRow = (uid: string) => setLines((p) => p.filter((l) => l.uid !== uid));
  const updateLine = (uid: string, patch: Partial<DraftLine>) => setLines((p) => p.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));

  const fillSample = () => {
    setReceiptDate(todayISO());
    setEntityType('College');
    setEntityName(entityList.find((e) => e.type === 'College')?.name ?? '');
    setSourceType('Student');
    setSourceReferenceId(`STU-2026-${Math.floor(Math.random() * 999) + 100}`);
    setPayerName('Anjali Mehta');
    setPayerIdentifier(`MED-2026-${Math.floor(Math.random() * 900) + 100}`);
    setPaymentMode('UPI');
    setTransactionReference(`UPI-${Math.floor(Math.random() * 90000) + 10000}`);
    setBankName('HDFC Bank');
    setPaymentDate(todayISO());
    setLines([
      { uid: rid(), accountHead: 'Tuition Fees', amount: 75000, remarks: 'Sem 4 fees' },
      { uid: rid(), accountHead: 'Lab Fees',     amount: 10000, remarks: '' },
    ]);
    toast.success('Sample data filled');
  };

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1400px] space-y-5 p-6 pb-28">
      <Button variant="ghost" size="sm" onClick={() => navigate('/receipts')}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to receipts
      </Button>

      <div className="rcr-block flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-4">
          <SummaryIconTile icon={ArrowDownToLine} tone="emerald" size="lg" />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{editing ? 'Edit Receipt' : 'New Receipt'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture the incoming payment, line items, and payment instrument. Save as draft or submit for verification.
            </p>
          </div>
        </div>
        {!editing && (
          <Button variant="secondary" onClick={fillSample}>
            <Sparkles className="h-4 w-4 mr-1.5" /> Fill Sample Data
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
        <div className="min-w-0 space-y-5 md:col-span-2">
          <div className="rcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={FileText}
              tone="sky"
              title="Receipt Header"
              subtitle="Dates, entity, payer identity, and source reference."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Receipt Date" required>
                <input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} className="form-input" />
              </Field>
              <Field label="Source Type" required>
                <select value={sourceType} onChange={(e) => setSourceType(e.target.value as ReceiptSourceType)} className="form-input">
                  <option>Student</option>
                  <option>Vendor</option>
                  <option>External</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Entity Type" required>
                <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityType)} className="form-input">
                  <option>University</option>
                  <option>College</option>
                  <option>Department</option>
                </select>
              </Field>
              <Field label="Entity" required>
                <select value={entityName} onChange={(e) => setEntityName(e.target.value)} className="form-input">
                  {filteredEntities.map((e) => <option key={e.name}>{e.name}</option>)}
                </select>
              </Field>
              <Field label="Payer Name" required>
                <input value={payerName} onChange={(e) => setPayerName(e.target.value)} className="form-input" placeholder="e.g. Aarti Sharma" />
              </Field>
              <Field label="Payer Identifier" required hint="PAN / Reg No / GSTIN">
                <input value={payerIdentifier} onChange={(e) => setPayerIdentifier(e.target.value.toUpperCase())} className="form-input font-mono uppercase" placeholder="PHARM-2026-128" />
              </Field>
              <Field label="Source Reference (optional)">
                <input value={sourceReferenceId} onChange={(e) => setSourceReferenceId(e.target.value)} className="form-input" placeholder="Student / Vendor reference" />
              </Field>
            </div>
          </div>

          <div className="rcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={CreditCard}
              tone="amber"
              title="Payment Details"
              subtitle="Instrument, references, bank — and duplicate checks."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Payment Mode" required>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as ReceiptPaymentMode)} className="form-input">
                  {(['UPI','NEFT','RTGS','IMPS','CARD','CASH','CHEQUE'] as ReceiptPaymentMode[]).map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Payment Date" required>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="form-input" />
              </Field>
              <Field label="Transaction Reference" required hint="Bank ref / UPI ref / Cheque #">
                <input value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} className="form-input font-mono" placeholder="UPI-9923810098" />
              </Field>
              <Field label="Bank Name (optional)">
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="form-input" placeholder="HDFC Bank" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Instrument Details (optional)" hint="Cheque #, card last 4 digits etc.">
                  <input value={instrumentDetails} onChange={(e) => setInstrumentDetails(e.target.value)} className="form-input" placeholder="Cheque No 001284 dt 28-Apr-26" />
                </Field>
              </div>
            </div>

            {/* Validation Status — explicit area as per spec */}
            <div className="mt-4">
              <div className="text-xs font-medium text-foreground/80 mb-2">Validation Status</div>
              {!validationReady && (
                <div className="rounded-xl bg-muted/40 border border-border p-3 text-xs text-muted-foreground">
                  Enter transaction reference and a non-zero amount to run duplicate detection.
                </div>
              )}
              {validationReady && dupCandidates.length === 0 && (
                <div className="rounded-xl status-success-bg status-success-border border p-3 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span><span className="font-medium">No Duplicate Found</span> — clear to submit.</span>
                </div>
              )}
              {validationReady && dupCandidates.length > 0 && (
                <div className="rounded-xl status-danger-bg status-danger-border border p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">⚠️ Possible Duplicate Detected</span>
                        {topMatch && <MatchScoreBadge score={topMatch.matchScore} />}
                      </div>
                      <div className="text-xs mt-2 space-y-1">
                        {dupCandidates.slice(0, 3).map((m) => (
                          <div key={m.receipt.id} className="flex items-center gap-2">
                            <span className="font-mono">{m.receipt.receiptNumber}</span>
                            <span>—</span>
                            <span>{m.matchReason}</span>
                            <span className="text-muted-foreground">({formatDate(m.receipt.receiptDate)})</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs mt-2 opacity-80">
                        Submission is allowed — the verifier and approver will see this warning.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rcr-block overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <SummaryIconTile icon={ListChecks} tone="fuchsia" size="sm" className="mt-0.5" />
                <div>
                  <h3 className="font-semibold">Line Items</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Split the receipt across one or more account heads.</p>
                </div>
              </div>
              <Button size="sm" onClick={addRow} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-1.5" /> Add Row
              </Button>
            </div>
            <div className={TASKS_TABLE_SCROLL_WRAP}>
              <table className={cn(TASKS_TABLE_ROOT, 'min-w-[720px]')}>
                <thead>
                  <tr>
                    <th className={TASKS_TABLE_TH}>Sl.</th>
                    <th className={TASKS_TABLE_TH}>Account head</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount *</th>
                    <th className={TASKS_TABLE_TH}>Remarks</th>
                    <th className={cn(TASKS_TABLE_TH, 'w-12')} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, index) => (
                    <tr key={l.uid} className="transition odd:bg-background even:bg-muted/25 hover:bg-muted/40">
                      <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                      <td className={TASKS_TABLE_TD}>
                        <select value={l.accountHead} onChange={(e) => updateLine(l.uid, { accountHead: e.target.value })} className="form-input h-9">
                          {receiptAccountHeads.map((h) => (
                            <option key={h}>{h}</option>
                          ))}
                        </select>
                      </td>
                      <td className={TASKS_TABLE_TD}>
                        <input
                          type="number"
                          min={0}
                          value={l.amount || ''}
                          onChange={(e) => updateLine(l.uid, { amount: Number(e.target.value) })}
                          className="form-input h-9 text-right font-mono"
                          placeholder="0"
                        />
                      </td>
                      <td className={TASKS_TABLE_TD}>
                        <input
                          value={l.remarks}
                          onChange={(e) => updateLine(l.uid, { remarks: e.target.value })}
                          className="form-input h-9 text-xs"
                          placeholder="Optional"
                        />
                      </td>
                      <td className={cn(TASKS_TABLE_TD, 'text-right')}>
                        <button
                          type="button"
                          onClick={() => removeRow(l.uid)}
                          disabled={lines.length === 1}
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:opacity-30"
                          aria-label="Remove row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rcr-block flex items-center gap-3 sticky bottom-4 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-border z-10">
            <Button onClick={() => setConfirmIntent('submitVerification')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="h-4 w-4 mr-1.5" /> Submit for Verification
            </Button>
            <Button variant="outline" onClick={() => setConfirmIntent('saveDraft')}>
              <Save className="h-4 w-4 mr-1.5" /> Save Draft
            </Button>
            <Button variant="ghost" onClick={() => setConfirmIntent('discardCancel')}>
              Cancel
            </Button>
          </div>
        </div>

        <aside
          className="sticky top-4 z-10 w-full max-h-[min(calc(100dvh-6rem),560px)] space-y-5 self-start overflow-y-auto overscroll-y-contain md:top-5 md:max-h-[calc(100dvh-5rem)]"
          aria-label="Receipt summary"
        >
          <div className="rcr-block rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SidebarSectionTitle icon={ListChecks} tone="emerald" title="Live Summary" />
            <div className="mt-4 space-y-3 text-sm">
              <ReceiptSummaryRow icon={ListChecks} tone="sky" label="Lines" value={String(lines.length)} />
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="flex items-center gap-2 text-foreground">
                  <SummaryIconTile icon={Banknote} tone="fuchsia" size="sm" />
                  Total amount
                </span>
                <span className="text-lg font-semibold tabular-nums">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex gap-3 rounded-xl border status-info-border status-info-bg px-3 py-2.5">
                <SummaryIconTile icon={Hash} tone="slate" size="sm" className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Receipt Number</div>
                  <div className="mt-0.5 font-mono text-sm">Will be auto-generated on save</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rcr-block rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SidebarSectionTitle icon={Layers} tone="violet" title="Head-wise Split" />
            <ul className="mt-4 space-y-1.5 text-sm">
              {lines.length === 0 ? (
                <li className="text-xs text-muted-foreground">No line items yet.</li>
              ) : (
                lines.map((l) => (
                  <li key={l.uid} className="flex items-center justify-between">
                    <span className="text-muted-foreground truncate flex-1">{l.accountHead}</span>
                    <span className="font-mono">{formatINR(l.amount || 0)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
        .form-input { width: 100%; height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--background); color: var(--foreground); font-size: 14px; }
        .form-input:focus { outline: none; border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent); }
      `}</style>

      <RecordWorkflowConfirmDialog
        open={confirmIntent !== null}
        onOpenChange={(o) => {
          if (!o) setConfirmIntent(null);
        }}
        intent={confirmIntent}
        recordLabel="receipt"
        onConfirm={() => {
          if (confirmIntent === 'submitVerification') submit('Submitted');
          else if (confirmIntent === 'saveDraft') submit('Draft');
          else if (confirmIntent === 'discardCancel') navigate('/receipts');
        }}
      />
    </div>
  );
}

function rid() { return Math.random().toString(36).slice(2, 9); }

function ReceiptSummaryRow({ icon, tone, label, value }: { icon: LucideIcon; tone: BillSummaryTone; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <SummaryIconTile icon={icon} tone={tone} size="xs" />
        {label}
      </span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground/80 mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </div>
      {children}
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

