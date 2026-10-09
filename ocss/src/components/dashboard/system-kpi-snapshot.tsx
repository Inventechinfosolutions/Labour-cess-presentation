import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { processingSpeed } from "@/data/dashboard-data"
import { cn } from "@/lib/utils"

export function SystemKpiSnapshot({ className }: { className?: string }) {
  const chartData = processingSpeed.map((d) => ({
    ...d,
    tip: `${d.value} ${d.unit}`,
  }))

  return (
    <section
      aria-labelledby="processing-speed-heading"
      className={cn("dashboard-panel stagger-in flex flex-col p-4 sm:p-6", className)}
    >
      <div className="mb-4">
        <h2
          id="processing-speed-heading"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
        >
          How long each step takes
        </h2>
        <p className="text-sm text-muted-foreground">
          Average number of days from one step to the next
        </p>
      </div>

      <div className="min-h-[200px] flex-1 sm:min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 4, left: 0, bottom: 4 }}>
            <defs>
              {processingSpeed.map((d) => (
                <linearGradient key={d.id} id={`bar-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={d.color} stopOpacity={0.25} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.25)" strokeDasharray="3 3" />
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={42}>
              {processingSpeed.map((d) => (
                <Cell key={d.id} fill={`url(#bar-${d.id})`} />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#93c5fd"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {processingSpeed.map((d) => (
          <li
            key={d.id}
            className="rounded-xl bg-muted/50 px-2.5 py-2 text-center ring-1 ring-border/50"
          >
            <p className="truncate text-[10px] font-medium text-muted-foreground">{d.label}</p>
            <p className="font-display text-sm font-semibold tabular-nums text-foreground">
              {d.value}
              <span className="text-[10px] font-medium text-muted-foreground"> {d.unit}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
