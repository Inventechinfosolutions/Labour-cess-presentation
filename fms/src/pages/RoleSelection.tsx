import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowLeft, ArrowRight, FileEdit, ShieldCheck, Wallet, Eye, Stamp, Coins } from 'lucide-react';
import { Link, useRouter } from '@/router';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/AppStore';
import type { Role } from '@/store/types';
import { TiltCard } from '@/components/animations/TiltCard';
import { AnimatedText } from '@/components/animations/AnimatedText';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const roleCards: { role: Role; title: string; desc: string; icon: typeof FileEdit; tone: string }[] = [
  { role: 'Creator',  title: 'Creator',           desc: 'Department / College — create, edit and submit bills and budgets.',           icon: FileEdit,    tone: 'brand-grad-1' },
  { role: 'Verifier', title: 'Verifier',          desc: 'Section user — validate documents, approve / reject / send back.',           icon: ShieldCheck, tone: 'brand-grad-3' },
  { role: 'Approver', title: 'Approver',          desc: 'Final approval authority for budgets — approve, reject or hold.',             icon: Stamp,       tone: 'brand-grad-2' },
  { role: 'Finance',  title: 'Finance Officer',    desc: 'Approve bills with budget validation. Allocate / adjust approved budgets.',  icon: Coins,       tone: 'brand-grad-4' },
  { role: 'Payment',  title: 'Payment Officer',   desc: 'Process RTGS / NEFT / Cheque, mark bills as paid.',                            icon: Wallet,      tone: 'brand-grad-5' },
  { role: 'Auditor',  title: 'Auditor / Admin',   desc: 'Read-only access to all logs, reports and audit trails.',                      icon: Eye,         tone: 'brand-grad-dark' },
];

export function RoleSelectionPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { setRole, currentModule, taskCountFor } = useApp();

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.role-card',
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.07, duration: 0.6, ease: 'power3.out', delay: 0.15 },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const onPick = (role: Role) => {
    setRole(role);
    navigate('/dashboard');
  };

  return (
    <div ref={ref} className="min-h-svh bg-gradient-to-b from-accent/40 via-background to-background">
      <header className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl brand-grad-1 flex items-center justify-center text-primary-foreground font-bold">R</div>
            <div>
              <div className="text-sm font-semibold leading-tight">RGUHS FMS</div>
              <div className="text-[11px] text-muted-foreground leading-tight">
                {currentModule ? `Module: ${currentModule}` : 'Demo Mode'}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/modules')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-primary uppercase tracking-[0.25em] text-xs">Step 2 of 2</div>
          <AnimatedText
            as="h1"
            text="Select Your Role"
            className="text-4xl md:text-5xl font-semibold tracking-tight mt-3"
          />
          <p className="mt-4 text-muted-foreground">
            Each role sees a different set of tasks, modules and actions. Pick a role to log in.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleCards.map((r) => {
            const taskCount = taskCountFor(r.role);
            return (
              <TiltCard key={r.role} className="role-card rounded-3xl">
                <button
                  onClick={() => onPick(r.role)}
                  className="group relative w-full h-full text-left rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-2xl ${r.tone} text-primary-foreground flex items-center justify-center shadow-md`}>
                      <r.icon className="h-6 w-6" />
                    </div>
                    {taskCount > 0 && r.role !== 'Auditor' && (
                      <div className="text-[11px] font-semibold rounded-full status-warn-bg px-2.5 py-1">
                        {taskCount} pending
                      </div>
                    )}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                  <div className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-[gap]">
                    Login as {r.title} <ArrowRight className="h-4 w-4 ml-1.5" />
                  </div>
                </button>
              </TiltCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
