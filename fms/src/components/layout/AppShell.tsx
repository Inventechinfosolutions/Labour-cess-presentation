import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Banknote,
  PieChart,
  ScrollText,
  ShieldCheck,
  LogOut,
  Bell,
  ListChecks,
  ArrowDownToLine,
  Building2,
  Menu,
  Sun,
} from 'lucide-react';
import { Link, useRouter } from '@/router';
import { useApp } from '@/store/AppStore';
import type { Role } from '@/store/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const baseNav: { to: string; label: string; icon: LucideIcon; roles?: Role[]; badgeKey?: 'tasks' }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListChecks, badgeKey: 'tasks', roles: ['Creator', 'Verifier', 'Approver', 'Finance', 'Payment'] },
  { to: '/bills', label: 'Bills', icon: Receipt, roles: ['Creator', 'Verifier', 'Finance', 'Payment', 'Auditor'] },
  { to: '/receipts', label: 'Receipts', icon: ArrowDownToLine },
  { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['Payment', 'Finance', 'Auditor'] },
  { to: '/reconciliation', label: 'Reconciliation', icon: Banknote, roles: ['Payment', 'Finance', 'Auditor'] },
  { to: '/budgets', label: 'Budgets', icon: PieChart },
  { to: '/reports', label: 'Reports', icon: ScrollText },
  { to: '/audit', label: 'Audit Logs', icon: ShieldCheck, roles: ['Auditor'] },
];

/** Microcopy under the brand — Solar-style muted line on the primary rail */
const SIDEBAR_HINT: Record<Role, string> = {
  Creator: 'Approvals, budgets & payments — unified for your portfolio.',
  Verifier: 'Verification queues, clarifications & SLA-ready handoffs.',
  Approver: 'Decisions, delegation, and approvals in one operational view.',
  Finance: 'Bills, payments, reconciliation & fiscal controls.',
  Payment: 'Payment runs, reconciliation & disbursement tracking.',
  Auditor: 'Audit trails, compliance checks & immutable logs.',
};

const WORKSPACE_ORG_LABEL = 'Rajiv Gandhi University of Health Sciences';

