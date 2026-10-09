import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/shared/ReceiptComparison';
import { formatINR, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
} from '@/components/shared/tasksTableTokens';
import type { ReceiptDuplicateMatch } from '@/store/types';

export function ReceiptDuplicatesMatchesTable({
  matches,
  comparedId,
  onSelect,
  onOpen,
  onMarkDuplicate,
  hint = 'Click a row to select which candidate to compare in the table below.',
}: {
  matches: ReceiptDuplicateMatch[];
  comparedId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onMarkDuplicate?: (againstId: string) => void;
  hint?: string;
}) {
  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board overflow-hidden">
      <div className="border-b border-border px-5 py-4 md:px-7 md:pt-7">
        <p className="fms-dashboard-section-label mb-1">Risk</p>
        <h3 className="fms-dashboard-title flex flex-wrap items-center gap-2 text-xl tracking-tight text-foreground md:text-[1.35rem]">
          <AlertTriangle className="h-5 w-5 shrink-0 status-warn-text" strokeWidth={1.75} aria-hidden />
          Possible duplicates
          <span className="rounded-full bg-muted px-2 py-0.5 font-sans text-xs font-semibold tracking-normal text-muted-foreground">
            {matches.length}
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className={TASKS_TABLE_SCROLL_WRAP}>
        <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1100px]')}>
          <thead>
            <tr>
              <th className={TASKS_TABLE_TH}>Receipt</th>
              <th className={TASKS_TABLE_TH}>Sl. No</th>
              <th className={TASKS_TABLE_TH}>Date</th>
              <th className={TASKS_TABLE_TH}>Payer</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Amount</th>
              <th className={TASKS_TABLE_TH}>Txn Reference</th>
              <th className={TASKS_TABLE_TH}>Match Score</th>
              <th className={TASKS_TABLE_TH}>Reason</th>
              <th className={cn(TASKS_TABLE_TH, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, index) => {
              const r = m.receipt;
              const selected = comparedId === r.id;
              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className={cn(
                    'tasks-dash-row cursor-pointer transition hover:bg-muted/35',
                    selected && 'bg-primary/10',
                  )}
                >
                  <td className={cn(TASKS_TABLE_TD, 'font-mono text-xs')}>{r.receiptNumber}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{index + 1}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-xs text-muted-foreground')}>{formatDate(r.receiptDate)}</td>
                  <td className={TASKS_TABLE_TD}>
                    <div className="text-sm leading-tight text-foreground">{r.payerName}</div>
                    <div className="mt-0.5 font-mono text-xs text-muted-foreground">{r.payerIdentifier}</div>
                  </td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right font-mono font-semibold')}>{formatINR(r.amount)}</td>
                  <td className={cn(TASKS_TABLE_TD, 'font-mono text-xs')}>{r.transactionReference}</td>
                  <td className={TASKS_TABLE_TD}>
                    <MatchScoreBadge score={m.matchScore} />
                  </td>
                  <td className={cn(TASKS_TABLE_TD, 'max-w-[240px] text-xs text-muted-foreground')}>{m.matchReason}</td>
                  <td className={cn(TASKS_TABLE_TD, 'text-right whitespace-nowrap')}>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onOpen(r.id); }}>
                        Open
                      </Button>
                      {onMarkDuplicate && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="status-danger-text status-danger-border"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkDuplicate(r.id);
                          }}
                        >
                          Mark Dup.
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
