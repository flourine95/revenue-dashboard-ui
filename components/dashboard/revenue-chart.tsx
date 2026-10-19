"use client"

import { useMemo } from "react"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  useXAxisScale,
  useYAxisScale,
} from "recharts"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { ChartRow, SeriesVisibility } from "@/lib/dashboard-data"
import { formatAxisTick, formatCurrency, formatDayLabel } from "@/lib/format"

const STEP_CANDIDATES = [
  250, 500, 750, 1000, 1500, 2000, 2500, 5000, 10000, 25000, 50000, 100000,
]

type ChartScale = { max: number; step: number; ticks: number[] }

function buildScale(rows: ChartRow[]): ChartScale {
  const peak = rows.reduce(
    (max, row) =>
      Math.max(max, row.total, row.labour, row.prevTotal, row.prevLabour),
    0
  )
  const target = Math.max(peak * 1.14, 1000)
  const step =
    STEP_CANDIDATES.find((candidate) => target / candidate <= 5) ??
    STEP_CANDIDATES[STEP_CANDIDATES.length - 1]
  const max = Math.ceil(target / step) * step
  const ticks = Array.from(
    { length: Math.round(max / step) + 1 },
    (_, i) => i * step
  )

  return { max, step, ticks }
}

function markerValue(row: ChartRow, scale: ChartScale): number {
  const tallest = Math.max(row.total, row.labour, row.prevTotal)
  return Math.min(
    scale.max - scale.step * 0.35,
    tallest * 1.03 + scale.step * 0.1
  )
}

/** Event badges pinned above the bar of their day, inside the chart SVG. */
function EventMarkers({
  rows,
  scale,
}: {
  rows: ChartRow[]
  scale: ChartScale
}) {
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  if (xScale === undefined || yScale === undefined) return null

  return (
    <g>
      {rows.map((row) => {
        if (row.event === null) return null
        const x = xScale(row.date, { position: "middle" })
        const y = yScale(markerValue(row, scale))
        if (x === undefined || y === undefined) return null

        const positive = row.event.type === "positive"
        const accent = positive
          ? "var(--color-positive)"
          : "var(--color-negative)"
        const ring = positive ? "#bfe8cc" : "#f2c2c2"
        const fill = positive ? "#f0faf3" : "#fdf1f1"

        return (
          <g key={row.event.id} transform={`translate(${x} ${y})`}>
            <title>{`${row.event.title} (${row.event.type} event)`}</title>
            <circle r={12} fill={fill} stroke={ring} strokeWidth={1.25} />
            {positive ? (
              <g
                fill="none"
                stroke={accent}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M-4.5 1.5 L-1.5 -1.5 L0.5 0.5 L4.5 -3.5" />
                <path d="M1.5 -3.5 H4.5 V-0.5" />
              </g>
            ) : (
              <g
                fill="none"
                stroke={accent}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M-4.5 -1.5 L-1.5 1.5 L0.5 -0.5 L4.5 3.5" />
                <path d="M1.5 3.5 H4.5 V0.5" />
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}

type TooltipItem = {
  dataKey?: string | number
  value?: number | string
  name?: string
  color?: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: string | number
}) {
  if (active !== true || payload === undefined || payload.length === 0)
    return null

  const date =
    typeof label === "string"
      ? new Date(`${label}T00:00:00`).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : String(label ?? "")

  return (
    <div className="min-w-44 rounded-xl border border-black/10 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm dark:bg-neutral-900/95">
      <p className="mb-1.5 text-xs font-medium text-foreground">{date}</p>
      <ul className="space-y-1">
        {payload.map((item) => (
          <li
            key={String(item.dataKey ?? item.name)}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-medium tabular-nums">
              {formatCurrency(Number(item.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const squareTop: [number, number, number, number] = [0, 0, 0, 0]
const roundedTop: [number, number, number, number] = [5, 5, 0, 0]

export function RevenueChart({
  rows,
  visible,
  compare,
  label,
  summary,
}: {
  rows: ChartRow[]
  visible: SeriesVisibility
  compare: boolean
  label: string
  summary: string
}) {
  const scale = useMemo(() => buildScale(rows), [rows])
  const reduceMotion = useReducedMotion()

  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="-mx-2 overflow-x-auto rounded-lg px-2 pb-1 focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:outline-none"
    >
      <p className="sr-only">{summary}</p>
      <div className="h-[320px] min-w-[720px] sm:h-[380px] sm:min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 34, right: 8, bottom: 4, left: 0 }}
            barCategoryGap="18%"
            barGap={2}
          >
            <CartesianGrid
              vertical={false}
              stroke="currentColor"
              strokeOpacity={0.07}
              strokeDasharray="4 6"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
            />
            <YAxis
              domain={[0, scale.max]}
              ticks={scale.ticks}
              tickFormatter={formatAxisTick}
              axisLine={false}
              tickLine={false}
              width={48}
              tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
            />

            {compare && (
              <>
                <Bar
                  dataKey="prevPos"
                  name="Direct Revenue (previous)"
                  fill="var(--color-prev-pos)"
                  barSize={13}
                  radius={roundedTop}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="prevTotal"
                  name="Total Revenue (previous)"
                  fill="var(--color-prev-total)"
                  barSize={13}
                  radius={roundedTop}
                  isAnimationActive={false}
                />
              </>
            )}

            {visible.pos && (
              <Bar
                dataKey="pos"
                name="POS Revenue"
                stackId="current"
                fill="var(--color-pos)"
                barSize={32}
                radius={visible.eatclub ? squareTop : roundedTop}
                isAnimationActive={!reduceMotion}
              />
            )}
            {visible.eatclub && (
              <Bar
                dataKey="eatclub"
                name="Eatclub Revenue"
                stackId="current"
                fill="var(--color-eatclub)"
                barSize={32}
                radius={roundedTop}
                isAnimationActive={!reduceMotion}
              />
            )}
            {visible.labour && (
              <Bar
                dataKey="labour"
                name="Labour Costs"
                fill="var(--color-labour)"
                barSize={18}
                radius={roundedTop}
                isAnimationActive={!reduceMotion}
              />
            )}

            <EventMarkers rows={rows} scale={scale} />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
