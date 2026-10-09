import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Clock,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react"
import { gsap } from "@/animations/gsap"
import { LoginAuthCard } from "@/components/login/LoginAuthCard"
import { EmployeeRegistrationForm } from "@/components/login/EmployeeRegistrationForm"
import { LoginBackdrop } from "@/components/login/LoginBackdrop"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { VideoSoundToggle } from "@/components/shared/VideoSoundToggle"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"
import { useVideoSound } from "@/hooks/useVideoSound"
import { toast } from "sonner"

type LoginMode = "idle" | "employee" | "admin"
type DemoAccount = "employee" | "admin"

const DEMO_EMPLOYEE_MOBILE = "9999999999"
const DEMO_ADMIN_USER = "admin"
const DEMO_ADMIN_PASS = "admin123"

function detectLoginMode(value: string): LoginMode {
  const trimmed = value.trim()
  if (!trimmed) return "idle"
  if (/^\d+$/.test(trimmed)) return "employee"
  return "admin"
}

const DEMO_TILES = [
  {
    id: "employee" as const,
    label: "Employee",
    sub: "Book & manage stays",
    Icon: User,
    tile: "bg-gradient-to-br from-sky-100 to-sky-200/70 dark:from-sky-500/15 dark:to-sky-600/10",
    iconColor: "text-sky-600 dark:text-sky-300",
  },
  {
    id: "admin" as const,
    label: "Super Admin",
    sub: "Manage all sites",
    Icon: ShieldCheck,
    tile: "bg-gradient-to-br from-violet-100 to-violet-200/70 dark:from-violet-500/15 dark:to-violet-600/10",
    iconColor: "text-violet-600 dark:text-violet-300",
  },
]

