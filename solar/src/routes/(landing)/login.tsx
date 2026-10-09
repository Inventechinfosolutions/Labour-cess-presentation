import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  ChartPie,
  CircleCheck,
  Clock,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Settings2,
  ShieldCheck,
  Stamp,
  Sun,
  UserPlus,
  type LucideProps,
} from "lucide-react";
import { useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, session, rolePath } from "@/lib/hooks";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FloatingSolarWindIcons } from "./components/-FloatingSolarWindIcons";
import { LoginBirdsAndWind } from "./components/-LoginBirdsAndWind";
import { LoginHarvestCanvas } from "./components/-LoginHarvestCanvas";
import { LoginSkyAtmosphere } from "./components/-LoginSkyAtmosphere";

type LoginSearch = { mode?: "register" };

export const Route = createFileRoute("/(landing)/login")({
  validateSearch: (raw: Record<string, unknown>): LoginSearch => ({
    mode: raw.mode === "register" ? "register" : undefined,
  }),
  head: () => ({ meta: [{ title: "Login — PMIS" }] }),
  component: LoginPage,
});

const FLIP_DURATION = 0.72;

type RoleTile = {
  role: Role;
  label: string;
  sub: string;
  email: string;
  Icon: ComponentType<LucideProps>;
  /** Tile background — pastel in light mode, deeply tinted in dark. */
  tile: string;
  /** Icon stroke color. */
  iconColor: string;
};

const ROLE_TILES: RoleTile[] = [
  {
    role: "ipp",
    label: "IPP",
    sub: "Project creator",
    email: "ipp@demo.com",
    Icon: Sun,
    tile: "bg-gradient-to-br from-amber-100 to-amber-200/70 dark:from-amber-500/15 dark:to-amber-600/10",
    iconColor: "text-amber-600 dark:text-amber-300",
  },
  {
    role: "officer",
    label: "Officer",
    sub: "Field reviewer",
    email: "officer@demo.com",
    Icon: ShieldCheck,
    tile: "bg-gradient-to-br from-rose-100 to-rose-200/70 dark:from-rose-500/15 dark:to-rose-600/10",
    iconColor: "text-rose-600 dark:text-rose-300",
  },
  {
    role: "approver",
    label: "Approver",
    sub: "Sanction body",
    email: "approver@demo.com",
    Icon: Stamp,
    tile: "bg-gradient-to-br from-emerald-100 to-emerald-200/70 dark:from-emerald-500/15 dark:to-emerald-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-300",
  },
  {
    role: "management",
    label: "Management",
    sub: "Portfolio view",
    email: "management@demo.com",
    Icon: ChartPie,
    tile: "bg-gradient-to-br from-sky-100 to-sky-200/70 dark:from-sky-500/15 dark:to-sky-600/10",
    iconColor: "text-sky-600 dark:text-sky-300",
  },
  {
    role: "admin",
    label: "Admin",
    sub: "Configure rules",
    email: "admin@demo.com",
    Icon: Settings2,
    tile: "bg-gradient-to-br from-violet-100 to-violet-200/70 dark:from-violet-500/15 dark:to-violet-600/10",
    iconColor: "text-violet-600 dark:text-violet-300",
  },
];

