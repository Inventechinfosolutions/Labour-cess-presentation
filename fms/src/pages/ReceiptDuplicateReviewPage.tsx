import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowLeft, GitCompare } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { ReceiptComparison } from '@/components/shared/ReceiptComparison';
import { ReceiptDuplicateRiskSummaryCard } from '@/components/receipt/ReceiptDuplicateRiskSummaryCard';
import { ReceiptDuplicatesMatchesTable } from '@/components/receipt/ReceiptDuplicatesMatchesTable';
import { formatINR, formatDate } from '@/lib/format';
import type { ReceiptDuplicateMatch } from '@/store/types';

/**
 * Full-screen duplicate workspace for one receipt: risk meter, candidate table, side-by-side comparison.
 * Opened from receipt detail via `/receipts/:id/duplicates`.
 */
export function ReceiptDuplicateReviewPage({ receiptId }: { receiptId: string }) {
  const { path } = useRouter();
  const matchKey = useMemo(() => {
    const qs = path.includes('?') ? path.split('?')[1] : '';
    return new URLSearchParams(qs).get('match') ?? '';
  }, [path]);
  return <ReceiptDuplicateReviewInner key={`${receiptId}:${matchKey}`} receiptId={receiptId} />;
}

function ReceiptDuplicateReviewInner({ receiptId }: { receiptId: string }) {
  const { receipts, detectReceiptDuplicates } = useApp();
  const { path, navigate } = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const receipt = useMemo(() => receipts.find((r) => r.id === receiptId), [receipts, receiptId]);
  const duplicates: ReceiptDuplicateMatch[] = useMemo(
    () => (receipt ? detectReceiptDuplicates(receipt) : []),
    [receipt, detectReceiptDuplicates],
  );

  /** `?match=` from URL — pre-select row when opened from receipt detail “Open” */
  const matchIdFromSearch = useMemo(() => {
    const qs = path.includes('?') ? path.split('?')[1] : '';
    return new URLSearchParams(qs).get('match');
  }, [path]);

  const resolvedMatchFromUrl = useMemo(() => {
    if (!matchIdFromSearch) return null;
    return duplicates.some((m) => m.receipt.id === matchIdFromSearch) ? matchIdFromSearch : null;
  }, [duplicates, matchIdFromSearch]);

  /** Table selection overrides URL default */
  const [pickedId, setPickedId] = useState<string | null>(null);
  const activeMatchId = pickedId ?? resolvedMatchFromUrl ?? duplicates[0]?.receipt.id ?? null;

  const selectedMatch = useMemo(
    () => duplicates.find((m) => m.receipt.id === activeMatchId) ?? duplicates[0] ?? null,
    [duplicates, activeMatchId],
  );
  const compared = selectedMatch?.receipt ?? null;

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dup-review-block',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.09, duration: 0.55, ease: 'power3.out', delay: 0.05 },
      );
      gsap.fromTo(
        '.dup-review-hero',
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
      );
    }, ref);
    return () => ctx.revert();
  }, [receiptId]);

  if (!receipt) {
    return (
      <div className="p-12 text-center">
        <p className="text-lg font-semibold">Receipt not found</p>
        <Button className="mt-4" onClick={() => navigate('/receipts')}>
          Back to receipts
        </Button>
      </div>
    );
  }

  if (duplicates.length === 0) {
    return (
      <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-14 pt-2 md:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/receipts/${receiptId}`)}
          className="-ml-1 gap-1.5 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to receipt
        </Button>
        <div className="dup-review-block rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="font-semibold text-foreground">No duplicate candidates</p>
          <p className="mt-2 text-sm text-muted-foreground">This receipt has no matches in the duplicate detector.</p>
          <Button className="mt-6" onClick={() => navigate(`/receipts/${receiptId}`)}>
            Return to receipt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1400px] space-y-6 px-4 pb-16 pt-2 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/receipts/${receiptId}`)}
        className="-ml-1 gap-1.5 rounded-full border border-transparent px-3 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to receipt
      </Button>

      <section className="dup-review-hero dup-review-block overflow-hidden rounded-2xl border border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_12%,var(--card)),color-mix(in_oklch,var(--background)_55%,var(--card)))] p-6 md:p-8 dark:bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_18%,var(--card)),color-mix(in_oklch,var(--background)_35%,var(--card)))]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="login-role-well login-role-well--teal flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner [&_svg]:stroke-[1.75]">
              <GitCompare className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="fms-dashboard-section-label mb-0">Duplicate workspace</p>
              <h1 className="fms-dashboard-title text-[1.65rem] leading-tight text-foreground md:text-[2rem]">
                Compare receipts
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">{receipt.receiptNumber}</span>
                <span className="mx-2 text-border">·</span>
                {formatDate(receipt.receiptDate)}
                <span className="mx-2 text-border">·</span>
                {formatINR(receipt.amount)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {selectedMatch && (
        <div className="dup-review-block">
          <ReceiptDuplicateRiskSummaryCard match={selectedMatch} />
        </div>
      )}

      <div className="dup-review-block">
        <ReceiptDuplicatesMatchesTable
          matches={duplicates}
          comparedId={activeMatchId}
          onSelect={setPickedId}
          onOpen={(matchedReceiptId) => navigate(`/receipts/${matchedReceiptId}/duplicates`)}
          hint="Select a row to update the comparison. Open goes to that receipt’s duplicate workspace."
        />
      </div>

      {compared && (
        <div className="dup-review-block">
          <ReceiptComparison
            left={receipt}
            right={compared}
            leftLabel="Current receipt"
            rightLabel="Matched receipt"
          />
        </div>
      )}
    </div>
  );
}
