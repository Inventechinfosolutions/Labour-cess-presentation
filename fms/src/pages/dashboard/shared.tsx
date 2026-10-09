import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import gsap from 'gsap';
import { ArrowDownToLine, PieChart as PieChartIcon, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Link } from '@/router';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { BudgetStatusBadge } from '@/components/shared/BudgetStatusBadge';
import { ReceiptStatusBadge } from '@/components/shared/ReceiptStatusBadge';
import { formatINR, relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getToken } from '@/lib/chartColors';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AuditLog, Bill, Budget, BudgetHead, Receipt, Task } from '@/store/types';

/** Allocation panel — navy vs warm orange (reference layout). */
export const BUDGET_UTIL_BLUE = '#0047AB';
export const BUDGET_UTIL_ORANGE = '#F2994A';

/** Demo heads when no approved budget rows */
export const DEMO_BUDGET_UTIL_HEADS: BudgetHead[] = [
  { id: 'demo-ta', name: 'TA/DA', allocated: 5_000_000, utilized: 2_050_000, reserved: 0 },
  { id: 'demo-rem', name: 'Remuneration', allocated: 12_000_000, utilized: 8_640_000, reserved: 0 },
  { id: 'demo-hon', name: 'Honorarium', allocated: 2_500_000, utilized: 2_150_000, reserved: 0 },
  { id: 'demo-eq', name: 'Equipment', allocated: 18_000_000, utilized: 10_650_000, reserved: 0 },
  { id: 'demo-amc', name: 'AMC', allocated: 3_500_000, utilized: 2_962_500, reserved: 0 },
];

export function budgetUtilProgressFill(index: number): string {
  const i = index % 5;
  return i === 0 || i === 3 ? BUDGET_UTIL_BLUE : BUDGET_UTIL_ORANGE;
}

const PIPELINE_BAR_RADII: [number, number, number, number] = [12, 12, 0, 0];

const PIPELINE_BAR_COLORS = [
  '#1D4E89',
  '#108961',
  '#C9A227',
  '#2A5A7A',
  '#DC2626',
  '#1D4E89',
  '#7C3AED',
  '#EA580C',
  '#0D9488',
] as const;

export type PipelineStatusRow = { label: string; count: number };