function LoginPage() {
  const { mode } = Route.useSearch();
  const isRegister = mode === "register";
  const flipInnerRef = useRef<HTMLDivElement>(null);
  const prevRegisterRef = useRef<boolean | null>(null);
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);

  // Hero entrance.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-brand]", { y: -12, autoAlpha: 0, duration: 0.28 })
        .from("[data-hero-tag]", { y: 8, autoAlpha: 0, duration: 0.22 }, "-=0.18")
        .from("[data-hero-eyebrow]", { y: 8, autoAlpha: 0, duration: 0.2 }, "-=0.16")
        .from("[data-hero-headline]", { y: 16, autoAlpha: 0, duration: 0.38 }, "-=0.14")
        .from("[data-hero-tagline]", { y: 10, autoAlpha: 0, duration: 0.26 }, "-=0.22")
        .from("[data-hero-stat]", { y: 10, autoAlpha: 0, duration: 0.28, stagger: 0.04 }, "-=0.2")
        .from("[data-hero-pill]", { y: 8, autoAlpha: 0, duration: 0.24, stagger: 0.04 }, "-=0.2");

      const card = cardWrapRef.current;
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
              gsap.set(card, { clearProps: "opacity,visibility,transform" });
            },
          },
        );
      }
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Card-only cursor spotlight.
  useLayoutEffect(() => {
    const el = cardWrapRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--spot-x", `${x}%`);
      el.style.setProperty("--spot-y", `${y}%`);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // Login ↔ register flip.
  useLayoutEffect(() => {
    const el = flipInnerRef.current;
    if (!el) return;
    if (prevRegisterRef.current === null) {
      gsap.set(el, { rotationY: isRegister ? 180 : 0, transformPerspective: 1100 });
      prevRegisterRef.current = isRegister;
      return;
    }
    if (prevRegisterRef.current === isRegister) return;
    prevRegisterRef.current = isRegister;
    gsap.to(el, {
      rotationY: isRegister ? 180 : 0,
      transformPerspective: 1100,
      duration: FLIP_DURATION,
      ease: "power3.inOut",
    });
  }, [isRegister]);

  useLayoutEffect(() => {
    const el = flipInnerRef.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className={cn(
        "relative min-h-screen overflow-hidden bg-background",
        // Dark: keep a subtle primary wash; light mode is mostly the canvas gradient.
        "dark:bg-gradient-to-br dark:from-background dark:via-primary/[0.06] dark:to-primary/[0.12]",
      )}
    >
      {/* Windmill + field curves — natural turf gradient + grass strokes (use variant="blue" for sky). */}
      <LoginHarvestCanvas />

      {/* Sun disc, crepuscular rays, volumetric clouds */}
      <LoginSkyAtmosphere className="z-[1]" />

      {/* Birds + wind streaks (sky band) */}
      <LoginBirdsAndWind className="z-[1]" />

      {/* Soft vignette — primary corners, above sky layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] [background:radial-gradient(ellipse_70%_50%_at_85%_100%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_60%),radial-gradient(ellipse_80%_60%_at_0%_0%,color-mix(in_srgb,var(--primary)_6%,transparent),transparent_55%)]"
      />

      <FloatingSolarWindIcons className="z-[3] opacity-[0.5] dark:opacity-[0.3]" />

      {/* Top-right Back link */}
      <Link
        to="/"
        className="absolute right-6 top-6 z-30 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur transition hover:bg-background hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        {/* ─────────── HERO ─────────── */}
        <div className="flex flex-col justify-between gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          {/* Brand */}
          <Link
            to="/"
            data-hero-brand
            className="flex items-center gap-3 self-start transition-opacity hover:opacity-90"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-primary to-chart-3 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-foreground">PMIS · SOLAR</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Govt of India
              </div>
            </div>
          </Link>

          {/* Body */}
          <div className="max-w-2xl">
            <span
              data-hero-tag
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 backdrop-blur dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Demo · Read-only environment
            </span>

            <div
              data-hero-eyebrow
              className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              PMIS Renewable Governance
            </div>

            <h1
              data-hero-headline
              className="mt-3 text-balance text-[clamp(2.4rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-foreground"
            >
              Sign in to power
              <br />
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                clean-energy programs.
              </span>
            </h1>

            <p
              data-hero-tagline
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[17px]"
            >
              Dashboards, workflows, and audit trails for India's renewable
              programs — pick a demo role on the right to step inside.
            </p>

            {/* Stat cards */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                { k: "12.4", unit: "GW", sub: "Capacity tracked" },
                { k: "99.2", unit: "%", sub: "SLA compliance" },
                { k: "5", unit: "roles", sub: "One platform" },
              ].map((s) => (
                <div
                  key={s.sub}
                  data-hero-stat
                  className="rounded-2xl border border-border/60 bg-background/70 px-5 py-4 shadow-sm backdrop-blur dark:bg-card/40"
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight">{s.k}</span>
                    <span className="text-sm font-medium text-muted-foreground">{s.unit}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { Icon: Clock, text: "SLA & escalation", tint: "text-amber-600 dark:text-amber-400" },
                { Icon: ShieldCheck, text: "Audit trail", tint: "text-emerald-600 dark:text-emerald-400" },
                { Icon: Globe, text: "Multi-state", tint: "text-sky-600 dark:text-sky-400" },
                { Icon: KeyRound, text: "Secure sign-in", tint: "text-violet-600 dark:text-violet-400" },
              ].map((p) => (
                <span
                  key={p.text}
                  data-hero-pill
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground/85 shadow-sm backdrop-blur dark:bg-card/40"
                >
                  <p.Icon className={cn("size-3.5", p.tint)} aria-hidden /> {p.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────── FORM ─────────── */}
        <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
          <div ref={cardWrapRef} className="relative w-full max-w-md">
            {/* Layered backing cards — give the "stack of papers" feel from the reference. */}
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

            {/* Mobile brand (form column shows on its own at narrow widths) */}
            <div className="relative mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-primary to-chart-3 text-primary-foreground shadow-md ring-1 ring-primary/20">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold tracking-tight">PMIS · SOLAR</div>
                <div className="text-xs text-muted-foreground">Govt of India</div>
              </div>
            </div>

            {/* Flip wrapper */}
            <div className="relative [perspective:1100px]">
              <div
                ref={flipInnerRef}
                className="relative min-h-[640px] [transform-style:preserve-3d]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={cn(
                    "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(0deg)]",
                    isRegister ? "pointer-events-none" : "pointer-events-auto",
                  )}
                  aria-hidden={isRegister}
                >
                  <AuthCard>
                    <LoginCardBody navigate={navigate} />
                  </AuthCard>
                </div>
                <div
                  className={cn(
                    "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    isRegister ? "pointer-events-auto" : "pointer-events-none",
                  )}
                  aria-hidden={!isRegister}
                >
                  <AuthCard>
                    <RegisterCardBody />
                  </AuthCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** White / dark frosted card with a cursor-tracking spotlight tint. */
function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl border border-border/70 bg-card/95 p-7 shadow-2xl shadow-primary/10 ring-1 ring-foreground/[0.03] backdrop-blur-2xl dark:bg-card/85 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-70 [background:radial-gradient(420px_circle_at_var(--spot-x,50%)_var(--spot-y,0%),color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function LoginCardBody({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [email, setEmail] = useState("ipp@demo.com");
  const [password, setPassword] = useState("demo");
  const [showPwd, setShowPwd] = useState(false);
  const [keep, setKeep] = useState(true);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const root = wrapRef.current;
      if (!root) return;
      const fields = root.querySelectorAll<HTMLElement>("[data-anim-field]");
      if (!fields.length) return;
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
            gsap.set(fields, { clearProps: "opacity,visibility,transform" });
          },
        },
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = session.login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate({ to: rolePath(u.role) as never });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapRef}>
      {/* Title */}
      <div data-anim-field className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-chart-2/15 text-primary ring-1 ring-primary/15">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Pick a demo role — email autofills.
          </p>
        </div>
      </div>

      {/* DEMO ROLE grid */}
      <div data-anim-field className="mb-6">
        <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Demo Role
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ROLE_TILES.map((t) => {
            const isActive = email === t.email;
            return (
              <button
                key={t.role}
                type="button"
                onClick={() => {
                  setEmail(t.email);
                  setPassword("demo");
                }}
                className={cn(
                  "group/role relative rounded-xl border bg-card/70 p-2.5 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "border-primary/45 bg-primary/[0.04] shadow-md shadow-primary/10 ring-2 ring-primary/30"
                    : "border-border/70 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/[0.025] hover:shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg ring-1 ring-foreground/[0.04] transition",
                    t.tile,
                  )}
                >
                  <t.Icon className={cn("size-4.5", t.iconColor)} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="mt-2.5 text-[13px] font-semibold leading-tight text-foreground">
                  {t.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{t.sub}</div>
                {isActive && (
                  <CircleCheck
                    className="absolute right-2 top-2 size-4 text-primary"
                    strokeWidth={2.4}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-4">
        <div data-anim-field className="space-y-1.5">
          <Label htmlFor="login-email" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Email
          </Label>
          <div className="group/field relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
              aria-hidden
            />
            <Input
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              placeholder="you@department.gov.in"
              className="h-11 pl-9 transition-shadow focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]"
            />
          </div>
        </div>

        <div data-anim-field className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPwd ? "text" : "password"}
              required
              autoComplete="current-password"
              className="h-11 pl-9 pr-10 transition-shadow focus-visible:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_14%,transparent)]"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Demo: use <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">demo</code>
          </p>
        </div>

        <label
          data-anim-field
          className="flex cursor-pointer items-center gap-2.5 select-none pt-1 text-sm text-foreground/85"
        >
          <span
            className={cn(
              "relative flex h-4 w-4 items-center justify-center rounded border transition",
              keep ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
            )}
          >
            {keep && <CircleCheck className="size-3.5" strokeWidth={3} />}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={keep}
            onChange={(e) => setKeep(e.target.checked)}
          />
          Keep me signed in on this device
        </label>

        <Button
          data-anim-field
          type="submit"
          disabled={loading}
          size="lg"
          className="group/cta relative mt-2 h-12 w-full overflow-hidden rounded-xl text-[0.95rem] shadow-lg shadow-primary/25"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {loading ? "Signing in…" : "Sign in to PMIS"}
            {!loading && (
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden />
            )}
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1100ms] ease-out group-hover/cta:translate-x-full"
          />
        </Button>
      </form>

      <p data-anim-field className="mt-6 text-center text-sm text-muted-foreground">
        New IPP?{" "}
        <button
          type="button"
          onClick={() => navigate({ href: "/login?mode=register" })}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Register
        </button>
        <span className="mx-2 text-border">·</span>
        <Link to="/roles" className="font-semibold text-primary underline-offset-4 hover:underline">
          Demo roles
        </Link>
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function RegisterCardBody() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const root = wrapRef.current;
      if (!root) return;
      const fields = root.querySelectorAll<HTMLElement>("[data-anim-field]");
      if (!fields.length) return;
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
            gsap.set(fields, { clearProps: "opacity,visibility,transform" });
          },
        },
      );
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = db.registerUser({ name, email, org, password, role: "ipp" });
      session.set(u);
      toast.success("Registration complete. Welcome!");
      navigate({ to: "/ipp" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapRef}>
      <div data-anim-field className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200/70 to-primary/15 text-primary ring-1 ring-primary/15">
          <UserPlus className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Register as IPP</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Create your Independent Power Producer account.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div data-anim-field className="space-y-1.5">
          <Label htmlFor="reg-name" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Full name
          </Label>
          <Input
            id="reg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="h-11"
          />
        </div>
        <div data-anim-field className="space-y-1.5">
          <Label htmlFor="reg-org" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Organization
          </Label>
          <Input
            id="reg-org"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div data-anim-field className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Email
          </Label>
          <div className="group/field relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
              aria-hidden
            />
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-11 pl-9"
            />
          </div>
        </div>
        <div data-anim-field className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Password
          </Label>
          <div className="group/field relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-primary"
              aria-hidden
            />
            <Input
              id="reg-password"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-11 pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button
          data-anim-field
          type="submit"
          disabled={loading}
          size="lg"
          className="group/cta relative mt-2 h-12 w-full overflow-hidden rounded-xl text-[0.95rem] shadow-lg shadow-primary/25"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {loading ? "Creating account…" : "Create account"}
            {!loading && (
              <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" aria-hidden />
            )}
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1100ms] ease-out group-hover/cta:translate-x-full"
          />
        </Button>
      </form>

      <p data-anim-field className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <button
          type="button"
          onClick={() => navigate({ href: "/login" })}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

