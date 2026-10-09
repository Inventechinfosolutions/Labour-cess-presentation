import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { ViewModeToggle } from "@/components/admin/ViewModeToggle"
import type { ViewMode } from "@/hooks/useViewMode"
import { cn } from "@/lib/utils"

interface AdminListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
  filterVariant?: "pills" | "select"
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showViewToggle?: boolean
  showSearch?: boolean
  className?: string
}

export function AdminListToolbar({
  search,
  onSearchChange,
  placeholder,
  status,
  onStatusChange,
  statusOptions,
  filterVariant = "pills",
  viewMode,
  onViewModeChange,
  showViewToggle = true,
  showSearch = true,
  className,
}: AdminListToolbarProps) {
  return (
    <div
      className={cn(
        "admin-list-toolbar",
        !showSearch && "sm:justify-end",
        className
      )}
    >
      {showSearch && (
        <SearchFilterBar
          embedded
          search={search}
          onSearchChange={onSearchChange}
          placeholder={placeholder}
          status={status}
          onStatusChange={onStatusChange}
          statusOptions={statusOptions}
          filterVariant={filterVariant}
        />
      )}
      {showViewToggle && viewMode && onViewModeChange && (
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
      )}
    </div>
  )
}