export function PipelineByStatusBarPanel({
  kicker,
  blurb,
  data,
  chartTokens,
}: {
  kicker: string;
  blurb: string;
  data: PipelineStatusRow[];
  chartTokens: {
    grid: string;
    gridSoft: string;
    axis: string;
    axisSoft: string;
    tooltipBg: string;
    border: string;
  };
}) {
  const yMax = Math.max(4, ...data.map((d) => d.count));
  const gridStroke = chartTokens.grid || chartTokens.gridSoft;
  return (
    <div className="creator-dash-chart fms-dashboard-panel fms-dashboard-chart-board flex min-h-0 flex-col rounded-2xl p-6 md:p-7">
      <p className="fms-dashboard-kicker mb-1">{kicker}</p>
      <h3 className="fms-dashboard-title text-xl leading-tight text-foreground md:text-[1.35rem]">By status</h3>
      <p className="mb-5 mt-1.5 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      <div className="h-[280px] w-full min-h-0 md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="6%" margin={{ top: 12, right: 10, left: 6, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} strokeOpacity={0.55} vertical horizontal />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: chartTokens.axisSoft }}
              tickLine={false}
              axisLine={{ stroke: gridStroke, strokeOpacity: 0.55 }}
              angle={-28}
              textAnchor="end"
              height={78}
              interval={0}
              dy={8}
            />
            <YAxis
              domain={[0, yMax]}
              allowDecimals={false}
              width={42}
              tick={{ fontSize: 11, fill: chartTokens.axis }}
              axisLine={false}
              tickLine={{ stroke: gridStroke, strokeOpacity: 0.45 }}
              tickSize={6}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in oklch, var(--muted) 38%, transparent)' }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${chartTokens.border}`,
                background: chartTokens.tooltipBg,
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={PIPELINE_BAR_RADII} maxBarSize={92}>
              {data.map((_, index) => (
                <Cell key={`pipeline-bar-${index}`} fill={PIPELINE_BAR_COLORS[index % PIPELINE_BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const KPI_ICON_TONE: Record<'teal' | 'amber' | 'emerald', string> = {
  teal: 'border-sky-200/90 bg-sky-500/[0.11] text-sky-600 dark:border-sky-500/35 dark:bg-sky-400/15 dark:text-sky-300',
  amber: 'border-amber-200/90 bg-amber-500/[0.11] text-amber-600 dark:border-amber-500/35 dark:bg-amber-400/15 dark:text-amber-300',
  emerald: 'border-emerald-200/90 bg-emerald-500/[0.11] text-emerald-600 dark:border-emerald-500/35 dark:bg-emerald-400/15 dark:text-emerald-300',
};

export type DashboardKpi =
  | {
      variant: 'featured';
      title: string;
      value: number;
      pill: string;
      sub: string;
      icon: LucideIcon;
      onClick: () => void;
    }
  | {
      variant: 'default';
      title: string;
      value: number;
      sub: string;
      icon: LucideIcon;
      onClick: () => void;
      iconTone: 'teal' | 'amber' | 'emerald';
    };

export function KpiStrip({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {kpis.map((k, i) => {
        const Icon = k.icon;
        const delay = { animationDelay: `${i * 40}ms` } as const;

        if (k.variant === 'featured') {
          return (
            <button
              key={k.title}
              type="button"
              onClick={k.onClick}
              style={delay}
              className={cn(
                'creator-dash-reveal creator-stat-card text-left',
                'relative overflow-hidden rounded-xl border-0 bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary-foreground/10',
                'transition hover:brightness-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-foreground/10" aria-hidden />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/75">{k.title}</p>
                  <p className="kpi-stat-value mt-3 text-[2rem] leading-none text-primary-foreground sm:text-[2.35rem]">{k.value}</p>
                  <span className="mt-3 inline-flex w-fit rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground ring-1 ring-primary-foreground/25 sm:text-[10px]">
                    {k.pill}
                  </span>
                  <p className="mt-2 text-xs text-primary-foreground/70">{k.sub}</p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/18 ring-1 ring-primary-foreground/25">
                  <Icon className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />
                </span>
              </div>
            </button>
          );
        }

        return (
          <button
            key={k.title}
            type="button"
            onClick={k.onClick}
            style={delay}
            className={cn(
              'creator-dash-reveal creator-stat-card text-left',
              'rounded-2xl border border-border/90 bg-card p-4 text-card-foreground shadow-sm sm:p-5',
              'ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
              'transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">{k.title}</p>
                <p className="kpi-stat-value mt-2 text-[2rem] leading-none text-foreground sm:text-[2.35rem]">{k.value}</p>
                <p className="mt-3 text-[11px] font-medium leading-snug text-primary sm:text-xs">{k.sub}</p>
              </div>
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm',
                  KPI_ICON_TONE[k.iconTone],
                )}
              >
                <Icon className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const SNAPSHOT_ACCENT: Record<'chart1' | 'chart2' | 'chart3', { bar: string; iconBg: string; iconFg: string }> = {
  chart1: {
    bar: 'border-l-[color:var(--chart-1)]',
    iconBg: 'bg-[color-mix(in_oklch,var(--chart-1)_14%,transparent)]',
    iconFg: 'text-[color:var(--chart-1)]',
  },
  chart2: {
    bar: 'border-l-[color:var(--chart-2)]',
    iconBg: 'bg-[color-mix(in_oklch,var(--chart-2)_14%,transparent)]',
    iconFg: 'text-[color:var(--chart-2)]',
  },
  chart3: {
    bar: 'border-l-[color:var(--chart-3)]',
    iconBg: 'bg-[color-mix(in_oklch,var(--chart-3)_14%,transparent)]',
    iconFg: 'text-[color:var(--chart-3)]',
  },
};

export function SnapshotFeedCard<T>({
  title,
  subtitle,
  href,
  icon: Icon,
  accent,
  rows,
  empty,
  rowKey,
  renderRow,
}: {
  title: string;
  subtitle?: string;
  href: string;
  icon: LucideIcon;
  accent: keyof typeof SNAPSHOT_ACCENT;
  rows: T[];
  empty: string;
  rowKey: (row: T) => string;
  renderRow: (row: T) => ReactNode;
}) {
  const a = SNAPSHOT_ACCENT[accent];
  return (
    <div
      className={cn(
        'creator-dash-reveal flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
        'border-l-4',
        a.bar,
      )}
    >
      <div className="relative border-b border-border/60 bg-gradient-to-br from-muted/35 via-card to-card px-4 pb-3.5 pt-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08]',
                a.iconBg,
              )}
            >
              <Icon className={cn('h-5 w-5', a.iconFg)} strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-base font-semibold leading-tight tracking-tight text-foreground">{title}</h3>
              {subtitle ? <p className="mt-1 text-xs leading-snug text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>
          <Link
            to={href}
            className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-border/90 bg-background px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/35 hover:bg-primary/5"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2">
        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/25 px-4 py-10 text-center">
            <div className={cn('rounded-xl p-3 ring-1 ring-border/60', a.iconBg)}>
              <Icon className={cn('h-7 w-7 opacity-60', a.iconFg)} strokeWidth={1.5} aria-hidden />
            </div>
            <p className="max-w-[220px] text-sm text-muted-foreground">{empty}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {rows.map((row) => (
              <li key={rowKey(row)} className="first:pt-0 last:pb-0">
                {renderRow(row)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function TaskSentBackPill() {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm"
      style={{ backgroundColor: BUDGET_UTIL_ORANGE }}
    >
      Sent Back
    </span>
  );
}

export function DashboardTaskRow({
  task,
  bills,
  budgets,
  receipts,
  navigate,
}: {
  task: Task;
  bills: Bill[];
  budgets: Budget[];
  receipts: Receipt[];
  navigate: (path: string) => void;
}) {
  const actionClass = 'text-[10px] font-bold uppercase tracking-[0.12em]';
  const actionAccentStyle = { color: BUDGET_UTIL_ORANGE } as const;
  const shellClass =
    'group flex w-full items-start gap-3 rounded-xl border border-border/75 bg-card px-4 py-3.5 text-left shadow-sm transition hover:border-primary/35 hover:bg-muted/25';
  const iconCircleClass =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/18';
  const kindClass = 'text-[10px] font-bold uppercase tracking-[0.14em] text-primary';

  const isReceipt = task.subjectType === 'Receipt' || !!task.receiptId;
  const isBudget = !isReceipt && (task.subjectType === 'Budget' || !!task.budgetId);
  const isBill = !isReceipt && !isBudget && (task.subjectType === 'Bill' || !!task.billId);

  if (isReceipt && task.receiptId) {
    const r = receipts.find((x) => x.id === task.receiptId);
    if (!r) return null;
    return (
      <button type="button" onClick={() => navigate(`/receipts/${r.id}`)} className={shellClass}>
        <div className={iconCircleClass}>
          <ArrowDownToLine className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={kindClass}>Receipt</span>
            {r.status === 'Sent Back' ? (
              <TaskSentBackPill />
            ) : (
              <ReceiptStatusBadge status={r.status} className="!scale-90 !px-2 !py-0.5 !text-[10px] origin-left" />
            )}
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-foreground">{r.receiptNumber}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {r.payerName} · {formatINR(r.amount)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end text-right">
          <span className={actionClass} style={actionAccentStyle}>
            {task.actionRequired}
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground">{relativeTime(task.createdAt)}</span>
        </div>
      </button>
    );
  }

  if (isBudget && task.budgetId) {
    const bg = budgets.find((x) => x.id === task.budgetId);
    if (!bg) return null;
    return (
      <button type="button" onClick={() => navigate(`/budgets/${bg.id}`)} className={shellClass}>
        <div className={iconCircleClass}>
          <PieChartIcon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={kindClass}>Budget</span>
            {bg.status === 'Sent Back' ? (
              <TaskSentBackPill />
            ) : (
              <BudgetStatusBadge status={bg.status} className="!scale-90 !px-2 !py-0.5 !text-[10px] origin-left" />
            )}
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-foreground">{bg.name}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {bg.entityName} · {bg.fy}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end text-right">
          <span className={actionClass} style={actionAccentStyle}>
            {task.actionRequired}
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground">{relativeTime(task.createdAt)}</span>
        </div>
      </button>
    );
  }

  if (isBill && task.billId) {
    const bill = bills.find((x) => x.billId === task.billId);
    if (!bill) return null;
    const idTail = bill.billId.split('-').pop() ?? bill.billId;
    return (
      <button type="button" onClick={() => navigate(`/bills/${bill.billId}`)} className={shellClass}>
        <div className={`${iconCircleClass} text-sm font-bold tabular-nums`}>{idTail}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={kindClass}>Bill</span>
            {bill.status === 'Sent Back' ? (
              <TaskSentBackPill />
            ) : (
              <StatusBadge status={bill.status} className="!scale-90 !px-2 !py-0.5 !text-[10px] origin-left" />
            )}
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-foreground">{bill.billType}</div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {bill.payeeName} · {bill.department} · {formatINR(bill.amount)}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end text-right">
          <span className={actionClass} style={actionAccentStyle}>
            {task.actionRequired}
          </span>
          <span className="mt-1 text-[11px] text-muted-foreground">{relativeTime(task.createdAt)}</span>
        </div>
      </button>
    );
  }

  return null;
}

export type ChartTokensState = {
  grid: string;
  gridSoft: string;
  axis: string;
  axisSoft: string;
  tooltipBg: string;
  border: string;
};

export function useDashboardChartTokens(): ChartTokensState {
  const { theme } = useTheme();
  const [chartTokens, setChartTokens] = useState<ChartTokensState>({
    grid: '',
    gridSoft: '',
    axis: '',
    axisSoft: '',
    tooltipBg: '',
    border: '',
  });

  useEffect(() => {
    const border = getToken('--border');
    const bg = getToken('--background');
    const mutedFg = getToken('--muted-foreground');
    setChartTokens({
      grid: border,
      gridSoft: border && bg ? `color-mix(in oklch, ${border} 42%, ${bg})` : border,
      axis: mutedFg,
      axisSoft: mutedFg && bg ? `color-mix(in oklch, ${mutedFg} 58%, ${bg})` : mutedFg,
      tooltipBg: getToken('--popover'),
      border,
    });
  }, [theme]);

  return chartTokens;
}

export type BudgetUtilisationBundle = {
  rows: { h: BudgetHead; pct: number; fill: string }[];
  chartData: { name: string; allocation: number; utilisation: number }[];
};

export function useDashboardReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.creator-dash-reveal',
        { y: 36, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.06, ease: 'power3.out' },
      );
      gsap.fromTo(
        '.creator-dash-chart',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'power2.out', delay: 0.15 },
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);
}

export function AuditPulsePanel({ auditLogs }: { auditLogs: AuditLog[] }) {
  return (
    <div className="creator-dash-reveal fms-dashboard-panel fms-dashboard-chart-board flex flex-col p-6 md:p-7">
      <div>
        <p className="fms-dashboard-section-label mb-1">Transparency</p>
        <h3 className="fms-dashboard-title text-xl text-foreground">Audit pulse</h3>
        <p className="mt-1 text-xs text-muted-foreground">Latest institutional actions</p>
      </div>
      <div className="mt-5 max-h-[380px] space-y-4 overflow-y-auto pr-1.5 [scrollbar-color:color-mix(in_oklch,var(--border)_65%,transparent)_transparent] [scrollbar-width:thin]">
        {auditLogs.slice(0, 8).map((a) => (
          <div key={a.id} className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary ring-1 ring-primary/20">
              {a.user[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-snug text-foreground">
                <span className="font-semibold">{a.user}</span>{' '}
                <span className="text-muted-foreground">{a.action.toLowerCase()}</span>{' '}
                <span className="font-semibold text-primary">{a.target}</span>
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {a.role} · {relativeTime(a.at)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-border/60 pt-4">
        <Link to="/audit" className="text-sm font-medium text-primary hover:underline">
          View all activity →
        </Link>
      </div>
    </div>
  );
}

export function BudgetUtilisationSection({
  chartTokens,
  headingDetail,
  bundle,
}: {
  chartTokens: ChartTokensState;
  headingDetail: string;
  bundle: BudgetUtilisationBundle;
}) {
  return (
    <div className="creator-dash-chart fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
      <p className="fms-dashboard-section-label mb-1">Allocation</p>
      <h3 className="fms-dashboard-title text-xl text-foreground">Budget utilisation</h3>
      <p className="mt-1 text-xs text-muted-foreground mb-6 md:mb-8">{headingDetail}</p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:items-start">
        <div className="min-w-0 space-y-5">
          {bundle.rows.map(({ h, pct, fill }) => {
            const used = h.utilized + h.reserved;
            return (
              <div key={h.id}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-semibold text-foreground">{h.name}</span>
                  <div className="flex flex-wrap items-baseline justify-end gap-x-4 text-xs tabular-nums">
                    <span className="text-muted-foreground">
                      {formatINR(used)} / {formatINR(h.allocated)}
                    </span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted/90 ring-1 ring-border/45">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: fill }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-[280px] min-h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bundle.chartData} margin={{ top: 28, right: 4, left: 0, bottom: 4 }} barGap={5} barCategoryGap="16%">
              <CartesianGrid strokeDasharray="3 3" stroke={chartTokens.gridSoft} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: chartTokens.axisSoft }}
                tickLine={false}
                axisLine={{ stroke: chartTokens.gridSoft }}
                interval={0}
                height={44}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 11, fill: chartTokens.axisSoft }}
                tickLine={{ stroke: chartTokens.gridSoft }}
                axisLine={{ stroke: chartTokens.gridSoft }}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${chartTokens.border}`,
                  background: chartTokens.tooltipBg,
                  fontSize: 12,
                }}
                formatter={(value, name) => [
                  typeof value === 'number' ? `${value}%` : String(value ?? ''),
                  String(name ?? ''),
                ]}
              />
              <Legend
                verticalAlign="top"
                align="center"
                iconType="square"
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingBottom: 10, width: '100%' }}
              />
              <Bar name="Allocation" dataKey="allocation" fill={BUDGET_UTIL_BLUE} radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar name="Utilisation" dataKey="utilisation" fill={BUDGET_UTIL_ORANGE} radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function buildBudgetUtilisationBundle(creatorBudgetUtil: Budget | null): BudgetUtilisationBundle {
  const heads = creatorBudgetUtil?.heads?.length ? creatorBudgetUtil.heads.slice(0, 6) : DEMO_BUDGET_UTIL_HEADS;
  const maxAlloc = Math.max(1, ...heads.map((h) => h.allocated));
  const rows = heads.map((h, index) => {
    const used = h.utilized + h.reserved;
    const pct = h.allocated <= 0 ? 0 : Math.min(100, Math.round((used / h.allocated) * 100));
    return { h, pct, fill: budgetUtilProgressFill(index) };
  });
  const chartData = heads.map((h) => {
    const used = h.utilized + h.reserved;
    const utilisation = h.allocated <= 0 ? 0 : Math.min(100, Math.round((used / h.allocated) * 100));
    const allocation = Math.round((h.allocated / maxAlloc) * 100);
    const short = h.name.length > 14 ? `${h.name.slice(0, 12)}…` : h.name;
    return { name: short, allocation, utilisation };
  });
  return { rows, chartData };
}
