import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BillStatus } from '@/store/types';

const STEPS = ['Submit', 'Verify', 'Approve', 'Payment', 'Completed'];

function statusIndex(status: BillStatus): number {
  switch (status) {
    case 'Draft':
      return 0;
    case 'Submitted':
    case 'Under Verification':
      return 1;
    case 'Sent Back':
      return 1;
    case 'Verification Approved':
      return 2;
    case 'Approved':
      return 3;
    case 'Payment Processing':
      return 3;
    case 'Paid':
      return 4;
    case 'Rejected':
      return -1;
    default:
      return 0;
  }
}

export function WorkflowStepper({ status }: { status: BillStatus }) {
  const idx = statusIndex(status);
  return (
    <div className="flex items-center w-full">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                i < idx
                  ? 'status-success-dot text-primary-foreground'
                  : i === idx
                    ? 'bg-primary text-primary-foreground ring-4 ring-[color:color-mix(in_oklch,var(--primary)_22%,transparent)]'
                    : 'bg-muted text-muted-foreground',
                status === 'Rejected' && i === 1 && 'status-danger-dot text-primary-foreground',
              )}
            >
              {i < idx ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-xs font-medium whitespace-nowrap',
                i <= idx ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mx-2 relative">
              <div className="absolute inset-0 bg-muted" />
              <div
                className="absolute inset-y-0 left-0 stepper-line transition-all duration-500"
                style={{ width: i < idx ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
