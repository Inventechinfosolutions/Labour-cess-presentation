import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarRange,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Loader2,
  MapPin,
  Shield,
  Sparkles,
  User,
  Wrench,
  Zap,
} from "lucide-react"
import { simulateAction } from "@/services/adminApi"
import { AdminHeroMetric } from "@/components/admin/AdminAnalyticsUI"
import {
  AdminFormSection,
  adminFieldInputClass,
  adminFieldSelectClass,
} from "@/components/admin/AdminSheetPanel"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import { cn } from "@/lib/utils"
import type { OverrideReason } from "@/types/admin"

const STEPS = ["Scenario", "Guest details", "Action", "Review"] as const

const USE_CASES: {
  id: OverrideReason
  label: string
  icon: LucideIcon
  description: string
  tone: string
}[] = [
  {
    id: "vip_guest",
    label: "VIP Guest",
    icon: Crown,
    description: "Senior officials and priority visitors",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  },
  {
    id: "delegation",
    label: "Delegation",
    icon: Shield,
    description: "Official group visits and delegations",
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: Zap,
    description: "Immediate accommodation requirement",
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  },
  {
    id: "inspection",
    label: "Inspection",
    icon: AlertTriangle,
    description: "Audit and inspection team stays",
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  },
  {
    id: "special_event",
    label: "Special event",
    icon: Sparkles,
    description: "Summits, conferences, and events",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
]

const OVERRIDE_ACTIONS: {
  id: string
  label: string
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    id: "force",
    label: "Force allocation",
    description: "Assign a room even when fully booked",
    icon: BedDouble,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "move",
    label: "Move existing guest",
    description: "Relocate a current guest to free a room",
    icon: ArrowUpRight,
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  },
  {
    id: "upgrade",
    label: "Upgrade room",
    description: "Move guest to a higher category at no charge",
    icon: Sparkles,
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  },
  {
    id: "bypass",
    label: "Bypass restrictions",
    description: "Override booking rules and eligibility checks",
    icon: Shield,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  },
  {
    id: "priority",
    label: "Priority allocation",
    description: "Queue jump for urgent official stays",
    icon: Zap,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
]

const SITES = [
  "Bengaluru Guest House",
  "Mysuru Guest House",
  "Belagavi Guest House",
  "Mangaluru Guest House",
  "Ballari Guest House",
]

const RECENT_OVERRIDES = [
  {
    id: "OVR-1042",
    guest: "Dr. Rajesh Kumar",
    action: "Priority allocation",
    reason: "VIP Guest",
    site: "Belagavi Guest House",
    status: "completed" as const,
    time: "2 hours ago",
  },
  {
    id: "OVR-1041",
    guest: "Ministry Delegation",
    action: "Force allocation",
    reason: "Delegation",
    site: "Mysuru Guest House",
    status: "completed" as const,
    time: "Yesterday",
  },
  {
    id: "OVR-1040",
    guest: "Inspection Team",
    action: "Bypass restrictions",
    reason: "Inspection",
    site: "Mangaluru Guest House",
    status: "pending" as const,
    time: "Yesterday",
  },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="override-steps">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <div key={label} className="override-step">
            <div
              className={cn(
                "override-step-dot",
                done && "override-step-dot--done",
                active && "override-step-dot--active"
              )}
            >
              {done ? <Check className="size-3.5" /> : <span>{index + 1}</span>}
            </div>
            <span
              className={cn(
                "override-step-label",
                (done || active) && "text-foreground"
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <div className={cn("override-step-line", done && "override-step-line--done")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  )
}

export function BookingOverridePage() {
  const pageRef = usePageTransition()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [reason, setReason] = useState<OverrideReason>("vip_guest")
  const [action, setAction] = useState("force")
  const [guestName, setGuestName] = useState("")
  const [site, setSite] = useState("")
  const [room, setRoom] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [justification, setJustification] = useState("")

  const selectedReason = USE_CASES.find((u) => u.id === reason)
  const selectedAction = OVERRIDE_ACTIONS.find((a) => a.id === action)

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(reason)
    if (step === 1) return guestName.trim() && site && checkIn && checkOut
    if (step === 2) return Boolean(action)
    if (step === 3) return justification.trim().length >= 12
    return false
  }, [step, reason, guestName, site, checkIn, checkOut, action, justification])

  const handleSubmit = async () => {
    if (!selectedAction) return
    setLoading(true)
    await simulateAction(selectedAction.label)
    setLoading(false)
    toast.success(`Override ${selectedAction.label.toLowerCase()} submitted (demo)`)
    setStep(0)
    setGuestName("")
    setSite("")
    setRoom("")
    setCheckIn("")
    setCheckOut("")
    setJustification("")
    setAction("force")
    setReason("vip_guest")
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Booking Override"
        description="Guided workflows for VIP, delegation, and emergency room allocation"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <AdminHeroMetric
          label="Active today"
          value="3"
          hint="awaiting completion"
          icon={Clock}
          iconTone="amber"
        />
        <AdminHeroMetric
          label="Pending approval"
          value="1"
          hint="requires admin sign-off"
          icon={FileText}
          iconTone="violet"
        />
        <AdminHeroMetric
          label="Resolved this week"
          value="12"
          trend="+4"
          trendUp
          hint="vs last week"
          icon={CheckCircle2}
          iconTone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="admin-card overflow-hidden">
          <div className="border-b border-border/40 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              <h2 className="font-semibold">New override request</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete each step to submit a controlled allocation override
            </p>
            <div className="mt-5">
              <StepIndicator current={step} />
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the scenario that best matches this override request.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {USE_CASES.map((useCase) => {
                    const selected = reason === useCase.id
                    const Icon = useCase.icon
                    return (
                      <button
                        key={useCase.id}
                        type="button"
                        onClick={() => setReason(useCase.id)}
                        className={cn(
                          "override-scenario-card text-left",
                          selected && "override-scenario-card--selected"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", useCase.tone)}>
                            <Icon className="size-4" strokeWidth={1.75} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold">{useCase.label}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{useCase.description}</p>
                          </div>
                          {selected && (
                            <span className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3.5" />
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <AdminFormSection title="Guest information">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="guest-name">Guest or delegation name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="guest-name"
                          className={cn(adminFieldInputClass, "pl-10")}
                          placeholder="Official name or group title"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Target site</Label>
                      <Select value={site} onValueChange={setSite}>
                        <SelectTrigger className={adminFieldSelectClass}>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {SITES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room">Preferred room</Label>
                      <div className="relative">
                        <BedDouble className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="room"
                          className={cn(adminFieldInputClass, "pl-10")}
                          placeholder="Room number or type (optional)"
                          value={room}
                          onChange={(e) => setRoom(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="Stay dates">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">Check-in</Label>
                      <div className="relative">
                        <CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="check-in"
                          type="date"
                          className={cn(adminFieldInputClass, "pl-10")}
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check-out">Check-out</Label>
                      <div className="relative">
                        <CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="check-out"
                          type="date"
                          className={cn(adminFieldInputClass, "pl-10")}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </AdminFormSection>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose the override action to apply. Only one action can be used per request.
                </p>
                <div className="grid gap-3">
                  {OVERRIDE_ACTIONS.map((item) => {
                    const selected = action === item.id
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAction(item.id)}
                        className={cn(
                          "override-action-card text-left",
                          selected && "override-action-card--selected"
                        )}
                      >
                        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", item.tone)}>
                          <Icon className="size-4" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-border",
                            selected && "border-primary bg-primary"
                          )}
                        >
                          {selected && <Check className="size-3 text-primary-foreground" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <AdminFormSection title="Justification">
                  <div className="space-y-2">
                    <Label htmlFor="justification">Official reason for override</Label>
                    <Textarea
                      id="justification"
                      className="min-h-[120px] rounded-xl border-border/60 shadow-sm focus-visible:ring-0"
                      placeholder="Provide a clear justification for audit and compliance (minimum 12 characters)..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {justification.length}/12 characters minimum
                    </p>
                  </div>
                </AdminFormSection>

                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="flex gap-3">
                    <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Compliance notice
                      </p>
                      <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/80">
                        This override will be logged in audit trails and may require secondary approval
                        for delegation and emergency scenarios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button
              variant="ghost"
              className="rounded-full"
              disabled={step === 0 || loading}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="mr-1.5 size-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                className="rounded-full px-6"
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            ) : (
              <Button
                className="rounded-full px-6"
                disabled={!canContinue || loading}
                onClick={handleSubmit}
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Submit override
              </Button>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="admin-card p-5">
            <h3 className="font-semibold">Request summary</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Live preview of your override request
            </p>
            <div className="mt-4 space-y-3 rounded-xl bg-muted/40 p-4">
              <SummaryRow label="Scenario" value={selectedReason?.label ?? ""} />
              <SummaryRow label="Guest" value={guestName} />
              <SummaryRow label="Site" value={site} />
              <SummaryRow label="Room" value={room || "Any available"} />
              <SummaryRow
                label="Stay"
                value={checkIn && checkOut ? `${checkIn} → ${checkOut}` : ""}
              />
              <SummaryRow label="Action" value={selectedAction?.label ?? ""} />
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="font-semibold">Policy guardrails</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
                All overrides require written justification
              </li>
              <li className="flex gap-2">
                <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
                Site capacity checks run before force allocation
              </li>
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                Guest movement notifies the displaced booking
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Recent overrides</h2>
            <p className="text-sm text-muted-foreground">Latest allocation overrides across all sites</p>
          </div>
        </div>

        <div className="admin-card divide-y divide-border/40">
          {RECENT_OVERRIDES.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.guest}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                      item.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.action} · {item.reason} · {item.site}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono text-xs">{item.id}</span>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
