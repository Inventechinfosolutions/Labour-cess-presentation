import { LayoutGrid, Table2 } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import type { DataListViewMode } from "@/components/DataListPage";
import { RegisterSearchInput } from "@/components/RegisterSearchInput";

/** @deprecated Use RegisterSearchInput — kept for existing imports (admin dashboard). */
export { RegisterSearchInput as TaskRegisterSearchInput } from "@/components/RegisterSearchInput";

type Props = {
  /** Section label at left of toolbar (default: “Task List”). */
  toolbarTitle?: string;
  searchRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  /** Extra control(s) between search and layout toggle — e.g. task-type `<Select>` */
  filterSlot?: ReactNode;
  view: DataListViewMode;
  onViewChange: (v: DataListViewMode) => void;
  /** When true, omits the table/card switch (fixed layout). */
  hideLayoutToggle?: boolean;
};

/** Strip: title + primary search + optional filter + table/card toggle (tasks, opportunities browse, etc.). */
export function TaskRegisterToolbar({
  toolbarTitle = "Task List",
  searchRef,
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
  searchAriaLabel = "Search",
  filterSlot,
  view,
  onViewChange,
  hideLayoutToggle = false,
}: Props) {
  return (
    <div className="flex flex-nowrap items-center gap-3 overflow-x-auto border-b border-border/80 bg-muted/20 px-3 py-2.5 [scrollbar-width:thin] sm:gap-4 sm:px-4">
      <h2 className="shrink-0 text-sm font-semibold tracking-tight text-foreground sm:text-base">
        {toolbarTitle}
      </h2>
      <div className="ml-auto flex min-w-0 flex-nowrap items-center justify-end gap-2 sm:gap-2.5">
        <RegisterSearchInput
          searchRef={searchRef}
          query={query}
          onQueryChange={onQueryChange}
          searchPlaceholder={searchPlaceholder}
          searchAriaLabel={searchAriaLabel}
        />
        {filterSlot}
        {!hideLayoutToggle ? (
          <button
            type="button"
            onClick={() => onViewChange(view === "table" ? "card" : "table")}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm ring-1 ring-border/70 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              view === "table"
                ? "Table layout. Switch to card layout."
                : "Card layout. Switch to table layout."
            }
          >
            {view === "table" ? (
              <LayoutGrid className="size-[1.05rem]" aria-hidden />
            ) : (
              <Table2 className="size-[1.05rem]" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
