import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Inbox,
  Info,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { Button } from "@/components/ui/button";
import { db, useSession, useDbVersion, relativeTime } from "@/lib/hooks";
import type { Notification, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

function makeRoute(role: Role, path: string) {
  return createFileRoute(path as never)({
    head: () => ({ meta: [{ title: "Notifications — PMIS" }] }),
    component: () => <NotifPage role={role} />,
  });
}

export const Route = makeRoute("ipp", "/ipp/notifications/");

type FilterMode = "all" | "unread" | "warning" | "success" | "info";

const TYPE_META: Record<
  Notification["type"],
  {
    icon: LucideIcon;
    label: string;
    iconClass: string;
    accent: string;
    border: string;
    chip: string;
  }
> = {
  error: {
    icon: XCircle,
    label: "Error",
    iconClass: "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
    accent: "from-rose-500/12 via-card to-rose-500/[0.04]",
    border: "border-rose-500/30",
    chip: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
  warning: {
    icon: AlertCircle,
    label: "Warning",
    iconClass: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    accent: "from-amber-500/12 via-card to-amber-500/[0.04]",
    border: "border-amber-500/30",
    chip: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  success: {
    icon: CheckCircle2,
    label: "Success",
    iconClass: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    accent: "from-emerald-500/12 via-card to-emerald-500/[0.04]",
    border: "border-emerald-500/30",
    chip: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  info: {
    icon: Info,
    label: "Info",
    iconClass: "bg-primary/12 text-primary",
    accent: "from-primary/10 via-card to-primary/[0.03]",
    border: "border-primary/25",
    chip: "bg-primary/12 text-primary",
  },
};

function NotifPage({ role }: { role: Role }) {
  const user = useSession();
  useDbVersion();
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<FilterMode>("all");

  if (!user) return null;

  const list = db.listNotifications(user.id);
  const unreadCount = list.filter((n) => !n.read).length;
  const counts = useMemo(
    () => ({
      all: list.length,
      unread: unreadCount,
      info: list.filter((n) => n.type === "info").length,
      warning: list.filter((n) => n.type === "warning" || n.type === "error").length,
      success: list.filter((n) => n.type === "success").length,
    }),
    [list, unreadCount],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    if (filter === "unread") return list.filter((n) => !n.read);
    if (filter === "warning") return list.filter((n) => n.type === "warning" || n.type === "error");
    return list.filter((n) => n.type === filter);
  }, [list, filter]);

  const markAllRead = () => {
    list.filter((n) => !n.read).forEach((n) => db.markNotificationRead(n.id));
  };

  return (
    <AppShell role={role}>
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Notifications"
              count={list.length}
              description={`${unreadCount} unread · alerts on applications, SLA, and decisions`}
            />
          }
          right={
            unreadCount > 0 ? (
              <Button type="button" size="sm" className="h-10 gap-1.5 rounded-xl shadow-sm" onClick={markAllRead}>
                <CheckCheck className="size-4" aria-hidden />
                Mark all as read
              </Button>
            ) : null
          }
        />

        {/* KPI / filter strip */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Notification summary">
          {(
            [
              { key: "all", label: "All", value: counts.all, sub: "Inbox total", tone: "task-tone-query", icon: Inbox },
              { key: "unread", label: "Unread", value: counts.unread, sub: "Need attention", tone: "task-tone-allotment", icon: BellRing },
              { key: "warning", label: "Alerts", value: counts.warning, sub: "Warnings & errors", tone: "task-tone-issue", icon: AlertCircle },
              { key: "info", label: "Updates", value: counts.info, sub: "Informational", tone: "task-tone-waiting", icon: Info },
              { key: "success", label: "Successes", value: counts.success, sub: "Completed events", tone: "task-tone-milestone", icon: CheckCircle2 },
            ] as const
          ).map((tile, i) => {
            const Icon: LucideIcon = tile.icon;
            const pressed = filter === tile.key;
            return (
              <motion.button
                key={tile.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFilter(pressed && tile.key !== "all" ? "all" : (tile.key as FilterMode))}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={cn("task-kpi text-left", tile.tone)}
                data-active={pressed}
              >
                <div className="flex items-center gap-3">
                  <span className="task-kpi-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tile.label}</p>
                    <p className="task-kpi-text mt-0.5 text-2xl font-bold leading-none tabular-nums">{tile.value}</p>
                    <p className="mt-1 truncate text-[10.5px] text-muted-foreground">{tile.sub}</p>
                  </div>
                  {pressed ? <CheckCircle2 className="size-4 shrink-0 text-foreground/55" aria-hidden /> : null}
                </div>
              </motion.button>
            );
          })}
        </section>

        {/* Inbox panel */}
        <section className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/[0.04] ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20">
          <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/[0.07] via-card to-chart-2/[0.04] px-5 py-4 sm:px-6">
            <div
              className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-400/30 via-rose-500/15 to-pink-700/10 text-rose-900 shadow-sm shadow-rose-500/15 ring-1 ring-rose-500/10 dark:from-rose-500/25 dark:via-rose-600/15 dark:to-pink-950/40 dark:text-rose-50 dark:border-rose-400/30 dark:ring-rose-400/10">
                  <BellRing className="size-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Inbox</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {filtered.length} of {list.length} notification{list.length === 1 ? "" : "s"}
                    {filter !== "all" ? ` · filtered by ${filter}` : ""}
                  </p>
                </div>
              </div>
              {filter !== "all" ? (
                <Button type="button" variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setFilter("all")}>
                  Clear filter
                </Button>
              ) : null}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.06] text-primary">
                <Bell className="size-6" aria-hidden />
              </div>
              <p className="text-base font-semibold text-foreground">
                {list.length === 0 ? "No notifications yet" : "Nothing here"}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {list.length === 0
                  ? "Alerts on applications, SLA windows, queries, and decisions will appear here."
                  : `No ${filter} notifications. Try a different filter to see other alerts.`}
              </p>
              {filter !== "all" ? (
                <Button type="button" size="sm" variant="outline" className="mt-1 rounded-xl" onClick={() => setFilter("all")}>
                  Show all
                </Button>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              <AnimatePresence initial={false}>
                {filtered.map((n, i) => {
                  const meta = TYPE_META[n.type];
                  const Icon = meta.icon;
                  const content = (
                    <div className="relative flex items-start gap-3 px-5 py-3.5 sm:px-6 sm:py-4">
                      {/* unread accent bar */}
                      {!n.read ? (
                        <span
                          className={cn(
                            "absolute inset-y-0 left-0 w-[3px] rounded-r-full",
                            n.type === "error" || n.type === "warning"
                              ? "bg-rose-500"
                              : n.type === "success"
                                ? "bg-emerald-500"
                                : "bg-primary",
                          )}
                          aria-hidden
                        />
                      ) : null}

                      {/* tonal accent wash */}
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l opacity-70",
                          meta.accent,
                          n.read && "opacity-30",
                        )}
                        aria-hidden
                      />

                      <span
                        className={cn(
                          "relative flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1",
                          meta.iconClass,
                          n.read ? "ring-border/50" : meta.border,
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>

                      <div className="relative min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={cn("text-sm font-semibold tracking-tight text-foreground", !n.read && "text-foreground")}>
                                {n.title}
                              </p>
                              {!n.read ? (
                                <span className="inline-flex size-1.5 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]" aria-label="Unread" />
                              ) : null}
                            </div>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">{n.message}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                meta.chip,
                              )}
                            >
                              <Sparkles className="size-3" aria-hidden />
                              {meta.label}
                            </span>
                            <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground shadow-sm">
                              {relativeTime(n.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {!n.read ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                db.markNotificationRead(n.id);
                              }}
                              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                            >
                              <CheckCircle2 className="size-3" aria-hidden />
                              Mark as read
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              <CheckCheck className="size-3" aria-hidden />
                              Read
                            </span>
                          )}
                          {n.link ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                              Open
                              <ArrowUpRight className="size-3" aria-hidden />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <motion.li
                      key={n.id}
                      layout
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
                      transition={{ duration: 0.22, delay: reduceMotion ? 0 : Math.min(i * 0.02, 0.18) }}
                      className={cn(
                        "group relative overflow-hidden transition-colors",
                        n.read ? "bg-card hover:bg-muted/25" : "bg-primary/[0.03] hover:bg-primary/[0.06]",
                      )}
                    >
                      {n.link ? (
                        <Link
                          to={n.link}
                          onClick={() => {
                            if (!n.read) db.markNotificationRead(n.id);
                          }}
                          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!n.read) db.markNotificationRead(n.id);
                          }}
                          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          {content}
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </section>
      </DataListPageShell>
    </AppShell>
  );
}

export { NotifPage };
