import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useApp } from '@/store/AppStore';
import { useTheme } from '@/components/theme/ThemeProvider';
import { formatINR } from '@/lib/format';
import { chartPalette, getToken } from '@/lib/chartColors';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Pie,
  PieChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ListPagePrimaryKpiCard, ListPageSecondaryKpiCard } from '@/components/shared/ListPageKpi';
import { Banknote, CheckCircle2, Clock, Download, Layers } from 'lucide-react';

export function ReportsPage() {
  const { bills, budgets } = useApp();
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rep-block, .list-dash-reveal',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power3.out' },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const [tk, setTk] = useState({ palette: [] as string[], grid: '', axis: '', popover: '', border: '', primary: '', chart2: '', chart3: '' });
  useEffect(() => {
    setTk({
      palette: chartPalette(5),
      grid: getToken('--border'),
      axis: getToken('--muted-foreground'),
      popover: getToken('--popover'),
      border: getToken('--border'),
      primary: getToken('--primary'),
      chart2: getToken('--chart-2'),
      chart3: getToken('--chart-3'),
    });
  }, [theme]);

  const monthSeries = useMemo(() => {
    const buckets = new Map<string, { month: string; created: number; paid: number; amount: number }>();
    const fmt = (d: Date) => d.toLocaleString('en-US', { month: 'short' });
    bills.forEach((b) => {
      const m = fmt(new Date(b.createdAt));
      const cur = buckets.get(m) ?? { month: m, created: 0, paid: 0, amount: 0 };
      cur.created += 1;
      if (b.status === 'Paid') {
        cur.paid += 1;
        cur.amount += b.amount;
      }
      buckets.set(m, cur);
    });
    return Array.from(buckets.values());
  }, [bills]);

  const byDept = useMemo(() => {
    const map = new Map<string, number>();
    bills.forEach((b) => map.set(b.department, (map.get(b.department) ?? 0) + b.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [bills]);

  const byBillType = useMemo(() => {
    const map = new Map<string, number>();
    bills.forEach((b) => map.set(b.billType, (map.get(b.billType) ?? 0) + b.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [bills]);

  const totalBilled = bills.reduce((a, b) => a + b.amount, 0);
  const totalPaid = bills.filter((b) => b.status === 'Paid').reduce((a, b) => a + b.amount, 0);

  const tooltipStyle = { borderRadius: 12, border: `1px solid ${tk.border}`, background: tk.popover };
  const axisTick = { fontSize: 11, fill: tk.axis };

  return (
    <div ref={ref} className="p-6 max-w-[1400px] mx-auto w-full space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Insights across receipts, payments, budgets and departments.</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-1.5" /> Export PDF
        </Button>
      </div>

      {/* KPI strip — same components & layout as Tasks */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <ListPagePrimaryKpiCard
          label="Total billed"
          value={formatINR(totalBilled)}
          sub="Gross value across bills"
          icon={<Banknote className="size-[18px] text-primary-foreground sm:size-5" strokeWidth={2} aria-hidden />}
        />
        <ListPageSecondaryKpiCard
          delayMs={40}
          label="Total paid"
          value={formatINR(totalPaid)}
          sub="Settled disbursements"
          icon={<CheckCircle2 className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="emerald"
        />
        <ListPageSecondaryKpiCard
          delayMs={80}
          label="Pending"
          value={formatINR(totalBilled - totalPaid)}
          sub="Outstanding balance"
          icon={<Clock className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="amber"
        />
        <ListPageSecondaryKpiCard
          delayMs={120}
          label="Bill count"
          value={bills.length}
          sub="Records in workspace"
          icon={<Layers className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />}
          tone="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rep-block rounded-2xl bg-card border border-border p-5">
          <h3 className="font-semibold">Bills Created vs Paid (by month)</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Trend across the current fiscal window.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthSeries}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tk.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={tk.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tk.chart2} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={tk.chart2} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={tk.grid} />
                <XAxis dataKey="month" tick={axisTick} />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area dataKey="created" stroke={tk.primary} fill="url(#ga)" />
                <Area dataKey="paid" stroke={tk.chart2} fill="url(#gb)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rep-block rounded-2xl bg-card border border-border p-5">
          <h3 className="font-semibold">Disbursement by Department</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Top departments by total billed amount.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept}>
                <CartesianGrid strokeDasharray="3 3" stroke={tk.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: tk.axis }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={axisTick} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatINR(Number(v))} contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {byDept.map((_, i) => <Cell key={i} fill={tk.palette[i % tk.palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rep-block rounded-2xl bg-card border border-border p-5">
          <h3 className="font-semibold">Spend by Bill Type</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">How spend is distributed across categories.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byBillType} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {byBillType.map((_, i) => <Cell key={i} fill={tk.palette[i % tk.palette.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatINR(Number(v))} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rep-block rounded-2xl bg-card border border-border p-5">
          <h3 className="font-semibold">Budget Utilisation</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">Allocated vs utilised by budget head.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(budgets[0]?.heads ?? []).map((h) => ({ name: h.name, allocated: h.allocated, used: h.utilized + h.reserved }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={tk.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: tk.axis }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={axisTick} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatINR(Number(v))} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line dataKey="allocated" stroke={tk.primary} strokeWidth={2} dot={{ r: 4 }} />
                <Line dataKey="used" stroke={tk.chart3} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
