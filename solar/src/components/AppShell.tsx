import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import {
  BarChart3,
  Bell,
  Briefcase,
  FileStack,
  GitBranch,
  Inbox,
  LayoutDashboard,
  Layers,
  ListChecks,
  ListTodo,
  LogOut,
  Menu,
  MessageSquareWarning,
  Sun,
  UserRound,
  AlertTriangle,
  Clock,
  CirclePlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/types";
import { db, roleLabel, rolePath, useDbVersion, useLogout, useSession } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const NAV: Record<Role, { to: string; label: string }[]> = {
  ipp: [
    { to: "/ipp", label: "Dashboard" },
    { to: "/ipp/opportunities", label: "Opportunities" },
    { to: "/ipp/tasks", label: "Tasks" },
    { to: "/ipp/applications", label: "Applications" },
    { to: "/ipp/milestones", label: "Milestones" },
    { to: "/ipp/notifications", label: "Notifications" },
    { to: "/ipp/profile", label: "Profile" },
  ],
  officer: [
    { to: "/officer", label: "Dashboard" },
    { to: "/officer/tasks", label: "Tasks" },
    { to: "/officer/queue", label: "Queue" },
    { to: "/officer/queries", label: "Raised queries" },
    { to: "/officer/sla", label: "SLA Tracking" },
    { to: "/officer/notifications", label: "Notifications" },
    { to: "/officer/escalations", label: "Escalation Queue" },
  ],
  approver: [
    { to: "/approver", label: "Dashboard" },
    { to: "/approver/tasks", label: "Tasks" },
    { to: "/approver/queue", label: "Approval Queue" },
    { to: "/approver/notifications", label: "Notifications" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/opportunities", label: "Opportunities" },
    { to: "/admin/opportunities/create", label: "Create Opportunity" },
    { to: "/admin/checklists", label: "Document Checklists" },
    { to: "/admin/project-types", label: "Project Types" },
    { to: "/admin/workflows", label: "Workflows" },
    { to: "/admin/users", label: "Users & Roles" },
  ],
  management: [
    { to: "/management", label: "Dashboard" },
    { to: "/management/projects", label: "All Projects" },
    { to: "/management/analytics", label: "Analytics" },
  ],
};

const IPP_NAV_ICONS: Record<string, LucideIcon> = {
  "/ipp": LayoutDashboard,
  "/ipp/opportunities": Briefcase,
  "/ipp/tasks": ListTodo,
  "/ipp/applications": FileStack,
  "/ipp/milestones": ListChecks,
  "/ipp/notifications": Bell,
  "/ipp/profile": UserRound,
};

type StaffRole = Exclude<Role, "ipp">;

const STAFF_NAV_ICONS: Record<StaffRole, Record<string, LucideIcon>> = {
  officer: {
    "/officer": LayoutDashboard,
    "/officer/tasks": ListTodo,
    "/officer/queue": Inbox,
    "/officer/queries": MessageSquareWarning,
    "/officer/sla": Clock,
    "/officer/notifications": Bell,
    "/officer/escalations": AlertTriangle,
  },
  approver: {
    "/approver": LayoutDashboard,
    "/approver/tasks": ListTodo,
    "/approver/queue": Inbox,
    "/approver/notifications": Bell,
  },
  admin: {
    "/admin": LayoutDashboard,
    "/admin/opportunities": Briefcase,
    "/admin/opportunities/create": CirclePlus,
    "/admin/checklists": ListChecks,
    "/admin/project-types": Layers,
    "/admin/workflows": GitBranch,
    "/admin/users": UserRound,
  },
  management: {
    "/management": LayoutDashboard,
    "/management/projects": Briefcase,
    "/management/analytics": BarChart3,
  },
};

const STAFF_SIDEBAR_ACCENT: Record<StaffRole, string> = {
  officer: "border-l-primary-foreground/55",
  approver: "border-l-primary-foreground/40",
  admin: "border-l-primary-foreground/55",
  management: "border-l-primary-foreground/48",
};

const STAFF_SIDEBAR_HINT: Record<StaffRole, string> = {
  officer: "Review queue, SLA risk, and escalations in one operational view.",
  approver: "Decisions, delegation, and SLA visibility for senior approvals.",
  admin: "Opportunities, checklists, workflows, and access control — national scheme configuration.",
  management: "Portfolio health, capacity mix, and delivery analytics at a glance.",
};

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function ippNavActive(pathname: string, to: string) {
  const p = normalizePath(pathname);
  if (to === "/ipp") return p === "/ipp";
  return p === to || p.startsWith(`${to}/`);
}

function workspaceNavActive(pathname: string, to: string, home: string) {
  const p = normalizePath(pathname);
  if (to === home) return p === home;
  return p === to || p.startsWith(`${to}/`);
}

type User = NonNullable<ReturnType<typeof useSession>>;

function WorkspaceBrand({ role, compact }: { role: StaffRole; compact?: boolean }) {
  const home = rolePath(role);
  return (
    <Link
      to={home}
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 p-2 ring-1 ring-primary-foreground/12 transition hover:border-primary-foreground/28 hover:bg-primary-foreground/14",
        compact && "border-0 bg-transparent p-0 ring-0 hover:bg-transparent",
      )}
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-foreground/22 text-sidebar-primary-foreground shadow-md shadow-black/25 ring-1 ring-primary-foreground/15">
        <Sun className="size-4" aria-hidden />
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 to-transparent"
          aria-hidden
        />
      </div>
      {!compact ? (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-xs font-medium tracking-tight text-sidebar-foreground">PMIS</div>
          <div className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/85">
            {roleLabel(role)} workspace
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function WorkspaceSidebarNav({
  role,
  pathname,
  onNavigate,
  className,
}: {
  role: StaffRole;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const links = NAV[role];
  const home = rolePath(role);
  const icons = STAFF_NAV_ICONS[role];
  return (
    <nav className={cn("flex flex-col gap-0.5 p-2", className)} aria-label={`${roleLabel(role)} primary`}>
      {links.map((item) => {
        const Icon = icons[item.to] ?? LayoutDashboard;
        const p = normalizePath(pathname);
        let active = workspaceNavActive(pathname, item.to, home);
        if (item.to === "/admin/opportunities" && (p === "/admin/opportunities/create" || p.startsWith("/admin/opportunities/create/"))) {
          active = false;
        }
        const label = item.label;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.8125rem] font-semibold leading-snug transition",
              active
                ? "bg-primary-foreground/28 text-primary-foreground ring-2 ring-primary-foreground/50 shadow-sm shadow-black/25"
                : "text-primary-foreground/80 hover:bg-primary-foreground/14 hover:text-primary-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md border transition",
                active
                  ? "border-primary-foreground/45 bg-primary-foreground/35 text-primary-foreground shadow-sm shadow-black/20"
                  : "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground/75 group-hover:border-primary-foreground/25 group-hover:bg-primary-foreground/16 group-hover:text-primary-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="truncate">{label}</span>
            {active ? (
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
}

function WorkspaceSidebarFooter({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <div className="border-t border-primary-foreground/15 p-2">
      <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/22 text-xs font-semibold text-sidebar-primary-foreground ring-1 ring-primary-foreground/15">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-sidebar-foreground">{user.name}</div>
          <div className="truncate text-[11px] text-sidebar-foreground/60">{user.org ?? roleLabel(user.role)}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 px-2.5 py-2 text-xs font-medium text-sidebar-foreground/90 transition hover:border-primary-foreground/28 hover:bg-primary-foreground/16 hover:text-sidebar-foreground"
      >
        <LogOut className="size-3.5" aria-hidden />
        Sign out
      </button>
      <Link
        to="/"
        className="mt-1.5 block w-full rounded-lg px-2 py-1.5 text-center text-[11px] font-medium text-sidebar-foreground/60 transition hover:text-sidebar-foreground"
      >
        ← Public portal
      </Link>
    </div>
  );
}

function staffNotificationsPath(role: StaffRole): string | null {
  if (role === "officer") return "/officer/notifications";
  if (role === "approver") return "/approver/notifications";
  return null;
}

function AccountDropdownDetails({ user }: { user: User }) {
  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <div className="flex gap-3 border-b border-border px-3 py-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm ring-2 ring-card">
        {initial}
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-left">
        <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
        <p className="break-all text-xs text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">{roleLabel(user.role)}</p>
        {user.org ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="size-3 shrink-0 opacity-80" aria-hidden />
            <span className="min-w-0 truncate">{user.org}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function WorkspaceTopNavbar({
  role,
  pathname,
  user,
  onOpenMenu,
  onSignOut,
}: {
  role: StaffRole;
  pathname: string;
  user: User;
  onOpenMenu: () => void;
  onSignOut: () => void;
}) {
  useDbVersion();
  const home = rolePath(role);
  const notifPath = staffNotificationsPath(role);
  const unread = db.listNotifications(user.id).filter((n) => !n.read).length;
  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
  const first = user.name?.trim()?.split(/\s+/)[0] ?? user.name;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm dark:shadow-none">
      <div className="flex h-12 w-full min-w-0 items-center justify-between gap-2 px-3 sm:h-[3.125rem] sm:gap-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <div className="shrink-0 lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 border-border bg-card text-foreground shadow-sm hover:bg-muted/80 dark:hover:bg-muted"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" />
            </Button>
          </div>
          <div className="min-w-0 py-0.5">
            <p className="truncate text-sm font-medium leading-tight text-foreground">
              {workspaceHeaderGreeting()},{" "}
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent">
                {first}
              </span>
              {user.org ? (
                <>
                  <span className="text-muted-foreground"> | </span>
                  <span className="inline-flex items-center gap-1 align-middle text-[11px] font-medium text-muted-foreground">
                    <Briefcase className="size-3 shrink-0 opacity-80" aria-hidden />
                    <span>{user.org}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground"> | </span>
                  <span className="text-[11px] font-medium text-muted-foreground">{roleLabel(role)}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 md:gap-4">
          {notifPath ? (
            <>
              <Link
                to={notifPath}
                className={cn(
                  "relative rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/80 dark:hover:bg-muted",
                  workspaceNavActive(pathname, notifPath, home) &&
                    "bg-muted/80 ring-1 ring-border/80 dark:bg-muted dark:ring-border",
                )}
                aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
              >
                <Bell className="size-4" strokeWidth={1.75} aria-hidden />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-semibold tabular-nums leading-none text-destructive-foreground shadow-sm">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <div className="h-7 w-px shrink-0 bg-border" aria-hidden />
            </>
          ) : null}

          <ThemeSwitcher />
          <div className="h-7 w-px shrink-0 bg-border" aria-hidden />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shadow-sm ring-2 ring-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Account menu — ${user.name}`}
              >
                {initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-0">
              <AccountDropdownDetails user={user} />
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/80 dark:hover:bg-muted"
            aria-label="Sign out"
          >
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}

function WorkspaceLayout({
  role,
  user,
  children,
  logout,
  navigate,
}: {
  role: StaffRole;
  user: User;
  children: React.ReactNode;
  logout: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useTableCascadeAnimation({
    triggerKey: pathname,
    scopeRef: contentRef,
    disabled: Boolean(reduceMotion),
  });

  const signOut = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  const asideClass = cn(
    "relative flex w-[240px] shrink-0 flex-col border-r border-primary-foreground/15 border-l-[3px] bg-sidebar text-sidebar-foreground",
    STAFF_SIDEBAR_ACCENT[role],
  );

  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-muted/25">
      <aside className={cn(asideClass, "hidden shrink-0 lg:flex")} aria-label="Workspace navigation">
        <div className="relative flex h-full min-h-0 flex-1 flex-col">
          <div className="p-3 pb-1.5">
            <WorkspaceBrand role={role} />
            <p className="mt-2.5 text-[11px] leading-snug text-sidebar-foreground/60">{STAFF_SIDEBAR_HINT[role]}</p>
          </div>
          <WorkspaceSidebarNav role={role} pathname={pathname} className="min-h-0 flex-1 overflow-y-auto" />
          <WorkspaceSidebarFooter user={user} onSignOut={signOut} />
        </div>
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <WorkspaceTopNavbar
          role={role}
          pathname={pathname}
          user={user}
          onOpenMenu={() => setMobileOpen(true)}
          onSignOut={signOut}
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton
            className={cn(asideClass, "w-[min(100%,260px)] border-r-0 p-0")}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{roleLabel(role)} navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col pt-12">
              <div className="px-4 pb-2">
                <WorkspaceBrand role={role} />
              </div>
              <WorkspaceSidebarNav
                role={role}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                className="flex-1"
              />
              <WorkspaceSidebarFooter
                user={user}
                onSignOut={() => {
                  setMobileOpen(false);
                  signOut();
                }}
              />
            </div>
          </SheetContent>
        </Sheet>

        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_85%_55%_at_10%_-10%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_0%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent_45%)]"
            aria-hidden
          />
          <div className="relative w-full min-w-0 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 lg:px-6 xl:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                ref={contentRef}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function IPPBrand({ compact }: { compact?: boolean }) {
  return (
    <Link
      to="/ipp"
      className={cn(
        "group flex items-center gap-2 rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 p-2 ring-1 ring-primary-foreground/12 transition hover:border-primary-foreground/28 hover:bg-primary-foreground/14",
        compact && "border-0 bg-transparent p-0 ring-0 hover:bg-transparent",
      )}
    >
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-foreground/22 text-sidebar-primary-foreground shadow-md shadow-black/25 ring-1 ring-primary-foreground/15">
        <Sun className="size-4" aria-hidden />
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/8 to-transparent"
          aria-hidden
        />
      </div>
      {!compact ? (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-xs font-medium tracking-tight text-sidebar-foreground">PMIS</div>
          <div className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/85">
            IPP workspace
          </div>
        </div>
      ) : null}
    </Link>
  );
}

function IPPSidebarNav({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const links = NAV.ipp;
  return (
    <nav className={cn("flex flex-col gap-0.5 p-2", className)} aria-label="IPP primary">
      {links.map((item) => {
        const Icon = IPP_NAV_ICONS[item.to] ?? LayoutDashboard;
        const active = ippNavActive(pathname, item.to);
        const label = item.label;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.8125rem] font-semibold leading-snug transition",
              active
                ? "bg-primary-foreground/28 text-primary-foreground ring-2 ring-primary-foreground/50 shadow-sm shadow-black/25"
                : "text-primary-foreground/80 hover:bg-primary-foreground/14 hover:text-primary-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md border transition",
                active
                  ? "border-primary-foreground/45 bg-primary-foreground/35 text-primary-foreground shadow-sm shadow-black/20"
                  : "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground/75 group-hover:border-primary-foreground/25 group-hover:bg-primary-foreground/16 group-hover:text-primary-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="truncate">{label}</span>
            {active ? (
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
}

function workspaceHeaderGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function useTableCascadeAnimation({
  triggerKey,
  scopeRef,
  disabled,
}: {
  triggerKey: string;
  scopeRef: React.RefObject<HTMLElement | null>;
  disabled: boolean;
}) {
  useEffect(() => {
    if (disabled) return;

    let raf = 0;
    const tweens: gsap.core.Tween[] = [];

    raf = window.requestAnimationFrame(() => {
      const scope = scopeRef.current;
      if (!scope) return;

      const tableBodies = Array.from(
        scope.querySelectorAll<HTMLTableSectionElement>(".app-data-table-grid tbody"),
      );

      for (const body of tableBodies) {
        const rows = Array.from(body.querySelectorAll<HTMLTableRowElement>("tr"));
        if (rows.length === 0) continue;

        gsap.set(rows, { opacity: 0, y: -12 });
        tweens.push(
          gsap.to(rows, {
            opacity: 1,
            y: 0,
            duration: 0.42,
            ease: "power2.out",
            stagger: 0.06,
            clearProps: "opacity,transform",
          }),
        );
      }
    });

    return () => {
      window.cancelAnimationFrame(raf);
      tweens.forEach((t) => t.kill());
    };
  }, [disabled, scopeRef, triggerKey]);
}

function IPPTopNavbar({
  pathname,
  user,
  onOpenMenu,
  onSignOut,
}: {
  pathname: string;
  user: User;
  onOpenMenu: () => void;
  onSignOut: () => void;
}) {
  useDbVersion();
  const unread = db.listNotifications(user.id).filter((n) => !n.read).length;
  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
  const first = user.name?.trim()?.split(/\s+/)[0] ?? user.name;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm dark:shadow-none">
      <div className="flex h-12 w-full min-w-0 items-center justify-between gap-2 px-3 sm:h-[3.125rem] sm:gap-3 sm:px-4 md:px-5 lg:px-6 xl:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <div className="shrink-0 lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 border-border bg-card text-foreground shadow-sm hover:bg-muted/80 dark:hover:bg-muted"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" />
            </Button>
          </div>
          <div className="min-w-0 py-0.5">
            <p className="truncate text-sm font-medium leading-tight text-foreground">
              {workspaceHeaderGreeting()},{" "}
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent">
                {first}
              </span>
              {user.org ? (
                <>
                  <span className="text-muted-foreground"> | </span>
                  <span className="inline-flex items-center gap-1 align-middle text-[11px] font-medium text-muted-foreground">
                    <Briefcase className="size-3 shrink-0 opacity-80" aria-hidden />
                    <span>{user.org}</span>
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 md:gap-4">
          <Link
            to="/ipp/notifications"
            className={cn(
              "relative rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/80 dark:hover:bg-muted",
              ippNavActive(pathname, "/ipp/notifications") &&
                "bg-muted/80 ring-1 ring-border/80 dark:bg-muted dark:ring-border",
            )}
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          >
            <Bell className="size-4" strokeWidth={1.75} aria-hidden />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-semibold tabular-nums leading-none text-destructive-foreground shadow-sm">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>

          <ThemeSwitcher />
          <div className="h-7 w-px shrink-0 bg-border" aria-hidden />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shadow-sm ring-2 ring-card outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Account menu — ${user.name}`}
              >
                {initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-0">
              <AccountDropdownDetails user={user} />
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/ipp/profile" className="cursor-pointer">
                  <UserRound className="size-4" aria-hidden />
                  Open profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/80 dark:hover:bg-muted"
            aria-label="Sign out"
          >
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}

function IPPSidebarFooter({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() ?? "?";
  return (
    <div className="border-t border-primary-foreground/15 p-2">
      <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/22 text-xs font-semibold text-sidebar-primary-foreground ring-1 ring-primary-foreground/15">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-sidebar-foreground">{user.name}</div>
          <div className="truncate text-[11px] text-sidebar-foreground/60">{user.org ?? roleLabel("ipp")}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 px-2.5 py-2 text-xs font-medium text-sidebar-foreground/90 transition hover:border-primary-foreground/28 hover:bg-primary-foreground/16 hover:text-sidebar-foreground"
      >
        <LogOut className="size-3.5" aria-hidden />
        Sign out
      </button>
      <Link
        to="/"
        className="mt-1.5 block w-full rounded-lg px-2 py-1.5 text-center text-[11px] font-medium text-sidebar-foreground/60 transition hover:text-sidebar-foreground"
      >
        ← Public portal
      </Link>
    </div>
  );
}

function IPPLayout({
  user,
  children,
  logout,
  navigate,
}: {
  user: User;
  children: React.ReactNode;
  logout: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useTableCascadeAnimation({
    triggerKey: pathname,
    scopeRef: contentRef,
    disabled: Boolean(reduceMotion),
  });

  const signOut = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  const asideClass =
    "relative flex w-[240px] shrink-0 flex-col border-r border-primary-foreground/15 border-l-[3px] border-l-primary-foreground/45 bg-sidebar text-sidebar-foreground";

  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-muted/25">
      <aside className={cn(asideClass, "hidden shrink-0 lg:flex")} aria-label="Workspace navigation">
        <div className="relative flex h-full min-h-0 flex-1 flex-col">
          <div className="p-3 pb-1.5">
            <IPPBrand />
            <p className="mt-2.5 text-[11px] leading-snug text-sidebar-foreground/60">
              Approvals, milestones, and officer queries — unified for your portfolio.
            </p>
          </div>
          <IPPSidebarNav pathname={pathname} className="min-h-0 flex-1 overflow-y-auto" />
          <IPPSidebarFooter user={user} onSignOut={signOut} />
        </div>
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <IPPTopNavbar
          pathname={pathname}
          user={user}
          onOpenMenu={() => setMobileOpen(true)}
          onSignOut={signOut}
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton
            className={cn(asideClass, "w-[min(100%,260px)] border-r-0 p-0")}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>IPP navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col pt-12">
              <div className="px-4 pb-2">
                <IPPBrand />
              </div>
              <IPPSidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} className="flex-1" />
              <IPPSidebarFooter user={user} onSignOut={() => { setMobileOpen(false); signOut(); }} />
            </div>
          </SheetContent>
        </Sheet>

        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_85%_55%_at_10%_-10%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_0%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent_45%)]"
            aria-hidden
          />
          <div ref={contentRef} className="relative w-full min-w-0 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 lg:px-6 xl:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const user = useSession();
  const logout = useLogout();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Link to="/login" className="font-medium text-primary">
          Go to login
        </Link>
      </div>
    );
  }

  if (user.role !== role) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-center">
          This area is for {roleLabel(role)}. You are signed in as {roleLabel(user.role)}.
        </p>
        <button type="button" onClick={() => navigate({ to: "/roles" })} className="font-medium text-primary">
          Switch role
        </button>
      </div>
    );
  }

  if (role === "ipp") {
    return <IPPLayout user={user} children={children} logout={logout} navigate={navigate} />;
  }

  return (
    <WorkspaceLayout role={role} user={user} logout={logout} navigate={navigate}>
      {children}
    </WorkspaceLayout>
  );
}
