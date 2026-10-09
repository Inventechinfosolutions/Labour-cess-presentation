import type { ReactNode } from "react"
import type { ViewMode } from "@/hooks/useViewMode"

interface AdminListViewProps {
  viewMode: ViewMode
  table: ReactNode
  cards: ReactNode
}

export function AdminListView({ viewMode, table, cards }: AdminListViewProps) {
  return viewMode === "table" ? table : cards
}
