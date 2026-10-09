import { Lock, Ban } from 'lucide-react';
import type { ReceiptStatus } from '@/store/types';
import { cn } from '@/lib/utils';

const map: Record<ReceiptStatus, string> = {
  Draft: 'status-neutral-bg',
  Submitted: 'status-info-bg',
  Verified: 'status-purple-bg',
  Approved: 'status-paid-bg',
  Confirmed: 'status-success-bg',
  Rejected: 'status-danger-bg',
  'Sent Back': 'status-warn-bg',
  'On Hold': 'status-warn-bg',
  Cancelled: 'status-danger-bg',
};

export function ReceiptStatusBadge({ status, className }: { status: ReceiptStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight',
        map[status],
        className,
      )}
    >
      {status === 'Confirmed' && <Lock className="h-3 w-3" />}
      {status === 'Cancelled' && <Ban className="h-3 w-3" />}
      {status}
    </span>
  );
}
