import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Building2,
  CalendarCheck,
  Check,
  CreditCard,
  Globe,
  ImageIcon,
  Landmark,
  Mail,
  Moon,
  Phone,
  Receipt,
  Shield,
  Smartphone,
  Upload,
  Wallet,
} from "lucide-react"
import { AdminFormSection } from "@/components/admin/AdminSheetPanel"
import { BrandMark } from "@/components/shared/BrandLogo"
import { adminFieldInputClass } from "@/components/admin/AdminSheetPanel"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import { cn } from "@/lib/utils"

type SettingsSection = "general" | "booking" | "payment"

const SECTIONS: {
  id: SettingsSection
  label: string
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    id: "general",
    label: "General",
    description: "Branding, contact, and appearance",
    icon: Building2,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "booking",
    label: "Booking",
    description: "Stay limits and cancellation rules",
    icon: CalendarCheck,
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  },
  {
    id: "payment",
    label: "Payments",
    description: "Tax, gateway, and refund policy",
    icon: CreditCard,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
]

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", description: "Instant UPI transfers", icon: Smartphone },
  { id: "card", label: "Cards", description: "Credit and debit cards", icon: CreditCard },
  { id: "netbanking", label: "Net banking", description: "Government bank transfers", icon: Landmark },
  { id: "wallet", label: "Wallet", description: "Prepaid employee wallet", icon: Wallet },
] as const

function SettingsToggleRow({
  icon: Icon,
  title,
  description,
  defaultChecked = false,
}: {
  icon: LucideIcon
  title: string
  description: string
  defaultChecked?: boolean
}) {
  const [enabled, setEnabled] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-background px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </div>
  )
}

function PolicyMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-[var(--shadow-airbnb)]">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export function SettingsPage() {
  const pageRef = usePageTransition()
  const [section, setSection] = useState<SettingsSection>("general")
  const [appName, setAppName] = useState("GovGuestHouse Platform")
  const [contactEmail, setContactEmail] = useState("admin@guesthouse.gov.in")
  const [contactPhone, setContactPhone] = useState("+91 11 2345 6789")

  const activeSection = SECTIONS.find((s) => s.id === section)!
  const save = (label: string) => toast.success(`${label} saved (demo)`)

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Settings"
        description="Configure branding, booking policies, and payment rules for your guest houses"
      />

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)]">
        <nav className="admin-card flex flex-row gap-1 overflow-x-auto p-1.5 lg:flex-col lg:overflow-visible">
          {SECTIONS.map((item) => {
            const Icon = item.icon
            const active = section === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "flex min-w-[10.5rem] flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors lg:min-w-0 lg:flex-none",
                  active
                    ? "bg-primary/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", item.tone)}>
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="hidden text-xs text-muted-foreground lg:block">{item.description}</span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                activeSection.tone
              )}
            >
              <activeSection.icon className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{activeSection.label}</h2>
              <p className="text-sm text-muted-foreground">{activeSection.description}</p>
            </div>
          </div>

          {section === "general" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
              <div className="space-y-5">
                <div className="admin-card overflow-hidden">
                  <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/8 via-muted/30 to-background sm:h-48">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-border bg-background/90 shadow-sm">
                        <ImageIcon className="size-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Brand assets</p>
                      <p className="max-w-xs text-xs text-muted-foreground">
                        Logo and banner shown on employee portal and booking confirmations
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-4 right-4 rounded-full bg-background/95 backdrop-blur-sm"
                      onClick={() => save("Brand image")}
                    >
                      <Upload className="mr-1.5 size-3.5" />
                      Upload
                    </Button>
                  </div>
                </div>

                <AdminFormSection title="Platform identity">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="app-name">Application name</Label>
                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="app-name"
                          className={cn(adminFieldInputClass, "pl-10")}
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Contact email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contact-email"
                          className={cn(adminFieldInputClass, "pl-10")}
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Contact phone</Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contact-phone"
                          className={cn(adminFieldInputClass, "pl-10")}
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </AdminFormSection>

                <AdminFormSection title="Preferences">
                  <SettingsToggleRow
                    icon={Moon}
                    title="Dark mode by default"
                    description="New admin sessions start in dark theme"
                    defaultChecked
                  />
                  <SettingsToggleRow
                    icon={Shield}
                    title="Require 2FA for admins"
                    description="Extra verification on sensitive actions"
                  />
                </AdminFormSection>

                <Button className="rounded-full px-6" onClick={() => save("General settings")}>
                  Save general settings
                </Button>
              </div>

              <aside className="admin-card h-fit p-5 xl:sticky xl:top-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-border/50">
                  <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-muted/30" />
                  <div className="space-y-2 p-4">
                    <BrandMark size="md" />
                    <p className="font-semibold leading-tight">{appName}</p>
                    <p className="text-xs text-muted-foreground">{contactEmail}</p>
                    <p className="text-xs text-muted-foreground">{contactPhone}</p>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {section === "booking" && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <PolicyMetric label="Max stay" value="30 nights" hint="Per booking limit" />
                <PolicyMetric label="Advance window" value="90 days" hint="How far ahead guests can book" />
                <PolicyMetric label="Cancellation" value="48 hrs" hint="Free cancel before check-in" />
              </div>

              <AdminFormSection title="Stay limits">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="max-stay">Maximum stay (nights)</Label>
                    <Input id="max-stay" className={adminFieldInputClass} type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advance-window">Advance booking window (days)</Label>
                    <Input id="advance-window" className={adminFieldInputClass} type="number" defaultValue="90" />
                  </div>
                </div>
              </AdminFormSection>

              <AdminFormSection title="Policies">
                <div className="space-y-2">
                  <Label htmlFor="cancel-policy">Cancellation policy</Label>
                  <Textarea
                    id="cancel-policy"
                    className="min-h-[100px] rounded-xl border-border/60 shadow-sm focus-visible:ring-0"
                    defaultValue="Free cancellation up to 48 hours before check-in. Later cancellations incur one night's charge."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noshow-policy">No-show policy</Label>
                  <Textarea
                    id="noshow-policy"
                    className="min-h-[100px] rounded-xl border-border/60 shadow-sm focus-visible:ring-0"
                    defaultValue="50% charge for no-show without prior cancellation. Room released after 6 PM on check-in day."
                  />
                </div>
              </AdminFormSection>

              <AdminFormSection title="Automation">
                <SettingsToggleRow
                  icon={CalendarCheck}
                  title="Auto-approve verified employees"
                  description="Skip manual review for verified government IDs"
                  defaultChecked
                />
                <SettingsToggleRow
                  icon={Check}
                  title="Send check-in reminders"
                  description="SMS and email 24 hours before arrival"
                  defaultChecked
                />
              </AdminFormSection>

              <Button className="rounded-full px-6" onClick={() => save("Booking settings")}>
                Save booking settings
              </Button>
            </div>
          )}

          {section === "payment" && (
            <div className="space-y-5">
              <AdminFormSection title="Gateway & tax">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tax">GST / tax (%)</Label>
                    <div className="relative">
                      <Receipt className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="tax" className={cn(adminFieldInputClass, "pl-10")} type="number" defaultValue="18" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gateway">Payment gateway</Label>
                    <Input id="gateway" className={adminFieldInputClass} defaultValue="Razorpay Gov" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="refund-rules">Refund rules</Label>
                    <Textarea
                      id="refund-rules"
                      className="min-h-[100px] rounded-xl border-border/60 shadow-sm focus-visible:ring-0"
                      defaultValue="Full refund within 48 hours of cancellation. Partial refunds follow the booking cancellation policy. Processing takes 5–7 business days."
                    />
                  </div>
                </div>
              </AdminFormSection>

              <AdminFormSection title="Accepted payment methods">
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <SettingsToggleRow
                      key={method.id}
                      icon={method.icon}
                      title={method.label}
                      description={method.description}
                      defaultChecked={method.id !== "wallet"}
                    />
                  ))}
                </div>
              </AdminFormSection>

              <AdminFormSection title="Compliance">
                <SettingsToggleRow
                  icon={Shield}
                  title="Generate GST invoices"
                  description="Auto-create tax invoices for every successful payment"
                  defaultChecked
                />
                <SettingsToggleRow
                  icon={Receipt}
                  title="Allow partial refunds"
                  description="Finance team can issue pro-rated refunds"
                  defaultChecked
                />
              </AdminFormSection>

              <Button className="rounded-full px-6" onClick={() => save("Payment settings")}>
                Save payment settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
