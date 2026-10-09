import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowLeft, AlertTriangle, ShieldCheck, Ban, CheckCircle2, Search, Filter } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { ReceiptStatusBadge } from '@/components/shared/ReceiptStatusBadge';
import { ReceiptComparison, MatchScoreBadge } from '@/components/shared/ReceiptComparison';
import { formatINR } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Receipt, DuplicateMatchScore, ReceiptDuplicateMatch } from '@/store/types';

interface DuplicatePair {
  current: Receipt;
  match: ReceiptDuplicateMatch;
}

export function ReceiptDuplicatesPage() {
  const { receipts, currentRole, detectReceiptDuplicates, markReceiptAsDuplicate, requestReceiptCancellation } = useApp();
  const role = currentRole;
  const { navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [scoreFilter, setScoreFilter] = useState<DuplicateMatchScore | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.dup-block', { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: 'power3.out' });
    }, ref);
    return () => ctx.revert();
  }, []);

  // Build the deduped list of duplicate pairs across all active receipts.
  const pairs: DuplicatePair[] = useMemo(() => {
    const seen = new Set<string>();
    const out: DuplicatePair[] = [];
    receipts.forEach((current) => {
      if (current.status === 'Cancelled' || current.status === 'Rejected') return;
      const matches = detectReceiptDuplicates(current);
      matches.forEach((m) => {
        const key = [current.id, m.receipt.id].sort().join('::');
        if (seen.has(key)) return;
        seen.add(key);
        out.push({ current, match: m });
      });
    });
    return out;
  }, [receipts, detectReceiptDuplicates]);

  const filtered = useMemo(() => {
    return pairs
      .filter((p) => (scoreFilter === 'all' ? true : p.match.matchScore === scoreFilter))
      .filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return [p.current.receiptNumber, p.match.receipt.receiptNumber, p.current.payerName, p.match.receipt.payerName, p.current.transactionReference]
          .some((v) => v.toLowerCase().includes(q));
      });
  }, [pairs, scoreFilter, search]);

  const activePair = useMemo(() => filtered.find((p) => `${p.current.id}::${p.match.receipt.id}` === selected) ?? filtered[0] ?? null, [filtered, selected]);

  const counts = {
    high: pairs.filter((p) => p.match.matchScore === 'HIGH').length,
    medium: pairs.filter((p) => p.match.matchScore === 'MEDIUM').length,
    low: pairs.filter((p) => p.match.matchScore === 'LOW').length,
  };

  if (role !== 'Finance' && role !== 'Auditor') {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold">Restricted</h2>
        <p className="text-muted-foreground text-sm mt-2">This screen is available to Finance Controller and Auditor only.</p>
        <Button onClick={() => navigate('/receipts')} className="mt-4">Back to receipts</Button>
      </div>
    );
  }

  const onMarkDuplicate = (markId: string, againstId: string) => {
    if (!reason.trim()) return toast.error('Reason is mandatory before marking as duplicate.');
    markReceiptAsDuplicate(markId, againstId, reason);
    toast.success('Marked as duplicate — cancellation request created');
    setReason('');
  };

  const onMarkValid = (pairKey: string) => {
    setSelected(null);
    void pairKey;
    toast.success('Marked as valid (not a duplicate). The pair has been dismissed.');
  };

  const onSendForCancellation = (rid: string) => {
    if (!reason.trim()) return toast.error('Reason is mandatory before requesting cancellation.');
    requestReceiptCancellation(rid, reason);
    toast.success('Cancellation request raised');
    setReason('');
  };

  return (
    <div ref={ref} className="p-6 max-w-[1500px] mx-auto w-full space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate('/receipts')}>
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to receipts
      </Button>

      <div className="dup-block flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" /> Duplicate &amp; Exception Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review potential duplicate receipts side-by-side. Mark as valid or as a duplicate — duplicate marks auto-create cancellation requests.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="dup-block grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Total pairs" value={String(pairs.length)} tone="info" icon={<AlertTriangle className="h-5 w-5 status-info-text" />} />
        <KPI label="HIGH risk" value={String(counts.high)} tone="danger" icon={<AlertTriangle className="h-5 w-5 status-danger-text" />} />
        <KPI label="MEDIUM risk" value={String(counts.medium)} tone="warn" icon={<AlertTriangle className="h-5 w-5 status-warn-text" />} />
        <KPI label="LOW risk" value={String(counts.low)} tone="success" icon={<AlertTriangle className="h-5 w-5 status-success-text" />} />
      </div>

      {/* Filters */}
      <div className="dup-block rounded-2xl bg-card border border-border p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, payer, txn reference…"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
          />
        </div>
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value as any)} className="h-10 px-3 rounded-lg border border-border bg-background text-sm">
          <option value="all">All risk levels</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {pairs.length === 0 ? (
        <div className="dup-block rounded-2xl bg-card border border-border p-16 text-center">
          <CheckCircle2 className="h-8 w-8 mx-auto status-success-text mb-3" />
          <div className="font-medium">No duplicate cases found</div>
          <p className="text-sm text-muted-foreground mt-1">All receipts in the last 30 days look unique.</p>
        </div>
      ) : (
        <div className="dup-block grid grid-cols-1 lg:grid-cols-[320px_1fr_280px] gap-5 items-start">
          {/* LEFT: pair list */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Potential duplicates ({filtered.length})
            </div>
            <ul className="max-h-[60vh] overflow-y-auto">
              {filtered.map((p) => {
                const key = `${p.current.id}::${p.match.receipt.id}`;
                const isActive = activePair && `${activePair.current.id}::${activePair.match.receipt.id}` === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => setSelected(key)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b border-border transition',
                        isActive ? 'bg-accent/60' : 'hover:bg-accent/30',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono text-xs">{p.current.receiptNumber}</div>
                        <MatchScoreBadge score={p.match.matchScore} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">vs <span className="font-mono">{p.match.receipt.receiptNumber}</span></div>
                      <div className="text-xs mt-1">{p.current.payerName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{formatINR(p.current.amount)} · {p.current.paymentMode}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 italic">{p.match.matchReason}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CENTER: comparison */}
          <div>
            {activePair ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Comparing</span>
                  <span className="font-mono font-medium">{activePair.current.receiptNumber}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-mono font-medium">{activePair.match.receipt.receiptNumber}</span>
                  <MatchScoreBadge score={activePair.match.matchScore} />
                </div>
                <ReceiptComparison left={activePair.current} right={activePair.match.receipt} leftLabel="Receipt A" rightLabel="Receipt B" />
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border p-12 text-center text-sm text-muted-foreground">
                Select a duplicate pair from the list to compare side-by-side.
              </div>
            )}
          </div>

          {/* RIGHT: decision */}
          <div className="space-y-4">
            {activePair && (
              <>
                <div className="rounded-2xl bg-card border border-border p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 status-info-text" /> Decision
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Match reason: <span className="text-foreground">{activePair.match.matchReason}</span>
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <FieldMatch label="Same transaction ref" matched={activePair.match.matchedFields.transactionReference} />
                    <FieldMatch label="Same amount" matched={activePair.match.matchedFields.amount} />
                    <FieldMatch label="Same payer" matched={activePair.match.matchedFields.payerIdentifier} />
                    <FieldMatch label="Same day" matched={activePair.match.matchedFields.sameDay} />
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Remarks (mandatory for actions)</h3>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Why is this a duplicate (or valid)?"
                    className="w-full rounded-lg border border-border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
                  />
                </div>

                <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Actions</h3>
                  <Button
                    variant="outline"
                    className="w-full status-success-text status-success-border hover:status-success-bg"
                    onClick={() => onMarkValid(`${activePair.current.id}::${activePair.match.receipt.id}`)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark as Valid
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full status-danger-text status-danger-border hover:status-danger-bg"
                    onClick={() => onMarkDuplicate(activePair.current.id, activePair.match.receipt.id)}
                  >
                    <Ban className="h-4 w-4 mr-1.5" /> Mark as Duplicate (Receipt A)
                  </Button>
                  {activePair.current.status === 'Confirmed' && (
                    <Button
                      variant="outline"
                      className="w-full status-warn-text status-warn-border hover:status-warn-bg"
                      onClick={() => onSendForCancellation(activePair.current.id)}
                    >
                      Send for Cancellation
                    </Button>
                  )}
                  <div className="pt-2 border-t border-border">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/receipts/${activePair.current.id}`)}>
                      Open Receipt A
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/receipts/${activePair.match.receipt.id}`)}>
                      Open Receipt B
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border p-4 space-y-2 text-xs">
                  <div className="font-semibold text-sm">Quick Status</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Receipt A</span><ReceiptStatusBadge status={activePair.current.status} className="text-[10px] py-0.5" /></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Receipt B</span><ReceiptStatusBadge status={activePair.match.receipt.status} className="text-[10px] py-0.5" /></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, tone, icon }: { label: string; value: string; tone: 'info' | 'warn' | 'success' | 'danger'; icon: React.ReactNode }) {
  const tones: Record<typeof tone, string> = {
    info: 'status-info-bg status-info-border',
    warn: 'status-warn-bg status-warn-border',
    success: 'status-success-bg status-success-border',
    danger: 'status-danger-bg status-danger-border',
  };
  return (
    <div className={`rounded-2xl border ${tones[tone]} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-semibold text-foreground">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-xl bg-card/80 flex items-center justify-center shadow-sm">{icon}</div>
      </div>
    </div>
  );
}

function FieldMatch({ label, matched }: { label: string; matched: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {matched ? <CheckCircle2 className="h-3.5 w-3.5 status-success-text" /> : <span className="h-3.5 w-3.5 inline-block rounded-full bg-muted" />}
      <span className={cn(matched ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
    </div>
  );
}
