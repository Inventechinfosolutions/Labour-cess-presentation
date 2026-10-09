import { Shield } from 'lucide-react';
import { MatchScoreBadge } from '@/components/shared/ReceiptComparison';
import type { ReceiptDuplicateMatch } from '@/store/types';
import { duplicateMatchPercent } from '@/lib/receiptDuplicate';
import { cn } from '@/lib/utils';

/** Risk meter for a single duplicate candidate — used on the dedicated duplicate review screen. */
export function ReceiptDuplicateRiskSummaryCard({ match }: { match: ReceiptDuplicateMatch }) {
  const pct = duplicateMatchPercent(match.matchScore);
  const barClass =
    match.matchScore === 'HIGH' ? 'bg-destructive' : match.matchScore === 'MEDIUM' ? 'bg-[color:var(--chart-3)]' : 'bg-primary';

  return (
    <div className="tdetail-block fms-dashboard-panel p-5 md:p-6">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/50 text-primary">
          <Shield className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">Risk summary</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Duplicate risk</span>
            <MatchScoreBadge score={match.matchScore} />
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">{match.matchReason}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium">
          <span className="uppercase tracking-wider text-muted-foreground">Match score</span>
          <span
            className={cn(
              'font-mono text-lg font-bold tabular-nums',
              match.matchScore === 'HIGH' && 'status-danger-text',
              match.matchScore === 'MEDIUM' && 'status-warn-text',
            )}
          >
            {pct}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full transition-all duration-700 ease-out', barClass)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
