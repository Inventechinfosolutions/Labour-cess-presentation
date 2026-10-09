import { forwardRef } from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ListViewMode = 'table' | 'cards';

export const ListTableCardsFlipToggle = forwardRef<
  HTMLButtonElement,
  {
    view: ListViewMode;
    onViewChange: (next: ListViewMode) => void;
    className?: string;
  }
>(function ListTableCardsFlipToggle({ view, onViewChange, className }, ref) {
  const isCards = view === 'cards';

  return (
    <button
      ref={ref}
      type="button"
      title={isCards ? 'Switch to table view' : 'Switch to cards view'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onViewChange(isCards ? 'table' : 'cards');
      }}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/25 text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
      aria-pressed={isCards}
      aria-label={isCards ? 'Switch to table view' : 'Switch to cards view'}
    >
      <span className="relative flex h-6 w-6 items-center justify-center [perspective:720px]" aria-hidden>
        <span
          className={cn(
            'relative h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:duration-0 [transform-style:preserve-3d]',
            isCards ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]',
          )}
        >
          <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(0deg)]">
            <Table2 className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2} />
          </span>
          <span className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <LayoutGrid className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2} />
          </span>
        </span>
      </span>
    </button>
  );
});
