/**
 * Expandable circular search → underline bar interaction.
 * Adapted from Uiverse.io (ZAKARIAE48CHELLE); styled with theme tokens.
 */
import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AnimatedSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputId?: string;
};

export function AnimatedSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  inputId,
}: AnimatedSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const expanded = focused || value.length > 0;

  return (
    <div
      className={cn(
        'animated-search-field relative inline-flex h-9 max-w-[280px] items-center justify-center overflow-visible',
        'transition-[width] duration-500 ease-[cubic-bezier(0,0.11,0.35,2)]',
        expanded ? 'w-full' : 'w-9',
        className,
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Focus search"
        className="pointer-events-auto absolute right-0 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent outline-none transition-colors duration-200"
        onMouseDown={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Search
          className={cn('h-4 w-4', expanded ? 'text-primary' : 'text-primary-foreground')}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        name="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          'box-border h-9 w-full min-w-0 border-0 px-2 py-1.5 pr-9 font-sans text-sm outline-none',
          'transition-[border-radius,background-color,box-shadow,color] duration-500 ease-[cubic-bezier(0,0.11,0.35,2)]',
          expanded
            ? 'rounded-lg border border-border/80 bg-background text-foreground caret-foreground shadow-sm ring-1 ring-black/[0.04] placeholder:text-muted-foreground focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-ring/35 dark:ring-white/[0.06]'
            : 'rounded-full bg-primary text-transparent caret-transparent shadow-[0_0_3px_hsl(var(--primary))] placeholder:text-transparent',
        )}
      />
    </div>
  );
}
