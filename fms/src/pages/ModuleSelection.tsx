import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Receipt,
  CreditCard,
  Banknote,
  PieChart,
  ScrollText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ArrowDownToLine,
} from 'lucide-react';
import { Link, useRouter } from '@/router';
import { TiltCard } from '@/components/animations/TiltCard';
import { AnimatedText } from '@/components/animations/AnimatedText';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useApp } from '@/store/AppStore';
import type { ModuleId } from '@/store/types';
import { Button } from '@/components/ui/button';

const modules: {
  id: ModuleId;
  title: string;
  desc: string;
  icon: typeof Receipt;
  tone: string;
}[] = [
  { id: 'bills',           title: 'Bill Processing',         desc: 'Create, verify, approve and pay bills with role-based workflow.', icon: Receipt,      tone: 'brand-grad-1' },
  { id: 'receipts',        title: 'Receipts',                desc: 'Capture incoming payments — verify, approve and confirm.', icon: ArrowDownToLine, tone: 'brand-grad-5' },
  { id: 'payments',        title: 'Payments',                desc: 'Process payments via RTGS / NEFT / Cheque with bank file generation.', icon: CreditCard, tone: 'brand-grad-2' },
  { id: 'reconciliation',  title: 'Banking & Reconciliation', desc: 'Upload bank statements, auto-match and resolve exceptions.', icon: Banknote,        tone: 'brand-grad-5' },
  { id: 'budgets',         title: 'Budget Management',       desc: 'Allocate, monitor and adjust budgets with utilisation insights.', icon: PieChart,    tone: 'brand-grad-3' },
  { id: 'reports',         title: 'Reports & Analytics',     desc: 'Real-time dashboards across receipts, payments and budgets.', icon: ScrollText,    tone: 'brand-grad-4' },
  { id: 'audit',           title: 'Audit Logs',              desc: 'Read-only access to logs, reports and audit trails.', icon: ShieldCheck,        tone: 'brand-grad-dark' },
];

export function ModuleSelectionPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { setModule } = useApp();

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.mod-card',
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power3.out', delay: 0.2 },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const onPick = (id: ModuleId) => {
    setModule(id);
    navigate('/roles');
  };

  return (
    <div ref={ref} className="min-h-svh bg-gradient-to-b from-accent/40 via-background to-background">
      <header className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl brand-grad-1 flex items-center justify-center text-primary-foreground font-bold">R</div>
            <div>
              <div className="text-sm font-semibold leading-tight">RGUHS FMS</div>
              <div className="text-[11px] text-muted-foreground leading-tight">Demo Mode</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to landing
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-primary uppercase tracking-[0.25em] text-xs">Step 1 of 2</div>
          <AnimatedText
            as="h1"
            text="Select Module / Feature"
            className="text-4xl md:text-5xl font-semibold tracking-tight mt-3"
          />
          <p className="mt-4 text-muted-foreground">
            Choose the area of the system you'd like to explore. Each module has its own role-based workflow.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => (
            <TiltCard key={m.id} className="mod-card rounded-3xl">
              <button
                onClick={() => onPick(m.id)}
                className="group relative w-full h-full text-left rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-xl"
              >
                <div className={`h-12 w-12 rounded-2xl ${m.tone} text-primary-foreground flex items-center justify-center shadow-md`}>
                  <m.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                <div className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-[gap]">
                  Continue <ArrowRight className="h-4 w-4 ml-1.5" />
                </div>
              </button>
            </TiltCard>
          ))}
        </div>
      </main>
    </div>
  );
}
