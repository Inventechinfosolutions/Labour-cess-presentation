import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Copy,
  History,
  ListChecks,
  PieChart,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/format';
import { accountHeads, entityList, fiscalYears } from '@/store/mockData';
import { toast } from 'sonner';
import type { EntityType } from '@/store/types';
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
  name: string;
  allocated: number;
  remarks: string;
  lastYearAmount: number;
}

const lastYearMap: Record<string, number> = {
  'TA/DA': 4200000,
  'Remuneration': 11200000,
  'Honorarium': 2300000,
  'Equipment': 16500000,
  'AMC': 3300000,
  'Utilities': 7800000,
  'Miscellaneous': 1400000,
  'Travel': 800000,
  'Stationery': 250000,
  'Software': 1100000,
};

export function BudgetCreatePage({ budgetId }: { budgetId?: string }) {
  const { createBudget, budgets, updateBudgetHeads, submitBudget } = useApp();
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const editing = budgetId ? budgets.find((b) => b.id === budgetId) : undefined;

  const [fy, setFy] = useState<string>(editing?.fy ?? fiscalYears[1]);
  const [entityType, setEntityType] = useState<EntityType>((editing?.entityType ?? 'Department') as EntityType);
  const [entityName, setEntityName] = useState<string>(editing?.entityName ?? entityList.find((e) => e.type === 'Department')?.name ?? '');
  const [name, setName] = useState<string>(editing?.name ?? '');
  const [lines, setLines] = useState<DraftLine[]>(
    editing
      ? editing.heads.map((h) => ({ uid: h.id, name: h.name, allocated: h.allocated, remarks: h.remarks ?? '', lastYearAmount: h.lastYearAmount ?? 0 }))
      : [
          { uid: rid(), name: accountHeads[0], allocated: 0, remarks: '', lastYearAmount: lastYearMap[accountHeads[0]] ?? 0 },
        ],
  );
  const [confirmIntent, setConfirmIntent] = useState<WorkflowConfirmIntent | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.bcr-block', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
    }, ref);
    return () => ctx.revert();
  }, []);

  const filteredEntities = useMemo(() => entityList.filter((e) => e.type === entityType), [entityType]);

  useEffect(() => {
    if (!filteredEntities.find((e) => e.name === entityName)) {
      setEntityName(filteredEntities[0]?.name ?? '');
    }
  }, [entityType, filteredEntities, entityName]);

  const totals = useMemo(() => {
    const allocated = lines.reduce((a, l) => a + (Number(l.allocated) || 0), 0);
    const lastYear = lines.reduce((a, l) => a + (Number(l.lastYearAmount) || 0), 0);
    return { allocated, lastYear, deltaPct: lastYear ? Math.round(((allocated - lastYear) / lastYear) * 100) : 0 };
  }, [lines]);

  const duplicates = useMemo(() => {
    const seen = new Map<string, number>();
    lines.forEach((l) => seen.set(l.name, (seen.get(l.name) ?? 0) + 1));
    return new Set(Array.from(seen.entries()).filter(([, c]) => c > 1).map(([k]) => k));
  }, [lines]);

  const validate = (): string | null => {
    if (!name.trim()) return 'Budget name is required';
    if (!entityName) return 'Entity is required';
    if (lines.length === 0) return 'Add at least one budget head';
    if (duplicates.size > 0) return 'Duplicate budget heads not allowed';
    if (lines.some((l) => !l.name)) return 'Each line needs a head';
    if (lines.some((l) => l.allocated < 0)) return 'Allocations cannot be negative';
    if (lines.every((l) => l.allocated === 0)) return 'At least one head must have a non-zero allocation';
    return null;
  };

  const submit = (saveAs: 'Draft' | 'Submitted') => {
    const err = validate();
    if (err) return toast.error(err);
    if (editing) {
      updateBudgetHeads(
        editing.id,
        lines.map((l) => ({
          id: l.uid,
          name: l.name,
          allocated: Number(l.allocated) || 0,
          utilized: editing.heads.find((h) => h.id === l.uid)?.utilized ?? 0,
          reserved: editing.heads.find((h) => h.id === l.uid)?.reserved ?? 0,
          remarks: l.remarks,
          lastYearAmount: l.lastYearAmount,
        })),
      );
      if (saveAs === 'Submitted') submitBudget(editing.id);
      toast.success(saveAs === 'Submitted' ? 'Budget resubmitted for verification' : 'Draft saved');
      navigate(`/budgets/${editing.id}`);
      return;
    }
    const created = createBudget({
      fy,
      name,
      entityType,
      entityName,
      heads: lines.map((l) => ({ name: l.name, allocated: Number(l.allocated) || 0, remarks: l.remarks, lastYearAmount: l.lastYearAmount })),
      saveAs,
    });
    toast.success(saveAs === 'Submitted' ? 'Budget submitted for verification' : 'Draft saved');
    navigate(`/budgets/${created.id}`);
  };

  const addRow = () => {
    const next = accountHeads.find((h) => !lines.some((l) => l.name === h)) ?? '';
    setLines((p) => [...p, { uid: rid(), name: next, allocated: 0, remarks: '', lastYearAmount: lastYearMap[next] ?? 0 }]);
  };

  const removeRow = (uid: string) => setLines((p) => p.filter((l) => l.uid !== uid));

  const updateLine = (uid: string, patch: Partial<DraftLine>) => setLines((p) => p.map((l) => (l.uid === uid ? { ...l, ...patch, lastYearAmount: patch.name ? (lastYearMap[patch.name] ?? 0) : l.lastYearAmount } : l)));

  const copyPreviousYear = () => {
    setLines((p) => p.map((l) => ({ ...l, allocated: lastYearMap[l.name] ?? l.lastYearAmount })));
    toast.success('Copied previous year amounts');
  };

  const fillSample = () => {
    setName('Sample — Department Annual Budget');
    setEntityType('Department');
    setEntityName(entityList.find((e) => e.type === 'Department')?.name ?? '');
    setLines([
      { uid: rid(), name: 'TA/DA',        allocated: 350000,  remarks: 'Conferences + travel', lastYearAmount: lastYearMap['TA/DA'] ?? 0 },
      { uid: rid(), name: 'Remuneration', allocated: 1500000, remarks: 'Guest faculty',         lastYearAmount: lastYearMap['Remuneration'] ?? 0 },
      { uid: rid(), name: 'Equipment',    allocated: 1200000, remarks: 'New microscope',        lastYearAmount: lastYearMap['Equipment'] ?? 0 },
      { uid: rid(), name: 'AMC',          allocated: 280000,  remarks: 'Software AMC',          lastYearAmount: lastYearMap['AMC'] ?? 0 },
    ]);
    toast.success('Sample data filled');
  };

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1400px] space-y-5 p-6 pb-28">
      <Button variant="ghost" size="sm" onClick={() => navigate('/budgets')}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to budgets
      </Button>

      <div className="bcr-block flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-4">
          <SummaryIconTile icon={PieChart} tone="fuchsia" size="lg" />
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{editing ? 'Edit Budget' : 'Create New Budget'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Define the budget header and line items. Save as draft or submit for verification when ready.
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
        {/* Header form + Line grid */}
        <div className="min-w-0 space-y-5 md:col-span-2">
          <div className="bcr-block rounded-2xl border border-border bg-card p-6">
            <SectionCardTitle
              icon={Building2}
              tone="emerald"
              title="Budget header"
              subtitle="Financial year, title, entity, and version context."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Financial Year" required>
                <select value={fy} onChange={(e) => setFy(e.target.value)} className="form-input">
                  {fiscalYears.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Budget Name" required>
                <input value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="e.g. Annual Operating Budget" />
              </Field>
              <Field label="Entity Type" required>
                <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityType)} className="form-input">
                  <option value="University">University</option>
                  <option value="College">College</option>
                  <option value="Department">Department</option>
                </select>
              </Field>
              <Field label="Entity" required>
                <select value={entityName} onChange={(e) => setEntityName(e.target.value)} className="form-input">
                  {filteredEntities.map((e) => <option key={e.name}>{e.name}</option>)}
                </select>
              </Field>
              <Field label="Version">
                <input value={editing ? `v${editing.version}` : 'v1'} disabled className="form-input opacity-70" />
              </Field>
              <Field label="Status">
                <input value={editing?.status ?? 'Draft'} disabled className="form-input opacity-70" />
              </Field>
            </div>
          </div>

          <div className="bcr-block overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <SummaryIconTile icon={ListChecks} tone="sky" size="sm" className="mt-0.5" />
                <div>
                  <h3 className="font-semibold">Line Items</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tab between cells. Variances are highlighted vs last year.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyPreviousYear}>
                  <Copy className="h-4 w-4 mr-1.5" /> Copy Previous Year
                </Button>
                <Button size="sm" onClick={addRow} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1.5" /> Add Row
                </Button>
              </div>
            </div>
            <div className={TASKS_TABLE_SCROLL_WRAP}>
              <table className={cn(TASKS_TABLE_ROOT, 'min-w-[920px]')}>
                <thead>
                  <tr>
                    <th className={TASKS_TABLE_TH}>Sl.</th>
                    <th className={TASKS_TABLE_TH}>Account head</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-right')}>Last year</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-right')}>Allocated *</th>
                    <th className={cn(TASKS_TABLE_TH, 'text-right')}>Variance</th>
                    <th className={TASKS_TABLE_TH}>Remarks</th>
                    <th className={cn(TASKS_TABLE_TH, 'w-12')} />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, index) => {
                    const variance = l.lastYearAmount ? Math.round(((l.allocated - l.lastYearAmount) / l.lastYearAmount) * 100) : 0;
                    const isDup = duplicates.has(l.name);
                    const high = Math.abs(variance) > 30;
                    return (
                      <tr key={l.uid} className="transition odd:bg-background even:bg-muted/25 hover:bg-muted/40">
                        <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                        <td className={TASKS_TABLE_TD}>
                          <select
                            value={l.name}
                            onChange={(e) => updateLine(l.uid, { name: e.target.value })}
                            className={cn('form-input h-9', isDup && 'border-destructive ring-2 ring-destructive/20')}
                          >
                            {accountHeads.map((h) => (
                              <option key={h}>{h}</option>
                            ))}
                          </select>
                          {isDup && <div className="mt-1 text-[11px] status-danger-text">Duplicate head</div>}
                        </td>
                        <td className={cn(TASKS_TABLE_TD, 'text-right text-xs text-muted-foreground')}>{formatINR(l.lastYearAmount)}</td>
                        <td className={TASKS_TABLE_TD}>
                          <input
                            type="number"
                            min={0}
                            value={l.allocated || ''}
                            onChange={(e) => updateLine(l.uid, { allocated: Number(e.target.value) })}
                            className="form-input h-9 text-right font-mono"
                            placeholder="0"
                          />
                        </td>
                        <td className={cn(TASKS_TABLE_TD, 'text-right')}>
                          {l.lastYearAmount ? (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                                high && variance > 0 ? 'status-warn-bg' :
                                  high && variance < 0 ? 'status-danger-bg' :
                                    'status-neutral-bg',
                              )}
                            >
                              {variance > 0 ? '+' : ''}
                              {variance}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className={TASKS_TABLE_TD}>
                          <input
                            value={l.remarks}
                            onChange={(e) => updateLine(l.uid, { remarks: e.target.value })}
                            className="form-input h-9 text-xs"
                            placeholder="Optional remarks"
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bcr-block flex items-center gap-3 sticky bottom-4 bg-background/80 backdrop-blur-md p-3 rounded-2xl border border-border z-10">
            <Button onClick={() => setConfirmIntent('submitVerification')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="h-4 w-4 mr-1.5" /> Submit for Verification
            </Button>
            <Button variant="outline" onClick={() => setConfirmIntent('saveDraft')}>
              <Save className="h-4 w-4 mr-1.5" /> Save Draft
            </Button>
            <Button variant="ghost" onClick={() => setConfirmIntent('discardCancel')}>
              Cancel
            </Button>
            {duplicates.size > 0 && (
              <span className="ml-auto text-xs status-danger-text inline-flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Resolve duplicate heads to submit
              </span>
            )}
          </div>
        </div>

        <aside
          className="sticky top-4 z-10 w-full max-h-[min(calc(100dvh-6rem),560px)] space-y-5 self-start overflow-y-auto overscroll-y-contain md:top-5 md:max-h-[calc(100dvh-5rem)]"
          aria-label="Budget summary"
        >
          <div className="bcr-block rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SidebarSectionTitle icon={TrendingUp} tone="emerald" title="Live Summary" />
            <div className="mt-4 space-y-3 text-sm">
              <BudgetSidebarMetric icon={Banknote} tone="fuchsia" label="Total allocated" value={formatINR(totals.allocated)} emphasize />
              <BudgetSidebarMetric icon={History} tone="slate" label="Last year total" value={formatINR(totals.lastYear)} />
              <div className="flex gap-3 rounded-xl border status-info-border status-info-bg px-3 py-2.5">
                <SummaryIconTile icon={TrendingUp} tone="orange" size="sm" className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">YoY change</div>
                  <div className="mt-0.5 text-lg font-semibold tabular-nums">
                    {totals.deltaPct > 0 ? '+' : ''}
                    {totals.deltaPct}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bcr-block rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SidebarSectionTitle icon={Sparkles} tone="orange" title="Insights" />
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {totals.deltaPct > 30 && (
                <li className="flex items-start gap-2 status-warn-text">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  Total budget up {totals.deltaPct}% vs last year — verifier will scrutinise.
                </li>
              )}
              {lines.filter((l) => l.lastYearAmount && Math.abs(((l.allocated - l.lastYearAmount) / l.lastYearAmount) * 100) > 30).length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full status-warn-dot mt-1.5" />
                  {lines.filter((l) => l.lastYearAmount && Math.abs(((l.allocated - l.lastYearAmount) / l.lastYearAmount) * 100) > 30).length} head(s) have variance &gt; 30%.
                </li>
              )}
              {lines.filter((l) => l.allocated === 0).length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full status-info-dot mt-1.5" />
                  {lines.filter((l) => l.allocated === 0).length} head(s) have zero allocation.
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full status-success-dot mt-1.5" />
                Top head: <span className="text-foreground font-medium ml-1">{topHead(lines)}</span>
              </li>
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
        recordLabel="budget"
        onConfirm={() => {
          if (confirmIntent === 'submitVerification') submit('Submitted');
          else if (confirmIntent === 'saveDraft') submit('Draft');
          else if (confirmIntent === 'discardCancel') navigate('/budgets');
        }}
      />
    </div>
  );
}

function topHead(lines: DraftLine[]) {
  if (lines.length === 0) return '—';
  return lines.reduce((m, l) => (l.allocated > (m?.allocated ?? -1) ? l : m), lines[0]).name;
}

function rid() {
  return Math.random().toString(36).slice(2, 9);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground/80 mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </div>
      {children}
    </label>
  );
}

function BudgetSidebarMetric({
  icon,
  tone,
  label,
  value,
  emphasize,
}: {
  icon: LucideIcon;
  tone: BillSummaryTone;
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-muted-foreground">
        <SummaryIconTile icon={icon} tone={tone} size="xs" />
        {label}
      </span>
      <span className={cn('text-right font-medium tabular-nums text-foreground', emphasize && 'font-semibold')}>{value}</span>
    </div>
  );
}