function greetingLine(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function displayFirstName(user: string): string {
  if (!user.trim()) return 'User';
  const seg = user.split(/[.@]/)[0] ?? user;
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/_/g, ' ');
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function navActive(path: string, to: string): boolean {
  const p = normalizePath(path);
  if (to === '/dashboard') return p === '/dashboard' || p === '/';
  return p === to || p.startsWith(`${to}/`);
}

/** Solar IPPBrand pattern: sun tile + product name + workspace subtitle */
function WorkspaceBrand({ compact, role }: { compact?: boolean; role: Role }) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        'group flex items-center gap-2 rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 p-2 ring-1 ring-primary-foreground/12 transition hover:border-primary-foreground/28 hover:bg-primary-foreground/14',
        compact && 'border-0 bg-transparent p-0 ring-0 hover:bg-transparent',
      )}
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-foreground/22 text-sidebar-primary-foreground shadow-md shadow-black/25 ring-1 ring-primary-foreground/15">
        <Sun className="size-4" aria-hidden strokeWidth={1.75} />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 to-transparent" aria-hidden />
      </div>
      {!compact ? (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-xs font-semibold tracking-tight text-sidebar-foreground">RGUHS FMS</div>
          <div className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/85">
            {role} workspace
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function SidebarFooter({ userLabel, onSignOut }: { userLabel: string; onSignOut: () => void }) {
  const initial = userLabel.trim()?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="border-t border-primary-foreground/15 p-2">
      <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/22 text-xs font-semibold text-sidebar-primary-foreground ring-1 ring-primary-foreground/15">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-sidebar-foreground">{displayFirstName(userLabel)}</div>
          <div className="truncate text-[11px] text-sidebar-foreground/60">{WORKSPACE_ORG_LABEL}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 px-2.5 py-2 text-xs font-medium text-sidebar-foreground/90 transition hover:border-primary-foreground/28 hover:bg-primary-foreground/16 hover:text-sidebar-foreground"
      >
        <LogOut className="size-3.5" aria-hidden strokeWidth={1.75} />
        Sign out
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { currentRole, currentUser, logout, taskCountFor } = useApp();
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role: Role = currentRole ?? 'Creator';
  const items = baseNav.filter((n) => !n.roles || n.roles.includes(role));
  const myCount = taskCountFor(role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const asideClass =
    'relative flex w-[240px] shrink-0 flex-col border-r border-primary-foreground/15 border-l-[3px] border-l-primary-foreground/45 bg-sidebar text-sidebar-foreground';

  const renderSidebarNav = (onNavigate?: () => void, navClassName?: string) => (
    <nav className={cn('flex flex-col gap-0.5 p-2', navClassName)} aria-label={`${role} primary`}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = navActive(path, it.to);
        const showCount = it.badgeKey === 'tasks' && myCount > 0;
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.8125rem] font-semibold leading-snug transition',
              active
                ? 'bg-primary-foreground/28 text-primary-foreground ring-2 ring-primary-foreground/50 shadow-sm shadow-black/25'
                : 'text-primary-foreground/80 hover:bg-primary-foreground/14 hover:text-primary-foreground',
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-md border transition',
                active
                  ? 'border-primary-foreground/45 bg-primary-foreground/35 text-primary-foreground shadow-sm shadow-black/20'
                  : 'border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground/75 group-hover:border-primary-foreground/25 group-hover:bg-primary-foreground/16 group-hover:text-primary-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 truncate">{it.label}</span>
            {showCount ? (
              <span className="shrink-0 rounded-full bg-primary-foreground/28 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-primary-foreground ring-1 ring-primary-foreground/25">
                {myCount > 9 ? '9+' : myCount}
              </span>
            ) : active ? (
              <span
                className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground shadow-md shadow-black/35"
                aria-hidden
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarFooter = (closeMobile?: () => void) => (
    <SidebarFooter
      userLabel={currentUser || 'demo.user'}
      onSignOut={() => {
        closeMobile?.();
        handleLogout();
      }}
    />
  );

  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-muted/25">
      <aside className={cn(asideClass, 'hidden shrink-0 lg:flex')} aria-label="Workspace navigation">
        <div className="relative flex h-full min-h-0 flex-1 flex-col">
          <div className="p-3 pb-1.5">
            <WorkspaceBrand role={role} />
            <p className="mt-2.5 text-[11px] leading-snug text-sidebar-foreground/60">{SIDEBAR_HINT[role]}</p>
          </div>
          {renderSidebarNav(undefined, 'min-h-0 flex-1 overflow-y-auto')}
          {sidebarFooter()}
        </div>
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm dark:shadow-none">
          <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-2 px-3 sm:h-[3.125rem] sm:gap-3 sm:px-5 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
              <div className="shrink-0 lg:hidden">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8 border-border bg-card text-foreground shadow-sm hover:bg-muted/80 dark:hover:bg-muted"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-4" strokeWidth={1.75} />
                </Button>
              </div>
              <div className="min-w-0 py-0.5">
                <p className="truncate text-sm font-medium leading-tight text-foreground">
                  {greetingLine()},{' '}
                  <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent">
                    {displayFirstName(currentUser)}
                  </span>
                  <span className="ml-0.5 inline-block shrink-0 select-none not-italic" role="img" aria-label="Hello">
                    👋
                  </span>
                  <span className="text-muted-foreground"> | </span>
                  <span className="inline-flex items-center gap-1 align-middle text-[11px] font-medium text-muted-foreground">
                    <Building2 className="size-3 shrink-0 opacity-80" aria-hidden strokeWidth={1.75} />
                    <span>{WORKSPACE_ORG_LABEL}</span>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative size-9 rounded-full text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted"
                type="button"
                aria-label={myCount ? `Notifications, ${myCount} unread` : 'Notifications'}
              >
                <Bell className="size-4" strokeWidth={1.75} />
                {myCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-semibold tabular-nums leading-none text-destructive-foreground shadow-sm">
                    {myCount > 9 ? '9+' : myCount}
                  </span>
                ) : null}
              </Button>
              <div className="h-7 w-px shrink-0 bg-border" aria-hidden />
              <ThemeToggle className="border-border/80 bg-background shadow-sm" />
              <div className="h-7 w-px shrink-0 bg-border" aria-hidden />
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shadow-sm ring-2 ring-card outline-none"
                title={currentUser || 'User'}
              >
                {(currentUser || 'U')[0]?.toUpperCase()}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/80 dark:hover:bg-muted"
                aria-label="Sign out"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" showCloseButton className={cn(asideClass, 'w-[min(100%,260px)] border-r-0 p-0')}>
            <SheetHeader className="sr-only">
              <SheetTitle>Workspace navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col pt-12">
              <div className="px-4 pb-2">
                <WorkspaceBrand role={role} compact />
              </div>
              <div className="px-4 pb-2">
                <p className="text-[11px] leading-snug text-sidebar-foreground/60">{SIDEBAR_HINT[role]}</p>
              </div>
              {renderSidebarNav(() => setMobileOpen(false), 'flex-1 overflow-y-auto')}
              {sidebarFooter(() => setMobileOpen(false))}
            </div>
          </SheetContent>
        </Sheet>

        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_85%_55%_at_10%_-10%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_0%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent_45%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-3 py-5 md:px-5 md:py-6 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
