import { Lock } from 'lucide-react';
import type { BudgetStatus } from '@/store/types';
import { cn } from '@/lib/utils';

const map: Record<BudgetStatus, string> = {
  Draft: 'status-neutral-bg',
  Submitted: 'status-info-bg',
  Verified: 'status-purple-bg',
  Approved: 'status-success-bg',
  Rejected: 'status-danger-bg',
  'Sent Back': 'status-warn-bg',
  'On Hold': 'status-warn-bg',
  Locked: 'status-success-bg',
};

export function BudgetStatusBadge({ status, className }: { status: BudgetStatus; className?: string }) {
  const showLock = status === 'Approved' || status === 'Locked';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight',
        map[status],
        className,
      )}
    >
      {showLock && <Lock className="h-3 w-3" />}
      {status}
    </span>
  );
}
