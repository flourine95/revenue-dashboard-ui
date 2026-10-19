"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
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
        className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none dark:hover:bg-white/10"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      <span className="w-36 px-1 text-center text-xs font-medium tabular-nums sm:w-40 sm:text-[13px]">
        {formatRange(range)}
      </span>

      <button
        type="button"
        onClick={() => onShift(1)}
        aria-label="Next week"
        className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none dark:hover:bg-white/10"
      >
        <ChevronRight className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={onToday}
        disabled={isCurrentWeek(range)}
        className="ml-0.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35"
      >
        This week
      </button>

      <Loader2
        aria-hidden={!pending}
        className={cn(
          "mr-1.5 ml-0.5 size-3.5 animate-spin text-muted-foreground",
          !pending && "invisible"
        )}
      />
    </div>
  )
}
