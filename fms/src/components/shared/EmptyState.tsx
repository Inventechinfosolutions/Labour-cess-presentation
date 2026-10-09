import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  title = 'No records found',
  description,
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <div className="font-medium text-foreground">{title}</div>
      {description && <div className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
