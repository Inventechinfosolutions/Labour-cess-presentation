import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  Banknote,
  Building2,
  ClipboardList,
  ContactRound,
  FileText,
  Fingerprint,
  FileUp,
  Hash,
  Landmark,
  Paperclip,
  Receipt,
  Save,
  Send,
  Sparkles,
  Tags,
  User,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { billTypes, departments } from '@/store/mockData';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';
import type { BillSummaryTone } from '@/components/bill/billSummaryTokens';
import { PdfAttachmentBadge } from '@/components/bill/BillRecordPanels';
import { SectionCardTitle, SidebarSectionTitle } from '@/components/shared/SectionCardTitle';
import { SummaryIconTile } from '@/components/shared/SummaryIconTile';
import {
  RecordWorkflowConfirmDialog,
  type WorkflowConfirmIntent,
} from '@/components/shared/RecordWorkflowConfirmDialog';

/** Locked flows aligned with task-detail “Correct & resubmit” workspace */
export type BillCreatePreset = 'Vendor Payment' | 'TA/DA Reimbursement';

export function BillCreatePage({ preset }: { preset?: BillCreatePreset }) {
  const { createBill, budgets } = useApp();
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [billType, setBillType] = useState(() => preset ?? billTypes[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [pan, setPan] = useState('');
  const [payee, setPayee] = useState('');
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bank, setBank] = useState('');
  const heads = budgets[0]?.heads ?? [];
  const [head, setHead] = useState(heads[0]?.name ?? 'TA/DA');
  const [dept, setDept] = useState(departments[0]);
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const [confirmIntent, setConfirmIntent] = useState<WorkflowConfirmIntent | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.bcr-block', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    }, ref);
    return () => ctx.revert();
  }, []);

  const pageTitle = preset ? `Create ${preset}` : 'New Bill';

  const validate = () => {
    if (!billType || !description || !amount || amount <= 0 || !pan || !payee || !account || !ifsc) return 'Please fill all required fields.';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return 'Invalid PAN format (e.g. ABCDE1234F).';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return 'Invalid IFSC format.';
    return null;
  };

  const submit = (saveAs: 'Draft' | 'Submitted') => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    createBill({
      billType,
      description,
      amount,
      panNumber: pan,
      payeeName: payee,
      bankAccount: account,
      ifsc,
      bankName: bank || 'Bank Inferred from IFSC',
      budgetHead: head,
      department: dept,
      attachments,
      saveAs,
    });
    toast.success(saveAs === 'Submitted' ? 'Bill submitted for verification' : 'Draft saved');
    navigate('/bills');
  };

  const addAttachment = () => {
    const name = `document-${Math.floor(Math.random() * 999)}.pdf`;
    setAttachments([...attachments, { name, size: `${Math.floor(Math.random() * 400) + 50} KB` }]);
  };

  const fillSampleData = () => {
    const randomId = Math.floor(Math.random() * 9000) + 1000;
    const randomAccount = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const sampleBillType = preset ?? billTypes[Math.floor(Math.random() * billTypes.length)];
    const sampleDept = departments[Math.floor(Math.random() * departments.length)];
    const sampleHead = heads[Math.floor(Math.random() * heads.length)]?.name ?? 'TA/DA';

    setBillType(sampleBillType);
    setDept(sampleDept);
    setHead(sampleHead);
    setDescription(`Sample bill request #${randomId} for ${sampleBillType.toLowerCase()}.`);
    setAmount(Math.floor(Math.random() * 45000) + 5000);
    setPayee('Dr. Ravi Kumar');
    setPan('ABCDE1234F');
    setAccount(randomAccount);
    setIfsc('SBIN0001234');
    setBank('State Bank of India');
    setAttachments([{ name: `sample-document-${randomId}.pdf`, size: '180 KB' }]);
    toast.success('Sample data filled');
  };

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1400px] space-y-5 p-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/bills')}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to bills
      </Button>

      <div className="bcr-block flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-4">
          <SummaryIconTile icon={Receipt} tone="sky" size="lg" />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter bill details, payee banking information, and supporting PDFs. Save as draft or submit for verification when ready.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={fillSampleData}>
          <Sparkles className="mr-1.5 h-4 w-4" /> Fill Sample Data
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
        <div className="min-w-0 space-y-5 md:col-span-2">
          <div className="bcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={FileText}
              tone="sky"
              title="Bill Header"
              subtitle="Type, department, and what this payment is for."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Bill Type" required>
                {preset ? (
                  <div className="form-input flex h-10 items-center rounded-[10px] bg-muted/45 text-sm font-medium text-foreground">{preset}</div>
                ) : (
                  <select value={billType} onChange={(e) => setBillType(e.target.value)} className="form-input">
                    {billTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Department" required>
                <select value={dept} onChange={(e) => setDept(e.target.value)} className="form-input">
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Description" required>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Briefly describe the purpose of this bill"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="bcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={Banknote}
              tone="fuchsia"
              title="Financial Details"
              subtitle="Amount and the budget head this bill draws from."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Amount (INR)" required hint={amount ? formatINR(amount) : 'Numeric value greater than 0'}>
                <input
                  type="number"
                  min={0}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="form-input"
                  placeholder="0"
                />
              </Field>
              <Field label="Budget Head" required>
                <select value={head} onChange={(e) => setHead(e.target.value)} className="form-input">
                  {heads.map((h) => (
                    <option key={h.id}>{h.name}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="bcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={Landmark}
              tone="amber"
              title="Payee & Bank Details"
              subtitle="Beneficiary identity and settlement account."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Payee Name" required>
                <input value={payee} onChange={(e) => setPayee(e.target.value)} className="form-input" placeholder="e.g. Dr. Anil Kumar" />
              </Field>
              <Field label="PAN" required hint="Format: ABCDE1234F">
                <input
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="form-input font-mono uppercase"
                  placeholder="ABCDE1234F"
                />
              </Field>
              <Field label="Bank Account Number" required>
                <input value={account} onChange={(e) => setAccount(e.target.value)} className="form-input font-mono" placeholder="123456789012" />
              </Field>
              <Field label="IFSC" required hint="Format: ABCD0XXXXXX">
                <input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  maxLength={11}
                  className="form-input font-mono uppercase"
                  placeholder="SBIN0001234"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Bank Name (optional)">
                  <input value={bank} onChange={(e) => setBank(e.target.value)} className="form-input" placeholder="State Bank of India" />
                </Field>
              </div>
            </div>
          </div>

          <div className="bcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={Paperclip}
              tone="violet"
              title="Attachments"
              subtitle="Invoices, approvals, or other PDF evidence."
            />
            <div className="space-y-3">
              <button
                type="button"
                onClick={addAttachment}
                className="group w-full rounded-2xl border-2 border-dashed border-border bg-[color:color-mix(in_oklch,var(--background)_35%,var(--card))] px-6 py-8 text-center transition hover:border-primary/50 hover:bg-muted/40 dark:bg-[color:color-mix(in_oklch,var(--background)_22%,var(--card))]"
              >
                <div className="mx-auto transition group-hover:opacity-95">
                  <SummaryIconTile icon={FileUp} tone="violet" size="md" className="ring-4 ring-violet-500/[0.08] transition group-hover:ring-violet-500/15" />
                </div>
                <div className="mt-3 text-sm font-semibold text-foreground">Add supporting document</div>
                <div className="mt-1 text-xs text-muted-foreground">Simulated PDF upload — supporting evidence for this bill</div>
              </button>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-border/90 bg-[color:color-mix(in_oklch,var(--background)_58%,var(--card))] px-4 py-3 text-sm shadow-sm dark:bg-[color:color-mix(in_oklch,var(--background)_28%,var(--card))]"
                    >
                      <PdfAttachmentBadge />
                      <div className="min-w-0 flex-1 truncate">
                        <div className="truncate font-bold text-foreground">{a.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{a.size}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                        className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove attachment"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bcr-block sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/80 p-3 backdrop-blur-md">
            <Button onClick={() => setConfirmIntent('submitVerification')} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="mr-1.5 h-4 w-4" /> Submit for Verification
            </Button>
            <Button variant="outline" onClick={() => setConfirmIntent('saveDraft')}>
              <Save className="mr-1.5 h-4 w-4" /> Save Draft
            </Button>
            <Button variant="ghost" onClick={() => setConfirmIntent('discardCancel')}>
              Cancel
            </Button>
          </div>
        </div>

        <aside
          className="sticky top-4 z-10 w-full max-h-[min(calc(100dvh-6rem),560px)] space-y-5 self-start overflow-y-auto overscroll-y-contain md:top-5 md:max-h-[calc(100dvh-5rem)]"
          aria-label="Bill summary"
        >
          <div className="bcr-block rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SidebarSectionTitle icon={ClipboardList} tone="emerald" title="Live Summary" />
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow icon={Building2} tone="emerald" label="Department" value={dept} />
              <SummaryRow icon={Tags} tone="fuchsia" label="Budget head" value={head} />
              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="flex items-center gap-2 text-foreground">
                  <SummaryIconTile icon={Banknote} tone="fuchsia" size="sm" />
                  Total amount
                </span>
                <span className="text-lg font-semibold tabular-nums">{amount > 0 ? formatINR(amount) : '—'}</span>
              </div>
              <div className="flex gap-3 rounded-xl border status-info-border status-info-bg px-3 py-2.5">
                <SummaryIconTile icon={Hash} tone="slate" size="sm" className="shrink-0 shadow-inner" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Bill ID</div>
                  <div className="mt-0.5 font-mono text-sm">Will be auto-generated on save</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bcr-block rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SidebarSectionTitle icon={User} tone="violet" title="Payee" />
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <SummaryIconTile icon={ContactRound} tone="violet" size="xs" />
                  Name
                </span>
                <span className="max-w-[60%] truncate text-right font-medium text-foreground">{payee || '—'}</span>
              </li>
              <li className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <SummaryIconTile icon={Fingerprint} tone="slate" size="xs" />
                  PAN
                </span>
                <span className="font-mono text-right">{pan || '—'}</span>
              </li>
              <li className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <SummaryIconTile icon={Paperclip} tone="amber" size="xs" />
                  Attachments
                </span>
                <span className="tabular-nums text-right font-medium">{attachments.length}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
        .form-input { width: 100%; height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--background); color: var(--foreground); font-size: 14px; }
        .form-input:focus { outline: none; border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent); background: var(--card); }
        textarea.form-input { height: auto; padding: 10px 12px; }
      `}</style>

      <RecordWorkflowConfirmDialog
        open={confirmIntent !== null}
        onOpenChange={(o) => {
          if (!o) setConfirmIntent(null);
        }}
        intent={confirmIntent}
        recordLabel="bill"
        onConfirm={() => {
          if (confirmIntent === 'submitVerification') submit('Submitted');
          else if (confirmIntent === 'saveDraft') submit('Draft');
          else if (confirmIntent === 'discardCancel') navigate('/bills');
        }}
      />
    </div>
  );
}

function SummaryRow({ icon, tone, label, value }: { icon: LucideIcon; tone: BillSummaryTone; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <SummaryIconTile icon={icon} tone={tone} size="xs" />
        {label}
      </span>
      <span className="max-w-[58%] text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-foreground/80">
        {label} {required && <span className="text-destructive">*</span>}
      </div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </label>
  );
}
