import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function PersonSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, PAN, Aadhaar, or customer ID"
        className="h-11 rounded-2xl border-border/70 bg-background/80 pl-10 text-sm shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:bg-[#0f172a]/60"
        aria-label="Search by name, PAN, Aadhaar, or customer ID"
      />
    </div>
  )
}
