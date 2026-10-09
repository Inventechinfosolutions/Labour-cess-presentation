import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  LayoutGrid,
  Table2,
} from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { RegisterSearchInput } from "@/components/RegisterSearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const DATA_LIST_PAGE_SIZES = [8, 10, 20, 50] as const;

export type DataListViewMode = "table" | "card";

export function useDataListPagination<T>(filtered: readonly T[], resetKey: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof DATA_LIST_PAGE_SIZES)[number]>(10);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.max(1, Math.min(page, pageCount));

  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const goFirst = useCallback(() => setPage(1), []);
  const goLast = useCallback(() => setPage(pageCount), [pageCount]);
  const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(
    () => setPage((p) => Math.min(pageCount, p + 1)),
    [pageCount],
  );

  const start = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, filtered.length);

  return {
    pageSize,
    setPageSize,
    safePage,
    pageCount,
    paged,
    start,
    end,
    setPage,
    goFirst,
    goLast,
    goPrev,
    goNext,
  };
}

export function DataListPageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function DataListPageHeaderRow({
  left,
  right,
}: {
  left: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">{left}</div>
      {right != null && right !== false ? (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:max-w-[min(100%,48rem)]">
          {right}
        </div>
      ) : null}
    </div>
  );
}

/** Same gradient title treatment as list pages (e.g. Opportunities). */
export function DataListGradientTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn("text-2xl font-bold tracking-tight sm:text-3xl", className)}>
      <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
        {children}
      </span>
    </h1>
  );
}

export function DataListPageHeading({
  title,
  count,
  description,
  animated = true,
}: {
  title: string;
  count?: number;
  description?: string;
  animated?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const motionOn = animated && !reduceMotion;

  return (
    <motion.div
      initial={motionOn ? { opacity: 0, y: 8 } : false}
      animate={motionOn ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0"
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <DataListGradientTitle>{title}</DataListGradientTitle>
        {typeof count === "number" ? (
          <span className="text-sm font-medium text-muted-foreground">({count})</span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </motion.div>
  );
}

export function DataListSearchField({
  value,
  onChange,
  placeholder = "Search",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  return (
    <RegisterSearchInput
      searchRef={searchRef}
      query={value}
      onQueryChange={onChange}
      searchPlaceholder={placeholder}
      searchAriaLabel={ariaLabel}
      className="min-w-[200px] max-w-sm flex-1 sm:max-w-[17.5rem]"
    />
  );
}

export function DataListViewToggle({
  view,
  onViewChange,
}: {
  view: DataListViewMode;
  onViewChange: (v: DataListViewMode) => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <button
      type="button"
      onClick={() => onViewChange(view === "table" ? "card" : "table")}
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-full border border-border bg-muted p-1 shadow-sm ring-1 ring-border outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
      aria-label={
        view === "table"
          ? "Table layout. Click to switch to card layout."
          : "Card layout. Click to switch to table layout."
      }
    >
      <span className="relative block size-8 [perspective:720px]">
        <span
          className={cn(
            "absolute inset-0 [transform-style:preserve-3d]",
            !reduceMotion && "transition-[transform] duration-500 ease-out",
            view === "card"
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateY(0deg)]",
          )}
        >
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-lg bg-background text-foreground shadow-sm ring-1 ring-border",
              "[backface-visibility:hidden]",
            )}
          >
            <Table2 className="size-4 shrink-0" aria-hidden />
          </span>
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-lg bg-background text-foreground shadow-sm ring-1 ring-border",
              "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            )}
          >
            <LayoutGrid className="size-4 shrink-0" aria-hidden />
          </span>
        </span>
      </span>
    </button>
  );
}

/** Use inside `<PopoverTrigger asChild>`. */
export const DataListFilterButton = forwardRef<
  HTMLButtonElement,
  { activeCount: number }
>(function DataListFilterButtonInner({ activeCount }, ref) {
  return (
    <Button
      ref={ref}
      variant="outline"
      className="h-10 gap-1.5 rounded-md border-border"
      type="button"
    >
      <Filter className="size-4" aria-hidden />
      Filters
      {activeCount > 0 && (
        <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-foreground">
          {activeCount}
        </span>
      )}
    </Button>
  );
});

DataListFilterButton.displayName = "DataListFilterButton";

export function DataListPaginationFooter({
  filteredLength,
  safePage,
  pageCount,
  pageSize,
  onPageSizeChange,
  onPageChange,
  goFirst,
  goLast,
  goPrev,
  goNext,
  start,
  end,
}: {
  filteredLength: number;
  safePage: number;
  pageCount: number;
  pageSize: number;
  onPageSizeChange: (n: (typeof DATA_LIST_PAGE_SIZES)[number]) => void;
  onPageChange: (n: number) => void;
  goFirst: () => void;
  goLast: () => void;
  goPrev: () => void;
  goNext: () => void;
  start: number;
  end: number;
}) {
  return (
    <div className="app-data-table-footer flex flex-col gap-4 border-t border-border/70 bg-muted/20 px-4 py-3 sm:px-5">
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) =>
              onPageSizeChange(Number(v) as (typeof DATA_LIST_PAGE_SIZES)[number])
            }
          >
            <SelectTrigger
              className="h-8 w-[4.5rem] text-xs"
              size="sm"
              aria-label="Rows per page"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATA_LIST_PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        {filteredLength > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              disabled={safePage <= 1}
              onClick={goFirst}
              aria-label="First page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={safePage <= 1}
              onClick={goPrev}
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            {pageCount <= 7 ? (
              Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={safePage === n ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "size-8 shrink-0 text-xs font-semibold",
                    safePage === n && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => onPageChange(n)}
                >
                  {n}
                </Button>
              ))
            ) : (
              <span className="min-w-[6rem] px-1 text-center text-xs font-medium tabular-nums text-foreground">
                Page {safePage} of {pageCount}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={safePage >= pageCount}
              onClick={goNext}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              disabled={safePage >= pageCount}
              onClick={goLast}
              aria-label="Last page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        )}
        <p
          className="text-center text-xs text-muted-foreground lg:min-w-[10rem] lg:text-right"
          role="status"
          aria-live="polite"
        >
          {filteredLength === 0 ? (
            "0 results"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">{start}</span> to{" "}
              <span className="font-medium text-foreground">{end}</span> of{" "}
              <span className="font-medium text-foreground">
                {filteredLength}
              </span>{" "}
              results
            </>
          )}
        </p>
      </div>
    </div>
  );
}
