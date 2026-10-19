"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { formatRange, isCurrentWeek, type DateRange } from "@/lib/period"

export function PeriodNav({
  range,
  onShift,
  onToday,
  pending,
}: {
  range: DateRange
  onShift: (weeks: number) => void
  onToday: () => void
  pending: boolean
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-black/10 bg-white/70 py-1 pr-1 pl-1 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <button
        type="button"
        onClick={() => onShift(-1)}
        aria-label="Previous week"
        className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      <span className="min-w-32 px-1 text-center text-xs font-medium tabular-nums sm:min-w-36 sm:text-[13px]">
        {formatRange(range)}
      </span>

      <button
        type="button"
        onClick={() => onShift(1)}
        aria-label="Next week"
        className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      >
        <ChevronRight className="size-3.5" />
      </button>

      {!isCurrentWeek(range) && (
        <button
          type="button"
          onClick={onToday}
          className="ml-0.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-white hover:bg-ink/90"
        >
          This week
        </button>
      )}

      {pending && (
        <Loader2 className="mr-1.5 ml-0.5 size-3.5 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
