import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Building2,
  CircleUser,
  Mail,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataListFilterButton,
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  DataListSearchField,
  DataListViewToggle,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { db, useDbVersion, roleLabel } from "@/lib/hooks";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/admin/users/")({
  head: () => ({ meta: [{ title: "Users & roles — PMIS" }] }),
  component: UsersPage,
});

const ROLE_OPTIONS: Array<Role | "all"> = [
  "all",
  "ipp",
  "officer",
  "approver",
  "admin",
  "management",
];

const ROLE_META: Record<Role, { tone: string; icon: LucideIcon; chip: string; chipDark: string }> = {
  ipp: {
    tone: "task-tone-allotment",
    icon: Briefcase,
    chip: "bg-sky-500/15 text-sky-700",
    chipDark: "dark:bg-sky-500/20 dark:text-sky-300",
  },
  officer: {
    tone: "task-tone-query",
    icon: UserCog,
    chip: "bg-indigo-500/15 text-indigo-700",
    chipDark: "dark:bg-indigo-500/20 dark:text-indigo-300",
  },
  approver: {
    tone: "task-tone-waiting",
    icon: ShieldCheck,
    chip: "bg-violet-500/15 text-violet-700",
    chipDark: "dark:bg-violet-500/20 dark:text-violet-300",
  },
  admin: {
    tone: "task-tone-issue",
    icon: Shield,
    chip: "bg-rose-500/15 text-rose-700",
    chipDark: "dark:bg-rose-500/20 dark:text-rose-300",
  },
  management: {
    tone: "task-tone-milestone",
    icon: CircleUser,
    chip: "bg-emerald-500/15 text-emerald-700",
    chipDark: "dark:bg-emerald-500/20 dark:text-emerald-300",
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UsersPage() {
  useDbVersion();
  const reduceMotion = useReducedMotion();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string>("all");
  const [view, setView] = useState<DataListViewMode>("table");

  const allUsers = db.listUsers();

  const roleCounts = useMemo(() => {
    const counts: Record<Role | "all", number> = {
      all: allUsers.length,
      ipp: 0,
      officer: 0,
      approver: 0,
      admin: 0,
      management: 0,
    };
    for (const u of allUsers) counts[u.role]++;
    return counts;
  }, [allUsers]);

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        roleLabel(u.role).toLowerCase().includes(s) ||
        (u.org?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [allUsers, q, role]);

  const resetKey = `${q}\0${role}`;
  const {
    pageSize,
    setPageSize,
    safePage,
    pageCount,
    paged,
    start,
    end,
    setPage,
    goFirst,
    goLast,
    goPrev,
    goNext,
  } = useDataListPagination(filtered, resetKey);

  const filterBadgeCount = role !== "all" ? 1 : 0;

  type Tile =
    | { key: "all"; label: string; icon: LucideIcon; footerBadge: string; footer: string }
    | { key: Role; label: string; icon: LucideIcon; footerBadge: string; footer: string };

  const TILES: Tile[] = [
    { key: "all", label: "All users", icon: Users, footerBadge: "Directory", footer: "Full access list" },
    { key: "ipp", label: roleLabel("ipp"), icon: ROLE_META.ipp.icon, footerBadge: "IPP", footer: "Independent producers" },
    { key: "officer", label: roleLabel("officer"), icon: ROLE_META.officer.icon, footerBadge: "Desk", footer: "Evaluation & verification" },
    {
      key: "approver",
      label: roleLabel("approver"),
      icon: ROLE_META.approver.icon,
      footerBadge: "Decision stage",
      footer: "Final authority queue",
    },
    { key: "admin", label: roleLabel("admin"), icon: ROLE_META.admin.icon, footerBadge: "Config", footer: "Scheme & catalogue" },
    { key: "management", label: roleLabel("management"), icon: ROLE_META.management.icon, footerBadge: "Oversight", footer: "Portfolio visibility" },
  ];

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Users & roles"
              count={filtered.length}
              description="Identities across IPP, officer, approver, admin, and management personas."
            />
          }
          right={
            <>
              <DataListSearchField
                value={q}
                onChange={setQ}
                placeholder="Search name, email, role…"
                ariaLabel="Search users"
              />
              <DataListViewToggle view={view} onViewChange={setView} />
              <Popover>
                <PopoverTrigger asChild>
                  <DataListFilterButton activeCount={filterBadgeCount} />
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Filter results</p>
                    <div className="space-y-2">
                      <Label
                        htmlFor="admin-user-role"
                        className="text-xs text-muted-foreground"
                      >
                        Role
                      </Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger
                          id="admin-user-role"
                          className="h-9 w-full"
                          aria-label="User role"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r === "all" ? "All roles" : roleLabel(r)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          }
        />

        {/* Role KPI / filter strip */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6" aria-label="Users by role">
          {TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = roleCounts[tile.key];
            const pressed = role === tile.key;
            return (
              <MotionMetricCard
                key={tile.key}
                label={tile.label}
                value={count}
                icon={Icon}
                iconTone={metricTileToneAt(i)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={pressed}
                onClick={() => setRole(pressed ? "all" : tile.key)}
                aria-pressed={pressed}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </div>

        {/* Data panel */}
        <div className="app-data-panel overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/[0.04] ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20">
          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[720px] text-xs">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 px-3 py-2.5 text-center tabular-nums">Sl.</th>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-3 py-2.5">Email</th>
                    <th className="px-3 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Organisation</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((u, i) => {
                    const meta = ROLE_META[u.role];
                    const RoleIcon = meta.icon;
                    return (
                      <motion.tr
                        key={u.id}
                        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : i * 0.02 }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="px-3 py-3 text-center text-[11px] tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={cn("task-kpi-icon flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold", meta.tone)}>
                              {getInitials(u.name)}
                            </span>
                            <span className="font-semibold text-foreground">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="size-3 opacity-70" aria-hidden />
                            {u.email}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              meta.chip,
                              meta.chipDark,
                            )}
                          >
                            <RoleIcon className="size-3" aria-hidden />
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.org ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="size-3 opacity-70" aria-hidden />
                              {u.org}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((u, i) => {
                  const meta = ROLE_META[u.role];
                  const RoleIcon = meta.icon;
                  return (
                    <motion.div
                      key={u.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : Math.min(i * 0.025, 0.2) }}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-xs shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
                        meta.tone,
                      )}
                    >
                      <div
                        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl"
                        aria-hidden
                      />
                      <div className="relative flex items-start gap-3">
                        <span className="task-kpi-icon flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
                          {getInitials(u.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{u.name}</p>
                          <p className="mt-0.5 inline-flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
                            <Mail className="size-3 opacity-70" aria-hidden />
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            meta.chip,
                            meta.chipDark,
                          )}
                        >
                          <RoleIcon className="size-3" aria-hidden />
                          {roleLabel(u.role)}
                        </span>
                        {u.org ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <Building2 className="size-3 opacity-70" aria-hidden />
                            <span className="max-w-[10rem] truncate">{u.org}</span>
                          </span>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {paged.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center sm:px-5">
              <Users className="size-7 text-muted-foreground/70" aria-hidden />
              <p className="text-sm font-medium text-foreground">No users match your search</p>
              <p className="text-xs text-muted-foreground">Try clearing the role filter or refining your search term.</p>
            </div>
          )}

          <DataListPaginationFooter
            filteredLength={filtered.length}
            safePage={safePage}
            pageCount={pageCount}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={setPage}
            goFirst={goFirst}
            goLast={goLast}
            goPrev={goPrev}
            goNext={goNext}
            start={start}
            end={end}
          />
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
