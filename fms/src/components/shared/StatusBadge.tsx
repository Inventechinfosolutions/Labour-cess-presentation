import type { BillStatus } from '@/store/types';
import { cn } from '@/lib/utils';

const map: Record<BillStatus, string> = {
  Draft: 'badge-draft',
  Submitted: 'badge-submitted',
  'Under Verification': 'badge-verification',
  'Sent Back': 'badge-sentback',
  'Verification Approved': 'badge-verification-approved',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  'Payment Processing': 'badge-verification',
  Paid: 'badge-paid',
};

export function StatusBadge({ status, className }: { status: BillStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight',
        map[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
