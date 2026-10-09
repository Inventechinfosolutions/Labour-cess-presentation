import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DuplicateMatchScore, Receipt } from '@/store/types';
import { formatINR, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ReceiptStatusBadge } from './ReceiptStatusBadge';

/**
 * Side-by-side comparison of two receipts. Matching fields use green tint;
 * differing fields use red tint. Final column shows row-level match icon.
 */
export function ReceiptComparison({
  left,
  right,
  leftLabel = 'Current receipt',
  rightLabel = 'Matched receipt',
}: {
  left: Receipt;
  right: Receipt;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const fields: { key: keyof Receipt | 'lineSummary'; label: string; render?: (r: Receipt) => string }[] = [
    { key: 'receiptDate', label: 'Receipt Date', render: (r) => formatDate(r.receiptDate) },
    { key: 'payerName', label: 'Payer' },
    { key: 'payerIdentifier', label: 'Payer ID' },
    { key: 'entityName', label: 'Entity' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'transactionReference', label: 'Transaction Reference' },
    { key: 'bankName', label: 'Bank', render: (r) => r.bankName ?? '—' },
    { key: 'paymentDate', label: 'Payment Date', render: (r) => formatDate(r.paymentDate) },
    { key: 'amount', label: 'Amount', render: (r) => formatINR(r.amount) },
    { key: 'lineSummary', label: 'Line Items', render: (r) => r.lines.map((l) => `${l.accountHead}: ${formatINR(l.amount)}`).join('\n') },
  ];

  const matchOf = (key: (typeof fields)[number]['key']) => {
    if (key === 'lineSummary') {
      const summary = (r: Receipt) => r.lines.map((l) => `${l.accountHead}:${l.amount}`).sort().join('|');
      return summary(left) === summary(right);
    }
    return (left as unknown as Record<string, unknown>)[String(key)] === (right as unknown as Record<string, unknown>)[String(key)];
  };

  return (
    <div className="fms-dashboard-panel fms-dashboard-chart-board overflow-hidden rounded-2xl">
      <div className="border-b border-border bg-muted/30 px-4 py-4 md:px-6">
        <p className="fms-dashboard-section-label mb-1">Compare</p>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Side-by-side comparison</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{leftLabel}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{left.receiptNumber}</span>
              <ReceiptStatusBadge status={left.status} className="text-[10px] py-0.5" />
            </div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{rightLabel}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{right.receiptNumber}</span>
              <ReceiptStatusBadge status={right.status} className="text-[10px] py-0.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Attribute</th>
              <th className="px-4 py-3 font-semibold">Current</th>
              <th className="px-4 py-3 font-semibold">Matched</th>
              <th className="w-14 px-2 py-3 text-center font-semibold" aria-label="Match status">
                <span className="sr-only">Status</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => {
              const matched = matchOf(f.key);
              const lv = f.render ? f.render(left) : String((left as unknown as Record<string, unknown>)[String(f.key)] ?? '');
              const rv = f.render ? f.render(right) : String((right as unknown as Record<string, unknown>)[String(f.key)] ?? '');
              const cellClass = matched ? 'status-success-bg' : 'status-danger-bg';
              return (
                <tr key={String(f.key)} className="border-t border-border">
                  <td className="align-top px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </td>
                  <td className={cn('align-top px-4 py-3 font-mono text-[13px] leading-snug', cellClass)}>{lv || '—'}</td>
                  <td className={cn('align-top px-4 py-3 font-mono text-[13px] leading-snug', cellClass)}>{rv || '—'}</td>
                  <td className="align-middle px-2 py-3 text-center">
                    {matched ? (
                      <CheckCircle2 className="mx-auto h-4 w-4 status-success-text" aria-label="Match" />
                    ) : (
                      <AlertTriangle className="mx-auto h-4 w-4 status-danger-text" aria-label="Difference" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="border-t border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground md:px-6">
        Differences are highlighted in red. Matched details are highlighted in green.
      </p>
    </div>
  );
}

export function MatchScoreBadge({ score }: { score: DuplicateMatchScore }) {
  const cls =
    score === 'HIGH'
      ? 'status-danger-bg status-danger-text'
      : score === 'MEDIUM'
        ? 'status-warn-bg status-warn-text'
        : 'status-info-bg status-info-text';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider', cls)}>
      {score}
    </span>
  );
}
