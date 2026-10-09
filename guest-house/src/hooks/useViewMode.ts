import { useEffect, useState } from "react"

export type ViewMode = "cards" | "table"

export function useViewMode(storageKey: string, defaultMode: ViewMode = "cards") {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === "cards" || stored === "table") return stored
    } catch {
      /* ignore */
    }
    return defaultMode
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, viewMode)
    } catch {
      /* ignore */
    }
  }, [storageKey, viewMode])

  return [viewMode, setViewMode] as const
}