export function LoginPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const cardWrapRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState<DemoAccount | null>(null)
  const [showRegister, setShowRegister] = useState(false)

  const { loginEmployee, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const { videoRef, isSoundOn, toggleSound } = useVideoSound()

  const loginMode = useMemo(() => detectLoginMode(identifier), [identifier])
  const mobile = identifier.replace(/\D/g, "").slice(0, 10)
  const isMobileComplete = mobile.length === 10

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from("[data-hero-brand]", { y: -12, autoAlpha: 0, duration: 0.28 })
        .from("[data-hero-flag]", { y: 8, autoAlpha: 0, duration: 0.22 }, "-=0.18")
        .from("[data-hero-eyebrow]", { y: 8, autoAlpha: 0, duration: 0.2 }, "-=0.16")
        .from("[data-hero-headline]", { y: 16, autoAlpha: 0, duration: 0.38 }, "-=0.14")
        .from("[data-hero-tagline]", { y: 10, autoAlpha: 0, duration: 0.26 }, "-=0.22")
        .from("[data-hero-pill]", { y: 8, autoAlpha: 0, duration: 0.24, stagger: 0.04 }, "-=0.2")

      const card = cardWrapRef.current
      if (card) {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 16, scale: 0.99 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(card, { clearProps: "opacity,visibility,transform" })
            },
          },
        )
      }
    }, heroRef)
    return () => ctx.revert()
  }, [])

  useLayoutEffect(() => {
    const el = cardWrapRef.current
    if (!el) return
    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty("--spot-x", `${x}%`)
      el.style.setProperty("--spot-y", `${y}%`)
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const root = formRef.current
      if (!root) return
      const fields = root.querySelectorAll<HTMLElement>("[data-anim-field]")
      if (!fields.length) return
      gsap.fromTo(
        fields,
        { y: 8, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.32,
          ease: "power3.out",
          stagger: 0.03,
          onComplete: () => {
            gsap.set(fields, { clearProps: "opacity,visibility,transform" })
          },
        },
      )
    }, formRef)
    return () => ctx.revert()
  }, [loginMode, otpSent])

  const handleIdentifierChange = (value: string) => {
    if (/^\d*$/.test(value) || value.length === 0) {
      setIdentifier(value.replace(/\D/g, "").slice(0, 10))
      setActiveDemo(value === DEMO_EMPLOYEE_MOBILE ? "employee" : null)
    } else {
      const next = value.replace(/\s/g, "").toLowerCase()
      setIdentifier(next)
      setActiveDemo(next === DEMO_ADMIN_USER ? "admin" : null)
    }
    setOtpSent(false)
    setOtp("")
    if (!/^\d+$/.test(value.replace(/\s/g, ""))) setPassword("")
  }

  const fillDemo = (account: DemoAccount) => {
    setActiveDemo(account)
    setOtpSent(false)
    setOtp("")
    if (account === "employee") {
      setIdentifier(DEMO_EMPLOYEE_MOBILE)
      setPassword("")
    } else {
      setIdentifier(DEMO_ADMIN_USER)
      setPassword(DEMO_ADMIN_PASS)
    }
  }

  const handleSendOtp = () => {
    if (!isMobileComplete) {
      toast.error("Please enter a valid 10-digit mobile number")
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOtpSent(true)
      toast.success("OTP sent to your registered mobile number")
    }, 800)
  }

  const handleEmployeeLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const success = loginEmployee(mobile, otp)
      setLoading(false)
      if (success) {
        toast.success("Welcome! Login successful")
        navigate("/employee")
      } else {
        toast.error("Invalid OTP or unregistered mobile. Register first or use demo OTP: 123456")
      }
    }, 600)
  }

  const handleAdminLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const success = loginAdmin(identifier.trim(), password)
      setLoading(false)
      if (success) {
        toast.success("Welcome, Super Admin!")
        navigate("/admin")
      } else {
        toast.error("Invalid credentials. Demo: admin / admin123")
      }
    }, 600)
  }

  const handleRegistered = (registeredMobile: string) => {
    setIdentifier(registeredMobile)
    setActiveDemo(null)
    setOtpSent(false)
    setOtp("")
    setPassword("")
    setShowRegister(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginMode === "employee") {
      if (!otpSent) handleSendOtp()
      else if (otp.length === 6) handleEmployeeLogin()
    } else if (loginMode === "admin") {
      handleAdminLogin()
    }
  }

  const submitLabel =
    loading
      ? "Please wait…"
      : loginMode === "employee"
        ? otpSent
          ? "Verify & Sign In"
          : "Send OTP"
        : "Sign in to portal"

  const submitDisabled =
    loading ||
    loginMode === "idle" ||
    (loginMode === "employee" && !isMobileComplete) ||
    (loginMode === "employee" && otpSent && otp.length < 6) ||
    (loginMode === "admin" && !password)

  return (
    <div ref={heroRef} className="relative min-h-svh overflow-hidden text-primary-foreground">
      <LoginBackdrop videoRef={videoRef} isSoundOn={isSoundOn} />

      <VideoSoundToggle
        isSoundOn={isSoundOn}
        onToggle={toggleSound}
        className="absolute bottom-6 right-6 z-30 sm:bottom-8 sm:right-8"
      />

      <Link
        to="/"
        className="absolute right-6 top-6 z-30 inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm text-primary-foreground shadow-sm backdrop-blur-sm transition hover:bg-primary-foreground/15"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="relative z-10 grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
        {/* Hero */}
        <div className="flex flex-col justify-between gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <Link
            to="/"
            data-hero-brand
            className="self-start transition-opacity hover:opacity-90"
          >
            <BrandLogo
              size="lg"
              title="Guest House Booking"
              subtitle="Govt of India"
              markClassName="shadow-lg shadow-black/20"
              titleClassName="text-base text-primary-foreground"
              subtitleClassName="text-[11px] font-medium uppercase tracking-[0.16em] text-primary-foreground/65"
            />
          </Link>

          <div className="max-w-2xl">
            <div
              data-hero-flag
              className="flex h-3 w-32 overflow-hidden rounded-full sm:h-3.5 sm:w-40"
              aria-label="India"
            >
              <span className="flex-1 bg-[#FF9933]" />
              <span className="flex-1 bg-white/95" />
              <span className="flex-1 bg-[#138808]" />
            </div>

            <div
              data-hero-eyebrow
              className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-primary-foreground/70"
            >
              National Accommodation System
            </div>

            <h1
              data-hero-headline
              className="mt-3 text-balance text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-primary-foreground [text-shadow:0_2px_36px_color-mix(in_oklch,var(--foreground)_45%,transparent),0_1px_2px_color-mix(in_oklch,var(--foreground)_35%,transparent)]"
            >
              Sign in to book
              <br />
              government guest houses.
            </h1>

            <p
              data-hero-tagline
              className="mt-6 max-w-md text-base leading-relaxed text-primary-foreground/85 sm:text-[17px]"
            >
              One portal for employees and administrators — book rooms, manage
              occupancy, and access digital keys across India.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { Icon: Clock, text: "Instant booking", tint: "text-amber-600 dark:text-amber-400" },
                { Icon: Shield, text: "OTP verified", tint: "text-emerald-600 dark:text-emerald-400" },
                { Icon: Globe, text: "Pan-India", tint: "text-sky-600 dark:text-sky-400" },
                { Icon: KeyRound, text: "Digital access", tint: "text-violet-600 dark:text-violet-400" },
              ].map((p) => (
                <span
                  key={p.text}
                  data-hero-pill
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/90 backdrop-blur-sm"
                >
                  <p.Icon className="size-3.5 text-primary-foreground/80" aria-hidden />
                  {p.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="relative flex items-center justify-center px-4 py-10 text-foreground sm:px-8">
          <div ref={cardWrapRef} className="relative w-full max-w-md">
            <div
              aria-hidden
              className="absolute inset-0 rounded-3xl border border-border/40 bg-background/40 shadow-xl shadow-primary/5 backdrop-blur-md dark:bg-card/25"
              style={{ transform: "rotate(2.4deg) translate(10px, -10px)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-3xl border border-border/40 bg-background/40 shadow-lg shadow-primary/5 backdrop-blur-md dark:bg-card/20"
              style={{ transform: "rotate(-1.8deg) translate(-10px, 10px)" }}
            />

            <div className="relative mb-6 lg:hidden">
              <BrandLogo
                size="md"
                title="Guest House Booking"
                subtitle="Govt of India"
              />
            </div>

            <div className="login-card-flip [perspective:1400px]">
              <div
                className={cn(
                  "relative min-h-[34rem] transition-transform duration-700 [transform-style:preserve-3d]",
                  showRegister && "[transform:rotateY(180deg)]",
                )}
              >
                <LoginAuthCard className="[backface-visibility:hidden]">
                  <div ref={formRef}>
                <div data-anim-field className="mb-6 flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-chart-2/15 text-primary ring-1 ring-primary/15">
                    <ShieldCheck className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Mobile for employees · username for administrators.
                    </p>
                  </div>
                </div>

                <div data-anim-field className="mb-6">
                  <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Quick demo
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_TILES.map((t) => {
                      const isActive = activeDemo === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => fillDemo(t.id)}
                          className={cn(
                            "group/role relative rounded-xl border bg-card/70 p-3 text-left transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive
                              ? "border-primary/45 bg-primary/[0.04] shadow-md shadow-primary/10 ring-2 ring-primary/30"
                              : "border-border/70 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/[0.025] hover:shadow-sm",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg ring-1 ring-foreground/[0.04]",
                              t.tile,
                            )}
                          >
                            <t.Icon className={cn("size-4.5", t.iconColor)} strokeWidth={2.2} aria-hidden />
                          </div>
                          <div className="mt-2.5 text-[13px] font-semibold leading-tight text-foreground">
                            {t.label}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                            {t.sub}
                          </div>
                          {isActive && (
                            <CircleCheck
                              className="absolute right-2 top-2 size-4 text-primary"
                              strokeWidth={2.4}
                              aria-hidden
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div data-anim-field className="space-y-1.5">
                    <Label
                      htmlFor="identifier"
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Mobile or username
                    </Label>
                    <div className="group/field relative">
                      {loginMode === "employee" ? (
                        <Smartphone
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
                          aria-hidden
                        />
                      ) : loginMode === "admin" ? (
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
                          aria-hidden
                        />
                      ) : null}
                      <Input
                        id="identifier"
                        value={identifier}
                        onChange={(e) => handleIdentifierChange(e.target.value)}
                        placeholder="9999999999 or admin"
                        autoComplete="username"
                        className={cn(
                          "h-11 transition-shadow focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]",
                          loginMode !== "idle" && "pl-9",
                        )}
                      />
                    </div>
                    {loginMode === "employee" && !isMobileComplete && (
                      <p className="text-[11px] text-muted-foreground">
                        Enter your 10-digit registered mobile number
                      </p>
                    )}
                    {loginMode === "admin" && (
                      <p className="text-[11px] text-muted-foreground">Signing in as administrator</p>
                    )}
                  </div>

                  {loginMode === "admin" && (
                    <div data-anim-field className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password"
                          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                        >
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => toast.info("Contact your administrator to reset access.")}
                          className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="group/field relative">
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
                          aria-hidden
                        />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          className="h-11 pl-9 pr-10 transition-shadow focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {loginMode === "employee" && otpSent && (
                    <div data-anim-field className="space-y-3">
                      <Label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        One-time password
                      </Label>
                      <div className="flex justify-center rounded-xl border border-border/60 bg-muted/30 py-5">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <InputOTPSlot key={i} index={i} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp("")
                        }}
                        className="w-full text-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        Change mobile number
                      </button>
                      <p className="text-center text-[11px] text-muted-foreground">
                        Demo OTP:{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">123456</code>
                      </p>
                    </div>
                  )}

                  {loginMode !== "employee" || !otpSent ? (
                    <label
                      data-anim-field
                      className="flex cursor-pointer items-center gap-2.5 select-none pt-1 text-sm text-foreground/85"
                    >
                      <span
                        className={cn(
                          "relative flex size-4 items-center justify-center rounded border transition",
                          keepSignedIn
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background",
                        )}
                      >
                        {keepSignedIn && <CircleCheck className="size-3.5" strokeWidth={3} />}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                      />
                      Keep me signed in on this device
                    </label>
                  ) : null}

                  <Button
                    data-anim-field
                    type="submit"
                    disabled={submitDisabled}
                    size="lg"
                    className="group/cta relative mt-2 h-12 w-full overflow-hidden rounded-xl text-[0.95rem] shadow-lg shadow-primary/25"
                  >
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {submitLabel}
                      {!loading && (
                        <ArrowRight
                          className="size-4 transition-transform group-hover/cta:translate-x-0.5"
                          aria-hidden
                        />
                      )}
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1100ms] ease-out group-hover/cta:translate-x-full"
                    />
                  </Button>

                  {loginMode !== "admin" && (
                    <p data-anim-field className="text-center text-sm text-muted-foreground">
                      New government employee?{" "}
                      <button
                        type="button"
                        onClick={() => setShowRegister(true)}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        Register here
                      </button>
                    </p>
                  )}
                </form>

                <p data-anim-field className="mt-6 text-center text-xs text-muted-foreground">
                  Protected under the Information Technology Act, 2000
                </p>
                  </div>
                </LoginAuthCard>

                <LoginAuthCard className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <EmployeeRegistrationForm
                    onCancel={() => setShowRegister(false)}
                    onRegistered={handleRegistered}
                  />
                </LoginAuthCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
