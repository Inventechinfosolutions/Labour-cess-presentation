import { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Bed, CheckCircle, LogIn } from "lucide-react"
import { gsap } from "@/animations/gsap"
import { fetchBookings } from "@/services/api"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/useGsap"

const steps = [
  { id: "booked", label: "Booked", icon: CheckCircle },
  { id: "checked_in", label: "Checked In", icon: LogIn },
  { id: "active", label: "Active Stay", icon: Bed },
] as const

type StepId = (typeof steps)[number]["id"]

export function CheckInPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const pageRef = usePageTransition()
  const [currentStep, setCurrentStep] = useState<StepId>("booked")

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  })

  const booking = bookings?.find((b) => b.id === bookingId) ?? bookings?.[0]
  const stepIndex = steps.findIndex((s) => s.id === currentStep)

  const advanceStep = () => {
    const next = steps[stepIndex + 1]
    if (!next) return
    setCurrentStep(next.id)
    gsap.from(`#step-${next.id}`, {
      scale: 1.2,
      duration: 0.4,
      ease: "back.out(2)",
    })
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Check-in experience"
        description={`Booking ${booking?.id ?? bookingId}`}
      />

      <Card className="mx-auto max-w-lg border-border/60">
        <CardContent className="p-8">
          <div className="relative flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div
                  id={`step-${step.id}`}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full border-2 transition-all duration-500",
                    i <= stepIndex
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-muted text-muted-foreground"
                  )}
                >
                  <step.icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    i <= stepIndex ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            ))}
            <div className="absolute left-6 right-6 top-6 h-0.5 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <h3 className="text-xl font-semibold">{steps[stepIndex].label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentStep === "booked" && "Your booking is confirmed. Proceed to check-in at the guest house."}
              {currentStep === "checked_in" && "You have checked in. Your room is ready."}
              {currentStep === "active" && "Enjoy your stay! Digital access is active."}
            </p>
          </div>

          {stepIndex < steps.length - 1 && (
            <Button className="mt-8 w-full" onClick={advanceStep}>
              {currentStep === "booked" ? "Simulate Check-in" : "Activate Stay"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
