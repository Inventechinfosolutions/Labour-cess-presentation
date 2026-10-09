import { useState } from "react"
import { ArrowLeft, ArrowRight, BadgeCheck, IdCard, Smartphone, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveRegisteredEmployee } from "@/services/employeeRegistrationStorage"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EmployeeRegistrationFormProps {
  onCancel: () => void
  onRegistered: (mobile: string) => void
}

export function EmployeeRegistrationForm({ onCancel, onRegistered }: EmployeeRegistrationFormProps) {
  const [mobile, setMobile] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [loading, setLoading] = useState(false)

  const normalizedMobile = mobile.replace(/\D/g, "").slice(0, 10)
  const isMobileComplete = normalizedMobile.length === 10
  const isEmployeeIdValid = employeeId.trim().length >= 4

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMobileComplete || !isEmployeeIdValid) return

    setLoading(true)
    window.setTimeout(() => {
      const result = saveRegisteredEmployee(normalizedMobile, employeeId)
      setLoading(false)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success("Registration successful. Sign in with OTP to continue.")
      onRegistered(result.employee.mobile)
    }, 500)
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/15 to-primary/15 text-primary ring-1 ring-primary/15">
          <UserPlus className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Employee registration</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Register with your mobile number and government employee ID.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="register-mobile"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Mobile number
          </Label>
          <div className="group/field relative">
            <Smartphone
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
              aria-hidden
            />
            <Input
              id="register-mobile"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              className="h-11 pl-9 transition-shadow focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="register-employee-id"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Employee ID
          </Label>
          <div className="group/field relative">
            <IdCard
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
              aria-hidden
            />
            <Input
              id="register-employee-id"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              placeholder="e.g. GOV/EMP-12345"
              autoComplete="off"
              className="h-11 pl-9 uppercase transition-shadow focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Use the ID issued by your department or ministry.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <BadgeCheck className="size-3.5 text-primary" aria-hidden />
            After registration
          </span>
          <p className="mt-1 leading-relaxed">
            Sign in with the same mobile number. OTP will be sent for verification.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || !isMobileComplete || !isEmployeeIdValid}
          size="lg"
          className={cn(
            "group/cta relative mt-2 h-12 w-full overflow-hidden rounded-xl text-[0.95rem] shadow-lg shadow-primary/25",
            loading && "opacity-80",
          )}
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {loading ? "Registering…" : "Complete registration"}
            {!loading && (
              <ArrowRight
                className="size-4 transition-transform group-hover/cta:translate-x-0.5"
                aria-hidden
              />
            )}
          </span>
        </Button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to sign in
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Protected under the Information Technology Act, 2000
      </p>
    </div>
  )
}
