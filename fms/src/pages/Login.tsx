import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ScrollText,
  Banknote,
  Award,
  Landmark,
  Sparkles,
  Fingerprint,
  IndianRupee,
  Receipt,
  Coins,
  Wallet,
  CreditCard,
  PieChart,
  LineChart,
  BarChart3,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  Calculator,
  BadgeIndianRupee,
  HandCoins,
} from 'lucide-react';
import { Link, useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/AppStore';
import type { Role } from '@/store/types';
import { toast } from 'sonner';
import { roleUsers } from '@/store/mockData';
import { cn } from '@/lib/utils';
import { TASK_ROLE_CHIP_BORDER } from '@/components/shared/taskRoleTone';

const demoAccounts: { role: Role; label: string; user: string; desc: string; Icon: typeof ShieldCheck }[] = [
  { role: 'Creator', label: 'Creator', user: roleUsers.Creator, desc: 'Department / college', Icon: ScrollText },
  { role: 'Verifier', label: 'Verifier', user: roleUsers.Verifier, desc: 'Section reviewer', Icon: CheckCircle2 },
  { role: 'Approver', label: 'Approver', user: roleUsers.Approver, desc: 'Budget approval', Icon: Award },
  { role: 'Finance', label: 'Finance', user: roleUsers.Finance, desc: 'Bills & allocation', Icon: Landmark },
  { role: 'Payment', label: 'Payment', user: roleUsers.Payment, desc: 'Disbursement', Icon: Banknote },
  { role: 'Auditor', label: 'Auditor', user: roleUsers.Auditor, desc: 'Read-only', Icon: ShieldCheck },
];

/** Demo role icon wells — gradient wells from index.css (--tone-* tokens) */
const LOGIN_ROLE_ICON_WRAP: Record<Role, string> = {
  Creator: 'login-role-well login-role-well--blue',
  Verifier: 'login-role-well login-role-well--amber',
  Approver: 'login-role-well login-role-well--teal',
  Finance: 'login-role-well login-role-well--violet',
  Payment: 'login-role-well login-role-well--magenta',
  Auditor: 'login-role-well login-role-well--indigo',
};

const heroHeadline = 'Sign in to manage';
const heroAccent = 'vouchers & budgets.';

const stats: { v: number; suffix: string; l: string }[] = [
  { v: 84, suffix: 'Cr+', l: 'Receipts FY26' },
  { v: 99.4, suffix: '%', l: 'Bank match' },
  { v: 6, suffix: 'roles', l: 'One platform' },
];

type BgIcon = {
  Icon: typeof IndianRupee;
  top: string;
  left: string;
  size: number;
  rot: number;
};

/** Full-saturation floating glyphs — cycles hue families from index.css */
const LOGIN_FLOAT_GLOW_CLASSES = [
  'login-float-glow login-float-glow--blue',
  'login-float-glow login-float-glow--teal',
  'login-float-glow login-float-glow--amber',
  'login-float-glow login-float-glow--magenta',
  'login-float-glow login-float-glow--violet',
  'login-float-glow login-float-glow--indigo',
  'login-float-glow login-float-glow--coral',
  'login-float-glow login-float-glow--lime',
] as const;

const bgIcons: BgIcon[] = [
  { Icon: IndianRupee, top: '8%', left: '6%', size: 40, rot: -12 },
  { Icon: Receipt, top: '14%', left: '40%', size: 34, rot: 8 },
  { Icon: Banknote, top: '22%', left: '74%', size: 46, rot: -6 },
  { Icon: Coins, top: '30%', left: '14%', size: 38, rot: 14 },
  { Icon: PieChart, top: '36%', left: '52%', size: 42, rot: -4 },
  { Icon: Landmark, top: '44%', left: '84%', size: 36, rot: 6 },
  { Icon: LineChart, top: '52%', left: '8%', size: 44, rot: -10 },
  { Icon: CreditCard, top: '58%', left: '34%', size: 32, rot: 12 },
  { Icon: BarChart3, top: '64%', left: '64%', size: 40, rot: -8 },
  { Icon: Wallet, top: '72%', left: '20%', size: 36, rot: 4 },
  { Icon: Building2, top: '78%', left: '78%', size: 42, rot: -14 },
  { Icon: TrendingUp, top: '82%', left: '46%', size: 38, rot: 10 },
  { Icon: HandCoins, top: '88%', left: '12%', size: 34, rot: -6 },
  { Icon: Calculator, top: '88%', left: '88%', size: 30, rot: 16 },
  { Icon: FileSpreadsheet, top: '4%', left: '88%', size: 32, rot: -16 },
  { Icon: BadgeIndianRupee, top: '46%', left: '36%', size: 30, rot: 8 },
];

export function LoginPage() {
  const { navigate } = useRouter();
  const { setRole } = useApp();
  const [email, setEmail] = useState(`${roleUsers.Creator}@rguhs.edu.in`);
  const [password, setPassword] = useState('demo1234');
  const [showPwd, setShowPwd] = useState(false);
  const [pickedRole, setPickedRole] = useState<Role>('Creator');

  const rootRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const tagPillRef = useRef<HTMLDivElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const statsWrap = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldsWrap = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const iconsLayerRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const heroChars = useMemo(() => heroHeadline.split(''), []);
  const accentChars = useMemo(() => heroAccent.split(''), []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // No staged entry — page paints fully formed. Only ambient, looping motion runs.

      // Stats counters: still count up (non-blocking — interactive controls are already usable).
      stats.forEach((s, i) => {
        const el = numRefs.current[i];
        if (!el) return;
        const proxy = { n: 0 };
        gsap.to(proxy, {
          n: s.v,
          duration: 1.4,
          ease: 'power2.out',
          delay: i * 0.06,
          onUpdate: () => {
            if (s.suffix === '%') {
              el.textContent = proxy.n.toFixed(1);
            } else {
              el.textContent = String(Math.round(proxy.n));
            }
          },
        });
      });

      // Ambient orb drift.
      gsap.to(orb1.current, { xPercent: 8, yPercent: -6, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2.current, { xPercent: -10, yPercent: 6, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb3.current, { xPercent: 4, yPercent: -8, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      // Floating finance icons — drift, subtle rotate wobble, scale breathe. All looping, no entry delay.
      root.querySelectorAll<HTMLElement>('[data-bg-icon]').forEach((el, i) => {
        const baseRot = Number((el as HTMLElement).dataset.rot) || 0;
        gsap.set(el, { rotate: baseRot });

        const driftX = gsap.utils.random(-22, 22);
        const driftY = gsap.utils.random(-26, 26);
        const dur = gsap.utils.random(5, 9);
        gsap.to(el, {
          x: driftX,
          y: driftY,
          rotate: baseRot + gsap.utils.random(-8, 8),
          duration: dur,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.05,
        });
        gsap.to(el, {
          scale: 1 + gsap.utils.random(0.06, 0.18),
          duration: gsap.utils.random(3, 6),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.04,
        });
      });

      // Rotating conic ring around the form card.
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          rotation: 360,
          duration: 14,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%',
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cta = ctaRef.current;
    const iconLayer = iconsLayerRef.current;
    const orbXs = [
      orb1.current && gsap.quickTo(orb1.current, 'x', { duration: 1.4, ease: 'power3.out' }),
      orb2.current && gsap.quickTo(orb2.current, 'x', { duration: 1.6, ease: 'power3.out' }),
      orb3.current && gsap.quickTo(orb3.current, 'x', { duration: 1.8, ease: 'power3.out' }),
    ];
    const orbYs = [
      orb1.current && gsap.quickTo(orb1.current, 'y', { duration: 1.4, ease: 'power3.out' }),
      orb2.current && gsap.quickTo(orb2.current, 'y', { duration: 1.6, ease: 'power3.out' }),
      orb3.current && gsap.quickTo(orb3.current, 'y', { duration: 1.8, ease: 'power3.out' }),
    ];
    const ctaX = cta && gsap.quickTo(cta, 'x', { duration: 0.4, ease: 'power3.out' });
    const ctaY = cta && gsap.quickTo(cta, 'y', { duration: 0.4, ease: 'power3.out' });
    const iconLayerX = iconLayer && gsap.quickTo(iconLayer, 'x', { duration: 1.2, ease: 'power3.out' });
    const iconLayerY = iconLayer && gsap.quickTo(iconLayer, 'y', { duration: 1.2, ease: 'power3.out' });

    const handleMove = (e: MouseEvent) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      orbXs[0]?.(cx * 28);
      orbYs[0]?.(cy * -40);
      orbXs[1]?.(cx * -22);
      orbYs[1]?.(cy * -36);
      orbXs[2]?.(cx * 22);
      orbYs[2]?.(cy * -22);
      iconLayerX?.(cx * -18);
      iconLayerY?.(cy * -18);

      if (cta) {
        const r = cta.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy);
        const radius = 140;
        if (dist < radius) {
          const f = (1 - dist / radius) * 14;
          ctaX?.((dx / dist) * f || 0);
          ctaY?.((dy / dist) * f || 0);
        } else {
          ctaX?.(0);
          ctaY?.(0);
        }
      }
    };
    const handleLeave = () => {
      ctaX?.(0);
      ctaY?.(0);
    };

    root.addEventListener('mousemove', handleMove);
    root.addEventListener('mouseleave', handleLeave);
    return () => {
      root.removeEventListener('mousemove', handleMove);
      root.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const onPickRole = (role: Role) => {
    setPickedRole(role);
    setEmail(`${roleUsers[role]}@rguhs.edu.in`);
    if (emailInputRef.current) {
      gsap.fromTo(
        emailInputRef.current,
        { y: -2, opacity: 0.6 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      );
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.error('Enter email and password to continue.');
      if (cardRef.current) {
        gsap.fromTo(cardRef.current, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
      return;
    }
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 0.98, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.inOut' });
    }
    flushSync(() => {
      setRole(pickedRole);
    });
    toast.success(`Welcome, ${roleUsers[pickedRole]} — signed in as ${pickedRole}`);
    navigate('/dashboard');
  };

  return (
    <div
      ref={rootRef}
      data-theme="light"
      className="relative flex min-h-svh flex-col overflow-hidden bg-[color-mix(in_oklch,var(--background)_94%,var(--primary))] text-slate-900 lg:flex-row"
    >
      <div
        ref={meshRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 60% at 8% 10%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 60%),' +
            'radial-gradient(60% 50% at 92% 18%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 58%),' +
            'radial-gradient(70% 60% at 50% 100%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 60%),' +
            'linear-gradient(180deg, color-mix(in oklch, var(--background) 98%, var(--primary)) 0%, color-mix(in oklch, var(--background) 91%, var(--primary)) 58%, color-mix(in oklch, var(--background) 84%, var(--primary)) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in oklch, var(--primary) 32%, transparent) 1px, transparent 1px),' +
            'linear-gradient(90deg, color-mix(in oklch, var(--primary) 32%, transparent) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%)',
        }}
      />

      <div ref={iconsLayerRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {bgIcons.map(({ Icon, top, left, size, rot }, i) => (
          <span
            key={`bg-${i}`}
            data-bg-icon
            data-rot={rot}
            className={cn('absolute inline-flex will-change-transform', LOGIN_FLOAT_GLOW_CLASSES[i % LOGIN_FLOAT_GLOW_CLASSES.length])}
            style={{ top, left, width: size, height: size }}
          >
            <Icon className="h-full w-full" strokeWidth={1.65} />
          </span>
        ))}
      </div>

      <div
        ref={orb1}
        aria-hidden
        className="pointer-events-none absolute -left-24 top-[12%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--primary) 38%, transparent), transparent 60%)' }}
      />
      <div
        ref={orb2}
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-[8%] h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--primary) 28%, transparent), transparent 62%)' }}
      />
      <div
        ref={orb3}
        aria-hidden
        className="pointer-events-none absolute bottom-[-12%] left-[28%] h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in oklch, var(--primary) 22%, transparent), transparent 62%)' }}
      />

      <header className="absolute inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-lg py-1 pr-2 outline-none transition hover:bg-slate-900/[0.04] focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Back to homepage"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--primary)_45%,transparent)]">
            R
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight text-slate-900">RGUHS · FMS</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Govt of Karnataka</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-slate-700 hover:bg-slate-900/[0.05] hover:text-slate-900">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
        </div>
      </header>

      <aside className="relative order-2 flex min-h-[42vh] flex-col justify-center px-6 py-14 sm:min-h-[44vh] lg:order-1 lg:min-h-svh lg:w-[52%] lg:px-14 lg:py-20">
        <div className="relative z-10 mx-auto w-full max-w-xl space-y-9 lg:mx-0">
          <div
            ref={tagPillRef}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1.5 text-emerald-700 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em]">Demo · Read-only environment</span>
          </div>

          <div className="space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary/85">RGUHS Finance Management</p>
            <h1
              ref={headlineRef}
              className="font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]"
            >
              <span className="block overflow-hidden">
                {heroChars.map((c, i) => (
                  <span key={`h-${i}`} className="hero-char inline-block whitespace-pre">
                    {c === ' ' ? ' ' : c}
                  </span>
                ))}
              </span>
              <span ref={accentRef} className="block overflow-hidden">
                {accentChars.map((c, i) => (
                  <span
                    key={`a-${i}`}
                    className="hero-char inline-block whitespace-pre bg-gradient-to-r from-primary to-primary/72 bg-clip-text text-transparent"
                  >
                    {c === ' ' ? ' ' : c}
                  </span>
                ))}
              </span>
            </h1>
            <p ref={subcopyRef} className="max-w-md text-[15px] leading-relaxed text-slate-600">
              Dashboards, workflows and audit trails for the university finance office — pick a demo role on the right to step inside.
            </p>
          </div>

          <div ref={statsWrap} className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div
                key={s.l}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.10)] backdrop-blur-md transition-colors hover:border-slate-300 hover:bg-white/90"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
                <p className="relative font-display text-2xl font-bold tabular-nums text-slate-900">
                  {s.l === 'Receipts FY26' ? '₹' : ''}
                  <span ref={(el) => { numRefs.current[i] = el; }}>0</span>
                  <span className="ml-1 text-sm font-semibold text-slate-500">{s.suffix}</span>
                </p>
                <p className="relative mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { Icon: Sparkles, label: 'SLA & escalation', iconClass: 'text-[color:var(--tone-teal)]' },
              { Icon: ShieldCheck, label: 'Audit trail', iconClass: 'text-[color:var(--tone-blue)]' },
              { Icon: Landmark, label: 'Multi-bank', iconClass: 'text-[color:var(--tone-violet)]' },
              { Icon: Fingerprint, label: 'Secure sign-in', iconClass: 'text-[color:var(--tone-magenta)]' },
            ].map(({ Icon: Pi, label, iconClass }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs text-slate-700 backdrop-blur-md"
              >
                <Pi className={cn('h-3.5 w-3.5 shrink-0', iconClass)} strokeWidth={2} />
                {label}
              </span>
            ))}
          </div>

          <p className="max-w-md text-[11px] leading-relaxed text-slate-500">
            Authorised users only. Sign-in events are logged (IP, device, time) for compliance.
          </p>
        </div>
      </aside>

      <section className="relative order-1 flex flex-1 items-center justify-center px-4 py-16 pt-24 sm:px-6 lg:order-2 lg:px-10 lg:py-16 lg:pt-16">
        <div className="relative w-full max-w-[440px]">
          <div
            ref={ringRef}
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[26px] opacity-90"
            style={{
              background:
                'conic-gradient(from 0deg, transparent, color-mix(in oklch, var(--primary) 52%, transparent), color-mix(in oklch, var(--primary) 36%, transparent), color-mix(in oklch, var(--primary) 48%, transparent), transparent)',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '1.5px',
            }}
          />

          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/85 p-7 shadow-[0_30px_80px_-24px_rgba(15,23,42,0.25),0_8px_24px_-12px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.0) 35%, rgba(255,255,255,0.0) 65%, rgba(255,255,255,0.6) 100%)',
              }}
            />

            <div className="relative mb-7 flex items-center gap-4">
              <div className="login-role-well login-role-well--blue grid h-12 w-12 shrink-0 place-items-center rounded-2xl backdrop-blur-md [&_svg]:stroke-[2.25]">
                <ShieldCheck className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">Welcome back</h2>
                <p className="mt-0.5 text-sm text-slate-500">Pick a demo role — email autofills.</p>
              </div>
            </div>

            <form onSubmit={submit} className="relative space-y-5" autoComplete="off">
              <div ref={fieldsWrap} className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Demo role</label>
                  <div
                    ref={chipsRef}
                    className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 sm:grid-cols-3"
                  >
                    {demoAccounts.map((a) => {
                      const active = pickedRole === a.role;
                      const Icon = a.Icon;
                      return (
                        <button
                          type="button"
                          key={a.role}
                          onClick={() => onPickRole(a.role)}
                          aria-pressed={active}
                          className={cn(
                            'group relative flex flex-col rounded-xl border-2 border-transparent px-2.5 py-2.5 text-left transition-all duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                            active
                              ? cn(
                                  'bg-white shadow-[0_4px_16px_-6px_rgba(15,23,42,0.10)]',
                                  TASK_ROLE_CHIP_BORDER[a.role] ?? 'border-border',
                                )
                              : 'hover:bg-white/70',
                          )}
                        >
                          <div
                            className={cn(
                              'mb-1.5 grid h-7 w-7 place-items-center rounded-lg transition-colors [&_svg]:stroke-[2]',
                              LOGIN_ROLE_ICON_WRAP[a.role],
                              active
                                ? 'shadow-sm ring-1 ring-black/15 dark:ring-white/12'
                                : 'ring-1 ring-black/[0.06] dark:ring-white/[0.08] group-hover:ring-black/10',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                          </div>
                          <span className={cn('text-xs font-semibold transition-colors', active ? 'text-slate-900' : 'text-slate-700')}>
                            {a.label}
                          </span>
                          <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">{a.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="login-email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" aria-hidden />
                    <input
                      id="login-email"
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all placeholder:text-slate-400 focus:border-primary/55 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
                      placeholder="you@rguhs.edu.in"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Password
                    </label>
                    <button type="button" className="text-xs font-medium text-primary hover:text-primary/90 hover:underline">
                      Forgot?
                    </button>
                  </div>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" aria-hidden />
                    <input
                      id="login-password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-all placeholder:text-slate-400 focus:border-primary/55 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
                      placeholder="demo1234"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((p) => !p)}
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-600 select-none">
                  <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-slate-300 bg-white text-primary focus:ring-primary/30" />
                  Keep me signed in on this device
                </label>
              </div>

              <button
                ref={ctaRef}
                type="submit"
                className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-primary-foreground/25 bg-primary text-base font-semibold text-primary-foreground shadow-[0_18px_40px_-14px_color-mix(in_oklch,var(--primary)_42%,transparent)] transition-[box-shadow,transform] duration-200 hover:shadow-[0_22px_48px_-12px_color-mix(in_oklch,var(--primary)_52%,transparent)] hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-background"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative">Sign in to FMS</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </button>
            </form>

            <p className="relative mt-7 border-t border-slate-200/80 pt-5 text-center text-[11px] leading-relaxed text-slate-500">
              By signing in you agree to RGUHS usage policy and audit logging.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
