import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ShieldCheck, Download, Users, Layers, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/store/AppStore';
import { Button } from '@/components/ui/button';
import { formatDate, relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AuditLog, Role } from '@/store/types';
import { EmptyState } from '@/components/shared/EmptyState';
import { AnimatedSearchInput } from '@/components/shared/AnimatedSearchInput';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';
import {
  TASKS_TABLE_TH,
  TASKS_TABLE_TD,
  TASKS_TABLE_SCROLL_WRAP,
  TASKS_TABLE_ROOT,
  LIST_TABLE_PAGE_SIZE,
} from '@/components/shared/tasksTableTokens';

const roleColors: Record<Role, string> = {
  Creator: 'status-info-bg text-primary',
  Verifier: 'status-warn-bg status-warn-text',
  Approver: 'status-success-bg status-success-text',
  Finance: 'status-paid-bg status-paid-text',
  Payment: 'status-purple-bg status-purple-text',
  Auditor: 'bg-muted text-foreground',
};

function exportAuditCsv(rows: AuditLog[]) {
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const header = ['When (ISO)', 'User', 'Role', 'Module', 'Action', 'Target', 'Detail'];
  const lines = [
    header.join(','),
    ...rows.map((l) =>
      [
        esc(new Date(l.at).toISOString()),
        esc(l.user),
        esc(l.role),
        esc(l.module),
        esc(l.action),
        esc(l.target),
        esc(l.detail ?? ''),
      ].join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function AuditLogsPage() {
  const { auditLogs } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [page, setPage] = useState(1);

  const modules = useMemo(() => Array.from(new Set(auditLogs.map((l) => l.module))), [auditLogs]);

  const filtered = useMemo(() => {
    return auditLogs.filter((l) => {
      if (filterRole !== 'all' && l.role !== filterRole) return false;
      if (filterModule !== 'all' && l.module !== filterModule) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return [l.user, l.action, l.target, l.detail ?? ''].some((v) => v.toLowerCase().includes(q));
      }
      return true;
    });
  }, [auditLogs, search, filterRole, filterModule]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / LIST_TABLE_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * LIST_TABLE_PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * LIST_TABLE_PAGE_SIZE, filtered.length);

  const pagedLogs = useMemo(
    () => filtered.slice((safePage - 1) * LIST_TABLE_PAGE_SIZE, safePage * LIST_TABLE_PAGE_SIZE),
    [filtered, safePage],
  );

  const counts = useMemo(() => {
    const total = auditLogs.length;
    const uniqueUsers = new Set(auditLogs.map((l) => l.user)).size;
    const modulesCount = new Set(auditLogs.map((l) => l.module)).size;
    /* Sliding-window KPI — requires wall time at read time */
    const nowMs = Date.now(); // eslint-disable-line react-hooks/purity -- rolling 24h window
    const last24h = auditLogs.filter((l) => nowMs - new Date(l.at).getTime() < 86_400_000).length;
    return { total, uniqueUsers, modules: modulesCount, last24h };
  }, [auditLogs]);

  const hasActiveFilters = search.trim().length > 0 || filterRole !== 'all' || filterModule !== 'all';

  const tableCascadeKey = useMemo(() => pagedLogs.map((l) => l.id).join('|'), [pagedLogs]);

  const selectBarClass =
    'h-10 min-w-0 rounded-lg border border-border/90 bg-background px-3 text-sm text-foreground shadow-sm ring-1 ring-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 dark:ring-white/[0.04]';

  useLayoutEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const smoothEase = 'power3.out' as const;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll('.list-dash-reveal'),
        { y: -18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: { each: 0.07, ease: smoothEase },
          duration: 0.72,
          ease: smoothEase,
        },
      );

      const theadRow = root.querySelector('table thead tr');
      const bodyRows = root.querySelectorAll('tbody tr.list-dash-row');

      const tl = gsap.timeline({ defaults: { duration: 0.75, ease: smoothEase } });

      if (theadRow) {
        tl.fromTo(theadRow, { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.68 });
      }

      if (bodyRows.length) {
        tl.fromTo(
          bodyRows,
          { opacity: 0, y: -22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.78,
            stagger: { each: 0.085, from: 'start', ease: smoothEase },
          },
          theadRow ? '+=0.1' : 0,
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [search, filterRole, filterModule, tableCascadeKey]);

  return (
    <div ref={ref} className="fms-dashboard relative mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-12 md:px-6">
      <section className="list-dash-reveal space-y-2 pt-4 md:pt-6">
        <div className="flex flex-wrap items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18"
            aria-hidden
          >
            <ShieldCheck className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="fms-dashboard-title text-3xl leading-tight text-foreground md:text-[2rem]">Audit Logs</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              Tamper-evident, read-only trail of every action across the system.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="shadow-sm"
              onClick={() => exportAuditCsv(filtered)}
            >
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] [&>*]:min-w-0">
        <ListPagePrimaryKpiCard
          label="Total entries"
          value={counts.total}
          sub="Events recorded"
          icon={<ShieldCheck className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />}
        />
        <ListPageSecondaryKpiCard
          delayMs={40}
          label="Unique users"
          value={counts.uniqueUsers}
          sub="Actors in the trail"
          icon={<Users className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="emerald"
        />
        <ListPageSecondaryKpiCard
          delayMs={80}
          label="Modules"
          value={counts.modules}
          sub="Areas touched"
          icon={<Layers className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="amber"
        />
        <ListPageSecondaryKpiCard
          delayMs={120}
          label="Last 24 hours"
          value={counts.last24h}
          sub="Recent activity"
          icon={<Clock className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="purple"
        />
      </div>

      <div className="list-dash-reveal fms-dashboard-panel fms-dashboard-chart-board overflow-hidden rounded-2xl">
        <div className="border-b border-border bg-card p-4 md:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="min-w-0 shrink-0 lg:max-w-[min(100%,280px)]">
              <h2 className="font-sans text-lg font-semibold tracking-tight text-foreground">Audit trail</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Search and filter this list</p>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <div className="flex min-w-0 max-w-[280px] flex-1 shrink basis-9 justify-end">
                <AnimatedSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search user, action, target…"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={cn(selectBarClass, 'min-w-[140px] shrink-0')}
              >
                <option value="all">All roles</option>
                {(['Creator', 'Verifier', 'Approver', 'Finance', 'Payment', 'Auditor'] as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className={cn(selectBarClass, 'min-w-[160px] shrink-0')}
              >
                <option value="all">All modules</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setFilterRole('all');
                    setFilterModule('all');
                    setPage(1);
                  }}
                  className="h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={TASKS_TABLE_SCROLL_WRAP}>
          <table className={cn(TASKS_TABLE_ROOT, 'min-w-[1100px] table-fixed')}>
            <thead>
              <tr>
                <th className={cn(TASKS_TABLE_TH, 'w-12')}>Sl. No</th>
                <th className={TASKS_TABLE_TH}>When</th>
                <th className={TASKS_TABLE_TH}>User</th>
                <th className={TASKS_TABLE_TH}>Role</th>
                <th className={TASKS_TABLE_TH}>Module</th>
                <th className={TASKS_TABLE_TH}>Action</th>
                <th className={cn(TASKS_TABLE_TH, 'min-w-[140px]')}>Target</th>
                <th className={cn(TASKS_TABLE_TH, 'min-w-[180px]')}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border border-border/80 bg-muted/20 px-4 py-16 text-center">
                    <EmptyState
                      title={hasActiveFilters ? 'No entries match your filters' : 'No audit entries'}
                      description={
                        hasActiveFilters ? 'Try clearing filters or widening your search.' : 'Activity will appear here as users work in the system.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                pagedLogs.map((l, index) => (
                  <tr key={l.id} className="list-dash-row transition hover:bg-muted/35">
                    <td className={cn(TASKS_TABLE_TD, 'w-10 whitespace-nowrap text-xs text-muted-foreground')}>
                      {(safePage - 1) * LIST_TABLE_PAGE_SIZE + index + 1}
                    </td>
                    <td className={cn(TASKS_TABLE_TD, 'text-xs')}>
                      <div className="font-medium">{relativeTime(l.at)}</div>
                      <div className="text-muted-foreground">{formatDate(l.at)}</div>
                    </td>
                    <td className={TASKS_TABLE_TD}>{l.user}</td>
                    <td className={TASKS_TABLE_TD}>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          roleColors[l.role],
                        )}
                      >
                        {l.role}
                      </span>
                    </td>
                    <td className={cn(TASKS_TABLE_TD, 'text-xs')}>{l.module}</td>
                    <td className={cn(TASKS_TABLE_TD, 'font-medium')}>{l.action}</td>
                    <td className={cn(TASKS_TABLE_TD, 'font-mono text-xs')}>{l.target}</td>
                    <td className={cn(TASKS_TABLE_TD, 'max-w-0 truncate text-xs text-muted-foreground')}>{l.detail ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{pageStart}</span>–
              <span className="font-medium text-foreground">{pageEnd}</span> of{' '}
              <span className="font-medium text-foreground">{filtered.length}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, Math.min(p, pageCount) - 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </Button>
              <span className="px-2 text-sm tabular-nums text-muted-foreground">
                Page {safePage} of {pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, Math.min(p, pageCount) + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
