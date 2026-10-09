import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  FileBarChart,
  FileSpreadsheet,
  Hotel,
  MapPin,
  Users,
} from "lucide-react"
import {
  AdminFormSection,
  AdminSheetContent,
  AdminSheetShell,
  AdminSheetSubmitButton,
  adminFieldInputClass,
  adminFieldSelectClass,
} from "@/components/admin/AdminSheetPanel"
import { DataTable } from "@/components/admin/DataTable"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { PaginatedResult } from "@/types/admin"

type ReportItem = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  tone: string
}

const REPORTS: ReportItem[] = [
  {
    id: "revenue",
    title: "Revenue Reports",
    description: "Daily, weekly, monthly revenue breakdown",
    icon: CreditCard,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "occupancy",
    title: "Occupancy Reports",
    description: "Site and building utilization metrics",
    icon: Hotel,
    tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  {
    id: "booking",
    title: "Booking Reports",
    description: "Booking trends, cancellations, no-shows",
    icon: FileBarChart,
    tone: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
  },
  {
    id: "user",
    title: "User Reports",
    description: "Department-wise usage and verification",
    icon: Users,
    tone: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  },
  {
    id: "site",
    title: "Site Reports",
    description: "Performance across all guest house sites",
    icon: MapPin,
    tone: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
  {
    id: "building",
    title: "Building Reports",
    description: "Building-level occupancy and revenue",
    icon: Building2,
    tone: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
  },
  {
    id: "room-util",
    title: "Room Utilization",
    description: "Room type and amenity usage analysis",
    icon: Hotel,
    tone: "bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
  },
  {
    id: "payment",
    title: "Payment Reports",
    description: "Transaction success, failures, refunds",
    icon: CreditCard,
    tone: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
  },
]

const FORMAT_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" },
] as const

type ReportFormat = (typeof FORMAT_OPTIONS)[number]["value"]

const REPORTS_RESULT: PaginatedResult<ReportItem> = {
  data: REPORTS,
  total: REPORTS.length,
  page: 1,
  pageSize: REPORTS.length,
  totalPages: 1,
}

export function ReportsPage() {
  const pageRef = usePageTransition()
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [dateFrom, setDateFrom] = useState("2026-03-01")
  const [dateTo, setDateTo] = useState("2026-03-31")
  const [format, setFormat] = useState<ReportFormat>("pdf")
  const [scope, setScope] = useState("all")

  const openGenerate = (report: ReportItem) => {
    setSelectedReport(report)
    setIsComplete(false)
    setSheetOpen(true)
  }

  const handleSheetChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      setSelectedReport(null)
      setIsComplete(false)
      setIsGenerating(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedReport) return
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 1400))
    setIsGenerating(false)
    setIsComplete(true)
    toast.success(`${selectedReport.title} ready to download`)
  }

  const summaryLines = useMemo(() => {
    if (!selectedReport) return []
    return [
      `Period: ${dateFrom} → ${dateTo}`,
      `Scope: ${scope === "all" ? "All sites" : scope}`,
      `Format: ${format.toUpperCase()}`,
      `Records: ${(1200 + selectedReport.id.length * 137).toLocaleString("en-IN")}`,
    ]
  }, [selectedReport, dateFrom, dateTo, scope, format])

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Reports"
        description="Generate and download insights about bookings, revenue, and occupancy"
        action={<ExportMenu label="Export all" />}
      />

      <DataTable<ReportItem>
        columns={[
          {
            key: "title",
            header: "Report",
            cell: (r) => {
              const Icon = r.icon
              return (
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", r.tone)}>
                    <Icon className="size-4" strokeWidth={1.75} />
                  </div>
                  <span className="font-medium">{r.title}</span>
                </div>
              )
            },
          },
          {
            key: "description",
            header: "Description",
            cell: (r) => <span className="text-muted-foreground">{r.description}</span>,
          },
          {
            key: "actions",
            header: "",
            className: "w-32 text-right",
            cell: (r) => (
              <Button size="sm" className="rounded-full px-4" onClick={() => openGenerate(r)}>
                Generate
              </Button>
            ),
          },
        ]}
        result={REPORTS_RESULT}
        page={1}
        onPageChange={() => {}}
      />

      <Sheet open={sheetOpen} onOpenChange={handleSheetChange}>
        <AdminSheetContent size="sm">
          {selectedReport && (
            <AdminSheetShell
              icon={selectedReport.icon}
              title={isComplete ? "Report ready" : selectedReport.title}
              description={
                isComplete
                  ? "Your report was generated successfully. Download or share it with your team."
                  : "Choose a date range and export format for this report."
              }
              footer={
                isComplete ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => handleSheetChange(false)}
                    >
                      Close
                    </Button>
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => toast.success("Download started (demo)")}
                    >
                      <Download className="mr-1.5 size-4" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <AdminSheetSubmitButton
                    loading={isGenerating}
                    disabled={isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? "Generating..." : "Generate report"}
                  </AdminSheetSubmitButton>
                )
              }
            >
              {isComplete ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/80 px-6 py-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <CheckCircle2 className="size-7" strokeWidth={1.75} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">{selectedReport.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Generated just now · {format.toUpperCase()}</p>
                  </div>
                  <AdminFormSection title="Summary">
                    <ul className="space-y-2 rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm">
                      {summaryLines.map((line) => (
                        <li key={line} className="text-muted-foreground">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </AdminFormSection>
                </div>
              ) : (
                <div className="space-y-5">
                  <AdminFormSection title="Date range">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">From</Label>
                        <Input
                          type="date"
                          className={adminFieldInputClass}
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">To</Label>
                        <Input
                          type="date"
                          className={adminFieldInputClass}
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                        />
                      </div>
                    </div>
                  </AdminFormSection>

                  <AdminFormSection title="Scope">
                    <Select value={scope} onValueChange={setScope}>
                      <SelectTrigger className={adminFieldSelectClass}>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All sites</SelectItem>
                        <SelectItem value="north">North region</SelectItem>
                        <SelectItem value="south">South region</SelectItem>
                        <SelectItem value="metro">Metro cities</SelectItem>
                      </SelectContent>
                    </Select>
                  </AdminFormSection>

                  <AdminFormSection title="Export format">
                    <div className="flex flex-wrap gap-2">
                      {FORMAT_OPTIONS.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFormat(f.value)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all",
                            format === f.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {f.value === "xlsx" && <FileSpreadsheet className="size-3.5" />}
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </AdminFormSection>
                </div>
              )}
            </AdminSheetShell>
          )}
        </AdminSheetContent>
      </Sheet>
    </div>
  )
}
