import { Search } from "lucide-react";
import type { RefObject } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Primary-button + field split control — same pattern as admin opportunities table toolbar. */
export function RegisterSearchInput({
  searchRef,
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
  searchAriaLabel = "Search",
  className,
}: {
  searchRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex w-[min(100%,17.5rem)] shrink-0 items-stretch", className)}>
      <button
        type="button"
        className="flex w-11 shrink-0 items-center justify-center rounded-l-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => searchRef.current?.focus()}
        aria-label="Focus search field"
      >
        <Search className="size-4" aria-hidden />
      </button>
      <Input
        ref={searchRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        aria-label={searchAriaLabel}
        className="h-10 min-w-[6rem] flex-1 rounded-none rounded-r-full border border-border border-l-0 bg-background px-3 text-sm shadow-sm ring-0 placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
      />
    </div>
  );
}
