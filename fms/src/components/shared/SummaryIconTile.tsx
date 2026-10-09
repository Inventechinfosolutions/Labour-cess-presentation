import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BILL_SUMMARY_ICON_TONE, type BillSummaryTone } from '@/components/bill/billSummaryTokens';

const TILE = {
  xs: 'h-7 w-7 rounded-lg',
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-11 w-11 rounded-2xl',
  lg: 'h-14 w-14 rounded-2xl',
} as const;

const ICON = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const;

/** Colorful icon tile — same tokens as {@link BillSummaryRow} / bill summary cascade */
export function SummaryIconTile({
  icon: Icon,
  tone,
  size = 'md',
  className,
}: {
  icon: LucideIcon;
  tone: BillSummaryTone;
  size?: keyof typeof TILE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border shadow-sm',
        TILE[size],
        BILL_SUMMARY_ICON_TONE[tone],
        className,
      )}
      aria-hidden
    >
      <Icon className={ICON[size]} strokeWidth={size === 'xs' ? 2 : 1.75} />
    </span>
  );
}
