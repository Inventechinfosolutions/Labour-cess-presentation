import { useEffect, useMemo, useState } from "react"
import {
  FileSearch,
  Hash,
  IdCard,
  Phone,
  Search,
  X,
} from "lucide-react"
import { sampleSearchHits, searchPlaceholders } from "@/data/dashboard-data"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const typeIcons = {
  Claim: Hash,
  Depositor: IdCard,
  "Bond / MOU": FileSearch,
} as const

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % searchPlaceholders.length)
    }, 2800)
    return () => window.clearInterval(id)
  }, [])

  const hits = useMemo(() => {
    if (!query.trim()) return sampleSearchHits
    const q = query.toLowerCase()
    return sampleSearchHits.filter(
      (h) =>
        h.id.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q) ||
        h.fe.toLowerCase().includes(q) ||
        h.status.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className={cn(
          "group flex items-center gap-2 rounded-2xl border border-border/70 bg-transparent px-3 transition-all dark:bg-transparent",
          "focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/15",
          open && "border-primary/40 ring-3 ring-primary/15",
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 160)}
          placeholder={`Search by ${searchPlaceholders[placeholderIndex]}…`}
          className="h-11 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent"
          aria-label="Global search across CSMS"
        />
        {query ? (
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="hidden rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_16px_48px_rgba(18,57,92,0.14)] stagger-in">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <Phone className="size-3.5" />
            Search Aadhaar, PAN, Mobile, Customer ID, Bond/MOU, or Claim Number
          </div>
          <ul className="max-h-72 overflow-y-auto p-2">
            {hits.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matching records found
              </li>
            ) : (
              hits.map((hit) => {
                const Icon = typeIcons[hit.type as keyof typeof typeIcons] ?? Hash
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/70"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-navy/10 text-navy dark:bg-primary/15 dark:text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold">
                            {hit.name}
                          </span>
                          <Badge variant="secondary" className="rounded-md text-[10px]">
                            {hit.type}
                          </Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {hit.id} · {hit.fe} · {hit.status}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
