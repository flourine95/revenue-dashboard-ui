"use client"

import { useRef, useState } from "react"
import { BarChart3, Loader2, TrendingDown, TrendingUp } from "lucide-react"
import type { DashboardResponse } from "@/lib/api/types"
import { buildChartRows, type SeriesVisibility } from "@/lib/dashboard-data"
import { formatCurrency, formatDelta, formatNumber } from "@/lib/format"
import { formatRange, isCurrentWeek, type DateRange } from "@/lib/period"
import { cn } from "@/lib/utils"
import { ExportButton } from "./export-button"
import { RevenueChart } from "./revenue-chart"

function Kpi({
  label,
  value,
  previous,
  delta,
  compare,
}: {
  label: string
  value: string
  previous?: string
  delta?: number | null
  compare: boolean
}) {
  const hasComparison = previous !== undefined && delta !== undefined
  const positive = (delta ?? 0) >= 0

  return (
    <div className="rounded-2xl bg-panel px-4 py-4 sm:px-5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {value}
        </p>
        {hasComparison && (
          <p
            aria-hidden={!compare}
            className={cn("text-[11px] sm:text-xs", !compare && "invisible")}
          >
            <span className="text-muted-foreground">vs {previous}</span>{" "}
            {delta !== null && (
              <span className={positive ? "text-positive" : "text-negative"}>
                ({formatDelta(delta)})
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

function SeriesToggle({
  label,
  color,
  checked,
  onChange,
}: {
  label: string
  color: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="group inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-[13px]"
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
          checked
            ? "border-ink bg-ink text-white"
            : "border-black/25 bg-transparent dark:border-white/30"
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        aria-hidden="true"
        className="h-0.5 w-3.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className={cn("whitespace-nowrap", checked && "text-foreground")}>
        {label}
      </span>
    </button>
  )
}

function LegendItem({
  color,
  label,
  dimmed = false,
  icon,
}: {
  color?: string
  label: string
  dimmed?: boolean
  icon?: "positive" | "negative"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap",
        dimmed && "opacity-45"
      )}
    >
      {icon === undefined ? (
        <span
          aria-hidden="true"
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : (
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full",
            icon === "positive"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950"
              : "bg-red-50 text-red-700 dark:bg-red-950"
          )}
        >
          {icon === "positive" ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
        </span>
      )}
      {label}
    </span>
  )
}

export function RevenueCard({
  data,
  compare,
  onCompareChange,
  range,
  pending,
}: {
  data: DashboardResponse
  compare: boolean
  onCompareChange: (compare: boolean) => void
  range: DateRange
  pending: boolean
}) {
  const [visible, setVisible] = useState<SeriesVisibility>({
    pos: true,
    eatclub: true,
    labour: true,
  })
  const cardRef = useRef<HTMLElement>(null)

  const rows = buildChartRows(data)
  const previous = data.comparison?.kpis
  const deltas = data.comparison?.deltas

  function toggle(key: keyof SeriesVisibility) {
    setVisible((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <section
      ref={cardRef}
      className="rounded-[28px] bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)] ring-1 ring-foreground/5 sm:p-7"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 xl:w-[28rem]">
          <h2 className="min-h-[3.25rem] max-w-md text-xl leading-tight font-semibold tracking-tight text-balance sm:min-h-[3.75rem] sm:text-2xl">
            {isCurrentWeek(range)
              ? "This Week's Revenue Trend"
              : "Revenue Trend"}
            <span
              aria-hidden={!compare}
              className={cn("text-muted-foreground", !compare && "invisible")}
            >
              {" "}
              vs Previous Period
            </span>
          </h2>
          <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            {formatRange(range)}
            <span aria-hidden="true">·</span>
            <span>USD</span>
            <span
              aria-hidden={!pending}
              className={cn(
                "inline-flex items-center gap-1 text-foreground/60",
                !pending && "invisible"
              )}
            >
              <Loader2 className="size-3 animate-spin" /> updating
            </span>
          </p>
        </div>

        <div
          data-export-ignore="true"
          className="flex flex-wrap items-center gap-x-4 gap-y-3"
        >
          <SeriesToggle
            label="POS Revenue"
            color="var(--color-pos)"
            checked={visible.pos}
            onChange={() => toggle("pos")}
          />
          <SeriesToggle
            label="Eatclub Revenue"
            color="var(--color-eatclub)"
            checked={visible.eatclub}
            onChange={() => toggle("eatclub")}
          />
          <SeriesToggle
            label="Labour Costs"
            color="var(--color-labour)"
            checked={visible.labour}
            onChange={() => toggle("labour")}
          />

          <button
            type="button"
            aria-pressed={compare}
            onClick={() => onCompareChange(!compare)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-all sm:text-[13px]",
              compare
                ? "bg-ink text-white shadow-sm hover:bg-ink/90"
                : "bg-white text-foreground ring-1 ring-black/10 hover:bg-black/[0.03] dark:bg-transparent dark:ring-white/15"
            )}
          >
            <BarChart3 className="size-3.5" />
            Compare to Previous
          </button>

          <ExportButton
            targetRef={cardRef}
            filename={`revenue-${range.from}-to-${range.to}.png`}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi
          label="Total Revenue"
          value={formatCurrency(data.kpis.totalRevenue)}
          previous={
            previous === undefined
              ? undefined
              : formatCurrency(previous.totalRevenue)
          }
          delta={deltas?.totalRevenue}
          compare={compare}
        />
        <Kpi
          label="Average per Day"
          value={formatCurrency(data.kpis.averagePerDay)}
          previous={
            previous === undefined
              ? undefined
              : formatCurrency(previous.averagePerDay)
          }
          delta={deltas?.averagePerDay}
          compare={compare}
        />
        <Kpi
          label="Total Covers"
          value={formatNumber(data.kpis.totalCovers)}
          previous={
            previous === undefined
              ? undefined
              : formatNumber(previous.totalCovers)
          }
          delta={deltas?.totalCovers}
          compare={compare}
        />
      </div>

      <div
        className={cn(
          "mt-4 transition-opacity duration-200",
          pending && "opacity-55"
        )}
        aria-busy={pending}
      >
        <RevenueChart rows={rows} visible={visible} compare={compare} />
      </div>

      <div className="mt-3 space-y-2 border-t border-foreground/5 pt-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2.5">
          <LegendItem
            color="var(--color-pos)"
            label="POS Revenue (Current)"
            dimmed={!visible.pos}
          />
          <LegendItem
            color="var(--color-eatclub)"
            label="Eatclub Revenue (Current)"
            dimmed={!visible.eatclub}
          />
          <LegendItem
            color="var(--color-labour)"
            label="Labour Costs (Current)"
            dimmed={!visible.labour}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2.5">
          <LegendItem
            color="var(--color-prev-pos)"
            label="Direct Revenue (Previous)"
            dimmed={!compare}
          />
          <LegendItem
            color="var(--color-prev-total)"
            label="Total Revenue (Previous)"
            dimmed={!compare}
          />
          <LegendItem
            color="var(--color-prev-labour)"
            label="Labour Costs (Previous)"
            dimmed={!compare}
          />
          <LegendItem icon="positive" label="Positive Event Impact" />
          <LegendItem icon="negative" label="Negative Event Impact" />
        </div>
      </div>
    </section>
  )
}
