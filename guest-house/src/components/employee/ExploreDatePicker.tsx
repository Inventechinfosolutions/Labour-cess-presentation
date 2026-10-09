import { useState } from "react"
import { format, startOfToday } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DateRange,
  type DayButton,
} from "react-day-picker"
import { cn } from "@/lib/utils"

const FLEX_OPTIONS = [
  { id: "exact" as const, label: "Exact dates" },
  { id: 1 as const, label: "± 1 day" },
  { id: 2 as const, label: "± 2 days" },
  { id: 3 as const, label: "± 3 days" },
  { id: 7 as const, label: "± 7 days" },
  { id: 14 as const, label: "± 14 days" },
]

type FlexOption = (typeof FLEX_OPTIONS)[number]["id"]

function AirbnbDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  return (
    <button
      type="button"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "airbnb-day-btn flex size-10 items-center justify-center text-sm font-normal transition-colors",
        modifiers.disabled && "cursor-not-allowed text-muted-foreground/35",
        !modifiers.disabled &&
          !modifiers.selected &&
          "text-foreground hover:rounded-full hover:bg-muted/70",
        modifiers.range_middle &&
          "rounded-none bg-[#f0f0f0] text-foreground hover:rounded-none hover:bg-[#f0f0f0]",
        modifiers.range_start &&
          "rounded-full bg-foreground text-background hover:bg-foreground hover:text-background",
        modifiers.range_end &&
          "rounded-full bg-foreground text-background hover:bg-foreground hover:text-background",
        modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle &&
          "rounded-full bg-foreground text-background",
        className
      )}
      {...props}
    />
  )
}

interface ExploreDatePickerProps {
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
}

export function ExploreDatePicker({ range, onRangeChange }: ExploreDatePickerProps) {
  const [flex, setFlex] = useState<FlexOption>("exact")
  const defaultClassNames = getDefaultClassNames()

  return (
    <div className="airbnb-date-picker w-[min(calc(100vw-2rem),42rem)] overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
      <div className="px-4 pb-2 pt-6 sm:px-6">
        <DayPicker
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            defaultMonth={range?.from ?? new Date(2026, 5, 1)}
            disabled={{ before: startOfToday() }}
            showOutsideDays
            className="airbnb-calendar mx-auto p-0 [--cell-size:2.5rem]"
            formatters={{
              formatWeekdayName: (date) =>
                ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
              formatCaption: (date) => format(date, "MMMM yyyy"),
            }}
            classNames={{
              root: cn("w-full", defaultClassNames.root),
              months: "relative flex w-full flex-col gap-6 sm:flex-row sm:justify-between sm:gap-10",
              month: "flex w-full flex-col gap-3 sm:w-auto",
              month_caption: "mb-1 flex h-10 items-center justify-center",
              caption_label: "text-sm font-semibold text-foreground",
              nav: "absolute inset-x-0 top-0 flex items-center justify-between px-0",
              button_previous: cn(
                "airbnb-cal-nav flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30",
                defaultClassNames.button_previous
              ),
              button_next: cn(
                "airbnb-cal-nav flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30",
                defaultClassNames.button_next
              ),
              weekdays: "flex w-full",
              weekday:
                "flex-1 text-center text-xs font-medium text-muted-foreground/80 select-none",
              week: "mt-1 flex w-full",
              day: "p-0 text-center",
              outside: "text-muted-foreground/30",
              disabled: "text-muted-foreground/30",
              range_start: "rounded-l-full",
              range_end: "rounded-r-full",
              range_middle: "rounded-none",
            }}
            components={{
              Chevron: ({ orientation, className }) =>
                orientation === "left" ? (
                  <ChevronLeft className={cn("size-4", className)} />
                ) : (
                  <ChevronRight className={cn("size-4", className)} />
                ),
              DayButton: AirbnbDayButton,
            }}
          />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-4 py-4 sm:px-6">
        {FLEX_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFlex(option.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              flex === option.id
                ? "border-foreground bg-white text-foreground shadow-sm"
                : "border-border/80 bg-transparent text-foreground hover:border-foreground/40"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
